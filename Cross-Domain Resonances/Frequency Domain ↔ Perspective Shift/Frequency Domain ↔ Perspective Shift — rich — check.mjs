#!/usr/bin/env node
// title: Frequency Domain ↔ Perspective Shift — rich — check
// born: 2026-11-04
// links: [[Frequency Domain ↔ Perspective Shift]] (connects-to · rich-face-check) · checks the made piece of [[Frequency Domain ↔ Perspective Shift — rich.json]]
// forward_vector: I re-run every number the one-kick piece bakes in, on the piece's own core pulled out of its page, and give every null a control that must fail, so a number on the face is a number someone measured and a test on it is one that could have gone the other way.
//
//   node "Cross-Domain Resonances/Frequency Domain ↔ Perspective Shift/Frequency Domain ↔ Perspective Shift — rich — check.mjs"              Node, then the page in headless Chromium if Playwright has it
//   node "…/Frequency Domain ↔ Perspective Shift — rich — check.mjs" --no-browser
//
// Exit 1 on any FAIL.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const PIECE = join(here, 'Frequency Domain ↔ Perspective Shift — rich — one kick, two views.html');
const html = readFileSync(PIECE, 'utf8');
const m = html.match(/<script id="fdps-core">([\s\S]*?)<\/script>/);
if (!m) throw new Error('no <script id="fdps-core"> in the piece');
const C = vm.createContext({ Math, Float32Array, Float64Array, Array, Infinity, NaN, isFinite }); vm.runInContext(m[1], C);

let fails = 0, passes = 0;
function t(name, ok, detail){ console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ·  ' + detail : ''}`); if (ok) passes++; else fails++; }
const { KICK } = C;
const kicks = []; for (const f0 of KICK.F0S) for (const on of KICK.ONSETS) kicks.push({ f0, on, x: C.kick(f0, on) });
for (const k of kicks) k.m = C.magDb(C.spectrum(k.x));

console.log('\n· the four stated procedures, on all 25 kicks (5 fundamentals × 5 onsets)');
{
  let wfMiss = 0, wfOk = 0, sfBiasLo = Infinity, sfBiasHi = -Infinity, sfOk = 0, woMiss = 0, woOk = 0;
  for (const k of kicks){
    const fw = C.readF0Wave(k.x), fs = C.readF0Spec(k.m), ow = C.readOnsetWave(k.x);
    wfMiss = Math.max(wfMiss, Math.abs(fw - k.f0)); if (C.nearest(fw, KICK.F0S) === k.f0) wfOk++;
    sfBiasLo = Math.min(sfBiasLo, fs - k.f0); sfBiasHi = Math.max(sfBiasHi, fs - k.f0); if (C.nearest(fs, KICK.F0S) === k.f0) sfOk++;
    woMiss = Math.max(woMiss, Math.abs(ow - k.on)); if (C.nearest(ow, KICK.ONSETS) === k.on) woOk++;
  }
  t('waveform → fundamental: the period read off the tail', wfOk === 25 && wfMiss < 0.04, `${wfOk}/25 nearest right · worst miss ${wfMiss.toFixed(3)} Hz (page says "within 0.04 Hz"; FAIL past 0.04)`);
  t('spectrum → fundamental: the tallest bin', sfOk === 25 && sfBiasLo > 0 && sfBiasHi < 1, `${sfOk}/25 · reads ${sfBiasLo.toFixed(2)} to ${sfBiasHi.toFixed(2)} Hz high (page says "under a hertz high")`);
  t('waveform → onset: the first loud sample', woOk === 25 && woMiss * 1000 < 0.05, `${woOk}/25 · worst miss ${(woMiss * 1000).toFixed(3)} ms (page says "about 0.03 ms")`);
}

console.log('\n· spectrum → onset: is the onset gone from the magnitude spectrum?');
{
  let gap = 0; for (const f0 of KICK.F0S){ const ks = kicks.filter(k => k.f0 === f0); for (const k of ks) gap = Math.max(gap, C.maxGapDb(ks[0].m, k.m)); }
  t('the five onsets draw the same magnitudes (whole kick inside the clip)', gap < 3e-9, `largest gap ${gap.toExponential(2)} dB (page bakes "3 × 10⁻⁹ dB"; FAIL at or past it)`);
  // control 1: the gap measure is not blind — two fundamentals must part widely
  const g6065 = C.maxGapDb(kicks.find(k => k.f0 === 60 && k.on === 0).m, kicks.find(k => k.f0 === 65 && k.on === 0).m);
  t('control: the same measure parts 60 Hz from 65 Hz', g6065 > 10, `${g6065.toFixed(1)} dB (FAIL under 10)`);
  // control 2: the failing condition — a clip cut at 750 ms takes the later kicks' tails, and the magnitudes part
  let gc = 0; const cutM = {};
  for (const f0 of KICK.F0S){ for (const on of KICK.ONSETS) cutM[f0 + '/' + on] = C.magDb(C.spectrum(C.cut(C.kick(f0, on), KICK.CUT)));
    for (const on of KICK.ONSETS) gc = Math.max(gc, C.maxGapDb(cutM[f0 + '/0'], cutM[f0 + '/' + on])); }
  const gc60 = Math.max(...KICK.ONSETS.map(on => C.maxGapDb(cutM['60/0'], cutM['60/' + on])));
  t('control: a clip cut at 450 ms parts the onsets', gc60 > 1, `${gc60.toFixed(1)} dB at 60 Hz (the page prints it live), ${gc.toFixed(1)} dB worst over all five (FAIL under 1)`);
  // the procedure arm: full clip → it can only guess; cut clip → it reads every onset
  let full = 0, alwaysFirst = true, cutOk = 0;
  for (const k of kicks){ const r = C.readOnsetSpec(k.m); if (r === k.on) full++; if (r !== KICK.ONSETS[0]) alwaysFirst = false;
    if (C.readOnsetSpec(cutM[k.f0 + '/' + k.on], KICK.CUT) === k.on) cutOk++; }
  t('the onset procedure on the whole clip scores exactly chance', full === 5 && alwaysFirst, `${full}/25, every answer the first candidate`);
  t('control: the same procedure on the cut clip reads every onset', cutOk === 25, `${cutOk}/25 (FAIL under 25: the procedure would be blind, not the spectrum)`);
}

console.log('\n· what the analyzer dropped: the phase');
{
  let err = 0, zd = 0, zpk = true, xd = 0;
  for (const f0 of KICK.F0S){
    const z0 = C.rebuild(C.spectrum(C.kick(f0, 0)), false);
    let pk = 0; for (let i = 0; i < z0.length; i++) if (Math.abs(z0[i]) > Math.abs(z0[pk])) pk = i; if (pk !== 0) zpk = false;
    for (const on of KICK.ONSETS){ const x = C.kick(f0, on), S = C.spectrum(x), r = C.rebuild(S, true), z = C.rebuild(S, false);
      for (let i = 0; i < x.length; i++){ err = Math.max(err, Math.abs(r[i] - x[i])); zd = Math.max(zd, Math.abs(z[i] - z0[i])); }
      if (on) { const x0 = C.kick(f0, 0); for (let i = 0; i < x.length; i++) xd = Math.max(xd, Math.abs(x[i] - x0[i])); } }
  }
  t('magnitude and phase give the kick back', err < 1e-9, `largest miss ${err.toExponential(1)} (FAIL past 1e-9)`);
  t('the magnitude alone gives one picture for every onset, peaked at time zero', zd < 1e-9 && zpk, `largest difference ${zd.toExponential(1)}`);
  t('control: the kicks themselves differ across onsets', xd > 0.5, `largest difference ${xd.toFixed(2)} (FAIL under 0.5)`);
}

console.log('\n· the third view: what each window reads (the page bakes these)');
{
  const baked = { 512: [4.7, 37.3], 2048: [18.7, 0.25], 8192: [84.4, 0.74] };
  const got = {};
  for (const W of [512, 2048, 8192]){ let wOn = 0, wF = 0;
    for (const k of kicks){ const r = C.readGram(C.stft(k.x, W), W); wOn = Math.max(wOn, Math.abs(r.onset - k.on)); wF = Math.max(wF, Math.abs(r.f0 - k.f0)); }
    got[W] = [wOn * 1000, wF];
    const [bOn, bF] = baked[W];
    t(`${(W / KICK.SR * 1000).toFixed(1)} ms windows`, Math.abs(wOn * 1000 - bOn) < 0.06 && Math.abs(wF - bF) < (bF < 1 ? 0.006 : 0.06), `worst onset ${(wOn * 1000).toFixed(2)} ms, worst fundamental ${wF.toFixed(3)} Hz (baked ${bOn} ms, ${bF} Hz)`);
  }
  t('the trade: 15.6 ms loses the fundamental, 250 ms loses the onset, 62.5 ms keeps both inside half a choice', got[512][1] > 2.5 && got[8192][0] > 50 && got[2048][0] < 50 && got[2048][1] < 2.5, 'half a choice: 50 ms, 2.5 Hz');
}

console.log('\n· the rule, and the leaks');
{
  const pass = C.binomAtLeast(4, 6, 0.2), guess = 1 - C.binomAtLeast(3, 6, 0.2), mid = C.binomAtLeast(3, 6, 0.2) - pass, any4 = 1 - Math.pow(1 - pass, 4);
  t('P(4+ of 6 | 1 in 5) is 1.7%', (pass * 100).toFixed(1) === '1.7' && html.includes('1.7%'), (pass * 100).toFixed(3) + '%');
  t('P(2 or fewer) is 90.1%, P(3) is 8.2%', (guess * 100).toFixed(1) === '90.1' && (mid * 100).toFixed(1) === '8.2' && html.includes('90.1%') && html.includes('8.2%'), `${(guess * 100).toFixed(2)}%, ${(mid * 100).toFixed(2)}%`);
  t('a guesser passes at least one of four arms about one time in fifteen', Math.abs(any4 - 1 / 15) < 0.005, (any4 * 100).toFixed(2) + '%');
  // the page text says 60 Hz and time 0: each must be one of five, drawn uniformly, so answering them always scores as guessing
  t('60 Hz and 0 ms are one choice in five, drawn uniformly', KICK.F0S.length === 5 && KICK.F0S.includes(60) && KICK.ONSETS.length === 5 && KICK.ONSETS.includes(0) && /pick\(KICK\.F0S\)/.test(html) && /pick\(KICK\.ONSETS\)/.test(html) && /Math\.floor\(Math\.random\(\) \* list\.length\)/.test(html));
  // the waveform arm: does a kick's height give its fundamental away without the cycles?
  const pk = KICK.F0S.map(f0 => { const x = C.kick(f0, 0); let p = 0; for (const v of x) p = Math.max(p, Math.abs(v)); return p; });
  const spread = 20 * Math.log10(Math.max(...pk) / Math.min(...pk));
  t('waveform leak: the five fundamentals peak within 0.5 dB of each other', spread < 0.5, `peaks ${pk.map(p => p.toFixed(3)).join(', ')} · spread ${spread.toFixed(2)} dB (the envelope and the click are the same for all)`);
  t('trials are silent: no Play in the test panel', !/id="test"[\s\S]*?class="play" id="play/.test(html) && !/showTrial[\s\S]{0,600}playBuf/.test(html));
}

if (!process.argv.includes('--no-browser')){
  console.log('\n· the page in headless Chromium');
  let chromium = null;
  try { const require = createRequire(join(root, '_ops/stigmergy/app/package.json')); chromium = require('playwright').chromium; if (!existsSync(chromium.executablePath())) chromium = null; } catch (e) { chromium = null; }
  if (!chromium) console.log('SKIP  no Playwright Chromium here; the Node checks above stand alone');
  else {
    const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
    const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.addInitScript(() => { window.__ac = 0; const A = window.AudioContext; window.AudioContext = function(){ window.__ac++; return new A(); }; });
    await page.goto(pathToFileURL(PIECE).href);
    await page.waitForTimeout(300);
    t('no AudioContext before a click', await page.evaluate(() => window.__ac) === 0);
    for (let i = 0; i < 5; i++){ await page.click('#next'); await page.waitForTimeout(i === 3 ? 900 : 200); }
    t('walks to the test', (await page.textContent('#stepEyebrow')).includes('the test'));
    await page.click('#start');
    for (let i = 0; i < 24; i++){ await page.click('#answers button:nth-child(3)'); }
    const res = await page.textContent('#results');
    t('24 trials end in the four-arm table', /waveform → fundamental/.test(res) && /spectrum → onset/.test(res) && (res.match(/of 6/g) || []).length === 8);
    t('still no AudioContext: the walk and the trials made no sound', await page.evaluate(() => window.__ac) === 0);
    t('console clean', errs.length === 0, errs.slice(0, 3).join(' | '));
    await browser.close();
  }
}
console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
