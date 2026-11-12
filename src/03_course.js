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
const SEG_PACE = { bowl: 19.6, steeps: 29.3, glade: 13.2, rollers: 14.3, gully: 15.4, kickers: 17.8, powder: 14.5, ridge: 21.7, moguls: 16.0 };
const HREF_SLOPE = 0.36;        // reference plane removed from heights before they go into float textures
const TREE_CELL = 4.5;

const Course = (() => {
  const C = { seed: 20261111, segs: [], feats: new Map(), mogK: 1 };
  const CH = 2048, NF = 15;       // metres per cache chunk, fields per metre
  const F = { baseY: 0, cx: 1, hw: 2, dish: 3, shoulder: 4, gul: 5, gw: 6, goff: 7, roll: 8, mog: 9, forest: 10, glade: 11, powder: 12, ridge: 13, wall: 14 };
  const chunks = new Map();
  let rng = RNG(C.seed), planned = 0, lastTypes = [], deck = [], pairs = [];
  // running integrals carried across chunks
  const integ = new Map();   // chunkIndex -> {baseY, rollPh, gPh} at chunk start

  C.reset = (seed) => { C.seed = seed >>> 0; C.segs = []; C.feats.clear(); chunks.clear(); integ.clear(); rng = RNG(C.seed); planned = 0; lastTypes = []; deck = []; pairs = []; planTo(4000); };

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
      if (C.forceType) type = C.forceType;
      lastTypes.push(type); if (lastTypes.length > 5) lastTypes.shift();
      const base = SEG_TYPES[type], p = {}, v = () => 0.85 + rng() * 0.3;
      for (const k of SEG_KEYS) p[k] = base[k];
      p.slope *= 0.93 + rng() * 0.14; p.hw *= v(); p.rollL *= v(); p.rollA *= v(); p.gAmp *= v(); p.gul *= v(); p.mean *= v();
      const len = C.segs.length === 0 ? 590 : SEG_PACE[type] * (27 + rng() * 6);       // about half a minute each
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
      planned += len;
    }
  }
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
      for (let i = 0; i <= CH; i++) { const s = ci * CH + i, o = i * NF; base64[i] = -p.slope * s; c[o + F.cx] = centre(0, p.mean); c[o + F.hw] = p.hw; c[o + F.dish] = p.dish; c[o + F.shoulder] = p.shoulder; c[o + F.gw] = p.gw; c[o + F.forest] = p.forest; c[o + F.powder] = p.powder; c[o + F.wall] = wallAt(Math.max(0, s)); }
    } else {
      let y = st.baseY, rph = st.rollPh, gph = st.gPh;
      // how tall the valley's walls stand: worked out every 32 m, the metres between are filled in below
      const W32 = new Float32Array(CH / 32 + 1); for (let j = 0; j <= CH / 32; j++) W32[j] = wallAt(ci * CH + j * 32);
      for (let i = 0; i <= CH; i++) { const j = Math.min(CH / 32 - 1, i >> 5), f = (i - j * 32) / 32; c[i * NF + F.wall] = W32[j] + (W32[j + 1] - W32[j]) * f; }
      for (let i = 0; i <= CH; i++) {
        const s = ci * CH + i, o = i * NF, p = paramsAt(s, _pp);
        base64[i] = y; c[o + F.cx] = centre(s, p.mean); c[o + F.hw] = p.hw; c[o + F.dish] = p.dish; c[o + F.shoulder] = p.shoulder; c[o + F.gul] = p.gul; c[o + F.gw] = p.gw;
        c[o + F.goff] = p.gAmp * Math.sin(gph); c[o + F.roll] = p.rollA * Math.sin(rph); c[o + F.mog] = p.mog; c[o + F.forest] = p.forest; c[o + F.glade] = p.glade; c[o + F.powder] = p.powder; c[o + F.ridge] = p.ridge;
        if (i < CH) { const p2 = paramsAt(s + 0.5, _pp); y -= p2.slope; rph += TAU / p2.rollL; gph += TAU / 78; }
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

  const cur = { baseY: 0, cx: 0, hw: 40, dish: 0, shoulder: 0.3, gul: 0, gw: 10, goff: 0, roll: 0, mog: 0, forest: 0, glade: 0, powder: 0, ridge: 0, wall: 1, s: 0 };
  function at(s, out) {
    out = out || cur;
    const ci = Math.floor(s / CH), c = chunk(ci), fs = s - ci * CH, i = Math.min(CH - 1, Math.floor(fs)), f = fs - i, o = i * NF, o2 = o + NF;
    out.baseY = c.base64[i] + (c.base64[i + 1] - c.base64[i]) * f;
    out.cx = c[o + 1] + (c[o2 + 1] - c[o + 1]) * f; out.hw = c[o + 2] + (c[o2 + 2] - c[o + 2]) * f; out.dish = c[o + 3] + (c[o2 + 3] - c[o + 3]) * f;
    out.shoulder = c[o + 4] + (c[o2 + 4] - c[o + 4]) * f; out.gul = c[o + 5] + (c[o2 + 5] - c[o + 5]) * f; out.gw = c[o + 6] + (c[o2 + 6] - c[o + 6]) * f;
    out.goff = c[o + 7] + (c[o2 + 7] - c[o + 7]) * f; out.roll = c[o + 8] + (c[o2 + 8] - c[o + 8]) * f; out.mog = c[o + 9] + (c[o2 + 9] - c[o + 9]) * f;
    out.forest = c[o + 10] + (c[o2 + 10] - c[o + 10]) * f; out.glade = c[o + 11] + (c[o2 + 11] - c[o + 11]) * f; out.powder = c[o + 12] + (c[o2 + 12] - c[o + 12]) * f; out.ridge = c[o + 13] + (c[o2 + 13] - c[o + 13]) * f;
    out.wall = c[o + 14] + (c[o2 + 14] - c[o + 14]) * f;
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
      let n = Math.imul(ix + i, 374761393) ^ Math.imul(iz + j, 668265263) ^ seed; n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16;
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
    const e = au - hw;
    h += c.dish * Math.min(1.6, (u * u) / (hw * hw));
    // forested banks either side of the run, each stretch of the run with its own; on a ridge they fall away instead. Farther out they
    // level off into the valley's own walls, which do not care what the run below is doing
    if (e > 0) {
      const t = e / 55, rise = 55 * (t * t / (1 + t)), near = 150 * (1 - Math.exp(-rise / 150));
      h += near * c.shoulder * (1 - c.ridge) - c.ridge * (0.62 * Math.exp(-e / 260) * rise + 11 * (1 - Math.exp(-e * e / 400))) + 0.36 * c.wall * (rise - near);
    }
    // big mountain relief far from the run (side walls, peaks)
    if (e > 30) {
      const m = smooth(30, 900, e);
      let hm = relief(x, z, e, cell);
      const w = smooth(70, 420, e);
      // gullies and the ribs between them, cut straight down the fall line of the large shapes
      if (w > 0.01) {
        const sg = u > 0 ? 1 : -1, D = 24;
        const gx = (relief(x + D, z, e + sg * D, cell) - hm) / D + sg * lerp(c.shoulder * (1 - c.ridge), 0.36 * c.wall, smooth(60, 300, e)), gz = (relief(x, z + D, e, cell) - hm) / D + 0.36;
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
    // along a ridge the wind builds a lip of packed snow on either edge of the crest: it catches the low sun, and it turns a ski back
    if (c.ridge > 0.01) { const q = (au - hw - 1.5) / 4.2; if (q > -3 && q < 3) h += c.ridge * 1.5 * Math.exp(-q * q) * (0.75 + 0.25 * vnoise1(s / 37, 41)); }
    if (c.roll !== 0) h += c.roll * smooth(hw * 1.5, hw * 0.7, au);
    if (c.mog > 0.01 && cell <= 1) {
      const row = s / 5.2, r0 = Math.floor(row), ph = (r0 & 1) * 0.5 + 0.13 * vnoise1(r0 * 1.7, 9);
      const col = u / 4.2 + ph, bx = Math.cos(col * TAU), q = row - r0;
      // (C.mogK: the skier's legs soak up half of every bump, so the body is told about a field half as tall as the one that is drawn)
      // each bump rises gently from above and drops off short and steep below, the way skis carve them; no two are the same size
      const along = q < 0.62 ? smooth(0, 0.62, q) : 1 - smooth(0.62, 1, q);
      const big = 0.58 + 0.84 * (hash2U(Math.floor(col + 0.5) + 4096, r0 + 4096) & 0xffff) / 65536;
      h += C.mogK * c.mog * 0.92 * big * (0.5 + 0.5 * bx) * along * mogField(u, s, hw) - c.mog * 0.2;
    }
    // natural undulation
    h += 1.7 * vnoise2(x / 61, z / 61, 3);
    if (cell <= 12) h += 0.75 * vnoise2(x / 27, z / 27, 4);
    if (cell <= 5) h += 0.32 * vnoise2(x / 11.3, z / 11.3, 5);
    if (cell <= 1.2) h += 0.09 * vnoise2(x / 3.1, z / 6.3, 6) * (0.4 + c.powder);
    // kickers and other placed features
    const fb = C.feats.get(Math.floor(s / 32));
    if (fb) for (let i = 0; i < fb.length; i++) {
      const f = fb[i], t = (s - f.s) / f.len; if (t < -0.2 || t > 2.6) continue;
      // (a marked jump is a cut wedge with steep sides, half as wide as the hump it replaces: the sides are what the eye finds from above)
      const lat = f.mark ? smooth(f.wid * 0.5 + 1.7, f.wid * 0.5, Math.abs(u - f.u)) : smooth(f.wid, f.wid * 0.45, Math.abs(u - f.u)); if (lat <= 0) continue;
      let k;
      // run-in ramp. A marked jump is a built takeoff: it steepens all the way to its lip, so that with the sun ahead its face is in shade and
      // its edge is drawn against the lit snow beyond (the others are rounded humps that only unweight the skis)
      if (t < 1) k = t <= 0 ? 0 : f.mark ? Math.pow(t, 1.9) : t * t * (3 - 2 * t) * (0.55 + 0.45 * t);
      else { const q = (t - 1) * f.len; k = q < 1.4 ? 1 - smooth(0, 1.4, q) * 1.25 : -0.25 * (1 - smooth(1.4, 20, q)); }   // lip, then a dug-out landing
      h += f.h * k * lat;
    }
    return h;
  };
  // where the bumps of a mogul field stand (0..1): across the run short of its edges, except along one smooth line that winds down
  // through them. That line is the fast way; the bumps either side of it are slow going and throw the skier about
  function mogField(u, s, hw) { return smooth(hw * 1.1, hw * 0.8, Math.abs(u)) * smooth(2.4, 6.5, Math.abs(u - 0.5 * hw * vnoise1(s / 105 + 7.3, C.seed + 31))); }
  C.bumps = function (x, z) { const c = at(-z, _py); return c.mog > 0.01 ? c.mog * mogField(x - c.cx, -z, c.hw) : 0; };
  // the lie of the rock: which bed of the mountain a point belongs to. Beds are 64 m thick and gently folded, so their dip keeps changing.
  // Every term repeats over 1024 m in x, y and z, because the shader only knows positions modulo that (STRATA_SSL is the same function).
  C.strata = function (x, y, z) {
    const k = TAU / 1024;
    return y / 64 + 0.42 * Math.sin(k * (x + z) + 1.1 * Math.sin(k * (x - z) + 0.7)) + 0.16 * Math.sin(2 * k * x + 1.7 * Math.sin(k * z)) + 0.10 * Math.sin(3 * k * z + 1.3 * Math.sin(k * x) + 1.1) + 0.045 * Math.sin(4 * k * (x - z) + 2.0 * Math.sin(k * (x + z)));
  };
  // how far up into the mountain's own country a point lies (0 on the run and its shoulders, 1 high on the walls)
  C.mountain = function (x, z) { const c = at(-z), e = Math.abs(x - c.cx) - c.hw; return smooth(30, 900, e); };
  const _g = [0, 0, 0];
  C.normal = function (x, z, d = 0.3) {
    const hx = C.height(x + d, z, 0.5) - C.height(x - d, z, 0.5), hz = C.height(x, z + d, 0.5) - C.height(x, z - d, 0.5);
    const nx = -hx / (2 * d), nz = -hz / (2 * d), l = Math.hypot(nx, 1, nz); _g[0] = nx / l; _g[1] = 1 / l; _g[2] = nz / l; return _g;
  };

  // ---- trees: one candidate per jittered grid cell, fully deterministic
  const _t = { x: 0, z: 0, h: 0, r: 0, variant: 0, rot: 0, ok: false }; let _ridge = 0;
  C.treeDensity = function (x, z) {
    const s = -z; if (s < -400) return 0; const c = at(s), u = x - c.cx, au = Math.abs(u), e = au - c.hw;
    let d = 0;
    if (e > 3) {
      const patch = 0.55 + 0.45 * vnoise2(x / 70, z / 70, 21);
      d = c.forest * smooth(3, 26, e) * smooth(-0.25, 0.25, patch - 0.42);
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
      d = Math.max(d, g * 0.7);
    }
    // the ridge: wind-stunted spruce, plastered white, in loose groups along both edges of the crest (they are what goes by at speed up there)
    _ridge = c.ridge;
    if (c.ridge > 0.01) {
      const g = c.ridge * smooth(c.hw - 4.5, c.hw - 1.5, au) * smooth(c.hw + 8, c.hw + 3, au) * smooth(-0.2, 0.4, vnoise2(x / 21, z / 34, 27));
      d = Math.max(d, g * 0.55);
    }
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
    C.markers(-z - 8, -z + 8, (mx, mz, mh) => { const d = Math.hypot(mx - x, mz - z); if (d < best) { best = d; out.ok = true; out.x = mx; out.z = mz; out.h = mh; out.r = mh * 0.17; out.d = d; out.soft = true; } });
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
        if (f.mx === undefined) { f.mx = at(sl, _py).cx + f.u; f.mx0 = at(f.s + 1, _py).cx + f.u; f.mo = f.wid * 0.5 + 2.6; f.mh = 3.5 + 0.7 * ((f.s * 0.37) % 1); }
        fn(f.mx - f.mo, -sl, f.mh, f.s * 1.3); fn(f.mx + f.mo, -sl + 0.6, f.mh * 0.9, f.s * 2.9);
        fn(f.mx0 - f.mo, -f.s - 1, f.mh * 0.82, f.s * 4.1); fn(f.mx0 + f.mo, -f.s - 1.5, f.mh * 0.95, f.s * 5.3);
      }
    }
  };
  C.reset(C.seed);
  return C;
})();
