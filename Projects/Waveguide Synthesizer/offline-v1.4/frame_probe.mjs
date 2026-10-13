// Loads study v1.4 inside an iframe sandboxed exactly as the board's ArtifactSlot
// does (sandbox="allow-scripts", 480 px tall), clicks the start door once,
// then holds the bow button for two seconds and reads the page's own output
// meter, and screenshots the bowed string in strobe view. Runs twice: worklet
// normal, then worklet forced to fail (the main-thread fallback). Also holds
// the B key. Needs Google Chrome + the stigmergy app's playwright.
// usage: node frame_probe.mjs
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const INST = path.join(HERE, '..', 'study-v1.4-bow', 'index.html');
const HOST = '<body style="margin:0"><iframe src="/inst.html" sandbox="allow-scripts" style="width:900px;height:480px;border:0"></iframe></body>';
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html' });
  r.end(q.url.startsWith('/inst.html') ? fs.readFileSync(INST) : HOST);
}).listen(5897);
const b = await chromium.launch({ channel: 'chrome' });
const meter = async (fr, ms) => { let pk = 0; for (let i = 0; i < ms / 50; i++) { await new Promise(r => setTimeout(r, 50)); pk = Math.max(pk, await fr.evaluate(() => meterPeak)); } return +(20 * Math.log10(pk + 1e-9)).toFixed(1); };
for (const breakIt of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 900, height: 480 } });
  if (breakIt) await ctx.addInitScript(() => { if (window.AudioWorklet)
    AudioWorklet.prototype.addModule = () => Promise.reject(new DOMException('blocked for test', 'AbortError')); });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:5897/'); await pg.waitForTimeout(2000);
  const fr = pg.frames()[1];
  await pg.mouse.click(450, 240);                       // the start door: starts the sound, plucks
  const pluckPeak = await meter(fr, 1500);
  await fr.waitForTimeout(2500);                        // let the pluck die away
  const box = await (await fr.$('#bow')).boundingBox();
  const visible = box && box.y + box.height <= 480;
  await pg.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await pg.mouse.down();
  const bowPeak = await meter(fr, 1800);
  if (!breakIt) await pg.screenshot({ path: path.join(HERE, 'board-frame-bowing.png') });
  await pg.mouse.up();
  await fr.waitForTimeout(2500);
  await fr.focus('body').catch(() => {});
  await pg.keyboard.down('b'); const keyPeak = await meter(fr, 1200); await pg.keyboard.up('b');
  const st = await fr.evaluate(() => ({ engine, state: audioCtx && audioCtx.state, bowing }));
  console.log(JSON.stringify({ worklet: breakIt ? 'forced to fail' : 'normal', engine: st.engine, ctx: st.state,
    bow_button_in_frame: visible, bow_button_y: box && Math.round(box.y), pluck_peak_dbfs: pluckPeak,
    bow_held_peak_dbfs: bowPeak, b_key_peak_dbfs: keyPeak, bowing_after_release: st.bowing, page_errors: errs }));
  await ctx.close();
}
await b.close(); srv.close();
