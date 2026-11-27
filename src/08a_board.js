// ---------------------------------------------------------------- the snowboard: the same figure, stood sideways on one board (Variants 'ride' b)
// One board under both boots, no poles. The rider stands across the board, regular (left foot forward): the board runs along the skis' line
// (-z in the figure's own space, the nose ahead), the body faces +x, the toes. So a turn to the right is a toeside turn and a turn to the left a
// heelside one: the game's lean and edge go straight onto the board's edge, and the body leans with them toward the toes or back over the heels.
// The pose is made from four key poses, blended by what the game asks for and never sprung (the owner's rule: no springs layered on a pose):
//   toeside: the whole body leaned out over the toe edge, knees bent up off that line, chest following the lean, hands low and ahead;
// The pelvis is placed so the body's centre of mass sits on the line from the board's edge leaned over by the lean (see below).
//   heelside: seat down and back behind the heels, chest leaning back with it (less than the legs), hands reaching ahead toward the toes;
//   crouch: both knees folded, the seat sinks between the boots, the chest comes down over the front knee;
//   air: knees drawn up, board level under the body, arms out for balance; a grab takes the toe edge (back hand between the boots, front
//   hand by the front binding).
// The game's ↑ / ↓ (fore/aft, pose.fa) moves the weight along the board: hips and shoulders over the nose or over the tail, the front or
// back knee folding the more.
// Everything is worked in the rider's own space first (x along the board toward the tail, -z toward the toes, as if the rider faced -z the way
// the skier does) and turned a quarter turn into the figure's space at the end.
const Board = (() => {
  const VS = typeof Variants !== 'undefined' ? Variants : null;
  if (VS) VS.def('ride', '滑具', [['a', '双板'], ['b', '单板']], 'a');
  // (2026-11-26: snowboard is now released in normal mode too, selectable under 设置 -> 滑具)
  const BD = { len: 1.56, hw: 0.13, waist: 0.128, half: 0.25, kickN: 0.085, kickT: 0.065, run: 0.58, th: 0.013, get yawF() { return K.alp && K.alp() ? -0.96 : -0.26; }, get yawB() { return K.alp && K.alp() ? -0.84 : 0.15; } };   // board (m), half the stance, binding angles (rad, + toward the tail)
  const K = Skier, L = K.LEN, basis = K.basis, ik2 = K.ik2, frameXY = K.frameXY, fr = K.fr, B = K.B;
  // the quarter turn: rider space (x, y, z) -> figure space (-z, y, x)
  const Qp = q => [-q[2], q[1], q[0]], QM = m4.fromBasis([0, 0, 1], [0, 1, 0], [-1, 0, 0], [0, 0, 0]);
  const Qb = b => ({ X: Qp(b.X), Y: Qp(b.Y), Z: Qp(b.Z) });
  const yawIn = (bb, yaw) => { const y = basis(yaw, 0, 0); return { X: fr(bb, ...y.X), Y: fr(bb, ...y.Y), Z: fr(bb, ...y.Z) }; };

  function solve(p, sec) {
    sec = sec || K.SEC0;
    const lean = p.lean || 0, edge = p.edge || 0, tuck = sat(p.tuck || 0), air = sat(p.air || 0), fa = clamp(p.fa || 0, -1, 1), sep = p.sep || 0;
    const gL = smooth(0, 1, p.grabL || 0), gR = smooth(0, 1, p.grabR || 0), gM = Math.max(gL, gR), id = sec.idle || null;
    const ts = smooth(0.04, 0.75, lean), hs = smooth(0.04, 0.75, -lean);      // how far into a toeside / heelside turn
    const J = {}, F = new Array(K.NB);
    // ---- the board: rolled onto its edge (toes down = forward in rider space), the nose lifted in deep snow; the edge stays on the snow
    const nu = clamp(((p.tipL || 0) + (p.tipR || 0)) * 0.5, -0.05, 0.3);
    const bb = basis(0, edge, nu), O = [0, BD.hw * Math.abs(Math.sin(edge)), 0];
    const fbL = yawIn(bb, BD.yawF), fbR = yawIn(bb, BD.yawB);
    J.footL = v3.mad(O, bb.X, -BD.half); J.footR = v3.mad(O, bb.X, BD.half);
    J.ankleL = v3.mad(J.footL, fbL.Y, L.ankle); J.ankleR = v3.mad(J.footR, fbR.Y, L.ankle);
    // ---- legs folded: the game's crouch, deeper for a tuck, drawn up in the air, all the way for a grab
    let c = sat(p.crouch == null ? 0.21 : p.crouch);
    c = Math.max(c, 0.42 * tuck); c = lerp(c, Math.max(c, 0.5), air * 0.7); c = lerp(c, 0.9, gM);
    // ---- trunk first (its tilt does not hang on where the hips are): an athletic stance, chest a little forward over the knees; on the toes it
    // goes over with the lean, on the heels it leans back with it but less than the legs (the chest stays over the seat, it does not fold down)
    const hinge = 0.16 + 0.24 * c + (lean > 0 ? 0.50 * lean : 0.42 * lean) + 0.55 * tuck + 0.25 * gM + (id ? id.up : 0);
    const up2 = Math.min(hinge * 1.08 + 0.05 - 0.035 * (id ? id.br : 0), 1.6), rollT = -0.10 * fa + (id ? id.sx : 0);
    const yawP = -0.28 + 0.25 * sep, yawC = -0.40 + 0.35 * sep + (id ? id.ty : 0);
    let pb = basis(yawP, clamp(hinge * 0.55, -0.3, 0.9), -0.08 * fa);
    let t1 = basis((yawP + yawC) * 0.5, hinge, rollT), t2 = basis(yawC, up2, rollT * 0.8);
    // (人物动作 b, 08f_labmo.js: the lab's board turn sets the pelvis, the trunk, the head and the arms, faded in by lab.w; the board, the
    // feet and the knees over the toes stay this solver's)
    const LB = sec.labB; if (LB && LB.w > 0) { pb = LabMo.mixB(pb, LB.pb, LB.w); t1 = LabMo.mixB(t1, LB.t1, LB.w); t2 = LabMo.mixB(t2, LB.t2, LB.w); }
    const oC = v3.mul(t1.Y, L.spine), oN = v3.add(oC, v3.mul(t2.Y, L.chest));      // chest and neck from the pelvis
    // ---- pelvis: placed so that the body's centre of mass sits on the line from the board's edge leaned over by the lean (toward the toes is
    // -z), and over the nose or the tail by fore/aft. Masses, roughly: legs 0.30 (half of it at the hips), pelvis 0.15, trunk 0.35 at the chest,
    // head and arms 0.20 at the neck. Height: legs well bent, knees soft (a board is ridden lower than skis)
    const aM = v3.lerp(J.ankleL, J.ankleR, 0.5), up = v3.add(v3.mul(oC, 0.35), v3.mul(oN, 0.20));
    let H = 0.875 - 0.30 * c - 0.04 * Math.abs(lean) - 0.05 * tuck, pel, hipL, hipR;
    for (let it = 0; it < 10; it++) {
      const cy = 0.85 * H + up[1] + 0.15 * aM[1];                         // height of the centre of mass
      const tz = -Math.tan(clamp(lean, -1.25, 1.25)) * (cy - O[1]), tx = -0.07 * fa;
      pel = [(tx - up[0] - 0.15 * aM[0]) / 0.85, H, (tz - up[2] - 0.15 * aM[2]) / 0.85];
      hipL = v3.add(v3.mad(pel, pb.X, -L.hipW), v3.mul(pb.Y, -L.hipD)); hipR = v3.add(v3.mad(pel, pb.X, L.hipW), v3.mul(pb.Y, -L.hipD));
      const over = Math.max(v3.len(v3.sub(hipL, J.ankleL)), v3.len(v3.sub(hipR, J.ankleR))) - (L.thigh + L.shin) * 0.96;
      if (over <= -0.02) break; H -= (over >= 0.02 ? over : (over + 0.02) * (over + 0.02) / 0.08) * 1.1;
    }
    if (LB && LB.w > 0) {
      const lp = v3.add(aM, v3.mul(LB.pel, LabMo.LEG)); lp[1] += -0.30 * (c - LB.cref); lp[0] += -0.07 * fa; lp[1] += (pel[1] - lp[1]) * Math.min(1, Math.max(0, p.drive || 0));
      pel = v3.lerp(pel, lp, LB.w);
      for (let it = 0; it < 3; it++) {
        hipL = v3.add(v3.mad(pel, pb.X, -L.hipW), v3.mul(pb.Y, -L.hipD)); hipR = v3.add(v3.mad(pel, pb.X, L.hipW), v3.mul(pb.Y, -L.hipD));
        const over = Math.max(v3.len(v3.sub(hipL, J.ankleL)), v3.len(v3.sub(hipR, J.ankleR))) - (L.thigh + L.shin) * 0.97;
        if (over <= -0.02) break; pel = v3.mad(pel, v3.norm(v3.sub(aM, pel)), over >= 0.02 ? over : (over + 0.02) * (over + 0.02) / 0.08);      // (given up softly)
      }
    }
    J.pelvis = pel; J.hipL = hipL; J.hipR = hipR;
    // knees: over the toes of their own boot (the bindings are turned out, so the knees part a little)
    // (on the toes the whole leg leans out over the toe edge: the knee bends up off that line, not down toward the snow, or it reads as kneeling)
    const kA = 0.9 * Math.max(lean, 0), kneeDir = (fb, sx) => v3.norm(v3.add(v3.mul(fb.Z, -Math.cos(kA)), [sx, 0.1 + Math.sin(kA), 0]));
    J.kneeL = ik2(hipL, J.ankleL, L.thigh, L.shin, kneeDir(fbL, -0.10)); J.kneeR = ik2(hipR, J.ankleR, L.thigh, L.shin, kneeDir(fbR, 0.10));
    J.kneeRawL = J.kneeL; J.kneeRawR = J.kneeR;
    J.chest = v3.add(pel, oC); J.neck = v3.add(pel, oN);
    J.shL = v3.add(v3.mad(J.neck, t2.X, -L.shW), v3.mul(t2.Y, -L.shD)); J.shR = v3.add(v3.mad(J.neck, t2.X, L.shW), v3.mul(t2.Y, -L.shD));
    // head: eyes level, looking down the run over the front shoulder (more round toward the nose on the heels, more toward the toes on the toes)
    const yawH = -1.12 + 0.18 * ts - 0.15 * hs + (p.headYaw || 0) * 0.5 + (id ? id.hy : 0), hp = Math.max(0.10 + 0.08 * c + (id ? id.hp : 0), up2 - 1.0);
    let hb = basis(yawH, hp, 0.04 * fa); if (LB && LB.w > 0) hb = LabMo.mixB(hb, LB.hb, LB.w);
    const nY = v3.norm(v3.add(t2.Y, hb.Y));
    J.skull = v3.mad(J.neck, nY, L.neck); J.head = v3.add(v3.mad(J.skull, hb.Y, L.head), v3.mul(hb.Z, -0.015));
    // ---- hands: relaxed, the front one out toward the nose, the back one by the back hip; low and ahead on the toes, reaching forward on the
    // heels, wide in the air, in front of the knees in a tuck; a grab takes the toe edge
    const hl = basis(yawC, 0, 0), reach = (L.uarm + L.farm + L.grip) * 0.97;
    const hand = (side, g) => {
      const sh = side < 0 ? J.shL : J.shR;
      // (as riders in Steep and on real slopes carry them: arms long and loose, elbows only soft, hands down at hip height and a little out from
      // the body; the front hand leads, over the front knee toward the nose, the back one hangs by the back hip. On the toes both go low and
      // ahead over the toe edge; on the heels they reach forward over the toes to hold the seat's weight; in the air they open out for balance)
      let o = side < 0 ? [-0.24, -0.50, -0.13] : [0.12, -0.55, -0.03];
      o = v3.add(o, v3.mul(side < 0 ? [-0.06, -0.06, -0.12] : [0.02, -0.04, -0.10], ts));
      o = v3.add(o, v3.mul(side < 0 ? [0.06, 0.10, -0.24] : [-0.06, 0.12, -0.24], hs));
      o = v3.add(o, v3.mul(side < 0 ? [-0.20, 0.24, -0.02] : [0.22, 0.22, 0.06], air * (1 - gM)));
      o = v3.add(o, v3.mul([side < 0 ? 0.12 : -0.05, 0.05, -0.18], tuck));
      let t = v3.add(sh, fr(hl, o[0], o[1], o[2]));
      if (g > 0) t = v3.lerp(t, v3.add(O, fr(bb, side < 0 ? -0.36 : 0.0, 0.035, -BD.hw - 0.02)), g);
      const d0 = v3.sub(t, sh), dl = v3.len(d0); if (dl > reach) t = v3.mad(sh, d0, reach / dl);
      const e = ik2(sh, t, L.uarm, L.farm + L.grip, fr(hl, side * 0.7, -0.2, 0.7));      // (the elbow out and back, never forward)
      return { w: t, e, d: v3.norm(fr(hl, side * 0.1, -1, -0.35)) };
    };
    const hL = hand(-1, gL), hR = hand(1, gR);
    if (LB && LB.w > 0) for (let k = 0; k < 2; k++) { const h = k ? hR : hL, sh = k ? J.shR : J.shL, wa = LB.w * (1 - gM);
      const le = v3.mad(sh, LB.ua[k], L.uarm), lg = v3.mad(le, LB.fa[k], L.farm + L.grip);
      const e = v3.mad(sh, v3.norm(v3.sub(v3.lerp(h.e, le, wa), sh)), L.uarm); h.w = v3.mad(e, v3.norm(v3.sub(v3.lerp(h.w, lg, wa), e)), L.farm + L.grip); h.e = e; }
    J.gripL = hL.w; J.elbowL = hL.e; J.gripR = hR.w; J.elbowR = hR.e; J.poleDL = hL.d; J.poleDR = hR.d;
    J.wristL = v3.mad(J.elbowL, v3.norm(v3.sub(J.gripL, J.elbowL)), L.farm); J.wristR = v3.mad(J.elbowR, v3.norm(v3.sub(J.gripR, J.elbowR)), L.farm);
    J.tipL = J.gripL.slice(); J.tipR = J.gripR.slice(); J.plantedL = 0; J.plantedR = 0;      // (no poles: nothing is ever planted)
    // ---- frames, as the skier's (08_skier.js)
    F[B.pelvis] = m4.fromBasis(pb.X, pb.Y, pb.Z, pel);
    F[B.spine] = frameXY(pel, v3.sub(J.chest, pel), v3.add(pb.X, t1.X));
    F[B.chest] = frameXY(J.chest, v3.sub(J.neck, J.chest), t2.X);
    F[B.neck] = frameXY(J.neck, nY, v3.add(t2.X, hb.X));
    F[B.head] = m4.fromBasis(hb.X, hb.Y, hb.Z, J.skull);
    const limb = (i0, a, b2, c2, xh) => { const ax = v3.cross(v3.sub(b2, a), v3.sub(c2, b2)); const hx = v3.len(ax) > 1e-4 ? v3.norm(ax) : xh; F[i0] = frameXY(a, v3.sub(b2, a), hx); F[i0 + 1] = frameXY(b2, v3.sub(c2, b2), hx); };
    limb(B.uarmL, J.shL, J.elbowL, J.gripL, [1, 0, 0]); F[B.handL] = frameXY(J.wristL, v3.sub(J.gripL, J.elbowL), v3.cross(v3.sub(J.gripL, J.elbowL), hL.d));
    limb(B.uarmR, J.shR, J.elbowR, J.gripR, [1, 0, 0]); F[B.handR] = frameXY(J.wristR, v3.sub(J.gripR, J.elbowR), v3.cross(v3.sub(J.gripR, J.elbowR), hR.d));
    limb(B.thighL, hipL, J.kneeL, J.ankleL, [-1, 0, 0]); limb(B.thighR, hipR, J.kneeR, J.ankleR, [-1, 0, 0]);
    F[B.footL] = m4.fromBasis(fbL.X, fbL.Y, fbL.Z, J.footL); F[B.footR] = m4.fromBasis(fbR.X, fbR.Y, fbR.Z, J.footR);
    F[B.poleL] = frameXY(J.gripL, v3.mul(J.poleDL, -1), [1, 0, 0]); F[B.poleR] = frameXY(J.gripR, v3.mul(J.poleDR, -1), [1, 0, 0]);
    // the board itself (its own space: x toward the toe edge, y up, -z the nose)
    const Mb = m4.fromBasis(v3.mul(bb.Z, -1), bb.Y, bb.X, O);
    // ---- a quarter turn into the figure's space
    for (const k in J) if (Array.isArray(J[k]) && J[k].length === 3) J[k] = Qp(J[k]);
    for (let i = 0; i < F.length; i++) if (F[i]) F[i] = m4.mul(QM, F[i]);
    J.boardC = Qp(O); J.boardM = m4.mul(QM, Mb);
    return { J, F, hb: Qb(hb), t1: Qb(t1), t2: Qb(t2), pb: Qb(pb), fbL: Qb(fbL), fbR: Qb(fbR), caps: [], c, hinge, up2, dp: null, hp: [null, null], br: id ? id.br : 0, board: true };
  }

  // ================================================================ 单板求解器 b (Variants 'sbsol', owner 2026-11-22: "单板要酷……稍微夸张一点，大开大合，非常潇洒";
  // design page https://claude.ai/artifact/CWXDe6JXtDkCkE1PNxRu5K, owner picked every recommendation: 稍夸张 with a switch, the board's lean let out
  // to about 65 deg, the inside hand on the snow). Solved in one fixed order, each step taking what the steps before it settled:
  //   1 the board lies on the real snow (08j_solver.js reads it under the board's length: height and pitch), rolled onto its edge;
  //   2 the body's centre of mass on the line leaned over from the edge in the snow, by the physics' lean, a little more for style (COOL);
  //   3 the hips: on the toes pushed in toward the snow and over the front foot, the knees driven forward; on the heels sat down low behind the
  //     heels, legs long toward the board;
  //   4 the legs from the hips to the bindings, knees always bending toward the toes (never backwards);
  //   5 trunk and head: on the toes the chest folds low over the front knee, on the heels it stays tall; the head looks down the run over the
  //     front shoulder;
  //   6 the arms, wide: the front hand leads toward the nose and into the turn, down to the snow when the lean is deep; the back hand is thrown
  //     up and back. Kept clear of the thighs.
  // Measured on real riders (Commons photos, Wikimedia; MediaPipe): lean 46-68 deg in the deepest part, hands 2.3-3.4 shoulder widths apart, often
  // one wrist over the shoulder. The game's old board rider: lean stopped at 49.6, hands 1.7 shoulder widths apart, knelt on the toe edge.
  if (VS) VS.def('sbsol', '单板求解器', [['a', '旧'], ['b', '新（酷）'], ['c', '真人表']], 'c');      // (default c since 2026-11-26: the owner saw the old board in normal mode, "没有用最新的单板动作")
  if (VS) VS.def('sbcool', '单板夸张', [['a', '真人'], ['b', '稍夸张'], ['c', '很夸张']], 'b');
  const COOL = () => ({ a: 0, b: 1, c: 2 })[VS ? VS.val.sbcool : 'b'] || 0;
  // nearest points of two segments a0-a1 and b0-b1: their distance, and the unit direction from b's point to a's (to push a out along)
  function segSeg(a0, a1, b0, b1) {
    const u = v3.sub(a1, a0), v = v3.sub(b1, b0), w = v3.sub(a0, b0), A = v3.dot(u, u), Bq = v3.dot(u, v), C = v3.dot(v, v), D = v3.dot(u, w), E = v3.dot(v, w), den = A * C - Bq * Bq;
    let s = den > 1e-9 ? clamp((Bq * E - C * D) / den, 0, 1) : 0, t = C > 1e-9 ? clamp((Bq * s + E) / C, 0, 1) : 0; s = A > 1e-9 ? clamp((Bq * t - D) / A, 0, 1) : 0;
    const pa = v3.mad(a0, u, s), pb2 = v3.mad(b0, v, t), dv = v3.sub(pa, pb2), d = v3.len(dv);
    return { d, n: d > 1e-5 ? v3.mul(dv, 1 / d) : [0, 0, 1] };
  }
  // ================================================================ 单板求解器 c, 真人表 (owner 2026-11-22 22:49 UTC, with his own riding video: "就以这个为基"
  // — slow: skidded turns; fast: carved; the hands too). Design doc https://claude.ai/artifact/DDcjGhUgjeG6xegsY2m5pQ. The same fixed order as b
  // and all of its constraints (board on the snow, centre of mass on the edge line, legs that never lock or fold past a knee, hands kept out of
  // thighs and trunk, eased hips and fists); what changes is where the numbers come from: every posture number below is MEASURED from the owner's
  // video (3D body reconstruction on the Mac, tools/motion/board_refs/), not set by eye, and the body follows how the board is really running:
  //   skid weight: 1 slow (under SK_V0 m/s) or with the board well across its path (the physics' S.beta), 0 fast and running on its edge;
  //   per state: knee bend front / back (deg) by how deep the turn is, the hands' place from the pelvis (shoulder widths: along the board toward
  //   the nose, across toward the toes, up), and how fast a hand may move against the hips (m/s; the owner: about 1 skidding, 3 carving).
  // (numbers, 2026-11-22 night: medians over the owner's 28 turns, 3D on the Mac, tools/motion/board_refs/carve_table.txt 'OWNER REFERENCE CLIP'.
  // The back hand is out on the toe side on both edges, about 1-1.8 shoulder widths; on a heel carve both hands go low; hand speed p90 1.9 skidding,
  // 2.5-2.7 carving. 'flat' is where the hands pass through at an edge change, halfway between the two edges' skid places, so the side switch is smooth)
  // (round 28: the owner's arm key poses in the chest frame, see the arm layer in solve2. [edge heel->toe, toe mid, edge toe->heel, heel mid] x [wrist, elbow])
  const ARM_F = [[[0.64, 0.60, -1.18], [0.58, 0.11, -0.72]], [[0.66, 0.0, -1.10], [0.49, -0.25, -0.75]], [[0.75, 0.22, -1.18], [0.55, -0.27, -0.71]], [[1.05, -0.10, -0.62], [0.75, -0.15, -0.50]]],
    ARM_B = [[[-0.65, 0.95, -0.90], [-0.72, 0.45, -0.55]], [[-0.62, 0.75, -1.01], [-0.67, 0.37, -0.52]], [[-0.60, 0.95, -0.88], [-0.68, 0.48, -0.52]], [[-0.70, 1.15, -0.65], [-0.75, 0.65, -0.40]]];      // (round 34: the back arm's edge-change and heel poses brought down to the owner's own (mocap medians, tools/motion/board_refs/arm_ranges.json): raised and thrown out they stood 74-100 deg from hanging, above his 6-61)
  // (dev only: ?sbx=KEY:val,mid.toe.k0.0:74 overrides a solver constant or a table cell for a tuning run; never set in the shipped game)
  const SBX = (() => { try { const m = typeof location !== 'undefined' && location.search && /[?&]sbx=([^&]+)/.exec(location.search); if (!m) return null; const o = {}; for (const kv of decodeURIComponent(m[1]).split(',')) { const i = kv.lastIndexOf(':'); o[kv.slice(0, i)] = +kv.slice(i + 1); } return o; } catch (e) { return null; } })();
  // (owner 2026-11-24 21:52 UTC "平时滑的时候…手半握的这个姿势…扶地只是因为你太倾斜了…手轻轻的轻抚这个地": the rider's open glove (08h_labrig.js) is
  // built half closed: each finger bends about 40, 60 and 40 deg at its three joints (the lab's relaxed hand was 20/30/15), ?sbx=GC1/GC2/GC3)
  K.gloveCurl = [SBX && SBX.GC1 != null ? SBX.GC1 : 40, SBX && SBX.GC2 != null ? SBX.GC2 : 60, SBX && SBX.GC3 != null ? SBX.GC3 : 40];
  // (真人表 自由式, overnight 2026-11-24: the numbers of the rules behind X(…) below, tuned against the owner's three videos with tools/motion/board_refs/body_gate.js
  // (every body part's angle through the turn, in units of his own spread). Read only for 真人表 + 自由式: solver b and the alpine style keep the
  // value written at each X(key, value), which is what they had before)
  const SBN = {
    KNEW: 1, TNEW: 1, YNEW: 1, ARMN: 1, LRT: 1, KGN: 1, TCK: 1, KWB: 0, TWB: 0, YB: 0, TWL: 0, TWR: 0, KUP: 0, ARG: 0,      // (the new knee, trunk, turn and arm rules on (KGN: gentle turns take the slow row; TCK: the back hand rests on the snow in a deep toe carve), and the terms they replace off)
    TLM: 0.4, LPM: 1.3, LPK: 1.5, TCAP: 1.1, KFL: 0.03, KBT: 0.165, EDK: 1.1,      // (limits: the trunk looks no further ahead than TLM s nor past the last turn's depth x LPK, lies over no more than TCAP rad (63 deg); knees stay KFL m above the ankles; the shin leans no more than KBT rad (9.5 deg; the scorer's H7 reads its p99 under 12) sideways in the boot; the board's edge angle follows the leg line (x EDK))
    LEAD: 0.11, KLD: 0.12, KW: 0.21, KSF: 0.6, KSB: 0.2, PEW: 22,      // (legs: the pose leads the lean by LEAD s, the knees change edge KLD s ahead across +-KW rad, part along the board on a toe turn (KSF, KSB); the hips ease at PEW)
    TLD: 0.3, TRW: 15, TT0: -0.17, TT1: 1.05, TH0: 0.4, TH1: 0.15, CB: 0.1, PRL: -1.4, TW0: 0.2,      // (trunk: looks TLD of a turn ahead and eases at TRW; its tilt from the lean, toe side TT0 + TT1 x, capped on the heels at TH0 + TH1 x (the owner folds forward on a heel turn instead of lying back); CB the hips inside the turn, PRL the pelvis's roll with the twist, TW0 the chest's twist on the hips)
    Y0: -0.57, YL: -0.22, YR: 0.07, YW: 20,      // (the chest's turn toward the nose: Y0 at rest, YL with the lean, YR with its rate, eased at YW)
    TXT: -0.02, TXB: -0.05, TX0: 0, TXK: 0.006, TXH: 0.003,      // (the hips along the board: toward the tail on the toes (TXT), on the heels (TXB), and over the more bent knee (TXK, TXH))
    HHT: 0.42, HTR: 0.77,      // (head: follows the trunk's lean by HTR, further toward the toes on a heel turn (HHT))
    AF0: 0.23, AFT: 0.015, AFH: 0.12, FF0: -0.027, TFH: 0.15, WTF: 0.55,      // (front arm: out from the shoulder (AF0, with the toe lean AFT, the heel lean AFH), forward FF0, toward the toes TFH, along the trunk WTF)
    AB0: 0.208, ABT: 0.4, ABQ: 1.2, ABH: 0.7, FB0: -0.165, TBH: 1.185, WTB: 0.394,      // (back arm: the same; round 13: it trails toward the tail through a toe turn (ABT, was 0.071), and on the heels swings out over the later part of the lean, to ABQ (ABH, the even law, is what the other solvers keep))
    TLF: 0.281, TLB: 0.013, FX0: 37, FXD: -11.75, ABIF: 0.6, ABIB: 0.262, ABUF: 1.375, ABUB: -0.144, AEW: 0,      // (the arms act TLF, TLB s ahead of the lean; elbows bent FX0 deg (FXD as the lean swings toward the heels), the forearm in toward the chest (ABIF, ABIB) and up (ABUF, ABUB))
    SNT: 1, SNSK: 0.6,      // (the back hand going down to the snow on a toe turn takes its height from the snow: it comes down softly, knuckles first and then the palm (SNSK of the way flat), the elbow takes up the shoulder's rise and fall, it is held through the turn and let go once; see SNT in hand())
    TDK: 1, TCR: 1, TDF: 1,      // (held deeper than the owner's own riding goes, the body goes down to the snow with the turn, once, and holds the back shoulder where that hand rests: see TDK, TCR at aTc)
    DFK: 1, SFR: 0.3, SFW: 0.05, SFE: 4,      // (the hand on the snow: DFK how fully it comes down; the floor under it is the real snow, not 3 cm under the edged board's centre (SFR m of that let down); the fist the arm is solved for may sink SFW m, so that the hand, bent flat at the wrist, lies on the snow instead of hanging a wrist's length over it)
    THB: 0.24, THF: 0.5,      // (a hand's target deep inside its own thigh leaves by the leg's front and outer side (THF: 0 outer, 1 front), pulled THB m that way at the leg's line)
    SRR: 0.08, SRT: 0.5, SRW: 80, PRH: 0.4,      // (round 12: the shoulder line rolls with the body's roll onto the new edge: the front shoulder dips SRR rad per rad/s as the rider rolls to the heels and lifts SRT of that rolling to the toes (to +-SRC rad/s, eased at SRW); on the heels the pelvis's roll takes PRH of the lean, so the front hip rides lower)
    TCT: 1.2, TCS: 0.05, TCX: 0.06,      // (a deep toe carve HELD (past TC0 rad for TCH0 to TCH1 s; his own linked turns stay under a third of a second there): the trunk settles at TCT rad (73 deg measured, his own deepest), the back shoulder drops TCS m, the trunk stops reading ahead (TCD), and the back hand rests on the snow under the shoulder (TCX m toward the tail))
  };
  let NEWB = false, NEWS = false;
  const X = (k, d) => SBX && SBX[k] != null ? SBX[k] : NEWS && SBNS[k] != null ? SBNS[k] : NEWB && SBN[k] != null ? SBN[k] : d;
  const SBT0 = {
    glide: { k: [26, 18] }, UP: 0,      // (UP: how much the knees open at an edge change, deg)
    stand: { k: [12, 9], hF: [0.50, 0.15, -0.60], hB: [-0.50, 0.15, -0.60] },      // (standing, owner 2026-11-23 "站立的时候…放松": legs near straight, arms hanging at the sides)
    flat: { hF: [0.60, 0.25, 0.0], hB: [-0.30, 0.75, 0.0], yaw: -0.55 },
    // (round 17, owner "第三个视频 还是不像": slow skids sat lower in his video 1 than here: toe-side back knee 66 against his 74, heel-side hips
    // bent 59-60 against 77-79 and the trunk 35 deg off the legs against 50. Toe knees +4/+7, heel-side trunk fold 0.55 -> 0.80: now 64/69, 72/75, 48)
    skid: { toe: { k0: [64, 74], k1: [80, 90], hF: [0.60, 0.45, -0.18], hB: [-0.42, 0.71, -0.04], trk: 0.05, nose: 0.25, yaw: -0.72 },
      heel: { k0: [32, 50], k1: [42, 64], hF: [0.69, -0.03, -0.54], hB: [-0.06, 0.95, -0.54], trk: 0.80, nose: 0.35, yaw: -0.70 }, vmax: 1.9 },
    mid: { toe: { k0: [44, 62], k1: [56, 80], hF: [0.70, 0.56, -0.07], hB: [-0.88, 0.42, 0.42], trk: -0.10, nose: 0.05, yaw: -0.43 },
        heel: { k0: [30, 26], k1: [38, 32], hF: [0.86, -0.67, 0.15], hB: [0.03, 1.52, -0.68], trk: 0.85, nose: 0.45, yaw: -0.76 }, vmax: 2.3 },
      carve: { toe: { k0: [56, 88], k1: [74, 116], hF: [0.78, 0.33, -0.47], hB: [0.17, 1.32, 0.27], trk: -0.10, nose: 0.18, yaw: -1.12 },
      heel: { k0: [45, 50], k1: [60, 66], hF: [1.39, -0.14, -0.84], hB: [-0.60, 1.95, -1.04], trk: 1.10, nose: 0.50, yaw: -0.65 }, vmax: 2.7 },
    SK_V0: 6, SK_V1: 12, SK_B0: 0.15, SK_B1: 0.45, ARM0: 0.58, SW: 0.40, TWIST: 0.26
  };
  const sbxRows = T => { if (SBX) for (const k of Object.keys(SBX)) if (k.indexOf('.') > 0) { const ps = k.split('.'); for (const r0 of (ps[0] === 'all' ? ['skid', 'mid', 'carve'] : [ps[0]])) { let o = T[r0]; for (let i = 1; i < ps.length - 1; i++) o = o && o[ps[i]]; if (o) o[ps[ps.length - 1]] = SBX[k]; } } };
  sbxRows(SBT0);
  const TAB = () => !!(VS && VS.val.sbsol === 'c');
  // (单板风格 b 硬鞋刻滑, owner 2026-11-23 09:28 UTC "动作应该偏向alpen snowboard 比较帅": the same solver and the owner's rhythm, but the body of an
  // alpine (hardboot) carver, from the Carver's Almanac (alpinecarving.com: binding_setup, technique, ec) and Wikipedia 'Extreme carving':
  // bindings turned well forward, about 55 front / 48 back (ExtremeCarving riders 55/48, Bozzetto 58/48, Grabner 54/51); hips, chest and
  // shoulders facing the nose, square between the way the board goes and the bindings; chest up over the feet, no break at the waist; knees
  // deeply bent and equal, the back knee tucked behind the front; hands forward, level, either side, arms quiet ("minimum use of arms");
  // laid over deep in a carve until the inside forearm skims the snow (the toe side: the back hand, the heel side: the front)
  const SBA = JSON.parse(JSON.stringify(SBT0));
  { const A = SBA, hand = { hF: [0.90, -0.70, 0.80], hB: [0.55, 0.80, 0.80] };
    A.flat.hF = [0.85, -0.70, 0.80]; A.flat.hB = [0.50, 0.80, 0.80]; A.flat.yaw = -1.15;
    A.glide.k = [40, 46]; A.stand.k = [18, 20];
    const set = (row, side, k0, k1, trk, nose, yaw) => Object.assign(A[row][side], hand, { k0, k1, trk, nose, yaw });
    set('skid', 'toe', [62, 70], [66, 74], 0.05, 0.30, -1.15); set('skid', 'heel', [55, 62], [60, 66], 0.35, 0.35, -1.20);
    set('mid', 'toe', [72, 80], [76, 84], 0.00, 0.30, -1.20); set('mid', 'heel', [62, 68], [66, 72], 0.30, 0.35, -1.25);
    set('carve', 'toe', [82, 92], [86, 96], -0.05, 0.30, -1.25); set('carve', 'heel', [70, 76], [74, 80], 0.25, 0.40, -1.30); }
  // (真人表 自由式's own rows: the knees of the step model (KNEW: each edge has its own pair of rows, k0 at the crossing and k1 laid over, and the
  // knees go from one edge's to the other's across the edge change) and how far the chest goes toward the nose. Solver b keeps SBT0 as it was)
  const SBF = JSON.parse(JSON.stringify(SBT0));
  { const F = SBF;
    Object.assign(F.skid.toe, { k0: [46, 52], k1: [66, 86], nose: 0.35 }); Object.assign(F.skid.heel, { k0: [26, 30], k1: [40, 50], nose: 0.25 });
    Object.assign(F.mid.toe, { k0: [86, 76], k1: [84, 79], nose: 0.35 }); Object.assign(F.mid.heel, { k0: [28, 42], k1: [50, 52], nose: 0.25 });
    Object.assign(F.carve.toe, { k0: [50, 56], k1: [64, 80], nose: 0.35 }); Object.assign(F.carve.heel, { k0: [34, 40], k1: [46, 56], nose: 0.25 });
  }
  sbxRows(SBF);
  // (Steep 参考, 2026-11-25, owner: "用那个参考视频来进行动作校正…只是校正单版": the third 单板风格 (sbsty c). The rows and the rules' numbers
  // tuned against the owner's Steep snowboard footage (192 clips, 833 turns, 3D on the Mac, tools/motion/board_refs/body_ranges_steep.json) with
  // body_gate.js --pairs steep (steepLo / steepHi ridden at Steep's own rhythm and lean): whole body 1.25 -> 0.99, in Steep's own spread (the second ruler, BOARDN, the same).
  // Tuned with the scorer's banking (Rshlead), head speed (F3h) and jolt rates held, so no new jolts across the 38 board scenarios.
  // Steep rides lower and steadier than the owner's video: knees 75-95 on both edges, arms held out from the body, no shoulder-hip twist, head
  // tipped down further. 自由式 (a) keeps the owner's own numbers; only what differs is listed here, the rest is SBN)
  // (owner 2026-11-26 20:15 UTC, screen recording: "上半身应该…稍微静止…而不是左右来回很大幅度的摆…现在上半身跟胳膊是完全是定住的". Measured on
  // steepLo/steepHi: the chest turned with the turn's rate (YR) and the lean (YL, TWL, TWR), shoulders vs board -42..+15 deg each turn where Steep's
  // stay within a few; the arms hung near straight down by the sides (front upper arm 26-44 deg off hanging, Steep 44-55; elbows 140-160, Steep
  // 127). Now the chest holds its yaw (swing about halved, the rest is the board skidding under it), the arms are held out and bent as Steep's,
  // and each edge change gives each arm a wider new way to be held (AVO, AVF, AVE). Gate 0.98 -> 1.00, jolts 28 -> 15)
  // (2026-11-26 清洗 Steep 尺子后重调：剔除 QA 失败/高抖动/腾空帧、同视频前脚投票后，Steep 真实的前肩领航 yawS ≈ -24° 浅弯 / -33° 脚尖深弯 / -21° 脚跟深弯、
  // 后膝略深于前膝、前后手位置不对称、小臂自然下垂都恢复了；拆开 SBS 的 skid/mid/carve 三档速度并加入起跳蓄力/抓板/落地缓冲参数)
  const SBNS = { KOFF: 0, FWC: 0.33, KLD: 70, KLDS: 0.6, KLDT: 0.6, TW0: 0.11, PRL: -0.525, Y0: -0.32, YL: -0.05, TT0: -0.24, TT1: 0.84, TH0: 0.45, TH1: 0.25, CB: 0.06, HTR: 1, HHT: 0.42, SRR: 0.11, SRT: 0.725, AF0: 0.54, AFT: 0.08, AFH: 0.04, FF0: 0.08, TFH: 0.16, WTF: 0.52, AB0: 0.54, ABT: 0.25, ABQ: 0.75, FB0: -0.10, TBH: 0.48, WTB: 0.38, FX0: 50, FXD: -10, ABIF: 0.48, ABIB: 0.35, ABUF: 0.42, ABUB: -0.15, YR: 0, TWL: 0, TWR: 0, AVO: 0.35, AVF: 0.35, AVE: 30, FWY: -0.85, KCHG: 50, FCHG: 0.26, KGRB: 102, FGRB: 0.88, FXA: 0, KLND: 30, FLND: 0.85, ALND: 0.24 };
  const SBS = JSON.parse(JSON.stringify(SBF));
  {
    SBS.glide.k = [42, 46];
    Object.assign(SBS.skid.toe,  { k0: [76, 82], k1: [82, 88], trk:  0.05, nose: 0.26 });
    Object.assign(SBS.skid.heel, { k0: [68, 74], k1: [72, 78], trk:  0.85, nose: 0.34 });
    Object.assign(SBS.mid.toe,   { k0: [72, 78], k1: [80, 86], trk:  0.00, nose: 0.24 });
    Object.assign(SBS.mid.heel,  { k0: [62, 68], k1: [66, 72], trk:  0.88, nose: 0.35 });
    Object.assign(SBS.carve.toe, { k0: [68, 76], k1: [76, 86], trk: -0.05, nose: 0.22 });
    Object.assign(SBS.carve.heel,{ k0: [56, 64], k1: [60, 70], trk:  0.92, nose: 0.38 });
  }
  sbxRows(SBS);
  let SBT = SBT0;
  const ALP = () => !!(VS && VS.val.sbsol === 'c' && VS.val.sbsty === 'b');
  if (VS) VS.def('sbsty', '单板风格', [['a', '自由式（主人视频）'], ['b', '硬鞋刻滑 alpine'], ['c', 'Steep 参考']], 'c');      // (default Steep 参考 since 2026-11-26)
  const STP = () => !!(VS && VS.val.sbsol === 'c' && VS.val.sbsty === 'c');
  // (owner 2026-11-26 "切换单板风格…Steep 参考、硬鞋刻滑都没什么区别…按加速没有变化": the styles and the forward mode live only in the 真人表
  // solver. With another solver picked (kept from an earlier visit) a style pick changed nothing on screen. Picking a style now picks 真人表 too)
  if (VS && VS.on) VS.on((n, v, init) => { if (!init && n === 'sbsty' && VS.val.sbsol !== 'c') VS.set('sbsol', 'c'); });
  // (身体朝前, owner 2026-11-24 18:01 + 19:44 UTC: "加入…alpine snowboard 这种形态，身体…面向前" and "封底朝前不是滑杆…摁住 Tac，它就是往前模式": in 自由式,
  // while accelerate is held (the board's push, p.fwd) the chest and hips turn toward the nose and lean that way, the knees with them, about as
  // alpine's; let go, back to the owner's own riding. Eased over about a quarter of a second each way (FWW))
  let FWv = 0; const FWD = () => FWv;

  const HARD = 1, CEW = 45;
  // (真人表, 2026-11-23: three rows, not two. The owner's turns between slow skids and fast carves ('transition', 6-12 m/s) are their own pose,
  // more upright, chest less open, back hand further back, than halfway between the two. w = the skid weight: 1 skid, 0.5 the middle row, 0 carve)
  const mb = (side, key, w, f) => w >= 0.5 ? f(SBT.mid[side][key], SBT.skid[side][key], (w - 0.5) * 2) : f(SBT.carve[side][key], SBT.mid[side][key], w * 2);      // (真人表: the last hard clearance on, and the thigh/forearm push correction eased at w 45: tried 30/45/70 with and without, 2026-11-22; this pair is the one with no hand or forearm in a thigh and the smoothest hands)
  const legD = kd => { const k = kd * PI / 180, a = L.thigh, b = L.shin; return Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(k)); };      // (hip to ankle, a knee bent kd deg)
  const smin = (a, b, k) => { const h = Math.max(0, Math.min(1, 0.5 + 0.5 * (b - a) / k)); return b + (a - b) * h - k * h * (1 - h); };      // (a smooth minimum: no kink where the two cross)
  // (a soft floor: d as it is above f + 2 cm, f below f - 2 cm, joined by a parabola with no kink; a clearance pushed this way starts gently
  // instead of all at once: the hard one threw a fist 2-3 cm in one frame as it took hold, scorer F4, gate round 1)
  const sfl = (d, f, w = 0.02) => { const a = f - w, b = f + w; return d >= b ? d : d <= a ? f : f + (d - a) * (d - a) / (4 * w); };
  const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  function solve2(p, sec) {
    // (the snow under a point: sec.snowY reads the figure's own frame, and this solver works a quarter turn from it (Qp at the end). Read with the
    // board's x and z, it looked at snow 90 deg round from the hand: on moguls that is another bump, and the back hand went 15 cm into one, Mac r31-r32)
    const snY = sec.snowY ? q => sec.snowY(Qp(q)) : null, gD = sec.gDn ? [sec.gDn[2], sec.gDn[1], -sec.gDn[0]] : [0, -1, 0];      // (gravity in this solver's frame: Qp undone)
    const DRT = 0.25, DRS = 0.45, DRM = 0.5, ELD = 0.8, AL0 = 45, ALS = 20;      // (round 34: the drag arm's direction, see there)
    sec = sec || K.SEC0;
    NEWB = TAB() && !ALP(); NEWS = NEWB && STP(); SBT = NEWS ? SBS : NEWB ? SBF : ALP() ? SBA : SBT0;
    const tab = TAB(), k = tab ? 0 : COOL(), ex = 1 + 0.12 * k, ARMN = tab && !ALP() && X('ARMN', 0) > 0;
    { const f0 = tab && !ALP() ? clamp(p.fwd || 0, 0, 1) : 0; FWv = K.ez && sec.pfDt > 0 ? clamp(K.ez(sec, 'bfwd', f0, X('FWW', 7)), 0, 1) : f0; }                                    // (how far past the real riders' numbers: 0 real, 1 a little, 2 a lot)
    // (TS: every look-ahead below is a time, and a time ahead on a short turn is a bigger share of it: on 0.4 s mogul turns 0.11 s ahead added half
    // again to the lean itself, 26 deg drawn as 40. So the look-aheads shrink with the last turn's length below LT0 s)
    const TS = tab ? sat((sec.btp ? sec.btp.T : 0.9) / X('LT0', 0.7)) : 1;
    let lean0 = p.lean || 0; const tuck = sat(p.tuck || 0), air = sat(p.air || 0), fa = clamp(p.fa || 0, -1, 1), sep = p.sep || 0;
    if (tab && X('LEAD', 0) > 0) { let r0 = 0; if (sec.pfDt > 0) { r0 = sec.blq != null ? clamp((lean0 - sec.blq) / sec.pfDt, -8, 8) : 0; sec.blq = lean0; sec.blqr = K.ez ? K.ez(sec, 'blr0', r0, 15) : r0; } lean0 += X('LEAD', 0) * TS * (sec.blqr || 0) * (1 - air); }
    const LMAX = 1.13 + 0.05 * k;                                            // (65 deg; a little more when asked to be very much)
    const leanG = Math.sign(lean0) * Math.min(Math.abs(lean0) * ex, LMAX), lean = leanG * (1 - air), edge = tab ? X('EDK', 1) * (K.ez && sec.pfDt > 0 ? K.ez(sec, 'bedg', lean, X('EDW', 14)) : lean) + 0.4 * (clamp((p.edge || 0), -LMAX, LMAX) - lean) * air : clamp((p.edge || 0) * ex, -LMAX - 0.05, LMAX + 0.05) * (1 - air * 0.6);
    // (GRB: and the grab weights eased (w GRBW), on solver c: the game's grab came in over 6 frames and was let go in 1-2 when the board landed
    // first, the hand 58-150 mm/frame^2 and the chest folding at 900 deg/s. Eased, the hand leaves the board over a tenth of a second after landing)
    const gE = (k, x) => tab && X('GRB', 1) > 0 && K.ez && sec.pfDt > 0 ? sat(K.ez(sec, k, x, X('GRBW', 14))) : x;
    const gKH = p.grabK >= 0.5 ? (sec.bgk = Math.round(p.grabK)) : sec.bgk || 0;      // (the grab's kind held while its weight eases out: the game clears it as the trick ends, and the hand jumped from the tail to the middle, 161 mm in a frame)
    const gL = gE('bgL', smooth(0, 1, p.grabL || 0)), gR = gE('bgR', smooth(0, 1, p.grabR || 0)), gM = Math.max(gL, gR), id = sec.idle || null;
    const ts = smooth(0.05, 0.85, lean), hs = smooth(0.05, 0.85, -lean), deep = smooth(0.82, 1.05, Math.abs(lean)) * (1 - air);   // (deep: past ~50 deg, the inside hand goes down to the snow)
    const J = {}, F = new Array(K.NB);
    // ---- 1 the board: on the real snow under it (sec.gnd: height and pitch read under the board's length, 08j_solver.js), rolled onto its edge.
    // (the old figure took the game's ski-tip lift, pose.tipL/R, as the whole board's pitch about its middle: 0.5 on any steep pitch, so the board
    // stood 17 deg nose up with its tail 20 cm in the snow, found by the scorer's new whole-board check, 2026-11-22)
    const gd = sec.gnd || null, gy = gd ? Math.max(gd[0], 0) : 0, gp = gd ? gd[1] : 0;
    // (real riders stand the board up further than their body: carving video measured against this figure, 2026-11-22, the board's edge minus
    // the hips-to-feet lean is +13 deg on the toes and +11 on the heels; this figure had +9 and -7, so on the heels it sat its hips down by folding
    // the knees to 120-130 deg where a rider lets the board stand and keeps the knees at 60-100)
    // (so the board stands up past the body by up to 0.08 rad on the toes, 0.30 on the heels: tuned against the real-rider table, five
    // settings tried on the Mac, this one put 66-99% of turn frames inside the real riders' knee / hip bands, was 3-6%)
    // (真人表, owner 2026-11-23 02:01: "你的小腿是跟 binder 挨着的，所以你不可能把板立那么高" — the boots and highbacks hold the shins to the board, so
    // the board stands up with the legs, not past them: on c the board's edge is the body's own lean (the game's edge is the lean x 1.12 plus the
    // skid, and the extra above put it 14-26 deg past the body, 69-80 deg on a 55 deg lean))
    // (on the heels a little more, 0.10 rad: the highback holds the shin some 10 deg forward of the board's normal, so a board flat with the legs
    // put the shins behind the highback, +8 deg, which no boot allows)
    // (and the board rolls over a little after the body, not before it: the body's lean crosses first and the edges follow (Mac round 3: with the
    // board on the lean itself the board crossed 0.07 s early, Rcomlead); eased like the hips, about a tenth of a second)
    const angu = tab ? (edge > 0 ? 0 : 0.10) * smooth(0.1, 0.7, Math.abs(edge)) * (1 - air) : (edge > 0 ? 0.08 : 0.30) * smooth(0.1, 0.7, Math.abs(edge)) * (1 - air);
    // (only that extra is eased, like the hips: when the game's edge crosses zero faster than the smooth step it flips side in a frame, and
    // knees and ankles jumped 48-78 mm in 4-8 frames of the scorer's runs, snowboard thread 2026-11-22. Easing the whole edge instead made the
    // board lag the legs: worst leg jolt on a carve 9.4 -> 13.1 mm)
    let xa = Math.sign(edge) * angu;
    if (K.ez && sec.pfDt > 0) xa = K.ez(sec, 'bang', xa, 18 + 20 * air);
    const edgeB = clamp(edge + xa, -1.45, 1.45);
    // (抓板时板面 tweak：method 拉起后刃、japan 竖提板、nose/tail 抬板头/板尾、melon/stalefish 略提后刃，让 8 种抓板轮廓在空中一眼可辨)
    const gAtw = tab && X('GRB', 1) > 0 ? Math.max(gM, smooth(0, 1, p.grabA || 0)) * air : 0;
    const gEdge = gAtw * (gKH === 4 ? -0.48 : gKH === 8 ? 0.42 : gKH === 3 || gKH === 5 ? -0.22 : gKH === 1 || gKH === 2 ? 0.15 : 0);
    const gPitch = gAtw * (gKH === 6 ? 0.32 : gKH === 7 ? -0.32 : gKH === 4 ? 0.20 : gKH === 8 ? -0.18 : 0);
    const bb = basis(gKH === 4 ? -0.36 * gAtw : gKH === 8 ? 0.28 * gAtw : 0, clamp(edgeB + gEdge, -1.45, 1.45), gp + gPitch), O = [0, BD.hw * Math.abs(Math.sin(edgeB)) + gy, 0];
    const fbL = yawIn(bb, BD.yawF), fbR = yawIn(bb, BD.yawB);
    J.footL = v3.mad(O, bb.X, -BD.half); J.footR = v3.mad(O, bb.X, BD.half);
    // (the ankle stands lower on a board than in ski boots: the shared figure's 16 cm is a ski boot's sole on a binding's stack on a ski; a
    // snowboard boot's sole, the binding's base plate and the board come to about 6 cm under a 7 cm ankle, so 12 here (with H below 4 cm lower).
    // The owner 2026-11-22: "为什感觉单板这个人腿这么长" — the 4 cm went into the shins)
    const ANK = 0.12;
    J.ankleL = v3.mad(J.footL, fbL.Y, ANK); J.ankleR = v3.mad(J.footR, fbR.Y, ANK);
    const aM = v3.lerp(J.ankleL, J.ankleR, 0.5);
    // ---- legs folded: the game's crouch, deeper in a tuck, drawn up in the air and for a grab
    let c = sat(p.crouch == null ? 0.21 : p.crouch);
    // (standing and plain gliding, the owner 2026-11-22 "单板站立时应该是横向的？而且腿不怎么曲": a rider standing on a board stands side-on to it, legs
    // all but straight (knees 10-15 deg); gliding straight, knees about 25 deg. The figure had 75-80 deg on a glide and the shoulders turned 24 deg
    // toward the nose even at rest. stand: 1 at rest, 0 from 6 m/s; flat: 1 with the board flat, 0 on an edge or in a tuck)
    const vB = tab && sec.vs != null ? sec.vs : Math.abs(sec.vb || 0), stand = (1 - smooth(1.0, 6, vB)) * (1 - air), flat = (1 - Math.max(ts, hs)) * (1 - sat(tuck * 2)) * (1 - air);
    c = Math.max(c, 0.42 * tuck); c = lerp(c, Math.max(c, 0.5), air * 0.7); c = lerp(c, 0.9, gM);
    // (真人表: how much of a skid this is (wSk), and the knee bend front / back the owner's video has for it, kTab. Skid when slow or with the board
    // well across its path; eased over about a third of a second, so a turn does not flip from one body to the other in a frame. Near a flat board
    // (e -> 0) the turn's numbers fade into gliding / standing, so the edge changing side never jumps either)
    // (round 16, owner "单板蹲可以更低然后跳得更高一点": winding up a jump (p.chg, the game's S.charge) the knees fold up to 50 deg more, hips down
    // about 20 cm, the low coil a rider loads an ollie from; before, a full wind-up dropped the hips 4 cm. Eased, so letting go springs up over a few frames)
    const chE = tab ? (K.ez && sec.pfDt > 0 ? K.ez(sec, 'bchg', sat(p.chg || 0) * (1 - air), 14) : sat(p.chg || 0) * (1 - air)) : 0;
    // (落地深蹲缓冲, Steep 跳跃尺: 落地瞬间膝盖弯 ~92°、骨盆下沉至 0.72 腿长、上身前折 ~55°、双臂微展平衡；用 p.onSnow 即时检测触雪，仅在真正腾空落地后生效，不影响地面刻滑)
    let lndE = 0;
    if (tab && X('KLND', 0) > 0) {
      const inAir = p.onSnow != null ? p.onSnow < 0.5 : air > 0.5;
      if (sec.pfDt > 0) {
        if (inAir) { sec.bAirT = (sec.bAirT || 0) + sec.pfDt; }
        else {
          if ((sec.bAirT || 0) > 0.18) sec.bLndT = Math.max(sec.bLndT || 0, smooth(0.18, 0.55, sec.bAirT));
          sec.bAirT = 0;
          sec.bLndT = Math.max(0, (sec.bLndT || 0) * Math.exp(-sec.pfDt / 0.36));
        }
      }
      const l0 = Math.max(sat(p.lnd || 0), sec.bLndT || 0) * (inAir ? 0 : 1);
      lndE = K.ez && sec.pfDt > 0 ? sat(K.ez(sec, 'blnd', l0, 14)) : l0;
    }
    let wSk = 0, kTab = null, eT = 0, sideT = 'toe', lrS = 0, lrQ = 0, sideH = 'toe', eH = 0;
    // (round 19, owner 09:51 "左右拐的时候就应该右手扶住雪…胳膊还是很僵硬，肩膀也很僵硬": wD, the right (back) hand down on the snow on the
    // toe side: from about 25 deg of lean the rider sinks, folds over the toes and the back hand reaches past the back foot to the snow, held
    // there through the turn, not only at the deepest. Before, it came within 6 cm only at the very deepest (47 deg and more) and nobody saw it)
    let wD = 0, wB = 0;
    if (tab) {
      const bt = Math.abs(p.beta || 0); // (and by speed in three bands like the gate and the owner's table: below 6 m/s skid, 6-12 the middle row (held over most of the band), above 12 carve)
      let w0 = Math.max(1 - 0.5 * smooth(SBT.SK_V0 - 0.5, SBT.SK_V0 + 0.5, vB) - 0.5 * smooth(SBT.SK_V1 - 0.5, SBT.SK_V1 + 0.5, vB), smooth(SBT.SK_B0, SBT.SK_B1, bt));
      if (K.ez && sec.pfDt > 0) w0 = K.ez(sec, 'bsk', w0, 10);
      wSk = sat(w0); sideT = lean >= 0 ? 'toe' : 'heel';  eT = smoother(0.03, 0.40, Math.abs(lean)) * (1 - air);
      // (how fast the lean is changing, smoothed: the trunk and the knees act on where it is going)
      { const lG = X('LRT', 0) > 0 ? leanG : lean; if (sec.pfDt > 0 && sec.blp != null) lrS = (lG - sec.blp) / sec.pfDt; sec.blp = lG; lrQ = lrS; if (K.ez && sec.pfDt > 0) { if (X('SRL', 0) > 0) lrQ = K.ez(sec, 'blq', clamp(lrQ, -8, 8), X('SRL', 0)); lrS = K.ez(sec, 'blr', clamp(lrS, -8, 8), 15); } if (!(X('SRL', 0) > 0)) lrQ = lrS; if (X('LRT', 0) > 0) { lrS *= 1 - air; lrQ *= 1 - air; } }      // (the rate of the lean the rider holds, not of its fade in the air: leaving the snow the pose's lean runs to zero in a quarter second, and read as an edge change that swung the chest 15 deg and the arms with it at every take-off, overnight 2026-11-24)
      // (driven a third of a second ahead of the body's lean, as the trunk is: the body's lean trails the board's by about that, and off its own lean the
      // hand only reached the snow as the turn ended, 0.1-0.2 s before the edge change; and let go as soon as the rider starts to unroll)
      { const lA = lean + 0.33 * lrS, w = smooth(0.22, 0.50, lA) * smooth(-2.5, -0.8, lrS) * (1 - air) * (1 - sat(tuck * 2)) * (1 - smooth(0.6, 0.95, wSk)) * (1 - stand); if (K.ez && sec.pfDt > 0) { const w0 = sec.wD || 0; wD = K.ez(sec, 'bwD', w, w > w0 ? 6 : 4); } else wD = w; sec.wD = wD;      /* (in quickly, off slowly: let go at the edge change in 0.15 s, the arm snapped up, elbow jolts 3-6 deg every turn) */ 
        wB = (K.ez && sec.pfDt > 0 ? K.ez(sec, 'bwB', w, 12) : w) * smooth(-0.05, 0.15, lean); }      // (the body's part, the sinking and the fold, comes off as fast as it went on, and is gone once the body is over the other way: off the hand's slow release it hung on into the next heel turn, knees 20-40 deg too bent there)
      // (review 2026-11-23: the knee row's side is taken from the same look-ahead lean as its weight eK below, so the toe/heel swap happens where eK is 0)
      const lK = lean + 0.10 * lrS * (1 - air), sideK = lK >= 0 ? 'toe' : 'heel';
      // (the arms the same, a fifth of a second ahead: a rider's hands go to the new turn's side before the board does. Owner 2026-11-23 "整个胳膊的动作还是非常僵":
      // measured on the replays of his videos, our hands moved 0.24-0.78 m/s (median) against the hips, his 0.83-0.96, p90 0.6-1.7 against 2.3-2.6)
      { const lH = lean + 0.2 * lrS * (1 - air); sideH = lH >= 0 ? 'toe' : 'heel'; if (K.ez && sec.pfDt > 0) sec.bArmD = K.ez(sec, 'barmd', smooth(-0.4, 0.4, lrS), 6); else sec.bArmD = smooth(-0.4, 0.4, lrS);      /* (round 28: which edge change the arms pass through, heel->toe while the lean swings toward the toes) */ eH = smoother(0.03, 0.40, Math.abs(lH)) * (1 - air); }
      const d = smooth(0.1, 1.1, Math.abs(lean)), k0 = mb(sideK, 'k0', wSk, lerp2), k1 = mb(sideK, 'k1', wSk, lerp2), skc = lerp2(k0, k1, d);
      // (the edge change rises: the owner, 2026-11-23 00:42 UTC, "换刃的时候重心会有点往上跳". His transitions measure the hips furthest from the ankles
      // of any part of a turn (1.04 leg, carve 0.81-0.97), the legs stretched as the board goes flat. Here, the knees straighten toward TR as the lean
      // swings through flat. Before, they were LOWEST there, 0.76 leg, and rose 0.3 s after)
      // (the game's lean swings through flat in 0.2-0.3 s, faster than the owner's 0.6-0.8 s, so a flat-board window is too short to show it: the
      // rise is driven by the swing itself, the knees opening by up to UP deg while the lean is swinging fast)
      // (2026-11-23, both owner videos: linking turns, the knees open only 11-17 deg as the board goes flat (the body rises 6-8% of a leg, peak 0.05 s
      // after the crossing), not all the way to straight gliding. So while the lean is swinging fast the flat-board end is the turn's own knees less 12)
      const link = smooth(0.4, 1.5, Math.abs(lrS)) * (1 - air), kA = lerp2(mb('toe', 'k0', wSk, lerp2), mb('heel', 'k0', wSk, lerp2), 0.5),
        kFl = lerp2(SBT.glide.k, [Math.max(SBT.glide.k[0], kA[0] - X('KUP', 16)), Math.max(SBT.glide.k[1], kA[1] - X('KUP', 16))], link);      // (both edges' rows averaged: the flat end never swaps side)
      // (taken a sixth of a second ahead, like the trunk: the hips' ease lags, and the owner's rise peaks 0.05 s after the crossing, not 0.2)
      const eK = smoother(0.03, 0.40, Math.abs(lK)) * (1 - air);
      kTab = lerp2(lerp2(kFl, SBT.stand.k, stand), skc, eK);
      // (round 38, the owner's knees by turn phase, both videos (body_ranges.json): not a V with the lean, low at every edge change and deepest at the
      // turn's middle, but a step by SIDE: on the toes bent 70-80 deg from the moment the board rolls over, held all turn; onto the heels the legs
      // push out long (30-45) and fold only a little as the turn goes on. So linked turns no longer pass through the flat board's knees: the two
      // sides' own knees blend across the edge change (KW rad of lean either way), each side's row still deepening a little with the lean)
      if (X('KNEW', 0) > 0) { const u = smooth(-X('KW', 0.21), X('KW', 0.21), lean + X('KLD', 0.03) * TS * lrS * (1 - air)), kT0 = lerp2(mb('toe', 'k0', wSk, lerp2), mb('toe', 'k1', wSk, lerp2), d), kH0 = lerp2(mb('heel', 'k0', wSk, lerp2), mb('heel', 'k1', wSk, lerp2), d);
        // (the middle and fast rows are the owner's knees in the turns he makes at those speeds, 43-50 deg over, right from the edge change: on the toes
        // 85 deg at once. A gentle turn at the same speed is not in his videos, and read off those rows a 20 deg toe turn squatted to 86/76 and stood up
        // to 28/42 on the heels. So how deep the riding has lately been (the lean's peak, let go over 6 s) picks the row: under 24-33 deg the
        // gentle-turn knees of his slow video (the skid row), whatever the speed)
        let kT = kT0, kH = kH0;
        if (X('KGN', 0) > 0) { const dep = sec.pfDt > 0 ? (sec.bdep = Math.max(Math.abs(lean), (sec.bdep || 0) * Math.exp(-sec.pfDt / X('KGT', 6)))) : Math.max(Math.abs(lean), sec.bdep || 0), gen = 1 - smooth(X('KG0', 0.42), X('KG1', 0.58), dep);
          kT = lerp2(kT0, lerp2(SBT.skid.toe.k0, SBT.skid.toe.k1, d), gen); kH = lerp2(kH0, lerp2(SBT.skid.heel.k0, SBT.skid.heel.k1, d), gen); }
        kTab = lerp2(lerp2(SBT.glide.k, SBT.stand.k, stand), lerp2(kH, kT, u), Math.max(eK, link)); }
      // (from the moment the lean starts to unwind toward flat: the knees and hips are eased, so the rise has to begin before the board is flat to
      // show as it crosses)
      { const ret = Math.max(-Math.sign(lean) * lrS, Math.abs(lean) < 0.3 ? Math.abs(lrS) : 0), u0 = smooth(0.5, 3.0, ret) * (1 - air) * (1 - stand), up = SBT.UP * (K.ez && sec.pfDt > 0 ? sat(K.ez(sec, 'bup', u0, 14)) : u0);      // (the rise itself eased, w 14: switched on raw it kicked the hips 7-10 mm/frame^2 at every edge change)
        kTab = [Math.max(6, kTab[0] - up), Math.max(4, kTab[1] - up)]; }
      // (the hips start high and come down until the legs are as bent as the table says, so the table sets the knees: before, they started at a fixed
      // height and on a 50-60 deg carve the legs were already shorter than that, knees 79/97 against the owner's 57/70 (board_gate.js). A deep crouch
      // (charging a jump) and a tuck still fold them further; a landing still drops the hips)
      { const ex = 30 * Math.max(0, c - 0.5) + Math.max(25 * tuck, X('KCHG', 50) * chE) + X('KLND', 0) * lndE + X('KWB', 70) * wB; const kCap = lndE > 0.1 ? 92 : 128; kTab = [Math.min(kTab[0] + ex, Math.max(kTab[0], kCap)), Math.min(kTab[1] + ex, Math.max(kTab[1], kCap))]; }      /* (no deeper than 128 deg from the sinking; landing cushion capped at 92 deg per Steep jump ruler & splay guard) */
      // (and the knee targets themselves are eased (w 10): where the table's front/back leg swap at an edge change and a tuck comes in, they kinked
      // and the knees jolted 1.5-3 deg (scorer F1, Mac gate round 1: 38-91 jolts a minute against b's 0); w 50 (was 16 while the hip ease was accidentally off), so the rise at an edge change is not left behind)
      // (GRB, owner 2026-11-25 单板空中动作: in the air the legs are drawn up, as the Steep footage rides it: knees about KAIR deg in a plain flight and
      // KGRB holding a grab, the board pulled up under the hips to meet the hand. The table above holds only riding: in the air the legs hung near
      // straight under a grab whose hand never reached the board, 0.6-1 m off it)
      { const ko = X('KOFF', 0) * (1 - air) * (1 - FWv); if (ko) kTab = [kTab[0] + ko, kTab[1] + ko]; }      // (KOFF: the whole riding crouch deeper by this many degrees of knee, owner 2026-11-26 "蹲能不能低一点")
      // (KLD, owner 2026-11-26 "单板的动作很僵硬…一开始的时候整个屁股上身完全不动，真正的应该是有弹性": the table set the knees by the lean alone, so on
      // a straight run the hips stood still to the millimetre (3 mm, trunk under 1 deg over the first 5 s) while the snow under the board rose and
      // fell, its push swinging 0.65-1.1 g about once a second. The legs take that as legs do: more push, more bend. pose.load (the snow's push in g)
      // less its own slow mean over about 2/KLDS s, so a held carve's load stays the table's; eased over about 2/KLDF s, the time a leg takes to
      // give. No spring of its own: the knees follow the snow and stop where it stops. The push is read within 1 +- KLDC g: a landing's or a pop's
      // spike is the landing's and the jump's own business, and through this it jolted the knees 20 deg more)
      // (KLDT: and the hips fold with them, KLDT rad per g, so the chest goes down and forward over the knees as a rider's does, not straight down)
      sec.bLd = 0; { const g = X('KLD', 0); if (g && K.ez && sec.pfDt > 0) { const v = Math.max(1 - X('KLDC', 0.2), Math.min(1 + X('KLDC', 0.2), p.load == null ? 1 : p.load)), sl = K.ez(sec, 'bldS', v, X('KLDS', 1.2)), fa = K.ez(sec, 'bldF', v, X('KLDF', 10));
          sec.bLd = Math.max(-X('KLDM', 0.4), Math.min(X('KLDM', 0.4), fa - sl)) * (1 - air); const kc = g * sec.bLd; kTab = [kTab[0] + kc, kTab[1] + kc]; } }
      if (X('GRB', 1) > 0) { const fly0 = 1 - (p.onSnow == null ? 1 : p.onSnow), fly = K.ez && sec.pfDt > 0 ? sat(K.ez(sec, 'bfly', fly0, fly0 > 0.5 ? X('FLYI', 6) : X('FLYO', 14))) : fly0,
          gk = gKH, kA = X('KAIR', 92), kG = X('KGRB', 145), kF = kG - (gk === 7 ? X('KGNS', 10) : 0), kB = kG - (gk === 6 ? X('KGNS', 10) : 0),      // (a tail grab: the back knee up, the front leg let out, so the tail comes up to the hand; a nose grab the other way round)
        gA = Math.max(gM, smooth(0, 1, p.grabA || 0));      // (on the legs-up weight, which starts before the hand: on gM alone the knees were still coming up as the grab let go, the hand 0.3-0.6 m off the board)
        kTab = [lerp(lerp(kTab[0], Math.max(kTab[0], kA), fly), kF, gA), lerp(lerp(kTab[1], Math.max(kTab[1], kA), fly), kB, gA)]; }
      if (K.ez && sec.pfDt > 0) kTab = [K.ez(sec, 'bk0', kTab[0], 50), K.ez(sec, 'bk1', kTab[1], 50)];
    }
    // ---- 5 (first, its tilt does not hang on the hips) the trunk: leaned with the body. Toes: the chest goes over with the lean and folds low
    // over the front knee. Heels: it leans back with the body but less, and folds a little forward to hold the seat (the chest stays tall)
    let fold = (0.12 + 0.24 * c) * (1 - 0.6 * stand) + 0.16 * ts * (0.8 + 0.2 * k) + 0.10 * hs + 0.55 * tuck + (tab ? X('FGRB', 0.8) : 0.25) * gM + (tab ? X('FCHG', 0) * chE + X('FLND', 0) * lndE : 0) + (id ? id.up : 0);
    fold += X('KLDT', 0) * (sec.bLd || 0);
    let tilt = lean > 0 ? 0.80 * lean : 0.62 * lean;                        // (toward the toes is +, in the board's roll)
    let hinge = fold + tilt, trA = 0, trB = 0;
    // (真人表: the trunk measured against the leg line, ankles to pelvis (the owner's video, 'trk-L'): on the heels the legs lean back but the chest
    // folds forward over the knees, 50 deg off the leg line skidding and 77 carving, so the trunk ends up a little forward of upright, hips bent
    // 77-109 deg; on the toes it stays near the leg line, a little past it skidding, a little short of it carving (the rest of the 22-37 deg is a fold
    // toward the nose, which the shoulders' turn toward the nose gives). Before, on a deep heel carve the trunk leaned back 17 deg)
    // (and it moves first: real riders' trunk crosses into the new turn 0.1-0.2 s before the legs (the carving research, 2026-11-18), so the target
    // is taken from where the lean is going, a fifth of a second ahead, and the easing below makes up the rest)
    // (aTc: a deep toe-side carve HELD, the owner's "拐的比较大的时候 手应该是轻轻扶着地面". In his own linked turns the lean is past TC0 for under a third
    // of a second, and there the fitted rules stand as they are. Held longer (a key kept down), the rider settles into it: the trunk comes down to
    // TCT rad toward the snow and stays there (measured 73-74 deg off the snow's normal, his own deepest is 73; a fixed amount added instead laid
    // him at 82-84 wherever the turn was already deep), the back shoulder drops TCS m, and the back hand rests on the snow under it. Without it the
    // shoulder stays 75-88 cm up through a long carve and the hand hangs 10-24 cm over the snow. The trunk also stops reading ahead as it settles
    // (TCD): the pose's lean breathes 48-53 deg with the load, and read 0.4 s ahead that swung the trunk 16 deg)
    // (TDK, 2026-11-24, owner 16:07 UTC "摸雪的动作还不是连贯": in a held deep carve the hand hung 7-20 cm over the snow for the first second and more. The
    // trunk dipped as the rider rolled in (reading the lean ahead), came back up 16 deg as the lean stopped rising, and only then, 0.3-0.9 s into
    // the hold and slowly, settled down again: the shoulder was within the arm's reach of the snow for the last third of the turn only. A rider who
    // means to put a hand down goes down with the turn, once. So deeper than the owner ever leans in his three clips (0.748 rad of the pose's own
    // lean, so his own riding is untouched) the settle follows the turn's DEPTH: nothing at TD0, all of it by TD1, coming in as the rider rolls in
    // (TD1 0.93 was tried: a medium turn laid to 0.85 and let go at once dipped the trunk less (the head 17-18 mm/frame^2 against 20-22, the
    // delivered 16), but a turn HELD at 0.85-0.86 hung the hand 4-14 cm over the snow for half a second again, the very hover asked away);
    // it is kept while the turn is held, whatever the lean breathes, and let go as he rolls out (TDG1 to TDG0, read ahead). No clock in it: a
    // settle that waited a few tenths of a second came in a medium turn just as the rider was rolling out again, a dip and a bounce of the head.
    // TCR: and settled, the trunk holds the back shoulder where the hand rests on the snow with a little bend left in the elbow (the arm's full
    // reach less TCRS m; read from the hand's own measure last frame, sec.bsxg), tipping up to TCRH rad further or TCRL back, slowly (TCRU, TCRD
    // per second): at TCT alone the settled shoulder is 60-70 cm up as the lean breathes, the arm at full stretch or the hand off the snow again)
    const ARMN0 = tab && !ALP() && X('ARMN', 0) > 0; let aTc = 0, aTs = 0, cEv = 0, tcx = 0;
    if (ARMN0 && X('TCK', 0) > 0) { const dp = lean > X('TC0', 0.72) && air < 0.5 ? 1 : 0; if (sec.pfDt > 0) sec.btch = dp ? (sec.btch || 0) + sec.pfDt : 0;
      const a0 = smooth(X('TCH0', 0.3), X('TCH1', 0.9), sec.btch || 0) * (1 - air) * (1 - smooth(0.6, 0.95, wSk)) * (1 - stand); aTs = K.ez && sec.pfDt > 0 ? K.ez(sec, 'batc', a0, a0 > (sec.batc0 || 0) ? X('TCW', 5) : 9) : a0; sec.batc0 = aTs; aTc = aTs;
      // (the depth is read from the pose's own lean, without the solver's lead: with the lead a quick roll-in of his reads past TD0. The letting go
      // is read ahead instead, like the trunk's own tilt: from the solver's lean, which leads, and TDGT s further along its rate where that is
      // a roll-out (faster than TDGR rad/s; inside a held turn the lean falls no faster than 0.74 as the load breathes, in the bowl's compression,
      // and deep in a turn that still reads above TDG1). Read from the lean alone the trunk was still laid over, 35 deg toward the toes, as the
      // board came flat: it should cross with it.
      // And this settle (cEv) is ADDED to the trunk's own tilt, TDD rad of it, up to TCT (below, at aCq): the tilt itself reads the lean ahead, so
      // the trunk starts up with the first of the roll-out as it always did, and the settle comes off on top of that. As a blend toward TCT it
      // held the trunk flat for the first tenth of a second of the roll-out and then threw it up (the head 24 mm/frame^2 against 16).
      // The slow settle of a turn held long (aTs) stays the blend it was.
      // (TDF: and it grows only while the lean does or holds: once the lean has started back (its rate past -TDF0..-TDF1 rad/s) it stays where it
      // has got to until the roll-out lets it go. Eased toward a depth the rider had already left, a turn laid over to 0.85 and let go after a
      // tenth of a second dived the trunk 9 deg further as the lean fell and then threw it up again: the head 21.7 mm/frame^2 against 15.8)
      if (X('TDK', 0) > 0) { const lnP = (p.lean || 0) * (1 - air), c = Math.min(smooth(X('TDG0', 0.5), X('TDG1', 0.72), lean + X('TDGT', 0.3) * Math.min(0, lrS + X('TDGR', 0.3))), Math.max(smooth(X('TD0', 0.77), X('TD1', 0.87), lnP), sec.btdc || 0)); if (sec.pfDt > 0) sec.btdc = c;
        const cA = c * (1 - air) * (1 - smooth(0.6, 0.95, wSk)) * (1 - stand), cP = sec.batd0 || 0, c0 = cA > cP && X('TDF', 0) > 0 ? lerp(cA, cP, smooth(X('TDF0', 0.1), X('TDF1', 0.5), -lrS)) : cA,
          cE = K.ez && sec.pfDt > 0 ? K.ez(sec, 'batd', c0, c0 > cP ? X('TDW', 30) : X('TDWO', 20)) : c0; sec.batd0 = cE; if (cE > 0) { cEv = cE; aTc = 1 - (1 - aTs) * (1 - cE); } }
      if (X('TCR', 0) > 0 && sec.pfDt > 0) { const g = sec.bsxg; let d = sec.btcx || 0;
        if (aTc > 0.02 && g && sec.pfN - g[0] <= 1) { const e = clamp((g[1] + X('TCRS', 0.03)) / 0.49, -0.3, 0.3); d = clamp(d + e * (e > 0 ? X('TCRU', 5) : X('TCRD', 0.5)) * sec.pfDt, X('TCRL', -0.06), X('TCRH', 0.06)); }
        else d *= Math.exp(-4 * sec.pfDt);
        sec.btcx = d; tcx = d; } }
    if (tab) { const lr = lrS;
      // (the look-ahead is a share of the turn's length, but never more than a third of a second, and where the lean is headed is never past what a
      // body leans: after a long straight the last turn's length was 2.5 s, and a quick lean-in read 0.6 s ahead laid the trunk flat on the snow, overnight 2026-11-24)
      // (how far ahead it may read: in linked turns, as far as the last turn leaned (and a little more); with no fresh turn behind it (a lean-in off a
      // straight run, before a hop), only 0.3 rad past where the lean is now)
      const tld = X('TLD', 0) > 0 ? Math.min(X('TLD', 0) * (sec.btp ? sec.btp.T : 0.9), X('TLM', 9)) : 0.2, lP0 = lean + tld * lr * (1 - air) * (1 - X('TCD', 0.8) * (cEv > 0 ? Math.max(aTs, cEv * (1 - smooth(X('TDRO0', 0.2), X('TDRO1', 0.8), -lr))) : aTc)),      /* (TDK: settled by depth, the trunk stops reading the lean's small breathing ahead too, but not a roll-out) */ TPp = sec.btp, lFr = TPp && TPp.A != null ? 1 - smooth(1.5, 2.5, (TPp.c - TPp.t0) / TPp.T) : 0, lAb = Math.max(Math.sqrt(lean * lean + 0.04) + X('LPA', 0.25), X('LPK', 1.15) * (TPp && TPp.A || 0) * lFr),
        lP = X('LPM', 0) > 0 ? Math.sign(lP0) * smin(Math.abs(lP0), Math.min(lAb, X('LPM', 1.05)), 0.2) : lP0, sP = lP >= 0 ? 'toe' : 'heel', eP = smooth(0.05, 0.35, Math.abs(lP)) * (1 - air);
      // (two parts, both in the board's frame: toward the toes (the leg line's lean plus the table's offset) and toward the nose (the fold over the front
      // knee, 'trunk bend->nose' in the table). They used to be one pitch in the chest's frame, and the chest is turned 40-64 deg toward the nose, so
      // most of a toe-side lean went over the nose: trunk 56-63 deg off the leg line on a toe carve, the owner's 37)
      const o = mb(sP, 'trk', wSk, lerp), nb = mb(sP, 'nose', wSk, lerp) + (tab ? FWD() * X('FWN', 0) * (1 - air) : 0), f0 = fold, y0 = SBT.flat.yaw * (1 - 0.6 * stand);
      const aN = X('TNEW', 0) ? -smin(-(X('TT0', -0.09) + X('TT1', 1.2) * lP), -(X('TH0', 0.34) + X('TH1', 0.15) * lP), X('TSM', 0.15)) : lP + o;
      // (and the trunk never lies flatter than a rider's does: the owner's deepest is 73 deg off the snow's normal. A tuck or a grab folds it further only
      // while there is room: tucked on a 50 deg toe carve the sum was 98 deg, chest under the snow line, overnight 2026-11-24)
      const aSum = aN + 0.55 * tuck + X('FGRB', 0.8) * gM + X('FCHG', 0) * chE + X('FLND', 0) * lndE + Math.min(X('TWB', 1.1) * wB, Math.max(0, 1.25 - Math.hypot(aN, nb)));
      const aCp = X('TCAP', 0) > 0 ? smin(aSum, X('TCAP', 0.95), 0.15) : aSum, aCq = cEv > 0 ? smin(aCp + cEv * X('TDD', 0.46), X('TCT', 1.2) + tcx, 0.05) : aCp, aRc0 = aTs > 0 ? lerp(aCq, Math.max(aCq, X('TCT', 1.2) + tcx), aTs) : aCq;      // (a held deep toe carve: the trunk settles at TCT, see aTc; tcx: where the back hand's reach asks, TCR)
      let aT = lerp(f0 * Math.cos(y0), aRc0, eP), bT = lerp(f0 * Math.sin(-y0), nb, eP);
      { const gk = gKH; if (X('GRB', 1) > 0 && (gk === 6 || gk === 7)) bT += gM * (gk === 7 ? -X('TGT', 1.0) : X('TGN', 0.25)); }      // (GRB: a nose or tail grab bends the chest down toward that end of the board, as far as the arm needs: straight over the middle the back hand reached 0.32 m back, the tail is 0.62)
      // (the trunk is heavy too: across an edge change it swings from folded over the heels to over the toes, up to 0.8 rad in 0.3 s, and raw it
      // jerked the head and hands 70 mm/frame^2 (scorer F4). Eased like the hips, about a sixth of a second)
      // (owner 2026-11-24 22:13 UTC, holding accelerate: "屁股…在中心的位置，身体向前，然后蹲的低一点…肩膀摆正", with two reference frames of riders
      // facing the nose. The trunk folded toward the TOES (the freestyle fold) while the chest turned 60 deg toward the nose, so the fold tipped the
      // shoulder line 38-39 deg (freestyle 0-6). Facing forward, the fold at the hips (not the lean of the whole body) goes the way the chest faces; redirected before the ease, as the fold's size
      // has a corner where it crosses zero at the edge change: after it, head and hands jolted at every change)
      if (tab && FWv > 0.001 && X('FWF', 1) > 0) { const tl = lean * eT, fa0 = aT - tl, fm = Math.hypot(fa0, bT) * lerp(1, X('FWM', 0.35), FWv), ph = -(sec.ez && sec.ez.byw ? sec.ez.byw.o[0] : -0.9);
        aT = lerp(aT, tl + fm * Math.cos(ph), FWv); bT = lerp(bT, fm * Math.sin(ph), FWv); }
      if (K.ez && sec.pfDt > 0) { aT = K.ez(sec, 'bhg', aT, X('TRW', 12)); bT = K.ez(sec, 'bhn', bT, X('TRW', 12)); }
      trA = aT; trB = bT; hinge = Math.hypot(aT, bT) * (aT >= 0 ? 1 : -1); tilt = lean * eT; fold = aT - tilt; }
    const up2 = Math.min(hinge * 1.05 + 0.05 - 0.035 * (id ? id.br : 0), 1.75), rollT = -0.10 * fa + (id ? id.sx : 0);
    // (shoulders open toward the nose, more on the heels, where the front arm points the way)
    let yawP = -0.26 * (1 - 0.8 * stand) + 0.25 * sep - 0.08 * hs, yawC = -0.42 * (1 - 0.8 * stand) + 0.35 * sep - 0.22 * hs - 0.08 * ts * k + (id ? id.ty : 0);
    // (真人表: the chest opens toward the nose as far as the owner's does, against the board: about 40 deg skidding on either edge, 37 on a heel carve,
    // 64 on a toe carve; the hips 11-19 deg less (shoulder-hip twist). The head still looks down the run)
    // (round 16, owner 2026-11-23 "第三个视频 还是不像 不流畅": the upper body rode locked to the board, so on a slow skid, the board swinging +-35 deg
      // across its path every turn, the shoulders swung 77 deg a turn with it. His shoulders turn about 40 deg a turn against the board: the board
      // pivots under a chest that keeps to the way he is going. So the chest is turned back against the skid (BK), measured: 41 deg against the
      // board, 45 in the world, as in his video 1. Carving (no skid) unchanged)
    if (tab) { const yB = -0.7 * Math.tanh(1.1 * (p.beta || 0) / 0.7) * (1 - air) * (ALP() ? 0 : 1);      // (硬鞋刻滑: the chest already faces the way the rider goes, square to the nose; turned back on top of that, the back forearm went 13 cm into the chest on a hockey stop)      // (Mac round 16: uncapped, a 0.2 s whip of the board from +66 to -67 deg swung the chest 125 deg and put the front forearm 7 cm into it; now soft-capped at 40 deg, the slope still 1.1 for a normal skid)
      sec.bdy = K.ez && sec.pfDt > 0 ? K.ez(sec, 'bdy', yB, 9) : yB;
      const y = (X('YNEW', 0) ? X('Y0', -0.57) + X('YL', -0.08) * clamp(lean / 0.87, -1.3, 1.3) * (1 - air) + X('YR', 0.16) * clamp(lrS, -3, 3) * (1 - air) : lerp(SBT.flat.yaw, mb(sideT, 'yaw', wSk, lerp), eT)) * (1 - 0.95 * stand) + 0.35 * sep + (id ? id.ty : 0) + yB * X('YB', 1) + FWD() * X('FWY', -0.52) * (1 - 0.95 * stand);
      const yF = FWv > 0 ? lerp(y, Math.max(y, -X('FWYM', 1.2)), FWv) : y;      // (身体朝前: square to the nose at most, as alpine's; on a toe turn on top of the lean's own turn it went 35 deg past)
      yawC = K.ez && sec.pfDt > 0 ? K.ez(sec, 'byw', yF, X('YW', 9)) : yF;
      // (round 19 on the Mac: shoulders against hips sat at a fixed 15 deg all run, so the trunk turned as one block. Now the hips wind against
      // the chest with the turn and as the rider rolls: +-15 deg about the old)
      { const tw = X('TW0', SBT.TWIST) + X('TWL', 0.4) * clamp(lean, -1, 1) * (1 - air) + X('TWR', 0.08) * clamp(lrS, -3, 3) * (1 - air); yawP = yawC + (K.ez && sec.pfDt > 0 ? K.ez(sec, 'btw', tw, X('TWW', 10)) : tw); } }
    // (PRH, round 12 overnight 2026-11-24: on the heels the pelvis's own pitch is near nothing (the fold forward cancels the lean back), so its roll was
    // nothing too and the hips rode level; the owner's front hip is 5-14 deg lower through a fast heel turn (the pelvis, turned toward the nose,
    // leans with the legs). So PRH of the heel-side lean goes into that roll, eased (PRW): unEased, the hip line swung 340 deg/s at the edge change)
    const prh0 = tab && X('PRH', 0) ? X('PRH', 0) * 0.5 * (tilt - Math.sqrt(tilt * tilt + 0.01)) : 0, prh = prh0 && K.ez && sec.pfDt > 0 ? K.ez(sec, 'bprh', prh0, X('PRW', 8)) : prh0;
    const pbP = clamp(0.55 * fold + 0.85 * tilt, -1.2, 1.3), pb = basis(yawP, pbP, -0.08 * fa + (tab ? X('PRL', 0) * Math.sin(yawP) * Math.sin(pbP + prh) : 0));
    let t1 = basis((yawP + yawC) * 0.5, hinge, rollT), t2 = basis(yawC, up2, rollT * 0.8);
    // (真人表: the pitch and roll, in the chest's turned frame, that lay the trunk over by trA toward the toes and trB toward the nose)
    if (tab) { const tb = (y, a, b, r0) => { const th = Math.hypot(a, b), st = Math.sin(th), Yd = th > 1e-5 ? [-st * b / th, Math.cos(th), -st * a / th] : [0, 1, 0];
        const cy = Math.cos(y), sy = Math.sin(y), x1 = Yd[0] * cy + Yd[2] * sy, z1 = -Yd[0] * sy + Yd[2] * cy;
        return basis(y, -Math.asin(clamp(z1, -1, 1)), Math.atan2(x1, Yd[1]) + r0); };
      // (SRR, round 12 overnight 2026-11-24: the shoulder line rolls with the roll of the body, ahead of the board. In all three of the owner's clips
      // his front shoulder is 8-16 deg lower than the game's was as he rolls from the toes onto the heels (the leading shoulder dives into the heel
      // turn; the game's shoulder line followed a third of a turn late), by either way of measuring the snow under him (body_ruler.js, BOARDN).
      // Rolling onto the toes it is 6-10 deg higher by the mocap's own snow normal but not by the board-fitted one, so that way takes half (SRT))
      const srC = X('SRC', 3), sr0 = X('SRR', 0) * (X('SRS', 0) > 0 ? srC * Math.tanh(lrQ / srC) : clamp(lrQ, -srC, srC)) * (lrQ > 0 ? X('SRT', 1) : 1), sr = X('SRR', 0) ? (K.ez && sec.pfDt > 0 ? K.ez(sec, 'bsr', sr0, X('SRW', 40)) : sr0) : 0;
      t1 = tb((yawP + yawC) * 0.5, trA, trB, rollT + 0.5 * sr); t2 = tb(yawC, trA * 1.05 + 0.05, trB * 1.05, rollT * 0.8 + sr); }
    const oC = v3.mul(t1.Y, L.spine), oN = v3.add(oC, v3.mul(t2.Y, L.chest));
    // ---- 2 + 3 the hips: placed so that the centre of mass lies on the line leaned over from the board's edge, at the height the stance asks:
    // on the toes the hips come down 20 cm, knees well bent (carving video at 35-55 deg: knees ~95-105, hips ~60 cm off the board along its
    // normal); on the heels they come down only 20 cm: the low seat comes from the board standing up and the body laid over with it, not from
    // folding the knees (video at 45-65 deg: front knee 55-80, back 85-100, hips 70-80 cm off the board; hips still ~25 cm over the snow)
    let legL = tab ? Math.min(legD(smin(kTab[0], kTab[1], 8)), (L.thigh + L.shin) * 0.985) : (L.thigh + L.shin) * (0.97 + 0.02 * flat + 0.008 * stand), LEGMIN = 0.36, SM = 0.015 * (1 - 0.7 * stand);      /* (and facing forward the legs fold deeper, FWC of their length: "蹲的低一点", 22:13 UTC) */ if (tab && FWv > 0.001) legL = Math.max(LEGMIN + 0.02, legL * (1 - X('FWC', 0.4) * FWv));      // (legs let nearer straight on a flat board and at rest)
    let H = tab ? 1.60 - 0.13 * sat(p.lnd || 0) : 0.89 + (0.16 + 0.06 * stand) * flat - 0.30 * c * (1 - 0.7 * stand) - 0.05 * tuck - (0.15 + 0.05 * k) * hs * (1 - air) - 0.20 * ts * (1 - air) - 0.13 * sat(p.lnd || 0), pel, hipL, hipR;      // (p.lnd: a hard landing, the legs fold and take it, as the skier does: land b, 07_game.js)      // (straight running stood taller: round 1 sheets, 2026-11-22, knees 89 deg on a glide looked squatted)
    const kneeH = (sx) => v3.norm(fr(bb, sx, 0.25 + 0.35 * hs, -1 - 0.4 * ts));
    const KA0 = ALP() ? [-1.0, -0.5] : (() => { const kc = kTab ? smooth(60, 120, 0.5 * (kTab[0] + kTab[1])) : 0, a0 = 0.6 * kc, a = K.ez && sec.pfDt > 0 ? K.ez(sec, 'bka', a0, 8) : a0; const gs = tab && X('GRB', 1) > 0 ? X('KSG', 0) * Math.max(gM, smooth(0, 1, p.grabA || 0)) : 0; return [-0.25 - 0.3 * a - X('KSF', 0) * ts - gs, 0.25 + a + X('KSB', 0) * ts + gs]; })();      // (GRB: legs drawn up for a grab, the knees part, the front one toward the nose and the back one toward the tail, as a rider's do, so the hand goes down between them to the board, not through a thigh)
    const fwK = FWD(), KA = fwK > 0 ? [lerp(KA0[0], -1.0, fwK), lerp(KA0[1], -0.5, fwK)] : KA0;      // (身体朝前: the knees go toward the nose with the hips, as alpine's: turned with the hips over feet left where they were, the thighs met)      // (自由式, round 20: the knees part along the board as the legs fold past 60 deg, the back one most: deep in a crouch, for the hand on the snow or a stop, the thighs came together, 6-9 cm into each other) (硬鞋刻滑: the boots turned 50-55 deg toward the nose, the knees go that way too, the front one further, the back one tucked behind it)
    const kbt = (kn, hp, an, fb, lim, w, key) => { const n = v3.norm(v3.sub(an, hp)), q = v3.mad(hp, n, v3.dot(v3.sub(kn, hp), n)), r = v3.sub(kn, q), rho = v3.len(r); if (rho < 1e-4) return kn;
      const e1 = v3.mul(r, 1 / rho), e2 = v3.cross(n, e1), fx = fb.X, c0 = v3.dot(v3.sub(q, an), fx) / L.shin, a = rho * v3.dot(e1, fx) / L.shin, b = rho * v3.dot(e2, fx) / L.shin, R = Math.hypot(a, b), l0 = c0 + a;      // (the shin's sideways lean in the boot as the knee goes round its circle: c0 + a cos + b sin)
      const lt = Math.sign(l0) * smin(Math.abs(l0), lim, w), wr = x => Math.atan2(Math.sin(x), Math.cos(x)); let th = 0;
      if (Math.abs(lt - l0) > 1e-5 && R > 1e-5) { const ph = Math.atan2(b, a), ac = Math.acos(clamp((lt - c0) / R, -1, 1)), t1 = wr(ph + ac), t2 = wr(ph - ac); th = Math.abs(t1) < Math.abs(t2) ? t1 : t2;
        // (never round to the back of the leg: the knee stays within 66 deg of straight over the toes, or where it already was)
        const af = -v3.dot(e1, fb.Z), bf = -v3.dot(e2, fb.Z); if (Math.hypot(af, bf) > 1e-4) { const pf = Math.atan2(bf, af), M = Math.max(1.15, Math.abs(wr(-pf))); th = wr(pf + clamp(wr(th - pf), -M, M)); } }
      if (K.ez && sec.pfDt > 0) th = K.ez(sec, key, th, 20);
      return Math.abs(th) < 1e-5 ? kn : v3.add(q, v3.add(v3.mul(e1, rho * Math.cos(th)), v3.mul(e2, rho * Math.sin(th)))); };
    const kfl = (kn, hp, an, ymin) => { if (kn[1] >= ymin) return kn; const n = v3.norm(v3.sub(an, hp)), q = v3.mad(hp, n, v3.dot(v3.sub(kn, hp), n)), r = v3.sub(kn, q), rho = v3.len(r); if (rho < 1e-4) return kn;
      const e1 = v3.mul(r, 1 / rho), e2 = v3.cross(n, e1), R = Math.hypot(e1[1], e2[1]), h = (ymin - q[1]) / rho; if (R < 1e-5) return kn; const p0 = Math.atan2(e2[1], e1[1]), th = h >= R ? p0 : p0 - Math.sign(p0 || 1) * Math.acos(clamp(h / R, -1, 1));
      return v3.add(q, v3.add(v3.mul(e1, rho * Math.cos(th)), v3.mul(e2, rho * Math.sin(th)))); };      // (the knee turned about the hip-ankle line, the least it takes to bring it up to ymin)
    const up = v3.add(v3.mul(oC, 0.35), v3.mul(oN, 0.20));
    const E0 = O;
    for (let oi = 0; ; oi++) {
      for (let it = 0; it < (tab ? 40 : 12); it++) {
      const cy = 0.85 * H + up[1] + 0.15 * aM[1];
      const tz = -Math.tan(clamp(lean + (tab ? X('CB', 0) * eT : 0), -1.3, 1.3)) * Math.max(0.05, cy - E0[1]), tx = (tab ? -X('TXG', 0) * (1 - air) * clamp(gD[0] / Math.max(0.5, -gD[1]), -0.7, 0.7) * Math.max(0.05, cy - E0[1]) : 0) - 0.07 * fa + X('TXT', -0.05) * ts + X('TXB', 0) * hs + (tab ? X('TX0', 0) + (sideT === 'toe' ? X('TXK', 0.006) : X('TXH', 0)) * eT * (kTab[1] - kTab[0]) : 0);      // (真人表: the hips over the more bent leg; on a deep heel carve (past 35-55 deg) the other way: the owner's two knees there are within 8 deg of each other, 62-70 behind; ours bent the back one to 87-90, Mac round 9)
      // (真人表: the trunk's fold toward the nose is not all paid for by the hips going back: the owner's knees on a deep heel carve are within 8 deg of
      // each other; balanced in full, the hips sat over the back foot and bent the back knee to 85-90, Mac round 9)
      pel = [(tx - (tab ? lerp(0.4, 0, eT * hs) : 1) * up[0] - 0.15 * aM[0]) / 0.85, H, (tz - up[2] - 0.15 * aM[2]) / 0.85];
      hipL = v3.add(v3.mad(pel, pb.X, -L.hipW), v3.mul(pb.Y, -L.hipD)); hipR = v3.add(v3.mad(pel, pb.X, L.hipW), v3.mul(pb.Y, -L.hipD));
      const over = Math.max(v3.len(v3.sub(hipL, J.ankleL)), v3.len(v3.sub(hipR, J.ankleR))) - legL;
      // (and never folded past what a knee does: hips at least LEGMIN from each ankle, the knee then at about 135 deg; seated deep on the heels the
      // knee went to 151, scorer 2026-11-22)
      const under = LEGMIN - Math.min(v3.len(v3.sub(hipL, J.ankleL)), v3.len(v3.sub(hipR, J.ankleR)));
      if (under > 0.002) { H += under * 1.1; continue; }
      // (真人表: brought onto the table's leg length both ways. Leaned over, the hips' distance from the ankles grows about 1/cos(lean) per unit of
      // height, so a full step overshot and stopped low: knees 107-124 deg on a 50 deg carve, the owner's 57-93)
      if (tab) { if (Math.abs(over) < 0.0005) break; H -= over * 0.95 * Math.cos(clamp(lean, -1.2, 1.2)); continue; }
      if (over <= -SM) break; H -= (over >= SM ? over : (over + SM) * (over + SM) / (4 * SM)) * 1.1;
      }
      // (a knee is never under its own ankle: the shin at most ~86 deg off the snow's normal, the owner's own deepest (back shin, toe carve). Leaned
      // further than he rides, or crouched on a deep toe edge, the legs' fold put the shin past flat (96 deg, knee under the snow line); a rider that
      // far over has long legs, so the legs lengthen until the knee clears, overnight 2026-11-24)
      if (!tab || !(X('KFL', -9) > -1) || oi >= 3) break;
      const v = Math.max(J.ankleL[1] + X('KFL', -9) - K.ik2(hipL, J.ankleL, L.thigh, L.shin, kneeH(KA[0]))[1], J.ankleR[1] + X('KFL', -9) - K.ik2(hipR, J.ankleR, L.thigh, L.shin, kneeH(KA[1]))[1]);
      if (v < 0.001 || legL >= (L.thigh + L.shin) * 0.985) break; legL = Math.min(legL + 1.2 * v, (L.thigh + L.shin) * 0.985); }
    // (the hips are a body's heaviest part and do not jump: the place worked out above is where they are going, and they get there on a critically
    // damped path, about a sixth of a second. Without it the owner saw the legs pump and twitch while riding (2026-11-22, "腿一直在推进", "twitching"):
    // measured, the knee moved 4-7 deg a frame, 28 deg in four frames for a 9 deg change of lean, and hit its 135 deg limit with a kink)
    if (K.ez && sec.pfDt > 0) { const w = (tab ? X('PEW', 20) : 11) + 25 * air;      // (真人表: quicker, so the rise at an edge change shows near the crossing, as in both owner videos)
      pel = [K.ez(sec, 'bpx', pel[0], w), K.ez(sec, 'bpy', pel[1], w), K.ez(sec, 'bpz', pel[2], w)];
      hipL = v3.add(v3.mad(pel, pb.X, -L.hipW), v3.mul(pb.Y, -L.hipD)); hipR = v3.add(v3.mad(pel, pb.X, L.hipW), v3.mul(pb.Y, -L.hipD)); }
    // (真人表: and the eased hips never pull a leg straight: where a hip is further from its ankle than 0.94 of the leg, the hips come down toward
    // the feet by a soft amount (tanh, reaching 0.99 at most). With the ease alone the front knee snapped to straight and back, 16 deg in a frame,
    // on slow S-turns, 2026-11-23)
    if (tab) { const LL = L.thigh + L.shin, a0 = lerp(0.94, 0.975, stand) * LL, a1 = lerp(0.99, 0.997, stand) * LL;      // (standing, the legs near straight)      // (both legs each pass, summed, so the push never swaps from one leg's line to the other's)
      for (let it = 0; it < 2; it++) { let mv = [0, 0, 0];
        for (const [h, an] of [[hipL, J.ankleL], [hipR, J.ankleR]]) { const dv = v3.sub(h, an), dl = v3.len(dv); if (dl > a0) { const want = a0 + (a1 - a0) * Math.tanh((dl - a0) / (a1 - a0)); mv = v3.mad(mv, dv, -(dl - want) / dl); } }
        pel = v3.add(pel, mv); hipL = v3.add(hipL, mv); hipR = v3.add(hipR, mv); } }
    J.pelvis = pel; J.hipL = hipL; J.hipR = hipR;
    // ---- 4 the legs: knees always bend toward the toes (the hint is the board's toe side and a little up: it never turns behind the leg, so a knee
    // cannot fold backwards whatever the hips do), driven further forward on the toes; apart a little, as the bindings are turned out
    J.kneeL = K.ik2(hipL, J.ankleL, L.thigh, L.shin, kneeH(KA[0])); J.kneeR = K.ik2(hipR, J.ankleR, L.thigh, L.shin, kneeH(KA[1]));
    // (the boot holds the shin: it leans forward freely but sideways only some 12 deg (the scorer's H7; a stance wider than the hips already leans each
    // shin 5-10 deg in). Where the hips sit far over one foot or the legs fold deep, the knee turns out about the hip-ankle line until the shin is back
    // inside what a boot lets it do: was 15-21 deg at the worst moments of a stop, a tuck, moguls; overnight 2026-11-24)
    if (tab && X('KBT', 0) > 0) { J.kneeL = kbt(J.kneeL, hipL, J.ankleL, fbL, X('KBT', 0.2), 0.07, 'bkbL'); J.kneeR = kbt(J.kneeR, hipR, J.ankleR, fbR, X('KBT', 0.2), 0.07, 'bkbR'); }
    if (tab && X('KFL', -9) > -1) { J.kneeL = kfl(J.kneeL, hipL, J.ankleL, J.ankleL[1] + X('KFL', -9) - 0.02); J.kneeR = kfl(J.kneeR, hipR, J.ankleR, J.ankleR[1] + X('KFL', -9) - 0.02); }      // (and where the eased hips have not got there yet, the knee turns out along the board instead of going under)
    J.kneeRawL = J.kneeL; J.kneeRawR = J.kneeR;
    J.chest = v3.add(pel, oC); J.neck = v3.add(pel, oN);
    J.shL = v3.add(v3.mad(J.neck, t2.X, -L.shW), v3.mul(t2.Y, -L.shD)); J.shR = v3.add(v3.mad(J.neck, t2.X, L.shW), v3.mul(t2.Y, -L.shD));
    // (round 19, owner "肩膀也很僵硬": the shoulders are not two fixed points on a rigid chest: the inside one drops and comes forward as the rider
    // rolls into the turn, the outside one lifts; rolling out they come level again. Up to 5 cm)
    if (tab) { const sg = 0.035, ld = clamp(lean * 1.2, -1, 1) * (1 - air), dI = -sg * Math.abs(ld), dO = -0.35 * sg * Math.abs(ld);      /* (round 31: the owner's and the 3rd video's shoulders sink in a turn, 0.2-0.4 SW under the neck against our 0.1, the inside one 17-21 deg lower than the hips' line) */
      J.shR = v3.add(J.shR, [0, ld > 0 ? dI : dO, 0]); J.shL = v3.add(J.shL, [0, ld > 0 ? dO : dI, 0]); }
    if (tab && wB > 0) { const P = v3.add(J.shR, fr(bb, 0.05, 0, -0.10)), d = v3.norm(v3.sub(P, J.shR)); J.shR = v3.mad(J.shR, d, 0.03 * wB); }      // (round 19: and the back shoulder drops and reaches with that hand)
    // (owner 2026-11-23 "拐的比较大的时候 手应该是轻轻扶着地面": laid over further than his videos go (past 41-49 deg on the toes, carving), the back
    // arm straightens down to the snow under its shoulder, the shoulder drops 5 cm with it, and the palm rests on the snow once it reaches,
    // from about 50 deg. Up to there the arm only hangs toward the snow, as his does: at 40-45 deg the shoulder is 20 cm too high for a
    // relaxed arm to touch. Before, it hovered 8-10 cm up at the deepest: the hand's place was 43 cm off to the side of the shoulder,
    // further than the arm could reach down from there, overnight 2026-11-24)
    if (aTc > 0.001) J.shR = v3.add(J.shR, [0, -X('TCS', 0.05) * aTc, 0]);
    // (SCP, owner 2026-11-24 22:32 UTC "整个胳膊肩膀都非常的不自然": the shoulder joint stayed put on the chest whatever the arm did; his rises and
    // falls 6-8 cm and comes forward and back 13-24 cm against his neck (ours 1-3 and 6-18, b3/aliv.js). The shoulder blade goes with the arm:
    // raised and out with the upper arm lifted, forward with it reaching forward, back with it behind. From the arm's held direction last frame)
    if (tab && X('SCP', 2.5) > 0 && sec.barmc) for (const [kk, sk] of [['L', 'shL'], ['R', 'shR']]) { const st = sec.barmc[kk]; if (!st || !st.u || sec.pfN - st.n > 2) continue;
      const d = st.u.d, up = Math.acos(clamp(-d[1], -1, 1)), k = X('SCP', 2.5), sh0 = J[sk];
      let off = v3.add(v3.mul(t2.Y, k * (X('SCU', 0.06) * smooth(0.5, 1.9, up) - X('SCD', 0.015))), v3.mul(t2.Z, -k * X('SCF', 0) * clamp(-d[2], -1, 1)));
      if (K.ez && sec.pfDt > 0) off = [K.ez(sec, 'bsc' + kk + 0, off[0], 18), K.ez(sec, 'bsc' + kk + 1, off[1], 18), K.ez(sec, 'bsc' + kk + 2, off[2], 18)];
      // (only the shoulder's moving WITH its arm, not where it sits: his shoulders, like ours, sit where the body ruler has them on average (an
      // offset that stays moved the ruler's shoulder twist 0.73 -> 0.86). The slow mean of the offset (about 1.5 s) is taken off)
      if (X('SCZ', 1) > 0 && K.ez && sec.pfDt > 0) { const m = [K.ez(sec, 'bscm' + kk + 0, off[0], X('SCZW', 1.2)), K.ez(sec, 'bscm' + kk + 1, off[1], X('SCZW', 1.2)), K.ez(sec, 'bscm' + kk + 2, off[2], X('SCZW', 1.2))]; off = v3.sub(off, m); }
      J[sk] = v3.add(sh0, off); }
    // (round 29, owner 15:34 UTC: turning right "右手跟肩膀往外拐出来…不是正常的 angle": the two shifts above moved the shoulder joint itself, the
    // back one 10 cm away from the neck on every toe turn (0.20 -> 0.30 m), so the arm came out of a shoulder hanging off the body. A shoulder only
    // swings about the collarbone: the shifts are kept as that swing, the shoulder held at its own distance from the neck)
    if (tab) { const L0 = Math.hypot(L.shW, L.shD); for (const k of ['shL', 'shR']) { const d = v3.sub(J[k], J.neck), l = v3.len(d); if (l > 1e-4) J[k] = v3.mad(J.neck, d, L0 / l); } }
    // head: eyes nearer level than the body (a rider's head is the steadiest part), looking down the run over the front shoulder
    const yawH = -1.12 + 0.18 * ts - 0.15 * hs + (p.headYaw || 0) * 0.5 + (id ? id.hy : 0), hp = 0.10 + 0.08 * c + 0.22 * Math.max(tilt, 0) + (id ? id.hp : 0);      // (eyes kept near level: round 1 had the head hanging down at the snow on the toes)
    // (真人表, standing: the head upright and turned less, Mac round 3 2026-11-23: with the chest side-on and the head still turned 64 deg over the
    // front shoulder, its riding nod read as the head and neck tipped sideways downhill, 6-8 deg off the trunk)
    // (eased: 'stand' steps with the air flag, and raw the head turned 7-10 deg in a frame at take-offs and landings, Mac round 4)
    const sH = tab && K.ez && sec.pfDt > 0 ? K.ez(sec, 'bhst', stand, 6) : stand;
    let hb = tab ? basis(lerp(yawH, -0.80, sH) + X('HY0', 0) + X('HYL', 0) * clamp(lean, -1, 1), hp * (1 - 0.85 * sH) + X('HP0', 0), 0.04 * fa) : basis(yawH, hp, 0.04 * fa);
    // (the head rides in line with the trunk as it tips into the turn: its own up drawn HTR of the way to the chest's, the face kept where it looks)
    if (tab && X('HTR', 0) > 0) { const Y = v3.norm(v3.add(v3.norm(v3.lerp(hb.Y, t2.Y, X('HTR', 0) * (1 - 0.8 * sH))), [0, 0, -Math.tan(X('HHT', 0) * hs * (1 - air)) ])),      /* (HHT: on the heels the head goes a little further toward the toes than the chest, chin forward over the board: the owner's is 9-16 deg past his trunk there) */ Z0 = v3.sub(hb.Z, v3.mul(Y, v3.dot(hb.Z, Y))), Z = v3.norm(Z0), Xh = v3.cross(Y, Z); hb = { X: Xh, Y, Z }; }
    const nY = v3.norm(v3.add(t2.Y, hb.Y));
    J.skull = v3.mad(J.neck, nY, L.neck); J.head = v3.add(v3.mad(J.skull, hb.Y, L.head), v3.mul(hb.Z, -0.015));
    // ---- 6 the arms. Targets are given from each shoulder in a frame that leans with the body but does not turn with the chest (hl): x toward the
    // tail, y up the leaning body, z toward the heels. On the toes the turn's inside is the toe side (-z), on the heels the heel side (+z).
    const hl = basis(-0.30, tilt, 0), reach = (L.uarm + L.farm + L.grip) * (tab ? 0.99 : 0.98), w = 0.85 + 0.15 * k;
    // (真人表: and the arm's reach is a soft limit: near a straight arm the fist slows into it instead of stopping on a sphere round the shoulder.
    // Hard, the back fist, held out at full reach in slow turns, jolted 9-13 mm/frame² each time the shoulders turned under it, 2026-11-23)
    const RK = tab ? lerp(0.95, 0.97, stand) : 1,      // (standing, the arms hang near straight)
      rcl = (q, s0, rk = RK) => { const dq = v3.sub(q, s0), lq = v3.len(dq), r0 = rk * reach, r1 = reach - r0; if (lq <= r0 || lq < 1e-6) return q;
      return v3.mad(s0, dq, (r1 > 0 ? r0 + r1 * Math.tanh((lq - r0) / r1) : reach) / lq); };
    // (and the TARGET is held further in, before the ease: the eased fist then slows on its own path well short of a straight arm, instead of
    // running at 3 m/s into the limit above and stopping in two frames, 33 mm/frame^2 on fast linked turns, Mac round 3, 2026-11-23)
    const rclT = (q, s0, k = 0) => { if (!tab) return rcl(q, s0); const dq = v3.sub(q, s0), lq = v3.len(dq), top = lerp(1.0, 0.99, stand) * reach, r0 = lerp(0.80, 0.95, k) * reach, r1 = top - r0;      /* (k: a hand reaching down to rest on the snow may straighten its arm) */ if (lq <= r0 || lq < 1e-6) return q;
      return v3.mad(s0, dq, (r0 + r1 * Math.tanh((lq - r0) / r1)) / lq); };
    // (a fist never in the snow: its target kept 6 cm (a glove) over the real snow under it on c (sec.snowY), softly, before the ease; after it, 2 cm,
    // so the eased fist is not pushed about by every bump under it; 3 cm over the board's own height before)
    const offSnow = (q, fl = 0.06, w = 0.02, rel = 0, sink = 0) => { const sy = tab && sec.snowY ? Math.max(snY(q), O[1] - 0.03 - rel) - sink : null; if (sy == null) { const hy = q[1] - O[1]; if (hy < 0.03) q = [q[0], O[1] + 0.03, q[2]]; return q; }
      if (q[1] - sy >= fl + w) return q;      // (untouched: not even rounded, so the last pass below does not run the reach limit, which is not idempotent, a second time)
      return [q[0], sy + sfl(q[1] - sy, fl, w), q[2]]; };
    const rel = [-0.17, -0.60, -0.10], reb = [0.16, -0.60, 0.10];              // (straight running: loose, front hand over the front knee, the back one hanging
    // behind the back hip, not over the back thigh, where the forearm went into it)
    // (back hand, owner 2026-11-22 "胳膊一直在飞来飞去": it swung 82 cm up and down every edge change at up to 3.4 m/s, toe and heel targets far apart.
    // Now both sit out behind at about hip-to-chest height, the two 35 cm apart instead of 60, and it is eased slower than the front hand)
    const TOE_F = [-0.55, -0.10, -0.32], TOE_B = [0.50, -0.14 + 0.06 * k, 0.12], HEEL_F = [-0.55, -0.32, 0.20], HEEL_B = [0.50, -0.12 + 0.06 * k, -0.20];      // (heels: round 1 had the back arm straight up, a hand raised in class; it goes back and out over the toe side, as in the photos) (toes, round 2 vs the photo of a deep toe carve: the back arm went straight up; riders hold it out behind, about shoulder high)
    const DRAG_T = [-0.30, -0.62, -0.30], DRAG_H = [-0.36, -0.58, 0.26];      // (the front hand down by the snow on the inside)
    const AIR_F = [-0.45, 0.10, -0.05], AIR_B = [0.45, 0.12, 0.02];
    const mixA = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    // (an elbow is never folded tighter than about 95 deg in riding: the fist is kept at least ARM0 from the shoulder, pushed out along the line
    // from the shoulder, which grows from nothing so it is smooth)
    // (真人表: the shortest the arm gets. Every hand target sat inside it, so every elbow was held at the 131 deg this gives, skidding, carving,
    // all the same: owner 2026-11-23 "肩膀和手不够放松", Mac round 5 "肘角 131-136, 前四轮几乎没变". His elbows: 132-144 skidding, 144-154 carving.
    // So it opens with speed, and softly (a 4 cm band), not on a hard sphere)
    // (真人表, round 12: and through the turn by its timing, not only by the lean: on fast linked carves the lean sits at its peak from just after one
    // edge change to just before the next, so a schedule read from the lean alone held the arm at one length, front elbow 143-149 all run (the owner's
    // 120-155, arm_flow.json). The time since the last edge change, against the last turn's length, gives the arc: shortest at the edge change,
    // longest in the middle of the turn, read 0.15 s ahead for the eases behind it)
    let sPh = ld => sat(Math.sin(Math.PI * ld / 0.9));      /* (the very first frame, before there is a clock: what the next frame will give, or the arm jumped 2 cm into its second frame, Mac round 14) */ if (tab && sec.pfDt > 0) { const TP = sec.btp || (sec.btp = { c: 0, t0: 0, T: 0.9, sg: 0 }); TP.c += sec.pfDt;
      // (round 14, Mac round 13: and no two turns the same, nor the two arms in step: ours correlated 0.85-1.0 arm to arm, every turn one curve; the
      // owner's 0.2-0.65, each turn different, now and then one hand alone pulling in hard. So at each edge change each arm draws, from the turn's
      // number (no randomness: a replay is the same), how far it goes (0.5-1.1 of the swing), when (+-0.15 s), and about one turn in two one arm
      // pulls in once more somewhere in the middle)
      const hsh = k => { const x = Math.sin(TP.n * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
      TP.m = Math.max(TP.m || 0, Math.abs(lean));      // (how far this turn has leaned: the next one's trunk reads ahead no further than that)
      const sg = lean > 0.10 ? 1 : lean < -0.10 ? -1 : TP.sg; if (sg !== TP.sg) { const first = TP.sg === 0; if (!first) { TP.T = clamp(TP.c - TP.t0, 0.4, 2.5); TP.A = TP.m; } TP.m = Math.abs(lean); TP.sg = sg; TP.t0 = TP.c;
        if (!first) { TP.n = (TP.n || 0) + 1; TP.a = [lerp(0.5, 1.1, hsh(1)), lerp(0.5, 1.1, hsh(2))]; TP.d = [lerp(-0.15, 0.15, hsh(3)), lerp(-0.15, 0.15, hsh(4))];
        TP.pk = hsh(5) < 0.5 ? (hsh(6) < 0.4 ? 0 : 1) : -1; TP.pu = lerp(0.3, 0.7, hsh(7)); TP.pd = lerp(0.35, 0.7, hsh(8)); } }      // (not on the first: the figure's first frame took the draw as a jump, back fist 22 mm/frame^2 at 0.03 s, Mac round 14)
      sPh = (ld, ai) => { const u = (TP.c - TP.t0 + ld + (TP.d ? TP.d[ai] : 0)) / TP.T; let v = u < 1 ? Math.sin(Math.PI * u) : smooth(1, 1.6, u);      // (a turn held longer than the last opens again)
        if (TP.a) v = 1 - TP.a[ai] * (1 - v); if (TP.pk === ai) { const z = (u - TP.pu) / 0.13; v -= TP.pd * Math.exp(-z * z); } return sat(v); }; }
    // (round 13, Mac round 12: the two arms rose and fell together, one clean sine. The owner's do not: the back fist travels about half as far again as
    // the front (path 3.75 against 3.52 shoulder widths each edge change, elbow range 30-35 deg against 20-25) and moves later (its fastest 0.27 s after
    // the crossing, the front's 0.07 s before it). So each arm has its own: the back one wider and a tenth of a second behind)
    const sLn = smoother(0.0, 0.9 * lerp(0.75, 0.45, wSk), Math.abs(lean + 0.12 * lrS)), nA = 1 - Math.max(air, sat(tuck * 2)),
      sF = sPh(0.15, 0), sB = sPh(0.05, 1),
      aAir = ARMN && K.ez && sec.pfDt > 0 ? K.ez(sec, 'baair', air, X('AAW', 7)) : air, aSt = ARMN && K.ez && sec.pfDt > 0 ? K.ez(sec, 'bast', stand, 7) : stand, aWT0 = Math.max(smooth(0.15, 0.6, tuck), chE) * (1 - aAir), aWT = ARMN && K.ez && sec.pfDt > 0 ? K.ez(sec, 'bawt', aWT0, 8) : aWT0,      // (the arms' own air and crouch, eased: on a run of small hops the flag flips every third of a second and the arms were thrown out and back with it, elbow jolts x4)
      aSn = side => { const s = clamp((lean + (side < 0 ? X('TLF', 0.15) : X('TLB', 0.05)) * TS * lrS) / 0.87, -1.3, 1.3) * (1 - aAir), sp = 0.5 * (s + Math.sqrt(s * s + 0.02)); return [sp, sp - s]; },
      avH = (() => { const VS = sec.bavr || (sec.bavr = { s: 0, n: 0 }); if (X('AVR', 1.2) > 0 && sec.pfN !== VS.f) { VS.f = sec.pfN; const sg = lean > 0.12 ? 1 : lean < -0.12 ? -1 : VS.s; if (sg !== VS.s) { VS.s = sg; VS.n++; } }
        return (side, k) => { if (!(X('AVR', 1.2) > 0)) return 0; const x = VS.n * 0.6180339887 + k * 0.4142135624 + (side < 0 ? 0 : 0.2360679775); return X('AVR', 1.2) * (1 - aWT) * (1 - aAir) * (2 * (x - Math.floor(x)) - 1); }; /* (an evenly spread sequence, not a random one: over any few turns it averages out, so the held arm is not biased one way for a whole run) */ })(),      // (AVR: each arm's way of being held, new at each edge change, see the hand rules)
      aFx = side => { const sn = aSn(side)[1], b = clamp(X('FX0', 34) + X('FXD', 10) * sat(-lrS / 2.5) * (1 - sat(sn)) * (1 - aAir) + X('FXT', 22) * aWT + X('FXA', 8) * aAir - X('FXS', 8) * aSt + X('AVE', 30) * avH(side, 3), 12, 80) * Math.PI / 180; return b; },      // (the elbow's bend, deg from straight)
      aRc = fx => Math.sqrt(L.uarm * L.uarm + (L.farm + L.grip) * (L.farm + L.grip) + 2 * L.uarm * (L.farm + L.grip) * Math.cos(fx)),
      AFr = ARMN ? aRc(aFx(-1)) : tab ? lerp(0.52, 0.585, Math.min(sF, lerp(0.4, 1, sLn)) * nA * (ALP() ? 0.45 : 1)) : 0.46, ABr = ARMN ? aRc(aFx(1)) : tab ? lerp(0.51, 0.59, Math.min(sB, lerp(0.4, 1, sLn)) * nA * (ALP() ? 0.45 : 1)) : 0.46,
      ARMF = tab && K.ez && sec.pfDt > 0 ? K.ez(sec, 'barmF', AFr, 12) : AFr, ARMB = tab && K.ez && sec.pfDt > 0 ? K.ez(sec, 'barmB', ABr, 12) : ABr, ARM0 = ARMF, AW = 0,
      open = (sh, t, A = ARM0) => { const d = v3.sub(t, sh), l = v3.len(d); if (l < 1e-4) return t; const l1 = AW > 0 ? (l >= A + AW ? l : l <= A - AW ? A : A + (l - A + AW) * (l - A + AW) / (4 * AW)) : Math.max(l, A); return l1 !== l ? v3.mad(sh, d, l1 / l) : t; },
      ARMIN = tab ? 0.508 : ARM0;      // (真人表: the owner's elbows go to 118-124 deg in every turn (arm_flow.json): this is the elbow at about 118)
    let sntW = 0, sntO = 0;      // (how far the back hand is on its snow rules, SNT, and how far under the snow's own line the line it rides is: the wrist pass below reads them)
    const ARMC = !!(tab && X('ARMC', 1) > 0 && K.ez && sec.pfDt > 0);      // (the arm driven by its muscles, owner 2026-11-24 19:31: below, at the eased fist)
    const hand = (side, g) => {
      const sh = side < 0 ? J.shL : J.shR, F0 = side < 0, f = F0 ? 1 : 0, A0 = F0 ? ARMF : ARMB, dF = tab && !(ALP() && X('ALD', 1) > 0) ? Math.max(F0 === (sideT === 'heel') ? deep * (1 - 0.5 * wSk) : 0, F0 ? 0 : Math.max(aTc, wD * (ARMN ? smooth(X('DF0', 0.5), X('DF1', 0.85), lean + 0.33 * lrS) : 1))) : 0;
      // (SNT, 2026-11-24, owner 16:07 UTC "手可不可以更自然一点，现在摸雪的动作还不是连贯很janky". Read frame by frame (21 touches in the 17 states), the back
      // hand on a toe turn was a stick hung from the shoulder: the fist 59 cm under it whatever the shoulder did, so it met the snow at the shoulder's
      // own sinking speed (1.1-1.4 m/s); once down, the passes kept the arm's length and swung it about the shoulder, and from a hanging arm that is
      // all sideways: 24-43 cm toward the tail in 0.15 s as the shoulder came down another 6-19 cm (a bump in the bowl), the elbow 36-58-33 deg; and
      // what let it down (dF) breathed with the lean, so in a held carve it touched two or three times. A real hand on the snow (two toe carves of the
      // reference folder, frame by frame) comes down over 0.5-1 s, rides the snow through the whole turn and leaves last.
      // So the hand that is going down to the snow keeps its place along and across the board (the eased fist's own) and takes its HEIGHT from the
      // snow, where the eased fist is known, below:
      //  - wIh, the going down itself, is held: once on, it stays while the rider stays laid over and is not rolling out, whatever dF does;
      //  - the arm is then what lies between the shoulder and the snow: the elbow folds as the shoulder comes down on the hand and opens as it
      //    rises, a hand riding the snow over a bump, nothing sliding (deep down, under SND0 m, the hand also moves out from under the shoulder, from nothing);
      //  - out of reach the fist hangs at the arm's own length (a little longer while it reaches, to R), and it comes onto the snow softly: over a
      //    band that grows with how fast the shoulder is closing (SNTAU s of it, SNC0-SNC1 m), so a quick dip of the body brushes the snow or
      //    stops short of it instead of stabbing, and a held carve, closing slowly, loses no reach;
      //  - all of it only where the snow is within about a hand of the arm's reach (SNG0-SNG1): higher up nothing changes, and the owner's own riding
      //    (his hands never come within 18 cm of the snow) is the fitted arm as before.
      // wTch is its weight; the eased fist is told where the hand really is, so that letting go is one path)
      let wTch = 0, wIh = 0, lTg = 0, snO = 0;
      const SNTon = !!(tab && !F0 && ARMN && !ALP() && X('SNT', 0) > 0 && snY && K.ez && sec.pfDt > 0), ES = sec.ez || (sec.ez = {}), pv = k => { const q = ES[k]; return q ? (q.n === sec.pfN ? q.b[0] : q.o[0]) : 0; };
      if (SNTon) { const pI = pv('bsti'),
          hold = smooth(0.5, 0.9, pI) * smooth(X('SNL0', 0.45), X('SNL1', 0.62), lean) * smooth(X('SNR0', -2.4), X('SNR1', -1.2), lrS) * (1 - air) * (1 - sat(tuck * 2)) * (1 - smooth(0.6, 0.95, wSk)) * (1 - stand),
          w0 = Math.max(dF * smooth(X('SNP0', 0.76), X('SNP1', 0.8), (p.lean || 0) * (1 - air)), hold); wIh = K.ez(sec, 'bsti', w0, w0 > pI ? X('SNWI', 14) : X('SNWO', 7)); }      // (started only past the owner's own deepest lean, 0.748 rad of the pose's in his three clips, as the trunk's TDK: there the hand was moved 3.4 cm in his fast clip. Once on, held as above)
      const wTp = SNTon ? pv('bstw') : 0;      // (last frame's weight: the floors and the eased fist's own snow rules below are set before this frame's is known)
      const rcH = (q, s0) => rcl(q, s0, wTch > 0 ? lerp(RK, Math.max(RK, X('SNRR', 0.975)), wTch) : RK);      // (a hand on the snow may straighten its arm to R)
      const dFl = Math.max(wTp, tab && X('SFE', 0) > 0 && K.ez && sec.pfDt > 0 ? Math.max(dF, K.ez(sec, 'bdfl' + f, dF, X('SFE', 0))) : dF),      /* (SFE, round 13: what lets a hand down to the snow lets go slowly. The back hand's dF reads the lean a third of a second ahead, so as a deep toe turn is released it falls from 1 to 0 in three or four frames; the floor under the hand (3 cm under the board's centre, let down SFR m by dF) came back up 30 cm in those frames and threw the hand that had just reached the snow, 1-2 cm in one frame (tuck, 34 m/s, 17.7 s; found with SFR off: no jolt). Now it comes back over about half a second, no faster than a hand moves; coming down is not delayed (never under dF itself)) */
        sfR = X('SFR', 0) * dFl, sfW = ALP() ? 0 : X('SFW', 0) * dFl,      /* (not alpine: its hand is drawn straight on from the forearm, no wrist pass) */
        snk = q => { if (!(sfW > 0)) return 0; const dq = v3.sub(sh, q), lq = v3.len(dq); return Math.min(sfW, Math.max(0, L.grip * clamp(lq > 1e-4 ? dq[1] / lq : 0, 0, 1) - 0.03)); };      // (dF: how far the inside hand may come down to rest on the snow)
      // (sfR: the floor under a hand is the real snow under it, or 3 cm under the board's CENTRE, whichever is higher. The second is there for the air.
      // On a 55-60 deg edge the centre stands 11 cm over the snow, so the hand that was meant to rest on the snow hung 8-11 cm above it in every deep
      // carve. The more the hand is meant to be down (dF), the further that second floor is let down, and the real snow under the hand is the floor)
      // (snk: and what rests on the snow is the HAND, not the fist the arm is solved for. That fist is the forearm's line run on a hand's length; the
      // drawn hand bends flat at the wrist near the snow (the wrist pass below). So a fist held 3 cm over the snow drew a flat hand 7-10 cm over it,
      // wrist at 10. For a hand meant to rest (dF), the fist may go up to SFW m under the snow line, never so far that the wrist comes under 3 cm)
      // (真人表: the elbow points out along the board and a little up, not back toward the heels: with the back hand reaching across to the toe side
      // the old pole put the elbow by the back hip and the forearm through the thigh, scorer 2026-11-22, 5.5 cm at a fast heel-carve take-off)
      let PO = tab ? fr(hl, side * 1.0, 0.1, 0.2) : fr(hl, side * 0.7, -0.25, 0.6);
      let o = F0 ? rel : reb;
      o = mixA(o, (F0 ? TOE_F : TOE_B).map(x => x * w), ts);
      o = mixA(o, (F0 ? HEEL_F : HEEL_B).map(x => x * w), hs);
      if (F0) o = mixA(o, ts > hs ? DRAG_T : DRAG_H, deep * (0.6 + 0.2 * k));
      o = mixA(o, F0 ? AIR_F : AIR_B, air * (1 - gM));
      // (tucked: the front hand reaches forward and down over the front knee, the back one low beside the back knee. It used to be drawn in to the
      // chest by 18 cm, and the back arm folded up into a chicken wing at the shoulder, elbow 47-73 deg: the owner's screenshot 2026-11-22)
      o = v3.add(o, v3.mul(side < 0 ? [-0.10, -0.14, -0.12] : [0.24, -0.16, 0.10], tuck));
      let t = v3.add(sh, fr(hl, o[0], o[1], o[2]));
      if (tab) {      // (真人表: the hand where the owner's video has it, from the pelvis; air, tuck and grabs still take it as before)
        const kh = F0 ? 'hF' : 'hB', h = tab ? lerp3(SBT.flat[kh], mb(sideH, kh, wSk, lerp3), eH) : lerp3(SBT.flat[kh], mb(sideT, kh, wSk, lerp3), eT), SW = SBT.SW;
        // (真人表: and through the turn the arms go with it: rolling toward the toes they reach that way, toward the heels the other, the front hand a little
        // forward as it leads. Driven by how fast the lean is changing (no spring): still when the turn is held, moving whenever the rider rolls)
        if (tab) { const hs0 = lerp3(h, SBT.stand[kh], stand); h[0] = hs0[0]; h[1] = hs0[1]; h[2] = hs0[2]; }
        if (tab) { const r = clamp(lrS, -4, 4) * (1 - air), g = ALP() ? X('ALR', 0.2) : 1.8;      /* (硬鞋刻滑: "minimum use of arms": the hands stay forward and level through the roll. At 1.8 the back hand swung 1.2 shoulder widths each edge change, up over the head, owner 2026-11-24 18:56 "为什么胳膊还在打转") */ h[1] += 0.16 * g * r; h[0] += (F0 ? 0.10 : -0.06) * g * Math.abs(r); h[2] -= 0.06 * g * Math.abs(r); }      /* (round 19, owner "胳膊还是很僵硬": the arms answer the roll 1.8 x as much) */
        // (the table's 'across' and 'up' are measured in the plane tilted with the body, up = ankles to pelvis: on a 60 deg heel carve 'up' leans 60 deg
        // toward the heels. Read in the world's up, the back hand went down onto the back knee, the scorer 2026-11-22, 3.1 cm into the thigh)
        const am = v3.mul(v3.add(J.ankleL, J.ankleR), 0.5); let la = -(pel[2] - am[2]), lu = pel[1] - am[1]; const ln = Math.hypot(la, lu) || 1; la /= ln; lu /= ln;
        const ac = h[1] * lu + h[2] * la, up = -h[1] * la + h[2] * lu;      // (T = (lu, -la), L = (la, lu) in (toe, up))
        let tT = v3.add(pel, [-h[0] * SW, up * SW, -ac * SW]);
        // (round 16, owner "肩膀和胳膊要配合": and the arms go round with the chest as it turns back against the skid: placed from the hips alone, the hands
        // stayed with the board while the shoulders turned away from it)
        { const a = -(sec.bdy || 0), ca = Math.cos(a), sa = Math.sin(a), o = v3.sub(tT, pel); tT = v3.add(pel, [o[0] * ca - o[2] * sa, o[1], o[0] * sa + o[2] * ca]); }
        // (round 38, owner 2026-11-24 "手在空中乱挥乱舞" and the overnight run: ONE arm rule for every state, written the way an arm hangs: the upper arm
        // from the shoulder along the body's own 'down' (between the slope's normal and gravity), swung across the board with the lean as the owner's
        // are (tools/motion/board_refs/body_ranges.json): on the toes the front arm lies back along the leaning body and the back arm hangs straight
        // to the snow; on the heels both come forward toward the toes, the back one out toward the tail too, 60-70 deg up. The forearm bends from it
        // toward the chest's front. Standing, the air, a crouch only change the same few numbers; nothing is posed from the chest or the hips, so
        // nothing they do can throw a hand about)
        if (ARMN) { const sm = v3.mul(v3.add(J.shL, J.shR), 0.5), dTr = v3.mul(t2.Y, -1), dn0 = v3.norm(v3.lerp(v3.norm(v3.lerp([0, -1, 0], gD, lerp(X('ARG', 0.25), 1, aSt))), dTr, ARMC ? X('ACH', 0) * (1 - aSt) : 0)),
            hz = (v, fb) => { const q = v3.sub(v, v3.mul(dn0, v3.dot(v, dn0))), l = v3.len(q); return l > 0.05 ? v3.mul(q, 1 / l) : fb; },
            Tb = hz([0, 0, -1], [0, 0, -1]), Oc = v3.norm(v3.sub(sh, sm)), Oh = hz(Oc, [side, 0, 0]), Fc = v3.mul(t2.Z, -1), Fh = hz(Fc, Tb),
            [sp, sn] = aSn(side), va = sec.btp && sec.btp.a ? lerp(0.9, 1.06, (sec.btp.a[F0 ? 0 : 1] - 0.5) / 0.6) : 1, wS = aSt, wT = aWT;
          // (ABQ, round 13 overnight 2026-11-24: how far the back arm swings out toward the tail on a heel turn does not grow evenly with the lean. In
          // the owner's slow, shallow turns it stays by the body (15-20 deg out from his own shoulder line, where the game's was 30), in his fast ones
          // it goes out 40-47 deg (the game's 33-35). So the swing comes in over the later part of the heel lean (ABQ0..ABQ1 of it) and stops growing
          // there. Measured against his own chest, which does not depend on the snow under him; a lead in time instead (the arm out before the edge
          // change) made the two fast clips better and the slow one worse, and is not in)
          let cO = F0 ? X('AF0', 0.23) + X('AFT', 0.15) * sp + X('AFH', 0.27) * sn : X('AB0', 0.32) + X('ABT', -0.06) * sp + (X('ABQ', 0) > 0 ? X('ABQ', 0) * smooth(X('ABQ0', 0.4), X('ABQ1', 0.95), sn) : X('ABH', 1.0) * sn),
            cF = F0 ? X('FF0', 0.16) : X('FB0', 0.21), cT = (F0 ? X('TFT', 0) * sp + X('TFH', 0.6) * sn : X('TBT', 0) * sp + X('TBH', 1.11) * sn) * va * (1 - 0.5 * wS),
            wTr = (F0 ? X('WTF', 0.85) : X('WTB', 0.15)) * smooth(0, X('WTW', 0.45), sp) * (1 - wT) * (1 - aAir);      // (how far the arm lies along the trunk itself: the front arm all through a toe turn, the hand by the front hip)
          // (AVR, owner 2026-11-24 22:33 UTC "非常僵硬": the same lean gave the same arm every turn, the elbow inside 10-15 deg (his 30-44, 114-159,
          // moving at up to 130-160 deg/s, little of it tied to the lean, the trunk's turn or its pitch: tools b4/corr.py). A rider does not hold his
          // arms the same way twice: at each edge change each arm takes a new way to be held (out, forward, elbow) inside his spread, and the muscles
          // take it there; no noise frame to frame)
          cO += X('AVO', 0.25) * avH(side, 1); cF += X('AVF', 0.3) * avH(side, 2);
          cO = lerp(cO, X('AS0', 0.24), wS) + X('AAO', 0.45) * aAir + X('ALND', 0) * lndE + (g < 0.1 ? 0.35 * gM * aAir : 0); cF = lerp(cF, X('AS1', 0.0), wS) + X('AAF', 0.15) * aAir;
          cO = lerp(cO, X('ATO', 0.22), wT); cF = lerp(cF, X('ATF', 0.8), wT); cT = lerp(cT, 0, wT);
          let ua = v3.norm(v3.add(v3.add(v3.norm(v3.lerp(dn0, dTr, wTr)), v3.mul(Oh, cO)), v3.add(v3.mul(Fh, cF), v3.mul(Tb, cT))));
          // (and never into the body: not across the chest's middle by more than a few degrees, not behind the back)
          { let c = v3.dot(ua, Oc); if (c < -0.1) ua = v3.norm(v3.mad(ua, Oc, -0.1 - c)); c = v3.dot(ua, Fc); if (c < -0.3) ua = v3.norm(v3.mad(ua, Fc, -0.3 - c)); }
          const fx = aFx(side), bd = v3.add(v3.add(Fc, v3.mul(Oc, -X(F0 ? 'ABIF' : 'ABIB', X('ABI', 0.3)) * (1 - 0.7 * wS))), v3.mul(dn0, -(X(F0 ? 'ABUF' : 'ABUB', X('ABU', 0.25)) * (1 - 0.7 * wS) + 0.4 * wT))), b0 = v3.sub(bd, v3.mul(ua, v3.dot(bd, ua))), b = v3.len(b0) > 1e-4 ? v3.norm(b0) : Tb,
            fv = v3.add(v3.mul(ua, Math.cos(fx)), v3.mul(b, Math.sin(fx))), el = v3.mad(sh, ua, L.uarm), wr = v3.mad(el, fv, L.farm + L.grip);
          tT = wr;
          const pl = v3.sub(el, v3.mul(v3.add(sh, wr), 0.5)); if (v3.len(pl) > 1e-4) { let q = v3.norm(pl); if (K.ez && sec.pfDt > 0) { const kp = F0 ? 'bpoF' : 'bpoB'; q = v3.norm([K.ez(sec, kp + 0, q[0], 8), K.ez(sec, kp + 1, q[1], 8), K.ez(sec, kp + 2, q[2], 8)]); } PO = q; } }
        // (round 28, the arm layer rebuilt, owner 2026-11-23 15:15 UTC picked it: "胳膊还是很僵硬". The hands and elbows are now posed in the CHEST's
        // frame from the owner's own arms, measured by turn phase on the Mac (tools/motion/board_refs/arm_phases.txt, both videos averaged): his elbows
        // hang 0.7 shoulder widths under the shoulders all through the turn and the front hand rides at the hip; ours were held up at chest height,
        // which is what read as stiff. Frame: origin mid-shoulders, U pelvis -> shoulders, A back ankle -> front ankle (nose), T toward the toes.
        // Key poses [A, T, U] in shoulder widths, wrist then elbow: edge heel->toe, toe mid, edge toe->heel, heel mid)
        if (!ALP() && !ARMN) { const wN = 1 - sat(tuck * 1.5);      /* (round 37, owner 2026-11-24 "一划起来，他2只手就在空中乱挥乱舞": the arm layer held only riding; standing, starting off and in the air the old targets threw the back hand over the head (179 deg in the air, 77 starting). Now every state takes it; a tuck and a crouch have their own just below, grabs still take the hand to the board) */
          if (wN > 0.01) { const AP = F0 ? ARM_F : ARM_B, sm = v3.mul(v3.add(J.shL, J.shR), 0.5), U = v3.norm(v3.sub(sm, pel)), a0 = v3.sub(J.ankleL, J.ankleR), A = v3.norm(v3.sub(a0, v3.mul(U, v3.dot(a0, U))));
            let T = v3.norm(v3.cross ? v3.cross(U, A) : [U[1] * A[2] - U[2] * A[1], U[2] * A[0] - U[0] * A[2], U[0] * A[1] - U[1] * A[0]]); if (v3.dot(T, hl.Z) > 0) T = v3.mul(T, -1);
            const sw = v3.len(v3.sub(J.shL, J.shR)) || SW, ed = sec.bArmD != null ? sec.bArmD : 0.5, mid = sideH === 'toe' ? AP[1] : AP[3], P = (k) => [0, 1, 2].map(c => lerp(lerp(AP[2][k][c], AP[0][k][c], ed), mid[k][c], eH));
            const W = (q) => v3.add(sm, v3.add(v3.mul(A, q[0] * sw), v3.add(v3.mul(T, q[1] * sw), v3.mul(U, q[2] * sw))));
            const p0 = P(0); if (F0) p0[0] += 0.35; /* (the front fist 0.35 out past the front hip: at the owner's own place it sat on our more bent front thigh, forearm 9-12 cm in, and the clearance threw the arm about) */ const wr = W(p0), el = W(P(1));
            tT = v3.lerp(tT, wr, wN);
            const pl = v3.sub(el, v3.mul(v3.add(sh, wr), 0.5)); if (v3.len(pl) > 1e-4) { let q = v3.norm(pl); if (K.ez && sec.pfDt > 0) { const kp = F0 ? 'bpoF' : 'bpoB'; q = v3.norm([K.ez(sec, kp + 0, q[0], 8), K.ez(sec, kp + 1, q[1], 8), K.ez(sec, kp + 2, q[2], 8)]); } PO = v3.norm(v3.lerp(PO, q, wN)); } { const ch = v3.mul(v3.add(J.shL, J.shR), 0.5), ou = v3.sub(sh, ch); ou[1] = 0; if (v3.len(ou) > 1e-4) PO = v3.norm(v3.add(PO, v3.mul(v3.norm(ou), (F0 ? 0.9 : 0.45) * wN))); } PO = v3.norm(v3.add(PO, v3.mul(U, -ELD * wN))); } }      /* (round 35, owner "胳膊好像吊在肩膀上…跟脱臼了一样": the elbow bent (125-135, his 127-142) and pointing down the body, so the upper arm hangs near the trunk and the forearm comes forward, instead of a straight arm held out sideways from the shoulder's point) */      /* (round 32: and the elbow points out from the body, so the forearm folds back in under it: the owner's and the 3rd video's forearms fold in 2-23 (up to 48) deg, ours kinked out 19-28 deg on heel turns and edge changes, Mac r31) */      /* (the elbow's direction eased, w 8: raw, it turned with every wrist target and the elbow jolted) */
        if (!ARMN && F0 && sideT === 'toe') tT = v3.lerp(tT, v3.add(sh, fr(hl, DRAG_T[0], DRAG_T[1], DRAG_T[2])), deep * (1 - wSk));      // (deep on the toes the front hand goes down to the snow)
        // (round 16, owner "拐的比较大的时候 手应该是轻轻扶着地面": deep in a turn the inside hand (the back fist on the toes, the front on the heels)
        // comes down to rest lightly on the snow: before, at the deepest it still hung 16-45 cm above it)
        if (!ARMN && !F0 && wD > 0.01 && sec.snowY) { const sl = v3.norm(v3.sub(J.shR, J.shL)), Ud = v3.norm(v3.sub(v3.mul(v3.add(J.shL, J.shR), 0.5), pel)), Td0 = v3.cross(Ud, sl), Td = v3.dot(Td0, hl.Z) > 0 ? v3.mul(Td0, -1) : Td0, dC = v3.norm(v3.add(v3.add(v3.mul(Ud, -1), v3.mul(v3.norm(Td), DRT)), v3.mul(sl, DRS))), dW = v3.norm(v3.add(v3.add(v3.mul(sl, 0.7), fr(bb, 0, 0, -0.45)), [0, -1, 0])), P = v3.add(J.shR, v3.mul(v3.norm(v3.lerp(dW, dC, DRM)), (L.uarm + L.farm + L.grip) * 0.92));      /* (round 34, owner "胳膊现在完全放飞了": the drag arm set in the chest's own frame, down the body and out to the toe side, 40-50 deg from hanging as in both his videos (31-50, 75 at most); aimed down the world to the snow, from a chest folded over a deep toe carve it stood out 100-127 deg, above the shoulder) */      /* (round 32: along the shoulder line, carried on down to the snow, as in the 3rd video; straight down from a chest folded over a deep toe carve the arm went back behind the body, 121-127 deg from hanging) */ tT = v3.lerp(tT, P, wD); }      /* (round 31: the arm reaches straight on from the shoulder, down and a little out to the toe side, the shoulder line carried on to the snow (owner's 3rd video); the snow passes lay the palm on it where it reaches. r29's point on the snow under the shoulder followed every bump of the ground: the back arm jolted 3x more on hops and rollers, Mac r29) */
        if (!ARMN && !F0 && wD > 0.01) { PO = v3.norm(v3.lerp(PO, fr(hl, 1.0, 0.25, 0), wD)); const ch = v3.mul(v3.add(J.shL, J.shR), 0.5), ou = v3.sub(sh, ch); ou[1] = 0; if (v3.len(ou) > 1e-4) PO = v3.norm(v3.add(PO, v3.mul(v3.norm(ou), 0.45 * wD))); }      // (and the elbow points back toward the tail while the arm hangs to the snow: from the posed elbow the pole lay along the hanging arm and the elbow flipped, 10 jolts a run)
        if (ARMN && !F0 && aTc > 0.001 && snY) { const P = [sh[0] + X('TCX', 0.12), 0, sh[2] + X('TCZ', 0)]; P[1] = snY(P) + 0.03 - snk(P); tT = v3.lerp(tT, P, aTc); }      // (the resting place: on the snow under the back shoulder, a little toward the tail)
        // (ALC, 硬鞋刻滑, owner 2026-11-24 18:56 UTC "为什么胳膊还在打转？！": the alpine arms took the freestyle rules (the hands in the legs' leaning
        // frame, the back hand dragged to the snow by the toe-turn drag, its elbow pole swung by it), so the back arm went from hanging on a heel turn
        // to 114-120 deg up on a toe turn, 85-100 deg every edge change, and its elbow flipped. Hardboot carvers ride with "minimum use of arms":
        // both hands forward of the chest, level, either side of it, elbows bent and down, the same on both edges; deep in a carve the inside hand
        // only comes lower toward the snow (the back hand on the toes, the front on the heels). So here the hands are held in the CHEST's own frame
        // (U pelvis -> shoulders, A back ankle -> front ankle, T toward the toes), in shoulder widths from mid-shoulders, eased)
        if (ALP() && X('ALC', 1) > 0) { const sm = v3.mul(v3.add(J.shL, J.shR), 0.5), U = v3.norm(v3.sub(sm, pel)), a0 = v3.sub(J.ankleL, J.ankleR), A = v3.norm(v3.sub(a0, v3.mul(U, v3.dot(a0, U))));
          let T = v3.norm(v3.cross(U, A)); if (v3.dot(T, hl.Z) > 0) T = v3.mul(T, -1);
          const sw = v3.len(v3.sub(J.shL, J.shR)) || SBT.SW, inS = F0 ? (sideH === 'heel' ? 1 : 0) : (sideH === 'toe' ? 1 : 0), dq = inS * smooth(X('ALD0', 0.45), X('ALD1', 0.9), Math.abs(lean)) * (1 - air),
            q = F0 ? [X('ALFA', 0.5), X('ALFT', 0.7), X('ALFU', -1.15)] : [X('ALBA', -0.7), X('ALBT', 0.6), X('ALBU', -1.4)];
          q[2] -= X('ALDU', 0.55) * dq; q[1] += X('ALDT', 0.15) * dq;
          { const lt = smooth(X('ALT0', 0.15), X('ALT1', 0.85), lean) * (1 - air); q[2] += X('ALTU', 0.8) * lt; q[1] -= X('ALTT', 0.2) * lt; }      // (laid over toward the toes the chest faces the snow: the hands are held higher in front of it, ahead of the snow, instead of meeting it and being shoved up)
          let w = v3.add(sm, v3.add(v3.mul(A, q[0] * sw), v3.add(v3.mul(T, q[1] * sw), v3.mul(U, q[2] * sw))));
          if (K.ez && sec.pfDt > 0) { const kq = F0 ? 'balF' : 'balB', o = v3.sub(w, sm); w = v3.add(sm, [K.ez(sec, kq + 0, o[0], 10), K.ez(sec, kq + 1, o[1], 10), K.ez(sec, kq + 2, o[2], 10)]); }
          // (deep on the toes the chest lies toward the snow and a hand held forward of it is under the snow: the clearance then shoved it up and out, 0.8
          // shoulder widths each toe turn. Brought back along its own line from the shoulder instead, so it rests on the snow where it meets it)
          if (snY) { const sy = q => snY(q) + 0.03 - snk(q); if (w[1] < sy(w)) { let lo = 0.25, hi = 1; for (let i = 0; i < 8; i++) { const m = 0.5 * (lo + hi), qm = v3.lerp(sh, w, m); if (qm[1] < sy(qm)) hi = m; else lo = m; } w = v3.lerp(sh, w, lo); } }
          tT = w; const ou = v3.norm(v3.sub(sh, sm)); PO = v3.norm(v3.add(v3.add(v3.mul(ou, 1.0), v3.mul(U, -X('ALPU', 0.3))), v3.mul(T, -X('ALPT', 0.2)))); }      // (the elbow out to the side, a little down and back: pointed down along the hand's own line it had no side to bend to and flipped)
        // (owner 2026-11-24 20:27 UTC, holding accelerate (FWv): "手应该就是收着的，然后在两边呀…甚至…手背到后面的": facing forward, both hands
        // reached out ahead of the chest. Now each hand is held in close beside its own hip, a little behind the body, elbow back and out, as far as
        // FWv: the chest's own frame (U pelvis -> shoulders, O out through this shoulder, B straight back from the chest), in shoulder widths)
        if (tab && !ALP() && FWv > 0.001) { const sm = v3.mul(v3.add(J.shL, J.shR), 0.5), U = v3.norm(v3.sub(sm, pel)), o0 = v3.sub(sh, sm), O = v3.norm(v3.sub(o0, v3.mul(U, v3.dot(o0, U))));
          let Bk = v3.norm(v3.cross(U, O)); if (v3.dot(Bk, v3.sub(J.ankleL, J.ankleR)) > 0) Bk = v3.mul(Bk, -1);      // (back = away from the nose: the front foot is the left)
          // (owner 2026-11-24 22:32 UTC screenshot, "胳膊…肩膀都非常的不自然": held in the chest's frame, the hands went where the trunk pointed, and
          // folded 60 deg toward the nose that frame lies nearly flat: the upper arm stood 67-88 deg off hanging (p90 110-119, the hand over its own
          // shoulder, a wing behind the back; freestyle 17-47). An arm at rest hangs: each hand now goes DOWN from its own shoulder along the snow's
          // normal, out along the snow the way the shoulder points, and a little in front of the chest, elbow bent)
          const sw = v3.len(v3.sub(J.shL, J.shR)) || SBT.SW, hz = v => [v[0], 0, v[2]], oh = hz(o0), Oh = v3.len(oh) > 1e-4 ? v3.norm(oh) : O, fh = hz(v3.mul(Bk, -1)), Fh = v3.len(fh) > 1e-4 ? v3.norm(fh) : [0, 0, 0];
          const w = v3.add(sh, v3.add(v3.mul([0, -1, 0], X('FHD', 0.66) * (L.uarm + L.farm + L.grip)), v3.add(v3.mul(Oh, X('FHO', 0.5) * sw), v3.mul(Fh, X('FHF', 0.6) * sw))));
          Bk = v3.mul(Fh, -1);
          tT = v3.lerp(tT, w, FWv); PO = v3.norm(v3.lerp(PO, v3.norm(v3.add(v3.mul(Bk, 1.0), v3.mul(O, 0.6))), FWv)); }
        if (dF > 0 && sec.snowY) { const sy = snY(tT) + 0.02 - snk(tT); if (tT[1] > sy) tT = [tT[0], lerp(tT[1], sy, X('DFK', 0.85) * dF), tT[2]]; } if (tab && snY) { const sy = snY(tT) + 0.03 - snk(tT); if (tT[1] < sy) tT = [tT[0], sy, tT[2]]; }
        t = ARMN ? tT : v3.lerp(tT, t, sat(tuck * 1.5));
        // (round 36, owner's screenshot 2026-11-24 "为什么会出现这种情况": crouched for a jump or tucked, the arms still took the old targets and
        // pole, the back arm up behind at 85-98 deg from hanging, the elbow thrown out like a wing. Crouched, the hands come forward and down
        // in front of the knees, elbows bent (about 125) and pointing down, as a rider winding up does)
        { const wT = ARMN ? 0 : Math.max(smooth(0.15, 0.6, tuck), chE) * (1 - air);      /* (a deep carve held down reads a hint of tuck, 0.04: that flickered the arms, back shoulder jolts) */
          if (wT > 0.01) { const sm = v3.mul(v3.add(J.shL, J.shR), 0.5), U = v3.norm(v3.sub(sm, pel)), a0 = v3.sub(J.ankleL, J.ankleR), A = v3.norm(v3.sub(a0, v3.mul(U, v3.dot(a0, U))));
            let T = v3.norm(v3.cross(U, A)); if (v3.dot(T, hl.Z) > 0) T = v3.mul(T, -1);
            const q = F0 ? [0.30, 0.55, -0.80] : [-0.15, 0.55, -0.85], d = v3.norm(v3.add(v3.add(v3.mul(A, q[0]), v3.mul(T, q[1])), v3.mul(gD, -q[2])));      /* (down to the snow, not down the chest: folded over, the chest's down points back along the board) */
            t = v3.lerp(t, v3.add(sh, v3.mul(d, 0.56)), wT);
            const ou = v3.sub(sh, sm), po = v3.norm(v3.add(v3.mul(gD, 0.8), v3.mul(v3.norm(ou), 0.5))); PO = v3.norm(v3.lerp(PO, po, wT)); } }
        // (and in every state, one limit: the fist's target stays within the owner's reach of the arm from straight down (gravity), softly from
        // AL0 deg to at most AL0 + ALS. His p90 is 59-63 deg back, 63-85 front (tools/motion/board_refs/arm_ranges.json); nothing in any state may
        // hold an arm out over the head again)
        if (!ARMN && !(ALP() && X('ALC', 1) > 0)) { const dn = gD, d = v3.sub(t, sh), l = v3.len(d);      /* (not alpine's chest-held hands: read from gravity, a hand held forward of a body laid back on its heels counted as raised and was pulled down, 50 deg each turn) */ if (l > 1e-4) { const a = Math.acos(clamp(v3.dot(d, dn) / l, -1, 1)) * 180 / Math.PI, a0 = AL0;
          if (a > a0) { const a1 = (a0 + ALS * Math.tanh((a - a0) / ALS)) * Math.PI / 180, pp = v3.sub(v3.mul(d, 1 / l), v3.mul(dn, Math.cos(a * Math.PI / 180))), pl = v3.len(pp);
            if (pl > 1e-4) t = v3.add(sh, v3.mul(v3.add(v3.mul(dn, Math.cos(a1)), v3.mul(pp, Math.sin(a1) / pl)), l)); } } }
      }
      // (8 种单板抓板精确手位：1 indy、2 mute、3 melon、4 method、5 stalefish、6 nose、7 tail、8 japan 前手绕前膝抓脚尖刃；保证在臂长内不穿大腿)
      if (g > 0) {
        const GP = { 1: [0.02, 0.035, -BD.hw - 0.015], 2: [-0.16, 0.035, -BD.hw - 0.015], 3: [-0.08, 0.045, BD.hw + 0.02], 4: [-0.12, 0.045, BD.hw + 0.02], 5: [0.06, 0.045, BD.hw + 0.02], 6: [-0.42, 0.045, -BD.hw - 0.02], 7: [0.40, 0.045, -BD.hw - 0.02], 8: [-0.22, 0.04, -BD.hw - 0.02] };
        const gp0 = GP[gKH] || (side < 0 ? [-0.36, 0.035, -BD.hw - 0.02] : [0.0, 0.035, -BD.hw - 0.02]);
        t = v3.lerp(t, v3.add(O, fr(bb, gp0[0], gp0[1], gp0[2])), g);
        if (gKH === 3 || gKH === 4 || gKH === 5) PO = v3.norm(v3.lerp(PO, fr(hl, side * 0.6, 0.2, 0.8), g));
      }
      // (kept clear of the snow: a hand on the snow touches it, it does not go in)
      t = offSnow(t, lerp(lerp(0.06, 0.008, dFl), 0.03, Math.max(air, sat(tuck * 2))), 0.02, sfR, snk(t));      // (in the air and a tuck the hands come down by the board: the old 3 cm there)
      // (真人表: the arm's length taken most of the way to ARM0's, both ways, not only as a floor: the front fist's target lies past the reach, so
      // the front elbow sat on the reach limit at 141-145 deg all turn. The owner's open to 145-155 in the turn and close to 120 at the edge change)
      if (tab && !(ALP() && X('ALC', 1) > 0 && g <= 0) && g < 0.99) { const dq = v3.sub(t, sh), lq = v3.len(dq); if (lq > 1e-4) t = v3.mad(sh, dq, lerp(lq, Math.max(A0, lerp(A0, lq, dF)), 0.9 * (1 - g)) / lq); }      /* (alpine's chest-held hands keep their own distance; grabbing hand reaches all the way to the board) */
      t = rclT(t, sh, F0 ? 0 : aTc);
      // (kept clear of the thighs: a hand or forearm went into the back thigh by up to 11 cm, scorer 2026-11-22. The thigh as a capsule of 9 cm,
      // the hand pushed out of it sideways, away from the leg's line)
      // (THB, 2026-11-24: a target deep inside its OWN thigh leaves by the leg's front and outer side (THF: 0 outer, 1 front), the more so the
      // deeper it lies. Pushed straight away from the leg's line, a target that crossed the line was thrown from behind the thigh to in front
      // of it: crouched in a deep carve, at the change from heel to toe, the front fist's place sweeps through the bent front thigh 4-7 cm
      // from its line, and the fist went through the leg for 3 frames, its target 36 cm in one frame. A hand by a bent leg lies in front of
      // it or outside it, never behind. Only outer (THF 0) took the hand from the front hip, the owner's place, out past the knee; under
      // 0.2 m the pull is too weak for that sweep)
      { const thb = tab && !ALP() ? X('THB', 0) : 0;
        for (const [h0, k0, oh] of [[hipL, J.kneeL, hipR], [hipR, J.kneeR, hipL]]) { const ax = v3.sub(k0, h0), u = clamp(v3.dot(v3.sub(t, h0), ax) / v3.dot(ax, ax), 0, 1), q = v3.mad(h0, ax, u), dv = v3.sub(t, q), dd = v3.len(dv), R0 = tab ? 0.165 : 0.13;
          if (dd < R0) { let n = dd > 1e-4 ? dv : fr(hl, 0, 0, side);
            if (thb > 0 && (side < 0) === (h0 === hipL)) { const a1 = v3.norm(ax), pp = v => { const q1 = v3.sub(v, v3.mul(a1, v3.dot(v, a1))), l1 = v3.len(q1); return l1 > 1e-4 ? v3.mul(q1, 1 / l1) : [0, 0, 0]; }, thf = X('THF', 0.5),
                o1 = v3.add(v3.mul(pp(v3.sub(h0, oh)), 1 - thf), v3.mul(pp(v3.mul(hl.Z, -1)), thf)), ol = v3.len(o1); if (ol > 1e-4) { const m = v3.mad(dv, o1, thb * (1 - dd / R0) / ol); n = v3.len(m) > 1e-4 ? m : o1; } }
            t = v3.mad(q, n, R0 / Math.max(v3.len(n), 1e-4)); } } }
      t = open(sh, t, A0);
      let e = K.ik2(sh, t, L.uarm, L.farm + L.grip, PO);
      // (and the forearm too, elbow to fist: where it passes nearer a thigh's line than 12 cm, the fist is moved out by what is missing, twice)
      for (let it = 0; it < 2; it++) { let worst = 0, push = null;
        for (const [h0, k0, rr] of [[hipL, J.kneeL, 0.135], [hipR, J.kneeR, 0.135], [pel, J.neck, 0.21]]) { const r = segSeg(e, t, h0, k0); if (r.d < rr && rr - r.d > worst) { worst = rr - r.d; push = r.n; } }      // (and the trunk, 2026-11-22: the back forearm crossed the chest)
        if (!push) break; t = v3.mad(t, push, worst * 1.3); t = rcl(t, sh);
        e = K.ik2(sh, t, L.uarm, L.farm + L.grip, PO); }
      // (an arm has weight too: the fist, where all the rules above put it, is eased on a critically damped path of about a seventh of a second
      // (faster in the air), measured from the shoulder. Raw, the front hand jumped up to 4-5 cm in a frame where the snow, thigh and forearm
      // clearances switched on and off, 2026-11-22, the owner: "twitching")
      // (ARMC, owner 2026-11-24 19:31 UTC: "你把胳膊当成一个被动的，但实际上胳膊上有肌肉，胳膊会主动动的，所以你要把怎么动往哪动定好，然后胳膊是有控制住的动的".
      // Until now the fist was a point eased in the WORLD from the shoulder (bhL/bhR), its length eased again, its speed capped against the hips, and
      // then pushed out of the thighs, the trunk and the snow, each push eased: so as the body turned the hand stayed behind and was dragged, swung
      // and shoved, an arm hanging off the shoulder. Now the arm is driven: where it is going is the rules above (the intended hand and elbow, t, e);
      // how it gets there is the shoulder and elbow muscles, each segment's direction held in the CHEST's own frame and moved toward its target by a
      // critically damped drive with a top angular speed and a top angular acceleration. The chest carries the arm with it (held, not dragged),
      // nothing overshoots, every move starts and stops under control. The clearances act on the target above, not on the arm)
      if (ARMC) { const CX = t2.X, CY = t2.Y, CZ = t2.Z, toC = v => [v3.dot(v, CX), v3.dot(v, CY), v3.dot(v, CZ)], frC = c => v3.add(v3.add(v3.mul(CX, c[0]), v3.mul(CY, c[1])), v3.mul(CZ, c[2])),
          dt = Math.min(sec.pfDt, 0.05), AC = sec.barmc || (sec.barmc = {}), kk = side < 0 ? 'L' : 'R', Lu = L.uarm, Lf = L.farm + L.grip;
        // (the plan already goes round the thighs (and the trunk, ACTB): where the intended forearm would pass nearer a thigh's line than ACTT, the intended hand is put
        // out by what is missing before the muscles drive toward it, so the arm goes round the leg on its own path, not shoved off it afterwards)
        for (let it = 0; it < 2; it++) { let worst = 0, push = null; for (const [h0, k0, mT] of [[hipL, J.kneeL, 0], [hipR, J.kneeR, 0], [pel, J.chest, X('ACTB', 0.22)], [J.chest, J.neck, X('ACTB', 0.22)]]) { const r = segSeg(mT ? t : e, t, h0, k0), m = (mT || Math.max(X('ACTT', 0.18), X('ACT', 0.14) * FWv)) - r.d; if (m > worst) { worst = m; push = r.n; } }
          if (!push) break; t = rcH(v3.mad(t, push, worst * 1.1), sh); e = K.ik2(sh, t, Lu, Lf, PO); }
        const uT = toC(v3.norm(v3.sub(e, sh))), fT = toC(v3.norm(v3.sub(t, e))), st0 = AC[kk];
        const drive = (s, tg, wn, Wm, Am) => { const c = clamp(v3.dot(s.d, tg), -1, 1), ax = v3.cross(s.d, tg), sl = v3.len(ax), ang = Math.atan2(sl, c);
            const n = sl > 1e-6 ? v3.mul(ax, 1 / sl) : [0, 0, 0]; let a = v3.sub(v3.mul(n, wn * wn * ang), v3.mul(s.w, 2 * wn)); const al = v3.len(a); if (al > Am) a = v3.mul(a, Am / al);
            let w = v3.mad(s.w, a, dt); const wl = v3.len(w); if (wl > Wm) w = v3.mul(w, Wm / wl);
            const th = v3.len(w) * dt; let d = s.d; if (th > 1e-7) { const k = v3.mul(w, 1 / v3.len(w)), cs = Math.cos(th), sn = Math.sin(th); d = v3.add(v3.add(v3.mul(d, cs), v3.mul(v3.cross(k, d), sn)), v3.mul(k, v3.dot(k, d) * (1 - cs))); }
            return { d: v3.norm(d), w }; };
        let S0 = st0 && sec.pfN - st0.n <= 1 ? st0 : { u: { d: uT, w: [0, 0, 0] }, f: { d: fT, w: [0, 0, 0] } };
        // (ACK, owner 2026-11-24 22:33 UTC "胳膊的动作是…非常僵硬": held wholly in the chest's frame, the chest carried the arm with it, and in the
        // chest's own frame his hands move 2.5-3.5x faster than ours (0.95-1.25 m/s median, ours 0.2-0.6, b3/aliv.js). An arm has mass: as the chest
        // turns, the arm stays where it was in space for part of it (ACK) and the muscles then bring it back to where it is meant to be)
        if (S0 === st0 && st0.cf && X('ACK', 1) > 0) { const k = X('ACK', 1), P = st0.cf, toP = c => v3.add(v3.add(v3.mul(P[0], c[0]), v3.mul(P[1], c[1])), v3.mul(P[2], c[2])),
            mv = q => { const wP = toP(q.d), wN = frC(q.d); return { d: toC(v3.norm(v3.lerp(wN, wP, k))), w: q.w }; };
          S0 = { n: st0.n, u: mv(st0.u), f: mv(st0.f) }; }
        const wa = 1 + 0.6 * air, u1 = drive(S0.u, uT, X('ACWU', 7) * wa, X('ACVU', 6.5), X('ACAU', 70)), f0 = drive(S0.f, fT, X('ACWF', 8) * wa, X('ACVF', 8), X('ACAF', 90));
        // (the elbow is a hinge: bent at least ACB0 and at most ACB1 from straight)
        let fd = f0.d; { const b0 = X('ACB0', 0.35), b1 = X('ACB1', 2.5), c = clamp(v3.dot(u1.d, fd), -1, 1), bnd = Math.acos(c);
          if (bnd < b0 || bnd > b1) { const pp = v3.sub(fd, v3.mul(u1.d, c)), pl = v3.len(pp), q = pl > 1e-5 ? v3.mul(pp, 1 / pl) : v3.norm(v3.cross(u1.d, [1, 0, 0])), bb = bnd < b0 ? b0 : b1; fd = v3.add(v3.mul(u1.d, Math.cos(bb)), v3.mul(q, Math.sin(bb))); } }
        let eW = v3.mad(sh, frC(u1.d), Lu), tW = v3.mad(eW, frC(fd), Lf);
        // (the snow: an arm does not go into it. Where the held hand would, the arm is raised about the shoulder by what is missing, and the drive is
        // told so: the muscles hold it there, it is not thrown back down next frame)
        if (sec.snowY && snY) { const fl = q => Math.max(snY(q), O[1] - 0.03 - sfR) - snk(q) + 0.012; let lift = 0;
          for (const q of [tW, eW]) lift = Math.max(lift, fl(q) - q[1]);
          if (lift > 0) { const r = v3.sub(tW, sh), ax0 = v3.cross(r, [0, 1, 0]), al = v3.len(ax0);
            if (al > 1e-5) { const k = v3.mul(ax0, 1 / al), arm = Math.max(v3.len(v3.cross(k, r)), 0.05), th = Math.min(lift / arm, 1.2), cs = Math.cos(th), sn = Math.sin(th),
                rot = q => { const r0 = v3.sub(q, sh); return v3.add(sh, v3.add(v3.add(v3.mul(r0, cs), v3.mul(v3.cross(k, r0), sn)), v3.mul(k, v3.dot(k, r0) * (1 - cs)))); };
              eW = rot(eW); tW = rot(tW); } } }
        // (only facing forward, FWv, where the hips turn across the front hand: and the thighs: where the held forearm would pass nearer a thigh's line than ACT, the hand goes out by what is missing and the arm is laid
        // there, the drive told so: a hand by the leg, held clear of it, as a rider does)
        for (let it = 0; it < X('ACTI', 2); it++) { let worst = 0, push = null; for (const [h0, k0, mT] of [[hipL, J.kneeL, 0], [hipR, J.kneeR, 0], [pel, J.chest, X('ACTBS', 0.195)], [J.chest, J.neck, X('ACTBS', 0.195)]]) { const r = segSeg(mT ? tW : eW, tW, h0, k0), m = (mT || Math.max(X('ACTS', 0.135), X('ACT', 0.14) * FWv)) - r.d; if (m > worst) { worst = m; push = r.n; } }
          if (!push) break; tW = rcH(v3.mad(tW, push, worst * 1.1), sh); eW = K.ik2(sh, tW, Lu, Lf, X('ACPE', 1) > 0 ? v3.sub(eW, v3.lerp(sh, tW, 0.5)) : PO); }      /* (ACPE, owner 2026-11-26 "后手扶雪时抖": the elbow bends the way the muscles held it; solved toward PO the elbow jumped 5-7 cm in one frame each time this push came on, the back arm on a deep turn) */
        AC[kk] = { n: sec.pfN, cf: [CX, CY, CZ], u: { d: toC(v3.norm(v3.sub(eW, sh))), w: u1.w }, f: { d: toC(v3.norm(v3.sub(tW, eW))), w: f0.w } };
        e = eW; t = tW; lTg = v3.len(v3.sub(t, sh));
      } else {
      if (K.ez && sec.pfDt > 0) { const w = (tab ? (side < 0 ? 11 : 10) + X('AEW', 0) + 8 * air : (side < 0 ? 12 : 8) + 20 * air), kk = side < 0 ? 'bhL' : 'bhR', r = v3.sub(t, sh); lTg = v3.len(r); t = v3.add(sh, [K.ez(sec, kk + 0, r[0], w), K.ez(sec, kk + 1, r[1], w), K.ez(sec, kk + 2, r[2], w)]);
        // (真人表: and the arm's length, shoulder to fist, eased again on its own (w 35): the owner's elbows open and close 25-35 deg every turn,
        // rounded; ours dropped 31 deg in 0.1 s at each fast edge change as the chest swung in toward the lagging fist, Mac round 9. Slower (w 9-20)
        // took the whole swing out)
        if (tab) { const dq = v3.sub(t, sh), lq = v3.len(dq), lE = K.ez(sec, kk + 'len', lerp(lq, A0, 0.8), 35 + 20 * air); if (lq > 1e-4) t = v3.mad(sh, dq, lerp(lE, lq, wTp) / lq); }      /* (SNT: not on the snow, where the arm's length is the shoulder's height over it) */
        // (真人表: and a hand never moves faster, against the hips, than the owner's do: p90 1.9 m/s skidding, 2.7 carving, carve_table / hand_speed.txt)
        if (tab) { const HP = sec.bhp || (sec.bhp = {}), r1 = v3.sub(t, pel), o1 = HP[kk], mx = (wSk >= 0.5 ? lerp(SBT.mid.vmax, SBT.skid.vmax, (wSk - 0.5) * 2) : lerp(SBT.carve.vmax, SBT.mid.vmax, wSk * 2)) * (1 + 0.6 * air) * sec.pfDt;      // (真人表: the air no faster than 1.6x: at 3x the back fist was thrown 11 cm in two frames at a mogul take-off, Mac round 4)
         
          if (o1) { const dv = v3.sub(r1, o1), dl = v3.len(dv); if (dl > 0.8 * mx) { const dS = 0.8 * mx + 0.5 * mx * Math.tanh((dl - 0.8 * mx) / (0.5 * mx)); t = v3.add(pel, v3.mad(o1, dv, dS / dl));
            // (and the ease is told where the hand really went: it kept its own, uncapped path, ran ahead, and when it stopped the capped hand stopped
            // with it in a frame, 34 mm/frame^2 on fast linked turns, Mac round 3)
            const E = sec.ez, rr = v3.sub(t, sh); for (let c = 0; c < 3; c++) { const q = E && E[kk + c]; if (q && q.o) { const v0 = (rr[c] - q.b[0]) / sec.pfDt; q.o = [rr[c], v0]; } } } }
          // (round 14: and its speed changes no faster than the owner's hands do, about 10 mm/frame^2 at 60 fps (their wrists against the hips, p99,
          // Mac round 13): where the table swaps rows at a fast edge change the target swung 25-30 cm in a few frames and the eased fist still took
          // 15-19 mm/frame^2 of it. Soft, like the speed cap, and the ease told where the fist went)
          if (o1 && HP[kk + 'v']) { const pv = HP[kk + 'v'], dv = v3.sub(v3.sub(t, pel), o1), ch = v3.sub(dv, pv), cl = v3.len(ch), f2 = (sec.pfDt * 60) * (sec.pfDt * 60), AM = 0.010 * f2;
            if (cl > 0.7 * AM) { const cS = 0.7 * AM + 0.3 * AM * Math.tanh((cl - 0.7 * AM) / (0.3 * AM)); t = v3.add(pel, v3.add(o1, v3.mad(pv, ch, cS / cl)));
              const E = sec.ez, rr = v3.sub(t, sh); for (let c = 0; c < 3; c++) { const q = E && E[kk + c]; if (q && q.o) q.o = [rr[c], (rr[c] - q.b[0]) / sec.pfDt]; } } }
          HP[kk + 'v'] = o1 ? v3.sub(v3.sub(t, pel), o1) : [0, 0, 0]; HP[kk] = v3.sub(t, pel); }      // (a soft cap: a hard one put a kink in the hand's path where it took hold, scorer F4)
        // (真人表: and off the snow here, in the eased path itself: the ease is told where the fist went, as for the speed cap, so the snow does not
        // fight it. Kept only at the very end, the fist ran 14 cm into the snow on deep carves and was thrown out of it, 38 mm/frame^2, 2026-11-23)
        if (tab && sec.snowY) { const t0 = t, l0 = v3.len(v3.sub(t, sh)); for (let it = 0; it < 3; it++) { const q = offSnow(t, lerp(0.05, 0.008, dFl), 0.05, sfR, snk(t)); if (q === t) break; const dq = v3.sub(q, sh), lq = v3.len(dq); t = lq > 1e-4 && lq < l0 ? v3.mad(sh, dq, lerp(l0, lq, wTp) / lq) : q; }      /* (SNT: the hand on the snow comes straight up, see there) */      // (round 12: and the arm keeps its length as it comes up, swinging about the shoulder: lifted straight up, the back arm lost 5 cm and the elbow snapped 119-145 deg in 0.1 s on every deep carve; and it starts 10 cm up, softly, not at 7 cm: there the lift came on in a few frames, back fist 6-9 mm/frame^2)
           if (t !== t0 && K.ez && sec.pfDt > 0) { const E = sec.ez, rr = v3.sub(t, sh); for (let c = 0; c < 3; c++) { const q = E && E[kk + c]; if (q && q.o) q.o = [rr[c], q.o[1]];      // (round 13: its speed kept: given the lift's own speed, the ease was kicked up by it, back fist 25-28 mm/frame^2 as a deep carve brought it to the snow)
           } } }
        // (SNT: the hand on the snow takes its height here. Where the fist would hang with no snow there (yh: under the shoulder's height by the
        // arm's length lF, at the eased fist's own place along and across the board) against the snow under it (y1, the line a hanging hand's
        // knuckles meet): above it by more than the band wC the fist hangs there, under it by more the hand is on the snow, in between it comes
        // down softly. Once down it settles (stl, about a third of a second): the fist goes on under the line by what the floors allow (sk: the
        // hand is drawn bent flat at the wrist, which then rides 3-4 cm over the snow; the forearm's real tilt is used, so a folded elbow does not
        // put the wrist in the snow). So a touch is knuckles first, then the palm, and a brush too short to settle stays on the knuckles.
        // The eased fist above is told where the hand really is (place and speed, in its own shoulder frame and against the hips), so each frame it
        // starts from the hand, and as wTch lets go the fist simply goes on from where the snow left it)
        if (SNTon) { if (wIh > 0.002) {
            if (sec.bstN == null || sec.pfN - sec.bstN > 1) { for (const k of ['bstD', 'bstc', 'bstg', 'bstr', 'bsts']) delete ES[k]; sec.bstv = 0; }      // (not run last frame: its eases start where things are now)
            sec.bstN = sec.pfN;
            const SFRm = X('SFR', 0), SFWm = X('SFW', 0), gy0 = O[1] - 0.03 - SFRm, rx = t[0] - sh[0], rz = t[2] - sh[2], r2 = rx * rx + rz * rz,
              yh = l => sh[1] - Math.sqrt(Math.max(l * l - r2, 1e-6)), lA = v3.len(v3.sub(t, sh)), R = Math.max(X('SNRR', 0.975) * reach, lTg),
              y0 = Math.max(snY(t), gy0), y1 = y0 + 0.008, cs = (a, b) => { const d = v3.sub(a, b), l = v3.len(d); return l > 1e-4 ? clamp(d[1] / l, 0, 1) : 1; },
              sk = c => Math.min(SFWm, Math.max(0, L.grip * c - 0.03)), q0 = [t[0], y1 - sk(cs(sh, [t[0], y0, t[2]])), t[2]],
              skq = X('SNSK', 1) * sk(Math.min(cs(sh, q0), cs(K.ik2(sh, q0, L.uarm, L.farm + L.grip, PO), q0))),
              xg = yh(R) - y1, g0 = 1 - smooth(X('SNG0', 0.08), X('SNG1', 0.17), xg), gE = K.ez(sec, 'bstg', g0, g0 > pv('bstg') ? X('SNWG1', 25) : X('SNWG', 5)),      // (near quickly, away slowly: the arm stays reaching as the body rises off the hand)
              rh0 = wIh * (1 - smooth(0.10, 0.18, xg)) * (1 - smooth(X('SNRV0', 0.3), X('SNRV1', 0.9), -(sec.bstv || 0))), rho = K.ez(sec, 'bstr', rh0, rh0 > pv('bstr') ? X('SNWR', 5) : 8),      // (reaching: the arm straightens to R over about a third of a second when the snow is that near; not while the shoulder is bringing the hand down fast anyway (last frame's closing speed, bstv): reaching then, the arm straightened 2 deg and folded 9 deg a frame as the hand met the snow, an elbow jolt at every landing)
              lF = lerp(lA, lerp(Math.min(lTg, R), R, rho), gE), xf = yh(lF) - y1,
              vX = sec.bstv = (xf - K.ez(sec, 'bstD', xf, 30)) * 15,      // (how fast the shoulder is closing on the snow (negative closing), smoothed over about 0.07 s: a critically damped follower lags a ramp by 2 v / w)
              wC = K.ez(sec, 'bstc', clamp(X('SNTAU', 0.06) * Math.abs(vX), X('SNC0', 0.012), X('SNC1', 0.08)), 20);
            wTch = wIh * gE; sec.bsxg = [sec.pfN, xg];
            const st0 = wTch * (1 - smooth(0, 0.04, xf)), stl = K.ez(sec, 'bsts', st0, st0 > pv('bsts') ? X('SNWS', 5) : 12) * skq;
            // (leaving, SNV. Held on the snow by its height alone, the hand stayed down while the shoulder rose off it and took up the elbow's slack,
            // and was then taken at the shoulder's own speed (4 m/s as a deep turn is let go): 34-44 mm/frame^2, a snatch. A band that grew with the
            // rising speed came three or four frames late (35). So the hand's height over its line is a state of its own (hL): each frame it takes
            // the shoulder's rise less what the elbow opens, and the elbow opens no faster than SNVH m/s while the turn is held (the suspension
            // above: the bowl's decompression, 1.1 m/s, leaves the hand on the snow) and SNVO m/s as the rider lets the turn go, read as the trunk
            // reads it (TDK: the lean read ahead by its rate past a dead zone of 0.3 rad/s, under 0.72: a held turn's lean falls no faster than
            // 0.74 rad/s, a roll-out's to 3.5), or once the hand is up. Read off the lean's rate alone (-2.4..-1.2 rad/s) it came after the elbow
            // had opened, the shoulder already 12 cm up. So it starts up with the body, the elbow still bent, at the shoulder's own acceleration,
            // and never under where it would lie or hang (hS). Coming down nothing changes: the shoulder's fall is taken whole)
            const sS = sh[1] - y1 + stl, hS = sfl(xf + stl, 0, wC), sv = sec.bstf, lv = !!(sv && sec.pfN - sv[0] <= 1),
              gR = 1 - smooth(X('SNV0', 0.5), X('SNV1', 0.72), lean + X('SNVT', 0.3) * Math.min(0, lrS + X('SNVR', 0.3))),
              cO = lerp(X('SNVH', 2), X('SNVO', 0.4), Math.max(gR, lv ? smooth(0.005, 0.04, sv[1] - sv[3]) : 0)),
              hL = X('SNV', 1) > 0 && lv ? Math.max(hS, sv[1] + (sS - sv[2]) - cO * sec.pfDt) : hS; sec.bstf = [sec.pfN, hL, sS, hS];
            if (wTch > 0.0005) { let q = [t[0], lerp(t[1], y1 - stl + hL, wTch), t[2]];
              // (the shoulder coming down on the resting hand folds the elbow: the elbow is the suspension. Only deep down, the shoulder less than SND0 m
              // over the hand, does the hand also move out from under it, toward where it already is from the shoulder (the tail, when straight under):
              // a smooth step of how far under, SNDA m at most (SNDW m further down, and there the arm is as long as its tightest fold however low
              // the shoulder comes, even level with the snow on a wall), so it starts from nothing and ends. A fixed shortest arm instead (0.45 m)
              // threw a hand that was straight under the shoulder 4-5 cm along the board in one frame as the bowl's compression brought the shoulder
              // through that height: the way out of a sphere starts at an infinite rate)
              // (only what is missing is pushed: a hand already that far out is left alone, and the knee between ends (a quarter of the distance
              // asked). The hand's place is the eased fist's state, so a push that never quite ends is added again every frame: it walked the hand
              // out to the arm's reach in six frames and over the rider's head)
              { const o = X('SNDA', 0.36) * smooth(0, 1, (X('SND0', 0.46) - (sh[1] - q[1])) / X('SNDW', 0.26)) * wTch; if (o > 0) { const k = 0.25 * o, x = o - Math.sqrt(r2), dd = x >= k ? x : x > -k ? (x + k) * (x + k) / (4 * k) : 0; if (dd > 0) { const dx = rx + 0.02, dl = Math.hypot(dx, rz) || 1; q = [q[0] + dd * dx / dl, q[1], q[2] + dd * rz / dl]; } } }
              // (and its speed against the hips changes no faster than a hand's does here either (SNA m/frame^2 at 60 fps; the free hand's cap is
              // 10 mm, his own wrists' p99): the snow under a resting hand can come up 4 cm in a frame (the face of a roller at 30 m/s) and, followed
              // exactly, that snapped the elbow 20 deg in a frame. The hand gives instead, up to SNP m into the snow for a frame or two, then is on
              // it again; the passes and the drawn hand below ride the same line, snO)
              { const HP0 = sec.bhp, AM = X('SNA', 0.014) * (sec.pfDt * 60) * (sec.pfDt * 60), qT = q[1];
                if (AM > 0 && HP0 && HP0[kk] && HP0[kk + 'v']) { const yP = HP0[kk][1] - HP0[kk + 'v'][1], sv = sec.bsth, vP = sv && sec.pfN - sv[0] <= 1 ? sv[1] : HP0[kk + 'v'][1], ch = (q[1] - pel[1] - yP) - vP, ca = Math.abs(ch);
                  if (ca > 0.7 * AM) { const cS = 0.7 * AM + 0.3 * AM * Math.tanh((ca - 0.7 * AM) / (0.3 * AM)); q = [q[0], Math.max(pel[1] + yP + vP + Math.sign(ch) * cS, qT - X('SNP', 0.03)), q[2]]; }
                  sec.bsth = [sec.pfN, q[1] - pel[1] - yP]; }
                snO = Math.min(0, q[1] - qT); }
              // (what the eases are told is the hand within the arm's reach, at no more than a hand's speed: told a place out of reach once, on a wall
              // whose snow stood level with the shoulder, they took a speed of 100 m/s and the next frame's fist was off the mountain)
              t = q; const tB = rcH(t, sh), rr = v3.sub(tB, sh), lr = v3.len(rr), HP = sec.bhp, vc = x => clamp(x, -8, 8);
              for (let c = 0; c < 3; c++) { const e1 = ES[kk + c]; if (e1 && e1.o) e1.o = [rr[c], vc((rr[c] - e1.b[0]) / sec.pfDt)]; }
              { const e1 = ES[kk + 'len']; if (e1 && e1.o) e1.o = [lr, vc((lr - e1.b[0]) / sec.pfDt)]; }
              if (HP && HP[kk] && HP[kk + 'v']) { const r1 = v3.sub(tB, pel); HP[kk + 'v'] = v3.add(HP[kk + 'v'], v3.sub(r1, HP[kk])); HP[kk] = r1; } } }
          K.ez(sec, 'bstw', wTch, 1e9); sntW = wTch; sntO = snO; }
        t = rcH(t, sh);
        // (and the thighs, which move faster than the eased hand, are kept out again: this push grows from nothing as the leg comes in, so it is smooth)
        // (each push keeps to the side it pushed to last frame: with the legs deeper, 2026-11-22, a hand eased onto a thigh's line was thrown 38 cm
        // across it in one frame as the nearest side flipped)
        const PN = sec.bpn || (sec.bpn = {}), keep = (key, n) => { const o = PN[key]; const m = o && v3.dot(o, n) < 0 ? o : n; PN[key] = m; return m; };
        const tb = t, RT = tab ? 0.175 : 0.13;      // (真人表: 4.5 cm more room (round 14: from 2; the push then starts early enough for its ease that the hard clearance below rarely has to catch the fist, which threw it 12-20 mm/frame^2 as it switched on), so the eased correction below, which lags a leg coming in fast, still stays out of it)
        for (const [h0, k0, nm] of [[hipL, J.kneeL, 'L'], [hipR, J.kneeR, 'R']]) { const ax = v3.sub(k0, h0), u = clamp(v3.dot(v3.sub(t, h0), ax) / v3.dot(ax, ax), 0, 1), q = v3.mad(h0, ax, u), dv = v3.sub(t, q), dd = v3.len(dv);
          if (dd < RT) { const n = keep(kk + 't' + nm, dd > 1e-4 ? v3.mul(dv, 1 / dd) : fr(hl, 0, 0, side)); t = v3.mad(q, n, RT); } else delete PN[kk + 't' + nm]; }
        t = open(sh, t, wTch > 0 ? lerp(ARMIN, Math.min(ARMIN, X('SNDM', 0.34)), wTch) : ARMIN);      // (SNT: a hand on the snow folds its elbow further, the shoulder coming down on it) (after the ease only the real limit: the eased fist may lag inside the target's distance, the elbow bending as the body moves under it)
        e = K.ik2(sh, t, L.uarm, L.farm + L.grip, PO);
        for (let it = 0; it < 2; it++) { let worst = 0, push = null;
          let wc = -1; for (const [h0, k0, rr, ci] of [[hipL, J.kneeL, 0.135, 0], [hipR, J.kneeR, 0.135, 1], [pel, J.neck, 0.21, 2]]) { const r = segSeg(e, t, h0, k0); if (r.d < rr && rr - r.d > worst) { worst = rr - r.d; push = r.n; wc = ci; } }
          if (!push) { if (it === 0) delete PN[kk + 'f']; break; }
          // (the forearm's push too keeps last frame's side, for the same body part and while it is shallow: deeper than 6 cm the near side wins)
          { const o = PN[kk + 'f']; if (o && o.c === wc && worst < 0.06 && v3.dot(o.n, push) < 0) push = o.n; PN[kk + 'f'] = { n: push, c: wc }; }
          t = v3.mad(t, push, worst * 1.3); t = rcH(t, sh);
          e = K.ik2(sh, t, L.uarm, L.farm + L.grip, PO); }
        // (and what all the pushes moved the hand by is itself eased, fast (w 30): where a push changed its mind about the side, the hand slid round
        // instead of jumping across, 38 cm in one frame in a tuck)
        { const c = v3.sub(t, tb), wc = tab ? CEW : 30, cE = [K.ez(sec, kk + 'c0', c[0], wc), K.ez(sec, kk + 'c1', c[1], wc), K.ez(sec, kk + 'c2', c[2], wc)];
          t = v3.add(tb, cE);
          const tH0 = t;      // (where the hard clearances below start from)
          // (真人表: and where that lag still leaves the fist inside a thigh, it comes straight out of it: it is never more than a centimetre or two,
          // so there is no jump to see; air and stop, the scorer 2026-11-22, 0.8-1.5 cm into the back thigh)
          if (tab && HARD) for (const [h0, k0, nm] of [[hipL, J.kneeL, 'L'], [hipR, J.kneeR, 'R']]) { const ax = v3.sub(k0, h0), u = clamp(v3.dot(v3.sub(t, h0), ax) / v3.dot(ax, ax), 0, 1), q = v3.mad(h0, ax, u), dv = v3.sub(t, q), dd = v3.len(dv);
            if (dd < 0.175 && dd > 1e-4) t = v3.mad(q, dv, sfl(dd, 0.135) / dd); }
          t = rcH(t, sh); e = K.ik2(sh, t, L.uarm, L.farm + L.grip, PO);
          // (真人表: the forearm the same, elbow to fist: on a fast heel carve the back hand reaches across in front of the knees to the toe side, and
          // as the legs stretched for a take-off the back thigh came up through the forearm by 5.5 cm, the eased push behind it, scorer 2026-11-22)
          if (tab && HARD) for (let it = 0; it < 2; it++) { let worst = 0, push = null;
            for (const [h0, k0] of [[hipL, J.kneeL], [hipR, J.kneeR]]) { const r = segSeg(e, t, h0, k0), m = sfl(r.d, 0.13) - r.d; if (m > 1e-5 && m > worst) { worst = m; push = r.n; } }
            if (!push) break; t = v3.mad(t, push, worst * (it ? 1.2 : 1)); t = rcH(t, sh);
            e = K.ik2(sh, t, L.uarm, L.farm + L.grip, PO); }
          // (and what they move the fist by changes at most 1.2 cm a frame: at a mogul take-off the legs fold up fast and the hard push threw the back
          // fist 11 cm in two frames, 119 mm/frame^2, Mac round 4. A fist a frame or two inside a moving thigh is not seen; that jump is)
          // (round 13: and its speed changes at most 6 mm a frame, frame to frame: capped on the step alone, it went from still to 1.2 cm a frame and back
          // in two frames as a tuck let go, the back fist 18-22 mm/frame^2, Mac round 12, stops. Pushing out of a leg coming in, twice that:
          // at 6 mm there the fist stayed in the thigh, 0.7-0.9 cm on a deep carve)
          if (tab && HARD) { const HO = sec.bho || (sec.bho = {}), h0 = HO[kk] || { o: [0, 0, 0], v: [0, 0, 0] }, off = v3.sub(t, tH0), M = 0.012, MA = 0.006;
            const grow = v3.len(off) > v3.len(h0.o) + 1e-4; let v1 = v3.mul(v3.sub(off, h0.o), grow ? 1 : 0.5); { const dv = v3.sub(v1, h0.v), dvl = v3.len(dv), mA = grow ? (v3.len(v3.sub(off, h0.o)) > 0.006 ? 1e9 : 2 * MA) : MA; /* (more than 6 mm in: straight out, to the step cap) */ if (dvl > mA) v1 = v3.mad(h0.v, dv, mA / dvl); }
            const vl = v3.len(v1), Mx = grow && v3.len(v3.sub(off, h0.o)) > 0.006 ? 0.03 : M; if (vl > Mx) v1 = v3.mul(v1, Mx / vl);
            let o1 = v3.add(h0.o, v1); if (v3.len(off) < 1e-6 && v3.len(o1) < 0.0015) { o1 = [0, 0, 0]; v1 = [0, 0, 0]; }      // (settled)
            HO[kk] = { o: o1, v: v1 }; if (v3.len(v3.sub(o1, off)) > 1e-6) { t = rcH(v3.add(tH0, o1), sh); e = K.ik2(sh, t, L.uarm, L.farm + L.grip, PO); } } } }
      // (and last of all, off the snow again: the thigh and forearm pushes above can drive the fist down, 22 cm into the snow on a deep carve. What
      // this lifts it by is eased (w 25), as the pushes' own correction is, with a hard floor at the snow itself: raw, it jerked the back arm every
      // deep turn, 40 jolts a run, 2026-11-23)
      if (tab && sec.snowY) { const kk = side < 0 ? 'bsn' + 'L' : 'bsn' + 'R', snow = q => Math.max(snY(q), O[1] - 0.03 - sfR) - snk(q) + snO;
        // (the arm keeps its length as the fist comes up: it swings up about the shoulder instead of the elbow folding (lifted straight up, the back
        // elbow folded to 60-80 deg on a deep toe carve, Mac round 9). The whole correction is eased (w 22), so it never throws the fist)
        let q = t; const l0 = v3.len(v3.sub(t, sh));
        for (let it = 0; it < 3; it++) { const s2 = snow(q) + lerp(0.05, 0.008, Math.max(dF, wTch)); if (q[1] >= s2) break; q = [q[0], s2, q[2]]; const dq = v3.sub(q, sh), lq = v3.len(dq); if (lq > 1e-4 && lq < l0) q = v3.mad(sh, dq, lerp(l0, lq, wTch) / lq); }      // (SNT: the hand on the snow comes straight up, its elbow folding; swung about the shoulder it slid)
        const dv = v3.sub(q, t), ok = K.ez && sec.pfDt > 0, dE = ok ? [K.ez(sec, kk + 0, dv[0], 22), K.ez(sec, kk + 1, dv[1], 22), K.ez(sec, kk + 2, dv[2], 22)] : dv;
        let t2 = v3.add(t, dE); const fl = snow(t2) + 0.005; if (t2[1] < fl) t2 = [t2[0], fl, t2[2]];      // (and never in: a glove's half at most)
        if (v3.len(v3.sub(t2, t)) > 1e-5) { t = rcH(t2, sh); e = K.ik2(sh, t, L.uarm, L.farm + L.grip, X('SNPE', 1) > 0 ? v3.sub(e, v3.lerp(sh, t, 0.5)) : PO); } }      /* (SNPE, owner 2026-11-26 "后手扶雪时抖": the elbow bends the way it already pointed; solved toward PO it jumped 3-5 cm in one frame each time this lift came on or off, the elbow the muscles had driven elsewhere) */
      }      // (ARMC)
      // (真人表, owner 2026-11-23 "右手为什么手心朝上翻过来了": the hand's roll comes from d's part square to the forearm. d leaned 0.35 toward the
      // toes, so with the back forearm reaching down and across to the toe side, d's square part swung over the top and the palm turned up. On c:
      // palm toward the snow (straight down the body), and as the forearm hangs straight down, toward the body's middle, so it never flips)
      if (tab) { const fd = v3.norm(v3.sub(t, e)), dn = fr(hl, 0, -1, 0), a = smooth(0.55, 0.92, Math.abs(v3.dot(fd, dn))), mq = v3.sub(pel, t), md0 = v3.sub(mq, v3.mul(dn, v3.dot(mq, dn))), md = v3.sub(md0, v3.mul(fd, v3.dot(md0, fd)));
        let dv = v3.norm(v3.add(v3.mul(dn, 1 - a), v3.mul(v3.norm(md), a)));
        // (owner 2026-11-24 20:26 UTC screenshot "你这是手掌着地吗？你这是手背着地？": it was the back. With d straight down the body the fist stood
        // on its knuckles and, the wrist laid flat, rolled onto its back: measured at the snow the back of the hand faced down (-0.8) in every
        // touch. Now, coming down to the snow (from PLH1 to PLH0 over it), d lies across the forearm in the snow's plane, turned so the back of
        // the hand is up and the palm and fingers face the snow (the glove's back is y x (toward the wrist) for the right hand, mirrored for the left))
        if (snY && X('PLM', 0) > 0) { const hgt = t[1] - snY(t), k0 = (1 - smooth(X('PLH0', 0.04), X('PLH1', 0.5), hgt)) * (1 - air), kq = side < 0 ? 'bplL' : 'bplR', E0 = sec.ez && sec.ez[kq],
            k = K.ez && sec.pfDt > 0 ? clamp(K.ez(sec, kq, k0, k0 > (E0 ? E0.o[0] : 0) ? X('PLW1', 40) : X('PLW0', 3)), 0, 1) : k0;      // (turning over: quickly going down, slowly coming up off the snow, where the hand left at 4 m/s and rolled 140 deg in 4 frames)
          if (k > 0.001) { const ex = 0.05, gx = (snY(v3.add(t, [ex, 0, 0])) - snY(v3.sub(t, [ex, 0, 0]))) / (2 * ex), gz = (snY(v3.add(t, [0, 0, ex])) - snY(v3.sub(t, [0, 0, ex]))) / (2 * ex), n = v3.norm([-gx, 1, -gz]);
            let fh = v3.sub(fd, v3.mul(n, v3.dot(fd, n))); const nz = v3.sub(J.ankleL, J.ankleR); fh = v3.add(fh, v3.mul(v3.norm(v3.sub(nz, v3.mul(n, v3.dot(nz, n)))), 0.25));
            if (v3.len(fh) > 1e-4) { fh = v3.norm(fh); const dp = v3.norm(side > 0 ? v3.cross(fh, n) : v3.cross(n, fh)); dv = v3.norm(v3.lerp(dv, dp, k)); } } }
        // (the hand's roll eased too, like the fist: raw it turned 20-40 deg in a frame as the forearm swung, scorer 'pole' jolts)
        if (K.ez && sec.pfDt > 0) { const kq = side < 0 ? 'bdL' : 'bdR', wq = 14 + 20 * air; dv = v3.norm([K.ez(sec, kq + 0, dv[0], wq), K.ez(sec, kq + 1, dv[1], wq), K.ez(sec, kq + 2, dv[2], wq)]); }
        return { w: t, e, d: dv }; }
      return { w: t, e, d: v3.norm(fr(hl, side * 0.1, -1, -0.35)) };
    };
    const hL = hand(-1, gL), hR = hand(1, gR);
    // (ACAP, owner 2026-11-24 18:56 UTC screen recording "为什么胳膊还在打转？！": at every edge change one arm swung up over the head and back down,
    // 100 deg in a quarter second (alpine's back arm: 18 deg from hanging on a heel turn, 120 on a toe turn, 400-1400 deg/s). Whatever a style's targets
    // say, the upper arm stays below the shoulder's own level plus ACAP1 from hanging along the trunk: past ACAP0 the whole arm turns back about the
    // shoulder, softly, its bend kept. A guard for every style and state; the style's own targets are fixed where they ask for it)
    if (tab && X('ACAP', 1) > 0) { const Dn = v3.norm(v3.sub(J.pelvis, J.neck)), c0 = X('ACAP0', 1.75), c1 = X('ACAP1', 2.0);
      for (const [h, sh] of [[hL, J.shL], [hR, J.shR]]) { const u = v3.sub(h.e, sh), lu = v3.len(u); if (lu < 1e-4) continue;
        const a = Math.acos(clamp(v3.dot(v3.mul(u, 1 / lu), Dn), -1, 1)); if (a <= c0) continue;
        const a1 = c0 + (c1 - c0) * Math.tanh((a - c0) / (c1 - c0)), ax0 = v3.cross(u, Dn), la = v3.len(ax0); if (la < 1e-5) continue;
        const k = v3.mul(ax0, 1 / la), th = a - a1, cs = Math.cos(th), sn = Math.sin(th);
        const rot = q => { const r = v3.sub(q, sh), kr = v3.cross(k, r), kd = v3.dot(k, r); return v3.add(sh, v3.add(v3.add(v3.mul(r, cs), v3.mul(kr, sn)), v3.mul(k, kd * (1 - cs)))); };
        h.e = rot(h.e); h.w = rot(h.w); } }
    // (ACTF: last of all, the forearm never in the trunk. With the arm keeping its place in space as the chest turns (ACK) the passes after the
    // drive (the reach, the snow, the speed caps) could still lay the front forearm 3-4 cm into the trunk on a deep stop; the whole arm turns
    // about the shoulder until it is clear)
    if (tab && X('ACTF', 1) > 0) for (const [h, sh] of [[hL, J.shL], [hR, J.shR]]) for (let it = 0; it < 3; it++) { let worst = 0, nn = null;
      for (const [a0, a1] of [[J.pelvis, J.chest], [J.chest, J.neck]]) { const r = segSeg(h.e, h.w, a0, a1), m = X('ACTFM', 0.195) - r.d; if (m > worst) { worst = m; nn = r.n; } }
      if (!nn) break; const rw = v3.sub(h.w, sh), ax0 = v3.cross(rw, nn), la = v3.len(ax0), lw = v3.len(rw); if (la < 1e-5 || lw < 0.05) break;
      const k = v3.mul(ax0, 1 / la), th = Math.min(worst * 1.1 / lw, 0.5), cs = Math.cos(th), sn = Math.sin(th);
      const rot = q => { const r = v3.sub(q, sh), kr = v3.cross(k, r), kd = v3.dot(k, r); return v3.add(sh, v3.add(v3.add(v3.mul(r, cs), v3.mul(kr, sn)), v3.mul(k, kd * (1 - cs)))); };
      h.e = rot(h.e); h.w = rot(h.w); }
    J.gripL = hL.w; J.elbowL = hL.e; J.gripR = hR.w; J.elbowR = hR.e; J.poleDL = hL.d; J.poleDR = hR.d;
    J.wristL = v3.mad(J.elbowL, v3.norm(v3.sub(J.gripL, J.elbowL)), L.farm); J.wristR = v3.mad(J.elbowR, v3.norm(v3.sub(J.gripR, J.elbowR)), L.farm);
    // (round 30, owner 15:47 UTC "你小臂和手腕没有弯曲能力是主要问题": the hand was drawn straight on from the forearm, a rigid stick from elbow to
    // knuckles. Now the wrist bends: a relaxed hand droops with its weight, a hand at the snow lies flat on it (palm down, wrist bent back), and the
    // hand follows the forearm a little late (eased slower than the fist), so it trails through every swing instead of moving as one piece with it.
    // Bend kept within 55 deg of the forearm's line)
    if (tab && !ALP()) for (const [w0, el, gk, hk] of [['wristL', 'elbowL', 'gripL', 'hdL'], ['wristR', 'elbowR', 'gripR', 'hdR']]) {
      const fd = v3.norm(v3.sub(J[w0], J[el])), dn = [0, -1, 0], wr = J[w0];
      let td = v3.norm(v3.add(fd, v3.mul(dn, X('WRD', 0) * (1 - air))));      /* (owner 2026-11-24 21:51 UTC "手腕就是又是成垂的…跟手腕断了一样…整个手、小臂、肩膀是连成一体的…都是可以主动": no droop by the hand's weight (was 0.15); the hand is held in line with the forearm) */
      // (owner 2026-11-24 21:07 UTC: "你单板你手背永远是朝上的…摸雪的时候是手心朝下，手背朝上，你手的 orientation 不能反掉". A forearm hanging
      // straight down held the hand pointing at the snow, and a hand pointing down has no "back up". A rider's hand reaches out over the snow
      // instead: the fingers are turned out from the body and toward the nose as far as the forearm hangs (the wrist's own 55 deg still holds))
      if (X('HBU', 1) > 0) { const hz0 = v3.add(v3.sub(J[w0], v3.mul(v3.add(J.shL, J.shR), 0.5)), v3.mul(v3.norm(v3.sub(J.ankleL, J.ankleR)), 0.15)), hz = v3.sub(hz0, v3.mul(dn, v3.dot(hz0, dn)));
        if (v3.len(hz) > 1e-4) td = v3.norm(v3.add(td, v3.mul(v3.norm(hz), X('HBO', 0.4) * smooth(0.3, 0.9, v3.dot(fd, dn))))); }
      let flS = 0; if (sec.snowY) { const hgt = J[gk][1] - snY(J[gk]), fl = (1 - smooth(0.02, 0.09, hgt)) * (1 - air); flS = fl; if (fl > 0) { const hz = v3.sub(fd, v3.mul(dn, v3.dot(fd, dn))); if (v3.len(hz) > 1e-4) td = v3.norm(v3.lerp(td, v3.norm(v3.add(v3.norm(hz), v3.mul(dn, 0.12))), fl)); } }
      // (SNT: the hand going down to the snow lays itself on it from where the wrist is, not by the fist's height alone. That rule turned the hand
      // flat (55 deg) over the last 7 cm whatever the wrist could do: with the arm at full reach the wrist stays 8-9 cm up, and the flat hand then
      // hung 4-5 cm over the snow it could have touched, and it went flat and back in a few frames as the fist crossed that band (9-21 deg a
      // frame). Now, from two hand lengths up, the hand turns toward the snow, 20 deg off straight down toward its heading (a hand let straight
      // down onto the snow has to swing 9 deg for the first millimetre the wrist sinks); from a hand's length up its middle is on the snow line
      // and it lies flatter only as far as the wrist comes lower. Its heading is the nose's, turned toward the forearm's own as far as that leans)
      const wS = hk === 'hdR' ? sntW : 0;
      if (wS > 0.0005 && sec.snowY) { const td0 = v3.norm(v3.add(fd, v3.mul(dn, 0.15 * (1 - air)))), g = L.grip, eq = sec.ez || {}, q0 = eq['bwr' + hk + 0], q1 = eq['bwr' + hk + 1], q2 = eq['bwr' + hk + 2], tp = q0 && q1 && q2 ? [q0.o[0], q1.o[0], q2.o[0]] : null, tl = tp ? v3.len(tp) : 0,
          dh = wr[1] - snY(tl > 0.5 ? v3.mad(wr, tp, g / tl) : wr) - sntO - 0.012,      // (over the snow under the hand's middle, where it was last frame: under the wrist the snow of a bowl or a wall lies 1-2 cm lower, the hand came down into it and the stop below held it, un-eased, 15 deg in a frame as it left)
          hz = v3.norm(v3.add(v3.mul(v3.sub(fd, v3.mul(dn, v3.dot(fd, dn))), 2), [-0.6, 0, 0])), c = clamp(dh / g, 0.2, 0.94),
          tS = v3.add(v3.mul(hz, Math.sqrt(1 - c * c)), v3.mul(dn, c)), k = (1 - smooth(0.95 * g, 2.4 * g, dh)) * (1 - air);
        td = v3.norm(v3.lerp(td, v3.norm(v3.lerp(td0, tS, k)), wS)); }
      if (K.ez && sec.pfDt > 0) { const kq = 'bwr' + hk, wq = X('WRW', 45) + 20 * air;      /* (WRW: the hand held with the forearm, not trailing it (was 18): 21:51 UTC "不是说一个被动") */ td = v3.norm([K.ez(sec, kq + 0, td[0], wq), K.ez(sec, kq + 1, td[1], wq), K.ez(sec, kq + 2, td[2], wq)]); }
      const ca = v3.dot(td, fd), BM0 = (X('WRB', 25) + X('WRBS', 50) * Math.max(wS, flS)) * Math.PI / 180, BM = K.ez && sec.pfDt > 0 && X('WRBE', 10) > 0 ? K.ez(sec, 'bwb' + hk, BM0, X('WRBE', 10)) : BM0, CM = Math.cos(BM);      /* (WRBE: the cap itself eased: it rose 50 deg over the last 7 cm to the snow and the hand swung with it, 20-29 mm/frame^2) */      /* (owner 22:58 UTC screenshot "还是手背摸雪": round 20 held the wrist within 50 deg even on the snow, so a hand let down from a steep forearm met the snow with its fingertips and knuckles, the back of the hand toward the camera. Laying a palm flat under a steep forearm takes the wrist bent back 60-75 deg, as a real one does; only touching, the hanging hand keeps 25) */      // (SNT: lying on the snow under a hanging forearm the wrist bends back further, to 75)
      // (WRSS, owner 2026-11-26 "后手扶雪时抖": the cap is soft, from WRSS short of it: held hard, the hand stopped dead against it every deep
      // turn as the forearm swung on, the fist 20-29 mm/frame^2 off its path, the back hand's jolts on the snow)
      { const SS = X('WRSS', 12) * Math.PI / 180, a0 = Math.acos(clamp(ca, -1, 1)), b0 = BM - SS;
        if (SS > 0 ? a0 > b0 : ca < CM) { const a1 = SS > 0 ? b0 + SS * Math.tanh((a0 - b0) / SS) : BM, pp = v3.sub(td, v3.mul(fd, ca)), pl = v3.len(pp); td = pl > 1e-4 ? v3.add(v3.mul(fd, Math.cos(a1)), v3.mul(pp, Math.sin(a1) / pl)) : fd; } }
      // (and the fingers turned out (HBO) never into a thigh: facing forward the back hand sits behind its hip, and the fingers turned toward the
      // nose went 3 cm into the back thigh. Where the hand's end comes nearer a thigh's line than HBT, it is turned away by what is missing)
      if (X('HBU', 1) > 0) for (const [h0, k0] of [[J.hipL, J.kneeL], [J.hipR, J.kneeR]]) { const g0 = v3.mad(wr, td, L.grip), r = segSeg(g0, g0, h0, k0), m = X('HBT', 0.145) - r.d; if (m > 0) td = v3.norm(v3.sub(v3.mad(g0, r.n, m), wr)); }
      J[hk] = td; J[gk] = v3.mad(wr, td, L.grip);
      // (and the drawn hand itself never in the snow: the fist the arm is solved for may now lie under the snow line (see snk), the hand bent flat is what must stay on it)
      if (sec.snowY && X('SFW', 0) > 0 && air < 0.5) { const g = J[gk], sn = snY(g) + lerp(0.012, -0.006, wS) + (hk === 'hdR' ? sntO : 0); if (g[1] < sn) {      /* (SNT: the eased hand above keeps its middle on the line; this stop only catches what the ease leaves, a glove's skin deeper) */ let d2 = v3.norm(v3.sub([g[0], sn, g[2]], wr));
          // (SNT: exactly onto the line, turned up about the wrist in its own upright plane: aimed at the point over the fist and then run on a
          // hand's length, a hand hanging near straight down came out under the snow line, by up to 2.5 cm)
          if (wS > 0.0005) { const hl2 = Math.hypot(d2[0], d2[2]), hz = hl2 > 0.05 ? [d2[0] / hl2, 0, d2[2] / hl2] : [-1, 0, 0], c = clamp((wr[1] - sn) / L.grip, -0.35, 1); d2 = v3.norm(v3.lerp(d2, v3.add(v3.mul(hz, Math.sqrt(1 - c * c)), [0, -c, 0]), wS)); }
          // (owner 21:51 UTC "跟手腕断了一样": this stop bent the wrist back up to 95-101 deg where a straight hand hung over the snow. A wrist bends back
          // no more than WRBG; past that the hand only brushes the snow (21:52 UTC "手轻轻的轻抚这个地"), the arm itself having been laid there (ARMC))
          { const fd2 = v3.norm(v3.sub(wr, J[el])), ca2 = v3.dot(d2, fd2), BG = X('WRBG', 75) * Math.PI / 180; if (ca2 < Math.cos(BG)) { const pp = v3.sub(d2, v3.mul(fd2, ca2)), pl = v3.len(pp); if (pl > 1e-4) d2 = v3.add(v3.mul(fd2, Math.cos(BG)), v3.mul(pp, Math.sin(BG) / pl)); } }
          J[hk] = d2; J[gk] = v3.mad(wr, d2, L.grip); } }
    }
    // (GRB, 单板空中动作 2026-11-25: the hand that grabs is ON the board, last of all, whatever the passes above did with it. Each grab its hand and
    // its place (along the board from the middle, + toward the nose; across, + the toe edge; m). The arm is solved from the shoulder to the wrist
    // a hand's length off that place along the line back to the shoulder, the elbow bending the way it already pointed)
    if (tab && X('GRB', 1) > 0 && gM > 0.001) { const gk = gKH || 1, E = BD.hw + 0.01, Eh = E + X('GRBH', 0.04), G = [null, [1, -0.06, E, 1], [-1, 0.06, E, 1], [-1, X('GRBM', 0.12), -Eh, -1], [-1, X('GRBM', 0.12) + 0.02, -Eh, -1], [1, -X('GRBM', 0.12), -Eh, -1], [-1, 0.62, 0, 1], [1, -0.62, 0, -1]].at(gk) || [1, -0.06, E, 1];      // (4th: the side the elbow goes, + toe: a hand on the heel edge or the tail reaches behind the leg, round it, not through the thigh)
      const Ub = v3.norm(fr(bb, 0, 1, 0)), a0 = v3.sub(J.ankleL, J.ankleR), A = v3.norm(v3.sub(a0, v3.mul(Ub, v3.dot(a0, Ub)))); let T = v3.norm(v3.cross(Ub, A)); if (v3.dot(T, v3.sub(J.kneeL, J.ankleL)) < 0) T = v3.mul(T, -1);
      const P = v3.add(O, v3.add(v3.mul(A, G[1]), v3.add(v3.mul(T, G[2]), v3.mul(Ub, X('GRBU', 0.03))))), sd = G[0] < 0 ? 'L' : 'R', g = sd === 'L' ? gL : gR;
      if (g > 0.001) { const sh = J['sh' + sd], a = L.uarm, b = L.farm, toS = v3.norm(v3.sub(sh, P)), W1 = v3.add(O, v3.add(v3.mul(A, G[3] < 0 ? (sd === 'L' ? 1 : -1) * X('GRBA', 0.5) : G[1]), v3.add(v3.mul(T, G[3] < 0 ? G[2] : X('GRBX', 0.65)), v3.mul(Ub, X('GRBY', 0.2))))), W2 = v3.mad(P, toS, L.grip), W0 = J['wrist' + sd], Wt = v3.add(v3.mul(W0, (1 - g) * (1 - g)), v3.add(v3.mul(W1, 2 * g * (1 - g)), v3.mul(W2, g * g)));      /* (the hand's way down is a curve through W1, a place clear of the drawn-up knees: for a toe-edge grab in front of them, for the heel edge or the tail out past the knee toward that end of the board. Straight down, the knees came up into it, the thigh 8-13 cm through the hand) */
        const d = v3.sub(Wt, sh), l = Math.max(1e-3, smin(v3.len(d), (a + b) * 0.999, X('GRBS', 0.06))), u =      /* (softly to the reach: a hard stop kinked the elbow, 3-5 deg jolts, as the hand came within it) */ v3.mul(d, 1 / Math.max(v3.len(d), 1e-6)), x = (a * a - b * b + l * l) / (2 * l), h = Math.sqrt(Math.max(0, a * a - x * x));
        const oc = v3.sub(sh, J.pelvis), out = v3.norm(v3.sub(oc, v3.mul(Ub, v3.dot(oc, Ub)))), e0 = J['elbow' + sd], w0 = J['wrist' + sd], pe = v3.add(v3.sub(e0, sh), v3.add(v3.mul(out, X('GRBP', 0.15)), v3.add(v3.mul(T, G[3] * X('GRBT', 0.2)), v3.mul(A, (sd === 'L' ? 1 : -1) * X('GRBQ', 0))))); let pp = v3.sub(pe, v3.mul(u, v3.dot(pe, u))); if (v3.len(pp) < 1e-4) pp = v3.cross(u, Ub); pp = v3.norm(pp);
        const e = v3.add(sh, v3.add(v3.mul(u, x), v3.mul(pp, h))), w = v3.mad(sh, u, l), gp = v3.lerp(J['grip' + sd], P, g);
        J['elbow' + sd] = v3.lerp(e0, e, g); J['wrist' + sd] = v3.lerp(w0, w, g);      /* (blended in with the grab: at g near 0 the solved elbow was not the one the passes above left, and it jumped) */ const wb = J['wrist' + sd], hd = v3.norm(v3.sub(gp, wb)); J['hd' + sd] = hd; J['grip' + sd] = v3.mad(wb, hd, L.grip); } }
    // (FCL, owner 2026-11-26 "小跳时小臂穿进大腿": last of all, the forearm (elbow to wrist to fist) is held off both thighs, whatever put it there:
    // in the air the knees come up into an arm still on its way down or back (grab, release, the hop's own tuck), 0.7-5 cm apart, line to line.
    // The wrist goes out along the shortest way off the thigh by what is missing, with a soft start (no kink where it begins), the elbow solved
    // again from the shoulder, the hand kept as it pointed)
    if (tab && X('FCL', 1) > 0) { const M = X('FCM', 0.125), S = X('FCS', 0.03);
      for (const sd of ['L', 'R']) { const w00 = J['wrist' + sd], e00 = J['elbow' + sd], g00 = J['grip' + sd];
      for (let it = 0; it < X('FCI', 4); it++) { let best = 0, nrm = null;
        for (const [h0, k0] of [[J.hipL, J.kneeL], [J.hipR, J.kneeR]]) for (const [a0, a1] of [[J['elbow' + sd], J['wrist' + sd]], [J['wrist' + sd], J['grip' + sd]]]) {
          const r = segSeg(a0, a1, h0, k0), m = M - r.d, amt = m >= S ? m : m > -S ? (m + S) * (m + S) / (4 * S) : 0; if (amt > best) { best = amt; nrm = r.n; } }
        if (!nrm) break;
        const sh = J['sh' + sd], d = v3.mul(nrm, best), w = v3.add(J['wrist' + sd], d), e1 = v3.add(J['elbow' + sd], d), e = K.ik2(sh, w, L.uarm, L.farm, v3.sub(e1, v3.lerp(sh, w, 0.5))), wr = v3.mad(e, v3.norm(v3.sub(w, e)), L.farm);
        J['elbow' + sd] = e; J['grip' + sd] = v3.add(J['grip' + sd], v3.sub(wr, J['wrist' + sd])); J['wrist' + sd] = wr; }
        if (X('FCW', 0) > 0 && K.ez && sec.pfDt > 0) { const D = v3.sub(J['wrist' + sd], w00), De = [0, 1, 2].map(c => K.ez(sec, 'fc' + sd + c, D[c], X('FCW', 0)));
          J['wrist' + sd] = w00; J['elbow' + sd] = e00; J['grip' + sd] = g00;
          if (v3.len(De) > 1e-5) { const sh = J['sh' + sd], w = v3.add(w00, De), e = K.ik2(sh, w, L.uarm, L.farm, v3.sub(v3.add(e00, De), v3.lerp(sh, w, 0.5))), wr = v3.mad(e, v3.norm(v3.sub(w, e)), L.farm);
            J['elbow' + sd] = e; J['grip' + sd] = v3.add(g00, v3.sub(wr, w00)); J['wrist' + sd] = wr; } } } }
    J.tipL = J.gripL.slice(); J.tipR = J.gripR.slice(); J.plantedL = 0; J.plantedR = 0;
    J.dragL = deep * (ts > hs ? 1 : 1) * (1 - gM) * (tab ? (1 - wSk) * (lean > 0 ? 1 : 0) : 1);      // (how much the front hand is down on the snow: the spray reads it)
    // (SNT: the snow a hand throws comes from the hand that is on the snow, while it is on it. With the back hand the one that goes down on a toe
    // turn, the spray still rose under the FRONT hand, 25 cm and more up in the air, whenever the lean passed 52 deg, and the hand resting on the snow
    // threw none. Each hand's own contact now: its drawn middle within 2-5 cm of the snow under it)
    if (tab && !ALP() && X('SNT', 0) > 0 && snY) { const ct = k => (1 - smooth(0.02, 0.05, J[k][1] - snY(J[k]))) * (1 - air) * (1 - gM); J.dragL = ct('gripL'); J.dragR = ct('gripR'); }
    // (owner 2026-11-24 21:07 UTC, "手背永远是朝上的…手的 orientation 不能反掉": the board's open glove (08h_labrig.js K.openGlove) rides wholly on
    // the hand bone, whose roll came from d, the pole's direction, so the back of the hand faced wherever d's square part did, down onto the
    // snow at every touch. Now the bone is turned so the glove's own back (K.gloveAxes, read once from the bind pose) faces up off the snow, a
    // little out from the body (so a hand pointing nearly up or down still has a side to face), eased)
    const handX = (sd, hy, wr) => { if (!tab || !(X('HBU', 1) > 0) || !K.gloveAxes || !K.bind) return null;
      const GA = K._gax || (K._gax = {}); if (GA[sd] == null) { try { const ax = K.gloveAxes(K.bind, sd), Fb = K.bind.F[B['hand' + sd]], bx = v3.dot(ax.bk, [Fb[0], Fb[1], Fb[2]]), bz = v3.dot(ax.bk, [Fb[8], Fb[9], Fb[10]]); GA[sd] = Math.atan2(bz, bx); } catch (e) { return null; } }
      const Y = v3.norm(hy), up = sec.snowY && snY ? (() => { const ex = 0.05, gx = (snY(v3.add(wr, [ex, 0, 0])) - snY(v3.sub(wr, [ex, 0, 0]))) / (2 * ex), gz = (snY(v3.add(wr, [0, 0, ex])) - snY(v3.sub(wr, [0, 0, ex]))) / (2 * ex); return v3.norm([-gx, 1, -gz]); })() : [0, 1, 0];
      const o0 = v3.sub(wr, pel), o = v3.sub(o0, v3.mul(up, v3.dot(o0, up))), pj = v => v3.sub(v, v3.mul(Y, v3.dot(v, Y)));
      let Bw = v3.add(pj(up), v3.mul(pj(v3.len(o) > 1e-4 ? v3.norm(v3.add(v3.norm(o), v3.mul(up, X('HBUO', 0.6)))) : [0, 0, 0]), X('HBS', 0.35)));      /* (the out side tipped up too: a hand pointing down and in under the body had "out" square to it pointing down) */
      if (K.ez && sec.pfDt > 0) { const kq = 'bhb' + sd; Bw = [K.ez(sec, kq + 0, Bw[0], 14), K.ez(sec, kq + 1, Bw[1], 14), K.ez(sec, kq + 2, Bw[2], 14)]; }
      Bw = pj(Bw); if (v3.len(Bw) < 1e-4) return null; const P = v3.norm(Bw), Q = v3.cross(P, Y), th = GA[sd];
      return v3.add(v3.mul(P, Math.cos(th)), v3.mul(Q, -Math.sin(th))); };
    const hxL = handX('L', J.hdL || v3.sub(J.gripL, J.elbowL), J.wristL), hxR = handX('R', J.hdR || v3.sub(J.gripR, J.elbowR), J.wristR);
    return frames(J, F, { pb, t1, t2, hb, hL, hR, fbL, fbR, bb, O, pel, hipL, hipR, c, hinge, up2, id, nY, hxL, hxR });
  }
  function frames(J, F, o) {
    const { pb, t1, t2, hb, hL, hR, fbL, fbR, bb, O, pel, hipL, hipR, c, hinge, up2, id, nY, hxL, hxR } = o;
    // ---- frames, as the skier's (08_skier.js)
    F[B.pelvis] = m4.fromBasis(pb.X, pb.Y, pb.Z, pel);
    F[B.spine] = frameXY(pel, v3.sub(J.chest, pel), v3.add(pb.X, t1.X));
    F[B.chest] = frameXY(J.chest, v3.sub(J.neck, J.chest), t2.X);
    F[B.neck] = frameXY(J.neck, nY, v3.add(t2.X, hb.X));
    F[B.head] = m4.fromBasis(hb.X, hb.Y, hb.Z, J.skull);
    const limb = (i0, a, b2, c2, xh) => { const ax = v3.cross(v3.sub(b2, a), v3.sub(c2, b2)); const hx = v3.len(ax) > 1e-4 ? v3.norm(ax) : xh; F[i0] = frameXY(a, v3.sub(b2, a), hx); F[i0 + 1] = frameXY(b2, v3.sub(c2, b2), hx); };
    limb(B.uarmL, J.shL, J.elbowL, J.hdL ? J.wristL : J.gripL, [1, 0, 0]); { const hy = J.hdL || v3.sub(J.gripL, J.elbowL); F[B.handL] = frameXY(J.wristL, hy, hxL || v3.cross(hy, hL.d)); }
    limb(B.uarmR, J.shR, J.elbowR, J.hdR ? J.wristR : J.gripR, [1, 0, 0]); { const hy = J.hdR || v3.sub(J.gripR, J.elbowR); F[B.handR] = frameXY(J.wristR, hy, hxR || v3.cross(hy, hR.d)); }
    // (WTW, owner 2026-11-26 20:44 UTC screenshot "为什么手和胳膊断开了": the hand's roll is chosen for the glove's back (handX) and the forearm's
    // from the elbow's hinge, each on its own, so the hand stood up to 95-120 deg turned about the forearm from it, and the skin between them was
    // wrung to a point at the wrist, the glove left hanging off the sleeve. A forearm turns along its length (pronation): half of that turn now
    // goes to the forearm itself, and what is left between it and the hand is held within WTC; measured against the bind pose, where they agree)
    if (X('WTW', 1) > 0 && K.bind && K.bind.F) { const BF = K.bind.F, col = (m, c) => [m[c * 4], m[c * 4 + 1], m[c * 4 + 2]], WTC = X('WTC', 40) * Math.PI / 180;
      const twist = (fi, hi) => { const Ff = F[fi], Fh = F[hi], Bf = BF[fi], Bh = BF[hi]; if (!Ff || !Fh || !Bf || !Bh) return 0;
          // (the hand's X as the forearm's bind relation would place it, and the turn about the forearm between that and the real one)
          const fx = col(Ff, 0), fy = col(Ff, 1), fz = col(Ff, 2), bx = col(Bf, 0), by = col(Bf, 1), bz = col(Bf, 2), hb = col(Bh, 0), loc = [v3.dot(hb, bx), v3.dot(hb, by), v3.dot(hb, bz)],
            ex = v3.add(v3.add(v3.mul(fx, loc[0]), v3.mul(fy, loc[1])), v3.mul(fz, loc[2])), hx = col(Fh, 0), pj = v => v3.sub(v, v3.mul(fy, v3.dot(v, fy)));
          const a = pj(ex), b = pj(hx); if (v3.len(a) < 1e-3 || v3.len(b) < 1e-3) return 0; return Math.atan2(v3.dot(v3.cross(a, b), fy), v3.dot(a, b)); },
        spin = (m, ax, th) => { const c = Math.cos(th), sn = Math.sin(th), r = v => v3.add(v3.add(v3.mul(v, c), v3.mul(v3.cross(ax, v), sn)), v3.mul(ax, v3.dot(ax, v) * (1 - c)));
          return m4.fromBasis(r(col(m, 0)), r(col(m, 1)), r(col(m, 2)), col(m, 3)); };
      for (const [fi, hi] of [[B.farmL, B.handL], [B.farmR, B.handR]]) { const th = twist(fi, hi); if (!th) continue;
        const ay = v3.norm(col(F[fi], 1)); F[fi] = spin(F[fi], ay, th * X('WTW', 1) * 0.5);
        const t2w = twist(fi, hi); if (Math.abs(t2w) > WTC) F[hi] = spin(F[hi], ay, -(Math.abs(t2w) - WTC) * Math.sign(t2w)); } }
    limb(B.thighL, hipL, J.kneeL, J.ankleL, [-1, 0, 0]); limb(B.thighR, hipR, J.kneeR, J.ankleR, [-1, 0, 0]);
    F[B.footL] = m4.fromBasis(fbL.X, fbL.Y, fbL.Z, J.footL); F[B.footR] = m4.fromBasis(fbR.X, fbR.Y, fbR.Z, J.footR);
    F[B.poleL] = frameXY(J.gripL, v3.mul(J.poleDL, -1), [1, 0, 0]); F[B.poleR] = frameXY(J.gripR, v3.mul(J.poleDR, -1), [1, 0, 0]);
    // the board itself (its own space: x toward the toe edge, y up, -z the nose)
    const Mb = m4.fromBasis(v3.mul(bb.Z, -1), bb.Y, bb.X, O);
    // ---- a quarter turn into the figure's space
    for (const k in J) if (Array.isArray(J[k]) && J[k].length === 3) J[k] = Qp(J[k]);
    for (let i = 0; i < F.length; i++) if (F[i]) F[i] = m4.mul(QM, F[i]);
    J.boardC = Qp(O); J.boardM = m4.mul(QM, Mb);
    return { J, F, hb: Qb(hb), t1: Qb(t1), t2: Qb(t2), pb: Qb(pb), fbL: Qb(fbL), fbR: Qb(fbR), caps: [], c, hinge, up2, dp: null, hp: [null, null], br: id ? id.br : 0, board: true };
  }
  // ---- the board's mesh, in its own space (x toward the toe edge, y up, -z the nose; the middle of the base at 0): a twin with a waist, round
  // nose and tail kicked well up past the contact points (it rides on its running length only), a little thicker under the bindings. Made for the left foot's bone (K.build places it there by .at)
  function mesh() {
    const mb = meshBuilder(), rings = [], N = 72, hl = BD.len / 2, flat = BD.run;
    for (let i = 0; i <= N; i++) {
      const t = i / N, z = lerp(hl, -hl, t), az = Math.abs(z);
      // sidecut: widest at the contact points, waist between; rounded ends
      let w = lerp(BD.waist, BD.hw + 0.020, smooth(0.0, flat, az) ** 2);
      if (az > flat) w *= Math.sqrt(Math.max(0.04, 1 - ((az - flat) / (hl - flat + 0.004)) ** 2));
      // (only the running length between the contact points lies on the snow; past them nose and tail curve up, the nose higher: 8.5 cm, 6.5)
      const yb = (z < 0 ? BD.kickN : BD.kickT) * Math.pow(smooth(flat - 0.02, hl, az), 1.5), th = lerp(0.006, BD.th, smooth(hl, 0.3, az));
      const r = [[-w, yb], [w, yb], [w, yb + th * 0.55], [w * 0.97, yb + th], [-w * 0.97, yb + th], [-w, yb + th * 0.55]];
      rings.push(r.map(q => [[q[0], q[1], z], [0, 1, 0]]));
    }
    mb.sweep(rings, [9, 1, 0, 0], [0, 0, 1], [0, 0, -1]);
    const mm = mb.done();
    return mm;
  }
  // the part handed to Skier.build: the board mesh, and where it sits in the left foot's frame (that frame is the board's turned by the binding)
  K.boardPart = function () {
    const s = solve(K.P0), m = K.fixMesh(mesh());
    m.at = m4.mul(m4.invert(s.F[B.footL]), s.J.boardM);
    return m;
  };
  K.alp = ALP;
  K.solveBoard = (p, sec) => VS && VS.val.sbsol !== 'a' ? solve2(p, sec) : solve(p, sec);
  return { BD, solve, on: () => !!(VS && VS.val.ride === 'b') };
})();
