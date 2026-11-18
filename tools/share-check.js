// The share link (?chal): the 挑战 button and its panel are there, the dev things are not. DOM only, no picture. node tools/share-check.js
const path = require('path'); const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true }); const pg = await b.newPage({ viewport: { width: 960, height: 540 }, locale: 'zh-CN' });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  for (const q of ['?chal', '']) {
    await pg.goto('file://' + path.resolve(__dirname, '../dist/index.html') + q);
    await pg.waitForFunction(() => window.__ski && __ski.ui().state === 'title', null, { timeout: 300000 });
    await pg.waitForTimeout(2500);
    const r = await pg.evaluate(() => {
      const vis = el => !!el && getComputedStyle(el).display !== 'none' && el.offsetParent !== null;
      const more = [...document.querySelectorAll('#more button')].filter(vis).map(x => x.textContent.trim());
      const dev = [...document.querySelectorAll('.dev-only')].filter(vis).map(x => x.textContent.trim().slice(0, 12));
      const cb = [...document.querySelectorAll('#more button')].find(x => /挑战/.test(x.textContent));
      if (cb) cb.click();
      const pk = document.getElementById('rpick'); const lines = pk ? [...pk.querySelectorAll('.l button b')].map(x => x.textContent) : [];
      return { more, devVisible: dev, panel: !!pk && pk.classList.contains('on'), lines, vers: !!document.querySelector('[data-sec=vers]') && vis(document.querySelector('[data-sec=vers]')) };
    });
    console.log(q || '(plain)', JSON.stringify(r));
    if (q === '?chal' && r.panel) {
      await pg.evaluate(() => { const g = document.querySelector('#rpick .go'); g.click(); });
      await pg.waitForFunction(() => __rings.line.st === 'count', null, { timeout: 60000 }).then(() => console.log('  开始挑战 → count-down ok')).catch(e => console.log('  count-down did not start'));
    }
  }
  console.log('errors:', errs.length ? errs.join(' | ') : 'none'); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
