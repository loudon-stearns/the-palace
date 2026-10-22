// Particle Synthesis · 2026-10-22 · drives the GPU fountain page in headless Chrome (WebGPU on Metal).
// 1. GPU vs CPU mirror at 64 particles  2. speed at 1024  3. renders the A/B to WAV + raw f32 for the figure.
// Run: node 2026-10-22-gpu-fountain-harness.mjs
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright-core/index.mjs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const page_url = 'file://' + path.join(here, '2026-10-22-gpu-fountain.html');
const SR = 48000;

function f32(b64) { const b = Buffer.from(b64, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); }
function corr(a, b) { let ab = 0, aa = 0, bb = 0; for (let i = 0; i < a.length; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; } return ab / Math.sqrt(aa * bb); }
function ch(x, c) { const o = new Float32Array(x.length / 2); for (let i = 0; i < o.length; i++) o[i] = x[i * 2 + c]; return o; }
function rms(x) { let s = 0; for (const v of x) s += v * v; return Math.sqrt(s / x.length); }
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
const report = { date: '2026-10-22', checks: {}, renders: {} };

// 1 · mirror check: same throws, same law, GPU (f32) against CPU (f64 math)
for (const mode of [0, 1]) {
  const o = { n: 64, seconds: 4, ex: 6, mode, seed: 22, spread: 1.5 };
  const g = await page.evaluate(o => PS.render({ ...o, engine: 'gpu' }), o);
  const c = await page.evaluate(o => PS.render({ ...o, engine: 'cpu', f32: true }), o);
  const ga = f32(g.audio), ca = f32(c.audio);
  const res = { impacts_gpu: g.impacts, impacts_cpu: c.impacts, launches_gpu: g.launches, launches_cpu: c.launches };
  for (const [k, c0] of [['L', 0], ['R', 1]]) {
    const a = ch(ga, c0), b = ch(ca, c0);
    res['corr_' + k] = +corr(a, b).toFixed(5);
    // first second only, before f32 drift in landing points can grow
    res['corr_first_s_' + k] = +corr(a.subarray(0, SR), b.subarray(0, SR)).toFixed(5);
    let d = 0; for (let i = 0; i < a.length; i++) d = Math.max(d, Math.abs(a[i] - b[i]));
    res['maxdiff_over_peak_' + k] = +(d / peak(b)).toExponential(2);
  }
  res.cpu_ms = Math.round(c.ms); res.gpu_ms = Math.round(g.ms); res.engine = g.engine;
  report.checks['mirror_mode' + mode] = res;
  console.log('mirror mode', mode, res);
}

// 2 · speed: how long the GPU takes per second of sound
for (const n of [64, 256, 1024]) {
  const r = await page.evaluate(n => PS.render({ n, seconds: 6, ex: 8, engine: 'gpu', seed: 5 }), n);
  report.checks['speed_n' + n] = { ms_for_6s: Math.round(r.ms), share_of_realtime: +(r.ms / 6000).toFixed(4), impacts: r.impacts, launches: r.launches };
  console.log('speed', n, report.checks['speed_n' + n]);
}

// 3 · the A/B: 1024 particles, fountain walking 3 m -> 18 m over 16 s; same throws, two ways to hear them
const renders = {};
for (const [name, mode] of [['ice', 0], ['mapped', 1]]) {
  const r = await page.evaluate(o => PS.render(o), { n: 1024, seconds: 16, exFrom: 3, exTo: 18, mode, engine: 'gpu', seed: 22, spread: 3 });
  renders[name] = f32(r.audio);
  report.renders[name] = { impacts: r.impacts, launches: r.launches, ms: Math.round(r.ms), raw_rms: rms(renders[name]), raw_peak: peak(renders[name]) };
}
// match loudness (RMS), then one shared scale so the louder peak sits at -1 dBFS
const target = 0.1;
const sI = target / report.renders.ice.raw_rms, sM = target / report.renders.mapped.raw_rms;
const top = Math.max(report.renders.ice.raw_peak * sI, report.renders.mapped.raw_peak * sM);
const lim = top > 0.891 ? 0.891 / top : 1;
wav('2026-10-22-gpu-fountain-A-ice.wav', renders.ice, sI * lim);
wav('2026-10-22-gpu-fountain-B-mapped.wav', renders.mapped, sM * lim);
writeFileSync('/tmp/ps6/ice.f32', Buffer.from(renders.ice.buffer));
writeFileSync('/tmp/ps6/mapped.f32', Buffer.from(renders.mapped.buffer));
report.renders.loudness = 'both RMS-matched; shared scale ' + lim.toFixed(3);
console.log(report.renders);
report.console = logs.slice(0, 20);
writeFileSync(path.join(here, '2026-10-22-gpu-fountain-report.json'), JSON.stringify(report, null, 2));
await browser.close();
