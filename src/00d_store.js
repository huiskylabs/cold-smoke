// ---------------------------------------------------------------- what the player earns, kept: one way in and out of storage
// Everything the player has earned (the mountains skied and their bests, today's mountain, the cards collected) goes through here, so it is
// kept the same way everywhere. In a browser that is localStorage. Inside the 小红书 小工具 the page's localStorage is not promised to last
// (19c_xhs.js), so the container's own storage keeps a copy: XHS sets Store.keep, and every key marked durable is handed to it as it
// changes, and read back from it before the game is built (XHS.restore). A key not marked durable stays in this browser only.
// (Before this file, only the settings were kept in the container: 滑过的山 and 今日之山 lived in localStorage alone and could be lost there.)
//   Store.durable(key)         this key is the player's: keep it wherever the host can
//   Store.get(key) / set(key, text)          plain text
//   Store.getJSON(key, fallback) / setJSON(key, value)
const Store = self.Store = (() => {
  const S = { keys: new Set(), keep: null };
  S.durable = k => { S.keys.add(k); return k; };
  S.isDurable = k => S.keys.has(k);
  S.get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  S.set = function (k, v) {
    try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { }
    if (S.keep && S.keys.has(k)) try { S.keep(k, v == null ? '' : v); } catch (e) { console.warn('store keep', e); }
  };
  S.getJSON = function (k, fb) { const s = S.get(k); if (!s) return fb; try { const o = JSON.parse(s); return o == null ? fb : o; } catch (e) { return fb; } };
  S.setJSON = (k, o) => S.set(k, JSON.stringify(o));
  return S;
})();
