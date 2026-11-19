// 开机分阶段计时：把计时点拼进 dist/dev.html 的副本，无头打开，记录每一段的耗时，并用 CPU 采样找出每一段里最耗时的函数。
// 用法: node boottime.js [地址参数] [次数]     例: node boottime.js "backend=webgl2" 3
// 环境变量: REAL=1 用真显卡（Mac）；CHANNEL=chrome；PROF=1 记 CPU 采样；W/H 视口；CPU=4 降速；SRC=别的 html；PERSIST=目录 第 1 次是首次打开、之后是再次打开（着色器缓存）
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const src = path.resolve(process.env.SRC || path.join(__dirname, '../../dist/dev.html'));
const out = path.join(__dirname, 'tmp/dev-boot.html');
let html = fs.readFileSync(src, 'utf8');
const rep = (a, b) => { if (!html.includes(a)) throw new Error('not found: ' + a.slice(0, 60)); html = html.replace(a, b); };
rep('<script>\n(() => {', '<script>self.__bt=[["js-start",performance.now()]];\n(() => {');
rep('step = async (f, name) => { if (stage) stage(f, name);', 'step = async (f, name) => { self.__bt.push([name || ("·" + f), performance.now()]); if (stage) stage(f, name);');
rep('  App.ready = true;\n  App.later = gfx.release ? gfx.release() : Promise.resolve();', '  App.ready = true; self.__bt.push(["ready", performance.now()]); self.__info = { backend: gfx.caps.backend, tier: Quality.tier, gpu: Quality.gpu };\n  App.later = gfx.release ? gfx.release() : Promise.resolve(); App.later.then(() => self.__bt.push(["later-done", performance.now()]));');
// a stamp at the very top of the html, before the fonts style and the big script are parsed
html = html.replace('<body>', '<body><script>self.__bt00=performance.now()</script>');
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html);
const qs = process.argv[2] || '', runs = +(process.argv[3] || 1);
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); r.end(html); });
(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const args = process.env.REAL ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-webgpu'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-unsafe-webgpu'];
  const W = +(process.env.W || 844), H = +(process.env.H || 390);
  for (let run = 0; run < runs; run++) {
    // PERSIST=dir: one browser profile kept across the runs, so run 1 is a first visit (no shader cache) and later runs are return visits
    let b, pg;
    if (process.env.PERSIST) { if (run === 0) fs.rmSync(process.env.PERSIST, { recursive: true, force: true }); b = await chromium.launchPersistentContext(process.env.PERSIST, { headless: true, channel: process.env.CHANNEL, args, viewport: { width: W, height: H } }); pg = b.pages()[0] || await b.newPage(); }
    else { b = await chromium.launch({ headless: true, channel: process.env.CHANNEL, args }); pg = await b.newPage({ viewport: { width: W, height: H } }); }
    const cdp = await pg.context().newCDPSession(pg);
    if (process.env.CPU) await cdp.send('Emulation.setCPUThrottlingRate', { rate: +process.env.CPU });
    if (process.env.PROF) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start'); }
    const logs = []; pg.on('console', m => logs.push(m.text()));
    const t0 = Date.now();
    await pg.goto('http://localhost:' + port + '/?dev&' + qs, { waitUntil: 'commit' });
    await pg.waitForFunction(() => self.__bt && self.__bt.some(e => e[0] === 'ready') || document.querySelector('#fatal:not([hidden])'), null, { timeout: 180000, polling: 50 });
    await pg.waitForFunction(() => self.__bt.some(e => e[0] === 'later-done'), null, { timeout: 120000, polling: 50 }).catch(() => { });
    const r = await pg.evaluate(() => ({ bt: self.__bt, b00: self.__bt00, nav: performance.getEntriesByType('navigation')[0].toJSON(), ...(self.__info || {}) }));
    console.log(`\n=== run ${run + 1}  backend=${r.backend} tier=${r.tier} gpu=${r.gpu}`);
    console.log(`html 开始解析 ${r.nav.responseEnd.toFixed(0)}ms  body 开头 ${r.b00.toFixed(0)}ms  脚本开始执行 ${r.bt[0][1].toFixed(0)}ms`);
    for (let i = 1; i < r.bt.length; i++) console.log(String(r.bt[i - 1][0]).padEnd(12), '→', String(r.bt[i][0]).padEnd(12), (r.bt[i][1] - r.bt[i - 1][1]).toFixed(0).padStart(6) + 'ms', ' 累计', r.bt[i][1].toFixed(0) + 'ms');
    const tl = logs.filter(l => /^(vista|deer|trees|terrain|quality)/.test(l)); if (tl.length) console.log(tl.join('\n'));
    if (process.env.PROF) {
      const { profile } = await cdp.send('Profiler.stop');
      fs.writeFileSync(path.join(__dirname, 'tmp/boot.cpuprofile'), JSON.stringify(profile));
      // self time per function, split by boot stage window
      const byId = new Map(profile.nodes.map(n => [n.id, n])); const stamps = r.bt.map(e => [e[0], e[1]]);
      const T = profile.startTime; let t = T; const agg = {};
      // align profile clock to page clock: the first sample running page code (named function) ≈ just after js-start
      let navStart = null; { let tt = T; for (let i = 0; i < profile.samples.length; i++) { tt += profile.timeDeltas[i]; const cf = byId.get(profile.samples[i]).callFrame; if (cf.url && cf.url.includes('localhost') && cf.functionName) { navStart = tt - r.bt[0][1] * 1000; break; } } }
      for (let i = 0; i < profile.samples.length; i++) {
        t += profile.timeDeltas[i]; const n = byId.get(profile.samples[i]); const ms = (t - navStart) / 1000;
        let st = 'pre'; for (const s of stamps) if (ms >= s[1]) st = s[0];
        const cf = n.callFrame; const key = (cf.functionName || '(anon)') + ':' + (cf.lineNumber + 1);
        const dt = (profile.timeDeltas[i + 1] || 0) / 1000;
        (agg[st] = agg[st] || {})[key] = (agg[st][key] || 0) + dt;
      }
      for (const st of Object.keys(agg)) {
        const tot = Object.values(agg[st]).reduce((a, b) => a + b, 0); if (tot < 30) continue;
        console.log(`\n  [${st}] 采样合计 ${tot.toFixed(0)}ms`);
        Object.entries(agg[st]).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([k, v]) => console.log('     ', v.toFixed(0).padStart(6) + 'ms', k));
      }
    }
    await b.close();
  }
  srv.close();
})().catch(e => { console.error(e); process.exit(1); });
