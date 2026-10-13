// Lays the slider_sheet.mjs photos out as one page, slider by slider, low end
// beside high end, and photographs it: every-slider-shows.png.
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const d = JSON.parse(fs.readFileSync(path.join(HERE, 'slider-sheet.json')));
const SEE = { freq: 'beads: one per sample of the delay line', bright: 'the string’s colour, ember to white-hot',
  bridge: 'the brass block: soft and swollen, or hard and lit', nut: 'the steel post: soft and swollen, or hard and lit',
  stiff: 'the string’s thickness, wire to rod', pick: 'the ring slides', bspd: 'the arrow’s length',
  bfrc: 'the bow’s width and glow', bpos: 'where the bow sits' };
const img = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(HERE, f)).toString('base64');
const ids = [...new Set(d.shots.map(s => s.id))];
let rows = '';
for (const id of ids) {
  const [lo, hi] = ['lo', 'hi'].map(t => d.shots.find(s => s.id === id && s.tag === t));
  rows += `<div class="row"><div class="name">${lo.name}<small>${SEE[id]}</small></div>
    <figure><img src="${img(lo.file)}"><figcaption>${lo.val}</figcaption></figure>
    <figure><img src="${img(hi.file)}"><figcaption>${hi.val}</figcaption></figure></div>`;
}
const html = `<html><body style="margin:0;background:#0b0d10;color:#cfd3d8;font-family:Menlo,monospace">
<style>.row{display:flex;align-items:center;gap:10px;padding:6px 14px;border-bottom:1px solid #1e242b}
.name{width:190px;font-size:15px;color:#e8e2d4}.name small{display:block;font-size:11px;opacity:.6;margin-top:4px;line-height:1.4}
figure{margin:0}img{width:468px;display:block;border:1px solid #1e242b}figcaption{font-size:11px;opacity:.6;text-align:center}
h1{font-size:15px;font-weight:normal;padding:12px 14px 2px;margin:0}p{font-size:11px;opacity:.6;margin:0 14px 8px}</style>
<h1>waveguide study v1.6 · every slider shows</h1><p>each row: one slider at its low end (left) and high end (right), everything else at default. string plucked fresh or bowed for every photo.</p>
${rows}</body></html>`;
const b = await chromium.launch({ channel: 'chrome' });
const pg = await b.newPage({ viewport: { width: 1180, height: 900 } });
await pg.setContent(html); await pg.waitForTimeout(300);
await pg.screenshot({ path: path.join(HERE, 'every-slider-shows.png'), fullPage: true });
await b.close();
