// Draws the Apple icons. Nothing here is copied from a picture: the goggles, the snow
// field and the two ski symbols are shapes. Xcode compiles whatever is already in the
// asset catalogs, so ios/build-resources.sh runs this before that compile. The files
// it writes are gitignored.
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const root = path.join(__dirname, '..');

const FRAME = [0x3e, 0x45, 0x50, 255];
const LENS = [247, 244, 238, 255];
const STRIPE = [0x4c, 0x66, 0xaf, 255];
const STRAP = [0xdd, 0x5b, 0x59, 255];
const SNOW_TOP = [215, 237, 247];
const SNOW_BOTTOM = [141, 172, 194];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}
function png(w, h, rgba) {
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    const at = y * (1 + w * 4);
    raw[at] = 0;
    rgba.copy(raw, at + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function put(px, w, h, x, y, color) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const i = (y * w + x) * 4;
  const sa = color[3] / 255, da = px[i + 3] / 255, out = sa + da * (1 - sa);
  if (out <= 0) return;
  for (let c = 0; c < 3; c++) px[i + c] = Math.round((color[c] * sa + px[i + c] * da * (1 - sa)) / out);
  px[i + 3] = Math.round(out * 255);
}
function ellipse(px, w, h, cx, cy, rx, ry, color) {
  const x0 = Math.max(0, Math.floor(cx - rx)), x1 = Math.min(w - 1, Math.ceil(cx + rx));
  const y0 = Math.max(0, Math.floor(cy - ry)), y1 = Math.min(h - 1, Math.ceil(cy + ry));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry;
    if (u * u + v * v <= 1) put(px, w, h, x, y, color);
  }
}
function capsule(px, w, h, x0, y0, x1, y1, radius, color) {
  const dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy || 1;
  const minX = Math.max(0, Math.floor(Math.min(x0, x1) - radius));
  const maxX = Math.min(w - 1, Math.ceil(Math.max(x0, x1) + radius));
  const minY = Math.max(0, Math.floor(Math.min(y0, y1) - radius));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(y0, y1) + radius));
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    let t = ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2;
    if (t < 0) t = 0; else if (t > 1) t = 1;
    const px0 = x0 + t * dx, py0 = y0 + t * dy;
    const du = x + 0.5 - px0, dv = y + 0.5 - py0;
    if (du * du + dv * dv <= radius * radius) put(px, w, h, x, y, color);
  }
}
function inEllipse(x, y, cx, cy, rx, ry) {
  const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry;
  return u * u + v * v <= 1;
}

function goggles(size) {
  const px = Buffer.alloc(size * size * 4);
  const s = size / 1024;
  const L = { x: 390 * s, y: 512 * s }, R = { x: 634 * s, y: 512 * s };
  const outer = [175 * s, 128 * s], inner = [140 * s, 98 * s];
  capsule(px, size, size, 150 * s, 470 * s, 250 * s, 512 * s, 26 * s, STRAP);
  capsule(px, size, size, 774 * s, 512 * s, 874 * s, 470 * s, 26 * s, STRAP);
  capsule(px, size, size, 150 * s, 554 * s, 250 * s, 512 * s, 26 * s, STRAP);
  capsule(px, size, size, 774 * s, 512 * s, 874 * s, 554 * s, 26 * s, STRAP);
  ellipse(px, size, size, L.x, L.y, outer[0], outer[1], FRAME);
  ellipse(px, size, size, R.x, R.y, outer[0], outer[1], FRAME);
  capsule(px, size, size, L.x + 40 * s, 512 * s, R.x - 40 * s, 512 * s, 22 * s, FRAME);
  ellipse(px, size, size, L.x, L.y, inner[0], inner[1], LENS);
  ellipse(px, size, size, R.x, R.y, inner[0], inner[1], LENS);
  for (const eye of [L, R]) {
    for (const band of [-34, -6, 22]) {
      const y0 = eye.y + band * s, y1 = y0 + 12 * s;
      const x0 = Math.floor(eye.x - inner[0]), x1 = Math.ceil(eye.x + inner[0]);
      for (let y = Math.floor(y0); y < y1; y++) for (let x = x0; x <= x1; x++) {
        if (inEllipse(x, y, eye.x, eye.y, inner[0] - 8 * s, inner[1] - 8 * s)) put(px, size, size, x, y, STRIPE);
      }
    }
  }
  return px;
}

function snow(size) {
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const t = y / (size - 1);
    const rgb = SNOW_TOP.map((c, i) => Math.round(c + (SNOW_BOTTOM[i] - c) * t));
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      px[i] = rgb[0]; px[i + 1] = rgb[1]; px[i + 2] = rgb[2]; px[i + 3] = 255;
    }
  }
  return px;
}

function gogglesSvg() {
  const stripe = (cx, y) => `<rect x="${cx - 120}" y="${y}" width="240" height="12" fill="#4C66AF"/>`;
  const lens = (cx) => `<g>
    <ellipse cx="${cx}" cy="512" rx="175" ry="128" fill="#3E4550"/>
    <ellipse cx="${cx}" cy="512" rx="140" ry="98" fill="#F7F4EE"/>
    <clipPath id="lens${cx}"><ellipse cx="${cx}" cy="512" rx="132" ry="90"/></clipPath>
    <g clip-path="url(#lens${cx})">${[-34, -6, 22].map(b => stripe(cx, 512 + b)).join('')}</g>
  </g>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <g fill="#DD5B59" stroke="#DD5B59" stroke-width="52" stroke-linecap="round">
    <path d="M150 470 L250 512 L150 554"/>
    <path d="M874 470 L774 512 L874 554"/>
  </g>
  ${lens(390)}${lens(634)}
  <path d="M430 512 H594" stroke="#3E4550" stroke-width="44" stroke-linecap="round"/>
</svg>
`;
}

function skiJumpSvg() {
  // UIKit uses the SVG's intrinsic size inside the circular glass button.
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <circle cx="25.2" cy="3.8" r="2.7"/>
  <path d="M20.7 6.4 Q23.2 4.8 24.5 7.1 Q25.8 9.4 23.4 11
           L14 17.2 L8.3 28.2 Q7.4 30 5.8 29.2 Q4.3 28.4 5.1 26.7
           L12.3 12.2 Q12.7 11.5 13.5 11 Z"/>
  <path d="M2.6 34.8 L32 16 Q33.8 14.8 32.9 12.9" fill="none" stroke="#000"
        stroke-width="1.2" stroke-linecap="round"/>
</svg>
`;
}

function skiTuckSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="27" cy="7.2" r="3.9"/>
  <path d="M10.7 6 L18.3 5.3 Q20.9 5.1 22 7.6 L24.2 12 H28
           A1.7 1.7 0 0 1 28 15.4 H23 Q21.9 15.4 21.4 14.3 L20 11.7
           L13.9 12.2 L16.3 14.9 Q17.4 16.2 16.3 17.5 L12.4 21.8
           A1.7 1.7 0 0 1 9.9 19.5 L12.7 16.4 L8.5 11.8 Q7.6 10.8 7.6 9.3
           Q7.6 6.3 10.7 6 Z"/>
  <path d="M1.7 18.3 L18.2 27.5 Q19.8 28.4 20.8 27.8" fill="none" stroke="#000"
        stroke-width="1.4" stroke-linecap="round"/>
</svg>
`;
}

function writeIfChanged(rel, data) {
  const file = path.join(root, rel);
  const next = Buffer.isBuffer(data) ? data : Buffer.from(data);
  let prev = null;
  try { prev = fs.readFileSync(file); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  if (prev && prev.equals(next)) { console.log('kept', rel); return; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, next);
  console.log('wrote', rel, next.length, 'bytes');
}

const size = 1024;
writeIfChanged('visionos/App/Assets.xcassets/AppIcon.solidimagestack/Goggles.solidimagestacklayer/Content.imageset/Goggles.png', png(size, size, goggles(size)));
writeIfChanged('visionos/App/Assets.xcassets/AppIcon.solidimagestack/Snow.solidimagestacklayer/Content.imageset/Snow.png', png(size, size, snow(size)));
writeIfChanged('ios/App/AppIcon.icon/Assets/Goggles.svg', gogglesSvg());
writeIfChanged('ios/App/Assets.xcassets/SkiJump.imageset/SkiJump.svg', skiJumpSvg());
writeIfChanged('ios/App/Assets.xcassets/SkiTuck.imageset/SkiTuck.svg', skiTuckSvg());
