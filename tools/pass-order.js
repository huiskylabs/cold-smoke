// Which order the transparent and fx passes draw in, by name (no picture): node tools/pass-order.js
const path = require('path'); const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true }); const pg = await b.newPage({ viewport: { width: 480, height: 270 } });
  await pg.goto('file://' + path.resolve(__dirname, '../dist/dev.html') + '?dev&v-rline=a');
  await pg.waitForFunction(() => window.__ski && window.__rings && __ski.ui().state === 'title', null, { timeout: 300000 });
  await pg.waitForTimeout(3000);
  const r = await pg.evaluate(() => { const P = __ski.m.Render.passes, nm = f => (f.toString().match(/(RG|V|Clouds|Trees|Gates|Dust|Shafts|Wind|Spray|Grains)\.\w+/) || [f.toString().slice(0, 40)])[0]; return { transparent: P.transparent.map(nm), fx: P.fx.map(nm) }; });
  console.log(JSON.stringify(r)); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
