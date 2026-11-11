// ---------------------------------------------------------------- sound: everything is synthesised here, nothing is recorded
// Continuous voices driven by the physics every frame, and a few one-shots. The shapes were set against field recordings
// (measured, then thrown away): a ski's scrape is plain broadband noise humped at 1.25 kHz that swells 10 dB in a third of a second
// and falls away as the turn is released; wind at the ears is pink noise cut off under 1 kHz, buffeting each ear on its own;
// cold snow creaks in clicks 15..35 ms apart and then squeals for a tenth of a second, falling from about 2.5 kHz to under 1 kHz.
//   wind    a rumble that buffets each ear separately, its upper edge and its level climbing with speed; a thin whistle on top when fast
//   glide   the bases running over dry snow: a fine hiss, finer and brighter the faster it goes
//   edge    the scrape of the edges in a turn, on the side the snow is thrown to; its onset is the "shhk" of the snow cut loose,
//           its tail the curtain sifting back down
//   creak   cold snow complaining as it is pressed: clearest when slow, under load
const Sound = (() => {
  const A = { ctx: null, rig: null, on: true, level: 0.62, pc: {}, row: 1e9, creakFloor: 0.026 };

  // ---- source material: a few seconds of each kind of noise, computed once
  function material(ctx) {
    const sr = ctx.sampleRate, rnd = RNG(90210), M = {};
    const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 1.7320508;
    const N3 = Math.round(sr * 3);
    // white: two independent channels
    { const b = ctx.createBuffer(2, N3, sr); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < N3; i++) d[i] = gauss() * 0.25; } M.white = b; }
    // pink (Kellet's filter bank), two independent channels: the wind. The start of the loop is cross-faded with what would have followed its end
    { const n = Math.round(sr * 4), f = Math.round(sr * 0.05), b = ctx.createBuffer(2, n, sr), x = new Float32Array(n + f);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c); let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = -4000; i < n + f; i++) {
          const w = gauss();
          b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
          b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
          if (i >= 0) x[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.055; b6 = w * 0.115926;
        }
        for (let i = 0; i < n; i++) { if (i < f) { const k = i / f * PI / 2; d[i] = x[i] * Math.sin(k) + x[n + i] * Math.cos(k); } else d[i] = x[i]; }
      }
      M.pink = b; }
    // sand: the same pink noise, its loudness wandering a couple of dB many times a second as a ski finds harder and softer snow
    { const b = ctx.createBuffer(2, N3, sr), K = 3 * 70, nodes = new Float32Array(K + 1);
      for (let c = 0; c < 2; c++) {
        for (let k = 0; k < K; k++) nodes[k] = clamp(gauss(), -2, 2); nodes[K] = nodes[0]; const d = b.getChannelData(c), src = M.pink.getChannelData(c), o = c ? 7919 : 104729;
        for (let i = 0; i < N3; i++) { const x = i / N3 * K, k = Math.floor(x), f = x - k, u = f * f * (3 - 2 * f); d[i] = src[(i + o) % src.length] * 1.4 * Math.exp(0.24 * lerp(nodes[k], nodes[k + 1], u)); }
        const f = Math.round(sr * 0.05); for (let i = 0; i < f; i++) { const k = i / f * PI / 2, j = (N3 + i + o) % src.length; d[i] = d[i] * Math.sin(k) + src[j] * 1.4 * Math.exp(0.24 * nodes[0]) * Math.cos(k); }
      }
      M.sand = b; }
    // patter: sparse grains, snow coming back down
    { const b = ctx.createBuffer(2, N3, sr), dec = Math.exp(-1 / (sr * 0.0011)), p = 560 / sr;
      for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let e = 0; for (let i = 0; i < N3; i++) { if (rnd() < p) { const a = rnd(); e += a * a * a * 1.7; } e *= dec; d[i] = gauss() * e * 0.55; } }
      M.patter = b; }
    // slow random curves for gusts and buffeting (played back at a hundred-odd samples a second)
    { const n = 4096, b = ctx.createBuffer(2, n, sr);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c); let amp = 1, tot = 0;
        for (let per = 128; per >= 4; per >>= 1) { const K = n / per, nodes = new Float32Array(K + 1); for (let k = 0; k < K; k++) nodes[k] = rnd() * 2 - 1; nodes[K] = nodes[0];
          for (let i = 0; i < n; i++) { const x = i / per, k = Math.floor(x), f = x - k, u = f * f * (3 - 2 * f); d[i] += amp * lerp(nodes[k], nodes[k + 1], u); } tot += amp * amp; amp *= 0.8; }
        const s = 1 / Math.sqrt(tot / 3); for (let i = 0; i < n; i++) d[i] *= s;        // unit variance
      }
      M.lfo = b; }
    // ---- cold snow creaking
    const ring = (d, i0, fc, Q, amp) => {           // a click: a damped ring with a grain of noise in it
      const tau = Q / (PI * fc) * sr, len = Math.min(d.length - i0, Math.round(tau * 6)), w = TAU * fc / sr, ph = rnd() * TAU;
      for (let j = 0; j < len; j++) d[i0 + j] += amp * Math.exp(-j / tau) * (Math.sin(w * j + ph) + 0.5 * gauss());
    };
    const click = (d, i0, amp) => { if (i0 < 0 || i0 >= d.length - 600) return; ring(d, i0, lerp(340, 700, rnd()), 1.6, amp * 1.5); ring(d, i0, lerp(900, 1700, rnd()), 2.2, amp * 0.7); ring(d, i0, lerp(2400, 4000, rnd()), 2.6, amp * 0.35); ring(d, i0, lerp(5500, 8500, rnd()), 3, amp * 0.2); };
    const squeal = (d, i0, dur, f0, f1, amp) => {   // crushed grains through two resonances that slide down together as the snow locks
      const len = Math.round(dur * sr), tail = Math.round(sr * 0.02), q = 1 / 4.6; let lo1 = 0, bd1 = 0, lo2 = 0, bd2 = 0, lo3 = 0, bd3 = 0, wob = 0;
      const pImp = 420 / sr;
      for (let j = 0; j < len + tail && i0 + j < d.length; j++) {
        const x = j / len, env = j < len ? Math.min(1, j / (sr * 0.007)) * Math.min(1, (len - j) / (sr * 0.028)) : 0;
        wob += (gauss() * 0.9 - wob) * 0.004;
        const fc = f0 * Math.pow(f1 / f0, Math.min(1, x * x * 0.4 + x * 0.6)) * (1 + wob);
        const ex = env * (gauss() * 0.22 + (rnd() < pImp ? (rnd() * 2 - 1) * 9 : 0));
        const f = 2 * Math.sin(PI * fc / sr), g = 2 * Math.sin(PI * Math.min(fc * 1.85, sr * 0.16) / sr), e3 = 2 * Math.sin(PI * fc * 0.52 / sr);
        lo1 += f * bd1; bd1 += f * (ex - lo1 - q * bd1); lo2 += g * bd2; bd2 += g * (ex - lo2 - q * bd2); lo3 += e3 * bd3; bd3 += e3 * (ex - lo3 - 0.5 * bd3);
        d[i0 + j] += amp * (bd1 + 0.5 * bd2 + 0.7 * bd3 + ex * 0.07);
      }
    };
    const norm = (d, peak) => { let m = 0; for (let i = 0; i < d.length; i++) m = Math.max(m, Math.abs(d[i])); const s = peak / (m || 1); for (let i = 0; i < d.length; i++) d[i] *= s; };
    // the running bed: a few creaks a second, most of them only clicks, every third or so a squeal
    { const n = Math.round(sr * 6), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0); let t = 0.02;
      while (t < 5.75) {
        const i0 = Math.round(t * sr), big = rnd() < 0.36, a = 0.35 + 0.65 * rnd();
        const pre = 1 + Math.floor(rnd() * (big ? 4 : 3)); let tc = t;
        for (let k = 0; k < pre; k++) { const u = rnd(); click(d, Math.round(tc * sr), a * (0.15 + 0.85 * u * u) * 0.55); tc += 0.006 + 0.04 * rnd() * rnd(); }
        if (big) { const dur = 0.05 + 0.10 * rnd(); squeal(d, Math.round(tc * sr), dur, lerp(1300, 2100, rnd()), lerp(520, 850, rnd()), a * 0.20); tc += dur; }
        t = tc + 0.03 + 0.20 * rnd() * rnd();
      }
      // between the creaks the crust never quite stops ticking
      for (let t2 = 0.01; t2 < 5.95; t2 += -Math.log(1 - rnd() * 0.999) / 55) { const u = rnd(); click(d, Math.round(t2 * sr), 0.012 + 0.16 * u * u * u * u); }
      // ...and under it all the grains themselves giving way: a bed of tiny fractures that never stops while there is weight on the snow,
      // and swells with every creak
      { let m = 0; for (let i = 0; i < n; i++) m = Math.max(m, Math.abs(d[i]));
        const rel = Math.exp(-1 / (sr * 0.06)), kf = 1 - Math.exp(-1 / (sr * 0.025)), dec = Math.exp(-1 / (sr * 0.0007)), p = 1100 / sr, aH = Math.exp(-TAU * 260 / sr), kL = 1 - Math.exp(-TAU * 1500 / sr);
        let env = 0, es = 0, e = 0, hp = 0, lp = 0, xp = 0;
        for (let i = 0; i < n; i++) {
          env = Math.max(Math.abs(d[i]) / m, env * rel); es += (env - es) * kf;
          if (rnd() < p) { const a = rnd(); e += a * a * 1.2; } e *= dec;
          const w = gauss() * e; hp = aH * (hp + w - xp); xp = w; lp += kL * (hp - lp);
          d[i] += m * A.creakFloor * (0.4 + 1.4 * Math.min(es * 3, 1)) * (hp * 0.6 + lp * 2.2);
        } }
      norm(d, 1); for (let i = 0; i < n; i++) d[i] = Math.tanh(d[i] * 3.2) * 0.8; M.creak = b; }
    // single creaks for the moments the snow takes a sudden load: longer, with more of a run-up
    M.chirps = [];
    for (let v = 0; v < 4; v++) {
      const n = Math.round(sr * 0.5), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0); let tc = 0.004;
      const pre = 2 + Math.floor(rnd() * 3); for (let k = 0; k < pre; k++) { click(d, Math.round(tc * sr), 0.5 + 0.5 * rnd()); tc += 0.014 + 0.024 * rnd(); }
      squeal(d, Math.round(tc * sr), 0.11 + 0.05 * v, lerp(1600, 2200, rnd()), lerp(480, 700, rnd()), 0.34);
      norm(d, 1); for (let i = 0; i < n; i++) d[i] = Math.tanh(d[i] * 2.6) * 0.8; M.chirps.push(b);
    }
    return M;
  }

  // ---- the instrument: build it on a context (the live one, or an offline one for tests), then feed it the skier's state
  A.build = function (ctx, opt = {}) {
    const M = material(ctx), sr = ctx.sampleRate, R = { ctx, t: 0 };
    const gain = (v = 0) => { const g = ctx.createGain(); g.gain.value = v; return g; };
    const biq = (type, f, Q = 0.707, dB = 0) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = Q; b.gain.value = dB; return b; };
    const loop = (buffer, rate = 1, off = 0) => { const s = ctx.createBufferSource(); s.buffer = buffer; s.loop = true; s.playbackRate.value = rate; s.start(0, off); return s; };
    const pan = () => ctx.createStereoPanner ? ctx.createStereoPanner() : gain(1);
    const chain = (...n) => { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; };
    // parameters are only touched when their target has moved
    const H = p => ({ p, v: NaN });
    const set = (h, v, t, tau = 0.045) => { if (!h.p) return; if (Math.abs(v - h.v) <= 0.006 * Math.max(Math.abs(v), Math.abs(h.v), 0.02)) return; h.v = v; h.p.setTargetAtTime(v, t, tau); };
    const hit = (g, t, peak, att, hold, dec) => { const p = g.gain; p.cancelScheduledValues(t); p.setTargetAtTime(peak, t, att); p.setTargetAtTime(0, t + hold, dec); };

    const out = gain(0), comp = ctx.createDynamicsCompressor(), bus = gain(1);
    comp.threshold.value = -15; comp.knee.value = 10; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.16;
    const ceil = ctx.createWaveShaper(), cv = new Float32Array(1025);
    for (let i = 0; i < 1025; i++) { const x = (i - 512) / 512 * 1.6, a = Math.abs(x); cv[i] = sign(x) * (a < 0.7 ? a : 0.7 + 0.29 * Math.tanh((a - 0.7) / 0.29)); }      // straight to 0.7, then bends over under 1
    ceil.curve = cv; const pre = gain(1 / 1.6);
    chain(bus, comp, out, pre, ceil, ctx.destination);
    const tap = name => { const g = gain(opt.solo && opt.solo !== name ? 0 : 1); g.connect(bus); return g; };

    // ---------------- wind
    const wT = tap('wind'), pink = loop(M.pink, 1, 0.2), white = loop(M.white, 1, 0.4);
    const wHP = biq('highpass', 42, 0.7), wSh = biq('highshelf', 230, 0.7, -7), wL1 = biq('lowpass', 260, 0.6), wL2 = biq('lowpass', 290, 1.0), wSp = ctx.createChannelSplitter(2), wMg = ctx.createChannelMerger(2);
    const wEar = [gain(1), gain(1)], wLfo = loop(M.lfo, 150 / sr), wLs = ctx.createChannelSplitter(2), wDep = [gain(0.3), gain(0.3)], wG = gain(0), wBal = pan();
    chain(pink, wHP, wSh, wL1, wL2, wSp); wLfo.connect(wLs);        // (a rumble under 200 Hz, and a thinner rush above it that reaches higher the faster you go)
    for (let c = 0; c < 2; c++) { wSp.connect(wEar[c], c); wLs.connect(wDep[c], c); wDep[c].connect(wEar[c].gain); wEar[c].connect(wMg, 0, c); }
    chain(wMg, wG, wBal, wT);
    const wGust = loop(M.lfo, 11 / sr, 1500), wGd = gain(0.3); chain(wGust, wGd); wGd.connect(wG.gain);      // slow gusts ride on the level
    // the mountain's own air, heard even standing still: a far, soft rush that swells and thins on its own slow gusts
    const mBP = biq('bandpass', 620, 0.55), mLP = biq('lowpass', 2400, 0.6), mG = gain(0), mMod = gain(1), mLfo = loop(M.lfo, 7 / sr, 2600), mD = gain(0.42);
    chain(pink, mBP, mLP, mMod, mG, wT); chain(mLfo, mD); mD.connect(mMod.gain);
    const hBP = biq('bandpass', 900, 18), hG = gain(0), hLfo = loop(M.lfo, 5 / sr, 700), hD = gain(60); chain(white, hBP, hG, wT); chain(hLfo, hD); hD.connect(hBP.frequency);   // whistle
    // ---------------- snow under the skis
    const sT = tap('snow'), sand = loop(M.sand, 1, 0.1), sand2 = loop(M.sand, 1.13, 1.7), pat = loop(M.patter, 1, 0.5);
    const gHP = biq('highpass', 1300, 0.6), gTilt = biq('highshelf', 8000, 0.7, 0.5), gLP = biq('lowpass', 13000, 0.6), gG = gain(0);
    chain(sand, gHP, gTilt, gLP, gG, sT);
    const eBP = biq('bandpass', 1300, 0.6), ePk = biq('peaking', 1250, 1.4, 3), eAir = biq('highpass', 3400, 0.7), eAir2 = biq('peaking', 10500, 1.4, 4), eAirG = gain(0.5), eLo = biq('bandpass', 250, 1.3), eLoG = gain(0.5), eSum = gain(1);
    const eLP = biq('lowpass', 13000, 0.6), eRough = gain(1), eG = gain(0), ePan = pan();
    chain(sand2, eBP, ePk, eSum); chain(sand2, eAir, eAir2, eAirG, eSum); chain(sand2, eLo, eLoG, eSum); chain(eSum, eLP, eRough, eG, ePan, sT);
    const rLfo = loop(M.lfo, 520 / sr, 900), rD = gain(0.1); chain(rLfo, rD); rD.connect(eRough.gain);        // chatter
    const aHP = biq('highpass', 2600, 0.7), aPk = biq('peaking', 7000, 0.9, 5), aG = gain(0), aPan = pan(); chain(sand, aHP, aPk, aG, aPan, sT);   // the snow cut loose
    const pHP = biq('highpass', 4200, 0.7), pLP = biq('lowpass', 14000, 0.6), pG = gain(0), pPan = pan(); chain(pat, pHP, pLP, pG, pPan, sT);        // ...and sifting back down
    // ---------------- creak
    const qT = tap('creak'), creak = loop(M.creak, 1, 0), qPk = biq('peaking', 1100, 0.8, 3), qBody = biq('peaking', 520, 0.8, 9), qLP = biq('highshelf', 6500, 0.7, 5), qG = gain(0), qPan = pan();
    chain(creak, qPk, qBody, qLP, qG, qPan, qT);
    // ---------------- one-shots: voices that run all the time at zero and are opened for a moment
    const fT = tap('fx');
    const th = ctx.createOscillator(), thG = gain(0); th.type = 'sine'; th.frequency.value = 60; chain(th, thG, fT); th.start();
    const crF = biq('lowpass', 1500, 0.8), crG = gain(0); chain(white, crF, crG, fT);
    const spF = biq('highpass', 2800, 0.7), spG = gain(0), spPan = pan(); chain(pat, spF, spG, spPan, fT);
    const brF = biq('bandpass', 2300, 0.7), brG = gain(0), brPan = pan(); chain(sand2, brF, brG, brPan, fT);
    const hfF = biq('lowpass', 340, 0.9), hfG = gain(0), hfP = pan(), hcF = biq('bandpass', 1500, 0.8), hcG = gain(0); chain(pink, hfF, hfG, hfP, fT); chain(sand2, hcF, hcG, hfP);      // hooves in snow, somewhere off to one side
    const psF = [biq('bandpass', 900, 1.1), biq('bandpass', 900, 1.1)], psG = [gain(0), gain(0)], psP = [pan(), pan()];        // trees going by, one voice a side
    for (let k = 0; k < 2; k++) { chain(pink, psF[k], psG[k], psP[k], fT); if (psP[k].pan) psP[k].pan.value = k ? 0.8 : -0.8; }

    const h = {
      wL1: H(wL1.frequency), wL2: H(wL2.frequency), wG: H(wG.gain), wGd: H(wGd.gain), wD0: H(wDep[0].gain), wD1: H(wDep[1].gain), wBal: H(wBal.pan), hF: H(hBP.frequency), hG: H(hG.gain), mG: H(mG.gain),
      gG: H(gG.gain), gHP: H(gHP.frequency), gLP: H(gLP.frequency), gRate: H(sand.playbackRate),
      eG: H(eG.gain), eBP: H(eBP.frequency), ePk: H(ePk.frequency), eLP: H(eLP.frequency), eLoG: H(eLoG.gain), eAirG: H(eAirG.gain), ePan: H(ePan.pan), rD: H(rD.gain),
      aG: H(aG.gain), aPan: H(aPan.pan), pG: H(pG.gain), pPan: H(pPan.pan), pLP: H(pLP.frequency), aPk: H(aPk.frequency),
      qG: H(qG.gain), qRate: H(creak.playbackRate), qPk: H(qPk.frequency), qPan: H(qPan.pan), out: H(out.gain),
    };
    let Islow = 0, Ifall = 0, con = 0, latPrev = 0, loadPrev = 1, chirpT = -1, nChirp = 0, loadS = 1;

    R.fade = (v, t, tau = 0.25) => { h.out.v = NaN; set(h.out, v, t, tau); };
    R.chirp = (t, amp, pn, rate = 1) => {
      if (t - chirpT < 0.3) return; chirpT = t; R.chirps = (R.chirps || 0) + 1;
      const s = ctx.createBufferSource(), g = gain(amp), p = pan(); s.buffer = M.chirps[nChirp++ % M.chirps.length]; s.playbackRate.value = rate * (0.92 + 0.16 * hash1(nChirp * 7 + 3));
      if (p.pan) p.pan.value = pn; chain(s, g, p, qT); s.start(t);
    };
    R.land = (v, t) => {
      const k = sat(v / 5.5);
      th.frequency.cancelScheduledValues(t); th.frequency.setValueAtTime(lerp(92, 128, k), t); th.frequency.exponentialRampToValueAtTime(42, t + 0.17);
      hit(thG, t, 0.12 + 0.3 * k, 0.003, 0.022, 0.075); hit(crG, t, 1.3 * (0.3 + 0.7 * k), 0.002, 0.03, 0.055); hit(spG, t + 0.015, 0.5 * k, 0.012, 0.09, 0.17);
      R.chirp(t + 0.012, 0.35 + 0.5 * k, 0, 0.9);
    };
    R.brush = (t, side, hard) => {         // boughs: a swish, twigs ticking, then the snow they held sifting down
      if (brPan.pan) { brPan.pan.setTargetAtTime(side * 0.6, t, 0.01); spPan.pan.setTargetAtTime(side * 0.5, t, 0.01); }
      hit(brG, t, hard ? 0.6 : 0.25, 0.012, 0.07, 0.11); hit(spG, t + 0.05, hard ? 0.4 : 0.18, 0.03, 0.22, 0.32);
      if (hard) { th.frequency.cancelScheduledValues(t); th.frequency.setValueAtTime(70, t); th.frequency.exponentialRampToValueAtTime(38, t + 0.2); hit(thG, t, 0.4, 0.004, 0.03, 0.09); hit(crG, t, 1.4, 0.002, 0.04, 0.08); }
    };
    R.hoof = (t, amp, pn) => {             // a pair of hooves driving into the snow: a soft thump and the crust giving
      if (hfP.pan) hfP.pan.setTargetAtTime(pn, t, 0.02); R.hoofs = (R.hoofs || 0) + 1;
      hit(hfG, t, 1.5 * amp, 0.004, 0.018, 0.05); hit(hcG, t + 0.004, 0.36 * amp, 0.004, 0.022, 0.06);
    };
    R.pass = (t, side, amp, sp) => { R.passes = (R.passes || 0) + 1;        // a trunk goes by: the air between it and the ear is squeezed for an instant
      const k = side > 0 ? 1 : 0, f = psF[k].frequency, f0 = 700 + 38 * sp;
      f.cancelScheduledValues(t); f.setValueAtTime(f0 * 1.5, t); f.exponentialRampToValueAtTime(f0 * 0.7, t + 0.16);
      hit(psG[k], t, amp, 0.022, 0.035, 0.06);
    };

    // s: { run, speed, contact, lat (signed, g), skid, load (g), powder, I, tuck, lean, ridge, forest }
    R.update = function (s, t) {
      const dt = clamp(t - R.t, 0, 0.1); R.t = t;
      const v = s.run ? s.speed : 0, vk = sat(v / 34), al = Math.abs(s.lat), turn = s.lat >= 0 ? 1 : -1, pw = s.powder;
      con = damp(con, s.run && s.contact ? 1 : 0, s.contact ? 40 : 28, dt);
      // ---- wind: level and upper edge climb with speed; among trees the mountain's own wind is shut out, on a ridge it is doubled
      const expo = 1 + 1.4 * s.ridge - 0.55 * s.forest, fw = (300 + 830 * Math.pow(vk, 1.1)) * (1 + 0.12 * s.tuck);
      set(h.wL1, fw, t, 0.12); set(h.wL2, fw * 1.12, t, 0.12);
      const wl = (0.14 * expo + 2.0 * Math.pow(vk, 1.9)) * (1 - 0.22 * s.tuck) * (s.run && !s.contact ? 1.15 : 1);
      set(h.wG, wl, t, 0.12); set(h.wGd, wl * 0.28, t, 0.2);
      const dep = 0.22 + 0.2 * vk; set(h.wD0, dep, t, 0.2); set(h.wD1, dep, t, 0.2);
      set(h.wBal, clamp(-s.lean * 0.22, -0.3, 0.3), t, 0.15); set(h.mG, 0.55 * expo * lerp(1, 0.5, vk), t, 0.4);
      set(h.hF, 760 + 950 * vk, t, 0.2); set(h.hG, 1.5 * smooth(13, 30, v) * (1 - 0.5 * s.forest), t, 0.3);
      // ---- how hard the edges are moving snow. The same recipe that feeds the spray, but from what the body is doing (lean, skid) and the
      // load on the legs averaged over a tenth of a second: the ear hears one scrape per turn, not every bounce of the knees
      loadS = damp(loadS, s.run && s.contact ? s.load : 0, 9, dt);
      const tl = Math.tan(Math.min(Math.abs(s.lean), 1.1)), sk = sat(s.skid / 0.45), pwF = 0.6 + 0.6 * pw, hard = 1 - pw;
      const E = smooth(1.5, 13, v) * (0.62 * Math.pow(tl, 1.3) + 1.25 * s.skid * (0.4 + 0.6 * sat(tl))) * lerp(0.35, 1.25, sat(loadS / 1.8)) * pwF;
      const eL = Math.pow(sat(E * 0.85), 0.8);
      // ---- glide: quiet next to the scrape of a turn, finer and brighter with speed, muffled in powder
      set(h.gG, con * (0.02 + 0.30 * Math.pow(vk, 1.15)) * smooth(0.3, 2.5, v) * lerp(1, 0.6, pw) * lerp(0.55, 1.1, sat(loadS / 1.3)), t, 0.05);
      set(h.gHP, lerp(900, 1700, vk) * lerp(1, 0.5, pw), t, 0.1); set(h.gLP, lerp(13000, 3600, pw * 0.9), t, 0.2); set(h.gRate, 0.8 + 0.5 * vk, t, 0.2);
      // ---- edge
      const fe = lerp(1650, 1050, sk) * (0.82 + 0.4 * vk) * lerp(1, 0.6, pw);
      set(h.eG, con * 2.5 * eL * lerp(1, 0.8, pw), t, 0.04);
      set(h.eBP, fe, t, 0.06); set(h.ePk, fe * 0.96, t, 0.06); set(h.eLP, lerp(13000, 3000, pw * 0.85), t, 0.2);
      set(h.eLoG, 0.08 + 0.2 * sk * hard, t, 0.1); set(h.eAirG, lerp(0.52, 0.12, pw), t, 0.2); set(h.rD, 0.07 + 0.2 * sk * hard, t, 0.1);
      const side = -turn * sat(tl / 0.35) * sat(E * 3);
      set(h.ePan, side * 0.5, t, 0.08); set(h.aPan, side * 0.68, t, 0.08); set(h.pPan, side * 0.6, t, 0.2); set(h.qPan, side * 0.3, t, 0.1);
      // the snow cut loose at the start of a turn, and the curtain coming back down after it
      Islow = damp(Islow, E, 3.0, dt); Ifall = Math.max(E, damp(Ifall, 0, 1.5, dt));
      set(h.aG, con * (0.34 * Math.pow(sat((E - Islow) * 2.2), 0.9) + 0.10 * Math.pow(sat(E * 0.8), 1.2) * lerp(0.6, 1.3, pw)), t, 0.025);
      set(h.pG, (0.30 * sat((Ifall - E) * 1.6) + 0.06 * sat(E) * con) * lerp(1, 0.5, pw), t, 0.05); set(h.pLP, lerp(14000, 5200, pw), t, 0.2); set(h.aPk, lerp(7000, 3800, pw), t, 0.2);
      R.E = E;
      // ---- creak: load on cold packed snow; clearest when slow
      const press = sat((s.load - 1.0) * 0.9) * 0.6 + sat(tl / 1.2) * 0.55 + sat((s.load - loadS) * 1.2) * 0.5;
      const qv = con * sat(press) * smooth(0.4, 3, v) * lerp(1, 0.5, smooth(10, 30, v)) * (1 - 0.8 * pw);
      set(h.qG, 3.0 * qv + 0.16 * con * smooth(0.4, 3, v) * hard, t, 0.03); set(h.qRate, 0.85 + 0.55 * vk + 0.15 * sat(al), t, 0.1); set(h.qPk, lerp(1700, 900, sat(press)), t, 0.08);
      // a sudden load is a creak of its own: setting an edge, dropping into a trough
      if (con > 0.6 && v > 1 && v < 24 && pw < 0.7) {
        const rise = (al - latPrev) / Math.max(dt, 1e-3), lr = (s.load - loadPrev) / Math.max(dt, 1e-3);
        if ((rise > 2.2 && al > 0.35) || lr > 16) R.chirp(t, (0.36 + 0.5 * sat(press)) * lerp(1, 0.5, smooth(8, 24, v)), side * 0.35, 0.95 + 0.4 * vk);
      }
      latPrev = al; loadPrev = s.load;
    };
    return R;
  };

  // ---- live use
  A.init = function () {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { A.ctx = new AC({ latencyHint: 'interactive' }); A.rig = A.build(A.ctx); } catch (e) { console.warn('audio unavailable', e); A.ctx = null; A.rig = null; return; }
    document.addEventListener('visibilitychange', () => { if (!A.ctx) return; if (document.hidden) A.ctx.suspend(); else if (A.unlocked) A.ctx.resume(); });
  };
  // from a tap: browsers only let sound begin there
  A.unlock = function () {
    if (!A.ctx) return; A.unlocked = true;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { }
    if (A.ctx.state !== 'running') A.ctx.resume();
    A.rig.fade(A.on ? A.level : 0, A.ctx.currentTime, 0.5);
  };
  A.kick = function () { if (!A.rig) return; const t = A.now(); A.rig.chirp(t + 0.06, 0.5, -0.25, 0.9); setTimeout(() => { if (A.rig) A.rig.chirp(A.now(), 0.42, 0.25, 1.0); }, 430); };      // pushing off: two strides
  A.setOn = function (on) { A.on = on; if (A.rig && A.unlocked) A.rig.fade(on ? A.level : 0, A.ctx.currentTime, 0.12); };
  A.now = () => A.ctx.currentTime + 0.012;
  A.snapshot = function () {
    const S = Game.s, c = Course.at(-S.p[2], A.pc);
    return { run: Game.mode === 'run', speed: Math.hypot(S.v[0], S.v[1], S.v[2]), contact: S.contact, lat: S.aReac / 9.81, skid: Math.abs(Math.sin(S.beta)), load: S.load / 9.81, powder: S.powder, I: Spray.intensity, tuck: S.tuck, lean: S.lean,
      ridge: c.ridge || 0, forest: Math.max(c.forest || 0, c.glade || 0) };
  };
  A.frame = function () {
    if (!A.rig) return; const t = A.now(), S = Game.s;
    A.rig.update(A.snapshot(), t);
    // trunks going by: when the skier comes to a new row of tree cells, the nearest trunk on either side of that row is given its moment,
    // timed for the instant it draws level
    if (Game.mode === 'run' && S.speed > 7 && S.v[2] < -3) {
      const cj = Math.floor(S.p[2] / TREE_CELL) - 1;
      if (cj !== A.row) {
        A.row = cj; const ci = Math.floor(S.p[0] / TREE_CELL), tn = A.tn || (A.tn = {});
        for (let sd = -1; sd <= 1; sd += 2) {
          let best = 1e9, bz = 0;
          for (let a = -2; a <= 2; a++) { const tr = Course.treeInCell(ci + a, cj, tn); if (!tr.ok) continue; const dx = (tr.x - S.p[0]) * sd; if (dx > 0.2 && dx < best) { best = dx; bz = tr.z; } }
          const lead = (S.p[2] - bz) / -S.v[2];
          if (best < 7.5 && lead > 0 && lead < 0.7) A.rig.pass(t + lead, sd, 0.5 * sat(1 - best / 7.5) * smooth(7, 22, S.speed), S.speed);
        }
      }
    }
  };
  A.event = function (ev) {
    if (!A.rig) return; const t = A.now(), S = Game.s;
    if (ev.type === 'land') { if (ev.airT > 0.14 || ev.v > 1.6) A.rig.land(ev.v * (ev.airT > 0.14 ? 1 : 0.5), t); }
    else if (ev.type === 'brush' || ev.type === 'crash') A.rig.brush(t, sign((ev.x - S.p[0]) * S.r[0] + (ev.z - S.p[2]) * S.r[2]) || 1, ev.type === 'crash');
    else if (ev.type === 'hoof') A.rig.hoof(t, ev.k * Math.pow(sat(1 - ev.d / 34), 1.6), ev.side * sat(ev.d / 6) * 0.75);
  };
  return A;
})();
