// ---------------------------------------------------------------- input (tilt / drag / keys) and the skiing itself: physics, camera, body language
const Input = (() => {
  const I = { u: 0, btn: { jump: false, tuck: false }, jump: false, tuck: false, mode: 'touch', tiltOK: false, tiltSeen: -1e9, gx: 0, zero: 0, keys: {}, drag: null, kb: 0, kHeld: 0, kWas: 0, script: null, used: false };
  I.init = function (el) {
    addEventListener('keydown', e => { I.keys[e.code] = true; }); addEventListener('keyup', e => { I.keys[e.code] = false; });
    el.addEventListener('pointerdown', e => { const x = View.x(e); I.drag = { id: e.pointerId, x0: x, x }; try { el.setPointerCapture(e.pointerId); } catch (_) { } });
    el.addEventListener('pointermove', e => { if (I.drag && e.pointerId === I.drag.id) I.drag.x = View.x(e); });
    const up = e => { if (I.drag && e.pointerId === I.drag.id) I.drag = null; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    addEventListener('blur', () => { I.keys = {}; I.drag = null; });
    // where the browser hands out tilt without asking (Android), listen from the start: the title page can then tell which way up it is held
    try { if (typeof DeviceOrientationEvent !== 'undefined' && !DeviceOrientationEvent.requestPermission) { addEventListener('deviceorientation', I.onOrient); I.listening = true; } } catch (e) { }
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
  // must be called from a tap (iOS asks for permission); resolves true if motion events may arrive
  I.requestTilt = async function () {
    try {
      if (typeof DeviceOrientationEvent === 'undefined') return false;
      if (DeviceOrientationEvent.requestPermission) { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') return false; }
      if (!I.listening) { addEventListener('deviceorientation', I.onOrient); I.listening = true; } return true;
    } catch (e) { return false; }
  };
  I.tiltLive = () => I.tiltOK && performance.now() - I.tiltSeen < 600;
  I.update = function (dt) {
    const k = (I.keys.ArrowRight || I.keys.KeyD ? 1 : 0) - (I.keys.ArrowLeft || I.keys.KeyA ? 1 : 0);
    // a key is all or nothing, and all of the steering is a skid. So a key asks for a carve: it aims inside the carve range, and only one
    // held on past half a second goes slowly on to full, where the skis are thrown sideways (a skid stays there for whoever means it)
    I.kHeld = k && k === I.kWas ? I.kHeld + dt : 0; I.kWas = k; const long = I.kHeld > 0.6;
    I.kb = damp(I.kb, k * (long ? 1 : 0.66), k ? (long ? 2.5 : 6) : 10, dt);
    let t = 0;
    if (I.drag) { t = clamp((I.drag.x - I.drag.x0) / (Math.min(View.w || innerWidth, (View.h || innerHeight) * 1.4, 900) * 0.2), -1, 1); I.mode = 'touch'; }
    else if (I.tiltLive()) { const d = I.gx - I.zero; t = clamp(sign(d) * Math.max(0, Math.abs(d) - 0.025) / 0.40, -1, 1); I.mode = 'tilt'; }
    t = clamp(t + I.kb, -1, 1);
    if (I.script != null) t = I.script;
    if (Math.abs(t) > 0.25) I.used = true;
    I.u = t;
    // the two moves besides steering, each one thing held down: jump (Space, or W / ArrowUp) and tuck-or-pole (ArrowDown or S).
    // On a touch screen the interface's buttons set I.btn; the physics reads I.jump and I.tuck
    const K = I.keys; I.jump = !!(K.Space || K.KeyW || K.ArrowUp || I.btn.jump); I.tuck = !!(K.ArrowDown || K.KeyS || I.btn.tuck);
  };
  return I;
})();

const Game = (() => {
  const G = { mode: 'title', t: 0, runT: 0, timeScale: 1, shake: 0, fovKick: 0, events: [], onStep: null, dist: 0, drop: 0, topSpeed: 0 };
  // the body on its legs: stiffness about the stance and toward the end of the travel, damping as they fold and (more) as they push back, how
  // far the legs reach down (E_MAX) and fold (E_MIN) from where they stand, the most they press in a turn or a dip and in a hard landing, how
  // fast the load that others read may change, how much of a mogul the body is told about and what a field of them costs, what a landing
  // costs (speed owed per m/s of speed into the snow, beyond what legs take in their stride), how fast a leg can follow snow that falls away
  // and how far the legs reach out for a landing
  const GRAV = 9.81, K_LEG = 95, K3_LEG = 420, C_LEG = 16, C_REB = 40, E_MAX = 0.22, E_MIN = -0.30, N_MAX = 7 * GRAV, N_HARD = 14 * GRAV, N_SLEW = 2 * GRAV * 120, MOG_K = 0.45, MOG_MU = 0.12, LAND_K = 0.3, LAND_V0 = 3, LEG_V = 4, LEG_AIR = 0.18, H = 1 / 120;
  // the jump: time to wind up, how far the legs fold for it, the speed a tap and a full wind-up give, how long the drive lasts; how far a tuck sits down
  const CHG_T = 0.42, CHG_E = 0.17, POP_V0 = 1.5, POP_V1 = 3.3, POP_T = 0.14, TUCK_E = 0.07;
  // the double-pole stroke: its length (s), the phase of the plant and of the end of the drive, what one stroke is worth from rest (m/s), the
  // speed above which poling gives nothing and the skier tucks instead, and the speed at which the strokes that leave the start stop
  const DP_T = 0.95, DP_PLANT = 0.22, DP_END = 0.62, DP_DV = 1.6, V_POLE = 9.5, V_GLIDE = 6.5;
  const S = G.s = {
    p: [0, 0, 0], v: [0, 0, 0], n: [0, 1, 0], t: [0, 0, -1], r: [1, 0, 0], h: 0, e: 0, air: false, airT: 0, speed: 0, lean: 0, leanV: 0, beta: 0, load: GRAV,
    aReac: 0, aSkid: 0, aCarve: 0, tuck: 0, tuckT: 0, powder: 0.25, landV: 0, crash: 0, brush: 0, u: 0, contact: true, hdot: 0,
    // for the others to read: the jump's wind-up 0..1, the player's own tuck 0..1, how airborne 0..1 (smooth), the phase of the double-pole
    // stroke (0 = none), and how far the legs are folded or reached out from the stance (m, E_MIN..E_MAX, never jumps: the skis are at p.y - leg)
    charge: 0, tuckIn: 0, airK: 0, dp: 0, leg: 0,
  };
  // (the physics' own book-keeping for the moves; set whenever the skier is put somewhere)
  const still = () => { S.charge = S.tuckIn = S.airK = S.dp = S.leg = 0; S.jOn = false; S.jT = 0; S.jLock = true; S.popT = -1; S.popV = 0; S.lift = false; S.dpGo = 0; S.owe = 0; S.load = GRAV; S.airT = 0; S.landV = 0; S.off = 0; };
  still();
  // the chase camera when the picture is wide (the way the game is meant to be held): how low the skier sits in the frame, lens, distance, height
  G.camL = { k: 0.52, kf: 0.74, f0: 0.98, f1: 1.18, d0: 4.3, d1: 3.8, h0: 1.35, h1: 1.1 };
  // on the title page the lens looks a little to the left of the figure: the words stand on that side, the picture gathers on the other
  G.titleYaw = -0.13;
  const cam = G.cam = { pos: [0, 3, 8], yaw: 0, roll: 0, fov: 1.3, anchor: [0, 0, 0], pitch: -0.2, side: 0, gy: 0, init: false, fwd: [0, 0, -1] };
  const pc = {}, pk = {}, tn = { ok: false }, tnc = { ok: false };
  let acc = 0;

  G.reset = function (s0 = 14) {
    const c = Course.at(s0, pc), x = c.cx, z = -s0, h = Course.height(x, z, 0.5);
    S.p = [x, h, z]; S.v = [0, 0, 0]; S.lean = S.leanV = S.beta = 0; S.air = false; S.speed = 0; S.tuck = 0; S.crash = 0; S.h = h; S.e = 0;
    const n = Course.normal(x, z, 0.35); S.n = [n[0], n[1], n[2]]; S.t = [0, 0, -1]; S.r = [1, 0, 0];
    cam.init = false; G.runT = 0; G.dist = 0; G.drop = 0; G.topSpeed = 0; G.y0 = h; acc = 0; pose.init = false;
    still();
  };

  function step(dt, u) {
    const p = S.p, v = S.v, n = S.n;
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
      if (sound && S.jT > 0) { S.popV = lerp(POP_V0, POP_V1, sat(S.jT / CHG_T)) * (1 + 0.3 * sat((S.load / GRAV - 1.1) / 0.6)); S.popT = 0; }
      S.jOn = false; S.jT = 0;
    }
    S.charge = S.jOn ? sat(S.jT / CHG_T) : Math.max(0, S.charge - dt / 0.07);
    let nPop = 0;
    if (S.popT >= 0) { const q = S.popT / POP_T, sq = Math.sin(PI * q); if (q >= 1 || !contact) { S.popT = -1; S.lift = contact; } else { nPop = S.popV * 2 / POP_T * sq * sq; S.popT += dt; } }
    // accelerate: one control. Slow, the skier double-poles, stroke after stroke (S.dp is the phase of the stroke: reach, plant at 0.22, drive
    // to 0.62, release, recover); poles do nothing for a skier already moving faster than arms can push, so above V_POLE the same control is a
    // tuck (S.tuckIn). The stroke in hand is always finished first. Leaving the start is the same stroke, up to three, until the slope takes over
    if (S.dpGo > 0 && sp >= V_GLIDE) S.dpGo = 0;
    const more = sound && calm && (S.dpGo > 0 || Input.tuck && sp < V_POLE - 1);
    if (S.dp > 0) {
      const q0 = S.dp;
      if (q0 < DP_PLANT && !(sound && calm)) S.dp = Math.max(0, q0 - 2 * dt / DP_T);       // not planted and no longer possible (off the snow, hard over, hit): the hands come back
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

    // ---- the edge of the run. Nothing pushes the skier back into it (the force that did hauled it up the flank of a ridge by itself).
    // Past the edge three things act, as they would on a mountain. The snow lies deep and drags. The skis hold their edge against a flank
    // that falls away from the run, instead of sliding off down it. And the skier's own steering brings the line round toward the run, the
    // farther out the more firmly. The last two act across the direction of travel: they turn the skier and cannot add speed, so any
    // height won back is paid for in speed. A slow skier is never steered onto a line that climbs: it traverses downhill until there is speed to spend
    const uo = p[0] - c.cx, so = uo < 0 ? -1 : 1, eo = Math.abs(uo) - c.hw; S.off = eo;
    const yawC = Math.atan2(Course.at(-p[2] + 12, pk).cx - c.cx, 12), yawV = Math.atan2(v[0], -v[2]);       // which way the valley runs here, and the skier
    let uE = u, aHold = 0;
    // (no steering turns the skier on round until it faces up the hill: as the line swings across the valley the lean asked for fades to
    // nothing, so a turn held too long ends as a traverse, still going down. Height is only ever won on speed already in hand)
    if (sp > 1.5) { let hd = yawV - yawC; hd -= TAU * Math.round(hd / TAU); if (u * hd > 0) uE = u * smooth(1.30, 0.80, Math.abs(hd)); }
    // (on a ridge the 'edge' is taken some metres early: its rims carry the wind lips and the stunted trees, which stand from four metres inside it)
    const eq = eo + 9 * c.ridge;
    if (eq > -9 && sp > 0.3) {
      const gx = -n[0] / n[1], gz = -n[2] / n[1];                                          // the snow's gradient
      // (the most outward heading allowed: any at all nine metres inside the edge and less and less from there, along the run at the edge, back toward it beyond)
      let lim = yawC + so * (1.1 * smooth(-5, -9, eq) + 0.5 * smooth(0, -5, eq) - 0.32 * smooth(0, 9, eq));
      const need = lerp(0.12, -0.6, smooth(5, 11, sp)), fall = Math.atan2(-gx, gz);
      for (let i = 0; i < 14 && gx * Math.sin(lim) - gz * Math.cos(lim) > -need; i++) { let d = fall - lim; d -= TAU * Math.round(d / TAU); if (Math.abs(d) < 0.1) break; lim += sign(d) * 0.1; }
      let err = so * (yawV - lim); err -= TAU * Math.round(err / TAU);
      if (so * u > 0) uE *= 1 - smooth(1, 13, eo);                                         // steering away from the run counts for less the farther out
      if (err > 0) uE = clamp(uE - so * Math.min(0.85, 1.7 * err) * sat(sp / 2) * sat(Math.abs(uo) / 2), -1, 1);       // (nothing at the very middle: which side is 'out' changes there)
      if (so * rx * ry < 0) aHold = GRAV * ry * smooth(0, 5, eq);
    }

    // the player leans; the lean is what turns the skis (tucked, the body cannot be thrown over as far, nor the skis pivoted)
    const gn = GRAV * n[1];
    const phiMax = Math.min(0.96, Math.atan(Math.max(sp, 2.5) ** 2 / (10.5 * gn))) * (1 - 0.3 * S.tuckIn);
    const cu = clamp(uE / 0.72, -1, 1), phiT = sign(cu) * Math.pow(Math.abs(cu), 1.2) * phiMax * (S.air && S.airT > 0.14 ? 0.3 : 1) * (1 - 0.28 * smooth(0.72, 1.0, Math.abs(uE)));
    const wn = S.air ? 5 : 9.5, zeta = 0.92;
    S.leanV += (wn * wn * (phiT - S.lean) - 2 * zeta * wn * S.leanV) * dt; S.lean += S.leanV * dt;
    // past the carve range the skis are pivoted across the direction of travel: a skid that brakes and throws snow
    const su = sign(uE) * smooth(0.72, 1.0, Math.abs(uE)) * (1 - 0.8 * S.tuckIn);
    const betaT = contact ? su * 0.62 + clamp(S.leanV * 0.085, -0.28, 0.28) * smooth(3, 8, sp) : S.beta * 0.5;
    S.beta += (betaT - S.beta) * (1 - Math.exp(-dt / 0.11));
    let aLat = 0, aTan = aPole; S.aReac = 0; S.aSkid = 0; S.aCarve = 0;
    if (contact) {
      const grip = lerp(1.0, 0.8, S.powder), sb = Math.sin(S.beta), cb = Math.cos(S.beta);
      const aC = N * Math.tan(S.lean) * grip;
      const aSk = (0.95 + 0.25 * S.powder) * N * sat(Math.abs(sb) / 0.34) * smooth(0.5, 3, sp);
      const lim = 1.95 * N, aReac = clamp(aC + aSk * cb * sign(sb) + clamp(aHold, -0.85 * N, 0.85 * N), -lim, lim);
      const mu = lerp(0.028, 0.06, S.powder) + (c.mog > 0.01 ? MOG_MU * Course.bumps(p[0], p[2]) : 0), lowV = sat(sp / 0.6);       // (a field of bumps is slow going; the smooth line through it is not)
      aLat = aReac; aTan -= (aSk * Math.abs(sb) + 0.05 * Math.abs(aC) + mu * N) * lowV;
      S.aReac = aReac; S.aSkid = aSk; S.aCarve = aC;
      if (S.crash > 0) { aTan -= 2.5 * lowV; }
      if (eo > 0) aTan -= (1.6 + 0.006 * sp * sp) * sat(eo / 16) * (1 - 0.5 * c.ridge) * sat(sp / 6);       // deep, unpacked snow off the run (wind-packed and firmer along a ridge)
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
          if (vd < 0) { const kk = Math.min(1, 12 * dt); let ux = -nz, uz = nx; if (v[0] * ux + v[2] * uz < 0) { ux = -ux; uz = -uz; } v[0] -= vd * (nx + 0.75 * ux) * kk; v[2] -= vd * (nz + 0.75 * uz) * kk; }
        }
      }
    }
  }

  // ---- body language: physical state -> pose parameters (smoothed where a real body would lag)
  const pose = G.pose = { init: false, lean: 0, bal: 0, edge: 0, crouch: 0.2, tuck: 0, air: 0, sep: 0, headYaw: 0, lead: 0, stance: 0.31, fore: 0, armL: [0, 0, 0], armR: [0, 0, 0], swing: 0, liftL: 0, liftR: 0, pitchL: 0, pitchR: 0, plantL: 0, plantR: 0 };
  const root = G.root = { pos: [0, 0, 0], fwd: [0, 0, -1], nrm: [0, 1, 0] };
  function updatePose(dt) {
    const sp = S.speed, k = pose.init ? 1 : 1e6; pose.init = true;
    const hv = pc.mog > 0.01 ? Course.height(S.p[0], S.p[2], 0.5) : S.h; S.hv = hv;
    // tuck when running straight and fast
    // (above a hundred an hour a racer holds the tuck through long turns too, and only stands out of it to turn hard)
    const fast = smooth(24, 31, sp), wantTuck = (!S.air && sp > 15 && Math.abs(S.u) < lerp(0.12, 0.55, fast) && Math.abs(S.lean) < lerp(0.14, 0.40, fast) && S.crash <= 0) ? 1 : 0;
    S.tuckT = wantTuck ? S.tuckT + dt : 0; S.tuck = damp(S.tuck, S.tuckT > 0.45 ? 1 : 0, wantTuck ? 2.5 : 6, dt);
    // (...and at that pace nobody stands tall even to turn: between tucks it is a high tuck, hands forward and together, lower the gentler the turn)
    pose.tuckHi = damp(pose.tuckHi || 0, (S.air || S.crash > 0) ? 0 : 0.62 * fast * (1 - 0.5 * sat((Math.abs(S.lean) - 0.4) / 0.45)), 3, dt);
    pose.tuck = Math.max(S.tuck, pose.tuckHi); const flying = S.air && S.airT > 0.14;       // a hop off a bump is not a jump
    pose.air = damp(pose.air, flying ? 1 : 0, flying ? 9 : 14, dt * k);
    // the body stands where the forces put it. Its inclination follows what the snow is pushing back with (sideways push over load: the
    // angle at which a skier is in balance), not the steering that causes it: so it is into the turn the moment the edges bite, and back
    // over the skis the moment the load comes off. (Over a crest, with no load to speak of, it holds what it had.)
    if (S.contact && S.load > 1.5) pose.bal = Math.atan2(S.aReac, S.load); else if (flying) pose.bal = S.lean * 0.5;
    const balT = lerp(S.lean, clamp(pose.bal || 0, -0.92, 0.92), 0.8 * smooth(3, 9, sp));
    pose.lean = damp(pose.lean, balT, 15, dt * k); const Lv = pose.lean, sL = Math.sin(Lv);
    pose.edge = clamp(Lv * 1.12 + S.beta * 0.25, -1.3, 1.3);
    const Hh = 0.90 + clamp(S.e + (S.contact ? S.h - S.hv : 0), E_MIN, E_MAX), cT = clamp((0.98 - Hh) / 0.38 + Math.abs(Lv) * 0.10 + pose.tuck * 0.22 + 0.16 * smooth(17, 30, sp) + (S.crash > 0 ? 0.25 : 0), 0, 1);
    pose.crouch = damp(pose.crouch, flying ? 0.42 : cT, flying ? 6 : 30, dt * k);
    pose.sep = damp(pose.sep, -S.beta * 0.8 - Lv * 0.22, 8, dt * k);
    pose.headYaw = damp(pose.headYaw, Lv * 0.3 + S.beta * 0.3, 6, dt * k);
    // (the inside ski draws ahead as the edges come up: hardly at all in a shallow turn)
    pose.lead = 0.19 * sL * Math.abs(sL); pose.stance = 0.31 + 0.16 * Math.abs(sL) + 0.05 * pose.air;
    pose.fore = damp(pose.fore, clamp(-S.leanV * 0.0 + (S.air ? -0.3 : 0), -1, 1), 5, dt * k);
    // the pole plant: as one turn is let go the new inside pole swings forward, and its basket touches the snow beside the ski tip at the
    // moment the edges change; then it is left behind. (A gentle change of direction gets half a swing and no touch.)
    const quiet = S.air || S.crash > 0 ? 0 : (1 - sat(pose.tuck * 3)) * smooth(3, 7, sp);
    for (const side of [-1, 1]) {
      // (wanted from the last third of the old turn until the new edges have just begun to bite: a touch, not a prop to lean on)
      const key = side < 0 ? 'plantL' : 'plantR', want = quiet * sat(side * S.leanV * 0.75 - 0.15) * smooth(0.62, 0.20, -side * S.lean) * smooth(0.20, 0.03, side * S.lean);
      pose[key] = damp(pose[key] || 0, want, want > (pose[key] || 0) ? 15 : 10, dt * k);
      const a = side < 0 ? pose.armL : pose.armR, q = pose[key];
      a[0] = side * 0.03 * q; a[1] = 0.03 * q; a[2] = -0.10 * q;
    }
    pose.swing = Math.sin(G.t * 2.3) * 0.25 + S.leanV * 0.12;
    if (S.crash > 0) { const w = Math.sin(S.crash * 22) * S.crash; pose.armL[1] += 0.18 * S.crash + 0.05 * w; pose.armR[1] += 0.18 * S.crash - 0.05 * w; pose.sep += w * 0.25; }
    // root frame
    const n = S.n, air = S.air;
    // (the feet stand on the snow that is drawn; over bumps the body rides a smoother line and the legs make up the difference)
    root.pos[0] = S.p[0]; root.pos[2] = S.p[2]; root.pos[1] = S.contact ? hv : Math.max(S.p[1] - E_MAX, hv);
    // skis point along travel, pivoted by the skid angle about the snow normal
    const cb = Math.cos(S.beta), sb = Math.sin(S.beta);
    let fx = S.t[0] * cb + S.r[0] * sb, fy = S.t[1] * cb + S.r[1] * sb, fz = S.t[2] * cb + S.r[2] * sb;
    let nx = n[0], ny = n[1], nz = n[2];
    if (air) { // in the air the skis follow the flight path, nose slightly up
      const v = S.v, l = Math.hypot(v[0], v[1], v[2]) || 1; fx = v[0] / l; fy = v[1] / l + 0.10; fz = v[2] / l;
      const d = fx * 0 + fy * 1 + fz * 0, ux = -fx * d, uy = 1 - fy * d, uz = -fz * d, ul = Math.hypot(ux, uy, uz) || 1; nx = ux / ul; ny = uy / ul; nz = uz / ul;
    }
    const rate = air ? 6 : 16;
    for (let i = 0; i < 3; i++) { root.fwd[i] = damp(root.fwd[i], [fx, fy, fz][i], rate, dt * k); root.nrm[i] = damp(root.nrm[i], [nx, ny, nz][i], rate, dt * k); }
    const fl = Math.hypot(root.fwd[0], root.fwd[1], root.fwd[2]) || 1, nl = Math.hypot(root.nrm[0], root.nrm[1], root.nrm[2]) || 1;
    for (let i = 0; i < 3; i++) { root.fwd[i] /= fl; root.nrm[i] /= nl; }
  }

  // ---- chase camera: behind and above, looking down the mountain past the skier
  const _ca = {}, _cb = {};
  function updateCamera(dt) {
    const p = S.p, v = S.v, aspect = Render.W / Math.max(1, Render.H), portrait = aspect < 1, sp = S.speed, k = smooth(6, 30, sp);
    const first = !cam.init; cam.init = true; const q = first ? 1e6 : 1;
    // the lens looks down the valley, whichever way the valley is running just here, and goes a little over half way with the skier's own turns
    const cyw = Course.yawAt(-p[2]), vyaw = sp > 1.5 ? Math.atan2(v[0], -v[2]) : cyw;
    cam.cyaw = damp(cam.cyaw == null || first ? cyw : cam.cyaw, cyw, 1.3, dt * q);
    cam.yaw = damp(cam.yaw, cam.cyaw + clamp((vyaw - cam.cyaw) * 0.55, -0.7, 0.7), 2.4, dt * q);
    // drift toward the inside of the turn: the curtain hangs just outside the track, and from in here the lens looks along its lit face instead of flying through it
    cam.side = damp(cam.side, S.lean * 0.55 + S.beta * 0.5, 2.2, dt * q);
    cam.roll = damp(cam.roll, -S.lean * 0.20, 5, dt * q);
    // the camera rides low, at about hip height: the skier and the thrown snow stand up against the valley and the sky, and the snow rushes past close.
    // in a hard turn it sinks a little more and swings wide, so the curtain is between the lens and the sun
    cam.low = damp(cam.low || 0, sat(Math.abs(S.lean) / 0.8) * (S.air ? 0 : 1), 3, dt * q);
    const CL = G.camL;
    // (the point the lens follows trails the skier by a sixteenth of a second: most of that is taken back out of the distance, or the figure would shrink as the speed went up)
    // on a steep pitch the lens rides higher and nearer, and so looks down the fall line: the slope is seen to drop away under the skier
    { const s0 = -p[2], sl = (Course.at(s0 - 14, _ca).baseY - Course.at(s0 + 14, _cb).baseY) / 28; cam.steep = damp(cam.steep || 0, smooth(0.44, 0.58, sl), 1.2, dt * q); }
    const dist = (portrait ? lerp(5.6, 5.0, k) : lerp(CL.d0, CL.d1, k)) - 0.75 * Math.min(sp, 46) / 16 - 0.45 * cam.steep, hC = (portrait ? lerp(1.6, 1.3, k) : lerp(CL.h0, CL.h1, k)) - 0.3 * cam.low + 0.6 * cam.steep;
    const dx = Math.sin(cam.yaw), dz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = Math.sin(cam.yaw);
    const a = cam.anchor, ay = S.contact ? S.h : p[1] - E_MAX;
    a[0] = damp(a[0], p[0], 16, dt * q); a[2] = damp(a[2], p[2], 16, dt * q); a[1] = damp(a[1], ay, S.air ? 5 : 9, dt * q);
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
      cam.dodge = damp(cam.dodge || 0, m, m ? 14 : 3.5, dt * q); cx += rx * cam.dodge; cz += rz * cam.dodge; }
    // height: follow the snow under the camera with a spring that tracks a steady descent exactly (no lag on a constant slope) but rounds off bumps
    const gy = Course.height(cx, cz, 2);
    if (first || dt <= 0) { cam.gy = gy; cam.gv = 0; cam.gPrev = gy; cam.hOff = hC; }
    else {
      const vT = clamp((gy - cam.gPrev) / dt, -40, 40), w = 7.5;
      cam.gv += (w * w * (gy - cam.gy) + 2 * w * (vT - cam.gv)) * dt; cam.gy += cam.gv * dt; cam.gPrev = gy;
    }
    // between banks (a gully, the trough of a turn in deep snow) the lens rides higher, so the picture is the run ahead and not the bank beside it
    const bankT = clamp(0.45 * (Math.max(Course.height(cx + rx * 7, cz + rz * 7, 2), Course.height(cx - rx * 7, cz - rz * 7, 2)) - gy - 0.5), 0, 2.4);
    cam.bank = damp(cam.bank || 0, bankT, 2.2, dt * q);
    cam.hOff = damp(cam.hOff, (S.air ? hC + 0.5 : hC) + cam.bank, 2.5, dt * q);
    cam.pos[0] = cx; cam.pos[2] = cz; cam.pos[1] = Math.max(cam.gy + cam.hOff, gy + 0.7);
    // and it never drops below the skier's knees (the skier on a crest, the lens still in the dip behind): it would be looking up at the sky
    { const lo = root.pos[1] + 0.55, y = cam.pos[1]; cam.pos[1] = 0.5 * (y + lo + Math.sqrt((y - lo) * (y - lo) + 0.09)); }
    const fovT = (portrait ? lerp(1.30, 1.50, k) : lerp(CL.f0, CL.f1, k) + 0.10 * smooth(29, 41, sp)) + G.fovKick; cam.fov = damp(cam.fov, fovT, 3, dt * q);
    // frame the skier in the lower part of the picture, whatever the slope is doing
    // (a wide picture is framed by the skis, which sit a fixed way up from its lower edge; standing at the start there is a little more room under them)
    const hd = Math.hypot(root.pos[0] - cam.pos[0], root.pos[2] - cam.pos[2]) || 1, th = Math.tan(cam.fov / 2);
    const eFeet = Math.atan2(root.pos[1] - 0.1 - cam.pos[1], hd), eHead = Math.atan2(root.pos[1] + 1.85 - cam.pos[1], hd);
    const pitchT = portrait ? Math.atan2(root.pos[1] + 0.95 - cam.pos[1], dist) + Math.atan(0.27 * th) : eFeet + Math.atan((CL.kf - 0.05 * cam.idle) * th);
    cam.pitch = damp(cam.pitch, pitchT, 4.5, dt * q);
    // ...and whatever the snow does (a drop off a crest, a landing) the skis never leave by the lower edge, nor the head by the upper
    { const pMax = eFeet + Math.atan(0.90 * th), pMin = eHead - Math.atan(0.74 * th); cam.pitch = clamp(cam.pitch, Math.min(pMin, pMax), pMax); }
    G.fovKick = damp(G.fovKick, 0, 3, dt); G.shake = damp(G.shake, 0, 5, dt);
    const sh = 0.010 * k * k + G.shake, t = G.t;
    const ox = vnoise1(t * 17, 1) * sh, oy = vnoise1(t * 19, 2) * sh;
    // pushed aside by a tree, the lens turns back toward the skier so the figure never leaves the frame
    cam.pull = damp(cam.pull || 0, typeof Deer !== 'undefined' && Deer.pull ? Deer.pull : 0, 1.4, dt);                 // something worth a glance beside us
    const ly = cam.yaw + Math.atan2(-cam.dodge, dist) * 0.9 + Math.atan2(-sway, dist) * 0.85 + (portrait ? 0 : G.titleYaw * cam.idle) + cam.pull;
    const cp = Math.cos(cam.pitch), f = [Math.sin(ly) * cp, Math.sin(cam.pitch), -Math.cos(ly) * cp];
    cam.fwd = f;
    const pos = [cam.pos[0] + rx * ox, cam.pos[1] + oy, cam.pos[2] + rz * ox];
    // other viewpoints (07b_views.js) take the lens over here; the chase camera above keeps running underneath, so switching back is seamless
    if (G.viewCam && G.viewCam(dt, cam, pos, f)) return;
    Render.setCamera(pos, v3.add(pos, f), [0, 1, 0], cam.fov, cam.roll + vnoise1(t * 13, 3) * sh * 0.5);
  }

  // push off: a couple of skating strides' worth of speed straight down the fall line
  G.start = function () {
    G.mode = 'run'; G.runT = 0;
    const n = S.n; let fx = n[0] * n[1], fy = n[1] * n[1] - 1, fz = n[2] * n[1]; const fl = Math.hypot(fx, fy, fz) || 1;
    if (S.speed < 6) { if (S.speed < 1.2) { S.v[0] = fx / fl * 1.2; S.v[1] = fy / fl * 1.2; S.v[2] = fz / fl * 1.2; } S.dpGo = 3; }      // (the poles do the rest: up to three double-pole strokes, see step)
    // (the lens gives with the lunge, and the skis kick a little snow back: leaving the gate is a moment, not a fade)
    G.fovKick = 0.085; G.events.push({ type: 'push' });
  };
  G.update = function (dt) {
    G.t += dt;
    if (G.mode === 'run') {
      G.runT += dt; acc += dt; let n = 0;
      while (acc >= H && n < 10) { step(H, Input.u); acc -= H; n++; G.stepT = G.t - acc; if (G.onStep) G.onStep(S, H); }
      if (n === 10) acc = 0;
      G.dist = -S.p[2]; G.drop = G.y0 - S.p[1]; if (S.speed > G.topSpeed) G.topSpeed = S.speed;
    }
    updatePose(dt); updateCamera(dt);
  };
  G.step = step;
  return G;
})();
