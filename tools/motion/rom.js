// 幅度尺：动作做得够不够大。analyze.js 那把尺只管“有没有人做不出来的快变化”（突变），不管动作是不是太小：
// 落地只蹲一点、腿从来伸不直，在那把尺上都是满分。这把尺量每一类动作的幅度（膝、髋弯到多少度、髋升降多少），
// 和真人滑雪的测量范围对照。
//   node tools/motion/rom.js <录制目录> [<另一份录制目录，并排对比>] [--json 输出.json]
// 真人范围的出处：人体实验室的目标表（code-only-game-kit/research/human/data/targets/*.json，里面有每一条的文献），
// 这里只抄数字和文献名。可信度 M = 在滑雪高手或相近动作上测过，L = 从文献推出来的估计。角度都是屈曲角（0 = 伸直）。
const A = require('./analyze.js'), fs = require('fs'), path = require('path');
const args = process.argv.slice(2), jsonAt = args.indexOf('--json'), jsonOut = jsonAt >= 0 ? args[jsonAt + 1] : null;
const dirs = args.filter((a, i) => !a.startsWith('--') && (jsonAt < 0 || i !== jsonAt + 1));
const v = A.v, mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN;

// 每一条：名字、单位、真人范围 [lo, hi]、出处、可信度、怎么从录制里取（返回一组样本，表里报平均）
const T = [
  { g: '跳跃落地', id: '触雪那一刻的膝', u: '°', lo: 35, hi: 45, src: 'Heinrich 2014、2021；视频', conf: 'M', k: 'tdKnee' },
  { g: '跳跃落地', id: '落地后膝最弯', u: '°', lo: 65, hi: 100, src: 'Heinrich 2014；Kurpiers 2020（17 米跳台）', conf: 'M', k: 'maxKnee' },
  { g: '跳跃落地', id: '膝一共多弯了', u: '°', lo: 30, hi: 65, src: '由上两条相减；Norcross 2013（30 厘米落下：23° 到 91°）', conf: 'L', k: 'dKnee' },
  { g: '跳跃落地', id: '髋降了多少', u: 'cm', lo: 17, hi: 32, src: '同上，按腿长换算', conf: 'L', k: 'dHip' },
  { g: '跳跃落地', id: '到最弯用时', u: 's', lo: 0.18, hi: 0.32, src: 'Heinrich 2021；Petrone 2017；Minetti 1998', conf: 'M', k: 'tMax', d: 2 },
  { g: '跳跃落地', id: '触雪那一刻的髋屈', u: '°', lo: 55, hi: 65, src: 'Heinrich 2021', conf: 'M', k: 'tdHip' },
  { g: '起跳', id: '离地那一刻的膝（按了跳的）', u: '°', lo: 5, hi: 50, src: 'McErlain-Naylor 2014（原地纵跳离地 6°）；Hu 2024（跳台滑雪离台 48°）；自由式跳台没有直接测量', conf: 'L', k: 'toKnee' },
  { g: '空中', id: '空中的膝（不做动作时）', u: '°', lo: 40, hi: 60, src: 'Heinrich 2014（估计）', conf: 'L', k: 'airKnee' },
  { g: '蘑菇', id: '膝最伸（伸进沟里）', u: '°', lo: 30, hi: 40, src: 'Kurpiers 2020；Arndt 1992', conf: 'M', k: 'mgKmin' },
  { g: '蘑菇', id: '膝最弯（吸收包顶）', u: '°', lo: 80, hi: 95, src: 'Kurpiers 2020；Arndt 1992', conf: 'M', k: 'mgKmax' },
  { g: '蘑菇', id: '膝的幅度', u: '°', lo: 45, hi: 60, src: 'Kurpiers 2020；Riku 2007', conf: 'M', k: 'mgKrange' },
  { g: '蘑菇', id: '髋屈最大', u: '°', lo: 95, hi: 110, src: 'Kurpiers 2020；Arndt 1992', conf: 'M', k: 'mgHmax' },
  { g: '蘑菇', id: '髋高的幅度（占腿长）', u: '', lo: 0.3, hi: 0.6, src: 'Ikegami 1987；Bahr 2009', conf: 'L', k: 'mgHipH', d: 2 },
  { g: '转弯', id: '外腿最伸的时候（换刃前后）', u: '°', lo: 25, hi: 50, src: 'Alhammoud 2020；Fasel 2018；Zorko 2015；视频', conf: 'L', k: 'ctKOmin' },
  { g: '转弯', id: '外腿在弯中', u: '°', lo: 40, hi: 70, src: 'Zorko 2015；Heinrich 2022', conf: 'M', k: 'ctKO' },
  { g: '转弯', id: '内腿在弯中', u: '°', lo: 65, hi: 95, src: 'Heinrich 2022；Alhammoud 2020', conf: 'M', k: 'ctKI' },
  { g: '转弯', id: '换刃时髋到脚的距离（占腿长）', u: '', lo: 0.82, hi: 1, src: '视频；Fasel 2017', conf: 'M', k: 'ctHAchg', d: 2 },
  { g: '转弯', id: '弯中髋到脚的距离（占腿长）', u: '', lo: 0.76, hi: 0.9, src: '视频', conf: 'M', k: 'ctHAapex', d: 2 },
  { g: '转弯', id: '弯中外腿比内腿长（占腿长）', u: '', lo: 0.1, hi: 0.3, src: 'Fasel 2017（推算）', conf: 'L', k: 'ctLegDiff', d: 2 },
];

function measure(dir) {
  const M = {}; for (const t of T) M[t.k] = [];
  const land = [];      // 每一次落地，另外按触雪速度分档
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_')).sort()) {
    const d = A.load(path.join(dir, f)), S = A.series(d), n = d.n, L = d.LEN, leg = L.thigh + L.shin;
    const kn = i => 0.5 * (S.deg.kneeL[i] + S.deg.kneeR[i]), hf = i => 0.5 * (S.deg.hipFlexL[i] + S.deg.hipFlexR[i]);
    const legLen = (sd, i) => v.len(v.sub(d.j('hip' + sd, i), d.j('ankle' + sd, i)));
    const hv = i => v.sub(v.mul(v.add(d.j('hipL', i), d.j('hipR', i)), 0.5), v.mul(v.add(d.j('ankleL', i), d.j('ankleR', i)), 0.5));
    const hipUp = i => v.dot(hv(i), d.root[i][2]);          // 髋在两踝中点上方多高（沿雪面法线）
    const air = i => d.flag[i] & 1, own = i => d.fl[i][11];
    // ---- 落地：腾空 0.3 秒以上，落地后 0.6 秒内没有再离地
    for (let i = 1; i < n; i++) if (air(i - 1) && !air(i)) {
      let a = 0; for (let j = i - 1; j >= 0 && air(j); j--) a++; if (a < 18) continue;
      let again = false, kp = -1, ip = i, hmin = 9; for (let j = i; j < Math.min(n, i + 48); j++) { if (air(j)) { if (j < i + 36) again = true; break; } if (kn(j) > kp) { kp = kn(j); ip = j; } hmin = Math.min(hmin, hipUp(j)); }
      if (again) continue;
      const r = { sc: d.id, t: d.t[i], air: a / 60, lv: d.s('landV', i), td: kn(i - 1), max: kp, dHip: (hipUp(i - 1) - hmin) * 100, tMax: (ip - i) / 60, tdHip: hf(i - 1) };
      land.push(r); M.tdKnee.push(r.td); M.maxKnee.push(r.max); M.dKnee.push(r.max - r.td); M.dHip.push(r.dHip); M.tMax.push(r.tMax); M.tdHip.push(r.tdHip);
    }
    // ---- 起跳：按了跳（蓄力过半）之后离地、腾空 0.3 秒以上的那几次，离地那一帧的膝
    for (let i = 40; i < n; i++) if (!air(i - 1) && air(i)) {
      let a = 0; for (let j = i; j < n && air(j); j++) a++; if (a < 18) continue;
      let chg = 0; for (let j = i - 40; j < i; j++) chg = air(j) ? 0 : Math.max(chg, d.s('charge', j));
      if (chg > 0.5) M.toKnee.push(kn(i));
    }
    // ---- 空中：腾空超过 0.3 秒的那几段里，不做动作的帧
    for (let i = 0; i < n; i++) if (air(i) && own(i) < 0.05 && d.s('airT', i) > 0.3) M.airKnee.push(kn(i));
    // ---- 蘑菇：整段在雪上的帧里取 5% 和 95% 分位
    if (/^moguls/.test(d.id)) { const ix = []; for (let i = 180; i < n; i++) if (!air(i) && !(d.s('crash', i) > 0)) ix.push(i);
      const K = ix.map(kn), H = ix.map(hf), HH = ix.map(i => hipUp(i) / leg);
      M.mgKmin.push(A.pct(K, 0.05)); M.mgKmax.push(A.pct(K, 0.95)); M.mgKrange.push(A.pct(K, 0.95) - A.pct(K, 0.05)); M.mgHmax.push(A.pct(H, 0.95)); M.mgHipH.push(A.pct(HH, 0.95) - A.pct(HH, 0.05)); }
    // ---- 转弯：中弯、大弯、连续转向、粉雪、原山（小回转的节奏和这几条真人数据不是一回事，不算）
    if (['keys_mid', 'keys_long', 'touch_sine', 'powder', 'pilot'].includes(d.id)) for (const t of A.turns(d, S).list) {
      const O = t.side > 0 ? 'L' : 'R', I = t.side > 0 ? 'R' : 'L', n1 = t.i1 - t.i0, at = (a, b) => { const o = []; for (let i = t.i0 + Math.round(n1 * a); i < t.i0 + Math.round(n1 * b); i++) o.push(i); return o; };
      const apex = at(0.375, 0.625), all = at(0, 1), chg = at(0, 0.06).concat(at(0.94, 1)), haF = i => { const h = hv(i); return Math.hypot(h[0], h[1]) / leg; };
      M.ctKOmin.push(Math.min(...all.map(i => S.deg['knee' + O][i]))); M.ctKO.push(mean(apex.map(i => S.deg['knee' + O][i]))); M.ctKI.push(mean(apex.map(i => S.deg['knee' + I][i])));
      M.ctHAchg.push(mean(chg.map(haF))); M.ctHAapex.push(mean(apex.map(haF))); M.ctLegDiff.push(mean(apex.map(i => (legLen(O, i) - legLen(I, i)) / leg)));
    }
  }
  const out = {}; for (const t of T) out[t.k] = { mean: mean(M[t.k]), n: M[t.k].length, in: M[t.k].filter(x => x >= t.lo && x <= t.hi).length };
  out._land = land; return out;
}

const R = dirs.map(measure), f = (x, d = 0) => isNaN(x) ? '  -' : x.toFixed(d);
const verdict = (t, x) => isNaN(x) ? '没有样本' : x < t.lo ? '偏小' : x > t.hi ? '偏大' : '在范围里';
console.log(dirs.map((d, i) => `${'AB'[i]} = ${d}`).join('\n') + '\n');
console.log('类别      量                                真人范围          ' + R.map((_, i) => `${'AB'[i]} 平均（判定，落在范围里的次数）`.padEnd(34)).join('') + '出处');
let g0 = '';
for (const t of T) {
  const cells = R.map(r => { const m = r[t.k]; return `${f(m.mean, t.d || 0)}${t.u}  ${verdict(t, m.mean)}  ${m.in}/${m.n}`.padEnd(34); }).join('');
  console.log((t.g === g0 ? '' : t.g).padEnd(8) + '  ' + t.id.padEnd(22) + '  ' + `${t.lo}–${t.hi}${t.u}（${t.conf}）`.padEnd(16) + '  ' + cells + t.src); g0 = t.g;
}
// 落地按触雪速度分档（同一个跳台，落在顺坡上触雪速度小，落在平地上大）
console.log('\n落地按“冲进雪面的速度”分档：膝 触雪 → 最弯，髋降，次数');
for (const [name, lo, hi] of [['小于 3 m/s（相当于从 0.45 米以下落到平地）', 0, 3], ['3 到 5 m/s（0.45 到 1.3 米）', 3, 5], ['5 m/s 以上（1.3 米以上）', 5, 99]])
  console.log('  ' + name.padEnd(30) + R.map((r, i) => { const a = r._land.filter(x => x.lv >= lo && x.lv < hi); return `${'AB'[i]}  ${f(mean(a.map(x => x.td)))}° → ${f(mean(a.map(x => x.max)))}°，髋降 ${f(mean(a.map(x => x.dHip)))} cm，${a.length} 次`.padEnd(44); }).join(''));
const short = R.map(r => T.filter(t => verdict(t, r[t.k].mean) === '偏小').length), over = R.map(r => T.filter(t => verdict(t, r[t.k].mean) === '偏大').length);
console.log('\n' + R.map((r, i) => `${'AB'[i]}：${T.length} 条里 ${T.length - short[i] - over[i]} 条在真人范围里，${short[i]} 条偏小，${over[i]} 条偏大`).join('\n'));
// （--json：每一条的真人范围，和每份录制的平均值、样本数、落在范围里的次数；runs 的顺序就是命令行上目录的顺序）
if (jsonOut) { const o = {}; for (const t of T) o[t.id] = { group: t.g, unit: t.u, lo: t.lo, hi: t.hi, conf: t.conf, runs: R.map(r => ({ mean: r[t.k].mean, n: r[t.k].n, in: r[t.k].in })) }; fs.writeFileSync(jsonOut, JSON.stringify(o)); }
