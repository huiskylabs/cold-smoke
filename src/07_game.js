// ---------------------------------------------------------------- input (tilt / drag / keys) and the skiing itself: physics, camera, body language
const Input = (() => {
  // keys: how far across the hill the line has to have come (rad off the way down) before a key still held asks for more than a carve, and
  // where it asks for all of it; and how long (s) a key has to be held to do the same wherever the line points
  const K_A0 = 0.70, K_A1 = 1.05, K_T0 = 1.8, K_T1 = 2.6;
  // when a held key breaks from the carve into a skid is a matter of taste, so the owner picks: as it was (after 0.6 s, in every long turn,
  // and let go again as the line comes across the hill), once the turn is finished (the line across the hill) or the key has been held
  // about two seconds, or only once the turn is finished. In the last two the skid stays for as long as the key does: a brake
  Variants.def('keys', '键盘转弯', [['a', '按半秒就搓'], ['b', '按两秒才搓'], ['c', '横过来才搓']], 'b');
  // the feel of the skiing (a player's notes, 2026-11-13: the drag of the snow, the body's weight going over in a turn, speed and momentum).
  // a: as it was. b: the edges hold only so much (past it the skis wash out sideways, scrubbing speed: a hard turn at speed is a wide one);
  // the faster the heavier the body is to throw from edge to edge; a key comes on over a third of a second; the snow is stickier crawling,
  // the edges' friction grows with how hard a turn presses them, deep powder drags as deep as the skis ride in it (and less as they plane
  // up); the body goes over before the edges do, sinks onto a loaded turn, rides forward into a turn and back out of it. Default b since
  // the owner skied it (2026-11-13) (see the 'feel' notes through step() and updatePose)
  Variants.def('feel', '滑行手感', [['a', '现在的'], ['b', '新的']], 'b');
  // fore and aft (a skier's note, 2026-11-13: left/right is only half of it; pressure moved between the shovels and the tails, timed with the
  // turn, is what decides a carve from a skid). a: none, as before (up jumps, down tucks). b: up / W presses the shovels, down / S the tails,
  // nothing held is centred and skis exactly as a; the jump is Space alone and the tuck moves to Shift. On a touch screen the steering finger
  // does both: across turns, up presses the shovels, down the tails. Read in step() ('fore/aft') and updatePose; works on top of feel b
  // (default b since the owner skied it, 2026-11-13)
  Variants.def('fa', '前后重心', [['a', '关'], ['b', '开']], 'b');
  const I = { u: 0, fa: 0, faV: 0, faT: 0, faScript: null, btn: { jump: false, tuck: false }, jump: false, tuck: false, mode: 'touch', tiltOK: false, tiltSeen: -1e9, gx: 0, zero: 0, keys: {}, drag: null, kb: 0, kHeld: 0, kWas: 0, script: null, used: false };
  I.init = function (el) {
    addEventListener('keydown', e => { if (e.code !== I.mute) I.keys[e.code] = true; }); addEventListener('keyup', e => { I.keys[e.code] = false; if (e.code === I.mute) I.mute = null; });
    // (I.mute: a key the interface has used, held down still: a space that confirmed a menu or started the run is not also a jump)
    el.addEventListener('pointerdown', e => { const x = View.x(e), y = View.y(e); I.drag = { id: e.pointerId, x0: x, x, y0: y, y }; try { el.setPointerCapture(e.pointerId); } catch (_) { } });
    el.addEventListener('pointermove', e => { if (I.drag && e.pointerId === I.drag.id) { I.drag.x = View.x(e); I.drag.y = View.y(e); } });
    const up = e => { if (I.drag && e.pointerId === I.drag.id) I.drag = null; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    addEventListener('blur', () => { I.keys = {}; I.drag = null; });
    // where the browser hands out tilt without asking (Android), listen from the start: the title page can then tell which way up it is held
    /*web{*/ try { if (typeof DeviceOrientationEvent !== 'undefined' && !DeviceOrientationEvent.requestPermission) { addEventListener('deviceorientation', I.onOrient); I.listening = true; } } catch (e) { } /*}web*/
  };
  // sideways component of gravity in screen space: the same number whether the phone is held upright like a wheel or flat like a tray
  I.onOrient = function (e) {
    if (e.beta == null || e.gamma == null) return;
    const b = e.beta * PI / 180, g = e.gamma * PI / 180, gx = Math.cos(b) * Math.sin(g), gy = -Math.sin(b);
    if (View.gravity(gx) && I.onFlip) I.onFlip();                                          // held the other way up: turn the picture over
    const ang = View.angle();
    I.gx = ang === 90 ? -gy : ang === 270 ? gy : ang === 180 ? -gx : gx;
    if (I.zeroPending) { I.zero = clamp(I.gx, -0.3, 0.3); I.zeroPending = false; }       // however the phone is held as the run starts is 'straight ahead'
    I.tiltSeen = performance.now(); I.tiltOK = true;
  };
  // must be called from a tap (iOS asks for permission); resolves true if motion events may arrive.
  // (/*web{*/ … /*}web*/ is left out of the 小红书 小工具 build, where device orientation is switched off and the finger steers: tools/build-xhs.js)
  I.requestTilt = async function () {
    /*web{*/ try {
      if (typeof DeviceOrientationEvent === 'undefined') return false;
      if (DeviceOrientationEvent.requestPermission) { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return false; }
      if (!I.listening) { addEventListener('deviceorientation', I.onOrient); I.listening = true; } return true;
    } catch (e) { return false; } /*}web*/
    return false;
  };
  I.tiltLive = () => I.tiltOK && performance.now() - I.tiltSeen < 600;
  I.update = function (dt) {
    const k = (I.keys.ArrowRight || I.keys.KeyD ? 1 : 0) - (I.keys.ArrowLeft || I.keys.KeyA ? 1 : 0);
    // a key is all or nothing, and all of the steering is a skid. So a key asks for a carve: it aims inside the carve range for as long as
    // the turn is still coming round, however the keys are linked. The skid is what a skier does when the turn is finished and the speed
    // has to go: with the key still down as the line comes across the hill (or held for longer than a linked turn lasts) it goes on
    // toward full, the farther across the more, and the skis are thrown sideways and brake
    I.kHeld = k && k === I.kWas ? I.kHeld + dt : 0; I.kWas = k;
    const kv = Variants.val.keys, hd = k * (Game.s.hdOff || 0), far = kv === 'a' ? (I.kHeld > 0.6 ? smooth(1.04, 0.80, hd) : 0) : Math.max(smooth(K_A0, K_A1, hd), kv === 'c' ? 0 : smooth(K_T0, K_T1, I.kHeld));
    const fb = Variants.val.feel === 'b';
    if (!fb) I.kb = damp(I.kb, k * (0.66 + 0.34 * far), k ? (kv === 'a' && far ? 2.5 : 6) : 10, dt);
    else {
      // (feel b: a key is a leg pressing, not a switch. It comes on through a critically damped spring, nine tenths of the way in 0.35 s,
      // starting gently and settling without overshoot, and lets go in 0.2 s; the reach for a skid beyond the carve goes the same way)
      const want = k * (0.66 + 0.34 * far), on = Math.abs(want) >= Math.abs(I.kb) && want * I.kb >= 0, w = (on ? 11 : 19) * (kv === 'a' && far && k ? 0.5 : 1);
      const x = I.kb - want, vv = I.kbV || 0, e = Math.exp(-w * dt), bb = (vv + w * x) * dt; I.kb = want + (x + bb) * e; I.kbV = (vv - w * bb) * e;
    }
    if (!fb) I.kbV = 0;
    let t = 0;
    if (I.drag) { t = clamp((I.drag.x - I.drag.x0) / (Math.min(View.w || innerWidth, (View.h || innerHeight) * 1.4, 900) * 0.2), -1, 1); if (fb) t = sign(t) * Math.max(0, Math.abs(t) - 0.04) / 0.96; I.mode = 'touch'; }
    else if (I.tiltLive()) { const d = I.gx - I.zero; t = clamp(sign(d) * Math.max(0, Math.abs(d) - 0.025) / 0.40, -1, 1); I.mode = 'tilt'; }
    t = clamp(t + I.kb, -1, 1);
    if (I.script != null) t = I.script;
    if (Math.abs(t) > 0.25) I.used = true;
    I.u = t;
    // the two moves besides steering, each one thing held down: jump (Space, or W / ArrowUp) and tuck-or-pole (ArrowDown or S).
    // On a touch screen the interface's buttons set I.btn; the physics reads I.jump and I.tuck
    const K = I.keys;
    if (Variants.val.fa !== 'b') { I.jump = !!(K.Space || K.KeyW || K.ArrowUp || I.btn.jump); I.tuck = !!(K.ArrowDown || K.KeyS || I.btn.tuck); I.fa = I.faV = I.faT = 0; return; }
    // (fore/aft b: up / W the shovels (+1), down / S the tails (-1); the jump is Space alone, the tuck Shift. A key comes on as a leg moves the
    // weight, not at a blow: the same critically damped spring as the steering keys, nine tenths of the way in about a third of a second.
    // The steering finger's height from where it came down does the same, at the same scale as across; a script, if set, overrides both)
    I.jump = !!(K.Space || I.btn.jump); I.tuck = !!(K.ShiftLeft || K.ShiftRight || I.btn.tuck);
    const kf = (K.ArrowUp || K.KeyW ? 1 : 0) - (K.ArrowDown || K.KeyS ? 1 : 0);
    { const want = kf, w = Math.abs(want) >= Math.abs(I.fa) && want * I.fa >= 0 ? 11 : 15, x = I.fa - want, vv = I.faV, ee = Math.exp(-w * dt), bb = (vv + w * x) * dt; I.fa = want + (x + bb) * ee; I.faV = (vv - w * bb) * ee; }
    let f = I.fa;
    if (I.drag && I.drag.y0 != null) { const L = Math.min(View.w || innerWidth, (View.h || innerHeight) * 1.4, 900) * 0.2, dy = clamp((I.drag.y0 - I.drag.y) / L, -1, 1); f += sign(dy) * Math.max(0, Math.abs(dy) - 0.08) / 0.92; }
    I.faT = clamp(I.faScript != null ? I.faScript : f, -1, 1);
  };
  return I;
})();

const Game = (() => {
  const G = { mode: 'title', t: 0, runT: 0, timeScale: 1, shake: 0, fovKick: 0, events: [], onStep: null, dist: 0, drop: 0, topSpeed: 0 };
  // the body on its legs: stiffness about the stance and toward the end of the travel, damping as they fold and (more) as they push back, how
  // far the legs reach down (E_MAX) and fold (E_MIN) from where they stand, the most they press in a turn or a dip and in a hard landing, how
  // fast the load that others read may change, how much of a mogul the body is told about and what a field of them costs, what a landing
  // costs (speed owed per m/s of speed into the snow, beyond what legs take in their stride), how fast a leg can follow snow that falls away
  // and how far the legs reach out for a landing; how fast the edges' grip follows the load, and how fast the skis are swung into a skid
  const GRAV = 9.81, K_LEG = 95, K3_LEG = 420, C_LEG = 16, C_REB = 40, E_MAX = 0.22, E_MIN = -0.30, N_MAX = 7 * GRAV, N_HARD = 14 * GRAV, N_SLEW = 2 * GRAV * 120, MOG_K = 0.45, MOG_MU = 0.12, LAND_K = 0.3, LAND_V0 = 3, LEG_V = 4, LEG_AIR = 0.18, BITE_K = 4, BETA_W = 15, H = 1 / 120;
  // (feel b) the most the edges hold across the line, in parts of the load, on packed snow and in deep powder; the snow's friction there at speed;
  // the drag of powder ploughed, per metre of depth the skis ride at (m/s^2 per m)
  const GRIP_B = [1.0, 0.95], MU_B = [0.035, 0.04], PLOW_K = 3.5;
  // the jump: time to wind up, how far the legs fold for it, the speed a tap and a full wind-up give, how long the drive lasts; how far a tuck sits down
  const CHG_T = 0.65, CHG_E = 0.27, POP_V0 = 1.5, POP_V1 = 3.3, POP_T = 0.14, TUCK_E = 0.07;
  // the wind-up: the body starts down at once and slows into the bottom of the crouch, where it stays while the key is held (owner 2026-11-12)
  const chgK = t => { const x = sat(t / CHG_T); return 1 - (1 - x) * (1 - x); };
  // the double-pole stroke: its length (s), the phase of the plant and of the end of the drive, what one stroke is worth from rest (m/s), the
  // speed above which poling gives nothing and the skier tucks instead, and the speed at which the strokes that leave the start stop
  const DP_T = 0.95, DP_PLANT = 0.22, DP_END = 0.62, DP_DV = 1.6, V_POLE = 9.5, V_GLIDE = 6.5;
  const V_AUTO = 3.3, V_AUTO1 = 4.6;        // the skier poles by itself under 12 km/h, and keeps on to 16.5 km/h
  const S = G.s = {
    p: [0, 0, 0], v: [0, 0, 0], n: [0, 1, 0], t: [0, 0, -1], r: [1, 0, 0], h: 0, e: 0, air: false, airT: 0, speed: 0, lean: 0, leanV: 0, beta: 0, load: GRAV,
    aReac: 0, aSkid: 0, aCarve: 0, tuck: 0, tuckT: 0, powder: 0.25, landV: 0, crash: 0, brush: 0, u: 0, contact: true, hdot: 0,
    // for the others to read: the jump's wind-up 0..1, the player's own tuck 0..1, how airborne 0..1 (smooth), the phase of the double-pole
    // stroke (0 = none), and how far the legs are folded or reached out from the stance (m, E_MIN..E_MAX, never jumps: the skis are at p.y - leg)
    charge: 0, tuckIn: 0, airK: 0, dp: 0, leg: 0,
  };
  // (the physics' own book-keeping for the moves; set whenever the skier is put somewhere)
  const still = () => { S.charge = S.tuckIn = S.airK = S.dp = S.leg = 0; S.betaV = 0; S.bite = GRAV; S.jOn = false; S.jT = 0; S.jLock = true; S.popT = -1; S.popV = 0; S.lift = false; S.dpGo = 0; S.owe = 0; S.load = GRAV; S.airT = 0; S.landV = 0; S.off = 0; S.hdOff = 0; S.pdep = 0; S.aDrag = 0; S.wash = 0; };
  still();
  // the chase camera when the picture is wide (the way the game is meant to be held): how low the skier sits in the frame, lens, distance, height
  // (wd, wh, wf: among trees it comes that much nearer (m), lower (m) and wider (rad): see cam.wood)
  G.camL = { k: 0.52, kf: 0.74, f0: 0.98, f1: 1.18, d0: 4.3, d1: 3.8, h0: 1.35, h1: 1.1, wd: 1.3, wh: 0.25, wf: 0.06 };
  // the hands and poles while skiing (see updatePose): a as before (hands low, the plant only in slow linked turns); b: hands ahead at the belt,
  // a plant at every edge change; c: the same, carried higher and wider, the outside hand thrown on round the turn (a freeride look)
  // HANDS: [wider, higher, further forward, higher and further forward for the outside hand, the same for the inside one] in metres, added to the stance's own
  const HANDS = { a: [0, 0, 0, 0, 0, 0, 0], b: [0.03, 0.07, 0.07, 0.04, 0.05, 0.12, 0.10], c: [0.06, 0.12, 0.10, 0.08, 0.09, 0.16, 0.12] }, PL_LEAD = 0.16, PL_HOLD = 0.14;
  if (typeof Variants !== 'undefined') Variants.def('poles', '持杖', [['a', '原样'], ['b', '手在前'], ['c', '更舒展']], 'b');
  // how the body moves under what the physics does (see updatePose, "motion"): a as before (the trunk turns with the skis, the poles swing on a clock);
  // b: shoulders and head stay on the fall line while the legs turn under them, a flex-and-rise through each edge change, a landing that is
  // soaked up and comes back past level once, a little chatter from the snow at speed
  if (typeof Variants !== 'undefined') Variants.def('motion', '人物动作', [['a', '原来'], ['b', '新的']], 'b');
  // (the lens among trees is the owner's to choose. a: as it was. b: it closes up, and a tree in its way fades before it is reached.
  // c: it stays where it was, and only the fading is early. 14_trees.js reads the same choice for the fading)
  if (typeof Variants !== 'undefined') Variants.def('wood', '林间镜头', [['a', '现在的'], ['b', '贴近'], ['c', '原位淡树']], 'b');
  // each kind of run its own picture (the owner's choice 'shots'; a: one picture everywhere, the sun and the city always top centre).
  // Per kind: the lens higher (m), its angle narrower (-) or wider (rad; the distance makes up, so the figure keeps its size), the skier
  // lower in the frame (+, the horizon with it), and a swing round the skier (rad; its side alternates from one section to the next) that
  // carries the sun and the city across the picture. Steeps: high and long, down the fall line. Ridge: low, the horizon low, swung out over
  // one of the two drops. Gully: low between the walls. Glade: close, as it was. The open runs between are swung wide, three-quarter views
  const SHOTS = { steeps: [-0.2, -0.08, 0, 0.06], ridge: [-0.35, 0.03, 0.12, 0.32], gully: [-0.3, 0.05, 0.03, 0], glade: [0, 0, 0, 0], bowl: [0.15, -0.05, 0, 0.34], powder: [0.3, -0.02, 0.05, 0.24], rollers: [-0.2, 0.03, 0.08, 0.2], moguls: [0.25, -0.03, -0.02, 0.14], kickers: [0, 0, 0, 0.12] }, SH0 = [0, 0, 0, 0];
  // c (the owner's ask, 2026-11-12): the same chase camera everywhere, only nudged per kind of run, and gently: a little closer or further,
  // a little higher or lower, the framing tipped a little up or down. Never swung round the skier (no side views), never the gully's low bank.
  const SHOTS_C = {}; for (const k in SHOTS) { const t = SHOTS[k]; SHOTS_C[k] = [t[0] * 0.35, t[1] * 0.5, t[2] * 0.5, 0]; }
  if (typeof Variants !== 'undefined') Variants.def('shots', '分段机位', [['a', '不变'], ['b', '按路段大变'], ['c', '轻微变化']], 'c');
  // on the title page, with no sun ahead, the lens looks a little to the left of the valley (and the skier stands on the right third, see updateCamera)
  G.titleYaw = -0.05;
  const cam = G.cam = { pos: [0, 3, 8], yaw: 0, roll: 0, fov: 1.3, anchor: [0, 0, 0], pitch: -0.2, side: 0, gy: 0, init: false, fwd: [0, 0, -1] };
  const pc = {}, tn = { ok: false }, tnc = { ok: false };
  let acc = 0;

  G.reset = function (s0 = 14) {
    const c = Course.at(s0, pc), x = c.cx, z = -s0, h = Course.height(x, z, 0.5);
    S.p = [x, h, z]; S.v = [0, 0, 0]; S.lean = S.leanV = S.beta = 0; S.air = false; S.speed = 0; S.tuck = 0; S.crash = 0; S.h = h; S.e = 0;
    const n = Course.normal(x, z, 0.35); S.n = [n[0], n[1], n[2]]; S.t = [0, 0, -1]; S.r = [1, 0, 0];
    cam.init = false; G.runT = 0; G.dist = 0; G.drop = 0; G.topSpeed = 0; G.y0 = h; acc = 0; pose.init = false;
    still();
  };

  function step(dt, u) {
    const p = S.p, v = S.v, n = S.n, FB = typeof Variants !== 'undefined' && Variants.val.feel === 'b';
    Course.mogK = MOG_K; const h = Course.height(p[0], p[2], 0.5), nn = Course.normal(p[0], p[2], 0.35); n[0] = nn[0]; n[1] = nn[1]; n[2] = nn[2]; Course.mogK = 1;
    const c = Course.at(-p[2], pc); S.powder = c.powder; S.h = h; S.u = u;
    let e = p[1] - h, vn = v[0] * n[0] + v[1] * n[1] + v[2] * n[2];
    // out of leg. What is left of the speed INTO the snow is lost in the blow: it is taken along the snow's own normal, so the speed along
    // the slope is kept and nothing is added. (Setting the vertical speed alone, as this did, pushed the body up any face that rose under it
    // without touching its speed over the ground.) A share of the blow is owed as speed: the skis punch in and plough
    if (e < E_MIN) { if (vn < 0) { S.owe += 0.25 * -vn; v[0] -= n[0] * vn; v[1] -= n[1] * vn; v[2] -= n[2] * vn; vn = 0; } p[1] = h + E_MIN; e = E_MIN; }
    S.hdot = -(n[0] * v[0] + n[2] * v[2]) / n[1]; S.e = e;
    // skis on the snow? While they are, the legs follow it down as far as they reach (E_MAX below the stance) and no faster than a leg can
    // be straightened: where the snow falls away quicker than that (the lip of a jump) the skis are off it at once, with the legs as they
    // were; and at the end of the drive of a jump the legs stop following (S.lift), so the skis come up with the body. Once off, the skis
    // meet the snow again only by coming down onto it. S.leg is how far the legs are folded (below 0) or reached out (above): on the snow
    // it is e itself; in the air it is held, and eased out for the landing on the way down from any real height. So it never jumps, and
    // the skis are always at p.y - S.leg
    const contact = S.air || S.lift ? e < S.leg : e < Math.min(E_MAX, S.leg + LEG_V * dt); S.lift = false;
    if (contact) S.leg = e; else if (S.leg > LEG_AIR || v[1] < S.hdot && e - S.leg > 0.25) S.leg += clamp((LEG_AIR - S.leg) * 6, -2, 2) * dt;
    // touchdown. landV is the speed INTO the snow, across its surface none: a landing that meets the slope is free, a flat one is paid for
    // in speed (the skis are driven in and plough: owed here, taken off over the next tenth of a second or so)
    if (S.air && contact) { S.air = false; S.landV = Math.max(0, -vn); S.owe += LAND_K * Math.pow(Math.max(0, S.landV - LAND_V0), 1.15) * (0.85 + 0.5 * S.powder); G.events.push({ type: 'land', v: S.landV, airT: S.airT }); }
    else if (!S.air && !contact) { S.air = true; S.airT = 0; G.events.push({ type: 'takeoff' }); }
    if (S.air) S.airT += dt;
    S.contact = contact;
    // how airborne, for whoever blends a pose or a lens on it (S.air is the switch, for logic): it comes in over the first fifth of a
    // second off the snow, is whole once the skis are well clear, eases as the snow comes back up and runs out over a tenth of a second after touchdown
    S.airK = damp(S.airK, S.air ? lerp(0.55, 1, smooth(0, 0.4, e - S.leg)) * smooth(0.02, 0.2, S.airT) : 0, S.air ? 14 : 16, dt);
    // tangent frame on the snow: t along travel, r to the skier's right
    let tx = v[0] - n[0] * vn, ty = v[1] - n[1] * vn, tz = v[2] - n[2] * vn; const sp = Math.hypot(tx, ty, tz);
    let fx = n[0] * n[1], fy = n[1] * n[1] - 1, fz = n[2] * n[1]; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;    // fall line
    if (sp < 0.3) { tx = fx; ty = fy; tz = fz; } else { tx /= sp; ty /= sp; tz /= sp; }
    const rx = ty * n[2] - tz * n[1], ry = tz * n[0] - tx * n[2], rz = tx * n[1] - ty * n[0];
    S.t[0] = tx; S.t[1] = ty; S.t[2] = tz; S.r[0] = rx; S.r[1] = ry; S.r[2] = rz; S.speed = sp;

    // ---- the player's own moves
    const sound = contact && S.crash <= 0, calm = Math.abs(S.lean) < 0.3 && Math.abs(u) < 0.6;
    // jump. Held on the snow, the legs fold and wind up (S.charge, full in under half a second); let go, they drive the body up off the
    // snow along its normal: a tap is a hop, a full wind-up a real jump, and more again when the snow is pressing back (in the kick of a
    // ramp, the bottom of a dip). The drive is a force through the legs over a tenth of a second, not a change of speed out of nowhere
    if (!Input.jump) S.jLock = false;
    let go = S.jOn && !(Input.jump && !S.jLock);
    if (Input.jump && !S.jLock) {
      S.jOn = true; if (sound) S.jT += dt;
      // (still held as the lip of a jump or the crest of a roller arrives: the legs fire by themselves, timed so that the drive ends where the snow falls away)
      if (sound && S.jT > 0.1 && sp > 4) { const d = sp * (POP_T + 0.02); Course.mogK = MOG_K; go = h - (n[0] * tx + n[2] * tz) / n[1] * d - Course.height(p[0] + tx * d, p[2] + tz * d, 0.5) > 0.5; Course.mogK = 1; if (go) S.jLock = true; }
    }
    if (go) {
      if (sound && S.jT > 0) { S.popV = lerp(POP_V0, POP_V1, chgK(S.jT)) * (1 + 0.3 * sat((S.load / GRAV - 1.1) / 0.6)); S.popT = 0; }
      S.jOn = false; S.jT = 0;
    }
    S.charge = S.jOn ? chgK(S.jT) : Math.max(0, S.charge - dt / 0.07);
    let nPop = 0;
    if (S.popT >= 0) { const q = S.popT / POP_T, sq = Math.sin(PI * q); if (q >= 1 || !contact) { S.popT = -1; S.lift = contact; } else { nPop = S.popV * 2 / POP_T * sq * sq; S.popT += dt; } }
    // accelerate: one control. Slow, the skier double-poles, stroke after stroke (S.dp is the phase of the stroke: reach, plant at 0.22, drive
    // to 0.62, release, recover); poles do nothing for a skier already moving faster than arms can push, so above V_POLE the same control is a
    // tuck (S.tuckIn). The stroke in hand is always finished first. Leaving the start is the same stroke, up to three, until the slope takes over
    if (S.dpGo > 0 && sp >= V_GLIDE) S.dpGo = 0;
    // (and by itself, as any skier does: slow on the snow and not turning hard, the skier poles, stroke after stroke, without being asked:
    // on a flat, in deep snow off the run, getting going again after a tree. It starts under V_AUTO and keeps on to V_AUTO1, then glides)
    // (a key held at that speed does not stop it: there the key turns the skis only a little and no longer skids them, see su below; it
    // waits only for a body that is over on an edge or skis that are across)
    S.autoP = sound && Math.abs(S.lean) < 0.16 && Math.abs(S.beta) < 0.25 && !S.jOn && sp < (S.autoP ? V_AUTO1 : V_AUTO);
    const more = sound && (calm && (S.dpGo > 0 || Input.tuck && sp < V_POLE - 1) || S.autoP);
    if (S.dp > 0) {
      const q0 = S.dp;
      if (q0 < DP_PLANT && !(sound && (calm || S.autoP))) S.dp = Math.max(0, q0 - 2 * dt / DP_T);       // not planted and no longer possible (off the snow, hard over, hit): the hands come back
      else { S.dp = q0 + dt / DP_T; if (q0 < DP_PLANT && S.dp >= DP_PLANT) G.events.push({ type: 'pole' }); if (S.dp >= 1) { S.dp = more ? S.dp - 1 + 1e-4 : 0; if (more && S.dpGo > 0) S.dpGo--; } }
    } else if (more) { S.dp = 1e-4; if (S.dpGo > 0) S.dpGo--; }
    let aPole = 0;
    if (S.dp > DP_PLANT && S.dp < DP_END && contact) { const sq = Math.sin(PI * (S.dp - DP_PLANT) / (DP_END - DP_PLANT)); aPole = DP_DV * Math.max(0, 1 - Math.pow(sp / V_POLE, 1.5)) * 2 * sq * sq / ((DP_END - DP_PLANT) * DP_T); }
    S.tuckIn = damp(S.tuckIn, Input.tuck && S.dp === 0 && S.crash <= 0 ? 1 : 0, 5, dt);

    // ---- legs: a damped spring along the snow's normal that can only push. It is soft about the stance (one more g sits the body a hand
    // lower, so a dip and a crest can be seen) and stiffens toward the end of its travel. A wind-up or a tuck lowers where it wants to stand
    const cn = (-(CHG_E * S.charge + TUCK_E * S.tuckIn) - e) * n[1];
    let N = 0;
    if (contact) {
      // (they give way faster than they push back: what a landing puts into them is soaked up, not thrown back as a bounce)
      N = clamp(GRAV * n[1] + (cn > 0 ? K_LEG * cn + K3_LEG * cn * cn * cn : K_LEG * cn) - (vn < 0 ? C_LEG : C_REB) * vn, 0, N_MAX);
      // a hard landing is more than that spring holds. Then the legs do what a skier's do: press as hard as it takes to bring the body to
      // rest within the fold they have left, steadily, instead of running out of leg with speed in hand (up to twice the usual limit)
      if (vn < 0) { const a = vn * vn / (2 * Math.max(0.02, (e - E_MIN - 0.03) * n[1])); N = Math.max(N, Math.min(N_HARD, (GRAV * n[1] + a) * smooth(1.5 * GRAV, 3 * GRAV, a))); }
      if (nPop > 0) N = Math.max(N, GRAV * n[1]) + nPop;
    }
    // (what the others read as the load comes on and goes off over a few steps, never in one; the force itself is the legs' own)
    S.load = clamp(N, S.load - 0.35 * N_SLEW * dt, S.load + N_SLEW * dt);
    // what the edges have to work with. The legs' force comes and goes with every ripple of the snow (over a roll at speed it is nothing at
    // all for a tenth of a second), but an edge in its groove does not let go and take hold again that fast: it bites with the mean load
    // of the last quarter of a second or so (never more than twice the skier's weight: a landing is not a turn), and lets go, over a few
    // steps, only when the skis really leave the snow
    S.bite = damp(S.bite, contact ? Math.min(N, 2 * GRAV) : 0, contact ? BITE_K : 30, dt);

    // ---- off the run. Nothing steers or pushes the skier back onto it: beyond the edge gravity takes the skier wherever the land falls, as
    // anywhere else. (What did, a force toward the run's centre line and after it a steer added to the player's and an edge held against
    // the flank, read as an invisible hand dragging the skier back up against gravity.) What keeps a skier near the run is what can be
    // seen: the land (03_course.js: banks rise either side; off a ridge the flank runs down into hollows whose floors climb back to a
    // shoulder level with the run) and the snow, deep and unpacked off the run, which drags (below)
    const eo = Math.abs(p[0] - c.cx) - c.hw; S.off = eo;
    // (no steering turns the skier on round until it faces up the hill: as the line swings across the slope the lean asked for fades to
    // nothing, so a turn held too long ends as a traverse, still going down; height is only ever won on speed already in hand. The slope is
    // the land's own under the skier, its fall line taken over some fifteen metres so that a bump or a roller does not swing it, the same on
    // the run and off it; where the land lies nearly level there is no 'up the hill' and nothing fades. It acts on the player's own steering
    // only, and never turns the skier anywhere)
    let uE = u, hd = 0;
    { const gx = Course.height(p[0] - 15, p[2], 2) - Course.height(p[0] + 15, p[2], 2), gz = Course.height(p[0], p[2] - 15, 2) - Course.height(p[0], p[2] + 15, 2), gl = Math.hypot(gx, gz);
      const w = smooth(0.06, 0.15, gl / 30);
      if (sp > 1.5 && w > 0) { hd = Math.atan2(v[0], -v[2]) - Math.atan2(gx, -gz); hd -= TAU * Math.round(hd / TAU); hd *= w; if (u * hd > 0) uE = u * smooth(1.30, 0.80, Math.abs(hd)); } }
    S.hdOff = hd;

    // the player leans; the lean is what turns the skis (tucked, the body cannot be thrown over as far, nor the skis pivoted)
    const gn = GRAV * n[1];
    const phiMax = Math.min(0.96, Math.atan(Math.max(sp, 2.5) ** 2 / (10.5 * gn))) * (1 - 0.3 * S.tuckIn);
    const cu = clamp(uE / 0.72, -1, 1), phiT = sign(cu) * Math.pow(Math.abs(cu), 1.2) * phiMax * (S.air && S.airT > 0.14 ? 0.3 : 1) * (1 - 0.28 * smooth(0.72, 1.0, Math.abs(u)));
    // (feel b: the faster, the a little heavier the body is to throw over: the same spring up to 50 km/h, four fifths as quick from 108. Only a
    // hint of the momentum: heavier than that read as true but tiring to ski, turn after turn (owner, 2026-11-13: real vs fun, keep it light))
    // ---- fore/aft (Variants 'fa' b, on feel b). fa: where the weight is along the skis, +1 on the shovels, -1 on the tails, 0 centred (and then
    // nothing below changes anything). ph: where in the turn the skier is, from the line against the fall line: +1 at the top of a turn (still
    // above the fall line, the edges just coming up), -1 at the bottom (past it, the turn finishing), nothing running straight or where the land
    // lies level. Pressing the shovels: the tips bite, so the body goes over quicker; at the top that is a carve that hooks up and holds a little
    // better, held on through the bottom it lightens the tails and they wash out into a skid that brakes (the way to scrub speed). Pressing the
    // tails: the tips are light, so the edges come up slower and the arc is wider; through the bottom the tails hold and the ski runs on out of
    // the turn with less drag; sat back at the top the tips do not hook and the skis wash. Timed right (forward in, back out) is the clean carve
    const FA = FB && Variants.val.fa === 'b' && !S.air;
    let fa = 0, ph = 0, gripFA = 1, turnFA = 1, dragFA = 1;
    if (FA) {
      fa = S.fa = clamp(Input.faT || 0, -1, 1);
      ph = clamp(-sign(S.lean) * hd / 0.55, -1, 1) * smooth(0.06, 0.22, Math.abs(S.lean));
      const top = Math.max(ph, 0), bot = Math.max(-ph, 0);
      if (fa > 0) gripFA = 1 + fa * (0.25 * top - 0.55 * bot);
      else { const k = -fa; gripFA = 1 + k * (0.15 * bot - 0.35 * top); turnFA = 1 - 0.4 * k; dragFA = 1 - 0.6 * k * bot; }
      // (shovels pressed through the bottom of a turn swing the tails out by themselves, a skid that is seen and heard even in a gentle turn)
      S.faKick = fa > 0 ? fa * bot * smooth(0.1, 0.3, Math.abs(S.lean)) * smooth(6, 12, sp) : 0;
      S.faPh = ph; S.faGrip = gripFA;
    } else { S.fa = 0; S.faPh = 0; S.faGrip = 1; S.faKick = 0; }
    const wn = (S.air ? 5 : FB ? lerp(9.5, 7.5, smooth(14, 30, sp)) : 9.5) * (1 + 0.5 * fa), zeta = 0.92;
    S.leanV += (wn * wn * (phiT - S.lean) - 2 * zeta * wn * S.leanV) * dt; S.lean += S.leanV * dt;
    // past the carve range the skis are pivoted across the direction of travel: a skid that brakes and throws snow. Only when asked for:
    // rolling from one edge to the other does not swing the skis. They are swung, and let come back, as a leg moves them, not at a blow
    // (their rate of turn never jumps); and never on round past straight across the hill: there the skid is a brake and nothing else
    // (and only with speed to scrub: crawling, a key held hard is a skier trying to turn, not to stop, and swinging the skis across then
    // only stalled the skier where it stood, in a skid at walking pace, the key still held. Under 9 km/h it does not skid at all, full from 22)
    const su = sign(u) * smooth(0.72, 1.0, Math.abs(u)) * (1 - 0.8 * S.tuckIn) * smooth(2.5, 6, sp);
    // (feel b: what the edges can hold. A carve asks for bite * tan(lean) across the line; the snow gives at most GRIP_B of the load (less in
    // powder). Asked for more, the skis wash out: the line turns only as fast as the grip allows and what is left over swings the tails out
    // into a skid, 0.6 rad of skid for each whole grip asked for beyond it, which brakes and throws snow. So the same full turn is a tight
    // carve at 30 km/h and, at 80, a wide arc that scrubs speed: nothing is on rails)
    const gripB = (FB ? lerp(GRIP_B[0], GRIP_B[1], S.powder) : 1) * gripFA;
    const exB = FB && contact && sp > 3 ? Math.max(0, Math.abs(Math.tan(S.lean)) * lerp(1.0, 0.8, S.powder) / gripB - 1) * smooth(3, 8, sp) : 0; S.wash = exB;
    { const w = contact ? BETA_W : 9, bMax = su * hd > 0 ? Math.max(0, PI / 2 - Math.abs(hd)) : 9, bT = contact ? clamp(su * 0.62 + sign(S.lean) * Math.min(0.75, 0.6 * exB) * (1 - Math.abs(su)) + sign(S.lean) * 0.35 * (S.faKick || 0) * (1 - Math.abs(su)), -bMax, bMax) : 0; S.betaV += (w * w * (bT - S.beta) - 2 * w * S.betaV) * dt; S.beta += S.betaV * dt; }
    let aLat = 0, aTan = aPole; S.aReac = 0; S.aSkid = 0; S.aCarve = 0;
    if (contact) {
      const grip = lerp(1.0, 0.8, S.powder), sb = Math.sin(S.beta), cb = Math.cos(S.beta);
      const aC = S.bite * Math.tan(S.lean) * grip * turnFA;
      const aSk = (0.95 + 0.25 * S.powder) * S.bite * sat(Math.abs(sb) / 0.34) * smooth(0.5, 3, sp);
      // (the part of a skid that turns the skier fades as the carve's does: nothing swings the line on round up the hill)
      // (feel b: the carve's own push is held to the grip; a skid pushes too, as the tails scrape round, but all of it together no more than
      // half as much again as the grip: the edge of the turn is felt, not a wall at twice the skier's weight)
      const aCb = FB ? clamp(aC, -gripB * S.bite, gripB * S.bite) : aC;
      const lim = (FB ? gripB * 1.5 : 1.95) * S.bite, aReac = clamp(aCb + aSk * cb * sign(sb) * (sb * hd > 0 ? smooth(1.30, 0.80, Math.abs(hd)) : 1), -lim, lim);
      // the snow's friction. a: one number per kind of snow. b: stickier at a crawl (the skis have not yet warmed a film of water under them:
      // two and a half times at a standstill, as good as gone by 5 m/s), and pressing on the whole load the edges carry, the turn's push as
      // well as the weight; and deep powder ploughed: a drag as deep as the skis ride in it (the same depth the tracks draw, 17_tracks.js,
      // planing up to under half of it from 6 to 18 m/s), deeper and slower as they settle in than as they plane out, and up to twice as
      // much with the skis thrown across it
      const mog = c.mog > 0.01 ? MOG_MU * Course.bumps(p[0], p[2]) : 0, lowV = sat(sp / 0.6);       // (a field of bumps is slow going; the smooth line through it is not)
      let mu = lerp(0.028, 0.06, S.powder) + mog, plow = 0, Nf = N;
      if (FB) {
        mu = lerp(MU_B[0], MU_B[1], S.powder) * (1 + 1.5 * Math.exp(-sp / 1.5)) + mog; Nf = Math.hypot(N, aReac);
        // (only where the skis ride IN the snow, as the tracks have it (Tracks.deep): over the soft few centimetres on a packed run or among the
        // trees they ride on top and plough nothing to speak of)
        const pdv = { a: 0.10, b: 0.18, c: 0.50 }[Variants.val.pdepth] || 0.18, soft = pdv * S.powder * S.powder, dT = soft * smooth(0.05, 0.14, soft) * clamp(0.55 + 0.45 * S.load / GRAV, 0.7, 1.4) * lerp(1, 0.45, smooth(6, 18, sp));
        S.pdep = damp(S.pdep || 0, dT, dT > (S.pdep || 0) ? 5 : 1.7, dt);
        plow = PLOW_K * S.pdep * (1 + Math.abs(sb));
      }
      aLat = aReac; const aDr = (aSk * Math.abs(sb) + (0.05 * Math.abs(aCb) + mu * Nf) * dragFA + plow) * lowV; aTan -= aDr; S.aDrag = aDr;
      S.aReac = aReac; S.aSkid = aSk; S.aCarve = aC;
      if (S.crash > 0) { aTan -= 2.5 * lowV; }
      // (it slows, never stops: down any slope worth the name the skier still gathers speed off the run, only less of it. Tried at 1 + 0.008 v^2
      // it held a skier 25 m out to 30-40 km/h on a 20-degree pitch, and the owner felt it as gravity gone wrong (2026-11-12))
      if (eo > 0) aTan -= (0.3 + 0.0022 * sp * sp) * sat(eo / 16) * (1 - 0.5 * Math.max(c.ridge, sat((c.rtail - 0.74) / 0.26))) * sat(sp / 6);       // deep, unpacked snow off the run (wind-packed and firmer about a ridge)
      if (S.owe > 0) { const d = Math.min(S.owe, 16 * dt, sp); aTan -= d / dt; S.owe -= d; }
    }
    // the air drags on the whole of the speed, wherever it points (in flight too); a tuck halves it, and the player's own tuck counts for more than the one the body falls into at speed
    const sp3 = Math.hypot(v[0], v[1], v[2]), kd = lerp(0.0036, 0.0021, Math.max(0.55 * S.tuck, S.tuckIn)) * sp3;
    let ax = n[0] * N + rx * aLat + tx * aTan - kd * v[0], ay = -GRAV + n[1] * N + ry * aLat + ty * aTan - kd * v[1], az = n[2] * N + rz * aLat + tz * aTan - kd * v[2];
    if (contact && sp < 2.5) { const k = 1.6 * (1 - sp / 2.5); ax += fx * k; ay += fy * k; az += fz * k; }     // never stall: a gentle push down the fall line
    v[0] += ax * dt; v[1] += ay * dt; v[2] += az * dt;
    p[0] += v[0] * dt; p[1] += v[1] * dt; p[2] += v[2] * dt;
    // trees: brushing the branches slows a little and shakes snow loose, hitting a trunk throws the skier off line
    S.brush = Math.max(0, S.brush - dt * 3); S.crash = Math.max(0, S.crash - dt);
    Course.nearTree(p[0], p[2], tn);
    if (tn.ok && e < 2.5) {
      const trunk = 0.14 + tn.h * 0.012, d = tn.d;
      if (d < trunk + 0.30 && !tn.soft) {
        let nx = p[0] - tn.x, nz = p[2] - tn.z; const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
        const vd = v[0] * nx + v[2] * nz; if (vd < 0) { v[0] -= 1.5 * vd * nx; v[2] -= 1.5 * vd * nz; }
        const imp = Math.max(0, -vd); v[0] *= 0.45; v[2] *= 0.45; p[0] = tn.x + nx * (trunk + 0.31); p[2] = tn.z + nz * (trunk + 0.31);
        // (brought to a stop against it, the skier shuffles round it on the side the slope goes, instead of being held there by the slope)
        if (Math.hypot(v[0], v[2]) < 3) { let ux = -nz, uz = nx; if (ux * fx + uz * fz < 0) { ux = -ux; uz = -uz; } v[0] += ux * 1.5; v[2] += uz * 1.5; }
        if (S.crash <= 0.2) G.events.push({ type: 'crash', v: imp, x: tn.x, z: tn.z, h: tn.h, r: tn.r });
        S.crash = 0.9; S.leanV += (rx * nx + rz * nz) * 4;
      } else if (d < tn.h * 0.20 && sp > 3) {
        if (S.brush <= 0) G.events.push({ type: 'brush', x: tn.x, z: tn.z, h: tn.h, r: tn.r });
        S.brush = 1; const k = 1 - 0.28 * dt; v[0] *= k; v[2] *= k;
        // the boughs give, but only so far: inside half their reach they shoulder the skier back out
        const soft = tn.h * 0.115;
        if (d < soft) {
          let nx = p[0] - tn.x, nz = p[2] - tn.z; const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
          const push = (soft - d) * Math.min(1, 16 * dt); p[0] += nx * push; p[2] += nz * push;
          // ...and off to one side: the speed that was carrying the skier into the tree is turned along its flank, not lost
          const vd = v[0] * nx + v[2] * nz;
          if (vd < 0) { const kk = Math.min(1, 12 * dt), h0 = Math.hypot(v[0], v[2]); let ux = -nz, uz = nx; if (v[0] * ux + v[2] * uz < 0) { ux = -ux; uz = -uz; } v[0] -= vd * (nx + 0.75 * ux) * kk; v[2] -= vd * (nz + 0.75 * uz) * kk;
            const h1 = Math.hypot(v[0], v[2]); if (h1 > h0) { v[0] *= h0 / h1; v[2] *= h0 / h1; } }      // (turned, never sped up)
        }
      }
    }
  }

  // ---- body language: physical state -> pose parameters (smoothed where a real body would lag)
  const pose = G.pose = { init: false, lean: 0, bal: 0, edge: 0, crouch: 0.2, tuck: 0, air: 0, sep: 0, headYaw: 0, lead: 0, stance: 0.31, fore: 0, fa: 0, armL: [0, 0, 0], armR: [0, 0, 0], swing: 0, liftL: 0, liftR: 0, pitchL: 0, pitchR: 0, plantL: 0, plantR: 0, grabL: 0, grabR: 0, dp: 0, tilt: 0, rollL: 0, rollR: 0 };
  const root = G.root = { pos: [0, 0, 0], fwd: [0, 0, -1], nrm: [0, 1, 0] };

  // ---- flight: what a jump is going to be, worked out as the skis leave the snow (and a little before): how long in the air, what to do
  // with it, how slow the clock runs. Everything the body, the lens and the clock take from here is eased: nothing reads the bare S.air,
  // so nothing snaps when it flips.
  G.slowMo = 1; G.forceTrick = null;       // how much of the slow motion to apply (0: none); tests: the id of the trick to do next
  // (three numbers that belong to the physics, taken from it where it names them: how much of a mogul the body is told about, how fast a
  // leg can be straightened, and how far the legs are reached out for a landing. The legs that are drawn move no faster than 3.4 m/s,
  // folding or straightening: the knee bend the figure is given then never changes by more than 0.15 in a sixtieth of a second)
  const MOG = typeof MOG_K !== 'undefined' ? MOG_K : 0.34, V_LEG = Math.min(typeof LEG_V !== 'undefined' ? LEG_V : 4, 3.4), L_AIR = typeof LEG_AIR !== 'undefined' ? LEG_AIR : E_MAX;
  // how far the physics has the legs folded (below 0) or reached out (above), in metres: its skis are at p.y - leg. (S.leg where it keeps
  // one; the delivered physics has the legs follow the snow to their full reach and stay there in the air)
  const legP = () => S.leg !== undefined ? S.leg : S.contact ? Math.min(S.e, E_MAX) : E_MAX;
  const fl = G.flight = { P: [0, 0, 0], a: [0, -GRAV, 0], q: {}, lip: [0, 0], last: '', last2: '' };
  // a critically damped spring stepped exactly (stable whatever the frame time): o[k] follows `to`, o[k + 'V'] is its rate
  function spring(o, k, to, w, dt) { const kv = k + 'V', x = (o[k] || 0) - to, v = o[kv] || 0, e = Math.exp(-w * dt), b = (v + w * x) * dt; o[k] = to + (x + b) * e; o[kv] = (v - w * b) * e; return o[k]; }
  const bell = (a, b, c, d, x) => smooth(a, b, x) * (1 - smooth(c, d, x));                 // up between a and b, held, down between c and d
  const smax = (a, b, r) => 0.5 * (a + b + Math.sqrt((a - b) * (a - b) + r * r)), smin = (a, b, r) => 0.5 * (a + b - Math.sqrt((a - b) * (a - b) + r * r));
  // (the greater of two with a corner that ends: more than `r` apart, the lesser has no say at all)
  const cmax = (a, b, r) => { const h = Math.max(r - Math.abs(a - b), 0); return Math.max(a, b) + h * h / (4 * r); };
  // a turn of the body: from rest, a steady rate, slowing as the skier opens up for the landing (0..1 over phase 0..1)
  const turn = (u, a = 0.14, d = 0.24) => { const vc = 1 / (1 - a / 2 - d / 2); return u <= 0 ? 0 : u >= 1 ? 1 : u < a ? vc * u * u / (2 * a) : u < 1 - d ? vc * (u - a / 2) : 1 - vc * (1 - u) * (1 - u) / (2 * d); };

  // a line that rides on the snow `g` and has weight (o[k], its rate o[k + 'V']). It goes up with rising snow at once; where the snow falls
  // away from under it at a stroke (a lip) it comes down after it like a thing dropped, from the rate it had, never faster than `lim` m/s past
  // `vRef`; and within a metre of the snow and closing on it, it is braked onto it as on a cushion, to the snow's own rate: it neither
  // jumps down a cliff nor lands with a knock. (w: how hard it is drawn down)
  function weighted(o, k, g, vRef, w, dt, lim = 6) {
    const kV = k + 'V', kP = k + 'P', gR = clamp((g - o[kP]) / dt, -40, 40), gap = o[k] - g, near = smooth(1, 0.1, gap) * smooth(-0.3, 0.3, gR - o[kV]); o[kP] = g;
    o[kV] += lerp(-w * w * gap + 2 * w * (clamp(gR, vRef - lim, vRef + lim) - o[kV]), -144 * gap + 24 * (gR - o[kV]), near) * dt; o[k] += o[kV] * dt;
    if (o[k] <= g) { o[k] = g; o[kV] = Math.max(o[kV], gR); }
  }

  // the rest of a flight: the body's path marched forward over the snow, a thirtieth of a second at a time, under the acceleration `a`
  // it has been seen to have. Returns the seconds until the legs meet the snow again (0: they never really leave it)
  function airLeft(x, y, z, vx, vy, vz, a, maxT, leg) {
    const h = 1 / 30; Course.mogK = MOG; let g0 = Course.height(x, z, 0.5), e0 = y - g0 - leg, left = e0 > 0.02, t = 0, out = maxT;
    while (t < maxT) {
      x += (vx + 0.5 * a[0] * h) * h; y += (vy + 0.5 * a[1] * h) * h; z += (vz + 0.5 * a[2] * h) * h; vx += a[0] * h; vy += a[1] * h; vz += a[2] * h; t += h;
      const g = Course.height(x, z, 0.5);
      // (on the way down from any real height the legs are reached out for the landing, as the physics has them do)
      if (leg > L_AIR || vy * h < g - g0 && y - g - leg > 0.25) leg += clamp((L_AIR - leg) * 6, -2, 2) * h;
      const e = y - g - leg;
      if (e > 0.02) left = true; else if (left && e <= 0) { out = t - h + h * sat(e0 / (e0 - e)); break; } else if (!left && t > 0.3) { out = 0; break; }
      e0 = e; g0 = g;
    }
    Course.mogK = 1; return out;
  }
  // a lip ahead? The snow along the line being skied, sampled every twentieth of a second for the next half second: where it falls away
  // faster than a body can fall, the skis are about to leave it. fl.lipT = seconds until then, fl.lipAir = the flight it promises
  function scanLip(P, v, vh) {
    const dx = v[0] / vh, dz = v[2] / vh, st = vh * 0.05, at = s => Course.height(P[0] + dx * s, P[2] + dz * s, 0.5); Course.mogK = MOG;
    let g0 = at(0), g1 = at(st), j = 1, hit = false;
    for (; j <= 9; j++) { const g2 = at(st * (j + 1)); if (g2 - 2 * g1 + g0 < -1.15 * GRAV * 0.0025) { hit = true; break; } g0 = g1; g1 = g2; }
    if (!hit) { Course.mogK = 1; return; }
    // (where exactly, to a hand's breadth: the point past which the snow drops below the line it was keeping)
    let lo = st * j, hi = lo + st; const sl = (g1 - g0) / st;
    for (let i = 0; i < 4; i++) { const m = 0.5 * (lo + hi); if (g1 + sl * (m - st * j) - at(m) > 0.03) hi = m; else lo = m; }
    Course.mogK = 1; const s = 0.5 * (lo + hi), lx = P[0] + dx * s, lz = P[2] + dz * s;
    if (fl.lipAge > 0.3 || Math.hypot(lx - fl.lip[0], lz - fl.lip[1]) > 2.5) {      // a lip not seen before
      fl.lip[0] = lx; fl.lip[1] = lz; const c = 0.0036 * vh;
      fl.lipAir = airLeft(lx, g1 + sl * (s - st * j) + clamp(S.e, -0.1, 0.1), lz, v[0], sl * vh, v[2], [-c * v[0], -GRAV, -c * v[2]], 4, S.leg !== undefined ? clamp(S.e, -0.1, 0.1) : E_MAX);
    }
    fl.lipT = ((fl.lip[0] - P[0]) * dx + (fl.lip[1] - P[2]) * dz) / vh; fl.lipAge = 0;
  }

  // ---- tricks. Each is a shape the body takes and holds (legs, arms, skis) and perhaps a turn of the whole figure, laid out over phase
  // u = 0..1 of the usable air: set, into it, hold, spot the landing, open up. d = the side it goes to (-1 left, +1 right).
  // q: own = how much of the body the trick has taken over, c = knees up (the crouch it wants), yaw / flip = turns of the whole figure
  // (radians), dip = a sink on the snow, a* / b* = left / right hand offsets, the rest are pose parameters to add
  function clearQ(q) { q.own = q.c = q.tuck = q.sep = q.head = q.st = q.lead = q.lL = q.lR = q.pL = q.pR = q.gL = q.gR = q.rL = q.rR = q.air = q.fore = q.yaw = q.flip = q.dip = q.ax = q.ay = q.az = q.bx = q.by = q.bz = 0; return q; }
  const hands = (q, out, y, z, k) => { q.ax -= out * k; q.ay += y * k; q.az += z * k; q.bx += out * k; q.by += y * k; q.bz += z * k; };
  const hand = (q, side, out, y, z, k) => { if (side < 0) { q.ax -= out * k; q.ay += y * k; q.az += z * k; } else { q.bx += out * k; q.by += y * k; q.bz += z * k; } };
  // a hand on the ski beside the binding, knees drawn up to meet it, the free arm out for balance, that ski tipped up
  function grabShape(q, u, d, a, b) {
    const g = bell(a, a + 0.16, b - 0.18, b, u), kn = bell(a - 0.14, a + 0.08, b - 0.06, b + 0.12, u);
    if (d < 0) { q.gL = g; q.lL = 0.12 * kn; q.pL = 0.3 * kn; q.pR = -0.12 * kn; } else { q.gR = g; q.lR = 0.12 * kn; q.pR = 0.3 * kn; q.pL = -0.12 * kn; }
    q.c = Math.max(q.c, 0.93); q.own = Math.max(q.own, kn); q.tuck += 0.3 * kn; q.st -= 0.05 * kn; hand(q, -d, 0.2, 0.2, 0.06, kn);
  }
  // a spin of n half turns about the body's own axis (base: half turns already made, i.e. starting from switch)
  function spinShape(q, u, d, n, base, c) {
    const a = (base + n * turn(u)) * PI, b = bell(0.02, 0.2, 0.7, 0.95, u);
    q.yaw = d * a; q.c = c; q.own = b; q.tuck = 0.12 * b; q.sep = d * 0.38 * bell(0, 0.18, 0.28, 0.55, u);
    // (the head leads the turn and finds the landing before the body comes round to it; landed switch, it looks back down the hill)
    q.head = d * Math.min(Math.ceil((base + n) / 2) * TAU - a, 1.15) * (base ? 1 : smooth(0, 0.12, u));
  }
  const SHAPES = {
    // skis and hips twisted off to one side under shoulders that keep facing down the hill, and back
    shifty(q, u, d, tr) { const b = bell(0.03, 0.36, 0.54, 0.94, u); q.yaw = d * tr.amp * b; q.sep = -0.92 * q.yaw; q.c = 0.5; q.own = bell(0, 0.2, 0.72, 1, u); q.air = 0.5 * b; },
    // the same, one way and then the other
    twist(q, u, d, tr) { const e = bell(0, 0.14, 0.86, 1, u); q.yaw = d * tr.amp * 0.9 * Math.sin(TAU * u) * e; q.sep = -0.92 * q.yaw; q.c = 0.45; q.own = bell(0, 0.15, 0.8, 1, u); q.air = 0.45 * e; },
    // knees to the chest, hands on the shins
    tuck(q, u) { const b = bell(0.04, 0.34, 0.58, 0.93, u); q.c = 0.97; q.own = b; q.tuck = 0.3 * b; q.st = -0.06 * b; hands(q, -0.05, -0.16, -0.03, b); },
    // legs and arms flung wide: an X against the sky
    spread(q, u) { const b = bell(0.05, 0.3, 0.6, 0.93, u); q.c = 0.03; q.own = b; q.st = 0.7 * b; q.air = b; q.fore = 0.25 * b; hands(q, 0.10, 0.26, 0.04, b); },
    // the spread eagle (the owner: "空中的动作再加一个张腿的"): legs straight and flung apart in a wide V to the sides, each ski rolled up on its outer
    // edge with the leg (rollL/R) and its tip up, chest up, arms straight out and high; then the legs are drawn back together well before the snow (closed by 0.8 of the usable air,
    // which itself ends tOut before touchdown), so it never lands with the legs apart
    eagle(q, u) { const b = bell(0.06, 0.32, 0.56, 0.80, u); q.c = 0.02; q.own = bell(0, 0.22, 0.78, 0.97, u); q.st = 1.05 * b; q.lL = q.lR = 0.06 * b; q.rL = -0.62 * b; q.rR = 0.62 * b; q.pL = q.pR = 0.14 * b; q.air = b; q.fore = -0.15 * b; hands(q, 0.24, 0.30, 0.10, b); },
    // a stride in the air: one ski forward with its tip up, the other back with its tip down, arms opposite
    daffy(q, u, d) {
      const b = bell(0.05, 0.3, 0.6, 0.93, u); q.lead = d * 0.40 * b; q.c = 0.12; q.own = b; q.air = 0.3 * b;
      if (d > 0) { q.pR = 0.55 * b; q.pL = -0.7 * b; q.lL = 0.07 * b; } else { q.pL = 0.55 * b; q.pR = -0.7 * b; q.lR = 0.07 * b; }
      hand(q, -d, 0, 0.04, -0.18, b); hand(q, d, 0.04, 0, 0.2, b);
    },
    // knees bent back until the tails of the skis reach for the shoulders, back arched, arms up
    scratch(q, u) { const b = bell(0.06, 0.32, 0.58, 0.92, u); q.pL = q.pR = -0.8 * b; q.c = 0.55; q.own = b; q.fore = 0.6 * b; q.air = 0.65 * b; hands(q, 0.06, 0.2, 0.12, b); },
    grab(q, u, d) { grabShape(q, u, d, 0.2, 0.8); },
    180(q, u, d, tr) { spinShape(q, u, d, 1, tr.base || 0, 0.5); },
    360(q, u, d) { spinShape(q, u, d, 2, 0, 0.68); },
    540(q, u, d) { spinShape(q, u, d, 3, 0, 0.8); },
    720(q, u, d) { spinShape(q, u, d, 4, 0, 0.82); },
    '360grab'(q, u, d) { spinShape(q, u, d, 2, 0, 0.7); grabShape(q, u, d, 0.26, 0.74); },
    // a backward somersault, tucked: the tips come up and over
    flip(q, u) { const b = bell(0.06, 0.28, 0.66, 0.93, u); q.flip = TAU * turn(u, 0.18, 0.2); q.c = 0.92; q.own = bell(0.02, 0.22, 0.7, 0.95, u); q.tuck = 0.3 * b; hands(q, -0.04, -0.14, -0.03, b); },
    flipgrab(q, u, d) { SHAPES.flip(q, u); q.ax = q.ay = q.az = q.bx = q.by = q.bz = 0; grabShape(q, u, d, 0.24, 0.76); },
    // (riding switch after a half turn: a quick pivot on the snow brings the skier round to face the hill again)
    pivot(q, u, d) { spinShape(q, u, d, 1, 1, 0.3); q.dip = 0.22 * bell(0, 0.3, 0.35, 0.8, u); },
  };
  // the least usable air each needs (seconds), how often it is chosen, and how much air to spare it bears before it is a small thing
  // lost in a big flight (a tweak fills a hop; the biggest air goes to the turns, the somersaults and the combinations)
  const TRICKS = { 180: [0.5, 1.6, 0.25], 360: [0.62, 4, 0.4], 540: [1.05, 1.4, 0.8], 720: [1.25, 2.8, 1], shifty: [0.34, 3, 0.2], tuck: [0.34, 2, 0.2], spread: [0.42, 2.2, 0.22], daffy: [0.5, 2.2, 0.22], scratch: [0.5, 1.2, 0.22], twist: [0.66, 1.5, 0.25], grab: [0.6, 3, 0.3], '360grab': [0.9, 3, 0.8], flip: [0.9, 2.4, 0.7], flipgrab: [1.15, 2.2, 1], eagle: [0.75, 2.4, 0.45] };
  const PAIRS = ['shifty', 'tuck', 'spread', 'daffy', 'scratch', 'grab'];
  G.tricks = Object.keys(TRICKS);
  let rnd = RNG((Math.random() * 4294967296) >>> 0); G.trickSeed = n => { rnd = RNG(n >>> 0); fl.last = fl.last2 = ''; };
  function trickShape(tr, u, q) {
    clearQ(q); if (!tr) return q;
    if (tr.seq) { const i = u < 0.5 ? 0 : 1; SHAPES[tr.seq[i]](q, u * 2 - i, i ? -tr.dir : tr.dir, tr); } else SHAPES[tr.id](q, u, tr.dir, tr);
    // (a tweak squeezed into a short hop is made smaller, not quicker: limbs are not flung out and back at whip speed. tr.k: how much of it)
    if (tr.k < 1) { const c = q.c; for (const key in q) q[key] *= tr.k; q.c = c; }
    return q;
  }
  // which trick for U seconds of usable air: something that fills the time (little air: a tweak; more: a grab, a half or full turn; the
  // most: two turns, a somersault, or two shapes one after the other), never the one just done
  // (big: 2 off a marked jump, 1 for any other flight forecast to last 0.8 s or more, 0 for a hop. A hop off a mogul or the wall of a gully gets
  // a small shape at most; a big air off the terrain may turn, but only whole turns, so it always comes down facing forward; and off the terrain
  // there is one trick at most every HOP_GAP seconds of the game's time. Spun on every bump, landing backwards and pivoting round on the snow,
  // the figure turned round every few seconds and read as a glitch, not as style. Off a marked jump anything goes, as before)
  const HOP = { grab: 1, scratch: 1, spread: 1, tuck: 1, daffy: 1 }, HOP_GAP = 6, _kc = {};
  // (seen from inside the helmet, first person or the ski tips: only shapes that keep the body upright and facing the way the lens looks. A spin or a
  // somersault would turn the figure away under a lens that keeps looking down the valley; a helmet camera that spun with it is no way to ride. And
  // ones that read from in there: the spread and the eagle fling the skis out of the picture, and in a grab the head is folded out over the ski
  // tips with the hand on the ski behind and under the lens: nothing to see. A tuck, a daffy, a tail press: hands up in front, skis below)
  const FPOK = { scratch: 1, tuck: 1, daffy: 1 }, fpView = () => G.view === 'fp' || G.view === 'tips', fpOK = id => !fpView() || String(id).split('+').every(k => FPOK[k]);
  const offKicker = () => { const s0 = -fl.P[2]; for (let b = Math.floor((s0 - 40) / 32), e = Math.floor((s0 + 16) / 32); b <= e; b++) for (const f of Course.feats.get(b) || []) {
    if (!f.mark || f.kind !== 'kicker') continue; const ds = s0 - f.s; if (ds < -14 || ds > f.len + 8) continue; if (Math.abs(fl.P[0] - Course.at(f.s + f.len, _kc).cx - f.u) < f.wid * 0.5 + 2.5) return true; } return false; };
  const bigAir = pred => offKicker() ? 2 : pred >= 0.8 ? 1 : 0, ODD = id => /^(180|540)/.test(id);
  function pickTrick(U, big) {
    if (U < 0.34) return null;
    if (big < 2 && !G.forceTrick && fl.hopT != null && G.t >= fl.hopT && G.t - fl.hopT < HOP_GAP) return null;
    // (a spin goes the way the skier was last leaning, if any: carved into; n = its half turns)
    const mk = id => { const n = parseInt(id) / 180 || 0; return { id, n, spin: n > 0, base: 0, dir: n && Math.abs(S.lean) > 0.12 ? sign(S.lean) : rnd() < 0.5 ? -1 : 1, amp: 0.72 + 0.33 * rnd(), min: TRICKS[id] ? TRICKS[id][0] : 0 }; };
    if (G.forceTrick) { const ids = String(G.forceTrick).split('+').filter(id => SHAPES[id]); if (ids.length === 2) { const t = mk(ids[0]); t.id = ids.join('+'); t.seq = ids; t.spin = false; t.n = 0; t.min = 0; return t; } if (ids.length) { const t = mk(ids[0]); t.min = 0; return t; } }
    if (big && U >= 1.1 && rnd() < 0.35) {            // two shapes, one after the other
      const ok = PAIRS.filter(id => TRICKS[id][0] * 0.9 <= U / 2 && fpOK(id)), a = ok[Math.floor(rnd() * ok.length)], rest = ok.filter(id => id !== a), b = rest[Math.floor(rnd() * rest.length)];
      if (a && b && a + '+' + b !== fl.last) { const t = mk(a); t.id = a + '+' + b; t.seq = [a, b]; t.min = 1.0; return t; }
    }
    let tot = 0; const c = [];
    for (const id in TRICKS) {
      const m = TRICKS[id][0]; if (m > U || (!big && !HOP[id]) || (big < 2 && ODD(id)) || !fpOK(id)) continue;
      // (wanted most when the air is a little more than it needs: not rushed, and fading out as the air outgrows it)
      const wt = TRICKS[id][1] * sat((U - m) / 0.15 + 0.35) * Math.exp(-Math.max(0, U - m - 0.15) / TRICKS[id][2]) * (id === fl.last ? 0.04 : id === fl.last2 ? 0.4 : 1);
      c.push(id, wt); tot += wt;
    }
    let r = rnd() * tot; for (let i = 0; i < c.length; i += 2) { r -= c[i + 1]; if (r <= 0) return mk(c[i]); }
    return c.length ? mk(c[c.length - 2]) : null;
  }
  // (what was planned on the way in stands while it suits the air there is: with too little for it, or a good deal more than it was
  // chosen to fill, something else is picked; a turn keeps the side it has been wound up to)
  const planFor = (U, old, pred) => { const big = bigAir(pred); if (old && old.min <= U && U - old.U < 0.25 && (big === 2 || (big && !ODD(old.id)) || HOP[old.id] || G.forceTrick) && (fpOK(old.id) || G.forceTrick) && (!G.forceTrick || old.id === String(G.forceTrick))) return old; const t = pickTrick(U, big); if (t) { t.U = U; t.big = big; t.k = /\d|flip|grab/.test(t.id) ? 1 : clamp((t.seq ? U / 2 : U) / 0.62, 0.5, 1); if (old && old.spin && t.spin) t.dir = old.dir; } return t; };
  function startTrick(tr) { fl.tr = tr; fl.ph = 0; fl.swT = 0; if (tr.id !== 'pivot' && !tr.base) { fl.last2 = fl.last; fl.last = tr.id; G.events.push({ type: 'trick', id: tr.id, dir: tr.dir }); } }
  function flightReset() {
    Object.assign(fl, { air: false, on: false, t: 0, rem: 0, pred: 0, big: 0, w: 0, wV: 0, wu: 0, wuV: 0, plL: 0, plLV: 0, plR: 0, plRV: 0, kc: 0, kcV: 0, lipT: 9, lipAir: 0, lipAge: 9, prepL: 0, prepLV: 0, prep: 0, aK: 0, mL: 0, reach: 0, reachV: 0, soak: 0, soakV: 0, hit: 0, ph: 1, tr: null, plan: null, took: false,
      swT: 0, tOut: 0.2, ts: 1, tsV: 0, since: 9, fresh: 1, dep: 0, trick: '', sw: 0, dpK: 0, vp: null, tk: 0, tkV: 0, lean: 0, sepB: 0, hy: 0, hd: 0, hdV: 0, balG: 0, gk: 1, rl: 0, hold: 0, loadP: 0, stP: 0, pump: 0, crashK: 0, fy: 0, fr: 0, Xs: 0, sink: 0 });
    G.timeScale = 1; clearQ(fl.q);
  }
  flightReset();
  function updateFlight(dt, n) {
    const P = fl.P, p = S.p, v = S.v, q = fl.q;
    if (!pose.init) flightReset();
    P[0] = p[0] + v[0] * acc; P[1] = p[1] + v[1] * acc; P[2] = p[2] + v[2] * acc;        // where the body is at this instant (the physics stands a part of a step behind)
    const vh = Math.hypot(v[0], v[2]), sp = Math.hypot(vh, v[1]);
    if (S.air && !fl.air) {            // the skis have just left the snow
      const c = lerp(0.0036, 0.0025, S.tuck) * sp; fl.a[0] = -c * v[0]; fl.a[1] = -GRAV - c * v[1]; fl.a[2] = -c * v[2];
      fl.on = true; fl.took = false; fl.vp = null; fl.fresh = 0.45 + 0.55 * smooth(1, 5, fl.since);
    } else if (!S.air && fl.air) {     // ...and have met it again
      fl.on = false; fl.rem = 0; fl.plan = null; fl.mL = 1; if (fl.dep > 0.15) fl.since = 0;
      // (how heavy the landing is, 0..1: the legs soak it up, the lens dips, shakes a touch and opens for a moment)
      const h = sat((S.landV - 1.5) / 9) * (0.3 + 0.7 * fl.big); fl.hit = Math.max(fl.hit, h); G.shake = Math.max(G.shake, 0.03 * h); G.fovKick = Math.max(G.fovKick, 0.08 * h);
    }
    fl.air = S.air;
    if (fl.on) {
      // (the acceleration the body really has, whatever step() does with gravity and drag: the forecast follows it)
      if (n && fl.vp) { const hh = n * (G.hs || H), r = 1 - Math.exp(-8 * hh); for (let i = 0; i < 3; i++) fl.a[i] += ((v[i] - fl.vp[i]) / hh - fl.a[i]) * r; }
      if (n) fl.vp = [v[0], v[1], v[2]];
      fl.t = S.airT + acc; fl.rem = airLeft(P[0], P[1], P[2], v[0], v[1], v[2], fl.a, 4, legP()); fl.pred = fl.t + fl.rem; fl.big = smooth(0.25, 0.45, fl.pred);
      // what to do with it: chosen once, in the first moments (what was planned on the way in, if the air is there for it)
      if (!fl.took && fl.t < 0.25) {
        fl.tOut = clamp(0.2 * fl.pred, 0.2, 0.36); const U = fl.pred - 0.05 - fl.tOut, cur = fl.tr;
        if (cur && cur.id === 'pivot') fl.took = true;                                                                    // (already coming round)
        else if (cur) { if (U >= 0.3 && cur.spin && ((cur.base + cur.n) & 1)) startTrick({ id: '180', dir: cur.dir, spin: true, n: 1, base: 1, amp: 1, min: 0, big: 2 }); fl.took = true; }     // riding switch: a half turn back to forward (a shape still being let go of off the last hop is simply finished)
        else { const tr = planFor(U, fl.plan, fl.pred); if (tr) { startTrick(tr); fl.took = true; if (tr.big < 2) fl.hopT = G.t; } }
      }
    }
    // the lip ahead, while on the snow and moving
    fl.lipAge += dt; if (!S.air && vh > 5 && G.mode === 'run') scanLip(P, v, vh); if (fl.lipAge > 0.12) fl.lipT = 9;
    const lip = !S.air && fl.lipT < 0.45 && fl.lipAir >= 0.42;
    if (lip && !fl.tr) fl.plan = planFor(fl.lipAir - 0.05 - clamp(0.2 * fl.lipAir, 0.2, 0.36), fl.plan, fl.lipAir);
    if (!lip && !S.air && fl.lipAge > 0.6) fl.plan = null;
    // the trick runs on the time there is: its phase moves so as to be done `tOut` before the skis touch, however the forecast shifts
    const tr = fl.tr;
    if (tr) {
      if (tr.id === 'pivot') fl.ph = Math.min(1, fl.ph + dt / 0.5);
      else if (fl.on) { if (fl.t > 0.05) fl.ph = Math.min(1, fl.ph + dt * Math.min((1 - fl.ph) / Math.max(fl.rem - fl.tOut, 0.02), 6)); }
      else fl.ph = Math.min(1, fl.ph + dt * 6);                      // (met the snow early: what is left of it is finished there, quickly)
      trickShape(tr, fl.ph, q);
      if (fl.ph >= 1 && !fl.on) {
        if (!(tr.spin && ((tr.base + tr.n) & 1))) { fl.tr = null; clearQ(q); }
        // landed switch: ride it out for a moment, then pivot round on the snow
        else { fl.swT += dt; if (fl.swT > 0.6 && S.contact && S.crash <= 0) startTrick({ id: 'pivot', dir: tr.dir, spin: true, n: 1, base: 1, amp: 1, min: 0 }); }
      }
    }
    fl.trick = fl.tr ? fl.tr.id : ''; fl.sw = fl.tr && fl.tr.spin && fl.ph >= 1 && ((fl.tr.base + fl.tr.n) & 1) ? fl.tr.dir : 0;
    // how far the body has gone over to its flight shape: in over the first fifth of a second, out again before the skis touch
    // (through a spring: a forecast that changes its mind for a step, grazing a mogul, must not twitch the whole figure)
    fl.w = sat(spring(fl, 'w', fl.on ? fl.big * smooth(0, 0.22, fl.t) * smooth(0.02, 0.30, fl.rem) : 0, 30, dt));
    // how airborne, where that alone is the question (the physics' own smooth count where it keeps one)
    fl.aK = S.airK !== undefined ? S.airK : damp(fl.aK, S.air ? smooth(0.02, 0.2, S.airT) : 0, S.air ? 14 : 16, dt); fl.mL = damp(fl.mL, 0, 12, dt);
    // sinking ahead of a lip, standing up through it (prepL: the body's own setting for a jump it can see coming, as deep as the
    // flight the lip promises is long: a small lip, or one misjudged, gets a nod and not a wind-up); prep adds the wind-up
    // the player holds (S.charge: there the physics itself sits the body down, so the legs need no more from here: only arms and shoulders)
    { const to = lip && fl.lipT > 0.085 ? 0.8 * smooth(0.42, 0.75, fl.lipAir) : 0; spring(fl, 'prepL', to, to > fl.prepL ? 10 : 24, dt); fl.prep = 1 - (1 - sat(fl.prepL)) * (1 - (S.charge || 0)); }
    spring(fl, 'reach', fl.on ? fl.big * smooth(0.40, 0.12, fl.rem) : 0, fl.on ? 14 : 22, dt);
    // the landing: a blow that the body and the lens take up and let go of
    fl.hit = damp(fl.hit, 0, 5, dt); spring(fl, 'soak', fl.hit, 15, dt);
    // the lens leaves the snow's lead a moment before the skis do (it crosses the lip a fifth of a second behind them) and comes back to it after
    // (it is asked for by degrees over the last third of a second of the approach: what is asked for at a stroke starts with a jerk)
    { const to = fl.on ? smooth(0.4, 0.62, fl.pred) : lip ? smooth(0.4, 0.62, fl.lipAir) * smooth(0.40, 0.12, fl.lipT) : 0; spring(fl, 'kc', to, to > 0 ? 11 : 5.5, dt); }
    // the clock: eased down just after takeoff, slowest through the middle of the flight, back to full speed before the skis touch. Deeper
    // the longer the flight; half as deep when jumps come one on another (a field of rollers must not turn to treacle)
    // (it begins at 0.8 s of air and is all there at a second: a hop off the skier's own legs, 0.7 s, and the common roller, 0.77 s, are
    // left at full speed. From 0.6 s, as it was, most of those were slowed a little, and a little is neither one thing nor the other)
    // (the owner, 2026-11-12: hang time. Hardly any slowing as the skis leave the lip; it deepens as the body rises and is deepest at the top of
    // the arc, then lets go on the way down. And it goes by how high the jump is: an ordinary hop is barely slowed at all, a big air a lot)
    // Hpk: the top of the arc over the snow under it, forecast on the way up (ballistic: what is left of the climb, vy^2/2g, carried forward
    // to where the top will be) and held from there on
    // (heights over the snow below, not over the sea: off a lip on a steep face the body falls all the time and still climbs away from the slope.
    // vr: how fast it climbs from the snow under it; the top of the arc is where that is nil)
    let vr = 0;
    if (fl.on) {
      const h0 = Course.height(P[0], P[2], 0.5), gx = (Course.height(P[0] + 0.5, P[2], 0.5) - h0) / 0.5, gz = (Course.height(P[0], P[2] + 0.5, 0.5) - h0) / 0.5;
      vr = v[1] - gx * v[0] - gz * v[2];
      if (vr > -0.5) { let hm = 0; const T = Math.min(fl.rem || 0, 3); for (let t = 0; t <= T; t += 0.1) hm = Math.max(hm, P[1] + v[1] * t - 4.905 * t * t - Course.height(P[0] + v[0] * t, P[2] + v[2] * t, 0.5)); fl.Hpk = Math.max(fl.Hpk || 0, hm); }
    } else fl.Hpk = 0;
    const dep = fl.on ? G.slowMo * 0.72 * Math.pow(smooth(1.4, 5.5, fl.Hpk || 0), 1.2) * smooth(0.8, 1.0, fl.pred) * fl.fresh : 0; if (fl.on) fl.dep = dep; else fl.since += dt;
    const apex = Math.exp(-((vr / 3.2) ** 2));
    const tsT = fl.on && S.crash <= 0 ? 1 - dep * apex * smooth(0.0, 0.15, fl.t) * smooth(0.10, 0.35, fl.rem) : 1;
    G.timeScale = clamp(spring(fl, 'ts', tsT, 20, dt / G.timeScale), 0.15, 1);          // (eased on the real clock, so a crash or an early landing brings time back without a jolt)
  }

  function tipClear(fl, pose, dt) {
    fl.tcL = fl.tcL || 0; fl.tcR = fl.tcR || 0;
    const W = typeof Skier !== 'undefined' && Skier.world, o = Render.origin;
    if (!W || !W.seg || !o || dt <= 0) return;
    const ce = Math.max(Math.cos(pose.edge || 0), 0.35);
    for (let k = 0; k < 2; k++) {
      const tip = W.seg[k][1], sf = (x, z) => Course.height(x, z, 0.5) + (typeof Tracks !== 'undefined' && Tracks.lift ? Tracks.lift(x, z) : 0);
      // (and where the tip will be in the next few hundredths of a second, carried on at the speed it goes: at 80 km/h a mogul's face comes at it
      // faster than it could be seen and answered after the fact)
      let pen = -1;
      for (const a of [0, 0.04, 0.08]) { const x = tip[0] + o[0] + S.v[0] * a, z = tip[2] + o[2] + S.v[2] * a; pen = Math.max(pen, sf(x, z) - (tip[1] + o[1] + S.v[1] * a)); }
      // (in deep powder the shovel planes well up out of it: a hand's breadth of tip shows; owner 2026-11-12)
      pen += 0.02 + 0.06 * (typeof Tracks !== 'undefined' ? Tracks.deep || 0 : 0); const key = k ? 'tcR' : 'tcL', cur = fl[key];
      const want = clamp(cur + pen / (0.94 * ce), 0, 0.5);
      fl[key] = want > cur ? cur + (want - cur) * (1 - Math.exp(-dt / 0.03)) : cur + (want - cur) * (1 - Math.exp(-dt / 0.25));
    }
  }
  function updatePose(dt) {
    const first = !pose.init, k = first ? 1e6 : 1, kd = dt * k; pose.init = true;
    const FB = typeof Variants !== 'undefined' && Variants.val.feel === 'b';
    // (speeds are the body's own: S.speed, the speed along the snow under the skis, collapses for a few steps over a lip)
    const P = fl.P, v = S.v, vh = Math.hypot(v[0], v[2]), sp = Math.hypot(vh, v[1]), q = fl.q, w = fl.w, cy = Math.cos(q.yaw);
    // the snow under the body at this instant: the snow that is drawn (hv) and, over bumps, the smoother one the body is told about (hb)
    const hv = Course.height(P[0], P[2], 0.5); let hb = hv; if (pc.mog > 0.01) { Course.mogK = MOG; hb = Course.height(P[0], P[2], 0.5); Course.mogK = 1; } S.hv = hv;
    const eV = P[1] - hv; fl.eV = eV;
    // the snow under the skier as the lens is to take it (fl.sg): the body's own ground, but off a lip it does not vanish from under the
    // skier in a step: it sinks away to the landing below over a few tenths of a second, and the skier is seen to rise from it
    if (first || dt <= 0) { fl.sg = hb; fl.sgV = 0; fl.sgP = hb; } else weighted(fl, 'sg', hb, fl.sgV, 4.5, dt);
    // a double-pole stroke is drawn by the skier from pose.dp: while one runs, the turn pole plant, the tuck and the balance arms stand back
    const dpK = fl.dpK = damp(fl.dpK, S.dp > 0 ? 1 : 0, 14, kd); pose.dp = S.dp || 0;
    fl.crashK = damp(fl.crashK, S.crash, S.crash > fl.crashK ? 25 : 60, kd); const crash = fl.crashK;
    // tuck when running straight and fast
    // (above a hundred an hour a racer holds the tuck through long turns too, and only stands out of it to turn hard)
    const fast = smooth(24, 31, sp), wantTuck = (!S.air && sp > 15 && Math.abs(S.u) < lerp(0.12, 0.55, fast) && Math.abs(S.lean) < lerp(0.14, 0.40, fast) && S.crash <= 0 && !(S.dp > 0)) ? 1 : 0;
    S.tuckT = wantTuck ? S.tuckT + dt : 0; S.tuck = damp(S.tuck, S.tuckT > 0.45 ? 1 : 0, wantTuck ? 2.5 : 6, dt);
    // (...and at that pace nobody stands tall even to turn: between tucks it is a high tuck, hands forward and together, lower the gentler the turn)
    pose.tuckHi = damp(pose.tuckHi || 0, 0.62 * fast * (1 - 0.5 * sat((Math.abs(S.lean) - 0.4) / 0.45)) * (1 - w) * (1 - sat(S.crash * 5)), 3, dt);
    // (in the air the tuck is let go as the flight shape comes on, unless the player is holding one; a hard landing folds the chest down over the knees)
    pose.tuck = sat(spring(fl, 'tk', Math.max(Math.max(S.tuck, pose.tuckHi) * (1 - w), (S.tuckIn || 0) * (1 - q.own)) * (1 - dpK) + q.tuck + 0.45 * fl.soak, 11, kd));
    pose.air = 0.42 * w * (1 - q.own) + q.air;
    // the body stands where the forces put it. Its inclination follows what the snow is pushing back with (sideways push over load: the
    // angle at which a skier is in balance), not the steering that causes it: so it is into the turn the moment the edges bite, and back
    // over the skis the moment the load comes off. (Over a crest, with no load to speak of, it holds what it had. In the air it stands over
    // its skis; and the push of a landing is believed over a few steps, not in the first one: gk.)
    // (each time the skis take load again, after a flight and just as much after every crest and mogul skied light, that angle starts
    // somewhere new, often far from where it was held: it is come to over a few steps, not in one. fl.rl: how long the load has been back,
    // and steady)
    // (...and while the load is going off fast, over a crest or a lip, there is no saying where the balance is: the physics lets the
    // load it reports fade over a few steps while the sideways push is gone in one, and for those steps their quotient means nothing.
    // The body keeps the angle it had, as a body leaving the snow does. fl.hold: 1 while the load falls faster than 500 m/s^2 a second)
    { const tS = G.stepT || 0; if (tS !== fl.stP) { fl.hold = first ? 0 : smooth(200, 500, (fl.loadP - S.load) / Math.max(tS - fl.stP, H)); fl.loadP = S.load; fl.stP = tS; } }
    fl.rl = S.load > 1.5 ? (fl.rl + dt) * (1 - fl.hold) : 0;
    if (S.load > 1.5) fl.balG = damp(fl.balG, Math.atan2(S.aReac, S.load), lerp(12, 120, smooth(0, 0.15, fl.rl)) * (1 - fl.hold), kd);
    fl.gk = damp(fl.gk, S.load > 1.5 ? 1 : 0, S.load > 1.5 ? 10 : fl.on && fl.t > 0.14 ? 9 : 0, kd); pose.bal = lerp(S.lean * 0.5, fl.balG, fl.gk);
    const balT = lerp(S.lean, clamp(pose.bal || 0, -0.92, 0.92), 0.8 * smooth(3, 9, sp));
    // (turned round in the air or riding switch, what was the body's right is its left: cy)
    fl.lean = damp(fl.lean, balT, 15, kd);
    // (the body that is drawn: the legs are its suspension, the trunk and head ride on them quiet. The load the snow pushes back with rises and falls
    // some three times a second in a carve, and the balance angle read from it with it: taken as it comes, the whole figure rocked sideways a couple of
    // centimetres at the head, three times a second. So the figure leans as the physics' own lean does (S.lean: smooth, and on time with the steering),
    // and what the balance adds to that comes through a critically damped spring of a little over 1 Hz: the turn is leaned into on time, the
    // wobble is gone. In the air, a fall or a trick it follows more closely, as before)
    const lnW = lerp(8, 30, Math.max(w, sat(crash * 5), q.own)), lnC = spring(fl, 'lnC', fl.lean - S.lean, lnW, kd); fl.lb = S.lean + lnC; fl.lbV = (S.leanV || 0) + (fl.lnCV || 0);
    // (...and the physics' own lean trembles a little too in a hard carve. What is drawn follows it through a lag that is as short as the lean is
    // quick: a hundredth of a second or two through an edge change, a fifth of a second while it is only trembling about a held angle)
    { const r = fl.lbR = first || dt <= 0 ? Math.abs(fl.lbV) : damp(fl.lbR || 0, Math.abs(fl.lbV), 8, dt), fc = (FB ? 2.5 : 0.8 + 3.5 * r) + 30 * Math.max(w, sat(crash * 5), q.own);
      fl.lbF = first || dt <= 0 || fl.lbF == null ? fl.lb : fl.lbF + (fl.lb - fl.lbF) * (1 - Math.exp(-TAU * fc * dt)); fl.lb = fl.lbF; }
    const Lv = fl.lb * cy * (1 - 0.7 * q.own * w), sL = Math.sin(Lv); pose.lean = Lv;
    // (feel b: the body goes first. The hips cross over into the new turn and the edges follow them a tenth of a second or so later, through a
    // critically damped spring, instead of rolling with the body to the same instant)
    { const eT = clamp(Lv * 1.12 + S.beta * 0.25 * cy, -1.3, 1.3); if (FB && !first) { fl.edB = spring(fl, 'edB', eT, lerp(30, 16, (1 - w) * (1 - sat(crash * 5))), kd); pose.edge = clamp(fl.edB, -1.3, 1.3); } else { fl.edB = eT; fl.edBV = 0; pose.edge = eT; } }
    // legs. The hips ride where the physics has the body, set lower by how the skier is standing (Xs); the legs are whatever it takes to
    // get from there to the skis. fl.l is how far they are folded (below 0) or reached out (above), in metres, measured from the hips;
    // fl.L the same counted as the physics counts its own (S.leg): the skis are at P.y - L, always. The figure draws the knee bend it
    // is given with no lag of its own (its legs are its suspension), so the bend itself must move as legs move: fl.l goes no faster
    // than V_LEG either way, and takes up or gives up a pace over two steps or three, never in one. The one rule holds on the snow and
    // in the air alike: nothing changes hands when the skis leave the snow or meet it.
    // On the snow the skis stay on the snow that is drawn, down a falling slope as fast as a leg can be straightened and as far as it
    // reaches: where the snow drops away faster than that (a lip, the back of a mogul at speed) they come off it by themselves, still
    // straightening. In the air a spring says where the legs would go: from the value and the rate they had to the shape of the flight
    // (knees up for a trick: the feet come up to the hips, not the hips down) and, as that shape is let go before touchdown, out to where
    // the physics holds its own legs for the landing: the skis that are drawn and the skis that are computed meet the snow together.
    // A landing: the snow comes up under the skis faster than any leg folds (nine metres a second off a wedge). For those few steps
    // something has to give, and it is the snow: the skis go into it (a hand's breadth off a wedge, fl.sink, inside the burst of snow
    // the landing throws up) and it lets go of them as the legs catch up. Skis held on the surface would have the knees snap shut in
    // one step, or the hips stop dead in one.
    // (the hips keep the body's line only as low as folded legs can carry them, eH: the last of a hard landing the physics takes on
    // its end stop, and the hips do not go there with it)
    // (reach: coming down, the hips are let down by a hand or two against the body the physics computes, so that the legs, reached out
    // as far as the physics has its own, still have a bend in them when the skis touch: they begin to fold at that instant, and the hips
    // go on down along their line. With the knees already straight the hips would stop with the skis for a step, and then start again)
    fl.pump = damp(fl.pump, clamp(S.load / GRAV - 1, -1, 2), 9, kd);
    // (feel b: and onto the turn's push as well: the edges carry the weight and the push across together, so the hips settle lower the harder
    // the turn, a hand's width at the apex of a hard carve, and come up as it is let go)
    fl.pumpL = damp(fl.pumpL || 0, FB && S.contact ? clamp((Math.hypot(S.load, S.aReac) - S.load) / GRAV, 0, 1.5) : 0, 9, kd); const pumpL = spring(fl, 'pmL', fl.pumpL, 8, kd);
    // (the hips sink onto a loaded ski at the pace of the turn, not of the snow: the load's quick rise and fall is the knees' to take, so the sink the
    // hips are given comes through a critically damped spring of about 1.6 Hz)
    const pumpH = spring(fl, 'pmH', fl.pump, 10, kd);
    let Xs = clamp(Math.abs(Lv) * 0.10 + pose.tuck * 0.22 + 0.16 * smooth(17, 30, sp) + 0.25 * smooth(0, 0.25, crash) + 0.3 * fl.prepL + (0.12 + 2.7 * (L_AIR - 0.08)) * fl.reach + q.dip + 0.09 * pumpH + 0.22 * pumpL * (1 - w), -0.1, 0.8);
    const eH = cmax(eV - 0.38 * Xs, -0.32, 0.25); Xs = fl.Xs = (eV - eH) / 0.38;        // (eH: the hips' line over the snow that is drawn; Xs as it comes out with that floor)
    if (first) { fl.l = eH; fl.lV = 0; fl.L = eV; fl.LV = 0; }
    else if (dt > 0) {
      const l0 = fl.l, V0 = fl.lV, L0 = fl.L;
      // (where the legs would go by themselves: in the air to the shape of the flight, on the snow out after the snow...)
      let lw = S.air ? spring(fl, 'L', lerp(legP(), Math.max(0.08 - 0.38 * (lerp(0.38, q.c, q.own) - Xs), E_MIN), w), 24, dt) - 0.38 * Xs
        : Math.min(l0 + (V0 < 0 ? Math.min(V0 + 120 * dt, 60 * dt) : Math.min(V0 + 60 * dt, V_LEG)) * dt, E_MAX + 0.03 - 0.38 * Xs);
      // (...which is in the way: the skis are on it, less what it still holds of them)
      if (lw >= eH) lw = eH + Math.max(l0 - fl.eH0, 0) * Math.exp(-20 * dt);
      let l = l0 + clamp((lw - l0) / dt, Math.max(V0 - 120 * dt, -V_LEG), Math.min(V0 + 120 * dt, V_LEG)) * dt; if (l > eH + 0.45) l = eH + 0.45;
      fl.lV = (l - l0) / dt; fl.l = l; fl.L = l + 0.38 * Xs; fl.LV = (fl.L - L0) / dt;
    }
    fl.eH0 = eH; fl.sink = Math.max(fl.l - eH, 0);
    // (the knee bend is that length and nothing else: hips, shoulders and head keep the smooth line of the body the physics computes.
    // Toward either end of their travel the legs give less and less, never against a stop)
    pose.crouch = clamp(smin(smax((0.08 - fl.l) / 0.38, 0.03, 0.1), 1, 0.15), 0, 1);
    fl.sepB = damp(fl.sepB, -S.beta * 0.8 - fl.lean * 0.22, 8, kd); fl.hy = damp(fl.hy, fl.lean * 0.3 + S.beta * 0.3, 6, kd);
    // (a turn in the air is wound up on the way in: shoulders drawn back against it as the body sinks, thrown into it as it stands up)
    // (the head is turned as a head is, through a spring: the look into a spin begins and ends without a jerk)
    // (the wind-up too: a plan can change, or be dropped, from one step to the next)
    // ---- motion (Variants 'motion' b; mo eases a switch over). Separation: the skis are turned across the fall line by the turn, the shoulders go only
    // a third of the way with them and the hips half, so the legs are seen to turn under a quiet trunk; the head looks between the fall line and the
    // way it is going. (Most of it below the fall line, where the skis come round under a trunk that faces down the hill and leans out over them; above
    // it, facing the fall line is facing into the new turn, and a trunk folded forward that way would dive into it.) Taken through critically damped
    // springs: the trunk is heavy and comes round late, never at a jerk. (Only on the snow, forwards,
    // with the skis under the body: in the air, a tuck, a stroke or a fall the old reading stands. gnd: how far all that holds)
    const mo = fl.mo = first ? (Variants.val.motion === 'a' ? 0 : 1) : damp(fl.mo, Variants.val.motion === 'a' ? 0 : 1, 4, dt);
    const gnd = fl.gnd = (1 - w) * (1 - dpK) * (1 - sat(S.crash * 5)) * smooth(3, 8, sp) * smooth(0.3, 0.8, cy) * (1 - 0.6 * smooth(0.3, 1, pose.tuck)) * (1 - sat(Math.abs(q.yaw) * 3));
    const wr = a => Math.atan2(Math.sin(a), Math.cos(a)), fall = Course.yawAt(-P[2]), skY = Math.atan2(root.fwd[0], -root.fwd[2]), skR = wr(skY - fall), trR = vh > 1 ? wr(Math.atan2(v[0], -v[2]) - fall) : skR;
    const sepM = spring(fl, 'sepM', clamp(-lerp(0.3, 0.8, smooth(-0.04, 0.04, skR * fl.lean * cy)) * skR, -0.85, 0.85) * gnd, 6, kd), hdM = spring(fl, 'hdM', clamp((0.35 * trR - 0.34 * skR) * gnd - 0.15 * skR * gnd, -0.7, 0.7), 9, kd);
    pose.sep = lerp(fl.sepB * cy, sepM, mo) + q.sep - spring(fl, 'wu', fl.plan && fl.plan.spin ? fl.plan.dir * 0.3 * fl.prep : 0, 20, kd); pose.headYaw = clamp(spring(fl, 'hd', lerp(fl.hy * cy, hdM, mo) + q.head, 16, kd), -1.3, 1.3);
    // (the inside ski draws ahead as the edges come up: hardly at all in a shallow turn)
    pose.lead = 0.19 * sL * Math.abs(sL) + q.lead; pose.stance = 0.31 + 0.16 * Math.abs(sL) + 0.04 * w + q.st;
    fl.foreS = damp(fl.foreS || 0, clamp(-0.25 * w * (1 - q.own) + q.fore - 0.5 * fl.soak, -1, 1), 8, kd); pose.fore = fl.foreS;
    // (fore/aft, Variants 'fa': the stance itself moved, not a spring on it. Forward: hips over the toes, shins pressed into the tongues, chest a
    // little lower; back: hips behind the heels, sitting into the boots. 08_skier.js draws it from pose.fa; nothing of it in the air or a trick)
    pose.fa = damp(pose.fa || 0, (S.fa || 0) * (1 - w) * (1 - q.own) * (1 - sat(S.crash * 5)) * (1 - smooth(0.3, 0.9, pose.tuck)), 9, kd);
    pose.liftL = q.lL; pose.liftR = q.lR; fl.tipUp = damp(fl.tipUp || 0, S.contact && typeof Tracks !== 'undefined' ? (Tracks.deep || 0) * lerp(0.22, 0.14, smooth(5, 18, sp)) * (1 - w) : 0, 5, dt);
    // (in deep powder the skis ride tips up, planing: the shovels come up out of the snow and the tails run low in it, more so when slow)
    // and whatever else: a ski's shovel never digs into the snow (the owner: '任何情况下雪橇的头都不应该扎到雪里面'). A real ski bends and its tip
    // rides up over a hollow, a mogul's face, the lip of the run-out, the powder; this one is stiff, so where its tip would be under the
    // snow as drawn (the ground, and round the skier the powder standing above it: Tracks.lift) it is pitched up at the boot until the
    // shovel stands 2 cm clear. Measured on last step's skis, raised within a few hundredths of a second, let down over a few tenths
    tipClear(fl, pose, dt);
    pose.pitchL = q.pL; pose.pitchR = q.pR; pose.tipL = fl.tipUp + fl.tcL; pose.tipR = fl.tipUp + fl.tcR; pose.rollL = q.rL; pose.rollR = q.rR; pose.grabL = q.gL; pose.grabR = q.gR;
    // the pole plant: as one turn is let go the new inside pole swings forward, and its basket touches the snow beside the ski tip at the
    // moment the edges change; then it is left behind. (A gentle change of direction gets half a swing and no touch.)
    const quiet = (Variants.val.poles === 'a' ? 1 - sat(pose.tuck * 3) : 1 - sat((pose.tuck - 0.25) * 2.5)) * smooth(3, 7, sp) * (1 - fl.aK) * (1 - sat(S.crash * 5)) * (1 - dpK) * (1 - sat(Math.abs(q.yaw) * 3));
    // (when: timed to the edge change itself, not to how fast the lean goes. The body's own lean is watched heading through zero, and the plant is
    // asked for PL_LEAD seconds before it gets there, however quick the change (a mogul line changes edges three times a second): the basket is in
    // the snow as the edges change and stays a moment while the body goes past it. A turn must have been a turn (pk: the most it leaned) to earn one)
    if (dt > 0) { const lv = fl.lnV = damp(fl.lnV || 0, (fl.lean - (fl.lnP == null ? fl.lean : fl.lnP)) / dt, 25, dt); fl.lnP = fl.lean; fl.plT = (fl.plT || 0) + dt;
      const sn = Math.sign(fl.lean); if (!fl.plSg) fl.plSg = sn; if (sn === fl.plSg) fl.plPk = Math.max(fl.plPk || 0, Math.abs(fl.lean));
      const sg = fl.plSg, tc = sn === sg ? (fl.lean * lv < 0 ? Math.abs(fl.lean / lv) : 9) : Math.abs(fl.lean) < 0.25 ? 0 : 9;   // (crossed already, between two steps: at once)
      // (fast, the pole is only swung forward and flicked toward the snow, not planted: at 50 km/h and more a tip held in the snow is left
      // behind by a third of a metre a frame, and the pole whipped back and was pulled out again within three or four frames, a twitch of the
      // hand and the pole at every turn, owner 2026-11-13 '手还有杆莫名其妙抽搐'. A plant asked for at half its reach never touches: no pin)
      if (sg && tc < PL_LEAD) { const pk = fl.plPk || 0; fl.plSg = -sg; fl.plPk = 0; if (pk > 0.14) { fl.plS = -sg; fl.plT = 0; fl.plDur = tc + PL_HOLD; fl.plK = lerp(0.62, 1, smooth(0.14, 0.32, pk)) * lerp(1, 0.5, smooth(8, 13, sp)); } } }
    const plWant = side => Variants.val.poles === 'a' ? quiet * sat(side * S.leanV * 0.75 - 0.15) * smooth(0.62, 0.20, -side * S.lean) * smooth(0.20, 0.03, side * S.lean)
      : fl.plS === side && fl.plT < (fl.plDur || 0) ? quiet * fl.plK : 0;
    // hands ahead: a skier carries the hands in front and a little wide, at the height of the belt, the outside hand reaching on round the turn;
    // the inside one forward and up, ready for its plant; never trailing down by the knees (act: how much the skiing stance is on: not in a tuck, a stroke, the air or a fall)
    const act = (1 - smooth(0.2, 0.8, pose.tuck)) * (1 - dpK) * (1 - fl.aK) * (1 - sat(S.crash * 5)) * smooth(2, 6, sp), sLn = Math.sin(fl.lean * cy);
    { const H = HANDS[Variants.val.poles] || HANDS.b; if (!fl.ha) fl.ha = H.slice(); for (let i = 0; i < 7; i++) fl.ha[i] = damp(fl.ha[i], H[i], 5, kd); }     // (a version switched in play eases over)
    // hands, beyond what the stance gives them: low and back as the body sinks before a jump, forward and apart to meet the landing,
    // forward and down as a hard one is taken up, and wherever the trick wants them
    // (a landing: the hands go forward and up for balance as the legs take it, not down to the knees)
    const hk = 1 - dpK, hy = (-0.05 * fl.prep + 0.05 * fl.reach + 0.04 * fl.soak) * hk, hz = (0.08 * fl.prep - 0.12 * fl.reach - 0.16 * fl.soak) * hk, hx = (0.05 * fl.reach + 0.04 * fl.soak) * hk;
    const grabs = typeof Skier !== 'undefined' && Skier.P0 && 'grabL' in Skier.P0;     // (does the figure know how to take hold of a ski? if not, the hand is at least sent there)
    for (const side of [-1, 1]) {
      // (wanted from the last third of the old turn until the new edges have just begun to bite: a touch, not a prop to lean on)
      const key = side < 0 ? 'plantL' : 'plantR', want = plWant(side);
      // (it is asked for at a stroke; the hand sets off after it through a spring, without a jerk)
      pose[key] = sat(spring(fl, side < 0 ? 'plL' : 'plR', want, want > (pose[key] || 0) ? 16 : 11, dt * k));      // (16 / 11: the swing set going and given back without a flick, owner 2026-11-13)
      const a = side < 0 ? pose.armL : pose.armR, pl = pose[key], g = grabs ? 0 : side < 0 ? q.gL : q.gR;
      const out = sat(-side * sLn * 1.6), inn = sat(side * sLn * 1.6), ac = act * (1 - g), HA = fl.ha;
      a[0] = side * (0.03 * pl + hx - 0.13 * g + HA[0] * ac) + (side < 0 ? q.ax : q.bx) * hk; a[1] = 0.03 * pl + hy - 0.6 * g + (HA[1] + HA[3] * out + HA[5] * inn) * ac + (side < 0 ? q.ay : q.by) * hk; a[2] = -0.10 * pl + hz + 0.32 * g - (HA[2] + HA[4] * out + HA[6] * inn) * ac + (side < 0 ? q.az : q.bz) * hk;
    }
    // (b: the poles do not swing to a clock: they nod with how the legs are loaded and with the body going over, and with the snow's chatter)
    pose.swing = lerp(Math.sin(G.t * 2.3) * 0.25 + S.leanV * 0.12, S.leanV * 0.12 + 0.16 * clamp(fl.pump, -1, 1) + 6 * (fl.chat || 0), mo) * hk;
    // (angulation: in a turn the knees and hips go inside and the chest stays nearer upright over the outside ski; the more it is laid over the more so.
    // Through a spring: the trunk comes upright a moment after the legs tip in)
    pose.tilt = spring(fl, 'tlt', -0.17 * fl.lean * cy * smooth(0.08, 0.6, Math.abs(fl.lean)) * gnd, 9, kd) * mo;
    // ---- motion b, the legs. Through an edge change the body flexes to let the old turn go (the edges come off as the knees fold), rises as it goes
    // over the skis into the new one, and sinks onto the new outside ski as it loads (that last part is the physics' own load, pump, above). Read off
    // the lean and how fast it is going: rel while it is going back toward upright from a turn, ent while it is leaving upright for the next.
    // A landing is soaked up by the legs (the physics) and then comes back past level once, as a body does: an underdamped spring set going by the
    // speed the snow was met with (ld). At speed the snow is never quite smooth: a tremor through the legs and the hands, faster the faster it goes.
    { const lv = fl.lbV || 0, aL = Math.abs(fl.lb), rel = sat(-fl.lb * lv / 1.2) * smooth(0.04, 0.3, aL), ent = sat(fl.lb * lv / 1.2) * smooth(0.55, 0.12, aL);       // (read off the lean that is drawn: its rate is smooth)
      const fx = spring(fl, 'xo', (0.13 * rel - 0.17 * ent) * gnd, 11, kd);
      if (dt > 0) { if (fl.wasAir && !S.air) fl.ldV = (fl.ldV || 0) + Math.min(S.landV || 0, 9) * 0.2; const x = fl.ld || 0, vv = fl.ldV || 0, W = 7, Z = 0.3, ac = -W * W * x - 2 * Z * W * vv;
        fl.ldV = vv + ac * dt; fl.ld = x + fl.ldV * dt; } fl.wasAir = S.air;
      if (dt > 0) fl.dist = ((fl.dist || 0) + sp * dt) % 4096;
      const ch = fl.chat = 0.011 * smooth(10, 30, sp) * (1 - w) * (1 - 0.6 * (S.powder || 0)) * (vnoise1(fl.dist * 0.42, 31) * 0.7 + vnoise1(fl.dist * 1.1, 37) * 0.3);
      pose.crouch = clamp(pose.crouch + mo * (fx + (fl.ld || 0) * (1 - w)), 0, 1);
      // (feel b: fore and aft on the snow. Into a new turn the shins press the boots and the hips go forward over the feet; through the apex they
      // are centred; out of it the weight comes back toward the tails; and whatever the snow is braking with (a skid, the powder) sets the body
      // back on its heels a little. Through a spring of a little under 1 Hz: the weight shifts, it does not jump)
      const foT = FB ? clamp((0.55 * ent - 0.35 * rel - 0.06 * (S.aDrag || 0)) * gnd, -0.6, 0.6) : 0;
      pose.fore = clamp(pose.fore + spring(fl, 'foB', foT, 5.5, kd), -1, 1);       // (the snow's chatter is not put into the knee bend: with the feet on the snow that moved the hips and everything above them)
      for (const a of [pose.armL, pose.armR]) { a[1] += mo * (1.6 * ch - 0.25 * (fl.ld || 0)) * hk; a[2] -= mo * 0.4 * (fl.ld || 0) * hk; } }
    if (crash > 0.001) { const wb = Math.sin(crash * 22) * crash; pose.armL[1] += 0.18 * crash + 0.05 * wb; pose.armR[1] += 0.18 * crash - 0.05 * wb; pose.sep += wb * 0.25; }
    // ---- root frame
    // the feet (on the snow they stand on the snow that is drawn; over bumps the body rides a smoother line and the legs make up the difference)
    const fy = fl.fy = P[1] - fl.L;
    // how the skis lie. On the snow: along the line of travel, on the snow's own plane taken over their length (tail, boot, tip, and a hand
    // to either side): a ski bridges a hollow, and over a lip it keeps the line it had instead of nodding down after the falling snow.
    let dx, dz; if (vh > 1) { dx = v[0] / vh; dz = v[2] / vh; } else { const l = Math.hypot(S.t[0], S.t[2]) || 1; dx = S.t[0] / l; dz = S.t[2] / l; }
    // (toward the end of a flight the snow that matters is the snow the skis will come down on: the plane is taken there, `ah` seconds ahead)
    const ah = fl.on ? fl.rem * smooth(0.5, 0.34, fl.rem) * smooth(0, 0.12, fl.t) : 0, qx = P[0] + v[0] * ah, qz = P[2] + v[2] * ah;
    const rx = -dz, rz = dx, Lh = 0.8, Wh = 0.45; Course.mogK = MOG;
    const gC = ah > 0 ? Course.height(qx, qz, 0.5) : hb, gT = Course.height(qx - dx * Lh, qz - dz * Lh, 0.5), gF = Course.height(qx + dx * Lh, qz + dz * Lh, 0.5), gL = Course.height(qx - rx * Wh, qz - rz * Wh, 0.5), gR = Course.height(qx + rx * Wh, qz + rz * Wh, 0.5); Course.mogK = 1;
    const sR = (gC - gT) / Lh, sF = (gF - gC) / Lh, sc = 0.5 * (sR + sF), sk = clamp(vh > 1 ? v[1] / vh : sc, Math.min(sF, sc), Math.max(sR, sc)), sl = (gR - gL) / (2 * Wh);
    let nx = -sk * dx - sl * rx, ny = 1, nz = -sk * dz - sl * rz; { const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l; }
    let fx = dx, fyv = sk, fz = dz; { const l = Math.hypot(fx, fyv, fz); fx /= l; fyv /= l; fz /= l; }
    // In the air: along the flight path, nose slightly up, level from side to side. The one passes into the other as the skis come clear
    // of the snow; and over the last third of a second of a flight the skis are laid back onto the plane of the snow they are about to
    // meet (m), so at touchdown they are already lying along it: nothing turns at the instant of contact
    { const il = 1 / (sp || 1); let ax = v[0] * il, ay = v[1] * il + 0.10 * w, az = v[2] * il; const al = Math.hypot(ax, ay, az) || 1; ax /= al; ay /= al; az /= al;
      let ux = -ax * ay, uy = 1 - ay * ay, uz = -az * ay; const ul = Math.hypot(ux, uy, uz) || 1; ux /= ul; uy /= ul; uz /= ul;
      const m = fl.on ? smooth(0.34, 0.04, fl.rem) : fl.mL, wo = sp > 1 ? (1 - (1 - w) * (1 - smooth(0.03, 0.15, fy - hv))) * (1 - m) : 0;
      fx += (ax - fx) * wo; fyv += (ay - fyv) * wo; fz += (az - fz) * wo; nx += (ux - nx) * wo; ny += (uy - ny) * wo; nz += (uz - nz) * wo; }
    // (followed with a spring, not a lag: when what it follows steps, it starts to move without a jolt)
    spring(fl, 'fX', fx, 30, kd); spring(fl, 'fY', fyv, 30, kd); spring(fl, 'fZ', fz, 30, kd); spring(fl, 'nX', nx, 30, kd); spring(fl, 'nY', ny, 30, kd); spring(fl, 'nZ', nz, 30, kd);
    { const l = Math.hypot(fl.nX, fl.nY, fl.nZ) || 1; nx = fl.nX / l; ny = fl.nY / l; nz = fl.nZ / l; const d = fl.fX * nx + fl.fY * ny + fl.fZ * nz; fx = fl.fX - nx * d; fyv = fl.fY - ny * d; fz = fl.fZ - nz * d; const m = Math.hypot(fx, fyv, fz) || 1; fx /= m; fyv /= m; fz /= m; }
    // the skis pivoted across the line of travel by the skid angle (which the physics lets go of by itself in the air), and the turns of a
    // trick: a spin about the body's own long axis, a somersault about the hips
    let ox = 0, oy = 0, oz = 0;
    { const a = S.beta + q.yaw, c = Math.cos(a), s = Math.sin(a), bx = fyv * nz - fz * ny, by = fz * nx - fx * nz, bz = fx * ny - fyv * nx; fx = fx * c + bx * s; fyv = fyv * c + by * s; fz = fz * c + bz * s; }
    if (q.flip) {
      const c = Math.cos(q.flip), s = Math.sin(q.flip), Hc = 0.98 - 0.38 * pose.crouch, ax = fx * c + nx * s, ay = fyv * c + ny * s, az = fz * c + nz * s, ux = nx * c - fx * s, uy = ny * c - fyv * s, uz = nz * c - fz * s;
      ox = (nx - ux) * Hc; oy = (ny - uy) * Hc; oz = (nz - uz) * Hc; fx = ax; fyv = ay; fz = az; nx = ux; ny = uy; nz = uz;
    }
    root.pos[0] = P[0] + ox; root.pos[1] = fy + oy; root.pos[2] = P[2] + oz; root.fwd[0] = fx; root.fwd[1] = fyv; root.fwd[2] = fz; root.nrm[0] = nx; root.nrm[1] = ny; root.nrm[2] = nz;
    // (what the lens frames by: the feet on the snow; in the air the level the feet would hang at, which does not bob as the knees come up)
    fl.fr = lerp(fy, P[1] + 0.03 - 0.38 * Xs, fl.kc);
    // (...and the snow the lens goes by cannot stay above them: coming down on that line faster than it sinks, the skier takes it along,
    // and the two reach the real snow together)
    if (!S.contact && fl.sg > fl.fr && fl.sg > hb) { fl.sg = Math.max(fl.fr, hb); fl.sgV = Math.min(fl.sgV, v[1]); }
  }

  // ---- chase camera: behind and above, looking down the mountain past the skier
  const _ca = {}, _cb = {};
  function updateCamera(dt) {
    const p = fl.P, v = S.v, aspect = Render.W / Math.max(1, Render.H), portrait = aspect < 1, first = !cam.init; cam.init = true; const q = first ? 1e6 : 1;
    // (the speed the lens goes by is the body's own. S.speed, the speed along the snow under the skis, collapses for a few steps over a
    // lip, and a lens that sets its distance and its angle by it stalls and lunges: that was the hitch at takeoff. It is taken through
    // a spring: a hard landing scrubs a metre or two per second off in one step, and that must not be a step in the lens's own speed)
    if (first) { cam.sp = Math.hypot(v[0], v[1], v[2]); cam.spV = 0; }
    const sp = spring(cam, 'sp', Math.hypot(v[0], v[1], v[2]), 16, dt), k = smooth(6, 30, sp), kc = fl.kc;
    // the lens looks down the valley, whichever way the valley is running just here, and goes a little over half way with the skier's own turns
    const cyw = Course.yawAt(-p[2]), vyaw = lerp(cyw, Math.atan2(v[0], -v[2]), smooth(0.8, 2.5, Math.hypot(v[0], v[2])));
    // off the run and going slowly (lost among the trees, getting going again after one), the lens turns away from the skier's own line
    // toward the run: to a point on its middle some thirty metres down, so the open lane between the trees is in the picture and it is
    // plain which way to go; and it stands a little higher and further back to see over the snow. cam.lost 0..1, eased over a second or
    // two either way. (Nothing moves the skier: only the picture turns)
    { const s0 = -p[2], c = Course.at(s0, _ca), eo = Math.abs(p[0] - c.cx) - c.hw, to = G.mode === 'run' ? smooth(3, 16, eo) * lerp(0.2, 1, smooth(8, 3.5, sp)) : 0;
      spring(cam, 'lost', first ? 0 : to, to > (cam.lost || 0) ? 1.6 : 1.0, dt * q);
      if (cam.lost > 1e-3) { const cR = Course.at(s0 + 30, _cb), ry = Math.atan2(cR.cx - p[0], 30); cam.ryaw = 0 * clamp(ry - cyw, -0.3, 0.3); } }
    const lost = cam.lost || 0, cyl = cyw + lost * (cam.ryaw || 0);
    cam.cyaw = damp(cam.cyaw == null || first ? cyl : cam.cyaw, cyl, 1.3, dt * q);
    cam.yaw = damp(cam.yaw, cam.cyaw + clamp((vyaw - cam.cyaw) * 0.55 * (1 - 0.3 * lost), -0.7, 0.7), 2.4, dt * q);
    // drift toward the inside of the turn: the curtain hangs just outside the track, and from in here the lens looks along its lit face instead of flying through it
    cam.side = damp(cam.side, S.lean * 0.55 + S.beta * 0.5, 2.2, dt * q);
    cam.roll = damp(cam.roll, -S.lean * 0.20, 5, dt * q);
    // the camera rides low, at about hip height: the skier and the thrown snow stand up against the valley and the sky, and the snow rushes past close.
    // in a hard turn it sinks a little more and swings wide, so the curtain is between the lens and the sun
    cam.low = damp(cam.low || 0, sat(Math.abs(S.lean) / 0.8) * (1 - kc), 3, dt * q);
    const CL = G.camL;
    // (the point the lens follows trails the skier by a sixteenth of a second: most of that is taken back out of the distance, or the figure would shrink as the speed went up)
    // on a steep pitch the lens rides higher and nearer, and so looks down the fall line: the slope is seen to drop away under the skier
    { const s0 = -p[2], sl = (Course.at(s0 - 14, _ca).baseY - Course.at(s0 + 14, _cb).baseY) / 28; cam.steep = damp(cam.steep || 0, smooth(0.44, 0.58, sl), 1.2, dt * q); }
    // among trees (a glade; the woods off the edge of a run) the lens closes up on the skier, sits lower and opens a touch: cam.wood, 0..1.
    // Four metres back its line cuts the corners of the skier's own, through the boughs the skier has just gone round; close behind, it goes
    // where the skier went. It comes on a second ahead of the trees and goes off more slowly behind them. On an open run nothing changes
    // (nothing at all: the last ten-thousandth of its going, a tenth of a millimetre of the lens's place, is not waited for)
    // (The groups of trees that stand out on an open run are left to 14_trees.js: tried, a lens that closed up for each of them was on
    // the move two thirds of a powder run)
    // (Only in version b of the owner's choice: switched to another, it goes off as it does behind the last tree)
    { const s0 = -p[2], c = Course.at(s0, _ca), e = Math.abs(p[0] - c.cx) - c.hw, to = typeof Variants !== 'undefined' && Variants.val.wood !== 'b' ? 0 : Math.max(smooth(0.15, 0.75, Math.max(c.glade, Course.at(s0 + sp, _cb).glade)), smooth(4, 16, e) * smooth(0.3, 0.7, c.forest));
      spring(cam, 'wood', to, to > (cam.wood || 0) ? 2 : 0.9, dt * q); if (!to && cam.wood < 1e-4) cam.wood = cam.woodV = 0; }
    // the picture of this kind of run (SHOTS), taken over through springs some three seconds long: a new section comes into the lens,
    // never in a cut, and switching the owner's choice glides the same way. (Not in a tall window: that branch is left as it was; nor on the title page, which has its own picture)
    { const sg = Course.segAt(-p[2]), T = !portrait && G.mode !== 'title' && typeof Variants !== 'undefined' && (Variants.val.shots === 'b' ? SHOTS[sg.type] : Variants.val.shots === 'c' ? SHOTS_C[sg.type] : null) || SH0, sd = sg.idx & 1 ? -1 : 1, w = 1.3;
      spring(cam, 'shH', T[0], w, dt * q); spring(cam, 'shF', T[1], w, dt * q); spring(cam, 'shK', T[2], w, dt * q); spring(cam, 'shO', T[3] * sd, w * 0.8, dt * q); spring(cam, 'shG', T === SH0 || Variants.val.shots !== 'b' || sg.type !== 'gully' ? 0 : 1, w, dt * q); }
    // a marked jump: the lens swings out about fifteen degrees to one side as the skier lines up for it (from about 100 m), so the lip stands
    // clear beside the figure instead of hidden behind it, and through a flight the forecast says will last over a second it stays out there
    // and drops: the skier crosses the horizon side-on with the landing below. It comes back once the skis are down. cam.jw 0..1 (all of
    // it), cam.ja 0..1 (the flight's share: the lens turns from the lip to the skier); jSide is chosen as it starts, toward the run's middle
    { let to = 0; const s0 = -p[2];
      if (!portrait && sp > 11) for (let b = Math.floor(s0 / 32), e = Math.floor((s0 + 84) / 32); b <= e; b++) for (const f of Course.feats.get(b) || []) {
        if (!f.mark) continue; const ds = f.s + f.len - s0, du = Math.abs(p[0] - Course.at(f.s + f.len, _ca).cx - f.u);
        to = Math.max(to, smooth(105, 70, ds) * smooth(-1, 3, ds) * smooth(f.wid * 0.5 + 5, f.wid * 0.5 + 1, du) * smooth(12, 16, sp)); }
      // (a kicker air of 0.6 to 1 s gets the same at half strength, and swings out quicker: the lip and the drop beside the figure, not a
      // hop seen from behind. Only off the kickers of a kicker run: the hops of a mogul field stay as they were)
      const pr = fl.pred || 0, kick = Course.segAt(s0).type === 'kickers', air = fl.on && !S.contact ? Math.max(smooth(0.85, 1.05, pr), kick ? 0.5 * smooth(0.55, 0.75, pr) : 0) : 0, quick = air > 0 && air < 0.55; to = Math.max(to, air);
      if ((cam.jw || 0) < 0.01 && to > 0) { const c = Course.at(s0, _cb); cam.jSide = p[0] > c.cx ? -1 : 1; }
      spring(cam, 'jw', to, to > (cam.jw || 0) ? (quick ? 3.6 : 1.8) : 1.4, dt * q); spring(cam, 'ja', air, air > (cam.ja || 0) ? (quick ? 6 : 4) : 1.6, dt * q);
      // the owner (2026-11-12): the lens must never swing to the side on its own at a jump. Off: it stays behind the skier.
      cam.jw = 0; cam.ja = 0; }
    // the title page: the lens looks toward the sun or the moon, whichever lights the scene (when it is up and somewhere ahead; else a little left of the valley), and is swung
    // round the figure until the skier stands on the right third, across the picture from the words. tLook: where it looks, tPsi: the
    // way from the lens to the skier. Both glide (the sun moves; the window can change shape)
    const idl = cam.idle == null ? 1 : cam.idle;
    { let look = cam.yaw + G.titleYaw;
      if (typeof Sky !== 'undefined' && Sky.sunDir) { const sd = Sky.sunDir(), el = Math.asin(clamp(sd[1], -1, 1)); let da = Math.atan2(sd[0], -sd[2]) - look; da = Math.atan2(Math.sin(da), Math.cos(da)); look += da * smooth(-0.03, 0.03, el) * smooth(1.1, 0.7, Math.abs(da)); }
      const psi = look + Math.atan(aspect * Math.tan(cam.fov / 2) / 3); cam.tLook = first ? look : damp(cam.tLook, look, 2, dt); cam.tPsi = first ? psi : damp(cam.tPsi, psi, 2, dt); }
    const orb = cam.shO + (cam.jSide || 1) * (0.27 + 0.1 * (cam.ja || 0)) * cam.jw + (portrait ? 0 : idl * (cam.tPsi - cam.yaw));
    // (each stroke of a double-pole push gives the lens a small pull: it falls back a hand's breadth and opens a touch as the skier drives. Where the physics has no strokes yet, leaving the gate gives one such pull)
    const drive = spring(cam, 'drv', S.dp > 0 ? bell(0.22, 0.36, 0.5, 0.7, S.dp) : cam.launch || 0, 9, dt * q); cam.launch = damp(cam.launch || 0, 0, 3.5, dt);
    // (in the air it draws back a little, the more the higher the skier is over the snow, but never by much: the figure has to stay
    // large enough for the trick to be read. cam.hA: that height, as the lens takes it, a little late)
    spring(cam, 'hA', first ? 0 : Math.max(0, fl.fr - fl.sg), 5, dt * q);
    // the lens: wider with speed (and in the air, on a stroke, among trees), then the section's own (cam.shF)
    const fovS = (portrait ? lerp(1.30, 1.50, k) : lerp(CL.f0, CL.f1, k) + 0.10 * smooth(29, 41, sp)) + 0.05 * kc + 0.035 * drive + CL.wf * cam.wood, fovT = fovS + cam.shF;
    // (the distance to the skier as the picture sees it: the lens's own and the sixteenth of a second it trails by, sp / 16. As the lens
    // widens with speed the figure shrank to a seventh of the frame on the steeps at 115 km/h: from 80 km/h up the distance gives back
    // what the widening takes, so the figure holds about a fifth even tucked. A narrower lens for the section stands back by as much)
    let dist = (portrait ? lerp(5.6, 5.0, k) : lerp(CL.d0, CL.d1, k)) - 0.75 * Math.min(sp, 46) / 16 - 0.45 * cam.steep + 0.3 * kc + smin(0.3 * cam.hA, 1.4, 0.7) + 0.12 * drive - CL.wd * cam.wood + 0.7 * lost;
    // (the title page stands a metre further back: the skier, the sun a fifth of the way down and the valley all have room)
    // (and through a long flight it comes in closer than it would on the snow, so the figure is large against the sky as it goes over)
    if (!portrait) dist += 1.0 * (cam.idle == null ? 1 : cam.idle) - 0.8 * (cam.ja || 0);
    if (!portrait) { const lag = sp / 16, zc = (1 - Math.tan(CL.f0 / 2) / Math.tan(fovS / 2)) * smooth(22, 32, sp); dist = (dist + lag) * (1 - zc - 0.08 * smooth(25, 33, sp)) * Math.tan(fovS / 2) / Math.tan(fovT / 2) - lag; }
    // (on the title page the lens stands lower, so that pitched up to bring the sun a fifth of the way down the frame it still has the
    // skis in the picture; lining up for a marked jump it stands higher, and looks onto the face of the takeoff instead of along it)
    const hC = (portrait ? lerp(1.6, 1.3, k) : lerp(CL.h0, CL.h1, k)) - 0.3 * cam.low + 0.6 * cam.steep - CL.wh * cam.wood + cam.shH - 0.95 * (cam.idle == null ? 1 : cam.idle) + 0.6 * cam.jw * (1 - (cam.ja || 0)) + 0.55 * lost;
    const yo = cam.yaw + orb, dx = Math.sin(yo), dz = -Math.cos(yo), rx = Math.cos(yo), rz = Math.sin(yo);
    const a = cam.anchor;
    a[0] = damp(a[0], p[0], 16, dt * q); a[2] = damp(a[2], p[2], 16, dt * q); a[1] = damp(a[1], fl.fr, 9, dt * q);
    // before the run the lens idles: a slow drift from side to side, always turned back toward the figure
    cam.idle = damp(cam.idle == null ? 1 : cam.idle, G.mode === 'title' ? 1 : 0, 1.2, dt); const sway = cam.idle * 1.3 * Math.sin(G.t * 0.12);
    let cx = a[0] - dx * dist + rx * (cam.side + sway), cz = a[2] - dz * dist + rz * (cam.side + sway);
    // trees are solid to the lens too: it slides round the boughs instead of flying through them
    // (it looks a little way ahead along its own path as well, so the swerve starts before the boughs arrive)
    { let m = 0;
      for (let i = 0; i < 3; i++) {
        const la = i * 1.6, qx = cx + dx * la, qz = cz + dz * la; Course.nearTree(qx, qz, tnc);
        if (tnc.ok) { const R = tnc.h * 0.24 + 0.8; if (tnc.d < R) { const mi = ((qx - tnc.x) * rx + (qz - tnc.z) * rz >= 0 ? 1 : -1) * (R - tnc.d) * (1 - i * 0.22); if (Math.abs(mi) > Math.abs(m)) m = mi; } }
      }
      // (not among trees, cam.wood: there it would be stepping aside all the time, off the skier's line and into the next one's boughs,
      // and the trees it steps round are out of the picture before it reaches them: 14_trees.js takes out what stands against the lens)
      cam.dodge = 0; m = 0; /* off (the owner, 2026-11-12: the lens never jumps aside by itself; 14_trees.js fades what stands against it) */ cx += rx * cam.dodge; cz += rz * cam.dodge; }
    // height: follow the snow under the camera with a spring that tracks a steady descent exactly (no lag on a constant slope) but rounds off bumps
    // (gy: the snow under the lens with the bumps of a mogul field left out, as the lens has always taken it. Coming down behind a jump
    // it can meet that floor, so there the floor stands as far above it as the bumps do: mF)
    // (that margin comes on through a spring: a lip called in the middle of a mogul field must not lift the floor under the lens at a stroke)
    const gy = Course.height(cx, cz, 2), bm = Course.bumps(cx, cz), mF = spring(cam, 'mF', 0.8 * bm * smooth(0, 0.5, kc), 5, dt * q);
    if (first) { cam.dip = 0; cam.dipV = 0; cam.fk = 0; cam.fkV = 0; cam.shk = 0; }
    if (first || dt <= 0) { cam.gy = gy; cam.gv = 0; cam.tPrev = gy; cam.hOff = hC; cam.ys = p[1]; cam.yv = v[1]; cam.oS = gy + hC - p[1]; cam.fl = cam.flP = gy + 0.7 + mF; cam.flV = 0; cam.hA = 0; cam.hAV = 0; }
    else {
      // (the floor the lens keeps above, cam.fl: 0.7 m over the snow under it, and a thing with weight. It rides up with rising snow at
      // once, but where the snow falls away from under it - the lens crossing a lip, a moment behind the skier - it comes down after it
      // like something dropped, starting from the rate it had. With the skier in the air the lens's own ground line follows that floor
      // and not the bare snow: no edge of a lip, with three metres of air behind it, ever reaches the lens. It is drawn down harder than
      // a thing merely dropped: the skier is falling too, and a lens held up on that floor would never get down beside a short flight)
      const g7 = gy + 0.7 + mF; weighted(cam, 'fl', g7, cam.flV, 4.5, dt, 3);
      const T = gy + smooth(0, 0.3, kc) * (cam.fl - g7), w = 7.5, vT = clamp((T - cam.tPrev) / dt, -40, 40); cam.tPrev = T;
      cam.gv += (w * w * (T - cam.gy) + 2 * w * (vT - cam.gv)) * dt; cam.gy += cam.gv * dt;
      // (with the skier in the air a second spring follows the skier's own body, late: the body rises against the lens off the lip, hangs,
      // and falls away from it toward the landing; when the skis stop, the lens is still coming down)
      const ws = 3.6; cam.yv += (ws * ws * (p[1] - cam.ys) + 2 * ws * (v[1] - cam.yv)) * dt; cam.ys += cam.yv * dt;
    }
    // between banks (a gully, the trough of a turn in deep snow) the lens rides higher, so the picture is the run ahead and not the bank beside it
    const bankT = clamp(0.45 * (Math.max(Course.height(cx + rx * 7, cz + rz * 7, 2), Course.height(cx - rx * 7, cz - rz * 7, 2)) - gy - 0.5), 0, 2.4);
    // (...except in a gully under the owner's 'shots' b: there the lens keeps low between the walls, and the walls stand up in the picture)
    cam.bank = damp(cam.bank || 0, bankT * (1 - 0.7 * (cam.shG || 0)), 2.2, dt * q);
    // (and over a mogul field a hand higher: at hip height the crests come up to within a hand of the lens, nearer than it can see)
    cam.hOff = damp(cam.hOff, hC + cam.bank + 0.25 * bm, 2.5, dt * q);
    // (in flight the lens follows the body late, and low. Off the lip it is where the ramp had it, a little over a metre above the skis;
    // once the snow has fallen half a metre to two metres away beneath them it sinks to about the level of their knees: the skier stands
    // up out of the landing slope against the far side of the valley and the sky, and the height is seen from the side, as height. A
    // lens that stays above looks down on the figure flat against the snow, and three metres of air read as none. Coming down, the
    // same rule lifts it again before the snow has to. On the snow that offset is simply kept equal to where the lens is: no seam)
    cam.oS = damp(cam.oS, lerp(cam.gy + cam.hOff - cam.ys, lerp(1.25, 0.05 - 0.55 * (cam.ja || 0), smooth(0.5, 2, fl.fr - fl.sg)), smooth(0.05, 0.6, kc)), 5, dt * q);
    // (a landing presses the lens down for a moment)
    spring(cam, 'dip', fl.soak, 12, dt * q);
    // ...and that flight line keeps clear of the snow under the lens: of its own rounded ground line, cam.gy (riding 0.7 m over the
    // bare snow it would take every crease in it), and from well off, by a wide corner (wider, the higher the flight: the lens comes
    // down fast behind a big drop). So the ramp behind a lip hands the lens over to the flight, and the landing slope takes it back,
    // over a metre or two and not in a step. Only then are the line on the snow and the line in the air mixed, by how far into a
    // flight the skier is: on the snow the floor has no say, and coming back to it after a landing there is no corner left to close.
    // (The last resort is the weighted floor itself, not the bare snow under it, which vanishes at a lip; and its corner has an end,
    // so a floor well below the lens does not reach it at all)
    const fly = smax(cam.ys + cam.oS, cam.gy + 0.7 + mF, 1.2 + 0.2 * cam.hA);
    cam.pos[0] = cx; cam.pos[2] = cz; cam.pos[1] = cmax(lerp(cam.gy + cam.hOff, fly, kc) - 0.3 * cam.dip, cam.fl, 0.4);
    // and it never drops below the skier's knees (the skier on a crest, the lens still in the dip behind): it would be looking up at the sky
    // (except through a jump: there the lens is late on purpose, and for a moment the skier stands over it against the sky)
    { const lo = fl.fr + 0.55 - 4 * kc * kc, y = cam.pos[1]; cam.pos[1] = 0.5 * (y + lo + Math.sqrt((y - lo) * (y - lo) + 0.09)); }
    // (the lens kick, G.fovKick: a heavy landing sets it, and the lens opens a touch within a tenth of a second and closes again. It is
    // taken through a spring and added outside the slow follow of the lens: quick, and still without a corner)
    spring(cam, 'fk', G.fovKick, 14, dt);
    cam.fovB = damp(first ? fovT : cam.fovB, fovT, 3, dt * q); cam.fov = cam.fovB + cam.fk;
    // frame the skier in the lower part of the picture, whatever the slope is doing
    // (a wide picture is framed by the snow under the skis, which sits a fixed way up from its lower edge; standing at the start there is a
    // little more room under it. So in the air nothing has to be decided: the lens keeps looking at the snow, the skier leaves it and
    // rises in the picture by just the height gained, hangs, and comes back down to it; the slope and the shadow stay in view below)
    const hd = Math.hypot(p[0] - cam.pos[0], p[2] - cam.pos[2]) || 1, th = Math.tan(cam.fov / 2);
    const eFeet = Math.atan2(fl.fr - 0.1 - cam.pos[1], hd), eHead = Math.atan2(fl.fr + 1.85 - cam.pos[1], hd);
    const pitchT = portrait ? Math.atan2(fl.fr + 0.95 - cam.pos[1], dist) + Math.atan(0.27 * th) : Math.atan2(fl.sg - 0.1 - cam.pos[1], hd) + Math.atan((CL.kf + cam.shK - 0.05 * cam.idle) * th);
    // (on the title page the lens is pitched by the sun instead, so that it stands a fifth of the way down the frame (0.47: measured, the
    // drawn disc sits a little above the sun line through glare and refraction): by day, with the sun
    // in the picture. The limits below still hold the skis and the head in it)
    let pT = pitchT;
    if (cam.idle > 0.001 && !portrait && typeof Sky !== 'undefined' && Sky.sunDir) {
      const sd = Sky.sunDir(), el = Math.asin(clamp(sd[1], -1, 1)), az = Math.atan2(sd[0], -sd[2]), hh = Math.atan(aspect * th);
      let da = az - cam.tLook; da = Math.atan2(Math.sin(da), Math.cos(da));
      pT = lerp(pitchT, el - Math.atan(0.47 * th * Math.cos(da)), cam.idle * smooth(-0.03, 0.03, el) * smooth(hh + 0.15, hh - 0.1, Math.abs(da)));
    }
    cam.pitch = damp(cam.pitch, pT, 4.5, dt * q);
    // (looking down a steep pitch the far edge of the world must not leave by the top: the level line, and the city on it, stays at
    // least a fifth of the frame below the top edge. Not on the title page, which is pitched by the sun; the skis still win, below)
    if (!portrait) { const ph = -Math.atan(0.62 * th); cam.pitch = lerp(cam.pitch, smax(cam.pitch, ph, 0.03), 1 - idl); }
    // ...and whatever the snow does (a drop off a crest, a landing) the skis never leave by the lower edge, nor the head by the upper
    // (the limits are rounded where they take hold: the lens is turned by them, not struck)
    { const pMax = eFeet + Math.atan((0.90 - 0.2 * cam.idle) * th), pMin = eHead - Math.atan(0.74 * th); cam.pitch = smin(smax(cam.pitch, Math.min(pMin, pMax), 0.03), pMax, 0.03); }
    G.fovKick = damp(G.fovKick, 0, 3, dt); G.shake = damp(G.shake, 0, 5, dt); cam.shk = damp(cam.shk, G.shake, 30, dt);
    const sh = cam.shk, t = G.t;       // (only the one-off jolts: a landing, a fall, a bough. The constant fine tremor at speed is gone: it read as a stutter, and sickened)
    const ox = vnoise1(t * 17, 1) * sh, oy = vnoise1(t * 19, 2) * sh;
    // pushed aside by a tree, the lens turns back toward the skier so the figure never leaves the frame
    cam.pull = 0;   // off (the owner: no glances at animals; the lens stays on the skier)                 // something worth a glance beside us
    // (dA: what these two turns take the lens's distance to be. `dist` is measured from the point the lens follows, which trails the skier
    // by sp / 16 s: past about 140 km/h in a tuck (sooner, closing up among trees) it goes below nothing, and an atan2 of nothing over
    // less than nothing is half a turn. That was the lens thrown round to look back up the hill, the skier gone (the owner, 2026-11-12))
    const dA = Math.max(dist, 0.5);
    const ly = yo - (cam.jSide || 1) * 0.27 * cam.jw * 0.6 * (1 - (cam.ja || 0)) + Math.atan2(-cam.dodge, Math.max(lerp(dA, hd, cam.wood), 0.5)) * 0.9 + Math.atan2(-sway, dA) * 0.85 + (portrait ? 0 : (cam.tLook - cam.tPsi) * cam.idle) + cam.pull;
    const cp = Math.cos(cam.pitch), f = [Math.sin(ly) * cp, Math.sin(cam.pitch), -Math.cos(ly) * cp];
    cam.fwd = f;
    // (a tree gone by close, untouched: the lens ducks a finger's breadth and tips away from it, as 07c_feel.js has worked out; both
    // come and go without a corner, and the other viewpoints are handed the same lens)
    const fe = typeof Feel !== 'undefined' ? Feel : null, pos = [cam.pos[0] + rx * ox, cam.pos[1] + oy - (fe && fe.dip || 0), cam.pos[2] + rz * ox];
    // other viewpoints (07b_views.js) take the lens over here; the chase camera above keeps running underneath, so switching back is seamless
    if (G.viewCam && G.viewCam(dt, cam, pos, f)) return;
    Render.setCamera(pos, v3.add(pos, f), [0, 1, 0], cam.fov, cam.roll + vnoise1(t * 13, 3) * sh * 0.5 + (fe && fe.roll || 0));
  }

  // push off: a couple of skating strides' worth of speed straight down the fall line
  G.start = function () {
    G.mode = 'run'; G.runT = 0;
    const n = S.n; let fx = n[0] * n[1], fy = n[1] * n[1] - 1, fz = n[2] * n[1]; const fl = Math.hypot(fx, fy, fz) || 1;
    if (S.speed < 6) { if (S.speed < 1.2) { S.v[0] = fx / fl * 1.2; S.v[1] = fy / fl * 1.2; S.v[2] = fz / fl * 1.2; } S.dpGo = 3; }      // (the poles do the rest: up to three double-pole strokes, see step)
    // (the lens gives with the lunge, and the skis kick a little snow back: leaving the gate is a moment, not a fade)
    if (S.dp === undefined) cam.launch = 2.2; G.events.push({ type: 'push' });
  };
  G.update = function (dt) {
    G.t += dt; let n = 0;
    if (G.mode === 'run') {
      G.runT += dt; acc += dt;
      // (in slow motion the step shrinks with the clock: as many steps to a frame as at full speed, so the skier moves on every frame. With the
      // step held at 1/120 s of game time, at a third of the speed a frame got one step or none by turns and the flight juddered)
      // (and each frame's time is cut into equal steps of at most 1/120 s and spent whole: nothing carried over to the next frame. With a
      // remainder carried, a frame got one step, the next three, as the clock eased: the owner still saw the flight stutter)
      const ns = Math.min(Math.max(Math.ceil(acc / H - 1e-6), 1), 10), Hs = acc / ns; G.hs = Hs;
      if (acc > 1e-7) for (let k = 0; k < ns; k++) { step(Hs, Input.u); acc -= Hs; n++; G.stepT = G.t - Math.max(acc, 0); if (G.onStep) G.onStep(S, Hs); }
      acc = 0;
      if (n === 10) acc = 0;
      G.dist = -S.p[2]; G.drop = G.y0 - S.p[1]; if (S.speed > G.topSpeed) G.topSpeed = S.speed;
    }
    G.nSteps = n; updateFlight(dt, n); updatePose(dt); updateCamera(dt);
  };
  G.step = step;
  return G;
})();
