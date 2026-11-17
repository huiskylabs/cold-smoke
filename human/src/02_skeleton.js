// ---------------------------------------------------------------- Human: the skeleton (59 bones) and how a pose is turned into bone rotations
// Coordinates: metres, y up, z forward (the way the body faces), x to the body's LEFT. Canonical rest pose: the T-pose, arms straight out along
// +-x, palms down, thumbs forward; legs straight, feet forward. Every bone's rest frame is the world frame, so a bone's local rotation is simply its
// rotation relative to its parent, and a point given in canonical space x_c rides bone b to  R_b (x_c - J_b) + P_b.
// Bone list: the research/02 Tier A list (VRM / Unity Humanoid superset): scapula, twist bones, a 5-piece spine and the foot bones are driven by
// code from measured rhythms and are never set directly.
// A pose is given anatomically (degrees): spine flexion, arm elevation and plane, hip flexion ... (see Human.restPose), and turned into bone rotations
// here: the spine's bend spread over five bones by measured shares, the shoulder girdle placed by the scapulohumeral rhythm, pronation spread over the
// forearm by twist bones. The right side is computed as the left and mirrored.
(() => {
  const V = Human.v3, Q = Human.q, D = Human.DEG, clamp = Human.clamp;
  // name, parent, canonical joint position (mm, at stature 1756; left side, +x), and which landmark scale applies
  const BONES = [
    ['root', null, [0, 0, 0]],
    ['pelvis', 'root', [0, 930, -20]],
    ['lumbar_lo', 'pelvis', [0, 1010, -58]],
    ['lumbar_hi', 'lumbar_lo', [0, 1095, -60]],
    ['thorax_lo', 'lumbar_hi', [0, 1180, -64]],
    ['thorax_mid', 'thorax_lo', [0, 1280, -70]],
    ['thorax_hi', 'thorax_mid', [0, 1390, -68]],
    ['neck_lo', 'thorax_hi', [0, 1505, -58]],
    ['neck_hi', 'neck_lo', [0, 1562, -40]],
    ['head', 'neck_hi', [0, 1608, -22]],
    ['jaw', 'head', [0, 1605, 2]],
    ['eye_L', 'head', [32, 1668, 72]],
    ['eye_R', 'head', [-32, 1668, 72]],
  ];
  const SIDE = [
    ['clavicle', 'thorax_hi', [22, 1440, 48]],
    ['scapula', 'clavicle', [182, 1446, -12]],
    ['upperarm', 'scapula', [176, 1404, -6]],
    ['upperarm_twist_01', 'upperarm', [176 + 110, 1404, -6]],
    ['upperarm_twist_02', 'upperarm', [176 + 220, 1404, -6]],
    ['forearm', 'upperarm', [506, 1404, -6]],
    ['forearm_twist_01', 'forearm', [506 + 85, 1404, -6]],
    ['forearm_twist_02', 'forearm', [506 + 170, 1404, -6]],
    ['hand', 'forearm', [762, 1404, -6]],
    ['thumb_cmc', 'hand', [774, 1394, 18]],
    ['thumb_mcp', 'thumb_cmc', [806, 1388, 42]],
    ['thumb_ip', 'thumb_mcp', [834, 1386, 56]],
    ['fingers_mcp', 'hand', [858, 1402, -2]],
    ['fingers_ip', 'fingers_mcp', [902, 1401, -2]],
    ['thigh', 'pelvis', [88, 895, 4]],
    ['thigh_twist', 'thigh', [89, 683, 4]],
    ['shin', 'thigh', [91, 490, 2]],          // the knee turns about the femur's condyles, ~2 cm above the joint line (tibiale, 0.266 H)
    ['shin_twist', 'shin', [91, 272, 0]],
    ['talus', 'shin', [91, 76, -6]],
    ['foot', 'talus', [91, 50, -20]],
    ['midfoot', 'foot', [96, 36, 46]],
    ['toe_hallux', 'midfoot', [72, 20, 140]],
    ['toes_lesser', 'midfoot', [112, 16, 124]],
  ];
  for (const sd of ['L', 'R']) for (const [n, par, j] of SIDE)
    BONES.push([n + '_' + sd, par === 'pelvis' || par === 'thorax_hi' ? par : par + '_' + sd, sd === 'L' ? j : [-j[0], j[1], j[2]]]);
  Human.BONE_NAMES = BONES.map(b => b[0]);
  const REF = {}; BONES.forEach(b => REF[b[0]] = b[2]);             // reference joint positions (mm, stature 1756)

  // canonical joint positions for a body: heights scale with stature (the landmark fractions are near constant across people), the shoulders with
  // the biacromial breadth, the hips with the pelvis
  function build(M) {
    const k = M.S / 1756, sh = M.B.biacromial / 411 / k, hp = (M.B.bicristal / 275) * (1 + 0.05 * M.sex) / k * (M.S / 1756) / k;
    const bones = BONES.map(([name, parent, j], i) => {
      let x = j[0], y = j[1], z = j[2];
      const arm = /clavicle|scapula|upperarm|forearm|hand|thumb|fingers/.test(name) && !/clavicle/.test(name);
      if (arm) x = Math.sign(x) * (Math.abs(x) - 176 + 176 * sh);               // the whole arm moves out with the shoulder
      else if (/scapula/.test(name)) x *= sh;
      if (/thigh|shin|talus|foot|toe/.test(name)) x *= hp;
      return { name, parent, i, J: [x * k / 1000, y * k / 1000, z * k / 1000] };
    });
    const idx = {}; bones.forEach(b => idx[b.name] = b.i);
    bones.forEach(b => { b.p = b.parent ? idx[b.parent] : -1; });
    bones.forEach(b => { b.children = bones.filter(c => c.p === b.i).map(c => c.i); });
    return { bones, idx, M, n: bones.length };
  }

  // ---- the anatomical pose (degrees). Zero is the anatomical standing position with the palms facing the thighs (forearm mid-prone).
  // arm: elev = thoracohumeral elevation from hanging (0) through horizontal (90) to overhead (180); plane = 0 out to the side (abduction plane),
  // 90 straight forward (flexion plane), -45 behind; axial = humeral rotation (+ internal); elbow flexion; pron (+ pronation, - supination);
  // wflex (+ palm-ward), wdev (+ ulnar); grip 0..1 (fingers curl); thumb 0..1. shrug, protract: extra clavicle elevation / protraction (deg).
  // leg: flex (hip), abd (+ out), rot (+ internal), knee (flexion), ankle (+ plantarflexion, - dorsiflexion), inv (+ inversion, subtalar), toe (+ up).
  // spine: flex (+ forward), lat (+ to the left), twist (+ shoulders turned to the left). neck: flex, lat, yaw (+ to the left).
  // root: pos (metres, added to the pelvis), rot (deg, x y z intrinsic: x + tips the pelvis forward).
  Human.restPose = () => ({
    root: { pos: [0, 0, 0], rot: [0, 0, 0] }, spine: { flex: 0, lat: 0, twist: 0 }, neck: { flex: 0, lat: 0, yaw: 0 }, jaw: 0,
    arm_L: { elev: 0, plane: 0, axial: 0, elbow: 0, pron: 0, wflex: 0, wdev: 0, grip: 0.3, thumb: 0.25, shrug: 0, protract: 0 },
    arm_R: { elev: 0, plane: 0, axial: 0, elbow: 0, pron: 0, wflex: 0, wdev: 0, grip: 0.3, thumb: 0.25, shrug: 0, protract: 0 },
    leg_L: { flex: 0, abd: 0, rot: 0, knee: 0, ankle: 0, inv: 0, toe: 0 },
    leg_R: { flex: 0, abd: 0, rot: 0, knee: 0, ankle: 0, inv: 0, toe: 0 },
  });
  // joint ranges (CDC / Soucie 2011 and AAOS normative values; research/02). A pose outside them is clamped and the overrun reported.
  const ROM = {
    spine: { flex: [-30, 90], lat: [-35, 35], twist: [-45, 45] }, neck: { flex: [-55, 50], lat: [-40, 40], yaw: [-75, 75] },
    arm: { elev: [0, 175], plane: [-90, 135], axial: [-90, 70], elbow: [0, 148], pron: [-85, 80], wflex: [-65, 75], wdev: [-20, 30], grip: [0, 1], thumb: [0, 1], shrug: [-10, 30], protract: [-20, 30] },
    leg: { flex: [-18, 130], abd: [-20, 45], rot: [-45, 45], knee: [0, 140], ankle: [-25, 55], inv: [-10, 25], toe: [-35, 80] },
  };
  Human.ROM = ROM;
  Human.clampPose = pose => {
    const over = [];
    const cl = (o, R, tag) => { for (const k in R) if (o[k] != null) { const [a, b] = R[k], v = clamp(o[k], a, b); if (v !== o[k]) over.push([tag + '.' + k, o[k] - v]); o[k] = v; } };
    cl(pose.spine, ROM.spine, 'spine'); cl(pose.neck, ROM.neck, 'neck');
    for (const s of ['L', 'R']) { cl(pose['arm_' + s], ROM.arm, 'arm_' + s); cl(pose['leg_' + s], ROM.leg, 'leg_' + s); }
    // hip internal rotation shrinks as the hip flexes (est.); deep flexion with the knee straight is limited by the hamstrings
    for (const s of ['L', 'R']) { const l = pose['leg_' + s]; const lim = 45 - 15 * clamp(l.flex / 110, 0, 1); if (l.rot > lim) { over.push(['leg_' + s + '.rot', l.rot - lim]); l.rot = lim; }
      const ham = 80 + 1.0 * l.knee; if (l.flex > ham) { over.push(['leg_' + s + '.flex(hamstrings)', l.flex - ham]); l.flex = ham; } }
    return over;
  };

  // shares of the trunk's bend per spine bone (lumbar_lo .. thorax_hi) and of the neck's per neck bone (neck_lo, neck_hi, head)
  const SPINE = { flex: [0.32, 0.24, 0.16, 0.14, 0.14], lat: [0.18, 0.22, 0.24, 0.22, 0.14], twist: [0.04, 0.06, 0.25, 0.35, 0.30] };
  const NECK = { flex: [0.30, 0.35, 0.35], lat: [0.35, 0.35, 0.30], yaw: [0.2, 0.3, 0.5] };
  const mirror = q => [q[0], -q[1], -q[2], q[3]];
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
  const ax = (a, deg) => Q.axis(a, deg * D);
  const HANG = ax(Z, -90);                         // T-pose arm (+x, palm down) -> hanging (palm toward the thigh)

  // the left arm's rotations in the thorax frame (as if the thorax were at rest): clavicle, scapula, humerus; then local rotations below the humerus
  function armLocal(a) {
    const e = a.elev, s = clamp((e - 15) / 135, 0, 1);
    // scapulohumeral rhythm (McClure 2001): through the raise the clavicle lifts 10 deg and draws back 20, the scapula turns upward 50, tilts back 30
    const clav = Q.mul(ax(Y, 20 * s - a.protract), ax(Z, 10 * s + a.shrug));
    const scapTh = Q.mul(clav, Q.mul(ax(Z, 40 * s), Q.mul(ax(X, -30 * s), ax(Y, 4 * s))));
    // humerus: from hanging, swung up by elev in the chosen plane, then turned about its own axis
    const pl = a.plane * D, swingAx = [-Math.sin(pl), 0, Math.cos(pl)];
    const sw = Q.axis(swingAx, e * D);
    const dir = Q.rot(sw, [0, -1, 0]);
    // the humerus keeps the palm's natural turn when raised in front (Codman): axial counted from that
    const humTh = Q.mul(Q.axis(dir, -a.axial * D), Q.mul(sw, HANG));
    const pr = a.pron * D;
    return {
      clavicle: clav,
      scapula: Q.mul(Q.conj(clav), scapTh),
      upperarm: Q.mul(Q.conj(scapTh), humTh),
      forearm: ax(Y, -a.elbow),
      hand: Q.mul(Q.axis(X, pr), Q.mul(ax(Z, -a.wflex), ax(Y, a.wdev))),
      fingers_mcp: ax(Z, -80 * a.grip), fingers_ip: ax(Z, -95 * a.grip),
      thumb_cmc: Q.mul(ax(X, 35 * a.thumb), ax(Z, -15 * a.thumb)), thumb_mcp: ax(Y, -35 * a.thumb), thumb_ip: ax(Y, -45 * a.thumb),
    };
  }
  const SUBTALAR = V.norm([-Math.sin(16 * D) * Math.cos(42 * D), Math.sin(42 * D), Math.cos(16 * D) * Math.cos(42 * D)]);
  const TALOCRURAL = V.norm([1, -Math.tan(8 * D), 0]);      // ~82 deg from vertical (Inman), the lateral end lower
  function legLocal(l) {
    return {
      thigh: Q.mul(ax(X, -l.flex), Q.mul(ax(Z, l.abd), ax(Y, -l.rot))),
      thigh_twist: ax(Y, l.rot * 0.5),                                       // the upper thigh's flesh follows half of the femur's own turn
      shin: Q.mul(ax(X, l.knee), ax(Y, -12 * clamp(l.knee / 90, 0, 1) + 4 * clamp(1 - l.knee / 15, 0, 1))),  // tibia turns in as the knee bends (screw-home)
      shin_twist: Q.id(),
      talus: Q.axis(TALOCRURAL, l.ankle * D),
      foot: Q.axis(SUBTALAR, -l.inv * D),
      midfoot: Q.id(),
      toe_hallux: ax(X, -l.toe), toes_lesser: ax(X, -l.toe * 0.85),
    };
  }

  // anatomical pose -> local rotation per bone (array of quaternions) + root position
  function poseLocals(sk, pose) {
    const L = sk.bones.map(() => Q.id()), I = sk.idx;
    const r = pose.root.rot;
    L[I.pelvis] = Q.euler(r[0] * D, r[1] * D, r[2] * D);
    const sp = pose.spine, nk = pose.neck;
    ['lumbar_lo', 'lumbar_hi', 'thorax_lo', 'thorax_mid', 'thorax_hi'].forEach((n, i) =>
      L[I[n]] = Q.mul(ax(X, sp.flex * SPINE.flex[i]), Q.mul(ax(Z, -sp.lat * SPINE.lat[i]), ax(Y, sp.twist * SPINE.twist[i]))));
    ['neck_lo', 'neck_hi', 'head'].forEach((n, i) =>
      L[I[n]] = Q.mul(ax(X, nk.flex * NECK.flex[i]), Q.mul(ax(Z, -nk.lat * NECK.lat[i]), ax(Y, nk.yaw * NECK.yaw[i]))));
    L[I.jaw] = ax(X, pose.jaw || 0);
    for (const s of ['L', 'R']) {
      const set = (o, mir) => { for (const k in o) { const q = o[k]; L[I[k + '_' + s]] = mir ? mirror(q) : q; } };
      const arm = armLocal(pose['arm_' + s]);
      // forearm twist bones as absolute shares of the pronation about the forearm axis (they are children of the forearm, which does not pronate)
      const pr = pose['arm_' + s].pron * D;
      arm.forearm_twist_01 = Q.axis(X, pr * 0.33); arm.forearm_twist_02 = Q.axis(X, pr * 0.66);
      // upper-arm twist bones: the humerus carries the full axial turn; the flesh near the shoulder is turned back by half, mid-arm by a quarter
      const axl = pose['arm_' + s].axial * D, hdir = [1, 0, 0];
      arm.upperarm_twist_01 = Q.axis(hdir, axl * 0.5); arm.upperarm_twist_02 = Q.axis(hdir, axl * 0.25);
      set(arm, s === 'R');
      set(legLocal(pose['leg_' + s]), s === 'R');
    }
    return L;
  }

  // forward kinematics: world rotation R and position P per bone
  function fk(sk, L, rootPos) {
    const n = sk.n, R = new Array(n), P = new Array(n);
    for (const b of sk.bones) {
      if (b.p < 0) { R[b.i] = L[b.i]; P[b.i] = b.J.slice(); continue; }
      const pr = R[b.p];
      R[b.i] = Q.norm(Q.mul(pr, L[b.i]));
      P[b.i] = V.add(P[b.p], Q.rot(pr, V.sub(b.J, sk.bones[b.p].J)));
      if (b.name === 'pelvis' && rootPos) P[b.i] = V.add(P[b.i], rootPos);
    }
    return { R, P };
  }
  // a pose -> world transforms (clamped to the joint ranges first; the overrun is returned)
  function pose(sk, anat) {
    const p = JSON.parse(JSON.stringify(anat)), over = Human.clampPose(p);
    const xf = fk(sk, poseLocals(sk, p), p.root.pos);
    xf.over = over; xf.anat = p;
    return xf;
  }
  // canonical point -> posed point on bone b
  const apply = (xf, sk, b, x) => V.add(xf.P[b], Q.rot(xf.R[b], V.sub(x, sk.bones[b].J)));
  const applyInv = (xf, sk, b, p) => V.add(sk.bones[b].J, Q.rot(Q.conj(xf.R[b]), V.sub(p, xf.P[b])));

  // interpolate two anatomical poses (every number linearly; the joint maths downstream keeps it smooth)
  Human.lerpPose = (a, b, t) => {
    const f = (x, y) => typeof x === 'number' ? x + (y - x) * t : Array.isArray(x) ? x.map((v, i) => f(v, y[i])) : Object.fromEntries(Object.keys(x).map(k => [k, f(x[k], y[k] != null ? y[k] : x[k])]));
    return f(a, b);
  };
  Human.Skeleton = { REF, build, pose, poseLocals, fk, apply, applyInv, armLocal, legLocal, SPINE, NECK };
})();
