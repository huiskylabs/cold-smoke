// 回放暂停自测 (headless, playwright's own Chromium, no window): a short run is recorded, then played back. While it plays the rings'
// clock moves (their grains flow; it is the run's own recorded clock, so in this test, whose run was stepped faster than real time, it
// moves less than 1 s a second) and the sound is up; paused, the clock stands still and the whole sound is faded out; played again,
// both come back; leaving the replay puts the sound back.   node tools/replay-pause-check.js
const path = require('path');
const { chromium } = require('playwright');
const T0 = Date.now();
(async () => {
  const b = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--no-sandbox'] });
  const pg = await b.newPage({ viewport: { width: 320, height: 180 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => console.log('[page]', ((Date.now() - T0) / 1000).toFixed(0), m.text().slice(0, 200)));
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&v-rline=a&v-ringdiff=b&w=320&h=180&backend=webgl2');
  await pg.waitForFunction(() => window.__ski && window.__rings && window.Replay && __ski.ui().state === 'title', null, { timeout: 300000 });
  console.log('loaded', ((Date.now() - T0) / 1000).toFixed(0));
  await pg.evaluate(() => { __rings.chal = true; __ski.ui().go(); __ski.app().paused = true; });          // (the page's own loop stands aside: the test steps every frame itself)
  await pg.evaluate(async () => { for (let i = 0; i < 60 * 20 && __rings.line.st !== 'go'; i++) { __ski.step(1 / 60); __rings.frame(); await new Promise(r => setTimeout(r, 16)); } });          // (the count-down goes on the real clock)
  console.log('go', await pg.evaluate(() => __rings.line.st), ((Date.now() - T0) / 1000).toFixed(0));
  const rec = await pg.evaluate(async () => {
    const G = __ski.game();
    for (let i = 0; i < 8 * 60; i++) { (__ski.step(1 / 60), __rings.frame()); if (i % 30 === 29) await new Promise(r => setTimeout(r, 0)); }
    const L = __rings.line; for (const f of __rings.hooks.finish) f({ line: 'a', name: 'test', diff: 'b', score: G.runT, t: G.runT, missed: 0, passed: 0, splits: [], names: [], isNew: false });
    for (let i = 0; i < 4 * 60 && !Replay.state().sealed; i++) { (__ski.step(1 / 60), __rings.frame()); if (i % 30 === 29) await new Promise(r => setTimeout(r, 0)); }
    return Replay.state();
  });
  console.log('recorded', JSON.stringify(rec));
  const r = await pg.evaluate(async () => {
    const S = __ski.mod('Sound'); S.ensure(); S.unlocked = true; S.on = true;
    const log = []; const f0 = S.rig.fade.bind(S.rig); S.rig.fade = (v, t, tau) => { log.push(+v.toFixed(3)); return f0(v, t, tau); };
    const run = async n => { console.log('step', n, log.join(',')); const c0 = __rings.clock(); for (let i = 0; i < n; i++) { (__ski.step(1 / 60), __rings.frame()); await new Promise(r => setTimeout(r, 0)); } return +(__rings.clock() - c0).toFixed(3); };
    Replay.start(); await run(5);
    const play1 = await run(60), n1 = log.length;
    Replay.pause(true); const pausedClock = await run(60), fadePause = log.slice(n1);
    const n2 = log.length; Replay.pause(false); const play2 = await run(60), fadePlay = log.slice(n2);
    const n3 = log.length; Replay.setSpeed(0.5); const half = await run(60);
    Replay.pause(true); await run(3); const n4 = log.length; Replay.stop(); await run(3); const fadeStop = log.slice(n4);
    return { play1, pausedClock, fadePause, play2, fadePlay, half, fadeStop, drawn: __rings.rings.length };
  });
  console.log(JSON.stringify(r));
  const ok = r.play1 > 0 && r.pausedClock === 0 && r.fadePause.includes(0) && r.play2 > 0 && r.fadePlay.some(v => v > 0) && r.half > 0.3 * r.play2 && r.half < 0.7 * r.play2 && r.fadeStop.some(v => v > 0) && !errs.length;
  console.log(ok ? 'ALL_PASS' : 'FAIL', errs.slice(0, 5).join(' | '));
  await b.close(); process.exit(ok ? 0 : 1);
})();
