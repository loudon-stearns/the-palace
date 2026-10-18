// Screenshot and read-back of the scroll's warmth: the hero backdrop behind the
// Dissolutions scroll, and the plain lines under Plan and under Standing Orders.
// Warmth was built on the branch claude/scroll-warmth (e9ab3a11) and merged to
// main in 06a79f3c; against a tree from before that the walk finds no backdrop
// and no lines, and says so with nulls.
//
//   node warmth-shot.mjs <palace-root> <scratch-base-url> <out-dir>
//
// <scratch-base-url> is a scratch deck on its own port, for example
// http://127.0.0.1:5197. It must not be the live deck: the walk refuses :5173
// and any host that is not loopback. <palace-root> is only used to find
// Playwright (<root>/_ops/stigmergy/app). The walk reads the page and writes
// nothing but a screenshot to <out-dir>.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const [rootArg, baseArg, outArg] = process.argv.slice(2);
if (!rootArg || !baseArg || !outArg) {
  console.error('usage: node warmth-shot.mjs <palace-root> <scratch-base-url> <out-dir>');
  process.exit(2);
}
const BASE = new URL(baseArg);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(BASE.hostname) || BASE.port === '5173') {
  console.error('refusing: aim this at a scratch deck on its own loopback port, never :5173 or a remote host.');
  process.exit(2);
}
const APP = `${resolve(rootArg)}/_ops/stigmergy/app`;
const require = createRequire(`${APP}/package.json`);
const { chromium } = require('@playwright/test');
const OUT = resolve(outArg);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(`${BASE.origin}/?deck=STATE&entry=Dissolutions.md&scroll=Dissolutions`);
await page.waitForSelector('[data-testid=scroll-now-fold]');
await page.waitForSelector('[data-testid=scroll-hero-backdrop]', { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(1500);
const hero = await page.$eval('[data-testid=scroll-hero-backdrop]', (el) => getComputedStyle(el).backgroundImage.slice(0, 160)).catch(() => null);
const notes = await page.$$eval('[data-testid=scroll-view] div', (ds) => ds.map((d) => d.textContent).filter((t) => /^The (route|rules of the road)/.test(t)));
await page.screenshot({ path: `${OUT}/warmth-top.png` });
console.log(JSON.stringify({ hero, notes }, null, 1));
await browser.close();
