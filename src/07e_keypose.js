// ---------------------------------------------------------------- key poses through a turn (Variants 'kp')
// The body through a turn is four poses, one per phase of the turn, as measured on racers (papers named below):
//   initiation, steering I, steering II (the most load), completion (to the next edge change). Measured from edge change to edge change the
//   phases take 21, 33, 32 and 14% of a GS turn (Falda-Buscaiot et al. 2017). The phase here is read off the lean, which peaks at 0.5, a little
//   before the most load, so the keys sit at 0.20, 0.46 and 0.72: the deepest, most loaded pose comes just after the lean is at its most.
// Each pose is a few offsets on top of what the physics already gives the figure (lean, the legs as suspension, separation):
//   c: knee bend (pose.crouch; 1 = the whole 0.38 m of travel), f: fore/aft (pose.fore; 1 = the hips 6 cm forward), h: the trunk folded forward at
//   the hips (radians), a: angulation, the trunk held nearer upright than the legs (radians, toward the outside of the turn).
// The numbers, at about a racer's size (a smaller copy was tried and could not be seen from the chase camera):
//   - the legs fold through the edge change and stand up into the new turn, then sink to their deepest at the most load: the hips travel ~11 cm
//     (centre of mass to ankle, 5 cm outside leg, 17 cm inside: Fasel et al. 2017);
//   - weight forward entering the turn and back on the heels leaving it (forefoot 48-65% of the pressure at initiation, heel ~54% by steering II:
//     Falda-Buscaiot et al. 2017), about +10 / -8 cm, ~18 cm in all (slalom racers swing ~28 cm a turn; GS racers +8..12 / -8..11 cm: Spörri et al. 2012);
//   - at the most load the trunk folds forward and bends sideways the most (39 / 15 degrees at 2.9 body weights: Spörri et al. 2015);
//   - and between poses it HOLDS: a racer's outside knee is nearly still for a third of a GS turn, the hip for half (Alhammoud et al. 2020). So each
//     stretch between two keys is eased in and out with a flat part at both ends (HOLD), not followed through a spring.
// Where in the turn the skier is comes from the drawn lean alone: with the lean L, how fast it changes L', its amplitude A and the pace of the turns
// w, (L/A, L'/(A w)) goes round a circle once every two turns (for L = A sin(wt) it is (sin wt, cos wt)); its angle is the phase. A turn held
// (L' = 0) sits at the middle of the turn; a turn let go early runs the phase back the way it came, smoothly.
// Anything that would make a pose jump (the version switched in play, a landing, a phase read from almost no lean) is not sprung to either: the
// gap is let go along a quintic that ends at rest with no overshoot (inertialization: Bollo, GDC 2018), so nothing ever bounces.
const KeyPose = (() => {
  if (typeof Variants !== 'undefined') Variants.def('kp', '转弯姿态', [['a', '原来'], ['b', '分阶段']], 'b');
  //           psi    c      f      h      a
  const KEYS = [[0, 0.12, -0.50, 0.06, 0.00], [0.20, -0.12, 1.60, -0.08, 0.04], [0.46, 0.03, 0.40, 0.00, 0.14], [0.72, 0.16, -1.40, 0.16, 0.22], [1, 0.12, -0.50, 0.06, 0.00]];
  const NC = 4, HOLD = 0.22, BLEND = 0.3, JUMP = [0.02, 0.15, 0.02, 0.02];
  const K = { on: 0, psi: 0, side: 0, A: 0.05, Th: 1.4, sg: 0, tc: -1, Lp: null, dL: 0, k: 0, tgt: [0, 0, 0, 0], out: [0, 0, 0, 0], vel: [0, 0, 0, 0], ib: [null, null, null, null], c: 0, f: 0, h: 0, a: 0, keys: KEYS };
  const sm = t => t * t * (3 - 2 * t);
  // the pose at psi (0..1 through one turn): from key to key, still at both ends of each stretch
  K.sample = function (psi, o) {
    let i = 0; while (i < KEYS.length - 2 && psi > KEYS[i + 1][0]) i++;
    const a = KEYS[i], b = KEYS[i + 1], u = clamp((psi - a[0]) / (b[0] - a[0]), 0, 1), e = sm(clamp((u - HOLD) / (1 - 2 * HOLD), 0, 1));
    for (let c = 0; c < NC; c++) o[c] = a[c + 1] + (b[c + 1] - a[c + 1]) * e;
    return o;
  };
  // inertialization (Bollo 2018): a gap x0 closing at v0, let go to nothing over tf seconds along a quintic with no overshoot
  function ib(x0, v0, T) {
    if (Math.abs(x0) < 1e-6) return null;
    const s = x0 < 0 ? -1 : 1; x0 *= s; v0 *= s; if (v0 > 0) v0 = 0;
    const tf = v0 < 0 ? Math.min(T, -5 * x0 / v0) : T, t2 = tf * tf, a0 = Math.max((-8 * v0 * tf - 20 * x0) / t2, 0);
    return { s, x0, v0, tf, t: 0, A: -(a0 * t2 + 6 * v0 * tf + 12 * x0) / (2 * t2 * t2 * tf), B: (3 * a0 * t2 + 16 * v0 * tf + 30 * x0) / (2 * t2 * t2), C: -(3 * a0 * t2 + 12 * v0 * tf + 20 * x0) / (2 * t2 * tf), D: a0 / 2 };
  }
  const ibAt = q => { const t = Math.min(q.t, q.tf); return q.s * (((((q.A * t + q.B) * t + q.C) * t + q.D) * t + q.v0) * t + q.x0); };
  const tmp = [0, 0, 0, 0];
  // L: the lean that is drawn (radians, + one way), dt: game seconds, gnd: how far the skiing stance holds (0 in the air, a tuck, a fall), first: a
  // fresh start. Returns K with c, f, h, a set (a already signed: it is added to the trunk's lean)
  K.step = function (L, dt, gnd, first) {
    const want = typeof Variants === 'undefined' || Variants.val.kp === 'b' ? 1 : 0;
    if (!first && K.Lp != null && !(dt > 0)) return K;      // (a frame drawn with no time passing: nothing moves)
    if (first || K.Lp == null) { K.Lp = L; K.dL = 0; K.A = Math.max(Math.abs(L), 0.05); K.sg = 0; K.tc = -1; for (let c = 0; c < NC; c++) { K.out[c] = K.vel[c] = 0; K.ib[c] = null; } K.on = want; dt = Math.max(dt, 1e-3); }
    // how fast the lean changes, its amplitude (the most it has been lately), and the pace of the turns (time between edge changes)
    K.dL = damp(K.dL, (L - K.Lp) / dt, 20, dt); K.Lp = L;
    K.A = Math.max(Math.abs(L), 0.05 + (K.A - 0.05) * Math.exp(-dt / 1.4));
    const sg = L > 0.03 ? 1 : L < -0.03 ? -1 : K.sg; K.tc += dt;
    if (sg !== K.sg) { if (K.sg && K.tc > 0.25 && K.tc < 5) K.Th = lerp(K.Th, clamp(K.tc, 0.45, 3.5), 0.5); K.sg = sg; K.tc = 0; }
    const w = PI / K.Th, th = Math.atan2(clamp(L / K.A, -1.2, 1.2), clamp(K.dL / (K.A * w), -1.5, 1.5));
    K.side = th >= 0 ? 1 : -1; K.psi = th >= 0 ? th / PI : (th + PI) / PI;
    // how much of it: none on a straight run, all of it in a turn laid over a third of the way
    K.turn = smooth(0.10, 0.50, K.A) * gnd; K.k = K.turn * want;
    K.sample(K.psi, tmp);
    for (let c = 0; c < NC; c++) {
      const tg = tmp[c] * K.k * (c === 3 ? -K.side : 1), prev = K.tgt[c]; K.tgt[c] = tg;
      // a step in what is asked for (more than a frame's worth): the pose lets the gap go, it does not jump or spring
      if (want !== K.on || Math.abs(tg - prev) > JUMP[c]) { const cur = K.out[c]; K.ib[c] = ib(cur - tg, K.vel[c], BLEND); }
      let o = tg; const q = K.ib[c];
      if (q) { q.t += dt; if (q.t >= q.tf) K.ib[c] = null; else o += ibAt(q); }
      K.vel[c] = (o - K.out[c]) / dt; K.out[c] = o;
    }
    K.on = want;
    K.c = K.out[0]; K.f = K.out[1]; K.h = K.out[2]; K.a = K.out[3];
    return K;
  };
  return K;
})();
Game.keyPose = KeyPose;       // (for tests: __ski.game().keyPose)
