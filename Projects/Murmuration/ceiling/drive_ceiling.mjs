// Drives ceiling-test.html in headless Chrome: presses Start, lets the whole climb run in real
// time, takes a still mid-climb and one at the end, and saves the page's own report.
// Headless Chrome has no sound card, so this proves the page runs and measures; it is not the
// ear test, and its numbers are this Mac's Chrome only.
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright-core/index.mjs';
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), url = 'file://' + path.join(here, '..', 'ceiling-test.html');
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(url);
await page.click('#go');
await page.waitForTimeout(27000);
await page.screenshot({ path: path.join(here, 'ceiling-midclimb.png') });
await page.waitForFunction(() => document.getElementById('report').value.length > 0, null, { timeout: 90000 }).catch(() => errs.push('climb did not finish in time'));
await page.screenshot({ path: path.join(here, 'ceiling-done.png') });
const rep = await page.evaluate(() => document.getElementById('report').value);
fs.writeFileSync(path.join(here, 'ceiling-headless-chrome.json'), JSON.stringify({ report: rep ? JSON.parse(rep) : null, errors: errs }, null, 1));
console.log(rep, '\nerrors:', errs);
await browser.close();
