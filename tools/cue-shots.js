// The 下一个圈提示 (Variants rflow) as it plays: rides the 速降线 (标准) with a pilot past two rings, then shoots a frame every 0.15 s from
// ~1 s before the third ring until 1.5 s after it, once per kind asked. Playwright's own Chromium, headless, no window.
// node tools/cue-shots.js <outDir> [kinds=a,off]   (set GPU=1 on a machine with a real GPU)
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || 'cue-shots'), kinds = (process.argv[3] || 'a,off').split(','); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ headless: true, args: process.env.GPU ? ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'] : [] });
  for (const k of kinds) {
    const pg = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, locale: 'zh-CN' });
    const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (/rings|line:/.test(m.text())) errs.push(m.text().slice(0, 200)); });
    await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&v-rline=a&v-ringdiff=b&v-rflow=' + k);
    await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 240000 });
    await pg.evaluate(() => { __ski.tod('day'); window.__pilot = () => () => {
      const G = __ski.game(), S = G.s, p = S.p, R = __rings, C = __ski.m.Course; const cur = R.rings.find(r => r.pass < 0 && !r.skip); let tx, tz;
      if (cur && cur.s + p[2] > -2) { tx = cur.x; tz = -cur.s; } else { const c = C.at(-p[2] + 25); tx = c.cx; tz = p[2] - 25; }
      if (-(tz - p[2]) < 6) { const c = C.at(-p[2] + 20); tx = c.cx; tz = p[2] - 20; }
      return Math.max(-0.85, Math.min(0.85, (Math.atan2(tx - p[0], -(tz - p[2])) - Math.atan2(S.v[0], -S.v[2])) * 2.4)); }; });
    await pg.waitForTimeout(3000);
    await pg.evaluate(() => (__rings.chal = true, __ski.ui().go()));
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 60000 }); await pg.evaluate(() => { __rings.line.cT = 99; });
    await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 60000 });
    await pg.evaluate(async () => { const f = __pilot(), G = __ski.game(), t0 = G.runT; while (G.runT - t0 < 120 && __rings.passed + __rings.missed < 2) { __ski.sim(0.05, f, { draw: false }); __rings.frame(); await new Promise(r => setTimeout(r, 0)); } });
    // ~1 s before the next ring
    await pg.evaluate(async () => { const f = __pilot(), G = __ski.game(); for (let k = 0; k < 3000; k++) { __ski.sim(0.05, f, { draw: false }); __rings.frame(); const c = __rings.rings.find(r => r.pass < 0 && !r.skip); if (c && c.s + G.s.p[2] <= Math.max(18, G.s.speed * 1.1)) break; if (k % 5 === 4) await new Promise(r => setTimeout(r, 0)); } });
    for (let n = 0; n < 17; n++) {
      await pg.evaluate(() => { const f = __pilot(); __ski.sim(0.15, f); });
      await pg.waitForTimeout(120);
      const file = path.join(out, k + '_' + String(n).padStart(2, '0') + '.png'); await pg.screenshot({ path: file });
    }
    console.log(k, 'shots done, errors:', errs.length ? errs.join(' | ') : 'none'); await pg.close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
