// Photographs every frame of "born on the floor", alone and inside the rich face.
// usage: node SUBSTRATE/workshop/shoot.mjs <rich-server url> [tag]
import { chromium } from '../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const base = process.argv[2].replace(/\/$/, ''), tag = process.argv[3] || 'shot';
const out = path.join(HERE, 'screens'); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const errors = [];
const pg = await (await b.newContext({ viewport: { width: 1180, height: 860 } })).newPage();
pg.on('pageerror', e => errors.push('piece: ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await pg.goto(base + '/' + encodeURI('SUBSTRATE/SUBSTRATE — rich — born on the floor.html')); await pg.waitForTimeout(1500);
const N = await pg.evaluate(() => window.__bf.N);
for (let i = 0; i < N; i++) {
  await pg.waitForTimeout(1700);
  await pg.screenshot({ path: path.join(out, `${tag}-frame-${String(i + 1).padStart(2, '0')}.png`) });
  if (i < N - 1) await pg.keyboard.press('ArrowRight');
}
// sound: turn it on, step through, and read the context back
const sd = await (await b.newContext({ viewport: { width: 1180, height: 860 } })).newPage();
sd.on("pageerror", e => errors.push("sound: " + e.message));
await sd.goto(base + "/" + encodeURI("SUBSTRATE/SUBSTRATE — rich — born on the floor.html")); await sd.waitForTimeout(800);
console.log("before any click, audio context:", await sd.evaluate(() => window.__bf.player.ctx ? window.__bf.player.ctx.state : "none"));
for (let i = 0; i < 3; i++) await sd.keyboard.press("ArrowRight");
console.log("after three steps, sound never asked for:", await sd.evaluate(() => window.__bf.player.ctx ? window.__bf.player.ctx.state : "none"));
await sd.click("#snd"); await sd.waitForTimeout(1500);
for (let i = 3; i < N - 1; i++) { await sd.keyboard.press("ArrowRight"); await sd.waitForTimeout(120); }
console.log("sound on, stepped to the end:", JSON.stringify(await sd.evaluate(() => ({ state: window.__bf.player.ctx.state, buffers: window.__bf.player.bufs.size, button: document.getElementById("snd").textContent }))));
await sd.screenshot({ path: path.join(out, `${tag}-sound-on-last.png`) });
await sd.click("#snd"); await sd.waitForTimeout(300);
console.log("sound off again:", await sd.evaluate(() => window.__bf.player.ctx.state));
// narrow
const nr = await (await b.newContext({ viewport: { width: 620, height: 700 } })).newPage();
await nr.goto(base + '/' + encodeURI('SUBSTRATE/SUBSTRATE — rich — born on the floor.html')); await nr.waitForTimeout(1200);
for (let i = 0; i < 12; i++) await nr.keyboard.press('ArrowRight');
await nr.waitForTimeout(1500); await nr.screenshot({ path: path.join(out, `${tag}-narrow-frame-13.png`) });
// in the face
const fc = await (await b.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();
fc.on('pageerror', e => errors.push('face: ' + e.message)); fc.on('console', m => { if (m.type() === 'error') errors.push('face console: ' + m.text()); });
await fc.goto(base + '/?entry=SUBSTRATE'); await fc.waitForTimeout(4000);
const fr = fc.locator("iframe").first(); await fr.scrollIntoViewIfNeeded(); await fc.mouse.wheel(0, 250); await fc.waitForTimeout(3500);
console.log("frames", await fc.locator("iframe").count(), "first frame box", JSON.stringify(await fr.boundingBox()));
await fc.screenshot({ path: path.join(out, `${tag}-face-piece.png`) });
await b.close();
console.log('errors', errors);
