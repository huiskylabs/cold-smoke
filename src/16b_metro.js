// ---------------------------------------------------------------- 不夜城: the world below as one endless city at night
// The other world under the mountain (Variants 'world' b). Where the cloud sea lay (05_sky.js cloudSea) there is now the ground itself, the same
// 950 m below the eye, and on it a city that runs on to the curve of the earth: a grid of street lamps, avenues and ring roads brighter than
// the streets, a river through it as a dark ribbon with lit banks and bridges, cars crawling along the big roads, parks and the odd dark
// patch. The towers of 16_vista.js stand on it as its downtown. Thin wisps of cloud drift low over it and take its light from below.
// Everything is worked out per pixel from where the line of sight meets the ground, and every pattern is box-filtered over what one pixel
// covers there (hundreds of metres along the line of sight near the horizon), so nothing crawls or sparkles: far off the grid simply turns
// into its average, a carpet of sodium light.
// Real references (Innsbruck from the Nordkette, Vancouver from the North Shore, cities seen from summits at night): streets read as chains
// of orange points, intersections a little brighter, the big roads as continuous bright lines, white-blue light only in the centre and on a
// few big roads, water and parks black, the far city a band of light under a lit, orange haze.
Variants.def('world', '山下的世界', [['a', '云海浮城'], ['b', '不夜城']], 'b');
const Metro = (() => {
  const M = { deck: 950, re: 7.4e6, wisp: 300, lamp: 1.0 };
  M.on = () => Variants.val.world === 'b';
  // a world change drops the clouds' panoramas: the deck is baked again from scratch when it comes back
  Variants.on((n, v, init) => { if (n === 'world' && !init && typeof Clouds !== 'undefined') Clouds.baked = false; });
  return M;
})();

function metroSSL() {
  const V = Vista, f = x => (Number.isInteger(x) ? x.toFixed(1) : String(+x.toFixed(7)));
  const a = V.cityAz, D = V.cityDist, C = [D * Math.sin(a), -D * Math.cos(a)], Uu = [Math.cos(a), Math.sin(a)], Ww = [Math.sin(a), -Math.cos(a)];
  const ga = 0.38, P = 108;
  return `
// box-filtered pulse train: lines of width f (as a share of the period) centred on the integers of x, seen through a window w periods wide
fn mLine(x: f32, f: f32, w: f32) -> f32 {
  let ww: f32 = max(w, 0.002);
  let a: f32 = x + 0.5 * (ww + f); let b: f32 = x - 0.5 * (ww - f);
  return saturate((floor(a) * f + min(fract(a), f) - floor(b) * f - min(fract(b), f)) / ww);
}
// a band |s| < hw seen through a window fw wide (all in metres)
fn mBand(s: f32, hw: f32, fw: f32) -> f32 { let w: f32 = max(fw, 0.5); return saturate((min(s + hw, 0.5 * w) - max(s - hw, -0.5 * w)) / w); }
// how wide (m) the window of a pixel is across a direction n on the ground: fr along the line of sight, fa across it
fn mFoot(n: vec2f, dh: vec2f, fr: f32, fa: f32) -> f32 { let c: f32 = dot(n, dh); return abs(c) * fr + sqrt(max(1.0 - c * c, 0.0)) * fa; }
// streets of one grid: g = grid coordinates (m), wg = the pixel's window along each axis, P = block, lw = lit width of a street,
// sp = lamp spacing. Lamps are points along the streets: a chain of dots up close, a line further off, a share of a pixel far away
fn mStreets(g: vec2f, wg: vec2f, P: f32, lw: f32, sp: f32) -> f32 {
  // (no two streets are lit alike: one number a street, and one a stretch of it between crossings; where a pixel holds many, their mean)
  let n: vec2f = floor(g / P + 1.0); let m: vec2f = floor(g / P + 0.5);
  let mx: f32 = smoothstep(0.3, 1.2, wg.y / P); let my: f32 = smoothstep(0.3, 1.2, wg.x / P);
  let bx: f32 = mix(sq(hashu(u32(i32(n.y) * 7919 + 13)) * 1.35) * (0.15 + 1.0 * step(0.22, hash21(vec2f(m.x, n.y) + vec2f(0.5, 91.0)))), 0.62, mx);
  let by: f32 = mix(sq(hashu(u32(i32(n.x) * 6007 + 71)) * 1.35) * (0.15 + 1.0 * step(0.22, hash21(vec2f(n.x, m.y) + vec2f(47.0, 0.5)))), 0.62, my);
  let sx: f32 = mLine(g.y / P + 0.5, lw / P, wg.y / P) * (0.05 + 0.95 * mLine(g.x / sp, 0.2, wg.x / sp)) * bx;
  let sy: f32 = mLine(g.x / P + 0.5, lw / P, wg.x / P) * (0.05 + 0.95 * mLine(g.y / sp + 0.5, 0.2, wg.y / sp)) * by;
  return sx + sy;
}
// the scatter of single lights inside the blocks (windows, yards, car parks): a lit point in some cells of a fine lattice
fn mPoints(g: vec2f, wg: vec2f, c: f32, share: f32) -> f32 {
  let k: vec2f = floor(g / c); let h: f32 = hash21(k + vec2f(311.0, 17.0));
  let on: f32 = mix(step(1.0 - share, h) * (0.4 + 1.2 * hash21(k + vec2f(5.0, 777.0))), share, smoothstep(0.4, 1.4, max(wg.x, wg.y) / c));
  return on * mLine(g.x / c - 0.5, 3.0 / c, wg.x / c) * mLine(g.y / c - 0.5, 3.0 / c, wg.y / c);
}
// the river: its centre line (city-local w as a function of u) and half its width
fn mRiverW(u: f32) -> f32 { return -5300.0 + 900.0 * sin(u / 5200.0 + 1.0) + 360.0 * sin(u / 1900.0 + 0.4) + 140.0 * sin(u / 700.0); }
// the lie of the city at a spot (city-local u, w): x = how built up (0 open country .. 1 dense), y = how much of the light is white,
// z = park (0 .. 1), w = which grid (0 the downtown one, 1 the outer one)
fn mLand(u: f32, w: f32, lod: f32) -> vec4f {
  let r: f32 = length(vec2f(u, w));
  let n1: f32 = texLod(tDetail, vec2f(u, w) / 41000.0 + vec2f(0.31, 0.57), lod).z;
  let n2: f32 = texLod(tDetail, vec2f(u, w) / 9500.0 + vec2f(0.77, 0.13), lod).z;
  let n3: f32 = texLod(tDetail, vec2f(u, w) / 2600.0 + vec2f(0.05, 0.91), lod).z;
  // dense in the middle, on and on outward in clumps of suburbs and satellite towns; never quite empty (it is an endless city)
  let dens: f32 = saturate(0.22 + 0.85 * exp(-r / 9000.0) + 1.1 * (n1 - 0.47) + 0.9 * (n2 - 0.5)) * smoothstep(0.26, 0.45, n3 + 0.12 * exp(-r / 4000.0));
  let white: f32 = saturate(0.75 * exp(-r / 3800.0) + 0.6 * (n2 - 0.55));
  let park: f32 = smoothstep(0.37, 0.30, n3) * smoothstep(1200.0, 2500.0, r) + smoothstep(0.36, 0.30, n2) * 0.8;
  let grid: f32 = step(0.5, n1) * step(6500.0, r);
  return vec4f(dens, white, saturate(park), grid);
}
// the wisps of cloud low over the city: their density at a spot p (m from the eye), lod for far off
fn mWisp(p: vec2f, lod: f32) -> f32 {
  let q: vec2f = p + vec2f(U.skyP.y * 9000.0, U.skyP.y * 2500.0);
  // drawn out along the wind (+x), in long torn bands
  let a: f32 = texLod(tDetail, vec2f(q.x / 21000.0, q.y / 6500.0) + vec2f(0.43, 0.29), lod).z;
  let b: f32 = texLod(tDetail, vec2f(q.x / 5200.0, q.y / 1900.0) + vec2f(0.11, 0.67), lod + 0.5).z;
  return smoothstep(0.49, 0.62, a * 0.72 + b * 0.38);
}
// the city's light as the air and the cloud over it receive it, averaged over the blocks round p (m from the eye): scene units at night
fn mGlowAt(p: vec2f) -> vec3f {
  let rel: vec2f = p - vec2f(${f(C[0])}, ${f(C[1])});
  let u: f32 = dot(rel, vec2f(${f(Uu[0])}, ${f(Uu[1])})); let w: f32 = dot(rel, vec2f(${f(Ww[0])}, ${f(Ww[1])}));
  let L: vec4f = mLand(u, w, 4.0);
  return mix(vec3f(1.0, 0.50, 0.17), vec3f(1.0, 0.80, 0.58), L.y) * (L.x * (1.0 - 0.7 * L.z) * 0.22) + cityGlow3(p) * 0.6;
}

// the ground under the eye, and the city on it, as seen along d (d.y < 0). haze: the colour of the air toward the horizon there
fn metroPlain(d: vec3f, mu: f32, haze: vec3f) -> vec3f {
  let hl: f32 = max(length(d.xz), 1e-4); let dh: vec2f = d.xz / hl; let s: f32 = -d.y / hl;
  let night: f32 = U.skyP.z;
  // the air over the whole city glows with it: orange, strongest low down, where the eye looks through the most of it
  let hz: vec3f = haze + vec3f(1.0, 0.50, 0.20) * (0.035 * night);
  // where the line of sight meets the ground, on an earth that curves away (r: horizontal distance, m); past the rim only the lit air
  let k: f32 = ${f(2 * M_DECK())} / ${f(Metro.re)};
  let disc: f32 = s * s - k;
  if (disc <= 0.0) { return hz; }
  let r: f32 = ${f(2 * M_DECK())} / (s + sqrt(disc));
  let dist: f32 = sqrt(r * r + ${f(M_DECK() * M_DECK())});
  let p: vec2f = dh * r;
  // what one pixel covers there: along the line of sight and across it (m)
  let pa: f32 = 2.0 * U.camRight.w * U.res.w;
  let slope: f32 = max(s - r / ${f(Metro.re)}, 2e-4);
  let fr: f32 = dist * pa / slope; let fa: f32 = dist * pa;
  // city-local axes (u to the right as seen from the mountain, w away), and the grid
  let rel: vec2f = p - vec2f(${f(C[0])}, ${f(C[1])});
  let uA: vec2f = vec2f(${f(Uu[0])}, ${f(Uu[1])}); let wA: vec2f = vec2f(${f(Ww[0])}, ${f(Ww[1])});
  let u: f32 = dot(rel, uA); let w: f32 = dot(rel, wA);
  let lodM: f32 = log2(max(fr / ${f(41000 / 512)}, 1.0));
  let L: vec4f = mLand(u, w, lodM);
  // ---- the grids: downtown's (that of the towers, 16_vista.js) and, out in the suburbs, one turned across it with smaller blocks
  let ga: f32 = ${f(ga)} + 0.55 * L.w; let gc: f32 = cos(ga); let gs: f32 = sin(ga);
  let gx: vec2f = uA * gc + wA * gs; let gy: vec2f = wA * gc - uA * gs;
  let g: vec2f = vec2f(dot(rel, gx), dot(rel, gy));
  let wg: vec2f = vec2f(mFoot(gx, dh, fr, fa), mFoot(gy, dh, fr, fa));
  let P: f32 = mix(${f(P)}, 86.0, L.w);
  var street: f32 = mStreets(g, wg, P, 6.0, 33.0);
  // the blocks themselves: a faint scatter of lit windows and yards, more in some blocks than in others (one number a block; when a
  // pixel holds many blocks, their mean)
  let cell: vec2f = floor(g / P + 0.5);
  let many: f32 = smoothstep(0.4, 1.5, max(wg.x, wg.y) / P);
  let blk: f32 = mix(hash21(cell + vec2f(17.0 * L.w, 3.0)), 0.5, many);
  var fill: f32 = mPoints(g, wg, 19.0, 0.12 + 0.40 * blk * L.x) * 3.0 + 0.006 * blk;
  // ---- the avenues: every 7th and 9th street of the grid, brighter and continuous (two rows of lamps and the traffic between)
  // (one avenue in three is a great lit boulevard, the rest hardly brighter than a street)
  let ax7: f32 = floor(g.x / (7.0 * P) - 3.0 / 7.0 + 0.5); let ay9: f32 = floor(g.y / (9.0 * P) - 5.0 / 9.0 + 0.5);
  let kax: f32 = mix(0.25 + 1.1 * step(0.62, hashu(u32(i32(ax7) * 131 + 7))), 0.62, smoothstep(0.3, 1.0, wg.x / (7.0 * P)));
  let kay: f32 = mix(0.25 + 1.1 * step(0.62, hashu(u32(i32(ay9) * 173 + 3))), 0.62, smoothstep(0.3, 1.0, wg.y / (9.0 * P)));
  let avx: f32 = mLine(g.x / (7.0 * P) - 3.0 / 7.0, 16.0 / (7.0 * P), wg.x / (7.0 * P)) * kax * (0.3 + 0.7 * mLine(g.y / 36.0, 0.3, wg.y / 36.0));
  let avy: f32 = mLine(g.y / (9.0 * P) - 5.0 / 9.0, 16.0 / (9.0 * P), wg.y / (9.0 * P)) * kay * (0.3 + 0.7 * mLine(g.x / 36.0, 0.3, wg.x / 36.0));
  // the cars on them: white coming, red going, crawling in long strings
  let t: f32 = U.camPos.w;
  let carx: f32 = 0.7 + 1.0 * mLine(g.y / 23.0 - t * 0.52, 0.18, wg.y / 23.0);
  let cary: f32 = 0.7 + 1.0 * mLine(g.x / 29.0 + t * 0.41, 0.18, wg.x / 29.0);
  var road: f32 = avx * carx + avy * cary;
  // ---- the motorways: a ring round the centre and long straight ones out to the edge of the world, the brightest lines of all
  let rr: f32 = length(vec2f(u, w)); let rn: vec2f = rel / max(rr, 1.0);
  let ang: f32 = atan2(w, u); let tg: vec2f = vec2f(-rn.y, rn.x);
  var mw: f32 = (mBand(rr - 6200.0, 14.0, mFoot(rn, dh, fr, fa)) + mBand(rr - 15500.0, 12.0, mFoot(rn, dh, fr, fa)) * 0.8)
    * (0.55 + 0.45 * sin(ang * 7.0 + 1.3) * sin(ang * 3.0)) * (0.35 + 0.65 * mLine(ang * rr / 40.0, 0.3, mFoot(tg, dh, fr, fa) / 40.0));
  for (var i: i32 = 0; i < 5; i++) {
    let an: f32 = 0.35 + f32(i) * 1.31 + 0.2 * sin(f32(i) * 3.7);
    let dv: vec2f = uA * cos(an) + wA * sin(an); let nv: vec2f = vec2f(-dv.y, dv.x);
    let along: f32 = dot(rel, dv); let off: f32 = dot(rel, nv) - 260.0 * sin(along / 4100.0 + f32(i));
    mw += mBand(off, 12.0, mFoot(nv, dh, fr, fa)) * smoothstep(1500.0, 3000.0, along) * (0.6 + 1.4 * mLine(along / 37.0 - t * 0.7 * (f32(i & 1) * 2.0 - 1.0), 0.25, mFoot(dv, dh, fr, fa) / 37.0));
  }
  // ---- the river: black water with the light of its banks on it, lamps along both banks, and the bridges carrying the avenues over
  let rw: f32 = mRiverW(u); let rs: f32 = (w - rw) / sqrt(1.0 + sq(900.0 / 5200.0 * cos(u / 5200.0 + 1.0) + 360.0 / 1900.0 * cos(u / 1900.0 + 0.4)));
  let rf: f32 = mFoot(wA, dh, fr, fa);
  let water: f32 = mBand(rs, 430.0, rf);
  let bank: f32 = mBand(abs(rs) - 442.0, 6.0, rf) * (0.4 + 0.6 * mLine((u / 26.0), 0.35, mFoot(uA, dh, fr, fa) / 26.0));
  // the land: parks are dark, open country darker still
  let land: f32 = L.x * (1.0 - 0.88 * L.z);
  street *= land; fill *= mix(0.3, 1.0, land); road *= mix(0.35, 1.0, L.x) * (1.0 - 0.7 * L.z);
  let dry: f32 = 1.0 - water;
  // ---- the light of it all (scene units at night): sodium, whiter downtown and on the motorways
  let sod: vec3f = vec3f(1.0, 0.47, 0.13); let led: vec3f = vec3f(0.95, 0.88, 0.78);
  let cs: vec3f = mix(sod, led, L.y * 0.8);
  // (the points inside the blocks: a mix of warm windows and the odd cold white one)
  var em: vec3f = cs * (street * 4.2) * dry + mix(vec3f(1.0, 0.62, 0.32), vec3f(0.85, 0.92, 1.0), 0.25 + 0.4 * L.y) * (fill * 3.0 * dry) + mix(sod * 1.1, led, 0.25 + 0.5 * L.y) * (road * 3.6 * dry + bank * 3.0);
  em += mix(vec3f(1.0, 0.56, 0.22), vec3f(0.92, 0.95, 1.0), 0.2 + 0.3 * L.y) * (mw * 1.5 * mix(0.45, 1.0, L.x));
  // (the towers' own quarters light their feet: the glow of the downtown streets)
  em += cityGlow3(p) * (0.12 * dry);
  em *= ${f(Metro.lamp)} * night;
  // ---- by day (and under all of it): roofs and streets in the sun, the river a dark mirror
  let sunN: f32 = saturate(U.sunDir.y) * (1.0 - 0.6 * cityShadow(p));
  let lit: vec3f = (U.sunCol.rgb * sunN + U.ambSky.rgb * 0.9 + U.twi.rgb * 0.3) * (1.0 - 0.6 * night);
  let alb: vec3f = mix(mix(vec3f(0.21, 0.205, 0.20), vec3f(0.13, 0.135, 0.14), saturate(street * 2.0 + road)), vec3f(0.07, 0.085, 0.06), L.z) * (0.8 + 0.4 * blk);
  let refl: vec3f = vistaHaze(vec3f(d.x, -d.y, d.z)) * (0.02 + 0.5 * pow(1.0 - s, 8.0)) + mGlowAt(p) * (0.25 * night);
  var c: vec3f = mix(alb * lit, refl, water) + em;
  // the air between: the farther, the more of the lit haze
  c = mix(hz + mGlowAt(p) * (0.10 * night), c, exp(-dist / ${f(SEA.air)}));
  // ---- thin wisps of cloud low over the city (their floor ${f(Metro.wisp)} m up), lit from below by it and from above by the moon
  let hw: f32 = ${f(M_DECK() - Metro.wisp)};
  let dw: f32 = s * s - 2.0 * hw / ${f(Metro.re)};
  if (dw > 0.0) {
    let rc: f32 = 2.0 * hw / (s + sqrt(dw)); let pc: vec2f = dh * rc; let dc: f32 = sqrt(rc * rc + hw * hw);
    let fc: f32 = dc * pa / max(s, 2e-4);
    let den: f32 = mWisp(pc, log2(max(fc / ${f(5200 / 512)}, 1.0)));
    // a thin sheet: looked down on it hides little, toward the horizon it is a long way through and thickens into a band of lit mist
    let al: f32 = (1.0 - exp(-den * 0.07 / max(s, 0.012))) * 0.9;
    let under: vec3f = mGlowAt(pc) * ((4.0 + 3.0 * den) * night);
    let wc: vec3f = (U.sunCol.rgb + U.twi.rgb * 0.8) * (0.35 + 0.5 * pow(saturate(mu * 0.5 + 0.5), 4.0)) + U.ambSky.rgb * 1.1 + under;
    c = mix(c, mix(hz, wc, exp(-dc / ${f(SEA.air)})), al);
  }
  return c;
}
// the city's glow in the air just over the horizon, all round (added to the sky; d.y > -0.02)
fn metroDome(d: vec3f) -> vec3f {
  let e: f32 = max(d.y, 0.0);
  return vec3f(1.0, 0.50, 0.20) * ((0.05 * exp(-e / 0.02) + 0.012 * exp(-e / 0.08)) * U.skyP.z * smoothstep(-0.03, 0.0, d.y));
}
`;
}
function M_DECK() { return Metro.deck; }
