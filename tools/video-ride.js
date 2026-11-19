// 视频雪道 ride test: the test pilot down 金色雪旗 春雪 (route f) twice, once down the middle and once out on the lips and walls, physics only
// (sim with draw off), headless, no window. Says per run kind: speed, air (takeoffs, longest hang, hardest landing), crawls, tree hits.
// node tools/video-ride.js <out.json> [metres=5400]
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || 'video-ride.json'), M = +(process.argv[3] || 5400);
(async () => {
  const b = await chromium.launch({ headless: true, args: process.env.GPU ? ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'] : [] });
  const pg = await b.newPage({ viewport: { width: 640, height: 360 }, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&v-world=d&v-dalp=b&v-dsea=b&v-start=b&v-route=b');
  await pg.waitForFunction(() => window.__ski && __ski.ui().state === 'title', null, { timeout: 300000 });
  const res = { errs };
  for (const [name, amp] of [['middle', 0.45], ['edges', 0.92]]) {
    res[name] = await pg.evaluate(async ([amp, M]) => {
      const G = __ski.game(), C = __ski.m.Course; __ski.reset(0); const f = __ski.pilot(amp, 5.2);
      const by = {}, ev = []; let crash = 0, t = 0;
      const push0 = Array.prototype.push; G.events.push = function (...a) { for (const e of a) if (e.type === 'land' || e.type === 'crash') ev.push(e); return push0.apply(this, a); };
      while (-G.s.p[2] < M && t < 900) {
        __ski.sim(0.1, f, { draw: false }); t += 0.1;
        const S = G.s, s = -S.p[2], k = C.segAt(s).idx + ':' + C.segAt(s).type, B = by[k] || (by[k] = { n: 0, v: 0, vmax: 0, crawl: 0, air: 0, airMax: 0, landMax: 0, hits: 0 });
        B.n++; B.v += S.speed; B.vmax = Math.max(B.vmax, S.speed); if (S.speed < 3) B.crawl += 0.1;
        for (const e of ev.splice(0)) { if (e.type === 'land') { B.air++; B.airMax = Math.max(B.airMax, e.airT); B.landMax = Math.max(B.landMax, e.v); } }
        if (S.crash > 0 && !crash) B.hits++; crash = S.crash > 0;
        if ((t * 10 | 0) % 50 === 0) await new Promise(r => setTimeout(r, 0));
      }
      delete G.events.push;
      for (const k in by) { const B = by[k]; B.v = +(B.v / B.n * 3.6).toFixed(1); B.vmax = +(B.vmax * 3.6).toFixed(1); B.airMax = +B.airMax.toFixed(2); B.landMax = +B.landMax.toFixed(1); B.crawl = +B.crawl.toFixed(1); delete B.n; }
      return { t: +t.toFixed(1), s: Math.round(-G.s.p[2]), by };
    }, [amp, M]);
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close();
})();
