// check.mjs — does a piece's declared second file reach it when the piece is framed the way a
// scroll frames it? Starts a piece origin of its own in this process (any free port), registers
// second-file.html as the deck does when it frames it, frames it from a host page with the plan's
// own sandbox and allow, and inside that frame fetches pluck.wav, decodes it, and nulls it
// against the pluck the page makes. Also asks for an undeclared file, which must be refused.
// Writes measured.json and frame.png beside itself.
//   node "Shop/Rich-face Kit/proofs/2026-11-15-second-file/check.mjs"
// Fails (exit 1) if: the file does not load in the frame, the null residual is above -80 dBFS
// (16-bit rounding is about -96), or the undeclared file is served.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../..');
const REL = path.relative(ROOT, path.join(HERE, 'second-file.html')).split(path.sep).join('/');
const { createPieceOrigin } = await import(pathToFileURL(path.join(ROOT, '_ops/rich-face/piece-origin.mjs')));
const { chromium } = await import(pathToFileURL(path.join(ROOT, '_ops/stigmergy/app/node_modules/playwright/index.mjs')));

const origin = createPieceOrigin({ root: ROOT, port: 0 });
const st = await origin.start();
if (!st.ok) { console.error('piece origin did not start:', st.error); process.exit(1); }
const plan = origin.describe(REL);
const src = plan.url;

// The host: a page on another origin (localhost, as STIGMERGY is) that frames the piece by its plan.
const host = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`<!doctype html><body style="margin:0;background:#111"><iframe id="f" src="${src}" sandbox="allow-scripts${plan.sameOrigin ? " allow-same-origin" : ""}" allow="${plan.allow || "autoplay"}" style="width:760px;height:420px;border:0"></iframe></body>`);
});
await new Promise((ok) => host.listen(0, 'localhost', ok));
const hostUrl = `http://localhost:${host.address().port}/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 460 } });
const consoleLines = [];
page.on('console', (m) => consoleLines.push(m.type() + ': ' + m.text()));
await page.goto(hostUrl);
const frame = await (await page.waitForSelector('#f')).contentFrame();
await frame.waitForLoadState('load');

const result = await frame.evaluate(async () => {
  const out = { origin: location.origin };
  const r = await fetch('pluck.wav');
  out.status = r.status;
  if (!r.ok) return out;
  const bytes = await r.arrayBuffer();
  out.bytes = bytes.byteLength;
  const off = new OfflineAudioContext(1, 44100 * 2, 44100);
  const fileBuf = await off.decodeAudioData(bytes);
  const fromFile = fileBuf.getChannelData(0);
  const fromPage = window.SECOND_FILE.pluck(44100);
  let maxDiff = 0, peak = 0;
  for (let i = 0; i < fromPage.length; i++) { maxDiff = Math.max(maxDiff, Math.abs(fromFile[i] - fromPage[i])); peak = Math.max(peak, Math.abs(fromPage[i])); }
  out.samples = { file: fromFile.length, page: fromPage.length };
  out.peak = peak;
  out.maxDiff = maxDiff;
  out.residual_dbfs = 20 * Math.log10(maxDiff || 1e-12);
  const u = await fetch('make-pluck.mjs');
  out.undeclared_status = u.status;
  return out;
});

// The button path too: click "Play from the file" and read what the page says.
await frame.click('#file');
await frame.waitForFunction(() => /Played|did not/.test(document.getElementById('say').textContent), null, { timeout: 5000 });
result.button_says = await frame.textContent('#say');
await page.screenshot({ path: path.join(HERE, 'frame.png') });
await browser.close();
host.close();
await origin.close();

const fails = [];
if (result.status !== 200) fails.push(`pluck.wav answered ${result.status} in the frame`);
if (!(result.residual_dbfs < -80)) fails.push(`null residual ${result.residual_dbfs?.toFixed(1)} dBFS is not below -80`);
if (result.undeclared_status === 200) fails.push('an undeclared file beside the piece was served');
if (!/Played from pluck/.test(result.button_says || '')) fails.push('the button did not play the file: ' + result.button_says);
const measured = { checked: new Date().toISOString(), piece: REL, plan: { sameOrigin: plan.sameOrigin, allow: plan.allow, chips: plan.chips?.map((c) => c.text) }, ...result, console: consoleLines, pass: fails.length === 0, fails };
fs.writeFileSync(path.join(HERE, 'measured.json'), JSON.stringify(measured, null, 2) + '\n');
console.log(JSON.stringify(measured, null, 2));
process.exit(fails.length ? 1 : 0);
