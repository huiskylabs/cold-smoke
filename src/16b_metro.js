// ---------------------------------------------------------------- 不夜城: a new map. The world below the mountain is one endless city at night
// Built from the owner's concept picture (Variants 'world' b): from the snow you look down, from far higher than any real mountain stands
// over a town, on a city that covers a small planet to its curved, blue-rimmed horizon. Deep blue ground under moonlit snow, gold street
// light everywhere, the big avenues running straight away from the eye into the distance, two wide rivers with their bridges, towers
// all over it and a crowd of very tall ones downtown, snowy foothills coming down from our mountain with small towns in their valleys and
// a lit road winding down to the city, and low banks of cloud lit warm from below.
// None of the cloud-sea world is kept here: no far ranges, no old skyline. The whole view is worked out once, by a ray caster in a
// fragment shader (metroBakeFS), into two panoramas round the eye (the world below never comes nearer, it only turns, as the cloud sea
// did): E = the light it gives off at night, A = what it is made of, for the sun or the moon to light (a: water). Every frame the sky
// shader fetches them (metroPlain), adds the air between, and makes the lights shimmer a little.
Variants.def('world', '山下的世界', [['a', '云海浮城'], ['b', '不夜城']], 'b');
const Metro = (() => {
  // H: how far below the eye the city lies (m); RE: the radius of its little planet (the horizon dips, and curves, far more than the earth's);
  // AZ: the panorama covers bearings +-AZ about the city's; ta, tb: its rows, packed toward the horizon (drop = ta v + tb v^4);
  // bend: how much farther the ground falls away to either side than straight ahead (rad at 90 degrees: the planet's curve, overdrawn)
  const M = { H: 2200, RE: 9.0e5, AZ: 1.3, t0: -0.11, ta: 0.44, tb: 0.97, bend: 0.34, lift: 0.17, ak: 0.42, W: 2048, Hh: 1024, R1: 9600, DC: [-2315, 14041], lamp: 0.42, seed: 20261115, cloud: false, samples: 4, done: false, E: null, A: null, pipes: [] };
  M.on = () => Variants.val.world === 'b';
  let gfx, pipe, tE, tA;
  M.init = function (g, res) {
    gfx = g; if (res) { M.W = res; M.Hh = res >> 1; }
    M.E = gfx.texture({ w: M.W, h: M.Hh, format: 'rgba16f', filter: 'linear', wrap: 'clamp', mips: true }); tE = gfx.target({ color: M.E });
    M.A = gfx.texture({ w: M.W, h: M.Hh, format: 'rgba16f', filter: 'linear', wrap: 'clamp', mips: true }); tA = gfx.target({ color: M.A });
    pipe = gfx.pipeline({ name: 'metroBake', lib: [SL.common, SL.hash, SL.noise], topology: 'strip', buffers: [], varyings: { uv: 'vec2f' }, uniforms: { r: 'vec4f', t: 'vec4f', m: 'vec4f' },
      textures: {}, colorFormat: 'rgba16f', depth: false, depthTest: false, cull: 'none', vs: CLOUD_RECT_VS, fs: metroBakeFS() });
    M.pipes = [pipe];
  };
  // once, before the first frame that shows it: in narrow bands, ONE a frame, so that no frame carries a long draw (all sixteen wide
  // bands in a single frame lost the graphics device on a slow machine). The director, which steps frames by hand, takes it whole
  M.step = 0; M.bands = 32;
  M.update = function () {
    if (M.done || !gfx || !M.on()) return;
    const N = M.bands, whole = typeof QS !== 'undefined' && QS.has('director');
    do {
      const k = M.step % N, mode = M.step < N ? 0 : 1;
      gfx.beginPass(mode ? tA : tE, k === 0 ? { color: [0, 0, 0, 0] } : {});
      gfx.draw(pipe, { u: { r: [0, k / N, 1, (k + 1) / N], t: [0, k / N, 1, (k + 1) / N], m: [mode, M.samples, M.W, M.Hh] }, tex: {}, count: 4 });
      gfx.endPass();
      M.step++;
    } while (whole && M.step < 2 * N && M.step % 8 !== 0);      // (the director: eight bands a frame)
    if (M.step >= 2 * N) { gfx.genMips(M.E); gfx.genMips(M.A); M.done = true; }
  };
  Variants.on((n, v, init) => { if (n === 'world' && !init && typeof Clouds !== 'undefined') Clouds.baked = false; });
  return M;
})();
const metroF = x => { const t = String(+(+x).toFixed(7)); return /[.e]/.test(t) ? t : t + '.0'; };

// ---- the city itself, for the bake. Local axes: u to the right as seen from the mountain, w away from it (m from the eye)
function metroBakeFS() {
  const f = metroF, M = Metro, H = M.H, DC = M.DC;
  // the quarters with tall towers: [u, w, radius, height of the tallest]
  // ---- the layout is the concept picture's (01_night_metropolis, 1536 x 1024), measured off it and held as constants: nothing here
  // is drawn by chance. cg(x, y): a point of that picture, as ground (u, w) under this map's eye (its rim at y 185, the lip of the
  // slope at y 800, against ours at 145 and 450 of 720; 795 px to the radian; the eye on the fixed mountain looks 0.36 rad left of the map's axis)
  const cg = (x, y) => {
    const az = (x / 1536 * 1280 - 640) / 780 - 0.36, th = 0.07 + (y - 185) * 0.496 / 795, t = Math.tan(th);
    const d = 2 * H / (t + Math.sqrt(Math.max(t * t - 2 * H / M.RE, 1e-6)));
    return [d * Math.sin(az), d * Math.cos(az), d];
  };
  // the river: it comes in from the far left, swings down and to the right in a long S before downtown, and leaves to the right;
  // a second arm joins it from the left. [x, y of the picture, half its width (m)]
  const RIVERS = [
    [[0, 345, 300], [150, 336, 320], [300, 335, 340], [430, 345, 380], [560, 375, 440], [700, 414, 500], [860, 430, 520], [1020, 428, 500], [1180, 416, 460], [1330, 402, 430], [1536, 392, 400]],
    [[150, 300, 220], [330, 296, 240], [470, 310, 260], [560, 340, 300], [600, 380, 320]]];
  const SEGS = []; RIVERS.forEach(r => { for (let n = 0; n + 1 < r.length; n++) { const a = cg(r[n][0], r[n][1]), b = cg(r[n + 1][0], r[n + 1][1]); SEGS.push([a[0], a[1], b[0], b[1], r[n][2], r[n + 1][2]]); } });
  // the towers of the picture, one by one: [x, y of its foot, its height and width (px of the picture), its light, a mast?]
  const TCOL = [[1.0, 0.80, 0.55], [0.20, 0.85, 1.0], [1.0, 0.30, 0.75], [1.0, 0.95, 0.85], [0.62, 0.45, 1.0]];
  const TOWERS = [[835, 334, 52, 16, 0, 0], [858, 326, 68, 17, 1, 0], [882, 338, 58, 14, 0, 0], [905, 328, 84, 18, 3, 1], [930, 336, 72, 15, 2, 0], [953, 324, 92, 18, 0, 1],
    [976, 338, 78, 14, 1, 0], [1000, 330, 118, 17, 3, 1], [1023, 336, 88, 15, 2, 0], [1046, 326, 70, 17, 1, 0], [1068, 336, 54, 15, 0, 0],
    [322, 398, 46, 10, 3, 1], [742, 456, 36, 10, 4, 0], [1418, 332, 30, 10, 1, 0], [640, 352, 30, 10, 0, 0], [1190, 345, 34, 11, 2, 0]];
  const HEROES = TOWERS.map(t => {
    // (tall and slim, as the picture has them: a shaft, a narrower head, on the great ones a crown and a mast)
    const g = cg(t[0], t[1]), px = g[2] / 795, h = t[2] * 0.86 * px, hw = t[3] * 0.833 * px / 2 * 0.52;
    const tiers = [[hw, hw, 0, 0.72 * h, 0], [0.70 * hw, 0.70 * hw, 0.72 * h, (t[2] > 60 ? 0.91 : 1) * h, 0]];
    if (t[2] > 60) tiers.push([0.40 * hw, 0.40 * hw, 0.91 * h, h, 0]);
    if (t[5]) tiers.push([Math.max(4, 0.07 * hw), Math.max(4, 0.07 * hw), h, 1.16 * h, 1]);
    return { c: [g[0], g[1]], rot: 0.07, col: TCOL[t[4]], t: tiers };
  });
  // the great bridges over the river, where the picture has them: [x, y]. Each a deck on two towers (boxes, like the landmarks),
  // and its hanging cables strung with lamps (mCables)
  const BRIDGES = [[330, 338], [650, 400], [900, 430], [1250, 409]].map(b => {
    const c = cg(b[0], b[1]); let best = null, bd = 1e9;
    for (const g of SEGS.slice(0, RIVERS[0].length - 1)) { const mx = (g[0] + g[2]) / 2, my = (g[1] + g[3]) / 2, d = Math.hypot(mx - c[0], my - c[1]); if (d < bd) { bd = d; best = g; } }
    const tl = Math.hypot(best[2] - best[0], best[3] - best[1]), n = [-(best[3] - best[1]) / tl, (best[2] - best[0]) / tl], L = best[4] + best[5] + 500;
    return { c: [c[0], c[1]], n, L, rot: Math.atan2(n[1], n[0]) };
  });
  BRIDGES.forEach(b => {
    const col = [1.0, 0.86, 0.66];
    HEROES.push({ c: b.c, rot: b.rot, col, t: [[b.L / 2, 17, 46, 60, 3]] });
    for (const sg of [-1, 1]) HEROES.push({ c: [b.c[0] + sg * 0.27 * b.L * b.n[0], b.c[1] + sg * 0.27 * b.L * b.n[1]], rot: b.rot, col, t: [[13, 22, 0, 235, 4]] });
  });
  // the ridges of the mountain's foot, as the picture has them: crest lines [x1, y1, x2, y2, height, half width (m)]
  const RIDGES = [[250, 520, 620, 650, 430, 950], [300, 455, 560, 520, 300, 750], [480, 565, 760, 700, 380, 800], [1050, 600, 1400, 560, 430, 950], [1000, 520, 1300, 482, 280, 700], [1150, 700, 1500, 640, 500, 1000]]
    .map(r => { const a = cg(r[0], r[1]), b = cg(r[2], r[3]); return [a[0], a[1], b[0], b[1], r[4], r[5]]; });
  const TIERS = []; HEROES.forEach(h => h.t.forEach(t => TIERS.push({ h, t })));
  const cc = (x, y, r, h) => { const g = cg(x, y); return [g[0], g[1], r, h]; };
  const CORES = [cc(952, 331, 1900, 520), cc(322, 398, 700, 300), cc(742, 456, 600, 260), cc(1418, 332, 800, 300), cc(640, 352, 600, 240), cc(1190, 345, 700, 280), cc(200, 300, 900, 260), cc(1300, 300, 1000, 260)];
  return `
const MH: f32 = ${f(H)}; const MRE: f32 = ${f(M.RE)}; const MR1: f32 = ${f(M.R1)}; const MCS: f32 = 120.0;
fn mLine(x: f32, f: f32, w: f32) -> f32 {
  let ww: f32 = max(w, 0.002);
  let a: f32 = x + 0.5 * (ww + f); let b: f32 = x - 0.5 * (ww - f);
  return saturate((floor(a) * f + min(fract(a), f) - floor(b) * f - min(fract(b), f)) / ww);
}
fn mBand(s: f32, hw: f32, fw: f32) -> f32 { let w: f32 = max(fw, 0.5); return saturate((min(s + hw, 0.5 * w) - max(s - hw, -0.5 * w)) / w); }
fn mFoot(n: vec2f, dh: vec2f, fr: f32, fa: f32) -> f32 { let c: f32 = dot(n, dh); return abs(c) * fr + sqrt(max(1.0 - c * c, 0.0)) * fa; }
// the road that winds down from the mountain to the city: where it lies (u) at w
fn mRoadU(w: f32) -> f32 { let k: f32 = 1.0 - smoothstep(5200.0, 9000.0, w); return -0.17 * w + (520.0 * sin(w / 760.0 + 0.6) + 260.0 * sin(w / 310.0)) * k * smoothstep(300.0, 1500.0, w) + 160.0; }
// the river of the concept picture: signed distance to its bank (m, < 0 on the water)
fn mSeg(p: vec2f, a: vec2f, b: vec2f, ra: f32, rb: f32) -> f32 { let pa: vec2f = p - a; let ba: vec2f = b - a; let h: f32 = saturate(dot(pa, ba) / dot(ba, ba)); return length(pa - ba * h) - mix(ra, rb, h); }
fn mRiver(u: f32, w: f32) -> f32 {
  let p: vec2f = vec2f(u, w); var d: f32 = 1.0e5;
${SEGS.map(g => `  d = min(d, mSeg(p, vec2f(${f(g[0])}, ${f(g[1])}), vec2f(${f(g[2])}, ${f(g[3])}), ${f(g[4])}, ${f(g[5])}));`).join('\n')}
  return d;
}
// the foothills: height above the plain (m). Spurs run down from the mountain, the road's valley between them
fn mHills(u: f32, w: f32) -> f32 {
  let r: f32 = length(vec2f(u, w)); if (r > MR1) { return 0.0; }
  let env: f32 = (MH - 240.0) * pow(1.0 - r / MR1, 1.45);
  let az: f32 = atan2(u, max(w, 1.0));
  let n: f32 = vnoise2(vec2f(az * 8.0 + 0.35 * sin(r / 2100.0) + 3.0, r / 5200.0));
  let rg: f32 = (1.0 - abs(2.0 * n - 1.0)) * (0.72 + 0.40 * smoothstep(1500.0, 5000.0, r) * (1.0 - abs(2.0 * vnoise2(vec2f(az * 21.0 + 9.0, r / 2400.0)) - 1.0)));
  let val: f32 = smoothstep(120.0, 1500.0 + 0.12 * r, abs(u - mRoadU(w)));
  let det: f32 = fbm2(vec2f(u, w) / 900.0) - 0.5;
  let old: f32 = env * (0.30 + 0.70 * pow(rg, 1.7)) * (0.16 + 0.84 * val) * (1.0 + 0.5 * det) + 70.0 * det * (1.0 - smoothstep(MR1 - 2500.0, MR1, r));
  // the picture's ridges: sharp crests falling away to either side, cut by the road's valley
  let p: vec2f = vec2f(u, w); var rdg: f32 = 0.0;
${RIDGES.map(g => `  rdg = max(rdg, ${f(g[4])} * pow(saturate(1.0 - mSeg(p, vec2f(${f(g[0])}, ${f(g[1])}), vec2f(${f(g[2])}, ${f(g[3])}), 0.0, 0.0) / ${f(g[5])}), 1.25));`).join('\n')}
  rdg *= (1.0 + 0.7 * det) * (0.25 + 0.75 * val) * (1.0 - smoothstep(MR1 - 1400.0, MR1, r));
  return max(max(old * 0.55, rdg), 0.0);
}
// how tall the towers of a quarter may stand at a spot
fn mCoreH(u: f32, w: f32) -> f32 {
  var h: f32 = 0.0;
${CORES.map(c => `  h = max(h, ${f(c[3])} * exp(-(sq(u - ${f(c[0])}) + sq(w - ${f(c[1])})) / ${f(c[2] * c[2])}));`).join('\n')}
  return h;
}
// how built up the land is (0 .. 1), how white its light, park 0 .. 1, which grid
fn mLand(u: f32, w: f32) -> vec4f {
  let p: vec2f = vec2f(u, w); let r: f32 = length(p - vec2f(${f(DC[0])}, ${f(DC[1])}));
  let n1: f32 = fbm2(p / 15000.0 + vec2f(3.1, 7.7)); let n2: f32 = fbm2(p / 4200.0 + vec2f(9.7, 1.3)); let n3: f32 = vnoise2(p / 1300.0 + vec2f(0.5, 4.1));
  let dens: f32 = saturate(0.52 + 0.70 * exp(-r / 9000.0) + 2.2 * (n1 - 0.5) + 1.6 * (n2 - 0.5));
  let white: f32 = saturate(0.8 * exp(-r / 3500.0) + 0.8 * (n2 - 0.6));
  let park: f32 = (1.0 - smoothstep(0.22, 0.30, n3)) * smoothstep(900.0, 2200.0, r);
  return vec4f(dens, white, park, step(0.55, n1) * step(7000.0, r));
}
// the ray: its height above the (curving) ground x metres out, falling at slope s
fn mRayH(x: f32, s: f32) -> f32 { return MH - x * s + x * x / (2.0 * MRE); }
fn mTint(h: f32) -> vec3f {
  if (h < 0.62) { return mix(vec3f(1.0, 0.70, 0.36), vec3f(1.0, 0.86, 0.62), h / 0.62); }
  if (h < 0.86) { return vec3f(0.86, 0.93, 1.0); }
  if (h < 0.92) { return vec3f(0.25, 0.85, 1.0); }
  if (h < 0.96) { return vec3f(1.0, 0.30, 0.85); }
  return vec3f(0.55, 0.40, 1.0);
}
// the ground of the city at (u, w): mode 0 the light it gives off at night, mode 1 what it is made of (a: water).
// dh: the line of sight on the map, fr / fa: what the sample covers along and across it (m)
fn mGround(u: f32, w: f32, dh: vec2f, fr: f32, fa: f32, mode: f32) -> vec4f {
  let L: vec4f = mLand(u, w);
  let rel: vec2f = vec2f(u - ${f(DC[0])}, w - ${f(DC[1])});
  // the grid: its long avenues run nearly straight away from the mountain; the outer boroughs are turned across it
  let ga: f32 = 0.07 + 0.52 * L.w; let gc: f32 = cos(ga); let gs: f32 = sin(ga);
  let gx: vec2f = vec2f(gc, gs); let gy: vec2f = vec2f(-gs, gc);
  let g: vec2f = vec2f(dot(rel, gx), dot(rel, gy));
  let wg: vec2f = vec2f(mFoot(gx, dh, fr, fa), mFoot(gy, dh, fr, fa));
  let P: f32 = MCS;
  // streets: chains of lamps, no two streets lit alike
  let n: vec2f = floor(g / P + 1.0); let m: vec2f = floor(g / P + 0.5);
  let mx: f32 = smoothstep(0.3, 1.2, wg.y / P); let my: f32 = smoothstep(0.3, 1.2, wg.x / P);
  let bx: f32 = mix(sq(hashu(u32(i32(n.y) * 7919 + 13)) * 1.3) * (0.2 + step(0.2, hash21(vec2f(m.x, n.y) + vec2f(0.5, 91.0)))), 0.62, mx);
  let by: f32 = mix(sq(hashu(u32(i32(n.x) * 6007 + 71)) * 1.3) * (0.2 + step(0.2, hash21(vec2f(n.x, m.y) + vec2f(47.0, 0.5)))), 0.62, my);
  let lx: f32 = mLine(g.y / P + 0.5, 7.0 / P, wg.y / P); let ly: f32 = mLine(g.x / P + 0.5, 7.0 / P, wg.x / P);
  let street: f32 = lx * (0.10 + 0.90 * mLine(g.x / 30.0, 0.25, wg.x / 30.0)) * bx + ly * (0.10 + 0.90 * mLine(g.y / 30.0 + 0.5, 0.25, wg.y / 30.0)) * by;
  // the lights inside the blocks: windows and yards, a dense scatter
  let cell: vec2f = floor(g / P + 0.5);
  let many: f32 = smoothstep(0.4, 1.5, max(wg.x, wg.y) / P);
  let blk: f32 = mix(hash21(cell + vec2f(17.0 * L.w, 3.0)), 0.5, many);
  let pc: f32 = 15.0; let pk: vec2f = floor(g / pc); let share: f32 = 0.16 + 0.60 * blk * L.x;
  let pon: f32 = mix(step(1.0 - share, hash21(pk + vec2f(311.0, 17.0))) * (0.3 + 1.4 * hash21(pk + vec2f(5.0, 777.0))), share, smoothstep(0.4, 1.4, max(wg.x, wg.y) / pc));
  let pts: f32 = pon * mLine(g.x / pc - 0.5, 3.2 / pc, wg.x / pc) * mLine(g.y / pc - 0.5, 3.2 / pc, wg.y / pc);
  let pcol: vec3f = mix(mTint(hash21(pk + vec2f(91.0, 33.0)) * (0.70 + 0.22 * L.y)), vec3f(1.0, 0.70, 0.36), many);
  // the avenues: every 6th street away from the eye, every 8th across; lines of light with a glow about them
  let ax: f32 = floor(g.x / (6.0 * P) + 0.5); let ay: f32 = floor(g.y / (8.0 * P) + 0.5);
  let kax: f32 = mix(0.35 + 1.0 * step(0.45, hashu(u32(i32(ax) * 131 + 7))), 0.9, smoothstep(0.3, 1.0, wg.x / (6.0 * P)));
  let kay: f32 = mix(0.30 + 1.0 * step(0.55, hashu(u32(i32(ay) * 173 + 3))), 0.75, smoothstep(0.3, 1.0, wg.y / (8.0 * P)));
  let dax: f32 = (fract(g.x / (6.0 * P) + 0.5) - 0.5) * 6.0 * P; let day: f32 = (fract(g.y / (8.0 * P) + 0.5) - 0.5) * 8.0 * P;
  let avx: f32 = (mBand(dax, 9.0, wg.x) * 1.0 + 0.05 * exp(-abs(dax) / 60.0)) * kax;
  let avy: f32 = (mBand(day, 9.0, wg.y) * 1.0 + 0.05 * exp(-abs(day) / 60.0)) * kay;
  // motorways: a ring round downtown, a wider one, and long ones out across the plain
  let rr: f32 = length(rel); let rn: vec2f = rel / max(rr, 1.0);
  var mw: f32 = 0.0;      // (no ring roads: the picture has none)
  for (var i: i32 = 0; i < 6; i++) {
    let an: f32 = 0.5 + f32(i) * 1.05 + 0.25 * sin(f32(i) * 3.7);
    let dv: vec2f = vec2f(cos(an), sin(an)); let nv: vec2f = vec2f(-dv.y, dv.x);
    let along: f32 = dot(rel, dv); let off: f32 = dot(rel, nv) - 320.0 * sin(along / 3600.0 + f32(i));
    mw += (mBand(off, 13.0, mFoot(nv, dh, fr, fa)) * 1.4 + 0.12 * exp(-abs(off) / 80.0)) * smoothstep(800.0, 2600.0, along);
  }
  // water, banks, bridges (the avenues carry on across the water)
  let rs: f32 = mRiver(u, w); let rf: f32 = max(fr * 0.6, fa);
  let water: f32 = saturate(0.5 - rs / max(rf, 1.0));
  let bank: f32 = mBand(rs - 16.0, 7.0, rf) * (0.35 + 0.65 * mLine((u + w) / 24.0, 0.4, (fr + fa) / 24.0));
  let land: f32 = L.x * (1.0 - 0.85 * L.z);
  // the foot of the mountain: no city on the slopes, only what lies in the valleys
  let hl: f32 = mHills(u, w); let flt: f32 = 1.0 - smoothstep(20.0, 160.0, hl);
  let gold: vec3f = vec3f(1.0, 0.66, 0.30); let warm: vec3f = vec3f(1.0, 0.80, 0.52); let led: vec3f = vec3f(0.90, 0.93, 1.0);
  if (mode < 0.5) {
    let cs: vec3f = mix(gold, warm, 0.1 + 0.4 * L.y);
    var em: vec3f = (cs * (street * 5.0 * land) + pcol * (pts * 7.0 * mix(0.25, 1.0, land))) * (1.0 - water);
    let brd: f32 = (avx * 1.3 + avy) * mix(0.3, 1.0, L.x);
    em += mix(gold * 1.1, led, 0.10 + 0.25 * L.y) * ((brd * (1.0 - water)) * 1.5) + mix(gold, led, 0.25) * (mw * 1.3 * (1.0 - water)) + warm * (bank * 4.0);
    // the water mirrors what stands on its banks: long shimmering streaks
    let sh: f32 = exp(min(rs, 0.0) / 260.0) * (0.5 + 0.9 * vnoise2(vec2f(u / 34.0, w / 600.0)));
    em += mix(gold, vec3f(1.0, 0.45, 0.55), vnoise2(vec2f(u / 400.0, 3.0))) * (water * sh * 0.22 * mix(0.4, 1.0, L.x));
    // the great bridges: where a boulevard crosses, two lit pylons stand in the water
    em += vec3f(1.0, 0.86, 0.62) * (mBand(dax, 16.0, wg.x) * step(1.0, kax) * water * 10.0 * exp(-sq((rs + 150.0) / 55.0)));
    return vec4f(em * flt, water * flt);
  }
  // by day, and under the moon: snow on the roofs and the parks, dark streets, blue water
  let dst: f32 = saturate(lx + ly + avx + avy + mw);
  let roof: vec3f = mix(vec3f(0.16, 0.19, 0.30), vec3f(0.42, 0.48, 0.66), 0.25 + 0.75 * blk);
  var alb: vec3f = mix(mix(roof, vec3f(0.07, 0.08, 0.12), dst * mix(0.5, 1.0, L.x)), vec3f(0.55, 0.62, 0.76), L.z * 0.8);
  alb = mix(alb, vec3f(0.04, 0.09, 0.26), water);
  return vec4f(alb, water);
}
// the mountain's foot at (u, w), hl m above the plain
fn mHillShade(u: f32, w: f32, hl: f32, mode: f32) -> vec4f {
  let e: f32 = 40.0;
  let nx: f32 = mHills(u + e, w) - mHills(u - e, w); let nz: f32 = mHills(u, w + e) - mHills(u, w - e);
  let N: vec3f = normalize(vec3f(-nx, 2.0 * e, -nz));
  let steep: f32 = 1.0 - N.y;
  let fo: f32 = smoothstep(0.42, 0.60, fbm2(vec2f(u, w) / 260.0) + 1.3 * steep - 0.25 * smoothstep(200.0, 1200.0, hl));
  let rd: f32 = abs(u - mRoadU(w)) / sqrt(1.0 + sq((mRoadU(w + 20.0) - mRoadU(w - 20.0)) / 40.0));
  // the towns in the valleys: clusters of warm lights low down, thinning up the slopes
  let low: f32 = (1.0 - smoothstep(60.0, 520.0, hl)) * smoothstep(2200.0, 4200.0, length(vec2f(u, w)));
  let tn: f32 = smoothstep(0.50, 0.72, fbm2(vec2f(u, w) / 700.0 + vec2f(5.0, 2.0))) * low + 0.8 * exp(-rd / 260.0) * smoothstep(900.0, 2500.0, w);
  if (mode < 0.5) {
    let k: vec2f = floor(vec2f(u, w) / 22.0); let on: f32 = step(1.0 - 0.34 * saturate(tn), hash21(k + vec2f(7.0, 19.0)));
    let fp: vec2f = fract(vec2f(u, w) / 22.0) - 0.5;
    var em: vec3f = mTint(hash21(k) * 0.78) * (on * exp(-dot(fp, fp) * 22.0) * 5.0);
    // the road down: two ribbons of light, and its glow on the snow beside it
    let rk: f32 = smoothstep(500.0, 1500.0, w);
    // (as roads look by night from the air: lamps in a row down either side and their pools of light on the snow, a dark carriageway
    // between, and on it the cars: a white stream coming, a red one going)
    let sd: f32 = (u - mRoadU(w)) / sqrt(1.0 + sq((mRoadU(w + 20.0) - mRoadU(w - 20.0)) / 40.0));
    let lamps: f32 = (1.0 - smoothstep(4.0, 11.0, abs(rd - 30.0))) * exp(-sq((fract(w / 80.0) - 0.5) * 4.0));
    em += vec3f(1.0, 0.64, 0.28) * (lamps * 7.0 + 0.55 * exp(-rd / 50.0) * smoothstep(14.0, 30.0, rd) + 0.10 * exp(-rd / 320.0)) * rk;
    em += (vec3f(1.0, 0.92, 0.78) * ((1.0 - smoothstep(2.5, 7.0, abs(sd - 8.0))) * 3.2) + vec3f(1.0, 0.12, 0.06) * ((1.0 - smoothstep(2.5, 7.0, abs(sd + 8.0))) * 3.6)) * rk;
    em += vec3f(1.0, 0.56, 0.24) * (0.34 * saturate(tn));
    return vec4f(em, 0.0);
  }
  // snow under a light from the upper left, the hollows bluer; forest dark on the steeper ground
  let sh: f32 = saturate(0.10 + 1.5 * dot(N, normalize(vec3f(-0.62, 0.50, -0.30)))) * (0.70 + 0.30 * smoothstep(0.0, 500.0, hl));
  let snow: vec3f = mix(vec3f(0.10, 0.14, 0.36), vec3f(0.84, 0.90, 1.0), sh);
  return vec4f(mix(mix(snow, vec3f(0.035, 0.05, 0.085), fo * 0.9), vec3f(0.07, 0.075, 0.09), (1.0 - smoothstep(16.0, 26.0, rd)) * smoothstep(500.0, 1500.0, w)), 0.0);
}
// a bank of cloud at p (m from the eye), y m above the plain: its density
fn mCloud(p: vec2f, y: f32) -> f32 {
  let r: f32 = length(p);
  let zone: f32 = smoothstep(6200.0, 7400.0, r) * (1.0 - smoothstep(9000.0, 10800.0, r)) + 0.6 * smoothstep(0.60, 0.72, vnoise2(p / 6000.0 + vec2f(2.0, 5.0))) * smoothstep(10500.0, 13000.0, r) * (1.0 - smoothstep(20000.0, 28000.0, r));
  if (zone < 0.01) { return 0.0; }
  // heaps with rounded tops: the big shape, and smaller billows on it
  let base: f32 = fbm2(p / 2400.0 + vec2f(1.7, 8.3)); let bil: f32 = fbm2(p / 520.0 + vec2f(4.0, 1.0));
  let heap: f32 = smoothstep(0.51, 0.61, base) * zone;
  let top: f32 = 180.0 + heap * (140.0 + 900.0 * smoothstep(0.25, 0.80, bil));
  return saturate((top - y) / 60.0) * saturate((y - 150.0) / 60.0) * smoothstep(0.02, 0.25, heap);
}
// a landmark's tier against the line of sight: (0 nothing / 1 a wall across / 2 a wall along / 3 a roof, how far out, how high, where
// across the face -1 .. 1)
fn mBox(c: vec2f, rc: f32, rs: f32, hsz: vec2f, base: f32, top: f32, dl: vec2f, s: f32, xmax: f32) -> vec4f {
  let o: vec2f = vec2f(-c.x * rc - c.y * rs, c.x * rs - c.y * rc);
  var d: vec2f = vec2f(dl.x * rc + dl.y * rs, -dl.x * rs + dl.y * rc);
  if (abs(d.x) < 1e-4) { d.x = 1e-4; }
  if (abs(d.y) < 1e-4) { d.y = 1e-4; }
  let lo: vec2f = (-hsz - o) / d; let hi: vec2f = (hsz - o) / d;
  let t1: vec2f = min(lo, hi); let t2: vec2f = max(lo, hi);
  let te: f32 = max(max(t1.x, t1.y), 0.0); let tx: f32 = min(t2.x, t2.y);
  if (te < tx && te < xmax) {
    let he: f32 = mRayH(te, s);
    if (he < top && he >= base) {
      let pp: vec2f = o + d * te;
      if (t1.x > t1.y) { return vec4f(2.0, te, he, pp.y / hsz.y); }
      return vec4f(1.0, te, he, pp.x / hsz.x);
    }
    let hx: f32 = mRayH(tx, s);
    if (he >= top && hx < top) { return vec4f(3.0, mix(te, tx, (he - top) / max(he - hx, 1e-3)), top, 0.0); }
  }
  return vec4f(0.0);
}
// the hanging cables of the bridges, strung with lamps (light only: added over whatever lies behind). xmax: what stands in the way
fn mCables(dl: vec2f, s: f32, xmax: f32, dTh: f32) -> vec3f {
  var e: f32 = 0.0;
${BRIDGES.map(b => `  { let c: vec2f = vec2f(${f(b.c[0])}, ${f(b.c[1])}); let n: vec2f = vec2f(${f(b.n[0])}, ${f(b.n[1])}); let m: vec2f = vec2f(-n.y, n.x);
    let dn: f32 = dot(dl, m);
    if (abs(dn) > 1e-3) {
      let x: f32 = dot(c, m) / dn; let a: f32 = abs(dot(dl * x - c, n)); let hh: f32 = mRayH(x, s); let t0: f32 = ${f(0.27 * b.L)}; let hl: f32 = ${f(0.5 * b.L)};
      if (x > 0.0 && x < xmax && a < hl && hh > 40.0 && hh < 260.0) {
        var yc: f32 = 62.0 + 173.0 * sq(a / t0);
        if (a > t0) { yc = mix(235.0, 60.0, (a - t0) / (hl - t0)); }
        let tk: f32 = max(5.0, x * dTh * 5.0);
        e += exp(-sq((hh - yc) / tk)) * (0.55 + 0.45 * step(0.5, fract(a / 22.0))) * 3.0 + 0.10 * step(hh, yc) * step(0.72, fract(a / 26.0));
      }
    } }`).join('\n')}
  return vec3f(1.0, 0.88, 0.70) * e;
}
// the nearest landmark along the line of sight, before xmax: (kind of hit + 4 x which tier, how far, how high, where across)
fn mHero(dl: vec2f, s: f32, xmax: f32) -> vec4f {
  var best: vec4f = vec4f(0.0, xmax, 0.0, 0.0);
${TIERS.map((e, k) => `  if (abs(${f(e.h.c[0])} * dl.y - ${f(e.h.c[1])} * dl.x) < ${f(Math.hypot(e.t[0], e.t[1]) + 5)}) { let r: vec4f = mBox(vec2f(${f(e.h.c[0])}, ${f(e.h.c[1])}), ${f(Math.cos(e.h.rot))}, ${f(Math.sin(e.h.rot))}, vec2f(${f(e.t[0])}, ${f(e.t[1])}), ${f(e.t[2])}, ${f(e.t[3])}, dl, s, best.y); if (r.x > 0.5 && r.y < best.y) { best = vec4f(r.x + ${f(4 * k)}, r.y, r.z, r.w); } }`).join('\n')}
  return best;
}
// what a landmark shows where the line of sight meets it
fn mHeroShade(r: vec4f, mode: f32, dAz: f32, dTh: f32) -> vec3f {
  let idx: i32 = i32(r.x / 4.0); let kind: f32 = r.x - 4.0 * f32(idx);
  var hsz: vec2f = vec2f(100.0); var base: f32 = 0.0; var top: f32 = 1000.0; var tk: f32 = 0.0; var hc: vec3f = vec3f(1.0);
${TIERS.map((e, k) => `  if (idx == ${k}) { hsz = vec2f(${f(e.t[0])}, ${f(e.t[1])}); base = ${f(e.t[2])}; top = ${f(e.t[3])}; tk = ${f(e.t[4])}; hc = vec3f(${e.h.col.map(f).join(', ')}); }`).join('\n')}
  let along: f32 = step(1.5, kind) * step(kind, 2.5); let hf: f32 = mix(hsz.x, hsz.y, along); let fc: f32 = mix(1.0, 0.42, along);
  if (kind > 2.5) {
    if (mode < 0.5) { return hc * (0.5 + 2.5 * step(0.5, tk) * step(tk, 1.5) + 2.2 * step(2.5, tk) * step(tk, 3.5)); }
    return vec3f(0.60, 0.66, 0.80);
  }
  if (mode > 0.5) { return vec3f(0.09, 0.12, 0.19) * (0.6 + 0.7 * (1.0 - along)); }
  if (tk > 3.5) { return hc * (0.35 + 1.9 * smoothstep(0.45, 1.0, r.z / top)); }      // a bridge tower, floodlit, brightest at its head
  if (tk > 2.5) { return hc * 2.4; }                                                    // a bridge deck: its lamps
  if (tk > 1.5) {
    // a face of coloured light, its colour turning as it climbs, floor by floor
    let g: f32 = saturate((r.z - base) / max(top - base, 1.0));
    return mix(hc, vec3f(0.95, 0.35, 0.80), 0.75 * g) * ((0.35 + 1.1 * step(0.55, fract(r.z / 44.0))) * fc * (0.55 + 0.7 * step(0.5, hash21(floor(vec2f(r.w * hf / 26.0, r.z / 44.0)) + vec2f(f32(idx), 5.0)))));
  }
  if (tk > 0.5) { return hc * 7.0; }
  let dist: f32 = sqrt(r.y * r.y + sq(MH - r.z));
  let wsz: vec2f = max(vec2f(7.0, 4.5), vec2f(dist * dAz, dist * dTh) * 4.8);
  let wq: vec2f = vec2f(r.w * hf / wsz.x, r.z / wsz.y); let wc: vec2f = floor(wq); let wf: vec2f = fract(wq);
  let fl: f32 = hash21(vec2f(wc.y, f32(idx) * 91.0));
  let on: f32 = step(0.50 - 0.35 * step(0.80, fl), hash21(wc + vec2f(f32(idx) * 177.0, 53.0))) * step(0.14, wf.x) * step(wf.x, 0.86) * step(0.22, wf.y) * step(wf.y, 0.80);
  var em: vec3f = mix(vec3f(1.0, 0.66, 0.30), hc, 0.30) * (on * (0.8 + 1.4 * hash21(wc + vec2f(3.0, 3.0))) * 2.2 * fc);
  // its corners run with light from foot to crown, and every setback wears a band of it
  em += hc * (1.4 * step(0.93, abs(r.w)) + 5.0 * smoothstep(top - 40.0, top - 16.0, r.z));
  em += vec3f(1.0, 0.70, 0.36) * (0.9 * exp(-r.z / 60.0));
  return em;
}
// what the eye sees along (bearing az from the city's, dropping th below level): mode 0 light, mode 1 matter
fn mScene(az: f32, th: f32, mode: f32, dAz: f32, dTh: f32) -> vec4f {
  let dl: vec2f = vec2f(sin(az), cos(az)); let s: f32 = tan(th);
  // the plain, on its little planet
  let disc: f32 = s * s - 2.0 * MH / MRE;
  var xg: f32 = 2.0e5; var onG: f32 = 0.0;
  if (disc > 0.0 && s > 0.0) { xg = 2.0 * MH / (s + sqrt(disc)); onG = 1.0; }
  // the foothills first (they are nearer)
  var hit: i32 = 0; var xh: f32 = 0.0;
  if (s > 0.16) {
    var xp: f32 = 250.0; var dp: f32 = mRayH(xp, s) - mHills(dl.x * xp, dl.y * xp);
    for (var i: i32 = 0; i < 90; i++) {
      let x: f32 = xp + max(40.0, 0.35 * dp); if (x > min(xg, MR1)) { break; }
      let d: f32 = mRayH(x, s) - mHills(dl.x * x, dl.y * x);
      if (d < 0.0) { xh = mix(xp, x, dp / (dp - d)); hit = 1; break; }
      xp = x; dp = d;
    }
  }
  var col: vec4f = vec4f(0.0); var xs: f32 = xg; var tflag: f32 = 0.0;
  let hr0: vec4f = mHero(dl, s, 60000.0);
  if (hit == 1) {
    xs = xh; let u: f32 = dl.x * xh; let w: f32 = dl.y * xh; let hl: f32 = mHills(u, w);
    col = mHillShade(u, w, hl, mode);
    if (hl < 160.0) { let dist: f32 = sqrt(xh * xh + MH * MH); col = mix(mGround(u, w, dl, dist * dTh / max(s, 0.02), dist * dAz, mode), col, smoothstep(20.0, 160.0, hl)); }
  }
  if (hit == 0 && onG > 0.5) {
    // ---- the towers: walk the grid from where the line of sight comes down among the roofs to where it meets the ground
    var hm: f32 = 150.0;
${CORES.map(c => `    { let t0: f32 = dot(vec2f(${f(c[0])}, ${f(c[1])}), dl); let b: f32 = abs(${f(c[0])} * dl.y - ${f(c[1])} * dl.x); if (b < ${f(c[2] * 2.2)} && t0 < xg + ${f(c[2] * 2.2)} && t0 > xg - ${f(c[3] * 1.4)} / s - ${f(c[2] * 2.2)}) { hm = max(hm, ${f(c[3] * 1.4)}); } }`).join('\n')}
    let x0: f32 = max(xg - hm / s, 300.0);
    let rel0: vec2f = dl * x0 - vec2f(${f(DC[0])}, ${f(DC[1])});
    let gc: f32 = cos(0.07); let gs: f32 = sin(0.07);
    let g0: vec2f = vec2f(rel0.x * gc + rel0.y * gs, -rel0.x * gs + rel0.y * gc) / MCS;
    var gd: vec2f = vec2f(dl.x * gc + dl.y * gs, -dl.x * gs + dl.y * gc);
    if (abs(gd.x) < 1e-4) { gd.x = 1e-4; }
    if (abs(gd.y) < 1e-4) { gd.y = 1e-4; }
    var c: vec2f = floor(g0); let st: vec2f = sign(gd); let inv: vec2f = vec2f(1.0) / abs(gd);
    var tm: vec2f = (c + max(st, vec2f(0.0)) - g0) / gd; let tend: f32 = (xg - x0) / MCS;
    var th0: f32 = 0.0; var tw: i32 = 0; var tn: vec2f = vec2f(0.0); var tx: f32 = 0.0; var tinfo: vec4f = vec4f(0.0); var tq: f32 = 0.0;
    for (var i: i32 = 0; i < 110; i++) {
      if (th0 > tend) { break; }
      // the tower of this cell, if it has one
      let cc: vec2f = (c + 0.5) * MCS; let cu: f32 = cc.x * gc - cc.y * gs + ${f(DC[0])}; let cw: f32 = cc.x * gs + cc.y * gc + ${f(DC[1])};
      let h3: vec3f = hash33(vec3f(c.x, c.y, 7.0)); let ch: f32 = mCoreH(cu, cw);
      let hero: f32 = 0.0;
      if (h3.x < 0.10 + 0.46 * saturate(ch / 420.0) + hero) {
        let Ld: vec4f = mLand(cu, cw);
        let ht: f32 = mix(ch * (0.16 + 0.80 * h3.y * h3.y) + 110.0 * Ld.x * (0.25 + h3.z) * step(0.35, Ld.x), 1300.0, hero);
        let hs: f32 = mix(0.17 + 0.22 * h3.z, 0.30, hero);
        if (ht > 28.0 && mRiver(cu, cw) > 40.0 && mHills(cu, cw) < 15.0 && (Ld.z < 0.5 || ch > 150.0)) {
          let lo: vec2f = (c + 0.5 - hs - g0) / gd; let hi: vec2f = (c + 0.5 + hs - g0) / gd;
          let t1: vec2f = min(lo, hi); let t2: vec2f = max(lo, hi);
          let te: f32 = max(max(t1.x, t1.y), 0.0); let tx2: f32 = min(t2.x, t2.y);
          if (te < tx2) {
            let he: f32 = mRayH(x0 + te * MCS, s);
            if (he < ht) {
              tw = 1; tx = x0 + te * MCS; tinfo = vec4f(ht, h3.x, h3.y, h3.z); tq = he;
              if (t1.x > t1.y) { tn = vec2f(-st.x, 0.0); } else { tn = vec2f(0.0, -st.y); }
              break;
            }
            let hx: f32 = mRayH(x0 + tx2 * MCS, s);
            if (hx < ht) { tw = 2; tx = x0 + mix(te, tx2, (he - ht) / max(he - hx, 1e-3)) * MCS; tinfo = vec4f(ht, h3.x, h3.y, h3.z); tq = ht; break; }
          }
        }
      }
      if (tm.x < tm.y) { th0 = tm.x; tm.x += inv.x; c.x += st.x; } else { th0 = tm.y; tm.y += inv.y; c.y += st.y; }
    }
    // the landmarks stand before all of it
    var xmh: f32 = xg; if (tw > 0) { xmh = tx; }
    let hr: vec4f = hr0;
    if (hr.x > 0.5 && hr.y < xmh) { tw = 3; tflag = 1.0; xs = hr.y; col = vec4f(mHeroShade(hr, mode, dAz, dTh), 0.0); }
    if (tw > 0 && tw < 3) {
      tflag = 1.0; xs = tx; let u: f32 = dl.x * tx; let w: f32 = dl.y * tx; let Lw: vec4f = mLand(u, w);
      let th1: f32 = fract(tinfo.y * 7.31 + tinfo.w * 3.7); let tint: vec3f = mTint(mix(th1 * 0.66, 0.87 + 0.13 * th1, step(0.86, th1) * Lw.y));
      let tall: f32 = saturate(tinfo.x / 600.0);
      if (tw == 1) {
        // a wall: lit windows in blocks, lit floors, the glow of the street at its foot, a lit top on the tall ones
        let q: f32 = dot(vec2f(u, w), vec2f(-tn.y, tn.x));
        // (as real towers look by night from the air: a dark body, and on it a grid of small warm windows, a share of them lit, that
        // share and their colour the building's own. The windows are never drawn smaller than the picture can show)
        let dist: f32 = sqrt(tx * tx + sq(MH - tq));
        let wsz: vec2f = max(vec2f(7.0, 4.5), vec2f(dist * dAz, dist * dTh) * 4.8);
        let wq: vec2f = vec2f(q / wsz.x, tq / wsz.y); let wc: vec2f = floor(wq); let wf: vec2f = fract(wq);
        let fl: f32 = hash21(vec2f(wc.y, tinfo.z * 91.0));
        let fc: f32 = mix(1.0, 0.45, step(0.5, abs(tn.x)));
        let litK: f32 = 0.20 + 0.50 * fract(tinfo.y * 13.7);
        let on: f32 = step(1.0 - litK - 0.35 * step(0.80, fl), hash21(wc + vec2f(tinfo.y * 177.0, tinfo.z * 53.0))) * step(0.14, wf.x) * step(wf.x, 0.86) * step(0.22, wf.y) * step(wf.y, 0.80);
        let bt: f32 = fract(tinfo.w * 5.3 + tinfo.y * 2.1);
        let wcol: vec3f = mix(mix(vec3f(1.0, 0.64, 0.28), vec3f(1.0, 0.84, 0.62), step(0.68, bt)), vec3f(0.72, 0.86, 1.0), step(0.90, bt));
        let ck: f32 = fract(tinfo.w * 9.1 + tinfo.z * 3.3);
        let ccol: vec3f = mix(mix(vec3f(0.15, 0.85, 1.0), vec3f(1.0, 0.16, 0.10), step(0.40, ck)), mix(vec3f(1.0, 0.95, 0.85), vec3f(0.30, 0.42, 1.0), step(0.85, ck)), step(0.65, ck));
        if (mode < 0.5) {
          var em: vec3f = wcol * (on * (0.8 + 1.4 * hash21(wc + vec2f(3.0, 3.0))) * 2.4 * fc);
          em += vec3f(1.0, 0.70, 0.36) * (0.7 * exp(-tq / 40.0));
          em += ccol * (5.0 * tall * step(0.84, tinfo.w) * smoothstep(0.92, 0.95, tq / tinfo.x));
          col = vec4f(em, 0.0);
        } else {
          let face: f32 = 0.55 + 0.45 * saturate(dot(tn, normalize(vec2f(-0.6, -0.8))));
          col = vec4f(mix(vec3f(0.05, 0.06, 0.10), vec3f(0.13, 0.16, 0.24), face) * (0.8 + 0.4 * tinfo.z), 0.0);
        }
      } else {
        // a roof: snow by day; at night a rim of light, and on the tall ones a lit crown
        if (mode < 0.5) { col = vec4f(tint * (0.04 + 1.6 * tall * step(0.84, tinfo.w)) + vec3f(1.0, 0.2, 0.1) * (2.0 * step(0.90, tinfo.z) * tall), 0.0); }
        else { col = vec4f(vec3f(0.58, 0.64, 0.78), 0.0); }
      }
    }
    if (tw == 0) {
      let u: f32 = dl.x * xg; let w: f32 = dl.y * xg; let dist: f32 = sqrt(xg * xg + MH * MH);
      col = mGround(u, w, dl, dist * dTh / max(s - xg / MRE, 0.004), dist * dAz, mode);
    }
  }
  // (over the rim there is nothing but the landmarks, against the sky)
  if (hit == 0 && onG < 0.5) {
    let hr: vec4f = hr0;
    if (hr.x > 0.5) { tflag = 1.0; xs = hr.y; col = vec4f(mHeroShade(hr, mode, dAz, dTh), 1.0); }
  }
  if (mode < 0.5) { col = vec4f(col.rgb + mCables(dl, s, xs, dTh), tflag); }
  // ---- banks of cloud lying low where the foothills meet the city, and a few farther out: lit from below by what they lie over
  let xa: f32 = 2.0 * (MH - 1000.0) / (s + sqrt(max(s * s - 2.0 * (MH - 1000.0) / MRE, 0.0)));
  let xb: f32 = min(2.0 * (MH - 180.0) / (s + sqrt(max(s * s - 2.0 * (MH - 180.0) / MRE, 0.0))), xs);
  if (xb > xa && s > ${f(M.cloud ? 0.03 : 99)}) {
    var T: f32 = 1.0; var acc: vec3f = vec3f(0.0); let dx: f32 = (xb - xa) / 30.0;
    for (var i: i32 = 0; i < 30; i++) {
      let x: f32 = xa + (f32(i) + 0.5) * dx; let p: vec2f = dl * x; let y: f32 = mRayH(x, s);
      let dn: f32 = mCloud(p, y);
      if (dn > 0.0) {
        let a: f32 = 1.0 - exp(-dn * dx * 0.008);
        let hf: f32 = saturate((y - 180.0) / 700.0);
        var cc: vec3f = vec3f(0.30, 0.34, 0.46) * (0.35 + 0.65 * hf);
        if (mode < 0.5) { cc = mix(vec3f(1.0, 0.62, 0.32) * (2.3 * (0.6 + 0.6 * mLand(p.x, p.y).x)), vec3f(0.20, 0.22, 0.36), smoothstep(0.10, 0.70, hf)) * (0.55 + 0.9 * vnoise2(p / 170.0 + vec2f(y / 90.0, 0.0))); }
        acc += cc * (T * a); T *= 1.0 - a;
      }
      if (T < 0.03) { break; }
    }
    col = vec4f(col.rgb * T + acc, mix(col.a * T, col.a * T + 1.0 - T, step(mode, 0.5)));
  }
  return col;
}
fn frag(v: VOut) -> FOut { var o: FOut;
  let n: i32 = i32(M.m.y);
  var sum: vec4f = vec4f(0.0);
  for (var i: i32 = 0; i < 4; i++) {
    if (i < n) {
      var j: vec2f = (vec2f(f32(i & 1), f32(i / 2)) - 0.5) * 0.5;
      if (n == 1) { j = vec2f(0.0); }
      let uv: vec2f = v.uv + j / M.m.zw;
      // (the columns are packed toward straight ahead, where the eye looks, as the rows are toward the rim)
      let xw: f32 = 2.0 * uv.x - 1.0; let az: f32 = ${f(M.AZ)} * (${f(M.ak)} * xw + ${f(1 - M.ak)} * xw * xw * xw);
      let dAz: f32 = ${f(2 * M.AZ)} * (${f(M.ak)} + ${f(3 * (1 - M.ak))} * xw * xw) / M.m.z; let vv: f32 = saturate(uv.y);
      let th: f32 = ${f(M.t0)} + ${f(M.ta)} * vv + ${f(M.tb)} * vv * vv * vv * vv;
      let dTh: f32 = (${f(M.ta)} + ${f(4 * M.tb)} * vv * vv * vv) / M.m.w;
      sum += mScene(az, th + 1e-4, M.m.x, dAz * 0.5, dTh * 0.5);
    }
  }
  o.color = sum / f32(max(n, 1)); return o; }
`;
}

// ---- every frame, in the sky shader: the panoramas, the air, the horizon. (They ride in the cloud sea's two texture slots: tSeaA = E, tSeaB = A)
function metroSSL() {
  const V = Vista, f = metroF, M = Metro, dip = Math.sqrt(2 * M.H / M.RE);
  return `
// where a line of sight lies in the panoramas: x = bearing, y = row; z = how far below the planet's rim it runs (rad; the rim is bent
// down to either side)
fn metroUV(d: vec3f) -> vec3f {
  let az: f32 = atan2(d.x, -d.z) - ${f(V.cityAz)};
  let a: f32 = atan2(sin(az), cos(az));
  let th: f32 = atan2(-d.y, length(d.xz)) + ${f(M.lift)} - ${f(M.bend)} * (1.0 - cos(a));
  let tc: f32 = max(th, ${f(M.t0)}) - ${f(M.t0)};
  var v: f32 = min(tc / ${f(M.ta)}, 1.0);
  for (var i: i32 = 0; i < 4; i++) { let c: f32 = v * v * v; v -= (${f(M.ta)} * v + ${f(M.tb)} * c * v - tc) / (${f(M.ta)} + ${f(4 * M.tb)} * c); }
  let xa: f32 = clamp(a / ${f(M.AZ)}, -1.0, 1.0); var x: f32 = xa;
  for (var i: i32 = 0; i < 5; i++) { x -= (${f(M.ak)} * x + ${f(1 - M.ak)} * x * x * x - xa) / (${f(M.ak)} + ${f(3 * (1 - M.ak))} * x * x); }
  return vec3f(0.5 * x + 0.5, saturate(v), th - ${f(dip)});
}
fn metroPlain(d: vec3f, mu: f32, haze: vec3f) -> vec3f {
  let q: vec3f = metroUV(d); let ba0: f32 = atan2(d.x, -d.z) - ${f(V.cityAz)}; let ba: f32 = atan2(sin(ba0), cos(ba0)); let xq: f32 = 2.0 * q.x - 1.0; let night: f32 = U.skyP.z;
  let s: f32 = tan(min(q.z + ${f(dip)}, 1.4));
  let dist: f32 = 2.0 * ${f(M.H)} / max(s + sqrt(max(s * s - ${f(2 * M.H / M.RE)}, 0.0)), 0.03);
  let lod: f32 = max(log2(2.0 * U.camRight.w * U.res.w / (${f(2 * M.AZ / M.W)} * (${f(M.ak)} + ${f(3 * (1 - M.ak))} * xq * xq))), 0.0);
  let ex: f32 = 1.0 - smoothstep(${f(M.AZ - 0.08)}, ${f(M.AZ)}, abs(ba));
  let E: vec4f = texLod(tSeaA, q.xy, lod); let A: vec4f = texLod(tSeaB, q.xy, lod);
  // the lights shimmer in the air between: each a little, never together
  let tw: f32 = 0.82 + 0.72 * texLod(tDetail, q.xy * vec2f(37.0, 19.0) + vec2f(U.camPos.w * 0.021, U.camPos.w * 0.013), 0.0).a * texLod(tDetail, q.xy * vec2f(23.0, 41.0) - vec2f(U.camPos.w * 0.017, 0.0), 0.0).a;
  let lit: vec3f = (U.sunCol.rgb * (saturate(U.sunDir.y + 0.15) * 0.9) + U.ambSky.rgb * 1.1 + U.twi.rgb * 0.3) * (1.0 - 0.80 * night);
  // above the rim: the air, and against it the landmarks that stand taller than the mountain (E.a marks them)
  if (q.z <= 0.0) { return mix(haze, A.rgb * (lit + vec3f(0.016, 0.024, 0.07) * night) + E.rgb * (night * ${f(M.lamp)}), saturate(E.a) * ex); }
  // water: a dark mirror for the sky, with a sheen toward the horizon
  let mir: vec3f = (vistaHaze(vec3f(d.x, -d.y, d.z)) + vec3f(0.02, 0.05, 0.14) * night) * (0.25 + 0.55 * pow(1.0 - saturate(s), 6.0)) + vec3f(0.018, 0.04, 0.12) * night;
  // the lights are points, not a paste: over the baked glow, two sizes of sparks (a few of them far brighter than the rest), each
  // fixed to its bearing so that it stays put
  let sa: vec2f = vec2f(ba, q.z);
  var spark: f32 = 0.0;
  for (var i: i32 = 0; i < 2; i++) {
    let cs: f32 = mix(0.0021, 0.0052, f32(i)); let g: vec2f = sa / cs + vec2f(f32(i) * 37.0, 11.0);
    let cl: vec2f = floor(g); let h: vec2f = hash22(cl + vec2f(3.0, 501.0));
    let o: vec2f = fract(g) - 0.5 - (h - 0.5) * 0.55; let b: f32 = hash21(cl + vec2f(77.0, 9.0));
    // each flickers by itself, as far lights do through moving air: quicker and deeper the farther off
    let ft: f32 = U.camPos.w * (2.6 + 5.0 * h.y); let fk: f32 = 0.5 + 0.5 * sin(ft + 6.283 * h.x) * sin(ft * 0.37 + 9.0 * b);
    spark += exp(-dot(o, o) * mix(26.0, 34.0, f32(i))) * b * b * b * b * mix(3.4, 10.0, f32(i)) * mix(1.0, 0.25 + 1.5 * fk, 0.35 + 0.65 * smoothstep(5000.0, 16000.0, dist));
  }
  let El: f32 = luma(E.rgb);
  let farK: f32 = smoothstep(5000.0, 16000.0, dist);
  let warmK: f32 = saturate((E.r - E.b) / max(El, 0.001) * 2.5) * (1.0 - A.a) * (1.0 - E.a);
  let Ec: vec3f = mix(E.rgb, vec3f(1.0, 0.50, 0.13) * El * 1.3, 0.62 * warmK) * mix(mix(0.85 + 0.4 * spark, 0.36 + spark, farK), 1.0, E.a);
  let nightGround: vec3f = A.rgb * vec3f(0.016, 0.024, 0.07) * night;
  // the traffic on the avenues of the middle city: beads of light going slowly, red where they drive away, white where they come
  // (the line of sight is taken back to the ground it was baked from)
  let gp: vec2f = vec2f(sin(ba), cos(ba)) * dist - vec2f(${f(M.DC[0])}, ${f(M.DC[1])});
  let gg: vec2f = vec2f(gp.x * ${f(Math.cos(0.07))} + gp.y * ${f(Math.sin(0.07))}, -gp.x * ${f(Math.sin(0.07))} + gp.y * ${f(Math.cos(0.07))});
  let pix: f32 = 2.0 * U.camRight.w * U.res.w * dist; let pal: f32 = pix / max(s, 0.05);
  var cars: vec3f = vec3f(0.0);
  {
    let dax: f32 = (fract(gg.x / 720.0 + 0.5) - 0.5) * 720.0; let lane: f32 = floor(gg.x / 720.0 + 0.5);
    let ml: f32 = exp(-sq(dax / max(14.0, 0.7 * pix)));
    let L: f32 = max(90.0, 2.5 * pal);
    let p1: f32 = (gg.y - 26.0 * U.camPos.w) / L + lane * 0.37; let p2: f32 = (gg.y + 26.0 * U.camPos.w) / (L * 1.3) + lane * 0.61;
    let b1: f32 = step(0.45, hash21(vec2f(floor(p1), lane + 7.0))) * exp(-sq((fract(p1) - 0.5) * 3.2));
    let b2: f32 = step(0.45, hash21(vec2f(floor(p2), lane + 91.0))) * exp(-sq((fract(p2) - 0.5) * 3.2));
    cars += (vec3f(1.0, 0.10, 0.05) * (b1 * 3.0) + vec3f(1.0, 0.93, 0.80) * (b2 * 2.2)) * ml;
    let day: f32 = (fract(gg.y / 960.0 + 0.5) - 0.5) * 960.0; let lan2: f32 = floor(gg.y / 960.0 + 0.5);
    let m2: f32 = exp(-sq(day / max(14.0, 0.7 * pal)));
    let L2: f32 = max(90.0, 2.5 * pix);
    let p3: f32 = (gg.x - 24.0 * U.camPos.w) / L2 + lan2 * 0.53; let p4: f32 = (gg.x + 24.0 * U.camPos.w) / (L2 * 1.2) + lan2 * 0.29;
    let b3: f32 = step(0.5, hash21(vec2f(floor(p3), lan2 + 3.0))) * exp(-sq((fract(p3) - 0.5) * 3.2));
    let b4: f32 = step(0.5, hash21(vec2f(floor(p4), lan2 + 57.0))) * exp(-sq((fract(p4) - 0.5) * 3.2));
    cars += (vec3f(1.0, 0.10, 0.05) * (b3 * 2.6) + vec3f(1.0, 0.93, 0.80) * (b4 * 2.0)) * m2;
  }
  // (only where a lit road lies under the eye: not on towers, water, the hills, or the far boroughs whose streets run otherwise)
  cars *= (1.0 - saturate(E.a)) * (1.0 - A.a) * saturate(luma(E.rgb) * 0.9) * (1.0 - smoothstep(6200.0, 7000.0, length(gp))) * smoothstep(9300.0, 10200.0, dist);
  var c: vec3f = (mix(A.rgb * lit + nightGround, A.rgb * lit * 0.6 + mir, A.a) + (Ec * mix(tw, 1.0, E.a) + cars) * (night * ${f(M.lamp)})) * ex;
  // the air: by night a deep blue that the city warms a little, thickening toward the rim
  let air: vec3f = mix(haze, vec3f(0.035, 0.06, 0.16) + vec3f(0.10, 0.07, 0.05) * luma(E.rgb), night * 0.85);
  c = mix(air, c, exp(-dist / mix(34000.0, 52000.0, night)));
  return mix(haze, c, smoothstep(0.0, 0.004, q.z));
}
// the planet's rim: a thin bright line of blue air, and its glow over it (added to the sky all round)
fn metroDome(d: vec3f) -> vec3f {
  let q: vec3f = metroUV(d); let e: f32 = max(-q.z, 0.0);
  return (vec3f(0.30, 0.52, 1.0) * (0.55 * exp(-e / 0.006) + 0.16 * exp(-e / 0.035)) + vec3f(0.55, 0.42, 0.40) * (0.05 * exp(-e / 0.05))) * (0.42 * mix(0.35, 1.0, U.skyP.z)) * (1.0 - smoothstep(0.0, 0.012, q.z));
}
`;
}
