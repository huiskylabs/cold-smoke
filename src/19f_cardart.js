// ---------------------------------------------------------------- 集卡: how a card is drawn (pure Canvas 2D, no pictures)
// A card is 3:4: a picture and its words, in one of three frames (dev switch 卡框: a 细金框, b 切角徽章, c 版画留白).
// What the picture is depends on the card's art: { type: 'scenery' | 'scene' | 'emblem' | any later Cards.art, ... }:
//   scenery  the place itself, looked at from above it down the mountain: rows of the real snow (Course.height) far to near, trees as small
//            marks, the run as a gold line, the spot as a gold point under a thread of cold smoke. Drawn only on the card's own mountain.
//   scene    the same view of a place on the run (art.station / art.s) with what the card is about left in it as a trace: tracks in
//            the snow into the trees, rings on the run, aurora, a gold arc off a kicker. Never a drawn creature or person.
// Every collected card is the player's own: its moment (A.moment: a seed from the player, the card and the time, the minute of the sky,
// where they stood) moves the viewpoint and sets the light, the clouds, the moon's phase, the far ridges; the seed is printed on the card.
//   emblem   a fallback: the hour's sky over faceted hills and the card's line drawing in a gold medallion
// A card not yet collected: dark, the outline of its picture faint, a question mark, its hint (the same for everyone).
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
  G('paw', (c, s) => { c.beginPath(); c.ellipse(0, s * 0.3, s * 0.42, s * 0.34, 0, 0, 7); c.stroke(); for (const [x, y] of [[-0.62, -0.18], [-0.24, -0.62], [0.24, -0.62], [0.62, -0.18]]) { c.beginPath(); c.ellipse(x * s, y * s, s * 0.15, s * 0.2, x * 0.5, 0, 7); c.stroke(); } });
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

  // ---- a card's moment: when and where this player got it. Cards keeps one a stamp (rec.m['dusk/clear'] = { k, c, s, u, t }): k is the card's
  // own seed (the player's install id, the card, the time), c the clock of the sky then, s and u where on the run the player was. So no two
  // players' cards are the same picture, and a player's second stamp of a card is another picture again. A record from before has none: its
  // moment is made from the card and the time it was got, the same every time it is drawn.
  const BAND = { night: [1356, 1660], dawn: [236, 460], day: [470, 1000], dusk: [1008, 1348] };
  const todOf = c => { c = ((c % 1440) + 1440) % 1440; return c < 230 || c >= 1352 ? 'night' : c < 464 ? 'dawn' : c < 1004 ? 'day' : 'dusk'; };
  A.moment = function (v) {
    const r = v.rec || {}, M = r.m || {}, tod = v.tod || 'day', key = tod + '/' + (v.wx || 'clear');
    let m = M[key] || Object.keys(M).filter(q => q.indexOf(tod + '/') === 0).map(q => M[q])[0] || null;
    if (!m) m = { k: hash(v.card.id + ':' + (r.t || 0) + ':' + key), c: null, s: null, u: null, t: r.t || 0 };
    if (m.c == null || todOf(m.c) !== tod) { const R0 = RNG(m.k ^ 0x9e3779b9), b = BAND[tod] || BAND.day; m = Object.assign({}, m, { c: (b[0] + (b[1] - b[0]) * (0.12 + 0.76 * R0())) % 1440 }); }
    return m;
  };
  A.code = k => { const h = (k >>> 0).toString(16).toUpperCase().padStart(8, '0'); return h.slice(0, 4) + '·' + h.slice(4); };
  // the sky's colours at any minute, between the four hours' (each hour's palette sits at the middle of its band)
  const KEYS = [[-80, 'night'], [350, 'dawn'], [735, 'day'], [1180, 'dusk'], [1510, 'night'], [1790, 'dawn']];
  function skyAt(c) {
    c = ((c % 1440) + 1440) % 1440; if (c < 350 && c < KEYS[0][0] + 1440 - 1440) c += 0;
    let i = 0; while (i < KEYS.length - 2 && c > KEYS[i + 1][0]) i++;
    const [c0, a0] = KEYS[i], [c1, b0] = KEYS[i + 1], t = Math.max(0, Math.min(1, (c - c0) / (c1 - c0))), e = t * t * (3 - 2 * t), A0 = TOD[a0], B0 = TOD[b0];
    const T = {}; for (const k of ['top', 'low', 'far', 'near', 'rim']) T[k] = mix(A0[k], B0[k], e);
    T.stars = A0.stars + (B0.stars - A0.stars) * e; T.orb = [0, 0, A0.orb[2] + (B0.orb[2] - A0.orb[2]) * e, mix(A0.orb[3], B0.orb[3], e)]; T.moon = todOf(c) === 'night' || (todOf(c) === 'dawn' && c < 300);
    return T;
  }
  // the moon's phase on a day (0 new, 0.5 full), from a known new moon
  const phaseAt = t => { const p = ((t - 947182440000) / 86400000 / 29.530589) % 1; return p < 0 ? p + 1 : p; };
  // flat clouds the way a print has them: a long flat foot and a few round tops, lit on top, a darker line under
  function clouds(ctx, W, PH, T, rnd, u) {
    const n = Math.floor(rnd() * 3.4); for (let q = 0; q < n; q++) {
      const y = PH * (0.1 + 0.26 * rnd()), w = W * (0.22 + 0.4 * rnd()), x0 = -w * 0.2 + rnd() * (W - w * 0.6), h = (3 + 3 * rnd()) * u, lit = mix(T.low, T.rim, 0.55), a = 0.35 + 0.35 * rnd();
      ctx.fillStyle = css(lit, a); rr(ctx, x0, y - h, w, h * 2, h); ctx.fill();
      const bumps = 2 + Math.floor(rnd() * 3); for (let b = 0; b < bumps; b++) { const bx = x0 + w * (0.15 + 0.7 * rnd()), br = (5 + 9 * rnd()) * u; ctx.beginPath(); ctx.arc(bx, y - h + 1, br, Math.PI, 0); ctx.closePath(); ctx.fill(); }
      ctx.strokeStyle = css(mix(T.top, T.near, 0.5), a * 0.6); ctx.lineWidth = 0.7 * u; ctx.beginPath(); ctx.moveTo(x0 + h, y + h); ctx.lineTo(x0 + w - h, y + h); ctx.stroke();
    }
  }
  function sky(ctx, W, PH, T, rnd, u, aurora, seed, m) {
    const g = ctx.createLinearGradient(0, 0, 0, PH); g.addColorStop(0, css(T.top)); g.addColorStop(0.62, css(mix(T.top, T.low, 0.75))); g.addColorStop(1, css(T.low)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, PH);
    if (T.stars) for (let i = 0; i < 110 * T.stars; i++) { const x = rnd() * W, y = rnd() * PH * 0.55, r = (0.3 + rnd() * 0.8) * u; ctx.fillStyle = css(SNOW, (0.25 + rnd() * 0.7) * Math.min(1, T.stars * 1.4)); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
    if (aurora) for (let k = 0; k < 3; k++) { const y0 = PH * (0.17 + k * 0.06), g2 = ctx.createLinearGradient(0, y0 - 26 * u, 0, y0 + 22 * u); g2.addColorStop(0, 'rgba(90,255,190,0)'); g2.addColorStop(0.55, `rgba(${90 + k * 30},255,${190 - k * 20},${0.26 - k * 0.06})`); g2.addColorStop(1, 'rgba(120,140,255,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.moveTo(0, y0 + 22 * u); for (let x = 0; x <= W; x += 6 * u) ctx.lineTo(x, y0 - 22 * u + Math.sin(x / (34 * u) + k * 1.9 + seed) * 10 * u); ctx.lineTo(W, y0 + 22 * u); ctx.closePath(); ctx.fill(); }
    // the sun or the moon: where it stands is the card's own; the moon shows the phase of the day the card was got
    const ox = m ? 0.12 + 0.76 * rnd() : T.orb[0], oy = m ? 0.12 + 0.2 * rnd() : T.orb[1], or = T.orb[2], oc = T.orb[3], x = ox * W, y = oy * PH;
    const g3 = ctx.createRadialGradient(x, y, 0, x, y, or * 7 * u); g3.addColorStop(0, css(oc, 0.55)); g3.addColorStop(1, css(oc, 0)); ctx.fillStyle = g3; ctx.fillRect(0, 0, W, PH);
    ctx.fillStyle = css(oc); ctx.beginPath(); ctx.arc(x, y, or * u, 0, 7); ctx.fill();
    if (T.moon && m && m.t) { const p = phaseAt(m.t), f = p < 0.5 ? p * 2 : (1 - p) * 2, R = or * u, dx = (p < 0.5 ? -1 : 1) * 2 * R * f; if (f < 0.97) { ctx.save(); ctx.beginPath(); ctx.arc(x, y, R + 0.3, 0, 7); ctx.clip(); ctx.fillStyle = css(mix(T.top, T.low, oy * 0.9)); ctx.beginPath(); ctx.arc(x + dx, y, R * 1.02, 0, 7); ctx.fill(); ctx.restore(); } }
    if (m) clouds(ctx, W, PH, T, rnd, u);
    return [x, y];
  }
  function snowfall(ctx, W, PH, wx, rnd, u) { const n = { light: 60, heavy: 240 }[wx] || 0; ctx.fillStyle = css(SNOW, 0.75); for (let i = 0; i < n; i++) { const x = rnd() * W, y = rnd() * PH, r = (0.4 + rnd() * 1.1) * u; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } }

  // ---- the pictures (Cards.art)
  // scenery: the place's own snow, from where this player stood (near the card's spot), at the minute they were there. Returns what was drawn
  // where (the run row by row, a way to put a point at any distance and side, the spot) so a scene can lay traces on it.
  function scenery(ctx, W, PH, v, o) {
    o = o || {};
    const sp = A.spot(v.card), mine = (!v.card.seed || (typeof Course !== 'undefined' && Course.seed === v.card.seed)) && (!v.card.mtn || typeof Course !== 'undefined' && Course.mountainBySeed && (Course.mountainBySeed() || {}).id === v.card.mtn);
    const m = v.owned ? A.moment(v) : null, rnd = m ? RNG(m.k) : RNG(hash(v.card.id) + 7);
    let s0 = sp && sp.s, u0 = sp && sp.u;
    if (sp && m) { if (m.s != null && Math.abs(m.s - sp.s) < 200) { s0 = m.s - 20; u0 = Math.max(-40, Math.min(40, m.u || 0)); } else { s0 = sp.s + (rnd() - 0.5) * 70; u0 = sp.u + (rnd() - 0.5) * 40; } s0 = Math.round(s0 / 5) * 5; u0 = Math.round(u0 / 2) * 2; }
    const G = sp && mine ? A.grid(s0, u0) : null;
    if (!G) return o.scene ? backdrop(ctx, W, PH, v, o) : emblem(ctx, W, PH, v);
    const T = m ? skyAt(m.c) : (TOD[v.tod] || TOD.day), u = W / 300, N = G.N, M = G.M, yFar = PH * (m ? 0.4 + 0.08 * rnd() : 0.44), yNear = PH + 10 * u, pFar = G.rows[N - 1].p, KY = (W / 2) / 62 * 1.5;
    if (v.owned) { sky(ctx, W, PH, T, rnd, u, v.aurora && !o.noAurora, hash(v.card.id) % 7, m); if (o.sky) o.sky(ctx, T, u); }
    else { ctx.fillStyle = css(mix(INK, [20, 30, 48], 0.6)); ctx.fillRect(0, 0, W, PH); }
    const rowY = r => yFar + (yNear - yFar) * (r.p - pFar) / (1 - pFar), X = i => W / 2 + (i - (M - 1) / 2) / ((M - 1) / 2) * W * 0.53;
    const pt = (r, i) => [X(i), rowY(r) - r.h[i] * KY * r.p];
    const hAt = (r, l) => { const f = (l / r.half) * (M - 1) / 2 + (M - 1) / 2; if (f < 0 || f > M - 1) return null; const i = Math.min(M - 2, Math.floor(f)), k = f - i; return [W / 2 + (f - (M - 1) / 2) / ((M - 1) / 2) * W * 0.53, rowY(r) - (r.h[i] + (r.h[i + 1] - r.h[i]) * k) * KY * r.p]; };
    if (v.owned) {          // far ridges, the card's own
      const r2 = RNG(m.k * 7 + 3), ph = [r2() * 9, r2() * 9, r2() * 9, r2() * 9], A1 = 26 + 18 * r2();
      for (const [amp, base, k] of [[A1, -6, 0.32], [A1 * 0.6, 6, 0.58]]) { ctx.fillStyle = css(mix(T.low, T.far, k)); ctx.beginPath(); ctx.moveTo(0, PH); for (let x = 0; x <= W; x += 3 * u) { const q = x / W, y = yFar + base * u - amp * u * (0.5 + 0.5 * Math.sin(q * 5.1 + ph[0])) * (0.55 + 0.45 * Math.sin(q * 13.7 + ph[1])) - 5 * u * Math.abs(Math.sin(q * 41 + ph[2])) - 2 * u * Math.sin(q * 97 + ph[3]); ctx.lineTo(x, y); } ctx.lineTo(W, PH); ctx.closePath(); ctx.fill(); }
    }
    let spotXY = null; const run = [];
    for (let j = N - 1; j >= 0; j--) {
      const r = G.rows[j], k = 1 - j / (N - 1);
      ctx.beginPath(); ctx.moveTo(-4, PH + 20 * u); for (let i = 0; i < M; i++) { const p = pt(r, i); if (i === 0) ctx.lineTo(-4, p[1]); ctx.lineTo(p[0], p[1]); if (i === M - 1) ctx.lineTo(W + 4, p[1]); } ctx.lineTo(W + 4, PH + 20 * u); ctx.closePath();
      if (v.owned) { ctx.fillStyle = css(mix(T.far, T.near, 0.08 + 0.92 * Math.pow(k, 0.8))); ctx.fill(); ctx.strokeStyle = css(T.rim, 0.14 + 0.5 * k); ctx.lineWidth = (0.45 + 0.6 * k) * u; ctx.stroke(); }
      else { ctx.fillStyle = css(mix(INK, [20, 30, 48], 0.6)); ctx.fill(); ctx.strokeStyle = css(SNOW, 0.07 + 0.13 * k); ctx.lineWidth = 0.6 * u; ctx.stroke(); }
      if (v.owned) { ctx.fillStyle = css(mix(T.near, INK, 0.30 + 0.45 * k)); const sz = 8.5 * KY / 1.5 * r.p; for (let i = 0; i < M; i++) { if (!r.tr[i]) continue; const p = pt(r, i), s2 = sz * (0.7 + 0.6 * rnd()), dx = (rnd() - 0.5) * 3 * u; ctx.beginPath(); ctx.moveTo(p[0] + dx - s2 * 0.3, p[1] + 1); ctx.lineTo(p[0] + dx, p[1] - s2); ctx.lineTo(p[0] + dx + s2 * 0.3, p[1] + 1); ctx.closePath(); ctx.fill(); } }
      const a0 = hAt(r, r.ways[0]); if (a0) run.push({ x: a0[0], y: a0[1], k, d: r.d, m: W * 0.53 / r.half, l: r.ways[0] });
      if (j > 0) { const r1 = G.rows[j - 1]; r.ways.forEach((w, n) => { let w1 = null, bd = 30; for (const q of r1.ways) if (Math.abs(q - w) < bd) { bd = Math.abs(q - w); w1 = q; } if (w1 == null) return; const a = hAt(r, w), b2 = hAt(r1, w1); if (!a || !b2) return; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b2[0], b2[1]); ctx.strokeStyle = v.owned ? css(GOLD, (n === 0 ? 0.92 : 0.42) * (o.runA == null ? 1 : o.runA)) : css(SNOW, 0.14); ctx.lineWidth = (n === 0 ? 0.5 + 1.0 * k : 0.4 + 0.5 * k) * u; ctx.lineCap = 'round'; ctx.stroke(); }); }
      if (r.d <= 0 && (j === N - 1 || G.rows[j + 1].d > 0)) spotXY = hAt(r, 0);
    }
    if (spotXY && v.owned && !o.scene) { const [sx, sy] = spotXY, g4 = ctx.createLinearGradient(0, sy - 74 * u, 0, sy); g4.addColorStop(0, css(SNOW, 0)); g4.addColorStop(1, css(SNOW, 0.75)); ctx.strokeStyle = g4; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(sx + 5 * u, sy - 24 * u, sx - 6 * u, sy - 46 * u, sx + 7 * u, sy - 74 * u); ctx.stroke(); ctx.fillStyle = css(GOLD); ctx.beginPath(); ctx.arc(sx, sy, 2.6 * u, 0, 7); ctx.fill(); ctx.strokeStyle = css(GOLD, 0.5); ctx.lineWidth = 0.7 * u; ctx.beginPath(); ctx.arc(sx, sy, 6 * u, 0, 7); ctx.stroke(); }
    // a point on the snow at a distance d ahead and l metres to the side, and the metres-to-pixels there (for traces)
    const jOf = d => (N - 1) * Math.pow(Math.max(0, Math.min(1, (d + 50) / 520)), 1 / 1.6);
    const atD = (d, l) => { const f = jOf(d), j = Math.min(N - 2, Math.floor(f)), k = f - j, a = hAt(G.rows[j], l), b = hAt(G.rows[j + 1], l); if (!a || !b) return null; const mm = W * 0.53 / (G.rows[j].half + (G.rows[j + 1].half - G.rows[j].half) * k); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, mm]; };
    const treeNear = (d, l) => { const r = G.rows[Math.round(jOf(d))]; let best = null, bd = 1e9; for (let i = 0; i < M; i++) if (r.tr[i]) { const li = (i - (M - 1) / 2) / ((M - 1) / 2) * r.half; if (Math.abs(li - l) < bd) { bd = Math.abs(li - l); best = li; } } return best; };
    const out = { T, u, run, spot: spotXY, atD, treeNear, rnd, m };
    if (o.ground && v.owned) o.ground(ctx, out);
    if (v.owned && v.wx && v.wx !== 'clear') snowfall(ctx, W, PH, v.wx, rnd, u);
    if (!v.owned && !o.scene) text(ctx, '？', W / 2, PH * 0.42, `300 ${46 * u}px ${SONG}`, css(SNOW, 0.34), 0, 'center');
    return out;
  }
  // the same picture's sky and land without a mountain to sample (another seed, a test): two faceted bands of hills
  function backdrop(ctx, W, PH, v, o) {
    const m = v.owned ? A.moment(v) : null, T = m ? skyAt(m.c) : (TOD[v.tod] || TOD.day), u = W / 300, rnd = RNG(m ? m.k : hash(v.card.id) + 3), h0 = hash(v.card.id) % 5;
    if (!v.owned) { ctx.fillStyle = css(mix(INK, [20, 30, 48], 0.6)); ctx.fillRect(0, 0, W, PH); return { T, u, run: [], spot: null, atD: () => null, treeNear: () => null, rnd, m }; }
    sky(ctx, W, PH, T, rnd, u, v.aurora && !(o && o.noAurora), h0, m); if (o && o.sky) o.sky(ctx, T, u);
    for (const [y0, amp, k] of [[0.52, 0.12, 0.3], [0.62, 0.08, 0.6], [0.74, 0.06, 0.85]]) { ctx.fillStyle = css(mix(T.far, T.near, k)); ctx.beginPath(); ctx.moveTo(0, PH); let x = 0; ctx.lineTo(0, PH * y0); while (x < W) { x += (24 + 30 * rnd()) * u; ctx.lineTo(Math.min(W, x), PH * (y0 - amp * (0.3 + 0.7 * rnd()))); } ctx.lineTo(W, PH); ctx.closePath(); ctx.fill(); ctx.strokeStyle = css(T.rim, 0.25 * k); ctx.lineWidth = 0.6 * u; ctx.stroke(); }
    if (v.wx && v.wx !== 'clear') snowfall(ctx, W, PH, v.wx, rnd, u);
    return { T, u, run: [], spot: null, atD: () => null, treeNear: () => null, rnd, m };
  }
  // emblem (a card with nothing else to show): the backdrop and its line drawing in a gold medallion
  function emblem(ctx, W, PH, v) {
    const S = backdrop(ctx, W, PH, v, {}), u = S.u, gl = A.glyphs[(v.card.art && v.card.art.glyph) || (v.kind && v.kind.glyph) || 'star'] || A.glyphs.star, cx = W / 2, cy = PH * 0.46;
    ctx.beginPath(); ctx.arc(cx, cy, 46 * u, 0, 7); ctx.fillStyle = css(INK, v.owned ? 0.55 : 0.3); ctx.fill(); ctx.strokeStyle = css(GOLD, v.owned ? 0.9 : 0.2); ctx.lineWidth = 1.2 * u; ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, 41 * u, 0, 7); ctx.lineWidth = 0.5 * u; ctx.stroke();
    if (v.owned) { ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = css(GOLD, 0.95); ctx.lineWidth = 1.6 * u; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; gl(ctx, 26 * u); ctx.restore(); }
    else if (!v.hidden) text(ctx, '？', cx, cy + 14 * u, `300 ${40 * u}px ${SONG}`, css(SNOW, 0.34), 0, 'center');
    return S;
  }

  // ---- scene: the view of a place on the run (art.station / art.s) with what the card is about left in it as a trace, never drawn as a
  // creature or a person: tracks in the snow leading into the trees, rings on the run, aurora, a gold arc off a kicker, streaks along the run.
  // art: { type: 'scene', station, at, fx: 'tracks' | 'den' | 'aurora' | 'rings' | 'rings-white' | 'secret' | 'storm' | 'arc' | 'speed' | 'soar', trail }
  const FX = A.fx = {};
  FX.aurora = { sky: (ctx, W, PH, T, u, seed) => {            // curtains as rows of upright strokes, a bright hem along the foot
    for (let k = 0; k < 2; k++) {
      const yb = x => PH * (0.33 - 0.09 * k) + PH * 0.05 * Math.sin(x / W * 5.2 + seed + k * 2.1) + PH * 0.02 * Math.sin(x / W * 13 + k);
      const len = x => PH * (0.13 + 0.06 * k) * (0.55 + 0.45 * Math.sin(x / W * 7.3 + seed * 1.7 + k));
      const lo = k ? [120, 200, 255] : [110, 255, 190], hi = k ? [170, 140, 255] : [140, 200, 255];
      ctx.lineWidth = 1.1 * u;
      for (let x = 2 * u; x < W; x += 3.2 * u) { const y = yb(x), L = len(x); ctx.strokeStyle = css(lo, 0.62 - k * 0.15); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - L * 0.38); ctx.stroke(); ctx.strokeStyle = css(hi, 0.2 - k * 0.05); ctx.beginPath(); ctx.moveTo(x, y - L * 0.42); ctx.lineTo(x, y - L); ctx.stroke(); }
      ctx.strokeStyle = css([200, 255, 230], 0.75 - k * 0.25); ctx.lineWidth = 0.8 * u; ctx.beginPath(); for (let x = 0; x <= W; x += 3 * u) { const y = yb(x); if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke();
    }
  } };
  // rings standing on the run, far to near: the line's own rings (gold), the tree line's (white), one secret ring (white, a glint, a trail)
  const rings = (ctx, S, col, every, max) => {
    const u = S.u; let last = -1e9, n = 0; const out = [];
    for (const p of S.run.slice().reverse()) { if (p.d < 30 || p.d - last < every) continue; last = p.d; out.push(p); if (++n >= max) break; }
    out.reverse(); for (const p of out) {
      const r = Math.max(3 * u, 4.2 * p.m * 1.7), cy = p.y - r * 1.08;
      ctx.strokeStyle = css(col, 0.22); ctx.lineWidth = Math.max(1, r * 0.34); ctx.beginPath(); ctx.ellipse(p.x, cy, r * 0.92, r, 0, 0, 7); ctx.stroke();
      ctx.strokeStyle = css(col, 0.95); ctx.lineWidth = Math.max(0.8 * u, r * 0.1); ctx.beginPath(); ctx.ellipse(p.x, cy, r * 0.92, r, 0, 0, 7); ctx.stroke();
    }
    return out;
  };
  FX.rings = { ground: (ctx, S) => rings(ctx, S, GOLD, 70, 6) };
  FX['rings-white'] = { ground: (ctx, S) => rings(ctx, S, SNOW, 55, 6) };
  FX.secret = { ground: (ctx, S, W, PH) => {
    const u = S.u, p = S.run.find(q => q.d > 90) || S.run[S.run.length - 1]; if (!p) return;
    const x = p.x + 40 * u, r = Math.max(9 * u, 4.2 * p.m * 2.2), cy = p.y - r * 1.4;
    ctx.fillStyle = css(SNOW, 0.85); for (let i = 1; i <= 9; i++) { const t = i / 10, px = W * 0.72 + (x - W * 0.72) * t + Math.sin(t * 6) * 10 * u, py = PH * 1.02 + (cy + r - PH * 1.02) * t; ctx.beginPath(); ctx.arc(px, py, (1.8 - t) * u, 0, 7); ctx.fill(); }
    ctx.strokeStyle = css(SNOW, 0.25); ctx.lineWidth = r * 0.4; ctx.beginPath(); ctx.ellipse(x, cy, r * 0.92, r, 0, 0, 7); ctx.stroke();
    ctx.strokeStyle = css(SNOW, 1); ctx.lineWidth = Math.max(0.9 * u, r * 0.11); ctx.beginPath(); ctx.ellipse(x, cy, r * 0.92, r, 0, 0, 7); ctx.stroke();
    const gx = x + r * 0.7, gy = cy - r * 0.75, g = 7 * u; ctx.fillStyle = css(SNOW); ctx.beginPath(); ctx.moveTo(gx, gy - g); ctx.lineTo(gx + g * 0.18, gy - g * 0.18); ctx.lineTo(gx + g, gy); ctx.lineTo(gx + g * 0.18, gy + g * 0.18); ctx.lineTo(gx, gy + g); ctx.lineTo(gx - g * 0.18, gy + g * 0.18); ctx.lineTo(gx - g, gy); ctx.lineTo(gx - g * 0.18, gy - g * 0.18); ctx.closePath(); ctx.fill();
  } };
  FX.storm = { front: (ctx, S, W, PH) => { const u = S.u, f = A.glyphs.flake; ctx.strokeStyle = css(SNOW, 0.9); ctx.lineCap = 'round'; for (const [x, y, s, w] of [[0.2, 0.3, 16, 1.4], [0.78, 0.2, 11, 1.1], [0.62, 0.62, 22, 1.7], [0.12, 0.72, 9, 1]]) { ctx.save(); ctx.translate(W * x, PH * y); ctx.lineWidth = w * u; f(ctx, s * u); ctx.restore(); } } };
  // tracks in the snow, from the near snow into the trees: how far apart, how many walked it, what each print is
  const TRAIL = { fox: { gap: 0.8, files: 1 }, hare: { gap: 2.0, files: 1 }, deer: { gap: 0.75, files: 3 }, ibex: { gap: 0.7, files: 2 } };
  function prints(ctx, S, kind, d0, d1, l0, l1, wob) {
    const T = S.T, rnd = S.rnd, u = S.u, col = css(mix(T.rim, SNOW, 0.4), 0.92), Tr = TRAIL[kind] || TRAIL.fox;   // drawn larger than life and light on the shaded snow, so the trail reads
    const dot = (x, y, rx, ry) => { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.35 * u, rx), Math.max(0.25 * u, ry), 0, 0, 7); ctx.fill(); };
    ctx.fillStyle = col;
    for (let f = 0; f < Tr.files; f++) {
      const off = (f - (Tr.files - 1) / 2) * 2.4, ph = rnd() * 6; let d = d0, side = 1;
      while (d < d1) {
        const t = (d - d0) / (d1 - d0), l = l0 + (l1 - l0) * t * t + Math.sin(t * 7 + ph) * wob * (1 - t) + off * (1 - 0.7 * t), p = S.atD(d, l);
        if (p) {
          const [x, y] = p, mm = p[2] * 2.2, q = 0.45;            // q: the snow seen from above at a slant, prints squashed
          if (kind === 'hare') { dot(x - 0.06 * mm, y, 0.035 * mm, 0.07 * mm * q); dot(x + 0.06 * mm, y, 0.035 * mm, 0.07 * mm * q); dot(x + 0.01 * mm, y + 0.16 * mm * q, 0.025 * mm, 0.03 * mm * q); dot(x - 0.02 * mm, y + 0.26 * mm * q, 0.025 * mm, 0.03 * mm * q); }
          else if (kind === 'deer' || kind === 'ibex') { const sx = x + side * 0.1 * mm; dot(sx - 0.025 * mm, y, 0.022 * mm, 0.05 * mm * q); dot(sx + 0.025 * mm, y, 0.022 * mm, 0.05 * mm * q); }
          else dot(x + side * 0.05 * mm, y, 0.05 * mm, 0.06 * mm * q);
          if (p[2] < 0.7 * u) break;
        }
        d += Tr.gap * (1 + d / 90); side = -side;
      }
    }
  }
  const trailOf = (S, kind, dMin, dMax) => { const r = S.rnd, l0 = (r() - 0.5) * 14, d1 = dMin + (dMax - dMin) * r(), lt = S.treeNear(d1, l0 + (r() - 0.5) * 50), l1 = lt == null ? l0 + 18 : lt; prints(S.ctx, S, kind, -42, d1, l0, l1, 3 + 6 * r()); return [d1, l1]; };
  FX.tracks = { ground: (ctx, S) => { S.ctx = ctx; trailOf(S, S.trail || 'fox', 80, 200); } };
  FX.den = { ground: (ctx, S) => {          // a fox's tracks that end at a hole under the trees
    S.ctx = ctx; const [d1, l1] = trailOf(S, 'fox', 60, 120), p = S.atD(d1 + 2, l1); if (!p) return;
    const [x, y, mm] = p, u = S.u; ctx.fillStyle = css(INK, 0.9); ctx.beginPath(); ctx.ellipse(x, y, Math.max(2.5 * u, 0.45 * mm), Math.max(1.6 * u, 0.3 * mm), 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = css(S.T.rim, 0.7); ctx.lineWidth = 0.8 * u; ctx.beginPath(); ctx.ellipse(x, y, Math.max(3.4 * u, 0.6 * mm), Math.max(2.2 * u, 0.4 * mm), 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  } };
  FX.soar = { sky: (ctx, W, PH, T, u, seed) => {     // a bird far up, only two strokes
    ctx.strokeStyle = css(mix(T.near, INK, 0.4), 0.85); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [x, y, s] of [[0.36 + seed * 0.04, 0.2, 1], [0.62 - seed * 0.02, 0.27, 0.6]]) { const cx = W * x, cy = PH * y, w = 9 * u * s; ctx.lineWidth = 1.1 * u * s; ctx.beginPath(); ctx.moveTo(cx - w, cy - w * 0.25); ctx.quadraticCurveTo(cx - w * 0.4, cy - w * 0.45, cx, cy); ctx.quadraticCurveTo(cx + w * 0.4, cy - w * 0.45, cx + w, cy - w * 0.25); ctx.stroke(); }
  } };
  FX.arc = { ground: (ctx, S) => {          // a kicker on the run and the flight off it, a gold dashed arc
    const u = S.u, q = S.run.find(p => p.d >= 45) || S.run[0]; if (!q) return; const l = q.l, a = S.atD(40, l), lip = S.atD(48, l), b = S.atD(110, l + 4); if (!a || !lip || !b) return;
    const lipY = lip[1] - 2.2 * lip[2]; ctx.fillStyle = css(S.T.rim, 0.9); ctx.beginPath(); ctx.moveTo(a[0] - 3 * a[2], a[1]); ctx.lineTo(lip[0] - 3 * lip[2], lipY); ctx.lineTo(lip[0] + 3 * lip[2], lipY); ctx.lineTo(a[0] + 3 * a[2], a[1]); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = css(GOLD, 0.95); ctx.lineWidth = 1.3 * u; ctx.setLineDash([3 * u, 3.5 * u]); ctx.beginPath(); ctx.moveTo(lip[0], lipY); ctx.quadraticCurveTo((lip[0] + b[0]) / 2, Math.min(lipY, b[1]) - 70 * u, b[0], b[1]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = css(GOLD); ctx.beginPath(); ctx.arc(b[0], b[1], 2.2 * u, 0, 7); ctx.fill();
  } };
  FX.speed = { ground: (ctx, S) => {        // the run drawn fast: a glow along it and streaks either side
    const u = S.u, pts = S.run.filter(p => p.d > 2 && p.d < 300).reverse(); if (pts.length < 2) return;
    for (const [o, col, a, w] of [[0, GOLD, 0.22, 5], [-4, SNOW, 0.7, 0.9], [4, SNOW, 0.7, 0.9], [-7, GOLD, 0.6, 0.7], [7, GOLD, 0.6, 0.7]]) {
      ctx.strokeStyle = css(col, a); ctx.lineCap = 'round'; ctx.lineWidth = w * u; ctx.beginPath(); let on = false;
      for (const p of pts) { const q = S.atD(p.d, p.l + o); if (!q) continue; if (on) ctx.lineTo(q[0], q[1]); else { ctx.moveTo(q[0], q[1]); on = true; } }
      ctx.stroke();
    }
  } };
  function scene(ctx, W, PH, v) {
    const a = v.card.art || {}, fx = FX[a.fx] || {}, seed = hash(v.card.id) % 7;
    const S = scenery(ctx, W, PH, v, { scene: true, noAurora: !!fx.sky, runA: a.fx && a.fx.indexOf('rings') === 0 ? 0.5 : 1,
      sky: fx.sky && v.owned ? (c, T, u) => fx.sky(c, W, PH, T, u, seed) : null,
      ground: fx.ground ? (c, S2) => { S2.trail = a.trail; fx.ground(c, S2, W, PH); } : null });
    if (fx.front && v.owned) fx.front(ctx, S, W, PH);
    if (!v.owned) text(ctx, v.hidden ? '' : '？', W / 2, PH * 0.36, `300 ${42 * S.u}px ${SONG}`, css(SNOW, 0.34), 0, 'center');
  }
  if (typeof Cards !== 'undefined') { Cards.art('scenery', scenery); Cards.art('emblem', emblem); Cards.art('scene', scene); Cards.glyph = A.glyph; }

  // ---- frames. Three looks to choose between (dev switch 卡框): a thin gold line round a full picture; a cut-corner frame with a medallion
  // on the seam (recommended); a printed card, paper round the picture, red seals for the stamps. Each draws picture, words and stamps.
  if (typeof Variants !== 'undefined') Variants.def('cardframe', '卡框', [['a', '细金框'], ['b', '切角徽章'], ['c', '版画留白']], 'b');
  const CHIP = { dawn: ['晨', 'D'], day: ['昼', 'N'], dusk: ['昏', 'E'], night: ['夜', 'Z'], clear: ['晴', 'C'], light: ['雪', 'S'], heavy: ['暴', 'H'], ski: ['双', 'S'], board: ['单', 'B'] };
  const cham = (ctx, x, y, w, h, c) => { ctx.beginPath(); ctx.moveTo(x + c, y); ctx.lineTo(x + w - c, y); ctx.lineTo(x + w, y + c); ctx.lineTo(x + w, y + h - c); ctx.lineTo(x + w - c, y + h); ctx.lineTo(x + c, y + h); ctx.lineTo(x, y + h - c); ctx.lineTo(x, y + c); ctx.closePath(); };
  const diamond = (ctx, x, y, r) => { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); };
  const pad = n => String(n).padStart(2, '0');
  function words(v) {
    const L = Cards.L, c = v.card, r = v.rec, F = Cards.facets, when = [];
    if (r) { const d = new Date(r.t); when.push(d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate()); }
    if (v.tod && F.tod) { const q = F.tod.values.find(x => x[0] === v.tod); if (q) when.push(L(q[1], q[2])); }
    if (v.wx && F.wx) { const q = F.wx.values.find(x => x[0] === v.wx); if (q) when.push(L(q[1], q[2])); }
    if (r && r.n > 1) when.push(L('第 ' + r.n + ' 次', '×' + r.n));
    const set = Cards.sets[c.set] || null;
    return { code: v.owned ? '#' + A.code(A.moment(v).k) : '', name: L(c.zh, c.en), fact: c.fact ? L(c.fact.zh || c.fact, c.fact.en) : '', when: when.join(' · '), set: ((set && (set.en || set.zh)) || '').toUpperCase(),
      locked: v.hidden ? L('秘密', 'Secret') : c.soon ? L('即将开放', 'Coming soon') : L('还没收到', 'Not yet'), hint: c.hint && !v.hidden ? L('线索：', 'Hint: ') + L(c.hint.zh || c.hint, c.hint.en) : '',
      stamps: (Cards.stamps(c, r)[0] || { values: [] }).values.map(q => [(CHIP[q[0]] || [q[1][0], q[2][0]])[Cards.L(0, 1)], q[3]]) };
  }
  const picture = (ctx, v, art) => (W, H) => { try { art(ctx, W, H, v); } catch (e) { console.warn('card art', v.card.id, e); emblem(ctx, W, H, v); } };

  // a: the first frame, tidied: full picture, words below, the stamps as small characters
  function frameA(ctx, W, H, v, pic) {
    const u = W / 300, own = v.owned, w = words(v), m = 18 * u, PH = H * 0.70;
    ctx.save(); rr(ctx, 0, 0, W, H, 10 * u); ctx.clip(); pic(W, PH);
    ctx.fillStyle = css(mix(INK, [16, 24, 40], 0.55)); ctx.fillRect(0, PH, W, H - PH); ctx.fillStyle = css(GOLD, own ? 0.55 : 0.2); ctx.fillRect(0, PH, W, Math.max(1, 0.6 * u));
    text(ctx, 'No.' + pad(v.no) + ' / ' + pad(v.total), m, 26 * u, `500 ${9 * u}px ${LAT}`, css(SNOW, own ? 0.86 : 0.4), 2.4 * u);
    text(ctx, w.set, W - m, 26 * u, `500 ${7.5 * u}px ${LAT}`, css(SNOW, own ? 0.7 : 0.3), 2.2 * u, 'right', W * 0.55); if (w.code) text(ctx, w.code, W - m, 38 * u, `500 ${7 * u}px ${LAT}`, css(SNOW, 0.55), 1.6 * u, 'right');
    if (own) {
      text(ctx, w.name, m, PH + 38 * u, `300 ${24 * u}px ${SONG}`, css(SNOW), 5 * u, 'left', W - 2 * m - 30 * u);
      if (w.fact) text(ctx, w.fact, m, PH + 60 * u, `400 ${10 * u}px ${SONG}`, css(SNOW, 0.66), 1 * u, 'left', W - 2 * m);
      text(ctx, w.when, m, PH + 84 * u, `400 ${8.5 * u}px ${LAT},${SONG}`, css(GOLD, 0.9), 1.2 * u, 'left', W - 2 * m - 60 * u);
      chips(ctx, w.stamps, W - m, PH + 84 * u, u, 'gold');
    } else {
      text(ctx, w.locked, m, PH + 38 * u, `300 ${20 * u}px ${SONG}`, css(SNOW, 0.5), 5 * u);
      if (w.hint) text(ctx, w.hint, m, PH + 62 * u, `400 ${10 * u}px ${SONG}`, css(SNOW, 0.6), 1 * u, 'left', W - 2 * m);
    }
    ctx.restore(); rr(ctx, 5 * u, 5 * u, W - 10 * u, H - 10 * u, 7 * u); ctx.strokeStyle = css(GOLD, own ? 0.8 : 0.28); ctx.lineWidth = Math.max(1, 0.7 * u); ctx.stroke();
    if (own && Cards.full(v.card) && (v.card.facets || v.kind && v.kind.facets || []).length) { rr(ctx, 8 * u, 8 * u, W - 16 * u, H - 16 * u, 5 * u); ctx.strokeStyle = css(GOLD, 0.55); ctx.lineWidth = Math.max(1, 0.5 * u); ctx.stroke(); }
  }
  // the stamps as small squares, a character each, right-aligned on a baseline: gold filled when got
  function chips(ctx, st, x1, y, u, look) {
    const s = 11 * u, g = 3 * u; let x = x1 - st.length * (s + g) + g;
    for (const [ch, got] of st) {
      if (look === 'seal') { rr(ctx, x, y - s + 2 * u, s, s, 1.2 * u); if (got) { ctx.fillStyle = 'rgba(190,52,40,0.92)'; ctx.fill(); } else { ctx.strokeStyle = 'rgba(190,52,40,0.45)'; ctx.lineWidth = 0.7 * u; ctx.stroke(); } text(ctx, ch, x + s / 2, y - 1 * u, `500 ${7.6 * u}px ${SONG}`, got ? 'rgba(244,236,222,1)' : 'rgba(190,52,40,0.5)', 0, 'center'); }
      else { rr(ctx, x, y - s + 2 * u, s, s, 2 * u); if (got) { ctx.fillStyle = css(GOLD, 0.95); ctx.fill(); } else { ctx.strokeStyle = css(GOLD, 0.45); ctx.lineWidth = 0.6 * u; ctx.stroke(); } text(ctx, ch, x + s / 2, y - 1 * u, `500 ${7.4 * u}px ${SONG}`, got ? css(INK) : css(GOLD, 0.55), 0, 'center'); }
      x += s + g;
    }
  }
  // b: a cut-corner card: the picture set in with its own cut corners, two gold lines round the card, a diamond at each corner, the number on
  // a clasp over the picture's top edge, the kind's medallion on the seam between picture and words. Every stamp: the inner line turns solid
  // and the diamonds fill.
  function frameB(ctx, W, H, v, pic) {
    const u = W / 300, own = v.owned, w = words(v), full = own && Cards.full(v.card) && (v.card.facets || v.kind && v.kind.facets || []).length, a = own ? 1 : 0.32;
    const m = 13 * u, PW = W - 2 * m, PHh = Math.round(H * 0.63), seam = m + PHh, cx = W / 2;
    cham(ctx, 0, 0, W, H, 13 * u); const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, css(mix(INK, [26, 34, 54], 0.7))); bg.addColorStop(1, css(INK)); ctx.fillStyle = bg; ctx.fill();
    ctx.save(); ctx.translate(m, m); cham(ctx, 0, 0, PW, PHh, 7 * u); ctx.clip(); pic(PW, PHh); ctx.restore();
    cham(ctx, m, m, PW, PHh, 7 * u); ctx.strokeStyle = css(GOLD, 0.75 * a); ctx.lineWidth = 0.8 * u; ctx.stroke();
    const fo = ctx.createLinearGradient(0, 0, W, H); fo.addColorStop(0, css(GOLD, a)); fo.addColorStop(0.45, css([255, 240, 210], a)); fo.addColorStop(0.55, css(GOLD, a)); fo.addColorStop(1, css([214, 160, 96], a));
    cham(ctx, 4 * u, 4 * u, W - 8 * u, H - 8 * u, 11 * u); ctx.strokeStyle = full ? fo : css(GOLD, 0.85 * a); ctx.lineWidth = (full ? 1.5 : 1.0) * u; ctx.stroke();
    cham(ctx, 7.5 * u, 7.5 * u, W - 15 * u, H - 15 * u, 9.5 * u); ctx.strokeStyle = css(GOLD, (full ? 0.85 : 0.32) * a); ctx.lineWidth = (full ? 0.8 : 0.5) * u; if (!full) ctx.setLineDash([1.5 * u, 2.5 * u]); ctx.stroke(); ctx.setLineDash([]);
    for (const [x, y] of [[8, 8], [W / u - 8, 8], [8, H / u - 8], [W / u - 8, H / u - 8]]) { diamond(ctx, x * u, y * u, 3 * u); if (full) { ctx.fillStyle = css(GOLD, a); ctx.fill(); } else { ctx.fillStyle = css(INK); ctx.fill(); ctx.strokeStyle = css(GOLD, 0.8 * a); ctx.lineWidth = 0.7 * u; ctx.stroke(); } }
    // the clasp
    const tw = 62 * u, th = 15 * u; cham(ctx, cx - tw / 2, m - th / 2, tw, th, 4 * u); ctx.fillStyle = css(INK); ctx.fill(); ctx.strokeStyle = css(GOLD, 0.8 * a); ctx.lineWidth = 0.7 * u; ctx.stroke();
    text(ctx, pad(v.no) + ' / ' + pad(v.total), cx, m + 3 * u, `500 ${8 * u}px ${LAT}`, css(GOLD, 0.95 * a), 2 * u, 'center');
    // the seam: a medallion and two small diamonds
    for (const k of [-1, 1]) { diamond(ctx, cx + k * 30 * u, seam, 2.2 * u); ctx.fillStyle = css(GOLD, 0.8 * a); ctx.fill(); }
    ctx.beginPath(); ctx.arc(cx, seam, 14 * u, 0, 7); ctx.fillStyle = css(INK); ctx.fill(); ctx.strokeStyle = css(GOLD, 0.9 * a); ctx.lineWidth = 1 * u; ctx.stroke(); ctx.beginPath(); ctx.arc(cx, seam, 11 * u, 0, 7); ctx.lineWidth = 0.45 * u; ctx.stroke();
    const kg = v.kind && v.kind.glyph && A.glyphs[v.kind.glyph];
    if (own && kg) { ctx.save(); ctx.translate(cx, seam); ctx.strokeStyle = css(GOLD, 0.95); ctx.lineWidth = 1 * u; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; kg(ctx, 6.5 * u); ctx.restore(); }
    else text(ctx, '？', cx, seam + 4.5 * u, `400 ${12 * u}px ${SONG}`, css(GOLD, 0.5), 0, 'center');
    if (own) {
      text(ctx, w.name, cx, seam + 43 * u, `300 ${22 * u}px ${SONG}`, css(SNOW), 6 * u, 'center', W - 40 * u);
      if (w.fact) text(ctx, w.fact, cx, seam + 62 * u, `400 ${9.5 * u}px ${SONG}`, css(SNOW, 0.66), 1 * u, 'center', W - 44 * u);
      text(ctx, w.set + (w.code ? '  ·  ' + w.code : ''), cx, seam + 79 * u, `500 ${6.6 * u}px ${LAT}`, css(SNOW, 0.45), 2.2 * u, 'center', W - 60 * u);
      text(ctx, w.when, 20 * u, H - 19 * u, `400 ${7.6 * u}px ${LAT},${SONG}`, css(GOLD, 0.85), 1 * u, 'left', W - 110 * u);
      chips(ctx, w.stamps, W - 20 * u, H - 17 * u, u, 'gold');
    } else {
      text(ctx, w.locked, cx, seam + 43 * u, `300 ${19 * u}px ${SONG}`, css(SNOW, 0.5), 6 * u, 'center');
      if (w.hint) text(ctx, w.hint, cx, seam + 64 * u, `400 ${9.5 * u}px ${SONG}`, css(SNOW, 0.55), 1 * u, 'center', W - 44 * u);
    }
  }
  // c: a printed card, the way a screen-print poster or a travel stamp is: warm paper round the picture, the name in ink, the number like an
  // edition, the stamps as red seals; every stamp got: a large seal 满 on the picture's corner
  function frameC(ctx, W, H, v, pic) {
    const u = W / 300, own = v.owned, w = words(v), full = own && Cards.full(v.card) && (v.card.facets || v.kind && v.kind.facets || []).length;
    const paper = own ? [237, 230, 215] : [150, 148, 144], ink = [34, 36, 48], m = 16 * u, PW = W - 2 * m, PHh = Math.round(H * 0.62);
    rr(ctx, 0, 0, W, H, 5 * u); ctx.fillStyle = css(paper); ctx.fill();
    const rnd = RNG(hash(v.card.id) + 11); ctx.fillStyle = css([120, 100, 70], 0.06); for (let i = 0; i < 260; i++) { ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, (0.3 + rnd() * 0.7) * u, 0, 7); ctx.fill(); }
    ctx.save(); ctx.translate(m, m); ctx.beginPath(); ctx.rect(0, 0, PW, PHh); ctx.clip(); pic(PW, PHh); ctx.restore();
    ctx.strokeStyle = css(ink, 0.85); ctx.lineWidth = 0.9 * u; ctx.strokeRect(m, m, PW, PHh); ctx.lineWidth = 0.4 * u; ctx.strokeRect(m - 3 * u, m - 3 * u, PW + 6 * u, PHh + 6 * u);
    const y0 = m + PHh;
    if (own) {
      text(ctx, w.name, m, y0 + 40 * u, `500 ${24 * u}px ${SONG}`, css(ink), 4 * u, 'left', W - 2 * m);
      if (w.fact) text(ctx, w.fact, m, y0 + 59 * u, `400 ${9.5 * u}px ${SONG}`, css(ink, 0.72), 1 * u, 'left', W - 2 * m);
      text(ctx, w.when, m, y0 + 77 * u, `400 ${7.6 * u}px ${LAT},${SONG}`, css(ink, 0.6), 1 * u, 'left', W - 2 * m);
      chips(ctx, w.stamps, W - m, H - 15 * u, u, 'seal');
      if (full) { ctx.save(); ctx.translate(m + PW - 26 * u, y0 - 4 * u); ctx.rotate(-0.08); rr(ctx, -15 * u, -15 * u, 30 * u, 30 * u, 2 * u); ctx.fillStyle = 'rgba(190,52,40,0.9)'; ctx.fill(); text(ctx, '满', 0, 7 * u, `600 ${20 * u}px ${SONG}`, css(paper), 0, 'center'); ctx.restore(); }
    } else {
      text(ctx, w.locked, m, y0 + 40 * u, `400 ${20 * u}px ${SONG}`, css(ink, 0.6), 4 * u);
      if (w.hint) text(ctx, w.hint, m, y0 + 60 * u, `400 ${9.5 * u}px ${SONG}`, css(ink, 0.6), 1 * u, 'left', W - 2 * m);
    }
    text(ctx, 'No.' + pad(v.no) + ' / ' + pad(v.total) + '   ' + w.set + (w.code ? '   ' + w.code : ''), m, H - 15 * u, `500 ${6.8 * u}px ${LAT}`, css(ink, 0.5), 1.6 * u, 'left', W - 2 * m - 70 * u);
  }

  // ---- a whole card. view: { card, rec, owned, tod, wx, aurora, no, total, seed, hidden, frame }
  A.draw = function (ctx, W, H, v) {
    const c = v.card, kind = Cards.kinds[c.kind] || null; v.kind = kind;
    const art = Cards.arts[(c.art && c.art.type) || (kind && kind.art) || 'emblem'] || emblem;
    const f = v.frame || (typeof Variants !== 'undefined' && Variants.val && Variants.val.cardframe) || 'b';
    ctx.save(); ctx.clearRect(0, 0, W, H);
    (f === 'a' ? frameA : f === 'c' ? frameC : frameB)(ctx, W, H, v, picture(ctx, v, art));
    ctx.restore();
  };
  return A;
})();
