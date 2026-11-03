// title: Quantization ↔ Precision vs Flow — rich — check
// born: 2026-11-03
// links: [[Quantization ↔ Precision vs Flow]] (connects-to · rich-face-workshop) · re-checks the four made pieces listed in [[Quantization ↔ Precision vs Flow — rich.json]]
// forward_vector: I re-run every number the four made pieces and the manifest's offers state, on each piece's own engine (its <script id="engine">), so a challenger or a re-tune can check them without a browser. Run: node "Quantization ↔ Precision vs Flow — rich — check.mjs" (a second or two). Exits 1 on any FAIL.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const engine = (what, names) => { const s = readFileSync(join(here, `Quantization ↔ Precision vs Flow — rich — ${what}.html`), 'utf8'); const m = s.match(/<script id="engine">([\s\S]*?)<\/script>/); return new Function(`${m[1]}; return { ${names} };`)(); };
let fails = 0;
const ok = (cond, what) => { console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${what}`); if (!cond) fails++; };
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;

// ── mistake or feel: the strength rule can't tell a stumble from a lean ──
{ const E = engine('mistake or feel', 'SIX, gridOf, quantize, groove, placed, report, ONE');
  console.log('mistake or feel');
  ok(E.SIX === 0.125, '16th at 120 BPM = 0.125 s');
  ok(near(E.quantize(E.ONE.played, 1), 0.5), '0.537 s snaps to 0.500 s at 120 BPM');
  ok(near(E.quantize(E.ONE.played, 0.5), 0.5185), 'at 50 % it lands at 0.5185 s');
  const H = E.groove();
  ok(H.every((h) => near(E.gridOf(h.t), h.step * E.SIX)), `every one of ${H.length} hits sits nearer its own 16th than any other (no deviation past 62.5 ms)`);
  const st = H.find((h) => h.tag === 'stumble'), le = H.filter((h) => h.tag === 'lean');
  ok(near(1000 * (st.t - E.gridOf(st.t)), 37, 1e-6) && near(1000 * (le[2].t - E.gridOf(le[2].t)), -37, 1e-6), 'the stumble is +37 ms, the lean\'s last note −37 ms');
  let same = true, firstUnder5 = null, both = false;
  for (let i = 0; i <= 100; i++) { const s = i / 100, r = E.report(H, s); if (!near(r.stumbleShare, 1 - s, 1e-9) || !near(r.leanShare, 1 - s, 1e-9)) same = false; if (firstUnder5 == null && Math.abs(r.stumble) < 5) firstUnder5 = i; if (Math.abs(r.stumble) < 5 && r.leanShare >= 0.75) both = true; }
  const rest0 = E.report(H, 0).restRms, rest60 = E.report(H, 0.6).restRms;
  ok(same, 'at every strength 0…100 %, the stumble and the lean keep the same share, 1 − s');
  ok(near(rest60 / rest0, 0.4, 1e-9), `the rest's spread scales the same way (${rest0.toFixed(2)} ms at 0 %, ${rest60.toFixed(2)} at 60 %)`);
  ok(firstUnder5 === 87, `the stumble first falls under 5 ms at s = ${firstUnder5} %, where the lean keeps ${(100 - firstUnder5)} %`);
  ok(!both, 'no strength alone gets the stumble under 5 ms with the lean at 75 % or more');
  const held = new Set(le.map((h) => h.id)), r = E.report(H, 1, held);
  ok(near(r.stumble, 0, 1e-9) && near(r.leanShare, 1, 1e-9), 'holding the three lean notes at 100 %: stumble 0 ms, lean kept whole');
  // the page's own numbers, tempo and velocity
  const at = (bpm) => { const g = 60 / bpm / 4; return Math.round(0.537 / g) * g; };
  console.log(`  note  0.537 s snaps to: ${[90, 100, 110, 120, 140].map((b) => `${b} BPM → ${at(b).toFixed(3)} s`).join(' · ')}`);
  ok(near(at(120), 0.5) && near(at(100), 0.6), 'the example depends on the tempo: 0.500 at 120 BPM, 0.600 at 100 BPM');
  const vq = (v) => Math.round(v / 16) * 16, to80 = []; for (let v = 0; v <= 127; v++) if (vq(v) === 80) to80.push(v);
  ok(vq(73) === 80 && 80 - 73 === 7 && 73 - 64 === 9, 'velocity 73 on a grid of 16 rounds to 80 (7 away), not 64 (9 away)');
  console.log(`  note  velocities that land on 80: ${to80[0]}–${to80[to80.length - 1]} (${to80.length} values); a grid of 16 keeps ${new Set(Array.from({ length: 128 }, (_, v) => Math.min(127, vq(v)))).size} distinct values of 128`);
}

// ── swing and template: same amount, different pattern ──
{ const E = engine('swing and template', 'SIX, swung, FEEL, TEMPLATE, rms, humanize, referenceBars, capture');
  console.log('swing and template');
  const four = (S) => [0, 1, 2, 3].map((s) => E.swung(s, S));
  console.log(`  note  first four 16ths: 50 % ${four(0.5).map((x) => x.toFixed(4)).join(', ')} · 66 % ${four(0.66).map((x) => x.toFixed(4)).join(', ')} · 2/3 ${four(2 / 3).map((x) => x.toFixed(4)).join(', ')}`);
  ok(near(E.swung(1, 0.66), 0.165) && near(E.swung(3, 0.66), 0.415), 'at 66 % the offbeats land at 0.165 and 0.415 s');
  ok(near(E.swung(1, 2 / 3), 1 / 6) && near(E.swung(3, 2 / 3), 0.25 + 1 / 6), "the page's 0.167 and 0.417 are 2/3 (66.7 %), triplet swing");
  const dev = Math.max(...E.TEMPLATE.map((x, i) => Math.abs(x - E.FEEL[i])));
  ok(dev < 6, `the template captured from 4 bars sits within ${dev.toFixed(1)} ms of the player's feel at every 16th`);
  const tr = E.rms(E.TEMPLATE); let match = true, differ = false;
  for (let k = 0; k < 64; k++) { const h = E.humanize(k); if (!near(E.rms(h), tr, 1e-9)) match = false; if (k && Math.abs(h[0] - E.humanize(k - 1)[0]) > 1e-6) differ = true; }
  ok(match, `humanize matches the template's ${tr.toFixed(2)} ms RMS on every one of 64 passes`);
  ok(differ, 'humanize draws new offsets every pass; the template repeats');
}

// ── to what resolution: the fade needs more bits than the attack ──
{ const E = engine('to what resolution', 'F, PEAK, TAU, DUR, step, levels, q, fadeStops, render, toneAt');
  console.log('to what resolution');
  ok(E.levels(24) === 16777216 && E.levels(1) === 2, '24 bits = 16,777,216 levels; 1 bit = 2');
  let counts = true; for (let N = 1; N <= 10; N++) { const v = new Set(); for (let i = 0; i <= 200000; i++) v.add(E.q(-1 + 2 * i / 200000, N)); if (v.size !== 2 ** N) counts = false; }
  ok(counts, 'the mid-rise grid takes exactly 2^N values for N = 1…10');
  console.log(`  note  the fade stops at: ${[1, 2, 4, 6, 8, 10, 11, 12, 16].map((N) => `${N} bit ${isFinite(E.fadeStops(N)) ? E.fadeStops(N).toFixed(2) + ' s' : 'never'}`).join(' · ')}`);
  let fewest = null; for (let N = 1; N <= 24; N++) if (E.fadeStops(N) >= 3.5) { fewest = N; break; }
  ok(fewest === 12, `12 bits is the fewest that carries this fade to −60 dB undithered (found ${fewest})`);
  const fs = 48000, plain = E.render(8, { fs }), dith = E.render(8, { fs, dither: true }), tt = [1.5, 2.0, 2.5, 3.0, 3.4];
  const rows = tt.map((t) => ({ t, truth: E.PEAK * Math.exp(-(t + 0.05) / E.TAU), plain: E.toneAt(plain, fs, t), dith: E.toneAt(dith, fs, t) }));
  for (const r of rows) console.log(`  note  8 bit, ${r.t.toFixed(1)} s: true ${r.truth.toFixed(5)} · undithered ${r.plain.toFixed(5)} · dithered ${r.dith.toFixed(5)}`);
  ok(rows.slice(2).every((r) => Math.abs(r.plain - rows[2].plain) < 0.1 * rows[2].plain), 'undithered at 8 bits, the tail\'s 330 Hz stays the same size from 2.5 s on (the fade has stopped)');
  ok(rows.every((r) => Math.abs(r.dith - r.truth) < 0.25 * r.truth), 'dithered at 8 bits, the tail\'s 330 Hz follows the true fade within 25 % at every window');
}

// ── the four tracks: the sheet and the blind mixes ──
{ const E = engine('the four tracks', 'SIX, gridOf, quantize, groove, placed, rmsMs, sheet, MIXES, LEVELS'), A = engine('mistake or feel', 'groove');
  console.log('the four tracks');
  const H = E.groove(), HA = A.groove();
  ok(HA.every((h, i) => H[i].part === h.part && near(H[i].t, h.t)), 'the groove is The Technical Side piece\'s groove, hit for hit, plus percussion');
  const lines = E.sheet(H).split('\n'), rows = lines.slice(1).map((l) => l.split(','));
  ok(rows.length === H.length, `the sheet has a row for every one of ${H.length} hits`);
  let good = true; for (const r of rows) { const g = +r[3], played = H.find((h) => h.part === r[0] && (h.step % 16) + 1 === +r[2] && Math.floor(h.step / 16) + 1 === +r[1]); if (!played || !near(+r[9], g, 0.051) || !near(+r[5], 1000 * played.t, 0.051) || !near(+r[7], (g + 1000 * played.t) / 2, 0.051)) good = false; }
  ok(good, 'every row: 100 % = its grid line, 0 % = as played, 50 % = halfway');
  const m = E.MIXES[3].st, p = E.placed(H, m), part = (q) => E.rmsMs(p.filter((h) => h.part === q)), p0 = E.placed(H, 0), part0 = (q) => E.rmsMs(p0.filter((h) => h.part === q));
  ok(part('kick') === 0 && part('snare') === 0 && near(part('hat'), part0('hat') / 2, 1e-9) && near(part('perc'), part0('perc'), 1e-9), `the student's mix: kick 0, snare 0, hats ${part('hat').toFixed(2)} ms (half of ${part0('hat').toFixed(2)}), percussion ${part('perc').toFixed(2)} ms (whole)`);
  ok(E.MIXES[0].st === 0 && E.MIXES[1].st === 1 && E.MIXES[2].st === 0.5, 'the other three blind mixes are 0, 100 and 50 %');
}
console.log(fails ? `${fails} FAIL` : 'all PASS');
process.exit(fails ? 1 : 0);
