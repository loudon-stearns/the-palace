// Photographs the plugin's picture (ui/visualizer.js) on a folder slot, filled and empty, and
// on the built-in fm chain beside them, in Chrome, at the editor's centre size.
// usage: node tools/folder_shots.mjs   (needs Chrome + the stigmergy app's playwright)
import { chromium } from '../../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)), PLUG = path.dirname(HERE);
const js = fs.readFileSync(path.join(PLUG, 'ui/visualizer.js'), 'utf8');
const html = `<html><body style="margin:0;background:#040a07"><div id=v style="width:760px;height:460px"></div>
<script>${js}</script><script>WavetableScannerView.mount(document.getElementById('v'), null);</script></body></html>`;
const b = await chromium.launch({ channel: 'chrome' }), p = await b.newPage({ viewport: { width: 760, height: 460 } });
await p.setContent(html);
for (const [name, table, folder] of [['builtin-fm', 2, 0], ['folder-filled', 3, 1], ['folder-empty', 8, -1]]) {
  await p.evaluate(([t, f]) => WavetableScannerView.frame([0.42, 1, f], { table: t, position: 0.42 }), [table, folder]);
  await p.screenshot({ path: path.join(PLUG, `shot-picture-${name}.png`) });
}
await b.close(); console.log('shots written');
