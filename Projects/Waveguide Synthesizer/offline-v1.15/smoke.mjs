// Study v1.15 in Chrome: start it, pluck at A5 (the slider's top) and at G3, and photograph the
// string 0.4 s after each pluck, to see that the high note is still moving.
// usage: node smoke.mjs
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const out = { errors: {} };
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [port, dir] of [[5951, 'study-v1.14-the-lesson-fits'], [5952, 'study-v1.15-even-loss']]) {
  const PAGE = path.join(HERE, '..', dir, 'index.html');
  const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(port);
  const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock.js') });
  const errs = out.errors[dir] = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(`http://localhost:${port}/`); await pg.waitForTimeout(1000);
  await pg.click('#gateBtn'); await pg.waitForTimeout(400);
  for (const hz of [880, 196]) {
    await pg.evaluate((hz) => { const s = $('freq'); s.value = hz; s.dispatchEvent(new Event('input')); }, hz);
    await pg.waitForTimeout(300);
    await pg.keyboard.press('Space'); await pg.waitForTimeout(400);
    const v = dir.split('-')[1];
    await pg.screenshot({ path: path.join(HERE, `still-${v}-${hz}hz-0.4s.png`) });
    out[v + ' ' + hz] = await pg.evaluate(() => latestWave ? Math.max(...Array.from(latestWave.wave || latestWave).map(Math.abs)) : null).catch(e => 'n/a: ' + e.message);
  }
  await pg.close(); srv.close();
}
await b.close();
console.log(JSON.stringify(out, null, 1)); fs.writeFileSync(path.join(HERE, 'smoke.json'), JSON.stringify(out, null, 1));
