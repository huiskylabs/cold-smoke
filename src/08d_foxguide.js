// ---------------------------------------------------------------- 狐狸带路（试玩版，?dev 下的 Variants「狐狸带路」，默认关）
// Design doc (用户 2026-11-17 17:16 UTC, decisions 2026-11-18 03:26 UTC): no new mode. In free skiing the fox that used to run for the
// trees when the skier came close runs on ahead instead, and leads them to one of the places off the run (a side valley, a drop, a wall
// of snow, a clearing in the trees), picked at random among those 300-1200 m ahead (a place not yet found three times as likely). There a
// small flame, the same as the rings' flame, hangs beside it; skiing through the flame is finding the place (Cards.emit('fox.den')).
// The rules of the chase (all of them numbers in N below, first guesses to be tuned by play):
//   run    it keeps about 12 m ahead: its speed is the skier's + 0.6 x (12 - gap), never more than a good skier's speed here (vref)
//   catch  the skier within 3 m of it for 0.5 s: it hops aside, looks back, yaps, and dashes 2 s at 1.25 x vref
//   wait   the skier more than 45 m behind, or out of sight of it for 3 s: it sits where it is, facing them; yaps when they come within
//          120 m; goes on when they are within 18 m or 1.2 s away
//   come   the skier stopped 6 s or more: it trots back to 25 m from them, sits, and yaps every 4 s
//   gone   ignored for 60 s (waiting or come back), or the place passed far by: it trots off into the trees. Nothing is lost
// Above 50 km/h (a real fox's best) it is a spirit fox (灵狐): its stride stops quickening and it trails the rings' aurora dust.
// It never appears or vanishes in sight: a skier who has gone past it is caught up with, the fox running by beside them (the spirit fox
// can: up to 1.5 x vref) and on ahead; one who outruns even that has ignored it, and it lets them go. No marker on
// the screen, the camera never turns to it (the owner's camera rule): its tracks in the snow (one line of prints), its yap from one side
// or the other, its eyes at night. Developer mode only, as the other trials.
const FoxGuide = (() => {
  const G = { on: false, force: false, spots: new WeakMap(), done: null, stats: { led: 0, found: 0, waits: 0, catches: 0, comes: 0, gone: 0 }, log: [], flames: [], dust: [], eyes: [] };
  if (typeof Variants !== 'undefined') Variants.def('foxguide', '狐狸带路', [['off', '关'], ['on', '开']], 'off');
  const devOn = () => { try { return !(self.COLD_SMOKE && self.COLD_SMOKE.noDev) && (/[?&]dev(=|&|$)/.test(location.search) || /\/dev\/?$/.test(location.pathname) || !!(self.COLD_SMOKE && self.COLD_SMOKE.dev)); } catch (e) { return false; } };
  const on = () => G.force || (typeof Variants !== 'undefined' && Variants.val.foxguide === 'on' && devOn());
  const N = G.N = {
    lead: 12, k: 0.6, catchD: 3, catchT: 0.5, dash: 2, dashK: 1.25,
    lostGap: 45, unseenT: 3, wakeD: 18, wakeTau: 2.6, callD: 120, passK: 1.5, passBy: 3.2, outrun: 90,
    stopT: 6, comeD: 25, yipEvery: 4, ignoreT: 60, offLine: 40, offLineT: 4,
    near: [300, 1200], fresh: 3, flameR: 3, flameAt: 140, spirit: 13.9,
  };
  const KEY = 'cs.foxden';
  const NAME = { lane: '侧谷', drop: '断崖', wall: '雪墙', glade: '林间空地' };
  const pc = {}, pc2 = {}, pc3 = {}, tn = {}, bump = x => Math.sin(Math.PI * sat(x));
  let rnd = RNG(9137);
  G.seed = n => { rnd = RNG(n); };
  const done = () => { if (G.done) return G.done; let a = []; try { a = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { } G.done = new Set(Array.isArray(a) ? a : []); return G.done; };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...G.done].slice(-400))); } catch (e) { } };

  // ---- the places it can lead to: found by rule in what the course has laid out (the same rules as the cards' scan), only those off the
  // way a skier goes anyway. Each has a path: where across the hill the fox runs at s on its way there (u, from the run's centre line)
  const ramp = (U, S) => s => U * smooth(S - 170, S - 50, s);
  function segSpots(g) {
    let out = G.spots.get(g); if (out) return out;
    out = []; const a = g.s0, b = g.s0 + g.len, seed = Course.seed || 0;
    const add = o => { const c = Course.at(o.s, pc); o.id = seed + ':' + o.kind + '@' + Math.round(o.s); o.name = NAME[o.kind]; o.x = c.cx + o.u; o.y = Course.height(o.x, -o.s, 0.5); out.push(o); };
    // side valleys: the middle of each lane this run lays out. On the way it keeps to that side of the run, then follows the lane out
    for (const l of g.ln || []) {
      const sm = (l.s0 + l.s1) / 2, side = sign(l.off) || 1;
      if (sm < a || sm > b) continue;
      add({ kind: 'lane', s: sm, u: Course.laneU(l, sm), lane: l, path: s => s >= l.s1 ? Course.laneU(l, Math.min(s, sm)) : side * Math.max(Math.abs(Course.laneU(l, Math.min(s, sm))), Math.min(Course.at(s, pc3).hw * 0.45, 11) * smooth(l.s0 - 160, l.s0 - 60, s)) });
    }
    // drops: the lip of each
    for (let k = Math.floor(a / 32); k <= Math.floor(b / 32); k++) for (const f of Course.feats.get(k) || []) if (f.kind === 'drop' && f.lip >= a && f.lip < b && !out.some(o => o.f === f)) add({ kind: 'drop', s: f.lip - 1.5, u: f.u, f, path: ramp(f.u, f.lip) });
    // the highest wall of snow along the edge in this run
    { const xs = (g.xs || []).filter(q => q.bank && Math.abs(q.bank) >= 1.6).sort((p, q) => Math.abs(q.bank) - Math.abs(p.bank))[0];
      if (xs) { const u = sign(xs.bank) * (Course.at(xs.s, pc).hw - 2.5); add({ kind: 'wall', s: xs.s, u, path: ramp(u, xs.s) }); } }
    // the clearing in a run through the trees: the point of it farthest from any tree
    if (g.type === 'glade') {
      let best = null; for (let s = a + 30; s < b - 30; s += 8) { const c = Course.at(s, pc); for (let u = -c.hw + 6; u <= c.hw - 6; u += 4) { Course.nearTree(c.cx + u, -s, tn); const d = tn.ok ? tn.d : 30; if (!best || d > best.d) best = { s, u, d }; } }
      if (best && best.d > 12) add({ kind: 'glade', s: best.s, u: best.u, path: ramp(best.u, best.s) });
    }
    G.spots.set(g, out); return out;
  }
  G.spotsBetween = function (s0, s1) {
    if (Course.segAt) Course.segAt(s1 + 60);
    const list = []; for (const g of Course.segs) { if (g.s0 + g.len < s0 || g.s0 > s1) continue; for (const p of segSpots(g)) if (p.s > s0 && p.s < s1) list.push(p); }
    return list;
  };
  // one of those 300-1200 m ahead of where the fox is; a place not found yet three times as likely. `near`: only those whose path is
  // within that many metres of u at s (a skier gone off another way)
  function pick(sFrom, uAt, near) {
    const D = done(); let list = G.spotsBetween(sFrom + N.near[0], sFrom + N.near[1]);
    if (near != null) list = list.filter(p => Math.abs(p.path(sFrom) - uAt) < near);
    if (!list.length) return null;
    // (each kind of place as likely as another, however many side valleys the run has: then one of that kind)
    const kinds = [...new Set(list.map(p => p.kind))], kind = kinds[Math.min(kinds.length - 1, Math.floor(rnd() * kinds.length))]; list = list.filter(p => p.kind === kind);
    let tot = 0; const w = list.map(p => { const k = D.has(p.id) ? 1 : N.fresh; tot += k; return k; });
    let r = rnd() * tot; for (let i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }
  // how fast a good skier goes here: from the fall of the run over the next 40 m (until the rings' reference skier has recorded a table of
  // speeds along the run, 光圈 thread, which this then reads instead); a lane, narrow and through the trees, slower
  G.vref = function (s, inLane) {
    if (G.table) { const v = G.table(s); if (v > 0) return v; }
    const c = Course.at(s, pc3), h0 = Course.height(c.cx, -s, 0.5), c2 = Course.at(s + 40, pc2), h1 = Course.height(c2.cx, -s - 40, 0.5), sl = Math.max(0, (h0 - h1) / 40);
    const v = clamp(9 + 62 * sl, 10, 30); return inLane ? Math.min(v, 17) : v;
  };

  // ---- seen from the camera? (a fox may only be moved when it is not)
  function visible(p) {
    if (typeof Render === 'undefined' || !Render.cam) return true;
    const c = Render.cam, dx = p[0] - c.pos[0], dy = p[1] - c.pos[1], dz = p[2] - c.pos[2], d = Math.hypot(dx, dy, dz);
    if (d > 280) return false; if (d < 2) return true;
    return (dx * c.fwd[0] + dy * c.fwd[1] + dz * c.fwd[2]) / d > Math.cos(Math.min(1.25, (c.fovY || 1) * 0.8));
  }
  const yip = (a, n) => { const S = Game.s, d = Math.hypot(a.pos[0] - S.p[0], a.pos[2] - S.p[2]); if (typeof Sound !== 'undefined' && Sound.event && d < 160) Sound.event({ type: 'yip', d, n: n || 1, side: sign((a.pos[0] - S.p[0]) * S.r[0] + (a.pos[2] - S.p[2]) * S.r[2]) || 1 }); G.yips = (G.yips || 0) + 1; };
  const wrapA = x => Math.atan2(Math.sin(x), Math.cos(x));
  const note = (g, what, extra) => { if (G.log.length < 400) G.log.push(Object.assign({ t: +(Game.runT || 0).toFixed(2), what, st: g.st }, extra || {})); };

  // sitting: back on its haunches, the fore legs straight, the brush round the feet. up: 0 crouched low .. 1 sat up, head high
  function sit(K, up, o) {
    const I = Fauna._in; I.zeroPose(o);
    o.aH = lerp(0.62, 0.78, up); o.aC = lerp(0.38, 0.62, up); o.my = lerp(-0.155, -0.125, up); o.mz = 0.03;
    for (let i = 0; i < 2; i++) { o.lg[i * 5] = lerp(-0.02, -0.05, up); o.lg[i * 5 + 3] = 0; }
    for (let i = 2; i < 4; i++) { o.lg[i * 5] = 0.15; o.lg[i * 5 + 2] = 0.02; }
    const dd = K.Q.plant(o, 2, 0.035); o.lg[14] = o.lg[19] = dd;
    o.nA = lerp(0.05, 0.30, up); o.nB = lerp(0.0, 0.18, up); o.hA = lerp(0.05, 0.12, up) - 0.3 * o.aC; o.eB = -0.12 * up;
    o.t0 = 0.79 + 0.6 * (o.aH - 0.7) - 0.0; o.t1 = 0.80 + 0.6 * (o.aH - 0.7); o.t2 = 0.58 + 0.6 * (o.aH - 0.7); o.y0 = 0.6; o.y1 = 1.5; o.y2 = 2.4;          // (the brush laid along the snow and round the feet)
    return o;
  }
  G.sit = sit;

  // ---- the fox has been met, and would have bolted: is there somewhere to take the skier?
  function begin(a, ev) {
    if (!on() || typeof Game === 'undefined' || !Game.s || Game.mode !== 'run') return false;
    const sp = pick(a.s, a.off); if (!sp) { note({ st: '-' }, 'none', { s: Math.round(a.s) }); return false; }
    const S = Game.s;
    a.guide = { sp, st: 'run', ts: 0, t: 0, s0: a.s, catches: 0, near: 0, unseen: 0, stopT: 0, idle: 0, offT: 0, yipT: 0, dashT: 0, hopT: -1, hopSide: 1, lookT: 0.9, latV: 0, look: 0, up: 0, sitK: 0, calls: 0, got: false, flame: null, dustD: 0, prS: null };
    a.trees = 1.2; a.v = Math.max(a.v, 2); a.ph = 0.3;
    G.stats.led++; ev.guide = a.guide; note(a.guide, 'begin', { spot: sp.id, kind: sp.kind, ahead: Math.round(sp.s - a.s), sk: Math.round(-S.p[2]) });
    yip(a, 2);
    return true;
  }
  function setSt(g, st, why) { if (g.st === st) return; note(g, st, Object.assign(why ? { why } : {}, st === 'gone' && g.minF != null ? { minF: +g.minF.toFixed(1), uS: g.uSat } : {})); g.st = st; g.ts = 0; if (st === 'wait') G.stats.waits++; if (st === 'come') G.stats.comes++; if (st === 'gone') G.stats.gone++; }

  // ---- one step of the fox that is leading
  function step(a, dt, t, ev) {
    const I = Fauna._in, K = a.K, S = Game.s, g = a.guide, sp = g.sp, sS = -S.p[2], vs = Math.max(-S.v[2], 0), spd = S.speed;
    const c = Course.at(a.s, pc), uS = S.p[0] - Course.at(sS, pc2).cx, gap = a.s - sS, lat = a.off - uS, dist = Math.hypot(gap, lat, a.pos[1] - S.p[1]);
    g.t += dt; g.ts += dt; g.stopT = spd < 1 ? g.stopT + dt : 0;
    const seen = visible(a.pos); g.unseen = seen ? 0 : g.unseen + dt;
    if ((ev.leave || !on() || Game.mode !== 'run') && g.st !== 'gone') setSt(g, 'gone', 'leave');
    const inLane = sp.kind === 'lane' && a.s > sp.lane.s0 + 30;
    let vT = 0, back = false, uT = sp.path(a.s), stand = false;
    // (the skier has gone off another way, well across the hill from its line: a place they can still get to from where they are)
    if (g.st === 'run' || g.st === 'wait') {
      g.offT = Math.abs(uS - sp.path(sS)) > N.offLine ? g.offT + dt : 0;
      if (g.offT > N.offLineT) { const np = g.replans ? null : pick(sS - N.near[0] + 120, uS, 25); g.offT = 0; if (!np) { setSt(g, 'gone', 'other way'); } else if (np !== sp) { g.replans = (g.replans || 0) + 1; note(g, 'replan', { from: sp.id, to: np.id }); g.sp = np; if (g.flame) { g.flame.out = true; g.flame = null; g.minF = null; } return step(a, 0, t, ev); } }
    }
    if (g.st === 'run') {
      const vr = G.vref(a.s, inLane);
      if (g.dashT > 0) g.dashT -= dt;
      vT = clamp(vs + N.k * (N.lead - gap), 0, vr * (g.dashT > 0 ? N.dashK : 1)); if (g.dashT > 0) vT = vr * N.dashK;          // (closer than 12 m it pulls away, farther it eases off)
      // (gone past it: it runs to catch up, by on one side of them, and on ahead; the spirit fox can go half as fast again as a good skier)
      if (gap < 0) vT = Math.min(Math.max(vs * 1.25 + 3, vr), vr * N.passK);
      // caught up with
      g.near = Math.abs(gap) < N.catchD && Math.abs(lat) < 7 ? g.near + dt : 0;          // (level with it: it keeps a few metres to the side of the skis, so alongside is caught)
      if (g.near > N.catchT && g.dashT <= 0) { g.catches++; G.stats.catches++; g.dashT = N.dash; g.hopT = 0; g.hopSide = sign(lat) || 1; g.lookT = 0.8; g.near = 0; yip(a); note(g, 'catch', { n: g.catches, v: +spd.toFixed(1) }); }
      if (gap > N.lostGap && (vs < 2 || gap / vs > N.wakeTau + 1.5)) setSt(g, 'wait', 'behind');
      else if (g.unseen > N.unseenT && gap > 15) setSt(g, 'wait', 'unseen');
      else if (g.stopT > N.stopT) setSt(g, 'wait', 'stopped');
      if (a.s >= sp.s - 1.5) { setSt(g, 'there'); G.stats.there = (G.stats.there || 0) + 1; }
    }
    // outrun even so (or left far behind while it waited): they have not followed it, and it lets them go
    if (g.st !== 'there' && g.st !== 'gone' && (gap < -N.outrun || (sS > sp.s + 60))) setSt(g, 'gone', gap < -N.outrun ? 'outrun' : 'passed');
    if (g.st === 'wait' && gap < -2) setSt(g, 'run', 'passed it');
    if (g.st === 'wait') {
      vT = 0; stand = true;
      g.idle += dt;
      if (dist < N.callD && g.calls < 2 && (g.yipT -= dt) <= 0) { yip(a, g.calls ? 1 : 2); g.calls++; g.yipT = 2.5 + rnd(); }
      const tau = vs > 2 ? gap / vs : 99;
      if ((dist < N.wakeD && spd > 1.5) || (tau < N.wakeTau && gap > 0)) { g.idle = 0; g.calls = 0; setSt(g, 'run', 'woke'); }
      else if (g.stopT > N.stopT && dist > N.comeD + 4) setSt(g, 'come');
      else if (g.idle > N.ignoreT) setSt(g, 'gone', 'ignored');
    }
    if (g.st === 'come') {
      g.idle += dt;
      if (dist > N.comeD + 1 && gap > 0) { vT = 2.8; back = true; } else { vT = 0; stand = true; if ((g.yipT -= dt) <= 0) { yip(a); g.yipT = N.yipEvery; } }
      uT = lerp(sp.path(a.s), uS, 0.5);
      if (spd > 2.5) setSt(g, 'wait', 'moving');
      else if (g.idle > N.ignoreT) setSt(g, 'gone', 'ignored');
    }
    // there: it goes the last few steps to where it will sit, beside the flame, and sits looking out over the place
    const side = sign(sp.u) || 1, seatS = sp.s + 1.2, seatU = sp.u + side * 2.2;
    if (g.st === 'there') {
      const dS = seatS - a.s, dU = seatU - a.off;
      uT = seatU; vT = Math.hypot(dS, dU) > 0.3 ? clamp(Math.hypot(dS, dU) * 1.6, 0.6, 6) : 0; stand = vT === 0;
      if (vT === 0) g.sitK = Math.min(1, g.sitK + dt / 0.6);
      if (!g.got && sS > sp.s + 60) setSt(g, 'gone', 'passed');
      else if (g.got && (gap < -40 || g.ts > 25)) setSt(g, 'gone', 'after');
      else if (!g.got && g.stopT > 0 && (g.idle += dt) > N.ignoreT) setSt(g, 'gone', 'ignored');
    }
    if (g.st === 'gone') { uT = (sign(a.off) || 1) * (c.hw + 18); vT = K.jog.v; a.trees = 2; }
    // the flame at the place: lit as the fox draws near it, there until it is found or the fox leaves
    if (!g.flame && sp.s - a.s < N.flameAt && g.st !== 'gone') { g.flame = { p: [sp.x, sp.y + 0.9, -sp.s], A: 0, sc: 1, sz: 0.55, ti: 0, id: 4000 + (G.flames.length % 90), light: 1, born: g.t, out: false, spot: sp, owner: a }; G.flames.push(g.flame); }
    if (g.flame && !g.got && !g.flame.out) {
      const f = g.flame, dx = S.p[0] - f.p[0], dz = S.p[2] - f.p[2], dy = S.p[1] + 0.9 - f.p[1];
      const df = Math.hypot(dx, dz); if (g.minF == null || df < g.minF) { g.minF = df; g.uSat = +(S.p[0] - f.p[0]).toFixed(1); }
      if (df < N.flameR && Math.abs(dy) < 3) found(a, g);
    }
    if (g.st === 'gone' && g.flame && !g.flame.out) g.flame.out = true;

    // ---- moving: along the run at its pace, across it toward its line (or wherever the state wants it)
    const acc = vT > a.v ? (g.dashT > 0 || gap < 0 ? 18 : 12) : 14;
    a.v += clamp((vT - a.v) * 4, -acc, acc) * dt; if (a.v < 0) a.v = 0;
    const latMax = 0.6 * a.v + 1.2;
    let latT = clamp((uT - a.off) * 1.6, -latMax, latMax);
    if (g.hopT >= 0) { g.hopT += dt; latT += g.hopSide * 5 * bump(g.hopT / 0.42); a.lift = 0.32 * bump(g.hopT / 0.42); if (g.hopT > 0.42) { g.hopT = -1; a.lift = 0; } }
    g.latV = damp(g.latV, latT, 6, dt); a.off += g.latV * dt;
    // (never under the skis: it keeps to its side of them when they are close)
    // (and passing them it goes by wide: N.passBy and more the faster they go)
    { const sd = sign(lat) || g.hopSide || 1, m = (gap < 2 ? N.passBy : 2.4) + 0.06 * spd, gg = (a.off - uS) * sd;
      if (g.st !== 'there' && Math.abs(gap) < 12 + 0.3 * spd && gg < m) { a.off += sd * Math.min(m - gg, (6 + 0.25 * spd) * dt); g.latV = Math.max(g.latV * sd, 0) * sd; } }
    const fwd = Math.sqrt(Math.max(a.v * a.v - Math.min(g.latV * g.latV, a.v * a.v * 0.8), 0));
    a.s += (back ? -1 : 1) * (g.st === 'there' ? clamp(seatS - a.s, -fwd * dt, fwd * dt) / Math.max(dt, 1e-6) : fwd) * dt;
    const c2 = Course.at(a.s, pc);
    const moving = a.v > 0.3;
    if (moving) I.onGround(a, dt, c2, 8, 1.3, 0.22);
    else {
      // still: it faces the skier (waiting, come back) or the view (there)
      const yT = g.st === 'there' ? (Course.yawAt ? Course.yawAt(a.s) : 0) + side * 0.6 : Math.atan2(S.p[0] - a.pos[0], -(S.p[2] - a.pos[2]));
      a.yaw += wrapA(yT - a.yaw) * (1 - Math.exp(-3 * dt)); a.lean = damp(a.lean, 0, 5, dt);
      I.onGround(a, dt, c2, 0, 0, 0);
    }
    // ---- how it carries itself
    g.lookT -= dt;
    const watch = g.lookT > 0 || (!moving && g.st !== 'there');
    g.look = damp(g.look, watch ? clamp(I.bearing(a, S), -1.35, 1.35) : g.st === 'there' ? 0.2 * Math.sin(g.t * 0.4) : 0, watch ? 5 : 3, dt);
    g.up = damp(g.up, g.st === 'wait' && dist < N.callD ? 1 : 0.6, 4, dt);
    const sitting = !moving && (g.st === 'wait' || g.st === 'come' || g.st === 'there') && g.ts > 0.5;
    g.sitK = damp(g.sitK, sitting ? 1 : 0, sitting ? 3 : 9, dt);
    const v = a.v, W = K.walk, T = K.jog;
    if (v > 2.6) {
      // the gallop; above a real fox's best its stride goes no quicker (the spirit fox runs on as if the snow carried it)
      a.freq = lerp(2.3, 3.2, sat((v - 4) / 9)); const ph0 = a.ph; a.ph = (a.ph + a.freq * dt) % 1;
      I.leap(K.gait, a.ph, Math.min(v, N.spirit) / a.scale, 1 / a.freq, 1, I.P1); I.P1.hY = g.look * 0.7;
      if (a.R) for (const [p, fore] of [[K.gait.fOn, 1], [K.gait.hOn + 0.05, 0]]) if (I.crossed(ph0, a.ph, p)) {
        const w0 = I.toWorld(a, [0, 0.01, fore ? -0.2 : 0.18]), d = Math.hypot(w0[0] - S.p[0], w0[2] - S.p[2]), f = a.fwd;
        if (d < 80) Spray.kick(t, w0, [f[0] * v * (fore ? 0.3 : -0.15), 0.5, f[2] * v * (fore ? 0.3 : -0.15)], (fore ? 0.25 : 0.4) * (0.7 + 0.8 * (c2.powder || 0.3)));
        if (d < 22) Sound.event({ type: 'hoof', d: d * 1.4, side: sign((w0[0] - S.p[0]) * S.r[0] + (w0[2] - S.p[2]) * S.r[2]) || 1, k: fore ? 0.18 : 0.28 });
        if (fore) print(w0, f);
      }
    } else {
      const k = smooth(1.4, 2.3, v), ph0 = a.ph;
      a.ph = (a.ph + lerp(W.f / W.v, T.f / T.v, k) * v * dt) % 1;
      if (sitting || g.sitK > 0.02) { sit(K, g.up, I.P2); I.P2.hY = g.look; }
      K.look(g.look, g.up, 0, I.P1);
      if (g.sitK > 0.001) Fauna.mixPose(I.P1, I.P1, I.P2, smooth(0, 1, g.sitK));
      if (v > 0.02) { I.trot(W, a.ph, W.v / a.scale, 1 / W.f, 1, I.P2); if (k > 0) { I.trot(T, a.ph, T.v / a.scale, 1 / T.f, 1, I.P3); Fauna.mixPose(I.P2, I.P2, I.P3, k); } I.P2.hY = g.look * 0.6; Fauna.mixPose(I.P1, I.P1, I.P2, smooth(0.03, 0.55, v)); }
      if (a.R && v > 0.3) for (const p of [0, 0.5]) if (I.crossed(ph0, a.ph, p)) print(I.toWorld(a, [0, 0.01, -0.2]), a.fwd);
    }
    I.chase(a, I.P1, dt);
    // the spirit fox's dust: grains of the rings' aurora light left on the air behind it, the faster the more
    if (v > N.spirit && a.R) {
      g.dustD += v * dt;
      while (g.dustD > 0.45) { g.dustD -= 0.45; const w = I.toWorld(a, [0.03 * (rnd() - 0.5), 0.30 + 0.08 * rnd(), 0.32 + 0.1 * rnd()]); if (G.dust.length < 120) G.dust.push({ p: w, born: g.t, life: 0.9 + 0.5 * rnd(), k: sat((v - N.spirit) / 5), A: 0, sc: 0.5, sz: 0.11, ti: 1 + (rnd() < 0.4 ? 1 : 0), id: 4100 + (G.dust.length % 400), n: 2, light: 0, vy: 0.25 + 0.3 * rnd(), clock: g }); }
    }
    // at night its eyes give back the light: two small glints when it is turned toward the camera
    if (a.J && a.J.inHd && typeof Sky !== 'undefined' && (Sky.night || 0) > 0.35 && dist < 90 && typeof Render !== 'undefined') {
      const cam = Render.cam, tw = [cam.pos[0] - a.pos[0], cam.pos[2] - a.pos[2]], tl = Math.hypot(tw[0], tw[1]) || 1, hy = a.yaw + g.look * 0.8;
      const face = sat(((Math.sin(hy) * tw[0] - Math.cos(hy) * tw[1]) / tl - 0.55) / 0.35) * sat(((Sky.night || 0) - 0.35) / 0.3) * a.fade;
      if (face > 0.02) for (const sx of [-1, 1]) { const e = a.J.inHd(sx * K.eyeL[0], K.eyeL[1], K.eyeL[2] - 0.006), w = I.toWorld(a, e); G.eyeN = (G.eyeN || 0) + 1; G.eyes.push({ p: w, A: 0.35 * face, sc: 1, sz: 0.035, ti: 1, id: 4600 + (sx > 0 ? 1 : 0), n: 2, light: 0 }); }
    }
    if (Math.abs(gap) < 70) I.rider(a, 0.4, 0.95);
    if (g.st === 'gone' && (Math.abs(a.off) - c2.hw > 4 || g.ts > 6 || gap < -40)) { a.fadeT = 0; end(a, g); }
  }
  // one print of the line it leaves (a fox at a trot puts its hind foot in its fore foot's print: one line of prints)
  function print(w, f) { if (typeof Tracks !== 'undefined' && Tracks.deposit) Tracks.deposit('pock', [w[0], w[1], w[2]], f, 0.045); G.prints = (G.prints || 0) + 1; }
  function found(a, g) {
    const sp = g.sp, D = done(); g.got = true; g.flame.out = true; g.flame.burst = g.t; G.stats.found++;
    const km = Math.max(0, sp.s - g.s0) / 1000, first = !D.has(sp.id);
    D.add(sp.id); save();
    note(g, 'found', { spot: sp.id, km: +km.toFixed(2), catches: g.catches, first });
    const data = { den: sp.id, kind: sp.kind, name: sp.name, s: Math.round(sp.s), u: +sp.u.toFixed(1), km: +km.toFixed(2), catches: g.catches, first };
    let carded = false;
    if (typeof Cards !== 'undefined' && Cards.emit) try { Cards.emit('fox.den', data); carded = !!Cards.on; } catch (e) { console.warn('fox.den:', e); }
    if (!carded) toast((first ? '小狐狸带你找到了 · ' : '又来到 · ') + sp.name);
    G.lastFound = data;
  }
  function end(a, g) { if (g.ended) return; g.ended = true; if (g.flame) g.flame.out = true; if (Fauna.next != null) Fauna.next = Math.max(Fauna.next, Game.runT + Fauna.gap[0]); }
  let tEl = null, tT = 0;
  function toast(text) {
    G.toasts = (G.toasts || 0) + 1; if (typeof document === 'undefined') return;
    if (!tEl) { tEl = document.createElement('div'); tEl.style.cssText = 'position:fixed;left:50%;bottom:16%;transform:translateX(-50%);font:500 14px/1.4 system-ui,sans-serif;letter-spacing:.12em;color:rgba(255,255,255,.92);text-shadow:0 1px 4px rgba(0,0,0,.5);pointer-events:none;z-index:3;transition:opacity .4s;opacity:0'; document.body.appendChild(tEl); }
    tEl.textContent = '♪ ' + text; tEl.style.opacity = '1'; tT = 2.4;
  }

  // ---- each frame (from Fauna.update): the flames and the dust, handed to the rings' flame drawing
  function tick(dt) {
    if (tT > 0 && (tT -= dt) <= 0 && tEl) tEl.style.opacity = '0';
    const T = (Game.runT || 0);
    for (let i = G.flames.length - 1; i >= 0; i--) {
      const f = G.flames[i];
      f.t = (f.t || 0) + dt;
      if (f.burst != null) { const q = sat(f.t2 = (f.t2 || 0) + dt / 0.6); f.sc = 1 + 1.4 * q; f.A = 1 - q; if (q >= 1) { G.flames.splice(i, 1); continue; } }
      else if (f.out || (f.owner && f.owner.gone)) { f.A = Math.max(0, f.A - dt / 1.0); if (f.A <= 0) { G.flames.splice(i, 1); continue; } }
      else f.A = Math.min(1, f.A + dt / 0.8);
    }
    for (let i = G.dust.length - 1; i >= 0; i--) { const d = G.dust[i]; d.age = (d.age || 0) + dt; const q = d.age / d.life; if (q >= 1) { G.dust.splice(i, 1); continue; } d.p[1] += d.vy * dt; d.A = 0.55 * d.k * Math.pow(1 - q, 1.4) * Math.min(1, d.age / 0.08); d.sc = 0.5 * (1 - 0.5 * q); }
    if (typeof Rings !== 'undefined' && Rings.extra) { Rings.extra.length = 0; for (const f of G.flames) Rings.extra.push(f); for (const d of G.dust) Rings.extra.push(d); for (const e of G.eyes) Rings.extra.push(e); }
    G.eyes.length = 0;
    G.on = on();
    if (typeof Fauna !== 'undefined') Fauna.weight.fox = G.on ? 2 : 1;
  }
  if (typeof Fauna !== 'undefined') { Fauna.guideTry = begin; Fauna.guideStep = step; Fauna.guideTick = tick; }
  G.reset = function () { G.flames.length = 0; G.dust.length = 0; G.spots = new WeakMap(); };
  return G;
})();
