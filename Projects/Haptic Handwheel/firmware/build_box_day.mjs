// Inlines the feel lab's engine into the box-day page, so the console's
// pretend knob runs the same physics and the page stands alone.
//   node build_box_day.mjs   →  box-day.html
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const engine = fs.readFileSync(path.join(here, '..', 'proofs', 'feel-lab', 'feel_engine.js'), 'utf8');
const page = fs.readFileSync(path.join(here, 'box_day_template.html'), 'utf8').replace('/*__ENGINE__*/', () => engine);
fs.writeFileSync(path.join(here, 'box-day.html'), page);
console.log('wrote box-day.html', page.length, 'bytes');
