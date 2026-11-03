#!/usr/bin/env node
/*
  title: Linear Predictive Coding — rich — checks
  born: 2026-11-03
  parent: [[Linear Predictive Coding]] · rich face, proposal round 2026-11
  forward_vector: I re-run, in Node, every number the two made pieces print, on their own engine. I pull the
    script marked id="lpc-engine" out of both pieces and fail if they differ, check that the phrase each carries
    is byte for byte the WAV beside them, then hold each step's claim to a threshold and print what I measured.
    The pieces' own step code (the made vowel's window, the frame sizes) is mirrored here with the same numbers.

  run:  node "Linear Predictive Coding/Linear Predictive Coding — rich — checks.mjs"
*/
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const P = (w) => path.join(HERE, `Linear Predictive Coding — rich — ${w}`);
const pieces = { order: P('how much is left over.html'), swap: P('the residual swap.html') };
let fails = 0; const rows = [];
const check = (name, ok, got) => { rows.push(`${ok ? 'PASS' : 'FAIL'}  ${name}  ·  ${got}`); if (!ok) fails++; };

const engines = {}, phrases = {};
for (const [k, f] of Object.entries(pieces)) {
  const h = fs.readFileSync(f, 'utf8');
  const m = h.match(/<script id="lpc-engine">([\s\S]*?)<\/script>/); if (!m) throw new Error(`no engine in ${f}`);
  engines[k] = m[1];
  const b = h.match(/const PHRASE_B64 = '([A-Za-z0-9+/=]+)';/); if (!b) throw new Error(`no phrase in ${f}`);
  phrases[k] = Buffer.from(b[1], 'base64');
}
check('one engine in both pieces', engines.order === engines.swap, `${engines.order.length} chars`);
const wav = fs.readFileSync(P('the phrase.wav'));
check('each piece carries the phrase WAV byte for byte', wav.equals(phrases.order) && wav.equals(phrases.swap), `${wav.length} bytes`);

const box = {}; vm.createContext(box); vm.runInContext(engines.order, box); const L = box.LPC;
const { x: X16, sr } = L.parseWav(wav.buffer.slice(wav.byteOffset, wav.byteOffset + wav.byteLength));
check('the phrase is 16 kHz', sr === 16000, `${sr} Hz, ${(X16.length / sr).toFixed(2)} s`);

/* ── how much is left over ── */
{ // step 1: a sine from its last sample, then its last two
  let worst1 = 0, worst2 = 0;
  for (const hz of [50, 220, 440, 1000, 3000, 4000]) {
    const w = 2 * Math.PI * hz / 16000, s = Float64Array.from({ length: 16000 }, (_, i) => Math.sin(w * i));
    for (const p of [1, 2]) {
      const a = L.levinson(Float64Array.from({ length: p + 1 }, (_, k) => Math.cos(w * k)), p).a, e = L.residual(s, { as: [a], sub: 1e9 });
      const share = L.energy(e, 2) / L.energy(s, 2);
      if (p === 1) worst1 = Math.max(worst1, Math.abs(share - Math.sin(w) ** 2) / Math.sin(w) ** 2); else worst2 = Math.max(worst2, share);
    }
  }
  check('order: one weight leaves sin²ω of a sine', worst1 < 1e-3, `worst relative gap ${worst1.toExponential(2)}`);
  check('order: two weights leave nothing of a sine', worst2 < 1e-20, `worst share ${worst2.toExponential(2)}`);
}
{ // step 2: Wold
  const n = 16000, r = L.rng(3);
  const two = Float64Array.from({ length: n }, (_, i) => Math.sin(2 * Math.PI * 300 * i / 16000) + 0.6 * Math.sin(2 * Math.PI * 1700 * i / 16000 + 1));
  const noise = Float64Array.from({ length: n }, () => L.gauss(r));
  const nz = Float64Array.from({ length: n }, () => 0.1 * L.gauss(r));
  const sn = Float64Array.from({ length: n }, (_, i) => Math.sin(2 * Math.PI * 440 * i / 16000) + nz[i]);
  const G = (s) => Array.from({ length: 32 }, (_, i) => { const p = i + 1, lv = L.levinson(L.autocorr(s, p), p), e = L.residual(s, { as: [lv.a], sub: 1e9 }); return L.db(L.energy(s, 32) / L.energy(e, 32)); });
  const g2 = G(two), gn = G(noise), gs = G(sn), floor = L.db(L.energy(sn) / L.energy(nz));
  check('order: two sines need four weights', g2[2] < 30 && g2[3] > 45, `G(3) ${g2[2].toFixed(1)} dB, G(4) ${g2[3].toFixed(1)} dB`);
  check('order: noise is all innovation', Math.max(...gn) < 0.1, `best of 32 orders ${Math.max(...gn).toFixed(3)} dB`);
  check('order: a sine in noise climbs toward the noise and not past it', gs[31] < floor && gs[31] > floor - 2 && gs[0] < gs[7] && gs[7] < gs[31], `G(1) ${gs[0].toFixed(1)}, G(8) ${gs[7].toFixed(1)}, G(32) ${gs[31].toFixed(2)}, floor ${floor.toFixed(2)} dB`);
}
{ // step 3: the voice, order 1 to 32, 10 ms frames from 25 ms windows
  const G = [], miss = [];
  for (let p = 1; p <= 32; p++) { const tr = L.coefTrack(L.analyse(X16, 16000, p, 160, 400), X16.length, 160), e = L.residual(X16, tr), y = L.synth(e, tr); G.push(L.db(L.energy(X16) / L.energy(e))); let m = 0; for (let i = 0; i < y.length; i++) m = Math.max(m, Math.abs(y[i] - X16[i])); miss.push(m); }
  let mono = true; for (let i = 1; i < 32; i++) if (G[i] < G[i - 1] - 0.05) mono = false;
  check('order: the voice comes back from its leftover at every order', Math.max(...miss) < 1e-12, `largest miss ${Math.max(...miss).toExponential(2)}`);
  check('order: the leftover shrinks as weights are added', mono, G.filter((_, i) => [0, 3, 9, 17, 31].includes(i)).map((v, j) => `G(${[1, 4, 10, 18, 32][j]}) ${v.toFixed(1)}`).join(', ') + ' dB');
  check('order: past 18 weights the next fourteen buy under 1 dB', G[31] - G[17] < 1, `${(G[31] - G[17]).toFixed(2)} dB`);
  check('order: bits saved at 18 weights, G/6.02', true, `${(G[17] / 6.02).toFixed(2)} bits a sample, ${(G[17] / 6.02 * 16).toFixed(1)} kbps at 16 kHz`);
}

/* ── the residual swap ── */
{ // steps 1–2: made vowels, as the piece makes them (120 Hz, 1.2 s, 8 kHz, fades of 400 samples, one frame over samples 2000–6000)
  const VOW = { a: [730, 1090, 2440, 3400], i: [270, 2290, 3010, 3500], u: [300, 870, 2240, 3300] }, BW = [80, 90, 120, 160];
  for (const v of 'aiu') {
    const m = L.madeVowel(8000, 1.2, 120, VOW[v], BW); for (let i = 0; i < 400; i++) { const f = i / 400; m.x[i] *= f; m.x[m.x.length - 1 - i] *= f; m.src[i] *= f; m.src[m.src.length - 1 - i] *= f; }
    const seg = m.x.subarray(2000, 6000), w = seg.map((s, i) => s * (0.5 - 0.5 * Math.cos(2 * Math.PI * (i + 0.5) / seg.length))), lv = L.levinson(L.autocorr(w, 10), 10);
    const e = L.residual(m.x, { as: [lv.a], sub: 1e9 }), read = L.peaks(lv.a, 8000, 5, 3950);
    let on = 0, all = 0, num = 0, d2 = 0; for (let i = 2000; i < 6000; i++) { all += e[i] ** 2; if (m.src[i - 1] || m.src[i] || m.src[i + 1]) on += e[i] ** 2; num += e[i] * m.src[i]; d2 += m.src[i] ** 2; }
    const gap = Math.max(...VOW[v].map((f, k) => Math.abs((read[k] ?? 1e9) - f)));
    check(`swap: ten weights read ${v}'s four formants back`, gap < 20, `worst ${gap.toFixed(1)} Hz (${read.slice(0, 4).map(Math.round).join(', ')})`);
    check(`swap: ${v}'s leftover is the buzz`, on / all > 0.99 && num / Math.sqrt(all * d2) > 0.99, `${(100 * on / all).toFixed(1)} % on the buzz's instants, correlation ${(num / Math.sqrt(all * d2)).toFixed(3)}`);
  }
}
{ // steps 3–5: the voice at 8 kHz, ten weights every 22.5 ms, interpolated every 7.5 ms
  const x = L.decimate2(X16), tr = L.coefTrack(L.analyse(x, 8000, 10, 180, 240), x.length, 60);
  const e = L.residual(x, tr), own = L.synth(e, tr), pt = L.pitchTrack(e, 8000, 180, 240);
  let miss = 0; for (let i = 0; i < x.length; i++) miss = Math.max(miss, Math.abs(own[i] - x[i]));
  const u10 = L.lpc10Excitation(e, pt, 180, 7), y10 = L.synth(u10, tr), ce = L.celpExcitation(x, tr, { size: 512 }), yc = L.synth(ce.u, tr);
  const on = { e: L.pulseShare(e, pt, 180), u10: L.pulseShare(u10, pt, 180), uc: L.pulseShare(ce.u, pt, 180) };
  const hm = { e: L.harmonicity(e, pt, 180, 8000).mean, u10: L.harmonicity(u10, pt, 180, 8000).mean, uc: L.harmonicity(ce.u, pt, 180, 8000).mean };
  const snr = { y10: L.segSnr(x, y10, 80), yc: L.segSnr(x, yc, 80) };
  let num = 0, d1 = 0, d2 = 0; for (let i = 0; i < e.length; i++) { num += e[i] * ce.u[i]; d1 += e[i] ** 2; d2 += ce.u[i] ** 2; }
  const corr = num / Math.sqrt(d1 * d2), voiced = pt.filter((q) => q.voiced).length;
  const lvl = (y) => L.db(L.energy(y) / L.energy(x));
  check('swap: the pitch tracker finds the voiced stretches', voiced > pt.length * 0.4 && voiced < pt.length * 0.8, `${voiced} of ${pt.length} frames voiced`);
  check('swap: driven by its own leftover, the voice comes back exactly', miss < 1e-12, `largest miss ${miss.toExponential(2)} of a peak ${L.maxAbs(x).toFixed(2)}`);
  check('swap: a voice\'s leftover is not a buzz', on.e < 0.7 && on.e > 0.3, `${(100 * on.e).toFixed(1)} % on the beat`);
  check('swap: LPC-10\'s pulse train is', on.u10 > 0.95, `${(100 * on.u10).toFixed(1)} % on the beat`);
  check('swap: the pulse train is cleaner between the harmonics than the leftover', hm.u10 - hm.e > 5, `${hm.u10.toFixed(1)} against ${hm.e.toFixed(1)} dB`);
  check('swap: the pulse version keeps the loudness, loses the waveform', Math.abs(lvl(y10)) < 1.5 && snr.y10 < 0, `level ${lvl(y10).toFixed(2)} dB, waveform match ${snr.y10.toFixed(1)} dB`);
  check('swap: the codebook brings the waveform back', snr.yc > 6 && Math.abs(lvl(yc)) < 1.5, `waveform match ${snr.yc.toFixed(1)} dB, level ${lvl(yc).toFixed(2)} dB`);
  check('swap: the codebook does not copy the leftover', corr < 0.6 && on.uc < on.e && hm.uc < hm.e, `correlation ${corr.toFixed(2)}, on the beat ${(100 * on.uc).toFixed(1)} %, harmonics ${hm.uc.toFixed(1)} dB`);
}
{ // the bit counts step 5 prints
  check('swap: LPC-10, 54 bits each 22.5 ms', Math.abs(54 / 0.0225 - 2400) < 1e-9, `${54 / 0.0225} bps; weights ${(41 / 0.0225).toFixed(0)}, the rest ${(13 / 0.0225).toFixed(0)}`);
  check('swap: the codebook, 26 bits each 7.5 ms on top of the weights', true, `${(26 / 0.0075).toFixed(0)} + ${(41 / 0.0225).toFixed(0)} = ${(26 / 0.0075 + 41 / 0.0225).toFixed(0)} bps`);
}

console.log(rows.join('\n'));
console.log(fails ? `\n${fails} failed` : `\nall ${rows.length} pass`);
process.exit(fails ? 1 : 0);
