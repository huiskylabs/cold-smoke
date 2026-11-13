# How Cold Smoke is built

[README](../README.md) · English notes for people reading or changing the code.

## Scope

The game is landscape only. The first target is a browser window on a computer (keyboard and mouse), the second a phone held in landscape. A phone held upright gets the picture turned a quarter turn. WebGPU is the main renderer; WebGL2 is an automatic fallback.

## Build

`build.js` concatenates `src/*.js` (in file-name order) into `template.html` and writes `dist/index.html` (an HTML fragment, for hosts that add their own document) and `dist/dev.html` (the same page as a full document; use this one anywhere else). Query parameters: `backend=webgl2` forces the fallback renderer; `lang=zh|en` picks the language; `v-<name>=<id>` picks a Variant; `nebres`, `cloudres`, `vistares`, `cityres` set bake resolutions.

## How it is put together

- `01_gfx.js`: one rendering layer over WebGPU and WebGL2. Shaders are written once in a typed WGSL subset and translated to GLSL ES 3.00.
- `02_shaderlib.js`: globals shared by every shader (camera, sun, fog, shadows, the headlamp) and the common functions.
- `03_course.js`: the endless mountain, a shuffled deck of nine kinds of run of about half a minute each (plain JS, used by physics and by rendering). The valley winds (`bend`, up to about 30 degrees either way) and the camera follows it. Each kind's length comes from `SEG_PACE`, the speed the test pilot covers it at: re-measure with a pacing run after changing physics.
- `04_terrain.js` snow and rock, `05_sky.js` sun, moon, time of day, exposure, cloud sea, contrail, `12_nebula.js`, `13_clouds.js`, `16_vista.js` far ranges and the city.
- `07_game.js` physics, pose and chase camera, `08_skier.js` and `08b_deer.js` the figures (distance fields turned into meshes at load), `14_trees.js`.
- `10_spray.js` the snow thrown by the edges (a lit participating medium plus glinting grains), `11_dust.js` the fine falling snow, `15_shafts.js` light in the air (used after dark for the beam of the headlamp).
- `09_post.js` bloom, lens, motion blur, grade. `18_sound.js` all sound, synthesised. `19_ui.js` loading page, title, HUD, and the menu.

## Testing without a GPU

Chromium with SwiftShader runs both backends headless (Playwright works), so the game can be driven and rendered on a machine with no graphics card.

- The page exposes `window.__ski` for scripts: `sim(seconds, steerFn, {draw})`, `pilot(amplitude, period)`, `tod(name)` (day, golden, sunset, dusk, night, dawn, sunrise), `view(pos, target, fov)`, `set("Sky.rate", 0)`, `reset(distance)`, and `m` (all the modules).
- `test/smoke.html` exercises the rendering layer alone: open it through the local server as `/test/smoke.html?backend=webgl2` or `?backend=webgpu`.
- Director mode renders frames for video: see [`director/README.md`](../director/README.md).

## 小红书 小工具 package

The game also ships as a 小红书 小工具 (创作服务平台 → Builder Hub → 小工具): an offline web package that opens under a note. The container's rules are in the official 小工具容器能力清单 (https://miniapp-sandbox.xiaohongshu.com/minitool/doc). The ones that matter here: scripts only as package `.js` files (no inline `<script>`, no `onclick=`, no `eval`), no network at all, code that runs on Chrome 61 / ES2017, and only html, css, js, images, woff/woff2 and json in the zip.

- `node tools/build-xhs.js` writes `dist-xhs/` (`index.html`, `app.js`, `fonts/`) and `dist-xhs.zip`, the file to upload. It takes the same `src/` and `template.html` as `build.js` and changes this much:
  - it leaves out `20_director.js`, the web-font loader, and every block in `src/` marked `/*web{*/ … /*}web*/`. Those blocks hold device orientation and the request for the whole screen, which the container forbids. Keep such code inside these markers;
  - it lowers the syntax with esbuild (`npx esbuild@0.24.2`, target chrome61) and puts `xhs/polyfills.js` in front. That file adds `.at`, `.flat`, `.flatMap` and `Object.fromEntries`, and sets `self.COLD_SMOKE`: no tilt (the title page says to drag), and a first drawing buffer of at most 1.5 dpr and about 2 million pixels;
  - it gives each CSS `clamp()` / `min()` / `max()` / `inset` declaration a value Chrome 61 can read. A custom property gets its plain value written in place, and its modern value is set again inside `@supports`;
  - it refuses to zip if a container rule is broken.
- Leaderboards (`src/19b_rank.js`): inside the container only, the menu gets 排行榜 with three rankings, each as 今日 / 本周 / 总榜: 极速 (board 1, km/h), 最远飞行 (board 2, m) and 滑雪时长 (minutes skied: boards 3 / 4 / 5 hold today's, this week's and the all-time total, since the platform keeps a best, not a sum; totals are kept with setStorage), and the day card adds today's places. It uses `submitScore` / `getRankList` / `getMyRank` (client 9.51+, still 内测). **When uploading, tick 「用户头像昵称授权」**, or the platform answers 1005 and the entry hides itself. Scores go up only when they beat today's sent best, at most every 30 s; lists are cached 45 s. Outside 小红书 (no `window.xhs`) none of it shows.
- The official checks come from the 小红书 Skill `minitool-zip-builder` (the link is on the upload page). Its audit is `node <skill>/scripts/audit_artifact.mjs dist-xhs`.
- The three faces are kept in `xhs/fonts/`: Jost, Cormorant Garamond, and Noto Serif SC cut to the characters the page asks for, all under the SIL OFL. `node tools/fetch-xhs-fonts.js` fetches them again, for example after the title's characters change.
- Known gaps against the Skill: there is no WebGL1 renderer, so without WebGL2 the page shows its one-line message. Flex `gap` (spacing only) has no margin fallback for WebViews older than Chrome 84.

## Look and feel choices (read before changing the look)

- The day sun stands low and ahead of the skier (elevation 0.20 rad): the spray is backlit and is the brightest thing after the sun. Day exposure is 0.145 and backlit snow is micro-shadowed, so the foreground sits near L*65 to 70, not white.
- At sunset the lens is stopped down for the sky and the sun is held on the far skyline for about half a minute. At night the exposure is held under what a camera would give, the moonlit fill is pulled a third of the way to grey, and the skier's headlamp lights a pool a few lengths ahead.
- By day the nebula is kept very faint (`Sky.nebDay`) and the city is hazed blue with its feet in the cloud: both were reading as stuck on. The sun has a wide glare and a lens veil.
- A tree between the lens and the skier, or right against the lens, fades out whole over a sixth of a second and comes back when clear (`14_trees.js`, drawn again in the transparent pass); its shadow stays.
- The camera frames by the skis with hard limits (skis and head never leave the picture), rises between banks and on steep pitches, and never drops below the skier's knees.
- Above about 100 km/h the skier stays in a high tuck even while turning. Marked jumps are cut wedges with a steep takeoff and four spruce saplings as a lane; the saplings are `soft` (brushed, never hit). The ridge has wind-stunted spruce along its edges.
- Leaving the gate is a moment, not a fade: the lens gives with the lunge and each of the two strides kicks a small low spurt of snow off its edge (`App.strides` in `99_main.js`). A full landing burst there veiled the skier's back.
- The spray buffer is half float: the per-lump depth weight is bounded and the composite clamps what it reads, because a fall used to pile enough snow in one place to overflow it and leave a black hole.
- Kept on purpose: the tall slow curtain of snow, life-size deer, a faint daytime nebula and a clear-day start.
- Tilt control needs a normal https page (a tap grants motion access). Inside an iframe that refuses device motion the page falls back to drag; keyboard and mouse work on a computer.
- The menu is the pause (Esc, the corner's menu glyph, or losing focus). While it is open the run is held as `Game.mode = 'hold'`: nothing of the run steps, but the picture is still drawn, so a time, weather, view or run picked there shows at once behind the shade. A skier put somewhere else meanwhile pushes off from there on 继续滑. Look and feel alternatives (`Variants`, `src/00b_variants.js`) have their own page of the menu (`` ` ``), grouped in `VGROUP` in `19_ui.js`; a choice not listed there appears under 新加的. Keys: H opens the controls page; all other keys are unchanged.
- Language: Chinese or English, from the browser (`navigator.languages[0]`: zh* is Chinese, anything else English), overridden by the menu's 设置 / Settings switch (kept in localStorage) or `?lang=zh|en`. English is a dictionary over the Chinese in `00a_i18n.js`, keyed by the Chinese text: other modules keep naming things in Chinese, and a new string (a new Variants row, say) shows in Chinese until an entry is added there.
