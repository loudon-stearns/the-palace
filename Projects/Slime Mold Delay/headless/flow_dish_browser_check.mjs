// Slime Mold Delay — run the flow dish page in headless Chromium and see that it works.
// Presses START, then THE MUSIC MOVES, taps the output for peak level and non-finite samples,
// counts forks, and grabs the dish at three moments. Proves it runs, not that it sounds right.
// Run: node flow_dish_browser_check.mjs   (uses the playwright install under _ops/stigmergy/app)
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, '../../../_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 1100 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
// tap everything that reaches the speakers
await page.addInitScript(() => {
  const orig = AudioNode.prototype.connect;
  window.__tap = { peak: 0, bad: 0 };
  AudioNode.prototype.connect = function (dest, ...rest) {
    if (dest instanceof AudioDestinationNode && !this.__tapped) {
      this.__tapped = true;
      const an = this.context.createAnalyser(); an.fftSize = 2048; orig.call(this, an);
      const buf = new Float32Array(an.fftSize);
      setInterval(() => { an.getFloatTimeDomainData(buf);
        for (const x of buf) { if (!Number.isFinite(x)) window.__tap.bad++; else window.__tap.peak = Math.max(window.__tap.peak, Math.abs(x)); } }, 40);
    }
    return orig.call(this, dest, ...rest);
  };
});
await page.goto(pathToFileURL(join(here, '..', 'slime-mold-flow-dish.html')).href);
await page.click('#start');
await page.click('#demo');
const shots = [];
const t0 = Date.now();
for (const at of [12, 21, 29]) {
  await page.waitForTimeout(at * 1000 - (Date.now() - t0));
  const f = join(here, `.shot-${at}.png`); await page.locator('#cv').screenshot({ path: f }); shots.push(f);
}
const r = await page.evaluate(() => {
  const E = window.slimeDish.engine;
  return { tap: window.__tap, counts: E.counts, tubes: E.tubes.length, forksNow: E.nodes.filter(n => n.kind === 'branch').length,
    tick: E.tick, rate: E.tick / ((performance.now()) / 1000), log: document.getElementById('log').textContent.split('\n').slice(0, 14) };
});
r.peak_dbfs = +(20 * Math.log10(r.tap.peak || 1e-9)).toFixed(1); r.errors = errors;
console.log(JSON.stringify(r, null, 1));
writeFileSync(join(here, '2026-10-13-flow-dish-sprout-browser.json'), JSON.stringify(r, null, 1));
await browser.close();
console.log(shots.join('\n'));
