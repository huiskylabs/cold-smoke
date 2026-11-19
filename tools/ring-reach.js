// (用户 2026-11-19 06:08 UTC: 难度必须是你的选手用我们可用的这些手段跑得到的；如果用了所有手段都达不到，别人没法达到) Is every ring of a
// challenge line reachable with the player's own controls? A searching pilot: coming up on each ring it tries many ways of skiing to it
// in the game's own physics (Game.step on a copy of the skier's state, nothing else touched): how fast it lets itself go (braking the way
// a player does, weight forward while turning so the tails skid), how hard it steers back onto the line through the ring centres, and
// a jump held into a kicker with an air ring. It keeps the quickest way that goes through this ring and still lets it make the next one,
// then skis that way for real (the full game, rings judged by the game). A ring that no way it tried goes through is listed: what the
// ring asked (metres down and across from the one before, the speed the skier came in with, its size, where on the mountain).
// node tools/ring-reach.js <out.json> <line a|x> <diffs, e.g. abc> [html]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const out = path.resolve(process.argv[2] || 'ring-reach.json'), line = process.argv[3] || 'a', diffs = (process.argv[4] || 'abc').split('');
const html = path.resolve(process.argv[5] || path.join(__dirname, '../dist/dev.html'));
(async () => {
  const b = await chromium.launch({ headless: true });
  const errs = [], res = {};
  for (const d of diffs) {
    // (a fresh page for each ride: one page through several rides ran out of memory)
    const pg = await b.newPage({ viewport: { width: 320, height: 180 }, locale: 'zh-CN' }); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('file://' + html + '?dev');
    await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
    await pg.evaluate(([l, d]) => { const V = __ski.m.Variants; V.set('ringdiff', d); V.set('rline', l); V.set('rflow', 'g'); __rings.chal = true; __ski.ui().go(); }, [line, d]);
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 240000 });
    await pg.evaluate(() => { __rings.line.cT = 99; });
    await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 240000 });
    const r = await pg.evaluate(async () => {
      const G = __ski.game(), S = G.s, C = __ski.m.Course, RG = __rings, I = __ski.m.Input, H = 1 / 120;
      const pn = performance.now.bind(performance), t0 = pn(); let tSim = 0; performance.now = () => t0 + tSim * 1000;
      const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
      const X = q => q.x0 ?? q.x;
      // the skier's state, copied and put back (it is all flat numbers and 3-vectors)
      const snap = () => { const o = {}; for (const k in S) o[k] = Array.isArray(S[k]) ? S[k].slice() : S[k]; return o; };
      const put = o => { for (const k in o) { if (Array.isArray(o[k])) { for (let i = 0; i < o[k].length; i++) S[k][i] = o[k][i]; } else S[k] = o[k]; } };
      // the line through the ring centres, from two rings back to three ahead of `c`, sampled every metre
      const line = (all, ic) => {
        const pts = all.slice(Math.max(0, ic - 2), ic + 4).map(q => [X(q), q.s]);
        if (ic < 2) { const f = pts[0]; pts.unshift([f[0], f[1] - 30]); if (ic < 1) pts.unshift([f[0], f[1] - 60]); }
        while (pts.length < 6) { const l = pts[pts.length - 1]; pts.push([l[0], l[1] + 30]); }
        const P = [pts[0]];
        for (let i = 1; i < pts.length - 2; i++) { const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]), n = Math.max(2, Math.ceil(L)); for (let k = 1; k <= n; k++) { const t = k / n; P.push([cr(pts[i - 1][0], pts[i][0], pts[i + 1][0], pts[i + 2][0], t), cr(pts[i - 1][1], pts[i][1], pts[i + 1][1], pts[i + 2][1], t)]); } }
        return P;
      };
      // a way of skiing: vT the speed it lets itself carry (m/s), K how hard it steers back onto the line, LA how far ahead it looks (s)
      const ctl = (P, cand, air) => () => {
        const p = S.p, s = -p[2]; let j = 0, bd = 1e9;
        for (let i = 0; i < P.length; i++) { const dd = (P[i][0] - p[0]) ** 2 + (P[i][1] - s) ** 2; if (dd < bd) { bd = dd; j = i; } }
        const sp = Math.max(S.speed, 3), ja = Math.min(P.length - 2, j + Math.max(1, Math.round(sp * cand.LA))), j2 = Math.min(P.length - 2, j);
        const hP = Math.atan2(P[ja + 1][0] - P[ja][0], P[ja + 1][1] - P[ja][1]), tx = P[j2 + 1][0] - P[j2][0], ts = P[j2 + 1][1] - P[j2][1], tl = Math.hypot(tx, ts) || 1;
        const cte = ((p[0] - P[j][0]) * ts - (s - P[j][1]) * tx) / tl;
        let e = hP - Math.atan2(S.v[0], -S.v[2]) - Math.atan2(cand.K * cte, sp * 0.5 + 1); while (e > Math.PI) e -= 2 * Math.PI; while (e < -Math.PI) e += 2 * Math.PI;
        let u = Math.max(-1, Math.min(1, e * cand.G)), fa = 0;
        const jump = !!(air && s > air.s - 26 && s < air.s - 12);
        if (!S.air && S.speed > cand.vT && !(air && s > air.s - 40)) {
          fa = 1;
          const k1 = P[Math.min(P.length - 1, ja + 3)], k0 = P[ja], kx = (P[ja + 1][0] - k0[0]) * (k1[1] - k0[1]) - (P[ja + 1][1] - k0[1]) * (k1[0] - k0[0]), sg = kx > 0 ? -1 : 1;
          if (Math.abs(u) < cand.BS && (u * sg >= 0 || Math.abs(u) < 0.2)) u = sg * cand.BS;
        } else if (Math.abs(u) > 0.55) fa = -1;
        return { u, fa, jump };
      };
      // through ring q's plane: hit or not, how far off (the game's own judging)
      const judge = q => {
        const yw = q.yaw || 0, ex = S.p[0] - X(q), es = -S.p[2] - q.s, dN = ex * Math.sin(yw) + es * Math.cos(yw);
        if (dN < 0 && es < 6) return null;
        const dA = ex * Math.cos(yw) - es * Math.sin(yw), dy = (S.p[1] + 0.9) - (q.y0 ?? q.y);
        return { hit: q.air ? Math.hypot(dA, dy) < q.r : Math.abs(dA) < q.r * 0.85, off: q.air ? Math.hypot(dA, dy) : Math.abs(dA) };
      };
      // ski the copy with `f` until through q (or 9 s): physics steps only
      const roll = (f, q) => {
        const fs0 = I.faT, j0 = I.jump; let t = 0, res = null;
        while (t < 9 && !(res = judge(q))) { const c = f(); I.faT = c.fa; I.jump = c.jump; G.step(H, c.u); t += H; }
        I.faT = fs0; I.jump = j0; return res ? { ...res, t } : { hit: false, off: 99, t };
      };
      const CANDS = []; for (const v of [200, 80, 65, 55, 45, 36, 28, 20]) for (const [Kk, Gg, LA] of [[1.2, 3, 0.35], [0.7, 2.2, 0.45], [2, 4, 0.25]]) for (const BS of [0.5, 0.9]) CANDS.push({ vT: v / 3.6, K: Kk, G: Gg, LA, BS });
      const rows = []; let T = 0, prev = null, guard = 0;
      while (RG.line.st === 'go' && guard++ < 1000) {
        const all = RG.rings.filter(q => !q.skip), ic = all.findIndex(q => q.pass < 0); if (ic < 0) { __ski.sim(1 / 60, () => 0, { draw: false }); tSim += 1 / 60; RG.frame(); T += 1 / 60; continue; }
        const c = all[ic], n = all[ic + 1], P = line(all, ic), v0 = S.speed;
        // every way: through c? then, the cautious way on, through n too? (searched again every 0.4 s from where the skier really is)
        const choose = () => {
          const base = snap(); let best = null; nOK = 0;
          for (const cand of CANDS) {
            put(base); const a = roll(ctl(P, cand, c.air ? c : null), c); if (!a.hit) { if (!best || (!best.a.hit && a.off < best.a.off)) best = { cand, a, b: null }; continue; }
            nOK++;
            let bOK = !n || n.fin;
            if (!bOK) { const P2 = line(all, ic + 1); for (const c2 of [CANDS[CANDS.length - 12], CANDS[CANDS.length - 6], CANDS[CANDS.length - 5]]) { const s2 = snap(); const bb = roll(ctl(P2, c2, n.air ? n : null), n); put(s2); if (bb.hit) { bOK = true; break; } } }
            const sc = (bOK ? 0 : 100) + a.t;
            if (!best || !best.a.hit || sc < best.sc) best = { cand, a, b: bOK, sc };
          }
          put(base); return best;
        };
        let nOK = 0, best = choose(), ways0 = nOK, f = ctl(P, best.cand, c.air ? c : null), k = 0;
        // ski it for real, the game judging
        while (c.pass < 0 && RG.line.st === 'go' && k++ < 1200) {
          if ((k % 24 === 0 || (k % 6 === 0 && (c.s + S.p[2]) < Math.max(S.speed, 5) * 1.2))) {          // (and every 0.1 s in the last 1.2 s: the real ride drifts from the copy)
            best = choose(); f = ctl(P, best.cand, c.air ? c : null); }
          __ski.sim(1 / 60, () => { const o = f(); I.faScript = o.fa; I.btn.jump = o.jump; return o.u; }, { draw: false }); tSim += 1 / 60; RG.frame(); T += 1 / 60; }
        I.faScript = null; I.btn.jump = false;
        rows.push({ s: Math.round(c.s), r: c.r, air: !!c.air, fin: !!c.fin, hit: !!c.hit, ways: ways0, waysEnd: nOK, vIn: +(v0 * 3.6).toFixed(0), vT: Math.round(best.cand.vT * 3.6), du: prev ? +(X(c) - prev.x).toFixed(1) : null, ds: prev ? Math.round(c.s - prev.s) : null, uRun: +(X(c) - C.at(c.s).cx).toFixed(1), seg: C.segAt(c.s).type, t: +T.toFixed(1) });
        prev = { x: X(c), s: c.s };
      }
      performance.now = pn;
      return { tEnd: RG.line.tEnd, passed: RG.passed, missed: RG.missed, T: +T.toFixed(1), st: RG.line.st, rows };
    });
    res[line + d] = r; await pg.close();
    const bad = r.rows.filter(q => !q.hit && !q.fin);
    console.log(line + d, 'time', r.tEnd && r.tEnd.toFixed(1), 'passed', r.passed, 'missed', r.missed, 'impossible(no way found)', bad.filter(q => !q.ways).length);
    for (const q of bad) console.log('   miss', JSON.stringify(q));
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
