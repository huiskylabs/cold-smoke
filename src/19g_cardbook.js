// ---------------------------------------------------------------- 集卡: the album in the menu, and the moment a card is got
// 卡册 is a part of the menu like 滑过的山 (dev only while the trial runs, and there only with Variants 集卡 on). It knows the tables only
// through Cards: a new set or kind shows up here by itself.
//   Variants 卡册排法: a 按卡组 (one page a set: a mountain's views, the animals met, ...), b 按卡种 (one page a kind: every scenery card of
//   every mountain together, ...). The same cards either way.
// The moment of getting one: no stop, nothing over the whole screen. A small card slides in at the top right with its name, a two-note
// chime, gone in under three seconds. A new stamp on a card already held (another hour, another weather) says so the same way, quieter.
const CardBook = self.CardBook = (() => {
  const B = { open: false, page: null, detail: null };
  const L = (zh, en) => Cards.L(zh, en), $ = (t, c, s) => { const e = document.createElement(t); if (c) e.className = c; if (s != null) e.textContent = s; return e; };
  if (typeof Variants !== 'undefined') Variants.def('cardbook', '卡册排法', [['a', '按卡组'], ['b', '按卡种']], 'a');
  const CSS = `
#cb-toast { position: absolute; z-index: 30; top: calc(var(--gt, 16px) + 8px); right: calc(var(--xr, 0px) + 18px); display: flex; align-items: center; gap: 12px; padding: 8px 16px 8px 8px;
  border-radius: 12px; background: rgba(5, 8, 13, .55); box-shadow: inset 0 0 0 1px rgba(255, 208, 138, .35); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  opacity: 0; transform: translateX(24px); transition: opacity .35s ease, transform .45s cubic-bezier(.2, .7, .2, 1); pointer-events: none; }
#cb-toast.on { opacity: 1; transform: none; }
#cb-toast canvas { width: 42px; height: 56px; display: block; }
#cb-toast b { display: block; font-family: var(--f-lat); font-weight: 500; font-size: 10px; letter-spacing: .32em; color: var(--sun); }
#cb-toast span { display: block; margin-top: 3px; font-family: var(--f-song); font-size: 16px; letter-spacing: .18em; color: var(--snow); }
#app.menuopen #cb-toast { display: none; }
#menu section[data-sec="cards"] { max-width: none; }
#menu .cb-top { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }
#menu .cb-sum { font-family: var(--f-lat); font-size: 12px; letter-spacing: .2em; color: var(--sun); }
#menu .cb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(clamp(84px, 13vmin, 120px), 1fr)); gap: clamp(8px, 1.4vmin, 14px); max-width: 860px; }
#menu .cb-grid button { position: relative; padding: 0; background: none; border-radius: 9px; aspect-ratio: 3 / 4; }
#menu .cb-grid button canvas { width: 100%; height: 100%; display: block; border-radius: 9px; }
#menu .cb-grid button.new::after { content: ""; position: absolute; right: 6px; top: 6px; width: 7px; height: 7px; border-radius: 50%; background: var(--sun); box-shadow: 0 0 8px rgba(255, 208, 138, .9); }
#menu .cb-grid h5 { grid-column: 1 / -1; margin: 6px 0 -2px; font-family: var(--f-song); font-weight: 400; font-size: 14px; letter-spacing: .24em; color: var(--dim); }
#menu .cb-one { display: flex; gap: clamp(16px, 3vmin, 32px); align-items: flex-start; flex-wrap: wrap; }
#menu .cb-one canvas { width: clamp(200px, 42vmin, 300px); aspect-ratio: 3 / 4; display: block; border-radius: 12px; }
#menu .cb-one .cb-words { display: flex; flex-direction: column; gap: 10px; max-width: 340px; }
#menu .cb-one h3 { margin: 0; font-family: var(--f-song); font-weight: 300; font-size: 26px; letter-spacing: .3em; }
#menu .cb-dev { opacity: .75; }
`;
  let el = null, sec = null, nav = null, toast = null, toastQ = [], toastT = 0;
  const cache = new Map();          // a drawn card is kept until what it shows changes
  const group = () => (typeof Variants !== 'undefined' && Variants.val.cardbook === 'b') ? 'kind' : 'set';
  // what one card shows: the stamp to show is the latest got (or the one picked in the detail view)
  function view(c, pick) {
    const r = Cards.rec(c.id), owned = !!r, f = r ? r.f : {}, last = k => (f[k] && f[k].length ? f[k][f[k].length - 1] : null);
    const sib = Cards.list.filter(q => q.set === c.set && (!q.dev || Cards.dev));
    return { card: c, rec: r, owned, tod: (pick && pick.tod) || last('tod') || 'day', wx: (pick && pick.wx) || last('wx') || 'clear', aurora: !!(r && r.aurora), no: sib.indexOf(c) + 1, total: sib.length, seed: r ? r.seed : 0, hidden: !owned && c.hidden === 'secret' };
  }
  function paintCard(cv, c, w, pick) {
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.round(w * dpr), H = Math.round(w * 4 / 3 * dpr), v = view(c, pick);
    const key = [c.id, W, v.owned, v.tod, v.wx, v.rec ? v.rec.n + ':' + JSON.stringify(v.rec.f) : '', typeof I18N !== 'undefined' ? I18N.lang : ''].join('|');
    if (cv._key === key) return; cv._key = key; cv.width = W; cv.height = H;
    const hit = cache.get(key); const ctx = cv.getContext('2d');
    if (hit) { ctx.clearRect(0, 0, W, H); ctx.drawImage(hit, 0, 0); return; }
    CardArt.draw(ctx, W, H, v);
    try { const keep = document.createElement('canvas'); keep.width = W; keep.height = H; keep.getContext('2d').drawImage(cv, 0, 0); cache.set(key, keep); if (cache.size > 120) cache.delete(cache.keys().next().value); } catch (e) { }
  }

  // ---- the part of the menu
  function build() {
    const menu = document.getElementById('menu'); if (!menu) return false;
    const navEl = menu.querySelector('nav'), pane = document.getElementById('mpane'); if (!navEl || !pane) return false;
    { const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); }
    nav = $('button', null, '卡册'); nav.type = 'button'; nav.dataset.sec = 'cards';
    const before = navEl.querySelector('[data-sec="mt"]'); navEl.insertBefore(nav, before || null);
    sec = $('section'); sec.dataset.sec = 'cards'; pane.insertBefore(sec, pane.querySelector('section[data-sec="mt"]') || null);
    sec.addEventListener('click', onClick);
    toast = $('div'); toast.id = 'cb-toast'; toast.innerHTML = '<canvas></canvas><div><b></b><span></span></div>';
    (document.getElementById('app') || document.body).appendChild(toast);
    return true;
  }
  function onClick(e) {
    const b = e.target.closest('button'); if (!b || !sec.contains(b)) return; const d = b.dataset;
    e.stopPropagation();
    if (d.cbPage) { B.page = d.cbPage; B.detail = null; B.show(); }
    else if (d.cbCard) { B.detail = d.cbCard; B.pick = null; Cards.markSeen(d.cbCard); B.show(); }
    else if (d.cbBack != null) { B.detail = null; B.show(); }
    else if (d.cbTod) { B.pick = { tod: d.cbTod, wx: B.pick && B.pick.wx }; B.show(); }
    else if (d.cbDev) dev(d.cbDev);
    if (e.detail) b.blur();
  }
  // pages: one per set or per kind, in the order the tables were filled
  function pages() {
    const by = group(), out = [], seen = new Map();
    for (const c of Cards.list) {
      if (c.dev && !Cards.dev) continue;
      const k = by === 'kind' ? c.kind : c.set; if (!seen.has(k)) { const t = by === 'kind' ? Cards.kinds[k] : Cards.sets[k]; const p = { id: k, zh: t ? t.zh : k, en: t ? t.en : '', cards: [] }; seen.set(k, p); out.push(p); }
      seen.get(k).cards.push(c);
    }
    return out;
  }
  B.show = function () {
    if (!sec) return; sec.textContent = '';
    const all = Cards.list.filter(c => !c.dev || Cards.dev), got = all.filter(c => Cards.has(c.id)).length;
    const top = $('div', 'cb-top'); top.appendChild($('h4', null, L('CARDS · 卡册', 'CARDS'))); top.appendChild($('span', 'cb-sum', L('已收 ', '') + got + ' / ' + all.length + L('', ' collected'))); sec.appendChild(top);
    if (!Cards.live()) sec.appendChild($('p', 'note', L('集卡还在试做，在「版本对比」里把「集卡」打开才会收卡。', 'Card collecting is a trial: turn 集卡 on in Versions to collect.')));
    if (B.detail && Cards.cards[B.detail]) one(Cards.cards[B.detail]);
    else {
      const ps = pages(); if (!ps.find(p => p.id === B.page)) B.page = ps.length ? ps[0].id : null;
      const tabs = $('div', 'chips');
      for (const p of ps) { const n = p.cards.filter(c => Cards.has(c.id)).length, b = $('button', p.id === B.page ? 'on' : '', L(p.zh, p.en) + ' ' + n + '/' + p.cards.length); b.type = 'button'; b.dataset.cbPage = p.id; tabs.appendChild(b); }
      sec.appendChild(tabs);
      const p = ps.find(q => q.id === B.page);
      if (p) {
        const grid = $('div', 'cb-grid'); const w = Math.min(120, Math.max(84, innerHeight * 0.13));
        // (by kind, the cards stay under their own set's name)
        let lastSet = null;
        for (const c of p.cards) {
          if (group() === 'kind' && c.set !== lastSet) { lastSet = c.set; const s = Cards.sets[c.set]; grid.appendChild($('h5', null, s ? L(s.zh, s.en) : c.set)); }
          const b = $('button', Cards.has(c.id) && !Cards.record().seen[c.id] ? 'new' : ''); b.type = 'button'; b.dataset.cbCard = c.id; b.setAttribute('aria-label', Cards.has(c.id) ? L(c.zh, c.en) : L('还没收到', 'Not yet'));
          const cv = document.createElement('canvas'); b.appendChild(cv); grid.appendChild(b); paintCard(cv, c, w);
        }
        sec.appendChild(grid);
      }
    }
    if (Cards.dev) devRow();
    if (nav) nav.textContent = L('卡册', 'Cards') + (Cards.unseen() ? ' ·' : '');
  };
  function one(c) {
    const box = $('div', 'cb-one'), cv = document.createElement('canvas'); box.appendChild(cv); paintCard(cv, c, 300, B.pick);
    const w = $('div', 'cb-words'), r = Cards.rec(c.id);
    w.appendChild($('h3', null, r || c.hidden !== 'secret' ? L(c.zh, c.en) : '？'));
    const k = Cards.kinds[c.kind], s = Cards.sets[c.set];
    w.appendChild($('p', 'note', [s && L(s.zh, s.en), k && L(k.zh, k.en)].filter(Boolean).join(' · ')));
    if (r) {
      if (c.fact) w.appendChild($('p', 'note', L(c.fact.zh || c.fact, c.fact.en)));
      const d = new Date(r.t); w.appendChild($('p', 'note', L('第一次收到：', 'First got: ') + d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate() + (r.n > 1 ? L('，一共收到 ' + r.n + ' 次', ', ' + r.n + ' times in all') : '')));
      // the stamps: each value got can be looked at (the card drawn under that hour)
      for (const st of Cards.stamps(c, r)) {
        const F = Cards.facets[st.facet], row = $('div', 'chips');
        row.appendChild($('span', 'note', L(F.zh, F.en) + '　'));
        for (const [v, zh, en, has] of st.values) { const b = $('button', (B.pick && B.pick[st.facet] === v) ? 'on' : '', L(zh, en) + (has ? '' : ' ·')); b.type = 'button'; b.disabled = !has; if (!has) b.style.opacity = '.4'; if (st.facet === 'tod') b.dataset.cbTod = v; row.appendChild(b); }
        w.appendChild(row);
      }
      if ((c.facets || []).length) w.appendChild($('p', 'note', Cards.full(c) ? L('每一种都收齐了，卡框变成双线。', 'Every stamp: the frame is doubled.') : L('换个时刻、换种天气再来，可以给这张卡盖上新的印记。', 'Come back at another hour or in other weather for a new stamp.')));
    } else if (c.hint && c.hidden !== 'secret') w.appendChild($('p', 'note', L('线索：', 'Hint: ') + L(c.hint.zh || c.hint, c.hint.en)));
    const back = $('button', 'pill', L('← 回卡册', '← Back')); back.type = 'button'; back.dataset.cbBack = '1'; w.appendChild(back);
    box.appendChild(w); sec.appendChild(box);
  }
  // (dev: the sources the other trials will send, sent by hand; everything got or nothing)
  const DEV_EV = [['animal.seen', { id: 'fox' }, '遇见狐狸'], ['fox.den', { den: 'a' }, '狐狸带到窝'], ['ring.line', { line: 'speed', full: true }, '速降线全串'], ['ring.line', { line: 'woods', full: true }, '钻林线全串'], ['ring.secret', { id: 's1' }, '秘境圈']];
  function devRow() {
    const row = $('div', 'chips cb-dev');
    const add = (k, t) => { const b = $('button', null, t); b.type = 'button'; b.dataset.cbDev = k; row.appendChild(b); };
    DEV_EV.forEach((q, i) => add('ev' + i, '模拟：' + q[2]));
    add('all', '全部收下'); add('reset', '清空卡册');
    sec.appendChild($('p', 'note', 'DEV · 模拟各玩法发来的事件（要先把集卡打开）'));
    sec.appendChild(row);
  }
  function dev(k) {
    if (k === 'all') { for (const c of Cards.list) Cards.grant(c.id, 'dev'); }
    else if (k === 'reset') Cards.reset();
    else if (/^ev\d+$/.test(k)) { const q = DEV_EV[+k.slice(2)]; if (q) Cards.emit(q[0], q[1]); }
    B.show();
  }

  // ---- the moment
  function chime(stamp) {
    try {
      if (typeof Sound === 'undefined' || !Sound.on || !Sound.ctx || !Sound.unlocked) return;
      const ac = Sound.ctx, t = ac.currentTime + 0.02, out = ac.createGain(); out.gain.value = stamp ? 0.05 : 0.08; out.connect(ac.destination);
      for (const [f, dt] of stamp ? [[1318.5, 0]] : [[987.8, 0], [1318.5, 0.14]]) {
        const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(out);
        g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(1, t + dt + 0.006); g.gain.exponentialRampToValueAtTime(0.0008, t + dt + 1.4); o.start(t + dt); o.stop(t + dt + 1.5);
      }
    } catch (e) { }
  }
  function say(m) {
    if (!toast) return; toastQ.push(m); if (toastT > 0) return; next();
  }
  function next() {
    const m = toastQ.shift(); if (!m) { toast.classList.remove('on'); return; }
    const c = m.card, cv = toast.querySelector('canvas');
    toast.querySelector('b').textContent = m.type === 'got' ? L('收到卡片', 'NEW CARD') : L('新的印记', 'NEW STAMP');
    let extra = ''; if (m.type === 'stamp') { const F = Cards.facets[m.facet], q = F && F.values.find(x => x[0] === m.value); if (q) extra = ' · ' + L(q[1], q[2]); }
    toast.querySelector('span').textContent = L(c.zh, c.en) + extra;
    cv._key = null; paintCard(cv, c, 42);
    toast.classList.add('on'); toastT = 2.8; chime(m.type === 'stamp');
  }
  B.frame = function (dt) { if (toastT > 0 && (toastT -= dt) <= 0) { toast.classList.remove('on'); setTimeout(() => { if (toastT <= 0) next(); }, 400); } };

  B.init = function () {
    if (!Cards.dev || !build()) return;
    const sync = () => { if (nav) nav.hidden = !Cards.live(); };
    sync(); if (typeof Variants !== 'undefined') Variants.on(n => { if (n === 'cards') sync(); if (n === 'cardbook' && sec && sec.classList.contains('on')) { B.page = null; B.show(); } });
    if (typeof I18N !== 'undefined') I18N.on(() => { if (sec && sec.classList.contains('on')) B.show(); else if (nav) nav.textContent = L('卡册', 'Cards'); });
    Cards.listen(m => { if (m.type === 'got' || m.type === 'stamp') { say(m); if (sec && sec.classList.contains('on')) B.show(); } });
    if (typeof App !== 'undefined') App.onTick.push((dt) => B.frame(App.dtReal || dt));
    nav.textContent = L('卡册', 'Cards');
  };
  Cards.onStart(() => B.init());
  return B;
})();
