// 菜单方案 B（2026-11-22）做出来以后的真实截图 + 几个排版量数：首页、挑战面板带榜、滑雪中、暂停菜单、设置页、成绩卡、菜单里的排行榜。
// Headless only: never opens a window.
//   node tools/menu-b-shots.js <out dir> [html] [only=<regex on config ids>]
const PW = require('playwright'), chromium = PW[process.env.ENGINE || 'chromium'];
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || 'menu-b');
const html = path.resolve(process.argv.find(a => a.endsWith('.html')) || path.join(__dirname, '../dist/dev.html'));
const only = (process.argv.find(a => a.startsWith('only=')) || '').slice(5);
const CFG = [
  { id: 'desk', name: '桌面 1280x720 网页', vw: 1280, vh: 720, touch: false, safe: { l: 0, r: 0, t: 0, b: 0 }, xhs: false },
  { id: 'deskx', name: '桌面 1280x720 小红书', vw: 1280, vh: 720, touch: false, safe: { l: 0, r: 0, t: 0, b: 0 }, xhs: true },
  { id: 'ip15', name: 'iPhone 15 横拿 小红书', vw: 852, vh: 393, touch: true, safe: { l: 59, r: 59, t: 0, b: 21 }, xhs: true },
  { id: 'se', name: 'iPhone SE 横拿 小红书', vw: 667, vh: 375, touch: true, safe: { l: 0, r: 0, t: 0, b: 0 }, xhs: true },
  { id: 'ip15w', name: 'iPhone 15 横拿 网页', vw: 852, vh: 393, touch: true, safe: { l: 59, r: 59, t: 0, b: 21 }, xhs: false },
];
fs.mkdirSync(dir, { recursive: true });
const metrics = {};
(async () => {
  const b = await chromium.launch({ headless: true });
  for (const c of CFG) {
    if (only && !new RegExp(only).test(c.id)) continue;
    const ctx = await b.newContext({ viewport: { width: c.vw, height: c.vh }, isMobile: c.touch, hasTouch: c.touch, locale: 'zh-CN', deviceScaleFactor: 2 });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.addInitScript(c => {
      localStorage.setItem('coldsmoke.lang', 'zh');
      localStorage.setItem('coldsmoke.line2.a.b', JSON.stringify({ best: { score: 101.08 } }));          // (a best of this device, so the web card has something to show)
      const s = c.safe, st = document.createElement('style');
      st.textContent = '#app{--sl:' + s.l + 'px!important;--sr:' + s.r + 'px!important;--st:' + s.t + 'px!important;--sb:' + s.b + 'px!important}';
      document.addEventListener('DOMContentLoaded', () => {
        document.head.appendChild(st);
        const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999';
        const add = css => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;' + css; o.appendChild(d); };
        if (s.l) add('top:0;bottom:0;left:0;width:' + s.l + 'px;background:rgba(0,0,0,.35)');
        if (s.r) add('top:0;bottom:0;right:0;width:' + s.r + 'px;background:rgba(0,0,0,.35)');
        for (const k in (window.__hostButtons || {})) { const m = window.__hostButtons[k]; add('left:' + m.left + 'px;top:' + m.top + 'px;width:' + m.width + 'px;height:' + m.height + 'px;border-radius:50%;background:rgba(0,0,0,.55);box-shadow:0 0 0 1.5px #fff'); }
        document.body.appendChild(o);
      });
      if (c.xhs) {
        const top = s.t + 10, sz = 34, W = c.vw;
        const mb = { back: { left: 12 + s.l, top, width: sz, height: sz }, me: { left: W - 12 - s.r - sz * 2 - 10, top, width: sz, height: sz }, share: { left: W - 12 - s.r - sz, top, width: sz, height: sz } };
        for (const k in mb) { mb[k].right = mb[k].left + mb[k].width; mb[k].bottom = mb[k].top + mb[k].height; }
        window.__hostButtons = mb;
        const names = ['雪友A', '雪友B', '雪友C', '雪友D', '雪友E', '雪友F', '雪友G', '雪友H', '雪友I', '雪友J', '雪友K'];
        const L = { data: names.map((n, i) => ({ rank: i + 1, nickname: n + '（演示数据）', score: 6000 - (92.4 + i * 0.8) })) };
        window.xhs = { miniTool: { submitScore: async () => ({}), getRankList: async () => L, getMyRank: async () => ({ status: 'EXACT', rank: 12, score: 6000 - 101.08 }), getWindowInfo: async () => ({ menuButtons: mb }), getStorage: async () => ({ data: null }), setStorage: async () => ({}), postNote: async () => ({}), writeTempFile: async () => ({}) } };
      }
    }, c);
    await pg.goto('file://' + html);
    await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
    await pg.waitForTimeout(5500);
    const shot = async n => { await pg.screenshot({ path: path.join(dir, c.id + '_' + n + '.png') }); console.log('shot', c.id, n); };
    const box = s => pg.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetParent && getComputedStyle(e).position !== 'fixed') return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }; }, s);
    const m = metrics[c.id] = { name: c.name };
    m.titleButtons = await pg.evaluate(() => [...document.querySelectorAll('#title .act button')].filter(b => b.offsetParent).map(b => { const q = b.getBoundingClientRect(); return { t: b.textContent.trim(), x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) }; }));
    m.act = await box('#title .act'); m.tease = await box('#tease.on'); m.how = await box('#title .how'); m.fine = await box('#title .fine'); m.mark = await box('#title .mark');
    const hit = (a, z) => !!(a && z && a.l < z.r && z.l < a.r && a.t < z.b && z.t < a.b);
    m.overlap = { teaseAct: hit(m.tease, m.act), teaseMark: hit(m.tease, m.mark), howFine: hit(m.how, m.fine) };
    await shot('1首页');
    const rk = await pg.evaluate(() => { const b = document.getElementById('t-rank'); if (b && !b.hidden) { b.click(); return true; } __rings.pickOpen(true); return false; });
    m.rankButtonOnTitle = rk;
    await pg.waitForTimeout(1600); m.picker = await box('#rpick'); await shot('2挑战面板带榜');
    await pg.evaluate(() => __rings.pickOpen(false)); await pg.waitForTimeout(600);
    await pg.evaluate(() => __ski.ui().menu('opt')); await pg.waitForTimeout(1000); await shot('3首页设置');
    await pg.evaluate(() => document.querySelector('#menu [data-gosec="keys"]').click()); await pg.waitForTimeout(800); await shot('3b设置里的操作说明');
    await pg.evaluate(() => __ski.ui().menu(false)); await pg.waitForTimeout(800);
    // free skiing, then the pause menu
    await pg.evaluate(() => __ski.ui().go());
    await pg.waitForFunction(() => __ski.ui().state === 'run', null, { timeout: 240000 });
    await pg.waitForTimeout(2500);
    await pg.evaluate(() => { for (let i = 0; i < 6; i++) __ski.sim(0.5, () => 0.2 * Math.sin(i), { draw: i === 5 }); });
    await pg.evaluate(() => __ski.ui().menu('view')); await pg.waitForTimeout(1200);
    m.runMenu = await pg.evaluate(() => { const n = document.querySelector('#menu nav'); return { navH: n.clientHeight, navScroll: n.scrollHeight, fits: n.scrollHeight <= n.clientHeight + 1, items: [...n.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.textContent.trim()) }; });
    await shot('4暂停菜单');
    if (c.xhs) { await pg.evaluate(() => document.querySelector('#menu nav [data-sec="rank"]').click()); await pg.waitForTimeout(1500); await shot('5菜单里的排行榜'); }
    await pg.evaluate(() => __ski.ui().menu(false)); await pg.waitForTimeout(800);
    // a challenge line: its menu says 重来这条线; the result card has 看排行榜
    await pg.evaluate(() => { __ski.ui().toTop(); });
    await pg.waitForFunction(() => __ski.ui().state === 'title', null, { timeout: 60000 }); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { const V = __ski.m.Variants; V.set('ringdiff', 'b'); V.set('rline', 'a'); __rings.chal = true; __ski.ui().go(); });
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 240000 });
    await pg.evaluate(async () => { __rings.line.cT = 99; for (let i = 0; i < 400 && __rings.line.st !== 'go'; i++) { __rings.frame(); await new Promise(r => setTimeout(r, 30)); } });
    await pg.evaluate(() => { for (let i = 0; i < 8; i++) { __ski.sim(0.5, () => 0.15 * Math.sin(i), { draw: i === 7 }); __rings.frame(); } });
    await pg.evaluate(() => __ski.ui().menu(true)); await pg.waitForTimeout(1200);
    m.chalMenu = await pg.evaluate(() => { const n = document.querySelector('#menu nav'); return { fits: n.scrollHeight <= n.clientHeight + 1, items: [...n.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.textContent.trim()) }; });
    await shot('6挑战中暂停菜单');
    await pg.evaluate(() => __ski.ui().menu(false)); await pg.waitForTimeout(600);
    await pg.evaluate(() => __rings.finishNow()); await pg.waitForTimeout(7000);
    m.card = await pg.evaluate(() => [...document.querySelectorAll('#rline .card button')].map(b => b.textContent.trim()));
    await shot('7成绩卡');
    const hasB = await pg.evaluate(() => { const b = document.querySelector('#rline .card [data-a="board"]'); if (b) b.click(); return !!b; });
    if (hasB) { await pg.waitForTimeout(1500); await shot('8成绩卡点看排行榜'); }
    m.errors = errs.slice(0, 20);
    await ctx.close();
  }
  fs.writeFileSync(path.join(dir, 'metrics.json'), JSON.stringify(metrics, null, 1));
  await b.close();
})().catch(e => { console.error(e); fs.writeFileSync(path.join(dir, 'metrics.json'), JSON.stringify(metrics, null, 1)); process.exit(1); });
