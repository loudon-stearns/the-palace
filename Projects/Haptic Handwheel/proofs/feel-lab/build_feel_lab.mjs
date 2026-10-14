// Inlines feel_engine.js and the offline sweep's results into the page, so the
// page plays the same physics the numbers came from.  node build_feel_lab.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const tpl = fs.readFileSync(path.join(here, 'feel_lab_template.html'), 'utf8');
const engine = fs.readFileSync(path.join(here, 'feel_engine.js'), 'utf8');
const results = JSON.parse(fs.readFileSync(path.join(here, 'feel_lab_results.json'), 'utf8'));
const map = JSON.parse(fs.readFileSync(path.join(here, 'feel_map_results.json'), 'utf8')).map;
const html = tpl.replace('/*ENGINE*/', () => engine).replace('/*RESULTS*/', () => JSON.stringify({ verdicts: results.verdicts, map }));
fs.writeFileSync(path.join(here, 'feel-lab.html'), html);
console.log('feel-lab.html', html.length, 'bytes');
