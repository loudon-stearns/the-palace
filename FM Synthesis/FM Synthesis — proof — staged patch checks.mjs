// ---
// title: FM Synthesis — proof — staged patch checks
// born: 2026-10-25
// links: [[FM Synthesis]] connects-to · proof-of-the-rough · [[FM Synthesis — rich — staged patch]] connects-to · checks
// forward_vector: I re-run every claim the staged patch makes, on its own engine pulled out of the page,
//   step by step. Progressive Staging asks that checks accumulate, so each step's claims stay in when
//   the next step's arrive, and a change that breaks step 1 fails here even when it was made for step 7.
//   The walk's own rules (§ Inside One Piece) are checked last, in a browser.
// ---
// Run: node "FM Synthesis/FM Synthesis — proof — staged patch checks.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, 'FM Synthesis — rich — staged patch.html'), 'utf8');
const src = html.match(/const ENGINE_SRC = String\.raw`([\s\S]*?)`;/)[1];
const { Engine, ALGS } = new Function(src + '; return { Engine, ALGS };')();

const SR = 48000;
const op = (o = {}) => Object.assign({ ratio: 1, fixed: false, hz: 5, level: 0, a: 0.0001, d: 1, s: 1, r: 0.3 }, o);
const patch = (o = {}) => Object.assign({ alg: 2, fb: 0, solo: 0, velSens: 0, ops: [op({ level: 0.8 }), op(), op(), op(), op(), op()] }, o);

function render(p, { notes = [[200, 1]], secs = 1, from = 0 } = {}) {
  const e = new Engine(SR); e.setPatch(p);
  notes.forEach(([f, v], i) => e.noteOn('n' + i, f, v));
  const N = Math.round(secs * SR), x = new Float32Array(N);
  for (let o = 0; o < N; o += 128) { const L = new Float32Array(128), R = new Float32Array(128); e.render(L, R, 128); x.set(L.subarray(0, Math.min(128, N - o)), o); }
  return x.subarray(Math.round(from * SR));
}
function mag(x, f) {
  let re = 0, im = 0;
  for (let i = 0; i < x.length; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / x.length); re += x[i] * w * Math.cos(2 * Math.PI * f * i / SR); im -= x[i] * w * Math.sin(2 * Math.PI * f * i / SR); }
  return Math.hypot(re, im) / x.length;
}
const db = v => 20 * Math.log10(v + 1e-12);
let pass = 0, fail = 0;
function check(stage, claim, ok, detail) { (ok ? pass++ : fail++); console.log(`${ok ? 'ok  ' : 'FAIL'}  step ${stage} · ${claim}${detail ? '  (' + detail + ')' : ''}`); }

// Step 1 — one operator: a sine at the note, nothing else.
{
  const x = render(patch(), { from: 0.2 });
  const f = db(mag(x, 200)), h2 = db(mag(x, 400)), h3 = db(mag(x, 600));
  check(1, 'one operator is a sine at the note', f > -40 && h2 < f - 80 && h3 < f - 80, `200 Hz ${f.toFixed(0)} dB, 400 ${h2.toFixed(0)}, 600 ${h3.toFixed(0)}`);
  const pl = render(patch({ ops: [op({ level: 0.8, a: 0.002, d: 0.5, s: 0 }), op(), op(), op(), op(), op()] }), { secs: 1.2 });
  const early = Math.max(...pl.subarray(0, 4800).map(Math.abs)), late = Math.max(...pl.subarray(48000, 57600).map(Math.abs));
  check(1, 'a decay to sustain 0 dies away', late < early * 0.01, `peak ${early.toFixed(3)} → ${late.toFixed(5)}`);
}
// Step 2 — the threshold: slow is vibrato (energy stays near the note), fast is sidebands at carrier ± rate.
{
  const slow = render(patch({ ops: [op({ level: 0.8 }), op({ fixed: true, hz: 5, level: 10 / 5 / 10 }), op(), op(), op(), op()] }), { secs: 2, from: 0.5 });
  const near = db(mag(slow, 200)), far = db(mag(slow, 500));
  check(2, 'a 5 Hz modulator with 10 Hz depth keeps the energy near the note', far < near - 40, `200 Hz ${near.toFixed(0)}, 500 Hz ${far.toFixed(0)}`);
  const fast = render(patch({ ops: [op({ level: 0.8 }), op({ fixed: true, hz: 300, level: 300 / 300 / 10 }), op(), op(), op(), op()] }), { from: 0.2 });
  const sb = db(mag(fast, 500)), gap = db(mag(fast, 350));
  check(2, 'a 300 Hz modulator makes a sideband at 200 + 300 Hz', sb > gap + 40 && sb > -60, `500 Hz ${sb.toFixed(0)}, 350 Hz ${gap.toFixed(0)}`);
  const none = render(patch({ ops: [op({ level: 0.8 }), op({ fixed: true, hz: 300, level: 0 }), op(), op(), op(), op()] }), { from: 0.2 });
  check(2, 'depth 0 is step 1 again', db(mag(none, 500)) < db(mag(none, 200)) - 80);
}
// Step 3 — ratio and index.
{
  const r = (ratio, idx) => render(patch({ ops: [op({ level: 0.8 }), op({ ratio, level: idx / 10 }), op(), op(), op(), op()] }), { from: 0.2 });
  const one = r(1, 3), two = r(2, 3), bell = r(1.414, 3), zero = r(1, 0);
  check(3, '1:1 has every harmonic', [200, 400, 600, 800].every(f => db(mag(one, f)) > -50));
  check(3, '1:2 has odd harmonics only', db(mag(two, 600)) > -50 && db(mag(two, 400)) < db(mag(two, 600)) - 60 && db(mag(two, 800)) < db(mag(two, 600)) - 60);
  check(3, '1:1.414 puts a partial between the harmonics', db(mag(bell, 200 + 282.8)) > db(mag(bell, 400)) + 30, `482.8 Hz ${db(mag(bell, 482.8)).toFixed(0)}, 400 Hz ${db(mag(bell, 400)).toFixed(0)}`);
  check(3, 'index 0 is a sine again', db(mag(zero, 400)) < db(mag(zero, 200)) - 80);
}
// Step 4 — the index over time: a strike is brighter at the start than later.
{
  const p = patch({ ops: [op({ level: 0.8, a: 0.002, d: 2.5, s: 0 }), op({ ratio: 1, level: 0.5, a: 0.002, d: 0.5, s: 0 }), op(), op(), op(), op()] });
  const early = render(p, { secs: 0.15, from: 0.05 }), late = render(p, { secs: 1.25, from: 1.15 });
  const bright = x => db(mag(x, 1000)) - db(mag(x, 200));
  check(4, 'a strike: the 5th harmonic falls faster than the fundamental', bright(early) > bright(late) + 20, `early ${bright(early).toFixed(0)} dB, late ${bright(late).toFixed(0)} dB`);
  // with sustain at 1 the decay has nothing to fall to, so any decay time gives stage 3's still index
  const flat = render(patch({ ops: [op({ level: 0.8 }), op({ level: 0.3, d: 0.05, s: 1 }), op(), op(), op(), op()] }), { from: 0.2 });
  const s3 = render(patch({ ops: [op({ level: 0.8 }), op({ level: 0.3, d: 6, s: 1 }), op(), op(), op(), op()] }), { from: 0.2 });
  check(4, 'a flat index envelope is step 3 again', Math.abs(db(mag(flat, 600)) - db(mag(s3, 600))) < 0.01);
}
// Step 5 — feedback, heard on the modulator alone.
{
  const fb = n => render(patch({ fb: n, solo: 2, ops: [op({ level: 0.8 }), op({ level: 1 }), op(), op(), op(), op()] }), { from: 0.2 });
  const saw = fb(7), noise = fb(9), none = fb(0);
  const h = [1, 2, 3, 4, 5].map(k => db(mag(saw, 200 * k)));
  const slope = h[0] - h[4];
  check(5, 'feedback 7 is near a sawtooth (harmonic 5 about 14 dB under 1)', slope > 9 && slope < 20 && db(mag(saw, 300)) < h[0] - 80, h.map(v => v.toFixed(0)).join(' '));
  check(5, 'feedback 9 frays into noise between the harmonics', db(mag(noise, 300)) > db(mag(saw, 300)) + 40, `300 Hz ${db(mag(noise, 300)).toFixed(0)} vs ${db(mag(saw, 300)).toFixed(0)}`);
  check(5, 'feedback 0 is a sine again', db(mag(none, 400)) < db(mag(none, 200)) - 80);
}
// Step 6 — six operators: algorithm 2 with 3-6 silent is stage 5; algorithm 32 is additive.
{
  const p5 = patch({ fb: 4, ops: [op({ level: 0.8 }), op({ ratio: 1.414, level: 0.35 }), op({ ratio: 3 }), op({ ratio: 5 }), op({ ratio: 7 }), op({ ratio: 9 })] });
  // step 5's patch has nothing set on operators 3-6; stage 6 opens them with other ratios, still at level 0
  const s5 = patch({ fb: 4, ops: [op({ level: 0.8 }), op({ ratio: 1.414, level: 0.35 }), op(), op(), op(), op()] });
  const a = render(p5, { secs: 0.3 }), b = render(s5, { secs: 0.3 });
  let same = true; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { same = false; break; }
  check(6, 'algorithm 2 with operators 3-6 at 0 renders step 5 sample for sample', same);
  const add = render(patch({ alg: 32, ops: [1, 2, 3, 4, 5, 6].map(k => op({ ratio: k, level: 0.15 })) }), { from: 0.2 });
  const partials = [1, 2, 3, 4, 5, 6].map(k => db(mag(add, 200 * k))), between = db(mag(add, 300));
  check(6, 'algorithm 32 with ratios 1-6 is six partials and nothing between', partials.every(v => v > -60) && between < Math.min(...partials) - 60, partials.map(v => v.toFixed(0)).join(' '));
  // the routing table reads as the DX7 chart: count carriers per algorithm
  const carriers = ALGS.map(f => f.filter(x => (x & 3) === 0).length);
  const expect = [2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 3, 3, 4, 4, 4, 5, 5, 3, 3, 3, 4, 4, 5, 6];
  check(6, 'carrier counts match the DX7 chart for all 32 algorithms', carriers.every((c, i) => c === expect[i]), carriers.join(''));
}
// Step 7 — velocity and voices.
{
  const p = patch({ velSens: 1, ops: [op({ level: 0.8 }), op({ level: 0.4 }), op(), op(), op(), op()] });
  const hard = render(p, { notes: [[200, 1]], from: 0.2 }), soft = render(p, { notes: [[200, 0.3]], from: 0.2 });
  const tilt = x => db(mag(x, 1000)) - db(mag(x, 200));
  check(7, 'a harder note is brighter, not only louder', tilt(hard) > tilt(soft) + 10, `5th harmonic re fundamental: hard ${tilt(hard).toFixed(0)} dB, soft ${tilt(soft).toFixed(0)} dB`);
  const chord = render(patch(), { notes: [[200, 1], [250, 1], [300, 1]], from: 0.2 });
  check(7, 'three notes at once all sound', [200, 250, 300].every(f => db(mag(chord, f)) > -40));
  const e = new Engine(SR); e.setPatch(patch());
  for (let i = 0; i < 10; i++) e.noteOn('n' + i, 100 + i * 10, 1);
  check(7, 'ten notes on eight voices steal the oldest, never more than eight', e.voices.filter(v => v.active).length === 8 && !e.voices.some(v => v.id === 'n0' || v.id === 'n1'));
  const still = render(patch({ velSens: 0, ops: [op({ level: 0.8 }), op({ level: 0.4 }), op(), op(), op(), op()] }), { notes: [[200, 0.3]], from: 0.2 });
  const full = render(patch({ velSens: 0, ops: [op({ level: 0.8 }), op({ level: 0.4 }), op(), op(), op(), op()] }), { notes: [[200, 1]], from: 0.2 });
  check(7, 'velocity sensitivity 0 plays every note the same, as steps 1-6 did', Math.abs(db(mag(still, 600)) - db(mag(full, 600))) < 0.01);
}

// Every step — the page, in headless Chromium: no audio context before a click, and a hidden tab
// says nothing. Hidden, the sound stops; shown again, it stays stopped until the next touch.
{
  let chromium = null, why = '';
  try {
    const req = createRequire(path.join(here, '..', '_ops', 'stigmergy', 'app', 'package.json'));
    ({ chromium } = req('playwright'));
    if (!fs.existsSync(chromium.executablePath())) { why = 'Playwright has no Chromium here'; chromium = null; }
  } catch (e) { why = 'Playwright is not installed for STIGMERGY (' + (e.code || e.message) + ')'; }
  if (!chromium) { fail++; console.log(`COULDN'T  every step · the hidden-tab checks did not run: ${why}`); }
  else {
    const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
    const page = await browser.newPage();
    await page.addInitScript(() => {
      window.__ctxs = [];
      const AC = window.AudioContext;
      window.AudioContext = class extends AC { constructor(...a) { super(...a); window.__ctxs.push(this); } createAnalyser() { const n = super.createAnalyser(); window.__an = n; return n; } };
      window.__rms = () => { const b = new Float32Array(window.__an.fftSize); window.__an.getFloatTimeDomainData(b); let q = 0; for (const v of b) q += v * v; return Math.sqrt(q / b.length); };
    });
    await page.goto(pathToFileURL(path.join(here, 'FM Synthesis — rich — staged patch.html')).href);
    await page.waitForTimeout(300);
    check('all', 'no audio context exists before a click', (await page.evaluate(() => window.__ctxs.length)) === 0);
    await page.click('#drone');
    await page.waitForTimeout(600);
    const playing = await page.evaluate(() => ({ state: window.__ctxs[0] && window.__ctxs[0].state, drone: document.getElementById('drone').getAttribute('aria-pressed') }));
    check('all', 'a click on Drone starts the sound', playing.state === 'running' && playing.drone === 'true', JSON.stringify(playing));
    const setHidden = h => page.evaluate(h => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
      document.dispatchEvent(new Event('visibilitychange'));
    }, h);
    await setHidden(true);
    await page.waitForTimeout(400);
    const hidden = await page.evaluate(() => ({ state: window.__ctxs[0].state, drone: document.getElementById('drone').getAttribute('aria-pressed') }));
    check('all', 'a hidden tab stops the sound', hidden.state === 'suspended' && hidden.drone === 'false', JSON.stringify(hidden));
    await setHidden(false);
    await page.waitForTimeout(1000);
    const back = await page.evaluate(() => window.__ctxs[0].state);
    check('all', 'shown again, it stays silent until the next touch', back === 'suspended', back);
    await page.click('#drone');
    await page.waitForTimeout(400);
    check('all', 'the next touch wakes it', (await page.evaluate(() => window.__ctxs[0].state)) === 'running');
    // § Inside One Piece: one step shows at a time, Next walks, Back returns, changing step stops the sound
    const steps = () => page.evaluate(() => [...document.querySelectorAll('section.fm-step')].map(e => e.getAttribute('aria-label')));
    check('all', 'one step shows at a time', JSON.stringify(await steps()) === '["step 1"]', JSON.stringify(await steps()));
    await page.waitForTimeout(500);
    const loud = await page.evaluate(() => window.__rms());
    await page.click('#next');
    await page.waitForTimeout(500);
    const quiet = await page.evaluate(() => window.__rms());
    check('all', 'Next walks to step 2, still one at a time', JSON.stringify(await steps()) === '["step 2"]');
    check('all', 'changing step stops the sound', loud > 0.01 && quiet < 1e-4 && (await page.getAttribute('#drone', 'aria-pressed')) === 'false', `rms ${loud.toFixed(4)} → ${quiet.toExponential(1)}`);
    await page.click('#back');
    check('all', 'Back returns to step 1, and step 1 has no Back', JSON.stringify(await steps()) === '["step 1"]' && await page.isHidden('#back'));
    await page.click('#tabs button:nth-child(7)');
    check('all', 'the step list stays open: the last step is one click away', JSON.stringify(await steps()) === '["step 7"]' && await page.isHidden('#next'));
    const href = await page.getAttribute('section.fm-step a[href*="bessel-fm-correlation"]', 'href');
    const onDisk = href && fs.existsSync(path.resolve(here, decodeURIComponent(href)));
    await page.click('text=Show the proof');
    await page.waitForTimeout(500);
    const shown = await page.evaluate(() => { const i = document.querySelector('.fm-proof img'); return i && !i.hidden && i.naturalWidth; });
    check('all', 'the last step links to the existing proof, and it loads', !!onDisk && shown > 0, `${href} · ${shown}px wide`);
    await browser.close();
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
