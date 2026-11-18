// 狐狸带路：只跑物理和规则、不出图的检查（画图调用换成空函数，云端 SwiftShader 也能跑）。
//   node build.js && node tools/foxguide-test.js [种子...]
// 两种滑手：
//   1 脚本滑手：沿狐狸的线，以参考速度的 70% / 100% / 130% 滑；中途停 20 秒再走；停下不动；不进岔路只走主道
//   2 真滑手：游戏自己的物理 + 测试驾驶（只沿主道左右转弯）
// 每一趟记：有没有到地方、收没收到、用了多久、等了几次、追上几次、挪位置几次；硬规则：画面里从没瞬移、从没钻到雪板底下、
// 滑得再慢也没真丢（没到地方就走掉只允许是“不理它”“走了别的路”）。全过打印 ALL_PASS。
const { chromium } = require('playwright'), path = require('path');
const SEEDS = process.argv.slice(2).map(Number);
const PAGE = process.env.PAGE || path.resolve(__dirname, '../dist/dev.html');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader'] });
  let allPass = true; const out = {};
  for (const seed of SEEDS.length ? SEEDS : [0]) {
    const page = await browser.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => console.error('pageerror:', e.message));
    page.on('console', m => { if (/fox|error|rings|draw|warn/i.test(m.text()) || m.type() === 'warning' || m.type() === 'error') console.log('console:', m.text()); });
    await page.goto('file://' + PAGE + '?dev&manual&w=844&h=390&gov=0&backend=webgl2&v-foxguide=on' + (seed ? '#' + seed : ''));
    const b = await page.evaluate(async () => window.__ski.boot());
    if (!/^ok/.test(b)) throw new Error(b);
    const r = await page.evaluate((seed) => {
      if (seed) window.__ski.m.Course.setSeed(seed);
      const M = window.__ski.m, Gm = M.Game, C = M.Course, R = M.Render, ski = window.__ski, FG = M.FoxGuide, F = M.Fauna;
      const gl = M.App.gfx.gl; if (gl) { gl.drawElementsInstanced = gl.drawArraysInstanced = gl.drawElements = gl.drawArrays = gl.clear = () => { }; }
      try { localStorage.removeItem('cs.foxden'); } catch (e) { } FG.done = null;
      const res = {}, clamp = (x, a, b) => x < a ? a : x > b ? b : x;
      const pc = {};
      // ---- one leading, from the meeting to the end, with a skier the script moves: speed k x vref along `line(s, g)`
      function scripted(name, s0, opt) {
        ski.reset(s0); Gm.start(); Gm.mode = 'run'; F.reset(); F.clear(); FG.reset(); FG.log.length = 0; FG.seed(7); F.seed(11);
        for (const k in FG.stats) FG.stats[k] = 0;
        const S = Gm.s, dt = 1 / 60; let s = s0, u = 0, t = 0, fox = null, g = null, prev = null, jumps = 0, under = 0, maxGap = 0, began = -1, endT = -1, stopT = 0;
        const flags = { found: false, there: false, why: null };
        F.spawn('fox');
        for (let i = 0; i < 60 * 260; i++) {
          t += dt; Gm.runT += dt;
          // the skier
          const cur = F.live.find(a => a.K && a.K.id === 'fox' && !a.frozen); if (cur) fox = cur; g = fox && fox.guide;
          let v = opt.v(t, g, s); if (v < 0) v = 0;
          const uT = opt.line ? opt.line(s, g) : 0; u += clamp(uT - u, -v * 0.5 * dt - 0.02, v * 0.5 * dt + 0.02);
          s += v * dt; const c = C.at(s, pc), x = c.cx + u, y = C.height(x, -s, 0.5);
          const vx = (x - S.p[0]) / dt;
          S.p[0] = x; S.p[1] = y; S.p[2] = -s; S.v[0] = vx; S.v[1] = 0; S.v[2] = -v; S.speed = Math.hypot(vx, v); S.r[0] = 1; S.r[1] = 0; S.r[2] = 0;
          // the chase camera: behind and above, looking down the line
          const yw = Math.atan2(vx, Math.max(v, 0.5)); R.cam.pos[0] = x - 7 * Math.sin(yw); R.cam.pos[1] = y + 2.6; R.cam.pos[2] = -s + 7 * Math.cos(yw);
          R.cam.fwd[0] = Math.sin(yw) * 0.97; R.cam.fwd[1] = -0.2; R.cam.fwd[2] = -Math.cos(yw) * 0.97; R.cam.fovY = 1.0;
          F.update(dt, t);
          if (g && began < 0) began = t;
          if (fox && !fox.gone && g) {
            const p = fox.pos, d = Math.hypot(p[0] - S.p[0], p[2] - S.p[2]);
            // (a jump in sight: more than it could have run in a frame, while the camera sees it both before and after)
            if (prev && fox.fade > 0.3 && Math.hypot(p[0] - prev[0], p[2] - prev[2]) > Math.max(fox.v, 1) * dt * 3 + 0.4 && prev.vis && FG._vis(p) && prev.who === fox) { jumps++; if (!res._j) res._j = []; if (res._j.length < 12) res._j.push({ name, t: +t.toFixed(2), st: g.st, d: +Math.hypot(p[0] - prev[0], p[2] - prev[2]).toFixed(2), v: +fox.v.toFixed(2), lift: fox.lift, off: +fox.off.toFixed(2), s: +fox.s.toFixed(1), init: fox.init }); }
            prev = [p[0], p[1], p[2]]; prev.vis = FG._vis(p); prev.who = fox;
            if (d < 1.2 && g.st !== 'there') under++;
            if (g.st === 'run') maxGap = Math.max(maxGap, fox.s - s);
            if (g.got) flags.found = true; if (g.st === 'there') flags.there = true;
          }
          if (g && g.ended) { endT = t; break; }
          if (began < 0 && t > 40) break;
        }
        const st = Object.assign({}, FG.stats), lg = FG.log.filter(e => e.what !== 'catch').map(e => e.what + (e.why ? '(' + e.why + ')' : '') + '@' + e.t).join(' ');
        const goneWhy = (FG.log.filter(e => e.what === 'gone').pop() || {}).why || null;
        const o = { began: began >= 0, spot: g ? g.sp.id : null, kind: g ? g.sp.kind : null, dist: g ? Math.round(g.sp.s - g.s0) : 0, found: flags.found, there: flags.there, secs: endT > 0 ? +(endT - began).toFixed(1) : null, goneWhy,
          waits: st.waits, catches: st.catches, comes: st.comes, jumpsInSight: jumps, underSkis: under, maxGap: +maxGap.toFixed(1), prints: FG.prints || 0, yips: FG.yips || 0, log: lg.slice(0, 400) };
        res[name] = o; return o;
      }
      const vref = (s, g) => FG.vref(s, g && g.sp.kind === 'lane' && s > g.sp.lane.s0 + 30);
      const follow = (s, g) => g ? g.sp.path(s) : 0;
      FG._vis = p => { const c = R.cam, dx = p[0] - c.pos[0], dy = p[1] - c.pos[1], dz = p[2] - c.pos[2], d = Math.hypot(dx, dy, dz); return d < 280 && (d < 2 || (dx * c.fwd[0] + dy * c.fwd[1] + dz * c.fwd[2]) / d > Math.cos(1.0 * 0.8)); };
      const starts = [600, 1500, 2600];
      for (const s0 of starts) {
        for (const k of [0.7, 1.0, 1.3]) scripted(`跟着它·${Math.round(k * 100)}%·从${s0}m`, s0, { v: (t, g, s) => k * vref(s, g), line: follow });
        scripted(`停20秒再走·从${s0}m`, s0, { v: (t, g, s) => g && g.t > 15 && g.t < 35 ? 0 : 0.9 * vref(s, g), line: follow });
        scripted(`停下不动·从${s0}m`, s0, { v: (t, g, s) => g && g.t > 10 ? 0 : 0.9 * vref(s, g), line: follow });
        scripted(`只走主道·从${s0}m`, s0, { v: (t, g, s) => 0.9 * vref(s, g), line: () => 0 });
      }
      // ---- at night: the same, and its eyes give back the light
      { ski.tod('night'); const e0 = FG.eyeN || 0; const o = scripted('夜里·跟着它·100%·从600m', 600, { v: (t, g, s) => vref(s, g), line: follow }); o.eyeGlints = (FG.eyeN || 0) - e0; ski.tod('day'); }
      // ---- the real skier: the game's own physics. Two pilots: the test pilot (turns down the middle of the run, pays the fox no mind),
      // and one who follows the fox: steers for the fox's line a speed's worth ahead, round the trees
      const follower = () => { const base = ski.pilot(0.25, 5.2), tn = {}, pc2 = {}; return t => {
        const cur = F.live.find(a => a.K && a.K.id === 'fox' && !a.frozen), g = cur && cur.guide, S = Gm.s, p = S.p; if (!g || g.st === 'gone') return base(t);
        const look = 8 + Math.max(S.speed, 4) * 0.8, s = -p[2] + look, c = C.at(s, pc2); let tx = c.cx + (g.st === 'there' ? g.sp.u : g.sp.path(s)); const tz = p[2] - look;
        if (g.flame && Math.abs(g.sp.s + p[2]) < look + 10) tx = g.flame.p[0];
        for (let k = 1; k <= 8; k++) { const qx = p[0] + (tx - p[0]) * k / 8, qz = p[2] + (tz - p[2]) * k / 8; C.nearTree(qx, qz, tn); if (tn.ok && !tn.soft && tn.d < 3.4) tx += (qx >= tn.x ? 1 : -1) * (4.6 - tn.d) * (k < 3 ? 2.6 : 1.1); }
        return clamp((Math.atan2(tx - p[0], -(tz - p[2])) - Math.atan2(S.v[0], -S.v[2])) * 2.4, -0.85, 0.85); }; };
      for (const [nm, mk] of [['真滑手·跟着狐狸·300秒', follower], ['真滑手·不理狐狸·300秒', () => ski.pilot(0.45, 5.2)]]) { ski.reset(300); Gm.start(); F.reset(); F.clear(); FG.reset(); FG.log.length = 0; for (const k in FG.stats) FG.stats[k] = 0;
        const steer = mk(); let led = 0, jumps = 0, under = 0, prev = null, fox = null, n = 0;
        for (let i = 0; i < 60 * 300; i++) {
          M.Input.script = steer(Gm.runT); ski.frame(1 / 60);
          const cur = F.live.find(a => a.K && a.K.id === 'fox' && !a.frozen);
          if (!cur && !F.ev && i % 120 === 0) F.spawn('fox');
          if (cur && cur.guide) { const p = cur.pos, S = Gm.s; if (prev && cur === fox && cur.fade > 0.3 && prev.vis && FG._vis(p) && Math.hypot(p[0] - prev[0], p[2] - prev[2]) > Math.max(cur.v, 1) / 60 * 3 + 0.4) jumps++; if (Math.hypot(p[0] - S.p[0], p[2] - S.p[2]) < 1.2 && cur.guide.st !== 'there') under++; prev = [p[0], p[1], p[2]]; prev.vis = FG._vis(p); fox = cur; n++; }
        }
        res[nm] = Object.assign({}, FG.stats, { goneWhys: FG.log.filter(e => e.what === 'gone').map(e => e.why + (e.minF != null ? ':' + e.minF + 'm/' + e.uS : '')).join(','), spots: FG.log.filter(e => e.what === 'begin').map(e => e.kind).join(','), jumpsInSight: jumps, underSkis: under, frames: n, sEnd: Math.round(-Gm.s.p[2]), log: FG.log.filter(e => e.what !== 'catch').map(e => e.what + (e.why ? '(' + e.why + ')' : '') + '@' + e.t).join(' ').slice(0, 600) });
      }
      res._seed = C.seed; return res;
    }, seed);
    // ---- verdicts
    let pass = true; const fails = [];
    console.log('mountain seed', r._seed); delete r._seed;
    if (r._j) { console.log('jumps:', JSON.stringify(r._j)); delete r._j; }
    for (const [name, o] of Object.entries(r)) {
      const bad = [];
      if (o.jumpsInSight) bad.push('画面里瞬移 ' + o.jumpsInSight);
      if (o.underSkis) bad.push('钻到雪板下 ' + o.underSkis + ' 帧');
      if (/^跟着它|^停20秒|^夜里/.test(name)) { if (!o.began) bad.push('没开始带路'); else if (!o.found) bad.push('没收到卡（' + o.goneWhy + '）'); }
      if (/^夜里/.test(name) && !(o.eyeGlints > 0)) bad.push('夜里没有眼睛反光');
      if (/跟着狐狸/.test(name) && !(o.found >= 1)) bad.push('真滑手跟着狐狸一张卡都没收到');
      if (/^停下不动/.test(name) && o.began && o.goneWhy !== 'ignored') bad.push('停下不动应在 60 秒后因“不理它”走掉，实际 ' + o.goneWhy);
      if (bad.length) { pass = false; fails.push(name + ': ' + bad.join('，')); }
      console.log((bad.length ? '✗ ' : '✓ ') + name.padEnd(22), JSON.stringify(Object.assign({}, o, { log: undefined })));
      if (process.env.LOG) console.log('   ', o.log);
    }
    if (!pass) { allPass = false; console.log('FAIL seed', seed || 'default', '\n  ' + fails.join('\n  ')); }
    out[seed || 'default'] = r;
    await page.close();
  }
  await browser.close();
  require('fs').writeFileSync(path.join(__dirname, '..', 'dist', 'foxguide-test.json'), JSON.stringify(out, null, 1));
  console.log(allPass ? 'ALL_PASS' : 'SOME_FAIL');
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
