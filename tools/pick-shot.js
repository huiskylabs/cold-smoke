// Headless check of the 光圈挑战 picker on the title page (playwright's own Chromium, no window): node tools/pick-shot.js <outDir>
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || 'pick-shots'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || /pick:|line:|rings/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev');
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 180000 });
  await pg.evaluate(() => __ski.tod('day')); await pg.waitForTimeout(4000);
  await pg.screenshot({ path: path.join(out, '1_标题页_自由滑.png') });
  await pg.click('#rpick [data-l=b]'); await pg.waitForTimeout(300); await pg.click('#rpick [data-d=c]'); await pg.waitForTimeout(500);
  await pg.screenshot({ path: path.join(out, '2_选前三站_难.png') });
  console.log('state', await pg.evaluate(() => [__ski.ui().state, __rings.line.id, __rings.line.diff]));
  await pg.evaluate(() => __ski.ui().go()); await pg.waitForTimeout(900);
  await pg.screenshot({ path: path.join(out, '3_出发后倒数.png') });
  console.log('st', await pg.evaluate(() => __rings.line.st), 'errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
