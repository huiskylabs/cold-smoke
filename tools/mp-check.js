// 一起滑自测 (headless, no window: playwright's own Chromium, never the installed Chrome).
//   node tools/mp-check.js [n=3] [relay=ws://127.0.0.1:8899/ski] [outDir]
// Starts n pages on today's mountain through the relay (start it first: node server/mp/relay.js 8899), lets them ski in real time with the
// test pilot, and checks: every page sees the others; where page A shows B is where B is (the gap, taking the time between the two reads);
// two skiers set on the same spot bump apart and neither falls or stops; skiing on past the end of the loop is the top again with no cut (a lap counted, still running).
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const N = +(process.argv[2] || 3), RELAY = process.argv[3] || 'ws://127.0.0.1:8899/ski', OUT = process.argv[4] ? path.resolve(process.argv[4]) : null;
if (OUT) fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const gpu = process.env.REALGPU ? ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'].concat(process.platform === 'darwin' ? ['--use-angle=metal'] : []) : ['--use-angle=swiftshader'];
  const browsers = [];
  const W = OUT ? 1280 : 320, H = OUT ? 720 : 180;
  const url = 'file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&gov=0&mp=' + encodeURIComponent(RELAY) + (OUT ? '' : '&w=320&h=180') + (process.env.BACKEND ? '&backend=' + process.env.BACKEND : '');
  const pages = [], errs = [];
  for (let i = 0; i < N; i++) {
    const b = await chromium.launch({ headless: true, args: gpu.concat(['--no-sandbox']) }); browsers.push(b);
    const pg = await b.newPage({ viewport: { width: W, height: H }, locale: 'zh-CN' });
    pg.on('pageerror', e => errs.push(i + ': ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(i + ': ' + m.text().slice(0, 200)); });
    if (process.env.REALGPU) await pg.addInitScript(() => { window.__REAL = 1; }); await pg.goto(url); pages.push(pg);
  }
  for (const pg of pages) await pg.waitForFunction(() => window.__ski && window.Net && __ski.ui().state === 'title', null, { timeout: 300000 });
  console.log('renderer', await pages[0].evaluate(() => __ski.app().gfx.caps.backend));
  // each page: its own pilot, a little different, steering every frame
  for (let i = 0; i < N; i++) await pages[i].evaluate(k => {
    const f = __ski.pilot(0.25 + 0.12 * k, 4.6 + 0.7 * k), I = __ski.input(), G = __ski.game();
    __ski.app().onTick.push(() => { I.script = G.mode === 'run' ? f(G.runT) : null; });
    // (a software GPU is far too slow to draw in real time: unless REALGPU, the game is stepped on a timer without drawing, at real speed, so the
    // network sees what it would see; a frame is drawn now and then for the bones and the names)
    if (!window.__REAL) { const A = __ski.app(); let last = performance.now(), n = 0; A.paused = true;
      setInterval(() => { const t = performance.now(); let d = (t - last) / 1000; last = t; while (d > 0) { const h = Math.min(d, 1 / 30); A.paused = false; __ski.step(h); A.paused = true; d -= h; } }, 16); }
    Net.enter('pub');
  }, i);
  for (const pg of pages) await pg.waitForFunction(() => Net.state === 'on' && __ski.game().mode === 'run', null, { timeout: 60000 });
  const seeds = await Promise.all(pages.map(pg => pg.evaluate(() => [Net.seed, __ski.m.Course.seed, Net.sEnd])));
  console.log('seed / course / loop end', JSON.stringify(seeds));
  // stagger them: page k starts k*6 m further down, so they ski apart a little
  await sleep(6000);
  const fps = await pages[0].evaluate(async () => { const t0 = performance.now(), a = __ski.app().t; await new Promise(r => setTimeout(r, 2000)); return ((__ski.app().t - a) / ((performance.now() - t0) / 1000)).toFixed(2); });
  console.log('game seconds per real second (page 0)', fps);
  // 1. everyone sees everyone, and where
  const look = async () => {
    const r = await Promise.all(pages.map(pg => pg.evaluate(() => ({ id: Net.id, p: __ski.game().s.p.slice(), v: __ski.game().s.v.slice(), t: Date.now(), st: Net.stats() }))));
    let worst = 0;
    for (const a of r) for (const q of a.st.peers) { const o = r.find(x => x.id === q.id); if (!o || !q.p) continue; const dt = (a.t - o.t) / 1000, ex = [o.p[0] + o.v[0] * dt, o.p[2] + o.v[2] * dt], d = Math.hypot(q.p[0] - ex[0], q.p[2] - ex[1]); worst = Math.max(worst, d); if (d > 4) console.log('  gap', a.id, 'sees', q.id, d.toFixed(1), 'dt', dt.toFixed(2), JSON.stringify(q.p), JSON.stringify(o.p.map(x => +x.toFixed(1)))); }
    return { r, worst };
  };
  const A = await look();
  console.log('peers seen', A.r.map(x => x.st.peers.length).join(','), ' shown', A.r.map(x => x.st.peers.filter(p => p.shown).length).join(','), ' speeds', A.r.map(x => Math.hypot(x.v[0], x.v[2]).toFixed(1)).join(','));
  console.log('worst gap between where a peer is shown and where it is (m)', A.worst.toFixed(2));
  const seeAll = A.r.every(x => x.st.peers.length === N - 1);
  // 2. a bump: page 1 set right beside page 0, heading into it
  await pages[1].evaluate(async () => {});
  const id0 = await pages[0].evaluate(() => Net.id);
  const b0 = await Promise.all(pages.map(pg => pg.evaluate(() => Net.bumps || 0)));
  // page 1 is put beside where it sees page 0, 1.4 m to its side, at its speed, drifting into it at 4 m/s
  await pages[1].evaluate(id => { const P = Net.peers.get(id), sh = P.show, S = __ski.game().s, sp = Math.hypot(sh.v[0], sh.v[2]) || 1, rx = sh.v[2] / sp, rz = -sh.v[0] / sp;
    S.p[0] = sh.p[0] + rx * 1.4; S.p[2] = sh.p[2] + rz * 1.4; S.p[1] = sh.p[1] + 0.3; S.v[0] = sh.v[0] - rx * 4; S.v[1] = sh.v[1]; S.v[2] = sh.v[2] - rz * 4; }, id0);
  await sleep(2500);
  const b1 = await Promise.all(pages.map(pg => pg.evaluate(() => ({ bumps: Net.bumps || 0, mode: __ski.game().mode, speed: __ski.game().s.speed, crash: __ski.game().s.crash }))));
  console.log('bumps before', b0.join(','), ' after', JSON.stringify(b1));
  if (OUT) for (let i = 0; i < N; i++) await pages[i].screenshot({ path: path.join(OUT, 'mp_' + i + '.png') });
  // 3. the loop: page 0 put 60 m above the join (the mountain loops: past it is the top again, nothing moved, nothing made again)
  const L0 = await pages[0].evaluate(() => { const G = __ski.game(), W = __ski.m.Course.loop; __ski.app().swap(() => G.reset(W.B - 60), true); G.start(); return { s: -G.s.p[2], loops: Net.loops, B: W.B }; });
  await pages[0].waitForFunction(() => Net.loops > 0, null, { timeout: 60000 }).catch(() => { });
  await sleep(4000);
  const L1 = await pages[0].evaluate(() => ({ s: -__ski.game().s.p[2], loops: Net.loops, mode: __ski.game().mode, swapping: !!__ski.app().swapping }));
  // (and page 1, a lap behind now, still sees page 0 just where it is on its own lap's snow)
  const X = await pages[1].evaluate(() => { const P = [...Net.peers.values()].find(P => P.show && !P.show.stale && P.show.run && P.id !== Net.id); return P ? { p: P.show.p.slice(), gap: P.show.p[1] - __ski.m.Course.height(P.show.p[0], P.show.p[2], 0.5) } : null; });
  console.log('loop: before', JSON.stringify(L0), ' after', JSON.stringify(L1), ' seen from page 1', JSON.stringify(X));
  const ok = { seeAll, near: A.worst < 4, bump: b1[0].bumps > b0[0] && b1[1].bumps > b0[1] && b1.every(x => x.mode === 'run'), loop: L1.loops === L0.loops + 1 && L1.s > L0.B && L1.mode === 'run' && !L1.swapping && !!X && Math.abs(X.gap) < 1.5 };
  console.log('errors', errs.length ? errs.slice(0, 8).join('\n') : 'none');
  console.log(Object.values(ok).every(Boolean) && !errs.length ? 'ALL_PASS' : 'FAIL', JSON.stringify(ok));
  for (const b of browsers) await b.close();
})().catch(e => { console.error(e); process.exit(1); });
