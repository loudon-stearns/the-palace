// framed-check.mjs — load a vessel page the way the board does (an opaque
// sandbox="allow-scripts" iframe, no same-origin), collect every console error,
// count how many canvas pixels are not background, and photograph it.
//   node verify/framed-check.mjs <page.html> <out.png> [w h]   (playwright from the deck's own node_modules)
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const PALACE = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(resolve(PALACE, '_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');
const [page, out, W = '900', H = '700'] = process.argv.slice(2);
const html = readFileSync(page, 'utf8');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +W, height: +H } });
const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', e => errs.push(String(e)));
await p.setContent(`<body style="margin:0;background:#000"><iframe id=f sandbox="allow-scripts" style="width:${W}px;height:${H}px;border:0"></iframe></body>`);
await p.$eval('#f', (f, h) => { f.srcdoc = h; }, html);
await p.waitForTimeout(2500);
const fr = p.frames().find(f => f !== p.mainFrame());
const lit = await fr.evaluate(() => {
  const c = document.querySelector('canvas'); if (!c) return { canvas: false };
  let ctx2 = null; try { ctx2 = c.getContext('2d'); } catch {}
  if (!ctx2) return { canvas: true, webgl: true, w: c.width, h: c.height };
  const d = ctx2.getImageData(0, 0, c.width, c.height).data; const bg = [d[0], d[1], d[2]]; let n = 0;
  for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i]-bg[0]) + Math.abs(d[i+1]-bg[1]) + Math.abs(d[i+2]-bg[2]) > 30) n++;
  return { canvas: true, w: c.width, h: c.height, litFraction: +(n / (c.width * c.height)).toFixed(4) };
});
await p.screenshot({ path: out });
console.log(JSON.stringify({ page, errors: errs, ...lit }));
await b.close();
