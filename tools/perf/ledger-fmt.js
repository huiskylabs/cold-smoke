// 把 ledger.js 的 JSON 整理成表。用法: node ledger-fmt.js out.json [帧号=3]
const fs = require('fs'); const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), fi = +(process.argv[3] || d.frames.length - 1), f = d.frames[fi];
console.log('query:', d.query, '| render', d.state.W + 'x' + d.state.H, '| tier', d.state.tier, 'shadow', d.state.shadowRes, 'blur', d.state.blur, 'bloom', d.state.bloom);
console.log('caps:', JSON.stringify(d.caps)); console.log('boot ms:', Math.round(d.boot.ms), d.bootLog.join(' | '));
let td = 0, tt = 0, tp = 0;
console.log('\n#pass  target                      draws   tris      各 draw（管线 ×次数: 三角形 / 实例）');
for (const p of f.passes) {
  const g = {}; for (const x of p.draws) { const e = g[x.name] || (g[x.name] = { n: 0, tris: 0, inst: 0 }); e.n++; e.tris += x.tris; e.inst += x.inst; }
  const tris = p.draws.reduce((s, x) => s + x.tris, 0); td += p.draws.length; tt += tris; tp++;
  console.log(String(p.n % 1000).padStart(4), (p.fmt + ' ' + p.w + 'x' + p.h).padEnd(28), String(p.draws.length).padStart(4), String(Math.round(tris)).padStart(8), ' ', Object.entries(g).map(([n, e]) => n + '×' + e.n + ':' + Math.round(e.tris) + (e.inst > e.n ? '/' + e.inst : '')).join(', '));
}
console.log('\n合计: passes', tp, 'draws', td, 'tris', Math.round(tt), '| 上传: tex', f.up.texBytes, 'B /', f.up.texCalls, '次, buf', f.up.bufBytes, 'B /', f.up.bufCalls, '次, globals', f.up.globCalls);
console.log('各帧: ' + d.frames.map(x => 'draws ' + x.passes.reduce((s, p) => s + p.draws.length, 0) + ' tris ' + Math.round(x.passes.reduce((s, p) => s + p.draws.reduce((a, b) => a + b.tris, 0), 0)) + ' texUp ' + x.up.texBytes + ' bufUp ' + x.up.bufBytes).join(' | '));
console.log('\n资源: 纹理', d.res.nTex, '张', (d.res.texBytes / 1048576).toFixed(1), 'MiB; 缓冲', d.res.nBuf, '个', (d.res.bufBytes / 1048576).toFixed(1), 'MiB');
for (const [k, v] of Object.entries(d.res.texByKind).sort((a, b) => b[1].bytes - a[1].bytes)) console.log('  ', k.padEnd(26), '×' + v.n, (v.bytes / 1048576).toFixed(2), 'MiB');
console.log('\n管线', d.res.pipes.length, '条; 编译(创建+完成) ms 合计', d.res.pipes.reduce((s, p) => s + p.create + p.finish, 0).toFixed(0));
for (const p of d.res.pipes.slice().sort((a, b) => (b.create + b.finish) - (a.create + a.finish)).slice(0, 14)) console.log('  ', p.name.padEnd(18), 'create', p.create, 'finish', p.finish, 'vs', p.vs, 'fs', p.fs, 'uniforms', p.nu, 'tex', p.ntex);
console.log('trees:', JSON.stringify(d.state.treeStats), 'heap', d.state.heap);
