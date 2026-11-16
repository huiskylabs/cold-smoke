// Headless check for the lab ski pose: finite bone matrices over a full carve,
// and the ski (foot) bones staying under the ankles. No GPU, no mesh.
//   node tools/kit-pose-test.js
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const files = ['src/00_util.js', 'src/00b_variants.js', 'src/08a_human.js', 'src/08_skier.js'];
const src = files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n;\n') + '\n;globalThis.Skier = Skier; globalThis.Variants = Variants;\n';

const location = { search: '', pathname: '/', href: 'http://localhost/' };
const store = {};
const ctx = {
  console,
  location,
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
  },
  performance: { now: () => Date.now() },
  URLSearchParams,
  COLD_SMOKE: null,
};
ctx.self = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(src, ctx, { filename: 'kit-pose.js' });

const Skier = ctx.Skier;
const B = Skier.B, LEN = Skier.LEN;
let n = 0;
function ok(cond, msg) {
  if (!cond) { console.error('FAIL', msg); process.exitCode = 1; }
  else n++;
}
function finiteM(M, tag) {
  ok(M && M.length === 28, tag + ' has 28 bones');
  for (let i = 0; i < 28; i++) {
    const m = M[i];
    if (!m || m.length !== 16) { ok(false, tag + ' bone ' + i + ' missing'); return; }
    for (let k = 0; k < 16; k++) if (!Number.isFinite(m[k])) { ok(false, tag + ' bone ' + i + ' not finite'); return; }
  }
  ok(true, tag + ' matrices finite');
}
function len(a, b) { const d = [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; return Math.hypot(d[0], d[1], d[2]); }
function footCheck(r, tag) {
  for (const side of ['L', 'R']) {
    const F = r.F[B['foot' + side]], ankle = r.J['ankle' + side];
    const o = [F[12], F[13], F[14]], y = [F[4], F[5], F[6]];
    const pred = [o[0] + y[0] * LEN.ankle, o[1] + y[1] * LEN.ankle, o[2] + y[2] * LEN.ankle];
    ok(len(pred, ankle) < 0.02, tag + ' ' + side + ' ankle on the ski');
    ok(o[1] < ankle[1] + 0.02, tag + ' ' + side + ' ski under the foot');
    const d = [ankle[0] - o[0], ankle[1] - o[1], ankle[2] - o[2]], dl = Math.hypot(d[0], d[1], d[2]) || 1;
    const dot = (d[0] * y[0] + d[1] * y[1] + d[2] * y[2]) / dl;
    ok(dot > 0.9, tag + ' ' + side + ' ankle along ski-up');
    ok(Math.abs(len(r.J['knee' + side], r.J['hip' + side]) - LEN.thigh) < 0.03, tag + ' ' + side + ' thigh length');
    ok(Math.abs(len(ankle, r.J['knee' + side]) - LEN.shin) < 0.03, tag + ' ' + side + ' shin length');
  }
}

const pose = { edge: 0.2, lean: 0.2, stance: 0.34, crouch: 0.3 };
let xRight = 0, xLeft = 0;
for (let i = 0; i <= 24; i++) {
  const u = i / 24;
  const r = Skier.kitAt(u, pose);
  finiteM(r.M, 'carve u=' + u.toFixed(3));
  footCheck(r, 'carve u=' + u.toFixed(3));
  const plain = Skier.skin(pose);
  ok(r.F[B.footL].every((v, k) => v === plain.s.F[B.footL][k]), 'carve u=' + u.toFixed(3) + ' left ski unchanged');
  ok(r.F[B.footR].every((v, k) => v === plain.s.F[B.footR][k]), 'carve u=' + u.toFixed(3) + ' right ski unchanged');
  const mid = (r.J.ankleL[0] + r.J.ankleR[0]) * 0.5;
  if (Math.abs(u - 0.125) < 1e-6) xRight = r.J.pelvis[0] - mid;
  if (Math.abs(u - 0.65625) < 0.03) xLeft = r.J.pelvis[0] - mid;
}
ok(xRight > xLeft, 'right apex leans right of the left apex (' + xRight.toFixed(3) + ' > ' + xLeft.toFixed(3) + ')');

const tuck = Skier.kitAt(0.3, { tuck: 1, edge: 0.1, lean: 0.1, crouch: 0.5 });
finiteM(tuck.M, 'tuck');
footCheck(tuck, 'tuck');
const jump = Skier.kitAt(0.4, { air: 1, edge: 0, lean: 0, crouch: 0.4 });
finiteM(jump.M, 'jump');
footCheck(jump, 'jump');
const plain = Skier.skin({ lean: 0.2, edge: 0.2, crouch: 0.3 });
finiteM(plain.M, 'procedural');

location.search = '';
ctx.DEV = false;
const skierRoot = { pos: [1, 2, 3], fwd: [0, 0, -1], nrm: [0, 1, 0] };
const held = { edge: 0.4, lean: 0.35, crouch: 0.4, stance: 0.34 };
const solved = Skier.solve(Object.assign({}, Skier.P0, held));
const updated = Skier.update(skierRoot, held, [0, 0, 0]);
ok(Math.abs(updated.J.pelvis[0] - solved.J.pelvis[0]) < 1e-4 && Math.abs(updated.J.chest[1] - solved.J.chest[1]) < 1e-4, 'default update keeps the procedural pose');
ok(Skier.labOn() === false, 'off with no dev and no query');
location.search = '?motion=kit';
ok(Skier.labOn() === true, 'on for ?motion=kit');
location.search = '?motion=game';
ok(Skier.labOn() === false, 'off for ?motion=game');
ctx.COLD_SMOKE = { noDev: true };
location.search = '?motion=kit';
ok(Skier.labOn() === false, 'off when COLD_SMOKE.noDev');
ctx.COLD_SMOKE = null;
location.search = '';
ctx.Variants.set('labmo', 'b');
ok(Skier.labOn() === false, 'stored lab choice ignored outside dev');
ctx.DEV = true;
ok(Skier.labOn() === true, 'on in dev when the row is set');
ctx.DEV = false;
ok(Skier.labOn() === false, 'off again outside dev');

if (process.exitCode) console.error('kit pose test failed');
else console.log('kit pose test ok (' + n + ' checks)');
