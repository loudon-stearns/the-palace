#!/usr/bin/env node
/*
  title: Semantic Webcam — rich — checks
  born: 2026-11-03
  parent: [[Semantic Webcam]] · rich face, proposal round 2026-11
  forward_vector: I re-run every number the two made pieces print, on their own engine, in headless Chromium (the
    engine measures glyphs on a canvas, so Node alone can't). I pull the script marked id="sw-engine" out of both
    pieces and fail if they differ; hold the engine to card 03 itself (its thresholds, its texts, and its own
    typeset function run beside mine on the same rows); then hold each step's claim to a threshold and print what
    I measured, on both stills.

  run:  node "Projects/Semantic Webcam/Semantic Webcam — rich — checks.mjs"
  needs: Playwright's Chromium, as conform.mjs uses it (_ops/stigmergy/app).
*/
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const require = createRequire(path.join(ROOT, '_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');
const P = (w) => path.join(HERE, `Semantic Webcam — rich — ${w}.html`);
const pieces = { ramp: P('the ramp'), band: P('legibility band') };
const card03 = fs.readFileSync(path.join(HERE, '03-character-multiply-cam.html'), 'utf8');
let fails = 0; const rows = [];
const check = (name, ok, got) => { rows.push(`${ok ? 'PASS' : 'FAIL'}  ${name}  ·  ${got}`); if (!ok) fails++; };

const engines = {};
for (const [k, f] of Object.entries(pieces)) {
  const h = fs.readFileSync(f, 'utf8');
  const m = h.match(/<script id="sw-engine">([\s\S]*?)<\/script>/); if (!m) throw new Error(`no engine in ${f}`);
  engines[k] = m[1];
  check(`${k}: never names the kit's hush message`, !h.includes('rich:' + 'hush'), 'leaves hush to the kit');
}
check('one engine in both pieces', engines.ramp === engines.band, `${engines.ramp.length} chars`);
const typeset03 = card03.match(/function typeset\([\s\S]*?\n}\n/)[0];
const consts03 = Object.fromEntries([...card03.matchAll(/(MIDLO|MIDHI|WHITELO)=([0-9.]+)/g)].map(m => [m[1], +m[2]]));
const texts03 = card03.match(/const TEXTS = \[([\s\S]*?)\];/)[1];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1130, height: 1000 } });
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(pathToFileURL(pieces.band).href);
await page.waitForFunction(() => window.SW_READY, null, { timeout: 30000 });

const r = await page.evaluate(async ({ typeset03, consts03, texts03 }) => {
  const S = window.SW, out = {};
  /* card 03 against the engine */
  out.consts = { MIDLO: S.T.MIDLO === consts03.MIDLO, MIDHI: S.T.MIDHI === consts03.MIDHI, WHITELO: S.T.WHITELO === consts03.WHITELO };
  const t03 = new Function('return [' + texts03 + '];')();
  out.texts = t03.length === S.TEXTS.length && t03.every((t, i) => t.body === S.TEXTS[i].body);
  let same = 0, total = 0;
  for (let textIdx = 0; textIdx < 4; textIdx++) {
    const DW = 80, rowB = new Float32Array(DW), words = S.bankFor(S.TEXTS[textIdx].body);
    const f03 = new Function('DW', 'rowB', 'textIdx', 'rngMake', typeset03 + '; return typeset;')(DW, rowB, textIdx, S.rngMake);
    const rng = S.rngMake(7 + textIdx);
    for (let y = 0; y < 60; y++) {
      for (let x = 0; x < DW; x++) rowB[x] = (Math.sin(x * 0.21 + y) * 0.5 + 0.5) * (0.6 + rng() * 0.6);
      for (const [lo, hi, band] of [[0.26, 0.80, 0], [0.90, 1.01, 1]]) {
        const a = new Array(DW).fill(0), b = new Array(DW).fill(0);
        f03(y, lo, hi, a, false, words, words.length, { p: 0 }, band);
        S.typesetFill(rowB, DW, y, lo, hi, b, words, band, textIdx);
        total++; if (a.join() === b.join()) same++;
      }
    }
  }
  out.fill = { same, total };
  /* the claims, on both stills */
  const CELL = 9, imgs = { hopper: [await S.loadImg(document.documentElement.innerHTML.match(/const HOPPER = '([^']+)'/)[1]), 512, 600], waves: [S.wavesImg(), 640, 480] };
  for (const [nm, [img, w, h]] of Object.entries(imgs)) {
    const DW = 80, DH = Math.round(DW * h / w), raw = S.lumGrid(img, w, h, DW, DH), cur = S.contrastOf(raw), o = { textIdx: 0, squint: 1 };
    const built = S.portraitScore(cur, DW, DH, CELL, o), mult = S.portraitScore(cur, DW, DH, CELL, { ...o, multiply: true }), ctl = S.controlScore(cur, DW, DH, CELL, o);
    const ib = { ...o, inBand: true }, bB = S.portraitScore(cur, DW, DH, CELL, ib), bM = S.portraitScore(cur, DW, DH, CELL, { ...ib, multiply: true }), bK = S.portraitScore(cur, DW, DH, CELL, { ...ib, pick: 'ink' });
    const tr = S.transfer(built.lay, built.R, 50), inBand = tr.map((v, k) => [(k + .5) / 50, v]).filter(([x, v]) => v != null && x >= 0.30 && x < 0.78).map(p => p[1]);
    let tot = 0, tile = 0; built.lay.B.forEach((b, i) => { tot += built.R[i]; if (S.tierOf(b) === 'tile') tile += built.R[i]; });
    out[nm] = { built: built.r, mult: mult.r, ctl, bandBuilt: bB.r, bandMult: bM.r, bandInk: bK.r, slopeBuilt: bB.slope, slopeInk: bK.slope, slopeMult: bM.slope,
      flat: Math.max(...inBand) - Math.min(...inBand), tileShare: tile / tot,
      churn: [0, 0.7, 0.95].map(s => S.churn(raw, DW, DH, 0.02, s, { textIdx: 0 })) };
  }
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => S.inkOf(c));
  out.letters = [Math.min(...ABC), Math.max(...ABC)];
  out.words = S.inkReach(S.bankFor(S.TEXTS[0].body));
  return out;
}, { typeset03, consts03, texts03 });

const f = (v) => (v >= 0 ? '+' : '') + v.toFixed(3);
check('engine thresholds are 03\'s', Object.values(r.consts).every(Boolean), JSON.stringify(consts03));
check('engine texts are 03\'s, verbatim', r.texts, '4 texts');
check('engine fill places the same letters as 03\'s own typeset', r.fill.same === r.fill.total, `${r.fill.same} of ${r.fill.total} rows`);
for (const nm of ['hopper', 'waves']) {
  const x = r[nm];
  check(`${nm} · ramp 5 · the drawn frame follows the source (squint 1)`, x.built > 0.8, `r ${f(x.built)}`);
  check(`${nm} · ramp 5 · the shuffled control does not`, Math.abs(x.ctl) < 0.1, `r ${f(x.ctl)}`);
  check(`${nm} · ramp 5 · as built, the word band ignores the light`, Math.abs(x.bandBuilt) < 0.2 && Math.abs(x.slopeBuilt) < 0.06, `r ${f(x.bandBuilt)}, slope ${x.slopeBuilt.toFixed(3)}`);
  check(`${nm} · ramp 5 · a literal multiply makes the band follow`, x.bandMult > 0.4, `r ${f(x.bandMult)}, slope ${x.slopeMult.toFixed(3)}; whole frame ${f(x.mult)}`);
  check(`${nm} · band 5 · words picked by ink sit between`, x.bandInk > x.bandBuilt + 0.1 && x.bandInk < x.bandMult, `r ${f(x.bandInk)}, slope ${x.slopeInk.toFixed(3)}`);
  check(`${nm} · band 4 · the curve is flat across the word band`, x.flat < 0.1, `range ${x.flat.toFixed(3)}`);
  check(`${nm} · ramp 4 · more smoothing, fewer letters change (σ 0.02)`, x.churn[0] > x.churn[1] && x.churn[1] > x.churn[2], x.churn.map(v => (100 * v).toFixed(0) + '%').join(' → '));
}
check('hopper · band 3 · the white tiles carry a large share of the light', r.hopper.tileShare > 0.35, `${(100 * r.hopper.tileShare).toFixed(0)}%`);
check('band 2 · the capitals span a narrow band of ink', r.letters[1] - r.letters[0] < 0.2, `${r.letters[0].toFixed(3)} – ${r.letters[1].toFixed(3)}`);
check('band 2 · whole words span less than the letters', r.words[0] >= r.letters[0] && r.words[1] <= r.letters[1], `${r.words[0].toFixed(3)} – ${r.words[1].toFixed(3)}`);

/* every step of both pieces, clicked, no console errors */
for (const [k, file] of Object.entries(pieces)) {
  const p = await browser.newPage({ viewport: { width: 1130, height: 1000 } }); const e = []; p.on('pageerror', x => e.push(x.message));
  await p.goto(pathToFileURL(file).href); await p.waitForFunction(() => window.SW_READY, null, { timeout: 30000 });
  for (const b of await p.$$('.sw-rail button')) { await b.click(); await p.waitForTimeout(150); }
  for (const b of await p.$$('button.mode, #mul')) { await b.click(); await p.waitForTimeout(100); }
  check(`${k}: every step shown and every toggle clicked, no page errors`, e.length === 0, e[0] || 'clean');
  await p.close();
}
check('no page errors while measuring', errs.length === 0, errs[0] || 'clean');
await browser.close();
console.log(rows.join('\n'));
console.log(`\n${rows.length - fails} of ${rows.length} pass`);
process.exit(fails ? 1 : 0);
