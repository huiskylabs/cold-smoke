// ski-tip audit: every 1/30 s, how far each ski's tip (the shovel, 0.94 m ahead of the boot, 9 cm up) is under the drawn snow surface
__ski.set("Sky.rate", 0); __ski.tod('day');
const M = __ski.m, G = M.Game, C = M.Course, S = G.s, T = M.Tracks, Sk = M.Skier;
const segOf = type => { C.at(9000, {}); return C.segs.find(s => s.type === type); };
const types = TYPES; const out = {}; const worst = [];
for (const ty of types) {
  const sg = segOf(ty); if (!sg) { out[ty] = 'none'; continue; }
  __ski.reset(Math.max(0, sg.s0 - 60)); M.Spray.clear(); T.reset();
  const pilot = __ski.pilot(AMP, PER);
  let n = 0, nb = 0, nb5 = 0, mx = 0, air = 0, nbAir = 0;
  for (let i = 0; i < SECS * 30; i++) {
    __ski.sim(1 / 30, pilot, { draw: false });
    const s = -S.p[2]; if (s < sg.s0) continue; if (s > sg.s1) break;
    const W = Sk.world; if (!W || !W.seg) continue;
    for (let k = 0; k < 2; k++) {
      const tip = W.seg[k][1], o = M.Render.origin;
      const x = tip[0] + o[0], y = tip[1] + o[1], z = tip[2] + o[2];
      if (n === 40) console.log('SANITY tail-y minus ground ' + (W.seg[k][0][1] + o[1] - C.height(W.seg[k][0][0] + o[0], W.seg[k][0][2] + o[2], 0.5)).toFixed(3) + ' S.p-ground ' + (S.p[1] - C.height(S.p[0], S.p[2], 0.5)).toFixed(3) + ' tailxz-Sp ' + (W.seg[k][0][0]+o[0]-S.p[0]).toFixed(2) + ',' + (W.seg[k][0][2]+o[2]-S.p[2]).toFixed(2));
      const surf = C.height(x, z, 0.5) + (T.lift ? T.lift(x, z) : 0);
      const pen = surf - y; n++;
      if (!S.contact) air++;
      if (pen > 0.01) { nb++; if (!S.contact) nbAir++; }
      if (pen > 0.05) nb5++;
      if (pen > mx) mx = pen;
      if (pen > 0.03 && worst.length < 400) worst.push([ty, +G.runT.toFixed(2), k, +pen.toFixed(3), S.contact ? 1 : 0, +(S.speed * 3.6).toFixed(0), +(S.powder || 0).toFixed(2), +(T.deep || 0).toFixed(2), +(G.pose.pitchL || 0).toFixed(3), +(G.pose.edge || 0).toFixed(2), +(S.lean||0).toFixed(2)]);
    }
  }
  out[ty] = { n, buried: +(nb / Math.max(n, 1) * 100).toFixed(1), buried5cm: +(nb5 / Math.max(n, 1) * 100).toFixed(1), max: +mx.toFixed(3), airShare: +(air / Math.max(n, 1) * 100).toFixed(0), buriedInAir: nbAir };
}
console.log('RES ' + JSON.stringify(out));
console.log('COLS seg,t,ski,pen,contact,kmh,powder,deep,pitch,edge,lean');
console.log('WORST ' + JSON.stringify(worst.sort((a, b) => b[3] - a[3]).slice(0, 40)));
console.log('err=' + (__ski.err() || 'none'));
