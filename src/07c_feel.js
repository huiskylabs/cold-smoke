// ---------------------------------------------------------------- feel: what the skiing does to the lens and to the air
// Nothing is drawn here. Once a frame (from tick, before the frame's globals are worked out) this sets what the lens in 09_post.js and
// the renderer's weather hooks read: how fast (a longer shutter, colour fringes and darker edges toward the sides of the frame, a tremor
// in the camera), snow thrown onto the glass by a landing, a bough or a fall, the air of each kind of run, and the look of slow motion.
// All of it is eased and runs on the game's time, so in slow motion it slows with the world; only the glass dries in real seconds.
const Feel = (() => {
  const F = { speed: 0, slow: 0, timeK: 1, air: [1, 1, 1], base: [1, 1, 0.00016], wrote: [], goal: 0, pend: null, since: 99, runT: 0, px: 0, pz: 0, init: false };
  // the speeds (m/s) between which the lens goes from calm to flat out, the tremor of the camera at full speed (m), how long a wet glass takes to dry (s)
  F.v0 = 22; F.v1 = 40; F.shake = 0.018; F.dry = 1.5;
  // the shutter (s) and the longest streak it may leave (picture heights), calm and flat out
  F.shut = [1 / 90, 1 / 50]; F.blur = [0.045, 0.11];
  // the air of each kind of run, in multiples of the plain day's: [snow the wind carries along the ground, glitter hanging in the air, haze].
  // The ridge stands in the wind; among the trees and in deep powder the air is full of crystals; the gully holds the cold and its mist
  // (the haze is a far one: what shows is the slopes beyond going pale)
  F.AIR = { ridge: [5, 1, 1], glade: [1, 2.5, 1], powder: [1, 2.5, 1], gully: [1, 1, 4] };
  const PLAIN = [1, 1, 1], HOOK = ['drift', 'dust', 'fogDensity'], DAY = [1, 1, 0.00016];

  // snow reaches the glass: how much (0..1: it is also how long it stays, 1 = F.dry seconds), from which side of the frame (-1 left .. 1 right)
  // and how much of it from below (0..1). On dry glass it lands as a new scatter of beads; on wet glass the ones there swell again
  F.splash = function (a, x, y) {
    if (!(F.goal > 0.02)) { Post.wetSeed = (Post.wetSeed + 1) % 61; Post.wetAge = 0; Post.wetBias[0] = x || 0; Post.wetBias[1] = y || 0; }
    F.goal = Math.max(F.goal, sat(a)); Post.wetNew = 1;
  };

  F.update = function (dt) {
    // ts: how much slower than life a jump's slow motion runs; tk: that, and the world being taken up again after a pause (App.resumeK, the
    // interface's, where there is one); rdt: real seconds
    const S = Game.s, st = App.state, run = Game.mode === 'run', ts = clamp(Game.timeScale || 1, 0.05, 1), tk = ts * clamp(App.resumeK || 1, 0.05, 1), rdt = dt / tk;
    // a new run, or the skier set down somewhere else: that is a cut, and after a cut things simply are what the place makes them
    const cut = !F.init || Game.runT < F.runT || Math.hypot(S.p[0] - F.px, S.p[2] - F.pz) > 15; F.init = true; F.runT = Game.runT; F.px = S.p[0]; F.pz = S.p[2];

    // ---- speed. From about 80 km/h to 145 the edges of the frame begin to tear (Post reads `speed`) and the camera trembles a little in
    // the wind: added through Game.shake, which the chase camera already reads (a blow that set it higher keeps its own).
    // (The speed through the air, not S.speed along the snow, which dips for a few steps wherever the snow under the skis tips over a lip.)
    const kv = run ? smooth(F.v0, F.v1, Math.hypot(S.v[0], S.v[1], S.v[2])) : 0;
    F.speed = cut ? kv : damp(F.speed, kv, kv > F.speed ? 2.5 : 5, dt); Post.speed = F.speed;
    if (run) Game.shake = Math.max(Game.shake, F.shake * F.speed);

    // ---- slow motion: its look follows the time scale itself, so it comes and goes exactly as time does. (Eased once more over a few
    // real frames, in case time is ever let go in one step.)
    F.slow = cut ? smooth(1, 0.4, ts) : damp(F.slow, smooth(1, 0.4, ts), 14, rdt); F.timeK = cut ? tk : damp(F.timeK, tk, 14, rdt);
    Post.slow = F.slow;

    // ---- the shutter. At speed it stays open longer and the streaks may run further: the edges tear, what rides with the lens stays sharp.
    // In slow motion the camera is a high-speed one, its shutter as much shorter as time is slower (the frame's dt is the world's time, so
    // without this every streak would keep its full-speed length while the motion itself shrank: a smear), and what hangs in the air hangs
    // sharp. (The thrown snow's own streaks read Post.shutter too, so they keep step with the ground's.)
    Post.shutter = lerp(F.shut[0], F.shut[1], F.speed) * F.timeK; Post.blurMax = lerp(F.blur[0], F.blur[1], F.speed);

    // ---- each kind of run has its own air. It changes over a few seconds as the next run comes up (looked for a second ahead, so it is
    // there when the skier is). The wind itself is never touched: the falling snow is placed by wind x time and would jump.
    // (The three hooks are shared: if another hand has written one since my last frame, a switch for heavier snow say, that value is the
    // plain day mine multiplies; cleared again, it is the renderer's own default.)
    const a = F.AIR[Course.segAt(-S.p[2] + S.speed).type] || PLAIN;
    for (let i = 0; i < 3; i++) {
      const k = HOOK[i], v = st[k]; if (v == null) F.base[i] = DAY[i]; else if (v !== F.wrote[i]) F.base[i] = v;
      F.air[i] = cut ? a[i] : damp(F.air[i], a[i], 0.7, dt);
      st[k] = F.wrote[i] = F.base[i] * F.air[i];
    }

    // ---- snow on the glass: a landing harder than 5 m/s throws it up from below (all of it from 14 m/s), a bough or a trunk sheds it from its own side. Read from
    // the frame's events (before tick clears them). The lens rides a few metres behind the skier and meets that snow a moment later; a lens
    // that stands well off (the long one, 25 m away) stays dry
    if (cut) { F.goal = 0; F.pend = null; F.since = 99; Post.wet = 0; Post.wetNew = 0; }
    for (const e of Game.events) {
      let w = 0, x = 0, y = 0;
      if (e.type === 'land' && e.v > 5) { w = lerp(0.5, 1, sat((e.v - 5) / 9)); y = 1; }
      else if (e.type === 'brush' || e.type === 'crash') { const r = Render.cam.right; x = sign((e.x - S.p[0]) * r[0] + (e.z - S.p[2]) * r[2]); w = e.type === 'crash' ? 1 : 0.55; y = 0.25; }
      const c = Render.cam.pos; w *= smooth(16, 9, Math.hypot(c[0] - S.p[0], c[1] - S.p[1], c[2] - S.p[2]));
      if (w > 0 && (!F.pend || w >= F.pend.w)) F.pend = { t: clamp(Math.hypot(c[0] - S.p[0], c[2] - S.p[2]) / Math.max(S.speed, 3), 0.03, 0.3), w, x, y };
    }
    // (where one landing follows another, a field of rollers, the glass is not wet all the way down: what comes within a few seconds of
    // the last lot is less than half of it, unless it is a hard one)
    F.since += rdt;
    if (F.pend && (F.pend.t -= dt) <= 0) { const w = F.pend.w; F.splash(w * lerp(lerp(0.45, 1, smooth(1.5, 7, F.since)), 1, smooth(0.75, 1, w)), F.pend.x, F.pend.y); F.since = 0; F.pend = null; }
    // (it comes onto the glass over a few frames, not in one, and dries in real time: a held-back second does not keep the lens wet)
    F.goal = Math.max(0, F.goal - rdt / F.dry);
    Post.wet = Post.wet < F.goal ? Math.min(F.goal, Post.wet + rdt / 0.07) : F.goal;
    if (Post.wet > 0) Post.wetAge += rdt; Post.wetNew = Math.max(0, Post.wetNew - rdt / 0.3);       // (it lands as snow, white, and has melted in a third of a second)
  };
  return F;
})();
Game.feel = Feel;       // (the page keeps its modules to itself: this is how a test or a switch outside reaches it, e.g. __ski.m.Game.feel.splash(1, 0, 1))
