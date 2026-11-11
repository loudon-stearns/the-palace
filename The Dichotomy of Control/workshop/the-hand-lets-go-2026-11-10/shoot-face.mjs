// workshop: photographs the top of the whole rich face, with the piece framed in it. run: node "<this file>" <face-port>
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(process.cwd(), '_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch();
const errors = [];
for (const [name, vw, vh] of [['desk', 1400, 1500], ['phone', 390, 1700]]) {
  const page = await (await browser.newContext({ viewport: { width: vw, height: vh } })).newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(name + ': ' + m.text()); });
  await page.goto(`http://127.0.0.1:${process.argv[2]}/?entry=The%20Dichotomy%20of%20Control&review=0`);
  await page.waitForTimeout(4000);
  const fr = page.locator('iframe').first(); await fr.scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy(0, -260));
  await page.waitForTimeout(800);
  const b = await fr.boundingBox(); console.log(name, 'frames', await page.locator('iframe').count(), 'first frame', Math.round(b.width) + '×' + Math.round(b.height));
  await page.screenshot({ path: join(here, `${name} — 0 in the face.png`) });
}
await browser.close();
console.log(errors.length ? 'console errors:\n' + errors.join('\n') : 'console clean');
