// ---------------------------------------------------------------- loading page, title page, and the little that is on screen during a run
const UI = (() => {
  const U = { state: 'load', segIdx: -1, hintT: 0, hintKind: null, acc: 0, shown: { spd: -1, drop: -1 }, tod: 'auto', open: false };
  const $ = id => document.getElementById(id);
  const SEG_EN = { bowl: 'OPEN BOWL', steeps: 'THE STEEPS', glade: 'GLADE', rollers: 'ROLLERS', gully: 'GULLY', kickers: 'KICKERS', powder: 'DEEP POWDER', ridge: 'RIDGE', moguls: 'MOGULS' };
  // the hours the day can be turned to, in the order the sun goes through them (keys of Sky.times)
  const TIMES = [['day', '白天'], ['golden', '傍晚'], ['sunset', '日落'], ['dusk', '黄昏'], ['night', '夜晚'], ['dawn', '黎明']];
  const mq = q => !!(window.matchMedia && matchMedia(q).matches);
  // a thing held in the hands (finger, no mouse) or a thing on a desk (keys and a pointer)
  const handheld = () => mq('(pointer: coarse) and (hover: none)') || (!mq('(pointer: fine)') && 'ontouchstart' in window);
  let el = null, wake = null, fsT = -1e9;

  U.init = function () {
    el = { app: $('app'), veil: $('veil'), shade: $('shade'), load: $('load'), fill: $('load-fill'), stage: $('load-stage'), title: $('title'), go: $('go'), how: $('how'), hud: $('hud'),
      seg: $('seg'), segEn: $('seg-en'), segCn: $('seg-cn'), hint: $('hint'), hintT: $('hint-t'), spd: $('spd'), tach: $('tach'), drop: $('drop'), snd: $('snd'), fs: $('fs'),
      sw: $('sw'), swp: $('swp'), time: $('sw-time'), kinds: $('sw-seg'), ev: $('sw-ev'), more: $('sw-more'), view: $('sw-view'), vn: $('sw-vn'), mt: $('sw-mt'), seed: $('sw-seed'),
      say: $('say'), sayK: $('say-k'), sayV: $('say-v'), cut: $('cut'), jump: $('jump'), tuck: $('tuck'),
      pz: $('pz'), pause: $('pause'), pauseS: $('pause-s'), pauseT: $('pause-t'), pzGo: $('pz-go'), pzTop: $('pz-top'), steer: $('steer') };
    U.layout();
    el.go.addEventListener('click', e => { e.stopPropagation(); U.go(); });
    // the whole picture is the button (with the sheet of switches open, a press beside it only puts the sheet away)
    el.app.addEventListener('click', e => { if (U.state !== 'title' || el.snd.contains(e.target) || el.fs.contains(e.target)) return; if (U.open) U.openSwitch(false); else U.go(); });
    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^Arrow/.test(e.code) || e.code === 'Space') e.preventDefault();          // these would scroll a page; here they ski
      if (e.repeat) return;
      const on = sel => e.target && e.target.closest && e.target.closest(sel);      // (a control reached with the tab key takes its own Enter)
      if (U.gone) { if (e.code === 'Enter') location.reload(); return; }
      if (U.paused) { if (e.code === 'Escape' || (e.code === 'Enter' && !on('#pause button'))) { e.preventDefault(); U.resume(); } return; }      // a run set down hears only the way back
      const mine = e.code === 'Enter' && on('#sw, #swp, #pz');
      if ((e.code === 'Enter' || e.code === 'Space') && U.state === 'title' && !mine) { e.preventDefault(); U.go(); }
      else if (e.code === 'KeyM') U.sound(!Sound.on);
      else if (e.code === 'KeyF') U.fullscreen();
      else if (U.state === 'title' || U.state === 'run') {
        const d = e.shiftKey ? -1 : 1;
        if (e.code === 'KeyT') U.nextTime(d); else if (e.code === 'KeyN') U.nextKind(d); else if (e.code === 'KeyG') U.animal(); else if (e.code === 'KeyP') U.plane();
        else if (e.code === 'KeyR') U.newMountain(); else if (e.code === 'Escape') { if (U.open) U.openSwitch(false); else U.pause(); }
      }
    });
    el.snd.addEventListener('click', e => { e.stopPropagation(); U.sound(!Sound.on); });
    el.fs.addEventListener('click', e => { e.stopPropagation(); U.fullscreen(); });
    document.addEventListener('fullscreenchange', () => {
      const on = !!document.fullscreenElement, own = performance.now() - fsT < 1500; fsT = performance.now();
      el.fs.classList.toggle('full', on); el.fs.setAttribute('aria-pressed', on ? 'true' : 'false'); U.layout();
      if (!on && !own) U.pause();          // thrown out of the whole screen (the system's Esc, a back gesture): the run waits
    });
    // nothing here scrolls or zooms
    el.app.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', e => e.preventDefault());
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('visibilitychange', () => { if (!document.hidden && U.state === 'run') U.keepAwake(); });
    addEventListener('orientationchange', () => setTimeout(() => { U.layout(); if (App.ready && App.fit) App.fit(); if (App.redraw) App.redraw(); }, 60));
    Input.onFlip = () => U.layout();
    initSwitch();
  };
  // how the frame lies: wide or tall, turned or not; the stylesheet does the rest
  U.layout = function () {
    if (!el) return;
    const V = View.measure(), c = el.app.classList, hh = handheld();
    c.toggle('rot', V.forced); c.toggle('flip', V.forced && V.flip); c.toggle('wide', V.wide); c.toggle('short', V.short); c.toggle('desk', !hh);
    c.toggle('hasfs', !hh && !!document.fullscreenEnabled && !!el.app.requestFullscreen);          // (a third glyph in the corner: the pill stands clear of it)
    el.app.style.width = V.forced ? V.w + 'px' : ''; el.app.style.height = V.forced ? V.h + 'px' : '';
    el.app.style.setProperty('--cw', V.w + 'px'); el.app.style.setProperty('--ch', V.h + 'px');
    el.how.textContent = hh ? '倾斜手机转弯，或按住屏幕左右拖动' : '← → 或 A D 转弯 · 空格 跳 · ↓ 或 S 加速';
    U.hh = hh;
  };
  U.stage = function (f, name) { if (!el) return; el.fill.style.transform = 'scaleX(' + f.toFixed(3) + ')'; if (name) el.stage.textContent = name; };
  // first frame is on the canvas: let it come up out of the dark, then set the title over it
  U.ready = function () {
    if (!el) return; U.state = 'title';
    el.load.classList.remove('on'); el.veil.classList.add('lift'); el.shade.classList.add('on'); el.title.classList.add('on'); el.snd.classList.add('on');
    if (!U.hh && document.fullscreenEnabled && el.app.requestFullscreen) el.fs.classList.add('on');
    el.sw.classList.add('on'); paint();
  };
  U.sound = function (on) { Sound.setOn(on); el.snd.classList.toggle('mute', !on); el.snd.setAttribute('aria-pressed', on ? 'true' : 'false'); };
  U.keepAwake = function () { try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => { wake = w; }, () => { }); } catch (e) { } };
  // the whole screen, where the browser allows it. On a phone that also lets us ask for the picture to be laid wide for real
  U.fullscreen = function (on) {
    try {
      const is = !!document.fullscreenElement; if (on == null) on = !is; if (on === is) return;
      fsT = performance.now();          // (asked for here: the change that follows, and any loss of focus it brings, is not the player leaving)
      if (!on) { document.exitFullscreen().catch(() => { }); return; }
      const d = document.documentElement; if (!d.requestFullscreen) return;
      d.requestFullscreen({ navigationUI: 'hide' }).then(() => { try { if (U.hh && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }, () => { });
    } catch (e) { }
  };
  // pushing off, from the gate or from wherever a switch has just put the skier
  function launch() { Game.start(); Sound.kick(); }
  U.go = async function () {
    if (U.state !== 'title') return; U.state = 'starting';
    Sound.unlock();
    if (U.hh) U.fullscreen(true);                    // a phone: take the whole screen if it will let us (asked for inside this tap)
    el.title.classList.remove('on'); U.openSwitch(false);
    // tilt has to be asked for from this tap (iOS shows its own prompt); where it is refused the finger takes over
    let asked = false; try { asked = await Promise.race([Input.requestTilt(), new Promise(r => setTimeout(() => r(false), 8000))]); } catch (e) { }
    Input.zeroPending = true; U.keepAwake();
    launch();
    U.state = 'run'; U.t0 = performance.now(); U.segIdx = -1; U.hintT = 0; U.hintKind = null; U.tiltAsked = asked;
    el.shade.classList.add('run'); el.hud.classList.add('on'); el.app.classList.add('run');
  };
  function showHint(kind) {
    U.hintKind = kind; el.hint.className = kind + ' on';
    el.hintT.textContent = kind === 'tilt' ? '像握方向盘一样倾斜手机' : kind === 'drag' ? '按住屏幕，左右拖动' : kind === 'pace' ? '连着转弯，把雪扬起来'
      : kind === 'moves' ? (U.hh ? '按住「跳」蓄力，松开起跳' : '空格 跳（按住蓄力） · ↓ 加速') : '← →  或  A D  转弯';
  }
  // per displayed frame
  U.frame = function (dt) {
    if (!el) return;
    if (U.state !== 'load') switches(dt);
    if (U.state !== 'run') return;
    const S = Game.s, since = (performance.now() - U.t0) / 1000;
    // which way of steering to teach: wait a moment to see whether the phone is reporting its tilt
    if (!U.hintKind && since > 0.7) showHint(Input.tiltLive() ? 'tilt' : U.hh ? 'drag' : 'keys');
    // (once the first turns are made, an invitation: link them, and throw the snow up; and after that the two moves: the jump, and the
    // push or tuck that makes speed)
    else if (U.hintKind === 'gap' || U.hintKind === 'gap2') { U.hintT += dt; if (U.hintT > 1.0) { showHint(U.hintKind === 'gap' ? 'pace' : 'moves'); U.hintT = 0; } }
    else if (U.hintKind === 'pace' || U.hintKind === 'moves') { U.hintT += dt; if (U.hintT > 5.5) { el.hint.classList.remove('on'); U.hintKind = U.hintKind === 'pace' ? 'gap2' : 'done'; U.hintT = 0; } }
    else if (U.hintKind && U.hintKind !== 'done') {
      if (U.hintKind !== 'tilt' && Input.tiltLive() && !Input.used) showHint('tilt');
      if (Input.used) U.hintT += dt;
      if (Input.used && U.hintT > 1.2 && since > 3.5) { el.hint.classList.remove('on'); U.hintKind = 'gap'; U.hintT = 0; }
      else if (since > 22) { el.hint.classList.remove('on'); U.hintKind = 'done'; }
    }
    // the name of each run, said as it comes into reach: two and a half seconds before the skier is in it (never twice: a skier who slows
    // short of the line has already been told; a skier put somewhere else altogether is told afresh)
    const sg = Course.segAt(-S.p[2] + 2.5 * Math.max(0, -S.v[2]));
    if (sg.idx < U.segIdx - 1) U.segIdx = -1;
    if (sg.idx > U.segIdx && since > 1.6) {
      U.segIdx = sg.idx; el.segCn.textContent = SEG_NAMES[sg.type] || ''; el.segEn.textContent = (sg.idx + 1 < 10 ? '0' : '') + (sg.idx + 1) + ' · ' + (SEG_EN[sg.type] || '');
      el.seg.classList.add('on'); clearTimeout(U.segTimer); U.segTimer = setTimeout(() => el.seg.classList.remove('on'), 3600);
    }
    // numbers, ten times a second
    U.acc += dt; if (U.acc < 0.1) return; U.acc = 0;
    const kmh = Math.round(Math.hypot(S.v[0], S.v[1], S.v[2]) * 3.6), drop = Math.max(0, Math.round(Game.drop));
    // (the amber hairline under the number: how fast; or, in a build that keeps count of it, how well the turns are being linked: Game.flow, 0..1)
    const bar = typeof Game.flow === 'number' ? sat(Game.flow) : Math.min(1, kmh / 130);
    if (kmh !== U.shown.spd) { U.shown.spd = kmh; el.spd.textContent = kmh; }
    if (bar !== U.shown.bar) { U.shown.bar = bar; el.tach.style.transform = 'scaleX(' + bar.toFixed(3) + ')'; }
    if (drop !== U.shown.drop) { U.shown.drop = drop; el.drop.textContent = drop.toLocaleString('en-US'); }
  };

  // ================================================================ direct switches
  // What the mountain otherwise shows only to those who ski long enough can be asked for: the hour of the day, each kind of run, the
  // animals and the airliner, the views, another mountain. One small button opens the sheet; on a keyboard T N G P R do the same without it.
  // Everything the other modules own is reached through what they already expose, and read defensively: a part that is missing has no control.
  let ease = null, cut = null, back = null, pausedAt = 0, sayT = 0, swAcc = 0, faunaI = 0, evSig = null;
  const held = [], gy = { id: null, y: 0, on: false, over: false, neg: false };
  const live = () => U.state === 'title' || U.state === 'run';
  const fauna = () => { try { return typeof Fauna !== 'undefined' && Fauna && Fauna.spawn ? Fauna : null; } catch (e) { return null; } };
  const mkBtn = (txt, key, val) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.dataset[key] = val; return b; };
  function initSwitch() {
    el.time.appendChild(mkBtn('自动', 'time', 'auto')); for (const [id, name] of TIMES) el.time.appendChild(mkBtn(name, 'time', id));
    for (const k of Object.keys(SEG_TYPES)) el.kinds.appendChild(mkBtn(SEG_NAMES[k] || k, 'seg', k));
    el.sw.addEventListener('click', e => { e.stopPropagation(); U.openSwitch(); if (e.detail) el.sw.blur(); });
    el.swp.addEventListener('click', e => {
      e.stopPropagation(); const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
      if (d.time) U.setTime(d.time); else if (d.seg) U.gotoKind(d.seg); else if ('animal' in d) U.animal(d.animal); else if (d.plane) U.plane(); else if (d.view) U.nextView(1); else if (d.new) U.newMountain();
      if (e.detail) b.blur();          // chosen with a pointer: the keys go on belonging to the skier (space is the jump, not this button again)
    });
    // back to skiing: a press on the picture puts the sheet away (and steers, as it always does; how high on the picture the finger came
    // down is kept here for the line drawn from it, the game itself only wanting to know how far across)
    $('view').addEventListener('pointerdown', e => { if (U.open && U.state === 'run') U.openSwitch(false); gy.id = e.pointerId; gy.y = View.y(e); });
    holdBtn(el.jump, 'jump'); holdBtn(el.tuck, 'tuck');
    // the run is set down by its glyph or Esc, and by itself whenever the player is taken away: another window, another app, a call
    el.pz.addEventListener('click', e => { e.stopPropagation(); U.pause(); });
    el.pause.addEventListener('click', e => { e.stopPropagation(); if (U.gone) { location.reload(); return; } const b = e.target.closest('button'); if (b === el.pzGo) U.resume(); else if (b === el.pzTop) U.toTop(); });
    addEventListener('blur', () => { letGo(); if (performance.now() - fsT > 1200) U.pause(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { letGo(); U.pause(); } });
    // a mountain named in the address while the page is open (a link followed, the back button) is gone to as well
    addEventListener('hashchange', () => { const m = /^#seed-(\d{1,9})$/.exec(location.hash); if (m && +m[1] !== Course.seed) U.newMountain(+m[1]); });
  }
  // the two moves under the thumb. Each button keeps the finger that pressed it (captured: sliding off it neither lets go nor reaches the
  // picture, where a press would begin to steer); a tap shorter than a frame is held until one step of the game has seen it
  function holdBtn(b, key) {
    const h = { id: null, seen: true, drop: false, set(on) { Input.btn[key] = on; b.classList.toggle('down', on); } };
    b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (h.id != null) return; h.id = e.pointerId; h.seen = false; h.drop = false; try { b.setPointerCapture(e.pointerId); } catch (_) { } h.set(true); });
    const up = e => { if (e.pointerId !== h.id) return; h.id = null; if (h.seen) h.set(false); else h.drop = true; };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    for (const t of ['click', 'touchstart', 'touchend']) b.addEventListener(t, e => { if (e.cancelable) e.preventDefault(); e.stopPropagation(); }, { passive: false });
    held.push(h);
  }
  U.openSwitch = function (on) {
    if (!el) return; if (on == null) on = !U.open; if (on === U.open) return;
    U.open = on; if (on) { paint(); el.say.classList.remove('on'); sayT = 0; }
    el.sw.classList.toggle('open', on); el.swp.classList.toggle('on', on); el.sw.setAttribute('aria-expanded', on ? 'true' : 'false');
  };
  // what a key changed, said once (the open sheet shows it itself)
  function say(k, v) { if (!el || U.open) return; el.sayK.textContent = k; el.sayV.textContent = v || ''; el.say.classList.add('on'); sayT = 2.4; }
  function flash(b) { if (!b) return; b.classList.add('hit'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('hit'), 1500); }
  // which of the named hours the clock is nearest to
  function hour() { const C = Sky.cycle, c = ((Sky.clock % C) + C) % C; let best = TIMES[0][0], bd = 1e9; for (const [id] of TIMES) { let d = Math.abs(c - Sky.times[id]); d = Math.min(d, C - d); if (d < bd) { bd = d; best = id; } } return best; }
  // the sheet as things stand: the hour held (or, with the clock running, the hour it has reached), the run being skied, and whatever of
  // animals, views and seeds this build has
  function paint() {
    if (!el) return;
    const now = U.tod === 'auto' ? hour() : null, kind = Course.segAt(-Game.s.p[2]).type;
    for (const b of el.time.children) { b.classList.toggle('on', b.dataset.time === U.tod); b.classList.toggle('now', b.dataset.time === now); }
    for (const b of el.kinds.children) b.classList.toggle('on', b.dataset.seg === kind);
    const F = fauna(), ks = F && F.kinds && F.kinds.length ? F.kinds : [{ id: '', name: '鹿' }], sig = ks.map(k => k.id + ':' + k.name).join();
    if (sig !== evSig) {
      evSig = sig; el.ev.textContent = '';
      for (const k of ks) el.ev.appendChild(mkBtn(k.name, 'animal', k.id));
      const s = document.createElement('i'); s.className = 'sep'; el.ev.appendChild(s);
      const p = mkBtn('航班', 'plane', '1'), kb = document.createElement('kbd'); kb.textContent = 'P'; p.appendChild(kb); el.ev.appendChild(p);
    }
    const vs = Game.views && Game.views.length && Game.nextView ? Game.views : null, mt = typeof App.newMountain === 'function';
    el.view.hidden = !vs; el.mt.hidden = !mt; el.more.hidden = !vs && !mt;
    if (vs) { const v = vs.find(q => q.id === Game.view) || vs[0], n = v.name || String(v.id); if (el.vn.textContent !== n) el.vn.textContent = n; }
    if (mt) { const n = '#' + Course.seed; if (el.seed.textContent !== n) el.seed.textContent = n; }
  }

  // ---- the hour. It is turned to, not cut to: the clock is run the short way round to the hour asked for in a second or two (the sun
  // keeps its bearing all day, so run backwards a sunset is simply a sunrise), and held there until the day is let go again
  U.setTime = function (id) {
    if (id === 'auto') { U.tod = 'auto'; ease = null; Sky.rate = 1; }
    else {
      const to = Sky.times[id]; if (to == null) return;
      const C = Sky.cycle; let d = (((to - Sky.clock) % C) + C) % C; if (d > C / 2) d -= C;
      U.tod = id; Sky.rate = 0; ease = { from: Sky.clock, d, t: 0, dur: clamp(0.8 + Math.abs(d) / 140, 0.9, 2.4) };
    }
    paint(); say('时间', id === 'auto' ? '自动' : (TIMES.find(q => q[0] === id) || [])[1]);
  };
  U.nextTime = function (dir) { const i = TIMES.findIndex(q => q[0] === (U.tod === 'auto' ? hour() : U.tod)); U.setTime(TIMES[(i + (dir || 1) + TIMES.length) % TIMES.length][0]); };

  // ---- a change of place is a cut, and is shown as one: the picture dips to black, the skier is put there, the picture comes back.
  // (The black also covers the one long frame in which the snow of the new place is worked out.)
  function cutTo(fn) { if (cut || !el) return false; cut = { t: 0, stage: 0, n: 0, fn }; return true; }
  // after the skier has been put somewhere else: nothing of the old place comes along
  function settle() {
    try { if (Tracks.reset) Tracks.reset(); if (Spray.clear) Spray.clear(); } catch (e) { }
    try { const F = fauna(); if (F && F.reset) F.reset(); else if (Deer.herd) Deer.herd.length = 0; } catch (e) { }
    App.strides = null; App.lookYaw = null; U.segIdx = -1;
  }
  // the next run of a kind, ahead of where the skier is
  function nextOfKind(type) {
    let i = Course.segAt(-Game.s.p[2]).idx + 1;
    for (let n = 0; n < 48; n++, i++) {
      if (i >= Course.segs.length) { const l = Course.segs[Course.segs.length - 1]; Course.segAt(l.s0 + l.len + 1); if (i >= Course.segs.length) return null; }
      if (Course.segs[i].type === type) return Course.segs[i];
    }
    return null;
  }
  // where to stand in it: just past the blend out of the run before. Among the jumps: in the lane of the first one, a short run-in above
  // its lip (the fall line is straight down the mountain whichever way the valley bends, so it is the lip the skier is lined up with)
  function standIn(sg) {
    let s = sg.s0 + 30, x = null;
    if (sg.type === 'kickers') try {
      let f = null; for (let b = Math.floor(sg.s0 / 32); b <= Math.floor((sg.s0 + sg.len) / 32); b++) for (const q of Course.feats.get(b) || []) if (q.mark && q.s >= sg.s0 + 40 && (!f || q.s < f.s)) f = q;
      if (f) { s = Math.max(sg.s0 + 30, f.s - 40); x = Course.at(f.s + f.len * 0.94, {}).cx + f.u; }
    } catch (e) { }
    return { s, x };
  }
  U.gotoKind = function (type) {
    if (!live() || !SEG_TYPES[type]) return false;
    const sg = nextOfKind(type); if (!sg) return false;
    if (!cutTo(() => {
      const run = Game.mode === 'run', at = standIn(sg);
      Game.reset(at.s);
      if (at.x != null) { const S = Game.s, z = S.p[2], h = Course.height(at.x, z, 0.5), n = Course.normal(at.x, z, 0.35); S.p[0] = at.x; S.p[1] = S.h = Game.y0 = h; S.n[0] = n[0]; S.n[1] = n[1]; S.n[2] = n[2]; }
      settle(); if (run) launch();
    })) return false;
    if (U.state === 'title') say('路段', SEG_NAMES[type]);          // (in a run the name of the run comes up by itself)
    return true;
  };
  U.nextKind = function (dir) { const ks = Object.keys(SEG_TYPES), i = ks.indexOf(Course.segAt(-Game.s.p[2]).type); return U.gotoKind(ks[(i + (dir || 1) + ks.length) % ks.length]); };

  // ---- another mountain (the seeding itself is the course's: App.newMountain). The seed is written into the address as #seed-<n>
  function reflect(n) { if (n == null) return; const h = '#seed-' + n; try { if (location.hash !== h) history.replaceState(null, '', h); } catch (e) { try { location.hash = h; } catch (_) { } } }
  U.newMountain = function (seed) {
    if (!live() || typeof App.newMountain !== 'function') return false;
    return cutTo(() => {
      const run = Game.mode === 'run'; let n = null; try { n = App.newMountain(seed); } catch (e) { console.warn(e); }
      settle(); if (run && Game.mode === 'run' && Math.hypot(Game.s.v[0], Game.s.v[1], Game.s.v[2]) < 0.5) launch();          // (left standing at the gate: push off)
      reflect(n != null ? n : Course.seed); say('山', '#' + Course.seed);
    });
  };

  // ---- the things otherwise met by chance, sent for
  U.animal = function (id) {
    if (!live()) return; let name = '鹿', b = null;
    try {
      const F = fauna();
      if (F) {
        const ks = F.kinds || []; let i = id ? ks.findIndex(q => String(q.id) === String(id)) : -1;
        if (i < 0 && ks.length) i = faunaI % ks.length;          // no kind asked for: each in turn, so that all of them get seen
        const k = i >= 0 ? ks[i] : null; if (k) faunaI = i + 1;
        F.spawn(k ? k.id : undefined); name = k ? k.name : '动物'; b = k ? el.ev.querySelector('[data-animal="' + k.id + '"]') : null;
      } else { if (Deer.ready && Deer.enabled !== false && !Deer.herd.length) Deer.spawn(); b = el.ev.querySelector('[data-animal]'); }
    } catch (e) { console.warn(e); }
    flash(b); say('偶遇', name);
  };
  // (the airliner's own clock is simply told that its time has come; it then flies its pass as it always does)
  U.plane = function () {
    if (!live()) return; const P = Sky.plane; if (!P) return;
    let v = '航班 · 还在天上';
    if (!P.on && Sky.planes !== false) { v = '航班 · 看' + (P.n % 2 ? '右' : '左') + '上方'; P.next = 0; }
    flash(el.ev.querySelector('[data-plane]')); say('偶遇', v);
  };
  U.nextView = function (dir) { if (!live() || !Game.nextView) return; try { Game.nextView(dir || 1); } catch (e) { console.warn(e); } paint(); };

  // ---- a run set down, and taken up again. Set down, nothing steps and nothing is drawn (App.paused stops the loop); the last picture
  // waits under a shade with the two ways on: 继续, and 回到山顶 (the gate, and the title page with it)
  function letGo() { for (const h of held) { h.id = null; h.drop = false; h.seen = true; h.set(false); } }
  function hush(level, tau) { try { if (Sound.rig && Sound.unlocked && Sound.ctx) Sound.rig.fade(level, Sound.ctx.currentTime, tau); } catch (e) { } }
  function card(on, lost) {
    if (on) { el.pause.classList.toggle('lost', !!lost); el.pauseS.textContent = lost ? '画面断开了' : 'PAUSED'; el.pauseT.textContent = lost ? '点一下重新上山' : '暂停'; }
    el.pause.classList.toggle('on', on); el.pause.setAttribute('aria-hidden', on ? 'false' : 'true');
    try { if (on && !lost) el.pzGo.focus({ preventScroll: true }); else if (!on && el.pause.contains(document.activeElement)) document.activeElement.blur(); } catch (e) { }
  }
  U.pause = function () {
    if (!el || U.state !== 'run' || U.paused || U.gone) return false;
    U.paused = true; pausedAt = performance.now(); App.paused = true; back = null; App.resumeK = 1;
    U.openSwitch(false); letGo(); Input.drag = null; Input.keys = {}; gy.on = false; el.steer.classList.remove('on'); el.say.classList.remove('on'); sayT = 0;
    hush(0, 0.05);          // (a time constant: all but gone in 0.15 s)
    card(true); return true;
  };
  // The world is let go gently: at three tenths of its speed, up to all of it over 0.8 s. That factor is the interface's own, App.resumeK,
  // and scales the frame's time in the loop; the slow motion of a jump (Game.timeScale) scales the same time again inside the step, so the
  // two multiply. However the phone is being held now is 'straight ahead' again
  U.resume = function () {
    if (!el || !U.paused || U.gone) return false;
    U.paused = false; card(false); U.t0 += performance.now() - pausedAt;
    App.resumeK = 0.3; back = { t: 0 }; Input.zeroPending = true; Input.drag = null; Input.keys = {};
    App.paused = false; hush(Sound.on ? Sound.level : 0, 0.12); U.keepAwake(); return true;
  };
  // (the run is still set down while the picture goes to black, so the page's own clock times that; it comes back by frames, as every cut does)
  U.toTop = function () {
    if (!el || !U.paused || U.gone) return false;
    U.paused = false; U.state = 'leaving';          // (neither a run nor the title until the black is down: no key does anything)
    card(false); el.cut.classList.add('slow'); el.cut.style.opacity = 1; cut = { t: 0, stage: 9, n: 0, fn: null };
    setTimeout(() => {
      el.cut.classList.remove('slow');
      try { Game.reset(); Game.mode = 'title'; } catch (e) { console.warn(e); }
      settle(); Input.drag = null; Input.keys = {}; U.state = 'title'; U.paused = false; back = null; App.resumeK = 1;
      el.app.classList.remove('run'); el.hud.classList.remove('on'); el.shade.classList.remove('run'); el.hint.classList.remove('on'); el.seg.classList.remove('on'); el.title.classList.add('on'); U.hintKind = null;
      cut = { t: 0, stage: 1, n: 0, fn: null }; App.paused = false; hush(Sound.on ? Sound.level : 0, 0.4); paint();
    }, 300);
    return true;
  };
  // the picture itself is gone (the graphics device was taken away: the loop tells us). Nothing can be drawn again from here: say so, start over on a tap
  U.lost = function () { if (!el || U.gone) return; U.gone = true; U.paused = false; U.openSwitch(false); letGo(); hush(0, 0.05); card(true, true); };

  // per displayed frame, on the title page as in a run. dt is the frame's own (real) time: these are the interface's clocks, not the world's
  function switches(dt) {
    if (ease) { ease.t += dt; Sky.setClock(ease.from + ease.d * smoother(0, 1, ease.t / ease.dur)); if (ease.t >= ease.dur) ease = null; }
    if (cut) {
      cut.t += dt;
      if (cut.stage === 0) { const k = sat(cut.t / 0.16); el.cut.style.opacity = k; if (k >= 1) { cut.stage = 1; try { cut.fn(); } catch (e) { console.warn(e); } paint(); } }
      else if (cut.stage === 1) { if (++cut.n >= 2) { cut.stage = 2; cut.t = 0; } }          // two frames of the new place drawn unseen: the first is the long one
      else { const k = sat(cut.t / 0.45); el.cut.style.opacity = 1 - smooth(0, 1, k); if (k >= 1) { el.cut.style.opacity = ''; cut = null; } }
    }
    if (back) { back.t += dt; const k = sat(back.t / 0.8); App.resumeK = 0.3 + 0.7 * smooth(0, 1, k); if (k >= 1) { App.resumeK = 1; back = null; } }
    if (sayT > 0 && (sayT -= dt) <= 0) el.say.classList.remove('on');
    // the game has now stepped with whatever the thumbs were holding
    for (const h of held) { if (h.drop) { h.drop = false; h.set(false); } else h.seen = true; }
    // the steering finger: from where it came down to where it is (no further than full lock: past that nothing more happens), and whether
    // it is past the carve. The two numbers are Input's lock distance and the game's carve range (0.72 of full lock)
    { const d = U.state === 'run' ? Input.drag : null;
      if (d && gy.id === d.id) {
        const L = Math.min(View.w || innerWidth, (View.h || innerHeight) * 1.4, 900) * 0.2, c = L * 0.72, dx = clamp(d.x - d.x0, -L, L), over = Math.abs(dx) > c, neg = dx < 0;
        if (!gy.on) { gy.on = true; el.steer.style.transform = 'translate(' + d.x0.toFixed(1) + 'px, ' + gy.y.toFixed(1) + 'px)'; el.steer.style.setProperty('--c', c.toFixed(1) + 'px'); el.steer.classList.add('on'); }
        el.steer.firstElementChild.style.transform = 'scaleX(' + dx.toFixed(1) + ')';
        if (over !== gy.over) { gy.over = over; el.steer.classList.toggle('over', over); } if (neg !== gy.neg) { gy.neg = neg; el.steer.classList.toggle('neg', neg); }
      } else if (gy.on) { gy.on = false; el.steer.classList.remove('on'); }
    }
    { const k = Input.btn.jump ? sat(Game.s.charge || 0) : 0; if (k !== (U.shown.k || 0)) { U.shown.k = k; el.jump.style.setProperty('--k', k.toFixed(3)); } }
    swAcc += dt; if (U.open && swAcc > 0.25) { swAcc = 0; paint(); }
  }
  return U;
})();
