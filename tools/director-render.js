// Renders director shots frame by frame (see director/README.md):
//   node tools/director-render.js <outDir> <w> <h> <fps> [shots: "0,3,5" | "all"] [script.json]
// Each shot goes to <outDir>/<nn>_<id>/f_00000.png ... With MUSIC=<file> every frame is also numbered into <outDir>/seq/ and, at the end,
// <outDir>/cut.mp4 is encoded from them with that music under it (ffmpeg from PATH, or the npm package ffmpeg-static).
// AUDIO=1: the game's own sound and score for each shot, recorded with its frames, as <shot dir>/sound.wav.
// REALGPU=1: the machine's GPU instead of SwiftShader. CHROME=<path>: which browser. HEADED=1: a visible window (if headless gets no GPU).
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [outDir, W = '1280', H = '720', FPS = '30', which = 'all', scriptFile] = process.argv.slice(2);
(async () => {
  const gpuArgs = process.env.REALGPU ? ['--enable-unsafe-webgpu', '--enable-features=Vulkan', '--ignore-gpu-blocklist'] : ['--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-features=Vulkan', '--use-angle=swiftshader'];
  const browser = await chromium.launch({ headless: !process.env.HEADED, executablePath: process.env.CHROME || undefined, args: gpuArgs.concat(['--no-sandbox', '--autoplay-policy=no-user-gesture-required']) });
  const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  const url = 'file://' + path.resolve(__dirname, '../dist/dev.html') + `?director=1&w=${W}&h=${H}&gov=0&offscreen=1` + (process.env.BACKEND ? '&backend=' + process.env.BACKEND : '');
  await page.goto(url);
  await page.waitForFunction(() => window.Director && Director.ready, null, { timeout: 600000, polling: 500 });
  console.log('renderer:', await page.evaluate(() => window.__ski.app().gfx.caps.backend + ' / ' + window.__ski.app().gfx.caps.renderer));
  if (scriptFile) { const s = fs.readFileSync(scriptFile, 'utf8'); await page.evaluate(t => { Director.shots = JSON.parse(t); }, s); }
  const n = await page.evaluate(() => Director.shots.length);
  const list = which === 'all' ? [...Array(n).keys()] : which.split(',').map(Number);
  const seq = path.join(outDir, 'seq'); if (process.env.MUSIC) fs.mkdirSync(seq, { recursive: true });
  let g = 0; const T0 = Date.now();
  for (const i of list) {
    const t0 = Date.now(), info = await page.evaluate(([i, f, au]) => Director.begin(i, f, { audio: au }), [i, +FPS, !!process.env.AUDIO]);
    const dir = path.join(outDir, String(i).padStart(2, '0') + '_' + (info.id || 'shot')); fs.mkdirSync(dir, { recursive: true });
    let k = 0;
    while (await page.evaluate(() => Director.step())) {
      const png = Buffer.from((await page.evaluate(() => Director.frame())).split(',')[1], 'base64');
      fs.writeFileSync(path.join(dir, 'f_' + String(k++).padStart(5, '0') + '.png'), png);
      if (process.env.MUSIC) fs.writeFileSync(path.join(seq, 'f_' + String(g++).padStart(6, '0') + '.png'), png);
    }
    if (process.env.AUDIO) { const w = await page.evaluate(() => Director.audio()); if (w) fs.writeFileSync(path.join(dir, 'sound.wav'), Buffer.from(w, 'base64')); }
    console.log(`shot ${i} ${info.id}: ${k} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  await browser.close();
  console.log(`all shots: ${((Date.now() - T0) / 60000).toFixed(1)} min`);
  if (process.env.MUSIC) {
    let ff = 'ffmpeg'; try { execFileSync(ff, ['-version'], { stdio: 'ignore' }); } catch (e) { ff = require('ffmpeg-static'); }
    const out = path.join(outDir, 'cut.mp4');
    execFileSync(ff, ['-y', '-v', 'error', '-framerate', FPS, '-i', path.join(seq, 'f_%06d.png'), '-i', process.env.MUSIC, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-shortest', out], { stdio: 'inherit' });
    console.log('cut:', out);
  }
})().catch(e => { console.error(e); process.exit(1); });
