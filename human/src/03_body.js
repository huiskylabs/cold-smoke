// ---------------------------------------------------------------- Human: the body's volume, as a signed distance field riding the bones
// Three kinds of piece, all given on a reference man (stature 1756 mm) in mm and carried to any body through the bones they ride:
//   loft     a stack of cross-sections along a segment: at each station a superellipse with four radii (to either side and to front and back),
//            the way ANSUR measures a body (breadth, depth, girth). A loft is cut into slabs, one per bone it spans, each slab riding its own bone
//            (the trunk's loft rides the five spine bones, the forearm's the twist bones), so the volume bends and twists where the skeleton does.
//   muscle   a belly on its action line, from an origin on one bone to an insertion on another; as the line shortens the belly thickens and as it
//            lengthens it thins, r = r0 * sqrt(L0 / L), which holds its volume (Scheepers 1997; Aubel & Thalmann 2000).
//   ellipsoid for the head's mannequin forms.
// The base lofts are the body under the superficial muscles; their radii are scaled per measured level (chest, waist, thigh ...) until the body's
// girths, measured the way a tape measures them, are the girths ANSUR predicts for its stature, mass and body fat (Human.Body.calibrate).
// Groups (trunk, neck and head, each arm, each leg) are joined to the trunk with a smooth minimum; the legs and the arms never with each other, so the
// thighs touch without webbing and an arm against the side stays an arm.
(() => {
  const V = Human.v3, Q = Human.q, REF = () => Human.Skeleton.REF, smin = Human.smin;

  // ---- the pieces (reference man; mm). Loft station: [t, rU+, rU-, rV+, rV-, n, cu, cv, girth key]
  // trunk: y from 800 to 1530, u = x (to the side), v = z (front); centre line z = cv
  const TRUNK = [
    // y     w    zF    zB   zW   n    girth     back half wider (lats, scapulae)
    [800, 26, 10, -34, -22, 2.0, 'buttock', 1],
    [822, 50, 26, -58, -26, 2.1, 'buttock', 1],
    [848, 112, 48, -90, -32, 2.3, 'buttock', 1],
    [878, 140, 62, -116, -38, 2.4, 'buttock', 1],
    [905, 146, 72, -124, -36, 2.5, 'buttock', 1],
    [950, 145, 80, -120, -28, 2.5, 'buttock', 1],
    [1000, 148, 88, -112, -18, 2.5, 'waist', 1],
    [1055, 143, 94, -108, -12, 2.5, 'waist', 1],
    [1110, 143, 96, -114, -10, 2.5, 'waist', 1.02],
    [1180, 146, 100, -120, -10, 2.5, 'chest', 1.06],
    [1240, 145, 106, -124, -8, 2.5, 'chest', 1.12],
    [1290, 140, 112, -126, -8, 2.4, 'chest', 1.15],
    [1350, 136, 112, -124, -10, 2.3, 'chest', 1.14],
    [1410, 126, 98, -118, -15, 2.2, 'chest', 1.08],
    [1452, 106, 70, -106, -22, 2.1, 'chest', 1.02],
    [1490, 76, 34, -92, -30, 2.0, 'neck', 1],
    [1530, 40, 10, -72, -36, 2.0, 'neck', 1],
  ];
  const trunkLoft = { name: 'trunk', group: 'trunk', A: ['pelvis', [0, 800, 0]], B: ['pelvis', [0, 1530, 0]], u: [1, 0, 0], v: [0, 0, 1],
    st: TRUNK.map(([y, w, zF, zB, zW, n, g, wb]) => [(y - 800) / 730, w, w, zF - zW, zW - zB, n, 0, zW, g, wb]),
    slabs: [['pelvis', -1, 1000], ['lumbar_lo', 1000, 1080], ['lumbar_hi', 1080, 1170], ['thorax_lo', 1170, 1260], ['thorax_mid', 1260, 1370], ['thorax_hi', 1370, 2]].map(([b, a, c]) => [b, a < 0 ? -1 : (a - 800) / 730, c < 10 ? c : (c - 800) / 730]) };
  const NECKL = [[1462, 62, 56, 64, -40, 2.1], [1500, 58, 50, 60, -36, 2.1], [1545, 55, 47, 54, -30, 2.1], [1590, 53, 44, 52, -22, 2.1], [1625, 46, 36, 48, -14, 2.1]];
  const neckLoft = { name: 'neck', group: 'neck', A: ['neck_lo', [0, 1462, 0]], B: ['neck_lo', [0, 1625, 0]], u: [1, 0, 0], v: [0, 0, 1],
    st: NECKL.map(([y, w, zF, zB, zW, n]) => [(y - 1462) / 163, w, w, zF, zB, n, 0, zW, 'neck']),
    slabs: [['neck_lo', -1, (1560 - 1462) / 163], ['neck_hi', (1560 - 1462) / 163, 2]] };
  // left arm (T-pose, along +x), one loft from the shoulder joint to the wrist, cut into slabs on the upper arm, its twist bones, the forearm and
  // its twist bones (so the elbow is one continuous surface). u = +y (top: the outside of the arm), v = +z (front). Stations at x (mm).
  // (the loft starts as a dome inside the shoulder, not a flat cut: with the arm down, that end is the round top of the shoulder)
  // (the stations up to 230 are the deltoid: they keep their size, the arm's girth is fitted on the stations below)
  const ARMS = [[112, 10, 10, 12, 12, 'shoulder'], [124, 30, 28, 34, 34, 'shoulder'], [138, 42, 38, 46, 46, 'shoulder'], [154, 46, 43, 52, 52, 'shoulder'], [176, 51, 46, 56, 56, 'shoulder'], [230, 55, 46, 55, 56, 'shoulder'], [290, 50, 42, 50, 51, 'arm'], [350, 40, 40, 51, 48, 'arm'],
    [400, 38, 38, 47, 44, 'arm'], [450, 36, 38, 40, 40, 'arm'], [490, 36, 41, 35, 38, 'forearm'], [506, 36, 41, 34, 38, 'forearm'], [530, 42, 43, 38, 40, 'forearm'],
    [560, 45, 44, 41, 39, 'forearm'], [610, 39, 40, 36, 33, 'forearm'], [660, 30, 30, 31, 29, 'wrist'], [720, 20, 21, 29, 28, 'wrist'], [770, 18, 19, 30, 29, 'wrist']];
  const ARM = { name: 'arm', group: 'arm', A: ['upperarm', null], B: ['hand', null], u: [0, 1, 0], v: [0, 0, 1],
    st: ARMS.map(([x, a, b, c, d, g]) => [(x - 176) / 586, a, b, c, d, x < 480 ? 2.2 : x < 650 ? 2.3 : 2.6, 0, -2, g]),
    slabs: [['upperarm_twist_01', -1, 0.19], ['upperarm_twist_02', 0.19, 0.38], ['upperarm', 0.38, 0.563], ['forearm', 0.563, 0.71], ['forearm_twist_01', 0.71, 0.85], ['forearm_twist_02', 0.85, 2]] };
  // the hand is a glove: the palm, the four fingers as one padded block (it curls at two rows of knuckles) and the thumb
  const PALM = { name: 'palm', group: 'arm', blend: 0.022, A: ['hand', null], B: ['fingers_mcp', null], u: [0, 1, 0], v: [0, 0, 1],
    st: [[-0.05, 18, 19, 30, 29, 2.6, 0, 0, 'wrist'], [0.3, 17, 19, 38, 36, 2.8, 0, 0, 'wrist'], [0.75, 16, 18, 41, 39, 2.8, 0, 0, 'wrist'], [1.0, 14, 15, 40, 38, 2.7, 0, 0, 'wrist']],
    slabs: [['hand', -1, 2]] };
  const FING = { name: 'fingers', group: 'arm', A: ['fingers_mcp', null], B: ['fingers_mcp', [952, 1402, -2]], u: [0, 1, 0], v: [0, 0, 1],
    st: [[0.0, 13, 14, 39, 37, 2.6, 0, 0, 'wrist'], [0.45, 12, 13, 37, 35, 2.6, 0, 0, 'wrist'], [0.78, 11, 11, 33, 31, 2.5, 0, 0, 'wrist'], [0.93, 9, 9, 26, 24, 2.3, 0, 0, 'wrist'], [1.0, 5, 5, 14, 13, 2, 0, 0, 'wrist']],
    slabs: [['fingers_mcp', -1, 0.47], ['fingers_ip', 0.47, 2]] };
  const THUMB = { name: 'thumb', group: 'arm', A: ['thumb_cmc', null], B: ['thumb_ip', [860, 1384, 68]], u: [0, 1, 0], v: [0, 0, 1],
    st: [[-0.1, 14, 16, 16, 16, 2.2, 0, 0, 'wrist'], [0.2, 13, 14, 15, 15, 2.2, 0, 0, 'wrist'], [0.55, 12, 12, 13, 13, 2.2, 0, 0, 'wrist'], [0.9, 10, 10, 11, 11, 2.2, 0, 0, 'wrist'], [1.0, 6, 6, 7, 7, 2, 0, 0, 'wrist']],
    slabs: [['thumb_cmc', -1, 0.42], ['thumb_mcp', 0.42, 0.72], ['thumb_ip', 0.72, 2]] };
  // left leg, one loft from the hip joint to the ankle, cut into slabs on the thigh, its twist bone, the shin and its twist bone. u = +x
  // (outside), v = +z (front). Stations at height y (mm): rU+ (outside), rU- (inside), rV+ (front), rV- (back), centre offset back
  const LEGS = [[937, 44, 50, 40, 52, -10, 'thigh'], [880, 60, 72, 56, 74, -8, 'thigh'], [846, 80, 74, 70, 84, -6, 'thigh'], [800, 84, 73, 77, 82, -4, 'thigh'],
    [740, 79, 70, 76, 76, -2, 'thigh'], [680, 72, 69, 71, 68, 0, 'lowthigh'], [600, 66, 64, 64, 58, 0, 'lowthigh'], [530, 59, 60, 58, 52, 0, 'lowthigh'],
    [490, 55, 57, 56, 50, -1, 'lowthigh'], [470, 53, 55, 54, 50, -2, 'calf'], [440, 50, 53, 50, 52, -2, 'calf'], [400, 48, 51, 44, 56, -3, 'calf'],
    [360, 48, 52, 40, 62, -4, 'calf'], [300, 40, 43, 37, 62, -6, 'calf'], [240, 32, 34, 33, 50, -6, 'calf'], [180, 27, 28, 30, 40, -6, 'ankle'],
    [120, 26, 26, 28, 36, -5, 'ankle'], [80, 33, 33, 31, 33, -4, 'ankle'], [55, 28, 28, 28, 30, -6, 'ankle']];
  const LEG = { name: 'leg', group: 'leg', A: ['thigh', null], B: ['talus', null], u: [1, 0, 0], v: [0, 0, 1],
    st: LEGS.map(([y, a, b, c, d, cv, g]) => [(895 - y) / 819, a, b, c, d, 2.3, 0, cv, g]),
    slabs: [['thigh_twist', -1, 0.25], ['thigh', 0.25, 0.495], ['shin', 0.495, 0.76], ['shin_twist', 0.76, 2]] };
  // foot: along z from the heel, u = +x, v = +y (up); cv = height of the section's centre above the sole
  const FOOTS = [[-70, 10, 10, 12, 12, 2.0, 0, 30], [-58, 27, 27, 30, 30, 2.1, 0, 32], [-30, 31, 31, 44, 40, 2.2, 0, 42], [0, 35, 33, 46, 38, 2.4, -2, 40],
    [40, 39, 35, 34, 32, 2.6, -4, 34], [90, 45, 39, 24, 24, 2.8, -6, 26], [130, 49, 43, 17, 18, 3.0, -7, 19], [165, 45, 41, 12, 14, 3.0, -9, 15], [190, 36, 36, 10, 11, 2.8, -10, 12], [202, 16, 16, 6, 7, 2.2, -10, 9]];
  const FOOT = { name: 'foot', group: 'leg', A: ['foot', [91, 0, -70]], B: ['foot', [91, 0, 202]], u: [1, 0, 0], v: [0, 1, 0],
    st: FOOTS.map(([z, a, b, c, d, n, cu, cv]) => [(z + 70) / 272, a, b, c, d, n, cu, cv, 'foot']),
    slabs: [['foot', -1, (25 + 70) / 272], ['midfoot', (25 + 70) / 272, (128 + 70) / 272], ['toe_hallux', (128 + 70) / 272, 2]] };
  // the shoulder's top, neck to acromion (the trapezius slope over the clavicle and the scapula's spine). u = +y (up), v = +z
  const SHOULDER = { name: 'shoulder', group: 'trunk', blend: 0.045, A: ['thorax_hi', [22, 1482, -46]], B: ['scapula', [174, 1428, -12]], u: [0, 1, 0], v: [0, 0, 1],
    st: [[-0.05, 24, 50, 40, 52, 2.2, 0, 0, 'chest'], [0.3, 21, 46, 42, 52, 2.2, 0, 0, 'chest'], [0.7, 17, 38, 40, 46, 2.2, 0, 0, 'chest'], [1.0, 12, 26, 32, 34, 2.2, 0, 0, 'chest'], [1.1, 8, 16, 20, 22, 2.0, 0, 0, 'chest']],
    slabs: [['thorax_hi', -1, 0.35], ['clavicle', 0.35, 0.7], ['scapula', 0.7, 2]] };
  const LOFTS_SIDE = [SHOULDER, ARM, PALM, FING, THUMB, LEG, FOOT];

  // head (mannequin forms): ellipsoids on the head and jaw, centre and radii in mm
  const HEAD = [   // (forms join with a 3 cm blend)
    ['head', [0, 1668, -8], [76, 90, 97]],         // cranium
    ['head', [0, 1614, 22], [64, 72, 74]],         // face
    ['head', [0, 1682, 62], [52, 16, 24]],         // brow
    ['head', [0, 1636, 88], [11, 20, 14]],         // nose
    ['head', [73, 1648, -6], [9, 29, 17]], ['head', [-73, 1648, -6], [9, 29, 17]],     // ears
    ['jaw', [0, 1566, 40], [57, 34, 52]],          // jaw
    ['jaw', [0, 1542, 66], [27, 20, 20]],          // chin
  ];

  // muscles (left side): name, group, origin bone, origin, insertion bone, insertion, belly radius, flatness (thickness / width), thickness
  // direction (reference frame), where along the line the belly peaks, blend (mm), how much of its thickness stands out of the base
  const MUSCLES = [
    ['deltoid_ant', 'arm', 'scapula', [150, 1452, 40], 'upperarm', [302, 1398, 18], 26, 0.6, [0, 0.6, 1], 0.4, 12, 0.38],
    ['deltoid_mid', 'arm', 'scapula', [190, 1446, -8], 'upperarm', [306, 1404, 0], 28, 0.6, [0, 1, 0], 0.35, 12, 0.34],
    ['deltoid_post', 'arm', 'scapula', [150, 1448, -64], 'upperarm', [302, 1400, -16], 25, 0.6, [0, 0.6, -1], 0.4, 12, 0.38],
    ['biceps', 'arm', 'scapula', [215, 1400, 24], 'forearm', [535, 1400, 10], 25, 0.85, [0, 0, 1], 0.6, 10, 0.45],
    ['triceps_long', 'arm', 'scapula', [168, 1386, -30], 'forearm', [500, 1408, -36], 26, 0.7, [0, 0, -1], 0.4, 10, 0.42],
    ['triceps_lat', 'arm', 'upperarm', [230, 1416, -24], 'forearm', [500, 1412, -34], 22, 0.7, [0, 0.7, -1], 0.45, 10, 0.4],
    ['brachioradialis', 'arm', 'upperarm', [440, 1420, 8], 'forearm_twist_02', [735, 1404, 20], 17, 0.8, [0, 1, 0.5], 0.25, 8, 0.22],
    ['flexors', 'arm', 'upperarm', [500, 1382, -8], 'forearm_twist_02', [720, 1394, 0], 21, 0.75, [0, -1, 0], 0.25, 8, 0.2],
    ['extensors', 'arm', 'upperarm', [505, 1428, -4], 'forearm_twist_02', [725, 1414, -4], 18, 0.75, [0, 1, -0.3], 0.3, 8, 0.2],
    ['pec_clav', 'trunk', 'thorax_hi', [70, 1430, 72], 'upperarm', [232, 1402, 24], 25, 0.45, [0, 0.3, 1], 0.35, 14, 0.2],
    // the pectoral as one broad slab from the sternum to the arm (its lower edge is the fold in front of the armpit)
    ['pec_sternal', 'trunk', 'thorax_mid', [26, 1338, 112], 'upperarm', [205, 1392, 44], 60, 0.3, [0, 0, 1], 0.4, 16, 0.24, 1],
    ['lat', 'trunk', 'lumbar_hi', [45, 1120, -116], 'upperarm', [215, 1392, -8], 36, 0.35, [1, 0, -1], 0.45, 16, 0.28],
    ['teres', 'trunk', 'scapula', [110, 1330, -108], 'upperarm', [212, 1395, -6], 19, 0.6, [0.3, -0.5, -1], 0.4, 12, 0.12],
    ['infraspinatus', 'trunk', 'scapula', [86, 1420, -104], 'scapula', [100, 1305, -108], 30, 0.33, [0.2, 0, -1], 0.5, 14, 0.1],
    ['trap_upper', 'trunk', 'neck_lo', [8, 1562, -60], 'scapula', [176, 1458, -24], 24, 0.5, [0, 1, -0.3], 0.35, 16, 0.3],
    ['trap_mid', 'trunk', 'thorax_hi', [5, 1420, -108], 'scapula', [150, 1446, -55], 22, 0.35, [0, 0, -1], 0.4, 14, 0.2],
    ['trap_low', 'trunk', 'thorax_mid', [5, 1270, -112], 'scapula', [95, 1410, -100], 22, 0.35, [0, 0, -1], 0.45, 14, 0.2],
    // rectus abdominis in four bellies between its tendinous bands (the bands and the linea alba are the gaps between them)
    ['rectus_abd1', 'trunk', 'pelvis', [36, 948, 96], 'pelvis', [38, 1042, 101], 31, 0.4, [0, 0, 1], 0.55, 10, 0.14, 1],
    ['rectus_abd2', 'trunk', 'lumbar_lo', [38, 1050, 102], 'lumbar_hi', [40, 1124, 106], 31, 0.4, [0, 0, 1], 0.5, 10, 0.17, 1],
    ['rectus_abd3', 'trunk', 'lumbar_hi', [40, 1132, 107], 'thorax_lo', [42, 1198, 110], 31, 0.4, [0, 0, 1], 0.5, 10, 0.17, 1],
    ['rectus_abd4', 'trunk', 'thorax_lo', [42, 1206, 111], 'thorax_mid', [52, 1264, 113], 30, 0.4, [0, 0, 1], 0.5, 10, 0.14, 1],
    ['serratus1', 'trunk', 'thorax_mid', [108, 1292, 86], 'thorax_mid', [134, 1262, 42], 16, 0.5, [1, 0, 1], 0.45, 8, 0.16, 1],
    ['serratus2', 'trunk', 'thorax_mid', [112, 1258, 88], 'thorax_lo', [138, 1228, 44], 16, 0.5, [1, 0, 1], 0.45, 8, 0.16, 1],
    ['serratus3', 'trunk', 'thorax_lo', [116, 1224, 86], 'thorax_lo', [140, 1194, 46], 15, 0.5, [1, 0, 1], 0.45, 8, 0.14, 1],
    ['oblique', 'trunk', 'thorax_mid', [125, 1240, 45], 'pelvis', [112, 1030, 52], 34, 0.4, [1, 0, 0.3], 0.62, 18, 0.15],
    ['erector', 'trunk', 'pelvis', [32, 980, -116], 'thorax_mid', [32, 1330, -100], 26, 0.6, [0, 0, -1], 0.4, 14, 0.2],
    ['glute_max', 'trunk', 'pelvis', [40, 1010, -132], 'thigh', [118, 815, -72], 50, 0.6, [0.3, 0, -1], 0.35, 18, 0.0],
    ['glute_med', 'trunk', 'pelvis', [125, 1030, -50], 'thigh', [150, 885, -15], 34, 0.6, [1, 0, 0], 0.4, 16, 0.15],
    ['scm', 'neck', 'thorax_hi', [24, 1442, 58], 'head', [62, 1625, -22], 11, 0.8, [1, 0, 1], 0.45, 8, 0.45],
    ['rectus_fem', 'leg', 'pelvis', [95, 880, 62], 'shin', [92, 440, 55], 30, 0.75, [0, 0, 1], 0.5, 12, 0.18],
    ['vastus_lat', 'leg', 'thigh', [150, 860, 10], 'shin', [118, 470, 40], 36, 0.65, [1, 0, 0.3], 0.5, 12, 0.2],
    ['vastus_med', 'leg', 'thigh', [75, 720, 30], 'shin', [70, 470, 40], 32, 0.8, [-0.7, 0, 0.7], 0.7, 12, 0.3],
    ['adductors', 'leg', 'pelvis', [25, 840, 10], 'thigh', [75, 600, -5], 42, 0.7, [-1, 0, 0], 0.35, 14, 0.08],
    ['ham_bf', 'leg', 'pelvis', [100, 860, -80], 'shin', [130, 430, -35], 30, 0.8, [0, 0, -1], 0.45, 12, 0.12],
    ['ham_sm', 'leg', 'pelvis', [70, 860, -80], 'shin', [60, 430, -35], 30, 0.8, [0, 0, -1], 0.45, 12, 0.12],
    ['gastro_med', 'leg', 'thigh', [68, 500, -42], 'shin', [88, 175, -58], 33, 0.75, [-0.5, 0, -1], 0.32, 10, 0.35],
    ['gastro_lat', 'leg', 'thigh', [118, 500, -42], 'shin', [98, 195, -55], 27, 0.75, [0.5, 0, -1], 0.3, 10, 0.35],
    ['tib_ant', 'leg', 'shin', [112, 440, 40], 'shin', [92, 110, 40], 15, 0.8, [0.5, 0, 1], 0.3, 8, 0.2],
    ['patella', 'leg', 'thigh', [91, 505, 56], 'shin', [91, 448, 58], 22, 0.6, [0, 0, 1], 0.5, 12, 0.15],
  ];

  // ---- build a body for a skeleton (sk.M holds the measurements)
  function build(sk, F) {
    const M = sk.M, k = M.S / 1756 / 1000, ref = REF();
    F = F || { buttock: 1, waist: 1, chest: 1, neck: 1, arm: 1, forearm: 1, wrist: 1, thigh: 1, lowthigh: 1, calf: 1, ankle: 1, foot: 1 };
    // muscle size: with mass at the same stature (girth ~ sqrt(mass / length)), less with fat, less for the female blend
    const msc = Math.sqrt((M.kg / 75) / (M.S / 1756)) * (1 - 0.008 * M.bfDelta) * (1 - 0.22 * M.sex);
    const I = sk.idx;
    // a reference point on bone b -> canonical point of this body
    const map = (b, x) => V.add(sk.bones[I[b]].J, V.mul(V.sub(x, ref[b]), k));
    const parts = [], lofts = [];
    const addLoft = (L, side) => {
      const sx = side === 'R' ? -1 : 1, nm = b => (b === 'pelvis' || b.startsWith('thorax') || b.startsWith('lumbar') || b.startsWith('neck') || b === 'head') ? b : b + '_' + side;
      const grp = L.group === 'trunk' || L.group === 'neck' ? L.group : L.group + (side ? '_' + side : '');
      const mir = x => [x[0] * sx, x[1], x[2]];
      const pA = L.A[1] ? map(nm(L.A[0]), mir(L.A[1])) : sk.bones[I[nm(L.A[0])]].J;
      const pB = L.B[1] ? map(nm(L.B[0]), mir(L.B[1])) : sk.bones[I[nm(L.B[0])]].J;
      const len = V.len(V.sub(pB, pA)), ax = V.norm(V.sub(pB, pA));
      // cross-section frame: u, v from the spec, made square to the axis; mirrored, u flips with x for the side-to-side radii
      let u = mir(L.u), v = mir(L.v);
      v = V.norm(V.sub(v, V.mul(ax, V.dot(v, ax)))); u = V.norm(V.cross(v, ax)); if (V.dot(u, mir(L.u)) < 0) u = V.mul(u, -1);
      // a fine table along t (Catmull-Rom through the stations), radii in metres scaled by the girth factors
      const S = L.st, NT = 160, t0 = S[0][0], t1 = S[S.length - 1][0], tab = new Float32Array(NT * 8);
      const fld = (i, j) => { const s = S[Math.max(0, Math.min(S.length - 1, i))]; if (j === 9) return s[9] || 1; if (j < 5) return s[j] * (F[s[8]] || 1); return s[j]; };
      // piecewise linear through the stations, then smoothed along the loft (a Gaussian of ~2.5 % of its length): no ridges at the stations
      for (let q = 0; q < NT; q++) {
        const t = t0 + (t1 - t0) * q / (NT - 1);
        let i = 0; while (i < S.length - 2 && S[i + 1][0] < t) i++;
        const f = Math.min(1, Math.max(0, (t - S[i][0]) / (S[i + 1][0] - S[i][0])));
        for (const j of [1, 2, 3, 4, 5, 6, 7, 9]) { const v2 = fld(i, j) + (fld(i + 1, j) - fld(i, j)) * f; tab[q * 8 + (j === 9 ? 7 : j - 1)] = j < 5 || j === 6 || j === 7 ? v2 * k : v2; }
      }
      const sig = 0.025 * NT, R = Math.ceil(2.5 * sig), wts = []; for (let r = -R; r <= R; r++) wts.push(Math.exp(-r * r / (2 * sig * sig)));
      const tmp = Float32Array.from(tab);
      for (let q = 0; q < NT; q++) for (let j = 0; j < 8; j++) { let sw = 0, sv = 0; for (let r = -R; r <= R; r++) { const qq = q + r; if (qq < 0 || qq >= NT) continue; sw += wts[r + R]; sv += wts[r + R] * tmp[qq * 8 + j]; } tab[q * 8 + j] = sv / sw; }
      for (let q = 0; q < NT; q++) tab[q * 8 + 4] = Math.max(1.6, tab[q * 8 + 4]);
      const lo = { name: L.name + (side ? '_' + side : ''), group: grp, blend: L.blend, A: pA, ax, u, v, len, t0, t1, tab, NT, inv: (NT - 1) / (t1 - t0) };
      lofts.push(lo);
      let rmax = 0; for (let q = 0; q < NT; q++) rmax = Math.max(rmax, tab[q * 8] * tab[q * 8 + 7], tab[q * 8 + 1] * tab[q * 8 + 7], tab[q * 8 + 2], tab[q * 8 + 3]);
      for (const [b, c0, c1] of L.slabs) {
        const ca = Math.max(c0, t0), cb = Math.min(c1, t1), mid = V.add(pA, V.mul(ax, len * (ca + cb) / 2));
        parts.push({ kind: 'loft', loft: lo, bone: I[nm(b)], c0, c1, group: lo.group, cen: mid, rad: Math.hypot(len * (cb - ca) / 2 + 0.04, rmax + 0.04) });
      }
    };
    addLoft(trunkLoft, ''); addLoft(neckLoft, '');
    for (const s of ['L', 'R']) for (const L of LOFTS_SIDE) addLoft(L, s);
    // the shoulder's masses, which a tube for the arm and a barrel for the chest leave out: the deltoid capping the joint, and the two folds
    // of the armpit (the pectoral in front, the latissimus / teres behind) that carry the chest's surface out onto the arm
    for (const s of ['L', 'R']) { const sx = s === 'L' ? 1 : -1, E = (bone, c, r, group, blend) => { const cc = map(bone, [c[0] * sx, c[1], c[2]]);
        parts.push({ kind: 'ell', bone: I[bone], c: cc, r: V.mul(r, k), group, blend, cen: cc, rad: Math.max(...r) * k + 0.04 }); };
      E('upperarm_twist_01_' + s, [198, 1408, -2], [60, 50, 57], 'arm_' + s, 0.03);
      E('thorax_hi', [122, 1368, 50], [50, 50, 36], 'trunk', 0.04);
      E('scapula_' + s, [126, 1352, -66], [48, 64, 34], 'trunk', 0.04);
    }
    for (const [b, c, r] of HEAD) parts.push({ kind: 'ell', bone: I[b], c: map(b, c), r: V.mul(r, k), group: 'neck', cen: map(b, c), rad: Math.max(...r) * k + 0.03 });
    // the buttocks' two cheeks (the trunk's loft cannot make the cleft between them)
    for (const sx of [1, -1]) { const c = map('pelvis', [sx * 64, 878, -88]); parts.push({ kind: 'ell', bone: I.pelvis, c, r: V.mul([70 * (F.buttock || 1), 80, 60 * (F.buttock || 1)], k), group: 'trunk', blend: 0.035, cen: c, rad: 0.11 }); }
    // female blend: breast volume (a mannequin's smooth form), sized with the sex blend and body fat
    if (M.sex > 0.05) for (const sx of [1, -1]) {
      const r = (38 + 30 * Math.max(0, (M.p.bodyFat - 15) / 20)) * M.sex * Math.sqrt(M.kg / 60);
      const c = map('thorax_mid', [sx * 92, 1262, 112]);
      parts.push({ kind: 'ell', bone: I.thorax_mid, c, r: V.mul([r * 1.05, r * 0.95, r * 0.8], k), group: 'trunk', blend: 0.03, cen: c, rad: r * k + 0.04 });
    }
    const muscles = [];
    // muscle definition: how far the bellies stand out of the skin. M.p.def is the user's setting (1 = a fit, active man); fat smooths it away
    const lean = Math.max(0.3, Math.min(1.5, (30 - M.p.bodyFat) / 12)), DEF = 1.5 * (M.p.def != null ? M.p.def : 1) * lean;
    for (const s of ['L', 'R']) for (const [name, group, ob, oa, ib, ia, r0, flat, out, tp, kb, show, pad] of MUSCLES) {
      const sx = s === 'R' ? -1 : 1, nm = b => (b === 'pelvis' || b.startsWith('thorax') || b.startsWith('lumbar') || b.startsWith('neck') || b === 'head') ? b : b + '_' + s;
      const mir = x => [x[0] * sx, x[1], x[2]];
      const A = map(nm(ob), mir(oa)), B = map(nm(ib), mir(ia));
      const m = { kind: 'muscle', name: name + '_' + s, group: group === 'neck' ? 'neck' : group === 'trunk' ? 'trunk' : group + '_' + s, ob: I[nm(ob)], ib: I[nm(ib)], A, B,
        L0: V.len(V.sub(B, A)), r0: r0 * k * msc, flat, out: V.norm(mir(out)), tp, blend: kb / 1000 * 1.8, show, pad: !!pad };
      muscles.push(m); parts.push(m);
    }
    const groups = ['trunk', 'neck', 'arm_L', 'arm_R', 'leg_L', 'leg_R'];
    parts.forEach(p => p.gi = groups.indexOf(p.group));
    const body = { sk, M, F, parts, lofts, muscles, groups, msc, k };
    // each muscle's line is laid on the base surface (the coordinates above are surface landmarks): its two ends are moved onto it
    const c0 = prepare(body, Human.Skeleton.fk(sk, sk.bones.map(() => Q.id())), true);
    const snap = P => { for (let it = 0; it < 3; it++) { const d = dist(c0, P[0], P[1], P[2]), g = V.norm(grad(c0, P[0], P[1], P[2])); P = V.sub(P, V.mul(g, d)); } return P; };
    for (const m of muscles) {
      m.A = snap(m.A); m.B = snap(m.B); m.L0 = V.len(V.sub(m.B, m.A));
      m.h0 = m.r0 * m.flat * (m.show != null ? m.show : 0.3) * DEF;
    }
    return body;
  }

  // ---- per pose: the transforms every piece needs (from Human.Skeleton.pose)
  function prepare(body, xf, noMuscle) {
    const sk = body.sk, n = sk.n, inv = new Float64Array(n * 15);
    for (let b = 0; b < n; b++) {
      const q = Q.conj(xf.R[b]), ex = Q.rot(q, [1, 0, 0]), ey = Q.rot(q, [0, 1, 0]), ez = Q.rot(q, [0, 0, 1]), o = b * 15;
      // canonical = J + R^T (p - P): rows of R^T
      inv[o] = ex[0]; inv[o + 1] = ey[0]; inv[o + 2] = ez[0]; inv[o + 3] = ex[1]; inv[o + 4] = ey[1]; inv[o + 5] = ez[1]; inv[o + 6] = ex[2]; inv[o + 7] = ey[2]; inv[o + 8] = ez[2];
      inv[o + 9] = xf.P[b][0]; inv[o + 10] = xf.P[b][1]; inv[o + 11] = xf.P[b][2]; inv[o + 12] = sk.bones[b].J[0]; inv[o + 13] = sk.bones[b].J[1]; inv[o + 14] = sk.bones[b].J[2];
    }
    const pc = body.parts.map(p => {
      if (p.kind === 'muscle') {
        const A = Human.Skeleton.apply(xf, sk, p.ob, p.A), B = Human.Skeleton.apply(xf, sk, p.ib, p.B), ab = V.sub(B, A), L = V.len(ab), an = V.mul(ab, 1 / L);
        let out = Q.rot(xf.R[p.ob], p.out); out = V.norm(V.sub(out, V.mul(an, V.dot(out, an)))); const e2 = V.cross(an, out);
        const sq = Math.sqrt(p.L0 / L), r = p.r0 * sq, h = p.h0 * sq;             // shorter -> thicker and wider, the same volume
        return { A, an, L, e1: out, e2, r, h, cen: V.lerp(A, B, 0.5), rad: L / 2 + r + 0.02 };
      }
      return { cen: Human.Skeleton.apply(xf, sk, p.bone, p.cen), rad: p.rad };
    });
    const np = body.parts.length, cb = new Float64Array(np * 4);
    pc.forEach((q, i) => { cb[i * 4] = q.cen[0]; cb[i * 4 + 1] = q.cen[1]; cb[i * 4 + 2] = q.cen[2]; cb[i * 4 + 3] = q.rad; });
    if (!body.li) {
      const li = new Int16Array(np).fill(-1), lg = [], lk = []; const ids = new Map();
      body.parts.forEach((p, i) => { if (p.kind === 'muscle') return; const key = p.kind === 'loft' ? p.loft : p; if (!ids.has(key)) { ids.set(key, lg.length); lg.push(p.gi); lk.push(p.kind === 'ell' ? (p.blend || 0.03) : (p.loft.blend || 0.015)); } li[i] = ids.get(key); });
      body.li = li; body.lg = Int8Array.from(lg); body.lk = Float64Array.from(lk);
    }
    return { body, xf, inv, pc, cb, li: body.li, lg: body.lg, lk: body.lk, ld: new Float64Array(body.lg.length), lb: new Int32Array(body.lg.length), cd: new Float64Array(np), gd: new Float64Array(6), gb: new Int32Array(6),
      kind: Int8Array.from(body.parts, p => p.kind === 'loft' ? 0 : p.kind === 'ell' ? 1 : noMuscle ? 3 : 2), gi: Int8Array.from(body.parts, p => p.gi) };
  }

  const OV = 0.03;
  // distance to one piece
  function partDist(p, c, pc, x, y, z) {
    if (p.kind === 'muscle') {
      // relief: how far the belly lifts the skin at this point (>= 0)
      const dx = x - pc.A[0], dy = y - pc.A[1], dz = z - pc.A[2];
      const t = (dx * pc.an[0] + dy * pc.an[1] + dz * pc.an[2]) / pc.L; if (t <= 0 || t >= 1) return 0;
      const qx = dx - pc.an[0] * t * pc.L, qy = dy - pc.an[1] * t * pc.L, qz = dz - pc.an[2] * t * pc.L;
      const a = qx * pc.e1[0] + qy * pc.e1[1] + qz * pc.e1[2], b = qx * pc.e2[0] + qy * pc.e2[1] + qz * pc.e2[2];
      const tt = t < p.tp ? 0.5 * t / p.tp : 0.5 + 0.5 * (t - p.tp) / (1 - p.tp);
      // a belly tapers to its tendons; a pad (the abdominal segments, the serratus digits) is flat-topped with soft edges
      const sn = Math.sin(Math.PI * tt), e4 = (2 * tt - 1) ** 4, prof = p.pad ? 1 - e4 : Math.sqrt(sn) * (1.5 - 0.5 * sn), w = pc.r * (p.pad ? 1 : prof);
      if (w < 1e-4) return 0;
      const rho = b / w, r2 = rho * rho; if (r2 >= 1) return 0;
      const s1 = Human.smooth(-1.2 * w, 0, a) * (1 - Human.smooth(1.5 * w, 3.5 * w, a)); if (s1 <= 0) return 0;
      const side = s1;
      const f = p.pad ? (1 - r2) * (1 + 0.6 * r2) : (1 - r2) * (1 - r2);
      return pc.h * prof * f * side;
    }
    const o = p.bone * 15, inv = c.inv, px = x - inv[o + 9], py = y - inv[o + 10], pz = z - inv[o + 11];
    const cx = inv[o + 12] + inv[o] * px + inv[o + 1] * py + inv[o + 2] * pz, cy = inv[o + 13] + inv[o + 3] * px + inv[o + 4] * py + inv[o + 5] * pz, cz = inv[o + 14] + inv[o + 6] * px + inv[o + 7] * py + inv[o + 8] * pz;
    if (p.kind === 'ell') {
      const ex = (cx - p.c[0]) / p.r[0], ey = (cy - p.c[1]) / p.r[1], ez = (cz - p.c[2]) / p.r[2], k0 = Math.hypot(ex, ey, ez), k1 = Math.hypot(ex / p.r[0], ey / p.r[1], ez / p.r[2]);
      return k1 < 1e-9 ? -Math.min(...p.r) : k0 * (k0 - 1) / k1;
    }
    // loft slab
    const L = p.loft, rx = cx - L.A[0], ry = cy - L.A[1], rz = cz - L.A[2], ax = L.ax, U = L.u, W = L.v;
    const t = (rx * ax[0] + ry * ax[1] + rz * ax[2]) / L.len;
    const tt = t < L.t0 ? L.t0 : t > L.t1 ? L.t1 : t;
    const s = (tt - L.t0) * L.inv, i = s >= L.NT - 1 ? L.NT - 2 : s | 0, f = s - i, T = L.tab, a = i * 8, b = a + 8, f1 = 1 - f;
    const du = rx * U[0] + ry * U[1] + rz * U[2] - (T[a + 5] * f1 + T[b + 5] * f), dv = rx * W[0] + ry * W[1] + rz * W[2] - (T[a + 6] * f1 + T[b + 6] * f);
    let ru = du > 0 ? T[a] * f1 + T[b] * f : T[a + 1] * f1 + T[b + 1] * f; const rv = dv > 0 ? T[a + 2] * f1 + T[b + 2] * f : T[a + 3] * f1 + T[b + 3] * f, n = T[a + 4] * f1 + T[b + 4] * f;
    if (dv < 0) { const wb = T[a + 7] * f1 + T[b + 7] * f; if (wb !== 1) { const e = -dv / rv / 0.6, sm = e >= 1 ? 1 : e * e * (3 - 2 * e); ru *= 1 + (wb - 1) * sm; } }
    const qu = (du < 0 ? -du : du) / ru, qv = (dv < 0 ? -dv : dv) / rv, rp = Math.sqrt(du * du + dv * dv);
    const fq = qu + qv < 1e-9 ? 0 : Math.exp(Math.log(Math.exp(n * Math.log(qu + 1e-12)) + Math.exp(n * Math.log(qv + 1e-12))) / n);
    const rm = ru < rv ? ru : rv;
    let d = fq > 1e-6 ? rp * (1 - 1 / fq) : -rm;
    if (d < -rm) d = -rm;
    const ov = (t < L.t0 ? L.t0 - t : t - L.t1) * L.len; if (ov > d) d = ov;
    // (the slabs overlap by OV on either side of their cut: where they meet, the inside stays the loft's own inside)
    if (p.c0 > L.t0) { const e = (p.c0 - t) * L.len - OV; if (e > d) d = e; }
    if (p.c1 < L.t1) { const e = (t - p.c1) * L.len - OV; if (e > d) d = e; }
    return d;
  }

  // the body's distance at a point. opt.groups: a mask of group indices to include (for measuring). Returns the distance; with out, also fills
  // out.g (the nearest group) and out.part (the nearest base piece)
  const GK = [0, 0.02, 0.055, 0.055, 0.045, 0.045];          // how softly each group is joined to the trunk (m)
  function dist(c, x, y, z, mask, out) {
    const parts = c.body.parts, pc = c.pc, np = parts.length, gd = c.gd, gb = c.gb, cd = c.cd, CB = c.cb, kind = c.kind, gi = c.gi, li = c.li, ld = c.ld, lb = c.lb, nl = ld.length;
    for (let g = 0; g < 6; g++) { gd[g] = 1e9; gb[g] = -1; }
    for (let l = 0; l < nl; l++) ld[l] = 1e9;
    // cheap bounds first; the nearest piece is evaluated first so that everything far beyond it can be skipped
    let i0 = -1, m0 = 1e9;
    for (let i = 0; i < np; i++) {
      const o = i * 4, ex = x - CB[o], ey = y - CB[o + 1], ez = z - CB[o + 2], d = Math.sqrt(ex * ex + ey * ey + ez * ez) - CB[o + 3]; cd[i] = d;
      if (kind[i] < 2 && d < m0 && (!mask || mask >> gi[i] & 1)) { m0 = d; i0 = i; }
    }
    if (i0 < 0) return 1e9;
    if (m0 > 0.05 && !out) return m0;                                  // far from everything: a lower bound is enough
    // base pieces: the slabs of one loft by plain minimum (they are one surface cut in pieces), then the lofts and forms of a group blended
    let U = 1e9;
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < np; i++) {
      if (pass === 0 ? i !== i0 : i === i0) continue;
      const k = kind[i]; if (k >= 2) continue; const g = gi[i]; if (mask && !(mask >> g & 1)) continue;
      if (pass && cd[i] > U + 0.06) continue;
      const d = partDist(parts[i], c, pc[i], x, y, z), l = li[i];
      if (d < ld[l]) { ld[l] = d; lb[l] = i; }
      if (d < U) U = d;
      if (!pass) break;
    }
    const LG = c.lg, LK = c.lk;
    for (let l = 0; l < nl; l++) { const d = ld[l]; if (d > 1e8) continue; const g = LG[l];
      if (gd[g] > 1e8) { gd[g] = d; gb[g] = lb[l]; } else { if (d < gd[g]) gb[g] = lb[l]; gd[g] = smin(gd[g], d, LK[l]); } }
    for (let g = 0; g < 6; g++) if (gd[g] < U) U = gd[g];
    for (let i = 0; i < np; i++) {
      if (kind[i] !== 2) continue; const g = gi[i]; if (gd[g] > 0.04 || gd[g] < -0.04) continue; if (cd[i] > 0.04) continue;
      gd[g] -= partDist(parts[i], c, pc[i], x, y, z);
    }
    let best = gd[0], bg = 0;
    for (let g = 1; g < 6; g++) { if (gd[g] > 1e8) continue; const d = gd[0] < 1e8 ? smin(gd[0], gd[g], GK[g]) : gd[g]; if (d < best) { best = d; bg = g; } }
    if (out) { out.g = bg; out.part = gb[bg]; out.gd = Array.from(gd); }
    return best;
  }
  function grad(c, x, y, z, mask, h = 0.0015) {
    // tetrahedral differences: 4 samples
    const a = dist(c, x + h, y - h, z - h, mask), b = dist(c, x - h, y - h, z + h, mask), d = dist(c, x - h, y + h, z - h, mask), e = dist(c, x + h, y + h, z + h, mask);
    return [a - b - d + e, -a - b + d + e, -a + b - d + e].map(v => v / (4 * h));
  }
  Human.Body = { build, prepare, dist, grad, partDist, MUSCLES, TRUNK };
})();
