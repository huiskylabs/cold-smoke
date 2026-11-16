// The window menus on iOS and visionOS share the same game actions and selections.
function readPauseSettings(elements, directEntry) {
  const byID = id => document.getElementById(id);
  const app = byID('app'), nav = byID('menu').querySelector('nav'), pane = byID('mpane');
  const text = b => b.textContent.trim();
  const bind = (id, b) => { if (b) elements.set(id, b); return id; };
  const choice = (b, id) => ({ id: bind(id, b), title: text(b), on: b.classList.contains('on'),
    marked: b.classList.contains('now') || b.classList.contains('rec') });
  const items = (parent, key) => Array.from(byID(parent).querySelectorAll('button:not([hidden])'),
    b => choice(b, key + ':' + b.dataset[key]));
  for (const id of ['m-go','m-top','mn','o-snd','o-lang','sw-vreset']) bind(id, byID(id));
  const sections = [...nav.querySelectorAll('button[data-sec]:not([hidden])')].map(b => choice(b, 'nav:' + b.dataset.sec));
  const versions = [...byID('sw-vrows').children].map(g => ({ title: text(g.firstElementChild),
    rows: [...g.querySelectorAll('.vrow')].map(r => ({ title: text(r.firstElementChild),
      options: [...r.querySelectorAll('button')].map(b => choice(b, 'version:' + b.dataset.vn + ':' + b.dataset.vid)) })) }));
  const mountain = pane.querySelector('[data-sec="mt"]');
  const daily = mountain.querySelector('[data-daily]');
  bind('mountain:daily', daily); bind('mountain:new', mountain.querySelector('[data-new]'));
  return { sections, active: pane.querySelector('section.on')?.dataset.sec || 'sky',
    running: UI.state === 'run', direct: directEntry, english: I18N.en(), sound: !!Sound.on,
    times: items('sw-time','time'), weather: byID('sw-wx').hidden ? [] : items('sw-wxc','wx'),
    views: items('sw-view','view'), terrain: items('sw-seg','seg'),
    encounters: [...byID('sw-ev').querySelectorAll('button')].map(b =>
      choice(b, 'animal' in b.dataset ? 'animal:' + b.dataset.animal : 'plane')),
    seed: text(byID('sw-seed')), daily: daily.classList.contains('on'),
    record: byID('sw-daily').hidden ? '' : [...byID('sw-daily').childNodes].map(n => n.textContent.trim()).filter(Boolean).join(' · '),
    snowfall: typeof Weather === 'undefined' || byID('sw-wx').hidden ? '' :
      I18N.t(Weather.levels.find(([id]) => id === Weather.level)?.[1] || ''),
    quality: String(Quality.pick), tier: I18N.t(Quality.L.name), versions,
    help: [...pane.querySelectorAll('.keys.hand-only b')].filter(b => !b.classList.contains('fa-only') || app.classList.contains('fa'))
      .map(b => ({ title: text(b), detail: text(b.nextElementSibling) })) };
}
