// 一帧的账本：draw call、三角形、渲染目标、每帧上传量、资源总量、开机各阶段耗时。
// 用法: node ledger.js [额外地址参数，如 "tod=night&quality=2"] [模拟秒数=12] [w=640] [h=360]
// 输出 JSON 到标准输出（进度到标准错误）。SwiftShader 软件渲染：这里只数东西，不计帧时间。
const { chromium } = require('playwright'), path = require('path');
const [extra = '', simS = '12', W = '640', H = '360'] = process.argv.slice(2);
(async () => {
  const t0 = Date.now(), log = (...a) => console.error(...a);
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan', '--enable-precise-memory-info', '--js-flags=--expose-gc'] });
  // 环境变量 PHONE=1：模拟手机横屏（触屏、无悬停、设备像素比 3），不强制画布尺寸，让游戏自己按画质档决定画多大
  const PHONE = !!process.env.PHONE;
  const page = await browser.newPage(PHONE ? { viewport: { width: +W, height: +H }, deviceScaleFactor: +(process.env.DPR || 3), isMobile: true, hasTouch: true } : { viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  const cons = []; page.on('console', m => cons.push(m.text())); page.on('pageerror', e => log('pageerror:', e.message));
  await page.goto('file://' + path.resolve(__dirname, process.env.PAGE || 'tmp/dev-perf.html') + (PHONE ? `?dev&manual&gov=0&backend=webgl2` : `?dev&manual&w=${W}&h=${H}&gov=0&backend=webgl2`) + (extra ? '&' + extra : ''));
  const boot = await page.evaluate(async () => { const t = performance.now(); const r = await window.__ski.boot(); return { r, ms: performance.now() - t }; });
  log('boot', boot.r, Math.round(boot.ms) + 'ms');
  const out = { query: extra, w: +W, h: +H, boot, bootLog: cons.filter(s => /^(vista|deer|trees|terrain|quality)/.test(s)) };
  out.caps = await page.evaluate(() => { const g = __perf.gfx; return g.caps; });
  // 资源
  out.res = await page.evaluate(() => {
    const P = __perf, by = {}; let tb = 0;
    for (const t of P.tex) if (t.alive) { const k = t.format + ' ' + t.w + 'x' + t.h + (t.mips ? ' mips' : ''); by[k] = by[k] || { n: 0, bytes: 0 }; by[k].n++; by[k].bytes += t.bytes; tb += t.bytes; }
    let bb = 0, nb = 0; for (const b of P.buf) if (b.alive) { bb += b.bytes; nb++; }
    return { texBytes: tb, texByKind: by, nTex: P.tex.filter(t => t.alive).length, bufBytes: bb, nBuf: nb,
      pipes: P.pipes.map(p => ({ name: p.name, create: +p.tCreate.toFixed(1), finish: +(p.tFinish || 0).toFixed(1), vs: p.vsLen, fs: p.fsLen, nu: p.nu, ntex: p.ntex })) };
  });
  // 跑一段，再画几帧记账
  const sim = await page.evaluate(([s]) => window.__ski.sim(s, window.__ski.pilot(), { draw: false }), [+simS]);
  log('sim', JSON.stringify(sim));
  out.sim = sim;
  out.frames = await page.evaluate(async () => {
    const P = __perf, I = __int, pilot = window.__ski.pilot(), fr = [];
    for (let i = 0; i < 4; i++) {
      window.__ski.input().script = pilot(window.__ski.game().runT);
      P.frameBegin(); window.__ski.frame(); const r = P.frameEnd(); P.gl.finish();
      fr.push(r);
    }
    return fr;
  });
  out.state = await page.evaluate(() => { const I = __int; return { W: I.Render.W, H: I.Render.H, shadowRes: I.Render.shadowRes, tier: I.Quality.tier, blur: I.Render.motionBlur, bloom: I.Post.bloomLevels, treeStats: I.Trees.stats, heap: performance.memory ? performance.memory.usedJSHeapSize : null, NC: I.Grains.NC, handheld: matchMedia('(pointer: coarse) and (hover: none)').matches, dpr: devicePixelRatio, why: I.Quality.why, L: I.Quality.L }; });
  console.log(JSON.stringify(out));
  await browser.close(); log('done', ((Date.now() - t0) / 1000).toFixed(1) + 's');
})().catch(e => { console.error(e); process.exit(1); });
