// ---------------------------------------------------------------- what kind of snow lies where, and how each kind takes the light (Variants 'snowr')
// Version a is the snow as it was. Version b draws it from the research the owner asked for (2026-11-13), each part on its own switch:
//   snr1 雪粒反射  the snow's light from the size of its grains: Kokhanovsky & Bréon 2012, the analytic snow BRDF that satellites are checked
//                  against. R = R0 rs^x, R0 from the two cosines and the scattering angle (its forward peak is what makes a slope toward a low
//                  sun bright), rs = exp(-sqrt(alpha l)), l = 11.38 d. Grains d fine in new powder, coarse in old and wet snow: coarse snow is a
//                  little greyer, and in hollows (where light has bounced many times before it comes out) it goes blue, red first
//   snr2 闪光不闪烁  glints after Wang & Bowles 2016 ("Sparkly but not too sparkly"): each glint is a soft dot never smaller than about a
//                  pixel and a half, dimmer the bigger it is, its brightness held to a ceiling, and where the cells are too small to show it
//                  fades into the mean sheen of the glints instead of being cut off. Small, very bright, one-pixel flashes were what flickered
//                  on phones drawn at a lower resolution (and what the bloom turned into popping halos)
//   snr3 逆光透光  light that comes through thin snow toward the lens (Barré-Brisebois, DICE, GDC 2011): the lips and berms of the tracks,
//                  loose snow, the crests of ripples and cornices glow against a low sun
//   snr4 雪痕      tracks by the snow: how deep a ski presses in (ice hardly at all, wet snow most), and the berm of snow it squeezes up
//   snr5 雪况分布  where each kind lies (after Cordonnier et al. 2018): powder off the run, among the trees and on the powder runs; the run
//                  itself packed; wind crust on ridges and blown ribs; on the steep part of a run, scraped patches of ice (F0 0.018, smooth,
//                  dark, mirrors the sky); on steep faces turned to the sun, wet snow under a film of water (F0 0.02)
//   snr6 压雪纹    the corduroy a groomer leaves on the packed run: ribs a few centimetres apart down the run, and the lanes of its passes
// The terrain shader (04_terrain.js) asks M.sf / M.sg which parts are on, and reads the run's lie from a table (M.ct0..15, along z) that
// this module fills every frame. Tracks (17_tracks.js) asks SnowLook.at for the snow under the skis.
const SnowLook = (() => {
  const S = { N: 16, DZ: 50, BACK: 100 };
  const VS = typeof Variants !== 'undefined' ? Variants : null;
  const PARTS = [['snr1', '└ 雪粒反射'], ['snr2', '└ 闪光不闪烁'], ['snr3', '└ 逆光透光'], ['snr4', '└ 雪痕深浅'], ['snr5', '└ 雪况分布'], ['snr6', '└ 压雪纹']];
  if (VS) { VS.def('snowr', '雪面渲染', [['a', '现在的'], ['b', '新的']], 'a'); for (const [n, l] of PARTS) VS.def(n, l, [['on', '开'], ['off', '关']], 'on'); }
  S.b = () => !!VS && VS.val.snowr === 'b';
  S.on = n => S.b() && VS.val[n] !== 'off';
  // the uniforms the terrain takes: sf = parts 1..4 (BRDF, glints, translucency, states), sg = (corduroy, tracks, -, quality level),
  // sn = (z of the table's first row, 1 / its spacing, table on, -), ct0..15 = (centre of the run - origin x, half width, powder, ridge)
  const U = S.U = { sf: [0, 0, 0, 0], sg: [0, 0, 0, 0], sn: [0, 0, 0, 0] };
  for (let i = 0; i < S.N; i++) U['ct' + i] = [0, 40, 0, 0];
  S.uniformNames = () => { const u = { sf: 'vec4f', sg: 'vec4f', sn: 'vec4f' }; for (let i = 0; i < S.N; i++) u['ct' + i] = 'vec4f'; return u; };
  const row = {};
  S.frame = function (origin, at) {
    const b = S.b();
    U.sf[0] = b && S.on('snr1') ? 1 : 0; U.sf[1] = b && S.on('snr2') ? 1 : 0; U.sf[2] = b && S.on('snr3') ? 1 : 0; U.sf[3] = b && S.on('snr5') ? 1 : 0;
    U.sg[0] = b && S.on('snr6') && U.sf[3] ? 1 : 0; U.sg[1] = b && S.on('snr4') ? 1 : 0; U.sg[3] = typeof Quality !== 'undefined' ? Quality.tier : 0;
    U.sn[2] = U.sf[3];
    if (!U.sf[3]) return U;
    // the table: from BACK m behind the camera on down the run (the run goes toward -z)
    const z0 = at[2] + S.BACK;
    U.sn[0] = z0 - origin[2]; U.sn[1] = -1 / S.DZ;
    for (let i = 0; i < S.N; i++) {
      const c = Course.at(Math.max(0, -(z0 - i * S.DZ)), row), u = U['ct' + i];
      if (!(c.cx === c.cx && c.hw === c.hw && c.powder === c.powder && c.ridge === c.ridge)) continue;      // (never a NaN into the shader)
      u[0] = c.cx - origin[0]; u[1] = c.hw; u[2] = c.powder; u[3] = c.ridge;
    }
    return U;
  };
  // scraped / baked patches: a few tens of metres across, periodic in 1024 m as all the snow's patterns are (the shader's own copy is SNOW_SSL)
  const TAU = 2 * Math.PI / 1024;
  S.patch = (x, z) => 0.5 + 0.5 * (0.5 * Math.sin(TAU * (37 * x + 11 * z) + 1.3 * Math.sin(TAU * (-13 * x + 29 * z))) + 0.3 * Math.sin(TAU * (-23 * x + 41 * z) + 0.7) + 0.2 * Math.sin(TAU * (53 * x - 47 * z) + 2.1));
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  // the same rules as snowState in the shader, for the snow under the skier (no hollows/ribs: the run is smooth across a ski's length).
  // Returns { powder, groom, crust, wet, ice } summing to 1
  const out = { powder: 1, groom: 0, crust: 0, wet: 0, ice: 0 };
  S.at = function (x, z) {
    const c = Course.at(Math.max(0, -z), row), n = Course.normal(x, z), tn = Math.hypot(n[0], n[2]) / Math.max(n[1], 0.2);
    const az = typeof Sky !== 'undefined' ? Sky.az : -0.2, sx = Math.sin(az), sz = -Math.cos(az), hl = Math.hypot(n[0], n[2]) || 1;
    const sunFace = (n[0] * sx + n[2] * sz) / hl * sm(0.05, 0.4, tn), day = typeof Sky !== 'undefined' ? sm(0.02, 0.12, Sky.sunElev) : 1;
    return mix5(c.powder, c.ridge, Math.abs(x - c.cx) - c.hw, tn, sunFace, 0, 0, 0, S.patch(x, z), S.patch(x + 311, z - 173), day);
  };
  function mix5(pw, ridge, edge, tn, sunFace, conc, den, mnt, pn, pn2, day) {
    const off = sm(-1, 6, edge), onRun = (1 - off) * (1 - sm(0.02, 0.12, mnt)), steep = sm(0.5, 0.8, tn);
    const wind = clamp(Math.max(ridge, clamp(-conc * 2.5, 0, 1) * sm(0.05, 0.3, mnt)), 0, 1) * (1 - den);
    let powder = Math.max(pw * (1 - 0.5 * steep), Math.max(off * 0.85, den * 0.9)) * (1 - 0.7 * wind);
    let ice = clamp(onRun * (1 - pw) * steep * sm(0.52, 0.72, pn) + wind * steep * sm(0.62, 0.8, pn) * 0.6, 0, 1);
    let wet = sm(0.15, 0.45, sunFace) * sm(0.3, 0.7, tn) * day * (1 - wind) * sm(0.38, 0.62, pn2);
    let crust = wind * (1 - powder), groom = onRun * (1 - pw) * (1 - wind);
    let s = powder + groom + crust + wet; if (s < 0.05) { powder += 0.05 - s; s = 0.05; }
    const k = (1 - ice) / s;
    out.powder = powder * k; out.groom = groom * k; out.crust = crust * k; out.wet = wet * k; out.ice = ice;
    return out;
  }
  // tracks (snr4): how deep a ski goes into firm snow, against the version's own depth (ice 0.1, crust 0.6, packed 1, powder 1, wet 1.8), and
  // how much of a berm it squeezes up along its sides (0..1)
  S.trackK = function (x, z) {
    if (!S.on('snr4')) return null;
    const w = U.sf[3] ? S.at(x, z) : { powder: 0.3, groom: 0.7, crust: 0, wet: 0, ice: 0 };
    return { depth: w.powder + w.groom + 0.6 * w.crust + 1.8 * w.wet + 0.1 * w.ice, berm: 0.55 * w.powder + 0.8 * w.groom + 0.35 * w.crust + 1.0 * w.wet };
  };
  return S;
})();

// the run's lie at a point (render space), from the table: (x - centre of the run, half width, powder, ridge). Vertex stage
const SNOW_VS_SSL = `
fn snowCourse(wp: vec3f) -> vec4f {
  let t: f32 = clamp((wp.z - M.sn.x) * M.sn.y, 0.0, ${(SnowLook.N - 1).toFixed(1)});
  var r: vec4f = vec4f(0.0);
${Array.from({ length: SnowLook.N }, (_, i) => `  r += M.ct${i} * max(1.0 - abs(t - ${i.toFixed(1)}), 0.0);`).join('\n')}
  return vec4f(wp.x - r.x, r.y, r.z, r.w);
}
`;
// fragment stage: which snow lies here, and the snow's light
const SNOW_SSL = `
struct SnowSt { w: vec4f, ice: f32, d: f32, }
fn snowPatch(p: vec2f) -> f32 {
  let k: f32 = 0.0061359232;
  return 0.5 + 0.5 * (0.5 * sin(k * (37.0 * p.x + 11.0 * p.y) + 1.3 * sin(k * (-13.0 * p.x + 29.0 * p.y))) + 0.3 * sin(k * (-23.0 * p.x + 41.0 * p.y) + 0.7) + 0.2 * sin(k * (53.0 * p.x - 47.0 * p.y) + 2.1));
}
// w = (powder, packed, wind crust, wet), ice: their shares (w sums to 1 - ice); d: the mean grain, mm.
// (snw: the run's lie, from the vertex stage; tn: tangent of the slope; sunFace: how far it is turned to the sun; conc: > 0 a hollow, < 0 a rib)
fn snowState(snw: vec4f, tn: f32, sunFace: f32, conc: f32, den: f32, mnt: f32, wxz: vec2f, day: f32) -> SnowSt {
  var s: SnowSt;
  let off: f32 = smoothstep(-1.0, 6.0, abs(snw.x) - snw.y); let onRun: f32 = (1.0 - off) * (1.0 - smoothstep(0.02, 0.12, mnt));
  let steep: f32 = smoothstep(0.5, 0.8, tn); let pw: f32 = snw.z;
  let pn: f32 = snowPatch(wxz); let pn2: f32 = snowPatch(wxz + vec2f(311.0, -173.0));
  let wind: f32 = saturate(max(snw.w, saturate(-conc * 2.5) * smoothstep(0.05, 0.3, mnt))) * (1.0 - den);
  var powder: f32 = max(pw * (1.0 - 0.5 * steep), max(off * 0.85, den * 0.9)) * (1.0 - 0.7 * wind);
  let ice: f32 = saturate(onRun * (1.0 - pw) * steep * smoothstep(0.52, 0.72, pn) + wind * steep * smoothstep(0.62, 0.8, pn) * 0.6);
  let wet: f32 = smoothstep(0.15, 0.45, sunFace) * smoothstep(0.3, 0.7, tn) * day * (1.0 - wind) * smoothstep(0.38, 0.62, pn2);
  let crust: f32 = wind * (1.0 - powder); let groom: f32 = onRun * (1.0 - pw) * (1.0 - wind);
  var sum: f32 = powder + groom + crust + wet;
  if (sum < 0.05) { powder += 0.05 - sum; sum = 0.05; }
  s.w = vec4f(powder, groom, crust, wet) * ((1.0 - ice) / sum); s.ice = ice;
  // grains, mm: new powder 0.1, packed 0.4, wind crust 0.3, wet 1.5, ice (as far as its colour goes) 3
  s.d = dot(s.w, vec4f(0.1, 0.4, 0.3, 1.5)) + 3.0 * ice;
  return s;
}
// Kokhanovsky & Bréon 2012: R0 of a semi-infinite layer of weakly absorbing grains (m0, m: cosines of the sun and the view to the surface;
// cth: cosine of the scattering angle, 1 = straight on forward). The phase function p is the fit for snow, theta in degrees
fn kbR0(m0: f32, m: f32, cth: f32) -> f32 {
  let th: f32 = acos(clamp(cth, -1.0, 1.0)) * 57.29578;
  let p: f32 = 11.1 * exp(-0.087 * th) + 1.1 * exp(-0.014 * th);
  return (1.247 + 1.186 * (m0 + m) + 5.157 * m0 * m + p) / (4.0 * (m0 + m));
}
fn kbU(m: f32) -> f32 { return 0.428571 * (1.0 + 2.0 * m); }
// the albedo of a single scattering path through the grains, per colour: exp(-sqrt(alpha l)), l = 11.38 d. alpha of ice (1/m) at about
// 630, 540 and 460 nm; d in mm
fn kbRs(d: f32) -> vec3f { return exp(-sqrt(vec3f(0.40, 0.065, 0.012) * (11.38e-3 * d))); }
// one glint per cell, as sparkLayer, but soft and never smaller than a pixel and a half: dimmer the wider it is, so the light each one
// gives is the same whatever the resolution (Wang & Bowles 2016). n: the sharpness of its lobe
fn sparkSoft(wxz: vec2f, cell: vec2f, N: vec3f, Hh: vec3f, ja: vec2f, jb: vec2f, idet: f32, n: f32) -> vec4f {
  let g: vec2f = wxz / cell; let id: vec2f = floor(g);
  let r: vec4f = texLod(tNoise, (id + 0.5) / 256.0, 0.0);
  let tilt: vec2f = (r.xz - 0.5) * (0.30 + 2.3 * r.y * r.y);
  let nn: vec3f = normalize(N + vec3f(tilt.x, 0.0, tilt.y));
  let d: f32 = max(dot(nn, Hh), 0.0);
  let w: vec2f = (g - id - 0.5 - (r.yw - 0.5) * 0.4) * cell;
  let px: vec2f = vec2f(w.x * jb.y - w.y * jb.x, w.y * ja.x - w.x * ja.y) * idet;
  let s2: f32 = 1.1 + 0.9 * r.w;                      // (its radius squared in pixels, about 1.0 to 1.4 px)
  let shape: f32 = exp(-dot(px, px) / s2) * (1.4 / s2);
  let tint: vec3f = mix(vec3f(1.0), 0.55 + 0.75 * cos(6.2832 * (r.z + vec3f(0.0, 0.33, 0.67))), 0.45 * r.x);
  return vec4f(tint, 1.0) * (pow(d, n) * shape * (n / 380.0));
}
`;
