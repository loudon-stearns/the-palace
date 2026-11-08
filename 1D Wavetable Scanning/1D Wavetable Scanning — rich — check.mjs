// title: 1D Wavetable Scanning — rich — check
// born: 2026-11-03
// links: [[1D Wavetable Scanning]] (connects-to · rich-face-check) · checks "1D Wavetable Scanning — rich — switch or scan.html" and "… — which order is brightness.html"
// forward_vector: I run each piece's own engine, pulled out of its page, in Node, and hold it to every number the page and its offers state. Run me after any change to a piece: node "1D Wavetable Scanning/1D Wavetable Scanning — rich — check.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
function load(file, names) {
  const html = fs.readFileSync(path.join(here, file), 'utf8');
  const block = (id) => html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`))[1];
  return new Function(block('frames') + block('engine') + `; return { AKWF_B64, AKWF_NAMES, ${names.join(', ')} };`)();
}
let fails = 0;
const ok = (cond, what) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${what}`); if (!cond) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ---- switch or scan ----
{
  const A = load('1D Wavetable Scanning — rich — switch or scan.html', ['decodeFrames', 'readFrame', 'moved', 'makeVoice', 'voiceSample', 'renderSweep', 'betweenDb', 'harmonics', 'middleDb', 'phaseDb', 'FRAME']);
  const F = A.decodeFrames(A.AKWF_B64, 6);
  // the frames are the first build's: the same bytes as the scanner's "AKWF — centroid-sorted" table
  const scanner = fs.readFileSync(path.join(here, '..', 'Projects', 'Wavetable Scanner', 'wavetable_scanner.html'), 'utf8');
  const T = JSON.parse(scanner.match(/const TABLES = (\[.*?\]);\n/s)[1]).find((t) => t.label.startsWith('AKWF — centroid-sorted'));
  ok(T && T.data === A.AKWF_B64, 'the six frames are byte for byte the first build’s AKWF centroid-sorted table');
  for (const sr of [48000, 44100]) {
    const f0 = sr / 512, rows = [];
    for (const secs of [5, 2, 0.5]) rows.push({ secs, any: A.betweenDb(A.renderSweep(F, 'switch', 'any', sr, f0, secs), sr, f0), start: A.betweenDb(A.renderSweep(F, 'switch', 'start', sr, f0, secs), sr, f0), scan: A.betweenDb(A.renderSweep(F, 'scan', 'any', sr, f0, secs), sr, f0) });
    const still = A.betweenDb(A.renderSweep([F[3], F[3]], 'scan', 'any', sr, f0, 5), sr, f0);
    console.log(`     ${sr} Hz: ` + rows.map((r) => `${r.secs} s pick ${r.any.toFixed(1)} / at start ${r.start.toFixed(1)} / blend ${r.scan.toFixed(1)} dB`).join(' · ') + ` · held ${still.toFixed(1)} dB`);
    ok(rows.every((r) => r.any - r.scan >= 20), `${sr}: at every sweep speed the blend puts 20 dB or more less between the harmonics than picking`);
    ok(rows.every((r) => Math.abs(r.any - r.start) < 1), `${sr}: switching at the cycle’s start changes the share by under 1 dB`);
    ok(still < rows[0].scan - 40, `${sr}: a held frame sits 40 dB or more under the slowest blend sweep (the measurement’s floor)`);
    if (sr === 48000) ok(near(rows[0].any, -26.5, 0.1) && near(rows[0].scan, -69.1, 0.1) && near(rows[0].start, -26.5, 0.1), '48000: 5 s sweep, pick −26.5, at start −26.5, blend −69.1 dB (the offer’s numbers)');
  }
  // a switcher that waits for the cycle's start really does wait: it changes frame only where the phase wraps
  { const v = A.makeVoice(F, 48000, 0); v.mode = 'switch'; v.at = 'start'; v.sweep = { n: 0, len: 48000 }; let bad = 0, last = v.cur, ph = v.ph;
    for (let i = 0; i < 48000; i++) { ph = v.ph; A.voiceSample(v, 1 / 512); if (v.cur !== last && v.ph !== 0) bad++; last = v.cur; } ok(bad === 0, 'the careful switcher changes frame only at the cycle’s start'); }
  // two frames that sound the same: the saw and the saw moved
  const H = F.map((t) => A.harmonics(t, 511)), saw = H[4];
  let worst = 0, dmax = 0;
  for (const d of [0.03125, 0.1, 0.25, 0.3125, 0.5]) {
    const B = A.harmonics(A.moved(F[4], d), 511);
    for (let k = 1; k <= 40; k++) {
      const ma = Math.hypot(saw.re[k], saw.im[k]), mb = Math.hypot(B.re[k], B.im[k]);
      dmax = Math.max(dmax, Math.abs(20 * Math.log10(mb / ma)));
      const mid = Math.hypot((saw.re[k] + B.re[k]) / 2, (saw.im[k] + B.im[k]) / 2), pred = ma * Math.abs(Math.cos(Math.PI * k * Math.round(d * 1024) / 1024));
      worst = Math.max(worst, Math.abs(mid - pred) / ma);
    }
  }
  ok(dmax < 1e-6, `B moved has A’s harmonic strengths exactly (largest difference ${dmax.toExponential(1)} dB)`);
  ok(worst < 1e-9, `the middle’s harmonic k is |A_k| · |cos(π k d)| (largest error ${worst.toExponential(1)} of |A_k|)`);
  const Bh = A.harmonics(A.moved(F[4], 0.5), 511), m05 = A.middleDb(saw, Bh, 1, 511);
  ok(near(m05, -6.02, 0.02), `moved half a cycle, the middle sits ${m05.toFixed(2)} dB under the ends: the odd harmonics gone`);
  const m01 = A.middleDb(saw, A.harmonics(A.moved(F[4], 0.1), 511), 1, 511);
  ok(near(m01, -1.36, 0.02), `moved a tenth of a cycle, the middle sits ${m01.toFixed(2)} dB under the ends`);
  // the test: the five neighbours' middles
  const M = [];
  for (let i = 0; i < 5; i++) { let d = 0; for (let j = 0; j < 1024; j++) d += (F[i + 1][j] - F[i][j]) ** 2;
    const ph = Math.atan2(H[i + 1].im[1], H[i + 1].re[1]) - Math.atan2(H[i].im[1], H[i].re[1]);
    M.push({ i, diff: Math.sqrt(d / 1024), low: A.middleDb(H[i], H[i + 1], 1, 4), high: A.middleDb(H[i], H[i + 1], 8, 511), lowPh: A.phaseDb(H[i], H[i + 1], 1, 4), highPh: A.phaseDb(H[i], H[i + 1], 8, 511), fund: Math.abs(((ph * 180 / Math.PI) % 360 + 540) % 360 - 180) }); }
  for (const r of M) console.log(`     ${A.AKWF_NAMES[r.i]} → ${A.AKWF_NAMES[r.i + 1]}: rms ${r.diff.toFixed(3)} · fundamentals ${r.fund.toFixed(0)}° apart · h1–4 ${r.low.toFixed(2)} (phase ${r.lowPh.toFixed(2)}) · h8+ ${r.high.toFixed(2)} (phase ${r.highPh.toFixed(2)}) dB`);
  ok(M.every((r) => r.high <= -1.6 && r.high >= -3.6), 'every neighbour pair’s top (h8 up) dips at the middle against the ends, between −1.6 and −3.6 dB');
  ok(M.every((r) => r.highPh < -0.3 && r.highPh >= r.high - 1e-9), 'in every pair some of the top’s dip is phase (more than 0.3 dB), and never more than the whole dip');
  const nr = M.reduce((a, r) => (r.diff < a.diff ? r : a));
  ok(nr.i === 1 && nr.highPh < -1.8, `the closest pair (${A.AKWF_NAMES[nr.i]} → ${A.AKWF_NAMES[nr.i + 1]}, rms ${nr.diff.toFixed(3)}) loses ${nr.highPh.toFixed(2)} dB up top to phase`);
  const lw = M.reduce((a, r) => (r.lowPh < a.lowPh ? r : a)), lh = M.reduce((a, r) => (r.lowPh > a.lowPh ? r : a));
  ok(lw.i === 0 && lw.fund > 150 && lw.lowPh < -2.5 && lh.i === 3 && lh.fund < 5 && lh.lowPh > -0.1, `the bottom loses ${lw.lowPh.toFixed(2)} dB to phase where the fundamentals start ${lw.fund.toFixed(0)}° apart, ${lh.lowPh.toFixed(2)} where ${lh.fund.toFixed(0)}°`);
  ok(M.filter((r) => r.low <= r.high + 0.05).length >= 2, 'in at least two pairs the bottom dips as much as the top or more: thinner, not duller');
  // Lost branches: a blend held still adds no harmonic the frames lack; a curve across frames, not a line, only smooths the sweep
  { const sr = 48000, f0 = sr / 512, len = 5 * sr, y = new Float32Array(len), n = 6; let ph = 0;
    for (let s = 0; s < len; s++) { const x = (s / len) * (n - 1), i = Math.min(n - 2, Math.floor(x)), t = x - i, g = (j) => A.readFrame(F[Math.max(0, Math.min(n - 1, j))], ph);
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      y[s] = p1 + 0.5 * t * (p2 - p0 + t * (2 * p0 - 5 * p1 + 4 * p2 - p3 + t * (3 * (p1 - p2) + p3 - p0))); ph += 1 / 512; if (ph >= 1) ph -= 1; }
    const cubic = A.betweenDb(y, sr, f0), lin = A.betweenDb(A.renderSweep(F, 'scan', 'any', sr, f0, 5), sr, f0);
    const v = A.makeVoice([F[3], F[4]], sr, 0.5), yh = new Float32Array(len); for (let s = 0; s < len; s++) yh[s] = A.voiceSample(v, 1 / 512);
    const held = A.betweenDb(yh, sr, f0);
    ok(held < -110, `a blend held at 0.5 between vgsqu and saw puts ${held.toFixed(1)} dB between the harmonics: nothing either frame lacks`);
    // at fs ⁄ 512 every alias of the read lands on a harmonic; at 440 Hz it doesn't, so measure there too
    const f4 = 440, heldAt = (fr, p) => { const v4 = A.makeVoice(fr, sr, p), y4 = new Float32Array(len); for (let s = 0; s < len; s++) y4[s] = A.voiceSample(v4, f4 / sr); return A.betweenDb(y4, sr, f4); };
    const hv = heldAt([F[3], F[3]], 0), hs = heldAt([F[4], F[4]], 0), hb = heldAt([F[3], F[4]], 0.5);
    console.log(`     held at 440 Hz, 48000: vgsqu ${hv.toFixed(1)} · saw ${hs.toFixed(1)} · blend at 0.5 ${hb.toFixed(1)} dB between the harmonics`);
    ok(hb < Math.max(hv, hs) && hb > Math.min(hv, hs), 'at 440 Hz the held blend lands between its two frames: it adds no aliasing of its own');
    const p4 = A.betweenDb(A.renderSweep(F, 'switch', 'any', sr, f4, 5), sr, f4), b4 = A.betweenDb(A.renderSweep(F, 'scan', 'any', sr, f4, 5), sr, f4);
    console.log(`     5 s sweep at 440 Hz, 48000: pick ${p4.toFixed(1)} · blend ${b4.toFixed(1)} dB`);
    ok(p4 - b4 > 10 && p4 - b4 < 20, `at 440 Hz the blend is still under picking, by ${(p4 - b4).toFixed(1)} dB, less than at fs ⁄ 512`);
    console.log(`     across frames, 5 s sweep at 48000: straight line ${lin.toFixed(1)} dB between the harmonics, Catmull-Rom curve ${cubic.toFixed(1)} dB`);
    ok(true, 'measured: a curve across frames against a line, on the same sweep (for the Lost branches offer)'); }
}

// ---- which order is brightness ----
{
  const B = load('1D Wavetable Scanning — rich — which order is brightness.html', ['decodeFrames', 'harmonics', 'centroidOf', 'flatnessOf', 'shortestWalk', 'waveDist', 'orderReport', 'axisCurve', 'centroidAt']);
  const F = B.decodeFrames(B.AKWF_B64, 6), K = 511, H = F.map((t) => B.harmonics(t, K)), N = B.AKWF_NAMES;
  const C = H.map((h) => B.centroidOf(h.re, h.im, K)), Fl = H.map((h) => B.flatnessOf(h, K));
  const proof = [93.4, 212.4, 314.6, 1409.8, 2319.6, 2814.9];
  ok(C.every((c, i) => near(c * 44100 / 1024, proof[i], 0.06)), `the centroids reproduce the akwf-import-build proof’s table: ${C.map((c) => (c * 44100 / 1024).toFixed(1)).join(', ')} Hz`);
  const byC = [...Array(6).keys()].sort((a, b) => C[a] - C[b]), byF = [...Array(6).keys()].sort((a, b) => Fl[a] - Fl[b]);
  ok(byC.join() === byF.join(), `centroid and flatness give the identical order, as the page says: ${byC.map((i) => N[i]).join(' → ')}`);
  const cs = C.map((v) => (v - Math.min(...C)) / (Math.max(...C) - Math.min(...C))), fs2 = Fl.map((v) => (v - Math.min(...Fl)) / (Math.max(...Fl) - Math.min(...Fl)));
  const fw = B.shortestWalk(6, (a, b) => Math.hypot(cs[a] - cs[b], fs2[a] - fs2[b]), (i) => C[i]);
  ok(fw.join() === byC.join(), 'the walk through (centroid, flatness), the proof’s, is the centroid order');
  const ww = B.shortestWalk(6, (a, b) => B.waveDist(F[a], F[b]), (i) => C[i]);
  ok(ww.join() === [1, 2, 5, 4, 0, 3].join(), `the walk through the waveforms: ${ww.map((i) => N[i]).join(' → ')}`);
  const file = [...Array(6).keys()].sort((a, b) => (N[a] < N[b] ? -1 : 1));
  const rc = B.orderReport(F, H, byC, K), rw = B.orderReport(F, H, ww, K), rf = B.orderReport(F, H, file, K);
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  for (const [nm, r] of [['file', rf], ['centroid', rc], ['walk', rw]]) console.log(`     ${nm}: ends ${r.ends.map((v) => v.toFixed(2)).join(' → ')} · ${r.falls} falls, largest ${r.bigFall.toFixed(3)} oct · steepest fifth ${(100 * r.steepShare).toFixed(1)}% · walked ${r.walked.toFixed(3)} · mean middle ${mean(r.dips).toFixed(2)} dB · fifths ${r.seg.map((v) => v.toFixed(2)).join(' ')} oct`);
  ok(rc.falls === 2 && rc.bigFall < 0.1, `sorted, brightness falls in only ${rc.falls} short runs, the largest ${rc.bigFall.toFixed(3)} of an octave`);
  ok(near(rc.steepShare, 0.44, 0.005) && rc.seg.indexOf(Math.max(...rc.seg)) === 2, `sorted, ${(100 * rc.steepShare).toFixed(0)}% of the climb in octaves comes in one fifth, birds → vgsqu`);
  ok(near(1 - rw.walked / rc.walked, 0.38, 0.01), `the waveform walk crosses ${(100 * (1 - rw.walked / rc.walked)).toFixed(0)}% less than the sorted order`);
  const travel = (r) => r.seg.reduce((t, v) => t + Math.abs(v), 0);
  ok(near(travel(rw), 12.6, 0.05) && near(travel(rc), 4.9, 0.05), `by brightness the waveform walk travels ${travel(rw).toFixed(1)} octaves of centroid, the sorted order ${travel(rc).toFixed(1)}`);
  ok(rc.seg.indexOf(Math.max(...rc.seg)) === 2, 'birds → vgsqu is the third fifth of the sorted knob');
  ok(mean(rw.dips) > mean(rc.dips) + 1, `the walk’s middles dip ${mean(rw.dips).toFixed(2)} dB on average, the sorted order’s ${mean(rc.dips).toFixed(2)}`);
  ok(rw.bigFall > 4 && rf.bigFall > 4, 'file order and the walk both fall more than four octaves somewhere along the knob');
  const pc = B.axisCurve(H, [0, 4], 400, K); let up = true; for (let j = 1; j < pc.length; j++) if (pc[j] < pc[j - 1]) up = false;
  ok(up, 'cheeze to saw: brightness only rises along the blend');
}
console.log(fails ? `\n${fails} FAILED` : '\nall checks pass');
process.exit(fails ? 1 : 0);
