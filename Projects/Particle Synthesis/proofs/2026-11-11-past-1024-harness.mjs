// Particle Synthesis · 2026-11-11 · past 1024: where the GPU runs out, and what more grains do to the sound.
// Loads the instrument (a copy whose slot count is set by ?nmax=) in headless Chrome on WebGPU/Metal.
// 1. cost: one block of 1024 samples at each slot count, collisions on and off, against the 21.3 ms a block lasts
// 2. the ear sweep: one rain score played at each slot count; slots cap how many grains can be in the air at once
// 3 (off). the ear sweep again with meetings off: the landings alone
// Run: node 2026-11-11-past-1024-harness.mjs [cost|ear|off]   (then /usr/local/bin/python3 2026-11-11-past-1024-figure.py)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright-core/index.mjs';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const url = n => 'file://' + path.join(here, '2026-11-11-past-1024.html') + '?nmax=' + n;
const SR = 48000, TMP = '/tmp/ps9', REPORT = path.join(here, '2026-11-11-past-1024-report.json');
mkdirSync(TMP, { recursive: true });
const report = existsSync(REPORT) ? JSON.parse(readFileSync(REPORT, 'utf8')) : { date: '2026-11-11' };
const only = process.argv[2];
function f32(b64) { const b = Buffer.from(b64, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); }

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-webgpu'] });
async function open(n) {
  const page = await browser.newPage();
  const logs = []; page.on('console', m => logs.push(m.text())); page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
  await page.goto(url(n));
  return { page, logs };
}
// every key of all three rows held, a full handful, pouring as fast as the knob allows: more grains than any slot count can hold
const flood = [];
for (const zone of ['L', 'B', 'R']) for (let k = 0; k < 10; k++) flood.push({ t: 0.02 + k * 0.003 + (zone === 'B' ? 0.001 : zone === 'R' ? 0.002 : 0), zone, x: k / 9, count: 8, dur: 60 });

if (only !== 'ear') {
  const cost = [];
  for (const n of [1024, 2048, 4096, 8192, 16384, 32768]) {
    const { page, logs } = await open(n);
    if (n === 1024) report.limits = await page.evaluate(() => PS.limits());
    for (const collide of [1, 0]) {
      // warm up and fill the slots for 3 s, then time 2 s more
      const seconds = n >= 16384 && collide ? 2.5 : 5;
      let r;
      try { r = await page.evaluate(o => PS.render(o), { n, seconds, aim: 1.5, pour: 40, collide, engine: 'gpu', seed: 5, score: flood, timeBlocks: true }); }
      catch (e) { cost.push({ n, collide, error: String(e).slice(0, 200) }); console.log(n, collide, 'ERR', String(e).slice(0, 200)); continue; }
      const late = r.blockMs.slice(Math.floor(r.blockMs.length * 0.6));
      const ms = late.reduce((a, b) => a + b, 0) / late.length;
      const row = { n, collide, ms_per_block: +ms.toFixed(2), share_of_realtime: +(ms / (1024 / SR * 1000)).toFixed(3), flying_at_end: r.flying, grains_thrown: r.grains_thrown, meetings: r.grain_clacks / 2, engine: r.engine };
      cost.push(row); console.log(row);
    }
    if (logs.some(l => l.startsWith('PAGEERROR'))) console.log(logs.filter(l => l.startsWith('PAGEERROR')));
    await page.close();
  }
  report.cost = cost;
}

if (only === 'off') {
  // the same rain with meetings off: what more slots do to the landings alone
  const rain = [];
  for (let k = 0; k < 30; k++) rain.push({ t: 0.05 + k * 0.135, zone: 'LBR'[k % 3], x: ((k * 7) % 10) / 9, count: 4, dur: 9 });
  report.ear_off = [];
  for (const n of [1024, 4096, 16384]) {
    const { page } = await open(n);
    const r = await page.evaluate(o => PS.render(o), { n, seconds: 8, aim: 1.5, pour: 40, collide: 0, engine: 'gpu', seed: 9, score: rain, everyBlock: true, gain: 1 });
    const a = f32(r.audio);
    writeFileSync(path.join(TMP, `ear-off-${n}.f32`), Buffer.from(a.buffer, a.byteOffset, a.byteLength));
    const row = { n, grains_thrown: r.grains_thrown, strikes: r.strikes, flying_end: r.flyingPerBlock.at(-1) };
    report.ear_off.push(row); console.log(row);
    await page.close();
  }
}
if (only !== 'cost' && only !== 'off') {
  // the same rain at every slot count: a steady downpour from all three rows, each slot count rendered offline (no real-time limit here)
  const rain = [];
  // a rain that thickens: the 30 keys come in one by one over 4 s and all hold to the end, 4 grains a throw, 40 throws a second
  // at full: about 6,400 grains a second leave, enough for some 13,000 in the air at once
  for (let k = 0; k < 30; k++) rain.push({ t: 0.05 + k * 0.135, zone: 'LBR'[k % 3], x: ((k * 7) % 10) / 9, count: 4, dur: 9 });
  const ear = [];
  for (const n of [256, 1024, 4096, 16384]) {
    const { page } = await open(Math.max(n, 1024));
    const r = await page.evaluate(o => PS.render(o), { n, seconds: 8, aim: 1.5, pour: 40, collide: 1, engine: 'gpu', seed: 9, score: rain, everyBlock: true, gain: 1 });
    const a = f32(r.audio);
    writeFileSync(path.join(TMP, `ear-${n}.f32`), Buffer.from(a.buffer, a.byteOffset, a.byteLength));
    const row = { n, grains_thrown: r.grains_thrown, strikes: r.strikes, meetings: r.grain_clacks / 2, flying_per_block: r.flyingPerBlock, ms: Math.round(r.ms) };
    ear.push(row); console.log({ ...row, flying_per_block: undefined, flying_mid: r.flyingPerBlock[200] });
    await page.close();
  }
  report.ear = ear;
}
writeFileSync(REPORT, JSON.stringify(report, null, 2));
await browser.close();
