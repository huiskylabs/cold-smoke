// 雪包上谁在颠：脚、骨盆、头在世界里的高度，去掉 1.5 Hz 以下的慢变化之后还剩多少起伏（毫米，均方根，只算在雪上的帧）；
// 以及膝的弯曲比“参照构建”晚多少毫秒。腿要是把雪包全吸收掉，骨盆和头的起伏应当远小于脚的。
//   node bob.js <参照构建> <构建>[,<构建>...] <场景>[,<场景>...]
const A = require('./analyze.js'), fs = require('fs'), path = require('path'), v = A.v;
const [ref, builds, scs] = process.argv.slice(2);
const rec = (b, s) => { const f = path.join(__dirname, 'out', b, s + '.json'); return fs.existsSync(f) ? A.load(f) : null; };
const W3 = (d, i, k) => { const r = d.root[i], p = r[0], nn = v.norm(r[2]), Z0 = v.mul(r[1], -1), X = v.norm(v.cross(nn, Z0)), Z = v.cross(X, nn), q = d.j(k, i); return p[1] + X[1] * q[0] + nn[1] * q[1] + Z[1] * q[2]; };
const hp = (d, k) => { const x = []; for (let i = 0; i < d.n; i++) x.push(k === 'feet' ? 0.5 * (W3(d, i, 'ankleL') + W3(d, i, 'ankleR')) : W3(d, i, k)); const lp = A.lowpass(x, 1.5); return x.map((q, i) => (q - lp[i]) * 1000); };
for (const s of scs.split(',')) {
  const r = rec(ref, s); if (!r) continue; const Sr = A.series(r); console.log(s);
  for (const b of [ref].concat(builds.split(','))) { const d = rec(b, s); if (!d) continue; const S = A.series(d), ok = i => i > 120 && i < d.n - 60 && !(d.flag[i] & 1) && (d.flag[i] & 2);
    const R = k => A.rms(hp(d, k).filter((q, i) => ok(i))), lag = b === ref ? 0 : A.xlag(Sr.deg.kneeL, S.deg.kneeL, 20).lag * 1000;
    const kw = S.deg.kneeL.map((q, i) => i ? Math.abs(q - S.deg.kneeL[i - 1]) * 60 : 0).filter((q, i) => ok(i));
    console.log('  ' + b.padEnd(9), '脚', R('feet').toFixed(0).padStart(4), ' 骨盆', R('pelvis').toFixed(0).padStart(4), ' 头', R('head').toFixed(0).padStart(4), ' mm ｜ 膝比参照晚', lag.toFixed(0).padStart(4), 'ms ｜ 膝角速度 p99', A.pct(kw, 0.99).toFixed(0).padStart(5), '°/s'); }
}
