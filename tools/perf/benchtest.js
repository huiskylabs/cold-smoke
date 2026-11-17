// 在无头浏览器里把真机测量页跑一遍，确认它能出结果。用法: node benchtest.js [额外参数，如 "quick"] [w=844] [h=390] ; REAL=1 用真 GPU
const { chromium } = require('playwright'), path = require('path');
const [extra = 'quick', W = '844', H = '390'] = process.argv.slice(2);
(async () => {
  const REAL = !!process.env.REAL;
  const browser = await chromium.launch({ args: REAL ? ['--enable-gpu', '--ignore-gpu-blocklist'] : ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan'], headless: !process.env.HEADFUL, channel: process.env.CHANNEL || undefined });
  const page = await browser.newPage(process.env.PHONE ? { viewport: { width: +W, height: +H }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('pageerror:', e.message));
  await page.goto('file://' + path.resolve(__dirname, 'tmp/perf-bench.html') + (extra ? '?' + extra : ''));
  await page.waitForFunction(() => /[?&]bench\b/.test(location.search) && document.querySelector('#bench-go'), null, { timeout: 30000 });
  console.error('url:', page.url());
  await page.click('#bench-go');
  const iv = setInterval(async () => { try { console.error('…', await page.evaluate(() => document.querySelector('#bench-stat').textContent)); } catch (e) { } }, 10000);
  await page.waitForFunction(() => window.__benchText, null, { timeout: 1500000, polling: 1000 });
  console.log(await page.evaluate(() => window.__benchText.replace(/\nJSON: .*$/s, '')));
  clearInterval(iv); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
