// 把 Mac 上从专业滑手视频量出来的两份汇总（refs/turns_summary.txt、refs/tricks_summary.txt）转成 refs.json。
//   node tools/motion/score/refs_build.js
// 只收"可信"的段：汇总里标 FAILED 的整段不要；技巧里标了慢动作的，只取角度，不取时间。
// 数字的来源和量法见两份汇总文件开头的说明（MediaPipe heavy + 跟拍裁切，脚本在 Mac 的 human/video_tricks/scripts/）。
const fs = require('fs'), path = require('path');
const D = path.join(__dirname, 'refs');

function turns() {
  const txt = fs.readFileSync(path.join(D, 'turns_summary.txt'), 'utf8').split('\n');
  const out = []; let cur = null;
  for (const ln of txt) {
    let m = ln.match(/^== (\S+)\s+\[(.+?) \((ski|board)\)\](.*)$/);
    if (m) { cur = { clip: m[1], rider: m[2], gear: m[3], failed: /FAILED/.test(m[4]), pro: !/owner/.test(m[2]) }; continue; }   // pro: 只收职业滑手（用户的规矩），不收用户自己的片子
    if (!cur) continue;
    m = ln.match(/^\s+period (\S+) s \| edge changes \[(.*?)\] \| ecdur \[(.*?)\] \| knee@ec \[(.*?)\]/);
    if (m) { const num = s => s.split(',').map(Number).filter(x => isFinite(x) && s.trim()); cur.period = m[1] === 'None' ? null : +m[1]; cur.ecdur = num(m[3]); cur.kneeEc = num(m[4]);
      if (!cur.failed && cur.pro) out.push({ clip: cur.clip, rider: cur.rider, gear: cur.gear, kind: 'clip', period: cur.period, ecdur: cur.ecdur, kneeEc: cur.kneeEc }); continue; }
    m = ln.match(/^\s+(-?[\d.]+)\s+([+-]?\d+)\s+([+-]?\d+)\s+(\d+)\s+(\d+)\s+(-?[\d.]+)\s+([\d.]+)\s+([+-]?\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(toe|heel)?\s*$/);
    if (m && !cur.failed && cur.pro) out.push({ clip: cur.clip, rider: cur.rider, gear: cur.gear, period: cur.period, t0: +m[1], incl: Math.abs(+m[2]), ang: +m[3], kLong: +m[4], kShort: +m[5], handH: +m[6], spr: +m[7], twist: Math.abs(+m[8]), pump: +m[9], hipH: +m[10], dur: +m[11], edge: m[12] || null });
  }
  return out;
}
function tricks() {
  const txt = fs.readFileSync(path.join(D, 'tricks_summary.txt'), 'utf8').split('\n');
  const out = []; let gear = null;
  for (const ln of txt) {
    if (/= SKI =/.test(ln)) gear = 'ski'; else if (/= BOARD =/.test(ln)) gear = 'board';
    if (!gear || /^move\s/.test(ln) || /FAILED/.test(ln)) continue;
    const m = ln.match(/^(.{26})\s(\S+)\s+([\d.]+-[\d.]+)\s+(.{14})\s+(\d+)\s+(\d+)\s+([\d.]+)\s+(\d+)\s+(\d+)\s+(\S+)\s+([+-]?\d+)\s+(\d+)\s+([\d.]+)\s+(\d+)\s+([\d.]+)/);
    if (!m) continue;
    const cam = m[4].trim(), slo = /\bsl|slo|slow/.test(cam) || /^transworld|old-school-backscratcher|safety-mute/.test(m[2]);   // 慢动作：汇总末尾的 NOTES 列的那些
    out.push({ gear, move: m[1].trim(), clip: m[2], range: m[3], cam, slowmo: slo, crouchK: +m[5], popK: +m[6], air: slo ? null : +m[7], tuck: +m[8], kAir: +m[9], twist: m[10], landK: +m[12], absorb: slo ? null : +m[13], armV: +m[14], rel: +m[15] });
  }
  return out;
}
const refs = { about: 'Pro rider / coach demo numbers measured on the owner Mac (MediaPipe). Angles in deg, knee 0 = straight; image-plane angles carry about ±5-8° camera bias.', turns: turns(), tricks: tricks() };
fs.writeFileSync(path.join(__dirname, 'refs.json'), JSON.stringify(refs, null, 1));
console.log('turn rows', refs.turns.filter(r => !r.kind).length, 'clips', refs.turns.filter(r => r.kind).length, 'tricks', refs.tricks.length);
