// ---------------------------------------------------------------- boulders: stones on the run (Variants 'boulder' b)
// The richer mountain lays boulders out on the run and along its edges (03_course.js) as a swell of the ground itself. In 'a' the terrain
// shader bares rock only where its mesh is steep, and from a few metres off they read as mounds of snow. The owner wants the same shape
// (2026-11-18: "跟现在这个石头雪包的形状一样"), read at a glance as a stone with old snow on it. So in 'b' each swell is skinned: a shell laid
// over the very surface Course.height draws (sampled point by point, so it is the mound's own shape), roughened into weathered rock wherever
// the swell is too steep to hold snow, and thickened into a pillow of snow where it is not: on its top and up its long uphill side.
// As the photographs show (refs: a boulder after a snowfall in the Wasatch, granite erratics after snow): the stone is near black against the
// snow, the cap is thick and rounded and ends in a clean edge, and snow banks up round the foot.
// The shells are built on the CPU when a boulder comes near (a few a frame) into a pool of slots; drawn with the trees, cast into the shadow map.
const Boulders = (() => {
  const B = { far: 300, stats: { n: 0, built: 0 } };
  const NR = 34, NA = 72, NV = (NR + 1) * NA, SLOTS = 28, PER = 3;     // rings, around, vertices; shells kept at once; built per frame
  let gfx, ib, nIdx = 0, slots = [], pipe, pipeSh, live = [];
  const on = () => typeof Course !== 'undefined' && Course.boulder && Course.rich;
  // the rings: q from the middle out to a little past the rim (where the shell tucks under the snow), closer together toward the rim
  const QS = []; for (let i = 0; i <= NR; i++) { const t = i / NR; QS.push(1.06 * Math.sqrt(t) * (0.55 + 0.45 * t)); }

  B.init = function (g) {
    gfx = g;
    const I = [];
    for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = i * NA + j, b = i * NA + (j + 1) % NA; I.push(a, a + NA, b, b, a + NA, b + NA); }
    ib = gfx.buffer(new Uint32Array(I), 'index'); nIdx = I.length;
    for (let k = 0; k < SLOTS; k++) slots.push({ vb: gfx.buffer(new Float32Array(NV * 10), 'vertex', true), f: null, at: [0, 0, 0], seen: 0 });
    const bufs = [{ attrs: [['pos', 'vec3f'], ['nrm', 'vec3f'], ['pm', 'vec4f']] }];
    pipe = gfx.pipeline({
      name: 'boulder', lib: [SL.common, SL.hash, SL.fog, SL.shadow, SL.tonemap], buffers: bufs, cull: 'none',
      varyings: { wp: 'vec3f', nrm: 'vec3f', pm: 'vec4f' }, uniforms: { off: 'vec4f' }, textures: { tDetail: '2d', tShadow: 'shadow', tSky: '2d' },
      vs: `fn vert(a: VIn) -> VOut { var v: VOut; let wp: vec3f = a.pos + M.off.xyz; v.wp = wp; v.nrm = a.nrm; v.pm = a.pm; v.clip = U.viewProj * vec4f(wp, 1.0); return v; }`,
      fs: BOULDER_FS,
    });
    pipeSh = gfx.pipeline({
      name: 'boulderShadow', lib: [SL.common], buffers: bufs, varyings: {}, uniforms: { off: 'vec4f' }, textures: {}, colorFormat: null, cull: 'none', depthBias: 2, depthBiasSlope: 2.5,
      vs: `fn vert(a: VIn) -> VOut { var v: VOut; v.clip = U.shadowVP * vec4f(a.pos + M.off.xyz, 1.0); return v; }`, fs: null,
    });
    B.pipes = [pipe, pipeSh];
    if (typeof App !== 'undefined' && App.onMountain) App.onMountain.push(() => { for (const s of slots) s.f = null; });
  };

  // the shell of one boulder: positions relative to its middle (world xz, y from its middle's height), normals, and per vertex: snow (0..1),
  // how open to the sky, a tone for the stone, q
  const P = new Float32Array(NV * 3), Hn = new Float32Array(NV * 3), SN = new Float32Array(NV), AO = new Float32Array(NV), TN = new Float32Array(NV), V = new Float32Array(NV * 10);
  function build(f, slot) {
    const C = Course, cs = f.cs, cx = C.at(cs).cx + f.u, cz = -cs, y0 = C.height(cx, cz, 0.5);
    const sd = hashU(Math.round(cs * 10) * 7 + Math.round(f.u * 10) * 131 + 17), amt = 0.25 + 0.5 * ((sd >>> 8 & 255) / 255), cap = 0.07 + 0.08 * ((sd >>> 16 & 255) / 255);
    const ns = (sd & 1023) * 0.37;
    // 1. the mound's own surface, exactly where the ground is drawn
    for (let i = 0; i <= NR; i++) for (let j = 0; j < NA; j++) {
      const k = i * NA + j, th = j / NA * TAU, du = Math.cos(th), ds = Math.sin(th), q = QS[i];
      const s = cs + ds * q * f.rad / (ds < 0 ? 0.45 : 1), u = f.u + du * q * f.rad, x = C.at(s).cx + u, z = -s;
      P[k * 3] = x - cx; P[k * 3 + 1] = C.height(x, z, 0.5) - y0; P[k * 3 + 2] = z - cz;
    }
    normals(P, Hn);
    // 2. where the snow lies (faces turned to the sky, broken up), and the stone's roughness where it does not
    for (let i = 0; i <= NR; i++) for (let j = 0; j < NA; j++) {
      const k = i * NA + j, q = QS[i], x = P[k * 3] + ns, y = P[k * 3 + 1], z = P[k * 3 + 2], ny = Hn[k * 3 + 1];
      const n1 = vnoise3(x * 1.3, y * 1.3, z * 1.3, 5), n2 = vnoise3(x * 3.1, y * 3.1, z * 3.1, 6), n3 = vnoise3(x * 8, y * 8, z * 8, 7);
      const lo = 0.93 - 0.2 * amt;                                                   // (how steep a face still holds snow)
      let sn = smooth(lo - 0.035, lo + 0.035, ny + 0.06 * n1 + 0.03 * n2);
      sn *= smooth(1.02, 0.9, q);                                                     // (past the rim it is the ground's own snow)
      const rim = smooth(0.88, 1.03, q);                                              // (the shell tucks under the snow at its foot)
      // the stone: blocky at the size of its joints (a quantised noise reads as faces), pitted finer; cracks are thin dark grooves
      const blk = Math.round(n1 * 3) / 3 * 0.6 + n1 * 0.4;
      const crack = smooth(0.9, 0.98, 1 - Math.abs(vnoise3(x * 2.2, y * 2.2, z * 2.2, 9)));
      const rd = (0.07 * blk + 0.035 * n2 + 0.012 * n3 - 0.035 * crack) * Math.min(1, f.h) * (1 - sn) * (1 - rim);
      // the cap: a pillow, thickest where the face is level, rounded off at its edge
      const cd = cap * sn * (0.6 + 0.4 * smooth(0.9, 1, ny)) * (0.8 + 0.3 * n2) * (1 - rim);
      const lift = 0.025 + cd - 0.09 * rim;
      const push = rd + 0.02 * (1 - rim);
      P[k * 3] += Hn[k * 3] * push; P[k * 3 + 1] += Hn[k * 3 + 1] * push + lift; P[k * 3 + 2] += Hn[k * 3 + 2] * push;
      SN[k] = sn; AO[k] = 1 - 0.65 * crack * (1 - sn) - 0.25 * smooth(0.0, -0.6, n1) * (1 - sn); TN[k] = 0.5 + 0.5 * vnoise3(x * 0.7, y * 0.7, z * 0.7, 3);
    }
    normals(P, Hn);
    for (let k = 0; k < NV; k++) {
      const o = k * 10; V[o] = P[k * 3]; V[o + 1] = P[k * 3 + 1]; V[o + 2] = P[k * 3 + 2];
      V[o + 3] = Hn[k * 3]; V[o + 4] = Hn[k * 3 + 1]; V[o + 5] = Hn[k * 3 + 2]; V[o + 6] = SN[k]; V[o + 7] = AO[k]; V[o + 8] = TN[k]; V[o + 9] = QS[Math.floor(k / NA)];
    }
    gfx.updateBuffer(slot.vb, 0, V);
    slot.f = f; slot.at[0] = cx; slot.at[1] = y0; slot.at[2] = cz; B.stats.built++;
  }
  // normals of the ring grid (the middle ring is a single point repeated: it takes the mean of the ring round it)
  function normals(P, N) {
    for (let i = 0; i <= NR; i++) for (let j = 0; j < NA; j++) {
      const k = i * NA + j, jp = i * NA + (j + 1) % NA, jm = i * NA + (j + NA - 1) % NA, ip = Math.min(i + 1, NR) * NA + j, im = Math.max(i - 1, 0) * NA + j;
      const ax = P[ip * 3] - P[im * 3], ay = P[ip * 3 + 1] - P[im * 3 + 1], az = P[ip * 3 + 2] - P[im * 3 + 2];
      const bx = P[jp * 3] - P[jm * 3], by = P[jp * 3 + 1] - P[jm * 3 + 1], bz = P[jp * 3 + 2] - P[jm * 3 + 2];
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      if (nx * nx + ny * ny + nz * nz < 1e-14) { nx = 0; ny = 1; nz = 0; }
      if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
      const l = Math.sqrt(nx * nx + ny * ny + nz * nz); N[k * 3] = nx / l; N[k * 3 + 1] = ny / l; N[k * 3 + 2] = nz / l;
    }
    let sx = 0, sy = 0, sz = 0; for (let j = 0; j < NA; j++) { sx += N[(NA + j) * 3]; sy += N[(NA + j) * 3 + 1]; sz += N[(NA + j) * 3 + 2]; }
    const l = Math.hypot(sx, sy, sz) || 1; for (let j = 0; j < NA; j++) { N[j * 3] = sx / l; N[j * 3 + 1] = sy / l; N[j * 3 + 2] = sz / l; }
  }

  let frame = 0;
  B.update = function (cam, origin) {
    live.length = 0; B.stats.n = 0;
    if (!gfx || !on()) return;
    frame++;
    const px = cam.pos[0], pz = cam.pos[2], cs = -pz, want = [];
    Course.boulders(cs - 80, cs + B.far, (f, x, z) => { const d = Math.hypot(x - px, z - pz); if (d < B.far) want.push([d, f]); });
    want.sort((a, b) => a[0] - b[0]);
    let builds = PER;
    for (const w of want.slice(0, SLOTS)) {
      const f = w[1]; let s = slots.find(t => t.f === f);
      if (!s) {
        if (builds <= 0) continue;
        s = slots.find(t => !t.f) || slots.reduce((a, b) => (a.seen < b.seen ? a : b));
        build(f, s); builds--;
      }
      s.seen = frame; live.push(s);
    }
    B.stats.n = live.length;
  };
  const off = (s, o) => [s.at[0] - o[0], s.at[1] - o[1], s.at[2] - o[2], 0];
  B.draw = function (R) {
    for (const s of live) gfx.draw(pipe, { u: { off: off(s, R.origin) }, tex: { tDetail: Tex.detail, tShadow: R.shadowTex, tSky: Sky.lut }, vb: [s.vb], ib, count: nIdx });
  };
  B.drawShadow = function () {
    const o = typeof Render !== 'undefined' ? Render.origin : [0, 0, 0];
    for (const s of live) gfx.draw(pipeSh, { u: { off: off(s, o) }, vb: [s.vb], ib, count: nIdx });
  };
  return B;
})();

const BOULDER_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let toC: vec3f = U.camPos.xyz - v.wp; let dist: f32 = length(toC); let V: vec3f = toC / dist;
  let L: vec3f = U.sunDir.xyz;
  let N: vec3f = normalize(v.nrm);
  let wxz: vec2f = v.wp.xz + U.origin.xz;
  let sh: f32 = shadowAt(v.wp + N * 0.04, 0.0016);
  let ao: f32 = v.pm.y;
  let d1: vec4f = tex(tDetail, wxz * 1.9 + v.wp.yy * 1.7);
  let d2: vec4f = tex(tDetail, wxz * 0.37 + v.wp.yy * 0.41 + vec2f(0.31, 0.77));
  // (the snow's edge is clean, as on a real cap; only a little broken)
  let sn: f32 = smoothstep(0.42, 0.58, v.pm.x + (d1.z - 0.5) * 0.12);
  // --- the stone: dark weathered granite (photographs of boulders in snow: about 0.10-0.25 against snow's 0.9), mottled, a little warmer
  // or colder from one stone to the next, darker in its cracks, a faint green-grey of lichen on its shoulders
  var alb: vec3f = mix(vec3f(0.11, 0.108, 0.115), vec3f(0.26, 0.24, 0.215), saturate(v.pm.z * 1.1 + (d2.z - 0.5) * 1.0 - 0.2));
  alb *= 0.78 + 0.44 * d1.x;
  alb = mix(alb, vec3f(0.19, 0.20, 0.165), smoothstep(0.62, 0.8, d2.x) * smoothstep(0.3, 0.7, N.y) * 0.6);
  // (dark streaks down the faces where meltwater runs off the cap, and the stone just under the cap wet and dark)
  let stk: f32 = tex(tDetail, vec2f((wxz.x + wxz.y) * 0.9, v.wp.y * 0.08)).z;
  alb *= 1.0 - 0.35 * smoothstep(0.55, 0.75, stk) * (1.0 - saturate(N.y * 1.3));
  alb *= 1.0 - 0.3 * smoothstep(0.05, 0.4, v.pm.x) * (1.0 - sn);
  alb *= 0.45 + 0.55 * ao;
  let Nr: vec3f = normalize(N + (vec3f(d1.x, d1.y, d1.w) - vec3f(0.5)) * 0.3);
  let ndl: f32 = dot(Nr, L);
  let amb: vec3f = U.ambSky.rgb * (0.55 + 0.45 * Nr.y) + U.ambGnd.rgb * (0.5 - 0.5 * Nr.y) * 1.6 + twiLight(Nr);
  let Hh: vec3f = normalize(V + L);
  var rock: vec3f = alb * (U.sunCol.rgb * (saturate(ndl) * sh) + amb * (0.35 + 0.65 * ao));
  rock += U.sunCol.rgb * (sh * 0.04 * pow(max(dot(Nr, Hh), 0.0), 24.0) * saturate(ndl * 4.0));
  // --- the snow on it: lit as the terrain lights its own (gateSnow's terms)
  let Ns: vec3f = normalize(N + (vec3f(d2.x, 0.5, d2.y) - vec3f(0.5)) * 0.15);
  let ndls: f32 = dot(Ns, L);
  let ambs: vec3f = U.ambSky.rgb * (1.3 + 0.8 * Ns.y) + U.ambGnd.rgb * (0.50 - 0.45 * Ns.y) + twiLight(Ns);
  let snow: vec3f = vec3f(0.93, 0.955, 0.985) * (U.sunCol.rgb * (saturate((ndls + 0.12) / 1.12) * sh) + ambs);
  var col: vec3f = mix(rock, snow, sn);
  col = applyFog(col, v.wp);
  o.color = vec4f(col, 1.0);
  return o;
}
`;
