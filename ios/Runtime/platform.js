// Read the Duo preference before the game initializes its menu and equipment.
self.COLD_SMOKE = {
  nativeWindow: true,
  renderer: 'Apple Metal',
  autoQualityKey: 'cs.q.wk.metal.gpu',
  advancedMenuKey: 'cs.ios.advancedMenu',
  dev: false
};
try {
  self.COLD_SMOKE.dev = localStorage.getItem(self.COLD_SMOKE.advancedMenuKey) === 'on';
} catch {}
