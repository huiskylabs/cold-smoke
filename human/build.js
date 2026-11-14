// builds the human lab: human/src/*.js (sorted) + lab/lab.js into one self-contained page, human/dist/lab.html
const fs = require('fs'), path = require('path');
const root = __dirname, src = path.join(root, 'src');
let js = '';
for (const f of fs.readdirSync(src).filter(f => f.endsWith('.js')).sort()) js += '\n// ===== human/src/' + f + ' =====\n' + fs.readFileSync(path.join(src, f), 'utf8');
js += '\n// ===== human/lab/lab.js =====\n' + fs.readFileSync(path.join(root, 'lab', 'lab.js'), 'utf8');
const tpl = fs.readFileSync(path.join(root, 'lab', 'lab.html'), 'utf8');
const out = tpl.replace('/*__JS__*/', () => js);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'lab.html'), '<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + out + '</body></html>');
// the page alone (an artifact host adds its own document skeleton)
fs.writeFileSync(path.join(root, 'dist', 'lab_page.html'), out);
// the module alone (for other pages / games): everything under the one global Human
const mod = fs.readdirSync(src).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(src, f), 'utf8')).join('\n');
fs.writeFileSync(path.join(root, 'dist', 'human.js'), mod);
console.log('built human/dist/lab.html', (out.length / 1024).toFixed(1) + ' KB');
