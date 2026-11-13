// ---------------------------------------------------------------- the leaderboards, inside 小红书 only
// The 小红书 小工具 container offers public boards (submitScore / getRankList / getMyRank, client 9.51+, still in 内测; see the official
// skill's references/js-api.md, 「排行榜（内测）」). Five board slots are allowed; the platform splits every submission into day / week /
// month / all-time (Beijing midnight, weeks from Monday) and keeps each player's BEST in each. Three things are ranked:
//   极速      board 1   top speed of a run, km/h to a tenth                       (best: what the platform keeps anyway)
//   最远飞行  board 2   the longest flight of a run, m to a tenth (from JUMP_T in the air, as on the splits)
//   滑雪时长  boards 3, 4, 5   minutes skied today / this week / in all. A total is not a best, so each period has its own board, fed its
//             own running total (today's minutes to 3, the week's to 4, all of them to 5); the latest total is always the best, so the
//             platform's 'keep the best' does the right thing. Totals live in the container's storage (setStorage, client 9.46+) and are
//             raised to what the platform already holds for this player, so a new phone or cleared storage never counts down.
// Outside the container (the web build, a browser) nothing here does anything and the menu has no 排行榜 at all.
// Calls are few: a figure goes up only when it beats what was already sent for its period, at most once every 30 s (and when the page is
// put away, the board is opened, or a day card comes); minutes are whole. Lists are cached for 45 s. The platform's own limit is 150 calls
// a second for the whole tool.
const Rank = self.Rank = (() => {
  const R = { on: false };
  const T = s => I18N.t(s), EN = () => I18N.en();
  const mins = v => { v = Math.round(v); if (v < 60) return v + (EN() ? ' min' : ' 分钟'); const h = Math.floor(v / 60), m = v % 60; return EN() ? h + ' h ' + m + ' min' : h + ' 小时 ' + m + ' 分'; };
  // what is shown: a chip each; which board holds it for each period
  const VIEWS = [
    { id: 'v', name: '极速', boards: { day: 1, week: 1, all: 1 }, fmt: v => v.toFixed(1) + ' km/h' },
    { id: 'air', name: '最远飞行', boards: { day: 2, week: 2, all: 2 }, fmt: v => v.toFixed(1) + ' m' },
    { id: 'time', name: '滑雪时长', boards: { day: 3, week: 4, all: 5 }, fmt: mins },
  ];
  const PERIODS = [['day', '今日'], ['week', '本周'], ['all', '总榜']];
  const FLUSH_EVERY = 30000, CACHE = 45000, KEY = 'coldsmoke.playtime';
  let mt = null, el = null, view = 'v', period = 'day', lastFlush = 0, cool = 0, flushing = null, sig = 0, saved = 0, last = '';
  const sent = {}, pend = {}, cache = {};

  const api = () => { try { const m = window.xhs && window.xhs.miniTool; return m && typeof m.submitScore === 'function' && typeof m.getRankList === 'function' && typeof m.getMyRank === 'function' ? m : null; } catch (e) { return null; } };
  // the day and the week as the platform counts them: Beijing time, weeks from Monday (day 0 of the count was a Thursday)
  const bjDay = () => Math.floor((Date.now() + 8 * 3600e3) / 86400e3);
  const bjWeek = () => Math.floor((bjDay() + 3) / 7);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const code = e => (e && typeof e.errCode === 'number') ? e.errCode : (e && +e.errCode) || 0;
  // no boards for this tool (not authorised at upload, or not let into the 内测): the entry goes away for the rest of the page
  function off(e) { R.on = false; console.warn('rank off', e && e.errMsg, code(e)); if (el) { el.nav.hidden = true; if (el.sec.classList.contains('on')) el.sec.textContent = ''; } }
  const fatal = c => c === 1005 || c === 10003;

  // ---- time skied: seconds today, this week, in all (P.d / P.w: which day and week the first two are of)
  const P = { d: 0, ds: 0, w: 0, ws: 0, as: 0 };
  function roll() { const d = bjDay(), w = bjWeek(); if (P.d !== d) { P.d = d; P.ds = 0; } if (P.w !== w) { P.w = w; P.ws = 0; } }
  function merge(o) {          // (what storage or the platform says is added in as a floor, never counted twice)
    if (!o) return; roll();
    if (o.d === P.d && o.ds > P.ds) P.ds = o.ds; if (o.w === P.w && o.ws > P.ws) P.ws = o.ws; if (o.as > P.as) P.as = o.as;
    if (P.ws < P.ds) P.ws = P.ds; if (P.as < P.ws) P.as = P.ws;
  }
  async function load() {
    let txt = null;
    try { if (typeof mt.getStorage === 'function') { const r = await mt.getStorage({ key: KEY }); txt = r && r.data; } } catch (e) { }
    if (txt == null) try { txt = localStorage.getItem(KEY); } catch (e) { }
    try { if (txt) merge(JSON.parse(txt)); } catch (e) { }
    // what the platform already holds for this player (another phone, storage cleared): a floor for the totals
    try {
      const [d, w, a] = await Promise.all([['day', 3], ['week', 4], ['all', 5]].map(([p, b]) => mt.getMyRank({ board: b, period: p }).catch(() => null)));
      const sc = r => r && r.status === 'EXACT' && r.score != null ? +r.score * 60 : 0;
      merge({ d: P.d, ds: sc(d), w: P.w, ws: sc(w), as: sc(a) });
    } catch (e) { }
  }
  function save() {
    const txt = JSON.stringify(P); saved = Date.now(); if (txt === last) return; last = txt;
    try { if (typeof mt.setStorage === 'function') { mt.setStorage({ key: KEY, data: txt }).catch(() => { try { localStorage.setItem(KEY, txt); } catch (e) { } }); return; } } catch (e) { }
    try { localStorage.setItem(KEY, txt); } catch (e) { }
  }

  R.init = function () {
    mt = api(); if (!mt) return;
    const menu = document.getElementById('menu'); if (!menu) return;
    el = { nav: menu.querySelector('nav [data-sec="rank"]'), sec: menu.querySelector('section[data-sec="rank"]'), day: document.getElementById('day-r') };
    if (!el.nav || !el.sec) { el = null; return; }
    R.on = true; roll(); load();
    el.nav.hidden = false;
    el.sec.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.rv) { view = b.dataset.rv; render(); } else if (b.dataset.rp) { period = b.dataset.rp; render(); }
    });
    if (typeof App !== 'undefined' && App.onTick) App.onTick.push(tick);
    document.addEventListener('visibilitychange', () => { if (document.hidden && R.on) { save(); R.flush(); } });
    I18N.on(() => { if (el.sec.classList.contains('on')) render(); });
  };

  // ---- every step: the clock of time skied runs while a run is on; whatever beats what its period was last sent waits to go up
  function want(id, v, per) {
    if (!(v > 0) || !isFinite(v)) return;
    const s = sent[id]; if (s && s.per === per && v <= s.v) return;
    const p = pend[id]; if (!p || p.per !== per || v > p.v) pend[id] = { per, v };
  }
  function tick(dt) {
    if (!R.on) return;
    roll();
    const live = typeof Game !== 'undefined' && Game.mode === 'run' && !document.hidden;
    if (live && dt > 0) { const k = Math.min(dt, 0.25); P.ds += k; P.ws += k; P.as += k; }
    const sp = typeof UI !== 'undefined' && UI.sp, run = sp && sp.run, d = P.d;
    if (run) {
      const v = Math.round(run.v * 36) / 10, a = Math.round(run.air * 10) / 10;
      if (v <= 400) want(1, v, d); if (a <= 600) want(2, a, d);
    }
    want(3, Math.floor(P.ds / 60), d); want(4, Math.floor(P.ws / 60), P.w); want(5, Math.min(999999, Math.floor(P.as / 60)), 0);
    if (Date.now() - saved > FLUSH_EVERY) save();
    if (Object.keys(pend).length && Date.now() - lastFlush > FLUSH_EVERY && Date.now() > cool) R.flush();
  }
  // send what waits (one board at a time; a failure leaves it waiting, except the ones that will never go)
  R.flush = function () {
    if (!R.on || flushing) return flushing || Promise.resolve();
    lastFlush = Date.now();
    flushing = (async () => {
      for (const id of Object.keys(pend)) {
        const p = pend[id]; if (!p) continue;
        try {
          await mt.submitScore({ board: +id, score: p.v });
          const s = sent[id]; if (!s || s.per !== p.per || p.v > s.v) sent[id] = { per: p.per, v: p.v };
          if (pend[id] === p) delete pend[id];
          for (const k of Object.keys(cache)) if (k.indexOf(id + ':') === 0) delete cache[k];
        } catch (e) {
          const c = code(e);
          if (fatal(c)) { off(e); break; }
          if (c === 1001 || c === 1004 || c === 10001) { delete pend[id]; continue; }          // (a figure the platform will never take)
          if (c === 2009) cool = Date.now() + 60000;
          break;
        }
      }
    })().catch(e => console.warn(e)).then(() => { flushing = null; });
    return flushing;
  };

  // ---- reading a board: 2002 means it is not ready yet (never an empty board); a few tries with backoff, then say so
  async function call(fn, args) {
    for (const wait of [500, 1000, 2000, 4000, -1]) {
      try { return await fn.call(mt, args); }
      catch (e) { const c = code(e); if (c !== 2002 || wait < 0) throw e; await sleep(wait); }
    }
  }
  async function read(b, p) {
    const k = b + ':' + p, c = cache[k];
    if (c && Date.now() - c.t < CACHE) return c;
    const [list, me] = await Promise.all([call(mt.getRankList, { board: b, period: p }), call(mt.getMyRank, { board: b, period: p })]);
    const r = { t: Date.now(), list: (list && Array.isArray(list.data)) ? list.data : [], me: me || {} };
    cache[k] = r; return r;
  }

  // ---- the menu's page
  const node = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const who = n => (n == null || n === '') ? T('雪友') : String(n);
  function myLine(bd, me) {
    if (me.status === 'EXACT' && me.rank != null) return T('我') + ' · ' + (EN() ? '#' + me.rank : '第 ' + me.rank + ' 名') + ' · ' + bd.fmt(+me.score);
    if (me.status === 'OVER_LIMIT') return T('我') + ' · 500+';
    return T('还没有成绩，滑一趟就会上榜');
  }
  async function render() {
    if (!el || !R.on) return;
    const my = ++sig, s = el.sec, bd = VIEWS.find(v => v.id === view), board = bd.boards[period];
    s.textContent = '';
    s.appendChild(node('h4', null, T('RANKING · 排行榜')));
    const row1 = node('div', 'chips rk-b'), row2 = node('div', 'chips rk-p');
    for (const v of VIEWS) { const x = node('button', v.id === view ? 'on' : '', T(v.name)); x.type = 'button'; x.dataset.rv = v.id; row1.appendChild(x); }
    for (const [id, name] of PERIODS) { const x = node('button', id === period ? 'on' : '', T(name)); x.type = 'button'; x.dataset.rp = id; row2.appendChild(x); }
    s.appendChild(row1); s.appendChild(row2);
    const me = node('p', 'rk-me', T('读取中…')); s.appendChild(me);
    const box = node('ol', 'rk-list'); s.appendChild(box);
    try {
      await R.flush();
      const r = await read(board, period); if (my !== sig) return;
      me.textContent = myLine(bd, r.me);
      if (!r.list.length) box.appendChild(node('li', 'rk-none', T(period === 'day' ? '今天还没有人上榜' : '还没有人上榜')));
      for (const it of r.list.slice(0, 100)) {
        const li = node('li', it.rank <= 3 ? 'top' : '');
        li.appendChild(node('b', null, String(it.rank))); li.appendChild(node('span', null, who(it.nickname))); li.appendChild(node('em', null, bd.fmt(+it.score)));
        box.appendChild(li);
      }
    } catch (e) {
      if (my !== sig) return;
      if (fatal(code(e))) { off(e); return; }
      me.textContent = T(code(e) === 2002 ? '榜单还在准备，稍后再看' : '暂时读不到榜单，稍后再看');
    }
    s.appendChild(node('p', 'note', T('今日和本周按北京时间重新开始，总榜一直保留。每人只留最好的一次。')));
  }
  R.show = function () { if (el && R.on) render(); };

  // ---- the day card: today's places, if they come back while the card is still up
  R.onDay = async function () {
    if (!el || !el.day || !R.on) return;
    el.day.textContent = '';
    const my = Date.now();
    R.dayAsk = my;
    try {
      await R.flush();
      const out = [];
      for (const v of VIEWS) {
        const b = v.boards.day, st = sent[b]; if (!st || st.per !== P.d) continue;
        const me = await call(mt.getMyRank, { board: b, period: 'day' });
        if (me && me.status === 'EXACT' && me.rank != null) out.push(T(v.name) + ' ' + (EN() ? '#' + me.rank : '第 ' + me.rank));
        else if (me && me.status === 'OVER_LIMIT') out.push(T(v.name) + ' 500+');
      }
      if (R.dayAsk !== my || Date.now() - my > 4000 || !out.length) return;
      el.day.textContent = T('今日排名') + ' · ' + out.join(' · ');
    } catch (e) { if (fatal(code(e))) off(e); }
  };
  R.state = () => ({ P: Object.assign({}, P), pend: JSON.parse(JSON.stringify(pend)), sent: JSON.parse(JSON.stringify(sent)), flushing: !!flushing });          // (for the tests)
  return R;
})();
