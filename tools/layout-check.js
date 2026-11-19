// (用户 2026-11-19 19:29 UTC，iPhone 横屏截图：「画面 responsive 完全一塌糊涂…挤在一起被 crop out」「连点开始挑战的开始都点不到」「整体排查一遍所有尺寸」)
// Every panel of the game, laid out at the sizes of the phones and screens it runs on, measured (no pictures): each piece of text and each
// button must lie inside the frame's safe area (notch, home bar, and in 小红书 the host's own buttons), must not be cut off by the panel it
// sits in, must not have its words run out of its box, and a button must be the thing a finger at its middle actually lands on.
// Phones are checked both ways the game meets them: held sideways, and held upright with the game turning the picture itself (#app.rot),
// inside 小红书 (the host's buttons along the top of the screen) and outside it.
//   node tools/layout-check.js [out.json] [only=<regex on the names>] [html]     exit 1 when anything is wrong
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const out = path.resolve(process.argv[2] || 'layout-check.json'), only = (process.argv.find(a => a.startsWith('only=')) || '').slice(5);
const html = path.resolve(process.argv.find(a => a.endsWith('.html')) || path.join(__dirname, '../dist/dev.html'));

// screens in CSS px as the browser reports them, safe insets in the screen's own sides (as env(safe-area-inset-*) gives them)
const PH = [
  ['iPhone mini', 375, 812, 50, 21], ['iPhone 15', 393, 852, 59, 21], ['iPhone 15 Pro Max', 430, 932, 59, 21],
  ['Android 412', 412, 915, 26, 0], ['Android 360', 360, 800, 24, 0], ['iPhone SE-like 375x667', 375, 667, 0, 0],
];
const CFG = [];
for (const [n, w, h, notch, home] of PH) {
  for (const xhs of [true, false]) {
    // sideways: the notch on the left (and the right edge kept clear too, the phone can be turned either way), the home bar at the bottom
    CFG.push({ name: n + ' 横拿' + (xhs ? ' 小红书' : ''), vw: h, vh: w, touch: true, safe: { l: notch, r: notch, t: 0, b: home }, xhs });
    // upright, the game turning the picture: the notch at the top of the screen, the home bar at the bottom
    CFG.push({ name: n + ' 竖拿' + (xhs ? ' 小红书' : ''), vw: w, vh: h, touch: true, safe: { l: 0, r: 0, t: notch ? notch - 3 : 24, b: notch ? 34 : 0 }, xhs });
  }
}
for (const [w, h] of [[1024, 640], [1280, 720], [1366, 768], [1440, 900], [1920, 1080]]) CFG.push({ name: '桌面 ' + w + 'x' + h, vw: w, vh: h, touch: false, safe: { l: 0, r: 0, t: 0, b: 0 }, xhs: false });
const EN = new Set(['iPhone mini 竖拿 小红书', 'iPhone mini 横拿 小红书', 'Android 360 横拿', '桌面 1280x720']);

(async () => {
  const b = await chromium.launch({ headless: true });
  const all = {}; let bad = 0;
  for (const c of CFG) for (const loc of EN.has(c.name) ? ['zh-CN', 'en-US'] : ['zh-CN']) {
    const name = c.name + (loc === 'en-US' ? ' EN' : '');
    if (only && !new RegExp(only).test(name)) continue;
    const ctx = await b.newContext({ viewport: { width: c.vw, height: c.vh }, isMobile: c.touch, hasTouch: c.touch, locale: loc, deviceScaleFactor: 1 });
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(([c, loc]) => {
      localStorage.setItem('coldsmoke.lang', loc.startsWith('en') ? 'en' : 'zh');
      // the safe insets: env() cannot be set from a page, so the frame's own variables are, the way the template maps them (turned or not)
      const s = c.safe, rot = c.touch && c.vh > c.vw * 1.04;
      const f = rot ? { l: s.t, r: s.b, t: s.r, b: s.l } : s;
      const st = document.createElement('style');
      st.textContent = '#app,#app.rot,#app.rot.flip{--sl:' + f.l + 'px!important;--sr:' + f.r + 'px!important;--st:' + f.t + 'px!important;--sb:' + f.b + 'px!important}';
      document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st));
      if (c.xhs) {
        // the host's three buttons in a row along the top of the screen (back on the left; 我 and share on the right), as on the owner's phone
        const top = s.t + 10, sz = 34, W = c.vw;
        const mb = { back: { left: 12 + s.l, top, width: sz, height: sz }, me: { left: W - 12 - s.r - sz * 2 - 10, top, width: sz, height: sz }, share: { left: W - 12 - s.r - sz, top, width: sz, height: sz } };
        for (const k in mb) { mb[k].right = mb[k].left + mb[k].width; mb[k].bottom = mb[k].top + mb[k].height; }
        window.__hostButtons = mb;
        const L = { list: [{ rank: 1, nickname: '演示数据一个很长的名字', score: 5800 }, { rank: 2, nickname: 'B', score: 5790 }] };
        window.xhs = { miniTool: { submitScore: async () => ({}), getRankList: async () => L, getMyRank: async () => ({ status: 'EXACT', rank: 2, score: 5790 }), getWindowInfo: async () => ({ menuButtons: mb }) } };
      }
      window.__touch = c.touch; window.__TOUCH = +(c.TOUCH || 44);
      // (the picture itself is not looked at: drawn ten times a second instead of sixty, so many screens can be measured side by side on a CPU)
      const raf = window.requestAnimationFrame.bind(window); let last = 0;
      window.requestAnimationFrame = f => raf(function step(t) { if (window.__slow && t - last < 95) return raf(step); last = t; f(t); });          // (only once the title is up: the start builds the mountain frame by frame)
    }, [c, loc]);
    await pg.goto('file://' + html);          // (as players get it: no dev buttons)
    await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
    await pg.evaluate(() => { window.__slow = true; });
    await pg.waitForTimeout(3500);          // (the title's words come up one after another over 2 s)
    // one look at whatever is on the screen now
    const look = scene => pg.evaluate(scene => {
      const app = document.getElementById('app'), cs = getComputedStyle(app), px = v => parseFloat(cs.getPropertyValue(v)) || 0;
      // the frame's own axes, from three marks at its corners (it may be turned a quarter)
      const pr = ['left:0;top:0', 'left:100%;top:0', 'left:0;top:100%'].map(css => { const p = document.createElement('i'); p.style.cssText = 'position:absolute;width:0;height:0;' + css; app.appendChild(p); const r = p.getBoundingClientRect(); p.remove(); return [r.left, r.top]; });
      const ex = [pr[1][0] - pr[0][0], pr[1][1] - pr[0][1]], ey = [pr[2][0] - pr[0][0], pr[2][1] - pr[0][1]], W = Math.hypot(...ex), H = Math.hypot(...ey);
      const uv = (x, y) => [((x - pr[0][0]) * ex[0] + (y - pr[0][1]) * ex[1]) / W, ((x - pr[0][0]) * ey[0] + (y - pr[0][1]) * ey[1]) / H];
      const box = r => { const a = uv(r.left, r.top), b2 = uv(r.right, r.bottom); return { l: Math.min(a[0], b2[0]), r: Math.max(a[0], b2[0]), t: Math.min(a[1], b2[1]), b: Math.max(a[1], b2[1]) }; };
      const safe = { l: px('--sl'), r: W - px('--sr'), t: px('--st'), b: H - px('--sb') };
      const host = window.__hostButtons ? Object.values(window.__hostButtons).map(box) : [];
      const vis = e => { for (let q = e; q && q !== document.body; q = q.parentElement) { const s = getComputedStyle(q); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; } return true; };
      const leaf = e => e.tagName === 'BUTTON' || [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      const nm = e => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : '')) + ' "' + (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24) + '"';
      const where = e => { const p = []; for (let q = e.parentElement; q && q !== app && p.length < 3; q = q.parentElement) if (q.id) p.push('#' + q.id); return p.reverse().join(' '); };
      const probs = [], under = new Set();
      if (!document.querySelector('meta[name=viewport]')) probs.push({ k: '页面没有 viewport（手机会按 980 px 宽排版再整页缩小）', id: document.title });
      // (a panel over the whole frame, like the route card: what lies under it is out of play until it closes, not a fault)
      const modal = (e, hit) => { for (let q = hit; q && q !== app; q = q.parentElement) { if (q.contains(e)) return false; const Q = box(q.getBoundingClientRect()); if ((Q.r - Q.l) * (Q.b - Q.t) > W * H * 0.85) return true; } return false; };
      const sticky = e => { for (let q = e; q && q !== app; q = q.parentElement) if (getComputedStyle(q).position === 'sticky') return q; return null; };
      for (const e of app.querySelectorAll('*')) {
        if (!leaf(e) || !vis(e)) continue;
        if (e.closest('#view,#veil,#shade,.dev-only,svg,kbd')) continue;
        const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
        { const h0 = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2); if (h0 && h0 !== e && !e.contains(h0) && !h0.contains(e) && modal(e, h0)) { under.add(e); continue; } }
        const B = box(r), id = where(e) + ' ' + nm(e), btn = e.tagName === 'BUTTON';
        // cut off by a box it is in (one that does not scroll)
        let clip = null, scroller = null;
        for (let q = e.parentElement; q && q !== app; q = q.parentElement) {
          const s = getComputedStyle(q); if (s.overflow === 'visible' && s.overflowX === 'visible' && s.overflowY === 'visible') continue;
          const Q = box(q.getBoundingClientRect());
          if (B.l < Q.l - 1 || B.r > Q.r + 1 || B.t < Q.t - 1 || B.b > Q.b + 1) { if (/auto|scroll/.test(s.overflowY + s.overflowX)) scroller = scroller || q; else { clip = q; break; } }
          else if (/auto|scroll/.test(s.overflowY + s.overflowX) && (q.scrollHeight > q.clientHeight + 1 || q.scrollWidth > q.clientWidth + 1)) scroller = scroller || q;          // (a list that scrolls: what lies at its ends at rest is reached by scrolling)
        }
        if (clip) { probs.push({ k: '被裁掉', id, by: nm(clip) }); continue; }
        if (scroller) continue;          // (inside a box that scrolls: reachable)
        if (B.r < 0 || B.l > W || B.b < 0 || B.t > H) { let moved = false; for (let q = e; q && q !== app; q = q.parentElement) if (getComputedStyle(q).transform !== 'none') { moved = true; break; } if (moved) continue; }          // (slid away on purpose; anything else out there was pushed out)
        // a finger needs room: on a phone every button at least TOUCH px (44, as Apple asks) on its short side
        if (btn && window.__touch && Math.min(B.r - B.l, B.b - B.t) < window.__TOUCH - 0.5 && getComputedStyle(e).pointerEvents !== 'none') probs.push({ k: '按钮太小', id, box: [Math.round(B.r - B.l), Math.round(B.b - B.t)] });
        if (B.l < safe.l - 1 || B.r > safe.r + 1 || B.t < safe.t - 1 || B.b > safe.b + 1) probs.push({ k: B.l < -1 || B.r > W + 1 || B.t < -1 || B.b > H + 1 ? '出画面' : '进了刘海/底条', id, box: [B.l, B.t, B.r, B.b].map(Math.round) });
        for (const h of host) if (B.l < h.r && B.r > h.l && B.t < h.b && B.b > h.t) probs.push({ k: '压在小红书按钮下', id });
        // words running out of their own box
        const s = getComputedStyle(e);
        if ((s.overflow !== 'visible' || s.textOverflow === 'ellipsis') && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 2)) probs.push({ k: '字出框', id });
        // a finger at the middle of a button lands on it (and not on a panel lying over it)
        if (btn && s.pointerEvents !== 'none') {
          const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, hit = document.elementFromPoint(cx, cy);
          if (hit && hit !== e && !e.contains(hit) && !hit.contains(e)) probs.push({ k: '点不到（被盖住）', id, by: nm(hit) });
        }
      }
      // two pieces of text lying over each other (each one's text, not their panels)
      const T = []; for (const e of app.querySelectorAll('*')) { if (!leaf(e) || !vis(e) || under.has(e) || e.closest('#view,#veil,#shade,.dev-only,svg,kbd')) continue; const r = e.getBoundingClientRect(); if (!(r.width > 1 && r.height > 1)) continue;
        // (only the part that shows: a row that scrolls sideways hides what lies past its ends)
        const B = box(r); for (let q = e.parentElement; q && q !== app; q = q.parentElement) { const st2 = getComputedStyle(q); if (st2.overflowX === 'visible' && st2.overflowY === 'visible') continue; const Q = box(q.getBoundingClientRect()); B.l = Math.max(B.l, Q.l); B.r = Math.min(B.r, Q.r); B.t = Math.max(B.t, Q.t); B.b = Math.min(B.b, Q.b); }
        if (B.r - B.l > 1 && B.b - B.t > 1) T.push([e, B]); }
      for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
        const [a, A] = T[i], [c2, C] = T[j]; if (a.contains(c2) || c2.contains(a)) continue;
        { const sa = sticky(a), sc = sticky(c2); if ((sa || sc) && sa !== sc) continue; }          // (buttons pinned to the bottom of a card that scrolls under them)
        const ix = Math.min(A.r, C.r) - Math.max(A.l, C.l), iy = Math.min(A.b, C.b) - Math.max(A.t, C.t); if (ix < 3 || iy < 3) continue;
        const sm = Math.min((A.r - A.l) * (A.b - A.t), (C.r - C.l) * (C.b - C.t)); if (ix * iy > sm * 0.15) probs.push({ k: '叠在一起', id: where(a) + ' ' + nm(a), by: where(c2) + ' ' + nm(c2) });
      }
      return { scene, W: Math.round(W), H: Math.round(H), rot: app.classList.contains('rot'), probs };
    }, scene);
    const res = [];
    const R = (s, f) => res.push(s);
    res.push(await look('标题页'));
    await pg.evaluate(() => __rings.pickOpen(true)); await pg.waitForTimeout(1500); res.push(await look('挑战面板'));
    await pg.evaluate(() => __rings.pickOpen(false)); await pg.waitForTimeout(500);
    const secs = await pg.evaluate(() => [...document.querySelectorAll('#menu nav [data-sec]')].filter(b => !b.hidden && !b.classList.contains('dev-only')).map(b => b.dataset.sec));
    for (const sec of secs) {
      await pg.evaluate(sec => { const U = __ski.ui(); if (!U.open) U.menu(true); document.querySelector('#menu nav [data-sec="' + sec + '"]').click(); }, sec); await pg.waitForTimeout(sec === 'rank' ? 1500 : 900);
      res.push(await look('菜单 · ' + sec));
      if (sec === 'rank') for (const v of await pg.evaluate(() => [...document.querySelectorAll('#menu section[data-sec="rank"] [data-rv]')].map(x => x.dataset.rv))) {
        await pg.evaluate(v => document.querySelector('#menu section[data-sec="rank"] [data-rv="' + v + '"]').click(), v); await pg.waitForTimeout(900); res.push(await look('菜单 · rank · ' + v));
      }
    }
    await pg.evaluate(() => __ski.ui().menu(false)); await pg.waitForTimeout(500);
    // a challenge run: the screen while skiing, the result card, the route card, the replay
    await pg.evaluate(() => { const V = __ski.m.Variants; V.set('ringdiff', 'b'); V.set('rline', 'a'); __rings.chal = true; __ski.ui().go(); });
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 240000 }); res.push(await look('倒数'));
    await pg.evaluate(async () => { __rings.line.cT = 99; for (let i = 0; i < 400 && __rings.line.st !== 'go'; i++) { __rings.frame(); await new Promise(r => setTimeout(r, 30)); } });          // (the frame that turns the count into go, called here: a page whose drawing waits must not hold the check up)
    await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 60000 });
    await pg.evaluate(() => { for (let i = 0; i < 8; i++) { __ski.sim(0.5, () => 0.15 * Math.sin(i), { draw: false }); __rings.frame(); } }); res.push(await look('挑战中'));
    if (c.touch) { await pg.evaluate(() => document.getElementById('app').classList.add('tiltfa')); await pg.waitForTimeout(300); res.push(await look('挑战中 · 倾斜转弯（▲▼）')); await pg.evaluate(() => document.getElementById('app').classList.remove('tiltfa')); }
    await pg.evaluate(() => __ski.ui().pause()); await pg.waitForTimeout(900); res.push(await look('暂停菜单'));
    await pg.evaluate(() => __ski.ui().menu(false)); await pg.waitForTimeout(300);
    await pg.evaluate(() => { __rings.finishNow(); }); await pg.waitForTimeout(3200);          // (the card slides in after 0.35 s, over 0.6 s; headless pages run their timers late) res.push(await look('成绩卡'));
    const cbs = await pg.evaluate(() => [...document.querySelectorAll('#rline [data-cb]')].map(x => x.textContent));
    for (let i = 0; i < cbs.length; i++) {
      await pg.evaluate(i => document.querySelectorAll('#rline [data-cb]')[i].click(), i); await pg.waitForTimeout(1500);
      res.push(await look('成绩卡 → ' + cbs[i].replace(/[A-Z⏎]+$/, '')));
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(800);
      await pg.evaluate(() => { const r = document.getElementById('replay'); if (r && __ski.m.Replay && __ski.m.Replay.stop) __ski.m.Replay.stop(); });
      await pg.waitForTimeout(500);
    }
    const n = res.reduce((a, s) => a + s.probs.length, 0); bad += n;
    all[name] = { errs, scenes: res };
    console.log((n ? '✗ ' : '✓ ') + name + '  ' + res.map(s => s.scene + (s.probs.length ? '(' + s.probs.length + ')' : '')).join(' · ') + (errs.length ? '  页面报错: ' + errs.join(' | ') : ''));
    for (const s of res) for (const p of s.probs) console.log('    ' + s.scene + ' · ' + p.k + ' · ' + p.id + (p.by ? ' ← ' + p.by : '') + (p.box ? ' ' + p.box : ''));
    await ctx.close();
  }
  fs.writeFileSync(out, JSON.stringify(all, null, 1)); console.log(bad ? '问题 ' + bad + ' 处' : '全部通过');
  await b.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
