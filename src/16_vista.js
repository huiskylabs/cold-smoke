// ---------------------------------------------------------------- vista: what lies beyond the mountain — ranges along the horizon and a city standing in the cloud sea.
// Both are too far away ever to come nearer, so each is worked out once, on the CPU, as a panorama seen from the mountain. The panoramas hold
// surfaces (normal, material, distance, height), not colours: the sky shader lights them every frame with the same sun, sky and air as everything else.
const Vista = (() => {
  const V = {
    AZ: 1.25, EL0: -0.034, EL1: 0.090, farW: 2048, farH: 256,                 // far ranges: azimuth +-AZ about -z, elevation EL0..EL1 (rad)
    cityAz: 0.14, cityHalf: 0.22, cEL0: -0.105, cEL1: 0.098, cityW: 1024, cityH: 496,
    deck: 950,                                                                // the cloud deck lies this far below the eye (m), as in cloudSea()
    cityDist: 11500, cityNear: 8600, citySpan: 6400, cityTop: 2060, cityRise: 1.35,   // m; cityRise: how much taller the towers stand than they were first drawn
    shU0: -3000, shU1: 4600, shW0: -7200, shW1: 2600, shRes: 512,             // the deck area that can hold the towers' shadows (city-local metres)
    ready: false, stats: {},
  };
  let gfx;

  // ---- fast lattice noise (0..1)
  const tab = new Float32Array(65536); for (let i = 0; i < 65536; i++) tab[i] = hashU(i * 7 + 99991) * U2F;
  function vn(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y); let fx = x - ix, fy = y - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const x0 = ix & 255, x1 = (ix + 1) & 255, y0 = (iy & 255) << 8, y1 = ((iy + 1) & 255) << 8;
    const a = tab[y0 + x0], b = tab[y0 + x1], c = tab[y1 + x0], d = tab[y1 + x1];
    return a + (b - a) * fx + (c - a + (a - b - c + d) * fx) * fy;
  }

  // ================================================================= far ranges
  // one great massif to the left of the sun, a second out to the right, lower country behind the city so its skyline stands against the sky
  function envAz(az) { const a = (az + 0.37) / 0.20, b = (az - 0.62) / 0.26, c = (az - 0.14) / 0.30; return 0.62 + 0.52 * Math.exp(-a * a) + 0.36 * Math.exp(-b * b) - 0.20 * Math.exp(-c * c); }
  // height of the far country (m, relative to the eye) at x, z (km): ridged multifractal, folded so the ridges are not straight, gathered into
  // ranges with cloud-filled gaps between them, and dropping away with the curve of the earth
  function farH(x, z, oct) {
    const r = Math.hypot(x, z);
    const wx = x + 9 * (vn(x * 0.045 + 3.1, z * 0.045 + 7.7) - 0.5), wz = z + 9 * (vn(x * 0.045 + 11.4, z * 0.045 + 1.9) - 0.5);
    let f = 1 / 15, amp = 1, sum = 0, w = 1;
    for (let o = 0; o < oct; o++) {
      let n = 1 - Math.abs(vn(wx * f + o * 17.3, wz * f + o * 9.1) * 2 - 1); n *= n * w; w = Math.min(1, n * 1.9 + 0.15); sum += n * amp; f *= 2.1; amp *= 0.52;
    }
    const rg = 0.30 + 0.70 * smooth(0.36, 0.62, vn(x * 0.021 + 40.3, z * 0.021 + 13.7));
    return V.farBase + smooth(20, 32, r) * envAz(Math.atan2(x, -z)) * rg * Math.pow(sum, 1.3) * V.farAmp - r * r * 0.0786;
  }
  V.farBase = -1400; V.farAmp = 2700;
  const HS = [0.25, 0.8, 2.4, 6.0];

  function buildFar(W, H) {
    const A = new Uint8ClampedArray(W * H * 4), B = new Uint8ClampedArray(W * H * 4);
    const NR = 320, R0 = 20, R1 = 190, dr = Math.log(R1 / R0) / (NR - 1), del = (V.EL1 - V.EL0) / H;
    const rad = new Float32Array(NR); for (let i = 0; i < NR; i++) rad[i] = R0 * Math.exp(i * dr);
    const tanRow = new Float32Array(H); for (let k = 0; k < H; k++) tanRow[k] = Math.tan(V.EL1 - (k + 0.5) * del);
    const dist = new Float32Array(H), sdx = Math.sin(Sky.az), sdz = -Math.cos(Sky.az);
    const rowOf = t => (V.EL1 - Math.atan(t)) / del - 0.5;
    let vis = 0;
    for (let c = 0; c < W; c++) {
      const az = -V.AZ + (c + 0.5) / W * 2 * V.AZ, dx = Math.sin(az), dz = -Math.cos(az);
      dist.fill(0);
      // walk outward; whatever rises above everything nearer is seen, and fills the rows between the old skyline and the new
      let maxT = Math.tan(V.EL0), tPrev = maxT, rPrev = R0, kBot = H;
      for (let i = 0; i < NR; i++) {
        const r = rad[i], t = farH(dx * r, dz * r, 6) / (r * 1000);
        if (t > maxT) {
          const kTop = Math.max(0, Math.ceil(rowOf(t)));
          for (let k = Math.min(kBot, H) - 1; k >= kTop; k--) { const f = (tanRow[k] - tPrev) / (t - tPrev); dist[k] = rPrev + (r - rPrev) * (f < 0 ? 0 : f > 1 ? 1 : f); }
          if (kTop < kBot) kBot = kTop;
          maxT = t;
        }
        tPrev = t; rPrev = r;
      }
      // the row that holds the skyline is only partly covered
      const fr = rowOf(maxT) + 0.5, ks = Math.floor(fr), cov = ks + 1 - fr;
      if (ks >= 0 && ks < H - 1 && dist[ks] === 0 && dist[ks + 1] > 0 && cov > 0.02) dist[ks] = dist[ks + 1];
      let top = -1;
      for (let k = 0; k < H; k++) {
        const rr = dist[k]; if (rr <= 0) continue;
        if (top < 0) top = k;
        const x = dx * rr, z = dz * rr, e = Math.max(0.02, rr * 0.0007);
        const h0 = farH(x, z, 8), gx = -(farH(x + e, z, 8) - h0) / (e * 1000), gz = -(farH(x, z + e, 8) - h0) / (e * 1000), il = 1 / Math.hypot(gx, 1, gz);
        let hzn = -0.1; for (let s = 0; s < 4; s++) { const q = (farH(x + sdx * HS[s], z + sdz * HS[s], 5) - h0) / (HS[s] * 1000); if (q > hzn) hzn = q; }
        const rock = smooth(0.90, 0.72, il + (vn(x * 2.7 + 5, z * 2.7) - 0.5) * 0.26);
        const o = (k * W + c) * 4;
        A[o] = 127.5 + 127.5 * gx * il; A[o + 1] = 127.5 + 127.5 * il; A[o + 2] = 127.5 + 127.5 * gz * il; A[o + 3] = 255 * (k === ks ? cov : 1);
        B[o] = 255 * Math.log(rr / 20) / Math.LN10; B[o + 1] = 255 * (hzn + 0.1) / 1.1; B[o + 2] = 255 * rock; B[o + 3] = 255;
        vis++;
      }
      // carry the skyline's surface up into the empty sky above it (coverage 0) so filtering never mixes in black
      if (top > 0) { const s = (top * W + c) * 4; for (let k = top - 1; k >= 0; k--) { const o = (k * W + c) * 4; A[o] = A[s]; A[o + 1] = A[s + 1]; A[o + 2] = A[s + 2]; B[o] = B[s]; B[o + 1] = B[s + 1]; B[o + 2] = B[s + 2]; B[o + 3] = 255; } }
    }
    V.stats.farPx = vis;
    return { A: new Uint8Array(A.buffer), B: new Uint8Array(B.buffer) };
  }

  // ================================================================= the city
  // City-local frame: u to the right as seen from the mountain, w away from it; heights are measured from the top of the cloud deck.
  function cityFrame() {
    const a = V.cityAz, D = V.cityDist;
    return { C: [D * Math.sin(a), -D * Math.cos(a)], U: [Math.cos(a), Math.sin(a)], W: [Math.sin(a), -Math.cos(a)] };
  }
  function buildCityList() {
    const rnd = RNG(90417), T = [];
    const cores = [[250, 150, 950, 1060], [-1650, 650, 760, 770], [1750, -350, 680, 660], [-350, 1750, 820, 540], [900, -1300, 520, 430]];
    const env = (u, w) => { let e = 250 * Math.max(0, 1 - (u / 2800) ** 2 - (w / 2200) ** 2); for (const c of cores) { const d2 = ((u - c[0]) ** 2 + (w - c[1]) ** 2) / (c[2] * c[2]); e = Math.max(e, c[3] * Math.exp(-1.15 * d2)); } return e; };
    const marks = [[250, 100], [-1762, 620], [-1638, 620], [1050, 350], [-640, -520]];
    const ga = 0.38, gc = Math.cos(ga), gs = Math.sin(ga), P = 108;
    const mk = (u, w, h, o) => Object.assign({ u, w, h, rot: ga, hu: 26, hw: 26, round: false, tiers: [[-260, h, 1]], style: 0, seed: (rnd() * 1e9) | 0, tint: rnd(), mechP: 96 + rnd() * 70, crownH: 0, crownTone: 0.5, crownLit: 0, spire: 0, spireR: 2.2 }, o);
    for (let j = -30; j <= 30; j++) for (let i = -34; i <= 34; i++) {
      const r0 = rnd(), r1 = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd(), r5 = rnd(), r6 = rnd(), r7 = rnd();
      if (((i % 7) + 7) % 7 === 3 || ((j % 9) + 9) % 9 === 5) continue;      // avenues: long slots of light through the skyline
      const gu = (i + (r0 - 0.5) * 0.24) * P, gw = (j + (r7 - 0.5) * 0.24) * P, u = gu * gc - gw * gs, w = gu * gs + gw * gc;
      const e = env(u, w);
      if (e < 40 || r1 > 0.36 + 0.44 * Math.min(1, e / 600)) continue;
      const h = e * (0.42 + 0.80 * r2 * r2 + 0.12 * r3);
      if (h < 70) continue;
      let near = false; for (const m of marks) if (Math.hypot(u - m[0], w - m[1]) < 105) near = true;
      if (near) continue;
      const hu = 19 + 15 * r5, t = mk(u, w, h, { hu, hw: hu * (0.72 + 0.56 * r6) });
      if (r6 > 0.66) t.rot = r5 > 0.3 ? 0.035 + (r2 - 0.5) * 0.05 : ga + 0.62;                 // some blocks ignore the grid; many of those stand square to the mountain, and their flanks catch the sun
      const tall = smooth(380, 800, h);
      if (r4 < 0.24) { t.style = 0; t.tiers = [[-260, h * 0.56, 1], [h * 0.56, h * 0.83, 0.76], [h * 0.83, h, 0.52]]; if (r3 > 0.45) { t.spire = h * 0.10; } }
      else if (r4 < 0.40) { t.style = r3 > 0.5 ? 0 : 2; }
      else if (r4 < 0.55) { t.style = 1; t.tiers = [[-260, h * 0.48, 1], [h * 0.48, h * 0.72, 0.80], [h * 0.72, h * 0.90, 0.60], [h * 0.90, h, 0.38]]; t.spire = h * (0.08 + 0.10 * r3); t.crownH = h * 0.10; t.crownTone = 0.72; t.crownLit = 0.9; }
      else if (r4 < 0.66) { t.style = r3 > 0.6 ? 2 : 0; t.round = true; t.hw = t.hu; }
      else if (r4 < 0.66 + 0.12 + 0.14 * tall) { t.style = r3 > 0.55 ? 3 : 0; const n = 10; t.tiers = []; for (let k = 0; k < n; k++) t.tiers.push([k ? h * k / n : -260, h * (k + 1) / n, 1 - 0.58 * Math.pow(k / n, 1.35)]); if (r3 < 0.5) t.spire = h * 0.07; }
      else { t.style = 4; t.hw = t.hu * 2.1; t.hu *= 0.78; t.crownH = 14; t.crownTone = 0.3; }
      if (t.style === 0 && !t.crownH && r3 > 0.3) { t.crownH = 10 + 26 * r5; t.crownTone = 0.42 + 0.3 * r2; t.crownLit = r1 > 0.3 ? 0.7 : 0; }
      T.push(t);
    }
    // ---- the towers people would know the skyline by
    { // the needle: a round shaft drawn out to a point, far taller than anything else
      const h = 1290, n = 18, t = mk(250, 100, h, { hu: 47, hw: 47, round: true, style: 2, spire: 190, spireR: 3.2, mechP: 172, crownH: 30, crownTone: 0.8, crownLit: 1 }); t.tiers = [];
      for (let k = 0; k < n; k++) t.tiers.push([k ? h * k / n : -260, h * (k + 1) / n, 1 - 0.80 * Math.pow(k / n, 1.5)]);
      T.push(t); }
    for (const s of [-1, 1]) { // twins, corner-on, joined high up by a bridge
      const h = 800; T.push(mk(-1700 + s * 62, 620, h, { hu: 29, hw: 29, rot: ga + 0.785, style: 0, spire: 64, crownH: 22, crownTone: 0.7, crownLit: 0.8, tiers: [[-260, h * 0.62, 1], [h * 0.62, h * 0.86, 0.80], [h * 0.86, h, 0.55]] })); }
    T.push(mk(-1700, 620, 452, { hu: 40, hw: 7, rot: 0, style: 2, tiers: [[432, 452, 1]], crownH: 0 }));
    { // the stepped stone tower with a lantern on top
      const h = 940; T.push(mk(1050, 350, h, { hu: 44, hw: 44, style: 1, spire: 130, spireR: 2.6, crownH: 70, crownTone: 0.78, crownLit: 1, tiers: [[-260, h * 0.40, 1], [h * 0.40, h * 0.62, 0.82], [h * 0.62, h * 0.80, 0.64], [h * 0.80, h * 0.92, 0.46], [h * 0.92, h, 0.28]] })); }
    { // the blade: a thin slab, tapered
      const h = 880, n = 8, t = mk(-640, -520, h, { hu: 17, hw: 52, rot: ga + 0.25, style: 3, crownH: 0 }); t.tiers = [];
      for (let k = 0; k < n; k++) t.tiers.push([k ? h * k / n : -260, h * (k + 1) / n, 1 - 0.42 * (k / n)]);
      T.push(t); }
    // from the mountain the skyline has to stand well clear of the billows it rises from: every tower is drawn up by the same factor
    for (const t of T) { const k = V.cityRise; t.h *= k; t.spire *= k; t.crownH *= k; for (const tr of t.tiers) { if (tr[0] > 0) tr[0] *= k; tr[1] *= k; } }
    return T;
  }

  const fo = { tone: 0, glass: 0, light: 0 };
  // what the wall is made of at a point: p metres round the building, y metres up
  function facade(t, p, y) {
    const st = t.style; let tone, glass;
    if (st === 0) { const fin = (p % 9) < 1.0; tone = fin ? 0.52 : 0.15 + 0.10 * t.tint; glass = fin ? 0.25 : 1; }                         // glass curtain wall, slender fins
    else if (st === 1) { const pier = (p % 7.2) < 3.1; tone = pier ? 0.60 + 0.12 * t.tint : 0.19; glass = pier ? 0 : 0.6; }                // stone piers, windows set back between them
    else if (st === 2) { const band = (y % 12) < 4.2; tone = band ? 0.56 : 0.13; glass = band ? 0.05 : 1; }                               // ribbons of glass between pale bands, three floors to a band
    else if (st === 3) { const a = ((p + y * 0.55) % 42 + 42) % 42, b = ((p - y * 0.55) % 42 + 4200) % 42, dg = Math.min(Math.abs(a - 21), Math.abs(b - 21)) > 19.0; tone = dg ? 0.62 : 0.12; glass = dg ? 0.1 : 1; }   // the structure worn on the outside
    else if (st === 5) { tone = 0.42; glass = 0; }                                                                                         // masts
    else { const win = (p % 5.4) > 1.6 && ((y % 4) + 4) % 4 > 1.3; tone = win ? 0.15 : 0.72; glass = win ? 0.8 : 0.05; }                   // white metal panels, punched windows
    const mech = ((y % t.mechP) + t.mechP) % t.mechP < 7, crown = t.crownH > 0 && y > t.h - t.crownH;
    if (mech) { tone = 0.22; glass = 0.05; }
    let light = 0;
    if (crown) { tone = t.crownTone; glass = 0.1; light = t.crownLit; }
    else if (glass > 0.4) {
      const fl = Math.floor(y / 4), hsh = hash3U(Math.floor(p / 3.6), fl, t.seed), floorOn = (hashU(fl * 31 + t.seed) & 0xff) > 184;
      if ((hsh & 0xffff) < 65536 * (floorOn ? 0.66 : 0.27)) light = 0.3 + 0.7 * ((hsh >>> 16) & 0xff) / 255;
    }
    fo.tone = tone; fo.glass = glass; fo.light = light;
  }

  // column renderer: every wall is a strip of vertical lines, one per column of the panorama
  function renderCity(towers, CW, CH) {
    const SS = 2, BW = CW * SS, BH = CH * SS, n = BW * BH, F = cityFrame();
    const zb = new Float32Array(n).fill(1e9), NX = new Uint8Array(n), NZ = new Uint8Array(n), TO = new Uint8Array(n), GL = new Uint8Array(n), LI = new Uint8Array(n), HG = new Uint8Array(n);
    const az0 = V.cityAz - V.cityHalf, daz = 2 * V.cityHalf / BW, del = (V.cEL1 - V.cEL0) / BH, deck = V.deck;
    const tanRow = new Float32Array(BH); for (let k = 0; k < BH; k++) tanRow[k] = Math.tan(V.cEL1 - (k + 0.5) * del);
    const poly = new Float64Array(34);
    function prism(t, cu, cw, hu, hw, rot, round, y0, y1) {
      const nv = round ? 16 : 4, cr = Math.cos(rot), sr = Math.sin(rot);
      for (let i = 0; i < nv; i++) {
        let a, b; if (round) { const q = i / nv * TAU; a = hu * Math.cos(q); b = hu * Math.sin(q); } else { a = (i === 0 || i === 3) ? -hu : hu; b = i < 2 ? -hw : hw; }
        const lu = cu + a * cr - b * sr, lw = cw + a * sr + b * cr;
        poly[i * 2] = F.C[0] + lu * F.U[0] + lw * F.W[0]; poly[i * 2 + 1] = F.C[1] + lu * F.U[1] + lw * F.W[1];
      }
      const ccx = F.C[0] + cu * F.U[0] + cw * F.W[0], ccz = F.C[1] + cu * F.U[1] + cw * F.W[1];
      let per = 0;
      for (let i = 0; i < nv; i++) {
        const j = (i + 1) % nv, ax = poly[i * 2], azz = poly[i * 2 + 1], bx = poly[j * 2], bz = poly[j * 2 + 1], ex = bx - ax, ez = bz - azz, len = Math.hypot(ex, ez);
        let nx = ez / len, nz = -ex / len; const mx = (ax + bx) / 2, mz = (azz + bz) / 2;
        if (nx * (mx - ccx) + nz * (mz - ccz) < 0) { nx = -nx; nz = -nz; }
        const p0 = per; per += len;
        if (nx * mx + nz * mz >= 0) continue;                                // faces away from the mountain
        const xa = (Math.atan2(ax, -azz) - az0) / daz, xb = (Math.atan2(bx, -bz) - az0) / daz;
        const c0 = Math.max(0, Math.ceil(Math.min(xa, xb) - 0.5)), c1 = Math.min(BW - 1, Math.floor(Math.max(xa, xb) - 0.5));
        for (let c = c0; c <= c1; c++) {
          const a = az0 + (c + 0.5) * daz, dx = Math.sin(a), dz = -Math.cos(a), det = -ex * dz + dx * ez; if (Math.abs(det) < 1e-9) continue;
          const s = (ax * dz - dx * azz) / det, r = (-ex * azz + ez * ax) / det; if (s < -0.002 || s > 1.002 || r <= 0) continue;
          const kT = Math.max(0, Math.ceil((V.cEL1 - Math.atan((y1 - deck) / r)) / del - 0.5)), kB = Math.min(BH - 1, Math.ceil((V.cEL1 - Math.atan((y0 - deck) / r)) / del - 0.5) - 1);
          let px = nx, pz = nz;
          if (round) { px = dx * r - ccx; pz = dz * r - ccz; const l = Math.hypot(px, pz) || 1; px /= l; pz /= l; }
          const bnx = 127.5 + 127.5 * px, bnz = 127.5 + 127.5 * pz, pp = p0 + s * len;
          for (let k = kT; k <= kB; k++) {
            const q = k * BW + c; if (r >= zb[q]) continue;
            const y = deck + r * tanRow[k]; facade(t, pp, y);
            zb[q] = r; NX[q] = bnx; NZ[q] = bnz; TO[q] = 255 * fo.tone; GL[q] = 255 * fo.glass; LI[q] = 255 * fo.light; HG[q] = Math.max(0, Math.min(255, 255 * (y + 300) / (V.cityTop + 300)));
          }
        }
      }
    }
    for (const t of towers) {
      for (const tr of t.tiers) prism(t, t.u, t.w, t.hu * tr[2], t.hw * tr[2], t.rot, t.round, tr[0], tr[1]);
      if (t.spire) { const sv = t.style, cH = t.crownH; t.style = 5; t.crownH = 0; prism(t, t.u, t.w, t.spireR, t.spireR, 0, true, t.h, t.h + t.spire); t.style = sv; t.crownH = cH; }
    }
    // resolve the supersampled surface to the final panorama; then spread it a little way into the empty texels round it
    const A = new Uint8ClampedArray(CW * CH * 4), B = new Uint8ClampedArray(CW * CH * 4); let cov = 0;
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      let m = 0, sx = 0, sz = 0, st = 0, sg = 0, sl = 0, sh = 0, sd = 0;
      for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) { const q = (y * SS + j) * BW + x * SS + i; if (zb[q] < 1e8) { m++; sx += NX[q]; sz += NZ[q]; st += TO[q]; sg += GL[q]; sl += LI[q]; sh += HG[q]; sd += zb[q]; } }
      if (!m) continue; cov++;
      const o = (y * CW + x) * 4;
      A[o] = sx / m; A[o + 1] = sz / m; A[o + 2] = st / m; A[o + 3] = 255 * m / (SS * SS);
      B[o] = sl / m; B[o + 1] = sg / m; B[o + 2] = 255 * (sd / m - V.cityNear) / V.citySpan; B[o + 3] = sh / m;
    }
    const done = new Uint8Array(CW * CH); for (let i = 0; i < CW * CH; i++) done[i] = A[i * 4 + 3] > 0 ? 1 : 0;
    for (let it = 0; it < 4; it++) {
      const add = [];
      for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
        const i = y * CW + x; if (done[i]) continue;
        const nb = (x > 0 && done[i - 1]) ? i - 1 : (x < CW - 1 && done[i + 1]) ? i + 1 : (y < CH - 1 && done[i + CW]) ? i + CW : (y > 0 && done[i - CW]) ? i - CW : -1;
        if (nb >= 0) add.push(i, nb);
      }
      for (let k = 0; k < add.length; k += 2) { const i = add[k] * 4, s = add[k + 1] * 4; A[i] = A[s]; A[i + 1] = A[s + 1]; A[i + 2] = A[s + 2]; B[i] = B[s]; B[i + 1] = B[s + 1]; B[i + 2] = B[s + 2]; B[i + 3] = B[s + 3]; }
      for (let k = 0; k < add.length; k += 2) done[add[k]] = 1;
    }
    V.stats.cityPx = cov;
    return { A: new Uint8Array(A.buffer), B: new Uint8Array(B.buffer) };
  }

  // the towers' shadows on the deck, seen from above: with the sun this low a tower's shadow runs several times its height toward the mountain.
  // Done a few towers at a time (job.i says how far it has got), so that a setting sun can redraw them without a hitch
  function cityShadowJob(tanE, sunAz) {
    const F = cityFrame(), gx = -Math.sin(sunAz), gz = Math.cos(sunAz);
    // the way the shadows run on the ground, in city-local axes
    return { S: new Uint8Array(V.shRes * V.shRes), i: 0, su: gx * F.U[0] + gz * F.U[1], sw: gx * F.W[0] + gz * F.W[1], k: 1 / Math.max(tanE, 0.04) };
  }
  function cityShadowStep(job, towers, budgetMs) {
    const N = V.shRes, S = job.S, su = job.su, sw = job.sw, k = job.k, du = (V.shU1 - V.shU0) / N, dw = (V.shW1 - V.shW0) / N, t0 = performance.now();
    for (; job.i < towers.length; job.i++) {
      if ((job.i & 7) === 7 && performance.now() - t0 > budgetMs) return false;
      const t = towers[job.i], cr = Math.cos(t.rot), sr = Math.sin(t.rot);
      for (const tr of t.tiers) {
        const y0 = Math.max(0, tr[0]), y1 = tr[1]; if (y1 <= y0) continue;
        const hu = t.hu * tr[2], hw = (t.round ? t.hu : t.hw) * tr[2];
        // half-width of the tier across the shadow, and its half-depth along it
        const ax = Math.abs(hu * (cr * -sw + sr * su)) + Math.abs(hw * (-sr * -sw + cr * su)), al = Math.abs(hu * (cr * su + sr * sw)) + Math.abs(hw * (-sr * su + cr * sw));
        const a0 = y0 * k - al, a1 = y1 * k + al;
        const pen1 = 10 + 0.0093 * a1, ext = ax + pen1;
        // bounding box of the strip
        const u0 = t.u + su * a0, w0 = t.w + sw * a0, u1 = t.u + su * a1, w1 = t.w + sw * a1;
        const i0 = Math.max(1, Math.floor((Math.min(u0, u1) - ext - V.shU0) / du)), i1 = Math.min(N - 2, Math.ceil((Math.max(u0, u1) + ext - V.shU0) / du));
        const j0 = Math.max(1, Math.floor((Math.min(w0, w1) - ext - V.shW0) / dw)), j1 = Math.min(N - 2, Math.ceil((Math.max(w0, w1) + ext - V.shW0) / dw));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const ru = V.shU0 + (i + 0.5) * du - t.u, rw = V.shW0 + (j + 0.5) * dw - t.w, along = ru * su + rw * sw, across = Math.abs(-ru * sw + rw * su);
          if (along < a0 || along > a1) continue;
          const pen = 10 + 0.0093 * Math.max(along, 0), v = (ax - across) / pen + 0.5; if (v <= 0) continue;
          const e = Math.min(1, (along - a0) / 30) * Math.min(1, (a1 - along) / (30 + pen)), val = 255 * Math.min(1, v) * e, q = j * N + i;
          if (val > S[q]) S[q] = val;
        }
      }
    }
    return true;
  }

  V.init = function (g, opt = {}) {
    gfx = g; const t0 = performance.now();
    if (opt.farW) V.farW = opt.farW;
    if (opt.cityW) { V.cityW = opt.cityW; V.cityH = Math.round(opt.cityW * 0.484); }
    const far = buildFar(V.farW, V.farH), t1 = performance.now();
    V.towers = buildCityList();
    const city = renderCity(V.towers, V.cityW, V.cityH), t2 = performance.now();
    const mkT = (w, h, data) => { const t = gfx.texture({ w, h, format: 'rgba8', filter: 'linear', wrap: 'clamp', mips: true, data }); gfx.genMips(t); return t; };
    V.farA = mkT(V.farW, V.farH, far.A); V.farB = mkT(V.farW, V.farH, far.B);
    V.cityA = mkT(V.cityW, V.cityH, city.A); V.cityB = mkT(V.cityW, V.cityH, city.B);
    V.shTex = gfx.texture({ w: V.shRes, h: V.shRes, format: 'r8', filter: 'linear', wrap: 'clamp' });
    V.shadowElev = -9; V.updateShadow(true);
    if (opt.keep) V.dbg = { far, city };
    V.stats.ms = [Math.round(t1 - t0), Math.round(t2 - t1), Math.round(performance.now() - t2)];
    V.ready = true;
  };
  // the shadows lengthen as the sun sinks: redo them when it has moved (in the background, a millisecond or so a frame; `now`: all at once)
  let job = null;
  V.updateShadow = function (now) {
    if (!job) {
      // nothing to draw them with while the sun is behind the range or below the horizon
      if (Math.abs(V.shadowElev - Sky.elev) < 0.006 || (!now && Sky.elev < 0.015)) return;
      V.shadowElev = Sky.elev; job = cityShadowJob(Math.tan(Math.max(Sky.elev, 0.02)), Sky.az);
    }
    if (cityShadowStep(job, V.towers, now ? 1e9 : 1.2)) { gfx.updateTexture(V.shTex, 0, 0, V.shRes, V.shRes, job.S); job = null; }
  };
  V.farH_ = farH;
  return V;
})();

// ---- lighting the vista (runs in the sky shader)
function vistaSSL() {
  const V = Vista, f = x => (Number.isInteger(x) ? x.toFixed(1) : String(+x.toFixed(7)));
  const a = V.cityAz, D = V.cityDist, C = [D * Math.sin(a), -D * Math.cos(a)], Uu = [Math.cos(a), Math.sin(a)], Ww = [Math.sin(a), -Math.cos(a)];
  return `
// the cloud deck's billows: rounded tops with creases between them (0 in a crease, about 1 on a top)
fn deckA(p: vec2f, lod: f32) -> f32 { let q: f32 = texLod(tDetail, p / 17000.0, lod).z * 2.0 - 1.0; return sqrt(q * q + 0.003) * 1.9; }
fn vistaHaze(d: vec3f) -> vec3f { let h: vec3f = skyLut(normalize(vec3f(d.x, 0.022, d.z))); return mix(h, vec3f(luma(h)) * vec3f(1.03, 1.0, 1.0), 0.55 * U.sunDir.w); }
// mip level for a panorama whose texels subtend 'texel' radians
fn vistaLod(texel: f32) -> f32 { return max(log2(2.0 * U.camRight.w * U.res.w / texel), 0.0); }
fn farRanges(d: vec3f, colIn: vec3f) -> vec3f {
  let az: f32 = atan2(d.x, -d.z); let el: f32 = atan2(d.y, length(d.xz));
  let uv: vec2f = vec2f(az / ${f(2 * V.AZ)} + 0.5, (${f(V.EL1)} - el) / ${f(V.EL1 - V.EL0)});
  if (uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) { return colIn; }
  let lod: f32 = vistaLod(${f(2 * V.AZ / V.farW)});
  let A: vec4f = texLod(tFarA, uv, lod);
  if (A.a < 0.004) { return colIn; }
  let B: vec4f = texLod(tFarB, uv, lod);
  let N: vec3f = normalize(A.xyz * 2.0 - 1.0);
  let dist: f32 = 20000.0 * exp(B.x * 2.302585);
  let L: vec3f = U.sunDir.xyz; let tanE: f32 = L.y / max(length(L.xz), 1e-3);
  let sh: f32 = smoothstep(-0.03, 0.05, tanE - (B.y * 1.1 - 0.1));
  let ndl: f32 = dot(N, L);
  let amb: vec3f = U.ambSky.rgb * (1.2 + 0.8 * N.y) + U.ambGnd.rgb * (0.45 - 0.35 * N.y);
  // (the summits stand higher than the eye, and keep the sun after it has left the mountain: M.fr)
  let snow: vec3f = vec3f(0.92, 0.95, 0.98) * (M.fr.rgb * saturate((ndl + 0.18) / 1.18) * sh + amb);
  let rock: vec3f = vec3f(0.17, 0.155, 0.15) * (M.fr.rgb * saturate(ndl) * sh + amb);
  var c: vec3f = mix(snow, rock, B.z);
  // air: the further range is the paler one
  c = mix(vistaHaze(d), c, exp(-dist / 65000.0));
  // feet in the cloud deck
  let hc: f32 = dist * tan(el) + ${f(V.deck)};
  let a: f32 = A.a * smoothstep(-120.0, 260.0, hc) * smoothstep(0.0, 0.03, uv.x) * smoothstep(1.0, 0.97, uv.x);
  return mix(colIn, c, a);
}
fn cityLayer(d: vec3f, colIn: vec3f) -> vec3f {
  let az: f32 = atan2(d.x, -d.z) - ${f(V.cityAz)}; let el: f32 = atan2(d.y, length(d.xz));
  let uv: vec2f = vec2f(az / ${f(2 * V.cityHalf)} + 0.5, (${f(V.cEL1)} - el) / ${f(V.cEL1 - V.cEL0)});
  if (uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) { return colIn; }
  let lod: f32 = vistaLod(${f(2 * V.cityHalf / V.cityW)});
  let A: vec4f = texLod(tCityA, uv, lod);
  if (A.a < 0.004) { return colIn; }
  let B: vec4f = texLod(tCityB, uv, lod);
  let n2: vec2f = A.xy * 2.0 - 1.0;
  let N: vec3f = normalize(vec3f(n2.x, 1e-3, n2.y));
  let tone: f32 = A.z; let glass: f32 = B.y; let dist: f32 = ${f(V.cityNear)} + B.z * ${f(V.citySpan)}; let h: f32 = B.w * ${f(V.cityTop + 300)} - 300.0;
  let L: vec3f = U.sunDir.xyz;
  let ndl: f32 = saturate(dot(N, L));
  // the bright deck below throws a great deal of light back up the walls
  let amb: vec3f = U.ambSky.rgb * 0.85 + U.ambGnd.rgb * 0.5;
  let alb: vec3f = mix(vec3f(0.030, 0.040, 0.055), vec3f(0.60, 0.57, 0.52), tone);
  var c: vec3f = alb * (U.sunCol.rgb * ndl + amb);
  // glass: a mirror for the sky; where a wall lines up between the sun and the eye its panes flash
  let R: vec3f = reflect(d, N);
  let F: f32 = (0.045 + 0.955 * pow(1.0 - saturate(dot(-d, N)), 5.0)) * glass;
  var env: vec3f = skyLut(vec3f(R.x, abs(R.y) + 0.04, R.z));
  let rsh: f32 = saturate(dot(normalize(R.xz), normalize(L.xz)));
  env += U.sunCol.rgb * (pow(rsh, 160.0) * 9.0 * exp(-sq((L.y - R.y) / 0.36)));
  c = c * (1.0 - F) + env * F;
  // after dark: lit windows, and the glow of the streets and the cloud below coming up the walls
  c += mix(vec3f(1.0, 0.70, 0.40), vec3f(0.74, 0.88, 1.0), fract(B.x * 7.3)) * (B.x * U.skyP.z * 2.4);
  c += alb * vec3f(1.0, 0.60, 0.28) * (U.skyP.z * 0.5 * exp(-max(h, 0.0) / 260.0));
  // a great deal of air lies between here and there: the towers stand in it as blue shapes, the farther ones paler
  c = mix(vistaHaze(d) * vec3f(0.80, 0.93, 1.10), c, exp(-dist / 15000.0));
  // the deck swallows the lower floors: its billows stand at different heights, and wisps hang round the floors just above them
  let pp: vec2f = normalize(d.xz) * dist + vec2f(U.skyP.y * 9000.0, U.skyP.y * 2500.0);
  let wl: f32 = texLod(tDetail, pp / 900.0 + vec2f(0.11, 0.83) + h * 0.0011, 0.0).z;
  let top: f32 = min(deckA(pp, log2(max(dist * 2.0 * U.camRight.w * U.res.w / sqrt(max(-d.y, 0.02)) / 33.0, 1.0))), 1.0) * 260.0 + 40.0 * (wl - 0.42);
  let vis: f32 = smoothstep(-10.0, 110.0, h - top);
  let veil: f32 = (1.0 - smoothstep(0.0, 130.0, h - top)) * smoothstep(0.40, 0.70, wl) * 0.65;
  c = mix(c, colIn * 1.04, veil);
  let a: f32 = A.a * vis * smoothstep(0.0, 0.02, uv.x) * smoothstep(1.0, 0.98, uv.x);
  return mix(colIn, c, a);
}
// how strongly the city's lights fall on the deck at pp
fn cityGlow(pp: vec2f) -> f32 { let r: f32 = length(pp - vec2f(${f(C[0])}, ${f(C[1])})); return 0.85 * exp(-r / 1300.0) + 0.16 * exp(-r / 4200.0); }
// shade of the towers on the deck at a point pp (m from the eye, horizontal)
fn cityShadow(pp: vec2f) -> f32 {
  let rel: vec2f = pp - vec2f(${f(C[0])}, ${f(C[1])});
  let uv: vec2f = vec2f((dot(rel, vec2f(${f(Uu[0])}, ${f(Uu[1])})) - ${f(V.shU0)}) / ${f(V.shU1 - V.shU0)}, (dot(rel, vec2f(${f(Ww[0])}, ${f(Ww[1])})) - ${f(V.shW0)}) / ${f(V.shW1 - V.shW0)});
  return texLod(tCitySh, uv, 0.0).x;
}
`;
}
