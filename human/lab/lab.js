// ---------------------------------------------------------------- 人体实验室 (the human lab): look at the body, pose it, compare the skinning
// Everything on this page is computed by the code in human/src: no model files. Drag to turn the body, wheel or pinch to zoom.
(() => {
  const V = Human.v3, Q = Human.q;
  const $ = s => document.querySelector(s);
  const cv = $('#gl'), gl = cv.getContext('webgl2', { antialias: true, alpha: false });
  const st = {
    params: Object.assign({}, Human.DEFAULTS), mode: 'c', look: 'skin', pose: 'apose', auto: false, spin: true,
    yaw: -0.5, pitch: 0.1, dist: 3.4, target: [0, 0.92, 0], built: null, anim: null, cache: new Map(), busy: false,
  };
  window.__lab = st;

  // ---------------------------------------------------------------- GL
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = (vs, fs) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; };
  const BODY_VS = `#version 300 es
  layout(location=0) in vec3 aP; layout(location=1) in vec3 aN; layout(location=2) in float aAO; layout(location=3) in vec3 aC;
  uniform mat4 uVP; out vec3 vP; out vec3 vN; out float vAO; out vec3 vC;
  void main(){ vP = aP; vN = aN; vAO = aAO; vC = aC; gl_Position = uVP * vec4(aP, 1.0); }`;
  // skin: diffuse with a red-shifted wrap (light scattered under the skin reaches further into the shadow in red than in blue: an
  // approximation of pre-integrated subsurface scattering, Penner 2011), two GGX lobes at F0 0.028 (skin's index of refraction ~1.4),
  // sky / ground ambient with the baked occlusion, a soft rim
  const BODY_FS = `#version 300 es
  precision highp float;
  in vec3 vP; in vec3 vN; in float vAO; in vec3 vC; out vec4 o;
  uniform vec3 uCam; uniform int uLook; uniform vec3 uL1; uniform vec3 uL2;
  float ggx(float nh, float a){ float a2 = a*a; float d = nh*nh*(a2-1.0)+1.0; return a2/(3.14159*d*d); }
  float vis(float nl, float nv, float a){ float k = a*0.5; return 0.25/((nl*(1.0-k)+k)*(nv*(1.0-k)+k)); }
  vec3 wrapd(float nl, vec3 w){ return clamp((vec3(nl)+w)/((1.0+w)*(1.0+w)), 0.0, 1.0); }
  void main(){
    vec3 n = normalize(vN); vec3 v = normalize(uCam - vP);
    if (dot(n, v) < 0.0) n = -n;
    vec3 alb; float r1 = 0.52, r2 = 0.30, spec = 1.0; vec3 w = vec3(0.0);
    if (uLook == 0) { alb = vec3(0.56, 0.34, 0.25); w = vec3(0.50, 0.24, 0.16); }
    else if (uLook == 1) { alb = vec3(0.62, 0.61, 0.59); r1 = 0.75; r2 = 0.6; spec = 0.4; }
    else { alb = vC; r1 = 0.7; spec = 0.3; }
    vec3 col = vec3(0.0);
    vec3 Ls[2]; Ls[0] = uL1; Ls[1] = uL2; vec3 Lc[2]; Lc[0] = vec3(3.4, 3.1, 2.75); Lc[1] = vec3(0.45, 0.55, 0.75);
    for (int i = 0; i < 2; i++) {
      vec3 l = normalize(Ls[i]); vec3 h = normalize(l + v);
      float nl = dot(n, l), nlc = max(nl, 0.0), nv = max(dot(n, v), 1e-3), nh = max(dot(n, h), 0.0), vh = max(dot(v, h), 0.0);
      vec3 d = alb * wrapd(nl, w) / 3.14159;
      float F = 0.028 + (1.0 - 0.028) * pow(1.0 - vh, 5.0);
      float s = (0.85 * ggx(nh, r1*r1) * vis(nlc, nv, r1*r1) + 0.15 * ggx(nh, r2*r2) * vis(nlc, nv, r2*r2)) * F * nlc * spec;
      col += Lc[i] * (d + s);
    }
    float up = n.y * 0.5 + 0.5;
    vec3 amb = mix(vec3(0.10, 0.085, 0.075), vec3(0.30, 0.34, 0.40), up) * alb * vAO;
    col += amb;
    float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0) * 0.18 * vAO; col += rim * vec3(0.7, 0.75, 0.85);
    col *= mix(0.35, 1.0, vAO);
    col = col / (col + vec3(0.62)) * 1.25;            // soft tone curve
    o = vec4(pow(col, vec3(1.0/2.2)), 1.0);
  }`;
  const FLOOR_VS = `#version 300 es
  layout(location=0) in vec2 aP; uniform mat4 uVP; out vec2 vP; void main(){ vP = aP; gl_Position = uVP * vec4(aP.x, 0.0, aP.y, 1.0); }`;
  const FLOOR_FS = `#version 300 es
  precision highp float; in vec2 vP; out vec4 o; uniform vec4 uFeet; uniform vec3 uBody;
  void main(){
    float r = length(vP); float g = 0.90 - 0.06 * smoothstep(0.0, 6.0, r);
    // contact shadow: soft blobs under the feet and a wide one under the body
    float s = 0.0; s += 0.35 * exp(-dot(vP - uFeet.xy, vP - uFeet.xy) / 0.006); s += 0.35 * exp(-dot(vP - uFeet.zw, vP - uFeet.zw) / 0.006);
    s += 0.22 * exp(-dot(vP - uBody.xy, vP - uBody.xy) / (0.08 + uBody.z));
    float grid = 0.0; vec2 q = abs(fract(vP * 2.0) - 0.5); grid = (1.0 - smoothstep(0.0, 0.012, min(q.x, q.y))) * 0.05 * (1.0 - smoothstep(1.0, 3.0, r));
    vec3 c = vec3(g) * (1.0 - min(s, 0.6)) - grid;
    o = vec4(pow(c * vec3(0.97, 0.98, 1.0), vec3(1.0)), 1.0);
  }`;
  const pBody = prog(BODY_VS, BODY_FS), pFloor = prog(FLOOR_VS, FLOOR_FS);
  const U = (p, n) => gl.getUniformLocation(p, n);
  const vao = gl.createVertexArray(), bufP = gl.createBuffer(), bufN = gl.createBuffer(), bufA = gl.createBuffer(), bufC = gl.createBuffer(), bufI = gl.createBuffer();
  const fvao = gl.createVertexArray(), fbuf = gl.createBuffer();
  gl.bindVertexArray(fvao); gl.bindBuffer(gl.ARRAY_BUFFER, fbuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-30, -30, 30, -30, 30, 30, -30, -30, 30, 30, -30, 30]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null);
  // skis / snowboard: a few boxes rebuilt every frame
  const gvao = gl.createVertexArray(), gbufP = gl.createBuffer(), gbufN = gl.createBuffer(); let gearN = 0;
  gl.bindVertexArray(gvao); gl.bindBuffer(gl.ARRAY_BUFFER, gbufP); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, gbufN); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null);
  function gearMesh(boxes) {
    const P = [], N = [];
    for (const b of boxes) { const A = [V.mul(b.ax, b.L / 2), V.mul(b.n, b.T / 2), V.mul(b.side, b.W / 2)];
      for (let a = 0; a < 3; a++) for (const sg of [1, -1]) { const n = V.mul(A[a], sg), u = A[(a + 1) % 3], w = A[(a + 2) % 3], nn = V.norm(n);
        for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]]) { P.push(...V.add(b.c, V.add(n, V.add(V.mul(u, i), V.mul(w, j))))); N.push(...nn); } } }
    gearN = P.length / 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, gbufP); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(P), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, gbufN); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(N), gl.DYNAMIC_DRAW);
  }
  function upload(m) {
    gl.bindVertexArray(vao);
    const at = (buf, loc, n, data, usage) => { gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, data, usage); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0); };
    at(bufP, 0, 3, m.pos, gl.DYNAMIC_DRAW); at(bufN, 1, 3, m.nrm, gl.DYNAMIC_DRAW); at(bufA, 2, 1, m.ao, gl.STATIC_DRAW); at(bufC, 3, 3, m.col, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufI); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.idx, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
  }
  const persp = (fy, as, n, f) => { const t = 1 / Math.tan(fy / 2); return [t / as, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; };
  const look = (e, c, u) => { const z = V.norm(V.sub(e, c)), x = V.norm(V.cross(u, z)), y = V.cross(z, x); return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -V.dot(x, e), -V.dot(y, e), -V.dot(z, e), 1]; };
  const mm = (a, b) => { const o = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k]; return o; };

  // ---------------------------------------------------------------- building a body
  const tick = () => new Promise(r => setTimeout(r, 16));
  const status = t => { $('#status').textContent = t || ''; $('#status').style.opacity = t ? 1 : 0; };
  async function build() {
    if (st.busy) return; st.busy = true; const T = {}; let t = performance.now();
    status('测量与校准体型…'); await tick();
    const M = Human.measure(st.params), sk = Human.Skeleton.build(M), body = Human.Measure.calibrate(sk); T.calib = performance.now() - t; t = performance.now();
    status('生成表面…'); await tick();
    const bindPose = Human.bindPose(), bind = Human.Skeleton.pose(sk, bindPose), cB = Human.Body.prepare(body, bind);
    const mesh = Human.Mesh.mesh(cB, st.params.cell || 0.0075); T.mesh = performance.now() - t; t = performance.now();
    status('计算蒙皮权重…'); await tick();
    const W = Human.Skin.weights(body, mesh, cB); mesh.adj = mesh.adj || Human.Mesh.adjacency(mesh.nv, mesh.idx); T.weights = performance.now() - t; t = performance.now();
    // ambient occlusion from the field: how open the space is just above each point
    const nrm0 = Human.Mesh.normals(mesh.pos, mesh.idx), ao = new Float32Array(mesh.nv);
    for (let v = 0; v < mesh.nv; v++) { let occ = 0; const p = [mesh.pos[v * 3], mesh.pos[v * 3 + 1], mesh.pos[v * 3 + 2]], n = [nrm0[v * 3], nrm0[v * 3 + 1], nrm0[v * 3 + 2]];
      for (const [h, w] of [[0.012, 1], [0.03, 0.6], [0.07, 0.3]]) { const d = Human.Body.dist(cB, p[0] + n[0] * h, p[1] + n[1] * h, p[2] + n[2] * h, 0, {}); occ += w * Math.max(0, (h - d) / h); }
      ao[v] = Math.max(0.25, 1 - occ * 0.55); }
    T.ao = performance.now() - t;
    const vol0 = Human.Mesh.volume(mesh.pos, mesh.idx);
    // colour for the weight view: each bone a hue, blended by weight
    const hue = b => { const h = (b * 0.618034) % 1, f = k => { const x = (k + h * 6) % 6; return 0.35 + 0.55 * Math.max(0, Math.min(1, Math.min(x, 4 - x))); }; return [f(5), f(3), f(1)]; };
    const wcol = new Float32Array(mesh.nv * 3); for (let v = 0; v < mesh.nv; v++) for (let k = 0; k < 4; k++) { const w = W.bw[v * 4 + k], c = hue(W.bi[v * 4 + k]); wcol[v * 3] += w * c[0]; wcol[v * 3 + 1] += w * c[1]; wcol[v * 3 + 2] += w * c[2]; }
    const g = { M, sk, body, bind, mesh, W, T, ao, vol0, wcol, pos: new Float32Array(mesh.pos), nrm: new Float32Array(nrm0), col: new Float32Array(wcol), idx: mesh.idx };
    st.built = g; st.cache.clear();
    upload({ pos: g.pos, nrm: g.nrm, ao, col: g.col, idx: mesh.idx });
    status(''); st.busy = false;
    const playing = st.clip && st.clip.clip.name; st.clip = null;
    st.cur = poseOf(st.pose); st.from = st.cur; st.anim = null; await settle();
    panel(); if (playing || st.startClip) { playClip(playing || st.startClip, st.capture); st.startClip = null; }
  }
  const poseOf = name => Human.Motion.ground(st.built.sk, (Human.POSES.find(p => p.name === name) || Human.POSES[0]).pose);

  // ---------------------------------------------------------------- posing
  // the projection (mode c) for a pose: its displacements, kept in the frame of each vertex's main bone so that they turn with the limb while the
  // body moves between poses
  function projectionFor(name, anat) {
    const g = st.built, key = name + '|' + st.mode; if (st.cache.has(key)) return st.cache.get(key);
    const xf = Human.Skeleton.pose(g.sk, anat), dqs = Human.Skin.deform(g.mesh, g.W, xf, g.bind, 'b');
    const c = Human.Body.prepare(g.body, xf), r = Human.Skin.project(c, dqs, g.W, { adj: g.mesh.adj });
    const nv = g.mesh.nv, loc = new Float32Array(nv * 3);
    for (let v = 0; v < nv; v++) { const b = g.W.bi[v * 4], q = Q.conj(xf.R[b]), d = Q.rot(q, [r.pos[v * 3] - dqs[v * 3], r.pos[v * 3 + 1] - dqs[v * 3 + 1], r.pos[v * 3 + 2] - dqs[v * 3 + 2]]); loc[v * 3] = d[0]; loc[v * 3 + 1] = d[1]; loc[v * 3 + 2] = d[2]; }
    const vol = Human.Mesh.volume(r.pos, g.mesh.idx);
    const out = { loc, over: xf.over, vol }; st.cache.set(key, out); return out;
  }
  function apply(anat, fromP, toP, t) {
    const g = st.built, xf = Human.Skeleton.pose(g.sk, anat), nv = g.mesh.nv;
    const pos = Human.Skin.deform(g.mesh, g.W, xf, g.bind, st.mode === 'a' ? 'a' : 'b', g.pos);
    if (st.mode === 'c' && toP) {
      for (let v = 0; v < nv; v++) { const b = g.W.bi[v * 4], o = v * 3;
        const lx = fromP ? fromP.loc[o] + (toP.loc[o] - fromP.loc[o]) * t : toP.loc[o] * t, ly = fromP ? fromP.loc[o + 1] + (toP.loc[o + 1] - fromP.loc[o + 1]) * t : toP.loc[o + 1] * t, lz = fromP ? fromP.loc[o + 2] + (toP.loc[o + 2] - fromP.loc[o + 2]) * t : toP.loc[o + 2] * t;
        if (lx === 0 && ly === 0 && lz === 0) continue; const d = Q.rot(xf.R[b], [lx, ly, lz]); pos[o] += d[0]; pos[o + 1] += d[1]; pos[o + 2] += d[2]; }
    }
    Human.Mesh.normals(pos, g.mesh.idx, g.nrm);
    if (st.look === 'disp' && toP) { for (let v = 0; v < nv; v++) { const o = v * 3, m = Math.hypot(toP.loc[o], toP.loc[o + 1], toP.loc[o + 2]) * t, k = Math.min(1, m / 0.012);
      g.col[o] = 0.55 + 0.4 * k; g.col[o + 1] = 0.58 - 0.25 * k; g.col[o + 2] = 0.62 - 0.45 * k; } }
    else g.col.set(g.wcol);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufP); gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufN); gl.bufferSubData(gl.ARRAY_BUFFER, 0, g.nrm);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufC); gl.bufferSubData(gl.ARRAY_BUFFER, 0, g.col);
    g.xf = xf;
  }
  async function settle() {
    const g = st.built; if (!g) return;
    let P = null; if (st.mode === 'c') { status('体积投影…'); await tick(); P = projectionFor(st.pose, st.cur); status(''); }
    st.curP = P; apply(st.cur, null, P, 1); metrics();
  }
  async function goPose(name) {
    if (!st.built || st.busy) return;
    const to = poseOf(name);
    let P = null; if (st.mode === 'c') { if (!st.cache.has(name + '|c')) { status('体积投影…'); await tick(); } P = projectionFor(name, to); status(''); }
    st.anim = { from: st.cur, to, fromP: st.curP, toP: P, t0: st.capture ? st.clock || 0 : performance.now(), dur: st.poseDur || 900, name };
    st.pose = name; panel();
  }

  // ---------------------------------------------------------------- clips (Human.Motion): the pose is sampled every frame; in mode c the
  // projection is worked out at a few phases of the clip (one per frame, while it already plays) and blended between them
  function playClip(name, sync) {
    const clip = Human.Motion.CLIPS.find(c => c.name === name); if (!clip || !st.built || st.busy) return;
    const K = Math.max(8, Math.min(24, Math.round(clip.dur * 8)));
    st.clip = { clip, K, t0: st.capture ? st.clock || 0 : performance.now() }; st.anim = null; st.auto = false; st.pose = ''; panel();
    if (sync && st.mode === 'c') for (let k = 0; k < K; k++) clipProj(k);
  }
  const clipProj = k => { const c = st.clip; return projectionFor(c.clip.name + '#' + k, Human.Motion.sample(st.built.sk, c.clip, c.clip.dur * k / c.K)); };
  function clipFrame(now) {
    const c = st.clip, g = st.built, t = (now - c.t0) / 1000 * (st.slow ? 0.25 : 1), u = ((t / c.clip.dur) % 1 + 1) % 1;
    st.cur = Human.Motion.sample(g.sk, c.clip, t);
    if (st.mode !== 'c') { st.curP = null; apply(st.cur, null, null, 1); return; }
    const x = u * c.K, i = Math.floor(x) % c.K, j = (i + 1) % c.K, has = k => st.cache.has(c.clip.name + '#' + k + '|c');
    if (has(i) && has(j)) { st.curP = clipProj(j); apply(st.cur, clipProj(i), st.curP, x - Math.floor(x)); status(''); }
    else { st.curP = null; apply(st.cur, null, null, 1); let n = 0; for (let k = 0; k < c.K; k++) if (has(k)) n++;
      status('体积投影 ' + n + ' / ' + c.K + '…'); clipProj(has(i) ? j : i); }
  }

  // ---------------------------------------------------------------- frame
  function frame(now) {
    if (!st.capture) requestAnimationFrame(frame);
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const g = st.built;
    if (g && st.clip && !st.busy) clipFrame(now);
    else if (g && st.anim) {
      const a = st.anim, u = Math.min(1, (now - a.t0) / a.dur), s = u * u * (3 - 2 * u);
      st.cur = Human.lerpPose(a.from, a.to, s);
      apply(st.cur, a.fromP, a.toP, s);
      if (u >= 1) { st.anim = null; st.cur = a.to; st.curP = a.toP; metrics(); }
    }
    if (st.auto && g && !st.anim && !st.busy && now - (st.autoT || 0) > 1600) { st.autoT = now; const i = Human.POSES.findIndex(p => p.name === st.pose); goPose(Human.POSES[(i + 1) % Human.POSES.length].name); }
    if (st.spin && !st.drag) st.yaw += 0.0025;
    gl.viewport(0, 0, cv.width, cv.height); if (st.white) gl.clearColor(1, 1, 1, 1); else gl.clearColor(0.86, 0.865, 0.875, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
    // camera: orbit around the body's centre (followed smoothly)
    // framing: the camera keeps the whole posed skeleton in view (followed smoothly)
    if (g && g.xf) { let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (const p of g.xf.P) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], p[a]); hi[a] = Math.max(hi[a], p[a]); }
      hi[1] += 0.12; lo[1] = Math.min(lo[1], 0); const c = V.lerp(lo, hi, 0.5), ext = Math.max(hi[1] - lo[1], 1.15 * Math.hypot(hi[0] - lo[0], hi[2] - lo[2]), 1.45);
      const k = st.capture ? 1 : 0.08; st.target = V.lerp(st.target, c, k); st.fit = (st.fit || ext) + (ext - (st.fit || ext)) * k; }
    if (st.lockT) { st.target = st.lockT; st.fit = 1.85; }                   // ?ty=1.3: a close-up at a fixed height
    const dist = st.dist * (st.fit || 1.85) / 1.85;
    const e = V.add(st.target, [Math.sin(st.yaw) * Math.cos(st.pitch) * dist, Math.sin(st.pitch) * dist, Math.cos(st.yaw) * Math.cos(st.pitch) * dist]);
    const PR = persp(st.fov || 0.62, cv.width / cv.height, 0.05, 200);
    // with the panel open on a wide screen, the body is drawn in the space to its right
    if (!document.body.classList.contains('hide') && cv.clientWidth > 700) PR[8] = -(320 / cv.clientWidth);
    const VP = mm(PR, look(e, st.target, [0, 1, 0]));
    // floor
    gl.useProgram(pFloor); gl.uniformMatrix4fv(U(pFloor, 'uVP'), false, VP);
    if (g && g.xf) { const I = g.sk.idx, a = g.xf.P[I.talus_L], b = g.xf.P[I.talus_R], p = g.xf.P[I.pelvis]; gl.uniform4f(U(pFloor, 'uFeet'), a[0], a[2] + 0.04, b[0], b[2] + 0.04); gl.uniform3f(U(pFloor, 'uBody'), p[0], p[2], Math.max(0, 0.9 - p[1]) * 0.1); }
    if (!st.white) { gl.bindVertexArray(fvao); gl.drawArrays(gl.TRIANGLES, 0, 6); }
    if (g) {
      gl.useProgram(pBody); gl.uniformMatrix4fv(U(pBody, 'uVP'), false, VP); gl.uniform3fv(U(pBody, 'uCam'), e);
      gl.uniform1i(U(pBody, 'uLook'), { skin: 0, clay: 1, weights: 2, disp: 2 }[st.look]);
      gl.uniform3f(U(pBody, 'uL1'), Math.sin(st.yaw + 0.9) * 0.8, 0.9, Math.cos(st.yaw + 0.9) * 0.8); gl.uniform3f(U(pBody, 'uL2'), Math.sin(st.yaw - 2.0), 0.3, Math.cos(st.yaw - 2.0));
      gl.bindVertexArray(vao); gl.drawElements(gl.TRIANGLES, g.idx.length, gl.UNSIGNED_INT, 0);
      const kind = st.clip && st.clip.clip.gear;
      if (kind && g.xf) { gearMesh(Human.Motion.gear(g.sk, g.xf, kind)); gl.uniform1i(U(pBody, 'uLook'), 2); gl.bindVertexArray(gvao); gl.vertexAttrib1f(2, 1); gl.vertexAttrib3f(3, 0.16, 0.2, 0.3); gl.disable(gl.CULL_FACE); gl.drawArrays(gl.TRIANGLES, 0, gearN); }
    }
  }

  // ---------------------------------------------------------------- panel
  const SL = [['sex', '性别（男 0 → 女 1）', 0, 1, 0.05], ['stature', '身高 m', 1.5, 2.0, 0.01], ['mass', '体重 kg', 45, 120, 1], ['bodyFat', '体脂 %', 6, 40, 1], ['frame', '骨架宽窄', -1, 1, 0.1], ['def', '肌肉线条', 0, 2, 0.1]];
  function panel() {
    const g = st.built;
    $('#poses').innerHTML = Human.POSES.map(p => `<button class="chip${p.name === st.pose ? ' on' : ''}" data-pose="${p.name}">${p.zh}</button>`).join('') +
      `<button class="chip${st.auto ? ' on' : ''}" id="auto">自动轮播</button>`;
    const cn = st.clip && st.clip.clip.name;
    $('#clips').innerHTML = [['daily', '日常'], ['ski', '双板滑雪'], ['board', '单板滑雪']].map(([k, l]) => `<span class="grp">${l}</span>` +
      Human.Motion.CLIPS.filter(c => c.group === k).map(c => `<button class="chip${c.name === cn ? ' on' : ''}" data-clip="${c.name}">${c.zh}</button>`).join('')).join('') +
      `<div class="row"><button class="chip${st.slow ? ' on' : ''}" id="slow">慢放 ¼</button></div>`;
    $('#modes').innerHTML = [['a', 'a 线性混合 LBS'], ['b', 'b 对偶四元数 DQS'], ['c', 'c DQS + 体积投影']].map(([k, l]) => `<button class="chip${st.mode === k ? ' on' : ''}" data-mode="${k}">${l}</button>`).join('');
    $('#looks').innerHTML = [['skin', '皮肤'], ['clay', '石膏'], ['weights', '蒙皮权重'], ['disp', '投影位移']].map(([k, l]) => `<button class="chip${st.look === k ? ' on' : ''}" data-look="${k}">${l}</button>`).join('') +
      `<button class="chip${st.spin ? ' on' : ''}" id="spin">转台</button>`;
    $('#sliders').innerHTML = SL.map(([k, l, a, b, s]) => `<label><span>${l}</span><input type="range" min="${a}" max="${b}" step="${s}" value="${st.params[k]}" data-k="${k}"><b>${(+st.params[k]).toFixed(s < 0.1 ? 2 : s < 1 ? 1 : 0)}</b></label>`).join('') +
      `<div class="row"><button class="chip" data-preset="male">男性平均</button><button class="chip" data-preset="female">女性平均</button><button class="chip go" id="rebuild">生成</button></div>`;
    metrics();
  }
  function metrics() {
    const g = st.built; if (!g) return;
    const G = g.body.girths, T = g.M.G, names = { chest: '胸围', waist: '腰围', buttock: '臀围', thigh: '大腿围', lowthigh: '膝上围', calf: '小腿围', ankle: '踝围', arm: '上臂围', forearm: '前臂围', wrist: '腕围', neck: '颈围' };
    const rows = Object.keys(names).map(k => `<tr><td>${names[k]}</td><td>${(G[k] / 10).toFixed(1)}</td><td>${(T[k] / 10).toFixed(1)}</td></tr>`).join('');
    const kg = g.vol0 * g.M.density, P = st.curP, volP = P && st.mode === 'c' ? P.vol : g.xf ? Human.Mesh.volume(g.pos, g.idx) : g.vol0;
    const over = g.xf && g.xf.over && g.xf.over.length ? g.xf.over.map(([k, v]) => `${k} 超出 ${v.toFixed(0)}°`).join('，') : '无';
    $('#metrics').innerHTML = `<table><tr><th>围度 cm</th><th>算出</th><th>ANSUR</th></tr>${rows}</table>
      <p>体积 ${g.vol0.toFixed(1)} L × 密度 ${g.M.density.toFixed(3)} = <b>${kg.toFixed(1)} kg</b>（设定 ${g.M.kg} kg）</p>
      <p>当前姿势体积变化 <b>${(100 * (volP / g.vol0 - 1)).toFixed(1)}%</b>（蒙皮 ${st.mode}）</p>
      <p>关节限制：${over}</p>
      <p class="dim">${g.mesh.nv} 顶点 · ${g.mesh.nt} 三角形 · ${g.sk.n} 根骨 · ${g.body.muscles.length} 块肌肉<br>校准 ${g.T.calib | 0} ms · 网格 ${g.T.mesh | 0} ms · 权重 ${g.T.weights | 0} ms</p>`;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.pose) { st.clip = null; status(''); goPose(b.dataset.pose); }
    else if (b.dataset.clip) playClip(b.dataset.clip);
    else if (b.id === 'slow') { const c = st.clip, now = performance.now(); if (c) { const t = (now - c.t0) * (st.slow ? 0.25 : 1); c.t0 = now - t / (st.slow ? 1 : 0.25); } st.slow = !st.slow; panel(); }
    else if (b.dataset.mode) { st.mode = b.dataset.mode; panel(); if (!st.clip) settle(); }
    else if (b.dataset.look) { st.look = b.dataset.look; panel(); if (st.built && !st.clip) apply(st.cur, null, st.curP, 1); }
    else if (b.id === 'auto') { st.auto = !st.auto; if (st.auto && st.clip) { st.clip = null; st.pose = 'apose'; goPose('apose'); } panel(); }
    else if (b.id === 'spin') { st.spin = !st.spin; panel(); }
    else if (b.dataset.preset) { st.params = Object.assign({}, Human.PRESETS[b.dataset.preset]); panel(); build(); }
    else if (b.id === 'rebuild') build();
    else if (b.id === 'toggle') document.body.classList.toggle('hide');
  });
  document.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; st.params[k] = +e.target.value; e.target.nextElementSibling.textContent = e.target.value; });
  // orbit
  let last = null, pinch = null;
  cv.addEventListener('pointerdown', e => { last = [e.clientX, e.clientY]; st.drag = true; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!last) return; st.yaw -= (e.clientX - last[0]) * 0.008; st.pitch = Math.max(-0.4, Math.min(1.2, st.pitch + (e.clientY - last[1]) * 0.006)); last = [e.clientX, e.clientY]; });
  cv.addEventListener('pointerup', () => { last = null; st.drag = false; });
  cv.addEventListener('wheel', e => { e.preventDefault(); st.dist = Math.max(0.6, Math.min(6, st.dist * Math.exp(e.deltaY * 0.001))); }, { passive: false });
  cv.addEventListener('touchmove', e => { if (e.touches.length === 2) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (pinch) st.dist = Math.max(0.6, Math.min(6, st.dist * pinch / d)); pinch = d; } }, { passive: true });
  cv.addEventListener('touchend', () => { pinch = null; });

  // url options (for renders): ?pose=squat&mode=c&look=skin&yaw=0.3&spin=0&dist=2.6
  const q = new URLSearchParams(location.search);
  if (q.get('pose')) st.pose = q.get('pose'); if (q.get('clip')) st.startClip = q.get('clip'); if (q.get('slow') === '1') st.slow = true; if (q.get('mode')) st.mode = q.get('mode'); if (q.get('look')) st.look = q.get('look');
  if (q.get('yaw')) st.yaw = +q.get('yaw'); if (q.get('pitch')) st.pitch = +q.get('pitch'); if (q.get('dist')) st.dist = +q.get('dist'); if (q.get('spin') === '0') st.spin = false;
  if (q.get('auto') === '1') st.auto = true; if (q.get('fov')) st.fov = +q.get('fov'); if (q.get('white') === '1') st.white = true; if (q.get('ty')) st.lockT = [0, +q.get('ty'), 0]; if (q.get('ui') === '0') document.body.classList.add('hide');
  for (const k of ['sex', 'stature', 'mass', 'bodyFat', 'frame', 'def', 'cell']) if (q.get(k)) st.params[k] = +q.get(k);
  // capture mode (for video renders): no animation loop; a script calls __lab.renderFrame(ms) for each frame
  st.capture = q.get('capture') === '1'; st.renderFrame = t => frame(t);
  st.goPose = goPose; st.playClip = playClip; st.build = build; st.ready = false;
  panel(); if (!st.capture) requestAnimationFrame(frame);
  build().then(() => { st.ready = true; });
})();
