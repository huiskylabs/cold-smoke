// The rings of a challenge line, as they are laid for every player, plus the run around them (edges, lanes, trees, kickers, stations), for the
// plan drawings in the review doc. No picture is drawn here: the skier is carried down the line's own ring sequence one metre and a half at a
// time and every ring the game lays is noted. node tools/ring-plan.js <out.json> [line=a] [diffs=abc]
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || 'ring-plan.json'), line = process.argv[3] || 'a', diffs = (process.argv[4] || 'abc').split('');
(async () => {
  const b = await chromium.launch({ headless: true });
  const pg = await b.newPage({ viewport: { width: 640, height: 360 }, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev');
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 240000 });
  const res = { line, diffs: {} };
  for (const d of diffs) {
    if (await pg.evaluate(() => __ski.ui().state) !== 'title') { await pg.evaluate(() => __ski.ui().toTop()); await pg.waitForFunction(() => __ski.ui().state === 'title', null, { timeout: 60000 }); }
    await pg.evaluate(([l, d]) => { const V = __ski.m.Variants; V.set('ringdiff', d); V.set('rline', l); __rings.chal = true; __ski.ui().go(); }, [line, d]);
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 60000 });
    await pg.evaluate(() => { __rings.line.cT = 99; });
    await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 60000 });
    const r = await pg.evaluate(() => {
      const G = __ski.game(), C = __ski.m.Course, RG = __rings, L = RG.line, seen = new Map();
      const keep = () => { for (const q of RG.rings) if (!q.skip && !seen.has(q.id)) seen.set(q.id, { s: q.s, u: q.u, x: q.x, y: q.y, r: q.r, air: q.air, fin: !!q.fin, tag: q.tag }); };
      const mode0 = G.mode; let s = -G.s.p[2]; const s0 = s; let steps = 0;
      while (steps++ < 20000) {
        G.mode = 'run'; keep();
        const cur = RG.rings.find(q => q.pass < 0 && !q.skip), c = C.at(s);
        const x = cur ? cur.x : c.cx;
        G.s.p[0] = x; G.s.p[2] = -s; G.s.p[1] = C.height(x, -s, 0.5); G.s.v[0] = 0; G.s.v[1] = 0; G.s.v[2] = -20; G.s.speed = 20; G.s.air = false;
        if (cur && cur.air) G.s.p[1] = cur.y - 0.9;
        try { RG.frame(); } catch (e) { return { err: String(e) }; }
        keep(); if (L.st === 'done' || L.fin && !RG.rings.some(q => q.pass < 0 && !q.skip)) break;
        s += 1.5;
      }
      G.mode = mode0;
      const xp = RG.xPlan && RG.xPlan(); return { s0, sEnd: L.sEnd, xpath: xp ? xp.path : null, xoff: xp ? xp.off : null, xms: xp ? xp.ms : null, rings: [...seen.values()].sort((a, b) => a.s - b.s), st: L.st, passed: RG.passed, missed: RG.missed };
    });
    res.diffs[d] = r; console.log('diff', d, 'rings', r.rings ? r.rings.length : r, 'x plan ms', r.xms, 'off-run', r.xoff, 'passed', r.passed, 'missed', r.missed, 'st', r.st);
  }
  // the run around the line: centre, half width, the lanes beside it, stations, kickers, trees (cells within 70 m of the run's edge)
  res.terrain = await pg.evaluate(([sA, sB]) => {
    const C = __ski.m.Course, cx = [], segs = [], kick = [], trees = []; const T = 4.5;
    for (let s = sA; s <= sB; s += 4) { const c = C.at(s); cx.push([s, c.cx, c.hw, C.ways(s).slice(1)]); }
    for (const g of C.segs) if (g.s0 <= sB) segs.push({ s0: g.s0, len: g.len, type: g.type, name: (typeof SEG_NAMES !== 'undefined' && SEG_NAMES[g.type]) || g.type });
    for (const [, fb] of C.feats) for (const f of fb) if (f.kind === 'kicker' && f.s < sB) kick.push({ s: f.s, len: f.len, u: f.u, wid: f.wid, mark: !!f.mark });
    const o = {}, done = new Set();
    for (let s = sA; s <= sB; s += T) { const c = C.at(s), j = Math.floor(-s / T);
      for (let x = c.cx - c.hw - 70; x <= c.cx + c.hw + 70; x += T) { const i = Math.floor(x / T), k = i + ',' + j; if (done.has(k)) continue; done.add(k); C.treeInCell(i, j, o); if (o.ok) trees.push([+o.x.toFixed(1), +(-o.z).toFixed(1), +o.r.toFixed(2)]); } }
    return { cx, segs, kick, trees };
  }, [Math.min(...Object.values(res.diffs).map(r => r.s0 || 0)) - 20, Math.max(...Object.values(res.diffs).map(r => r.sEnd || 0)) + 30]);
  fs.writeFileSync(out, JSON.stringify(res)); console.log('wrote', out, 'trees', res.terrain.trees.length, 'errors', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
