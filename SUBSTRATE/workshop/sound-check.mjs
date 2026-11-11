// Renders the story's bed and every cue offline, exactly as the piece will, and prints their levels.
// usage (from the palace root): node SUBSTRATE/workshop/sound-check.mjs   (exits 1 on any failure)
import fs from 'node:fs';
const html = fs.readFileSync('SUBSTRATE/SUBSTRATE — rich — born on the floor.html', 'utf8');
const Bsrc = html.match(/const B = \{[^}]*\};/)[0];
const src = html.slice(html.indexOf('/*sound:begin*/'), html.indexOf('/*sound:end*/'));
const SOUND = new Function(Bsrc + src + '; return SOUND;')();
const sr = 48000, db = (x) => x > 0 ? (20 * Math.log10(x)).toFixed(1) : '-inf';
const stat = (a) => { let pk = 0, sq = 0; for (const v of a) { const u = Math.abs(v); if (u > pk) pk = u; sq += v * v; } return { pk, rms: Math.sqrt(sq / a.length) }; };
let fail = 0; const bad = (m) => { fail++; console.log('  FAIL ' + m); };
console.log(`rendered at ${sr} Hz · master ${SOUND.master} · bedGain ${SOUND.bedGain}\n`);
console.log('name            seconds   peak dBFS   RMS dBFS   |first|    |last|');
const bed = SOUND.bed.render(sr), bs = stat(bed);
console.log(`bed             ${(bed.length / sr).toFixed(2).padStart(7)}   ${db(bs.pk).padStart(9)}   ${db(bs.rms).padStart(8)}   (loops)`);
// the seam: the jump from the last sample back to the first, against the biggest jump anywhere inside
let maxStep = 0, maxCurve = 0; for (let i = 1; i < bed.length; i++) { const d = Math.abs(bed[i] - bed[i - 1]); if (d > maxStep) maxStep = d; if (i > 1) { const c = Math.abs(bed[i] - 2 * bed[i - 1] + bed[i - 2]); if (c > maxCurve) maxCurve = c; } }
const n = bed.length, seamStep = Math.abs(bed[0] - bed[n - 1]), seamCurve = Math.max(Math.abs(bed[0] - 2 * bed[n - 1] + bed[n - 2]), Math.abs(bed[1] - 2 * bed[0] + bed[n - 1]));
console.log(`  seam step ${seamStep.toExponential(2)} vs largest step inside ${maxStep.toExponential(2)} · seam bend ${seamCurve.toExponential(2)} vs largest bend inside ${maxCurve.toExponential(2)}`);
if (seamStep > maxStep) bad('the loop steps harder at its seam than anywhere inside it: a click');
if (seamCurve > maxCurve) bad('the loop bends harder at its seam than anywhere inside it: a tick');
if (bs.pk >= 0.5) bad('bed peak at or over 0.5 before gain: not a quiet bed');
let maxCue = 0;
const list = []; for (const [name, c] of Object.entries(SOUND.cues)) { if (name === 'tile') for (let k = 0; k < 8; k++) list.push([name, k]); else if (name === 'band') for (let k = 0; k < 6; k++) list.push([name, k]); else list.push([name]); }
for (const [name, k] of list) {
  const a = SOUND.cues[name].render(sr, k), s = stat(a), f = Math.abs(a[0]), l = Math.abs(a[a.length - 1]);
  console.log(`${(name + (k === undefined ? '' : ' ' + k)).padEnd(15)} ${(a.length / sr).toFixed(2).padStart(7)}   ${db(s.pk).padStart(9)}   ${db(s.rms).padStart(8)}   ${f.toExponential(1)}   ${l.toExponential(1)}`);
  if (s.pk > maxCue) maxCue = s.pk;
  if (s.pk >= 0.6) bad(`${name} peaks at or over 0.6 before gain: too loud for a small sound`);
  if (f > 0.002 || l > 0.002) bad(`${name} starts or ends off zero: a click`);
  if (!a.every(Number.isFinite)) bad(`${name} holds a non-number`);
}
for (const [beat, c] of Object.entries(SOUND.at)) if (!['duck', 'steps'].includes(c[0]) && !SOUND.cues[c[0]]) bad(`frame ${+beat + 1} names a cue that does not exist: ${c[0]}`);
const worst = SOUND.master * (bs.pk * SOUND.bedGain + maxCue);
console.log(`\nat the output, bed alone: peak ${db(bs.pk * SOUND.bedGain * SOUND.master)} dBFS, RMS ${db(bs.rms * SOUND.bedGain * SOUND.master)} dBFS`);
console.log(`loudest cue over the bed, at the output: ${db(worst)} dBFS (${worst.toFixed(3)} of full scale; 1.000 would clip)`);
if (worst >= 1) bad('the loudest cue over the bed reaches full scale');
console.log(fail ? `\n${fail} FAILED` : '\nall checks passed'); process.exit(fail ? 1 : 0);
