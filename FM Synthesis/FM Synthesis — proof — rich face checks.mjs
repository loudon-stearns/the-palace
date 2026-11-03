// ---
// title: FM Synthesis — proof — rich face checks
// born: 2026-11-03
// links: [[FM Synthesis]] connects-to · proof-of-the-rich-face · checks the four made pieces of [[FM Synthesis — rich.json]]
// forward_vector: I re-run every claim the rich face's made pieces make, on each piece's own engine pulled
//   out of its page: the index, the ratios, the feedback loop, the six-operator wirings. Each step's claim
//   stays in when the next arrives, as Progressive Staging asks, and the section's own claim is checked last.
//   Then the walk's rules, in a browser: nothing sounds before a click, one step shows at a time, and
//   changing step stops the sound. The staged patch keeps its own checks beside it.
// ---
// Run: node "FM Synthesis/FM Synthesis — proof — rich face checks.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const page = name => path.join(here, `FM Synthesis — rich — ${name}.html`);
const engine = (name, names) => {
  const html = fs.readFileSync(page(name), 'utf8');
  const src = html.match(/const ENGINE_SRC = String\.raw`([\s\S]*?)`;/)[1];
  return new Function(src + `; return { ${names.join(', ')} };`)();
};
let pass = 0, fail = 0;
function check(piece, step, claim, ok, detail) { (ok ? pass++ : fail++); console.log(`${ok ? 'ok  ' : 'FAIL'}  ${piece} · ${step} · ${claim}${detail ? '  (' + detail + ')' : ''}`); }
const db = v => 20 * Math.log10(Math.abs(v) + 1e-15);
// One frequency's amplitude in x (Hann window, scaled so a sine of amplitude A reads A).
function amp(x, f, sr) {
  let re = 0, im = 0;
  for (let i = 0; i < x.length; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / x.length); re += x[i] * w * Math.cos(2 * Math.PI * f * i / sr); im -= x[i] * w * Math.sin(2 * Math.PI * f * i / sr); }
  return 4 * Math.hypot(re, im) / x.length;
}
function renderPair(PairFM, { fc = 220, ratio = 1, index = 0, secs = 1, sr = 48000, skip = 0.1 }) {
  const e = new PairFM(sr); e.set({ fc, ratio, index, gate: 1, snap: true }); e.g = 1;
  const N = Math.round((secs + skip) * sr), L = new Float32Array(N), R = new Float32Array(N);
  for (let o = 0; o < N; o += 128) { const n = Math.min(128, N - o); e.render(L.subarray(o, o + n), R.subarray(o, o + n), n); }
  return L.subarray(Math.round(skip * sr));
}

// ───────────── What the ear hears as the index rises · FM Synthesis — rich — index ─────────────
{
  const P = 'index';
  const { PairFM, heard, pairs98, centroid, falling } = engine('index', ['PairFM', 'heard', 'pairs98', 'centroid', 'falling']);
  const x0 = renderPair(PairFM, { index: 0 });
  check(P, 'step 1', 'index 0 is a sine at the carrier', db(amp(x0, 440, 48000)) < db(amp(x0, 220, 48000)) - 100);
  // step 2: at 1:1 the lower sideband lands on 0 Hz and is nothing; one new partial, an octave up
  const h = heard(220, 1, 0.3);
  const x = renderPair(PairFM, { index: 0.3 });
  const up = db(amp(x, 440, 48000)) - db(amp(x, 220, 48000)), want = db(h.find(p => p.f === 440).a / h.find(p => p.f === 220).a);
  check(P, 'step 2', 'a breath of index makes one new partial at 440, as the maths says', Math.abs(up - want) < 0.3, `engine ${up.toFixed(2)} dB, maths ${want.toFixed(2)} dB`);
  check(P, 'step 2', 'and nothing between 0 and the carrier: the lower sideband of the pair is silent at 1:1', !h.some(p => p.f > 1 && p.f < 219) && db(amp(x, 110, 48000)) < -100);
  // step 3: the index-plus-one rule
  let worst = 0;
  for (let I = 0.25; I <= 8.001; I += 0.25) worst = Math.max(worst, Math.abs(pairs98(I) - (I + 1)));
  check(P, 'step 3', 'pairs holding 98 % of the power never stray a whole pair from index + 1 (0.25 to 8)', worst < 1, `worst gap ${worst.toFixed(2)}`);
  check(P, 'step 3', 'the section\'s example: index 4 spreads across five pairs', pairs98(4) === 5);
  // step 4, the test: a slow sweep shimmers rather than opens
  let fallingSteps = 0, steps = 0, centroidDrops = [];
  let prevC = centroid(heard(220, 1, 0.05));
  for (let I = 0.1; I <= 8.001; I += 0.05) {
    steps++; if (falling(220, 1, I).length) fallingSteps++;
    const c = centroid(heard(220, 1, I)); if (c < prevC - 0.5) centroidDrops.push(I.toFixed(2)); prevC = c;
  }
  check(P, 'step 4 · the test', 'through most of the sweep some partial is getting quieter as the index climbs', fallingSteps / steps > 0.8, `${fallingSteps} of ${steps} index steps`);
  check(P, 'step 4 · the test', 'at 1:1 even the brightness centre falls in places (between index 2 and 3, and 5.5 and 6.5)', centroidDrops.some(I => +I > 2 && +I < 3) && centroidDrops.some(I => +I > 5.5 && +I < 6.5), `falls near ${centroidDrops.filter((_, i) => i % 6 === 0).join(', ')}`);
}

// ───────────── Ratios · FM Synthesis — rich — ratios ─────────────
{
  const P = 'ratios';
  const { PairFM, reading } = engine('ratios', ['PairFM', 'reading', 'partials', 'whole']);
  const { partials } = engine('ratios', ['partials']);
  const SR = 48000;
  // the engine against its own maths, at every walk ratio: the six loudest partials, relative levels within 0.5 dB
  for (const [ratio, index] of [[1, 2], [2, 1.5], [3.5, 2], [1.414, 2]]) {
    const ps = partials(220, ratio, index).filter(p => p.f < 5000).sort((a, b) => Math.abs(b.a) - Math.abs(a.a)).slice(0, 6);
    const x = renderPair(PairFM, { ratio, index, secs: 1 });
    const ref = ps[0], gap = Math.max(...ps.map(p => Math.abs((db(amp(x, p.f, SR)) - db(amp(x, ref.f, SR))) - (db(p.a) - db(ref.a)))));
    check(P, 'engine', `1:${ratio} at index ${index}: the engine makes the partials the page draws`, gap < 0.5, `worst ${gap.toFixed(2)} dB over ${ps.map(p => Math.round(p.f)).join(', ')}`);
  }
  const rel = (ratio, index, H) => { const ps = partials(220, ratio, index), a1 = Math.abs((ps.find(p => Math.abs(p.f - 220) < 1e-3) || { a: 1e-15 }).a); return k => { const p = ps.find(q => Math.abs(q.f - 220 * k) < 1e-3); return db((p ? Math.abs(p.a) : 1e-15) / a1); }; };
  // step 1
  { const L = rel(1, 2); check(P, 'step 1', '1:1 has every harmonic', [1, 2, 3, 4, 5].every(k => L(k) > -40), [1, 2, 3, 4, 5].map(k => L(k).toFixed(0)).join(' '));
    const S = rel(1, 3.5); let e = 0; for (let k = 2; k <= 6; k++) e += (S(k) + db(k)) ** 2;
    check(P, 'step 1', 'near index 3.5 the first six come within about 4 dB of a sawtooth\'s, on average', Math.sqrt(e / 5) < 4, `${Math.sqrt(e / 5).toFixed(1)} dB rms`); }
  // step 2
  { const L = rel(2, 1.5); check(P, 'step 2', '1:2 has odd harmonics only', [1, 3, 5].every(k => L(k) > -40) && [2, 4, 6].every(k => L(k) < -200));
    let e = 0; for (const k of [3, 5]) e += (L(k) + db(k)) ** 2;
    check(P, 'step 2', 'at index 1.5 the odd harmonics sit within about 2 dB of a square\'s', Math.sqrt(e / 2) < 2.1, `${Math.sqrt(e / 2).toFixed(1)} dB rms`); }
  // step 3
  { const ps = partials(220, 3.5, 2), r = reading(220, 3.5, 2);
    check(P, 'step 3', '1:3.5 has no partial at 440, and every partial is a multiple of 110', !ps.some(p => Math.abs(p.f - 440) < 1e-3) && ps.every(p => Math.abs(p.f / 110 - Math.round(p.f / 110)) < 1e-6));
    check(P, 'step 3', '1:3.5 reads as 2:7, pitch 110 Hz, harmonic', r.q === 2 && r.p === 7 && r.f0 === 110 && r.fam === 'harmonic'); }
  // step 4
  { const ps = partials(220, 1.414, 2), r = reading(220, 1.414, 2);
    check(P, 'step 4', '1:1.414 puts partials between the harmonics', ps.some(p => p.f > 230 && Math.abs(p.f / 220 - Math.round(p.f / 220)) > 0.1 && Math.abs(p.a) > 0.1));
    check(P, 'step 4', '1.414 is 707/500: it repeats every 500 carrier cycles, 2.27 s, and reads as inharmonic', r.q === 500 && Math.abs(1 / r.f0 - 2.2727) < 1e-3 && r.fam === 'inharmonic'); }
  // step 5: two partials 1.32 Hz apart near the note, heard in the engine's output
  { const r = reading(220, 1.003, 2), x = renderPair(PairFM, { ratio: 1.003, index: 2, secs: 8 });
    const a = db(amp(x, 220, SR)), b = db(amp(x, 221.32, SR)), mid = db(amp(x, 220.66, SR));
    check(P, 'step 5', '1:1.003 makes a pair 1.32 Hz apart near 220, and reads as beating', Math.abs(r.gap - 1.32) < 0.01 && r.fam === 'beating' && a > mid + 6 && b > mid + 6, `220 Hz ${a.toFixed(0)}, 221.32 Hz ${b.toFixed(0)}, between ${mid.toFixed(0)} dB`); }
  // step 6, the test: every family the section names, and the ones its scope line leaves out
  const fam = r => reading(220, r, 2);
  check(P, 'step 6 · the test', 'small whole numbers keep the series: 1, 2, 7 at the carrier, 2.5 at 110, 1.25 at 55', [[1, 220], [2, 220], [7, 220], [2.5, 110], [1.25, 55]].every(([r, f]) => fam(r).fam === 'harmonic' && fam(r).f0 === f));
  check(P, 'step 6 · the test', 'a hair off a whole number beats: 1.01 at 4.4 Hz', fam(1.01).fam === 'beating' && Math.abs(fam(1.01).gap - 4.4) < 0.01);
  check(P, 'step 6 · the test', 'further off it turns rough (1.05) or lands between (1.1 is 10:11, a 22 Hz fundamental far down its own series)', fam(1.05).fam === 'rough' && fam(1.1).fam === 'between' && fam(1.1).f0 === 22);
}

// ───────────── Feedback · FM Synthesis — rich — feedback ─────────────
{
  const P = 'feedback';
  const { LoopOp, measure } = engine('feedback', ['LoopOp', 'measure', 'betaOf']);
  const m = (fb, avg = true) => measure(fb, avg);
  check(P, 'step 1', 'feedback 0 is a sine', m(0).db[1] < -100, `harmonic 2 ${m(0).db[1].toFixed(0)} dB`);
  check(P, 'step 2', 'a little feedback leans: harmonics appear, the gap to a sawtooth shrinks step by step', m(3).saw > m(5).saw && m(5).saw > m(6).saw && m(3).db[1] > -40, `3: ${m(3).saw.toFixed(1)}, 5: ${m(5).saw.toFixed(1)}, 6: ${m(6).saw.toFixed(1)} dB`);
  check(P, 'step 3', 'at 7 it is close to a sawtooth (harmonics 2-10 within 1.5 dB rms) and repeats exactly', m(7).saw < 1.5 && m(7).periodic > 0.999, `${m(7).saw.toFixed(2)} dB, ${(m(7).periodic * 100).toFixed(2)} %`);
  { // the A/B reference really is a sawtooth: harmonic k at 1/k
    const e = new LoopOp(48000); e.set({ f: 200, voice: 'saw', gate: 1, snap: true }); e.g = 1;
    const N = 48000, L = new Float32Array(N), R = new Float32Array(N); e.render(L, R, N);
    const a1 = amp(L, 200, 48000), worst = Math.max(...[2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => Math.abs(db(amp(L, 200 * k, 48000) / a1) + db(k))));
    check(P, 'step 3', 'the true sawtooth it is held against has harmonic k at 1/k', worst < 0.2, `worst ${worst.toFixed(2)} dB`);
  }
  check(P, 'step 4', 'up to 7.3 it still repeats exactly with the note', m(7.3).periodic > 0.999, `${(m(7.3).periodic * 100).toFixed(2)} %`);
  check(P, 'step 4', 'by 7.4 most of it no longer repeats: it has frayed', m(7.4).periodic < 0.5, `${(m(7.4).periodic * 100).toFixed(1)} %`);
  check(P, 'step 4', 'by 9.5 almost nothing repeats: noise', m(9.5).periodic < 0.05 && m(10).periodic < 0.05, `9.5: ${(m(9.5).periodic * 100).toFixed(1)} %, 10: ${(m(10).periodic * 100).toFixed(1)} %`);
  check(P, 'step 5', 'without the two-sample average, the same push at 7 is already fraying', m(7, false).periodic < 0.9 && m(7, false).saw > 5, `${(m(7, false).periodic * 100).toFixed(1)} %, ${m(7, false).saw.toFixed(1)} dB from a sawtooth`);
  // step 6, the test: the whole claim in order, sine → leaning → sawtooth at 7 → fraying → noise
  const order = [0, 3, 6, 7, 7.35, 7.5, 9.5].map(fb => m(fb));
  check(P, 'step 6 · the test', 'sine, leaning, sawtooth at 7, then fray, then noise, in that order', order[0].db[1] < -100 && order[1].periodic > 0.999 && order[3].saw < 1.5 && order[4].periodic < 0.999 && order[4].periodic > 0.5 && order[5].periodic < 0.5 && order[6].periodic < 0.05,
    order.map((o, i) => [0, 3, 6, 7, 7.35, 7.5, 9.5][i] + ':' + (o.periodic * 100).toFixed(0) + '%').join(' '));
}

// ───────────── Six operators, 32 algorithms · FM Synthesis — rich — algorithms ─────────────
{
  const P = 'algorithms';
  const { roles, analyse, ROWS } = engine('algorithms', ['roles', 'analyse', 'ROWS']);
  // the three rows are the staged patch's rows, which its own checks hold to the DX7 chart
  const staged = fs.readFileSync(path.join(here, 'FM Synthesis — rich — staged patch.html'), 'utf8');
  const { ALGS } = new Function(staged.match(/const ENGINE_SRC = String\.raw`([\s\S]*?)`;/)[1] + '; return { ALGS };')();
  check(P, 'table', 'rows 1, 5 and 32 match the staged patch\'s table of all 32', [1, 5, 32].every(a => JSON.stringify(ROWS[a]) === JSON.stringify(ALGS[a - 1])));
  const car = a => roles(a).R.map((r, i) => (r.carrier ? i + 1 : 0)).filter(Boolean).join(',');
  const chain = (a, n) => roles(a).R[n - 1].mods.join(',');
  check(P, 'table', 'algorithm 1: a pair (2 on 1) beside a stack of four (6 on 5 on 4 on 3), the loop on 6', car(1) === '1,3' && chain(1, 1) === '2' && chain(1, 3) === '4' && chain(1, 4) === '5' && chain(1, 5) === '6' && roles(1).fbIn === 6 && roles(1).fbOut === 6);
  check(P, 'table', 'algorithm 5: three pairs, 2 on 1, 4 on 3, 6 on 5', car(5) === '1,3,5' && chain(5, 1) === '2' && chain(5, 3) === '4' && chain(5, 5) === '6');
  check(P, 'table', 'algorithm 32: six carriers, no modulation between them, and still a loop on 6', car(32) === '1,2,3,4,5,6' && roles(32).R.every(r => !r.mods.length) && roles(32).fbIn === 6);
  const op = (ratio, level) => ({ ratio, level }), off = () => op(1, 0);
  const pair = (r2, I) => ({ alg: 1, fb: 0, ops: [op(1, 1), op(r2, I), off(), off(), off(), off()] });
  const stack = (r2, r3) => ({ alg: 1, fb: 0, ops: [off(), off(), op(1, 1), op(r2, 2), op(r3, 2), off()] });
  const p1 = analyse(pair(1, 2)).count, s1 = analyse(stack(1, 1)).count;
  check(P, 'steps 1-2', 'at the same index, a stack of three makes over twice a pair\'s partials', s1 >= 2 * p1, `pair ${p1}, stack ${s1}`);
  const full = [op(1, 0.8), op(1, 1.2), op(1, 0.35), op(14, 0.9), op(1.003, 0.5), op(1, 1)];
  const only = (a, b) => ({ alg: 5, fb: 0, ops: full.map((o, i) => (i === a || i === b ? o : off())) });
  const parts = [analyse(only(0, 1)).count, analyse(only(2, 3)).count, analyse(only(4, 5)).count], all = analyse({ alg: 5, fb: 0, ops: full }).count;
  check(P, 'step 4', 'algorithm 5\'s pairs add and merge, they don\'t multiply: together no more than the sum', all <= parts.reduce((a, b) => a + b) && all >= Math.max(...parts) && JSON.stringify(parts) === '[6,3,5]' && all === 7, `alone ${parts.join(', ')}, together ${all}`);
  check(P, 'step 5', 'algorithm 32 at ratios 1-6 is six partials', analyse({ alg: 32, fb: 0, ops: [1, 2, 3, 4, 5, 6].map(k => op(k, 1 / k)) }).count === 6);
  // step 6, the test
  const pushedWhole = Math.max(...[2, 6, 10, 14, 20].map(I => analyse(pair(1, I)).count));
  check(P, 'step 6 · the test', 'with whole-number ratios, a pair pushed hard enough catches the stack (both fill the same grid)', pushedWhole >= s1, `pair at index up to 20: ${pushedWhole}, stack at 2: ${s1}`);
  const pushedApart = Math.max(...[2, 6, 10, 14, 20].map(I => analyse(pair(1.414, I)).count)), sApart = analyse(stack(1.414, 1.732)).count;
  check(P, 'step 6 · the test', 'with ratios off whole numbers, no push lets a pair catch the stack', sApart >= 4 * pushedApart, `pair at best ${pushedApart}, stack ${sApart}`);
}

// ───────────── every piece · the walk's rules, in headless Chromium ─────────────
{
  let chromium = null, why = '';
  try {
    const req = createRequire(path.join(here, '..', '_ops', 'stigmergy', 'app', 'package.json'));
    ({ chromium } = req('playwright'));
    if (!fs.existsSync(chromium.executablePath())) { why = 'Playwright has no Chromium here'; chromium = null; }
  } catch (e) { why = 'Playwright is not installed for STIGMERGY (' + (e.code || e.message) + ')'; }
  if (!chromium) { fail++; console.log(`COULDN'T  every piece · the walk checks did not run: ${why}`); }
  else {
    const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
    for (const name of ['index', 'ratios', 'feedback', 'algorithms']) {
      const pg = await browser.newPage();
      const errors = [];
      pg.on('pageerror', e => errors.push(e.message));
      pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      await pg.addInitScript(() => { window.__ctxs = []; const AC = window.AudioContext; window.AudioContext = class extends AC { constructor(...a) { super(...a); window.__ctxs.push(this); } }; });
      await pg.goto(pathToFileURL(page(name)).href);
      await pg.waitForTimeout(400);
      check(name, 'walk', 'no audio context before a click', (await pg.evaluate(() => window.__ctxs.length)) === 0);
      check(name, 'walk', 'one step shows, the first, with no Back', (await pg.textContent('#stepname')).startsWith('1 ·') && await pg.isHidden('#back'));
      await pg.click('#go'); await pg.waitForTimeout(600);
      const on = await pg.evaluate(() => ({ s: window.__ctxs[0] && window.__ctxs[0].state, b: document.getElementById('go').textContent }));
      check(name, 'walk', 'a click on play starts the sound', on.s === 'running' && on.b.includes('stop'), JSON.stringify(on));
      await pg.click('#next'); await pg.waitForTimeout(200);
      const after = await pg.evaluate(() => ({ step: document.getElementById('stepname').textContent, b: document.getElementById('go').textContent }));
      check(name, 'walk', 'Next walks to step 2, and changing step stops the sound', after.step.startsWith('2 ·') && after.b.includes('play'), JSON.stringify(after));
      const n = await pg.evaluate(() => document.querySelectorAll('#tabs button').length);
      await pg.click(`#tabs button:nth-child(${n})`); await pg.waitForTimeout(200);
      check(name, 'walk', 'the step list stays open: the test is one click away, with no Next', (await pg.textContent('#stepname')).startsWith(n + ' ·') && await pg.isHidden('#next'));
      check(name, 'walk', 'no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
      await pg.close();
    }
    await browser.close();
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
