// Drives the immersive mode (src/21_xr.js) in a WebXR emulator, since no headset is to hand:
//   npm i --no-save iwer@2.8.0 && node build.js && node tools/xr-test.js <outDir> [width height]
// The emulator is Meta's Immersive Web Emulation Runtime (a Quest 3 profile: symmetric eyes, controllers whose triggers stand in for
// pinches). It checks that the session starts, both eyes are drawn, the head steers and the pinches start / tuck / jump, and that the flat
// game comes back on leaving. It says nothing of the frame rate, the feel or comfort on a real headset.
// REALGPU=1: the machine's GPU instead of SwiftShader (SwiftShader takes many minutes to reach the title page). CHROME=<path>: which browser.
// Screenshots go to <outDir>; the checks print as they pass, and the script exits 1 if one fails.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const [outDir = 'xr-out', W = '960', H = '540'] = process.argv.slice(2);
const IWER = fs.readFileSync(require.resolve('iwer/build/iwer.min.js'), 'utf8');
fs.mkdirSync(outDir, { recursive: true });
let failed = 0;
const check = (name, ok, info) => { console.log((ok ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); if (!ok) failed++; };
(async () => {
  const gpu = process.env.REALGPU ? ['--ignore-gpu-blocklist', '--enable-gpu'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
  const browser = await chromium.launch({ headless: !process.env.HEADED, executablePath: process.env.CHROME || undefined, args: gpu.concat(['--no-sandbox', '--autoplay-policy=no-user-gesture-required']) });
  const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  const logs = []; page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); }); page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  await page.addInitScript(IWER + ';\nwindow.__xrdev = new IWER.XRDevice(IWER.metaQuest3); window.__xrdev.installRuntime({ forceInstall: true });');
  // turn the emulated head as a person does, about the top of the neck (~8 cm below and 10 cm behind the eyes), not about the eyes
  const turnHead = (qx, qy, qz, qw) => page.evaluate(([x, y, z, w]) => {
    const d = __xrdev, p = d.position; if (!d.__n) d.__n = [p.x, p.y - 0.08, p.z + 0.10];
    const up = [2 * (x * y - w * z), 1 - 2 * (x * x + z * z), 2 * (y * z + w * x)], back = [2 * (x * z + w * y), 2 * (y * z - w * x), 1 - 2 * (x * x + y * y)], n = d.__n;
    d.quaternion.set(x, y, z, w); p.set(n[0] + 0.08 * up[0] - 0.10 * back[0], n[1] + 0.08 * up[1] - 0.10 * back[1], n[2] + 0.08 * up[2] - 0.10 * back[2]);
  }, [qx, qy, qz, qw]);
  const shot = async n => page.screenshot({ path: path.join(outDir, n + '.png') });
  // (the build wraps everything in one function: the page's modules are reached through window.__ski.m, bound here by name)
  const ev = f => page.evaluate('(() => { const { App, XR, UI, Game, Input, Render, Quality } = __ski.m; return (' + f.toString() + ')(); })()'), wait = ms => page.waitForTimeout(ms);
  const trig = async (hand, v) => page.evaluate(`__xrdev.controllers.${hand}.updateButtonValue('trigger', ${v})`);
  await page.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?lang=zh&seed=7&gov=0');
  await page.waitForFunction(() => window.__ski && __ski.m.App.ready, null, { timeout: 1800000, polling: 1000 });
  const b = await ev(() => ({ ok: XR.ok, backend: App.gfx.caps.backend, button: !document.getElementById('xr').hidden }));
  check('the emulated headset is found, the page draws with WebGL2 and shows the button', b.ok && b.backend === 'webgl2' && b.button, b);
  await shot('0_title_flat');
  await page.click('#xr');
  await page.waitForFunction(() => __ski.m.XR.active && __ski.m.XR.stats.frames > 3, null, { timeout: 600000, polling: 500 });
  const s = await ev(() => ({ W: Render.W, H: Render.H, tx: +XR.tx.toFixed(3), ty: +XR.ty.toFixed(3), scale: XR.scale, err: XR.error || null }));
  check('immersive session running, eyes sized', s.W > 0 && !s.err, s);
  await wait(2500); await shot('1_xr_title');
  await trig('right', 1); await wait(400); await trig('right', 0); await wait(1000);
  const r = await ev(() => ({ state: UI.state, mode: Game.mode }));
  check('a pinch on the title page starts the run', r.state === 'run' && r.mode === 'run', r);
  await wait(5000); await shot('2_xr_run');
  await ev(() => { __xrdev.position.x += 0.12; }); await wait(1000);
  const lean = await ev(() => ({ u: +Input.u.toFixed(2), mode: Input.mode }));
  check('head moved 12 cm right steers right', lean.u > 0.4 && lean.mode === 'xr', lean);
  await ev(() => { __xrdev.position.x -= 0.12; }); await wait(800);
  await turnHead(0, 0, Math.sin(0.22), Math.cos(0.22)); await wait(1000);
  const tip = await ev(() => ({ u: +Input.u.toFixed(2) }));
  check('head tipped 25 degrees left steers left', tip.u < -0.4, tip);
  await turnHead(0, Math.sin(0.525), 0, Math.cos(0.525)); await wait(1000);
  const look = await ev(() => ({ u: +Input.u.toFixed(2) }));
  check('looking 60 degrees to the side does not steer', Math.abs(look.u) < 0.2, look);
  await shot('3_xr_look_left');
  await turnHead(0, 0, 0, 1); await wait(800);
  await trig('left', 1); await wait(300);
  const lj = await ev(() => ({ jump: Input.jump, tuck: Input.tuck })); check('left pinch held loads a jump', lj.jump && !lj.tuck, lj);
  await trig('left', 0); await trig('right', 1); await wait(300);
  const rt = await ev(() => ({ jump: Input.jump, tuck: Input.tuck })); check('right pinch held tucks', rt.tuck && !rt.jump, rt);
  await trig('right', 0); await wait(300);
  console.log('frames', JSON.stringify(await ev(() => ({ ...XR.stats, scale: +XR.scale.toFixed(2), err: XR.error || null }))));
  await ev(() => XR.exit()); await wait(2500);
  const f = await ev(() => ({ active: XR.active, W: Render.W, H: Render.H, canvas: [App.gfx.gl.canvas.width, App.gfx.gl.canvas.height], menu: UI.open, level: Quality.L.name }));
  check('leaving: flat again at the window size, the run waiting on the menu', !f.active && f.W === f.canvas[0] && f.menu && f.level !== 'XR', f);
  await shot('4_flat_after');
  if (logs.length) console.log('console:\n' + logs.slice(0, 30).join('\n'));
  await browser.close();
  console.log(failed ? failed + ' failed' : 'all passed');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
