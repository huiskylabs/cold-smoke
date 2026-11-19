// Checks the phone's tilt steering, the left thumb's cross (前压 up, 后压 down, across steers, with the tilt at once) and the right buttons,
// headless, in a landscape phone frame.
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
    await page.screenshot({ path: path.join(out, kind + '_2_run.png') });
    const st0 = await page.evaluate(() => { const c = document.getElementById('cross'), r = c.getBoundingClientRect(), o = getComputedStyle(c).opacity;
      const bb = id => { const q = document.getElementById(id).getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; };
      return { mode: Input.mode, cross: [Math.round(r.left), Math.round(r.bottom), Math.round(r.width)], op: o, jump: bb('jump'), tuck: bb('tuck'), vw: bb('vw'), H: innerHeight }; });
    ok(kind + ' cross at rest in the bottom-left corner, buttons keep their size', st0.op === '1' && st0.cross[0] < 60 && st0.H - st0.cross[1] < 60 && st0.jump[0] === 72 && st0.tuck[0] === 60 && st0.vw[0] === 44, st0);
    // steer right by tilt
    if (kind === 'web') await page.evaluate(() => { window.__o.gamma = 20; }); else await page.evaluate(() => { window.__w.z = -1.2; });
    await wait(kind === 'web' ? 600 : 350);
    if (kind === 'xhs') await page.evaluate(() => { window.__w.z = 0; });
    const u1 = await page.evaluate(() => Input.u);
    ok(kind + ' tilt right steers right', u1 > 0.3, { u: u1 });
    // a thumb pushed straight up while the tilt steers: Fore, and the tilt's turn kept
    const view = await page.locator('#view').boundingBox();
    const x0 = view.x + 120, y0 = view.y + view.height - 120;
    await page.evaluate(([x, y]) => { const v = document.getElementById('view'); v.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 9, clientX: x, clientY: y, bubbles: true, pointerType: 'touch' })); }, [x0, y0]);
    await page.evaluate(([x, y]) => { const v = document.getElementById('view'); v.dispatchEvent(new PointerEvent('pointermove', { pointerId: 9, clientX: x, clientY: y - 90, bubbles: true, pointerType: 'touch' })); }, [x0, y0]);
    await wait(400);
    const f = await page.evaluate(() => ({ faT: Input.faT, u: Input.u, up: document.querySelector('#cross .up').classList.contains('on'), held: document.getElementById('cross').classList.contains('held') }));
    ok(kind + ' thumb up = Fore, lit, tilt still turning', f.faT > 0.8 && f.up && f.held && (kind === 'xhs' || f.u > 0.3), f);
    await page.screenshot({ path: path.join(out, kind + '_3_thumb_up.png') });
    // then down and to the right: Aft and a harder turn
    await page.evaluate(([x, y]) => { const v = document.getElementById('view'); v.dispatchEvent(new PointerEvent('pointermove', { pointerId: 9, clientX: x + 100, clientY: y + 100, bubbles: true, pointerType: 'touch' })); }, [x0, y0]);
    await wait(400);
    const g = await page.evaluate(() => ({ faT: Input.faT, u: Input.u, dn: document.querySelector('#cross .dn').classList.contains('on') }));
    ok(kind + ' thumb down-right = Aft + right turn', g.faT < -0.8 && g.dn && g.u > 0.6, g);
    await page.screenshot({ path: path.join(out, kind + '_4_thumb_downright.png') });
    await page.evaluate(() => { const v = document.getElementById('view'); v.dispatchEvent(new PointerEvent('pointerup', { pointerId: 9, bubbles: true, pointerType: 'touch' })); });
    await wait(500);
    const h = await page.evaluate(() => ({ faT: Input.faT, held: document.getElementById('cross').classList.contains('held'), drag: !!Input.drag }));
    ok(kind + ' let go: centred, cross back in the corner', Math.abs(h.faT) < 0.1 && !h.held && !h.drag, h);
    if (kind === 'web') await page.evaluate(() => { window.__o.gamma = 0; });
    // the jump button still takes a press
    await page.evaluate(() => document.getElementById('jump').dispatchEvent(new PointerEvent('pointerdown', { pointerId: 11, bubbles: true, cancelable: true, pointerType: 'touch' })));
    await wait(200);
    const jb = await page.evaluate(() => ({ jump: Input.btn.jump, down: document.getElementById('jump').classList.contains('down') }));
    await page.screenshot({ path: path.join(out, kind + '_5_jump_down.png') });
    await page.evaluate(() => document.getElementById('jump').dispatchEvent(new PointerEvent('pointerup', { pointerId: 11, bubbles: true, cancelable: true, pointerType: 'touch' })));
    ok(kind + ' jump button pressed', jb.jump && jb.down, jb);
    await ctx.close();
  }
  await b.close();
  console.log(res.join('\n'));
  fs.writeFileSync(path.join(out, 'result.txt'), res.join('\n') + '\n');
})().catch(e => { console.error(e); process.exit(1); });
