// 各通道的相对耗时（SwiftShader 软件光栅）。做法：每换一条管线（或换一个渲染目标）就 gl.finish() 一次再记时间，
// 这样每段时间 ≈ 上一段 draw 的顶点 + 像素工作量。绝对值不代表任何真机，只用来看"谁占大头"和做开关前后的 A/B。
// 用法: node passtime.js [额外地址参数] [模拟秒数=12] [w=640] [h=360] [帧数=6]
//   环境变量 PRE='js 表达式'：模拟前在页面里执行（比如切换画质、关模块）；OUT=文件：写 JSON。
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const [extra = '', simS = '12', W = '640', H = '360', NF = '6'] = process.argv.slice(2);
(async () => {
  const t0 = Date.now(), log = (...a) => console.error(...a);
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan', '--enable-precise-memory-info'], channel: process.env.CHANNEL || undefined });
  const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => log('pageerror:', e.message));
  await page.goto('file://' + path.resolve(__dirname, process.env.PAGE || 'tmp/dev-perf.html') + `?dev&manual&w=${W}&h=${H}&gov=0&backend=webgl2` + (extra ? '&' + extra : ''));
  const boot = await page.evaluate(async () => { const t = performance.now(); const r = await window.__ski.boot(); return { r, ms: performance.now() - t }; });
  log('boot', boot.r, Math.round(boot.ms) + 'ms');
  if (process.env.PRE) log('pre:', JSON.stringify(await page.evaluate(process.env.PRE)));
  const sim = await page.evaluate(([s]) => window.__ski.sim(s, window.__ski.pilot(), { draw: false }), [+simS]);
  log('sim', JSON.stringify(sim));
  const out = await page.evaluate(async ([nf]) => {
    const P = __perf, pilot = window.__ski.pilot(), sects = [], plain = [], ledger = [];
    const step = () => { window.__ski.input().script = pilot(window.__ski.game().runT); };
    for (let i = 0; i < 3; i++) { step(); window.__ski.frame(); P.syncNow(); }           // 热身：着色器第一次用到时的编译不计
    for (let i = 0; i < nf; i++) {
      step(); P.frameBegin(); P.timeBegin(); const a = performance.now(); window.__ski.frame(); P.syncNow(); const s = P.timeEnd(); const b = performance.now(); const L = P.frameEnd();
      s.__total = b - a; sects.push(s);
      ledger.push({ draws: L.passes.reduce((x, p) => x + p.draws.length, 0), tris: Math.round(L.passes.reduce((x, p) => x + p.draws.reduce((q, d) => q + d.tris, 0), 0)), passes: L.passes.length });
      step(); const c = performance.now(); window.__ski.frame(); P.syncNow(); plain.push(performance.now() - c);
    }
    const I = __int;
    return { sects, plain, ledger, state: { W: I.Render.W, H: I.Render.H, tier: I.Quality.tier, shadow: I.Render.shadowRes, blur: I.Render.motionBlur, seg: I.Course.segAt(-I.Game.s.p[2]).type, speed: I.Game.s.speed, wx: I.Weather.level, night: I.Sky.night, trees: I.Trees.stats } };
  }, [+NF]);
  out.query = extra; out.sim = sim;
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const keys = new Set(); for (const s of out.sects) for (const k in s) keys.add(k);
  const rows = [...keys].filter(k => k !== '__total').map(k => [k, med(out.sects.map(s => s[k] || 0))]).sort((a, b) => b[1] - a[1]);
  const sum = rows.reduce((s, r) => s + r[1], 0);
  console.log(`# ${extra || '(默认)'}  ${out.state.W}x${out.state.H} 档${out.state.tier} 阴影${out.state.shadow} 路段 ${out.state.seg} 速度 ${out.state.speed.toFixed(1)} 天气 ${out.state.wx} night ${(+out.state.night).toFixed(2)}`);
  console.log(`整帧（不分段，中位数）: ${med(out.plain).toFixed(0)} ms；分段合计: ${sum.toFixed(0)} ms；draws ${out.ledger[0].draws} tris ${out.ledger[0].tris} passes ${out.ledger[0].passes}`);
  for (const [k, v] of rows) if (v > sum * 0.004) console.log(v.toFixed(1).padStart(8), (100 * v / sum).toFixed(1).padStart(5) + '%', ' ', k);
  out.rows = rows; out.sum = sum; out.plainMed = med(out.plain);
  if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify(out));
  await browser.close(); log('done', ((Date.now() - t0) / 1000).toFixed(1) + 's');
})().catch(e => { console.error(e); process.exit(1); });
