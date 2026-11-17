// Headless shots of the rings ahead at a few distances (playwright's own Chromium, no window): node tools/ring-look.js <outDir> [prefix]
// Rides the 光圈 line (前三站, 标准) with a pilot aimed at the rings and shoots when the next ring is ~60, ~30 and ~12 m ahead, by day.
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || 'ring-look'), pre = process.argv[3] || 'x'; fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || /rings|line:/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&v-rline=b&v-ringdiff=b');
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 180000 });
  await pg.evaluate(() => { __ski.tod('day'); window.__pilot = () => () => {
    const G = __ski.game(), S = G.s, p = S.p, R = __rings, C = __ski.m.Course; const cur = R.rings.find(r => r.pass < 0 && !r.skip); let tx, tz;
    if (cur && cur.s + p[2] > -2) { tx = cur.x; tz = -cur.s; } else { const c = C.at(-p[2] + 25); tx = c.cx; tz = p[2] - 25; }
    if (-(tz - p[2]) < 6) { const c = C.at(-p[2] + 20); tx = c.cx; tz = p[2] - 20; }
    return Math.max(-0.85, Math.min(0.85, (Math.atan2(tx - p[0], -(tz - p[2])) - Math.atan2(S.v[0], -S.v[2])) * 2.4)); }; });
  await pg.waitForTimeout(4000);
  await pg.evaluate(() => (__rings.chal = true, __ski.ui().go())); await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 20000 });
  // past the first two rings, then toward the next one
  await pg.evaluate(async () => { const f = __pilot(), G = __ski.game(), t0 = G.runT; while (G.runT - t0 < 120 && __rings.passed + __rings.missed < 3) { __ski.sim(0.05, f, { draw: false }); __rings.frame(); await new Promise(r => setTimeout(r, 0)); } });
  for (const m of [60, 30, 12]) {
    await pg.evaluate(async m => { const f = __pilot(), G = __ski.game(); for (let k = 0; k < 2000; k++) { __ski.sim(0.05, f, { draw: false }); __rings.frame(); const c = __rings.rings.find(r => r.pass < 0 && !r.skip); if (c && c.s + G.s.p[2] <= m) break; if (k % 5 === 4) await new Promise(r => setTimeout(r, 0)); } }, m);
    await pg.waitForTimeout(400);
    const f = path.join(out, pre + '_' + m + 'm.png'); await pg.screenshot({ path: f }); console.log('shot', f);
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
