// Parse the iOS and visionOS game bundles the same way ios/build-resources.sh concatenates them.
// Linux can do this: the check only asks whether the script is valid JavaScript. It does not run WebKit or Metal.
const fs = require('fs'), path = require('path'), os = require('os'), vm = require('vm'), { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }

function bundle(platform) {
  const parts = ['(() => { "use strict";'];
  if (platform === 'visionos') parts.push('self.COLD_SMOKE = { spatial: true, noTilt: true };');
  parts.push(read('ios/Runtime/platform.js'));
  const skip = new Set(['19b_rank.js', '19c_xhs.js', '20_director.js']);
  for (const name of fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.js')).sort()) {
    if (skip.has(name)) continue;
    parts.push(read('src/' + name));
    if (name === '01_gfx.js') {
      parts.push(read('ios/Runtime/metal-shaders.js'));
      parts.push(read('ios/Runtime/metal-gfx.js'));
    }
  }
  parts.push(read('ios/Runtime/pause-settings.js'));
  if (platform === 'visionos') {
    parts.push(read('visionos/App/spatial.js'));
    parts.push(read('visionos/App/interface.js'));
  } else parts.push(read('ios/Runtime/game-controls.js'));
  parts.push('})();');
  return parts.join('\n');
}

function markerCount(src, label) {
  const open = (src.match(/\/\*native\{\*\//g) || []).length;
  const close = (src.match(/\/\*\}native\*\//g) || []).length;
  if (open !== close) throw new Error(label + ': unbalanced /*native{*/ markers (' + open + ' open, ' + close + ' close)');
  return open;
}

function parse(label, src) {
  const n = markerCount(src, label);
  const file = path.join(os.tmpdir(), 'cold-smoke-' + label + '.js');
  fs.writeFileSync(file, src);
  const checked = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (checked.status !== 0) {
    process.stderr.write(checked.stderr || '');
    throw new Error(label + ' failed node --check');
  }
  new vm.Script(src, { filename: label + '.js' });
  console.log(label, 'parses,', n, 'native blocks,', src.length, 'bytes');
}

parse('ios', bundle('ios'));
parse('visionos', bundle('visionos'));

const built = spawnSync(process.execPath, ['build.js'], { cwd: root, encoding: 'utf8' });
process.stdout.write(built.stdout || '');
process.stderr.write(built.stderr || '');
if (built.status !== 0) throw new Error('node build.js failed');

const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
if (html.includes('/*native{*/') || html.includes('/*}native*/')) throw new Error('dist/index.html still contains native markers');
const script = /<script>([\s\S]*?)<\/script>/.exec(html);
if (!script) throw new Error('dist/index.html has no inline script');
const webFile = path.join(os.tmpdir(), 'cold-smoke-web.js');
fs.writeFileSync(webFile, script[1]);
const webCheck = spawnSync(process.execPath, ['--check', webFile], { encoding: 'utf8' });
if (webCheck.status !== 0) {
  process.stderr.write(webCheck.stderr || '');
  throw new Error('web bundle failed node --check');
}
new vm.Script(script[1], { filename: 'dist/index.html' });
for (const needle of ['beginSpatial', 'createGraphics', 'nativeWindow', 'beginStereoEye', 'saveGamePhoto']) {
  if (script[1].includes(needle)) throw new Error('web bundle still contains ' + needle);
}
console.log('web script parses,', script[1].length, 'bytes; dist/index.html', html.length, 'bytes');
