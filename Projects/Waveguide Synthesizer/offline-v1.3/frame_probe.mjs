// Loads study v1.3 inside an iframe sandboxed exactly as the board's ArtifactSlot
// does (sandbox="allow-scripts", 480 px tall), clicks once, and reads the page's
// own output meter. Runs twice: worklet normal, then worklet forced to fail, so
// the main-thread fallback is proven too. Needs Google Chrome + the stigmergy
// app's playwright.  usage: node frame_probe.mjs
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const INST = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'study-v1.3-audible', 'index.html');
const HOST = '<body style="margin:0"><iframe src="/inst.html" sandbox="allow-scripts" style="width:900px;height:480px;border:0"></iframe></body>';
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html' });
  r.end(q.url.startsWith('/inst.html') ? fs.readFileSync(decodeURIComponent(INST)) : HOST);
}).listen(5896);
const b = await chromium.launch({ channel: 'chrome' });
for (const breakIt of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 900, height: 480 } });
  if (breakIt) await ctx.addInitScript(() => { if (window.AudioWorklet)
    AudioWorklet.prototype.addModule = () => Promise.reject(new DOMException('blocked for test', 'AbortError')); });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:5896/'); await pg.waitForTimeout(2000);
  const fr = pg.frames()[1];
  await pg.mouse.click(450, 240);             // the one click, on the start door
  let peak = 0;
  for (let i = 0; i < 30; i++) { await pg.waitForTimeout(50); peak = Math.max(peak, await fr.evaluate(() => meterPeak)); }
  const st = await fr.evaluate(() => ({ engine, state: audioCtx && audioCtx.state }));
  console.log(JSON.stringify({ worklet: breakIt ? 'forced to fail' : 'normal', ...st,
    peak_dbfs: +(20 * Math.log10(peak)).toFixed(1), page_errors: errs }));
  await ctx.close();
}
await b.close(); srv.close();
