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
// code marked /*web{*/ … /*}web*/ in src/ (device orientation, asking for the whole screen) is left out: the container forbids it
{ const n = (script.match(/\/\*web\{\*\//g) || []).length; script = script.replace(/\/\*web\{\*\/[\s\S]*?\/\*\}web\*\//g, ''); if (/web\{|\}web/.test(script)) throw new Error('unbalanced /*web{*/ markers'); console.log('left out', n, 'web-only blocks'); }
const polyfills = fs.readFileSync(path.join(root, 'xhs', 'polyfills.js'), 'utf8');

// ---- markup and style: the template without its script, its claude.ai meta, inside a whole document
let body = cssFallbacks(tpl.slice(0, m.index)).replace(/<title>[\s\S]*?<\/title>\s*/, '').replace(/<meta name="claude:[^>]*>\s*/g, '');
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

// Chrome 61 drops a declaration it cannot parse (clamp(), min(), max(), inset), so each gets a plain value it can read:
//   clamp(a, b, c) reads as b, max(a, b, …) as its first argument that is not 0, min(…) as its last
//   - an ordinary property gets the plain declaration in front of the modern one, which newer engines then take
//   - a custom property (--x) cannot work that way (Chrome 61 keeps the modern text and every var(--x) using it fails), so its plain value
//     is written in place and the modern one is set again inside @supports (width: clamp(1px, 2px, 3px)), under the same selector
//   - inset gets top / right / bottom / left in front of it
function plainValue(v) {
  const re = /\b(clamp|min|max)\(/; let m, guard = 0;
  while ((m = re.exec(v)) && guard++ < 200) {
    let i = m.index + m[0].length, depth = 1, args = [], cur = '';
    for (; i < v.length && depth; i++) {
      const ch = v[i];
      if (ch === '(') depth++; else if (ch === ')') { depth--; if (!depth) break; }
      if (ch === ',' && depth === 1) { args.push(cur.trim()); cur = ''; } else cur += ch;
    }
    args.push(cur.trim()); args = args.map(plainValue);
    const fn = m[1], pick = fn === 'clamp' ? args[1] : fn === 'min' ? args[args.length - 1] : (args.find(x => x !== '0') || args[0]);
    v = v.slice(0, m.index) + pick + v.slice(i + 1);
  }
  return v;
}
function cssFallbacks(markup) {
  return markup.replace(/<style>([\s\S]*?)<\/style>/, (all, css) => {
    let out = '', i = 0, stack = [], prelude = '', later = [];
    const MODERN = /\b(clamp|min|max)\(/;
    // walk the sheet: preludes of the blocks we are in, declarations inside rule blocks
    while (i < css.length) {
      const ch = css[i];
      if (css.startsWith('/*', i)) { const e = css.indexOf('*/', i + 2); out += css.slice(i, e + 2); i = e + 2; continue; }
      if (ch === '{') { stack.push(prelude.trim()); out += prelude + '{'; prelude = ''; i++; continue; }
      if (ch === '}') { out += prelude + '}'; prelude = ''; stack.pop(); i++; continue; }
      const inRule = stack.length && !stack[stack.length - 1].startsWith('@');
      if (inRule && ch === ';') { out += prelude + ';'; prelude = ''; i++; continue; }
      if (inRule && ch !== ';') {
        // one declaration, up to ; or }
        let j = i; while (j < css.length && css[j] !== ';' && css[j] !== '}') j++;
        const decl = css.slice(i, j), dm = /^(\s*)([a-zA-Z-]+)\s*:\s*([\s\S]*?)\s*$/.exec(decl);
        if (dm) {
          const [, ws, prop, val] = dm;
          if (prop === 'inset' && !/\(/.test(val)) { const v = val.split(/\s+/), [t, r = t, b = t, l = r] = v; out += `${ws}top: ${t}; right: ${r}; bottom: ${b}; left: ${l}; inset: ${val}`; }
          else if (MODERN.test(val) && prop.startsWith('--')) { out += `${ws}${prop}: ${plainValue(val)}`; later.push({ ctx: stack.slice(), decl: `${prop}: ${val}` }); }
          else if (MODERN.test(val)) out += `${ws}${prop}: ${plainValue(val)}; ${prop}: ${val}`;
          else out += decl;
        } else out += decl;
        i = j; continue;
      }
      prelude += ch; i++;
      if (!inRule && ch === ';') { out += prelude; prelude = ''; }
    }
    out += prelude;
    if (later.length) {
      out += '\n@supports (width: clamp(1px, 2px, 3px)) {\n';
      for (const l of later) { let open = '', close = ''; for (const c of l.ctx) { open += c + ' { '; close += ' }'; } out += '  ' + open + l.decl + ';' + close + '\n'; }
      out += '}\n';
    }
    return '<style>' + out + '</style>';
  });
}

// ---- write, lower the syntax to Chrome 61, zip
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), html);
const raw = path.join(out, 'app.src.js');
// (which build this is, shown small under 设置 so a phone can tell which package it is running: the date and the commit)
let stamp = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') + ' (北京时间)';
try { stamp += ' · ' + require('child_process').execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim(); } catch (e) { }
fs.writeFileSync(raw, polyfills + '\nself.COLD_SMOKE.build = ' + JSON.stringify(stamp) + ';\n' + script);
execFileSync('npx', ['--yes', 'esbuild@0.24.2', raw, '--target=chrome61', '--minify', '--charset=utf8', '--legal-comments=none', '--outfile=' + path.join(out, 'app.js'), '--log-level=warning'], { stdio: 'inherit', cwd: root });
fs.unlinkSync(raw);
for (const f of fs.readdirSync(path.join(root, 'xhs', 'fonts'))) fs.copyFileSync(path.join(root, 'xhs', 'fonts', f), path.join(out, 'fonts', f));

// ---- the container's rules, checked on what is about to be zipped
const appJs = fs.readFileSync(path.join(out, 'app.js'), 'utf8'), problems = [];
if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(html)) problems.push('inline <script> in index.html');
if (/<(iframe|object|base|form)\b|target=["']_blank|\sdownload[\s>=]|http-equiv/i.test(html)) problems.push('iframe / object / base / form / _blank / download / CSP meta in index.html');
if (/\son[a-z]+\s*=\s*["']/i.test(html)) problems.push('inline event handler in index.html');
if (/https?:\/\/(?!www\.w3\.org\/)/.test(html)) problems.push('external URL in index.html');
for (const [re, what] of [[/\beval\s*\(/, 'eval('], [/new\s+Function\s*\(/, 'new Function('], [/\bWebAssembly\b/, 'WebAssembly'], [/\bfetch\s*\(/, 'fetch('], [/XMLHttpRequest/, 'XMLHttpRequest'], [/new\s+WebSocket/, 'WebSocket'], [/fonts\.googleapis|fonts\.gstatic/, 'Google Fonts URL'],
  [/deviceorientation|DeviceOrientationEvent|devicemotion|DeviceMotionEvent/, 'device orientation / motion'], [/requestFullscreen/, 'requestFullscreen'], [/new\s+(Shared)?Worker\s*\(|serviceWorker/, 'Worker'],
  [/navigator\.geolocation|navigator\.clipboard|execCommand\(/, 'geolocation / clipboard'], [/window\.open\s*\(|\bprompt\s*\(/, 'window.open / prompt'], [/new\s+(EventSource|RTCPeerConnection)/, 'EventSource / WebRTC'], [/type=["']module/, 'module script']])
  if (re.test(appJs)) problems.push('app.js uses ' + what);
const OK = /\.(html|css|js|png|jpe?g|gif|webp|svg|woff2?|json)$/i;
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(out)) if (!OK.test(f)) problems.push('file type not allowed: ' + path.relative(out, f));
if (problems.length) { console.error('小工具 rules broken:\n  ' + problems.join('\n  ')); process.exit(1); }

const zip = path.join(root, 'dist-xhs.zip'); fs.rmSync(zip, { force: true });
execFileSync('zip', ['-q', '-r', '-X', zip, '.', '-x', '.*'], { cwd: out });
const kb = n => (n / 1024).toFixed(0) + ' KB';
console.log('built dist-xhs/: index.html ' + kb(html.length) + ', app.js ' + kb(appJs.length) + '; dist-xhs.zip ' + kb(fs.statSync(zip).size), files.length, 'files');
