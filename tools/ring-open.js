// When does each flame open into its ring? The skier is carried down the 速降线 (and 越野线) along its rings at a steady speed, and for every
// ring the distance to it at the moment it starts to open is noted (用户 2026-11-18 20:36 UTC: only once the skier is near; far off it
// stays a flame with its column). Logic only, no picture. node tools/ring-open.js [lines=a,x] [v=20]
const path = require('path'); const { chromium } = require('playwright');
const lines = (process.argv[2] || 'a,x').split(','), V = +(process.argv[3] || 20);
(async () => {
  const b = await chromium.launch({ headless: true }); const pg = await b.newPage({ viewport: { width: 320, height: 180 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev');
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 240000 });
  for (const line of lines) {
    if (await pg.evaluate(() => __ski.ui().state) !== 'title') { await pg.evaluate(() => __ski.ui().toTop()); await pg.waitForFunction(() => __ski.ui().state === 'title', null, { timeout: 60000 }); }
    await pg.evaluate(l => { const Vv = __ski.m.Variants; Vv.set('ringdiff', 'b'); Vv.set('rline', l); __rings.chal = true; __ski.ui().go(); }, line);
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 60000 }); await pg.evaluate(() => { __rings.line.cT = 99; });
    await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 60000 });
    const r = await pg.evaluate(V => {
      const G = __ski.game(), C = __ski.m.Course, RG = __rings, L = RG.line, open = new Map(); let s = -G.s.p[2], n = 0, T = G.runT, colMax = 0; const colHist = {};
      const realNow = performance.now.bind(performance); let fake = realNow(); performance.now = () => fake;          // (the rings run on the page's clock: it is stepped with the skier)
      while (n++ < 8000) {
        fake += 1500 / V;
        G.mode = 'run'; const cur = RG.rings.find(q => q.pass < 0 && !q.skip), c = C.at(s), x = cur ? cur.x : c.cx;
        G.s.p[0] = x; G.s.p[2] = -s; G.s.p[1] = C.height(x, -s, 0.5); G.s.v[2] = -V; G.s.speed = V; G.runT = (T += 1.5 / V);
        RG.frame(); const nc = RG.columns ? RG.columns() : 0; colMax = Math.max(colMax, nc); colHist[nc] = (colHist[nc] || 0) + 1; for (const q of RG.rings) if (!q.skip && !q.fin && q.grow >= 0 && !open.has(q.id)) open.set(q.id, Math.round(q.s - s));
        if (L.st === 'done' || L.fin && !RG.rings.some(q => q.pass < 0 && !q.skip)) break; s += 1.5;
      }
      performance.now = realNow; const d = [...open.values()]; return { colMax, colHist: JSON.stringify(colHist), n: d.length, min: Math.min(...d.slice(1)), max: Math.max(...d.slice(1)), first: d[0], d: d.slice(0, 12) };
    }, V);
    console.log(line, JSON.stringify(r));
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
