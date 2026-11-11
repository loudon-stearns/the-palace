// Renders the engine of the rich-face piece "Inharmonic Wavetable Synthesis — rich — each partial is a loop" offline,
// FFTs it, and prints where the partials landed against where the picture puts the loops.
// The piece's own code does everything here: the body, the grip, the pull, the putty and the voice bank are all taken
// from between ENGINE-START and ENGINE-END. The picture draws loop n at place(S, n); the bank is sent bodyCents(S).
//   node "Projects/Inharmonic Wavetable Synthesis/workshop/rich-checks/check-loops.mjs"   (from the palace root; or pass the piece's path)
// Failure would be: any partial more than 1 cent from where its loop is drawn, a missing or extra peak, or a body that
// does not come home. The old fault (a picture that keeps a moved partial on its harmonic slot) is printed beside the
// nudged case, so the size of a failure is on the page.
import fs from 'fs';
import { fileURLToPath } from 'url';
const f = process.argv[2] || fileURLToPath(new URL('../../Inharmonic Wavetable Synthesis — rich — each partial is a loop.html', import.meta.url));
const html = fs.readFileSync(f, 'utf8');
const eng = html.split('/*ENGINE-START*/')[1].split('/*ENGINE-END*/')[0];
const E = new Function(eng + '; return { NP, AXIS, BASE_NOTE, HOMES, makeBody, setHome, place, level, bodyCents, bodyAmps, makeGrip, pull, relax, makeBank, centsOf, closed, missOf, PUTTY, PRESETS, puttyFromPad, padFromPutty, tauOf, stepOsc, throwBody, G_MAX, R_MIN, R_MAX };')();

const SR = 48000, N = 1 << 18, TWO_PI = 2 * Math.PI;
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -TWO_PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) { const a = i + k, b = a + len / 2, xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
}
// every peak within 66 dB of the loudest, found with no knowledge of where the partials should be
function peaks(y) {
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let t = 0; t < N; t++) { const x = TWO_PI * t / (N - 1);     // 4-term Blackman-Harris: side lobes 92 dB down
    re[t] = y[t] * (0.35875 - 0.48829 * Math.cos(x) + 0.14128 * Math.cos(2 * x) - 0.01168 * Math.cos(3 * x)); }
  fft(re, im);
  const db = new Float64Array(N / 2); let mx = -1e9;
  for (let i = 0; i < N / 2; i++) { db[i] = 10 * Math.log10(re[i] * re[i] + im[i] * im[i] + 1e-300); if (db[i] > mx) mx = db[i]; }
  const out = [];
  for (let i = 8; i < N / 2 - 8; i++) {
    if (db[i] < mx - 66) continue;
    let top = true; for (let k = -6; k <= 6; k++) if (k && db[i + k] > db[i]) { top = false; break; }
    if (!top) continue;
    const a = db[i - 1], b = db[i], c = db[i + 1], d = 0.5 * (a - c) / (a - 2 * b + c);
    out.push({ hz: (i + d) * SR / N, db: b - mx });
  }
  return out;
}
function render(bank, seconds, each) {       // each(t) is called 60 times a second, as the page's clock would
  const n = Math.round(seconds * SR), y = new Float64Array(n), hop = SR / 60;
  for (let t = 0; t < n; t++) { if (each && t % hop === 0) each(t / SR); y[t] = bank.step(); }
  return y;
}
function sound(S, bank) { bank.set(E.bodyCents(S), E.bodyAmps(S)); }
const F0 = 440 * Math.pow(2, (E.BASE_NOTE - 69) / 12);
const lines = []; let allPass = true;
function compare(name, S, bank, note) {
  render(bank, 0.5);                                       // let the 20 ms smoothing and the 4 ms attack finish
  const found = peaks(render(bank, N / SR));
  const pic = []; for (let i = 0; i < E.NP; i++) pic.push({ n: i + 1, r: E.place(S, i), hz: E.place(S, i) * F0 });
  let worst = 0, worstN = 0; const used = new Set(); const rows = [];
  for (const p of pic) {
    let best = null; for (const q of found) if (!best || Math.abs(q.hz - p.hz) < Math.abs(best.hz - p.hz)) best = q;
    const err = best ? 1200 * Math.log2(best.hz / p.hz) : NaN; if (best) used.add(best);
    if (!(Math.abs(err) <= Math.abs(worst))) { worst = err; worstN = p.n; }
    rows.push({ ...p, got: best ? best.hz : NaN, err });
  }
  const extra = found.length - used.size, pass = Math.abs(worst) < 1 && extra === 0 && used.size === E.NP;
  if (!pass) allPass = false;
  lines.push(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  lines.push(`      ${found.length} peaks found for ${E.NP} loops drawn · worst miss ${worst.toFixed(3)} cents (loop ${worstN}) · peaks with no loop: ${extra}${note ? ' · ' + note : ''}`);
  return rows;
}
const show = (rows, which) => which.map((n) => { const r = rows[n - 1]; return `      loop ${String(n).padStart(2)}: drawn at ${r.r.toFixed(4)} × f0 = ${r.hz.toFixed(2)} Hz · heard at ${r.got.toFixed(2)} Hz · ${r.err >= 0 ? '+' : ''}${r.err.toFixed(3)} c`; });
const fresh = (home) => { const S = E.makeBody(home), bank = E.makeBank(SR, E.NP); sound(S, bank); bank.noteOn(E.BASE_NOTE, 1); return { S, bank }; };

// 1 · untouched: the harmonic series
{ const { S, bank } = fresh('flat');
  const rows = compare('untouched · every loop on its harmonic', S, bank);
  lines.push(...show(rows, [1, 7, 24])); }

// 2 · one loop nudged: fingertip on loop 7, pushed 0.31 of a harmonic sharp
{ const { S, bank } = fresh('flat');
  const grip = E.makeGrip(S, 'one', 6); E.pull(S, grip, 0.31, 0); sound(S, bank);
  const rows = compare('one loop nudged · loop 7 pushed +0.31 harmonics, the rest left alone', S, bank);
  lines.push(...show(rows, [6, 7, 8]));
  const r7 = rows[6], old = 1200 * Math.log2(r7.got / (7 * F0));
  lines.push(`      loop 7 is ${E.centsOf(7, r7.r).toFixed(1)} c off its slot. A picture that left it on slot 7 (770.00 Hz) would be ${old.toFixed(1)} c from the sound: that is the size of the old fault.`);
  let moved = 0; for (let i = 0; i < E.NP; i++) if (i !== 6 && Math.abs(rows[i].r - (i + 1)) > 1e-9) moved++;
  lines.push(`      other loops moved: ${moved}`); if (moved) allPass = false; }

// 3 · the whole body pulled: a hand on loop 16, pulled 3 harmonics sharp
let pulledPlaces = null;
{ const { S, bank } = fresh('flat');
  const grip = E.makeGrip(S, 'body', 15); E.pull(S, grip, 3, 0); sound(S, bank);
  const rows = compare('whole body pulled · hand on loop 16, pulled +3 harmonics', S, bank);
  lines.push(...show(rows, [1, 2, 8, 16, 24]));
  pulledPlaces = rows.map((r) => r.r);
  let shut = 0; for (let i = 0; i < E.NP; i++) if (E.closed(E.place(S, i))) shut++;
  lines.push(`      loops still closing: ${shut} of ${E.NP} · the fundamental moved ${E.centsOf(1, rows[0].r).toFixed(2)} c`); }

// 4 · let go: the putty comes home. Run the page's own clock (60 frames a second, two steps a frame) through the bank and time it.
const P = (name, tilt = 0) => ({ tau: E.PRESETS[name].tau, hz: E.PRESETS[name].hz, tilt });
for (const [mode, limit] of [['ooze', 40], ['spring', 12]]) {
  const { S, bank } = fresh('flat');
  const grip = E.makeGrip(S, 'body', 15); E.pull(S, grip, 3, 0); sound(S, bank);
  render(bank, 0.5);
  let homeAt = null, crossings = 0, lastSign = 1;
  render(bank, limit, (t) => {
    for (let k = 0; k < 2; k++) E.relax(S, 1 / 120, P(mode), null);
    sound(S, bank);
    const u = S.u[15]; if (Math.sign(u) && Math.sign(u) !== lastSign) { crossings++; lastSign = Math.sign(u); }
    let home = true; for (let i = 0; i < E.NP; i++) if (S.u[i] !== 0) home = false;
    if (home && homeAt === null) homeAt = t;
  });
  const rows = compare(`let go · the "${mode}" preset (τ ${E.PRESETS[mode].tau} s, ${E.PRESETS[mode].hz} Hz)`, S, bank, homeAt === null ? `NOT home after ${limit} s` : `home, exactly, ${homeAt.toFixed(1)} s after letting go${mode === 'spring' ? ` · swung through home ${crossings} times on the way` : ''}`);
  if (homeAt === null) { allPass = false; lines[lines.length - 2] = lines[lines.length - 2].replace('PASS', 'FAIL'); }
  lines.push(...show(rows, [16, 24])); }

// 5 · "stays" keeps the shape, thrown or not
{ const { S, bank } = fresh('flat');
  const grip = E.makeGrip(S, 'body', 15); E.pull(S, grip, 3, 0);
  for (let k = 0; k < 600; k++) E.relax(S, 1 / 60, P('stay'), null);
  sound(S, bank);
  const rows = compare('let go · stays (10 s later)', S, bank);
  const same = rows.every((r, i) => r.r === pulledPlaces[i]); lines.push(`      shape unchanged after 10 s: ${same}`); if (!same) allPass = false; }

// 5b · the new controls at their extremes: nothing blows up, nothing sticks, everything comes home when the numbers say.
// Each case: the whole body pulled +3 harmonics and 12 dB down at loop 16, let go (some thrown at the fastest speed the hand is
// allowed, either way), then the page's clock run at 120 steps a second and again at 20 (a badly dropped frame rate).
// Failure would be: a value that is not a number; a loop further from home than the spring's own envelope allows
// (u0 and the throw set it: e^(−t/τ) · √(u0² + ((v0 + u0/τ)/w)²), or (|u0| + |v0 + u0/τ| t) e^(−t/τ) with no wobble);
// a loop carried more than 3 + 6 harmonics from home by a throw (the pull plus the throw's reach);
// a drawn place outside the object; a level above the +12 dB the hand is allowed; or a loop not exactly home by
// 1.2 · τ · (ln(first swing in cents / 0.25) + 3) + 0.5 s, its own loop's τ after tilt.
{ const X = E.PUTTY; let cases = 0, bad = 0, worstRatio = 0, worstLate = -1e9, worstWhat = '', longest = 0, longestWhat = '', topLevel = -1e9, farthest = 0;
  let stepErr = 0;
  for (const tau of [X.T_MIN, 0.8, 2.5, X.T_MAX]) for (const hz of [0, X.F_MIN, 2.2, X.F_MAX]) for (const tilt of [-1, 0, 1]) for (const thr of [0, X.THROW_MAX * 4, -X.THROW_MAX * 4]) for (const dt of [1 / 120, 1 / 20]) {
    cases++;
    const S = E.makeBody('flat'), Pp = { tau, hz, tilt };
    const grip = E.makeGrip(S, 'body', 15); E.pull(S, grip, 3, -12); E.throwBody(S, grip, thr, Pp);
    const u0 = Float64Array.from(S.u), v0 = Float64Array.from(S.v);
    const due = [], env = [];
    for (let m = 0; m < E.NP; m++) { const tm = E.tauOf(Pp, m), a = 1 / tm, wd = 2 * Math.PI * hz, k = v0[m] + a * u0[m];
      env.push(wd > 0 ? (t) => Math.exp(-a * t) * Math.hypot(u0[m], k / wd) : (t) => Math.exp(-a * t) * (Math.abs(u0[m]) + Math.abs(k) * t));
      const first = Math.max(Math.abs(u0[m]), Math.abs(k) / Math.hypot(a, wd), Math.abs(v0[m]) * tm), c0 = 1200 * Math.log2((S.R0[m] + first) / S.R0[m]);
      const g0 = 12 * grip.w[m];
      due.push(1.2 * tm * (Math.log(Math.max(1, c0 / 0.25, g0 / 0.05)) + 3) + 0.5); }
    const end = Math.max(...due) + 1; let t = 0, ok = true; const homeAt = new Array(E.NP).fill(null);
    for (let m = 0; m < E.NP; m++) if (S.u[m] === 0 && S.g[m] === 0) homeAt[m] = 0;
    while (t < end) {
      E.relax(S, dt, Pp, null); t += dt;
      for (let m = 0; m < E.NP; m++) {
        const u = S.u[m];
        if (!Number.isFinite(u) || !Number.isFinite(S.v[m]) || !Number.isFinite(S.g[m]) || !Number.isFinite(S.gv[m])) ok = false;
        const lim = env[m](t); if (Math.abs(u) > lim * (1 + 1e-9) + 1e-12) { ok = false; }
        if (lim > 1e-9) worstRatio = Math.max(worstRatio, Math.abs(u) / lim);
        const r = E.place(S, m); if (!(r >= E.R_MIN && r <= E.R_MAX)) ok = false; farthest = Math.max(farthest, Math.abs(u));
        topLevel = Math.max(topLevel, 20 * Math.log10(E.level(S, m) / S.A0[m]));
        if (homeAt[m] === null && S.u[m] === 0 && S.g[m] === 0) homeAt[m] = t;
      }
    }
    for (let m = 0; m < E.NP; m++) {
      if (homeAt[m] === null) { ok = false; worstLate = Infinity; worstWhat = `τ ${tau} hz ${hz} tilt ${tilt} throw ${thr} dt ${dt.toFixed(4)} loop ${m + 1} never home`; continue; }
      const late = homeAt[m] - due[m]; if (late > worstLate) { worstLate = late; worstWhat = `τ ${tau} s, ${hz} Hz, tilt ${tilt}, throw ${thr}, loop ${m + 1}: home at ${homeAt[m].toFixed(2)} s, due by ${due[m].toFixed(2)} s`; }
      if (late > 0) ok = false;
      if (homeAt[m] > longest) { longest = homeAt[m]; longestWhat = `τ ${tau} s, ${hz} Hz, tilt ${tilt}, throw ${thr}, loop ${m + 1}`; }
    }
    if (topLevel > E.G_MAX + 1e-9 || farthest > 9.001) ok = false;
    if (!ok) bad++;
  }
  // the step is the exact solution: 600 small steps must land where one big step does
  for (const [a, wd] of [[20, 0], [20, 75.4], [0.05, 0], [0.05, 75.4], [1.25, 13.8]]) { let u = 3, v = -40; for (let k = 0; k < 600; k++) [u, v] = E.stepOsc(u, v, a, wd, 1 / 120); const one = E.stepOsc(3, -40, a, wd, 5); stepErr = Math.max(stepErr, Math.abs(u - one[0]), Math.abs(v - one[1])); }
  const pass = bad === 0 && stepErr < 1e-9; if (!pass) allPass = false;
  lines.push(`${pass ? 'PASS' : 'FAIL'}  the pad, the tilt and the throw at their extremes · ${cases} cases (τ ${X.T_MIN}–${X.T_MAX} s × wobble 0–${X.F_MAX} Hz × tilt −1, 0, +1 × thrown or not × 120 and 20 steps a second), ${bad} failed`);
  lines.push(`      furthest any loop got from home: ${farthest.toFixed(2)} harmonics (drawn and played clamped to ${E.R_MIN}–${E.R_MAX}) · most of its allowed envelope any loop used: ${(worstRatio * 100).toFixed(4)} %`);
  lines.push(`      highest level on the way: ${topLevel >= 0 ? '+' : ''}${topLevel.toFixed(2)} dB (the hand's ceiling is +${E.G_MAX})`);
  lines.push(`      nearest to late: ${worstWhat} (${worstLate.toFixed(2)} s)`);
  lines.push(`      slowest home: ${longest.toFixed(1)} s · ${longestWhat}`);
  lines.push(`      600 small steps against one 5 s step: differ by ${stepErr.toExponential(1)}`);
  // pad round trip and its corners
  const corners = [[0, 0], [1, 1], [0.94 - 1e-9, 1], [0.5, 0.5]].map(([x, y]) => { const p = E.puttyFromPad(x, y), b = E.padFromPutty(p), q = E.puttyFromPad(b.x, b.y); return `(${x.toFixed(2)}, ${y.toFixed(2)}) → τ ${p.tau === Infinity ? 'stays' : p.tau.toFixed(3) + ' s'}, ${p.hz.toFixed(2)} Hz${(q.tau === p.tau || Math.abs(q.tau - p.tau) < 1e-9 * p.tau) && Math.abs(q.hz - p.hz) < 1e-9 ? '' : ' ROUND TRIP FAILS'}`; });
  lines.push('      pad corners: ' + corners.join(' · ')); if (corners.join('').includes('FAILS')) allPass = false; }

// 5c · the fastest, wildest return, heard: τ 20 s with a 12 Hz wobble, top 4× later, thrown as hard as the hand can; then quick home.
{ const { S, bank } = fresh('flat');
  const Pp = { tau: E.PUTTY.T_MAX, hz: E.PUTTY.F_MAX, tilt: -1 };
  const grip = E.makeGrip(S, 'body', 15); E.pull(S, grip, 3, 12); E.throwBody(S, grip, E.PUTTY.THROW_MAX, Pp); sound(S, bank);
  let peak = 0, finite = true;
  const y1 = render(bank, 8, () => { for (let k = 0; k < 2; k++) E.relax(S, 1 / 120, Pp, null); sound(S, bank); });
  for (const v of y1) { if (!Number.isFinite(v)) finite = false; peak = Math.max(peak, Math.abs(v)); }
  S.homing = 1;
  render(bank, 4, () => { for (let k = 0; k < 2; k++) E.relax(S, 1 / 120, Pp, null); sound(S, bank); });
  const rows = compare('wildest setting, thrown, 8 s of it rendered, then sent home', S, bank, `output finite: ${finite} · peak ${peak.toFixed(3)} of full scale before the compressor`);
  if (!finite || peak > 1) { allPass = false; lines[lines.length - 2] = lines[lines.length - 2].replace('PASS', 'FAIL'); }
  lines.push('      failure would have been a sample that is not a number, a peak over 1.0, or any loop not back on its harmonic'); }

// 6 · the other two homes, untouched, and the bell with a hand on it
{ const { S, bank } = fresh('string');
  const rows = compare('home is a stiff string · untouched', S, bank); lines.push(...show(rows, [1, 12, 24])); }
{ const { S, bank } = fresh('bell');
  const rows = compare('home is the measured bell · untouched', S, bank); lines.push(...show(rows, [1, 2, 3, 24])); }
{ const { S, bank } = fresh('bell');
  const grip = E.makeGrip(S, 'body', 7); E.pull(S, grip, 1.5, 6); sound(S, bank);
  const rows = compare('the bell · hand on loop 8, pulled +1.5 harmonics and 6 dB up', S, bank); lines.push(...show(rows, [3, 8, 18])); }

// 7 · a second note: the loops are drawn in harmonics of the fundamental, so they must hold at another pitch
{ const S = E.makeBody('flat'), bank = E.makeBank(SR, E.NP);
  const grip = E.makeGrip(S, 'one', 2); E.pull(S, grip, -0.4, 0); sound(S, bank); bank.noteOn(E.BASE_NOTE + 7, 1);
  render(bank, 0.5); const found = peaks(render(bank, N / SR)); const f0 = 440 * Math.pow(2, (E.BASE_NOTE + 7 - 69) / 12);
  let worst = 0; for (let i = 0; i < E.NP; i++) { const hz = E.place(S, i) * f0; let best = found[0]; for (const q of found) if (Math.abs(q.hz - hz) < Math.abs(best.hz - hz)) best = q; const e = 1200 * Math.log2(best.hz / hz); if (Math.abs(e) > Math.abs(worst)) worst = e; }
  const pass = Math.abs(worst) < 1 && found.length === E.NP; if (!pass) allPass = false;
  lines.push(`${pass ? 'PASS' : 'FAIL'}  a fifth up (E3, ${f0.toFixed(2)} Hz), loop 3 pulled 0.4 flat`, `      ${found.length} peaks · worst miss ${worst.toFixed(3)} cents`); }

lines.push('', allPass ? 'ALL PASS · failure would have been any miss over 1 cent, a peak with no loop, a loop with no peak, or a body not home' : 'SOMETHING FAILED');
console.log(lines.join('\n'));
process.exit(allPass ? 0 : 1);
