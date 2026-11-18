// 狐狸带路：坐姿的数字检查（不出图）。坐下以后：四只脚在雪面上（不陷、不浮），屁股落到接近雪面，前腿直立，尾巴不插进雪里。
//   node build.js && node tools/foxguide-pose.js
const { chromium } = require('playwright'), path = require('path');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('pageerror:', e.message));
  await page.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&manual&w=400&h=300');
  const r = await page.evaluate(() => {
    const M = window.__ski.m, F = M.Fauna, K = F.sp.fox, out = [];
    for (const up of [0, 0.5, 1]) {
      const p = F.newPose(); M.FoxGuide.sit(K, up, p); const s = K.Q.solve(p), J = s.J, sc = K.scale;
      const feet = J.legs.map(l => +(Math.min(l[3][1], l[4][1]) * sc).toFixed(3)), hocks = J.legs.slice(2).map(l => +(l[2][1] * sc).toFixed(3));
      const rump = +(J.Oh[1] * sc).toFixed(3), chest = +(J.Oc[1] * sc).toFixed(3), head = +(J.HB[1] * sc).toFixed(3), tail = +(Math.min(...J.tail.map(q => q[1])) * sc).toFixed(3), tailPts = J.tail.map(q => q.map(v => +(v * sc).toFixed(2)));
      const fore = J.legs.slice(0, 2).map(l => +(Math.atan2(Math.abs(l[3][2] - l[0][2]), l[0][1] - l[3][1]) * 57.3).toFixed(1));
      out.push({ up, feet, hocks, rump, chest, head, tail, tailPts, foreLegFromVertical: fore });
    }
    const p0 = F.newPose(), s0 = K.Q.solve(p0); out.push({ standing: { rump: +(s0.J.Oh[1] * K.scale).toFixed(3), chest: +(s0.J.Oc[1] * K.scale).toFixed(3), head: +(s0.J.HB[1] * K.scale).toFixed(3) } });
    return out;
  });
  let ok = true;
  for (const o of r) { console.log(JSON.stringify(o)); if (o.feet) { if (o.feet.some(f => f < -0.02 || f > 0.05)) ok = false; if (o.tail < 0.03) ok = false; if (o.rump > 0.25) ok = false; } }
  console.log(ok ? 'POSE_PASS' : 'POSE_FAIL'); await browser.close(); process.exit(ok ? 0 : 1);
})();
