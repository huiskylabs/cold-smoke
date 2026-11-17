// 人物实验室: draws the game's skier (Skier.build / Skier.skin, the game's own code) with WebGL2, skinned on the GPU the way the game skins it.
(function () {
  const cv = document.getElementById('cv'), busy = document.getElementById('busy');
  const gl = cv.getContext('webgl2', { antialias: true });
  if (!gl) { busy.textContent = '这个浏览器不支持 WebGL2'; return; }
  const L = Skier.LOOK, B = Skier.B;
  const st = { hand: 'b', pose: 'stand', look: 'handR' };
  try { const q = new URLSearchParams(location.search); for (const k of ['hand', 'pose', 'look']) if (q.get(k)) st[k] = q.get(k); } catch (e) {}

  const POSES = {
    stand: () => ({}),
    turnL: () => ({ lean: -0.55, edge: -0.6, crouch: 0.35 }),
    turnR: () => ({ lean: 0.55, edge: 0.6, crouch: 0.35 }),
    tuck: () => ({ tuck: 1, crouch: 0.6 }),
    plant: () => ({ plantL: 1, lean: -0.3, edge: -0.3, crouch: 0.3 }),
    air: () => ({ air: 1, crouch: 0.3 }),
    carve: t => { const s = Math.sin(t * 1.6); return { lean: 0.55 * s, edge: 0.6 * s, crouch: 0.3 + 0.12 * Math.abs(Math.cos(t * 1.6)), plantL: Math.max(0, Math.cos(t * 1.6)) * 0.8 * (s < 0 ? 1 : 0), plantR: Math.max(0, -Math.cos(t * 1.6)) * 0.8 * (s > 0 ? 1 : 0) }; },
  };

  const VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 pos; layout(location=1) in vec3 nrm; layout(location=2) in vec4 mat; layout(location=3) in vec4 bw;
uniform mat4 uBones[28]; uniform mat4 uVP;
out vec3 vN; out vec3 vBP; out vec4 vMat; out vec3 vW;
mat4 bone(float i) { return uBones[int(i + 0.5)]; }
void main() {
  float b2 = floor(bw.w), w2 = bw.w - b2;
  mat4 m0 = bone(bw.x), m1 = bone(bw.y), m2 = bone(b2);
  vec3 p = mix(mix((m1 * vec4(pos, 1.0)).xyz, (m0 * vec4(pos, 1.0)).xyz, bw.z), (m2 * vec4(pos, 1.0)).xyz, w2);
  vN = mix(mix((m1 * vec4(nrm, 0.0)).xyz, (m0 * vec4(nrm, 0.0)).xyz, bw.z), (m2 * vec4(nrm, 0.0)).xyz, w2);
  vBP = pos; vMat = mat; vW = p;
  gl_Position = uVP * vec4(p, 1.0);
}`;
  const c3 = a => 'vec3(' + a.map(v => (+v).toFixed(4)).join(',') + ')';
  const FS = () => `#version 300 es
precision highp float;
in vec3 vN; in vec3 vBP; in vec4 vMat; in vec3 vW;
uniform vec3 uEye; uniform float uHB; uniform vec3 uElbow; uniform vec3 uFore; uniform float uGEdge; uniform mat4 uPelInv;
out vec4 o;
void main() {
  vec3 n = normalize(vN); vec3 V = normalize(uEye - vW); if (dot(n, V) < 0.0) n = -n;
  float id = floor(vMat.x + 0.5); float ao = clamp(vMat.y, 0.0, 1.0);
  vec3 bm = vec3(abs(vBP.x), vBP.y, vBP.z); float armF = dot(bm - uElbow, uFore);
  if (id < 1.5) { vec3 pl = (uPelInv * vec4(vBP, 1.0)).xyz; float hemV = pl.y + 0.082 + 0.026 * clamp((pl.z + 0.02) / 0.14, 0.0, 1.0); id = 1.0; if (hemV > 0.006 && (hemV < 0.05 || vMat.z > -0.012)) id = 0.0; }
  if (uHB > 0.5 && armF > 0.10 && ((id > 1.5 && id < 2.5 && vMat.z < 0.05) || (id < 0.5 && vMat.w < 0.0))) id = armF > uGEdge ? 2.0 : 0.0;
  vec3 alb = vec3(0.5); float spec = 0.04, pw = 24.0;
  if (id < 0.5) { alb = ${c3(L.jacket.alb)}; if (uHB < 0.5 && armF > 0.05 && vMat.w < 0.0) alb = ${c3(L.sleeveFore.alb)}; }
  else if (id < 1.5) alb = vec3(0.066, 0.082, 0.108);
  else if (id < 2.5) {
    alb = ${c3(L.glove.alb)}; spec = 0.08; pw = 30.0;
    if (uHB > 0.5 && vMat.z > 0.05) {
      float fin = floor(vMat.z), hx = (fract(vMat.z) - 0.5) * 0.2, gu = vMat.w;
      float lea = max(step(0.5, fin), smoothstep(0.022, 0.006, hx));
      alb = mix(${c3(L.gloveBack.alb)}, ${c3(L.gloveLeather.alb)}, lea); spec = mix(0.04, 0.26, lea); pw = mix(24.0, 46.0, lea);
      float rib = smoothstep(0.009, 0.006, abs(gu + 0.014)) * (1.0 - step(0.5, fin)); alb = mix(alb, ${c3(L.gloveBand.alb)}, rib);
      float tab = smoothstep(0.0012, 0.0, max(abs(hx - 0.050) - 0.010, abs(gu + 0.006) - 0.010)) * (1.0 - step(0.5, fin)); alb = mix(alb, ${c3(L.gloveTab.alb)}, tab);
      float seam = exp(-(abs(hx - 0.014) + step(0.5, fin)) * 260.0); alb *= 1.0 - 0.5 * seam;
    } else if (uHB > 0.5) {
      float e = armF - uGEdge; alb = ${c3(L.gloveBack.alb)}; alb = mix(alb, ${c3(L.gloveBand.alb)}, smoothstep(0.010, 0.0075, e));
    }
  }
  else if (id < 3.5) alb = vec3(0.055, 0.058, 0.066);
  else if (id < 4.5) alb = vec3(0.80, 0.80, 0.77);
  else if (id < 5.5) { alb = vec3(0.05, 0.04, 0.10); spec = 1.2; pw = 300.0; }
  else if (id < 6.5) alb = vec3(0.02, 0.02, 0.025);
  else if (id < 7.5) alb = vec3(0.022, 0.030, 0.045);
  else if (id < 8.5) alb = vec3(0.045, 0.055, 0.070);
  else if (id < 9.5) alb = ${c3(L.ski.alb)};
  else if (id < 10.5) { alb = ${c3(L.pole.alb)}; spec = 0.6; pw = 80.0; if (vMat.z > -0.105) alb = ${c3(L.poleGrip.alb)}; else if (vMat.z < -1.025 && vMat.z > -1.06) alb = ${c3(L.poleBasket.alb)}; }
  else alb = vec3(0.12, 0.12, 0.13);
  vec3 sun = normalize(vec3(0.45, 0.8, 0.35)), H = normalize(sun + V);
  float d = max(dot(n, sun), 0.0), sky = 0.5 + 0.5 * n.y, bounce = 0.5 - 0.5 * n.y;
  float rim = pow(1.0 - max(dot(n, V), 0.0), 3.0);
  vec3 col = alb * (vec3(2.6, 2.45, 2.25) * d + (vec3(0.55, 0.65, 0.8) * sky + vec3(0.5, 0.52, 0.55) * bounce) * ao) + vec3(spec * pow(max(dot(n, H), 0.0), pw) * 2.0 * d) + alb * rim * 0.4 * ao;
  col = col / (1.0 + col); col = pow(col, vec3(1.0 / 2.2) * 0.95);
  o = vec4(col, 1.0);
}`;
  const GVS = `#version 300 es
layout(location=0) in vec2 p; uniform mat4 uVP; out vec2 q; void main(){ q = p; gl_Position = uVP * vec4(p.x, 0.0, p.y, 1.0); }`;
  const GFS = `#version 300 es
precision highp float; in vec2 q; uniform vec2 uC; uniform vec3 uSh; out vec4 o;
void main(){ float r = length(q); vec3 c = vec3(0.86, 0.9, 0.96); float s = length((q - uSh.xy) / vec2(0.32, 0.55));
  c *= 1.0 - 0.35 * exp(-s * s * 2.5); c = mix(c, vec3(0.81, 0.85, 0.9), smoothstep(2.0, 6.0, r)); o = vec4(c, 1.0); }`;

  function prog(vs, fs) {
    const p = gl.createProgram();
    for (const [t, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); }
    gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i), nm = a.name.replace('[0]', ''); u[nm] = gl.getUniformLocation(p, a.name); }
    return { p, u };
  }

  let P, G, ground;
  const meshes = {};
  function getMesh(hand) {
    if (meshes[hand]) return meshes[hand];
    Variants.val.hand = hand; Variants.val.body = 'b'; if ('ride' in Variants.val) Variants.val.ride = 'a';
    const m = Skier.build('b');
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, m.V, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 40, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 40, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 40, 24);
    const wb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, wb); gl.bufferData(gl.ARRAY_BUFFER, m.W, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 4, gl.FLOAT, false, 16, 0);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.I, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return (meshes[hand] = { vao, ni: m.ni, nv: m.nv, hasHand: m.hand === 'H' });
  }

  // camera: orbit about a target, eased toward the look preset's
  const cam = { yaw: Math.PI * 0.82, pitch: 0.12, dist: 0.45, tgt: [0, 1, 0], want: null };
  const LOOKS = { body: { dist: 2.6, pitch: 0.15 }, handR: { dist: 0.42, pitch: 0.2 }, handL: { dist: 0.42, pitch: 0.2 }, front: { dist: 2.6, pitch: 0.12, yaw: 0 } };
  function setLook(k, snap) {
    st.look = k; const l = LOOKS[k] || LOOKS.body;
    cam.dist = l.dist; cam.pitch = l.pitch;
    if (l.yaw != null) cam.yaw = l.yaw; else if (k === 'body') cam.yaw = Math.PI; else if (k === 'handR') cam.yaw = Math.PI * 0.72; else if (k === 'handL') cam.yaw = -Math.PI * 0.72;
  }

  function persp(fy, a, n, f) { const t = 1 / Math.tan(fy / 2); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; }
  function lookAt(e, c) {
    const z = v3.norm(v3.sub(e, c)), x = v3.norm(v3.cross([0, 1, 0], z)), y = v3.cross(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -v3.dot(x, e), -v3.dot(y, e), -v3.dot(z, e), 1];
  }
  function mul(a, b) { const r = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; r[i * 4 + j] = s; } return r; }

  // input
  let drag = null; const pts = new Map();
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); drag = pts.size === 1 ? [e.clientX, e.clientY] : null; });
  cv.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return; const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 1) { cam.yaw -= (e.clientX - prev[0]) * 0.008; cam.pitch = Math.max(-1.2, Math.min(1.4, cam.pitch + (e.clientY - prev[1]) * 0.006)); }
    else if (pts.size === 2) { const [a, b] = [...pts.values()], o = [...pts.entries()].find(([k]) => k !== e.pointerId)[1]; const d1 = Math.hypot(prev[0] - o[0], prev[1] - o[1]), d2 = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d1 > 0) cam.dist = Math.max(0.12, Math.min(8, cam.dist * d1 / d2)); }
  });
  const up = e => pts.delete(e.pointerId); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { e.preventDefault(); cam.dist = Math.max(0.12, Math.min(8, cam.dist * Math.exp(e.deltaY * 0.0012))); }, { passive: false });

  function syncUI() { document.querySelectorAll('#ui button').forEach(b => b.classList.toggle('on', st[b.dataset.k] === b.dataset.v)); }
  document.querySelectorAll('#ui button').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.k, v = b.dataset.v;
    if (k === 'look') setLook(v); else if (k === 'hand' && !meshes[v]) { busy.style.display = 'flex'; st.hand = v; syncUI(); setTimeout(() => { getMesh(v); busy.style.display = 'none'; }, 30); return; } else st[k] = v;
    syncUI();
  }));

  let tgtS = null;
  function frame(now) {
    const t = now / 1000, W = cv.clientWidth, H = cv.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const mesh = getMesh(st.hand);
    const pose = (POSES[st.pose] || POSES.stand)(t);
    const sk = Skier.skin(pose, Object.assign({}, Skier.SEC0, { hand: [0, 0, 0] }));
    const J = sk.J;
    const tg = st.look === 'handR' ? J.gripR : st.look === 'handL' ? J.gripL : [0, (J.pelvis ? J.pelvis[1] : 0.9) + 0.05, 0];
    tgtS = tgtS ? tgtS.map((v, i) => v + (tg[i] - v) * 0.15) : tg.slice();
    const cp = Math.cos(cam.pitch), eye = [tgtS[0] + Math.sin(cam.yaw) * cp * cam.dist, tgtS[1] + Math.sin(cam.pitch) * cam.dist, tgtS[2] + Math.cos(cam.yaw) * cp * cam.dist];
    const VP = mul(persp(st.look.startsWith('hand') ? 0.6 : 0.75, W / H, Math.max(0.01, cam.dist * 0.05), 60), lookAt(eye, tgtS));
    gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0.80, 0.85, 0.90, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
    gl.useProgram(G.p); gl.uniformMatrix4fv(G.u.uVP, false, VP); gl.uniform3f(G.u.uSh, 0.06, 0.02, 0); gl.bindVertexArray(ground); gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    gl.useProgram(P.p);
    const flat = new Float32Array(28 * 16); for (let i = 0; i < 28; i++) if (sk.M[i]) flat.set(sk.M[i], i * 16);
    gl.uniformMatrix4fv(P.u.uBones, false, flat); gl.uniformMatrix4fv(P.u.uVP, false, VP); gl.uniform3fv(P.u.uEye, eye); gl.uniform1f(P.u.uHB, mesh.hasHand ? 1 : 0);
    gl.bindVertexArray(mesh.vao); gl.drawElements(gl.TRIANGLES, mesh.ni, gl.UNSIGNED_INT, 0);
    requestAnimationFrame(frame);
  }

  setTimeout(() => {
    try {
      P = prog(VS, FS()); G = prog(GVS, GFS);
      ground = gl.createVertexArray(); gl.bindVertexArray(ground); const gb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, gb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-12, -12, 12, -12, 12, 12, -12, 12]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null);
      getMesh(st.hand);
      const bj = Skier.bind.J, Fp = Skier.bind.F[B.pelvis];
      gl.useProgram(P.p);
      gl.uniform3fv(P.u.uElbow, bj.elbowR); gl.uniform3fv(P.u.uFore, v3.norm(v3.sub(bj.gripR, bj.elbowR))); gl.uniform1f(P.u.uGEdge, Skier.LEN.farm - Skier.GAUNT.len);
      gl.uniformMatrix4fv(P.u.uPelInv, false, new Float32Array(m4.invert(Fp)));
      setLook(st.look); syncUI(); busy.style.display = 'none';
      console.log('skierlab ready', JSON.stringify({ nv: meshes[st.hand].nv, hand: meshes[st.hand].hasHand }));
      requestAnimationFrame(frame);
    } catch (e) { busy.textContent = '出错了：' + e.message; console.error(e); }
  }, 30);
})();
