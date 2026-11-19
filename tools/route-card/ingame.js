// 路线卡 in the game, end to end: a challenge is ridden by the test pilot (as tools/line-ride.js), then the result card's 路线卡 button is
// pressed, and what the player would see is kept: the card itself (its canvas, 1200x1600) and the whole screen with the card over the game.
// Checks: the run was recorded, the mountain grids filled, the button is on the result card, no page errors. Playwright's own Chromium,
// headless, never a window (GPU=1 on the Mac for the real GPU). node tools/route-card/ingame.js <out dir> [line=a] [diff=b]
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright');
const outDir = path.resolve(process.argv[2] || 'route-card-ingame'), line = process.argv[3] || 'a', diffs = [(process.argv[4] || 'b')]; fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const b = await chromium.launch({ headless: true, args: process.env.GPU ? ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'] : [] });
  const pg = await b.newPage({ viewport: { width: +(process.env.VW || 1280), height: +(process.env.VH || 720) }, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || /line:|pick:/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await pg.goto('file://' + path.resolve(__dirname, '../../dist/dev.html') + '?dev');
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
  const res = { line, diffs: {} };
  for (const d of diffs) {
    if (await pg.evaluate(() => __ski.ui().state) !== 'title') { await pg.evaluate(() => __ski.ui().toTop()); await pg.waitForFunction(() => __ski.ui().state === 'title', null, { timeout: 240000 }); }
    await pg.evaluate(([l, d]) => { const V = __ski.m.Variants; V.set('ringdiff', d); V.set('rline', l); __rings.chal = true; __ski.ui().go(); }, [line, d]);
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 240000 });
    await pg.evaluate(() => { __rings.line.cT = 99; });
    await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 240000 });
    const r = await pg.evaluate(async () => {
      const G = __ski.game(), S = G.s, C = __ski.m.Course, RG = __rings, L = RG.line, xp = RG.xPlan && RG.xPlan(), tn = {}, pc = {};
      const steer = () => {
        const p = S.p, s = -p[2], look = 10 + Math.max(S.speed, 4) * 0.9, cur = RG.rings.find(q => q.pass < 0 && !q.skip);
        let tx, ts;
        if (cur && cur.s - s < 30 && cur.s - s > 1) { tx = cur.x; ts = cur.s; }
        else if (xp) { ts = s + look; const k = Math.min(xp.path.length - 1, Math.round(ts / 4)); tx = C.at(ts, pc).cx + xp.path[k]; }
        else if (cur) { tx = cur.x; ts = cur.s; } else { ts = s + look; tx = C.at(ts, pc).cx; }
        const tz = -ts;
        for (let k = 1; k <= 8; k++) { const qx = p[0] + (tx - p[0]) * k / 8, qz = p[2] + (tz - p[2]) * k / 8; C.nearTree(qx, qz, tn); if (tn.ok && !tn.soft && tn.d < 3.4) tx += (qx >= tn.x ? 1 : -1) * (4.6 - tn.d) * (k < 3 ? 2.6 : 1.1); }
        return Math.max(-0.85, Math.min(0.85, (Math.atan2(tx - p[0], -(tz - p[2])) - Math.atan2(S.v[0], -S.v[2])) * 2.4));
      };
      let crashes = 0, wasCrash = false, slowT = 0, offT = 0, T = 0, vmax = 0; const slow = [], crashAt = [];
      while (T < 900 && L.st === 'go') {
        __ski.sim(0.1, steer, { draw: false }); RG.frame(); T += 0.1;
        const s = -S.p[2], c = C.at(s, pc);
        if (S.crash > 0.8 && !wasCrash) { crashes++; crashAt.push(Math.round(s)); } wasCrash = S.crash > 0.8;
        if (S.speed < 3) { slowT += 0.1; if (!slow.length || s - slow[slow.length - 1] > 20) slow.push(Math.round(s)); }
        if (Math.abs(S.p[0] - c.cx) > c.hw) offT += 0.1; vmax = Math.max(vmax, S.speed);
        if (Math.round(T * 10) % 50 === 0) await new Promise(q => setTimeout(q, 0));
      }
      // the last metres to the finish ring
      for (let k = 0; k < 0; k++) { __ski.sim(0.1, steer, { draw: false }); RG.frame(); T += 0.1; }
      return { st: L.st, T: +T.toFixed(1), s: Math.round(-S.p[2]), sEnd: L.sEnd, passed: RG.passed, missed: RG.missed, crashes, crashAt, slowT: +slowT.toFixed(1), slow: slow.slice(0, 30), offShare: +(offT / T).toFixed(2), vmax: +(vmax * 3.6).toFixed(0), plan: xp ? { rings: xp.rings.length, off: +xp.off.toFixed(2), ms: xp.ms } : null };
    });
    res.diffs[d] = r; console.log(line, d, JSON.stringify(r));
    await pg.waitForFunction(() => window.RouteCardGame && RouteCardGame.data && RouteCardGame.data.ready, null, { timeout: 120000 });
    await pg.waitForTimeout(800);
    const info = await pg.evaluate(() => { const D = RouteCardGame.data, btn = [...document.querySelectorAll('#rline .card button')].map(b => b.textContent);
      return { track: D.track.length, rings: D.rings.length, passed: D.rings.filter(q => q.pass).length, segs: D.segs.length, line: D.line, diff: D.diff, score: D.score, player: D.player, rank: D.rank, buttons: btn }; });
    console.log('card data', JSON.stringify(info));
    // 1) beside the result: the small card came in with the result card (用户 2026-11-19: 弹统计时路线卡要一起出来)
    await pg.evaluate(() => __ski.frame());
    await pg.screenshot({ path: path.join(outDir, 'result_' + line + '.png') });
    const dk = await pg.evaluate(() => { const c = document.querySelector('#rline .rcdock'); if (!c) return null; const r = c.getBoundingClientRect(), k = document.querySelector('#rline .card').getBoundingClientRect();
      return { opacity: getComputedStyle(c).opacity, w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), cardLeft: Math.round(k.left), overlap: r.right > k.left + 1 }; });
    console.log('dock', JSON.stringify(dk));
    // 2) tap it: the card large
    await pg.evaluate(() => document.querySelector('#rline .rcdock').click());
    await pg.waitForTimeout(600);
    const png = await pg.evaluate(() => document.querySelector('#rcard canvas').toDataURL('image/png'));
    fs.writeFileSync(path.join(outDir, 'card_' + line + '.png'), Buffer.from(png.split(',')[1], 'base64'));
    await pg.evaluate(() => __ski.frame());
    await pg.screenshot({ path: path.join(outDir, 'screen_' + line + '.png') });
    // 3) close, 继续滑, and find it again in the pause menu (用户 2026-11-19: 关了继续滑以后找不到之前的路线卡)
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
    await pg.evaluate(() => document.querySelector('#rline .card [data-a=free]').click()); await pg.waitForTimeout(1500);
    const after = await pg.evaluate(() => ({ dockOpacity: getComputedStyle(document.querySelector('#rline .rcdock')).opacity, hist: RouteCardGame.hist.length, kept: RouteCardGame.hist.filter(e => e.blob).length }));
    await pg.evaluate(() => __ski.ui().menu()); await pg.waitForTimeout(800);
    const mb = await pg.evaluate(() => { const b = document.getElementById('m-rcard'); return b ? { hidden: b.hidden, text: b.textContent, shown: !!(b.offsetWidth || b.offsetHeight) } : null; });
    await pg.evaluate(() => document.getElementById('m-rcard').click()); await pg.waitForTimeout(600);
    await pg.evaluate(() => __ski.frame());
    await pg.screenshot({ path: path.join(outDir, 'menu_' + line + '.png') });
    const big = await pg.evaluate(() => ({ on: document.getElementById('rcard').classList.contains('on'), n: document.querySelector('#rcard .n').textContent }));
    console.log('after free ski', JSON.stringify({ after, menuButton: mb, big }));
    // 4) the next day: a fresh page still has it (IndexedDB)
    await pg.reload(); await pg.waitForFunction(() => window.__ski && window.RouteCardGame && __ski.ui().state === 'title', null, { timeout: 300000 });
    await pg.waitForTimeout(1500);
    const kept = await pg.evaluate(async () => { __ski.ui().menu(); await new Promise(q => setTimeout(q, 800)); const b = document.getElementById('m-rcard'); if (b) b.click(); await new Promise(q => setTimeout(q, 800));
      return { hist: RouteCardGame.hist.length, button: b ? !b.hidden : null, open: document.getElementById('rcard').classList.contains('on'), n: document.querySelector('#rcard .n') && document.querySelector('#rcard .n').textContent }; });
    await pg.evaluate(() => __ski.frame());
    await pg.screenshot({ path: path.join(outDir, 'reload_' + line + '.png') });
    console.log('after reload', JSON.stringify(kept));
    console.log('wrote', outDir);
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
