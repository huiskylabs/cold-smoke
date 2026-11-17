# 性能测量工具

这些脚本不改 `src/`，也不改 `dist/`：它们把一个测量钩子（`hook.js`）拼进 `dist/dev.html` 的副本，然后用无头浏览器去量。产物都在 `tools/perf/tmp/`（已忽略，不进仓库）。

需要 Node 18+ 和 [Playwright](https://playwright.dev)（`npm i -D playwright`，或者用 `NODE_PATH` 指到别处装好的）。

## 先生成带钩子的页面

```
node build.js
cd tools/perf
node mkperf.js          # 生成 tmp/dev-perf.html
node mkbench.js         # 生成 tmp/perf-bench.html（手机上打开的测量页）
```

每次改了 `src/` 都要重新跑这两步。

## 各个脚本量什么

| 脚本 | 量什么 | 例子 |
|---|---|---|
| `jsprof.js` | 每帧 JS 耗时（中位数、p95、p99、最大、超 16.7 ms 的帧数）。画图调用换成空函数，只量脚本。第二个参数是 CPU 降速倍数 | `NOPROF=1 node jsprof.js "v-pslice=a" 2 1800` |
| `sliceq.js` | 地形滚动分摊后，队列最长攒了几条、每层边上最多欠几行 | `node sliceq.js 1800` |
| `shotdiff.js` | 同一时刻同一机位，两种开关各画一张，逐像素比较 | `BASEQ='v-pslice=a&v-mbtap=a&v-patchd=a' DRAIN=200 node shotdiff.js default 844 390 12` |
| `govtest.js` | 自动清晰度的判断逻辑：喂给它几种假想的帧间隔，看 60 秒后停在哪 | `node govtest.js` |
| `passtime.js` | 各条管线的相对耗时（软件渲染，只看谁占大头） | `node passtime.js "" 12 1280 720` |
| `knock.js` | 关掉一组管线看整帧少多少。真显卡上用 `REAL=1 CHANNEL=chrome` | `REAL=1 CHANNEL=chrome node knock.js "" 844 390 30 12` |
| `ledger.js` | 一帧的账本：draw call、三角形、渲染目标、显存 | `node ledger.js "" 12 844 390` |
| `pngdiff.js` | 两张截图的差值放大图 | `node pngdiff.js a.png b.png out.png` |
| `benchtest.js` | 在无头浏览器里把手机测量页跑一遍，确认它能出结果 | `node benchtest.js quick` |

地址参数 `v-<开关名>=a` 把「场景」面板里的某个开关切到 a（一般是旧做法）。和性能有关的开关在面板的「性能（11 月 17 日）」分组里：

| 开关 | a | b（默认） |
|---|---|---|
| `pslice` 地形滚动 | 当帧做完 | 分摊到多帧 |
| `govjs` 自动清晰度 | 看平均帧时间 | 不算脚本卡的帧 |
| `mbtap` 模糊采样 | 固定 9 到 16 次 | 按拖影长度 |
| `patchd` 脚下雪面网格 | 一直最密 | 按画面高度 |

## 注意

- 云端和没有显卡的机器用的是软件渲染（SwiftShader）。它量出来的显卡时间不代表任何真机，只能在同一台机器上前后对比。每帧 JS 的数字不受这个影响。
- 耗时只能拿同一台机器上连着跑的两次来比。
- `shotdiff.js` 先模拟一段不画图的滑行，这相当于一次瞬移。比较「分摊到多帧」时要加 `DRAIN=200`，让排队的活先干完。
- CPU 降速倍数是近似：2 倍大约是近两年的中端安卓，4 倍大约是低端机，都不是真机测量。
