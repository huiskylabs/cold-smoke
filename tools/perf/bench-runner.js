// 真机测量页的页面内脚本（由 mkbench.js 拼到带钩子的游戏页后面，生成 tmp/perf-bench.html）。不改 src。
// 手机或微信里打开 perf-bench.html，点「开始」，等一两分钟，点「复制结果」贴回来即可。
// 量四样东西：
//   A 开机各阶段耗时；
//   B 每帧 JS（所有 draw 都不发，只跑游戏逻辑 + 地形滚动），看尖峰；
//   C 关一项看整帧：每组管线轮流关掉，一帧画完后读回 1 个像素逼 GPU 做完再计时（不受 60 帧封顶的影响），两种分辨率各一遍；
//   D 真实节奏：正常按屏幕刷新画 10 秒，记每帧间隔。
// 走 WebGL2（钩子只包了 WebGL2 这一层）。页面同时报告这个浏览器有没有 WebGPU，好知道正式版在这里会走哪条路。
(function () {
  if (!/[?&]bench\b/.test(location.search)) return;
  const $ = (t, s, p) => { const e = document.createElement(t); if (s) e.style.cssText = s; if (p) p.appendChild(e); return e; };
  const box = $('div', 'position:fixed;inset:0;z-index:99999;background:rgba(10,14,20,.86);color:#e8eef5;font:14px/1.5 -apple-system,system-ui,sans-serif;padding:14px;overflow:auto;-webkit-user-select:text;user-select:text', document.body);
  const title = $('div', 'font-size:17px;font-weight:600;margin-bottom:6px', box); title.textContent = '雪迹 · 性能测量页';
  const info = $('div', 'opacity:.8;margin-bottom:10px', box); info.textContent = '点「开始」后请保持屏幕常亮、不要切走，约 1–3 分钟。结束后点「复制结果」，把文字贴给 Claude。';
  // 第一批优化的三个开关（地形滚动分摊、模糊采样数、脚下网格密度）：地址里带 v-xxx=a 就是关掉（旧做法）。页面上给一个一键切换
  const SW = ['pslice', 'mbtap', 'patchd'], OLD = SW.every(n => window.__int && window.__int.Variants.val[n] === 'a');
  { const ln = $('div', 'margin-bottom:10px', box), a = $('a', 'color:#9fe;text-decoration:underline', ln); ln.insertBefore(document.createTextNode(OLD ? '现在测的是：旧做法（三条优化关掉）。' : '现在测的是：新做法（三条优化打开）。'), a);
    a.textContent = OLD ? '换成新做法再测一遍' : '换成旧做法再测一遍'; a.href = location.pathname + '?' + location.search.replace(/^\?/, '').split('&').filter(x => x && !/^v-(pslice|mbtap|patchd)=/.test(x)).concat(SW.map(n => 'v-' + n + (OLD ? '=b' : '=a'))).join('&'); }
  const btn = $('button', 'font-size:17px;padding:10px 26px;border-radius:8px;border:0;background:#7A3FFF;color:#fff;margin-right:10px', box); btn.textContent = '开始'; btn.id = 'bench-go';
  const copy = $('button', 'font-size:17px;padding:10px 26px;border-radius:8px;border:0;background:#018081;color:#fff;display:none', box); copy.textContent = '复制结果';
  const stat = $('div', 'margin:10px 0;color:#9fe', box); stat.id = 'bench-stat';
  const out = $('textarea', 'width:100%;height:55vh;background:#0b1118;color:#cfe;border:1px solid #345;font:11px/1.35 ui-monospace,Menlo,monospace;display:none;white-space:pre', box); out.readOnly = true;
  const say = s => { stat.textContent = s; }, nap = (ms = 0) => new Promise(r => setTimeout(r, ms));
  const med = a => { if (!a.length) return NaN; const s = Array.from(a).sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const pct = (a, p) => { const s = Array.from(a).sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
  const f1 = x => (Math.round(x * 10) / 10).toFixed(1), f2 = x => (Math.round(x * 100) / 100).toFixed(2);
  const QUICK = /[?&]quick\b/.test(location.search);
  // 开机测试（地址带 boottest）：只量开机，走正式版会走的后端（不强制 WebGL2）。再带 cold：每条着色器末尾加一段随机注释，
  // 浏览器的着色器缓存就认不出来，等于"第一次打开"
  const BOOT = /[?&]boottest\b/.test(location.search), COLD = /[?&]cold\b/.test(location.search);
  copy.onclick = async () => { out.select(); let ok = false; try { await navigator.clipboard.writeText(out.value); ok = true; } catch (e) { try { ok = document.execCommand('copy'); } catch (x) { } } copy.textContent = ok ? '已复制' : '复制失败，请长按文本框全选复制'; };

  async function run() {
    btn.disabled = true; btn.style.opacity = .4; const R = window.__benchR = { v: 6, when: new Date().toISOString() }, L = [];
    try {
      // ---------- 环境
      R.ua = navigator.userAgent; R.dpr = devicePixelRatio; R.screen = [screen.width, screen.height]; R.inner = [innerWidth, innerHeight];
      R.mem = navigator.deviceMemory || null; R.cores = navigator.hardwareConcurrency || null;
      R.webgpu = !!navigator.gpu; R.gpuAdapter = null;
      if (navigator.gpu) { try { const ad = await navigator.gpu.requestAdapter(); if (ad) { const i = ad.info || (ad.requestAdapterInfo ? await ad.requestAdapterInfo() : {}); R.gpuAdapter = [i.vendor, i.architecture, i.device, i.description].filter(Boolean).join(' / ') || '有，但不报名字'; } else R.gpuAdapter = '有 navigator.gpu，但拿不到适配器'; } catch (e) { R.gpuAdapter = '出错: ' + e.message; } }
      // ---------- A 开机
      say('A 开机中…'); await nap(50);
      const I = window.__int, P = window.__perf, st = [];
      I.QS.delete('manual');           // 让开机像正式版那样每个阶段让出一帧（否则整个开机是一个长任务，手机浏览器可能判定页面无响应）；各阶段因此多出约 20 ms 的等待
      const t0 = performance.now();
      // 每个模块的 init 各花了多久（开机某一段特别慢时，看是哪个模块），以及它建了几条管线
      const inits = []; for (const k of Object.keys(I)) { const m = I[k]; if (!m || typeof m.init !== 'function' || m.init.__t) continue; const f = m.init;
        m.init = function () { const a = performance.now(), n0 = P.pipes.length; try { return f.apply(this, arguments); } finally { inits.push([k, performance.now() - a, P.pipes.length - n0]); } }; m.init.__t = 1; }
      await I.boot((f, name) => { if (name) st.push([name, performance.now() - t0]); });
      R.inits = inits.filter(x => x[1] >= 5).sort((x, y) => y[1] - x[1]).map(x => [x[0], Math.round(x[1]), x[2]]);
      R.loadMs = Math.round(t0);       // 从开始加载页面到开机开始（下载、解析这 2 MB 的脚本）
      const total = performance.now() - t0; R.boot = { total: Math.round(total), stages: st.map((s, i) => [s[0], Math.round((i + 1 < st.length ? st[i + 1][1] : total) - s[1])]) };
      if (BOOT) {
        R.caps = { backend: I.App.gfx.caps.backend, renderer: I.Quality.gpu }; R.cold = COLD; R.quality = { tier: I.Quality.tier, why: I.Quality.why, gpu: I.Quality.gpu };
        const fr = []; for (let i = 0; i < 5; i++) { const a = performance.now(); window.__ski.frame(); await new Promise(r => requestAnimationFrame(r)); fr.push(Math.round(performance.now() - a)); }
        R.firstFrames = fr;
        const gp = (P.gpuPipes || []).filter(e => e.tDone); if (gp.length) { const first = Math.min(...gp.map(e => e.t0)), done = gp.map(e => e.tDone).sort((x, y) => x - y);
          // 按编译好的先后排：每条和前一条编译好的时间差，近似它自己花的时间（浏览器一条一条编时成立）
          const order = gp.slice().sort((x, y) => x.tDone - y.tDone); let prev = Math.max(first, order[0].t0);
          R.gpuPipes = order.map(e => { const own = e.tDone - Math.max(prev, e.t0); prev = e.tDone; return [e.name, Math.round(own), Math.round(e.tDone - first), e.len]; });
          R.gpuPipeSpan = Math.round(done[done.length - 1] - first); }
      } else {
      const gl = P.gl, g = P.gfx, dbg = gl.getExtension('WEBGL_debug_renderer_info');
      R.caps = { backend: g.caps.backend, hdr: g.caps.hdr, r32fTarget: g.caps.r32fTarget, maxTex: g.caps.maxTex, renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '?', timerExt: !!gl.getExtension('EXT_disjoint_timer_query_webgl2'), parallelCompile: !!gl.getExtension('KHR_parallel_shader_compile'), aniso: !!gl.getExtension('EXT_texture_filter_anisotropic'), maxTexUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), maxVertTexUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) };
      R.quality = { tier: I.Quality.tier, why: I.Quality.why, gpu: I.Quality.gpu };
      R.sw = {}; for (const n of SW) R.sw[n] = I.Variants.val[n] || '?';
      { let tb = 0; for (const t of P.tex) if (t.alive) tb += t.bytes; let bb = 0; for (const b of P.buf) if (b.alive) bb += b.bytes; R.memGpu = { texMiB: +(tb / 1048576).toFixed(1), bufMiB: +(bb / 1048576).toFixed(1) }; }
      R.pipes = P.pipes.length; R.compileMs = Math.round(P.pipes.reduce((s, p) => s + p.tCreate + (p.tFinish || 0), 0));
      const pilot = window.__ski.pilot(), names = P.pipes.map(p => p.name), rx = r => names.filter(n => r.test(n));
      const frame = () => { window.__ski.input().script = pilot(window.__ski.game().runT); window.__ski.frame(); };
      say('准备场景（快进 12 秒）…'); await nap(30);
      window.__ski.sim(12, pilot, { draw: false });
      for (let i = 0; i < 8; i++) { frame(); P.syncNow(); }
      R.size0 = [I.Render.W, I.Render.H]; R.shadow = I.Render.shadowRes;
      // ---------- B 每帧 JS（不发 draw）
      say('B 每帧 JS…'); await nap(30);
      { const n = QUICK ? 240 : 900, fr = new Float32Array(n), gen = new Float32Array(n); P.skip = new Set(names.concat(['#mips']));
        for (let i = 0; i < n; i++) { const a = performance.now(); frame(); fr[i] = performance.now() - a; gen[i] = I.Terrain.lastGen || 0; if (i % 150 === 149) await nap(0); }
        P.skip = new Set(); let withGen = [], noGen = []; for (let i = 0; i < n; i++) (gen[i] > 0 ? withGen : noGen).push(fr[i]);
        R.js = { n, p50: +f2(med(fr)), p95: +f2(pct(fr, .95)), p99: +f2(pct(fr, .99)), max: +f1(pct(fr, 1)), mean: +f2(fr.reduce((s, x) => s + x, 0) / n), over8: fr.filter(x => x > 8).length, over16: fr.filter(x => x > 16.7).length, over33: fr.filter(x => x > 33.3).length,
          terrainFrames: withGen.length, terrainFrameMed: +f2(med(withGen)), plainFrameMed: +f2(med(noGen)), genPerFrame: Math.round(gen.reduce((s, x) => s + x, 0) / n) }; }
      for (let i = 0; i < 4; i++) { frame(); P.syncNow(); }
      // ---------- C 关一项看整帧
      const G = {
        '基准': [], '阴影通道全部': rx(/Shadow$/), '阴影里的滑雪者': ['skierShadow'], '阴影里的地形': ['terrainShadow'], '阴影里的树': ['treeCardShadow', 'treeShadow'],
        '地形': ['terrain'], '树卡片': ['treeCard'], '滑雪者': ['skier'], '天空': ['sky'],
        '雪晶': ['grainCrystal'], '雪粒': ['sprayGrain'], '雪雾': ['spraySun', 'sprayPuff', 'sprayComposite'], '雪尘': rx(/^(dust|flake|snowVeil)/), '风吹雪': rx(/^wind/),
        '全部粒子': ['grainCrystal', 'grainClump', 'sprayGrain', 'spraySun', 'sprayPuff', 'sprayComposite'].concat(rx(/^(dust|flake|snowVeil|wind)/)),
        '动态模糊': ['motionBlur'], '雪痕': rx(/^track/), '雪痕 mip 重生成': ['#mips'], '最后合成': ['composite'], '云烘焙': rx(/Bake$/).filter(n => !/^track/.test(n)), '泛光': rx(/^bloom/), '城市灯光': rx(/^city/),
        '只剩 JS': names.concat(['#mips']),
      };
      const keys = Object.keys(G), rounds = QUICK ? 4 : 10; R.knock = [];
      for (const sc of (QUICK ? [1] : [1, 0.5])) {
        const w = Math.max(64, Math.round(R.size0[0] * sc)), h = Math.max(64, Math.round(R.size0[1] * sc)); I.Render.resize(w, h);
        for (let i = 0; i < 4; i++) { frame(); P.syncNow(); }
        const T = {}; for (const k of keys) T[k] = [];
        for (let r = 0; r < rounds; r++) {
          say(`C 关一项看整帧 ${w}×${h}：第 ${r + 1}/${rounds} 轮…`); await nap(0);
          for (const k of keys) { P.skip = new Set(G[k]); const a = performance.now(); frame(); P.syncNow(); T[k].push(performance.now() - a); }
          P.skip = new Set();
        }
        const base = med(T['基准']); R.knock.push({ w, h, base: +f2(base), rows: keys.map(k => [k, +f2(med(T[k])), +f2(base - med(T[k]))]) });
      }
      I.Render.resize(R.size0[0], R.size0[1]); for (let i = 0; i < 4; i++) { frame(); P.syncNow(); }
      // ---------- D 真实节奏
      say('D 按屏幕刷新画 10 秒…'); box.style.background = 'rgba(10,14,20,.25)';
      { const n = QUICK ? 180 : 600, iv = []; let last = 0;
        await new Promise(res => { const tick = now => { if (last) iv.push(now - last); last = now; frame(); if (iv.length < n) requestAnimationFrame(tick); else res(); }; requestAnimationFrame(tick); });
        iv.splice(0, 20); R.pace = { n: iv.length, p50: +f2(med(iv)), p95: +f2(pct(iv, .95)), p99: +f2(pct(iv, .99)), max: +f1(pct(iv, 1)), fps: +f1(1000 / (iv.reduce((s, x) => s + x, 0) / iv.length)), over20: iv.filter(x => x > 20).length, over34: iv.filter(x => x > 34).length, over50: iv.filter(x => x > 50).length }; }
      box.style.background = 'rgba(10,14,20,.86)';
      }
    } catch (e) { R.error = String(e && e.message ? e.message : e).slice(0, 2000); }
    // ---------- 结果
    L.push('=== 雪迹性能测量 v6 ' + R.when + ' ===');
    L.push('浏览器: ' + R.ua); L.push(`屏幕 ${R.screen} 窗口 ${R.inner} 像素比 ${R.dpr} 内存 ${R.mem} GB 核 ${R.cores}`);
    L.push('WebGPU: ' + (R.webgpu ? '有（' + R.gpuAdapter + '）' : '没有'));
    if (R.caps) { L.push('显卡: ' + R.caps.renderer); L.push(`WebGL2 能力: 浮点渲染目标 ${R.caps.hdr ? '有' : '没有'}，GPU 计时 ${R.caps.timerExt ? '有' : '没有'}，并行编译 ${R.caps.parallelCompile ? '有' : '没有'}，各向异性 ${R.caps.aniso ? '有' : '没有'}，最大贴图 ${R.caps.maxTex}，贴图单元 ${R.caps.maxTexUnits}/顶点 ${R.caps.maxVertTexUnits}`); }
    if (R.quality && R.memGpu) L.push(`画质档 ${R.quality.tier}（${R.quality.why}）画布 ${R.size0 ? R.size0.join('×') : '?'} 阴影 ${R.shadow}；显存: 贴图 ${R.memGpu.texMiB} MiB + 缓冲 ${R.memGpu.bufMiB} MiB；管线 ${R.pipes} 条，编译 ${R.compileMs} ms`);
    if (R.sw) L.push('优化开关（b = 新做法，a = 旧做法）: ' + SW.map(n => n + '=' + R.sw[n]).join(' '));
    if (BOOT && R.quality) L.push(`画质档 ${R.quality.tier}（${R.quality.why}）`);
    if (BOOT) L.push(`开机测试：${R.caps ? R.caps.backend : '?'}，${COLD ? '冷启动（假装第一次打开）' : '热启动（着色器已缓存）'}；页面加载到开机开始 ${R.loadMs} ms；开机后前 5 帧 ${R.firstFrames ? R.firstFrames.join(' / ') : '?'} ms`);
    if (R.gpuPipes) { L.push(`WebGPU 管线 ${R.gpuPipes.length} 条，从建第一条到最后一条编好 ${R.gpuPipeSpan} ms。最慢的（ms，着色器字数）:`); L.push('   ' + R.gpuPipes.slice().sort((x, y) => y[1] - x[1]).slice(0, 25).map(x => x[0] + ' ' + x[1] + '（' + Math.round(x[3] / 1000) + 'k）').join(' | ')); }
    if (R.boot) L.push(`A 开机 ${R.boot.total} ms: ` + R.boot.stages.map(s => s[0] + ' ' + s[1]).join(' | '));
    if (R.inits && R.inits.length) L.push('   各模块 init（ms，括号里是建的管线数）: ' + R.inits.map(x => x[0] + ' ' + x[1] + '（' + x[2] + '）').join(' | '));
    if (R.js) L.push(`B 每帧 JS（${R.js.n} 帧）: 中位 ${R.js.p50} p95 ${R.js.p95} p99 ${R.js.p99} 最大 ${R.js.max} 平均 ${R.js.mean} ms；>8ms ${R.js.over8} 帧，>16.7ms ${R.js.over16} 帧，>33ms ${R.js.over33} 帧；有地形滚动的帧 ${R.js.terrainFrames} 个（中位 ${R.js.terrainFrameMed} ms），没有的中位 ${R.js.plainFrameMed} ms`);
    for (const K of R.knock || []) { L.push(`C 关一项看整帧 ${K.w}×${K.h}: 基准 ${K.base} ms`); for (const r of K.rows.slice(1)) L.push('   ' + String(r[1]).padStart(7) + ' ms  少 ' + String(r[2]).padStart(6) + '  ' + (K.base > 0 ? (100 * r[2] / K.base).toFixed(0) : '?').padStart(3) + '%  ' + r[0]); }
    if (R.knock && R.knock.length === 2) { const a = R.knock[0], b = R.knock[1], mp = (a.w * a.h - b.w * b.h) / 1e6, per = (a.base - b.base) / mp, fix = a.base - per * a.w * a.h / 1e6; L.push(`   拟合: 整帧 ≈ ${f2(fix)} ms 固定 + ${f2(per)} ms × 百万像素`); }
    if (R.pace) L.push(`D 真实节奏（${R.pace.n} 帧）: ${R.pace.fps} 帧/秒，间隔中位 ${R.pace.p50} p95 ${R.pace.p95} p99 ${R.pace.p99} 最大 ${R.pace.max} ms；>20ms ${R.pace.over20} 帧，>34ms ${R.pace.over34} 帧，>50ms ${R.pace.over50} 帧`);
    if (R.error) L.push('出错: ' + R.error);
    L.push('JSON: ' + JSON.stringify(R));
    out.value = L.join('\n'); out.style.display = 'block'; copy.style.display = 'inline-block'; say(R.error ? '中途出错了，但已有的结果仍然有用，请复制贴回。' : '完成。'); window.__benchResult = R; window.__benchText = out.value;
  }
  btn.onclick = run; window.__benchRun = run;
  if (BOOT) { info.textContent = '开机测试：会自动开始，约 5 到 30 秒。结束后点「复制结果」贴给 Claude。'; setTimeout(run, 300); }
})();
