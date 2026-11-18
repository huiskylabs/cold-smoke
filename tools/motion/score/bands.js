// 每条指标的“及格范围”和可信度。
//   R 开头的：从专业滑手视频量出来的（refs.json，refs_build.js 生成），取 10%–90% 分位，再各放宽视频的误差；
//   F / E 开头的：文献或真人动捕定的，带“估”的是初始估计，以后用动捕和专业视频再校。
// 规矩（评审文档“专业参考从哪来”）：如果真人动捕或专业视频自己都过不了某条范围，说明范围错了，改范围，不改动作；
// 改范围要单独提交、写明理由，不能和动作改动混在一起。
// conf：1 = 专业滑雪实测，0.6 = 相近动作或视频量的，0.3 = 估的。w = 偏出范围多少算 0 分（默认 = 范围宽度）。
const refs = require('./refs.json');
const pct = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))]; };
const from = (rows, k, pad, minW) => { const xs = rows.map(r => r[k]).filter(x => x != null && isFinite(x)); if (xs.length < 3) return null; const lo = pct(xs, 0.1) - pad, hi = pct(xs, 0.9) + pad; return { r: [lo, hi], w: Math.max(minW || 0, hi - lo), n: xs.length }; };
const riders = rows => [...new Set(rows.map(r => r.rider || r.clip))].join('、');

const T = refs.turns.filter(r => !r.kind && r.incl < 85);          // （Henrik 猛犸 1.2 s 那一行倾角 90°、反弓 167°，是空中，不算）
const TR = { ski: T.filter(r => r.gear === 'ski'), board: T.filter(r => r.gear === 'board') };
const CARVE = { ski: T.filter(r => r.rider === 'Reilly McGlashan'), board: TR.board };
const K = { ski: refs.tricks.filter(r => r.gear === 'ski'), board: refs.tricks.filter(r => r.gear === 'board') };
const KT = { ski: K.ski.filter(r => !r.slowmo), board: K.board.filter(r => !r.slowmo) };

const R_TURN = {     // [refs 里的字段, 名字, 放宽, 最小宽度]
  Rincl: ['incl', '弯中倾角（度）', 5, 10], RkLong: ['kLong', '外腿（伸直那条）膝角', 5, 10], RkShort: ['kShort', '内腿（收起那条）膝角', 5, 10],
  RhipH: ['hipH', '髋到踝的长度 / 腿长', 0.03, 0.06], RhandH: ['handH', '手比髋高多少 / 腿长', 0.05, 0.1], Rspr: ['spr', '两手宽度 / 腿长', 0.05, 0.1],
  Rtwist: ['twist', '肩线对髋线扭了多少（度）', 5, 10],
};
const R_TRICK = { RpopK: ['popK', '离雪那一刻的膝角', 5, 10, false], RcrouchK: ['crouchK', '起跳前下蹲最深的膝角', 5, 10, false], RlandK: ['landK', '落地后最深的膝角', 5, 10, false], Rabsorb: ['absorb', '触雪到蹲到最深用了几秒', 0.05, 0.15, true] };

const FIXED = {
  F1: { r: [0, 10], zh: '每分钟突变次数', conf: 1, src: '真人动捕同一把尺约 8 次（tools/motion/README.md）' },
  F3k: { r: [0, 600], w: 300, zh: '膝角速度 99% 分位（度/秒）', conf: 0.3, src: '估' },
  F3h: { r: [0, 300], w: 150, zh: '头转速 99% 分位（度/秒）', conf: 0.3, src: '估' },
  F4: { r: [0, 8], w: 8, zh: '手、头、髋一帧内的跳变（毫米/帧²）', conf: 0.6, src: '估：相当于一帧跳 1 cm 左右' },
  F6: { r: [0, 0.2], w: 0.1, zh: '上身比身体倾角晚多少秒（腿先动）', conf: 0.3, src: '估' },
  F7: { r: [0, 0.15], w: 0.15, zh: '按键到身体倾斜的延迟（秒）', conf: 0.6, src: '估；Lonely Mountains 文章：手感先于一切' },
  R0: { r: [0, 5], w: 10, zh: '身体倾角和物理算出的倾角差（度）', conf: 1, src: '物理：倾角由速度和转弯半径决定' },
  E1: { r: [0, 0.35], w: 0.35, zh: '胸口摆动 / 行进方向摆动', conf: 0.3, src: '估；教学：上身朝坡下、安静' },
  E2: { r: [0, 2], w: 2, zh: '直滑时头上下颠（cm）', conf: 0.3, src: '估' },
  E3el: { r: [20, 60], w: 20, zh: '弯中手肘角（双板）', conf: 0.6, src: '今天定的：手臂微弯，不僵直、不夹紧' },
  E3fwd: { r: [0.25, 0.45], w: 0.15, zh: '手在胸前多远（米）', conf: 0.3, src: '估' },
  E4: { r: [0.2, 0.5], w: 0.2, zh: '一个弯里外膝几乎不动的时间占比', conf: 0.6, src: 'Alhammoud 2020：外膝约 34% 的时间几乎不动' },
  E5: { r: [0, 0.1], w: 0.1, zh: '左弯和右弯的差别（相对）', conf: 0.6, src: '估' },
  Estill: { r: [0, 2], w: 2, zh: '停稳后身体还晃多少（cm）', conf: 0.3, src: '估' },
};
const cache = {};
function get(id, gear, card) {
  const k = id + '|' + gear + '|' + card; if (k in cache) return cache[k];
  let b = null;
  if (FIXED[id]) b = Object.assign({}, FIXED[id]);
  else if (R_TURN[id]) { const [f, zh, pad, mw] = R_TURN[id], rows = (card === 'carve' ? CARVE : TR)[gear]; const x = from(rows, f, pad, mw); if (x) b = Object.assign(x, { zh, conf: 0.6, src: '专业视频（' + riders(rows) + '），' + x.n + ' 个弯' }); }
  else if (R_TRICK[id]) { const [f, zh, pad, mw, timing] = R_TRICK[id], rows = (timing ? KT : K)[gear]; const x = from(rows, f, pad, mw); if (x) b = Object.assign(x, { zh, conf: 0.6, src: '教练示范（' + [...new Set(rows.map(r => r.clip))].length + ' 段' + (timing ? '，不含慢动作' : '') + '）' }); }
  return cache[k] = b;
}
// 手骨 Y 轴（前臂 × 杖）和身体右方向的点积符号：正确握杖时左右手各是哪个符号。用默认人物起步时定一次（见 README）
const HAND_SIGN = 1;
module.exports = { get, HAND_SIGN, FIXED, R_TURN, R_TRICK };
