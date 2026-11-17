// node tools/world-shot.js <out dir> <jobs.json> [w=1600] [h=900]
// Still frames for looking at experiments side by side. jobs.json: [{ q: '&v-world=d&v-route=c', dump: true, shots: [{ name, tod, s, cam, variants }] }]:
// one page per job (q = the choices that need a new mountain or a new bake), then each shot on its own. dump: also writes the centreline
// of the first 6 km (<out>/line_<n>.json) for drawing a plan of the run. Needs playwright and a real GPU; never a window, never Chrome.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const [out = 'world-shots', jobsFile, W = '1600', Hh = '900'] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8')), log = [];
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-webgpu', '--enable-gpu', '--use-angle=metal', '--ignore-gpu-blocklist'] });
  for (let j = 0; j < jobs.length; j++) {
    const job = jobs[j], page = await browser.newPage({ viewport: { width: +W, height: +Hh } }), errs = [];
    page.on('pageerror', e => errs.push(e.message.slice(0, 400))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 400)); });
    try {
      await page.goto('file://' + path.resolve(__dirname, '..', 'dist', 'dev.html') + `?director=1&w=${W}&h=${Hh}&gov=0&offscreen=1&metrosamples=4` + (job.q || ''));
      await page.waitForFunction(() => window.Director && Director.ready, null, { timeout: 180000, polling: 250 });
      if (job.dump) {
        const line = await page.evaluate(() => { const Course = __ski.m.Course, a = [], o = {}; for (let s = 0; s <= 6000; s += 6) { const c = Course.at(s, o); a.push([s, +c.cx.toFixed(1), +c.hw.toFixed(1), c.type || (c.seg && c.seg.type) || '']); } return { keys: Object.keys(Course.at(100, {})), a, segs: (Course.segs || []).slice(0, 16).map(g => ({ type: g.type, s0: g.s0, len: g.len, s1: g.s1 })) }; });
        fs.writeFileSync(path.join(out, `line_${job.dump}.json`), JSON.stringify(line));
      }
      for (const sh of job.shots) {
        const shot = { id: 'x', dur: 1, seed: 20261115, tod: sh.tod || 'day', hold: true, start: false, at: { s: sh.s == null ? 14 : sh.s }, lead: 0, cam: sh.cam || 'chase', variants: sh.variants };
        await page.evaluate(sj => { Director.shots = [JSON.parse(sj)]; Director.begin(0, 5, {}); }, JSON.stringify(shot));
        for (let k = 0; k < (sh.steps || 12); k++) await page.evaluate(() => { Director.step(); });
        const d = await page.evaluate(() => { Director.step(); return Director.frame(); });
        fs.writeFileSync(path.join(out, sh.name + '.png'), Buffer.from(d.split(',')[1], 'base64'));
      }
    } catch (e) { errs.push('JOB ' + String(e).slice(0, 400)); }
    log.push({ job: j, q: job.q, errs: errs.slice(0, 5) });
    await page.close();
  }
  console.log(JSON.stringify({ ok: true, log }));
  await browser.close();
})().catch(e => { console.log(JSON.stringify({ ok: false, err: String(e).slice(0, 800) })); process.exit(1); });
