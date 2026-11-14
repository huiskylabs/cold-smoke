// ---------------------------------------------------------------- Human: body parameters -> measurements
// A few numbers (sex, stature, mass, body fat, frame) become the measurements the body is built to: girths, breadths, landmark heights.
// All the numbers are from ANSUR II (US Army anthropometric survey, 2012, public release 2017; 4,082 men and 1,986 women), regressions fitted on the
// raw CSVs (see research/03_body_shape.md). Lengths in metres, mass in kg. sex: 0 = male, 1 = female (a blend, for the mannequin's shape only).
(() => {
  const lerp = (a, b, t) => a + (b - a) * t;
  // girth = c0 + cS * S(mm) + cM * kg  (male, female)
  const REG = {
    chest:   [[1036, -0.291, 6.23], [990, -0.329, 7.27]],
    waist:   [[1025, -0.436, 7.96], [1014, -0.472, 9.08]],
    buttock: [[808, -0.140, 5.35], [847, -0.178, 6.86]],
    thigh:   [[595, -0.184, 4.13], [584, -0.194, 5.14]],
    calf:    [[351, -0.068, 1.89], [306, -0.051, 2.23]],
    biceps:  [[380, -0.122, 2.25], [341, -0.140, 2.83]],    // flexed: the relaxed arm is taken as 0.9 of it
    neck:    [[408, -0.085, 1.63], [306, -0.047, 1.48]],
    biacromial: [[205, 0.092, 0.59], [132, 0.128, 0.36]],
  };
  // + 1 % body fat at the same stature and mass (mm): fat moves out of the limbs' muscle and into the trunk (men) or hips and thighs (women)
  const BF = { biceps: [-2.2, -0.7], forearm: [-1.7, -1.1], calf: [-1.0, -1.8], thigh: [0.1, 2.1], chest: [1.8, 2.7], buttock: [1.3, 2.9], waist: [2.5, 1.5] };
  const BF_MEAN = [21.7, 30];          // (the women's 36 % from the Navy formula is an overestimate; 30 is used as their centre)
  // landmark heights as a fraction of stature (male, female)
  const LM = { c7: [0.864, 0.857], notch: [0.819, 0.816], acromion: [0.820, 0.820], nipple: [0.735, 0.719], rib10: [0.638, 0.648], crest: [0.604, 0.611],
    navel: [0.601, 0.602], troch: [0.513, 0.519], crotch: [0.482, 0.480], patella: [0.278, 0.276], tibiale: [0.266, 0.269], malleolus: [0.042, 0.039] };
  // means for the measures with no regression (mm at the sexes' mean stature and mass): scaled as girth ~ sqrt(mass / stature)
  const MEAN = { S: [1756, 1629], kg: [85.5, 67.8], forearm: [310 * 0.9, 264 * 0.9], wrist: [176, 155], ankle: [229, 216], lowthigh: [409, 401],
    foot: [271, 246], footB: [102, 93], hand: [193, 181], head: [574, 561], headB: [154, 148], headL: [200, 190], hip: [346, 354], bicristal: [275, 273] };

  Human.DEFAULTS = { sex: 0, stature: 1.756, mass: 75, bodyFat: 18, frame: 0 };
  Human.PRESETS = { male: { sex: 0, stature: 1.756, mass: 75, bodyFat: 18, frame: 0 }, female: { sex: 1, stature: 1.629, mass: 60, bodyFat: 27, frame: 0 } };

  Human.measure = (p = {}) => {
    p = Object.assign({}, Human.DEFAULTS, p);
    const s = Human.clamp(p.sex, 0, 1), S = p.stature * 1000, kg = p.mass;
    const reg = k => { const [m, f] = REG[k]; return lerp(m[0] + m[1] * S + m[2] * kg, f[0] + f[1] * S + f[2] * kg, s); };
    const dBF = p.bodyFat - lerp(BF_MEAN[0], BF_MEAN[1], s);
    const bf = k => BF[k] ? lerp(BF[k][0], BF[k][1], s) * dBF : 0;
    const mean = k => lerp(MEAN[k][0], MEAN[k][1], s);
    const sc = Math.sqrt((kg / mean('kg')) / (S / mean('S')));     // girth scale for the measures with no regression
    const G = {                                                   // girths, mm
      chest: reg('chest') + bf('chest'), waist: reg('waist') + bf('waist'), buttock: reg('buttock') + bf('buttock'), thigh: reg('thigh') + bf('thigh'),
      calf: reg('calf') + bf('calf'), arm: 0.9 * reg('biceps') + bf('biceps'), neck: reg('neck'),
      forearm: mean('forearm') * sc + bf('forearm'), wrist: mean('wrist') * Math.sqrt(sc), ankle: mean('ankle') * Math.sqrt(sc), lowthigh: mean('lowthigh') * sc + 0.5 * bf('thigh'),
    };
    const B = {                                                   // breadths and lengths, mm
      biacromial: reg('biacromial') * (1 + 0.06 * p.frame), hip: mean('hip') * Math.sqrt(sc) + bf('buttock') * 0.4, bicristal: mean('bicristal') * (S / mean('S')),
      foot: mean('foot') * S / mean('S'), footB: mean('footB') * S / mean('S'), hand: mean('hand') * S / mean('S'),
      headB: mean('headB') * Math.pow(S / mean('S'), 0.3), headL: mean('headL') * Math.pow(S / mean('S'), 0.3),
    };
    const L = {}; for (const k in LM) L[k] = lerp(LM[k][0], LM[k][1], s) * S;
    // density 1.06 kg/L at ~18 % fat (Siri: 1 / D = 4.95 / (%BF/100 + 4.5)) -> the volume the body must hold
    const dens = 4.95 / (p.bodyFat / 100 + 4.5);
    return { p, sex: s, S, kg, bfDelta: dBF, G, B, L, density: dens, volume: kg / dens /* litres */ };
  };
})();
