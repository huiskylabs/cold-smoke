// ---------------------------------------------------------------- 集卡: how a card is drawn (pure Canvas 2D, no pictures)
// A card is 3:4: a picture and its words, in one of three frames (dev switch 卡框: a 细金框, b 切角徽章, c 版画留白).
// What the picture is depends on the card's art: { type: 'scenery' | 'scene' | 'emblem' | any later Cards.art, ... }:
//   scenery  the place itself, looked at from above it down the mountain: rows of the real snow (Course.height) far to near, trees as small
//            marks, the run as a gold line, the spot as a gold point under a thread of cold smoke. Drawn only on the card's own mountain.
//   scene    the same view of a place on the run (art.station / art.s), and in front of it what the card is about, built the way a screen
//            print is (WPA park posters, Charley Harper): an animal or a skier as a few flat shapes with fine lines for the shade, standing
//            on a faceted drift (art.stand), plus an effect (art.fx: aurora curtains, rings on the run, a secret ring, big flakes, a den).
//   emblem   a fallback: the hour's sky over faceted hills and the card's line drawing in a gold medallion
// A card not yet collected: dark, the outline of its picture faint (a figure as a dark silhouette), a question mark, its hint.
const CardArt = self.CardArt = (() => {
  const A = { glyphs: {}, figures: {} };
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

  // ---- figures (Cards.figure(id, fn(ctx, P))): an animal or a skier as a few flat shapes, the way a screen print or Charley Harper builds
  // one: a lens for the body, triangles for the head and ears, circles, and rows of fine lines for the shaded side. Drawn in units of the
  // figure's size, facing right, its feet on y = 0.75. P: { body, shade, dark, light, horn, eye, ghost } (css colours, already lit by the hour).
  A.figure = (id, fn) => { A.figures[id] = fn; };
  const F = A.figure;
  const poly = (c, col, ...p) => { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); c.fillStyle = col; c.fill(); };
  const disc = (c, col, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = col; c.fill(); };
  // fine parallel lines over a shape, only inside it (path = a function that lays the shape's path)
  const hatch = (c, P, path, y0, y1, step, w, ang) => { if (P.ghost) return; c.save(); path(c); c.clip(); c.strokeStyle = P.shade; c.lineWidth = w || 0.016; c.beginPath(); const t = Math.tan(ang || 0); for (let y = y0; y <= y1; y += step || 0.042) { c.moveTo(-1.6, y - t * 1.6); c.lineTo(1.6, y + t * 1.6); } c.stroke(); c.restore(); };
  const leg = (c, col, low, x, y0, w, lean = 0) => { poly(c, col, x - w / 2, y0, x + w / 2, y0, x + w * 0.3 + lean, 0.75, x - w * 0.3 + lean, 0.75); if (low) poly(c, low, x - w * 0.42 + lean * 0.6, 0.5, x + w * 0.42 + lean * 0.6, 0.5, x + w * 0.3 + lean, 0.75, x - w * 0.3 + lean, 0.75); };
  const bz = (t, a, b, cc, d) => { const m = 1 - t; return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * cc + t * t * t * d; };

  F('fox', (c, P) => {
    const tail = c2 => { c2.beginPath(); c2.moveTo(-0.5, 0.0); c2.bezierCurveTo(-0.95, -0.1, -1.24, 0.3, -1.04, 0.66); c2.bezierCurveTo(-0.94, 0.42, -0.76, 0.26, -0.48, 0.2); c2.closePath(); };
    const body = c2 => { c2.beginPath(); c2.moveTo(-0.62, 0.1); c2.quadraticCurveTo(-0.08, -0.42, 0.46, 0.0); c2.quadraticCurveTo(-0.05, 0.48, -0.62, 0.1); c2.closePath(); };
    leg(c, P.shade, P.dark, -0.38, 0.1, 0.1, 0.03); leg(c, P.shade, P.dark, 0.34, 0.06, 0.1, 0.03);
    tail(c); c.fillStyle = P.body; c.fill(); hatch(c, P, tail, 0.2, 0.7, 0.045, 0.016, -0.25);
    c.save(); tail(c); c.clip(); disc(c, P.light, -1.04, 0.63, 0.17); c.restore();
    leg(c, P.body, P.dark, -0.5, 0.08, 0.11, -0.02); leg(c, P.body, P.dark, 0.24, 0.06, 0.11, 0.03);
    body(c); c.fillStyle = P.body; c.fill(); hatch(c, P, body, 0.2, 0.36, 0.055, 0.02);
    poly(c, P.body, 0.28, -0.06, 0.52, -0.34, 0.7, -0.12, 0.44, 0.2);
    poly(c, P.light, 0.56, -0.14, 0.7, -0.12, 0.46, 0.2, 0.4, 0.12);
    poly(c, P.dark, 0.52, -0.35, 0.56, -0.67, 0.66, -0.37);
    poly(c, P.body, 0.5, -0.36, 0.78, -0.38, 1.04, -0.2, 0.68, -0.1);
    poly(c, P.light, 0.68, -0.1, 1.04, -0.2, 0.82, -0.2);
    poly(c, P.body, 0.65, -0.37, 0.74, -0.66, 0.81, -0.36); poly(c, P.dark, 0.69, -0.38, 0.74, -0.58, 0.77, -0.38);
    if (!P.ghost) { disc(c, P.eye, 0.77, -0.28, 0.03); disc(c, P.dark, 1.03, -0.2, 0.026); }
  });
  F('foxsleep', (c, P) => {           // curled up in the snow, the brush over the nose
    const body = c2 => { c2.beginPath(); c2.ellipse(0, 0.5, 0.42, 0.26, 0, 0, 7); };
    body(c); c.fillStyle = P.body; c.fill(); hatch(c, P, body, 0.52, 0.8, 0.04);
    poly(c, P.body, 0.18, 0.3, 0.52, 0.42, 0.3, 0.52); poly(c, P.dark, 0.2, 0.31, 0.22, 0.12, 0.32, 0.33); poly(c, P.light, 0.3, 0.52, 0.52, 0.42, 0.4, 0.5);
    c.beginPath(); c.moveTo(0.44, 0.62); c.bezierCurveTo(0.3, 0.86, -0.3, 0.88, -0.52, 0.66); c.bezierCurveTo(-0.3, 0.74, 0.2, 0.74, 0.36, 0.52); c.closePath(); c.fillStyle = P.shade; c.fill();
    disc(c, P.light, -0.5, 0.66, 0.08);
    if (!P.ghost) { c.strokeStyle = P.dark; c.lineWidth = 0.02; c.beginPath(); c.moveTo(0.33, 0.39); c.lineTo(0.4, 0.41); c.stroke(); }
  });
  F('deer', (c, P) => {
    const body = c2 => { c2.beginPath(); c2.moveTo(-0.62, 0.0); c2.quadraticCurveTo(-0.1, -0.42, 0.48, -0.06); c2.quadraticCurveTo(-0.05, 0.34, -0.62, 0.0); c2.closePath(); };
    leg(c, P.shade, P.dark, -0.4, 0.06, 0.06, 0.04); leg(c, P.shade, P.dark, 0.38, 0.02, 0.06, 0.05);
    leg(c, P.body, P.dark, -0.5, 0.0, 0.075, -0.03); leg(c, P.body, P.dark, 0.28, -0.02, 0.075, -0.02);
    body(c); c.fillStyle = P.body; c.fill(); hatch(c, P, body, 0.08, 0.2, 0.055, 0.02);
    disc(c, P.light, -0.58, -0.02, 0.1);
    poly(c, P.body, 0.3, -0.12, 0.5, -0.52, 0.62, -0.46, 0.48, -0.02); poly(c, P.light, 0.48, -0.3, 0.58, -0.38, 0.5, -0.12);
    poly(c, P.body, 0.5, -0.54, 0.36, -0.68, 0.53, -0.6);
    poly(c, P.body, 0.48, -0.56, 0.64, -0.6, 0.88, -0.42, 0.62, -0.42); if (!P.ghost) { disc(c, P.dark, 0.87, -0.43, 0.03); disc(c, P.eye, 0.63, -0.52, 0.024); }
    c.strokeStyle = P.horn; c.lineWidth = 0.03; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
    c.moveTo(0.56, -0.6); c.lineTo(0.5, -0.86); c.lineTo(0.38, -1.02); c.moveTo(0.52, -0.79); c.lineTo(0.64, -0.98); c.moveTo(0.46, -0.92); c.lineTo(0.54, -1.08);
    c.moveTo(0.62, -0.6); c.lineTo(0.68, -0.84); c.lineTo(0.62, -1.0); c.moveTo(0.67, -0.78); c.lineTo(0.8, -0.9); c.stroke();
  });
  F('hare', (c, P) => {               // white winter coat, sitting
    const body = c2 => { c2.beginPath(); c2.arc(-0.05, 0.42, 0.33, 0, 7); };
    body(c); c.fillStyle = P.body; c.fill(); hatch(c, P, body, 0.46, 0.8, 0.04);
    disc(c, P.light, -0.4, 0.5, 0.08);
    c.beginPath(); c.ellipse(0.2, -0.36, 0.06, 0.26, -0.28, 0, 7); c.fillStyle = P.body; c.fill(); c.beginPath(); c.ellipse(0.33, -0.36, 0.055, 0.25, 0.12, 0, 7); c.fill();
    c.beginPath(); c.ellipse(0.13, -0.57, 0.04, 0.06, -0.28, 0, 7); c.fillStyle = P.dark; c.fill(); c.beginPath(); c.ellipse(0.36, -0.57, 0.035, 0.055, 0.12, 0, 7); c.fill();
    disc(c, P.body, 0.3, -0.03, 0.18); disc(c, P.body, 0.18, 0.2, 0.16);
    c.beginPath(); c.ellipse(0.26, 0.72, 0.13, 0.04, 0, 0, 7); c.fillStyle = P.shade; c.fill();
    if (!P.ghost) { disc(c, P.dark, 0.38, -0.06, 0.036); disc(c, P.eye, 0.385, -0.065, 0.02); disc(c, P.dark, 0.47, 0.0, 0.02); }
  });
  F('ibex', (c, P) => {
    const body = c2 => { c2.beginPath(); c2.moveTo(-0.56, 0.06); c2.quadraticCurveTo(-0.05, -0.36, 0.42, -0.02); c2.quadraticCurveTo(-0.05, 0.4, -0.56, 0.06); c2.closePath(); };
    leg(c, P.shade, P.dark, -0.34, 0.12, 0.08, 0.03); leg(c, P.shade, P.dark, 0.34, 0.08, 0.08, 0.02);
    leg(c, P.body, P.dark, -0.46, 0.06, 0.1, -0.02); leg(c, P.body, P.dark, 0.22, 0.04, 0.1, 0.02);
    body(c); c.fillStyle = P.body; c.fill(); hatch(c, P, body, 0.18, 0.34, 0.055, 0.02);
    poly(c, P.body, 0.28, -0.05, 0.44, -0.36, 0.58, -0.3, 0.46, 0.1);
    poly(c, P.body, 0.44, -0.4, 0.58, -0.42, 0.78, -0.22, 0.6, -0.2); poly(c, P.dark, 0.6, -0.22, 0.7, -0.22, 0.63, -0.06);
    const o = [[0.47, -0.41], [0.42, -0.84], [0.08, -0.92], [-0.02, -0.5]], n = [[-0.02, -0.5], [0.1, -0.78], [0.38, -0.74], [0.57, -0.41]];
    c.beginPath(); c.moveTo(o[0][0], o[0][1]); c.bezierCurveTo(o[1][0], o[1][1], o[2][0], o[2][1], o[3][0], o[3][1]); c.bezierCurveTo(n[1][0], n[1][1], n[2][0], n[2][1], n[3][0], n[3][1]); c.closePath(); c.fillStyle = P.horn; c.fill();
    if (!P.ghost) { c.strokeStyle = P.shade; c.lineWidth = 0.014; c.beginPath(); for (let t = 0.12; t < 0.9; t += 0.075) { const k = 1 - t; c.moveTo(bz(t, o[0][0], o[1][0], o[2][0], o[3][0]), bz(t, o[0][1], o[1][1], o[2][1], o[3][1])); c.lineTo(bz(k, n[0][0], n[1][0], n[2][0], n[3][0]), bz(k, n[0][1], n[1][1], n[2][1], n[3][1])); } c.stroke(); disc(c, P.eye, 0.58, -0.33, 0.024); }
  });
  F('eagle', (c, P) => {               // seen from below, gliding: two long wings with fingered tips, a white head and tail
    const wing = k => c2 => { c2.beginPath(); c2.moveTo(0.06 * k, -0.08); c2.lineTo(0.55 * k, -0.22); c2.lineTo(0.95 * k, -0.13); c2.lineTo(1.06 * k, -0.06); c2.lineTo(0.96 * k, -0.02); c2.lineTo(1.02 * k, 0.03); c2.lineTo(0.9 * k, 0.04); c2.lineTo(0.94 * k, 0.1); c2.lineTo(0.8 * k, 0.09); c2.lineTo(0.5 * k, 0.1); c2.lineTo(0.06 * k, 0.08); c2.closePath(); };
    for (const k of [-1, 1]) { wing(k)(c); c.fillStyle = P.body; c.fill(); if (!P.ghost) { c.save(); wing(k)(c); c.clip(); c.strokeStyle = P.shade; c.lineWidth = 0.02; c.beginPath(); for (let x = 0.14; x < 1.1; x += 0.07) { c.moveTo(x * k, -0.3); c.lineTo((x + 0.04) * k, 0.2); } c.stroke(); c.restore(); } }
    poly(c, P.light, -0.08, 0.3, 0.08, 0.3, 0.16, 0.56, -0.16, 0.56);
    poly(c, P.dark, -0.09, -0.1, 0.09, -0.1, 0.07, 0.34, 0, 0.42, -0.07, 0.34);
    disc(c, P.light, 0, -0.15, 0.085); if (!P.ghost) poly(c, P.eye, -0.03, -0.21, 0.03, -0.21, 0, -0.28);
  });
  F('skier', (c, P) => {               // a tuck, side on, for the moments of speed and air
    c.strokeStyle = P.horn; c.lineWidth = 0.028; c.lineCap = 'round'; c.beginPath(); c.moveTo(-0.62, 0.58); c.lineTo(0.62, 0.58); c.quadraticCurveTo(0.76, 0.58, 0.8, 0.5); c.stroke();
    c.lineWidth = 0.014; c.beginPath(); c.moveTo(0.34, -0.06); c.lineTo(-0.5, 0.18); c.stroke();
    poly(c, P.dark, -0.22, 0.02, -0.02, 0.06, 0.16, 0.3, 0.02, 0.32); poly(c, P.dark, 0.02, 0.32, 0.16, 0.3, 0.06, 0.56, -0.06, 0.54);
    poly(c, P.dark, -0.08, 0.5, 0.12, 0.5, 0.14, 0.58, -0.1, 0.58);
    poly(c, P.body, -0.26, 0.04, 0.1, -0.3, 0.24, -0.22, -0.04, 0.1);
    const back = c2 => { c2.beginPath(); c2.moveTo(-0.26, 0.04); c2.lineTo(0.1, -0.3); c2.lineTo(0.24, -0.22); c2.lineTo(-0.04, 0.1); c2.closePath(); }; hatch(c, P, back, -0.1, 0.12, 0.04);
    poly(c, P.body, 0.12, -0.26, 0.38, -0.1, 0.36, -0.04, 0.08, -0.18);
    disc(c, P.light, 0.22, -0.34, 0.08); if (!P.ghost) poly(c, P.eye, 0.24, -0.34, 0.31, -0.34, 0.3, -0.29, 0.24, -0.3);
  });

  // the colours of each figure, before the hour lights it
  const LOOK = {
    fox: { body: [214, 104, 44], dark: [52, 30, 26], light: [246, 240, 230], horn: [246, 240, 230] },
    foxsleep: { body: [214, 104, 44], dark: [52, 30, 26], light: [246, 240, 230], horn: [246, 240, 230] },
    deer: { body: [152, 98, 62], dark: [48, 32, 26], light: [240, 232, 218], horn: [236, 222, 196] },
    hare: { body: [238, 238, 242], dark: [40, 40, 52], light: [255, 255, 255], horn: [255, 255, 255] },
    ibex: { body: [136, 114, 92], dark: [44, 36, 30], light: [230, 222, 206], horn: [210, 190, 156] },
    eagle: { body: [96, 64, 42], dark: [42, 28, 22], light: [248, 244, 236], horn: [248, 244, 236] },
    skier: { body: [212, 70, 54], dark: [34, 40, 60], light: [244, 240, 232], horn: [255, 208, 138] },
  };
  const HUE = { dawn: [[255, 200, 190], 0.14], day: [[255, 255, 255], 0], dusk: [[255, 168, 112], 0.18], night: [null, 0.55] };
  function palette(id, T, tod, ghost) {
    if (ghost) { const g = css([34, 46, 70]); return { body: g, shade: g, dark: g, light: g, horn: g, eye: g, ghost: true }; }
    const L = LOOK[id] || LOOK.fox, h = HUE[tod] || HUE.day, lit = col => h[0] ? mix(col, h[0], h[1]) : mix(col, T.near, h[1]);
    return { body: css(lit(L.body)), shade: css(mix(lit(L.body), INK, 0.42)), dark: css(lit(L.dark)), light: css(lit(L.light)), horn: css(lit(L.horn)), eye: css(GOLD), ghost: false };
  }
  function figure(ctx, id, x, y, s, T, tod, ghost, rot) { const fn = A.figures[id]; if (!fn) return; ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(s, s); ctx.lineCap = 'butt'; fn(ctx, palette(id, T, tod, ghost)); ctx.restore(); }

  // ---- the pictures (Cards.art)
  // scenery: the place's own snow. Returns what was drawn where (the run, row by row, and the spot) so a scene can stand things on it.
  function scenery(ctx, W, PH, v, o) {
    o = o || {};
    const sp = A.spot(v.card), mine = (!v.card.seed || (typeof Course !== 'undefined' && Course.seed === v.card.seed)) && (!v.card.mtn || typeof Course !== 'undefined' && Course.mountainBySeed && (Course.mountainBySeed() || {}).id === v.card.mtn);
    const G = sp && mine ? A.grid(sp.s, sp.u) : null;
    if (!G) return o.scene ? backdrop(ctx, W, PH, v, o) : emblem(ctx, W, PH, v);
    const T = TOD[v.tod] || TOD.day, u = W / 300, rnd = RNG(hash(v.card.id) + 7), N = G.N, M = G.M, yFar = PH * 0.44, yNear = PH + 10 * u, pFar = G.rows[N - 1].p, KY = (W / 2) / 62 * 1.5;
    if (v.owned) { sky(ctx, W, PH, T, rnd, u, v.aurora && !o.noAurora, hash(v.card.id) % 7); if (o.sky) o.sky(ctx, T, u); }
    else { ctx.fillStyle = css(mix(INK, [20, 30, 48], 0.6)); ctx.fillRect(0, 0, W, PH); }
    const rowY = r => yFar + (yNear - yFar) * (r.p - pFar) / (1 - pFar), X = i => W / 2 + (i - (M - 1) / 2) / ((M - 1) / 2) * W * 0.53;
    const pt = (r, i) => [X(i), rowY(r) - r.h[i] * KY * r.p];
    const hAt = (r, l) => { const f = (l / r.half) * (M - 1) / 2 + (M - 1) / 2; if (f < 0 || f > M - 1) return null; const i = Math.min(M - 2, Math.floor(f)), k = f - i; return [W / 2 + (f - (M - 1) / 2) / ((M - 1) / 2) * W * 0.53, rowY(r) - (r.h[i] + (r.h[i + 1] - r.h[i]) * k) * KY * r.p]; };
    if (v.owned) {          // far ridges (the seed's own noise, standing in for the far country)
      const r2 = RNG((v.seed || 1) * 7 + 3), ph = [r2() * 9, r2() * 9, r2() * 9, r2() * 9];
      for (const [amp, base, k] of [[34, -6, 0.32], [20, 6, 0.58]]) { ctx.fillStyle = css(mix(T.low, T.far, k)); ctx.beginPath(); ctx.moveTo(0, PH); for (let x = 0; x <= W; x += 3 * u) { const q = x / W, y = yFar + base * u - amp * u * (0.5 + 0.5 * Math.sin(q * 5.1 + ph[0])) * (0.55 + 0.45 * Math.sin(q * 13.7 + ph[1])) - 5 * u * Math.abs(Math.sin(q * 41 + ph[2])) - 2 * u * Math.sin(q * 97 + ph[3]); ctx.lineTo(x, y); } ctx.lineTo(W, PH); ctx.closePath(); ctx.fill(); }
    }
    let spotXY = null; const run = [];
    for (let j = N - 1; j >= 0; j--) {
      const r = G.rows[j], k = 1 - j / (N - 1);
      ctx.beginPath(); ctx.moveTo(-4, PH + 20 * u); for (let i = 0; i < M; i++) { const p = pt(r, i); if (i === 0) ctx.lineTo(-4, p[1]); ctx.lineTo(p[0], p[1]); if (i === M - 1) ctx.lineTo(W + 4, p[1]); } ctx.lineTo(W + 4, PH + 20 * u); ctx.closePath();
      if (v.owned) { ctx.fillStyle = css(mix(T.far, T.near, 0.08 + 0.92 * Math.pow(k, 0.8))); ctx.fill(); ctx.strokeStyle = css(T.rim, 0.14 + 0.5 * k); ctx.lineWidth = (0.45 + 0.6 * k) * u; ctx.stroke(); }
      else { ctx.fillStyle = css(mix(INK, [20, 30, 48], 0.6)); ctx.fill(); ctx.strokeStyle = css(SNOW, 0.07 + 0.13 * k); ctx.lineWidth = 0.6 * u; ctx.stroke(); }
      if (v.owned) { ctx.fillStyle = css(mix(T.near, INK, 0.30 + 0.45 * k)); const sz = 8.5 * KY / 1.5 * r.p; for (let i = 0; i < M; i++) { if (!r.tr[i]) continue; const p = pt(r, i), s2 = sz * (0.7 + 0.6 * rnd()), dx = (rnd() - 0.5) * 3 * u; ctx.beginPath(); ctx.moveTo(p[0] + dx - s2 * 0.3, p[1] + 1); ctx.lineTo(p[0] + dx, p[1] - s2); ctx.lineTo(p[0] + dx + s2 * 0.3, p[1] + 1); ctx.closePath(); ctx.fill(); } }
      const a0 = hAt(r, r.ways[0]); if (a0) run.push({ x: a0[0], y: a0[1], k, d: r.d, m: W * 0.53 / r.half });
      if (j > 0) { const r1 = G.rows[j - 1]; r.ways.forEach((w, n) => { let w1 = null, bd = 30; for (const q of r1.ways) if (Math.abs(q - w) < bd) { bd = Math.abs(q - w); w1 = q; } if (w1 == null) return; const a = hAt(r, w), b2 = hAt(r1, w1); if (!a || !b2) return; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b2[0], b2[1]); ctx.strokeStyle = v.owned ? css(GOLD, (n === 0 ? 0.92 : 0.42) * (o.runA == null ? 1 : o.runA)) : css(SNOW, 0.14); ctx.lineWidth = (n === 0 ? 0.5 + 1.0 * k : 0.4 + 0.5 * k) * u; ctx.lineCap = 'round'; ctx.stroke(); }); }
      if (r.d <= 0 && (j === N - 1 || G.rows[j + 1].d > 0)) spotXY = hAt(r, 0);
    }
    if (spotXY && v.owned && !o.scene) { const [sx, sy] = spotXY, g4 = ctx.createLinearGradient(0, sy - 74 * u, 0, sy); g4.addColorStop(0, css(SNOW, 0)); g4.addColorStop(1, css(SNOW, 0.75)); ctx.strokeStyle = g4; ctx.lineWidth = 1.2 * u; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(sx + 5 * u, sy - 24 * u, sx - 6 * u, sy - 46 * u, sx + 7 * u, sy - 74 * u); ctx.stroke(); ctx.fillStyle = css(GOLD); ctx.beginPath(); ctx.arc(sx, sy, 2.6 * u, 0, 7); ctx.fill(); ctx.strokeStyle = css(GOLD, 0.5); ctx.lineWidth = 0.7 * u; ctx.beginPath(); ctx.arc(sx, sy, 6 * u, 0, 7); ctx.stroke(); }
    if (v.owned && v.wx && v.wx !== 'clear') snowfall(ctx, W, PH, v.wx, rnd, u);
    if (!v.owned && !o.scene) text(ctx, '？', W / 2, PH * 0.42, `300 ${46 * u}px ${SONG}`, css(SNOW, 0.34), 0, 'center');
    return { T, u, run, spot: spotXY };
  }
  // the same picture's sky and land without a mountain to sample (another seed, a test): two faceted bands of hills
  function backdrop(ctx, W, PH, v, o) {
    const T = TOD[v.tod] || TOD.day, u = W / 300, rnd = RNG(hash(v.card.id) + 3), h0 = hash(v.card.id) % 5;
    if (!v.owned) { ctx.fillStyle = css(mix(INK, [20, 30, 48], 0.6)); ctx.fillRect(0, 0, W, PH); return { T, u, run: [], spot: null }; }
    sky(ctx, W, PH, T, rnd, u, v.aurora && !(o && o.noAurora), h0); if (o && o.sky) o.sky(ctx, T, u);
    for (const [y0, amp, k] of [[0.52, 0.12, 0.3], [0.62, 0.08, 0.6], [0.74, 0.06, 0.85]]) { ctx.fillStyle = css(mix(T.far, T.near, k)); ctx.beginPath(); ctx.moveTo(0, PH); let x = 0; ctx.lineTo(0, PH * y0); while (x < W) { x += (24 + 30 * rnd()) * u; ctx.lineTo(Math.min(W, x), PH * (y0 - amp * (0.3 + 0.7 * rnd()))); } ctx.lineTo(W, PH); ctx.closePath(); ctx.fill(); ctx.strokeStyle = css(T.rim, 0.25 * k); ctx.lineWidth = 0.6 * u; ctx.stroke(); }
    if (v.wx && v.wx !== 'clear') snowfall(ctx, W, PH, v.wx, rnd, u);
    return { T, u, run: [], spot: null };
  }
  // emblem (an older card's art, or a card with no figure yet): the backdrop and its line drawing in a gold medallion
  function emblem(ctx, W, PH, v) {
    const S = backdrop(ctx, W, PH, v, {}), u = S.u, gl = A.glyphs[(v.card.art && v.card.art.glyph) || (v.kind && v.kind.glyph) || 'star'] || A.glyphs.star, cx = W / 2, cy = PH * 0.46;
    ctx.beginPath(); ctx.arc(cx, cy, 46 * u, 0, 7); ctx.fillStyle = css(INK, v.owned ? 0.55 : 0.3); ctx.fill(); ctx.strokeStyle = css(GOLD, v.owned ? 0.9 : 0.2); ctx.lineWidth = 1.2 * u; ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, 41 * u, 0, 7); ctx.lineWidth = 0.5 * u; ctx.stroke();
    if (v.owned) { ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = css(GOLD, 0.95); ctx.lineWidth = 1.6 * u; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; gl(ctx, 26 * u); ctx.restore(); }
    else if (!v.hidden) text(ctx, '？', cx, cy + 14 * u, `300 ${40 * u}px ${SONG}`, css(SNOW, 0.34), 0, 'center');
    return S;
  }

  // ---- scene: a place of the run (art.station / art.s), and in front of it what the card is about. art: { type: 'scene', station, at, fig,
  // stand: 'ledge' | 'sky' | 'slope' | 'kicker', fx: 'aurora' | 'rings' | 'rings-white' | 'secret' | 'storm' | 'den' }
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
  FX.den = { stand: (ctx, S, W, PH, cr) => { const u = S.u; ctx.fillStyle = css(INK, 0.85); ctx.beginPath(); ctx.moveTo(cr[0] - 64 * u, cr[1] + 14 * u); ctx.quadraticCurveTo(cr[0] - 50 * u, cr[1] - 14 * u, cr[0] - 32 * u, cr[1] + 12 * u); ctx.closePath(); ctx.fill(); } };

  // the ground a figure stands on, a faceted drift in front of the view: a lit face toward the sun, the other face shaded in fine lines,
  // two stacked-triangle pines at its far end. Returns where the crest is.
  function ledge(ctx, W, PH, T, u, owned, sunLeft, shape) {
    const lit = owned ? css(mix(T.rim, T.near, 0.22)) : css(mix(INK, [24, 34, 54], 0.7)), dark = owned ? css(mix(T.near, INK, 0.22)) : css(mix(INK, [20, 30, 48], 0.6));
    const P = shape === 'slope' ? [[-2, PH * 0.58], [W * 0.5, PH * 0.73], [W * 0.62, PH * 0.76], [W + 2, PH * 0.9]] : shape === 'kicker' ? [[-2, PH * 0.74], [W * 0.2, PH * 0.73], [W * 0.3, PH * 0.66], [W * 0.31, PH * 0.75], [W * 0.6, PH * 0.8], [W + 2, PH * 0.84]] : [[-2, PH * 0.86], [W * 0.56, PH * 0.74], [W * 0.8, PH * 0.79], [W + 2, PH * 0.9]];
    const ci = shape === 'kicker' ? 2 : 1, crest = P[ci], split = [crest[0] - W * 0.1, PH + 2];
    const face = (pts, col) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
    const left = [...P.slice(0, ci + 1), split, [-2, PH + 2]], right = [...P.slice(ci), [W + 2, PH + 2], split];
    face(left, sunLeft ? lit : dark); face(right, sunLeft ? dark : lit);
    const shaded = sunLeft ? right : left;
    if (owned) { ctx.save(); face(shaded, 'rgba(0,0,0,0)'); ctx.clip(); ctx.strokeStyle = css(T.rim, 0.22); ctx.lineWidth = 0.7 * u; ctx.beginPath(); for (let y = PH * 0.62; y < PH + 4; y += 3.4 * u) { ctx.moveTo(-2, y); ctx.lineTo(W + 2, y + W * 0.08); } ctx.stroke(); ctx.restore(); }
    ctx.strokeStyle = owned ? css(T.rim, 0.7) : css(SNOW, 0.16); ctx.lineWidth = 0.9 * u; ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const p of P.slice(1)) ctx.lineTo(p[0], p[1]); ctx.stroke();
    ctx.strokeStyle = owned ? css(T.rim, 0.35) : css(SNOW, 0.08); ctx.lineWidth = 0.6 * u; ctx.beginPath(); ctx.moveTo(crest[0], crest[1]); ctx.lineTo(split[0], split[1]); ctx.stroke();
    if (shape !== 'kicker') { const tc = owned ? css(mix(T.near, INK, 0.55)) : css(mix(INK, [20, 30, 48], 0.4)); for (const [x, h] of [[0.9, 46], [0.97, 34]]) { const bx = W * x, by = PH * 0.86 + (x - 0.9) * 40 * u; for (let t = 0; t < 3; t++) { const y1 = by - h * u * (0.2 + t * 0.3), w = (10 - t * 2.6) * u; ctx.beginPath(); ctx.moveTo(bx - w, y1 + 12 * u); ctx.lineTo(bx, y1 - 9 * u); ctx.lineTo(bx + w, y1 + 12 * u); ctx.closePath(); ctx.fillStyle = tc; ctx.fill(); } } }
    return crest;
  }
  const FIG = { fox: [0.22, 0.04], foxsleep: [0.2, 0.02], deer: [0.25, 0.0], hare: [0.17, 0.0], ibex: [0.23, 0.02], skier: [0.24, 0], eagle: [0.3, 0] };
  function scene(ctx, W, PH, v) {
    const a = v.card.art || {}, fx = FX[a.fx] || {}, seed = hash(v.card.id) % 7;
    const S = scenery(ctx, W, PH, v, { scene: true, noAurora: !!fx.sky, runA: a.fx && a.fx.indexOf('rings') === 0 ? 0.5 : 1, sky: fx.sky && v.owned ? (c, T, u) => fx.sky(c, W, PH, T, u, seed) : null });
    const T = S.T, u = S.u, sunLeft = T.orb[0] < 0.5;
    if (fx.ground && v.owned) fx.ground(ctx, S, W, PH);
    if (a.stand && a.stand !== 'sky') {
      const cr = ledge(ctx, W, PH, T, u, v.owned, sunLeft, a.stand === 'ledge' ? null : a.stand);
      if (fx.stand) fx.stand(ctx, S, W, PH, cr);
      if (a.fig) {
        const [k, dy] = FIG[a.fig] || [0.22, 0], s = W * k;
        if (a.stand === 'slope') figure(ctx, a.fig, W * 0.5, PH * 0.73 - 0.58 * s, s, T, v.tod, !v.owned, 0.29);
        else if (a.stand === 'kicker') {
          if (v.owned) { ctx.strokeStyle = css(GOLD, 0.9); ctx.lineWidth = 1.2 * u; ctx.setLineDash([3 * u, 4 * u]); ctx.beginPath(); ctx.moveTo(cr[0], cr[1]); ctx.quadraticCurveTo(W * 0.58, PH * 0.12, W * 0.92, PH * 0.7); ctx.stroke(); ctx.setLineDash([]); }
          figure(ctx, a.fig, W * 0.6, PH * 0.38, s * 0.8, T, v.tod, !v.owned, -0.18);
        } else figure(ctx, a.fig, cr[0] - s * 0.1, cr[1] + PH * dy - 0.75 * s, s, T, v.tod, !v.owned);
      }
    } else if (a.fig) figure(ctx, a.fig, W * 0.5, PH * 0.3, W * (FIG[a.fig] || [0.3])[0], T, v.tod, !v.owned);
    if (fx.front && v.owned) fx.front(ctx, S, W, PH);
    if (a.speed && v.owned) { ctx.strokeStyle = css(SNOW, 0.85); ctx.lineCap = 'round'; for (let i = 0; i < 7; i++) { const y = PH * (0.5 + i * 0.035) + i * 2 * u, x1 = W * 0.36 + (i % 3) * 4 * u, L = (30 + (i * 37) % 50) * u; ctx.lineWidth = (1.6 - i * 0.12) * u; ctx.beginPath(); ctx.moveTo(x1 - L, y - L * 0.3); ctx.lineTo(x1, y); ctx.stroke(); } }
    if (!v.owned) text(ctx, v.hidden ? '' : '？', W / 2, PH * 0.36, `300 ${42 * u}px ${SONG}`, css(SNOW, 0.34), 0, 'center');
  }
  if (typeof Cards !== 'undefined') { Cards.art('scenery', scenery); Cards.art('emblem', emblem); Cards.art('scene', scene); Cards.glyph = A.glyph; Cards.figure = A.figure; }

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
    return { name: L(c.zh, c.en), fact: c.fact ? L(c.fact.zh || c.fact, c.fact.en) : '', when: when.join(' · '), set: ((set && (set.en || set.zh)) || '').toUpperCase(),
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
    text(ctx, w.set, W - m, 26 * u, `500 ${7.5 * u}px ${LAT}`, css(SNOW, own ? 0.7 : 0.3), 2.2 * u, 'right', W * 0.55);
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
      text(ctx, w.set, cx, seam + 79 * u, `500 ${6.6 * u}px ${LAT}`, css(SNOW, 0.45), 2.2 * u, 'center', W - 60 * u);
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
    text(ctx, 'No.' + pad(v.no) + ' / ' + pad(v.total) + '   ' + w.set, m, H - 15 * u, `500 ${6.8 * u}px ${LAT}`, css(ink, 0.5), 1.6 * u, 'left', W - 2 * m - 70 * u);
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
