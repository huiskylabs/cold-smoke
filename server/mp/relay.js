// 一起滑 relay: the other skiers on the mountain. A WebSocket server with no dependencies (plain Node 18+), run behind the site's own TLS
// proxy (nginx / caddy: wss://<host>/ski -> http://127.0.0.1:<port>/ski).
//   node server/mp/relay.js [port=8787]
// It knows nothing of skiing. It puts each player in a room (a room = one mountain: its seed) and passes on what each one says about
// where they are and how they stand (a small binary frame, ~12 a second) to everyone else in the room, with the sender's number in front.
//   GET /ski?room=pub&seed=<n>&name=<s>&col=<0..15>   public: the first room of that mountain with room in it (ROOM_MAX people)
//   GET /ski?room=<code>&seed=<n>&...                 a friends' room: whoever comes with the same code; the first one's seed is the room's
//   GET /health                                       how many rooms and people, as JSON
//   GET /stats                                        each day's most real people (robots not counted) on at once, as a page
//   GET /stats.json                                   the same, as JSON (STATS_KEY set: both want ?key=<it>)
//   GET /                                             the game (play/index.html beside this file), pointed at this relay: a test link
// Text frames from the server (JSON): {t:'hi', id, room, seed, peers:[{id,name,col}]} to the one who came, {t:'join', id, name, col} and
// {t:'bye', id} to the others. Binary from the server: [id u8][the sender's frame as it was]. Nothing a player says is stored; the one
// thing kept is a count per day (owner 2026-11-26: "记录每天最高真人在线数"): see STATS below.
'use strict';
const http = require('http'), crypto = require('crypto');
const LAG = +(process.env.LAG_MS || 0);          // (tests: hold every frame this long before passing it on, as a far-away player's would be)
const PORT = +(process.argv[2] || process.env.PORT || 8787), ROOM_MAX = +(process.env.ROOM_MAX || 16), FRAME_MAX = 1024, RATE_MAX = 40;
const CONN_MAX = +(process.env.CONN_MAX || 400), PER_IP = +(process.env.PER_IP || 16), perIp = new Map();
const perIpTotal = () => { let n = 0; for (const v of perIp.values()) n += v; return n; };
const rooms = new Map();          // key -> { key, seed, members: Map<id, client> }
let served = 0;

// ---- STATS: for each day, the most real people on at once (robots, ?bot=1 from tools/mp-bots.js, are not counted), when that was, and how
// many times a real person came. Kept in STATS_FILE (a JSON file, written a moment after it changes) so a restart does not lose it.
// A day is a day in STATS_TZ (default Asia/Shanghai: the players' day).
const fs = require('fs'), path = require('path');
const STATS_FILE = process.env.STATS_FILE || path.join(__dirname, 'stats', 'daily.json'), STATS_TZ = process.env.STATS_TZ || 'Asia/Shanghai';
const STATS_KEY = process.env.STATS_KEY || '';
const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: STATS_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: STATS_TZ, hour: '2-digit', minute: '2-digit', hour12: false });
const dayOf = t => dayFmt.format(new Date(t));
let stats = {}; try { stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')).days || {}; } catch (e) { }
let statsTimer = null;
function saveStats() {
  if (statsTimer) return;
  statsTimer = setTimeout(() => {
    statsTimer = null;
    try { fs.mkdirSync(path.dirname(STATS_FILE), { recursive: true }); const tmp = STATS_FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify({ tz: STATS_TZ, days: stats }, null, 1)); fs.renameSync(tmp, STATS_FILE); }
    catch (e) { console.log('stats: cannot write ' + STATS_FILE + ': ' + e.message); }
  }, 2000);
}
function humansNow() { let n = 0; for (const r of rooms.values()) for (const c of r.members.values()) if (!c.bot) n++; return n; }
// (called whenever someone comes or goes, and once a minute so a new day starts with whoever is already on)
function countHumans(came) {
  const t = Date.now(), d = dayOf(t), n = humansNow(); let e = stats[d], ch = false;
  if (!e) { e = stats[d] = { peak: 0, at: '', visits: 0 }; ch = true; }
  if (came) { e.visits++; ch = true; }
  if (n > e.peak) { e.peak = n; e.at = timeFmt.format(new Date(t)); ch = true; }
  if (ch) saveStats();
}
function statsRows() { return Object.keys(stats).sort().reverse().map(d => ({ day: d, peak: stats[d].peak, at: stats[d].at, visits: stats[d].visits })); }
function statsPage() {
  const rows = statsRows(), max = Math.max(1, ...rows.map(r => r.peak)), esc = s => String(s).replace(/[<>&]/g, '');
  const tr = rows.map(r => '<tr><td>' + esc(r.day) + '</td><td class=n>' + r.peak + '</td><td><span class=b style="width:' + (r.peak / max * 100).toFixed(1) + '%"></span></td><td>' + esc(r.at) + '</td><td class=n>' + r.visits + '</td></tr>').join('');
  return '<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>一起滑 每日在线</title>' +
    '<style>body{font:15px/1.5 system-ui,sans-serif;margin:24px 16px;color:#111;background:#fff}h1{font-size:20px;margin:0 0 4px}p{color:#666;margin:0 0 16px}' +
    'table{border-collapse:collapse;width:100%;max-width:640px}td,th{padding:6px 8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap}th{font-weight:600;color:#666;font-size:13px}' +
    '.n{text-align:right;font-variant-numeric:tabular-nums}td:nth-child(3){width:40%}.b{display:block;height:10px;background:#d33;border-radius:2px;min-width:1px}' +
    '@media(prefers-color-scheme:dark){body{background:#111;color:#eee}td,th{border-color:#333}}</style>' +
    '<h1>一起滑 每日最高真人在线</h1><p>现在在线：' + humansNow() + ' 人（不算机器人）。按 ' + esc(STATS_TZ) + ' 的日子算。</p>' +
    '<table><tr><th>日期</th><th class=n>最高同时在线</th><th></th><th>出现时间</th><th class=n>进来次数</th></tr>' + (tr || '<tr><td colspan=5>还没有记录</td></tr>') + '</table>';
}
setInterval(() => countHumans(false), 60000).unref();

function frame(op, payload) {
  const n = payload.length, h = n < 126 ? Buffer.from([0x80 | op, n]) : n < 65536 ? Buffer.from([0x80 | op, 126, n >> 8, n & 255]) : null;
  if (!h) throw new Error('frame too long');
  return Buffer.concat([h, payload]);
}
function send(c, op, data) { if (LAG) { setTimeout(() => send0(c, op, data), LAG); return; } send0(c, op, data); }
function send0(c, op, data) { if (c.open && !c.sock.destroyed) { try { c.sock.write(frame(op, data)); } catch (e) { } } }
const sendJSON = (c, o) => send(c, 1, Buffer.from(JSON.stringify(o)));

function pickRoom(want, seed) {
  if (want === 'pub') {
    // (everyone who skis in public meets on one mountain: the one people are already on, whatever day the newcomer's own clock says.
    // The page asks for its own today's mountain, which differs across midnight and time zones, and the robots stayed a day behind:
    // owner 2026-11-24 18:04 UTC "没看到机器人啊". The page goes to the mountain it is told in hi)
    let best = null; for (const r of rooms.values()) if (r.key.startsWith('pub:') && r.members.size && (!best || r.members.size > best.members.size)) best = r;
    if (best) seed = best.seed;
    for (let k = 1; ; k++) { const key = 'pub:' + seed + ':' + k, r = rooms.get(key); if (!r || r.members.size < ROOM_MAX) return r || makeRoom(key, seed); }
  }
  const key = 'p:' + want, r = rooms.get(key);
  if (r) return r.members.size < ROOM_MAX ? r : null;
  return makeRoom(key, seed);
}
function makeRoom(key, seed) { const r = { key, seed, members: new Map() }; rooms.set(key, r); return r; }
function freeId(r) { for (let i = 1; i < 255; i++) if (!r.members.has(i)) return i; return 0; }

function leave(c) {
  if (!c.room) return; const r = c.room; c.room = null; c.open = false;
  if (r.members.get(c.id) === c) r.members.delete(c.id);
  for (const o of r.members.values()) sendJSON(o, { t: 'bye', id: c.id });
  if (!r.members.size) rooms.delete(r.key);
  if (!c.bot) countHumans(false);
}

function onMessage(c, op, data) {
  if (op === 8) { try { c.sock.write(frame(8, Buffer.alloc(0))); } catch (e) { } c.sock.end(); return; }
  if (op === 9) { send(c, 10, data); return; }
  if (op === 10) return;
  const now = Date.now(); if (now - c.rt > 1000) { c.rt = now; c.rn = 0; } if (++c.rn > RATE_MAX) return;      // (more than RATE_MAX a second: dropped)
  if (op === 2 && c.room && data.length <= FRAME_MAX) {
    const out = frame(2, Buffer.concat([Buffer.from([c.id]), data]));
    const fwd = () => { if (!c.room) return; for (const o of c.room.members.values()) if (o !== c && o.open) { try { o.sock.write(out); } catch (e) { } } };
    if (LAG) setTimeout(fwd, LAG); else fwd();
  } else if (op === 1 && c.room && data.length <= 256) {
    // (a few words between players: only the kinds the game knows, passed on as they are)
    let m = null; try { m = JSON.parse(data.toString('utf8')); } catch (e) { return; }
    if (!m || typeof m.t !== 'string' || !/^(bump|wave|go)$/.test(m.t)) return;
    m.id = c.id; const s = Buffer.from(JSON.stringify(m)); for (const o of c.room.members.values()) if (o !== c) send(o, 1, s);
  }
}

// the frames of one connection: the client's are masked; a frame in pieces (FIN 0) is not expected from a browser here and is dropped
function reader(c) {
  let buf = Buffer.alloc(0);
  return chunk => {
    buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
    for (;;) {
      if (buf.length < 2) return; const b0 = buf[0], b1 = buf[1], op = b0 & 15, masked = b1 & 128; let n = b1 & 127, off = 2;
      if (n === 126) { if (buf.length < 4) return; n = buf.readUInt16BE(2); off = 4; } else if (n === 127) { c.sock.destroy(); return; }
      if (n > FRAME_MAX * 4) { c.sock.destroy(); return; }
      if (!masked) { c.sock.destroy(); return; }
      if (buf.length < off + 4 + n) return;
      const mask = buf.subarray(off, off + 4), data = Buffer.from(buf.subarray(off + 4, off + 4 + n)); for (let i = 0; i < n; i++) data[i] ^= mask[i & 3];
      buf = buf.subarray(off + 4 + n);
      if (b0 & 128) onMessage(c, op, data);
    }
  };
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  // (a test page of its own, away from the site: GET / serves play/index.html from beside this file, if it is there, told to use this
  // same host for 一起滑)
  if (u.pathname === '/' || u.pathname === '/index.html') {
    let html = null; try { html = require('fs').readFileSync(require('path').join(__dirname, 'play', 'index.html'), 'utf8'); } catch (e) { }
    if (html) {
      const inj = '<script>self.COLD_SMOKE=Object.assign(self.COLD_SMOKE||{},{lang:"zh",mp:(location.protocol==="https:"?"wss://":"ws://")+location.host+"/ski"})</script>';
      html = html.includes('<head>') ? html.replace('<head>', () => '<head>' + inj) : inj + html;
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' }); res.end(html); return;
    }
  }
  if (u.pathname.endsWith('/stats') || u.pathname.endsWith('/stats.json')) {
    if (STATS_KEY && u.searchParams.get('key') !== STATS_KEY) { res.writeHead(403); res.end(); return; }
    if (u.pathname.endsWith('.json')) { res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-cache' }); res.end(JSON.stringify({ tz: STATS_TZ, now: humansNow(), days: statsRows() })); return; }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' }); res.end(statsPage()); return;
  }
  if (u.pathname.endsWith('/health')) {
    let people = 0; for (const r of rooms.values()) people += r.members.size;
    res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); res.end(JSON.stringify({ ok: true, rooms: rooms.size, people, humans: humansNow(), served })); return;
  }
  res.writeHead(404); res.end();
});
server.on('upgrade', (req, sock) => {
  const u = new URL(req.url, 'http://x'), key = req.headers['sec-websocket-key'];
  if (!u.pathname.endsWith('/ski') || !key || (req.headers.upgrade || '').toLowerCase() !== 'websocket') { sock.destroy(); return; }
  // (at most CONN_MAX open at once, and PER_IP from one address (Cloudflare names it): a flood of connections cannot take the box down)
  const ip = String(req.headers['cf-connecting-ip'] || sock.remoteAddress || ''); if (perIpTotal() >= CONN_MAX || (perIp.get(ip) || 0) >= PER_IP) { sock.destroy(); return; }
  perIp.set(ip, (perIp.get(ip) || 0) + 1); sock.once('close', () => { const n = (perIp.get(ip) || 1) - 1; if (n > 0) perIp.set(ip, n); else perIp.delete(ip); });
  const want = (u.searchParams.get('room') || 'pub').replace(/[^\w-]/g, '').slice(0, 16) || 'pub', seed = Math.max(1, Math.min(999999999, Math.floor(+u.searchParams.get('seed') || 1)));
  const name = (u.searchParams.get('name') || '').replace(/[<>&"'\\\u0000-\u001f]/g, '').slice(0, 12) || '雪友', col = Math.max(0, Math.min(15, Math.floor(+u.searchParams.get('col') || 0)));
  const room = pickRoom(want, seed);
  const acc = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
  sock.setNoDelay(true);
  const c = { sock, id: 0, name, col, bot: u.searchParams.get('bot') === '1' ? 1 : 0, room: null, open: true, rt: 0, rn: 0, seen: Date.now() };
  if (!room || !(c.id = freeId(room))) { sendJSON(c, { t: 'full' }); sock.end(); return; }
  c.room = room; served++;
  sendJSON(c, { t: 'hi', id: c.id, room: room.key.startsWith('pub:') ? 'pub' : want, seed: room.seed, max: ROOM_MAX, peers: [...room.members.values()].map(o => ({ id: o.id, name: o.name, col: o.col, b: o.bot })) });
  for (const o of room.members.values()) sendJSON(o, { t: 'join', id: c.id, name, col, b: c.bot });
  room.members.set(c.id, c);
  if (!c.bot) countHumans(true);
  const rd = reader(c); sock.on('data', d => { c.seen = Date.now(); rd(d); });
  sock.on('close', () => leave(c)); sock.on('error', () => leave(c)); sock.on('end', () => leave(c));
});
// a connection that has said nothing for 20 s is gone (a phone put to sleep without closing)
setInterval(() => { const t = Date.now(); for (const r of rooms.values()) for (const c of r.members.values()) if (t - c.seen > 20000) { c.sock.destroy(); leave(c); } }, 5000).unref();
server.listen(PORT, () => console.log('一起滑 relay on :' + PORT + ' (room max ' + ROOM_MAX + ')'));
