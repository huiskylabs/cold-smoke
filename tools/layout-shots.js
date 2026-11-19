// Pictures of the panels tools/layout-check.js measures, at the same screens (same safe insets, same 小红书 host buttons drawn in as
// outlines), for a before / after look. Headless only: it never opens a window.
//   node tools/layout-shots.js <out dir> <tag> [html] [only=<regex on the names>]
const PW = require('playwright'), ENGINE = process.env.ENGINE || 'chromium', chromium = PW[ENGINE];          // (ENGINE=webkit: Safari's engine, as on an iPhone; the 21:15 UTC break showed only there)
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || 'layout-shots'), tag = process.argv[3] || 'now';
const html = path.resolve(process.argv.find(a => a.endsWith('.html')) || path.join(__dirname, '../dist/dev.html'));
const only = (process.argv.find(a => a.startsWith('only=')) || '').slice(5);
const CFG = [
  { name: 'iPhone Safari 竖拿 网站', vw: 375, vh: 627, touch: true, safe: { l: 0, r: 0, t: 0, b: 0 }, xhs: false },          // (用户 21:15 UTC: Safari 的地址栏和底栏之间只剩 375x627)
  { name: 'iPhone mini 竖拿 小红书', vw: 375, vh: 812, touch: true, safe: { l: 0, r: 0, t: 47, b: 34 }, xhs: true },
  { name: 'iPhone 15 横拿 小红书', vw: 852, vh: 393, touch: true, safe: { l: 59, r: 59, t: 0, b: 21 }, xhs: true },
  { name: 'iPhone SE 横拿 小红书', vw: 667, vh: 375, touch: true, safe: { l: 0, r: 0, t: 0, b: 0 }, xhs: true },
  { name: 'Android 360 竖拿', vw: 360, vh: 800, touch: true, safe: { l: 0, r: 0, t: 24, b: 0 }, xhs: false },
  { name: '桌面 1280x720', vw: 1280, vh: 720, touch: false, safe: { l: 0, r: 0, t: 0, b: 0 }, xhs: false },
];
fs.mkdirSync(dir, { recursive: true });
(async () => {
  const b = await chromium.launch({ headless: true });
  for (const c of CFG) {
    if (only && !new RegExp(only).test(c.name)) continue;
    const ctx = await b.newContext({ viewport: { width: c.vw, height: c.vh }, isMobile: c.touch, hasTouch: c.touch, locale: 'zh-CN', deviceScaleFactor: 2 });
    const pg = await ctx.newPage();
    await pg.addInitScript(c => {
      localStorage.setItem('coldsmoke.lang', 'zh');
      const s = c.safe, rot = c.touch && c.vh > c.vw * 1.04, f = rot ? { l: s.t, r: s.b, t: s.r, b: s.l } : s;
      const st = document.createElement('style');
      st.textContent = '#app,#app.rot,#app.rot.flip{--sl:' + f.l + 'px!important;--sr:' + f.r + 'px!important;--st:' + f.t + 'px!important;--sb:' + f.b + 'px!important}';
      document.addEventListener('DOMContentLoaded', () => {
        document.head.appendChild(st);
        // the screen's notch / home bar and the host's buttons, drawn over the page where the phone has them
        const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999';
        const add = css => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;' + css; o.appendChild(d); };
        if (s.t) add('left:0;right:0;top:0;height:' + s.t + 'px;background:rgba(255,0,80,.18)');
        if (s.b) add('left:0;right:0;bottom:0;height:' + s.b + 'px;background:rgba(255,0,80,.18)');
        if (s.l) add('top:0;bottom:0;left:0;width:' + s.l + 'px;background:rgba(255,0,80,.18)');
        if (s.r) add('top:0;bottom:0;right:0;width:' + s.r + 'px;background:rgba(255,0,80,.18)');
        for (const k in (window.__hostButtons || {})) { const m = window.__hostButtons[k]; add('left:' + m.left + 'px;top:' + m.top + 'px;width:' + m.width + 'px;height:' + m.height + 'px;border-radius:50%;background:rgba(0,0,0,.55);box-shadow:0 0 0 1.5px #fff'); }
        document.body.appendChild(o);
      });
      if (c.xhs) {
        const top = s.t + 10, sz = 34, W = c.vw;
        const mb = { back: { left: 12 + s.l, top, width: sz, height: sz }, me: { left: W - 12 - s.r - sz * 2 - 10, top, width: sz, height: sz }, share: { left: W - 12 - s.r - sz, top, width: sz, height: sz } };
        for (const k in mb) { mb[k].right = mb[k].left + mb[k].width; mb[k].bottom = mb[k].top + mb[k].height; }
        window.__hostButtons = mb;
        const L = { list: [{ rank: 1, nickname: '演示数据', score: 5800 }] };
        window.xhs = { miniTool: { submitScore: async () => ({}), getRankList: async () => L, getMyRank: async () => ({ status: 'EXACT', rank: 2, score: 5790 }), getWindowInfo: async () => ({ menuButtons: mb }) } };
      }
    }, c);
    await pg.goto('file://' + html);
    await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
    await pg.waitForTimeout(4000);
    const nm = c.name.replace(/\s+/g, '_'), shot = s => pg.screenshot({ path: path.join(dir, nm + '__' + s + '__' + tag + '.png') });
    await shot('1标题页');
    await pg.evaluate(() => (__rings.pickOpen ? __rings.pickOpen(true) : document.querySelector('#title [data-chal], #title .chal, #more button') && null)); await pg.waitForTimeout(1200);
    if (!(await pg.evaluate(() => !!__rings.pickOpen))) await pg.evaluate(() => { const b = [...document.querySelectorAll('#title button')].find(x => /挑战/.test(x.textContent)); if (b) b.click(); }), await pg.waitForTimeout(1200);
    await shot('2挑战面板');
    await pg.evaluate(() => { if (__rings.pickOpen) __rings.pickOpen(false); }); await pg.waitForTimeout(600);
    await pg.evaluate(() => __ski.ui().menu(true)); await pg.waitForTimeout(900); await shot('2b菜单');          // (a layer too: 返回 at its top left)
    await pg.evaluate(() => __ski.ui().menu(false)); await pg.waitForTimeout(600);
    await pg.evaluate(() => { const V = __ski.m.Variants; V.set('ringdiff', 'b'); V.set('rline', 'a'); __rings.chal = true; __ski.ui().go(); });
    await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 240000 });
    await pg.evaluate(() => { __rings.line.cT = 99; }); await pg.waitForFunction(() => __rings.line.st === 'go', null, { timeout: 240000 });
    await pg.evaluate(() => { for (let i = 0; i < 8; i++) { __ski.sim(0.5, () => 0.15 * Math.sin(i), { draw: i === 7 }); __rings.frame(); } });
    if (await pg.evaluate(() => !!__rings.finishNow)) {
      await pg.evaluate(() => __rings.finishNow()); await pg.waitForTimeout(3500); await shot('3成绩卡');
      const has = await pg.evaluate(() => { const b = [...document.querySelectorAll('#rline [data-cb]')].find(x => /路线卡/.test(x.textContent)); if (b) b.click(); return !!b; });
      if (has) { await pg.waitForTimeout(2000); await shot('4路线卡'); }
    }
    console.log('done', c.name); await ctx.close();
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
