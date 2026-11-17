// 同一时刻、同一机位，把"原版页面"和"变体页面"各画一张，逐像素比较。用来回答"这条优化看得出区别吗"。
// 先拿原版和原版自己比一次（对照）：两次加载之间本来就有的差别（随机的雪粒等）是底噪。
// 用法: node shotdiff.js <变体名,变体名…|none> [w=844] [h=390] [模拟秒数=12] [额外地址参数]
//   输出 PNG 到 tmp/shots/diff-<w>-<名字>.png，并打印：不同的像素占比（差值 > 8/255）、平均差、最大差。
//   变体名可以是地址参数（含 = 号，多个用 + 连，例如 v-pslice=a+v-mbtap=a），或 default（不带参数）：同一个页面换开关来比。
//   BASEQ=参数：原版那一边加的地址参数（例如 BASEQ='v-pslice=a&v-mbtap=a' 表示"所有新开关都关"当原版）。
// NOCTL=1：不做"原版对原版"的对照（省一次加载）。TAG=名字：输出文件名里多加一段，免得盖掉别的场景的截图。
// REAL=1 用真 GPU；CHANNEL=chrome 用系统 Chrome；FRAMES=N：模拟之后再正常画 N 帧才截图（默认 8）。
//   注意：模拟那段不画也不滚地形，等于一次"瞬移"；把地形滚动分摊到多帧的变体要先让排队的活干完再比，否则比的是瞬移后的中间状态：
//   DRAIN=N：模拟之后先空跑 N 帧（照常算、照常滚地形，只是不发 draw，所以快），再画 FRAMES 帧截图。分摊类变体用 DRAIN=200。
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const [names = 'none', W = '844', H = '390', simS = '12', extra = ''] = process.argv.slice(2);
(async () => {
  const REAL = !!process.env.REAL, NFR = +(process.env.FRAMES || 8), log = (...a) => console.error(...a);
  const browser = await chromium.launch({ args: REAL ? ['--enable-gpu', '--ignore-gpu-blocklist'] : ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan'], channel: process.env.CHANNEL || undefined });
  const outDir = process.env.OUTDIR || path.resolve(__dirname, 'tmp/shots'); fs.mkdirSync(outDir, { recursive: true });
  const grab = async (file, tag, q) => {
    const page = await browser.newPage({ viewport: { width: Math.min(+W, 1600), height: Math.min(+H, 900) }, deviceScaleFactor: 1 });
    page.on('pageerror', e => log('pageerror:', e.message));
    await page.goto('file://' + path.resolve(__dirname, file) + `?dev&manual&w=${W}&h=${H}&gov=0&backend=webgl2` + (extra ? '&' + extra : '') + (q ? '&' + q : ''));
    await page.evaluate(async () => { await window.__ski.boot(); });
    const r = await page.evaluate(async ([s, nfr, drain]) => {
      const pilot = window.__ski.pilot(); window.__ski.sim(s, pilot, { draw: false });
      if (drain) { const gl = __perf.gl, a = gl.drawElementsInstanced, b = gl.drawArraysInstanced; gl.drawElementsInstanced = () => { }; gl.drawArraysInstanced = () => { }; for (let i = 0; i < drain; i++) { window.__ski.input().script = pilot(window.__ski.game().runT); window.__ski.frame(); } gl.drawElementsInstanced = a; gl.drawArraysInstanced = b; }
      for (let i = 0; i < nfr; i++) { window.__ski.input().script = pilot(window.__ski.game().runT); window.__ski.frame(); }
      const cap = await window.__ski.app().gfx.capture(); let b = ''; const u = new Uint8Array(cap.data.buffer, cap.data.byteOffset, cap.data.byteLength);
      for (let k = 0; k < u.length; k += 0x6000) b += String.fromCharCode.apply(null, u.subarray(k, k + 0x6000));
      return { w: cap.w, h: cap.h, raw: btoa(b), png: await window.__ski.shot() };
    }, [+simS, NFR, +(process.env.DRAIN || 0)]);
    fs.writeFileSync(path.join(outDir, `diff-${W}${process.env.TAG ? '-' + process.env.TAG : ''}-${tag}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
    await page.close(); return { w: r.w, h: r.h, px: Buffer.from(r.raw, 'base64') };
  };
  const cmp = (a, b) => { let n = 0, sum = 0, mx = 0; const N = a.w * a.h; for (let i = 0; i < N; i++) { const d = Math.max(Math.abs(a.px[i * 4] - b.px[i * 4]), Math.abs(a.px[i * 4 + 1] - b.px[i * 4 + 1]), Math.abs(a.px[i * 4 + 2] - b.px[i * 4 + 2])); if (d > 8) n++; sum += d; if (d > mx) mx = d; } return `不同像素（差>8/255）${(100 * n / N).toFixed(3)}%  平均差 ${(sum / N).toFixed(3)}  最大差 ${mx}`; };
  const BQ = process.env.BASEQ || '';
  const A = await grab('tmp/dev-perf.html', 'base', BQ); log('base', A.w, A.h);
  const A2 = process.env.NOCTL ? A : await grab('tmp/dev-perf.html', 'base2', BQ);
  console.log(`# 画面对比 ${W}x${H}，模拟 ${simS} 秒后第 ${NFR} 帧 ${extra}`);
  if (!process.env.NOCTL) console.log(`对照（原版 vs 原版再加载一次）: ${cmp(A, A2)}`);
  for (const nm of names.split(',').filter(x => x && x !== 'none')) { const isQ = nm === 'default' || nm.includes('='), B = isQ ? await grab('tmp/dev-perf.html', nm.replace(/[^\w=-]+/g, '_'), nm === 'default' ? '' : nm.replace(/\+/g, '&')) : await grab(`tmp/dev-perf-${nm}.html`, nm); console.log(`${nm} vs 原版: ${cmp(A, B)}`); }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
