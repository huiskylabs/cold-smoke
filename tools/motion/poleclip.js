// 雪杖穿腿拆开看：穿多深、是哪根杖（弯内侧 / 弯外侧）、穿的是大腿还是小腿。
//   node poleclip.js <构建>[,<构建>...] <场景>[,<场景>...]
const A = require('./analyze.js'), fs = require('fs'), path = require('path'), v = A.v;
const segD = (p0, p1, q0, q1) => { const u = v.sub(p1, p0), w0 = v.sub(q1, q0), w = v.sub(p0, q0), a = v.dot(u, u), b = v.dot(u, w0), c = v.dot(w0, w0), dd = v.dot(u, w), e = v.dot(w0, w), D = a * c - b * b; let s = D > 1e-9 ? (b * e - c * dd) / D : 0; s = Math.max(0, Math.min(1, s)); let t = c > 1e-9 ? (b * s + e) / c : 0; t = Math.max(0, Math.min(1, t)); s = a > 1e-9 ? Math.max(0, Math.min(1, (b * t - dd) / a)) : 0; return v.len(v.sub(v.add(p0, v.mul(u, s)), v.add(q0, v.mul(w0, t)))); };
const [builds, scs] = process.argv.slice(2);
for (const b of builds.split(',')) { let N = 0, any = 0, d20 = 0, d40 = 0, inn = 0, out = 0, th = 0, shn = 0, own = 0, oth = 0;
  for (const sc of scs.split(',')) { const f = path.join(__dirname, 'out', b, sc + '.json'); if (!fs.existsSync(f)) continue; const d = A.load(f), L = d.LEN;
    for (let i = 0; i < d.n; i++) { if (d.flag[i] & 1) continue; N++; const J = k => d.j(k, i), lean = d.p('lean', i); let worst = 0, wsd = '', wpart = '', wown = false;
      for (const sd of ['L', 'R']) { if (d.p('dp', i) > 0) continue; const g = J('grip' + sd), tip = J('tip' + sd), p0 = v.add(g, v.mul(v.sub(tip, g), 0.15 / L.pole));
        for (const [nm, a, c, r, o] of [['大腿', 'hipL', 'kneeL', 0.085, 'L'], ['大腿', 'hipR', 'kneeR', 0.085, 'R'], ['小腿', 'kneeL', 'ankleL', 0.07, 'L'], ['小腿', 'kneeR', 'ankleR', 0.07, 'R']]) { const dep = r + 0.012 - segD(p0, tip, J(a), J(c)); if (dep > worst) { worst = dep; wsd = sd; wpart = nm; wown = o === sd; } } }
      if (worst > 0.005) { any++; if (worst > 0.02) d20++; if (worst > 0.04) d40++; const inside = (lean > 0) === (wsd === 'R'); if (Math.abs(lean) > 0.1) { if (inside) inn++; else out++; } if (wpart === '大腿') th++; else shn++; if (wown) own++; else oth++; } } }
  const P = x => (100 * x / N).toFixed(1).padStart(5) + '%';
  console.log(b.padEnd(9), '在雪上的帧里有杖穿腿', P(any), '｜深过 2 cm', P(d20), '｜深过 4 cm', P(d40), '｜弯内侧那根', P(inn), ' 弯外侧那根', P(out), '｜大腿', P(th), ' 小腿', P(shn), '｜自己一侧的腿', P(own), ' 对侧', P(oth)); }
