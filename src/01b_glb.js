// ---------------------------------------------------------------- lightweight glTF 2.0 (.glb) loader & PBR + IBL static/prop renderer
// Zero dependencies. Parses standard binary .glb files (meshes, hierarchy transforms, embedded Albedo / Normal / Metallic-Roughness
// PBR textures) and renders them with Cold Smoke's GGX PBR + Sky/Snow IBL lighting, shadows, and atmospheric fog.
//
// Usage:
//   const model = await GLB.load(gfx, 'assets/cabin.glb');          // or GLB.parse(gfx, arrayBuffer)
//   GLB.draw(model, worldMat4, shadowTex, skyTex);                  // draw with full PBR + IBL + shadows + fog
//   GLB.drawShadow(model, worldMat4);                               // cast into shadow map

const GLB = (() => {
  const MAGIC = 0x46546C67; // 'glTF'
  const CHUNK_JSON = 0x4E4F534A;
  const CHUNK_BIN  = 0x004E4942;
  const COMP_SIZES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
  const TYPE_NUMS  = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

  let pbrPipe = null, shadowPipe = null, defWhite = null, defNrm = null, defOrm = null, curGfx = null;

  function ensurePipelines(gfx) {
    if (pbrPipe && curGfx === gfx) return;
    curGfx = gfx;
    defWhite = gfx.texture({ w: 1, h: 1, format: 'rgba8', data: new Uint8Array([255, 255, 255, 255]), filter: 'linear', wrap: 'repeat' });
    defNrm   = gfx.texture({ w: 1, h: 1, format: 'rgba8', data: new Uint8Array([128, 128, 255, 255]), filter: 'linear', wrap: 'repeat' });
    defOrm   = gfx.texture({ w: 1, h: 1, format: 'rgba8', data: new Uint8Array([255, 180, 0, 255]),   filter: 'linear', wrap: 'repeat' });

    const BUFS = [{ attrs: [['pos', 'vec3f'], ['nrm', 'vec3f'], ['uv', 'vec2f']] }];
    pbrPipe = gfx.pipeline({
      name: 'glbPBR',
      lib: [SL.common, SL.fog, SL.shadow],
      buffers: BUFS,
      varyings: { wp: 'vec3f', nrm: 'vec3f', uv: 'vec2f' },
      uniforms: { m0: 'vec4f', m1: 'vec4f', m2: 'vec4f', m3: 'vec4f', pbr: 'vec4f', base: 'vec4f' },
      textures: { tAlb: '2d', tNrm: '2d', tOrm: '2d', tShadow: 'shadow', tSky: '2d' },
      vs: `fn vert(a: VIn) -> VOut {
        var v: VOut;
        let W: mat4x4f = mat4x4f(M.m0, M.m1, M.m2, M.m3);
        let wp: vec4f = W * vec4f(a.pos, 1.0);
        v.wp = wp.xyz;
        v.nrm = normalize((W * vec4f(a.nrm, 0.0)).xyz);
        v.uv = a.uv;
        v.clip = U.viewProj * wp;
        return v;
      }`,
      fs: `fn frag(v: VOut) -> FOut {
        var o: FOut;
        let ts: vec4f = tex(tAlb, v.uv);
        if (ts.a * M.base.a < 0.35) { discard; }
        let alb: vec3f = pow(max(ts.rgb, vec3f(0.0001)), vec3f(2.2)) * M.base.rgb;
        let orm: vec4f = tex(tOrm, v.uv);
        let rough: f32 = clamp(orm.g * M.pbr.x, 0.05, 0.98);
        let metal: f32 = clamp(orm.b * M.pbr.y, 0.0, 1.0);
        let ao: f32 = mix(1.0, orm.r, M.pbr.z);

        var N: vec3f = normalize(v.nrm);
        let nm: vec3f = tex(tNrm, v.uv).xyz * 2.0 - 1.0;
        let dp1: vec3f = dpdx(v.wp); let dp2: vec3f = dpdy(v.wp);
        let duv1: vec2f = dpdx(v.uv); let duv2: vec2f = dpdy(v.uv);
        let dp2p: vec3f = cross(dp2, N); let dp1p: vec3f = cross(N, dp1);
        let T: vec3f = dp2p * duv1.x + dp1p * duv2.x;
        let B: vec3f = dp2p * duv1.y + dp1p * duv2.y;
        let invM: f32 = 1.0 / max(sqrt(max(dot(T, T), dot(B, B))), 1e-6);
        N = normalize(N * nm.z + (T * nm.x - B * nm.y) * (invM * M.pbr.w));

        let V: vec3f = normalize(U.camPos.xyz - v.wp);
        let L: vec3f = U.sunDir.xyz;
        let H: vec3f = normalize(V + L);
        let ndl: f32 = max(dot(N, L), 0.0);
        let ndv: f32 = max(dot(N, V), 0.001);
        let ndh: f32 = max(dot(N, H), 0.0);
        let hdv: f32 = max(dot(H, V), 0.0);
        let sh: f32 = shadowAt(v.wp + N * 0.04, 0.0018);

        // Cook-Torrance GGX direct sun lighting
        let f0: vec3f = mix(vec3f(0.04), alb, metal);
        let a: f32 = rough * rough; let a2: f32 = a * a;
        let dn: f32 = ndh * ndh * (a2 - 1.0) + 1.0;
        let D: f32 = a2 / max(3.14159265 * dn * dn, 1e-5);
        let kG: f32 = (rough + 1.0) * (rough + 1.0) * 0.125;
        let G: f32 = (ndv / (ndv * (1.0 - kG) + kG)) * (ndl / (ndl * (1.0 - kG) + kG));
        let F: vec3f = f0 + (vec3f(1.0) - f0) * pow(1.0 - hdv, 5.0);
        let specD: vec3f = (D * G * F) / max(4.0 * ndv * ndl, 0.001);
        let kD: vec3f = (vec3f(1.0) - F) * (1.0 - metal);
        let sunCol: vec3f = (kD * alb / 3.14159265 + specD) * U.sunCol.rgb * ndl * sh * 3.14159265;

        // Sky + Snow hemisphere IBL (diffuse + roughness-weighted specular reflection)
        let amb: vec3f = U.ambSky.rgb * (0.5 + 0.5 * N.y) + U.ambGnd.rgb * (0.5 - 0.5 * N.y) * 1.25 + twiLight(N);
        let R: vec3f = reflect(-V, N);
        var env: vec3f = skyLut(normalize(vec3f(R.x, abs(R.y) * 0.9 + 0.02, R.z)));
        env = mix(env, vec3f(0.75, 0.80, 0.90) * (U.ambSky.rgb + U.sunCol.rgb * 0.35), smoothstep(0.05, -0.25, R.y));
        let Fenv: vec3f = f0 + (max(vec3f(1.0 - rough), f0) - f0) * pow(1.0 - ndv, 5.0);
        let specIBL: vec3f = env * Fenv * (1.0 - rough * 0.85) * ao;
        var col: vec3f = sunCol + kD * alb * amb * ao + specIBL;
        col = applyFog(col, v.wp);
        o.color = vec4f(col, 1.0);
        return o;
      }`,
    });

    shadowPipe = gfx.pipeline({
      name: 'glbShadow',
      lib: [SL.common],
      buffers: BUFS,
      varyings: {},
      uniforms: { m0: 'vec4f', m1: 'vec4f', m2: 'vec4f', m3: 'vec4f' },
      textures: {},
      colorFormat: null,
      cull: 'none',
      depthBias: 0,
      depthBiasSlope: 0,
      vs: `fn vert(a: VIn) -> VOut {
        var v: VOut;
        let W: mat4x4f = mat4x4f(M.m0, M.m1, M.m2, M.m3);
        let wp: vec4f = W * vec4f(a.pos, 1.0);
        v.clip = U.shadowVP * wp;
        return v;
      }`,
      fs: null,
    });
  }

  function readAccessor(gltf, bin, accIdx) {
    const acc = gltf.accessors[accIdx];
    const bv = gltf.bufferViews[acc.bufferView];
    const byteOff = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const nComp = TYPE_NUMS[acc.type] || 1;
    const compSize = COMP_SIZES[acc.componentType] || 4;
    const stride = bv.byteStride || (nComp * compSize);
    const count = acc.count;
    const dv = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
    const out = acc.componentType === 5126 ? new Float32Array(count * nComp) : new Uint32Array(count * nComp);
    for (let i = 0; i < count; i++) {
      const base = byteOff + i * stride;
      for (let c = 0; c < nComp; c++) {
        const o = base + c * compSize;
        if (acc.componentType === 5126) out[i * nComp + c] = dv.getFloat32(o, true);
        else if (acc.componentType === 5123) out[i * nComp + c] = dv.getUint16(o, true);
        else if (acc.componentType === 5125) out[i * nComp + c] = dv.getUint32(o, true);
        else if (acc.componentType === 5121) out[i * nComp + c] = dv.getUint8(o);
        else if (acc.componentType === 5122) out[i * nComp + c] = dv.getInt16(o, true);
        else out[i * nComp + c] = dv.getInt8(o);
      }
    }
    return { data: out, count, nComp };
  }

  function nodeLocalMat(node) {
    if (node.matrix) return node.matrix.slice();
    const t = node.translation || [0, 0, 0];
    const q = node.rotation || [0, 0, 0, 1];
    const s = node.scale || [1, 1, 1];
    const [x, y, z, w] = q;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    return [
      (1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0,
      (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0,
      (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0,
      t[0], t[1], t[2], 1,
    ];
  }

  async function decodeImageTex(gfx, gltf, bin, texInfo) {
    if (!texInfo || texInfo.index == null) return null;
    const tex = gltf.textures && gltf.textures[texInfo.index];
    if (!tex || tex.source == null) return null;
    const imgDef = gltf.images && gltf.images[tex.source];
    if (!imgDef || imgDef.bufferView == null) return null;
    const bv = gltf.bufferViews[imgDef.bufferView];
    const bytes = new Uint8Array(bin.buffer, bin.byteOffset + (bv.byteOffset || 0), bv.byteLength);
    const blob = new Blob([bytes], { type: imgDef.mimeType || 'image/png' });
    if (typeof createImageBitmap !== 'undefined' && typeof document !== 'undefined') {
      const bmp = await createImageBitmap(blob);
      const cv = document.createElement('canvas'); cv.width = bmp.width; cv.height = bmp.height;
      const cx = cv.getContext('2d'); cx.drawImage(bmp, 0, 0);
      const id = cx.getImageData(0, 0, bmp.width, bmp.height);
      if (bmp.close) bmp.close();
      return gfx.texture({ w: id.width, h: id.height, format: 'rgba8', data: new Uint8Array(id.data.buffer), filter: 'linear', wrap: 'repeat' });
    }
    return null;
  }

  async function parse(gfx, arrayBuffer) {
    const dv = new DataView(arrayBuffer);
    if (dv.getUint32(0, true) !== MAGIC) throw new Error('GLB: invalid magic header');
    const totalLen = dv.getUint32(8, true);
    let off = 12, gltf = null, bin = null;
    while (off + 8 <= totalLen) {
      const cLen = dv.getUint32(off, true), cType = dv.getUint32(off + 4, true);
      off += 8;
      if (cType === CHUNK_JSON) {
        const txt = new TextDecoder('utf-8').decode(new Uint8Array(arrayBuffer, off, cLen));
        gltf = JSON.parse(txt);
      } else if (cType === CHUNK_BIN) {
        bin = new Uint8Array(arrayBuffer, off, cLen);
      }
      off += cLen;
    }
    if (!gltf || !bin) throw new Error('GLB: missing JSON or BIN chunk');
    if (gfx) ensurePipelines(gfx);

    // Decode all embedded materials (Albedo, Normal, MetallicRoughness)
    const mats = [];
    for (const mdef of (gltf.materials || [])) {
      const pbr = mdef.pbrMetallicRoughness || {};
      const tAlb = gfx ? (await decodeImageTex(gfx, gltf, bin, pbr.baseColorTexture)) || defWhite : null;
      const tNrm = gfx ? (await decodeImageTex(gfx, gltf, bin, mdef.normalTexture)) || defNrm : null;
      const tOrm = gfx ? (await decodeImageTex(gfx, gltf, bin, pbr.metallicRoughnessTexture)) || defOrm : null;
      const bf = pbr.baseColorFactor || [1, 1, 1, 1];
      mats.push({
        tAlb, tNrm, tOrm,
        base: [bf[0], bf[1], bf[2], bf[3] != null ? bf[3] : 1],
        pbr: [pbr.roughnessFactor != null ? pbr.roughnessFactor : 1.0, pbr.metallicFactor != null ? pbr.metallicFactor : 1.0, mdef.occlusionTexture ? 1.0 : 0.0, mdef.normalTexture && mdef.normalTexture.scale != null ? mdef.normalTexture.scale : 1.0],
      });
    }
    const defMat = { tAlb: defWhite, tNrm: defNrm, tOrm: defOrm, base: [1, 1, 1, 1], pbr: [0.7, 0.0, 0.0, 1.0] };

    // Traverse scene graph to collect world transforms per mesh instance
    const nodes = gltf.nodes || [];
    const worldM = new Array(nodes.length);
    const ID = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    function visit(ni, parentM) {
      const node = nodes[ni]; if (!node) return;
      const W = m4.mul(parentM, nodeLocalMat(node));
      worldM[ni] = W;
      if (node.children) for (const ch of node.children) visit(ch, W);
    }
    const sc = (gltf.scenes && gltf.scenes[gltf.scene || 0]) || { nodes: nodes.map((_, i) => i) };
    for (const r of (sc.nodes || [])) visit(r, ID);

    // Build GPU buffers for every primitive
    const parts = [];
    for (let ni = 0; ni < nodes.length; ni++) {
      const node = nodes[ni];
      if (!node || node.mesh == null) continue;
      const mesh = gltf.meshes[node.mesh];
      const W = worldM[ni] || ID;
      for (const prim of (mesh.primitives || [])) {
        if (prim.attributes.POSITION == null) continue;
        const pos = readAccessor(gltf, bin, prim.attributes.POSITION);
        const nrm = prim.attributes.NORMAL != null ? readAccessor(gltf, bin, prim.attributes.NORMAL) : null;
        const uv  = prim.attributes.TEXCOORD_0 != null ? readAccessor(gltf, bin, prim.attributes.TEXCOORD_0) : null;
        const idx = prim.indices != null ? readAccessor(gltf, bin, prim.indices).data : Uint32Array.from({ length: pos.count }, (_, i) => i);
        const V = new Float32Array(pos.count * 8);
        for (let i = 0; i < pos.count; i++) {
          const o = i * 8;
          V[o] = pos.data[i * 3]; V[o + 1] = pos.data[i * 3 + 1]; V[o + 2] = pos.data[i * 3 + 2];
          V[o + 3] = nrm ? nrm.data[i * 3] : 0; V[o + 4] = nrm ? nrm.data[i * 3 + 1] : 1; V[o + 5] = nrm ? nrm.data[i * 3 + 2] : 0;
          V[o + 6] = uv ? uv.data[i * 2] : 0; V[o + 7] = uv ? uv.data[i * 2 + 1] : 0;
        }
        parts.push({
          vb: gfx ? gfx.buffer(V, 'vertex') : null,
          ib: gfx ? gfx.buffer(idx, 'index') : null,
          count: idx.length,
          nv: pos.count,
          localM: W,
          mat: prim.material != null && mats[prim.material] ? mats[prim.material] : defMat,
        });
      }
    }
    return { parts, gltf };
  }

  async function load(gfx, url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('GLB.load HTTP ' + res.status + ' for ' + url);
    return parse(gfx, await res.arrayBuffer());
  }

  function matCols(W) {
    return {
      m0: [W[0], W[1], W[2], W[3]],
      m1: [W[4], W[5], W[6], W[7]],
      m2: [W[8], W[9], W[10], W[11]],
      m3: [W[12], W[13], W[14], W[15]],
    };
  }

  function draw(model, worldMat, shadowTex, skyTex) {
    if (!model || !pbrPipe || !curGfx) return;
    for (const p of model.parts) {
      if (!p.vb || !p.ib || !p.count) continue;
      const W = worldMat ? m4.mul(worldMat, p.localM) : p.localM;
      const cols = matCols(W);
      curGfx.draw(pbrPipe, {
        u: { m0: cols.m0, m1: cols.m1, m2: cols.m2, m3: cols.m3, pbr: p.mat.pbr, base: p.mat.base },
        tex: { tAlb: p.mat.tAlb, tNrm: p.mat.tNrm, tOrm: p.mat.tOrm, tShadow: shadowTex, tSky: skyTex },
        vb: [p.vb], ib: p.ib, count: p.count,
      });
    }
  }

  function drawShadow(model, worldMat) {
    if (!model || !shadowPipe || !curGfx) return;
    for (const p of model.parts) {
      if (!p.vb || !p.ib || !p.count) continue;
      const W = worldMat ? m4.mul(worldMat, p.localM) : p.localM;
      const cols = matCols(W);
      curGfx.draw(shadowPipe, { u: cols, tex: {}, vb: [p.vb], ib: p.ib, count: p.count });
    }
  }

  return { load, parse, draw, drawShadow };
})();
