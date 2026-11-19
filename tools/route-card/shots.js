// 路线卡 mock-up pictures from a real pilot run (tools/route-ride.js): the three ways of drawing it (src/94_routecard.js, styles a/b/c), each
// as a 1600x900 PNG (and 3200x1800 with SCALE=2). Canvas 2D only, playwright's own Chromium, headless, no window (never the installed Chrome).
// node tools/route-card/shots.js <ride.json> <out dir> [styles=abc] [diff=b]
const path = require('path'), fs = require('fs'); const { chromium } = require('playwright');
const ride = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8')), outDir = path.resolve(process.argv[3] || 'route-card-out');
// styles: a letter per style; a 'v' after it = the tall 3:4 card, e.g. 'eev' = e wide and e tall
const styles = (process.argv[4] || 'abc').match(/[a-uw-z]v?/g), diff = process.argv[5] || 'b', scale = +(process.env.SCALE || 1);
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const b = await chromium.launch({ headless: true });
  const pg = await b.newPage({ viewport: { width: 800, height: 450 }, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.setContent('<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000"></body>');
  await pg.addScriptTag({ path: path.resolve(__dirname, '../../src/94_routecard.js') });
  const r = ride.diffs[diff], DN = { a: '轻松', b: '标准', c: '难' }, PEN = { a: 2, b: 4, c: 5 };
  for (const st of styles) {
    const t0 = Date.now();
    const url = await pg.evaluate(([r, line, dn, pen, st, scale]) => {
      const G = r.grid, nx = G.H[0].length, ny = G.H.length;
      // the mountain's height from the grid the pilot run kept (10 m), bilinear; null off the grid
      const H = (x, s) => { const fi = (x - G.x0) / G.step, fj = (s - G.s0) / G.step; if (fi < 0 || fj < 0 || fi >= nx - 1 || fj >= ny - 1) return null;
        const i = fi | 0, j = fj | 0, u = fi - i, v = fj - j, A = G.H[j], B = G.H[j + 1]; return (A[i] * (1 - u) + A[i + 1] * u) * (1 - v) + (B[i] * (1 - u) + B[i + 1] * u) * v; };
      const cx = r.cx.map((c, k) => [G.s0 + k * G.step, c[0], c[1]]).filter(c => c[0] >= 0 && c[0] <= r.track[r.track.length - 1][1] + 60);
      r.rings.forEach(q => { q.pass = !!q.hit; });          // (q.pass in the ride file is "met"; through the ring = hit)
      const TG = r.tgrid, tv = (i, j) => { const row = TG.D[j]; return row && row[i] != null ? row[i] / 100 : 0; };
      // the forest density, bilinear between its 8 m cells (so its edges are smooth shapes, not squares)
      const T = TG ? (x, s) => { const fi = (x - TG.x0) / TG.step, fj = (s - TG.s0) / TG.step, i = Math.floor(fi), j = Math.floor(fj), u = fi - i, v = fj - j; return (tv(i, j) * (1 - u) + tv(i + 1, j) * u) * (1 - v) + (tv(i, j + 1) * (1 - u) + tv(i + 1, j + 1) * u) * v; } : null;
      const missed = r.rings.filter(q => !q.fin && !q.pass).length;
      const d = { track: r.track, rings: r.rings.filter(q => !q.fin), segs: r.segs, names: r.names, H, cx, trees: r.trees, T, split: r.split, player: '雪友', rank: 12, line, diff: dn, mountain: '寒烟山',
        score: r.tEnd + missed * pen, t: r.tEnd, pen, date: Date.UTC(2026, 10, 18, 22, 47), seed: 20261118 };
      const cv = document.createElement('canvas'); const PT = st.endsWith('v'); st = PT ? st.slice(0, -1) : st; cv.width = (PT ? 1200 : 1600) * scale; cv.height = (PT ? 1600 : 900) * scale;
      RouteCard.draw(cv, d, st); return cv.toDataURL('image/png');
    }, [r, ride.line === 'x' ? '越野线' : '速降线', DN[diff], PEN[diff], st, scale]);
    const f = path.join(outDir, 'route_' + ride.line + '_' + st + '.png'); fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log('wrote', f, Date.now() - t0, 'ms');
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
