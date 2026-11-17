// ---------------------------------------------------------------- 集卡: how a card is drawn (pure Canvas 2D, no pictures)
// Every card is a 3:4 card: the top seven tenths a picture, the bottom three its words, a thin gold rule round it (the interface's --sun).
// What the picture is depends on the card's art: { type: 'scenery' | 'emblem' | any later Cards.art, ... }. The frame and the words are the
// same for all, so a new way of drawing is only the picture.
//   scenery  the place itself, looked at from above it down the mountain: rows of the real snow (Course.height) far to near, trees as small
//            marks, the run as a gold line, the spot as a gold point under a thread of cold smoke (from the review's card-draw.js). Drawn only
//            on the card's own mountain; elsewhere it falls back to emblem.
//   emblem   the sky of the stamp it was collected under and a line drawing in the middle (Cards.glyph): animals, moments, route medals
// A card not yet collected: dark, the outline of its picture faint, a question mark, its hint.
const CardArt = self.CardArt = (() => {
  const A = { glyphs: {} };
  const RNG = seed => { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k), css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const GOLD = [255, 208, 138], INK = [5, 8, 13], SNOW = [244, 247, 251];
  // the four hours: zenith, horizon, far hills in the haze, the shaded snow near, the lit edge, the sun or moon (x, y, radius, colour), stars
  const TOD = A.TOD = {
    dawn: { top: [38, 52, 92], low: [246, 190, 160], far: [150, 150, 186], near: [44, 58, 96], rim: [255, 226, 205], orb: [0.74, 0.30, 9, [255, 236, 214]], stars: 0 },
    day: { top: [70, 128, 196], low: [214, 232, 246], far: [168, 196, 226], near: [58, 96, 150], rim: [255, 255, 255], orb: [0.27, 0.22, 8, [255, 252, 240]], stars: 0 },
    dusk: { top: [44, 40, 88], low: [250, 168, 110], far: [150, 120, 150], near: [48, 44, 84], rim: [255, 214, 170], orb: [0.30, 0.31, 10, [255, 222, 170]], stars: 0.25 },
    night: { top: [4, 8, 20], low: [22, 38, 74], far: [30, 46, 84], near: [10, 16, 34], rim: [150, 180, 230], orb: [0.72, 0.21, 7, [236, 240, 250]], stars: 1 },
  };
  const SONG = '"Noto Serif SC","Songti SC","STSong","Source Han Serif SC","Noto Serif CJK SC","SimSun",serif', LAT = '"Jost","Futura","Avenir Next","Century Gothic","Segoe UI",system-ui,sans-serif';
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  const text = (ctx, s, x, y, font, col, sp = 0, al = 'left', maxW) => { ctx.font = font; ctx.fillStyle = col; ctx.textAlign = al; ctx.textBaseline = 'alphabetic'; try { ctx.letterSpacing = sp + 'px'; } catch (e) { } if (maxW) ctx.fillText(s, x, y, maxW); else ctx.fillText(s, x, y); try { ctx.letterSpacing = '0px'; } catch (e) { } };

  // ---- line drawings (Cards.glyph(id, fn(ctx, s))): drawn round 0,0 with a half-size s, in the stroke already set
  A.glyph = (id, fn) => { A.glyphs[id] = fn; };
  const G = A.glyph;
  G('star', (c, s) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * 0.42 : s; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.stroke(); });
  G('ridge', (c, s) => { c.beginPath(); c.moveTo(-s, s * 0.6); c.lineTo(-s * 0.2, -s * 0.6); c.lineTo(s * 0.25, 0); c.lineTo(s * 0.55, -s * 0.3); c.lineTo(s, s * 0.6); c.stroke(); });
  G('kicker', (c, s) => { c.beginPath(); c.moveTo(-s, s * 0.6); c.quadraticCurveTo(0, s * 0.6, s * 0.35, -s * 0.2); c.lineTo(s * 0.35, s * 0.6); c.stroke(); c.beginPath(); c.setLineDash([s * 0.12, s * 0.16]); c.moveTo(s * 0.35, -s * 0.2); c.quadraticCurveTo(s * 0.8, -s * 0.9, s * 1.2, -s * 0.2); c.stroke(); c.setLineDash([]); });
  G('speed', (c, s) => { for (const [y, l] of [[-0.45, 1], [0, 1.4], [0.45, 0.8]]) { c.beginPath(); c.moveTo(-s * l * 0.7, s * y); c.lineTo(s * 0.7, s * y); c.stroke(); } c.beginPath(); c.moveTo(s * 0.45, -s * 0.75); c.lineTo(s * 1.0, 0); c.lineTo(s * 0.45, s * 0.75); c.stroke(); });
  G('aurora', (c, s) => { for (let k = 0; k < 3; k++) { c.beginPath(); for (let i = 0; i <= 24; i++) { const x = -s + i * s / 12, y = -s * 0.2 + k * s * 0.3 + Math.sin(i * 0.55 + k) * s * 0.22; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); } for (let i = 0; i < 9; i++) { const x = -s * 0.9 + i * s * 0.225; c.beginPath(); c.moveTo(x, -s * 0.85 + (i % 3) * s * 0.12); c.lineTo(x, -s * 0.55 + (i % 2) * s * 0.1); c.stroke(); } });
  G('flake', (c, s) => { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, ca = Math.cos(a), sa = Math.sin(a); c.beginPath(); c.moveTo(0, 0); c.lineTo(ca * s, sa * s); for (const k of [0.45, 0.72]) { const px = ca * s * k, py = sa * s * k, b = s * 0.22; c.moveTo(px, py); c.lineTo(px + Math.cos(a + 0.8) * b, py + Math.sin(a + 0.8) * b); c.moveTo(px, py); c.lineTo(px + Math.cos(a - 0.8) * b, py + Math.sin(a - 0.8) * b); } c.stroke(); } });
  G('ring', (c, s) => { c.beginPath(); c.ellipse(0, 0, s * 0.62, s * 0.9, 0, 0, 7); c.stroke(); c.beginPath(); c.setLineDash([s * 0.08, s * 0.14]); c.moveTo(-s * 1.1, s * 0.75); c.quadraticCurveTo(0, s * 0.1, s * 1.1, -s * 0.55); c.stroke(); c.setLineDash([]); });
  G('lantern', (c, s) => { c.beginPath(); c.moveTo(0, -s); c.lineTo(0, -s * 0.6); c.stroke(); rr(c, -s * 0.38, -s * 0.6, s * 0.76, s * 1.05, s * 0.18); c.stroke(); c.beginPath(); c.moveTo(-s * 0.5, s * 0.45); c.lineTo(s * 0.5, s * 0.45); c.stroke(); c.beginPath(); c.arc(0, -s * 0.07, s * 0.14, 0, 7); c.stroke(); });
  // animals: a few lines each, the thing a child would draw first (antlers, long ears, the brush, the horns, the wings)
  G('deer', (c, s) => { c.beginPath(); c.moveTo(-s * 0.7, s * 0.05); c.quadraticCurveTo(-s * 0.1, -s * 0.12, s * 0.42, s * 0.02); c.moveTo(-s * 0.6, s * 0.1); c.lineTo(-s * 0.65, s * 0.85); c.moveTo(-s * 0.35, s * 0.12); c.lineTo(-s * 0.3, s * 0.85); c.moveTo(s * 0.18, s * 0.1); c.lineTo(s * 0.12, s * 0.85); c.moveTo(s * 0.38, s * 0.06); c.lineTo(s * 0.44, s * 0.85); c.moveTo(s * 0.4, s * 0.02); c.lineTo(s * 0.62, -s * 0.48); c.lineTo(s * 0.9, -s * 0.42); c.moveTo(s * 0.6, -s * 0.5); c.lineTo(s * 0.5, -s * 0.85); c.lineTo(s * 0.32, -s * 1.0); c.moveTo(s * 0.53, -s * 0.78); c.lineTo(s * 0.72, -s * 0.98); c.moveTo(s * 0.66, -s * 0.52); c.lineTo(s * 0.86, -s * 0.8); c.lineTo(s * 1.02, -s * 0.9); c.stroke(); });
  G('hare', (c, s) => { c.beginPath(); c.ellipse(-s * 0.1, s * 0.35, s * 0.55, s * 0.4, 0, 0, 7); c.moveTo(s * 0.62, -s * 0.05); c.arc(s * 0.42, -s * 0.05, s * 0.2, 0, 7); c.moveTo(s * 0.38, -s * 0.24); c.quadraticCurveTo(s * 0.15, -s * 0.85, s * 0.05, -s * 1.0); c.moveTo(s * 0.5, -s * 0.24); c.quadraticCurveTo(s * 0.45, -s * 0.85, s * 0.32, -s * 1.02); c.stroke(); });
  G('fox', (c, s) => { c.beginPath(); c.moveTo(-s * 0.45, s * 0.1); c.quadraticCurveTo(s * 0.0, -s * 0.12, s * 0.42, s * 0.05); c.lineTo(s * 0.62, -s * 0.18); c.lineTo(s * 0.66, -s * 0.48); c.lineTo(s * 0.78, -s * 0.24); c.lineTo(s * 1.0, -s * 0.08); c.lineTo(s * 0.62, s * 0.08); c.moveTo(-s * 0.35, s * 0.15); c.lineTo(-s * 0.38, s * 0.7); c.moveTo(s * 0.3, s * 0.12); c.lineTo(s * 0.32, s * 0.7); c.moveTo(-s * 0.45, s * 0.1); c.bezierCurveTo(-s * 1.0, s * 0.0, -s * 1.15, s * 0.55, -s * 0.8, s * 0.6); c.quadraticCurveTo(-s * 0.6, s * 0.4, -s * 0.45, s * 0.25); c.stroke(); });
  G('ibex', (c, s) => { c.beginPath(); c.moveTo(-s * 0.6, s * 0.0); c.lineTo(s * 0.35, s * 0.0); c.lineTo(s * 0.55, -s * 0.3); c.lineTo(s * 0.8, -s * 0.2); c.moveTo(-s * 0.5, s * 0.0); c.lineTo(-s * 0.5, s * 0.7); c.moveTo(s * 0.25, s * 0.0); c.lineTo(s * 0.25, s * 0.7); c.moveTo(s * 0.55, -s * 0.3); c.bezierCurveTo(s * 0.2, -s * 0.8, -s * 0.45, -s * 0.85, -s * 0.5, -s * 0.35); c.moveTo(-s * 1.0, s * 0.7); c.lineTo(-s * 0.2, s * 0.78); c.lineTo(s * 0.5, s * 0.7); c.lineTo(s * 1.0, s * 0.85); c.stroke(); });
  G('eagle', (c, s) => { c.beginPath(); c.moveTo(-s * 1.05, -s * 0.15); c.quadraticCurveTo(-s * 0.55, -s * 0.5, -s * 0.12, -s * 0.02); c.lineTo(0, s * 0.35); c.lineTo(s * 0.12, -s * 0.02); c.quadraticCurveTo(s * 0.55, -s * 0.5, s * 1.05, -s * 0.15); for (const k of [-1, 1]) for (const f of [0.55, 0.75, 0.95]) { c.moveTo(k * s * f, -s * 0.2 - (1 - f) * s * 0.2); c.lineTo(k * s * (f + 0.08), -s * 0.02); } c.moveTo(-s * 0.12, s * 0.3); c.lineTo(0, s * 0.55); c.lineTo(s * 0.12, s * 0.3); c.stroke(); });
  G('den', (c, s) => { c.beginPath(); c.moveTo(-s, s * 0.6); c.quadraticCurveTo(-s * 0.2, -s * 0.9, s, s * 0.6); c.moveTo(-s * 0.35, s * 0.6); c.quadraticCurveTo(0, -s * 0.05, s * 0.35, s * 0.6); c.stroke(); c.beginPath(); c.arc(s * 0.62, -s * 0.55, s * 0.12, 0, 7); c.stroke(); });

  // ---- the snow as it lies at a place, seen from above it down the mountain: 31 rows (50 m behind to 470 m ahead, sparser far off), 49 points
  // a row, wider the farther. Each point the snow's height less the run's smoothed fall (the valley's shape only) and whether a tree stands there.
  // (sampled once per place on its own mountain and kept for the page's life: about 1,500 heights)
  const grids = new Map();
  A.grid = function (s, u) {
    if (typeof Course === 'undefined') return null;
    const key = Course.seed + ':' + Math.round(s) + ':' + Math.round(u); if (grids.has(key)) return grids.get(key);
    const pc = {}, tn = {}, H = (x, ss) => Course.height(x, -ss, 0.5), cx = ss => Course.at(ss, pc).cx, x0 = cx(s) + u;
    const N = 31, M = 49, D0 = 110, HALF = 62, rows = [];
    for (let j = 0; j < N; j++) {
      const t = j / (N - 1), d = -50 + 520 * Math.pow(t, 1.6), ss = s + d, persp = D0 / (D0 + d + 50), half = HALF / persp;
      let base = 0, nb = 0; for (let q = -50; q <= 50; q += 10) { base += H(cx(ss + q), ss + q); nb++; } base /= nb;
      const h = new Float32Array(M), tr = new Uint8Array(M);
      for (let i = 0; i < M; i++) { const x = x0 + (i - (M - 1) / 2) / ((M - 1) / 2) * half; h[i] = H(x, ss) - base; Course.nearTree(x, -ss, tn); tr[i] = tn.ok && !tn.soft && tn.d < 5 ? 1 : 0; }
      const ways = ss > 20 && Course.ways ? Course.ways(ss).map(w => cx(ss) + w - x0) : [cx(ss) - x0];
      rows.push({ d, p: persp, half, h, tr, ways });
    }
    const g = { N, M, rows }; grids.set(key, g); return g;
  };
  // where a card's picture stands: { s, u } on its run, from the art, or from its rule (a place, a station of the designed run)
  A.spot = function (card) {
    const a = card.art || {}, w = card.when || {};
    if (a.s != null) return { s: a.s, u: a.u || 0 };
    if (w.type === 'place') return { s: w.s, u: w.u || 0 };
    const st = a.station != null ? { idx: a.station, at: a.at } : w.type === 'station' ? { idx: w.idx, at: (w.at || 0) + 0.06 } : null;
    if (st && typeof Course !== 'undefined' && Course.ROUTE && Course.route !== false) {
      for (let k = 0; k < 40 && Course.segs.length <= st.idx; k++) { const g = Course.segs[Course.segs.length - 1]; Course.segAt(g.s0 + g.len + 1); }
      const g = Course.segs[st.idx]; if (g) return { s: g.s0 + g.len * (st.at || 0), u: a.u || 0 };
    }
    return null;
  };

  function sky(ctx, W, PH, T, rnd, u, aurora, seed) {
    const g = ctx.createLinearGradient(0, 0, 0, PH); g.addColorStop(0, css(T.top)); g.addColorStop(0.62, css(mix(T.top, T.low, 0.75))); g.addColorStop(1, css(T.low)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, PH);
    if (T.stars) for (let i = 0; i < 90 * T.stars; i++) { const x = rnd() * W, y = rnd() * PH * 0.55, r = (0.3 + rnd() * 0.8) * u; ctx.fillStyle = css(SNOW, 0.25 + rnd() * 0.7); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
    if (aurora) for (let k = 0; k < 3; k++) { const y0 = PH * (0.17 + k * 0.06), g2 = ctx.createLinearGradient(0, y0 - 26 * u, 0, y0 + 22 * u); g2.addColorStop(0, 'rgba(90,255,190,0)'); g2.addColorStop(0.55, `rgba(${90 + k * 30},255,${190 - k * 20},${0.26 - k * 0.06})`); g2.addColorStop(1, 'rgba(120,140,255,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(0, y0 + 22 * u); for (let x = 0; x <= W; x += 6 * u) ctx.lineTo(x, y0 - 22 * u + Math.sin(x / (34 * u) + k * 1.9 + seed) * 10 * u); ctx.lineTo(W, y0 + 22 * u); ctx.closePath(); ctx.fill(); }
    const [ox, oy, or, oc] = T.orb, x = ox * W, y = oy * PH, g3 = ctx.createRadialGradient(x, y, 0, x, y, or * 7 * u); g3.addColorStop(0, css(oc, 0.55)); g3.addColorStop(1, css(oc, 0)); ctx.fillStyle = g3; ctx.fillRect(0, 0, W, PH); ctx.fillStyle = css(oc); ctx.beginPath(); ctx.arc(x, y, or * u, 0, 7); ctx.fill();
  }
  function snowfall(ctx, W, PH, wx, rnd, u) { const n = { light: 60, heavy: 240 }[wx] || 0; ctx.fillStyle = css(SNOW, 0.75); for (let i = 0; i < n; i++) { const x = rnd() * W, y = rnd() * PH, r = (0.4 + rnd() * 1.1) * u; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } }

  // ---- the pictures (Cards.art)
  // scenery: the place's own snow
  function scenery(ctx, W, PH, v) {
    const sp = A.spot(v.card), mine = (!v.card.seed || (typeof Course !== 'undefined' && Course.seed === v.card.seed)) && (!v.card.mtn || typeof Course !== 'undefined' && Course.mountainBySeed && (Course.mountainBySeed() || {}).id === v.card.mtn);
    const G = sp && mine ? A.grid(sp.s, sp.u) : null;
    if (!G) return emblem(ctx, W, PH, v);
    const T = TOD[v.tod] || TOD.day, u = W / 300, rnd = RNG(hash(v.card.id) + 7), N = G.N, M = G.M, yFar = PH * 0.44, yNear = PH + 10 * u, pFar = G.rows[N - 1].p, KY = (W / 2) / 62 * 1.5;
    if (v.owned) sky(ctx, W, PH, T, rnd, u, v.aurora, hash(v.card.id) % 7);
    else { ctx.fillStyle = css(mix(INK, [20, 30, 48], 0.6)); ctx.fillRect(0, 0, W, PH); }
    const rowY = r => yFar + (yNear - yFar) * (r.p - pFar) / (1 - pFar), X = i => W / 2 + (i - (M - 1) / 2) / ((M - 1) / 2) * W * 0.53;
    const pt = (r, i) => [X(i), rowY(r) - r.h[i] * KY * r.p];
    const hAt = (r, l) => { const f = (l / r.half) * (M - 1) / 2 + (M - 1) / 2; if (f < 0 || f > M - 1) return null; const i = Math.min(M - 2, Math.floor(f)), k = f - i; return [W / 2 + (f - (M - 1) / 2) / ((M - 1) / 2) * W * 0.53, rowY(r) - (r.h[i] + (r.h[i + 1] - r.h[i]) * k) * KY * r.p]; };
    if (v.owned) {          // far ridges (the seed's own noise, standing in for the far country)
      const r2 = RNG((v.seed || 1) * 7 + 3), ph = [r2() * 9, r2() * 9, r2() * 9, r2() * 9];
      for (const [amp, base, k] of [[34, -6, 0.32], [20, 6, 0.58]]) { ctx.fillStyle = css(mix(T.low, T.far, k)); ctx.beginPath(); ctx.moveTo(0, PH); for (let x = 0; x <= W; x += 3 * u) { const q = x / W, y = yFar + base * u - amp * u * (0.5 + 0.5 * Math.sin(q * 5.1 + ph[0])) * (0.55 + 0.45 * Math.sin(q * 13.7 + ph[1])) - 5 * u * Math.abs(Math.sin(q * 41 + ph[2])) - 2 * u * Math.sin(q * 97 + ph[3]); ctx.lineTo(x, y); } ctx.lineTo(W, PH); ctx.closePath(); ctx.fill(); }
    }
    let spotXY = null;
    for (let j = N - 1; j >= 0; j--) {
      const r = G.rows[j], k = 1 - j / (N - 1);
      ctx.beginPath(); ctx.moveTo(-4, PH + 20 * u); for (let i = 0; i < M; i++) { const p = pt(r, i); if (i === 0) ctx.lineTo(-4, p[1]); ctx.lineTo(p[0], p[1]); if (i === M - 1) ctx.lineTo(W + 4, p[1]); } ctx.lineTo(W + 4, PH + 20 * u); ctx.closePath();
      if (v.owned) { ctx.fillStyle = css(mix(T.far, T.near, 0.08 + 0.92 * Math.pow(k, 0.8))); ctx.fill(); ctx.strokeStyle = css(T.rim, 0.14 + 0.5 * k); ctx.lineWidth = (0.45 + 0.6 * k) * u; ctx.stroke(); }
      else { ctx.fillStyle = css(mix(INK, [20, 30, 48], 0.6)); ctx.fill(); ctx.strokeStyle = css(SNOW, 0.07 + 0.13 * k); ctx.lineWidth = 0.6 * u; ctx.stroke(); }
      if (v.owned) { ctx.fillStyle = css(mix(T.near, INK, 0.30 + 0.45 * k)); const sz = 8.5 * KY / 1.5 * r.p; for (let i = 0; i < M; i++) { if (!r.tr[i]) continue; const p = pt(r, i), s2 = sz * (0.7 + 0.6 * rnd()), dx = (rnd() - 0.5) * 3 * u; ctx.beginPath(); ctx.moveTo(p[0] + dx - s2 * 0.3, p[1] + 1); ctx.lineTo(p[0] + dx, p[1] - s2); ctx.lineTo(p[0] + dx + s2 * 0.3, p[1] + 1); ctx.closePath(); ctx.fill(); } }
      if (j > 0) { const r1 = G.rows[j - 1]; r.ways.forEach((w, n) => { let w1 = null, bd = 30; for (const q of r1.ways) if (Math.abs(q - w) < bd) { bd = Math.abs(q - w); w1 = q; } if (w1 == null) return; const a = hAt(r, w), b2 = hAt(r1, w1); if (!a || !b2) return; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b2[0], b2[1]); ctx.strokeStyle = v.owned ? css(GOLD, n === 0 ? 0.92 : 0.42) : css(SNOW, 0.14); ctx.lineWidth = (n === 0 ? 0.5 + 1.0 * k : 0.4 + 0.5 * k) * u; ctx.lineCap = 'round'; ctx.stroke(); }); }
      if (r.d <= 0 && (j === N - 1 || G.rows[j + 1].d > 0)) spotXY = hAt(r, 0);
    }
    if (spotXY && v.owned) { const [sx, sy] = spotXY, g4 = ctx.createLinearGradient(0, sy - 74 * u, 0, sy); g4.addColorStop(0, css(SNOW, 0)); g4.addColorStop(1, css(SNOW, 0.75)); ctx.strokeStyle = g4; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(sx + 5 * u, sy - 24 * u, sx - 6 * u, sy - 46 * u, sx + 7 * u, sy - 74 * u); ctx.stroke(); ctx.fillStyle = css(GOLD); ctx.beginPath(); ctx.arc(sx, sy, 2.6 * u, 0, 7); ctx.fill(); ctx.strokeStyle = css(GOLD, 0.5); ctx.lineWidth = 0.7 * u; ctx.beginPath(); ctx.arc(sx, sy, 6 * u, 0, 7); ctx.stroke(); }
    if (v.owned && v.wx && v.wx !== 'clear') snowfall(ctx, W, PH, v.wx, rnd, u);
    if (!v.owned) text(ctx, '？', W / 2, PH * 0.42, `300 ${46 * u}px ${SONG}`, css(SNOW, 0.34), 0, 'center');
  }
  // emblem: the sky it was got under, a low horizon, the card's line drawing (art.glyph, else the kind's)
  function emblem(ctx, W, PH, v) {
    const T = TOD[v.tod] || TOD.day, u = W / 300, rnd = RNG(hash(v.card.id) + 3), gl = A.glyphs[(v.card.art && v.card.art.glyph) || (v.kind && v.kind.glyph) || 'star'] || A.glyphs.star;
    if (v.owned) {
      sky(ctx, W, PH, T, rnd, u, v.aurora, hash(v.card.id) % 7);
      ctx.fillStyle = css(mix(T.far, T.near, 0.35)); ctx.beginPath(); ctx.moveTo(0, PH); for (let x = 0; x <= W; x += 4 * u) ctx.lineTo(x, PH * 0.8 - 10 * u * Math.sin(x / W * 4 + hash(v.card.id) % 5) - 6 * u * Math.sin(x / W * 11)); ctx.lineTo(W, PH); ctx.closePath(); ctx.fill();
      ctx.fillStyle = css(mix(T.near, INK, 0.2)); ctx.beginPath(); ctx.moveTo(0, PH); for (let x = 0; x <= W; x += 4 * u) ctx.lineTo(x, PH * 0.9 - 5 * u * Math.sin(x / W * 6 + 1.3)); ctx.lineTo(W, PH); ctx.closePath(); ctx.fill();
      if (v.wx && v.wx !== 'clear') snowfall(ctx, W, PH, v.wx, rnd, u);
      // the drawing, lit: a soft gold halo, then the line
      const cx = W / 2, cy = PH * 0.47, g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 * u); g.addColorStop(0, css(GOLD, 0.16)); g.addColorStop(1, css(GOLD, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, PH);
      ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = css(GOLD, 0.95); ctx.lineWidth = 2 * u; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; gl(ctx, 52 * u); ctx.restore();
    } else {
      ctx.fillStyle = css(mix(INK, [20, 30, 48], 0.6)); ctx.fillRect(0, 0, W, PH);
      ctx.save(); ctx.translate(W / 2, PH * 0.47); ctx.strokeStyle = css(SNOW, v.hidden ? 0 : 0.12); ctx.lineWidth = 1.4 * u; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (!v.hidden) gl(ctx, 52 * u); ctx.restore();
      text(ctx, '？', W / 2, PH * 0.6, `300 ${46 * u}px ${SONG}`, css(SNOW, 0.34), 0, 'center');
    }
  }
  if (typeof Cards !== 'undefined') { Cards.art('scenery', scenery); Cards.art('emblem', emblem); Cards.glyph = A.glyph; }

  // ---- a whole card: picture, words, frame. view: { card, rec, owned, tod, wx, aurora, no, total, seed, hidden }
  A.draw = function (ctx, W, H, v) {
    const L = Cards.L, u = W / 300, c = v.card, kind = Cards.kinds[c.kind] || null, set = Cards.sets[c.set] || null; v.kind = kind;
    ctx.save(); ctx.clearRect(0, 0, W, H); rr(ctx, 0, 0, W, H, 10 * u); ctx.clip();
    const PH = H * 0.70, art = Cards.arts[(c.art && c.art.type) || (kind && kind.art) || 'emblem'] || emblem;
    try { art(ctx, W, PH, v); } catch (e) { console.warn('card art', c.id, e); emblem(ctx, W, PH, v); }
    ctx.fillStyle = css(mix(INK, [16, 24, 40], 0.55)); ctx.fillRect(0, PH, W, H - PH);
    ctx.fillStyle = css(GOLD, v.owned ? 0.55 : 0.2); ctx.fillRect(0, PH, W, Math.max(1, 0.6 * u));
    const m = 18 * u, pad = n => String(n).padStart(2, '0');
    text(ctx, 'No.' + pad(v.no) + ' / ' + pad(v.total), m, 26 * u, `500 ${9 * u}px ${LAT}`, css(SNOW, v.owned ? 0.86 : 0.4), 2.4 * u);
    text(ctx, ((set && (set.en || set.zh)) || '').toUpperCase(), W - m, 26 * u, `500 ${7.5 * u}px ${LAT}`, css(SNOW, v.owned ? 0.7 : 0.3), 2.2 * u, 'right', W * 0.55);
    if (v.owned) {
      text(ctx, L(c.zh, c.en), m, PH + 38 * u, `300 ${24 * u}px ${SONG}`, css(SNOW), 5 * u, 'left', W - 2 * m - 30 * u);
      if (c.fact) text(ctx, L(c.fact.zh || c.fact, c.fact.en), m, PH + 60 * u, `400 ${10 * u}px ${SONG}`, css(SNOW, 0.66), 1 * u, 'left', W - 2 * m);
      const r = v.rec, F = Cards.facets, when = [];
      if (r) { const d = new Date(r.t); when.push(d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate()); }
      if (v.tod && F.tod) { const q = F.tod.values.find(x => x[0] === v.tod); if (q) when.push(L(q[1], q[2])); }
      if (v.wx && F.wx) { const q = F.wx.values.find(x => x[0] === v.wx); if (q) when.push(L(q[1], q[2])); }
      if (r && r.n > 1) when.push(L('第 ' + r.n + ' 次', '×' + r.n));
      text(ctx, when.join(' · '), m, PH + 84 * u, `400 ${8.5 * u}px ${LAT},${SONG}`, css(GOLD, 0.9), 1.2 * u, 'left', W - 2 * m - 50 * u);
      // the kind's small drawing, top right of the words
      const kg = kind && kind.glyph && A.glyphs[kind.glyph];
      if (kg) { ctx.save(); ctx.translate(W - m - 12 * u, PH + 30 * u); ctx.strokeStyle = css(GOLD, 0.95); ctx.lineWidth = 1.1 * u; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; kg(ctx, 10 * u); ctx.restore(); }
      // the stamps: one dot a value of the first facet it collects, filled when got
      const st = Cards.stamps(c, r)[0];
      if (st) st.values.forEach((q, i) => { const n = st.values.length, x = W - m - (n - 1 - i) * 11 * u - 3 * u, y = PH + 81 * u; ctx.beginPath(); ctx.arc(x, y, 2.6 * u, 0, 7); if (q[3]) { ctx.fillStyle = css(GOLD, 0.95); ctx.fill(); } else { ctx.strokeStyle = css(GOLD, 0.5); ctx.lineWidth = 0.7 * u; ctx.stroke(); } });
    } else {
      text(ctx, v.hidden ? L('秘密', 'Secret') : c.soon ? L('即将开放', 'Coming soon') : L('还没收到', 'Not yet'), m, PH + 38 * u, `300 ${20 * u}px ${SONG}`, css(SNOW, 0.5), 5 * u);
      if (c.hint && !v.hidden) text(ctx, L('线索：', 'Hint: ') + L(c.hint.zh || c.hint, c.hint.en), m, PH + 62 * u, `400 ${10 * u}px ${SONG}`, css(SNOW, 0.6), 1 * u, 'left', W - 2 * m);
    }
    ctx.restore(); ctx.save(); rr(ctx, 5 * u, 5 * u, W - 10 * u, H - 10 * u, 7 * u); ctx.strokeStyle = css(GOLD, v.owned ? 0.8 : 0.28); ctx.lineWidth = Math.max(1, 0.7 * u); ctx.stroke();
    if (v.owned && Cards.full(c) && (c.facets || []).length) { rr(ctx, 8 * u, 8 * u, W - 16 * u, H - 16 * u, 5 * u); ctx.strokeStyle = css(GOLD, 0.55); ctx.lineWidth = Math.max(1, 0.5 * u); ctx.stroke(); }          // every stamp: a double frame
    ctx.restore();
  };
  return A;
})();
