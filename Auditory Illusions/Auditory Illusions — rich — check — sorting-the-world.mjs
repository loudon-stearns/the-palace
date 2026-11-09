// Auditory Illusions — rich — check — sorting-the-world.mjs
// born: 2026-11-08 · checks the four pieces of [[Auditory Illusions]] § Sorting the world into sources:
//   "the gallop" (auditory streaming), "two ears, two tunes" (the scale illusion),
//   "behind the fence" (the continuity illusion), "the gap that jumps" (the gap transfer illusion)
// forward_vector: I re-run, headless, what the four pieces say about their own sound: the gallop's timing and
// pitches, the scale illusion's left/right assignment, the continuity illusion's gap and its noise band against
// the ear's filter round the tone, the gap transfer illusion's crossing and gap; that each blind test's two arms
// differ only in the variable; and that every buffer peaks under the compressor's threshold, so what I measure is
// what plays. What a listener hears I cannot check: nobody has listened to these yet.
//
//   node "Auditory Illusions/Auditory Illusions — rich — check — sorting-the-world.mjs"
//
// It pulls each piece's engine (<script id="…-core">) out of its page and runs it in a Node sandbox, then measures
// the buffers that engine renders with equations and analysis written here on their own (zero crossings, Goertzel,
// a plain DFT). PASS/FAIL per claim, INFO for numbers worth reading; exits 1 on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const NAMES = { stream: 'the gallop', scale: 'two ears, two tunes', cont: 'behind the fence', gap: 'the gap that jumps' };
const PAGE = Object.fromEntries(Object.entries(NAMES).map(([k, n]) => [k, readFileSync(join(HERE, `Auditory Illusions — rich — ${n}.html`), 'utf8')]));
const grab = (html, id) => { const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`)); if (!m) throw new Error(`no <script id="${id}">`); return m[1]; };
const load = (key, id, name) => { const E = { Math, Float64Array, Float32Array, Number, Object, Array, JSON, Infinity }; vm.createContext(E); vm.runInContext(grab(PAGE[key], id) + `\nthis.X = ${name};`, E); return E.X; };
const STREAM = load('stream', 'stream-core', 'STREAM'), SCALE = load('scale', 'scale-core', 'SCALE'), CONT = load('cont', 'cont-core', 'CONT'), GAPT = load('gap', 'gap-core', 'GAPT');

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const dB = (v) => 20 * Math.log10(v);
const THRESH = Math.pow(10, -3 / 20);   // the compressor's threshold, −3 dBFS, as a peak
const peak = (y) => { let p = 0; for (const v of y) p = Math.max(p, Math.abs(v)); return p; };
const rms = (y, a = 0, b = y.length) => { let s = 0; for (let i = a; i < b; i++) s += y[i] * y[i]; return Math.sqrt(s / (b - a)); };
// frequency by zero crossings (rising), over [a, b) samples, with linear interpolation of each crossing
function zcFreq(y, sr, a, b) { const cr = []; for (let i = a + 1; i < b; i++) if (y[i - 1] < 0 && y[i] >= 0) cr.push(i - 1 + (-y[i - 1]) / (y[i] - y[i - 1])); return cr.length < 2 ? NaN : (cr.length - 1) * sr / (cr[cr.length - 1] - cr[0]); }
// power at one frequency (Goertzel), normalised so a sine of peak A reads A²/4·n² → returned as amplitude
function goertzel(y, sr, f, a, b) { const w = 2 * Math.PI * f / sr, c = 2 * Math.cos(w); let s1 = 0, s2 = 0; for (let i = a; i < b; i++) { const s0 = y[i] + c * s1 - s2; s2 = s1; s1 = s0; } const p = s1 * s1 + s2 * s2 - c * s1 * s2; return 2 * Math.sqrt(Math.max(p, 0)) / (b - a); }
// a power spectrum of y[a..b), Hann-windowed (so the measurement's own leakage stays far below what is measured), zero-padded to N
function spectrum(y, a, b, N) { const re = new Float64Array(N), im = new Float64Array(N), n = b - a; for (let i = a; i < b; i++) re[i - a] = y[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * (i - a) / (n - 1))); CONT.fft(re, im, false); const p = new Float64Array(N / 2); for (let k = 0; k < N / 2; k++) p[k] = re[k] * re[k] + im[k] * im[k]; return p; }

console.log('— the four pieces —');
{
  const scaf = Object.values(PAGE).map((h) => grab(h, 'sw-scaffold'));
  check('one scaffold in all four pieces, byte for byte', scaf.every((s) => s === scaf[0]), `${scaf[0].length} characters each`);
  for (const [k, h] of Object.entries(PAGE)) {
    check(`${NAMES[k]}: never names the kit's hush message`, !h.includes('rich:' + 'hush'), 'the string is absent');
    check(`${NAMES[k]}: no detached Audio element`, !/new\s+Audio\s*\(/.test(h), 'no new Audio(');
    check(`${NAMES[k]}: declares it needs nothing`, /<meta name="piece:needs" content="">/.test(h), 'piece:needs is empty');
    const made = (h.match(/new AudioContext\(/g) || []).length;
    check(`${NAMES[k]}: one AudioContext, made inside ensure() on a press`, made === 1 && /async function ensure\(\)\s*\{\s*if \(!ctx\) \{\s*ctx = new AudioContext\(\)/.test(h), `${made} construction, inside ensure()`);
  }
}

console.log('— the gallop (auditory streaming) —');
{
  const E = STREAM, SR = E.SR;
  for (const gap of [0, 3, 7.5, 15]) {
    const F = E.freqs(gap), st = 12 * Math.log2(F.hi / F.lo), mid = Math.sqrt(F.hi * F.lo);
    check(`gap ${gap} st: the two tones are ${gap} semitones apart, either side of 1000 Hz`, Math.abs(st - gap) < 1e-9 && Math.abs(mid - 1000) < 1e-9, `lo ${F.lo.toFixed(2)} Hz, hi ${F.hi.toFixed(2)} Hz, ${st.toFixed(6)} st, geometric middle ${mid.toFixed(6)} Hz`);
  }
  for (const T of [0.3, 0.12, 0.05]) {
    const ev = E.events(T, 6, 16), pat = ev.map((e) => e.which[0]).join('');
    const onsetsOk = ev.every((e) => Math.abs(e.t - e.k * T) < 1e-12), restsOk = ev.every((e) => e.k % 4 !== 3);
    check(`slot ${T * 1000} ms: onsets every T, low high low then a rest, four slots a gallop`, onsetsOk && restsOk && pat === 'lhl'.repeat(4), `pattern ${pat}, gallop period ${(4 * T * 1000).toFixed(0)} ms, ${(3 / (4 * T)).toFixed(2)} tones a second`);
  }
  const ev = E.events(0.1, 4, 8), F = E.freqs(4);
  check('each slot\'s frequency is the tone the pattern names', ev.every((e) => Math.abs(e.f - F[e.which]) < 1e-12), ev.map((e) => e.f.toFixed(1)).join(', ') + ' Hz');
  const x = E.tone(1000), r = Math.round(E.RAMP * SR);
  check('each tone lasts 40 ms', x.length === Math.round(0.04 * SR), `${x.length} samples = ${(1000 * x.length / SR).toFixed(2)} ms`);
  check('its ends are 5 ms raised-cosine ramps: silent at the edges, full by 5 ms', Math.abs(x[0]) < 1e-12 && Math.abs(x[x.length - 1]) < 1e-3 && Math.abs(peak(x.subarray(r, x.length - r)) - E.AMP) < 2e-3, `first ${x[0].toFixed(4)}, last ${x[x.length - 1].toFixed(4)}, peak in the body ${peak(x.subarray(r, x.length - r)).toFixed(4)}`);
  for (const f of [E.freqs(15).lo, 1000, E.freqs(15).hi]) { const y = E.tone(f), m = zcFreq(y, SR, r, y.length - r); check(`a ${f.toFixed(1)} Hz tone measures ${f.toFixed(1)} Hz`, Math.abs(m - f) / f < 0.005, `zero crossings say ${m.toFixed(2)} Hz`); }
  const b = E.tone(1000, { bright: true }), s = E.tone(1000);
  check('the bright tone matches the pure one in RMS (same loudness by that measure, not by ear)', Math.abs(dB(rms(b, r, b.length - r) / rms(s, r, s.length - r))) < 0.1, `${dB(rms(b, r, b.length - r) / rms(s, r, s.length - r)).toFixed(3)} dB apart`);
  check('the bright tone keeps its pitch: its fundamental is the strongest partial', goertzel(b, SR, 1000, 0, b.length) > goertzel(b, SR, 2000, 0, b.length), `1 kHz ${goertzel(b, SR, 1000, 0, b.length).toFixed(4)} vs 2 kHz ${goertzel(b, SR, 2000, 0, b.length).toFixed(4)}`);
  check('the test ramp runs 300 → 50 ms speeding up, 50 → 300 ms slowing down, over 30 s, geometric', Math.abs(E.rampT(0, 1) - 0.3) < 1e-12 && Math.abs(E.rampT(30, 1) - 0.05) < 1e-12 && Math.abs(E.rampT(0, -1) - 0.05) < 1e-12 && Math.abs(E.rampT(30, -1) - 0.3) < 1e-12 && Math.abs(E.rampT(15, 1) - Math.sqrt(0.015)) < 1e-12, `midway ${(E.rampT(15, 1) * 1000).toFixed(1)} ms = √(300·50)`);
  info('at 50 ms slots, the gaps between tones', `${((0.05 - E.TONE) * 1000).toFixed(0)} ms of silence between tones; at 300 ms, ${((0.3 - E.TONE) * 1000).toFixed(0)} ms`);
  check('every tone peaks under the compressor threshold', Math.max(peak(E.tone(F.lo)), peak(E.tone(F.hi, { bright: true }))) < THRESH, `bright peak ${peak(E.tone(1000, { bright: true })).toFixed(3)}, threshold ${THRESH.toFixed(3)}`);
}

console.log('— two ears, two tunes (the scale illusion) —');
{
  const E = SCALE, SR = E.SR, N = (m) => E.NAME[m];
  const il = E.score('illusion');
  const okAssign = il.every((s, i) => (i % 2 === 0 ? s.L === E.MIDI[i] && s.R === E.MIDI[7 - i] : s.R === E.MIDI[i] && s.L === E.MIDI[7 - i]));
  check('the rising note goes left on even steps and right on odd; the falling note takes the other ear', okAssign, `left ${il.map((s) => N(s.L)).join(' ')} · right ${il.map((s) => N(s.R)).join(' ')}`);
  const rev = (seq) => { let n = 0; for (let i = 2; i < seq.length; i++) { const a = Math.sign(seq[i - 1] - seq[i - 2]), b = Math.sign(seq[i] - seq[i - 1]); if (a && b && a !== b) n++; } return n; };
  for (const ear of ['L', 'R']) { const seq = il.map((s) => s[ear]); check(`the ${ear === 'L' ? 'left' : 'right'} ear gets a zigzag, not a scale`, rev(seq) >= 4, `direction reverses ${rev(seq)} times in 8 notes; a scale reverses 0 or 1`); }
  let swaps = 0; for (let i = 1; i < 8; i++) if ((il[i].L > il[i].R) !== (il[i - 1].L > il[i - 1].R)) swaps++;
  info('the higher note changes ear', `${swaps} of 7 step changes (not at the crossing, where F4 and G4 meet)`);
  for (const he of ['L', 'R']) {
    const sm = E.score('smooth', he);
    const same = sm.every((s, i) => [s.L, s.R].sort().join() === [il[i].L, il[i].R].sort().join());
    const high = sm.every((s) => (he === 'R' ? s.R >= s.L : s.L >= s.R));
    check(`the smooth control (high tune ${he === 'L' ? 'left' : 'right'}): the same two notes at every step, only the ears differ`, same && high, `high ${sm.map((s) => N(he === 'R' ? s.R : s.L)).join(' ')} · low ${sm.map((s) => N(he === 'R' ? s.L : s.R)).join(' ')}`);
  }
  const [L, R] = E.render(il), n = Math.round(E.NOTE * SR), pad = Math.round(0.03 * SR);
  let worst = Infinity, fOk = true;
  for (let i = 0; i < 8; i++) for (const [ch, mine, other] of [[L, il[i].L, il[i].R], [R, il[i].R, il[i].L]]) {
    const a = i * n + pad, b = (i + 1) * n - pad, f = zcFreq(ch, SR, a, b);
    if (Math.abs(f - E.hz(mine)) / E.hz(mine) > 0.003) fOk = false;
    if (mine !== other) worst = Math.min(worst, dB(goertzel(ch, SR, E.hz(mine), a, b) / Math.max(goertzel(ch, SR, E.hz(other), a, b), 1e-12)));
  }
  check('measured in the rendered buffer: each channel holds, at each step, the note the score gives that ear', fOk, 'zero crossings within 0.3% at all 16 places');
  check('and not the other ear\'s note', worst > 30, `at least ${worst.toFixed(1)} dB down by this Goertzel meter, which is its floor: the note is never added to that channel at all`);
  { // structure: render() adds st.L only to the left channel and st.R only to the right; a re-render matches sample for sample
    const only = E.render(il.map((s) => ({ L: s.L, R: s.R }))), exact = only[0].every((v, i) => v === L[i]) && only[1].every((v, i) => v === R[i]);
    check('the other ear\'s note is absent, not merely quiet: each channel is built from its own notes only', exact && /note\(L, at, hz\(st\.L\)/.test(PAGE.scale) && /note\(R, at, hz\(st\.R\)/.test(PAGE.scale), 'render() writes st.L only into the left channel and st.R only into the right'); }
  const sL = E.render(il, { route: 'L' }), sR = E.render(il, { route: 'R' }), mo = E.render(il, { route: 'mono' });
  check('left alone silences the right channel; right alone the left', peak(sL[1]) === 0 && peak(sR[0]) === 0, `peaks ${peak(sL[1])}, ${peak(sR[0])}`);
  check('mono puts both notes in both ears, identical', mo[0].every((v, i) => v === mo[1][i]) && goertzel(mo[0], SR, E.hz(il[0].R), pad, n - pad) > 0.05, 'channels equal sample for sample');
  const br = E.render(il, { brightL: true }), body = (y) => rms(y, pad, n - pad);
  check('the bright left ear matches the pure one in RMS', Math.abs(dB(body(br[0]) / body(L))) < 0.1, `${dB(body(br[0]) / body(L)).toFixed(3)} dB apart, step 1`);
  const sm = E.render(E.score('smooth', 'R'));
  check('the blind test\'s two arms match in level, ear by ear', Math.abs(dB(rms(L) / rms(sm[0]))) < 0.2 && Math.abs(dB(rms(R) / rms(sm[1]))) < 0.2, `left ${dB(rms(L) / rms(sm[0])).toFixed(3)} dB, right ${dB(rms(R) / rms(sm[1])).toFixed(3)} dB`);
  check('the loop is two seconds, four notes a second', L.length === 2 * SR, `${L.length / SR} s`);
  check('every buffer peaks under the compressor threshold', Math.max(peak(L), peak(R), peak(mo[0]), peak(br[0])) < THRESH, `highest ${Math.max(peak(L), peak(R), peak(mo[0]), peak(br[0])).toFixed(3)} (mono)`);
}

console.log('— behind the fence (the continuity illusion) —');
{
  const E = CONT, SR = E.SR;
  const lift = E.render({ level: 10, noise: false }), full = E.render({ level: 10 }), noiseOnly = full.map((v, i) => v - lift[i]);
  // the gap: the tone exactly silent through it, every cycle
  let runs = [], run = 0; for (let i = 0; i < lift.length; i++) { if (lift[i] === 0) run++; else { if (run > 100) runs.push(run); run = 0; } } if (run > 100) runs.push(run);
  check('the tone is silent for 150 ms in every cycle', runs.length === 5 && runs.every((r) => Math.abs(r / SR - E.GAP) < 2 / SR), `${runs.length} gaps of ${runs.map((r) => (1000 * r / SR).toFixed(2)).join(', ')} ms`);
  info('the gap between half-amplitude points of the tone\'s crossfades', `${((E.GAP + E.R) * 1000).toFixed(0)} ms (150 silent + half of each 8 ms edge)`);
  // the noise: full through the gap, nothing where the tone is fully on
  let outside = 0, inside = Infinity;
  for (let j = 0; j < E.CYCLES; j++) { const a = Math.round((j * E.CYCLE + E.R) * SR), b = Math.round((j * E.CYCLE + E.ON - E.R) * SR); outside = Math.max(outside, peak(noiseOnly.subarray(a, b))); inside = Math.min(inside, rms(noiseOnly, Math.round((j * E.CYCLE + E.ON) * SR), Math.round(((j + 1) * E.CYCLE) * SR))); }
  check('the noise fills each gap and is absent while the tone is fully on', outside === 0 && inside > 0.01, `noise peak while the tone is on ${outside}; quietest gap's noise RMS ${inside.toFixed(4)}`);
  // the band, measured on the full-level stretch of a burst
  const burst = (y, j) => [Math.round((j * E.CYCLE + E.ON) * SR), Math.round(((j + 1) * E.CYCLE) * SR)];
  const NFFT = 8192, df = SR / NFFT, Pt = E.AMP * E.AMP / 2;
  function measure(level, center) {
    const y = E.render({ level, center }), yl = E.render({ level, center, noise: false }), z = y.map((v, i) => v - yl[i]);
    let inB = 0, inE = 0, tot = 0, n = 0; const lv = E.levels(level, center);
    for (let j = 0; j < E.CYCLES; j++) { const [a, b] = burst(z, j); const p = spectrum(z, a, b, NFFT); n = b - a; for (let k = 1; k < p.length; k++) { const f = k * df; tot += p[k]; if (f >= lv.band.lo && f <= lv.band.hi) inB += p[k]; if (f >= lv.erbLo && f <= lv.erbHi) inE += p[k]; } }
    // Parseval: total power of the slice, shared by the bins (the zero-padding does not change the shares)
    const P = (() => { let s = 0; for (let j = 0; j < E.CYCLES; j++) { const [a, b] = burst(z, j); for (let i = a; i < b; i++) s += z[i] * z[i]; } return s / (E.CYCLES * n); })();
    return { lv, inBandShare: inB / tot, erbShare: inE / tot, measuredInErbDb: 10 * Math.log10(P * inE / tot / Pt), P };
  }
  const m0 = measure(10, 1000);
  check('the noise sits in its half-octave band, 841–1189 Hz', m0.inBandShare > 0.98, `${(100 * m0.inBandShare).toFixed(2)}% of its power inside the band, measured by FFT of the bursts`);
  check('on the tone, the band covers all of the tone\'s ERB (933.7–1066.3 Hz)', Math.abs(m0.lv.overlapFrac - 1) < 1e-9, `overlap ${m0.lv.overlapHz.toFixed(1)} of ${m0.lv.erb.toFixed(1)} Hz`);
  check('the noise in the tone\'s band measures the level the slider names (+10 dB re the tone)', Math.abs(m0.measuredInErbDb - 10) < 1, `measured ${m0.measuredInErbDb.toFixed(2)} dB, ERB share ${(100 * m0.erbShare).toFixed(1)}% (flat-band arithmetic: ${(100 * m0.lv.erb / (m0.lv.band.hi - m0.lv.band.lo)).toFixed(1)}%)`);
  for (const L of [0, -20]) { const m = measure(L, 1000); check(`at ${L} dB the measured level agrees too`, Math.abs(m.measuredInErbDb - L) < 1, `measured ${m.measuredInErbDb.toFixed(2)} dB`); }
  for (const c of [1189, 1414, 2000, 4000]) {
    const m = measure(10, c);
    const tag = m.lv.overlapHz > 0 ? `${(100 * m.lv.overlapFrac).toFixed(0)}% of the tone's ERB covered, ${m.lv.inBandDb.toFixed(1)} dB in it by arithmetic` : 'no overlap by arithmetic';
    info(`band centred on ${c} Hz (${m.lv.band.lo.toFixed(0)}–${m.lv.band.hi.toFixed(0)} Hz)`, `${tag}; measured in the tone's ERB ${m.measuredInErbDb.toFixed(1)} dB re the tone; total power ${dB(Math.sqrt(m.P / m0.P)).toFixed(2)} dB re the band on the tone`);
  }
  // the whole burst as played, its 8 ms gate edges included: a slice from silence to silence, so no window is needed
  function whole(level, center) {
    const y = E.render({ level, center }), yl = E.render({ level, center, noise: false }), z = y.map((v, i) => v - yl[i]), lv = E.levels(level, center);
    const a = Math.round((2 * E.CYCLE + E.ON - E.R - 0.01) * SR), b = Math.round((3 * E.CYCLE + E.R + 0.01) * SR);
    const re = new Float64Array(NFFT), im = new Float64Array(NFFT); for (let i = a; i < b; i++) re[i - a] = z[i]; CONT.fft(re, im, false);
    let inE = 0, tot = 0; for (let k = 1; k < NFFT / 2; k++) { const p = re[k] * re[k] + im[k] * im[k], f = k * df; tot += p; if (f >= lv.erbLo && f <= lv.erbHi) inE += p; }
    return 10 * Math.log10(inE / tot);
  }
  info('the burst as played, its 8 ms edges included: share of its energy in the tone\'s ERB', [1000, 1189, 1414, 2000, 4000].map((c) => `${c} Hz: ${whole(10, c).toFixed(1)} dB`).join(' · ') + ' (re the whole burst; the edges splash a little energy outside the band)');
  // through a roex(p) filter round the tone, as played (the whole burst, edges included): the readout's own figure against the buffer
  function roexPlayed(level, center) {
    const y = E.render({ level, center }), yl = E.render({ level, center, noise: false }), z = y.map((v, i) => v - yl[i]), lv = E.levels(level, center);
    const a = Math.round((2 * E.CYCLE + E.ON - E.R - 0.01) * SR), b = Math.round((3 * E.CYCLE + E.R + 0.01) * SR);
    const re = new Float64Array(NFFT), im = new Float64Array(NFFT); for (let i = a; i < b; i++) re[i - a] = z[i]; CONT.fft(re, im, false);
    let w = 0, tot = 0; for (let k = 1; k < NFFT / 2; k++) { const p = re[k] * re[k] + im[k] * im[k]; tot += p; w += p * lv.roexW(k * df); }
    // the burst's full-level power (its middle), shared out by the spectrum's weights
    const m0 = Math.round((2 * E.CYCLE + E.ON) * SR), m1 = Math.round((3 * E.CYCLE) * SR); let P = 0; for (let i = m0; i < m1; i++) P += z[i] * z[i]; P /= (m1 - m0);
    return 10 * Math.log10(P * w / tot / Pt);
  }
  for (const c of [1000, 1270, 1414, 2000]) { const lv = E.levels(10, c), pl = roexPlayed(10, c); info(`roex readout at a ${c} Hz centre, fence at +10 dB`, `page ${lv.roexDb.toFixed(1)} dB · as played ${pl.toFixed(1)} dB · hard-edged ERB ${lv.inBandDb === -Infinity ? 'none' : lv.inBandDb.toFixed(1) + ' dB'}`); }
  { const lv = E.levels(10, 1000), pl = roexPlayed(10, 1000); check('on the tone the roex readout agrees with the buffer', Math.abs(lv.roexDb - pl) < 1, `page ${lv.roexDb.toFixed(2)} dB, as played ${pl.toFixed(2)} dB`); }
  { const lv = E.levels(10, 1270); check('at 1270 Hz the roex readout still finds noise near the masking line, where the hard edge said none', lv.roexDb > -3, `roex ${lv.roexDb.toFixed(1)} dB, hard-edged ${lv.inBandDb === -Infinity ? 'none' : lv.inBandDb.toFixed(1)}`); }
  const m2 = measure(10, 2000);
  // "leaves the tone's band": what is left in it sits well under the masking line (+3.2 dB), here at least 15 dB under the tone
  check('moved to 2 kHz the fence keeps its loudness and leaves the tone\'s band', Math.abs(dB(Math.sqrt(m2.P / m0.P))) < 0.5 && roexPlayed(10, 2000) < -15, `total ${dB(Math.sqrt(m2.P / m0.P)).toFixed(2)} dB re on the tone; through the roex filter, as played with the burst edges, ${roexPlayed(10, 2000).toFixed(1)} dB re the tone (the steady middle alone reads ${m2.measuredInErbDb.toFixed(1)} dB in a hard ERB)`);
  // the blind test's two arms: identical but for the tone inside the gaps
  const g = E.render({ level: 4, gapped: true }), c = E.render({ level: 4, gapped: false });
  let maxErr = 0; for (let i = 0; i < g.length; i++) { const t = i / SR, want = E.AMP * (1 - E.toneGate(t)) * Math.sin(2 * Math.PI * E.F * t); maxErr = Math.max(maxErr, Math.abs(c[i] - g[i] - want)); }
  check('the blind test\'s arms differ only by the tone inside the gaps (same frozen noise)', maxErr < 1e-6, `largest residual ${maxErr.toExponential(2)}`);
  const [a, b] = burst(g, 2); info('how much louder a gap is with the tone really in it, at +4 dB', `${dB(rms(c, a, b) / rms(g, a, b)).toFixed(3)} dB; at +12 dB ${(() => { const g2 = E.render({ level: 12 }), c2 = E.render({ level: 12, gapped: false }); return dB(rms(c2, a, b) / rms(g2, a, b)).toFixed(3); })()} dB; at −20 dB ${(() => { const g2 = E.render({ level: -20 }), c2 = E.render({ level: -20, gapped: false }); return dB(rms(c2, a, b) / rms(g2, a, b)).toFixed(3); })()} dB`);
  const step = Math.abs(c[0] - c[c.length - 1]), typical = 2 * Math.PI * E.F / SR * E.AMP;
  check('the loop has no seam: 2000 whole cycles of the tone in two seconds', Math.abs(E.F * E.LOOP - Math.round(E.F * E.LOOP)) < 1e-9 && step < 1.5 * typical + 0.2, `jump at the seam ${step.toFixed(4)} (noise included), a tone sample step up to ${typical.toFixed(4)}`);
  let pk = 0; for (const L of [12, 10, 0]) for (const ctr of [1000, 2000, 4000]) pk = Math.max(pk, peak(E.render({ level: L, center: ctr })));
  check('every buffer peaks under the compressor threshold, loudest fence included', pk < THRESH, `highest peak ${pk.toFixed(3)} (+12 dB), threshold ${THRESH.toFixed(3)}`);
  const Lv = []; for (let L = E.LEVEL.max; L >= E.LEVEL.min; L -= 2) Lv.push(L);
  info('the descending run', `${Lv.length} levels, +12 to −30 dB in 2 dB steps, one two-second loop each: ${2 * Lv.length} s`);
  info('the masking line drawn on the threshold plot', `+3.2 dB: a 1 kHz critical ratio of 18 dB (standing knowledge) against ${(10 * Math.log10(E.ERB(1000))).toFixed(1)} dB for the ERB's 132.6 Hz`);
}

console.log('— the gap that jumps (gap transfer) —');
{
  const E = GAPT, SR = E.SR, L = E.LONG, S = E.SHORT;
  // where the formulas meet: log f_long = log f_short, solved here on its own
  const a1 = Math.log(L.f0), b1 = Math.log(L.f1 / L.f0) / (L.t1 - L.t0), a2 = Math.log(S.f0), b2 = Math.log(S.f1 / S.f0) / (S.t1 - S.t0);
  const tc = (a2 - b2 * S.t0 - a1 + b1 * L.t0) / (b1 - b2), fc = Math.exp(a1 + b1 * (tc - L.t0));
  check('the glides cross at 1.2 s and 800 Hz, by their formulas', Math.abs(tc - 1.2) < 1e-9 && Math.abs(fc - 800) < 1e-6, `t = ${tc.toFixed(6)} s, f = ${fc.toFixed(4)} Hz`);
  const lo = E.render({ gapIn: 'none', short: false }), so = E.render({ gapIn: 'none', long: false });
  const track = (y, t) => zcFreq(y, SR, Math.round((t - 0.01) * SR), Math.round((t + 0.01) * SR));
  let worst = 0; const pts = [];
  for (const t of [0.2, 0.95, 1.2, 1.45, 2.2]) { const f = track(lo, t), want = E.along(L, t); worst = Math.max(worst, Math.abs(f / want - 1)); pts.push(`long ${t}s ${f.toFixed(0)}/${want.toFixed(0)}`); }
  for (const t of [0.95, 1.2, 1.45]) { const f = track(so, t), want = E.along(S, t); worst = Math.max(worst, Math.abs(f / want - 1)); pts.push(`short ${t}s ${f.toFixed(0)}/${want.toFixed(0)}`); }
  check('measured in the rendered buffers, each glide is where its formula says', worst < 0.01, `${pts.join(' · ')} Hz (measured/formula), worst ${(100 * worst).toFixed(2)}%`);
  // the crossing, measured: where the two measured tracks swap order
  let prev = null, tx = null; for (let t = 1.0; t <= 1.4; t += 0.005) { const d = Math.log(track(lo, t) / track(so, t)); if (prev != null && Math.sign(d) !== Math.sign(prev)) { tx = t - 0.005 * d / (d - prev); break; } prev = d; }
  check('and measured, the two tracks cross at 1.2 s', tx != null && Math.abs(tx - 1.2) < 0.01, `measured crossing ${tx == null ? 'none' : tx.toFixed(4) + ' s'}`);
  const lg = E.render({ gapIn: 'long', short: false });
  let runs = [], run = 0, start = 0; for (let i = Math.round(0.5 * SR); i < Math.round(2.0 * SR); i++) { if (lg[i] === 0) { if (!run) start = i; run++; } else { if (run > 50) runs.push([start, run]); run = 0; } }
  check('the long glide\'s gap: 100 ms of silence centred on the crossing', runs.length === 1 && Math.abs(runs[0][1] / SR - 0.1) < 2 / SR && Math.abs((runs[0][0] + runs[0][1] / 2) / SR - 1.2) < 2 / SR, runs.map(([s, n]) => `${(1000 * n / SR).toFixed(2)} ms, centred at ${((s + n / 2) / SR).toFixed(4)} s`).join('; '));
  const il = E.render({ gapIn: 'long' }), ct = E.render({ gapIn: 'short' });
  check('the blind test\'s two arms carry the same energy', Math.abs(dB(rms(il) / rms(ct))) < 0.05, `${dB(rms(il) / rms(ct)).toFixed(4)} dB apart`);
  const sg = E.render({ gapIn: 'short', long: false }); let sr2 = 0, sStart = 0; run = 0; for (let i = Math.round(0.95 * SR); i < Math.round(1.45 * SR); i++) { if (sg[i] === 0) { if (!run) sStart = i; run++; sr2 = Math.max(sr2, run); } else run = 0; }
  check('in the control the short glide carries the same 100 ms gap at the same moment', Math.abs(sr2 / SR - 0.1) < 2 / SR, `${(1000 * sr2 / SR).toFixed(2)} ms`);
  const edge = (t) => `${E.along(L, t).toFixed(0)} vs ${E.along(S, t).toFixed(0)} Hz`;
  info('the two glides at the gap\'s edges', `at 1.15 s ${edge(1.15)}; at 1.25 s ${edge(1.25)}: ${Math.abs(1200 * Math.log2(E.along(L, 1.15) / E.along(S, 1.15))).toFixed(1)} and ${Math.abs(1200 * Math.log2(E.along(L, 1.25) / E.along(S, 1.25))).toFixed(1)} cents apart`);
  check('every buffer peaks under the compressor threshold', Math.max(peak(il), peak(ct)) < THRESH, `highest ${Math.max(peak(il), peak(ct)).toFixed(3)} where the glides overlap`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
