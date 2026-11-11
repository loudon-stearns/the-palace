// Particle Synthesis · 2026-11-11 · drives the playable page (two hands of ice) in headless Chrome (WebGPU on Metal).
// 1. GPU against its CPU copy, playing the same score  2. each key's landing against the throw formula, and throws on their exact sample
// 3. how close in time two throws must leave to meet  4. cost with 1024 slots and 1024-sample blocks  5. the etude, rendered
// Run: node 2026-11-11-two-hands-harness.mjs   (then /usr/local/bin/python3 2026-11-11-two-hands-figure.py)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright-core/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const page_url = 'file://' + path.join(here, '2026-11-11-two-hands-of-ice.html');
const SR = 48000, TMP = '/tmp/ps8';
mkdirSync(TMP, { recursive: true });

function f32(b64) { const b = Buffer.from(b64, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); }
function corr(a, b) { let ab = 0, aa = 0, bb = 0; for (let i = 0; i < a.length; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; } return ab / Math.sqrt(aa * bb); }
function ch(x, c) { const o = new Float32Array(x.length / 2); for (let i = 0; i < o.length; i++) o[i] = x[i * 2 + c]; return o; }
function peak(x) { let p = 0; for (const v of x) p = Math.max(p, Math.abs(v)); return p; }
function wav(file, x, scale) {
  const n = x.length / 2, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n * 2; i++) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * scale * 32767))), 44 + i * 2);
  writeFileSync(path.join(here, file), buf);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-webgpu'] });
const page = await browser.newPage();
const logs = []; page.on('console', m => logs.push(m.text())); page.on('pageerror', e => logs.push('PAGEERROR ' + e.message));
await page.goto(page_url);
const report = { date: '2026-11-11', checks: {}, etude: {} };
const only = process.argv[2];

if (only !== 'etude') {
  // 1 · mirror: a score touching every row, 64 slots, tight aim, GPU against CPU (motion in 32-bit)
  const mscore = [];
  for (let k = 0; k < 9; k++) mscore.push({ t: 0.1 + k * 0.55, zone: 'LBR'[k % 3], x: (k * 0.37) % 1, count: 2 });
  mscore.push({ t: 2.0, zone: 'B', x: 0.6, count: 1, dur: 1.5 });
  for (const collide of [1, 0]) {
    const o = { n: 64, seconds: 6, aim: 0.1, pour: 10, seed: 7, collide, score: mscore };
    const g = await page.evaluate(o => PS.render({ ...o, engine: 'gpu' }), o);
    const c = await page.evaluate(o => PS.render({ ...o, engine: 'cpu', f32: true, log: true }), o);
    const ga = f32(g.audio), ca = f32(c.audio);
    const res = { grains_thrown: [g.grains_thrown, c.grains_thrown], strikes: [g.strikes, c.strikes], meetings: [g.grain_clacks / 2, c.grain_clacks / 2] };
    for (const [k, c0] of [['L', 0], ['R', 1]]) res['corr_' + k] = +corr(ch(ga, c0), ch(ca, c0)).toFixed(5);
    res.engine = g.engine;
    report.checks['mirror_collide' + collide] = res;
    console.log('mirror collide', collide, res);
  }

  // 2 · each key's landing: one grain per key from each nozzle, almost no scatter, CPU log of the first strike
  const bscore = [];
  for (let i = 0; i < 10; i++) for (const zone of ['L', 'R']) bscore.push({ t: 0.05 + bscore.length * 0.2, zone, x: i / 9, count: 1 });
  const b = await page.evaluate(o => PS.render({ ...o, engine: 'cpu', f32: true, log: true }), { n: 64, seconds: 6.5, aim: 0.0001, collide: 0, seed: 3, score: bscore });
  const g0 = 9.81, el = Math.PI / 3, y0 = 0.2;
  const rows = [];
  let worstTiming = 0;
  bscore.forEach((e, k) => {
    const th = b.log.throws[k];
    worstTiming = Math.max(worstTiming, Math.abs(Math.round(th.t * SR) - Math.round(e.t * SR)));
    const s = b.log.strikes.find(s => s.i === th.i && s.t > th.t);
    const v = 4.2 * Math.pow(8 / 4.2, e.x), vx = v * Math.cos(el), vy = v * Math.sin(el), tf = (vy + Math.sqrt(vy * vy + 2 * g0 * y0)) / g0;
    const want = e.zone === 'L' ? 6.5 + vx * tf : 9.5 - vx * tf;
    rows.push({ zone: e.zone, key: Math.round(e.x * 9), speed: +v.toFixed(2), lands_at: +s.x.toFixed(3), formula_no_drag: +want.toFixed(3), flight_s: +(s.t - th.t).toFixed(3), formula_flight_s: +tf.toFixed(3) });
  });
  report.checks.landing = rows;
  report.checks.throw_on_its_sample = { worst_offset_samples: worstTiming, throws: bscore.length };
  console.log('landing', rows.filter(r => r.key % 3 === 0));
  console.log('throw timing worst offset (samples)', worstTiming);

  // 3 · the meeting window: 24 pairs at each offset between the left and right throw; offset 0 is the middle row
  const win = [];
  for (const ms of [0, 0.5, 1, 2, 3, 5, 10, 20]) {
    const score = [];
    for (let k = 0; k < 24; k++) {
      const t = 0.1 + k * 1.6, x = ((k * 5) % 10) / 9;
      if (ms === 0) score.push({ t, zone: 'B', x, count: 1 });
      else { score.push({ t, zone: 'L', x, count: 1 }); score.push({ t: t + ms / 1000, zone: 'R', x, count: 1 }); }
    }
    const r = await page.evaluate(o => PS.render({ ...o, engine: 'gpu' }), { n: 64, seconds: 40, aim: 0.05, collide: 1, seed: 11, score });
    win.push({ offset_ms: ms, pairs: 24, meetings: r.grain_clacks / 2 });
    console.log('window', ms, 'ms', r.grain_clacks / 2);
  }
  report.checks.meeting_window = win;
}

// 4 · the etude: a written score played by the harness through the same hands a player uses (not a human performance)
const sc = [];
for (let k = 0; k < 8; k++) sc.push({ t: 0.5 + k * 0.85, zone: 'L', x: k / 7, count: 1 });                   // left alone, rising
for (let k = 0; k < 8; k++) sc.push({ t: 8.0 + k * 0.85, zone: 'R', x: 1 - k / 7, count: 1 });               // right alone, falling
[0.5, 0.7, 0.3, 0.9, 0.6, 0.2, 0.8, 0.4].forEach((x, k) => sc.push({ t: 15.2 + k * 1.1, zone: 'B', x, count: 1 }));   // the middle row: meetings
sc.push({ t: 25.0, zone: 'L', x: 0.2, count: 1, dur: 3.5 });                                                      // pours
sc.push({ t: 26.5, zone: 'R', x: 0.8, count: 1, dur: 3.5 });
sc.push({ t: 29.6, zone: 'B', x: 0.6, count: 2, dur: 3.4 });
const rainX = [0.1, 0.9, 0.4, 0.7, 0.2, 0.5, 0.8, 0.3, 0.6, 0.0, 1.0, 0.45, 0.65, 0.15, 0.85, 0.35, 0.55, 0.75];
rainX.forEach((x, k) => sc.push({ t: 33.6 + k * 0.27, zone: 'LBR'[(k * 2) % 3], x, count: 3 }));               // rain, then let it ring
const aimPath = [[0, 0.3], [14.8, 0.3], [15.0, 0.08], [24.5, 0.08], [25.0, 2.0], [29.4, 2.0], [29.6, 0.12], [33.2, 0.12], [33.6, 3.0], [44, 3.0]];
const sections = [[0.5, 'left alone'], [8.0, 'right alone'], [15.2, 'both at once'], [25.0, 'pours'], [33.6, 'rain']];
const e = await page.evaluate(o => PS.render(o), { n: 1024, seconds: 44, aim: aimPath, pour: 10, collide: 1, engine: 'gpu', seed: 22, everyBlock: true, score: sc });
const audio = f32(e.audio);
const scale = 0.891 / peak(audio);
wav('2026-11-11-two-hands-etude.wav', audio, scale);
writeFileSync(path.join(TMP, 'etude.f32'), Buffer.from(audio.buffer));
writeFileSync(path.join(TMP, 'etude-meta.json'), JSON.stringify({ perBlock: e.perBlock.map(c => c / 2), B: 1024, score: sc, aimPath, sections }));
report.etude = { seconds: 44, notes: sc.length, throws: e.throws, grains_thrown: e.grains_thrown, strikes: e.strikes, meetings: e.grain_clacks / 2, ms: Math.round(e.ms), share_of_realtime: +(e.ms / 44000).toFixed(3), engine: e.engine, scale: +scale.toFixed(3), what_it_is: 'a written score played by the harness through the same hands a player uses; not a human performance' };
console.log('etude', report.etude);
report.console = logs.slice(0, 20);
writeFileSync(path.join(here, '2026-11-11-two-hands-report.json'), JSON.stringify(report, null, 2));
await browser.close();
