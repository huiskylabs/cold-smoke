// ---------------------------------------------------------------- 光圈挑战（试玩版，?dev 下的 Variants「光圈挑战」，默认关）
// The rings of the ring challenge. The nearest ring is a dense swarm of glowing grains (thickest along its middle line, each grain jittering
// fast on its spot and running along the ring, short-lived, a few drifting outward: green low, violet high, like the game's aurora; 用户
// 05:22 UTC: 由点组成，不要实心的管子). The next three are only a flame each, fainter the farther they are, so the line ahead can be read. As
// the skier closes on the ring in front, the next flame swells in place and opens into a ring; the ring passed scatters.
// They are things in the world, drawn in the scene pass with the scene's depth (用户 04:58 UTC: 必须是 physical 的东西，人在前面要挡住，要有
// 体积，要有影子): the skier, the trees and the hill hide them pixel by pixel, each grain casts its shadow into the sun's shadow map (a dappled band
// that moves with them), and
// its light falls on the snow round it (and on the skier riding through). A flame's glow is a wide sheet of lit air at the flame's own depth,
// so what stands in front of the flame cuts it, and over a ridge the glow above the ridge line is still seen.
// Rings are laid ahead of the skier while the mode is on, station by station of the designed run (PLAN below), in three sizes set by
// 光圈难度; after a flagged kicker a ring hangs in the air of the jump.
const Rings = (() => {
  const RG = { on: false, rings: [], passed: 0, missed: 0, hud: null, n: 0, pipes: [] };
  if (typeof Variants !== 'undefined') Variants.def('rings', '光圈挑战', [['off', '关'], ['on', '开']], 'off');
  // (developer mode only for now, as the other trial switches: without ?dev it is off, whatever an address or an earlier pick says)
  const devOn = () => { try { return !(self.COLD_SMOKE && self.COLD_SMOKE.noDev) && (/[?&]dev(=|&|$)/.test(location.search) || /\/dev\/?$/.test(location.pathname) || !!(self.COLD_SMOKE && self.COLD_SMOKE.dev)); } catch (e) { return false; } };
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = x => 1 - Math.pow(1 - cl(x, 0, 1), 3);
  // (用户 05:28 UTC: 现在的圈太大，随机混 3、4 种：现在的 2/3、1/2、1/3，钻着试): radii as shares of the 4.5 m ring he saw; the HUD names
  // the share of the ring in front so he can say which one is right
  // UPDATE (用户 05:43 UTC): keep three, 2/3, 1/2, 1/3, set by how hard the stretch is (index 0 easy .. 2 hard)
  const SIZES = [[3.0, '2/3'], [2.25, '1/2'], [1.5, '1/3']];
  const AHEAD = 4;                 // the ring in front + three flames
  const TONGUES = 56;
  let gfx = null, pDust = null, pDustSh = null, pFlame = null, pLight = null;
  let lastS = null, rnd = 1, lastT = 0, serial = 0, drawList = [];
  const pc = {}, tn = {}, rk = {};
  const rand = () => { rnd = (rnd * 16807) % 2147483647; return (rnd - 1) / 2147483646; };

  // ---- where the rings go
  function lipOf(f) { const xk = s => Course.at(s, pc).cx + f.u, hgt = s => Course.height(xk(s), -s, 0.5); let sc = f.s + f.len, best = 1e9; for (let s = f.s + 2; s <= f.s + f.len + 6; s += 0.5) { const c = hgt(s + 0.5) + hgt(s - 0.5) - 2 * hgt(s); if (c < best) { best = c; sc = s; } } return { s: sc, y: hgt(sc), x: xk(sc) }; }
  function kickerIn(s0, s1) { for (let b = Math.floor((s0 - 40) / 32); b <= Math.floor(s1 / 32); b++) for (const f of Course.feats.get(b) || []) if (f.mark && f.s + f.len > s0 && f.s < s1) return f; return null; }
  function clear(s, u, hw) { for (const d of [0, -2.5, 2.5, -5, 5, -7.5, 7.5]) { const uu = cl(u + d, -hw + 4, hw - 4), x = Course.at(s, pc).cx + uu; let ok = true; for (const dz of [-6, 0, 6]) { Course.nearTree(x, -s + dz, tn); if (tn.ok && !tn.soft && tn.d < 5.5) ok = false; } if (Course.rockHit && Course.rockHit(x, -s, rk)) ok = false; if (ok) return uu; } return null; }
  // ---- how the rings are laid out (用户 05:43 UTC: 三档大小按难度定，再想想圈怎么排布). Each station of the designed run (Course.ROUTE,
  // 经典编排) has its own way: lv how hard it is (0 big rings, 2 small), gap metres between rings, how they stand across the run:
  //   weave  side to side, a slalom feel (open slopes)
  //   apex   on the inside of each bend of a winding lane, where the line through the bend runs; round the bend it is hidden by the trees
  //          until you are in it (藏), then there
  //   centre in the middle of the run where it opens to the city: the ring frames the view (露, 借景)
  //   crest  just over the top of a roller: hidden behind the crest, seen as you top it
  //   wall   up on one wall of the U gully, then the other: ride the walls
  //   none   no ground rings (the jumps: the ring is in the air past each kicker)
  // 光圈难度 moves every station a step: 轻松 bigger rings, gentler side steps, more room; 难 smaller, wider steps, closer together
  const PLAN = {
    bowl: { lv: 0, gap: [45, 60], how: 'weave', side: 7 },
    corridor: { lv: 1, gap: [55, 75], how: 'apex' },
    steeps: { lv: 1, gap: [50, 65], how: 'weave', side: 6 },
    glade: { lv: 1, gap: [38, 52], how: 'weave', side: 6 },
    kickers: { lv: 0, gap: [60, 80], how: 'none' },
    gully: { lv: 1, gap: [40, 55], how: 'wall' },
    ridge: { lv: 0, gap: [60, 80], how: 'centre' },
    moguls: { lv: 1, gap: [35, 45], how: 'weave', side: 4 },
    powder: { lv: 0, gap: [50, 70], how: 'weave', side: 9 },
    rollers: { lv: 1, gap: [45, 60], how: 'crest' },
  };
  if (typeof Variants !== 'undefined') Variants.def('ringdiff', '光圈难度', [['a', '轻松'], ['b', '标准'], ['c', '难']], 'b');
  const DIFF = { a: { off: -1, side: 0.6, gap: 1.15 }, b: { off: 0, side: 1, gap: 1 }, c: { off: 1, side: 1.35, gap: 0.85 } };
  function station(s) {
    Course.at(s, pc);
    const segs = Course.segs || []; let sg = null; for (const g of segs) { if (g.s0 <= s) sg = g; else break; }
    const st = sg && Course.ROUTE && Course.route !== false && sg.idx < Course.ROUTE.length ? Course.ROUTE[sg.idx] : null;
    let pl = PLAN[sg ? sg.type : 'bowl'] || PLAN.bowl;
    if (st && st.aim) pl = Object.assign({}, pl, s - sg.s0 < 110 ? { how: 'centre', lv: 0 } : { how: 'weave', side: 7, lv: 0 });          // (the run swings round to face the city: the first rings frame it, then a wide weave)
    if (sg && sg.type === 'steeps' && st && st.enc) pl = Object.assign({}, pl, { how: 'apex', lv: 2 });          // (the last steep lane in the trees)
    if (sg && sg.type === 'corridor' && sg.idx > 2) pl = Object.assign({}, pl, { lv: 2 });          // (the second lane: tighter bends, smaller rings)
    return { pl, sg, st };
  }
  const bend = s => { const a = Course.at(s - 15, pc).cx, b = Course.at(s + 15, pc).cx, c = Course.at(s, pc).cx; return a + b - 2 * c; };
  const hump = s => { const cx = t => Course.at(t, pc).cx, h = t => Course.height(cx(t), -t, 0.5); return h(s - 8) + h(s + 8) - 2 * h(s); };
  let wallSide = 1, cursor = null;
  function spawn() {
    // (where the last ring, or the last place passed over without one, stood: a stretch with no ground rings is still walked through)
    if (!cursor) cursor = { s: -Game.s.p[2] + 25, u: Game.s.p[0] - Course.at(-Game.s.p[2], pc).cx };
    const s0 = cursor.s, u0 = cursor.u;
    const D = DIFF[(typeof Variants !== 'undefined' && Variants.val.ringdiff) || 'b'] || DIFF.b;
    const { pl } = station(s0 + 40);
    let s = s0 + (pl.gap[0] + (pl.gap[1] - pl.gap[0]) * rand()) * D.gap;
    // (a line: its last ring is the finish, big and in the middle of the run; nothing comes after it)
    if (L.id) {
      const sE = lineEnd();
      if (L.fin) { RG.rings.push({ id: serial++, s: 1e9, skip: true }); return; }
      if (s > sE - 25 || s0 + 60 > sE - 25) {
        const c = Course.at(sE, pc), r = 6.0; L.fin = true;          // (用户 18:54 UTC: 终点是更大的白圈)
        RG.rings.push({ id: serial++, s: sE, u: 0, x: c.cx, y: floatY(c.cx, sE, r, -1e9), r, tag: '终点', fin: true, air: false, born: lastT, grow: -1, pass: -1, hit: 0, splash: -1 }); cursor = { s: sE, u: 0 }; return;
      }
    }
    const f = kickerIn(s0 + 10, s + 20);
    const lvAir = cl(D.off, 0, 2);
    if (f) { const lip = lipOf(f), sr = lip.s + 8, c = Course.at(sr, pc), z = SIZES[lvAir]; RG.rings.push({ id: serial++, s: sr, u: f.u, x: c.cx + f.u, y: floatY(c.cx + f.u, sr, z[0], lip.y - 0.7), r: z[0], tag: z[1], air: true, born: lastT, grow: -1, pass: -1, hit: 0, splash: -1 }); cursor = { s: sr, u: f.u }; return; }
    if (pl.how === 'none') { cursor = { s, u: u0 }; RG.rings.push({ id: serial++, s, skip: true }); return; }
    const c0 = Course.at(s, pc), hw = c0.hw || 14;
    let u;
    if (pl.how === 'apex') {
      // the bend's apex within the next stretch: where the run curves most; the ring on its inside
      let best = s, bk = 0; for (let t = s - 15; t <= s + 25; t += 5) { const k = bend(t); if (Math.abs(k) > Math.abs(bk)) { bk = k; best = t; } }
      if (Math.abs(bk) > 0.15) { s = best; u = Math.sign(bk) * hw * (D.off > 0 ? 0.45 : 0.3); } else u = u0 + (rand() < 0.5 ? -1 : 1) * 4 * D.side;
    } else if (pl.how === 'crest') {
      let best = s, bk = 0; for (let t = s - 15; t <= s + 20; t += 2.5) { const k = hump(t); if (k < bk) { bk = k; best = t; } }
      s = best + 5; u = u0 + (Math.abs(u0) > 2 ? -Math.sign(u0) : (rand() < 0.5 ? -1 : 1)) * (4 + 5 * rand()) * D.side;
    } else if (pl.how === 'wall') { wallSide = -wallSide; u = wallSide * hw * (0.45 + 0.15 * cl(D.off + 1, 0, 2) / 2); }
    else if (pl.how === 'centre') u = (rand() - 0.5) * 3;
    else { const dir = Math.abs(u0) > 2 ? -Math.sign(u0) : (rand() < 0.5 ? -1 : 1); u = u0 + dir * (0.6 + 0.6 * rand()) * pl.side * 1.6 * D.side; }          // (side to side, a slalom: always back across the run)
    const c = Course.at(s, pc), hw2 = c.hw || 14;
    u = cl(u, -hw2 * 0.6, hw2 * 0.6);
    const uu = clear(s, u, hw2); if (uu === null) { cursor = { s, u: u0 }; RG.rings.push({ id: serial++, s, skip: true }); return; }
    // (用户 04:47 UTC 一整个圈; 16:55 UTC 不要接到雪地上，留一点空间，悬浮起来): the whole ring floats, its lowest point a little above the snow
    const lv = cl(Math.round(pl.lv + D.off + (rand() - 0.5) * 1.3), 0, 2), pick = SIZES[lv], r = pick[0], x = c.cx + uu;
    cursor = { s, u: uu };
    RG.rings.push({ id: serial++, s, u: uu, x, y: floatY(x, s, r, -1e9), r, tag: pick[1], air: false, born: lastT, grow: -1, pass: -1, hit: 0, splash: -1 });
  }
  // Every ring floats: the snow under any part of its lower half stays at least GAP below it (ground rings and air rings alike).
  const GAP = 0.35;
  function floatY(x, s, r, y) {
    let top = -1e9; for (let i = -6; i <= 6; i++) { const a = i / 6 * 1.2, dx = Math.sin(a) * r, dy = -Math.cos(a) * r; top = Math.max(top, Course.height(x + dx, -s, 0.5) - dy); }
    return Math.max(y, top + GAP);
  }
  function reset() { RG.rings.length = 0; RG.passed = RG.missed = 0; rnd = L.id ? L.seed : 1 + Math.floor((Date.now() % 100000)); lastS = null; drawList = []; cursor = null; L.fin = false; }

  // ---- each frame, before the game draws
  function update(T) {
    const S = Game.s, s = -S.p[2];
    if (lastS !== null && (s < lastS - 30 || s > lastS + 200)) reset();
    lastS = s;
    RG.rings = RG.rings.filter(r => !(r.pass >= 0 && T - r.pass > 2.4));
    // (用户 16:55 UTC 微小的左右、上下抖动): each ring sways a few centimetres round its place, slowly and never in step with the others
    for (const r of RG.rings) {
      if (r.skip) continue;
      if (r.x0 === undefined) { r.x0 = r.x; r.y0 = r.y; r.ph = (r.id * 2.39996) % 6.283; }
      const w = T * 6.283, p = r.ph;
      r.x = r.x0 + 0.09 * Math.sin(w * 0.31 + p) + 0.04 * Math.sin(w * 0.73 + p * 2.1);
      r.y = r.y0 + 0.07 * Math.sin(w * 0.43 + p * 1.7) + 0.03 * Math.sin(w * 0.91 + p * 0.6);
    }
    let live = RG.rings.filter(r => r.pass < 0).length;
    for (let tries = 0; live < AHEAD && tries < 20; tries++) { spawn(); const r = RG.rings[RG.rings.length - 1]; if (r.skip) RG.rings.pop(); else live++; }
    const ahead = RG.rings.filter(r => r.pass < 0);
    const cur = ahead[0]; if (!cur) return;
    if (cur.grow < 0) cur.grow = T;          // the first ring of a run opens at once
    const v = Math.max(6, S.speed || 0), dCur = cur.s - s;
    if (dCur < Math.max(14, v * 0.8) && ahead[1] && ahead[1].grow < 0) ahead[1].grow = T;          // nearly there: the next flame swells and opens
    // (用户 05:16 UTC: 离圈一两米、头碰到圈面之前就要 splash 散开，半米一米时能不能过已经定了): the splash starts 1.6 m before the ring's plane
    if (dCur < 1.6 && cur.splash < 0) {
      const dy = (S.p[1] + 0.9) - cur.y, dx = S.p[0] - cur.x;
      cur.splash = T; cur.hit = cur.air ? (Math.hypot(dx, dy) < cur.r) : (Math.abs(dx) < cur.r * 0.85);
    }
    if (dCur <= 0) {          // through or past it
      const dy = (S.p[1] + 0.9) - cur.y, dx = S.p[0] - cur.x;
      cur.hit = cur.air ? (Math.hypot(dx, dy) < cur.r) : (Math.abs(dx) < cur.r * 0.85);          // (ground rings: judged across only, the skier rides through the lower part)
      if (cur.splash < 0) cur.splash = T;
      if (cur.fin) { cur.hit = true; cur.pass = T; lineFinish(); return; }
      cur.pass = T; if (cur.hit) RG.passed++; else RG.missed++;
      if (ahead[1] && ahead[1].grow < 0) ahead[1].grow = T;
    }
  }
  // what each ring is this frame: how far open, how far scattered, how bright (far ones barely there), and its flame
  function prep(T) {
    const S = Game.s, s = -S.p[2], cam = Render.cam.pos, o = Render.origin, night = cl(((Sky.night || 0) - 0.2) / 0.6, 0, 1);
    const ahead = RG.rings.filter(r => r.pass < 0);
    drawList = [];
    for (const r of RG.rings) {
      const dist = Math.hypot(r.x - cam[0], r.y - cam[1], -r.s - cam[2]), ord = r.pass >= 0 ? 0 : ahead.indexOf(r);
      const sz = Math.sqrt(r.r / 4.5), near = Math.pow(cl(1 - (dist - 25) / 170, 0.04, 1), 1.6);
      if (r.fin && r.grow < 0) r.grow = r.born - 1;          // (the finish is a whole white ring from the moment it is there, never a flame)
      const grown = r.grow >= 0 ? cl((T - r.grow) / 0.9, 0, 1) : 0;
      const dis = r.splash >= 0 ? cl((T - r.splash) / 2.2, 0, 1) : 0;
      const ordK = ord <= 1 ? 1 : ord === 2 ? 0.62 : 0.4;
      const flameA = r.fin ? 0 : (grown < 1 ? (1 - cl((grown - 0.35) / 0.35, 0, 1)) : 0) * near * ordK * cl((T - r.born) / 0.6, 0, 1);
      const open = grown > 0.3 ? ease((grown - 0.3) / 0.6) : 0, A = cl((grown - 0.3) / 0.3, 0, 1) * Math.max(0.35, near);
      const c = [r.x - o[0], r.y - o[1], -r.s - o[2]];
      drawList.push({ r, dist, c, sz, near, grown, dis, open, A, flameA, night, ord, flameSc: (1 + 1.6 * ease(grown / 0.35)) * (ord <= 1 ? 1 : ord === 2 ? 0.85 : 0.72), tint: ord <= 1 ? 0 : ord === 2 ? 1 : 2, hitK: r.hit || r.splash < 0 ? 1 : 0.5 });
    }
    drawList.sort((a, b) => b.dist - a.dist);          // far first: the near ring's tube writes depth over what lies behind it
  }
  function hud() {
    if (!RG.hud) { RG.hud = document.createElement('div'); RG.hud.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);font:500 13px/1 system-ui,sans-serif;letter-spacing:.12em;color:rgba(255,255,255,.85);text-shadow:0 1px 3px rgba(0,0,0,.45);pointer-events:none;z-index:3'; document.body.appendChild(RG.hud); }
    RG.hud.style.display = RG.on && !L.id ? '' : 'none'; if (L.id) return;
    const cur = RG.rings.find(r => r.pass < 0 && !r.skip), dn = { a: '轻松', b: '标准', c: '难' }[(typeof Variants !== 'undefined' && Variants.val.ringdiff) || 'b'] || '标准', t = '光圈（' + dn + '） ' + RG.passed + ' / ' + (RG.passed + RG.missed) + (cur && cur.tag ? '　·　这个圈 ' + cur.tag + ' 大' : ''); if (RG.hud.textContent !== t) RG.hud.textContent = t;
  }

  // ---- the GPU side
  const ringU = (d, T) => ({ a: [d.c[0], d.c[1], d.c[2], d.r.r], b: [d.open, d.dis, d.A, d.near], c: [T, d.r.id % 4096, d.hitK, d.sz], d: [d.night, d.r.fin ? 1 : 0, d.grown, 0], e: [Math.round(5200 * d.sz), Math.round(500 * d.sz), 0, 0] });
  const ringLive = d => d.grown > 0.3 && d.dis < 1 && d.open > 0.01;
  RG.init = function (g) {
    gfx = g;
    const lib = [SL.common, SL.hash, SL.fog, RING_SSL];
    const UR = { a: 'vec4f', b: 'vec4f', c: 'vec4f', d: 'vec4f', e: 'vec4f' };
    pDust = gfx.pipeline({
      name: 'ringDust', lib: lib.concat([DUST_SSL]), buffers: [], topology: 'strip', cull: 'none', blend: 'premul', depthWrite: false, depthFunc: 'lequal',
      varyings: { uv: 'vec2f', col: 'vec4f', sh: 'vec4f' }, uniforms: UR, textures: { tSky: '2d' }, vs: DUST_VS, fs: SPARK_FS,
    });
    pDustSh = gfx.pipeline({
      name: 'ringDustShadow', lib: [SL.common, SL.hash, RING_SSL, DUST_SSL], buffers: [], topology: 'strip', varyings: { uv: 'vec2f' }, uniforms: UR, textures: {}, colorFormat: null, cull: 'none', depthBias: 2, depthBiasSlope: 2.5,
      vs: DUST_SH_VS, fs: DUST_SH_FS,
    });
    pFlame = gfx.pipeline({
      name: 'ringFlame', lib, buffers: [], topology: 'strip', cull: 'none', blend: 'premul', depthWrite: false, depthFunc: 'lequal',
      varyings: { uv: 'vec2f', col: 'vec4f', sh: 'vec4f' }, uniforms: { a: 'vec4f', b: 'vec4f', c: 'vec4f' }, textures: { tSky: '2d' }, vs: FLAME_VS, fs: SPARK_FS,
    });
    pLight = gfx.pipeline({
      name: 'ringLight', lib: [SL.common, SL.fog, SL.depth, RING_SSL], buffers: [], topology: 'strip', cull: 'none', blend: 'add', depth: false, depthTest: false,
      varyings: { uv: 'vec2f' }, uniforms: { a: 'vec4f', b: 'vec4f', c: 'vec4f' }, textures: { tDepth: 'depth', tSky: '2d' }, vs: LIGHT_VS, fs: LIGHT_FS,
    });
    RG.pipes = [pDust, pDustSh, pFlame, pLight];
    if (gfx.finishPipelineAsync) for (const P of RG.pipes) gfx.finishPipelineAsync(P).catch(e => console.warn('rings pipeline', P.name, e && e.message ? e.message : e));
  };
  const active = () => RG.on && gfx && typeof Game !== 'undefined' && Game.s && (Game.mode === 'run' || Game.mode === 'hold') && drawList.length;
  RG.drawShadow = function () {
    if (!active()) return;
    for (const d of drawList) if (ringLive(d)) { const u = ringU(d, lastT % 4096); gfx.draw(pDustSh, { u, count: 4, instances: u.e[0] + u.e[1] }); }
  };
  RG.drawScene = function () {
    if (!active()) return;
    const T = lastT % 4096, tex = { tSky: Sky.lut };
    for (const d of drawList) {
      if (d.flameA > 0.01) gfx.draw(pFlame, { u: { a: [d.c[0], d.c[1], d.c[2], d.flameSc], b: [d.flameA, d.sz, d.tint, 0], c: [T, d.r.id % 4096, d.night, 0] }, tex, count: 4, instances: 2 + TONGUES });
      if (ringLive(d)) {
        const u = ringU(d, T);
        gfx.draw(pDust, { u, tex, count: 4, instances: u.e[0] + u.e[1] + u.e[2] });
      }
    }
  };
  // the ring's light on what is round it: the snow under it, the skier riding through, a tree beside it
  RG.drawLight = function (R) {
    if (!active()) return;
    const tex = { tDepth: R.depth, tSky: Sky.lut };
    for (const d of drawList) {
      const k = d.night * 0.85 + 0.15;
      if (ringLive(d)) { const I = 0.16 * k * d.A * d.near * Math.pow(1 - d.dis, 2); if (I > 0.002) gfx.draw(pLight, { u: { a: [d.c[0], d.c[1], d.c[2], d.r.r * d.open], b: [0.10, 0.95, 0.55, I], c: [d.r.r * d.open + 4.5, 0, 0, 0] }, tex, count: 4 }); }
      if (d.flameA > 0.01) { const I = 0.30 * k * d.flameA * d.flameSc; gfx.draw(pLight, { u: { a: [d.c[0], d.c[1], d.c[2], 0], b: [0.15, 1.0, 0.80, I], c: [5.5 * Math.min(1.6, d.flameSc), 0, 0, 0] }, tex, count: 4 }); }
    }
  };

  // ---- 穿圈拖影 (用户 18:51 UTC: 钻进光圈的时候来一个延迟摄影、拖影子的效果，试一下，只是一个分支; 18:53 UTC: 每隔比如 0.5 米留一个残影).
  // Like a sequence photo of a skier: from a few metres before a ring until just after it, every 0.5 m the skier leaves a see-through copy of
  // himself (his pose at that moment), which fades in about half a second. Only the body, never the camera or the time: the game runs on as is.
  if (typeof Variants !== 'undefined') Variants.def('rtrail', '穿圈拖影', [['off', '关'], ['a', '残影·白'], ['b', '残影·光圈色']], 'off');
  const TR = { list: [], last: null, now: 0, done: 0, passT: null, STEP: 0.5, LIFE: 0.8, REACH: 3.2, BEFORE: 7, AFTER: 0.4 };
  function trail() {
    const mode = typeof Variants !== 'undefined' ? Variants.val.rtrail : 'off', T = Game.runT || 0;          // (game time: a pause or a test stepping frame by frame keeps them as they were)
    // (Mac 截图 19:00 UTC: at 90 km/h half a second of copies reached back past the camera and filled the screen with huge ghosts): the copies
    // are kept only while they are within REACH metres of the skier, so the chase camera always looks at them from behind, never through them
    const P0 = Game.s ? Game.s.p : [0, 0, 0];
    for (const g of TR.list) g.d = Math.hypot(g.w[0] - P0[0], g.w[1] - P0[1], g.w[2] - P0[2]);
    TR.list = TR.list.filter(g => T - g.t < TR.LIFE && T >= g.t && g.d < TR.REACH); TR.now = T;
    if (!mode || mode === 'off' || typeof Skier === 'undefined' || !Skier.ghostSnap) { TR.list.length = 0; TR.last = null; return; }
    const S = Game.s, s = -S.p[2], done = RG.passed + RG.missed;
    if (done !== TR.done) { TR.done = done; TR.passT = T; }
    const cur = RG.rings.find(r => r.pass < 0 && !r.skip);
    const on = (cur && cur.s - s < TR.BEFORE) || (TR.passT != null && T - TR.passT < TR.AFTER);
    if (!on) { TR.last = null; return; }
    const p = [S.p[0], S.p[1], S.p[2]];
    if (TR.last && Math.hypot(p[0] - TR.last[0], p[1] - TR.last[1], p[2] - TR.last[2]) < TR.STEP) return;
    TR.last = p;
    const g = Skier.ghostSnap(Render.origin, T); if (!g) return; g.w = p; g.d = 0;
    TR.list.push(g); while (TR.list.length > 15) TR.list.shift();          // (the bone copies are a ring of 16: never draw one already written over)
  }
  RG.ghosts = () => TR.list.length;          // (for test scripts)
  RG.drawGhosts = function () {
    if (!TR.list.length || !RG.on || typeof Game === 'undefined' || !Game.s || !Skier.drawGhosts) return;
    const o = Render.origin, mode = Variants.val.rtrail, n = TR.list.length, out = [];
    for (let i = 0; i < n - 1; i++) {          // oldest first; the newest one sits in the skier, left out
      const g = TR.list[i], age = cl((TR.now - g.t) / TR.LIFE, 0, 1), far = cl(g.d / TR.REACH, 0, 1), a = Math.pow(1 - far, 1.3) * Math.pow(1 - age, 1.5) * 0.55;
      if (a < 0.01) continue;
      const q = mode === 'b' ? [0.25 + 0.4 * far, 1.0 - 0.6 * far, 0.7 + 0.3 * far, 0.85] : [0.85, 0.93, 1.0, 0.8];
      out.push({ tex: g.tex, p: [g.o[0] - o[0], g.o[1] - o[1], g.o[2] - o[2], a], q });
    }
    Skier.drawGhosts(out);
  };

  // ---- 光圈路线 (用户 17:18 UTC: 先按速降线、探索线的光圈路线做一个；开始要不要倒计时、结束怎么提示、成绩页都要先想清楚).
  // The first line is a downhill line (速降线) over the designed run: its rings stand in the same places every time (a fixed seed for each
  // line and 光圈难度), so it can be learnt. Start: from the gate the skier is held while 3, 2, 1, 出发 counts down, the rings ahead already
  // lit so the line can be read; on 出发 the skier pushes off and the clock starts (the same moment for everyone). In the run: the clock at the
  // top (penalties already in it), rings and penalty below it, a red '+4' by the clock for a missed ring, each station's split flashed
  // green or red against the best. The last ring is the finish, big and in the middle of the run: through it the clock stops and flares, the
  // time comes up in the middle, and a card slides in from the right while the skier rides on (no rings after it: free skiing again).
  // Backspace starts the line again from the gate; on the card Enter = 再来一局, Esc = 继续滑. Records stay on this device.
  if (typeof Variants !== 'undefined') Variants.def('rline', '光圈路线', [['off', '关'], ['a', '速降·整圈'], ['b', '速降·前三站']], 'off');
  const LINES = { a: { n: 12, name: '速降线 · 整圈' }, b: { n: 3, name: '速降线 · 前三站' } };
  const PEN = { a: 2, b: 4, c: 5 }, DNAME = { a: '轻松', b: '标准', c: '难' }, DNEXT = { a: 'b', b: 'c' };
  const L = { id: null, diff: null, st: 'idle', seed: 1, fin: false, sEnd: 0, segs: null, cut: [], names: [], split: [], ci: 0, pen: 0, missSeen: 0, cT: 0, lastF: 0, el: null, rec: null };
  const diffKey = () => (typeof Variants !== 'undefined' && Variants.val.ringdiff) || 'b';
  const fmt = t => { t = Math.max(0, t); const m = Math.floor(t / 60), r = t - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1); };
  const sgn = d => Math.abs(d) < 0.05 ? '持平' : (d < 0 ? '−' : '+') + Math.abs(d).toFixed(1);
  function lineEnd() {
    if (L.sEnd && L.segs === Course.segs && L.seg0 === Course.segs[0]) return L.sEnd;
    const n = LINES[L.id].n, segs = Course.segs;
    for (let k = 0; segs.length <= n && k < 40; k++) { const g = segs[segs.length - 1]; Course.segAt(g ? g.s0 + g.len + 10 : 10); }
    L.segs = segs; L.seg0 = segs[0]; L.sEnd = segs[n].s0;
    L.cut = segs.slice(1, n + 1).map(g => g.s0);
    L.names = segs.slice(0, n).map((g, i) => (i + 1) + ' ' + ((typeof SEG_NAMES !== 'undefined' && SEG_NAMES[g.type]) || g.type));
    return L.sEnd;
  }
  function beep(f, d, g) {
    try { const A = Sound.ctx; if (!A || !Sound.on) return; const o = A.createOscillator(), v = A.createGain(), t = A.currentTime; o.type = 'sine'; o.frequency.value = f; v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + 0.012); v.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(v); v.connect(A.destination); o.start(t); o.stop(t + d + 0.05); } catch (e) { }
  }
  const recKey = () => 'coldsmoke.line.' + L.id + '.' + diffKey();
  // (records go through Store where it is there (00d_store.js): in the Xiaohongshu container it keeps them when the page's own storage is not kept)
  const ST = () => typeof Store !== 'undefined' && Store.getJSON ? Store : null;
  function recLoad() { try { const S = ST(); if (S) { if (S.durable) S.durable(recKey()); return S.getJSON(recKey()) || null; } return JSON.parse(localStorage.getItem(recKey()) || 'null'); } catch (e) { return null; } }
  function recSave(r) { try { const S = ST(); if (S) { if (S.durable) S.durable(recKey()); S.setJSON(recKey(), r); return; } localStorage.setItem(recKey(), JSON.stringify(r)); } catch (e) { } }

  // ---- what is on the screen
  function ui() {
    if (L.el) return L.el;
    const d = document.createElement('div'); d.id = 'rline';
    d.innerHTML = '<style>#rline{position:fixed;inset:0;pointer-events:none;z-index:4;font-family:system-ui,-apple-system,sans-serif;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.5)}'
      + '#rline .tm{position:absolute;top:10px;left:50%;transform:translateX(-50%);font:600 30px/1 system-ui,sans-serif;font-variant-numeric:tabular-nums;letter-spacing:.02em;transition:transform .25s,color .25s}'
      + '#rline .tm.fin{color:#ffe9a8;transform:translateX(-50%) scale(1.25)}'
      + '#rline .sub{position:absolute;top:46px;left:50%;transform:translateX(-50%);font:500 12px/1 system-ui,sans-serif;letter-spacing:.12em;opacity:.85;white-space:nowrap}'
      + '#rline .pop{position:absolute;top:12px;left:calc(50% + 74px);font:700 18px/1 system-ui,sans-serif;color:#ff6b6b;opacity:0;transition:opacity .2s,transform .8s}'
      + '#rline .pop.on{opacity:1;transform:translateY(-6px)}'
      + '#rline .spl{position:absolute;top:66px;left:50%;transform:translateX(-50%);font:600 13px/1 system-ui,sans-serif;letter-spacing:.06em;opacity:0;transition:opacity .3s;white-space:nowrap}'
      + '#rline .spl.on{opacity:1}#rline .g{color:#7dffb0}#rline .r{color:#ff8a8a}'
      + '#rline .cd{position:absolute;top:38%;left:50%;transform:translate(-50%,-50%);font:700 96px/1 system-ui,sans-serif;opacity:0;transition:opacity .15s}'
      + '#rline .cd.on{opacity:1}'
      + '#rline .ban{position:absolute;top:34%;left:50%;transform:translate(-50%,-50%);text-align:center;opacity:0;transition:opacity .4s}'
      + '#rline .ban.on{opacity:1}#rline .ban b{display:block;font:700 56px/1.05 system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#ffe9a8}#rline .ban i{display:block;font:500 15px/1.6 system-ui,sans-serif;font-style:normal;letter-spacing:.1em}'
      + '#rline .card{position:absolute;top:50%;right:16px;width:min(320px,44vw);max-height:84vh;overflow:auto;transform:translate(120%,-50%);transition:transform .45s cubic-bezier(.2,.8,.2,1);background:rgba(14,20,32,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:14px;padding:14px 16px;pointer-events:auto;text-shadow:none;font-size:12px}'
      + '#rline .card.on{transform:translate(0,-50%)}#rline .card h3{margin:0 0 2px;font:600 12px/1.4 system-ui,sans-serif;letter-spacing:.12em;opacity:.7}'
      + '#rline .card .big{font:700 34px/1.1 system-ui,sans-serif;font-variant-numeric:tabular-nums}#rline .card .dl{font-weight:600;margin:2px 0 8px}'
      + '#rline .card .row{display:flex;gap:12px;opacity:.85;margin-bottom:8px}#rline table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}'
      + '#rline td,#rline th{padding:3px 2px;text-align:right;font-weight:500}#rline th{opacity:.55;font-size:11px}#rline td:first-child,#rline th:first-child{text-align:left}'
      + '#rline tr.worst td{background:rgba(255,120,120,.14)}#rline .tip{margin-top:6px;opacity:.75}#rline .tip:empty{display:none}'
      + '#rline .cmp{display:flex;gap:6px;margin-top:10px}#rline .cmp div{flex:1;background:rgba(255,255,255,.07);border-radius:8px;padding:6px 8px}#rline .cmp span{display:block;font-size:10px;opacity:.6;letter-spacing:.08em}#rline .cmp b{display:block;font:600 15px/1.3 system-ui,sans-serif;font-variant-numeric:tabular-nums}'
      + '#rline .bt{display:flex;gap:8px;margin-top:12px}#rline button{flex:1;border:0;border-radius:9px;padding:9px 0;font:600 13px system-ui,sans-serif;cursor:pointer;background:rgba(255,255,255,.14);color:#fff}#rline button.p{background:#7dffb0;color:#0b1a12}</style>'
      + '<div class="tm"></div><div class="sub"></div><div class="pop"></div><div class="spl"></div><div class="cd"></div><div class="ban"><b></b><i></i></div><div class="card"></div>';
    document.body.appendChild(d); L.el = d;
    d.addEventListener('click', e => { const a = e.target && e.target.dataset && e.target.dataset.a; if (a === 'again') lineRestart(); else if (a === 'harder') lineHarder(); else if (a === 'free') lineFree(); });
    L.q = k => d.querySelector('.' + k);
    return d;
  }
  function show(on) { const d = ui(); d.style.display = on ? '' : 'none'; }
  function setTxt(k, t) { const e = L.q(k); if (e.textContent !== t) e.textContent = t; }
  function flash(k, html, ms) { const e = L.q(k); e.innerHTML = html; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('on'), ms); }
  function hideAll() { if (!L.el) return; for (const k of ['pop', 'spl', 'cd', 'ban', 'card']) L.q(k).classList.remove('on'); L.q('tm').classList.remove('fin'); }

  function lineSetup() {
    L.diff = diffKey(); L.st = 'idle'; L.sEnd = 0; L.segs = null; L.fin = false;
    L.seed = 1 + ((L.id || 'x').charCodeAt(0) * 7919 + L.diff.charCodeAt(0) * 104729) % 2147480000;
    if (L.el) { hideAll(); show(!!L.id); setTxt('tm', ''); setTxt('sub', ''); }
    reset();
  }
  // armed instead of pushing off: held at the gate, the count-down runs
  function lineArm() {
    lineSetup(); ui(); show(true); hideAll();
    L.st = 'count'; L.cT = 0; L.lastK = 4; Game.mode = 'hold';
    setTxt('tm', fmt(0)); setTxt('sub', LINES[L.id].name + ' · ' + DNAME[L.diff]);
  }
  function lineGo() {
    L.st = 'go'; L.pen = 0; L.split = []; L.ci = 0; L.missSeen = 0; L.rec = recLoad();
    Game.mode = 'title'; GS0.call(Game);          // (the game's own push-off: G.start sets the clock to 0 here)
    lineEnd();
  }
  function lineFinish() {
    if (L.st !== 'go') return;
    L.st = 'done'; L.tEnd = Game.runT; L.split.push(L.tEnd); brake(true);
    const p = PEN[L.diff] || 4, miss = RG.missed, score = L.tEnd + miss * p, tot = RG.passed + RG.missed;
    const seg = L.split.map((t, i) => t - (i ? L.split[i - 1] : 0));
    const old = L.rec, best = old && old.best, segBest = old && old.seg || [];
    const isNew = !best || score < best.score - 1e-6;
    const rec = { best: isNew ? { score, t: L.tEnd, miss, tot, date: Date.now() } : best, seg: seg.map((d, i) => segBest[i] != null ? Math.min(segBest[i], d) : d), runs: ((old && old.runs) || 0) + 1 };
    recSave(rec);
    try { if (typeof Cards !== 'undefined' && Cards.emit) Cards.emit('ring.line', { line: 'speed', full: miss === 0, t: L.tEnd, missed: miss }); } catch (e) { }          // (集卡: the card system picks it up when it is there)
    setTxt('tm', fmt(score)); L.q('tm').classList.add('fin'); setTxt('sub', '光圈 ' + RG.passed + ' / ' + tot + (miss ? ' · 罚时 +' + miss * p + ' 秒' : ' · 全部穿过'));
    const ban = L.q('ban'); ban.querySelector('b').textContent = fmt(score);
    ban.querySelector('i').textContent = isNew ? (best ? '新纪录！快了 ' + (best.score - score).toFixed(1) + ' 秒' : '第一次完成') : '比最好慢 ' + (score - best.score).toFixed(1) + ' 秒';
    ban.classList.add('on'); setTimeout(() => ban.classList.remove('on'), 1400);          // (gone before the card slides in)
    beep(880, 0.25, 0.18); setTimeout(() => beep(1320, 0.6, 0.16), 140);
    // the card: what this run was, against the best before it
    let worst = -1, wd = 0;
    const rows = seg.map((d, i) => { const b = segBest[i]; const df = b != null ? d - b : null; if (df != null && df >= 0.3 && df > wd) { wd = df; worst = i; } return { n: L.names[i] || (i + 1) + '', d, b, df }; });
    const td = r => '<td>' + (r.b != null ? fmt(r.b) : '—') + '</td><td class="' + (r.df == null ? '' : r.df <= 0 ? 'g' : 'r') + '">' + (r.df == null ? '' : sgn(r.df)) + '</td>';
    L.q('card').innerHTML = '<h3>' + LINES[L.id].name + ' · ' + DNAME[L.diff] + '</h3><div class="big">' + fmt(score) + '</div>'
      + '<div class="dl ' + (isNew ? 'g' : 'r') + '">' + (isNew ? (best ? '新纪录 · 快了 ' + (best.score - score).toFixed(1) + ' 秒' : '第一次完成 · 这就是你的纪录') : '最好 ' + fmt(best.score) + ' · 慢了 ' + (score - best.score).toFixed(1) + ' 秒') + '</div>'
      + '<div class="row"><span>用时 ' + fmt(L.tEnd) + '</span><span>光圈 ' + RG.passed + ' / ' + tot + '</span><span>罚时 ' + (miss ? '+' + miss * p + ' 秒' : '0') + '</span></div>'
      + '<table><tr><th>分站</th><th>本局</th><th>之前最好</th><th></th></tr>' + rows.map((r, i) => '<tr' + (i === worst ? ' class="worst"' : '') + '><td>' + r.n + '</td><td>' + fmt(r.d) + '</td>' + td(r) + '</tr>').join('') + '</table>'
      + '<div class="tip">' + [miss ? '漏了 ' + miss + ' 个圈，罚时 +' + miss * p + ' 秒' : '', worst >= 0 ? '最慢的一站：' + rows[worst].n + '（比最好慢 ' + wd.toFixed(1) + ' 秒）' : ''].filter(Boolean).join('；') + '</div>'
      + '<div class="cmp"><div><span>个人最好</span><b>' + fmt(rec.best.score) + '</b></div><div><span>全部最好</span><b class="gtop">…</b></div><div><span>排名</span><b class="grank">…</b></div></div>'
      + '<div class="bt"><button class="p" data-a="again">再来一局 ⏎</button>' + (DNEXT[L.diff] ? '<button data-a="harder">增加难度 ↑</button>' : '') + '<button data-a="free">继续滑 Esc</button></div>';
    board(score);
    clearTimeout(L.cardT); L.cardT = setTimeout(() => { if (L.st === 'done') L.q('card').classList.add('on'); }, 1500);
  }
  // the boards (小红书 only): the best of everyone and this player's place, filled in when they come back
  function board(score) {
    const set = (a, b) => { const c = L.q('card'), x = c.querySelector('.gtop'), y = c.querySelector('.grank'); if (x) x.textContent = a; if (y) y.textContent = b; };
    if (typeof Rank === 'undefined' || !Rank.line || !Rank.on || L.diff !== 'b' || L.id !== 'a') { set('—', '—'); return; }
    Rank.line(score).then(r => { if (L.st !== 'done') return; if (!r) { set('—', '—'); return; } set(r.top != null ? fmt(r.top) : '—', r.rank != null ? (typeof r.rank === 'number' ? '第 ' + r.rank + ' 名' : r.rank) : '—'); });
  }
  // (用户 18:54 UTC: 结束后就可以停下来): through the finish the skier stops by himself, the way a skier does: held right over into a turn
  // across the hill until the skis stand still (the game's own turning brake, nothing pulls him), until 继续滑 or 再来一局 gives the skis back
  function brake(on) {
    if (typeof Input === 'undefined') return;
    if (!on) { if (L.braking) { Input.script = null; Input.faScript = null; L.braking = 0; } return; }
    const S = Game.s; L.braking = (S.v[0] || 0) >= 0 ? 1 : -1;
  }
  function lineHarder() { const n = DNEXT[L.diff]; if (!n) return; Variants.set('ringdiff', n); lineRestart(); }
  function lineRestart() {
    brake(false); hideAll(); L.st = 'idle';
    if (typeof UI !== 'undefined' && UI.toTop && UI.toTop()) setTimeout(() => { if (UI.state === 'title') UI.go(); }, 800);
  }
  function lineFree() { brake(false); L.q('card').classList.remove('on'); L.st = 'free'; setTxt('tm', ''); setTxt('sub', ''); }
  function lineFrame(T) {
    if (L.braking && typeof Input !== 'undefined') { if (L.st === 'done' && Game.mode === 'run') { Input.script = L.braking; Input.faScript = 0.6; } else brake(false); }
    const dt = cl(T - (L.lastF || T), 0, 0.1); L.lastF = T;
    ui();
    const G = Game, title = G.mode === 'title';
    if (title && L.st !== 'idle' && L.st !== 'count') { L.st = 'idle'; hideAll(); }
    show(L.st !== 'idle' && L.st !== 'free');
    if (L.st === 'count') {
      if (G.mode === 'run') G.mode = 'hold';          // (the menu let go during the count: the skier still waits for 出发)
      const held = typeof UI !== 'undefined' && (UI.open || UI.paused);
      if (!held) L.cT += dt;
      const k = 3 - Math.floor(L.cT / 0.8), cd = L.q('cd');
      if (k !== L.lastK) {
        L.lastK = k;
        if (k >= 1) { cd.textContent = k; cd.classList.add('on'); beep(660, 0.14, 0.16); }
        else { cd.textContent = '出发'; cd.classList.add('on'); beep(1320, 0.35, 0.18); clearTimeout(cd._t); cd._t = setTimeout(() => cd.classList.remove('on'), 700); lineGo(); }
      }
      return;
    }
    if (L.st === 'go') {
      const s = -G.s.p[2], p = PEN[L.diff] || 4;
      if (RG.missed > L.missSeen) { L.missSeen = RG.missed; flash('pop', '+' + p, 900); beep(220, 0.22, 0.14); }
      L.pen = RG.missed * p;
      while (L.ci < L.cut.length - 1 && s >= L.cut[L.ci]) {
        const t = G.runT, d = t - (L.ci ? L.split[L.ci - 1] : 0), b = L.rec && L.rec.seg && L.rec.seg[L.ci];
        L.split.push(t);
        flash('spl', (L.names[L.ci] || '') + '　' + fmt(d) + (b != null ? '　<span class="' + (d <= b ? 'g' : 'r') + '">' + sgn(d - b) + '</span>' : ''), 2200);
        L.ci++;
      }
      setTxt('tm', fmt(G.runT + L.pen));
      const cur = RG.rings.find(r => r.pass < 0 && !r.skip);
      setTxt('sub', '穿过 ' + RG.passed + (RG.missed ? ' · 漏 ' + RG.missed + ' · 罚时 +' + L.pen + ' 秒' : '') + (cur && cur.fin ? ' · 前方终点' : ''));
    }
  }
  RG.line = L; if (typeof window !== 'undefined') window.__rings = RG;          // (for test scripts)
  const GS0 = typeof Game !== 'undefined' ? Game.start : null;
  if (GS0) Game.start = function () { if (L.id && Game.s) { if (L.st !== 'count') lineArm(); return; } return GS0.apply(this, arguments); };
  if (typeof addEventListener !== 'undefined') addEventListener('keydown', e => {
    if (!L.id || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    const card = L.el && L.q('card').classList.contains('on');
    if (card && (e.code === 'Enter' || e.code === 'Escape')) { e.preventDefault(); e.stopImmediatePropagation(); if (e.code === 'Enter') lineRestart(); else lineFree(); return; }
    if (e.code === 'Backspace' && typeof UI !== 'undefined' && UI.state === 'run' && !UI.open) { e.preventDefault(); e.stopImmediatePropagation(); lineRestart(); }
  }, true);
  RG.frame = function () {
    const lid = typeof Variants !== 'undefined' && devOn() && LINES[Variants.val.rline] ? Variants.val.rline : null;
    if (lid !== L.id || (lid && diffKey() !== L.diff)) { L.id = lid; lineSetup(); }
    const want = typeof Variants !== 'undefined' && (Variants.val.rings === 'on' || !!L.id) && devOn();
    if (want !== RG.on) { RG.on = want; reset(); hud(); }
    const T = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    if (L.id && typeof document !== 'undefined') try { lineFrame(T); } catch (e) { if (!RG.lerr) { RG.lerr = 1; console.warn('line:', e); } }
    // (用户 05:16 UTC: 拍照时光圈不见了): held (the pause menu, 拍照) the world stands still, and so do the rings: drawn as they were, time stopped.
    // The count-down at the gate holds the skier the same way, but the rings ahead are already there and alive, so the line can be read
    const counting = L.st === 'count';
    if (RG.on && typeof Game !== 'undefined' && Game.mode === 'hold' && !counting) return;
    if (!RG.on || typeof Game === 'undefined' || !Game.s || (Game.mode !== 'run' && !counting)) { drawList = []; if (RG.hud) RG.hud.style.display = 'none'; return; }
    lastT = T;
    RG.n++; try { update(T); prep(T); hud(); trail(); } catch (e) { drawList = []; if (!RG.err) { RG.err = 1; console.warn('rings:', e); } }
  };
  // hang on the game's own draw: the rings are worked out just before each frame, drawn inside it by the render passes
  if (typeof Render !== 'undefined') {
    const R0 = Render.render; Render.render = function () { RG.frame(); return R0.apply(this, arguments); };
    const I0 = Render.init; Render.init = function (g) { const out = I0.apply(this, arguments); try { RG.init(g); } catch (e) { console.warn('rings init:', e); } return out; };
    // (a pipeline that failed to build must never take the game's frame down with it: the rings are then simply not drawn)
    const safe = f => R => { try { f(R); } catch (e) { if (!RG.gerr) { RG.gerr = 1; console.warn('rings draw:', e && e.message ? e.message : e); } } };
    Render.passes.shadow.push(safe(R => RG.drawShadow(R)));
    Render.passes.transparent.push(safe(R => RG.drawScene(R)));
    Render.passes.transparent.push(safe(R => RG.drawGhosts(R)));
    Render.passes.fx.push(safe(R => RG.drawLight(R)));
  }
  return RG;
})();

// ---- shaders. Colours are linear; light is in units of film white (ringE: one over the exposure, so 1 is white on the screen at any hour)
const RING_SSL = `
fn ringE() -> f32 { return 1.0 / max(U.ambSky.w, 1e-4); }
fn ringGrn(n: f32) -> vec3f { return mix(vec3f(0.033, 0.896, 0.392), vec3f(0.021, 1.0, 0.262), n); }
fn ringVio(n: f32) -> vec3f { return mix(vec3f(0.305, 0.188, 0.791), vec3f(0.402, 0.045, 0.716), n); }
// green low, violet high; by day the violet is held back (pale violet on bright snow and sky read as a missing top half)
fn ringHue(a: f32, e: f32, n: f32) -> vec3f { return mix(ringGrn(n), ringVio(n), saturate((sin(a) + 1.0) * 0.5 * mix(0.3, 0.75, n) + e * mix(0.5, 1.0, n))); }
// a grain on the screen: drawn at its true size, or minPx, whichever is larger (k: how much of the drawn disc it really fills, so a far
// grain enlarged to stay a pixel keeps its own light), streaked from p0 to p1. Its depth is p0's: the scene's depth test hides it
struct RQ { clip: vec4f, uv: vec2f, k: f32, hl: f32 }
fn ringQuad(corner: vec2f, p0: vec3f, p1: vec3f, rw: f32, minPx: f32) -> RQ {
  var q: RQ; q.clip = vec4f(0.0, 0.0, -2.0, 1.0); q.uv = vec2f(0.0); q.k = 0.0; q.hl = 0.0;
  let c0: vec4f = U.viewProj * vec4f(p0, 1.0); let c1: vec4f = U.viewProj * vec4f(p1, 1.0);
  if (c0.w < 0.3 || c1.w < 0.3) { return q; }
  let asp: f32 = U.camUp.w;
  let s0: vec2f = c0.xy / c0.w * vec2f(asp, 1.0); let s1: vec2f = c1.xy / c1.w * vec2f(asp, 1.0);
  let rt: f32 = rw / (c0.w * U.camRight.w);
  let r: f32 = max(rt, minPx * 2.0 * U.res.w);
  let ax: vec2f = s1 - s0; let L: f32 = length(ax);
  var dir: vec2f = vec2f(0.0, 1.0); if (L > 1e-6) { dir = ax / L; }
  let nr: vec2f = vec2f(-dir.y, dir.x);
  let sp: vec2f = mix(s0, s1, corner.y * 0.5 + 0.5) + dir * (corner.y * r) + nr * (corner.x * r);
  q.clip = vec4f(sp.x / asp * c0.w, sp.y * c0.w, c0.z, c0.w);
  q.hl = 0.5 * L / r;
  q.uv = vec2f(corner.x, corner.y * (1.0 + q.hl));
  q.k = min(1.0, sq(rt / r));
  return q;
}
`;
// the grains: kind 0 the dense swarm along the ring, kind 1 the outer grains drifting off and turning violet, kind 2 the curtain's threads (none drawn now).
// Each is a pure function of (index, time): a life of a few seconds, then it is born again somewhere else on the ring
// one grain of a ring, a pure function of (index, time): where it is, how bright, how big
const DUST_SSL = `
struct DG { p: vec3f, b: f32, wsz: f32, minPx: f32, up: f32, col: vec3f }
fn dustGrain(i: u32) -> DG {
  var g: DG;
  let C: vec3f = M.a.xyz; let R0: f32 = M.a.w; let open: f32 = M.b.x; let dis: f32 = M.b.y;
  let A: f32 = M.b.z; let nearK: f32 = M.b.w; let T: f32 = M.c.x; let rid: u32 = u32(M.c.y); let hitK: f32 = M.c.z; let sz: f32 = M.c.w;
  let n: f32 = M.d.x; let grown: f32 = M.d.z;
  let NI: u32 = u32(M.e.x); let NO: u32 = u32(M.e.y); let NC: f32 = M.e.z;
  var kind: u32 = 0u; if (i >= NI) { kind = 1u; } if (i >= NI + NO) { kind = 2u; }
  let hs: vec3f = hashu3(i * 7u + rid * 7919u + 11u);
  var L: f32 = mix(1.2, 2.2, hs.x); if (kind == 1u) { L = mix(1.0, 1.8, hs.x); }
  let ph: f32 = (T + hs.y * L) / L; let u: f32 = fract(ph); let gen: u32 = u32(floor(ph));
  let h: vec3f = hashu3(i * 13u + gen * 104729u + rid * 7919u + 3u);
  let h2: vec3f = hashu3(i * 17u + gen * 15485863u + rid * 31u + 5u);
  var ang: f32 = h.x * 6.2831853; var rr: f32 = R0; var dz: f32 = 0.0; var dy: f32 = 0.0;
  var b: f32 = 0.0; var wsz: f32 = 0.02; var minPx: f32 = 1.3; var col: vec3f = vec3f(0.0); var up: f32 = 0.0;
  if (kind == 0u) {
    // (用户 05:22 UTC: 整个圈要明显是点组成的，中间很密，点都在动、动得快，轻、飘): no solid tube any more. The grains crowd toward the
    // ring's middle line (rad ~ h.y squared), each running along the ring at its own pace one way or the other and jittering fast on its spot
    let rad: f32 = 0.36 * sz * h.y * h.y; let th: f32 = h.z * 6.2831853;
    let jf: f32 = 3.0 + 4.0 * h2.x;
    rr = R0 + rad * cos(th) + 0.035 * sz * sin(T * jf + h.x * 40.0);
    dz = rad * sin(th) + 0.035 * sz * cos(T * jf * 0.83 + h.y * 40.0);
    let flow: f32 = (0.5 + 1.4 * h2.y) * select(-1.0, 1.0, h2.z > 0.5) / max(R0, 1.0);
    ang = ang + flow * u * L + 0.02 * sin(T * jf * 1.3 + h.z * 40.0);
    let fade: f32 = min(1.0, min(u / 0.12, (1.0 - u) / 0.2));
    let blink: f32 = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(T * (4.0 + 6.0 * h2.x) + h.y * 30.0), 3.0);
    let qn: f32 = saturate((grown - (0.3 + 0.45 * h2.y)) / 0.25);
    b = fade * blink * qn * (1.0 - 0.5 * h.y);
    wsz = 0.032 * sz * (0.6 + 0.9 * h2.z); minPx = 1.4;
    col = mix(ringHue(ang, 0.0, n), vec3f(0.9, 1.0, 0.97), 0.4 * h2.x * h2.x);
  } else if (kind == 1u) {
    let ou: f32 = 0.15 + 0.85 * h2.x;
    rr = R0 + (h.y - 0.5) * 0.3 * sz + ou * 2.0 * sz * u;
    dz = (h.z - 0.5) * 0.6 * sz * (0.3 + u);
    dy = 0.5 * u * sz;
    ang = ang + 0.05 * sin(T + h.y * 30.0);
    b = min(1.0, u / 0.2) * (1.0 - u) * 0.6;
    wsz = 0.08 * sz * (0.9 + 0.8 * h2.y); minPx = 2.2;
    col = ringHue(ang, 0.4 * u, n);
  } else {
    let j: f32 = f32(i - NI - NO);
    ang = (j + 0.5 * hs.z) / NC * 6.2831853;
    let w: f32 = pow(0.5 + 0.5 * sin(ang * 5.0 - T * 1.6 + sin(ang * 3.0 + T * 0.7)), 3.0);
    let curt: f32 = sq(saturate((grown - 0.6) / 0.4)) * (1.0 - saturate(dis * 2.5));
    b = 0.55 * w * curt;
    rr = R0 + 0.30 * sz * (hs.x - 0.5); dz = 0.30 * sz * (hs.y - 0.5);
    wsz = 0.02 * sz; minPx = 1.1; up = (0.25 + 0.35 * w) * sz;
    col = ringHue(ang, 0.25, n);
  }
  if (dis > 0.0) {
    let hd: vec3f = hashu3(i * 23u + rid * 101u + 9u);
    // a splash: a quick burst out of the tube (half its way in the first half second), then a slow drift and a slow fade. The grains are
    // thrown every way off the tube, outward and up a little, and carried on along the line the skier rides (toward -z)
    let d: f32 = saturate(dis * (1.0 + 0.5 * hd.x) - 0.06 * hd.y); let e: f32 = 1.0 - pow(1.0 - d, 4.0);
    let th2: f32 = hd.y * 6.2831853; let sp: f32 = (0.5 + 1.3 * hd.z) * sz;
    rr = rr + e * (sp * cos(th2) + R0 * 0.25 * hd.x);
    dz = dz + e * (sp * sin(th2) - (0.6 + 2.6 * hd.z));
    dy = dy + e * (0.3 + 0.9 * hd.x);
    ang = ang + e * (hd.z - 0.5) * 0.25;
    b = b * (1.0 + 2.2 * exp(-d * 10.0)) * pow(1.0 - d, 1.3) * hitK;
  }
  let ro: f32 = rr * open;
  g.p = C + vec3f(cos(ang) * ro, sin(ang) * ro + dy, dz);
  g.b = b * A; g.wsz = wsz; g.minPx = minPx; g.up = up; g.col = mix(col, vec3f(1.0, 0.97, 0.9), M.d.y);
  return g;
}
`;
const DUST_VS = `
fn vert(a: VIn) -> VOut { var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  v.clip = vec4f(0.0, 0.0, -2.0, 1.0); v.uv = vec2f(0.0); v.col = vec4f(0.0); v.sh = vec4f(0.0);
  let g: DG = dustGrain(a.iid);
  if (g.b < 0.003) { return v; }
  let q: RQ = ringQuad(corner, g.p, g.p + vec3f(0.0, g.up, 0.0), g.wsz, g.minPx);
  let fog: f32 = 1.0 - fogAmount(g.p);
  let bright: f32 = g.b * M.b.w * mix(1.0, 1.2, M.d.x) * fog;
  v.clip = q.clip; v.uv = q.uv; v.sh = vec4f(q.hl, 0.0, 0.0, 0.0);
  v.col = vec4f(g.col * (bright * sqrt(q.k) * 6.0 * ringE()), mix(0.18, 0.0, M.d.x) * saturate(bright) * sqrt(q.k));
  return v; }
`;
// the grains' own shadow (用户 05:23 UTC: 影子也要由点投下、跟着点一起动): each grain that is lit enough is a small disc in the sun's shadow
// map, a little larger than the grain (one texel is 6 cm), so the shadow on the snow is a dappled band that moves and flickers with them
const DUST_SH_VS = `
fn vert(a: VIn) -> VOut { var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  v.uv = corner; v.clip = vec4f(0.0, 0.0, -2.0, 1.0);
  let g: DG = dustGrain(a.iid);
  if (g.b < 0.12) { return v; }
  let sp: vec4f = U.shadowVP * vec4f(g.p, 1.0);
  let r: f32 = (0.035 + 0.05 * saturate(g.b)) * M.c.w / U.misc.w;
  v.clip = vec4f(sp.xy + corner * r, sp.z, 1.0);
  return v; }
`;
const DUST_SH_FS = `fn frag(v: VOut) -> FOut { var o: FOut; if (dot(v.uv, v.uv) > 1.0) { discard; } o.color = vec4f(0.0); return o; }`;

// a flame: [0] the wide glow of the air round it, [1] its white-hot heart, [2..] tongues rising off it and turning violet
const FLAME_VS = `
fn vert(a: VIn) -> VOut { var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  v.clip = vec4f(0.0, 0.0, -2.0, 1.0); v.uv = vec2f(0.0); v.col = vec4f(0.0); v.sh = vec4f(0.0);
  let C: vec3f = M.a.xyz; let sc: f32 = M.a.w; let fa: f32 = M.b.x; let sz: f32 = M.b.y; let ti: f32 = M.b.z;
  let T: f32 = M.c.x; let rid: u32 = u32(M.c.y); let n: f32 = M.c.z;
  var tint: vec3f = vec3f(0.061, 1.0, 0.753);
  if (ti > 1.5) { tint = mix(ringGrn(n), ringVio(n), 0.5); } else if (ti > 0.5) { tint = ringGrn(n); }
  let i: u32 = a.iid;
  var p0: vec3f = C; var wsz: f32 = 0.1; var minPx: f32 = 1.0; var col: vec3f = tint; var b: f32 = 0.0; var shape: f32 = 0.0; var al: f32 = 0.0;
  if (i == 0u) {
    wsz = 3.2 * sz * min(sc, 1.6); minPx = 26.0 * U.res.y / 1170.0; b = 0.9 * mix(1.0, 0.8, n); shape = 1.0;
  } else if (i == 1u) {
    wsz = 0.38 * sz * sc; minPx = 4.0; col = vec3f(0.9, 1.0, 0.97); b = 6.0; shape = 2.0;
  } else {
    let fr: f32 = 1.7 + 0.8 * hashu(i * 3u + rid * 77u);
    let ph: f32 = T * fr + hashu(i * 5u + rid * 77u); let u: f32 = fract(ph); let gen: u32 = u32(floor(ph));
    let h: vec3f = hashu3(i * 11u + gen * 7717u + rid * 131u);
    let an: f32 = h.x * 6.2831853; let rr: f32 = 0.5 * sz * sc * sqrt(h.y);
    let hgt: f32 = 1.8 * sz * sc * (0.6 + 0.8 * hashu(i * 7u + rid * 3u));
    p0 = C + vec3f(rr * cos(an), u * hgt - 0.25 * sz * sc, rr * sin(an));
    wsz = 0.26 * sz * sc * pow(1.0 - u, 0.7) * (0.7 + 0.6 * h.z); minPx = 2.0;
    if (u < 0.3) { col = mix(vec3f(0.85, 1.0, 0.97), tint, u / 0.3); } else { col = mix(tint, ringVio(n), (u - 0.3) / 0.7); }
    b = 2.4 * pow(1.0 - u, 0.8) * (0.7 + 0.3 * sin(T * 23.0 + f32(i)));
    al = mix(0.2, 0.0, n);
  }
  let q: RQ = ringQuad(corner, p0, p0, wsz, minPx);
  let fog: f32 = 1.0 - fogAmount(p0);
  var k: f32 = sqrt(q.k); if (i == 0u) { k = 1.0; }          // (the glow keeps a share of its light when it is drawn larger than it is: it is the place's glow, not a point)
  v.clip = q.clip; v.uv = q.uv; v.sh = vec4f(0.0, shape, 0.0, 0.0);
  v.col = vec4f(col * (b * fa * fog * k * ringE()), al * saturate(b * fa) * k);
  return v; }
`;
const SPARK_FS = `
fn frag(v: VOut) -> FOut { var o: FOut;
  let d: f32 = length(vec2f(v.uv.x, max(abs(v.uv.y) - v.sh.x, 0.0)));
  if (d >= 1.0) { discard; }
  var pr: f32 = 0.8 * exp(-d * d * 9.0) + 0.2 * sq(1.0 - d);
  if (v.sh.y > 1.5) { pr = exp(-d * d * 6.0); } else if (v.sh.y > 0.5) { pr = exp(-d * 4.5) * sq(1.0 - d); }
  o.color = v.col * pr;
  return o; }
`;
// the light of a ring (a circle of light, M.a.w its radius) or of a flame (a point, M.a.w = 0) on the surfaces round it, read back from the
// scene's depth. M.b = colour, strength; M.c.x = how far it reaches
const LIGHT_VS = `
fn vert(a: VIn) -> VOut { var v: VOut;
  let corner: vec2f = vec2f(f32(a.vid & 1u), f32((a.vid >> 1u) & 1u)) * 2.0 - 1.0;
  v.uv = corner;
  let C: vec3f = M.a.xyz; let RL: f32 = M.c.x;
  let dist: f32 = length(C - U.camPos.xyz);
  let cp: vec4f = U.viewProj * vec4f(C, 1.0);
  if (dist < RL * 1.3) { v.clip = vec4f(corner, 0.5, 1.0); return v; }
  if (cp.w < 0.1) { v.clip = vec4f(0.0, 0.0, -2.0, 1.0); return v; }
  let r: f32 = RL * 1.3 / (cp.w * U.camRight.w);
  v.clip = vec4f(cp.x + corner.x * r / U.camUp.w * cp.w, cp.y + corner.y * r * cp.w, 0.5 * cp.w, cp.w);
  return v; }
`;
const LIGHT_FS = `
fn frag(v: VOut) -> FOut { var o: FOut;
  let zf: f32 = linDepth(texFetchD(tDepth, vec2i(v.clip.xy), 0));
  if (zf > 8000.0) { discard; }
  let ndc: vec2f = vec2f(v.clip.x * U.res.z * 2.0 - 1.0, 1.0 - v.clip.y * U.res.w * 2.0);
  let wp: vec3f = U.camPos.xyz + screenRay(ndc) * zf;
  let q: vec3f = wp - M.a.xyz;
  var d2: f32 = dot(q, q);
  if (M.a.w > 0.0) { d2 = sq(length(q.xy) - M.a.w) + q.z * q.z; }
  let fall: f32 = smoothstep(M.c.x, M.c.x * 0.5, length(q));
  let E: f32 = M.b.w / (d2 + 0.35) * fall;
  o.color = vec4f(M.b.rgb * (E * ringE() * (1.0 - fogAmount(wp))), 1.0);
  return o; }
`;
