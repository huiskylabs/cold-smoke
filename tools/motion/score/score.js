// 动作评分器：读 record.js 录下的全部场景（覆盖矩阵，scenarios.js），给每张动作卡打分。
//   node tools/motion/score/score.js [录制目录=tools/motion/out/score] [--baseline] [--json 输出.json] [--html 报告.html]
// 四层（评审文档 https://claude.ai/artifact/KhBzHapu5zZrXQsAULFXGD）：
//   H 硬规则：一帧不过就“不合格”，这张卡 0 分；
//   F 流畅 35%、R 像专业滑手 40%、E 优雅 25%：每条指标按“离专业范围多远”换成 0–100 分，再按可信度加权。
// 同一份录制量两遍结果必须一样（score 里没有随机数、不看时钟）。
const fs = require('fs'), path = require('path');
const A = require('../analyze.js'), { v, ang, pct, lowpass, load, series, smooth, turns, clip, coord } = A;
const BANDS = require('./bands.js');
const FS = 60, R2D = 180 / Math.PI;
const args = process.argv.slice(2), dir = args[0] && !args[0].startsWith('--') ? args[0] : path.join(__dirname, '..', 'out', 'score');
const opt = k => args.includes(k) ? args[args.indexOf(k) + 1] : null;

const CARDS = [
  ['start', '起步撑杖'], ['glide', '直滑'], ['turn', '普通转弯'], ['carve', '深压切弯'], ['edge', '换刃'], ['takeoff', '起跳'], ['air', '空中'],
  ['land', '落地'], ['stop', '刹停'], ['tuck', '团身和前后压板'], ['terrain', '蘑菇和地形'],
];
const GEARS = { ski: '双板', board: '单板' };

// ---------------------------------------------------------------- 每帧属于哪张卡（一帧可以属于几张）
function cardsOf(d, tr) {
  const n = d.n, sc = d.sc || {}, c = Array.from({ length: n }, () => new Set());
  const air = i => d.flag[i] & 1, sp = i => d.s('speed', i);
  const evT = type => d.ev.filter(e => e[1] === type).map(e => Math.round(e[0] * FS));
  const deep = /Deep/.test(sc.ctl || '');
  for (let i = 0; i < n; i++) {
    if (air(i)) { c[i].add('air'); continue; }
    if (d.p('dp', i) > 0 || (sc.base === 'start' || sc.base === 'standjump') && i < 4 * FS && sp(i) < 6) c[i].add('start');
    if (d.p('tuck', i) > 0.5 || Math.abs(d.p('fa', i)) > 0.3) c[i].add('tuck');
    if (sc.base && /^stop/.test(sc.base) && i / FS > (sc.acc || 6) && sp(i) > 0.3) c[i].add('stop');
    if (/^(moguls|gully)$/.test(sc.base || '')) c[i].add('terrain');
    if (Math.abs(d.p('lean', i)) < 0.1 && sp(i) > 4 && d.p('dp', i) <= 0 && d.p('tuck', i) < 0.5) c[i].add('glide');
  }
  for (const t of tr.list) for (let i = t.i0; i < t.i1; i++) c[i].add(deep ? 'carve' : 'turn');
  for (let k = 1; k < tr.list.length; k++) if (tr.list[k - 1].i1 === tr.list[k].i0) { const i0 = tr.list[k].i0; for (let i = Math.max(0, i0 - 9); i < Math.min(n, i0 + 9); i++) c[i].add('edge'); }
  for (const i0 of evT('takeoff')) for (let i = Math.max(0, i0 - 24); i < i0; i++) c[i].add('takeoff');
  for (const i0 of evT('land')) for (let i = i0; i < Math.min(n, i0 + 48); i++) c[i].add('land');
  return c;
}

// ---------------------------------------------------------------- H 硬规则（逐帧）
// 雪板几何和 code-only-game-kit research/human/tools/snow_contact_check.js 的门槛一样（那边是交接来的，这里是同一把尺）
const col = (F, k) => F[k];
function skiBase(F) {        // F = [X, Y, Z, P]，板底取 7 个截面 × 两条刃
  const [X, , Z, P] = F; let lo = 9, line = -9;
  for (const z of [-0.75, -0.6, -0.3, 0, 0.3, 0.6, 0.75]) { let e = 9; for (const x of [-0.055, 0.055]) { const y = P[1] + X[1] * x + Z[1] * z; lo = Math.min(lo, y); e = Math.min(e, y); } line = Math.max(line, e); }
  return { lo, line };
}
function hard(d, S, cards) {
  const n = d.n, board = (d.vars || {}).ride === 'b', out = [];
  const add = (id, i, val, lim, what) => out.push({ id, i, t: i / FS, val: +val.toFixed(2), lim, what, cards: [...cards[i]] });
  const worst = {};
  const note = (id, i, val, lim, bad, what) => { if (!bad) return; const w = worst[id] = worst[id] || { n: 0 }; w.n++; if (!w.i || Math.abs(val) > Math.abs(w.val)) Object.assign(w, { i, val, lim, what }); };
  for (let i = 0; i < n; i++) {
    const J = k => d.j(k, i), airF = d.flag[i] & 1, ff = d.ff && d.ff[i], hf = d.hf && d.hf[i];
    if (ff && !airF && !board) {
      const tb = d.skb && d.skb[i], a = tb ? { lo: tb[0][0], line: tb[0][1] } : skiBase(ff[0]), b = tb ? { lo: tb[1][0], line: tb[1][1] } : skiBase(ff[1]), lo = Math.min(a.lo, b.lo) * 100, hi = Math.max(a.lo, b.lo) * 100, line = (a.lo < b.lo ? a.line : b.line) * 100;
      note('H1', i, lo, 1, lo > 1, '承重的板离雪 ' + lo.toFixed(1) + ' cm');
      note('H1', i, hi, 3, hi > 3, '内侧板离雪 ' + hi.toFixed(1) + ' cm');
      // （粉雪里板本来就该沉下去：游戏自己的下沉量最多 0.18·粉雪²·1.4 米，这部分不算陷雪。硬板压在雪上时最低点正好在雪面，所以“最低点低于雪面”与地形弯不弯无关；
      //  “板头到板尾那条线离雪”在蘑菇和沟里是硬板自然架空，不是错，2026-11-18 去掉）
      const pw = d.SK.includes('powder') ? d.s('powder', i) : 0, sink = 100 * 0.18 * pw * pw * 1.4 + (d.fl ? 100 * Math.max(0, d.fl[i][7] || 0) : 0);      // （再加游戏有意做的落地砸进雪里的量 F.sink）
      note('H1', i, -lo - sink, 1, lo < -1 - sink, '板陷进雪 ' + (-lo).toFixed(1) + ' cm' + (sink > 0.5 ? '（粉雪允许 ' + sink.toFixed(1) + '）' : ''));
      const sa = ang(ff[0][2], ff[1][2]); note('H2', i, sa, 1, sa > 1, '两板夹角 ' + sa.toFixed(1) + '°');
      // H4 雪杖：握拳以下、离雪 60 cm 以内的杖身，在板长范围内要在自己那块板外侧 ≥ 7 cm
      for (const [sd, F, o] of [['L', ff[0], -1], ['R', ff[1], 1]]) { const g = J('grip' + sd), tp = J('tip' + sd), [X, , Z, P] = F;
        for (let u = 0.1; u <= 1.0001; u += 0.1) { const q = v.add(g, v.mul(v.sub(tp, g), u)); if (q[1] > 0.6) continue; const dd = v.sub(q, P), z = v.dot(dd, Z); if (z < -0.96 || z > 0.8) continue;
          if (v.dot(dd, F[1]) > 0.15) continue;      // （只看贴近板面的那一段杖：身体倒进弯里时，外侧手本来就在外板的上方，杖身从板上方斜过去是对的；错的是杖在板面高度上压到板上，2026-11-18）
          const Xh = v.norm([X[0], 0, X[2]]), outD = o * v.dot(dd, Xh) * 100;      // （横向按雪面上的横向量：板立刃时它自己的 X 轴是斜的，离板半米高的杖身会被误算成“在板内侧”，2026-11-18）
          note('H4', i, outD, 7, outD < 7, (sd === 'L' ? '左' : '右') + '杖身离自己的板外侧只有 ' + outD.toFixed(1) + ' cm'); } }
    }
    // H5 手：握杖的拳，掌心朝里（朝身体中线）。手骨 Y 轴 = 前臂 × 杖，指向一定；左右装反或掌心翻过来，这个方向就反了
    // （2026-11-18 改尺子：原来量的是手骨的 Y 轴（前臂 × 杖），左右手取相反的号。杖拖在身后时两只手的这个方向是同一个，所以总有一只手被判错，
    //   而且画出来的手套根本不跟手骨走，跟的是握杖的拳。现在量拳本身：手背（拳坐标的 X 轴，左手镜像后同号）要朝身体外侧，两只手都是 X 指向身体的右）
    const pfr = d.pf && d.pf[i];
    if (pfr && !board && !airF && !(d.fl && d.fl[i][11] > 0.05)) for (const [sd, k] of [['L', 0], ['R', 1]]) { const s = v.dot(pfr[k][0], d.bas[i][3]); note('H5', i, s, 0, s < -0.3, (sd === 'L' ? '左' : '右') + '手手背朝里（拳翻过来了）'); }
    else if (hf && !board && !airF && !(d.fl && d.fl[i][11] > 0.05)) for (const [sd, k, o] of [['L', 0, -1], ['R', 1, 1]]) { const Y = hf[k][1], lat = d.bas[i][3];       // 胸的 X 轴 = 身体的右
      const s = o * v.dot(Y, lat) * BANDS.HAND_SIGN; note('H5', i, s, 0, s < -0.3, (sd === 'L' ? '左' : '右') + '手掌心朝外（拳翻过来或左右手装反）'); }
    // H9 团身握杖（用户 2026-11-17 23:18 UTC：“握是收到两个腋窝之间，胳膊夹住杖出去，你这个是在胳膊外面，手腕也不对”）：
    //    杖身从腋下过（离腋窝点 ≤ 6 cm；腋窝点 = 肩关节往下 7 cm、往里 3 cm）、两拳在两肩之间且在胸前、手腕直（前臂和 腕→拳 的夹角 ≤ 35°）
    if (!board && !airF && d.PK.includes('tuck') && d.p('tuck', i) > 0.6) { const X = d.bas[i][3], Y = d.bas[i][4], half = v.len(v.sub(J('shL'), J('shR'))) / 2, mid = v.mul(v.add(J('shL'), J('shR')), 0.5);
      for (const [sd, o] of [['L', -1], ['R', 1]]) { const nm = sd === 'L' ? '左' : '右', g = J('grip' + sd), tp = J('tip' + sd), sh = J('sh' + sd), pit = v.add(v.add(sh, v.mul(Y, -0.07)), v.mul(X, -o * 0.03));
        const ax = v.sub(tp, g), u = Math.max(0, Math.min(1, v.dot(v.sub(pit, g), ax) / v.dot(ax, ax))), gap = v.len(v.sub(pit, v.add(g, v.mul(ax, u)))) * 100;
        note('H9', i, gap, 6, gap > 6, nm + '杖没从腋下夹着过：杖身离腋窝 ' + gap.toFixed(0) + ' cm');
        const gx = Math.abs(v.dot(v.sub(g, mid), X)); note('H9', i, gx * 100, half * 100, gx > half, nm + '拳在肩的外面（应在两腋之间）：离中线 ' + (gx * 100).toFixed(0) + ' cm');
        const wr = ang(v.sub(J('wrist' + sd), J('elbow' + sd)), v.sub(g, J('wrist' + sd))); note('H9', i, wr, 35, wr > 35, nm + '手腕折了 ' + wr.toFixed(0) + '°'); } }
    // H6 关节：膝、肘不超过人体范围；膝永远朝前弯（不反折）
    for (const sd of ['L', 'R']) { const kn = S.deg['knee' + sd][i], el = S.deg['elbow' + sd][i];
      note('H6', i, kn, 150, kn > 150, (sd === 'L' ? '左' : '右') + '膝弯到 ' + kn.toFixed(0) + '°'); note('H6', i, el, 150, el > 150, (sd === 'L' ? '左' : '右') + '肘弯到 ' + el.toFixed(0) + '°');
      const h = J('hip' + sd), k = J('knee' + sd), a = J('ankle' + sd), mid = v.mul(v.add(h, a), 0.5), fwd = ff ? v.mul(ff[sd === 'L' ? 0 : 1][2], -1) : [0, 0, -1], kf = v.dot(v.sub(k, mid), fwd) * 100;
      if (kn > 15) note('H6', i, kf, 0, kf < -1, (sd === 'L' ? '左' : '右') + '膝往后折（反关节）'); }
  }
  // H3 穿模（analyze.js 的胶囊体，进去 > 5 mm）：只看人身上的，杖尖入雪 / 板尖入雪 归 H1、H4
  const cl = clip(d); for (const k in cl) if (cl[k].frames > 0 && !/入雪|腿伸直/.test(k) && !(board && /雪杖/.test(k))) { const i = Math.round(cl[k].at * FS); note('H3', i, cl[k].worst * 100, 0.5, true, k + ' 穿进去 ' + (cl[k].worst * 100).toFixed(1) + ' cm（' + cl[k].frames + ' 帧）'); }
  // H7 靴子里的小腿：侧歪不超过 5°
  const co = coord(d, S, turns(d, S)); const bootLim = board ? 12 : 5;      // （单板软靴侧向能让得多）
  if (co.boot.latP99 > bootLim) note('H7', 0, co.boot.latP99, bootLim, true, '小腿在靴子里侧歪 ' + co.boot.latP99.toFixed(1) + '°');
  for (const id in worst) { const w = worst[id]; out.push({ id, i: w.i, t: +(w.i / FS).toFixed(2), val: +(+w.val).toFixed(2), lim: w.lim, what: w.what, frames: w.n, cards: [...cards[w.i]] }); }
  return { list: out.filter(x => x.frames), co };
}

// ---------------------------------------------------------------- 一条指标 → 0–100 分
function band(x, b) { if (x == null || !isFinite(x)) return null; const [lo, hi] = b.r, w = Math.max(1e-6, (b.w != null ? b.w : hi - lo)); const dd = x < lo ? lo - x : x > hi ? x - hi : 0; return 100 * Math.max(0, 1 - dd / w); }

// 人的重心（模型空间）：各段质量占比（Dempster / Winter 表，四舍五入），段的重心取两端中点
const SEGM = [['pelvis', 'pelvis', 0.14], ['pelvis', 'neck', 0.36], ['head', 'head', 0.08], ['hipL', 'kneeL', 0.1], ['hipR', 'kneeR', 0.1], ['kneeL', 'ankleL', 0.045], ['kneeR', 'ankleR', 0.045], ['footL', 'footL', 0.015], ['footR', 'footR', 0.015], ['shL', 'elbowL', 0.028], ['shR', 'elbowR', 0.028], ['elbowL', 'gripL', 0.022], ['elbowR', 'gripR', 0.022]];
function com(d, i) { let c = [0, 0, 0], m = 0; for (const [a, b, w] of SEGM) { c = v.add(c, v.mul(v.add(d.j(a, i), d.j(b, i)), w / 2)); m += w; } return v.mul(c, 1 / m); }

// ---------------------------------------------------------------- 肩和头（2026-11-18：五条肩的指标；bands.js 里它们的范围全是暂定的，等专业视频量出来再校）
// 人物关节是“板的坐标”：x = 身体的右，y = 雪面法线，-z = 板头方向（两块板永远朝 -z）。身体倾角 lean 为正 = 往 +x 倒 = 往右转。
// 下面带符号的量都取“和 lean 同号 = 往弯里”。
//   shRoll   肩线（左肩→右肩）的侧倾，相对雪面；shYaw 肩线朝向减板的朝向（正 = 朝 +x 那一侧拧）
//   line     “脚中点→骨盆”这条线的内倾 减 躯干（骨盆→颈）的内倾，冠状面里量；乘上弯的方向后，正 = 反弓（肩更平），负 = 上身比腿倒得还多
//   headRoll 眼睛那条线（头骨的 X 轴）的侧倾，相对雪面（和 lean 同一个基准，才能比“头歪了身体倾角的几成”）
//   shYawV / skiYawV 肩线朝向、板的朝向 各自相对“行进方向”的偏角。行进方向 = root 位置差分出来的速度，投到雪面里（板的坐标里）量；慢于 1 m/s 记 null。
//   （都在雪面里量、不在世界的水平面里量：坡是斜的，肩线一侧倾，从正上方看它就“拧”了十来度，头一转眼线就“歪”了，那是坡的几何，不是身体在拧。）
function upper(d) {
  const n = d.n, mk = () => new Array(n), wrap = a => a - 360 * Math.round(a / 360), U = { shRoll: mk(), shYaw: mk(), line: mk(), legRoll: mk(), headRoll: mk(), shYawV: mk(), skiYawV: mk() };
  const roll = x => Math.atan2(-x[1], Math.hypot(x[0], x[2])) * R2D;
  for (let i = 0; i < n; i++) {
    const J = k => d.j(k, i), sh = v.sub(J('shR'), J('shL')), hbX = d.bas[i][5], F = d.root[i][1], Rt = v.cross(F, d.root[i][2]);
    U.shRoll[i] = roll(sh); U.shYaw[i] = Math.atan2(sh[2], sh[0]) * R2D; U.headRoll[i] = roll(hbX);
    const pel = J('pelvis'), tr = v.sub(J('neck'), pel), leg = v.sub(pel, v.mul(v.add(J('footL'), J('footR')), 0.5));
    U.line[i] = (Math.atan2(leg[0], leg[1]) - Math.atan2(tr[0], tr[1])) * R2D;
    U.legRoll[i] = Math.atan2(leg[0], leg[1]) * R2D;      // （腿线的侧倾：两脚中点→骨盆。肩先不先，是和它比，不是和游戏给的倾角指令比：指令比腿早，和它比肩永远不“先”）
    const i0 = Math.max(0, i - 2), i1 = Math.min(n - 1, i + 2), vel = v.mul(v.sub(d.root[i1][0], d.root[i0][0]), FS / (i1 - i0)), sp = v.len(vel);
    if (sp < 1 || sp > 80) { U.shYawV[i] = U.skiYawV[i] = null; continue; }      // （太慢方向不准；太快是位置跳了一下）
    U.skiYawV[i] = -Math.atan2(v.dot(vel, Rt), v.dot(vel, F)) * R2D; U.shYawV[i] = wrap(U.shYaw[i] + U.skiYawV[i]);
  }
  return U;
}

// ---------------------------------------------------------------- F / R / E 指标（每张卡的样本）
function metrics(d, S, tr, cards, co, sm) {
  const n = d.n, gear = (d.vars || {}).ride === 'b' ? 'board' : 'ski', L = d.LEN, leg = L.thigh + L.shin, out = [];   // [card, layer, id, value]
  const U = upper(d);
  const put = (card, layer, id, x) => { if (x != null && isFinite(x)) out.push([card, layer, id, x]); };
  const inC = (i, c) => cards[i].has(c), frames = c => { const r = []; for (let i = 0; i < n; i++) if (inC(i, c)) r.push(i); return r; };
  const minutes = c => frames(c).length / FS / 60;
  // F1 突变：每张卡里每分钟几次
  for (const [c] of CARDS) { const m = minutes(c); if (m < 0.05) continue; const k = sm.jolts.filter(j => inC(j.i, c)).length; put(c, 'F', 'F1', k / m); }
  // F3 关节速度上限（落地缓冲时膝除外）、F4 一帧跳变（手、头、髋位置二阶差分，毫米）
  const dK = ['kneeL', 'kneeR'].map(k => S.deg[k].map((x, i) => i ? Math.abs(x - S.deg[k][i - 1]) * FS : 0));
  const hv = S.deg.headYaw.map((x, i) => i ? Math.abs(x - S.deg.headYaw[i - 1]) * FS : 0);
  const d2 = k => S.pos[k].map((q, i) => i > 1 ? v.len(v.add(v.sub(q, v.mul(S.pos[k][i - 1], 2)), S.pos[k][i - 2])) * 1000 : 0);
  const D2 = ['p_head', 'p_gripL', 'p_gripR', 'p_pelvis'].map(d2);
  for (const [c] of CARDS) { const f = frames(c); if (f.length < 20) continue;
    if (c !== 'land') put(c, 'F', 'F3k', pct(f.map(i => Math.max(dK[0][i], dK[1][i])), 0.99));
    put(c, 'F', 'F3h', pct(f.map(i => hv[i]), 0.99));
    put(c, 'F', 'F4', Math.max(...f.map(i => Math.max(D2[0][i], D2[1][i], D2[2][i], D2[3][i]))));
  }
  // F6 肩先进弯 / F7 响应（连续转弯时）：躯干侧倾比身体倾角早多少秒（正 = 上身先，用户定的标准；负 = 上身晚了，算错。2026-11-18 改：原来要求上身晚 0–0.2 秒“腿先动”，和用户的标准相反）；输入到身体倾角的延迟
  if (co.lags['躯干侧倾']) put('turn', 'F', 'F6', -co.lags['躯干侧倾'].lag);
  if (co.lags['输入（玩家的转向）']) put('turn', 'F', 'F7', -co.lags['输入（玩家的转向）'].lag);
  // R 转弯：每个弯取弯中（0.4–0.6）的值，和专业滑手同样的量
  for (const t of tr.list) { const c = cards[Math.floor((t.i0 + t.i1) / 2)].has('carve') ? 'carve' : 'turn', mid = q => { const a = t.c[q].slice(13, 20); return a.reduce((s, x) => s + x, 0) / a.length; };
    const apex = Math.floor((t.i0 + t.i1) / 2), J = k => d.j(k, apex), hip = v.mul(v.add(J('hipL'), J('hipR')), 0.5);
    // R0 站不站得住（2026-11-18 改）：从全身重心（按各段质量）沿物理的倾角画一条线到雪面，这条线要落在两只脚之间（外脚再外 3 cm 以内也算），
    // 落在脚外面就是“物理上会倒”。量的是落点出了两脚范围多少厘米（弯中几帧的平均）。原来按“两踝中点”比角度，等于假设两脚各承一半重，
    // 把正常的“外脚承重多”算成了 7 度的误差。同时记外脚承了多少（0 = 全在内脚，1 = 全在外脚）给报告看。
    { let sum = 0, fr = 0, k = 0; for (let i = t.i0 + Math.floor(0.4 * (t.i1 - t.i0)); i <= t.i0 + Math.ceil(0.6 * (t.i1 - t.i0)); i++) { const ln = d.s('lean', i); if (Math.abs(ln) < 0.1) continue;
        const c_ = com(d, i), aL = d.j('ankleL', i), aR = d.j('ankleR', i), sg = Math.sign(ln), inn = sg > 0 ? aR : aL, out = sg > 0 ? aL : aR;
        const gy = (aL[1] + aR[1]) / 2, gx = c_[0] - (c_[1] - gy) * Math.tan(ln), sp = (gx - inn[0]) / ((out[0] - inn[0]) || 1e-6), w = Math.abs(out[0] - inn[0]) * 100;
        sum += Math.max(0, -sp * w, (sp - 1) * w - 3); fr += sp; k++; }
      if (k) { put(c, 'R', 'R0', sum / k); put(c, 'R', 'R0s', fr / k); } }
    put(c, 'R', 'Rincl', Math.abs(mid('incl'))); put(c, 'R', 'RkLong', mid('kneeO')); put(c, 'R', 'RkShort', mid('kneeI')); put(c, 'R', 'RhipH', mid('hipH'));
    put(c, 'R', 'RhandH', ((J('gripL')[1] + J('gripR')[1]) / 2 - hip[1]) / leg); put(c, 'R', 'Rspr', v.len(v.sub(J('gripL'), J('gripR'))) / leg);
    put(c, 'R', 'Rtwist', Math.abs(mid('twist'))); put(c, 'R', 'Rperiod', 2 * t.T);
    // 肩和头（暂定范围，见 bands.js）：弯中 = 这个弯 40%–60% 的那一段
    { const s = t.side, m0 = t.i0 + Math.floor(0.4 * (t.i1 - t.i0)), m1 = t.i0 + Math.ceil(0.6 * (t.i1 - t.i0)), avg = f => { let a = 0, k = 0; for (let i = m0; i <= m1; i++) { const x = f(i); if (x != null) { a += x; k++; } } return k ? a / k : null; };
      put(c, 'R', 'Rshline', avg(i => s * U.line[i]));                                     // ① 躯干对“脚→骨盆”线：正 = 反弓
      // ② 肩比身体倾角早多少秒：这个弯前后各多看 0.25 秒，肩线侧倾和 lean 做互相关（相关不到 0.8、或者顶到 ±0.4 秒搜索边上的不算：那是肩几乎没动的弯）
      { const a = Math.max(0, t.i0 - 15), b = Math.min(n, t.i1 + 15), Ln = [], Sh = []; for (let i = a; i < b; i++) { Ln.push(U.legRoll[i]); Sh.push(U.shRoll[i]); } const x = A.xlag(Ln, Sh, 24); if (x.r >= 0.8 && Math.abs(x.lag) < 0.39) put(c, 'R', 'Rshlead', -x.lag); }
      put(c, 'R', 'Rshyaw', avg(i => U.shYawV[i] == null ? null : s * U.shYawV[i]));       // ④ 肩线相对速度方向往弯里拧了多少
      { const y = []; for (let i = t.i0; i < t.i1; i++) y.push(U.shYaw[i]); const m = y.reduce((p, q) => p + q, 0) / y.length; put(c, 'R', 'Rshfree', Math.sqrt(y.reduce((p, q) => p + (q - m) ** 2, 0) / y.length)); }      // ④ 肩有没有和板锁死
      // ⑤ 头：弯中眼线的侧倾 / 身体倾角；整个弯里眼线最多歪了多少度（95% 分位）。都相对雪面
      { const ln = avg(i => Math.abs(d.p('lean', i)) * R2D); if (ln > 6) put(c, 'R', 'Rheadk', avg(i => Math.abs(U.headRoll[i])) / ln); const h = []; for (let i = t.i0; i < t.i1; i++) h.push(Math.abs(U.headRoll[i])); put(c, 'R', 'Rheadabs', pct(h, 0.95)); } }
    // E3 手臂框架：肘微弯（双板）、手在胸前；E4 静中有动：外膝几乎不动的时间占比
    if (gear === 'ski') { put(c, 'E', 'E3el', (S.deg.elbowL[apex] + S.deg.elbowR[apex]) / 2); put(c, 'E', 'E3fwd', ((J('chest')[2] - J('gripL')[2]) + (J('chest')[2] - J('gripR')[2])) / 2); }
    const kO = t.c.kneeO, still = kO.filter((x, k) => k && Math.abs(x - kO[k - 1]) * 32 / t.T < 20).length / (kO.length - 1); put(c, 'E', 'E4', still);
  }
  // 肩：回正和换刃（暂定范围）。“回正” = |lean| 从 0.05 以上落到 0.05 以下，而且这之前倒到过 0.15 以上（和 turns() 认一个弯的门槛一样）、人在雪上、没撑杖（回正以后人常常马上团身，团身不排除）。
  { const ok = i => (d.flag[i] & 2) && !(d.flag[i] & 1) && !(d.s('crash', i) > 0) && !(d.p('dp', i) > 0), al = i => Math.abs(d.p('lean', i)); let pk = 0;
    for (let i = 1; i < n - 18; i++) { if (!ok(i)) { pk = 0; continue; } pk = Math.max(pk, al(i - 1)); if (!(al(i - 1) >= 0.05 && al(i) < 0.05)) continue; const big = pk > 0.15, side = Math.sign(d.p('lean', i - 1)); pk = 0; if (!big) continue;
      // ① 回正后 0.3 秒内，躯干离“脚→骨盆”线最多多少度（不分方向；团身的帧不看：上身趴平以后“冠状面里的侧倾”没有意义）
      { let m = 0, good = true, cnt = 0; for (let k = i; k <= i + 18; k++) { if (!ok(k)) good = false; if (d.p('tuck', k) > 0.4) continue; m = Math.max(m, Math.abs(U.line[k])); cnt++; } if (good && cnt >= 6) put('edge', 'R', 'Rshline0', m); }
      // ③ 回正后反向歪：倾角在 0.4 秒里一直小于 0.08（真的回到直滑，不是连着进下一个弯），之后 0.5 秒里肩线往另一侧最多歪了多少度
      if (i + 30 < n) { let stay = true; for (let k = i; k <= i + 24; k++) if (al(k) >= 0.08 || !ok(k)) stay = false; if (stay) { let m = 0; for (let k = i; k <= i + 30; k++) m = Math.max(m, -side * U.shRoll[k]); put('turn', 'R', 'Rshtip', m); } } } }
  // ② 换刃那一刻：肩线侧倾过零比身体倾角过零早多少秒（正 = 肩先；前后各找 0.5 秒，找不到不算）
  for (let k = 1; k < tr.list.length; k++) { const b = tr.list[k]; if (tr.list[k - 1].i1 !== b.i0) continue; const i0 = b.i0, zc = (x, i) => i - 1 + x(i - 1) / ((x(i - 1) - x(i)) || 1e-9); let best = null;
    for (let i = Math.max(1, i0 - 30); i <= Math.min(n - 1, i0 + 30); i++) if (U.shRoll[i - 1] * b.side <= 0 && U.shRoll[i] * b.side > 0) { const z = zc(j => U.shRoll[j], i); if (best == null || Math.abs(z - i0) < Math.abs(best - i0)) best = z; }
    if (best != null) { let lz = null; for (let i = Math.max(1, i0 - 30); i <= Math.min(n - 1, i0 + 30); i++) if (U.legRoll[i - 1] * b.side <= 0 && U.legRoll[i] * b.side > 0) { const z = zc(j => U.legRoll[j], i); if (lz == null || Math.abs(z - i0) < Math.abs(lz - i0)) lz = z; } if (lz != null) put('edge', 'R', 'Rshlead0', (lz - best) / FS); } }
  // E5 左右对称：左弯和右弯的外膝、倾角差多少（相对）
  for (const c of ['turn', 'carve']) { const L_ = tr.list.filter(t => t.side < 0 && cards[t.i0 + 1].has(c)), R_ = tr.list.filter(t => t.side > 0 && cards[t.i0 + 1].has(c)); if (L_.length < 2 || R_.length < 2) continue;
    const m = (ts, q) => ts.reduce((s, t) => s + t.c[q].slice(13, 20).reduce((a, x) => a + x, 0) / 7, 0) / ts.length;
    put(c, 'E', 'E5', Math.max(...['kneeO', 'incl'].map(q => Math.abs(m(L_, q) - m(R_, q)) / Math.max(5, (Math.abs(m(L_, q)) + Math.abs(m(R_, q))) / 2)))); }
  // E1 上身安静：连续转弯时胸口朝向（世界里）的摆动 / 行进方向的摆动
  if (tr.list.length >= 3) { const a = tr.list[0].i0, b = tr.list[tr.list.length - 1].i1, ry = i => Math.atan2(d.root[i][1][0], -d.root[i][1][2]) * R2D;
    const tv = [], ch = []; for (let i = a; i < b; i++) { tv.push(ry(i)); ch.push(ry(i) + S.deg.chestYaw[i] - S.deg.chestYaw[a]); }
    const sd = x => { const m = x.reduce((s, y) => s + y, 0) / x.length; return Math.sqrt(x.reduce((s, y) => s + (y - m) ** 2, 0) / x.length); };
    if (sd(tv) > 3) put(tr.list.some(t => cards[t.i0 + 1].has('carve')) ? 'carve' : 'turn', 'E', 'E1', sd(ch) / sd(tv)); }
  // E2 直滑时头的上下颠（cm）
  { const f = frames('glide'); if (f.length > 60) { const hy = i => d.j('head', i)[1], y = f.map(i => { let s = 0, k = 0; for (let j = Math.max(0, i - 15); j <= Math.min(n - 1, i + 15); j++) { s += hy(j); k++; } return hy(i) - s / k; }); put('glide', 'E', 'E2', (pct(y, 0.95) - pct(y, 0.05)) * 100); } }
  // R 起跳、落地：离雪那一刻的膝、落地后 0.8 秒内膝最弯、用了多久
  for (const e of d.ev.filter(e => e[1] === 'takeoff')) { const i = Math.round(e[0] * FS); if (i < 2) continue; put('takeoff', 'R', 'RpopK', (S.deg.kneeL[i] + S.deg.kneeR[i]) / 2);
    let mx = 0; for (let k = Math.max(0, i - 48); k < i; k++) mx = Math.max(mx, (S.deg.kneeL[k] + S.deg.kneeR[k]) / 2); put('takeoff', 'R', 'RcrouchK', mx); }
  for (const e of d.ev.filter(e => e[1] === 'land')) { const i = Math.round(e[0] * FS); let mx = 0, at = i; for (let k = i; k < Math.min(n, i + 48); k++) { const q = (S.deg.kneeL[k] + S.deg.kneeR[k]) / 2; if (q > mx) { mx = q; at = k; } }
    const airT = e[3] || 0; put('land', 'R', 'RlandK', mx); put('land', 'R', 'Rabsorb', (at - i) / FS); out.push(['land', 'X', 'airT', airT]); }
  // 刹停：停稳后（速度 < 0.3）0.5 秒内身体还晃不晃（骨盆位置的摆动，cm）
  { const f = frames('stop'); if (f.length) { const last = f[f.length - 1], w = []; for (let i = last; i < Math.min(n, last + 30); i++) w.push(d.j('pelvis', i)[0]); if (w.length > 10) put('stop', 'E', 'Estill', (Math.max(...w) - Math.min(...w)) * 100); } }
  return out;
}

// ---------------------------------------------------------------- 主程序
function scoreAll(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort(), per = {}, hardAll = [], samples = [], cover = {};
  for (const f of files) {
    const d = load(path.join(dir, f)); d.sc = d.sc || {}; const gear = (d.vars || {}).ride === 'b' ? 'board' : 'ski';
    const S = series(d), tr = turns(d, S), cards = cardsOf(d, tr), sm = smooth(d, S), H = hard(d, S, cards);
    for (const h of H.list) for (const c of h.cards.length ? h.cards : ['glide']) hardAll.push(Object.assign({ scn: d.id, gear, card: c }, h));
    for (const [c, layer, id, x] of metrics(d, S, tr, cards, H.co, sm)) samples.push({ scn: d.id, gear, card: c, layer, id, x, style: d.sc.style });
    // 覆盖：每张卡在每一档速度下有多少秒
    for (let i = 0; i < d.n; i++) for (const c of cards[i]) { const s = d.s('speed', i), b = s < 8 ? '低速' : s < 15 ? '中速' : '高速', k = gear + '|' + c; cover[k] = cover[k] || { 低速: 0, 中速: 0, 高速: 0 }; cover[k][b] += 1 / FS; }
  }
  // 每张卡 × 滑具：各层分数
  const res = {};
  for (const g of Object.keys(GEARS)) for (const [c, zh] of CARDS) {
    const key = g + '|' + c, sm_ = samples.filter(s => s.gear === g && s.card === c), hs = hardAll.filter(h => h.gear === g && h.card === c);
    const lay = {}, det = [];
    for (const L of ['F', 'R', 'E']) { let ws = 0, s = 0;
      const ids = [...new Set(sm_.filter(x => x.layer === L).map(x => x.id))];
      for (const id of ids) { const b = BANDS.get(id, g, c); if (!b) continue; const xs = sm_.filter(x => x.layer === L && x.id === id).map(x => x.x), med = pct(xs, 0.5), p = band(med, b);
        if (p == null) continue; s += p * b.conf; ws += b.conf; det.push({ layer: L, id, zh: b.zh, n: xs.length, med: +med.toFixed(3), lo: +pct(xs, 0.1).toFixed(3), hi: +pct(xs, 0.9).toFixed(3), band: b.r, src: b.src, score: Math.round(p) }); }
      lay[L] = ws ? s / ws : null; }
    const has = Object.values(lay).some(x => x != null) || hs.length;
    if (!has && !(cover[key])) continue;
    const W = { F: 0.35, R: 0.40, E: 0.25 }; let tw = 0, ts = 0; for (const L in W) if (lay[L] != null) { ts += W[L] * lay[L]; tw += W[L]; }
    const fail = hs.length > 0, total = fail ? 0 : tw ? ts / tw : null;
    res[key] = { gear: g, card: c, zh, fail, total: total == null ? null : Math.round(total), F: lay.F == null ? null : Math.round(lay.F), R: lay.R == null ? null : Math.round(lay.R), E: lay.E == null ? null : Math.round(lay.E), hard: hs.sort((a, b) => b.frames - a.frames).slice(0, 8), det, cover: cover[key] || null };
  }
  return { at: new Date(0).toISOString(), dir, scenarios: files.length, cards: res };
}
module.exports = { scoreAll, band, CARDS, GEARS, upper };
if (require.main === module) {
  const R = scoreAll(dir), base = path.join(__dirname, 'baseline.json');
  if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(R, null, 1));
  const B = fs.existsSync(base) ? JSON.parse(fs.readFileSync(base, 'utf8')) : null;
  let bad = 0; console.log(`场景 ${R.scenarios} 个\n${'卡'.padEnd(14)}硬规则   F    R    E   总分  比基线`);
  for (const k in R.cards) { const r = R.cards[k], b = B && B.cards[k], dlt = b && r.total != null && b.total != null ? r.total - b.total : null, gate = r.fail || (r.total != null && r.total < 80) || (dlt != null && dlt < -3);
    if (gate) bad++;
    console.log(`${(GEARS[r.gear] + r.zh).padEnd(12)} ${r.fail ? '不过 ' : '过   '} ${String(r.F ?? '–').padStart(4)} ${String(r.R ?? '–').padStart(4)} ${String(r.E ?? '–').padStart(4)} ${String(r.total ?? '–').padStart(5)}  ${dlt == null ? '' : (dlt >= 0 ? '+' : '') + dlt}${gate ? '  ← 拦下' : ''}`);
    for (const h of r.hard.slice(0, 3)) console.log(`      ${h.id} ${h.what}（${h.scn} ${h.t}s，共 ${h.frames} 帧）`); }
  if (args.includes('--baseline')) { fs.writeFileSync(base, JSON.stringify(R, null, 1)); console.log('已存成新的基线'); }
  if (opt('--html')) require('./report.js').write(R, B, opt('--html'));
  process.exitCode = bad ? 1 : 0;
}
