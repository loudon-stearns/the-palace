// check-coupling-edge.mjs — re-run every claim the coupling-edge study makes, headless, on the
// page's own engine, and write the numbers behind them to answers.json.
//   node check-coupling-edge.mjs        (~3 minutes)
//
// Prints PASS / FAIL per claim and exits non-zero on any FAIL. The claims are what the page's
// "Measured" lines and the scroll say; if a number there changes, it changes here first.
// Pattern: _ops/rich-face/check-kuramoto-pieces.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { common, makeProc, configure, hold, stats } from './edge-lab.mjs';

const C = common(), A = {};
let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const here = (f) => new URL(f, import.meta.url);
const frozen = (f) => here(`../../../Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/${f}`);

// hold, then read each partial's slip against its partner over the last 2 s
function probe(o, secs = 4, sr = 44100) {
  const p = configure(makeProc(sr), C, { ...o, silent: 1, trace: true });
  p.run(secs - 2); p.S.report = 1; p.repLen = 2 * sr; p.repN = 0; p.slipAcc.fill(0); p.run(2.01);
  return { ...stats(p.traceA, secs - 2, Infinity, p.hop / sr), slip: Array.from(p.lastMsg.slip), mate: Array.from(p.lastMsg.mate), p };
}
// the duo: the interval the two tones settle on over the second half
function duo(o, secs = 10, sr = 44100) {
  const p = configure(makeProc(sr), C, { partner: 1, src: 'warm', silent: 1, trace: true, ...o });
  p.run(secs); const i0 = Math.round(secs / 2 / (p.hop / sr)), iv = p.traceA.slice(i0).map((x, i) => 1200 * Math.log2(p.traceB[i0 + i] / x));
  const mu = iv.reduce((a, b) => a + b, 0) / iv.length;
  return { interval: mu, sd: Math.sqrt(iv.reduce((a, b) => a + (b - mu) ** 2, 0) / iv.length) };
}
const rPin = (n, B) => n * Math.sqrt((1 + B * n * n) / (1 + B));

// ── 1. the port: the page's engine against the frozen sweeps ────────────────
{
  const em = JSON.parse(readFileSync(frozen('edgemap.json'), 'utf8'));
  const Ks = [1, 2, 4, 6, 10, 16, 25], Bs = Array.from({ length: 33 }, (_, i) => Math.pow(10, -8 + i * 0.25));
  let worst = 0, n = 0;
  for (const [panel, N] of [['N40_unpinned', 40], ['N6_unpinned', 6]]) for (const ki of [0, 3, 5]) for (let bi = 0; bi < 33; bi += 2) {
    const py = em[panel].wobble_hz[ki][bi]; if (py >= 0.45) continue;
    const js = hold(C, { N, K: Ks[ki], s: Math.log10(Bs[bi]), hop: 220 }, 4, 22050).wobble;
    worst = Math.max(worst, Math.abs(js - py)); n++;
  }
  A.port_edgemap = { cells: n, worst_hz: +worst.toFixed(3) };
  check('engine matches edgemap.json in every holding cell (22.05 kHz, as the map ran)', worst <= 0.05, `${n} cells, worst difference ${worst.toFixed(3)} Hz`);

  const ref = JSON.parse(readFileSync(here('reference/ride-reference.json'), 'utf8'));
  const sb = hold(C, { N: 40, K: 1, pinned: true, s: Math.log10(0.01), breathe: 1, brD: Math.log10(3000), brP: 20, hop: 441 }, 12, 44100).p.traceA;
  // barely coupled, the reference's fundamental jitters by about 0.1 Hz for the first seconds, so sample blocks part
  // there; compare the blocks once it settles (after 5 s) and the 1 s means throughout
  const nSB = Math.min(sb.length, ref['ride-string-bar'].length), rSB = ref['ride-string-bar'];
  const dSB = Math.max(...rSB.slice(500, nSB).map((v, i) => Math.abs(v - sb[500 + i])));
  let dMean = 0; for (let t = 0; t + 100 <= nSB; t += 100) dMean = Math.max(dMean, Math.abs(stats(rSB.slice(t, t + 100)).mean - stats(sb.slice(t, t + 100)).mean));
  const rc = hold(C, { N: 40, K: 6, s: Math.log10(2.5e-5), ride: 1, rideLo: 2, rideHi: 18, rideP: 20, hop: 441 }, 12, 44100).p.traceA;
  const sR = stats(ref['ride-coupling']), sJ = stats(rc.slice(0, ref['ride-coupling'].length));
  A.port_rides = { string_bar_max_diff_after_5s_hz: +dSB.toFixed(4), string_bar_max_1s_mean_diff_hz: +dMean.toFixed(4), coupling_mean: [+sR.mean.toFixed(2), +sJ.mean.toFixed(2)], coupling_wobble: [+sR.wobble.toFixed(2), +sJ.wobble.toFixed(2)] };
  check('string ↔ bar ride (breathe modulator) follows ride.py', dSB < 0.07 && dMean < 0.06, `10 ms means after 5 s within ${dSB.toFixed(3)} Hz; 1 s means within ${dMean.toFixed(3)} Hz throughout`);
  check('coupling ride (ride modulator) matches ride.py in mean and wobble', Math.abs(sR.mean - sJ.mean) < 0.2 && Math.abs(sJ.wobble / sR.wobble - 1) < 0.25,
    `mean ${sR.mean.toFixed(2)} vs ${sJ.mean.toFixed(2)} Hz, wobble ${sR.wobble.toFixed(2)} vs ${sJ.wobble.toFixed(2)} Hz`);
}

// ── 2. the edge table ───────────────────────────────────────────────────────
{
  const e40 = C.edgeS(6, 40, false, 0, 'bright'), e6 = C.edgeS(6, 6, false, 0, 'bright');
  A.edge_vs_map = { N40_K6: +Math.pow(10, e40).toExponential(3), N6_K6: +Math.pow(10, e6).toExponential(3) };
  check('bisected edge falls in the frozen map\'s grid cell: 40 partials, K = 6', e40 > -5 && e40 <= -4.75 + 0.02, `B ${Math.pow(10, e40).toExponential(2)}; map: first tear at 1.78e-5, held at 1e-5`);
  check('bisected edge falls in the frozen map\'s grid cell: 6 partials, K = 6', e6 > -2.75 && e6 <= -2.5 + 0.02, `B ${Math.pow(10, e6).toExponential(2)}; map: first tear at 3.16e-3, held at 1.78e-3`);
  const o = { N: 40, K: 25, s: -8 }, w = [22050, 44100, 88200].map((sr) => hold(C, o, 4, sr).wobble);
  A.overcoupled_band = { wobble_hz_at: { 22050: +w[0].toFixed(3), 44100: +w[1].toFixed(3), 88200: +w[2].toFixed(3) } };
  check('the map\'s over-coupled band (40 partials, K = 25, no stretch) is its 22.05 kHz step', w[0] > 0.5 && w[1] < 0.05 && w[2] < 0.05, `wobble ${w.map((x) => x.toFixed(3)).join(' / ')} Hz at 22.05 / 44.1 / 88.2 kHz`);
}

// ── 3. hold it just under the edge, at any pitch ────────────────────────────
{
  const e = C.edgeS(6, 64, true, 0, 'warm'), rows = [];
  let ok = true;
  for (const f0 of [41.2034, 110, 440]) {
    const c = 110 / f0, w = [-0.25, 0.25].map((mg) => hold(C, { N: 64, K: 6 / c, f0, s: e + mg, pinned: true, src: 'warm', hop: Math.round(0.01 * c * 44100) }, 4 * c).wobble * c);
    rows.push(`${f0.toFixed(0)} Hz: ${w[0].toFixed(2)} / ${w[1].toFixed(2)}`); ok = ok && w[0] < 0.5 && w[1] > 0.5;
    (A.margin_by_pitch ??= {})[f0.toFixed(1)] = { under: +w[0].toFixed(3), over: +w[1].toFixed(3) };
  }
  check('a quarter decade under the edge holds and a quarter over tears, E1 to A4, on the tone\'s own clock', ok, `wobble (A2 Hz) under / over: ${rows.join(' · ')}`);
  const s = e + 0.2, w = [2, 6, 16].map((K) => hold(C, { N: 64, K, s, pinned: true, src: 'warm' }, 4).wobble);
  A.coupling_as_knob = { s: +s.toFixed(3), wobble_at_K_2_6_16: w.map((x) => +x.toFixed(3)) };
  check('coupling is the knob: at fixed stretch just past the edge, more coupling relocks, less tears harder', w[2] < 0.5 && w[1] > 0.5 && w[0] > w[1], `wobble at K 2 / 6 / 16: ${w.map((x) => x.toFixed(2)).join(' / ')} Hz`);
}

// ── 4. gestures ─────────────────────────────────────────────────────────────
{
  const e = C.edgeS(6, 64, true, 0, 'warm'), drops = [];
  for (const h of [0.25, 0.5, 1, 1.5]) {
    const p = configure(makeProc(44100), C, { N: 64, K: 6, s: e - 0.25, sEdge: e, pinned: true, src: 'warm', strD: h, strTau: 0.25, silent: 1, trace: true });
    p.run(3); const pre = stats(p.traceA, 2, 3).mean; p.send({ strike: true }); p.run(3);
    drops.push(1200 * Math.log2(Math.min(...p.traceA.slice(300)) / pre));
  }
  A.strike_drop_cents = Object.fromEntries([0.25, 0.5, 1, 1.5].map((h, i) => [h, +drops[i].toFixed(1)]));
  check('a strike\'s pitch drop deepens with how far past the edge it is thrown', drops.every((d, i) => i === 0 || d < drops[i - 1]), `deepest dip at +0.25 / 0.5 / 1 / 1.5 decades: ${drops.map((d) => d.toFixed(0)).join(' / ')} ¢`);
  const steps = [-1.26, -0.26, 0.52, 1.05, -0.5, 0.25], T = 2, p = configure(makeProc(44100), C, { N: 64, K: 6, s: -9, sEdge: e, pinned: true, src: 'warm', seq: 1, seqS: [...steps, -1, -1], seqT: T, silent: 1, trace: true });
  p.run(steps.length * T);
  const w = steps.map((_, i) => stats(p.traceA, i * T + 1, (i + 1) * T).wobble);
  A.sequence_step_wobble = Object.fromEntries(steps.map((s, i) => [s, +w[i].toFixed(3)]));
  check('a sequence plays the threshold: steps over the edge tear, steps under it hold', steps.every((s, i) => (s > 0) === (w[i] > 0.5)), steps.map((s, i) => `${s > 0 ? '+' : ''}${s}: ${w[i].toFixed(2)}`).join(' · ') + ' Hz');
}

// ── 5. measured materials ───────────────────────────────────────────────────
{
  const a2 = C.DATA.piano.find((p) => p.note === 'A2'), eA2 = C.edgeS(6, a2.partials, true, 0, 'warm');
  const torn = hold(C, { N: a2.partials, K: 6, s: Math.log10(a2.B), pinned: true, src: 'warm' }, 4).wobble;
  // past the table's top (K = 25), hold the real string at stronger couplings; and with fewer of its partials
  const e25 = C.edgeS(25, a2.partials, true, 0, 'warm'), w25 = hold(C, { N: a2.partials, K: 25, s: Math.log10(a2.B), pinned: true, src: 'warm' }, 4).wobble;
  const strong = [64, 128, 256].map((k) => hold(C, { N: a2.partials, K: k, s: Math.log10(a2.B), pinned: true, src: 'warm' }, 4).wobble);
  const fewer = [6, 12, 24].map((n) => hold(C, { N: n, K: 6, s: Math.log10(a2.B), pinned: true, src: 'warm' }, 4).wobble);
  A.piano_registers = C.DATA.piano.map((p) => ({ note: p.note, B: p.B, partials: p.partials, edge_B_at_K6: +Math.pow(10, C.edgeS(6, p.partials, true, 0, 'warm')).toExponential(2), decades_past: +(Math.log10(p.B) - C.edgeS(6, p.partials, true, 0, 'warm')).toFixed(2) }));
  A.piano_A2 = { wobble_at_K6: +torn.toFixed(2), edge_B_at_K6: +Math.pow(10, eA2).toExponential(2), edge_B_at_K25: +Math.pow(10, e25).toExponential(2), wobble_at_K25: +w25.toFixed(2),
    wobble_at_K_64_128_256: strong.map((x) => +x.toFixed(2)), wobble_K6_with_6_12_24_partials: fewer.map((x) => +x.toFixed(2)) };
  check(`the real A2 string (B 8.3e-5) holds with its first 12 partials, and tears sounding up to partial ${a2.partials} (the highest it sounds at the strike) at every coupling from 6 to 256 Hz`,
    torn > 0.5 && w25 > 0.5 && strong.every((w) => w > 0.5) && fewer[0] < 0.5 && fewer[1] < 0.5,
    `${a2.partials} partials: ${torn.toFixed(2)} / ${w25.toFixed(2)} / ${strong.map((w) => w.toFixed(2)).join(' / ')} Hz at K 6 / 25 / 64 / 128 / 256; at K 6 with 6 / 12 / 24 partials: ${fewer.map((w) => w.toFixed(2)).join(' / ')} Hz`);
  const v = C.DATA.materials.vibraphone, eV = JSON.parse(readFileSync(here('edge-table.json'), 'utf8')).materials.vibraphone[3];
  const wv = [-0.3, 0.3].map((d) => hold(C, { N: v.cents.length, K: 6, s: eV + d, pinned: true, law: 1, tab: v.cents, amps: v.amps }, 4).wobble);
  A.vibraphone = { edge_depth_at_K6: +Math.pow(10, eV).toFixed(4), wobble_half_and_double: wv.map((x) => +x.toFixed(3)) };
  check('the vibraphone tears at a small fraction of its real bend', wv[0] < 0.5 && wv[1] > 0.5, `edge at ×${Math.pow(10, eV).toFixed(3)} of the measured bend; wobble ${wv[0].toFixed(2)} under, ${wv[1].toFixed(2)} over`);
}

// ── 6. re-pairing: the bar locks again ──────────────────────────────────────
{
  const nb = probe({ N: 40, K: 6, s: 3, pinned: true, pairing: 1, src: 'warm' }), fx = probe({ N: 40, K: 6, s: 3, pinned: true, pairing: 0, src: 'warm' });
  const squares = nb.mate.slice(0, 6).map((m) => m + 1), slipN = Math.max(...nb.slip.slice(0, 6).map(Math.abs)), slipF = Math.min(...fx.slip.slice(1, 6).map(Math.abs));
  A.bar_repairing = { voices: squares, max_slip_hz: +slipN.toFixed(4), wobble: +nb.wobble.toFixed(4), fixed_min_slip_hz: +slipF.toFixed(1) };
  check('with nearest pairing the bar\'s partials 1–6 lock to voices 1, 4, 9, 16, 25, 36', squares.join() === '1,4,9,16,25,36' && slipN < 0.1 && nb.wobble < 0.05,
    `voices ${squares.join(', ')}; largest slip ${slipN.toFixed(3)} Hz; wobble ${nb.wobble.toFixed(3)} Hz. Fixed pairing: every one of partials 2–6 slips by at least ${slipF.toFixed(0)} Hz`);
  const scan = [-6, -4, -3, -2, -1, 0, 1, 2, 3].map((s) => { const r = probe({ N: 40, K: 6, s, pinned: true, pairing: 1, src: 'warm' }); return { s, wobble: +r.wobble.toFixed(2), locked: r.slip.filter((x) => Math.abs(x) < 0.5).length, paired: r.mate.filter((m) => m >= 0).length, mean: +r.mean.toFixed(1) }; });
  A.morph_nearest = scan;
  check('the pinned morph with nearest pairing is frozen at both ends and torn between', scan[0].wobble < 0.5 && scan[2].wobble > 0.5 && scan[3].wobble > 0.5 && scan[8].wobble < 0.05,
    scan.map((r) => `B 1e${r.s}: ${r.wobble} Hz`).join(' · '));
}

// ── 7. loudness-following coupling ──────────────────────────────────────────
{
  const sc = (g) => [-9, -7, -6, -5.5, -5, -4.5, -4, -3.5, -3].map((s) => hold(C, { N: 64, K: 6, s, pinned: true, src: 'warm', gamma: g }, 4).wobble);
  const w0 = sc(0), w1 = sc(1), w25 = sc(0.25);
  A.loudness = { stretches: [-9, -7, -6, -5.5, -5, -4.5, -4, -3.5, -3], wobble_g0: w0.map((x) => +x.toFixed(2)), wobble_g025: w25.map((x) => +x.toFixed(2)), wobble_g1: w1.map((x) => +x.toFixed(2)) };
  check('coupling that follows loudness (γ = 1) never lets the warm 64-partial tone tear, where uniform coupling does', Math.max(...w1) < 0.5 && Math.max(...w0) > 0.5,
    `largest wobble ${Math.max(...w1).toFixed(2)} Hz with γ 1, ${Math.max(...w0).toFixed(2)} Hz with γ 0, B 1e-9 to 1e-3`);
}

// ── 8. the tear as a modulator ──────────────────────────────────────────────
{
  const rows = [], L = new Float32Array(128), R = new Float32Array(128); let worst = 0;
  for (const [k, rho] of [[2, 1.02], [2, 1.1], [2, 1.5], [2, 3], [0.5, 1.2], [8, 1.05], [2, 0.95]]) {
    const p = configure(makeProc(44100), C, { N: 6, K: 6, s: -9, lfo: 1, lfoK: k, lfoRho: rho, silent: 1 }); p.run(1);
    let prev = p.lfoV, ups = 0; for (let b = 0; b < (30 * 44100) / 128; b++) { p.process([], [[L, R]]); if (prev < 0.5 && p.lfoV >= 0.5) ups++; prev = p.lfoV; }
    const pred = rho > 1 ? k * Math.sqrt(rho * rho - 1) : 0, got = ups / 30; rows.push({ kappa: k, rho, predicted: +pred.toFixed(3), counted: +got.toFixed(3) });
    worst = Math.max(worst, pred ? Math.abs(got / pred - 1) : got);
  }
  A.edge_lfo = rows;
  check('the edge LFO pulses at κ √(ρ² − 1), and sits still below ρ = 1', worst < 0.03, rows.map((r) => `κ ${r.kappa} ρ ${r.rho}: ${r.counted}/${r.predicted}`).join(' · '));
  // the real tone's own slips: a 6-partial tone just past its edge
  const e6 = C.edgeS(6, 6, false, 0, 'bright'), pts = [];
  for (const d of [0.01, 0.03, 0.06, 0.1, 0.2, 0.3]) {
    const tr = hold(C, { N: 6, K: 6, s: e6 + d }, 22, 44100).p.traceA.slice(200);
    const mu = tr.reduce((a, b) => a + b, 0) / tr.length; let c = 0;
    for (let i = 1; i < tr.length; i++) if (tr[i - 1] > mu - 0.3 && tr[i] <= mu - 0.3) c++;
    pts.push([d, c / 20]);
  }
  const lx = pts.map(([d]) => Math.log10(d)), ly = pts.map(([, r]) => Math.log10(r)), mx = lx.reduce((a, b) => a + b) / 6, my = ly.reduce((a, b) => a + b) / 6;
  const slope = lx.reduce((a, x, i) => a + (x - mx) * (ly[i] - my), 0) / lx.reduce((a, x) => a + (x - mx) ** 2, 0);
  A.tone_slips = { points: pts.map(([d, r]) => ({ decades_past: d, slips_per_s: +r.toFixed(2) })), loglog_slope: +slope.toFixed(3) };
  check('a 6-partial tone past its edge slips faster the further past it is, close to the square-root law of one slipping pair', slope > 0.35 && slope < 0.65,
    `${pts.map(([d, r]) => `${d}: ${r.toFixed(1)}/s`).join(' · ')}; log-log slope ${slope.toFixed(2)}`);
}

// ── 9. two tones ────────────────────────────────────────────────────────────
{
  const o10 = duo({ N: 24, K: 6, s: -12, pinned: true, ratioB: 2 * Math.pow(2, 10 / 1200) }), f8 = duo({ N: 24, K: 6, s: -12, pinned: true, ratioB: 1.5 * Math.pow(2, 8 / 1200) });
  A.duo_unstretched = { octave_from_plus10: +o10.interval.toFixed(3), fifth_from_plus8: +f8.interval.toFixed(3) };
  check('unstretched, two coupled tones pull a mistuned octave and fifth exactly true', Math.abs(o10.interval - 1200) < 0.05 && Math.abs(f8.interval - 701.955) < 0.05,
    `octave from +10 ¢ → ${o10.interval.toFixed(2)} ¢; fifth from +8 ¢ → ${f8.interval.toFixed(2)} ¢`);
  const B = 4e-3, s = duo({ N: 24, K: 6, s: Math.log10(B), pinned: true, ratioB: 2 }), lo = 1200 * Math.log2(rPin(2, B)), hi = 1200 * Math.log2(rPin(4, B) / rPin(2, B));
  const piano = [1e-4, 3e-4, 7.4e-4].map((b) => duo({ N: 24, K: 6, s: Math.log10(b), pinned: true, ratioB: 2 }));
  A.duo_stretched = { B, octave: +s.interval.toFixed(2), sd: +s.sd.toFixed(2), between: [+lo.toFixed(2), +hi.toFixed(2)], piano_like: piano.map((d, i) => ({ B: [1e-4, 3e-4, 7.4e-4][i], interval: +d.interval.toFixed(1), sd: +d.sd.toFixed(1) })) };
  check('stretched (B 4e-3), the octave relocks between where partials 2:1 and 4:2 meet', s.sd < 2 && s.interval > lo && s.interval < hi, `${s.interval.toFixed(2)} ± ${s.sd.toFixed(2)} ¢; 2:1 at ${lo.toFixed(2)}, 4:2 at ${hi.toFixed(2)}`);
  check('at piano-like stretch the pair never settles near the octave: it wanders, or snaps to another interval', piano.every((d) => d.sd > 5 || Math.abs(d.interval - 1200) > 50), piano.map((d, i) => `B ${[1e-4, 3e-4, 7.4e-4][i]}: ${d.interval.toFixed(0)} ± ${d.sd.toFixed(0)} ¢`).join(' · '));
}

writeFileSync(here('answers.json'), JSON.stringify(A, null, 1));
console.log(fails ? `\n${fails} FAIL` : '\nall PASS'); console.log('answers.json written');
process.exit(fails ? 1 : 0);
