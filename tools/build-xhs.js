// Builds the game as a 小红书 小工具 (Builder Hub → 小工具): an offline web package the app opens under a note.
// The container's rules (小工具容器能力清单, https://miniapp-sandbox.xiaohongshu.com/minitool/doc) differ from a normal page:
//   - scripts only as package .js files (no inline <script>, no onclick=, no eval / new Function / WebAssembly)
//   - no network at all: fonts and everything else ship in the zip
//   - the code must run on Chrome 61 / ES2017 (Android 8.1 WebView); iOS 18.4 and later
//   - file types: html css js png jpg gif webp svg woff woff2 json; one index.html at the root of the zip
// Output: dist-xhs/ (index.html, app.js, fonts/) and dist-xhs.zip.
// Run: node tools/build-xhs.js   (uses esbuild through npx for the syntax lowering; the first run downloads it)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..'), out = path.join(root, 'dist-xhs');
const SKIP = new Set(['20_director.js']);           // the trailer's director mode has no place in the package

// ---- the game's code, as build.js puts it together, minus the web-font fetcher (the faces ship in fonts/)
const files = fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.js') && !SKIP.has(f)).sort();
let js = '';
for (const f of files) js += '\n// ===== ' + f + ' =====\n' + fs.readFileSync(path.join(root, 'src', f), 'utf8');
const tpl = fs.readFileSync(path.join(root, 'template.html'), 'utf8');
const m = /<script>([\s\S]*)<\/script>\s*$/.exec(tpl.trimEnd());
if (!m) throw new Error('template.html: no closing <script> block');
let script = m[1];
const fontStart = script.indexOf('// type: fetched'), fontEnd = script.indexOf('/*__JS__*/');
if (fontStart < 0 || fontEnd < 0) throw new Error('template.html: font loader or /*__JS__*/ not found');
script = script.slice(0, fontStart) + script.slice(fontEnd);
script = script.replace('/*__JS__*/', () => js);
const polyfills = fs.readFileSync(path.join(root, 'xhs', 'polyfills.js'), 'utf8');

// ---- markup and style: the template without its script, its claude.ai meta, inside a whole document
let body = tpl.slice(0, m.index).replace(/<title>[\s\S]*?<\/title>\s*/, '').replace(/<meta name="claude:[^>]*>\s*/g, '');
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>雪迹 Cold Smoke</title>
<link rel="stylesheet" href="./fonts/fonts.css">
</head>
<body>
${body.trim()}
<script src="./app.js"></script>
</body>
</html>
`;

// ---- write, lower the syntax to Chrome 61, zip
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), html);
const raw = path.join(out, 'app.src.js');
fs.writeFileSync(raw, polyfills + '\n' + script);
execFileSync('npx', ['--yes', 'esbuild@0.24.2', raw, '--target=chrome61', '--minify', '--charset=utf8', '--legal-comments=none', '--outfile=' + path.join(out, 'app.js'), '--log-level=warning'], { stdio: 'inherit', cwd: root });
fs.unlinkSync(raw);
for (const f of fs.readdirSync(path.join(root, 'xhs', 'fonts'))) fs.copyFileSync(path.join(root, 'xhs', 'fonts', f), path.join(out, 'fonts', f));

// ---- the container's rules, checked on what is about to be zipped
const appJs = fs.readFileSync(path.join(out, 'app.js'), 'utf8'), problems = [];
if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(html)) problems.push('inline <script> in index.html');
if (/\son[a-z]+\s*=\s*["']/i.test(html)) problems.push('inline event handler in index.html');
if (/https?:\/\/(?!www\.w3\.org\/)/.test(html)) problems.push('external URL in index.html');
for (const [re, what] of [[/\beval\s*\(/, 'eval('], [/new\s+Function\s*\(/, 'new Function('], [/\bWebAssembly\b/, 'WebAssembly'], [/\bfetch\s*\(/, 'fetch('], [/XMLHttpRequest/, 'XMLHttpRequest'], [/new\s+WebSocket/, 'WebSocket'], [/fonts\.googleapis|fonts\.gstatic/, 'Google Fonts URL']])
  if (re.test(appJs)) problems.push('app.js uses ' + what);
const OK = /\.(html|css|js|png|jpe?g|gif|webp|svg|woff2?|json)$/i;
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(out)) if (!OK.test(f)) problems.push('file type not allowed: ' + path.relative(out, f));
if (problems.length) { console.error('小工具 rules broken:\n  ' + problems.join('\n  ')); process.exit(1); }

const zip = path.join(root, 'dist-xhs.zip'); fs.rmSync(zip, { force: true });
execFileSync('zip', ['-q', '-r', '-X', zip, '.', '-x', '.*'], { cwd: out });
const kb = n => (n / 1024).toFixed(0) + ' KB';
console.log('built dist-xhs/: index.html ' + kb(html.length) + ', app.js ' + kb(appJs.length) + '; dist-xhs.zip ' + kb(fs.statSync(zip).size), files.length, 'files');
