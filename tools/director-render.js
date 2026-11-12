// Renders director shots frame by frame: node tools/director-render.js <outDir> <w> <h> <fps> [shots: "0,3,5" | "all"] [scriptFile.json]
// Each shot goes to <outDir>/<nn>_<id>/f_00000.png ...; encode with ffmpeg afterwards (see README of the video folder).
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const [outDir, W = '1280', H = '720', FPS = '30', which = 'all', scriptFile] = process.argv.slice(2);
(async () => {
  const gpuArgs = process.env.REALGPU ? ['--enable-unsafe-webgpu', '--enable-features=Vulkan'] : ['--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan', '--use-angle=swiftshader'];
  const browser = await chromium.launch({ headless: !process.env.HEADED, executablePath: process.env.CHROME || undefined, args: gpuArgs.concat(['--no-sandbox', '--autoplay-policy=no-user-gesture-required']) });
  const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  page.on('console', m => { if (/error|ERR/i.test(m.text())) console.log('page:', m.text()); });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  const url = 'file://' + path.resolve(__dirname, '../dist/dev.html') + `?director=1&w=${W}&h=${H}&gov=0&offscreen=1` + (process.env.BACKEND ? '&backend=' + process.env.BACKEND : '');
  await page.goto(url);
  await page.waitForFunction(() => window.Director && Director.ready, null, { timeout: 600000, polling: 500 });
  if (scriptFile) { const s = fs.readFileSync(scriptFile, 'utf8'); await page.evaluate(t => { Director.shots = JSON.parse(t); }, s); }
  const n = await page.evaluate(() => Director.shots.length);
  const list = which === 'all' ? [...Array(n).keys()] : which.split(',').map(Number);
  for (const i of list) {
    const t0 = Date.now(), info = await page.evaluate(([i, f]) => Director.begin(i, f), [i, +FPS]);
    const dir = path.join(outDir, String(i).padStart(2, '0') + '_' + (info.id || 'shot')); fs.mkdirSync(dir, { recursive: true });
    let k = 0;
    while (await page.evaluate(() => Director.step())) {
      const url = await page.evaluate(() => Director.frame());
      fs.writeFileSync(path.join(dir, 'f_' + String(k++).padStart(5, '0') + '.png'), Buffer.from(url.split(',')[1], 'base64'));
    }
    console.log(`shot ${i} ${info.id}: ${k} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
