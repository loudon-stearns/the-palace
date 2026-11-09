#!/usr/bin/env node
// Auditory Illusions — rich — check — meaning-gets-in-early.mjs
// born: 2026-11-08 · checks the four pieces of § Meaning gets in early, on their own code, pulled out of the pages:
//   who rewrites whom · the seesaw · the talking socket · the loop that sings
// It measures what can be measured in Node: frequencies, lengths, timings, levels, formants, delays, chance levels,
// and the Mooney print. What only an ear (or an eye) can judge, it cannot: whether anyone hears da, Yanny, a phantom
// word or a song. Run from anywhere: node "Auditory Illusions/Auditory Illusions — rich — check — meaning-gets-in-early.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const P = (w) => join(here, `Auditory Illusions — rich — ${w}.html`);
const pages = { who: P('who rewrites whom'), see: P('the seesaw'), sock: P('the talking socket'), song: P('the loop that sings') };
const src = Object.fromEntries(Object.entries(pages).map(([k, f]) => [k, readFileSync(f, 'utf8')]));
const block = (s, id) => { const m = s.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`)); if (!m) throw new Error('no script ' + id); return m[1]; };
let fails = 0; const ok = (c, msg) => { console.log(`${c ? 'ok  ' : 'FAIL'}  ${msg}`); if (!c) fails++; };
const f1 = (x) => x.toFixed(1), f0 = (x) => x.toFixed(0);

console.log('── shared code ──');
for (const id of ['ai-voice', 'ai-ui']) { const a = block(src.who, id); ok(Object.values(src).every((s) => block(s, id) === a), `${id} is byte for byte the same in all four pieces (${a.length} chars)`); }
const ctx = vm.createContext({ Math, Float32Array, Float64Array, Uint8Array, Array, Object, console });
vm.runInContext(block(src.who, 'ai-voice') + '\nthis.VB = VB;', ctx);
const VB = ctx.VB, SR = VB.SR;
const load = (s, id, name) => { vm.runInContext(block(s, id) + `\nthis.${name} = ${name};`, ctx); return ctx[name]; };
const FL = load(src.who, 'mge-who', 'FL'), SW = load(src.see, 'mge-seesaw', 'SW'), PW = load(src.sock, 'mge-socket', 'PW'), SG = load(src.song, 'mge-song', 'SG');

// ── measuring tools, written here, not taken from the pages ──
function lpc(x, t, order = 12) { // formant peaks of a 25 ms frame at t, by LPC on a 4× decimated copy
  const lp = VB.biquad('lowpass', 4500, 0.707), y = VB.filter(VB.filter(x, lp), lp), d = []; for (let i = 0; i < y.length; i += 4) d.push(y[i]);
  const sr = SR / 4, N = Math.round(0.025 * sr), c = Math.round(t * sr), w = [];
  for (let i = 0; i < N; i++) { const j = c - Math.floor(N / 2) + i; w.push((d[j] || 0) * (0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1)))); }
  const R = []; for (let k = 0; k <= order; k++) { let s = 0; for (let i = k; i < N; i++) s += w[i] * w[i - k]; R.push(s); } R[0] *= 1.0001;
  let a = [1], E = R[0]; for (let i = 1; i <= order; i++) { let acc = R[i]; for (let j = 1; j < i; j++) acc += a[j] * R[i - j]; const k = -acc / E, na = a.slice(); na[i] = k; for (let j = 1; j < i; j++) na[j] = a[j] + k * a[i - j]; a = na; E *= 1 - k * k; }
  const env = []; for (let f = 0; f <= 5000; f += 10) { const wv = 2 * Math.PI * f / sr; let re = 0, im = 0; a.forEach((v, j) => { re += v * Math.cos(wv * j); im -= v * Math.sin(wv * j); }); env.push([f, -10 * Math.log10(re * re + im * im)]); }
  const pk = []; for (let i = 1; i < env.length - 1; i++) if (env[i][1] > env[i - 1][1] && env[i][1] > env[i + 1][1] && env[i][0] > 150) pk.push(env[i][0]); return pk;
}
function bandPeak(x, t, lo, hi) { // the strongest harmonic between lo and hi in a 20 ms frame at t
  const N = 4096, re = new Float64Array(N), im = new Float64Array(N), c = Math.round(t * SR), L = Math.round(0.02 * SR);
  for (let i = 0; i < L; i++) { const j = c - L / 2 + i; re[i] = (x[j] || 0) * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / L)); } VB.fft(re, im);
  let best = 0, bf = 0; for (let k = 1; k < N / 2; k++) { const f = k * SR / N; if (f < lo || f > hi) continue; const p = re[k] ** 2 + im[k] ** 2; if (p > best) { best = p; bf = f; } } return bf;
}
const peakIn = (x, a, b) => { let p = 0; for (let i = Math.round(a * SR); i < Math.round(b * SR); i++) p = Math.max(p, Math.abs(x[i])); return p; };
function onsetsOf(x, thr = 0.02) { const on = []; let inside = false, last = -1e9; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]) > thr; if (a && !inside && i - last > 0.01 * SR) on.push(i); if (a) last = i; inside = a ? true : i - last < 0.002 * SR; } return on; }
function bandEnergy(x, lo, hi) { const N = 1 << Math.ceil(Math.log2(x.length)), re = new Float64Array(N), im = new Float64Array(N); re.set(x); VB.fft(re, im); let e = 0; for (let k = 1; k < N / 2; k++) { const f = k * SR / N; if (f >= lo && f < hi) e += re[k] ** 2 + im[k] ** 2; } return e; }

console.log('\n── who rewrites whom: the firefly ──');
for (const n of [1, 2]) {
  const x = FL.chirps(n), on = onsetsOf(x, 0.01);
  ok(on.length === n, `${n} chirp${n > 1 ? 's' : ''}: ${on.length} onset${on.length > 1 ? 's' : ''} found`);
  const seg = x.subarray(on[0], on[0] + Math.round(0.007 * SR)); let zc = 0; for (let i = 1; i < seg.length; i++) if (seg[i - 1] < 0 && seg[i] >= 0) zc++;
  let len = 0; for (let i = on[0]; i < x.length && i < on[0] + 0.02 * SR; i++) if (Math.abs(x[i]) > 0.003) len = i - on[0];
  console.log(`      onset ${f1(on[0] / SR * 1000 - FL.LEAD * 1000)} ms from the event · pitch by zero crossings ≈ ${f0(zc / 0.007)} Hz · audible length ${f1(len / SR * 1000)} ms${n === 2 ? ` · onsets ${f1((on[1] - on[0]) / SR * 1000)} ms apart` : ''}`);
  if (n === 2) ok(Math.abs((on[1] - on[0]) / SR - 0.057) < 0.0015, 'the two chirps start 57 ms apart (±1.5 ms by threshold)');
}
// flashes: the most in any second, over a fast reader's twelve trials (each starts the moment the last allows)
{ const ts = []; let t = 0; for (let k = 0; k < 12; k++) { const arm = FL.ARMS[k % 4]; const ev = t + 0.75; FL.flashes(arm.f).forEach((d) => ts.push(ev + d)); t = ev + (arm.f === 2 ? FL.FGAP : 0) + FL.MINGAP; }
  const m = FL.maxPerSecond(ts); ok(m <= 2, `flashes: at most ${m} in any one second across a fast run of twelve trials (two blinks are ${FL.FGAP * 1000} ms apart; a trial waits ${FL.MINGAP} s after the last flash)`); }
ok(Math.abs(FL.coinBeats(2 / 3) - 7 / 64) < 1e-12, `chance stated for the flash rule: P(coin passes split ≥ ⅔) = ${FL.coinBeats(2 / 3).toFixed(4)} = 7/64`);
ok(Math.abs(FL.coinPassesAll() - 3 / 512) < 1e-12, `chance stated for the whole flash rule (split and the eye check): ${(100 * FL.coinPassesAll()).toFixed(2)}% = 3/512`);
ok(!/data-t="3"/.test(src.who), 'the test pad offers 1 or 2 only, so the coin figures hold for the pad as offered');
// the rule, by simulation: a coin-guesser, 200000 runs
{ const r = VB.rng(3); let pass = 0, n = 200000; for (let k = 0; k < n; k++) { let a = 0, b = 0; for (let i = 0; i < 3; i++) { a += r() < 0.5 ? 1 : 2; b += r() < 0.5 ? 1 : 2; } if ((b - a) / 3 >= 2 / 3 - 1e-9) pass++; } console.log(`      simulated coin-guesser passes ${(100 * pass / n).toFixed(2)}% (stated 10.9%)`); }

console.log('\n── who rewrites whom: the mouth ──');
for (const [name, c] of [['ba', 0], ['da', 0.5], ['ga', 1]]) {
  const x = VB.render(VB.syllable(c), 3), p = VB.place(c);
  const burst = 20 * Math.log10(peakIn(x, VB.REL, VB.REL + 0.012) / peakIn(x, 0.15, 0.3));
  const f2 = bandPeak(x, VB.REL + 0.02, 800, 2100), f2v = bandPeak(x, 0.25, 800, 2100), pk = lpc(x, 0.25);
  console.log(`      ${name}: burst ${f1(burst)} dB against the vowel's peak · strongest harmonic in the F2 region 20 ms after the release ${f0(f2)} Hz (stated onset ${f0(p.F2)}, gliding to 1220) · vowel formants by LPC ${pk.slice(0, 3).join(' / ')} Hz`);
}
{ const ba = VB.render(VB.syllable(0), 3), ga = VB.render(VB.syllable(1), 3);
  ok(bandPeak(ba, VB.REL + 0.02, 800, 2100) < bandPeak(ga, VB.REL + 0.02, 800, 2100), 'the F2 region starts lower for ba than for ga, measured');
  ok(peakIn(ba, VB.REL, VB.REL + 0.012) / peakIn(ba, 0.15, 0.3) < peakIn(ga, VB.REL, VB.REL + 0.012) / peakIn(ga, 0.15, 0.3), 'the ba burst is weaker than the ga burst, measured'); }
for (const k of ['ga', 'ba']) { const m0 = FL.mouth(k, 0), m1 = FL.mouth(k, -0.05), m2 = FL.mouth(k, 0.1); console.log(`      mouth ${k}: open ${m1.open.toFixed(2)} at −50 ms, ${m0.open.toFixed(2)} at the release (press ${m0.press.toFixed(2)}), ${m2.open.toFixed(2)} at +100 ms`); }
ok(FL.mouth('ga', 0).open > 0.1 && FL.mouth('ba', 0).open === 0 && FL.mouth('ba', -0.05).press === 1, 'at the release the ga mouth is open and the ba mouth is pressed shut');
ok(Math.abs(FL.lipChance() - 0.84375 * 0.15625) < 1e-12, `chance stated for the lip rule: ${(100 * FL.lipChance()).toFixed(1)}% (P(≥2 of 3) × P(≤1 of 3), each “not ba” 3 in 4)`);

console.log('\n── the seesaw ──');
{ const L = VB.render(VB.laurel(), 7), Y = VB.render(VB.yanny(), 9);
  console.log('      Laurel, LPC peaks: ' + [0.04, 0.2, 0.32, 0.45].map((t) => `${t * 1000} ms ${lpc(L, t).slice(0, 3).join('/')}`).join(' · '));
  console.log('      Yanny,  LPC peaks: ' + [0.04, 0.2, 0.32, 0.45].map((t) => `${t * 1000} ms ${lpc(Y, t).slice(0, 3).join('/')}`).join(' · '));
  const NM = VB.names(); const own = (x, lo, hi) => bandEnergy(x, lo, hi) / bandEnergy(x, 20, 20000);
  const sl = own(NM.laurel, 20, VB.XO), sy = own(NM.yanny, VB.XO, 20000), ly = own(NM.yanny, 20, 1000), hl = own(NM.laurel, 2500, 20000);
  ok(sl > 0.97 && ly < 0.01 && hl < 0.01, `each layer keeps to its side of ${VB.XO} Hz: Laurel ${(100 * sl).toFixed(1)}% below it (${(100 * hl).toFixed(2)}% above 2.5 kHz); Yanny ${(100 * sy).toFixed(1)}% above it, almost all the rest between 1 and 1.6 kHz (${(100 * ly).toFixed(2)}% below 1 kHz)`);
  const mixed = Float32Array.from(NM.laurel, (v, i) => v + NM.yanny[i]);
  const bal = (T) => { const c = SW.shelves(T); const y = VB.filter(VB.filter(mixed, c.low), c.high); return 10 * Math.log10(bandEnergy(y, VB.XO, 20000) / bandEnergy(y, 20, VB.XO)); };
  const TILTS = [-18, -12, -6, 0, 6, 12, 18];
  const row = TILTS.map((T) => `${T > 0 ? '+' : ''}${T}: ${f1(bal(T))}`); console.log('      energy above minus below 1.6 kHz, through the tilt, rendered (tilt dB: balance dB): ' + row.join(' · '));
  const b = TILTS.map(bal); ok(b.every((v, i) => !i || v > b[i - 1]), 'the balance rises with every step of tilt');
  const sh = SW.shelves(12); console.log(`      the shelves at +12: ${f1(VB.gainAt(sh.low, 100) + VB.gainAt(sh.high, 100))} dB at 100 Hz, ${f1(VB.gainAt(sh.low, VB.XO) + VB.gainAt(sh.high, VB.XO))} dB at 1.6 kHz, ${f1(VB.gainAt(sh.low, 8000) + VB.gainAt(sh.high, 8000))} dB at 8 kHz`);
  // loudness: the mix's RMS through the shelves, before and after the makeup gain, against the level beam (off the whole dB too)
  const MK = SW.makeupTable(mixed), r0 = VB.rms(mixed), lvl = (T, mk) => { const c = SW.shelves(T); return 20 * Math.log10(VB.rms(VB.filter(VB.filter(mixed, c.low), c.high)) / r0) + (mk ? SW.makeup(MK, T) : 0); };
  const LT = [-24, -18, -12.5, -6, -2.3, 0, 3.7, 6, 12, 18, 24], before = LT.map((T) => lvl(T, false)), after = LT.map((T) => lvl(T, true));
  console.log('      level against the level beam, dB RMS (tilt: without makeup → with): ' + LT.map((T, i) => `${T}: ${before[i] >= 0 ? '+' : ''}${before[i].toFixed(1)} → ${after[i] >= 0 ? '+' : ''}${after[i].toFixed(2)}`).join(' · '));
  ok(Math.max(...after.map(Math.abs)) < 0.1, `loudness held: every tilt within ${Math.max(...after.map(Math.abs)).toFixed(3)} dB of the level beam after makeup (it was up to ${Math.max(...before).toFixed(1)} dB louder without)`);
  // the staircase: how often random answers find a flip point, and whether a clean listener's is found where it is
  const rr = VB.rng(5), runs = 50000, K = {}; for (let k = 0; k < runs; k++) { const A = SW.stair(SW.STARTS[0]), B = SW.stair(SW.STARTS[1]); for (let i = 0; i < 2 * SW.PER; i++) { const st = A.track.length < SW.PER && (B.track.length >= SW.PER || rr() < 0.5) ? A : B; SW.answer(st, ['laurel', 'yanny', 'neither'][Math.floor(rr() * 3)]); } const v = SW.verdict(A, B).kind; K[v] = (K[v] || 0) + 1; }
  console.log('      random answers, verdicts: ' + Object.entries(K).map(([k, v]) => `${k} ${(100 * v / runs).toFixed(2)}%`).join(' · '));
  ok((K.found || 0) / runs < 0.005, `random answers find a flip point ${(100 * (K.found || 0) / runs).toFixed(2)}% of the time (stated 0.2%)`);
  for (const at of [-7, 0, 4, 11]) { const A = SW.stair(SW.STARTS[0]), B = SW.stair(SW.STARTS[1]); for (let i = 0; i < 2 * SW.PER; i++) { const st = i % 2 ? A : B; SW.answer(st, st.T > at ? 'yanny' : 'laurel'); } const v = SW.verdict(A, B); ok(v.kind === 'found' && Math.abs(v.flip - at) < 3, `a clean listener flipping at ${at} dB is found at ${v.flip == null ? '—' : f1(v.flip)} dB`); }
  { const A = SW.stair(SW.STARTS[0]), B = SW.stair(SW.STARTS[1]); for (let i = 0; i < 2 * SW.PER; i++) { const st = i % 2 ? A : B; SW.answer(st, st.T > 0 ? 'laurel' : 'yanny'); } ok(SW.verdict(A, B).kind === 'reversed', 'a listener whose Yanny sits low is called reversed, against the page'); }
}

console.log('\n── the talking socket ──');
{ const w = PW.words(), [L, R] = PW.loop(w, PW.WORD);
  ok(L.length === Math.round(PW.PERIOD * SR), `one loop is ${(L.length / SR * 1000).toFixed(1)} ms`);
  const len = (x) => { let a = -1, b = -1; for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > 0.003) { if (a < 0) a = i; b = i; } return (b - a) / SR * 1000; };
  console.log(`      "no" sounds for ${f0(len(w.no))} ms, "way" for ${f0(len(w.way))} ms, each in a ${PW.WORD * 1000} ms slot`);
  let best = 0, lag = 0; for (let k = 0; k < L.length; k += 10) { let s = 0; for (let i = 0; i < L.length; i++) s += L[i] * R[(i + k) % L.length]; if (s > best) { best = s; lag = k; } }
  ok(Math.abs(lag / SR - PW.WORD) < 0.001, `the right side lags the left by ${f1(lag / SR * 1000)} ms, by cross-correlation`);
  const at = (x, t) => { let s = 0; const a = Math.round(t * SR); for (let i = a; i < a + 0.05 * SR; i++) s += x[i] * x[i]; return s; };
  ok(at(L, 0.1) > 0 && Math.abs(at(R, 0.1) - at(L, 0.4)) / at(L, 0.4) < 1e-6, 'while the left says “no”, the right says “way” (the same samples, one word later)');
  const [L0, R0] = PW.loop(w, 0); ok(L0.every((v, i) => v === R0[i]), 'at no delay the two sides are identical: one sound, from the middle');
  for (const [n, x] of [['no', VB.render(VB.no(), 21)], ['way', VB.render(VB.way(), 22)]]) console.log(`      ${n}, LPC peaks: ` + [0.03, 0.15, 0.26].map((t) => `${t * 1000} ms ${lpc(x, t).slice(0, 3).join('/')}`).join(' · '));
  const nm = PW.named(PW.FIXED); ok(nm[2] === 'mouth' && nm[0] === 'eye' && nm[1] === 'eye', 'the fixed outlet: two slots above a round hole, the lowest called the mouth');
}

console.log('\n── the loop that sings ──');
{ const on = SG.onsets(1840, 600); const steps = on.slice(1).map((t, i) => t - on[i]);
  console.log(`      the grid, restated (not a test; the piece's own meter measures the real onsets): a 1840 ms phrase and 600 ms of silence give onsets ${steps[0]} ms apart`);
  ok(SG.PITCH.exact.every((p) => p === 1) && SG.PITCH.transposed.length === SG.REPS && new Set(SG.PITCH.transposed).size === SG.REPS, `transposed: ten different pitch settings, ${Math.min(...SG.PITCH.transposed)} to ${Math.max(...SG.PITCH.transposed)} (the browser's scale, not semitones)`);
  const js = Array.from({ length: SG.REPS }, (_, k) => SG.words('jumbled', k)); const same = js.filter((s) => s === SG.PHRASE).length;
  ok(js.every((s) => s.split(' ').sort().join() === SG.PHRASE.split(' ').sort().join()), `jumbled: always the same four words; ${same} of ${SG.REPS} in the original order`);
  ok(SG.SENTENCE.includes(SG.PHRASE), 'the phrase sits inside the sentence');
  const m = SG.mooney(); const rows = [0.4, 0.45, 0.5, 0.55, 0.6].map((t) => { const r = SG.measure(m, t); return `θ ${t}: ${(100 * r.black).toFixed(0)}% black, ${(100 * r.outlineKept).toFixed(0)}% of the outline on an edge`; });
  console.log('      Mooney print: ' + rows.join(' · '));
  let inside = 0, n = 0, out = 0, no = 0; for (let i = 0; i < m.W * m.H; i++) { if (m.mask[i]) { inside += m.gray[i]; n++; } else { out += m.gray[i]; no++; } }
  console.log(`      the dog fills ${(100 * n / (m.W * m.H)).toFixed(0)}% of the print; its mean brightness ${(inside / n).toFixed(2)} against the ground's ${(out / no).toFixed(2)}`);
}

console.log(`\n${fails ? fails + ' FAILED' : 'all checks pass'} · not measured: anything heard or seen. The voice box's syllables and names have never been listened to; the browser voice, its timing and its pitch cannot be reached from here.`);
process.exit(fails ? 1 : 0);
