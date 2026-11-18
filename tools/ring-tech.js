// Does each line's rings teach the way to ski the stretch they stand in? For every ring in a gully: how far from the trough's line, how far
// up the wall (0 floor .. 1 rim, >1 on the bank above), and the wall's pitch there; for every ring in a mogul field: the metres to the next
// ring, its side of the field's middle, whether it stands in a trough (snow under it vs the bumps either side). Rings are laid as in
// tools/ring-plan.js (skier carried down its own ring sequence). Physics/logic only, no picture. node tools/ring-tech.js <out.json> [html=dist/dev.html] [lines=a,x] [diffs=abc]
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || 'ring-tech.json'), html = path.resolve(process.argv[3] || path.join(__dirname, '../dist/dev.html'));
const lines = (process.argv[4] || 'a,x').split(','), diffs = (process.argv[5] || 'abc').split('');
(async () => {
  const b = await chromium.launch({ headless: true });
  const pg = await b.newPage({ viewport: { width: 480, height: 270 }, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + html + '?dev');
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 240000 });
  await pg.evaluate(() => { __ski.m.Variants.set('rflow', 'off'); });
  const res = {};
  for (const line of lines) for (const d of diffs) {
    if (await pg.evaluate(() => __ski.ui().state) !== 'title') { await pg.evaluate(() => __ski.ui().toTop()); await pg.waitForFunction(() => __ski.ui().state === 'title', null, { timeout: 60000 }); }
    await pg.evaluate(([l, d]) => { const V = __ski.m.Variants; V.set('ringdiff', d); V.set('rline', l); __rings.chal = true; __ski.ui().go(); }, [line, d]);
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 60000 });
    await pg.evaluate(() => { __rings.line.cT = 99; });
    await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 60000 });
    res[line + d] = await pg.evaluate(() => {
      const G = __ski.game(), C = __ski.m.Course, RG = __rings, L = RG.line, seen = new Map();
      const keep = () => { for (const q of RG.rings) if (!q.skip && !seen.has(q.id)) seen.set(q.id, { s: q.s, u: q.u, x: q.x, y: q.y, r: q.r, air: q.air, fin: !!q.fin }); };
      const mode0 = G.mode; let s = -G.s.p[2], steps = 0;
      while (steps++ < 20000) {
        G.mode = 'run'; keep();
        const cur = RG.rings.find(q => q.pass < 0 && !q.skip), c = C.at(s), x = cur ? cur.x : c.cx;
        G.s.p[0] = x; G.s.p[2] = -s; G.s.p[1] = C.height(x, -s, 0.5); G.s.v[0] = 0; G.s.v[1] = 0; G.s.v[2] = -20; G.s.speed = 20; G.s.air = false;
        if (cur && cur.air) G.s.p[1] = cur.y - 0.9;
        RG.frame(); keep(); if (L.st === 'done' || L.fin && !RG.rings.some(q => q.pass < 0 && !q.skip)) break;
        s += 1.5;
      }
      G.mode = mode0;
      const rings = [...seen.values()].sort((a, b) => a.s - b.s), H = (x, s) => C.height(x, -s, 0.5), gully = [], mog = [];
      const typeAt = s => { let t = null; for (const g of C.segs) if (g.s0 <= s) t = g.type; return t; };
      rings.forEach((q, i) => {
        const c = C.at(q.s), ty = typeAt(q.s);
        if (c.gul > 0.6) {
          const tc = c.cx + c.goff, ug = q.x - tc, bell = g => Math.exp(-(g * g) / (c.gw * c.gw)), pr = g => c.gU > 0.001 && C.uWall ? bell(g) + (C.uWall(g, c) - bell(g)) * c.gU : bell(g);
          const up = 1 - pr(ug), pitch = Math.atan(Math.abs(H(q.x + 0.5, q.s) - H(q.x - 0.5, q.s))) * 57.3, floor = H(tc, q.s);
          gully.push({ s: Math.round(q.s), ty, ug: +ug.toFixed(1), up: +up.toFixed(2), onBank: up > 0.96, pitch: Math.round(pitch), aboveFloor: +(H(q.x, q.s) - floor).toFixed(1), r: q.r });
        } else if (c.mog > 0.5 && !q.air) {
          const M = C.mogShape(), hb = Math.max(H(q.x - M.W * 0.5, q.s), H(q.x + M.W * 0.5, q.s)), hh = H(q.x, q.s), nx = rings[i + 1];
          const ch = C.mogChan ? C.mogChan(q.s, c.hw) : null;
          mog.push({ s: Math.round(q.s), ty, u: +q.u.toFixed(1), chan: ch === null ? null : +ch.toFixed(1), gapNext: nx ? Math.round(nx.s - q.s) : null, trough: +(hb - hh).toFixed(2), r: q.r });
        }
      });
      // where each ring stands (越野线 is meant to be off the run, in the places the run does not go)
      const where = {}, side = []; for (const q of rings) { const c = C.at(q.s), u = q.x - c.cx, e = Math.abs(u) - c.hw; let w;
        const lane = (C.waysK ? C.waysK(q.s) : []).find(l => Math.abs(u - l.u) < l.w * 1.3);
        let drop = false; for (let bb = Math.floor((q.s - 40) / 32); bb <= Math.floor((q.s + 40) / 32); bb++) for (const f of C.feats.get(bb) || []) if (f.kind === 'drop' && q.s - f.lip > -12 && q.s - f.lip < 24 && Math.abs(u - f.u) < f.wid * 0.6) drop = true;
        if (q.fin) w = '终点'; else if (q.air) w = '跳台空中'; else if (drop) w = '跳崖'; else if (lane) w = lane.kind === 'gully' ? '林间雪槽' : '林间小道';
        else if (c.gul > 0.6 && e < 18) w = '主道雪槽'; else if (c.mog > 0.5 && e < 2) w = '主道蘑菇'; else if (e < 0) w = '主道'; else w = '道外树林/野雪';
        where[w] = (where[w] || 0) + 1; side.push(q.fin ? '' : e < 0 ? '|' : u < 0 ? 'L' : 'R'); }
      const n = rings.length, gs = C.segs.filter(g => g.s0 < (L.sEnd || 1e9)).map(g => g.type + '@' + Math.round(g.s0));
      return { n, segs: gs, gully, mog, where, side: side.join('').replace(/(.)\1+/g, '$1') };
    });
    const r = res[line + d], g = r.gully, m = r.mog;
    console.log(line + d, 'rings', r.n, '| gully', g.length, 'onBank', g.filter(q => q.onBank).length, 'up', g.map(q => q.up).join(','), '| moguls', m.length, 'gaps', m.map(q => q.gapNext).join(','), 'trough', m.map(q => q.trough).join(','), '\n   where', JSON.stringify(r.where), 'sides', r.side);
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
