// 每一次落地的数字：触雪速度、膝从多弯到多弯、用了多久到最弯、之后回弹多少、板尖翘多高、板尾扎多深。
//   node land.js <录制目录> [最小触雪速度=2]
const A = require('./analyze.js'), fs = require('fs'), path = require('path');
function landings(dir, vmin = 2) { const rows = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const d = A.load(path.join(dir, f)), S = A.series(d), n = d.n, fps = 60;
  for (let i = 1; i < n; i++) if ((d.flag[i - 1] & 1) && !(d.flag[i] & 1)) {
    const lv = d.s('landV', i); if (!(lv >= vmin)) continue;
    let air = 0; for (let j = i - 1; j >= 0 && (d.flag[j] & 1); j--) air++;
    const kn = j => 0.5 * (S.deg.kneeL[j] + S.deg.kneeR[j]); const k0 = kn(i - 1);
    let kp = -1, ip = i, tipMax = 0, tailMin = 9, again = false;
    for (let j = i; j < Math.min(n, i + 36); j++) { if (d.flag[j] & 1) { again = true; break; } if (kn(j) > kp) { kp = kn(j); ip = j; } }
    for (let j = Math.max(0, i - 6); j < Math.min(n, i + 36); j++) { tipMax = Math.max(tipMax, d.p('tipL', j), d.p('tipR', j)); if (j >= i && !(d.flag[j] & 1)) tailMin = Math.min(tailMin, d.skis[j][0], d.skis[j][2]); }
    let kMinAfter = kp; for (let j = ip; j < Math.min(n, ip + 48); j++) { if (d.flag[j] & 1) break; kMinAfter = Math.min(kMinAfter, kn(j)); }
    rows.push({ sc: d.id, t: d.t[i], air: air / fps, lv, k0, kp, tp: (ip - i) / fps, reb: kp - kMinAfter, tip: tipMax * 180 / Math.PI, tail: tailMin, again });
  }
}
rows.sort((a, b) => a.lv - b.lv); return rows; }
module.exports = { landings };
if (require.main !== module) return;
const rows = landings(process.argv[2], +(process.argv[3] || 2));
console.log('场景              时刻   腾空s 触雪m/s  膝:触雪时→最弯  到最弯s  之后伸回°  板尖最翘°  板尾最深mm');
for (const r of rows) console.log(r.sc.padEnd(16), r.t.toFixed(2).padStart(6), r.air.toFixed(2).padStart(6), r.lv.toFixed(1).padStart(6), ('   ' + r.k0.toFixed(0) + '→' + r.kp.toFixed(0)).padEnd(16), r.tp.toFixed(2).padStart(6), r.reb.toFixed(0).padStart(8), r.tip.toFixed(0).padStart(9), (r.tail < 0 ? (-r.tail * 1000).toFixed(0) : '0').padStart(10), r.again ? '（又离地）' : '');
const big = rows.filter(r => r.lv >= 4 && !r.again), m = (k) => big.reduce((s, r) => s + r[k], 0) / Math.max(1, big.length);
console.log(`\n触雪速度 ≥ 4 m/s 的 ${big.length} 次：膝 ${m('k0').toFixed(0)}° → ${m('kp').toFixed(0)}°，${m('tp').toFixed(2)} s 到最弯，之后伸回 ${m('reb').toFixed(0)}°，板尖最翘 ${m('tip').toFixed(0)}°，板尾最深 ${(-m('tail') * 1000).toFixed(0)} mm`);
console.log(`全部 ${rows.length} 次里，板尖翘过 15° 的 ${rows.filter(r => r.tip > 15).length} 次，板尾扎进雪里超过 150 mm 的 ${rows.filter(r => r.tail < -0.15).length} 次`);
