// ---------------------------------------------------------------- sky: atmosphere LUT, the day turning into night, sun, moon, stars, an airliner now and then
// (nebula / clouds / city / cloud sea are layered in further down this file and in their own)
const Sky = (() => {
  const S = { alt: 3200, E: 22, az: -0.2, sunElev: 0.20, elev: 0.20, moonElev: 0.27, moonK: 0.034, skyline: 0.027, lutSun: -99, lutMoon: -99,
    clock: 0, cycle: 600, night: 0, lights: 0, stars: 0, moonVis: 0, milk: 1, isMoon: false, exposure: 0.145, hiAlt: 8600, lampK: 0 };
  let gfx, lutTex, lutTarget, pipeLut, pipeSky;
  // the day, as [seconds, height of the sun (rad)]: a long afternoon, the hour of gold, sunset behind the far range, dusk, night, and the morning
  // after. The sun keeps its compass bearing throughout (only its height changes), and comes up again where it went down.
  // (the afternoon sun stands low, 11 degrees up: it is in the picture, the thrown snow hangs close under it, and every ripple of the slope has a shadow)
  const DE = 0.20;
  // (it lingers on the far skyline: for half a minute the disc sits in the notch of the valley before it goes)
  // (the high afternoon holds for the first minute and a bit, then the light starts to move: a run of a few minutes sees it turn gold. The night is
  // the shortest of the holds)
  const DAY = [[0, DE], [70, DE], [185, 0.075], [240, 0.034], [258, 0.012], [320, -0.22], [430, -0.22], [463, -0.03], [483, 0.06], [525, DE], [600, DE]];
  S.elevAt = function (t) {
    t = ((t % S.cycle) + S.cycle) % S.cycle;
    for (let i = 1; i < DAY.length; i++) if (t <= DAY[i][0]) {
      const a = DAY[i - 1], b = DAY[i]; let f = (t - a[0]) / (b[0] - a[0]);
      // ease out of and into the long holds
      if (i > 1 && DAY[i - 2][1] === a[1] && a[1] !== b[1]) f = f * f * (2 - f); else if (i < DAY.length - 1 && DAY[i + 1][1] === b[1] && a[1] !== b[1]) f = 1 - (1 - f) * (1 - f) * (1 + f);
      return lerp(a[1], b[1], f);
    }
    return DAY[0][1];
  };
  S.times = { day: 0, golden: 168, sunset: 236, dusk: 274, night: 345, dawn: 454, sunrise: 475 };
  S.setClock = function (t) { S.clock = t; S.sunElev = S.elevAt(t); };

  S.init = function (g) {
    gfx = g;
    lutTex = gfx.texture({ w: 128, h: 64, format: 'rgba16f', filter: 'linear', wrap: 'clamp' });
    lutTarget = gfx.target({ color: lutTex });
    S.lut = lutTex;
    pipeLut = gfx.pipeline({
      name: 'skyLut', lib: [SL.common, SL.atmo], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f', q: 'vec4f' }, textures: {}, depth: false, depthTest: false, cull: 'none',
      vs: VS_FULLSCREEN,
      fs: `fn frag(v: VOut) -> FOut { var o: FOut;
        let az: f32 = saturate((v.uv.x - 0.5 / 128.0) * (128.0 / 127.0)) * PI;
        let vv: f32 = saturate(((1.0 - v.uv.y) - 0.5 / 64.0) * (64.0 / 63.0)) * 2.0 - 1.0;
        let el: f32 = sign(vv) * vv * vv * PI * 0.5;
        let se: f32 = M.p.x;
        let sun: vec3f = vec3f(cos(se), sin(se), 0.0);
        let d: vec3f = vec3f(cos(el) * cos(az), sin(el), cos(el) * sin(az));
        var c: vec3f = atmoScatter(vec3f(0.0), d, sun, M.p.y);
        // the same air lit by the moon, which hangs on the sun's bearing
        if (M.q.w > 0.0) { c += atmoScatter(vec3f(0.0), d, vec3f(cos(M.p.z), sin(M.p.z), 0.0), M.p.y) * M.q.rgb; }
        o.color = vec4f(c, 1.0); return o; }`,
    });
    pipeSky = gfx.pipeline({
      name: 'sky', lib: [SL.common, SL.hash, SL.fog, NEBULA_SSL, vistaSSL(), CLOUDSEA_SSL, CIRRUS_SSL, NIGHT_SSL, CONTRAIL_SSL], buffers: [], varyings: { uv: 'vec2f' },
      uniforms: { p: 'vec4f', nr: 'vec4f', nu: 'vec4f', nf: 'vec4f', sd: 'vec4f', mo: 'vec4f', hi: 'vec4f', fr: 'vec4f', pa: 'vec4f', pb: 'vec4f', pc: 'vec4f', cs: 'vec4f' },
      textures: { tSky: '2d', tNebA: '2d', tNebB: '2d', tDetail: '2d', tFarA: '2d', tFarB: '2d', tCityA: '2d', tCityB: '2d', tCitySh: '2d', tSeaA: '2d', tSeaB: '2d' }, depthFunc: 'lequal', depthWrite: false, cull: 'none',
      vs: `fn vert(a: VIn) -> VOut { var v: VOut; let uv: vec2f = vec2f(f32((a.vid << 1u) & 2u), f32(a.vid & 2u)); v.clip = vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 1.0, 1.0); v.uv = uv; return v; }`,
      fs: `fn frag(v: VOut) -> FOut { var o: FOut;
        let ndc: vec2f = vec2f(v.uv.x * 2.0 - 1.0, 1.0 - v.uv.y * 2.0);
        let d: vec3f = normalize(U.camFwd.xyz + U.camRight.xyz * (ndc.x * U.camRight.w * U.camUp.w) + U.camUp.xyz * (ndc.y * U.camRight.w));
        var col: vec3f = skyLut(vec3f(d.x, max(d.y, 0.0), d.z));
        let mu: f32 = dot(d, U.sunDir.xyz);
        // the haze band at the horizon: milky and bright by day rather than yellow (at sunset it keeps all its colour)
        let hz: f32 = smoothstep(0.16, 0.0, d.y);
        col = mix(col, vec3f(luma(col)) * vec3f(1.03, 1.0, 1.0), 0.55 * hz * U.sunDir.w);
        let ang: f32 = acos(clamp(mu, -1.0, 1.0));
        // polariser on the lens: sky light scattered at right angles to the sun is strongly polarised, so the blue deepens away from the sun
        col *= 1.0 - M.p.z * (1.0 - mu * mu) * smoothstep(-0.02, 0.32, d.y);
        let skyL: f32 = luma(col);
        // stars come out as the sky lets them
        // the nebula: by day a pale ghost riding on the blue (scaled with the sky behind it), lost in the haze toward the horizon and in the sun's glare
        let nb: vec4f = nebula(d, U.camPos.w);
        let nbc: vec3f = mix(vec3f(luma(nb.rgb)), nb.rgb, M.p.w);
        // stars come out as the sky lets them; where the nebula glows they sink into it
        if (U.skyP.w > 0.003) { col += stars(d) * (U.skyP.w * smoothstep(-0.01, 0.10, d.y) / (1.0 + 2.5 * luma(nb.rgb) * M.nu.w)); }
        col += nbc * (M.p.x * skyL + M.p.y) * smoothstep(-0.01, 0.15, d.y) * smoothstep(0.04, mix(0.12, 0.26, U.sunDir.w), ang) * U.fx.z * M.nu.w;
        col += moonDisc(d);
        // high thin cloud in front of all that, and whatever is flying up there
        let ci: vec4f = cirrus(d, mu);
        col = col * (1.0 - ci.a) + ci.rgb;
        let ct: vec4f = contrail(d, mu);
        col = col * (1.0 - ct.a) + ct.rgb;
        // sun disc with limb darkening, and its glare: the air spreads the light well out from the disc, so the sky pales and whitens toward
        // the sun over a good twenty degrees (round the moon there is far less of it)
        let disc: f32 = smoothstep(0.0062, 0.0048, ang) * M.sd.w * smoothstep(-0.002, 0.003, d.y);
        col += M.sd.rgb * U.sunCol.w * disc * (0.55 + 0.45 * sqrt(saturate(1.0 - sq(ang / 0.0062))));
        col += U.sunCol.rgb * (0.9 * exp(-ang * 55.0) + 0.12 * exp(-ang * 9.0) + (0.20 * exp(-ang * 15.0) + M.pc.y * exp(-ang * 4.4)) * (0.2 + 0.8 * M.sd.w));
        // beyond the mountain, nearest last: ranges on the horizon, the cloud deck, the city standing in it
        col = farRanges(d, col);
        col = mix(col, cloudSea(d, mu, col), smoothstep(0.0, -0.006, d.y));
        col = cityLayer(d, col);
        o.color = vec4f(col, 0.0); return o; }`,
    });
    S.pipes = [pipeLut, pipeSky];
  };
  const dirOf = el => { const ce = Math.cos(el); return [Math.sin(S.az) * ce, Math.sin(el), -Math.cos(S.az) * ce]; };
  // the light everything is lit by: the sun, or the moon once the sun is well down. Azimuth is measured from -z toward +x
  S.sunDir = function () { return dirOf(S.elev); };
  S.trueSun = function () { return dirOf(S.sunElev); };
  S.moonDir = function () { return dirOf(S.moonElev); };
  const lum3 = c => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  // moonlight as film shows it: silver-blue
  const MT = [0.635, 0.795, 1.128], NIGHT = [0.0041, 0.0052, 0.0087];
  // light colours derived from the same atmosphere the LUT is baked from
  S.computeLight = function () {
    const e = S.sunElev, sun = dirOf(e), k = S.E / PI, tr = Atmo.transmit(S.alt, sun), irr = Atmo.irradiance(sun, S.alt);
    if (!S.moonT) { const md = S.moonDir(); S.moonT = Atmo.transmit(S.alt, md); S.moonIrr = Atmo.irradiance(md, S.alt); }
    S.night = smooth(0.0, -0.17, e); S.lights = smooth(0.035, -0.09, e); S.stars = smooth(-0.03, -0.16, e); S.moonVis = smooth(0.11, -0.03, e); S.milk = smooth(0.03, 0.22, e);
    S.nebNightK = smooth(0.02, -0.17, e);
    S.lampK = smooth(-0.015, -0.085, e);                          // the skier's headlamp comes on at dusk
    // the far ranges stand in front of the sun for the last of its descent: the disc goes behind their skyline
    const vis = smooth(S.skyline - 0.0075, S.skyline + 0.0075, e);
    // the moon was there all along, a thin crescent lost in the glare; it takes over as the key light when the sun is well under
    S.isMoon = e < -0.05; S.elev = S.isMoon ? S.moonElev : e;
    S.moonSky = S.moonK * smooth(0.05, -0.12, e);                 // its share of the sky's own light (in the LUT and the ambient)
    const mk = S.moonK * smooth(-0.05, -0.15, e), moon = S.moonT.map((c, i) => c * k * mk * MT[i]);
    S.disc = tr.map(c => c * k);
    S.sunCol = S.isMoon ? moon : tr.map(c => c * k * vis);
    // what stands higher keeps the sun longer: the far summits and the cumulus (alpenglow), and higher still the cirrus and the contrails
    const gone = smooth(-0.05, -0.022, e);
    S.sunFar = S.isMoon ? moon : Atmo.transmit(S.alt + 900, sun).map(c => c * k * gone);
    S.sunHi = S.isMoon ? moon : Atmo.transmit(S.alt + S.hiAlt, sun).map(c => c * k * gone);
    S.ambSky = irr.map((c, i) => c * k + S.moonIrr[i] * k * S.moonSky * MT[i] + NIGHT[i] * S.night);
    // (the moonlit air is as blue as the sunlit one, but far too dim for the eye to see it so: by night the fill light is pulled a third of the way to grey)
    { const g = lum3(S.ambSky), q = S.nightGrey * S.night; S.ambSky = S.ambSky.map(c => c + (g - c) * q); }
    // light bounced up from surrounding snow
    const up = Math.max(0, Math.sin(S.elev));
    S.ambGnd = [0, 1, 2].map(c => 0.5 * (S.sunCol[c] * (up * 0.9 + 0.2 * smooth(-0.05, 0.15, Math.sin(S.elev))) + S.ambSky[c] * 0.8));
    // the band of bright sky low on the sun's bearing: after sunset it is what lights the slope that faces it
    { const a = Atmo.scatter(dirOf(0.02), sun, S.alt), b = Atmo.scatter(dirOf(0.06), sun, S.alt); S.twi = [0, 1, 2].map(c => (a[c] + b[c]) * 0.5 * S.E * S.twiK); }
    // the lens opens as the light goes, but not all the way: dusk should feel like dusk
    const lum = c => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2], L = lum(S.sunCol) * 0.33 + lum(S.ambSky) * 1.9 + lum(S.twi) * 0.5;
    S.sceneL = L; S.exposure = clamp(S.expDay * Math.pow(S.keyL / L, S.expGamma), S.expDay, 2.6);
    // ...and with the sun on the skyline it is stopped down for the sky: the glow holds the picture and the land goes toward silhouette
    S.exposure *= 1 - S.sunsetStop * smooth(0.10, 0.05, e) * smooth(-0.07, -0.02, e);
    // ...and night is shown as night: the moonlit snow sits well under middle grey, so the pool of the headlamp and the lights of the city carry the picture
    S.exposure *= 1 - S.nightStop * S.night;
    // ...and a graduated filter holds the sky back while it does, as a photographer's would at dusk: the air's own light (sky, haze) is shown a
    // little darker than the land it hangs over, so the blue stays deep and the afterglow keeps its colour
    S.nd = Math.pow(S.expDay / S.exposure, S.ndGamma);
  };
  S.sunsetStop = 0.30; S.nightStop = 0.20; S.nightGrey = 0.36; S.twiK = 0.5; S.expDay = 0.145; S.keyL = 2.46; S.expGamma = 0.65; S.ndGamma = 0.42;
  // call before the frame's globals are built: refreshes light colours when the sun has moved
  S.update = function () { if (S.lightElev === undefined || Math.abs(S.lightElev - S.sunElev) > 0.0004 || S.lightAz !== S.az) { S.lightElev = S.sunElev; S.lightAz = S.az; S.moonT = S.lightMoon === S.moonElev ? S.moonT : null; S.lightMoon = S.moonElev; S.computeLight(); } };
  S.bakeLut = function () {
    if (Math.abs(S.lutSun - S.sunElev) < 0.002 && Math.abs(S.lutMoon - S.moonSky) < 0.0006) return false;
    S.lutSun = S.sunElev; S.lutMoon = S.moonSky;
    gfx.beginPass(lutTarget, { color: [0, 0, 0, 1] });
    gfx.draw(pipeLut, { u: { p: [S.sunElev, S.alt, S.moonElev, 0], q: [MT[0] * S.moonSky, MT[1] * S.moonSky, MT[2] * S.moonSky, S.moonSky > 1e-5 ? 1 : 0] }, count: 3 });
    gfx.endPass();
    return true;
  };

  // ---- an airliner now and then: straight and level far above, minutes apart, on its own business. It trails only while it crosses a
  // layer of damp air (half a minute of its flight); the trail it has laid thins away behind it within another minute. (It is nearer and
  // quicker than a real one would be: at true airliner pace it hung beside the same cloud for minutes and read as a scratch on the sky.)
  const PL = S.plane = { on: false, next: 55, x: 0, z: 0, hx: 1, hz: 0, v: 250, t0: 0, n: 0, len: 0, wet: 90, cut: 0 };
  S.updatePlane = function (t, dt, cam, fwd) {
    if (!PL.on) {
      if (t < PL.next || S.planes === false) return;
      // it crosses ahead of the mountain, 30-46 km off, from one side to the other on a slightly slanting course
      const rnd = RNG(7001 + PL.n * 131), side = PL.n % 2 ? 1 : -1, D = 30000 + 16000 * rnd(), a0 = Math.atan2(fwd[0], -fwd[2]) * 0.5 + (rnd() - 0.5) * 0.3, th = (rnd() - 0.5) * 0.7;
      const cx = cam[0] + D * Math.sin(a0), cz = cam[2] - D * Math.cos(a0);
      PL.hx = -side * Math.cos(th); PL.hz = Math.sin(th);
      PL.v = 330 + 50 * rnd(); PL.wet = 26 + 12 * rnd();
      // the damp layer starts well to one side of the valley, so the trail is drawn across the view
      const back = 9000 + D * 0.32;
      PL.x = cx - PL.hx * back; PL.z = cz - PL.hz * back; PL.t0 = t; PL.len = 60; PL.cut = 0; PL.on = true; PL.n++;
    }
    const age = t - PL.t0;
    PL.x += PL.hx * PL.v * dt; PL.z += PL.hz * PL.v * dt; PL.len = Math.min(PL.len + PL.v * dt, 60000);
    if (age > PL.wet) PL.cut += PL.v * dt;                       // out of the damp air: no new trail behind the aircraft
    // gone when what it laid has thinned away
    if (age > PL.wet + 62) { PL.on = false; PL.next = t + 240 + 160 * hashU(PL.n * 977) * U2F; }
  };

  S.nebDay = 0.55; S.nebNight = 0.33; S.nebSat = 0.45; S.polar = 0.34; S.glare = 0.075;
  S.draw = function () {
    Vista.updateShadow(); const b = Nebula.basis(), md = S.moonDir(), cam = Render.cam.pos;
    // strobes: two quick white flashes and a slow red beacon
    const ph = (Render.time * 0.9) % 1, strobe = (ph < 0.045 || (ph > 0.13 && ph < 0.175)) ? 1 : 0, beacon = Math.pow(Math.max(0, Math.sin(Render.time * 4.2)), 8);
    gfx.draw(pipeSky, { u: { p: [S.nebDay, S.nebNight * S.nebNightK, S.polar * lerp(0.5, 1, S.milk), lerp(1.0, S.nebSat, S.milk)], nr: b.nr, nu: b.nu, nf: b.nf,
      sd: [S.disc[0], S.disc[1], S.disc[2], S.isMoon ? 0 : 1], mo: [md[0], md[1], md[2], S.moonVis], hi: [S.sunHi[0], S.sunHi[1], S.sunHi[2], S.night], fr: [S.sunFar[0], S.sunFar[1], S.sunFar[2], strobe + 0.5 * beacon],
      pa: PL.on ? [PL.x - cam[0], PL.z - cam[2], S.hiAlt, 1] : [0, 0, S.hiAlt, 0], pb: [PL.hx, PL.hz, PL.len, PL.v], pc: [PL.cut, S.glare, 0, 0], cs: [Clouds.sea.f, Clouds.sea.oA, Clouds.sea.oB, 0] },
      tex: { tSky: lutTex, tNebA: Nebula.texA, tNebB: Nebula.texB, tDetail: Tex.detail, tFarA: Vista.farA, tFarB: Vista.farB, tCityA: Vista.cityA, tCityB: Vista.cityB, tCitySh: Vista.shTex, tSeaA: Clouds.sea.A, tSeaB: Clouds.sea.B }, count: 3 });
  };
  return S;
})();

// ---- what the night adds: stars, and the moon (a young crescent with the rest of its disc faintly lit by the earth)
const NIGHT_SSL = `
fn stars(d: vec3f) -> vec3f {
  let p: vec3f = d * 150.0; let i: vec3f = floor(p); let h: vec3f = hash33(i + vec3f(31.0, 57.0, 11.0));
  // one star in a cell at most, kept clear of its walls and close to the sphere the cells are cut from; most cells have none worth drawing
  let cr: vec3f = i + 0.25 + 0.5 * h; let rr: f32 = length(cr);
  if (abs(rr - 150.0) > 0.22) { return vec3f(0.0); }
  let c: vec3f = cr / rr;
  let h2: vec3f = hash33(i + vec3f(7.0, 3.0, 91.0));
  let mag: f32 = h2.x * h2.x; let b: f32 = mag * mag * mag * mag;         // a few bright ones, a great many faint
  if (b < 0.42) { return vec3f(0.0); }
  let s: f32 = (b - 0.42) / 0.58;
  let px: f32 = 2.0 * U.camRight.w * U.res.w;                              // one pixel, in radians
  let sz: f32 = px * (0.58 + 0.50 * s * s);
  let a: vec3f = d - c; let g: f32 = exp(-dot(a, a) / (sz * sz));
  // the air makes them tremble, most of all low down
  let tw: f32 = 1.0 + (0.18 + 0.5 * smoothstep(0.5, 0.05, d.y)) * sin(U.camPos.w * (2.0 + 5.0 * h2.y) + h2.z * 40.0) * sin(U.camPos.w * (1.3 + 2.7 * h2.z) + h.x * 17.0);
  let tint: vec3f = mix(vec3f(1.0, 0.80, 0.62), vec3f(0.70, 0.84, 1.0), smoothstep(0.15, 0.75, h2.y));
  return tint * (g * tw * (0.022 + 0.10 * s + 1.6 * s * s * s * s));
}
fn moonDisc(d: vec3f) -> vec3f {
  let md: vec3f = M.mo.xyz; let RM: f32 = 0.019;
  let c: f32 = dot(d, md);
  if (M.mo.w <= 0.001 || c < 0.9986) { return vec3f(0.0); }
  let mr: vec3f = normalize(cross(md, vec3f(0.0, 1.0, 0.0))); let mup: vec3f = cross(mr, md);
  let q: vec2f = vec2f(dot(d, mr), dot(d, mup)) / RM; let r2: f32 = dot(q, q);
  let px: f32 = 2.0 * U.camRight.w * U.res.w / RM;
  let edge: f32 = smoothstep(1.0 + px, 1.0 - px, sqrt(r2));
  // a faint glow of the thin air round it
  var col: vec3f = vec3f(0.60, 0.75, 1.0) * (0.035 * exp(-max(sqrt(r2) - 1.0, 0.0) * 1.6));
  if (edge > 0.0) {
    let z: f32 = sqrt(max(1.0 - r2, 0.0)); let n: vec3f = vec3f(q.x, q.y, z);
    // the sun is below and beyond it: only the lower limb is lit
    let lit: f32 = smoothstep(-0.02, 0.10, dot(n, normalize(vec3f(0.10, -0.80, -0.59))));
    let seas: f32 = texLod(tDetail, q * 0.11 + vec2f(0.31, 0.72), 0.0).z; let fine: f32 = texLod(tDetail, q * 0.45 + vec2f(0.6, 0.1), 0.0).w;
    let alb: f32 = (0.55 + 0.45 * smoothstep(0.35, 0.60, seas)) * (0.85 + 0.3 * fine);
    col += (vec3f(1.0, 0.96, 0.88) * (lit * 11.0 * (0.55 + 0.45 * z)) + vec3f(0.50, 0.62, 0.90) * 0.085) * (alb * edge);
  }
  return col * M.mo.w;
}
`;

// ---- an airliner at cruise height and the trail of ice it draws: M.pa = where it is from the eye (x, z, height above the eye, on/off),
// M.pb = (heading x, z, length of trail laid so far, speed), M.hi = the light up there (it keeps the sun after the mountain has lost it)
const CONTRAIL_SSL = `
fn contrail(d: vec3f, mu: f32) -> vec4f {
  if (M.pa.w <= 0.0 || d.y < 0.012) { return vec4f(0.0); }
  // the trail is a round tube of ice, not a ribbon lying flat: what counts is how near the line of sight passes to its axis
  let u: vec3f = vec3f(M.pb.x, 0.0, M.pb.y); let P0: vec3f = vec3f(M.pa.x, M.pa.z, M.pa.y);
  let bq: f32 = dot(d, u); let den: f32 = max(1.0 - bq * bq, 1e-4);
  let dq: f32 = -dot(d, P0); let eq: f32 = -dot(u, P0);
  let rng: f32 = max((bq * eq - dq) / den, 1.0);                           // how far along the line of sight
  let along: f32 = -(eq - bq * dq) / den;                                  // how far behind the aircraft (m)
  var across: f32 = -dot(P0, normalize(cross(d, u)));
  let px: f32 = rng * 2.0 * U.camRight.w * U.res.w;                        // what one pixel spans up there (m)
  let light: vec3f = M.hi.rgb * (0.55 + 3.0 * hg(mu, 0.72) + 0.5 * hg(mu, 0.2)) + U.ambSky.rgb * 0.6;
  var a: f32 = 0.0;
  if (along > 40.0 + M.pc.x && along < M.pb.z && abs(across) < 2500.0) {
    let age: f32 = along / M.pb.w;                                          // seconds since the aircraft was here
    // the wake rolls the trail into slow waves, and wind aloft shears it out of true
    let wob: vec4f = texLod(tDetail, vec2f(along / 9000.0, 0.37), 0.0);
    across += (wob.x - 0.5) * 2.6 * age + 12.0 * sin(along / 75.0 + wob.z * 6.0) * smoothstep(15.0, 80.0, age);
    // two engines' trails that spread and run together within seconds
    let sep: f32 = 15.0 * exp(-age / 9.0);
    // it spreads as it ages, in long uneven stretches (the air it was laid in is not the same everywhere)
    let n: vec4f = texLod(tDetail, vec2f(along / 26000.0, 0.81), 0.0);
    let w: f32 = (9.0 + 1.5 * age) * (0.7 + 0.6 * n.x);
    let we: f32 = max(w, 0.9 * px);
    let g: f32 = 0.5 * (exp(-sq((across - sep) / we)) + exp(-sq((across + sep) / we))) * (w / we) * mix(1.0, 2.0, exp(-age / 9.0));
    // the edges curl into the wake's slow lobes, and whole stretches thin away where the air is dry
    let lobe: f32 = texLod(tDetail, vec2f(along / 3400.0, across / max(we, 1.0) * 0.11 + 0.5), log2(max(px / 6.6, 1.0))).z;
    let brk: f32 = mix(1.0, (0.25 + 1.25 * smoothstep(0.25, 0.70, n.z)) * (0.6 + 0.8 * lobe), smoothstep(20.0, 140.0, age));
    // looked at along its length there is more of it in the way
    a = (1.0 - exp(-1.5 * g * brk * exp(-age / 27.0) * smoothstep(40.0, 320.0, along - M.pc.x) * smoothstep(M.pb.z, M.pb.z * 0.72, along) / max(sqrt(den), 0.3)));
  }
  a *= smoothstep(0.012, 0.06, d.y);
  var c: vec3f = light * a;
  // the aircraft itself: a fleck of sunlit metal by day, its strobes after dark
  let rh: f32 = M.pa.z / d.y; let pxh: f32 = rh * 2.0 * U.camRight.w * U.res.w;
  let dr: f32 = length(d * rh - P0) / max(pxh * 0.9, 22.0);
  if (dr < 3.0) {
    let k: f32 = exp(-dr * dr) * min(1.0, 22.0 / (pxh * 0.9)) * smoothstep(0.012, 0.05, d.y);
    c += (M.hi.rgb * 2.6 + vec3f(1.0, 0.96, 0.9) * (M.fr.w * 30.0 * M.hi.w) + U.ambSky.rgb) * k;
  }
  return vec4f(c, a);
}
`;

// ---- the cloud sea: a floor of cloud far below, always the same distance away however long you descend.
// It is a real volume of droplets, ray-marched and lit in 13_clouds.js into a panorama round the eye (it never comes nearer, so the view of
// it only turns): R = light from the sun, G from the sky, B thrown up by the cloud around, A = how far off the cloud seen that way lies (km).
// A new panorama (a "key") is finished every couple of seconds, for the deck as it will then be; the frame shows the last two, each carried
// along by the wind to this very moment, and fades from one to the next: three fetches here, the march itself is spread over the frames.
// SEA: deck = how far below the eye its floor lies (m), top = how high cloud can stand above that; k, ta, tb = the panorama's layout
// (bearings packed closer down the valley than behind, rows closer toward the horizon); wind (m/s); K = seconds between keys; air = haze length (m)
const SEA = { deck: 950, top: 376, k: 0.75, ta: 0.40, tb: 0.90, wind: [28, 9], K: 1.5, air: 26000 };
const seaF = x => (Number.isInteger(x) ? x.toFixed(1) : String(+x.toFixed(6)));
const SEA_MAP_SSL = `
// where in the panorama a point lies: p = its horizontal offset from the eye, drop = how far below the eye (any unit, the same for both)
fn seaUV(p: vec2f, drop: f32) -> vec2f {
  let az: f32 = atan2(p.x, -p.y); let th: f32 = atan2(drop, length(p));
  var v: f32 = min(th / ${seaF(SEA.ta)}, 1.0);
  for (var i: i32 = 0; i < 4; i++) { let c: f32 = v * v * v; v -= (${seaF(SEA.ta)} * v + ${seaF(SEA.tb)} * c * v - th) / (${seaF(SEA.ta)} + ${seaF(4 * SEA.tb)} * c); }
  return vec2f(0.5 + (az + ${seaF(SEA.k)} * sin(az)) * 0.15915494, saturate(v));
}
// how far off (m) the cloud seen along d lies: for whatever else must lie on the deck or stand in it (the city's lights, its towers' feet).
// Needs this string in the pipeline's lib and the texture tSeaB bound to Clouds.sea.B
fn seaRange(d: vec3f) -> f32 { return texLod(tSeaB, seaUV(d.xz, max(-d.y, 1e-4)), 0.0).a * 1000.0; }
`;
const CLOUDSEA_SSL = SEA_MAP_SSL + `
fn cloudSea(d: vec3f, mu: f32, haze: vec3f) -> vec3f {
  let dy: f32 = max(-d.y, 1e-4); let f: f32 = M.cs.x; let w: vec2f = vec2f(${seaF(SEA.wind[0] * SEA.K)}, ${seaF(SEA.wind[1] * SEA.K)});
  // how far off the cloud seen this way lies, and so where it stands on the map
  let r0: f32 = seaRange(d);
  let p0: vec2f = d.xz * r0; let dr: f32 = dy * r0;
  // the last key and the next one, each moved to where the wind has carried it by now (or will have: the next one lies a little ahead in time)
  let a: vec4f = texLod(tSeaA, seaUV(p0 - w * M.cs.y, dr), 0.0);
  let b: vec4f = texLod(tSeaB, seaUV(p0 - w * M.cs.z, dr), 0.0);
  let k: vec4f = mix(a, b, f);
  let t: f32 = k.a * 1000.0; let pg: vec2f = d.xz * t;
  // the frame's own light on it; the city's towers lay their shadows across it
  var c: vec3f = (U.sunCol.rgb + U.twi.rgb * 0.8) * (k.r * (1.0 - 0.6 * cityShadow(pg))) + U.ambSky.rgb * k.g + U.ambGnd.rgb * k.b;
  // after dark the city lights the cloud it stands in (the one place where the deck takes light from a spot pg on the map, metres from the eye)
  c += vec3f(1.0, 0.60, 0.28) * (cityGlow(pg) * U.skyP.z * (0.30 + 0.70 * saturate(k.g * 0.45)));
  return mix(haze, c, exp(-t / ${seaF(SEA.air)}));
}
`;

// ---- high thin cloud: ice crystals combed out by the wind into long fibres. Returns (light scattered toward the eye, opacity).
const CIRRUS_SSL = `
fn cirrus(d: vec3f, mu: f32) -> vec4f {
  // a sheet far overhead, bent with the earth so it meets the horizon instead of running off to infinity
  let t: f32 = 1.0 / (max(d.y, 0.0) + 0.10);
  let p: vec2f = d.xz * t + vec2f(U.skyP.y * 1.1, U.skyP.y * 0.3);
  let ax: vec2f = vec2f(0.86, 0.50);
  let q: vec2f = vec2f(dot(p, ax), dot(p, vec2f(-ax.y, ax.x)));
  let wv: vec2f = tex(tDetail, q * vec2f(0.045, 0.09) + vec2f(0.21, 0.63)).xy - 0.5;
  let n1: f32 = tex(tDetail, vec2f(q.x * 0.022, q.y * 0.26) + wv * 0.055).z;
  let n2: f32 = tex(tDetail, vec2f(q.x * 0.075, q.y * 0.80) + wv * 0.10 + vec2f(0.37, 0.11)).z;
  let cov: f32 = smoothstep(0.40, 0.60, tex(tDetail, q * vec2f(0.012, 0.030) + vec2f(0.55, 0.20)).z);
  let a: f32 = cov * smoothstep(0.36, 0.72, n1 * 0.62 + n2 * 0.38 + 0.10 * cov) * smoothstep(0.015, 0.14, d.y) * U.cloudP.z * 0.62;
  let lit: vec3f = M.hi.rgb * (0.50 + 3.2 * hg(mu, 0.75) + 0.6 * hg(mu, 0.25)) + U.ambSky.rgb * 0.9;
  return vec4f(lit * a, a);
}
`;
