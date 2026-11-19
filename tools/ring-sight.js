// (用户 2026-11-18 22:14 UTC: 设定圈的时候要确保追身视角靠近当前圈的时候能看到下一个圈或者光柱！全部检查一遍)
// Rides every ring line (速降线 a, 越野线 x) at every difficulty with the expert pilot of tools/ring-expert.js and the game's own chase
// camera, and each time the skier is 25, 15 and 8 m short of the ring in front, asks: is the NEXT ring, or the light column standing
// over it (while it is still a flame), in the picture and not hidden behind the snow or a tree? Physics/logic only, no picture.
// A point counts as seen when it is inside a 16:9 frame (a little in from the edges) and the straight line from the lens to it clears
// the snow and every tree crown (a cone, 0.24 x height wide at its foot). Points tried: the ring's centre and top, and the column at
// 3, 8, 14, 20 and 28 m over the flame (用户 22:31 UTC: 光柱在画面里就行，圈本身可以不在).
// node tools/ring-sight.js <out.json> [lines=a,x] [diffs=abc] [html=dist/dev.html]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const out = path.resolve(process.argv[2] || 'ring-sight.json'), lines = (process.argv[3] || 'a,x').split(','), diffs = (process.argv[4] || 'abc').split('');
const html = path.resolve(process.argv[5] || path.join(__dirname, '../dist/dev.html'));
(async () => {
  const b = await chromium.launch({ headless: true });
  const pg = await b.newPage({ viewport: { width: 480, height: 270 }, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + html + '?dev');
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
  const res = {};
  for (const line of lines) for (const d of diffs) {
    if (await pg.evaluate(() => __ski.ui().state) !== 'title') { await pg.evaluate(() => __ski.ui().toTop()); await pg.waitForFunction(() => __ski.ui().state === 'title', null, { timeout: 240000 }); }
    await pg.evaluate(([l, d]) => { const V = __ski.m.Variants; V.set('ringdiff', d); V.set('rline', l); V.set('rflow', 'g'); __rings.chal = true; __ski.ui().go(); }, [line, d]);
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 240000 });
    await pg.evaluate(() => { __rings.line.cT = 99; });
    await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 240000 });
    const r = await pg.evaluate(async ([LOOK, LAT]) => {
      const G = __ski.game(), S = G.s, C = __ski.m.Course, RG = __rings, Input = __ski.m.Input || window.Input, cam = __ski.m.Render.cam;
      // the ring clock is performance.now(): let it run with the ride
      const pn = performance.now.bind(performance), t0 = pn(); let tSim = 0; performance.now = () => t0 + tSim * 1000;
      const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
      const steer = () => {
        const p = S.p, s = -p[2], ah = RG.rings.filter(q => q.pass < 0 && !q.skip).slice(0, 3);
        const pts = [[p[0] - S.v[0] * 0.5, s + S.v[2] * 0.5], [p[0], s]].concat(ah.map(q => [q.x, q.s]));
        while (pts.length < 5) { const l = pts[pts.length - 1]; pts.push([C.at(l[1] + 30).cx, l[1] + 30]); }
        const Ld = Math.max(6, Math.max(S.speed, 5) * LOOK); let acc = 0, prev = pts[1], tx = pts[2][0], ts = pts[2][1];
        outer: for (let i = 1; i < pts.length - 2; i++) for (let k = 1; k <= 20; k++) {
          const t = k / 20, x = cr(pts[i - 1][0], pts[i][0], pts[i + 1][0], pts[i + 2][0], t), z = cr(pts[i - 1][1], pts[i][1], pts[i + 1][1], pts[i + 2][1], t);
          acc += Math.hypot(x - prev[0], z - prev[1]); prev = [x, z]; if (acc >= Ld) { tx = x; ts = z; break outer; } }
        const st = (Math.atan2(tx - p[0], ts - s) - Math.atan2(S.v[0], -S.v[2])) * 2.4, sc = Math.max(-0.85, Math.min(0.85, st));
        let R = 1e9; for (let i = 2; i < Math.min(pts.length - 1, 4); i++) { const a = pts[i - 1], b2 = pts[i], c2 = pts[i + 1], la = Math.hypot(b2[0] - a[0], b2[1] - a[1]), lb = Math.hypot(c2[0] - b2[0], c2[1] - b2[1]), lc = Math.hypot(c2[0] - a[0], c2[1] - a[1]), cross = Math.abs((b2[0] - a[0]) * (c2[1] - a[1]) - (b2[1] - a[1]) * (c2[0] - a[0])); if (cross > 1e-3) R = Math.min(R, la * lb * lc / (2 * cross)); }
        const vOk = Math.sqrt(LAT * R); let fa = 0;
        if (S.speed > vOk) fa = Math.min(1, (S.speed - vOk) / 3); else if (Math.abs(sc) > 0.55) fa = -1;
        Input.faScript = fa; return sc;
      };
      const ASP = 16 / 9, tn = { };
      // seen from the lens? 0 = yes, else why not
      const look = (P) => {
        const E = cam.pos, f = cam.fwd, dx = P[0] - E[0], dy = P[1] - E[1], dz = P[2] - E[2];
        const rgt = [-f[2], 0, f[0]], rl = Math.hypot(rgt[0], rgt[2]) || 1; rgt[0] /= rl; rgt[2] /= rl;
        const up = [rgt[1] * f[2] - rgt[2] * f[1], rgt[2] * f[0] - rgt[0] * f[2], rgt[0] * f[1] - rgt[1] * f[0]];
        const zf = dx * f[0] + dy * f[1] + dz * f[2]; if (zf < 1) return 'behind';
        const th = Math.tan((cam.fovY || 1) / 2), sx = (dx * rgt[0] + dz * rgt[2]) / zf / (th * ASP), sy = (dx * up[0] + dy * up[1] + dz * up[2]) / zf / th;
        if (sx < -0.94) return 'left'; if (sx > 0.94) return 'right'; if (sy > 0.94) return 'top'; if (sy < -0.94) return 'bottom';
        const L = Math.hypot(dx, dy, dz), n = Math.ceil(L / 1.5);
        for (let i = 1; i < n; i++) { const t = i / n, x = E[0] + dx * t, y = E[1] + dy * t, z = E[2] + dz * t, dl = L * t;
          if (y < C.height(x, z, 0.5) + 0.05) return 'snow';
          if (dl > 6 && L - dl > 2) { C.nearTree(x, z, tn); if (tn.ok && !tn.soft) { const g = C.height(tn.x, tn.z, 0.5), hy = (y - g) / Math.max(1, tn.h); if (hy > 0.08 && hy < 1 && tn.d < 0.24 * tn.h * (1 - hy) + 0.25) return 'tree'; } } }
        return 0;
      };
      const BINS = [25, 15, 8], rows = new Map();
      let T = 0;
      const sEnd = RG.line.sEnd || 1e9;
      while (T < 900 && RG.line.st === 'go') {
        __ski.sim(0.05, steer, { draw: false }); tSim += 0.05; RG.frame(); T += 0.05;
        const ah = RG.rings.filter(q => q.pass < 0 && !q.skip), cur = ah[0], nx = ah[1]; if (!cur || !nx || cur.fin) continue;
        const yw = cur.yaw || 0, ex = S.p[0] - cur.x, es = -S.p[2] - cur.s, dN = -(ex * Math.sin(yw) + es * Math.cos(yw));
        let row = rows.get(cur.id); if (!row) rows.set(cur.id, row = { id: cur.id, s: Math.round(cur.s), u: +cur.u.toFixed(1), next: { s: Math.round(nx.s), u: +nx.u.toFixed(1), id: nx.id }, at: {} });
        for (const bd of BINS) if (dN <= bd && row.at[bd] === undefined && dN > 0) {
          const flame = nx.grow < 0, pts = [[nx.x, nx.y, -nx.s], [nx.x, nx.y + nx.r, -nx.s]];
          if (flame) for (const h of [3, 8, 14, 20, 28]) pts.push([nx.x, nx.y + nx.r * 0.5 + h, -nx.s]);
          const why = pts.map(look), ok = why.some(w => w === 0);
          row.at[bd] = ok ? 1 : why[0];          // (1 seen; else why the ring's centre is not)
          if (ok) row.how = row.how || (why[0] === 0 || why[1] === 0 ? 'ring' : 'column');
        }
      }
      performance.now = pn; Input.faScript = null;
      const all = [...rows.values()].filter(q => Object.keys(q.at).length), bad = all.filter(q => BINS.some(bd => q.at[bd] !== undefined && q.at[bd] !== 1));
      const why = {}; for (const q of bad) for (const bd of BINS) if (q.at[bd] !== 1 && q.at[bd] !== undefined) why[q.at[bd]] = (why[q.at[bd]] || 0) + 1;
      return { n: all.length, bad: bad.length, bad8: all.filter(q => q.at[8] !== undefined && q.at[8] !== 1).length, why, passed: RG.passed, missed: RG.missed, T: +T.toFixed(0), st: RG.line.st, rows: all };
    }, [+(process.env.LOOK || 0.5), +(process.env.LAT || 5)]);
    res[line + d] = r;
    console.log(line + d, 'rings checked', r.n, '| next not seen at some of 25/15/8 m:', r.bad, '| not seen at 8 m:', r.bad8, '| why', JSON.stringify(r.why), '| pilot', r.passed + '/' + (r.passed + r.missed), r.st, r.T + 's');
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
