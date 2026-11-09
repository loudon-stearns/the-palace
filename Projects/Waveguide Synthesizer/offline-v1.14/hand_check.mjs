// At 844x390: take the pitch stop by hand on the slider lent to the docked card,
// then leave the lesson and check the panel, its eleven sliders and the camera
// come back. At 1280x720 (a tall screen) check the lesson does not dock at all.
// usage: node hand_check.mjs
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', 'study-v1.14-the-lesson-fits', 'index.html');
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5942);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const out = { errors: [] };
for (const [w, h] of [[844, 390], [1280, 720]]) {
  const pg = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock.js') });
  pg.on('pageerror', e => out.errors.push(e.message));
  await pg.goto('http://localhost:5942/'); await pg.waitForTimeout(1000);
  await pg.click('#gateBtn'); await pg.waitForTimeout(400);
  await pg.keyboard.press('l'); await pg.waitForTimeout(400);
  await pg.click('#lsNext'); await pg.click('#lsNext'); await pg.click('#lsNext'); await pg.waitForTimeout(500);
  const r = await pg.locator('#freq').boundingBox();
  const before = await pg.evaluate(() => ({ docked: document.body.classList.contains('dock'), inCard: !!$('lsSlot').querySelector('#freq'), freq: +$('freq').value, engineFreq: params && params.freq }));
  await pg.mouse.move(r.x + 4, r.y + r.height / 2); await pg.mouse.down();
  for (let k = 1; k <= 30; k++) { await pg.mouse.move(r.x + 4 + (r.width - 8) * k / 30, r.y + r.height / 2); await pg.waitForTimeout(60); }
  for (let k = 29; k >= 0; k--) { await pg.mouse.move(r.x + 4 + (r.width - 8) * k / 30, r.y + r.height / 2); await pg.waitForTimeout(40); }
  await pg.mouse.up(); await pg.waitForTimeout(300);
  const during = await pg.evaluate(() => ({ stop: LESSON[lesson.i].name, ticked: lesson.done.has(lesson.i), got: $('lsGot').textContent, freqAfter: +$('freq').value, readout: $('vFreq').textContent }));
  await pg.click('#lsQuit'); await pg.waitForTimeout(400);
  const after = await pg.evaluate(() => ({ docked: document.body.classList.contains('dock'), dock, sliders: $('sliders').querySelectorAll('label').length,
    order: [...$('sliders').querySelectorAll('input')].map(i => i.id).join(','), ui: getComputedStyle($('ui')).display, view: camera.view && camera.view.enabled }));
  out[w + 'x' + h] = { before, during, after };
  await pg.close();
}
await b.close(); srv.close();
console.log(JSON.stringify(out, null, 1)); fs.writeFileSync(path.join(HERE, 'hand-check.json'), JSON.stringify(out, null, 1));
