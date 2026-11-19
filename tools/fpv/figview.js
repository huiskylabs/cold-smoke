// 第一视角：急转刹车时人物自己的身体哪些部位进画面、离镜头多远（不出图，只量数）。
// 用法: node tools/fpv/figview.js [页面=dist/dev.html]
// 每帧把人物关节（领口、胸、肩、背包、骨盆、髋、膝、踝）投到画面上，记下落在画面里的、离镜头多远。
const { chromium } = require('playwright'), path = require('path');
const [PAGE = 'dist/dev.html'] = process.argv.slice(2);
const ONLY = process.env.ONLY; const CASES0 = [{ id: '急转刹车左', seed: 0, t: 12, hard: [-0.85, 1.6] }, { id: '急转刹车右', seed: 0, t: 20, hard: [0.85, 2.2] }, { id: '急转刹车左2', seed: 1, t: 15, hard: [-1, 2.5] }, { id: '急转刹车右2', seed: 2, t: 15, hard: [1, 2.5] }], CASES = CASES0.filter(c => !ONLY || ONLY.split(',').includes(c.id));
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--no-sandbox'] });
  for (const c of CASES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on('pageerror', e => console.log('pageerror:', e.message));
    await page.goto('file://' + path.resolve(PAGE) + `?dev&manual&w=1280&h=800&gov=0&offscreen=1&backend=webgl2`);
    const b = await page.evaluate(() => window.__ski.boot()); if (!/^ok/.test(b)) throw new Error(b);
    const r = await page.evaluate(async (c) => {
      const ski = window.__ski, M = ski.m, G = M.Game, R = M.Render, Sk = M.Skier;
      const gl = M.App.gfx.gl; if (gl) gl.drawElementsInstanced = gl.drawArraysInstanced = gl.drawElements = gl.drawArrays = gl.clear = () => { };
      ski.tod('day'); ski.reset(c.seed); G.setView('fp', true); G.start();
      for (let k = 0; k < 200 && !(G.fpv && G.fpv.ready); k++) { ski.frame(1 / 60); await new Promise(r => setTimeout(r, 100)); }
      ski.reset(c.seed); G.setView('fp', true); const pilot = ski.pilot(0.6, 4.5); G.start();
      const proj = q => { const cm = R.cam, o = R.origin || [0, 0, 0], d = [q[0] + o[0] - cm.pos[0], q[1] + o[1] - cm.pos[1], q[2] + o[2] - cm.pos[2]];
        const z = d[0] * cm.fwd[0] + d[1] * cm.fwd[1] + d[2] * cm.fwd[2], dist = Math.hypot(d[0], d[1], d[2]); if (!(z > 0.05)) return null; const t = Math.tan(cm.fovY / 2), A = R.W / Math.max(1, R.H);
        return [(d[0] * cm.right[0] + d[1] * cm.right[1] + d[2] * cm.right[2]) / z / t / A, (d[0] * cm.up[0] + d[1] * cm.up[1] + d[2] * cm.up[2]) / z / t, dist]; };
      const NM = ['neck', 'chest', 'shL', 'shR', 'pelvis', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR'];
      const n = c.t * 60, seen = {}, rows = []; let frames = 0;
      for (let i = 0; i < n + 120; i++) { M.Input.script = i > n - c.hard[1] * 60 ? c.hard[0] : pilot(G.runT); ski.frame(1 / 60);
        if (i < n - c.hard[1] * 60) continue; frames++;
        const J = Sk.world.J, ins = [];
        for (const k of NM) { const p = J[k] && proj(Sk.toWorld(J[k])); if (p && Math.abs(p[0]) < 1.1 && Math.abs(p[1]) < 1.1) { (seen[k] = seen[k] || []).push(p[2]); ins.push(k + '@' + p[2].toFixed(2) + '(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')'); } }
        if (i % 15 === 0) rows.push((i / 60).toFixed(2) + 's v' + G.s.speed.toFixed(0) + ' lean ' + G.pose.lean.toFixed(2) + ' fpIn ' + !!G.fpIn + ' hideFig ' + !!(G.fpv && G.fpv.hideFig) + ' | ' + ins.join(' '));
      }
      const sum = {}; for (const k in seen) { const v = seen[k].sort((a, b) => a - b); sum[k] = Math.round(100 * v.length / frames) + '% 最近' + v[0].toFixed(2) + 'm 中位' + v[v.length >> 1].toFixed(2) + 'm'; }
      return { frames, sum, rows };
    }, c);
    console.log(`== ${c.id}: ${r.frames} 帧`); for (const k in r.sum) console.log('  ', k, r.sum[k]); console.log('   ' + r.rows.join('\n   '));
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
