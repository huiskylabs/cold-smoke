// 一条命令跑完整轮：构建 → 录制 17 个场景 → 分析 → 过门槛。退出码就是门槛的退出码（有一条变差就是 1）。
//   npm run motion                                            量现在的代码（开关都是默认值），和 baseline.json 比
//   Q='v-mo1=b&v-medge=b&v-mo2=b&v-mo3=b' npm run motion      带上地址参数再量（比如打开某几个开关）
//   npm run motion -- --baseline                              量完把结果存成新的基线（改动确认合并之后才做）
// 整轮在没有显卡的机器上大约 3 到 4 分钟。录制数据在 tools/motion/out/（不进仓库）。
const cp = require('child_process'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..'), out = path.join(__dirname, 'out'), rec = path.join(out, 'cand'), sum = path.join(out, 'cand_summary.json');
const run = (file, args) => cp.execFileSync('node', [file, ...args], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 1 << 28 }).toString();
console.log(run(path.join(root, 'build.js'), []).trim());
fs.rmSync(rec, { recursive: true, force: true });
process.stdout.write(run(path.join(__dirname, 'record.js'), [rec]));
fs.writeFileSync(path.join(out, 'cand_report.txt'), run(path.join(__dirname, 'analyze.js'), [rec, '--json', sum]));
console.log('完整报告：tools/motion/out/cand_report.txt\n');
if (process.argv.includes('--baseline')) {
  fs.writeFileSync(path.join(__dirname, 'baseline.json'), run(path.join(__dirname, 'gate.js'), ['--slim', sum]));
  console.log('已把这一轮存成新的基线 tools/motion/baseline.json');
} else {
  const r = cp.spawnSync('node', [path.join(__dirname, 'gate.js'), sum], { cwd: root, stdio: 'inherit' });
  process.exit(r.status == null ? 2 : r.status);
}
