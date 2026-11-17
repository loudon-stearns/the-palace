// Is v1.18's tabled soundboard the same surface as v1.17's? Opens v1.18, plucks
// and bows so the board moves, and at five moments recomputes every board point
// with v1.17's formula (two sines and a cosine per mode) and compares.
// usage: node check_board.mjs <study-folder>
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', process.argv[2], 'index.html');
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5964);
const b = await chromium.launch({ channel: 'chrome' });
const pg = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock.js') });
const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto('http://localhost:5964/'); await pg.waitForTimeout(1200); await pg.click('#gateBtn'); await pg.waitForTimeout(400);
const out = [];
for (const [what, act] of [['pluck', () => $('pluck').click()], ['bow', () => $('bow').dispatchEvent(new PointerEvent('pointerdown', { pointerId: 3, bubbles: true }))]]) {
  await pg.evaluate(act);
  for (let n = 0; n < 3; n++) { await pg.waitForTimeout(350);
    out.push([what, await pg.evaluate(() => { drawBoard(0, 1); const B = latestBody; if (!B) return 'no body data';
      let worst = 0, peak = 0; const W = lerp(0.5, 2.2, params.body);
      for (let i = 0; i < BNX; i++) for (let k = 0; k < BNZ; k++) { const u = i / (BNX - 1), v = k / (BNZ - 1); let y = 0;
        for (let m = 0; m < 12; m++) { const [, , mx, nz] = BODY_SHAPES[m]; y += B.env[m] * Math.sin(mx * Math.PI * u) * Math.sin(nz * Math.PI * v) * Math.cos(modePhase[m]); }
        const old = BOARD_Y + Math.max(-0.26, Math.min(0.26, 3 * y)), now = boardPos[(i * BNZ + k) * 3 + 1];
        worst = Math.max(worst, Math.abs(old - now)); peak = Math.max(peak, Math.abs(old - BOARD_Y)); }
      return { worst_diff: worst, board_peak: +peak.toFixed(4) }; })]); } }
console.log(JSON.stringify(out)); console.log('errors', errs); await b.close(); srv.close();
