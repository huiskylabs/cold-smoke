// 性能测量的钩子。由 mkperf.js 拼进 dist/dev.html 的副本（游戏闭包的最末尾），不改 src。
// 能看到闭包里的全部模块（App、Render、Terrain、createGL…），把渲染层包一层来记账。
;(function () {
  const P = window.__perf = {
    tex: [], buf: [], pipes: [], rec: false, passes: [], up: { texBytes: 0, texCalls: 0, bufBytes: 0, bufCalls: 0, globCalls: 0 },
    timing: false, sect: {}, lastLabel: null, lastT: 0, sync: 'finish', syncN: 0,
  };
  const BPP = { rgba8: 4, rgba16f: 8, r32f: 4, rgba32f: 16, r8: 1, depth: 4 };
  P.BPP = BPP;
  function wrap(g) {
    if (!g) return g; const gl = g.gl; P.gfx = g; P.gl = gl;
    const O = {}; for (const k of ['texture', 'target', 'buffer', 'pipeline', 'finishPipeline', 'finishPipelineAsync', 'updateTexture', 'updateBuffer', 'setGlobals', 'beginPass', 'endPass', 'draw', 'destroyTexture', 'destroyBuffer']) if (g[k]) O[k] = g[k];
    P.O = O;
    g.texture = o => { const t = O.texture(o); P.tex.push({ id: t.id, w: o.w, h: o.h, format: o.format, mips: !!o.mips, bytes: o.w * o.h * (BPP[o.format] || 4) * (o.mips ? 4 / 3 : 1), alive: true, t }); return t; };
    g.destroyTexture = t => { const r = P.tex.find(x => x.t === t); if (r) r.alive = false; return O.destroyTexture(t); };
    g.buffer = (data, kind, dyn) => { const b = O.buffer(data, kind, dyn); P.buf.push({ id: b.id, kind, bytes: data.byteLength, dyn: !!dyn, alive: true, b }); return b; };
    g.destroyBuffer = b => { const r = P.buf.find(x => x.b === b); if (r) r.alive = false; return O.destroyBuffer(b); };
    g.pipeline = desc => { const t0 = performance.now(); const p = O.pipeline(desc); P.pipes.push({ name: desc.name, p, tCreate: performance.now() - t0, vsLen: p.src && p.src.vs ? p.src.vs.length : (p.src && p.src.code ? p.src.code.length : 0), fsLen: p.src && p.src.fs ? p.src.fs.length : 0, nu: p.layout.fields.length, ntex: Object.keys(desc.textures || {}).length }); return p; };
    if (O.finishPipeline) g.finishPipeline = p => { const t0 = performance.now(); const r = O.finishPipeline(p); const e = P.pipes.find(x => x.p === p); if (e) e.tFinish = (e.tFinish || 0) + performance.now() - t0; return r; };
    g.updateTexture = (t, x, y, w, h, data) => { if (P.rec) { P.up.texBytes += data.byteLength; P.up.texCalls++; } return O.updateTexture(t, x, y, w, h, data); };
    g.updateBuffer = (b, off, data) => { if (P.rec) { P.up.bufBytes += data.byteLength; P.up.bufCalls++; } return O.updateBuffer(b, off, data); };
    g.setGlobals = f => { if (P.rec) P.up.globCalls++; return O.setGlobals(f); };
    let pass = null, passN = 0;
    // 同步点：从"当前绑定的渲染目标"读回 1 个像素，逼软件光栅把之前的 draw 做完（Chrome 里 gl.finish() 不会等）。
    // 只有深度的目标（阴影图）读不了：那一段的耗时会并到下一个有颜色目标的段里，阴影通道的耗时改用"关掉某条管线"的 A/B 来测（P.skip）。
    let curT = null; const pxU = new Uint8Array(4), pxF = new Float32Array(4);
    const sync = () => { P.syncN++; if (curT === null || (curT && curT.color && curT.color.format === 'rgba8')) gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pxU); else if (curT && curT.color) gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pxF); else gl.finish(); };
    P.syncNow = () => { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pxU); };
    P.skip = new Set();
    // P.skip 里放 '#mips'：雪痕贴图每帧的整张 mip 重生成（gfx.genMips）也不做，用来量它值多少
    if (g.genMips) { const gm = g.genMips; g.genMips = t => { if (P.skip.size && P.skip.has('#mips')) return; return gm(t); }; }
    const mark = label => {
      if (!P.timing) return;
      if (label === P.lastLabel) return;
      sync(); const t = performance.now();
      if (P.lastLabel != null) P.sect[P.lastLabel] = (P.sect[P.lastLabel] || 0) + (t - P.lastT);
      P.lastLabel = label; P.lastT = t;
    };
    P.mark = mark;
    g.beginPass = (T, o) => {
      const fmt = !T ? 'screen' : (T.color ? T.color.format : '') + (T.depth ? '+depth' : '');
      pass = { n: passN++, fmt, w: T ? T.w : g.gl.canvas.width, h: T ? T.h : g.gl.canvas.height, clear: !!(o && (o.color || o.depth != null)), draws: [] };
      if (P.rec) P.passes.push(pass);
      mark('pass-begin'); curT = T || null;
      return O.beginPass(T, o);
    };
    g.draw = (p, d) => {
      // '#patch' / '#rings'：只关地形里脚下的细网格（691,200 个索引）或只关各层环形网格，用来把地形的顶点开销拆开
      if (P.skip.size && (P.skip.has(p.name) || (p.name === 'terrain' && P.skip.has(d.count > 300000 ? '#patch' : '#rings')))) return;
      const inst = d.instances == null ? 1 : d.instances;
      if (inst > 0 && d.count > 0) {
        if (P.rec && pass) { const strip = p.desc.topology === 'strip', lines = p.desc.topology === 'lines'; pass.draws.push({ name: p.name, count: d.count, inst, tris: lines ? 0 : (strip ? d.count - 2 : d.count / 3) * inst, verts: d.count * inst, nu: d.u ? p.layout.fields.length : 0, ntex: p.texNames ? p.texNames.length : 0, blend: p.desc.blend || 'none' }); }
        mark((pass ? pass.fmt + ' ' + pass.w + 'x' + pass.h : '?') + ' | ' + p.name);
      }
      return O.draw(p, d);
    };
    return g;
  }
  { const cg = createGL; createGL = function (c, o) { return wrap(cg(c, o)); }; }
  // WebGPU：只记每条管线什么时候建、什么时候编译好（开机测试看第一次打开时哪几条最慢）
  P.gpuPipes = [];
  { const cgp = createGPU; createGPU = async function (c, o) { const g = await cgp(c, o); if (!g) return g; const op = g.pipeline;
    g.pipeline = desc => { const t0 = performance.now(), p = op(desc), e = { name: desc.name, t0, tDone: 0, len: p.src && p.src.code ? p.src.code.length : 0 }; P.gpuPipes.push(e);
      if (p.promise) p.promise.then(() => { e.tDone = performance.now(); }); return p; }; return g; }; }
  // 地址带 cold：每条着色器里加一句这次打开独有、但永远不生效的判断（和一个不可能的数比较），生成的机器码因此每次都不一样，
  // 浏览器和系统（Metal）两层的着色器缓存都认不出来，等于第一次打开。只加注释不够：注释在翻译时就被去掉了，底层缓存照样命中
  if (/[?&]cold\b/.test(location.search)) { const k = -(1e6 + Math.floor(Math.random() * 8e6)) + '.0', b0 = buildShader;
    buildShader = function (d, l) { const r = b0(d, l);
      if (r.code) r.code = r.code.replace('{ return vert(a); }', `{ var r: VOut = vert(a); if (U.origin.w == ${k}) { r.clip.w = r.clip.w * 1.0001; } return r; }`);
      if (r.vs) r.vs = r.vs.replace(/\n}\n$/, `\n  if (U.origin.w == ${k}) gl_Position.w *= 1.0001;\n}\n`);
      return r; }; }
  P.frameBegin = () => { P.passes = []; P.up = { texBytes: 0, texCalls: 0, bufBytes: 0, bufCalls: 0, globCalls: 0 }; P.rec = true; };
  P.frameEnd = () => { P.rec = false; return { passes: P.passes, up: P.up }; };
  P.timeBegin = () => { P.sect = {}; P.lastLabel = null; P.timing = true; P.mark('start'); };
  P.timeEnd = () => { P.mark('end'); P.timing = false; const s = P.sect; delete s.start; return s; };
  // 每个模块的每帧 JS 耗时：把 tick 里调到的方法各包一层计时
  P.mods = {};
  P.wrapMods = () => {
    const T = P.mods, w = (obj, name, label) => { const f = obj[name]; if (typeof f !== 'function') return; obj[name] = function () { const t0 = performance.now(); try { return f.apply(this, arguments); } finally { const e = T[label] || (T[label] = { ms: 0, n: 0 }); e.ms += performance.now() - t0; e.n++; } }; };
    w(Input, 'update', 'Input.update'); w(Game, 'update', 'Game.update'); w(Tracks, 'step', 'Tracks.step'); w(Terrain, 'update', 'Terrain.update'); w(Skier, 'update', 'Skier.update');
    w(Trees, 'update', 'Trees.update'); w(Gates, 'update', 'Gates.update'); w(Deer, 'update', 'Deer.update'); w(Sky, 'updatePlane', 'Sky.updatePlane'); w(Sky, 'setClock', 'Sky.setClock'); w(Weather, 'update', 'Weather.update');
    w(Feel, 'update', 'Feel.update'); w(Feel, 'pass', 'Feel.pass'); w(Render, 'computeGlobals', 'Render.computeGlobals'); w(Sound, 'frame', 'Sound.frame'); w(Sound, 'event', 'Sound.event'); w(Render, 'render', 'Render.render(JS侧)');
    w(Render, 'renderShared', ' render: shared(bake+shadow+pre)'); w(Render, 'renderView', ' render: view');
    w(Sky, 'bakeLut', '  Sky.bakeLut'); w(Clouds, 'update', '  Clouds.update'); w(Terrain, 'drawShadow', '  Terrain.drawShadow'); w(Terrain, 'draw', '  Terrain.draw'); w(Sky, 'draw', '  Sky.draw'); w(Post, 'run', '  Post.run'); w(Post, 'motionBlur', '  Post.motionBlur');
    w(Spray, 'pre', '  Spray.pre'); w(Tracks, 'pre', '  Tracks.pre'); w(Spray, 'offscreen', '  Spray.offscreen'); w(Shafts, 'offscreen', '  Shafts.offscreen'); w(Dust, 'veil', '  Dust.veil'); w(Shafts, 'fx', '  Shafts.fx'); w(Wind, 'fx', '  Wind.fx'); w(Spray, 'fx', '  Spray.fx'); w(Grains, 'fx', '  Grains.fx'); w(Dust, 'fx', '  Dust.fx');
    w(Skier, 'draw', '  Skier.draw'); w(Deer, 'draw', '  Deer.draw'); w(Trees, 'draw', '  Trees.draw'); w(Gates, 'draw', '  Gates.draw'); w(Clouds, 'draw', '  Clouds.draw'); w(Trees, 'drawGhost', '  Trees.drawGhost'); w(Gates, 'drawOver', '  Gates.drawOver');
    w(Skier, 'drawShadow', '  Skier.drawShadow'); w(Deer, 'drawShadow', '  Deer.drawShadow'); w(Trees, 'drawShadow', '  Trees.drawShadow'); w(Gates, 'drawShadow', '  Gates.drawShadow');
    w(Spray, 'onStep', 'Spray.onStep(120Hz)'); w(UI, 'frame', 'UI.frame');
    if (typeof Fauna !== 'undefined') w(Fauna, 'update', 'Fauna.update');
  };
  window.__int = { govern: (now, raw) => govern(now, raw), tick, boot, App, Render, Terrain, Trees, Spray, Grains, Dust, Wind, Clouds, Sky, Post, Skier, Deer, Gates, Tracks, Shafts, Game, Course, Quality, Variants, Weather, Feel, Sound, UI, Input, Nebula, Vista, Tex, DEV, QS,
    setGov: on => { Gov.on = on; }, gov: () => Gov, govern, fit };
})();
