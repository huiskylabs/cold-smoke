// ---------------------------------------------------------------- the nebula: a sheet of glowing gas far beyond the sky, faintly there even at noon
// Structure is computed once (domain-warped noise -> two small textures); at runtime the sky shader only does three fetches:
// the structure is carried along a flow field (two-phase advection, so it never smears) and bands of light travel outward from the core.
const Nebula = (() => {
  const N = { res: 768, az: 0.17, el: 0.31, half: 0.50, roll: -0.20, gain: 1, stars: 0.45 };
  let gfx, texA, texB, tA, tB, pipeA, pipeB;
  N.init = function (g, res) {
    gfx = g; if (res) N.res = res;
    texA = gfx.texture({ w: N.res, h: N.res, format: 'rgba8', filter: 'linear', wrap: 'clamp' }); tA = gfx.target({ color: texA });
    texB = gfx.texture({ w: 256, h: 256, format: 'rgba8', filter: 'linear', wrap: 'clamp' }); tB = gfx.target({ color: texB });
    N.texA = texA; N.texB = texB;
    const mk = (name, fs) => gfx.pipeline({ name, lib: [SL.common, SL.hash, SL.noise, SL.tnoise, NEB_FIELD_SSL], buffers: [], varyings: { uv: 'vec2f' }, uniforms: { p: 'vec4f' }, textures: { tNoise: '2d' },
      colorFormat: 'rgba8', depth: false, depthTest: false, cull: 'none', vs: VS_FULLSCREEN, fs });
    pipeA = mk('nebBakeA', `fn frag(v: VOut) -> FOut { var o: FOut; o.color = nebStructure(vec2f(v.uv.x * 2.0 - 1.0, 1.0 - v.uv.y * 2.0)); return o; }`);
    pipeB = mk('nebBakeB', `fn frag(v: VOut) -> FOut { var o: FOut; o.color = nebFlow(vec2f(v.uv.x * 2.0 - 1.0, 1.0 - v.uv.y * 2.0)); return o; }`);
    N.pipes = [pipeA, pipeB];
  };
  N.bake = function () {
    gfx.beginPass(tA, { color: [0, 0, 0, 0] }); gfx.draw(pipeA, { u: { p: [0, 0, 0, 0] }, tex: { tNoise: Tex.noise }, count: 3 }); gfx.endPass();
    gfx.beginPass(tB, { color: [0, 0, 0, 0] }); gfx.draw(pipeB, { u: { p: [0, 0, 0, 0] }, tex: { tNoise: Tex.noise }, count: 3 }); gfx.endPass();
    N.baked = true;
  };
  // basis of the patch of sky the nebula lives on (world-fixed): forward toward its centre, right/up rolled a little so it hangs at an angle
  // (two hangings: lying along the horizon for a wide picture, standing up for a tall one)
  N.wide = { az: 0.40, el: 0.215, half: 0.47, roll: 0.55 }; N.tall = { az: 0.17, el: 0.31, half: 0.50, roll: -0.20 };
  N.basis = function () {
    Object.assign(N, Render.W >= Render.H ? N.wide : N.tall);
    const ce = Math.cos(N.el), f = [Math.sin(N.az) * ce, Math.sin(N.el), -Math.cos(N.az) * ce];
    let r = v3.norm(v3.cross(f, [0, 1, 0])), u = v3.cross(r, f);
    const c = Math.cos(N.roll), s = Math.sin(N.roll), r2 = v3.add(v3.mul(r, c), v3.mul(u, s)), u2 = v3.sub(v3.mul(u, c), v3.mul(r, s));
    return { nr: [...r2, 1 / N.half], nu: [...u2, N.gain], nf: [...f, N.stars] };
  };
  return N;
})();

// ---- the shape of the thing (bake time only)
// Laid out in polar coordinates round the young stars at its heart: gas streams outward in two unequal wings, combed into fibres,
// with bright shells where the starlight eats into it and a bay of dark dust on one side. Then the whole pattern is folded three
// times by a curl field, the way ink folds in water, so nothing stays straight.
const NEB_FIELD_SSL = `
fn nfb(p: vec2f, z: f32) -> f32 {
  var q: vec3f = vec3f(p, z); var s: f32 = 0.5 * vnoise3(q); q = vec3f(q.xy * 2.03 + vec2f(13.1, 7.7), q.z + 3.7);
  s += 0.25 * vnoise3(q); q = vec3f(q.xy * 2.03 + vec2f(13.1, 7.7), q.z + 3.7);
  s += 0.125 * tnoise3(q); q = vec3f(q.xy * 2.03 + vec2f(13.1, 7.7), q.z + 3.7);
  s += 0.0625 * tnoise3(q); q = vec3f(q.xy * 2.03 + vec2f(13.1, 7.7), q.z + 3.7);
  s += 0.03125 * tnoise3(q);
  return s / 0.96875;
}
const NEB_CORE: vec2f = vec2f(0.02, -0.04);
fn nebThin(n: f32, pw: f32) -> f32 { return pow(1.0 - abs(2.0 * n - 1.0), pw); }
fn nebRot(v: vec2f, a: f32) -> vec2f { let c: f32 = cos(a); let s: f32 = sin(a); return vec2f(v.x * c - v.y * s, v.x * s + v.y * c); }
fn nebPotl(p: vec2f, z: f32) -> f32 { return vnoise3(vec3f(p, z)) + 0.5 * vnoise3(vec3f(p * 2.1 + vec2f(5.0, 3.0), z + 2.0)); }
fn nebCurl(p: vec2f, z: f32) -> vec2f {
  let e: f32 = 0.05;
  return vec2f(nebPotl(p + vec2f(0.0, e), z) - nebPotl(p - vec2f(0.0, e), z), nebPotl(p - vec2f(e, 0.0), z) - nebPotl(p + vec2f(e, 0.0), z)) / (2.0 * e);
}
fn nebFold(p: vec2f) -> vec2f {
  let k: f32 = 0.42 + 0.58 * smoothstep(0.04, 0.55, length(p - NEB_CORE));          // orderly near the stars, stirred further out
  var q: vec2f = p;
  q += nebCurl(q * 0.75 + vec2f(6.2, 3.3), 13.5) * (0.085 * k);
  q += nebCurl(q * 1.4 + vec2f(1.7, 9.2), 1.5) * (NEB_FOLD.x * k);
  q += nebCurl(q * 3.1 + vec2f(8.3, 2.8), 5.5) * (NEB_FOLD.y * k);
  q += nebCurl(q * 6.7 + vec2f(4.1, 6.6), 9.5) * (NEB_FOLD.z * k);
  return q;
}
// how far the gas reaches in a given direction: one long wing, a shorter one opposite, a halo all round
fn nebReach(dir: vec2f) -> f32 {
  let a: f32 = pow(saturate(dot(dir, vec2f(-0.75, 0.66)) * 0.5 + 0.5), 3.4);
  let b: f32 = pow(saturate(dot(dir, vec2f(0.62, -0.78)) * 0.5 + 0.5), 4.0);
  return 0.20 + 0.86 * a + 0.52 * b;
}
// a front where starlight meets the gas: knife-sharp on the outside, glowing away inward
fn nebFront(d: f32, w: f32) -> f32 { return select(exp(d / (w * 5.0)), exp(-d * d / (w * w)), d > 0.0); }
fn nebSpike(p: vec2f, c: vec2f, r: f32) -> f32 { let d: vec2f = (p - c) / r; return exp(-dot(d, d) * 6.0) + 0.5 * exp(-abs(d.x) * 2.2 - abs(d.y) * 22.0) + 0.5 * exp(-abs(d.y) * 2.2 - abs(d.x) * 22.0); }
fn nebStructure(p: vec2f) -> vec4f {
  let q: vec2f = nebFold(p);
  let rd: vec2f = q - NEB_CORE; let r: f32 = length(rd); let dir: vec2f = rd / max(r, 1e-4);
  let x: f32 = r / nebReach(dir);                                         // 0 at the stars, 1 where the gas gives out
  let tw: vec2f = nebRot(dir, 1.0 * r);                                   // the arms trail round as they go out
  // ---- glowing gas: fibres combed outward along the arms, over broad billows
  let g1: f32 = nfb(tw * 2.3 + vec2f(2.0, 7.0), r * 1.8 + 30.5); let g2: f32 = nfb(q * 2.6 + vec2f(6.0, 1.0), 34.5);
  let gf: f32 = g1 * 0.6 + g2 * 0.4 + 0.33 * (1.0 - x);
  var gas: f32 = smoothstep(0.42, 0.80, gf) * smoothstep(1.08, 0.30, x);
  // ---- dark dust: a bay cutting in from one side toward the core, and lanes folded through the wings
  let bay: f32 = pow(saturate(dot(dir, vec2f(0.80, 0.60)) * 0.5 + 0.5), 5.0) * smoothstep(0.03, 0.14, r) * smoothstep(0.75, 0.2, r);
  let d1: f32 = nfb(q * 2.4 + vec2f(5.0, 5.0), 90.5) * 0.65 + nfb(tw * 3.0 + vec2f(1.0, 8.0), r * 2.5 + 94.5) * 0.35 + 0.34 * bay;
  let dust: f32 = smoothstep(0.545, 0.60, d1) * smoothstep(0.04, 0.16, r);
  // ---- threads: knife-thin, some combed along the arms, some loose and folded, gathered into braids
  let n1: f32 = vnoise3(vec3f(tw * 6.5 + vec2f(1.0, 3.0), r * 2.4 + 60.5));
  let n2: f32 = vnoise3(vec3f(tw * 14.0 + vec2f(7.0, 2.0), r * 4.5 + 70.5));
  let n3: f32 = tnoise3(vec3f(q * 8.5 + vec2f(3.0, 9.0), 75.5));
  let n4: f32 = tnoise3(vec3f(q * 19.0 + vec2f(13.0, 4.0), 78.5));
  let r1: f32 = nebThin(n1, 10.0); let r2: f32 = nebThin(n2, 8.0); let r3: f32 = nebThin(n3, 9.0); let r4: f32 = nebThin(n4, 7.0);
  let braid: f32 = smoothstep(0.36, 0.62, nfb(q * 1.9 + vec2f(4.0, 9.0), 55.5));
  var fil: f32 = (r1 + 0.7 * r2 * (0.4 + 0.8 * r1 + 0.5 * braid) + 0.75 * r3 * braid + 0.35 * r4 * (0.3 + r3)) * (0.25 + 0.75 * braid);
  // ---- shells: three broken arcs at different distances, and the lit rims of the dust
  let wob: f32 = nfb(q * 2.0 + vec2f(11.0, 3.0), 40.5) - 0.5;
  let am: f32 = nfb(tw * 1.6 + vec2f(3.0, 5.0), 44.5); let am2: f32 = nfb(tw * 1.6 + vec2f(9.0, 2.0), 47.5);
  var front: f32 = nebFront(x + 0.30 * wob - 0.26, 0.016) * smoothstep(0.40, 0.56, am)
                 + nebFront(x + 0.42 * wob - 0.52, 0.018) * smoothstep(0.62, 0.46, am) * 0.8
                 + nebFront(x + 0.55 * wob - 0.84, 0.022) * smoothstep(0.38, 0.55, am2) * 0.6;
  front += exp(-sq((d1 - 0.535) / 0.012)) * smoothstep(0.04, 0.16, r) * 0.8;
  gas *= 1.0 - 0.90 * dust; fil *= 1.0 - 0.95 * dust; front *= 1.0 - 0.6 * dust * (1.0 - exp(-sq((d1 - 0.535) / 0.012)));
  // which gas: 0 = hydrogen rose by the stars, 1 = oxygen teal out on the rim
  let hue: f32 = saturate(1.15 * x - 0.22 + (nfb(q * 1.7 + vec2f(9.0, 1.0), 80.5) - 0.5) * 1.3);
  // ---- the hot young stars that light it all (diffraction spikes and all); they are not folded
  var str: f32 = nebSpike(p, NEB_CORE + vec2f(0.004, 0.006), 0.030) + 0.85 * nebSpike(p, NEB_CORE + vec2f(0.040, 0.027), 0.019) + 0.75 * nebSpike(p, NEB_CORE + vec2f(-0.039, -0.014), 0.017) + 0.65 * nebSpike(p, NEB_CORE + vec2f(0.012, -0.047), 0.015);
  str += 0.55 * nebSpike(p, vec2f(-0.33, 0.21), 0.012) + 0.5 * nebSpike(p, vec2f(-0.52, 0.52), 0.011) + 0.45 * nebSpike(p, vec2f(0.30, -0.36), 0.011) + 0.4 * nebSpike(p, vec2f(-0.20, -0.20), 0.010) + 0.4 * nebSpike(p, vec2f(0.22, 0.30), 0.010);
  let edge: f32 = smoothstep(1.0, 0.86, max(abs(p.x), abs(p.y)));
  let near: f32 = 0.22 + 0.78 * exp(-x * 2.4);                            // brightest by the stars
  let reach: f32 = smoothstep(1.30, 0.55, x) * (0.30 + 0.70 * exp(-x * 1.4));   // threads run on past where the glow gives out
  return vec4f(saturate(gas * near * 1.1) * edge, saturate((fil * 0.75 + front * 0.8) * reach) * edge, hue, saturate(str * edge));
}
fn nebFlow(p: vec2f) -> vec4f {
  let q: vec2f = nebFold(p);
  let rd: vec2f = q - NEB_CORE; let r: f32 = length(rd); let dir: vec2f = rd / max(r, 1e-4);
  let x: f32 = r / nebReach(dir);
  // the gas streams outward along the trailing arms, with a slow swirl on top
  let fl: vec2f = nebRot(dir, 0.55) * (0.25 + 0.75 * smoothstep(0.0, 0.3, r)) * 0.7 + nebCurl(p * 1.6 + vec2f(3.0, 8.0), 100.5) * 0.16;
  // phase of the travelling light: distance out from the stars, roughened so the bands are not rings
  let ph: f32 = saturate(0.08 + 0.62 * x + 0.16 * (nfb(q * 2.2 + vec2f(2.0, 6.0), 110.5) - 0.5));
  let dc: f32 = length(p - NEB_CORE);
  let core: f32 = 0.85 * exp(-sq(dc / 0.045)) + 0.30 * exp(-sq(dc / 0.16));
  return vec4f(saturate(fl * 0.5 + 0.5), ph, saturate(core * (0.55 + 0.9 * nfb(p * 6.0, 120.5))));
}
`.replace(/NEB_FOLD/g, 'vec3f(0.10, 0.045, 0.020)');

// ---- runtime: looked up by the sky shader
const NEBULA_SSL = `
// returns emitted colour (rgb) of the nebula in direction d
fn nebula(d: vec3f, tm: f32) -> vec4f {
  let z: f32 = dot(d, M.nf.xyz);
  if (z < 0.3) { return vec4f(0.0); }
  let p: vec2f = vec2f(dot(d, M.nr.xyz), dot(d, M.nu.xyz)) / z * M.nr.w;
  if (abs(p.x) >= 1.0 || abs(p.y) >= 1.0) { return vec4f(0.0); }
  let uv: vec2f = vec2f(p.x, -p.y) * 0.5 + 0.5;
  let fb: vec4f = texLod(tNebB, uv, 0.0);
  let flow: vec2f = (fb.xy - 0.5) * vec2f(1.0, -1.0) * 0.03;
  let ph: f32 = fract(tm * 0.021); let ph2: f32 = fract(ph + 0.5);
  let a0: vec4f = texLod(tNebA, uv - flow * (ph - 0.5), 0.0); let a1: vec4f = texLod(tNebA, uv - flow * (ph2 - 0.5), 0.0);
  let a: vec4f = mix(a0, a1, abs(2.0 * ph - 1.0));
  // bands of light running outward along the gas
  let s: f32 = fb.z;
  let w1: f32 = 0.5 + 0.5 * sin(6.2832 * (s * 5.0 - tm * 0.085)); let w2: f32 = 0.5 + 0.5 * sin(6.2832 * (s * 11.0 - tm * 0.13) + 1.7);
  let pulse: f32 = 0.35 + 1.3 * w1 * w1 * w1 + 0.45 * w2 * w2;
  let rose: vec3f = vec3f(1.00, 0.26, 0.44); let violet: vec3f = vec3f(0.46, 0.32, 1.00); let teal: vec3f = vec3f(0.14, 0.95, 0.84); let gold: vec3f = vec3f(1.00, 0.76, 0.46);
  var col: vec3f = mix(rose, violet, smoothstep(0.30, 0.90, a.z)) * a.x * (0.8 + 0.4 * pulse) * 0.55;
  col += mix(mix(gold, rose, 0.5), teal, smoothstep(0.30, 0.62, a.z)) * a.y * pulse * 1.25;
  col += vec3f(1.0, 0.86, 0.80) * fb.w * (1.5 + 0.3 * w2);
  // the stars are not advected (sample without flow) and scintillate a little
  let st: f32 = texLod(tNebA, uv, 0.0).w;
  col += vec3f(0.90, 0.95, 1.0) * st * (0.8 + 0.2 * sin(tm * 3.3 + p.x * 57.0 + p.y * 31.0)) * 2.0 * M.nf.w;
  return vec4f(col, 1.0);
}
`;
