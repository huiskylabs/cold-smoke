// ---------------------------------------------------------------- 回放: a challenge run played back, the lens in the player's hands
// Asked by the owner (2026-11-18 07:22 UTC): "跑完了以后可以一键把这个录像 replay 一下", only in the race mode (光圈速降线 / 越野线), no video
// export ("不需要你导出视频，你就 replay"), and while it plays the player switches the camera ("replay 过程中你可以切换这个镜头"). Design doc
// 竞速跑完一键回放（设计稿）, every recommendation taken (07:37 UTC): ten cameras (the game's own eight views, 左/右 as one 侧面, and two that
// exist only here: 转播 and 环绕), no auto-director (the camera only changes when the player changes it), only the run just finished is kept.
//
// How it stays true to the run: nothing is simulated again. From 出发 to a moment past the finish, every frame keeps what the physics left
// (Game.s), the pose the figure was asked for (Game.pose), where it stood (Game.root), what happened (Game.events: landings, pole plants,
// boughs brushed), the slow motion of the air (Game.timeScale) and the hour. Played back, the physics does not step (Game.mode 'replay':
// 07_game.js steps only in 'run'); the frame is put back, and everything that draws or sounds from it (the figure and its own springs, the
// spray, the tracks, the lens, the sound, the rings) runs as it did. So the replay cannot ski a different line from the run.
// The rings (92_rings.js) ask RG.replay(T) for how they stood: every ring of the run is kept as it was made, with the moments it opened,
// scattered and was passed, and at each moment of the replay the ones alive then are handed back, their clocks shifted to the replay's.
//   keyboard   Space pause · ← → 5 s · - = slower / faster · 1-9 0 cameras, V the next one · drag the 环绕 view · H hide everything · Esc back
//   phone      tap the cameras on the right · the bar at the foot · tap the picture to bring the words back
const Replay = self.Replay = (() => {
  const R = { on: false, rec: null, recording: false };
  const RG = () => (typeof window !== 'undefined' && window.__rings) || null;
  const G = Game, S = G.s;
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
  const CAMS = [['chase', '追尾'], ['fp', '第一人称'], ['tips', '雪板尖'], ['low', '贴雪'], ['high', '俯瞰'], ['side', '侧面'], ['front', '正面'], ['far', '远摄'], ['tv', '转播'], ['orbit', '环绕']];
  const SPEEDS = [0.25, 0.5, 1, 2], TAIL = 2.5;           // TAIL: s of the run kept past the finish ring (its burst, the skier riding on)

  // ---- one frame of the run, packed: every number of Game.s, Game.pose and Game.root in a fixed order (laid out at 出发), in a Float64Array
  function layout(objs) {
    const L = [];
    for (const [name, o] of objs) for (const k of Object.keys(o)) {
      const v = o[k];
      if (typeof v === 'number') L.push({ o: name, k, t: 'n', n: 1 });
      else if (typeof v === 'boolean') L.push({ o: name, k, t: 'b', n: 1 });
      else if (Array.isArray(v) && v.length && v.length <= 8 && v.every(x => typeof x === 'number')) L.push({ o: name, k, t: 'a', n: v.length });
    }
    let off = 0; for (const f of L) { f.off = off; off += f.n; }
    return { L, N: off };
  }
  const OBJ = () => ({ s: G.s, pose: G.pose, pos: G.root.pos, fwd: G.root.fwd, nrm: G.root.nrm });
  function pack(lay, buf) {
    const O = OBJ();
    for (const f of lay.L) { const v = O[f.o][f.k]; if (f.t === 'n') buf[f.off] = v; else if (f.t === 'b') buf[f.off] = v ? 1 : 0; else for (let i = 0; i < f.n; i++) buf[f.off + i] = v[i] || 0; }
  }
  // put frame a (and b, u of the way to it) back. Positions and the pose's numbers are eased between the two; switches (in the air or not) are a's
  function unpack(lay, A, B, u) {
    const O = OBJ();
    for (const f of lay.L) {
      const o = O[f.o]; if (!o) continue;
      if (f.t === 'b') o[f.k] = A[f.off] > 0.5;
      else if (f.t === 'n') o[f.k] = B && u > 0 ? A[f.off] + (B[f.off] - A[f.off]) * u : A[f.off];
      else { const a = o[f.k]; if (!Array.isArray(a)) continue; for (let i = 0; i < f.n; i++) a[i] = B && u > 0 ? A[f.off + i] + (B[f.off + i] - A[f.off + i]) * u : A[f.off + i]; }
    }
    // root.pos/fwd/nrm are arrays of the root itself (OBJ names them as objects with numeric keys 0..2)
  }

  // ---- recording: from the push-off (RG.hooks.go) to TAIL s past the finish (RG.hooks.finish)
  function begin(info) {
    if (R.on) stop(true);
    const lay = layout(Object.entries(OBJ()));
    R.rec = { info, lay, frames: [], rdt: [], gdt: [], ts: [], rt: [], runT: [], T: [], clock: [], ev: [], rings: new Map(), fin: null, t0: now(), endAt: Infinity, view: G.view };
    R.recording = true; drawCard();
  }
  function finish(o) {
    const r = R.rec; if (!r || !R.recording) return;
    r.fin = o; r.endAt = r.runT.length ? r.runT[r.runT.length - 1] + TAIL : TAIL;
  }
  function record(dt) {
    const r = R.rec; if (!r || !R.recording) return;
    if (G.mode !== 'run' && G.mode !== 'park') { if (!r.fin) { R.rec = null; R.recording = false; } else R.recording = false; return; }      // (the line given up, or the title: a run that did not finish is not kept)
    const buf = new Float64Array(r.lay.N); pack(r.lay, buf);
    r.frames.push(buf); r.rdt.push(App.dtReal || 1 / 60); r.gdt.push(r.lastDt || 1 / 60); r.ts.push(G.timeScale || 1);
    r.rt.push((r.rt.length ? r.rt[r.rt.length - 1] : 0) + (App.dtReal || 1 / 60)); r.runT.push(G.runT); r.T.push(now()); r.clock.push(typeof Sky !== 'undefined' ? Sky.clock : 0);
    r.ev.push(G.events.length ? G.events.map(e => Object.assign({}, e)) : null);
    const rg = RG(); if (rg && rg.rings) for (const q of rg.rings) if (!q.skip && !r.rings.has(q.id)) r.rings.set(q.id, q);      // (kept by reference: their moments are filled in as the run goes)
    if (r.fin && G.runT >= r.endAt || r.frames.length > 60 * 60 * 12) { R.recording = false; seal(); }
  }
  // the run is over: what each ring became is copied out of the live objects, which the next run will throw away
  function seal() {
    const r = R.rec; if (!r || r.sealed) return; r.sealed = true;
    const keep = ['id', 's', 'u', 'x0', 'y0', 'ph', 'x', 'y', 'r', 'tag', 'air', 'fin', 'born', 'grow', 'pass', 'hit', 'splash'];
    r.ringList = [...r.rings.values()].map(q => { const o = {}; for (const k of keep) o[k] = q[k]; if (o.x0 === undefined) { o.x0 = o.x; o.y0 = o.y; o.ph = (o.id * 2.39996) % 6.283; } return o; }).sort((a, b) => a.id - b.id);
    r.rings = null; r.dur = r.rt[r.rt.length - 1] || 0;
    tvPlan();
  }
  R.ready = () => !!(R.rec && R.rec.frames.length > 30 && (R.rec.sealed || R.rec.fin));

  // ---- the rings as they stood at recorded moment Tr, their clocks moved to the replay's T (92_rings.js reads RG.rings and draws them)
  function ringsAt(Tr, T) {
    const r = R.rec, rg = RG(); if (!r || !rg || !r.ringList) return;
    const sh = T - Tr, out = []; let pass = 0, miss = 0;
    for (const q of r.ringList) {
      if (q.born > Tr + 1e-3 || (q.pass >= 0 && q.pass <= Tr && Tr - q.pass > 2.4)) { if (q.pass >= 0 && q.pass <= Tr && !q.fin) { if (q.hit) pass++; else miss++; } continue; }
      const at = t => t >= 0 && t <= Tr ? t + sh : -1, w = Tr * 6.283, p = q.ph;
      const passed = q.pass >= 0 && q.pass <= Tr, spl = at(q.splash);
      if (passed && !q.fin) { if (q.hit) pass++; else miss++; }
      out.push({ id: q.id, s: q.s, u: q.u, r: q.r, tag: q.tag, air: q.air, fin: q.fin, x0: q.x0, y0: q.y0, ph: q.ph,
        x: q.x0 + 0.09 * Math.sin(w * 0.31 + p) + 0.04 * Math.sin(w * 0.73 + p * 2.1), y: q.y0 + 0.07 * Math.sin(w * 0.43 + p * 1.7) + 0.03 * Math.sin(w * 0.91 + p * 0.6),
        born: q.born + sh, grow: at(q.grow), pass: passed ? q.pass + sh : -1, splash: spl, hit: spl >= 0 ? q.hit : 0 });
    }
    rg.rings = out; rg.passed = pass; rg.missed = miss;
    R.ringCount = { pass, miss };
  }

  // ---- 转播: cameras standing at the edge of the run, along the line that was skied, one after another. Each is a long lens that turns to
  // follow the skier and closes in as the skier comes; when the skier is past it, the next one down the run takes the picture (a cut, as on
  // television). Built from the run itself, so every camera sees the line that was actually skied
  function tvPlan() {
    const r = R.rec, lay = r.lay, fp = lay.L.find(f => f.o === 's' && f.k === 'p'); if (!fp) return;
    const pts = r.frames.map(b => [b[fp.off], b[fp.off + 1], b[fp.off + 2]]); r.path = pts;
    const st = [], s0 = -pts[0][2], s1 = -pts[pts.length - 1][2], pc = {};
    let side = 1;
    for (let s = s0 + 35; s < s1 + 40; s += 55) {
      // the skier's x where the run reaches s, and the run's middle and half-width there; the camera stands on the far side from the skier
      let k = pts.findIndex(p => -p[2] >= s); if (k < 0) k = pts.length - 1;
      const sx = pts[k][0], c = Course.at(s, pc), hw = c.hw || 14;
      side = sx > c.cx + 2 ? -1 : sx < c.cx - 2 ? 1 : -side;
      const x = c.cx + side * hw * 0.85, z = -s, y = Course.snowTop(x, z) + 2.4 + Math.min(3, hw * 0.08);
      st.push({ s, p: [x, y, z] });
    }
    r.tv = st;
  }
  const tv = { i: -1, look: null };
  function tvCam(dt) {
    const r = R.rec, st = r && r.tv; if (!st || !st.length) return false;
    const sk = G.root.pos, s = -sk[2];
    // the camera for this stretch: the first one that stands ahead of the skier, or no more than 12 m behind
    let i = st.findIndex(c => c.s > s - 12); if (i < 0) i = st.length - 1;
    const cut = i !== tv.i; tv.i = i;
    const c = st[i], tgt = [sk[0], sk[1] + 0.9, sk[2]];
    if (cut || !tv.look) tv.look = tgt.slice(); else for (let k = 0; k < 3; k++) tv.look[k] = damp(tv.look[k], tgt[k], 9, dt);
    const d = Math.hypot(tgt[0] - c.p[0], tgt[1] - c.p[1], tgt[2] - c.p[2]);
    // the skier held at about a third of the picture's height: a long lens far off, opening as the skier comes close
    const fov = clamp(2 * Math.atan(3.4 / Math.max(d, 1)), 0.09, 1.0);
    if (cut || tv.fov == null) tv.fov = fov; else tv.fov = damp(tv.fov, fov, 4, dt);
    Render.setCamera(c.p, tv.look, [0, 1, 0], tv.fov, 0);
    return true;
  }
  // ---- 环绕: round the skier, slowly, at a few metres; dragged, it goes where it is taken and then carries on round from there
  const orb = { az: 2.4, el: 0.18, r: 5.5, drag: 0, fwd: null };
  function orbitCam(dt) {
    const sk = G.root.pos, f = G.root.fwd, base = Math.atan2(f[0], -f[2]);
    if (!orb.drag) orb.az += dt * 0.32;
    const a = base + orb.az, ce = Math.cos(orb.el);
    const tgt = [sk[0], sk[1] + 0.85, sk[2]], p = [tgt[0] + Math.sin(a) * orb.r * ce, tgt[1] + Math.sin(orb.el) * orb.r, tgt[2] - Math.cos(a) * orb.r * ce];
    const h = Course.snowTop(p[0], p[2]) + 0.45; if (p[1] < h) p[1] = h;
    const fw = v3.norm(v3.sub(tgt, p)); p[1] += Course.nearLift(p, fw, 0.85, Render.W / Render.H, Render.cam.near || 0.1, 0.05, 0);
    Render.setCamera(p, tgt, [0, 1, 0], 0.85, 0);
    return true;
  }
  // the game's views take the lens in 07b_views.js (G.viewCam); the two of the replay take it here, over them, only while a replay plays
  const VC0 = G.viewCam;
  G.viewCam = function (dt, cam, pos, f) {
    if (R.on && (R.cam === 'tv' || R.cam === 'orbit')) { const rdt = App.dtReal || dt; return R.cam === 'tv' ? tvCam(rdt) : orbitCam(rdt); }
    return VC0 ? VC0.apply(this, arguments) : false;
  };
  let sideV = 'right';
  function setCam(id) {
    if (!R.on) return;
    if (id === 'side' && R.cam === 'side') sideV = sideV === 'right' ? 'left' : 'right';          // (侧面 again: the other side)
    R.cam = id; tv.i = -1; tv.look = null; tv.fov = null; if (id === 'orbit') { orb.az = 2.4; orb.el = 0.18; }
    G.setView(id === 'tv' || id === 'orbit' ? 'chase' : id === 'side' ? sideV : id, true);
    paint();
  }

  // ---- playing it back. Time in the replay is the run's own real time (rt: what the player saw, slow motion included), times the speed
  const P = { t: 0, k: 0, speed: 1, play: true, saved: null, last: -1, hideUI: false, idle: 0, splitI: 0 };
  function frameAt(t) {
    const rt = R.rec.rt; let lo = 0, hi = rt.length - 1;
    if (t <= rt[0]) return [0, 0]; if (t >= rt[hi]) return [hi, 0];
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (rt[m] <= t) lo = m; else hi = m; }
    return [lo, (t - rt[lo]) / Math.max(1e-6, rt[hi] - rt[lo])];
  }
  R.start = function () {
    if (R.on || !R.ready()) return false;
    if (!R.rec.sealed) { R.recording = false; seal(); }
    const r = R.rec, rg = RG();
    // what to put back afterwards: the skier as it stands, the mode, the hour, the view, the rings
    const keep = new Float64Array(r.lay.N); pack(r.lay, keep);
    const L = rg && rg.line;
    P.saved = { line: L ? { parked: L.parked, braking: L.braking } : null, inp: typeof Input !== 'undefined' ? { script: Input.script, fa: Input.faScript } : null, buf: keep, mode: G.mode, clock: typeof Sky !== 'undefined' ? Sky.clock : 0, view: G.view, rings: rg ? rg.rings : null, passed: rg ? rg.passed : 0, missed: rg ? rg.missed : 0, ts: G.timeScale, runT: G.runT };
    R.on = true; G.mode = 'replay'; P.t = 0; P.last = -1; P.play = true; P.speed = 1; P.hideUI = false; P.splitI = 0; P.idle = 0;
    if (rg && rg.cardShow) rg.cardShow(false);
    build(); el.root.classList.add('on'); appEl().classList.add('replay');
    R.cam = null; setCam('chase');
    applyFrame(0, false);
    return true;
  };
  function stop(quiet) {
    if (!R.on) return;
    R.on = false;
    const s = P.saved, r = R.rec, rg = RG();
    if (s && r) { unpack(r.lay, s.buf, null, 0); G.mode = s.mode === 'replay' ? 'park' : s.mode; G.runT = s.runT; G.timeScale = 1; if (typeof Sky !== 'undefined') Sky.setClock(s.clock); G.setView(s.view, true); if (rg) { rg.rings = s.rings || []; rg.passed = s.passed; rg.missed = s.missed; } }
    // (the rings' line stops the skier past the finish and stands him there; what it was doing is put back as it was: 92_rings.js L.parked, L.braking)
    if (s && s.line && rg && rg.line) { rg.line.parked = s.line.parked; rg.line.braking = s.line.braking; }
    if (s && s.inp && typeof Input !== 'undefined') { Input.script = s.inp.script; Input.faScript = s.inp.fa; }
    G.events.length = 0;
    if (el) { el.root.classList.remove('on'); appEl().classList.remove('replay', 'rp-bare'); }
    if (!quiet && rg && rg.cardShow) rg.cardShow(true);
  }
  R.stop = () => stop(false);

  // put the run's moment P.t on the figure, the rings and the clocks. events: also play what happened between the last frame shown and this one
  function applyFrame(dt, events) {
    const r = R.rec, [k, u] = frameAt(P.t), F = r.frames;
    unpack(r.lay, F[k], F[k + 1], u);
    G.runT = r.runT[k] + ((r.runT[k + 1] || r.runT[k]) - r.runT[k]) * u;
    if (typeof Sky !== 'undefined') Sky.setClock(r.clock[k]);
    if (events && P.last >= 0 && k > P.last && k - P.last < 600) for (let i = P.last + 1; i <= k; i++) if (r.ev[i]) for (const e of r.ev[i]) G.events.push(Object.assign({}, e));
    P.last = k; P.k = k; P.u = u;
    R.Tr = r.T[k] + ((r.T[k + 1] || r.T[k]) - r.T[k]) * u;
  }
  // Game.update, while a replay plays: the frame is set before the game's own update (no physics steps in mode 'replay'), the pose and the
  // root again after it has worked out its own from the state (07_game.js G.afterPose), so the lens and everything after see the run's
  const U0 = G.update;
  G.update = function (dt) {
    if (!R.on) { U0.call(this, dt); if (R.recording && R.rec) { R.rec.lastDt = dt; record(dt); } return; }
    R.guard(); if (!R.on) { U0.call(this, dt); return; }
    marksOnce();
    const rdt = App.dtReal || dt;
    if (P.play) { P.t += rdt * P.speed; if (P.t >= R.rec.dur) { P.t = R.rec.dur; P.play = false; paint(); } }
    applyFrame(dt, P.play);
    R.pendingPose = true;
    U0.call(this, dt);
    R.pendingPose = false;
    // the world's clock for the next frame: the run's own slow motion, times the replay's speed (stood still: a whisker above nothing, so
    // the springs of the lens and the figure still settle on the real clock where they ask for it)
    const ts = R.rec.ts[P.k] || 1; G.timeScale = P.play ? Math.max(1e-4, ts * P.speed) : 1e-4;
    // the snow thrown by the skis: the run's own emission, once a frame from the state put back
    if (P.play && dt > 1e-5 && typeof Spray !== 'undefined' && Spray.onStep) { const n = Math.min(4, Math.ceil(dt / (1 / 120))); for (let i = 0; i < n; i++) Spray.onStep(S, dt / n, App.t); }
    hudFrame();
  };
  // (07_game.js calls this between the pose and the lens: the pose and the root are the run's, not what the update made of the state)
  G.afterPose = function () { if (!R.on || !R.pendingPose) return; const r = R.rec, [k, u] = frameAt(P.t); unpack(r.lay, r.frames[k], r.frames[k + 1], u); };

  // the rings: 92_rings.js calls this each frame of the replay (Game.mode 'replay'), T its own clock
  const hookRings = () => {
    const rg = RG(); if (!rg || rg._replayHooked) return !!rg;
    rg._replayHooked = true;
    rg.hooks.go.push(info => begin(info));
    rg.hooks.finish.push(o => finish(o));
    rg.cardButtons.push({ label: '回放', key: 'R', on: () => R.start() });
    rg.replay = T => { if (R.on && R.rec) ringsAt(R.Tr, T); };
    return true;
  };
  if (!hookRings() && typeof addEventListener !== 'undefined') addEventListener('load', hookRings);

  // ---- what is on the screen: in the game's own look (template.html: --snow, --dim, --faint, --hair, --sun; Jost light for figures, the Song
  // serif for names, small spaced capitals for labels, dark glass on the picture, a hairline of amber as the accent), as the rings' card has it
  let el = null;
  const appEl = () => document.getElementById('app') || document.body;
  const fmt = t => { t = Math.max(0, t); const m = Math.floor(t / 60), x = t - m * 60; return m + ':' + (x < 10 ? '0' : '') + x.toFixed(1); };
  function build() {
    if (el || typeof document === 'undefined') return;
    const d = document.createElement('div'); d.id = 'replay';
    d.innerHTML = '<style>'
      + '#app.replay #hud,#app.replay #bar,#app.replay #menu,#app.replay #say,#app.replay #shade,#app.replay #title,#app.replay #pause,#app.replay #steer,#app.replay #rline{visibility:hidden!important;opacity:0!important;pointer-events:none!important;transition:none!important}'
      + '#replay{position:absolute;inset:0;display:none;z-index:6;font-family:var(--f-ui);color:var(--snow);text-shadow:0 1px 16px rgba(5,8,13,.55);-webkit-user-select:none;user-select:none}#replay.on{display:block}'
      + '#replay .surf{position:absolute;inset:0;touch-action:none}'
      + '#replay .ui{transition:opacity .45s}#app.rp-bare #replay .ui{opacity:0;pointer-events:none}#replay.idle .bt0{opacity:0;pointer-events:none}'
      + '#replay .tag{position:absolute;top:var(--gt);left:var(--gl);display:flex;align-items:center;gap:10px;font-family:var(--f-lat);font-weight:500;font-size:11px;letter-spacing:.4em;color:var(--dim);line-height:36px}'
      + '#replay .tag i{width:7px;height:7px;border-radius:50%;background:#ff7a66;box-shadow:0 0 10px #ff7a66}#replay .tag em{font-family:var(--f-song);font-style:normal;font-size:13px;letter-spacing:.3em;color:var(--snow)}'
      + '#replay .x{position:absolute;top:var(--gt);right:var(--gr);width:36px;height:36px;border-radius:999px;background:rgba(5,8,13,.36);box-shadow:inset 0 0 0 1px rgba(244,247,251,.16);display:grid;place-items:center;pointer-events:auto;cursor:pointer}'
      + '#replay svg{width:16px;height:16px;display:block;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}'
      + '#replay .tm{position:absolute;top:var(--gt);left:50%;transform:translateX(-50%);font-family:var(--f-lat);font-weight:300;font-size:clamp(26px,6.4vmin,42px);line-height:1;letter-spacing:.02em;font-variant-numeric:tabular-nums}'
      + '#replay .sub{position:absolute;top:calc(var(--gt) + clamp(34px,7.6vmin,50px));left:50%;transform:translateX(-50%);font-weight:500;font-size:11px;letter-spacing:.3em;margin-right:-.3em;color:var(--dim);white-space:nowrap}'
      + '#replay .spl{position:absolute;top:calc(var(--gt) + clamp(56px,11vmin,74px));left:50%;transform:translateX(-50%);font-size:12px;letter-spacing:.1em;font-variant-numeric:tabular-nums;opacity:0;transition:opacity .45s;white-space:nowrap}#replay .spl.on{opacity:1}#replay .spl .k{font-family:var(--f-song);letter-spacing:.2em;color:rgba(244,247,251,.82);margin-right:1em}'
      + '#replay .bt0{position:absolute;left:var(--gl);right:var(--gr);bottom:var(--gb);background:rgba(5,8,13,.52);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-radius:12px;box-shadow:inset 0 0 0 1px var(--hair);padding:12px 16px 12px;text-shadow:none;pointer-events:auto}'
      + '#replay .tl{position:relative;height:22px;margin:0 2px 10px;cursor:pointer;touch-action:none}#replay .tl .rail{position:absolute;top:10px;left:0;right:0;height:2px;border-radius:1px;background:rgba(244,247,251,.18)}'
      + '#replay .tl .done{position:absolute;top:10px;left:0;height:2px;border-radius:1px;background:var(--snow)}#replay .tl .kn{position:absolute;top:4px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:var(--snow);box-shadow:0 0 0 4px rgba(244,247,251,.12)}'
      + '#replay .tl .st{position:absolute;top:5px;width:1px;height:12px;background:rgba(244,247,251,.35)}#replay .tl .rd{position:absolute;top:17px;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:rgba(244,247,251,.55)}#replay .tl .rd.m{background:#ff9d8c}'
      + '#replay .row{display:flex;align-items:center;gap:8px;min-width:0}#replay .row .gap{flex:1}#replay .t{font-family:var(--f-lat);font-weight:300;font-size:13px;letter-spacing:.06em;font-variant-numeric:tabular-nums;color:var(--dim);white-space:nowrap;min-width:92px}'
      + '#replay button{appearance:none;-webkit-appearance:none;margin:0;border:0;height:32px;padding:0 12px;border-radius:10px;font-family:var(--f-ui);font-size:12px;letter-spacing:.12em;cursor:pointer;color:var(--dim);background:rgba(5,8,13,.25);box-shadow:inset 0 0 0 1px var(--hair);white-space:nowrap;display:inline-flex;align-items:center;gap:6px;transition:color .2s,box-shadow .2s;-webkit-tap-highlight-color:transparent}'
      + '#replay button.on{color:var(--sun);background:rgba(255,208,138,.08);box-shadow:inset 0 0 0 1px var(--sun)}#replay button.pp{width:40px;padding:0;justify-content:center;color:var(--snow)}'
      + '@media (hover:hover){#replay button:hover{color:var(--snow);box-shadow:inset 0 0 0 1px rgba(244,247,251,.5)}#replay button.on:hover{color:#ffe2b5;box-shadow:inset 0 0 0 1px #ffe2b5}}'
      + '#replay kbd{font-family:var(--f-lat);font-size:.85em;letter-spacing:.04em;opacity:.55}#replay .sp{display:flex;gap:4px}#replay .sp button{padding:0 9px}#replay .sep{width:1px;height:20px;background:var(--hair);margin:0 4px;flex:none}'
      + '#replay .cams{display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}#replay .cams::-webkit-scrollbar{display:none}#replay .cams button{font-family:var(--f-song);letter-spacing:.2em}#replay .more{display:none}'
      // (a phone on its side: the cameras stand down the right edge, under the thumb, the six most used; the rest behind 更多)
      + '@media (max-height:520px){#replay .cams{position:absolute;right:var(--gr);top:calc(var(--gt) + 46px);bottom:calc(var(--gb) + 70px);flex-direction:column;align-items:flex-end;overflow-y:auto;overflow-x:visible;pointer-events:auto}'
      + '#replay .cams button{background:rgba(5,8,13,.42);height:30px}#replay .cams button.on{background:rgba(5,8,13,.55)}#replay .cams kbd{display:none}#replay .cams button.x6{display:none}#replay .cams.all button.x6{display:inline-flex}#replay .more{display:inline-flex}#replay .row .sep.c,#replay .row kbd{display:none}#replay .t{min-width:0}}'
      + '</style>'
      + '<div class="surf"></div>'
      + '<div class="ui"><div class="tag"><i></i><em>回放</em>REPLAY</div><button class="x" data-a="x" aria-label="退出回放"><svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15"/></svg></button>'
      + '<div class="tm"></div><div class="sub"></div><div class="spl"></div>'
      + '<div class="bt0"><div class="tl"><div class="rail"></div><div class="done"></div><div class="mk"></div><div class="kn"></div></div>'
      + '<div class="row"><button class="pp" data-a="pp" aria-label="播放/暂停"></button><button data-a="re" aria-label="从头"><svg viewBox="0 0 20 20"><path d="M4.5 10a5.5 5.5 0 1 0 1.8-4.1"/><path d="M4.2 3.6v3h3"/></svg></button><span class="t"></span>'
      + '<span class="sp">' + SPEEDS.map(s => '<button data-sp="' + s + '">' + (s === 0.25 ? '¼' : s === 0.5 ? '½' : s) + '×</button>').join('') + '</span><span class="sep c"></span>'
      + '<span class="cams">' + CAMS.map(([id, n], i) => '<button data-cam="' + id + '"' + (i >= 6 ? ' class="x6"' : '') + '>' + n + '<kbd>' + ((i + 1) % 10) + '</kbd></button>').join('') + '<button class="more" data-a="more">更多</button></span>'
      + '<span class="gap"></span><button data-a="hide">隐藏<kbd>H</kbd></button></div></div></div>';
    appEl().appendChild(d);
    el = { root: d, q: s => d.querySelector(s) };
    // the camera buttons move to the edge of a phone on its side: they are taken out of the bar there, so the bar's own hiding does not take them
    d.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('button'); if (!b) return;
      e.stopPropagation(); wake();
      if (b.dataset.cam) setCam(b.dataset.cam);
      else if (b.dataset.sp) { P.speed = +b.dataset.sp; paint(); }
      else if (b.dataset.a === 'pp') toggle();
      else if (b.dataset.a === 're') { P.t = 0; P.last = -1; P.splitI = 0; P.play = true; paint(); }
      else if (b.dataset.a === 'x') stop(false);
      else if (b.dataset.a === 'hide') bare(true);
      else if (b.dataset.a === 'more') { el.q('.cams').classList.toggle('all'); }
      if (b.blur) b.blur();
    });
    // the time line: pressed or dragged, the replay goes to that moment (and holds there while it is held)
    const tl = el.q('.tl'); let scrub = null;
    const seek = e => { const r = tl.getBoundingClientRect(), u = clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1); P.t = u * R.rec.dur; P.last = -1; P.splitI = splitIndex(); paint(); };
    tl.addEventListener('pointerdown', e => { e.stopPropagation(); scrub = { play: P.play }; P.play = false; tl.setPointerCapture(e.pointerId); seek(e); wake(); });
    tl.addEventListener('pointermove', e => { if (scrub) seek(e); });
    const up = () => { if (!scrub) return; P.play = scrub.play && P.t < R.rec.dur; scrub = null; paint(); };
    tl.addEventListener('pointerup', up); tl.addEventListener('pointercancel', up);
    // the picture: a tap brings the words back (or hides them, when they are there and it is playing); a drag turns 环绕
    const sf = el.q('.surf'); let drag = null;
    sf.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, moved: false }; sf.setPointerCapture(e.pointerId); });
    sf.addEventListener('pointermove', e => {
      if (!drag) { wake(); return; }
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
      if (drag.moved && R.cam === 'orbit') { orb.drag = 1; orb.az -= dx * 0.008; orb.el = clamp(orb.el + dy * 0.006, -0.05, 1.2); }
    });
    const end = () => { if (!drag) return; const tap = !drag.moved; drag = null; orb.drag = 0; if (tap) { if (appEl().classList.contains('rp-bare')) bare(false); else wake(); } };
    sf.addEventListener('pointerup', end); sf.addEventListener('pointercancel', end);
    sf.addEventListener('wheel', e => { if (R.cam === 'orbit') { orb.r = clamp(orb.r * (e.deltaY > 0 ? 1.08 : 0.93), 2.5, 14); e.preventDefault(); } }, { passive: false });
    marks();
  }
  // the stations (thin lines) and the rings (dots: pale passed, red missed) along the time line
  function marks() {
    const r = R.rec, mk = el && el.q('.mk'); if (!mk || !r) return;
    const at = rt => (clamp(rt / Math.max(1e-6, r.dur), 0, 1) * 100).toFixed(2) + '%';
    const rtOfRun = t => { const i = r.runT.findIndex(x => x >= t); return i < 0 ? r.dur : r.rt[i]; };
    const rtOfT = T => { const i = r.T.findIndex(x => x >= T); return i < 0 ? r.dur : r.rt[i]; };
    let h = '';
    const sp = r.fin && r.fin.splits || []; for (let i = 0; i < sp.length - 1; i++) h += '<i class="st" style="left:' + at(rtOfRun(sp[i])) + '"></i>';
    for (const q of r.ringList || []) if (q.pass >= 0 && !q.fin) h += '<i class="rd' + (q.hit ? '' : ' m') + '" style="left:' + at(rtOfT(q.pass)) + '"></i>';
    mk.innerHTML = h;
  }
  function drawCard() { if (el) { el.q('.mk').innerHTML = ''; } }
  function paint() {
    if (!el || !R.rec) return;
    el.q('.pp').innerHTML = P.play ? '<svg viewBox="0 0 20 20"><path d="M7 4.5v11M13 4.5v11"/></svg>' : '<svg viewBox="0 0 20 20"><path d="M6.5 4.5l9 5.5-9 5.5z"/></svg>';
    for (const b of el.root.querySelectorAll('[data-sp]')) b.classList.toggle('on', +b.dataset.sp === P.speed);
    for (const b of el.root.querySelectorAll('[data-cam]')) b.classList.toggle('on', b.dataset.cam === R.cam);
  }
  function bare(on) { P.hideUI = on; appEl().classList.toggle('rp-bare', on); if (!on) wake(); }
  function wake() { P.idle = 0; if (el) el.root.classList.remove('idle'); }
  function toggle() { if (P.t >= R.rec.dur - 1e-3) { P.t = 0; P.last = -1; P.splitI = 0; } P.play = !P.play; paint(); wake(); }
  function splitIndex() { const sp = R.rec.fin && R.rec.fin.splits || []; let i = 0; while (i < sp.length && sp[i] <= G.runT + 1e-6) i++; return i; }
  // each frame: the clock as it ran (penalties in it, as the run's own clock had them), the rings so far, a station's time as it is reached
  function hudFrame() {
    if (!el) return;
    const r = R.rec, f = r.fin || {}, pen = f.missed > 0 ? (f.score - f.t) / f.missed : 0, c = R.ringCount || { pass: 0, miss: 0 };
    const done = G.runT >= (f.t || Infinity) - 1e-6;
    const tm = done ? fmt(f.score) : fmt(G.runT + c.miss * pen);
    const T = el.q('.tm'); if (T.textContent !== tm) T.textContent = tm; T.style.color = done ? 'var(--sun)' : '';
    const sub = (f.name || '') + '　光圈 ' + c.pass + ' / ' + (c.pass + c.miss) + (c.miss ? '　罚时 +' + Math.round(c.miss * pen * 10) / 10 + ' 秒' : ''), sb = el.q('.sub'); if (sb.textContent !== sub) sb.textContent = sub;
    const sp = f.splits || [], nm = f.names || [];
    if (P.play && P.splitI < sp.length && G.runT >= sp[P.splitI]) {
      const i = P.splitI, d = sp[i] - (i ? sp[i - 1] : 0), e = el.q('.spl');
      e.innerHTML = '<span class="k">' + (i === sp.length - 1 ? '终点' : (nm[i] || i + 1)) + '</span>' + fmt(d); e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('on'), 2200);
      P.splitI++;
    }
    const t = el.q('.t'), tt = fmt(P.t) + ' / ' + fmt(r.dur); if (t.textContent !== tt) t.textContent = tt;
    const u = (clamp(P.t / Math.max(1e-6, r.dur), 0, 1) * 100).toFixed(2) + '%'; el.q('.done').style.width = u; el.q('.kn').style.left = u;
    // the bar fades after a few seconds left alone while it plays; the picture is all there is then
    P.idle += App.dtReal || 1 / 60; el.root.classList.toggle('idle', P.play && P.idle > 3.5);
  }

  // ---- keys. R on the result card starts it; while it plays, the replay's keys and nothing else (no steering, no menu, no restart)
  if (typeof addEventListener !== 'undefined') addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!R.on) {
      const rg = RG(), L = rg && rg.line, card = L && L.el && L.st === 'done' && L.el.querySelector('.card.on');
      if (e.code === 'KeyR' && !e.repeat && card && R.ready()) { e.preventDefault(); e.stopImmediatePropagation(); R.start(); }
      return;
    }
    e.preventDefault(); e.stopImmediatePropagation(); if (e.repeat && !/^Arrow/.test(e.code)) return;
    const c = e.code;
    if (c === 'Escape') stop(false);
    else if (c === 'Space' || c === 'Enter' || c === 'KeyP') toggle();
    else if (c === 'ArrowLeft' || c === 'ArrowRight') { P.t = clamp(P.t + (c === 'ArrowLeft' ? -5 : 5), 0, R.rec.dur); P.last = -1; P.splitI = splitIndex(); wake(); }
    else if (c === 'Minus' || c === 'NumpadSubtract' || c === 'Equal' || c === 'NumpadAdd') { const i = SPEEDS.indexOf(P.speed) + (c === 'Minus' || c === 'NumpadSubtract' ? -1 : 1); P.speed = SPEEDS[clamp(i, 0, SPEEDS.length - 1)]; paint(); wake(); }
    else if (/^Digit\d$/.test(c)) { const d = +c.slice(5), i = d === 0 ? 9 : d - 1; setCam(CAMS[i][0]); wake(); }
    else if (c === 'KeyV' || c === 'KeyC') { const i = CAMS.findIndex(x => x[0] === R.cam); setCam(CAMS[(i + (e.shiftKey ? CAMS.length - 1 : 1)) % CAMS.length][0]); wake(); }
    else if (c === 'KeyH') bare(!P.hideUI);
    else if (c === 'KeyM' || c === 'KeyF') { if (typeof UI !== 'undefined') { if (c === 'KeyM' && UI.sound) UI.sound(!Sound.on); if (c === 'KeyF' && UI.fullscreen) UI.fullscreen(); } }
  }, true);

  // whatever takes the game elsewhere (the title, a new mountain, the menu's restart) ends the replay quietly
  R.guard = function () { if (R.on && typeof UI !== 'undefined' && UI.state !== 'run') stop(true); };
  // (App is made after this file, 99_main.js: the guard is asked from the replay's own update below, never at load)
  let marked = null; function marksOnce() { if (marked !== R.rec) { marked = R.rec; marks(); } }
  R.state = () => ({ on: R.on, recording: R.recording, frames: R.rec ? R.rec.frames.length : 0, dur: R.rec && R.rec.dur, t: P.t, cam: R.cam, play: P.play, speed: P.speed, sealed: !!(R.rec && R.rec.sealed) });      // (for test scripts)
  R.seek = t => { P.t = clamp(t, 0, R.rec ? R.rec.dur : 0); P.last = -1; P.splitI = splitIndex(); };
  R.setCam = setCam; R.setSpeed = s => { P.speed = s; paint(); }; R.pause = on => { P.play = !on; paint(); }; R.bare = bare;
  R.frameOf = () => R.rec ? R.rec.frames[P.k] : null; R.layout = () => R.rec && R.rec.lay;
  return R;
})();
