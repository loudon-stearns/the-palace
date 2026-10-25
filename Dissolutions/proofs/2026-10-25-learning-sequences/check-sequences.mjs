// check-sequences.mjs — check the Dissolutions learning sequences, two ways.
//
//   node "Dissolutions/proofs/2026-10-25-learning-sequences/check-sequences.mjs" [--only <page.html>] [--shots <dir>]
//
// 1. The numbers. Each sequence keeps its mathematics in one pure block of its
//    inline script, between `// ---- math` and `// ---- end math ----`, ending in
//    a selfTest() that re-derives every number its steps show. This pulls that
//    exact source out of the HTML, runs selfTest in node, and prints its lines.
// 2. The page. In headless Chromium, offline, from file://: no console errors, no
//    request off the disk, no AudioContext before a click, every step reached by
//    Next with exactly one step showing, every Play makes the context and starts a
//    sound only on its click, hiding the tab stops the sound with no restart on
//    return, and the last step's link reaches a proof that exists.
//    The index page's links all reach a file.
// It reads the pages; it writes nothing but screenshots, and only with --shots.
// The math pattern is ../check-dissolutions-proofs.mjs.

import { readFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const shotsAt = argv.includes('--shots') ? argv[argv.indexOf('--shots') + 1] : null;
if (shotsAt) mkdirSync(shotsAt, { recursive: true });

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); if (!ok) fails++; };

const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;
const allPages = readdirSync(HERE).filter((f) => f.endsWith('.html') && f !== 'index.html').sort();
const pages = only ? allPages.filter((f) => f === only) : allPages;

// ── 1. the numbers ───────────────────────────────────────────────────────────
for (const f of pages) {
  const html = readFileSync(join(HERE, f), 'utf8');
  const m = html.match(/\/\/ ---- math[^\n]*\n([\s\S]*?)\/\/ ---- end math ----/);
  if (!m) { check(`${f}: has a math block`, false, 'none found'); continue; }
  let lines;
  try { lines = new Function(`${m[1]}\nreturn selfTest();`)(); }
  catch (e) { check(`${f}: selfTest runs`, false, e.message); continue; }
  console.log(`\n── ${f}: the numbers (${lines.length})`);
  for (const l of lines) check(l.name, l.ok, l.detail);
}

// ── 2. the pages, headless ───────────────────────────────────────────────────
function findPlaywright() {
  let dir = HERE;
  const tried = [];
  for (let i = 0; i < 10; i++) {
    const pkg = join(dir, '_ops/stigmergy/app/package.json');
    tried.push(pkg);
    try { return createRequire(pkg)('playwright'); } catch {}
    dir = dirname(dir);
  }
  // a worktree has no node_modules of its own: try the main checkout it was cut from
  const main = HERE.replace(/\/\.claude\/worktrees\/[^/]+\//, '/');
  try { return createRequire(join(main.slice(0, main.indexOf('/Dissolutions/')), '_ops/stigmergy/app/package.json'))('playwright'); } catch {}
  throw new Error('playwright not found; tried ' + tried.join(', '));
}
const { chromium } = findPlaywright();
const browser = await chromium.launch();

const INIT = () => {
  window.__audio = { contexts: 0, starts: 0 };
  const AC = window.AudioContext;
  window.AudioContext = function (...a) { window.__audio.contexts++; return new AC(...a); };
  window.AudioContext.prototype = AC.prototype;
  window.webkitAudioContext = window.AudioContext;
  for (const P of [AudioScheduledSourceNode.prototype, AudioBufferSourceNode.prototype, OscillatorNode.prototype]) {
    if (!Object.prototype.hasOwnProperty.call(P, 'start')) continue;
    const st = P.start;
    P.start = function (...a) { window.__audio.starts++; return st.apply(this, a); };
  }
};

for (const f of pages) {
  console.log(`\n── ${f}: the page`);
  const ctx = await browser.newContext({ offline: true, viewport: { width: 1100, height: 900 } });
  const page = await ctx.newPage();
  const errors = [], offDisk = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) offDisk.push(r.url()); });
  await page.addInitScript(INIT);
  await page.goto(pathToFileURL(join(HERE, f)).href);
  await page.waitForTimeout(800);
  const a0 = await page.evaluate(() => ({ ...window.__audio }));
  check(`${f}: silent at load`, a0.contexts === 0 && a0.starts === 0, `${a0.contexts} audio contexts, ${a0.starts} sounds started`);
  const n = await page.evaluate(() => window.__seq && window.__seq.count);
  check(`${f}: has steps`, n >= 3, `${n} steps`);

  // walk forward with Next, touching nothing that plays
  let walkOk = true, walkDetail = [];
  for (let i = 0; i < n; i++) {
    if (i > 0) { await page.click('#next'); await page.waitForTimeout(250); }
    const st = await page.evaluate(() => ({ cur: window.__seq.current(), shown: [...document.querySelectorAll('section.step')].map((s) => !s.hidden), audio: { ...window.__audio } }));
    const one = st.shown.filter(Boolean).length === 1 && st.shown[i];
    if (st.cur !== i || !one || st.audio.contexts !== 0) { walkOk = false; walkDetail.push(`step ${i + 1}: current ${st.cur + 1}, showing ${st.shown.map((v, k) => (v ? k + 1 : '')).join('')}, contexts ${st.audio.contexts}`); }
    if (shotsAt) await page.screenshot({ path: join(shotsAt, `${f.replace('.html', '')}-${String(i + 1).padStart(2, '0')}.png`), fullPage: true });
  }
  check(`${f}: Next walks every step, one showing at a time, still silent`, walkOk, walkOk ? `${n} steps, 0 contexts` : walkDetail.join('; '));
  const atEnd = await page.evaluate(() => document.getElementById('next').disabled);
  check(`${f}: Next stops at the last step`, atEnd, '');

  // the last step's link reaches a proof
  const href = await page.evaluate(() => { const a = document.querySelector('section.step:last-of-type a.proof-link'); return a && a.getAttribute('href'); });
  const target = href && resolve(HERE, decodeURI(href));
  check(`${f}: the last step opens a proof that exists`, !!href && existsSync(target), href || 'no a.proof-link');

  // every Play: sound only on its click, and it stops
  const plays = await page.evaluate(() => [...document.querySelectorAll('section.step')].map((s, i) => (s.querySelector('[data-play]') ? i : -1)).filter((i) => i >= 0));
  let playOk = true, playDetail = [];
  for (const i of plays) {
    await page.evaluate((i) => window.__seq.go(i), i);
    await page.waitForTimeout(150);
    const before = await page.evaluate(() => ({ ...window.__audio, playing: window.__seq.playing() }));
    await page.click(`section.step[data-step="${i}"] [data-play]`);
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ ...window.__audio, playing: window.__seq.playing() }));
    await page.click(`section.step[data-step="${i}"] [data-play]`);
    await page.waitForTimeout(150);
    const stopped = await page.evaluate(() => !window.__seq.playing());
    const ok = !before.playing && after.playing && after.contexts === 1 && after.starts > before.starts && stopped;
    if (!ok) { playOk = false; playDetail.push(`step ${i + 1}: before ${JSON.stringify(before)} after ${JSON.stringify(after)} stopped ${stopped}`); }
  }
  // hidden, the sound stops; shown again, it stays stopped
  let hideOk = plays.length > 0, hideDetail = '';
  if (plays.length) {
    const i = plays[0];
    await page.evaluate((i) => window.__seq.go(i), i);
    await page.click(`section.step[data-step="${i}"] [data-play]`);
    await page.waitForTimeout(300);
    const setHidden = (h) => page.evaluate((h) => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
      document.dispatchEvent(new Event('visibilitychange'));
    }, h);
    const was = await page.evaluate(() => window.__seq.playing());
    await setHidden(true); await page.waitForTimeout(150);
    const hid = await page.evaluate(() => window.__seq.playing());
    await setHidden(false); await page.waitForTimeout(300);
    const back = await page.evaluate(() => window.__seq.playing());
    hideOk = was && !hid && !back;
    hideDetail = `playing ${was}, hidden ${hid}, shown again ${back}`;
  }
  check(`${f}: hiding the tab stops the sound, and showing it does not restart it`, hideOk, hideDetail);
  check(`${f}: each Play starts a sound on its click and stops on the next`, playOk && plays.length > 0, playOk ? `${plays.length} steps play; one context made, on the first click` : playDetail.join('; '));
  check(`${f}: no console errors`, errors.length === 0, errors.length ? errors.slice(0, 3).join(' | ') : 'none');
  check(`${f}: nothing asked of the network`, offDisk.length === 0, offDisk.length ? offDisk.slice(0, 3).join(', ') : 'all from disk');
  await ctx.close();
}

// the index
if (!only && existsSync(join(HERE, 'index.html'))) {
  console.log('\n── index.html');
  const ctx = await browser.newContext({ offline: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(pathToFileURL(join(HERE, 'index.html')).href);
  const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => !/^(https?:|#|mailto:)/.test(h)));
  const missing = hrefs.filter((h) => !existsSync(resolve(HERE, decodeURI(h))));
  const seqLinks = [...new Set(hrefs.filter((h) => allPages.includes(h)))];
  check('index: links every sequence', allPages.every((p) => seqLinks.includes(p)), `${seqLinks.length} of ${allPages.length}`);
  check('index: every link reaches a file', missing.length === 0, missing.length ? missing.join(', ') : `${hrefs.length} links`);
  check('index: no console errors', errors.length === 0, errors.join(' | ') || 'none');
  await ctx.close();
}

await browser.close();
console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
