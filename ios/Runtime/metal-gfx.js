// One ordered message per frame. Buffer/texture payloads share a byte slab;
// WebKit's message bridge transports property lists, not typed arrays.
window.setMetalViewport = (width, height) => {
  const platform = self.COLD_SMOKE;
  if (platform.viewport?.width === width && platform.viewport?.height === height) return;
  platform.viewport = { width, height };
  UI.layout();
  if (Render.W) {
    // Measure the new display at the selected quality before adapting to its GPU load.
    Gov.work = Gov.acc = Gov.n = Gov.slow = Gov.fast = Gov.calm = Gov.downs = 0;
    Gov.t0 = performance.now();
    Render.scale = 1; App.fit(); App.redraw();
  }
};

self.COLD_SMOKE.createGraphics = async function (canvas) {
  const bridge = window.webkit.messageHandlers.metal;
  const caps = await bridge.postMessage({ device: true });
  const gfx = { caps, lost: false, gpuSeconds: 0 };
  let nextID = 1, commands = [], used = 0, inFlight = 0, terminalError;
  let bytes = new Uint8Array(65536);
  const push = (...args) => commands.push(args);
  function append(data) {
    const start = used, size = data.byteLength;
    used += size;
    if (used > bytes.length) {
      const larger = new Uint8Array(Math.max(used, bytes.length * 2));
      larger.set(bytes.subarray(0, start)); bytes = larger;
    }
    bytes.set(new Uint8Array(data.buffer, data.byteOffset, size), start);
    return [start, size];
  }
  function encoded() {
    if (typeof bytes.toBase64 === 'function') return bytes.subarray(0, used).toBase64();
    const parts = [];
    for (let i = 0; i < used; i += 24576) parts.push(btoa(String.fromCharCode(...bytes.subarray(i, Math.min(used, i + 24576)))));
    return parts.join('');
  }
  // Limit startup memory as large static meshes are generated. Each message
  // is consumed in order by the same native queue, including shader creation.
  function flush() {
    if (!commands.length) return Promise.resolve();
    const reply = bridge.postMessage({ commands, bytes: encoded() });
    commands = []; used = 0;
    return reply.catch(e => {
      if (!terminalError) { terminalError = e; App.ready = false; reportError(e); }
      throw e;
    });
  }
  let frame = false;
  function checkpoint() { if (!frame && used >= 1024 * 1024) flush().catch(() => {}); }
  gfx.texture = ({ data, ...o }) => {
    const t = { ...o, id: nextID++, levels: o.mips ? 1 + Math.floor(Math.log2(Math.max(o.w, o.h))) : 1 };
    push('texture', t.id, o);
    if (data) gfx.updateTexture(t, 0, 0, o.w, o.h, data);
    return t;
  };
  gfx.updateTexture = (t,x,y,w,h,data) => { push('pixels', t.id, x,y,w,h, ...append(data)); checkpoint(); };
  gfx.genMips = t => push('mips', t.id);
  gfx.destroyTexture = t => { if (t) push('dropTexture', t.id); };
  gfx.target = ({color, depth, level = 0}) => {
    const t = color || depth;
    return { color, depth, level, w: Math.max(1,t.w >> level), h: Math.max(1,t.h >> level) };
  };
  gfx.destroyTarget = () => {};
  gfx.buffer = (data, kind) => {
    const b = { id: nextID++, kind, size: data.byteLength };
    push('buffer', b.id, ...append(data)); checkpoint(); return b;
  };
  gfx.updateBuffer = (b,offset,data,discardTail = false) => {
    if (offset === 0 && (discardTail || data.byteLength === b.size)) {
      push('replace', b.id, ...append(data));
    } else {
      push('write', b.id, offset, ...append(data));
    }
    checkpoint();
  };
  gfx.destroyBuffer = b => { if (b) push('dropBuffer', b.id); };
  gfx.pipeline = desc => {
    const { lib, vs, fs, buffers = [], textures = {}, uniforms, varyings, ...state } = desc;
    const p = { id: nextID++, name: desc.name, layout: uniformLayout(desc), texNames: Object.keys(textures) };
    p.ubuf = new Float32Array(p.layout.size);
    push('pipeline', p.id, { ...state, fragment: !!fs, source: metalShader(desc),
      attributes: buffers.map(b => ({ instanced: !!b.instanced, sizes: b.attrs.map(a => SSL_SIZE[a[1]]) })) });
    return p;
  };
  gfx.finishPipelineAsync = async p => {
    // A camera or outfit can lazily create a pipeline inside a frame. All
    // commands through present must reach Metal in the same packet.
    if (!frame) await flush();
    if (terminalError) throw terminalError;
    p.ready = true;
  };
  gfx.setGlobals = data => push('globals', ...append(data));
  gfx.beginFrame = () => { frame = true; push('frame', canvas.width, canvas.height); };
  gfx.beginPass = (t, o = {}) => {
    t = t || gfx.screen;
    gfx.passW = t ? t.w : canvas.width; gfx.passH = t ? t.h : canvas.height;
    push('pass', t ? t.color?.id || 0 : -1, t?.depth?.id || 0, t?.level || 0, o.color || [], o.depth ?? -1, !!o.spatialScene);
  };
  if (self.COLD_SMOKE.spatial) {
    gfx.beginStereoEye = (frameID, eye, w, h, depth, crop, near, far) => push('stereoEye', frameID, eye, w, h, depth.id, crop, near, far);
  }
  gfx.endPass = () => push('endPass');
  gfx.draw = (p, d) => {
    if (!d.count || d.instances === 0) return;
    if (d.u) packUniforms(p.layout, d.u, p.ubuf);
    push('draw', p.id, d.count, d.instances ?? 1, d.first || 0, d.base || 0, d.ib?.id || 0,
      (d.vb || []).map(b => b.id), p.texNames.map(n => d.tex[n].id), ...append(p.ubuf));
  };
  gfx.endFrame = () => {
    push('present'); frame = false; inFlight++;
    const viewport = self.COLD_SMOKE.viewport;
    flush().then(seconds => {
      if (viewport === self.COLD_SMOKE.viewport && seconds > 0) gfx.gpuSeconds = seconds;
    }).catch(() => {}).finally(() => inFlight--);
  };
  gfx.busy = () => inFlight >= 2 || !!terminalError;
  gfx.resize = () => {}; // The layer follows UIKit. Each frame carries its own scene dimensions.
  gfx.capture = async () => {
    const { w, h, bgra } = await bridge.postMessage({ capture: true });
    const bytes = Uint8Array.fromBase64 ? Uint8Array.fromBase64(bgra) : Uint8Array.from(atob(bgra), c => c.charCodeAt(0));
    const data = new Uint8ClampedArray(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let i = 0; i < data.length; i += 4) {
      const blue = data[i]; data[i] = data[i + 2]; data[i + 2] = blue; data[i + 3] = 255;
    }
    return { w, h, data };
  };
  gfx.capturePhoto = async () => {
    const { w, h, data } = await gfx.capture();
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    cv.getContext('2d').putImageData(new ImageData(data, w, h), 0, 0);
    return cv;
  };
  gfx.sharePhoto = async (blob, name) => {
    const reader = new FileReader();
    const encoded = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    return bridge.postMessage({ sharePNG: encoded, name });
  };
  return gfx;
};
