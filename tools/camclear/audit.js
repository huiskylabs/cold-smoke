// 镜头离雪面有多远：把游戏里所有会摆镜头的地方都跑一遍（追尾、转视角、各个机位、标题页、拍照、导演镜头），
// 每帧量镜头本身和近裁剪面四个角离雪面多高。低于 0 就是镜头（或画面的一角）钻进了雪里，画面会切到地面底下。
// 雪面取两种：Course.height 的最细一层（moguls 在内），和地形第 0 层网格真正画出来的高度。
// 用法: node build.js && node tools/camclear/audit.js [秒数=240] [种子...]
// 只跑脚本（画图调用换成空函数），不出图；云端 SwiftShader 也能跑。
const { chromium } = require('playwright'), path = require('path');
const SEC = +(process.argv[2] || 240), SEEDS = process.argv.slice(3).map(Number);
const PAGE = process.env.PAGE || path.resolve(__dirname, '../../dist/dev.html');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader'] });
  const out = {};
  for (const seed of SEEDS.length ? SEEDS : [0]) {
    const page = await browser.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => console.error('pageerror:', e.message));
    await page.goto('file://' + PAGE + '?dev&manual&w=844&h=390&gov=0&backend=webgl2' + (seed ? '#' + seed : '') + (process.env.Q ? '&' + process.env.Q : ''));
    const b = await page.evaluate(async () => window.__ski.boot());
    if (!/^ok/.test(b)) throw new Error(b);
    const r = await page.evaluate(async ([SEC]) => {
      const M = window.__ski.m, G = M.Game, C = M.Course, R = M.Render, T = M.Terrain, S = G.s, ski = window.__ski;
      const gl = M.App.gfx.gl; if (gl) { gl.drawElementsInstanced = gl.drawArraysInstanced = gl.drawElements = gl.drawArrays = gl.clear = () => { }; }
      const L0 = T.levels[0];
      const mesh = (x, z) => {      // 第 0 层网格画出来的高度（窗口内、已生成的才算），否则 null
        if (!L0.valid) return null; const gx = x / 0.5, gz = z / 0.5, ix = Math.floor(gx), iz = Math.floor(gz), fx = gx - ix, fz = gz - iz, p = L0.pend || [0, 0, 0, 0];
        if (ix < L0.cx - 64 || ix > L0.cx + 63 || iz < L0.cz - 64 || iz > L0.cz + 63) return null;
        if (ix < L0.cx - 128 + p[0] || ix + 1 > L0.cx + 127 - p[1] || iz < L0.cz - 128 + p[2] || iz + 1 > L0.cz + 127 - p[3]) return 'stale';
        const h = (i, j) => L0.H[(j & 255) * 256 + (i & 255)] + 0.36 * j * 0.5;
        return (h(ix, iz) * (1 - fx) + h(ix + 1, iz) * fx) * (1 - fz) + (h(ix, iz + 1) * (1 - fx) + h(ix + 1, iz + 1) * fx) * fz;
      };
      // 一帧的量：镜头点和近裁剪面四角（再加四条边的中点）到雪面的最小高度
      const clear = () => {
        const c = R.cam, n = c.near, th = Math.tan(c.fovY / 2), A = R.W / R.H, hh = n * th, hw = hh * A, pts = [c.pos];
        for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [-1, 0], [1, 0]]) pts.push([0, 1, 2].map(i => c.pos[i] + c.fwd[i] * n + c.right[i] * hw * a + c.up[i] * hh * b));
        let eye = 1e9, near = 1e9, mesh0 = 1e9, stale = 0;
        pts.forEach((p, k) => { const d = p[1] - C.height(p[0], p[2], 0.5); if (k === 0) eye = d; near = Math.min(near, d);
          const m = mesh(p[0], p[2]); if (m === 'stale') stale++; else if (m != null) mesh0 = Math.min(mesh0, p[1] - m); });
        return { eye, near, mesh: mesh0, stale };
      };
      const res = {};
      const rec = (name, extra) => { const q = clear(), o = res[name] || (res[name] = { n: 0, bad: 0, badEye: 0, min: 1e9, minEye: 1e9, minMesh: 1e9, stale: 0, worst: null });
        o.n++; if (q.near < 0 || q.mesh < 0) o.bad++; if (q.eye < 0) o.badEye++; o.minEye = Math.min(o.minEye, q.eye); o.minMesh = Math.min(o.minMesh, q.mesh); o.stale += q.stale ? 1 : 0;
        const w = Math.min(q.near, q.mesh); if (w < o.min) { o.min = w; o.worst = { s: +(-S.p[2]).toFixed(1), seg: C.segAt(-S.p[2]).type, speed: +S.speed.toFixed(1), eye: +q.eye.toFixed(2), near: +q.near.toFixed(2), mesh: +q.mesh.toFixed(2), ...(extra ? extra() : {}) }; } };
      const run = (name, secs, steer, each, extra) => { const n = Math.round(secs * 60); if (G.mode !== 'run') G.start();
        for (let i = 0; i < n; i++) { if (each) each(i / 60); M.Input.script = steer(G.runT); ski.frame(1 / 60); rec(name, extra); } };
      const fresh = () => { ski.reset(0); G.setView && G.setView('chase', true); const L = G.look; L.ty = L.tp = L.yaw = L.pit = 0; L.hold = false; L.idle = 9; };
      // 1 追尾，正常连续转弯
      fresh(); run('追尾_正常转弯', SEC, ski.pilot());
      // 2 追尾，大幅急转（贴着 U 型槽墙、林道 S 弯）
      fresh(); run('追尾_急转', SEC, ski.pilot(0.85, 3.0));
      // 3 转视角：两指/右键拖动，绕人一圈、往上翻（"往上翻会把镜头往人身后压低，直到碰到雪"）
      fresh(); { const L = G.look; run('转视角', SEC, ski.pilot(0.6, 4), t => { L.hold = true; L.idle = 0; L.ty = 2.9 * Math.sin(t * 0.7); L.tp = t % 6 < 3 ? 0.95 : -1.15 * Math.abs(Math.sin(t * 1.3)); }, () => ({ ty: +G.look.yaw.toFixed(2), tp: +G.look.pit.toFixed(2) })); L.hold = false; }
      // 4 其他机位
      for (const v of ['fp', 'tips', 'low', 'high', 'left', 'right', 'front', 'far']) { fresh(); G.setView(v, true); run('机位_' + v, Math.min(SEC, 90), ski.pilot(0.7, 3.5)); }
      // 4b 其他机位 + 转视角
      for (const v of ['low', 'left', 'front']) { fresh(); G.setView(v, true); const L = G.look; run('机位_' + v + '+转视角', Math.min(SEC, 60), ski.pilot(0.7, 3.5), t => { L.hold = true; L.idle = 0; L.ty = 2.9 * Math.sin(t * 0.9); L.tp = t % 5 < 2.5 ? 0.95 : -1.1; }); L.hold = false; }
      fresh();
      // 5 标题页：在雪道上不同位置停下，镜头慢慢摆
      for (let s = 0; s < 3000; s += 150) { ski.reset(s); G.mode = 'title'; for (let i = 0; i < 300; i++) { ski.frame(1 / 60); rec('标题页'); } }
      return res;
    }, [SEC]);
    out[seed || 'default'] = r;
    await page.close();
  }
  await browser.close();
  for (const [seed, r] of Object.entries(out)) {
    console.log(`\n# 种子 ${seed}`);
    console.log('场景 | 帧数 | 画面钻进雪的帧 | 镜头本身在雪下的帧 | 最低余量(m) | 最坏一帧');
    for (const [k, o] of Object.entries(r)) console.log(`${k} | ${o.n} | ${o.bad} (${(100 * o.bad / o.n).toFixed(1)}%) | ${o.badEye} | ${o.min.toFixed(2)} | ${JSON.stringify(o.worst)}${o.stale ? ' | 未生成的网格帧 ' + o.stale : ''}`);
  }
  if (process.env.JSON) require('fs').writeFileSync(process.env.JSON, JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
