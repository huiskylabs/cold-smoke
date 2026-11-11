// ---------------------------------------------------------------- post: bloom chain, light shafts, motion blur, lens, grade
const Post = (() => {
  const P = { bloomLevels: 6, mips: [], shutter: 1 / 90, blurMax: 0.045, blurFar: 0.3, exposure: 0.145, satPre: 1.22, satPost: 1.1, flare: 1, burst: 1, ghosts: 1, riders: [[0, 0, 0, 0], [0, 0, 0, 0]], rays: 1, rayCore: 0.07, rayBase: 0.04, rayOcc: 0.85, rayFall: 6.0 };
  let gfx, pDown0, pDown, pUp, pComp, pVis, pMask, pRad, pMB, visTex, visT, visInit = false, W = 0, H = 0;
  let rayA, rayAT, rayB, rayBT;

  P.init = function (g) {
    gfx = g;
    const post = (name, fs, o = {}) => gfx.pipeline(Object.assign({ name, lib: [SL.common, SL.tonemap].concat(o.lib || []), buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f', q: 'vec4f' }, textures: { tA: '2d' }, depth: false, depthTest: false, cull: 'none', vs: VS_FULLSCREEN, fs }, o));
    // first downsample: 13 taps, partial Karis average so single hot glints don't strobe the whole bloom
    pDown0 = post('bloomDown0', `
fn kw(c: vec3f) -> f32 { return 1.0 / (1.0 + luma(c) * 0.25); }
fn frag(v: VOut) -> FOut { var o: FOut; let t: vec2f = M.p.xy; let uv: vec2f = v.uv;
  let a: vec3f = texLod(tA, uv + t * vec2f(-2.0, -2.0), 0.0).rgb; let b: vec3f = texLod(tA, uv + t * vec2f(0.0, -2.0), 0.0).rgb; let c: vec3f = texLod(tA, uv + t * vec2f(2.0, -2.0), 0.0).rgb;
  let d: vec3f = texLod(tA, uv + t * vec2f(-2.0, 0.0), 0.0).rgb; let e: vec3f = texLod(tA, uv, 0.0).rgb; let f: vec3f = texLod(tA, uv + t * vec2f(2.0, 0.0), 0.0).rgb;
  let g: vec3f = texLod(tA, uv + t * vec2f(-2.0, 2.0), 0.0).rgb; let h: vec3f = texLod(tA, uv + t * vec2f(0.0, 2.0), 0.0).rgb; let i: vec3f = texLod(tA, uv + t * vec2f(2.0, 2.0), 0.0).rgb;
  let j: vec3f = texLod(tA, uv + t * vec2f(-1.0, -1.0), 0.0).rgb; let k: vec3f = texLod(tA, uv + t * vec2f(1.0, -1.0), 0.0).rgb; let l: vec3f = texLod(tA, uv + t * vec2f(-1.0, 1.0), 0.0).rgb; let m: vec3f = texLod(tA, uv + t * vec2f(1.0, 1.0), 0.0).rgb;
  let g0: vec3f = (j + k + l + m) * 0.25; let g1: vec3f = (a + b + d + e) * 0.25; let g2: vec3f = (b + c + e + f) * 0.25; let g3: vec3f = (d + e + g + h) * 0.25; let g4: vec3f = (e + f + h + i) * 0.25;
  let w0: f32 = kw(g0) * 0.5; let w1: f32 = kw(g1) * 0.125; let w2: f32 = kw(g2) * 0.125; let w3: f32 = kw(g3) * 0.125; let w4: f32 = kw(g4) * 0.125;
  let s: vec3f = (g0 * w0 + g1 * w1 + g2 * w2 + g3 * w3 + g4 * w4) / (w0 + w1 + w2 + w3 + w4);
  o.color = vec4f(min(s, vec3f(64.0)), 1.0); return o; }`);
    pDown = post('bloomDown', `
fn frag(v: VOut) -> FOut { var o: FOut; let t: vec2f = M.p.xy; let uv: vec2f = v.uv;
  var s: vec3f = texLod(tA, uv, 0.0).rgb * 4.0;
  s += texLod(tA, uv + t * vec2f(-1.0, -1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(1.0, -1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(-1.0, 1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(1.0, 1.0), 0.0).rgb;
  o.color = vec4f(s * 0.125, 1.0); return o; }`);
    pUp = post('bloomUp', `
fn frag(v: VOut) -> FOut { var o: FOut; let t: vec2f = M.p.xy; let uv: vec2f = v.uv;
  var s: vec3f = texLod(tA, uv + t * vec2f(-1.0, 0.0), 0.0).rgb + texLod(tA, uv + t * vec2f(1.0, 0.0), 0.0).rgb + texLod(tA, uv + t * vec2f(0.0, -1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(0.0, 1.0), 0.0).rgb;
  s = s * 2.0 + texLod(tA, uv + t * vec2f(-1.0, -1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(1.0, -1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(-1.0, 1.0), 0.0).rgb + texLod(tA, uv + t * vec2f(1.0, 1.0), 0.0).rgb;
  o.color = vec4f(s * (1.0 / 12.0) * M.p.z, 1.0); return o; }`, { blend: 'add' });
    // how much of the sun's disc reaches the lens (terrain, trees, the skier and the spray can all cover it): drives every lens effect.
    // One pixel, eased over a few frames so flares swell and die instead of popping.
    visTex = gfx.texture({ w: 1, h: 1, format: 'rgba16f', filter: 'nearest' }); visT = gfx.target({ color: visTex });
    pVis = gfx.pipeline({ name: 'sunVis', lib: [SL.common], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f' }, textures: { tDepth: 'depth', tOcc: '2d' }, depth: false, depthTest: false, cull: 'none', blend: 'alpha', vs: VS_FULLSCREEN, fs: `
fn frag(v: VOut) -> FOut { var o: FOut;
  let c: vec2f = U.sunScr.xy; var s: f32 = 0.0;
  for (var i: i32 = 0; i < 16; i++) {
    let a: f32 = f32(i) * 2.39996; let r: f32 = sqrt((f32(i) + 0.5) / 16.0) * 0.007;
    let q: vec2f = c + vec2f(cos(a) / U.camUp.w, sin(a)) * r;
    if (q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) { if (texFetchD(tDepth, vec2i(q * U.res.xy), 0) >= 0.9999999) { s += 1.0; } } else { s += 1.0; }
  }
  var vis: f32 = s / 16.0 * U.sunScr.z;
  let e: f32 = min(min(c.x, 1.0 - c.x), min(c.y, 1.0 - c.y));
  vis *= smoothstep(-0.22, 0.03, e);                      // a sun just outside the frame still flares a little
  vis *= exp(-texLod(tOcc, clamp(c, vec2f(0.0), vec2f(1.0)), 0.0).x * 0.9);
  // the same question asked of the sky all round the disc: how much stands in front of the glare (this is what makes beams)
  var w: f32 = 0.0;
  for (var i: i32 = 0; i < 24; i++) {
    let a: f32 = f32(i) * 2.39996; let r: f32 = sqrt((f32(i) + 0.5) / 24.0) * 0.075;
    let q: vec2f = c + vec2f(cos(a) / U.camUp.w, sin(a)) * r;
    if (q.x > 0.0 && q.x < 1.0 && q.y > 0.0 && q.y < 1.0) { if (texFetchD(tDepth, vec2i(q * U.res.xy), 0) >= 0.9999999) { w += 1.0; } } else { w += 1.0; }
  }
  o.color = vec4f(vis, w / 24.0, 0.0, M.p.x); return o; }` });
    // sunbeams. Wherever something stands between the sun and the lens (a tree top, the skier, the curtain of thrown snow), the glare
    // behind it goes dark in a streak pointing away from the sun: the gaps between are the beams. A small mask of open sky, then two
    // short radial sweeps toward the sun (12 taps each, the second filling the gaps of the first).
    const sweep = { buffers: [], varyings: { uv: 'vec2f' }, depth: false, depthTest: false, cull: 'none', vs: VS_FULLSCREEN, colorFormat: 'rgba16f' };
    pMask = gfx.pipeline(Object.assign({ name: 'rayMask', lib: [SL.common], uniforms: { p: 'vec4f' }, textures: { tDepth: 'depth', tOcc: '2d' }, fs: `
fn skyAt(q: vec2f) -> f32 { return step(0.9999999, texFetchD(tDepth, clamp(vec2i(q * U.res.xy), vec2i(0, 0), vec2i(U.res.xy) - vec2i(1, 1)), 0)); }
fn frag(v: VOut) -> FOut { var o: FOut; let t: vec2f = U.res.zw;
  var m: f32 = 0.25 * (skyAt(v.uv + t * vec2f(-1.0, -1.0)) + skyAt(v.uv + t * vec2f(1.0, -1.0)) + skyAt(v.uv + t * vec2f(-1.0, 1.0)) + skyAt(v.uv + t * vec2f(1.0, 1.0)));
  m *= exp(-texLod(tOcc, v.uv, 0.0).x * 0.9);
  o.color = vec4f(m, 1.0, 0.0, 1.0); return o; }` }, sweep));
    pRad = gfx.pipeline(Object.assign({ name: 'raySweep', lib: [SL.common], uniforms: { p: 'vec4f' }, textures: { tA: '2d' }, fs: `
fn frag(v: VOut) -> FOut { var o: FOut;
  let s: vec2f = U.sunScr.xy; let dir: vec2f = s - v.uv; let asp: vec2f = vec2f(U.camUp.w, 1.0);
  var acc: vec2f = vec2f(0.0);
  for (var i: i32 = 0; i < 12; i++) {
    let f: f32 = (f32(i) + 0.5) / 12.0 * M.p.x;
    let q: vec2f = v.uv + dir * f;
    let m: vec2f = texLod(tA, clamp(q, vec2f(0.0), vec2f(1.0)), 0.0).xy;
    // first sweep: weigh each tap by how close to the sun it lies (the glare is brightest there, so that is where a shadow counts)
    let g: f32 = mix(1.0, exp(-length((q - s) * asp) / M.p.y), M.p.z);
    acc += vec2f(m.x * g, m.y * g);
  }
  o.color = vec4f(acc / 12.0, 0.0, 1.0); return o; }` }, sweep));
    pComp = gfx.pipeline({
      name: 'composite', lib: [SL.common, SL.tonemap], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f', q: 'vec4f', r: 'vec4f' }, textures: { tScene: '2d', tBloom: '2d', tDepth: 'depth', tVis: '2d', tRay: '2d' },
      colorFormat: 'canvas', depth: false, depthTest: false, cull: 'none', vs: VS_FULLSCREEN, fs: COMPOSITE_FS,
    });
    // the shutter stays open for a moment while the mountain goes by: every point of the picture is smeared along the path it took
    // across the frame since the last one (where it is now, from its depth; where it was, through last frame's camera). The skier
    // rides with the lens and stays sharp; snow thrown into the air is drawn afterwards, over the streaked ground.
    pMB = gfx.pipeline({
      name: 'motionBlur', lib: [SL.common, SL.depth, SL.tonemap], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f', d0: 'vec4f', d1: 'vec4f' }, textures: { tA: '2d', tDepth: 'depth' },
      depth: false, depthTest: false, cull: 'none', vs: VS_FULLSCREEN, fs: `
fn relAt(uv: vec2f, z: f32) -> vec3f {
  let ty: f32 = U.camRight.w; let tx: f32 = ty * U.camUp.w;
  return (U.camFwd.xyz + U.camRight.xyz * ((uv.x * 2.0 - 1.0) * tx) + U.camUp.xyz * ((1.0 - uv.y * 2.0) * ty)) * z;
}
// anything else that keeps pace with the lens (a deer running alongside): 0 on it, 1 away from it
fn rider(wp: vec3f, c: vec4f) -> f32 { if (c.w <= 0.0) { return 1.0; } return smoothstep(1.35 * c.w, 2.0 * c.w, length((wp - c.xyz) * vec3f(1.0, 0.8, 1.0))); }
fn frag(v: VOut) -> FOut { var o: FOut;
  let c0: vec3f = texLod(tA, v.uv, 0.0).rgb;
  let z: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy), 0));
  let wp: vec3f = U.camPos.xyz + relAt(v.uv, z);
  let pc: vec4f = U.prevViewProj * vec4f(wp, 1.0);
  let sc: vec3f = U.player.xyz + vec3f(0.0, 0.85, 0.0);
  var vel: vec2f = (v.uv - vec2f(pc.x / pc.w * 0.5 + 0.5, 0.5 - pc.y / pc.w * 0.5)) * M.p.x;
  vel *= smoothstep(1.05, 1.6, length(wp - sc)) * rider(wp, M.d0) * rider(wp, M.d1) * mix(1.0, M.p.z, smoothstep(150.0, 700.0, z)) * step(0.01, pc.w);
  let asp: vec2f = vec2f(U.camUp.w, 1.0);
  let len: f32 = length(vel * asp);
  if (len > M.p.y) { vel *= M.p.y / len; }
  if (min(len, M.p.y) * U.res.y < 0.8) { o.color = vec4f(c0, 1.0); return o; }
  // (white noise, not the interleaved-gradient pattern: that one repeats every third row, and beats with the ripples of the snow)
  let fr: f32 = U.origin.w - 64.0 * floor(U.origin.w / 64.0);
  let n: f32 = fract(sin(dot(v.clip.xy + vec2f(fr * 7.31, fr * 3.17), vec2f(12.9898, 78.233))) * 43758.5453);
  var acc: vec3f = c0 * 0.25; var ws: f32 = 0.25;
  for (var i: i32 = 0; i < 9; i++) {
    let q: vec2f = clamp(v.uv + vel * ((f32(i) + n) / 9.0 - 0.5), vec2f(0.0), vec2f(1.0));
    // what rides with the lens (the skier) leaves no streak on the ground behind it
    let zq: f32 = linDepth(texFetchD(tDepth, vec2i(q * U.res.xy), 0));
    let wq: vec3f = U.camPos.xyz + relAt(q, zq);
    let w: f32 = smoothstep(1.05, 1.6, length(wq - sc)) * rider(wq, M.d0) * rider(wq, M.d1);
    acc += texLod(tA, q, 0.0).rgb * w; ws += w;
  }
  o.color = vec4f(acc / ws, 1.0); return o; }` });
    P.pipes = [pDown0, pDown, pUp, pComp, pVis, pMask, pRad, pMB];
  };
  P.resize = function (w, h) {
    for (const m of P.mips) { gfx.destroyTarget(m.t); gfx.destroyTexture(m.tex); }
    if (rayA) { gfx.destroyTarget(rayAT); gfx.destroyTexture(rayA); gfx.destroyTarget(rayBT); gfx.destroyTexture(rayB); }
    { const rw = Math.max(2, Math.ceil(w / 4)), rh = Math.max(2, Math.ceil(h / 4));
      rayA = gfx.texture({ w: rw, h: rh, format: 'rgba16f', filter: 'linear', wrap: 'clamp' }); rayAT = gfx.target({ color: rayA });
      rayB = gfx.texture({ w: rw, h: rh, format: 'rgba16f', filter: 'linear', wrap: 'clamp' }); rayBT = gfx.target({ color: rayB }); }
    P.mips = []; W = w; H = h;
    let mw = w, mh = h;
    for (let i = 0; i < P.bloomLevels; i++) { mw = Math.max(2, mw >> 1); mh = Math.max(2, mh >> 1); const tex = gfx.texture({ w: mw, h: mh, format: 'rgba16f', filter: 'linear' }); P.mips.push({ tex, t: gfx.target({ color: tex }), w: mw, h: mh }); }
  };
  // draws the streaked scene into the pass that is open. `dt`: the time the last frame took
  P.motionBlur = function (sceneTex, depthTex, dt) {
    gfx.draw(pMB, { u: { p: [P.shutter / Math.max(dt, 1 / 240), P.blurMax, P.blurFar, 0], d0: P.riders[0], d1: P.riders[1] }, tex: { tA: sceneTex, tDepth: depthTex }, count: 3 });
  };
  P.run = function (sceneTex, depthTex) {
    const m = P.mips;
    gfx.beginPass(visT, visInit ? {} : { color: [0, 0, 0, 1] });
    gfx.draw(pVis, { u: { p: [visInit ? 0.3 : 1, 0, 0, 0] }, tex: { tDepth: depthTex, tOcc: P.occTex || Tex.black }, count: 3 }); gfx.endPass(); visInit = true;
    gfx.beginPass(rayAT, { color: [0, 0, 0, 1] }); gfx.draw(pMask, { u: { p: [0, 0, 0, 0] }, tex: { tDepth: depthTex, tOcc: P.occTex || Tex.black }, count: 3 }); gfx.endPass();
    gfx.beginPass(rayBT, { color: [0, 0, 0, 1] }); gfx.draw(pRad, { u: { p: [1, P.rayCore, 1, 0] }, tex: { tA: rayA }, count: 3 }); gfx.endPass();
    gfx.beginPass(rayAT, { color: [0, 0, 0, 1] }); gfx.draw(pRad, { u: { p: [1 / 12, P.rayCore, 0, 0] }, tex: { tA: rayB }, count: 3 }); gfx.endPass();
    gfx.beginPass(m[0].t, { color: [0, 0, 0, 1] }); gfx.draw(pDown0, { u: { p: [1 / W, 1 / H, 0, 0] }, tex: { tA: sceneTex }, count: 3 }); gfx.endPass();
    for (let i = 1; i < m.length; i++) { gfx.beginPass(m[i].t, { color: [0, 0, 0, 1] }); gfx.draw(pDown, { u: { p: [1 / m[i - 1].w, 1 / m[i - 1].h, 0, 0] }, tex: { tA: m[i - 1].tex }, count: 3 }); gfx.endPass(); }
    for (let i = m.length - 2; i >= 0; i--) { gfx.beginPass(m[i].t, {}); gfx.draw(pUp, { u: { p: [1 / m[i + 1].w, 1 / m[i + 1].h, 1.0, 0] }, tex: { tA: m[i + 1].tex }, count: 3 }); gfx.endPass(); }
    gfx.beginPass(null, { color: [0, 0, 0, 1] });
    gfx.draw(pComp, { u: { p: [P.exposure, 1 / m.length, P.rayBase * P.rays, P.rayOcc * P.rays], q: [P.satPre, P.satPost, P.flare, P.rayFall], r: [P.burst, P.ghosts, 0, 0] }, tex: { tScene: sceneTex, tBloom: m[0].tex, tDepth: depthTex, tVis: visTex, tRay: rayA }, count: 3 });
    gfx.endPass();
  };
  return P;
})();

const COMPOSITE_FS = `
// what the sun does inside the lens: a veil of glare, a starburst from the iris, and a few faint reflections strung across the frame
fn lensFlare(uv: vec2f) -> vec3f {
  let vv: vec2f = texLod(tVis, vec2f(0.5), 0.0).xy; let vis: f32 = vv.x;
  let asp: f32 = U.camUp.w; let s: vec2f = U.sunScr.xy;
  let d: vec2f = (uv - s) * vec2f(asp, 1.0); let r: f32 = length(d);
  var f: vec3f = U.sunCol.rgb * (1.7 * exp(-r * 30.0) + 0.11 * exp(-r * 6.5) + 0.030 * exp(-r * 2.4));
  // starburst: thin rays, each with its own length
  let NR: f32 = 14.0;
  let a: f32 = atan2(d.y, d.x) / 6.2832 * NR + 0.31;
  var k: f32 = floor(a + 0.5); let da: f32 = (a - k) * 6.2832 / NR; k = k - NR * floor(k / NR);
  let h: f32 = fract(sin(k * 91.7 + 3.1) * 43758.5);
  let len: f32 = 0.018 + 0.055 * h * h + 0.008 * sin(U.camPos.w * (0.7 + h) + k);
  let ray: f32 = exp(-sq(r * sin(da) / (0.0014 + 0.013 * r))) * exp(-r / max(len, 0.01));
  f += U.sunCol.rgb * ray * (1.15 * M.r.x);
  // ghosts along the axis through the centre of the frame
  let ax: vec2f = (vec2f(0.5) - s) * vec2f(asp, 1.0);
  let f0: vec3f = f;
  let g1: f32 = length(d - ax * 1.45); let g2: f32 = length(d - ax * 1.85); let g3: f32 = length(d - ax * 0.55); let g4: f32 = length(d - ax * 2.5);
  f += U.sunCol.rgb * vec3f(0.35, 1.0, 0.75) * smoothstep(0.050, 0.043, g1) * (0.35 + 0.65 * smoothstep(0.02, 0.05, g1)) * 0.016;
  f += U.sunCol.rgb * vec3f(1.0, 0.55, 0.25) * smoothstep(0.022, 0.018, g2) * 0.03;
  f += U.sunCol.rgb * vec3f(0.55, 0.45, 1.0) * smoothstep(0.085, 0.07, g3) * (0.2 + 0.8 * smoothstep(0.04, 0.085, g3)) * 0.008;
  f += U.sunCol.rgb * vec3f(0.4, 0.8, 1.0) * smoothstep(0.13, 0.11, g4) * (0.15 + 0.85 * smoothstep(0.08, 0.13, g4)) * 0.006;
  f = (f0 + (f - f0) * M.r.y) * vis;
  // beams: the glare the air throws back, cut into streaks by whatever stands in front of the sun. They show most when the disc itself is
  // half hidden (less glare in the lens, and the eye opens up)
  let rb: vec2f = texLod(tRay, uv, 0.0).xy; let beam: f32 = rb.x / max(rb.y, 1e-5);
  f += U.sunCol.rgb * vec3f(1.0, 0.94, 0.84) * (beam * exp(-r * M.q.w) * (M.p.z + M.p.w * smoothstep(0.0, 0.45, 1.0 - vv.y)) * U.sunScr.z);
  return f;
}
fn frag(v: VOut) -> FOut { var o: FOut;
  var col: vec3f = texLod(tScene, v.uv, 0.0).rgb;
  let bloom: vec3f = texLod(tBloom, v.uv, 0.0).rgb * M.p.y;
  col = mix(col, bloom, 0.06);
  col += lensFlare(v.uv) * M.q.z;
  // white balance toward the low sun (sunlit snow a warm white, sky-lit shadows properly blue), exposure, then the film curve.
  // chroma is pushed a little before the curve (deep sky, rich shadows) and again after it.
  col *= vec3f(0.93, 1.0, 1.10) * M.p.x;
  let l0: f32 = luma(col); col = max(vec3f(l0) + (col - vec3f(l0)) * M.q.x, vec3f(0.0));
  col = filmCurve(col);
  let l: f32 = luma(col);
  col = max(mix(vec3f(l), col, M.q.y), vec3f(0.0));
  // the lens falls off toward its corners (a wide one loses a good deal more than this)
  let c: vec2f = v.uv - 0.5;
  col *= 1.0 - 0.34 * smoothstep(0.20, 0.95, dot(c, c) * 2.0);
  col = toSRGB(saturate(col));
  col += (ign(v.clip.xy) - 0.5) / 255.0;
  o.color = vec4f(col, 1.0); return o; }
`;
