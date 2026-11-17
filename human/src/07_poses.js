// ---------------------------------------------------------------- Human: the stress poses (the joints where bodies usually break)
// Each pose is a few anatomical numbers on top of the rest pose; the skeleton spreads them over the bones (spine shares, scapular rhythm, twist
// bones) and clamps them to the joint ranges. Human.ground puts the lowest foot back on the floor.
(() => {
  const P = (name, zh, f) => { const p = Human.restPose(); f(p); return { name, zh, pose: p }; };
  const arms = (p, o) => { Object.assign(p.arm_L, o); Object.assign(p.arm_R, o); };
  const legs = (p, o) => { Object.assign(p.leg_L, o); Object.assign(p.leg_R, o); };
  Human.bindPose = () => { const p = Human.restPose(); arms(p, { elev: 45, plane: 15, elbow: 10 }); return p; };
  Human.POSES = [
    P('apose', 'A 字站姿（绑定姿势）', p => arms(p, { elev: 45, plane: 15, elbow: 10 })),
    P('relaxed', '自然站立', p => { arms(p, { elev: 8, plane: 20, elbow: 12, pron: 10 }); p.spine.flex = 3; }),
    P('tpose', 'T 字', p => arms(p, { elev: 90, plane: 0 })),
    P('overhead', '双臂举过头', p => { arms(p, { elev: 168, plane: 35, axial: -25, elbow: 8 }); p.spine.flex = -8; }),
    P('squat', '深蹲', p => { p.root.rot = [32, 0, 0]; legs(p, { flex: 127, abd: 14, rot: -12, knee: 120, ankle: -25 }); p.spine.flex = 24; p.neck.flex = -25; arms(p, { elev: 85, plane: 90, elbow: 15 }); }),
    P('lunge', '弓步', p => { Object.assign(p.leg_L, { flex: 88, knee: 92, ankle: -12 }); Object.assign(p.leg_R, { flex: -16, knee: 85, ankle: 30, toe: 55 }); p.root.rot = [6, 0, 0];
      arms(p, { elev: 20, plane: 60, elbow: 70 }); }),
    P('twist', '扭转 45°', p => { p.spine.twist = 45; p.neck.yaw = 25; Object.assign(p.arm_L, { elev: 70, plane: -20, elbow: 40 }); Object.assign(p.arm_R, { elev: 75, plane: 110, elbow: 30 }); }),
    P('bend', '体前屈', p => { p.root.rot = [72, 0, 0]; legs(p, { flex: 72, knee: 4, ankle: 4 }); p.spine.flex = 38; p.neck.flex = -10; arms(p, { elev: 95, plane: 90, elbow: 5, pron: 20 }); }),   // (the pelvis tips forward over straight legs)
    P('carve', '滑雪刻滑（倾斜 50°）', p => { p.root.rot = [12, 0, -42]; Object.assign(p.leg_L, { flex: 70, abd: -6, knee: 78, ankle: -20, inv: 8 }); Object.assign(p.leg_R, { flex: 50, abd: 8, knee: 52, ankle: -20, inv: -6 });
      p.spine = { flex: 22, lat: -20, twist: -12 }; p.neck = { flex: -20, lat: 18, yaw: 10 }; arms(p, { elev: 40, plane: 75, elbow: 65, grip: 1, thumb: 0.7 }); Object.assign(p.arm_L, { elev: 30 }); }),
    P('tuck', '团身（速降）', p => { p.root.rot = [40, 0, 0]; legs(p, { flex: 112, knee: 97, ankle: -25 }); p.spine.flex = 26; p.neck.flex = -45; arms(p, { elev: 70, plane: 88, elbow: 115, grip: 1, thumb: 0.8 }); }),
    P('reach', '交叉抱臂 / 背手', p => { Object.assign(p.arm_L, { elev: 95, plane: 128, elbow: 25 }); Object.assign(p.arm_R, { elev: 35, plane: -40, axial: 60, elbow: 95, pron: 40 }); p.spine.twist = 10; }),
  ];
  // the pose's root shifted so that the lowest ankle stays on the floor where it stood (feet keep their heights)
  Human.ground = (sk, pose) => {
    const xf0 = Human.Skeleton.pose(sk, Human.restPose()), xf = Human.Skeleton.pose(sk, pose), I = sk.idx;
    const feet = ['talus_L', 'talus_R'].map(n => [xf.P[I[n]], xf0.P[I[n]]]);
    const lo = feet[0][0][1] < feet[1][0][1] ? feet[0] : feet[1];
    const p = JSON.parse(JSON.stringify(pose));
    p.root.pos = [p.root.pos[0], p.root.pos[1] + lo[1][1] - lo[0][1], p.root.pos[2] + (feet[0][1][2] + feet[1][1][2] - feet[0][0][2] - feet[1][0][2]) / 2];
    return p;
  };
})();
