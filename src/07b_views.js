// ---------------------------------------------------------------- other places to put the lens: first person, at snow level, above, either side, in front, far off; and looking around
// The chase camera (07_game.js) keeps running underneath; at its very end it calls G.viewCam, which may set the camera itself and return true.
// Every third-person view is the same rig with a different handful of numbers (where it stands round the skier, how far, how high, what it
// looks at, which lens), and those numbers are eased by springs: a change of view is always a swing round the figure, never a straight line
// through it. First person is a pose of its own, reached by rising over the helmet and settling into the eyes. Looking around (right-button
// drag, I J K L, two fingers) turns whichever of them is showing, and lets go by itself.
(() => {
  const G = Game, S = G.s, root = G.root;
  // az: where the lens stands (0 = behind the skier, + = to the skier's right, PI = in front); d: how far off, on the map; h: how high above the snow it
  // stands over; tf, th: the point it looks at (metres ahead of the skier, metres above the skier's feet); fov; rk: how far it banks with the skier's lean;
  // buzz: how much it rattles at speed (m); mg: the least it keeps above the snow; al: how much of the skier's height over the snow it rises
  // by in the air (and it stands back by up to a third as far again: a lens left on the snow loses a figure 3 m up in a quarter of a second)
  const VD = G.viewDefs = {
    low: { az: 0.82, d: 2.0, h: 0.27, tf: 3.2, th: 0.80, fov: 1.22, rk: 0.12, buzz: 0.006, mg: 0.20, al: 0.7 },
    high: { az: 0, d: 8.6, h: 5.6, tf: 8.5, th: 0.5, fov: 0.98, rk: 0.05, buzz: 0, mg: 0.5, al: 0.2 },
    left: { az: -1.36, d: 6.2, h: 1.05, tf: 1.6, th: 0.95, fov: 0.92, rk: 0, buzz: 0.002, mg: 0.4, al: 0.3 },
    right: { az: 1.36, d: 6.2, h: 1.05, tf: 1.6, th: 0.95, fov: 0.92, rk: 0, buzz: 0.002, mg: 0.4, al: 0.3 },
    front: { az: PI, d: 6.6, h: 0.9, tf: -0.4, th: 1.0, fov: 0.92, rk: -0.08, buzz: 0.002, mg: 0.4, al: 0.3 },
    far: { az: 2.6, d: 25, h: 1.8, tf: -0.6, th: 1.0, fov: 0.235, rk: 0, buzz: 0, mg: 0.8, al: 0.2 },
    // first person: the lens sits at the centre of the head (the helmet is only ever seen from inside, where it is not drawn). tilt: how far below
    // the snow ahead the eyes rest; tips: where the ski tips are held at the lowest (0 = middle of the picture, 1 = its bottom edge); sky: where the horizon may
    // climb to at the most (1 = the top edge); fovK: how much the lens opens with speed; rollK: how much of the body's lean tips the horizon; follow: how far the eyes go
    // with the skis; near: how close it draws (m); arm: how much higher and further forward the hands are carried, so that it sees them (m: up, ahead;
    // armT: that much more again in a full tuck, fists out in front of the chin); turn: how far the lens leaves the middle of the helmet as the head bows (m)
    fp: { fov: 1.52, fovK: 0.10, tilt: -0.16, tips: 0.90, sky: 0.76, rollK: 0.34, follow: 0.8, up: 0.03, near: 0.10, arm: [0.14, 0.14], armT: [-0.14, -0.03], turn: 0.15 },
    // the ski tips: the lens rides low over the skis, between the knees and the tips, behind a wide glass; nothing of the skier shows but the
    // two tips along the foot of the picture, and the snow they throw. The same numbers as first person, and: at: where it rides (m above the
    // snow under the skier, m ahead of the boots); side: how far it goes over with the body's lean (m for each radian: nothing now, see centre); edge: how much more than
    // elsewhere the edges of the picture should tear at speed (Game.viewEdge: for whoever draws that)
    // (VD.tips holds the numbers as they are now: they are eased toward whichever of the three versions below is chosen)
    tips: {},
  };
  // Where that lens rides is the owner's to choose (Variants 'tips'): a, down among the knees, the tips large, as in the picture the view was asked
  // from; b, at the thighs; c, in the helmet, first person without its hands. at: m above the snow under the skier, m ahead of the boots; pk: how far
  // from the helmet toward that place it goes (0 = it stays in the helmet); slideY, slideMax: where the tips are held in the picture and how far
  // the skis may be drawn forward to keep them there (07d_fpv.js); close: how far the skis are drawn in toward each other (m); gather, flat: how
  // much of what a turn does to them is taken back there (the wider stance and the lead of the inside ski; the angle they are set on edge);
  // centre: how far the lens goes across to keep the two tips either side of the middle; lens, blur: how near thrown snow is let come and how wide
  // a veil it is spread into close by (10_spray.js); sink: how far under soft snow the skis run (m)
  const TIPV = G.tipVersions = {
    a: { fov: 1.64, fovK: 0.10, tilt: 0.0, tips: 0.56, sky: 0.80, rollK: 0.31, follow: 0.9, at0: 0.44, at1: 0.42, pk: 1, side: 0, centre: 0.8, edge: 1.6, slideY: -0.50, slideMax: 0.30, close: 0.04, gather: 1, flat: 0.55, lens: 0.06, blur: 0.04, sink: 0.020 },
    b: { fov: 1.62, fovK: 0.10, tilt: -0.10, tips: 0.66, sky: 0.78, rollK: 0.32, follow: 0.9, at0: 0.68, at1: 0.36, pk: 1, side: 0, centre: 0.8, edge: 1.4, slideY: -0.58, slideMax: 0.34, close: 0.03, gather: 0.8, flat: 0.45, lens: 0.10, blur: 0.06, sink: 0.020 },
    c: { fov: 1.60, fovK: 0.10, tilt: -0.16, tips: 0.86, sky: 0.76, rollK: 0.34, follow: 0.8, at0: 1.45, at1: 0.20, pk: 0, side: 0, centre: 0, edge: 1.25, slideY: -0.64, slideMax: 0.46, close: 0.02, gather: 0.5, flat: 0.25, lens: 0.5, blur: 0.4, sink: 0.020 },
  };
  // (and where the hands are carried in a tuck from the helmet, Variants 'fptuck': a low, under the line of sight; b up in front of the chin, as a racer holds them)
  const TUCKV = G.tuckVersions = { a: [-0.14, -0.03], b: [-0.09, 0.01] };
  const hasV = typeof Variants !== 'undefined';
  if (hasV) { Variants.def('tips', '雪板尖机位', [['a', '贴板'], ['b', '大腿'], ['c', '头盔']], 'a'); Variants.def('fptuck', '俯冲手位', [['a', '压低'], ['b', '面前']], 'a'); }
  const tipV = () => TIPV[hasV && Variants.val.tips] || TIPV.a, tuckV = () => TUCKV[hasV && Variants.val.fptuck] || TUCKV.a;
  Object.assign(VD.tips, tipV()); VD.fp.armT = tuckV().slice();
  G.views = [{ id: 'chase', name: '追尾' }, { id: 'fp', name: '第一人称' }, { id: 'tips', name: '雪板尖' }, { id: 'low', name: '贴雪' }, { id: 'high', name: '俯瞰' }, { id: 'left', name: '左侧' }, { id: 'right', name: '右侧' }, { id: 'front', name: '正面' }, { id: 'far', name: '远摄' }];
  G.view = 'chase';

  const wrap = a => a - TAU * Math.round(a / TAU);
  const W = 12.5;                                             // every number of the rig is a critically damped spring: all but there in 0.4 s
  const KEYS = ['az', 'ld', 'h', 'tf', 'ts', 'th', 'fov', 'rk', 'ra', 'buzz', 'mg', 'al'];      // ld: log of d; ts: the looked-at point's sideways offset; ra: a bank carried over as it is
  const cur = {}, vel = {}, to = {}, tg = {}; for (const k of KEYS) cur[k] = vel[k] = to[k] = tg[k] = 0;
  const B = { init: false, px: 0, pz: 0, yaw: 0, cyaw: 0, lean: 0, kick: 0, gy: 0, gv: 0, gPrev: 0, gInit: true, pit: 0, pInit: true, res: [0, 0, 0], focus: 7.5, near0: 0, shk: 0, ak: 0, eA: 0, fl: 0, flV: 0, flOK: false };
  const look = G.look = { yaw: 0, pit: 0, ty: 0, tp: 0, idle: 9, hold: false, keys: {}, drag: null, touch: new Map(), two: false, on: false };
  // what is wanted, and where the rig has got to: tp = the third-person view underneath ('chase' = the chase camera itself once rigOn is false),
  // tw = seconds since the rig was sent back to the chase camera, fpc = how far the lens is into the helmet (0..1), tpc = how far it has gone on
  // from the helmet down to its place over the skis (0..1: the view of the ski tips is reached through the helmet, and left through it)
  let want = null, snap = false, tp = 'chase', rigOn = false, tw = 9, fpc = 0, fpOn = false, tpc = 0, tipOn = false;
  const mk = () => ({ p: [0, 0, 0], f: [0, 0, -1], fov: 1, roll: 0 });
  const D = mk(), R = mk(), C = mk(), O = mk(), CH = mk(), rel = mk(); let relOK = false;

  G.setView = function (id, instant) {
    if (!G.views.some(v => v.id === id)) return G.view;
    if (instant) snap = true;
    if (id !== G.view) { G.view = id; want = id; }
    return id;
  };
  G.nextView = function (dir) { const n = G.views.length, i = G.views.findIndex(v => v.id === G.view); return G.setView(G.views[((i + (dir < 0 ? -1 : 1)) % n + n) % n].id); };

  // ---- keys and pointers. (The steering in 07_game.js takes any button and any finger as its own drag: a look gesture is kept from it here.)
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || ''))) return;
    const c = e.code;
    if (c === 'KeyI' || c === 'KeyJ' || c === 'KeyK' || c === 'KeyL') { look.keys[c] = true; return; }
    if (e.repeat) return;
    if (c === 'KeyV') G.nextView(e.shiftKey ? -1 : 1);
    else { const m = /^(?:Digit|Numpad)([1-9])$/.exec(c); if (m && G.views[m[1] - 1]) G.setView(G.views[m[1] - 1].id); }
  });
  addEventListener('keyup', e => { look.keys[e.code] = false; });
  addEventListener('blur', () => { look.keys = {}; look.drag = null; look.touch.clear(); look.two = false; });
  // the picture is taken hold of and pulled: drag right and the view turns left, drag down and it tips up (a whole width is a little over half a turn)
  const pull = (dx, dy) => { const s = 3.6 / Math.max(View.w || innerWidth, 320); look.ty -= dx * s; look.tp += dy * s; look.idle = 0; };
  const noSteer = () => { if (typeof Input !== 'undefined') Input.drag = null; };
  // Fingers (touch: id -> [x, y, is it the one that steers, when it came down, how far it has travelled]). The first finger on the picture steers, as it
  // always did. A finger added while that one is steering turns the view, and the first goes on steering; two put down together (the first not yet a quarter
  // of a second old and not yet moved) both turn the view, and the steering is left to the tilt of the phone or the keys. look.two: some finger is turning the view
  const fingers = () => { let n = 0; for (const q of look.touch.values()) if (!q[2]) n++; return n; };
  addEventListener('pointerdown', e => {
    const cv = document.getElementById('view'); if (!cv || e.target !== cv) return;
    if (e.pointerType === 'touch') {
      if (e.isPrimary) look.touch.clear();                              // (the first finger of a fresh touch: whatever was still on the books is gone)
      let st = null; for (const q of look.touch.values()) if (q[2]) st = q;
      look.touch.set(e.pointerId, [View.x(e), View.y(e), !st, e.timeStamp, 0]);
      if (st) {
        e.stopPropagation();                                            // (the steering never hears of this finger)
        if (look.touch.size === 2 && e.timeStamp - st[3] < 250 && st[4] < 14) { st[2] = false; noSteer(); }
      }
      look.two = fingers() > 0;
    } else if (e.button === 2) { look.drag = { id: e.pointerId, x: View.x(e), y: View.y(e) }; try { cv.setPointerCapture(e.pointerId); } catch (_) { } e.stopPropagation(); }
  }, true);
  addEventListener('pointermove', e => {
    const d = look.drag, q = look.touch.get(e.pointerId);
    if (d && e.pointerId === d.id) { const x = View.x(e), y = View.y(e); pull(x - d.x, y - d.y); d.x = x; d.y = y; }
    else if (q) { const x = View.x(e), y = View.y(e), n = fingers(); q[4] += Math.abs(x - q[0]) + Math.abs(y - q[1]); if (!q[2] && n) pull((x - q[0]) / n, (y - q[1]) / n); q[0] = x; q[1] = y; }
  }, true);
  const lift = e => { if (look.drag && e.pointerId === look.drag.id) look.drag = null; if (look.touch.delete(e.pointerId)) look.two = fingers() > 0; };
  addEventListener('pointerup', lift, true); addEventListener('pointercancel', lift, true);

  // the view comes back by itself: it is held for 0.8 s after the last touch of the controls, then eased home
  function lookStep(rdt, fp) {
    const L = look, kx = (L.keys.KeyL ? 1 : 0) - (L.keys.KeyJ ? 1 : 0), ky = (L.keys.KeyI ? 1 : 0) - (L.keys.KeyK ? 1 : 0);
    if (kx || ky) { L.ty += kx * 1.9 * rdt; L.tp += ky * 1.3 * rdt; }
    if (kx || ky || L.drag || L.two || L.hold) L.idle = 0; else L.idle += rdt;
    // (round the figure almost all the way; from inside the helmet as far as a neck turns)
    // (and no further down to the side than clears the shoulder)
    const my = fp ? 0.95 : 2.9, up = fp ? 0.7 : 0.95, dn = fp ? 0.7 * Math.sqrt(Math.max(1 - L.ty * L.ty / 0.92, 0.02)) : 1.15;
    L.ty = clamp(L.ty, -my, my); L.tp = clamp(L.tp, -dn, up);
    if (L.idle > 0.8) { const r = 5.5 * smooth(0.8, 1.15, L.idle); L.ty = damp(L.ty, 0, r, rdt); L.tp = damp(L.tp, 0, r, rdt); }
    L.yaw = damp(L.yaw, L.ty, 16, rdt); L.pit = damp(L.pit, L.tp, 16, rdt);
    if (L.idle > 0.8 && Math.abs(L.ty) + Math.abs(L.tp) + Math.abs(L.yaw) + Math.abs(L.pit) < 4e-4) L.ty = L.tp = L.yaw = L.pit = 0;
    L.on = L.yaw !== 0 || L.pit !== 0;
  }

  // ---- the snow under a lens: the highest of the fine surface there and a step either way (what is drawn is a 1 m mesh of it)
  function snow(x, z) { return Math.max(Course.height(x, z, 0.5), Course.height(x + 0.6, z, 0.5), Course.height(x - 0.6, z, 0.5), Course.height(x, z + 0.6, 0.5), Course.height(x, z - 0.6, 0.5)); }
  // (what the rig's height is counted from: the same, but never under the broad lie of the slope, and eased by a spring further down)
  const base = (x, z) => Math.max(Course.height(x, z, 2), snow(x, z));
  // y held above lo, with a smooth join k wide
  const over = (y, lo, k) => { const d = y - lo; return d >= k ? y : d <= -k ? lo : lo + (d + k) * (d + k) / (4 * k); };
  const setF = (o, yaw, pit) => { const cp = Math.cos(pit); o.f[0] = Math.sin(yaw) * cp; o.f[1] = Math.sin(pit); o.f[2] = -Math.cos(yaw) * cp; };
  const copy = (o, a) => { o.p[0] = a.p[0]; o.p[1] = a.p[1]; o.p[2] = a.p[2]; o.f[0] = a.f[0]; o.f[1] = a.f[1]; o.f[2] = a.f[2]; o.fov = a.fov; o.roll = a.roll; };
  // between two poses (directions are turned, not cut across)
  function mix(o, a, b, t) {
    for (let i = 0; i < 3; i++) o.p[i] = a.p[i] + (b.p[i] - a.p[i]) * t;
    const ya = Math.atan2(a.f[0], -a.f[2]), pa = Math.asin(clamp(a.f[1], -1, 1)), yb = Math.atan2(b.f[0], -b.f[2]), pb = Math.asin(clamp(b.f[1], -1, 1));
    setF(o, ya + wrap(yb - ya) * t, pa + (pb - pa) * t); o.fov = a.fov + (b.fov - a.fov) * t; o.roll = a.roll + (b.roll - a.roll) * t;
  }

  // ---- the third-person rig
  // the numbers that would put the rig exactly where pose a is now
  function eqv(a, o) {
    const sy = Math.sin(B.yaw), cy = Math.cos(B.yaw), p = root.pos, ox = a.p[0] - p[0], oz = a.p[2] - p[2], d = Math.hypot(ox, oz);
    o.az = Math.atan2(ox * cy + oz * sy, -ox * sy + oz * cy); o.ld = Math.log(Math.max(d, 0.3)); o.h = a.p[1] - base(a.p[0], a.p[2]);
    const L = d + 3, tx = a.p[0] + a.f[0] * L - p[0], tz = a.p[2] + a.f[2] * L - p[2];
    o.tf = tx * sy - tz * cy; o.ts = tx * cy + tz * sy; o.th = a.p[1] + a.f[1] * L - p[1];
    o.fov = a.fov - B.kick; o.rk = 0; o.ra = a.roll; o.buzz = 0; o.mg = 0; o.al = 0;
  }
  function rigXZ(o) { const sy = Math.sin(B.yaw), cy = Math.cos(B.yaw), d = Math.exp(cur.ld) * (1 + 0.55 * cur.al * B.ak), ca = Math.cos(cur.az), sa = Math.sin(cur.az); o[0] = root.pos[0] + (-sy * ca + cy * sa) * d; o[2] = root.pos[2] + (cy * ca + sy * sa) * d; }
  // where the rig stands and what it looks at, from its numbers as they are (nothing is advanced here)
  function rigPose(o) {
    rigXZ(o.p); const x = o.p[0], z = o.p[2], sy = Math.sin(B.yaw), cy = Math.cos(B.yaw), p = root.pos;
    // (on its way from one view to another it arcs up a little, the more the faster it travels: skimming bumps at that pace it would be knocked about by them)
    const lift = 1.5 * (1 - Math.exp(-Math.exp(cur.ld) * Math.hypot(vel.az, vel.ld) / 30));
    o.p[1] = over(B.gy + cur.h + lift + cur.al * B.eA, (B.flOK ? B.fl : snow(x, z)) + cur.mg, 0.15);
    const tx = p[0] + sy * cur.tf + cy * cur.ts - x, tz = p[2] - cy * cur.tf + sy * cur.ts - z, ty = p[1] + cur.th - o.p[1];
    o.yawRaw = Math.atan2(tx, -tz); o.pitRaw = Math.atan2(ty, Math.hypot(tx, tz) || 1e-3);
    o.fov = cur.fov + B.kick; o.roll = cur.ra - B.lean * cur.rk * (1 - B.ak);       // (no banking with the body in the air: a horizon that rolls with a lean nobody can see reads as the camera falling over)
  }
  // take the rig to pose a as it stands (so that whatever happens next starts from the picture on the screen)
  function adopt(a) {
    eqv(a, cur); for (const k of KEYS) { vel[k] = 0; tg[k] = cur[k]; } B.flOK = false;
    B.gy = base(a.p[0], a.p[2]); B.gv = 0; B.gPrev = B.gy; B.gInit = false; B.pit = Math.asin(clamp(a.f[1], -1, 1)); B.pInit = false;
    rigPose(R); for (let i = 0; i < 3; i++) B.res[i] = a.p[i] - R.p[i];       // (what the snow limit moved, if anything, is let go of over a quarter of a second)
  }
  function target(o) {
    const v = VD[tp]; o.az = v.az; o.ld = Math.log(v.d); o.h = v.h; o.tf = v.tf; o.ts = 0; o.th = v.th; o.fov = v.fov; o.rk = v.rk; o.ra = 0; o.buzz = v.buzz; o.mg = v.mg; o.al = v.al || 0;
  }
  const _xz = [0, 0, 0];
  function rigStep(dt, rdt, o) {
    if (tp === 'chase') eqv(CH, to); else target(to);
    // in the air: how airborne (eased: it stands back over the takeoff and comes in again after the landing over about a second), and the
    // skier's height over the snow (the snow as the flight takes it: it falls away behind a lip like a thing dropped, never in a step)
    { const fl = G.flight || {}, ak = S.airK || 0; B.ak = dt > 0 ? damp(B.ak, ak, ak > B.ak ? 5 : 2.2, dt) : ak;
      const eT = Math.max(0, (fl.fr || 0) - (fl.sg || 0)) * sat(2 * ak); B.eA = dt > 0 ? damp(B.eA, eT, 9, dt) : eT; }
    const e = Math.exp(-W * rdt), el = Math.exp(-26 * rdt);
    for (const k of KEYS) {
      // (what it is sent to arrives over a few frames: a spring let go all at once starts with a jolt)
      let q = tg[k] - to[k]; if (k === 'az') q = wrap(q); const g = tg[k] = to[k] + q * el;
      let x = cur[k] - g; if (k === 'az') x = wrap(x);
      const b = vel[k] + W * x; cur[k] = g + (x + b * rdt) * e; vel[k] = (vel[k] - W * b * rdt) * e;
    }
    cur.az = wrap(cur.az);
    // height: the snow under the lens, followed by a spring that tracks a steady descent exactly and rounds the bumps off
    rigXZ(_xz); const g = base(_xz[0], _xz[2]);
    if (B.gInit || dt <= 0) { B.gy = g; B.gv = 0; B.vT = null; B.gInit = false; }
    else {
      // (the rate the snow is falling at is let change by no more than 4 g: over a lip, or the side wall of a kicker, the snow under the lens
      // drops half a metre between two frames, and taken as a rate that kicked the lens down a quarter of a metre in one frame)
      const vR = clamp((g - B.gPrev) / dt, -40, 40), w = 7.5; B.vT = (B.vT == null ? vR : B.vT + clamp(vR - B.vT, -40 * dt, 40 * dt)); const vT = B.vT;
      B.gv += (w * w * (g - B.gy) + 2 * w * (vT - B.gv)) * dt; B.gy += B.gv * dt; }
    B.gPrev = g;
    // (the least height over the snow is kept from a floor that rises with the snow at once but, where the snow drops from under the lens
    // - the side wall of a kicker, the lip itself - comes down after it like a thing dropped: that floor fell a quarter metre in one frame at takeoff)
    { const fT = snow(_xz[0], _xz[2]); if (!B.flOK || dt <= 0) { B.fl = fT; B.flV = 0; B.flOK = true; } else { const n = B.fl + (B.flV - 20 * dt) * dt; if (n <= fT) { B.flV = clamp((fT - B.fl) / dt, -40, 40); B.fl = fT; } else { B.flV -= 20 * dt; B.fl = n; } } }
    rigPose(o);
    { const e = Math.exp(-9 * rdt); for (let i = 0; i < 3; i++) { B.res[i] *= e; o.p[i] += B.res[i]; } }
    // it looks at a point that rides with the skier: the tilt that takes is eased (the feet chatter over bumps; the frame should not)
    if (B.pInit) { B.pit = o.pitRaw; B.pInit = false; } else B.pit = damp(B.pit, o.pitRaw, 5, dt);
    // ...but in the air the body rises faster than that tilt follows: there the frame holds the skier, boots and head both inside the
    // middle three quarters of its height, and short of that the lens tips up no further than leaves the horizon in the lower part of the
    // picture. The limits are rounded where they take hold, and what they did is let go of at the tilt's own pace after the landing
    if (Math.max(B.ak, S.airK || 0) > 1e-3) {
      const fl = G.flight || {}, p = root.pos, fy = fl.fr != null ? fl.fr : p[1], hd = Math.hypot(p[0] - o.p[0], p[2] - o.p[2]) || 1, th = Math.tan(o.fov / 2), a = Math.atan(0.72 * th);
      const sm = (u, v, r) => 0.5 * (u + v + Math.sqrt((u - v) * (u - v) + r * r)), sn = (u, v, r) => 0.5 * (u + v - Math.sqrt((u - v) * (u - v) + r * r));
      const pMax = Math.atan2(fy - 0.15 - o.p[1], hd) + a, pMin = Math.atan2(fy + 1.75 - o.p[1], hd) - a;
      const q = sm(sn(B.pit, Math.atan(0.72 * th), 0.04), Math.min(pMin, pMax), 0.03), g = sn(q, pMax, 0.03);
      B.pit += (g - B.pit) * smooth(0, 0.25, Math.max(B.ak, S.airK || 0));
    }
    setF(o, o.yawRaw, B.pit);
  }
  // put the rig straight where its view wants it (only ever done while none of it shows)
  function place() { target(to); for (const k of KEYS) { cur[k] = tg[k] = to[k]; vel[k] = 0; } cur.az = wrap(cur.az); B.gInit = true; B.pInit = true; B.flOK = false; B.res[0] = B.res[1] = B.res[2] = 0; }

  // ---- first person
  const F = { init: true, yaw: 0, pit: 0, roll: 0, hy: 0, hv: 0, hPrev: 0 }, pz = {}, HEAD0 = [0, 1.45, -0.2];
  const FV = {}, FK = ['fov', 'fovK', 'tilt', 'tips', 'sky', 'rollK', 'follow'];
  function fpPose(dt, o, cyw, vyaw, k, tk) {
    const v = FV, p = root.pos; for (const q of FK) v[q] = lerp(VD.fp[q], VD.tips[q], tk);
    // where the head is this frame (the figure is only posed after the camera, so its own record of itself is a frame old: 0.4 m at speed)
    // (should the figure ever be put together some other way, the view still has to stand: then the head is taken where the figure last had it, or where a head is)
    let sv = null, J = null; try { sv = Skier.solve(Object.assign(pz, Skier.P0, G.pose)); J = sv.J.head; } catch (_) { sv = null; }
    if (!J) { let w = null; try { w = Skier.world; } catch (_) { } J = w && w.J && w.J.head || HEAD0; sv = null; }
    const Y = v3.norm(root.nrm), X = v3.norm(v3.cross(Y, v3.mul(root.fwd, -1))), Z = v3.cross(X, Y);
    // (the place over the skis rides with the snow under the skier and goes a little way over with the body in a turn)
    const T = VD.tips, tq = tk * T.pk, tx = T.side * clamp(G.pose.lean || 0, -1.2, 1.2), jx = lerp(J[0], tx, tq), jy = lerp(J[1] + VD.fp.up, T.at0, tq), jz = lerp(J[2], -T.at1, tq);
    const hx = p[0] + X[0] * jx + Y[0] * jy + Z[0] * jz, hy = p[1] + X[1] * jx + Y[1] * jy + Z[1] * jz, hz = p[2] + X[2] * jx + Y[2] * jy + Z[2] * jz;
    // the eyes look down the valley and go most of the way with the skis, a little late (the head stays quiet while the skis swing under it)
    const yT = B.cyaw + clamp((vyaw - B.cyaw) * v.follow, -1.0, 1.0);
    // ...and rest on the snow a few lengths ahead, further off the faster it goes: so they drop over a crest and into a landing, and lift at a rise
    const Lg = 10 + 0.3 * S.speed, qy = F.init ? yT : F.yaw, gq = Course.height(hx + Math.sin(qy) * Lg, hz - Math.cos(qy) * Lg, 2);
    // ...and no higher than keeps the tips of the skis just inside the bottom of the picture (standing tall on a steep pitch they would drop out of it),
    // as long as that leaves a band of sky along the top
    // (how far below the level the tips lie is counted along the way the eyes face: with the head low and forward over them, or the skis swung
    // across, they are much further down the picture than their bare distance says)
    let ta = 0, tn2 = 0; const fv = v.fov + v.fovK * k + B.kick, th = Math.tan(fv / 2), qs = Math.sin(qy), qc = Math.cos(qy), first = F.init || dt <= 0, mt = [0, 0, 0];       // (mt: half way between the two tips, from the lens)
    for (let i = 0; i < 2; i++) {
      const m = sv && sv.F && Skier.B && sv.F[i ? Skier.B.footR : Skier.B.footL]; if (!m) { ta += 0.52; continue; }
      const a = m[12] + m[4] * 0.125 - m[8] * 0.96, b = m[13] + m[5] * 0.125 - m[9] * 0.96, c = m[14] + m[6] * 0.125 - m[10] * 0.96;
      const dx = p[0] + X[0] * a + Y[0] * b + Z[0] * c - hx, dy = p[1] + X[1] * a + Y[1] * b + Z[1] * c - hy, dz = p[2] + X[2] * a + Y[2] * b + Z[2] * c - hz; ta += 0.5 * Math.atan2(-dy, Math.max(dx * qs - dz * qc, 0.05));
      // (for that the tips are taken at the snow, on the skis' own lines: where their upper ends are goes over with their edges)
      const ex = m[4] * 0.125, ey = m[5] * 0.125, ez = m[6] * 0.125;
      mt[0] += 0.5 * (dx - X[0] * ex - Y[0] * ey - Z[0] * ez); mt[1] += 0.5 * (dy - X[1] * ex - Y[1] * ey - Z[1] * ez); mt[2] += 0.5 * (dz - X[2] * ex - Y[2] * ey - Z[2] * ez); tn2++;
    }
    const pT = clamp(Math.max(Math.min(Math.atan2(gq + 0.3 - hy, Lg) + v.tilt, Math.atan(v.tips * th) - ta), -Math.atan(v.sky * th)), -1.0, 0.3);
    if (F.init || dt <= 0) { F.yaw = yT; F.pit = pT; F.roll = -G.pose.lean * v.rollK; F.hy = hy; F.hv = 0; F.init = false; }
    else {
      F.yaw = damp(F.yaw, yT, 4.5, dt); F.pit = damp(F.pit, pT, 3.2, dt); F.roll = damp(F.roll, -G.pose.lean * v.rollK, 6, dt);
      // the neck takes the last of the chatter out (never by more than stays inside the helmet)
      const vT = clamp((hy - F.hPrev) / dt, -40, 40), w = 9; F.hv += (w * w * (hy - F.hy) + 2 * w * (vT - F.hv)) * dt; F.hy = clamp(F.hy + F.hv * dt, hy - 0.05, hy + 0.05);
    }
    F.hPrev = hy;
    // a helmet camera shivers a little at speed and takes a landing in the neck: both as turns of the head, not as travel
    const sh = 0.0022 * k * k + 0.28 * B.shk, t = G.t, ly = clamp(look.yaw, -0.95, 0.95), al = Math.abs(ly);
    // (looking to the side, the eyes come up off the snow toward the far slope)
    const yw = F.yaw + ly + vnoise1(t * 15, 6) * sh, pt = clamp(F.pit * (1 - 0.5 * smooth(0.2, 0.95, al)) + look.pit + vnoise1(t * 17, 7) * sh, -1.3, 1.0);
    setF(o, yw, pt);
    // a head that bows or turns carries its eyes out over the chest: the further below the line of the skis they point (looking down at them, or at a
    // landing coming up) or the further round to the side, the further the lens leaves the middle of the helmet for the goggles, and the skier's own collar
    // and shoulders stay behind it (seen from the middle they would be cut open by the near plane, right under the lens)
    const tn = VD.fp.turn * (1 - tq) * Math.max(smooth(0.3, 0.85, Math.asin(clamp(root.fwd[1], -1, 1)) - pt), smooth(0.05, 0.5, al)), fl = Math.hypot(root.fwd[0], root.fwd[2]) || 1;
    o.p[0] = hx + root.fwd[0] / fl * tn; o.p[1] = F.hy; o.p[2] = hz + root.fwd[2] / fl * tn;
    o.fov = fv; o.roll = F.roll * (1 - 0.6 * smooth(0.3, 0.95, al)) + vnoise1(t * 13, 8) * sh * 0.6;
    // the lens over the skis rides between them: it is moved across (along the skier's own left-to-right) until the two tips stand either side of the
    // middle of the picture's foot, so that when it tips with a turn it is about them that it tips, and the swing of the skis under a lens that turns
    // a little later than they do does not carry them off to one side. (Most of the way, and a tenth of a second late: what the skis do stays theirs)
    let cx = 0;
    if (tq > 0 && tn2 === 2 && T.centre > 0) {
      const f = o.f, rl = Math.hypot(f[0], f[2]) || 1, r0 = [-f[2] / rl, 0, f[0] / rl], u0 = v3.cross(r0, f), cr = Math.cos(o.roll), sr = Math.sin(o.roll), r = [r0[0] * cr + u0[0] * sr, r0[1] * cr + u0[1] * sr, r0[2] * cr + u0[2] * sr];
      const den = v3.dot(X, r); if (Math.abs(den) > 0.3) cx = clamp((mt[0] * r[0] + (mt[1] + hy - F.hy) * r[1] + mt[2] * r[2]) / den, -0.5, 0.5) * T.centre * tq;
    }
    F.cx = first ? cx : damp(F.cx || 0, cx, 10, dt);
    o.p[0] += X[0] * F.cx; o.p[1] += X[1] * F.cx; o.p[2] += X[2] * F.cx;
  }
  // in first person the hands are carried where a helmet camera sees them: a little higher and further forward, and in a tuck out in front of the chin.
  // It is added to what the game asked of the arms this frame, after it asked: nothing of it is kept (and should a pose ever not be asked afresh, what was
  // added to it the frame before is first taken off again)
  const AR = [[0, 0, 0, 0], [0, 0, 0, 0]]; let armsOn = false;
  function fpArms(w) {
    const ps = G.pose, v = VD.fp, tk = sat(ps.tuck || 0), ay = (v.arm[0] + v.armT[0] * tk) * w, az = -(v.arm[1] + v.armT[1] * tk) * w;
    for (let i = 0; i < 2; i++) {
      const a = i ? ps.armR : ps.armL, m = AR[i]; if (!a || !(a.length >= 3)) continue;
      if (a[1] === m[2] && a[2] === m[3]) { a[1] = m[0]; a[2] = m[1]; }
      m[0] = a[1]; m[1] = a[2]; a[1] += ay; a[2] += az; m[2] = a[1]; m[3] = a[2];
    }
    armsOn = w > 0;
  }

  function reinit() { B.init = true; B.cyaw = B.yaw = Course.yawAt(-S.p[2]); B.lean = S.lean; B.kick = G.fovKick; B.gInit = true; B.pInit = true; B.flOK = false; B.res[0] = B.res[1] = B.res[2] = 0; F.init = true; relOK = false; if (rigOn && tp !== 'chase') place(); else { rigOn = false; tw = 9; } }

  G.viewCam = function (dt, cam, pos, f) {
    const p = root.pos, sp = S.speed, k = smooth(6, 30, sp), rdt = Math.min(dt / (G.timeScale > 0.02 ? G.timeScale : 1), 0.1);
    if (!B.init || Math.hypot(p[0] - B.px, p[2] - B.pz) > 15) reinit();           // the first frame, or the skier has been put somewhere else
    B.px = p[0]; B.pz = p[2];
    // the frame the third-person views are laid out in: down the valley, going a little over half way with the skier's turns (as the chase camera does)
    const cyw = Course.yawAt(-S.p[2]), vyaw = sp > 1.5 ? Math.atan2(S.v[0], -S.v[2]) : cyw;
    B.cyaw = damp(B.cyaw, cyw, 1.3, dt); B.yaw = damp(B.yaw, B.cyaw + clamp((vyaw - B.cyaw) * 0.55, -0.7, 0.7), 2.4, dt);
    B.lean = damp(B.lean, S.lean, 5, dt); B.kick = damp(B.kick, G.fovKick, 3, dt); B.shk = damp(B.shk, G.shake, 30, dt);       // (a jolt comes on over a frame or two, not in one)
    lookStep(rdt, fpOn);
    // the chase camera as it stands this frame
    const shc = 0.010 * k * k + G.shake;
    CH.p[0] = pos[0]; CH.p[1] = pos[1]; CH.p[2] = pos[2]; CH.f[0] = f[0]; CH.f[1] = f[1]; CH.f[2] = f[2]; CH.fov = cam.fov > 0 ? cam.fov : 1; CH.roll = (cam.roll || 0) + vnoise1(G.t * 13, 3) * shc * 0.5;
    // ---- a change of view asked for since the last frame
    if (snap) { want = G.view; fpc = want === 'fp' || want === 'tips' ? 1 : 0; tpc = want === 'tips' ? 1 : 0; F.init = true; }
    if (want) {
      if (want === 'fp' || want === 'tips') { if (fpc <= 0) F.init = true; fpOn = true; tipOn = want === 'tips'; }
      else {
        fpOn = false; tipOn = false;
        if (fpc >= 0.999 || snap) { tp = want; rigOn = want !== 'chase'; tw = 9; if (rigOn) place(); }           // from inside the helmet none of the rig shows: it is simply put where it is wanted
        else if (want === 'chase') { if (rigOn && tp !== 'chase') tw = 0; tp = 'chase'; }
        else {
          if (!rigOn) adopt(CH); else if (tp === 'chase' && tw > 0.2 && relOK) { for (let i = 0; i < 3; i++) rel.p[i] += p[i]; adopt(rel); }
          tp = want; rigOn = true;
        }
      }
      want = null;
    }
    snap = false;
    // (down to the skis only once the lens is nearly in the helmet, and out of the helmet only once it is most of the way back up from them)
    tpc = clamp(tpc + (tipOn && fpc > 0.6 ? rdt : -rdt) / 0.36, 0, 1);
    fpc = clamp(fpc + (fpOn || tpc > 0.35 ? rdt : -rdt) / 0.42, 0, 1);
    const tk = smooth(0, 1, tpc);
    // (a version chosen while it shows is gone over to in a third of a second, not jumped to)
    { const tv = tipV(), T = VD.tips, e = 1 - Math.exp(-7 * rdt); for (const q in tv) T[q] += (tv[q] - T[q]) * e; const a = tuckV(), b = VD.fp.armT; b[0] += (a[0] - b[0]) * e; b[1] += (a[1] - b[1]) * e; }
    // how much more than elsewhere this view would have the picture's edges tear at speed (1 = as everywhere)
    G.viewEdge = 1 + (VD.tips.edge - 1) * tk * smooth(0.7, 1, fpc);
    // nothing of ours showing: the chase camera goes on as it was
    const rc = Render.cam; if (!B.near0) B.near0 = rc.near || 0.25;
    if (armsOn || fpc > 0) fpArms(smooth(0, 1, fpc));
    if (typeof Fpv !== 'undefined') Fpv.tick(dt, fpc, tk);       // (the arms, poles and skis made for these two views: 07d_fpv.js)
    if (!rigOn && fpc <= 0 && !look.on) { if (typeof App !== 'undefined') App.state.focus = 0; B.focus = 7.5; relOK = false; rc.near = B.near0; return false; }
    // ---- third person: the chase camera, the rig, or (on the way home) the rig handing over to the chase camera
    if (!rigOn) copy(D, CH);
    else {
      rigStep(dt, rdt, R);
      // (its own small rattle, and the same landing jolt the chase camera takes)
      const sh = cur.buzz * k * k + B.shk, t = G.t, rx = Math.cos(R.yawRaw), rz = Math.sin(R.yawRaw), ox = vnoise1(t * 17, 4) * sh, oy = vnoise1(t * 19, 5) * sh;
      R.p[0] += rx * ox; R.p[1] += oy; R.p[2] += rz * ox; R.roll += vnoise1(t * 13, 9) * sh * 0.5;
      if (tp === 'chase') { tw += rdt; mix(D, R, CH, smooth(0.28, 0.6, tw)); if (tw >= 0.6) rigOn = false; } else copy(D, R);
    }
    for (let i = 0; i < 3; i++) rel.p[i] = D.p[i] - p[i]; rel.f[0] = D.f[0]; rel.f[1] = D.f[1]; rel.f[2] = D.f[2]; rel.fov = D.fov; rel.roll = D.roll; relOK = true;
    // looking around: the whole pose is swung about the skier (the figure keeps its place in the frame, the world goes round behind it)
    if (look.on && fpc < 1) {
      const cx = p[0], cy = p[1] + 0.9, cz = p[2], a = look.yaw, ca = Math.cos(a), sa = Math.sin(a);
      let x = D.p[0] - cx, y = D.p[1] - cy, z = D.p[2] - cz, fx = D.f[0], fy = D.f[1], fz = D.f[2], q;
      q = x * ca - z * sa; z = x * sa + z * ca; x = q; q = fx * ca - fz * sa; fz = fx * sa + fz * ca; fx = q;
      // (tipping up swings the lens down behind the figure until the snow stops it; after that only the view tips)
      const p0 = Math.asin(clamp(fy, -1, 1)), b = clamp(p0 + look.pit, -1.35, 1.2) - p0, cb = Math.cos(b), sb = Math.sin(b), fl = Math.hypot(fx, fz) || 1, ax = -fz / fl, az = fx / fl;
      const rot = (vx, vy, vz, o) => { const d = (ax * vx + az * vz) * (1 - cb); o[0] = vx * cb + (-az * vy) * sb + ax * d; o[1] = vy * cb + (az * vx - ax * vz) * sb; o[2] = vz * cb + (ax * vy) * sb + az * d; };
      rot(x, y, z, D.p); D.p[0] += cx; D.p[1] += cy; D.p[2] += cz; rot(fx, fy, fz, D.f);
    }
    // ---- never under the snow, never in the figure
    { const lk = rigOn ? 1 : Math.min(1, 6 * (Math.abs(look.yaw) + Math.abs(look.pit))), mg = rigOn ? cur.mg : 0.35;
      if (lk > 0) {
        const y = over(D.p[1], (rigOn && B.flOK ? B.fl : snow(D.p[0], D.p[2])) + mg, 0.15);       // (the rig's floor, which falls after a lip like a weight: see rigStep) D.p[1] += (y - D.p[1]) * lk;
        const hx = D.p[0] - p[0], hz = D.p[2] - p[2], hd = Math.hypot(hx, hz) || 1e-3, need = over(hd, 1.0 * smooth(2.6, 2.0, D.p[1] - p[1]), 0.2);
        if (need > hd) { D.p[0] = p[0] + hx / hd * (hd + (need - hd) * lk); D.p[2] = p[2] + hz / hd * (hd + (need - hd) * lk); }
      }
      // (and whatever stopped the lens, the figure stays in the picture: the view tips no further than leaves the skier's hips inside it)
      if (look.on) {
        const dx = p[0] - D.p[0], dy = p[1] + 0.9 - D.p[1], dz = p[2] - D.p[2], e = Math.atan2(dy, Math.hypot(dx, dz)), a = Math.atan(0.78 * Math.tan(D.fov / 2)), pv = Math.asin(clamp(D.f[1], -1, 1));
        if (pv > e + a || pv < e - a) setF(D, Math.atan2(D.f[0], -D.f[2]), clamp(pv, e - a, e + a));
      } }
    // ---- first person, and the way into it: up over the helmet, then down into the eyes
    let out = D;
    if (fpc > 0) {
      fpPose(dt, C, cyw, vyaw, k, tk);
      if (fpc >= 1) out = C;
      else {
        const sa = smooth(0, 0.75, fpc), sb = smooth(0.5, 1, fpc), so = smooth(0.15, 0.85, fpc), hov = 0.42;
        mix(O, D, C, so);
        for (let i = 0; i < 3; i++) { const h = C.p[i] + (i === 1 ? hov : 0), a = D.p[i] + (h - D.p[i]) * sa; O.p[i] = a + (C.p[i] - a) * sb; }
        out = O;
      }
    }
    // the thrown snow keeps its depth in a window round the distance the lens is focused at: that distance follows the figure
    // (the chase camera's own distance is what the 7.5 m it is set to by default was chosen for)
    { const d = Math.hypot(D.p[0] - p[0], D.p[1] - p[1] - 0.9, D.p[2] - p[2]); B.focus = damp(B.focus, rigOn && tp !== 'chase' && !fpOn ? Math.max(d + 3.5, 5) : 7.5, 7, rdt); if (typeof App !== 'undefined') App.state.focus = B.focus; }
    // (inside the helmet the picture is drawn from closer in, so that the hands and the poles just in front of the lens are whole; not before the lens
    // is inside, or the top of the helmet would show for a moment on the way down)
    rc.near = B.near0 + (VD.fp.near - B.near0) * smooth(0.7, 1, fpc);
    // (a tree gone by close tips the lens a little: the flinch, 07c_feel.js)
    Render.setCamera(out.p, [out.p[0] + out.f[0], out.p[1] + out.f[1], out.p[2] + out.f[2]], [0, 1, 0], out.fov, out.roll + (typeof Feel !== 'undefined' && Feel.roll || 0));
    return true;
  };
})();
