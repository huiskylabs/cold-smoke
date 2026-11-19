// 第一视角：两只手在画面里的时间和位置（不出图，只量数）。
// 用法: node tools/fpv/measure.js [页面=dist/dev.html] [秒=60] [种子="0,1,2"]
// SET='js' 开跑前先执行一段（比如改 Game.viewDefs.fp.arm 来试数）。
// 每帧记下左右手（握杖处 gripL/gripR）落在画面哪里：x、y 从 -1 到 1，超出就是不在画面里。
const { chromium } = require('playwright'), path = require('path');
const [PAGE = 'dist/dev.html', SEC = '60', SEEDS = '0,1,2'] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--no-sandbox'] });
  for (const seed of SEEDS.split(',').map(Number)) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on('pageerror', e => console.log('pageerror:', e.message));
    await page.goto('file://' + path.resolve(PAGE) + `?dev&manual&w=1280&h=800&gov=0&offscreen=1`);
    const b = await page.evaluate(() => window.__ski.boot()); if (!/^ok/.test(b)) throw new Error(b);
    const r = await page.evaluate(async ([seed, sec, set]) => {
      const ski = window.__ski, M = ski.m, G = M.Game, R = M.Render, Sk = M.Skier;
      const gl = M.App.gfx.gl; if (gl) gl.drawElementsInstanced = gl.drawArraysInstanced = gl.drawElements = gl.drawArrays = gl.clear = () => { };
      ski.tod('day'); ski.reset(seed); if (set) eval(set); G.setView('fp', true); G.start();
      for (let k = 0; k < 200 && !(G.fpv && G.fpv.ready); k++) { ski.frame(1 / 60); await new Promise(r => setTimeout(r, 100)); }      // (the first-person arms' shaders: see shot.js)
      ski.reset(seed); G.setView('fp', true);
      const pilot = ski.pilot(0.6, 4.5); G.start();
      const ndc = n => { const J = Sk.world && Sk.world.J; if (!J || !J[n]) return null; return proj(Sk.toWorld(J[n])); };
      const proj = q => { const c = R.cam; if (!c || !c.fwd) return null; const o = R.origin || [0, 0, 0], d = [q[0] + o[0] - c.pos[0], q[1] + o[1] - c.pos[1], q[2] + o[2] - c.pos[2]];
        const z = d[0] * c.fwd[0] + d[1] * c.fwd[1] + d[2] * c.fwd[2]; if (!(z > 0.05)) return [9, 9, z]; const t = Math.tan(c.fovY / 2), A = R.W / Math.max(1, R.H);
        return [(d[0] * c.right[0] + d[1] * c.right[1] + d[2] * c.right[2]) / z / t / A, (d[0] * c.up[0] + d[1] * c.up[1] + d[2] * c.up[2]) / z / t, z]; };
      const S = { L: [], R: [] }, st = { n: 0, ground: 0, inL: 0, inR: 0, both: 0, none: 0, why: {}, ex: [] };
      for (let i = 0; i < sec * 60; i++) { M.Input.script = pilot(G.runT); ski.frame(1 / 60); if (i < 180) continue;
        const air = G.flight && G.flight.w > 0.1; if (air) continue; st.n++;
        const fv = G.fpv, fh = k => { const A = fv && fv.sides && fv.sides[k]; if (!A || !A.G || !fv.posed) return null; const g = A.sg > 0 ? A.G : [-A.G[0], A.G[1], A.G[2]]; return proj(Sk.toWorld(g)); };
        const l = fh(1) || ndc('gripL'), r = fh(0) || ndc('gripR'), on = p => p && Math.abs(p[0]) < 1 && Math.abs(p[1]) < 1;
        const a = on(l), b = on(r); st.inL += a; st.inR += b; st.both += a && b; st.none += !a && !b;
        if (!a || !b) { const ps = G.pose, why = ps.dp > 0 ? '撑杖' : Math.abs(ps.lean) > 0.6 ? '大倾斜' : G.s.speed < 6 ? '慢' : '其他'; const side = !a && !b ? '两只' : !a ? '左' : '右', q = (!a ? l : r); st.why[why] = (st.why[why] || 0) + 1; if (why === '其他' && st.ex.length < 12 && i % 7 === 0) st.ex.push(side + ' ' + (q ? q.map(x => +x.toFixed(2)).join(',') : '-') + ' lean ' + ps.lean.toFixed(2) + ' sp ' + G.s.speed.toFixed(0)); }
        if (l) S.L.push(l); if (r) S.R.push(r); }
      const med = (A, k) => { const v = A.map(p => p[k]).filter(x => x < 8).sort((x, y) => x - y); return v.length ? [v[v.length >> 2], v[v.length >> 1], v[(3 * v.length) >> 2]].map(x => +x.toFixed(2)) : null; };
      return { st, fovY: +R.cam.fovY.toFixed(3), L: { x: med(S.L, 0), y: med(S.L, 1), z: med(S.L, 2) }, R: { x: med(S.R, 0), y: med(S.R, 1), z: med(S.R, 2) } };
    }, [seed, +SEC, process.env.SET || '']);
    const p = k => (100 * r.st[k] / r.st.n).toFixed(0) + '%';
    console.log(`seed ${seed}: 地面帧 ${r.st.n}, 左手在画面 ${p('inL')}, 右手 ${p('inR')}, 两只都在 ${p('both')}, 都不在 ${p('none')}; fovY ${r.fovY}`);
    console.log('  缺手的帧：', JSON.stringify(r.st.why), '\n   ', r.st.ex.join('\n    '));
    console.log(`  左手 x(25/50/75%) ${r.L.x} y ${r.L.y} 距离 ${r.L.z} | 右手 x ${r.R.x} y ${r.R.y} 距离 ${r.R.z}`);
    await page.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
