// ---------------------------------------------------------------- 集卡: where cards come from that the game already has
// A source watches something the game does anyway and says it to Cards.emit, once, by name. Nothing in the watched module changes.
// The other sources are the trials still being built; each sends one line when its moment comes (the names are the contract):
//   光圈 (92_rings.js):    Cards.emit('ring.line', { line: 'speed' | 'woods' | ..., full: true|false, t, missed })   a ring line ended
//                          Cards.emit('ring.secret', { id })                                                     a secret ring passed
//   小狐狸:                Cards.emit('fox.den', { den })                                                        the fox has led you home
// and anything else that wants a card: a new name, and a card whose rule is { type: 'event', name: '<that name>' } (19i_cardpack.js).
(() => {
  if (typeof Cards === 'undefined') return;
  // ---- animals met (08c_fauna.js, 08b_deer.js): one emit a meeting, when one of them is close by and fully in the world
  //   'animal.seen' { id: 'deer' | 'hare' | 'fox' | 'ibex' | 'eagle', d (metres) }
  let lastEv = null, deerSaid = false;
  const NEAR = { eagle: 140, deer: 70 }, near = id => NEAR[id] || 55;
  Cards.onStart(() => App.onTick.push(() => {
    if (!Cards.on || typeof Game === 'undefined' || Game.mode !== 'run') return;
    const p = Game.s.p, F = typeof Fauna !== 'undefined' ? Fauna : null;
    if (F && F.ev && F.ev !== lastEv && F.ev.id !== 'deer') {
      for (const a of F.live) { if (a.frozen || a.fade < 0.5 || !a.K) continue; const d = Math.hypot(a.pos[0] - p[0], a.pos[2] - p[2]); if (d < near(a.K.id)) { lastEv = F.ev; Cards.emit('animal.seen', { id: a.K.id, d }); break; } }
    }
    const herd = typeof Deer !== 'undefined' && Deer.herd ? Deer.herd.filter(a => !a.frozen) : [];
    if (!herd.length) deerSaid = false;
    else if (!deerSaid) for (const a of herd) { const d = Math.hypot(a.pos[0] - p[0], a.pos[2] - p[2]); if (d < near('deer')) { deerSaid = true; Cards.emit('animal.seen', { id: 'deer', d }); break; } }
  }));
})();
