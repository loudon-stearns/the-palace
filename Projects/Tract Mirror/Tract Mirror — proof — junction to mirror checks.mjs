// Tract Mirror — proof — junction to mirror checks.mjs
//
// born: 2026-11-03 · links: [[Tract Mirror]] connects-to · checks-the-piece
// forward_vector: I re-run every claim the walk "Tract Mirror — rich — junction to mirror.html"
//   makes, on the walk's own engine (the script marked id="tm-engine") and its own worklet string,
//   against vowels.json and against the Python reference. I print PASS/FAIL per claim and exit
//   non-zero on any FAIL. I read; I write nothing.
//
//   node "Projects/Tract Mirror/Tract Mirror — proof — junction to mirror checks.mjs"
//
// Needs python3 with numpy and scipy for the one cross-check against reference/kl_reference.py.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, 'Tract Mirror — rich — junction to mirror.html'), 'utf8');
const V = JSON.parse(readFileSync(join(HERE, 'reference/vowels.json'), 'utf8'));

const engineSrc = html.match(/<script id="tm-engine">([\s\S]*?)<\/script>/)[1];
const box = {}; vm.createContext(box); vm.runInContext(engineSrc, box);
const TM = box.TM;

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const VOW = ['a', 'e', 'i', 'o', 'u', 'schwa'];
const N = TM.nSections(44100);

// ── the copy the piece carries for an opaque frame ─────────────────────────
{
  const copy = JSON.parse(html.match(/<script type="application\/json" id="tm-vowels-copy">([\s\S]*?)<\/script>/)[1]);
  check('the fallback copy inside the piece is identical to reference/vowels.json', JSON.stringify(copy) === JSON.stringify(V), `${JSON.stringify(copy).length} bytes`);
}

// ── step 1 · one joint ──────────────────────────────────────────────────────
{
  let worst = 0, narrowUp = true;
  for (let s = -2; s <= 2.0001; s += 0.01) {
    const j = TM.junction(4, 4 * 10 ** s); worst = Math.max(worst, Math.abs(j.eSum - 1));
    if (j.k > 0 && !(j.pOn > 1)) narrowUp = false;
  }
  check('step 1: power turned back + power carried on = 1 at every slider position', worst < 1e-12, `worst miss ${worst.toExponential(1)}`);
  check('step 1: a narrowing joint carries on more pressure than went in', narrowUp, 'k > 0 ⇒ 1 + k > 1');
  const e = TM.junction(4, 0.04), o = TM.junction(4, 400);
  check('step 1: the slider ends reach a near-closed and a near-open end', e.k > 0.97 && o.k < -0.97, `k ${e.k.toFixed(3)} / ${o.k.toFixed(3)}`);
}

// ── the engine against the Python reference ─────────────────────────────────
{
  const py = `
import sys, json, numpy as np
sys.path.insert(0, ${JSON.stringify(join(HERE, 'reference'))})
import kl_reference as K
d = json.load(open(${JSON.stringify(join(HERE, 'reference/vowels.json'))}))
A = K.resample_area(d['vowels']['a']['area_cm2'], 22)
ir = K.tract_impulse_response(A, 44100, n=2048, radiation_lowpass=0.0)
print(json.dumps({'A': A.tolist(), 'ir': ir.tolist()}))`;
  let ref = null;
  try { ref = JSON.parse(execFileSync('python3', ['-c', py], { encoding: 'utf8' })); } catch (err) { check('engine vs Python reference', false, 'python3 run failed: ' + err.message.split('\n')[0]); }
  if (ref) {
    const A = TM.resample(V.vowels.a.area_cm2, 22);
    const dA = Math.max(...A.map((v, i) => Math.abs(v - ref.A[i])));
    const ir = TM.tubeIR(A, TM.SHIPPED, { maxN: 2048, minN: 2048 });
    const pk = Math.max(...ref.ir.map(Math.abs)); let dI = 0; for (let i = 0; i < 2048; i++) dI = Math.max(dI, Math.abs(ir[i] - ref.ir[i]));
    check('engine: log-area resample matches kl_reference.resample_area', dA < 1e-12, `max diff ${dA.toExponential(1)}`);
    check('engine: the tube\'s click matches KellyLochbaumTract (radiation off, lowpass 0)', dI / pk < 1e-12, `max diff ${(dI / pk).toExponential(1)} of peak over 2048 samples`);
  }
}

// ── step 2 · a straight tube ────────────────────────────────────────────────
{
  const cp = V.vowels.schwa.area_cm2; const uniform = Math.max(...cp) - Math.min(...cp) < 1e-9;
  check('step 2: vowels.json schwa is a uniform tube', uniform, `${cp.length} points`);
  const pk = TM.formants(TM.resample(cp, N), TM.SHIPPED);
  const qw = [1, 3, 5].map((m) => m * TM.C / (4 * TM.L));
  const miss = Math.max(...pk.map((p, i) => Math.abs(p - qw[i])));
  check('step 2: the straight tube rings at the quarter-wave notes', miss < 2.5, `${pk.map((p) => p.toFixed(1)).join(' / ')} vs ${qw.map((q) => q.toFixed(1)).join(' / ')}`);
}

// ── step 3 · six vowels ─────────────────────────────────────────────────────
for (const v of VOW) {
  const pk = TM.formants(TM.resample(V.vowels[v].area_cm2, N), TM.SHIPPED);
  const tg = V.vowels[v].formant_targets_hz, meas = V.vowels[v].formants_measured_44k_hz;
  const errT = Math.max(...pk.map((p, i) => Math.abs(p - tg[i]) / tg[i] * 100));
  const errM = Math.max(...pk.map((p, i) => Math.abs(p - meas[i])));
  check(`step 3: /${v}/ lands on Peterson–Barney within the report's tolerance`, errT < 1, `${pk.map((p) => p.toFixed(0)).join(' / ')} Hz, worst ${errT.toFixed(2)} %`);
  check(`step 3: /${v}/ peaks agree with the reference's pole formants`, errM < 1.5, `worst ${errM.toFixed(2)} Hz`);
}

// ── step 4 · the morph ──────────────────────────────────────────────────────
{
  const morph = (t) => t <= 1 ? TM.blendLog(V.vowels.a.area_cm2, V.vowels.i.area_cm2, t) : TM.blendLog(V.vowels.i.area_cm2, V.vowels.u.area_cm2, t - 1);
  let kmax = 0;
  for (let t = 0; t <= 2.0001; t += 0.01) for (const k of TM.kFromAreas(TM.resample(morph(t), N))) kmax = Math.max(kmax, Math.abs(k));
  check('step 4: every joint stays inside (−1, 1) along the whole morph', kmax < 1, `largest |k| ${kmax.toFixed(3)}`);
  for (const [t, v] of [[0, 'a'], [1, 'i'], [2, 'u']]) {
    const pk = TM.formants(TM.resample(morph(t), N), TM.SHIPPED), tg = V.vowels[v].formant_targets_hz;
    const err = Math.max(...pk.slice(0, 2).map((p, i) => Math.abs(p - tg[i]) / tg[i] * 100));
    check(`step 4: the morph at t = ${t} lands on /${v}/`, err < 1, `F1/F2 ${pk[0].toFixed(0)} / ${pk[1].toFixed(0)}`);
  }
}

// ── step 5 · the mirror ─────────────────────────────────────────────────────
const shippedGaps = {};
for (const v of VOW) {
  const A = TM.resample(V.vowels[v].area_cm2, N);
  for (const m of ['ideal', 'shipped']) {
    const model = m === 'ideal' ? TM.IDEAL : TM.SHIPPED, rb = TM.readBack(A, model);
    const irB = TM.tubeIR(rb.areas, { rg: 1, rl: rb.lip, loss: 1 }, { maxN: rb.ir.length, minN: rb.ir.length });
    const same = TM.sameSound(rb.ir, irB);
    if (m === 'ideal') {
      check(`step 5: ideal /${v}/ — the sound gives back the tube's own ladder`, rb.gap < 1e-4 && Math.abs(rb.lip + 0.9) < 1e-4,
        `gap ${rb.gap.toExponential(1)}, lip rung ${rb.lip.toFixed(5)}, ${rb.irLen} samples`);
    } else shippedGaps[v] = rb;
    check(`step 5: ${m} /${v}/ — odd rungs are zero`, rb.oddMax < 1e-9, `max ${rb.oddMax.toExponential(1)}`);
    check(`step 5: ${m} /${v}/ — the read-back tube makes the same sound`, same.miss < 1e-9, `miss ${same.miss.toExponential(1)} of peak`);
  }
}
{
  const g = Object.fromEntries(Object.entries(shippedGaps).map(([v, rb]) => [v, rb.gap]));
  console.log('      shipped gaps (shape k vs sound k):', Object.entries(shippedGaps).map(([v, rb]) => `/${v}/ ${rb.gap.toFixed(3)} @ joint ${rb.gapAt + 1}, lip ${rb.lip.toFixed(3)}`).join(' · '));
  check('step 5: as shipped, the read-back ladder parts from the shape (losses read as shape)', g.a > 0.2 && g.o > 0.5 && g.schwa < 1e-6, `/a/ ${g.a.toFixed(3)}, /o/ ${g.o.toFixed(3)}, schwa ${g.schwa.toExponential(1)}`);
}

// ── the worklet ─────────────────────────────────────────────────────────────
{
  const src = html.match(/const WORKLET = `([\s\S]*?)`;/)[1];
  for (const sr of [44100, 48000]) {
    let Cls; class AWP { constructor() { this.port = { onmessage: null, postMessage() {} }; } }
    new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(AWP, (_n, C) => { Cls = C; }, sr);
    const p = new Cls(); const send = (d) => p.port.onmessage({ data: d });
    const n = TM.nSections(sr);
    const run = (sec) => { const L = new Float32Array(128), R = new Float32Array(128); let peak = 0, nan = false, ss = 0, cnt = 0;
      for (let b = 0; b < Math.round(sec * sr / 128); b++) { p.process([], [[L, R]]); for (const x of L) { if (!Number.isFinite(x)) nan = true; peak = Math.max(peak, Math.abs(x)); ss += x * x; cnt++; } }
      return { peak, nan, rms: Math.sqrt(ss / cnt) }; };
    let worst = { peak: 0, nan: false, minRms: 1 };
    for (const v of VOW) {
      send({ areas: TM.resample(V.vowels[v].area_cm2, n), ...TM.SHIPPED, lp: 0.75, f0: 110, on: true, snap: true, reset: true });
      run(0.6); const r = run(0.6); worst.peak = Math.max(worst.peak, r.peak); worst.nan ||= r.nan; worst.minRms = Math.min(worst.minRms, r.rms);
    }
    for (const m of ['ideal', 'shipped']) {
      const rb = TM.readBack(TM.resample(V.vowels.o.area_cm2, n), m === 'ideal' ? TM.IDEAL : TM.SHIPPED);
      send({ areas: rb.areas, rg: 1, rl: rb.lip, loss: 1, lp: 0, on: true, snap: true, reset: true });
      run(0.6); const r = run(0.6); worst.peak = Math.max(worst.peak, r.peak); worst.nan ||= r.nan; worst.minRms = Math.min(worst.minRms, r.rms);
    }
    check(`worklet at ${sr / 1000} kHz (${n} sections): every vowel and both read-back tubes sound, finite and bounded`, !worst.nan && worst.peak < 1.2 && worst.minRms > 0.02,
      `peak ${worst.peak.toFixed(2)} before the compressor, quietest rms ${worst.minRms.toFixed(3)}`);
    send({ on: false }); run(1.0); const off = run(0.2);
    check(`worklet at ${sr / 1000} kHz: stop goes silent`, off.peak < 1e-4, `peak after stop ${off.peak.toExponential(1)}`);
  }
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
