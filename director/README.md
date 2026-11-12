# Director mode (demo video only)

`?director=1` turns the page into a recording rig. Normal play is untouched: without that parameter `src/20_director.js` does nothing.

- Shots are plain JSON (see `test-shots.json` and the field list at the top of `src/20_director.js`).
- Live preview in a browser: open `dist/dev.html?director=1`, then in the console `Director.shots = [...]; Director.preview(0)` (or `]` / `[` / `P` keys, `Esc` hands the game back).
- Frame-by-frame render: `node build.js && node tools/director-render.js <outDir> 1920 1080 60 all director/test-shots.json`
  (Playwright Chromium. `REALGPU=1` uses the machine's GPU instead of SwiftShader; `CHROME=/path/to/chrome` picks a browser.)
  Then `ffmpeg -framerate 60 -i <outDir>/00_x/f_%05d.png -c:v libx264 -crf 16 -pix_fmt yuv420p shot.mp4`.
- Free cameras (orbit, drone, fixed, sky) exist only in this mode and never change the chase camera of play.
