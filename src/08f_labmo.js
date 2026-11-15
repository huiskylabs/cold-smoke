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
  // Near the deepest point the lab body keeps sinking while its lean hardly grows, so on a lean grid the last step holds a 6-12 cm drop of the
  // hips: crossing it the legs would fold at once. Each turn is therefore smoothed along its own path (way in, through the deepest, way out:
  // one line of 2G-1 postures) with a small Gaussian, done once here; the crossings at either end stay where they are.
  const smoothTurn = (T, sg) => { if (!T || T.sm) return; const P = [...T.rise, ...T.fall.slice(0, G - 1).reverse()], n = P.length, R = Math.ceil(sg * 2.5), o = [];
    for (let i = 0; i < n; i++) { const acc = new Array(P[0].length).fill(0); let ws = 0;
      for (let j = -R; j <= R; j++) { const k = Math.min(n - 1, Math.max(0, i + j)), w = Math.exp(-j * j / (2 * sg * sg)); ws += w; for (let c = 0; c < acc.length; c++) acc[c] += w * P[k][c]; }
      o.push(acc.map(v => v / ws)); }
    o[0] = P[0]; o[n - 1] = P[n - 1];
    T.rise = o.slice(0, G); T.fall = o.slice(G - 1).reverse(); T.sm = 1; };
  for (const c of CL) smoothTurn(D.clips[c], 1.6);
  if (D.clips.sbturn) { smoothTurn(D.clips.sbturn.toe, 1.6); smoothTurn(D.clips.sbturn.heel, 1.6); }
  const on = () => typeof Variants === 'undefined' || Variants.val.labmo === 'b';
  if (typeof Variants !== 'undefined') Variants.def('labmo', '人物动作', [['a', '原来'], ['b', '实验室']], 'b');
  // the lab body's legs (hip to ankle 0.82 m) to the game skier's (0.86 m, in boots)
  const M = { LEG: 1.05 };
  const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dt3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  // a frame from an X and a Y that are nearly square: Y kept, X squared to it, Z = X x Y (the game's frames are right-handed with Z backward)
  const ortho = (X, Y) => { Y = nrm(Y); const x = nrm([X[0] - Y[0] * dt3(X, Y), X[1] - Y[1] * dt3(X, Y), X[2] - Y[2] * dt3(X, Y)]); return { X: x, Y, Z: crs(x, Y) }; };
  M.mixB = (a, b, w) => w >= 1 ? b : ortho(v3.lerp(a.X, b.X, w), v3.lerp(a.Y, b.Y, w));
  // one grid row by the lean's share v (0..1), on a smooth curve through the grid points (Catmull-Rom), so the pose has no kinks at the grid lines
  const row = (tab, v) => { const x = Math.min(1, Math.max(0, v)) * (G - 1), i = Math.min(G - 2, Math.floor(x)), u = x - i;
    const p0 = tab[Math.max(0, i - 1)], p1 = tab[i], p2 = tab[i + 1], p3 = tab[Math.min(G - 1, i + 2)], u2 = u * u, u3 = u2 * u;
    return p1.map((q, k) => 0.5 * (2 * q + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * q + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * q - 3 * p2[k] + p3[k]) * u3)); };
  // ---- where in the turn. The pose is a smooth function of two smooth numbers, so it can only move as smoothly as the game's own lean:
  //   v  how far over, |lean| as a share of how deep the recent turns went (eased, and soft at zero, so crossing over has no corner);
  //   u  going in or coming out: -1 while the lean grows, +1 while it shrinks, read off how fast the lean changes and eased (never switched).
  // The pose is the middle of the lab's way in and way out at that lean, plus u times half their difference. A right turn's start is a left turn's
  // end, so the same u carries straight on through the crossing and the two sides meet exactly at zero lean.
  // (2026-11-15: two earlier versions picked "going in" or "coming out" by the sign of the lean's change, then by a phase angle; both jumped
  // between postures that are far apart at the same lean, and every jump snapped the legs: the owner's "卡蹦".)
  const PH = () => ({ w: 0, cref: 0.21, dl: 0, u: 0, prev: null, ref: 0.6, sv: null, svv: 0, su: 0, suv: 0 });
  const st = PH(), sb = PH();
  function phase(S, p, dt, peak) {
    const lean = p.lean || 0, cr = p.crouch == null ? 0.21 : p.crouch;
    if (dt > 0 && S.prev != null) {
      const r = (lean - S.prev) / dt; S.dl += (r - S.dl) * (1 - Math.exp(-dt / 0.08));
      // u: the lean's rate against a brisk turn's (about 1.5 rad/s), saturating softly, then eased over ~0.15 s
      const uT = Math.tanh(-S.dl / 1.5 * 1.6); S.u += (uT - S.u) * (1 - Math.exp(-dt / 0.15));
      // how deep the turns go: follows a deeper lean at once-ish, forgets slowly
      const a = Math.abs(lean); S.ref += (a - S.ref) * (1 - Math.exp(-dt / (a > S.ref ? 0.3 : 3)));
      S.cref += (cr - S.cref) * (1 - Math.exp(-dt / 1.5));
    } else { S.dl = 0; S.u = 0; S.ref = Math.max(0.6 * peak, Math.abs(lean)); S.cref = cr; }
    S.prev = lean;
    const ref = Math.max(S.ref, 0.45 * peak), sa = Math.abs(lean);
    // the signed share (which side and how far) and u are then eased critically (no overshoot, ~0.1 s), so even when the game's lean swings over
    // in a few frames the legs take a quarter of a second or more to change, as real skiers' do (edge change about 0.4 s, knees bent throughout)
    const sv = (lean >= 0 ? 1 : -1) * Math.min(1, sa / ref);
    if (dt > 0 && S.sv != null) { const wn = 16, h = Math.min(dt, 0.05);
      S.svv += (wn * wn * (sv - S.sv) - 2 * wn * S.svv) * h; S.sv += S.svv * h;
      S.suv += (wn * wn * (S.u - S.su) - 2 * wn * S.suv) * h; S.su += S.suv * h; }
    else { S.sv = sv; S.svv = 0; S.su = S.u; S.suv = 0; }
    const e2 = 0.25; return { v: Math.min(1, (Math.sqrt(S.sv * S.sv + e2 * e2) - e2) / (Math.sqrt(1 + e2 * e2) - e2)), side: S.sv >= 0 ? 1 : -1, u: S.su, lean };
  }
  // a turn table at share v, going in / coming out by u
  const at = (T, v, u) => { const a = row(T.rise, v), b = row(T.fall, v); return a.map((q, k) => (q + b[k]) * 0.5 + (b[k] - q) * 0.5 * u); };
  const mirRow = r => { const V = i => [r[i], r[i + 1], r[i + 2]], mx = q => [-q[0], q[1], q[2]], mX = q => [q[0], -q[1], -q[2]];
    return [...mx(V(0)), ...mX(V(3)), ...mx(V(6)), ...mX(V(9)), ...mx(V(12)), ...mX(V(15)), ...mx(V(18)), ...mX(V(21)), ...mx(V(24)), ...mx(V(30)), ...mx(V(27)), ...mx(V(36)), ...mx(V(33))]; };
  const mix = (a, b, t) => a.map((q, k) => q + (b[k] - q) * t);
  const weight = (S, p, dt, extra) => {
    const idle = p.idleRest || 0, grab = Math.max(p.grabL || 0, p.grabR || 0);
    const wT = on() ? (1 - Math.min(1, (p.air || 0) * 2.5)) * (1 - Math.min(1, (p.tuck || 0) * 1.6)) * (1 - Math.min(1, grab * 2)) * extra * (1 - idle) : 0;
    S.w = dt > 0 ? S.w + (wT - S.w) * (1 - Math.exp(-dt * 6)) : wT; return S.w;
  };
  const out = { w: 0, cref: 0.21, pel: [0, 0, 0], pb: null, t1: null, t2: null, hb: null, ua: [null, null], fa: [null, null] };
  function fill(o, S, r, cr, axis) {
    const V = i => [r[i], r[i + 1], r[i + 2]], cs = Math.cos(cr), sn = Math.sin(cr);
    const R = axis === 'z' ? q => [q[0] * cs + q[1] * sn, -q[0] * sn + q[1] * cs, q[2]] : q => [q[0], q[1] * cs + q[2] * sn, -q[1] * sn + q[2] * cs];
    o.w = S.w; o.cref = S.cref; o.pel = R(V(0));
    o.pb = ortho(R(V(3)), R(V(6))); o.t1 = ortho(R(V(9)), R(V(12))); o.t2 = ortho(R(V(15)), R(V(18))); o.hb = ortho(R(V(21)), R(V(24)));
    o.ua[0] = nrm(R(V(27))); o.ua[1] = nrm(R(V(30))); o.fa[0] = nrm(R(V(33))); o.fa[1] = nrm(R(V(36)));
    return o;
  }
  M.step = function (p, sec, dt, speed) {
    p.idleRest = sec.idle ? sec.idle.rest || 0 : 0;
    const ph = phase(st, p, dt, D.clips.carve.peak); weight(st, p, dt, p.dp > 0 ? 0 : 1);
    if (st.w < 1e-3) return null;
    // which turns, by speed (m/s)
    const sm = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
    const wS = 1 - sm(5, 9, speed), wG = sm(14, 20, speed), cw = [wS, Math.max(0, 1 - wS - wG), wG];
    const r = new Array(39).fill(0);
    for (let c = 0; c < 3; c++) { if (cw[c] <= 0) continue;
      const x = at(D.clips[CL[c]], ph.v, ph.u * ph.side), y = ph.side > 0 ? x : mirRow(x);
      for (let i = 0; i < 39; i++) r[i] += cw[c] * y[i]; }
    // the rest of the lean: the whole figure rolled about the skis (the game's pelvis stands out by H sin(lean) + 0.07 sin(lean): about 1.07 lean)
    out.clip = cw; out.v = ph.v; out.u = ph.u;
    return fill(out, st, r, ph.lean * 1.07 - Math.atan2(r[0], r[1]), 'z');
  };
  // ---- on a snowboard (Variants 'ride' b, 08a_board.js): the lab's board turn. Toe and heel turns are not mirror images, so each has its own
  // table (the end of a toe turn is the start of a heel turn); everything is in the board solver's rider space (x toward the tail, y up, z toward
  // the heel edge: the rider faces -z), and the figure is rolled about the board's length to the game's lean (+ = over the toes)
  const outB = { w: 0, cref: 0.21, pel: [0, 0, 0], pb: null, t1: null, t2: null, hb: null, ua: [null, null], fa: [null, null] };
  M.stepB = function (p, sec, dt) {
    const T = D.clips.sbturn; if (!T) return null;
    p.idleRest = sec.idle ? sec.idle.rest || 0 : 0;
    const ph = phase(sb, p, dt, T.toe.peak); weight(sb, p, dt, 1);
    if (sb.w < 1e-3) return null;
    // (toe side: the toe table; heel side: the heel table, whose way in is the toe turn's way out, so u's sign turns with the side)
    let r = at(ph.side > 0 ? T.toe : T.heel, ph.v, ph.u * ph.side);
    r = r.slice(); r[0] *= 0.5;      // (the lab's rider moves the hips 27 cm along the board through a turn, 12-16 cm toward the tail between turns: half of it here)
    return fill(outB, sb, r, ph.lean - Math.atan2(-r[2], r[1]), 'x');
  };
  return M;
})();
