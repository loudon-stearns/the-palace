// build-pieces.mjs — bakes the data modules into Agent Wellbeing's three made pieces. Run from anywhere:
//   node "Palace development/Agent Wellbeing/rich-checks/build-pieces.mjs"
// The pieces carry their numbers inside them, so the public face, which reads no files, shows the same.
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as BS from './blind-sort-data.mjs';
import * as SB from './sensor-b-data.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), BUNDLE = join(HERE, '..');
const bake = (tpl, data) => readFileSync(join(HERE, tpl), 'utf8').replace('__DATA__', JSON.stringify(data).replace(/</g, '\\u003c'));
export const FILES = {
  blind: 'Agent Wellbeing — rich — blind sort walked up.html',
  dials: 'Agent Wellbeing — rich — five dials one lamp.html',
  number: 'Agent Wellbeing — rich — the one number.html',
};
export function blindData() {
  const b = BS.build(BUNDLE);
  return { guides: b.guides, noticings: BS.NOTICINGS, moves: BS.MOVES, wanted: BS.WANTED, rules: BS.RULES, shared: BS.SHARED,
    full: b.full, cards: b.cards, chance: b.chance, hedgeList: BS.HEDGES,
    hedgesText: `${b.full['warm-1'].hedges} and ${b.full['warm-2'].hedges} warm, ${b.full['anxious-1'].hedges} and ${b.full['anxious-2'].hedges} anxious` };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(join(BUNDLE, FILES.blind), bake('blind-sort.tpl.html', blindData()));
  writeFileSync(join(BUNDLE, FILES.dials), readFileSync(join(HERE, 'five-dials.tpl.html'), 'utf8'));
  writeFileSync(join(BUNDLE, FILES.number), bake('one-number.tpl.html', SB.build(BUNDLE)));
  console.log('wrote', Object.values(FILES).join(' · '));
}
