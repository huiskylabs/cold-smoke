// 把两张截图的差放大 4 倍画成一张图，并打印差别落在画面的哪几行哪几列（各分 10 份）。
// 用法: node pngdiff.js a.png b.png out.png [x y w h]
//   给了 x y w h 时，另外输出 out 同名加 -crop 的图：两张图的这块区域放大 3 倍左右并排（左 a 右 b），用来肉眼对比。
const { chromium } = require('playwright'), fs = require('fs');
(async () => {
  const [a, b, out, cx, cy, cw, ch] = process.argv.slice(2);
  const br = await chromium.launch(); const p = await br.newPage();
  const A = 'data:image/png;base64,' + fs.readFileSync(a).toString('base64'), B = 'data:image/png;base64,' + fs.readFileSync(b).toString('base64');
  const r = await p.evaluate(async ([A, B, R]) => {
    const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
    const ia = await ld(A), ib = await ld(B); const w = ia.width, h = ia.height;
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, w, h); x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, w, h);
    const o = x.createImageData(w, h); const rows = new Array(10).fill(0), cols = new Array(10).fill(0);
    for (let i = 0; i < w * h; i++) { const d = Math.max(Math.abs(da.data[i*4]-db.data[i*4]), Math.abs(da.data[i*4+1]-db.data[i*4+1]), Math.abs(da.data[i*4+2]-db.data[i*4+2])); const v = Math.min(255, d * 4); o.data[i*4]=v; o.data[i*4+1]=v; o.data[i*4+2]=v; o.data[i*4+3]=255; if (d > 8) { rows[Math.floor((i / w | 0) * 10 / h)]++; cols[Math.floor((i % w) * 10 / w)]++; } }
    x.putImageData(o, 0, 0); const png = c.toDataURL(); let crop = null;
    if (R) { const [X, Y, W, H] = R, k = 3; c.width = W * k * 2 + 6; c.height = H * k; x.imageSmoothingEnabled = false; x.fillStyle = '#f0f'; x.fillRect(0, 0, c.width, c.height); x.drawImage(ia, X, Y, W, H, 0, 0, W * k, H * k); x.drawImage(ib, X, Y, W, H, W * k + 6, 0, W * k, H * k); crop = c.toDataURL(); }
    return { w, h, rows, cols, png, crop };
  }, [A, B, cx != null ? [+cx, +cy, +cw, +ch] : null]);
  fs.writeFileSync(out, Buffer.from(r.png.split(',')[1], 'base64')); if (r.crop) fs.writeFileSync(out.replace(/\.png$/, '-crop.png'), Buffer.from(r.crop.split(',')[1], 'base64')); console.log(JSON.stringify({ w: r.w, h: r.h, rows: r.rows, cols: r.cols }));
  await br.close();
})();
