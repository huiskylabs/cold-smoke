// ---------------------------------------------------------------- 云下之城 and 金色雪旗: two more worlds below the mountain (Variants 'world' c, d)
// Both are one landscape made of things a formula draws well: a great horn of a peak standing opposite, a band of cloud about its
// waist, lesser ranges to either side, and a lake at its foot that mirrors whatever stands and shines over it.
//   c 云下之城: blue hour. A sea of cloud lies over the lowland; a city under it glows up through the cloud, and shows its streets in the gaps.
//   d 金色雪旗: the peak flies a long banner of blown snow from its summit; a great lake below it mirrors the peak, the moon and the aurora.
// Like 不夜城 (16b_metro.js) the whole view is worked out once by a ray caster into the two panoramas the cloud sea used (Metro runs the
// bake), and the sky shader lights it every frame, so the same bake serves every hour:
//   A = what it is made of (rgb), a = 1 where anything stands before the sky
//   E = x: how it faces a low sun (or, under 0: water; -1 mirroring the sky, -2 mirroring land), y: how it faces a high sun (on water:
//       how the mirrored land faces the light), z: lamps, w: how much air lies before it
// (K: the land is this many times bigger and farther than its numbers below say; streets and windows keep their true size)
const Peak = { K: 2.2, H: 3000, AZ: 1.3, t0: -0.30, ta: 0.60, tb: 0.95, ak: 0.42, lift: 0.08, PC: [1800, 24000], HP: 6500, LC: [-600, 12800], LR: [11500, 5200], far: 75000, haze: 46000 };
function peakBakeFS(kind) {
  const f = metroF, P = Peak, isC = kind === 'c';
  // (the light keeps one bearing all day; the land is drawn as if it came more from the left than it does, so that the faces turned to
  // the eye are not all in shadow)
  const la = Sky.az - Vista.cityAz - 0.75;
  const Ld = el => [Math.sin(la) * Math.cos(el), Math.sin(el), Math.cos(la) * Math.cos(el)].map(f).join(', ');
  return `
const PK: f32 = ${f(P.K)}; const PH0: f32 = ${f(P.H)}; const PH: f32 = ${f(P.H * P.K)}; const PHP: f32 = ${f(P.HP)};
fn pBand(s: f32, hw: f32, fw: f32) -> f32 { let w: f32 = max(fw, 0.5); return saturate((min(s + hw, 0.5 * w) - max(s - hw, -0.5 * w)) / w); }
fn pN(p: vec2f) -> f32 { return 0.65 * vnoise2(p) + 0.35 * vnoise2(p * 2.3 + vec2f(5.3, 1.7)); }
// ridged noise, n octaves (the march takes three, the shading five)
fn pRidge(p: vec2f, n: i32) -> f32 {
  var a: f32 = 0.5; var s: f32 = 0.0; var q: vec2f = p; var w: f32 = 1.0;
  for (var i: i32 = 0; i < 5; i++) {
    if (i >= n) { break; }
    var r: f32 = 1.0 - abs(2.0 * vnoise2(q) - 1.0); r = r * r * w; w = saturate(r * 1.6 + 0.25);
    s += a * r; a *= 0.5; q = vec2f(q.x * 1.6 + q.y * 1.2, -q.x * 1.2 + q.y * 1.6) + vec2f(13.7, 7.1);
  }
  return s;
}
// the land: its height over the lake (m; under 0: the lake's bed)
fn pTerr0(p: vec2f, n: i32) -> f32 {
  let r: f32 = length(p); let az: f32 = atan2(p.x, max(p.y, 1.0));
  let rg: f32 = pRidge(p / 5200.0 + vec2f(3.1, 8.2), n);
  // our own mountain, falling away from under the eye, a valley straight ahead
  // (it never stands in the eye's way: it is always well under the line of sight)
  let own: f32 = min(PH0 * pow(saturate(1.0 - r / 8200.0), 1.25) * (0.42 + 0.58 * smoothstep(0.0, 0.55, abs(az + 0.04))) * (0.80 + 0.50 * rg), PH0 - 60.0 - 0.24 * r);
  // the lowland and its water
${isC ? `  let ln: f32 = pN(p / 5600.0 + vec2f(2.7, 6.1));
  var flr: f32 = 30.0 + 1500.0 * (ln - 0.47) + 60.0 * (vnoise2(p / 900.0) - 0.5);
  flr = min(flr, 130.0 + 40.0 * vnoise2(p / 1300.0));
  let opn: f32 = 1.0;`
    : `  let lq: vec2f = (p - vec2f(${f(P.LC[0])}, ${f(P.LC[1])})) / vec2f(${f(P.LR[0])}, ${f(P.LR[1])});
  let ell: f32 = length(lq) + 0.30 * (pN(p / 3600.0 + vec2f(1.0, 5.0)) - 0.5);
  let flr: f32 = -260.0 + 700.0 * smoothstep(0.86, 1.7, ell) + 150.0 * smoothstep(0.86, 1.05, ell) * vnoise2(p / 1500.0 + vec2f(8.0, 3.0));
  let opn: f32 = smoothstep(1.0, 1.7, ell);`}
  // the lesser ranges: to either side, and far off
  let env: f32 = saturate(0.80 * smoothstep(11000.0, 30000.0, r) + 1.0 * smoothstep(0.50, 1.05, abs(az)) * smoothstep(4500.0, 13000.0, r));
  let rng: f32 = 3900.0 * rg * rg * env * opn;
  // the great peak: a horn, its faces hollow, its ridges running down to the lake
  let q: vec2f = p - vec2f(${f(P.PC[0])}, ${f(P.PC[1])}); let rp: f32 = length(q); let pa: f32 = atan2(q.x, q.y);
  let R: f32 = 10500.0 * (1.0 + 0.20 * cos(3.0 * pa + 0.6) + 0.09 * cos(7.0 * pa + 2.0));
  let fk: f32 = saturate(1.0 - rp / R);
  // (its faces are cut by ribs and gullies, deepest low down; the horn itself stays clean)
  let rib: f32 = pRidge(q / 3300.0 + vec2f(6.0, 2.0), n);
  let pk: f32 = PHP * (0.15 * fk + 0.85 * pow(fk, 2.3)) * (1.0 + (1.1 * (rib - 0.40) + 0.3 * (rg - 0.42)) * (1.0 - fk) * (0.35 + 0.65 * smoothstep(0.0, 0.25, fk)));
  return max(own, flr + max(rng, pk));
}
fn pTerr(p: vec2f, n: i32) -> f32 { return PK * pTerr0(p / PK, n); }
// the cloud: the height of its top over the lake where it lies (far below the lake where it does not)
fn pCloudTop0(p: vec2f) -> f32 {
  let r: f32 = length(p);
  let b: f32 = pN(p / 820.0 + vec2f(4.0, 1.0)); let b2: f32 = vnoise2(p / 290.0 + vec2f(2.0, 7.0));
  // the low cloud: heaps that swell from their edges to their middles, billows on them (never a flat top, never a wall)
  let c1: f32 = pN(p / ${f(isC ? 4300 : 5200)} + vec2f(7.3, 2.9));
  let d1: f32 = (c1 - ${f(isC ? 0.47 : 0.74)}) * smoothstep(${f(isC ? 5200 : 7000)}, ${f(isC ? 8200 : 10000)}, r);
  var t1: f32 = -400.0;
  if (d1 > 0.0) { let k: f32 = saturate(d1 * 9.0); t1 = ${f(isC ? 900 : 420)} * pow(d1 * 2.4, 0.62) + k * (${f(isC ? 520 : 200)} * (b - 0.35) + 170.0 * (b2 - 0.5)); }
  // the band about the peak's waist: a belt of separate heaps lying against its flanks, where they stand about 1500 m over the lake
  let q: vec2f = p - vec2f(${f(P.PC[0])}, ${f(P.PC[1])}); let rp: f32 = length(q);
  let c2: f32 = pN(p / 1500.0 + vec2f(1.9, 9.4)) + 0.45 * (pN(p / 5200.0 + vec2f(6.0, 3.0)) - 0.5);
  let d2: f32 = (c2 - 0.50) * exp(-sq((rp - 5300.0) / 1150.0));
  var t2: f32 = -400.0;
  if (d2 > 0.0) { let k: f32 = saturate(d2 * 14.0); t2 = 1900.0 * k + 1500.0 * pow(d2 * 2.4, 0.6) + k * (360.0 * (b - 0.35) + 150.0 * (b2 - 0.5)); }
  return max(t1, t2);
}
// (not used: a cloud drawn as a height stands like a wall when seen from the side. The clouds are laid in every frame instead, as
// soft sheets at their heights: peakDeck in peakSSL)
fn pCloudTop(p: vec2f) -> f32 { return -400.0; }
fn pField(p: vec2f, n: i32) -> f32 { return max(max(pTerr(p, n), pCloudTop(p)), 0.0); }
// along a line of sight that stands ya m over the lake at xa m out and climbs k m a metre: where it first meets land, cloud or water
// (under 0: nowhere)
fn pMarch(dl: vec2f, xa: f32, ya: f32, k: f32, xmax: f32) -> f32 {
  var xp: f32 = xa + 120.0; var dp: f32 = ya + (xp - xa) * k - pField(dl * xp, 3);
  if (dp < 0.0) { return xp; }
  var hit: f32 = -1.0;
  for (var i: i32 = 0; i < 300; i++) {
    let x: f32 = xp + max(30.0 + 0.010 * xp, 0.38 * dp);
    if (x > xmax) { break; }
    let y: f32 = ya + (x - xa) * k;
    if (y > 7400.0 * PK && k > 0.0) { break; }
    let dd: f32 = y - pField(dl * x, 3);
    if (dd < 0.0) {
      // (closed in on by halving, so that no step of the march shows on the ground)
      var lo: f32 = xp; var hi2: f32 = x;
      for (var j: i32 = 0; j < 6; j++) { let xm: f32 = 0.5 * (lo + hi2); if (ya + (xm - xa) * k - pField(dl * xm, 3) < 0.0) { hi2 = xm; } else { lo = xm; } }
      hit = 0.5 * (lo + hi2); break;
    }
    xp = x; dp = dd;
  }
  return hit;
}
// how built up the lowland is at p (云下之城: a city round the lakes; 金色雪旗: three villages on the shore)
fn pTown0(p: vec2f) -> f32 {
${isC ? `  let d: f32 = saturate(0.45 + 2.4 * (pN(p / 7400.0 + vec2f(9.1, 4.4)) - 0.42)) + 0.9 * exp(-dot(p - vec2f(2500.0, 13500.0), p - vec2f(2500.0, 13500.0)) / 1.6e7);
  return d * smoothstep(6000.0, 9000.0, length(p));`
    : `  var d: f32 = 0.0;
  d += exp(-dot(p - vec2f(-2600.0, 8300.0), p - vec2f(-2600.0, 8300.0)) / 5.0e5);
  d += exp(-dot(p - vec2f(3400.0, 8900.0), p - vec2f(3400.0, 8900.0)) / 3.2e5);
  d += 0.8 * exp(-dot(p - vec2f(7200.0, 16500.0), p - vec2f(7200.0, 16500.0)) / 6.0e5);
  return d;`}
}
fn pTown(p: vec2f) -> f32 { return pTown0(p / PK); }
// what stands at p (x m out along the line of sight): mode 0 -> (facing a low sun, facing a high sun, lamps, 0), mode 1 -> (its matter, 1).
// fa, fr: what the sample covers across and along the line of sight (m)
fn pShade(p: vec2f, x: f32, mode: f32, fa: f32, fr: f32) -> vec4f {
  let e: f32 = max(16.0, 0.0035 * x);
  let tR: f32 = pTerr(p, 5); let tH: f32 = tR / PK; let cH: f32 = pCloudTop(p) / PK;
  let cl: f32 = step(max(tH, 0.0) + 0.5, cH);
  let hu: f32 = max(pTerr(p + vec2f(e, 0.0), 5), pCloudTop(p + vec2f(e, 0.0))) - max(pTerr(p - vec2f(e, 0.0), 5), pCloudTop(p - vec2f(e, 0.0)));
  let hw: f32 = max(pTerr(p + vec2f(0.0, e), 5), pCloudTop(p + vec2f(0.0, e))) - max(pTerr(p - vec2f(0.0, e), 5), pCloudTop(p - vec2f(0.0, e)));
  let N: vec3f = normalize(vec3f(-hu, 2.0 * e, -hw));
  var n0: f32 = saturate(dot(N, vec3f(${Ld(0.10)}))); var n1: f32 = saturate(dot(N, vec3f(${Ld(0.55)})));
  let town: f32 = pTown(p);
  if (mode < 0.5) {
    var lamps: f32 = 0.0;
    if (cl > 0.5) {
      // cloud: soft in the light, and lit from inside by the town under it
      n0 = 0.42 + 0.58 * n0; n1 = 0.48 + 0.52 * n1;
      lamps = ${f(isC ? 0.55 : 0.12)} * town * sq(pN(p / (1700.0 * PK) + vec2f(5.0, 5.0)) * 1.5) * (1.0 - smoothstep(150.0, 900.0, tH)) * step(1.0, tH);
    } else {
      let level: f32 = smoothstep(0.90, 0.985, N.y) * (1.0 - smoothstep(120.0, 420.0, tH)) * step(1.0, tH);
${isC ? `      // streets: a grid, its avenues brighter, every great block its own share of light
      let g: vec2f = vec2f(p.x * 0.955 + p.y * 0.296, -p.x * 0.296 + p.y * 0.955);
      let st: f32 = pBand((fract(g.x / 150.0) - 0.5) * 150.0, 7.0, fa) + pBand((fract(g.y / 150.0) - 0.5) * 150.0, 7.0, fr);
      let av: f32 = pBand((fract(g.x / 900.0) - 0.5) * 900.0, 12.0, fa) + pBand((fract(g.y / 1200.0) - 0.5) * 1200.0, 12.0, fr);
      let bk: f32 = hash21(floor(vec2f(g.x / 900.0, g.y / 1200.0)) + vec2f(13.0, 57.0));
      lamps = level * town * ((st * 2.2 + 0.08) * (0.25 + 1.3 * bk * bk) + av * 1.6);`
    : `      // a village: its windows, one by one
      let k: vec2f = floor(p / 34.0); let o: vec2f = fract(p / 34.0) - 0.5;
      lamps = level * saturate(town) * step(0.62, hash21(k + vec2f(7.0, 19.0))) * exp(-dot(o, o) * 14.0) * 9.0 + 0.5 * level * saturate(town);`}
    }
    return vec4f(n0, n1, lamps, 0.0);
  }
  // matter: snow; rock where it is too steep to hold snow; dark forest on the lower slopes; cloud
  let dn: f32 = vnoise2(p / 240.0 + vec2f(3.0, 1.0));
  let rock: f32 = 1.0 - smoothstep(0.52, 0.76, N.y + 0.14 * (dn - 0.5));
  let wood: f32 = (1.0 - smoothstep(650.0, 1500.0, tH + 500.0 * (pN(p / (1900.0 * PK)) - 0.5))) * smoothstep(0.60, 0.85, N.y) * step(2.0, tH);
  var alb: vec3f = mix(vec3f(0.90, 0.93, 1.0), vec3f(0.11, 0.15, 0.15), wood * (0.55 + 0.35 * dn));
  alb = mix(alb, vec3f(0.19, 0.18, 0.19) * (0.7 + 0.6 * dn), rock * 0.9);
  alb = mix(alb, vec3f(0.96, 0.97, 1.0) * (0.84 + 0.16 * pN(p / 300.0)), cl);
  return vec4f(alb, 1.0);
}
fn pScene(az: f32, th: f32, mode: f32, dAz: f32, dTh: f32) -> vec4f {
  let dl: vec2f = vec2f(sin(az), cos(az)); let s: f32 = tan(th);
  let xh: f32 = pMarch(dl, 0.0, PH, -s, ${f(P.far * P.K)});
  if (xh < 0.0) { return vec4f(0.0); }
  let p: vec2f = dl * xh; let y: f32 = PH - xh * s; let dist: f32 = sqrt(xh * xh + sq(PH - y));
  let air: f32 = 1.0 - exp(-dist / ${f(P.haze * P.K)});
  let fa: f32 = dist * dAz; let fr: f32 = dist * dTh / max(abs(s), 0.05);
  if (y < 2.0 && pTerr(p, 5) < 1.0 && pCloudTop(p) < 1.0) {
    // the lake: what the line of sight meets when the water throws it back up
    let xr: f32 = pMarch(dl, xh, 0.0, max(s, 0.01), xh + ${f(60000 * P.K)});
    if (xr > 0.0) {
      let c: vec4f = pShade(dl * xr, xr, mode, fa, fr);
      if (mode < 0.5) { return vec4f(-2.0, mix(c.x, c.y, 0.5), c.z * 0.7, air); }
      return vec4f(c.rgb, 1.0);
    }
    if (mode < 0.5) { return vec4f(-1.0, 0.0, 0.0, air); }
    return vec4f(0.0, 0.0, 0.0, 1.0);
  }
  let c: vec4f = pShade(p, xh, mode, fa, fr);
  if (mode < 0.5) { return vec4f(c.x, c.y, c.z, air); }
  return c;
}
fn frag(v: VOut) -> FOut { var o: FOut;
  let n: i32 = i32(M.m.y);
  var sum: vec4f = vec4f(0.0);
  for (var i: i32 = 0; i < 4; i++) {
    if (i < n) {
      var j: vec2f = (vec2f(f32(i & 1), f32(i / 2)) - 0.5) * 0.5;
      if (n == 1) { j = vec2f(0.0); }
      if (n == 2) { j = (vec2f(f32(i), f32(i)) - 0.5) * 0.5; }
      let uv: vec2f = v.uv + j / M.m.zw;
      let xw: f32 = 2.0 * uv.x - 1.0; let az: f32 = ${f(P.AZ)} * (${f(P.ak)} * xw + ${f(1 - P.ak)} * xw * xw * xw);
      let dAz: f32 = ${f(2 * P.AZ)} * (${f(P.ak)} + ${f(3 * (1 - P.ak))} * xw * xw) / M.m.z; let vv: f32 = saturate(uv.y);
      let th: f32 = ${f(P.t0)} + ${f(P.ta)} * vv + ${f(P.tb)} * vv * vv * vv * vv;
      let dTh: f32 = (${f(P.ta)} + ${f(4 * P.tb)} * vv * vv * vv) / M.m.w;
      sum += pScene(az, th + 1e-4, M.m.x, dAz, dTh);
    }
  }
  o.color = sum / f32(max(n, 1)); return o; }
`;
}

// ---- every frame, in the sky shader (after the sky, its aurora and its moon are known: the lake mirrors them)
function peakSSL() {
  const V = Vista, f = metroF, P = Peak;
  const sa = Math.atan2(P.PC[0], P.PC[1]), sd = Math.hypot(P.PC[0], P.PC[1]), st = -Math.atan((P.HP - P.H) / sd);      // the summit: its bearing, and how far it stands above level (as a drop, so under 0)
  return `
// the banner of blown snow streaming from the summit (金色雪旗): rgb its light, a how much of the sky it hides.
// a: bearing from the map's axis, th: the drop below level, both as the panorama has them
fn peakBanner(a: f32, th: f32) -> vec4f {
  let t: f32 = (${f(sa)} - a) / 0.46;
  if (t < 0.0 || t > 1.0) { return vec4f(0.0); }
  let tm: f32 = U.camPos.w;
  let thc: f32 = ${f(st)} + 0.006 - 0.050 * t + 0.010 * sin(t * 8.0 - tm * 0.22) * t;
  let wd: f32 = 0.005 + 0.060 * t;
  let u: f32 = (th - thc) / wd;
  let n: f32 = fbm2(vec2f(t * 13.0 - tm * 0.30, u * 1.4 + 3.0)) * (0.6 + 0.8 * vnoise2(vec2f(t * 41.0 - tm * 0.9, u * 4.0)));
  let dn: f32 = saturate(exp(-u * u) * pow(1.0 - t, 1.25) * smoothstep(0.0, 0.035, t) * (0.25 + 2.0 * n) * 1.15);
  let lightK: vec3f = U.sunCol.rgb * (1.5 * (1.0 - 0.75 * U.skyP.z)) + U.ambSky.rgb * 0.8 + U.twi.rgb * 0.5 + vec3f(0.05, 0.07, 0.13) * U.skyP.z;
  return vec4f(lightK * dn, dn * 0.85);
}
// a sheet of cloud lying h m over the lake, where the line of sight (bearing dl, slope s, the eye PH up) goes down through it:
// x = how much of what lies behind it hides, y = how thick it is there (0 its edge .. 1), z = how far off. cov: the share of sky it covers
fn peakDeck(dl: vec2f, s: f32, h: f32, cov: f32, sc: f32) -> vec3f {
  if (s < 0.004) { return vec3f(0.0); }
  let x: f32 = (${f(P.H * P.K)} - h) / s;
  let pw: vec2f = dl * x;
  let n: f32 = fbm2(pw / sc + vec2f(U.camPos.w * 0.0040, U.camPos.w * 0.0015) + vec2f(h * 0.01, 3.0));
  let t0: f32 = 1.0 - cov;
  let k: f32 = smoothstep(t0 - 0.06, t0 + 0.16, n * 1.25);
  return vec3f(k * (1.0 - smoothstep(${f(55000 * P.K)}, ${f(75000 * P.K)}, x)), smoothstep(t0, t0 + 0.34, n * 1.25), x);
}
// the land, the cloud and the lake below, over the sky that is already there. kind: 2 云下之城, 3 金色雪旗
fn peakPlain(d: vec3f, mu: f32, sky0: vec3f) -> vec3f {
  let az0: f32 = atan2(d.x, -d.z) - ${f(V.cityAz)}; let a: f32 = atan2(sin(az0), cos(az0));
  let th: f32 = atan2(-d.y, length(d.xz)) + ${f(P.lift)};
  var sky: vec3f = sky0;
  if (U.world.x > 2.5) { let bn: vec4f = peakBanner(a, th); sky = sky * (1.0 - bn.a) + bn.rgb; }
  if (th < ${f(P.t0)} || abs(a) > ${f(P.AZ)}) { return sky; }
  let tc: f32 = th - ${f(P.t0)};
  var v: f32 = min(tc / ${f(P.ta)}, 1.0);
  for (var i: i32 = 0; i < 4; i++) { let c3: f32 = v * v * v; v -= (${f(P.ta)} * v + ${f(P.tb)} * c3 * v - tc) / (${f(P.ta)} + ${f(4 * P.tb)} * c3); }
  let xa: f32 = clamp(a / ${f(P.AZ)}, -1.0, 1.0); var x: f32 = xa;
  for (var i: i32 = 0; i < 5; i++) { x -= (${f(P.ak)} * x + ${f(1 - P.ak)} * x * x * x - xa) / (${f(P.ak)} + ${f(3 * (1 - P.ak))} * x * x); }
  let uv: vec2f = vec2f(0.5 * x + 0.5, saturate(v));
  let lod: f32 = max(log2(2.0 * U.camRight.w * U.res.w / (${f(2 * P.AZ / Metro.W)} * (${f(P.ak)} + ${f(3 * (1 - P.ak))} * x * x))), 0.0);
  let A: vec4f = texLod(tSeaB, uv, lod); let E0: vec4f = texLod(tSeaA, uv, lod);
  let inv: f32 = 1.0 / max(A.a, 0.004); let alb: vec3f = A.rgb * inv; let E: vec4f = E0 * inv;
  let water: f32 = saturate(-E.x); let mirrorLand: f32 = saturate(-E.x - 1.0);
  let lampK: f32 = U.skyP.z; let dark: f32 = U.skyP.z;
  // the light of the hour on it
  let hi: f32 = smoothstep(0.06, 0.50, U.sunDir.y);
  let ndl: f32 = mix(mix(max(E.x, 0.0), E.y, hi), E.y, water);
  // (the sky's own light is given the land's form too: there is nothing else to model it by under a flat sky)
  let form: f32 = 0.38 + 1.0 * mix(mix(max(E.x, 0.0), E.y, 0.5), E.y, water);
  let amb: vec3f = (U.ambSky.rgb * 0.85 + U.twi.rgb * 0.35) * form;
  let lit: vec3f = (U.sunCol.rgb * (1.25 * ndl) + amb) * (1.0 - 0.80 * dark) + vec3f(0.014, 0.022, 0.060) * (dark * (0.20 + 3.6 * ndl));
  // lamps: each shimmers a little in the air; and their glow, spread wide, warms the cloud and the land about them
  let tw: f32 = 0.80 + 0.75 * texLod(tDetail, uv * vec2f(37.0, 19.0) + vec2f(U.camPos.w * 0.021, U.camPos.w * 0.013), 0.0).a * texLod(tDetail, uv * vec2f(23.0, 41.0) - vec2f(U.camPos.w * 0.017, 0.0), 0.0).a;
  let glow: f32 = max(texLod(tSeaA, uv, lod + 4.5).z, 0.0);
  let lamps: vec3f = (vec3f(1.0, 0.66, 0.30) * (max(E.z, 0.0) * tw * 1.5) + vec3f(1.0, 0.55, 0.22) * (glow * 0.45)) * lampK;
  let land: vec3f = alb * lit + lamps;
  // the lake: a mirror for the sky (its aurora, its moon), for the land that stands over it, and for the lamps on its shore;
  // drawn out in long streaks by the ripples
  let rp: f32 = texLod(tDetail, vec2f(a * 9.0, th * 70.0 + U.camPos.w * 0.01), 0.0).a - 0.5;
  let el: f32 = max(th - ${f(P.lift)}, 0.004) * (1.0 + 0.5 * rp) + 0.004;
  let hl: f32 = max(length(d.xz), 1e-4); let ce: f32 = cos(el);
  let dr: vec3f = vec3f(d.x / hl * ce, sin(el), d.z / hl * ce);
  var ws: vec3f = skyLut(dr);
  if (M.au.x * U.skyP.w > 0.002) { ws += (aurora(dr, M.au.y, M.au.z, M.au.w) + aurora(normalize(dr + vec3f(0.0, 0.05, 0.0)), M.au.y, M.au.z, M.au.w)) * (0.5 * M.au.x * U.skyP.w); }
  ws += moonDisc(normalize(dr + vec3f(0.0, 0.03 * rp, 0.0))) * 0.7;
  let fres: f32 = 0.32 + 0.68 * pow(1.0 - saturate(sin(max(th - ${f(P.lift)}, 0.0))), 5.0);
  let wcol: vec3f = mix(ws, alb * lit * 0.85 + lamps, mirrorLand) * fres + vec3f(0.004, 0.011, 0.024) * (0.3 + luma(amb));
  var c: vec3f = mix(land, wcol, water);
  // the air between
  c = mix(c, vistaHaze(d) + vec3f(0.10, 0.07, 0.05) * (glow * lampK), saturate(E.w) * 0.88);
  let ex: f32 = 1.0 - smoothstep(${f(P.AZ - 0.08)}, ${f(P.AZ)}, abs(a));
  var res: vec3f = mix(sky, c, saturate(A.a) * ex);
  // ---- the clouds, over all of it: a sea of low cloud (most of the lowland in 云下之城, a few banks in 金色雪旗), and a belt of it
  // about the peak's waist. Each two sheets, one a little over the other, so that they have some body
  let dl: vec2f = vec2f(sin(a), cos(a)); let sl: f32 = tan(clamp(th, -1.4, 1.4));
  let far0: f32 = mix(1.0e7, -${f(P.haze * P.K)} * log(max(1.0 - saturate(E.w), 0.002)), step(0.5, A.a));      // how far off the land stands on this line of sight
  let cloudLit: vec3f = U.sunCol.rgb * (0.80 * (1.0 - 0.80 * dark)) + (U.ambSky.rgb * 0.95 + U.twi.rgb * 0.45) + vec3f(0.016, 0.024, 0.060) * (dark * 2.2);
  let isC: f32 = step(U.world.x, 2.5);
  for (var i: i32 = 0; i < 4; i++) {
    let waist: f32 = step(1.5, f32(i)); let up: f32 = f32(i & 1);
    let hgt: f32 = mix(${f(520 * P.K)}, ${f(2250 * P.K)}, waist) + up * mix(${f(190 * P.K)}, ${f(260 * P.K)}, waist);
    let dk: vec3f = peakDeck(dl, sl, hgt, mix(mix(0.30, 0.60, isC), 0.52, waist), mix(${f(5200 * P.K)}, ${f(2600 * P.K)}, waist));
    if (dk.x > 0.002) {
      let pw: vec2f = dl * dk.z;
      // (the belt keeps to a ring about the peak; the sea keeps off our own mountain's foot)
      let rq: vec2f = pw - vec2f(${f(P.PC[0] * P.K)}, ${f(P.PC[1] * P.K)});
      let ring: f32 = exp(-sq((length(rq) - ${f(5600 * P.K)}) / ${f(1700 * P.K)}));
      let keep: f32 = mix(smoothstep(${f(6500 * P.K)}, ${f(10000 * P.K)}, dk.z), ring, waist) * step(dk.z, far0 + ${f(500 * P.K)});
      let body: f32 = 0.50 + 0.50 * dk.y;
      var cc: vec3f = vec3f(0.97, 0.98, 1.0) * cloudLit * (0.55 + 0.45 * up) * body;
      // 云下之城: the town under the sea of cloud lights it from inside, most where it is thin
      cc += vec3f(1.0, 0.58, 0.24) * (glow * lampK * 3.2 * (1.0 - waist) * isC * (1.25 - 0.75 * dk.y));
      cc = mix(cc, vistaHaze(d), (1.0 - exp(-dk.z / ${f(P.haze * P.K)})) * 0.85);
      res = mix(res, cc, saturate(dk.x * keep * 1.15) * ex);
    }
  }
  return res;
}
`;
}
