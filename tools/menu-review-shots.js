// 菜单 / 排行榜 UX 审查（2026-11-22）：现在的菜单流程截图 + 三个布局方案的示意图（mockup）。
// 示意图不是游戏代码：只在截图时往真实画面上盖一层 DOM（用游戏自己的字体和颜色），游戏源码一行不改。
// Headless only: never opens a window.
//   node tools/menu-review-shots.js <out dir> [html] [only=<regex on shot names>]
const PW = require('playwright'), chromium = PW[process.env.ENGINE || 'chromium'];
const fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || 'menu-review');
const html = path.resolve(process.argv.find(a => a.endsWith('.html')) || path.join(__dirname, '../dist/dev.html'));
const only = (process.argv.find(a => a.startsWith('only=')) || '').slice(5);
const CFG = [
  { id: 'desk', name: '桌面 1280x720', vw: 1280, vh: 720, touch: false, safe: { l: 0, r: 0, t: 0, b: 0 }, xhs: false },
  { id: 'ip15', name: 'iPhone 15 横拿 小红书', vw: 852, vh: 393, touch: true, safe: { l: 59, r: 59, t: 0, b: 21 }, xhs: true },
  { id: 'se', name: 'iPhone SE 横拿 小红书', vw: 667, vh: 375, touch: true, safe: { l: 0, r: 0, t: 0, b: 0 }, xhs: true },
];
fs.mkdirSync(dir, { recursive: true });
const metrics = {};

// ---------------------------------------------------------------- the mockups (盖在真实画面上的一层)
const ICON = {
  ring: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="5.6"/><path d="M10 1.8v1.6M10 16.6v1.6M1.8 10h1.6M16.6 10h1.6"/></svg>',
  cup: '<svg viewBox="0 0 20 20"><path d="M6 3.5h8v4a4 4 0 0 1-8 0z"/><path d="M6 5H3.5v1.2A2.8 2.8 0 0 0 6.3 9M14 5h2.5v1.2A2.8 2.8 0 0 1 13.7 9M10 11.5v3M7 16.5h6"/></svg>',
  cam: '<svg viewBox="0 0 20 20"><rect x="2.5" y="6" width="11" height="9" rx="2"/><path d="M13.5 9l4-2.2v7.4l-4-2.2"/></svg>',
  keys: '<svg viewBox="0 0 20 20"><rect x="2.5" y="5.5" width="15" height="9" rx="2"/><path d="M5.5 8.5h1M9.5 8.5h1M13.5 8.5h1M6.5 11.5h7"/></svg>',
  ski: '<svg viewBox="0 0 20 20"><path d="M3 16.5l14-6M5.5 3.5l3 9"/><circle cx="12.5" cy="4.5" r="1.6"/></svg>',
  me: '<svg viewBox="0 0 20 20"><circle cx="10" cy="7" r="3.2"/><path d="M3.8 17a6.2 6.2 0 0 1 12.4 0"/></svg>',
  gear: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2M4.7 4.7l1.6 1.6M13.7 13.7l1.6 1.6M4.7 15.3l1.6-1.6M13.7 6.3l1.6-1.6"/></svg>',
};
const CSS = `
#mk{position:absolute;inset:0;z-index:60;pointer-events:none;font-family:var(--f-ui);color:var(--snow)}
#mk *{box-sizing:border-box}
#mk svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;flex:none}
#mk .go{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:54px;min-width:184px;padding:0 30px;border-radius:999px;background:linear-gradient(180deg,#f7d6a2,#eeb25c);color:#1b1408;font-family:var(--f-song);font-weight:500;font-size:18px;letter-spacing:.6em;text-indent:.6em;box-shadow:0 6px 22px rgba(255,186,96,.2),0 1px 0 rgba(255,255,255,.5) inset}
#mk .go2{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:54px;min-width:184px;padding:0 26px;border-radius:999px;background:rgba(5,8,13,.35);color:var(--sun);box-shadow:inset 0 0 0 1.5px var(--sun);font-family:var(--f-song);font-weight:500;font-size:18px;letter-spacing:.5em;text-indent:.5em;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
#mk .sm{display:inline-flex;align-items:center;gap:7px;height:44px;padding:0 16px;border-radius:12px;background:rgba(5,8,13,.3);box-shadow:inset 0 0 0 1px var(--hair);color:var(--snow);font-size:14px;letter-spacing:.2em}
#mk .sm.hot{color:var(--sun);box-shadow:inset 0 0 0 1.5px var(--sun);background:rgba(255,208,138,.1)}
#mk .new{display:inline-block;margin-left:2px;padding:1px 5px;border-radius:6px;background:var(--sun);color:#1b1408;font-size:10px;letter-spacing:.1em;text-indent:0}
#mk .cta{position:absolute;left:var(--ctaL,80px);top:var(--ctaT,50%);display:flex;flex-direction:column;align-items:flex-start;gap:10px}
#mk .row{display:flex;gap:10px;justify-content:flex-start;flex-wrap:nowrap}#mk span,#mk p{white-space:nowrap}
#mk .panel{background:rgba(7,11,18,.72);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-radius:16px;box-shadow:inset 0 0 0 1px var(--hair),0 10px 40px rgba(0,0,0,.35)}
#mk h5{margin:0 0 8px;font-family:var(--f-lat);font-weight:500;font-size:10px;letter-spacing:.4em;color:var(--dim)}
#mk .tabs{display:flex;gap:6px;margin:0 0 8px}#mk .tabs b{font-weight:400;height:30px;line-height:30px;padding:0 12px;border-radius:9px;font-size:12px;letter-spacing:.15em;color:var(--dim);box-shadow:inset 0 0 0 1px var(--hair)}
#mk .tabs b.on{color:var(--sun);box-shadow:inset 0 0 0 1px var(--sun);background:rgba(255,208,138,.08)}
#mk ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
#mk ol li{display:flex;align-items:baseline;gap:10px;padding:4px 6px;border-radius:8px;font-size:13px;letter-spacing:.06em}
#mk ol li b{width:20px;font-family:var(--f-lat);font-weight:500;color:var(--dim);text-align:right}#mk ol li.top b{color:var(--sun)}
#mk ol li span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#mk ol li em{font-style:normal;font-family:var(--f-lat);font-variant-numeric:tabular-nums;color:var(--snow)}
#mk ol li.me{background:rgba(255,208,138,.1);box-shadow:inset 0 0 0 1px rgba(255,208,138,.45)}#mk ol li.me span,#mk ol li.me b{color:var(--sun)}
#mk .demo{font-size:10px;letter-spacing:.2em;color:var(--faint)}
#mk .line{display:block;padding:9px 12px;border-radius:10px;background:rgba(5,8,13,.25);box-shadow:inset 0 0 0 1px var(--hair);margin-bottom:6px}
#mk .line.on{background:rgba(255,208,138,.08);box-shadow:inset 0 0 0 1px var(--sun)}
#mk .line b{display:flex;justify-content:space-between;font-family:var(--f-song);font-weight:400;font-size:15px;letter-spacing:.2em}#mk .line.on b{color:var(--sun)}
#mk .line b em{font-style:normal;font-family:var(--f-lat);font-weight:300;font-size:13px;letter-spacing:.02em;color:var(--dim)}
#mk .line i{display:block;margin-top:2px;font-style:normal;font-size:11px;letter-spacing:.08em;color:var(--faint)}
#mk .seg{display:flex;gap:6px;margin:4px 0 0}#mk .seg b{flex:1;text-align:center;font-weight:400;height:30px;line-height:30px;border-radius:9px;font-size:12px;letter-spacing:.2em;color:var(--dim);box-shadow:inset 0 0 0 1px var(--hair)}#mk .seg b.on{color:var(--sun);box-shadow:inset 0 0 0 1px var(--sun)}
#mk .start{display:flex;align-items:center;justify-content:center;height:42px;margin-top:10px;border-radius:12px;color:var(--sun);background:rgba(255,208,138,.08);box-shadow:inset 0 0 0 1px var(--sun);font-family:var(--f-song);font-size:15px;letter-spacing:.5em;text-indent:.5em}
#mk .back{display:inline-flex;align-items:center;gap:4px;height:36px;font-size:14px;letter-spacing:.2em;margin-left:-6px}
#mk .nav{position:absolute;top:0;bottom:0;left:0;width:clamp(190px,26%,300px);padding:calc(var(--gt) + 4px) 0 var(--gb) var(--col);display:flex;flex-direction:column;justify-content:center;gap:clamp(4px,1.1vmin,10px)}
#mk .nav .k{font-family:var(--f-lat);font-size:10px;letter-spacing:.4em;color:var(--dim);margin-bottom:4px}
#mk .nav p{margin:0;font-family:var(--f-song);font-weight:300;font-size:clamp(15px,2.6vmin,21px);letter-spacing:.3em;color:var(--dim);display:flex;align-items:center;gap:8px}
#mk .nav p.go{all:unset;font-family:var(--f-song);font-weight:500;font-size:clamp(16px,2.8vmin,23px);letter-spacing:.3em;color:var(--sun)}
#mk .nav p.on{color:var(--snow)}#mk .nav p.on::before{content:"";width:18px;height:1px;background:var(--sun);margin-left:-26px}
#mk .nav p.s{font-size:clamp(12px,2vmin,16px)}#mk .nav i.sep{display:block;width:40px;height:1px;background:var(--hair);margin:2px 0}
#mk .nav .icons{display:flex;gap:8px;margin-top:6px}#mk .nav .icons span{display:inline-flex;align-items:center;gap:5px;height:40px;padding:0 10px;border-radius:10px;box-shadow:inset 0 0 0 1px var(--hair);font-size:12px;letter-spacing:.12em;color:var(--dim)}
#mk .scrim{position:absolute;inset:0;background:rgba(5,8,13,.55)}
#mk .tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:clamp(92px,13vw,150px);height:clamp(64px,17vmin,104px);border-radius:14px;background:rgba(5,8,13,.38);box-shadow:inset 0 0 0 1px var(--hair);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font-family:var(--f-song);font-size:15px;letter-spacing:.3em;text-indent:.3em}
#mk .tile svg{width:24px;height:24px}#mk .tile.g{background:linear-gradient(180deg,#f7d6a2,#eeb25c);color:#1b1408;box-shadow:0 6px 22px rgba(255,186,96,.25)}
#mk .tile small{font-family:var(--f-ui);font-size:10px;letter-spacing:.1em;text-indent:0;opacity:.7}
#mk .tease{position:absolute;right:calc(var(--gr) + 4px);top:calc(var(--gt) + 50px);width:clamp(200px,24vw,260px);padding:12px 14px}
#mk .tease .more{margin-top:6px;font-size:12px;letter-spacing:.15em;color:var(--sun);text-align:right}
#mk .note{position:absolute;left:50%;top:calc(var(--gt) + 4px);transform:translateX(-50%);padding:4px 10px;border-radius:8px;background:rgba(255,80,120,.85);color:#fff;font-size:11px;letter-spacing:.1em;white-space:nowrap}
`;
const LIST = (n, meAt) => {
  const names = ['雪友A', '雪友B', '雪友C', '雪友D', '雪友E', '雪友F', '雪友G', '雪友H', '雪友I'], out = [];
  for (let i = 0; i < n; i++) { const t = 92.4 + i * 1.7 + (i * i) * .11, m = Math.floor(t / 60), s = (t - m * 60).toFixed(2).padStart(5, '0'); out.push('<li class="' + (i < 3 ? 'top' : '') + '"><b>' + (i + 1) + '</b><span>' + names[i] + '</span><em>' + m + ':' + s + '</em></li>'); }
  if (meAt) out.push('<li class="me"><b>' + meAt + '</b><span>我</span><em>1:41.08</em></li>');
  return '<ol>' + out.join('') + '</ol>';
};
const BOARD = (n, meAt, h) => '<h5>' + (h || 'RANKING · 排行榜') + '</h5><div class="tabs"><b class="on">速降线</b><b>越野线</b><b>滑雪时长</b></div><div class="tabs"><b class="on">今日</b><b>本周</b><b>总榜</b></div>' + LIST(n, meAt) + '<div class="demo" style="margin-top:6px">演示数据</div>';
const MOCK = {
  // A 最小改动：首页按钮行加「排行榜」；菜单里排行榜提到前面，一屏放下不用下滑
  A1: c => `<div class="cta"><span class="go">自由滑</span><div class="row"><span class="sm">${ICON.ring}挑战</span><span class="sm hot">${ICON.cup}排行榜<i class="new">新</i></span><span class="sm">${ICON.cam}视角</span><span class="sm">${ICON.keys}操作</span></div></div>`,
  A2: c => `<div class="scrim"></div><div class="nav"><span class="back">‹ 返回</span><div class="k">PAUSED · 暂停</div><p class="go">继续滑</p><p>挑战</p><p class="on">排行榜</p><p>拍照</p><i class="sep"></i><p>视角</p><p>滑过的山</p><p>分享</p><i class="sep"></i><p class="s">设置与操作</p><p class="s">回到山顶</p></div>
    <div class="panel" style="position:absolute;left:clamp(220px,30%,340px);right:calc(var(--gr) + 8px);top:calc(var(--gt) + 46px);bottom:var(--gb);padding:14px 18px;overflow:hidden">${BOARD(c.vh < 500 ? 3 : 8, 12)}</div>`,
  // B 推荐：首页两个一样大的入口（自由滑 / 挑战），右上角直接摆今日榜；挑战面板里左边选线、右边就是这条线的榜
  B1: c => `<div class="panel tease"><h5>今日 · 寒烟山速降线</h5>${LIST(3, 12)}<div class="more">看全部排行 ›</div><div class="demo">演示数据</div></div>
    <div class="cta"><div class="row"><span class="go">${ICON.ski}自由滑</span><span class="go2">${ICON.ring}挑战</span></div><div class="row"><span class="sm">${ICON.cup}排行榜</span><span class="sm">${ICON.cam}视角</span><span class="sm">${ICON.gear}设置</span></div></div>`,
  B2: c => `<div class="scrim"></div><div class="panel" style="position:absolute;left:calc(var(--gl) + 10px);right:calc(var(--gr) + 10px);top:calc(var(--gt) + 40px);bottom:calc(var(--gb) - 4px);padding:12px 16px;display:flex;gap:18px">
    <div style="flex:0 0 44%;display:flex;flex-direction:column"><span class="back">‹ 返回</span><h5>挑战 · 寒烟山</h5><span class="line on"><b>速降线<em>最好 1:41.08</em></b>${c.vh < 500 ? '' : '<i>沿着雪道一路冲下去，圈都在最快的那条线上</i>'}</span><span class="line"><b>越野线<em>还没滑过</em></b>${c.vh < 500 ? '' : '<i>穿林子、走平时去不到的地方</i>'}</span>
      <div class="seg"><b>轻松</b><b class="on">标准</b><b>难</b></div><div style="flex:1"></div><span class="start">开始挑战</span></div>
    <div style="flex:1;min-width:0;border-left:1px solid var(--hair);padding-left:16px;overflow:hidden"><h5>速降线 · 排行榜</h5><div class="tabs"><b class="on">今日</b><b>本周</b><b>总榜</b></div>${LIST(c.vh < 500 ? 4 : 8, 12)}<div class="demo" style="margin-top:4px">演示数据</div></div></div>`,
  B3: c => `<div class="scrim"></div><div class="nav"><span class="back">‹ 返回</span><div class="k">PAUSED · 暂停</div><p class="go">继续滑</p><p>重来这条线</p><p class="on">排行榜</p><p>拍照</p><p>回到山顶</p><div class="icons"><span>${ICON.cam}视角</span><span>${ICON.gear}设置</span></div></div>
    <div class="panel" style="position:absolute;left:clamp(230px,32%,360px);right:calc(var(--gr) + 8px);top:calc(var(--gt) + 46px);bottom:var(--gb);padding:14px 18px;overflow:hidden">${BOARD(c.vh < 500 ? 3 : 8, 12)}</div>`,
  // C 大厅：首页底下四个一样大的格子，排行榜是其中一格，点开是整页
  C1: c => `<div class="cta"><div class="row" style="gap:12px"><span class="tile g">${ICON.ski}自由滑</span><span class="tile">${ICON.ring}挑战</span><span class="tile">${ICON.cup}排行榜<small>今日 第 12 名</small></span><span class="tile">${ICON.me}我的<small>山 · 设置</small></span></div></div>`,
  C2: c => `<div class="scrim"></div><div class="panel" style="position:absolute;left:calc(var(--gl) + 10px);right:calc(var(--gr) + 10px);top:calc(var(--gt) + 40px);bottom:calc(var(--gb) - 4px);padding:12px 18px;overflow:hidden"><span class="back">‹ 返回</span>${BOARD(c.vh < 500 ? 3 : 9, 12, '排行榜')}</div>`,
};

(async () => {
  const b = await chromium.launch({ headless: true });
  for (const c of CFG) {
    const ctx = await b.newContext({ viewport: { width: c.vw, height: c.vh }, isMobile: c.touch, hasTouch: c.touch, locale: 'zh-CN', deviceScaleFactor: 2 });
    const pg = await ctx.newPage();
    await pg.addInitScript(c => {
      localStorage.setItem('coldsmoke.lang', 'zh');
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
        const names = ['雪友A', '雪友B', '雪友C', '雪友D', '雪友E', '雪友F', '雪友G', '雪友H'];
        const L = { data: names.map((n, i) => ({ rank: i + 1, nickname: n + '（演示数据）', score: 6000 - (92.4 + i * 1.9) })) };
        window.xhs = { miniTool: { submitScore: async () => ({}), getRankList: async () => L, getMyRank: async () => ({ status: 'EXACT', rank: 12, score: 6000 - 101.08 }), getWindowInfo: async () => ({ menuButtons: mb }), getStorage: async () => ({ data: null }), setStorage: async () => ({}) } };
      }
    }, c);
    await pg.goto('file://' + html);
    await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
    await pg.waitForTimeout(4500);
    const want = n => !only || new RegExp(only).test(n);
    const shot = async n => { if (!want(n)) return; await pg.screenshot({ path: path.join(dir, c.id + '_' + n + '.png') }); console.log('shot', c.id, n); };
    const m = metrics[c.id] = { name: c.name };
    // where the way to the board is, and whether the menu's column has to scroll to show it
    const navInfo = () => pg.evaluate(() => {
      const nav = document.querySelector('#menu nav'), r = [...nav.querySelectorAll('button')].filter(b => !b.hidden && getComputedStyle(b).display !== 'none').map(b => { const q = b.getBoundingClientRect(); return { t: b.textContent.trim(), top: Math.round(q.top), bottom: Math.round(q.bottom), h: Math.round(q.height) }; });
      return { navH: nav.clientHeight, navScroll: nav.scrollHeight, items: r, rankVisible: (() => { const x = r.find(i => i.t === '排行榜'); return x ? x.bottom <= nav.clientHeight : null; })() };
    });
    const titleBtns = () => pg.evaluate(() => [...document.querySelectorAll('#title button')].filter(b => !b.hidden && b.offsetParent).map(b => { const q = b.getBoundingClientRect(); return { t: b.textContent.trim(), w: Math.round(q.width), h: Math.round(q.height) }; }));

    // ---- 现在
    m.titleButtons = await titleBtns();
    await shot('now1_首页');
    await pg.evaluate(() => __rings.pickOpen(true)); await pg.waitForTimeout(1200); await shot('now2_首页挑战面板');
    await pg.evaluate(() => __rings.pickOpen(false)); await pg.waitForTimeout(600);
    await pg.evaluate(() => __ski.ui().menu(true)); await pg.waitForTimeout(1000); m.titleMenu = await navInfo(); await shot('now3_首页菜单');
    if (c.xhs) { await pg.evaluate(() => __ski.ui().menu('rank')); await pg.waitForTimeout(1500); await shot('now4_首页菜单排行榜'); }
    await pg.evaluate(() => __ski.ui().menu(false)); await pg.waitForTimeout(800);
    // background for the title mockups: the real title picture, its own buttons put away
    await pg.addStyleTag({ content: '#app.mkt #title .cta{visibility:hidden}#app.mkr #hud,#app.mkr #bar{visibility:hidden}' });
    { const r = await pg.evaluate(() => { const q = document.querySelector('#title .cta .act').getBoundingClientRect(), a = document.getElementById('app').getBoundingClientRect(); return { l: q.left - a.left, t: q.top - a.top }; }); await pg.evaluate(r => { const a = document.getElementById('app'); a.style.setProperty('--ctaL', r.l + 'px'); a.style.setProperty('--ctaT', r.t + 'px'); }, r); m.ctaRect = r; }
    for (const k of ['A1', 'B1', 'C1']) {
      await pg.evaluate(([css, h]) => { let s = document.getElementById('mkcss'); if (!s) { s = document.createElement('style'); s.id = 'mkcss'; s.textContent = css; document.head.appendChild(s); } document.getElementById('app').classList.add('mkt'); let d = document.getElementById('mk'); if (!d) { d = document.createElement('div'); d.id = 'mk'; document.getElementById('app').appendChild(d); } d.innerHTML = h; }, [CSS, MOCK[k](c)]);
      await pg.waitForTimeout(500); await shot('mock' + k);
    }
    for (const k of ['B2', 'C2']) {
      await pg.evaluate(h => { document.getElementById('mk').innerHTML = h; }, MOCK[k](c)); await pg.waitForTimeout(500); await shot('mock' + k);
    }
    await pg.evaluate(() => { const d = document.getElementById('mk'); if (d) d.remove(); document.getElementById('app').classList.remove('mkt'); });

    // ---- 现在：滑起来以后
    await pg.evaluate(() => __ski.ui().go());
    await pg.waitForFunction(() => __ski.ui().state === 'run', null, { timeout: 240000 });
    await pg.waitForTimeout(3000);
    await pg.evaluate(() => { for (let i = 0; i < 6; i++) __ski.sim(0.5, () => 0.2 * Math.sin(i), { draw: i === 5 }); });
    await pg.waitForTimeout(800); await shot('now5_滑雪中');
    await pg.evaluate(() => __ski.ui().menu(true)); await pg.waitForTimeout(1200); m.runMenu = await navInfo(); await shot('now6_暂停菜单');
    if (c.xhs) {
      await pg.evaluate(() => { const n = document.querySelector('#menu nav'); n.scrollTop = n.scrollHeight; }); await pg.waitForTimeout(500); await shot('now7_暂停菜单下滑后');
      await pg.evaluate(() => __ski.ui().menu('rank')); await pg.waitForTimeout(1500); await shot('now8_排行榜页');
    }
    // the run's own mockups (A2 / B3): the paused picture behind
    await pg.evaluate(() => { const n = document.querySelector('#menu nav'); n.scrollTop = 0; __ski.ui().menu(false); }); await pg.waitForTimeout(900);
    await pg.evaluate(() => { __ski.app().paused = true; document.getElementById('app').classList.add('mkr'); });
    for (const k of ['A2', 'B3']) {
      await pg.evaluate(([css, h]) => { let s = document.getElementById('mkcss'); if (!s) { s = document.createElement('style'); s.id = 'mkcss'; s.textContent = css; document.head.appendChild(s); } let d = document.getElementById('mk'); if (!d) { d = document.createElement('div'); d.id = 'mk'; document.getElementById('app').appendChild(d); } d.innerHTML = h; }, [CSS, MOCK[k](c)]);
      await pg.waitForTimeout(500); await shot('mock' + k);
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(dir, 'metrics.json'), JSON.stringify(metrics, null, 1));
  await b.close();
})().catch(e => { console.error(e); fs.writeFileSync(path.join(dir, 'metrics.json'), JSON.stringify(metrics, null, 1)); process.exit(1); });
