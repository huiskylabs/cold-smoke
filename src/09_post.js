// ---------------------------------------------------------------- post: bloom chain, light shafts, motion blur, lens, grade
const Post = (() => {
  const P = { bloomLevels: 6, mips: [], shutter: 1 / 90, blurMax: 0.045, blurFar: 0.3, exposure: 0.145, satPre: 1.22, satPost: 1.1, flare: 1, burst: 1, ghosts: 1, riders: [[0, 0, 0, 0], [0, 0, 0, 0]], rays: 1, rayCore: 0.07, rayBase: 0.04, rayOcc: 0.85, rayFall: 6.0 };
  // set every frame by 07c_feel.js, which also sets `shutter` and `blurMax` above (longer and further at speed, as much shorter as time is slower).
  // speed 0..1: toward the top of it red and blue part by `fringe` at the corners and the sides of the frame darken. slow 0..1: slow motion.
  // wet: snow melting on the glass (how much is left 0..1, for how many seconds, which scatter of beads, where it came from: x -1 left .. 1 right,
  // y 0..1 from below; wetNew 1..0: still snow, not yet melted). chat: the tremble of the skis on the snow, as where the scene is read from
  // this frame (whole pixels across and down, and a turn about the middle of the frame in radians)
  Object.assign(P, { speed: 0, fringe: 0.005, slow: 0, wet: 0, wetAge: 0, wetSeed: 0, wetBias: [0, 0], wetNew: 0, chat: [0, 0, 0] });
  // also from 07c_feel.js: radial, the least streak at the very corners of the frame at speed (picture heights; 0 = none), drawn toward radC,
  // the point in the frame the lens is heading for (uv); radIn, how far out from the middle it begins (1 = the middle of a side, 1.41 a corner)
  Object.assign(P, { radial: 0, radC: [0.5, 0.5], radIn: 0.6 });
  // how strongly the sun's ghosts show is the owner's call (Variants, the 场景 panel): as delivered (four faint discs of one colour each, all
  // but lost in the picture), light, or clear (lensGhosts below: soft discs split into rainbow fringes, after the Steep reference). Each
  // version is [delivered ghosts, new ghosts]; a change is eased in over a few tenths of a second
  P.ghostV = { a: [1, 0], b: [0, 0.75], c: [0, 1.3] };
  const gPick = () => P.ghostV[typeof Variants !== 'undefined' && Variants.val.ghost] || P.ghostV.c;
  if (typeof Variants !== 'undefined') Variants.def('ghost', '逆光光斑', [['a', '现在的'], ['b', '轻'], ['c', '明显']], 'c');
  P.gOld = gPick()[0]; P.gNew = gPick()[1];
  // highlights: as delivered (the film curve per channel, so backlit spray and the glare round a low sun burn to a saturated yellow), or
  // losing their colour toward white as they near the top of the curve, the way film and the eye do (composite below). Eased like the ghosts
  const wPick = () => (typeof Variants !== 'undefined' && Variants.val.hi === 'a') ? 0 : 1;
  if (typeof Variants !== 'undefined') Variants.def('hi', '高光', [['a', '原来'], ['b', '渐白']], 'b');
  P.white = wPick();
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
    // (a sun outside the frame is judged by the edge of the frame nearest it: a ridge or a tree standing there hides it, open sky does not)
    if (texFetchD(tDepth, clamp(vec2i(q * U.res.xy), vec2i(0, 0), vec2i(U.res.xy) - vec2i(1, 1)), 0) >= 0.9999999) { s += 1.0; }
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
      name: 'composite', lib: [SL.common, SL.hash, SL.tonemap], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f', q: 'vec4f', r: 'vec4f', w: 'vec4f', wb: 'vec4f', sh: 'vec4f' }, textures: { tScene: '2d', tBloom: '2d', tDepth: 'depth', tVis: '2d', tRay: '2d' },
      colorFormat: 'canvas', depth: false, depthTest: false, cull: 'none', vs: VS_FULLSCREEN, fs: COMPOSITE_FS,
    });
    // the shutter stays open for a moment while the mountain goes by: every point of the picture is smeared along the path it took
    // across the frame since the last one (where it is now, from its depth; where it was, through last frame's camera). The skier
    // rides with the lens and stays sharp; snow thrown into the air is drawn afterwards, over the streaked ground.
    // At speed the corners and the sides of the frame are drawn out besides, near or far, along lines that run to the point the lens is
    // heading for (rd.xy): the far ridges and the sky go too, as through a fast lens on a moving rig. It is the same streak, not a second
    // blur over it: where the scene already streaks further (the snow going by under the lens) nothing changes; elsewhere it is lengthened,
    // and turned toward that line, until it is rd.z picture heights long at the very corner. Nothing in the middle of the frame, nothing on
    // the skier.
    pMB = gfx.pipeline({
      name: 'motionBlur', lib: [SL.common, SL.depth, SL.tonemap], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f', d0: 'vec4f', d1: 'vec4f', rd: 'vec4f' }, textures: { tA: '2d', tDepth: 'depth' },
      depth: false, depthTest: false, cull: 'none', vs: VS_FULLSCREEN, fs: `
fn relAt(uv: vec2f, z: f32) -> vec3f {
  let ty: f32 = U.camRight.w; let tx: f32 = ty * U.camUp.w;
  return (U.camFwd.xyz + U.camRight.xyz * ((uv.x * 2.0 - 1.0) * tx) + U.camUp.xyz * ((1.0 - uv.y * 2.0) * ty)) * z;
}
// anything else that keeps pace with the lens (a deer running alongside): 0 on it, 1 away from it
fn rider(wp: vec3f, c: vec4f) -> f32 { if (c.w <= 0.0) { return 1.0; } return smoothstep(1.35 * c.w, 2.0 * c.w, length((wp - c.xyz) * vec3f(1.0, 0.8, 1.0))); }
// a tap held to cap (exposed luminance) and greyed above it, by k (0: as it is)
fn tame(s: vec3f, ex: f32, k: f32, cap: f32) -> vec3f {
  let le: f32 = luma(s) * ex; if (le <= cap || k <= 0.0) { return s; }
  let g: vec3f = mix(s, vec3f(luma(s)), k * smoothstep(cap, 3.0 * cap, le));
  return g * mix(1.0, cap / le, k);
}
fn frag(v: VOut) -> FOut { var o: FOut;
  let c0: vec3f = texLod(tA, v.uv, 0.0).rgb;
  let z: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy), 0));
  let wp: vec3f = U.camPos.xyz + relAt(v.uv, z);
  let pc: vec4f = U.prevViewProj * vec4f(wp, 1.0);
  let sc: vec3f = U.player.xyz + vec3f(0.0, 0.85, 0.0);
  let keep: f32 = smoothstep(1.05, 1.6, length(wp - sc)) * rider(wp, M.d0) * rider(wp, M.d1);
  var vel: vec2f = (v.uv - vec2f(pc.x / pc.w * 0.5 + 0.5, 0.5 - pc.y / pc.w * 0.5)) * M.p.x;
  vel *= keep * mix(1.0, M.p.z, smoothstep(150.0, 700.0, z)) * step(0.01, pc.w);
  let asp: vec2f = vec2f(U.camUp.w, 1.0);
  // (the corners: e is 0 over the middle of the frame and grows from rd.w out: with 0.6, a third of the way at the middle of each side)
  if (M.rd.z > 0.0) {
    let rc: vec2f = (v.uv - M.rd.xy) * asp; let e: f32 = smoothstep(M.rd.w, 1.414, length((v.uv - vec2f(0.5)) * 2.0));
    let lr: f32 = M.rd.z * e * sqrt(e) * keep; let lv: f32 = length(vel * asp);
    if (lr > lv) { vel += rc / (max(length(rc), 1e-4) * asp) * (lr - lv); }
  }
  let len: f32 = length(vel * asp);
  if (len > M.p.y) { vel *= M.p.y / len; }
  let lp: f32 = min(len, M.p.y) * U.res.y;
  if (lp < 0.8) { o.color = vec4f(c0, 1.0); return o; }
  // (white noise, not the interleaved-gradient pattern: that one repeats every third row, and beats with the ripples of the snow)
  let fr: f32 = U.origin.w - 64.0 * floor(U.origin.w / 64.0);
  let n: f32 = fract(sin(dot(v.clip.xy + vec2f(fr * 7.31, fr * 3.17), vec2f(12.9898, 78.233))) * 43758.5453);
  // (cap: a little over sunlit white snow (sun plus sky: a glint is some 30 times the sun), or over this pixel's own level where that is
  // brighter (the sky): nothing that the snow itself would smear is held back, dark edges do not grow dark streaks)
  let ex: f32 = U.ambSky.w; let kk: f32 = smoothstep(5.0, 16.0, lp); let cap: f32 = max(1.15 * luma(c0), 1.2 * luma(U.sunCol.rgb + U.ambSky.rgb)) * ex;
  var acc: vec3f = tame(c0, ex, kk, cap) * 0.25; var ws: f32 = 0.25;
  // (one look every three pixels or so along the streak, 9 to 16 of them: a long streak in a corner stays a line, not a row of beads)
  let nt: i32 = i32(clamp(ceil(lp / 3.0), 9.0, 16.0)); let nf: f32 = f32(nt);
  for (var i: i32 = 0; i < nt; i++) {
    let q: vec2f = clamp(v.uv + vel * ((f32(i) + n) / nf - 0.5), vec2f(0.0), vec2f(1.0));
    // what rides with the lens (the skier) leaves no streak on the ground behind it
    let zq: f32 = linDepth(texFetchD(tDepth, vec2i(q * U.res.xy), 0));
    let wq: vec3f = U.camPos.xyz + relAt(q, zq);
    let w: f32 = smoothstep(1.05, 1.6, length(wq - sc)) * rider(wq, M.d0) * rider(wq, M.d1);
    // a glint is a point of ice 20 to 50 times the snow: averaged in as it is, one of them still burns a white (or prism-coloured) dash
    // through every pixel of its path, like rain on the glass. Once the streak is a few pixels long (kk) a tap is held to a little over the
    // level of sunlit snow (cap) and loses its prism colour: the sparkle trails off as a faint soft streak. A still frame is not touched
    let s: vec3f = tame(texLod(tA, q, 0.0).rgb, ex, kk, cap);
    acc += s * w; ws += w;
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
  // the sun's visibility starts afresh with the next frame instead of easing from the last one drawn (a test that skips frames calls it)
  P.visCut = function () { visInit = false; };
  // draws the streaked scene into the pass that is open. `dt`: the time the last frame took
  P.motionBlur = function (sceneTex, depthTex, dt) {
    gfx.draw(pMB, { u: { p: [P.shutter / Math.max(dt, 1 / 240), P.blurMax, P.blurFar, 0], d0: P.riders[0], d1: P.riders[1], rd: [P.radC[0], P.radC[1], P.radial, P.radIn] }, tex: { tA: sceneTex, tDepth: depthTex }, count: 3 });
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
    { const g = gPick(), k = 1 - Math.exp(-8 * clamp(Render.dt || 0, 0, 0.1)); P.gOld += (g[0] - P.gOld) * k; P.gNew += (g[1] - P.gNew) * k; P.white += (wPick() - P.white) * k; }
    gfx.beginPass(null, { color: [0, 0, 0, 1] });
    gfx.draw(pComp, { u: { p: [P.exposure, 1 / m.length, P.rayBase * P.rays, P.rayOcc * P.rays], q: [P.satPre, P.satPost, P.flare, P.rayFall], r: [P.burst, P.ghosts * P.gOld, P.slow, P.speed], w: [P.wet, P.wetAge, P.wetSeed, P.fringe], wb: [P.wetBias[0], P.wetBias[1], P.wetNew, P.ghosts * P.gNew], sh: [P.chat[0] / W, P.chat[1] / H, P.chat[2], P.white] }, tex: { tScene: sceneTex, tBloom: m[0].tex, tDepth: depthTex, tVis: visTex, tRay: rayA }, count: 3 });
    gfx.endPass();
  };
  return P;
})();

const COMPOSITE_FS = `
// a ghost: light the lens throws back and forth between its own surfaces, the sun's image so far out of focus that it fills the round of the
// open iris. It lies on the line from the sun through the middle of the frame, at middle + k (sun - middle): a ghost past the middle
// swings the other way as the sun moves. The glass does not bend every colour alike, so red lies a little toward the sun and blue away from it
// (dk, in parts of that line): each ghost is fringed like a rainbow, and the more so the further the sun is from the middle. Away from the
// axis the barrel clips it into a cat's eye, narrow along the line (cat). p: this pixel, a: the sun, both from the middle in picture heights;
// r: radius (picture heights); soft: 0 a hard rim .. 1 falling off all the way in
fn ghostDisc(p: vec2f, a: vec2f, k: f32, u: vec2f, r: f32, soft: f32, squ: f32) -> f32 {
  let q: vec2f = p - a * k; let x: f32 = length(vec2f(dot(q, u) * squ, q.x * u.y - q.y * u.x)) / r;
  return 1.0 - smoothstep(1.0 - soft, 1.0, x);
}
fn ghost(p: vec2f, a: vec2f, k: f32, r: f32, dk: f32, soft: f32, cat: f32) -> vec3f {
  let la: f32 = max(length(a), 1e-4); let u: vec2f = a / la; let squ: f32 = 1.0 + cat * abs(k) * la;
  // (nothing to do away from it: most of the frame, for most of them)
  let q: vec2f = p - a * k; let rb: f32 = r + dk * la;
  if (dot(q, q) >= rb * rb) { return vec3f(0.0); }
  return vec3f(ghostDisc(p, a, k + dk, u, r, soft, squ), ghostDisc(p, a, k, u, r, soft, squ), ghostDisc(p, a, k - dk, u, r, soft, squ));
}
// the ghosts as a long lens strings them (after the reference from Steep): a small bright one near the middle, split red | green; a big faint
// lilac disc past it; a cat's eye of red, green and blue near the far edge; a wide pale wash beyond, mostly out of the frame; and, as a real
// lens has them too, a small green one between the sun and the middle and a big faint magenta disc beyond the sun (with the sun high in the
// chase view, those two stand in the sky). In the sun's own light, as a share of what a sunlit white shows (sunCol x exposure)
fn lensGhosts(uv: vec2f) -> vec3f {
  let asp: f32 = U.camUp.w; let p: vec2f = (uv - vec2f(0.5)) * vec2f(asp, 1.0); let a: vec2f = (U.sunScr.xy - vec2f(0.5)) * vec2f(asp, 1.0);
  var g: vec3f = vec3f(1.0, 0.86, 0.38) * ghost(p, a, 0.12, 0.04, 0.06, 0.7, 0.3) * 0.15;
  g += vec3f(0.95, 0.62, 1.0) * ghost(p, a, -0.34, 0.1, 0.02, 0.5, 0.3) * 0.08;
  g += vec3f(1.0, 0.95, 0.8) * ghost(p, a, -0.95, 0.04, 0.055, 0.8, 1.2) * 0.15;
  g += vec3f(1.0, 0.7, 0.95) * ghost(p, a, -1.3, 0.22, 0.03, 0.9, 0.4) * 0.03;
  g += vec3f(0.55, 1.0, 0.75) * ghost(p, a, 0.55, 0.022, 0.035, 0.7, 0.2) * 0.07;
  g += vec3f(1.0, 0.55, 0.95) * ghost(p, a, 1.55, 0.11, 0.025, 0.45, 0.25) * 0.06;
  return U.sunCol.rgb * g;
}
// what the sun does inside the lens: a veil of glare, a starburst from the iris, and a few faint reflections strung across the frame
fn lensFlare(uv: vec2f, vv: vec2f) -> vec3f {
  let vis: f32 = vv.x;
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
  // the ghosts as delivered (P.ghostV.a; M.r.y is 0 for the other versions): four faint discs of one colour each
  if (M.r.y > 0.0005) {
    let ax: vec2f = (vec2f(0.5) - s) * vec2f(asp, 1.0);
    let g1: f32 = length(d - ax * 1.45); let g2: f32 = length(d - ax * 1.85); let g3: f32 = length(d - ax * 0.55); let g4: f32 = length(d - ax * 2.5);
    var go: vec3f = vec3f(0.35, 1.0, 0.75) * smoothstep(0.050, 0.043, g1) * (0.35 + 0.65 * smoothstep(0.02, 0.05, g1)) * 0.016;
    go += vec3f(1.0, 0.55, 0.25) * smoothstep(0.022, 0.018, g2) * 0.03;
    go += vec3f(0.55, 0.45, 1.0) * smoothstep(0.085, 0.07, g3) * (0.2 + 0.8 * smoothstep(0.04, 0.085, g3)) * 0.008;
    go += vec3f(0.4, 0.8, 1.0) * smoothstep(0.13, 0.11, g4) * (0.15 + 0.85 * smoothstep(0.08, 0.13, g4)) * 0.006;
    f += U.sunCol.rgb * go * M.r.y;
  }
  f *= vis;
  // slow motion is shot through an anamorphic: for as long as time is held back a thin blue streak lies across the sun
  f += U.sunCol.rgb * vec3f(0.40, 0.66, 1.0) * ((exp(-abs(d.y) * 150.0) + 0.3 * exp(-abs(d.y) * 36.0)) * exp(-abs(d.x) * 3.2) * 0.2 * M.r.z * vis);
  // beams: the glare the air throws back, cut into streaks by whatever stands in front of the sun. They show most when the disc itself is
  // half hidden (less glare in the lens, and the eye opens up)
  let rb: vec2f = texLod(tRay, uv, 0.0).xy; let beam: f32 = rb.x / max(rb.y, 1e-5);
  f += U.sunCol.rgb * vec3f(1.0, 0.94, 0.84) * (beam * exp(-r * M.q.w) * (M.p.z + M.p.w * smoothstep(0.0, 0.45, 1.0 - vv.y)) * U.sunScr.z);
  return f;
}
// ---- snow on the glass. A hard landing, a bough or a fall throws snow at the lens. It lands white, melts within a few frames into beads
// that sit there and a few heavy enough to run, and in a second and a half the wind has dried it all. Water on the front of a lens is a
// small strong lens of its own, far out of focus: a bead gathers the light of everything in front of the camera (so it shows a soft,
// upside-down blur of the scene, and glows when the sun is in the picture), the rim away from the sun holds a crescent of its light and
// the sun itself stands in the bead as a point. Nothing is looked up here: a bead only moves where the picture behind it is read from.
// d: that displacement, for the sharp picture (uv); f: for the wide soft one, which stands on its head in every bead whatever its size (so a
// bead low on the snow holds a little of the sky); m: how much water stands on this pixel; e: the crescent (+) and the dark rim opposite (-);
// gl: the sun in it
struct Wet { d: vec2f, f: vec2f, m: f32, e: f32, gl: f32, }
fn wetNone() -> Wet { var w: Wet; w.d = vec2f(0.0); w.f = vec2f(0.0); w.m = 0.0; w.e = 0.0; w.gl = 0.0; return w; }
// how thickly the snow landed on each part of the glass (pc: in picture heights): more on the side it came from, little straight in front of the skier
fn wetDens(pc: vec2f) -> f32 {
  let u: vec2f = pc / vec2f(U.camUp.w, 1.0) * 2.0 - 1.0; let k: vec2f = pc - vec2f(0.5 * U.camUp.w, 0.64);
  return max(1.0 + 0.85 * M.wb.x * u.x + 0.4 * M.wb.y * u.y, 0.15) * (1.0 - 0.8 * exp(-dot(k, k) * 9.0));
}
// one bead, from where this pixel stands in it. nn: -1..1 across it; r: its radius (picture heights); s: how much of it is left; sd: toward the sun
fn wetLens(nn: vec2f, r: f32, s: f32, sd: vec2f) -> Wet {
  var w: Wet = wetNone(); let l: f32 = length(nn);
  if (l >= 1.0) { return w; }
  w.m = smoothstep(1.0, 0.5, l) * s; w.d = nn * (-2.4 * r * w.m); w.f = nn * -0.42;
  w.e = -dot(nn, sd) * l * smoothstep(1.0, 0.75, l) * s;
  let gp: vec2f = nn + sd * 0.45; w.gl = exp(-dot(gp, gp) * 24.0) * s;
  return w;
}
// a grid of beads, at most one to a cell and wholly inside it (so no cell need ask its neighbours). n: cells to the picture's height;
// dens: the share of cells that hold one; life: the wetness at which the longest- and the shortest-lived of them are gone
fn wetBeads(p: vec2f, n: f32, seed: f32, dens: f32, life: vec2f, sd: vec2f) -> Wet {
  let g: vec2f = p * n; let id: vec2f = floor(g); let f: vec2f = g - id;
  let h: vec3f = hash33(vec3f(id, seed)); let k: vec3f = hash33(vec3f(id, seed + 31.0));
  // each bead has its own moment to go, and shrinks as it dries
  let s: f32 = smoothstep(0.0, 0.28, M.w.x - mix(life.x, life.y, k.x));
  if (s <= 0.0 || h.z > dens * wetDens((id + 0.5) / n)) { return wetNone(); }
  let r0: f32 = mix(0.07, 0.25, k.y * k.y);
  let q: vec2f = f - (vec2f(1.5 * r0) + h.xy * (1.0 - 3.0 * r0));
  // (not round: melt keeps the outline of the crumb of snow it was)
  let th: f32 = atan2(q.y, q.x + 1e-6);
  let r: f32 = r0 * (0.4 + 0.6 * s) * (1.0 + 0.17 * sin(2.0 * th + k.z * 6.28) + 0.11 * sin(3.0 * th + h.x * 6.28) + 0.07 * sin(5.0 * th + h.y * 6.28));
  return wetLens(q / r, r / n, s, sd);
}
// the beads heavy enough to run: each slides down the glass, a little outward as the wind over the lens pushes it, and leaves a thinning
// film behind it. Tall cells, their rows staggered from one column to the next so that the starts do not line up
fn wetRun(p: vec2f, seed: f32, dens: f32, sd: vec2f) -> Wet {
  let cx: f32 = floor(p.x * 9.0); let gy: f32 = p.y * 2.2 + hash21(vec2f(cx, seed + 53.0)); let cy: f32 = floor(gy);
  let f: vec2f = vec2f(p.x - cx / 9.0, (gy - cy) / 2.2);
  let h: vec3f = hash33(vec3f(cx, cy, seed + 71.0)); let k: vec3f = hash33(vec3f(cx, cy, seed + 97.0));
  let pc: vec2f = vec2f((cx + 0.5) / 9.0, p.y - f.y + 0.2);
  let s: f32 = smoothstep(0.0, 0.3, M.w.x - mix(0.30, 0.70, k.x));
  if (s <= 0.0 || h.z > dens * wetDens(pc)) { return wetNone(); }
  let rh: f32 = mix(0.010, 0.018, k.y) * (0.5 + 0.5 * s);
  let run: f32 = mix(0.07, 0.24, k.z) * (1.0 - exp(-M.w.y * mix(1.5, 3.2, h.x)));
  let a: vec2f = vec2f(mix(0.040, 0.071, h.x), mix(0.03, 0.15, h.y));
  let t: f32 = saturate((f.y - a.y) / max(run, 1e-4));
  let px: f32 = a.x + (pc.x / U.camUp.w - 0.5) * 0.24 * run * t + 0.0035 * sin(f.y * 80.0 + h.y * 31.0) * t;
  let rr: f32 = rh * mix(0.28, 1.0, t * t * t);
  var w: Wet = wetLens((f - vec2f(px, a.y + run * t)) / rr, rr, mix(0.4, 1.0, t * t) * s, sd);
  w.gl *= t * t * t;
  return w;
}
fn lensWet(uv: vec2f) -> Wet {
  let asp: f32 = U.camUp.w; let p: vec2f = uv * vec2f(asp, 1.0);
  let sd: vec2f = normalize((U.sunScr.xy - uv) * vec2f(asp, 1.0) + vec2f(1e-4, 0.0));
  let a: Wet = wetBeads(p, 4.5, M.w.z, 0.22, vec2f(0.02, 0.60), sd);                                // the beads
  let b: Wet = wetBeads(p + vec2f(0.37, 0.19), 12.0, M.w.z + 7.0, 0.16, vec2f(0.30, 0.80), sd);     // a mist of fine ones, first to dry
  let c: Wet = wetRun(p, M.w.z, 0.10, sd);
  var w: Wet; w.d = (a.d + b.d + c.d) / vec2f(asp, 1.0); w.f = (a.f + b.f + c.f) / vec2f(asp, 1.0); w.m = min(a.m + b.m + c.m, 1.0); w.e = a.e + b.e + c.e; w.gl = a.gl + 0.6 * b.gl + c.gl;
  return w;
}
fn frag(v: VOut) -> FOut { var o: FOut;
  let vv: vec2f = texLod(tVis, vec2f(0.5), 0.0).xy;
  let c: vec2f = v.uv - 0.5; let asp: f32 = U.camUp.w;
  // the skis rubbing on the snow shake the camera, not the glass: the scene is read a whole pixel or so aside (07c_feel.js; never a part
  // of one, which would soften it) and turned by a hair about the middle of the frame. Beads, flare and the dark corners stay where they are
  let sk: vec2f = M.sh.xy + M.sh.z * vec2f(-c.y / asp, c.x * asp);
  // (the sharp picture is read a little way off inside a bead, the glow from well beyond it: a bead takes in a wide field)
  var uv: vec2f = v.uv + sk; var uvb: vec2f = uv; var wt: Wet = wetNone();
  if (M.w.x > 0.004) { wt = lensWet(v.uv); uv += wt.d; uvb = clamp(uvb + wt.f, vec2f(0.0), vec2f(1.0)); }
  var col: vec3f = texLod(tScene, uv, 0.0).rgb;
  // at speed the glass shows its faults: toward the sides of the frame red and blue part company. (Two more looks at the scene, and only
  // then; the middle of the picture and the skier are not touched)
  if (M.r.w > 0.004) {
    let cp: vec2f = c * vec2f(asp, 1.0); let off: vec2f = c * (dot(cp, cp) / (0.25 * (asp * asp + 1.0)) * M.w.w * M.r.w);
    col = vec3f(texLod(tScene, uv - off, 0.0).r, col.g, texLod(tScene, uv + off, 0.0).b);
  }
  let bloom: vec3f = texLod(tBloom, uvb, 0.0).rgb * M.p.y;
  // (slow motion blooms a touch more; water on the glass is far out of focus, and what it shows is mostly glow)
  col = mix(col, bloom, min(0.06 + 0.04 * M.r.z + 0.72 * wt.m, 1.0));
  if (wt.m > 0.0) {
    // snow that has only just landed is still white (lit through from in front when the lens looks at the sun); melted, it holds the sun's
    // light. (It only ever adds light: against anything brighter than itself, the nebula say, a crumb does not show)
    let rs: f32 = length((U.sunScr.xy - v.uv) * vec2f(asp, 1.0));
    col = mix(col, max(col, U.ambSky.rgb * 1.2 + U.sunCol.rgb * (0.35 * vv.x)), M.wb.z * wt.m);
    col = col * (1.0 + 0.45 * wt.e * (1.0 - M.wb.z) * (0.4 + 0.6 * vv.x)) + U.sunCol.rgb * (vv.x * M.q.z * (0.6 * wt.gl + wt.m * (0.015 + 0.14 * exp(-rs * 2.4))));
  }
  col += lensFlare(v.uv, vv) * M.q.z;
  // white balance toward the low sun (sunlit snow a warm white, sky-lit shadows properly blue), exposure, then the film curve.
  // chroma is pushed a little before the curve (deep sky, rich shadows) and again after it.
  col *= vec3f(0.93, 1.0, 1.10) * M.p.x;
  // path to white: film and the eye lose colour as light nears their top, so backlit spray, a sunlit cloud edge or the glare round the sun
  // go gold at their rims and white where they are densest, never a saturated yellow "fire" (the curve works per channel, and red and green
  // reach its shoulder together long before blue does). Graded on brightness, so the warm snow of the low sun keeps its colour and the deep
  // blue and violet lights of the night (bright but dim to the eye) are hardly touched. M.sh.w: how strongly (Post.white, Variants 'hi'; 0 = as before)
  let l0: f32 = luma(col); let wk: f32 = M.sh.w * smoothstep(0.35, 1.5, l0);
  col = max(vec3f(l0) + (col - vec3f(l0)) * mix(M.q.x, 1.0, wk), vec3f(0.0));
  col = mix(col, vec3f(l0), 0.75 * wk);
  col = filmCurve(col);
  let l: f32 = luma(col);
  col = max(mix(vec3f(l), col, mix(M.q.y, 1.0, wk)), vec3f(0.0));
  // the ghosts lie over the finished picture as a faint veil of colour, whatever is behind them: through the film curve they would glare on
  // the dark trees and the skier and be lost on the snow, which is most of the frame. Only while the sun's disc is in sight, so a ridge, a
  // tree or the skier put them out (and much less of them from the moon)
  if (vv.x * M.wb.w > 0.0005) { col += lensGhosts(v.uv) * vec3f(0.93, 1.0, 1.10) * (M.p.x * M.q.z * M.wb.w * vv.x); }
  // the lens falls off toward its corners (a wide one loses a good deal more than this). At speed, and while time is held back, the far
  // sides of the frame close in as well: blinkers, not a tunnel, so the sky over the skier and the snow under the skis keep their light
  let e2: f32 = 3.0 * c.x * c.x + c.y * c.y;
  col *= 1.0 - 0.34 * smoothstep(0.20, 0.95, dot(c, c) * 2.0) - (0.15 * M.r.w + 0.12 * M.r.z) * smoothstep(0.35, 1.0, e2);
  col = toSRGB(saturate(col));
  col += (ign(v.clip.xy) - 0.5) / 255.0;
  o.color = vec4f(col, 1.0); return o; }
`;
