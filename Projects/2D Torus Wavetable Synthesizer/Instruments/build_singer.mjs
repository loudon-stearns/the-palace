// build_singer.mjs — inline the Hopf engine into the Singer so the page
// stands alone (the board plays HTML in a sandbox, one file, no fetch).
// The engine has one source: Hopf/hopf-control-surface.html.
//
//   node build_singer.mjs     -> singer.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const hopf = fs.readFileSync(path.join(here, '..', 'Hopf', 'hopf-control-surface.html'), 'utf8');
const engine = hopf.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const tpl = fs.readFileSync(path.join(here, 'singer.template.html'), 'utf8');
fs.writeFileSync(path.join(here, 'singer.html'), tpl.replace('/*ENGINE*/', () => engine));
console.log('wrote singer.html');
