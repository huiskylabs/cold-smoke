# Contributing · 参与

Thanks for wanting to help. [中文在下面](#中文)

## English

### Reporting a bug or a slow device

Open an issue with:

- what you saw, and what you expected;
- browser and version, device or GPU, and whether the game used WebGPU or WebGL2 (try `?backend=webgl2` to compare);
- the `#seed-…` from the address bar if it happens at a particular spot on the mountain;
- a screenshot or short clip if it is visual.

Frame-rate reports from real phones and laptops are especially useful.

### Changing the code

1. Fork, then `npm start` (builds and serves on <http://localhost:8080>).
2. Edit `src/*.js` or `template.html`, run `node build.js`, reload.
3. Keep the spirit of the project:
   - **No asset files.** No images, audio, models or textures. Everything is generated in code. Fonts for the title are the one exception.
   - **No runtime dependencies or bundler.** The game stays one HTML file built by `build.js`.
   - Plain modern JavaScript; files are concatenated in name order, so a new module goes where its number puts it.
   - Landscape only. Desktop browser first, phone in landscape second.
4. Before changing how something looks, read the decisions in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). If you want to offer a different look or feel, add it as a `Variants` option (`src/00b_variants.js`) so it can be compared in the game's versions page.
5. Check both renderers (default and `?backend=webgl2`) and both languages (`?lang=en`, `?lang=zh`). New UI text goes in `src/00a_i18n.js`.
6. Open a pull request with a short description and, for visual changes, before and after screenshots.

## 中文

### 报 bug 或者卡顿

开一个 issue，写上：

- 看到了什么，本来应该是什么样；
- 浏览器和版本、设备或显卡，用的是 WebGPU 还是 WebGL2（可以加 `?backend=webgl2` 对比）；
- 如果是山上某个固定位置的问题，附上地址栏里的 `#seed-…`；
- 画面问题附截图或短视频。

真机（手机、笔记本）的帧率反馈特别有用。

### 改代码

1. Fork 之后 `npm start`（构建并在 <http://localhost:8080> 打开）。
2. 改 `src/*.js` 或 `template.html`，跑 `node build.js`，刷新。
3. 保持这个项目的原则：
   - **不加素材文件。** 不要图片、音频、模型、贴图，一切用代码生成。标题字体是唯一的例外。
   - **不加运行时依赖，不用打包工具。** 游戏始终是 `build.js` 拼出来的一个 HTML 文件。
   - 用普通的现代 JavaScript；文件按名字顺序拼接，新模块按编号放在合适的位置。
   - 只做横屏。电脑浏览器优先，其次是横着拿的手机。
4. 改画面之前先读 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 里记下的取舍。想提供另一种画面或手感，可以加成一个 `Variants` 选项（`src/00b_variants.js`），这样能在游戏的版本页里对比。
5. 两种渲染（默认和 `?backend=webgl2`）和两种语言（`?lang=en`、`?lang=zh`）都看一下。新的界面文字加到 `src/00a_i18n.js`。
6. 提 PR 时简单说明改了什么，画面相关的附上改前改后的截图。
