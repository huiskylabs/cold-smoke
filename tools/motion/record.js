// 动作录制器：无头跑真实游戏（不出图），按脚本操作，逐帧（60 Hz）记录人物关节、姿态参数和物理状态。
// 只读游戏，不改 src。输出 JSON 给 analyze.js 用。
//   node build.js && node tools/motion/record.js [输出目录=tools/motion/out/cand] [场景名...]
//   环境变量 PAGE=<某个 dev.html> 可以换成别的构建（默认是仓库的 dist/dev.html）。需要 playwright（和 tools/director-render.js 一样）。
//   环境变量 Q='v-motion=a&...' 可以追加地址参数（比如切换 Variants）。
// 场景定义见下面的 SCN（都在寒烟山 261111 上；seg 表示整座山强制成一种路段，方便取到某类地形）。
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const [outDir = path.join(__dirname, 'out', 'cand'), ...only] = process.argv.slice(2);
const PAGE = path.resolve(process.env.PAGE || path.join(__dirname, '..', '..', 'dist', 'dev.html'));

// 每个场景：seg 路段类型（null = 原山）、s0 起点、dur 秒、ctl 名字（页面里的控制函数）
const SCN = [
  { id: 'start', seg: null, s0: 14, dur: 14, ctl: 'none', note: '静止出发：撑杖 → 滑行 → 自动收成团身' },
  { id: 'keys_mid', seg: 'bowl', s0: 60, dur: 45, ctl: 'keys', per: 2.6, note: '键盘左右交替，每弯 1.3 秒（中弯）' },
  { id: 'keys_short', seg: 'bowl', s0: 60, dur: 40, ctl: 'keys', per: 1.3, note: '键盘左右交替，每弯 0.65 秒（小回转）' },
  { id: 'keys_long', seg: 'steeps', s0: 60, dur: 45, ctl: 'keys', per: 4.4, note: '陡坡，键盘每弯 2.2 秒（大弯，高速）' },
  { id: 'touch_sine', seg: 'bowl', s0: 60, dur: 45, ctl: 'sine', per: 3.0, amp: 0.6, note: '手指/倾斜的连续转向（正弦，幅度 0.6，周期 3 秒）' },
  { id: 'pilot', seg: null, s0: 60, dur: 90, ctl: 'pilot', note: '原山，测试驾驶员连续转弯绕树 90 秒（含各种路段和小腾空）' },
  { id: 'straight', seg: 'bowl', s0: 60, dur: 25, ctl: 'none', note: '直滑到自动团身' },
  { id: 'kickers', seg: 'kickers', s0: 60, dur: 80, ctl: 'jump', note: '跳台路段：直滑，按住起跳键过台（自动出各种空中动作）' },
  { id: 'hops', seg: 'bowl', s0: 60, dur: 40, ctl: 'hops', per: 3.0, note: '转弯中每 3 秒点一下跳（小跳 + 落地）' },
  { id: 'moguls_turn', seg: 'moguls', s0: 60, dur: 45, ctl: 'keys', per: 1.1, note: '蘑菇地，键盘快速左右' },
  { id: 'moguls_straight', seg: 'moguls', s0: 60, dur: 30, ctl: 'none', note: '蘑菇地直冲' },
  { id: 'rollers', seg: 'rollers', s0: 60, dur: 40, ctl: 'sine', per: 4.0, amp: 0.35, note: '波浪地：过坡顶失重、小腾空、落地' },
  { id: 'powder', seg: 'powder', s0: 60, dur: 40, ctl: 'sine', per: 3.2, amp: 0.6, note: '粉雪里连续转弯' },
  { id: 'brake', seg: 'bowl', s0: 60, dur: 30, ctl: 'brake', note: '加速后按住一个方向一直转到停，再松开重新出发' },
  { id: 'crash', seg: 'glade', s0: 60, dur: 40, ctl: 'crash', note: '林间：朝最近的树干撞过去（撞树后的反应和恢复）' },
  { id: 'foreaft', seg: 'bowl', s0: 60, dur: 40, ctl: 'fa', per: 2.6, note: '转弯时前压 / 后坐（前后重心）' },
  { id: 'standjump', seg: null, s0: 14, dur: 24, ctl: 'charge', per: 3.0, hold: 0.6, note: '出发处几乎原地：按住跳蓄力 0.6 秒、松开，每 3 秒一次（蹲下、蹬起、落地）' },
  { id: 'chargehop', seg: 'bowl', s0: 60, dur: 30, ctl: 'charge', per: 3.0, hold: 0.6, note: '直滑中按住跳蓄力 0.6 秒、松开，每 3 秒一次' },
  { id: 'turnback', seg: 'bowl', s0: 60, dur: 40, ctl: 'turnback', per: 5.0, hold: 1.4, note: '拐一下再松手回正：按 1.4 秒，松开滑 3.6 秒，左右轮流（看回正后上身还扭不扭）' },
  { id: 'tuckbtn', seg: 'steeps', s0: 60, dur: 30, ctl: 'tuck', note: '按住团身键，再松开转弯' },
];

// 页面里跑的“操作脚本”：返回 ctl(t)，每帧调用一次来按键 / 给转向（作为源码字符串传进页面）
const mkCtl = function (sc) {
  const K = window.__ski, M = K.m, G = M.Game, S = G.s, I = M.Input, C = M.Course;
  const pilot = K.pilot(), tn = {};
  const key = d => { I.keys.ArrowLeft = d < 0; I.keys.ArrowRight = d > 0; };
  return {
    none: t => { key(0); },
    turnback: t => { const u = (t - 3) % sc.per, k = Math.floor((t - 3) / sc.per); key(t < 3 || u > sc.hold ? 0 : (k % 2 ? 1 : -1)); },
    keys: t => { key(t < 3 ? 0 : (Math.floor((t - 3) / (sc.per / 2)) % 2 ? -1 : 1)); },
    sine: t => { I.script = t < 3 ? 0 : sc.amp * Math.sin((t - 3) * 2 * Math.PI / sc.per); },
    pilot: t => { I.script = pilot(t); },
    jump: t => { I.script = 0; I.btn.jump = t > 2 && S.contact && (G.flight.lipT < 0.5); },
    hops: t => { key(t < 3 ? 0 : (Math.floor((t - 3) / 1.5) % 2 ? -1 : 1)); const u = (t % sc.per); I.btn.jump = t > 4 && u < 0.25; },
    brake: t => { key(t < 7 ? 0 : t < 17 ? 1 : t < 22 ? 0 : -1); },
    // (评分器的覆盖场景：深压 = 转弯时按住下；刹停 = 先直滑 acc 秒攒速度，再按住一边转到停)
    keysDeep: t => { key(t < 3 ? 0 : (Math.floor((t - 3) / (sc.per / 2)) % 2 ? -1 : 1)); I.faScript = t < 3 ? 0 : -1; },
    holdDeep: t => { key(t < 3 ? 0 : (sc.side || 1)); I.faScript = t < 3 ? 0 : -1; },
    brakeAt: t => { const a = sc.acc || 6; key(t < a ? 0 : t < a + 8 ? (sc.side || 1) : 0); },
    crash: t => { // 朝前方最近的硬树干转
      let best = null; const p = S.p, vh = Math.hypot(S.v[0], S.v[2]) || 1, dx = S.v[0] / vh, dz = S.v[2] / vh;
      for (let a = 6; a <= 30; a += 3) for (let b = -8; b <= 8; b += 2) { const x = p[0] + dx * a - dz * b, z = p[2] + dz * a + dx * b; C.nearTree(x, z, tn); if (tn.ok && !tn.soft) { const ex = tn.x - p[0], ez = tn.z - p[2], f = ex * dx + ez * dz; if (f > 4 && (!best || f < best.f)) best = { x: tn.x, z: tn.z, f }; } }
      if (t > 4 && best) I.script = Math.max(-0.7, Math.min(0.7, (Math.atan2(best.x - p[0], -(best.z - p[2])) - Math.atan2(S.v[0], -S.v[2])) * 3)); else I.script = 0;
    },
    fa: t => { key(t < 3 ? 0 : (Math.floor((t - 3) / (sc.per / 2)) % 2 ? -1 : 1)); const k = Math.floor((t - 3) / (sc.per * 2)) % 3; I.faScript = t < 3 ? 0 : k === 0 ? 0 : k === 1 ? 1 : -1; },
    charge: t => { key(0); I.script = 0; const u = (t - 2) % sc.per; I.btn.jump = t > 2 && u < sc.hold; },
    tuck: t => { I.btn.tuck = t > 3 && t < 14; key(t < 16 ? 0 : (Math.floor((t - 16) / 1.6) % 2 ? -1 : 1)); },
  }[sc.ctl];
};
module.exports = { SCN, mkCtl };
if (require.main === module) (async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const LIST = process.env.MATRIX ? require('./score/scenarios.js').build() : SCN;      // MATRIX=1：评分器的覆盖矩阵（score/scenarios.js）
  const todo = LIST.filter(s => !only.length || only.some(o => s.id === o || s.id.startsWith(o + '.')));
  const gk = s => (s.seg || '') + '|' + (s.q || ''); const bySeg = {}; for (const s of todo) (bySeg[gk(s)] = bySeg[gk(s)] || []).push(s);
  for (const key of Object.keys(bySeg)) {
    const [seg, sq] = key.split('|');
    // （每种路段开一个新的浏览器：同一个浏览器里连开第二页偶尔会卡在加载上）
    const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
    const page = await browser.newPage({ viewport: { width: 640, height: 360 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => console.log('pageerror:', e.message));
    const q = `dev&manual&backend=webgl2&w=320&h=180&gov=0&quality=2&seed=261111${seg ? '&seg=' + seg : ''}${sq ? '&' + sq : ''}${process.env.Q ? '&' + process.env.Q : ''}`;
    await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());      // 不等网络字体
    await page.goto('file://' + PAGE + '?' + q, { waitUntil: 'domcontentloaded' });
    const t0 = Date.now(), boot = await page.evaluate(() => window.__ski.boot());
    console.log(`[${seg || '原山'}${sq ? ' ' + sq : ''}] boot`, boot, ((Date.now() - t0) / 1000).toFixed(1) + 's');
    for (const sc of bySeg[key]) {
      const t1 = Date.now();
      const data = await page.evaluate(([sc, ctlSrc]) => {
        const K = window.__ski, M = K.m, G = M.Game, S = G.s, I = M.Input, Sk = M.Skier, C = M.Course, T = M.Tracks;
        { const LR = self.__labride && self.__labride(); if (LR && LR.LabRide && LR.LabRide.on && LR.LabRide.on()) { const gear = M.Variants.val.ride === 'b' ? 'board' : 'ski'; let w = 0; while (!LR.LabRide.body(gear).ready && w < 6000) { K.sim(1 / 60, () => 0, { draw: false }); w++; } } }
        K.reset(sc.s0); G.trickSeed(12345); I.keys = {}; I.btn.jump = I.btn.tuck = false; I.script = null; I.faScript = null; I.kb = 0; I.kbV = 0;
        // （页面里的 tick 不是全局函数：用 __ski.sim 每次走一帧，fn 返回 null 表示走键盘那条路）
        const tick1 = () => K.sim(1 / 60, () => I.script, { draw: false });
        const ctl = (0, eval)('(' + ctlSrc + ')')(sc);
        const JK = ['pelvis', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR', 'footL', 'footR', 'chest', 'neck', 'skull', 'head', 'shL', 'shR', 'elbowL', 'elbowR', 'wristL', 'wristR', 'gripL', 'gripR', 'tipL', 'tipR', 'poleDL', 'poleDR'];
        const PK = ['lean', 'edge', 'crouch', 'tuck', 'air', 'sep', 'headYaw', 'lead', 'stance', 'fore', 'fa', 'swing', 'liftL', 'liftR', 'pitchL', 'pitchR', 'plantL', 'plantR', 'dp', 'grabL', 'grabR', 'tilt', 'tipL', 'tipR', 'quiet'];
        const SK = ['speed', 'lean', 'leanV', 'beta', 'load', 'e', 'leg', 'airT', 'landV', 'crash', 'charge', 'tuckIn', 'airK', 'dp', 'tuck', 'powder', 'aReac', 'u', 'brush', 'mogR', 'pdep'];
        const r3 = v => [Math.round(v[0] * 1e5) / 1e5, Math.round(v[1] * 1e5) / 1e5, Math.round(v[2] * 1e5) / 1e5], r5 = x => Math.round((x || 0) * 1e5) / 1e5;
        const out = { ff: [], hf: [], id: sc.id, note: sc.note, sc, dt: 1 / 60, JK, PK, SK, t: [], J: [], P: [], S: [], flag: [], root: [], bas: [], arm: [], ev: [], fl: [], seg: [], tGame: [], skis: [] };
        G.start();
        let last = null; const up0 = Sk.update; Sk.update = function () { const r = up0.apply(this, arguments); if (arguments[0] === G.root) last = r; return r; };
        const n = Math.round(sc.dur * 60), gl2 = true;
        for (let i = 0; i < n; i++) {
          const t = i / 60; ctl(t);
          const evs0 = []; const push0 = G.events.push; // 事件在 tick 里被清空，所以拦一下
          G.events.push = function (e) { evs0.push(e); return push0.call(this, e); };
          tick1();
          G.events.push = push0;
          if (i % 6 === 5 && T.pre) { try { T.pre(); } catch (e) { } }
          // （骨架用游戏这一帧真正画出来的那一份：包住 Skier.update 把它的返回值接下来；哪个版本、开了什么开关都一样量）
          const W = Sk.world, J = W.J, s = last || Sk.solve(Sk.pose, Sk.sec), p = G.pose, F = G.flight, col = (m, c) => [m[c * 4], m[c * 4 + 1], m[c * 4 + 2]], FB = Sk.B;
          out.t.push(r5(t)); out.tGame.push(r5(G.runT));
          out.J.push(JK.map(k => r3(J[k])));
          out.P.push(PK.map(k => r5(p[k])));
          out.S.push(SK.map(k => r5(S[k])));
          out.flag.push((S.air ? 1 : 0) | (S.contact ? 2 : 0) | (J.plantedL >= 1 ? 4 : 0) | (J.plantedR >= 1 ? 8 : 0) | (F.on ? 16 : 0));
          out.root.push([r3(G.root.pos), r3(G.root.fwd), r3(G.root.nrm)]);
          { const Fp = s.F[FB.pelvis], Fs = s.F[FB.spine], Fc = s.F[FB.chest], fl_ = s.F[FB.footL], fr_ = s.F[FB.footR];
            out.bas.push([r3(col(Fp, 0)), r3(col(Fp, 1)), r3(col(Fs, 1)), r3(col(Fc, 0)), r3(col(Fc, 1)), r3(s.hb.X), r3(s.hb.Y), r3(s.hb.Z), r3(col(fl_, 0)), r3(col(fl_, 2)), r3(col(fr_, 0)), r3(col(fr_, 2))]); }
          out.arm.push([r3(p.armL), r3(p.armR)]);
          // (评分器用：两块板和两只手的完整坐标系 X,Y,Z,位置；板的是游戏的雪板骨，手的是手骨)
          { const fr = m => [r3(col(m, 0)), r3(col(m, 1)), r3(col(m, 2)), r3(col(m, 3))]; out.ff.push([fr(s.F[FB.footL]), fr(s.F[FB.footR])]); out.hf.push([fr(s.F[FB.handL]), fr(s.F[FB.handR])]);
            // （拳的朝向：手套是跟着握杖的拳这个坐标走的，不是跟着手骨。X 轴 = 右手的手背方向；左手手套是镜像的，所以两只手自然握杖时 X 都指向身体的右）
            out.pf = out.pf || []; out.pf.push([fr(s.F[FB.poleL]), fr(s.F[FB.poleR])]); }
          out.fl.push([r5(F.w), r5(F.ph), r5(F.rem), r5(F.soak), r5(F.reach), r5(F.prep), r5(F.ld), r5(F.sink), r5(G.timeScale), r5(F.q.yaw), r5(F.q.flip), r5(F.q.own), r5(F.gnd), r5(F.l), r5(F.Xs)]);
          // 雪板两端离雪面的高度（世界坐标）：尾、尖
          { const o = M.Render.origin, sg = W.seg, h = (q) => r5(q[1] + o[1] - C.height(q[0] + o[0], q[2] + o[2], 0.5)); out.skis.push([h(sg[0][0]), h(sg[0][1]), h(sg[1][0]), h(sg[1][1])]); }
          // 板底离真实雪面（世界坐标，弯曲地形也对）：每块板 7 个截面 × 两条刃，[最低点, 板头到板尾那条线]，单位米
          { const o = M.Render.origin, gh = q => { const w = Sk.toWorld(q); return w[1] + o[1] - C.height(w[0] + o[0], w[2] + o[2], 0.5); };
            const sb = m => { const X = col(m, 0), Z = col(m, 2), P = col(m, 3); let lo = 9, line = -9;
              for (const z of [-0.75, -0.6, -0.3, 0, 0.3, 0.6, 0.75]) { let e = 9; for (const x of [-0.055, 0.055]) { const y = gh([P[0] + X[0] * x + Z[0] * z, P[1] + X[1] * x + Z[1] * z, P[2] + X[2] * x + Z[2] * z]); lo = Math.min(lo, y); e = Math.min(e, y); } line = Math.max(line, e); }
              return [r5(lo), r5(line)]; };
            out.skb = out.skb || []; out.skb.push([sb(s.F[FB.footL]), sb(s.F[FB.footR])]);
            // 每块板下的真实雪面相对人物自己的板面（不随新旧求解器变）：板头、脚下、板尾三处，雪面比板面高多少米。
            // 评分器用它分清“雪面自己在折弯，腿和板跟着动”和“无缘无故的抖”（2026-11-18，用户定）
            out.snw = out.snw || []; out.snw.push([-0.155, 0.155].map(x => [-0.75, 0, 0.75].map(z => r5(-gh([x, 0, z]))))); }
          out.gnd = out.gnd || []; out.gnd.push(Sk.sec && Sk.sec.gnd ? Sk.sec.gnd.map(r5) : null);      // 新求解器：每块板脚下雪面的 [高度, 俯仰]
          for (const e of evs0) out.ev.push([r5(t), e.type, e.id || '', r5(e.v || 0)]);
          if (i % 30 === 0) out.seg.push(C.segAt(-S.p[2]).type);
          out.trick = out.trick || []; if (F.trick && out.trick[out.trick.length - 1] !== F.trick) out.trick.push(F.trick);
        }
        I.keys = {}; I.btn.jump = I.btn.tuck = false; I.script = null; I.faScript = null; Sk.update = up0;
        out.LEN = Sk.LEN; out.vars = Object.assign({}, M.Variants.val);
        return out;
      }, [sc, mkCtl.toString()]);
      fs.writeFileSync(path.join(outDir, sc.id + '.json'), JSON.stringify(data));
      const sp = data.S.map(r => r[0]);
      console.log(`  ${sc.id}: ${data.t.length} 帧, 速度 ${Math.min(...sp).toFixed(1)}–${Math.max(...sp).toFixed(1)} m/s, 事件 ${data.ev.length}, 动作 [${(data.trick || []).join(',')}], 路段 ${[...new Set(data.seg)].join('/')}, ${((Date.now() - t1) / 1000).toFixed(1)}s`);
    }
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
