// ---------------------------------------------------------------- Human: the reference body (a real modelled man, for study)
// Human.REFDATA (09a_refdata.js) is an open, artist-made mesh with skin weights. Here it is hung on this module's skeleton so that every pose
// and clip of Human.Motion plays on it: the skeleton's joints are moved to the mesh's joints, and the mesh's own pose (arms down at an angle,
// legs a little apart) is the bind pose: each bone's bind rotation says how far that pose is from this skeleton's rest frame.
(() => {
  const V = Human.v3, Q = Human.q;
  const bytes = s => typeof atob === 'function' ? Uint8Array.from(atob(s), c => c.charCodeAt(0)) : new Uint8Array(Buffer.from(s, 'base64'));
  let cache = null;
  function build() {
    if (cache) return cache; const D = Human.REFDATA; if (!D) return null;
    const M = Human.measure(Human.DEFAULTS), sk = Human.Skeleton.build(M);
    // rest (canonical) joints: each bone's offset from its parent, turned back by the parent's bind rotation
    const Jc = [];
    for (const b of sk.bones) Jc[b.i] = b.p < 0 ? D.J[b.i].slice() : V.add(Jc[b.p], Q.rot(Q.conj(D.R[b.p]), V.sub(D.J[b.i], D.J[b.p])));
    sk.bones.forEach(b => { b.J = Jc[b.i]; });
    const q16 = new Uint16Array(bytes(D.pos).buffer), pos = new Float32Array(D.nv * 3);
    for (let i = 0; i < D.nv; i++) { pos[i * 3] = q16[i * 3] / 30000 - 1; pos[i * 3 + 1] = q16[i * 3 + 1] / 30000; pos[i * 3 + 2] = q16[i * 3 + 2] / 30000 - 1; }
    const idx = Uint32Array.from(new Uint16Array(bytes(D.idx).buffer)), bi = Int32Array.from(bytes(D.bi)), bw = Float32Array.from(bytes(D.bw), w => w / 255);
    cache = { sk, M, mesh: { nv: D.nv, nt: D.nt, pos, idx }, W: { bi, bw }, bind: { R: D.R.map(r => r.slice()), P: D.J.map(p => p.slice()) } };
    return cache;
  }
  Human.RefBody = { build };
})();
