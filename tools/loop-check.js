// 一起滑 无缝循环自测 (headless, no window: playwright's own Chromium, never the installed Chrome). node tools/loop-check.js [seed]
// The mountain loops (Course.loopTo, 03_course.js): past B the land is the land past A again, moved as one piece. Checks:
//  same: past B, every height, tree and jump is lap 0's, moved by (dX, dY, L), to the last bit
//  smooth: across the join (the last T metres before B) the snow bends no more sharply than it does anywhere else on the run
//  ski: a test pilot skis across the join: no jump in place, no sudden loss of speed, still running, the lap counted
const path = require('path');
const { chromium } = require('playwright');
const SEED = +(process.argv[2] || 0);
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--no-sandbox'] });
  const pg = await b.newPage({ viewport: { width: 320, height: 180 }, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&gov=0&w=320&h=180&mp=ws://127.0.0.1:1/none' + (SEED ? '#seed-' + SEED : ''));
  await pg.waitForFunction(() => window.__ski && window.Net && __ski.ui().state === 'title', null, { timeout: 300000 });
  const r = await pg.evaluate(() => {
    const C = __ski.m.Course; const W = C.loopTo({ A: 200, segs: 6 }); const out = { W };
    // same
    let worst = 0, n = 0, tw = 0;
    for (let s = W.B; s < W.B + 2 * W.L; s += 37.3) for (let u = -400; u <= 400; u += 23.7) {
      const c = C.at(s, {}), x = c.cx + u, k = C.lapOf(s), h = C.height(x, -s, 0.5), h0 = C.height(x - k * W.dX, -(s - k * W.L), 0.5) + k * W.dY;
      worst = Math.max(worst, Math.abs(h - h0)); n++;
    }
    for (let cj = Math.floor(-(W.B + 600) / 4.5); cj < Math.floor(-(W.B + 100) / 4.5); cj += 3) for (let ci = -80; ci < 80; ci += 2) {
      const t = C.treeInCell(ci, cj, {}), t0 = C.treeInCell(ci - Math.round(W.dX / 4.5), cj + Math.round(W.L / 4.5), {});
      if (t.ok !== t0.ok || t.ok && (Math.abs(t.x - W.dX - t0.x) > 1e-6 || Math.abs(t.z + W.L - t0.z) > 1e-6)) tw++;
    }
    out.same = { worst, n, treeMismatch: tw };
    // smooth: the largest change of slope over 2 m (down the run and across it), in the join and on 2 km of ordinary run
    const bendIn = (s0, s1) => { let m = 0; for (let s = s0; s < s1; s += 1) for (const u of [-12, -4, 0, 4, 12]) { const c = C.at(s, {}), x = c.cx + u, z = -s;
      const d2s = C.height(x, z - 2, 0.5) - 2 * C.height(x, z, 0.5) + C.height(x, z + 2, 0.5), d2u = C.height(x - 2, z, 0.5) - 2 * C.height(x, z, 0.5) + C.height(x + 2, z, 0.5);
      m = Math.max(m, Math.abs(d2s) / 4, Math.abs(d2u) / 4); } return m; };
    // (the ordinary run: the 95th percentile of the same over 200 m windows, so one mogul field does not set the bar)
    const win = []; for (let s = 300; s < W.B - 400; s += 200) win.push(bendIn(s, s + 200)); win.sort((a, b) => a - b);
    out.smooth = { join: bendIn(W.b0 - 20, W.B + 20), run95: win[Math.floor(win.length * 0.95)], runMax: win[win.length - 1] };
    out.drop = { dY: W.dY, slopeJoin: (C.at(W.B + 40, {}).baseY - C.at(W.b0 - 40, {}).baseY) / (W.T + 80) };
    return out;
  });
  console.log(JSON.stringify(r));
  // ski across the join
  const sk = await pg.evaluate(async () => {
    const C = __ski.m.Course, W = C.loop, G = __ski.game(), A = __ski.app(), I = __ski.input(), f = __ski.pilot(0.25, 5);
    A.onTick.push(() => { I.script = G.mode === 'run' ? f(G.runT) : null; });
    A.paused = true;
    __ski.app().swap(() => G.reset(W.B - 500), true); if (__ski.ui().go) __ski.ui().go(); for (let i = 0; i < 90 && G.mode !== 'run'; i++) { A.paused = false; __ski.step(1 / 30); A.paused = true; } if (G.mode !== 'run') G.start();
    const log = []; let prev = null, maxJump = 0, maxDrop = 0, lapSaid = '';
    for (let i = 0; i < 30 * 150 && -G.s.p[2] < W.B + 600; i++) {
      A.paused = false; __ski.step(1 / 30); A.paused = true;
      const p = G.s.p.slice(), sp = G.s.speed;
      if (prev) { const d = Math.hypot(p[0] - prev.p[0], p[2] - prev.p[2]); maxJump = Math.max(maxJump, d - Math.max(sp, prev.sp) / 30); if (-p[2] > W.b0 - 100) maxDrop = Math.max(maxDrop, prev.sp - sp); }
      prev = { p, sp };
      if (i % 150 === 0) log.push([+(-p[2]).toFixed(0), +sp.toFixed(1), G.mode]);
      const say = document.getElementById('mpsay'); if (say && /圈/.test(say.textContent)) lapSaid = say.textContent;
    }
    return { end: -G.s.p[2], mode: G.mode, maxJump, maxDrop, lap: C.lapOf(-G.s.p[2]), lapSaid, log };
  });
  console.log(JSON.stringify(sk));
  const ok = { same: r.same.worst < 1e-6 && r.same.treeMismatch === 0, smooth: r.smooth.join <= Math.max(r.smooth.run95 * 1.2, 0.05), ski: sk.end > r.W.B + 100 && sk.mode === 'run' && sk.maxJump < 0.2 && sk.maxDrop < 1.5 && sk.lap === 1, errors: errs.length === 0 };
  console.log(JSON.stringify(ok), errs.slice(0, 3));
  console.log(Object.values(ok).every(Boolean) ? 'ALL_PASS' : 'FAIL');
  await b.close();
})();
