// 集卡 core check, in node, no browser and no drawing: loads the collection's files with the game stubbed out and runs every rule, the
// stamps, the record (save, load, migrate) and every card's drawing code against a canvas that only counts calls.
//   node tools/cards-test.js            (npm run cards)
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };

// ---- a pretend world
const store = new Map(), warns = [];
const fakeCtx = () => new Proxy({}, { get: (t, k) => (k in t ? t[k] : (k === 'createLinearGradient' || k === 'createRadialGradient') ? () => ({ addColorStop() { } }) : () => { }), set: (t, k, v) => { t[k] = v; return true; } });
const W = {
  console: { log: console.log, warn: (...a) => warns.push(a.join(' ')) },
  localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
  location: { search: '?dev', pathname: '/' }, setTimeout: (f) => { f(); return 1; }, clearTimeout() { },
  document: { addEventListener() { }, createElement: () => ({ getContext: () => fakeCtx() }) },
  Variants: { val: { cards: 'on', cardbook: 'a', route: 'b' }, def() { }, on() { } },
  I18N: { en: () => false, lang: 'zh', on() { } },
  Sky: { clock: 700, cycle: 1440, times: { day: 619.7 }, aurora: () => 0 },
  Weather: { level: 'clear' },
  Render: { time: 0 },
  Game: { mode: 'run', s: { p: [0, 0, -100], speed: 10 }, events: [] },
  UI: { sp: { run: { v: 10, air: 0, dist: 100, drop: 0 } } },
  App: { onTick: [], onMountain: [], today: () => 20000, dailySeed: d => 100000 + d, dayLabel: (d, en) => (en ? 'Day ' : '日 ') + d },
};
// a run of the designed stations, each 300 m long, the run's middle at x = 0, flat
const segs = []; for (let i = 0; i < 12; i++) segs.push({ idx: i, s0: i * 300, len: 300, type: 'x' });
W.Course = { seed: 261111, ROUTE: segs, route: true, segs, mountainBySeed: () => W.Course.seed === 261111 ? { id: 'hanyan' } : null,
  at: (s, o) => { o = o || {}; o.cx = 0; o.hw = 30; return o; }, segAt: s => segs[Math.max(0, Math.min(11, Math.floor(s / 300)))], height: () => 0, nearTree: (x, z, o) => { o.ok = false; }, ways: () => [0] };
W.self = W; W.window = W; W.innerHeight = 800;
const ctx = vm.createContext(W);
for (const f of ['00d_store.js', '19e_cards.js', '19f_cardart.js', '19h_cardsrc.js', '19i_cardpack.js']) vm.runInContext(src(f), ctx, { filename: f });
const C = vm.runInContext('Cards', ctx), A = vm.runInContext('CardArt', ctx);
const got = []; C.listen(m => got.push(m.type + ':' + (m.card ? m.card.id : '')));
C.start();
const tick = (n = 2) => { for (let i = 0; i < n; i++) for (const f of W.App.onTick) f(0.3); };
const at = s => { W.Game.s.p = [0, 0, -s]; };

ok(warns.length === 0, 'tables load with no warning ' + warns.join(' | '));
ok(C.list.length >= 20, 'first pack: ' + C.list.length + ' cards');
// station
at(30); tick(); ok(!C.has('hy-start'), 'station 0 before its point: not yet');
at(0.3 * 300); tick(); ok(C.has('hy-start'), 'station 0 at 30%: got');
at(2 * 300 + 0.06 * 300); tick(); ok(C.has('hy-outwood'), 'station 2 near its start: got');
// stamps: same place, another hour
W.Sky.clock = 1100; at(100); tick(); at(0.3 * 300); tick();
ok(JSON.stringify(C.rec('hy-start').f.tod) === '["day","dusk"]', 'second visit at dusk adds a stamp: ' + JSON.stringify(C.rec('hy-start').f));
ok(got.includes('stamp:hy-start'), 'a stamp is told');
ok(C.rec('hy-start').n === 2, 'counted twice');
// held state gives once
const n0 = C.rec('hy-start').n; tick(5); ok(C.rec('hy-start').n === n0, 'standing there does not give again');
// events
C.emit('animal.seen', { id: 'hare' }); ok(C.has('an-hare') && !C.has('an-fox'), 'animal.seen hare: hare only');
C.emit('ring.secret', { id: 'a' }); C.emit('ring.secret', { id: 'b' }); ok(!C.has('rt-secret'), 'two secret rings: not yet');
C.emit('ring.secret', { id: 'c' }); ok(C.has('rt-secret'), 'three secret rings: got (count kept)');
C.emit('ring.line', { line: 'speed', full: false }); ok(!C.has('rt-speed'), 'speed line not full: no');
C.emit('ring.line', { line: 'speed', full: true }); ok(C.has('rt-speed'), 'speed line full: got');
// mountain scope
W.Course.seed = 5; C.emit('fox.den', { den: 'a' }); ok(!C.has('hy-den'), 'fox den on another mountain: no');
W.Course.seed = 261111; C.emit('fox.den', { den: 'a' }); ok(C.has('hy-den'), 'fox den on 寒烟山: got');
// stats + composite
W.UI.sp.run.v = 23; tick(); ok(C.has('mo-80'), 'top speed 83 km/h: got');
W.Weather.level = 'heavy'; W.Game.s.speed = 2; tick(); ok(!C.has('mo-storm'), 'heavy snow standing still: no');
W.Game.s.speed = 8; tick(); ok(C.has('mo-storm'), 'heavy snow moving: got');
// meta
for (const id of ['hy-glade', 'hy-gully', 'hy-ridge', 'hy-powder']) C.grant(id, 'test');
ok(!C.has('hy-all'), 'all views but one: not yet');
C.grant('hy-chute', 'test'); ok(C.has('hy-all'), 'every view: the whole-mountain card');
// record survives a reload, unknown ids kept
const saved = JSON.parse(store.get('coldsmoke.cards')); saved.got['gone-card'] = { t: 1, n: 1, f: {} }; store.set('coldsmoke.cards', JSON.stringify(saved));
const ctx2 = vm.createContext(Object.assign({}, W, { App: Object.assign({}, W.App, { onTick: [] }) })); ctx2.self = ctx2; ctx2.window = ctx2;
for (const f of ['00d_store.js', '19e_cards.js', '19i_cardpack.js']) vm.runInContext(src(f), ctx2, { filename: f });
const C2 = vm.runInContext('Cards', ctx2); C2.start();
ok(C2.has('hy-start') && C2.has('rt-secret') && C2.record().got['gone-card'], 'reloaded: cards and an unknown card kept');
ok(vm.runInContext('Store.isDurable("coldsmoke.cards")', ctx2), 'the record is a durable key (kept in the 小红书 container)');
// days (Cards.gen)
ok(C.cards['day-20000'] && C.cards['day-20000'].seed === 120000, "today's card made from today's mountain");
// every card draws, owned and not, under every hour
let drew = 0, threw = 0;
for (const c of C.list) for (const own of [false, true]) for (const tod of ['dawn', 'day', 'dusk', 'night']) {
  try { A.draw(fakeCtx(), 300, 400, { card: c, rec: C.rec(c.id), owned: own, tod, wx: 'light', no: 1, total: 9, seed: 1, hidden: false }); drew++; } catch (e) { threw++; console.log('draw', c.id, e.message); }
}
ok(threw === 0, 'every card draws: ' + drew + ' drawings, ' + threw + ' threw');
ok(warns.length === 0, 'no warnings ' + warns.slice(0, 3).join(' | '));
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
