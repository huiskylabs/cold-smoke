// 开机顺序 bootq 的 a/b 对比（WebGPU）：每次都是真的第一次打开（地址带 cold），量两个时间：
//   first：开机到能出第一张画面；all：连开机后补编的管线也全部编好。
// 然后两边同一时刻同一机位各截一张图，用 pngdiff.js 比，确认补编完以后画面和原来一样。
// 用法: node bootq.js [每边几次=2] [宽=844] [高=390]
//   云端的软件 WebGPU 开机后几秒设备就会丢（a、b 都一样，和这个改动无关），所以截图对比要在真显卡上跑：
//   REAL=1 CHANNEL=chrome node bootq.js
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const [N = '2', W = '844', H = '390'] = process.argv.slice(2), REAL = !!process.env.REAL;
const args = REAL ? ['--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-webgpu']
  : ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan'];
const tmp = path.join(__dirname, 'tmp'); fs.mkdirSync(tmp, { recursive: true });
(async () => {
  const res = { a: [], b: [] };
  for (let k = 0; k < +N; k++) for (const v of ['a', 'b']) {
    const br = await chromium.launch({ args, headless: !process.env.HEADFUL, channel: process.env.CHANNEL || undefined });
    const p = await br.newPage({ viewport: { width: +W, height: +H } }); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await p.goto('file://' + path.join(tmp, 'dev-perf.html') + `?dev&manual&w=${W}&h=${H}&gov=0&cold&v-bootq=${v}`);
    const r = await p.evaluate(async () => {
      const I = window.__int, t0 = performance.now(); I.QS.delete('manual');
      await I.boot(); const first = performance.now() - t0; await I.App.later; const all = performance.now() - t0;
      let drawErr = null; try { const s = window.__ski, pilot = s.pilot(); s.sim(10, pilot, { draw: false });
        for (let i = 0; i < 240; i++) { s.input().script = pilot(s.game().runT); s.frame(); } } catch (e) { drawErr = e.message; }
      return { drawErr, first: Math.round(first), all: Math.round(all), backend: I.App.gfx.caps.backend, lost: I.App.gfx.lost };
    });
    await p.waitForTimeout(300);
    const shot = path.join(tmp, `bootq-${v}-${k}.png`); await p.screenshot({ path: shot });
    r.errs = errs.length; res[v].push(r); console.log(v, k, JSON.stringify(r)); if (errs.length) console.log('  ', errs.slice(0, 3).join(' | '));
    await br.close();
  }
  const med = (L, f) => { const x = L.map(r => r[f]).sort((a, b) => a - b); return x[x.length >> 1]; };
  for (const v of ['a', 'b']) console.log(`${v}：第一张画面 ${med(res[v], 'first')} ms，全部编好 ${med(res[v], 'all')} ms（中位数，${N} 次）`);
  for (let k = 0; k < +N; k++) {
    const out = execFileSync('node', [path.join(__dirname, 'pngdiff.js'), path.join(tmp, `bootq-a-${k}.png`), path.join(tmp, `bootq-b-${k}.png`), path.join(tmp, `bootq-diff-${k}.png`)], { env: process.env }).toString();
    const d = JSON.parse(out.trim().split('\n').pop()), n = d.rows.reduce((s, x) => s + x, 0);
    console.log(`第 ${k} 次截图：差别超过 8/255 的像素 ${n} 个，占 ${(100 * n / (d.w * d.h)).toFixed(3)}%`);
  }
})();
