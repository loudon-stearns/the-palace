// ---
// title: Rational Hearing — proof — rich face checks
// born: 2026-11-03
// links: [[Rational Hearing]] connects-to · proof-of-the-rich-face · checks the made piece of [[Rational Hearing — rich.json]]
// forward_vector: I re-run every claim "the miss, blind" makes, on its own engine pulled out of its page:
//   the still 3 : 2, the beat rule, the beat living in the partials, the piano's misses and their beat rates,
//   and a staircase that finds a simulated listener's threshold. Then the numbers the page's own text and
//   playback rest on, and the walk's rules in a browser. Each step's claim stays in when the next arrives.
// ---
// Run: node "Projects/Rational Hearing/Rational Hearing — proof — rich face checks.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const piece = path.join(here, 'Rational Hearing — rich — the miss, blind.html');
const html = fs.readFileSync(piece, 'utf8');
const src = html.match(/const ENGINE_SRC = String\.raw`([\s\S]*?)`;/)[1];
const E = new Function(src + '; return { ROOT, HARMS, INTERVALS, centsOf, etMiss, highOf, partials, beats, beatRate, renderDyad, envelope, Stair, makeTrial };')();
let pass = 0, fail = 0;
function check(step, claim, ok, detail) { (ok ? pass++ : fail++); console.log(`${ok ? 'ok  ' : 'FAIL'}  ${step} · ${claim}${detail ? '  (' + detail + ')' : ''}`); }
const P5 = E.INTERVALS[0], SR = 12000;

// The envelope's swing (max−min over mean), away from the rise and fall, and its strongest slow rate.
function swing(env) { const e = env.slice(10, env.length - 25); const mx = Math.max(...e), mn = Math.min(...e), m = e.reduce((s, v) => s + v, 0) / e.length; return (mx - mn) / m; }
function envRate(env, hop = 0.01) {
  const e = env.slice(10, env.length - 25), m = e.reduce((s, v) => s + v, 0) / e.length, x = e.map(v => v - m);
  let best = 0, bf = 0;
  for (let f = 0.2; f <= 20; f += 0.005) { let re = 0, im = 0; for (let i = 0; i < x.length; i++) { re += x[i] * Math.cos(2 * Math.PI * f * i * hop); im += x[i] * Math.sin(2 * Math.PI * f * i * hop); } const a = Math.hypot(re, im); if (a > best) { best = a; bf = f; } }
  return bf;
}
const rms = x => Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length);

// ───────────── step 1 · 3 : 2, still ─────────────
{
  const f2 = E.highOf(P5, E.ROOT, 0), m = E.beats(E.ROOT, f2, 'rich');
  check('step 1', 'at exactly 3 : 2 two pairs of partials meet, C3 = G2 and C6 = G4, and both are still', m.length === 2 && m.every(b => b.rate === 0) && m.some(b => b.lo === 3 && b.hi === 2) && m.some(b => b.lo === 6 && b.hi === 4));
  const s = swing(E.envelope(E.renderDyad(E.ROOT, f2, SR, 4, 'rich'), SR));
  check('step 1', 'the loudness line is flat: the just fifth\'s envelope swings under 1.5 %', s < 0.015, (100 * s).toFixed(2) + ' %');
}

// ───────────── step 2 · a hair off ─────────────
{
  const rich2 = E.envelope(E.renderDyad(E.ROOT, E.highOf(P5, E.ROOT, 2), SR, 12, 'rich'), SR);
  const b = E.beatRate(P5, E.ROOT, E.highOf(P5, E.ROOT, 2)), heard = envRate(rich2);
  check('step 2', 'two cents off, the sound swells at the rate the rule gives, b = |2·f_G − 3·f_C|', Math.abs(heard - b) < 0.05, `rule ${b.toFixed(3)} Hz, envelope ${heard.toFixed(3)} Hz`);
  const s = swing(rich2);
  check('step 2', 'and the swell is plain: the envelope swings more than 10 %, ten times the still fifth', s > 0.1, (100 * s).toFixed(1) + ' %');
  for (const c of [5, -8, 15]) {
    const f2 = E.highOf(P5, E.ROOT, c), bb = E.beatRate(P5, E.ROOT, f2), r = envRate(E.envelope(E.renderDyad(E.ROOT, f2, SR, 12, 'rich'), SR));
    check('step 2', `at ${c} ¢ too`, Math.abs(r - bb) < 0.06, `rule ${bb.toFixed(3)}, envelope ${r.toFixed(3)} Hz`);
  }
  const bET = E.beatRate(P5, E.ROOT, E.ROOT * Math.pow(2, 7 / 12));
  check('step 2', 'two cents is what the piano does to the fifth', Math.abs(Math.abs(E.etMiss(P5)) - 2) < 0.05, E.etMiss(P5).toFixed(3) + ' ¢');
  console.log(`      the piano's fifth at middle C beats ${bET.toFixed(3)} times a second`);
}

// ───────────── step 3 · sines only ─────────────
{
  const f2 = E.highOf(P5, E.ROOT, 6);
  check('step 3', 'as sines, no two partials meet', E.beats(E.ROOT, f2, 'sine').length === 0);
  const sSine = swing(E.envelope(E.renderDyad(E.ROOT, f2, SR, 6, 'sine'), SR)), sRich = swing(E.envelope(E.renderDyad(E.ROOT, f2, SR, 6, 'rich'), SR));
  check('step 3', 'and the loudness line goes flat: sines 6 ¢ off swing under 1.5 %, the rich tone over 10 %', sSine < 0.015 && sRich > 0.1, `sines ${(100 * sSine).toFixed(2)} %, rich ${(100 * sRich).toFixed(1)} %`);
  const a = rms(E.renderDyad(E.ROOT, f2, 48000, 2, 'sine')), b = rms(E.renderDyad(E.ROOT, f2, 48000, 2, 'rich'));
  check('step 3', 'the sines are lifted to the rich tone\'s loudness (RMS within 0.5 dB)', Math.abs(20 * Math.log10(a / b)) < 0.5, (20 * Math.log10(a / b)).toFixed(2) + ' dB');
}

// ───────────── step 4 · the piano's miss ─────────────
{
  const want = { P5: -1.955, P4: 1.955, M3: 13.686, '-3': -15.641, M6: 15.641 };
  for (const iv of E.INTERVALS) check('step 4', `${iv.short}: the piano misses ${iv.p}:${iv.q} by the page's own figure`, Math.abs(E.etMiss(iv) - want[iv.short]) < 0.01, E.etMiss(iv).toFixed(3) + ' ¢');
  const rates = E.INTERVALS.map(iv => [iv.short, E.beatRate(iv, E.ROOT, E.ROOT * Math.pow(2, iv.semi / 12))]);
  for (const iv of E.INTERVALS) {
    const f2 = E.ROOT * Math.pow(2, iv.semi / 12), b = E.beatRate(iv, E.ROOT, f2);
    const m = E.beats(E.ROOT, f2, 'rich').find(x => x.lo === iv.p && x.hi === iv.q);
    check('step 4', `${iv.short}: the meeting partials (low ${iv.p}, high ${iv.q}) sit inside seven harmonics and beat at b`, m && Math.abs(m.rate - b) < 1e-9, b.toFixed(3) + ' Hz');
  }
  console.log('      the piano\'s beat rates at middle C: ' + rates.map(([s, r]) => `${s} ${r.toFixed(2)} Hz`).join(' · '));
  console.log('      swells in a 1.4 s note: ' + rates.map(([s, r]) => `${s} ${(r * 1.4).toFixed(2)}`).join(' · '));
  check('step 4', 'slow for the fifth and fourth (under 1.5 a second), fast for the thirds and sixth (over 10)', rates.slice(0, 2).every(r => r[1] < 1.5) && rates.slice(2).every(r => r[1] > 10));
}

// ───────────── step 5 · the test, blind ─────────────
{
  let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const trials = Array.from({ length: 4000 }, () => E.makeTrial(P5, 4, rnd));
  const first = trials.filter(t => t.whole === 0).length / trials.length;
  check('step 5', 'the order is a coin toss', Math.abs(first - 0.5) < 0.03, (100 * first).toFixed(1) + ' % whole-first');
  const ok = trials.every(t => { const w = t.order[t.whole], o = t.order[1 - t.whole]; return Math.abs(w.f2 / w.f1 - 1.5) < 1e-12 && Math.abs(E.centsOf(o.f2 / o.f1 / 1.5) - (-4)) < 1e-9; });
  check('step 5', 'the whole one is exactly 3 : 2, the other off by the staircase\'s cents in the piano\'s direction', ok);
  const roves = trials.flatMap(t => t.order.map(d => E.centsOf(d.f1 / E.ROOT)));
  check('step 5', 'each dyad starts on its own root, roved across ±40 ¢, so pitch gives nothing away', Math.min(...roves) < -38 && Math.max(...roves) > 38 && roves.every(r => Math.abs(r) <= 40));
  // the off dyad's high note against the whole one's: the rove (±40 ¢) swamps a 4 ¢ miss
  const highDiff = trials.map(t => E.centsOf(t.order[1 - t.whole].f2 / t.order[t.whole].f2));
  const above = highDiff.filter(d => d > 0).length / highDiff.length;
  check('step 5', 'which high note is higher is near a coin toss too, so "the higher one is off" earns nothing', Math.abs(above - 0.5) < 0.06, (100 * above).toFixed(1) + ' % off-higher');
  // Level: with every partial at phase 0, the meeting partials of the exact ratio always add in phase and
  // that dyad is louder; random phases and a ±1 dB rove leave level no better than a coin.
  const lvl = (d, r) => 20 * Math.log10(rms(E.renderDyad(d.f1, d.f2, 12000, 1.4, 'rich', r, d.db)));
  const fixed = 20 * Math.log10(rms(E.renderDyad(E.ROOT, 1.5 * E.ROOT, 12000, 1.4, 'rich')) / rms(E.renderDyad(E.ROOT, E.highOf(P5, E.ROOT, -1.955), 12000, 1.4, 'rich')));
  const diffs = trials.slice(0, 300).map(t => lvl(t.order[t.whole], rnd) - lvl(t.order[1 - t.whole], rnd));
  const louder = diffs.filter(d => d > 0).length / diffs.length;
  check('step 5', 'with phases left at 0 the exact fifth would be louder than the piano\'s, a cue the test must not leak', fixed > 0.2, fixed.toFixed(2) + ' dB');
  check('step 5', 'with random phases and the level rove, "the louder one is whole" is a coin toss', Math.abs(louder - 0.5) < 0.07, (100 * louder).toFixed(1) + ' % of 300 trials whole-louder');
  // A simulated 2AFC listener: p(right) = 1 − ½·exp(−(d/α)^β). The 2-down-1-up rule settles near 70.7 %.
  for (const alpha of [0.6, 2, 6]) {
    const beta = 2, d707 = alpha * Math.pow(-Math.log(2 * (1 - 0.7071)), 1 / beta);
    const ests = [];
    for (let r = 0; r < 400; r++) {
      const st = new E.Stair({ start: 16 });
      while (!st.done) { const p = 1 - 0.5 * Math.exp(-Math.pow(st.level / alpha, beta)); st.answer(rnd() < p); }
      ests.push(st.estimate());
    }
    ests.sort((a, b) => a - b);
    const med = ests[200], lo = ests[40], hi = ests[360];
    check('step 5', `the staircase finds a listener whose 70.7 % point is ${d707.toFixed(2)} ¢`, med / d707 > 1 / 1.3 && med / d707 < 1.3, `median ${med.toFixed(2)} ¢, 80 % of runs ${lo.toFixed(2)}–${hi.toFixed(2)} ¢`);
  }
  // A listener who hears nothing walks to the cap and never earns a low threshold.
  { const st = new E.Stair({ start: 16 }); while (!st.done) st.answer(rnd() < 0.5); check('step 5', 'a listener who only guesses never comes out under the piano\'s fifth', st.estimate() > 1.96, st.estimate().toFixed(2) + ' ¢ after ' + st.trials.length + ' trials'); }
}

// ───────────── the page's own text and playback ─────────────
{
  const page = fs.readFileSync(path.join(here, 'rational-hearing.html'), 'utf8');
  const usesSeven = /for\(let i=1;i<8;i\+\+\) imag\[i\]=1\/i;/.test(page);
  check('the page', 'its own A/B plays the same wave as this piece: seven harmonics at 1/i', usesSeven);
  const ab = page.match(/e\.gain\.setValueAtTime\(0\.5,start\+1\.15\); e\.gain\.linearRampToValueAtTime\(0,start\+1\.35\)/);
  check('the page', 'and holds each dyad about 1.4 s (full by 0.04 s, fading from 1.15 to 1.35 s)', !!ab);
  // "misses every one of these except the octave": in number
  const all = [[2, 1, 12], [3, 2, 7], [4, 3, 5], [5, 4, 4], [6, 5, 3], [5, 3, 9], [8, 5, 8], [9, 8, 2], [16, 9, 10], [15, 8, 11], [16, 15, 1], [64, 45, 6]];
  const misses = all.map(([p, q, s]) => [p + '/' + q, s * 100 - E.centsOf(p / q)]);
  check('the idea in one breath', 'in number, equal temperament misses every ratio on the sheet but the octave', misses.every(([r, m]) => r === '2/1' ? Math.abs(m) < 1e-9 : Math.abs(m) > 1.9), misses.map(([r, m]) => r + ' ' + m.toFixed(1)).join(', '));
  // which of the page's A/B dyads have partials that meet at the just ratio, inside seven harmonics: the low
  // note's p-th and the high note's q-th. Where they don't, the tempering has no meeting pair to make beat.
  const near = (f1, f2) => { let n = Infinity; for (let i = 1; i <= 7; i++) for (let j = 1; j <= 7; j++) n = Math.min(n, Math.abs(i * f1 - j * f2)); return n; };
  const rows = all.slice(1).map(([p, q, s]) => { const f1 = 261.626; return { r: p + '/' + q, meet: p <= 7 && q <= 7, just: near(f1, f1 * p / q), et: near(f1, f1 * Math.pow(2, s / 12)) }; });
  console.log('      the page\'s A/B at C4, closest pair of partials (seven harmonics each), just → tempered: ' + rows.map(x => `${x.r} ${x.just.toFixed(1)}→${x.et.toFixed(1)} Hz`).join(' · '));
  const none = rows.filter(x => !x.meet);
  check('the page', 'six of the page\'s A/B columns have no meeting partials inside seven harmonics: 8/5, 9/8, 16/9, 15/8, 16/15, 64/45', none.map(x => x.r).join(' ') === '8/5 9/8 16/9 15/8 16/15 64/45');
  check('the page', 'in those six the closest pair sits over 15 Hz apart, just or tempered: a roughness the tempering shifts, never a slow beat', none.every(x => x.et > 15 && x.just > 15), none.map(x => `${x.r} ${x.just.toFixed(1)}→${x.et.toFixed(1)}`).join(', '));
  check('the page', 'in the other five, tempering takes a meeting pair from 0 Hz to the beat rate', rows.filter(x => x.meet).every(x => x.just < 1e-6 && x.et > 0.8));
  check('threads for later pages', '7/4 is about 31 ¢ below the piano\'s minor seventh', Math.abs(1000 - E.centsOf(7 / 4) - 31.2) < 0.1, (1000 - E.centsOf(7 / 4)).toFixed(2) + ' ¢');
}

// ───────────── the walk, in a browser ─────────────
{
  let chromium = null, why = '';
  try {
    const req = createRequire(path.join(here, '..', '..', '_ops', 'stigmergy', 'app', 'package.json'));
    ({ chromium } = req('playwright'));
    if (!fs.existsSync(chromium.executablePath())) { why = 'Playwright has no Chromium here'; chromium = null; }
  } catch (e) { why = 'Playwright is not installed for STIGMERGY (' + (e.code || e.message) + ')'; }
  if (!chromium) { fail++; console.log(`COULDN'T  the walk checks did not run: ${why}`); }
  else {
    const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
    const pg = await browser.newPage({ viewport: { width: 1000, height: 900 } });
    const errors = [];
    pg.on('pageerror', e => errors.push(e.message));
    pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await pg.addInitScript(() => { window.__ctxs = []; const AC = window.AudioContext; window.AudioContext = class extends AC { constructor(...a) { super(...a); window.__ctxs.push(this); } }; });
    await pg.goto(pathToFileURL(piece).href);
    await pg.waitForTimeout(400);
    check('walk', 'no audio context before a click', (await pg.evaluate(() => window.__ctxs.length)) === 0);
    check('walk', 'one step shows, the first, with no Back', (await pg.textContent('#stepname')).startsWith('1 ·') && await pg.isHidden('#back'));
    await pg.click('#go'); await pg.waitForTimeout(600);
    const on = await pg.evaluate(() => ({ s: window.__ctxs[0] && window.__ctxs[0].state, b: document.getElementById('go').textContent }));
    check('walk', 'a click on play starts the sound', on.s === 'running' && on.b.includes('stop'), JSON.stringify(on));
    await pg.click('#next'); await pg.waitForTimeout(200);
    const after = await pg.evaluate(() => ({ step: document.getElementById('stepname').textContent, b: document.getElementById('go').textContent, beat: document.getElementById('r-beat').textContent }));
    check('walk', 'Next walks to step 2, and changing step stops the sound', after.step.startsWith('2 ·') && after.b.includes('play'), JSON.stringify(after));
    await pg.click('#tabs button:nth-child(5)'); await pg.waitForTimeout(200);
    check('walk', 'the step list stays open: the test is one click away, with no Next, and the charts that would give it away are hidden', (await pg.textContent('#stepname')).startsWith('5 ·') && await pg.isHidden('#next') && await pg.isHidden('#seeing'));
    // run a whole staircase by keyboard: it must finish on its own
    await pg.click('#t-play'); await pg.waitForTimeout(100);
    for (let i = 0; i < 60; i++) {
      const done = await pg.evaluate(() => !document.getElementById('res').hidden);
      if (done) break;
      // a listener who always says 1: right half the time, so the run ends at the cap or after 50 trials
      await pg.keyboard.press('1');
      await pg.click('#t-play');
    }
    const res = await pg.evaluate(() => ({ shown: !document.getElementById('res').hidden, rows: document.querySelectorAll('#res tbody tr').length, v: document.getElementById('verdict').textContent }));
    check('walk', 'a run ends on its own and leaves a row and a verdict', res.shown && res.rows === 1 && res.v.length > 20, res.v.slice(0, 90));
    check('walk', 'no script errors', errors.length === 0, errors.slice(0, 2).join(' | '));
    await browser.close();
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
