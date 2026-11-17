// 调速器（99_main.js 的 govern）在几种"假想的手机"上会怎么做：直接喂给它一串帧间隔和每帧脚本耗时，看 60 秒后清晰度（Render.scale）和档位停在哪。
// 不是真机测量：只验证判断逻辑。用法: node govtest.js   （对比 ?v-govjs=a 原来的算法 和 默认的新算法）
const { chromium } = require('playwright'), path = require('path');
const CASES = [
  ['显卡和脚本都够快（16.7 ms，脚本 3 ms）', i => [16.7, 3]],
  ['每秒 4 次 80 ms 的脚本尖峰，其余帧准时', i => i % 12 === 0 ? [83.3, 3] : [16.7, i % 12 === 11 ? 80 : 3]],
  ['显卡慢（每帧 25 ms，脚本 3 ms）', i => [25, 3]],
  ['显卡慢，一半的帧掉到 33 ms（脚本 3 ms）', i => [i % 2 ? 33.3 : 16.7, 3]],
  ['脚本慢（每帧 33 ms，脚本 20 ms）', i => [33.3, 20]],
  ['显卡很慢，脚本也不快（每帧 50 ms，脚本 18 ms）', i => [50, 18]],
];
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan'] });
  console.log('# 调速器逻辑测试：60 秒后的清晰度和档位（清晰度 1 = 不缩；档位 0 高 / 1 均衡 / 2 流畅）');
  for (const q of ['v-govjs=a', '']) {
    console.log(q ? '原来的算法（v-govjs=a）' : '新算法（默认）');
    for (const [name, fn] of CASES) {
      const page = await browser.newPage({ viewport: { width: 640, height: 360 }, deviceScaleFactor: 1 });
      page.on('pageerror', e => console.error('pageerror:', e.message));
      await page.goto('file://' + path.resolve(__dirname, 'tmp/dev-perf.html') + '?dev&manual&backend=webgl2' + (q ? '&' + q : ''));
      await page.evaluate(async () => { await window.__ski.boot(); });
      const r = await page.evaluate(src => {
        const fn = eval(src), I = __int, G = I.App.gov; G.on = true; I.Quality.pick = 'auto'; let now = 1000, i = 0;
        for (; now < 64000; i++) { const [raw, js] = fn(i); now += raw; I.App.stepS = js / 1000; I.govern(now, raw / 1000); }
        return { scale: I.Render.scale, tier: I.Quality.tier, w: I.Render.W, h: I.Render.H };
      }, fn.toString());
      console.log(`  ${name}: 清晰度 ${r.scale.toFixed(2)}，档位 ${r.tier}，画面 ${r.w}x${r.h}`);
      await page.close();
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
