// sing-back-check.mjs — holds sing-back.html's ear (script id="tm-ear") against the Python.
// Part 1: the model. Tube and source levels at the harmonics, and the rendered voice, against
//   sing-back-check.json (sing-back-check.py writes it from singalong.py's own functions).
// Part 2: the ear. The page sings each built-in vowel and listens to it; the shape it hears
//   back is compared with the truth, the way singalong.py scored itself.
// Run: node sing-back-check.mjs [--quick]
import fs from 'node:fs';
const here = decodeURIComponent(new URL('.', import.meta.url).pathname);
const html = fs.readFileSync(here + 'sing-back.html', 'utf8');
const src = html.match(/<script id="tm-ear">([\s\S]*?)<\/script>/)[1];
const TM = new Function(src + '\nreturn TM;')();
const ref = JSON.parse(fs.readFileSync(here + 'sing-back-check.json', 'utf8'));
const maxAbs = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
const out = { model: [], ear: [] };
let ok = true;
for (const c of ref.cases) {
  const area = TM.VOWELS[c.vowel];
  const dT = maxAbs(Array.from(TM.tractDb(area, c.hf)), c.tract_db);
  const dS = maxAbs(TM.sourceDb(c.f0, c.hf), c.source_db);
  const y = TM.sing(area, c.f0, 0.5), dY = maxAbs(Array.from(y.subarray(0, 4000)), c.render_head);
  const pk = TM.peaks(area), dF = pk.map((f, i) => 100 * (f - c.formants[i]) / c.formants[i]);
  const pass = dT < 0.05 && dS < 0.01 && dY < 1e-3 && dF.every(v => Math.abs(v) < 2);
  ok &&= pass;
  out.model.push({ vowel: c.vowel, f0: c.f0, tube_db_maxdiff: +dT.toExponential(2), source_db_maxdiff: +dS.toExponential(2),
    render_maxdiff: +dY.toExponential(2), peak_vs_pole_pct: dF.map(v => +v.toFixed(2)), pass });
  console.log(c.vowel, c.f0, 'tube', dT.toExponential(2), 'dB · source', dS.toExponential(2), 'dB · render', dY.toExponential(2), '· peaks vs poles %', dF.map(v => v.toFixed(2)).join(' '), pass ? 'PASS' : 'FAIL');
}
const quick = process.argv.includes('--quick');
const pitches = quick ? [110] : [98, 147, 220, 330];
for (const v of TM.ORDER) for (const f0 of pitches) {
  const truth = TM.VOWELS[v], t0 = Date.now();
  const part = TM.steadyPart(TM.sing(truth, f0, 1.2));
  const run = TM.singAlong(part, false); let r, steps = 0;
  while (!(r = run.next()).done) steps++;
  const res = r.value, pk = TM.peaks(res.area), pt = TM.peaks(truth);
  const row = { vowel: v, f0, f0_heard: +res.f0.toFixed(1), shape_err_db: +TM.shapeErrorDb(res.area, truth).toFixed(2),
    F_heard: pk.map(Math.round), F_true: pt.map(Math.round), F1_err_pct: +(100 * (pk[0] - pt[0]) / pt[0]).toFixed(2),
    mismatch_db: +res.rms.toFixed(2), start: res.start, steps, seconds: +((Date.now() - t0) / 1000).toFixed(1) };
  out.ear.push(row); console.log(JSON.stringify(row));
}
fs.writeFileSync(here + 'sing-back-check-results.json', JSON.stringify(out, null, 1));
console.log(ok ? 'model: all PASS' : 'model: FAIL');
