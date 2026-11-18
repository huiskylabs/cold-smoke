// Do the ring pipelines build on both back ends (WebGPU, WebGL2)? Boots the game and reads the warnings; no picture is taken.
// node tools/ring-compile.js
const path = require('path'); const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, args: process.env.GPU ? ['--enable-unsafe-webgpu', '--enable-gpu', '--ignore-gpu-blocklist'] : ['--enable-unsafe-webgpu'] });
  for (const be of ['webgpu', 'webgl2']) {
    const pg = await b.newPage({ viewport: { width: 480, height: 270 } }); const msgs = [];
    pg.on('console', m => { const t = m.text(); if (/ring|GLSL|WGSL|pipeline|error/i.test(t)) msgs.push(t.slice(0, 600)); }); pg.on('pageerror', e => msgs.push('pageerror ' + e.message.slice(0, 600)));
    await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&v-rline=a' + (be === 'webgl2' ? '&backend=webgl2' : ''));
    await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
    await pg.waitForTimeout(8000);
    const info = await pg.evaluate(() => ({ backend: __ski.app().gfx.caps.backend, pipes: (__rings.pipes || []).map(p => p.name + ':' + (p.ready === false ? 'pending' : 'ok')) }));
    console.log(be, JSON.stringify(info), msgs.length ? msgs.join(' || ') : 'no warnings'); await pg.close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
