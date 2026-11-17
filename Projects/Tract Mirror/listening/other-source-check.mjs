// other-source-check.mjs — can the ear hear a throat that isn't Tract Mirror's pulse?
// Tract Mirror's six tubes, sung at 147 Hz by a different throat (Rosenberg tension 0.85,
// open quotient 0.45, breath 0.08; the ear's own pulse is 0.55, 0.6, 0). Heard four ways:
// my pulse assumed, with and without a free slope; a throat fitted from a grid, with and
// without the slope. The grid does not contain the true throat. Input: other-source.json,
// written by other-source.py. Run: node other-source-check.mjs
import fs from 'node:fs';
const here = decodeURIComponent(new URL('.', import.meta.url).pathname);
const html = fs.readFileSync(here + 'sing-back.html', 'utf8');
const TM = new Function(html.match(/<script id="tm-ear">([\s\S]*?)<\/script>/)[1] + '\nreturn TM;')();
const ys = JSON.parse(fs.readFileSync(here + 'other-source.json'));
const rows = [];
for (const v of TM.ORDER) {
  const part = TM.steadyPart(Float64Array.from(ys[v]));
  for (const [tilt, throat] of [[false, false], [true, false], [false, true], [true, true]]) {
    const g = TM.singAlong(part, tilt, throat); let r; while (!(r = g.next()).done);
    const res = r.value, pk = TM.peaks(res.area), pt = TM.peaks(TM.VOWELS[v]);
    const row = { vowel: v, slope: tilt, throat_fitted: throat, f0_heard: +res.f0.toFixed(2), throat: res.throat,
      F_err_pct: pk.map((f, i) => +(100 * (f - pt[i]) / pt[i]).toFixed(1)),
      shape_err_db: +TM.shapeErrorDb(res.area, TM.VOWELS[v]).toFixed(2), mismatch_db: +res.rms.toFixed(2) };
    rows.push(row); console.log(JSON.stringify(row));
  }
}
const summary = {};
for (const key of ['false/false', 'true/false', 'false/true', 'true/true']) {
  const rs = rows.filter(r => `${r.slope}/${r.throat_fitted}` === key);
  summary[key] = { mean_abs_F1_pct: +(rs.reduce((s, r) => s + Math.abs(r.F_err_pct[0]), 0) / rs.length).toFixed(1),
    worst_F1_pct: Math.max(...rs.map(r => Math.abs(r.F_err_pct[0]))),
    mean_abs_F2_pct: +(rs.reduce((s, r) => s + Math.abs(r.F_err_pct[1]), 0) / rs.length).toFixed(1),
    mean_shape_db: +(rs.reduce((s, r) => s + r.shape_err_db, 0) / rs.length).toFixed(1) };
}
console.log(JSON.stringify(summary, null, 1));
fs.writeFileSync(here + 'other-source-results.json', JSON.stringify({ summary_key: 'slope/throat_fitted', summary, rows }, null, 1));
