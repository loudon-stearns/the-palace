// Rasterise an SVG to a PNG with a transparent ground (headless Chromium, through the Playwright
// that STIGMERGY's app already has). The labels are set in the Drafting Table's IBM Plex Mono, loaded
// from the design system's own font files.   node rasterize.mjs in.svg out.png W H
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const require = createRequire(resolve(ROOT, '_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');
const [svgPath, out, W, H] = process.argv.slice(2);
const fonts = pathToFileURL(resolve(ROOT, '_ops/drafting-table/design-system/fonts.css')).href;
const html = `<!doctype html><html><head><link rel="stylesheet" href="${fonts}">
<style>html,body{margin:0;background:transparent}</style></head><body>${readFileSync(svgPath, 'utf8')}</body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +W, height: +H } });
const page = out.replace(/\.png$/, '.html');
writeFileSync(page, html);
await p.goto(pathToFileURL(page).href, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
const ok = await p.evaluate(() => document.fonts.check('600 20px "IBM Plex Mono"'));
await p.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: +W, height: +H } });
await b.close();
console.log('WROTE', out, 'plex-mono loaded:', ok);
