// Sidechain ↔ Conversation — rich — check.mjs
// born: 2026-11-03 · checks [[Sidechain ↔ Conversation]]'s three rich-face pieces: "under the kick",
// "mud into dialogue" and "who yields when"
// forward_vector: I re-run, headless, every claim the three pieces make about their own engine and about the
// sections they serve: that one engine runs all three, byte for byte; that its detector, gain computer and
// smoother do what the page's four knobs say, with an infinite release that never comes back; that the bass
// notes and the kick share the page's 60 to 120 Hz and the hi-hat shares nothing; that the note under the kick
// is 6 dB down and inside it; that every loop is seamless and every blind version matched in level; that the
// voices decode, the speaker is silent between its lines and the listener never stops; that the release
// decides whether the listener leaks into the speaker's breaths; and that every chance figure a step prints is
// the binomial it names. What a listener hears I cannot check.
//
//   node "Cross-Domain Resonances/Sidechain ↔ Conversation/Sidechain ↔ Conversation — rich — check.mjs"
//
// It pulls <script id="sc-core"> (and the voices) out of each piece, runs them in a Node sandbox, and compares
// against equations written here on their own. PASS/FAIL per claim, INFO for numbers worth reading; exits 1 on
// any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const page = (name) => readFileSync(join(HERE, `Sidechain ↔ Conversation — rich — ${name}.html`), 'utf8');
const P = { kick: page('under the kick'), mud: page('mud into dialogue'), who: page('who yields when') };
const grab = (html, id) => { const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`)); if (!m) throw new Error(`no <script id="${id}">`); return m[1]; };
const E = { Math, Float64Array, Float32Array, Int32Array, JSON, Number, String, Object, Array, isFinite, Buffer, Infinity };
vm.createContext(E); vm.runInContext(grab(P.kick, 'sc-core') + '\nthis.SC = SC;', E);
vm.runInContext(grab(P.who, 'sc-voices') + '\nthis.VOICES = VOICES;', E);
const SC = E.SC, V = E.VOICES, SR = SC.SR;

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const dB = (v) => 20 * Math.log10(v);
const minOf = (a) => a.reduce((m, v) => Math.min(m, v), Infinity);

console.log('— the engine —');
{
  const cores = Object.values(P).map((h) => grab(h, 'sc-core'));
  check('one engine in all three pieces, byte for byte', cores.every((c) => c === cores[0]), `${cores[0].length} characters each`);
  for (const [n, h] of Object.entries(P)) check(`${n}: never names the kit's hush message, so the kit keeps hushing`, !h.includes('rich:' + 'hush'), 'the string is absent');
}
// a steady sine: the detector reads its peak in dBFS, the gain computer lands on −(L − T)(1 − 1/R)
const sine = (amp, f, sec, sr = SR, on = 0, off = Infinity) => { const n = Math.round(sec * sr), x = new Float64Array(n); for (let i = 0; i < n; i++) { const t = i / sr; x[i] = t >= on && t < off ? amp * Math.sin(2 * Math.PI * f * t) : 0; } return x; };
{
  const x = sine(0.5, 1000, 1), d = SC.duck(x, SR, { T: -20, R: 4, atk: 0.002, rel: 0.1, loop: false });
  const L = d.lev[x.length - 1], g = d.gain[x.length - 1], want = -(dB(0.5) + 20) * (1 - 1 / 4);
  check('the detector reads a steady sine as its peak, in dBFS', Math.abs(L - dB(0.5)) < 0.1, `L = ${L.toFixed(3)} dB, peak ${dB(0.5).toFixed(3)} dB`);
  check('the gain settles at −(L − T)(1 − 1/R)', Math.abs(g - want) < 0.1, `g = ${g.toFixed(3)} dB, written here ${want.toFixed(3)} dB`);
  const dInf = SC.duck(x, SR, { T: -20, R: Infinity, atk: 0.002, rel: 0.1, loop: false });
  check('ratio ∞: the reduction is the whole of the overshoot', Math.abs(dInf.gain[x.length - 1] + (dB(0.5) + 20)) < 0.1, `${dInf.gain[x.length - 1].toFixed(3)} dB for ${(dB(0.5) + 20).toFixed(3)} dB over`);
  const quiet = SC.duck(sine(0.05, 1000, 1), SR, { T: -20, R: 4, atk: 0.002, rel: 0.1, loop: false });
  check('below the threshold nothing moves', minOf(quiet.gain) === 0, `deepest ${minOf(quiet.gain)} dB for a sine at ${dB(0.05).toFixed(1)} dB`);
}
// attack and release are the time constants they say: 63% of the way in τ (the 5 ms detector adds a little)
{
  const x = sine(0.5, 1000, 3, SR, 0.5, 1.5), atk = 0.05, rel = 0.4;
  const d = SC.duck(x, SR, { T: -20, R: 4, atk, rel, loop: false }), fin = d.gain[Math.round(1.49 * SR)];
  let ta = null, tr = null;
  for (let i = Math.round(0.5 * SR); i < x.length; i++) if (d.gain[i] <= fin * (1 - Math.exp(-1))) { ta = i / SR - 0.5; break; }
  for (let i = Math.round(1.5 * SR); i < x.length; i++) if (d.gain[i] >= fin * Math.exp(-1)) { tr = i / SR - 1.5; break; }
  check('attack: 63% of the duck in about τ', Math.abs(ta - atk) / atk < 0.15, `${(ta * 1000).toFixed(1)} ms for τ = ${atk * 1000} ms`);
  check('release: back to 37% of the duck in about τ', Math.abs(tr - rel) / rel < 0.05, `${(tr * 1000).toFixed(1)} ms for τ = ${rel * 1000} ms`);
  const dI = SC.duck(x, SR, { T: -20, R: 4, atk, rel: Infinity, loop: false });
  let up = 0; for (let i = 1; i < x.length; i++) up = Math.max(up, dI.gain[i] - dI.gain[i - 1]);
  check('release ∞: the gain never rises again', up === 0, `largest rise between samples ${up} dB; still ${dI.gain[x.length - 1].toFixed(2)} dB 1.5 s after the tone`);
}
{
  const y = SC.matched(SC.mix(SC.kicks(), SC.line(1), null), -18), s = SC.stats(y);
  check('matched in level: RMS at the target, peak under 0.9', Math.abs(dB(s.rms) + 18) < 0.01 && s.peak <= 0.9 + 1e-9, `RMS ${dB(s.rms).toFixed(3)} dB, peak ${s.peak.toFixed(3)}`);
}
// every loop is seamless: the jump across the seam is no bigger than the jumps inside
{
  const seam = (x) => { const n = x.length; let inside = 0; for (let i = 2; i < n; i++) inside = Math.max(inside, Math.abs(x[i] - 2 * x[i - 1] + x[i - 2])); const s = Math.max(Math.abs(x[0] - 2 * x[n - 1] + x[n - 2]), Math.abs(x[1] - 2 * x[0] + x[n - 1])); return { s, inside }; };
  for (const [n, x] of [['kicks', SC.kicks()], ['bass line', SC.line(1)], ['hi-hats', SC.hats()], ['note under the kick, low', SC.under(SC.NOTES.D2)], ['note under the kick, high', SC.under(SC.NOTES.G2)]]) {
    const r = seam(x); check(`seamless loop: ${n}`, r.s <= r.inside, `seam second difference ${r.s.toExponential(2)}, largest inside ${r.inside.toExponential(2)}`);
  }
  const a = SC.unmu(V.a, V.mu), b = SC.unmu(V.b, V.mu);
  check('seamless loop: both voices start and end in silence', Math.abs(a[0]) + Math.abs(a[a.length - 1]) + Math.abs(b[0]) + Math.abs(b[b.length - 1]) < 1e-9, '8 ms fades at both ends');
}

console.log('— under the kick (The Technical Side) —');
{
  const one = (f) => { const x = SC.bar(); f(x); return x; };
  const low = one((x) => SC.plucked(x, 0, SC.NOTES.D2, 1)), high = one((x) => SC.plucked(x, 0, SC.NOTES.G2, 1));
  const kick = one((x) => SC.kick(x, 0)), hat = one((x) => SC.hat(x, 0, SC.rng(5)));
  const sh = (x, lo, hi) => SC.share(x, lo, hi);
  check('the low note lives in 60–120 Hz', sh(low, 60, 120) > 0.9, `${(100 * sh(low, 60, 120)).toFixed(1)}% of its energy (the pluck's decay spreads it a little)`);
  check('the high note lives in 60–120 Hz', sh(high, 60, 120) > 0.9, `${(100 * sh(high, 60, 120)).toFixed(1)}%`);
  check('the kick lives mostly in 60–120 Hz, all of it under 200', sh(kick, 60, 120) > 0.6 && sh(kick, 0, 200) > 0.99, `${(100 * sh(kick, 60, 120)).toFixed(1)}% in 60–120, ${(100 * sh(kick, 0, 200)).toFixed(2)}% under 200 Hz`);
  check('the hi-hat shares next to nothing with the kick', sh(hat, 60, 120) < 1e-4 && sh(hat, 2000, 22050) > 0.95, `${(100 * sh(hat, 60, 120)).toExponential(1)}% in 60–120, ${(100 * sh(hat, 2000, 22050)).toFixed(1)}% above 2 kHz`);
  const K = SC.kicks(), hit = Math.round(0.5 * SR);
  for (const [n, f] of [['low', SC.NOTES.D2], ['high', SC.NOTES.G2]]) {
    const u = SC.under(f, -6), rel = dB(SC.stats(u, 0, hit).rms) - dB(SC.stats(K, 0, hit).rms);
    check(`the ${n} note sits 6 dB under the kick, in RMS over the hit`, Math.abs(rel + 6) < 0.05, `${rel.toFixed(2)} dB`);
  }
  // the note starts with the kick and ends inside it: same onset, same decay
  const lone = one((x) => SC.plucked(x, 0, SC.NOTES.G2, 1)), k1 = kick;
  const e = (x, a, b) => SC.stats(x, a, b).rms, w = Math.round(0.02 * SR);
  const ratios = [0.05, 0.15, 0.25, 0.35].map((t) => e(lone, Math.round(t * SR), Math.round(t * SR) + w) / e(k1, Math.round(t * SR), Math.round(t * SR) + w));
  check('the note has the kick\'s own shape, so it ends inside the kick', Math.max(...ratios) / Math.min(...ratios) < 1.25, `note ÷ kick level at 50, 150, 250, 350 ms: ${ratios.map((r) => r.toFixed(2)).join(', ')}`);
  const Kk = SC.kicks(), mk = (f) => { const u = SC.under(f, -6), y = new Float64Array(u.length); for (let i = 0; i < y.length; i++) y[i] = Kk[i] + u[i]; return SC.matched(y, -18); };
  const tl = dB(SC.stats(mk(SC.NOTES.D2)).rms), th = dB(SC.stats(mk(SC.NOTES.G2)).rms);
  check('the two trial sounds are matched in level, so loudness gives nothing away', Math.abs(tl - th) < 0.01, `low ${tl.toFixed(3)}, high ${th.toFixed(3)} dB RMS`);
  check('chance figure: 7 or more of 8 by guessing = 9 ÷ 256', Math.abs(SC.atLeast(7, 8, 0.5) - 9 / 256) < 1e-12 && P.kick.includes('9 ÷ 256 = 3.5%'), `${(100 * SC.atLeast(7, 8, 0.5)).toFixed(2)}%`);
  info('chance, under the kick', [4, 5, 6, 7, 8].map((k) => `${k}+: ${(100 * SC.atLeast(k, 8, 0.5)).toFixed(1)}%`).join(' · '));
}

console.log('— mud into dialogue (Teaching the Resonance) —');
{
  const src = P.mud.match(/const PRE = (\{[\s\S]*?\n  \});/);
  const PRE = vm.runInNewContext('(' + src[1] + ')', { Infinity });
  const K = SC.kicks(), B = SC.line(1), BEAT = SC.BEAT;
  const run = (o) => { const d = SC.duck(K, SR, o); let i0 = 0; for (let i = 0; i < BEAT; i++) if (d.gain[i] <= d.gain[i0]) i0 = i; return { deep: minOf(d.gain), back: SC.backIn(d.gain.subarray(0, BEAT), SR, i0, 1), next: d.gain[BEAT - 1], gain: d.gain }; };
  const mid = run(PRE.mid), ex = run(PRE.exag), sub = run(PRE.subtle);
  check('step text matches the presets', P.mud.includes('threshold −20 dB, 4 : 1, attack 2 ms, release 120 ms') && PRE.mid.T === -20 && PRE.mid.R === 4 && PRE.mid.atk === 0.002 && PRE.mid.rel === 0.12 && P.mud.includes('20 : 1 and 350 ms') && PRE.exag.R === 20 && PRE.exag.rel === 0.35 && P.mud.includes('−12 dB, 2 : 1, release 50 ms') && PRE.subtle.T === -12 && PRE.subtle.R === 2 && PRE.subtle.rel === 0.05, 'mid, exaggerated, subtle');
  check('the sidechain: the bass ducks and is back before the next kick', mid.deep < -10 && mid.back < 0.5, `deepest ${mid.deep.toFixed(1)} dB, back within 1 dB ${(mid.back * 1000).toFixed(0)} ms after the deepest point`);
  check('exaggerated: deeper, and still climbing when the next kick lands', ex.deep < mid.deep && ex.back === Infinity && ex.next < -3, `deepest ${ex.deep.toFixed(1)} dB, ${ex.next.toFixed(1)} dB at the next kick`);
  check('subtle: a few dB, over fast', sub.deep > -6 && sub.deep < -3 && sub.back < 0.15, `deepest ${sub.deep.toFixed(1)} dB, back within 1 dB in ${(sub.back * 1000).toFixed(0)} ms`);
  // the blind test: the ducked loop and the plain loop at the same level, and how different they are
  const plain = SC.matched(SC.mix(K, B, null), -18), duck = SC.matched(SC.mix(K, B, sub.gain), -18);
  check('the blind test\'s versions are matched in level', Math.abs(dB(SC.stats(plain).rms) - dB(SC.stats(duck).rms)) < 0.01, `${dB(SC.stats(plain).rms).toFixed(3)} and ${dB(SC.stats(duck).rms).toFixed(3)} dB RMS`);
  let dsq = 0, psq = 0; for (let i = 0; i < plain.length; i++) { dsq += (plain[i] - duck[i]) ** 2; psq += plain[i] ** 2; }
  info('the subtle duck, as a difference signal', `${(10 * Math.log10(dsq / psq)).toFixed(1)} dB under the loop: present, small`);
  const mk = dB(Math.pow(10, -18 / 20) / SC.stats(SC.mix(K, B, sub.gain)).rms) - dB(Math.pow(10, -18 / 20) / SC.stats(SC.mix(K, B, null)).rms);
  check('the step names its matching: whole-bar RMS, 0.47 dB of makeup gain', P.mud.includes('matched in RMS over the whole two-second bar') && Math.abs(mk - 0.47) < 0.01, `the ducked loop gets ${mk.toFixed(2)} dB more gain than the plain one`);
  { const w = Math.round(0.08 * SR); let dsq = 0, gsq = 0; for (let b0 = 0; b0 < 4; b0++) for (let i = b0 * BEAT; i < b0 * BEAT + w; i++) { dsq += B[i] ** 2; gsq += (B[i] * Math.pow(10, sub.gain[i] / 20)) ** 2; }
    check('the duck survives the matching: the bass down in the first 80 ms after each kick', Math.abs(10 * Math.log10(gsq / dsq) + mk + 3.5) < 0.1, `${(10 * Math.log10(gsq / dsq)).toFixed(2)} dB before matching, ${(10 * Math.log10(gsq / dsq) + mk).toFixed(2)} dB after`); }
  check('chance figure: 5 or more of 6 at one in three = 13 ÷ 729', Math.abs(SC.atLeast(5, 6, 1 / 3) - 13 / 729) < 1e-12 && P.mud.includes('13 ÷ 729 = 1.8%'), `${(100 * SC.atLeast(5, 6, 1 / 3)).toFixed(2)}%`);
  info('chance, mud into dialogue', [2, 3, 4, 5, 6].map((k) => `${k}+: ${(100 * SC.atLeast(k, 6, 1 / 3)).toFixed(1)}%`).join(' · '));
  // release ∞, four bars once: a bar of the bass alone at 0 dB, then the kick, and the bass never returns
  const K4 = new Float64Array(4 * K.length); for (let i = K.length; i < K4.length; i++) K4[i] = K[i % K.length];
  const d4 = SC.duck(K4, SR, { ...PRE.never, loop: false }); let up = 0, bar1 = 0; for (let i = 1; i < K4.length; i++) up = Math.max(up, d4.gain[i] - d4.gain[i - 1]); for (let i = 0; i < K.length; i++) bar1 = Math.min(bar1, d4.gain[i]);
  check('release ∞ on the kick: a bar at 0 dB, then the bass never comes back', bar1 === 0 && up === 0 && d4.gain[K4.length - 1] < -10, `first bar ${bar1} dB; still ${d4.gain[K4.length - 1].toFixed(1)} dB at the end of the fourth`);
}

console.log('— who yields when (The Conversational Side) —');
{
  const a = SC.unmu(V.a, V.mu), b = SC.unmu(V.b, V.mu), VR = V.sr, spans = V.phrases;
  check('the voices decode to the length they declare', a.length === V.n && b.length === V.n, `${V.n} samples, ${(V.n / VR).toFixed(2)} s at ${VR} Hz`);
  // mu-law: every code decodes and re-encodes to itself
  let rt = true; for (let c = 0; c < 256; c++) { const y = (c - 128) / 127, x = Math.sign(y) * (Math.pow(1 + V.mu, Math.abs(y)) - 1) / V.mu; const back = Math.round(Math.sign(x) * Math.log1p(V.mu * Math.abs(x)) / Math.log1p(V.mu) * 127) + 128; if (c !== 0 && back !== c) rt = false; }
  check('mu-law: every 8-bit code round-trips', rt, '255 codes, mu = 255');
  let outside = 0; for (let i = 0; i < a.length; i++) { const t = i / VR; if (!spans.some(([s, e]) => t >= s - 0.02 && t < e + 0.02)) outside = Math.max(outside, Math.abs(a[i])); }
  check('the speaker is silent between its three lines', outside < 0.002, `loudest sample outside the lines ${outside.toExponential(1)}`);
  const gaps = spans.map(([, e], i) => (i < spans.length - 1 ? spans[i + 1][0] : spans[0][0] + V.n / VR) - e);
  check('about 1.7 s between the speaker\'s lines, as the steps say', gaps.every((g) => Math.abs(g - 1.67) < 0.05), gaps.map((g) => g.toFixed(2) + ' s').join(', '));
  let run = 0, longest = 0; const fl = 0.01 * Math.max(...Array.from(b.subarray(0, 50000)).map(Math.abs)); for (let i = 0; i < b.length; i++) { if (Math.abs(b[i]) < fl) run++; else run = 0; longest = Math.max(longest, run); }
  check('the listener never stops for more than a breath', longest / VR < 0.4, `longest stretch under −40 dB: ${(longest / VR * 1000).toFixed(0)} ms`);
  const src = P.who.match(/const BASE = (\{[^}]*\});/); const BASE = vm.runInNewContext('(' + src[1] + ')');
  const R = (rel) => { const d = SC.duck(a, VR, { ...BASE, rel }); return { d, dur: SC.during(d.gain, VR, spans), backs: spans.map(([, e]) => SC.backIn(d.gain, VR, Math.round(e * VR), 3)) }; };
  const r20 = R(0.02), r300 = R(0.3), r1 = R(1);
  check('20 ms: the listener leaks into the speaker\'s breaths', r20.dur.inside > r300.dur.inside + 3 && r20.dur.between > -0.5, `inside the lines ${r20.dur.inside.toFixed(1)} dB against ${r300.dur.inside.toFixed(1)} at 300 ms; between ${r20.dur.between.toFixed(2)} dB`);
  check('300 ms: waits out the breaths, back after each line', r300.backs.every((t) => t > 0.2 && t < 0.5), `back within 3 dB ${r300.backs.map((t) => (t * 1000).toFixed(0) + ' ms').join(', ')} after each line`);
  check('1 s: takes nearly the whole gap to come back', r1.backs.every((t, i) => t > 0.85 * gaps[i]), `back within 3 dB ${r1.backs.map((t) => (t === Infinity ? 'never' : (t * 1000).toFixed(0) + ' ms')).join(', ')}; gaps ${gaps.map((g) => g.toFixed(2)).join(', ')} s`);
  const a2 = new Float64Array(2 * a.length); a2.set(a); a2.set(a, a.length);
  const dI = SC.duck(a2, VR, { ...BASE, rel: Infinity, loop: false }); let up = 0; for (let i = 1; i < a2.length; i++) up = Math.max(up, dI.gain[i] - dI.gain[i - 1]);
  check('∞: the listener never answers', up === 0 && dI.gain[a2.length - 1] < -10, `still ${dI.gain[a2.length - 1].toFixed(1)} dB at the end of twice through`);
  // the test's pairs: in every pairing the quick release leaks more into the lines and comes back sooner
  let all = true; const rows = [];
  for (const q of [0.02, 0.04, 0.08]) for (const s of [0.3, 0.5, 0.8]) { const Q = R(q), L = R(s); const ok = Q.dur.inside > L.dur.inside && Q.dur.between > L.dur.between; if (!ok) all = false; rows.push(`${q * 1000}/${s * 1000}: ${Q.dur.inside.toFixed(1)} vs ${L.dur.inside.toFixed(1)}`); }
  check('every pair: the quick release leaks more into the lines and is back sooner', all, rows.join(' · '));
  // one fixed gain for every version: the speaker is identical in X and Y, and no version clips
  check('every version plays at one fixed gain, never a per-version match', /const GAIN = 0\.9 \/ \(SC\.stats\(A\)\.peak \+ SC\.stats\(B\)\.peak\);/.test(P.who) && /r\.buf = Float32Array\.from\(r\.y, \(v\) => v \* GAIN\);/.test(P.who) && !P.who.includes('SC.matched('), 'GAIN = 0.9 ÷ (peak of speaker + peak of listener), applied to every render');
  const GAIN = 0.9 / (SC.stats(a).peak + SC.stats(b).peak);
  const spk = [0.02, 0.8].map((rel) => { const g = R(rel).d.gain, y = SC.mix(a, b, g); let s2 = 0, n = 0; for (let i = 0; i < y.length; i++) { const t = i / VR; if (spans.some(([s0, e]) => t >= s0 && t < e)) { s2 += (GAIN * a[i]) ** 2; n++; } } return { spk: dB(Math.sqrt(s2 / n)), mix: dB(SC.stats(y).rms * GAIN), peak: SC.stats(y).peak * GAIN }; });
  check('the speaker is identical in the quick and slow versions', spk[0].spk === spk[1].spk, `speaker ${spk[0].spk.toFixed(3)} and ${spk[1].spk.toFixed(3)} dB RMS over its lines; whole mixes ${spk[0].mix.toFixed(2)} and ${spk[1].mix.toFixed(2)} dB (the listener's return is the only difference)`);
  let worst = 0; for (const rel of [0.02, 0.04, 0.08, 0.3, 0.5, 0.8, 1]) worst = Math.max(worst, SC.stats(SC.mix(a, b, R(rel).d.gain)).peak * GAIN); worst = Math.max(worst, SC.stats(SC.mix(a, b, null)).peak * GAIN);
  check('no version passes 0.9', worst <= 0.9, `loudest peak ${worst.toFixed(3)}`);
  check('the reading is the piece\'s, not the page\'s', !P.who.includes('page’s reading') && P.who.includes('piece’s reading'), 'step, verdicts');
  check('chance figure: 6 of 6 by a coin = 1 ÷ 64', Math.abs(SC.atLeast(6, 6, 0.5) - 1 / 64) < 1e-12 && P.who.includes('1 ÷ 64 = 1.6%'), `${(100 * SC.atLeast(6, 6, 0.5)).toFixed(2)}%`);
  info('the voices', `speaker ${V.a_voice}: ${V.a_lines.join(' / ')} · listener ${V.b_voice}: ${V.b_lines.length} lines`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
