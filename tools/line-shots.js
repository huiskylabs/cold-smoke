// Screenshots of the 光圈速降线 flow, step by step, for review (headless, no window): playwright's own Chromium, never the installed Chrome.
//   node tools/line-shots.js <outDir> [line=b] [diff=b]
// Rides the line twice with a simple pilot aimed at the rings (the first run only leaves a record, so the second shows the comparisons),
// misses one ring on purpose, and takes: title, count-down 3, 出发, a ring ahead, a missed ring (+4), a station split, the finish, the card.
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || 'line-shots'), line = process.argv[3] || 'b', diff = process.argv[4] || 'b';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || /line:|rings/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  const url = 'file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&v-rline=' + line + '&v-ringdiff=' + diff;
  await pg.goto(url);
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 180000 });
  await pg.evaluate(() => { try { localStorage.removeItem('coldsmoke.line.' + __rings.line.id + '.' + (__ski.m.Variants.val.ringdiff || 'b')); } catch (e) { } __ski.tod('day'); });
  await pg.waitForTimeout(5000);
  let n = 0; const shot = async name => { n++; const f = path.join(out, String(n).padStart(2, '0') + '_' + name + '.png'); await pg.screenshot({ path: f }); console.log('shot', f); };
  // the pilot: at the ring in front (one ring, the missN-th, deliberately wide), else down the middle of the run
  await pg.evaluate(() => {
    window.__pilot = (missN) => () => {
      const G = __ski.game(), S = G.s, p = S.p, R = __rings, C = __ski.m.Course;
      const cur = R.rings.find(r => r.pass < 0 && !r.skip); let tx, tz;
      if (cur && cur.s + p[2] > -2) { tx = cur.x + ((R.passed + R.missed) === missN ? (cur.x > C.at(cur.s).cx ? -1 : 1) * (cur.r + 4) : 0); tz = -cur.s; }
      else { const c = C.at(-p[2] + 25); tx = c.cx; tz = p[2] - 25; }
      if (-(tz - p[2]) < 6) { const c = C.at(-p[2] + 20); tx = c.cx; tz = p[2] - 20; }
      return Math.max(-0.85, Math.min(0.85, (Math.atan2(tx - p[0], -(tz - p[2])) - Math.atan2(S.v[0], -S.v[2])) * 2.4));
    };
  });
  const startCount = async () => {
    await pg.evaluate(() => { __ski.ui().go(); });
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 20000 });
  };
  // ride until a condition, a little at a time so the screen keeps up
  const ride = (missN, cond, maxS = 400) => pg.evaluate(async ([missN, cond, maxS]) => {
    const f = __pilot(missN), check = new Function('R', 'L', 'G', 'return ' + cond), G = __ski.game(), t0 = G.runT;
    while (G.runT - t0 < maxS) { __ski.sim(0.05, f, { draw: false }); __rings.frame(); if (check(__rings, __rings.line, G)) return true; await new Promise(r => setTimeout(r, 0)); }
    return false;
  }, [missN, cond, maxS]);
  const settle = ms => pg.waitForTimeout(ms);

  // ---- run 1: leaves a record (title, count-down, first finish card)
  await shot('标题页');
  await startCount(); await settle(250); await shot('倒数_3');
  await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 10000 }); await settle(120); await shot('出发');
  await ride(-1, "L.st !== 'go'", 600);
  await settle(300); await shot('第一次_过终点');
  await settle(1800); await shot('第一次_成绩页');

  // ---- run 2: the comparisons
  await pg.evaluate(() => document.querySelector('#rline [data-a=again]').click());
  await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 30000 });
  await ride(99, "(() => { const c = R.rings.find(r => r.pass < 0 && !r.skip); return c && c.grow >= 0 && c.s + G.s.p[2] < 22 && c.s + G.s.p[2] > 14; })()");
  await shot('比赛中_前方光圈');
  await ride(2, 'R.missed > 0'); await settle(150); await shot('漏圈_罚时');
  await ride(99, 'L.split.length > 0'); await settle(250); await shot('过一站_分段对比');
  await ride(99, "(() => { const c = R.rings.find(r => r.pass < 0 && !r.skip); return c && c.fin && c.s + G.s.p[2] < 30; })()");
  await shot('前方终点圈');
  await ride(99, "L.st !== 'go'"); await settle(300); await shot('过终点_成绩');
  await settle(1800); await shot('成绩页');
  // (用户 18:54 UTC: 结束后就停下来): the skier brakes by himself; the game runs on in real time until he stands still
  await pg.waitForFunction(() => __ski.game().s.speed < 0.6, null, { timeout: 15000 }).catch(() => console.log('did not stop, speed', 0));
  console.log('speed after finish', await pg.evaluate(() => __ski.game().s.speed.toFixed(2)), 'mode', await pg.evaluate(() => __ski.game().mode)); await shot('刹停');
  const p0 = await pg.evaluate(() => __ski.game().s.p.slice()); await settle(3000);
  console.log('moved while parked (m)', await pg.evaluate(p0 => Math.hypot(...__ski.game().s.p.map((v, i) => v - p0[i])).toFixed(3), p0)); await shot('停住_3秒后');
  await pg.evaluate(() => document.querySelector('#rline [data-a=free]').click()); await settle(1500); console.log('after 继续滑 mode', await pg.evaluate(() => __ski.game().mode)); await shot('继续滑');
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
