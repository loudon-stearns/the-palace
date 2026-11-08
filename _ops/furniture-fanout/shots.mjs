#!/usr/bin/env node
// shots.mjs — the sample, photographed: each page at 1130 px, scrollbars shown, scrolled to its first control.
//   node _ops/furniture-fanout/shots.mjs <out-dir> <tag> <page> [<page> …]   →  <out-dir>/<n>-<tag>.png
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const require = createRequire(join(ROOT, '_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');

const [out, tag, ...pages] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--mute-audio'] });
const ctx = await browser.newContext({ viewport: { width: 1130, height: 760 }, deviceScaleFactor: 1 });
let n = 0;
for (const p of pages) {
  n++;
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(join(ROOT, p)).href, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const el = document.querySelector('input[type=range], select, textarea, input[type=checkbox], details, input');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(out, `${n}-${tag}.png`) });
  await page.close();
}
await browser.close();
