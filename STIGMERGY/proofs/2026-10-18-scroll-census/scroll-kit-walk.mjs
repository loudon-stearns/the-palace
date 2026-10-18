// Headless walk of the Dissolutions scroll with the piece kit: does each proof's
// frame fit its content, does the kit load in each, and does pressing Play make
// the deck hear it (the rich:play event)?
//
//   node scroll-kit-walk.mjs <palace-root> <scratch-base-url> <out-dir>
//
// <scratch-base-url> is a scratch deck on its own port, for example
// http://127.0.0.1:5197. It must not be the live deck: the walk refuses :5173
// and any host that is not loopback. <palace-root> is only used to find
// Playwright (<root>/_ops/stigmergy/app). The walk reads the page and clicks
// Play inside a sandboxed frame; it writes nothing but a screenshot to <out-dir>.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const [rootArg, baseArg, outArg] = process.argv.slice(2);
if (!rootArg || !baseArg || !outArg) {
  console.error('usage: node scroll-kit-walk.mjs <palace-root> <scratch-base-url> <out-dir>');
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
await page.evaluate(() => { window.__plays = 0; document.addEventListener('rich:play', () => { window.__plays += 1; }); });
const out = [];
for (let i = 0; i < 2; i++) {
  const h = page.locator('[data-testid=heavy-artifact]').nth(i);
  for (let k = 0; k < 20 && (await h.count()) === 0; k++) { await page.evaluate(() => window.scrollBy(0, 600)); await page.waitForTimeout(400); }
  await h.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  const frame = h.locator('iframe');
  const fh = await frame.evaluate((f) => Math.round(f.getBoundingClientRect().height));
  const f = page.frames().find((x) => x.url().includes(encodeURIComponent(await_name(i))));
  const content = f ? await f.evaluate(() => Math.ceil(document.documentElement.scrollHeight)) : null;
  const kit = f ? await f.evaluate(() => !!window.RichPiece) : null;
  const err = await h.locator('[data-testid=artifact-piece-error]').count();
  out.push({ i, frameHeight: fh, contentScrollHeight: content, kit, errorShown: err });
  if (i === 0) await page.screenshot({ path: `${OUT}/kit-proof.png` });
}
function await_name(i) { return i === 0 ? 'one-curve-three-doorways-2.html' : 'one-curve-three-doorways.html'; }
// Press the first proof's Play and see the deck hear it.
await page.locator('[data-testid=heavy-artifact]').nth(0).scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
const play = page.frameLocator('[data-testid=heavy-artifact] >> nth=0 >> iframe').getByRole('button', { name: 'Play' });
await play.click({ timeout: 8000 }).catch((e) => out.push({ playClick: String(e).slice(0, 120) }));
await page.waitForTimeout(800);
out.push({ deckHeardPlays: await page.evaluate(() => window.__plays) });
console.log(JSON.stringify(out, null, 1));
await browser.close();
