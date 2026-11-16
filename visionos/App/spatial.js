// Packaged only for visionOS. The window, compositor and controller share one game.
(() => {
  const send = action => window.webkit.messageHandlers.slope.postMessage(action);
  // Resolve high-contrast diagonals once per new eye, before the compositor
  // enlarges or reprojects it. U.res.zw is one texel of the uncropped source.
  self.COLD_SMOKE.spatialPresentFragment = `
fn frag(v: VOut) -> FOut {
  var o: FOut;
  let uv: vec2f = mix(M.p.xy, M.p.zw, v.uv);
  let px: vec2f = U.res.zw;
  let luma: vec3f = vec3f(0.299, 0.587, 0.114);
  let center: vec3f = texLod(tA, uv, 0.0).rgb;
  let nw: f32 = dot(texLod(tA, uv - px, 0.0).rgb, luma);
  let ne: f32 = dot(texLod(tA, uv + vec2f(px.x, -px.y), 0.0).rgb, luma);
  let sw: f32 = dot(texLod(tA, uv + vec2f(-px.x, px.y), 0.0).rgb, luma);
  let se: f32 = dot(texLod(tA, uv + px, 0.0).rgb, luma);
  let mid: f32 = dot(center, luma);
  let low: f32 = min(mid, min(min(nw, ne), min(sw, se)));
  let high: f32 = max(mid, max(max(nw, ne), max(sw, se)));
  // Preserve subtle grooves on the snow before magnification. Fade the gain
  // before the FXAA threshold and bound the change to the local luminance.
  let contrast: f32 = high - low;
  let threshold: f32 = max(0.03125, high * 0.125);
  if (contrast < threshold) {
    let gain: f32 = 0.45 * smoothstep(0.005, 0.02, contrast) * (1.0 - smoothstep(0.65 * threshold, threshold, contrast));
    let detail: f32 = mid - (nw + ne + sw + se) * 0.25;
    let adjusted: f32 = clamp(mid + gain * detail, low, high);
    o.color = vec4f(center + vec3f(adjusted - mid), 1.0);
    return o;
  }
  let edge: vec2f = vec2f((sw + se) - (nw + ne), (nw + sw) - (ne + se));
  let bias: f32 = max((nw + ne + sw + se) / 32.0, 0.0078125);
  let span: vec2f = clamp(edge / (min(abs(edge.x), abs(edge.y)) + bias), vec2f(-8.0), vec2f(8.0)) * px;
  let inner: vec3f = (texLod(tA, uv - span / 6.0, 0.0).rgb + texLod(tA, uv + span / 6.0, 0.0).rgb) * 0.5;
  let wide: vec3f = inner * 0.5 + (texLod(tA, uv - span * 0.5, 0.0).rgb + texLod(tA, uv + span * 0.5, 0.0).rgb) * 0.25;
  let y: f32 = dot(wide, luma);
  o.color = vec4f(wide, 1.0);
  if (y < low || y > high) { o.color = vec4f(inner, 1.0); }
  return o;
}`;
  XR.ok = true;
  self.COLD_SMOKE.openSpace = () => send('open');
  self.COLD_SMOKE.closeSpace = () => send('close');
  const ready = UI.ready;
  UI.ready = () => { ready(); send('ready'); };
  let startingPinch = false, blockA = false, previousPad = {};
  const motionToggle = document.createElement('button');
  motionToggle.type = 'button';
  motionToggle.id = 'o-body-controls';
  const preference = 'cs.vision.bodyControls';
  try { XR.bodyControls = localStorage.getItem(preference) === 'on'; } catch {}
  function showMotionSetting() {
    motionToggle.textContent = I18N.t(XR.bodyControls ? '身体动作控制 开' : '身体动作控制 关');
    motionToggle.setAttribute('aria-pressed', String(XR.bodyControls));
    motionToggle.classList.toggle('on', XR.bodyControls);
  }
  motionToggle.onclick = e => {
    e.stopPropagation();
    XR.bodyControls = !XR.bodyControls;
    try { localStorage.setItem(preference, XR.bodyControls ? 'on' : 'off'); } catch {}
    startingPinch = Input.btn.jump = Input.btn.tuck = false;
    cancelJump();
    XR.steer = XR.fa = 0;
    if (Input.xr) { Input.xr.steer = 0; Input.xr.fa = 0; }
    if (XR.bodyControls) XR.recentre();
    showMotionSetting();
  };
  document.getElementById('o-q').after(motionToggle);
  I18N.on(showMotionSetting);
  showMotionSetting();
  const axis = (v = 0) => Math.sign(v) * Math.max(0, Math.abs(v) - 0.12) / 0.88;
  let saving = false;
  self.COLD_SMOKE.saveGamePhoto = async textureID => {
    if (saving) return '正在保存';
    saving = true;
    try {
      const result = await window.webkit.messageHandlers.metal.postMessage({ saveGamePhoto: textureID });
      if (result === 'denied') return '请允许添加照片';
      if (result !== 'saved') return '没能存到相册';
      Photo.shots++;
      return '已存到相册';
    } catch (error) {
      console.warn('photo', error); return '没能存到相册';
    } finally { saving = false; }
  };
  function cancelJump() {
    if (!Input.btn.jump && !Input.pad?.jump && !Input.keys.Space && Game.s) {
      Game.s.jOn = false; Game.s.jT = 0; Game.s.charge = 0;
    }
  }
  function reset() {
    Photo.pad = Input.pad = null; Input.btn.jump = Input.btn.tuck = false; cancelJump();
    startingPinch = blockA = false;
  }
  window.slope = {
    background() { window.slope.pad(null); UI.pause(); },
    begin() { reset(); XR.beginSpatial(); },
    frame: packet => XR.advanceSpatial(packet),
    end() { reset(); XR.endSpatial(); },
    hands(left, right, cancelled) {
      if (!XR.active || XR.photoMode || !XR.bodyControls) return;
      if (UI.state === 'title') {
        if (left || right) startingPinch = true;
        else if (startingPinch && !cancelled) { XR.recentre(); UI.go(); }
      }
      if (!left && !right) startingPinch = false;
      Input.btn.jump = UI.state === 'run' && !startingPinch && left;
      Input.btn.tuck = UI.state === 'run' && !startingPinch && right;
      if (cancelled) cancelJump();
    },
    pad(p) {
      if (!p) { Photo.pad = Input.pad = null; previousPad = {}; blockA = false; cancelJump(); return; }
      if (!App.ready) return;
      const was = previousPad;
      previousPad = p;
      const shutter = p.xButton && !was.xButton;
      if (Photo.on || XR.photoMode) {
        Photo.pad = { x: axis(p.x), y: axis(p.y), lookX: axis(p.lookX), lookY: axis(p.lookY) };
        if (p.b && !was.b) {
          if (XR.photoMode) XR.leavePhoto(); else Photo.exit();
          blockA = !!p.a;
        } else if (shutter && !saving) {
          if (XR.photoMode) XR.photoMode.shutter = true;
          else Photo.snap(true);
        } else if (XR.active && p.menu && !was.menu) self.COLD_SMOKE.closeSpace();
        return;
      }
      if (shutter && !p.menu && !UI.open && UI.state === 'run' && !App.swapping) {
        reset();
        Photo.pad = { x: axis(p.x), y: axis(p.y), lookX: axis(p.lookX), lookY: axis(p.lookY) };
        if (XR.active) XR.enterPhoto(); else Photo.enter();
        return;
      }
      if (p.yButton && !was.yButton) {
        if (XR.active) XR.recentre(); else if (UI.state === 'title' || UI.state === 'run') XR.enter();
      }
      if (p.menu && !was.menu) {
        if (XR.active) self.COLD_SMOKE.closeSpace();
        else if (UI.open) UI.resume(); else UI.pause();
      }
      if (!UI.open && !Photo.on && !p.menu && UI.state === 'run') {
        const forward = p.rb && !was.rb, back = p.lb && !was.lb;
        if (forward && !p.lb) UI.nextView(1);
        if (back && !p.rb) UI.nextView(-1);
      }
      if (p.a && !was.a && UI.state === 'title' && !UI.open) {
        blockA = true; XR.recentre(); UI.go();
      }
      if (!p.a) blockA = false;
      Input.pad = UI.state === 'run' && !UI.open
        ? { steer: axis(p.x), fa: axis(p.y), jump: p.a && !blockA, tuck: p.rt } : null;
    }
  };
})();
const fatal = document.getElementById('fatal');
new MutationObserver(() => { if (!fatal.hidden && fatal.textContent) window.webkit.messageHandlers.slope.postMessage('error:' + fatal.textContent); })
  .observe(fatal, { attributes: true, childList: true, subtree: true });
