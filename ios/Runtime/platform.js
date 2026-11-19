// Read each platform's preference before the shared menu and equipment initialize.
self.COLD_SMOKE = {
  ...self.COLD_SMOKE,
  nativeWindow: true,
  renderer: 'Apple Metal',
  autoQualityKey: self.COLD_SMOKE?.spatial ? 'cs.q.vision' : 'cs.q.wk.metal.gpu',
  advancedMenuKey: self.COLD_SMOKE?.spatial ? 'cs.vision.advancedMenu' : 'cs.ios.advancedMenu',
  dev: false
};
try {
  self.COLD_SMOKE.dev = localStorage.getItem(self.COLD_SMOKE.advancedMenuKey) === 'on';
} catch {}
