// 回放自测 (headless, no window: playwright's own Chromium, never the installed Chrome).
//   node tools/replay-check.js <outDir> [line=a] [shots=1]
// Rides a challenge line to the finish with a pilot aimed at the rings, then plays the replay back and checks, frame by frame, that the
// figure stands where the run had it (the replay must not ski another line), that the rings passed in the replay are the run's, that every
// camera gives a lens above the snow, and that leaving the replay puts the skier, the mode and the card back. With shots=1 it also takes
// pictures: the card with 回放, the replay through each camera, slow motion, paused, the bare picture, a phone on its side.
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const out = path.resolve(process.argv[2] || 'replay-check'), line = process.argv[3] || 'a', SHOTS = (process.argv[4] || '1') === '1';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const gpu = process.env.REALGPU ? ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'].concat(process.platform === 'darwin' ? ['--use-angle=metal'] : []) : ['--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader'];
  const b = await chromium.launch({ headless: true, args: gpu.concat(['--no-sandbox']) });
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: SHOTS ? 2 : 1, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || /replay|line:|rings/.test(m.text())) errs.push(m.text().slice(0, 240)); });
  const url = 'file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&v-rline=' + line + '&v-ringdiff=b' + (SHOTS ? '' : '&w=320&h=180') + (process.env.BACKEND ? '&backend=' + process.env.BACKEND : '');
  await pg.goto(url);
  await pg.waitForFunction(() => window.__ski && window.__rings && window.Replay && __ski.ui().state === 'title', null, { timeout: 300000 });
  console.log('renderer', await pg.evaluate(() => __ski.app().gfx.caps.backend + ' / ' + __ski.app().gfx.caps.renderer));
  await pg.evaluate(() => { __ski.tod('golden'); });
  await pg.waitForTimeout(2000);
  let n = 0; const shot = async name => { if (!SHOTS) return; await pg.waitForTimeout(400); n++; const f = path.join(out, String(n).padStart(2, '0') + '_' + name + '.png'); await pg.screenshot({ path: f }); console.log('shot', f); };
  await pg.evaluate(() => {
    window.__pilot = () => () => {
      const G = __ski.game(), S = G.s, p = S.p, R = __rings, C = __ski.m.Course;
      const cur = R.rings.find(r => r.pass < 0 && !r.skip); let tx, tz;
      if (cur && cur.s + p[2] > -2) { tx = cur.x; tz = -cur.s; } else { const c = C.at(-p[2] + 25); tx = c.cx; tz = p[2] - 25; }
      if (-(tz - p[2]) < 6) { const c = C.at(-p[2] + 20); tx = c.cx; tz = p[2] - 20; }
      return Math.max(-0.85, Math.min(0.85, (Math.atan2(tx - p[0], -(tz - p[2])) - Math.atan2(S.v[0], -S.v[2])) * 2.4));
    };
  });
  await pg.evaluate(() => { __rings.chal = true; __ski.ui().go(); });
  await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 30000 });
  console.log('recording at go', JSON.stringify(await pg.evaluate(() => Replay.state())));
  // ride to the finish, then on in real frames until the skier is parked (the game's own brake) and the recording is sealed
  const t0 = Date.now();
  const ok = await pg.evaluate(async () => {
    const f = __pilot(), G = __ski.game();
    while (G.runT < 900) { __ski.sim(0.1, f, { draw: false }); if (__rings.line.st !== 'go') return true; await new Promise(r => setTimeout(r, 0)); }
    return false;
  });
  console.log('finished', ok, 'in', ((Date.now() - t0) / 1000).toFixed(0), 's real', JSON.stringify(await pg.evaluate(() => ({ st: __rings.line.st, passed: __rings.passed, missed: __rings.missed, runT: __ski.game().runT }))));
  await pg.evaluate(async () => { const G = __ski.game(); for (let i = 0; i < 60 * 8 && !(Replay.state().sealed && G.mode === 'park'); i++) { Input.script = null; __ski.frame(1 / 60); if (i % 30 === 29) await new Promise(r => setTimeout(r, 0)); } });
  const st = await pg.evaluate(() => ({ s: Replay.state(), mode: __ski.game().mode, card: !!document.querySelector('#rline .card.on'), btn: !!document.querySelector('#rline [data-cb]') }));
  console.log('after finish', JSON.stringify(st));
  await shot('成绩卡_回放按钮');
  const before = await pg.evaluate(() => ({ p: __ski.game().s.p.slice(), mode: __ski.game().mode, passed: __rings.passed, missed: __rings.missed }));

  // ---- the replay: started with R on the card
  await pg.keyboard.press('KeyR');
  await pg.waitForFunction(() => Replay.state().on, null, { timeout: 5000 });
  console.log('replay on', JSON.stringify(await pg.evaluate(() => Replay.state())));
  // frame by frame through the whole replay (draw off), at 1x: the figure against the run's frames, the rings counted, events heard
  const chk = await pg.evaluate(async () => {
    const R = Replay, G = __ski.game(), lay = R.layout(), fp = lay.L.find(f => f.o === 's' && f.k === 'p'), rp = lay.L.find(f => f.o === 'pos' && f.k === '0');
    let maxD = 0, maxRoot = 0, frames = 0, ev = 0, maxPass = 0, maxMiss = 0, under = 0;
    const evs = {}; const E0 = G.events; 
    R.pause(true); R.seek(0); R.pause(false);
    while (R.state().on && R.state().play && frames < 60 * 600) {
      __ski.frame(1 / 60); frames++;
      const k = R.frameOf(); if (!k) break;
      // (between two recorded frames the replay eases: compare with the nearer one's tolerance, 1 frame of travel)
      maxD = Math.max(maxD, Math.hypot(G.s.p[0] - k[fp.off], G.s.p[2] - k[fp.off + 2]) - G.s.speed / 60);
      maxRoot = Math.max(maxRoot, Math.hypot(G.root.pos[0] - k[rp.off], G.root.pos[2] - k[rp.off + 2]) - G.s.speed / 60);
      maxPass = Math.max(maxPass, __rings.passed); maxMiss = Math.max(maxMiss, __rings.missed);
      const c = __ski.mod('Render').cam.pos; if (c[1] < __ski.m.Course.snowTop(c[0], c[2]) + 0.05) under++;
      if (frames % 60 === 0) await new Promise(r => setTimeout(r, 0));
    }
    return { frames, maxD: +maxD.toFixed(3), maxRoot: +maxRoot.toFixed(3), maxPass, maxMiss, under, st: R.state() };
  });
  console.log('playthrough', JSON.stringify(chk), 'run had passed', before.passed, 'missed', before.missed);
  // every camera, somewhere in the middle of the run, 1.5 s of frames each: lens above the snow and somewhere sensible
  const cams = ['chase', 'fp', 'tips', 'low', 'high', 'side', 'front', 'far', 'tv', 'orbit'];
  const mid = await pg.evaluate(() => Replay.state().dur * 0.42);
  for (const c of cams) {
    const r = await pg.evaluate(async ([c, mid]) => {
      const R = Replay; R.seek(mid); R.pause(false); R.setCam(c); let under = 0, far = 0, nan = 0;
      for (let i = 0; i < 90; i++) { __ski.frame(1 / 60); const cam = __ski.mod('Render').cam.pos, sk = __ski.game().root.pos; if (cam.some(v => !isFinite(v))) nan++; if (cam[1] < __ski.m.Course.snowTop(cam[0], cam[2]) + 0.05) under++; far = Math.max(far, Math.hypot(cam[0] - sk[0], cam[1] - sk[1], cam[2] - sk[2])); }
      return { c, under, nan, far: +far.toFixed(1), view: __ski.game().view };
    }, [c, mid]);
    console.log('cam', JSON.stringify(r));
    if (SHOTS) { await pg.evaluate(() => Replay.pause(false)); await pg.waitForTimeout(900); await shot('回放_' + c); }
  }
  if (SHOTS) {
    await pg.evaluate(m => { Replay.setCam('orbit'); Replay.seek(m); Replay.setSpeed(0.25); Replay.pause(false); }, mid); await pg.waitForTimeout(1500); await shot('回放_慢放环绕');
    await pg.evaluate(() => { Replay.setCam('fp'); Replay.setSpeed(1); Replay.pause(true); }); await shot('回放_暂停');
    await pg.keyboard.press('KeyH'); await shot('回放_隐藏界面'); await pg.keyboard.press('KeyH');
    await pg.setViewportSize({ width: 844, height: 390 }); await pg.evaluate(() => { Replay.setCam('chase'); Replay.pause(false); window.dispatchEvent(new Event('resize')); }); await pg.waitForTimeout(1200); await shot('手机横屏');
    await pg.setViewportSize({ width: 1280, height: 720 }); await pg.waitForTimeout(600);
  }
  // out again: Esc puts back the skier, the mode and the card
  await pg.keyboard.press('Escape');
  for (let i = 0; i < 10; i++) await pg.evaluate(() => __ski.frame(1 / 60));
  const after = await pg.evaluate(() => ({ p: __ski.game().s.p.slice(), mode: __ski.game().mode, passed: __rings.passed, missed: __rings.missed, card: !!document.querySelector('#rline .card.on'), on: Replay.state().on, menu: __ski.ui().open }));
  console.log('restored', JSON.stringify({ moved: +Math.hypot(...after.p.map((v, i) => v - before.p[i])).toFixed(3), mode: after.mode, wasMode: before.mode, rings: [after.passed, after.missed], wasRings: [before.passed, before.missed], card: after.card, on: after.on, menu: after.menu }));
  await shot('退出_回到成绩卡');
  // 继续滑 still works after a replay (the skier is given his skis back)
  await pg.evaluate(() => document.querySelector('#rline [data-a=free]').click());
  for (let i = 0; i < 30; i++) await pg.evaluate(() => __ski.frame(1 / 60));
  console.log('after 继续滑 mode', await pg.evaluate(() => __ski.game().mode));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
