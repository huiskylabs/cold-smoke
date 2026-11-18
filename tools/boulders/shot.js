// 雪道上的石头：改前（雪包）/改后（石头带残雪）同机位对比图。
// 用法: node build.js && node tools/boulders/shot.js <输出目录> [宽=1600] [高=900]
// REALGPU=1 用本机显卡（Mac 上用这个）。总是无头、无窗口，只用 playwright 自带的 Chromium，不碰装好的 Chrome。
// NODRAW=1 只跑脚本不出图（检查脚本本身）。
// 每张图：同一块石头、同一个镜头，a = 现在的雪包，b = 石头带残雪；地形难度 c（野雪，雪道中间也有石头）和 b（标准，只有边上的）各取几块。
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const [OUT = 'boulder-shots', W = '1600', H = '900'] = process.argv.slice(2);
// 镜头：从坡上往下看（back: 离石头多远，up: 多高，side: 偏到一边多少）；tod: 时间
const CAMS = [
  { id: '近_追尾高度', back: 7, up: 2.0, side: 1.5, tod: 'day' },
  { id: '低_侧面', back: 3.5, up: 0.9, side: 4.5, tod: 'day' },
  { id: '中_滑过来时', back: 22, up: 3.2, side: 3, tod: 'day' },
  { id: '近_傍晚', back: 7, up: 2.0, side: -2, tod: 'golden' },
];
const CASES = [{ tdiff: 'c', pick: [0, 1, 3] }, { tdiff: 'b', pick: [0, 2] }];
(async () => {
  const args = process.env.REALGPU ? ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal'] : ['--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader'];
  const browser = await chromium.launch({ headless: true, args: args.concat(['--no-sandbox']) });
  fs.mkdirSync(OUT, { recursive: true });
  const page0 = path.resolve(__dirname, '../../dist/dev.html');
  for (const cs of CASES) for (const v of ['a', 'b']) {
    const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
    page.on('pageerror', e => console.log('pageerror:', e.message));
    await page.goto('file://' + page0 + `?dev&manual&w=${W}&h=${H}&gov=0&offscreen=1&v-boulder=${v}&v-tdiff=${cs.tdiff}&v-terr=b`);
    const b = await page.evaluate(() => window.__ski.boot()); if (!/^ok/.test(b)) throw new Error(b);
    for (const pi of cs.pick) for (const cam of CAMS) {
      const r = await page.evaluate(async ([pi, cam, nodraw]) => {
        const ski = window.__ski, M = ski.m, C = M.Course;
        if (nodraw) { const gl = M.App.gfx.gl; if (gl) gl.drawElementsInstanced = gl.drawArraysInstanced = gl.drawElements = gl.drawArrays = gl.clear = () => { }; }
        const all = []; C.boulders(60, 3000, (f, x, z) => all.push({ f, x, z }));
        // (along the edges in 标准; in 野雪 the ones out on the run first)
        all.sort((p, q) => (p.f.snow - q.f.snow) || (p.f.cs - q.f.cs));
        const R = all[pi]; if (!R) return { miss: true };
        ski.tod(cam.tod);
        const c = C.at(R.f.cs + 1), side = Math.sign(R.f.u || 1) * -1;         // (look from the run's side of the stone)
        const ex = R.x + side * cam.side, ez = R.z + cam.back, top = ski.height(R.x, R.z);
        const eye = [ex, ski.height(ex, ez) + cam.up, ez], tgt = [R.x, top + 0.2, R.z];
        // the skier stands a couple of metres from the stone, for scale
        const sx = R.x + side * (R.f.rad + 1.4), sz = R.z - 1.5; ski.skier(sx, sz, 0.2 * side);
        for (let i = 0; i < 4; i++) ski.view(eye, tgt, 0.95);
        await new Promise(r => setTimeout(r, 50));
        return { cs: +R.f.cs.toFixed(1), u: +R.f.u.toFixed(1), rad: +R.f.rad.toFixed(2), h: +R.f.h.toFixed(2), edge: R.f.snow, n: M.Boulders ? M.Boulders.stats.n : null, png: nodraw ? null : await ski.shot() };
      }, [pi, cam, !!process.env.NODRAW]);
      if (r.miss) { console.log('no boulder', cs.tdiff, pi); continue; }
      const name = `${cs.tdiff}_${pi}_${cam.id}_${v}`;
      if (r.png) fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.png.split(',')[1], 'base64'));
      console.log(name, JSON.stringify(Object.assign({}, r, { png: undefined })));
    }
    await page.close();
  }
  await browser.close();
})();
