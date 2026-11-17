// The window menus on iOS and visionOS share the same game actions and selections.
function readPauseSettings(elements, directEntry) {
  // Duo keeps the advanced controls in the DOM so the menu can change mid-run.
  const available = node => node && (UI.dev || !node.closest('.dev-only'));
  const byID = id => { const node = document.getElementById(id); return available(node) ? node : null; };
  const app = byID('app'), nav = byID('menu').querySelector('nav'), pane = byID('mpane');
  const text = b => b.textContent.trim();
  const bind = (id, b) => { if (b) elements.set(id, b); return id; };
  const choice = (b, id) => ({ id: bind(id, b), title: text(b), on: b.classList.contains('on'),
    marked: b.classList.contains('now') || b.classList.contains('rec') });
  // The release menu removes developer sections from the DOM before the native controls start.
  const items = (parent, key) => Array.from(byID(parent)?.querySelectorAll('button:not([hidden])') ?? [],
    b => choice(b, key + ':' + b.dataset[key]));
  for (const id of ['m-go','m-top','mn','o-snd','o-lang','sw-vreset']) bind(id, byID(id));
  const sections = [...nav.querySelectorAll('button[data-sec]:not([hidden])')].filter(available).map(b => choice(b, 'nav:' + b.dataset.sec));
  const active = pane.querySelector('section.on')?.dataset.sec || 'view';
  const versions = Array.from(active === 'vers' ? byID('sw-vrows')?.children ?? [] : [], g => ({ title: text(g.firstElementChild),
    rows: [...g.querySelectorAll('.vrow')].map(r => ({ title: text(r.firstElementChild),
      options: [...r.querySelectorAll('button')].map(b => choice(b, 'version:' + b.dataset.vn + ':' + b.dataset.vid)) })) }));
  const mountain = pane.querySelector('[data-sec="mt"]');
  const daily = UI.dev ? mountain.querySelector('[data-daily]') : null;
  const mountains = [...byID('sw-skied').querySelectorAll('button[data-mtn]')].map(b =>
    ({ ...choice(b, 'mtn:' + b.dataset.mtn), detail: text(b.nextElementSibling) }));
  const record = byID('sw-daily'), wx = byID('sw-wx');
  const hasWeather = wx && !wx.hidden;
  bind('mountain:daily', daily); bind('mountain:new', UI.dev && mountain.querySelector('[data-new]'));
  return { sections, active,
    running: UI.state === 'run', direct: directEntry, english: I18N.en(), sound: !!Sound.on,
    times: items('sw-time','time'), weather: hasWeather ? items('sw-wxc','wx') : [],
    views: items('sw-view','view'), terrain: items('sw-seg','seg'),
    encounters: Array.from(byID('sw-ev')?.querySelectorAll('button') ?? [], b =>
      choice(b, 'animal' in b.dataset ? 'animal:' + b.dataset.animal : 'plane')),
    mountains, seed: byID('sw-seed')?.textContent.trim() ?? null, daily: !!daily?.classList.contains('on'),
    record: !record || record.hidden ? '' : [...record.childNodes].map(n => n.textContent.trim()).filter(Boolean).join(' · '),
    snowfall: typeof Weather === 'undefined' || !hasWeather ? '' :
      I18N.t(Weather.levels.find(([id]) => id === Weather.level)?.[1] || ''),
    quality: String(Quality.pick), tier: I18N.t(Quality.L.name), versions,
    help: [...pane.querySelectorAll('.keys.hand-only b')].filter(b => !b.classList.contains('fa-only') || app.classList.contains('fa'))
      .map(b => ({ title: text(b), detail: text(b.nextElementSibling) })) };
}
