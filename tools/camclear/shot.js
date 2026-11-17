// 修前修后对比图：同一段滑行、同一个手势（两指拖动转视角），各出一张图。
// 用法: node tools/camclear/shot.js <页面 html> <输出目录> <前缀> [宽=1280] [高=720]
// REALGPU=1 用本机显卡（Mac 上用这个；Mac 上要用 playwright 1.65 那份，~/node_modules 里的旧版找不到它的 Chromium）；总是无头、无窗口，只用 playwright 自带的 Chromium（不碰系统里的 Chrome）。
// NODRAW=1 只跑脚本不出图（检查脚本本身）。
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const [PAGE, OUT, TAG, W = '1280', H = '720'] = process.argv.slice(2);
// 每个镜头：先滑 t 秒，然后像玩家那样按住转视角（ty: 左右转多少，tp: 上下翻多少），保持 hold 秒再拍；view: 先换到哪个机位
const CASES = [
  { id: '1_往上翻', t: 24, ty: 0.15, tp: 0.95, hold: 1.2 },
  { id: '2_转到侧面', t: 38, ty: 1.7, tp: 0.6, hold: 1.2 },
  { id: '3_转到前面', t: 52, ty: 2.7, tp: 0.8, hold: 1.4 },
  { id: '4_正面机位再转', t: 30, view: 'front', ty: -1.8, tp: 0.9, hold: 1.4 },
];
(async () => {
  const args = process.env.REALGPU ? ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] : ['--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader'];
  const browser = await chromium.launch({ headless: true, args: args.concat(['--no-sandbox']) });
  fs.mkdirSync(OUT, { recursive: true });
  const log = [];
  for (const c of CASES) {
    const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
    page.on('pageerror', e => console.log('pageerror:', e.message));
    await page.goto('file://' + path.resolve(PAGE) + `?dev&manual&w=${W}&h=${H}&gov=0&offscreen=1`);
    const b = await page.evaluate(() => window.__ski.boot()); if (!/^ok/.test(b)) throw new Error(b);
    const r = await page.evaluate(async ([c, nodraw]) => {
      const ski = window.__ski, M = ski.m, G = M.Game, C = M.Course, R = M.Render;
      if (nodraw) { const gl = M.App.gfx.gl; if (gl) gl.drawElementsInstanced = gl.drawArraysInstanced = gl.drawElements = gl.drawArrays = gl.clear = () => { }; }
      ski.tod('day'); ski.reset(0); if (c.view) G.setView(c.view, true);
      const pilot = ski.pilot(0.6, 4.5); G.start();
      for (let i = 0; i < c.t * 60; i++) { M.Input.script = pilot(G.runT); ski.frame(1 / 60); }
      const L = G.look; let minEye = 1e9;
      for (let i = 0; i < c.hold * 60; i++) { L.hold = true; L.idle = 0; L.ty = c.ty; L.tp = c.tp; M.Input.script = pilot(G.runT); ski.frame(1 / 60); const p = R.cam.pos; minEye = Math.min(minEye, p[1] - C.height(p[0], p[2], 0.5)); }
      const p = R.cam.pos, eye = p[1] - C.height(p[0], p[2], 0.5);
      return { eye: +eye.toFixed(2), seg: C.segAt(-G.s.p[2]).type, backend: M.App.gfx.caps.backend + ' / ' + (M.App.gfx.caps.renderer || ''), png: nodraw ? null : await ski.shot() };
    }, [c, !!process.env.NODRAW]);
    if (r.png) fs.writeFileSync(path.join(OUT, `${TAG}_${c.id}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
    log.push(`${TAG} ${c.id}: 镜头离雪面 ${r.eye} m（${r.seg}） ${r.backend}`); console.log(log[log.length - 1]);
    await page.close();
  }
  fs.appendFileSync(path.join(OUT, 'log.txt'), log.join('\n') + '\n');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
