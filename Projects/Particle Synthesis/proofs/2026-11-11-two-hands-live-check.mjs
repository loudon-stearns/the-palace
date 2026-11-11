// Particle Synthesis · 2026-11-11 · the live page, driven like a player in headless Chrome (no speakers):
// start, play keys from all three rows, hold one to pour, record, stop, and read back what the page counted.
// Run: node 2026-11-11-two-hands-live-check.mjs
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright-core/index.mjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-webgpu', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1000, height: 1100 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + path.join(here, '2026-11-11-two-hands-of-ice.html'));
await page.click('#go'); await page.waitForTimeout(800);
await page.click('#rec');
const tap = async k => { await page.keyboard.down(k); await page.waitForTimeout(60); await page.keyboard.up(k); await page.waitForTimeout(240); };
for (const k of ['KeyZ', 'KeyB', 'Slash', 'KeyQ', 'KeyT', 'KeyP', 'KeyA', 'KeyG', 'Semicolon']) await tap(k);
await page.keyboard.down('KeyH'); await page.waitForTimeout(1500); await page.keyboard.up('KeyH');   // a pour
await page.evaluate(() => midiNote(64, 100)); await page.waitForTimeout(80); await page.evaluate(() => midiNote(64, 0));
await page.waitForTimeout(2500);
await page.click('#rec');
const take = await page.textContent('#take');
const status = await page.textContent('#status');
await page.screenshot({ path: path.join(here, '2026-11-11-two-hands-live.png') });
await page.click('#go');
console.log(JSON.stringify({ status, take, errors: errs }, null, 1));
await browser.close();
