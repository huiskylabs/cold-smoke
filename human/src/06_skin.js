// ---------------------------------------------------------------- Human: skin weights and deformation
// Weights come from the body itself: each vertex belongs to the bones whose pieces it lies on, by how far it is from each (the slabs of a loft
// overlap a little at their cuts, so the weights cross a joint over a few centimetres), never across a gap (a thigh's vertex is never weighted to
// the other thigh, an arm's never to the ribs), then smoothed over the surface. Up to four bones per vertex.
// Three ways to deform, for comparison (Variants a / b / c in the lab):
//   a  linear blend (LBS): what most games ship. Loses volume at a bent joint ("collapsing elbow") and twists into a candy wrapper.
//   b  dual quaternions (DQS, Kavan 2008): blends rigid motions, so no collapse; a slight bulge outside a bend.
//   c  DQS, then every vertex is moved onto the posed body's own surface along its gradient (the idea of implicit skinning, Vaillant 2013): the
//      posed distance field has the right volume at every joint and the muscles' bulge, so the skin takes both. No sculpted correctives.
(() => {
  const V = Human.v3, Q = Human.q, B = Human.Body;
  function weights(body, mesh, cBind, opt = {}) {
    const sk = body.sk, parts = body.parts, nv = mesh.nv, pos = mesh.pos, sig = opt.sigma || 0.011;
    // which group each bone's pieces are in
    const boneGroup = new Int8Array(sk.n).fill(-1); parts.forEach(p => { if (p.kind !== 'muscle') boneGroup[p.bone] = p.gi; });
    const ok = (vg, bg) => bg === vg || bg === 0 || (vg === 0 && bg >= 0) || (vg === 1 && bg === 0);
    const W = new Float32Array(nv * sk.n), vg = new Int8Array(nv), out = {};
    for (let v = 0; v < nv; v++) {
      const x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
      B.dist(cBind, x, y, z, 0, out); vg[v] = out.g;
      const db = new Float64Array(sk.n).fill(1e9);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i]; if (p.kind === 'muscle') continue; const bg = boneGroup[p.bone]; if (!ok(out.g, bg)) continue;
        const q = cBind.pc[i]; if (Math.hypot(x - q.cen[0], y - q.cen[1], z - q.cen[2]) - q.rad > 0.08) continue;
        const d = B.partDist(p, cBind, q, x, y, z); if (d < db[p.bone]) db[p.bone] = d;
      }
      let m = 1e9; for (let b = 0; b < sk.n; b++) m = Math.min(m, db[b]);
      for (let b = 0; b < sk.n; b++) if (db[b] < m + 6 * sig) W[v * sk.n + b] = Math.exp(-(db[b] - m) / sig);
    }
    // smooth over the surface (the weights become a smooth field; a few Jacobi steps)
    const adj = mesh.adj || (mesh.adj = Human.Mesh.adjacency(nv, mesh.idx));
    let A = W, Bf = new Float32Array(W.length);
    for (let it = 0; it < (opt.smooth || 6); it++) {
      for (let v = 0; v < nv; v++) {
        const o = v * sk.n, a0 = adj.off[v], a1 = adj.off[v + 1], n = a1 - a0;
        for (let b = 0; b < sk.n; b++) { let s = 0; for (let k = a0; k < a1; k++) s += A[adj.nb[k] * sk.n + b]; Bf[o + b] = 0.5 * A[o + b] + 0.5 * s / Math.max(1, n); }
      }
      const t = A; A = Bf; Bf = t;
    }
    // top four, normalised
    const bi = new Uint8Array(nv * 4), bw = new Float32Array(nv * 4);
    for (let v = 0; v < nv; v++) {
      const o = v * sk.n, top = [];
      for (let b = 0; b < sk.n; b++) { const w = A[o + b]; if (w > 1e-4) top.push([w, b]); }
      top.sort((a, b) => b[0] - a[0]); const s = top.slice(0, 4).reduce((s, t) => s + t[0], 0) || 1;
      for (let k = 0; k < 4; k++) { const t = top[k]; bi[v * 4 + k] = t ? t[1] : 0; bw[v * 4 + k] = t ? t[0] / s : 0; }
    }
    return { bi, bw, vg };
  }

  // skinning transforms for a pose: bone b moves a bind-pose point by  R_b R0_b^-1 (x - P0_b) + P_b
  function boneDQ(xf, bind) {
    const n = xf.R.length, dq = new Float64Array(n * 8), mat = new Float64Array(n * 12);
    for (let b = 0; b < n; b++) {
      const r = Q.norm(Q.mul(xf.R[b], Q.conj(bind.R[b]))), t = V.sub(xf.P[b], Q.rot(r, bind.P[b]));
      const o = b * 8; dq[o] = r[0]; dq[o + 1] = r[1]; dq[o + 2] = r[2]; dq[o + 3] = r[3];
      // dual part: 0.5 * t * r
      const d = Q.mul([t[0], t[1], t[2], 0], r); dq[o + 4] = d[0] * 0.5; dq[o + 5] = d[1] * 0.5; dq[o + 6] = d[2] * 0.5; dq[o + 7] = d[3] * 0.5;
      const ex = Q.rot(r, [1, 0, 0]), ey = Q.rot(r, [0, 1, 0]), ez = Q.rot(r, [0, 0, 1]), m = b * 12;
      mat[m] = ex[0]; mat[m + 1] = ey[0]; mat[m + 2] = ez[0]; mat[m + 3] = t[0]; mat[m + 4] = ex[1]; mat[m + 5] = ey[1]; mat[m + 6] = ez[1]; mat[m + 7] = t[1]; mat[m + 8] = ex[2]; mat[m + 9] = ey[2]; mat[m + 10] = ez[2]; mat[m + 11] = t[2];
    }
    return { dq, mat };
  }
  function deform(mesh, W, xf, bind, mode, out) {
    const nv = mesh.nv, P = mesh.pos, o3 = out || new Float32Array(nv * 3), { dq, mat } = boneDQ(xf, bind), bi = W.bi, bw = W.bw;
    for (let v = 0; v < nv; v++) {
      const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
      if (mode === 'a') {
        let X = 0, Y = 0, Z = 0;
        for (let k = 0; k < 4; k++) { const w = bw[v * 4 + k]; if (!w) continue; const m = bi[v * 4 + k] * 12;
          X += w * (mat[m] * x + mat[m + 1] * y + mat[m + 2] * z + mat[m + 3]); Y += w * (mat[m + 4] * x + mat[m + 5] * y + mat[m + 6] * z + mat[m + 7]); Z += w * (mat[m + 8] * x + mat[m + 9] * y + mat[m + 10] * z + mat[m + 11]); }
        o3[v * 3] = X; o3[v * 3 + 1] = Y; o3[v * 3 + 2] = Z;
      } else {
        // blend dual quaternions (sign-aligned to the first), normalise, apply
        let r0 = 0, r1 = 0, r2 = 0, r3 = 0, d0 = 0, d1 = 0, d2 = 0, d3 = 0; const f = bi[v * 4] * 8;
        for (let k = 0; k < 4; k++) { let w = bw[v * 4 + k]; if (!w) continue; const o = bi[v * 4 + k] * 8;
          if (dq[o] * dq[f] + dq[o + 1] * dq[f + 1] + dq[o + 2] * dq[f + 2] + dq[o + 3] * dq[f + 3] < 0) w = -w;
          r0 += w * dq[o]; r1 += w * dq[o + 1]; r2 += w * dq[o + 2]; r3 += w * dq[o + 3]; d0 += w * dq[o + 4]; d1 += w * dq[o + 5]; d2 += w * dq[o + 6]; d3 += w * dq[o + 7]; }
        const l = Math.hypot(r0, r1, r2, r3); r0 /= l; r1 /= l; r2 /= l; r3 /= l; d0 /= l; d1 /= l; d2 /= l; d3 /= l;
        // rotate
        const tx = 2 * (r1 * z - r2 * y), ty = 2 * (r2 * x - r0 * z), tz = 2 * (r0 * y - r1 * x);
        let X = x + r3 * tx + r1 * tz - r2 * ty, Y = y + r3 * ty + r2 * tx - r0 * tz, Z = z + r3 * tz + r0 * ty - r1 * tx;
        // translation = 2 * dual * conj(real)
        X += 2 * (-d3 * r0 + d0 * r3 - d1 * r2 + d2 * r1); Y += 2 * (-d3 * r1 + d1 * r3 - d2 * r0 + d0 * r2); Z += 2 * (-d3 * r2 + d2 * r3 - d0 * r1 + d1 * r0);
        o3[v * 3] = X; o3[v * 3 + 1] = Y; o3[v * 3 + 2] = Z;
      }
    }
    return o3;
  }
  // c: move each vertex onto the posed surface along the field's gradient (up to maxMove; a vertex whose field turns sharply, meaning it is in
  // contact with another part, stops there, as in implicit skinning). Only vertices near a joint need it: the rest ride one bone rigidly.
  function project(c, pos, W, opt = {}) {
    const nv = pos.length / 3, maxMove = opt.maxMove || 0.03, out = new Float32Array(pos), moved = new Float32Array(nv);
    for (let v = 0; v < nv; v++) {
      if (W.bw[v * 4] > (opt.rigid || 0.985) && !opt.all) continue;
      let x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2], g0 = null;
      for (let it = 0; it < 3; it++) {
        const d = B.dist(c, x, y, z); if (Math.abs(d) < 2e-4) break;
        const g = B.grad(c, x, y, z), gl = Math.hypot(g[0], g[1], g[2]); if (gl < 1e-6) break;
        const n = [g[0] / gl, g[1] / gl, g[2] / gl];
        if (g0 && n[0] * g0[0] + n[1] * g0[1] + n[2] * g0[2] < 0.55) break;            // contact: stop
        g0 = g0 || n;
        const s = d / gl;
        x -= n[0] * s; y -= n[1] * s; z -= n[2] * s;
      }
      let dx = x - pos[v * 3], dy = y - pos[v * 3 + 1], dz = z - pos[v * 3 + 2]; const m = Math.hypot(dx, dy, dz);
      if (m > maxMove) { const k = maxMove / m; dx *= k; dy *= k; dz *= k; }
      out[v * 3] += dx; out[v * 3 + 1] += dy; out[v * 3 + 2] += dz; moved[v] = Math.min(m, maxMove);
    }
    // the moves are smoothed over the surface (a vertex stopped by a contact and its neighbour that was not would otherwise make a step)
    if (opt.adj) {
      const adj = opt.adj; let D = new Float32Array(nv * 3), E = new Float32Array(nv * 3);
      for (let i = 0; i < nv * 3; i++) D[i] = out[i] - pos[i];
      for (let it = 0; it < (opt.smooth || 4); it++) {
        for (let v = 0; v < nv; v++) { const a0 = adj.off[v], a1 = adj.off[v + 1]; let sx = 0, sy = 0, sz = 0;
          for (let k = a0; k < a1; k++) { const u = adj.nb[k] * 3; sx += D[u]; sy += D[u + 1]; sz += D[u + 2]; }
          const n = Math.max(1, a1 - a0); E[v * 3] = 0.5 * D[v * 3] + 0.5 * sx / n; E[v * 3 + 1] = 0.5 * D[v * 3 + 1] + 0.5 * sy / n; E[v * 3 + 2] = 0.5 * D[v * 3 + 2] + 0.5 * sz / n; }
        const t = D; D = E; E = t;
      }
      for (let i = 0; i < nv * 3; i++) out[i] = pos[i] + D[i];
    }
    return { pos: out, moved };
  }
  Human.Skin = { weights, deform, project, boneDQ };
})();
