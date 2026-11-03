#!/usr/bin/env node
// title: Chebyshev is Fourier — rich — check
// born: 2026-11-03
// links: [[Chebyshev is Fourier]] (connects-to · rich-face-check) · checks the three made pieces of [[Chebyshev is Fourier — rich.json]]
// forward_vector: I re-run every claim the rich face's three pieces make, on the pieces' own core code pulled out of their pages, and the browser's own WaveShaperNode against the table the drive piece reads, so a number on the face is a number someone measured.
//
//   node "Chebyshev is Fourier/Chebyshev is Fourier — rich — check.mjs"            Node checks, then the browser's waveshaper if Playwright has Chromium
//   node "Chebyshev is Fourier/Chebyshev is Fourier — rich — check.mjs" --no-browser
//
// Exit 1 on any FAIL.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const PIECE = (what) => join(here, `Chebyshev is Fourier — rich — ${what}.html`);
function core(file, id){
  const html = readFileSync(file, 'utf8');
  const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`no <script id="${id}"> in ${file}`);
  return m[1];
}
function load(file, id){ const ctx = vm.createContext({ Math, Float32Array, Float64Array, Array, Infinity, isFinite }); vm.runInContext(core(file, id), ctx); return ctx; }

let fails = 0, passes = 0;
function t(name, ok, detail){ console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ·  ' + detail : ''}`); if (ok) passes++; else fails++; }
const ex = (v) => v === 0 ? '0' : Math.abs(v) < 1e-3 ? v.toExponential(1) : v.toFixed(4);
const dB = (v) => (20 * Math.log10(Math.abs(v))).toFixed(1) + ' dB';

// ───────────── the drive ─────────────
console.log('\n· the drive');
const D = load(PIECE('the drive'), 'drive-core');
const one = (n) => { const c = new Array(8).fill(0); c[n - 1] = 1; return c; };
{
  let w = 0;
  for (let n = 1; n <= 8; n++) for (let k = 0; k < 2048; k++){ const th = 2 * Math.PI * k / 2048; w = Math.max(w, Math.abs(D.cheb(n, Math.cos(th)) - Math.cos(n * th))); }
  t('Tₙ by the recurrence equals cos(nθ) at x = cos θ, n = 1 to 8', w < 1e-12, 'largest difference ' + ex(w));
}
{
  let wTop = 0, wOther = 0;
  for (let n = 1; n <= 8; n++){
    const h = D.harmonicsOf(D.readCycle(D.makeCurve(one(n)), 1, 4096), 16, 1);
    wTop = Math.max(wTop, Math.abs(h[n - 1] - 1));
    h.forEach((v, i) => { if (i !== n - 1) wOther = Math.max(wOther, Math.abs(v)); });
  }
  t('steps 1–3: a full-width cosine through the 4097-point table of Tₙ gives harmonic n at 1, nothing else', wTop < 1e-4 && wOther < 1e-4, `top off by ${ex(wTop)}, largest other ${ex(wOther)} (${dB(Math.max(wOther, 1e-12))}): the table's own linear steps`);
}
{
  const sets = [[1, 1/2, 1/3, 1/4, 1/5, 1/6, 1/7, 1/8], [1, 0, 1/3, 0, 1/5, 0, 1/7, 0], [0.8, 1, 0, 0.6, 0, 0.3, 0, 0.5]];
  let s = 12345; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 50; i++) sets.push(Array.from({ length: 8 }, () => Math.round(rnd() * 100) / 100));
  let w = 0; for (const c of sets){ const h = D.harmonicsOf(D.readCycle(D.makeCurve(c), 1, 4096), 16, 1); w = Math.max(w, D.compare(c, h).miss); }
  t('step 4: at drive 1 the table’s harmonics are its drawbars, 3 presets and 50 random sets', w < 1e-4, 'largest miss ' + ex(w) + ' of the loudest drawbar');
}
{
  let wLaw = 0, wUp = 0, wPar = 0;
  for (let n = 1; n <= 8; n++) for (const a of [0.25, 0.5, 0.7, 0.9]){
    const h = D.harmonicsOf(D.readCycle(D.makeCurve(one(n)), a, 4096), 16, 1);
    wLaw = Math.max(wLaw, Math.abs(h[n - 1] - Math.pow(a, n)));
    h.forEach((v, i) => { if (i + 1 > n) wUp = Math.max(wUp, Math.abs(v)); if ((i + 1 - n) % 2) wPar = Math.max(wPar, Math.abs(v)); });
  }
  t('step 5: below full drive, harmonic n of Tₙ comes out at aⁿ', wLaw < 1e-4, 'largest miss ' + ex(wLaw));
  t('step 5: below full drive, Tₙ leaks only downward and only within its parity', wUp < 1e-4 && wPar < 1e-4, `up ${ex(wUp)}, across parity ${ex(wPar)}`);
}
{
  const h = D.harmonicsOf(D.readCycle(D.makeCurve(one(3)), 0.5, 4096), 16, 1);
  t('step 5: Third alone at drive 0.50 gives h1 = 3(a³ − a) = −1.125 and h3 = a³ = 0.125', Math.abs(h[0] + 1.125) < 1e-4 && Math.abs(h[2] - 0.125) < 1e-4, `h1 ${h[0].toFixed(4)}, h3 ${h[2].toFixed(4)}`);
  const h2 = D.harmonicsOf(D.readCycle(D.makeCurve(one(2)), 0.5, 4096), 16, 1);
  let o = 0; h2.forEach((v, i) => { if (i !== 1) o = Math.max(o, Math.abs(v)); });
  t('step 2’s octave never leaks: T₂ at drive 0.50 is harmonic 2 at 0.25 and nothing else but an offset', Math.abs(h2[1] - 0.25) < 1e-4 && o < 1e-4, `h2 ${h2[1].toFixed(4)}, largest other ${ex(o)}`);
}
const SAW = [1, 1/2, 1/3, 1/4, 1/5, 1/6, 1/7, 1/8];
const sawAt = (a) => { const h = D.harmonicsOf(D.readCycle(D.makeCurve(SAW), a, 4096), 16, 1); return { h, r: D.compare(SAW, h) }; };
{
  const rows = [1, 0.99, 0.97, 0.95, 0.9, 0.7, 0.5].map(a => ({ a, ...sawAt(a) }));
  for (const x of rows) console.log(`      saw, drive ${x.a.toFixed(2)}: h1..h8 ${x.h.slice(0, 8).map(v => v.toFixed(3)).join(' ')} · largest miss ${x.r.miss.toFixed(3)} at h${x.r.missAt}`);
  const r99 = rows[1].r, r90 = rows[4];
  t('step 5: Saw one percent under full drive already misses its drawbars by more than 5%', r99.miss > 0.05, `drive 0.99: ${r99.miss.toFixed(3)} at h${r99.missAt} (${dB(r99.miss)})`);
  t('step 5: Saw at drive 0.90 has lost harmonics 4–6 almost wholly', Math.max(...r90.h.slice(3, 6).map(Math.abs)) < 0.02, `h4 ${r90.h[3].toFixed(3)}, h5 ${r90.h[4].toFixed(3)}, h6 ${r90.h[5].toFixed(3)} against 0.250, 0.200, 0.167`);
}
{
  const at1 = sawAt(1).r.aboveDb, at11 = sawAt(1.1).r.aboveDb, at125 = sawAt(1.25).r.aboveDb;
  t('step 5: above full drive the table holds its ends, and power appears above harmonic 8', at1 < -100 && at11 > -30 && at125 > -30, `above h8: drive 1.00 ${at1.toFixed(1)} dB, 1.10 ${at11.toFixed(1)} dB, 1.25 ${at125.toFixed(1)} dB`);
  let w = 0; for (const x of [-3, -1.5, -1.0001]) w = Math.max(w, Math.abs(D.lookup(D.makeCurve(SAW), x) - D.makeCurve(SAW)[0]));
  t('the table’s reader is the spec’s: held at the first value below −1', w === 0, 'difference ' + w);
}

// ───────────── nodes on the circle ─────────────
console.log('\n· nodes on the circle');
const N = load(PIECE('nodes on the circle'), 'nodes-core');
{
  let w = 0, wa = 0;
  for (let n = 2; n <= 31; n++){
    const x = N.chebNodes(n);
    x.forEach(v => { w = Math.max(w, Math.abs(D.cheb(n, v))); });
    for (let k = 1; k < n; k++) wa = Math.max(wa, Math.abs(Math.acos(x[k]) - Math.acos(x[k - 1]) - Math.PI / n));
  }
  t('step 2: the shadow points are the roots of Tₙ, n = 2 to 31', w < 1e-12, 'largest |Tₙ(xₖ)| ' + ex(w));
  t('step 2: they are equal steps of angle, π ⁄ n apart', wa < 1e-12, 'largest step error ' + ex(wa));
  console.log(`      ends vs middle: n = 5 ${N.endToMiddle(5).toFixed(1)}×, 9 ${N.endToMiddle(9).toFixed(1)}×, 21 ${N.endToMiddle(21).toFixed(1)}×`);
}
{
  const ns = [5, 9, 13, 17, 21, 25, 31];
  const rows = ns.map(n => ({ n, eq: N.maxErr(N.makeInterp(N.equalNodes(n))), ch: N.maxErr(N.makeInterp(N.chebNodes(n))), ty: N.maxErr(x => N.taylor(n, x)) }));
  for (const r of rows) console.log(`      n ${String(r.n).padStart(2)}: even ${r.eq.toExponential(2)} · shadow ${r.ch.toExponential(2)} · Taylor ${r.ty.toExponential(2)}`);
  t('step 3: through even points the worst gap passes 1 at n = 9 and grows', rows[1].eq > 1 && rows.every((r, i) => i < 1 || r.eq > rows[i - 1].eq), `n 5 ${rows[0].eq.toFixed(3)}, 9 ${rows[1].eq.toFixed(3)}, 21 ${rows[4].eq.toFixed(1)}`);
  t('step 4: through the shadow points the worst gap falls at every n', rows.every((r, i) => i < 1 || r.ch < rows[i - 1].ch) && rows[4].ch < 0.02, `n 21 ${rows[4].ch.toExponential(2)}, n 31 ${rows[6].ch.toExponential(2)}`);
  const near = (n) => { let e = 0; for (let i = 0; i <= 600; i++){ const x = -0.15 + 0.3 * i / 600; e = Math.max(e, Math.abs(N.taylor(n, x) - N.runge(x))); } return e; };
  const at = (n, x) => Math.abs(N.taylor(n, x) - N.runge(x));
  t('step 4: Taylor at 0 converges inside |x| < 1⁄5 and diverges outside it, at every n', near(9) > near(21) && near(21) > near(31) && at(21, 0.25) > at(9, 0.25) && at(31, 0.25) > at(21, 0.25),
    `inside 0.15: n 9 ${near(9).toExponential(1)}, 31 ${near(31).toExponential(1)}; at x = 0.25: n 9 ${at(9, 0.25).toExponential(1)}, 31 ${at(31, 0.25).toExponential(1)}`);
}

// ───────────── selection rules ─────────────
console.log('\n· selection rules');
const T = load(PIECE('selection rules'), 'torus-core');
const K = 7;
const HAND = {
  pmm: () => ['free'],
  cmm: (m, n) => (m + n) % 2 ? ['zero'] : ['free'],
  p4m: (m, n) => m === n ? ['free'] : ['tie', 1],
  p4g: (m, n) => (m + n) % 2 ? ['zero'] : m === n ? (m % 2 ? ['zero'] : ['free']) : ['tie', m % 2 ? -1 : 1],
};
{
  let bad = [];
  for (const g of Object.keys(HAND)) for (let m = 0; m < K; m++) for (let n = 0; n < K; n++){
    const r = T.ruleFor(g, m, n), h = HAND[g](m, n);
    const ok = r.kind === h[0] && (r.kind !== 'tie' || (r.m === n && r.n === m && r.sign === h[1]));
    if (!ok) bad.push(`${g}(${m},${n})`);
  }
  t('step 4: the rule followed through each group’s moves matches the rule worked by hand, all 4 × 49 modes', bad.length === 0, bad.length ? bad.slice(0, 6).join(' ') : '');
  const c = Object.fromEntries(Object.keys(HAND).map(g => [g, T.counts(g)]));
  console.log('      ' + Object.entries(c).map(([g, x]) => `${g}: ${x.free} free, ${x.zero} zeroed, ${x.tied} tied (${x.tiedNeg} signed)`).join(' · '));
  t('step 4: cmm zeroes 24 and ties none; p4m zeroes none and ties 21 pairs; p4g zeroes 27 and ties 9, 3 with a sign',
    c.cmm.zero === 24 && c.cmm.tied === 0 && c.p4m.zero === 0 && c.p4m.tied === 21 && c.p4m.free === 28 && c.p4g.zero === 27 && c.p4g.tied === 9 && c.p4g.tiedNeg === 3 && c.p4g.free === 13);
}
{
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647 * 2 - 1;
  let holds = 0, breaks = 1, mirrors = 0;
  for (let trial = 0; trial < 12; trial++){
    const a = Array.from({ length: K * K }, (_, i) => rnd() / (1 + Math.floor(i / K) + (i % K)));
    mirrors = Math.max(mirrors, T.moveError(a, 'flip1'), T.moveError(a, 'flip2'));
    for (const g of Object.keys(T.GROUPS)){
      const b = T.project(a, g);
      for (const mv of T.GROUPS[g].moves) holds = Math.max(holds, T.moveError(b, mv));
      for (const mv of T.GROUPS[g].not) breaks = Math.min(breaks, T.moveError(b, mv));
    }
  }
  t('step 3: flip φ₁ and flip φ₂ leave any surface in this basis unchanged, 12 random surfaces', mirrors < 1e-12, 'largest difference ' + ex(mirrors));
  t('step 4: a surface made to obey each group holds every move of that group', holds < 1e-12, 'largest difference ' + ex(holds) + ' of the peak');
  t('step 4: and breaks the next move up, so each is that group and not a larger one', breaks > 1e-2, 'smallest break ' + breaks.toFixed(3));
  let same = true; for (let m = 0; m < K; m++) for (let n = 0; n < K; n++){ const a = T.moveOnMode('quarter0', m, n), b = T.moveOnMode('swap', m, n); if (a.join() !== b.join()) same = false; }
  t('step 4: a quarter turn about (0, 0) acts on every mode as the swap does, so p4 comes out as p4m', same);
  // p4g: no diagonal mirror anywhere, and its quarter-turn centres sit off the axis mirrors
  const b = T.project(Array.from({ length: K * K }, (_, i) => rnd() / (1 + Math.floor(i / K) + (i % K))), 'p4g');
  let diag = 1e9; for (let i = 0; i < 360; i++){ const c = 2 * Math.PI * i / 360;
    T.MOVES.tmpA = (p, q) => [q - c, p + c]; T.MOVES.tmpB = (p, q) => [c - q, c - p];
    diag = Math.min(diag, T.moveError(b, 'tmpA'), T.moveError(b, 'tmpB')); }
  delete T.MOVES.tmpA; delete T.MOVES.tmpB;
  t('step 4: a p4g surface has no diagonal mirror at any of 360 placings', diag > 1e-2, 'closest ' + diag.toFixed(3));
}
{
  const a = new Array(K * K).fill(0); a[1 * K + 1] = 1;
  const sp = T.spectrum(a, 220); let other = 0; for (let f = 1; f < sp.length; f++) if (f !== 110 && f !== 330) other = Math.max(other, sp[f]);
  t('step 1: one mode at ratio 2 is two tones, 110 and 330 Hz, at half each', Math.abs(sp[110] - 0.5) < 1e-6 && Math.abs(sp[330] - 0.5) < 1e-6 && other < 1e-6, `110 Hz ${sp[110].toFixed(6)}, 330 Hz ${sp[330].toFixed(6)}, largest other ${ex(other)} (the scan is kept in 32-bit floats)`);
  const sp2 = T.spectrum(a, 165);
  t('step 1: at 3 ⁄ 2 the same mode is 55 and 275 Hz', Math.abs(sp2[55] - 0.5) < 1e-6 && Math.abs(sp2[275] - 0.5) < 1e-6, `55 Hz ${sp2[55].toFixed(6)}, 275 Hz ${sp2[275].toFixed(6)}`);
  let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647 * 2 - 1;
  const r = Array.from({ length: K * K }, (_, i) => rnd() / (1 + Math.floor(i / K) + (i % K)));
  const oddPmm = T.oddShare(T.spectrum(r, 110)), oddCmm = T.oddShare(T.spectrum(T.project(r, 'cmm'), 110));
  t('step 4: at ratio 1 a cmm surface has no power at odd multiples of 110 Hz; the same weights unruled do', oddCmm < 1e-20 && oddPmm > 0.05, `cmm ${oddCmm.toExponential(1)}, pmm ${(100 * oddPmm).toFixed(1)}%`);
}

// ───────────── the browser's own waveshaper ─────────────
if (!process.argv.includes('--no-browser')){
  console.log('\n· the browser’s WaveShaperNode against the table the drive piece reads');
  let chromium = null;
  try { const require = createRequire(join(root, '_ops/stigmergy/app/package.json')); chromium = require('playwright').chromium; if (!existsSync(chromium.executablePath())) chromium = null; } catch (e) { chromium = null; }
  if (!chromium) console.log('SKIP  no Playwright Chromium here; the Node checks above stand alone');
  else {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setContent('<!doctype html><title>check</title>');
    await page.addScriptTag({ content: core(PIECE('the drive'), 'drive-core') });
    const cases = [['saw', SAW, 1], ['saw', SAW, 0.9], ['saw', SAW, 1.1], ['third', one(3), 0.5], ['T8', one(8), 1]];
    const out = await page.evaluate(async (cases) => {
      const res = [];
      for (const [name, c, a] of cases){
        const sr = DRIVE.MEASURE_SR, per = sr / DRIVE.F0, len = per * 11;
        const oc = new OfflineAudioContext(1, len, sr);
        const buf = oc.createBuffer(1, len, sr), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.cos(2 * Math.PI * i / per);
        const src = oc.createBufferSource(); src.buffer = buf;
        const g = oc.createGain(); g.gain.value = a;
        const ws = oc.createWaveShaper(); ws.curve = makeCurve(c); ws.oversample = 'none';
        src.connect(g); g.connect(ws); ws.connect(oc.destination); src.start(0);
        const o = await oc.startRendering();
        const y = Array.from(o.getChannelData(0).slice(per * 7, per * 11));
        const browser = harmonicsOf(y, 16, 4), table = harmonicsOf(Array.from(readCycle(makeCurve(c), a, 400)), 16, 1);
        res.push({ name, a, browser, table });
      }
      return res;
    }, cases);
    await browser.close();
    let w = 0;
    for (const r of out){ const d = Math.max(...r.browser.map((v, i) => Math.abs(v - r.table[i]))); w = Math.max(w, d); console.log(`      ${r.name} at ${r.a.toFixed(2)}: browser h1..h4 ${r.browser.slice(0, 4).map(v => v.toFixed(4)).join(' ')} · largest difference from the spec’s reading ${ex(d)}`); }
    t('the browser’s WaveShaperNode reads the table as the piece’s core says, five cases', w < 1e-4, 'largest difference ' + ex(w));
  }
}

console.log(`\n${passes} PASS, ${fails} FAIL`);
process.exit(fails ? 1 : 0);
