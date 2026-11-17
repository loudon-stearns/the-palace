// Runs the chase room's lessons in Node, through the same core and the same ltc.js the page runs,
// and prints what every desk did with every cue. Run:  node "Projects/SMPTE LTC/use/check.mjs"
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const L = require(path.join(here, '..', 'SMPTE LTC — rich — ltc.js'));
const { chaseShow } = require(path.join(here, 'chase-core.js'));
const { DESKS, LESSONS } = require(path.join(here, 'lessons.js'));

let bad = 0;
for (const lesson of LESSONS) {
  const r = chaseShow(L, { ...lesson.settings, desks: DESKS });
  console.log(`\n${lesson.title}\n  ${lesson.settings.preRoll}s pre-roll · between songs ${lesson.settings.betweenPreRoll || 'a cut'} · ${lesson.settings.fault} · check ${!!lesson.settings.check} · reader named ${r.named.length} frames`);
  for (const d of r.desks) console.log(`  ${d.name.padEnd(14)} ${d.report.map((x) => (x.cue + ': ' + x.verdict).padEnd(44)).join('')}`);
  for (const [desk, cue, want] of lesson.expect || []) {
    const got = r.desks.find((d) => d.name === desk).report.find((x) => x.cue === cue).verdict;
    if (got !== want) { bad++; console.log(`  ✗ expected ${desk} / ${cue}: ${want}, got ${got}`); }
  }
}
console.log(bad ? `\n${bad} expectation(s) failed` : '\nevery lesson does what its words say');
process.exit(bad ? 1 : 0);
