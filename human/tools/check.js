// the motion check-up: numbers for every clip, so a new clip is judged by measurement and not by looking at stills.
//   node human/build.js && node human/tools/check.js [ref] [clip,clip]      (ref = on the reference body's skeleton)
// Per clip, over one cycle at 240 steps:
//   rom      the worst joint angle the clip asks for beyond the joint limits (deg) - the pose is clamped, so the body does not do what was written
//   sink     how far the lowest foot or gear point goes under the floor while on the ground (cm)
//   slide    feet on the floor: how unevenly a planted foot moves (cm/s). In walk and run the floor is a treadmill, so a planted foot should move
//            back at one steady speed (spread around that speed is reported); in the other clips a planted foot should not move at all (typ = the median, p90 = nine steps in ten are below this)
//   balance  how far the centre of mass is outside the area of support, seen from above (cm), in frames on the ground. A carve leans on purpose:
//            there the sideways pull the lean needs is given (g) instead
//   speed    the fastest joint angle change (deg/s) and where; `seam` = the jump from the last step back to the first, as a multiple of a usual step
//   air      time off the ground (s), the height reached (m), and the height a body in free fall reaches in that time (g t^2 / 8)
const fs = require('fs'), path = require('path');
global.window = global; global.self = global;
eval(fs.readFileSync(path.join(__dirname, '..', 'dist', 'human.js'), 'utf8') + ';global.Human=Human');
const args = process.argv.slice(2), useRef = args.includes('ref'), only = (args.find(a => a !== 'ref') || '').split(',').filter(Boolean);
const sk = useRef ? Human.RefBody.build().sk : Human.Skeleton.build(Human.measure(Human.DEFAULTS)), M = Human.Motion, S = Human.Skeleton, I = sk.idx;
const J = (xf, n) => S.apply(xf, sk, I[n], sk.bones[I[n]].J), mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// centre of mass from Dempster's segment masses and centre positions
function com(xf) {
  const parts = [[0.497, mix(J(xf, 'pelvis'), J(xf, 'thorax_hi'), 0.45)], [0.081, mix(J(xf, 'neck_hi'), J(xf, 'head'), 1.6)]];
  for (const s of ['L', 'R']) parts.push([0.028, mix(J(xf, 'upperarm_' + s), J(xf, 'forearm_' + s), 0.436)], [0.016, mix(J(xf, 'forearm_' + s), J(xf, 'hand_' + s), 0.43)], [0.006, J(xf, 'hand_' + s)],
    [0.1, mix(J(xf, 'thigh_' + s), J(xf, 'shin_' + s), 0.433)], [0.0465, mix(J(xf, 'shin_' + s), J(xf, 'talus_' + s), 0.433)], [0.0145, mix(J(xf, 'talus_' + s), J(xf, 'midfoot_' + s), 0.5)]);
  const c = [0, 0, 0]; let m = 0; for (const [w, p] of parts) { m += w; for (let i = 0; i < 3; i++) c[i] += w * p[i]; } return c.map(v => v / m);
}
const flat = (o, pre, out) => { for (const k in o) { const v = o[k]; if (typeof v === 'number') out[pre + k] = v; else if (Array.isArray(v)) v.forEach((x, i) => out[pre + k + i] = x); else flat(v, pre + k + '.', out); } return out; };
const floor = Math.min(...M.contacts(sk, S.pose(sk, Human.restPose())).map(p => p[1])), N = 240, f1 = v => v.toFixed(1);
const gearPts = B => { const o = []; for (const b of B) for (const a of [-0.3, 0.3]) for (const w of [-0.5, 0.5]) o.push([0, 1, 2].map(i => b.c[i] + b.ax[i] * a * b.L + b.side[i] * w * b.W - b.n[i] * b.T / 2)); return o; };
const rows = [];
for (const clip of M.CLIPS) { if (only.length && !only.includes(clip.name)) continue;
  const dt = clip.dur / N, F = [];
  let rom = [0, ''];
  for (let k = 0; k < N; k++) { const t = k * dt, raw = clip.at(k / N, sk).pose; for (const [n, d] of S.pose(sk, raw).over) if (Math.abs(d) > rom[0]) rom = [Math.abs(d), n];
    const pose = M.sample(sk, clip, t), xf = S.pose(sk, pose), c = M.contacts(sk, xf), g = clip.gear ? gearPts(M.gear(sk, xf, clip.gear)) : null;
    F.push({ pose: flat(pose, '', {}), c, low: Math.min(...(g || c).map(p => p[1])) - floor, sup: (g || c), com: com(xf) }); }
  const r = { clip: clip.name, zh: clip.zh, rom: rom[0] > 0.05 ? f1(rom[0]) + ' ' + rom[1] : '0' };
  r.sink = f1(Math.max(0, -Math.min(...F.map(f => f.low))) * 100);
  // planted feet (no gear): the lower of heel and ball within 1.2 cm of the floor in both this step and the next
  if (!clip.gear) { const gait0 = clip.name === 'walk' || clip.name === 'run', low = (k, o, j) => F[k].c[o + j][1] - floor < 0.012 && F[(k + 1) % N].c[o + j][1] - floor < 0.012, vel = (k, o, j) => [(F[(k + 1) % N].c[o + j][0] - F[k].c[o + j][0]) / dt, (F[(k + 1) % N].c[o + j][2] - F[k].c[o + j][2]) / dt];
    // the floor's speed from heel and ball; a toe that only skims the floor while the foot swings forward is not a planted foot
    let belt = 0, nb = 0; if (gait0) for (let k = 0; k < N; k++) for (const o of [0, 3]) for (const j of [0, 1]) if (low(k, o, j)) { belt -= vel(k, o, j)[1]; nb++; } belt /= Math.max(1, nb);
    const v = []; for (let k = 0; k < N; k++) for (const o of [0, 3]) for (const j of [0, 1, 2]) if (low(k, o, j)) { const w = vel(k, o, j); if (!gait0 || w[1] < -0.4 * belt) v.push(w); }
    if (v.length) { const gait = clip.name === 'walk' || clip.name === 'run', mz = gait ? v.reduce((a, x) => a + x[1], 0) / v.length : 0;
      const dev = v.map(x => Math.hypot(x[0], x[1] - mz) * 100).sort((a, b) => a - b);
      r.slide = (gait ? 'belt ' + (-mz).toFixed(2) + ' m/s, ' : '') + 'typ ' + f1(dev[dev.length >> 1]) + ' p90 ' + f1(dev[Math.floor(dev.length * 0.9)]); } else r.slide = '-'; }
  else r.slide = 'gear';
  // balance: distance of the centre of mass outside the bounding box of the points on the floor
  { let worst = 0, lean = 0; for (const f of F) { const s = f.sup.filter(p => p[1] - floor < 0.03); if (!s.length) continue;
      const bx = [Math.min(...s.map(p => p[0])), Math.max(...s.map(p => p[0]))], bz = [Math.min(...s.map(p => p[2])), Math.max(...s.map(p => p[2]))];
      const dx = Math.max(bx[0] - f.com[0], 0, f.com[0] - bx[1]), dz = Math.max(bz[0] - f.com[2], 0, f.com[2] - bz[1]); worst = Math.max(worst, Math.hypot(dx, dz));
      lean = Math.max(lean, Math.hypot(f.com[0] - (bx[0] + bx[1]) / 2, clip.gear === 'board' ? f.com[2] - (bz[0] + bz[1]) / 2 : 0) / Math.max(0.2, f.com[1] - floor)); }
    r.balance = f1(worst * 100) + (clip.name === 'carve' || clip.name === 'sbturn' ? ' (lean needs ' + lean.toFixed(2) + ' g)' : ''); }
  // joint speed and the loop seam
  { const keys = Object.keys(F[0].pose).filter(k => !k.startsWith('root.pos')); let top = [0, ''], steps = [], seam = 0;
    for (let k = 0; k < N; k++) { let m = 0; for (const n of keys) { const d = Math.abs(F[(k + 1) % N].pose[n] - F[k].pose[n]); if (d > m) m = d; if (d / dt > top[0]) top = [d / dt, n]; } steps.push(m); if (k === N - 1) seam = m; }
    const med = steps.slice().sort((a, b) => a - b)[N >> 1]; r.speed = top[0].toFixed(0) + ' ' + top[1]; r.seam = med > 1e-6 ? f1(seam / med) : '1.0'; }
  { const up = F.filter(f => f.low > 0.02), T = up.length * dt, h = Math.max(...F.map(f => f.low)); r.air = up.length ? T.toFixed(2) + ' s, ' + h.toFixed(2) + ' m (free fall ' + (9.81 * T * T / 8).toFixed(2) + ')' : '-'; }
  rows.push(r);
}
console.log('skeleton:', useRef ? 'reference body' : 'computed body');
console.table(rows);
if (args.includes('json')) fs.writeFileSync('check.json', JSON.stringify(rows, null, 1));
