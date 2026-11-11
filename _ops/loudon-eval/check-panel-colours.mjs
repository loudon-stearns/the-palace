// check-panel-colours.mjs — re-checks, in headless Chromium, that answers.js's
// panel stays readable whatever the page sets: every combination of --ink and
// --paper, and the Pheromone Trail rough with its --paper taken away, as it was
// when a light --ink with no --paper drew light text on light paper. Each panel
// and its Copy button must reach 4.5:1. Exit 1 on any failure.
//   node _ops/loudon-eval/check-panel-colours.mjs [screenshot.png]
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
const PALACE = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(PALACE + '/_ops/stigmergy/app/package.json');
const { chromium } = require('playwright');
const ANSWERS = PALACE + '/_ops/loudon-eval/answers.js';
const ROUGH = PALACE + '/Palace development/Pheromone Trail/proofs/2026-11-06-daily-page/the-palaces-own-trail.html';
const SHOTS = process.argv[2];

const measure = async (p) => p.evaluate(async () => {
  await window.PalaceAnswers.submit({ page: 'Pheromone Trail', task: 'guard-proof', answers: { a: 1 }, text: 'proof' });
  const box = document.getElementById('palace-answers-box');
  const btn = [...box.querySelectorAll('button')].find((b) => b.textContent === 'Copy all');
  const rgb = (s) => s.match(/[\d.]+/g).slice(0, 3).map(Number);
  const L = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [L(rgb(a)), L(rgb(b))].sort((m, n) => n - m); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
  const bs = getComputedStyle(box), ks = getComputedStyle(btn);
  return { panel: [bs.color, bs.backgroundColor], panelRatio: ratio(bs.color, bs.backgroundColor), buttonRatio: ratio(ks.color, ks.backgroundColor) };
});

const b = await chromium.launch();
const cases = [
  ['ink only, light (the rough\'s old bug)', '--ink:#e7e4dc'],
  ['ink only, dark', '--ink:#222'],
  ['paper only, dark', '--paper:#16171a'],
  ['paper only, light', '--paper:#fafafa'],
  ['both set (page keeps its own)', '--ink:#e7e4dc;--paper:#1e2024'],
  ['neither set (defaults)', ''],
  ['ink set by var()', '--x:#eee;--ink:var(--x)'],
];
let fail = 0;
for (const [name, vars] of cases) {
  const p = await b.newPage();
  await p.setContent(`<html><head><style>:root{${vars}}</style></head><body><p>page</p></body></html>`);
  await p.addScriptTag({ path: ANSWERS });
  const r = await measure(p);
  const ok = r.panelRatio >= 4.5 && r.buttonRatio >= 4.5;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: panel ${r.panel.join(' on ')} = ${r.panelRatio}:1, button ${r.buttonRatio}:1`);
  await p.close();
}
// The real rough, its --paper taken away, as it was when the bug was found.
const p = await b.newPage({ viewport: { width: 1000, height: 800 } });
await p.goto(pathToFileURL(ROUGH).href);
await p.waitForFunction(() => window.PalaceAnswers);
await p.evaluate(() => { for (const s of document.styleSheets) for (const r of s.cssRules) if (r.selectorText === ':root') r.style.removeProperty('--paper'); });
const r = await measure(p);
const ok = r.panelRatio >= 4.5 && r.buttonRatio >= 4.5;
if (!ok) fail++;
console.log(`${ok ? 'PASS' : 'FAIL'}  the Pheromone Trail rough, --paper removed: panel ${r.panel.join(' on ')} = ${r.panelRatio}:1, button ${r.buttonRatio}:1`);
if (SHOTS) await p.screenshot({ path: SHOTS });
await b.close();
process.exit(fail ? 1 : 0);
