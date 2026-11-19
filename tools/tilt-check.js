// Checks the phone's tilt steering and the two buttons at the left (▲ 前压 / ▼ 后压), headless, in a landscape phone frame.
//   node tools/tilt-check.js <dist/index.html> <dist-xhs/index.html> <out dir>
// web: fake deviceorientation events; xhs: a fake window.xhs.miniTool gyroscope. Writes shots and prints PASS / FAIL lines.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const [web, xhs, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const res = [];
const ok = (name, cond, info) => { res.push((cond ? 'PASS ' : 'FAIL ') + name + (info != null ? '  ' + JSON.stringify(info) : '')); };
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'] });
  for (const kind of ['web', 'xhs']) {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    page.on('pageerror', e => res.push('PAGEERROR ' + kind + ' ' + e.message));
    // (the game's modules are reached through window.__ski, as in share-check.js)
    await page.addInitScript(() => { const def = (n, f) => Object.defineProperty(window, n, { get: () => window.__ski && window.__ski[f](), configurable: true });
      def('UI', 'ui'); def('Input', 'input'); });
    if (kind === 'xhs') await page.addInitScript(() => {
      window.__w = { x: 0, y: 0, z: 0 };
      window.xhs = { miniTool: {
        startGyroscope: () => { setInterval(() => window.__gy && window.__gy(Object.assign({}, window.__w)), 60); return Promise.resolve({}); },
        stopGyroscope: () => Promise.resolve({}), onGyroscopeChange: cb => { window.__gy = cb; }, offGyroscopeChange: () => { },
      } };
    });
    else await page.addInitScript(() => {
      window.__o = { beta: 40, gamma: 0 };
      setInterval(() => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: window.__o.beta, gamma: window.__o.gamma })), 30);
    });
    await page.goto('file://' + path.resolve(kind === 'web' ? web : xhs));
    await page.waitForFunction(() => typeof UI !== 'undefined' && UI.state === 'title', null, { timeout: 120000 });
    await wait(1500);
    await page.screenshot({ path: path.join(out, kind + '_1_title.png') });
    ok(kind + ' tilt live on the title', await page.evaluate(() => Input.tiltLive()));
    await page.evaluate(() => UI.go());
    await page.waitForFunction(() => UI.state === 'run', null, { timeout: 60000 });
    await wait(2500);
    const st = await page.evaluate(() => ({ mode: Input.mode, cls: document.getElementById('app').classList.contains('tiltfa'), fwd: getComputedStyle(document.getElementById('fwd')).display, hint: document.getElementById('hint') && document.getElementById('hint').textContent }));
    ok(kind + ' buttons shown while the phone steers', st.mode === 'tilt' && st.cls && st.fwd === 'flex', st);
    await page.screenshot({ path: path.join(out, kind + '_2_run_buttons.png') });
    // steer right by tilt
    if (kind === 'web') await page.evaluate(() => { window.__o.gamma = 20; }); else await page.evaluate(() => { window.__w.z = -1.2; });
    await wait(kind === 'web' ? 600 : 350);
    if (kind === 'xhs') await page.evaluate(() => { window.__w.z = 0; });
    const u1 = await page.evaluate(() => Input.u);
    ok(kind + ' tilt right steers right', u1 > 0.3, { u: u1 });
    if (kind === 'xhs') { await wait(9000); const u2 = await page.evaluate(() => Input.u); ok('xhs steering eases back to centre', Math.abs(u2) < Math.abs(u1) * 0.4, { u: u2 }); }
    else { await page.evaluate(() => { window.__o.gamma = 0; }); await wait(400); }
    // press ▲ then ▼ with a touch
    for (const [id, sgn] of [['fwd', 1], ['aft', -1]]) {
      const bx = await page.locator('#' + id).boundingBox();
      const cx = bx.x + bx.width / 2, cy = bx.y + bx.height / 2;
      await page.evaluate(([id]) => { const e = document.getElementById(id); e.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 7, bubbles: true, cancelable: true, pointerType: 'touch' })); }, [id]);
      await wait(600);
      const f = await page.evaluate(() => ({ faT: Input.faT, drag: !!Input.drag }));
      if (id === 'fwd') await page.screenshot({ path: path.join(out, kind + '_3_fwd_down.png') });
      await page.evaluate(([id]) => { const e = document.getElementById(id); e.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, bubbles: true, cancelable: true, pointerType: 'touch' })); }, [id]);
      ok(kind + ' ' + id + ' gives weight ' + (sgn > 0 ? 'forward' : 'back') + ', no steering drag', f.faT * sgn > 0.8 && !f.drag, f);
      await wait(500);
      const f2 = await page.evaluate(() => Input.faT); ok(kind + ' ' + id + ' let go: centred again', Math.abs(f2) < 0.1, { faT: f2 });
    }
    // a finger steering: tilt no longer counts (buttons may stay; drag wins)
    await ctx.close();
  }
  await b.close();
  console.log(res.join('\n'));
  fs.writeFileSync(path.join(out, 'result.txt'), res.join('\n') + '\n');
})().catch(e => { console.error(e); process.exit(1); });
