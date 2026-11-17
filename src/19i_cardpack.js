// ---------------------------------------------------------------- 集卡: the first cards (试运行的一包，名字和地点都是样子，随时改)
// Only data. A card id is forever: rename a card freely, never reuse or change its id (the player's record is kept under it).
// A new card: a row in `cards`. A new album page: a row in `sets`. A new kind: a row in `kinds` (and, if it is drawn another way, a
// Cards.art in 19f_cardart.js). A new way to earn: a Cards.rule (19e_cards.js) or, much more often, just a new event name sent with
// Cards.emit by whatever has the moment (19h_cardsrc.js lists the names in use).
Cards.pack({
  kinds: {
    view: { zh: '风景卡', en: 'Views', art: 'scenery', glyph: 'ridge', facets: ['tod', 'wx'] },          // a place: collected again under each hour and weather
    animal: { zh: '动物卡', en: 'Animals', art: 'scene', glyph: 'paw', facets: ['tod'] },
    moment: { zh: '时刻卡', en: 'Moments', art: 'scene', glyph: 'star', facets: [] },
    route: { zh: '路线章', en: 'Routes', art: 'scene', glyph: 'ring', facets: ['gear'] },
    day: { zh: '今日卡', en: 'Days', art: 'scenery', glyph: 'lantern', facets: [] },
  },
  sets: {
    'hanyan-views': { zh: '寒烟山 · 风景', en: 'Mt Cold Smoke · Views', kind: 'view', mtn: 'hanyan' },
    'met': { zh: '偶遇', en: 'Met on the way', kind: 'animal' },
    'moments': { zh: '时刻', en: 'Moments', kind: 'moment' },
    'hanyan-routes': { zh: '寒烟山 · 路线', en: 'Mt Cold Smoke · Routes', kind: 'route', mtn: 'hanyan' },
    'days': { zh: '今日之山', en: "Today's mountain", kind: 'day', dev: true },
  },
  cards: [
    // ---- 寒烟山的风景: the places the designed run (经典编排, Course.ROUTE) opens out or closes in, reached on the run
    { id: 'hy-start', set: 'hanyan-views', zh: '云海之城', en: 'City in the cloud sea', when: { type: 'station', idx: 0, at: 0.25 }, hint: { zh: '出发的大坡上回头看', en: 'The first open slope' }, fact: { zh: '出发的大坡，云海里立着一座城', en: 'The first slope, a city standing in the clouds' } },
    { id: 'hy-outwood', set: 'hanyan-views', zh: '出林见城', en: 'Out of the woods', when: { type: 'station', idx: 2, at: 0.04 }, hint: { zh: '穿过第一段林道', en: 'Through the first forest lane' }, fact: { zh: '坡顶一翻，整条山谷都在眼前', en: 'Over the lip, the whole valley at once' } },
    { id: 'hy-glade', set: 'hanyan-views', zh: '林间漏景', en: 'Glade', when: { type: 'station', idx: 3, at: 0.45 }, hint: { zh: '树林中间', en: 'In the middle of the trees' }, fact: { zh: '树缝里漏出远处的山', en: 'Far hills through the trees' } },
    { id: 'hy-gully', set: 'hanyan-views', zh: '雪槽', en: 'The gully', when: { type: 'station', idx: 5, at: 0.45 }, hint: { zh: '墙比人高的地方', en: 'Where the walls stand taller than you' }, fact: { zh: 'U 型雪槽，一排树框住天', en: 'A U gully, trees framing the sky' } },
    { id: 'hy-ridge', set: 'hanyan-views', zh: '寒烟脊', en: 'Cold Smoke Ridge', when: { type: 'station', idx: 6, at: 0.35 }, hint: { zh: '最开阔的一道山脊', en: 'The widest ridge' }, fact: { zh: '山脊上，两侧都往下落', en: 'On the ridge, falling away on both sides' } },
    { id: 'hy-powder', set: 'hanyan-views', zh: '粉雪大坡', en: 'Powder field', when: { type: 'station', idx: 9, at: 0.2 }, hint: { zh: '第二段林道之后', en: 'After the second forest lane' }, fact: { zh: '出林就是一整面粉雪', en: 'Out of the trees into a whole face of powder' } },
    { id: 'hy-chute', set: 'hanyan-views', zh: '林中陡槽', en: 'The chute', when: { type: 'station', idx: 11, at: 0.55 }, hint: { zh: '一圈的最后', en: 'The end of the lap' }, fact: { zh: '窄、急、看不远', en: 'Narrow, steep, blind' } },
    // (the fox's den: the fox trial sends 'fox.den' when it has led the player there; until then only the dev buttons can)
    { id: 'hy-den', set: 'hanyan-views', zh: '狐狸的窝', en: "The fox's den", when: { type: 'event', name: 'fox.den' }, hint: { zh: '跟着小狐狸走', en: 'Follow the little fox' }, art: { type: 'scene', station: 9, at: 0.3, fx: 'den' }, fact: { zh: '小狐狸带你来的地方', en: 'Where the fox led you' } },
    { id: 'hy-all', set: 'hanyan-views', zh: '寒烟山全景', en: 'All of Cold Smoke', when: { type: 'count', set: 'hanyan-views' }, hint: { zh: '收齐这一页的风景', en: 'Every view on this page' }, art: { type: 'emblem', glyph: 'ridge' }, hidden: 'secret', facets: [] },

    // ---- animals met on the way (19h_cardsrc.js: 'animal.seen' as one comes close)
    { id: 'an-deer', set: 'met', zh: '鹿', en: 'Deer', art: { type: 'scene', station: 0, at: 0.45, fx: 'tracks', trail: 'deer' }, when: { type: 'event', name: 'animal.seen', match: { id: 'deer' } }, hint: { zh: '开阔的坡上，一群', en: 'On open slopes, a herd' } },
    { id: 'an-hare', set: 'met', zh: '雪兔', en: 'Snow hare', art: { type: 'scene', station: 1, at: 0.5, fx: 'tracks', trail: 'hare' }, when: { type: 'event', name: 'animal.seen', match: { id: 'hare' } }, hint: { zh: '林边突然窜出来', en: 'Breaks from the tree line' } },
    { id: 'an-fox', set: 'met', zh: '狐狸', en: 'Fox', art: { type: 'scene', station: 3, at: 0.4, fx: 'tracks', trail: 'fox' }, when: { type: 'event', name: 'animal.seen', match: { id: 'fox' } }, hint: { zh: '树林和雪道交界的地方', en: 'Where the trees give way to the run' } },
    { id: 'an-ibex', set: 'met', zh: '北山羊', en: 'Ibex', art: { type: 'scene', station: 6, at: 0.3, fx: 'tracks', trail: 'ibex' }, when: { type: 'event', name: 'animal.seen', match: { id: 'ibex' } }, hint: { zh: '站在高处看你', en: 'Watching from high ground' } },
    { id: 'an-eagle', set: 'met', zh: '金雕', en: 'Golden eagle', art: { type: 'scene', station: 6, at: 0.6, fx: 'soar' }, when: { type: 'event', name: 'animal.seen', match: { id: 'eagle' } }, hint: { zh: '抬头看', en: 'Look up' } },

    // ---- moments: the sky and the run
    { id: 'mo-aurora', set: 'moments', zh: '极光下', en: 'Under the aurora', art: { type: 'scene', station: 6, at: 0.35, fx: 'aurora' }, when: { type: 'all', of: [{ type: 'sky', aurora: true }, { type: 'stat', key: 'speed', gte: 5 }] }, hint: { zh: '夜里，天上有极光的时候', en: 'A night with the aurora' } },
    { id: 'mo-storm', set: 'moments', zh: '大雪里', en: 'In the storm', art: { type: 'scene', station: 9, at: 0.2, fx: 'storm' }, when: { type: 'all', of: [{ type: 'sky', wx: ['heavy'] }, { type: 'stat', key: 'speed', gte: 5 }] }, hint: { zh: '下大雪的时候', en: 'In heavy snow' } },
    { id: 'mo-flight', set: 'moments', zh: '飞二十米', en: 'Twenty metres of air', art: { type: 'scene', station: 4, at: 0.3, fx: 'arc' }, when: { type: 'stat', key: 'run.air', gte: 20 }, hint: { zh: '从跳台飞得够远', en: 'Fly far off a kicker' } },
    { id: 'mo-80', set: 'moments', zh: '时速八十', en: '80 km/h', art: { type: 'scene', station: 2, at: 0.3, fx: 'speed' }, when: { type: 'stat', key: 'run.vmax', gte: 80 / 3.6 }, hint: { zh: '一路不刹车', en: 'Let them run' } },

    // ---- ring lines on 寒烟山 (the ring trial sends 'ring.line' as a line ends; a full line earns its medal, stamped skis or board)
    { id: 'rt-speed', set: 'hanyan-routes', zh: '速降线', en: 'Downhill line', art: { type: 'scene', station: 0, at: 0.05, fx: 'rings' }, when: { type: 'event', name: 'ring.line', match: { line: 'speed', full: true } }, hint: { zh: '一个不漏串完速降线的光圈', en: 'Every ring of the downhill line' }, soon: false },
    { id: 'rt-woods', set: 'hanyan-routes', zh: '钻林线', en: 'Tree line', art: { type: 'scene', station: 3, at: 0.1, fx: 'rings-white' }, when: { type: 'event', name: 'ring.line', match: { line: 'woods', full: true } }, hint: { zh: '跟着白色的光圈钻进林子', en: 'Follow the white rings into the trees' } },
    { id: 'rt-secret', set: 'hanyan-routes', zh: '秘境', en: 'Hidden places', art: { type: 'scene', station: 5, at: 0.3, fx: 'secret' }, when: { type: 'event', name: 'ring.secret', count: 3 }, hint: { zh: '找到三个秘境圈', en: 'Find three secret rings' } },
  ],
});

// ---- 今日之山: one card a day, made from the day's own mountain (Cards.gen). Today's is got by skiing 1 km of it; the days already got stay
// in the album (their cards are made again from the record, drawn as an emblem once their mountain is gone). Dev only, like 今日之山 itself.
Cards.gen('days', function () {
  if (typeof App === 'undefined' || !App.today || !App.dailySeed) return [];
  const today = App.today(), out = [], days = new Set([today]);
  for (const id of Object.keys(Cards.record().got)) { const m = /^day-(\d+)$/.exec(id); if (m) days.add(+m[1]); }
  for (const d of [...days].sort((a, b) => b - a)) {
    const lab = App.dayLabel ? App.dayLabel(d, false) : String(d), labEn = App.dayLabel ? App.dayLabel(d, true) : String(d);
    out.push({ id: 'day-' + d, set: 'days', dev: true, seed: App.dailySeed(d), zh: '今日之山 · ' + lab, en: "Today's mountain · " + labEn,
      when: d === today ? { type: 'stat', key: 'run.dist', gte: 1000 } : null, art: { type: 'scenery', s: 600, u: 0 },
      hint: d === today ? { zh: '在今天的山上滑一公里', en: "Ski 1 km of today's mountain" } : null, fact: { zh: '第 ' + App.dailySeed(d) + ' 号山', en: 'Mountain no. ' + App.dailySeed(d) } });
  }
  return out;
});
