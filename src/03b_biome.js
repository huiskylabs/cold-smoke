// ---------------------------------------------------------------- vegetation: what kind of mountain this seed grew
// Real ski mountains are not wooded at random. Four rules decide what grows where (see the owner's plan, 植被群系):
//   1. belts by height: broadleaf or mixed wood low down, conifers above, a band of stunted or deciduous trees at the tree line, bare
//      above it. Our run only ever goes down, so it passes through those belts: Biome.alt(s) is how high up the mountain the run is at
//      distance s (1 above the tree line .. 0 deep in the valley wood), a slow swell of a few kilometres that starts high;
//   2. where the tree line lies (each kind of mountain its own, and every seed a little different);
//   3. in cold, wet places the trees carry rime and snow until they are white coral (Hakuba, Zao, Jilin); in dry ones they shed it;
//   4. which trees: each kind of mountain has its own species and its own mix.
// The point is not botany but that every mountain feels different: a seed picks one of the kinds below and then turns its own knobs
// (how thick the wood, where the tree line, how much rime), so no two visits are alike. The same seed is always the same mountain.
// The owner's choice 'biome' (植被): a as it was (every mountain the same mixed wood, the version 'tvar' decides), b by seed, c-f one kind
// held for every seed (to look at each in turn). The first mountain (seed HOME) stays as it was under b too.
//   Biome.cur() -> the kind in force (null: as it was); .alt(s); .density(s, e); .height(s); .name()
const Biome = (() => {
  const B = {};
  // kind: names, how often a seed picks it, how thick the wood (x the course's), where the tree line lies on alt (0..1), how much rime and
  // snow the trees carry (1 = as before), and the weather it leans to (how much of the time it snows hard)
  const KINDS = {
    alps:  { zh: '阿尔卑斯 · 云杉落叶松', en: 'Alpine spruce and larch', w: 0.30, dens: 1.0, line: 0.78, rime: 0.0, load: 1.0, wet: 0.0 },
    japan: { zh: '日本 · 岳桦雾凇', en: 'Japanese birch in rime', w: 0.27, dens: 1.1, line: 0.86, rime: 1.0, load: 1.25, wet: 0.85 },
    china: { zh: '东北 · 白桦林', en: 'Manchurian birch wood', w: 0.25, dens: 1.0, line: 0.84, rime: 0.55, load: 0.9, wet: 0.45 },
    bare:  { zh: '高山 · 林线之上', en: 'Above the tree line', w: 0.18, dens: 0.16, line: 0.0, rime: 0.3, load: 1.15, wet: 0.2 },
  };
  const ORDER = ['alps', 'japan', 'china', 'bare'];
  B.KINDS = KINDS; B.ORDER = ORDER;
  if (typeof Variants !== 'undefined') Variants.def('biome', '植被', [['a', '现在的'], ['b', '随种子'], ['c', '阿尔卑斯'], ['d', '岳桦雾凇'], ['e', '东北白桦'], ['f', '高山无树']], 'b');
  const FORCE = { c: 'alps', d: 'japan', e: 'china', f: 'bare' };
  let key = '', cur = null;
  // what this seed grew (and its own turns of the knobs: every seed a little thicker or thinner, its tree line higher or lower, more or
  // less rime, and the swell of the belts its own length and phase)
  B.cur = function () {
    const vv = typeof Variants !== 'undefined' ? Variants.val.biome : 'a', seed = typeof Course !== 'undefined' ? Course.seed : 0, k = vv + ':' + seed;
    if (k === key) return cur;
    key = k; cur = null;
    if (vv === 'a' || vv === undefined || (vv === 'b' && seed === 261111)) return cur;
    const r = RNG(hashU(seed * 7 + 0x6b1e)), r0 = r();
    let id = FORCE[vv];
    if (!id) { let acc = 0; id = ORDER[ORDER.length - 1]; for (const n of ORDER) { acc += KINDS[n].w; if (r0 < acc) { id = n; break; } } }
    const K = KINDS[id];
    cur = Object.assign({ id, seed }, K, {
      dens: K.dens * (0.92 + 0.25 * r()),
      line: K.line + (id === 'bare' ? 0 : 0.10 * (r() - 0.5)),
      rime: id === 'alps' ? 0 : clamp(K.rime * (0.75 + 0.5 * r()), 0, 1.15),
      load: K.load * (0.85 + 0.3 * r()),
      // (the run starts at or a little below the tree line, never on the bare tops: the owner found the first stretch far too thin)
      wave: 2600 + 1800 * r(), phase: 0.16 + 0.10 * r(),
    });
    return cur;
  };
  // how high up the mountain the run is at s: starts high (above or at the tree line), and swells down and up again over a few kilometres
  B.alt = function (s) {
    const c = B.cur(); if (!c) return 0.5;
    const q = Math.max(0, s) / c.wave + c.phase;
    return clamp(0.5 + 0.5 * Math.cos(TAU * q) + 0.08 * vnoise1(s / 500 + 3.3, 4441), 0, 1);
  };
  // how far above the tree line (0 below it .. 1 well above)
  B.above = (s, c) => c.id === 'bare' ? 1 : smooth(c.line - 0.07, c.line + 0.07, B.alt(s));
  // the course's tree density is multiplied by this: the kind's own thickness, and above the tree line only scattered stunted trees
  B.density = function (s) {
    const c = B.cur(); if (!c) return 1;
    return c.dens * lerp(1, 0.5, B.above(s, c));
  };
  // and their height: stunted only right at and above the tree line (below it they stand full height)
  B.height = function (s) {
    const c = B.cur(); if (!c) return 1;
    return lerp(1, 0.7, smooth(c.line - 0.04, c.line + 0.1, B.alt(s)));
  };
  // how pale the forest seen from afar is: 0 dark conifers .. 1 white rime-coated birch
  B.pale = function () { const c = B.cur(); if (!c) return 0; return c.id === 'japan' ? 0.75 + 0.25 * Math.min(1, c.rime) : c.id === 'china' ? 0.55 : 0; };
  // a birch wood grows in stands: thickets where seed fell well, gaps between them (an orchard of even rows is what it must not look like)
  B.wild = () => { const c = B.cur(); return !!c && (c.id === 'japan' || c.id === 'china'); };
  B.clump = function (x, z) {
    if (!B.wild()) return 1;
    const n = vnoise2(x / 17, z / 17, 0x5a1d ^ cur.seed) * 0.75 + vnoise2(x / 6.5, z / 6.5, 0x77e1 ^ cur.seed) * 0.25;
    return 0.06 + 1.6 * smooth(-0.18, 0.22, n);
  };
  // how tall a tree of a birch wood stands: tallest in the middle of a stand (the old trees), young ones round its edges and out in the
  // gaps, and here and there an old giant by itself. Gives the wood a shape the eye can read instead of an even carpet
  B.stature = function (x, z, r) {
    if (!B.wild()) return 1;
    const n = vnoise2(x / 17, z / 17, 0x5a1d ^ cur.seed) * 0.75 + vnoise2(x / 6.5, z / 6.5, 0x77e1 ^ cur.seed) * 0.25;
    return lerp(0.55, 1.25, smooth(-0.15, 0.45, n)) * (r > 0.93 ? 1.35 : 1);
  };
  B.name = function (zh) { const c = B.cur(); if (!c) return ''; return zh ? c.zh : c.en; };
  return B;
})();
