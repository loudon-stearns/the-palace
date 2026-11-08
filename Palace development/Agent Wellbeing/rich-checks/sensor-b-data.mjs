// sensor-b-data.mjs — reads "Agent Wellbeing — proof — sensor-b-characterization.md" and returns only the numbers it records,
// for "Agent Wellbeing — rich — the one number.html". Nothing here is measured anew.
import { readFileSync } from 'fs';
import { join } from 'path';

const num = s => { const m = String(s).replace(/[~,*]/g, '').match(/-?\d+(\.\d+)?/); return m ? +m[0] : null; };
function tableAfter(md, heading) {
  const i = md.indexOf(heading); if (i < 0) throw new Error('no heading ' + heading);
  const lines = md.slice(i).split('\n'); const rows = []; let started = false;
  for (const l of lines.slice(1)) {
    if (/^\|/.test(l)) { started = true; if (/^\|\s*-/.test(l) || /^\|[-:| ]+\|$/.test(l)) continue; rows.push(l.split('|').slice(1, -1).map(c => c.trim())); }
    else if (started) break;
  }
  return rows.slice(1); // drop the header row
}
export function build(bundleDir) {
  const md = readFileSync(join(bundleDir, 'Agent Wellbeing — proof — sensor-b-characterization.md'), 'utf8');
  const p2 = tableAfter(md, '## Phase 2').map(r => ({ cond: r[0], reps: num(r[1]), tokens: num(r[2]) }));
  const p4 = tableAfter(md, '## Phase 4').map(r => ({ cond: r[0], output: r[1], tokens: num(r[2]) }));
  const p3 = tableAfter(md, '## Phase 3').map(r => ({ model: r[0], cond: r[1], tokens: num(r[2]) }));
  const p1 = tableAfter(md, '## Phase 1').map(r => ({ address: num(r[0]), carrying: r[1], tokens: num(r[2]) }));
  const p5 = tableAfter(md, '## Phase 5').map(r => ({ model: r[0].replace(/\s*\(.*\)/, ''), base: num(r[1]), approxBase: /~/.test(r[1]), pad12: num(r[2]), content: num(r[3]), approxContent: /~/.test(r[3]) }));
  const i5 = md.indexOf('Opus resident climb (the dial');
  const p5r = tableAfter(md.slice(i5), 'Opus resident climb (the dial').map(r => ({ address: num(r[0]), carrying: r[1], tokens: num(r[2]) }));
  const fit = md.match(/Δ = ([\d,]+) \+ (\d+)·reps/);
  return { p2, p4, p3, p1, p5, p5r, fit: { a: num(fit[1]), b: num(fit[2]) }, windows: { Haiku: 200000, Fable: 1000000, Sonnet: 1000000, Opus: 1000000 } };
}
