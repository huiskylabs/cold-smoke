// Screenshots of 穿圈拖影 (rtrail) for review (headless, no window): playwright's own Chromium, never the installed Chrome.
//   node tools/trail-shots.js <outDir> [variants=a,b]
// For each variant: the 光圈 line (前三站, easy), a pilot aimed at the rings; near one ring the game is stepped a frame at a time and
// shots are taken as the skier comes up to the ring, goes through, and rides on (the afterimages trailing behind him).
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || 'trail-shots'), vars = (process.argv[3] || 'a,b').split(',');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'] });
  for (const v of vars) {
    const pg = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2, locale: 'zh-CN' });
    const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || /rings|line:/.test(m.text())) errs.push(m.text().slice(0, 200)); });
    await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&v-rline=b&v-ringdiff=a&v-rtrail=' + v);
    await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 180000 });
    await pg.evaluate(() => { __ski.tod('day'); });
    await pg.waitForTimeout(4000);
    await pg.evaluate(() => {
      window.__pilot = () => () => {
        const G = __ski.game(), S = G.s, p = S.p, R = __rings, C = __ski.m.Course;
        const cur = R.rings.find(r => r.pass < 0 && !r.skip); let tx, tz;
        if (cur && cur.s + p[2] > -2) { tx = cur.x; tz = -cur.s; } else { const c = C.at(-p[2] + 25); tx = c.cx; tz = p[2] - 25; }
        if (-(tz - p[2]) < 6) { const c = C.at(-p[2] + 20); tx = c.cx; tz = p[2] - 20; }
        return Math.max(-0.85, Math.min(0.85, (Math.atan2(tx - p[0], -(tz - p[2])) - Math.atan2(S.v[0], -S.v[2])) * 2.4));
      };
      __ski.ui().go();
    });
    await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 20000 });
    // ride (no drawing) to the third ring, 14 m out
    await pg.evaluate(async () => {
      const f = __pilot(), G = __ski.game(), t0 = G.runT;
      while (G.runT - t0 < 200) { __ski.sim(0.05, f, { draw: false }); __rings.frame(); const c = __rings.rings.find(r => r.pass < 0 && !r.skip); if (__rings.passed + __rings.missed >= 2 && c && c.s + G.s.p[2] < 14) return; await new Promise(r => setTimeout(r, 0)); }
    });
    // then a frame at a time, drawn, shooting at set distances to the ring
    const marks = [5, 2, 0, -2.5, -5];
    for (const m of marks) {
      await pg.evaluate(async m => {
        const f = __pilot(), G = __ski.game();
        const ring = __rings.ring0 || (__rings.ring0 = __rings.rings.find(r => r.pass < 0 && !r.skip));
        for (let k = 0; k < 400; k++) { __ski.sim(1 / 60, f); if (ring.s + G.s.p[2] <= m) break; await new Promise(r => requestAnimationFrame(r)); }
      }, m);
      await pg.waitForTimeout(60);
      const file = path.join(out, v + '_' + String(marks.indexOf(m) + 1).padStart(2, '0') + '_' + (m > 0 ? '离圈' + m + '米' : m === 0 ? '穿过' : '过圈' + (-m) + '米') + '.png');
      await pg.screenshot({ path: file }); console.log('shot', file);
    }
    console.log(v, 'ghosts', await pg.evaluate(() => __rings.ghosts ? __rings.ghosts() : -1), 'errors:', errs.length ? errs.join(' | ') : 'none');
    await pg.close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
