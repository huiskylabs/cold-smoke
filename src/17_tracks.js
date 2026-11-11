// ---------------------------------------------------------------- the skier's own tracks
// A small height map of the snow around the skier. Every step each ski presses another length of its groove into it; the terrain shader reads it for
// the walls of the grooves and, with the sun this low, the shadows those walls throw. 1024^2 texels over 32 m, addressed by world
// position modulo 32 m. Whatever lies more than `keep` metres from the skier is wiped, so the tracks of one tile back never come round.
const Tracks = (() => {
  const T = { N: 1024, span: 32, keep: 14, HS: 0.16, enabled: true, pipes: [] };   // HS: metres of snow per unit of the stored value
  const MAXI = 2048, FL = 20;
  let gfx, tex, target, pipeStamp, pipeWipe, buf, cpu, wpos, count = 0, fresh = true, cx = 0, cz = 0;
  const prev = [null, null];
  T.init = function (g) {
    gfx = g;
    tex = gfx.texture({ w: T.N, h: T.N, format: 'rgba8', filter: 'linear', wrap: 'repeat', mips: true }); target = gfx.target({ color: tex }); T.tex = tex; T.target = target;
    cpu = new Float32Array(MAXI * FL); wpos = new Float32Array(MAXI * 2); buf = gfx.buffer(cpu, 'vertex', true);
    pipeStamp = gfx.pipeline({
      name: 'trackStamp', lib: [SL.common], topology: 'strip', cull: 'none', depth: false, depthTest: false, blend: 'alpha', colorFormat: 'rgba8',
      buffers: [{ instanced: true, attrs: [['a0', 'vec4f'], ['a1', 'vec4f'], ['a2', 'vec4f'], ['a3', 'vec4f'], ['a4', 'vec4f']] }],
      varyings: { q: 'vec4f', d: 'vec4f' }, uniforms: { p: 'vec4f' }, textures: {}, vs: STAMP_VS, fs: STAMP_FS,
    });
    pipeWipe = gfx.pipeline({
      name: 'trackWipe', lib: [SL.common], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f' }, textures: {},
      depth: false, depthTest: false, cull: 'none', blend: 'alpha', colorFormat: 'rgba8', vs: VS_FULLSCREEN, fs: WIPE_FS,
    });
    T.pipes = [pipeStamp, pipeWipe];
  };
  T.reset = function () { fresh = true; count = 0; prev[0] = prev[1] = null; };

  // one length of ribbon between two nodes of a ski's path. A node is [x, z, nx, nz, gw, hw, dep, tilt, rim, lim]: where the ski was, the
  // unit vector across its direction of travel, the half width of the groove and of the ski (m), depth and rim height (units of HS),
  // and how far across the ribbon the line midway to the other ski lies: each ski presses the snow on its own side of that line only
  function push(a, b) {
    const u = b[0] / T.span - Math.floor(b[0] / T.span), v = b[1] / T.span - Math.floor(b[1] / T.span), reach = 2.2 / T.span;
    const nu = u < reach ? 1 : u > 1 - reach ? -1 : 0, nv = v < reach ? 1 : v > 1 - reach ? -1 : 0;
    // a length that lies on the edge of the tile is drawn again on the far side
    for (let c = 0; c < 4; c++) {
      if (((c & 1) && !nu) || ((c & 2) && !nv)) continue;
      if (count === MAXI) { cpu.copyWithin(0, FL * MAXI / 2); wpos.copyWithin(0, MAXI); count = MAXI / 2; }
      const o = count * FL; wpos[count * 2] = b[0]; wpos[count * 2 + 1] = b[1]; count++;
      cpu[o] = u + ((c & 1) ? nu : 0); cpu[o + 1] = v + ((c & 2) ? nv : 0); cpu[o + 2] = b[2]; cpu[o + 3] = b[3];
      cpu[o + 4] = a[0] - b[0]; cpu[o + 5] = a[1] - b[1]; cpu[o + 6] = a[2]; cpu[o + 7] = a[3];
      cpu[o + 8] = b[4]; cpu[o + 9] = b[5]; cpu[o + 10] = b[6]; cpu[o + 11] = b[7];
      cpu[o + 12] = a[4]; cpu[o + 13] = a[5]; cpu[o + 14] = a[6]; cpu[o + 15] = a[7];
      cpu[o + 16] = b[8]; cpu[o + 17] = a[8]; cpu[o + 18] = b[9]; cpu[o + 19] = a[9];
    }
  }
  // called every simulation step with the skier's frame, pose and physical state
  T.step = function (root, pose, S) {
    const px = root.pos[0], pz = root.pos[2];
    if (Math.hypot(px - cx, pz - cz) > 6) T.reset();       // the skier was put somewhere else
    cx = px; cz = pz;
    if (!T.enabled || !S.contact || S.air) { prev[0] = prev[1] = null; return; }
    const f = root.fwd, n = root.nrm;
    let rx = f[1] * n[2] - f[2] * n[1], rz = f[0] * n[1] - f[1] * n[0]; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
    const fl = Math.hypot(f[0], f[2]) || 1, fx = f[0] / fl, fz = f[2] / fl;
    // across the direction of travel (to its right); a ski that is skidding lies at an angle to it and sweeps a swath
    let tx = S.v[0], tz = S.v[2]; const tl = Math.hypot(tx, tz); if (tl > 0.5) { tx /= tl; tz /= tl; } else { tx = fx; tz = fz; }
    const ax = -tz, az = tx, sb = Math.abs(fx * ax + fz * az), cb = Math.sqrt(Math.max(0, 1 - sb * sb)), pw = S.powder || 0;
    // a ski sinks a few centimetres into packed snow and a hand's width into powder; set on edge it cuts narrower, and deeper on that edge
    const hw = (0.058 * (0.62 + 0.38 * Math.cos(pose.edge)) + 0.012) * (1 + 0.8 * pw), gw = hw * cb + 0.72 * sb;
    const dep = lerp(0.035, 0.10, pw) * clamp((S.load || 9.8) / 9.8, 0.6, 1.5) * (1 - 0.45 * Math.min(1, sb / 0.5)) / T.HS;
    const tilt = clamp(pose.edge * 0.9, -1, 1) * cb, rim = dep * lerp(0.28, 0.45, pw);
    const offR = pose.stance * 0.5, sep = (2 * offR * rx + 2 * pose.lead * fx) * ax + (2 * offR * rz + 2 * pose.lead * fz) * az;
    for (let k = 0; k < 2; k++) {
      const sg = k ? 1 : -1, off = sg * offR, along = sg * pose.lead - 0.05;
      const node = [px + rx * off + fx * along, pz + rz * off + fz * along, ax, az, gw, hw, dep, tilt, rim, -sg * sep * 0.5], p0 = prev[k];
      if (p0) { const dx = node[0] - p0[0], dz = node[1] - p0[1], d2 = dx * dx + dz * dz; if (d2 < 9) { if (d2 < 0.0004) continue; push(p0, node); } }
      prev[k] = node;
    }
  };
  // before the scene is drawn: wipe what the skier has left behind for good, then press in the new lengths of track
  let lx = 0, lz = 0;
  T.pre = function () {
    // (if the skier has come more than a few metres since the map was last wiped, what was left out of reach then could come round the
    // tile and into reach now: start from clean snow instead)
    if (Math.hypot(cx - lx, cz - lz) > T.span - 2 * T.keep - 0.5) fresh = true;
    lx = cx; lz = cz;
    gfx.beginPass(target, fresh ? { color: [0.5, 0.5, 0.5, 1] } : {}); fresh = false;
    gfx.draw(pipeWipe, { u: { p: [cx / T.span - Math.floor(cx / T.span), cz / T.span - Math.floor(cz / T.span), T.span, T.keep] }, count: 3 });
    // lengths laid while no frame was drawn may by now be a whole tile behind: only those still near the skier are pressed in
    let i0 = count; const far = (T.keep - 1.5) * (T.keep - 1.5);
    while (i0 > 0) { const dx = wpos[i0 * 2 - 2] - cx, dz = wpos[i0 * 2 - 1] - cz; if (dx * dx + dz * dz > far) break; i0--; }
    if (count > i0) { gfx.updateBuffer(buf, 0, cpu.subarray(i0 * FL, count * FL)); gfx.draw(pipeStamp, { u: { p: [1 / T.span, 0, 0, 0] }, vb: [buf], count: 4, instances: count - i0 }); }
    count = 0;
    gfx.endPass();
    gfx.genMips(tex);
  };
  return T;
})();

const STAMP_VS = `
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let side: f32 = f32(a.vid & 1u) * 2.0 - 1.0; let cur: f32 = f32((a.vid >> 1u) & 1u);
  let par: vec4f = mix(a.a3, a.a2, cur);                                     // groove half width, ski half width, depth, tilt
  let n: vec2f = mix(a.a1.zw, a.a0.zw, cur);
  let W: f32 = par.x + 1.6 * (1.2 * par.y + 0.02) + 0.03;
  let uv: vec2f = a.a0.xy + (a.a1.xy * (1.0 - cur) + n * (side * W)) * M.p.x;
  v.clip = vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.5, 1.0);
  v.q = vec4f(side * W, mix(a.a4.y, a.a4.x, cur), mix(a.a4.w, a.a4.z, cur), 0.0); v.d = par;
  return v;
}`;
const STAMP_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let w: f32 = v.q.x; let aw: f32 = abs(w); let gw: f32 = v.d.x; let hw: f32 = v.d.y;
  if ((w - v.q.z) * sign(v.q.z) > 0.0) { discard; }                                                             // the other ski's side
  let e: f32 = 0.012 + 0.3 * hw; let rw: f32 = 1.2 * hw + 0.02;
  let g: f32 = smoothstep(gw + e, gw - e, aw);                                                                // the groove under the ski
  let rim: f32 = smoothstep(gw - e * 0.5, gw + 0.4 * rw, aw) * smoothstep(gw + 1.5 * rw, gw + 0.7 * rw, aw);   // the snow pushed up beside it
  let dep: f32 = v.d.z * clamp(1.0 + v.d.w * (w / max(gw, 0.01)) * 0.6, 0.35, 1.6);                            // on edge: deeper under that edge
  o.color = vec4f(vec3f(0.5 + 0.5 * (v.q.y * rim - dep * g)), max(g, rim * 0.6));
  return o;
}`;
const WIPE_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let d: vec2f = (fract(v.uv - M.p.xy + 0.5) - 0.5) * M.p.z;      // metres from the skier, the short way round the tile
  if (dot(d, d) < M.p.w * M.p.w) { discard; }
  o.color = vec4f(0.5, 0.5, 0.5, 1.0);
  return o;
}`;
