// ---------------------------------------------------------------- 光圈挑战（试玩版，?dev 下的 Variants「光圈挑战」，默认关）
// The rings of the ring challenge. The nearest ring is a ring of glowing dust round a glowing tube (a band with body, not a line: grains in a
// tube a little thicker than the core, wandering on the spot and blinking, a few drifting outward, a faint aurora curtain on it: green low,
// violet high, like the game's aurora). The next three are only a flame each, fainter the farther they are, so the line ahead can be read. As
// the skier closes on the ring in front, the next flame swells in place and opens into a ring; the ring passed scatters.
// They are things in the world, drawn in the scene pass with the scene's depth (用户 04:58 UTC: 必须是 physical 的东西，人在前面要挡住，要有
// 体积，要有影子): the skier, the trees and the hill hide them pixel by pixel, the ring's tube casts its shadow into the sun's shadow map, and
// its light falls on the snow round it (and on the skier riding through). A flame's glow is a wide sheet of lit air at the flame's own depth,
// so what stands in front of the flame cuts it, and over a ridge the glow above the ridge line is still seen.
// Rings are thrown at random ahead of the skier while the mode is on: on the run, inside the piste, away from trees and rocks, of different
// sizes; after a flagged kicker a ring hangs in the air of the jump.
const Rings = (() => {
  const RG = { on: false, rings: [], passed: 0, missed: 0, hud: null, n: 0, pipes: [] };
  if (typeof Variants !== 'undefined') Variants.def('rings', '光圈挑战', [['off', '关'], ['on', '开']], 'off');
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = x => 1 - Math.pow(1 - cl(x, 0, 1), 3);
  const SIZES = [2.2, 3, 3.5, 4.5, 5.5];
  const AHEAD = 4;                 // the ring in front + three flames
  const GAP = [38, 62];            // metres between rings
  const NA = 128, NT = 10, TORUS_N = NA * NT * 6, TONGUES = 56;
  let gfx = null, pDust = null, pDustSh = null, pFlame = null, pLight = null;
  let lastS = null, rnd = 1, lastT = 0, serial = 0, drawList = [];
  const pc = {}, tn = {}, rk = {};
  const rand = () => { rnd = (rnd * 16807) % 2147483647; return (rnd - 1) / 2147483646; };

  // ---- where the rings go
  function lipOf(f) { const xk = s => Course.at(s, pc).cx + f.u, hgt = s => Course.height(xk(s), -s, 0.5); let sc = f.s + f.len, best = 1e9; for (let s = f.s + 2; s <= f.s + f.len + 6; s += 0.5) { const c = hgt(s + 0.5) + hgt(s - 0.5) - 2 * hgt(s); if (c < best) { best = c; sc = s; } } return { s: sc, y: hgt(sc), x: xk(sc) }; }
  function kickerIn(s0, s1) { for (let b = Math.floor((s0 - 40) / 32); b <= Math.floor(s1 / 32); b++) for (const f of Course.feats.get(b) || []) if (f.mark && f.s + f.len > s0 && f.s < s1) return f; return null; }
  function clear(s, u, hw) { for (const d of [0, -2.5, 2.5, -5, 5, -7.5, 7.5]) { const uu = cl(u + d, -hw + 4, hw - 4), x = Course.at(s, pc).cx + uu; let ok = true; for (const dz of [-6, 0, 6]) { Course.nearTree(x, -s + dz, tn); if (tn.ok && !tn.soft && tn.d < 5.5) ok = false; } if (Course.rockHit && Course.rockHit(x, -s, rk)) ok = false; if (ok) return uu; } return null; }
  function spawn() {
    const last = RG.rings[RG.rings.length - 1], s0 = last ? last.s : -Game.s.p[2] + 25, u0 = last ? last.u : Game.s.p[0] - Course.at(-Game.s.p[2], pc).cx;
    let s = s0 + GAP[0] + (GAP[1] - GAP[0]) * rand();
    const f = kickerIn(s0 + 10, s + 20);
    if (f) { const lip = lipOf(f), sr = lip.s + 8, c = Course.at(sr, pc); RG.rings.push({ id: serial++, s: sr, u: f.u, x: c.cx + f.u, y: lip.y - 0.7, r: 3, air: true, born: lastT, grow: -1, pass: -1, hit: 0, splash: -1 }); return; }
    const c = Course.at(s, pc), hw = c.hw || 14;
    let u = cl(u0 + (rand() < 0.5 ? -1 : 1) * (4 + 7 * rand()), -hw * 0.55, hw * 0.55);
    const uu = clear(s, u, hw); if (uu === null) { RG.rings.push({ id: serial++, s, skip: true }); return; }
    // a whole ring, always (用户 04:47 UTC: 不要一会儿半个): it stands clear of the snow under all of it, its foot a hand above the highest point
    // (用户 05:16 UTC: 圈再靠下一点，要从里面开过去、腿要在圈里): the ring's foot is set into the snow a hand deep where the skier rides through
    // it, so the skis go through the ring, not under it. Only the lowest stretch of the arc is under the snow; the sides stand clear of it
    const r = SIZES[Math.floor(rand() * SIZES.length)], x = c.cx + uu; let top = -1e9; for (let i = -3; i <= 3; i++) top = Math.max(top, Course.height(x + r * 0.35 * i / 3, -s, 0.5));
    RG.rings.push({ id: serial++, s, u: uu, x, y: top + r - 0.12, r, air: false, born: lastT, grow: -1, pass: -1, hit: 0, splash: -1 });
  }
  function reset() { RG.rings.length = 0; RG.passed = RG.missed = 0; rnd = 1 + Math.floor((Date.now() % 100000)); lastS = null; drawList = []; }

  // ---- each frame, before the game draws
  function update(T) {
    const S = Game.s, s = -S.p[2];
    if (lastS !== null && (s < lastS - 30 || s > lastS + 200)) reset();
    lastS = s;
    RG.rings = RG.rings.filter(r => !(r.pass >= 0 && T - r.pass > 2.4));
    let live = RG.rings.filter(r => r.pass < 0).length;
    for (let tries = 0; live < AHEAD && tries < 20; tries++) { spawn(); const r = RG.rings[RG.rings.length - 1]; if (r.skip) RG.rings.pop(); else live++; }
    const ahead = RG.rings.filter(r => r.pass < 0);
    const cur = ahead[0]; if (!cur) return;
    if (cur.grow < 0) cur.grow = T;          // the first ring of a run opens at once
    const v = Math.max(6, S.speed || 0), dCur = cur.s - s;
    if (dCur < Math.max(14, v * 0.8) && ahead[1] && ahead[1].grow < 0) ahead[1].grow = T;          // nearly there: the next flame swells and opens
    // (用户 05:16 UTC: 离圈一两米、头碰到圈面之前就要 splash 散开，半米一米时能不能过已经定了): the splash starts 1.6 m before the ring's plane
    if (dCur < 1.6 && cur.splash < 0) {
      const dy = (S.p[1] + 0.9) - cur.y, dx = S.p[0] - cur.x;
      cur.splash = T; cur.hit = cur.air ? (Math.hypot(dx, dy) < cur.r) : (Math.abs(dx) < cur.r * 0.85);
    }
    if (dCur <= 0) {          // through or past it
      const dy = (S.p[1] + 0.9) - cur.y, dx = S.p[0] - cur.x;
      cur.hit = cur.air ? (Math.hypot(dx, dy) < cur.r) : (Math.abs(dx) < cur.r * 0.85);          // (ground rings: judged across only, the skier rides through the lower part)
      if (cur.splash < 0) cur.splash = T;
      cur.pass = T; if (cur.hit) RG.passed++; else RG.missed++;
      if (ahead[1] && ahead[1].grow < 0) ahead[1].grow = T;
    }
  }
  // what each ring is this frame: how far open, how far scattered, how bright (far ones barely there), and its flame
  function prep(T) {
    const S = Game.s, s = -S.p[2], cam = Render.cam.pos, o = Render.origin, night = cl(((Sky.night || 0) - 0.2) / 0.6, 0, 1);
    const ahead = RG.rings.filter(r => r.pass < 0);
    drawList = [];
    for (const r of RG.rings) {
      const dist = Math.hypot(r.x - cam[0], r.y - cam[1], -r.s - cam[2]), ord = r.pass >= 0 ? 0 : ahead.indexOf(r);
      const sz = Math.sqrt(r.r / 4.5), near = Math.pow(cl(1 - (dist - 25) / 170, 0.04, 1), 1.6);
      const grown = r.grow >= 0 ? cl((T - r.grow) / 0.9, 0, 1) : 0;
      const dis = r.splash >= 0 ? cl((T - r.splash) / 2.2, 0, 1) : 0;
      const ordK = ord <= 1 ? 1 : ord === 2 ? 0.62 : 0.4;
      const flameA = (grown < 1 ? (1 - cl((grown - 0.35) / 0.35, 0, 1)) : 0) * near * ordK * cl((T - r.born) / 0.6, 0, 1);
      const open = grown > 0.3 ? ease((grown - 0.3) / 0.6) : 0, A = cl((grown - 0.3) / 0.3, 0, 1) * Math.max(0.35, near);
      const c = [r.x - o[0], r.y - o[1], -r.s - o[2]];
      drawList.push({ r, dist, c, sz, near, grown, dis, open, A, flameA, night, ord, flameSc: (1 + 1.6 * ease(grown / 0.35)) * (ord <= 1 ? 1 : ord === 2 ? 0.85 : 0.72), tint: ord <= 1 ? 0 : ord === 2 ? 1 : 2, hitK: r.hit || r.splash < 0 ? 1 : 0.5 });
    }
    drawList.sort((a, b) => b.dist - a.dist);          // far first: the near ring's tube writes depth over what lies behind it
  }
  function hud() {
    if (!RG.hud) { RG.hud = document.createElement('div'); RG.hud.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);font:500 13px/1 system-ui,sans-serif;letter-spacing:.12em;color:rgba(255,255,255,.85);text-shadow:0 1px 3px rgba(0,0,0,.45);pointer-events:none;z-index:3'; document.body.appendChild(RG.hud); }
    RG.hud.style.display = RG.on ? '' : 'none';
    const t = '光圈 ' + RG.passed + ' / ' + (RG.passed + RG.missed); if (RG.hud.textContent !== t) RG.hud.textContent = t;
  }

  // ---- the GPU side
  const ringU = (d, T) => ({ a: [d.c[0], d.c[1], d.c[2], d.r.r], b: [d.open, d.dis, d.A, d.near], c: [T, d.r.id % 4096, d.hitK, d.sz], d: [d.night, 0, d.grown, 0], e: [Math.round(5200 * d.sz), Math.round(500 * d.sz), 0, 0] });
  const ringLive = d => d.grown > 0.3 && d.dis < 1 && d.open > 0.01;
  RG.init = function (g) {
    gfx = g;
    const lib = [SL.common, SL.hash, SL.fog, RING_SSL];
    const UR = { a: 'vec4f', b: 'vec4f', c: 'vec4f', d: 'vec4f', e: 'vec4f' };
    pDust = gfx.pipeline({
      name: 'ringDust', lib: lib.concat([DUST_SSL]), buffers: [], topology: 'strip', cull: 'none', blend: 'premul', depthWrite: false, depthFunc: 'lequal',
      varyings: { uv: 'vec2f', col: 'vec4f', sh: 'vec4f' }, uniforms: UR, textures: { tSky: '2d' }, vs: DUST_VS, fs: SPARK_FS,
    });
    pDustSh = gfx.pipeline({
      name: 'ringDustShadow', lib: [SL.common, SL.hash, RING_SSL, DUST_SSL], buffers: [], topology: 'strip', varyings: { uv: 'vec2f' }, uniforms: UR, textures: {}, colorFormat: null, cull: 'none', depthBias: 2, depthBiasSlope: 2.5,
      vs: DUST_SH_VS, fs: DUST_SH_FS,
    });
    pFlame = gfx.pipeline({
      name: 'ringFlame', lib, buffers: [], topology: 'strip', cull: 'none', blend: 'premul', depthWrite: false, depthFunc: 'lequal',
      varyings: { uv: 'vec2f', col: 'vec4f', sh: 'vec4f' }, uniforms: { a: 'vec4f', b: 'vec4f', c: 'vec4f' }, textures: { tSky: '2d' }, vs: FLAME_VS, fs: SPARK_FS,
    });
    pLight = gfx.pipeline({
      name: 'ringLight', lib: [SL.common, SL.fog, SL.depth, RING_SSL], buffers: [], topology: 'strip', cull: 'none', blend: 'add', depth: false, depthTest: false,
      varyings: { uv: 'vec2f' }, uniforms: { a: 'vec4f', b: 'vec4f', c: 'vec4f' }, textures: { tDepth: 'depth', tSky: '2d' }, vs: LIGHT_VS, fs: LIGHT_FS,
    });
    RG.pipes = [pDust, pDustSh, pFlame, pLight];
    if (gfx.finishPipelineAsync) for (const P of RG.pipes) gfx.finishPipelineAsync(P).catch(e => console.warn('rings pipeline', P.name, e && e.message ? e.message : e));
  };
  const active = () => RG.on && gfx && typeof Game !== 'undefined' && Game.s && (Game.mode === 'run' || Game.mode === 'hold') && drawList.length;
  RG.drawShadow = function () {
    if (!active()) return;
    for (const d of drawList) if (ringLive(d)) { const u = ringU(d, lastT % 4096); gfx.draw(pDustSh, { u, count: 4, instances: u.e[0] + u.e[1] }); }
  };
  RG.drawScene = function () {
    if (!active()) return;
    const T = lastT % 4096, tex = { tSky: Sky.lut };
    for (const d of drawList) {
      if (d.flameA > 0.01) gfx.draw(pFlame, { u: { a: [d.c[0], d.c[1], d.c[2], d.flameSc], b: [d.flameA, d.sz, d.tint, 0], c: [T, d.r.id % 4096, d.night, 0] }, tex, count: 4, instances: 2 + TONGUES });
      if (ringLive(d)) {
        const u = ringU(d, T);
        gfx.draw(pDust, { u, tex, count: 4, instances: u.e[0] + u.e[1] + u.e[2] });
      }
    }
  };
  // the ring's light on what is round it: the snow under it, the skier riding through, a tree beside it
  RG.drawLight = function (R) {
    if (!active()) return;
    const tex = { tDepth: R.depth, tSky: Sky.lut };
    for (const d of drawList) {
      const k = d.night * 0.85 + 0.15;
      if (ringLive(d)) { const I = 0.16 * k * d.A * d.near * Math.pow(1 - d.dis, 2); if (I > 0.002) gfx.draw(pLight, { u: { a: [d.c[0], d.c[1], d.c[2], d.r.r * d.open], b: [0.10, 0.95, 0.55, I], c: [d.r.r * d.open + 4.5, 0, 0, 0] }, tex, count: 4 }); }
      if (d.flameA > 0.01) { const I = 0.30 * k * d.flameA * d.flameSc; gfx.draw(pLight, { u: { a: [d.c[0], d.c[1], d.c[2], 0], b: [0.15, 1.0, 0.80, I], c: [5.5 * Math.min(1.6, d.flameSc), 0, 0, 0] }, tex, count: 4 }); }
    }
  };

  RG.frame = function () {
    const want = typeof Variants !== 'undefined' && Variants.val.rings === 'on';
    if (want !== RG.on) { RG.on = want; reset(); hud(); }
    // (用户 05:16 UTC: 拍照时光圈不见了): held (the pause menu, 拍照) the world stands still, and so do the rings: drawn as they were, time stopped
    if (RG.on && typeof Game !== 'undefined' && Game.mode === 'hold') return;
    if (!RG.on || typeof Game === 'undefined' || !Game.s || Game.mode !== 'run') { drawList = []; if (RG.hud) RG.hud.style.display = 'none'; return; }
    const T = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000; lastT = T;
    RG.n++; try { update(T); prep(T); hud(); } catch (e) { drawList = []; if (!RG.err) { RG.err = 1; console.warn('rings:', e); } }
  };
  // hang on the game's own draw: the rings are worked out just before each frame, drawn inside it by the render passes
  if (typeof Render !== 'undefined') {
    const R0 = Render.render; Render.render = function () { RG.frame(); return R0.apply(this, arguments); };
    const I0 = Render.init; Render.init = function (g) { const out = I0.apply(this, arguments); try { RG.init(g); } catch (e) { console.warn('rings init:', e); } return out; };
    // (a pipeline that failed to build must never take the game's frame down with it: the rings are then simply not drawn)
    const safe = f => R => { try { f(R); } catch (e) { if (!RG.gerr) { RG.gerr = 1; console.warn('rings draw:', e && e.message ? e.message : e); } } };
    Render.passes.shadow.push(safe(R => RG.drawShadow(R)));
    Render.passes.transparent.push(safe(R => RG.drawScene(R)));
    Render.passes.fx.push(safe(R => RG.drawLight(R)));
  }
  return RG;
})();

// ---- shaders. Colours are linear; light is in units of film white (ringE: one over the exposure, so 1 is white on the screen at any hour)
// the ring's tube: NA segments round, NT round the tube, a triangle list. Its radius breathes with the same wave that runs round the curtain
const RING_SSL_GEO = `
struct RT { pos: vec3f, nrm: vec3f, ang: f32 }
fn ringTube() -> f32 { return 0.16 * M.c.w * (0.4 + 0.6 * M.b.x); }
fn ringTorus(vid: u32, R: f32, rc: f32, T: f32, wob: f32) -> RT {
  var o: RT;
  let qd: u32 = vid / 6u; let k: u32 = vid % 6u;
  let i: u32 = qd / 10u; let j: u32 = qd % 10u;
  let di: f32 = select(0.0, 1.0, k == 1u || k == 4u || k == 5u);
  let dj: f32 = select(0.0, 1.0, k == 2u || k == 3u || k == 5u);
  let a: f32 = (f32(i) + di) / 128.0 * 6.2831853;
  let b: f32 = (f32(j) + dj) / 10.0 * 6.2831853;
  let rr: f32 = rc * (1.0 + 0.18 * sin(a * 5.0 - T * 1.6 + sin(a * 3.0 + T * 0.7)));
  let Rw: f32 = R + wob * sin(a * 7.0 + T * 0.9);
  let n: vec3f = vec3f(cos(a) * cos(b), sin(a) * cos(b), sin(b));
  o.pos = vec3f(cos(a) * Rw, sin(a) * Rw, 0.0) + n * rr; o.nrm = n; o.ang = a;
  return o;
}
`;
const RING_SSL = RING_SSL_GEO + `
fn ringE() -> f32 { return 1.0 / max(U.ambSky.w, 1e-4); }
fn ringGrn(n: f32) -> vec3f { return mix(vec3f(0.033, 0.896, 0.392), vec3f(0.021, 1.0, 0.262), n); }
fn ringVio(n: f32) -> vec3f { return mix(vec3f(0.305, 0.188, 0.791), vec3f(0.402, 0.045, 0.716), n); }
// green low, violet high; by day the violet is held back (pale violet on bright snow and sky read as a missing top half)
fn ringHue(a: f32, e: f32, n: f32) -> vec3f { return mix(ringGrn(n), ringVio(n), saturate((sin(a) + 1.0) * 0.5 * mix(0.3, 0.75, n) + e * mix(0.5, 1.0, n))); }
// a grain on the screen: drawn at its true size, or minPx, whichever is larger (k: how much of the drawn disc it really fills, so a far
// grain enlarged to stay a pixel keeps its own light), streaked from p0 to p1. Its depth is p0's: the scene's depth test hides it
struct RQ { clip: vec4f, uv: vec2f, k: f32, hl: f32 }
fn ringQuad(corner: vec2f, p0: vec3f, p1: vec3f, rw: f32, minPx: f32) -> RQ {
  var q: RQ; q.clip = vec4f(0.0, 0.0, -2.0, 1.0); q.uv = vec2f(0.0); q.k = 0.0; q.hl = 0.0;
  let c0: vec4f = U.viewProj * vec4f(p0, 1.0); let c1: vec4f = U.viewProj * vec4f(p1, 1.0);
  if (c0.w < 0.3 || c1.w < 0.3) { return q; }
  let asp: f32 = U.camUp.w;
  let s0: vec2f = c0.xy / c0.w * vec2f(asp, 1.0); let s1: vec2f = c1.xy / c1.w * vec2f(asp, 1.0);
  let rt: f32 = rw / (c0.w * U.camRight.w);
  let r: f32 = max(rt, minPx * 2.0 * U.res.w);
  let ax: vec2f = s1 - s0; let L: f32 = length(ax);
  var dir: vec2f = vec2f(0.0, 1.0); if (L > 1e-6) { dir = ax / L; }
  let nr: vec2f = vec2f(-dir.y, dir.x);
  let sp: vec2f = mix(s0, s1, corner.y * 0.5 + 0.5) + dir * (corner.y * r) + nr * (corner.x * r);
  q.clip = vec4f(sp.x / asp * c0.w, sp.y * c0.w, c0.z, c0.w);
  q.hl = 0.5 * L / r;
  q.uv = vec2f(corner.x, corner.y * (1.0 + q.hl));
  q.k = min(1.0, sq(rt / r));
  return q;
}
`;
// the grains: kind 0 the dense tube of dust round the core, kind 1 the outer grains drifting off and turning violet, kind 2 the curtain's threads.
// Each is a pure function of (index, time): a life of a few seconds, then it is born again somewhere else on the ring
// one grain of a ring, a pure function of (index, time): where it is, how bright, how big
const DUST_SSL = `
struct DG { p: vec3f, b: f32, wsz: f32, minPx: f32, up: f32, col: vec3f }
fn dustGrain(i: u32) -> DG {
  var g: DG;
  let C: vec3f = M.a.xyz; let R0: f32 = M.a.w; let open: f32 = M.b.x; let dis: f32 = M.b.y;
  let A: f32 = M.b.z; let nearK: f32 = M.b.w; let T: f32 = M.c.x; let rid: u32 = u32(M.c.y); let hitK: f32 = M.c.z; let sz: f32 = M.c.w;
  let n: f32 = M.d.x; let grown: f32 = M.d.z;
  let NI: u32 = u32(M.e.x); let NO: u32 = u32(M.e.y); let NC: f32 = M.e.z;
  var kind: u32 = 0u; if (i >= NI) { kind = 1u; } if (i >= NI + NO) { kind = 2u; }
  let hs: vec3f = hashu3(i * 7u + rid * 7919u + 11u);
  var L: f32 = mix(1.2, 2.2, hs.x); if (kind == 1u) { L = mix(1.0, 1.8, hs.x); }
  let ph: f32 = (T + hs.y * L) / L; let u: f32 = fract(ph); let gen: u32 = u32(floor(ph));
  let h: vec3f = hashu3(i * 13u + gen * 104729u + rid * 7919u + 3u);
  let h2: vec3f = hashu3(i * 17u + gen * 15485863u + rid * 31u + 5u);
  var ang: f32 = h.x * 6.2831853; var rr: f32 = R0; var dz: f32 = 0.0; var dy: f32 = 0.0;
  var b: f32 = 0.0; var wsz: f32 = 0.02; var minPx: f32 = 1.3; var col: vec3f = vec3f(0.0); var up: f32 = 0.0;
  if (kind == 0u) {
    // (用户 05:22 UTC: 整个圈要明显是点组成的，中间很密，点都在动、动得快，轻、飘): no solid tube any more. The grains crowd toward the
    // ring's middle line (rad ~ h.y squared), each running along the ring at its own pace one way or the other and jittering fast on its spot
    let rad: f32 = 0.36 * sz * h.y * h.y; let th: f32 = h.z * 6.2831853;
    let jf: f32 = 3.0 + 4.0 * h2.x;
    rr = R0 + rad * cos(th) + 0.035 * sz * sin(T * jf + h.x * 40.0);
    dz = rad * sin(th) + 0.035 * sz * cos(T * jf * 0.83 + h.y * 40.0);
    let flow: f32 = (0.5 + 1.4 * h2.y) * select(-1.0, 1.0, h2.z > 0.5) / max(R0, 1.0);
    ang = ang + flow * u * L + 0.02 * sin(T * jf * 1.3 + h.z * 40.0);
    let fade: f32 = min(1.0, min(u / 0.12, (1.0 - u) / 0.2));
    let blink: f32 = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(T * (4.0 + 6.0 * h2.x) + h.y * 30.0), 3.0);
    let qn: f32 = saturate((grown - (0.3 + 0.45 * h2.y)) / 0.25);
    b = fade * blink * qn * (1.0 - 0.5 * h.y);
    wsz = 0.032 * sz * (0.6 + 0.9 * h2.z); minPx = 1.4;
    col = mix(ringHue(ang, 0.0, n), vec3f(0.9, 1.0, 0.97), 0.4 * h2.x * h2.x);
  } else if (kind == 1u) {
    let ou: f32 = 0.15 + 0.85 * h2.x;
    rr = R0 + (h.y - 0.5) * 0.3 * sz + ou * 2.0 * sz * u;
    dz = (h.z - 0.5) * 0.6 * sz * (0.3 + u);
    dy = 0.5 * u * sz;
    ang = ang + 0.05 * sin(T + h.y * 30.0);
    b = min(1.0, u / 0.2) * (1.0 - u) * 0.6;
    wsz = 0.08 * sz * (0.9 + 0.8 * h2.y); minPx = 2.2;
    col = ringHue(ang, 0.4 * u, n);
  } else {
    let j: f32 = f32(i - NI - NO);
    ang = (j + 0.5 * hs.z) / NC * 6.2831853;
    let w: f32 = pow(0.5 + 0.5 * sin(ang * 5.0 - T * 1.6 + sin(ang * 3.0 + T * 0.7)), 3.0);
    let curt: f32 = sq(saturate((grown - 0.6) / 0.4)) * (1.0 - saturate(dis * 2.5));
    b = 0.55 * w * curt;
    rr = R0 + 0.30 * sz * (hs.x - 0.5); dz = 0.30 * sz * (hs.y - 0.5);
    wsz = 0.02 * sz; minPx = 1.1; up = (0.25 + 0.35 * w) * sz;
    col = ringHue(ang, 0.25, n);
  }
  if (dis > 0.0) {
    let hd: vec3f = hashu3(i * 23u + rid * 101u + 9u);
    // a splash: a quick burst out of the tube (half its way in the first half second), then a slow drift and a slow fade. The grains are
    // thrown every way off the tube, outward and up a little, and carried on along the line the skier rides (toward -z)
    let d: f32 = saturate(dis * (1.0 + 0.5 * hd.x) - 0.06 * hd.y); let e: f32 = 1.0 - pow(1.0 - d, 4.0);
    let th2: f32 = hd.y * 6.2831853; let sp: f32 = (0.5 + 1.3 * hd.z) * sz;
    rr = rr + e * (sp * cos(th2) + R0 * 0.25 * hd.x);
    dz = dz + e * (sp * sin(th2) - (0.6 + 2.6 * hd.z));
    dy = dy + e * (0.3 + 0.9 * hd.x);
    ang = ang + e * (hd.z - 0.5) * 0.25;
    b = b * (1.0 + 2.2 * exp(-d * 10.0)) * pow(1.0 - d, 1.3) * hitK;
  }
  let ro: f32 = rr * open;
  g.p = C + vec3f(cos(ang) * ro, sin(ang) * ro + dy, dz);
  g.b = b * A; g.wsz = wsz; g.minPx = minPx; g.up = up; g.col = col;
  return g;
}
`;
const DUST_VS = `
fn vert(a: VIn) -> VOut { var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  v.clip = vec4f(0.0, 0.0, -2.0, 1.0); v.uv = vec2f(0.0); v.col = vec4f(0.0); v.sh = vec4f(0.0);
  let g: DG = dustGrain(a.iid);
  if (g.b < 0.003) { return v; }
  let q: RQ = ringQuad(corner, g.p, g.p + vec3f(0.0, g.up, 0.0), g.wsz, g.minPx);
  let fog: f32 = 1.0 - fogAmount(g.p);
  let bright: f32 = g.b * M.b.w * mix(1.0, 1.2, M.d.x) * fog;
  v.clip = q.clip; v.uv = q.uv; v.sh = vec4f(q.hl, 0.0, 0.0, 0.0);
  v.col = vec4f(g.col * (bright * sqrt(q.k) * 6.0 * ringE()), mix(0.18, 0.0, M.d.x) * saturate(bright) * sqrt(q.k));
  return v; }
`;
// the grains' own shadow (用户 05:23 UTC: 影子也要由点投下、跟着点一起动): each grain that is lit enough is a small disc in the sun's shadow
// map, a little larger than the grain (one texel is 6 cm), so the shadow on the snow is a dappled band that moves and flickers with them
const DUST_SH_VS = `
fn vert(a: VIn) -> VOut { var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  v.uv = corner; v.clip = vec4f(0.0, 0.0, -2.0, 1.0);
  let g: DG = dustGrain(a.iid);
  if (g.b < 0.12) { return v; }
  let sp: vec4f = U.shadowVP * vec4f(g.p, 1.0);
  let r: f32 = (0.035 + 0.05 * saturate(g.b)) * M.c.w / U.misc.w;
  v.clip = vec4f(sp.xy + corner * r, sp.z, 1.0);
  return v; }
`;
const DUST_SH_FS = `fn frag(v: VOut) -> FOut { var o: FOut; if (dot(v.uv, v.uv) > 1.0) { discard; } o.color = vec4f(0.0); return o; }`;

// a flame: [0] the wide glow of the air round it, [1] its white-hot heart, [2..] tongues rising off it and turning violet
const FLAME_VS = `
fn vert(a: VIn) -> VOut { var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  v.clip = vec4f(0.0, 0.0, -2.0, 1.0); v.uv = vec2f(0.0); v.col = vec4f(0.0); v.sh = vec4f(0.0);
  let C: vec3f = M.a.xyz; let sc: f32 = M.a.w; let fa: f32 = M.b.x; let sz: f32 = M.b.y; let ti: f32 = M.b.z;
  let T: f32 = M.c.x; let rid: u32 = u32(M.c.y); let n: f32 = M.c.z;
  var tint: vec3f = vec3f(0.061, 1.0, 0.753);
  if (ti > 1.5) { tint = mix(ringGrn(n), ringVio(n), 0.5); } else if (ti > 0.5) { tint = ringGrn(n); }
  let i: u32 = a.iid;
  var p0: vec3f = C; var wsz: f32 = 0.1; var minPx: f32 = 1.0; var col: vec3f = tint; var b: f32 = 0.0; var shape: f32 = 0.0; var al: f32 = 0.0;
  if (i == 0u) {
    wsz = 3.2 * sz * min(sc, 1.6); minPx = 26.0 * U.res.y / 1170.0; b = 0.9 * mix(1.0, 0.8, n); shape = 1.0;
  } else if (i == 1u) {
    wsz = 0.38 * sz * sc; minPx = 4.0; col = vec3f(0.9, 1.0, 0.97); b = 6.0; shape = 2.0;
  } else {
    let fr: f32 = 1.7 + 0.8 * hashu(i * 3u + rid * 77u);
    let ph: f32 = T * fr + hashu(i * 5u + rid * 77u); let u: f32 = fract(ph); let gen: u32 = u32(floor(ph));
    let h: vec3f = hashu3(i * 11u + gen * 7717u + rid * 131u);
    let an: f32 = h.x * 6.2831853; let rr: f32 = 0.5 * sz * sc * sqrt(h.y);
    let hgt: f32 = 1.8 * sz * sc * (0.6 + 0.8 * hashu(i * 7u + rid * 3u));
    p0 = C + vec3f(rr * cos(an), u * hgt - 0.25 * sz * sc, rr * sin(an));
    wsz = 0.26 * sz * sc * pow(1.0 - u, 0.7) * (0.7 + 0.6 * h.z); minPx = 2.0;
    if (u < 0.3) { col = mix(vec3f(0.85, 1.0, 0.97), tint, u / 0.3); } else { col = mix(tint, ringVio(n), (u - 0.3) / 0.7); }
    b = 2.4 * pow(1.0 - u, 0.8) * (0.7 + 0.3 * sin(T * 23.0 + f32(i)));
    al = mix(0.2, 0.0, n);
  }
  let q: RQ = ringQuad(corner, p0, p0, wsz, minPx);
  let fog: f32 = 1.0 - fogAmount(p0);
  var k: f32 = sqrt(q.k); if (i == 0u) { k = 1.0; }          // (the glow keeps a share of its light when it is drawn larger than it is: it is the place's glow, not a point)
  v.clip = q.clip; v.uv = q.uv; v.sh = vec4f(0.0, shape, 0.0, 0.0);
  v.col = vec4f(col * (b * fa * fog * k * ringE()), al * saturate(b * fa) * k);
  return v; }
`;
const SPARK_FS = `
fn frag(v: VOut) -> FOut { var o: FOut;
  let d: f32 = length(vec2f(v.uv.x, max(abs(v.uv.y) - v.sh.x, 0.0)));
  if (d >= 1.0) { discard; }
  var pr: f32 = 0.8 * exp(-d * d * 9.0) + 0.2 * sq(1.0 - d);
  if (v.sh.y > 1.5) { pr = exp(-d * d * 6.0); } else if (v.sh.y > 0.5) { pr = exp(-d * 4.5) * sq(1.0 - d); }
  o.color = v.col * pr;
  return o; }
`;
// the light of a ring (a circle of light, M.a.w its radius) or of a flame (a point, M.a.w = 0) on the surfaces round it, read back from the
// scene's depth. M.b = colour, strength; M.c.x = how far it reaches
const LIGHT_VS = `
fn vert(a: VIn) -> VOut { var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  v.uv = corner;
  let C: vec3f = M.a.xyz; let RL: f32 = M.c.x;
  let dist: f32 = length(C - U.camPos.xyz);
  let cp: vec4f = U.viewProj * vec4f(C, 1.0);
  if (dist < RL * 1.3) { v.clip = vec4f(corner, 0.5, 1.0); return v; }
  if (cp.w < 0.1) { v.clip = vec4f(0.0, 0.0, -2.0, 1.0); return v; }
  let r: f32 = RL * 1.3 / (cp.w * U.camRight.w);
  v.clip = vec4f(cp.x + corner.x * r / U.camUp.w * cp.w, cp.y + corner.y * r * cp.w, 0.5 * cp.w, cp.w);
  return v; }
`;
const LIGHT_FS = `
fn frag(v: VOut) -> FOut { var o: FOut;
  let zf: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy), 0));
  if (zf > 8000.0) { discard; }
  let ndc: vec2f = vec2f(v.clip.x * U.res.z * 2.0 - 1.0, 1.0 - v.clip.y * U.res.w * 2.0);
  let wp: vec3f = U.camPos.xyz + screenRay(ndc) * zf;
  let q: vec3f = wp - M.a.xyz;
  var d2: f32 = dot(q, q);
  if (M.a.w > 0.0) { d2 = sq(length(q.xy) - M.a.w) + q.z * q.z; }
  let fall: f32 = smoothstep(M.c.x, M.c.x * 0.5, length(q));
  let E: f32 = M.b.w / (d2 + 0.35) * fall;
  o.color = vec4f(M.b.rgb * (E * ringE() * (1.0 - fogAmount(wp))), 1.0);
  return o; }
`;
