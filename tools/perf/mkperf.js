// 把 hook.js 拼进 dist/dev.html 的副本（tools/perf/tmp/dev-perf.html）。不改 src，不改 dist。
// 用法: node mkperf.js [源 html，默认 ../../dist/dev.html] [输出，默认 tmp/dev-perf.html]
const fs = require('fs'), path = require('path');
const src = path.resolve(process.argv[2] || path.join(__dirname, '../../dist/dev.html'));
const out = path.resolve(process.argv[3] || path.join(__dirname, 'tmp/dev-perf.html'));
let html = fs.readFileSync(src, 'utf8');
const tail = '\n})();\n</script>', k = html.lastIndexOf(tail);
if (k < 0) throw new Error('closure tail not found');
html = html.slice(0, k) + '\n' + fs.readFileSync(path.join(__dirname, 'hook.js'), 'utf8') + html.slice(k);
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html);
console.log('wrote', out, html.length);
