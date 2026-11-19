// (用户 2026-11-19 06:08 UTC: 难度必须是你的选手用我们可用的这些手段跑得到的；如果用了所有手段都达不到，别人没法达到) Can every ring of a
// challenge line be passed with only the player's own controls? Rides one line at one difficulty with a pilot that plays like a good
// player: it steers like a finger (-1..1) toward the line through the rings it can see (the ring in front and the flames after it),
// plans its speed ahead (the tightest bend coming up sets how fast it may arrive, braking at DEC m/s^2 before it), brakes the way the
// game lets a player (weight forward, Up / W, while turning: the tails skid out), digs in (Down / S while turning) for a tight carve,
// and holds jump into a kicker that has an air ring after it. Nothing else: no teleports, no physics changes. Prints each missed ring
// with what stood between it and the one before (metres down, metres across, speed), so the generator can be fixed where it asks the
// impossible. node tools/ring-pilot.js <out.json> <line a|x> <diffs abc> [html]    env LOOK (s), LAT (m/s^2 trusted), DEC (m/s^2)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const out = path.resolve(process.argv[2] || 'ring-pilot.json'), line = process.argv[3] || 'a', diffs = (process.argv[4] || 'abc').split('');
const html = path.resolve(process.argv[5] || path.join(__dirname, '../dist/dev.html'));
(async () => {
  const b = await chromium.launch({ headless: true });
  const pg = await b.newPage({ viewport: { width: 320, height: 180 }, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + html + '?dev');
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
  const res = {};
  for (const d of diffs) {
    if (await pg.evaluate(() => __ski.ui().state) !== 'title') { await pg.evaluate(() => __ski.ui().toTop()); await pg.waitForFunction(() => __ski.ui().state === 'title', null, { timeout: 240000 }); }
    await pg.evaluate(([l, d]) => { const V = __ski.m.Variants; V.set('ringdiff', d); V.set('rline', l); V.set('rflow', 'g'); __rings.chal = true; __ski.ui().go(); }, [line, d]);
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 240000 });
    await pg.evaluate(() => { __rings.line.cT = 99; });
    await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 240000 });
    const r = await pg.evaluate(async ([LOOK, LAT, DEC, KCT, VMIN, GAIN, TRACE]) => {
      const G = __ski.game(), S = G.s, C = __ski.m.Course, RG = __rings, Input = __ski.m.Input || window.Input;
      const pn = performance.now.bind(performance), t0 = pn(); let tSim = 0; performance.now = () => t0 + tSim * 1000;
      const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
      const trace = [], TR = +TRACE; let plan = null, planT = -1, tick = 0, vAllow = 99, brakeN = 0;
      // the line the player means to ski: a smooth curve through the centres of the rings, from the last two passed to the four it can see
      // (fixed to the rings, not re-drawn from wherever the skier drifted, so it is followed and not cut inside)
      const mkPlan = () => {
        const all = RG.rings.filter(q => !q.skip), iC = all.findIndex(q => q.pass < 0), s0 = -S.p[2];
        const back = all.slice(Math.max(0, iC - 2), iC).map(q => [q.x0 ?? q.x, q.s]), ah = all.slice(iC, iC + 4).map(q => [q.x0 ?? q.x, q.s]);
        while (back.length < 2) back.unshift(back.length ? [back[0][0], back[0][1] - 30] : [S.p[0], s0 - 10]);
        const pts = back.concat(ah); while (pts.length < 6) { const l = pts[pts.length - 1], m = pts[pts.length - 2]; pts.push([l[0] + (l[0] - m[0]) * 0.3, l[1] + 30]); }
        const smp = [pts[0]];
        for (let i = 1; i < pts.length - 2; i++) { const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]), n = Math.max(2, Math.ceil(L)); for (let k = 1; k <= n; k++) { const t = k / n; smp.push([cr(pts[i - 1][0], pts[i][0], pts[i + 1][0], pts[i + 2][0], t), cr(pts[i - 1][1], pts[i][1], pts[i + 1][1], pts[i + 2][1], t)]); } }
        const dist = [0]; for (let i = 1; i < smp.length; i++) dist.push(dist[i - 1] + Math.hypot(smp[i][0] - smp[i - 1][0], smp[i][1] - smp[i - 1][1]));
        const R = smp.map(() => 1e9);
        for (let i = 3; i < smp.length - 3; i++) { const a = smp[i - 3], b2 = smp[i], c2 = smp[i + 3], la = Math.hypot(b2[0] - a[0], b2[1] - a[1]), lb = Math.hypot(c2[0] - b2[0], c2[1] - b2[1]), lc = Math.hypot(c2[0] - a[0], c2[1] - a[1]), cross = Math.abs((b2[0] - a[0]) * (c2[1] - a[1]) - (b2[1] - a[1]) * (c2[0] - a[0])); R[i] = cross > 1e-4 ? la * lb * lc / (2 * cross) : 1e9; }
        return { smp, dist, R };
      };
      const steer = () => {
        tick++;
        if (!plan || tick % 3 === 0) plan = mkPlan();
        const p = S.p, s = -p[2], P = plan.smp;
        // nearest point on the line, how far off it (+ = right of it), its heading a little ahead (what the line is about to do)
        let j = 0, bd = 1e9; for (let i = 0; i < P.length; i++) { const d = (P[i][0] - p[0]) ** 2 + (P[i][1] - s) ** 2; if (d < bd) { bd = d; j = i; } }
        const sp = Math.max(S.speed, 3), ja = Math.min(P.length - 2, j + Math.max(1, Math.round(sp * LOOK)));
        const hP = Math.atan2(P[ja + 1][0] - P[ja][0], P[ja + 1][1] - P[ja][1]), j2 = Math.min(P.length - 2, j);
        const tx = P[j2 + 1][0] - P[j2][0], ts = P[j2 + 1][1] - P[j2][1], tl = Math.hypot(tx, ts) || 1, cte = ((p[0] - P[j][0]) * ts - (s - P[j][1]) * tx) / tl;
        let e = hP - Math.atan2(S.v[0], -S.v[2]) - Math.atan2(KCT * cte, sp * 0.5 + 1); while (e > Math.PI) e -= 2 * Math.PI; while (e < -Math.PI) e += 2 * Math.PI;
        let u = Math.max(-1, Math.min(1, e * GAIN)); const nx0 = RG.rings.find(q => q.pass < 0 && !q.skip);
        // how fast it may go now: every bend ahead allows sqrt(LAT R), braking at DEC on the way to it
        let va = 99; for (let i = j + 2; i < P.length; i++) { const vc = Math.sqrt(LAT * plan.R[i]); va = Math.min(va, Math.sqrt(vc * vc + 2 * DEC * Math.max(0, plan.dist[i] - plan.dist[j] - 3))); }
        plan.va = Math.max(VMIN, va);
        vAllow = plan.va; let fa = 0;
        // (a jump: an air ring ahead, its kicker's lip 14 m before it; hold from 12 m out to just past the lip, the game fires at the lip)
        const cur = RG.rings.find(q => q.pass < 0 && !q.skip);
        Input.btn.jump = !!(cur && cur.air && s > cur.s - 14 - 12 && s < cur.s - 14 + 2);
        if (!S.air && S.speed > vAllow + 0.3 && !(cur && cur.air && s > cur.s - 40)) {
          // brake: weight forward while turning, the tails skid out; turning at least half over, toward where the line goes
          fa = 1; brakeN++;
          // (a skid needs the skis turned: into the turn the line is about to make, so the brake is also the start of that turn)
          const k1 = P[Math.min(P.length - 1, ja + 3)], k0 = P[ja], kx = (P[ja + 1][0] - P[ja][0]) * (k1[1] - k0[1]) - (P[ja + 1][1] - P[ja][1]) * (k1[0] - k0[0]), sg = kx > 0 ? -1 : 1;
          if (Math.abs(u) < 0.5 && (u * sg >= 0 || Math.abs(u) < 0.2)) u = sg * 0.5;
        } else if (Math.abs(u) > 0.55) fa = -1;
        Input.faScript = fa; if (TR && tick % 6 === 0) trace.push([+s.toFixed(1), +p[0].toFixed(2), +cte.toFixed(2), +u.toFixed(2), fa, +(S.speed * 3.6).toFixed(0), +(nx0 ? nx0.x0 ?? nx0.x : 0).toFixed(2), nx0 ? Math.round(nx0.s) : 0]); return u;
      };
      const miss = []; let T = 0, lastM = 0, lastP = null, minSp = 99;
      while (T < 1500 && RG.line.st === 'go' && !(TR && -S.p[2] > TR)) {
        const before = RG.rings.filter(q => q.pass >= 0 && !q.skip).length;
        __ski.sim(0.05, steer, { draw: false }); tSim += 0.05; RG.frame(); T += 0.05;
        const done = RG.rings.filter(q => q.pass >= 0 && !q.skip);
        if (done.length > before) for (const q of done.slice(before)) {
          if (!q.hit && !q.fin) {
            const yw = q.yaw || 0, ex = S.p[0] - q.x, es = -S.p[2] - q.s, dA = ex * Math.cos(yw) - es * Math.sin(yw);
            miss.push({ s: Math.round(q.s), r: q.r, air: !!q.air, du: lastP ? +((q.x0 ?? q.x) - lastP.x).toFixed(1) : null, ds: lastP ? Math.round(q.s - lastP.s) : null, v: +(S.speed * 3.6).toFixed(0), t: +T.toFixed(1), off: +dA.toFixed(2), seg: C.segAt(q.s).type });
          }
          lastP = { x: q.x0 ?? q.x, s: q.s };
        }
        minSp = Math.min(minSp, S.speed);
      }
      performance.now = pn; Input.faScript = null; Input.btn.jump = false;
      return { tEnd: RG.line.tEnd, passed: RG.passed, missed: RG.missed, T: +T.toFixed(1), st: RG.line.st, brakeS: +(brakeN / 60).toFixed(1), miss, trace };
    }, [+(process.env.LOOK || 0.35), +(process.env.LAT || 5), +(process.env.DEC || 4), +(process.env.KCT || 1.2), +(process.env.VMIN || 6), +(process.env.GAIN || 3), +(process.env.TRACE || 0)]);
    res[line + d] = r;
    console.log(line + d, JSON.stringify(r));
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
