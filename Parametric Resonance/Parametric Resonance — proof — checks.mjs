// title: Parametric Resonance — proof — checks
// born: 2026-11-03
// links: [[Parametric Resonance]] connects-to · proof-of-rich-face
// forward_vector: I re-run, in Node, every number the three rich-face pieces print, on the pieces' own code: I pull
//   the scripts marked id="pr-core", id="pr-proc" and id="pr-swing" out of the HTML, drive the worklet the way the
//   page does, and hold each step's claim against the Floquet multipliers or the plain formula. Run me after any
//   edit to a piece: node "Parametric Resonance/Parametric Resonance — proof — checks.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const piece = (what) => fs.readFileSync(path.join(here, `Parametric Resonance — rich — ${what}.html`), 'utf8');
const script = (html, id) => { const m = html.match(new RegExp(`<script id="${id}"[^>]*>([\\s\\S]*?)</script>`)); if (!m) throw new Error('no script ' + id); return m[1]; };
const H = { thr: piece('the threshold heard'), ph: piece('with the ring, against it'), sw: piece('the pumped swing') };
let fails = 0; const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails++; };
const DB = 20 / Math.LN10, SR = 48000, F0 = 220, W0 = 2 * Math.PI * F0;

console.log('engine');
const core = script(H.thr, 'pr-core'), proc = script(H.thr, 'pr-proc');
ok(core === script(H.ph, 'pr-core') && proc === script(H.ph, 'pr-proc'), 'both audio pieces carry the same oscillator, byte for byte');
for (const [k, h] of Object.entries(H)) ok(!/rich:hush|rich:height/.test(h), `${k}: names no kit message, so the kit keeps hush, height and the time cap`);
const PRes = new Function(core + '; return PRes;')();

/* the worklet, driven the way the page drives it: messages in, a report every 256 samples out */
function worklet() {
  let Proc; const out = [];
  new Function('sampleRate', 'AudioWorkletProcessor', 'registerProcessor', core + '\n' + proc)(SR, class { constructor() { this.port = { postMessage: (m) => out.push(m), onmessage: null }; } }, (_n, c) => { Proc = c; });
  const w = new Proc(), buf = [[new Float32Array(128), new Float32Array(128)]];
  return { send: (d) => w.port.onmessage({ data: d }), run: (s) => { for (let i = 0; i < Math.round((s * SR) / 128); i++) w.process([], buf); }, out, clear: () => { out.length = 0; } };
}
const trace = (w, seq) => w.out.filter((m) => m.seq === seq && m.t !== undefined).map((m) => ({ t: m.t, dB: DB * Math.log(Math.max(m.A, 1e-7)), eps: m.eps, strobe: m.strobe }));
function fit(tr, t0, t1, lo, hi) { let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0; for (const p of tr) if (p.t >= t0 && p.t <= t1 && p.dB > lo && p.dB < hi) { n++; sx += p.t; sy += p.dB; sxx += p.t * p.t; sxy += p.t * p.dB; } return n < 12 ? NaN : (n * sxy - sx * sy) / (n * sxx - sx * sx); }
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.abs(b);
const floq = (eps, zeta, ratio = 2) => { const p = new PRes(SR); p.eps = eps; p.zeta = zeta; p.ratio = ratio; return p.floquet(0); };
const firstAbove = (tr, dB) => { const p = tr.find((q) => q.dB > dB); return p ? p.t : null; };

console.log('the threshold heard');
{ // step 1: one ring fades at zeta w0
  const w = worklet(); w.send({ reset: true, set: { zeta: 0.0015, eps: 0, F: 0, ratio: 2, noise: 2e-6 }, strike: { A: 0.25, phi: 0, seq: 1 } }); w.run(3);
  const m = fit(trace(w, 1), 0.2, 3, -50, -14), pr = -0.0015 * W0 * DB;
  ok(near(m, pr, 0.01), `step 1: one ring fades at ${m.toFixed(2)} dB/s; −ζω₀ says ${pr.toFixed(2)}`);
}
{ // step 2: below threshold, the slow mode fades at the Floquet rate, slower than unpumped
  for (const e of [0.003, 0.0054]) {
    const w = worklet(); w.send({ reset: true, set: { zeta: 0.0015, eps: e, F: 0, ratio: 2, noise: 2e-6 }, strike: { A: 0.25, phi: 0, seq: 1 } }); w.run(5);
    const m = fit(trace(w, 1), 1.5, 5, -50, -14), fl = floq(e, 0.0015).mu * DB, first = W0 * (e / 4 - 0.0015) * DB;
    ok(near(m, fl, 0.03) && m > -0.0015 * W0 * DB, `step 2: ε = ${e}: fades at ${m.toFixed(2)} dB/s; Floquet ${fl.toFixed(2)}, first order ${first.toFixed(2)}, unpumped ${(-0.0015 * W0 * DB).toFixed(2)}`);
  }
}
{ // step 3: the threshold is 4 zeta; a held depth past it grows at the Floquet rate; heavier damping moves it
  for (const z of [0.0015, 0.006]) { let lo = 0, hi = 0.2; for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; floq(mid, z).mu > 0 ? (hi = mid) : (lo = mid); } ok(near(lo, 4 * z, 0.001), `step 3: ζ = ${z}: the multipliers cross 1 at ε = ${lo.toFixed(7)}; 4ζ, the first-order threshold, = ${(4 * z).toFixed(7)} (Mathieu's q = ε/2, so q_c = 2ζ)`); }
  const w = worklet(); w.send({ reset: true, set: { zeta: 0.0015, eps: 0.012, F: 0, ratio: 2, noise: 2e-6 } }); w.send({ clock: true, seq: 1 }); w.run(4);
  const tr = trace(w, 1), m = fit(tr, 0.3, 4, -75, -12), fl = floq(0.012, 0.0015).mu * DB;
  ok(near(m, fl, 0.05), `step 3: held at ε = 0.012 (2 ε_c) it grows from the floor at ${m.toFixed(2)} dB/s; Floquet ${fl.toFixed(2)}; heard at ${firstAbove(tr, -60).toFixed(2)} s`);
  const w2 = worklet(); w2.send({ reset: true, set: { zeta: 0.006, eps: 0.012, F: 0, ratio: 2, noise: 2e-6 } }); w2.send({ clock: true, seq: 1 }); w2.run(4);
  const tr2 = trace(w2, 1); ok(Math.max(...tr2.map((p) => p.dB)) < -60, `step 3: the same ε = 0.012 under heavy damping (ε_c = 0.024) never leaves the floor: loudest ${Math.max(...tr2.map((p) => p.dB)).toFixed(1)} dB`);
}
{ // step 4: driven sweep against pumped sweep, the page's open question as numbers
  const rise = (tr) => { const fin = Math.pow(10, tr[tr.length - 1].dB / 20), a = firstAbove(tr, 20 * Math.log10(0.1 * fin)), b = firstAbove(tr, 20 * Math.log10(0.9 * fin)); return b - a; };
  const wd = worklet(); wd.send({ reset: true, set: { zeta: 0.0015, eps: 0, F: 0.8 * 0.0015, fd: 0.8 * F0, phd: 0, ratio: 2, noise: 2e-6 } }); wd.send({ clock: true, seq: 1, ramp: ['fd', F0, 6] }); wd.run(10);
  const wp = worklet(); wp.send({ reset: true, set: { zeta: 0.0015, eps: 0, F: 0, ratio: 2, noise: 2e-6 } }); wp.send({ clock: true, seq: 1, ramp: ['eps', 16 * 0.0015, 6] }); wp.run(10);
  const d = trace(wd, 1), p = trace(wp, 1), cross = p.find((q) => q.eps >= 0.006).t;
  const dA = firstAbove(d, -60), pA = firstAbove(p, -60);
  ok(dA < 0.5 && pA - cross > 1.5, `step 4: driven audible at ${dA.toFixed(2)} s, 10→90% in ${rise(d).toFixed(2)} s; pumped crosses ε_c at ${cross.toFixed(2)} s, audible at ${pA.toFixed(2)} s, 10→90% in ${rise(p).toFixed(2)} s`);
}

{ // the numbers the noise decides: 24 noise draws of the same sweep, and of the same strike on the fading line
  const heard = [], lag = [];
  for (let k = 1; k <= 24; k++) { const w = worklet(); w.send({ reset: true, set: { zeta: 0.0015, eps: 0, F: 0, ratio: 2, noise: 2e-6, seed: 1000 + 7919 * k } }); w.send({ clock: true, seq: 1, ramp: ['eps', 16 * 0.0015, 6] }); w.run(8);
    const p = trace(w, 1), cross = p.find((q) => q.eps >= 0.006).t, a = firstAbove(p, -60); heard.push(a); lag.push(a - cross); }
  ok(Math.min(...lag) > 1, `step 4, 24 noise draws: the pumped sweep is first heard at ${Math.min(...heard).toFixed(2)}–${Math.max(...heard).toFixed(2)} s (median ${heard.sort((a, b) => a - b)[12].toFixed(2)}); every draw lags the crossing by at least ${Math.min(...lag).toFixed(2)} s`);
}

console.log('with the ring, against it');
const strobeAngles = (tr) => tr.flatMap((m) => { const a = []; if (m.strobe) for (let i = 0; i < m.strobe.length; i += 2) a.push([m.strobe[i], m.strobe[i + 1]]); return a; });
const angDiff = (a, b) => Math.abs(((a - b + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
const lineDiff = (a, b) => Math.min(angDiff(a, b), angDiff(a, b + Math.PI));
{ // step 1: on the pump's clock an unpumped ring's phase stands still, at every phase
  let worst = 0, rates = [];
  for (const deg of [-120, 0, 75]) { const w = worklet(); w.send({ reset: true, set: { zeta: 0.0015, eps: 0, ratio: 2, F: 0, noise: 2e-6 }, strike: { A: 0.25, phi: deg * Math.PI / 180, seq: 1 } }); w.run(2);
    const tr = trace(w, 1), s = strobeAngles(tr); worst = Math.max(worst, angDiff(s[s.length - 1][1], deg * Math.PI / 180)); rates.push(fit(tr, 0.2, 2, -50, -14)); }
  ok(worst < 1 * Math.PI / 180 && Math.max(...rates) - Math.min(...rates) < 0.1, `step 1: struck at −120°, 0°, 75°: phase moved at most ${(worst * 180 / Math.PI).toFixed(2)}°; fades ${rates.map((r) => r.toFixed(2)).join(', ')} dB/s`);
}
const fl2 = floq(0.018, 0.0015);
{ // step 2: two lines; every start off the fading line ends on the growing line; the rates don't care where you start
  ok(fl2.real && fl2.mu > 0, `step 2: ε = 3 ε_c at 2 × 220 Hz: lines at ${(fl2.phiGrow * 180 / Math.PI).toFixed(1)}° (grows ${(fl2.mu * DB).toFixed(1)} dB/s) and ${(fl2.phiDecay * 180 / Math.PI).toFixed(1)}° (fades ${(fl2.muDecay * DB).toFixed(1)} dB/s)`);
  let worst = 0; for (const deg of [-170, -90, 0, 30, 100, 160]) { const w = worklet(); w.send({ reset: true, set: { zeta: 0.0015, eps: 0.018, ratio: 2, F: 0, noise: 2e-6 }, strike: { A: 0.25, phi: deg * Math.PI / 180, seq: 1 } }); w.run(3);
    const s = strobeAngles(trace(w, 1)); worst = Math.max(worst, lineDiff(s[s.length - 1][1], fl2.phiGrow)); }
  ok(worst < 2 * Math.PI / 180, `step 2: six starting phases all end on the growing line, within ${(worst * 180 / Math.PI).toFixed(2)}°`);
}
{ // step 3: at the wrong rate no growing line exists at this depth
  const f1 = floq(0.018, 0.0015, 1), f15 = floq(0.018, 0.0015, 1.5);
  ok(f1.mu < 0 && (!f15.real) && f15.mu < 0, `step 3: at 1 × 220 Hz both multipliers fade (${(f1.mu * DB).toFixed(2)}, ${(f1.muDecay * DB).toFixed(2)} dB/s); at 1.5 × no real lines, fade ${(f15.mu * DB).toFixed(2)} dB/s`);
}
{ // step 4: struck on the fading line it brakes faster than no pump, then noise tips it onto the growing line
  const run = (mode, noise) => { const w = worklet(); w.send({ reset: true, set: { zeta: 0.0015, eps: 0.018, ratio: 2, F: 0, noise } }); w.run(0.3); w.send({ reset: true, set: { zeta: 0.0015, eps: 0.018, ratio: 2, F: 0, noise }, strike: { A: 0.25, mode, seq: 7 } }); w.run(6); return trace(w, 7); };
  const a = run('against', 2e-6), b = run('with', 2e-6), c = run('against', 2e-5);
  const brake = fit(a, 0.03, 0.3, -90, -10), min = a.reduce((m, p) => (p.dB < m.dB ? p : m)), fullA = firstAbove(a, -9), fullB = firstAbove(b, -9), minC = c.reduce((m, p) => (p.dB < m.dB ? p : m)), fullC = firstAbove(c, -9);
  ok(near(brake, fl2.muDecay * DB, 0.05) && brake < -0.0015 * W0 * DB, `step 4: on the fading line it falls at ${brake.toFixed(1)} dB/s (Floquet ${(fl2.muDecay * DB).toFixed(1)}, no pump ${(-0.0015 * W0 * DB).toFixed(1)})`);
  ok(fullA != null && fullB < 0.3 && fullA > 1, `step 4: floor −80 dB: turns at ${min.t.toFixed(2)} s (${min.dB.toFixed(0)} dB), full at ${fullA.toFixed(2)} s; on the growing line, full at ${fullB.toFixed(2)} s`);
  const turn = [], full = [];
  for (let k = 1; k <= 24; k++) { const w = worklet(); const st = { zeta: 0.0015, eps: 0.018, ratio: 2, F: 0, noise: 2e-6, seed: 1000 + 7919 * k }; w.send({ reset: true, set: st }); w.run(0.3); w.send({ reset: true, set: st, strike: { A: 0.25, mode: 'against', seq: 9 } }); w.run(5);
    const tr = trace(w, 9); turn.push(tr.reduce((m, p) => (p.dB < m.dB ? p : m)).t); full.push(firstAbove(tr, -9)); }
  ok(Math.min(...full) > 1, `step 4, 24 noise draws: on the fading line it turns at ${Math.min(...turn).toFixed(2)}–${Math.max(...turn).toFixed(2)} s and is full at ${Math.min(...full).toFixed(2)}–${Math.max(...full).toFixed(2)} s`);
  ok(fullC < fullA, `step 4: floor −60 dB: turns at ${minC.t.toFixed(2)} s (${minC.dB.toFixed(0)} dB), full at ${fullC.toFixed(2)} s, sooner`);
}

console.log('the pumped swing');
{
  const Swing = new Function(script(H.sw, 'pr-swing') + '; return Swing;')();
  const D = 0.06, g = (model, phi, n = 2, d = D) => Swing.gain({ model, n, phi, d }, 12, 4, 1e-4);
  const s = Swing.make(12); while (s.peaks.length < 3) Swing.step(s, 1e-4, { model: 'real', n: 2, phi: 0, d: 0 });
  const T = s.peaks[2].t - s.peaks[1].t, Tf = 2 * Math.PI / Swing.w0();
  ok(near(T, Tf, 0.005), `step 1: one swing every ${T.toFixed(3)} s at 12°; 2π√(L/g) = ${Tf.toFixed(3)} s`);
  const still = g('real', 0, 2, 0), once = g('real', 0, 1), twice = g('real', 0);
  ok(Math.abs(once - still) < 0.002 && twice > 1.2, `step 2: holding still × ${still.toFixed(4)} a swing; once per swing × ${once.toFixed(4)}; twice × ${twice.toFixed(4)}`);
  const toyPage = g('toy', Math.PI), toyRev = g('toy', 0), realPage = g('real', Math.PI), realRev = g('real', 0);
  ok(toyPage > 1 && toyRev < 1, `step 3: in the page's model (θ̈ = −(g/L) sin θ) the page's rule × ${toyPage.toFixed(4)}, the reverse × ${toyRev.toFixed(4)}`);
  ok(realPage < 1 && realRev > 1, `step 4: on a real swing the page's rule × ${realPage.toFixed(4)}, the reverse × ${realRev.toFixed(4)}`);
  const air = Math.log(still), k = (Math.log(realPage) - air) / (Math.log(toyPage) - air);
  ok(Math.abs(k + 3) < 0.1, `step 4: the same rule pumps a real swing ${k.toFixed(2)} × as hard as the page's model does, net of the air (u = Lθ: ε_eff = −3δ)`);
  for (const [name, phi] of [['page', Math.PI], ['reverse', 0]]) {
    const q = Swing.make(12), o = { model: 'real', n: 2, phi, d: D }; while (q.peaks.length < 4) Swing.step(q, 1e-4, o);
    const p = q.peaks, W = p[3].W, dE = p[3].E - p[2].E;
    ok(Math.sign(W) === Math.sign(dE) && Math.abs(W - dE) < Math.abs(W) * 0.1 + 0.5, `step 4: ${name}: the child's work over the third swing ${W.toFixed(2)} J, the swing's energy gained ${dE.toFixed(2)} J (30 kg child)`);
  }
}
console.log(fails ? `\n${fails} check(s) failed` : '\nall checks pass'); process.exit(fails ? 1 : 0);
