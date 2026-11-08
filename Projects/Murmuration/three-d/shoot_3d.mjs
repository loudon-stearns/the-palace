// Drives murmuration-3d.html in headless Chrome: steps the demo performance frame by frame,
// takes stills at four moments, and times step+draw per frame at 60/120/240 birds.
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright-core/index.mjs';
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), page_ = 'file://' + path.join(here, '..', 'murmuration-3d.html');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.addInitScript(() => { window.__noLoop = true; });
await page.goto(page_);
const report = { shots: [], timing: [], errors: errs };
const at = async (sec, name, setup) => {
  if (setup) await page.evaluate(setup);
  const now = await page.evaluate(() => window.__t || 0), n = Math.round((sec - now) * 60);
  await page.evaluate(n => { window.__murm.stepN(n); window.__t = (window.__t || 0) + n / 60; }, n);
  await page.evaluate(() => { window.__murm.cam.yaw = -0.55 + (window.__t || 0) * 0.066; window.__murm.stepN(0); });
  const phi = await page.evaluate(() => window.__murm.phi);
  const file = `3d-${name}.png`; await page.screenshot({ path: path.join(here, '..', file) });
  report.shots.push({ sec, name, phi: +phi.toFixed(3), file }); console.log(sec, name, phi.toFixed(2));
};
await at(5, 'melted');
await at(21, 'ordered');
await at(22.9, 'strike');
await at(33, 'density', () => window.__murm.setMap('density'));
for (const N of [60, 120, 240]) {
  const ms = await page.evaluate(async N => { document.getElementById('cN').value = N; document.getElementById('cN').dispatchEvent(new Event('change')); window.__murm.stepN(120); const t0 = performance.now(); window.__murm.stepN(0); for (let i = 0; i < 60; i++) window.__murm.stepN(1); return (performance.now() - t0) / 60; }, N);
  report.timing.push({ N, msPerFrame: +ms.toFixed(2) }); console.log('N', N, ms.toFixed(2), 'ms/frame (step + draw, headless)');
}
fs.writeFileSync(path.join(here, '3d-report.json'), JSON.stringify(report, null, 1));
console.log('errors:', errs);
await browser.close();
