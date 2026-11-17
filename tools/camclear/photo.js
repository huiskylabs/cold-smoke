// 拍照模式的自由镜头：玩家按 Q（往下）一直压、朝各个方向看，镜头被 keepIn 托住以后，画面近处的四个角还在不在雪面以上。
// 在雪道上取很多点，每点把镜头压到最低、转一圈、上下看，统计画面一角钻进雪里的情况。用法: node tools/camclear/photo.js
const { chromium } = require('playwright'), path = require('path');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 844, height: 390 } });
  await page.goto('file://' + path.resolve(__dirname, '../../dist/dev.html') + '?dev&manual&w=844&h=390&gov=0&backend=webgl2');
  await page.evaluate(async () => window.__ski.boot());
  const r = await page.evaluate(() => {
    const C = window.__ski.m.Course, A = 844 / 390, near = 0.25;
    const top = C.snowTop ? (x, z) => C.snowTop(x, z) : (x, z) => C.height(x, z, 0.5);
    let n = 0, bad = 0, min = 1e9, worst = null;
    for (let s = 20; s < 6000; s += 7.3) {
      const c = C.at(s);
      for (const u of [-1.6, -1.1, -0.6, 0, 0.6, 1.1, 1.6]) {
        const x = c.cx + u * c.hw, z = -s, y = top(x, z) + 0.3;      // keepIn: 压到最低
        for (let yaw = 0; yaw < 6.28; yaw += 0.5) for (const pit of [-1.5, -1.0, -0.5, 0, 0.5, 1.0]) for (const fov of [0.9, 1.75]) {
          const f = [Math.sin(yaw) * Math.cos(pit), Math.sin(pit), -Math.cos(yaw) * Math.cos(pit)], rl = Math.hypot(f[0], f[2]) || 1e-6;
          const rt = [-f[2] / rl, 0, f[0] / rl], up = [rt[1] * f[2] - rt[2] * f[1], rt[2] * f[0] - rt[0] * f[2], rt[0] * f[1] - rt[1] * f[0]];
          const hh = near * Math.tan(fov / 2), hw = hh * A; let m = 1e9;
          const y1 = y + (C.nearLift ? C.nearLift([x, y, z], f, fov, A, near) : 0);      // 修后：steer() 里再按画面四角抬一次
          for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = [0, 1, 2].map(i => [x, y1, z][i] + f[i] * near + rt[i] * hw * a + up[i] * hh * b); m = Math.min(m, p[1] - C.height(p[0], p[2], 0.5)); }
          n++; if (m < 0) bad++; if (m < min) { min = m; worst = { s, u, yaw, pit, fov, seg: C.segAt(s).type }; }
        }
      }
    }
    return { n, bad, min, worst };
  });
  console.log(`拍照镜头压到最低：${r.n} 个姿态，画面一角钻进雪 ${r.bad} 个（${(100 * r.bad / r.n).toFixed(2)}%），最深 ${r.min.toFixed(2)} m`, JSON.stringify(r.worst));
  await browser.close();
})();
