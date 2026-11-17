// 人物实验室: the game's skier drawn by the game itself: Skier.build / Skier.update / Skier.draw and its own shader (cloth, seams, glove, helmet,
// pack, boots, the 'kit' and 'hand' switches), through the game's own WebGL2 layer (01_gfx.js), with its own sun-side shadow map. Only the stage is
// this page's: a patch of snow, a sky colour, a fixed exposure and a plain tone curve.
(function () {
  const cv = document.getElementById('cv'), busy = document.getElementById('busy');
  const st = { hand: 'b', kit: 'b', pose: 'stand', look: 'handR', sun: 'side' };
  try { const q = new URLSearchParams(location.search); for (const k of Object.keys(st)) if (q.get(k)) st[k] = q.get(k); } catch (e) {}
  const gfx = createGL(cv);
  if (!gfx) { busy.textContent = '这个浏览器不支持 WebGL2'; return; }
  App.gfx = gfx;

  const POSES = {
    stand: () => ({ crouch: 0.21 }),
    turnL: () => ({ lean: -0.55, edge: -0.6, crouch: 0.35 }),
    turnR: () => ({ lean: 0.55, edge: 0.6, crouch: 0.35 }),
    tuck: () => ({ tuck: 1, crouch: 0.6 }),
    semi: () => ({ tuck: 0.5, crouch: 0.45 }),
    plant: () => ({ plantL: 1, lean: -0.3, edge: -0.3, crouch: 0.3 }),
    air: () => ({ air: 1, crouch: 0.3 }),
    carve: t => { const a = t * 1.6, s = Math.sin(a), c = Math.cos(a); return { lean: 0.55 * s, edge: 0.6 * s, crouch: 0.3 + 0.12 * Math.abs(c), plantL: s < 0 ? Math.max(0, c) * 0.8 : 0, plantR: s > 0 ? Math.max(0, -c) * 0.8 : 0 }; },
  };
  const SUNS = { side: [0.75, 0.55, -0.35], front: [0.15, 0.6, -0.8], back: [-0.2, 0.55, 0.8], low: [0.85, 0.22, -0.3] };
  const pose = {}, root = { pos: [0, 0, 0], fwd: [0, 0, -1], nrm: [0, 1, 0] };

  const setVariants = () => { Variants.val.body = 'b'; Variants.val.hand = st.hand; Variants.val.kit = st.kit; if ('ride' in Variants.val) Variants.val.ride = 'a'; };
  setVariants();

  // ---- stage
  let shadowTex, shadowT, skyTex, hdr, hdrDepth, hdrT, ground, gvb, gib, comp, W = 0, H = 0, SS = 2;
  const G = new Float32Array(GLOBALS_SIZE);
  function makeTargets() {
    const w = Math.max(1, Math.round(cv.width * SS)), h = Math.max(1, Math.round(cv.height * SS));
    if (hdrT) { gfx.destroyTarget(hdrT); gfx.destroyTexture(hdr); gfx.destroyTexture(hdrDepth); }
    hdr = gfx.texture({ w, h, format: 'rgba16f', filter: 'linear' }); hdrDepth = gfx.texture({ w, h, format: 'depth', filter: 'nearest' });
    hdrT = gfx.target({ color: hdr, depth: hdrDepth }); W = w; H = h;
  }
  function stage() {
    makeNoiseTextures(gfx);
    shadowTex = gfx.texture({ w: 2048, h: 2048, format: 'depth', compare: true, filter: 'linear' }); shadowT = gfx.target({ depth: shadowTex });
    const n = 4, sd = new Float32Array(n * n * 4); for (let i = 0; i < n * n; i++) sd.set([0.0032, 0.0048, 0.0078, 1], i * 4);
    skyTex = gfx.texture({ w: n, h: n, format: 'rgba32f', filter: 'nearest', data: sd });
    gvb = gfx.buffer(new Float32Array([-30, 0, -30, 30, 0, -30, 30, 0, 30, -30, 0, 30]), 'vertex'); gib = gfx.buffer(new Uint32Array([0, 2, 1, 0, 3, 2]), 'index');
    ground = gfx.pipeline({ name: 'labGround', lib: [SL.common, SL.hash, SL.shadow], buffers: [{ attrs: [['pos', 'vec3f']] }], varyings: { wp: 'vec3f' }, uniforms: { p: 'vec4f' }, textures: { tShadow: 'shadow' }, cull: 'none',
      vs: `fn vert(a: VIn) -> VOut { var v: VOut; v.wp = a.pos; v.clip = U.viewProj * vec4f(a.pos, 1.0); return v; }`,
      fs: `fn frag(v: VOut) -> FOut { var o: FOut;
  let sh: f32 = shadowAt(v.wp + vec3f(0.0, 0.004, 0.0), 0.0016);
  let alb: vec3f = vec3f(0.86, 0.89, 0.93);
  var col: vec3f = alb * (U.sunCol.rgb * sh * max(U.sunDir.y, 0.0) + U.ambSky.rgb * 0.9);
  let r: f32 = length(v.wp.xz); col = mix(col, U.ambSky.rgb * 2.2, smoothstep(4.0, 25.0, r));
  o.color = vec4f(col, 1.0); return o; }` });
    comp = gfx.pipeline({ name: 'labOut', lib: [SL.common, SL.tonemap], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f' }, textures: { tA: '2d' }, colorFormat: 'canvas', depth: false, depthTest: false, cull: 'none', vs: VS_FULLSCREEN,
      fs: `fn frag(v: VOut) -> FOut { var o: FOut;
  let d: vec2f = M.p.xy * M.p.w;
  let c: vec3f = (texLod(tA, v.uv + vec2f(-d.x, -d.y), 0.0).rgb + texLod(tA, v.uv + vec2f(d.x, -d.y), 0.0).rgb + texLod(tA, v.uv + vec2f(-d.x, d.y), 0.0).rgb + texLod(tA, v.uv + vec2f(d.x, d.y), 0.0).rgb) * 0.25;
  o.color = vec4f(toSRGB(filmCurve(c * M.p.z)), 1.0); return o; }` });
  }

  function globals(eye, at, fov, t) {
    const aspect = cv.width / cv.height, near = 0.01, far = 80;
    const proj = m4.perspective(fov, aspect, near, far), view = m4.lookAt(eye, at, [0, 1, 0]), vp = m4.mul(proj, view);
    const f = v3.norm(v3.sub(at, eye)), r = v3.norm(v3.cross(f, [0, 1, 0])), u = v3.cross(r, f), th = Math.tan(fov / 2);
    G.fill(0);
    G.set(vp, GOFF.viewProj); G.set(m4.invert(vp), GOFF.invViewProj); G.set(vp, GOFF.prevViewProj);
    G.set([eye[0], eye[1], eye[2], t], GOFF.camPos); G.set([...r, th], GOFF.camRight); G.set([...u, aspect], GOFF.camUp); G.set([...f, near], GOFF.camFwd);
    const sun = v3.norm(SUNS[st.sun] || SUNS.side), low = st.sun === 'low';
    G.set([...sun, 1], GOFF.sunDir); G.set(low ? [5.7, 4.3, 2.9, 260] : [5.4, 5.0, 4.5, 260], GOFF.sunCol);
    G.set([0.30, 0.42, 0.70, 0.2], GOFF.ambSky); G.set([1.10, 1.06, 1.02, 0], GOFF.ambGnd);
    G.set([0, 1 / 900, -700, 9000], GOFF.fogA); G.set([W, H, 1 / W, 1 / H], GOFF.res); G.set([0, 0, 0, Math.floor(t * 60)], GOFF.origin);
    G.set([0, 0, 1 / 60, 1.4], GOFF.misc); G.set([0, 0, 0, 0], GOFF.player); G.set([0, 1, 0, 1], GOFF.fx); G.set([22, 0, 0, 0], GOFF.skyP);
    G.set([0, 0, 0, 0.6], GOFF.cloudP); G.set([0, 0, 0, 0], GOFF.twi); G.set([0, 0, 0, 0], GOFF.lamp); G.set([0, -1, 0, 1], GOFF.lampDir);
    // the sun's shadow map: a small box round the figure, so a texel is about a millimetre and a finger casts a shadow
    const c = [0, 0.9, -0.1], lz = sun, lx = v3.norm(v3.cross([0, 1, 0], lz)), ly = v3.cross(lz, lx), le = v3.add(c, v3.mul(lz, 3));
    const lview = [lx[0], ly[0], lz[0], 0, lx[1], ly[1], lz[1], 0, lx[2], ly[2], lz[2], 0, -v3.dot(lx, le), -v3.dot(ly, le), -v3.dot(lz, le), 1];
    G.set(m4.mul(m4.ortho(-1.4, 1.4, -1.4, 1.4, 0.5, 6), lview), GOFF.shadowVP);
    gfx.setGlobals(G);
  }

  // ---- camera: orbit round the look's target
  const cam = { yaw: Math.PI * 0.72, pitch: 0.2, dist: 0.42 };
  const LOOKS = { body: [2.6, 0.15, 0], handR: [0.40, 0.2, Math.PI * 0.72], handL: [0.40, 0.2, -Math.PI * 0.72], head: [0.55, 0.15, 0.6], pack: [0.85, 0.25, 0.15], boot: [0.6, 0.25, Math.PI * 0.62], front: [2.6, 0.12, Math.PI] };
  function setLook(k) { st.look = k; const l = LOOKS[k] || LOOKS.body; cam.dist = l[0]; cam.pitch = l[1]; cam.yaw = l[2]; }
  const pts = new Map();
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); });
  cv.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 1) { cam.yaw -= (e.clientX - prev[0]) * 0.008; cam.pitch = Math.max(-1.2, Math.min(1.45, cam.pitch + (e.clientY - prev[1]) * 0.006)); }
    else if (pts.size === 2) { const o = [...pts.entries()].find(([k]) => k !== e.pointerId)[1], d1 = Math.hypot(prev[0] - o[0], prev[1] - o[1]), d2 = Math.hypot(e.clientX - o[0], e.clientY - o[1]); if (d2 > 0) cam.dist = Math.max(0.1, Math.min(8, cam.dist * d1 / d2)); }
  });
  const up = e => pts.delete(e.pointerId); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { e.preventDefault(); cam.dist = Math.max(0.1, Math.min(8, cam.dist * Math.exp(e.deltaY * 0.0012))); }, { passive: false });

  function syncUI() { document.querySelectorAll('#ui button').forEach(b => b.classList.toggle('on', st[b.dataset.k] === b.dataset.v)); }
  document.querySelectorAll('#ui button').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.k, v = b.dataset.v;
    if (k === 'look') { setLook(v); syncUI(); return; }
    st[k] = v; syncUI();
    if (k === 'hand') { busy.style.display = 'flex'; setTimeout(() => { setVariants(); Skier.want(); busy.style.display = 'none'; }, 30); } else setVariants();
  }));

  let tgt = null, t0 = performance.now();
  function frame(now) {
    const t = (now - t0) / 1000; App.t = t;
    const dpr = Math.min(window.devicePixelRatio || 1, 2), cw = Math.round(cv.clientWidth * dpr), ch = Math.round(cv.clientHeight * dpr);
    if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; SS = dpr >= 1.75 ? 1 : 1.5; makeTargets(); }
    for (const k in pose) delete pose[k]; Object.assign(pose, (POSES[st.pose] || POSES.stand)(t));
    Skier.update(root, pose, [0, 0, 0]);
    const jj = lastJ();
    const want = st.look === 'handR' ? jj.gripR : st.look === 'handL' ? jj.gripL : st.look === 'head' ? jj.skull || jj.head : st.look === 'pack' ? jj.chest : st.look === 'boot' ? jj.footR : [0, 0.95, 0];
    tgt = tgt ? tgt.map((v, i) => v + (want[i] - v) * 0.12) : want.slice();
    const cp = Math.cos(cam.pitch), eye = [tgt[0] + Math.sin(cam.yaw) * cp * cam.dist, tgt[1] + Math.sin(cam.pitch) * cam.dist, tgt[2] + Math.cos(cam.yaw) * cp * cam.dist];
    globals(eye, tgt, cam.dist < 1.2 ? 0.55 : 0.7, t);
    gfx.beginFrame();
    gfx.beginPass(shadowT, { depth: 1 }); Skier.drawShadow(); gfx.endPass();
    gfx.beginPass(hdrT, { color: [0.9, 1.15, 1.6, 1], depth: 1 });
    gfx.draw(ground, { u: { p: [0, 0, 0, 0] }, tex: { tShadow: shadowTex }, vb: [gvb], ib: gib, count: 6 });
    Skier.draw(shadowTex, skyTex);
    gfx.endPass();
    gfx.beginPass(null, {}); gfx.draw(comp, { u: { p: [1 / W, 1 / H, 0.22, SS > 1.2 ? 0.25 : 0.0] }, tex: { tA: hdr }, count: 3 }); gfx.endPass();
    if (gfx.endFrame) gfx.endFrame();
    requestAnimationFrame(frame);
  }
  // where the joints are now, in the world (the figure stands at the origin facing -z, so model space is world space)
  function lastJ() { const q = Skier.skin(Object.assign({}, pose), Object.assign({}, Skier.SEC0)); return q.J; }

  setTimeout(() => {
    try {
      stage(); Skier.init(gfx);
      setLook(st.look); syncUI(); busy.style.display = 'none';
      cv.width = 0; requestAnimationFrame(t => { frame(t); console.log('skierlab ready', JSON.stringify({ hand: Skier.mesh && Skier.mesh.hand, nv: Skier.mesh && Skier.mesh.nv })); });
    } catch (e) { busy.textContent = '出错了：' + e.message; console.error(e); }
  }, 30);
})();
