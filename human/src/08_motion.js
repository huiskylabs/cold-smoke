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
  const keys = K => t => {
    let i = 0; while (i < K.length - 2 && K[i + 1][0] <= t) i++;
    const b = K[i], c = K[i + 1], a = K[Math.max(0, i - 1)], d = K[Math.min(K.length - 1, i + 2)];
    const s = clamp((t - b[0]) / (c[0] - b[0]), 0, 1), s2 = s * s, s3 = s2 * s;
    return mix([a[1], b[1], c[1], d[1]], [(-s + 2 * s2 - s3) / 2, (2 - 5 * s2 + 3 * s3) / 2, (s + 4 * s2 - 3 * s3) / 2, (-s2 + s3) / 2]);
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
  const flight = (t, t1, t2, h) => t > t1 && t < t2 ? 4 * h * ((t - t1) / (t2 - t1)) * (1 - (t - t1) / (t2 - t1)) : 0;

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

  // the carved turn: one right turn, mirrored for the left turn. The video gives, per phase, how far the hips lean inside the feet, how low they
  // sit and how far the shoulders turn against the pelvis (the sideways plane is what one camera measures well); the skis are put parallel on
  // the snow under that, the legs are solved to reach them (the inside leg folds, the outside leg stays long) and the trunk leans back out
  // over the outside ski (angulation). The raw joint directions are not used: their depth is too noisy and crosses the skis.
  const carveCache = new WeakMap();
  function fitCarve(sk) {
    if (carveCache.has(sk)) return carveCache.get(sk);
    const M = Human.MOCAP && Human.MOCAP.carve; if (!M) return null;
    const I = sk.idx, J = n => sk.bones[I[n]].J, s = signs(sk);
    const legLen = V.len(V.sub(J('shin_L'), J('thigh_L'))) + V.len(V.sub(J('talus_L'), J('shin_L')));
    // coordinate descent on a few fields of the pose, from the previous phase's answer
    const descend = (p, fields, err, step = 16) => {
      let e = err(p);
      for (let st = step; st > 0.1; st /= 2) for (let rep = 0; rep < 4; rep++) { let moved = false;
        for (const [o, k] of fields) for (const dv of [st, -st]) { o(p)[k] += dv; const e2 = err(p); if (e2 < e - 1e-12) { e = e2; moved = true; } else o(p)[k] -= dv; }
        if (!moved) break; }
      return e;
    };
    const latSign = (() => { const a = Human.Skeleton.pose(sk, make(p => { p.spine.lat = 20; })); return a.P[I.head][0] > 0 ? 1 : -1; })();   // + = the chest leans to the body's left
    const out = []; let prev = SKI; const stance = 0.34 * sk.M.S / 1756;
    for (let ph = 0; ph < M.phases; ph++) {
      const lean = Math.atan2(-M.hipLateral[ph], M.hipHeight[ph]) / D;              // deg, + = the hips to the body's left of the feet
      const low = clamp(1 - M.hipHeight[ph], 0.08, 0.4), tw = (M.twist ? M.twist[ph] : 0) / D;
      const p = JSON.parse(JSON.stringify(prev));
      // the pelvis: leans with the turn (less than the legs do), tips forward more as it sinks; sits behind the boots as the knees fold
      p.root.rot = [10 + 32 * low, 0, -s.roll * 0.55 * lean * (lean > 0 === (s.roll > 0) ? 1 : 1)];
      p.root.pos = [0, 0, 0];
      const hipW = [-M.hipLateral[ph] * legLen, M.hipHeight[ph] * legLen, (-0.05 - 0.5 * low) * legLen];        // mid-hip from mid-ankle, world
      const X = () => Human.Skeleton.pose(sk, p), at = (xf, n) => xf.P[I[n]];
      // which way the roll leans: checked on the skeleton (the hips' line must dip toward the inside of the turn)
      { const xf = X(), d = V.sub(at(xf, 'thigh_L'), at(xf, 'thigh_R')); if ((d[1] > 0) === (lean > 0)) p.root.rot[2] = -p.root.rot[2]; }
      for (const sd of ['L', 'R']) {
        const foot = [(sd === 'L' ? 1 : -1) * stance / 2, 0, 0];
        { // a first answer in the leg's own plane (knee angle from the reach, hip angles from the direction), then refined on the skeleton
          const xf = X(), mid = V.lerp(at(xf, 'thigh_L'), at(xf, 'thigh_R'), 0.5), hip = V.sub(at(xf, 'thigh_' + sd), mid);
          const d = Human.q.rot(Human.q.conj(xf.R[I.pelvis]), V.sub(V.sub(foot, hipW), hip)), tl = V.len(V.sub(J('shin_L'), J('thigh_L'))), sl = legLen - tl, r = Math.min(V.len(d), legLen * 0.999);
          const knee = 180 - Math.acos(clamp((tl * tl + sl * sl - r * r) / (2 * tl * sl), -1, 1)) / D, al = Math.acos(clamp((tl * tl + r * r - sl * sl) / (2 * tl * r), -1, 1)) / D;
          Object.assign(p['leg_' + sd], { flex: Math.atan2(d[2], -d[1]) / D + al, abd: Math.atan2(d[0] * (sd === 'L' ? 1 : -1), -d[1]) / D, rot: 0, knee }); }
        Object.assign(p['leg_' + sd], { ankle: -16, inv: 0, toe: 0 });
        descend(p, [[q => q['leg_' + sd], 'flex'], [q => q['leg_' + sd], 'abd'], [q => q['leg_' + sd], 'rot'], [q => q['leg_' + sd], 'knee']], () => { const xf = X();
          const mid = V.lerp(at(xf, 'thigh_L'), at(xf, 'thigh_R'), 0.5), a = V.sub(at(xf, 'talus_' + sd), mid), t = V.sub(foot, hipW);
          const c = contacts(sk, xf), o = sd === 'L' ? 0 : 3, f = V.sub(c[o + 1], c[o]), ski = 1 - f[2] / Math.hypot(f[0], f[2]);
          return V.dot(V.sub(a, t), V.sub(a, t)) * 3000 + ski; }, 3);
        // the boot: the ankle holds the ski level from tip to tail
        descend(p, [[q => q['leg_' + sd], 'ankle']], () => { const c = contacts(sk, X()), o = sd === 'L' ? 0 : 3; return (c[o + 1][1] - c[o][1]) ** 2; }, 8);
      }
      // angulation: the trunk leans back toward the outside ski, the head stays level; the chest turns against the pelvis as measured
      p.spine = { flex: 10 + 30 * low, lat: -latSign * 0.5 * lean, twist: s.twist * 0.6 * tw };
      p.neck = { flex: -(14 + 30 * low), lat: -latSign * 0.25 * lean, yaw: -s.neck * 0.3 * tw };
      skiArms(p, { elev: 58, elbow: 50 }); const outside = lean > 0 ? 'R' : 'L', k = Math.min(1, Math.abs(lean) / 30);
      Object.assign(p['arm_' + outside], { elev: 58 + 12 * k, plane: 62 }); Object.assign(p['arm_' + (outside === 'L' ? 'R' : 'L')], { elev: 58 - 8 * k, plane: 84 });
      out.push(p); prev = p;
    }
    // the left turn: the right turn mirrored
    const mirror = p => { const q = JSON.parse(JSON.stringify(p));
      [q.arm_L, q.arm_R] = [q.arm_R, q.arm_L]; [q.leg_L, q.leg_R] = [q.leg_R, q.leg_L];
      q.spine.lat = -q.spine.lat; q.spine.twist = -q.spine.twist; q.neck.lat = -q.neck.lat; q.neck.yaw = -q.neck.yaw;
      q.root.rot = [q.root.rot[0], -q.root.rot[1], -q.root.rot[2]]; q.root.pos = [-q.root.pos[0], q.root.pos[1], q.root.pos[2]]; return q; };
    const all = out.concat(out.map(mirror)), r = { poses: all, turn: M.seconds || 1.2 };
    carveCache.set(sk, r); return r;
  }
  const carve = (u, sk) => {
    const C = fitCarve(sk); if (!C) return { pose: SKI };
    const n = C.poses.length, x = u * n, i = Math.floor(x) % n, t = x - Math.floor(x);
    const P = k => C.poses[(i + k + n) % n], t2 = t * t, t3 = t2 * t;
    return { pose: mix([P(-1), P(0), P(1), P(2)], [(-t + 2 * t2 - t3) / 2, (2 - 5 * t2 + 3 * t3) / 2, (t + 4 * t2 - 3 * t3) / 2, (-t2 + t3) / 2]) };
  };
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
  const sbJump = (u, sk) => { const t = u * 3.0; return { pose: sbOf(sk).jump(t), lift: flight(t, 0.8, 1.7, 0.8) }; };
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
  function sample(sk, clip, t) {
    const u = ((t / clip.dur) % 1 + 1) % 1, r = clip.at(u, sk);
    // on skis the boots hold the feet flat to the skis and the skis lie level: the whole body is pitched by what the pose leaves over
    const level = () => { for (let it = 0; it < 2; it++) { const c = contacts(sk, Human.Skeleton.pose(sk, r.pose));
      r.pose.root.rot[0] -= Math.atan2((c[0][1] - c[1][1] + c[3][1] - c[4][1]) / 2, Math.hypot(c[1][0] - c[0][0], c[1][2] - c[0][2])) / D; } };
    if (clip.gear === 'ski' && clip.name !== 'carve') level();
    if (clip.gear === 'ski') parallel(sk, r.pose);
    return ground(sk, r.pose, r.lift, clip.gear);
  }
  // two skis run side by side: same heading (+z), flat fore and aft, the same edge angle, the same height, half a stance each side of the middle.
  // Each leg's six joint angles are solved (damped least squares, inside the joint limits) to bring its ski there.
  function parallel(sk, pose) {
    const read = () => gear(sk, Human.Skeleton.pose(sk, pose), 'ski');
    const KS = ['flex', 'abd', 'rot', 'knee', 'ankle', 'inv'], R = Human.ROM.leg, cl = (k, v) => Math.max(R[k][0], Math.min(R[k][1], v));
    // the pelvis first turns to face between the two skis, so neither hip has to do it all
    const yaw = g => (Math.atan2(g[0].ax[0], g[0].ax[2]) + Math.atan2(g[1].ax[0], g[1].ax[2])) / 2 / D;
    for (let it = 0; it < 3; it++) { const m = yaw(read()); if (Math.abs(m) < 0.05) break;
      pose.root.rot[1] += 1; const d = yaw(read()) - m; pose.root.rot[1] -= 1; if (Math.abs(d) > 0.2) pose.root.rot[1] -= m / d; }
    const g0 = read(), mid = (g0[0].c[0] + g0[1].c[0]) / 2, half = Math.max(g0[0].c[0] - g0[1].c[0], 0.24) / 2, y = (g0[0].c[1] + g0[1].c[1]) / 2;
    const e = (Math.atan2(g0[0].n[0], g0[0].n[1]) + Math.atan2(g0[1].n[0], g0[1].n[1])) / 2, PW = 5;
    for (const [i, s] of [[0, 'L'], [1, 'R']]) { const L = pose['leg_' + s], tx = mid + (i ? -half : half), tz = g0[i].c[2];
      for (const k of KS) L[k] = cl(k, L[k]);
      const res = () => { const b = read()[i]; return [b.ax[0], b.ax[1], Math.atan2(b.n[0], b.n[1]) - e, (b.c[0] - tx) * PW, (b.c[1] - y) * PW, (b.c[2] - tz) * PW]; };
      for (let it = 0; it < 12; it++) { const f = res(); if (Math.hypot(...f) < 2e-3) break;
        const J = KS.map(k => { const h = L[k] + 1 > R[k][1] ? -1 : 1; L[k] += h; const d = res(); L[k] -= h; return d.map((v, j) => (v - f[j]) / h); });
        // (JtJ + lambda) d = -Jt f
        const A = KS.map((_, r) => KS.map((_, c) => J[r].reduce((a, v, j) => a + v * J[c][j], 0) + (r === c ? 2e-6 : 0))), g = KS.map((_, r) => -J[r].reduce((a, v, j) => a + v * f[j], 0));
        for (let c = 0; c < 6; c++) { let pv = c; for (let r = c + 1; r < 6; r++) if (Math.abs(A[r][c]) > Math.abs(A[pv][c])) pv = r; [A[c], A[pv]] = [A[pv], A[c]]; [g[c], g[pv]] = [g[pv], g[c]];
          for (let r = c + 1; r < 6; r++) { const m = A[r][c] / A[c][c]; for (let q = c; q < 6; q++) A[r][q] -= m * A[c][q]; g[r] -= m * g[c]; } }
        const d = new Array(6); for (let r = 5; r >= 0; r--) { let v = g[r]; for (let q = r + 1; q < 6; q++) v -= A[r][q] * d[q]; d[r] = v / A[r][r]; }
        KS.forEach((k, j) => { L[k] = cl(k, L[k] + Math.max(-12, Math.min(12, d[j]))); }); } }
  }
  for (const c of CLIPS) c.gear = c.group === 'ski' ? 'ski' : c.group === 'board' ? 'board' : null;
  Human.Motion = { CLIPS, sample, ground, contacts, gear, fitCarve, cyc, keys };
})();
