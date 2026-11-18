// 动作分析器：读 record.js 的输出，算三类指标。
//   A 流畅度：每根骨头方向 / 每个关节角里“人做不出来的快变化”（10 Hz 以上的部分），超过阈值记一次“突变”；并标出突变发生时游戏在做什么。
//   B 真实度：按转弯周期归一后，膝、髋、躯干等角度和真实滑雪数据的目标范围对比。
//   C 穿模：胶囊体之间的最小间距（杖和腿、手和身体、两膝、两板、板和雪面）。
//   node tools/motion/analyze.js [录制目录=tools/motion/out/cand] [--json 输出.json] [--csv 目录]
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), dir = args[0] && !args[0].startsWith('--') ? args[0] : path.join(__dirname, 'out', 'cand');
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null, csvDir = args.includes('--csv') ? args[args.indexOf('--csv') + 1] : null;
const FS = 60, D2R = Math.PI / 180, R2D = 180 / Math.PI;
// ---- 阈值（依据见 README.md）
const FC = 10;            // Hz：人主动动作的频率上限取 10 Hz（步态里 99% 以上的功率在第 7 次谐波以下，约 6–7 Hz，Winter；用真人动捕（CMU）定过标：同一把尺每分钟 8 次左右，见 README.md）
const THR_DEG = 1.5;      // 度：10 Hz 以上的残差超过这个值记一次“突变”
const THR_MM = 6;         // 毫米：手、头、髋的位置同理
const GAP = 0.15;         // 秒：相隔不到这么久的算同一次

const v = {
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len: a => Math.hypot(a[0], a[1], a[2]), norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
};
const ang = (a, b) => Math.acos(Math.max(-1, Math.min(1, v.dot(v.norm(a), v.norm(b))))) * R2D;
// 零相位低通（二阶 Butterworth 正反各滤一遍 = 四阶，不引入延迟）
function lowpass(x, fc = FC, fs = FS) {
  const n = x.length; if (n < 8) return x.slice();
  const w = Math.tan(Math.PI * fc / fs), k = Math.SQRT2 * w, d = 1 + k + w * w, b0 = w * w / d, b1 = 2 * b0, b2 = b0, a1 = 2 * (w * w - 1) / d, a2 = (1 - k + w * w) / d;
  const run = s => { const y = new Array(n); let x1 = s[0], x2 = s[0], y1 = s[0], y2 = s[0]; for (let i = 0; i < n; i++) { const yi = b0 * s[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = s[i]; y2 = y1; y1 = yi; y[i] = yi; } return y; };
  return run(run(x).reverse()).reverse();
}
const pct = (a, p) => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const rms = a => Math.sqrt(a.reduce((s, x) => s + x * x, 0) / Math.max(1, a.length));
const unwrap = a => { const o = a.slice(); for (let i = 1; i < o.length; i++) { let d = o[i] - o[i - 1]; while (d > 180) { o[i] -= 360; d -= 360; } while (d < -180) { o[i] += 360; d += 360; } } return o; };

function load(f) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8')), n = d.t.length, ji = {}, pi = {}, si = {};
  d.JK.forEach((k, i) => ji[k] = i); d.PK.forEach((k, i) => pi[k] = i); d.SK.forEach((k, i) => si[k] = i);
  d.j = (k, i) => d.J[i][ji[k]]; d.p = (k, i) => d.P[i][pi[k]]; d.s = (k, i) => d.S[i][si[k]]; d.n = n;
  return d;
}

// ---- 每帧的量：标量角（度）、方向向量、位置（米）
function series(d) {
  const n = d.n, S = { deg: {}, dir: {}, pos: {} }, mk = () => new Array(n);
  const degK = ['kneeL', 'kneeR', 'hipFlexL', 'hipFlexR', 'elbowL', 'elbowR', 'shoulderL', 'shoulderR', 'trunkPitch', 'trunkRoll', 'pelvisYaw', 'chestYaw', 'twist', 'headYaw', 'headPitch', 'edgeL', 'edgeR', 'ankleL', 'ankleR'];
  for (const k of degK) S.deg[k] = mk();
  const dirK = ['thighL', 'thighR', 'shinL', 'shinR', 'trunk', 'chest', 'head', 'uarmL', 'uarmR', 'farmL', 'farmR', 'poleL', 'poleR', 'skiL', 'skiR', 'rootFwd', 'rootNrm'];
  for (const k of dirK) S.dir[k] = mk();
  const posK = ['p_pelvis', 'p_head', 'p_gripL', 'p_gripR', 'p_kneeL', 'p_kneeR'];
  for (const k of posK) S.pos[k] = mk();
  for (let i = 0; i < n; i++) {
    const J = k => d.j(k, i), B = d.bas[i], pbX = B[0], pbY = B[1], t2X = B[3], t2Y = B[4], hbX = B[5], hbY = B[6], hbZ = B[7], fLX = B[8], fLZ = B[9], fRX = B[10], fRZ = B[11];
    for (const sd of ['L', 'R']) {
      const hip = J('hip' + sd), kn = J('knee' + sd), an = J('ankle' + sd), sh = J('sh' + sd), el = J('elbow' + sd), wr = J('wrist' + sd), fX = sd === 'L' ? fLX : fRX, fZ = sd === 'L' ? fLZ : fRZ;
      S.deg['knee' + sd][i] = ang(v.sub(kn, hip), v.sub(an, kn));
      S.deg['hipFlex' + sd][i] = ang(v.sub(J('chest'), J('pelvis')), v.sub(hip, kn));
      S.deg['elbow' + sd][i] = ang(v.sub(el, sh), v.sub(wr, el));
      S.deg['shoulder' + sd][i] = ang(v.sub(el, sh), v.mul(t2Y, -1));
      S.deg['edge' + sd][i] = Math.atan2(fX[1], Math.hypot(fX[0], fX[2])) * R2D * -1;
      // 踝：小腿相对雪板法线的前倾（靴子里的角度）
      { const shn = v.norm(v.sub(kn, an)), fY = v.cross(fZ, fX); S.deg['ankle' + sd][i] = Math.atan2(-v.dot(shn, fZ), v.dot(shn, fY)) * R2D; }
      S.dir['thigh' + sd][i] = v.norm(v.sub(kn, hip)); S.dir['shin' + sd][i] = v.norm(v.sub(an, kn));
      S.dir['uarm' + sd][i] = v.norm(v.sub(el, sh)); S.dir['farm' + sd][i] = v.norm(v.sub(wr, el));
      S.dir['pole' + sd][i] = v.norm(J('poleD' + sd)); S.dir['ski' + sd][i] = v.mul(fZ, -1);
      S.pos['p_grip' + sd][i] = J('grip' + sd); S.pos['p_knee' + sd][i] = kn;
    }
    const tr = v.sub(J('neck'), J('pelvis'));
    S.deg.trunkPitch[i] = Math.atan2(-tr[2], tr[1]) * R2D; S.deg.trunkRoll[i] = Math.atan2(tr[0], tr[1]) * R2D;
    S.deg.pelvisYaw[i] = Math.atan2(pbX[2], pbX[0]) * R2D; S.deg.chestYaw[i] = Math.atan2(t2X[2], t2X[0]) * R2D; S.deg.twist[i] = S.deg.chestYaw[i] - S.deg.pelvisYaw[i];
    S.deg.headYaw[i] = Math.atan2(hbX[2], hbX[0]) * R2D; S.deg.headPitch[i] = Math.asin(Math.max(-1, Math.min(1, -hbZ[1]))) * R2D;
    S.dir.trunk[i] = v.norm(tr); S.dir.chest[i] = t2X; S.dir.head[i] = v.mul(hbZ, -1);
    S.dir.rootFwd[i] = d.root[i][1]; S.dir.rootNrm[i] = d.root[i][2];
    S.pos.p_pelvis[i] = J('pelvis'); S.pos.p_head[i] = J('head');
  }
  for (const k of ['pelvisYaw', 'chestYaw', 'headYaw', 'twist']) S.deg[k] = unwrap(S.deg[k]);
  return S;
}

// ---- 这一帧游戏在做什么（给突变归因用）
function context(d) {
  const n = d.n, marks = [];       // [帧, 标签]
  const add = (i, tag) => marks.push([i, tag]);
  for (const e of d.ev) { const i = Math.round(e[0] * FS); add(i, { land: '落地', takeoff: '离地', pole: '撑杖入雪', crash: '撞树/石', brush: '擦树', rustle: '擦树', trick: '空中动作开始', push: '出发', near: null }[e[1]] || null); }
  for (let i = 1; i < n; i++) {
    const f0 = d.flag[i - 1], f1 = d.flag[i];
    if ((f0 ^ f1) & 4 || (f0 ^ f1) & 8) add(i, (f1 & 12) > (f0 & 12) ? '点杖钉住' : '点杖松开');
    const l0 = d.p('lean', i - 1), l1 = d.p('lean', i); if (l0 * l1 < 0 && (f1 & 2)) add(i, '换刃');
    const dp0 = d.p('dp', i - 1), dp1 = d.p('dp', i); if ((dp0 < 0.22) !== (dp1 < 0.22) || (dp0 < 0.62) !== (dp1 < 0.62) || (dp0 > 0) !== (dp1 > 0)) add(i, '撑杖节拍');
    const t0 = d.p('tuck', i - 1), t1 = d.p('tuck', i); if ((t0 > 0.3) !== (t1 > 0.3)) add(i, '团身进出');
    const o0 = d.fl[i - 1][11], o1 = d.fl[i][11]; if ((o0 > 0.05) !== (o1 > 0.05)) add(i, o1 > o0 ? '空中动作开始' : '空中动作收');
    const g0 = d.p('grabL', i - 1) + d.p('grabR', i - 1), g1 = d.p('grabL', i) + d.p('grabR', i); if ((g0 > 0.05) !== (g1 > 0.05)) add(i, '抓板');
  }
  const state = i => { const f = d.flag[i]; if (d.s('crash', i) > 0.02) return '撞后'; if (f & 1) return d.fl[i][11] > 0.05 ? '空中做动作' : '腾空'; if (d.p('dp', i) > 0) return '撑杖中'; if (d.p('tuck', i) > 0.5) return '团身'; if (d.s('speed', i) < 4) return '低速'; if (Math.abs(d.p('lean', i)) > 0.12) return '弯中'; return '直滑'; };
  const near = (i, win = Math.round(0.12 * FS)) => { let best = null, bd = 1e9; for (const m of marks) { if (!m[1]) continue; const dd = Math.abs(m[0] - i); if (dd <= win && dd < bd) { bd = dd; best = m[1]; } } return best; };
  return { marks, state, near };
}

// ---- A 流畅度
const SNOW_PAD = 4, SNOW_END = 15, LEG_DOF = /^(p_)?(knee|ankle|ski|shin|thigh|hipFlex|foot)[LR]$/;
function smooth(d, S) {
  const n = d.n, ctx = context(d), res = { dofs: {}, jolts: [] }, php = params(d);
  const events = (hp, thr) => { const ev = []; let last = -1e9; for (let i = 2; i < n - 2; i++) if (hp[i] > thr) { if (i - last > GAP * FS) ev.push({ i, m: hp[i] }); else if (hp[i] > ev[ev.length - 1].m) { ev[ev.length - 1].m = hp[i]; ev[ev.length - 1].i = i; } last = i; } return ev; };
  // 雪面自己在动的帧（2026-11-18，用户定“只算无故的抖”）：录制里有每块板下真实雪面相对人物板面的高度（d.snw：板头、脚下、板尾）。
  // 用量关节的同一把尺量它：雪面的俯仰过 10 Hz 高通后超过 1.5°，或脚下雪面高度超过 6 mm，就是雪面自己折弯了（跳台入口、蘑菇、台沿）。
  // 这些帧前后 SNOW_PAD 帧里、人在雪上时，腿和板的突变记到 res.snow（跟着雪面动），不记到 res.jolts。上半身照旧。没有 d.snw 的旧录制不受影响。
  const snowAt = new Uint8Array(n); res.snow = [];
  if (d.snw && d.snw.length === n) for (const k of [0, 1]) {
    const pt = d.snw.map(r => Math.atan2(r[k][2] - r[k][0], 1.5) * R2D), hm = d.snw.map(r => r[k][1] * 1000), lp = lowpass(pt), lh = lowpass(hm);
    // （板头、板尾下的雪面各自也看：雪面在板头下一帧抬 4 厘米（27 m/s 过一道坎）时整块板的俯仰只变 1.5° 上下，刚好量不出。两端用 15 mm：
    // 人物自己的板面晃 0.5° 在板端就是 6.5 mm，不能算成雪面在动）
    const ef = d.snw.map(r => r[k][0] * 1000), er = d.snw.map(r => r[k][2] * 1000), lf = lowpass(ef), lr = lowpass(er);
    for (let i = 0; i < n; i++) if (!(d.flag[i] & 1) && (Math.abs(pt[i] - lp[i]) > THR_DEG || Math.abs(hm[i] - lh[i]) > THR_MM || Math.abs(ef[i] - lf[i]) > SNOW_END || Math.abs(er[i] - lr[i]) > SNOW_END)) for (let q = Math.max(0, i - SNOW_PAD); q <= Math.min(n - 1, i + SNOW_PAD); q++) snowAt[q] = 1; }
  const put = (name, kind, hp, raw, thr, unit) => {
    const ev0 = events(hp, thr), leg = LEG_DOF.test(name), ev = leg ? ev0.filter(e => !snowAt[e.i]) : ev0;
    if (leg) for (const e of ev0) if (snowAt[e.i]) res.snow.push({ dof: name, kind, i: e.i, t: e.i / FS, m: e.m });
    for (const e of ev) res.jolts.push({ dof: name, kind, i: e.i, t: e.i / FS, m: e.m, what: ctx.near(e.i) || ctx.state(e.i), st: ctx.state(e.i), pin: (d.flag[e.i] & 12) || (d.flag[Math.max(0, e.i - 2)] & 12) || (d.flag[Math.min(n - 1, e.i + 2)] & 12) ? 1 : 0, by: blame(php, e.i, n) });
    res.dofs[name] = { kind, unit, perMin: ev.length / (n / FS / 60), rmsHF: rms(hp), p99: pct(hp, 0.99), max: Math.max(...hp), ...raw };
  };
  for (const k in S.deg) {
    const x = S.deg[k], lp = lowpass(x), hp = x.map((q, i) => Math.abs(q - lp[i]));
    const w = x.map((q, i) => i ? (q - x[i - 1]) * FS : 0), a = w.map((q, i) => i > 1 ? Math.abs(q - w[i - 1]) * FS : 0);
    put(k, 'deg', hp, { wP99: pct(w.map(Math.abs), 0.99), wMax: Math.max(...w.map(Math.abs)), aP99: pct(a, 0.99), aMax: Math.max(...a), over5k: a.filter(q => q > 5000).length / (n / FS / 60) }, THR_DEG, '°');
  }
  for (const k in S.dir) {
    const x = S.dir[k], c = [0, 1, 2].map(j => lowpass(x.map(q => q[j]))), hp = x.map((q, i) => Math.hypot(q[0] - c[0][i], q[1] - c[1][i], q[2] - c[2][i]) * R2D);
    const w = x.map((q, i) => i ? v.mul(v.cross(x[i - 1], q), FS * R2D) : [0, 0, 0]), wm = w.map(v.len), a = w.map((q, i) => i > 1 ? v.len(v.sub(q, w[i - 1])) * FS : 0);
    put(k, 'dir', hp, { wP99: pct(wm, 0.99), wMax: Math.max(...wm), aP99: pct(a, 0.99), aMax: Math.max(...a), over5k: a.filter(q => q > 5000).length / (n / FS / 60) }, THR_DEG, '°');
  }
  for (const k in S.pos) {
    const x = S.pos[k], c = [0, 1, 2].map(j => lowpass(x.map(q => q[j]))), hp = x.map((q, i) => Math.hypot(q[0] - c[0][i], q[1] - c[1][i], q[2] - c[2][i]) * 1000);
    const a = x.map((q, i) => i > 1 ? v.len(v.add(v.sub(q, v.mul(x[i - 1], 2)), x[i - 2])) * 1000 : 0);      // 位置二阶差分，毫米/帧²
    put(k, 'pos', hp, { d2P99: pct(a, 0.99), d2Max: Math.max(...a) }, THR_MM, 'mm');
  }
  return res;
}

// ---- 姿态参数自己的快变化：哪个参数在那一刻跳了（把突变追到 updatePose 里的具体量）
const PTHR = { lean: 0.012, edge: 0.012, sep: 0.012, headYaw: 0.012, tilt: 0.012, swing: 0.02, pitchL: 0.012, pitchR: 0.012, tipL: 0.012, tipR: 0.012, crouch: 0.012, tuck: 0.03, air: 0.03, plantL: 0.04, plantR: 0.04, grabL: 0.04, grabR: 0.04, fore: 0.03, fa: 0.03, lead: 0.006, stance: 0.006, liftL: 0.006, liftR: 0.006, quiet: 0.03 };
function params(d) {
  const n = d.n, hp = {}, ev = {};
  for (const k of d.PK) { if (!(k in PTHR)) continue; const x = d.P.map(r => r[d.PK.indexOf(k)]), lp = lowpass(x); hp[k] = x.map((q, i) => Math.abs(q - lp[i]) / PTHR[k]); }
  for (const sd of [0, 1]) for (const ax of [0, 1, 2]) { const k = 'arm' + 'LR'[sd] + '.' + 'xyz'[ax], x = d.arm.map(r => r[sd][ax]), lp = lowpass(x); hp[k] = x.map((q, i) => Math.abs(q - lp[i]) / 0.006); }
  { const x = d.fl.map(r => r[9]), lp = lowpass(x); hp['q.yaw'] = x.map((q, i) => Math.abs(q - lp[i]) / 0.012); }
  return hp;
}
// 突变那一刻（前后 2 帧）哪些参数超了自己的阈值，取最严重的两个
function blame(hp, i, n) { const r = []; for (const k in hp) { let m = 0; for (let j = Math.max(0, i - 2); j <= Math.min(n - 1, i + 2); j++) m = Math.max(m, hp[k][j]); if (m > 1) r.push([k, m]); } r.sort((a, b) => b[1] - a[1]); return r.slice(0, 2).map(x => x[0]); }

// ---- B 转弯周期：把每个弯按时间归一成 33 个点
function turns(d, S) {
  const n = d.n, out = [], lean = i => d.p('lean', i);
  let i0 = -1;
  for (let i = 1; i < n; i++) {
    if (lean(i - 1) * lean(i) < 0 || lean(i - 1) === 0) {
      if (i0 >= 0) {
        let ok = true, pk = 0, sp = 0; for (let j = i0; j < i; j++) { if (!(d.flag[j] & 2) || d.s('crash', j) > 0 || d.p('dp', j) > 0 || d.p('tuck', j) > 0.4) ok = false; pk = Math.max(pk, Math.abs(lean(j))); sp += d.s('speed', j); }
        const T = (i - i0) / FS; if (ok && pk > 0.15 && T > 0.35 && T < 5) out.push({ i0, i1: i, T, side: Math.sign(lean(Math.floor((i0 + i) / 2))), pk, speed: sp / (i - i0) });
      }
      i0 = i;
    }
  }
  const L = d.LEN, leg = L.thigh + L.shin, N = 33, Q = ['kneeO', 'kneeI', 'hipO', 'hipI', 'incl', 'hipH', 'hipLat', 'hipFore', 'trunkRoll', 'trunkPitch', 'twist', 'pelvisYaw', 'chestYaw', 'headYaw', 'edge', 'lead', 'stance', 'kneeGap', 'handO_y', 'handI_y', 'angul'];
  for (const t of out) {
    t.c = {}; for (const q of Q) t.c[q] = new Array(N);
    for (let k = 0; k < N; k++) {
      const f = t.i0 + (t.i1 - t.i0) * k / (N - 1), a = Math.min(Math.floor(f), n - 2), u = f - a, s = t.side, O = s > 0 ? 'L' : 'R', I = s > 0 ? 'R' : 'L';
      const lerp = (x, y) => x + (y - x) * u, dg = key => lerp(S.deg[key][a], S.deg[key][a + 1]), J = key => { const p = d.j(key, a), q = d.j(key, a + 1); return [lerp(p[0], q[0]), lerp(p[1], q[1]), lerp(p[2], q[2])]; };
      const mh = v.mul(v.add(J('hipL'), J('hipR')), 0.5), ma = v.mul(v.add(J('ankleL'), J('ankleR')), 0.5), hv = v.sub(mh, ma);
      t.c.kneeO[k] = dg('knee' + O); t.c.kneeI[k] = dg('knee' + I); t.c.hipO[k] = dg('hipFlex' + O); t.c.hipI[k] = dg('hipFlex' + I);
      t.c.incl[k] = s * Math.atan2(hv[0], hv[1]) * R2D; t.c.hipH[k] = hv[1] / leg; t.c.hipLat[k] = s * hv[0] / leg; t.c.hipFore[k] = -hv[2] / leg;
      t.c.trunkRoll[k] = s * dg('trunkRoll'); t.c.trunkPitch[k] = dg('trunkPitch'); t.c.twist[k] = s * dg('twist'); t.c.pelvisYaw[k] = s * dg('pelvisYaw'); t.c.chestYaw[k] = s * dg('chestYaw'); t.c.headYaw[k] = s * dg('headYaw');
      t.c.edge[k] = s * 0.5 * (dg('edgeL') + dg('edgeR')); t.c.lead[k] = (J('ankle' + I)[2] - J('ankle' + O)[2]) * -1; t.c.stance[k] = Math.abs(J('ankleR')[0] - J('ankleL')[0]);
      t.c.kneeGap[k] = v.len(v.sub(J('kneeL'), J('kneeR'))) / Math.max(0.01, v.len(v.sub(J('ankleL'), J('ankleR'))));
      t.c.handO_y[k] = J('grip' + O)[1]; t.c.handI_y[k] = J('grip' + I)[1];
      t.c.angul[k] = t.c.incl[k] - t.c.trunkRoll[k];       // 髋-踝线的内倾 减 躯干的内倾 = 反弓（angulation）
    }
  }
  const mean = {}, sd = {};
  if (out.length) for (const q of Q) { mean[q] = new Array(N).fill(0); sd[q] = new Array(N).fill(0); for (let k = 0; k < N; k++) { const xs = out.map(t => t.c[q][k]), m = xs.reduce((s, x) => s + x, 0) / xs.length; mean[q][k] = m; sd[q][k] = Math.sqrt(xs.reduce((s, x) => s + (x - m) * (x - m), 0) / xs.length); } }
  return { list: out, mean, sd, Q, N };
}

// ---- C 穿模：线段-线段最近距离
function segSeg(p0, p1, q0, q1) {
  const u = v.sub(p1, p0), w0 = v.sub(q1, q0), w = v.sub(p0, q0), a = v.dot(u, u), b = v.dot(u, w0), c = v.dot(w0, w0), dd = v.dot(u, w), e = v.dot(w0, w), D = a * c - b * b;
  let s = D > 1e-9 ? Math.max(0, Math.min(1, (b * e - c * dd) / D)) : 0, t = c > 1e-9 ? Math.max(0, Math.min(1, (b * s + e) / c)) : 0; s = a > 1e-9 ? Math.max(0, Math.min(1, (b * t - dd) / a)) : 0;
  return v.len(v.sub(v.add(p0, v.mul(u, s)), v.add(q0, v.mul(w0, t))));
}
function clip(d) {
  const n = d.n, L = d.LEN, pairs = {}, hit = (k, depth, i) => { const p = pairs[k] = pairs[k] || { frames: 0, worst: 0, at: 0 }; if (depth > 0.005) { p.frames++; if (depth > p.worst) { p.worst = depth; p.at = i / FS; } } };
  for (let i = 0; i < n; i++) {
    const J = k => d.j(k, i), B = d.bas[i], air = d.flag[i] & 1;
    const body = { 大腿L: [J('hipL'), J('kneeL'), 0.085], 大腿R: [J('hipR'), J('kneeR'), 0.085], 小腿L: [J('kneeL'), J('ankleL'), 0.07], 小腿R: [J('kneeR'), J('ankleR'), 0.07], 躯干: [J('pelvis'), J('chest'), 0.14], 胸: [J('chest'), J('neck'), 0.14], 头: [J('head'), J('head'), 0.12] };
    for (const sd of ['L', 'R']) {
      const g = J('grip' + sd), tip = J('tip' + sd), p0 = v.add(g, v.mul(v.sub(tip, g), 0.15 / L.pole));
      for (const k in body) { const c = body[k]; hit('雪杖' + sd + '×' + k, c[2] + 0.012 - segSeg(p0, tip, c[0], c[1]), i); }
      for (const k of ['大腿L', '大腿R', '躯干', '胸', '头']) { const c = body[k]; hit('手' + sd + '×' + k, c[2] + 0.05 - segSeg(g, g, c[0], c[1]), i); }
      for (const k of ['躯干', '胸', '大腿L', '大腿R']) { const c = body[k]; hit('前臂' + sd + '×' + k, c[2] + 0.04 - segSeg(J('elbow' + sd), J('wrist' + sd), c[0], c[1]), i); }
      // 杖尖在雪面以下（没在点杖时）
      if (!(d.flag[i] & (sd === 'L' ? 4 : 8)) && !air && d.p('dp', i) <= 0 && d.p('plant' + sd, i) < 0.3) hit('杖尖' + sd + '入雪', -tip[1] - 0.05, i);
    }
    hit('两膝', 0.16 - v.len(v.sub(J('kneeL'), J('kneeR'))), i);
    hit('大腿L×大腿R', 0.17 - segSeg(J('hipL'), J('kneeL'), J('hipR'), J('kneeR')), i);
    hit('小腿L×小腿R', 0.14 - segSeg(J('kneeL'), J('ankleL'), J('kneeR'), J('ankleR')), i);
    // 两块雪板：尾 0.78 m、尖 0.94 m，半宽约 5 cm
    { const fL = J('footL'), fR = J('footR'), zL = B[9], zR = B[11], a0 = v.add(fL, v.mul(zL, 0.78)), a1 = v.add(fL, v.mul(zL, -0.94)), b0 = v.add(fR, v.mul(zR, 0.78)), b1 = v.add(fR, v.mul(zR, -0.94)); hit('两板交叠', 0.10 - segSeg(a0, a1, b0, b1), i); }
    // 雪板端点低于画出来的雪面（腾空时不算）
    if (!air) { const h = d.skis[i]; hit('板尖入雪', -Math.min(h[1], h[3]) - 0.03, i); hit('板尾入雪', -Math.min(h[0], h[2]) - 0.06, i); }
    // 腿伸到头（IK 到极限，膝会“啪”地锁直）
    for (const sd of ['L', 'R']) hit('腿伸直到极限' + sd, v.len(v.sub(J('hip' + sd), J('ankle' + sd))) - (L.thigh + L.shin) * 0.972, i);
  }
  for (const k in pairs) pairs[k].pct = 100 * pairs[k].frames / n;
  return pairs;
}

// ---- D 协调：换刃有多快、身体各部分比“身体倾角”早还是晚、小腿在靴子里歪没歪（八字腿的自动检查）
function xlag(a, b, maxLag = 30) {      // b 比 a 晚多少帧（正 = 晚）；归一化互相关取最大，再用抛物线插到小数帧
  const n = a.length, ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n; let best = -2, bl = 0; const c = {};
  for (let L = -maxLag; L <= maxLag; L++) { let sab = 0, saa = 0, sbb = 0; for (let i = Math.max(0, -L); i < Math.min(n, n - L); i++) { const x = a[i] - ma, y = b[i + L] - mb; sab += x * y; saa += x * x; sbb += y * y; } c[L] = sab / Math.sqrt(saa * sbb || 1); if (c[L] > best) { best = c[L]; bl = L; } }
  let fr = 0; if (bl > -maxLag && bl < maxLag) { const y0 = c[bl - 1], y1 = c[bl], y2 = c[bl + 1], den = y0 - 2 * y1 + y2; if (Math.abs(den) > 1e-9) fr = 0.5 * (y0 - y2) / den; }
  return { lag: (bl + fr) / FS, r: best };
}
function coord(d, S, tr) {
  const n = d.n, out = { change: [], lags: {}, boot: {} }, lean = i => d.p('lean', i) * R2D;
  // 换刃：相邻两个有效的弯之间，身体倾角从上一弯峰值的一半落下、到下一弯峰值的一半升起，用了多久；过零那一刻板刃还剩多少度
  for (let k = 1; k < tr.list.length; k++) { const a = tr.list[k - 1], b = tr.list[k]; if (a.i1 !== b.i0) continue; const i0 = a.i1, pa = a.pk * R2D * 0.5, pb = b.pk * R2D * 0.5; let ia = i0, ib = i0;
    while (ia > a.i0 && Math.abs(lean(ia)) < pa) ia--; while (ib < b.i1 && Math.abs(lean(ib)) < pb) ib++;
    const edge0 = 0.5 * (S.deg.edgeL[i0] + S.deg.edgeR[i0]) * -b.side; let ie = i0; while (ie < b.i1 && (0.5 * (S.deg.edgeL[ie] + S.deg.edgeR[ie])) * b.side < 0) ie++;
    out.change.push({ t: i0 / FS, dur: (ib - ia) / FS, rate: Math.abs(lean(Math.min(n - 1, i0 + 1)) - lean(Math.max(0, i0 - 2))) / 3 * FS, edge0, edgeLate: (ie - i0) / FS, speed: d.s('speed', i0) }); }
  // 时间差：只看连续转弯的那一段（第一个弯开始到最后一个弯结束）
  if (tr.list.length >= 4) { const a = tr.list[0].i0, b = tr.list[tr.list.length - 1].i1, sl = x => x.slice(a, b), L = sl(d.P.map(r => r[d.PK.indexOf('lean')]));
    const sig = { '输入（玩家的转向）': sl(d.S.map(r => r[d.SK.indexOf('u')])), '物理的倾角': sl(d.S.map(r => r[d.SK.indexOf('lean')])), '板刃': sl(S.deg.edgeL.map((x, i) => 0.5 * (x + S.deg.edgeR[i]))), '躯干侧倾': sl(S.deg.trunkRoll), '髋横移': sl(d.J.map((r, i) => 0.5 * (d.j('hipL', i)[0] + d.j('hipR', i)[0]) - 0.5 * (d.j('ankleL', i)[0] + d.j('ankleR', i)[0]))),
      '两膝弯曲差': sl(S.deg.kneeR.map((x, i) => x - S.deg.kneeL[i])), '内脚领先': sl(d.P.map(r => r[d.PK.indexOf('lead')])), '胸转向（反拧）': sl(S.deg.chestYaw.map(x => -x)), '头转向': sl(S.deg.headYaw.map(x => -x)), '两手高低差': sl(d.J.map((r, i) => d.j('gripL', i)[1] - d.j('gripR', i)[1])), '雪板横摆（侧滑角）': sl(d.S.map(r => r[d.SK.indexOf('beta')])) };
    for (const k in sig) { const p = xlag(L, sig[k]), q = xlag(L, sig[k].map(x => -x)); out.lags[k] = p.r >= q.r ? { lag: p.lag, r: p.r } : { lag: q.lag, r: -q.r }; } }
  // 小腿在靴子里：侧向歪了多少度（靴子只让小腿前后动，侧向几乎不让）；膝盖朝向和雪板朝向差多少度（八字腿 = 两边符号相反地变大）
  const lat = { L: [], R: [] }, yaw = { L: [], R: [] };
  for (let i = 0; i < n; i++) { if (d.flag[i] & 1 || d.fl[i][11] > 0.05 || d.p('air', i) > 0.05) continue; const B = d.bas[i];
    for (const sd of ['L', 'R']) { const fX = sd === 'L' ? B[8] : B[10], fZ = sd === 'L' ? B[9] : B[11], sh = v.norm(v.sub(d.j('knee' + sd, i), d.j('ankle' + sd, i))); lat[sd].push(Math.asin(Math.max(-1, Math.min(1, v.dot(sh, fX)))) * R2D); yaw[sd].push(Math.atan2(v.dot(sh, fX), -v.dot(sh, fZ)) * R2D); } }
  const ab = a => a.map(Math.abs); out.boot = { latP99: Math.max(pct(ab(lat.L), 0.99), pct(ab(lat.R), 0.99)), latMax: Math.max(...ab(lat.L), ...ab(lat.R), 0), yawP99: Math.max(pct(ab(yaw.L), 0.99), pct(ab(yaw.R), 0.99)), splayP99: pct(yaw.L.map((x, i) => Math.abs(yaw.R[i] - x)), 0.99), splayMax: Math.max(...yaw.L.map((x, i) => Math.abs(yaw.R[i] - x)), 0) };
  return out;
}

module.exports = { FS, FC, THR_DEG, THR_MM, GAP, v, ang, lowpass, pct, rms, load, series, context, smooth, params, turns, clip, coord, xlag };
if (require.main !== module) return;
// ---- 主程序
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_')).sort();
const all = {}, f1 = (x, k = 1) => (+x).toFixed(k);
const GROUPS = { 腿: ['thighL', 'thighR', 'shinL', 'shinR'], 躯干: ['trunk', 'chest'], 头: ['head'], 手臂: ['uarmL', 'uarmR', 'farmL', 'farmR'], 雪杖: ['poleL', 'poleR'], 雪板: ['skiL', 'skiR'], 整体朝向: ['rootFwd', 'rootNrm'] };
console.log(`录制目录 ${dir}\n阈值：${FC} Hz 以上残差 > ${THR_DEG}°（方向）/ ${THR_MM} mm（位置）记一次突变，${GAP}s 内合并\n`);
console.log('场景'.padEnd(16) + '时长s  ' + Object.keys(GROUPS).map(g => g.padEnd(5)).join(' ') + ' | 合计/分钟');
const tot = { n: 0, byWhat: {}, byGroup: {}, byParam: {} };
for (const f of files) {
  const d = load(path.join(dir, f)), S = series(d), sm = smooth(d, S), tr = turns(d, S), cl = clip(d), co = coord(d, S, tr), mins = d.n / FS / 60;
  const g = {}; let sum = 0;
  for (const gk in GROUPS) { const evs = sm.jolts.filter(j => GROUPS[gk].includes(j.dof)); // 同一组里同一时刻只算一次
    const ts = evs.map(e => e.i).sort((a, b) => a - b); let c = 0, last = -1e9; for (const i of ts) { if (i - last > GAP * FS) c++; last = i; } g[gk] = c / mins; sum += c / mins; }
  console.log(d.id.padEnd(18) + String(Math.round(d.n / FS)).padStart(4) + '   ' + Object.keys(GROUPS).map(k => f1(g[k]).padStart(6)).join(' ') + ' | ' + f1(sum).padStart(6));
  for (const j of sm.jolts) { if (!Object.values(GROUPS).flat().includes(j.dof)) continue; tot.byWhat[j.what] = (tot.byWhat[j.what] || 0) + 1; const g = Object.keys(GROUPS).find(k => GROUPS[k].includes(j.dof)), b = (j.pin ? '点杖钉住中 ' : '') + (j.by.length ? j.by.join('+') : '（参数没跳）'); tot.byParam[g] = tot.byParam[g] || {}; tot.byParam[g][b] = (tot.byParam[g][b] || 0) + 1; }
  tot.n += d.n;
  all[d.id] = { note: d.note, secs: d.n / FS, groups: g, dofs: sm.dofs, jolts: sm.jolts, turns: { n: tr.list.length, T: tr.list.map(t => t.T), pk: tr.list.map(t => t.pk), speed: tr.list.map(t => t.speed), mean: tr.mean, sd: tr.sd }, clip: cl, coord: co, vars: d.vars, tricks: d.trick };
  if (csvDir) { fs.mkdirSync(csvDir, { recursive: true }); const keys = Object.keys(S.deg); fs.writeFileSync(path.join(csvDir, d.id + '.csv'), ['t,' + keys.join(',') + ',lean,air,speed'].concat(d.t.map((t, i) => [t].concat(keys.map(k => S.deg[k][i].toFixed(2)), [d.p('lean', i), d.flag[i] & 1, d.s('speed', i)]).join(','))).join('\n')); }
}
console.log('\n突变发生时游戏在做什么（所有场景合计，按骨头计数）：');
for (const [k, c] of Object.entries(tot.byWhat).sort((a, b) => b[1] - a[1])) console.log('  ' + k.padEnd(10) + String(c).padStart(5) + '  ' + f1(100 * c / Object.values(tot.byWhat).reduce((s, x) => s + x, 0)) + '%');
console.log('\n突变那一刻是哪个姿态参数在跳（按身体部位）：');
for (const g in tot.byParam) { const e = Object.entries(tot.byParam[g]).sort((a, b) => b[1] - a[1]), sum = e.reduce((s, x) => s + x[1], 0); console.log('  ' + g + '（' + sum + ' 次）: ' + e.slice(0, 7).map(x => x[0] + ' ' + x[1]).join(' ｜ ')); }
console.log('\n穿模（间距小于 0 且深于 5 mm 的帧占比 %，最深 mm@场景 秒）：');
{ const agg = {}; let N = 0; for (const id in all) { N += all[id].secs * FS; for (const k in all[id].clip) { const c = all[id].clip[k], key = k.replace(/[LR]/g, ''), a = agg[key] = agg[key] || { frames: 0, worst: 0, at: '' }; a.frames += c.frames; if (c.worst > a.worst) { a.worst = c.worst; a.at = id + ' ' + f1(c.at, 2) + 's'; } } }
  for (const [k, a] of Object.entries(agg).sort((x, y) => y[1].frames - x[1].frames)) if (a.frames) console.log('  ' + k.padEnd(12) + f1(100 * a.frames / N, 2).padStart(7) + '%   最深 ' + f1(a.worst * 1000, 0).padStart(4) + ' mm  @' + a.at); }
console.log('\n换刃（连续转弯的场景）：时长 = 身体倾角从上一弯峰值一半到下一弯峰值一半；刃残留 = 身体过正中那一刻板刃还压在旧一侧多少度；刃晚 = 板刃比身体晚多久放平');
for (const id in all) { const c = all[id].coord.change; if (c.length < 4) continue; const m = k => c.reduce((s, x) => s + x[k], 0) / c.length; console.log('  ' + id.padEnd(16) + ' 次数 ' + String(c.length).padStart(3) + '  时长 ' + f1(m('dur'), 2) + ' s  过零角速度 ' + f1(m('rate'), 0) + ' °/s  刃残留 ' + f1(m('edge0'), 1) + '°  刃晚 ' + f1(m('edgeLate') * 1000, 0) + ' ms  速度 ' + f1(m('speed'), 1) + ' m/s'); }
console.log('\n各部位比“画出来的身体倾角”晚多少毫秒（负 = 早；括号里是相关系数，绝对值小于 0.5 说明这个量和转弯关系不大）：');
for (const id of ['keys_mid', 'keys_long', 'touch_sine', 'keys_short', 'powder']) { if (!all[id]) continue; const L = all[id].coord.lags; console.log('  ' + id + ': ' + Object.keys(L).map(k => k + ' ' + f1(L[k].lag * 1000, 0) + '(' + f1(L[k].r, 2) + ')').join(' ｜ ')); }
console.log('\n小腿在靴子里（只算在雪上、没做动作的帧）：侧歪 p99 / 最大（度）；膝朝向偏离板向 p99；两腿朝向差（八字）p99 / 最大');
for (const id in all) { const b = all[id].coord.boot; console.log('  ' + id.padEnd(16) + f1(b.latP99).padStart(6) + ' / ' + f1(b.latMax).padStart(5) + '    ' + f1(b.yawP99).padStart(6) + '    ' + f1(b.splayP99).padStart(6) + ' / ' + f1(b.splayMax).padStart(5)); }
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(all));
