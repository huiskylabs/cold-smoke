// ---------------------------------------------------------------- clouds: a few fair-weather cumulus hanging in the blue
// Each cloud is a real volume (a cluster of blobs with a flat base, eaten into cauliflower by cellular noise) and is lit properly:
// a march toward the sun for self-shadowing, a multiple-scattering approximation for the soft inner glow, and a strongly forward
// phase function so the edges blaze when the sun is behind them. That march is far too expensive per frame on a phone, so it runs
// once per cloud into an atlas tile, as seen from the mountain; the frame then only draws six quads. The tile stores three scalars
// (light from the sun, from the sky above, from the snow and cloud below) so the colours follow the time of day for free.
const Clouds = (() => {
  const C = { res: 384, enabled: true, ksun: 7.5, ksky: 1.35, kgnd: 0.95, drift: 0.0011, baked: false, time: 0, list: [
    { az: -0.62, el: 0.100, w: 0.40, asp: 0.52, seed: 1, haze: 0.34 },
    { az: 0.38, el: 0.125, w: 0.30, asp: 0.66, seed: 2, haze: 0.28 },
    { az: -0.04, el: 0.175, w: 0.15, asp: 0.50, seed: 3, haze: 0.18 },
    { az: 0.88, el: 0.170, w: 0.24, asp: 0.55, seed: 4, haze: 0.22 },
    { az: -1.10, el: 0.160, w: 0.26, asp: 0.50, seed: 5, haze: 0.22 },
    { az: 0.10, el: 0.055, w: 0.17, asp: 0.42, seed: 6, haze: 0.50 },
  ] };
  const COLS = 3, ROWS = 2;
  let gfx, volTex, volT, atlas, atlasT, pipeVol, pipeBake, pipeDraw;

  C.init = function (g, res) {
    gfx = g; if (res) C.res = res;
    volTex = gfx.texture({ w: 512, h: 512, format: 'rgba8', filter: 'linear', wrap: 'clamp' }); volT = gfx.target({ color: volTex }); Tex.vol = volTex;
    atlas = gfx.texture({ w: C.res * COLS, h: C.res * ROWS, format: 'rgba16f', filter: 'linear', wrap: 'clamp' }); atlasT = gfx.target({ color: atlas }); C.atlas = atlas;
    pipeVol = gfx.pipeline({ name: 'cloudVol', lib: [SL.common, SL.hash], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f' }, textures: {}, colorFormat: 'rgba8', depth: false, depthTest: false, cull: 'none', vs: VS_FULLSCREEN, fs: CLOUD_VOLNOISE_FS });
    pipeBake = gfx.pipeline({ name: 'cloudBake', lib: [SL.common, SL.hash, SL.tonemap, CLOUD_VOL_SSL, CLOUD_SHAPE_SSL], topology: 'strip', buffers: [], varyings: { uv: 'vec2f' }, uniforms: { r: 'vec4f', t: 'vec4f', a: 'vec4f', l: 'vec4f' },
      textures: { tVol: '2d' }, colorFormat: 'rgba16f', depth: false, depthTest: false, cull: 'none', vs: CLOUD_RECT_VS, fs: CLOUD_BAKE_FS });
    pipeDraw = gfx.pipeline({ name: 'cloudDraw', lib: [SL.common, SL.fog], topology: 'strip', buffers: [], varyings: { uv: 'vec2f', dir: 'vec3f' }, uniforms: { a: 'vec4f', t: 'vec4f', k: 'vec4f', f: 'vec4f', s: 'vec4f' },
      textures: { tCloud: '2d', tSky: '2d' }, depthFunc: 'lequal', depthWrite: false, cull: 'none', blend: 'premul', vs: CLOUD_DRAW_VS, fs: CLOUD_DRAW_FS });
    C.pipes = [pipeVol, pipeBake, pipeDraw];
  };
  const azOf = c => { const a = c.az + C.drift * C.time; return ((a + 1.45) % 2.9 + 2.9) % 2.9 - 1.45; };      // clouds drift round and come back in behind you
  const basis = (az, el) => { const ce = Math.cos(el), f = [Math.sin(az) * ce, Math.sin(el), -Math.cos(az) * ce], r = v3.norm(v3.cross(f, [0, 1, 0])), u = v3.cross(r, f); return { f, r, u }; };
  const rect = i => { const tx = i % COLS, ty = Math.floor(i / COLS); return [tx / COLS, ty / ROWS, (tx + 1) / COLS, (ty + 1) / ROWS]; };
  // light one cloud (or a horizontal strip of its tile, v0..v1) for where it hangs right now
  C.bakeTile = function (i, v0, v1) {
    const c = C.list[i], b = basis(azOf(c), c.el), L = Sky.sunDir(), q = rect(i);
    gfx.draw(pipeBake, { u: { r: [q[0], lerp(q[1], q[3], v0), q[2], lerp(q[1], q[3], v1)], t: [0, v0, 1, v1], a: [c.seed, c.asp, Math.tan(c.w / 2), C.debug || 0], l: [v3.dot(L, b.r), v3.dot(L, b.u), v3.dot(L, b.f), 0] }, tex: { tVol: volTex }, count: 4 });
  };
  // The light moves (the sun sinks, the moon takes over, the clouds drift round): whenever a tile has fallen behind it is relit,
  // a few rows a frame, one tile after another
  let curI = 0, curRow = 0, curRows = 6;
  C.update = function () {
    if (!C.baked) {
      gfx.beginPass(volT, { color: [0, 0, 0, 0] }); gfx.draw(pipeVol, { u: { p: [0, 0, 0, 0] }, tex: {}, count: 3 }); gfx.endPass();
      gfx.beginPass(atlasT, { color: [0, 0, 0, 0] }); for (let i = 0; i < C.list.length; i++) { const c = C.list[i]; C.bakeTile(i, 0, 1); c.bakedEl = Sky.elev; c.bakedAz = azOf(c); } gfx.endPass();
      C.baked = true; return;
    }
    if (C.relight === false) return;
    const c = C.list[curI];
    if (curRow === 0) {
      const dEl = Math.abs(c.bakedEl - Sky.elev), dAz = Math.abs(c.bakedAz - azOf(c));
      if (dEl < 0.008 && dAz < 0.03) { curI = (curI + 1) % C.list.length; return; }
      c.bakedEl = Sky.elev; c.bakedAz = azOf(c); curRows = dEl > 0.08 ? 16 : 6;          // a change of light (sun to moon) is caught up with quickly
    }
    const r1 = Math.min(C.res, curRow + curRows);
    gfx.beginPass(atlasT, {}); C.bakeTile(curI, curRow / C.res, r1 / C.res); gfx.endPass();
    curRow = r1; if (r1 >= C.res) { curRow = 0; curI = (curI + 1) % C.list.length; }
  };
  C.draw = function (R) {
    if (!C.enabled || !C.baked) return;
    C.time = R.time || 0;
    for (let i = 0; i < C.list.length; i++) {
      const c = C.list[i], az = azOf(c), q = rect(i), fade = smooth(1.45, 1.2, Math.abs(az));
      gfx.draw(pipeDraw, { u: { a: [az, c.el, Math.tan(c.w / 2), c.asp], t: [q[0], q[1], q[2] - q[0], q[3] - q[1]], k: [C.ksun, C.ksky, C.kgnd, c.haze], f: [fade, 0, 0, 0], s: [Sky.sunFar[0], Sky.sunFar[1], Sky.sunFar[2], 0] }, tex: { tCloud: atlas, tSky: Sky.lut }, count: 4 });
    }
  };
  return C;
})();

// ---- a 64^3 tiling noise volume packed as 8x8 slices: R billows (inverted cellular, 3 octaves), G soft value noise, B finer billows, A low value noise
const CLOUD_VOLNOISE_FS = `
fn cvHash(c: vec3f, f: f32, sd: f32) -> vec3f { let w: vec3f = c - f * floor(c / f); return hash33(w + vec3f(sd * 17.0, sd * 31.0 + 5.0, sd * 47.0 + 11.0)); }
fn worleyP(p: vec3f, f: f32, sd: f32) -> f32 {
  let q: vec3f = p * f; let i: vec3f = floor(q); let fr: vec3f = q - i; var d: f32 = 9.0;
  for (var z: i32 = -1; z <= 1; z++) { for (var y: i32 = -1; y <= 1; y++) { for (var x: i32 = -1; x <= 1; x++) {
    let c: vec3f = vec3f(f32(x), f32(y), f32(z));
    let r: vec3f = c + cvHash(i + c, f, sd) - fr; d = min(d, dot(r, r));
  } } }
  return min(sqrt(d), 1.0);
}
fn valueP(p: vec3f, f: f32, sd: f32) -> f32 {
  let q: vec3f = p * f; let i: vec3f = floor(q); let fr: vec3f = q - i; let u: vec3f = fr * fr * (3.0 - 2.0 * fr);
  let a: f32 = mix(mix(cvHash(i, f, sd).x, cvHash(i + vec3f(1.0, 0.0, 0.0), f, sd).x, u.x), mix(cvHash(i + vec3f(0.0, 1.0, 0.0), f, sd).x, cvHash(i + vec3f(1.0, 1.0, 0.0), f, sd).x, u.x), u.y);
  let b: f32 = mix(mix(cvHash(i + vec3f(0.0, 0.0, 1.0), f, sd).x, cvHash(i + vec3f(1.0, 0.0, 1.0), f, sd).x, u.x), mix(cvHash(i + vec3f(0.0, 1.0, 1.0), f, sd).x, cvHash(i + vec3f(1.0, 1.0, 1.0), f, sd).x, u.x), u.y);
  return mix(a, b, u.z);
}
fn frag(v: VOut) -> FOut { var o: FOut;
  let px: vec2f = v.uv * 512.0; let tile: vec2f = floor(px / 64.0);
  let p: vec3f = vec3f(fract(px / 64.0), (tile.y * 8.0 + tile.x + 0.5) / 64.0);
  let w1: f32 = 1.0 - worleyP(p, 3.0, 1.0); let w2: f32 = 1.0 - worleyP(p, 6.0, 2.0); let w3: f32 = 1.0 - worleyP(p, 12.0, 3.0); let w4: f32 = 1.0 - worleyP(p, 20.0, 7.0);
  let v1: f32 = valueP(p, 4.0, 4.0); let v2: f32 = valueP(p, 8.0, 5.0); let v3: f32 = valueP(p, 16.0, 6.0);
  o.color = vec4f(w1 * 0.55 + w2 * 0.30 + w3 * 0.15, v1 * 0.55 + v2 * 0.30 + v3 * 0.15, w2 * 0.50 + w3 * 0.30 + w4 * 0.20, v1); return o; }
`;
const CLOUD_VOL_SSL = `
fn volT(z: f32) -> vec2f { let zz: f32 = z - 64.0 * floor(z / 64.0); let ty: f32 = floor(zz / 8.0); return vec2f(zz - ty * 8.0, ty) * 64.0; }
fn vol(p: vec3f) -> vec4f {
  let q: vec3f = fract(p) * 64.0;
  let zf: f32 = q.z - 0.5; let z0: f32 = floor(zf); let fz: f32 = zf - z0;
  let xy: vec2f = clamp(q.xy, vec2f(0.5), vec2f(63.5));
  return mix(texLod(tVol, (volT(z0) + xy) / 512.0, 0.0), texLod(tVol, (volT(z0 + 1.0) + xy) / 512.0, 0.0), fz);
}
`;
// ---- the shape of a cumulus, in its own box: x across (-1..1), y up (-A..A), z along the line of sight
const CLOUD_SHAPE_SSL = `
fn cloudField(p0: vec3f, sd: f32, A: f32) -> f32 {
  var s: f32 = 0.0; let yb: f32 = -A * 0.62;
  // push the lumps out of round before anything else (no warp at the base, which stays level)
  let wv: vec4f = vol(p0 * 0.55 + vec3f(sd * 0.71, sd * 0.23, sd * 0.47));
  let p: vec3f = p0 + (vec3f(wv.g, wv.a, wv.r) - 0.5) * vec3f(0.30, 0.22, 0.30) * smoothstep(0.0, 0.2, p0.y - yb);
  for (var k: i32 = 0; k < 9; k++) {
    let h: vec3f = hash33(vec3f(f32(k), sd, 3.0)); let h2: vec3f = hash33(vec3f(f32(k), sd, 11.0));
    // six lumps in a row along the base, three turrets riding on top of them
    var cx: f32 = (f32(k) / 5.0 - 0.5) * 1.08 + (h.x - 0.5) * 0.18;
    var r: f32 = (0.27 + 0.21 * h.y) * (0.55 + 0.6 * (1.0 - sq(cx / 0.86)));
    var cy: f32 = yb + r * (0.30 + 0.55 * h.z);
    if (k >= 6) { cx = (h.x - 0.5) * 0.70; r = 0.20 + 0.14 * h.y; cy = yb + (0.55 + 0.45 * h.z) * A * 0.95; }
    r = min(r, A * 0.80); cy = min(cy, A * 0.94 - r);
    let q: vec3f = (p - vec3f(cx, cy, (h2.x - 0.5) * 0.5)) / r;
    let m: f32 = saturate(1.0 - length(q)); let m2: f32 = m * m; s += m2 * m2;
  }
  // a flat base where the air reaches its dew point
  return sqrt(sqrt(s)) * smoothstep(yb, yb + 0.06, p0.y);
}
// the lumps are eaten into cauliflower: creases of the cellular noise cut deep where the cloud is thin, hardly at all in its heart
fn cloudDens(p: vec3f, m: f32, sd: f32, fine: f32, A: f32) -> f32 {
  let o: vec3f = vec3f(sd * 0.37, sd * 0.61, sd * 0.13);
  let lift: f32 = mix(0.35, 1.0, smoothstep(0.0, 0.26, p.y + A * 0.62));        // the base stays flat and whole; the tops boil
  var d: f32 = m - (1.0 - vol(p * 1.25 + o).r) * 0.95 * (1.0 - 0.5 * m) * lift;
  if (fine > 0.5 && d > -0.3) { d -= (1.0 - vol(p * 3.9 + o.zxy).b) * 0.40 * (1.0 - m) * lift; }
  return saturate(d * 5.5);
}
`;
const CLOUD_RECT_VS = `
fn vert(a: VIn) -> VOut { var v: VOut;
  let c: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u));
  let p: vec2f = mix(M.r.xy, M.r.zw, c);
  v.clip = vec4f(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
  v.uv = mix(M.t.xy, M.t.zw, c);
  return v; }`;
const CLOUD_BAKE_FS = `
const CL_SIGMA: f32 = 22.0;
fn cloudPhase(c: f32, g: f32) -> f32 { return mix(hg(c, -0.25), hg(c, g), 0.75); }
fn frag(v: VOut) -> FOut { var o: FOut;
  let sd: f32 = M.a.x; let A: f32 = M.a.y;
  let X: f32 = (v.uv.x * 2.0 - 1.0) * 1.0; let Y: f32 = (1.0 - v.uv.y * 2.0) * A;
  let Ls: vec3f = M.l.xyz;
  // angle between the sun and this line of sight (the tile spans several degrees, and the silver lining is all about that angle)
  let c: f32 = dot(Ls, normalize(vec3f(X * M.a.z, Y * M.a.z, 1.0)));
  let ph0: f32 = cloudPhase(c, 0.80); let ph1: f32 = cloudPhase(c, 0.40); let ph2: f32 = cloudPhase(c, 0.20);
  let D: f32 = 0.85; let ds: f32 = 2.0 * D / 80.0;
  let jit: f32 = ign(v.clip.xy);
  var T: f32 = 1.0; var S: vec3f = vec3f(0.0);
  for (var i: i32 = 0; i < 80; i++) {
    let p: vec3f = vec3f(X, Y, -D + (f32(i) + jit) * ds);
    let sh: f32 = cloudField(p, sd, A);
    if (sh > 0.0) {
      let dn: f32 = cloudDens(p, sh, sd, 1.0, A);
      if (dn > 0.002) {
        // how much cloud lies between here and the sun
        var tl: f32 = 0.0; var st: f32 = 0.032; var pl: vec3f = p;
        for (var j: i32 = 0; j < 6; j++) {
          pl += Ls * (st * 0.5); let s2: f32 = cloudField(pl, sd, A);
          if (s2 > 0.0) { tl += cloudDens(pl, s2, sd, 0.0, A) * st; }
          pl += Ls * (st * 0.5); st *= 1.6;
        }
        let tau: f32 = tl * CL_SIGMA;
        // the first bounce keeps its direction; later bounces forget it and reach deeper
        // ...and what has bounced so often that it has no direction left still gets through, a great deal of it: the heart of a cloud between
        // the eye and the sun is a soft grey-white, not dark
        let lsun: f32 = ph0 * exp(-tau) + 0.5 * ph1 * exp(-0.5 * tau) + 0.25 * ph2 * exp(-0.25 * tau) + 0.040 / (1.0 + 0.11 * tau);
        let hN: f32 = saturate((p.y + A * 0.62) / (A * 1.5));
        let asky: f32 = 0.30 + 0.70 * hN * hN;
        let agnd: f32 = 0.15 + 0.85 * sq(1.0 - hN);
        let dT: f32 = exp(-dn * CL_SIGMA * ds);
        S += (T * (1.0 - dT)) * vec3f(lsun, asky, agnd);
        T *= dT;
        if (T < 0.01) { break; }
      }
    }
  }
  o.color = vec4f(S, 1.0 - T);
  if (M.a.w > 0.5) { let nn: vec4f = vol(vec3f(X, Y, 0.1) * 1.25); o.color = vec4f(nn.r * 0.2, nn.b * 0.2, nn.g * 0.2, 1.0); }
  return o; }
`;
const CLOUD_DRAW_VS = `
fn vert(a: VIn) -> VOut { var v: VOut;
  let c: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u));
  let ce: f32 = cos(M.a.y); let f: vec3f = vec3f(sin(M.a.x) * ce, sin(M.a.y), -cos(M.a.x) * ce);
  let r: vec3f = normalize(cross(f, vec3f(0.0, 1.0, 0.0))); let u: vec3f = cross(r, f);
  let d: vec3f = f + r * ((c.x * 2.0 - 1.0) * M.a.z) + u * ((c.y * 2.0 - 1.0) * M.a.z * M.a.w);
  let cp: vec4f = U.viewProj * vec4f(U.camPos.xyz + d * 2000.0, 1.0);
  v.clip = vec4f(cp.xy, cp.w, cp.w);
  v.uv = vec2f(c.x, 1.0 - c.y); v.dir = d;
  return v; }`;
const CLOUD_DRAW_FS = `
fn frag(v: VOut) -> FOut { var o: FOut;
  let t: vec4f = texLod(tCloud, M.t.xy + clamp(v.uv, vec2f(0.004), vec2f(0.996)) * M.t.zw, 0.0);
  if (t.a < 0.003) { discard; }
  // (they hang higher than the mountain and keep the sun a little longer: M.s)
  // (what comes up from below is as much the blue shade of the snowfields and the deck as their sunlit side)
  var col: vec3f = M.s.rgb * (t.x * M.k.x) + U.ambSky.rgb * (t.y * M.k.y + t.z * M.k.z * 0.55) + U.ambGnd.rgb * (t.z * M.k.z * 0.45);
  // the air between here and the cloud
  let d: vec3f = normalize(v.dir);
  col = mix(col, skyLut(vec3f(d.x, max(d.y, 0.0), d.z)) * t.a, M.k.w);
  o.color = vec4f(col, t.a) * M.f.x; return o; }
`;
