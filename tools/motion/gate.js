// 门槛：一个改动能不能进，先过这把尺。读 analyze.js --json 的两份结果（候选、基线），只比它们共有的场景。
// 规则分两类：
//   “不许变差”（任何一条不过，退出码 1）：突变次数、穿模、小腿在靴子里的角度，都不能比基线差出容差。
//   “目标”（只打印达没达到，不影响退出码）：2026-11-16 动作评审定下的数字。
//   node tools/motion/gate.js <候选_summary.json> [<基线.json>]        基线默认是本目录的 baseline.json
//   node tools/motion/gate.js --slim <某个_summary.json> > baseline.json   把一份结果瘦身成基线（只留门槛用得到的数字）
const fs = require('fs'), path = require('path');
if (process.argv[2] === '--slim') {
  const D = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')), o = {};
  for (const id in D) { const d = D[id], clip = {}; for (const k in d.clip) clip[k] = { frames: d.clip[k].frames };
    o[id] = { secs: d.secs, groups: d.groups, clip, coord: { boot: { latP99: d.coord.boot.latP99, splayP99: d.coord.boot.splayP99 }, change: d.coord.change.map(c => ({ edge0: c.edge0 })) }, turns: { mean: { trunkRoll: d.turns && d.turns.mean && d.turns.mean.trunkRoll || null } } }; }
  console.log(JSON.stringify(o)); process.exit(0);
}
const [candF, baseF = path.join(__dirname, 'baseline.json')] = process.argv.slice(2);
if (!candF) { console.log('用法：node tools/motion/gate.js <候选_summary.json> [<基线.json>]'); process.exit(2); }
const C = JSON.parse(fs.readFileSync(candF, 'utf8')), B = JSON.parse(fs.readFileSync(baseF, 'utf8'));
const ids = Object.keys(B).filter(id => C[id]); if (!ids.length) { console.log('两份结果没有共同的场景'); process.exit(2); }
const G = ['腿', '躯干', '头', '手臂', '雪杖', '雪板', '整体朝向'];
const secs = d => ids.reduce((a, id) => a + d[id].secs, 0);
const perMin = (d, gs) => ids.reduce((a, id) => a + gs.reduce((b, g) => b + d[id].groups[g], 0) * d[id].secs / 60, 0) / (secs(d) / 60);
const count = (d, id) => Math.round(G.reduce((b, g) => b + d[id].groups[g], 0) * d[id].secs / 60);      // 这个场景里一共几次
const clip = (d, re) => { let fr = 0, n = 0; for (const id of ids) { n += d[id].secs * 60; for (const k in d[id].clip) if (re.test(k)) fr += d[id].clip[k].frames; } return 100 * fr / n; };
const boot = (d, k) => Math.max(...ids.map(id => d[id].coord.boot[k]));
let bad = 0; const f = (x, k = 1) => (+x).toFixed(k);
const must = (name, c, b, tol, unit = '') => { const ok = c <= b + tol; if (!ok) bad++; console.log((ok ? '  过    ' : '  不过  ') + name.padEnd(18) + ('候选 ' + f(c) + unit).padEnd(16) + ('基线 ' + f(b) + unit).padEnd(16) + '容差 +' + tol + unit); };
const goal = (name, c, lim, unit = '') => console.log((c <= lim ? '  达到  ' : '  未到  ') + name.padEnd(18) + ('候选 ' + f(c) + unit).padEnd(16) + '目标 ≤ ' + lim + unit);
console.log(`共同场景 ${ids.length} 个（${f(secs(C) / 60)} 分钟）\n不许变差：`);
must('突变合计/分钟', perMin(C, G), perMin(B, G), 0.5);
for (const g of G) must('  ' + g + '/分钟', perMin(C, [g]), perMin(B, [g]), g === '手臂' ? 0.6 : 0.4);
for (const id of ids) { const c = count(C, id), b = count(B, id); if (c > b + 2) { bad++; console.log('  不过  场景 ' + id + '：突变 ' + c + ' 次，基线 ' + b + ' 次（最多多 2 次）'); } }
must('雪杖穿腿', clip(C, /^雪杖[LR]×(大腿|小腿)/), clip(B, /^雪杖[LR]×(大腿|小腿)/), 0.5, '%');
must('雪杖穿躯干', clip(C, /^雪杖[LR]×(躯干|胸|头)/), clip(B, /^雪杖[LR]×(躯干|胸|头)/), 0.2, '%');
must('手或前臂穿身体', clip(C, /^(手|前臂)[LR]×/), clip(B, /^(手|前臂)[LR]×/), 0.3, '%');
must('两腿互穿', clip(C, /^(大腿L×大腿R|小腿L×小腿R|两膝)/), clip(B, /^(大腿L×大腿R|小腿L×小腿R|两膝)/), 0.3, '%');
must('杖尖入雪', clip(C, /^杖尖[LR]入雪/), clip(B, /^杖尖[LR]入雪/), 0.3, '%');
must('板尖入雪', clip(C, /^板尖入雪/), clip(B, /^板尖入雪/), 0.2, '%');
must('板尾入雪', clip(C, /^板尾入雪/), clip(B, /^板尾入雪/), 0.5, '%');
must('小腿侧歪 p99', boot(C, 'latP99'), boot(B, 'latP99'), 1, '°');
must('两膝外撇 p99', boot(C, 'splayP99'), boot(B, 'splayP99'), 2, '°');
console.log('目标：');
goal('突变合计/分钟', perMin(C, G), 10); goal('躯干+头/分钟', perMin(C, ['躯干', '头']), 0.6);
goal('雪杖穿腿', clip(C, /^雪杖[LR]×(大腿|小腿)/), 2, '%'); goal('小腿侧歪 p99', boot(C, 'latP99'), 10, '°'); goal('两膝外撇 p99', boot(C, 'splayP99'), 15, '°');
if (C.keys_mid) { const ch = C.keys_mid.coord.change, e0 = ch.reduce((s, x) => s + Math.abs(x.edge0), 0) / Math.max(1, ch.length); goal('换刃时刃残留', e0, 5, '°'); const tr = C.keys_mid.turns.mean.trunkRoll; if (tr) goal('进弯 1/8 上身侧倾', tr[4], 20, '°'); }
console.log(bad ? `\n没过：${bad} 条变差了` : '\n通过：没有一条变差');
process.exit(bad ? 1 : 0);
