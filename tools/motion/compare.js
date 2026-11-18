// 几个版本并排比：读 analyze.js --json 的输出，对它们共有的场景列出每分钟突变次数、靴内侧歪、八字、穿模。
//   node tools/motion/compare.js 名字=summary.json 名字=summary.json ...
const fs = require('fs');
const sets = process.argv.slice(2).map(a => { const [n, f] = a.split('='); return { n, d: JSON.parse(fs.readFileSync(f, 'utf8')) }; });
const ids = Object.keys(sets[0].d).filter(id => sets.every(s => s.d[id]));
const G = ['腿', '躯干', '头', '手臂', '雪杖', '雪板', '整体朝向'], f1 = (x, k = 1) => (+x).toFixed(k);
const row = (label, fn, k = 1) => console.log('  ' + label.padEnd(14) + sets.map(s => f1(fn(s.d), k).padStart(10)).join(''));
console.log('场景: ' + ids.join(', ') + '\n' + ''.padEnd(16) + sets.map(s => s.n.padStart(10)).join(''));
const mins = d => ids.reduce((a, id) => a + d[id].secs / 60, 0);
console.log('每分钟突变次数（按时长加权）');
for (const g of G) row(g, d => ids.reduce((a, id) => a + d[id].groups[g] * d[id].secs / 60, 0) / mins(d));
row('合计', d => ids.reduce((a, id) => a + G.reduce((b, g) => b + d[id].groups[g], 0) * d[id].secs / 60, 0) / mins(d));
console.log('小腿在靴子里（度，各场景里最差的）');
row('侧歪 p99', d => Math.max(...ids.map(id => d[id].coord.boot.latP99))); row('侧歪 最大', d => Math.max(...ids.map(id => d[id].coord.boot.latMax)));
row('八字 p99', d => Math.max(...ids.map(id => d[id].coord.boot.splayP99))); row('八字 最大', d => Math.max(...ids.map(id => d[id].coord.boot.splayMax)));
console.log('穿模（帧占比 %）');
const keys = [...new Set(sets.flatMap(s => ids.flatMap(id => Object.keys(s.d[id].clip).filter(k => s.d[id].clip[k].frames).map(k => k.replace(/[LR]/g, '')))))];
for (const k of keys) row(k, d => { let fr = 0, n = 0; for (const id of ids) { n += d[id].secs * 60; for (const kk in d[id].clip) if (kk.replace(/[LR]/g, '') === k) fr += d[id].clip[kk].frames; } return 100 * fr / n; }, 2);
console.log('换刃（keys_mid）');
if (ids.includes('keys_mid')) { const m = (d, k) => { const c = d.keys_mid.coord.change; return c.reduce((s, x) => s + x[k], 0) / Math.max(1, c.length); }; row('刃残留 °', d => m(d, 'edge0')); row('时长 s', d => m(d, 'dur'), 2); }
console.log('各场景合计/分钟');
for (const id of ids) row(id, d => G.reduce((b, g) => b + d[id].groups[g], 0));
