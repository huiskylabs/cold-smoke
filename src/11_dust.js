// ---------------------------------------------------------------- diamond dust: the fine snow that hangs in clear cold air
// Nothing is simulated. Every crystal is a pure function of (index, time): a point in a box that wraps around the camera, drifting
// down with the wind. Three nested boxes give density where it matters: a wide sparse field, a closer one, and a handful right at the
// lens that the depth of field turns into soft discs. The light on each crystal comes from the same sun, through the same shadow map.
const Dust = (() => {
  const D = { enabled: true, layers: [
    { W: 32, n: 4600, power: 1.3, fall: 0.38 },
    { W: 8, n: 1700, power: 1.0, fall: 0.30 },
    { W: 2, n: 64, power: 1.5, fall: 0.22 },
  ] };
  let gfx, pipe;
  D.init = function (g) {
    gfx = g;
    pipe = gfx.pipeline({
      name: 'dust', lib: [SL.common, SL.hash, SL.depth, SL.shadow, GLINT_SSL], topology: 'strip', cull: 'none', depth: false, depthTest: false, blend: 'add',
      buffers: [], varyings: { uv: 'vec2f', shp: 'vec4f', col: 'vec4f' }, uniforms: { p: 'vec4f' },
      textures: { tDepth: 'depth', tShadow: 'shadow' },
      vs: `
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  let W: f32 = M.p.x; let id: u32 = a.iid + u32(M.p.w);
  let h: vec3f = hashu3(id * 3u + 7u); let h2: vec3f = hashu3(id * 3u + 1013u);
  let tm: f32 = U.camPos.w;
  // drift: wind + settling, each crystal a little different, with a slow sideways flutter
  let vel: vec3f = U.wind.xyz * (0.55 + 0.5 * h2.x) + vec3f(0.0, -M.p.z * (0.6 + 0.8 * h2.y), 0.0);
  let fl: vec3f = vec3f(sin(tm * (0.7 + h2.z) + h.x * 40.0), 0.0, cos(tm * (0.6 + h2.x) + h.z * 40.0)) * 0.12;
  let q: vec3f = h * W + vel * tm + fl;
  // wrap into a box centred a little ahead of the camera
  let ctr: vec3f = U.camPos.xyz + U.camFwd.xyz * (0.36 * W);
  let rel: vec3f = (fract((q - ctr - U.origin.xyz) / W + 0.5) - 0.5) * W;
  let pos: vec3f = ctr + rel;
  let edge: f32 = max(abs(rel.x), max(abs(rel.y), abs(rel.z))) / W;
  let fade: f32 = smoothstep(0.5, 0.40, edge);
  // the dust is not spread evenly: it hangs in sheets a few metres thick that drift with the wind (three plane waves riding on the air,
  // each repeating every 1024 m), so the sparkle comes toward you in veils and thins out again behind them
  let pa: vec3f = pos + U.origin.xyz - U.wind.xyz * tm;
  let kk: f32 = 0.0061359232;
  let sv: f32 = sin(kk * dot(pa, vec3f(31.0, 9.0, 17.0))) + sin(kk * dot(pa, vec3f(-13.0, 47.0, 41.0)) + 1.3) + 0.6 * sin(kk * dot(pa, vec3f(57.0, -19.0, -71.0)) + 2.1);
  let veil: f32 = smoothstep(-0.5, 1.5, sv);
  let pw: f32 = M.p.y * U.fx.x * fade * (0.12 + 1.9 * h2.z * h2.z * h2.z) * (0.22 + 2.9 * veil * veil);
  let vis: f32 = shadowFast(pos, 0.0015);
  let g: GlintV = glintQuad(corner, pos, vel, h.y + h2.x * 0.37, pw, vis, 0.0, 1.0);
  v.clip = g.clip; v.uv = g.uv; v.shp = g.shp; v.col = g.col;
  return v;
}`,
      fs: `fn frag(v: VOut) -> FOut { var o: FOut; o.color = glintShade(v.uv, v.shp, v.col); return o; }`,
    });
    D.pipes = [pipe];
  };
  D.fx = function (R) {
    if (!D.enabled) return;
    let off = 0;
    for (const L of D.layers) { gfx.draw(pipe, { u: { p: [L.W, L.power, L.fall, off] }, tex: { tDepth: R.depth, tShadow: R.shadowTex }, count: 4, instances: L.n }); off += L.n; }
  };
  return D;
})();
