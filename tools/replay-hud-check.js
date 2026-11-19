// 回放画面自测 (headless, playwright's own Chromium, no window, nothing drawn): while a line is skied, the top of the screen (#rline: the
// clock, the rings) is written down frame by frame; then the replay plays the run back and, at each frame of the run, the same place must
// say the same thing; the replay's own copy of the clock must be gone; leaving the replay puts the screen back as the run left it.
//   node tools/replay-hud-check.js
const path = require('path');
const { chromium } = require('playwright');
const T0 = Date.now();
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--no-sandbox'] });
  const pg = await b.newPage({ viewport: { width: 320, height: 180 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&v-rline=a&v-ringdiff=b&w=320&h=180&backend=webgl2');
  await pg.waitForFunction(() => window.__ski && window.__rings && window.Replay && __ski.ui().state === 'title', null, { timeout: 300000 });
  await pg.evaluate(() => { __rings.chal = true; __ski.ui().go(); __ski.app().paused = true; });          // (the page's own loop stands aside: the test steps every frame itself)
  await pg.evaluate(async () => { for (let i = 0; i < 60 * 20 && __rings.line.st !== 'go'; i++) { __ski.step(1 / 60); __rings.frame(); await new Promise(r => setTimeout(r, 16)); } });          // (the count-down goes on the real clock)
  console.log('go', await pg.evaluate(() => __rings.line.st), ((Date.now() - T0) / 1000).toFixed(0) + ' s');
  const r = await pg.evaluate(async () => {
    const G = __ski.game(), q = k => document.querySelector('#rline .' + k), shown = [];
    for (let i = 0; i < 20 * 60; i++) {
      __ski.step(1 / 60); __rings.frame();
      shown.push([+G.runT.toFixed(4), q('tm').textContent, q('sub').textContent]);
      if (i % 30 === 29) await new Promise(r => setTimeout(r, 0));
    }
    const live = { tm: q('tm').textContent, sub: q('sub').textContent };
    for (const f of __rings.hooks.finish) f({ line: 'a', name: '速降线', diff: 'b', score: 999, t: 999, bonus: 1.5, missed: 0, passed: 0, splits: [], names: [], isNew: false });
    for (let i = 0; i < 4 * 60 && !Replay.state().sealed; i++) { __ski.step(1 / 60); __rings.frame(); }
    const pre = { tm: q('tm').textContent, sub: q('sub').textContent };
    Replay.start(); let same = 0, diff = 0, ex = [], visible = 0;
    const own = !!document.querySelector('#replay .tm');
    const byT = new Map(shown.map(s => [s[0].toFixed(3), s]));
    while (Replay.state().on && Replay.state().play) {
      __ski.step(1 / 60); __rings.frame();
      const s = byT.get(G.runT.toFixed(3)); if (s) { const now = [q('tm').textContent, q('sub').textContent]; if (now[0] === s[1] && now[1] === s[2]) same++; else { diff++; if (ex.length < 4) ex.push([s, now]); } }
      const st = getComputedStyle(q('tm')); if (st.visibility !== 'hidden' && getComputedStyle(document.getElementById('rline')).display !== 'none') visible++;
      if ((same + diff) % 60 === 59) await new Promise(r => setTimeout(r, 0));
    }
    Replay.stop();          // (read straight after: the run's own HUD, still 'go' in this test, would write itself again on its next frame)
    const after = { tm: q('tm').textContent, sub: q('sub').textContent };
    // the finish as the replay shows it: the final time in the run's colour, the banner with the run's own words
    __rings.replayHud({ t: 8.9, passed: 3, missed: 1, play: true, fin: { t: 9, score: 4.5, passed: 3, missed: 1, bonus: 1.5, splits: [4, 9], names: ['一站', '终点'], segBest: [3.9], ban: '比最好慢 0.20 秒' } });
    __rings.replayHud({ t: 9.2, passed: 3, missed: 1, play: true, fin: { t: 9, score: 4.5, passed: 3, missed: 1, bonus: 1.5, splits: [4, 9], names: ['一站', '终点'], segBest: [3.9], ban: '比最好慢 0.20 秒' } });
    const fin = { tm: q('tm').textContent, cls: q('tm').className, sub: q('sub').textContent, ban: q('ban').classList.contains('on') ? q('ban').textContent : null };
    __rings.replayHud(null);
    return { fin, frames: shown.length, same, diff, ex, own, visible, sample: shown[shown.length - 1], after, pre };
  });
  console.log(JSON.stringify(r));
  const ok = r.same > 600 && r.diff === 0 && !r.own && r.visible > 600 && r.after.tm === r.pre.tm && r.fin.tm === '0:04.50' && /fin/.test(r.fin.cls) && r.fin.ban && /0\.20/.test(r.fin.ban) && !errs.length;
  console.log(ok ? 'ALL_PASS' : 'FAIL', errs.slice(0, 5).join(' | '));
  await b.close(); process.exit(ok ? 0 : 1);
})();
