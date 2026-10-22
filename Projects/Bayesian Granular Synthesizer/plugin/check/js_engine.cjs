// js_engine.cjs — ui/belief_cloud.js driven like the harness's engine mode, so
// check_engine.py can hold the sketch page's engine to the sketch as well.
//   node check/js_engine.cjs engine <steps> <sr> <paths.f64> <out.bin> [--notes notes.f64]
const fs = require("fs");
const BC = require("../ui/belief_cloud.js");
const [, , mode, stepsS, srS, pathsF, outF, ...rest] = process.argv;
const steps = +stepsS, sr = +srS, NP = BC.IDS.length;
const buf = fs.readFileSync(pathsF);
const paths = new Float64Array(buf.buffer, buf.byteOffset, NP * steps);
let notes = [];
const ni = rest.indexOf("--notes");
if (ni >= 0) { const nb = fs.readFileSync(rest[ni + 1]); const a = new Float64Array(nb.buffer, nb.byteOffset, nb.length / 8);
  for (let i = 0; i < a.length; i += 4) notes.push([a[i], a[i + 1] > 0.5, a[i + 2], a[i + 3]]); }
const c = new BC.Cloud(sr), v = new Float64Array(NP);
for (let j = 0; j < NP; j++) v[j] = paths[j * steps];
c.reset(v);
const NPR = 5 + 3 * BC.MAX_NOTES;
const out = new Float32Array(2 * steps), probes = new Float64Array(NPR * steps);
let e = 0;
for (let i = 0; i < steps; i++) {
  for (; e < notes.length && notes[e][0] <= i; e++) { if (notes[e][1]) c.noteOn(notes[e][2], notes[e][3] / 127.0); else c.noteOff(notes[e][2]); }
  for (let j = 0; j < NP; j++) v[j] = paths[j * steps + i];
  const o = c.step(v); out[i] = o[0]; out[steps + i] = o[1];
  const pr = c.readProbes(); for (let j = 0; j < NPR; j++) probes[j * steps + i] = pr[j];
}
fs.writeFileSync(outF, Buffer.concat([Buffer.from(out.buffer), Buffer.from(probes.buffer)]));
