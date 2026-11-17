// 人物实验室（雪迹人物）: the game's own skier, built by the game's own code (src/08_skier.js and what it needs), in a page of its own where it can be
// turned round and looked at from a hand's breadth away, in the game's poses. No terrain, no game: a lit figure on a patch of snow.
//   node tools/skierlab/build.js [out.html]      (default dist/skierlab.html)
// The shading here is plain (colours per garment, sun + sky + the mesh's own occlusion); the cloth's fine detail (folds, seams, the
// kit switch) is drawn by the game's shader and is not in this page.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..'), src = path.join(root, 'src');
const want = ['00_util', '00a_i18n', '00b_variants', '01_gfx', '02_shaderlib', '06_sdfmesh', '07d_fpv', '08_skier', '08e_labmodata', '08f_labmo'];
let js = '';
for (const f of fs.readdirSync(src).filter(f => f.endsWith('.js')).sort()) if (want.some(w => f === w + '.js')) js += '\n// ===== ' + f + ' =====\n' + fs.readFileSync(path.join(src, f), 'utf8');
js = js.replace(/\/\*native\{\*\/[\s\S]*?\/\*\}native\*\//g, '');
const page = fs.readFileSync(path.join(__dirname, 'page.html'), 'utf8').replace('/*__GAME__*/', () => js).replace('/*__VIEW__*/', () => fs.readFileSync(path.join(__dirname, 'view.js'), 'utf8'));
const out = process.argv[2] || path.join(root, 'dist', 'skierlab.html');
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, page);
console.log('built', out, (page.length / 1024).toFixed(0) + ' KB');
