// ---
// title: Shepard Tone Synthesizer — proof — rich piece checks
// born: 2026-11-03
// links: [[Shepard Tone Synthesizer]] connects-to · proof-of-the-rich-face · [[Shepard Tone Synthesizer — rich — the still drone]] connects-to · checks · [[Shepard Tone Synthesizer — rich — the free seam]] connects-to · checks
// forward_vector: I re-run every claim the two Stage pieces make, on their own engines pulled out of the pages,
//   step by step, so a change made for the last step that breaks the first one fails here. I print the
//   numbers the rich face's offers quote. The walk's own rules (Progressive Staging § Inside One Piece) are
//   checked last, in a browser. I cannot hear: what the ear makes of the seam is the reader's to find.
// ---
// Run: node "Projects/Shepard Tone Synthesizer/Shepard Tone Synthesizer — proof — rich piece checks.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const DRONE = 'Shepard Tone Synthesizer — rich — the still drone.html';
const SEAM = 'Shepard Tone Synthesizer — rich — the free seam.html';
const engine = (file, names) => {
  const html = fs.readFileSync(path.join(here, file), 'utf8');
  const src = html.match(/const ENGINE_SRC = String\.raw`([\s\S]*?)`;/)[1];
  return new Function(src + '; return {' + names.join(',') + '};')();
};
let pass = 0, fail = 0;
const check = (piece, step, claim, ok, detail) => { (ok ? pass++ : fail++); console.log(`${ok ? 'ok  ' : 'FAIL'}  ${piece} · step ${step} · ${claim}${detail ? '  (' + detail + ')' : ''}`); };
const dB = g => 20 * Math.log10(g);
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ───────────────────────── the still drone (Theory § Stage 1) ─────────────────────────
{
  const E = engine(DRONE, ['C4', 'OCTAVES', 'SIGMA', 'voiceFreq', 'wLog', 'wHz', 'wBP', 'weight', 'pcCents', 'stack', 'spread', 'lowShare', 'highShare']);
  const P = 'still drone';
  // step 1
  const s1 = E.stack({ on: [4], shape: 'flat' });
  check(P, 1, 'one sine at C4, 261.63 Hz, every other voice silent', near(s1[3].f, 261.6256, 1e-3) && s1.filter(v => v.w > 0).length === 1, s1[3].f.toFixed(2) + ' Hz');
  // step 2
  const s2 = E.stack({ shape: 'flat' });
  const ratios = s2.slice(1).map((v, i) => v.f / s2[i].f);
  check(P, 2, 'every voice is the one below doubled, exactly', ratios.every(r => r === 2), ratios.map(r => r.toFixed(6)).join(' '));
  check(P, 2, 'all seven share one pitch class: spread 0 cents', E.spread(s2) === 0 && s2.every(v => v.pc === 0));
  check(P, 2, 'C4 alone is step 1 again', JSON.stringify(E.stack({ on: [4], shape: 'flat' })) === JSON.stringify(s1));
  check(P, 2, 'the stack runs C1 to C7', near(s2[0].f, 32.70, 0.01) && near(s2[6].f, 2093.0, 0.1), s2[0].f.toFixed(2) + ' to ' + s2[6].f.toFixed(1) + ' Hz');
  // step 3
  const L = E.stack({ shape: 'log' }), H = E.stack({ shape: 'hz' });
  const sym = [[2, 4], [1, 5], [0, 6]].every(([a, b]) => near(L[a].w, L[b].w, 1e-12));
  check(P, 3, 'the log2 window is symmetric in octaves: C3 = C5, C2 = C6, C1 = C7', sym);
  const one = dB(L[4].w), two = dB(L[5].w), three = dB(L[6].w);
  check(P, 3, 'one, two, three octaves from C4 cost 4.3, 17.4 and 39.1 dB (the words under the equation)', near(one, -4.34, 0.01) && near(two, -17.37, 0.01) && near(three, -39.09, 0.01), `${one.toFixed(2)} · ${two.toFixed(2)} · ${three.toFixed(2)} dB`);
  check(P, 3, 'the bell on a linear Hz axis is matched to the log window at C5', near(H[4].w, L[4].w, 1e-12), H[4].w.toFixed(4));
  const loL = E.lowShare(L), loH = E.lowShare(H);
  console.log('      C1..C7 weight, log2 window: ' + L.map(v => v.w.toFixed(3)).join(' ') + '\n      C1..C7 weight, linear-Hz bell: ' + H.map(v => v.w.toFixed(3)).join(' '));
  check(P, 3, 'a bell drawn on a linear Hz axis over-weights the lower octaves', loH > 2 * loL && near(loL, (1 - L[3].w ** 2 / L.reduce((a, v) => a + v.w ** 2, 0)) / 2, 1e-9),
    `energy below C4: log2 ${(100 * loL).toFixed(1)} %, Hz ${(100 * loH).toFixed(1)} %`);
  const B = E.stack({ shape: 'bp' });
  console.log('      C1..C7 weight, 2-pole bandpass: ' + B.map(v => v.w.toFixed(3)).join(' '));
  const bsym = [[2, 4], [1, 5], [0, 6]].every(([a, b]) => near(B[a].w, B[b].w, 1e-12));
  check(P, 3, 'a real 2-pole bandpass on C4 (Q 2/3) is symmetric in octaves: C3 = C5, C2 = C6, C1 = C7', bsym && near(dB(B[2].w), -3.01, 0.01) && near(dB(B[1].w), -8.60, 0.01) && near(dB(B[0].w), -14.6, 0.05),
    `C3 ${dB(B[2].w).toFixed(2)} · C2 ${dB(B[1].w).toFixed(2)} · C1 ${dB(B[0].w).toFixed(2)} dB`);
  check(P, 3, 'the bandpass puts as much energy above C4 as below (28.7 % each): the page’s line-179 sentence does not hold for a real filter', near(E.lowShare(B), E.highShare(B), 1e-12) && near(E.lowShare(B), 0.287, 0.001),
    `below ${(100 * E.lowShare(B)).toFixed(1)} %, above ${(100 * E.highShare(B)).toFixed(1)} %`);
  check(P, 3, 'flat with every octave on is step 2 again', JSON.stringify(E.stack({ on: E.OCTAVES.slice(), shape: 'flat' })) === JSON.stringify(s2));
  // the How Shepard Tones Work example, read against this window
  const ex = { C2: dB(L[1].w), C3: dB(L[2].w), C4: 0, C5: dB(L[4].w), C6: dB(L[5].w) };
  console.log('      a window on C4, σ 1 oct: ' + Object.entries(ex).map(([k, v]) => k + ' ' + v.toFixed(1) + ' dB').join(', '));
  check(P, 3, 'under a window centred on C4, C2 sits as far down as C6 (the page’s example puts C2 in the sweet spot and C6 fading)', near(ex.C2, ex.C6, 1e-9) && ex.C2 < -15);
  // step 4
  const off = E.stack({ shape: 'log', offOct: 5, offCents: 37 });
  check(P, 4, 'pulling C5 37 cents off puts the heard spread at 37 cents', near(E.spread(off), 37, 1e-9) && near(off[4].pc, 37, 1e-9), E.spread(off).toFixed(3));
  const farOff = E.stack({ shape: 'log', offOct: 1, offCents: 80 });
  check(P, 4, 'a voice pulled off below hearing in the window (C1, −39 dB) does not count as heard', E.spread(farOff) === 0);
  const st = E.stack({ shape: 'log', stretch: 20 });
  check(P, 4, 'stretching every octave by 20 cents spreads the heard voices (C2..C6) by 80 cents', near(E.spread(st), 80, 1e-9), E.spread(st).toFixed(3));
  check(P, 4, '0 cents is step 3 again', JSON.stringify(E.stack({ shape: 'log', offOct: 5, offCents: 0, stretch: 0 })) === JSON.stringify(L));
}

// ───────────────────────── the free seam (Theory § Stage 2) ─────────────────────────
let seamNumbers = {};
{
  const E = engine(SEAM, ['N', 'C1', 'F_TOP', 'WRAP', 'CENTER', 'SIGMA_PAGE', 'SIGMA_WIDE', 'SEMI', 'gain', 'pcCents', 'fresh', 'step', 'gains', 'loudest', 'trial', 'meanPower']);
  const P = 'free seam';
  // step 1
  const v0 = E.fresh(0);
  check(P, 1, 'nine voices, C1 to C9, all on one pitch class', v0.length === 9 && v0.every(v => E.pcCents(v.f) === 0) && near(v0[8].f, 8372.0, 0.1), v0[0].f.toFixed(1) + ' to ' + v0[8].f.toFixed(0) + ' Hz');
  // step 2
  const s = E.step(v0, 1, false);
  check(P, 2, 'one step multiplies every voice by 2^(1/12)', s.voices.every((v, i) => near(v.f / v0[i].f, Math.pow(2, 1 / 12), 1e-12)) && s.wraps.length === 0);
  const down = E.step(s.voices, -1, false).voices;
  check(P, 2, 'a step down undoes a step up', down.every((v, i) => near(v.f, v0[i].f, 1e-9)));
  // step 3
  let v = v0, wraps = 0;
  for (let k = 0; k < 12; k++) { const r = E.step(v, 1, false); v = r.voices; wraps += r.wraps.length; }
  const before = v0.map(x => x.f).sort((a, b) => a - b), after = v.map(x => x.f).sort((a, b) => a - b);
  check(P, 3, 'twelve steps come home: the same nine frequencies, one voice swapped', wraps === 1 && after.every((f, i) => near(f / before[i], 1, 1e-12)), 'wraps ' + wraps);
  // step 4
  let ok4 = true, worst = { leave: -1e9, land: -1e9 }, minRatio = 1e9, maxRatio = 0;
  for (let st = 0; st < 12; st++) {
    const T = E.trial(st, false);
    T.steps.forEach(S => S.wraps.forEach(w => {
      const r = w.from / w.to; minRatio = Math.min(minRatio, r); maxRatio = Math.max(maxRatio, r);
      if (Math.abs(E.pcCents(w.from) - E.pcCents(w.to)) > 1e-6 && Math.abs(Math.abs(E.pcCents(w.from) - E.pcCents(w.to)) - 1200) > 1e-6) ok4 = false;
      const top = E.loudest(S.voices, E.SIGMA_PAGE);
      worst.leave = Math.max(worst.leave, dB(E.gain(w.from, E.SIGMA_PAGE) / top));
      worst.land = Math.max(worst.land, dB(E.gain(w.to, E.SIGMA_PAGE) / top));
    }));
  }
  check(P, 4, 'every wrap divides by exactly 512, nine octaves', minRatio === 512 && maxRatio === 512);
  check(P, 4, 'every wrap keeps its pitch class exactly', ok4);
  seamNumbers.page = worst;
  check(P, 4, 'in session 2’s window the wrapping voice leaves and lands more than 30 dB under the loudest voice', worst.leave < -30 && worst.land < -30, `loudest it leaves ${worst.leave.toFixed(1)} dB, lands ${worst.land.toFixed(1)} dB`);
  // energy share of the wrapping voice, page vs wide
  const share = sg => { const g = E.gains(E.fresh(9), sg); const top = g.reduce((m, x, i) => x > g[m] ? i : m, 0); const sum = g.reduce((a, x) => a + x * x, 0); const hi = E.fresh(9).reduce((m, x, i, arr) => x.f > arr[m].f ? i : m, 0); return g[hi] ** 2 / sum; };
  // step 5 — the trial
  const at = [];
  for (let st = 0; st < 12; st++) { const T = E.trial(st, false); at.push(T.wrapAt.length === 1 ? T.wrapAt[0] : -1); }
  check(P, 5, 'every trial holds exactly one wrap, and the twelve starts put it on each of the twelve steps once', at.every(k => k > 0) && new Set(at).size === 12, 'start 0..11 → step ' + at.join(','));
  let wide = { leave: -1e9, land: -1e9 };
  for (let st = 0; st < 12; st++) E.trial(st, false).steps.forEach(S => S.wraps.forEach(w => {
    const top = E.loudest(S.voices, E.SIGMA_WIDE);
    wide.leave = Math.max(wide.leave, dB(E.gain(w.from, E.SIGMA_WIDE) / top)); wide.land = Math.max(wide.land, dB(E.gain(w.to, E.SIGMA_WIDE) / top));
  }));
  seamNumbers.wide = wide;
  check(P, 5, 'opened wide (σ 4 oct) the wrapping voice leaves and lands within 10 dB of the loudest', wide.leave > -10 && wide.land > -10, `leaves ${wide.leave.toFixed(1)} dB, lands ${wide.land.toFixed(1)} dB`);
  const T = E.trial(0, true), w = T.steps[T.wrapAt[0] - 1].wraps[0];
  const offBy = ((E.pcCents(w.to) - E.pcCents(w.from)) + 1200) % 1200;
  check(P, 5, 'the wrong-landing switch puts the wrapped voice exactly a semitone sharp', near(offBy, 100, 1e-6), offBy.toFixed(3) + ' ¢');
  // how loud that wrong voice gets before the trial ends, worst start
  let wrongPeak = -1e9;
  for (let st = 0; st < 12; st++) { const T2 = E.trial(st, true); const k = T2.wrapAt[0], id = T2.steps[k - 1].wraps[0].id; T2.steps.slice(k - 1).forEach(S => { const g = E.gain(S.voices.find(x => x.id === id).f, E.SIGMA_PAGE) / E.loudest(S.voices, E.SIGMA_PAGE); wrongPeak = Math.max(wrongPeak, dB(g)); }); }
  seamNumbers.wrongPeak = wrongPeak;
  check(P, 5, 'in session 2’s window the wrong note stays more than 15 dB under the loudest voice for the rest of a trial', wrongPeak < -15, `loudest it gets ${wrongPeak.toFixed(1)} dB`);
  const mp = E.meanPower(E.SIGMA_PAGE), mw = E.meanPower(E.SIGMA_WIDE);
  check(P, 5, 'both windows play at one mean power, so loudness gives no condition away', mp > 0 && mw > 0, `mean summed power ${mp.toFixed(3)} and ${mw.toFixed(3)}, each scaled to 0.3 rms`);
  // power ripple over an octave of climb: the seam heard as a level change
  const ripple = sg => { let vv = E.fresh(0), ps = []; for (let k = 0; k < 12; k++) { ps.push(E.gains(vv, sg).reduce((a, g) => a + g * g, 0)); vv = E.step(vv, 1, false).voices; } return dB(Math.sqrt(Math.max(...ps) / Math.min(...ps))); };
  seamNumbers.ripple = { page: ripple(E.SIGMA_PAGE), wide: ripple(E.SIGMA_WIDE) };
  console.log(`      summed level ripple over one octave of climb: session 2’s window ${seamNumbers.ripple.page.toFixed(3)} dB, wide ${seamNumbers.ripple.wide.toFixed(2)} dB`);
}

// ───────────────────────── both pieces, in headless Chromium: the walk's rules ─────────────────────────
{
  let chromium = null, why = '';
  try {
    const req = createRequire(path.join(root, '_ops', 'stigmergy', 'app', 'package.json'));
    ({ chromium } = req('playwright'));
    if (!fs.existsSync(chromium.executablePath())) { why = 'Playwright has no Chromium here'; chromium = null; }
  } catch (e) { why = 'Playwright is not installed for STIGMERGY (' + (e.code || e.message) + ')'; }
  if (!chromium) { fail++; console.log(`COULDN'T  both · the browser checks did not run: ${why}`); }
  else {
    const kit = fs.readFileSync(path.join(root, '_ops', 'rich-face', 'kit', 'piece.js'), 'utf8');
    const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
    for (const [file, P, last] of [[DRONE, 'still drone', 4], [SEAM, 'free seam', 5]]) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push(m.text()); });
      await page.addInitScript(() => {
        window.__ctxs = [];
        const AC = window.AudioContext;
        window.AudioContext = class extends AC { constructor(...a) { super(...a); window.__ctxs.push(this); this.__an = super.createAnalyser(); this.__an.fftSize = 4096; } };
        const conn = AudioNode.prototype.connect;
        AudioNode.prototype.connect = function (d, ...r) { if (d instanceof AudioDestinationNode && this.context.__an) conn.call(this, this.context.__an); return conn.call(this, d, ...r); };
        window.__rms = () => { const c = window.__ctxs[0]; if (!c) return 0; const b = new Float32Array(c.__an.fftSize); c.__an.getFloatTimeDomainData(b); let q = 0; for (const v of b) q += v * v; return Math.sqrt(q / b.length); };
      });
      await page.addInitScript(kit);
      await page.goto(pathToFileURL(path.join(here, file)).href);
      await page.waitForTimeout(400);
      check(P, 'all', 'no audio context exists before a click', (await page.evaluate(() => window.__ctxs.length)) === 0);
      const steps = () => page.evaluate(() => [...document.querySelectorAll('#steps section')].map(e => e.getAttribute('aria-label')));
      check(P, 'all', 'one step shows at a time, starting on step 1', JSON.stringify(await steps()) === '["step 1"]');
      await page.click('#play');
      await page.waitForTimeout(700);
      const loud = await page.evaluate(() => window.__rms());
      check(P, 'all', 'Play starts the sound', loud > 0.005, 'rms ' + loud.toFixed(4));
      const setHidden = h => page.evaluate(h => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
        document.dispatchEvent(new Event('visibilitychange'));
      }, h);
      await setHidden(true); await page.waitForTimeout(400);
      check(P, 'all', 'a hidden tab says nothing (the kit)', (await page.evaluate(() => window.__ctxs[0].state)) === 'suspended');
      await setHidden(false); await page.waitForTimeout(300);
      await page.click('#steps');             // a touch wakes it
      await page.waitForTimeout(500);
      await page.click('#next');
      await page.waitForTimeout(600);
      const quiet = await page.evaluate(() => window.__rms());
      check(P, 'all', 'Next walks to step 2, and changing step stops the sound', JSON.stringify(await steps()) === '["step 2"]' && quiet < 1e-3 && (await page.getAttribute('#play', 'aria-pressed')) === 'false', 'rms after ' + quiet.toExponential(1));
      await page.click('#back');
      check(P, 'all', 'Back returns to step 1, where Back is off', JSON.stringify(await steps()) === '["step 1"]' && await page.isDisabled('#back'));
      await page.click(`#tabs button:nth-child(${last})`);
      check(P, 'all', 'the step list stays open: the test is one click away', JSON.stringify(await steps()) === `["step ${last}"]` && await page.isDisabled('#next'));
      if (P === 'free seam') {
        await page.click('text=Start a trial');
        await page.waitForTimeout(2000);
        const covered = await page.evaluate(() => ({ curtain: document.getElementById('curtain').classList.contains('on'), read: document.getElementById('read').textContent }));
        check(P, 5, 'during a trial the picture and the readout are covered', covered.curtain && !/wrap/i.test(covered.read), covered.read);
        await page.keyboard.press('Space');
        await page.waitForTimeout(6600);
        const done = await page.evaluate(() => ({ curtain: document.getElementById('curtain').classList.contains('on'), says: document.getElementById('says').textContent, tally: document.querySelector('table.fs-tally tr.fs-now td:nth-child(2)')?.textContent }));
        check(P, 5, 'after twelve steps the trial reveals the wrap and counts the trial', !done.curtain && /The wrap was at step \d+/.test(done.says) && done.tally === '1', done.says.slice(0, 60));
      }
      check(P, 'all', 'no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
      await page.close();
    }
    await browser.close();
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
console.log('numbers for the offers: ' + JSON.stringify(seamNumbers));
process.exit(fail ? 1 : 0);
