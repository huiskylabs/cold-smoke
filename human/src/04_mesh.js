// ---------------------------------------------------------------- Human: the body's surface, meshed once in the bind pose
// Sparse surface nets over the posed distance field: a coarse pass finds the blocks the surface passes through, only those are sampled finely, one
// vertex per cell the surface crosses (the mean of its edge crossings), one quad per crossed edge; then every vertex is moved onto the surface
// along the field's gradient. (The topology is fixed per body shape; research/03 wants one fixed template for every shape later.)
(() => {
  const B = Human.Body;
  function mesh(c, h = 0.008, opt = {}) {
    const t0 = performance.now();
    // bounds from the pieces' spheres
    let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    c.pc.forEach((q, i) => { const p = c.body.parts[i]; if (p.kind === 'muscle') return; const r = Math.min(q.rad, 0.5); for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], q.cen[a] - r); hi[a] = Math.max(hi[a], q.cen[a] + r); } });
    lo = lo.map(v => v - 2 * h); hi = hi.map(v => v + 2 * h);
    const BS = 4, nx = Math.ceil((hi[0] - lo[0]) / h / BS) * BS, ny = Math.ceil((hi[1] - lo[1]) / h / BS) * BS, nz = Math.ceil((hi[2] - lo[2]) / h / BS) * BS;
    const cx = nx + 1, cy = ny + 1, cz = nz + 1, G = new Float32Array(cx * cy * cz).fill(NaN);
    const id = (i, j, k) => (k * cy + j) * cx + i;
    const mask = opt.mask;
    const f = (i, j, k) => { const o = id(i, j, k); let v = G[o]; if (v !== v) { v = G[o] = B.dist(c, lo[0] + i * h, lo[1] + j * h, lo[2] + k * h, mask); } return v; };
    // coarse blocks
    const bx = nx / BS, by = ny / BS, bz = nz / BS, act = new Uint8Array(bx * by * bz), half = Math.sqrt(3) * BS * h / 2;
    let nact = 0;
    for (let k = 0; k < bz; k++) for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) {
      const d = B.dist(c, lo[0] + (i + 0.5) * BS * h, lo[1] + (j + 0.5) * BS * h, lo[2] + (k + 0.5) * BS * h, mask);
      if (Math.abs(d) < half * 1.2 + 0.004) { act[(k * by + j) * bx + i] = 1; nact++; }
    }
    // cells
    const vid = new Int32Array(nx * ny * nz).fill(-1), P = [];
    const cid = (i, j, k) => (k * ny + j) * nx + i;
    const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    const cv = new Float32Array(8);
    for (let K = 0; K < bz; K++) for (let J = 0; J < by; J++) for (let Ii = 0; Ii < bx; Ii++) {
      if (!act[(K * by + J) * bx + Ii]) continue;
      for (let k = K * BS; k < K * BS + BS; k++) for (let j = J * BS; j < J * BS + BS; j++) for (let i = Ii * BS; i < Ii * BS + BS; i++) {
        let neg = 0;
        for (let q = 0; q < 8; q++) { cv[q] = f(i + (q & 1), j + (q >> 1 & 1), k + (q >> 2 & 1)); if (cv[q] < 0) neg++; }
        if (neg === 0 || neg === 8) continue;
        let sx = 0, sy = 0, sz = 0, n = 0;
        for (const [a, b] of E) { const va = cv[a], vb = cv[b]; if ((va < 0) === (vb < 0)) continue; const t = va / (va - vb);
          sx += (a & 1) + ((b & 1) - (a & 1)) * t; sy += (a >> 1 & 1) + ((b >> 1 & 1) - (a >> 1 & 1)) * t; sz += (a >> 2 & 1) + ((b >> 2 & 1) - (a >> 2 & 1)) * t; n++; }
        vid[cid(i, j, k)] = P.length / 3;
        P.push(lo[0] + (i + sx / n) * h, lo[1] + (j + sy / n) * h, lo[2] + (k + sz / n) * h);
      }
    }
    // quads: for each grid edge with a sign change, the four cells around it
    const T = [];
    const quad = (a, b, c2, d, flip) => { if (a < 0 || b < 0 || c2 < 0 || d < 0) return; if (!flip) T.push(a, c2, b, a, d, c2); else T.push(a, b, c2, a, c2, d); };
    for (let k = 1; k < nz; k++) for (let j = 1; j < ny; j++) for (let i = 1; i < nx; i++) {
      const o = id(i, j, k), v0 = G[o]; if (v0 !== v0) continue;
      const vx = G[o + 1], vy = G[o + cx], vz = G[o + cx * cy];
      if (vx === vx && i < nx && (v0 < 0) !== (vx < 0)) quad(vid[cid(i, j - 1, k - 1)], vid[cid(i, j, k - 1)], vid[cid(i, j, k)], vid[cid(i, j - 1, k)], v0 < 0);
      if (vy === vy && j < ny && (v0 < 0) !== (vy < 0)) quad(vid[cid(i - 1, j, k - 1)], vid[cid(i - 1, j, k)], vid[cid(i, j, k)], vid[cid(i, j, k - 1)], v0 < 0);
      if (vz === vz && k < nz && (v0 < 0) !== (vz < 0)) quad(vid[cid(i - 1, j - 1, k)], vid[cid(i, j - 1, k)], vid[cid(i, j, k)], vid[cid(i - 1, j, k)], v0 < 0);
    }
    const pos = new Float32Array(P), nv = pos.length / 3;
    // onto the surface
    for (let v = 0; v < nv; v++) {
      for (let it = 0; it < 2; it++) {
        const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2], d = B.dist(c, x, y, z, mask);
        if (Math.abs(d) < 1e-5) break;
        const g = B.grad(c, x, y, z, mask), gl = g[0] * g[0] + g[1] * g[1] + g[2] * g[2]; if (gl < 1e-6) break;
        const s = Math.max(-h, Math.min(h, d / gl * Math.sqrt(gl))) / Math.sqrt(gl);
        pos[v * 3] -= g[0] * s; pos[v * 3 + 1] -= g[1] * s; pos[v * 3 + 2] -= g[2] * s;
      }
    }
    const idx = new Uint32Array(T);
    return { pos, idx, nv, nt: idx.length / 3, h, ms: performance.now() - t0, cells: nact * BS * BS * BS };
  }
  // per-vertex normals from the triangles (area weighted)
  function normals(pos, idx, out) {
    const N = out || new Float32Array(pos.length); N.fill(0);
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
      const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      for (const o of [a, b, c]) { N[o] += nx; N[o + 1] += ny; N[o + 2] += nz; }
    }
    for (let i = 0; i < N.length; i += 3) { const l = Math.hypot(N[i], N[i + 1], N[i + 2]) || 1; N[i] /= l; N[i + 1] /= l; N[i + 2] /= l; }
    return N;
  }
  // enclosed volume (litres) by the divergence theorem
  function volume(pos, idx) {
    let v = 0;
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
      v += pos[a] * (pos[b + 1] * pos[c + 2] - pos[b + 2] * pos[c + 1]) - pos[a + 1] * (pos[b] * pos[c + 2] - pos[b + 2] * pos[c]) + pos[a + 2] * (pos[b] * pos[c + 1] - pos[b + 1] * pos[c]);
    }
    return v / 6 * 1000;
  }
  // vertex neighbours (for smoothing)
  function adjacency(nv, idx) {
    const sets = Array.from({ length: nv }, () => new Set());
    for (let t = 0; t < idx.length; t += 3) for (let e = 0; e < 3; e++) { const a = idx[t + e], b = idx[t + (e + 1) % 3]; sets[a].add(b); sets[b].add(a); }
    const off = new Uint32Array(nv + 1); let n = 0; sets.forEach((s, i) => { off[i] = n; n += s.size; }); off[nv] = n;
    const nb = new Uint32Array(n); sets.forEach((s, i) => { let o = off[i]; for (const j of s) nb[o++] = j; });
    return { off, nb };
  }
  Human.Mesh = { mesh, normals, volume, adjacency };
})();
