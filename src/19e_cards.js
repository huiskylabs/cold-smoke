// ---------------------------------------------------------------- 集卡: the collection's machinery (试玩版, ?dev 下的 Variants「集卡」，默认关)
// The system knows nothing about any particular card. Everything a card is lives in tables that are filled from outside (19i_cardpack.js and
// any later file), so a new card, a new kind of card, a new way to earn one or a new mountain is a new row, not a change here.
//
//   Cards.kind(id, def)      a kind of card (风景卡, 动物卡, 时刻卡, 路线章 ...): its name, how it is drawn by default, which stamps it collects
//   Cards.set(id, def)       a page of the album (寒烟山 · 风景, 偶遇 ...): its name, its kind, the mountain it belongs to
//   Cards.card(def)          one card: id (never reused), set, name, hint, fact, art, and `when`, the rule that earns it; mtn or seed: only
//                            there; dev: only in ?dev; soon: shown, not yet to be got; hidden: 'secret' (no hint, no outline until got)
//   Cards.pack({kinds, sets, cards})        all three at once
//   Cards.rule(type, def)    a way to earn a card. def: { ev: names it listens to, or tick: true (looked at a few times a second while
//                            skiing); test(rule, ctx) -> true when earned; keys(rule) -> the events that wake it (optional) }
//   Cards.facet(id, def)     a stamp a card can be collected under again (the hour, the weather, skis or board). def: { read(ctx) -> value,
//                            values: [[value, 中文, English], ...] }. A card lists the facets it collects; all of them is a full card.
//   Cards.art(id, fn)        a way to draw a card: fn(ctx2d, W, H, view) (19f_cardart.js)
//   Cards.stat(key, fn)      a number a rule can ask for ('run.vmax', 'run.air' ...)
//   Cards.gen(id, fn)        cards made from the mountain itself: fn(mountain, seed) -> [card defs], run whenever the mountain changes
//
// Where cards come from: anything in the game says what happened, once, and the rules listening for it decide.
//   Cards.emit(name, data)   'animal.seen' {id}, 'fox.den' {den}, 'ring.line' {line, full}, 'ring.secret' {id}, game events as 'game.<type>' ...
//   Cards.grant(id, why)     a card given outright (tests, a story moment)
//   Cards.listen(fn)         told of every card got and every new stamp: fn({ type: 'got' | 'stamp', card, rec, value })
//
// Kept: one JSON under coldsmoke.cards (00d_store.js: in the 小红书 container too). { v, got: { id: { t, d, n, f: { facet: [values] }, seed } },
// p: { id: progress }, seen: { id: 1 } }. A card dropped from the tables keeps its record, so it comes back if the card does.
const Cards = self.Cards = (() => {
  const C = { kinds: {}, sets: {}, cards: {}, rules: {}, facets: {}, arts: {}, stats: {}, gens: {}, list: [], on: false, started: false, VER: 1 };
  const KEY = Store.durable('coldsmoke.cards');
  if (typeof Variants !== 'undefined') Variants.def('cards', '集卡', [['off', '关'], ['on', '开']], 'off');
  const devOn = () => { try { return !(self.COLD_SMOKE && self.COLD_SMOKE.noDev) && (/[?&]dev(=|&|$)/.test(location.search) || /\/dev\/?$/.test(location.pathname) || !!(self.COLD_SMOKE && self.COLD_SMOKE.dev)); } catch (e) { return false; } };
  C.dev = devOn();
  const live = () => C.dev && typeof Variants !== 'undefined' && Variants.val.cards === 'on';
  C.L = (zh, en) => (typeof I18N !== 'undefined' && I18N.en() && en) ? en : zh;          // (a card's own words: Chinese, and English where given)
  let order = 0;

  // ---- the tables
  C.kind = function (id, d) { C.kinds[id] = Object.assign({ id, zh: id, en: '', art: 'emblem', facets: [], order: order++ }, d); return C.kinds[id]; };
  C.set = function (id, d) { C.sets[id] = Object.assign({ id, zh: id, en: '', kind: null, mtn: null, order: order++ }, d); return C.sets[id]; };
  C.card = function (d) {
    if (!d || !d.id) { console.warn('cards: a card needs an id', d); return null; }
    if (C.cards[d.id] && !d.gen) console.warn('cards: card id used twice', d.id);
    const set = C.sets[d.set] || null; if (!set) console.warn('cards: no such set', d.set, 'for', d.id);
    const kind = C.kinds[d.kind || (set && set.kind)] || null; if (!kind) console.warn('cards: no kind for', d.id);
    const c = Object.assign({ zh: d.id, en: '', hint: null, fact: null, art: null, when: null, mtn: set ? set.mtn : null, facets: kind ? kind.facets : [], hidden: false, dev: false, order: order++ }, d);
    c.kind = kind ? kind.id : null;
    if (c.when) { const bad = rulesIn(c.when).filter(r => !C.rules[r.type]); if (bad.length) console.warn('cards: unknown rule', bad.map(r => r.type), 'in', c.id); }
    if (!C.cards[c.id]) C.list.push(c); else C.list[C.list.indexOf(C.cards[c.id])] = c;
    C.cards[c.id] = c; dirtyIdx = true; return c;
  };
  C.pack = function (p) {
    for (const [id, d] of Object.entries(p.kinds || {})) C.kind(id, d);
    for (const [id, d] of Object.entries(p.sets || {})) C.set(id, d);
    for (const d of p.cards || []) C.card(d);
  };
  C.rule = (type, d) => { C.rules[type] = d; dirtyIdx = true; };
  C.facet = (id, d) => { C.facets[id] = Object.assign({ id, values: [] }, d); };
  C.art = (id, fn) => { C.arts[id] = fn; };
  C.stat = (k, fn) => { C.stats[k] = fn; };
  C.gen = (id, fn) => { C.gens[id] = fn; if (C.started) regen(); };
  C.drop = function (id) { const c = C.cards[id]; if (!c) return; delete C.cards[id]; C.list.splice(C.list.indexOf(c), 1); dirtyIdx = true; };

  // the rules inside a rule (all / any hold others)
  function rulesIn(r, out = []) { if (!r) return out; out.push(r); for (const q of r.of || []) rulesIn(q, out); return out; }

  // ---- which cards wake for which event, and which are looked at while skiing (made again whenever the tables change)
  let dirtyIdx = true; const byEv = new Map(); let ticking = [];
  function index() {
    byEv.clear(); ticking = [];
    for (const c of C.list) {
      if (!c.when || (c.dev && !C.dev)) continue; let tick = false;
      for (const r of rulesIn(c.when)) {
        const R = C.rules[r.type]; if (!R) continue;
        const ev = R.keys ? R.keys(r) : R.ev; for (const e of [].concat(ev || [])) { if (!byEv.has(e)) byEv.set(e, new Set()); byEv.get(e).add(c); }
        if (R.tick) tick = true;
      }
      if (tick) ticking.push(c);
    }
    dirtyIdx = false;
  }
  C.test = function (r, ctx) { const R = r && C.rules[r.type]; if (!R) return false; try { return !!R.test(r, ctx); } catch (e) { console.warn('cards rule', r.type, e); return false; } };

  // ---- what is kept
  let rec = null;
  const fresh = () => ({ v: C.VER, got: {}, p: {}, seen: {} });
  // (a later shape of the record: add a step here, from the version before it. Never drop a record a step does not understand)
  C.migrate = { /* 2: o => { ...; o.v = 2; return o; } */ };
  function load() {
    if (rec) return rec;
    let o = Store.getJSON(KEY, null);
    if (!o || typeof o !== 'object' || typeof o.got !== 'object') o = fresh();
    for (let v = (+o.v || 1) + 1; v <= C.VER; v++) if (C.migrate[v]) o = C.migrate[v](o) || o;
    o.v = C.VER; o.got = o.got || {}; o.p = o.p || {}; o.seen = o.seen || {};
    return (rec = o);
  }
  let saveT = 0;
  function save(now) { if (!rec) return; if (now) { clearTimeout(saveT); saveT = 0; Store.setJSON(KEY, rec); } else if (!saveT) saveT = setTimeout(() => { saveT = 0; Store.setJSON(KEY, rec); }, 1500); }
  C.record = () => load();
  C.has = id => !!load().got[id];
  C.rec = id => load().got[id] || null;
  C.progress = (id, v) => { const R = load(); if (v === undefined) return +R.p[id] || 0; R.p[id] = v; save(); return v; };
  C.reset = function () { rec = fresh(); save(true); armed.clear(); for (const f of subs) try { f({ type: 'reset' }); } catch (e) { } };

  // ---- the moment of collecting
  const subs = []; C.listen = f => subs.push(f);
  const tell = m => { for (const f of subs) try { f(m); } catch (e) { console.warn('cards listener', e); } };
  // where the player is and what the world is like, for the rules and the stamps
  function context(ev, data) {
    const S = typeof Game !== 'undefined' ? Game.s : null, m = typeof Course !== 'undefined' && Course.mountainBySeed ? Course.mountainBySeed() : null;
    const s = S ? -S.p[2] : 0, u = S && typeof Course !== 'undefined' ? S.p[0] - Course.at(s, ctxPc).cx : 0;
    return { ev, data: data || {}, mtn: m ? m.id : null, seed: typeof Course !== 'undefined' ? Course.seed : 0, s, u, pos: S ? S.p : null, run: typeof Game !== 'undefined' && Game.mode === 'run', stat: k => { const f = C.stats[k]; try { return f ? +f() || 0 : 0; } catch (e) { return 0; } } };
  }
  const ctxPc = {};
  C.context = context;
  function stampsOf(c, ctx) { const out = {}; for (const id of c.facets || []) { const F = C.facets[id]; if (F) try { const v = F.read(ctx); if (v != null) out[id] = String(v); } catch (e) { } } return out; }
  C.grant = function (id, why, ctx) {
    const c = C.cards[id]; if (!c) { console.warn('cards: no such card', id); return false; }
    ctx = ctx || context('grant'); const R = load(), st = stampsOf(c, ctx); let r = R.got[id], fresh = !r, stamp = null;
    if (!r) r = R.got[id] = { t: Date.now(), d: typeof App !== 'undefined' && App.today ? App.today() : 0, n: 0, f: {}, seed: ctx.seed, why: why || ctx.ev || '' };
    r.n++;
    for (const [k, v] of Object.entries(st)) { const a = r.f[k] || (r.f[k] = []); if (a.indexOf(v) < 0) { a.push(v); if (!fresh) stamp = stamp || { facet: k, value: v }; } }
    if (fresh) { delete R.seen[id]; save(true); tell({ type: 'got', card: c, rec: r }); }
    else if (stamp) { save(true); tell({ type: 'stamp', card: c, rec: r, facet: stamp.facet, value: stamp.value }); }
    else save();
    return fresh || !!stamp;
  };
  // a card's stamps: [{ facet, values: [[v, zh, en, got]] }]; full when every value of every facet it collects is there
  C.stamps = function (c, r) { r = r || C.rec(c.id); return (c.facets || []).map(id => { const F = C.facets[id]; return { facet: id, values: (F ? F.values : []).map(([v, zh, en]) => [v, zh, en, !!(r && r.f[id] && r.f[id].indexOf(v) >= 0)]) }; }); };
  C.full = function (c) { const r = C.rec(c.id); if (!r) return false; return C.stamps(c, r).every(s => s.values.every(v => v[3])); };
  C.markSeen = id => { const R = load(); if (R.got[id] && !R.seen[id]) { R.seen[id] = 1; save(); } };
  C.unseen = () => { const R = load(); return C.list.filter(c => R.got[c.id] && !R.seen[c.id]).length; };
  // may this card be earned here, now? (its mountain, dev-only cards)
  const here = (c, ctx) => (!c.mtn || c.mtn === ctx.mtn) && (!c.seed || c.seed === ctx.seed) && (!c.dev || C.dev) && !c.soon;
  function judge(c, ctx) { if (!here(c, ctx)) return false; return C.test(c.when, ctx); }

  // ---- something happened
  C.emit = function (name, data) {
    if (!live()) return; if (dirtyIdx) index();
    const cs = byEv.get(name); if (!cs || !cs.size) return;
    const ctx = context(name, data);
    for (const c of cs) if (judge(c, ctx)) C.grant(c.id, name, ctx);
  };
  // the game's own events, as each frame says them (99_main.js)
  C.gameEvent = function (ev) { if (C.on && ev && ev.type) C.emit('game.' + ev.type, ev); };
  // rules that watch a state (a place reached, a speed held, the sky as it is) are looked at a few times a second while skiing, and give their
  // card as the state comes true, not again while it stays true
  const armed = new Map(); let tickAcc = 0;
  function tick(dt) {
    C.on = live(); if (!C.on || !C.started) return;
    if (typeof Game === 'undefined' || Game.mode !== 'run') return;
    tickAcc += dt; if (tickAcc < 0.25) return; tickAcc = 0;
    if (dirtyIdx) index(); if (!ticking.length) return;
    const ctx = context('tick');
    for (const c of ticking) {
      const now = judge(c, ctx), was = armed.get(c.id);
      if (now && !was) C.grant(c.id, 'tick', ctx);
      armed.set(c.id, now);
    }
  }
  C.tick = tick;

  // ---- cards made from the mountain (Cards.gen): made again for each mountain, the last mountain's taken away
  let genMade = [];
  function regen() {
    for (const id of genMade) C.drop(id); genMade = [];
    const m = typeof Course !== 'undefined' && Course.mountainBySeed ? Course.mountainBySeed() : null, seed = typeof Course !== 'undefined' ? Course.seed : 0;
    for (const [gid, fn] of Object.entries(C.gens)) {
      let ds = []; try { ds = fn(m, seed) || []; } catch (e) { console.warn('cards gen', gid, e); }
      for (const d of ds) { const c = C.card(Object.assign({ gen: gid }, d)); if (c) genMade.push(c.id); }
    }
    armed.clear();
  }

  // ---- built-in ways to earn a card
  // event: a named thing happened, maybe with some of its details; `count` times over (kept across runs)
  //   { type: 'event', name: 'animal.seen', match: { id: 'fox' }, count: 1 }
  C.rule('event', {
    keys: r => [r.name],
    test(r, ctx) {
      if (ctx.ev !== r.name) return false;
      for (const [k, v] of Object.entries(r.match || {})) { const got = ctx.data[k]; if (Array.isArray(v) ? v.indexOf(got) < 0 : got !== v) return false; }
      if ((r.count || 1) <= 1) return true;
      const pk = r.pkey || (r.name + ':' + JSON.stringify(r.match || {})), n = C.progress(pk) + 1; C.progress(pk, n); return n >= r.count;
    },
  });
  // place: within r metres of a point on the run (s metres down it, u across from its middle)
  //   { type: 'place', s: 1650, u: -12, r: 10 }
  C.rule('place', { tick: true, test: (r, ctx) => ctx.run && Math.hypot(ctx.s - r.s, ctx.u - (r.u || 0)) <= (r.r || 10) });
  // station: on the designed run (经典编排, Course.ROUTE), part way into one of its stations (0 its start .. 1 its end), on the run
  //   { type: 'station', idx: 2, at: 0.1, lane: 25 }        (lane: how far from the run's middle still counts, metres)
  C.rule('station', {
    tick: true,
    test(r, ctx) {
      if (!ctx.run || typeof Course === 'undefined' || !Course.ROUTE || Course.route === false) return false;
      const g = Course.segAt(ctx.s); if (!g || g.idx !== r.idx) return false;
      const k = (ctx.s - g.s0) / g.len; return k >= (r.at || 0) && k <= (r.to == null ? Math.min(1, (r.at || 0) + 0.25) : r.to) && Math.abs(ctx.u) <= (r.lane || 40);
    },
  });
  // stat: a number from Cards.stat at or past a mark   { type: 'stat', key: 'run.vmax', gte: 22.2 }
  C.rule('stat', { tick: true, test: (r, ctx) => { const v = ctx.stat(r.key); return (r.gte == null || v >= r.gte) && (r.lte == null || v <= r.lte); } });
  // sky: the hour, the weather, the aurora as they are now   { type: 'sky', tod: ['night'], wx: ['heavy'], aurora: true }
  C.rule('sky', {
    tick: true,
    test(r, ctx) {
      if (r.tod && r.tod.indexOf(C.facets.tod.read(ctx)) < 0) return false;
      if (r.wx && r.wx.indexOf(C.facets.wx.read(ctx)) < 0) return false;
      if (r.aurora && !(typeof Sky !== 'undefined' && Sky.aurora && Sky.aurora(typeof Render !== 'undefined' ? Render.time : 0) > 0.05)) return false;
      return true;
    },
  });
  // count: enough cards of a set (or of a list) collected   { type: 'count', set: 'hanyan-views', n: 7 }  (n left out: all of them)
  C.rule('count', {
    ev: 'card.got',
    test(r, ctx) {
      const ids = r.cards || C.list.filter(c => c.set === r.set && c.id !== ctx.self && !(c.when && c.when.type === 'count')).map(c => c.id);
      const n = ids.filter(id => C.has(id)).length; return n >= (r.n == null ? ids.length : r.n) && ids.length > 0;
    },
  });
  // all / any of other rules   { type: 'all', of: [ {...}, {...} ] }
  C.rule('all', { keys: () => [], test: (r, ctx) => (r.of || []).every(q => C.test(q, ctx)) });
  C.rule('any', { keys: () => [], test: (r, ctx) => (r.of || []).some(q => C.test(q, ctx)) });
  // (the count rule hears every card got)
  C.listen(m => { if (m.type === 'got') C.emit('card.got', { id: m.card.id, set: m.card.set }); });

  // ---- built-in stamps
  const HOURS = [['dawn', '清晨', 'Dawn'], ['day', '白天', 'Day'], ['dusk', '黄昏', 'Dusk'], ['night', '夜里', 'Night']];
  C.facet('tod', {
    zh: '时刻', en: 'Hour', values: HOURS,
    // (by the clock, cut where the sun's own day turns, 05_sky.js DAY: night until first light at 230, dawn until the sun stands high at 464,
    // day until the low gold light at 1004, dusk until the dark at 1352)
    read() {
      if (typeof Sky === 'undefined') return 'day';
      const c = ((Sky.clock % Sky.cycle) + Sky.cycle) % Sky.cycle;
      return c < 230 || c >= 1352 ? 'night' : c < 464 ? 'dawn' : c < 1004 ? 'day' : 'dusk';
    },
  });
  C.facet('wx', { zh: '天气', en: 'Weather', values: [['clear', '晴', 'Clear'], ['light', '小雪', 'Snow'], ['heavy', '大雪', 'Heavy snow']], read: () => typeof Weather !== 'undefined' ? Weather.level : 'clear' });
  C.facet('gear', { zh: '装备', en: 'Gear', values: [['ski', '双板', 'Skis'], ['board', '单板', 'Board']], read: () => (typeof Game !== 'undefined' && (Game.board || (Game.s && Game.s.board))) ? 'board' : 'ski' });

  // ---- built-in numbers
  const run = () => (typeof UI !== 'undefined' && UI.sp && UI.sp.run) || {};
  C.stat('run.vmax', () => run().v);            // m/s, this run's top speed
  C.stat('run.air', () => run().air);           // m, this run's longest flight
  C.stat('run.dist', () => run().dist);         // m, along the run since 出发
  C.stat('run.drop', () => run().drop);         // m
  C.stat('speed', () => typeof Game !== 'undefined' ? Game.s.speed : 0);

  // ---- start: after the game is built (99_main.js)
  C.start = function () {
    if (C.started) return; C.started = true; load(); regen();
    if (typeof App !== 'undefined') { App.onTick.push(dt => tick(dt)); if (App.onMountain) App.onMountain.push(() => regen()); }
    C.on = live();
    if (typeof Variants !== 'undefined') Variants.on(n => { if (n === 'cards') C.on = live(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && saveT) save(true); });
    for (const f of startSubs) try { f(); } catch (e) { console.warn(e); }
  };
  const startSubs = []; C.onStart = f => { if (C.started) f(); else startSubs.push(f); };
  C.live = live;
  return C;
})();
