// ---------------------------------------------------------------- trees: spruce bent under a winter of snow
// Every tree is a distance field: a trunk, tiers of drooping boughs, and a pillow of snow lying on each bough. A few variants are
// meshed once at boot. The nearest trees are drawn as those meshes; the rest of the forest, all the way down the valley, as flat
// cards carrying the same trees photographed from eight sides (normals + materials, so the cards are lit by the same sun as the meshes).
// Placement comes from Course, so physics and pictures agree.
const Trees = (() => {
  const T = { NV: 3, NK: 8, cell: 0.12, near: 30, fadeW: 6, maxNear: 14, far: 460, maxFar: 6144, tileW: 160, tileH: 384, pitch: 0.24, enabled: true, stats: { near: 0, far: 0, tris: 0 } };
  const HW = 2.8, V0 = -2.25, V1 = 11.15;        // card extents in model metres (width +-HW, height V0..V1: the model's box seen from `pitch` above)
  let gfx, pipe, pipeShadow, pipeBake, pipeDil, pipeCard, pipeCardShadow, pipeGhostZ, pipeGhost, atlasA, atlasB, baked = false;
  const meshes = [], inst = [], ghost = [];
  let veil = new Map(), veil2 = new Map();      // trees being taken out of the picture: [how solid (0..1), hidden?] by tree
  let farCPU, farBuf, nFar = 0;

  // ---- the model: canonical tree 10 m tall, origin at the snow line
  function model(seed) {
    const rnd = RNG(seed), K = 16 + Math.floor(rnd() * 3), lx = (rnd() - 0.5) * 0.5, lz = (rnd() - 0.5) * 0.5;
    const tiers = [];
    for (let k = 0; k < K; k++) {
      const u = k / (K - 1), y = 1.0 + 8.45 * Math.pow(u, 0.92) + (k > 0 && k < K - 1 ? (rnd() - 0.5) * 0.14 : 0);
      const Lt = (2.25 * Math.pow(Math.max(0.02, 1 - y / 10.1), 0.84) + 0.18) * (0.90 + 0.2 * rnd());
      const M = Math.round(lerp(6.6, 3.6, u)), ph = k * 2.4 + rnd() * 0.8, bs = [];
      let ymin = 1e9, ymax = -1e9, rmax = 0;
      for (let j = 0; j < M; j++) {
        const a = ph + (j + (rnd() - 0.5) * 0.6) * TAU / M, L = Lt * (0.58 + 0.52 * rnd());
        const rise = 0.14 + 0.16 * rnd(), droop = lerp(0.66, 0.30, u) * (0.8 + 0.45 * rnd()), W = L * (0.25 + 0.09 * rnd());
        const b = { c: Math.cos(a), s: Math.sin(a), L, W, rise, k2: (rise + droop) / L, ts: lerp(0.17, 0.09, u) * (0.8 + 0.5 * rnd()), y0: y + (rnd() - 0.5) * 0.24, ph: rnd() * TAU };
        bs.push(b);
        ymin = Math.min(ymin, b.y0 - droop * L - 0.45 * W - 0.25); ymax = Math.max(ymax, b.y0 + rise * rise * L / (4 * (rise + droop)) + b.ts + 0.3); rmax = Math.max(rmax, L + 0.45);
      }
      tiers.push({ bs, ymin, ymax, rmax });
    }
    const ell = (a, b, ra, rb) => { const k0 = Math.hypot(a / ra, b / rb), k1 = Math.hypot(a / (ra * ra), b / (rb * rb)); return k1 > 1e-9 ? k0 * (k0 - 1) / k1 : -Math.min(ra, rb); };
    const res = { n: 0, s: 0 };
    function parts(x, y, z) {
      const bend = y > 0 ? (y * 0.1) * (y * 0.1) : 0, px = x - lx * bend, pz = z - lz * bend, r = Math.hypot(px, pz);
      const yc0 = clamp(y, -1.4, 9.95);
      let dN = Math.hypot(r, y - yc0) - lerp(0.15, 0.022, sat(yc0 / 10)), dS = 1e9;
      for (let i = 0; i < tiers.length; i++) {
        const t = tiers[i]; if (y < t.ymin || y > t.ymax || r > t.rmax) continue;
        for (let j = 0; j < t.bs.length; j++) {
          const b = t.bs[j], rho = px * b.c + pz * b.s; if (rho < -0.25 || rho > b.L + 0.4) continue;
          const a = pz * b.c - px * b.s, W = b.W; if (a > W + 0.4 || a < -W - 0.4) continue;
          const tt = clamp(rho / b.L, 0.02, 0.985), rc = tt * b.L;
          // outline of the bough seen from above: a paddle with scalloped edges (the secondary twigs)
          const w = W * Math.sqrt(5.07 * tt * (1 - tt) * (1 - 0.45 * tt)) * (1 + 0.16 * Math.sin(tt * 15 + b.ph + a * 2.0)) + 0.025;
          // its spine rises a little, then sags under the load; the edges hang lower than the spine
          const yy = y - (b.y0 + b.rise * rc - b.k2 * rc * rc) + 0.38 * a * a / W;
          const tn = 0.05 + 0.03 * (1 - tt), over = Math.abs(rho - rc);
          let dn = ell(a, yy, w, tn);
          const ts = b.ts * (0.25 + 0.75 * smooth(0.0, 0.3, tt)) * (1 - 0.5 * tt * tt);
          let ds = ell(a, yy - tn * 0.5 - ts * 0.5, w * 0.88, ts * 0.62 + 0.02);
          if (over > 0) { dn = Math.hypot(Math.max(dn, 0), over) + Math.min(dn, 0); ds = Math.hypot(Math.max(ds, 0), over) + Math.min(ds, 0); }
          dN = sd.smin(dN, dn, 0.06); dS = sd.smin(dS, ds, 0.12);
        }
      }
      // snow never lies smooth: lumps and sags
      if (dS < 0.4) dS -= 0.035 * vnoise3(x * 2.7, y * 2.7, z * 2.7, 5) + 0.018 * vnoise3(x * 6.1, y * 6.1, z * 6.1, 6);
      res.n = dN; res.s = dS; return res;
    }
    const f = (x, y, z) => { const p = parts(x, y, z); return sd.smin(p.n, p.s, 0.03); };
    function attr(x, y, z, nx, ny, nz, out) {
      const p = parts(x, y, z);
      out[0] = clamp(p.n - p.s, -0.12, 0.12);                                            // > 0: snow is the surface here
      out[1] = sat(0.12 + 0.88 * (0.5 * sat(f(x + nx * 0.16, y + ny * 0.16, z + nz * 0.16) / 0.16) + 0.5 * sat(f(x + nx * 0.5, y + ny * 0.5, z + nz * 0.5) / 0.5)));   // occlusion
      const bend = sat(y / 10) * sat(y / 10); out[2] = Math.hypot(x - lx * bend, z - lz * bend);   // distance from the trunk axis
      out[3] = sat(0.6 * sat(f(x, y + 0.5, z) / 0.5) + 0.4 * sat(f(x, y + 1.3, z) / 1.3));    // open sky overhead (0 = under another bough)
    }
    return { f, attr };
  }
  T.model = model;
  T.build = function (v) { const m = model(1000 + v * 77); return meshSDF(m.f, [-2.8, -1.5, -2.8], [2.8, 10.4, 2.8], T.cell, { attr: m.attr, stride: 4, repair: true }); };

  T.init = function (g) {
    gfx = g;
    for (let v = 0; v < T.NV; v++) {
      const m = T.build(v);
      meshes.push({ vb: gfx.buffer(m.verts, 'vertex'), ib: gfx.buffer(m.idx, 'index'), count: m.ni });
      const cpu = new Float32Array(T.maxNear * 8); inst.push({ cpu, buf: gfx.buffer(cpu, 'vertex', true), n: 0, solid: 0 });
      const gcpu = new Float32Array(T.maxNear * 8); ghost.push({ cpu: gcpu, buf: gfx.buffer(gcpu, 'vertex', true), n: 0 });
      T.stats.tris += m.ni / 3;
    }
    farCPU = new Float32Array(T.maxFar * 8); farBuf = gfx.buffer(farCPU, 'vertex', true);
    const mesh = { attrs: [['pos', 'vec3f'], ['nrm', 'vec3f'], ['mat', 'vec4f']] }, per = { instanced: true, attrs: [['i0', 'vec4f'], ['i1', 'vec4f']] };
    const treeVS = (nudge) => `fn vert(a: VIn) -> VOut { var v: VOut; let t: TreeV = treeVertex(a.pos, a.nrm, a.i0, a.i1); v.wp = t.wp; v.nrm = t.n; v.bp = a.pos; v.mat = a.mat; let gq: f32 = floor(a.i1.z * 0.5);
        v.ex = vec4f(a.i1.z - 2.0 * gq, a.i1.w, a.i0.w, gq / 255.0); v.clip = U.viewProj * vec4f(t.wp, 1.0);${nudge ? ' v.clip.z = v.clip.z - 0.00003 * v.clip.w;' : ''} return v; }`;
    const treeDesc = { lib: [SL.common, SL.hash, SL.fog, SL.shadow, SL.tonemap, TREE_SSL, TREE_SURF_SSL], buffers: [mesh, per],
      varyings: { wp: 'vec3f', nrm: 'vec3f', bp: 'vec3f', mat: 'vec4f', ex: 'vec4f' }, uniforms: { p: 'vec4f' }, textures: { tDetail: '2d', tShadow: 'shadow', tSky: '2d' } };
    pipe = gfx.pipeline(Object.assign({ name: 'tree', vs: treeVS(false), fs: TREE_FS.replace('GHOST_OUT', 'o.color = vec4f(col, 1.0);') }, treeDesc));
    // a tree being taken out of the picture (see update): its nearest surface is laid into the depth buffer first, then that one surface is
    // drawn over the finished view at the tree's strength, so the fade is even, with no layer showing through another
    pipeGhostZ = gfx.pipeline({ name: 'treeGhostZ', lib: [SL.common, TREE_SSL], buffers: [mesh, per], varyings: {}, uniforms: { p: 'vec4f' }, textures: {}, colorMask: false,
      vs: `fn vert(a: VIn) -> VOut { var v: VOut; let t: TreeV = treeVertex(a.pos, a.nrm, a.i0, a.i1); v.clip = U.viewProj * vec4f(t.wp, 1.0); return v; }`,
      fs: `fn frag(v: VOut) -> FOut { var o: FOut; o.color = vec4f(0.0); return o; }` });
    pipeGhost = gfx.pipeline(Object.assign({ name: 'treeGhost', depthFunc: 'lequal', depthWrite: false, blend: 'premul', vs: treeVS(true), fs: TREE_FS.replace('GHOST_OUT', 'o.color = vec4f(col * v.ex.w, v.ex.w);') }, treeDesc));
    pipeShadow = gfx.pipeline({
      name: 'treeShadow', lib: [SL.common, TREE_SSL], buffers: [mesh, per], varyings: {}, uniforms: { p: 'vec4f' }, textures: {}, colorFormat: null, cull: 'none', depthBias: 2, depthBiasSlope: 2.5,
      vs: `fn vert(a: VIn) -> VOut { var v: VOut; let t: TreeV = treeVertex(a.pos, a.nrm, a.i0, a.i1); v.clip = U.shadowVP * vec4f(t.wp, 1.0); return v; }`, fs: null,
    });
    // --- the photographs: each variant from NK sides, looking slightly down
    const aw = T.tileW * T.NK, ah = T.tileH * T.NV;
    atlasA = gfx.texture({ w: aw, h: ah, format: 'rgba8', filter: 'linear', wrap: 'clamp', mips: true }); atlasB = gfx.texture({ w: aw, h: ah, format: 'rgba8', filter: 'linear', wrap: 'clamp', mips: true });
    T.atlasA = atlasA; T.atlasB = atlasB;
    pipeBake = gfx.pipeline({
      name: 'treeBake', lib: [SL.common, TREE_SURF_SSL], buffers: [mesh], varyings: { nrm: 'vec3f', bp: 'vec3f', mat: 'vec4f' }, uniforms: { a: 'vec4f', r: 'vec4f', m: 'vec4f' },
      textures: { tDetail: '2d' }, colorFormat: 'rgba8', cull: 'none',
      vs: `fn vert(a: VIn) -> VOut { var v: VOut;
        let rt: vec3f = vec3f(M.a.x, 0.0, -M.a.y); let c: vec3f = vec3f(M.a.y, 0.0, M.a.x);
        let d: f32 = dot(a.pos, c);
        let u: f32 = dot(a.pos, rt) / ${HW.toFixed(2)}; let w: f32 = (a.pos.y - d * M.a.w / M.a.z - ${((V0 + V1) / 2).toFixed(3)}) / ${((V1 - V0) / 2).toFixed(3)};
        v.clip = vec4f(M.r.x + u * M.r.z, M.r.y + w * M.r.w, 0.5 - (d * M.a.z + a.pos.y * M.a.w) * 0.03, 1.0);
        v.nrm = a.nrm; v.bp = a.pos; v.mat = a.mat; return v; }`,
      fs: `fn frag(v: VOut) -> FOut { var o: FOut;
        let x: vec3f = vec3f(M.a.x, 0.0, -M.a.y); let z: vec3f = vec3f(M.a.y * M.a.z, M.a.w, M.a.x * M.a.z); let y: vec3f = cross(z, x);
        let N0: vec3f = normalize(v.nrm);
        var Ng: vec3f = normalize(cross(dpdx(v.bp), dpdy(v.bp))); if (dot(Ng, z) < 0.0) { Ng = -Ng; }
        let s: TreeS = treeSurface(v.bp, v.mat, normalize(mix(Ng, N0, smoothstep(-0.1, 0.4, dot(N0, Ng)))), 0.5);
        let N: vec3f = normalize(mix(s.Nn, s.Ns, s.snow));
        if (M.m.x < 0.5) { o.color = vec4f(vec3f(dot(N, x), dot(N, y), dot(N, z)) * 0.5 + 0.5, 1.0); }
        else { o.color = vec4f(s.snow, s.ao, s.open, s.bark); }
        return o; }`,
    });
    const cardVS = (shadow) => `fn vert(a: VIn) -> VOut { var v: VOut;
        let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u));
        let sc: f32 = a.i0.w; let vr: f32 = floor(a.i1.w); let fade: f32 = (a.i1.w - vr) / 0.98;
        ${shadow ? 'var dh: vec2f = normalize(U.sunDir.xz);' : 'var dh: vec2f = normalize(U.camPos.xz - a.i0.xz);'}
        // which photograph: the direction of the viewer (or the sun) in the tree's own frame
        let dl: vec2f = vec2f(dh.x * a.i1.x - dh.y * a.i1.y, dh.x * a.i1.y + dh.y * a.i1.x);
        let ang: f32 = atan2(dl.x, dl.y) / ${(TAU / T.NK).toFixed(6)} + ${T.NK}.0;
        let k0: f32 = floor(ang); let fr: f32 = ang - k0;
        let rt: vec3f = vec3f(dh.y, 0.0, -dh.x);
        let uu: f32 = corner.x * 2.0 - 1.0; let vv: f32 = mix(${V0.toFixed(2)}, ${V1.toFixed(2)}, corner.y);
        let wp: vec3f = a.i0.xyz + rt * (uu * ${HW.toFixed(2)} * sc) + vec3f(0.0, vv * sc, 0.0);
        v.clip = ${shadow ? 'U.shadowVP' : 'U.viewProj'} * vec4f(wp, 1.0);
        v.uv = vec2f(corner.x, 1.0 - corner.y);
        v.vw = vec4f(k0 - ${T.NK}.0 * floor(k0 / ${T.NK}.0), (k0 + 1.0) - ${T.NK}.0 * floor((k0 + 1.0) / ${T.NK}.0), fr, vr);
        ${shadow ? 'v.ex = vec4f(0.0);' : `v.wp = wp;
        let dist: f32 = length(U.camPos.xyz - a.i0.xyz);
        v.ex = vec4f(a.i1.x, a.i1.y, fade, max(0.0, log2(${(T.tileH / (V1 - V0)).toFixed(3)} / sc * dist * 2.0 * U.camRight.w / U.res.y)));`}
        return v; }`;
    pipeCard = gfx.pipeline({
      name: 'treeCard', lib: [SL.common, SL.hash, SL.fog, SL.shadow, SL.tonemap, TREE_SURF_CARD_SSL], buffers: [per], topology: 'strip', cull: 'none',
      varyings: { wp: 'vec3f', uv: 'vec2f', vw: 'vec4f', ex: 'vec4f' }, uniforms: { p: 'vec4f' },
      textures: { tA: '2d', tB: '2d', tShadow: 'shadow', tSky: '2d' },
      vs: cardVS(false), fs: TREE_CARD_FS.replace(/NKF/g, T.NK + '.0').replace(/NVF/g, T.NV + '.0').replace(/PITCH_C/g, Math.cos(T.pitch).toFixed(5)).replace(/PITCH_S/g, Math.sin(T.pitch).toFixed(5)).replace(/KSTEP/g, (TAU / T.NK).toFixed(6)),
    });
    pipeCardShadow = gfx.pipeline({
      name: 'treeCardShadow', lib: [SL.common], buffers: [per], topology: 'strip', cull: 'none', varyings: { uv: 'vec2f', vw: 'vec4f', ex: 'vec4f' }, uniforms: { p: 'vec4f' }, textures: { tA: '2d' },
      colorFormat: null, depthBias: 2, depthBiasSlope: 2.0,
      vs: cardVS(true),
      fs: `fn frag(v: VOut) -> FOut { var o: FOut; o.color = vec4f(0.0);
        let k: f32 = select(v.vw.x, v.vw.y, v.vw.z > 0.5);
        if (texLod(tA, vec2f((k + v.uv.x) / ${T.NK}.0, (v.vw.w + v.uv.y) / ${T.NV}.0), 1.0).a < 0.4) { discard; }
        return o; }`,
    });
    // the photographs are cut-outs: grow each one's colours a few texels into the empty surround, so filtering at the outline never reads a void
    pipeDil = gfx.pipeline({
      name: 'treeDilate', lib: [SL.common], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f' }, textures: { tSrc: 'fetch', tCov: 'fetch' }, colorFormat: 'rgba8', depth: false, depthTest: false, cull: 'none',
      vs: VS_FULLSCREEN,
      fs: `fn frag(v: VOut) -> FOut { var o: FOut;
        let p: vec2i = vec2i(v.clip.xy); let hi: vec2i = vec2i(${T.tileW * T.NK - 1}, ${T.tileH * T.NV - 1});
        let c: vec4f = texFetch(tSrc, p, 0);
        o.color = c;
        if (texFetch(tCov, p, 0).a > 0.0) { return o; }
        var s: vec4f = vec4f(0.0); var n: f32 = 0.0;
        for (var j: i32 = -1; j <= 1; j++) { for (var i: i32 = -1; i <= 1; i++) {
          let q: vec2i = clamp(p + vec2i(i, j), vec2i(0, 0), hi);
          let w: f32 = step(0.001, texFetch(tCov, q, 0).a);
          s += texFetch(tSrc, q, 0) * w; n += w;
        } }
        if (n < 0.5) { return o; }
        s = s / n;
        o.color = mix(vec4f(s.rgb, 0.004), s, M.p.x);
        return o; }`,
    });
    T.pipes = [pipe, pipeShadow, pipeBake, pipeDil, pipeCard, pipeCardShadow, pipeGhostZ, pipeGhost];
  };

  T.bake = function () {
    const dep = gfx.texture({ w: atlasA.w, h: atlasA.h, format: 'depth', filter: 'nearest' });
    const ce = Math.cos(T.pitch), se = Math.sin(T.pitch);
    for (let pass = 0; pass < 2; pass++) {
      const tg = gfx.target({ color: pass ? atlasB : atlasA, depth: dep });
      gfx.beginPass(tg, { color: pass ? [0.5, 0.5, 0.5, 0] : [0.5, 0.5, 1, 0], depth: 1 });
      for (let v = 0; v < T.NV; v++) for (let k = 0; k < T.NK; k++) {
        const ph = k * TAU / T.NK;
        gfx.draw(pipeBake, { u: { a: [Math.cos(ph), Math.sin(ph), ce, se], r: [(k + 0.5) / T.NK * 2 - 1, 1 - (v + 0.5) / T.NV * 2, 1 / T.NK, 1 / T.NV], m: [pass, 0, 0, 0] }, tex: { tDetail: Tex.detail }, vb: [meshes[v].vb], ib: meshes[v].ib, count: meshes[v].count });
      }
      gfx.endPass(); gfx.destroyTarget(tg);
    }
    gfx.destroyTexture(dep);
    { const tA = gfx.texture({ w: atlasA.w, h: atlasA.h, format: 'rgba8', filter: 'nearest', wrap: 'clamp' }), tB = gfx.texture({ w: atlasA.w, h: atlasA.h, format: 'rgba8', filter: 'nearest', wrap: 'clamp' });
      let a = atlasA, b = atlasB, a2 = tA, b2 = tB;
      for (let it = 0; it < 6; it++) {
        const ta = gfx.target({ color: a2 }), tb = gfx.target({ color: b2 });
        gfx.beginPass(ta, { color: [0, 0, 0, 0] }); gfx.draw(pipeDil, { u: { p: [0, 0, 0, 0] }, tex: { tSrc: a, tCov: a }, count: 3 }); gfx.endPass();
        gfx.beginPass(tb, { color: [0, 0, 0, 0] }); gfx.draw(pipeDil, { u: { p: [1, 0, 0, 0] }, tex: { tSrc: b, tCov: a }, count: 3 }); gfx.endPass();
        gfx.destroyTarget(ta); gfx.destroyTarget(tb);
        let t = a; a = a2; a2 = t; t = b; b = b2; b2 = t;
      }
      gfx.destroyTexture(tA); gfx.destroyTexture(tB); }
    gfx.genMips(atlasA); gfx.genMips(atlasB);
    baked = true;
  };

  // ---- placement: chunks of the course's tree grid, cached
  const CH = 8, CS = CH * TREE_CELL, chunks = new Map();
  function chunk(cx, cz) {
    const key = (cx + 4096) * 2097152 + (cz + 1048576);
    let c = chunks.get(key); if (c) return c;
    const list = [];
    for (let j = 0; j < CH; j++) for (let i = 0; i < CH; i++) {
      const t = Course.treeInCell(cx * CH + i, cz * CH + j); if (!t.ok) continue;
      list.push(t.x, Course.height(t.x, t.z, 0.5), t.z, t.h, t.rot, t.variant % T.NV, (t.seed & 0xffff) / 65536);
    }
    c = new Float64Array(list); chunks.set(key, c);
    if (chunks.size > 2400) { let n = 0; for (const k of chunks.keys()) { chunks.delete(k); if (++n >= 600) break; } }
    return c;
  }
  T.reset = () => chunks.clear();
  T.extra = [];        // test hook: [x, z, h, rot, variant] trees drawn in addition to the course's own

  // gather the trees around the camera: the closest few as meshes, everything else as cards (render space = world - origin).
  // Chunks are visited nearest first, so the cards are roughly front to back and a full buffer only ever drops the farthest trees.
  const cand = [], near = []; let ring = null;
  function ringTable() {
    const n = Math.ceil(T.far / CS) + 1, a = [];
    for (let dz = -n; dz <= n; dz++) for (let dx = -n; dx <= n; dx++) a.push([dx, dz, Math.hypot(dx, dz)]);
    a.sort((p, q) => p[2] - q[2]); ring = new Int16Array(a.length * 2); a.forEach((e, i) => { ring[i * 2] = e[0]; ring[i * 2 + 1] = e[1]; }); ring.far = T.far;
  }
  T.update = function (cam, origin, aspect, player, dt) {
    for (const I of inst) { I.n = 0; I.solid = 0; } for (const I of ghost) I.n = 0; nFar = 0;
    if (!T.enabled) return;
    if (!ring || ring.far !== T.far) ringTable();
    const px = cam.pos[0], pz = cam.pos[2], fl = Math.hypot(cam.fwd[0], cam.fwd[2]) || 1, fx = cam.fwd[0] / fl, fz = cam.fwd[2] / fl, R = T.far, R2 = R * R;
    // the view as a wedge on the map, widened by a tree's width and by the reach of its shadow across the view
    const thx = Math.tan(cam.fovY / 2) * Math.max(aspect || 0.5, 0.3) * 1.15 + 0.06, mrg = 13;
    const nearR = T.near + T.fadeW, ox = origin[0], oy = origin[1], oz = origin[2];
    const far = (x, y, z, h, rot, v, seed, fade, d) => {
      if (nFar >= T.maxFar) return; const o = nFar++ * 8, s = h / 10 * smooth(R, R - 60, d);
      farCPU[o] = x - ox; farCPU[o + 1] = y - oy - 0.12 * s; farCPU[o + 2] = z - oz; farCPU[o + 3] = s;
      farCPU[o + 4] = Math.cos(rot); farCPU[o + 5] = Math.sin(rot); farCPU[o + 6] = seed; farCPU[o + 7] = v + 0.98 * fade;
    };
    let pass = 0;
    const one = (x, y, z, h, rot, v, seed) => {
      const dx = x - px, dz = z - pz, d2 = dx * dx + dz * dz; if (d2 > R2) return;
      const d = Math.sqrt(d2);
      if (d < nearR) { if (pass === 0) cand.push([d, x, y, z, h, rot, v, seed]); return; }
      if (pass === 0) return;
      const al = dx * fx + dz * fz; if (al < -mrg || Math.abs(dx * fz - dz * fx) > al * thx + mrg) return;
      far(x, y, z, h, rot, v, seed, 1, d);
    };
    cand.length = 0;
    const ccx = Math.floor(px / CS), ccz = Math.floor(pz / CS), crad = CS * 0.71;
    for (pass = 0; pass < 2; pass++) {
      for (let i = 0; i < ring.length; i += 2) {
        const cx = ccx + ring[i], cz = ccz + ring[i + 1], mx = (cx + 0.5) * CS - px, mz = (cz + 0.5) * CS - pz, md = Math.hypot(mx, mz);
        if (pass === 0) { if (md > nearR + crad) { if (Math.hypot(ring[i], ring[i + 1]) * CS > nearR + 3 * CS) break; continue; } }
        else {
          if (md > R + crad) continue;
          const al = mx * fx + mz * fz; if (al < -mrg - crad || Math.abs(mx * fz - mz * fx) > Math.max(al, 0) * thx + mrg + crad) continue;
        }
        const c = chunk(cx, cz);
        for (let k = 0; k < c.length; k += 7) one(c[k], c[k + 1], c[k + 2], c[k + 3], c[k + 4], c[k + 5], c[k + 6]);
      }
      for (const e of T.extra) one(e[0], Course.height(e[0], e[1], 0.5), e[1], e[2], e[3] || 0, (e[4] || 0) % T.NV, 0.5);
      Course.markers(-pz - 40, -pz + R, (x, z, h, rot) => one(x, Course.height(x, z, 0.5), z, h, rot, 1, 0.37));
      if (pass === 0) {
        // nearest first; beyond the mesh budget they stay cards. Across the last few metres of mesh range the two cross-dissolve.
        cand.sort((a, b) => a[0] - b[0]);
        let nNear = 0;
        for (let i = 0; i < cand.length; i++) {
          const [d, x, y, z, h, rot, v, seed] = cand[i];
          const fade = i < T.maxNear ? smooth(nearR, T.near, d) : 0;       // 1 = all mesh
          if (fade > 0) {
            // A tree whose boughs stand between the lens and the skier, or right against the lens (where they would only be a wall across
            // the picture), is taken out: it fades quickly and evenly, stays out while it is in the way, and comes back once it is clear.
            // (Its shadow stays on the snow.) It is a decision per tree, held with some slack, so no tree hangs half-seen.
            const rx = x - px, rz = z - pz, de = d + 0.5 * Math.max(rx * fx + rz * fz - 2, 0) - 0.08 * h;
            let dl = 1e9;
            if (player) { const ax = player[0] - px, az = player[2] - pz, tt = clamp((rx * ax + rz * az) / (ax * ax + az * az || 1), 0.02, 1); dl = Math.hypot(rx - ax * tt, rz - az * tt) / h; }
            const key = x * 8191 + z; let e = veil.get(key);
            if (!e) { e = [1, false]; e[1] = dl < 0.17 || de < 4.5; e[0] = e[1] ? 0 : 1; }
            else { e[1] = e[1] ? !(dl > 0.24 && de > 5.3) : (dl < 0.17 || de < 4.5); e[0] = dt > 0 && dt < 0.1 ? clamp(e[0] + (e[1] ? -dt / 0.16 : dt / 0.35), 0, 1) : (e[1] ? 0 : 1); }
            veil2.set(key, e);
            near.push([x, y, z, h, rot, v, seed, fade, e[0]]); nNear++;
          }
          if (fade < 1) far(x, y, z, h, rot, v, seed, 1 - fade, d);
        }
        { const t = veil; veil = veil2; veil2 = t; veil2.clear(); }
        // the solid ones first in each buffer (the picture draws those, the shadow map draws all), the fading ones again in a buffer of their own
        const put = (I, e, a) => { const o = I.n++ * 8, s = e[3] / 10; I.cpu[o] = e[0] - ox; I.cpu[o + 1] = e[1] - oy - 0.12 * s; I.cpu[o + 2] = e[2] - oz; I.cpu[o + 3] = s; I.cpu[o + 4] = Math.cos(e[4]); I.cpu[o + 5] = Math.sin(e[4]); I.cpu[o + 6] = Math.min(e[6], 0.999) + 2 * Math.round(a * 255); I.cpu[o + 7] = e[7]; };
        for (const e of near) if (e[8] >= 0.999) { put(inst[e[5]], e, 1); inst[e[5]].solid++; }
        for (const e of near) if (e[8] < 0.999) { put(inst[e[5]], e, 1); if (e[8] > 0.004) put(ghost[e[5]], e, e[8]); }
        T.stats.fading = 0; T.stats.out = 0; for (const e of near) { if (e[8] <= 0.004) T.stats.out++; else if (e[8] < 0.999) T.stats.fading++; }
        near.length = 0;
        T.stats.near = nNear;
      }
    }
    for (const I of inst) if (I.n) gfx.updateBuffer(I.buf, 0, I.cpu.subarray(0, I.n * 8));
    for (const I of ghost) if (I.n) gfx.updateBuffer(I.buf, 0, I.cpu.subarray(0, I.n * 8));
    if (nFar) gfx.updateBuffer(farBuf, 0, farCPU.subarray(0, nFar * 8));
    T.stats.far = nFar;
  };
  T.draw = function (R) {
    if (!T.enabled) return;
    if (!baked) return;
    for (let v = 0; v < T.NV; v++) if (inst[v].solid) gfx.draw(pipe, { u: { p: [0, 0, 0, 0] }, tex: { tDetail: Tex.detail, tShadow: R.shadowTex, tSky: Sky.lut }, vb: [meshes[v].vb, inst[v].buf], ib: meshes[v].ib, count: meshes[v].count, instances: inst[v].solid });
    if (nFar) gfx.draw(pipeCard, { u: { p: [0, 0, 0, 0] }, tex: { tA: atlasA, tB: atlasB, tShadow: R.shadowTex, tSky: Sky.lut }, vb: [farBuf], count: 4, instances: nFar });
  };
  // the trees that are fading, over the finished view (after the sky and the clouds)
  T.drawGhost = function (R) {
    if (!T.enabled || !baked) return;
    for (let v = 0; v < T.NV; v++) if (ghost[v].n) gfx.draw(pipeGhostZ, { u: { p: [0, 0, 0, 0] }, vb: [meshes[v].vb, ghost[v].buf], ib: meshes[v].ib, count: meshes[v].count, instances: ghost[v].n });
    for (let v = 0; v < T.NV; v++) if (ghost[v].n) gfx.draw(pipeGhost, { u: { p: [0, 0, 0, 0] }, tex: { tDetail: Tex.detail, tShadow: R.shadowTex, tSky: Sky.lut }, vb: [meshes[v].vb, ghost[v].buf], ib: meshes[v].ib, count: meshes[v].count, instances: ghost[v].n });
  };
  T.drawShadow = function () {
    if (!T.enabled || !baked) return;
    for (let v = 0; v < T.NV; v++) if (inst[v].n) gfx.draw(pipeShadow, { u: { p: [0, 0, 0, 0] }, vb: [meshes[v].vb, inst[v].buf], ib: meshes[v].ib, count: meshes[v].count, instances: inst[v].n });
    if (nFar) gfx.draw(pipeCardShadow, { u: { p: [0, 0, 0, 0] }, tex: { tA: atlasA }, vb: [farBuf], count: 4, instances: nFar });
  };
  T.isBaked = () => baked;
  return T;
})();

const TREE_SSL = `
struct TreeV { wp: vec3f, n: vec3f, }
fn treeVertex(pos: vec3f, nrm: vec3f, i0: vec4f, i1: vec4f) -> TreeV {
  var t: TreeV;
  let lp: vec3f = pos * i0.w;
  t.wp = i0.xyz + vec3f(lp.x * i1.x + lp.z * i1.y, lp.y, lp.z * i1.x - lp.x * i1.y);
  t.n = vec3f(nrm.x * i1.x + nrm.z * i1.y, nrm.y, nrm.z * i1.x - nrm.x * i1.y);
  return t;
}
`;

// what the surface is at a point of a tree (snow, needles or bark, with the small-scale normals of each), and how the sun lights it.
// Shared by the meshes, by the bake of the cards, and by the cards themselves, so the three always agree.
const TREE_SURF_SSL = `
struct TreeS { snow: f32, bark: f32, ao: f32, open: f32, tone: f32, Ns: vec3f, Nn: vec3f, }
fn treeLight(s: TreeS, V: vec3f, sh: f32) -> vec3f {
  let L: vec3f = U.sunDir.xyz;
  let Nm: vec3f = normalize(mix(s.Nn, s.Ns, s.snow));
  let back: f32 = saturate(dot(-V, L)); let rim: f32 = pow(1.0 - saturate(dot(Nm, V)), 2.5);
  let sky: vec3f = U.ambSky.rgb * (0.30 + 0.70 * s.open);
  // snow on the boughs: sunlit where it faces the light, sky-blue in its own shade, glowing along its edges when the sun is behind it
  let ndlS: f32 = dot(s.Ns, L);
  let ambS: vec3f = sky * (1.0 + 0.9 * s.Ns.y) + U.ambGnd.rgb * (0.34 - 0.28 * s.Ns.y) + twiLight(s.Ns) * (0.4 + 0.6 * s.open);
  var cs: vec3f = vec3f(0.93, 0.955, 0.985) * (U.sunCol.rgb * saturate((ndlS + 0.30) / 1.30) * sh + ambS * s.ao);
  cs += U.sunCol.rgb * vec3f(1.0, 0.93, 0.85) * (back * back * rim * (0.25 + 0.75 * sh) * 0.9 + 0.10 * sh * saturate(-ndlS + 0.2) * s.open);
  // needles: nearly black green, a little light leaking through the fringe
  let ndlN: f32 = dot(s.Nn, L);
  var albN: vec3f = mix(vec3f(0.011, 0.022, 0.017), vec3f(0.028, 0.040, 0.022), s.tone);
  albN = mix(albN, vec3f(0.060, 0.047, 0.040), s.bark);
  let ambN: vec3f = sky * (0.9 + 0.7 * s.Nn.y) + U.ambGnd.rgb * (0.42 - 0.34 * s.Nn.y) + twiLight(s.Nn) * (0.4 + 0.6 * s.open);
  var cn: vec3f = albN * (U.sunCol.rgb * saturate((ndlN + 0.45) / 1.45) * sh + ambN * s.ao);
  cn += albN * U.sunCol.rgb * back * back * rim * 2.5 * sh * (1.0 - s.bark);
  return mix(cn, cs, s.snow);
}
// what the skier's headlamp adds when a tree stands in its beam
fn treeLamp(s: TreeS, wp: vec3f) -> vec3f {
  let ll: vec3f = lampLight(wp);
  if (ll.x <= 0.00002) { return vec3f(0.0); }
  let Ld: vec3f = normalize(U.lamp.xyz - wp);
  let Nm: vec3f = normalize(mix(s.Nn, s.Ns, s.snow));
  let albN: vec3f = mix(vec3f(0.020, 0.034, 0.022), vec3f(0.060, 0.047, 0.040), s.bark);
  return ll * mix(albN, vec3f(0.93, 0.955, 0.985), s.snow) * (saturate(dot(Nm, Ld) * 0.6 + 0.4) * s.ao);
}
`.replace('fn treeLight', `fn treeSurface(bp: vec3f, mat: vec4f, N: vec3f, off: f32) -> TreeS {
  var s: TreeS;
  let n1: vec4f = tex(tDetail, bp.xz * 0.23 + bp.yy * vec2f(0.17, 0.11) + off);                   // lumps
  let n2: vec4f = tex(tDetail, bp.xy * 1.9 + bp.zz * vec2f(1.3, 1.7));                             // needles, grain
  s.ao = mat.y; s.open = mat.w;
  // where the pillow ends and the needles begin: a ragged line, with a dusting of snow further down wherever the bough still sees sky
  let snow: f32 = smoothstep(-0.018, 0.018, mat.x + (n1.z - 0.5) * 0.05 + (n2.z - 0.5) * 0.03);
  let dust: f32 = smoothstep(0.25, 0.85, N.y) * smoothstep(0.42, 0.62, n2.z * 0.6 + n1.z * 0.4 + 0.25 * s.open) * (0.35 + 0.65 * s.open);
  // and whatever faces up under open sky is buried, whatever the bough beneath it is doing: a winter of snowfall has seen to that
  let top: f32 = smoothstep(0.22, 0.50, N.y + (n1.z - 0.5) * 0.25) * smoothstep(0.30, 0.55, s.open + (n2.z - 0.5) * 0.2);
  s.snow = max(max(snow, dust * 0.85), top);
  s.bark = smoothstep(0.17, 0.10, mat.z) * (1.0 - s.snow);
  // needles are a thousand small facets, snow a soft crust
  s.Nn = normalize(N + (vec3f(n2.x, n2.y, n2.w) - 0.5) * 1.1);
  s.Ns = normalize(N + vec3f(n1.x - 0.5, 0.0, n1.y - 0.5) * 0.5 + (vec3f(n2.x, n2.y, n2.w) - 0.5) * 0.12);
  s.tone = n1.w * 0.6 + 0.2 * s.open;
  return s;
}
fn treeLight`);
// the cards have no tDetail: they read the baked result instead
const TREE_SURF_CARD_SSL = TREE_SURF_SSL.slice(0, TREE_SURF_SSL.indexOf('fn treeSurface')) + TREE_SURF_SSL.slice(TREE_SURF_SSL.indexOf('fn treeLight'));

const TREE_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let toC: vec3f = U.camPos.xyz - v.wp; let dist: f32 = length(toC); let V: vec3f = toC / dist;
  // a bough about to brush the lens thins out and is gone. (It is never left as a sprinkle of dark specks over the picture: below a third
  // of its pixels it is dropped altogether.)
  let kd: f32 = smoothstep(0.8, 1.7, dist);
  let keep: f32 = min(v.ex.y, kd);
  if (kd < 0.34 || (keep < 0.999 && ignT(v.clip.xy) >= keep)) { discard; }
  // a bough thinner than the mesh can carry a normal meant for its other face: the triangle itself knows which way it looks
  let N0: vec3f = normalize(v.nrm);
  var Ng: vec3f = normalize(cross(dpdx(v.wp), dpdy(v.wp))); if (dot(Ng, V) < 0.0) { Ng = -Ng; }
  let N: vec3f = normalize(mix(Ng, N0, smoothstep(-0.1, 0.4, dot(N0, Ng))));
  let s: TreeS = treeSurface(v.bp, v.mat, N, v.ex.x);
  let sh: f32 = shadowAt(v.wp + N * (0.10 + 0.004 * dist), 0.0018);
  var col: vec3f = treeLight(s, V, sh);
  col += treeLamp(s, v.wp);
  col = applyFog(col, v.wp);
  GHOST_OUT
  return o;
}
`;

const TREE_CARD_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let g: f32 = ignT(v.clip.xy);
  // two neighbouring photographs dissolve into each other as the viewer walks round the tree
  let k: f32 = select(v.vw.x, v.vw.y, g < smoothstep(0.42, 0.58, v.vw.z));
  let uv: vec2f = vec2f((k + v.uv.x) / NKF, (v.vw.w + v.uv.y) / NVF);
  let a: vec4f = texLod(tA, uv, v.ex.w);
  let toC: vec3f = U.camPos.xyz - v.wp; let dist: f32 = length(toC); let V: vec3f = toC / dist;
  let kd: f32 = smoothstep(1.5, 5.0, dist);
  if (a.a < 0.44 - 0.055 * min(v.ex.w, 4.0) || (v.ex.z < 0.999 && g < 1.0 - v.ex.z) || g > kd || kd < 0.34) { discard; }
  let b: vec4f = texLod(tB, uv, v.ex.w);
  // normal: out of the photograph's frame, into the tree's, into the world
  let ph: f32 = k * KSTEP; let cp: f32 = cos(ph); let sp: f32 = sin(ph);
  let x: vec3f = vec3f(cp, 0.0, -sp); let z: vec3f = vec3f(sp * PITCH_C, PITCH_S, cp * PITCH_C); let y: vec3f = cross(z, x);
  let nv: vec3f = a.xyz * 2.0 - 1.0;
  let nl: vec3f = normalize(x * nv.x + y * nv.y + z * nv.z);
  let N: vec3f = vec3f(nl.x * v.ex.x + nl.z * v.ex.y, nl.y, nl.z * v.ex.x - nl.x * v.ex.y);
  var s: TreeS; s.snow = b.x; s.ao = b.y; s.open = b.z; s.bark = b.w; s.tone = 0.4; s.Ns = N; s.Nn = N;
  // the card stands in the tree's own flat shadow: ask for the light a little way toward the sun instead
  let sh: f32 = shadowAt(v.wp + U.sunDir.xyz * 3.2 + N * 0.3, 0.002);
  var col: vec3f = treeLight(s, V, sh);
  col += treeLamp(s, v.wp);
  col = applyFog(col, v.wp);
  o.color = vec4f(col, 1.0);
  return o;
}
`;
