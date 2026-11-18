// The route a test pilot skis down a challenge line, kept for the 路线卡 (the result card's route picture): every 0.1 s where the skier was
// (x, s, height), how fast, in the air or not; every ring with where it stood and whether it was passed; the stations; and a height grid of
// the mountain round the line (for contours / ridgelines). Same pilot as tools/line-ride.js. Physics only (sim with draw off), no picture,
// playwright's own Chromium, headless, no window. node tools/route-ride.js <out.json> [line=x] [diffs=b]
// The pilot looks 10 m + 0.9 s ahead: on 越野线 at the line's own way (RG.xPlan().path), on 速降线 at the next ring; within 30 m of a ring it
// aims at the ring; it steers round any trunk on the way, as __ski.pilot does.
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || 'line-ride.json'), line = process.argv[3] || 'x', diffs = (process.argv[4] || 'b').split('');
(async () => {
  const b = await chromium.launch({ headless: true, args: process.env.GPU ? ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'] : [] });
  const pg = await b.newPage({ viewport: { width: 640, height: 360 }, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || /line:|pick:/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev');
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
      let crashes = 0, wasCrash = false, slowT = 0, offT = 0, T = 0, vmax = 0; const slow = [], crashAt = [], trk = [], seen = new Map();
      while (T < 900 && L.st === 'go') {
        __ski.sim(0.1, steer, { draw: false }); RG.frame(); T += 0.1;
        const s = -S.p[2], c = C.at(s, pc);
        if (S.crash > 0.8 && !wasCrash) { crashes++; crashAt.push(Math.round(s)); } wasCrash = S.crash > 0.8;
        if (S.speed < 3) { slowT += 0.1; if (!slow.length || s - slow[slow.length - 1] > 20) slow.push(Math.round(s)); }
        if (Math.abs(S.p[0] - c.cx) > c.hw) offT += 0.1; vmax = Math.max(vmax, S.speed);
        trk.push([+S.p[0].toFixed(2), +s.toFixed(2), +S.p[1].toFixed(2), +S.speed.toFixed(2), S.air ? 1 : 0]);
        for (const q of RG.rings) if (!q.skip && !seen.has(q.id)) seen.set(q.id, q);
        if (Math.round(T * 10) % 50 === 0) await new Promise(q => setTimeout(q, 0));
      }
      // the last metres to the finish ring
      for (let k = 0; k < 0; k++) { __ski.sim(0.1, steer, { draw: false }); RG.frame(); T += 0.1; }
      const rings = [...seen.values()].map(q => ({ s: +q.s.toFixed(1), x: +q.x.toFixed(2), y: +q.y.toFixed(2), r: q.r, air: !!q.air, fin: !!q.fin, hit: !!q.hit, pass: q.pass >= 0 })).sort((a, b) => a.s - b.s);
      const segs = C.segs.filter(g => g.s0 <= L.sEnd + 10).map(g => ({ s0: Math.round(g.s0), len: Math.round(g.len), type: g.type }));
      const xs = trk.map(t => t[0]), x0 = Math.floor((Math.min(...xs) - 900) / 10) * 10, x1 = Math.ceil((Math.max(...xs) + 900) / 10) * 10, s0 = -300, s1 = Math.ceil((L.sEnd + 300) / 10) * 10, H = [];
      for (let ss = s0; ss <= s1; ss += 10) { const row = []; for (let x = x0; x <= x1; x += 10) row.push(+C.height(x, -ss, 4).toFixed(1)); H.push(row); if (H.length % 40 === 0) await new Promise(q => setTimeout(q, 0)); }
      const cx = []; for (let ss = s0; ss <= s1; ss += 10) { const c = C.at(Math.max(0, ss)); cx.push([+c.cx.toFixed(1), +c.hw.toFixed(1)]); }
      const tr = []; for (let ss = 0; ss <= L.sEnd; ss += 6) { const c = C.at(ss); for (let x = c.cx - c.hw - 140; x <= c.cx + c.hw + 140; x += 6) { const d = C.treeDensity(x, -ss); if (d > 0.35) tr.push([Math.round(x), Math.round(ss), +d.toFixed(2)]); } }
      return { track: trk, rings, segs, grid: { x0, s0, step: 10, H }, cx, trees: tr, names: L.names, tEnd: L.tEnd, split: L.split && L.split.slice(),
        st: L.st, T: +T.toFixed(1), s: Math.round(-S.p[2]), sEnd: L.sEnd, passed: RG.passed, missed: RG.missed, crashes, crashAt, slowT: +slowT.toFixed(1), slow: slow.slice(0, 30), offShare: +(offT / T).toFixed(2), vmax: +(vmax * 3.6).toFixed(0), plan: xp ? { rings: xp.rings.length, off: +xp.off.toFixed(2), ms: xp.ms } : null };
    });
    res.diffs[d] = r; console.log(line, d, JSON.stringify(Object.assign({}, r, { track: r.track && r.track.length, rings: r.rings && r.rings.length, grid: undefined, cx: undefined, trees: r.trees && r.trees.length })));
  }
  fs.writeFileSync(out, JSON.stringify(res)); console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
