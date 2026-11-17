// 上身和头稳不稳：躯干侧倾、头的侧歪（两眼连线离水平多少度）、头转向，各自的幅度和角速度；
// 再按转弯周期（0、1/8 … 1）列出躯干侧倾和头侧歪的平均值。只算在雪上、没撞、没撑杖的帧。
//   node upper.js <构建>[,<构建>...] <场景>[,<场景>...]
const A = require('./analyze.js'), fs = require('fs'), path = require('path');
const [builds, scs] = process.argv.slice(2), R2D = 180 / Math.PI, f0 = x => (+x).toFixed(0);
for (const sc of scs.split(',')) {
  console.log(sc);
  for (const b of builds.split(',')) {
    const f = path.join(__dirname, 'out', b, sc + '.json'); if (!fs.existsSync(f)) continue;
    const d = A.load(f), S = A.series(d), n = d.n, ok = i => i > 180 && i < n - 30 && !(d.flag[i] & 1) && (d.flag[i] & 2) && d.s('crash', i) <= 0 && d.p('dp', i) <= 0;
    const hroll = d.bas.map(B => Math.atan2(B[5][1], Math.hypot(B[5][0], B[5][2])) * R2D);
    const sp = x => x.map((q, i) => i ? Math.abs(q - x[i - 1]) * 60 : 0), pick = x => x.filter((q, i) => ok(i));
    const rng = x => f0(A.pct(pick(x), 0.05)).padStart(4) + '..' + f0(A.pct(pick(x), 0.95)).padEnd(3), p99 = x => f0(A.pct(pick(sp(x)), 0.99)).padStart(4);
    const quiet = pick(d.P.map(r => r[d.PK.indexOf('quiet')])), qm = quiet.reduce((s, x) => s + x, 0) / Math.max(1, quiet.length);
    console.log('  ' + b.padEnd(8), '躯干侧倾', rng(S.deg.trunkRoll), '° 角速度 p99', p99(S.deg.trunkRoll), '°/s ｜头侧歪', rng(hroll), '° 角速度 p99', p99(hroll), '°/s ｜头转向 角速度 p99', p99(S.deg.headYaw), '°/s ｜安静系数平均', qm.toFixed(2));
    // 转弯周期里的头侧歪（朝弯内为正）
    const tr = A.turns(d, S); if (tr.list.length >= 4) { const N = tr.N, hr = new Array(9).fill(0);
      for (const t of tr.list) for (let k = 0; k < 9; k++) { const fi = t.i0 + (t.i1 - t.i0) * k / 8, a = Math.min(Math.floor(fi), n - 2); hr[k] += -t.side * hroll[a] / tr.list.length; }
      const at = q => [0, 4, 8, 12, 16, 20, 24, 28, 32].map(k => f0(tr.mean[q][k])).join('/');
      console.log('           转弯周期（每 1/8）：躯干侧倾 ' + at('trunkRoll') + ' ｜头侧歪 ' + hr.map(f0).join('/') + ' ｜身体内倾 ' + at('incl')); }
  }
}
