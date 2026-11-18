// 覆盖矩阵：评分器每次都跑的全部场景（不管这次改了哪个动作，全部都跑）。
// 用户 2026-11-17 23:05 UTC：“要把所有它可能出现的动作都评判……至少要非常好的 coverage”。
//
// 怎么来的：几类“操作”（BASES，每一类练一组动作卡）× 滑具（双板 / 单板）× 地形 × 滑手风格。全排列几千个，
// 所以用“两两覆盖”挑：下面 PAIRS 里列的每一对维度，每一种搭配至少出现一次；再加 EXTREME 里最容易出事的几种。
// 速度高低、跳的高低、弯的大小不在这里硬定：录完以后按实际测到的速度 / 腾空时间 / 弯的周期分档，报告里的覆盖表
// 会显示每一档实际有多少样本，缺的格子标出来（见 score.js 的 coverage）。
// 雪况：游戏里现在有的是压雪道（bowl、steeps）、粉雪（powder）、蘑菇、波浪地、U 型槽；没有冰面。

// 每类操作：ctl 是 record.js 里的操作脚本；segs = 可以换的地形（第一个是默认）；fam = 属于哪一族（风格搭配按族覆盖）；cards = 主要练哪些动作卡
const BASES = [
  { id: 'start', ctl: 'none', segs: [null], s0: 14, dur: 14, fam: 'go', cards: ['start', 'glide'] },
  { id: 'glide', ctl: 'none', segs: ['bowl', 'steeps', 'powder'], dur: 20, fam: 'go', cards: ['glide', 'tuck'] },
  { id: 'tuck', ctl: 'tuck', segs: ['steeps'], dur: 24, fam: 'go', cards: ['tuck', 'turn'] },
  { id: 'turnS', ctl: 'keys', per: 1.3, segs: ['bowl', 'steeps', 'powder'], dur: 24, fam: 'turn', cards: ['turn', 'edge'] },
  { id: 'turnM', ctl: 'keys', per: 2.6, segs: ['bowl', 'steeps', 'powder'], dur: 30, fam: 'turn', cards: ['turn', 'edge'] },
  { id: 'turnL', ctl: 'keys', per: 4.4, segs: ['steeps', 'bowl', 'powder'], dur: 34, fam: 'turn', cards: ['turn', 'edge'] },
  { id: 'deepM', ctl: 'keysDeep', per: 2.6, segs: ['bowl', 'steeps', 'powder'], dur: 30, fam: 'turn', cards: ['carve', 'edge'] },
  { id: 'deepS', ctl: 'keysDeep', per: 1.6, segs: ['bowl', 'steeps'], dur: 24, fam: 'turn', cards: ['carve', 'edge'] },
  { id: 'deepHold', ctl: 'holdDeep', segs: ['steeps', 'bowl'], dur: 12, fam: 'turn', cards: ['carve'] },
  { id: 'touch', ctl: 'sine', per: 3.0, amp: 0.6, segs: ['bowl', 'powder'], dur: 30, fam: 'turn', cards: ['turn', 'edge'] },
  { id: 'turnback', ctl: 'turnback', per: 5.0, hold: 1.4, segs: ['bowl'], dur: 30, fam: 'turn', cards: ['turn', 'glide'] },
  { id: 'kick', ctl: 'jump', segs: ['kickers'], dur: 60, fam: 'air', cards: ['takeoff', 'air', 'land'] },
  { id: 'hops', ctl: 'hops', per: 3.0, segs: ['bowl', 'powder'], dur: 30, fam: 'air', cards: ['takeoff', 'land'] },
  { id: 'charge', ctl: 'charge', per: 3.0, hold: 0.6, segs: ['bowl'], dur: 24, fam: 'air', cards: ['takeoff', 'air', 'land'] },
  { id: 'standjump', ctl: 'charge', per: 3.0, hold: 0.6, segs: [null], s0: 14, dur: 18, fam: 'air', cards: ['takeoff', 'land'] },
  { id: 'rollers', ctl: 'sine', per: 4.0, amp: 0.35, segs: ['rollers'], dur: 30, fam: 'terrain', cards: ['land', 'turn'] },
  { id: 'moguls', ctl: 'keys', per: 1.1, segs: ['moguls'], dur: 30, fam: 'terrain', cards: ['terrain', 'turn'] },
  { id: 'gully', ctl: 'sine', per: 3.0, amp: 0.5, segs: ['gully'], dur: 30, fam: 'terrain', cards: ['turn', 'terrain'] },
  { id: 'stopLow', ctl: 'brakeAt', acc: 3, side: 1, segs: ['bowl'], dur: 14, fam: 'stop', cards: ['stop'] },
  { id: 'stopMid', ctl: 'brakeAt', acc: 7, side: -1, segs: ['bowl', 'steeps'], dur: 18, fam: 'stop', cards: ['stop'] },
  { id: 'stopHigh', ctl: 'brakeAt', acc: 12, side: 1, segs: ['steeps'], dur: 22, fam: 'stop', cards: ['stop'] },
  { id: 'foreaft', ctl: 'fa', per: 2.6, segs: ['bowl'], dur: 30, fam: 'turn', cards: ['tuck', 'turn'] },
];
// 滑手风格：双板 rski a–g，单板 rboard a–d（08i_labride.js 的版本；a 是默认）
const STYLES = { ski: 'abcdefg'.split(''), board: 'abcd'.split('') };
const GEARS = ['ski', 'board'];
// 必须两两出现的维度对
const PAIRS = [['base', 'gear'], ['base', 'seg'], ['fam', 'style'], ['gear', 'seg']];
// 最容易出事的极端情况（固定加上）
const EXTREME = [
  { base: 'deepHold', gear: 'ski', seg: 'steeps', style: 'b', why: '高速深压不放（Reilly 版）' },
  { base: 'deepS', gear: 'ski', seg: 'steeps', style: 'd', why: '高速快节奏深压（Henrik 甩雪版）' },
  { base: 'kick', gear: 'board', seg: 'kickers', style: 'c', why: '单板高空落地' },
  { base: 'stopHigh', gear: 'board', seg: 'steeps', style: 'a', why: '单板高速急刹' },
  { base: 'turnL', gear: 'ski', seg: 'bowl', style: 'a', s0: 14, why: '低速大弯（刚出发）' },
  { base: 'moguls', gear: 'ski', seg: 'moguls', style: 'g', why: '蘑菇地快节奏（Eder 版）' },
];

function build() {
  const val = (c, k) => k === 'fam' ? BASES.find(b => b.id === c.base).fam : c[k];
  const need = new Set(), key = (a, b, x, y) => a + '=' + x + '|' + b + '=' + y;
  // 每对维度要覆盖的全部搭配（只算合法的：地形要是这类操作能用的，风格要属于这个滑具）
  const legal = [];
  for (const b of BASES) for (const g of GEARS) for (const s of b.segs) for (const st of STYLES[g]) legal.push({ base: b.id, gear: g, seg: s, style: st });
  for (const c of legal) for (const [a, b] of PAIRS) need.add(key(a, b, val(c, a), b === 'style' ? val(c, 'gear') + val(c, b) : val(c, b)));
  const covers = c => PAIRS.map(([a, b]) => key(a, b, val(c, a), b === 'style' ? val(c, 'gear') + val(c, b) : val(c, b)));
  const out = [];
  const take = c => { out.push(c); for (const k of covers(c)) need.delete(k); };
  for (const e of EXTREME) take(Object.assign({ extreme: true }, e));
  // 贪心：每次挑能多盖住几个还没覆盖的搭配的那一个（同分时按列表顺序，结果每次一样）
  while (need.size) {
    let best = null, bs = 0;
    for (const c of legal) { const s = covers(c).filter(k => need.has(k)).length; if (s > bs) { bs = s; best = c; } }
    if (!best) break; take(best);
  }
  return out.map(c => {
    const b = BASES.find(x => x.id === c.base), q = c.gear === 'board' ? `v-ride=b&v-rboard=${c.style}` : `v-ride=a&v-rski=${c.style}`;
    return Object.assign({}, b, { id: `${c.base}.${c.gear}.${c.seg || 'start'}.${c.style}`, base: c.base, gear: c.gear, seg: c.seg, style: c.style, q, s0: c.s0 || b.s0 || 60, extreme: !!c.extreme, why: c.why || '', note: `${b.id} · ${c.gear === 'board' ? '单板' : '双板'} · ${c.seg || '出发处'} · 风格 ${c.style}${c.why ? ' · ' + c.why : ''}` });
  });
}
module.exports = { BASES, STYLES, PAIRS, EXTREME, build };
if (require.main === module) { const L = build(); console.log(L.length, '个场景，游戏时间', (L.reduce((s, c) => s + c.dur, 0) / 60).toFixed(1), '分钟'); for (const c of L) console.log(c.id.padEnd(34), c.dur + 's', c.why); }
