// 一起滑 robots: skiers who are always on the mountain, so nobody skis it alone (owner 2026-11-24 18:08 UTC: ten of them, named like people,
// "别人看不出来是机器人", from beginners to experts, "线上永远显示是有人"). Bot k has a level from 0 (beginner: wide slow turns, held under
// 9 m/s) to 1 (expert: tight fast lines, no limit). Four of them, of different levels, come back up and push off with a person who starts
// (the followers); the rest ski their own laps spread over the loop. Each is the game itself in a headless Chromium (its own
// process, so none is throttled as a background page), stepped on a timer at real speed without drawing a picture (there is no GPU on the
// server; the body is still worked out every step, and that is what goes over the wire), steered by the test pilot, each a little differently.
//   node tools/mp-bots.js <page url> [n=4]
//   e.g. node tools/mp-bots.js http://coldsmoke-mp:8787/ 4        (the relay serves the page, pointed at itself)
// A robot that stops (page error, lost connection, stuck) is started again.
const { chromium } = require('playwright');
const URL0 = process.argv[2] || 'http://127.0.0.1:8787/', N = +(process.argv[3] || 10);
const NAMES = ['阿杰', 'momo', '小鹿滑雪', 'Kevin', '粉雪控', '一只雪饼', 'Lin', '周末去崇礼', '白桦', 'Yuki', '冷面', '大橙子'];
// (each bot's level and whether it goes with people: spread so that every kind is there)
const LEVEL = k => [0, 0.55, 1, 0.25, 0.8, 0.1, 0.65, 0.4, 0.9, 0.3, 0.7, 0.5][k % 12], FOLLOW = k => false;          // (owner 2026-11-24 19:24 UTC: an open mountain — the robots are always out there skiing their own laps, none come back to the top to push off with a person)
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function bot(k) {
  for (;;) {
    let b = null;
    try {
      b = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--no-sandbox', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--mute-audio', '--js-flags=--max-old-space-size=512'] });
      const pg = await b.newPage({ viewport: { width: 320, height: 180 }, locale: 'zh-CN' });
      // (and no sound: nobody hears it, and the game's wind and snow, mixed live, took more of the machine than the skiing itself. Every audio
      // context the page makes is held suspended)
      await pg.addInitScript(() => { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        const Q = function (...a) { const c = new AC(...a); try { c.suspend(); } catch (e) { } c.resume = () => Promise.resolve(); return c; }; Q.prototype = AC.prototype; window.AudioContext = window.webkitAudioContext = Q; });
      let dead = null; pg.on('pageerror', e => { dead = e.message; }); pg.on('crash', () => { dead = 'crash'; });
      const u = URL0 + (URL0.includes('?') ? '&' : '?') + 'w=160&h=90&gov=0&mpbot=1' + (FOLLOW(k) ? '&mpfollow=1' : '') + '&mpname=' + encodeURIComponent(NAMES[k % NAMES.length]) + '&mpcol=' + ((k * 5 + 1) % 16);
      await pg.goto(u, { timeout: 120000 });
      await pg.waitForFunction(() => window.__ski && window.Net && __ski.ui().state === 'title', null, { timeout: 600000 });
      await pg.evaluate(([k, lv, follow]) => {
        const A = __ski.app(), I = __ski.input(), G = __ski.game();
        // (the level: how wide and slow the turns are, and how fast it lets itself go)
        const amp = 0.62 - 0.5 * lv, per0 = 3.8 + 2.4 * lv, vmax = lv >= 0.95 ? 1e9 : 9 + 18 * lv;
        let f = __ski.pilot(amp, per0);
        // (skiing with a person (Net.lead, see 99b_net.js): ahead of them, wider turns to wait; behind, straighter to catch up; with nobody, its own line)
        let far = performance.now(); const per = 4.4 + 0.8 * (k % 3), slow = __ski.pilot(0.6, per * 0.8), mid = __ski.pilot(0.3, per), fast = __ski.pilot(0.08, per * 1.5);
        A.onTick.push(() => {
          if (G.mode !== 'run') { I.script = null; return; }
          const sp = Math.hypot(G.s.v[0], G.s.v[2]); if (sp > vmax) { const k2 = 1 - Math.min(0.03, (sp - vmax) * 0.004); G.s.v[0] *= k2; G.s.v[2] *= k2; }
          const L = follow ? Net.leadShow() : null; if (!L || !L.run) { I.script = f(G.runT); return; }
          const ahead = -G.s.p[2] - -L.p[2];
          I.script = (ahead > 12 ? slow : ahead < -10 ? fast : mid)(G.runT);
          if (ahead > 40) { G.s.v[0] *= 0.995; G.s.v[2] *= 0.995; }          // (far ahead: let them come)
          // (lost them, e.g. missed their push-off: more than 150 m apart for 3 s → 找人 to just behind them)
          const t = performance.now(); if (Math.abs(ahead) < 150) far = t; else if (t - far > 3000 && !A.swapping) { far = t; Net.find(Net.lead); }
        });
        // (nothing is drawn, so the page asks for no frames at all: the browser's own frame loop, the compositor and the software GPU behind
        // it stay idle. The game is stepped 20 times a second, which is what its physics takes (it holds a step to 1/20 s at most). Owner
        // 2026-11-24 18:10 UTC: "为什么机器人这么占用cpu？" — four of them took the eight cores they were given)
        window.requestAnimationFrame = () => 0;
        let last = performance.now(); A.paused = true;
        setInterval(() => { const t = performance.now(); let d = Math.min(0.5, (t - last) / 1000); last = t; while (d > 0) { const h = Math.min(d, 1 / 20); A.paused = false; __ski.step(h); A.paused = true; d -= h; } }, 50);
        Net.enter('pub');
        // (one that skis its own laps starts somewhere along the loop, so the mountain is not empty anywhere)
        if (!follow) { const iv = setInterval(() => { const W = __ski.m.Course.loop; if (!W || A.swapping || G.mode !== 'run') return; clearInterval(iv); const s = 40 + Math.random() * (W.B - 200); A.swap(() => G.reset(s)); }, 500); }
        // (now and then a different line: wider or tighter turns)
        setInterval(() => { f = __ski.pilot(Math.max(0.08, amp + 0.12 * (Math.random() - 0.5)), per0 * (0.85 + 0.3 * Math.random())); }, 40000);
      }, [k, LEVEL(k), FOLLOW(k)]);
      console.log(new Date().toISOString(), 'bot', k, 'on'); up[k] = true;
      // (2026-11-24 22:3x UTC: after ~2.5 h the container sat at its 8 GiB cap and only 5 of 10 were still counted on the mountain — pages
      // grown fat, then hung or cut off without an error, which the old check never saw. So: a robot whose page does not answer in 15 s, or
      // that has been off the server for 30 s, starts again; and each starts afresh every ~45 min (spread out), so none grows without end)
      let lastS = 0, still = 0, off = 0; const born = Date.now(), life = (40 + 4 * k) * 60000;
      while (!dead) {
        await sleep(10000);
        if (Date.now() - born > life) { dead = 'fresh start'; break; }
        const st = await Promise.race([pg.evaluate(() => { const L = Net.leadShow(); return { net: Net.state, s: -__ski.game().s.p[2], mode: __ski.game().mode, sp: __ski.game().s.speed, lead: Net.lead, L: L ? -L.p[2] : null }; }).catch(e => ({ err: e.message })), sleep(15000).then(() => ({ err: 'page not answering' }))]);
        if (st.err) { dead = st.err; break; }
        off = st.net === 'on' ? 0 : off + 1; if (off >= 3) { dead = 'off the server (' + st.net + ')'; break; }
        if (process.env.BOTLOG) console.log('bot', k, JSON.stringify(st));
        if (st.mode !== 'run') await pg.evaluate(() => { if (__ski.ui().state === 'title') __ski.ui().go(); }).catch(() => { });
        still = Math.abs(st.s - lastS) < 3 ? still + 1 : 0; lastS = st.s;
        if (still >= 3) await pg.evaluate(() => __ski.game().reset()).catch(() => { });          // (stuck against something: back to the top)
        if (still >= 9) dead = 'stuck';
      }
      console.log(new Date().toISOString(), 'bot', k, 'restart:', dead);
    } catch (e) { console.log(new Date().toISOString(), 'bot', k, 'error:', e.message.split('\n')[0]); }
    try { if (b) await b.close(); } catch (e) { }
    await sleep(5000);
  }
}
// (one after another: a page starting up is the heaviest thing a robot does, ten at once starved each other for minutes)
const up = []; (async () => { for (let k = 0; k < N; k++) { bot(k); const t = Date.now(); while (!up[k] && Date.now() - t < 120000) await sleep(1000); } })();
