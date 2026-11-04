#!/usr/bin/env node
// title: Tone.js — proof — rich checks
// born: 2026-11-04
// links: [[Tone.js]] (connects-to · proof) · runs the battery inside "Tone.js — rich — sixty pushes.html"
// forward_vector: I re-run the sixty-pushes test headless, on the piece's own engine, in Chromium's Web Audio, and
//   say whether each row still reads as it did; with --bake I write the numbers the piece shows.
//
// node "Shop/Tone.js/Tone.js — proof — rich checks.mjs" [--bake]
// Exit 1 if any row's verdict differs from the recorded one (rows 1–5, 7, 8 pass; 6, 9, 10 fail), or the
// piece leaves an AudioContext running before a click.
import { createRequire } from 'node:module';
import http from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const PIECE = join(here, 'Tone.js — rich — sixty pushes.html');
const require = createRequire(join(root, '_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');
const EXPECT = { 1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 7: true, 8: true, 9: false, 10: false };

const srv = http.createServer((q, r) => { r.setHeader('content-type', 'text/html; charset=utf-8'); r.end(readFileSync(PIECE)); }).listen(0, '127.0.0.1');
await new Promise((r) => srv.on('listening', r));
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.addInitScript(() => { const AC = window.AudioContext; window.__acs = 0; window.AudioContext = class extends AC { constructor(...a) { super(...a); window.__acs++; } }; });
await page.goto(`http://127.0.0.1:${srv.address().port}/`);
await page.waitForTimeout(500);
const acsBefore = await page.evaluate(() => window.__acs);
const t0 = Date.now();
const rows = await page.evaluate(() => BATTERY.run());
const secs = ((Date.now() - t0) / 1000).toFixed(1);
await browser.close(); srv.close();

let bad = 0;
for (const r of rows) {
  const ok = EXPECT[r.id] === r.pass;
  if (!ok) bad++;
  console.log(`${String(r.id).padStart(2)}  ${r.pass ? 'pass' : 'fail'}${ok ? '' : '  <- expected ' + (EXPECT[r.id] ? 'pass' : 'fail')}  ${r.what}\n      per sample: ${r.ws}\n      pushed:     ${r.push}`);
}
console.log(`\nAudioContexts before a click: ${acsBefore} (must be 0) · page errors: ${errors.length ? errors.join(' | ') : 'none'} · ${secs} s`);
if (acsBefore) bad++;
if (errors.length) bad++;
if (process.argv.includes('--bake')) {
  const html = readFileSync(PIECE, 'utf8');
  const baked = { date: new Date().toISOString().slice(0, 10), where: 'headless Chromium (playwright), OfflineAudioContext 48 kHz', rows };
  const next = html.replace(/const BAKED = .*; \/\/ BAKED: written by the check, --bake/, `const BAKED = ${JSON.stringify(baked)}; // BAKED: written by the check, --bake`);
  if (next === html) { console.error('could not find the BAKED line'); process.exit(1); }
  writeFileSync(PIECE, next); console.log('baked into the piece');
}
process.exit(bad ? 1 : 0);
