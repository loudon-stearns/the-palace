// check.mjs — runs frame-features.html three ways in headless Chromium and records what each
// way can reach: alone (served from the piece origin), framed opaque (the plan for a piece that
// declares nothing: sandbox="allow-scripts"), and framed same-origin (the plan for a piece that
// declares a need or a file: sandbox="allow-scripts allow-same-origin"). The piece origin is
// started in this process on a free port, as check.mjs in 2026-11-15-second-file does.
// Writes measured.json and frames.png. Fails (exit 1) only if the probe never finishes.
//   node "Shop/Rich-face Kit/proofs/2026-11-15-frame-features/check.mjs"
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../..');
const REL = path.relative(ROOT, path.join(HERE, 'frame-features.html')).split(path.sep).join('/');
const { createPieceOrigin } = await import(pathToFileURL(path.join(ROOT, '_ops/rich-face/piece-origin.mjs')));
const { chromium } = await import(pathToFileURL(path.join(ROOT, '_ops/stigmergy/app/node_modules/playwright/index.mjs')));

const origin = createPieceOrigin({ root: ROOT, port: 0 });
const st = await origin.start();
if (!st.ok) { console.error('piece origin did not start:', st.error); process.exit(1); }
const plan = origin.describe(REL);

const host = http.createServer((req, res) => {
  const sandbox = req.url.includes('same') ? 'allow-scripts allow-same-origin' : 'allow-scripts';
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`<!doctype html><body style="margin:0;background:#111"><iframe id="f" src="${plan.url}" sandbox="${sandbox}" allow="${plan.allow || 'autoplay'}" style="width:900px;height:900px;border:0"></iframe></body>`);
});
await new Promise((ok) => host.listen(0, 'localhost', ok));
const hostUrl = `http://localhost:${host.address().port}/`;

const browser = await chromium.launch({ args: ['--enable-unsafe-webgpu'] });
const out = { checked: new Date().toISOString(), piece: REL, browser: browser.version(), plan: { sameOrigin: plan.sameOrigin, allow: plan.allow }, runs: {} };
const page = await browser.newPage({ viewport: { width: 940, height: 940 } });

async function probe(frame) {
  await frame.click('#go');
  await frame.waitForFunction(() => window.FRAME_FEATURES, null, { timeout: 20000 });
  return frame.evaluate(() => window.FRAME_FEATURES);
}
await page.goto(plan.url);
out.runs.alone = await probe(page.mainFrame());
for (const kind of ['opaque', 'same']) {
  await page.goto(hostUrl + kind);
  const frame = await (await page.waitForSelector('#f')).contentFrame();
  await frame.waitForLoadState('load');
  out.runs[kind === 'same' ? 'framed same-origin' : 'framed opaque'] = await probe(frame);
  if (kind === 'opaque') await page.screenshot({ path: path.join(HERE, 'frames.png') });
}
await browser.close(); host.close(); await origin.close();

// Where the three ways disagree is the finding.
const names = Object.keys(out.runs.alone.results);
out.differs = names.filter((n) => new Set(Object.values(out.runs).map((r) => r.results[n])).size > 1)
  .map((n) => ({ feature: n, ...Object.fromEntries(Object.entries(out.runs).map(([k, r]) => [k, r.results[n]])) }));
fs.writeFileSync(path.join(HERE, 'measured.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ browser: out.browser, alone: out.runs.alone.results, differs: out.differs }, null, 2));
