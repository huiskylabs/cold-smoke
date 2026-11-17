// node tools/metro-shot.js <out dir> [tods=night] [w=1920] [h=1080]
// Still frames of the 不夜城 title view (world b, its fixed mountain), three of each time of day two seconds apart, for looking at the
// map beside its concept picture. Needs playwright and a browser with a real GPU (run it on a desktop, not on a software renderer).
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const [out = 'metro-shots', tods = 'night', W = '1920', Hh = '1080'] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const shots = [{ id: 'b', dur: 1, seed: 20261115, tod: 'night', hold: true, start: false, at: { s: 14 }, lead: 0, cam: 'chase' }];
  const browser = await chromium.launch({ ...(process.env.METRO_CHANNEL ? { channel: process.env.METRO_CHANNEL } : {}), headless: true,   // (never the owner's own Chrome, never a window: playwright's own headless Chromium)
    args: ['--enable-unsafe-webgpu', '--enable-gpu', '--use-angle=metal', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: +W, height: +Hh } });
  const errs = []; page.on('pageerror', e => errs.push(e.message.slice(0, 600))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 600)); });
  const t0 = Date.now();
  await page.goto('file://' + path.resolve(__dirname, '..', 'dist', 'dev.html') + `?director=1&w=${W}&h=${Hh}&gov=0&offscreen=1&v-world=${process.env.METRO_WORLD || 'b'}&metrosamples=4` + (process.env.METRO_Q || ''));
  await page.waitForFunction(() => window.Director && Director.ready, null, { timeout: 180000, polling: 250 });
  const info = await page.evaluate(() => ({ backend: (window.__ski && __ski.app && __ski.app().gfx && __ski.app().gfx.backend) || '?', ua: navigator.userAgent }));
  for (const t of tods.split(',')) {
    await page.evaluate(([t, sh]) => { const a = JSON.parse(sh); a[0].tod = t; Director.shots = a; Director.begin(0, 5, {}); }, [t, JSON.stringify(shots)]);
    for (let k = 0; k < 10; k++) await page.evaluate(() => { Director.step(); });
    for (let n = 0; n < 1; n++) {
      for (let k = 0; k < (n ? 9 : 0); k++) await page.evaluate(() => { Director.step(); });
      const d = await page.evaluate(() => { Director.step(); return Director.frame(); });
      fs.writeFileSync(path.join(out, `${process.env.METRO_WORLD && process.env.METRO_WORLD !== 'b' ? 'world_' + process.env.METRO_WORLD : 'metro'}_${t}_${n}.png`), Buffer.from(d.split(',')[1], 'base64'));
    }
  }
  console.log(JSON.stringify({ ok: true, ms: Date.now() - t0, info, errs: errs.slice(0, 6) }));
  await browser.close();
})().catch(e => { console.log(JSON.stringify({ ok: false, err: String(e).slice(0, 800) })); process.exit(1); });
