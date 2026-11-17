// Builds "the chase room.html" from its source, inlining the rich face's ltc.js whole (GoButton's
// specification, byte for byte), the chase core and the lessons, so the piece needs no file beside it.
// Run:  node "Projects/SMPTE LTC/use/make.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(here, p), 'utf8').replace(/<\/script/gi, '<\\/script');
let html = fs.readFileSync(path.join(here, 'the chase room.src.html'), 'utf8');
html = html.replace('/*@LTC*/', () => read('../SMPTE LTC — rich — ltc.js'))
  .replace('/*@CORE*/', () => read('chase-core.js'))
  .replace('/*@LESSONS*/', () => read('lessons.js'));
fs.writeFileSync(path.join(here, 'the chase room.html'), html);
console.log('wrote the chase room.html,', html.length, 'bytes');
