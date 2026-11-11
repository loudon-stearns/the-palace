// Particle Synthesis · 2026-11-11 · past 1024, second pass: where the meetings happen, and a nozzle with a mouth.
// The first sweep found almost every meeting within 0.4 m of a nozzle: grains leaving one point at different speeds crowd each other.
// 1. where: the CPU copy logs every meeting in the last 0.8 s of the thickening rain, point nozzle and widened mouth (1024 slots)
// 2. the rain again on the GPU with the mouth widened, at 1024 and 16384 slots, for the ear
// Run: node 2026-11-11-past-1024-mouth.mjs   (then /usr/local/bin/python3 2026-11-11-past-1024-figure.py mouth)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright-core/index.mjs';
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const url = n => 'file://' + path.join(here, '2026-11-11-past-1024.html') + '?nmax=' + n;
const TMP = '/tmp/ps9', REPORT = path.join(here, '2026-11-11-past-1024-report.json');
const report = JSON.parse(readFileSync(REPORT, 'utf8'));
function f32(b64) { const b = Buffer.from(b64, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); }
const rain = [];
for (let k = 0; k < 30; k++) rain.push({ t: 0.05 + k * 0.135, zone: 'LBR'[k % 3], x: ((k * 7) % 10) / 9, count: 4, dur: 9 });
const MOUTH = 0.25;
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-webgpu'] });
report.where = [];
for (const mouth of [0, MOUTH]) {
  const page = await browser.newPage(); await page.goto(url(1024));
  const r = await page.evaluate(o => PS.render(o).then(r => r.log.meets.filter(m => m.t > 4.2).map(m => [m.x, m.y, m.vrel])),
    { n: 1024, seconds: 5, aim: 1.5, pour: 40, collide: 1, engine: 'cpu', f32: true, log: true, seed: 9, score: rain, mouth });
  const nearNozzle = r.filter(([x, y]) => Math.min(Math.abs(x - 6.5), Math.abs(x - 9.5)) < 0.4 + mouth && y < 0.8).length;
  const vr = r.map(q => q[2]).sort((a, b) => a - b);
  const row = { mouth_halfwidth_m: mouth, meetings_in_0p8s: r.length, near_a_nozzle: nearNozzle, share_near_nozzle: +(nearNozzle / Math.max(r.length, 1)).toFixed(3), closing_speed_median: +vr[vr.length >> 1].toFixed(2) };
  report.where.push(row); console.log(row);
  await page.close();
}
report.ear_mouth = [];
for (const n of [1024, 16384]) {
  const page = await browser.newPage(); await page.goto(url(n));
  const r = await page.evaluate(o => PS.render(o), { n, seconds: 8, aim: 1.5, pour: 40, collide: 1, engine: 'gpu', seed: 9, score: rain, everyBlock: true, gain: 1, mouth: MOUTH });
  const a = f32(r.audio);
  writeFileSync(path.join(TMP, `ear-mouth-${n}.f32`), Buffer.from(a.buffer, a.byteOffset, a.byteLength));
  const row = { n, mouth_halfwidth_m: MOUTH, grains_thrown: r.grains_thrown, strikes: r.strikes, meetings: r.grain_clacks / 2, flying_per_block: r.flyingPerBlock };
  report.ear_mouth.push(row); console.log({ ...row, flying_per_block: r.flyingPerBlock.at(-1) });
  await page.close();
}
writeFileSync(REPORT, JSON.stringify(report, null, 2));
await browser.close();
