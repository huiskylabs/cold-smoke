// 每帧 JS 侧的开销：各模块耗时（中位数 / p95 / 最大）、分配量、GC 次数、最烫的函数、分配最多的位置、开机各阶段耗时。
// 画图调用（drawArrays/drawElements）被换成空函数：这里只量 JS 和 GL 命令编码，不量光栅化（那部分看 passtime.js）。
// 用法: node jsprof.js [额外地址参数] [CPU 降速倍数=1] [帧数=1800] [w=640] [h=360]
//   降速倍数 4 ≈ Lighthouse 对"中端手机"的约定；6 ≈ 低端机。这是近似，不是真机。
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const [extra = '', RATE = '1', NF = '1800', W = '640', H = '360'] = process.argv.slice(2);
(async () => {
  const t0 = Date.now(), log = (...a) => console.error(...a);
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan', '--enable-precise-memory-info', '--js-flags=--expose-gc'], channel: process.env.CHANNEL || undefined });
  const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => log('pageerror:', e.message));
  const cdp = await page.context().newCDPSession(page);
  if (+RATE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: +RATE });
  const file = path.resolve(__dirname, process.env.PAGE || 'tmp/dev-perf.html');
  await page.goto('file://' + file + `?dev&manual&w=${W}&h=${H}&gov=0&backend=webgl2` + (extra ? '&' + extra : ''));
  // 开机：分阶段计时（boot 的 stage 回调在每个阶段开始时被调用）
  const boot = await page.evaluate(async () => {
    const st = [], t = performance.now();
    await __int.boot((f, name) => { st.push([name, performance.now() - t]); });
    __int.App.ready = true; const total = performance.now() - t;
    const out = []; for (let i = 0; i < st.length; i++) out.push([st[i][0], +(((i + 1 < st.length ? st[i + 1][1] : total) - st[i][1])).toFixed(0)]);
    return { total: Math.round(total), stages: out };
  });
  log('boot', JSON.stringify(boot));
  await page.evaluate(() => { window.__ski.sim(6, window.__ski.pilot(), { draw: false }); });
  // 画图调用换成空函数
  await page.evaluate(() => { const gl = __perf.gl; gl.drawElementsInstanced = () => { }; gl.drawArraysInstanced = () => { }; gl.clear = () => { }; __perf.wrapMods(); });
  // 先画 10 帧热身（sim 用的是 draw:false，第一帧要补一大片地形，不算数）
  await page.evaluate(() => { const pilot = window.__ski.pilot(); for (let i = 0; i < 10; i++) { window.__ski.input().script = pilot(window.__ski.game().runT); __int.tick(1 / 60, true); __int.UI.frame(1 / 60); } });
  // 环境变量 NOPROF=1：不开采样器、不读堆大小（它们自己有开销），只量干净的每帧耗时
  const PROF = !process.env.NOPROF;
  if (PROF) {
    await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 250 });
    await cdp.send('HeapProfiler.enable');
    await cdp.send('Profiler.start'); await cdp.send('HeapProfiler.startSampling', { samplingInterval: 4096, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true });
  }
  const res = await page.evaluate(([nf, prof]) => {
    const I = __int, P = __perf, pilot = window.__ski.pilot(), fr = new Float32Array(nf), heap = new Float64Array(nf), gen = new Float32Array(nf);
    for (const k in P.mods) delete P.mods[k]; if (window.gc) gc();
    let alloc = 0, gcs = 0, h0 = prof ? performance.memory.usedJSHeapSize : 0;
    for (let i = 0; i < nf; i++) {
      window.__ski.input().script = pilot(window.__ski.game().runT);
      const a = performance.now(); P.frameBegin();
      __int.tick(1 / 60, true);
      __int.UI.frame(1 / 60);
      fr[i] = performance.now() - a; const L = P.frameEnd(); gen[i] = I.Terrain.lastGen || 0;
      if (prof) { const h1 = performance.memory.usedJSHeapSize; if (h1 >= h0) alloc += h1 - h0; else gcs++; h0 = h1; heap[i] = h1; }
    }
    const q = (a, p) => { const s = Array.from(a).sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
    const mods = {}; for (const k in P.mods) mods[k] = { ms: +(P.mods[k].ms / nf).toFixed(4), n: +(P.mods[k].n / nf).toFixed(2) };
    // 最慢的 12 帧各是哪一帧、地形那一帧生成了多少格
    const idx = Array.from(fr.keys()).sort((a, b) => fr[b] - fr[a]).slice(0, 12).map(i => [i, +fr[i].toFixed(2), gen[i]]);
    return { nf, p50: q(fr, 0.5), p90: q(fr, 0.9), p95: q(fr, 0.95), p99: q(fr, 0.99), max: q(fr, 1), mean: fr.reduce((s, x) => s + x, 0) / nf, over8: Array.from(fr).filter(x => x > 8).length, over16: Array.from(fr).filter(x => x > 16.7).length, over33: Array.from(fr).filter(x => x > 33.3).length,
      allocPerFrame: alloc / nf, gcs, mods, slow: idx, series: Array.from(fr, x => +x.toFixed(2)), genSeries: Array.from(gen), genTotal: gen.reduce((s, x) => s + x, 0), seg: I.Course.segAt(-I.Game.s.p[2]).type, dist: -I.Game.s.p[2] };
  }, [+NF, PROF]);
  const prof = PROF ? (await cdp.send('Profiler.stop')).profile : { timeDeltas: [], samples: [], nodes: [] }, hp = PROF ? (await cdp.send('HeapProfiler.stopSampling')).profile : { head: { callFrame: {}, children: [] } };
  // 行号 → src 文件
  const lines = fs.readFileSync(file, 'utf8').split('\n'), marks = []; lines.forEach((l, i) => { const m = /^\/\/ ===== (\S+) =====/.exec(l); if (m) marks.push([i, m[1]]); });
  const where = ln => { let f = '?', b = 0; for (const [i, n] of marks) { if (i <= ln) { f = n; b = i; } else break; } return f + ':' + (ln - b); };
  // CPU：按函数自耗时
  const self = new Map(), dt = prof.timeDeltas, ids = prof.samples, byId = new Map(prof.nodes.map(n => [n.id, n])); let tot = 0;
  for (let i = 0; i < ids.length; i++) { const n = byId.get(ids[i]), k = (n.callFrame.functionName || '(anon)') + ' @' + (n.callFrame.url ? where(n.callFrame.lineNumber) : n.callFrame.functionName); self.set(k, (self.get(k) || 0) + dt[i]); tot += dt[i]; }
  const hot = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, v]) => [k, +(v / 1000 / res.nf).toFixed(4)]);
  // 分配：按函数
  const al = new Map(); (function walk(n) { const k = (n.callFrame.functionName || '(anon)') + ' @' + (n.callFrame.url ? where(n.callFrame.lineNumber) : ''); if (n.selfSize) al.set(k, (al.get(k) || 0) + n.selfSize); for (const c of n.children || []) walk(c); })(hp.head);
  const allocTop = [...al.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30);
  const out = { query: extra, rate: +RATE, boot, res, hot, allocTop };
  fs.writeFileSync(process.env.OUT || path.join(__dirname, `tmp/js-${RATE}x${PROF ? '' : '-clean'}.json`), JSON.stringify(out));
  console.log(`# JS 每帧（CPU 降速 ${RATE}x，${res.nf} 帧，路段末 ${res.seg}，滑了 ${Math.round(res.dist)} m）`);
  console.log(`开机 ${boot.total} ms: ` + boot.stages.map(s => s[0] + ' ' + s[1]).join(' | '));
  console.log(`帧 JS: 中位 ${res.p50.toFixed(2)} p90 ${res.p90.toFixed(2)} p95 ${res.p95.toFixed(2)} p99 ${res.p99.toFixed(2)} 最大 ${res.max.toFixed(1)} 平均 ${res.mean.toFixed(2)} ms; >8ms ${res.over8} 帧, >16.7ms ${res.over16} 帧, >33ms ${res.over33} 帧`);
  console.log(PROF ? `分配 ${(res.allocPerFrame / 1024).toFixed(1)} KB/帧（堆大小逐帧上涨之和）, 堆回落(≈GC) ${res.gcs} 次; 地形共生成 ${res.genTotal} 格` : `（NOPROF：没有分配和采样数据）地形共生成 ${res.genTotal} 格`);
  console.log('最慢的帧 [帧号, ms, 地形生成格数]:', JSON.stringify(res.slow));
  console.log('各模块平均 ms/帧:'); for (const [k, v] of Object.entries(res.mods).sort((a, b) => b[1].ms - a[1].ms)) if (v.ms > 0.002) console.log('  ' + v.ms.toFixed(3).padStart(7), ('×' + v.n).padEnd(7), k);
  console.log('最烫的函数（自耗时 ms/帧）:'); for (const [k, v] of hot.slice(0, 30)) console.log('  ' + v.toFixed(3).padStart(7), k);
  console.log('分配最多的位置（采样估计，字节，整段合计，含已被回收的）:'); for (const [k, v] of allocTop.slice(0, 22)) console.log('  ' + String(v).padStart(9), k);
  await browser.close(); log('done', ((Date.now() - t0) / 1000).toFixed(1) + 's');
})().catch(e => { console.error(e); process.exit(1); });
