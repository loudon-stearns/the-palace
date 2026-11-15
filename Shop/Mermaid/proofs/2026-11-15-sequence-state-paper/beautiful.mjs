// The zoom-out try, 2026-11-15: beautiful-mermaid 1.1.3 (Craft, MIT, npm 2026-01-28), which
// renders Mermaid text to SVG in plain Node with ELK and no browser. Same two sources, the
// paper tokens as its two colours (+ line and accent), JetBrains Mono. Old route: mmdc.
//   npm install --prefix <dir> beautiful-mermaid@1.1.3      (anywhere outside the palace)
//   node "Shop/Mermaid/proofs/2026-11-15-sequence-state-paper/beautiful.mjs" <dir>
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const dir = process.argv[2];
const t0 = performance.now();
const { renderMermaidSVG } = await import(pathToFileURL(join(dir, 'node_modules/beautiful-mermaid/dist/index.js')).href);
const loadMs = performance.now() - t0;
const v = JSON.parse(readFileSync(join(HERE, 'palace-mermaid-paper.json'), 'utf8')).themeVariables;
const opts = { bg: v.background, fg: v.primaryTextColor, line: v.lineColor, font: 'JetBrains Mono' };
const out = { version: JSON.parse(readFileSync(join(dir, 'node_modules/beautiful-mermaid/package.json'), 'utf8')).version, import_ms: +loadMs.toFixed(1), options: opts, renders: {} };
for (const n of ['sequence', 'state']) {
  const src = readFileSync(join(HERE, `${n}.mmd`), 'utf8');
  const rec = {};
  try {
    let t = performance.now(); const a = renderMermaidSVG(src, opts); rec.ms_first = +(performance.now() - t).toFixed(1);
    t = performance.now(); const b = renderMermaidSVG(src, opts); rec.ms_second = +(performance.now() - t).toFixed(1);
    writeFileSync(join(HERE, `${n}-paper-beautiful.svg`), a);
    rec.bytes = Buffer.byteLength(a);
    rec.byte_identical_on_rerun = createHash('sha256').update(a).digest('hex') === createHash('sha256').update(b).digest('hex');
    rec.has_foreignObject = a.includes('foreignObject');
    rec.labels_found = ['Loudon', 'Specialist', 'Measured', 'OnScroll', 'Framed', 'script runs', 'a script measures'].filter((s) => a.includes(s));
  } catch (e) { rec.error = String(e).slice(0, 300); }
  out.renders[n] = rec;
}
writeFileSync(join(HERE, 'measured-beautiful.json'), JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out));
