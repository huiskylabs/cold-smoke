// ---------------------------------------------------------------- Human: measuring the body like a tape measure, and fitting it to ANSUR
// A girth is the perimeter of the convex hull of a slice (a tape bridges hollows; research/03). The body is measured in the canonical T-pose, at the
// ANSUR landmark heights, and its base radii are scaled per level until each girth is the one ANSUR predicts.
(() => {
  const V = Human.v3, Q = Human.q, B = Human.Body;
  // slice through centre C in the plane (e1, e2): the hull perimeter, and the points
  function slice(c, C, e1, e2, mask, n = 96) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * 2 * Math.PI, dx = Math.cos(a), dy = Math.sin(a);
      const at = r => B.dist(c, C[0] + (e1[0] * dx + e2[0] * dy) * r, C[1] + (e1[1] * dx + e2[1] * dy) * r, C[2] + (e1[2] * dx + e2[2] * dy) * r, mask);
      let r0 = 0, r1 = 0.004, guard = 0;
      // walk out to the last surface crossing (from outside in, so hollows are skipped as a tape would)
      r1 = 0.45; if (at(r1) < 0) continue;
      let r = r1; while (r > 0 && at(r) > 0 && guard++ < 400) r -= Math.max(0.002, at(r) * 0.9);
      if (r <= 0) continue;
      r0 = r; r1 = r + 0.004; for (let k = 0; k < 20; k++) { const m = (r0 + r1) / 2; if (at(m) < 0) r0 = m; else r1 = m; }
      pts.push([dx * r0, dy * r0]);
    }
    if (pts.length < 3) return { girth: 0, pts };
    // convex hull (monotone chain)
    const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    const H = lo.slice(0, -1).concat(hi.slice(0, -1));
    let g = 0; for (let i = 0; i < H.length; i++) { const a = H[i], b = H[(i + 1) % H.length]; g += Math.hypot(b[0] - a[0], b[1] - a[1]); }
    return { girth: g, pts, hull: H };
  }
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
  const G = { trunk: 1, neck: 2, armL: 4, legL: 16, legs: 48 };
  // the girths of a body (mm), measured the ANSUR way
  function girths(body) {
    const sk = body.sk, M = body.M, S = M.S / 1000, J = n => sk.bones[sk.idx[n]].J;
    const c = B.prepare(body, Human.Skeleton.fk(sk, sk.bones.map(() => Q.id())));
    const hz = (y, mask, cx = 0, cz = -0.01) => slice(c, [cx, y, cz], X, Z, mask).girth * 1000;
    // a limb's centre at a height (the leg's line from hip to ankle)
    const legX = y => { const h = J('thigh_L'), k = J('shin_L'), a = J('talus_L'); const p = y > k[1] ? V.lerp(k, h, (y - k[1]) / (h[1] - k[1])) : V.lerp(a, k, (y - a[1]) / (k[1] - a[1])); return p; };
    const legAt = y => { const p = legX(y); return slice(c, [p[0], y, p[2]], X, Z, G.legL).girth * 1000; };
    const armAt = x => slice(c, [x, J('upperarm_L')[1], J('upperarm_L')[2]], Y, Z, G.armL).girth * 1000;
    const gh = J('upperarm_L')[0], el = J('forearm_L')[0], wr = J('hand_L')[0];
    const maxOf = (f, a, b, n = 8) => { let m = 0; for (let i = 0; i <= n; i++) m = Math.max(m, f(a + (b - a) * i / n)); return m; };
    const minOf = (f, a, b, n = 8) => { let m = 1e9; for (let i = 0; i <= n; i++) m = Math.min(m, f(a + (b - a) * i / n)); return m; };
    return {
      chest: hz(M.L.nipple / 1000, G.trunk), waist: hz(M.L.navel / 1000, G.trunk), buttock: hz(0.505 * S, G.trunk | G.legs, 0, -0.03),
      thigh: legAt(M.L.crotch / 1000 - 0.012 * S), lowthigh: legAt(0.31 * S), calf: maxOf(legAt, 0.17 * S, 0.25 * S), ankle: minOf(legAt, 0.05 * S, 0.1 * S),
      arm: armAt(gh + 0.5 * (el - gh)), forearm: maxOf(armAt, el + 0.05 * (wr - el), el + 0.35 * (wr - el), 6), wrist: armAt(wr - 0.012),
      neck: hz(0.86 * S, G.neck, 0, -0.03),
    };
  }
  // scale the base radii until the girths are ANSUR's (a few rounds; each girth moves almost in proportion to its level's radii)
  function calibrate(sk, rounds = 4) {
    let F = null, body = B.build(sk), log = [];
    for (let r = 0; r < rounds; r++) {
      const g = girths(body), T = sk.M.G; F = Object.assign({}, body.F);
      const err = {};
      for (const k in g) if (T[k] && g[k] > 0) { F[k] *= Math.pow(T[k] / g[k], 1.1); err[k] = g[k] - T[k]; }
      log.push(err);
      body = B.build(sk, F);
    }
    body.calib = log; body.girths = girths(body);
    return body;
  }
  Human.Measure = { slice, girths, calibrate };
})();
