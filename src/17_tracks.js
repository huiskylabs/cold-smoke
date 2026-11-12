// ---------------------------------------------------------------- the skier's own tracks
// Two height maps of the snow the skier has been over, addressed by world position modulo their size. The near one is fine enough to
// hold the wall a single edge cuts (1024^2 texels over 12.8 m, a little over a centimetre each, heights in metres) and comes with a second
// texture of baked light: for every texel how far it lies under the shadow of the snow that stands toward the sun, how much sky the walls
// round it hide, and which way the snow slopes. The far one (the same texels over 51.2 m) keeps the trail going up the hill behind. Every step each ski presses in ALL the
// snow it covered while it came that step: a flat ski leaves a trench, a ski on edge a slot with one clean wall and a pressed ramp, a ski
// going sideways a wide scraped floor with a berm of pushed snow along its leading side. The terrain reads the maps as light and, round the
// skier, as real relief (04_terrain.js). Whatever lies more than 'keep' metres from the skier is wiped, so the tracks of one tile back never
// come round.
const Tracks = (() => {
  const T = { N: 1024, enabled: true, pipes: [], D: 0.045, ski: { hw: 0.057, tail: 0.80, tip: 0.92 } };   // D: how deep the skis are riding now (m)
  const MAXI = 1024, FL = 20, REACH = 2.4;           // steps of ski kept to press in again; floats in one; how far from the boot a stamp can reach (m)
  // (far.every: the far map is looked at from a distance only, and is brought up to date every fourth frame)
  const LN = { k: 0, span: 12.8, keep: 5.0, every: 0.8, clear: [0, 0, 0, 0], enc: [0, 1, 3, 0] }, LF = { k: 1, span: 51.2, keep: 22, every: 3, clear: [0.5, 0.5, 0.5, 1], enc: [0.5, 2, 5, 0] };
  let gfx, cpu, wpos, count = 0, base = 0, cx = 0, cz = 0, frame = 0, saz = null, pBake, pdx = 0, pdz = -1, Dset = false, skidK = 0, vNow = null, vT = 0;
  // how far a ski beds itself into firm snow is the owner's to choose (m, standing; the soft snow lying on the pack comes on top)
  const VS = typeof Variants !== 'undefined' ? Variants : null, SINK = { a: 0.006, b: 0.013, c: 0.022 };
  if (VS) VS.def('sink', '入雪深浅', [['a', '浅'], ['b', '适中'], ['c', '深']], 'b');
  const prev = [null, null], plPrev = [0, 0], trail = [], ft = [[0, 0, 0, 0], [0, 0, 0, 0]];
  const su = { p: [0, 0, 0, 0], e: null, w: [0, 0, 0, 0], s: [0, -1, 0, 0] }, wu = { p: [0, 0, 0, 0], c: null }, LIT0 = [0, 1, 0, 0];      // (LIT0: no wall toward the sun, all of the sky, level snow)
  // what the terrain is told each frame (render space): the box the trail lies in, each ski (point under the boot + half width, axis toward
  // the tip + tail length, axis across + tip length; 0 = no ski) and each leg (knee, hip, with the thickness of shin and thigh)
  const z4 = () => [0, 0, 0, 0];
  const U = T.U = { on: false, D: 0, pc: [0, 0], tk: [0, -1, 1, -1], tb: z4(), sa0: z4(), sa1: z4(), sa2: z4(), sb0: z4(), sb1: z4(), sb2: z4(), la0: z4(), la1: z4(), lb0: z4(), lb1: z4() };

  T.init = function (g) {
    gfx = g; cpu = new Float32Array(MAXI * FL); wpos = new Float32Array(MAXI * 2);
    const map = format => gfx.texture({ w: T.N, h: T.N, format, filter: 'linear', wrap: 'repeat', mips: true });
    const inst = [{ instanced: true, attrs: [['a0', 'vec4f'], ['a1', 'vec4f'], ['a2', 'vec4f'], ['a3', 'vec4f'], ['a4', 'vec4f']] }], uniforms = { p: 'vec4f', e: 'vec4f', w: 'vec4f', s: 'vec4f' };
    for (const L of [LN, LF]) {
      const colorFormat = L.k ? 'rgba8' : 'rgba16f';
      L.tex = map(colorFormat); L.tgt = gfx.target({ color: L.tex }); L.buf = gfx.buffer(cpu, 'vertex', true); L.sent = 0; L.fresh = true; L.wx = L.wz = 0;
      L.pipe = gfx.pipeline({
        name: L.k ? 'trackStampFar' : 'trackStamp', lib: [SL.common, TRACK_SSL], topology: 'strip', cull: 'none', depth: false, depthTest: false, blend: 'alpha', colorFormat, buffers: inst,
        varyings: { q: 'vec4f', w: 'vec4f', c: 'vec4f', d: 'vec4f', e: 'vec4f' }, uniforms, textures: { tDetail: '2d' }, vs: TRACK_STAMP_VS, fs: TRACK_STAMP_FS,
      });
      L.wipe = gfx.pipeline({
        name: L.k ? 'trackWipeFar' : 'trackWipe', lib: [SL.common], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f', c: 'vec4f' }, textures: {},
        depth: false, depthTest: false, cull: 'none', blend: 'none', colorFormat, vs: VS_FULLSCREEN, fs: TRACK_WIPE_FS,
      });
    }
    LN.lit = map('rgba16f'); LN.litT = gfx.target({ color: LN.lit });
    pBake = gfx.pipeline({
      name: 'trackBake', lib: [SL.common, TRACK_SSL], topology: 'strip', cull: 'none', depth: false, depthTest: false, blend: 'none', colorFormat: 'rgba16f', buffers: inst,
      varyings: { w: 'vec4f' }, uniforms, textures: { tT: '2d' }, vs: TRACK_BAKE_VS, fs: TRACK_BAKE_FS,
    });
    T.near = LN.tex; T.light = LN.lit; T.far = LF.tex;
    T.pipes = [LN.pipe, LF.pipe, LN.wipe, LF.wipe, pBake];
  };
  T.reset = function () { LN.fresh = LF.fresh = true; LN.sent = LF.sent = 0; count = 0; base = 0; prev[0] = prev[1] = null; trail.length = 0; Dset = false; skidK = 0; };

  // called every simulation step with the skier's frame, pose and physical state
  T.step = function (root, pose, S) {
    const px = root.pos[0], pz = root.pos[2], mv = Math.hypot(px - cx, pz - cz);
    if (mv > 6) T.reset();       // the skier was put somewhere else
    cx = px; cz = pz;
    // where the skier has been, a point every half metre (the terrain is told the box they lie in), and which way the skier is heading
    { const n = trail.length; if (!n || Math.hypot(px - trail[n - 2], pz - trail[n - 1]) > 0.5) { if (n >= 128) trail.splice(0, 2); trail.push(px, pz); } }
    const tl = Math.hypot(S.v[0], S.v[2]);
    if (tl > 1 && mv < 6) { const k = 1 - Math.exp(-mv / 1.5); pdx += (S.v[0] / tl - pdx) * k; pdz += (S.v[2] / tl - pdz) * k; const l = Math.hypot(pdx, pdz) || 1; pdx /= l; pdz /= l; }
    if (!T.enabled || !S.contact || S.air) { prev[0] = prev[1] = null; return; }
    // the skis' frame, as the skier builds it (08_skier.js): X to the right, Y the snow normal, A along the skis
    const Y = v3.norm(root.nrm), X = v3.norm(v3.cross(root.fwd, Y)), A = v3.cross(Y, X), al = Math.hypot(A[0], A[2]) || 1, rx = -A[2] / al, rz = A[0] / al;
    const e = pose.edge || 0, se = Math.sin(e), pw = S.powder || 0, hw = T.ski.hw, kv = smooth(0.8, 3, S.speed || 0);
    // a ski beds itself a centimetre or two into firm, wind-packed snow (the soft snow lying on it gives, the pack hardly) and a hand's width into
    // powder; deeper under load, deeper still when all of it stands on one edge, less when it is scraping sideways. (The depth changes
    // along the track, not in time: a skier standing still does not sink.)
    // (On firm snow this had three to six centimetres first: each ski ran in a ditch with a dark wall beside it and lips along both sides,
    // wider than the ski: the owner's "block" round the skis. Real skis on firm snow: the snow comes right up to the ski, a thin line of
    // shadow along one edge and of light along the other, and behind the tail a shallow clean groove of the ski's own width)
    // (the pack gives the same under any load; it is the soft snow on it that gives more under more)
    const sb = tl > 0.5 ? Math.abs(S.v[0] * rx + S.v[2] * rz) / tl : 0, vs = VS ? VS.val.sink : 'b', firm = SINK[vs] || SINK.b, soft = 0.10 * pw * pw;
    const Dt = (firm + soft * clamp(0.55 + 0.45 * (S.load || 9.8) / 9.8, 0.7, 1.4)) * (1 + 0.15 * Math.abs(se)) * (1 - 0.4 * Math.min(1, sb / 0.5));
    // (another version chosen: the depth goes over to it in half a second even if the skier is standing, and skis that stand are pressed in afresh)
    if (vs !== vNow) { if (vNow !== null) vT = 40; vNow = vs; }
    T.D = Dset ? T.D + (Dt - T.D) * Math.max(1 - Math.exp(-mv / 0.6), vT > 0 ? 0.12 : 0) : Dt; Dset = true;
    const J = typeof Skier !== 'undefined' && Skier.world ? Skier.world.J : null;
    // the point of each base under the boot (model space: x right, y up from the snow, z back), from the skier's own joints when there are
    // any; and whether that ski is in the snow at all
    for (let k = 0; k < 2; k++) {
      const sg = k ? 1 : -1, f = J && (k ? J.footR : J.footL), q = ft[k];
      q[0] = f ? f[0] : sg * pose.stance * 0.5; q[1] = f ? f[1] : 0.05 * Math.abs(se) + ((k ? pose.liftR : pose.liftL) || 0); q[2] = f ? f[2] : -sg * pose.lead;
      q[3] = q[1] - hw * Math.abs(se) > T.D - 0.003 ? 0 : 1;
    }
    let skd = 0;
    for (let k = 0; k < 2; k++) {
      const fx = ft[k][0], lift = ft[k][1], fz = ft[k][2], ot = ft[1 - k];
      const Fx = px + X[0] * fx - A[0] * fz, Fz = pz + X[2] * fx - A[2] * fz, p0 = prev[k];
      // a ski clear of the snow presses nothing, but where it is goes on being followed: the inside ski of a hard turn skims the surface, in
      // and out of it, and each time it came back as a ski put down where it stands, walled in all round, it filled in the floor it had cut
      if (!ft[k][3]) { prev[k] = [Fx, Fz, A[0] / al, A[2] / al]; continue; }
      // the stretch it came this step, and how far it turned on the way (+ = to the left): the tail of a ski that is turning sweeps wider than
      // its boot, and a step taken as a plain shift leaves a notch in the edge of the track every time
      let dx = 0, dz = 0, th = 0;
      if (p0) {
        dx = Fx - p0[0]; dz = Fz - p0[1]; const d2 = dx * dx + dz * dz; if (d2 < 9e-6 && !vT) continue;
        if (d2 > 9 || d2 < 9e-6) dx = dz = 0; else th = clamp(Math.asin(clamp(rx * p0[2] + rz * p0[3], -1, 1)), -0.3, 0.3);       // (a ski put down is pressed in where it stands)
      }
      prev[k] = [Fx, Fz, A[0] / al, A[2] / al];
      // how much of the way it came was sideways (+ = toward its right; the shader makes the lips and the berm of it), and how far beside the
      // ski the stamp has anything to say: the wall, as wide as the coarser map draws it, and what is piled beyond
      const dl = Math.hypot(dx, dz), ldr = dl > 1e-4 ? (dx * rx + dz * rz) / dl * kv : 0;
      skd = Math.max(skd, Math.min(1, Math.abs(ldr) / 0.45));
      const mar = (Math.max(0.022 + 0.07 * pw, 0.085) + 0.17 * Math.min(1, Math.abs(ldr) / 0.45)) * 1.05 + 0.13 + Math.abs(th);
      if (count === MAXI) { cpu.copyWithin(0, FL * MAXI / 2); wpos.copyWithin(0, MAXI); count = MAXI / 2; base += MAXI / 2; }
      const o = count * FL; wpos[count * 2] = Fx; wpos[count * 2 + 1] = Fz; count++;
      cpu[o] = fract(Fx / LN.span); cpu[o + 1] = fract(Fz / LN.span); cpu[o + 2] = fract(Fx / LF.span); cpu[o + 3] = fract(Fz / LF.span);
      cpu[o + 4] = A[0]; cpu[o + 5] = A[2]; cpu[o + 6] = dx; cpu[o + 7] = dz;
      // (where the other ski's boot is, in this one's frame: to its right, toward its tip. Far away if that one is in the air)
      cpu[o + 8] = se; cpu[o + 9] = ot[3] ? ot[0] - fx : 99; cpu[o + 10] = T.D; cpu[o + 11] = lift;
      // (... how high that one rides; and the depth a ski scrapes to when it goes sideways, which hangs on the snow alone)
      cpu[o + 12] = th; cpu[o + 13] = ot[3] ? ot[1] : 99; cpu[o + 14] = (firm + soft) * 0.6; cpu[o + 15] = 0;
      cpu[o + 16] = fz - ot[2]; cpu[o + 17] = ldr; cpu[o + 18] = pw; cpu[o + 19] = mar;
    }
    // a pole planted leaves a hole: the tip's, with the basket's ring pressed round it (d.w = 1 marks such a stamp; one per plant, so it costs nothing)
    const Wk = typeof Skier !== 'undefined' && Skier.world;
    for (let k = 0; k < 2; k++) { const pl = Wk && Wk.J ? (k ? Wk.J.plantedR : Wk.J.plantedL) || 0 : 0, tp = Wk && (k ? Wk.tipR : Wk.tipL);
      if (pl >= 0.99 && !(plPrev[k] >= 0.99) && tp && Math.hypot(tp[0] - px, tp[2] - pz) < REACH) {
        if (count === MAXI) { cpu.copyWithin(0, FL * MAXI / 2); wpos.copyWithin(0, MAXI); count = MAXI / 2; base += MAXI / 2; }
        const o = count * FL; wpos[count * 2] = tp[0]; wpos[count * 2 + 1] = tp[2]; count++; cpu.fill(0, o, o + FL);
        cpu[o] = fract(tp[0] / LN.span); cpu[o + 1] = fract(tp[2] / LN.span); cpu[o + 2] = fract(tp[0] / LF.span); cpu[o + 3] = fract(tp[2] / LF.span);
        cpu[o + 4] = A[0]; cpu[o + 5] = A[2]; cpu[o + 13] = 99; cpu[o + 15] = 1; cpu[o + 19] = 0.04; }
      plPrev[k] = pl; }
    skidK += (skd - skidK) * (1 - Math.exp(-mv / 0.25));       // how much the skis are going sideways now (as 'skid' in the stamp)
    if (vT > 0) vT--;
  };

  // one quad per ski and step; a stamp that lies on the edge of the tile is drawn again on the far side (the vertex stage folds away the copies not needed)
  function quads(pipe, L, phase, tex, n) {
    su.p[0] = 1 / L.span; su.p[1] = L.span / T.N; su.p[2] = phase; su.p[3] = L.k; su.e = L.enc; su.w[2] = REACH / L.span;
    for (let c = 0; c < 4; c++) { su.w[0] = c & 1; su.w[1] = c >> 1; gfx.draw(pipe, { u: su, tex, vb: [L.buf], count: 4, instances: n }); }
  }
  // bring one map up to date: press in the steps it has not seen, and now and then wipe what the skier has left behind for good
  function press(L) {
    // (if the skier has come too far since the map was last wiped, what was left out of reach then could come round the tile and into reach
    // now: start from clean snow, and press the last stretch in again from the steps kept)
    const moved = Math.hypot(cx - L.wx, cz - L.wz), fresh = L.fresh || moved > L.span - 2 * L.keep - 0.5, wipe = fresh || moved > L.every;
    let i0 = Math.max(L.sent - base, 0);
    if (fresh) { const r2 = (L.keep + 1) * (L.keep + 1); i0 = count; while (i0 > 0) { const dx = wpos[i0 * 2 - 2] - cx, dz = wpos[i0 * 2 - 1] - cz; if (dx * dx + dz * dz > r2) break; i0--; } }
    const n = count - i0; L.sent = base + count; L.fresh = false;
    if (!n && !wipe) return false;
    if (wipe) { L.wx = cx; L.wz = cz; }
    wu.p[0] = fract(cx / L.span); wu.p[1] = fract(cz / L.span); wu.p[2] = L.span; wu.p[3] = L.keep; wu.c = L.clear;
    gfx.beginPass(L.tgt, fresh ? { color: L.clear } : {});
    // (what is piled beside the skis first, then the cuts: where two stamps meet, the cut wins)
    if (n) { gfx.updateBuffer(L.buf, 0, cpu.subarray(i0 * FL, count * FL)); quads(L.pipe, L, 0, { tDetail: Tex.detail }, n); quads(L.pipe, L, 1, { tDetail: Tex.detail }, n); }
    if (wipe) gfx.draw(L.wipe, { u: wu, count: 3 });
    gfx.endPass(); gfx.genMips(L.tex);
    if (L.k) return true;
    // the light of the near map, worked out again round the new stamps only
    wu.c = LIT0;
    gfx.beginPass(LN.litT, fresh ? { color: LIT0 } : {});
    if (n) quads(pBake, L, 0, { tT: L.tex }, n);
    if (wipe) gfx.draw(LN.wipe, { u: wu, count: 3 });
    gfx.endPass(); gfx.genMips(LN.lit);
    return true;
  }
  // before the scene is drawn
  T.pre = function () {
    frame++;
    if (saz !== Sky.az) { saz = Sky.az; su.s[0] = Math.sin(saz); su.s[1] = -Math.cos(saz); LN.fresh = true; }      // (the light is baked for the one bearing the sun keeps all day)
    // ... and for the sun's height above the lie of the slope the skier is on (the terrain's own measure of it, t3 in 04_terrain.js)
    const n = Course.normal(cx, cz); su.s[2] = Math.max(Math.tan(Sky.elev) + (n[0] * su.s[0] + n[2] * su.s[1]) / Math.max(n[1], 0.2), 0.03);
    press(LN);
    if (LF.fresh || !(frame & 3)) press(LF);
  };

  // what the terrain needs to know this frame
  T.frame = function () {
    U.on = T.enabled; U.D = T.D; U.pc[0] = cx - 0.6 * pdx; U.pc[1] = cz - 0.6 * pdz;      // (the relief is centred a little behind the skier, where the tracks are)
    // the trail as a box, along the line from its far end to the skier and across it: snow no ski has been near is not asked about tracks
    let i0 = trail.length, ax = pdx, az = pdz, a0 = 0, a1 = 0, b0 = 0, b1 = 0; const r2 = LF.keep * LF.keep, m = 1.8;
    while (i0 > 0) { const dx = trail[i0 - 2] - cx, dz = trail[i0 - 1] - cz; if (dx * dx + dz * dz > r2) break; i0 -= 2; }
    if (i0 < trail.length) { const dx = cx - trail[i0], dz = cz - trail[i0 + 1], l = Math.hypot(dx, dz); if (l > 1) { ax = dx / l; az = dz / l; } }
    for (let i = i0; i < trail.length; i += 2) { const dx = trail[i] - cx, dz = trail[i + 1] - cz, a = dx * ax + dz * az, b = dz * ax - dx * az; if (a < a0) a0 = a; if (a > a1) a1 = a; if (b < b0) b0 = b; if (b > b1) b1 = b; }
    U.tk[0] = ax; U.tk[1] = az; U.tk[2] = a0 - m; U.tk[3] = a1 + m; U.tb[0] = b0 - m; U.tb[1] = b1 + m;
    U.tb[2] = lerp(T.ski.tip + 0.03, 0.31, smooth(0.055, 0.09, T.D) * (1 - skidK));      // how far ahead of the boot the snow is open over a ski (as 'tip' in the stamp)
    // skis and legs as they are drawn this frame (the skier's own joints and frame; without them, no contact shadows)
    const Sk = typeof Skier !== 'undefined' ? Skier : null, W = Sk && Sk.world, R = W && W.root, J = W && W.J, P = (Sk && Sk.pose) || {};
    for (let k = 0; k < 2; k++) {
      const C = k ? U.sb0 : U.sa0, A = k ? U.sb1 : U.sa1, B = k ? U.sb2 : U.sa2, K0 = k ? U.lb0 : U.la0, K1 = k ? U.lb1 : U.la1, f = J && (k ? J.footR : J.footL);
      B[3] = 0; K0[3] = 0;
      if (!R || !f) continue;
      // (the ski's frame in model space: rolled onto its edge, pitched if a foot is lifted; -z is where it points)
      const e = P.edge || 0, pt = -((k ? P.pitchR : P.pitchL) || 0), cr = Math.cos(e), sr = Math.sin(e), cp = Math.cos(pt), sp = Math.sin(pt);
      const c = m4.tp(R, f), a = m4.td(R, [-sp * sr, -sp * cr, -cp]), b = m4.td(R, [cr, -sr, 0]);
      C[0] = c[0]; C[1] = c[1]; C[2] = c[2]; C[3] = T.ski.hw; A[0] = a[0]; A[1] = a[1]; A[2] = a[2]; A[3] = T.ski.tail; B[0] = b[0]; B[1] = b[1]; B[2] = b[2]; B[3] = T.ski.tip + 0.03;
      const kn = k ? J.kneeR : J.kneeL, hp = k ? J.hipR : J.hipL;
      if (kn && hp) { const q = m4.tp(R, kn), h = m4.tp(R, hp); K0[0] = q[0]; K0[1] = q[1]; K0[2] = q[2]; K0[3] = 0.058; K1[0] = h[0]; K1[1] = h[1]; K1[2] = h[2]; K1[3] = 0.075; }
    }
    return U;
  };
  return T;
})();

// What the stamps and the bake share: a quad laid over all a ski covered while it came one step, plus a margin, in the ski's own frame
// (q.x metres to its right, q.y metres toward its tip, from the point under the boot; q.zw the stretch it came, in the same frame).
// a0 = where that point lies in the near and the far tile, a1 = the ski's axis and the stretch it came (world xz).
const TRACK_SSL = `
const SKI_HW: f32 = 0.057; const SKI_TAIL: f32 = 0.80; const SKI_TIP: f32 = 0.92;
// a ski riding deep runs under the snow ahead of the boot (which is what opens the trench); one riding shallow presses it in from the shovel on
fn skiFront(D: f32) -> f32 { return mix(SKI_TIP, 0.30, smoothstep(0.055, 0.09, D)); }
struct TrkV { clip: vec4f, q: vec4f, w: vec4f, }
fn trackQuad(a0: vec4f, a1: vec4f, vid: u32, mU: f32, mV: f32, sunReach: f32) -> TrkV {
  var t: TrkV;
  let sx: f32 = f32(vid & 1u); let sy: f32 = f32((vid >> 1u) & 1u);
  let ax: vec2f = a1.xy; let al: f32 = max(length(ax), 1e-3); let rt: vec2f = vec2f(-ax.y, ax.x) / al;
  let dl: vec2f = vec2f(dot(a1.zw, rt), dot(a1.zw, ax) / (al * al));
  // (the bake also takes in the snow down-sun of the stamp, as far as a shadow reaches)
  let sn: vec2f = vec2f(dot(M.s.xy, rt), dot(M.s.xy, ax) / (al * al)) * sunReach;
  let u0: f32 = -SKI_HW - max(dl.x, 0.0) - mU - max(sn.x, 0.0); let u1: f32 = SKI_HW - min(dl.x, 0.0) + mU - min(sn.x, 0.0);
  let v0: f32 = -SKI_TAIL - max(dl.y, 0.0) - mV - max(sn.y, 0.0); let v1: f32 = SKI_TIP - min(dl.y, 0.0) + mV - min(sn.y, 0.0);
  let p: vec2f = vec2f(mix(u0, u1, sx), mix(v0, v1, sy));
  let f: vec2f = mix(a0.xy, a0.zw, M.p.w); let rc: f32 = M.w.z;
  let nu: f32 = select(select(0.0, -1.0, f.x > 1.0 - rc), 1.0, f.x < rc); let nv: f32 = select(select(0.0, -1.0, f.y > 1.0 - rc), 1.0, f.y < rc);
  let uv: vec2f = f + (rt * p.x + ax * p.y) * M.p.x + vec2f(nu * M.w.x, nv * M.w.y);
  t.clip = vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.5, 1.0);
  if ((M.w.x > 0.5 && nu == 0.0) || (M.w.y > 0.5 && nv == 0.0)) { t.clip = vec4f(2.0, 2.0, 0.5, 1.0); }
  t.q = vec4f(p, dl); t.w = vec4f(uv, uv / M.p.x);
  return t;
}
`;
const TRACK_STAMP_VS = `
fn vert(a: VIn) -> VOut {
  var v: VOut;
  var t: TrkV = trackQuad(a.a0, a.a1, a.vid, mix(a.a4.w, 0.03 + abs(a.a3.x), M.p.z), mix(0.14, 0.03, M.p.z) + 0.1 * abs(a.a3.x), 0.0);
  // (a pole's hole: a quad of a hand's breadth round the tip, no more: margins that undo the ski's own length)
  if (a.a3.w > 0.5) { t = trackQuad(a.a0, a.a1, a.vid, 0.09 - SKI_HW, -0.68, 0.0); }
  v.clip = t.clip; v.q = t.q; v.w = t.w; v.c = a.a2; v.d = a.a3; v.e = a.a4;
  return v;
}`;
// c = sine of the edge angle (+ = right edge down), where the other ski's boot is (to the right), depth the ski rides at, height of its
// centre line over the snow plane; d = how far the ski turned this step, how high the other ski rides, the depth a ski going sideways
// scrapes to; e = where the other ski's boot is (toward the tip; not used
// now), how much of the way it came was sideways (+ = to its right), powder. Heights are written relative to untouched snow (M.e: offset, scale and noise level
// of this map). Drawn twice: M.p.z = 0 the snow piled beside the ski, 1 the cut under it.
const TRACK_STAMP_FS = `
fn sdBox2(p: vec2f, c: vec2f, h: vec2f) -> f32 { let d: vec2f = abs(p - c) - h; return length(max(d, vec2f(0.0))) + min(max(d.x, d.y), 0.0); }
// distance to all the ground a box (centre c, half size h) covered while it came the stretch d
fn sweep(p: vec2f, c: vec2f, h: vec2f, d: vec2f) -> f32 {
  var s: f32 = sdBox2(p, c - 0.5 * d, h + 0.5 * abs(d));
  let l: f32 = length(d);
  if (l > 1e-5) { let n: vec2f = vec2f(-d.y, d.x) / l; s = max(s, abs(dot(p - c, n)) - (h.x * abs(n.x) + h.y * abs(n.y))); }
  return s;
}
// for which part of the way (0 = now, 1 = a step ago) the coordinate x, changing by d a step, lay between lo and hi
fn slab(x: f32, d: f32, lo: f32, hi: f32) -> vec2f {
  if (abs(d) < 1e-6) { if (x >= lo && x <= hi) { return vec2f(-1e9, 1e9); } return vec2f(1e9, -1e9); }
  let a: f32 = (lo - x) / d; let b: f32 = (hi - x) / d; return vec2f(min(a, b), max(a, b));
}
// the ski's base over the snow plane it stands on: tilted across by the edge angle, turned up at the shovel and a little at the tail
// (the shovel a shade less than the ski's own: snow rides up it)
// (kt: how far the tail turns up. Not at all, for this purpose, on a ski going sideways: its tail is the last of it to go over the snow, and
// behind the ski that comes second in a skid it left a strip of floor two centimetres proud of the rest, with a tooth for every step)
fn skiBase(q: vec2f, sphi: f32, cphi: f32, lift: f32, kt: f32) -> f32 {
  return lift - q.x / cphi * sphi + 0.10 * pow(smoothstep(0.62, 0.96, q.y), 1.7) + kt * sq(smoothstep(0.82 * SKI_TAIL, SKI_TAIL, -q.y));
}
// a spot of snow, p in the ski's frame now, having come dl a step: where it last lay under the strip c, h of the base that is in the snow
// (xy), and where it first came under it (zw). A spot the ski only went past counts where it came nearest: the corner that drew that edge
// of the track
// (... nearest in the course of THIS step. Reckoned on as if the ski had always gone, and would always go, the way it went this step, a
// spot beside a ski that drifts a hair to one side "came nearest" a hundred steps away: at the tip, or at the tail)
fn under(p: vec2f, dl: vec2f, c: vec2f, h: vec2f) -> vec4f {
  let iu: vec2f = slab(p.x, dl.x, c.x - h.x, c.x + h.x); let iv: vec2f = slab(p.y, dl.y, c.y - h.y, c.y + h.y);
  let sa: f32 = max(iu.x, iv.x); let sb: f32 = min(iu.y, iv.y);
  let q: vec2f = clamp(p + dl * clamp(select(sa, 0.5 * (sa + sb), sa > sb), 0.0, 1.0), c - h, c + h);
  var tu: f32 = 400.0; var tv: f32 = 400.0;
  if (dl.x > 1e-6) { tu = (c.x + h.x - q.x) / dl.x; } else if (dl.x < -1e-6) { tu = (c.x - h.x - q.x) / dl.x; }
  if (dl.y > 1e-6) { tv = (c.y + h.y - q.y) / dl.y; } else if (dl.y < -1e-6) { tv = (c.y - h.y - q.y) / dl.y; }
  return vec4f(q, q + dl * min(min(tu, tv), 400.0));
}
// the lowest the base came over that spot on the way: where it left, where it came in, and between them the point nearest the boot (along
// its length the base is lowest in the middle). A ski going sideways leaves the height of its low edge behind; one running along itself,
// its own cross section
// (xl, sm: of a ski going sideways the whole strip counts as its low edge, which lies at xl)
fn lowest(g: vec4f, sphi: f32, cphi: f32, lift: f32, xl: f32, sm: f32) -> f32 {
  let dy: f32 = g.w - g.y; let qm: vec2f = mix(g.xy, g.zw, saturate(-g.y / select(dy, 1e-6, abs(dy) < 1e-6)));
  let kt: f32 = 0.015 * (1.0 - sm);   // (the tail kick of skiMesh in 08_skier.js)
  return min(min(skiBase(vec2f(mix(g.x, xl, sm), g.y), sphi, cphi, lift, kt), skiBase(vec2f(mix(g.z, xl, sm), g.w), sphi, cphi, lift, kt)), skiBase(vec2f(mix(qm.x, xl, sm), qm.y), sphi, cphi, lift, kt));
}
// the floor is pressed snow, not a planed board: it keeps a little of the lumps it was made of (lz), base and edges draw fine lines in it
// along the way they went, and a ski going sideways combs it outright (wq: how far to the side of the boot's own path the spot lies). All of
// it fades out where the base only grazed the snow: a scraped band ends in a feather edge, not in a row of pits. (And the lumps are never
// more than a third of the depth: the floor of a shallow groove in firm snow is ironed flat)
fn floorAt(R: f32, wq: f32, lz: f32, skid: f32, pw: f32) -> f32 {
  let lines: f32 = (0.0006 * sin(wq * 105.0 + 5.0 * lz) + 0.0004 * sin(wq * 163.0 + 1.7)) * (1.0 - M.p.w) * (1.0 + 2.0 * skid);
  let comb: f32 = skid * 0.014 * (texLod(tDetail, vec2f(wq * 2.6 + 0.37, 0.61), M.e.z + 1.0).z - 0.5);
  return min(R + saturate(-R / 0.012) * ((lz - 0.5) * min(0.010, -0.3 * R) * (0.5 + 2.0 * pw) + lines + comb), 0.0);
}
fn frag(v: VOut) -> FOut {
  var o: FOut;
  // a pole's hole (d.w = 1): the narrow hole of the tip, and round it the dish the basket pressed with a groove at its rim. Written in the cut
  // pass only, over whatever lies there: the plant goes in beside the skis, on snow they have not been over
  if (v.d.w > 0.5) {
    if (M.p.z < 0.5) { discard; }
    let r: f32 = length(v.q.xy); if (r > 0.062) { discard; }
    let R: f32 = -0.07 * sq(1.0 - smoothstep(0.004, 0.016, r)) - 0.009 * (1.0 - smoothstep(0.035, 0.058, r)) - 0.011 * exp(-sq((r - 0.05) / 0.006));
    o.color = vec4f(vec3f(M.e.x + R * M.e.y), smoothstep(0.062, 0.05, r));
    return o;
  }
  // where this spot lay in the ski's frame a step ago: the ski came the stretch q.zw and turned by d.x, so each spot has its own way under it
  let p: vec2f = v.q.xy; let pe: vec2f = p + v.q.zw; let cs: vec2f = vec2f(cos(v.d.x), sin(v.d.x));
  let dl: vec2f = vec2f(cs.x * pe.x - cs.y * pe.y, cs.y * pe.x + cs.x * pe.y) - p; let ll: f32 = max(length(dl), 1e-4);
  let sphi: f32 = v.c.x; let cphi: f32 = max(sqrt(max(1.0 - sphi * sphi, 0.0)), 0.2);
  let ldr: f32 = v.e.y; let skid: f32 = min(1.0, abs(ldr) / 0.45); let pw: f32 = v.e.z; let sm: f32 = smoothstep(0.04, 0.16, abs(ldr));
  // two skis going sideways scrape ONE floor: at a depth that hangs on the snow alone (d.z), and at the height of the lower of the two.
  // The ski that comes second goes over what the first has scraped, and whatever it writes there replaces it: riding a little higher (the
  // inside ski of a hard turn), or a little later with less load on it, it laid a shallower floor on the first, and the line where the
  // two met was a saw with a tooth for every step
  let D: f32 = mix(v.c.z, v.d.z, sm); let lift: f32 = mix(v.c.w, min(v.c.w, v.d.y), sm);
  // (packed snow breaks off clean at the edge, powder slumps in; and a wall thinner than two texels or so would come out as a staircase)
  let soft: f32 = max(mix(0.007, 0.07, pw) + 0.01 * skid, mix(2.4, 2.0, M.p.w) * M.p.y);
  let tip: f32 = mix(skiFront(D), SKI_TIP, skid);          // (a ski going sideways clears the snow off its whole length)
  // the strip of the ski's width that is in the snow: from its low edge up to where the tilted base comes out of the surface. Of a ski going
  // sideways only the low edge counts: whichever way it slides, what it leaves is a floor at the depth of that edge, and the rest of the
  // base rides over snow the edge has yet to reach or has already scraped. So its strip is narrow (as narrow as the map can hold) and
  // flat. (Cut with its whole tilted width, the ski that comes second in a skid laid its base on the floor the first had scraped, and
  // raised it again: the map can only be overwritten, not lowered)
  let hw: f32 = SKI_HW * cphi; let sl: f32 = select(-1.0, 1.0, sphi >= 0.0);
  let tTop: f32 = max(clamp(cphi * (lift - D) / max(abs(sphi), 1e-3), -hw, hw), mix(-hw, hw - 2.5 * M.p.y, sm));
  let c: vec2f = vec2f(sl * 0.5 * (tTop + hw), 0.5 * (tip - SKI_TAIL)); let h: vec2f = vec2f(0.5 * (hw - tTop), 0.5 * (tip + SKI_TAIL));
  // (the line of a cut wanders a little, more in powder and where it was scraped. No more than that: bites out of a wall, seen from behind
  // in a low sun, are a row of dark teeth. And outward only: where it wandered inward, a thin strip going sideways left spots between two
  // of its steps that neither step took for its own, and they stood in the floor as specks. The lumps are read at a level whose texels
  // are the map's own size: one whose texels were twice that put a bead on the lip every two texels. And by the snow alone, the same
  // from every step: wandering more where the ski was sliding more, two steps that slid differently drew two lines for the one edge)
  let lump: vec4f = texLod(tDetail, v.w.zw / 1.6, M.e.z - 1.0);
  let rag: f32 = min(lump.z - 0.5, 0.0) * (0.008 + 0.04 * pw);
  // distance to what the ski covered this step (sd), and to all it has covered lately if it came straight (sdu, three metres back). What
  // lies beside a track is laid by its distance from the TRACK's edge (sdu), the same from every step that reaches it: measured from
  // each step's own outline it came out as a row of bumps, one a step
  let dle: vec2f = dl * (3.0 / ll);
  let sd: f32 = sweep(p, c, h, dl) + rag; let sdu: f32 = sweep(p, c, h, dle) + rag;
  let g: vec4f = under(p, dl, c, h); let q: vec2f = g.xy;
  // the floor of the track where the base itself never was: as low as the base stood where it came nearest (q), and behind the boot
  // flat (the middle of the ski has been there; the turned-up tail does not count). Walls stand on it; and so does the cut itself where
  // its line has wandered outside the strip (rag). (Those spots took the height of the turned-up shovel or tail of a ski long gone by,
  // which is where under() used to put "nearest": the wandering edge of every cut stood proud of the floor on the side the ski was
  // drifting from, a tooth for every lump. Under a low sun, the rungs of a ladder up the wall behind each tail)
  let Rq: f32 = floorAt(skiBase(vec2f(mix(q.x, sl * hw, sm), clamp(q.y, -0.3, tip)), sphi, cphi, lift, 0.0) - D, (q.x * dl.y - q.y * dl.x) / ll, lump.z, skid, pw);
  if (M.p.z > 0.5) {
    // (written whole, also where the base passed above the snow and R is 0: what was piled there before the ski came is gone)
    if (sd > 0.0) { discard; }
    var R: f32 = Rq;
    if (sd <= rag) { R = floorAt(lowest(g, sphi, cphi, lift, sl * hw, sm) - D, (q.x * dl.y - q.y * dl.x) / ll, lump.z, skid, pw); }
    o.color = vec4f(vec3f(M.e.x + R * M.e.y), 1.0);
    return o;
  }
  if (sd <= 0.0 || sdu <= 0.0) { discard; }       // (the cut itself; snow the ski has already been over: it lies behind it)
  // beside the cut: the wall up from the floor, and from its top outward the snow squeezed or pushed out, in lumps, falling away over the
  // width Ws. Written whole right up to the cut: a texel left half done there stands up as a tooth
  // (which side of the ski: the edge of it that came nearest, q. Not the side the spot lies on now: behind the tail of a ski going
  // sideways the snow just outside its track lies on the far side of the ski's own line, and taken for the trailing side it got no wall:
  // the edge of the scraped band came out as a row of pits.) A carving ski squeezes a low lip out on both sides, more on the side its
  // base faces (hi); a skidding one pushes a berm ahead of its leading side (sk) and leaves bare floor behind the other (tr)
  let sg: f32 = select(-1.0, 1.0, q.x > c.x);
  let hi: f32 = max(0.0, -sg * sphi); let sk: f32 = min(1.0, max(0.0, sg * ldr) / 0.45); let tr: f32 = min(1.0, max(0.0, -sg * ldr) / 0.10);
  // (powder is pressed down more than it is squeezed out: a deep trench with a low wide swell beside it, not a roll)
  let Hs: f32 = (D * mix(0.22, 0.10, pw) + D * 0.55 * hi * (1.0 - sk) + sk * (0.045 + 0.035 * pw)) * (1.0 - tr);
  let Ws: f32 = max(mix(0.022 + 0.07 * pw, 0.085, hi) + 0.17 * sk, 2.0 * M.p.y);
  let so: f32 = max(sdu - soft, 0.0);
  let val: f32 = mix(Rq, Hs * sq(saturate(1.0 - so / Ws)) * (0.7 + 0.6 * lump.z), smoothstep(0.0, soft, sdu));
  // nothing is piled round a shovel that rides up over the snow (one running under it has a face of snow before the boot, and that is
  // piled up like any other), nor by a ski that is not in the snow
  // (nor is anything written behind the side of a ski that is going sideways: what lies there is the floor it has just scraped, and, where
  // it is still swinging round, the track it came down. A wall laid there filled that track in, a dash of it every step)
  // (and the ski that slides toward its partner piles nothing on that side: the partner has just scraped there. v.c.y: where the partner's
  // boot is, to the right; far off if it is in the air)
  // Only the snow abeam the stretch come THIS step is written (near): beside the track further back it stays as the steps of that time
  // left it. They knew where the ski was; from here it can only be guessed, and while a skid is building up the guess is wrong: a berm
  // laid by it ran over the edge of the scraped floor and left that floor showing through in a row of holes. (Not half a step further
  // back either. In play every step is pressed in on its own, wall and then cut, and nothing cuts again what a later wall has covered:
  // a wall laid by guess beside the step before stood a few millimetres inside that step's cut, a bump at every lump of its edge)
  let bury: f32 = (SKI_TIP - tip) / (SKI_TIP - 0.30);
  let fol: f32 = select(0.0, min(1.0, max(0.0, sg * ldr) / 0.12), sg * v.c.y > 0.0 && abs(v.c.y) < 2.0);
  let near: f32 = 1.0 - smoothstep(0.0, 0.012, sd - sdu);
  // (for the same reason the side a ski is drifting AWAY from is written abeam its front part only. That edge of its track is drawn by
  // the front of the ski; beside the rest of its length lies floor the front has already been over, and how far that floor reaches can
  // only be guessed here. The other edge is drawn by the tail: whatever is laid on that side further forward, the tail will cut.)
  // (Abeam: by where the spot lies along the ski NOW, p. Where the ski came nearest to it, q, is always its front for a spot on that side)
  let fw: f32 = mix(1.0, smoothstep(tip - 0.75, tip - 0.45, p.y), smoothstep(0.0, 0.03, -sg * ldr));
  let a: f32 = (1.0 - smoothstep(0.85, 1.0, so / Ws)) * max(bury, saturate((tip - 0.12 - p.y) / 0.20)) * smoothstep(0.0, 0.004, h.x) * (1.0 - tr) * (1.0 - fol) * near * fw;
  if (a < 0.004) { discard; }
  o.color = vec4f(vec3f(M.e.x + val * M.e.y), a);
  return o;
}`;
// the light of the near map. R = how far each texel lies under the edge of the shadow of the snow that stands toward the sun (0.5 = on it,
// +-2 cm; M.s.z: the sun's height above the slope). That is a smooth field, a plane falling away from each crest, so its zero line, which
// is the shadow's edge, comes out clean at any size; the horizon's tangent, which this held first, jumps at a crest and its threshold came
// out in diamonds and ribs. G = how much sky is left. BA = the slopes of the snow (along world x and z).
const TRACK_BAKE_VS = `
fn vert(a: VIn) -> VOut {
  var v: VOut;
  let t: TrkV = trackQuad(a.a0, a.a1, a.vid, a.a4.w + 0.11, 0.25, 0.70);
  v.clip = t.clip; v.w = t.w;
  return v;
}`;
const TRACK_BAKE_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let uv: vec2f = v.w.xy; let tx: f32 = M.p.x * M.p.y; let hx: f32 = 0.5 * tx; let h0: f32 = texLod(tT, uv, 0.0).x;
  // the snow at this texel taken together with its neighbours (four taps on its corners: weights 1 2 1 each way), and its slopes from the
  // same four. The wall of a track is two or three texels wide and all of this is looked at from close by: slopes and sky taken texel by
  // texel came out as a row of beads along every wall that runs askew to the map
  let ha: f32 = texLod(tT, uv + vec2f(hx, hx), 0.0).x; let hb: f32 = texLod(tT, uv + vec2f(-hx, hx), 0.0).x;
  let hc: f32 = texLod(tT, uv + vec2f(hx, -hx), 0.0).x; let hd: f32 = texLod(tT, uv + vec2f(-hx, -hx), 0.0).x;
  let hs: f32 = 0.25 * (ha + hb + hc + hd);
  let sl: vec2f = vec2f((ha + hc) - (hb + hd), (ha + hb) - (hc + hd)) * (0.5 / M.p.y);
  // toward the sun in growing steps; the far ones read blurred levels (no crest slips between two steps, and a long shadow gets a soft end)
  var sdp: f32 = -1.0; var d: f32 = 0.75; let st: vec2f = M.s.xy * tx; let rise: f32 = M.s.z * M.p.y;
  for (var k: i32 = 0; k < 16; k++) {
    sdp = max(sdp, texLod(tT, uv + st * d, clamp(log2(d) - 2.0, 0.0, 3.0)).x - h0 - rise * d);
    d = d * 1.2 + 0.5;
  }
  // the sky: how far this spot lies under the snow round it, taken as the mean over a hand's width and over a foot's (two blurred levels of
  // the map: the same in every direction. Single taps to four sides came out as ribs along any wall that runs askew to the texels)
  let cav: f32 = max(texLod(tT, uv, 3.0).x - hs, 0.0) + max(texLod(tT, uv, 4.5).x - hs, 0.0);
  // (lightly: snow is so white that a hollow in it is filled with the light of its own walls. Any more and the floor of a track goes grey)
  o.color = vec4f(saturate(0.5 + sdp * 25.0), 1.0 / (1.0 + cav * 5.0), sl.x, sl.y);
  return o;
}`;
const TRACK_WIPE_FS = `
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let d: vec2f = (fract(v.uv - M.p.xy + 0.5) - 0.5) * M.p.z;      // metres from the skier, the short way round the tile
  if (dot(d, d) < M.p.w * M.p.w) { discard; }
  o.color = M.c;
  return o;
}`;
