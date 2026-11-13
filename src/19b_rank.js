// ---------------------------------------------------------------- the leaderboards, inside 小红书 only
// The 小红书 小工具 container offers public boards (submitScore / getRankList / getMyRank, client 9.51+, still in 内测; see the official
// skill's references/js-api.md, 「排行榜（内测）」). Three are kept here, each the best of a run as the day card already counts it:
//   board 1  极速      top speed, km/h to a tenth
//   board 2  最远飞行  the longest flight, m to a tenth (a flight counts from JUMP_T in the air, as on the splits)
//   board 3  最远一趟  the distance of one run from 出发, whole metres (shown in km once past a kilometre)
// The platform splits every submission into day / week / month / all-time boards (Beijing midnight) and keeps each player's best.
// Outside the container (the web build, a browser) nothing here does anything and the menu has no 排行榜 at all.
// Calls are few: a figure goes up only when it beats what was already sent today, at most once every 30 s (and when the page is put away,
// the board is opened, or a day card comes). Lists are cached for 45 s. The platform's own limit is 150 calls a second for the whole tool.
const Rank = self.Rank = (() => {
  const R = { on: false, ready: false };
  const T = s => I18N.t(s), EN = () => I18N.en();
  const BOARDS = [
    { id: 1, key: 'v', name: '极速', unit: 'km/h', max: 400, of: run => Math.round(run.v * 36) / 10, fmt: v => v.toFixed(1) + ' km/h' },
    { id: 2, key: 'air', name: '最远飞行', unit: 'm', max: 600, of: run => Math.round(run.air * 10) / 10, fmt: v => v.toFixed(1) + ' m' },
    { id: 3, key: 'dist', name: '最远一趟', unit: 'm', max: 999999, of: run => Math.floor(Math.max(0, run.dist)), fmt: v => v < 1000 ? Math.round(v) + ' m' : (v / 1000).toFixed(2) + ' km' },
  ];
  const PERIODS = [['day', '今日'], ['week', '本周'], ['all', '总榜']];
  const FLUSH_EVERY = 30000, CACHE = 45000;
  let mt = null, el = null, board = 1, period = 'day', lastFlush = 0, cool = 0, flushing = null, sig = 0;
  const sent = {}, pend = {}, cache = {};

  const api = () => { try { const m = window.xhs && window.xhs.miniTool; return m && typeof m.submitScore === 'function' && typeof m.getRankList === 'function' && typeof m.getMyRank === 'function' ? m : null; } catch (e) { return null; } };
  // the day as the platform counts it: Beijing time
  const bjDay = () => Math.floor((Date.now() + 8 * 3600e3) / 86400e3);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const code = e => (e && typeof e.errCode === 'number') ? e.errCode : (e && +e.errCode) || 0;
  // no boards for this tool (not authorised at upload, or not let into the 内测): the entry goes away for the rest of the page
  function off(e) { R.on = false; console.warn('rank off', e && e.errMsg, code(e)); if (el) { el.nav.hidden = true; if (el.sec.classList.contains('on')) el.sec.innerHTML = ''; } }
  const fatal = c => c === 1005 || c === 10003;

  R.init = function () {
    mt = api(); if (!mt) return;
    R.on = true;
    const menu = document.getElementById('menu'); if (!menu) return;
    el = { nav: menu.querySelector('nav [data-sec="rank"]'), sec: menu.querySelector('section[data-sec="rank"]'), day: document.getElementById('day-r') };
    if (!el.nav || !el.sec) { el = null; return; }
    el.nav.hidden = false;
    el.sec.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.rb) { board = +b.dataset.rb; render(); } else if (b.dataset.rp) { period = b.dataset.rp; render(); }
    });
    if (typeof App !== 'undefined' && App.onTick) App.onTick.push(tick);
    document.addEventListener('visibilitychange', () => { if (document.hidden) R.flush(); });
    I18N.on(() => { if (el.sec.classList.contains('on')) render(); });
  };

  // ---- the run's figures, every step: what beats today's sent best waits to go up
  function tick() {
    if (!R.on) return;
    const sp = typeof UI !== 'undefined' && UI.sp, run = sp && sp.run; if (!run) return;
    const d = bjDay();
    for (const b of BOARDS) {
      const v = b.of(run); if (!(v > 0) || !isFinite(v) || v > b.max) continue;
      const s = sent[b.id]; if (s && s.day === d && v <= s.v) continue;
      const p = pend[b.id]; if (!p || p.day !== d || v > p.v) pend[b.id] = { day: d, v };
    }
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
          const s = sent[id]; if (!s || s.day !== p.day || p.v > s.v) sent[id] = { day: p.day, v: p.v };
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
    const my = ++sig, s = el.sec, bd = BOARDS.find(b => b.id === board);
    s.textContent = '';
    s.appendChild(node('h4', null, T('RANKING · 排行榜')));
    const row1 = node('div', 'chips rk-b'), row2 = node('div', 'chips rk-p');
    for (const b of BOARDS) { const x = node('button', b.id === board ? 'on' : '', T(b.name)); x.type = 'button'; x.dataset.rb = b.id; row1.appendChild(x); }
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
      const d = bjDay(), out = [];
      for (const b of BOARDS) {
        const s = sent[b.id]; if (!s || s.day !== d) continue;
        const me = await call(mt.getMyRank, { board: b.id, period: 'day' });
        if (me && me.status === 'EXACT' && me.rank != null) out.push(T(b.name) + ' ' + (EN() ? '#' + me.rank : '第 ' + me.rank));
        else if (me && me.status === 'OVER_LIMIT') out.push(T(b.name) + ' 500+');
      }
      if (R.dayAsk !== my || Date.now() - my > 4000 || !out.length) return;
      el.day.textContent = T('今日排名') + ' · ' + out.join(' · ');
    } catch (e) { if (fatal(code(e))) off(e); }
  };
  R.BOARDS = BOARDS;
  R.state = () => ({ pend: JSON.parse(JSON.stringify(pend)), sent: JSON.parse(JSON.stringify(sent)), flushing: !!flushing });          // (for the tests)
  return R;
})();
