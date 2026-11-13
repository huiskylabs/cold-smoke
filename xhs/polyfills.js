// 小红书 小工具: the package must run on Chrome 61 (Android 8.1 WebView). esbuild lowers the syntax; these are the few library calls
// the game makes that Chrome 61 does not have. Each is only added where it is missing.
(function () {
  function at(i) { i = Math.trunc(i) || 0; if (i < 0) i += this.length; return i < 0 || i >= this.length ? undefined : this[i]; }
  var protos = [Array.prototype, String.prototype];
  ['Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array'].forEach(function (n) { if (typeof self[n] === 'function') protos.push(self[n].prototype); });
  protos.forEach(function (p) { if (!p.at) Object.defineProperty(p, 'at', { value: at, writable: true, configurable: true }); });
  if (!Array.prototype.flat) Object.defineProperty(Array.prototype, 'flat', { configurable: true, writable: true, value: function flat(d) {
    d = d === undefined ? 1 : Math.trunc(d) || 0; var r = [];
    (function go(a, k) { for (var i = 0; i < a.length; i++) { if (!(i in a)) continue; if (Array.isArray(a[i]) && k > 0) go(a[i], k - 1); else r.push(a[i]); } })(this, d);
    return r; } });
  if (!Array.prototype.flatMap) Object.defineProperty(Array.prototype, 'flatMap', { configurable: true, writable: true, value: function flatMap(f, t) { return Array.prototype.map.call(this, f, t).flat(1); } });
  if (!Object.fromEntries) Object.fromEntries = function (it) { var o = {}; Array.from(it).forEach(function (e) { o[e[0]] = e[1]; }); return o; };
  if (typeof globalThis === 'undefined') self.globalThis = self;
})();
// what the game does differently inside the 小工具 container (read by 19_ui.js and 99_main.js):
//   noTilt   device orientation is switched off there, so a phone steers by drag and the title page says so
//   maxDpr, maxPx   the first drawing buffer: at most 1.5 device pixels per CSS pixel and about 2 million pixels (the container's
//            guidance for WebGL on phones); the frame-rate governor still lowers it further on a phone that cannot hold the frame rate
self.COLD_SMOKE = { noTilt: true, maxDpr: 1.5, maxPx: 2.0e6 };
