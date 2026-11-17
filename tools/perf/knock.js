// "关掉一项看整帧少多少"：每组管线轮流关掉（钩子里直接不发 draw），量整帧时间，和什么都不关的基准比。
// 比 passtime.js 的分段计时干净：一帧只同步一次（读回画布 1 个像素），不会把一个渲染通道切碎；真 GPU 上也能用。
// 各组在同一段滑行里交替着量（一轮里每组各画 1 帧），所以场景变化对各组是一样的。
// 用法: node knock.js [额外地址参数] [w=1280] [h=720] [轮数=12] [模拟秒数=12]
//   环境变量 REAL=1：不加软件渲染参数，用这台机器的真 GPU（在用户的 Mac 上用）；HEADFUL=1：开窗口；CHANNEL=chrome：用系统 Chrome；
//   OUT=文件：写 JSON；GROUPS=a,b：只量这些组；PRE='js'：模拟前在页面里执行。
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const [extra = '', W = '1280', H = '720', ROUNDS = '12', simS = '12'] = process.argv.slice(2);
(async () => {
  const t0 = Date.now(), log = (...a) => console.error(...a), REAL = !!process.env.REAL;
  const args = REAL ? ['--enable-gpu', '--ignore-gpu-blocklist', '--enable-precise-memory-info', '--disable-gpu-vsync', '--disable-frame-rate-limit']
    : ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan', '--enable-precise-memory-info'];
  const browser = await chromium.launch({ args, headless: !process.env.HEADFUL, channel: process.env.CHANNEL || undefined });
  const page = await browser.newPage({ viewport: { width: Math.min(+W, 1600), height: Math.min(+H, 900) }, deviceScaleFactor: 1 });
  page.on('pageerror', e => log('pageerror:', e.message));
  await page.goto('file://' + path.resolve(__dirname, process.env.PAGE || 'tmp/dev-perf.html') + `?dev&manual&w=${W}&h=${H}&gov=0&backend=webgl2` + (extra ? '&' + extra : ''));
  const boot = await page.evaluate(async () => { const t = performance.now(); const r = await window.__ski.boot(); return { r, ms: performance.now() - t }; });
  log('boot', boot.r, Math.round(boot.ms) + 'ms');
  if (process.env.PRE) log('pre:', JSON.stringify(await page.evaluate(process.env.PRE)));
  const sim = await page.evaluate(([s]) => window.__ski.sim(s, window.__ski.pilot(), { draw: false }), [+simS]);
  log('sim', JSON.stringify(sim));
  const out = await page.evaluate(async ([rounds, only]) => {
    const P = __perf, I = __int, gl = P.gl, pilot = window.__ski.pilot(), names = P.pipes.map(p => p.name), has = n => names.includes(n);
    const rx = r => names.filter(n => r.test(n));
    let G = {
      '基准（不关）': [],
      '阴影通道全部': rx(/Shadow$/),
      ' 阴影里的地形': ['terrainShadow'], ' 阴影里的滑雪者': ['skierShadow'], ' 阴影里的树卡片': ['treeCardShadow'], ' 阴影里的近树': ['treeShadow'],
      '地形': ['terrain'], ' 地形里脚下的细网格（115,200 个三角形）': ['#patch'], ' 地形里 8 层环形网格（204,800 个三角形）': ['#rings'], '树卡片（远树）': ['treeCard'], '近树网格': ['tree'], '滑雪者': ['skier'], '天空': ['sky'],
      '雪晶 grainCrystal': ['grainCrystal'], '雪团 grainClump': ['grainClump'], '雪粒 sprayGrain': ['sprayGrain'],
      '雪雾（spraySun+sprayPuff+sprayComposite）': ['spraySun', 'sprayPuff', 'sprayComposite'],
      '空中雪尘 dust/flake': rx(/^(dust|flake|snowVeil)/), '风吹雪 wind*': rx(/^wind/), '城市灯光 city*': rx(/^city/),
      '动态模糊': ['motionBlur'], '雪痕（trackBake/trackStamp…）': rx(/^track/), '云和云海烘焙': rx(/Bake$/).filter(n => !/^track/.test(n)),
      '雪痕贴图每帧重做 mip（genMips）': ['#mips'], '最后合成 composite': ['composite'],
      '泛光 bloom*': rx(/^bloom/), '光束 shaft*/ray*': rx(/^(shaft|ray)/),
      '全部粒子（雪晶+雪团+雪粒+雪雾+雪尘+风吹雪）': ['grainCrystal', 'grainClump', 'sprayGrain', 'spraySun', 'sprayPuff', 'sprayComposite'].concat(rx(/^(dust|flake|snowVeil|wind)/)),
      '全部 draw 都不发（只剩 JS）': names.concat(['#mips']),
    };
    if (only) { const keep = {}; keep['基准（不关）'] = []; for (const k in G) if (only.some(o => k.includes(o))) keep[k] = G[k]; G = keep; }
    const keys = Object.keys(G), wall = {}, js = {}, gpu = {}; for (const k of keys) { wall[k] = []; js[k] = []; gpu[k] = []; }
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2'), pend = [];
    const frame = () => { window.__ski.input().script = pilot(window.__ski.game().runT); window.__ski.frame(); };
    const poll = () => { for (let i = pend.length - 1; i >= 0; i--) { const q = pend[i]; if (gl.getQueryParameter(q.q, gl.QUERY_RESULT_AVAILABLE)) { if (!gl.getParameter(ext.GPU_DISJOINT_EXT)) gpu[q.k].push(gl.getQueryParameter(q.q, gl.QUERY_RESULT) / 1e6); gl.deleteQuery(q.q); pend.splice(i, 1); } } };
    for (let i = 0; i < 6; i++) { frame(); P.syncNow(); }
    for (let r = 0; r < rounds; r++) {
      for (const k of keys) {
        P.skip = new Set(G[k]);
        let q = null; if (ext) { q = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, q); }
        const a = performance.now(); frame(); const b = performance.now(); P.syncNow(); const c = performance.now();
        if (q) { gl.endQuery(ext.TIME_ELAPSED_EXT); pend.push({ q, k }); }
        wall[k].push(c - a); js[k].push(b - a);
      }
      P.skip = new Set();
      if (ext) { await new Promise(r => setTimeout(r, 0)); poll(); }
    }
    if (ext) for (let i = 0; i < 20 && pend.length; i++) { await new Promise(r => setTimeout(r, 20)); poll(); }
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return { keys, G, wall, js, gpu, timer: !!ext, renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '?', ua: navigator.userAgent,
      state: { W: I.Render.W, H: I.Render.H, tier: I.Quality.tier, shadow: I.Render.shadowRes, seg: I.Course.segAt(-I.Game.s.p[2]).type, wx: I.Weather.level } };
  }, [+ROUNDS, process.env.GROUPS ? process.env.GROUPS.split(',') : null]);
  const med = a => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const base = out.keys[0], bw = med(out.wall[base]), bg = med(out.gpu[base]);
  console.log(`# 关一项看整帧 | ${extra || '(默认)'} ${out.state.W}x${out.state.H} 档${out.state.tier} 阴影${out.state.shadow} 路段末 ${out.state.seg} 天气 ${out.state.wx} | ${ROUNDS} 轮`);
  console.log(`# 显卡: ${out.renderer}`); console.log(`# GPU 计时扩展: ${out.timer ? '有' : '没有'}（有的话第三、四列是 GPU 自己报的耗时）`);
  console.log('整帧ms   少了ms   占比   | GPU ms  少了   占比  | JS ms | 关掉的东西');
  const rows = [];
  for (const k of out.keys) {
    const w = med(out.wall[k]), g = med(out.gpu[k]), j = med(out.js[k]); rows.push({ k, wall: w, gpu: g, js: j, dWall: bw - w, dGpu: bg - g, pipes: out.G[k] });
    console.log(w.toFixed(2).padStart(8), (bw - w).toFixed(2).padStart(8), ((100 * (bw - w) / bw).toFixed(1) + '%').padStart(6), ' |', isNaN(g) ? '     –      –      –' : g.toFixed(2).padStart(6) + (bg - g).toFixed(2).padStart(7) + ((100 * (bg - g) / bg).toFixed(1) + '%').padStart(7), ' |', j.toFixed(2).padStart(5), '|', k);
  }
  if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify({ query: extra, w: +W, h: +H, rounds: +ROUNDS, sim, boot, renderer: out.renderer, timer: out.timer, ua: out.ua, state: out.state, rows }));
  await browser.close(); log('done', ((Date.now() - t0) / 1000).toFixed(1) + 's');
})().catch(e => { console.error(e); process.exit(1); });
