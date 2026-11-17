// "分摊到多帧"的原型安不安全：一段滑行里，排队的带子最多攒了多少条、每层窗口边上最多有几行（列）还没生成。
// 网格只画到窗口中心 ±64 格，窗口是 ±128 格，所以"没生成的行数"只要远小于 64，就不可能被画到。
// 用法: node sliceq.js [帧数=1800] [CPU 降速倍数=1]   （PAGE=别的页面；Q=额外地址参数）
const { chromium } = require('playwright'), path = require('path');
const [NF = '1800', RATE = '1'] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan'], channel: process.env.CHANNEL || undefined });
  const page = await browser.newPage({ viewport: { width: 640, height: 360 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('pageerror:', e.message));
  await page.goto('file://' + path.resolve(__dirname, process.env.PAGE || 'tmp/dev-perf.html') + '?dev&manual&w=640&h=360&gov=0&backend=webgl2' + (process.env.Q ? '&' + process.env.Q : ''));
  await page.evaluate(async () => { await window.__ski.boot(); });
  await page.evaluate(() => { window.__ski.sim(6, window.__ski.pilot(), { draw: false }); const gl = __perf.gl; gl.drawElementsInstanced = () => { }; gl.drawArraysInstanced = () => { }; gl.clear = () => { }; });
  const r = await page.evaluate(([nf]) => {
    const I = __int, T = I.Terrain, pilot = window.__ski.pilot();
    for (let i = 0; i < 200; i++) { window.__ski.input().script = pilot(window.__ski.game().runT); I.tick(1 / 60, true); }      // 先把"瞬移"攒下的队列干完
    let maxQ = 0, sumQ = 0, maxK = 0, maxSp = 0; const pend = T.levels.map(() => [0, 0, 0, 0]), lagX = T.levels.map(() => 0);
    for (let f = 0; f < nf; f++) {
      window.__ski.input().script = pilot(window.__ski.game().runT); I.tick(1 / 60, true);
      const q = (T.queue || T.sliceQ).length; maxQ = Math.max(maxQ, q); sumQ += q; maxK = Math.max(maxK, T.lastStrips || 0); maxSp = Math.max(maxSp, I.Game.s.speed);
      T.levels.forEach((L, l) => { if (L.pend) for (let s = 0; s < 4; s++) pend[l][s] = Math.max(pend[l][s], L.pend[s]); if (L.mx != null) lagX[l] = Math.max(lagX[l], Math.abs(L.mx - L.cx)); });
    }
    return { nf, maxQ, avgQ: sumQ / nf, maxK, maxSp, pend, lagX };
  }, [+NF]);
  console.log(`# 排队情况 | ${process.env.PAGE || 'tmp/dev-perf.html'} ${NF} 帧，最高速度 ${r.maxSp.toFixed(1)} m/s`);
  console.log(`队列最长 ${r.maxQ} 条，平均 ${r.avgQ.toFixed(2)} 条；一帧最多做 ${r.maxK} 条`);
  r.pend.forEach((p, l) => console.log(`  第 ${l} 层: 四条边上最多欠着 左 ${p[0]} 右 ${p[1]} 下坡方向 ${p[2]} 上坡方向 ${p[3]} 格（离被画到的余量 64 格）` + (r.lagX[l] ? `；窗口比网格最多偏 ${r.lagX[l]} 格` : '')));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
