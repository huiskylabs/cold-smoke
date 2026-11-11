// ---------------------------------------------------------------- loading page, title page, and the little that is on screen during a run
const UI = (() => {
  const U = { state: 'load', segIdx: -1, hintT: 0, hintKind: null, acc: 0, shown: { spd: -1, drop: -1 } };
  const $ = id => document.getElementById(id);
  const SEG_EN = { bowl: 'OPEN BOWL', steeps: 'THE STEEPS', glade: 'GLADE', rollers: 'ROLLERS', gully: 'GULLY', kickers: 'KICKERS', powder: 'DEEP POWDER', ridge: 'RIDGE', moguls: 'MOGULS' };
  const mq = q => !!(window.matchMedia && matchMedia(q).matches);
  // a thing held in the hands (finger, no mouse) or a thing on a desk (keys and a pointer)
  const handheld = () => mq('(pointer: coarse) and (hover: none)') || (!mq('(pointer: fine)') && 'ontouchstart' in window);
  let el = null, wake = null;

  U.init = function () {
    el = { app: $('app'), veil: $('veil'), shade: $('shade'), load: $('load'), fill: $('load-fill'), stage: $('load-stage'), title: $('title'), go: $('go'), how: $('how'), hud: $('hud'),
      seg: $('seg'), segEn: $('seg-en'), segCn: $('seg-cn'), hint: $('hint'), hintT: $('hint-t'), spd: $('spd'), tach: $('tach'), drop: $('drop'), snd: $('snd'), fs: $('fs') };
    U.layout();
    el.go.addEventListener('click', e => { e.stopPropagation(); U.go(); });
    // the whole picture is the button
    el.app.addEventListener('click', e => { if (U.state === 'title' && !el.snd.contains(e.target) && !el.fs.contains(e.target)) U.go(); });
    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^Arrow/.test(e.code) || e.code === 'Space') e.preventDefault();          // these would scroll a page; here they ski
      if (e.repeat) return;
      if ((e.code === 'Enter' || e.code === 'Space') && U.state === 'title') { e.preventDefault(); U.go(); }
      else if (e.code === 'KeyM') U.sound(!Sound.on);
      else if (e.code === 'KeyF') U.fullscreen();
    });
    el.snd.addEventListener('click', e => { e.stopPropagation(); U.sound(!Sound.on); });
    el.fs.addEventListener('click', e => { e.stopPropagation(); U.fullscreen(); });
    document.addEventListener('fullscreenchange', () => { const on = !!document.fullscreenElement; el.fs.classList.toggle('full', on); el.fs.setAttribute('aria-pressed', on ? 'true' : 'false'); U.layout(); });
    // nothing here scrolls or zooms
    el.app.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', e => e.preventDefault());
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('visibilitychange', () => { if (!document.hidden && U.state === 'run') U.keepAwake(); });
    addEventListener('orientationchange', () => setTimeout(() => { U.layout(); if (App.ready && App.fit) App.fit(); }, 60));
    Input.onFlip = () => U.layout();
  };
  // how the frame lies: wide or tall, turned or not; the stylesheet does the rest
  U.layout = function () {
    if (!el) return;
    const V = View.measure(), c = el.app.classList, hh = handheld();
    c.toggle('rot', V.forced); c.toggle('flip', V.forced && V.flip); c.toggle('wide', V.wide); c.toggle('short', V.short); c.toggle('desk', !hh);
    el.app.style.width = V.forced ? V.w + 'px' : ''; el.app.style.height = V.forced ? V.h + 'px' : '';
    el.app.style.setProperty('--cw', V.w + 'px'); el.app.style.setProperty('--ch', V.h + 'px');
    el.how.textContent = hh ? '倾斜手机转弯，或按住屏幕左右拖动' : '方向键 ← → 或 A D 转弯，也可以按住鼠标左右拖动';
    U.hh = hh;
  };
  U.stage = function (f, name) { if (!el) return; el.fill.style.transform = 'scaleX(' + f.toFixed(3) + ')'; if (name) el.stage.textContent = name; };
  // first frame is on the canvas: let it come up out of the dark, then set the title over it
  U.ready = function () {
    if (!el) return; U.state = 'title';
    el.load.classList.remove('on'); el.veil.classList.add('lift'); el.shade.classList.add('on'); el.title.classList.add('on'); el.snd.classList.add('on');
    if (!U.hh && document.fullscreenEnabled && el.app.requestFullscreen) el.fs.classList.add('on');
  };
  U.sound = function (on) { Sound.setOn(on); el.snd.classList.toggle('mute', !on); el.snd.setAttribute('aria-pressed', on ? 'true' : 'false'); };
  U.keepAwake = function () { try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => { wake = w; }, () => { }); } catch (e) { } };
  // the whole screen, where the browser allows it. On a phone that also lets us ask for the picture to be laid wide for real
  U.fullscreen = function (on) {
    try {
      const is = !!document.fullscreenElement; if (on == null) on = !is; if (on === is) return;
      if (!on) { document.exitFullscreen().catch(() => { }); return; }
      const d = document.documentElement; if (!d.requestFullscreen) return;
      d.requestFullscreen({ navigationUI: 'hide' }).then(() => { try { if (U.hh && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }, () => { });
    } catch (e) { }
  };
  U.go = async function () {
    if (U.state !== 'title') return; U.state = 'starting';
    Sound.unlock();
    if (U.hh) U.fullscreen(true);                    // a phone: take the whole screen if it will let us (asked for inside this tap)
    el.title.classList.remove('on');
    // tilt has to be asked for from this tap (iOS shows its own prompt); where it is refused the finger takes over
    let asked = false; try { asked = await Promise.race([Input.requestTilt(), new Promise(r => setTimeout(() => r(false), 8000))]); } catch (e) { }
    Input.zeroPending = true; U.keepAwake();
    Game.start(); Sound.kick();
    U.state = 'run'; U.t0 = performance.now(); U.segIdx = -1; U.hintT = 0; U.hintKind = null; U.tiltAsked = asked;
    el.shade.classList.add('run'); el.hud.classList.add('on');
  };
  function showHint(kind) {
    U.hintKind = kind; el.hint.className = kind + ' on';
    el.hintT.textContent = kind === 'tilt' ? '像握方向盘一样倾斜手机' : kind === 'drag' ? '按住屏幕，左右拖动' : kind === 'pace' ? '直滑加速 · 转弯减速' : '← →  或  A D  转弯';
  }
  // per displayed frame
  U.frame = function (dt) {
    if (!el || U.state !== 'run') return;
    const S = Game.s, since = (performance.now() - U.t0) / 1000;
    // which way of steering to teach: wait a moment to see whether the phone is reporting its tilt
    if (!U.hintKind && since > 0.7) showHint(Input.tiltLive() ? 'tilt' : U.hh ? 'drag' : 'keys');
    // (once the first turns are made, the one other thing worth knowing: the fall line is the throttle, the turn is the brake)
    else if (U.hintKind === 'gap') { U.hintT += dt; if (U.hintT > 1.0) { showHint('pace'); U.hintT = 0; } }
    else if (U.hintKind === 'pace') { U.hintT += dt; if (U.hintT > 5.5) { el.hint.classList.remove('on'); U.hintKind = 'done'; } }
    else if (U.hintKind && U.hintKind !== 'done') {
      if (U.hintKind !== 'tilt' && Input.tiltLive() && !Input.used) showHint('tilt');
      if (Input.used) U.hintT += dt;
      if (Input.used && U.hintT > 1.2 && since > 3.5) { el.hint.classList.remove('on'); U.hintKind = 'gap'; U.hintT = 0; }
      else if (since > 22) { el.hint.classList.remove('on'); U.hintKind = 'done'; }
    }
    // the name of each run as it begins
    const sg = Course.segAt(-S.p[2]);
    if (sg.idx !== U.segIdx && since > 1.6) {
      U.segIdx = sg.idx; el.segCn.textContent = SEG_NAMES[sg.type] || ''; el.segEn.textContent = (sg.idx + 1 < 10 ? '0' : '') + (sg.idx + 1) + ' · ' + (SEG_EN[sg.type] || '');
      el.seg.classList.add('on'); clearTimeout(U.segTimer); U.segTimer = setTimeout(() => el.seg.classList.remove('on'), 3600);
    }
    // numbers, ten times a second
    U.acc += dt; if (U.acc < 0.1) return; U.acc = 0;
    const kmh = Math.round(Math.hypot(S.v[0], S.v[1], S.v[2]) * 3.6), drop = Math.max(0, Math.round(Game.drop));
    if (kmh !== U.shown.spd) { U.shown.spd = kmh; el.spd.textContent = kmh; el.tach.style.transform = 'scaleX(' + Math.min(1, kmh / 130).toFixed(3) + ')'; }
    if (drop !== U.shown.drop) { U.shown.drop = drop; el.drop.textContent = drop.toLocaleString('en-US'); }
  };
  return U;
})();
