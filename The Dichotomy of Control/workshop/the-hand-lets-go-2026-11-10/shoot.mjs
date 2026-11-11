// workshop: walks the piece in headless Chromium and photographs its main moments at desk and phone width.
// run from the worktree root, with the preview up:  node "<this file>" <piece-origin-port>
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(process.cwd(), '_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');
const port = process.argv[2];
const url = `http://127.0.0.1:${port}/` + encodeURI('The Dichotomy of Control/The Dichotomy of Control — rich — the hand lets go.html');
const browser = await chromium.launch();
const errors = [];
for (const [name, vw, vh, touch] of [['desk', 1130, 900, false], ['phone', 390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(name + ': ' + m.text()); });
  page.on('pageerror', (e) => errors.push(name + ': ' + e.message));
  const res = await page.goto(url); if (!res.ok()) throw new Error('piece not served: ' + res.status());
  await page.waitForTimeout(1200);
  const shot = async (n) => page.screenshot({ path: join(here, `${name} — ${n}.png`), fullPage: true });
  await page.fill('#word', 'the email I owe');
  await page.waitForTimeout(400); await shot('1 the question');
  await page.click('#next'); await page.waitForTimeout(1300); await shot('2 before the push');
  const pad = await page.locator('#pad').boundingBox();
  await page.mouse.move(pad.x + pad.width / 2, pad.y + pad.height / 2);
  await page.mouse.down(); await page.waitForTimeout(6500); await shot('3 pushing, six seconds');
  await page.waitForTimeout(13000); await shot('4 pushing, nineteen seconds');
  await page.mouse.up(); await page.waitForTimeout(4200); await shot('5 let go');
  await page.click('#next'); await page.waitForTimeout(900);
  await page.click('#next'); await page.waitForTimeout(900); await shot('6 widen');
  await page.mouse.move(pad.x + pad.width / 2, (await page.locator('#pad').boundingBox()).y + 20);
  await page.mouse.down(); await page.waitForTimeout(2600); await shot('7 pushing again');
  await page.mouse.up(); await page.waitForTimeout(3000);
  await page.click('#next'); await page.waitForTimeout(700);
  await page.click('#next'); await page.waitForTimeout(900);
  await page.fill('#act', 'write two lines and send it'); await shot('8 hands free');
  await page.click('#next'); await page.waitForTimeout(900); await shot('9 the end');
  await page.click('details summary'); await page.waitForTimeout(300); await shot('10 the note open');
  await ctx.close();
}
await browser.close();
console.log(errors.length ? 'console errors:\n' + errors.join('\n') : 'console clean');
