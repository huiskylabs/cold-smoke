// ---------------------------------------------------------------- Human: small vector / quaternion / dual-quaternion helpers
// The human body module (human/) is self-contained: it reads no game globals and can be dropped into any page.
// Everything lives under the one global `Human`.
var Human = (typeof Human !== 'undefined' && Human) || {};
(() => {
  const V = Human.v3 = {
    add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
    sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
    mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
    mad: (a, b, s) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s],
    dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    len: a => Math.hypot(a[0], a[1], a[2]),
    norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
    lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
  };
  // quaternions [x, y, z, w]
  const Q = Human.q = {
    id: () => [0, 0, 0, 1],
    axis(ax, ang) { const s = Math.sin(ang / 2), n = V.norm(ax); return [n[0] * s, n[1] * s, n[2] * s, Math.cos(ang / 2)]; },
    mul(a, b) { return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]]; },
    conj: a => [-a[0], -a[1], -a[2], a[3]],
    norm(a) { const l = Math.hypot(a[0], a[1], a[2], a[3]) || 1; return [a[0] / l, a[1] / l, a[2] / l, a[3] / l]; },
    rot(q, v) { const x = q[0], y = q[1], z = q[2], w = q[3], tx = 2 * (y * v[2] - z * v[1]), ty = 2 * (z * v[0] - x * v[2]), tz = 2 * (x * v[1] - y * v[0]);
      return [v[0] + w * tx + y * tz - z * ty, v[1] + w * ty + z * tx - x * tz, v[2] + w * tz + x * ty - y * tx]; },
    // intrinsic X then Y then Z (radians)
    euler(x, y, z) { return Q.mul(Q.mul(Q.axis([1, 0, 0], x), Q.axis([0, 1, 0], y)), Q.axis([0, 0, 1], z)); },
    slerp(a, b, t) { let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; if (d < 0) { b = b.map(v => -v); d = -d; }
      if (d > 0.9995) return Q.norm(a.map((v, i) => v + (b[i] - v) * t)); const th = Math.acos(d), s = Math.sin(th), wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s; return a.map((v, i) => v * wa + b[i] * wb); },
    // swing-twist about a unit axis: returns [swing, twist], q = swing * twist
    swingTwist(q, ax) { const d = q[0] * ax[0] + q[1] * ax[1] + q[2] * ax[2]; let tw = [ax[0] * d, ax[1] * d, ax[2] * d, q[3]]; const l = Math.hypot(...tw); tw = l < 1e-9 ? [0, 0, 0, 1] : tw.map(v => v / l); return [Q.mul(q, Q.conj(tw)), tw]; },
    angle(q) { return 2 * Math.atan2(Math.hypot(q[0], q[1], q[2]), Math.abs(q[3])); },
    pow(q, t) { const [x, y, z, w] = q[3] < 0 ? q.map(v => -v) : q, s = Math.hypot(x, y, z); if (s < 1e-9) return [0, 0, 0, 1]; const a = Math.atan2(s, w) * t; return [x / s * Math.sin(a), y / s * Math.sin(a), z / s * Math.sin(a), Math.cos(a)]; },
  };
  Human.clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  Human.smooth = (a, b, x) => { const t = Human.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  Human.smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
  Human.DEG = Math.PI / 180;
})();
