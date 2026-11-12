// ---------------------------------------------------------------- boot, main loop, test hooks
const App = { state: { speed: 0, lean: 0 }, ready: false, t: 0, lookYaw: null, lampTilt: 0.07 };
const QS = new URLSearchParams(location.search);
const DEV = QS.has('dev');

// Start-up runs in stages with a breath between them, so the loading page can show where it has got to
async function boot(stage) {
  const manual = QS.has('manual'), step = async (f, name) => { if (stage) stage(f, name); if (!manual) await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0))); };
  const canvas = document.getElementById('view');
  await step(0.03, '醒来');
  let gfx = null; const want = QS.get('backend');
  if (want !== 'webgl2') { try { gfx = await createGPU(canvas, { offscreen: QS.has('offscreen') }); } catch (e) { console.warn('WebGPU init failed', e); gfx = null; } }
  if (!gfx) gfx = createGL(canvas);
  if (!gfx) throw new Error('这台设备的浏览器不支持 WebGL2，画面无法启动。');
  App.gfx = gfx;
  if (QS.get('seg') || QS.get('seed')) { Course.forceType = QS.get('seg') || null; Course.reset(+QS.get('seed') || Course.seed); }      // dev: a mountain made of one kind of run
  if (QS.get('tod')) { const q = QS.get('tod'); Sky.setClock(q in Sky.times ? Sky.times[q] : +q || 0); }
  await step(0.08, '磨雪');
  makeNoiseTextures(gfx); makeSnowTexture(gfx, Sky.az); Terrain.setSun(Sky.az);
  await step(0.20, '远山与城市');
  { const t0 = performance.now(); Vista.init(gfx, { farW: +QS.get('vistares') || (gfx.caps.maxTex >= 4096 ? 3072 : 2048), cityW: +QS.get('cityres') || 1024, keep: DEV && QS.has('vistadbg') }); if (DEV) console.log('vista', Math.round(performance.now() - t0) + 'ms', JSON.stringify(Vista.stats)); }
  await step(0.36, '立起天空');
  Render.init(gfx, canvas); Sky.init(gfx); Terrain.init(gfx); Post.init(gfx); Skier.init(gfx);
  await step(0.40, '林子里有鹿');
  { const t0 = performance.now(); Deer.init(gfx); if (DEV) console.log('deer', Math.round(performance.now() - t0) + 'ms', Deer.mesh.nv + ' verts'); }
  await step(0.44, '种树');
  { const t0 = performance.now(); Trees.init(gfx); if (DEV) console.log('trees', Math.round(performance.now() - t0) + 'ms', Math.round(Trees.stats.tris) + ' tris'); }
  await step(0.56, '点亮星云');
  Spray.init(gfx); Dust.init(gfx); Nebula.init(gfx, +QS.get('nebres') || (gfx.caps.maxTex >= 4096 && (navigator.deviceMemory || 8) >= 4 ? 1536 : 768)); Clouds.init(gfx, +QS.get('cloudres') || 0); Shafts.init(gfx); Tracks.init(gfx);
  await step(0.64, '调音');
  Sound.init();
  Render.onResize.push(Spray.resize); Render.onResize.push(Shafts.resize);
  Render.onOriginShift = d => { Spray.shiftOrigin(d); };
  Render.passes.offscreen.push(R => Spray.offscreen(R));
  Render.passes.offscreen.push(R => Shafts.offscreen(R));
  Render.passes.fx.push(R => Shafts.fx(R));
  Render.passes.fx.push(R => Spray.fx(R));
  Render.passes.fx.push(R => Dust.fx(R));
  Game.onStep = (S, H) => Spray.onStep(S, H, App.t - (Game.t - Game.stepT));
  Render.passes.shadow.push(() => { if (App.skierRoot) Skier.drawShadow(); Deer.drawShadow(); Trees.drawShadow(); });
  Render.passes.pre.push(R => Spray.pre(R)); Render.passes.pre.push(() => Tracks.pre());
  Render.passes.opaque.push(R => { if (App.skierRoot) Skier.draw(R.shadowTex, Sky.lut); Deer.draw(R.shadowTex, Sky.lut); Trees.draw(R); });
  Render.passes.transparent.push(R => Clouds.draw(R)); Render.passes.transparent.push(R => Trees.drawGhost(R));
  await step(0.70, '调光');
  const pipes = [].concat(Sky.pipes, Terrain.pipes, Post.pipes, Skier.pipes, Deer.pipes, Trees.pipes, Spray.pipes, Dust.pipes, Nebula.pipes, Clouds.pipes, Shafts.pipes, Tracks.pipes);
  for (let i = 0; i < pipes.length; i++) { const p = pipes[i]; if (gfx.finishPipelineAsync) await gfx.finishPipelineAsync(p); else gfx.finishPipeline(p); if (stage && !manual && i % 6 === 5) await step(0.70 + 0.16 * (i + 1) / pipes.length, null); }
  await step(0.87, '铺雪');
  fit();
  Input.init(canvas);
  Game.reset();
  App.skierRoot = Game.root; App.skierPose = Game.pose;
  tick(1 / 60, false);
  { const t0 = performance.now(); Terrain.update(Render.cam.pos[0], Render.cam.pos[2], true); if (DEV) console.log('terrain', Math.round(performance.now() - t0) + 'ms'); }
  // the first picture bakes the nebula and the trees: do it while the loading page still covers the canvas
  if (!manual) { await step(0.96, '第一缕光'); tick(1 / 60, true); await step(1, null); }
  App.ready = true;
}
// one simulation + presentation step. `draw` false: advance everything but skip the GPU frame (tests fast-forward this way)
function tick(dt, draw) {
  App.t += dt;
  Input.update(dt);
  Game.update(dt);
  const cp = Render.cam.pos, S = Game.s, st = App.state;
  Tracks.step(Game.root, Game.pose, S);
  Render.updateOrigin(cp);
  if (draw !== false) Terrain.update(cp[0], cp[2]);
  Skier.update(Game.root, Game.pose, Render.origin);
  Trees.update(Render.cam, Render.origin, Render.W / Render.H, Game.root.pos, dt);
  Deer.update(dt, App.t);
  st.speed = S.speed; st.lean = S.lean; st.playerPos = Game.root.pos; st.air = S.air;
  // the headlamp sits on the forehead and looks where the skier is looking: down the mountain along the line being skied (the head stays
  // quiet while the skis swing under it), a little below the lie of the slope, so its pool falls a few lengths ahead
  { const W = Skier.world, hb = W.hb;
    if (hb && W.J) {
      const m = (v) => [W.X[0] * v[0] + W.Y[0] * v[1] + W.Z[0] * v[2], W.X[1] * v[0] + W.Y[1] * v[1] + W.Z[1] * v[2], W.X[2] * v[0] + W.Y[2] * v[1] + W.Z[2] * v[2]];
      const hp = m(v3.add(v3.mad(W.J.head, hb.Z, -0.11), v3.mul(hb.Y, 0.04))), n = Game.root.nrm;
      st.lampPos = [Game.root.pos[0] + hp[0], Game.root.pos[1] + hp[1], Game.root.pos[2] + hp[2]];
      const vy = S.speed > 1.5 ? Math.atan2(S.v[0], -S.v[2]) : 0; App.lookYaw = damp(App.lookYaw == null ? vy : App.lookYaw, vy * 0.85, 4.5, dt);
      const h = [Math.sin(App.lookYaw), 0, -Math.cos(App.lookYaw)], hn = v3.dot(h, n), d = v3.norm([h[0] - n[0] * hn, h[1] - n[1] * hn, h[2] - n[2] * hn]), ca = Math.cos(App.lampTilt), sa = Math.sin(App.lampTilt);
      st.lampDir = v3.norm([d[0] * ca - n[0] * sa, d[1] * ca - n[1] * sa, d[2] * ca - n[2] * sa]);
    } }
  // the day moves on while you ski (the title page stays in the afternoon)
  if (Game.mode === 'run' && Sky.rate !== 0) Sky.setClock(Sky.clock + dt * (Sky.rate || 1));
  Sky.updatePlane(App.t, dt, cp, Render.cam.fwd);
  Render.computeGlobals(App.t, dt, st);
  for (const ev of Game.events) {
    Sound.event(ev);
    if (ev.type === 'land') Spray.burst(App.t, Game.root.pos, S.v, S.n, clamp(ev.v / 5, 0.3, 2.2));
    else if (ev.type === 'push') App.strides = [[App.t + 0.05, -1], [App.t + 0.42, 1]];
    // snow knocked off the boughs
    else if (ev.type === 'brush' || ev.type === 'crash') {
      const p = Game.root.pos, dx = ev.x - p[0], dz = ev.z - p[2], l = Math.hypot(dx, dz) || 1, k = Math.min(1, 0.9 / l);
      Spray.sift(App.t, [p[0] + dx * k, p[1] + 1.5, p[2] + dz * k], S.v, ev.type === 'crash' ? 1.6 : 0.8);
      if (ev.type === 'crash') Game.shake = Math.max(Game.shake, 0.05);
    }
  }
  Game.events.length = 0;
  // pushing off: each of the two strides throws a small spurt of snow back and out from the edge it drives off (low, so the skier stays clear)
  if (App.strides && App.strides.length && App.t >= App.strides[0][0]) {
    const side = App.strides.shift()[1], p = Game.root.pos, sp = Math.hypot(S.v[0], S.v[2]) || 1, fx = S.v[0] / sp, fz = S.v[2] / sp;
    const x = p[0] - fz * side * 0.42 - fx * 0.35, z = p[2] + fx * side * 0.42 - fz * 0.35;
    if (Game.mode === 'run') Spray.kick(App.t, [x, Course.height(x, z, 0.5), z], [S.v[0] * 0.3 - fz * side * 1.1, 0.4, S.v[2] * 0.3 + fx * side * 1.1], 0.8);
  }
  Sound.frame();
  for (const f of App.onTick) f(dt, draw !== false);
  if (draw !== false) Render.render();
}
App.onTick = [];
// (interface) App.paused: the run is set down, nothing steps or draws. App.resumeK: the world's speed as it is taken up again (0.3 up to 1,
// eased by the interface); it scales the time handed to the step, where the slow motion of a jump (Game.timeScale) scales it again
App.resumeK = 1;
let lastT = 0;
function loop(now) {
  requestAnimationFrame(loop);
  if (App.gfx && App.gfx.lost) { UI.lost(); return; }                    // the graphics device was taken away: the interface says so, and offers to start over
  if (!App.ready || App.paused) { lastT = now; return; }
  const raw = (now - lastT) / 1000, dt = clamp(raw, 1 / 240, 1 / 20); lastT = now;
  try { tick(dt * App.resumeK, true); UI.frame(dt); govern(now, raw); } catch (e) { App.ready = false; reportError(e); }
}
function fit() {
  View.measure(); let k = Math.min(devicePixelRatio || 1, 2) * Render.scale;
  // a very large display is drawn at no more than about 2400 x 1400 and stretched: past that the extra pixels cost far more than they show
  const px = View.w * View.h * k * k, cap = +QS.get('maxpx') || 3.4e6; if (px > cap) k *= Math.sqrt(cap / px);
  const w = +QS.get('w') || Math.round(View.w * k), h = +QS.get('h') || Math.round(View.h * k);
  Render.resize(Math.max(64, w), Math.max(64, h));
}
// 60 frames a second come first. If this machine cannot hold them at full sharpness the picture is drawn a little smaller and stretched
// (nothing is switched off), and it goes back up when there is room again
const Gov = { on: QS.get('gov') !== '0' && !QS.get('w'), acc: 0, n: 0, slow: 0, fast: 0, last: 0, downs: 0, t0: 0 };
function govern(now, raw) {
  if (!Gov.on || raw > 1) return;                                         // (a tab coming back to the front is not a slow frame)
  if (!Gov.t0) Gov.t0 = now; if (now - Gov.t0 < 3000) return;             // the first seconds are still compiling and warming up
  Gov.acc += raw; Gov.n++; if (Gov.acc < 1) return;
  const avg = Gov.acc / Gov.n; Gov.acc = 0; Gov.n = 0;
  if (avg > 1 / 50) { Gov.slow++; Gov.fast = 0; } else if (avg < 1 / 57) { Gov.fast++; Gov.slow = 0; } else { Gov.slow = 0; Gov.fast = 0; }
  if (Gov.slow >= 2 && Render.scale > 0.6) { Render.scale = Math.max(0.6, Render.scale * (avg > 1 / 36 ? 0.8 : 0.9)); Gov.slow = 0; Gov.downs++; Gov.last = now; fit(); }
  else if (Gov.fast >= 12 && Render.scale < 1 && Gov.downs < 5 && now - Gov.last > 20000) { Render.scale = Math.min(1, Render.scale * 1.08); Gov.fast = 0; Gov.last = now; fit(); }
}
App.gov = Gov;
function reportError(e) {
  console.error(e && e.message ? e.message : e); if (e && e.vs) console.log(e.vs.slice(0, 20000)); if (e && e.fs) console.log(e.fs.slice(0, 20000));
  const el = document.getElementById('fatal'); if (el) { el.hidden = false; el.textContent = String(e && e.message ? e.message : e); }
}

// ---- test API (used by the headless harness; harmless in production)
window.__ski = {
  boot: () => boot().then(() => 'ok ' + App.gfx.caps.backend, e => { reportError(e); return 'ERR ' + (e && e.message); }),
  view(pos, target, fov, roll) {
    Render.updateOrigin(pos); Render.setCamera(pos, target, [0, 1, 0], fov || 1.0, roll || 0);
    Terrain.update(pos[0], pos[2]);
    if (App.skierRoot) Skier.update(App.skierRoot, App.skierPose, Render.origin);
    Trees.update(Render.cam, Render.origin, Render.W / Render.H);
    Render.computeGlobals(App.t, 1 / 60, App.state); for (const f of App.onTick) f(0, true); Render.render();
  },
  skier(x, z, yaw, pose) {
    const h = Course.height(x, z, 0.5), n = Course.normal(x, z).slice(), f0 = [Math.sin(yaw), 0, -Math.cos(yaw)];
    App.skierRoot = { pos: [x, h, z], fwd: v3.norm(v3.sub(f0, v3.mul(n, v3.dot(f0, n)))), nrm: n }; App.skierPose = pose || {};
    return App.skierRoot.pos;
  },
  async shot() { const cap = await App.gfx.capture(); const c2 = document.createElement('canvas'); c2.width = cap.w; c2.height = cap.h; c2.getContext('2d').putImageData(new ImageData(cap.data, cap.w, cap.h), 0, 0); return c2.toDataURL('image/png'); },
  height: (x, z) => Course.height(x, z, 0.5),
  set(path, v) { const parts = path.split('.'); let o = { Sky, Render, Post, App, Terrain, Course, Spray, Game, Input, Dust, Nebula, Clouds, Trees, Shafts, Vista, Tracks, Sound, Deer }; for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]]; o[parts[parts.length - 1]] = v; },
  err: () => App.gfx && App.gfx.lastError,
  // fast-forward the game: fn(t) returns the steering input (-1..1) for that moment; the last step is drawn
  sim(seconds, fn, opt = {}) {
    const n = Math.round(seconds * 60); if (Game.mode !== 'run') Game.start();
    const gl2 = App.gfx.caps.backend === 'webgl2';
    for (let i = 0; i < n; i++) { Input.script = fn ? fn(Game.runT) : 0; const d = i === n - 1 && opt.draw !== false; tick(1 / 60, d); if (!d && gl2 && i % 6 === 5) Tracks.pre(); }   // the tracks are pressed and wiped as in play
    const S = Game.s; return { p: S.p.map(v => +v.toFixed(2)), speed: +S.speed.toFixed(2), lean: +S.lean.toFixed(3), beta: +S.beta.toFixed(3), air: S.air, e: +S.e.toFixed(3), seg: Course.segAt(-S.p[2]).type };
  },
  frame(dt) { tick(dt == null ? 1 / 60 : dt, true); },
  // the sound of a stretch of skiing, rendered offline: the same instrument, fed the same states, on a clock that advances 1/60 s a step.
  // Returns a 16-bit WAV (base64) and a log of what the skier was doing
  async audioTest(seconds, fn, opt = {}) {
    const sr = opt.sr || 44100, off = new OfflineAudioContext(2, Math.round(seconds * sr), sr), rig = Sound.build(off, opt), n = Math.round(seconds * 60), log = [];
    const keep = { rig: Sound.rig, now: Sound.now }; let i = 0; Sound.rig = rig; Sound.now = () => i / 60 + 0.012; rig.fade(opt.level || Sound.level, 0, 0.01);
    if (!opt.title && Game.mode !== 'run') Game.start();
    for (i = 0; i < n; i++) {
      Input.script = fn ? fn(Game.runT) : 0; tick(1 / 60, false);
      if (i % 6 === 0) { const s = Sound.snapshot(); log.push([+(i / 60).toFixed(1), +s.speed.toFixed(1), +s.lat.toFixed(2), +s.I.toFixed(2), +s.load.toFixed(2), s.contact ? 1 : 0, +s.powder.toFixed(2), +(rig.E || 0).toFixed(2), +s.lean.toFixed(2), +s.skid.toFixed(2)]); }
    }
    Sound.rig = keep.rig; Sound.now = keep.now;
    const buf = await off.startRendering(), L = buf.getChannelData(0), Rr = buf.getChannelData(1), N = L.length, u8 = new Uint8Array(44 + N * 4), dv = new DataView(u8.buffer);
    const wr = (o, str) => { for (let k = 0; k < str.length; k++) u8[o + k] = str.charCodeAt(k); };
    wr(0, 'RIFF'); dv.setUint32(4, 36 + N * 4, true); wr(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); wr(36, 'data'); dv.setUint32(40, N * 4, true);
    let peak = 0;
    for (let k = 0; k < N; k++) { peak = Math.max(peak, Math.abs(L[k]), Math.abs(Rr[k])); dv.setInt16(44 + k * 4, clamp(L[k], -1, 1) * 32767, true); dv.setInt16(46 + k * 4, clamp(Rr[k], -1, 1) * 32767, true); }
    let b64 = ''; for (let k = 0; k < u8.length; k += 0x6000) b64 += btoa(String.fromCharCode.apply(null, u8.subarray(k, k + 0x6000)));
    return { wav: b64, log, peak, chirps: (rig.chirps || 0) + ' passes ' + (rig.passes || 0) + ' hoofs ' + (rig.hoofs || 0) };
  },
  // test pilot: linked turns down the middle of the run, steering round the trees. Returns the steering function sim() wants
  pilot(amp = 0.45, period = 5.2) {
    const pc = {}, tn = {};
    return t => {
      const S = Game.s, p = S.p, look = 10 + Math.max(S.speed, 4) * 0.9, c = Course.at(-p[2] + look, pc);
      let tx = c.cx + amp * c.hw * Math.sin(t * TAU / period); const tz = p[2] - look;
      for (let k = 1; k <= 8; k++) { const qx = p[0] + (tx - p[0]) * k / 8, qz = p[2] + (tz - p[2]) * k / 8; Course.nearTree(qx, qz, tn); if (tn.ok && !tn.soft && tn.d < 3.4) tx += (qx >= tn.x ? 1 : -1) * (4.6 - tn.d) * (k < 3 ? 2.6 : 1.1); }
      return clamp((Math.atan2(tx - p[0], -(tz - p[2])) - Math.atan2(S.v[0], -S.v[2])) * 2.4, -0.85, 0.85);
    };
  },
  reset(s0) { Game.reset(s0); Game.mode = 'title'; },
  // set the time of day: seconds into the 10-minute day, or a name (day, golden, sunset, dusk, night, dawn, sunrise)
  tod(t) { Sky.setClock(typeof t === 'string' ? Sky.times[t] : t); Sky.update(); Clouds.baked = false; Vista.shadowElev = -9; Vista.updateShadow(true); return +Sky.sunElev.toFixed(4); },
  game: () => Game, input: () => Input, app: () => App, ui: () => UI,
  get m() { return { Sky, Render, Post, App, Terrain, Course, Spray, Game, Input, Skier, Tex, Dust, Nebula, Clouds, Trees, Shafts, Vista, Tracks, Sound, Atmo, Deer, View }; },
};
App.fit = fit;
addEventListener('resize', () => { if (typeof UI !== 'undefined' && UI.layout) UI.layout(); if (App.ready && !QS.get('w')) fit(); });
// (interface) a run set down keeps its last picture on the canvas; when the frame changes shape meanwhile that picture is drawn once more to fit
App.redraw = () => {
  if (!App.ready || !App.paused || (App.gfx && App.gfx.lost)) return;
  try { Render.computeGlobals(App.t, 1 / 60, App.state); for (const f of App.onTick) f(0, true); Render.render(); } catch (e) { }
};
addEventListener('resize', () => App.redraw());
if (QS.has('manual') && !QS.has('ui')) document.getElementById('app').classList.add('bare');
else {
  UI.init();
  boot(UI.stage).then(() => { UI.ready(); lastT = performance.now(); requestAnimationFrame(loop); if (QS.has('autostart')) UI.go(); }).catch(reportError);
}
