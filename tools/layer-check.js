// Every panel that opens over the page is a layer that closes back to the page under it, and nothing else (用户 2026-11-19 21:19 UTC:
// 「菜单要有层级 modal 然后可以轻松退回去」). For each layer and each way back (返回, a tap on the dimmed page, Esc, the phone's own back =
// history.back), open it on the title page, go back, and check: the layer is gone, the page is still the title page (no run started),
// and the layer list is empty. Headless only.
//   ENGINE=webkit node tools/layer-check.js [html]          exit 1 when anything is wrong
const PW = require('playwright'), ENGINE = process.env.ENGINE || 'chromium';
const path = require('path');
const html = path.resolve(process.argv.find(a => a.endsWith('.html')) || path.join(__dirname, '../dist/dev.html'));
const SIZES = [{ name: '竖拿 375x627', w: 375, h: 627 }, { name: '横拿 812x340', w: 812, h: 340 }];
(async () => {
  const b = await PW[ENGINE].launch({ headless: true }); let bad = 0;
  for (const S of SIZES) {
    const ctx = await b.newContext({ viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, locale: 'zh-CN' });
    const pg = await ctx.newPage();
    await pg.addInitScript(() => localStorage.setItem('coldsmoke.lang', 'zh'));
    await pg.goto('file://' + html);
    await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
    await pg.waitForTimeout(2500);
    const LAYERS = {
      pick: { open: () => __rings.pickOpen(true), isOpen: () => !!__rings.pkOpen, back: '#rpick .bk', scrim: '#pkscrim' },
      menu: { open: () => __ski.ui().menu(true), isOpen: () => !!__ski.ui().open, back: '#m-back', scrim: null },
    };
    for (const name of Object.keys(LAYERS)) for (const way of ['返回', '点外面', 'Esc', '系统返回']) {
      const L = LAYERS[name];
      if (way === '点外面' && !L.scrim) continue;
      await pg.evaluate(`(${L.open})()`); await pg.waitForTimeout(500);
      const opened = await pg.evaluate(`(${L.isOpen})()`);
      if (way === '返回') await pg.tap(L.back);
      else if (way === '点外面') { const vp = pg.viewportSize(); await pg.mouse.click(vp.width - 8, 8 + vp.height / 2); }          // (the far side of the dimmed page)
      else if (way === 'Esc') await pg.keyboard.press('Escape');
      else await pg.evaluate(() => history.back());
      await pg.waitForTimeout(700);
      const r = await pg.evaluate(`({ open: (${L.isOpen})(), state: __ski.ui().state, top: __ski.ui().layerTop ? __ski.ui().layerTop() : 'none?' })`);
      const ok = opened && !r.open && r.state === 'title' && r.top === null;
      if (!ok) bad++;
      console.log((ok ? '✓ ' : '✗ ') + S.name + ' ' + name + ' ' + way + (ok ? '' : '  opened=' + opened + ' ' + JSON.stringify(r)));
      if (r.state !== 'title') { await pg.reload(); await pg.waitForFunction(() => window.__ski && __ski.ui().state === 'title', null, { timeout: 300000 }); await pg.waitForTimeout(2500); }
    }
    // two layers deep is not possible from the title page today; the history must still be clean after all of the above
    const h = await pg.evaluate(() => history.length); console.log('  history.length ' + h);
    await ctx.close();
  }
  await b.close(); console.log(bad ? bad + ' 个问题' : '全部通过'); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
