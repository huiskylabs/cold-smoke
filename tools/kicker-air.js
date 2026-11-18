// Measures the flight off the flagged kickers (headless playwright Chromium, no window): node tools/kicker-air.js
// For each of the first kickers of the run: rides at it down its lane with a straight pilot, twice: skis flat over the lip (no jump), and
// with jump held (the game fires it at the lip). Logs, per metre past the lip, the skier's height above the lip, and the speed at the lip.
const path = require('path'); const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 640, height: 360 }, deviceScaleFactor: 1 });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&v-rings=on');
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 180000 });
  const res = await pg.evaluate(async () => {
    const C = __ski.m.Course, G = __ski.game(), R = __rings, I = __ski.m.Input || window.Input;
    const out = [];
    // the kickers: search the run for flagged ones
    const ks = []; for (let s = 0; s < 6000 && ks.length < 4; s += 20) { const f = R.kickerIn(s, s + 20); if (f && !ks.includes(f)) ks.push(f); }
    for (const f of ks) for (const jump of [false, true]) {
      const lip = R.lipOf(f);
      if (G.mode !== 'run') G.start();
      // put the skier 60 m before the lip in the kicker's lane, moving down the fall line at a steady speed
      const s0 = lip.s - 60, c0 = C.at(s0); G.s.p[0] = c0.cx + f.u; G.s.p[2] = -s0; G.s.p[1] = C.height(G.s.p[0], -s0, 0.5);
      if (G.s.v) { G.s.v[0] = 0; G.s.v[1] = 0; G.s.v[2] = -18; }
      const pil = () => { const s = -G.s.p[2], c = C.at(s + 15), tx = c.cx + f.u; return Math.max(-0.6, Math.min(0.6, (Math.atan2(tx - G.s.p[0], 15) - Math.atan2(G.s.v[0], -G.s.v[2])) * 2.0)); };
      const tr = []; let vLip = null;
      for (let k = 0; k < 600; k++) {
        const s = -G.s.p[2];
        if (I) { I.btn.jump = jump && s > lip.s - 12 && s < lip.s + 2; }
        __ski.sim(1 / 60, s < lip.s - 2 ? pil : () => 0, { draw: false });
        const s2 = -G.s.p[2];
        if (vLip === null && s2 >= lip.s) vLip = +G.s.speed.toFixed(1);
        if (s2 >= lip.s - 1) tr.push([+(s2 - lip.s).toFixed(1), +(G.s.p[1] - lip.y).toFixed(2), G.s.air ? 1 : 0, +(G.s.p[0] - lip.x).toFixed(2)]);
        if (s2 > lip.s + 45) break;
      }
      if (I) I.btn.jump = false;
      // height above the lip at 4, 8, 12, 16, 20, 25, 30 m past it, and the longest air
      const at = d => { const p = tr.find(t => t[0] >= d); return p ? p[1] : null; };
      let peak = -1e9, peakD = 0, land = null; for (const t of tr) { if (t[1] > peak) { peak = t[1]; peakD = t[0]; } if (land === null && t[0] > 1 && !t[2]) land = t[0]; }
      out.push({ s: Math.round(lip.s), h: +f.h.toFixed(2), len: +f.len.toFixed(1), jump, vLip, peak: +peak.toFixed(2), peakD, land, at: [4, 8, 12, 16, 20, 25, 30].map(d => [d, at(d)]) });
    }
    return out;
  });
  for (const r of res) console.log(JSON.stringify(r));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
