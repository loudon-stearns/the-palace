// check-rich-pieces.mjs — re-checks, headless, every number the Crystal Sonification Reference's four made
// rich-face pieces print, on the pieces' own code (the blocks between their CHECK markers), and the gathered
// strikes against the page's tables, through the sound files themselves.
//
//   node "Projects/Crystal Synthesizer/Crystal Sonification Reference/rich-checks/check-rich-pieces.mjs"
//
// Writes findings.json beside itself and exits 1 if any check fails.
// Born 2026-11-03, Enrichment's proposal round. Part of [[Crystal Sonification Reference]]'s rich face.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(HERE, '..');
const PROJECT = join(BUNDLE, '..');
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail}`); };
const piece = (what) => {
  const src = readFileSync(join(BUNDLE, `Crystal Sonification Reference — rich — ${what}.html`), 'utf8');
  const a = src.indexOf('/*CHECK-START*/'), b = src.indexOf('/*CHECK-END*/');
  if (a < 0 || b < 0) throw new Error(`no CHECK block in ${what}`);
  return new Function(src.slice(a + 15, b) + '; return ENG;')();
};
const near = (x, y, tol) => Math.abs(x - y) <= tol;

// ── Only ratios ─────────────────────────────────────────────────────────────
{
  const E = piece('only ratios');
  check('R1 ω/ω₁ against the printed r_n', near(E.roundGap, 0.0048, 1e-4), `largest gap ${E.roundGap.toFixed(4)} (mode 4)`);
  let worstAB = 0, bestBC = Infinity;
  for (let m = 33; m <= 96; m++) { const T = E.nullTest(m); worstAB = Math.max(worstAB, T.devAB); bestBC = Math.min(bestBC, T.devBC); }
  check('R2 the null: two scalings agree, every note 33–96', worstAB < E.RULE, `worst ${worstAB.toExponential(1)} against the rule ${E.RULE}`);
  check('R3 the control fails, every note 33–96', bestBC > 1e-3, `smallest control deviation ${bestBC.toFixed(4)}`);
  const T = E.nullTest(57);
  check('R4 A3 puts mode 1 on 220 Hz', near(T.b[0], 220, 1e-9), `${T.b[0]}`);
  check('R5 the section’s 10⁻⁹ puts the root at 11.3 kHz', near(T.a[0], 11332.15, 0.05) && near(T.a[6], 22424.48, 0.05), `${T.a[0].toFixed(2)} · top ${T.a[6].toFixed(2)} Hz`);
  const C = 29.9792458e9, mh = (m) => 440 * 2 ** ((m - 69) / 12);
  const fac = { 'ruby A3': mh(57) / (378 * C), 'diamond G3': mh(55) / (805 * C), 'labradorite A2': mh(45) / (60 * C) };
  check('R6 the prompts’ factors', near(fac['ruby A3'], 1.94e-11, 0.01e-11) && near(fac['diamond G3'], 8.1e-12, 0.05e-12) && near(fac['labradorite A2'], 6.1e-11, 0.05e-11), Object.entries(fac).map(([k, v]) => `${k} ${v.toExponential(2)}`).join(' · '));
  const M = E.throughSound(57);
  check('R7 through the sound: peaks within the page’s 0.5 Hz', M.errHz < 0.5, `largest ${M.errHz.toFixed(4)} Hz`);
  check('R8 through the sound: measured ratios agree', M.dev < 1e-4, `${M.dev.toExponential(1)}`);
}

// ── Where is the physics ────────────────────────────────────────────────────
{
  const E = piece('where is the physics');
  // The page's formula, written again here, not taken from the piece.
  const pageMap = (rs, a, span) => { const m = Math.max(...rs); return rs.map((r) => 1 + ((r - 1) / (m - 1)) ** a * (2 ** span - 1)); };
  let fd = 0; for (const a of [0.3, 0.4, 1, 2.5, 3]) for (const s of [0.5, 1, 2, 4]) { const p = E.map(a, s), q = pageMap(E.R, a, s); fd = Math.max(fd, ...p.map((x, i) => Math.abs(x - q[i]))); }
  check('P1 the piece’s map is the page’s formula', fd < 1e-12, `largest difference ${fd.toExponential(1)}`);
  const M = E.asMeasured();
  check('P2 table against chart', M.chartGap <= 0.0011, `${M.chartGap.toFixed(4)}`);
  check('P3 table against the synthesized sound', M.synGap < 1e-4, `${M.synGap.toExponential(1)}`);
  const nat = E.map(1, E.NAT);
  check('P4 α 1 at ruby’s own span is the physics', E.holds(nat) && E.devHz(nat) < 1e-9, `${E.devHz(nat).toExponential(1)} Hz · span ${E.NAT.toFixed(4)} oct`);
  const two = E.map(1, 2);
  check('P5 α 1 at two octaves is not', !E.holds(two) && near(E.devHz(two), 444.4, 0.05) && near(E.devCents(two), 1217.4, 0.1), `${E.devHz(two).toFixed(2)} Hz · ${E.devCents(two).toFixed(1)} cents`);
  let best = Infinity; for (let a = 0.3; a <= 3.0001; a *= 1.001) best = Math.min(best, E.devHz(E.map(a, 2)));
  check('P6 no α at two octaves is the physics', best > E.TOL_HZ, `closest ${best.toFixed(2)} Hz`);
  let sp = 0; for (const s of [E.NAT, 1, 2, 3, 4]) sp = Math.max(sp, E.devSpacing(E.map(1, s)));
  check('P7 α 1 keeps the spacing at every span', sp < 1e-12, `${sp.toExponential(1)}`);
  const d0 = E.doublet(E.R), d2 = E.doublet(two), d4 = E.doublet(E.map(1, 4)), d1 = E.doublet(E.map(1, 1));
  check('P8 the doublet', near(d0.hz, 8.8, 1e-9) && near(d2.hz, 26.94, 0.01) && near(d0.cents, 61.8, 0.1) && near(d2.cents, 155.1, 0.1) && near(d4.cents, 375.1, 0.1) && near(d1.hz, 8.98, 0.01),
    `physics ${d0.hz.toFixed(2)} Hz ${d0.cents.toFixed(1)} c · span 1 ${d1.hz.toFixed(2)} Hz · span 2 ${d2.hz.toFixed(2)} Hz ${d2.cents.toFixed(1)} c · span 4 ${d4.hz.toFixed(2)} Hz ${d4.cents.toFixed(1)} c`);
  check('P9 the sweep passes α 1 at 4.18 s', near(E.alphaAt(4.18), 1, 0.002) && near(E.alphaAt(0), 0.3, 1e-12) && near(E.alphaAt(8), 3, 1e-12), `α(4.18) ${E.alphaAt(4.18).toFixed(4)}`);
  const nats = Object.fromEntries(Object.entries(E.NATURAL).map(([k, v]) => [k, Math.log2(v).toFixed(2)]));
  check('P10 each crystal’s own span', nats.Diamond === '0.72' && nats.Fluorite === '1.31' && nats.Emerald === '1.74' && nats.Topaz === '2.60' && nats.Amethyst === '3.06' && nats.Labradorite === '4.13', JSON.stringify(nats));
}

// ── The intervals named ─────────────────────────────────────────────────────
{
  const E = piece('the intervals named');
  const J = Object.fromEntries(E.CLAIMS.map((c) => [c.id, E.judge(c)]));
  check('I1 the soft mode is near a minor sixth', J.soft.holds && near(J.soft.ct, 835.2, 0.1), `${J.soft.ct.toFixed(1)} c, ${J.soft.off.toFixed(1)} off`);
  check('I2 ruby 1.10 is nearer a major second', !J.ruby.holds && J.ruby.nearest.name === 'a major second' && near(J.ruby.ct, 165.0, 0.1), `${J.ruby.ct.toFixed(1)} c`);
  check('I3 emerald 1.68 is a major sixth', !J.emerald.holds && J.emerald.nearest.name === 'a major sixth' && near(J.emerald.ct, 898.2, 0.1), `${J.emerald.ct.toFixed(1)} c, ${J.emerald.nearest.off.toFixed(1)} from a major sixth`);
  check('I4 amethyst 8.32 is just over three octaves', !J.span.holds && near(J.span.ct, 3667.9, 0.1), `${J.span.ct.toFixed(1)} c = 3 octaves + ${(J.span.ct - 3600).toFixed(1)} c`);
  // The dyads, measured.
  const sp = (x) => { const N = 1 << 18, re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < x.length && i < N; i++) re[i] = x[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (x.length - 1))); fftIn(re, im); return { re, im, N }; };
  let worst = 0; for (const c of E.CLAIMS) { const x = E.dyad(c.r), s = sp(x); for (const f of [220, 220 * c.r]) worst = Math.max(worst, Math.abs(peak(s, f, 44100) - f)); }
  check('I5 each dyad sounds at its two frequencies', worst < 0.5, `largest ${worst.toFixed(4)} Hz`);
}

// ── Crystal to glass ────────────────────────────────────────────────────────
{
  const E = piece('crystal to glass');
  const a = E.test('page'), b = E.test('quartz');
  check('G1 the prompt’s bands at A3', a.lo === 200 && a.hi === 500, `${a.lo} · ${a.hi} Hz`);
  check('G2 the prompt’s glass misses quartz’s families', !a.holds && near(a.offRing, 1.796, 0.002) && near(a.offStretch, 1.528, 0.002), `${a.offRing.toFixed(3)} · ${a.offStretch.toFixed(3)} octaves`);
  check('G3 quartz’s own frame lands inside them', b.holds && near(b.lo, 687.5, 1e-9) && near(b.hi, 1718.75, 1e-9), `${b.lo} · ${b.hi} Hz in ${b.ring.map((f) => f.toFixed(0)).join('–')} and ${b.st.map((f) => f.toFixed(0)).join('–')}`);
  check('G4 the frames differ by 440/128 at every note', near(E.centres('quartz', 110)[0] / E.centres('page', 110)[0], 440 / 128, 1e-12) && near(E.centres('quartz', 880)[1] / E.centres('page', 880)[1], 440 / 128, 1e-12), `${(440 / 128).toFixed(4)}`);
  for (const f of ['page', 'quartz']) { const m = E.measuredPeaks(f), c = E.centres(f);
    check(`G5 the rendered glass peaks where it says (${f})`, m.every((x, i) => Math.abs(Math.log2(x / c[i])) < 1 / 6), `measured ${m.map((x) => x.toFixed(0)).join(' · ')} against ${c.map((x) => x.toFixed(0)).join(' · ')} Hz`); }
  const q = E.quartz(1.5), g = E.glass(1.5, 'page'), qr = E.rms(q, 8820, 57330), gr = E.rms(g, 8820, 57330);
  check('G6 the glass at the quartz’s level', Math.abs(20 * Math.log10(gr / qr)) < 0.3, `${(20 * Math.log10(gr / qr)).toFixed(2)} dB`);
  const x = E.crossfade('quartz'), segs = [[1, 5], [5.5, 6.5], [6.5, 7.5], [8.2, 9.7]].map(([s, e]) => E.rms(x, Math.round(s * 44100), Math.round(e * 44100)));
  const spread = 20 * Math.log10(Math.max(...segs) / Math.min(...segs));
  check('G7 the crossfade holds level', spread < 1, `segments within ${spread.toFixed(2)} dB`);
}

// ── The gathered strikes, through their own files ───────────────────────────
{
  const TABLE = {
    diamond: ['../triclinic-proof/diamond_strike.wav', [1.00, 1.32, 1.48, 1.57, 1.65]],
    ruby: ['../palette-strikes/ruby_strike.wav', [1.00, 1.10, 1.14, 1.19, 1.52, 1.70, 1.98]],
    amethyst: ['../palette-strikes/amethyst_strike.wav', [1.00, 1.62, 2.07, 2.77, 3.13, 3.63, 5.45, 6.21, 8.32]],
    fluorite: ['../palette-strikes/fluorite_strike.wav', [1.00, 1.35, 1.47, 1.69, 2.48]],
    emerald: ['../palette-strikes/emerald_strike.wav', [1.00, 1.23, 1.47, 1.68, 2.13, 2.30, 3.33]],
    topaz: ['../palette-strikes/topaz_strike.wav', [1.00, 1.45, 1.91, 2.37, 2.96, 3.68, 4.80, 6.05]],
    labradorite: ['../triclinic-proof/labradorite_strike.wav', [1.00, 1.83, 3.17, 4.67, 7.00, 9.50, 13.3, 17.5]],
  };
  for (const [name, [rel, rs]] of Object.entries(TABLE)) {
    const { sr, x } = readWav(join(BUNDLE, rel));
    const N = 1 << 19, re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < x.length; i++) re[i] = x[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (x.length - 1)));
    fftIn(re, im); const s = { re, im, N };
    const errs = rs.map((r) => Math.abs(peak(s, 110 * r, sr) - 110 * r));
    // A control: the middle of the widest gap between modes must hold no peak.
    const srt = [...new Set(rs)].sort((p, q) => p - q); let g = 1; for (let i = 1; i < srt.length; i++) if (srt[i] / srt[i - 1] > srt[g] / srt[g - 1]) g = i;
    const fc = 110 * Math.sqrt(srt[g] * srt[g - 1]);
    const at = (f) => { const k = Math.round(f * N / sr); return Math.hypot(re[k], im[k]); };
    const weakest = Math.min(...rs.map((r) => at(110 * r))), control = at(fc);
    check(`S ${name}: every table mode in the file`, Math.max(...errs) < 0.5 && 20 * Math.log10(weakest / control) > 20, `largest error ${Math.max(...errs).toFixed(3)} Hz · weakest mode ${(20 * Math.log10(weakest / control)).toFixed(0)} dB over the empty ${fc.toFixed(0)} Hz`);
  }
}

writeFileSync(join(HERE, 'findings.json'), JSON.stringify({ checked: new Date().toISOString().slice(0, 10), pass: results.filter((r) => r.ok).length, of: results.length, results }, null, 1) + '\n');
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed} of ${results.length} pass`);
process.exit(failed ? 1 : 0);

// ── helpers ─────────────────────────────────────────────────────────────────
function fftIn(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const p = i + k, q = p + len / 2, tr = re[q] * cr - im[q] * ci, ti = re[q] * ci + im[q] * cr; re[q] = re[p] - tr; im[q] = im[p] - ti; re[p] += tr; im[p] += ti; const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } } }
}
function peak({ re, im, N }, f, sr, w = 1.5) {
  const m = (k) => Math.hypot(re[k], im[k]); let at = 0, best = -1;
  for (let k = Math.floor((f - w) * N / sr); k <= Math.ceil((f + w) * N / sr); k++) if (m(k) > best) { best = m(k); at = k; }
  const a = Math.log(m(at - 1)), b = Math.log(m(at)), c = Math.log(m(at + 1)); return (at + 0.5 * (a - c) / (a - 2 * b + c)) * sr / N;
}
function readWav(path) {
  const buf = readFileSync(path); let p = 12, sr = 44100, ch = 1, bits = 16;
  while (p < buf.length) { const id = buf.toString('ascii', p, p + 4), len = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') { ch = buf.readUInt16LE(p + 10); sr = buf.readUInt32LE(p + 12); bits = buf.readUInt16LE(p + 22); }
    if (id === 'data') { if (bits !== 16) throw new Error('16-bit only'); const n = len / 2 / ch, x = new Float64Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let c = 0; c < ch; c++) s += buf.readInt16LE(p + 8 + 2 * (i * ch + c)); x[i] = s / ch / 32768; } return { sr, x }; }
    p += 8 + len + (len & 1); }
  throw new Error('no data chunk');
}
