// renders the human lab to video frames and stills (run on a machine with a real GPU):
//   node human/build.js && node human/tools/render.js <outdir>
// needs playwright (npm i playwright) and ffmpeg on the PATH. Writes:
//   人体_转台.mp4         the A-pose body turning once (skin)
//   人体_姿势轮播.mp4     every stress pose in turn, skinning c, the camera turning slowly
//   人体_蒙皮对比.png     six hard poses x skinning a / b / c (clay), the volume change under each
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const out = path.resolve(process.argv[2] || 'human-renders'); fs.mkdirSync(out, { recursive: true });
const page = 'file://' + path.resolve(__dirname, '..', 'dist', 'lab.html');
(async () => {
  const FAST = process.env.FAST === '1';            // (a quick check: a few frames only)
  const b = await chromium.launch({ headless: true, args: process.platform === 'darwin' ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const open = async (q, w, h) => {
    const pg = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    pg.on('pageerror', e => console.log('page error', e.message));
    await pg.goto(page + '?capture=1&ui=0&spin=0&' + q);
    await pg.waitForFunction(() => window.__lab && window.__lab.ready, null, { timeout: 300000 });
    await pg.addStyleTag({ content: '#toggle,#status{display:none}' });
    return pg;
  };
  const video = async (name, frames, q, step, extra = {}) => {
    const dir = path.join(out, name + '_frames'); fs.mkdirSync(dir, { recursive: true });
    const pg = await open(q, 1080, 1350);
    for (let f = 0; f < frames; f++) {
      await pg.evaluate(step, Object.assign({ f }, extra));
      await pg.screenshot({ path: path.join(dir, String(f).padStart(4, '0') + '.png') });
      if (f % 30 === 0) console.log(name, f, '/', frames);
    }
    await pg.close();
    execSync(`ffmpeg -y -loglevel error -framerate 30 -i "${dir}/%04d.png" -c:v libx264 -pix_fmt yuv420p -crf 17 "${path.join(out, name + '.mp4')}"`);
    fs.rmSync(dir, { recursive: true });
  };
  // 1. turntable, 8 s
  await video('人体_转台', FAST ? 6 : 240, 'pose=apose&look=skin&pitch=0.08', async ({ f }) => { const st = window.__lab; st.yaw = -0.5 + f / 240 * Math.PI * 2; st.clock = f * 33.3; st.renderFrame(st.clock); });
  // 2. poses, 2.2 s each (0.9 s moving, then held), camera turning slowly
  const poses = await (async () => { const pg = await open('', 200, 200); const p = await pg.evaluate(() => Human.POSES.map(p => p.name)); await pg.close(); return p; })();
  const per = FAST ? 3 : 66;
  await video('人体_姿势轮播', poses.length * per, 'pose=apose&look=skin&mode=c&pitch=0.1', async ({ f, per, poses }) => {
    const st = window.__lab; st.clock = f * 33.3; if (f % per === 0) { st.poseDur = 900; await st.goPose(poses[(f / per + 1) % poses.length]); }
    st.yaw = -0.6 + Math.sin(f / 300 * Math.PI) * 0.9; st.renderFrame(st.clock);
  }, { per, poses });
  // 3. comparison sheet: poses x a / b / c, clay
  const show = FAST ? ['squat', 'carve'] : ['squat', 'carve', 'overhead', 'twist', 'tuck', 'bend'], W = 420, H = 560, cells = [];
  const pg = await open('look=clay&yaw=-0.6&pitch=0.12', W, H);
  for (const p of show) for (const m of ['a', 'b', 'c']) {
    const vol = await pg.evaluate(async ([p, m]) => { const st = window.__lab; st.mode = m; st.cache.clear(); st.poseDur = 1; st.clock = (st.clock || 0) + 1000; await st.goPose(p); st.clock += 1000; st.renderFrame(st.clock); st.renderFrame(st.clock + 16);
      const g = st.built, v = m === 'c' ? st.curP.vol : Human.Mesh.volume(g.pos, g.idx); return (100 * (v / g.vol0 - 1)).toFixed(1); }, [p, m]);
    const f = path.join(out, `_cell_${p}_${m}.png`); await pg.screenshot({ path: f }); cells.push([f, p, m, vol]);
  }
  await b.close();
  fs.writeFileSync(path.join(out, '_cells.json'), JSON.stringify(cells));
  // stitch with ffmpeg (no image library needed): one row per pose
  const rows = show.map(p => { const r = cells.filter(c => c[1] === p).map(c => c[0]); const o = path.join(out, `_row_${p}.png`);
    execSync(`ffmpeg -y -loglevel error ${r.map(f => `-i "${f}"`).join(' ')} -filter_complex "hstack=inputs=3" "${o}"`); return o; });
  execSync(`ffmpeg -y -loglevel error ${rows.map(f => `-i "${f}"`).join(' ')} -filter_complex "vstack=inputs=${rows.length}" "${path.join(out, '人体_蒙皮对比.png')}"`);
  for (const c of cells) fs.rmSync(c[0]); for (const r of rows) fs.rmSync(r);
  console.log('volume change (%) per pose, a / b / c:'); for (const p of show) console.log(p, cells.filter(c => c[1] === p).map(c => c[3]).join(' / '));
  console.log('done ->', out);
})();
