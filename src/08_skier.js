// ---------------------------------------------------------------- the skier: SDF-modelled body, joint-driven skinning, procedural pose
// Model space: origin on the snow between the skis, +y = snow normal, -z = where the skis point, +x = the skier's right.
const Skier = (() => {
  const K = { ready: false, NB: 18 };
  const B = { pelvis: 0, spine: 1, chest: 2, head: 3, uarmL: 4, farmL: 5, handL: 6, uarmR: 7, farmR: 8, handR: 9, thighL: 10, shinL: 11, footL: 12, thighR: 13, shinR: 14, footR: 15, poleL: 16, poleR: 17 };
  const LEN = { thigh: 0.43, shin: 0.43, uarm: 0.29, farm: 0.27, hipW: 0.10, shW: 0.176, ankle: 0.16, pole: 1.14 };
  let gfx, vb, vb2, ib, count = 0, pipe, pipeShadow, boneTex;
  const boneData = new Float32Array(4 * 32 * 4);
  let bind = null, invBind = [];

  // yaw (turning the facing direction toward +x), pitch (tipping forward, toward -z), roll (tipping toward +x)
  function basis(yaw, pitch, roll) {
    const cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll), cy = Math.cos(yaw), sy = Math.sin(yaw);
    const f = v => { // pitch, then roll, then yaw
      let x = v[0], y = v[1] * cp + v[2] * sp, z = -v[1] * sp + v[2] * cp;
      const x2 = x * cr + y * sr, y2 = -x * sr + y * cr;
      return [x2 * cy - z * sy, y2, x2 * sy + z * cy];
    };
    return { X: f([1, 0, 0]), Y: f([0, 1, 0]), Z: f([0, 0, 1]) };
  }
  function ik2(a, c, l1, l2, pole) {
    const d = v3.sub(c, a), L = v3.len(d) || 1e-6, Lc = clamp(L, Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4), dn = v3.mul(d, 1 / L);
    const x = (l1 * l1 - l2 * l2 + Lc * Lc) / (2 * Lc), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
    const p = v3.norm(v3.sub(pole, v3.mul(dn, v3.dot(pole, dn))));
    return v3.add(v3.mad(a, dn, x), v3.mul(p, h));
  }
  // frame with Y along ydir and X as close as possible to xhint
  function frameXY(o, ydir, xhint) {
    const y = v3.norm(ydir); let x = v3.sub(xhint, v3.mul(y, v3.dot(xhint, y))); if (v3.len(x) < 1e-5) x = v3.cross(y, [0, 0, 1]); x = v3.norm(x);
    return m4.fromBasis(x, y, v3.cross(x, y), o);
  }

  // ---- pose: a handful of physical quantities in, joint positions and bone frames out
  const P0 = { lean: 0, edge: 0, crouch: 0.14, tuck: 0, air: 0, sep: 0, headYaw: 0, lead: 0, stance: 0.31, fore: 0, armL: [0, 0, 0], armR: [0, 0, 0], swing: 0, liftL: 0, liftR: 0, pitchL: 0, pitchR: 0, plantL: 0, plantR: 0 };
  function solve(p) {
    const lean = p.lean, sl = Math.sin(lean), al = Math.abs(sl), edge = p.edge, crouch = p.crouch, tuck = p.tuck, air = p.air;
    const stance = p.stance, lead = p.lead;
    const J = {}, F = new Array(K.NB);
    // feet (ski frames): rolled onto their edges; the inside ski leads
    const fb = basis(0, 0, edge), lift = 0.05 * Math.abs(Math.sin(edge));
    const fbL = p.pitchL ? basis(0, -p.pitchL, edge) : fb, fbR = p.pitchR ? basis(0, -p.pitchR, edge) : fb;
    J.footL = [-stance / 2, lift + p.liftL, lead]; J.footR = [stance / 2, lift + p.liftR, -lead];
    J.ankleL = v3.mad(J.footL, fbL.Y, LEN.ankle); J.ankleR = v3.mad(J.footR, fbR.Y, LEN.ankle);
    // pelvis: the body line from the snow contact tilts by the lean; hips move inside the turn (angulation)
    let H = lerp(0.98, 0.60, crouch) - tuck * 0.08;
    const pb = basis(p.sep * 0.35, 0.22 + 0.22 * crouch + 0.25 * tuck, lean * 0.8);
    let pel, hipL, hipR;
    for (let it = 0; it < 4; it++) {
      pel = [H * Math.sin(lean) + 0.07 * sl, H * Math.cos(lean) + (p.liftL + p.liftR) * 0.5, 0.10 - p.fore * 0.06 + 0.05 * tuck];
      hipL = v3.add(v3.mad(pel, pb.X, -LEN.hipW), v3.mul(pb.Y, -0.045)); hipR = v3.add(v3.mad(pel, pb.X, LEN.hipW), v3.mul(pb.Y, -0.045));
      const over = Math.max(v3.len(v3.sub(hipL, J.ankleL)), v3.len(v3.sub(hipR, J.ankleR))) - (LEN.thigh + LEN.shin) * 0.985;
      if (over <= 0) break; H -= over * 1.15;
    }
    J.pelvis = pel; J.hipL = hipL; J.hipR = hipR;
    // torso: hinged forward at the hips, more upright sideways than the legs, rotated toward the fall line (separation)
    // (a turn begins with the whole body tipping in; only as it tightens do the hips drop inside while the shoulders stay nearer level)
    const hinge = 0.42 + 0.42 * crouch + 0.62 * tuck - 0.16 * air, leanT = lean * lerp(0.78, 0.42, smooth(0.25, 0.72, Math.abs(lean)));
    const t1 = basis(p.sep * 0.7, hinge, leanT), t2 = basis(p.sep, hinge * 1.18 + 0.05, leanT * 0.85);
    J.chest = v3.mad(pel, t1.Y, 0.25); J.neck = v3.mad(J.chest, t2.Y, 0.24);
    J.shL = v3.add(v3.mad(J.neck, t2.X, -LEN.shW), v3.mul(t2.Y, -0.045)); J.shR = v3.add(v3.mad(J.neck, t2.X, LEN.shW), v3.mul(t2.Y, -0.045));
    // head: eyes stay near level and look where the skier is going
    const hb = basis(p.sep + p.headYaw, 0.06 + 0.10 * crouch + 0.02 * tuck, lean * 0.10);
    J.head = v3.add(v3.mad(J.neck, hb.Y, 0.125), v3.mul(hb.Z, -0.02));
    // hands: forward and wide in the stance; inside hand reaches for the snow in a turn; tucked in front of the chin at speed; wide in the air
    // (they are carried in front of the body at the height of the navel, elbows bent: they do not sink toward the knees as the chest tips forward)
    const hf = basis(p.sep, hinge * 0.4, leanT * 0.85);
    const hand = (side) => {  // side: -1 left, +1 right
      const inside = sat(side * sl * 1.6), outside = sat(-side * sl * 1.6);
      let hx = side * (0.30 + 0.04 * crouch), hy = -0.02, hz = -0.36;
      let t = v3.add(v3.add(v3.mad(J.chest, hf.X, hx), v3.mul(hf.Y, hy)), v3.mul(hf.Z, hz));
      t = v3.add(t, [side * 0.05 * inside - side * 0.02 * outside, -0.05 * inside * al + 0.05 * outside, -0.05 * outside - 0.04 * inside]);
      if (tuck > 0) { const tk = v3.add(v3.add(v3.mad(J.chest, t2.X, side * 0.075), v3.mul(t2.Y, 0.215)), v3.mul(t2.Z, -0.30)); t = v3.lerp(t, tk, tuck); }
      if (air > 0) { const ta = v3.add(v3.add(v3.mad(J.chest, t2.X, side * 0.56), v3.mul(t2.Y, 0.10)), v3.mul(t2.Z, -0.20)); t = v3.lerp(t, ta, air * 0.8); }
      t = v3.add(t, side < 0 ? p.armL : p.armR);
      t[1] = Math.max(t[1], 0.10);
      const sh = side < 0 ? J.shL : J.shR, d = v3.sub(t, sh), l = v3.len(d), mx = (LEN.uarm + LEN.farm) * 0.97;
      if (l > mx) t = v3.mad(sh, d, mx / l);
      const pole = v3.lerp([side * 0.7, -0.55, 0.45], [side * 0.25, -1, 0.1], tuck);
      return { w: t, e: ik2(sh, t, LEN.uarm, LEN.farm, pole) };
    };
    const hL = hand(-1), hR = hand(1); J.wristL = hL.w; J.elbowL = hL.e; J.wristR = hR.w; J.elbowR = hR.e;
    // legs: knees drive forward and into the turn
    const kp = [sl * 0.55, 0.12, -1];
    J.kneeL = ik2(hipL, J.ankleL, LEN.thigh, LEN.shin, kp); J.kneeR = ik2(hipR, J.ankleR, LEN.thigh, LEN.shin, kp);
    // poles trail behind with the baskets just off the snow; tucked under the arms at speed
    const pole = (side, wrist, plant) => {
      const PL = LEN.pole - 0.08;
      let d = v3.norm(v3.lerp(v3.lerp([side * 0.16, -0.72, 0.68], [side * 0.34, -0.22, 0.92], air), [side * 0.04, 0.16, 1.0], tuck));
      d[1] += 0.10 * Math.sin(p.swing * side);
      d = v3.norm(d);
      // the plant: swung forward until the basket meets the snow beside the ski tip
      if (plant > 0.001) {
        const dy = Math.max(wrist[1] - 0.02, 0.2), dz = Math.sqrt(Math.max(PL * PL - dy * dy - 0.0064, 0.04)), a = plant * plant * (3 - 2 * plant);
        d = v3.norm(v3.lerp(d, v3.norm([side * 0.08, -dy, -dz]), a));
      }
      const tip = v3.mad(wrist, d, PL); if (tip[1] < 0.035) { d[1] += (0.035 - tip[1]) / PL; d = v3.norm(d); }
      return d;
    };
    J.poleDL = pole(-1, J.wristL, p.plantL || 0); J.poleDR = pole(1, J.wristR, p.plantR || 0);
    // ---- frames
    F[B.pelvis] = m4.fromBasis(pb.X, pb.Y, pb.Z, pel);
    F[B.spine] = frameXY(pel, v3.sub(J.chest, pel), v3.add(pb.X, t1.X));
    F[B.chest] = frameXY(J.chest, v3.sub(J.neck, J.chest), t2.X);
    F[B.head] = m4.fromBasis(hb.X, hb.Y, hb.Z, J.neck);
    const limb = (i0, a, b, c, xh) => { const ax = v3.cross(v3.sub(b, a), v3.sub(c, b)); const hx = v3.len(ax) > 1e-4 ? v3.norm(ax) : xh; F[i0] = frameXY(a, v3.sub(b, a), hx); F[i0 + 1] = frameXY(b, v3.sub(c, b), hx); return hx; };
    const axL = limb(B.uarmL, J.shL, J.elbowL, J.wristL, [1, 0, 0]); F[B.handL] = frameXY(J.wristL, v3.sub(J.wristL, J.elbowL), axL);
    const axR = limb(B.uarmR, J.shR, J.elbowR, J.wristR, [1, 0, 0]); F[B.handR] = frameXY(J.wristR, v3.sub(J.wristR, J.elbowR), axR);
    limb(B.thighL, hipL, J.kneeL, J.ankleL, [1, 0, 0]); limb(B.thighR, hipR, J.kneeR, J.ankleR, [1, 0, 0]);
    F[B.footL] = m4.fromBasis(fbL.X, fbL.Y, fbL.Z, J.footL); F[B.footR] = m4.fromBasis(fbR.X, fbR.Y, fbR.Z, J.footR);
    F[B.poleL] = frameXY(J.wristL, v3.mul(J.poleDL, -1), [1, 0, 0]); F[B.poleR] = frameXY(J.wristR, v3.mul(J.poleDR, -1), [1, 0, 0]);
    return { J, F, hb, t2, pb };
  }
  K.solve = solve; K.P0 = P0; K.B = B; K.fixMesh = m => fixMesh(m);

  // ---- body: distance field built on the bind-pose joints
  function buildBody(bd) {
    const J = bd.J, c = sd.capsule, cap = (x, y, z, a, b, ra, rb) => c(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], ra, rb);
    const loc = (x, y, z, o, b) => { const dx = x - o[0], dy = y - o[1], dz = z - o[2]; return [dx * b.X[0] + dy * b.X[1] + dz * b.X[2], dx * b.Y[0] + dy * b.Y[1] + dz * b.Y[2], dx * b.Z[0] + dy * b.Z[1] + dz * b.Z[2]]; };
    const up = bd.t2.Y, pelLo = v3.mad(J.pelvis, bd.pb.Y, -0.09), pelHi = v3.mad(J.pelvis, bd.pb.Y, 0.02), neckLo = v3.mad(J.neck, up, -0.05);
    const cuffL = v3.lerp(J.ankleL, J.kneeL, 0.2), cuffR = v3.lerp(J.ankleR, J.kneeR, 0.2);
    const fdL = v3.norm(v3.sub(J.wristL, J.elbowL)), fdR = v3.norm(v3.sub(J.wristR, J.elbowR));
    const hndL = v3.mad(J.wristL, fdL, 0.055), hndR = v3.mad(J.wristR, fdR, 0.055), wrL = v3.mad(J.wristL, fdL, -0.05), wrR = v3.mad(J.wristR, fdR, -0.05);
    const shinDL = v3.norm(v3.sub(J.kneeL, J.ankleL)), shinDR = v3.norm(v3.sub(J.kneeR, J.ankleR));
    const btL = v3.mad(J.ankleL, shinDL, 0.17), btR = v3.mad(J.ankleR, shinDR, 0.17);
    const hoodC = v3.add(v3.mad(J.neck, bd.t2.Z, 0.095), v3.mul(up, -0.055));
    const g = { jacket: 0, armSide: 0, pants: 0, glove: 0, boot: 0, helmet: 0, gog: 0, buff: 0, pack: 0, q: null };
    function parts(x, y, z) {
      // jacket
      let a = cap(x, y, z, pelLo, J.chest, 0.148, 0.164); a = sd.smin(a, cap(x, y, z, J.chest, neckLo, 0.166, 0.124), 0.06);
      a = sd.smin(a, cap(x, y, z, J.shL, J.shR, 0.080, 0.080), 0.05);
      const pl = loc(x, y, z, J.pelvis, bd.pb), t = loc(x, y, z, J.chest, bd.t2);
      a = sd.smin(a, cap(x, y, z, J.hipL, J.hipR, 0.118, 0.118), 0.05);                    // the shell hangs over the hips
      a = sd.smax(a, -(pl[1] + 0.085 + 0.04 * sat(pl[2] / 0.14)), 0.016);                 // hem: at the hip, a little longer at the back
      const torso = a;
      a = sd.smin(a, cap(x, y, z, neckLo, J.neck, 0.082, 0.070), 0.03);                 // collar
      { const q = loc(x, y, z, hoodC, bd.t2); a = sd.smin(a, sd.ellipsoid(q[0], q[1], q[2], 0, 0, 0, 0.115, 0.075, 0.058), 0.03); }   // folded hood
      const arms = Math.min(cap(x, y, z, J.shL, J.elbowL, 0.072, 0.064), cap(x, y, z, J.shR, J.elbowR, 0.072, 0.064), cap(x, y, z, J.elbowL, wrL, 0.066, 0.054), cap(x, y, z, J.elbowR, wrR, 0.066, 0.054));
      a = sd.smin(a, arms, 0.035);
      g.jacket = a; g.armSide = arms - torso;
      // pants
      let b = sd.ellipsoid(x, y, z, J.pelvis[0], J.pelvis[1] - 0.045, J.pelvis[2] + 0.012, 0.150, 0.120, 0.128);
      b = sd.smin(b, Math.min(cap(x, y, z, J.hipL, J.kneeL, 0.108, 0.092), cap(x, y, z, J.hipR, J.kneeR, 0.108, 0.092)), 0.05);
      b = sd.smin(b, Math.min(cap(x, y, z, J.kneeL, cuffL, 0.090, 0.086), cap(x, y, z, J.kneeR, cuffR, 0.090, 0.086)), 0.04);
      g.pants = b;
      // gloves
      g.glove = Math.min(sd.smin(sd.sphere(x, y, z, hndL[0], hndL[1], hndL[2], 0.050), cap(x, y, z, wrL, J.wristL, 0.052, 0.050), 0.02), sd.smin(sd.sphere(x, y, z, hndR[0], hndR[1], hndR[2], 0.050), cap(x, y, z, wrR, J.wristR, 0.052, 0.050), 0.02));
      // boots + binding plate
      const boot = (an, bt) => sd.smin(sd.smin(cap(x, y, z, an, bt, 0.060, 0.064), sd.rbox(x, y, z, an[0], 0.088, an[2] - 0.035, 0.052, 0.046, 0.150, 0.03), 0.03), sd.rbox(x, y, z, an[0], 0.033, an[2] - 0.03, 0.040, 0.014, 0.20, 0.008), 0.012);
      g.boot = Math.min(boot(J.ankleL, btL), boot(J.ankleR, btR));
      // head
      const q = loc(x, y, z, J.head, bd.hb); g.q = q;
      g.helmet = sd.ellipsoid(q[0], q[1], q[2], 0, 0.006, 0.008, 0.114, 0.119, 0.130);
      g.gog = sd.rbox(q[0], q[1], q[2], 0, 0.0, -0.104, 0.082, 0.038, 0.030, 0.026);
      g.buff = sd.smin(sd.sphere(q[0], q[1], q[2], 0, -0.070, -0.045, 0.072), cap(x, y, z, J.neck, v3.mad(J.head, bd.hb.Y, -0.05), 0.058, 0.060), 0.03);
      // backpack (rides on the chest bone); straps and hip belt are a thin shell on the jacket
      let pk = sd.smin(sd.rbox(t[0], t[1], t[2], 0, -0.060, 0.222, 0.135, 0.200, 0.082, 0.062), sd.ellipsoid(t[0], t[1], t[2], 0, 0.110, 0.215, 0.118, 0.085, 0.080), 0.035);
      pk = sd.smin(pk, sd.rbox(t[0], t[1], t[2], 0, -0.13, 0.300, 0.085, 0.085, 0.022, 0.02), 0.02);                                   // front pocket
      g.pack = pk;
      return g;
    }
    function f(x, y, z) {
      const p = parts(x, y, z);
      let d = sd.smin(p.jacket, p.pants, 0.022); d = sd.smin(d, p.glove, 0.012); d = sd.smin(d, p.boot, 0.014);
      d = sd.smin(d, sd.smin(sd.smin(p.helmet, p.gog, 0.012), p.buff, 0.02), 0.012); d = sd.smin(d, p.pack, 0.014);
      return d;
    }
    function attr(x, y, z, nx, ny, nz, out) {
      const p = parts(x, y, z); let id = 0, best = p.jacket;
      if (p.pants < best) { best = p.pants; id = 1; } if (p.glove < best) { best = p.glove; id = 2; } if (p.boot < best) { best = p.boot; id = 3; }
      if (p.buff < best) { best = p.buff; id = 7; } if (p.pack < best) { best = p.pack; id = 8; }
      if (p.helmet < best) { best = p.helmet; id = 4; }
      if (p.gog - 0.002 < best) { best = p.gog; id = 5; }
      out[2] = 0; out[3] = 0;
      if (id <= 1) { out[2] = clamp(p.pants - p.jacket, -0.05, 0.05); out[3] = clamp(p.armSide, -0.05, 0.05); }   // > 0: jacket side / torso side (decided per pixel)
      else if (id >= 4 && id <= 7) { out[2] = p.q[1]; out[3] = p.q[2]; }                  // head-local y, z for the strap / lens / stripe
      // ambient occlusion from the field itself
      const ao = sat(0.25 + 0.75 * (0.6 * sat(f(x + nx * 0.05, y + ny * 0.05, z + nz * 0.05) / 0.05) + 0.4 * sat(f(x + nx * 0.14, y + ny * 0.14, z + nz * 0.14) / 0.14)));
      out[0] = id; out[1] = ao;
    }
    return { f, attr };
  }

  // skinning weights: soft blend between the two nearest bone capsules, restricted by garment
  function boneWeights(mesh, bd) {
    const J = bd.J, n = mesh.nv, out = new Float32Array(n * 4), c = sd.capsule;
    const seg = (i, a, b, r) => ({ i, a, b, r });
    const S = {
      pelvis: seg(B.pelvis, J.hipL, J.hipR, 0.14), spine: seg(B.spine, J.pelvis, J.chest, 0.155), chest: seg(B.chest, J.chest, J.neck, 0.16), shoulders: seg(B.chest, J.shL, J.shR, 0.085),
      uarmL: seg(B.uarmL, J.shL, J.elbowL, 0.062), farmL: seg(B.farmL, J.elbowL, J.wristL, 0.05), uarmR: seg(B.uarmR, J.shR, J.elbowR, 0.062), farmR: seg(B.farmR, J.elbowR, J.wristR, 0.05),
      thighL: seg(B.thighL, J.hipL, J.kneeL, 0.09), shinL: seg(B.shinL, J.kneeL, J.ankleL, 0.076), thighR: seg(B.thighR, J.hipR, J.kneeR, 0.09), shinR: seg(B.shinR, J.kneeR, J.ankleR, 0.076),
    };
    const sets = { 0: [S.pelvis, S.spine, S.chest, S.shoulders, S.uarmL, S.farmL, S.uarmR, S.farmR], 1: [S.pelvis, S.thighL, S.shinL, S.thighR, S.shinR] };
    for (let v = 0; v < n; v++) {
      const x = mesh.verts[v * 10], y = mesh.verts[v * 10 + 1], z = mesh.verts[v * 10 + 2], id = Math.round(mesh.verts[v * 10 + 6]);
      let b0 = 0, b1 = 0, w = 1;
      if (id === 2) b0 = b1 = x < 0 ? B.handL : B.handR;
      else if (id === 3) b0 = b1 = x < 0 ? B.footL : B.footR;
      else if (id >= 4 && id <= 5) b0 = b1 = B.head;
      else if (id === 7) { b0 = B.head; b1 = B.chest; w = smooth(J.neck[1] - 0.03, J.neck[1] + 0.06, y); }
      else if (id === 8) b0 = b1 = B.chest;
      else {
        let d0 = 1e9, d1 = 1e9; b0 = b1 = -1;
        for (const s of sets[id]) {
          const d = c(x, y, z, s.a[0], s.a[1], s.a[2], s.b[0], s.b[1], s.b[2], s.r, s.r);
          if (s.i === b0) { if (d < d0) d0 = d; continue; } if (s.i === b1) { if (d < d1) { d1 = d; if (d1 < d0) { const t = d0; d0 = d1; d1 = t; const tb = b0; b0 = b1; b1 = tb; } } continue; }
          if (d < d0) { d1 = d0; b1 = b0; d0 = d; b0 = s.i; } else if (d < d1) { d1 = d; b1 = s.i; }
        }
        if (b1 < 0) { b1 = b0; d1 = d0; }
        const e0 = 1, e1 = Math.exp(-(d1 - d0) / 0.032); w = e0 / (e0 + e1);
      }
      out[v * 4] = b0; out[v * 4 + 1] = b1; out[v * 4 + 2] = w;
    }
    return out;
  }

  // garment boundaries: every triangle gets one material (vertices on a boundary are duplicated), so ids never interpolate
  function splitMaterials(m, bw) {
    const V = Array.from(m.verts), W = Array.from(bw), I = m.idx, dup = new Map();
    for (let t = 0; t < I.length; t += 3) {
      const a = Math.round(V[I[t] * 10 + 6]), b = Math.round(V[I[t + 1] * 10 + 6]), c = Math.round(V[I[t + 2] * 10 + 6]);
      if (a === b && b === c) continue;
      const id = (b === c) ? b : a;
      for (let k = 0; k < 3; k++) {
        const vi = I[t + k]; if (Math.round(V[vi * 10 + 6]) === id) continue;
        const key = vi * 16 + id; let nvI = dup.get(key);
        if (nvI === undefined) { nvI = V.length / 10; for (let q = 0; q < 10; q++) V.push(V[vi * 10 + q]); V[nvI * 10 + 6] = id; for (let q = 0; q < 4; q++) W.push(W[vi * 4 + q]); dup.set(key, nvI); }
        I[t + k] = nvI;
      }
    }
    return { verts: new Float32Array(V), bw: new Float32Array(W), nv: V.length / 10 };
  }

  // ---- hard parts: skis and poles (parametric; too thin for the distance grid)
  function fixMesh(m) {   // outward winding + smooth normals
    let vol = 0; const V = m.verts, I = m.idx;
    for (let t = 0; t < I.length; t += 3) { const a = I[t] * 10, b = I[t + 1] * 10, c = I[t + 2] * 10; vol += V[a] * (V[b + 1] * V[c + 2] - V[b + 2] * V[c + 1]) - V[a + 1] * (V[b] * V[c + 2] - V[b + 2] * V[c]) + V[a + 2] * (V[b] * V[c + 1] - V[b + 1] * V[c]); }
    if (vol < 0) for (let t = 0; t < I.length; t += 3) { const k = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = k; }
    for (let i = 0; i < m.nv; i++) V[i * 10 + 3] = V[i * 10 + 4] = V[i * 10 + 5] = 0;
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t] * 10, b = I[t + 1] * 10, c = I[t + 2] * 10, ux = V[b] - V[a], uy = V[b + 1] - V[a + 1], uz = V[b + 2] - V[a + 2], vx = V[c] - V[a], vy = V[c + 1] - V[a + 1], vz = V[c + 2] - V[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      for (const k of [a, b, c]) { V[k + 3] += nx; V[k + 4] += ny; V[k + 5] += nz; }
    }
    for (let i = 0; i < m.nv; i++) { const l = Math.hypot(V[i * 10 + 3], V[i * 10 + 4], V[i * 10 + 5]) || 1; V[i * 10 + 3] /= l; V[i * 10 + 4] /= l; V[i * 10 + 5] /= l; }
    return m;
  }
  function skiMesh(x0) {
    const mb = meshBuilder(), rings = [], N = 44, zT = 0.80, zF = -0.96;
    for (let i = 0; i <= N; i++) {
      const t = i / N, z = lerp(zT, zF, t);
      let w = lerp(0.049, 0.058, smooth(0.15, 0.78, z)); w = lerp(w, 0.064, smooth(-0.15, -0.78, z));
      if (z < -0.80) w *= Math.sqrt(Math.max(0.02, 1 - ((-z - 0.80) / 0.165) ** 2)); if (z > 0.76) w *= Math.sqrt(Math.max(0.05, 1 - ((z - 0.76) / 0.045) ** 2));
      const yb = 0.125 * Math.pow(smooth(-0.62, -0.96, z), 1.7) + 0.03 * Math.pow(smooth(0.66, 0.80, z), 2), th = lerp(0.008, 0.020, smooth(0.80, 0.25, Math.abs(z + 0.05)));
      const r = [[-w, yb], [w, yb], [w, yb + th * 0.55], [w * 0.82, yb + th], [-w * 0.82, yb + th], [-w, yb + th * 0.55]];
      // duplicate the corners so the base, sidewalls and topsheet keep separate normals
      const ring = []; for (let k = 0; k < r.length; k++) { ring.push([[x0 + r[k][0], r[k][1], z], [0, 1, 0]]); }
      rings.push(ring);
    }
    mb.sweep(rings, [9, 1, 0, 0], [0, 0, 1], [0, 0, -1]);
    return fixMesh(mb.done());
  }
  function poleMesh() {
    const mb = meshBuilder(), rings = [], prof = [[0.075, 0.004], [0.07, 0.015], [0.0, 0.017], [-0.10, 0.015], [-0.105, 0.0085], [-0.60, 0.0075], [-1.03, 0.006], [-1.04, 0.034], [-1.048, 0.034], [-1.056, 0.006], [-1.14, 0.003]];
    for (const [y, r] of prof) { const ring = []; for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; ring.push([[Math.cos(a) * r, y, Math.sin(a) * r], [0, 1, 0]]); } rings.push(ring); }
    mb.sweep(rings, [10, 1, 0, 0], [0, 1, 0], [0, -1, 0]);
    return fixMesh(mb.done());
  }

  K.build = function () {
    bind = solve(P0); invBind = bind.F.map(m => m4.invert(m)); K.bind = bind;
    const body = buildBody(bind);
    const t0 = performance.now();
    const m = meshSDF(body.f, [-0.50, -0.02, -0.72], [0.50, 1.74, 0.46], 0.0135, { stride: 4, attr: body.attr });
    K.meshMs = performance.now() - t0;
    const bw0 = boneWeights(m, bind);
    const sp = splitMaterials(m, bw0), bw = sp.bw; m.verts = sp.verts; m.nv = sp.nv;
    // skis and poles, rigid on their bones (built in bone-local space, then moved to the bind pose)
    const parts = [[skiMesh(0), B.footL], [skiMesh(0), B.footR], [poleMesh(), B.poleL], [poleMesh(), B.poleR]];
    let nv = m.nv, ni = m.ni; for (const [pm] of parts) { nv += pm.nv; ni += pm.ni; }
    const V = new Float32Array(nv * 10), W = new Float32Array(nv * 4), I = new Uint32Array(ni); V.set(m.verts); W.set(bw); I.set(m.idx);
    let vo = m.nv, io = m.ni;
    for (const [pm, bone] of parts) {
      const Fm = bind.F[bone];
      for (let i = 0; i < pm.nv; i++) {
        const p = m4.tp(Fm, [pm.verts[i * 10], pm.verts[i * 10 + 1], pm.verts[i * 10 + 2]]), n = m4.td(Fm, [pm.verts[i * 10 + 3], pm.verts[i * 10 + 4], pm.verts[i * 10 + 5]]), o = (vo + i) * 10;
        V[o] = p[0]; V[o + 1] = p[1]; V[o + 2] = p[2]; V[o + 3] = n[0]; V[o + 4] = n[1]; V[o + 5] = n[2]; V[o + 6] = pm.verts[i * 10 + 6]; V[o + 7] = 1;
        // local coordinates of hard parts ride along for the shader's graphics
        V[o + 8] = bone >= B.poleL ? pm.verts[i * 10 + 1] : pm.verts[i * 10 + 2]; V[o + 9] = pm.verts[i * 10 + 4];
        W[(vo + i) * 4] = bone; W[(vo + i) * 4 + 1] = bone; W[(vo + i) * 4 + 2] = 1;
      }
      for (let i = 0; i < pm.ni; i++) I[io + i] = pm.idx[i] + vo;
      vo += pm.nv; io += pm.ni;
    }
    K.mesh = { V, W, I, nv, ni };
    return K.mesh;
  };

  K.init = function (g) {
    gfx = g;
    const m = K.mesh || K.build();
    vb = gfx.buffer(m.V, 'vertex'); vb2 = gfx.buffer(m.W, 'vertex'); ib = gfx.buffer(m.I, 'index'); count = m.ni;
    boneTex = gfx.texture({ w: 4, h: 32, format: 'rgba32f', filter: 'nearest' });
    const buffers = [{ attrs: [['pos', 'vec3f'], ['nrm', 'vec3f'], ['mat', 'vec4f']] }, { attrs: [['bw', 'vec4f']] }];
    pipe = gfx.pipeline({
      name: 'skier', lib: [SL.common, SL.hash, SL.fog, SL.shadow, SKIN_SSL], buffers,
      varyings: { wp: 'vec3f', nrm: 'vec3f', bp: 'vec3f', bn: 'vec3f', mat: 'vec4f' }, uniforms: { p: 'vec4f' },
      textures: { tBones: 'fetch', tDetail: '2d', tShadow: 'shadow', tSky: '2d' },
      vs: `fn vert(a: VIn) -> VOut { var v: VOut; let s: SkinV = skinVertex(a.pos, a.nrm, a.bw); v.wp = s.wp; v.nrm = s.n; v.bp = a.pos; v.bn = a.nrm; v.mat = a.mat; v.clip = U.viewProj * vec4f(s.wp, 1.0); return v; }`,
      fs: SKIER_FS.replace('/*CHEST*/', (() => { const c = bind.J.chest, t = bind.t2, f = a => 'vec3f(' + a.map(v => v.toFixed(5)).join(', ') + ')'; return `let tl: vec3f = vec3f(dot(bp - ${f(c)}, ${f(t.X)}), dot(bp - ${f(c)}, ${f(t.Y)}), dot(bp - ${f(c)}, ${f(t.Z)}));`; })()),
    });
    pipeShadow = gfx.pipeline({
      name: 'skierShadow', lib: [SL.common, SKIN_SSL], buffers, varyings: {}, uniforms: { p: 'vec4f' }, textures: { tBones: 'fetch' }, colorFormat: null, cull: 'none', depthBias: 2, depthBiasSlope: 2.0,
      vs: `fn vert(a: VIn) -> VOut { var v: VOut; let s: SkinV = skinVertex(a.pos, a.nrm, a.bw); v.clip = U.shadowVP * vec4f(s.wp, 1.0); return v; }`, fs: null,
    });
    K.pipes = [pipe, pipeShadow]; K.ready = true;
  };

  // root: {pos (world, on the snow), fwd (unit, along the skis), nrm (snow normal)}; pose: see P0
  const cur = Object.assign({}, P0);
  K.pose = cur; K.world = { J: null, root: null };
  K.update = function (root, pose, origin) {
    Object.assign(cur, pose);
    const s = solve(cur);
    const Y = v3.norm(root.nrm), Z0 = v3.mul(root.fwd, -1), X = v3.norm(v3.cross(Y, Z0)), Z = v3.cross(X, Y);
    const R = m4.fromBasis(X, Y, Z, [root.pos[0] - origin[0], root.pos[1] - origin[1], root.pos[2] - origin[2]]);
    for (let i = 0; i < K.NB; i++) boneData.set(m4.mul(R, m4.mul(s.F[i], invBind[i])), i * 16);
    gfx.updateTexture(boneTex, 0, 0, 4, 32, boneData);
    K.world.root = R; K.world.J = s.J; K.world.X = X; K.world.Y = Y; K.world.Z = Z; K.world.hb = s.hb;
    return s;
  };
  // model-space point -> render space (for effects that attach to the body)
  K.toWorld = function (p) { return m4.tp(K.world.root, p); };
  K.draw = function (shadowTex, skyTex) { gfx.draw(pipe, { u: { p: [0, 0, 0, 0] }, tex: { tBones: boneTex, tDetail: Tex.detail, tShadow: shadowTex, tSky: skyTex }, vb: [vb, vb2], ib, count }); };
  K.drawShadow = function () { gfx.draw(pipeShadow, { u: { p: [0, 0, 0, 0] }, tex: { tBones: boneTex }, vb: [vb, vb2], ib, count }); };
  return K;
})();

const SKIN_SSL = `
fn boneM(i: f32) -> mat4x4f { let r: i32 = i32(i + 0.5); return mat4x4f(texFetch(tBones, vec2i(0, r), 0), texFetch(tBones, vec2i(1, r), 0), texFetch(tBones, vec2i(2, r), 0), texFetch(tBones, vec2i(3, r), 0)); }
struct SkinV { wp: vec3f, n: vec3f, }
fn skinVertex(pos: vec3f, nrm: vec3f, bw: vec4f) -> SkinV {
  var s: SkinV;
  let m0: mat4x4f = boneM(bw.x); let m1: mat4x4f = boneM(bw.y);
  let p0: vec4f = m0 * vec4f(pos, 1.0); let p1: vec4f = m1 * vec4f(pos, 1.0);
  s.wp = mix(p1.xyz, p0.xyz, bw.z);
  let n0: vec4f = m0 * vec4f(nrm, 0.0); let n1: vec4f = m1 * vec4f(nrm, 0.0);
  s.n = normalize(mix(n1.xyz, n0.xyz, bw.z));
  return s;
}
`;

const SKIER_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut;
  var id: f32 = floor(v.mat.x + 0.5);
  if (id < 1.5) { id = select(1.0, 0.0, v.mat.z > 0.0); }
  let qy: f32 = v.mat.z; let qz: f32 = v.mat.w;
  if (id > 3.5 && id < 4.5 && abs(qy - 0.004) < 0.020 && qz > -0.09) { id = 6.0; }
  if (id > 4.5 && id < 5.5 && (qz > -0.1265 || abs(qy) > 0.031 || abs(v.bp.x) > 0.074)) { id = 6.0; }
  var N: vec3f = normalize(v.nrm);
  let V: vec3f = normalize(U.camPos.xyz - v.wp);
  let L: vec3f = U.sunDir.xyz;
  let bp: vec3f = v.bp; let bn: vec3f = normalize(v.bn);
  let weave: vec4f = tex(tDetail, bp.xy * 3.1 + bp.zz * vec2f(2.3, 1.7));
  var alb: vec3f = vec3f(0.5); var specP: f32 = 20.0; var specS: f32 = 0.03; var sheen: f32 = 0.0; var gloss: f32 = 0.0; var glossTint: vec3f = vec3f(1.0); var cloth: f32 = 0.0;
  let orange: vec3f = vec3f(0.95, 0.255, 0.026); let navy: vec3f = vec3f(0.018, 0.030, 0.055);
  /*CHEST*/
  if (id < 0.5) {            // jacket: orange shell, dark forearms, pale chevron on the upper sleeves, pack straps over the shoulders
    let onTorso: f32 = smoothstep(-0.004, 0.004, v.mat.w);
    let fore: f32 = smoothstep(-0.30, -0.33, bp.z) * (1.0 - onTorso);
    alb = mix(orange, navy, fore);
    let chev: f32 = smoothstep(0.011, 0.006, abs(bp.y - 1.215 - (bp.z + 0.17) * 0.5)) * smoothstep(0.225, 0.245, abs(bp.x)) * (1.0 - fore);
    alb = mix(alb, vec3f(0.86, 0.87, 0.85), chev);
    sheen = 0.5; cloth = 1.0; specS = 0.05; specP = 28.0;
    let sx: f32 = abs(abs(tl.x) - 0.096);
    let strap: f32 = max(smoothstep(0.021, 0.017, sx) * smoothstep(-0.17, -0.15, tl.y), smoothstep(0.022, 0.018, abs(tl.y + 0.19))) * onTorso;
    let strapEdge: f32 = max(smoothstep(0.030, 0.021, sx) * smoothstep(-0.18, -0.15, tl.y), smoothstep(0.031, 0.022, abs(tl.y + 0.19))) * onTorso;
    alb *= 1.0 - 0.45 * (strapEdge - strap);
    alb = mix(alb, vec3f(0.040, 0.048, 0.062), strap); sheen = mix(sheen, 0.2, strap); cloth = mix(cloth, 0.5, strap);
  } else if (id < 1.5) {     // pants: charcoal, snow clinging below the knee
    alb = vec3f(0.030, 0.038, 0.050);
    let fine: vec4f = tex(tDetail, bp.xy * 11.0 + bp.zz * vec2f(7.0, 5.0));
    let snowy: f32 = smoothstep(0.50, 0.17, bp.y) * smoothstep(0.38, 0.72, fine.w * 0.6 + weave.z * 0.5 + smoothstep(0.34, 0.17, bp.y) * 0.25);
    alb = mix(alb, vec3f(0.78, 0.83, 0.90), snowy * 0.8);
    sheen = 0.35; cloth = 1.0; specS = 0.04;
  } else if (id < 2.5) {     // gloves
    alb = vec3f(0.018, 0.018, 0.020); sheen = 0.2; specS = 0.08; specP = 30.0;
  } else if (id < 3.5) {     // boots: pale shell, orange buckles
    alb = vec3f(0.60, 0.63, 0.66);
    let bk: f32 = smoothstep(0.012, 0.006, abs(fract(bp.y * 14.0) - 0.5) * 0.07) * step(0.14, bp.y) * step(bp.z, 0.02);
    alb = mix(alb, orange, bk * 0.9);
    let sole: f32 = step(bp.y, 0.052); alb = mix(alb, vec3f(0.02), sole);
    specS = 0.35; specP = 60.0; gloss = 0.06;
  } else if (id < 4.5) {     // helmet: matte white with an orange centre stripe
    alb = vec3f(0.80, 0.80, 0.77);
    alb = mix(alb, orange, smoothstep(0.016, 0.011, abs(bp.x)) * 0.95);
    specS = 0.18; specP = 40.0; gloss = 0.03;
  } else if (id < 5.5) {     // goggle lens: mirrored, iridescent
    alb = vec3f(0.01, 0.01, 0.015); gloss = 0.85; specS = 2.0; specP = 600.0;
    let fr: f32 = 1.0 - saturate(dot(N, V));
    glossTint = mix(vec3f(1.0, 0.62, 0.20), vec3f(0.95, 0.25, 0.55), fr);
  } else if (id < 6.5) {     // goggle frame + strap
    alb = mix(vec3f(0.02), orange, step(-0.095, qz));
    sheen = 0.2; specS = 0.06;
  } else if (id < 7.5) {     // neck gaiter
    alb = vec3f(0.022, 0.030, 0.045); sheen = 0.4; cloth = 1.0;
  } else if (id < 8.5) {     // backpack: slate body, orange lid, reflective tab
    alb = vec3f(0.045, 0.055, 0.070);
    let lid: f32 = smoothstep(1.325, 1.335, bp.y - bp.z * 0.45);
    alb = mix(alb, orange * 0.9, lid);
    let zip: f32 = smoothstep(0.005, 0.002, abs(bp.x)) * (1.0 - lid);
    alb = mix(alb, vec3f(0.01), zip);
    let tab: f32 = smoothstep(0.03, 0.026, abs(bp.x)) * smoothstep(0.012, 0.009, abs(bp.y - bp.z * 0.45 - 1.02));
    alb = mix(alb, vec3f(0.9), tab);
    sheen = 0.25; specS = 0.08; specP = 26.0; cloth = 0.6;
  } else if (id < 9.5) {     // skis: graphic topsheet, bright base, steel edges
    let top: f32 = smoothstep(0.55, 0.8, v.mat.w); let base: f32 = smoothstep(-0.55, -0.8, v.mat.w); let z: f32 = v.mat.z;
    let band: f32 = step(0.5, fract(z * 3.2 + 0.15));
    var topc: vec3f = mix(vec3f(0.012, 0.016, 0.022), vec3f(0.0, 0.42, 0.40), band * smoothstep(-0.1, -0.5, z));
    topc = mix(topc, vec3f(0.85, 0.87, 0.86), smoothstep(0.03, 0.02, abs(fract(z * 3.2 + 0.15) - 0.5)) );
    topc = mix(topc, orange, smoothstep(0.55, 0.60, z));
    alb = mix(vec3f(0.30, 0.32, 0.34), topc, top); alb = mix(alb, vec3f(0.0, 0.62, 0.50), base);
    specS = mix(1.2, 0.5, top); specP = 90.0; gloss = mix(0.25, 0.10, top);
  } else {                   // poles
    alb = mix(vec3f(0.015), orange, step(-0.105, v.mat.z));
    alb = mix(alb, vec3f(0.05, 0.055, 0.065), step(v.mat.z, -1.025) * step(-1.06, v.mat.z));   // baskets: dark (in a tuck they point straight back at the lens, and pale ones read as a pair of eyes)
    specS = 0.6; specP = 80.0; gloss = 0.08;
  }
  // fabric micro-relief
  N = normalize(N + (vec3f(weave.x, weave.y, weave.z) - 0.5) * 0.22 * cloth);
  let ndl: f32 = dot(N, L); let ndv: f32 = saturate(dot(N, V));
  let sh: f32 = shadowAt(v.wp + N * 0.035, 0.0016);
  let ao: f32 = v.mat.y;
  let wrapD: f32 = saturate((ndl + 0.25 * cloth) / (1.0 + 0.25 * cloth));
  let amb: vec3f = U.ambSky.rgb * (0.5 + 0.5 * N.y) + U.ambGnd.rgb * (0.5 - 0.5 * N.y) * 1.25 + twiLight(N);
  var col: vec3f = alb * (U.sunCol.rgb * wrapD * sh + amb * ao);
  // sun through the fuzz at grazing angles, strongest when backlit
  let fr: f32 = pow(1.0 - ndv, 3.0);
  let back: f32 = saturate(dot(-V, L) * 0.5 + 0.5);
  col += (alb * 0.6 + 0.08) * U.sunCol.rgb * sheen * fr * (0.25 + 1.6 * back * back) * sh * saturate(ndl * 2.0 + 0.9);
  // against the light every edge that still sees the sun burns: the outline that lifts the figure off the snow
  let rim: f32 = pow(1.0 - ndv, 1.45) * back * back * saturate(ndl * 1.6 + 0.8) * sh;
  col += (alb * 0.5 + 0.24) * U.sunCol.rgb * (rim * (0.75 + 1.1 * sheen));
  col += alb * U.ambSky.rgb * sheen * fr * 0.6 * ao;
  // a thin shell with the sun behind it is lit from inside: the shaded side of the jacket glows in its own colour instead of going brown
  col += alb * U.sunCol.rgb * (0.24 * cloth * back * back * saturate(0.6 - ndl) * (0.35 + 0.65 * sh));
  let Hh: vec3f = normalize(V + L);
  col += U.sunCol.rgb * sh * specS * pow(max(dot(N, Hh), 0.0), specP) * saturate(ndl * 4.0);
  if (gloss > 0.0) {
    let R: vec3f = reflect(-V, N);
    var env: vec3f = skyLut(normalize(vec3f(R.x, abs(R.y) * 0.9 + 0.02, R.z)));
    env = mix(env, vec3f(0.75, 0.80, 0.90) * (U.ambSky.rgb + U.sunCol.rgb * 0.35), smoothstep(0.05, -0.25, R.y));    // snow below the horizon
    let f0: f32 = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
    col += env * glossTint * gloss * mix(f0, 1.0, step(0.5, gloss));
  }
  col = applyFog(col, v.wp);
  o.color = vec4f(col, 1.0);
  return o;
}
`;
