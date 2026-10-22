// Particle Synthesis · 2026-10-22 · drives the GPU grains-that-meet page in headless Chrome (WebGPU on Metal).
// 1. the shader's clack against September's exact render  2. GPU vs CPU copy at 64 grains  3. speed
// 4. renders meet / pass-through to WAV (one shared gain) + raw f32 for the figure.
// Run: node 2026-10-22-gpu-grains-meet-harness.mjs   (then /usr/local/bin/python3 2026-10-22-gpu-grains-meet-figure.py)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright-core/index.mjs';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const page_url = 'file://' + path.join(here, '2026-10-22-gpu-grains-meet.html');
const SR = 48000, TMP = '/tmp/ps7';
mkdirSync(TMP, { recursive: true });

function f32(b64) { const b = Buffer.from(b64, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); }
function corr(a, b) { let ab = 0, aa = 0, bb = 0; for (let i = 0; i < a.length; i++) { ab += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; } return ab / Math.sqrt(aa * bb); }
function ch(x, c) { const o = new Float32Array(x.length / 2); for (let i = 0; i < o.length; i++) o[i] = x[i * 2 + c]; return o; }
function peak(x) { let p = 0; for (const v of x) p = Math.max(p, Math.abs(v)); return p; }
function rms(x) { let s = 0; for (const v of x) s += v * v; return Math.sqrt(s / x.length); }
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
const only = process.argv[2];

// 1 · the clack voice the shader sings, against September's exact (FFT) render of six real meetings
const tv = JSON.parse(readFileSync(path.join(here, '2026-09-23-grains-clack-testvector.json'), 'utf8'));
report.checks.clack_vs_september = await page.evaluate(tv => tv.map(ev => {
  const mic = ev.mic, r_near = Math.min(...[ev.c1, ev.c2].map(c => Math.hypot(mic[0] - c[0], mic[1] - c[1], mic[2] - c[2])));
  const t0 = r_near / 343 - ev.lead / PS.SR;      // h[0] sits lead samples before the nearer ball's sound arrives
  const y = PS.clackVoice(ev, mic, PS.SR, t0, ev.h.length);
  let ab = 0, aa = 0, bb = 0, pa = 0, pb = 0;
  for (let i = 0; i < y.length; i++) { ab += y[i] * ev.h[i]; aa += y[i] * y[i]; bb += ev.h[i] * ev.h[i]; pa = Math.max(pa, Math.abs(y[i])); pb = Math.max(pb, Math.abs(ev.h[i])); }
  return { corr: +(ab / Math.sqrt(aa * bb)).toFixed(4), energy_ratio: +(aa / bb).toFixed(3), peak_ratio: +(pa / pb).toFixed(3) };
}), tv);
console.log('clack vs september', report.checks.clack_vs_september);

// 2 · mirror: same throws, same law, GPU against CPU (motion in 32-bit), 64 grains, tight aim so they meet
if (only !== 'render') {
  for (const collide of [1, 0]) {
    const o = { n: 64, seconds: 6, aim: 0.3, rate: 16, seed: 7, collide };
    const g = await page.evaluate(o => PS.render({ ...o, engine: 'gpu' }), o);
    const c = await page.evaluate(o => PS.render({ ...o, engine: 'cpu', f32: true, log: true }), o);
    const ga = f32(g.audio), ca = f32(c.audio);
    const res = { throws: [g.throws, c.throws], strikes: [g.strikes, c.strikes], meetings: [g.grain_clacks / 2, c.grain_clacks / 2] };
    for (const [k, c0] of [['L', 0], ['R', 1]]) res['corr_' + k] = +corr(ch(ga, c0), ch(ca, c0)).toFixed(5);
    res.gpu_ms = Math.round(g.ms); res.cpu_ms = Math.round(c.ms); res.engine = g.engine;
    if (collide) {
      const M = c.log.meets;
      // conservation, recomputed from the logged velocities: momentum and the energy lost per pair
      let pe = 0, ee = 0;
      for (const e of M) {
        const vi2 = e.vi.map((v, k) => v - e.J / e.mi * e.n[k]), vj2 = e.vj.map((v, k) => v + e.J / e.mj * e.n[k]);
        const p0 = e.vi.map((v, k) => e.mi * v + e.mj * e.vj[k]), p1 = vi2.map((v, k) => e.mi * v + e.mj * vj2[k]);
        pe = Math.max(pe, Math.hypot(...p0.map((v, k) => v - p1[k])) / Math.hypot(...p0));
        const ke = (m, v) => 0.5 * m * (v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
        const lost = ke(e.mi, e.vi) + ke(e.mj, e.vj) - ke(e.mi, vi2) - ke(e.mj, vj2), want = 0.5 * (1 - 0.49) * (e.mi * e.mj / (e.mi + e.mj)) * e.vrel ** 2;
        ee = Math.max(ee, Math.abs(lost - want) / want);
      }
      const per = {}; for (const e of M) { per[e.i] = (per[e.i] || 0) + 1; per[e.j] = (per[e.j] || 0) + 1; }
      res.cpu_meetings_logged = M.length; res.max_momentum_err = +pe.toExponential(1); res.max_energy_err = +ee.toExponential(1);
      res.grains_met = Object.keys(per).length; res.closing_speed = [Math.min(...M.map(e => e.vrel)).toFixed(2), Math.max(...M.map(e => e.vrel)).toFixed(2)];
      res.first_meetings = M.slice(0, 4).map(e => ({ t: +e.t.toFixed(4), i: e.i, j: e.j }));
    }
    report.checks['mirror_collide' + collide] = res;
    console.log('mirror collide', collide, res);
  }
  for (const n of [64, 256, 1024]) {
    const r = await page.evaluate(n => PS.render({ n, seconds: 6, aim: 0.5, rate: 48, engine: 'gpu', seed: 5 }), n);
    report.checks['speed_n' + n] = { ms_for_6s: Math.round(r.ms), share_of_realtime: +(r.ms / 6000).toFixed(4), meetings: r.grain_clacks / 2, strikes: r.strikes };
    console.log('speed', n, report.checks['speed_n' + n]);
  }
}

// 3 · the pair: 1024 grains, 16 s, aim tightening 6° -> 0.15°, identical throws, collisions on and off, one shared gain
const renders = {};
for (const [name, collide] of [['meet', 1], ['pass', 0]]) {
  const r = await page.evaluate(o => PS.render(o), { n: 1024, seconds: 16, aimFrom: 6, aimTo: 0.15, rate: 48, collide, engine: 'gpu', seed: 22, everyBlock: true });
  renders[name] = f32(r.audio);
  report.renders[name] = { throws: r.throws, strikes: r.strikes, meetings: r.grain_clacks / 2, ms: Math.round(r.ms), raw_rms: rms(renders[name]), raw_peak: peak(renders[name]) };
  writeFileSync(path.join(TMP, name + '.f32'), Buffer.from(renders[name].buffer));
  writeFileSync(path.join(TMP, name + '-perblock.json'), JSON.stringify(r.perBlock.map(c => c / 2)));
  console.log(name, report.renders[name]);
}
const top = Math.max(report.renders.meet.raw_peak, report.renders.pass.raw_peak);
const scale = 0.891 / top;
wav('2026-10-22-gpu-grains-meet-A-meet.wav', renders.meet, scale);
wav('2026-10-22-gpu-grains-meet-B-pass.wav', renders.pass, scale);
report.renders.loudness = 'one shared scale ' + scale.toFixed(3) + ' (louder peak at -1 dBFS); not loudness-matched, so the clacks are heard as added energy';
report.console = logs.slice(0, 20);
writeFileSync(path.join(here, '2026-10-22-gpu-grains-meet-report.json'), JSON.stringify(report, null, 2));
await browser.close();
