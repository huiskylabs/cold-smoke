// builds the human lab: human/src/*.js (sorted) + lab/lab.js into one self-contained page, human/dist/lab.html
const fs = require('fs'), path = require('path');
const root = __dirname, src = path.join(root, 'src');
let js = '';
for (const f of fs.readdirSync(src).filter(f => f.endsWith('.js')).sort()) js += '\n// ===== human/src/' + f + ' =====\n' + fs.readFileSync(path.join(src, f), 'utf8');
// the carved turn measured from real skiing video (data/mocap/turn_cycle_cc_slalom.json, CC BY 3.0, see data/mocap/CREDITS.md): only what the fit needs
const mc = JSON.parse(fs.readFileSync(path.join(root, '..', 'data', 'mocap', 'turn_cycle_cc_slalom.json'), 'utf8'));
const r3 = a => a.map(x => Array.isArray(x) ? r3(x) : Math.round(x * 1000) / 1000);
const mocap = '\n// ===== data/mocap (CC BY 3.0: jx3g4644, "Erika Terai als voorloper bij de slalom wedstrijd", Wikimedia Commons) =====\nHuman.MOCAP = { carve: ' + JSON.stringify({ phases: mc.phases, seconds: mc.meta.turn_seconds_median,
  hipLateral: r3(mc.hipLateral), hipHeight: r3(mc.hipHeight), twist: r3(mc.twist) }) + ' };\n';
js += mocap;
js += '\n// ===== human/lab/lab.js =====\n' + fs.readFileSync(path.join(root, 'lab', 'lab.js'), 'utf8');
const tpl = fs.readFileSync(path.join(root, 'lab', 'lab.html'), 'utf8');
const out = tpl.replace('/*__JS__*/', () => js);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'lab.html'), '<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + out + '</body></html>');
// the page alone (an artifact host adds its own document skeleton)
fs.writeFileSync(path.join(root, 'dist', 'lab_page.html'), out);
// the module alone (for other pages / games): everything under the one global Human
const mod = fs.readdirSync(src).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(src, f), 'utf8')).join('\n') + mocap;
fs.writeFileSync(path.join(root, 'dist', 'human.js'), mod);
console.log('built human/dist/lab.html', (out.length / 1024).toFixed(1) + ' KB');
