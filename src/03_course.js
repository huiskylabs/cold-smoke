// ---------------------------------------------------------------- the mountain: an endless course made of ~30 s segments
// World: x right, y up, the fall line runs toward -z.  s = -z is distance travelled downhill.
// Everything here is plain double-precision JS; rendering samples it into clipmap textures, physics calls it directly.

const SEG_TYPES = {
  //           slope  hw  dish shoulder gul gw  gAmp rollA rollL mog forest glade powder ridge mean kick
  bowl:    { slope: 0.36, hw: 30, dish: 1.6, shoulder: 0.34, gul: 0, gw: 14, gAmp: 0, rollA: 0, rollL: 40, mog: 0, forest: 0.85, glade: 0, powder: 0.25, ridge: 0, mean: 1.0, kick: 0 },
  steeps:  { slope: 0.60, hw: 17, dish: 2.6, shoulder: 0.55, gul: 0, gw: 14, gAmp: 0, rollA: 0, rollL: 40, mog: 0, forest: 0.80, glade: 0, powder: 0.15, ridge: 0, mean: 0.55, kick: 0 },
  glade:   { slope: 0.33, hw: 44, dish: 0.8, shoulder: 0.26, gul: 0, gw: 14, gAmp: 0, rollA: 0.25, rollL: 34, mog: 0, forest: 1.0, glade: 1, powder: 0.6, ridge: 0, mean: 0.8, kick: 0 },
  rollers: { slope: 0.31, hw: 26, dish: 1.2, shoulder: 0.32, gul: 0, gw: 14, gAmp: 0, rollA: 1.5, rollL: 30, mog: 0, forest: 0.7, glade: 0, powder: 0.2, ridge: 0, mean: 0.7, kick: 0 },
  gully:   { slope: 0.36, hw: 24, dish: 0.6, shoulder: 0.42, gul: 5.5, gw: 9.5, gAmp: 13, rollA: 0, rollL: 40, mog: 0, forest: 0.8, glade: 0, powder: 0.3, ridge: 0, mean: 0.5, kick: 0 },
  kickers: { slope: 0.35, hw: 28, dish: 1.0, shoulder: 0.34, gul: 0, gw: 14, gAmp: 0, rollA: 0, rollL: 40, mog: 0, forest: 0.75, glade: 0, powder: 0.3, ridge: 0, mean: 0.5, kick: 1 },
  powder:  { slope: 0.42, hw: 46, dish: 2.2, shoulder: 0.30, gul: 0, gw: 14, gAmp: 0, rollA: 0.5, rollL: 60, mog: 0, forest: 0.45, glade: 0.12, powder: 1, ridge: 0, mean: 0.9, kick: 0 },
  ridge:   { slope: 0.30, hw: 14, dish: -0.8, shoulder: 0.30, gul: 0, gw: 14, gAmp: 0, rollA: 0.5, rollL: 46, mog: 0, forest: 0.15, glade: 0, powder: 0.2, ridge: 1, mean: 0.45, kick: 0 },
  moguls:  { slope: 0.40, hw: 22, dish: 1.4, shoulder: 0.38, gul: 0, gw: 14, gAmp: 0, rollA: 0, rollL: 40, mog: 1, forest: 0.8, glade: 0, powder: 0.1, ridge: 0, mean: 0.6, kick: 0 },
};
const SEG_KEYS = ['slope', 'hw', 'dish', 'shoulder', 'gul', 'gw', 'gAmp', 'rollA', 'rollL', 'mog', 'forest', 'glade', 'powder', 'ridge', 'mean', 'kick'];
const SEG_NAMES = { bowl: '开阔大坡', steeps: '陡坡', glade: '树林', rollers: '起伏', gully: '雪槽', kickers: '跳台', powder: '深粉雪', ridge: '山脊', moguls: '蘑菇' };
// how fast each kind of run is covered (metres of mountain per second, measured with the test pilot, who weaves): its length is set so
// that it lasts about half a minute
// (re-measured for the feel the owner chose, 2026-11-13 (Variants 'feel' b: deep powder drags, a hard turn at speed washes out): the
// pilot's speed on two fixed mountains, scaled from the old figures by b over a)
const SEG_PACE = { bowl: 18.7, steeps: 28.6, glade: 11.6, rollers: 14.1, gully: 14.6, kickers: 17.0, powder: 10.8, ridge: 21.2, moguls: 15.3 };
// ---- the richer mountain (Variants 'terr' b) and how much of it there is (Variants 'tdiff': 轻松 / 标准 / 野雪). With 'terr' a the
// mountain is the one it always was, to the last bit, whatever 'tdiff' says. With b three things come onto it, each from a random stream of
// its own, so the deck, the runs and the jumps of a seed stay what they are:
//   the pitch changes along the run: a run is no longer one even slope but steeper and easier pitches, with a rollover where it steepens
//   (the snow drops out of sight beyond it) and a bench where it eases, the same fall over the whole run;
//   the run is no longer the same on both sides: stretches where it leans to one side (off-camber) and stretches where one edge curls up
//   into a natural wall (a side hit) to ride up and come back down;
//   rock: snow-capped boulders along the edges and out on the open runs, and small drops, a snow-covered ledge with a soft landing below. A drop
//   never spans the run: there is always a way round, and the first turns of a mountain are free of them.
// tdiff scales all of it, and the run itself: slope and width. Every level keeps a clean line down; nothing here moves the camera.
const TERR_LV = {
  //   slope  width pitch  tilt   bank  drops  dropH       rocks islands mogul  pace (how far a run of ~30 s reaches at this level: test pilot, 2026-11-14)
  a: { slope: 0.82, hw: 1.22, pitch: 0.22, tilt: 0.035, bank: 1.4, drops: 0, dropH: [0, 0], rocks: 0.5, isl: 0.6, mog: 0.75, pace: 0.81, lanes: 0.8 },
  b: { slope: 1.00, hw: 1.00, pitch: 0.42, tilt: 0.075, bank: 2.8, drops: 0.6, dropH: [1.2, 2.0], rocks: 1.0, isl: 1.0, mog: 1.0, pace: 0.93, lanes: 1.4 },
  c: { slope: 1.10, hw: 0.86, pitch: 0.60, tilt: 0.12, bank: 4.0, drops: 1.4, dropH: [1.8, 3.5], rocks: 1.6, isl: 1.4, mog: 1.2, pace: 1.04, lanes: 2.0 },
};
// how much of each the kinds of run take (pitch, sides, rock): busy or narrow runs less, the open ones more
const TERR_K = {
  bowl: [1, 1, 1], steeps: [0.7, 0.6, 0.5], glade: [0.9, 0.7, 0.8], rollers: [0.5, 0.8, 0.8], gully: [0.9, 0.4, 0.6],
  kickers: [0.4, 0.5, 0.4], powder: [1, 0.9, 1.2], ridge: [0.8, 0, 0.3], moguls: [0.6, 0.6, 0.3],
};
if (typeof Variants !== 'undefined') {
  Variants.def('terr', '地形', [['a', '原来'], ['b', '丰富']], 'b');
  Variants.def('tdiff', '地形难度', [['a', '轻松'], ['b', '标准'], ['c', '野雪']], 'b');
  // (a change lays the same mountain out again)
  Variants.on((n, v, init) => { if (!init && (n === 'terr' || n === 'tdiff') && typeof App !== 'undefined' && App.ready && App.newMountain) App.newMountain(Course.seed); });
}
const HREF_SLOPE = 0.36;        // reference plane removed from heights before they go into float textures
const TREE_CELL = 4.5;

const Course = ((vn1, vn2, h2U) => {
  const C = { seed: 261111, segs: [], feats: new Map(), mogK: 1, rockCap: 0, rich: false, lv: 'b', isl: 1 };
  // the shape of a mogul field (owner, 2026-11-14: are the bumps too tall and too close together? What do real ones look like?).
  // L: metres from one row of bumps to the next down the fall line; W: across; H: crest over trough of an average bump (big scales it
  // B0..B0+B1); Q: where in a row the crest stands (the rest is the short steep face below); R: how round the crown is; J: how far rows wander.
  // a: as it was (a dense field of tall, pointed bumps: 0.5-1.3 m, faces to about 40 degrees). b: a resort field skiers made, as measured
  // (Physics Today: natural moguls about 5.7 m apart, a checkerboard; 0.4-0.8 m tall): lower, rounder, a little uneven. c: a built FIS
  // course (moguls about 3.5-4 m apart down the line, 26-28 degree pitch), close, tall and regular
  Variants.def('mogf', '蘑菇形状', [['a', '原来'], ['b', '雪场'], ['c', '比赛']], 'b');
  const MOGF = {
    a: { L: 5.2, W: 4.2, H: 0.92, B0: 0.58, B1: 0.84, Q: 0.62, R: 0, J: 0.13, I: 1 },
    b: { L: 5.6, W: 5.0, H: 0.58, B0: 0.65, B1: 0.7, Q: 0.58, R: 0.7, J: 0.22, I: 1 },
    c: { L: 3.7, W: 4.0, H: 0.8, B0: 0.88, B1: 0.24, Q: 0.55, R: 0.6, J: 0.04, I: 1 },
  };
  const CH = 2048, NF = 18;       // metres per cache chunk, fields per metre
  const F = { baseY: 0, cx: 1, hw: 2, dish: 3, shoulder: 4, gul: 5, gw: 6, goff: 7, roll: 8, mog: 9, forest: 10, glade: 11, powder: 12, ridge: 13, wall: 14, rtail: 15, tilt: 16, bank: 17 };
  const chunks = new Map();
  let rng = RNG(C.seed), planned = 0, lastTypes = [], deck = [], pairs = [];
  let LV = null, trng = rng;      // the richer mountain: its level (TERR_LV) or null for the mountain as it was, and its own random stream
  // running integrals carried across chunks
  const integ = new Map();   // chunkIndex -> {baseY, rollPh, gPh} at chunk start

  // ---- one number makes the mountain. C.seed is the number people see and pass round (1..999999). KEY is that number hashed, and every
  // random choice in this module hangs on it: the deck of runs (rng, toss), every noise field, every hash. For seed HOME the key is 0, which
  // leaves each of them exactly what it was when there was only one mountain: HOME (the test harness boots on it) is that mountain's ground
  // to the last bit, its runs in the order deal() gives them now; with C.classic set, in the order they had: the first mountain itself.
  const HOME = 261111, FIRST = 20261111;
  let KEY = 0, KZ = 0;
  // the helpers of 00_util.js, keyed. They shadow the plain ones for everything below, so no call site needs to know: a field's tag is
  // mixed with the key (four fields are tagged C.seed + k: those go back onto the first mountain's own number first), and the grid of
  // hashes (tree cells, the size of each bump) is read from another part of the same endless sheet
  const vnoise1 = (x, s) => vn1(x, (s < C.seed ? s : s - C.seed + FIRST) ^ KEY), vnoise2 = (x, y, s) => vn2(x, y, s ^ KEY), hash2U = (a, b) => h2U(a + KEY, b + KZ);
  // lay the mountain out again from seed n (anything that is not a number from 1 up: the same mountain again). Whoever keeps things made
  // from the course (terrain, trees, tracks, the game) has to be told: App.newMountain does all of that
  C.setSeed = function (n) {
    n = Math.floor(+n); if (n >= 1) C.seed = (n - 1) % 999999 + 1;
    KEY = hashU(C.seed) ^ hashU(HOME); KZ = Math.imul(KEY, 0x9e3779b1);
    C.segs = []; C.feats.clear(); chunks.clear(); integ.clear(); rng = RNG(FIRST ^ KEY); planned = 0; lastTypes = []; deck = []; pairs = [];
    hand = []; dealt = []; toss = RNG(KEY + TOSS);
    const tv = typeof Variants !== 'undefined' ? Variants.val : {};
    C.lv = TERR_LV[tv.tdiff] ? tv.tdiff : 'b'; LV = tv.terr === 'b' ? TERR_LV[C.lv] : null; C.rich = !!LV; C.isl = LV ? LV.isl : 1;
    trng = RNG((KEY ^ 0x7e4a11) + 131 * C.lv.charCodeAt(0));
    planTo(4000);
    return C.seed;
  };
  C.reset = C.setSeed;

  // ---- the deal: which kind of run comes next. A deck holds every kind once and the two that bring speed and air, steeps and kickers,
  // twice. It is shuffled and played in that order, each time the first card that keeps the rules, and shuffled again if it will not go out:
  //   never one slow kind (glade, moguls, rollers, powder) straight after another;
  //   no kind again before five others have passed (three for the two that come twice), and those two once in each half of the deck;
  //   the mountain opens with the bowl, and its second or third run is the steeps: the first minute already has speed in it;
  //   and no join of the last deck over again (the one rule that is let go, when sixty shuffles have not kept it).
  // (DECK is written in an order that keeps the first three after any deck: what is played should no shuffle ever go out.)
  // It has a stream of its own (toss): what rng draws after it, the length of each run and its jumps, does not depend on how it deals.
  const DECK = 'steeps,glade,kickers,moguls,gully,rollers,steeps,bowl,powder,kickers,ridge'.split(','), SLOW = { glade: 1, moguls: 1, rollers: 1, powder: 1 }, TWICE = { steeps: 1, kickers: 1 }, TOSS = 57;
  let hand = [], dealt = [], toss = rng;
  function deal() {
    if (!dealt.length) hand = ['bowl'];
    else if (!hand.length) {
      const first = dealt.length === 1, half = first ? 4 : 5, was = dealt.slice(-12).join('>'), at = first && toss() < 0.5 ? 0 : 1;
      for (let n = 0; ; n++) {
        const pool = DECK.filter(t => t !== 'bowl' || !first), a = dealt.slice(-5); hand = [];
        if (n > 600) { hand = pool; break; }
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(toss() * (i + 1)), t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
        const fits = t => {
          const i = hand.length, p = a[a.length - 1];
          return !(SLOW[t] && SLOW[p]) && !a.slice(TWICE[t] ? -3 : -5).includes(t) && !(TWICE[t] && (i < half) === hand.includes(t))
            && !(first && i < 2 && (i === at) !== (t === 'steeps')) && !(n < 60 && was.includes(p + '>' + t));
        };
        for (let k; (k = pool.findIndex(fits)) >= 0;) { const t = pool.splice(k, 1)[0]; hand.push(t); a.push(t); }
        if (!pool.length) break;
      }
    }
    const t = hand.shift(); dealt.push(t); return t;
  }

  function planTo(sEnd) {
    while (planned < sEnd) {
      // every kind of run comes round once before any comes again (a shuffled deck), never before five others have passed, and where
      // there is a choice not straight after the kind it followed last time (so no stretch of the mountain is the last lap over again)
      let type;
      if (C.segs.length === 0) type = 'bowl';
      else {
        if (!deck.length) { deck = Object.keys(SEG_TYPES); for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)), t = deck[i]; deck[i] = deck[j]; deck[j] = t; } if (C.segs.length === 1) deck.splice(deck.indexOf('bowl'), 1); }
        const prev = lastTypes[lastTypes.length - 1]; let k = -1;
        for (let i = deck.length - 1; i >= 0; i--) { if (lastTypes.includes(deck[i])) continue; if (k < 0) k = i; if (!pairs.includes(prev + '>' + deck[i])) { k = i; break; } }
        if (k < 0) k = deck.length - 1;
        type = deck.splice(k, 1)[0]; pairs.push(prev + '>' + type); if (pairs.length > 18) pairs.shift();
      }
      // (that was the deal of the first mountain. It still runs, so that rng goes on drawing what it drew, but it is played only when
      // C.classic asks for that mountain's own order: the test scripts' way back to the mountain as it was delivered)
      if (!C.classic) type = deal();
      if (C.forceType) type = C.forceType;
      lastTypes.push(type); if (lastTypes.length > 5) lastTypes.shift();
      const base = SEG_TYPES[type], p = {}, v = () => 0.85 + rng() * 0.3;
      for (const k of SEG_KEYS) p[k] = base[k];
      p.slope *= 0.93 + rng() * 0.14; p.hw *= v(); p.rollL *= v(); p.rollA *= v(); p.gAmp *= v(); p.gul *= v(); p.mean *= v();
      if (LV) { p.slope = Math.min(0.68, p.slope * LV.slope); p.hw *= LV.hw; p.mog *= LV.mog; p.rollA *= Math.min(1, LV.slope); }
      let len = C.segs.length === 0 ? 590 : SEG_PACE[type] * (27 + rng() * 6);       // about half a minute each
      if (LV && C.segs.length) len *= LV.pace;
      const seg = { type, s0: planned, len, p, idx: C.segs.length, seed: (rng() * 1e9) | 0 };
      C.segs.push(seg);
      if (p.kick > 0) {   // a line of jumps down the middle, alternating sides slightly; a pair of young spruce marks each lip (mark)
        const n = Math.floor((len - 160) / 105);
        for (let i = 0; i < n; i++) addFeat({ s: seg.s0 + 90 + i * 105 + rng() * 20, u: (rng() - 0.5) * 14, len: 17 + rng() * 4, wid: 11.5 + rng() * 3, h: 2.0 + rng() * 0.7, kind: 'kicker', mark: true });
      }
      if (type === 'rollers' || type === 'powder' || type === 'bowl' && C.segs.length > 1) {
        const n = 1 + Math.floor(rng() * 2);
        for (let i = 0; i < n; i++) addFeat({ s: seg.s0 + 120 + rng() * (len - 240), u: (rng() - 0.5) * 30, len: 12, wid: 10, h: 1.1 + rng() * 0.6, kind: 'kicker' });
      }
      if (LV) enrich(seg, type);
      planned += len;
    }
  }
  // ---- the richer mountain (Variants 'terr' b): what one run gets, all drawn from trng
  function enrich(seg, type) {
    const k = TERR_K[type], p = seg.p, r = trng, s1 = seg.s0 + seg.len, from = seg.idx === 0 ? 240 : seg.s0 + 50, to = s1 - 60;
    // the pitch: easier and steeper stretches one after another, each 60-150 m. Where it steepens the snow rolls over (drawn out over
    // 24-38 m: quicker, it threw a fast skier metres into the air), where it eases it is drawn out too (a bench, no slam into it). The stretches are scaled so the run falls as
    // far as it did; no stretch is steeper than 36 degrees or flat enough to stall on
    const A = LV.pitch * k[0];
    if (A > 0.01) {
      const pk = []; let s = from + r() * 30, up = r() < 0.5 ? 1 : -1;
      while (s < to - 60) { pk.push({ s, m: 1 + up * A * (0.55 + 0.45 * r()), tl: up > 0 ? 24 + r() * 14 : 18 + r() * 16 }); s += 60 + r() * 90; up = -up; }
      if (pk.length) {
        pk.push({ s: Math.min(s, to), m: 1, tl: 24 });
        let a = 0, w = 0; for (let i = 0; i < pk.length - 1; i++) { const L = pk[i + 1].s - pk[i].s; a += pk[i].m * L; w += L; }
        for (let i = 0; i < pk.length - 1; i++) pk[i].m = clamp(pk[i].m * w / a, 0.16 / p.slope, 0.72 / p.slope);
        seg.pk = pk;
      }
    }
    // the sides: stretches of 70-150 m that are plain, lean to one side (off-camber), or have one edge curled up into a wall (a side hit)
    if (k[1] > 0) {
      const xs = []; let s = from + r() * 40;
      while (s < to - 50) {
        const q = r(), a = r() < 0.5 ? -1 : 1, b = r() < 0.5 ? -1 : 1, ta = 0.6 + 0.4 * r(), tb = 0.6 + 0.4 * r();
        xs.push({ s, tilt: q > 0.3 && q < 0.6 || q > 0.9 ? a * LV.tilt * k[1] * ta : 0, bank: q > 0.6 ? b * LV.bank * k[1] * tb : 0 });
        s += 70 + r() * 80;
      }
      if (xs.length) { xs.push({ s: Math.min(s, to), tilt: 0, bank: 0 }); seg.xs = xs; }
    }
    // rock. Drops first: a ledge 8-15 m wide set toward one edge (the rest of the run goes round it), a run-in that rises gently
    // onto it, and below the face a landing that is steeper than the run, so the skis come down along the snow, not onto it
    const R = LV.rocks * k[2];
    if (LV.drops > 0 && k[2] >= 0.6 && p.hw > 20 && !p.kick) {
      const n = Math.floor(LV.drops * k[2] + r());
      for (let i = 0; i < n; i++) {
        const D = LV.dropH[0] + r() * (LV.dropH[1] - LV.dropH[0]), wid = 8 + r() * 7, side = r() < 0.5 ? -1 : 1;
        const u = side * (p.hw - wid * 0.5 - 2 - r() * 5), sl = Math.max(from + 60, 700) + r() * Math.max(1, to - Math.max(from + 60, 700) - 60);
        if (sl > to - 60) continue;
        if (busy(sl - 80, sl + 50, u, wid * 0.5 + 6)) continue;
        addFeat({ s: sl - 40, len: 58, lip: sl, u, wid, h: D, kind: 'drop' });
      }
    }
    // boulders, capped with snow: most along the edges of the run, some out on it (never down its middle). The uphill side is long and
    // rounded, so a skier who rides onto one is lifted off it, not stopped; the sides and the downhill face are steep, and that is where
    // the rock shows
    if (R > 0.01) {
      const n = Math.floor(R * (seg.len / 110) * (0.6 + 0.8 * r()));
      for (let i = 0; i < n; i++) {
        let sc = from + r() * Math.max(1, to - from), edge = r() < 0.7 || p.hw < 24 || C.lv === 'a', side = r() < 0.5 ? -1 : 1;
        const g = r() < 0.3 ? 2 + Math.floor(r() * 2) : 1;
        let u = side * (edge ? p.hw * (0.66 + 0.3 * r()) : p.hw * (0.36 + 0.32 * r()));
        for (let j = 0; j < g; j++) {
          const rad = 1.2 + 1.8 * r(), h = (0.5 + 0.9 * r()) * (C.lv === 'c' ? 1.3 : 1) * Math.min(1, rad / 1.6);
          // (fewer than were first laid out, and almost none out on the run: every other group along the edges is left out, and of those out
          // on the run only a third on 野雪. The draws are all still made, so everything laid out after them stays where it was. Along the
          // edges they are not rock at all but mounds of firm, wind-packed snow, the stuff moguls are made of: f.snow, no rock shows)
          const keep = edge ? (i & 1) === 0 : C.lv === 'c' && i % 3 === 0;
          if (keep && !busy(sc - rad - 6, sc + rad + 6, u, rad + 3)) addFeat({ s: sc - 2.2 * rad, len: 3.4 * rad, cs: sc, u, rad, h: edge ? h * 0.75 : h, kind: 'rock', snow: edge });
          sc += (r() - 0.3) * 7; u += (r() - 0.5) * 6;
        }
      }
    }
    // other ways down: lanes that leave the run, go their own way for a while beside it and come back. Each is a clear way through the
    // forest of the apron (no trees on it, its own floor: the banks climb only beyond its edges), so whatever opening a skier sees, it goes
    // on down. Some are narrow ways among the trees, some are a gully with walls to ride. One or two on each side at a time, never on a ridge
    if (k[1] > 0 && seg.len > 260) {
      // (on each side a chain of lanes, one after another; the harder levels add a second, further out. LV.lanes: how many layers, the
      // fraction the chance that each lane of the last one is there at all)
      const ln = [];
      for (const side of [-1, 1]) for (let layer = 0; layer < Math.ceil(LV.lanes); layer++) {
        const pr = layer + 1 <= LV.lanes ? 1 : LV.lanes - layer;
        let s = seg.s0 + (seg.idx ? 10 : 260) + r() * 60;
        while (s < s1 - 120) {
          const L = 180 + r() * 200, kind = r() < 0.4 ? 'gully' : 'trees', w = kind === 'gully' ? 6 + r() * 3 : 4.5 + r() * 4;
          const off = side * (p.hw + w + 10 + r() * 14 + layer * (26 + r() * 12)), there = r() < pr;
          if (there) ln.push({ s0: s, s1: s + L, off, w, kind, ph: r() * 50, L1: 55 + r() * 30, L2: 60 + r() * 30 });
          s += L + 30 + r() * 90;
        }
      }
      if (ln.length) seg.ln = ln;
    }
  }
  // the lanes beside the run at s (null if none), and for one of them where its middle is, as an offset from the run's centre line
  // (a lane may run on past the end of its own run, into the next: a run's lanes are those it laid out and those of the run before)
  function lanesAt(s) { const sg = segAt(s); if (sg.lnAll === undefined) { const pv = sg.idx ? C.segs[sg.idx - 1].ln || [] : []; const a = (sg.ln || []).concat(pv); sg.lnAll = a.length ? a : null; } return sg.lnAll; }
  const laneU = (l, s) => l.off * smooth(l.s0, l.s0 + l.L1, s) * (1 - smooth(l.s1 - l.L2, l.s1, s)) + 5 * vnoise1(s / 85 + l.ph, 84) * smooth(l.s0, l.s0 + l.L1 * 1.5, s) * (1 - smooth(l.s1 - l.L2 * 1.5, l.s1, s));
  // how far beyond the nearest way down a point is: the edge of the run, or of a lane beside it (metres, negative inside). _lg: how deep in a
  // gully lane the point lies (0..1)
  let _lg = 0, _lb = 0, _lh = 0;
  function edgeE(s, u, e, hw) {
    _lg = 0; _lb = 0; _lh = 0; const e0 = e; const ln = LV ? lanesAt(s) : null; if (!ln) return e;
    for (let i = 0; i < ln.length; i++) {
      const l = ln[i]; if (s < l.s0 || s > l.s1) continue;
      const ul = laneU(l, s), d = Math.abs(u - ul), el = d - l.w;
      // (the island and the gully's trough come and go along the whole of the lane's leaving and its return, never faster: grown only as
      // fast as the lane moved out, they rose a metre or more in a few metres of run, a ramp beside the edge that threw a skier)
      const ks = smooth(l.s0 + 0.2 * l.L1, l.s0 + 1.3 * l.L1, s) * (1 - smooth(l.s1 - 1.3 * l.L2, l.s1 - 0.2 * l.L2, s));
      // (the nearer of the two edges, but rounded where they are about as near: a plain min has a crease along the middle of an island,
      // and everything laid on e (the apron's rise, the banks) would stand up into a sharp crest there, which throws a skier crossing it)
      { const k = 8, q = Math.max(0, k - Math.abs(e - el)) / k; e = Math.min(e, el) - q * q * k * 0.25; }
      // (between the run and a lane that has left it: an island. _lh: its swell, round from one edge to the other, highest in the middle
      // and never steeper than a gentle roll, so crossing it lifts a skier no more than a wave in the snow)
      if (e0 > 0 && el > 0 && u * ul > 0 && Math.abs(u) < Math.abs(ul)) {
        const k = smooth(hw, hw + l.w + 8, Math.abs(ul)) * ks, W = e0 + el; _lb = Math.max(_lb, k);
        _lh = Math.max(_lh, k * (4 * e0 * el / (W * W)) * Math.min(1, W / 36));
      }
      // (a gully lane is a trough only once it is clear of the run: it shallows out as it leaves and as it comes back, never cuts the run)
      if (l.kind === 'gully' && d < l.w * 2.6) { const q = d / (l.w * 1.35); _lg = Math.max(_lg, Math.exp(-q * q) * smooth(l.w * 2.6, l.w * 1.5, d) * smooth(hw + 2, hw + 2 * l.w + 6, Math.abs(ul)) * ks); }
    }
    return e;
  }
  // the ways down at s, as offsets from the run's centre line: the run (0) and each lane that has left it by then (for test pilots)
  C.ways = function (s) { const out = [0], ln = LV ? lanesAt(s) : null; if (ln) for (const l of ln) if (s > l.s0 + 20 && s < l.s1 - 20) out.push(laneU(l, s)); return out; };
  // (for the game) how far off any way down the skier is: 0 or less on the run or in a lane
  C.offRun = function (x, z) { const s = -z, c = at(s, _py), u = x - c.cx; return edgeE(s, u, Math.abs(u) - c.hw, c.hw); };
  // anything already standing within [sa, sb] down the run and `room` metres of u across it?
  function busy(sa, sb, u, room) {
    for (let b = Math.floor((sa - 30) / 32); b <= Math.floor(sb / 32); b++) for (const f of C.feats.get(b) || []) {
      const fa = f.s, fb2 = f.s + f.len, half = f.kind === 'rock' ? f.rad : (f.wid || 10) * 0.5;
      if (fb2 > sa && fa < sb && Math.abs(f.u - u) < room + half) return true;
    }
    return false;
  }
  // the pitch at s, as a factor on the run's own slope (1 where nothing was laid out)
  function pitchAt(s) {
    const pk = segAt(s).pk; if (!pk) return 1;
    let m = 1;
    for (let i = 0; i < pk.length; i++) { const q = pk[i], h = q.tl * 0.5; if (s < q.s - h) break; const m0 = i ? pk[i - 1].m : 1; m = m0 + (q.m - m0) * smooth(q.s - h, q.s + h, s); }
    return m;
  }
  // the sides at s: [lean across the run, height of the wall on one edge (signed: + on the right)], changing over 36 m
  const _sd = [0, 0];
  function sideAt(s) {
    const xs = segAt(s).xs; _sd[0] = 0; _sd[1] = 0; if (!xs) return _sd;
    for (let i = 0; i < xs.length; i++) {
      const q = xs[i]; if (s < q.s - 18) break;
      const w = smooth(q.s - 18, q.s + 18, s), t0 = i ? xs[i - 1].tilt : 0, b0 = i ? xs[i - 1].bank : 0;
      _sd[0] = t0 + (q.tilt - t0) * w; _sd[1] = b0 + (q.bank - b0) * w;
    }
    return _sd;
  }
  const dropLip = (f, du) => 1.6 * vnoise1(du / 3.3 + f.lip * 0.17, 81) + 0.6 * vnoise1(du / 1.1 + f.lip * 0.29, 82);
  // trees keep clear of a drop (its run-in, face and landing) and stand off a boulder
  function clearAt(s, u) {
    const fb = C.feats.get(Math.floor(s / 32)); if (!fb) return 1;
    let k = 1;
    for (let i = 0; i < fb.length; i++) {
      const f = fb[i];
      if (f.kind === 'drop') { if (s > f.s - 6 && s < f.s + f.len + 22) k = Math.min(k, smooth(f.wid * 0.5 + 4, f.wid * 0.5 + 10, Math.abs(u - f.u))); }
      else if (f.kind === 'rock') k = Math.min(k, smooth(f.rad + 0.5, f.rad + 3, Math.hypot(s - f.cs, u - f.u)));
    }
    return k;
  }
  // where a boulder shows bare rock (0..1; the terrain shader bares only what is steep within it). A drop stays snow: a ledge with a
  // rounded, wind-packed lip (bare rock on its face was tried and read as a dark slab)
  C.rockAt = function (x, z) {
    if (!LV) return 0;
    const s = -z, fb = C.feats.get(Math.floor(s / 32)); if (!fb) return 0;
    let u = null, k = 0;
    for (let i = 0; i < fb.length; i++) {
      const f = fb[i]; if (f.kind !== 'rock' || f.snow) continue;
      if (u === null) u = x - at(s, _py).cx;
      k = Math.max(k, smooth(1.2, 0.85, Math.hypot((s - f.cs) * (s < f.cs ? 0.45 : 1), u - f.u) / f.rad));
    }
    return k;
  };
  // (for the game) a boulder is something to go round, not a ramp: the skier's body is told only of a low swell where one stands (C.rockCap,
  // set while the physics asks), and where the drawn rock stands more than ROCK_WALL above the snow it is a wall, as a trunk is. rockHit
  // fills o with the point on that wall's foot nearest the skier and its outward normal, and returns the rock (null where there is none)
  const ROCK_WALL = 0.45;
  function rockQ0(f) {        // the q at which the drawn rock stands ROCK_WALL high (its profile falls from the middle out)
    if (f.q0 === undefined) { let a = 0, b = 1; for (let i = 0; i < 18; i++) { const q = (a + b) * 0.5, hr = f.h * (0.45 * Math.sqrt(1 - q * q) + 0.55 * smooth(1, 0.5, q)); if (hr > ROCK_WALL) a = q; else b = q; } f.q0 = f.h > ROCK_WALL ? a : 0; }
    return f.q0;
  }
  C.rockHit = function (x, z, o) {
    if (!LV) return null;
    const s = -z, fb = C.feats.get(Math.floor(s / 32)); if (!fb) return null;
    const c = at(s, _py), u = x - c.cx;
    for (let i = 0; i < fb.length; i++) {
      const f = fb[i]; if (f.kind !== 'rock' || f.snow) continue;
      const q0 = rockQ0(f); if (q0 <= 0) continue;
      const k = s < f.cs ? 0.45 : 1, ds = (s - f.cs) * k, du = u - f.u, q = Math.hypot(ds, du) / f.rad;
      if (q >= q0) continue;
      const g = q > 1e-4 ? q0 / q : 0, gs = q > 1e-4 ? ds : -1, gu = q > 1e-4 ? du : 0;
      o.x = c.cx + f.u + (q > 1e-4 ? du * g : 0); o.z = -(f.cs + (q > 1e-4 ? ds * g : -q0 * f.rad) / k);
      let nx = gu, nz = -gs * k; const l = Math.hypot(nx, nz) || 1; o.nx = nx / l; o.nz = nz / l; o.h = f.h;
      return f;
    }
    return null;
  };
  function addFeat(f) { const b0 = Math.floor((f.s - 4) / 32), b1 = Math.floor((f.s + f.len + 30) / 32); for (let b = b0; b <= b1; b++) { let a = C.feats.get(b); if (!a) C.feats.set(b, a = []); a.push(f); } }

  function segAt(s) {
    if (s < 0) return C.segs[0];
    if (s >= planned) planTo(s + 3000);
    let lo = 0, hi = C.segs.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (C.segs[m].s0 <= s) lo = m; else hi = m - 1; }
    return C.segs[lo];
  }
  C.segAt = segAt;
  const TR = 90;   // transition length between segments (m)
  const APRON = 36;      // (the richer mountain) metres of open slope beside the run before its banks climb
  const _pp = {};
  function paramsAt(s, out) {
    const sg = segAt(s), a = sg.p; let b = null, t = 0;
    const d0 = s - sg.s0, d1 = sg.s0 + sg.len - s;
    if (d0 < TR / 2 && sg.idx > 0) { b = C.segs[sg.idx - 1].p; t = 0.5 - 0.5 * smoother(0, TR / 2, d0); }
    else if (d1 < TR / 2) { if (sg.idx + 1 >= C.segs.length) planTo(s + 3000); b = C.segs[sg.idx + 1].p; t = 0.5 - 0.5 * smoother(0, TR / 2, d1); }
    if (b) for (const k of SEG_KEYS) out[k] = a[k] + (b[k] - a[k]) * t; else for (const k of SEG_KEYS) out[k] = a[k];
    return out;
  }
  C.paramsAt = paramsAt;

  // the valley's walls belong to the mountain, not to the stretch of run below them: they stand at full height everywhere except along a
  // ridge, where they draw back, and that change is spread over the better part of a kilometre (a weighted mean of what the run does)
  function wallAt(s) {
    let a = 0, wt = 0;
    for (let k = -4; k <= 4; k++) { const w = 5 - Math.abs(k); a += w * paramsAt(s + k * 112.5, _pw).ridge; wt += w; }
    return 1 - 0.72 * a / wt;
  }
  const _pw = {};
  // the land well off a ridge (the flank and the side valley below it) does not end where the crest does: it goes on falling away for some
  // nine hundred metres below, rising back to the banks of the run that follows only as fast as the mountain falls. So the side valley
  // drains back toward the run instead of ending in a closed basin, and a skier who has gone down into it is led back by the land
  // (rtail: the ridge as it was up to that far above, fading with the distance)
  function tailAt(s) {
    let r = 0;
    for (let k = 0; k <= 36; k++) r = Math.max(r, paramsAt(s - k * 25, _pw).ridge * (1 - smooth(0, 900, k * 25)));
    return r;
  }
  function chunk(ci) {
    let c = chunks.get(ci); if (c) return c;
    // integrate from the previous chunk (build sequentially so running sums stay continuous)
    let st;
    if (ci === 0) st = { baseY: 0, rollPh: 0, gPh: 0 };
    else if (ci < 0) { st = null; }
    else { if (!integ.has(ci)) chunk(ci - 1); st = integ.get(ci); }
    c = new Float32Array((CH + 1) * NF); const base64 = new Float64Array(CH + 1);
    if (ci < 0) {   // above the start: a plain constant slope so there is something behind the camera
      const p = paramsAt(0, _pp);
      for (let i = 0; i <= CH; i++) { const s = ci * CH + i, o = i * NF; base64[i] = -p.slope * s; c[o + F.cx] = centre(0, p.mean); c[o + F.hw] = p.hw; c[o + F.dish] = p.dish; c[o + F.shoulder] = p.shoulder; c[o + F.gw] = p.gw; c[o + F.forest] = p.forest; c[o + F.powder] = p.powder; c[o + F.wall] = wallAt(Math.max(0, s)); c[o + F.rtail] = 0; }
    } else {
      let y = st.baseY, rph = st.rollPh, gph = st.gPh;
      // how tall the valley's walls stand: worked out every 32 m, the metres between are filled in below
      const W32 = new Float32Array(CH / 32 + 1); for (let j = 0; j <= CH / 32; j++) W32[j] = wallAt(ci * CH + j * 32);
      for (let i = 0; i <= CH; i++) { const j = Math.min(CH / 32 - 1, i >> 5), f = (i - j * 32) / 32; c[i * NF + F.wall] = W32[j] + (W32[j + 1] - W32[j]) * f; }
      const T32 = new Float32Array(CH / 32 + 1); for (let j = 0; j <= CH / 32; j++) T32[j] = tailAt(ci * CH + j * 32);
      for (let i = 0; i <= CH; i++) { const j = Math.min(CH / 32 - 1, i >> 5), f = (i - j * 32) / 32; c[i * NF + F.rtail] = T32[j] + (T32[j + 1] - T32[j]) * f; }
      for (let i = 0; i <= CH; i++) {
        const s = ci * CH + i, o = i * NF, p = paramsAt(s, _pp);
        base64[i] = y; c[o + F.cx] = centre(s, p.mean); c[o + F.hw] = p.hw; c[o + F.dish] = p.dish; c[o + F.shoulder] = p.shoulder; c[o + F.gul] = p.gul; c[o + F.gw] = p.gw;
        c[o + F.goff] = p.gAmp * Math.sin(gph); c[o + F.roll] = p.rollA * Math.sin(rph); c[o + F.mog] = p.mog; c[o + F.forest] = p.forest; c[o + F.glade] = p.glade; c[o + F.powder] = p.powder; c[o + F.ridge] = p.ridge;
        if (LV) { const sd = sideAt(s), nr = 1 - p.ridge; c[o + F.tilt] = sd[0] * nr; c[o + F.bank] = sd[1] * nr; }
        if (i < CH) { const p2 = paramsAt(s + 0.5, _pp); if (LV) y -= p2.slope * pitchAt(s + 0.5); else y -= p2.slope; rph += TAU / p2.rollL; gph += TAU / 78; }
      }
      integ.set(ci + 1, { baseY: y, rollPh: rph, gPh: gph });
    }
    c.base64 = base64; chunks.set(ci, c);
    if (chunks.size > 12) { const k = chunks.keys().next().value; if (k !== ci) chunks.delete(k); }
    return c;
  }
  // course centreline: the valley winds. Broad bends a kilometre or so long that belong to the mountain (whatever the run is doing), and a
  // quicker wander on top that each kind of run has more or less of. So the view down the valley, and where the sun stands in it, keep changing
  const bend = (s) => 260 * vnoise1(s / 1300 + 3.7, C.seed), wander = (s) => 60 * vnoise1(s / 370 + 11.3, C.seed + 5);
  function centre(s, mean) { return (bend(s) - bend(0) + mean * (wander(s) - wander(0))) * smooth(0, 400, s); }
  // which way the valley runs at s: the angle of its centre line off straight down the mountain (radians, positive toward +x)
  const _py = {};
  C.yawAt = function (s) { const a = at(s - 5, _py).cx; return Math.atan2(at(s + 35, _py).cx - a, 40); };

  const cur = { baseY: 0, cx: 0, hw: 40, dish: 0, shoulder: 0.3, gul: 0, gw: 10, goff: 0, roll: 0, mog: 0, forest: 0, glade: 0, powder: 0, ridge: 0, wall: 1, rtail: 0, tilt: 0, bank: 0, s: 0 };
  function at(s, out) {
    out = out || cur;
    const ci = Math.floor(s / CH), c = chunk(ci), fs = s - ci * CH, i = Math.min(CH - 1, Math.floor(fs)), f = fs - i, o = i * NF, o2 = o + NF;
    out.baseY = c.base64[i] + (c.base64[i + 1] - c.base64[i]) * f;
    out.cx = c[o + 1] + (c[o2 + 1] - c[o + 1]) * f; out.hw = c[o + 2] + (c[o2 + 2] - c[o + 2]) * f; out.dish = c[o + 3] + (c[o2 + 3] - c[o + 3]) * f;
    out.shoulder = c[o + 4] + (c[o2 + 4] - c[o + 4]) * f; out.gul = c[o + 5] + (c[o2 + 5] - c[o + 5]) * f; out.gw = c[o + 6] + (c[o2 + 6] - c[o + 6]) * f;
    out.goff = c[o + 7] + (c[o2 + 7] - c[o + 7]) * f; out.roll = c[o + 8] + (c[o2 + 8] - c[o + 8]) * f; out.mog = c[o + 9] + (c[o2 + 9] - c[o + 9]) * f;
    out.forest = c[o + 10] + (c[o2 + 10] - c[o + 10]) * f; out.glade = c[o + 11] + (c[o2 + 11] - c[o + 11]) * f; out.powder = c[o + 12] + (c[o2 + 12] - c[o + 12]) * f; out.ridge = c[o + 13] + (c[o2 + 13] - c[o + 13]) * f;
    out.wall = c[o + 14] + (c[o2 + 14] - c[o + 14]) * f; out.rtail = c[o + 15] + (c[o2 + 15] - c[o + 15]) * f;
    out.tilt = c[o + 16] + (c[o2 + 16] - c[o + 16]) * f; out.bank = c[o + 17] + (c[o2 + 17] - c[o + 17]) * f;
    out.s = s; return out;
  }
  C.at = at;

  // the large shapes of the mountain away from the run: ridges, peaks and the walls of the valley (e = distance beyond the edge of the run)
  function relief(x, z, e, cell) {
    const m = smooth(30, 900, e), mx = x / 1400, mz = z / 1400;
    const r1 = 1 - Math.abs(vnoise2(mx, mz, 71)), r2 = 1 - Math.abs(vnoise2(mx * 2.3 + 5.1, mz * 2.3, 72)), r3 = 1 - Math.abs(vnoise2(mx * 5.1, mz * 5.1 + 2.2, 73));
    return m * m * (r1 * r1 * 520 + r2 * r2 * 170 + (cell < 40 ? r3 * r3 * 60 : 30)) * (0.35 + 0.65 * smooth(0, 1500, e + 400 * vnoise2(mz * 0.7, mx * 0.7, 74)));
  }
  // gullies: in every cell of a jittered grid a cosine wave is laid ACROSS the slope (wave vector d = the slope turned a quarter turn)
  // and neighbouring cells are blended, so the crests run straight down the fall line and bend as the mountain turns. Writes
  // _er = [value -1..1, d/dx, d/dz]; feeding those derivatives back into d makes the next, finer set join the first like tributaries.
  const _er = [0, 0, 0];
  function gullies(px, pz, dx, dz, seed) {
    const ix = Math.floor(px), iz = Math.floor(pz), fx = px - ix - 0.5, fz = pz - iz - 0.5;
    let v = 0, gx = 0, gz = 0, wt = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      let n = Math.imul(ix + i, 374761393) ^ Math.imul(iz + j, 668265263) ^ seed ^ KEY; n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16;
      const qx = fx - i - ((n & 0xffff) / 65536 - 0.5) * 0.5, qz = fz - j - ((n >>> 16) / 65536 - 0.5) * 0.5;
      const d = 1 - (qx * qx + qz * qz) / 1.5625; if (d <= 0) continue;
      const wgt = d * d * d, ph = (qx * dx + qz * dz) * TAU, sn = Math.sin(ph);
      v += Math.cos(ph) * wgt; gx -= sn * dx * wgt; gz -= sn * dz * wgt; wt += wgt;
    }
    wt = 1 / wt; _er[0] = v * wt; _er[1] = gx * wt; _er[2] = gz * wt;
  }

  // ---- the height field.  cell = sampling spacing of the caller (m); wavelengths the caller cannot resolve are skipped.
  C.height = function (x, z, cell) {
    const s = -z, c = at(s), u = x - c.cx, au = Math.abs(u), hw = c.hw;
    let h = c.baseY;
    const e = LV ? edgeE(s, u, au - hw, hw) : au - hw, lg = _lg, lh = _lh;
    // (the richer mountain: the dish levels off into the apron gently instead of at a crease, which was a lip just outside the run's edge)
    { const r = au / hw, r1 = r - 1; h += c.dish * (!LV ? Math.min(1.6, (u * u) / (hw * hw)) : r1 < 0 ? r * r : r1 < 0.6 ? 1 + 2 * r1 - r1 * r1 / 0.6 : 1.6); }
    // (the richer mountain) a run that leans to one side, and one edge curled up into a wall: concave at its foot, rounded over at its top
    if (c.tilt !== 0) h += c.tilt * u / Math.sqrt(1 + u * u / (1.44 * hw * hw));
    // (it rises from 0.45 of the half-width and rolls over into a rounded shoulder 0.65 beyond the edge: no crease at its top, where a
    // wall that only rose to the edge and stopped was a lip that threw whoever rode up it. Its curve changes smoothly all the way, so
    // riding up it and over the top takes a lateral speed no skier carries to leave the snow)
    if (c.bank !== 0) { const x = sat(((c.bank > 0 ? u : -u) / hw - 0.45) / 1.2); h += Math.abs(c.bank) * x * x * x * (10 - 15 * x + 6 * x * x); }
    // forested banks either side of the run, each stretch of the run with its own; on a ridge they fall away instead. Farther out they
    // level off into the valley's own walls, which do not care what the run below is doing
    // (from fifteen metres out the land answers less to the ridge here and more to the ridge above: c.rtail)
    const rf = e > 15 ? c.ridge + (c.rtail - c.ridge) * smooth(15, 60, e) : c.ridge;
    if (e > 0) {
      // (the richer mountain: an apron of open, skiable slope first, rising only five centimetres a metre, before the banks begin to climb.
      // Whoever leaves the run keeps going down the mountain instead of traversing a bank that tips them back. Not along a ridge)
      const ap = LV ? APRON * (1 - rf) : 0, ea = e - ap > 0 ? e - ap : 0;
      if (ap > 0) h += 0.05 * (e < ap ? e : ap);
      const t = ea / 55, rise = 55 * (t * t / (1 + t)), near = 150 * (1 - Math.exp(-rise / 150));
      // a ridge: beside the crest the snow falls away steeply into hollows some twenty metres down, and rises again to a rim a hundred and
      // seventy metres out, still well below the crest (the view goes on over it); beyond the rim the mountainside falls away for good. The
      // hollows lie one below another down the mountain: each one's floor climbs, more slowly than the mountain falls, to a shoulder level
      // with the crest, and the next drops away below it. Whoever leaves the crest goes down into a hollow, as gravity says; the rim holds
      // the skier, and the shoulder at its end, never more than two hundred and forty metres on, carries the skier back up level with the
      // run without a climb. The last hollow runs on past the end of the ridge, growing shallower, until it meets the run below
      // (rh: the ridge, and for three hundred metres below it a fading memory of it; q: where in its hollow, 0 at the shoulder)
      const ph = (s / 240) % 1, q = ph < 0.8 ? 0.5 + 0.5 * Math.cos(PI * ph / 0.8) : 0.5 - 0.5 * Math.cos(PI * (ph - 0.8) / 0.2);
      const rh = Math.max(c.ridge, sat((c.rtail - 0.74) / 0.26)) * q, ef = Math.max(0, e - 170), tf = ef / 55, riseF = 55 * (tf * tf / (1 + tf));
      h += near * c.shoulder * (1 - rf) - rh * (20 * (1 - Math.exp(-e * e / 1300)) - 9 * smooth(100, 170, e)) - rf * (0.62 * Math.exp(-ef / 260) * riseF + 11 * (1 - Math.exp(-ef * ef / 400))) + 0.36 * c.wall * (rise - near);
    }
    // big mountain relief far from the run (side walls, peaks)
    if (e > 30) {
      const m = smooth(30, 900, e);
      let hm = relief(x, z, e, cell);
      const w = smooth(70, 420, e);
      // gullies and the ribs between them, cut straight down the fall line of the large shapes
      if (w > 0.01) {
        const sg = u > 0 ? 1 : -1, D = 24;
        const gx = (relief(x + D, z, e + sg * D, cell) - hm) / D + sg * lerp(c.shoulder * (1 - rf), 0.36 * c.wall, smooth(60, 300, e)), gz = (relief(x, z + D, e, cell) - hm) / D + 0.36;
        const sl = Math.hypot(gx, gz), K = 1.7 * Math.min(1, 1.4 / (sl + 1e-6)), dx = gz * K, dz = -gx * K;
        // four sizes, each bent by the ones before it: buttresses and the great couloirs between them, then gullies, then runnels
        gullies(x / 700 + 3.9, z / 700 + 8.2, dx, dz, 1213);
        let g = 52 * m * (1.27 - 2 * Math.sqrt(Math.max(0, 0.5 - 0.5 * _er[0]))), ex = _er[1] * 0.5, ez = _er[2] * 0.5;      // sharp ribs, round gully floors
        if (cell <= 40) { gullies(x / 260, z / 260, dx + ez * 1.4, dz - ex * 1.4, 911); g += 22 * (1.27 - 2 * Math.sqrt(Math.max(0, 0.5 - 0.5 * _er[0]))); ex += _er[1]; ez += _er[2]; }
        if (cell <= 16) { gullies(x / 124 + 17.3, z / 124 - 5.1, dx + ez * 1.4, dz - ex * 1.4, 577); g += 10 * (1.27 - 2 * Math.sqrt(Math.max(0, 0.5 - 0.5 * _er[0]))); ex += _er[1] * 1.05; ez += _er[2] * 1.05; }
        if (cell <= 4) { gullies(x / 59 - 8.7, z / 59 + 31.9, dx + ez * 1.4, dz - ex * 1.4, 353); g += 4.2 * (1.27 - 2 * Math.sqrt(Math.max(0, 0.5 - 0.5 * _er[0]))); }
        hm += w * smooth(0.2, 0.7, sl) * (0.35 + 0.65 * m) * g;
      }
      if (cell < 12 && m > 0.05) hm += m * 14 * vnoise2(x / 90, z / 90, 75) + (cell < 4 ? m * 4 * vnoise2(x / 23, z / 23, 76) : 0);
      if (w > 0.01 && cell <= 20) {
        // rock bands: benches where the snow lies, steep risers between them where it cannot. They are cut along the beds of the rock
        // (C.strata), the same number the terrain shader reads for its ledges and layers, so mesh and shading agree
        const t = C.strata(x, h + hm, z), ft = Math.floor(t), fr = t - ft;
        // every bed makes its own cliff: tall and sheer along one stretch, hardly a step along the next
        const k = w * (0.10 + 0.74 * smooth(-0.3, 0.3, vnoise2((x + z) / 260 + ft * 3.31, (x - z) / 700 + ft * 1.73, 79)));
        hm += (smooth(0.22, 0.78, fr) - fr) * 64 * k;
      }
      h += hm;
    }
    if (c.gul > 0.01) { const ug = u - c.goff; h -= c.gul * Math.exp(-(ug * ug) / (c.gw * c.gw)); }
    if (lg > 0.001) h -= 2.4 * lg;
    if (lh > 0.001) h += 1.1 * lh;      // (an island between two ways down stands a little proud of both)
    // along a ridge the wind builds a lip of packed snow on either edge of the crest: it catches the low sun, and it turns a ski back
    // (the richer mountain: a low, broad drift instead, a lip a skier can run up and over without being thrown: 0.8 m over some twenty)
    if (c.ridge > 0.01) { const q = LV ? (au - hw - 4) / 10 : (au - hw - 1.5) / 4.2; if (q > -3 && q < 3) h += c.ridge * (LV ? 0.8 : 1.5) * Math.exp(-q * q) * (0.75 + 0.25 * vnoise1(s / 37, 41)); }
    if (c.roll !== 0) h += c.roll * smooth(hw * 1.5, hw * 0.7, au);
    if (c.mog > 0.01 && cell <= 1) {
      const M = MOGF[Variants.val.mogf] || MOGF.a;
      const row = s / M.L, r0 = Math.floor(row), ph = (r0 & 1) * 0.5 + M.J * vnoise1(r0 * 1.7, 9);
      const col = u / M.W + ph, b0 = 0.5 + 0.5 * Math.cos(col * TAU), q = row - r0;
      // (C.mogK: the skier's legs soak up half of every bump, so the body is told about a field half as tall as the one that is drawn)
      // each bump rises gently from above and drops off short and steep below, the way skis carve them; no two are the same size.
      // (M.R rounds the top: 2b - b^2 is the same bump with a broad crown and the trough between two bumps left a narrow rut, as skis cut them)
      const along = q < M.Q ? smooth(0, M.Q, q) : 1 - smooth(M.Q, 1, q), bx = b0 + M.R * (b0 - b0 * b0);
      const big = M.B0 + M.B1 * (hash2U(Math.floor(col + 0.5) + 4096, r0 + 4096) & 0xffff) / 65536;
      h += C.mogK * c.mog * M.H * big * bx * along * mogField(u, s, hw) - c.mog * 0.2;
    }
    // natural undulation
    h += 1.7 * vnoise2(x / 61, z / 61, 3);
    if (cell <= 12) h += 0.75 * vnoise2(x / 27, z / 27, 4);
    if (cell <= 5) h += 0.32 * vnoise2(x / 11.3, z / 11.3, 5);
    if (cell <= 1.2) h += 0.09 * vnoise2(x / 3.1, z / 6.3, 6) * (0.4 + c.powder);
    // kickers and other placed features
    const fb = C.feats.get(Math.floor(s / 32));
    if (fb) for (let i = 0; i < fb.length; i++) {
      const f = fb[i];
      if (f.kind === 'rock') {
        const q = Math.hypot((s - f.cs) * (s < f.cs ? 0.45 : 1), u - f.u) / f.rad;
        if (q < 1) { const hr = f.h * (0.45 * Math.sqrt(1 - q * q) + 0.55 * smooth(1, 0.5, q)); h += C.rockCap > 0 ? C.rockCap * (1 - Math.exp(-hr / C.rockCap)) : hr; }      // (round on top, steep but not sheer at the sides: a sheer one cannot be drawn without teeth)
        continue;
      }
      if (f.kind === 'drop') {
        // run-in rising onto the step, the face (it takes 0.65 of the height in a metre), then a landing that falls away 0.35 more over twelve
        // (the lip is not a ruled line: it wanders a metre or two either way across the step, and so do the step's two ends)
        const du = u - f.u, w2 = f.wid * 0.5 + 1.5 * vnoise1(f.lip * 0.31 + (du > 0 ? 3.1 : 7.7), 83);
        const lat = smooth(w2 + 4, w2 - 1, Math.abs(du)); if (lat <= 0) continue;
        const d = s - f.lip - dropLip(f, du), k = d < 0 ? smooth(f.s - f.lip, -4, d) : d < 1.4 ? 1 - 0.65 * smooth(0, 1.4, d) : 0.35 * (1 - smooth(1.4, 13, d));
        h += f.h * k * lat; continue;
      }
      const t = (s - f.s) / f.len; if (t < -0.2 || t > 2.6) continue;
      // (a marked jump is a built wedge, half as wide as the hump it replaces: its sides are shovelled and packed to a batter of about 45-55
      // degrees, rounded over at the shoulder and run out into the snow at the toe, as a park crew shapes them. The sides are what the eye
      // finds from above)
      const lat = f.mark ? smooth(f.wid * 0.5 + 3.3, f.wid * 0.5 - 0.3, Math.abs(u - f.u)) : smooth(f.wid, f.wid * 0.45, Math.abs(u - f.u)); if (lat <= 0) continue;
      let k;
      // run-in ramp. A marked jump is a built takeoff: it steepens all the way to its lip, so that with the sun ahead its face is in shade and
      // its edge is drawn against the lit snow beyond (the others are rounded humps that only unweight the skis)
      if (t < 1) k = t <= 0 ? 0 : f.mark ? Math.pow(t, 1.9) : t * t * (3 - 2 * t) * (0.55 + 0.45 * t);
      else { const q = (t - 1) * f.len, qb = f.mark ? 3.4 : 1.4; k = q < qb ? 1 - smooth(0, qb, q) * 1.25 : -0.25 * (1 - smooth(qb, 20, q)); }   // lip, then a dug-out landing (a marked one's back is packed to a slope too, not a wall)
      h += f.h * k * lat;
    }
    return h;
  };
  C.MOGF = MOGF; C.mogShape = () => MOGF[Variants.val.mogf] || MOGF.a;
  // where the bumps of a mogul field stand (0..1): across the run short of its edges, except along one smooth line that winds down
  // through them. That line is the fast way; the bumps either side of it are slow going and throw the skier about
  function mogField(u, s, hw) { return smooth(hw * 1.1, hw * 0.8, Math.abs(u)) * smooth(2.4, 6.5, Math.abs(u - 0.5 * hw * vnoise1(s / 105 + 7.3, C.seed + 31))); }
  C.bumps = function (x, z) { const c = at(-z, _py); return c.mog > 0.01 ? c.mog * mogField(x - c.cx, -z, c.hw) : 0; };
  // the lie of the rock: which bed of the mountain a point belongs to. Beds average 64 m but are not stacked plates: one is three or four
  // times the next, and how thick a bed is changes along the wall (the phase ph slides), so beds swell, pinch and nearly end. The warp
  // stays monotonic (its slope runs 0.39..1.61), so beds never cross. The dip is folded twice as hard as the plain y/64 cake had it.
  // Every term repeats over 1024 m in x, y and z (u + 16 per 1024 m of height; the warp's frequencies are whole turns per 16 beds), because
  // the shader only knows positions modulo that (strataAt in 04_terrain.js is the same function, term for term).
  C.strata = function (x, y, z) {
    const k = TAU / 1024;
    const u = y / 64 + 0.84 * Math.sin(k * (x + z) + 1.1 * Math.sin(k * (x - z) + 0.7)) + 0.32 * Math.sin(2 * k * x + 1.7 * Math.sin(k * z)) + 0.20 * Math.sin(3 * k * z + 1.3 * Math.sin(k * x) + 1.1) + 0.09 * Math.sin(4 * k * (x - z) + 2.0 * Math.sin(k * (x + z)));
    const ph = 2.1 * Math.sin(k * (x - z) + 0.4) + 1.3 * Math.sin(2 * k * z + 1.1 * Math.sin(k * x));
    return u + 0.22 * Math.sin(1.9634954 * u + 1.7 + ph) + 0.035 * Math.sin(5.1050881 * u + 0.6 - 0.8 * ph);
  };
  // how far up into the mountain's own country a point lies (0 on the run and its shoulders, 1 high on the walls)
  C.mountain = function (x, z) { const c = at(-z), u = x - c.cx, e = LV ? edgeE(-z, u, Math.abs(u) - c.hw, c.hw) : Math.abs(u) - c.hw; return smooth(30, 900, e); };
  const _g = [0, 0, 0];
  C.normal = function (x, z, d = 0.3) {
    const hx = C.height(x + d, z, 0.5) - C.height(x - d, z, 0.5), hz = C.height(x, z + d, 0.5) - C.height(x, z - d, 0.5);
    const nx = -hx / (2 * d), nz = -hz / (2 * d), l = Math.hypot(nx, 1, nz); _g[0] = nx / l; _g[1] = 1 / l; _g[2] = nz / l; return _g;
  };

  // ---- trees: one candidate per jittered grid cell, fully deterministic
  const _t = { x: 0, z: 0, h: 0, r: 0, variant: 0, rot: 0, ok: false }; let _ridge = 0;
  C.treeDensity = function (x, z) {
    const s = -z; if (s < -400) return 0; const c = at(s), u = x - c.cx, au = Math.abs(u), e = LV ? edgeE(s, u, au - c.hw, c.hw) : au - c.hw;
    let d = 0;
    if (e > 3) {
      const patch = 0.55 + 0.45 * vnoise2(x / 70, z / 70, 21);
      d = c.forest * smooth(3, 26, e) * smooth(-0.25, 0.25, patch - 0.42);
      // (the richer mountain) the apron is open forest: thinner, with lanes running down the fall line between the trees, so there is always a
      // way through (a lane is where a stretched noise crosses zero: a few metres wide, tens of metres long, joining and parting)
      if (LV && e < APRON + 40) {
        const ln = Math.abs(vnoise2(x / 13, z / 70, 28)) + 0.5 * Math.abs(vnoise2(x / 29, z / 140, 29));
        d *= (0.55 + 0.45 * smooth(APRON * 0.7, APRON + 40, e)) * smooth(0.08, 0.22, ln);
      }
      // (an island between the run and a lane is forest, thick enough that the two read as two ways)
      if (LV && _lb > 0) d = Math.max(d, c.forest * 0.9 * _lb * smooth(2, 5, e) * smooth(-0.35, 0.1, patch - 0.42));
      d *= 1 - smooth(260, 620, e + 120 * vnoise2(x / 300, z / 300, 22));       // tree line: bare snow and rock higher up the walls
      d *= 1 - c.ridge * smooth(0, 30, e);
    }
    if (c.glade > 0.01) {
      const lane = vnoise2(x / 19, z / 46, 23), cl = vnoise2(x / 55, z / 55, 24);
      const g = c.glade * smooth(0.02, 0.36, lane) * smooth(-0.5, 0.1, cl) * smooth(c.hw + 6, c.hw - 8, au);
      d = Math.max(d, g * 0.46);
    }
    // lone groups standing out on the run itself; a clear lane always winds between them, and the first turns are free of them
    if (au < c.hw && s > 150) {
      const lane = 0.42 * c.hw * vnoise1(s / 150 + 2.3, C.seed + 9), isl = vnoise2(x / 30 + 7.1, z / 46, 26);
      const g = c.forest * smooth(0.50, 0.66, isl) * smooth(6, 11, Math.abs(u - lane)) * smooth(150, 230, s) * (1 - c.ridge);
      d = Math.max(d, g * 0.7 * C.isl);
    }
    // the ridge: wind-stunted spruce, plastered white, in loose groups along both edges of the crest (they are what goes by at speed up there)
    _ridge = c.ridge;
    if (c.ridge > 0.01) {
      const g = c.ridge * smooth(c.hw - 4.5, c.hw - 1.5, au) * smooth(c.hw + 8, c.hw + 3, au) * smooth(-0.2, 0.4, vnoise2(x / 21, z / 34, 27));
      d = Math.max(d, g * 0.55);
    }
    if (LV && d > 0 && e < 14) d *= clearAt(s, u);
    if (s < 60) d *= smooth(8, 60, s + au);       // keep the start gate clear
    return d;
  };
  C.treeInCell = function (ci, cj, out) {
    out = out || _t; out.ok = false;
    const h0 = hash2U(ci, cj);
    const x = (ci + 0.15 + 0.7 * (h0 & 0xffff) / 65536) * TREE_CELL, z = (cj + 0.15 + 0.7 * (h0 >>> 16) / 65536) * TREE_CELL;
    const d = C.treeDensity(x, z); if (d <= 0.01) return out;
    const h1 = hashU(h0 + 0x51ed27);
    if ((h1 & 0xffff) / 65536 > d * 0.9) return out;
    const r2 = ((h1 >>> 16) & 0xff) / 255, r3 = (h1 >>> 24) / 255;
    out.ok = true; out.x = x; out.z = z; out.h = (6.5 + 9.5 * r2 * r2 + 2.5 * r3) * (1 - 0.6 * _ridge); out.r = out.h * 0.17; out.variant = (h0 >>> 5) % 5; out.rot = r3 * TAU; out.seed = h1;
    return out;
  };
  // closest-trunk query for collisions / AO (checks the 3x3 neighbourhood)
  C.nearTree = function (x, z, out) {
    const ci = Math.floor(x / TREE_CELL), cj = Math.floor(z / TREE_CELL); let best = 1e9; out.ok = false;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
      const t = C.treeInCell(ci + a, cj + b); if (!t.ok) continue;
      const d = Math.hypot(t.x - x, t.z - z); if (d < best) { best = d; out.ok = true; out.x = t.x; out.z = t.z; out.h = t.h; out.r = t.r; out.d = d; out.soft = false; }
    }
    // (the saplings that mark a jump: they bend and shed their snow, they do not stop anyone. soft = brushed, never hit)
    // (once flags stand at those places instead of saplings, there is nothing there to brush: Gates bends its own flags)
    if (!(typeof Gates !== 'undefined' && Gates.enabled)) C.markers(-z - 8, -z + 8, (mx, mz, mh) => { const d = Math.hypot(mx - x, mz - z); if (d < best) { best = d; out.ok = true; out.x = mx; out.z = mz; out.h = mh; out.r = mh * 0.17; out.d = d; out.soft = true; } });
    return out;
  };
  // the spruce saplings that mark a jump, the way a line is marked on a mountain: a pair where the run-in begins and a pair beside the lip,
  // just clear of the wedge, so that from above it is a lane to ski into: fn(x, z, height, turn)
  C.markers = function (s0, s1, fn) {
    if (s1 >= planned) planTo(s1 + 3000);
    for (let b = Math.floor(s0 / 32); b <= Math.floor((s1 + 24) / 32); b++) {
      const fb = C.feats.get(b); if (!fb) continue;
      for (let i = 0; i < fb.length; i++) {
        const f = fb[i]; if (!f.mark) continue;
        const sl = f.s + f.len * 0.94; if (Math.floor(sl / 32) !== b) continue;      // (a jump lies in several buckets: counted in the one that holds its lip)
        if (f.mx === undefined) { f.mx = at(sl, _py).cx + f.u; f.mx0 = at(f.s + 1, _py).cx + f.u; f.mo = f.wid * 0.5 + 3.4; f.mh = 3.5 + 0.7 * ((f.s * 0.37) % 1); }
        fn(f.mx - f.mo, -sl, f.mh, f.s * 1.3); fn(f.mx + f.mo, -sl + 0.6, f.mh * 0.9, f.s * 2.9);
        fn(f.mx0 - f.mo, -f.s - 1, f.mh * 0.82, f.s * 4.1); fn(f.mx0 + f.mo, -f.s - 1.5, f.mh * 0.95, f.s * 5.3);
      }
    }
  };
  C.reset(C.seed);
  return C;
})(vnoise1, vnoise2, hash2U);
