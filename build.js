// concatenates src/*.js (sorted) + template into dist/index.html (single self-contained page)
const fs = require('fs'), path = require('path');
const root = __dirname, srcDir = path.join(root, 'src');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js')).sort();
let js = '';
for (const f of files) js += '\n// ===== ' + f + ' =====\n' + fs.readFileSync(path.join(srcDir, f), 'utf8');
const tpl = fs.readFileSync(path.join(root, 'template.html'), 'utf8');
const out = tpl.replace('/*__JS__*/', () => js);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'index.html'), out);
// dev variant with a full html skeleton (the artifact host adds its own)
fs.writeFileSync(path.join(root, 'dist', 'dev.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + out + '</body></html>');
console.log('built', (out.length / 1024).toFixed(1) + ' KB', files.length, 'files');
