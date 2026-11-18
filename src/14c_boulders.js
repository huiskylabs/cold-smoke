// ---------------------------------------------------------------- boulders: stones on the run (Variants 'boulder' b)
// The richer mountain lays boulders out on the run and along its edges (03_course.js). In 'a' they are a swell of the ground itself, which
// can bare rock only where the mesh is steep, and from a few metres off they read as mounds of snow. In 'b' each is a stone: a mesh made once
// at load (a weathered block of granite, its faces cut flat here and there, rounded at the edges), standing in a low drift the ground carries,
// dark wherever it is too steep to hold snow, with a pillow of old snow on its top and on its gentler shoulders. As the photographs show it
// (refs: a boulder after a snowfall in the Wasatch, granite erratics in a field after snow): the stone is near black against the snow, the cap is
// thick and rounded and hangs a little over the edge, and snow banks up round the foot.
// Drawn with the trees (same sun, same shadow map), and cast into the shadow map: a stone with no shadow floats.
const Boulders = (() => {
  const B = { far: 320, band: 60, stats: { n: 0, tris: 0 } };
  const NS = 3, MAXI = 256;        // shapes; instances at once
  let gfx, shapes = [], inst, cpu, pipe, pipeSh, counts = new Array(NS).fill(0), live = false;
  const on = () => typeof Course !== 'undefined' && Course.boulder && Course.rich;

  // one stone, about 2 m across and a metre and a half from its buried foot to its top (the instance scales it): a rounded block, cut by a few
  // planes (the faces it split along), its surface pitted at two sizes
  function shape(k) {
    const r = RNG(9133 + k * 7919), cuts = [];
    for (let i = 0; i < 5; i++) {
      const th = r() * TAU, el = (r() - 0.25) * 1.1, n = [Math.cos(th) * Math.cos(el), Math.sin(el), Math.sin(th) * Math.cos(el)];
      cuts.push([n[0], n[1], n[2], 0.62 + r() * 0.25]);
    }
    const hx = 0.78 + 0.2 * r(), hy = 0.62 + 0.15 * r(), hz = 0.7 + 0.2 * r(), lean = (r() - 0.5) * 0.3;
    const f = (x, y, z) => {
      const yy = y - 0.25, xx = x - lean * yy;
      let d = sd.smin(sd.rbox(xx, yy, z, 0, 0, 0, hx, hy, hz, 0.34), sd.ellipsoid(xx, yy, z, 0, 0.05, 0, hx * 1.05, hy * 1.05, hz * 1.05), 0.2);
      for (const c of cuts) d = sd.smax(d, xx * c[0] + yy * c[1] + z * c[2] - c[3], 0.12);
      d += 0.0225 * vnoise3(x * 2.3, y * 2.3, z * 2.3, 11 + k) + 0.009 * vnoise3(x * 7.1, y * 7.1, z * 7.1, 31 + k);
      return d;
    };
    // attributes: how open to the sky the surface is (cracks and the hollows under an overhang are dark), and a slow tone for the stone
    const attr = (x, y, z, nx, ny, nz, out) => {
      const a1 = 0.06, a2 = 0.2;
      out[0] = sat(0.25 + 0.75 * (0.5 * sat(f(x + nx * a1, y + ny * a1, z + nz * a1) / a1) + 0.5 * sat(f(x + nx * a2, y + ny * a2, z + nz * a2) / a2)));
      out[1] = 0.5 + 0.5 * vnoise3(x * 3.7 + 5, y * 3.7, z * 3.7, 7 + k); out[2] = 0.5 + 0.5 * vnoise3(x * 1.3, y * 1.3, z * 1.3 + 9, 3 + k); out[3] = 0;
    };
    return meshSDF(f, [-1.25, -0.75, -1.2], [1.25, 1.2, 1.2], 0.04, { stride: 4, attr });
  }

  B.init = function (g) {
    gfx = g;
    for (let k = 0; k < NS; k++) { const m = shape(k); shapes.push({ vb: gfx.buffer(m.verts.subarray(0, m.nv * 10), 'vertex'), ib: gfx.buffer(m.idx, 'index'), n: m.idx.length }); B.stats.tris += m.idx.length / 3; }
    cpu = new Float32Array(MAXI * 12); inst = [];
    for (let k = 0; k < NS; k++) inst.push(gfx.buffer(new Float32Array(MAXI * 12), 'vertex', true));
    const bufs = [{ attrs: [['pos', 'vec3f'], ['nrm', 'vec3f'], ['pm', 'vec4f']] }, { instanced: true, attrs: [['j0', 'vec4f'], ['j1', 'vec4f'], ['j2', 'vec4f']] }];
    pipe = gfx.pipeline({
      name: 'boulder', lib: [SL.common, SL.hash, SL.fog, SL.shadow, SL.tonemap, BOULDER_SSL], buffers: bufs, cull: 'none',
      varyings: { wp: 'vec3f', nrm: 'vec3f', pm: 'vec4f', ex: 'vec4f' }, uniforms: { p: 'vec4f' }, textures: { tDetail: '2d', tShadow: 'shadow', tSky: '2d' },
      vs: `fn vert(a: VIn) -> VOut { var v: VOut; let b: BV = boulderVertex(a.pos, a.nrm, a.pm, a.j0, a.j1, a.j2);
        v.wp = b.wp; v.nrm = b.n; v.pm = a.pm; v.ex = vec4f(b.snow, a.j2.z, a.j2.w, a.j1.w); v.clip = U.viewProj * vec4f(b.wp, 1.0); return v; }`,
      fs: BOULDER_FS,
    });
    pipeSh = gfx.pipeline({
      name: 'boulderShadow', lib: [SL.common, BOULDER_SSL], buffers: bufs, varyings: {}, uniforms: { p: 'vec4f' }, textures: {}, colorFormat: null, cull: 'none', depthBias: 2, depthBiasSlope: 2.5,
      vs: `fn vert(a: VIn) -> VOut { var v: VOut; let b: BV = boulderVertex(a.pos, a.nrm, a.pm, a.j0, a.j1, a.j2); v.clip = U.shadowVP * vec4f(b.wp, 1.0); return v; }`, fs: null,
    });
    B.pipes = [pipe, pipeSh];
  };

  // every frame: the stones near the lens, by shape (render space = world - origin)
  B.update = function (cam, origin) {
    counts.fill(0); live = false; B.stats.n = 0;
    if (!gfx || !on()) return;
    const px = cam.pos[0], pz = cam.pos[2], cs = -pz, ox = origin[0], oy = origin[1], oz = origin[2];
    const lists = [[], [], []];
    Course.boulders(cs - 120, cs + B.far, (f, x, z) => {
      const d = Math.hypot(x - px, z - pz); if (d > B.far) return;
      if (f.bk === undefined) {
        // (made once per stone: its shape, which way it lies, its proportions, how much snow it kept)
        const h = hashU(Math.round(f.cs * 10) * 7 + Math.round(f.u * 10) * 131 + 17);
        f.bk = h % NS; f.byaw = (h >>> 4 & 1023) / 1024 * TAU; f.bst = (h >>> 14 & 255) / 255; f.bsn = (h >>> 22 & 255) / 255;
      }
      const drift = Course.boulderDrift(f), g = Course.height(x, z, 0.5) - drift;    // (the ground under the drift)
      const sxz = f.rad * 0.78 / 1.0, sy = (f.h + 0.12) / 1.2 * 1.25;
      const cap = 0.10 + 0.16 * f.bsn;                                          // thickness of the cap of old snow (m)
      const k = smooth(B.far, B.far - B.band, d);
      if (k <= 0) return;
      lists[f.bk].push([x - ox, g - 0.05 - oy, z - oz, f.byaw, sxz * (0.92 + 0.16 * f.bst), sy * k, sxz * (1.08 - 0.16 * f.bst), f.bst, cap, 0.35 + 0.55 * f.bsn, f.bst, k]);
    });
    for (let s = 0; s < NS; s++) {
      const L = lists[s]; let n = Math.min(L.length, MAXI); if (!n) continue;
      for (let i = 0; i < n; i++) cpu.set(L[i], i * 12);
      gfx.updateBuffer(inst[s], 0, cpu.subarray(0, n * 12)); counts[s] = n; live = true; B.stats.n += n;
    }
  };
  B.draw = function (R) {
    if (!live) return;
    for (let s = 0; s < NS; s++) if (counts[s]) gfx.draw(pipe, { u: { p: [0, 0, 0, 0] }, tex: { tDetail: Tex.detail, tShadow: R.shadowTex, tSky: Sky.lut }, vb: [shapes[s].vb, inst[s]], ib: shapes[s].ib, count: shapes[s].n, instances: counts[s] });
  };
  B.drawShadow = function () {
    if (!live) return;
    for (let s = 0; s < NS; s++) if (counts[s]) gfx.draw(pipeSh, { u: { p: [0, 0, 0, 0] }, vb: [shapes[s].vb, inst[s]], ib: shapes[s].ib, count: shapes[s].n, instances: counts[s] });
  };
  return B;
})();

// j0: foot (render space), yaw; j1: scale x, y, z, tone; j2: cap thickness (m), how far down the snow reaches (0..1), tone, fade
const BOULDER_SSL = `
struct BV { wp: vec3f, n: vec3f, snow: f32, }
// where snow lies on the stone: on what faces the sky, the more so where the stone kept more of it, broken up by the stone's own pitting
fn boulderSnow(ny: f32, pm: vec4f, amt: f32) -> f32 {
  let lo: f32 = mix(0.78, 0.38, amt);
  return smoothstep(lo, lo + 0.16, ny + (pm.y - 0.5) * 0.45 + (pm.z - 0.5) * 0.3);
}
fn boulderVertex(pos: vec3f, nrm: vec3f, pm: vec4f, j0: vec4f, j1: vec4f, j2: vec4f) -> BV {
  var o: BV;
  let c: f32 = cos(j0.w); let s: f32 = sin(j0.w);
  let p: vec3f = vec3f(pos.x * c - pos.z * s, pos.y, pos.x * s + pos.z * c) * j1.xyz;
  let n: vec3f = normalize(vec3f(nrm.x * c - nrm.z * s, nrm.y, nrm.x * s + nrm.z * c) / j1.xyz);
  let sn: f32 = boulderSnow(n.y, pm, j2.y);
  // (the cap is a pillow: thickest in its middle, where the face is level, thinning to nothing at its rim; it is pushed out along the
  // face and up, so it overhangs the edge a little)
  let t: f32 = j2.x * sn * (0.55 + 0.45 * smoothstep(0.7, 1.0, n.y)) * (0.75 + 0.5 * pm.y);
  o.wp = j0.xyz + p + (n * 0.35 + vec3f(0.0, 0.65, 0.0)) * t;
  o.n = n; o.snow = sn;
  return o;
}
`;

const BOULDER_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let toC: vec3f = U.camPos.xyz - v.wp; let dist: f32 = length(toC); let V: vec3f = toC / dist;
  let L: vec3f = U.sunDir.xyz;
  var N: vec3f = normalize(v.nrm);
  let wxz: vec2f = v.wp.xz + U.origin.xz;
  let sh: f32 = shadowAt(v.wp + N * 0.04, 0.0016);
  let ao: f32 = v.pm.x;
  // fine detail of the stone: grains of feldspar and dark mica a few millimetres across, read as a speckle, and a mottle a hand across
  let d1: vec4f = tex(tDetail, wxz * 1.9 + v.wp.yy * 1.7);
  let d2: vec4f = tex(tDetail, wxz * 0.37 + v.wp.yy * 0.41 + vec2f(0.31, 0.77));
  let sn: f32 = saturate(smoothstep(0.25, 0.75, v.ex.x + (d1.z - 0.5) * 0.35));
  // --- the stone: dark weathered granite (photographs of granite boulders in snow: about 0.10-0.20 against snow's 0.9), a little warmer
  // or colder from one stone to the next, darker in its cracks, a faint green-grey of lichen on its shoulders
  let tone: f32 = v.ex.y;
  var alb: vec3f = mix(vec3f(0.115, 0.112, 0.118), vec3f(0.20, 0.185, 0.17), saturate(v.pm.z * 0.8 + (d2.z - 0.5) * 0.9 + tone * 0.3));
  alb *= 0.75 + 0.5 * d1.x;
  alb = mix(alb, vec3f(0.17, 0.18, 0.15), smoothstep(0.62, 0.8, d2.x) * smoothstep(0.2, 0.6, N.y) * 0.6);
  alb *= 0.55 + 0.45 * ao;
  // (just below the snow the stone is wet from the cap melting in the sun: darker still)
  alb *= 1.0 - 0.35 * smoothstep(0.0, 0.25, v.ex.x) * (1.0 - sn);
  let Nr: vec3f = normalize(N + (vec3f(d1.x, d1.y, d1.w) - vec3f(0.5)) * 0.35);
  let ndl: f32 = dot(Nr, L);
  let amb: vec3f = U.ambSky.rgb * (0.55 + 0.45 * Nr.y) + U.ambGnd.rgb * (0.5 - 0.5 * Nr.y) * 1.6 + twiLight(Nr);
  let Hh: vec3f = normalize(V + L);
  var rock: vec3f = alb * (U.sunCol.rgb * (saturate(ndl) * sh) + amb * (0.4 + 0.6 * ao));
  rock += U.sunCol.rgb * (sh * 0.04 * pow(max(dot(Nr, Hh), 0.0), 24.0) * saturate(ndl * 4.0));
  // --- the cap: snow lit as the terrain lights its own (gateSnow's terms), its surface rounded up toward the sky
  let Ns: vec3f = normalize(N + vec3f(0.0, 0.9, 0.0) + (vec3f(d2.x, 0.5, d2.y) - vec3f(0.5)) * 0.3);
  let ndls: f32 = dot(Ns, L);
  let ambs: vec3f = U.ambSky.rgb * (1.3 + 0.8 * Ns.y) + U.ambGnd.rgb * (0.50 - 0.45 * Ns.y) + twiLight(Ns);
  let snow: vec3f = vec3f(0.93, 0.955, 0.985) * (U.sunCol.rgb * (saturate((ndls + 0.12) / 1.12) * sh) + ambs * (0.7 + 0.3 * ao));
  var col: vec3f = mix(rock, snow, sn);
  col = applyFog(col, v.wp);
  o.color = vec4f(col, 1.0);
  return o;
}
`;
