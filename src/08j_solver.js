// ---------------------------------------------------------------- 新求解器 (developer switch 'solver', design: 动作清单合同和求解器设计稿, 2026-11-17)
// The body's motion is to be the RESULT of the physics, the snow and the body's own limits, solved in one fixed order, instead of poses written by
// hand and patched afterwards. It replaces the old figure step by step behind this switch; the game's own dressed figure is what it moves.
//   step 1 (this file, so far): the skis lie on the real snow. The figure used to know one point of the snow and one plane through it, so where the
//   snow rolls (rollers, moguls, a gully's wall) a ski 1.5 m long cut into it (measured on the game's own figure: more than 1 cm in 14% of all
//   frames on snow, up to 37 cm). Here the snow is read under each ski along its length and the ski lies on it as a stiff bar (see lay).
const Solver = (() => {
  const K = Skier, sat = x => Math.max(0, Math.min(1, x));
  Variants.def('solver', '新求解器', [['a', '关'], ['b', '雪板贴真实雪面']], 'a');
  const ZS = [-0.75, -0.5625, -0.375, -0.1875, 0, 0.1875, 0.375, 0.5625, 0.75], EL = new Array(ZS.length), ER = new Array(ZS.length), EC = new Array(ZS.length), HALF = 0.6, DROP = 30, PUSH = 120;
  // One ski, standing at (x0, z0) in the figure's frame, as what it is: a stiff bar that the snow can push up anywhere along its length but cannot pull
  // down. Each frame its two ends first fall as a thing falls that a leg pushes down (at most DROP), then the bar is lifted where the snow stands
  // over it, turning about the place it is hit as a bar does. So it lies on the high points of the snow under it; where the snow falls away faster
  // than it can fall (the back of a bump at speed) it is light for a moment; and over a lip its tail stays on the table while its tip comes down
  // at the pace a ski can turn, instead of the whole ski tipping in a frame. This is all the smoothing there is here: the contact itself.
  // q[k..k+3]: front end's height and speed, rear end's height and speed. Returns the height under the boot in q[k], q[k + 2] (as ends).
  function read(E, x0, z0, toW, ref, iy) { for (let i = 0; i < ZS.length; i++) { const q3 = toW([x0, 0, z0 + ZS[i]]); E[i] = (Course.height(q3[0], q3[2], 0.5) - q3[1] - ref) * iy; } }
  function lay(q, k, E, dt) {
    const n = ZS.length, zf = -HALF, zr = HALF;
    const fresh = !(dt > 0) || q[k] == null; let f0 = q[k], r0 = q[k + 2], f, r;
    if (fresh) { let sz = 0, se = 0, szz = 0, sze = 0; for (let i = 0; i < n; i++) { const z = ZS[i]; sz += z; se += E[i]; szz += z * z; sze += z * E[i]; }
      const b = (n * sze - sz * se) / (n * szz - sz * sz), a = (se - b * sz) / n; f = a + b * zf; r = a + b * zr; }
    else { f = f0 + (q[k + 1] - DROP * dt) * dt; r = r0 + (q[k + 3] - DROP * dt) * dt; }
    for (let it = 0; it < 4; it++) for (let i = 0; i < n; i++) { const wr = (ZS[i] - zf) / (zr - zf), wf = 1 - wr, d = E[i] - (f * wf + r * wr); if (d > 0) { const g = d / (wf * wf + wr * wr); f += g * wf; r += g * wr; } }
    // (and the snow cannot throw a ski up at any pace either: a boot, a ski and the leg above them weigh some kilograms, and snow gives way when it
    // is hit: an end's speed upward grows by at most PUSH. Measured without it, in a mogul field at 18 m/s: the foot's speed turned from 1.8 m/s down
    // to 3 m/s up in one frame, 30 g, and the knee's angle with it. For the frame or two that this takes, the ski cuts into the face of the bump)
    if (!fresh) { const vf = Math.min((f - f0) / dt, q[k + 1] + PUSH * dt), vr = Math.min((r - r0) / dt, q[k + 3] + PUSH * dt); f = f0 + vf * dt; r = r0 + vr * dt; }
    q[k + 1] = fresh ? 0 : Math.max(-6, Math.min(6, (f - f0) / dt)); q[k + 3] = fresh ? 0 : Math.max(-6, Math.min(6, (r - r0) / dt)); q[k] = f; q[k + 2] = r;
  }
  // The physics carries the body over a mogul field as legs that absorb would: it rides only a part of each bump's height (pose.mogK; the game's
  // MOG_K is 0.45) and leaves the rest to the legs. The legs have 0.38 m of travel, and the bumps left to them stand up to 0.65 m over the physics'
  // snow (measured, 2026-11-18): where a bump is more than the legs have left, the body has to go up over it. It does so as a skier does who sees the
  // bump coming: the snow is read along the line of travel for the next AHEAD seconds, and the body starts up before the bump is under the feet,
  // on a path with no step in it. q[13..15]: where the figure was (its velocity is read off that), q[16], q[17]: the lift and its speed.
  const AHEAD = 0.4, TRAVEL = 0.38, SPARE = 0.04, LW = 9;
  function bump(x, z, mk) { const real = Course.height(x, z, 0.5); if (!(mk < 1)) return 0; const k0 = Course.mogK; Course.mogK = mk; const ph = Course.height(x, z, 0.5); Course.mogK = k0; return real - ph; }
  function lift(q, cur, root, dt, on) {
    const p = root.pos; let vx = 0, vz = 0;
    if (dt > 0 && q[13] != null) { vx = (p[0] - q[13]) / dt; vz = (p[2] - q[15]) / dt; } q[13] = p[0]; q[15] = p[2];
    if (!(dt > 0) || q[16] == null) { q[16] = 0; q[17] = 0; }
    let need = 0;
    if (on && (cur.mogK == null ? 1 : cur.mogK) < 1) { const room = TRAVEL * (1 - sat(cur.crouch == null ? 0.21 : cur.crouch)) - SPARE;
      for (let k = 0; k <= 4; k++) { const t = AHEAD * k / 4; need = Math.max(need, (bump(p[0] + vx * t, p[2] + vz * t, cur.mogK) - room) * (1 - 0.5 * k / 4)); } }
    if (dt > 0) { const d = q[16] - need, e = Math.exp(-LW * dt), b = (q[17] + LW * d) * dt; q[16] = need + (d + b) * e; q[17] = (q[17] - LW * b) * e; }
    return q[16];
  }
  // Whether there is snow to lie on is the physics' own word (pose.onSnow, 07_game.js), taken at once: the eased pose.air is a tenth of a second late,
  // and in that time the figure's frame has already turned to lie along the flight and the snow read in it is far off (measured: the skis were thrown
  // 0.7 m at a lip). Off the snow the correction dies away; back on it, it comes in over a tenth of a second (until the one transition of the design
  // note is built, step 8).
  const IN = 0.1, OUT = 12, APART = 0.08;
  K.ground = (cur, root, Y, toW, sec, dt) => {
    if (Variants.val.solver !== 'b' || typeof Course === 'undefined' || (K.boardOn && K.boardOn())) { sec.gs = null; return null; }
    const q = sec.gs || (sec.gs = new Array(24).fill(null)), on = cur.onSnow == null ? (cur.air || 0) < 0.5 : cur.onSnow > 0, out = [0, 0, 0, 0, 0];
    out[4] = lift(q, cur, root, dt, on);
    if (!(dt > 0)) { for (let k = 0; k < 13; k++) q[k] = null; for (let k = 18; k < 22; k++) q[k] = null; }
    if (!on) { const e = Math.exp(-OUT * (dt > 0 ? dt : 0)); for (let k = 0; k < 4; k++) { q[9 + k] = (q[9 + k] || 0) * e; out[k] = q[9 + k]; } q[8] = 0; for (let k = 0; k < 8; k++) q[k] = null; for (let k = 18; k < 22; k++) q[k] = null; return out; }
    // (the physics has the skis at root.pos, sunk into soft snow as far as it says: the snow is read relative to that, so the sinking stays)
    // (2026-11-18: by the game's own count, pose.sink, not by reading the snow under the one point root.pos: past a lip that point is over the drop a
    // frame before the physics lets go, and everything read against it jumped)
    const ref = cur.sink == null ? Course.height(root.pos[0], root.pos[2], 0.5) - root.pos[1] : cur.sink, iy = 1 / Math.max(Y[1], 0.3);
    const st = cur.stance == null ? 0.31 : cur.stance, ld = cur.lead || 0;
    read(EL, -st / 2, ld, toW, ref, iy); read(ER, st / 2, -ld, toW, ref, iy); for (let i = 0; i < ZS.length; i++) EC[i] = Math.max(EL[i], ER[i]);
    lay(q, 0, EL, dt); lay(q, 4, ER, dt); lay(q, 18, EC, dt);
    // The two skis hang from one pelvis, a hand's width apart, and a skier holds them together: they do not each go their own way over the snow.
    // (seen on the first contact sheets, 2026-11-18, in the mogul field: solved each alone, one ski stood 30 degrees tip up on the face of a bump
    // while the other lay flat in the trough beside it, the skis crossed in an X and one knee came up to the chest.) So a third bar lies on the
    // higher of the two skis' snow, as one wide ski would, and each ski of its own may hang below that one by at most APART at either end:
    // the ski over the lower snow is carried, light or just off the snow, as the inside ski is over a trough in a real mogul line.
    for (let k = 0; k < 8; k += 2) { const lowest = q[18 + (k & 2)] - APART; if (q[k] < lowest) { q[k] = lowest; q[k + 1] = q[19 + (k & 2)]; } }
    q[8] = q[8] == null ? IN : Math.min(q[8] + (dt > 0 ? dt : 0), IN); const u = q[8] / IN, m = u * u * (3 - 2 * u);
    for (let k = 0; k < 2; k++) { const f = q[k * 4], r = q[k * 4 + 2];
      const h = (f + r) / 2, pt = -Math.atan((r - f) / (2 * HALF));
      if (m >= 1) { q[9 + k * 2] = h; q[10 + k * 2] = pt; }
      out[k * 2] = m >= 1 ? h : (q[9 + k * 2] || 0) * (1 - m) + h * m; out[k * 2 + 1] = m >= 1 ? pt : (q[10 + k * 2] || 0) * (1 - m) + pt * m; }
    return out;
  };
  return {};
})();
