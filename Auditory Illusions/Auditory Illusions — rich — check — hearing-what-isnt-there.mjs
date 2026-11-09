// Auditory Illusions — rich — check — hearing-what-isnt-there.mjs
// born: 2026-11-08 · checks the two pieces made for [[Auditory Illusions]] § Hearing what isn't there:
// "the waterfall" (the spectral motion aftereffect) and "the ghost in the gap" (the Zwicker tone)
// forward_vector: I re-run, headless, what the two pieces claim about their own sound: that the waterfall's
// ripple drifts at the rate it names while it climbs and at zero while it stands still, that the drift stops
// when the plan says, that its level holds steady, that every run ends inside the kit's 50-second warning, and
// that its detector cartoon tips the right way; that the ghost's gap is as deep, as wide and where it was
// asked to be, at 44.1 and 48 kHz, in the whole loop and in a short window, that notched and plain noise are
// matched in level, that the loop has no seam and the top of the band no cliff, that the hidden jitter stays
// in range, and that the overshoot cartoon puts its ghost inside the gap and lets it fade. What a listener
// hears I cannot check.
//
//   node "Auditory Illusions/Auditory Illusions — rich — check — hearing-what-isnt-there.mjs"
//
// It pulls <script id="wf-core"> and <script id="zw-core"> out of the pieces, runs them in a Node sandbox
// (the worklet too, against stubs of AudioWorkletProcessor), and measures with its own FFT, written here
// apart from the piece's. PASS/FAIL per claim, INFO for numbers worth reading; exits 1 on any FAIL.
// Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const page = (name) => readFileSync(join(HERE, `Auditory Illusions — rich — ${name}.html`), 'utf8');
const WFP = page('the waterfall'), ZWP = page('the ghost in the gap');
const grab = (html, id) => { const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`)); if (!m) throw new Error(`no <script id="${id}">`); return m[1]; };
const E = { Math, Float64Array, Float32Array, Object, Array, Number, JSON, Infinity, String };
vm.createContext(E);
vm.runInContext(grab(WFP, 'wf-core') + '\nthis.WF = WF;', E);
vm.runInContext(grab(ZWP, 'zw-core') + '\nthis.ZW = ZW;', E);
const WF = E.WF, ZW = E.ZW;

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const dB = (p) => 10 * Math.log10(p);

// ── this check's own FFT (iterative radix-2), apart from the piece's ──
function fftC(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    for (let i = 0; i < n; i += len) for (let j = 0; j < len / 2; j++) {
      const wr = Math.cos(ang * j), wi = Math.sin(ang * j), p = i + j, q = p + len / 2;
      const vr = re[q] * wr - im[q] * wi, vi = re[q] * wi + im[q] * wr;
      re[q] = re[p] - vr; im[q] = im[p] - vi; re[p] += vr; im[p] += vi;
    }
  }
}
function powerOf(x, a = 0, n = x.length, hann = false) {
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let i = 0; i < n; i++) re[i] = x[a + i] * (hann ? 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n) : 1);
  fftC(re, im); const p = new Float64Array(n / 2); for (let k = 0; k < n / 2; k++) p[k] = re[k] * re[k] + im[k] * im[k]; return p;
}
const rmsOf = (x, a = 0, b = x.length) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / (b - a)); };

console.log('— both pieces —');
for (const [n, h] of [['the waterfall', WFP], ['the ghost in the gap', ZWP]]) {
  check(`${n}: declares piece:needs, and needs nothing`, /<meta name="piece:needs" content="">/.test(h), 'an empty needs meta in the head');
  check(`${n}: never names the kit's hush message`, !h.includes('rich:' + 'hush'), 'the string is absent');
  check(`${n}: no detached Audio()`, !/new Audio\(/.test(h), 'no new Audio(');
  const made = h.match(/new AudioContext\(/g) || [];
  check(`${n}: one AudioContext, made inside ensure(), which only click handlers call`, made.length === 1 && /async function ensure\(\)\s*\{\s*if \(!ctx\)\s*\{\s*(\/\/[^\n]*\s*)?(ctx|const c) = new AudioContext\(\)/.test(h), `${made.length} constructor call(s)`);
}
check('the waterfall: a worklet that will not load leaves no half-made context, and stopAll never touches a missing node',
  /catch \(e\) \{ try \{ c\.close\(\); \}/.test(WFP) && /ctx = c; out = o; node = n;/.test(WFP) && /if \(ctx && out && node\)/.test(WFP), 'ctx is kept only after addModule; stopAll guards node');
check('the waterfall: a test trial asks the kit to keep playing, and lets go when it ends or stops',
  /keep\(true\);/.test(WFP) && /later\(plan\.total \+ 0\.1, \(\) => \{ keep\(false\)/.test(WFP) && /if \(run && run\.kind === 'trial'\) keep\(false\);/.test(WFP) && /window\.RichPiece\.hold\(on\)/.test(WFP), 'RichPiece.hold(true) at the click, hold(false) at the end and in stopAll');
{
  // the piece's FFT against a plain DFT, so the noise it builds can be trusted to be what it says
  const n = 64, r = ZW.rng(3), re = new Float64Array(n), im = new Float64Array(n), x = [];
  for (let i = 0; i < n; i++) { x.push(r() - 0.5); re[i] = x[i]; }
  ZW.fft(re, im, -1); let err = 0;
  for (let k = 0; k < n; k++) { let a = 0, b = 0; for (let i = 0; i < n; i++) { a += x[i] * Math.cos(2 * Math.PI * k * i / n); b -= x[i] * Math.sin(2 * Math.PI * k * i / n); } err = Math.max(err, Math.hypot(a - re[k], b - im[k])); }
  check("the ghost's FFT matches a plain DFT", err < 1e-10, `largest error ${err.toExponential(1)} over 64 points`);
}

console.log('\n— the waterfall: the sound —');
const P = WF.partials();
{
  const perOct = []; for (let o = 0; o < WF.OCT; o++) perOct.push(P.x.filter((x) => x >= o && x < o + 1).length);
  check('120 sines from 125 Hz to 8 kHz, twenty to every octave', P.f.length === 120 && Math.min(...P.f) > 125 && Math.max(...P.f) < 8000 && perOct.every((c) => c === 20), `${P.f.length} sines, ${Math.min(...P.f).toFixed(1)}–${Math.max(...P.f).toFixed(0)} Hz, per octave ${perOct.join(' ')}`);
  check('the window fades the ends to nothing', Math.max(P.w[0], P.w[119]) < 0.002, `edge weights ${P.w[0].toExponential(1)}, ${P.w[119].toExponential(1)}`);
}
// run the worklet itself, as text, against stubs
function makeWorklet(sr) {
  const W = { Math, Float64Array, Float32Array, sampleRate: sr, currentTime: 0, posted: [] };
  W.AudioWorkletProcessor = class { constructor() { this.port = { postMessage: (m) => W.posted.push(m), onmessage: null }; } };
  W.registerProcessor = (name, cls) => { W.name = name; W.cls = cls; };
  vm.createContext(W); vm.runInContext(WF.WORKLET, W);
  const proc = new W.cls({ processorOptions: WF.options() });
  return { W, proc };
}
function render(plan, sr, seconds) {
  const { W, proc } = makeWorklet(sr);
  proc.port.onmessage({ data: { plan: plan.moves.map((m) => ({ t: m.at, v: m.v })), v: 0, phi: 0 } });
  const n = Math.round(seconds * sr / 128) * 128, y = new Float32Array(n), blk = new Float32Array(128);
  const t0 = Date.now();
  for (let b = 0; b * 128 < n; b++) { W.currentTime = b * 128 / sr; proc.process([], [[blk]]); y.set(blk, b * 128); }
  return { y, ms: Date.now() - t0, name: W.name, posted: W.posted.length };
}
// The ripple's phase in a frame: project the power spectrum (weighted 1/f, so each octave counts once) onto
// one cycle an octave. For a ripple ½[1 + cos 2π(x − φ)] under this window the angle is −2πφ.
function phaseAt(y, sr, a, n = 4096) {
  const p = powerOf(y, a, n, true), df = sr / n; let zr = 0, zi = 0;
  for (let k = 1; k < p.length; k++) { const f = k * df; if (f < WF.LO || f > WF.LO * Math.pow(2, WF.OCT)) continue; const x = Math.log2(f / WF.LO), wgt = p[k] / f; zr += wgt * Math.cos(2 * Math.PI * WF.DENSITY * x); zi -= wgt * Math.sin(2 * Math.PI * WF.DENSITY * x); }
  return -Math.atan2(zi, zr) / (2 * Math.PI);
}
function phaseTrack(y, sr, hop = 0.05) {
  const t = [], ph = []; let prev = null, off = 0;
  for (let a = 0; a + 4096 <= y.length; a += Math.round(hop * sr)) {
    let v = phaseAt(y, sr, a); if (prev !== null) { while (v + off - prev > 0.5) off -= 1; while (v + off - prev < -0.5) off += 1; }
    prev = v + off; t.push((a + 2048) / sr); ph.push(prev);
  }
  return { t, ph };
}
function slope(tr, a, b) { let n = 0, st = 0, sp = 0, stt = 0, stp = 0; tr.t.forEach((t, i) => { if (t >= a && t <= b) { n++; st += t; sp += tr.ph[i]; stt += t * t; stp += t * tr.ph[i]; } }); return (n * stp - st * sp) / (n * stt - st * st); }
const SR = 48000;
const open = WF.opening();
const R = render(open, SR, open.total);
check('the worklet registers as wf-ripple and reports its phase', R.name === 'wf-ripple' && R.posted > 100, `${R.posted} phase reports over ${open.total} s`);
info('render cost', `${open.total} s of 120 sines in ${R.ms} ms of Node: ${(open.total * 1000 / R.ms).toFixed(0)}× real time on this machine`);
const track = phaseTrack(R.y, SR);
{
  const vClimb = slope(track, 1, open.stillAt - 0.5) / WF.DENSITY, vStill = slope(track, open.stillAt + 0.5, open.total - 0.3) / WF.DENSITY;
  check(`the opening climbs at ${WF.RATE} octaves a second`, Math.abs(vClimb - WF.RATE) / WF.RATE < 0.02, `measured ${vClimb.toFixed(4)} oct/s from the sound, over 1–${open.stillAt - 0.5} s`);
  check('then stands still: drift zero in the last eight seconds', Math.abs(vStill) < 0.003, `measured ${vStill.toFixed(5)} oct/s over ${open.stillAt + 0.5}–${(open.total - 0.3).toFixed(1)} s`);
  // when did it stop? fit a ramp then a flat line to the measured phase over 15–25 s, trying every break
  // point, and keep the one that fits best
  let best = { sse: Infinity, tb: null };
  const pts = track.t.map((t, i) => [t, track.ph[i]]).filter(([t]) => t >= 15 && t <= 25);
  for (let tb = 17; tb <= 23; tb += 0.01) {
    const after = pts.filter(([t]) => t >= tb), flat = after.reduce((s, [, p]) => s + p, 0) / after.length;
    let sse = 0; for (const [t, p] of pts) { const m = t < tb ? flat - WF.DENSITY * WF.RATE * (tb - t) : flat; sse += (p - m) ** 2; }
    if (sse < best.sse) best = { sse, tb };
  }
  check(`the drift stops at ${open.stillAt} s, where the plan says`, Math.abs(best.tb - open.stillAt) < 0.1, `best break point ${best.tb.toFixed(2)} s, from the sound (a ramp at the stated rate, then flat; frames 85 ms, every 50 ms)`);
  // level steadiness: RMS in half-second windows
  const rs = []; for (let a = Math.round(0.5 * SR); a + SR / 2 <= R.y.length; a += SR / 2) rs.push(20 * Math.log10(rmsOf(R.y, a, a + SR / 2)));
  const lo = Math.min(...rs), hi = Math.max(...rs);
  check('the level holds steady while the ripple moves and when it stops', hi - lo < 1.5, `half-second RMS from ${lo.toFixed(2)} to ${hi.toFixed(2)} dBFS, spread ${(hi - lo).toFixed(2)} dB`);
  check('and sits near its stated −20 dBFS before the output gain', Math.abs((lo + hi) / 2 + 20) < 1.5, `middle ${((lo + hi) / 2).toFixed(2)} dBFS`);
  let peak = 0; for (const v of R.y) peak = Math.max(peak, Math.abs(v));
  info('peak sample', `${peak.toFixed(3)} (${(20 * Math.log10(peak)).toFixed(1)} dBFS); the output gain is 0.7 and a compressor follows`);
}
{
  // test trials: the adaptor's drift, then the hidden test drift, measured from the sound
  for (const [adapt, arm, drift] of [[20, 'climb', 0.15], [WF.TOPUP, 'still', -0.05], [WF.TOPUP, 'climb', 0], [WF.TOPUP, 'still', 0.05]]) {
    const p = WF.trial(adapt, arm, drift), r = render(p, SR, p.total), tr = phaseTrack(r.y, SR);
    const vA = slope(tr, 0.5, p.adapt - 0.3) / WF.DENSITY, vT = slope(tr, p.testAt + 0.2, p.total - 0.2) / WF.DENSITY, want = arm === 'climb' ? WF.RATE : 0;
    check(`a trial adapting ${p.adapt} s to the ${arm === 'climb' ? 'climb' : 'still ripple'}, then a hidden drift of ${drift >= 0 ? '+' : ''}${drift}`, Math.abs(vA - want) < 0.012 && Math.abs(vT - drift) < 0.006, `adapting ${vA.toFixed(4)}, testing ${vT.toFixed(4)} oct/s, from the sound`);
  }
}

console.log('\n— the waterfall: the timing —');
{
  check('the opening: 20 s of motion, then 8 s still, inside the kit’s 50 s warning', open.stillAt === 20 && open.total === 28 && open.total < WF.KIT_WARN, `${open.stillAt} + ${open.total - open.stillAt} = ${open.total} s`);
  const rows = []; let ok = true;
  for (const a of [WF.TOPUP, WF.ADAPT.min, WF.ADAPT.def, WF.ADAPT.max, 300]) for (const arm of ['climb', 'still']) for (const d of WF.DRIFTS) {
    const p = WF.trial(a, arm, d);
    const good = Math.abs(p.testAt - (p.adapt + WF.GAP)) < 1e-9 && p.sound[1].to - p.sound[1].from === WF.TEST && p.moves[0].v === (arm === 'climb' ? WF.RATE : 0) && p.moves[1].v === d && p.moves[1].at === p.adapt && p.adapt <= WF.ADAPT.max;
    ok = ok && good; if (arm === 'climb' && d === 0) rows.push(`${a}→${p.adapt} s: test at ${p.testAt.toFixed(1)}, ends ${p.total.toFixed(1)} s`);
  }
  check(`every test trial: adapt (a top-up of ${WF.TOPUP} s, or a first adaptation up to ${WF.ADAPT.max} s), 0.4 s silence, ${WF.TEST} s at its hidden drift`, ok, rows.join(' · '));
  info('a whole test', `two blocks of ${WF.DRIFTS.length * WF.REPS}: at the default first adaptation (${WF.ADAPT.def} s) about ${(2 * (WF.ADAPT.def + 9 * WF.TOPUP + 10 * (WF.GAP + WF.TEST)) / 60).toFixed(1)} min of sound, at the longest about ${(2 * (WF.ADAPT.max + 9 * WF.TOPUP + 10 * (WF.GAP + WF.TEST)) / 60).toFixed(1)} min, plus answering`);
}

console.log('\n— the waterfall: the cartoon and the rule —');
{
  const i = (d) => Math.round(d.testAt / 0.05) + 1;
  const n5 = WF.detectors(5, true), n20 = WF.detectors(20, true), n45 = WF.detectors(45, true), c20 = WF.detectors(20, false);
  const v5 = n5.net[i(n5)], v20 = n20.net[i(n20)], v45 = n45.net[i(n45)], vc = c20.net[i(c20)];
  check('after the climb, the still pattern reads the other way; after the still ripple, it reads still', v20 < -0.01 && Math.abs(vc) < 1e-12, `net ${v20.toFixed(4)} after 20 s of climb, ${vc.toExponential(1)} after 20 s still`);
  check('and the longer the adaptation, the stronger the reading', v5 > v20 && v20 > v45, `${v5.toFixed(4)} at 5 s, ${v20.toFixed(4)} at 20 s, ${v45.toFixed(4)} at 45 s`);
  const n180 = WF.detectors(180, true); info('the cartoon at the page’s few minutes', `net ${n180.net[i(n180)].toFixed(4)} after 180 s`);
  // the no-motion estimate on answer sheets whose answer is known
  const sheet = (fn) => WF.DRIFTS.flatMap((d) => Array.from({ length: WF.REPS }, (_, k) => ({ drift: d, up: fn(d, k) })));
  const allDown = WF.pse(sheet(() => false)), allUp = WF.pse(sheet(() => true)), fair = WF.pse(sheet((d, k) => d > 0 || (d === 0 && k === 0))), moved = WF.pse(sheet((d) => d > 0.1));
  check('the no-motion estimate: all “down” reads +0.20, all “up” −0.20, a fair ear 0, an ear moved up reads up', Math.abs(allDown - 0.2) < 1e-12 && Math.abs(allUp + 0.2) < 1e-12 && Math.abs(fair) < 1e-12 && moved > 0.09, `${allDown.toFixed(3)}, ${allUp.toFixed(3)}, ${fair.toFixed(3)}, ${moved.toFixed(3)} for an ear that hears only +0.15 as up`);
  // its chance figure, by the piece's enumeration and by simulation here
  const exact = WF.shiftChance(WF.SHOWS, 0.5), worst = WF.worstShiftChance(WF.SHOWS), r = WF.rng(99); let hits = 0; const N = 200000;
  for (let t = 0; t < N; t++) { const a = sheet(() => r() < 0.5), b = sheet(() => r() < 0.5); if (WF.pse(a) - WF.pse(b) >= WF.SHOWS - 1e-9) hits++; }
  check(`the rule’s chance: answers that ignore the sound move the point up ${WF.SHOWS} oct/s or more`, Math.abs(exact - hits / N) < 0.004, `enumerated ${(100 * exact).toFixed(2)}%, simulated ${(100 * hits / N).toFixed(2)}% over ${N} pairs of sheets; worst lean q = ${worst.q.toFixed(2)}: ${(100 * worst.p).toFixed(2)}%`);
  info('what no audible-adaptor design rules out', 'a reader who says “down” after the climb because the page said so moves the point by up to 0.20 oct/s; the piece says so before trial one');
}

console.log('\n— the ghost in the gap: the noise —');
for (const sr of [44100, 48000]) {
  const g0 = ZW.gapOf(ZW.GAP0.centre, ZW.GAP0.width);
  const x = ZW.noise(sr, g0), plain = ZW.noise(sr, null), df = sr / x.length;
  const p = powerOf(x); let inMax = 0, near = 0, nn = 0, loE = 0, hiE = Infinity;
  for (let k = 1; k < p.length; k++) { const f = k * df; if (f > g0.lo && f < g0.hi) inMax = Math.max(inMax, p[k]); else if ((f >= g0.lo / Math.cbrt(2) && f <= g0.lo) || (f >= g0.hi && f <= g0.hi * Math.cbrt(2))) { near += p[k]; nn++; } }
  near /= nn;
  for (let k = 1; k < p.length; k++) { const f = k * df; if (p[k] > near * 1e-6) { if (f < g0.centre) loE = f; else if (hiE === Infinity && f > g0.centre) hiE = f; } }
  check(`${sr} Hz: the gap is empty, bin for bin, over the whole loop`, dB(inMax / near) < -120, `loudest bin inside ${dB(inMax / near + 1e-300).toFixed(0)} dB against the bins within a third of an octave outside: the gap's bins are set to zero, and what is left is the rounding of 32-bit samples`);
  check(`${sr} Hz: its edges are where they were asked to be`, Math.abs(loE - g0.lo) <= df && Math.abs(hiE - g0.hi) <= df, `asked ${g0.lo.toFixed(1)}–${g0.hi.toFixed(1)} Hz, last bin below ${loE.toFixed(1)}, first above ${hiE.toFixed(1)} (bins ${df.toFixed(3)} Hz)`);
  check(`${sr} Hz: its width is one octave`, Math.abs(Math.log2(hiE / loE) - 1) < 0.002, `${Math.log2(hiE / loE).toFixed(4)} octave`);
  // every half-overlapping 8192-sample Hann slice of the loop: the loudest bin in the gap's middle (a quarter
  // octave in from each edge, clear of the window's main lobe), against the mean bin within a third of an
  // octave outside it; what is left there is leakage, not sound
  const dfw = sr / 8192, depths = [];
  for (let a = 0; a + 8192 <= x.length; a += 4096) {
    const pw = powerOf(x, a, 8192, true); let mx = 0, nr = 0, ne = 0;
    for (let k = 1; k < pw.length; k++) { const f = k * dfw; if (f > g0.lo * Math.pow(2, 0.25) && f < g0.hi * Math.pow(2, -0.25)) mx = Math.max(mx, pw[k]); else if ((f >= g0.lo / Math.cbrt(2) && f <= g0.lo) || (f >= g0.hi && f <= g0.hi * Math.cbrt(2))) { nr += pw[k]; ne++; } }
    depths.push(dB(mx / (nr / ne)));
  }
  depths.sort((u, v) => u - v);
  check(`${sr} Hz: in every ${(8192 / sr * 1000).toFixed(0)}-ms Hann slice the middle of the gap is deeper than −100 dB`, depths[depths.length - 1] < -100, `${depths.length} slices: ${depths[0].toFixed(1)} to ${depths[depths.length - 1].toFixed(1)} dB, median ${depths[depths.length >> 1].toFixed(1)}`);
  check(`${sr} Hz: notched and plain noise at the same level`, Math.abs(20 * Math.log10(rmsOf(x) / rmsOf(plain))) < 0.01 && Math.abs(20 * Math.log10(rmsOf(x)) + 20) < 0.01, `${(20 * Math.log10(rmsOf(x))).toFixed(3)} and ${(20 * Math.log10(rmsOf(plain))).toFixed(3)} dBFS`);
  // matched RMS means the notched noise's remaining bands sit a little higher; how much
  const pp = powerOf(plain); let a1 = 0, b1 = 0; for (let k = 1; k < p.length; k++) { const f = k * df; if (f > 300 && f < 1000) { a1 += p[k]; b1 += pp[k]; } }
  info(`${sr} Hz: the level match lifts the notched noise's other bands`, `by ${dB(a1 / b1).toFixed(2)} dB (measured 300–1000 Hz), since the same RMS is spread over less of the spectrum`);
  // the seam: the step from the last sample to the first, against every other step
  const steps = []; for (let i = 1; i < x.length; i++) steps.push(Math.abs(x[i] - x[i - 1])); steps.sort((u, v) => u - v);
  const seam = Math.abs(x[0] - x[x.length - 1]), p999 = steps[Math.floor(0.999 * steps.length)];
  check(`${sr} Hz: the loop has no seam`, seam <= p999, `the wrap's step ${seam.toFixed(4)}, the 99.9th percentile of all steps ${p999.toFixed(4)}`);
  // the top: soft, not a cliff (a cliff can leave a Zwicker tone of its own)
  const band = (f0) => { let s = 0, n = 0; for (let k = 1; k < pp.length; k++) { const f = k * df; if (f >= f0 / Math.pow(2, 1 / 24) && f < f0 * Math.pow(2, 1 / 24)) { s += pp[k] * f; n++; } } return s / n; };
  const steps12 = []; for (let f = 8000; f < 15000; f *= Math.pow(2, 1 / 12)) steps12.push(dB(band(f) / band(f * Math.pow(2, 1 / 12))));
  check(`${sr} Hz: the band's top fades over an octave, no cliff`, Math.max(...steps12) < 12 && dB(band(16000 / Math.pow(2, 1 / 12)) / band(4000)) < -15, `steepest fall ${Math.max(...steps12).toFixed(1)} dB per twelfth of an octave between 8 and 16 kHz (per-octave level at 4 kHz vs 15 kHz: ${dB(band(16000 / Math.pow(2, 1 / 12)) / band(4000)).toFixed(1)} dB)`);
  if (sr === 48000) {
    const flat = [160, 400, 1000, 2500, 6000].map((f) => dB(band(f) / band(1000)));
    check('pink: every octave holds the same energy inside the band', flat.every((v) => Math.abs(v) < 0.8), `per-octave level at 160, 400, 1k, 2.5k, 6k Hz against 1 kHz: ${flat.map((v) => v.toFixed(2)).join(', ')} dB`);
  }
}
{
  // the piece's own meter uses ZW.measure: it should agree with this check's measure
  const g = ZW.gapOf(2000, 0.5), x = ZW.noise(48000, g), m = ZW.measure(x, 48000, g);
  check("the piece's meter agrees with this check about a half-octave gap at 2 kHz", m.depthDb < -120 && Math.abs(m.widthOct - 0.5) < 0.003, `the piece reads depth ${m.depthDb.toFixed(0)} dB, edges ${m.loEdge.toFixed(1)}–${m.hiEdge.toFixed(1)} Hz, width ${m.widthOct.toFixed(4)} octave`);
}

console.log('\n— the ghost in the gap: the plans, the hidden gap and the chances —');
{
  check('the opening: 20 s lit, then 8 s dark, inside the kit’s 50 s warning', ZW.OPEN.expose === 20 && ZW.OPEN.silent === 8 && ZW.OPEN.expose + ZW.OPEN.silent < 50, `${ZW.OPEN.expose} + ${ZW.OPEN.silent} s`);
  check('a test trial: 12 s of noise, 6 s of quiet', ZW.TEST.expose === 12 && ZW.TEST.silent === 6, `${ZW.TEST.expose} + ${ZW.TEST.silent} = ${ZW.TEST.expose + ZW.TEST.silent} s`);
  let ok = true; const seen = [];
  for (const c of [1000, 2828.4, 8000]) for (const u of [0, 0.5, 1]) for (const w of [0.25, 2]) {
    const t = ZW.trial('notch', c, w, u), oct = Math.log2(t.gap.centre / c);
    ok = ok && Math.abs(oct) <= ZW.JITTER + 1e-9 && t.gap.centre >= ZW.HIDE.lo - 1e-6 && t.gap.centre <= ZW.HIDE.hi + 1e-6 && t.gap.width <= ZW.TEST_WIDTH; if (w === 2) seen.push(`${c}·u${u}→${t.gap.centre.toFixed(0)}`);
  }
  check(`each gapped trial hides its centre within ${ZW.JITTER} octaves of the reader’s, between ${ZW.HIDE.lo} Hz and ${ZW.HIDE.hi / 1000} kHz, at most ${ZW.TEST_WIDTH} octave wide`, ok && ZW.trial('plain', 2828, 1, 0.3).gap === null, seen.join(' '));
  // the match's chance for readers who ignore the sound, by the piece's formula and by simulation here
  const r = ZW.rng(5), N = 200000, rows = []; let agree = true;
  for (const [c, w] of [[2828.4, 1], [2828.4, 0.25], [1000, 0.5], [7000, 2]]) {
    const m = ZW.matchChance(c, w); let hs = 0, hr = 0;
    for (let t = 0; t < N; t++) { const g = ZW.trial('notch', c, w, r()).gap; if (ZW.inGap(c, g)) hs++; if (ZW.inGap(ZW.MATCH.min * Math.pow(ZW.MATCH.max / ZW.MATCH.min, r()), g)) hr++; }
    agree = agree && Math.abs(m.slider - hs / N) < 0.005 && Math.abs(m.random - hr / N) < 0.005;
    rows.push(`${c} Hz, ${w} oct: slider ${(100 * m.slider).toFixed(1)}% (sim ${(100 * hs / N).toFixed(1)}), random ${(100 * m.random).toFixed(1)}% (sim ${(100 * hr / N).toFixed(1)})`);
  }
  check('the match’s chance the piece prints: a reader matching at their own slider, and one dragging at random', agree, rows.join(' · '));
  const m0 = ZW.matchChance(2828.4, 1);
  info('what a slider-matcher scores at the default gap', `4 of 4 in the gap: ${(100 * ZW.atLeast(4, 4, m0.worst)).toFixed(1)}%; 3 of 3: ${(100 * ZW.atLeast(3, 3, m0.worst)).toFixed(1)}%; the piece calls matches a fingerprint only under 5%`);
  // the tone rule's chance, against brute force over a coin per answer and over every lean
  let worst = 0, at = 0; for (let i = 1; i < 20; i++) { const v = ZW.diffAtLeast(4, i / 20, 2); if (v > worst) { worst = v; at = i / 20; } }
  let hit = 0; for (let m = 0; m < 256; m++) { let A = 0, C = 0; for (let i = 0; i < 4; i++) A += (m >> i) & 1; for (let i = 4; i < 8; i++) C += (m >> i) & 1; if (A - C >= 2) hit++; }
  check('the tone rule’s chance the piece prints: A − C ≥ 2 by answers at random', Math.abs(ZW.diffAtLeast(4, 0.5, 2) - hit / 256) < 1e-12 && Math.abs(worst - ZW.diffAtLeast(4, 0.5, 2)) < 1e-12, `${(100 * hit / 256).toFixed(2)}% (${hit} of 256 sheets), the worst over every lean (at q = ${at})`);
}

console.log('\n— the ghost in the gap: the cartoons —');
for (const [c, w] of [[2828.4, 1], [1000, 0.5], [2828.4, 0.25], [5000, 2]]) {
  const g = ZW.gapOf(c, w), M = ZW.earModel(g), k0 = Math.round(M.expose / M.dt) + 10, fr = M.frames[k0].a;
  let jmax = 0; for (let j = 0; j < fr.length; j++) if (fr[j] > fr[jmax]) jmax = j;
  const fpk = M.f[jmax], inside = fpk >= g.lo * Math.pow(2, -1 / 12) && fpk <= g.hi * Math.pow(2, 1 / 12);
  let outEx = 0, outAt = 0; for (let j = 0; j < fr.length; j++) { const f = M.f[j]; if ((f < g.lo / Math.pow(2, 1 / 6) || f > g.hi * Math.pow(2, 1 / 6)) && fr[j] - M.s > outEx) { outEx = fr[j] - M.s; outAt = f; } }
  const last = M.frames[M.frames.length - 1].a[jmax] - M.s, first = fr[jmax] - M.s;
  check(`ear cartoon, gap ${g.lo.toFixed(0)}–${g.hi.toFixed(0)} Hz: half a second after the noise stops, the ghost peaks inside the gap`, inside && first > 0.02, `peak at ${fpk.toFixed(0)} Hz, ${first.toFixed(3)} above rest`);
  check(`  and fades: 8 s later, under a tenth of that`, last < 0.1 * first, `${last.toFixed(4)} left`);
  info(`  overshoot anywhere outside the gap (a sixth of an octave clear of it)`, outEx > 0.005 ? `${outEx.toFixed(3)} above rest at ${outAt.toFixed(0)} Hz` : 'none above 0.005');
}
{
  const F = ZW.eyeModel().frames, on = F[Math.round(19.9 / 0.05)], off = F[Math.round(20.5 / 0.05)], end = F[F.length - 1];
  check('eye cartoon: on white after red, the red–green signal reads green, and fades', off.rg < -0.05 && Math.abs(end.rg) < Math.abs(off.rg), `L − M = ${off.rg.toFixed(3)} at 20.5 s, ${end.rg.toFixed(3)} at 28 s; L sensitivity ${on.L.toFixed(3)} after 20 s of red`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
