// Does the piece play where a face would serve it? Loads the WebP from the running app's /rich/ route
// (the route a rich face's media URLs take) in Chromium, Firefox and WebKit, screenshots it at two
// moments and compares; and tries an existing mp4 from the same route in a <video>.
//   node playback-test.mjs [base]   (base defaults to http://[::1]:5173)
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const require = createRequire(resolve(ROOT, '_ops/stigmergy/app/package.json'));
const pw = require('playwright');
const base = process.argv[2] || 'http://[::1]:5173';
const enc = (p) => p.split('/').map(encodeURIComponent).join('/');
const webp = `${base}/rich/${enc('Enrichment/light-round-2026-11-2/pieces/Animate the Background/tear-at-the-edge.webp')}`;
const mp4 = `${base}/rich/${enc('Projects/BLUELINE/proofs/blender-fire/renders/ink_flames.mp4')}`;
const out = { base, date: new Date().toISOString(), engines: {} };
for (const name of ['chromium', 'firefox', 'webkit']) {
  const b = await pw[name].launch();
  const p = await b.newPage({ viewport: { width: 1040, height: 420 } });
  const r = { };
  try {
    const resp = await p.request.get(webp);
    r.webp_status = resp.status(); r.webp_type = resp.headers()['content-type'];
    await p.setContent(`<body style="margin:0;background:#fff"><img id=i src="${webp}"><video id=v src="${mp4}" muted playsinline style="width:200px"></video></body>`);
    await p.waitForFunction(() => document.getElementById('i').complete, null, { timeout: 15000 });
    r.img_natural = await p.evaluate(() => [document.getElementById('i').naturalWidth, document.getElementById('i').naturalHeight]);
    // screenshots of the left panel across 1.4 s; animated if they differ
    const shots = [];
    for (let k = 0; k < 5; k++) { shots.push(await p.screenshot({ clip: { x: 200, y: 50, width: 400, height: 310 } })); await p.waitForTimeout(350); }
    r.img_distinct_screenshots_of_5 = new Set(shots.map((s) => s.toString('base64'))).size;
    r.video = await p.evaluate(async () => {
      const v = document.getElementById('v');
      try { await v.play(); } catch (e) { return { play_error: String(e), readyState: v.readyState, error: v.error && v.error.code }; }
      await new Promise((res) => setTimeout(res, 800));
      return { readyState: v.readyState, currentTime: +v.currentTime.toFixed(2), error: v.error && v.error.code };
    });
  } catch (e) { r.error = String(e); }
  out.engines[name] = { version: b.version(), ...r };
  await b.close();
}
writeFileSync(resolve(HERE, 'playback-test.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
