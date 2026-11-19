// The window and the instruments are system views. Send only changed display
// values. All actions still enter the same game as the Xbox and Web controls.
(() => {
  self.COLD_SMOKE.nativeSpatialUI = true;
  const byID = id => document.getElementById(id);
  const text = id => byID(id)?.textContent.trim() || '';
  const visible = id => byID(id)?.classList.contains('on');
  const bindings = new Map();
  let last, nextUpdate = 0, direct = false;
  function state(force = false) {
    const now = performance.now();
    if (!force && now < nextUpdate) return;
    nextUpdate = now + 125;
    const immersive = XR.active, photo = immersive ? !!XR.photoMode : Photo.on;
    const mode = UI.gone ? 'lost' : !App.ready ? 'loading' : photo ? 'photo' :
      !immersive && UI.open ? 'menu' : UI.state === 'title' ? 'title' : UI.state === 'run' ? 'run' : 'starting';
    bindings.clear();
    let settings = null, notice = '', detail = '';
    if (mode === 'menu') {
      settings = readPauseSettings(bindings, direct);
      settings.bodyControls = !!XR.bodyControls;
      settings.advancedMenu = !!UI.dev;
      const t = (zh, en) => settings.english ? en : zh;
      settings.help = [
        { title: t('左摇杆','Left stick'), detail: t('转向和调整重心','Steer and shift weight') },
        { title: 'A · RT', detail: I18N.t('按住 A 蓄力，松开起跳 · RT 加速') },
        { title: 'LB / RB · X', detail: I18N.t('LB / RB 换视角 · X 拍照') },
        { title: 'Y · Menu', detail: I18N.t('Y 校准正前方 · 菜单键退出') }
      ];
    }
    else direct = false;
    if (mode === 'photo') {
      notice = immersive ? I18N.t(XR.photoMode.message || '') : visible('ph-toast') ? text('ph-tk') : '';
      if (!immersive) detail = text('ph-mm');
    } else if (mode === 'run' && !immersive) {
      if (visible('day')) { notice = text('day-t'); detail = [text('day-f'), text('day-r')].filter(Boolean).join(' · '); }
      else if (visible('seg')) { notice = text('seg-cn'); detail = text('split'); }
      else if (visible('say')) { notice = text('say-k'); detail = text('say-v'); }
    }
    const running = mode === 'run';
    const payload = { mode, english: I18N.en(), body: !!XR.bodyControls, sound: !!Sound.on, advancedMenu: !!UI.dev,
      speed: running ? Math.round(Math.hypot(...Game.s.v) * 3.6) : 0, drop: running ? Math.max(0, Math.round(Game.drop || 0)) : 0,
      camera: running ? I18N.t(Game.views?.find(v => v.id === Game.view)?.name || Game.view) : '',
      challenge: running && Rings.on ? { passed: Rings.passed, missed: Rings.missed } : null,
      notice, detail, bare: photo && !immersive && byID('photo').classList.contains('bare'), settings };
    const key = JSON.stringify(payload);
    if (key !== last) { last = key; window.webkit.messageHandlers.slope.postMessage(payload); }
  }
  const oldFrame = window.slope.frame;
  window.slope.frame = packet => { const ok = oldFrame(packet); if (ok) state(); return ok; };
  const oldEnd = window.slope.end;
  window.slope.end = () => { oldEnd(); state(true); };
  setInterval(() => { if (!XR.active) state(); }, 125);
  window.slope.action = (id, phase) => {
    if (id === 'reload') { location.reload(); return; }
    if (!App.ready) return;
    if (id === 'space') { XR.enter(); return; }
    if (id === 'exit') { self.COLD_SMOKE.closeSpace(); return; }
    if (['jump','tuck','ph-up','ph-dn'].includes(id)) {
      byID(id).dispatchEvent(new PointerEvent(phase === 'down' ? 'pointerdown' : 'pointerup',
        { pointerId: -20, pointerType: 'touch', bubbles: true, cancelable: true }));
      return;
    }
    if (id.startsWith('open:')) { direct = true; UI.menu(id.slice(5)); }
    else if (id === 'photo') Photo.enter();
    else if (id === 'prev' || id === 'next') UI.nextView(id === 'prev' ? -1 : 1);
    else if (id === 'body') byID('o-body-controls').click();
    else if (id === 'daily') UI.daily();
    else if (id === 'start') { if (XR.active) XR.recentre(); UI.go(); }
    else if (id === 'recenter') XR.recentre();
    else if (id === 'photoWords') {
      if (byID('photo').classList.contains('bare')) byID('ph-surf').dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyH', bubbles: true }));
      else byID('ph-hide').click();
    }
    else if (UI.open && (id === 'advanced:on' || id === 'advanced:off')) UI.setAdvancedMenu(id === 'advanced:on');
    else if (UI.open && /^quality:(auto|[012])$/.test(id)) {
      const value = id.slice(8); Quality.select(value === 'auto' ? value : Number(value));
    } else {
      const button = bindings.get(id) || byID(id);
      if (button && (UI.dev || !button.closest('.dev-only'))) button.click();
    }
    state(true);
  };
  self.COLD_SMOKE.previewGamePhoto = () => window.webkit.messageHandlers.metal.postMessage({ previewGamePhoto: true });
})();
