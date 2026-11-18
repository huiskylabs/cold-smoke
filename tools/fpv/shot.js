// 第一视角修前修后：同一段滑行、同一时刻，各出一张图（雪道上，不在空中）。
// 用法: node tools/fpv/shot.js <页面 html> <输出目录> <前缀> [宽=1600] [高=1000] [额外 query，如 "&v-fpcam=a"]
// REALGPU=1 用本机显卡（Mac 上用这个）；总是无头、无窗口，只用 playwright 自带的 Chromium（不碰系统里的 Chrome）。
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const [PAGE, OUT, TAG, W = '1600', H = '1000', Q = ''] = process.argv.slice(2);
// seed: 哪座山；t: 滑多少秒再拍；amp/period: 测试驾驶员转弯多大、多快；tuck: 最后几秒压低
const CASES = [
  { id: '1_起步慢滑', seed: 0, t: 4 },
  { id: '2_中速转弯', seed: 0, t: 17 },
  { id: '3_中速换刃', seed: 0, t: 19.3 },
  { id: '4_高速', seed: 1, t: 30 },
  { id: '5_高速转弯', seed: 2, t: 26 },
  { id: '6_俯冲', seed: 1, t: 34, tuck: 3 },
];
(async () => {
  const args = process.env.REALGPU ? ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] : ['--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader'];
  const browser = await chromium.launch({ headless: true, args: args.concat(['--no-sandbox']) });
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  for (const c of CASES) {
    if (only && !only.some(k => c.id.startsWith(k))) continue;
    const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
    page.on('pageerror', e => console.log('pageerror:', e.message));
    await page.goto('file://' + path.resolve(PAGE) + `?dev&manual&w=${W}&h=${H}&gov=0&offscreen=1` + Q);
    const b = await page.evaluate(() => window.__ski.boot()); if (!/^ok/.test(b)) throw new Error(b);
    const r = await page.evaluate(async ([c, nodraw]) => {
      const ski = window.__ski, M = ski.m, G = M.Game;
      if (nodraw) { const gl = M.App.gfx.gl; if (gl) gl.drawElementsInstanced = gl.drawArraysInstanced = gl.drawElements = gl.drawArrays = gl.clear = () => { }; }
      ski.tod('day'); ski.reset(c.seed); G.setView('fp', true);
      const pilot = ski.pilot(c.amp || 0.6, c.period || 4.5); G.start();
      // (in the air nothing is taken: run on until the skis are on the snow)
      const n = c.t * 60; let i = 0;
      for (; i < n || (G.flight && G.flight.w > 0.05) || G.s.air; i++) { M.Input.script = pilot(G.runT); if (c.tuck) M.Input.btn.tuck = i > n - c.tuck * 60; ski.frame(1 / 60); if (i > n + 600) break; }
      return { sp: +G.s.speed.toFixed(1), lean: +(G.pose.lean || 0).toFixed(2), tuck: +(G.pose.tuck || 0).toFixed(2), backend: M.App.gfx.caps.backend + ' / ' + (M.App.gfx.caps.renderer || ''), png: nodraw ? null : await ski.shot() };
    }, [c, !!process.env.NODRAW]);
    if (r.png) fs.writeFileSync(path.join(OUT, `${TAG}_${c.id}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
    console.log(`${TAG} ${c.id}: 速度 ${r.sp} m/s 倾斜 ${r.lean} 压低 ${r.tuck}  ${r.backend}`);
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
