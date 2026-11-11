// ---------------------------------------------------------------- thrown snow: the curtain off the ski edges, and the grains inside it
// Two populations, both stateless on the GPU (each particle is a launch record; the vertex shader integrates drag + gravity in closed form):
//   puffs  — soft volumes. Their optical depth is ACCUMULATED (order-independent) into a half-res buffer, then one full-screen pass
//            lights that buffer like a participating medium: thin parts glow when the sun is behind them, thick parts fall to sky-lit blue.
//   grains — individual crystals: sub-pixel sparks with tumbling glints, shutter streaks and lens blur. Shared with the diamond dust.

const GROUND_SSL = `
fn groundH(p: vec3f) -> f32 {
  let g: vec2f = p.xz * M.hx.x + M.hx.yz; let c0: vec2f = floor(g); let f: vec2f = g - c0;
  let i0: vec2i = vec2i(c0) & vec2i(255, 255); let i1: vec2i = (vec2i(c0) + vec2i(1, 1)) & vec2i(255, 255);
  let h00: f32 = texFetch(tH, i0, 0).x; let h10: f32 = texFetch(tH, vec2i(i1.x, i0.y), 0).x;
  let h01: f32 = texFetch(tH, vec2i(i0.x, i1.y), 0).x; let h11: f32 = texFetch(tH, i1, 0).x;
  return mix(mix(h00, h10, f.x), mix(h01, h11, f.x), f.y) + ${HREF_SLOPE.toFixed(4)} * p.z + M.hx.w;
}
`;

// crystals as points of light. glintQuad() turns a world position + velocity into a screen-space capsule (streak) with a blur radius,
// glintShade() draws it. Used by spray grains (10_spray.js) and by the air-borne diamond dust (11_dust.js).
const GLINT_SSL = `
struct GlintV { clip: vec4f, uv: vec2f, shp: vec4f, col: vec4f, }
fn glintCull() -> GlintV { var g: GlintV; g.clip = vec4f(0.0, 0.0, -2.0, 1.0); g.uv = vec2f(0.0); g.shp = vec4f(0.0); g.col = vec4f(0.0); return g; }
// corner: quad corner (-1..1). pos/vel: render-space position and velocity. seed: 0..1. power: light of the crystal. vis: sun visibility.
fn glintQuad(corner: vec2f, pos: vec3f, vel: vec3f, seed: f32, power: f32, vis: f32, rmin0: f32, shutK: f32) -> GlintV {
  var g: GlintV = glintCull();
  let rel: vec3f = pos - U.camPos.xyz; let zv: f32 = dot(rel, U.camFwd.xyz);
  if (zv < 0.12 || power <= 0.0) { return g; }
  let cp: vec4f = U.viewProj * vec4f(pos, 1.0); let ndc: vec2f = cp.xy / cp.w;
  if (abs(ndc.x) > 1.25 || abs(ndc.y) > 1.25) { return g; }
  // hidden behind the scene? (one depth fetch per crystal, in the vertex stage)
  let pix: vec2f = clamp((vec2f(ndc.x, -ndc.y) * 0.5 + 0.5) * U.res.xy, vec2f(0.0), U.res.xy - 1.0);
  let sz: f32 = linDepth(texFetchD(tDepth, vec2i(pix), 0));
  if (zv > sz + 0.03) { return g; }
  // where it was one shutter ago -> streak
  let pp: vec4f = U.prevViewProj * vec4f(pos - vel * U.misc.z, 1.0);
  var mv: vec2f = vec2f(0.0);
  if (pp.w > 0.05) { mv = (ndc - pp.xy / pp.w) * vec2f(0.5, -0.5) * U.res.xy * (U.dof.w * shutK / max(U.misc.z, 0.004)); }
  var ml: f32 = length(mv); var ax: vec2f = vec2f(1.0, 0.0);
  if (ml > 0.25) { ax = mv / ml; }
  // circle of confusion (px): sharp at the skier, soft discs close to the lens
  let sc: f32 = U.res.y / 1170.0;
  let coc: f32 = min(U.dof.y * abs(1.0 / U.dof.x - 1.0 / zv), U.dof.z) * sc;
  let rmin: f32 = max(0.62 * sc, rmin0);
  let rad: f32 = sqrt(coc * coc + rmin * rmin);
  // a sharp crystal streaks with the shutter; one blurred into a lens disc is already smeared, so it stays (almost) round
  // (a crumb of snow going past the lens is another matter: that is a streak however soft it is)
  ml = min(ml, 0.16 * U.res.y) * mix(min(1.0, 2.2 * sc / rad), 1.0, saturate(shutK - 1.0));
  let hl: f32 = ml * 0.5;
  let ext: vec2f = vec2f(hl + rad + 1.0, rad + 1.0);
  let lp: vec2f = corner * ext;                                        // local px: x along the streak
  let opx: vec2f = ax * lp.x + vec2f(-ax.y, ax.x) * lp.y;
  g.clip = vec4f((ndc + opx * vec2f(2.0, -2.0) * U.res.zw) * cp.w, cp.z, cp.w);
  g.uv = lp; g.shp = vec4f(hl, rad, coc / max(rad, 0.01), zv);
  // --- light. A crystal is a tumbling plate: most of the time a faint forward-scattered spark, now and then a mirror flash of the sun.
  let V: vec3f = -rel / max(length(rel), 1e-3); let L: vec3f = U.sunDir.xyz;
  let Hh: vec3f = normalize(V + L);
  let tm: f32 = U.camPos.w;
  let a1: f32 = seed * 311.7 + tm * (2.2 + 5.0 * fract(seed * 17.31)); let a2: f32 = seed * 127.1 + tm * (1.7 + 4.0 * fract(seed * 43.77));
  let nrm: vec3f = vec3f(sin(a1) * cos(a2), cos(a1), sin(a1) * sin(a2));
  let fl: f32 = pow(abs(dot(nrm, Hh)), 90.0);
  let ci: f32 = saturate(dot(Hh, L)); let fres: f32 = 0.04 + 0.96 * pow(1.0 - ci, 5.0);
  let mu: f32 = dot(-V, L);
  let fwd: f32 = 0.5 * hg(mu, 0.84) + 0.5 * hg(mu, 0.3);
  let e: f32 = power * vis * (fwd * 1.5 + fl * (0.5 + 13.0 * fres));
  // spread the same light over the blurred / streaked footprint; big lens discs keep a floor so they still read as discs
  let area: f32 = 3.14159 * rad * rad + 4.0 * rad * hl;
  let k: f32 = (3.14159 * 0.85 * 0.85 * sc * sc) / pow(area, 0.78);
  // faint prismatic tint on the flashes
  let hue: vec3f = mix(vec3f(1.0, 0.84, 0.56), vec3f(0.56, 0.84, 1.0), fract(seed * 7.0));
  let tint: vec3f = mix(vec3f(1.0), hue, 0.26 * saturate(fl * 4.0));
  var gc: vec3f = U.sunCol.rgb * vec3f(0.90, 1.0, 1.12) * tint * e;
  // in the beam of the headlamp the same crystal flashes back at the lamp (and at the lens behind it)
  if (U.lamp.w > 0.0) {
    let ll: vec3f = lampLight(pos);
    if (ll.x > 0.00002) { let Ld: vec3f = normalize(U.lamp.xyz - pos); let f2: f32 = pow(abs(dot(nrm, normalize(V + Ld))), 60.0); gc += ll * tint * (power * (0.22 + 7.0 * f2)); }
  }
  g.col = vec4f(gc * k, fl);
  return g;
}
fn glintShade(uv: vec2f, shp: vec4f, col: vec4f) -> vec4f {
  let d: f32 = length(vec2f(max(abs(uv.x) - shp.x, 0.0), uv.y));
  let r: f32 = shp.y;
  let bk: f32 = smoothstep(2.5, 7.0, r) * shp.z;
  let aa: f32 = max(1.0, r * (0.12 + 0.16 * bk));
  var a: f32 = smoothstep(r, r - aa, d);
  // lens discs: soft edge, a slightly brighter rim and a hollow-ish centre (spherical aberration), only once they are clearly out of focus
  a *= mix(1.0, 0.70 + 0.5 * smoothstep(0.5 * r, 0.9 * r, d), bk);
  return vec4f(col.rgb * a, 0.0);
}
`;

const Spray = (() => {
  const P = { NP: 6144, NG: 16384, PF: 16, GF: 12, gain: 1, bump: 1.0, tear: 1.0, speck: 1.0, keyhole: 1.0, nearBlur: 0.75, shutter: true, streakMax: 0.06, crumb: 1.0, grainShutter: 4.0, shadows: true, enabled: true, stats: { puffs: 0, grains: 0 } };
  let gfx, puffBuf, grainBuf, puffCPU, grainCPU, pipePuff, pipePuffSun, pipeComp, pipeGrain, accTex, accT, sunTex, sunT, hw = 0, hh = 0;
  let ph = 0, gh = 0;                                    // ring heads
  const dirtyP = [], dirtyG = [];                        // [first, count] ranges written since the last upload
  let accP = 0, accG = 0;
  const rnd = RNG(977);

  P.init = function (g) {
    gfx = g;
    puffCPU = new Float32Array(P.NP * P.PF); grainCPU = new Float32Array(P.NG * P.GF);
    puffBuf = gfx.buffer(puffCPU, 'vertex', true); grainBuf = gfx.buffer(grainCPU, 'vertex', true);
    pipePuff = gfx.pipeline({
      name: 'sprayPuff', lib: [SL.common, SL.depth, SL.shadow, SL.sprayTau, GROUND_SSL, PUFF_SSL], topology: 'strip', cull: 'none', depth: false, depthTest: false, blend: 'add4',
      buffers: [{ instanced: true, attrs: [['a0', 'vec4f'], ['a1', 'vec4f'], ['a2', 'vec4f'], ['a3', 'vec4f']] }],
      varyings: { uv: 'vec2f', d0: 'vec4f', d1: 'vec4f', d2: 'vec4f' }, uniforms: { hx: 'vec4f', hx2: 'vec4f' },
      textures: { tH: 'fetch', tDepth: 'depth', tDetail: '2d', tShadow: 'shadow', tSunTau: '2d' },
      vs: PUFF_VS, fs: PUFF_FS,
    });
    // the same puffs seen from the sun: optical depth and its depth moments, accumulated into a small map that follows the skier
    sunTex = gfx.texture({ w: Render.sprayRes, h: Render.sprayRes, format: 'rgba16f', filter: 'linear', wrap: 'clamp' }); sunT = gfx.target({ color: sunTex }); P.sunTex = sunTex;
    pipePuffSun = gfx.pipeline({
      name: 'spraySun', lib: [SL.common, GROUND_SSL, PUFF_SSL], topology: 'strip', cull: 'none', depth: false, depthTest: false, blend: 'add4', colorFormat: 'rgba16f',
      buffers: [{ instanced: true, attrs: [['a0', 'vec4f'], ['a1', 'vec4f'], ['a2', 'vec4f'], ['a3', 'vec4f']] }],
      varyings: { uv: 'vec2f', d0: 'vec4f' }, uniforms: { hx: 'vec4f' }, textures: { tH: 'fetch' },
      vs: PUFF_SUN_VS, fs: PUFF_SUN_FS,
    });
    pipeComp = gfx.pipeline({
      name: 'sprayComposite', lib: [SL.common, SL.depth, SL.tnoise], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f', q: 'vec4f', r: 'vec4f' }, textures: { tSpray: '2d', tDepth: 'depth', tNoise: '2d' },
      depth: false, depthTest: false, cull: 'none', blend: 'trans', vs: VS_FULLSCREEN, fs: SPRAY_COMP_FS,
    });
    pipeGrain = gfx.pipeline({
      name: 'sprayGrain', lib: [SL.common, SL.depth, SL.shadow, SL.sprayTau, GROUND_SSL, GLINT_SSL], topology: 'strip', cull: 'none', depth: false, depthTest: false, blend: 'trans',
      buffers: [{ instanced: true, attrs: [['a0', 'vec4f'], ['a1', 'vec4f'], ['a2', 'vec4f']] }],
      varyings: { uv: 'vec2f', shp: 'vec4f', col: 'vec4f', cc: 'vec4f' }, uniforms: { hx: 'vec4f', gp: 'vec4f' },
      textures: { tH: 'fetch', tDepth: 'depth', tShadow: 'shadow', tSunTau: '2d' },
      vs: GRAIN_VS, fs: `fn frag(v: VOut) -> FOut { var o: FOut;
  let g: vec4f = glintShade(v.uv, v.shp, v.col);
  // the crumb itself: a small white body over whatever is behind it (its flash is light, and is added)
  let d: f32 = length(vec2f(max(abs(v.uv.x) - v.shp.x, 0.0), v.uv.y)); let r: f32 = v.shp.y;
  // out of focus a body is its own outline spread over the lens disc: a soft core that thins to nothing, not the hard-edged disc
  // a point of light makes. rho = how much of the radius is still solid.
  let cz: f32 = v.shp.z; let rt: f32 = sqrt(max(1.0 - cz * cz, 0.0)); let rho: f32 = max(rt - cz, 0.0) / max(rt + cz, 1e-3);
  let a: f32 = smoothstep(r, min(r * rho, r - max(1.0, r * 0.3)), d) * min(1.0, v.cc.a / (0.3 + 0.7 * rho * rho));
  o.color = vec4f(g.rgb + v.cc.rgb * a, 1.0 - a); return o; }`,
    });
    P.pipes = [pipePuff, pipePuffSun, pipeComp, pipeGrain];
  };
  P.resize = function (w, h) {
    if (accT) { gfx.destroyTarget(accT); gfx.destroyTexture(accTex); }
    hw = Math.max(2, w >> 1); hh = Math.max(2, h >> 1);
    accTex = gfx.texture({ w: hw, h: hh, format: 'rgba16f', filter: 'linear' }); accT = gfx.target({ color: accTex }); Post.occTex = accTex;
  };

  function mark(list, i) { const l = list[list.length - 1]; if (l && l[0] + l[1] === i) l[1]++; else list.push([i, 1]); }
  // launch record of one puff. p, v: world space. f: fineness 0 (coarse, heavy) .. 1 (smoke)
  P.puff = function (t0, px, py, pz, vx, vy, vz, f, r0, dens, stretch, lifeK) {
    const o = Render.origin, i = ph * P.PF, c = puffCPU, u = rnd();
    c[i] = px - o[0]; c[i + 1] = py - o[1]; c[i + 2] = pz - o[2]; c[i + 3] = t0;
    c[i + 4] = vx; c[i + 5] = vy; c[i + 6] = vz; c[i + 7] = u;
    c[i + 8] = lerp(1.25, 3.0, f); c[i + 9] = lerp(2.0, 0.28, f); c[i + 10] = lerp(0.8, 3.3, f) * (0.75 + 0.5 * rnd()) * (lifeK || 1); c[i + 11] = r0;
    c[i + 12] = lerp(0.07, 0.30, f) * (0.7 + 0.6 * rnd()); c[i + 13] = dens; c[i + 14] = f; c[i + 15] = stretch;
    mark(dirtyP, ph); ph = (ph + 1) % P.NP; P.stats.puffs++;
  };
  P.grain = function (t0, px, py, pz, vx, vy, vz, f, power, lifeK) {
    const o = Render.origin, i = gh * P.GF, c = grainCPU;
    c[i] = px - o[0]; c[i + 1] = py - o[1]; c[i + 2] = pz - o[2]; c[i + 3] = t0;
    c[i + 4] = vx; c[i + 5] = vy; c[i + 6] = vz; c[i + 7] = rnd();
    c[i + 8] = lerp(0.45, 2.4, f); c[i + 9] = lerp(9.0, 0.55, f); c[i + 10] = lerp(0.9, 4.2, f) * (0.7 + 0.6 * rnd()) * (lifeK || 1); c[i + 11] = power;
    mark(dirtyG, gh); gh = (gh + 1) % P.NG; P.stats.grains++;
  };
  function upload(buf, cpu, list, stride) {
    for (const [first, count] of list) gfx.updateBuffer(buf, first * stride * 4, cpu.subarray(first * stride, (first + count) * stride));
    list.length = 0;
  }
  P.shiftOrigin = function (d) {
    for (let i = 0; i < P.NP; i++) { const o = i * P.PF; puffCPU[o] -= d[0]; puffCPU[o + 1] -= d[1]; puffCPU[o + 2] -= d[2]; }
    for (let i = 0; i < P.NG; i++) { const o = i * P.GF; grainCPU[o] -= d[0]; grainCPU[o + 1] -= d[1]; grainCPU[o + 2] -= d[2]; }
    dirtyP.length = 0; dirtyG.length = 0; dirtyP.push([0, P.NP]); dirtyG.push([0, P.NG]);
  };
  P.clear = function () { puffCPU.fill(0); grainCPU.fill(0); dirtyP.length = 0; dirtyG.length = 0; dirtyP.push([0, P.NP]); dirtyG.push([0, P.NG]); };

  // ---- emission: called once per physics substep (120 Hz) so trails stay continuous at any frame rate
  const tmp = { I: 0 };
  P.intensity = 0;
  P.onStep = function (S, H, t) {
    const sp = S.speed;
    if (!S.contact || sp < 1.2) { P.intensity = damp(P.intensity, 0, 12, H); return; }
    const g = 9.81, N = S.load / g, lat = Math.abs(S.aReac) / g, skid = Math.abs(Math.sin(S.beta));
    // how hard the edges are moving snow: a whisper when gliding, a wall when the skis are thrown sideways
    const pw = 0.6 + 0.6 * S.powder;
    // (it grows with the load: skis that are merely turned across the track, with no weight on them yet, move very little snow)
    const I = N * (0.05 * pw + 0.78 * Math.pow(lat, 1.3) + 1.25 * skid * (0.15 + 0.85 * sat(lat))) * smooth(1.5, 13, sp) * pw;
    P.intensity = damp(P.intensity, I, 30, H);
    const turn = S.aReac >= 0 ? 1 : -1, n = S.n, tt = S.t, rr = S.r, cb = Math.cos(S.beta), sb = Math.sin(S.beta);
    // ski axes on the snow: f along the skis, o across them toward the OUTSIDE of the turn (where the bases face)
    const fx = tt[0] * cb + rr[0] * sb, fy = tt[1] * cb + rr[1] * sb, fz = tt[2] * cb + rr[2] * sb;
    const ox = -turn * (rr[0] * cb - tt[0] * sb), oy = -turn * (rr[1] * cb - tt[1] * sb), oz = -turn * (rr[2] * cb - tt[2] * sb);
    const stance = Game.pose.stance * 0.5, v = S.v;
    const ve = clamp(sp * (0.06 + 0.33 * sat(lat / 1.3) + 0.30 * skid), 1.0, 8.0);
    const straight = sat(1 - lat / 0.22) * sat(1 - skid / 0.1);
    const hard = sat(I * 2.2);
    // (the blow of a fall or a landing is a spike of load, not a turn: it does not throw a hundred times the snow)
    const Ie = Math.min(I, 3.2);
    accP = Math.min(accP + (70 + 1700 * Math.pow(Ie, 0.9)) * H * P.gain, 60); accG = Math.min(accG + (90 + 4600 * Math.pow(Ie, 0.85)) * H * P.gain, 160);
    // (thrown outward more than upward: a fan that leaves the edge low and wide, its crest about shoulder high in the hardest turn)
    const base = S.h, elBase = lerp(0.45, 0.78, hard);
    // The edge throws a SHEET, not a cloud: direction and speed vary smoothly along the ski and in time, so neighbouring lumps fly together
    // and the curtain shows fingers and scallops along its crest. A minority is loose mist that fills in around it and lingers.
    // (the fingers come and go: a stretch of even spray, then a few tall ones, never a comb)
    const sheet = (al, tj) => {
      const a = al * 5.0 + tj * 6.0, gust = 0.5 + 0.5 * Math.sin(tj * 1.31 + 1.7 * Math.sin(tj * 0.53 + 0.8));
      return clamp(0.5 + (0.30 * Math.sin(a + 1.7 * Math.sin(tj * 2.3 + al * 2.0)) + 0.20 * Math.sin(a * 2.7 + tj * 9.0)) * (0.5 + 0.7 * gust)
        + 0.15 * Math.sin(al * 21.0 + tj * 47.0 + 2.2 * Math.sin(tj * 6.1 + al * 3.0)) * (1.2 - gust), 0, 1);          // 0..1
    };
    while (accP >= 1) {
      accP -= 1;
      const u1 = rnd(), u2 = rnd(), u3 = rnd(), u4 = rnd(), jt = rnd() * H;
      // outside ski does most of the work; when gliding straight both tails smoke a little
      let side = (rnd() < 0.74 ? 1 : -1); let out = 1;
      if (straight > 0.5 && rnd() < straight) { side = rnd() < 0.5 ? 1 : -1; out = side; }
      const al = lerp(-0.86, 0.42, u1 * u1 * 0.4 + u1 * 0.6);                     // along the ski: tail .. just ahead of the boot
      const lx = fx * al + ox * (side * stance + 0.05 * out), ly = fy * al + oy * (side * stance + 0.05 * out), lz = fz * al + oz * (side * stance + 0.05 * out);
      const px = S.p[0] + lx - v[0] * jt, pz = S.p[2] + lz - v[2] * jt, py = base - (n[0] * (lx - v[0] * jt) + n[2] * (lz - v[2] * jt)) / n[1] + 0.04;
      const mist = u2 < 0.26, fg = sheet(al, t - jt);
      let f, el, sv, dens, carry, r0, jit;
      if (mist) {
        f = 0.75 + 0.25 * rnd(); el = lerp(0.35, 1.35, u3); sv = Math.min(5.0, ve * (0.25 + 0.6 * u4)); carry = 0.12 + 0.3 * rnd();
        dens = 1.5 * (0.12 + 0.5 * hard + 0.55 * sat(I)); r0 = lerp(0.07, 0.12, rnd()); jit = 1.3;
      } else {
        f = Math.max(Math.pow(rnd(), 0.9) * 0.75, 1 - hard);
        // (not a membrane: most of the snow goes out with the crest, the rest at every speed below it, and that fills the wall under it)
        el = elBase + 0.34 * (fg - 0.5) + (u3 - 0.5) * 0.22;
        sv = Math.min(8.2, ve * (0.50 + 0.62 * fg) * 1.14 * (0.28 + 0.72 * Math.pow(u4, 0.45)));
        carry = 0.10 + 0.30 * fg * rnd() + 0.22 * skid * rnd();
        dens = lerp(7.6, 3.2, f) * (0.12 + 0.5 * hard + 0.55 * sat(I)); r0 = lerp(0.04, 0.075, rnd()) * (0.75 + 0.55 * sat(I)); jit = 0.45;
      }
      const ce = Math.cos(el), se = Math.sin(el);
      const vx = v[0] * carry + (ox * out * ce + n[0] * se) * sv + (rnd() - 0.5) * jit, vy = v[1] * carry + (oy * out * ce + n[1] * se) * sv + rnd() * 0.4 * jit + 0.2, vz = v[2] * carry + (oz * out * ce + n[2] * se) * sv + (rnd() - 0.5) * jit;
      P.puff(t - jt, px, py, pz, vx, vy, vz, f, r0, dens, 1, 1);
    }
    while (accG >= 1) {
      accG -= 1;
      const u1 = rnd(), u3 = rnd(), u4 = rnd(), jt = rnd() * H;
      let side = (rnd() < 0.74 ? 1 : -1); let out = 1;
      if (straight > 0.5 && rnd() < straight) { side = rnd() < 0.5 ? 1 : -1; out = side; }
      const al = lerp(-0.86, 0.5, u1);
      const lx = fx * al + ox * (side * stance + 0.05 * out), lz = fz * al + oz * (side * stance + 0.05 * out);
      const px = S.p[0] + lx - v[0] * jt, pz = S.p[2] + lz - v[2] * jt, py = base - (n[0] * (lx - v[0] * jt) + n[2] * (lz - v[2] * jt)) / n[1] + 0.03;
      // grains ride the same sheet but scatter wider and outrun it: the glitter along its crest and ahead of it
      const f = rnd(), fg = sheet(al, t - jt);
      const el = elBase + 0.34 * (fg - 0.5) + (u3 - 0.5) * 0.7, ce = Math.cos(el), se = Math.sin(el);
      const sv = Math.min(10.5, ve * (0.50 + 0.62 * fg) * (0.7 + 0.9 * Math.pow(u4, 1.6)));
      const carry = 0.12 + 0.5 * rnd() * rnd() + 0.25 * skid * rnd();
      const vx = v[0] * carry + (ox * out * ce + n[0] * se) * sv + (rnd() - 0.5) * 1.2, vy = v[1] * carry + (oy * out * ce + n[1] * se) * sv + rnd() * 0.8, vz = v[2] * carry + (oz * out * ce + n[2] * se) * sv + (rnd() - 0.5) * 1.2;
      P.grain(t - jt, px, py, pz, vx, vy, vz, f, 1.2 + 3.0 * rnd() * rnd(), 1);
    }
  };
  // a ring of snow kicked up by a landing or a fall
  P.burst = function (t, p, v, n, power) {
    const np = Math.round(26 * power), ng = Math.round(160 * power);
    for (let i = 0; i < np + ng; i++) {
      const a = rnd() * TAU, el = lerp(0.15, 1.0, rnd()), s = lerp(1.2, 5.5, rnd()) * (0.6 + 0.5 * power), ce = Math.cos(el);
      const dx = Math.cos(a) * ce, dz = Math.sin(a) * ce, dy = Math.sin(el);
      const px = p[0] + dx * 0.25, pz = p[2] + dz * 0.25, py = p[1] + 0.05;
      const vx = v[0] * 0.35 + dx * s, vy = dy * s + 0.3, vz = v[2] * 0.35 + dz * s;
      if (i < np) P.puff(t, px, py, pz, vx, vy, vz, Math.pow(rnd(), 0.6), lerp(0.12, 0.26, rnd()), 1.6, 0.6, 1);
      else P.grain(t, px, py, pz, vx * 1.3, vy * 1.5, vz * 1.3, rnd(), 0.6 + 1.4 * rnd(), 1);
    }
  };

  // a hoof driving into the snow: a small spurt thrown up and back
  P.kick = function (t, p, v, power) {
    const np = Math.round(4 * power), ng = Math.round(46 * power);
    for (let i = 0; i < np + ng; i++) {
      const a = rnd() * TAU, el = lerp(0.35, 1.15, rnd()), s = lerp(0.7, 3.0, rnd()), ce = Math.cos(el);
      const dx = Math.cos(a) * ce, dz = Math.sin(a) * ce, dy = Math.sin(el), px = p[0] + dx * 0.12, pz = p[2] + dz * 0.12, py = p[1] + 0.04;
      if (i < np) P.puff(t, px, py, pz, v[0] + dx * s, v[1] + dy * s, v[2] + dz * s, Math.pow(rnd(), 0.6), lerp(0.05, 0.10, rnd()), 0.85, 0.6, 0.55);
      else P.grain(t, px, py, pz, v[0] * 1.2 + dx * s * 1.4, v[1] + dy * s * 1.8, v[2] * 1.2 + dz * s * 1.4, rnd(), 0.5 + 1.2 * rnd(), 0.8);
    }
  };
  // snow shaken off a bough: a thin veil of fine dust that hangs and sifts down, and a shower of sparkling grains
  P.sift = function (t, p, v, power) {
    const np = Math.round(9 * power), ng = Math.round(220 * power);
    for (let i = 0; i < np + ng; i++) {
      const a = rnd() * TAU, rr = Math.sqrt(rnd()) * 0.9, px = p[0] + Math.cos(a) * rr, pz = p[2] + Math.sin(a) * rr, py = p[1] + (rnd() - 0.3) * 1.4;
      const vx = v[0] * (0.15 + 0.25 * rnd()) + (rnd() - 0.5) * 1.2, vz = v[2] * (0.15 + 0.25 * rnd()) + (rnd() - 0.5) * 1.2, vy = -0.3 - rnd() * 1.2;
      if (i < np) P.puff(t, px, py, pz, vx, vy, vz, 0.8 + 0.2 * rnd(), lerp(0.16, 0.30, rnd()), 0.45, 0.6, 1.3);
      else P.grain(t, px, py, pz, vx * 1.4, vy * 1.6 + 0.6, vz * 1.4, 0.35 + 0.65 * rnd(), 0.5 + 1.6 * rnd() * rnd(), 1.2);
    }
  };
  // before the scene: the snow cloud as the sun sees it (the slope, the skier and the cloud itself all read it)
  P.pre = function (R) {
    upload(puffBuf, puffCPU, dirtyP, P.PF); upload(grainBuf, grainCPU, dirtyG, P.GF);
    const hb = Terrain.heightBinding(R.origin, 1); P.hb = hb;
    gfx.beginPass(sunT, { color: [0, 0, 0, 0] });
    if (P.enabled && P.shadows) gfx.draw(pipePuffSun, { u: { hx: hb.xf }, tex: { tH: hb.tex }, vb: [puffBuf], count: 4, instances: P.NP });
    gfx.endPass();
  };
  P.offscreen = function (R) {
    gfx.beginPass(accT, { color: [0, 0, 0, 0] });
    if (P.enabled) gfx.draw(pipePuff, { u: { hx: P.hb.xf, hx2: [P.nearBlur, P.shutter && R.motionBlur !== false && R.dt > 0 ? Post.shutter / Math.max(R.dt, 1 / 240) : 0, P.streakMax, 0] }, tex: { tH: P.hb.tex, tDepth: R.depth, tDetail: Tex.detail, tShadow: R.shadowTex, tSunTau: sunTex }, vb: [puffBuf], count: 4, instances: P.NP });
    gfx.endPass();
  };
  P.fx = function (R) {
    if (!P.enabled) return;
    const o = R.origin, wr = (x, f) => ((x * f) % 256 + 256) % 256;
    gfx.draw(pipeComp, { u: { p: [hw, hh, P.bump, P.tear], q: [wr(o[0], 3.1), wr(o[1], 3.1), wr(o[2], 3.1), P.speck], r: [P.keyhole, 0, 0, 0] }, tex: { tSpray: accTex, tDepth: R.depth, tNoise: Tex.noise }, count: 3 });
    gfx.draw(pipeGrain, { u: { hx: P.hb.xf, gp: [P.crumb, P.grainShutter, 0, 0] }, tex: { tH: P.hb.tex, tDepth: R.depth, tShadow: R.shadowTex, tSunTau: sunTex }, vb: [grainBuf], count: 4, instances: P.NG });
  };
  return P;
})();

const PUFF_SSL = `
struct PuffS { pos: vec3f, vel: vec3f, r: f32, dens: f32, lf: f32, t: f32, }
// closed-form flight of one puff: launch velocity bleeding off into wind drift + slow settling. dens = optical depth at its centre (0 = dead).
fn puffState(a0: vec4f, a1: vec4f, a2: vec4f, a3: vec4f) -> PuffS {
  var s: PuffS; s.pos = vec3f(0.0); s.vel = vec3f(0.0); s.r = 0.0; s.dens = 0.0; s.lf = 0.0; s.t = 0.0;
  let t: f32 = U.camPos.w - a0.w; let life: f32 = a2.z;
  if (t <= 0.0 || t >= life) { return s; }
  let k: f32 = a2.x; let seed: f32 = a1.w; let fine: f32 = a3.z;
  let vT: vec3f = U.wind.xyz * (0.3 + 0.7 * fine) + vec3f(0.0, -a2.y, 0.0);
  let e: f32 = exp(-k * t);
  var pos: vec3f = a0.xyz + vT * t + (a1.xyz - vT) * ((1.0 - e) / k);
  s.vel = vT + (a1.xyz - vT) * e;
  let wob: f32 = 0.20 * fine * smoothstep(0.15, 1.8, t);
  pos += wob * vec3f(sin(seed * 91.7 + t * 1.9), 0.6 * sin(seed * 47.3 + t * 1.4), cos(seed * 71.1 + t * 1.6));
  let r: f32 = a2.w + a3.x * pow(t, 0.72);
  // snow that comes back down is snow again: fade it out instead of letting a fog bank pile up on the slope
  let g0: f32 = groundH(pos); let gy: f32 = g0 + r * 0.28;
  let landed: f32 = saturate(1.0 - (gy - pos.y) / 0.35);
  // ...and on its way back down it thins before it touches: fine snow settling out of the air leaves no pale lid lying on the slope
  let settle: f32 = mix(1.0, smoothstep(0.30, 1.10, (pos.y - g0) / r), saturate(-s.vel.y * 2.5) * smoothstep(0.25, 0.8, t));
  pos.y = max(pos.y, gy);
  let lf: f32 = t / life;
  s.pos = pos; s.r = r; s.lf = lf; s.t = t;
  // the mass spreads as the puff grows (optical depth ~ 1/r^2); fades in fast, out slowly
  s.dens = a3.y * pow(a2.w / r, 1.9) * smoothstep(0.0, 0.03, t) * pow(1.0 - lf, 1.3) * landed * settle;
  return s;
}
`;

const PUFF_VS = `
fn vert(a: VIn) -> VOut {
  var v: VOut;
  v.clip = vec4f(0.0, 0.0, -2.0, 1.0); v.uv = vec2f(0.0); v.d0 = vec4f(0.0); v.d1 = vec4f(0.0); v.d2 = vec4f(0.0);
  let s: PuffS = puffState(a.a0, a.a1, a.a2, a.a3);
  if (s.dens <= 0.0) { return v; }
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let seed: f32 = a.a1.w; let pos: vec3f = s.pos; let r: f32 = s.r;
  let rel: vec3f = pos - U.camPos.xyz; let zc: f32 = dot(rel, U.camFwd.xyz);
  if (zc < 0.35) { return v; }
  // it dissolves before it reaches the lens: the curtain is something to look at, not to be blinded by
  var dens: f32 = s.dens * smoothstep(1.3, 4.6, zc);
  if (dens < 0.002) { return v; }
  let sv: vec2f = vec2f(dot(s.vel, U.camRight.xyz), dot(s.vel, U.camUp.xyz)); let sl: f32 = length(sv);
  var ax: vec2f = vec2f(1.0, 0.0);
  if (sl > 0.05) { ax = sv / sl; }
  let st0: f32 = 1.0 + min(sl * 0.22, 3.0) * exp(-s.t * 1.4) * a.a3.w;
  // the shutter: snow hanging in the air goes by the lens like everything else does. A lump two strides from the camera is not a ball
  // standing in the picture: it is a streak along the way it went past (half that path, in metres at its own depth)
  let c0: vec4f = U.viewProj * vec4f(pos, 1.0); let c1: vec4f = U.prevViewProj * vec4f(pos - s.vel * U.misc.z, 1.0);
  var mb: vec2f = vec2f(0.0);
  if (c0.w > 0.05 && c1.w > 0.05) { mb = (c0.xy / c0.w - c1.xy / c1.w) * vec2f(U.camUp.w, 1.0) * (0.5 * M.hx2.y); }
  let ml: f32 = length(mb);
  if (ml > M.hx2.z) { mb *= M.hx2.z / ml; }
  let mw: vec2f = mb * (zc * U.camRight.w);
  var sa: vec2f = ax * (r * (st0 - 1.0));
  if (dot(sa, mw) < 0.0) { sa = -sa; }
  let sc: vec2f = sa + mw; let cl: f32 = length(sc);
  if (cl > 1e-4) { ax = sc / cl; }
  let rl: f32 = r + cl;
  // ...and it is far out of focus there: the same snow spread over a wider, softer disc, so that a handful of lumps close by run
  // together into a veil
  let bw: f32 = M.hx2.x * pow(max(1.0 - zc / 4.0, 0.0), 1.2);
  let rc: f32 = 0.42 * zc * U.camRight.w;
  let rb: f32 = min(sqrt(r * r + bw * bw), max(rc, r)); let ra: f32 = min(sqrt(rl * rl + bw * bw), max(rc * 1.5, r * st0));
  let st: f32 = ra / rb; let blur: f32 = max(1.0 - (r * r) / (rb * rb), 1.0 - smoothstep(2.4, 4.0, zc));
  dens *= (r * r * st0) / (ra * rb);
  if (dens < 0.0012) { return v; }
  let off: vec2f = ax * (corner.x * ra) + vec2f(-ax.y, ax.x) * (corner.y * rb);
  v.clip = U.viewProj * vec4f(pos + U.camRight.xyz * off.x + U.camUp.xyz * off.y, 1.0);
  v.uv = corner;
  // sun reaching this puff: through terrain, trees and the skier (shadow map)...
  let lx: vec3f = normalize(cross(vec3f(0.0, 1.0, 0.0), U.sunDir.xyz)); let ly: vec3f = cross(U.sunDir.xyz, lx);
  let sp: vec3f = pos + U.sunDir.xyz * (0.12 + r * 0.6); let rr: f32 = r * 0.6 + 0.05;
  var vis: f32 = 0.25 * (shadowFast(sp + lx * rr, 0.0015) + shadowFast(sp - lx * rr, 0.0015) + shadowFast(sp + ly * rr, 0.0015) + shadowFast(sp - ly * rr, 0.0015));
  // ...and through the rest of the curtain, taken at this corner of the lump so the shading runs smoothly across it
  let wc: vec3f = pos + U.camRight.xyz * (off.x * 0.7) + U.camUp.xyz * (off.y * 0.7);
  // (snow scatters almost without loss, and mostly forward: what the direct beam loses on the way in arrives a little later, sideways)
  let ts: f32 = sprayTau(wc, r * 0.5);
  vis *= 0.58 * exp(-0.85 * ts) + 0.42 * exp(-0.16 * ts);
  v.d0 = vec4f(dens / sqrt(st0), vis, zc, rb);
  v.d1 = vec4f(fract(seed * 13.7), fract(seed * 29.3), seed * 6.2832 + s.t * (fract(seed * 5.3) - 0.5) * 0.9, pow(s.lf, 0.7));
  // a lump's outline is noise, but the card it is drawn on is round: feather the last of the card so no lump ever ends on a perfect arc,
  // and more the nearer it is (a lone lump a few strides off is a soft tuft, never a disc with a rim)
  v.d2 = vec4f(a.a3.z, st, blur, mix(0.14, 1.0, 1.0 - smoothstep(3.0, 5.5, zc)));
  return v;
}`;

const PUFF_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut; o.color = vec4f(0.0);
  let q: vec2f = v.uv; let dd: f32 = dot(q, q);
  if (dd >= 1.0) { return o; }
  let k: f32 = 1.0 - dd;
  let e: f32 = v.d1.w;
  // young snow is still a thrown streak (its grain runs along the throw); as it slows it tumbles into billows
  let ang: f32 = v.d1.z * smoothstep(0.08, 0.5, e);
  let cs: f32 = cos(ang); let sn: f32 = sin(ang);
  let qs: vec2f = vec2f(q.x * mix(0.45, 1.0, smoothstep(0.08, 0.5, e)) * (0.3 * v.d2.y + 0.7), q.y);
  let nuv: vec2f = vec2f(qs.x * cs - qs.y * sn, qs.x * sn + qs.y * cs) * 0.19 + v.d1.xy;
  let n1: f32 = tex(tDetail, nuv).z; let n2: f32 = tex(tDetail, nuv * 3.7 + vec2f(0.37, 0.61)).z;
  let n: f32 = saturate((n1 * 0.58 + n2 * 0.42 - 0.5) * 2.3 + 0.5);
  // a lump of thrown snow: solid inside, with a silhouette pushed in and out by the noise; it tears into wisps as it ages
  let F: f32 = k + (n - 0.5) * (0.45 + 0.8 * e);
  let th: f32 = 0.02 + 0.22 * e;
  let m: f32 = mix(smoothstep(th, th + 0.24 + 0.95 * e, F) * mix(0.60 + 0.40 * k, 0.35 + 0.65 * k, smoothstep(0.1, 0.5, e)) * smoothstep(0.0, v.d2.w, k), 1.5 * k * k, v.d2.z);
  let sz: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy) * 2, 0));
  let hh: f32 = v.d0.w * sqrt(k) + 0.02;
  let front: f32 = saturate((sz - (v.d0.z - hh)) / (2.0 * hh));
  // powder is grains, not smoke: a fine shimmer that changes every frame
  let gn: f32 = fract(52.9829189 * fract(dot(v.clip.xy + vec2f(U.origin.w * 5.588, U.origin.w * 3.117), vec2f(0.06711056, 0.00583715))));
  let tau: f32 = v.d0.x * m * front * mix(0.72 + 0.56 * gn, 1.0, smoothstep(0.0, 0.3, v.d2.z));
  // depth of this lump's near face (bulging, roughened by the same noise), weighted so the nearest lumps decide the cloud's visible surface
  // (the weight is bounded: a thick cloud close to the lens must not overflow the half-float buffer the lumps add up in)
  // (a fall or a hard landing piles a great deal of snow into one place: with a wider range than this the sums ran past what a half float
  // holds, and the picture had a black hole in it)
  let zf: f32 = clamp(v.d0.z - hh * (0.8 + 0.4 * n) - U.dof.x, -4.5, 8.0);
  let w: f32 = exp(-max(zf, -1.5) * 1.4);
  o.color = vec4f(tau, tau * w * v.d0.y, tau * w * zf, tau * w);
  return o;
}`;

const PUFF_SUN_VS = `
fn vert(a: VIn) -> VOut {
  var v: VOut;
  v.clip = vec4f(0.0, 0.0, -2.0, 1.0); v.uv = vec2f(0.0); v.d0 = vec4f(0.0);
  let s: PuffS = puffState(a.a0, a.a1, a.a2, a.a3);
  if (s.dens < 0.004) { return v; }
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let c: vec4f = U.shadowVP * vec4f(s.pos, 1.0);
  v.clip = vec4f((c.xy + corner * (s.r * 1.15 / U.misc.w)) * U.sprayT.x - U.sprayT.yz, 0.5, 1.0);
  v.uv = corner; v.d0 = vec4f(s.dens, (c.z - U.sprayT.w) * 1199.0, 0.0, 0.0);
  return v;
}`;
const PUFF_SUN_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut; o.color = vec4f(0.0);
  let k: f32 = 1.0 - dot(v.uv, v.uv);
  if (k <= 0.0) { return o; }
  let t: f32 = v.d0.x * k * k * 0.75; let z: f32 = v.d0.y;
  o.color = vec4f(t, t * z, t * z * z, t);
  return o;
}`;

// the accumulated optical depth, lit as a snow cloud
const SPRAY_COMP_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut; o.color = vec4f(0.0, 0.0, 0.0, 1.0);
  var a: vec4f = texLod(tSpray, v.uv, 0.0);
  if (a.x < 0.0006) { return o; }
  // depth-aware upsample from half res so the cloud doesn't halo around the skier
  let zf: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy), 0));
  let hp: vec2f = v.clip.xy * 0.5 - 0.5; let h0: vec2f = floor(hp); let hf: vec2f = hp - h0;
  let mx: vec2i = vec2i(M.p.xy) - vec2i(1, 1);
  var acc: vec4f = vec4f(0.0); var wsum: f32 = 0.0;
  for (var j: i32 = 0; j < 4; j++) {
    let dx: i32 = j & 1; let dy: i32 = j >> 1;
    let tc: vec2i = clamp(vec2i(h0) + vec2i(dx, dy), vec2i(0, 0), mx);
    let zj: f32 = linDepth(texFetchD(tDepth, tc * 2, 0));
    let wb: f32 = mix(1.0 - hf.x, hf.x, f32(dx)) * mix(1.0 - hf.y, hf.y, f32(dy));
    let wz: f32 = 1.0 / (1.0 + sq((zj - zf) / (0.03 * zf + 0.03)));
    let w: f32 = (wb + 0.02) * wz;
    acc += texFetch(tSpray, tc, 0) * w; wsum += w;
  }
  a = clamp(acc / max(wsum, 1e-4), vec4f(-30000.0), vec4f(30000.0));
  if (a.x < 0.0005) { return o; }
  // (a soft knee, not a threshold: seen against the sun the faintest veil is bright, and a cut-off there draws the outline of a single lump)
  a.x = a.x * a.x / (a.x + 0.01);
  let vis: f32 = saturate(a.y / max(a.w, 1e-7));           // sun reaching the near face of the cloud (through terrain, skier and the cloud itself)
  let zr: f32 = a.z / max(a.w, 1e-7); let zm: f32 = zr + U.dof.x;
  let ndc: vec2f = vec2f(v.uv.x * 2.0 - 1.0, 1.0 - v.uv.y * 2.0);
  let tn: vec2f = vec2f(ndc.x * U.camRight.w * U.camUp.w, ndc.y * U.camRight.w);
  let d: vec3f = normalize(U.camFwd.xyz + U.camRight.xyz * tn.x + U.camUp.xyz * tn.y);
  let L: vec3f = U.sunDir.xyz; let mu: f32 = dot(d, L);
  // --- powder is not smoke. Hanging in the air it tears into veils and strands (a noise field anchored in the world, sinking with the snow,
  // read on the cloud's near face so it holds still while the camera moves), and where it is thin it breaks up into single winking specks.
  let tm: f32 = U.camPos.w;
  let wq: vec3f = (U.camPos.xyz + d * (zm / max(dot(d, U.camFwd.xyz), 0.2))) * 3.1 + M.q.xyz + vec3f(-U.wind.x, 0.9, -U.wind.z) * (tm * 1.2 - 256.0 * floor(tm * 1.2 / 256.0));
  let w1: f32 = tnoise3(wq); let w2: f32 = tnoise3(wq * 2.9 + vec3f(7.3, 1.9, 4.4)); let w3: f32 = tnoise3(wq * vec3f(7.1, 2.3, 7.1) + vec3f(2.1, 8.4, 5.7));
  let wn: f32 = w1 * 0.50 + w2 * 0.30 + w3 * 0.20;
  let thin: f32 = 1.0 - smoothstep(0.25, 2.6, a.x);
  // (what hangs within a few strides of the lens is far out of focus: no strands and no specks there, only a soft bright veil)
  let sharp: f32 = smoothstep(1.8, 3.4, zm);
  var tau: f32 = a.x * mix(1.0, smoothstep(0.34, 0.62, wn) * 1.9, (0.22 + 0.70 * thin) * M.p.w * sharp);
  let gs: f32 = 1170.0 / U.res.y;
  let gp: vec2f = v.clip.xy * (gs / 1.35);
  let s1: f32 = texLod(tNoise, (gp + vec2f(tm * 11.0, -tm * 37.0)) / 256.0, 0.0).x;
  let s2: f32 = texLod(tNoise, (gp * 0.57 + vec2f(-tm * 6.0, -tm * 17.0)) / 256.0 + vec2f(0.37, 0.61), 0.0).z;
  let spk: f32 = s1 * s2 * 4.0;
  tau *= mix(1.0, spk, 0.34 * (1.0 - smoothstep(0.08, 1.3, tau)) * M.q.w * sharp);
  // however much snow hangs between the lens and the skier, the figure is never lost in it: round the skier the cloud in front is only
  // ever so thick (thin veils are untouched; it is the solid wall that is held back)
  { let pc: vec4f = U.viewProj * vec4f(U.player.xyz + vec3f(0.0, 0.9, 0.0), 1.0);
    let dp: vec2f = (ndc - pc.xy / max(pc.w, 0.1)) * vec2f(U.camUp.w, 0.8);
    let hole: f32 = (1.0 - smoothstep(0.20, 0.62, length(dp))) * step(0.1, pc.w) * smoothstep(0.3, -0.5, zr) * M.r.x;
    let cap: f32 = mix(40.0, 1.05, hole);
    tau = cap * (1.0 - exp(-tau / cap)); }
  if (tau < 0.00002) { return o; }
  let T: f32 = exp(-tau);
  // --- a little relief: the slope of the cloud's near face gives a normal, so billows read as billows (kept gentle: this is powder, not cotton)
  let e: vec2f = 2.5 / M.p.xy;
  let lim: vec4f = vec4f(30000.0);
  let x0: vec4f = clamp(texLod(tSpray, v.uv - vec2f(e.x, 0.0), 0.0), -lim, lim); let x1: vec4f = clamp(texLod(tSpray, v.uv + vec2f(e.x, 0.0), 0.0), -lim, lim);
  let y0: vec4f = clamp(texLod(tSpray, v.uv - vec2f(0.0, e.y), 0.0), -lim, lim); let y1: vec4f = clamp(texLod(tSpray, v.uv + vec2f(0.0, e.y), 0.0), -lim, lim);
  let zx0: f32 = mix(zr, x0.z / max(x0.w, 1e-7), saturate(x0.x * 3.0)); let zx1: f32 = mix(zr, x1.z / max(x1.w, 1e-7), saturate(x1.x * 3.0));
  let zy0: f32 = mix(zr, y0.z / max(y0.w, 1e-7), saturate(y0.x * 3.0)); let zy1: f32 = mix(zr, y1.z / max(y1.w, 1e-7), saturate(y1.x * 3.0));
  let mpu: vec2f = vec2f(2.0 * zm * U.camRight.w * U.camUp.w, 2.0 * zm * U.camRight.w);          // metres per unit uv at that depth
  var gr: vec2f = vec2f(zx1 - zx0, zy1 - zy0) / (2.0 * e * mpu) * M.p.z;
  // the strands have relief too
  gr = (gr + vec2f(w2 - 0.5, w1 - 0.5) * 0.9) * sharp;
  let gl: f32 = length(gr); gr = gr * (min(gl, 3.0) / max(gl, 1e-4));
  let nv: vec3f = normalize(vec3f(gr.x, -gr.y, 1.0));
  let Nw: vec3f = U.camRight.xyz * nv.x + U.camUp.xyz * nv.y - U.camFwd.xyz * nv.z;
  let ndl: f32 = dot(Nw, L);
  let body: f32 = smoothstep(0.25, 1.8, tau);
  let sun: vec3f = U.sunCol.rgb * vis;
  // (1) the veil: light scattered once on its way through. Thin and against the sun = blazing
  let wbk: f32 = sq(saturate(mu)); let wfr: f32 = sq(saturate(-mu)); let wsd: f32 = 1.0 - wbk - wfr;
  let S1: f32 = wbk * tau * T + (wsd * (1.0 - T) + wfr * 0.5 * (1.0 - T * T)) * 0.5;
  let ph: f32 = (0.50 * hg(mu, 0.86) + 0.38 * hg(mu, 0.40) + 0.12 * hg(mu, -0.30)) * 12.566;
  var col: vec3f = sun * ph * S1 * 1.1;
  // (2) the body: snow hanging in the air. Where it is thick it has a lit side and a shaded side like any white solid
  let wrapD: f32 = pow(saturate((ndl + 0.45) / 1.45), 1.25);
  col += sun * (1.0 - T) * mix(0.30, 0.95 * wrapD, body);
  // (3) never dark: light that got in on the sunny side rattles around inside and comes out everywhere (it reaches much deeper than the
  // direct beam, and by then it has lost the sun's warmth to the blue of the sky pouring in from above); the sunlit slope adds white from below
  let up: f32 = Nw.y * 0.5 + 0.5;
  let deep: f32 = pow(vis, 0.35);
  let sunW: vec3f = mix(U.sunCol.rgb, vec3f(luma(U.sunCol.rgb)), 0.5);
  let glow: vec3f = sunW * (0.12 + 0.50 * deep);
  let bounce: vec3f = sunW * (0.10 + 0.10 * deep) + U.ambSky.rgb * 1.2;
  let amb: vec3f = U.ambSky.rgb * (1.2 + 1.0 * up) + bounce * mix(0.5, 1.0 - up, body);
  col += (amb + glow) * (1.0 - T);
  // (and whatever of it hangs in the beam of the headlamp)
  if (U.lamp.w > 0.0) { col += lampLight(U.camPos.xyz + d * (zm / max(dot(d, U.camFwd.xyz), 0.2))) * ((1.0 - T) * 0.55); }
  o.color = vec4f(col, T);
  return o;
}`;

const GRAIN_VS = `
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let t: f32 = U.camPos.w - a.a0.w; let life: f32 = a.a2.z;
  var g: GlintV = glintCull(); var cc: vec4f = vec4f(0.0);
  if (t > 0.0 && t < life) {
    let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
    let k: f32 = a.a2.x; let seed: f32 = a.a1.w;
    let vT: vec3f = U.wind.xyz * saturate(k * 0.4) + vec3f(0.0, -a.a2.y, 0.0);
    let e: f32 = exp(-k * t);
    var pos: vec3f = a.a0.xyz + vT * t + (a.a1.xyz - vT) * ((1.0 - e) / k);
    let vel: vec3f = vT + (a.a1.xyz - vT) * e;
    // flutter of the light flakes
    let fl: f32 = saturate(k * 0.4) * smoothstep(0.2, 1.5, t) * 0.10;
    pos += fl * vec3f(sin(seed * 191.7 + t * 3.1), 0.5 * sin(seed * 77.3 + t * 2.3), cos(seed * 131.1 + t * 2.7));
    if (pos.y > groundH(pos) + 0.015) {
      let lf: f32 = t / life;
      // (right at the lens they would be discs and bars across the picture: they thin out before that)
      let zv: f32 = max(dot(pos - U.camPos.xyz, U.camFwd.xyz), 0.3);
      let fade: f32 = smoothstep(0.0, 0.02, t) * (1.0 - lf * lf * lf) * smoothstep(0.7, 2.6, zv);
      let power: f32 = a.a2.w * fade;
      let ts: f32 = sprayTau(pos, 0.1);
      let visC: f32 = 0.58 * exp(-0.85 * ts) + 0.42 * exp(-0.16 * ts);
      let vis: f32 = shadowFast(pos, 0.0015) * visC;
      // every one of them is a crumb of snow with a size of its own (most a few millimetres, a few the size of a hazelnut)
      let rc: f32 = (0.0032 + 0.011 * pow(fract(seed * 7.77), 3.0)) * (0.5 * U.res.y / U.camRight.w) / zv;
      g = glintQuad(corner, pos, vel, seed, power, vis, min(rc, 0.006 * U.res.y), M.gp.y);
      let foot: f32 = 3.14159 * g.shp.y * g.shp.y + 4.0 * g.shp.y * g.shp.x;
      // (one that is down in the shade of the cloud is lost in it: it is the ones flung clear, in the sun, that show. And the ones that go
      // past within a few strides of the lens are a blur of a blur: left in, they are bars across the sky, like rain on the glass)
      cc = vec4f(U.sunCol.rgb * (0.08 + 0.66 * vis) + U.ambSky.rgb * 1.5, min(1.0, 3.14159 * rc * rc / max(foot, 1e-3)) * 0.92 * fade * smoothstep(0.30, 0.85, vis) * smoothstep(2.4, 5.2, zv) * M.gp.x);
    }
  }
  v.clip = g.clip; v.uv = g.uv; v.shp = g.shp; v.col = g.col; v.cc = cc;
  return v;
}`;
