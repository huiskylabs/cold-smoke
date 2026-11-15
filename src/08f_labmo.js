// ---------------------------------------------------------------- 人物动作 b: the skier turns the way the human lab's real skiers do
// The lab (code-only-game-kit research/human) solves whole-body ski turns from real skiing (video of skiers and race footage, measured joint by joint)
// and exports them as postures by lean (08e_labmodata.js, made by its tools/export_game.js): for each turn, the way in (lean growing) and the way
// out (lean shrinking), on a grid of the lean as a share of the deepest. Here the game's own lean picks the posture:
//   - the lean as a share of how deep the recent turns went, so a gentle turn has the same rhythm as a deep one, only less laid over;
//   - going in or coming out by whether the lean grows or shrinks, faded, never switched;
//   - short turns at low speed, the carve in between, the giant-slalom turn when fast;
//   - then the whole figure is rolled about the skis by what is left between the lab's lean and the game's, so the body leans exactly as the
//     physics asks (the posture comes from the lab, the balance from the game).
// Feet and skis, the crouch of the suspension, fore/aft, pole plants, the double-pole stroke, tucks, air, grabs and standing at ease stay the
// game's own: there the lab's figure fades out (lab.w). Nothing is sprung or filtered on the pose itself.
const LabMo = (() => {
  const D = LABMO_DATA, G = D.G, CL = ['shortturn', 'carve', 'gsturn'];
  const on = () => typeof Variants === 'undefined' || Variants.val.labmo === 'b';
  if (typeof Variants !== 'undefined') Variants.def('labmo', '人物动作', [['a', '原来'], ['b', '实验室']], 'b');
  // the lab body's legs (hip to ankle 0.82 m) to the game skier's (0.86 m, in boots)
  const M = { LEG: 1.05 };
  const st = { w: 0, s: 0, A: 0.35, prev: 0, side: 1, cref: 0.21 };
  const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dt3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  // a frame from an X and a Y that are nearly square: Y kept, X squared to it, Z = X x Y (the game's frames are right-handed with Z backward)
  const ortho = (X, Y) => { Y = nrm(Y); const x = nrm([X[0] - Y[0] * dt3(X, Y), X[1] - Y[1] * dt3(X, Y), X[2] - Y[2] * dt3(X, Y)]); return { X: x, Y, Z: crs(x, Y) }; };
  M.mixB = (a, b, w) => w >= 1 ? b : ortho(v3.lerp(a.X, b.X, w), v3.lerp(a.Y, b.Y, w));
  // one grid row by the lean's share v (0..1)
  const row = (tab, v) => { const x = Math.min(1, Math.max(0, v)) * (G - 1), i = Math.min(G - 2, Math.floor(x)), u = x - i, a = tab[i], b = tab[i + 1]; return a.map((q, k) => q + (b[k] - q) * u); };
  const out = { w: 0, cref: 0.21, pel: [0, 0, 0], pb: null, t1: null, t2: null, hb: null, ua: [null, null], fa: [null, null] };
  M.step = function (p, sec, dt, speed) {
    const idle = sec.idle ? sec.idle.rest || 0 : 0, grab = Math.max(p.grabL || 0, p.grabR || 0);
    const wT = on() ? (1 - Math.min(1, (p.air || 0) * 2.5)) * (1 - Math.min(1, (p.tuck || 0) * 1.6)) * (1 - Math.min(1, grab * 2)) * (1 - (p.dp > 0 ? 1 : 0)) * (1 - idle) : 0;
    st.w = dt > 0 ? st.w + (wT - st.w) * (1 - Math.exp(-dt * 6)) : wT;
    const lean = p.lean || 0, a = Math.abs(lean);
    if (dt > 0) {
      st.A = Math.max(0.3, a, st.A * Math.exp(-dt / 3));          // how deep the recent turns went
      const da = (a - st.prev) / dt, sT = da < -0.04 ? 1 : da > 0.04 ? 0 : st.s;
      st.s += (sT - st.s) * (1 - Math.exp(-dt * 5));
      st.cref += ((p.crouch == null ? 0.21 : p.crouch) - st.cref) * (1 - Math.exp(-dt / 1.5));     // (the crouch the skier holds; only its quick changes, bumps and landings, move the lab's figure)
    } else { st.A = Math.max(0.3, a); st.s = 0; st.cref = p.crouch == null ? 0.21 : p.crouch; }
    st.prev = a; if (lean > 0.02) st.side = 1; else if (lean < -0.02) st.side = -1;
    if (st.w < 1e-3) return null;
    // which turns, by speed (m/s)
    const sm = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
    const wS = 1 - sm(5, 9, speed), wG = sm(14, 20, speed), cw = [wS, Math.max(0, 1 - wS - wG), wG];
    const v = a / st.A, r = new Array(39).fill(0);
    for (let c = 0; c < 3; c++) { if (cw[c] <= 0) continue; const T = D.clips[CL[c]], ri = row(T.rise, v), fo = row(T.fall, v);
      for (let k = 0; k < 39; k++) r[k] += cw[c] * (ri[k] + (fo[k] - ri[k]) * st.s); }
    const V = i => [r[i], r[i + 1], r[i + 2]];
    let pel = V(0), pb = [V(3), V(6)], t1 = [V(9), V(12)], t2 = [V(15), V(18)], hb = [V(21), V(24)], ua = [V(27), V(30)], fa = [V(33), V(36)];
    // a left turn: the right one in the mirror (x flips, left and right swap, a frame's X turns into minus the mirrored X)
    if (st.side < 0) { const mx = q => [-q[0], q[1], q[2]], mX = q => [q[0], -q[1], -q[2]];
      pel = mx(pel); pb = [mX(pb[0]), mx(pb[1])]; t1 = [mX(t1[0]), mx(t1[1])]; t2 = [mX(t2[0]), mx(t2[1])]; hb = [mX(hb[0]), mx(hb[1])]; ua = [mx(ua[1]), mx(ua[0])]; fa = [mx(fa[1]), mx(fa[0])]; }
    // the rest of the lean: the whole figure rolled about the skis (the game's pelvis stands out by H sin(lean) + 0.07 sin(lean): about 1.07 lean)
    const c0 = Math.atan2(pel[0], pel[1]), cr = lean * 1.07 - c0, cs = Math.cos(cr), sn = Math.sin(cr), R = q => [q[0] * cs + q[1] * sn, -q[0] * sn + q[1] * cs, q[2]];
    out.w = st.w; out.cref = st.cref; out.pel = R(pel);
    out.pb = ortho(R(pb[0]), R(pb[1])); out.t1 = ortho(R(t1[0]), R(t1[1])); out.t2 = ortho(R(t2[0]), R(t2[1])); out.hb = ortho(R(hb[0]), R(hb[1]));
    out.ua[0] = nrm(R(ua[0])); out.ua[1] = nrm(R(ua[1])); out.fa[0] = nrm(R(fa[0])); out.fa[1] = nrm(R(fa[1]));
    out.clip = cw; out.v = v; out.s = st.s;
    return out;
  };
  // ---- on a snowboard (Variants 'ride' b, 08a_board.js): the lab's board turn. Toe and heel turns are not mirror images, so each has its own
  // table; everything is in the board solver's rider space (x toward the tail, y up, z toward the heel edge: the rider faces -z), and the figure
  // is rolled about the board's length to the game's lean (+ = over the toes)
  const outB = { w: 0, cref: 0.21, pel: [0, 0, 0], pb: null, t1: null, t2: null, hb: null, ua: [null, null], fa: [null, null] }, sb = { w: 0, s: 0, A: 0.35, prev: 0, cref: 0.21 };
  M.stepB = function (p, sec, dt) {
    const T = D.clips.sbturn; if (!T) return null;
    const idle = sec.idle ? sec.idle.rest || 0 : 0, grab = Math.max(p.grabL || 0, p.grabR || 0);
    const wT = on() ? (1 - Math.min(1, (p.air || 0) * 2.5)) * (1 - Math.min(1, (p.tuck || 0) * 1.6)) * (1 - Math.min(1, grab * 2)) * (1 - idle) : 0;
    sb.w = dt > 0 ? sb.w + (wT - sb.w) * (1 - Math.exp(-dt * 6)) : wT;
    const lean = p.lean || 0, a = Math.abs(lean);
    if (dt > 0) { sb.A = Math.max(0.3, a, sb.A * Math.exp(-dt / 3)); const da = (a - sb.prev) / dt, sT = da < -0.04 ? 1 : da > 0.04 ? 0 : sb.s; sb.s += (sT - sb.s) * (1 - Math.exp(-dt * 5));
      sb.cref += ((p.crouch == null ? 0.21 : p.crouch) - sb.cref) * (1 - Math.exp(-dt / 1.5)); }
    else { sb.A = Math.max(0.3, a); sb.s = 0; sb.cref = p.crouch == null ? 0.21 : p.crouch; }
    sb.prev = a;
    if (sb.w < 1e-3) return null;
    const tab = lean >= 0 ? T.toe : T.heel, v = a / sb.A, ri = row(tab.rise, v), fo = row(tab.fall, v), r = ri.map((q, k) => q + (fo[k] - q) * sb.s);
    const V = i => [r[i], r[i + 1], r[i + 2]];
    // (the lab's lean over the toes, + toward -z; the rest to the game's lean)
    const c0 = Math.atan2(-r[2], r[1]), cr = lean - c0, cs = Math.cos(cr), sn = Math.sin(cr), R = q => [q[0], q[1] * cs + q[2] * sn, -q[1] * sn + q[2] * cs];
    outB.w = sb.w; outB.cref = sb.cref; const pv = V(0); pv[0] *= 0.5; outB.pel = R(pv);      // (the lab's rider moves the hips 27 cm along the board through a turn, 12-16 cm toward the tail between turns: half of it here)
    outB.pb = ortho(R(V(3)), R(V(6))); outB.t1 = ortho(R(V(9)), R(V(12))); outB.t2 = ortho(R(V(15)), R(V(18))); outB.hb = ortho(R(V(21)), R(V(24)));
    outB.ua[0] = nrm(R(V(27))); outB.ua[1] = nrm(R(V(30))); outB.fa[0] = nrm(R(V(33))); outB.fa[1] = nrm(R(V(36)));
    return outB;
  };
  return M;
})();
