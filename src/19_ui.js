// ---------------------------------------------------------------- loading page, title page, and the little that is on screen during a run
const UI = (() => {
  const U = { state: 'load', segIdx: -1, hintT: 0, hintKind: null, acc: 0, shown: { spd: -1, drop: -1 }, tod: 'auto', open: false };
  const $ = id => document.getElementById(id);
  const T = s => I18N.t(s), EN = () => I18N.en();          // (the words shown: see 00a_i18n.js)
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
      bar: $('bar'), mn: $('mn'), menu: $('menu'), nav: $('menu').querySelector('nav'), pane: $('mpane'), mk: $('m-k'), mGo: $('m-go'), mTop: $('m-top'), oSnd: $('o-snd'), oFs: $('o-fs'), oLang: $('o-lang'),
      time: $('sw-time'), kinds: $('sw-seg'), ev: $('sw-ev'), view: $('sw-view'), seed: $('sw-seed'), more: $('more'), drop2: $('drop2'), vw: $('vw'),
      say: $('say'), sayK: $('say-k'), sayV: $('say-v'), cut: $('cut'), jump: $('jump'), tuck: $('tuck'),
      pause: $('pause'), pauseS: $('pause-s'), pauseT: $('pause-t'), steer: $('steer') };
    el.moreView = el.more.querySelector('[data-sec="view"]');
    I18N.capture(el.app); I18N.on(relang);
    U.layout();
    el.go.addEventListener('click', e => { e.stopPropagation(); U.go(); });
    // the whole picture is the button (the corner's glyphs, the title's other buttons and the menu keep their presses to themselves)
    el.app.addEventListener('click', e => { if (U.state !== 'title' || U.open || el.bar.contains(e.target) || el.menu.contains(e.target) || el.more.contains(e.target)) return; U.go(); });
    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^Arrow/.test(e.code) || e.code === 'Space') e.preventDefault();          // these would scroll a page; here they ski
      if (e.repeat) return;
      const on = sel => e.target && e.target.closest && e.target.closest(sel);      // (a control reached with the tab key takes its own Enter)
      if (U.gone) { if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); location.reload(); } return; }
      // the menu open: Esc puts it away (and the run goes on); Enter and space belong to the button that has the focus
      const mine = (e.code === 'Enter' || e.code === 'Space') && on('#menu button, #bar button, #more button');
      if (U.open && e.code === 'Escape') { e.preventDefault(); U.menu(false); return; }
      if (mine) { muteKey(e.code); return; }
      if (U.open && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); muteKey(e.code); el.mGo.click(); return; }          // (nothing in the menu has the focus: Enter, or space as the owner asked, is the top line, 继续滑 or 出发)
      if ((e.code === 'Enter' || e.code === 'Space') && U.state === 'title' && !U.open) { e.preventDefault(); muteKey(e.code); U.go(); }
      else if (e.code === 'KeyM') { U.sound(!Sound.on); if (U.open) paint(); }
      else if (e.code === 'KeyF') U.fullscreen();
      else if (U.state === 'title' || U.state === 'run') {
        const d = e.shiftKey ? -1 : 1;
        if (e.code === 'KeyT') U.nextTime(d); else if (e.code === 'KeyN') U.nextKind(d); else if (e.code === 'KeyG') U.animal(); else if (e.code === 'KeyP') U.plane();
        else if (e.code === 'KeyR') U.newMountain(); else if (e.code === 'Escape') U.menu(true);
        else if (e.code === 'KeyH') U.menu('keys'); else if (e.code === 'Backquote') U.menu('vers');
      }
    });
    function muteKey(c) { try { if (typeof Input !== 'undefined' && Input.keys) { Input.mute = c; Input.keys[c] = false; } } catch (err) { } }
    el.snd.addEventListener('click', e => { e.stopPropagation(); U.sound(!Sound.on); if (e.detail) el.snd.blur(); });
    el.fs.addEventListener('click', e => { e.stopPropagation(); U.fullscreen(); });
    document.addEventListener('fullscreenchange', () => {
      const on = !!document.fullscreenElement, own = performance.now() - fsT < 1500; fsT = performance.now();
      el.fs.classList.toggle('full', on); el.fs.setAttribute('aria-pressed', on ? 'true' : 'false'); U.layout(); if (U.open) paint();
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
    initSplits();
    initVariants();
  };
  // how the frame lies: wide or tall, turned or not; the stylesheet does the rest
  U.layout = function () {
    if (!el) return;
    const V = View.measure(), c = el.app.classList, hh = handheld();
    c.toggle('rot', V.forced); c.toggle('flip', V.forced && V.flip); c.toggle('wide', V.wide); c.toggle('short', V.short); c.toggle('desk', !hh);
    c.toggle('hasfs', !hh && !!document.fullscreenEnabled && !!el.app.requestFullscreen);          // (a third glyph in the corner: the pill stands clear of it)
    el.app.style.width = V.forced ? V.w + 'px' : ''; el.app.style.height = V.forced ? V.h + 'px' : '';
    el.app.style.setProperty('--cw', V.w + 'px'); el.app.style.setProperty('--ch', V.h + 'px');
    // (inside a frame, as on claude.ai, the phone's tilt is refused: there the finger is the only way, so the title says only that)
    let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
    el.how.textContent = T(!hh ? '← → 或 A D 转弯 · 空格 跳 · ↓ 或 S 加速' : framed ? '按住屏幕左右拖动转弯 · 右下角 跳 / 加速' : '倾斜手机或按住屏幕左右拖动转弯 · 右下角 跳 / 加速');
    U.hh = hh;
  };
  U.stage = function (f, name) { if (!el) return; el.fill.style.transform = 'scaleX(' + f.toFixed(3) + ')'; if (name) el.stage.textContent = T(name); };
  // first frame is on the canvas: let it come up out of the dark, then set the title over it
  U.ready = function () {
    if (!el) return; U.state = 'title';
    el.load.classList.remove('on'); el.veil.classList.add('lift'); el.shade.classList.add('on'); el.title.classList.add('on'); el.snd.classList.add('on');
    if (!U.hh && document.fullscreenEnabled && el.app.requestFullscreen) el.fs.classList.add('on');
    el.bar.classList.add('on'); paint();
  };
  U.sound = function (on) { Sound.setOn(on); el.snd.classList.toggle('mute', !on); el.snd.setAttribute('aria-pressed', on ? 'true' : 'false'); if (U.open) paint(); };
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
    if (U.open) U.menu(false); el.title.classList.remove('on');
    // tilt has to be asked for from this tap (iOS shows its own prompt); where it is refused the finger takes over
    let asked = false; try { asked = await Promise.race([Input.requestTilt(), new Promise(r => setTimeout(() => r(false), 8000))]); } catch (e) { }
    Input.zeroPending = true; U.keepAwake();
    launch();
    U.state = 'run'; U.t0 = performance.now(); U.segIdx = -1; U.hintT = 0; U.hintKind = null; U.tiltAsked = asked;
    newRun();
    el.shade.classList.add('run'); el.hud.classList.add('on'); el.app.classList.add('run');
  };
  function showHint(kind) {
    U.hintKind = kind; el.hint.className = kind + ' on';
    el.hintT.textContent = T(kind === 'tilt' ? '像握方向盘一样倾斜手机' : kind === 'drag' ? '按住屏幕，左右拖动' : kind === 'pace' ? '连着转弯，把雪扬起来'
      : kind === 'moves' ? (U.hh ? '按住「跳」蓄力，松开起跳' : '空格 跳（按住蓄力） · ↓ 加速') : '← →  或  A D  转弯');
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
    if (sg.idx > U.segIdx && since > 1.6 && !dayUp()) {
      U.segIdx = sg.idx; segCard(sg);
      // (on a phone held flat the card stands beside the speed, in the sky over the city, and goes sooner: the horizon is the picture there)
      segHold(el.app.classList.contains('short') && !el.app.classList.contains('desk') ? 2.5 : 3.6);
    }
    spFrame(dt);
    // numbers, ten times a second
    U.acc += dt; if (U.acc < 0.1) return; U.acc = 0;
    const kmh = Math.round(Math.hypot(S.v[0], S.v[1], S.v[2]) * 3.6), drop = Math.max(0, Math.round(Game.drop));
    // (the amber hairline under the number: how fast; or, in a build that keeps count of it, how well the turns are being linked: Game.flow, 0..1)
    const bar = typeof Game.flow === 'number' ? sat(Game.flow) : Math.min(1, kmh / 130);
    if (kmh !== U.shown.spd) { U.shown.spd = kmh; el.spd.textContent = kmh; }
    if (bar !== U.shown.bar) { U.shown.bar = bar; el.tach.style.transform = 'scaleX(' + bar.toFixed(3) + ')'; }
    if (drop !== U.shown.drop) { U.shown.drop = drop; el.drop.textContent = drop.toLocaleString('en-US'); el.drop2.textContent = '· ' + T('落差') + ' ' + drop.toLocaleString('en-US') + ' M'; }
  };

  // ================================================================ splits, and the day card
  // A run is given a shape. Each stretch of the mountain, once skied, leaves one quiet line under the name of the next: the time it took, the
  // fastest it was skied, the longest flight in it, and a small amber rise beside a figure that beats the best of that kind of run today (the
  // first of a kind sets its best without a word). At sunset and at sunrise a card sums up the run so far. The figures are the game's own,
  // gathered on its clock in App.onTick (so the slow motion of a jump and the tests' fast-forward count them right); when they show, and for how
  // long, is the interface's, on real time. Only skiing counts: a change of place (a switch, another mountain) carries nothing across it, so a
  // switch never makes a result, and a stretch counts only if it was skied from its top (the gate, or where a switch sets the skier down).
  // The bests of each kind last as long as the page (another mountain, the gate again: kept); the run so far starts again at 出发.
  const SP = U.sp = { cur: null, p: [0, 0, 0], seed: 0, air: false, to: null, best: {}, run: null, res: null, segT: -1, day: null, dayQ: null, days: 1, clock: null, nat: 0 };
  const JUMP_T = 0.75;          // s off the snow before a flight is a jump, not a hop off a bump (the slow motion of a jump takes hold from 0.6 s, whole at 1)
  const freshRun = () => ({ t: 0, dist: 0, drop: 0, v: 0, air: 0 });
  const fmt = (v, dp) => dp ? v.toFixed(dp) : Math.round(v).toLocaleString('en-US');
  const dayUp = () => !!SP.day && SP.day.t < 5;
  function initSplits() {
    el.split = $('split'); el.day = $('day'); el.dayK = $('day-k'); el.dayT = $('day-t'); el.dayF = $('day-f');
    SP.run = freshRun(); App.onTick.push(spTick);
  }
  // 出发: a new run (the bests of each kind stay)
  function newRun() {
    Object.assign(SP, { run: freshRun(), cur: null, res: null, segT: -1, day: null, dayQ: null, days: 1, clock: null });
    el.day.classList.remove('on', 'held'); el.seg.classList.remove('res'); el.app.classList.remove('res', 'daycard');
  }
  // the skier has been put somewhere else: what was being measured goes, and so does a result not yet shown
  function spSettle() { SP.cur = null; SP.res = null; el.seg.classList.remove('res'); el.app.classList.remove('res'); }
  // the card of a run stays up t seconds from now (or longer, if it already would); brought up afresh, it comes without the last result
  function segHold(t) { if (SP.segT <= 0) { el.seg.classList.remove('res'); el.app.classList.remove('res'); } el.seg.classList.add('on'); SP.segT = Math.max(SP.segT, t); }

  // ---- on the game's clock, every step of it (dt is the world's time: slowed in the air, none while the run is set down)
  function spTick(dt) {
    if (!(dt > 0) || Game.mode === 'hold') return;          // (a run held by the menu: nothing goes by, and nothing is measured afresh)
    const S = Game.s, p = S.p, run = Game.mode === 'run';
    // sunset and sunrise, as the day reaches them by itself. A clock turned or held by a switch is not the day going by: a mark counts only
    // once the clock has run on its own for a second before it (so neither a switch nor letting the clock go again on the mark brings a card)
    { const ck = Sky.clock, C = Sky.cycle || 600, own = run && Sky.rate !== 0 && U.tod === 'auto' && !ease;
      if (!own || SP.clock == null || ck < SP.clock || ck - SP.clock > 2) SP.nat = ck;
      else for (const rise of [false, true]) {
        const m0 = rise ? Sky.times.sunrise : Sky.times.sunset, m = m0 + C * Math.floor((ck - m0) / C);
        if (m > SP.clock && m >= SP.nat + 1) { if (rise) SP.days++; if (SP.run.t >= 20) SP.dayQ = { rise, day: SP.days, w: 0 }; }
      }
      SP.clock = ck; }
    if (!run) { SP.cur = null; return; }
    // put somewhere else (a switch, another mountain, a run begun): measure afresh from here
    if (!SP.cur || SP.seed !== Course.seed || Math.hypot(p[0] - SP.p[0], p[1] - SP.p[1], p[2] - SP.p[2]) > 6) { spBegin(); return; }
    const R = SP.run, c = SP.cur, v = Math.hypot(S.v[0], S.v[1], S.v[2]);
    R.t += dt; R.dist += SP.p[2] - p[2]; R.drop += SP.p[1] - p[1]; if (v > R.v) R.v = v;
    // a flight: from where the skis left the snow to where they came down, in a straight line
    if (S.air && !SP.air) SP.to = p.slice();
    else if (!S.air && SP.air && SP.to) { const d = Math.hypot(p[0] - SP.to[0], p[1] - SP.to[1], p[2] - SP.to[2]); if ((S.airT || 0) >= JUMP_T) { if (d > c.air) c.air = d; if (d > R.air) R.air = d; } SP.to = null; }
    SP.air = !!S.air; SP.p[0] = p[0]; SP.p[1] = p[1]; SP.p[2] = p[2];
    // over the line into the next run: the one left is done (if it was skied from its top, and for more than a moment)
    const sg = Course.segAt(-p[2]);
    if (sg.idx > c.idx) { if (sg.idx === c.idx + 1 && c.whole && c.t > 3) spFinish(c); SP.cur = { idx: sg.idx, type: sg.type, whole: sg.idx === c.idx + 1, t: 0, v: 0, air: 0 }; }
    const k = SP.cur; k.t += dt; if (v > k.v) k.v = v;
  }
  // (a stretch counts from its top: from within its first 80 m, which takes in the gate at 14 m and where a switch sets the skier down)
  function spBegin() {
    const S = Game.s, s = -S.p[2], sg = Course.segAt(s);
    SP.cur = { idx: sg.idx, type: sg.type, whole: s - sg.s0 < 80, t: 0, v: 0, air: 0 };
    SP.p = S.p.slice(); SP.seed = Course.seed; SP.air = !!S.air; SP.to = null;
  }
  // a best is a figure shown higher than the best shown before for that kind of run (time is not compared: no two runs of a kind are the same length)
  function spFinish(c) {
    const b = SP.best[c.type] || (SP.best[c.type] = { v: 0, air: 0 }), kv = Math.round(c.v * 3.6), ka = Math.round(c.air);
    SP.res = { type: c.type, t: c.t, kv, ka, upV: b.v > 0 && kv > Math.round(b.v * 3.6), upA: ka > 0 && b.air > 0 && ka > Math.round(b.air) };
    if (c.v > b.v) b.v = c.v; if (c.air > b.air) b.air = c.air;
  }

  // ---- per displayed frame of a run (real time)
  function spFrame(dt) {
    // the result of the run just left, under the name of the one being entered (named now if it has not been yet: a skier who slowed short of the line)
    if (SP.res && !dayUp()) {
      const r = SP.res, sg = Course.segAt(-Game.s.p[2]); SP.res = null;
      if (sg.idx > U.segIdx) { U.segIdx = sg.idx; segCard(sg); }
      splitLine(r); segHold(3.2); el.seg.classList.add('res'); el.app.classList.add('res');
    }
    if (SP.segT > -1) {
      const was = SP.segT; SP.segT -= dt;
      if (was > 0 && SP.segT <= 0) el.seg.classList.remove('on');
      if (SP.segT <= -1) { el.seg.classList.remove('res'); el.app.classList.remove('res'); }          // (closed again once the card has gone)
    }
    // the day card when its hour comes: once the name of a run is out of the way (eight seconds at the most), never over it
    if (SP.dayQ && !SP.day) { SP.dayQ.w += dt; if (SP.segT <= -1 || SP.dayQ.w > 8) { dayShow(SP.dayQ); SP.dayQ = null; } }
    if (SP.day) dayFrame(dt);
  }
  // 陡坡 · 28.4 s · 132 km/h ▲ · 飞行 38 m
  // the card of a run: its number and its name (in English the name is the big line, and the number stands alone over it)
  function segCard(sg) { const n = (sg.idx + 1 < 10 ? '0' : '') + (sg.idx + 1); el.segCn.textContent = T(SEG_NAMES[sg.type] || ''); el.segEn.textContent = EN() ? n : n + ' · ' + (SEG_EN[sg.type] || ''); }
  function splitLine(r) {
    const line = document.createElement('span'), add = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; line.appendChild(e); return e; };
    const fig = (lab, v, u) => { add('i', 'd', '·'); if (lab) add('em', 'k', lab); line.appendChild(document.createTextNode(v)); if (u) add('u', null, u); };
    add('em', 'k', T(SEG_NAMES[r.type] || ''));
    if (r.t < 60) fig('', r.t.toFixed(1), 's'); else fig('', Math.floor(r.t / 60) + ':' + (r.t % 60).toFixed(1).padStart(4, '0'), '');
    fig('', String(r.kv), 'km/h'); if (r.upV) add('i', 'up');
    if (r.ka > 0) { fig(T('飞行 '), String(r.ka), 'm'); if (r.upA) add('i', 'up'); }
    el.split.textContent = ''; el.split.appendChild(line);
  }
  // DAY 1 · SUNSET / 日落 / the run so far: 落差, 距离, 极速, and the longest flight if there was one
  function dayShow(q) {
    const R = SP.run, F = [[Math.max(0, R.drop), 0, '落差 M'], R.dist < 1000 ? [Math.max(0, R.dist), 0, '距离 M'] : [R.dist / 1000, 1, '距离 KM'], [R.v * 3.6, 0, '极速 KM/H']];
    if (R.air > 0) F.push([R.air, 0, '飞行 M']);
    el.dayK.textContent = 'DAY ' + q.day + (EN() ? '' : ' · ' + (q.rise ? 'SUNRISE' : 'SUNSET')); el.dayT.textContent = T(q.rise ? '日出' : '日落');
    el.dayF.textContent = ''; const d = SP.day = { t: 0, f: [] };
    for (const [v, dp, lab] of F) { const w = document.createElement('div'), b = document.createElement('b'), s = document.createElement('span'); b.textContent = fmt(v, dp); s.textContent = T(lab); w.appendChild(b); w.appendChild(s); el.dayF.appendChild(w); d.f.push({ el: b, v, dp, k: -1 }); }
    // (each figure keeps the width of its whole value while it runs up to it, so nothing beside it moves)
    for (const f of d.f) f.el.style.minWidth = f.el.offsetWidth + 'px';
    for (const f of d.f) f.el.textContent = fmt(0, f.dp);
    // (held in the hands it stands high, out from under the thumbs: on the left, or mirrored on the right while the sun is in the left half)
    let r = false; if (U.hh) try { const g = Render.G, o = GOFF.sunScr; r = g[o + 2] > 0 && g[o] < 0.5; } catch (e) { }
    el.day.classList.toggle('r', r);
    el.day.classList.remove('on', 'held'); void el.day.offsetWidth; el.day.classList.add('on'); el.app.classList.add('daycard');
  }
  function dayFrame(dt) {
    const d = SP.day; d.t += dt;
    for (let i = 0; i < d.f.length; i++) { const f = d.f[i], k = sat((d.t - 0.95 - 0.12 * i) / 0.85); if (k !== f.k) { f.k = k; f.el.textContent = fmt(f.v * (1 - Math.pow(1 - k, 3)), f.dp); } }
    if (d.t >= 5 && el.day.classList.contains('on')) { el.day.classList.remove('on'); el.app.classList.remove('daycard'); }
    if (d.t >= 6.4) SP.day = null;
  }

  // ================================================================ the menu, and the direct switches
  // What the mountain otherwise shows only to those who ski long enough can be asked for: the hour of the day, the weather, each kind of run,
  // the animals and the airliner, the views, another mountain. All of it lives in one menu. In a run the menu is the pause: the world holds
  // still where it is (Game.mode 'hold': nothing steps, but the picture is still drawn, so whatever is picked shows at once behind the shade).
  // On the title page the same menu opens from the three buttons beside 出发. While skiing the keys T X N G P R V do the same without it.
  // Everything the other modules own is reached through what they already expose, and read defensively: a part that is missing has no control.
  let ease = null, cut = null, back = null, pausedAt = 0, sayT = 0, swAcc = 0, faunaI = 0, evSig = null, hold = null, sec = 'sky';
  const held = [], gy = { id: null, y: 0, on: false, over: false, neg: false };
  const live = () => U.state === 'title' || U.state === 'run';
  const fauna = () => { try { return typeof Fauna !== 'undefined' && Fauna && Fauna.spawn ? Fauna : null; } catch (e) { return null; } };
  const mkBtn = (txt, key, val) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.dataset[key] = val; return b; };
  // a small drawing for each view: where the lens stands round the figure
  const VIEW_ICON = {
    chase: '<circle cx="15" cy="6.5" r="2.4"/><path d="M15 9v6.5M11 19h8"/>', fp: '<path d="M3 11c4-6 20-6 24 0-4 6-20 6-24 0z"/><circle cx="15" cy="11" r="3"/>',
    tips: '<path d="M9 21l3-17M21 21l-3-17"/>', low: '<path d="M2 18h26"/><circle cx="18" cy="9" r="2"/><path d="M18 11v5M5 16l4-2"/>',
    high: '<path d="M15 2v6M12 5l3 3 3-3"/><circle cx="15" cy="15" r="2.4"/><path d="M8 20h14"/>', left: '<path d="M3 11h6M6 8l3 3-3 3"/><circle cx="19" cy="7" r="2.2"/><path d="M19 9v7M15 19h8"/>',
    right: '<path d="M27 11h-6M24 8l-3 3 3 3"/><circle cx="11" cy="7" r="2.2"/><path d="M11 9v7M7 19h8"/>', front: '<circle cx="15" cy="7" r="2.6"/><path d="M15 10v6M10 12l5-2 5 2M11 19h8"/>',
    far: '<circle cx="15" cy="11" r="7"/><path d="M15 2v4M15 16v4M6 11h4M20 11h4"/>' };
  function initSwitch() {
    el.time.appendChild(mkBtn(T('自动'), 'time', 'auto')); for (const [id, name] of TIMES) el.time.appendChild(mkBtn(T(name), 'time', id));
    for (const k of Object.keys(SEG_TYPES)) el.kinds.appendChild(mkBtn(T(SEG_NAMES[k] || k), 'seg', k));
    el.mn.addEventListener('click', e => { e.stopPropagation(); U.menu(); if (e.detail) el.mn.blur(); });
    el.more.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('button'); if (b) U.menu(b.dataset.sec); });
    // the column on the left: a part to open, or one of the ways out
    el.menu.addEventListener('click', e => {
      e.stopPropagation(); const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
      if (b === el.mGo) { if (U.state === 'title') U.go(); else U.menu(false); return; }
      if (b === el.mTop) { U.toTop(); return; }
      if (d.sec && b.parentNode === el.nav) { show(d.sec); return; }
      if (d.time) U.setTime(d.time); else if (d.seg) U.gotoKind(d.seg); else if (d.view) U.setView(d.view); else if (d.new) U.newMountain();
      else if ('animal' in d) { U.animal(d.animal); U.menu(false); } else if (d.plane) { U.plane(); U.menu(false); }
      else if (b === el.oSnd) U.sound(!Sound.on); else if (b === el.oFs) U.fullscreen(); else if (b === el.oLang) I18N.set(EN() ? 'zh' : 'en');
      else if (d.vn) { const V = varMod(); if (V) try { V.set(d.vn, d.vid); } catch (err) { console.warn(err); } paint(); }
      else if (d.vreset) { const V = varMod(); if (V && V.reset) try { V.reset(); } catch (err) { console.warn(err); } paint(); }
      else if (d.wx) U.setWeather(d.wx);
      if (e.detail) b.blur();          // chosen with a pointer: the keys go on belonging to the skier
    });
    // the one part of the page that scrolls: the page's own guard against it (on #app) is kept out of the pane
    el.pane.addEventListener('touchmove', e => e.stopPropagation(), { passive: true });
    el.nav.addEventListener('touchmove', e => e.stopPropagation(), { passive: true });
    $('view').addEventListener('pointerdown', e => { gy.id = e.pointerId; gy.y = View.y(e); });
    holdBtn(el.jump, 'jump'); holdBtn(el.tuck, 'tuck');
    // the next view, under the thumb (a press here never reaches the picture, where it would steer)
    el.vw.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); });
    el.vw.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); U.nextView(1); });
    // the run is set down by the menu glyph or Esc, and by itself whenever the player is taken away: another window, another app, a call
    el.pause.addEventListener('click', e => { e.stopPropagation(); if (U.gone) location.reload(); });
    addEventListener('blur', () => { letGo(); if (performance.now() - fsT > 1200) U.pause(); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { letGo(); U.pause(); if (hold) App.paused = true; }          // (out of sight nothing is drawn at all)
      else if (App.paused && !U.gone) App.paused = false;
    });
    // a mountain named in the address while the page is open (a link followed, the back button) is gone to as well
    addEventListener('hashchange', () => { const m = /^#seed-(\d{1,9})$/.exec(location.hash); if (m && +m[1] !== Course.seed) U.newMountain(+m[1]); });
    if (App.onMountain) App.onMountain.push(onMountain);          // (the page's own listener takes a link followed first: this hears of that change too)
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
  // which part of the menu is open
  function show(s) {
    if (!el.pane.querySelector('section[data-sec="' + s + '"]')) s = 'sky'; sec = s;
    for (const b of el.nav.querySelectorAll('button[data-sec]')) b.classList.toggle('on', b.dataset.sec === s);
    for (const x of el.pane.children) x.classList.toggle('on', x.dataset.sec === s);
    el.pane.scrollTop = 0; paint();
  }
  // U.menu(): open or close; U.menu('view'): open at that part (or, open at it already, close)
  U.menu = function (on) {
    if (!el || U.gone) return;
    if (typeof on === 'string') { if (U.open && sec === on) on = false; else { show(on); on = true; } }
    if (on == null) on = !U.open; if (on === U.open) return;
    if (on && !live()) return;
    if (on && U.state === 'run') holdOn();
    U.open = on; if (on) { if (!el.pane.querySelector('section.on')) show(sec); paint(); el.say.classList.remove('on'); sayT = 0; }
    const run = U.state === 'run';
    el.mk.textContent = T(run ? 'PAUSED · 暂停' : 'MENU · 菜单'); el.mGo.textContent = T(run ? '继续滑' : '出发'); el.mTop.hidden = !run;
    el.menu.classList.toggle('on', on); el.menu.setAttribute('aria-hidden', on ? 'false' : 'true'); el.mn.setAttribute('aria-expanded', on ? 'true' : 'false');
    el.app.classList.toggle('menuopen', on);          // (the thumbs' buttons step aside under it)
    if (U.state === 'title') el.title.classList.toggle('on', !on);          // (the title's own words make way for it, and come back)
    try { if (!on && el.menu.contains(document.activeElement)) document.activeElement.blur(); } catch (e) { }
    if (!on && hold) holdOff();
  };
  // (the old name of the open/close, kept for anything that still calls it)
  U.openSwitch = function (on) { if (on === false || (on == null && U.open)) U.menu(false); else U.menu(true); };
  // what a key changed, said once (the open menu shows it itself)
  function say(k, v) { if (!el || U.open) return; el.sayK.textContent = EN() ? I18N.EN['say:' + k] || T(k) : k; el.sayV.textContent = T(v || ''); el.say.classList.add('on'); sayT = 2.4; }
  function flash(b) { if (!b) return; b.classList.add('hit'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('hit'), 1500); }
  // which of the named hours the clock is nearest to
  function hour() { const C = Sky.cycle, c = ((Sky.clock % C) + C) % C; let best = TIMES[0][0], bd = 1e9; for (const [id] of TIMES) { let d = Math.abs(c - Sky.times[id]); d = Math.min(d, C - d); if (d < bd) { bd = d; best = id; } } return best; }
  const views = () => Game.views && Game.views.length && Game.setView ? Game.views : null;
  const viewName = () => { const vs = views(); if (!vs) return ''; const v = vs.find(q => q.id === Game.view) || vs[0]; return v.name || String(v.id); };          // (said through T by say)
  // the menu as things stand: the hour held (or, with the clock running, the hour it has reached), the run being skied, the view, the
  // mountain, and whatever of animals, weather and versions this build has
  let vwSig = null;
  function paint() {
    if (!el) return;
    const now = U.tod === 'auto' ? hour() : null, kind = Course.segAt(-Game.s.p[2]).type;
    for (const b of el.time.children) { b.classList.toggle('on', b.dataset.time === U.tod); b.classList.toggle('now', b.dataset.time === now); }
    for (const b of el.kinds.children) b.classList.toggle('on', b.dataset.seg === kind);
    const F = fauna(), ks = F && F.kinds && F.kinds.length ? F.kinds : [{ id: '', name: '鹿' }], sig = ks.map(k => k.id + ':' + k.name).join();
    if (sig !== evSig) {
      evSig = sig; el.ev.textContent = '';
      for (const k of ks) el.ev.appendChild(mkBtn(T(k.name), 'animal', k.id));
      const s = document.createElement('i'); s.className = 'sep'; el.ev.appendChild(s);
      el.ev.appendChild(mkBtn(T('航班'), 'plane', '1'));
    }
    const vs = views(), vsig = vs ? vs.map(v => v.id).join() : '';
    if (vsig !== vwSig) {
      vwSig = vsig; el.view.textContent = '';
      for (const v of vs || []) { const b = mkBtn('', 'view', v.id); b.innerHTML = '<svg viewBox="0 0 30 22" aria-hidden="true">' + (VIEW_ICON[v.id] || VIEW_ICON.chase) + '</svg>'; const t = document.createElement('span'); t.textContent = T(v.name || v.id); b.appendChild(t); el.view.appendChild(b); }
      el.vw.hidden = !vs; el.nav.querySelector('[data-sec="view"]').hidden = !vs; el.moreView.hidden = !vs;
    }
    for (const b of el.view.children) b.classList.toggle('on', b.dataset.view === Game.view);
    const mt = typeof App.newMountain === 'function'; el.nav.querySelector('[data-sec="mt"]').hidden = !mt;
    if (mt) { const n = '#' + Course.seed; if (el.seed.textContent !== n) el.seed.textContent = n; }
    el.oSnd.textContent = T(Sound.on ? '声音 开' : '声音 关'); el.oSnd.classList.toggle('on', !!Sound.on); el.oSnd.setAttribute('aria-pressed', Sound.on ? 'true' : 'false');
    const fsOK = !U.hh && !!document.fullscreenEnabled && !!document.documentElement.requestFullscreen, full = !!document.fullscreenElement;
    el.oFs.hidden = !fsOK; el.oFs.classList.toggle('on', full); el.oFs.textContent = T(full ? '退出全屏' : '全屏');
    if (el.oLang) el.oLang.textContent = EN() ? '中文' : 'English';
    paintVariants();
  }
  // the language changed (the menu's own switch): the page's fixed words are I18N's; everything written from here is written again
  function relang() {
    for (const b of el.time.children) b.textContent = T(b.dataset.time === 'auto' ? '自动' : (TIMES.find(q => q[0] === b.dataset.time) || [, b.dataset.time])[1]);
    for (const b of el.kinds.children) b.textContent = T(SEG_NAMES[b.dataset.seg] || b.dataset.seg);
    evSig = vwSig = vSig = wxSig = null;
    U.layout();
    const run = U.state === 'run'; el.mk.textContent = T(run ? 'PAUSED · 暂停' : 'MENU · 菜单'); el.mGo.textContent = T(run ? '继续滑' : '出发');
    if (U.hintKind && el.hint.classList.contains('on') && !/gap|done/.test(U.hintKind)) showHint(U.hintKind);
    if (U.state === 'run' && U.segIdx >= 0) { try { const sg = Course.segs[U.segIdx]; if (sg) segCard({ idx: U.segIdx, type: sg.type }); } catch (e) { } }
    paint();
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

  // ---- the weather (Weather, where this build has it: its own levels, eased by itself), beside the hour; X steps through it
  const wxMod = () => { try { return typeof Weather !== 'undefined' && Weather && Array.isArray(Weather.levels) && Weather.levels.length && typeof Weather.set === 'function' ? Weather : null; } catch (e) { return null; } };
  U.setWeather = function (id) {
    const W = wxMod(); if (!W || !live()) return;
    if (id === 'auto') { if (W.setAuto) W.setAuto(true); paint(); say('天气', '自动'); return; }
    const l = W.levels.find(q => q[0] === id); if (!l) return;
    try { W.set(id); } catch (e) { console.warn(e); }
    paint(); say('天气', l[1]);
  };
  U.nextWeather = function (dir) { const W = wxMod(); if (!W) return; const L = W.levels, i = Math.max(0, L.findIndex(q => q[0] === W.level)); U.setWeather(L[(i + (dir || 1) + L.length) % L.length][0]); };

  // ---- the versions the owner picks between: their own page of the menu, not part of the game. One row for each choice in Variants, in
  // groups (a choice this list does not know yet goes under 新加的), the current version filled, the recommended one marked with a grain of
  // amber. A press switches at once (each module eases its own change); 恢复推荐 puts every choice back to the recommended version
  const VGROUP = [['镜头', ['cam', 'wood', 'shots', 'tips', 'fptuck', 'edge', 'chatter', 'buffet']], ['人物与动作', ['body', 'cloth', 'poles', 'motion']],
    ['画面', ['ghost', 'hi', 'nspray', 'nsky', 'cu']], ['雪', ['curtain', 'sparkle', 'clumps', 'lens', 'pdepth', 'drift']], ['场景与天气', ['rock', 'moon', 'snow', 'rtree', 'flag', 'sink', 'wind']], ['手感', ['keys']]];
  let vSig = null, wxSig = null;
  const varMod = () => { try { return typeof Variants !== 'undefined' && Variants && Array.isArray(Variants.defs) ? Variants : null; } catch (e) { return null; } };
  function initVariants() {
    el.vrows = $('sw-vrows'); el.vreset = $('sw-vreset'); el.wx = $('sw-wx'); el.wxc = $('sw-wxc');
    const V = varMod(); if (V && V.on) V.on(() => { if (U.open) paint(); });          // (a choice registered or changed elsewhere: shown at once)
    addEventListener('keydown', e => { if (e.code !== 'KeyX' || e.repeat || e.metaKey || e.ctrlKey || e.altKey || U.gone || !live()) return; U.nextWeather(e.shiftKey ? -1 : 1); });
  }
  function paintVariants() {
    const V = varMod(), defs = V ? V.defs : [];
    const sig = defs.map(d => [d.name, d.label, d.def].concat(d.opts.map(o => o[0] + ':' + o[1])).join('|')).join(';');
    if (sig !== vSig) {
      vSig = sig; el.vrows.textContent = '';
      const known = new Set(VGROUP.flatMap(g => g[1])), groups = VGROUP.map(([n, ids]) => [n, ids.map(id => defs.find(d => d.name === id)).filter(Boolean)]);
      groups.push(['新加的', defs.filter(d => !known.has(d.name))]);
      for (const [gn, ds] of groups) {
        if (!ds.length) continue;
        const g = document.createElement('div'), h = document.createElement('i'); g.className = 'vgrp'; h.textContent = T(gn); g.appendChild(h);
        for (const d of ds) {
          const row = document.createElement('div'), lab = document.createElement('span'); row.className = 'vrow'; lab.textContent = T(d.label); row.appendChild(lab);
          for (const [id, name] of d.opts) { const b = mkBtn(T(name), 'vn', d.name); b.dataset.vid = id; if (id === d.def) { b.classList.add('rec'); b.title = T('推荐'); } row.appendChild(b); }
          g.appendChild(row);
        }
        el.vrows.appendChild(g);
      }
      el.nav.querySelector('[data-sec="vers"]').hidden = !defs.length;
    }
    let all = true;
    for (const b of el.vrows.querySelectorAll('button')) { const on = !!V && V.val[b.dataset.vn] === b.dataset.vid; b.classList.toggle('on', on); if (on && !b.classList.contains('rec')) all = false; }
    el.vreset.classList.toggle('idle', all);
    const W = wxMod(), ls = W ? W.levels : [], ws = ls.map(l => l[0] + ':' + l[1]).join();
    if (ws !== wxSig) { wxSig = ws; el.wxc.textContent = ''; if (W && W.setAuto) el.wxc.appendChild(mkBtn(T('自动'), 'wx', 'auto')); for (const [id, name] of ls) el.wxc.appendChild(mkBtn(T(name), 'wx', id)); el.wx.hidden = !W; }
    if (W) for (const b of el.wxc.children) b.classList.toggle('on', W.auto ? b.dataset.wx === 'auto' : b.dataset.wx === W.level);
  }

  // ---- a change of place is a cut, and is shown as one: the picture dips to black, the skier is put there, the picture comes back.
  // (The black also covers the one long frame in which the snow of the new place is worked out.)
  function cutTo(fn) { if (cut || !el) return false; cut = { t: 0, stage: 0, n: 0, fn }; return true; }
  // after the skier has been put somewhere else: nothing of the old place comes along (and a run held by the menu pushes off afresh when it goes on)
  function settle() {
    try { if (Tracks.reset) Tracks.reset(); if (Spray.clear) Spray.clear(); } catch (e) { }
    try { const F = fauna(); if (F && F.reset) F.reset(); else if (Deer.herd) Deer.herd.length = 0; } catch (e) { }
    App.strides = null; App.lookYaw = null; U.segIdx = -1;
    if (hold) hold.moved = true;
    spSettle();
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
  // The change is App.swap's own single transition: its veil closes over the last picture, the new mountain is made behind it, and it lifts
  // on the skier at the gate, pushing off again by itself if a run was on (no dip of ours on top of it: that showed the held picture between
  // the two). What follows a change, however it came (the key, the menu, a link followed), is onMountain's: App.onMountain calls it
  U.newMountain = function (seed) {
    if (!live() || typeof App.newMountain !== 'function' || cut || App.swapping) return false;
    try { App.newMountain(seed); } catch (e) { console.warn(e); return false; }
    return true;
  };
  function onMountain(n) { settle(); reflect(n); say('山', '#' + n); if (U.open) paint(); }

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
  // ---- the views: picked by name in the menu, or stepped through (V, and the glyph over the jump)
  U.setView = function (id) { if (!live() || !Game.setView) return; try { Game.setView(id); } catch (e) { console.warn(e); } paint(); };
  U.nextView = function (dir) { if (!live() || !Game.nextView) return; try { Game.nextView(dir || 1); } catch (e) { console.warn(e); } paint(); say('视角', viewName()); };

  // ---- a run held, and taken up again. Held, nothing of the run steps (Game.mode 'hold': the skier, the clock of the day, the animals and
  // the counts all wait) while the picture is still drawn, so the menu's changes show behind it. The world is let go gently: at three
  // tenths of its speed, up to all of it over 0.8 s. That factor is the interface's own, App.resumeK, and scales the frame's time in the
  // loop; the slow motion of a jump (Game.timeScale) scales the same time again inside the step, so the two multiply. However the phone is
  // being held now is 'straight ahead' again. A skier put somewhere else meanwhile (a run, another mountain) pushes off from there
  function letGo() { for (const h of held) { h.id = null; h.drop = false; h.seen = true; h.set(false); } }
  function hush(level, tau) { try { if (Sound.rig && Sound.unlocked && Sound.ctx) Sound.rig.fade(level, Sound.ctx.currentTime, tau); } catch (e) { } }
  function holdOn() {
    if (hold || U.state !== 'run') return;
    hold = { moved: false }; U.paused = true; pausedAt = performance.now(); back = null; App.resumeK = 1;
    if (Game.mode === 'run') Game.mode = 'hold';
    letGo(); Input.drag = null; Input.keys = {}; gy.on = false; el.steer.classList.remove('on');
    hush(0, 0.05);          // (a time constant: all but gone in 0.15 s)
    el.day.classList.add('held');          // (the day card steps aside while the run is held; its clock stops with the run's, and it comes back for the rest)
  }
  function holdOff() {
    if (!hold) return; const moved = hold.moved; hold = null;
    U.paused = false; App.paused = false; U.t0 += performance.now() - pausedAt;
    if (App.swapping) App.swapping.run = true;          // (another mountain still being laid out pushes off once its veil lifts)
    else if (moved || Game.mode === 'title') launch();
    else if (Game.mode === 'hold') Game.mode = 'run';
    App.resumeK = 0.3; back = { t: 0 }; Input.zeroPending = true; Input.drag = null; Input.keys = {};
    el.day.classList.remove('held');
    hush(Sound.on ? Sound.level : 0, 0.12); U.keepAwake();
  }
  U.pause = function () { if (!el || U.state !== 'run' || U.gone) return false; if (!U.open) U.menu(true); return true; };
  U.resume = function () { if (!el || !U.open || U.gone) return false; U.menu(false); return true; };
  // back to the gate and the title page (the picture goes to black first; the menu's own clock times that)
  U.toTop = function () {
    if (!el || U.state !== 'run' || U.gone) return false;
    U.state = 'leaving';          // (neither a run nor the title until the black is down: no key does anything)
    hold = null; U.paused = false; U.open = false; el.menu.classList.remove('on'); el.menu.setAttribute('aria-hidden', 'true'); el.app.classList.remove('menuopen'); el.mn.setAttribute('aria-expanded', 'false');
    el.cut.classList.add('slow'); el.cut.style.opacity = 1; cut = { t: 0, stage: 9, n: 0, fn: null };
    setTimeout(() => {
      el.cut.classList.remove('slow');
      if (App.swapping) App.swapping.run = false;          // (another mountain still being laid out behind its veil must not set off down it under the title)
      try { Game.reset(); Game.mode = 'title'; } catch (e) { console.warn(e); }
      settle(); Input.drag = null; Input.keys = {}; U.state = 'title'; back = null; App.resumeK = 1; App.paused = false;
      el.app.classList.remove('run'); el.hud.classList.remove('on'); el.shade.classList.remove('run'); el.hint.classList.remove('on'); el.seg.classList.remove('on'); el.title.classList.add('on'); U.hintKind = null;
      el.day.classList.remove('held');
      cut = { t: 0, stage: 1, n: 0, fn: null }; hush(Sound.on ? Sound.level : 0, 0.4); paint();
    }, 300);
    return true;
  };
  // the picture itself is gone (the graphics device was taken away: the loop tells us). Nothing can be drawn again from here: say so, start over on a tap
  U.lost = function () {
    if (!el || U.gone) return; hold = null; if (U.open) U.menu(false); U.gone = true; U.paused = false; letGo(); hush(0, 0.05);
    el.pause.classList.add('lost', 'on'); el.pause.setAttribute('aria-hidden', 'false'); el.pauseS.textContent = T('画面断开了'); el.pauseT.textContent = T('点一下重新上山');
  };

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
    { const d = U.state === 'run' && !hold ? Input.drag : null;
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
