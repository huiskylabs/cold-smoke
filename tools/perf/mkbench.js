// 生成真机测量页 tmp/perf-bench.html：带钩子的游戏页（mkperf.js 的产物）+ bench-runner.js。不改 src，不改 dist。
// 用法: node mkperf.js && node mkbench.js
// 打开方式：直接打开 perf-bench.html 即可（页头的小脚本会自动补上需要的地址参数：?dev&manual&gov=0&backend=webgl2&bench）。
//   加 &quick 只跑一小遍（约 20 秒），加 &quality=2 之类可以强制画质档。
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, 'tmp/dev-perf.html'), out = path.join(__dirname, 'tmp/perf-bench.html');
let html = fs.readFileSync(src, 'utf8');
const head = `<meta name="robots" content="noindex"><script>if(!/[?&]manual\\b/.test(location.search)||!/[?&]bench\\b/.test(location.search)){var q=location.search.replace(/^\\?/,'');location.replace(location.pathname+'?dev&manual&gov=0&backend=webgl2&bench'+(q?'&'+q:''));}</script>`;
const i = html.indexOf('<head>'); if (i < 0) throw new Error('no <head>');
html = html.slice(0, i + 6) + head + html.slice(i + 6);
const k = html.lastIndexOf('</body>'); if (k < 0) throw new Error('no </body>');
html = html.slice(0, k) + '<script>\n' + fs.readFileSync(path.join(__dirname, 'bench-runner.js'), 'utf8') + '\n</script>' + html.slice(k);
fs.writeFileSync(out, html); console.log('wrote', out, html.length);
