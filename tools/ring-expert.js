// How close together can the rings of one station stand and still be skied in one smooth line by an expert? For each spacing asked, the
// 速降线 is started, the skier is set down 40 m above the station at a given speed, and an expert pilot rides it: it sees the ring in front
// and the flames after it (as a player does), and follows a smooth curve (Catmull-Rom) through them, looking 0.8 s ahead; it never hits
// the brakes on purpose. Reported per spacing: rings through / met in the station, mean and lowest speed, the share of time the steering
// is at full lock (an expert's line is smooth: full lock means the rings are too close), crashes. Physics only, no picture.
// node tools/ring-expert.js <out.json> <type=gully|moguls|steeps|...> <gaps, e.g. 30,40,50 (moguls: rows 1,2,3)> [diff=b] [v0=14]
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || 'ring-expert.json'), type = process.argv[3] || 'gully', gaps = (process.argv[4] || '30,40,50').split(',').map(Number);
const diff = process.argv[5] || 'b', v0 = +(process.argv[6] || 14);
(async () => {
  const b = await chromium.launch({ headless: true });
  const pg = await b.newPage({ viewport: { width: 320, height: 180 }, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev');
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
  await pg.evaluate(() => __ski.m.Variants.set('rflow', 'off'));
  const res = { type, diff, v0, trials: [] };
  for (const g of gaps) {
    if (await pg.evaluate(() => __ski.ui().state) !== 'title') { await pg.evaluate(() => __ski.ui().toTop()); await pg.waitForFunction(() => __ski.ui().state === 'title', null, { timeout: 240000 }); }
    await pg.evaluate(([d]) => { const V = __ski.m.Variants; V.set('ringdiff', d); V.set('rline', 'a'); __rings.chal = true; __ski.ui().go(); }, [diff]);
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 240000 });
    await pg.evaluate(() => { __rings.line.cT = 99; });
    await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 240000 });
    const r = await pg.evaluate(async ([type, g, v0, LOOK, LAT, NOYAW]) => {
      const G = __ski.game(), S = G.s, C = __ski.m.Course, RG = __rings, Input = __ski.m.Input || window.Input;
      const PL = RG.PLAN[type]; const keep = PL.gap.slice(), keepZ = Object.assign({}, RG.ZIPROWS);
      if (PL.how === 'zip') for (const k in RG.ZIPROWS) RG.ZIPROWS[k] = g; else PL.gap = [g, g];
      const sg = C.segs.find(q => q.type === type && q.idx < C.ROUTE.length); if (!sg) return { err: 'no station ' + type };
      const sA = sg.s0, sB = sg.s0 + sg.len, s0 = sA - 40, c0 = C.at(s0);
      S.p[0] = c0.cx; S.p[2] = -s0; S.p[1] = C.height(c0.cx, -s0, 0.5); S.v[0] = 0; S.v[1] = 0; S.v[2] = -v0; S.speed = v0;
      RG.noYaw = !!NOYAW; RG.frame();
      const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
      let lock = 0, brake = 0, deep = 0, T = 0, vs = 0, vmin = 1e9, crashes = 0, wasC = false; const seen = new Map();
      const steer = () => {
        const p = S.p, s = -p[2], ah = RG.rings.filter(q => q.pass < 0 && !q.skip).slice(0, 3);
        const pts = [[p[0] - S.v[0] * 0.5, s + S.v[2] * 0.5], [p[0], s]].concat(ah.map(q => [q.x, q.s]));
        while (pts.length < 5) { const l = pts[pts.length - 1]; pts.push([C.at(l[1] + 30).cx, l[1] + 30]); }
        // the point Ld along the curve from the skier
        const Ld = Math.max(6, Math.max(S.speed, 5) * LOOK); let acc = 0, prev = pts[1], tx = pts[2][0], ts = pts[2][1];
        outer: for (let i = 1; i < pts.length - 2; i++) for (let k = 1; k <= 20; k++) {
          const t = k / 20, x = cr(pts[i - 1][0], pts[i][0], pts[i + 1][0], pts[i + 2][0], t), z = cr(pts[i - 1][1], pts[i][1], pts[i + 1][1], pts[i + 2][1], t);
          acc += Math.hypot(x - prev[0], z - prev[1]); prev = [x, z]; if (acc >= Ld) { tx = x; ts = z; break outer; } }
        const st = (Math.atan2(tx - p[0], ts - s) - Math.atan2(S.v[0], -S.v[2])) * 2.4, sc = Math.max(-0.85, Math.min(0.85, st));
        if (Math.abs(sc) >= 0.84) lock += 1 / 60;
        // (用户 19:25 UTC: 高手把压刃、转弯、刻滑、刹车都用得非常好) the edges and the speed as an expert uses them: the radius the line asks
        // for over the next two rings, and the speed that radius takes at about 1 g sideways. Too fast for it: weight forward through the
        // bottom of the turn, the tails wash out and scrub speed (brake). In speed but the turn is sharp: down while steering, the deep carve
        // (more edge, a tighter arc). Otherwise centred and carving
        let R = 1e9; for (let i = 2; i < Math.min(pts.length - 1, 4); i++) { const a = pts[i - 1], b2 = pts[i], c2 = pts[i + 1], la = Math.hypot(b2[0] - a[0], b2[1] - a[1]), lb = Math.hypot(c2[0] - b2[0], c2[1] - b2[1]), lc = Math.hypot(c2[0] - a[0], c2[1] - a[1]), cross = Math.abs((b2[0] - a[0]) * (c2[1] - a[1]) - (b2[1] - a[1]) * (c2[0] - a[0])); if (cross > 1e-3) R = Math.min(R, la * lb * lc / (2 * cross)); }
        const vOk = Math.sqrt(LAT * R); let fa = 0;
        if (S.speed > vOk) { fa = Math.min(1, (S.speed - vOk) / 3); brake += 1 / 60; } else if (Math.abs(sc) > 0.55) { fa = -1; deep += 1 / 60; }
        Input.faScript = fa; return sc;
      };
      while (-S.p[2] < sB && T < 200) {
        __ski.sim(0.05, steer, { draw: false }); RG.frame(); T += 0.05;
        for (const q of RG.rings) if (!q.skip && q.s >= sA && q.s <= sB && q.pass >= 0 && !seen.has(q.id)) seen.set(q.id, { s: Math.round(q.s), u: +q.u.toFixed(1), hit: !!q.hit, yaw: +((q.yaw || 0) * 57.3).toFixed(1), head: +(Math.atan2(S.v[0], -S.v[2]) * 57.3).toFixed(1) });
        const s = -S.p[2]; if (s > sA) { vs += S.speed * 0.05; vmin = Math.min(vmin, S.speed); }
        if (S.crash > 0.8 && !wasC) crashes++; wasC = S.crash > 0.8;
        if (Math.round(T * 20) % 40 === 0) await new Promise(q => setTimeout(q, 0));
      }
      Input.faScript = null; PL.gap = keep; Object.assign(RG.ZIPROWS, keepZ);
      const tin = T - 40 / Math.max(v0, 1), rs = [...seen.values()];
      return { gap: g, len: Math.round(sg.len), met: rs.length, thru: rs.filter(q => q.hit).length, vMean: +(vs / Math.max(1e-3, T) * 3.6).toFixed(0), vMin: +(vmin * 3.6).toFixed(0), lockShare: +(lock / T).toFixed(2), brakeShare: +(brake / T).toFixed(2), deepShare: +(deep / T).toFixed(2), crashes, T: +T.toFixed(1), rings: rs };
    }, [type, g, v0, +(process.env.LOOK || 0.8), +(process.env.LAT || 10), process.env.NOYAW === "1"]);
    res.trials.push(r); console.log(type, 'gap', g, JSON.stringify(Object.assign({}, r, { rings: undefined })));
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
