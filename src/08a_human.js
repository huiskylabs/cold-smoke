// ---------------------------------------------------------------- kit ski motion (vendored)
// The carve, tuck and ski-jump clips from huiskylabs/code-only-game-kit (PR #7, Human.Motion),
// kept here so the dev pose can retarget them onto the game skier. The body mesh, skin and
// daily-mocap blocks of that module are not included: this game keeps its own mesh.
// Carve series: CC BY 3.0, jx3g4644, "Erika Terai als voorloper bij de slalom wedstrijd", Wikimedia Commons.

// ---------------------------------------------------------------- Human: small vector / quaternion / dual-quaternion helpers
// The human body module (human/) is self-contained: it reads no game globals and can be dropped into any page.
// Everything lives under the one global `Human`.
var Human = (typeof Human !== 'undefined' && Human) || {};
(() => {
  const V = Human.v3 = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
    mad: (a, b, s) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    len: a => Math.hypot(a[0], a[1], a[2]),
    norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
    lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
  };
  // quaternions [x, y, z, w]
  const Q = Human.q = {
    id: () => [0, 0, 0, 1],
    axis(ax, ang) { const s = Math.sin(ang / 2), n = V.norm(ax); return [n[0] * s, n[1] * s, n[2] * s, Math.cos(ang / 2)]; },
    mul(a, b) { return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]]; },
    conj: a => [-a[0], -a[1], -a[2], a[3]],
    norm(a) { const l = Math.hypot(a[0], a[1], a[2], a[3]) || 1; return [a[0] / l, a[1] / l, a[2] / l, a[3] / l]; },
    rot(q, v) { const x = q[0], y = q[1], z = q[2], w = q[3], tx = 2 * (y * v[2] - z * v[1]), ty = 2 * (z * v[0] - x * v[2]), tz = 2 * (x * v[1] - y * v[0]);
      return [v[0] + w * tx + y * tz - z * ty, v[1] + w * ty + z * tx - x * tz, v[2] + w * tz + x * ty - y * tx]; },
    // intrinsic X then Y then Z (radians)
    euler(x, y, z) { return Q.mul(Q.mul(Q.axis([1, 0, 0], x), Q.axis([0, 1, 0], y)), Q.axis([0, 0, 1], z)); },
    slerp(a, b, t) { let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; if (d < 0) { b = b.map(v => -v); d = -d; }
      if (d > 0.9995) return Q.norm(a.map((v, i) => v + (b[i] - v) * t)); const th = Math.acos(d), s = Math.sin(th), wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s; return a.map((v, i) => v * wa + b[i] * wb); },
    // swing-twist about a unit axis: returns [swing, twist], q = swing * twist
    swingTwist(q, ax) { const d = q[0] * ax[0] + q[1] * ax[1] + q[2] * ax[2]; let tw = [ax[0] * d, ax[1] * d, ax[2] * d, q[3]]; const l = Math.hypot(...tw); tw = l < 1e-9 ? [0, 0, 0, 1] : tw.map(v => v / l); return [Q.mul(q, Q.conj(tw)), tw]; },
    angle(q) { return 2 * Math.atan2(Math.hypot(q[0], q[1], q[2]), Math.abs(q[3])); },
    pow(q, t) { const [x, y, z, w] = q[3] < 0 ? q.map(v => -v) : q, s = Math.hypot(x, y, z); if (s < 1e-9) return [0, 0, 0, 1]; const a = Math.atan2(s, w) * t; return [x / s * Math.sin(a), y / s * Math.sin(a), z / s * Math.sin(a), Math.cos(a)]; },
  };
  Human.clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  Human.smooth = (a, b, x) => { const t = Human.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  Human.smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
  Human.DEG = Math.PI / 180;
})();

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

// ---------------------------------------------------------------- Human: motion (clips that play the anatomical pose over time)
// A clip is a function of its phase u (0..1) that returns an anatomical pose and a lift (m, for flight). Motion.sample puts the lowest point of
// the feet (heel, ball, toe tip) on the floor and adds the lift, so a clip never has to know the body's size.
//   daily: walk and run from the textbook gait curves (sagittal joint angles over one stride, Winter 1991 / Perry 1992 shapes, rounded),
//          a countermovement jump (ballistic flight from the take-off speed) and a squat
//   ski:   the carved turn from real skiing video (data/mocap, CC BY: the joint directions per phase are fitted onto this skeleton),
//          the straight-line tuck, a jump on skis
(() => {
  const D = Math.PI / 180, V = Human.v3;
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  // periodic Catmull-Rom through [percent, value] points
  const cyc = pts => {
    const P = pts[pts.length - 1][0] === 100 ? pts.slice(0, -1) : pts, n = P.length;
    return u => {
      const x = ((u % 1) + 1) % 1 * 100; let i = n - 1; for (let k = 0; k < n; k++) if (P[k][0] <= x) i = k;
      const a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n], d = P[(i + 2) % n];
      const span = ((c[0] - b[0]) + 100) % 100 || 100, t = (((x - b[0]) + 100) % 100) / span;
      const t2 = t * t, t3 = t2 * t;
      return 0.5 * (2 * b[1] + (-a[1] + c[1]) * t + (2 * a[1] - 5 * b[1] + 4 * c[1] - d[1]) * t2 + (-a[1] + 3 * b[1] - 3 * c[1] + d[1]) * t3);
    };
  };
  // Catmull-Rom through key poses at times (s), clamped at the ends: any tree of numbers
  const mix = (trees, w) => { const t0 = trees[0];
    if (typeof t0 === 'number') return trees.reduce((s, x, i) => s + x * w[i], 0);
    if (Array.isArray(t0)) return t0.map((_, j) => mix(trees.map(t => t[j]), w));
    const o = {}; for (const k in t0) o[k] = mix(trees.map(t => t[k] != null ? t[k] : t0[k]), w); return o; };
  // (monotone cubic, Fritsch-Carlson: a value never swings past its keys, so a key at a joint's limit stays inside the limit; ends at rest)
  const herm = (a, b, c, d, ta, tb, tc, td, s) => {
    if (typeof b === 'number') { const h = tc - tb, d1 = (c - b) / h, d0 = tb > ta ? (b - a) / (tb - ta) : 0, d2 = td > tc ? (d - c) / (td - tc) : 0;
      const mb = d0 * d1 <= 0 ? 0 : 2 / (1 / d0 + 1 / d1), mc = d1 * d2 <= 0 ? 0 : 2 / (1 / d1 + 1 / d2), s2 = s * s, s3 = s2 * s;
      return b * (2 * s3 - 3 * s2 + 1) + h * mb * (s3 - 2 * s2 + s) + c * (-2 * s3 + 3 * s2) + h * mc * (s3 - s2); }
    if (Array.isArray(b)) return b.map((_, j) => herm(a[j], b[j], c[j], d[j], ta, tb, tc, td, s));
    const o = {}, g = (t, k) => t[k] != null ? t[k] : b[k]; for (const k in b) o[k] = herm(g(a, k), b[k], g(c, k), g(d, k), ta, tb, tc, td, s); return o; };
  const keys = K => t => {
    let i = 0; while (i < K.length - 2 && K[i + 1][0] <= t) i++;
    const b = K[i], c = K[i + 1], a = K[Math.max(0, i - 1)], d = K[Math.min(K.length - 1, i + 2)];
    return herm(a[1], b[1], c[1], d[1], a[0], b[0], c[0], d[0], clamp((t - b[0]) / (c[0] - b[0]), 0, 1));
  };
  // a pose from a few fields on top of the rest pose
  const make = f => { const p = Human.restPose(); f(p); return p; };
  const set = (p, o) => { for (const k in o) Object.assign(p[k], o[k]); return p; };
  const both = (p, part, o) => { Object.assign(p[part + '_L'], o); Object.assign(p[part + '_R'], o); };
  // the arm swung forward (+) or back (-) by s deg out of a slight abduction a: elevation and plane
  const swing = (s, a) => ({ elev: Math.hypot(s, a), plane: Math.atan2(s, a) / D });

  // ---- daily
  const GAIT = {
    walk: { hip: cyc([[0, 26], [12, 22], [30, 6], [50, -9], [62, 2], [75, 22], [88, 30], [100, 26]]),
      knee: cyc([[0, 4], [15, 18], [38, 5], [50, 9], [62, 40], [73, 60], [85, 34], [95, 6], [100, 4]]),
      ankle: cyc([[0, 0], [8, 6], [30, -7], [47, -10], [62, 16], [72, 6], [86, 0], [100, 0]]),        // + plantar
      toe: cyc([[0, 4], [40, 8], [56, 34], [64, 22], [72, 4], [100, 4]]) },
    run: { hip: cyc([[0, 32], [18, 16], [38, -10], [50, 2], [65, 34], [85, 48], [100, 32]]),
      knee: cyc([[0, 20], [16, 42], [38, 18], [55, 72], [70, 108], [86, 62], [100, 20]]),
      ankle: cyc([[0, -4], [16, -20], [38, 22], [55, 12], [75, -2], [100, -4]]),
      toe: cyc([[0, 4], [30, 10], [38, 32], [48, 8], [100, 4]]) },
  };
  // the signs of the skeleton's root and spine turns, read off the skeleton once (so the clips can say "left hip forward")
  let SG = null;
  const signs = sk => {
    if (SG) return SG; const I = sk.idx, at = f => Human.Skeleton.pose(sk, make(f));
    const r = at(() => {}), y = at(p => { p.root.rot = [0, 10, 0]; }), z = at(p => { p.root.rot = [0, 0, 10]; }), tw = at(p => { p.spine.twist = 10; });
    SG = { yaw: y.P[I.thigh_L][2] > r.P[I.thigh_L][2] ? 1 : -1, roll: z.P[I.thigh_L][1] > r.P[I.thigh_L][1] ? 1 : -1,
      twist: tw.P[I.upperarm_L][2] > r.P[I.upperarm_L][2] ? 1 : -1,
      neck: Human.q.rot(at(p => { p.neck.yaw = 30; }).R[I.head], [0, 0, 1])[0] > 0 ? 1 : -1 };       // + = the face turns to the body's left
    return SG;
  };
  const gait = (G, run) => (u, sk) => {
    const s = signs(sk), L = u, R = (u + 0.5) % 1, c = Math.cos(2 * Math.PI * u);
    return { pose: make(p => {
      for (const [side, v] of [['L', L], ['R', R]]) {
        Object.assign(p['leg_' + side], { flex: G.hip(v), knee: G.knee(v), ankle: G.ankle(v), toe: G.toe(v), abd: run ? -2 : 1 * Math.cos(2 * Math.PI * v) - 1 });
        // the arm swings with the opposite leg: forward as this side's leg goes back
        const sw = -(run ? 30 : 14) * Math.cos(2 * Math.PI * v) + (run ? 8 : 3);
        Object.assign(p['arm_' + side], swing(sw, run ? 14 : 7), { elbow: run ? 88 + 10 * Math.max(0, sw) / 30 : 14 + 10 * Math.max(0, sw) / 14, pron: 10, grip: run ? 0.5 : 0.15, thumb: run ? 0.4 : 0.1 });
      }
      // pelvis: turns forward with the swinging leg and drops on the swing side; the chest turns the other way; the trunk leans in a run
      p.root.rot = [run ? 8 : 3, s.yaw * (run ? 7 : 5) * c, s.roll * (run ? 4 : 3.5) * Math.sin(2 * Math.PI * u * 2 - 0.4) * (u < 0.5 ? 1 : -1) * 0];
      p.root.rot[2] = s.roll * (run ? 4 : 3) * Math.sin(2 * Math.PI * u);
      p.spine.twist = -s.twist * (run ? 12 : 8) * c; p.spine.flex = run ? 6 : 2; p.neck.flex = run ? -6 : -2; p.neck.yaw = s.twist * (run ? 5 : 3) * c;
    }), lift: run ? 0.05 * Math.max(0, Math.sin(Math.PI * clamp(((u % 0.5) * 2 - 0.76) / 0.24, 0, 1))) : 0 };
  };

  const STAND = make(p => { both(p, 'arm', { elev: 8, plane: 20, elbow: 12, pron: 10 }); });
  const deep = (f, k, a) => make(p => { p.root.rot = [f * 0.2, 0, 0]; both(p, 'leg', { flex: f, knee: k, ankle: a, abd: 6, rot: -6 }); p.spine.flex = f * 0.18; p.neck.flex = -f * 0.2; both(p, 'arm', { elev: 8, plane: 20, elbow: 12, pron: 10 }); });
  const squatK = keys([[0, STAND], [0.4, STAND],
    [1.5, make(p => { p.root.rot = [32, 0, 0]; both(p, 'leg', { flex: 127, abd: 14, rot: -12, knee: 120, ankle: -25 }); p.spine.flex = 24; p.neck.flex = -25; both(p, 'arm', { elev: 85, plane: 90, elbow: 15 }); })],
    [2.0, make(p => { p.root.rot = [32, 0, 0]; both(p, 'leg', { flex: 127, abd: 14, rot: -12, knee: 120, ankle: -25 }); p.spine.flex = 24; p.neck.flex = -25; both(p, 'arm', { elev: 85, plane: 90, elbow: 15 }); })],
    [3.1, STAND], [3.6, STAND]]);
  // countermovement jump: dip, drive (arms swing up), flight, land and absorb
  const jumpK = keys([[0, STAND], [0.3, STAND],
    [0.8, make(p => { p.root.rot = [24, 0, 0]; both(p, 'leg', { flex: 70, knee: 70, ankle: -24, abd: 5 }); p.spine.flex = 22; p.neck.flex = -18; both(p, 'arm', { ...swing(-45, 10), elbow: 15 }); })],
    [1.05, make(p => { p.root.rot = [4, 0, 0]; both(p, 'leg', { flex: -4, knee: 2, ankle: 38, toe: 40 }); p.spine.flex = -4; both(p, 'arm', { elev: 150, plane: 80, elbow: 15 }); })],
    [1.3, make(p => { p.root.rot = [2, 0, 0]; both(p, 'leg', { flex: 8, knee: 14, ankle: 28, toe: 5 }); both(p, 'arm', { elev: 120, plane: 70, elbow: 20 }); })],
    [1.58, make(p => { p.root.rot = [6, 0, 0]; both(p, 'leg', { flex: 22, knee: 24, ankle: 18, toe: 0 }); p.spine.flex = 4; both(p, 'arm', { elev: 60, plane: 70, elbow: 25 }); })],
    [1.85, make(p => { p.root.rot = [22, 0, 0]; both(p, 'leg', { flex: 66, knee: 68, ankle: -24, abd: 5 }); p.spine.flex = 20; p.neck.flex = -15; both(p, 'arm', { elev: 50, plane: 80, elbow: 30 }); })],
    [2.6, STAND], [3.2, STAND]]);
  // a jump's height is the parabola 4 h u (1-u). A bare parabola steps the vertical speed where it meets the snow,
  // so the first and last tenth of a second (less on a short hop) is a quintic that matches the parabola's height,
  // speed and acceleration on the inside and is still on the snow, with no speed, on the outside
  const feather5 = (s, Y, V, A) => { const c = A / 2 + 6 * Y - 3 * V, b = V - 3 * Y - 2 * c, a = Y - b - c, s2 = s * s; return (a + (b + c * s) * s) * s2 * s; };
  const flight = (t, t1, t2, h) => {
    if (!(t > t1 && t < t2) || h <= 0) return 0;
    const T = t2 - t1, u = (t - t1) / T, y = 4 * h * u * (1 - u), tau = Math.min(0.1, 0.3 * T);
    const edge = dt => { const uf = tau / T, yf = 4 * h * uf * (1 - uf), vp = 4 * h / T * (1 - 2 * uf), ap = -8 * h / (T * T); return feather5(dt / tau, yf, vp * tau, ap * tau * tau); };
    if (t < t1 + tau) return edge(t - t1);
    if (t > t2 - tau) return edge(t2 - t);
    return y;
  };

  // ---- ski
  // ski stance: ankles closed in the boots, knees and hips flexed, hands forward holding the poles
  const skiArms = (p, o) => both(p, 'arm', Object.assign({ elev: 38, plane: 72, elbow: 62, pron: 30, grip: 1, thumb: 0.7, wdev: 10 }, o));
  const SKI = make(p => { p.root.rot = [22, 0, 0]; both(p, 'leg', { flex: 42, knee: 52, ankle: -18, abd: 1 }); p.spine.flex = 16; p.neck.flex = -18; skiArms(p, {}); });
  const TUCK = make(p => { p.root.rot = [40, 0, 0]; both(p, 'leg', { flex: 112, knee: 96, ankle: -24 }); p.spine.flex = 26; p.neck.flex = -45; skiArms(p, { elev: 70, plane: 88, elbow: 115 }); });
  const skiJumpK = keys([[0, SKI], [0.3, SKI],
    [0.6, make(p => { p.root.rot = [28, 0, 0]; both(p, 'leg', { flex: 72, knee: 88, ankle: -24 }); p.spine.flex = 22; p.neck.flex = -22; skiArms(p, { elev: 30, plane: 60 }); })],
    [0.82, make(p => { p.root.rot = [12, 0, 0]; both(p, 'leg', { flex: 18, knee: 16, ankle: -10 }); p.spine.flex = 10; p.neck.flex = -10; skiArms(p, { elev: 60, plane: 80, elbow: 40 }); })],
    [1.2, make(p => { p.root.rot = [24, 0, 0]; both(p, 'leg', { flex: 88, knee: 100, ankle: -20 }); p.spine.flex = 20; p.neck.flex = -25; skiArms(p, { elev: 55, plane: 85, elbow: 70 }); })],
    [1.55, make(p => { p.root.rot = [18, 0, 0]; both(p, 'leg', { flex: 36, knee: 38, ankle: -16 }); p.spine.flex = 14; p.neck.flex = -18; skiArms(p, { elev: 45, plane: 75, elbow: 50 }); })],
    [1.8, make(p => { p.root.rot = [30, 0, 0]; both(p, 'leg', { flex: 92, knee: 110, ankle: -25 }); p.spine.flex = 28; p.neck.flex = -30; skiArms(p, { elev: 50, plane: 80, elbow: 55 }); })],
    [2.6, SKI], [3.0, SKI]]);

  // the carved turn, twice (right, then its mirror). The video's series gives, per phase, the hip's lean, height and fore-aft place,
  // the yaw of the feet against the pelvis, and how far the shoulders turn against it. Each phase is solved from the ski stance,
  // not from the phase before, and the mirror is solved the same way, so the seam is only as far apart as the series itself.
  // The raw joint directions are not used: their depth is too noisy and crosses the skis.
  const carveCache = new WeakMap();
  function fitCarve(sk) {
    if (carveCache.has(sk)) return carveCache.get(sk);
    const M = Human.MOCAP && Human.MOCAP.carve; if (!M || !M.hipFore || !M.feetYaw) return null;
    const I = sk.idx, J = n => sk.bones[I[n]].J, s = signs(sk), Nph = M.phases;
    const legLen = V.len(V.sub(J('shin_L'), J('thigh_L'))) + V.len(V.sub(J('talus_L'), J('shin_L')));
    const descend = (p, fields, err, step = 16) => {
      let e = err(p);
      for (let st = step; st > 0.1; st /= 2) for (let rep = 0; rep < 4; rep++) { let moved = false;
        for (const [o, k] of fields) for (const dv of [st, -st]) { o(p)[k] += dv; const e2 = err(p); if (e2 < e - 1e-12) { e = e2; moved = true; } else o(p)[k] -= dv; }
        if (!moved) break; }
      return e;
    };
    const latSign = (() => { const a = Human.Skeleton.pose(sk, make(p => { p.spine.lat = 20; })); return a.P[I.head][0] > 0 ? 1 : -1; })();   // + = the chest leans to the body's left
    // odd across the mirror (lean, twist, feet yaw), even (height, fore-aft). ph 0..31 is the right turn, 32..63 its mirror
    const sig = (name, odd, ph) => M[name][ph % Nph] * (odd && ph >= Nph ? -1 : 1);
    // one roll sign for the whole cycle: +lean (hips to the body's left) lowers the left hip. Flipping it per phase chatters as the lean crosses zero
    let rollS = -s.roll;
    { const t = JSON.parse(JSON.stringify(SKI)); t.root.rot = [20, 0, rollS * 0.55 * 20];
      const xf = Human.Skeleton.pose(sk, t); if (V.sub(xf.P[I.thigh_L], xf.P[I.thigh_R])[1] > 0) rollS = -rollS; }
    const poses = [], stance = 0.34 * sk.M.S / 1756, tl = V.len(V.sub(J('shin_L'), J('thigh_L'))), slen = legLen - tl;
    for (let ph = 0; ph < Nph * 2; ph++) {
      const lat = sig('hipLateral', true, ph), h = sig('hipHeight', false, ph), fore = sig('hipFore', false, ph);
      const tw = sig('twist', true, ph) / D, yaw = sig('feetYaw', true, ph) / D, lean = Math.atan2(-lat, h) / D, drop = 1 - h;
      const p = JSON.parse(JSON.stringify(SKI));
      // the pelvis yaws against the skis (they stay on +z) by the measured feet yaw, so the trunk counters the feet; it tips forward as it sinks, and rolls in
      p.root.rot = [10 + 32 * drop, -s.yaw * yaw, rollS * 0.55 * lean];
      p.root.pos = [0, 0, 0];
      const hipW = Human.q.rot(Human.q.axis([0, 1, 0], p.root.rot[1] * D), [-lat * legLen, h * legLen, fore * legLen]);   // mid-hip from mid-ankle, world
      const X = () => Human.Skeleton.pose(sk, p), at = (xf, n) => xf.P[I[n]];
      // both legs from this one pose, before either is written, so solving the left leg first cannot break the mirror
      const guess = {}, xf0 = X();
      for (const sd of ['L', 'R']) {
        const foot = [(sd === 'L' ? 1 : -1) * stance / 2, 0, 0], mid = V.lerp(at(xf0, 'thigh_L'), at(xf0, 'thigh_R'), 0.5), hip = V.sub(at(xf0, 'thigh_' + sd), mid);
        const d = Human.q.rot(Human.q.conj(xf0.R[I.pelvis]), V.sub(V.sub(foot, hipW), hip)), r = Math.min(V.len(d), legLen * 0.999);
        const knee = 180 - Math.acos(clamp((tl * tl + slen * slen - r * r) / (2 * tl * slen), -1, 1)) / D, al = Math.acos(clamp((tl * tl + r * r - slen * slen) / (2 * tl * r), -1, 1)) / D;
        guess[sd] = { flex: Math.atan2(d[2], -d[1]) / D + al, abd: Math.atan2(d[0] * (sd === 'L' ? 1 : -1), -d[1]) / D, rot: 0, knee, ankle: -16, inv: 0, toe: 0 };
      }
      for (const sd of ['L', 'R']) Object.assign(p['leg_' + sd], guess[sd]);
      for (const sd of ['L', 'R']) {
        const foot = [(sd === 'L' ? 1 : -1) * stance / 2, 0, 0];
        descend(p, [[q => q['leg_' + sd], 'flex'], [q => q['leg_' + sd], 'abd'], [q => q['leg_' + sd], 'rot'], [q => q['leg_' + sd], 'knee']], () => { const xf = X();
          const mid = V.lerp(at(xf, 'thigh_L'), at(xf, 'thigh_R'), 0.5), a = V.sub(at(xf, 'talus_' + sd), mid), tgt = V.sub(foot, hipW);
          const c = contacts(sk, xf), o = sd === 'L' ? 0 : 3, f = V.sub(c[o + 1], c[o]), ski = 1 - f[2] / Math.hypot(f[0], f[2]);
          return V.dot(V.sub(a, tgt), V.sub(a, tgt)) * 3000 + ski; }, 3);
        // the boot: the ankle holds the ski level from tip to tail
        descend(p, [[q => q['leg_' + sd], 'ankle']], () => { const c = contacts(sk, X()), o = sd === 'L' ? 0 : 3; return (c[o + 1][1] - c[o][1]) ** 2; }, 8);
      }
      // angulation: the trunk leans back out over the outside ski, the head stays level; the chest turns against the pelvis as measured
      p.spine = { flex: 10 + 30 * drop, lat: -latSign * 0.5 * lean, twist: s.twist * 0.6 * tw };
      p.neck = { flex: -(14 + 30 * drop), lat: -latSign * 0.25 * lean, yaw: -s.neck * 0.3 * tw };
      // outside arm up and forward, inside arm low, both meeting when the lean is zero (a hard swap of the swing plane steps every edge change)
      const amp = 1 - Math.exp(-lean * lean / (2 * 18 * 18)), side = Math.tanh(lean / 8), outL = 0.5 - 0.5 * side;
      skiArms(p, { elev: 58, elbow: 50 });
      for (const [sd, w] of [['L', outL], ['R', 1 - outL]]) Object.assign(p['arm_' + sd], { elev: 58 + (20 * w - 8) * amp, plane: 84 - 22 * w });
      Human.clampPose(p);
      poses.push(p);
    }
    const r = { poses, turn: M.seconds || 1.2 };
    carveCache.set(sk, r); return r;
  }
  // the head turns before the edge does; the arms and the trunk follow the legs. The inside knee already flexes before the
  // lean is deepest (it follows the hip drop), and holding it any earlier opens the skis, so it is left on the legs' clock.
  // Offsets are in seconds of the clip (the head by 120 ms, the arms and trunk by 100 ms), read off the same curve, so the loop stays closed
  function carve(u, sk) {
    const C = fitCarve(sk); if (!C) return { pose: SKI };
    const dur = this && this.dur || 2.4, n = C.poses.length;
    const at = uu => {
      const x = (((uu % 1) + 1) % 1) * n, i = Math.floor(x) % n, t = x - Math.floor(x);
      const P = k => C.poses[(i + k + n) % n], t2 = t * t, t3 = t2 * t;
      return mix([P(-1), P(0), P(1), P(2)], [(-t + 2 * t2 - t3) / 2, (2 - 5 * t2 + 3 * t3) / 2, (t + 4 * t2 - 3 * t3) / 2, (-t2 + t3) / 2]);
    };
    const p = at(u), lead = 0.12 / dur, trail = 0.10 / dur, fut = at(u + lead), past = at(u - trail);
    p.neck.yaw = fut.neck.yaw; p.neck.lat = fut.neck.lat;
    p.spine = Object.assign({}, past.spine); p.arm_L = Object.assign({}, past.arm_L); p.arm_R = Object.assign({}, past.arm_R);
    return { pose: p };
  }
  // tuck: held, with the small weight shifts of a racer over the skis (no springs: a slow periodic sway)
  const tuck = u => ({ pose: Human.lerpPose(TUCK, make(p => { p.root.rot = [42, 0, 0]; both(p, 'leg', { flex: 114, knee: 97, ankle: -25 }); p.spine.flex = 27; p.neck.flex = -44; skiArms(p, { elev: 72, plane: 88, elbow: 117 }); }), 0.5 - 0.5 * Math.cos(2 * Math.PI * u)) });

  // moguls: the legs fold over each bump and reach into each trough while the trunk stays quiet
  const ABSORB = make(p => { p.root.rot = [26, 0, 0]; both(p, 'leg', { flex: 96, knee: 112, ankle: -25 }); p.spine.flex = 18; p.neck.flex = -22; skiArms(p, { elev: 42, plane: 78, elbow: 70 }); });
  const REACH = make(p => { p.root.rot = [18, 0, 0]; both(p, 'leg', { flex: 30, knee: 34, ankle: -14 }); p.spine.flex = 14; p.neck.flex = -14; skiArms(p, { elev: 36, plane: 70, elbow: 58 }); });
  const moguls = u => ({ pose: Human.lerpPose(REACH, ABSORB, 0.5 - 0.5 * Math.cos(2 * Math.PI * u)) });
  // a spread eagle off a kicker: pop, legs and arms out wide in the air, back together to land
  const spreadK = keys([[0, SKI], [0.3, SKI],
    [0.6, make(p => { p.root.rot = [28, 0, 0]; both(p, 'leg', { flex: 72, knee: 88, ankle: -24 }); p.spine.flex = 22; p.neck.flex = -22; skiArms(p, { elev: 30, plane: 60 }); })],
    [0.82, make(p => { p.root.rot = [8, 0, 0]; both(p, 'leg', { flex: 12, knee: 10, ankle: -10 }); p.spine.flex = 6; p.neck.flex = -8; skiArms(p, { elev: 70, plane: 40, elbow: 30 }); })],
    [1.2, make(p => { p.root.rot = [2, 0, 0]; both(p, 'leg', { flex: 4, knee: 4, ankle: -8, abd: 38 }); p.spine.flex = -4; skiArms(p, { elev: 120, plane: 8, elbow: 8 }); })],
    [1.5, make(p => { p.root.rot = [10, 0, 0]; both(p, 'leg', { flex: 24, knee: 26, ankle: -14, abd: 6 }); p.spine.flex = 10; p.neck.flex = -12; skiArms(p, { elev: 50, plane: 60, elbow: 45 }); })],
    [1.8, make(p => { p.root.rot = [30, 0, 0]; both(p, 'leg', { flex: 92, knee: 110, ankle: -25 }); p.spine.flex = 28; p.neck.flex = -30; skiArms(p, { elev: 50, plane: 80, elbow: 55 }); })],
    [2.6, SKI], [3.0, SKI]]);

  // ---- snowboard (regular stance: the left foot leads, the board runs toward the body's left)
  // tilt = the pelvis' forward tip, hip / knee / ankle in the sagittal plane: with the shins' lean and the ankle they decide which edge the board
  // stands on (toes down on the toe edge, toes up on the heel edge); the floor puts that edge on the snow
  const sb = (tilt, hip, knee, ankle, sp, f) => (sk => { const s = signs(sk); return make(p => {
    p.root.rot = [tilt, 0, 0]; both(p, 'leg', { flex: hip, knee, ankle, abd: 17, rot: -14 }); p.spine.flex = sp; p.spine.twist = -s.twist * 18; p.neck.yaw = s.neck * 55; p.neck.flex = -sp * 0.5 - tilt * 0.4;
    Object.assign(p.arm_L, { elev: 42, plane: 5, elbow: 22, pron: 30, grip: 0.4, thumb: 0.3 }); Object.assign(p.arm_R, { elev: 34, plane: 35, elbow: 34, pron: 30, grip: 0.4, thumb: 0.3 }); if (f) f(p, s); }); });
  const SB = { ride: sb(10, 36, 46, -20, 8), toe: sb(12, 34, 68, -12, -4, p => { p.arm_L.elev = 50; p.arm_R.plane = 60; }), heel: sb(16, 78, 62, -22, 22, p => { p.arm_L.plane = 30; p.arm_R.elev = 44; }),
    crouch: sb(20, 80, 96, -25, 18), pop: sb(4, 10, 12, -4, 0, p => { p.arm_L.elev = 70; p.arm_R.elev = 70; }),
    grab: sb(14, 112, 118, -20, 30, p => { Object.assign(p.arm_R, { elev: 42, plane: 78, elbow: 12, grip: 0.9, thumb: 0.8 }); Object.assign(p.arm_L, { elev: 95, plane: -10, elbow: 20 }); }),
    open: sb(8, 40, 44, -16, 6), land: sb(22, 88, 104, -25, 22) };
  const sbCache = new WeakMap();
  const sbOf = sk => { if (!sbCache.has(sk)) { const P = {}; for (const k in SB) P[k] = SB[k](sk);
    sbCache.set(sk, { P, turn: keys([[0, P.ride], [0.75, P.toe], [1.5, P.ride], [2.25, P.heel], [3.0, P.ride]]),
      jump: keys([[0, P.ride], [0.3, P.ride], [0.6, P.crouch], [0.82, P.pop], [1.2, P.grab], [1.45, P.grab], [1.65, P.open], [1.9, P.land], [2.7, P.ride], [3.0, P.ride]]) }); } return sbCache.get(sk); };
  // the board turns on its edges: toe edge at 0.25, heel edge at 0.75 (the same key at both ends, so it loops)
  const sbTurn = (u, sk) => { const t = u * 3.0, K = sbOf(sk); return { pose: K.turn(t) }; };
  const sbJump = (u, sk) => { const t = u * 3.0; return { pose: sbOf(sk).jump(t), lift: flight(t, 0.8, 1.7, 0.8), reach: { hand: 'R', w: Human.smooth(0.95, 1.2, t) * (1 - Human.smooth(1.45, 1.62, t)) } }; };
  const sbRide = (u, sk) => { const P = sbOf(sk).P; return { pose: Human.lerpPose(P.ride, P.open, 0.5 - 0.5 * Math.cos(2 * Math.PI * u)) }; };

  const CLIPS = [
    { name: 'walk', zh: '走路', group: 'daily', dur: 1.1, at: gait(GAIT.walk, false) },
    { name: 'run', zh: '跑步', group: 'daily', dur: 0.72, at: gait(GAIT.run, true) },
    { name: 'jump', zh: '原地跳', group: 'daily', dur: 3.2, at: u => { const t = u * 3.2; return { pose: jumpK(t), lift: flight(t, 1.08, 1.56, 0.3) }; } },
    { name: 'squatrep', zh: '深蹲起', group: 'daily', dur: 3.6, at: u => ({ pose: squatK(u * 3.6) }) },
    { name: 'carve', zh: '刻滑转弯（真人数据）', group: 'ski', dur: 2.4, at: carve },
    { name: 'tuckhold', zh: '团身滑行', group: 'ski', dur: 3.0, at: tuck },
    { name: 'moguls', zh: '蘑菇吸收', group: 'ski', dur: 0.9, at: moguls },
    { name: 'skijump', zh: '起跳团身', group: 'ski', dur: 3.0, at: u => { const t = u * 3.0; return { pose: skiJumpK(t), lift: flight(t, 0.8, 1.6, 0.75) }; } },
    { name: 'spread', zh: '空中大鹏展翅', group: 'ski', dur: 3.0, at: u => { const t = u * 3.0; return { pose: spreadK(t), lift: flight(t, 0.8, 1.6, 0.75) }; } },
    { name: 'sbride', zh: '单板直滑', group: 'board', dur: 2.4, at: sbRide },
    { name: 'sbturn', zh: '单板前刃 / 后刃', group: 'board', dur: 3.0, at: sbTurn },
    { name: 'sbjump', zh: '单板起跳抓板', group: 'board', dur: 3.0, at: sbJump },
  ];

  // ---- the feet on the floor: the lowest of heel, ball and toe tip of both feet sits where the rest pose's lowest one sits
  const CONTACT = [['foot', [0, -42, -42]], ['midfoot', [-16, -28, 89]], ['toe_hallux', [0, -12, 60]]];   // mm from the joint, left side
  function contacts(sk, xf) {
    const k = sk.M.S / 1756 / 1000, I = sk.idx, out = [];
    for (const s of ['L', 'R']) for (const [b, o] of CONTACT) { const bi = I[b + '_' + s], J = sk.bones[bi].J;
      out.push(Human.Skeleton.apply(xf, sk, bi, [J[0] + (s === 'R' ? -o[0] : o[0]) * k, J[1] + o[1] * k, J[2] + o[2] * k])); }
    return out;
  }
  // what is under the feet, as boxes (centre c, long axis ax, normal n, side, length L, width W, thickness T): two skis or one snowboard
  function gear(sk, xf, kind) {
    const c = contacts(sk, xf), I = sk.idx, Q = Human.q, soles = [['L', 0], ['R', 3]].map(([s, o]) => {
      const mid = V.lerp(c[o], c[o + 1], 0.5), fwd = V.norm(V.sub(c[o + 1], c[o])); let up = Q.rot(xf.R[I['foot_' + s]], [0, 1, 0]); up = V.norm(V.sub(up, V.mul(fwd, V.dot(up, fwd)))); return { mid, fwd, up }; });
    const box = (cen, ax, n, L, W) => ({ c: V.sub(cen, V.mul(n, 0.009)), ax, n, side: V.cross(n, ax), L, W, T: 0.014 });
    if (kind === 'ski') return soles.map(f => box(V.add(f.mid, V.mul(f.fwd, 0.1)), f.fwd, f.up, 1.62, 0.09));
    if (kind === 'board') { const ax = V.norm(V.sub(soles[0].mid, soles[1].mid)); let n = V.add(soles[0].up, soles[1].up); n = V.norm(V.sub(n, V.mul(ax, V.dot(n, ax))));
      return [box(V.lerp(soles[0].mid, soles[1].mid, 0.5), ax, n, 1.5, 0.27)]; }
    return [];
  }
  // where the gear can touch the snow: its edges near the feet (the tips flex away)
  const gearPts = B => { const out = []; for (const b of B) for (const a of [-0.3, 0.3]) for (const w of [-0.5, 0.5]) out.push(V.add(b.c, V.add(V.mul(b.ax, a * b.L), V.add(V.mul(b.side, w * b.W), V.mul(b.n, -b.T / 2))))); return out; };
  const floor0 = new WeakMap();
  function ground(sk, pose, lift, kind) {
    if (!floor0.has(sk)) floor0.set(sk, Math.min(...contacts(sk, Human.Skeleton.pose(sk, Human.restPose())).map(p => p[1])));
    const xf = Human.Skeleton.pose(sk, pose), lo = Math.min(...(kind ? gearPts(gear(sk, xf, kind)) : contacts(sk, xf)).map(p => p[1]));
    const p = JSON.parse(JSON.stringify(pose)); p.root.pos = [p.root.pos[0], p.root.pos[1] + floor0.get(sk) - lo + (lift || 0), p.root.pos[2]];
    return p;
  }
  // the clip's pose at time t (s), on the floor
  // ski clips solve both legs onto the skis, which is too slow per frame: the clip is solved once at 96 phases and read back by interpolation
  const baked = new WeakMap();
  function sample(sk, clip, t) {
    if (!baked.has(sk)) baked.set(sk, {}); const B = baked.get(sk), N = 96;
    if (!B[clip.name]) {
      // a carve is solved twice around the loop, each frame starting from the legs of the frame before, so the search
      // does not jump to another pose between two phases. The second pass closes the seam at phase 0
      const F = [];
      const passes = clip.name === 'carve' ? 2 : 1;
      for (let pass = 0; pass < passes; pass++) for (let i = 0; i < N; i++) F[i] = solve(sk, clip, clip.dur * i / N, i || pass ? F[(i + N - 1) % N] : null);
      B[clip.name] = clip.gear ? F : plant(sk, clip, F);
    }
    const x = (((t / clip.dur) % 1 + 1) % 1) * N, i = Math.floor(x) % N;
    const pose = Human.lerpPose(B[clip.name][i], B[clip.name][(i + 1) % N], x - Math.floor(x));
    // the lift was baked into the frames, so a straight line between them puts the speed corner back. Put the clip's own lift back
    const d = liftFix(clip, sk, t, false); if (d) pose.root.pos[1] += d;
    return pose;
  }
  // how far the baked lift (a straight line, or a cubic, between frames) is from the lift the clip writes. 0 on a frame, and 0 when there is no flight
  function liftFix(clip, sk, t, cubic) {
    // only the jumps whose lift is flight(): a walk's float and the captured runs keep the lift that was baked with them
    if (clip.name !== 'jump' && clip.name !== 'skijump' && clip.name !== 'spread' && clip.name !== 'sbjump') return 0;
    const N = 96, dur = clip.dur, x = (((t / dur) % 1 + 1) % 1) * N, i = Math.floor(x), u = x - i;
    if (u < 1e-9) return 0;
    const L = k => (clip.at((((i + k) % N) + N) % N / N, sk).lift) || 0, live = (clip.at(((t / dur) % 1 + 1) % 1, sk).lift) || 0;
    let baked;
    if (!cubic) baked = L(0) + (L(1) - L(0)) * u;
    else { const a = L(-1), b = L(0), c = L(1), d = L(2), u2 = u * u, u3 = u2 * u;
      baked = 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (3 * b - a - 3 * c + d) * u3); }
    return !live && !baked ? 0 : live - baked;
  }
  function solve(sk, clip, t, seed) {
    const u = ((t / clip.dur) % 1 + 1) % 1, r = clip.at(u, sk);
    if (seed && clip.name === 'carve') { r.pose.leg_L = Object.assign({}, seed.leg_L); r.pose.leg_R = Object.assign({}, seed.leg_R); }
    // on skis the boots hold the feet flat to the skis and the skis lie level: the whole body is pitched by what the pose leaves over
    const level = () => { for (let it = 0; it < 2; it++) { const c = contacts(sk, Human.Skeleton.pose(sk, r.pose));
      r.pose.root.rot[0] -= Math.atan2((c[0][1] - c[1][1] + c[3][1] - c[4][1]) / 2, Math.hypot(c[1][0] - c[0][0], c[1][2] - c[0][2])) / D; } };
    if (clip.gear === 'ski' && clip.name !== 'carve') level();
    if (clip.gear === 'ski') parallel(sk, r.pose, clip.name === 'carve' ? { keepYaw: true, near: seed ? { L: seed.leg_L, R: seed.leg_R } : null } : null);
    if (clip.gear === 'board') bind(sk, r.pose, r.reach);
    return ground(sk, r.pose, r.lift, clip.gear);
  }
  // two skis run side by side: same heading (+z), flat fore and aft, the same edge angle, the same height, half a stance each side of the middle.
  // Each leg's six joint angles are solved (damped least squares, inside the joint limits) to bring its ski there.
  function parallel(sk, pose, opt) {
    const read = () => gear(sk, Human.Skeleton.pose(sk, pose), 'ski');
    const KS = ['flex', 'abd', 'rot', 'knee', 'ankle', 'inv'], R = Human.ROM.leg, cl = (k, v) => Math.max(R[k][0], Math.min(R[k][1], v));
    // the pelvis first turns to face between the two skis, so neither hip has to do it all.
    // keepYaw leaves the yaw the clip wrote (a carve's feet sit at an angle to the pelvis; the trunk counters them)
    const yaw = g => (Math.atan2(g[0].ax[0], g[0].ax[2]) + Math.atan2(g[1].ax[0], g[1].ax[2])) / 2 / D;
    if (!(opt && opt.keepYaw)) for (let it = 0; it < 3; it++) { const m = yaw(read()); if (Math.abs(m) < 0.05) break;
      pose.root.rot[1] += 1; const d = yaw(read()) - m; pose.root.rot[1] -= 1; if (Math.abs(d) > 0.2) pose.root.rot[1] -= m / d; }
    const solveLegs = () => {
      const g0 = read(), mid = (g0[0].c[0] + g0[1].c[0]) / 2, half = Math.max(g0[0].c[0] - g0[1].c[0], 0.24) / 2, y = (g0[0].c[1] + g0[1].c[1]) / 2;
      const e = (Math.atan2(g0[0].n[0], g0[0].n[1]) + Math.atan2(g0[1].n[0], g0[1].n[1])) / 2, PW = 5;
      for (const [i, s] of [[0, 'L'], [1, 'R']]) { const L = pose['leg_' + s], tx = mid + (i ? -half : half), tz = g0[i].c[2];
        for (const k of KS) L[k] = cl(k, L[k]);
        const res = () => { const b = read()[i]; const r = [b.ax[0], b.ax[1], Math.atan2(b.n[0], b.n[1]) - e, (b.c[0] - tx) * PW, (b.c[1] - y) * PW, (b.c[2] - tz) * PW];
          // the carved turn is solved from the frame before: stay near those legs, or a second pose that holds the ski just as well
          // (a different edge) replaces the first between two frames and the playback puts a corner there
          if (opt && opt.near && opt.near[s]) for (const k of KS) r.push((L[k] - opt.near[s][k]) * (k === 'inv' || k === 'rot' || k === 'ankle' ? 0.03 : 0.004));
          return r; };
        for (let it = 0; it < 12; it++) { const f = res(); if (Math.hypot(...f) < 2e-3) break;
          const J = KS.map(k => { const h = L[k] + 1 > R[k][1] ? -1 : 1; L[k] += h; const d = res(); L[k] -= h; return d.map((v, j) => (v - f[j]) / h); });
          // (JtJ + lambda) d = -Jt f
          const A = KS.map((_, r) => KS.map((_, c) => J[r].reduce((a, v, j) => a + v * J[c][j], 0) + (r === c ? 2e-6 : 0))), g = KS.map((_, r) => -J[r].reduce((a, v, j) => a + v * f[j], 0));
          for (let c = 0; c < 6; c++) { let pv = c; for (let r = c + 1; r < 6; r++) if (Math.abs(A[r][c]) > Math.abs(A[pv][c])) pv = r; [A[c], A[pv]] = [A[pv], A[c]]; [g[c], g[pv]] = [g[pv], g[c]];
            for (let r = c + 1; r < 6; r++) { const m = A[r][c] / A[c][c]; for (let q = c; q < 6; q++) A[r][q] -= m * A[c][q]; g[r] -= m * g[c]; } }
          const d = new Array(6); for (let r = 5; r >= 0; r--) { let v = g[r]; for (let q = r + 1; q < 6; q++) v -= A[r][q] * d[q]; d[r] = v / A[r][r]; }
          KS.forEach((k, j) => { L[k] = cl(k, L[k] + Math.max(-12, Math.min(12, d[j]))); }); } }
    };
    const ang = () => { const g = read(), d = g[0].ax[0] * g[1].ax[0] + g[0].ax[1] * g[1].ax[1] + g[0].ax[2] * g[1].ax[2]; return Math.acos(Math.min(1, Math.max(-1, d))); };
    solveLegs();
    // the carved pose can start with both boots already at their stop, where this search leaves the skis open; a plain stance reaches
    if (opt && opt.keepYaw && !opt.near && ang() > 2 * D) { const keep = ['L', 'R'].map(s => Object.assign({}, pose['leg_' + s])), a0 = ang();
      for (const s of ['L', 'R']) Object.assign(pose['leg_' + s], { flex: 55, abd: 6, rot: 0, knee: 70, ankle: -16, inv: 0, toe: pose['leg_' + s].toe });
      solveLegs(); if (ang() > a0) for (const [n, s] of [[0, 'L'], [1, 'R']]) Object.assign(pose['leg_' + s], keep[n]); }
  }
  // a snowboard holds both feet: each in its binding, a fixed half stance from the middle, at its duck angle, flat on the deck. The board is where
  // the written pose puts it; each leg's six angles are solved onto its binding. `reach` = { hand, w }: that hand takes hold of the board's nearer
  // edge between the feet (w 0..1 blends the arm from the written pose to the hold).
  function bind(sk, pose, reach) {
    const P = Human.Skeleton.pose, I = sk.idx, Q = Human.q, PW = 8, KS = ['flex', 'abd', 'rot', 'knee', 'ankle', 'inv'];
    const sole = (xf, s, o) => { const c = contacts(sk, xf), fwd = V.norm(V.sub(c[o + 1], c[o])); let up = Q.rot(xf.R[I['foot_' + s]], [0, 1, 0]); return { mid: V.lerp(c[o], c[o + 1], 0.5), fwd, up: V.norm(V.sub(up, V.mul(fwd, V.dot(up, fwd)))) }; };
    const xf0 = P(sk, pose), b = gear(sk, xf0, 'board')[0], deck = V.add(b.c, V.mul(b.n, 0.009)), half = 0.25 * sk.M.S / 1756, duck = 14 * D;
    for (const [s, o, sg] of [['L', 0, 1], ['R', 3, -1]]) { const f0 = sole(xf0, s, o), e = Math.sign(V.dot(f0.mid, b.ax) - V.dot(deck, b.ax)) || sg;
      const tm = V.add(deck, V.mul(b.ax, e * half)), tf = V.norm(V.add(V.mul(b.side, Math.sign(V.dot(f0.fwd, b.side)) * Math.cos(duck)), V.mul(b.ax, e * Math.sin(duck)))), tr = V.cross(b.n, tf), L = pose['leg_' + s];
      for (const q of KS) L[q] = Math.max(Human.ROM.leg[q][0], Math.min(Human.ROM.leg[q][1], L[q]));
      dls(L, KS, Human.ROM.leg, () => { const f = sole(P(sk, pose), s, o); return [(f.mid[0] - tm[0]) * PW, (f.mid[1] - tm[1]) * PW, (f.mid[2] - tm[2]) * PW, V.dot(f.fwd, b.n), V.dot(f.fwd, b.ax) - V.dot(tf, b.ax), V.dot(f.up, tr)]; }, 12, 1e-5); }
    // the hold: the arm reaches, and the trunk bends and leans toward the board for what the arm cannot (as a rider folds to grab)
    if (reach && reach.w > 0.001) { const A = pose['arm_' + reach.hand], Sp = pose.spine, bi = I['fingers_mcp_' + reach.hand], grip = () => Human.Skeleton.apply(P(sk, pose), sk, bi, sk.bones[bi].J);
      const toe = Math.sign(V.dot(sole(P(sk, pose), 'L', 0).fwd, b.side)) || 1, h = V.sub(grip(), deck);
      const t = V.add(deck, V.add(V.mul(b.side, toe * b.W / 2), V.add(V.mul(b.ax, Math.max(-0.12, Math.min(0.12, V.dot(h, b.ax)))), V.mul(b.n, 0.015))));
      const KA = ['elev', 'plane', 'axial', 'elbow', 'sflex', 'slat'], RA = Object.assign({ sflex: Human.ROM.spine.flex, slat: Human.ROM.spine.lat }, Human.ROM.arm);
      const L = { get sflex() { return Sp.flex; }, set sflex(v) { Sp.flex = v; }, get slat() { return Sp.lat; }, set slat(v) { Sp.lat = v; } };
      for (const q of KA.slice(0, 4)) Object.defineProperty(L, q, { get: () => A[q], set: v => { A[q] = v; } });
      const raw = KA.map(q => L[q]); dls(L, KA, RA, () => { const g = grip(); return [(g[0] - t[0]) * PW, (g[1] - t[1]) * PW, (g[2] - t[2]) * PW]; }, 16, 1e-5);
      KA.forEach((q, n) => { L[q] = raw[n] + (L[q] - raw[n]) * reach.w; }); }
  }
  // joint angles `KS` of one limb `L` (inside the limits `R`) moved until the residuals res() vanish: damped least squares on a numeric Jacobian
  function dls(L, KS, R, res, iters, damp) {
    const n = KS.length, cl = (k, v) => Math.max(R[k][0], Math.min(R[k][1], v));
    for (let it = 0; it < iters; it++) { const f = res(); if (Math.hypot(...f) < 1e-3) break;
      const J = KS.map(k => { const h = L[k] + 1 > R[k][1] ? -1 : 1; L[k] += h; const d = res(); L[k] -= h; return d.map((v, j) => (v - f[j]) / h); });
      const A = KS.map((_, r) => KS.map((_, c) => J[r].reduce((a, v, j) => a + v * J[c][j], 0) + (r === c ? (damp || 2e-6) : 0))), g = KS.map((_, r) => -J[r].reduce((a, v, j) => a + v * f[j], 0));
      for (let c = 0; c < n; c++) { let pv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[pv][c])) pv = r; [A[c], A[pv]] = [A[pv], A[c]]; [g[c], g[pv]] = [g[pv], g[c]];
        for (let r = c + 1; r < n; r++) { const m = A[r][c] / A[c][c]; for (let q = c; q < n; q++) A[r][q] -= m * A[c][q]; g[r] -= m * g[c]; } }
      const d = new Array(n); for (let r = n - 1; r >= 0; r--) { let v = g[r]; for (let q = r + 1; q < n; q++) v -= A[r][q] * d[q]; d[r] = v / A[r][r]; }
      KS.forEach((k, j) => { L[k] = cl(k, L[k] + Math.max(-10, Math.min(10, d[j]))); }); }
  }
  // centre of mass of the posed skeleton, from Dempster's segment masses and centre positions
  function com(sk, xf) {
    const I = sk.idx, J = n => Human.Skeleton.apply(xf, sk, I[n], sk.bones[I[n]].J), parts = [[0.497, V.lerp(J('pelvis'), J('thorax_hi'), 0.45)], [0.081, V.lerp(J('neck_hi'), J('head'), 1.6)]];
    for (const s of ['L', 'R']) parts.push([0.028, V.lerp(J('upperarm_' + s), J('forearm_' + s), 0.436)], [0.016, V.lerp(J('forearm_' + s), J('hand_' + s), 0.43)], [0.006, J('hand_' + s)],
      [0.1, V.lerp(J('thigh_' + s), J('shin_' + s), 0.433)], [0.0465, V.lerp(J('shin_' + s), J('talus_' + s), 0.433)], [0.0145, V.lerp(J('talus_' + s), J('midfoot_' + s), 0.5)]);
    const c = [0, 0, 0]; let m = 0; for (const [w, p] of parts) { m += w; for (let i = 0; i < 3; i++) c[i] += w * p[i]; } return c.map(v => v / m);
  }
  // feet on the floor stay where they landed. F = the clip's poses at even phases, each already set on the floor. A foot is planted while its heel
  // or ball is on the floor; from the step it lands, that point is held still (or, in walk and run, carried back by the floor at the belt speed).
  // The whole body is first shifted to meet the planted feet, then each planted leg's angles are solved for what is left. In clips that stand in
  // place the body is also shifted until the centre of mass is over the feet. After lift-off the leg eases back to the written pose (no spring).
  function plant(sk, clip, F) {
    const N = F.length, dt = clip.dur / N, fl = floor0.get(sk), R = Human.ROM.leg, KS = ['flex', 'abd', 'rot', 'knee', 'ankle'], PW = 8, P = Human.Skeleton.pose;
    const pts = F.map(p => contacts(sk, P(sk, p))), isGait = clip.name === 'walk' || clip.name === 'run';
    const feet = [['L', 0], ['R', 3]].map(([s, o]) => ({ s, o, st: pts.map(c => Math.min(c[o][1], c[o + 1][1], c[o + 2][1]) - fl < 0.012), j: pts.map(c => [0, 1, 2].reduce((m, q) => c[o + q][1] < c[o + m][1] ? q : m, 0)), tg: new Array(N).fill(null) }));
    // walk and run: the floor's speed is what the heel and ball do while they are down; a foot that only skims the floor on its way forward is not planted
    let v = 0; if (isGait) { let n = 0; for (const f of feet) for (let k = 0; k < N; k++) { const k1 = (k + 1) % N, j = pts[k][f.o][1] <= pts[k][f.o + 1][1] ? 0 : 1;
        if (pts[k][f.o + j][1] - fl < 0.012 && pts[k1][f.o + j][1] - fl < 0.012) { v -= (pts[k1][f.o + j][2] - pts[k][f.o + j][2]) / dt; n++; } } v /= Math.max(1, n);
      for (const f of feet) f.st = f.st.map((x, k) => x && (pts[k][f.o + f.j[k]][2] - pts[(k + N - 1) % N][f.o + f.j[k]][2]) / dt < -0.4 * v); }
    for (const f of feet) { const all = f.st.every(x => x), starts = all ? [F.reduce((m, p, k) => p.root.pos[1] < F[m].root.pos[1] ? k : m, 0)] : f.st.map((x, k) => x && !f.st[(k + N - 1) % N] ? k : -1).filter(k => k >= 0);
      for (const a of starts) for (let m = 0; m < N && f.st[(a + m) % N]; m++) { const k = (a + m) % N, j = f.j[k], A = pts[a][f.o + j]; f.tg[k] = [A[0], pts[k][f.o + j][1], A[2] - v * m * dt]; } }
    const out = F.map(p => JSON.parse(JSON.stringify(p))), off = new Array(N).fill(null), delta = feet.map(() => new Array(N).fill(null));
    for (let k = 0; k < N; k++) { const pin = feet.filter(f => f.tg[k]); if (!pin.length) continue; const pose = out[k];
      const cur = f => contacts(sk, P(sk, pose))[f.o + f.j[k]], fwd0 = feet.map(f => V.norm(V.sub(pts[k][f.o + 1], pts[k][f.o])));
      const sh = [0, 0]; for (const f of pin) { const c = pts[k][f.o + f.j[k]]; sh[0] += (f.tg[k][0] - c[0]) / pin.length; sh[1] += (f.tg[k][2] - c[2]) / pin.length; }
      pose.root.pos[0] += sh[0]; pose.root.pos[2] += sh[1];
      const legs = () => { for (const f of pin) { const L = pose['leg_' + f.s], i = feet.indexOf(f); for (const q of KS) L[q] = Math.max(R[q][0], Math.min(R[q][1], L[q]));
        dls(L, KS, R, () => { const c = contacts(sk, P(sk, pose)), p = c[f.o + f.j[k]], w = V.norm(V.sub(c[f.o + 1], c[f.o])), t = f.tg[k];
          return [(p[0] - t[0]) * PW, (p[1] - t[1]) * PW, (p[2] - t[2]) * PW, w[1] - fwd0[i][1], w[0] - fwd0[i][0]]; }, 8, 1e-4); } };
      // what the legs cannot reach in height, the whole body takes up; `miss` = the worst distance left between a planted point and its place
      const miss = () => { const c = contacts(sk, P(sk, pose)); return Math.max(...pin.map(f => V.len(V.sub(c[f.o + f.j[k]], f.tg[k])))); };
      const settle = () => { legs(); for (let it = 0; it < 2; it++) { const c = contacts(sk, P(sk, pose)); pose.root.pos[1] += pin.reduce((a, f) => a + f.tg[k][1] - c[f.o + f.j[k]][1], 0) / pin.length; legs(); } };
      settle();
      // standing in place on both feet: the centre of mass comes back over the feet
      // (by leaning the trunk from the hips, as a person does: shifting the hips instead would ask the ankles for more bend than they have)
      if (!isGait && pin.length === 2) { const err = () => { const c = contacts(sk, P(sk, pose)), g = com(sk, P(sk, pose));
          const z0 = Math.max(c[0][2], c[3][2]) + 0.05, z1 = Math.min(c[1][2], c[4][2]) - 0.01; return g[2] - Math.max(z0, Math.min(z1, g[2])); };
        // first the hips move over the feet (the shins lean, as far as the ankles bend with the foot still flat on its place) ...
        for (let it = 0; it < 4; it++) { const e = err(); if (Math.abs(e) < 0.004) break; const keep = JSON.stringify(pose), back = () => Object.assign(pose, JSON.parse(keep));
          let step = -e, ok = false; for (let tr = 0; tr < 3 && !ok; tr++, step /= 2) { pose.root.pos[2] += step; settle(); ok = miss() < 0.004 && Math.abs(err()) < Math.abs(e); if (!ok) back(); }
          if (!ok) break; }
        // ... then the trunk leans for what is left
        for (let it = 0; it < 5; it++) { const e = err(); if (Math.abs(e) < 0.004) break; const keep = JSON.stringify(pose), back = () => Object.assign(pose, JSON.parse(keep));
          pose.root.rot[0] += 2; settle(); const d = (err() - e) / 2; back(); if (Math.abs(d) < 1e-4) break;
          // a lean the planted legs cannot follow is halved, then given up
          let step = Math.max(-8, Math.min(8, -e / d)), ok = false; for (let tr = 0; tr < 3 && !ok; tr++, step /= 2) { pose.root.rot[0] += step; settle(); ok = miss() < 0.006 && Math.abs(err()) < Math.abs(e); if (!ok) back(); }
          if (!ok) break; } }
      off[k] = [pose.root.pos[0] - F[k].root.pos[0], pose.root.pos[2] - F[k].root.pos[2]];
      for (const f of pin) delta[feet.indexOf(f)][k] = KS.map(q => pose['leg_' + f.s][q] - F[k]['leg_' + f.s][q]); }
    // in the air: the body's shift runs straight from the last planted step to the next; a leg that has lifted off eases back over 10 steps
    if (off.some(x => x)) for (let k = 0; k < N; k++) if (!off[k]) { let a = 1, b = 1; while (!off[(k + N - a) % N]) a++; while (!off[(k + b) % N]) b++;
      const A = off[(k + N - a) % N], B = off[(k + b) % N], t = a / (a + b); out[k].root.pos[0] += A[0] + (B[0] - A[0]) * t; out[k].root.pos[2] += A[1] + (B[1] - A[1]) * t; }
    feet.forEach((f, i) => { for (let k = 0; k < N; k++) if (!delta[i][k]) { let a = 1; while (a <= 10 && !delta[i][(k + N - a) % N]) a++; if (a > 10) continue;
      const d = delta[i][(k + N - a) % N], w = 1 - Human.smooth(0, 1, a / 10); KS.forEach((q, n) => { out[k]['leg_' + f.s][q] += d[n] * w; }); } });
    return out;
  }
  for (const c of CLIPS) c.gear = c.group === 'ski' ? 'ski' : c.group === 'board' ? 'board' : null;
  Human.Motion = { CLIPS, sample, ground, contacts, gear, fitCarve, cyc, keys, com, plant, parallel, bind, liftFix };
})();

Human.MOCAP = { carve: {"phases":32,"seconds":1,"hipLateral":[0.025,0.084,0.145,0.208,0.27,0.331,0.388,0.44,0.485,0.523,0.551,0.571,0.581,0.582,0.575,0.561,0.542,0.518,0.49,0.461,0.431,0.4,0.37,0.339,0.308,0.277,0.244,0.208,0.17,0.128,0.081,0.03],"hipHeight":[0.615,0.635,0.653,0.667,0.676,0.681,0.68,0.674,0.663,0.646,0.626,0.602,0.577,0.55,0.524,0.5,0.478,0.459,0.444,0.434,0.428,0.426,0.429,0.437,0.448,0.462,0.48,0.5,0.522,0.545,0.569,0.592],"hipFore":[-0.125,-0.142,-0.154,-0.161,-0.161,-0.155,-0.144,-0.132,-0.12,-0.111,-0.108,-0.111,-0.121,-0.138,-0.158,-0.179,-0.199,-0.214,-0.221,-0.221,-0.211,-0.193,-0.169,-0.143,-0.116,-0.093,-0.076,-0.067,-0.067,-0.074,-0.088,-0.106],"twist":[0.213,0.322,0.42,0.502,0.566,0.611,0.638,0.647,0.641,0.623,0.599,0.57,0.543,0.52,0.504,0.496,0.497,0.506,0.521,0.538,0.554,0.564,0.566,0.554,0.527,0.482,0.419,0.339,0.244,0.136,0.021,-0.097],"feetYaw":[-0.013,-0.082,-0.136,-0.173,-0.196,-0.206,-0.208,-0.205,-0.201,-0.202,-0.21,-0.228,-0.259,-0.303,-0.357,-0.421,-0.489,-0.559,-0.624,-0.681,-0.723,-0.748,-0.753,-0.735,-0.696,-0.636,-0.558,-0.468,-0.368,-0.265,-0.164,-0.07]} };

// a reference skeleton (stature 1756 mm) for sampling clips. Measurements the builder reads and nothing else.
Human.skier = function () {
  if (Human._skier) return Human._skier;
  Human._skier = Human.Skeleton.build({ S: 1756, sex: 0, B: { biacromial: 411, bicristal: 275 } });
  return Human._skier;
};
Human.skiClip = function (name) { return Human.Motion.CLIPS.find(c => c.name === name) || null; };
