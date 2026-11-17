// The game owns its actions and layout. UIKit owns the visible controls and tracking.
(() => {
  const host = window.webkit?.messageHandlers.gameControls;
  if (!host) return;
  Game.onJumpCharged = () => {
    if (Input.btn.jump) host.postMessage({ event: 'jumpCharged' });
  };
  const byID = id => document.getElementById(id);
  const root = document.documentElement, app = byID('app');
  const title = byID('title'), cta = title.querySelector('.cta');
  const menu = byID('menu'), nav = menu.querySelector('nav'), pane = byID('mpane');
  const bar = byID('bar'), hud = byID('hud'), pad = byID('pad'), pause = byID('pause');
  const photo = byID('photo'), preview = byID('ph-card');
  byID('ph-save').before(byID('ph-again'));
  const photoRail = document.createElement('div');
  photoRail.className = 'ph-rail';
  const photoNav = document.createElement('div'), photoActions = photo.querySelector('.ph-r');
  photoNav.className = 'ph-nav';
  photoNav.append(byID('ph-back'), photoActions);
  photo.querySelector('.ph-side').before(photoRail);
  photoRail.append(photoNav, photo.querySelector('.ph-side'));
  byID('m-photo')?.remove();
  const shoot = document.createElement('button');
  shoot.id = 'shoot';
  shoot.type = 'button';
  shoot.addEventListener('click', () => { if (UI.state === 'run' && !UI.open) Photo.enter(); });
  pad.append(shoot);
  const containers = { cta };
  const elements = new Map(), keys = new WeakMap();
  let serial = 0, previous, pending = false;
  const rect = (r, x = 0, y = 0) => [r.left + x, r.top + y, r.width, r.height].map(v => Math.round(v * 16) / 16);
  const symbols = {
    go: 'figure.skiing.downhill', shoot: 'camera',
    'ph-back': 'chevron.backward', 'ph-reset': 'arrow.counterclockwise', 'ph-hide': 'eye.slash', 'ph-shut': 'camera.shutter.button',
    'ph-up': 'chevron.up', 'ph-dn': 'chevron.down', 'ph-again': 'chevron.backward', 'ph-save': 'square.and.arrow.down',
    sky: 'sun.max', view: 'video', keys: 'gamecontroller', daily: 'mountain.2', fs: 'arrow.up.left.and.arrow.down.right'
  };
  // Keep the simulation authoritative. Navigation and choices use stable ids, never translated labels.
  let directEntry = false;
  byID('more').addEventListener('click', e => { directEntry = !!e.target.closest('button[data-sec]'); }, true);
  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(sync); }
  }
  function sync() {
    pending = false;
    const controls = [], groups = [];
    let camera = null, settings = null;
    elements.clear();
    function add(node, group = '') {
      const scrolling = !!group, bounds = node.getBoundingClientRect();
      if (scrolling) groups.push({ id: group, rect: rect(bounds), size: [node.scrollWidth, node.scrollHeight],
        offset: [node.scrollLeft, node.scrollTop], page: '' });
      const buttons = node.querySelectorAll('button');
      for (const b of buttons) {
        const r = b.getBoundingClientRect();
        if (r.width < 1 || r.height < 1 || b.hidden) continue;
        if (b.id === 'vw') {
          const options = (Game.views || []).map(v => ({ id: v.id, title: I18N.t(v.name || v.id) }));
          if (options.length) camera = { options, selected: Game.view, label: I18N.t('机位'), rect: rect(r) };
          continue;
        }
        if (!keys.has(b)) keys.set(b, b.id || 'choice-' + ++serial);
        const id = keys.get(b), d = b.dataset;
        elements.set(id, b);
        b.setAttribute('aria-hidden', 'true');
        b.tabIndex = -1;
        let icon = symbols[id] || '', style = 'choice';
        if (node === cta) { style = id === 'go' ? 'start' : 'shortcut'; icon ||= symbols[d.sec || 'daily']; }
        if (node === pad || node === bar || node === photoRail || node === preview) style = 'round';
        if (root.dataset.controlLayout === 'compact' && b.parentElement === photoActions) style = 'photoPair';
        if (id === 'mn') icon = UI.open ? 'xmark' : 'line.3.horizontal';
        if (id === 'snd') icon = Sound.on ? 'speaker.wave.2.fill' : 'speaker.slash.fill';
        controls.push({ id, group, style, icon, title: b.textContent.trim(),
          label: b.getAttribute('aria-label') || b.textContent.trim(),
          selected: node === bar ? id === 'snd' && Sound.on : b.classList.contains('on'),
          marked: b.classList.contains('now') || b.classList.contains('rec'),
          rect: scrolling ? rect(r, node.scrollLeft - bounds.left, node.scrollTop - bounds.top) : rect(r) });
      }
    }
    if (app.classList.contains('photo')) {
      if (preview.classList.contains('on')) add(preview);
      else if (!photo.classList.contains('bare')) add(photoRail);
    } else if (!pause.classList.contains('on') && !app.classList.contains('bare')) {
      if (menu.classList.contains('on')) {
        settings = readPauseSettings(elements, directEntry);
        settings.advancedMenu = UI.dev;
      }
      else if (title.classList.contains('on')) add(cta, cta.scrollHeight > cta.clientHeight + 1 ? 'cta' : '');
      else if (hud.classList.contains('on')) add(pad);
      if (!settings && bar.classList.contains('on')) add(bar);
    }
    if (!menu.classList.contains('on')) directEntry = false;
    const payload = { controls, groups, camera, settings, lang: I18N.en() ? 'en' : 'zh-Hans' };
    const current = JSON.stringify(payload);
    if (current !== previous) { previous = current; host.postMessage(payload); }
  }
  window.gameControls = {
    sceneDidActivate() { Sound.refresh(); },
    selectCamera(id) {
      if (!hud.classList.contains('on') || UI.open || Photo.on || !Game.views?.some(v => v.id === id)) return;
      UI.setView(id);
      schedule();
    },
    perform(id, phase) {
      if (UI.open && phase === 'tap' && (id === 'advanced:on' || id === 'advanced:off')) {
        UI.setAdvancedMenu(id === 'advanced:on');
        schedule(); return;
      }
      if (UI.open && phase === 'tap' && /^quality:(auto|[012])$/.test(id)) {
        const value = id.slice(8);
        Quality.select(value === 'auto' ? value : Number(value)); schedule(); return;
      }
      const button = elements.get(id);
      if (!button || (!UI.dev && button.closest('.dev-only'))) return;
      if (phase === 'tap') button.click();
      else button.dispatchEvent(new PointerEvent(phase === 'down' ? 'pointerdown' : 'pointerup',
        { pointerId: id === 'jump' ? -11 : -12, pointerType: 'touch', bubbles: true, cancelable: true }));
      schedule();
    },
    scroll(id, x, y) { containers[id]?.scrollTo(x, y); }
  };
  // Scope observations to UI state. Speed, steering and the charge ring update every frame.
  const observer = new MutationObserver(schedule);
  for (const el of [root, app, hud, pause, title, menu, photo, preview]) observer.observe(el, { attributes: true, attributeFilter: ['class', 'style', 'data-fold', 'data-bar-edge', 'data-control-layout', 'data-left-split', 'data-cover-controls', 'data-expanded-display'] });
  for (const el of [bar, cta, nav, pane, pad]) observer.observe(el, { subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ['class', 'hidden', 'aria-label', 'aria-pressed', 'aria-expanded'] });
  const resize = new ResizeObserver(schedule);
  for (const el of [app, cta, bar, nav, pane]) resize.observe(el);
  const help = pane.querySelector('section[data-sec="view"] .note .hand-only');
  const photoHelp = pane.querySelector('section[data-sec="keys"] .note:last-child');
  function controlHelp() {
    shoot.setAttribute('aria-label', I18N.en() ? 'Photo' : '拍摄');
    byID('ph-again').setAttribute('aria-label', I18N.en() ? 'Back to camera' : '返回取景');
    if (help) help.textContent = I18N.en() ? 'Swipe the camera strip or tap a name to switch views. Drag with two fingers to look around.'
                                          : '左右滑动机位栏，或轻点名称切换视角。双指拖动可环顾四周。';
    if (photoHelp) photoHelp.textContent = I18N.en() ? 'Tap the camera icon to frame a shot. Tap the shutter to take it, or Back to keep skiing.'
                                                    : '点相机图标取景，按快门拍照，点「返回」继续滑行。';
  }
  controlHelp();
  I18N.on(controlHelp);
  addEventListener('keydown', e => { if (/^(KeyV|Digit[1-9]|Numpad[1-9])$/.test(e.code)) schedule(); });
  byID('ph-img').addEventListener('load', schedule);
  document.fonts.ready.then(schedule);
  root.classList.add('native-controls');
  schedule();
})();
