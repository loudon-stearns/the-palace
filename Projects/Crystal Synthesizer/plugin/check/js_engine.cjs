// js_engine.cjs — ui/crystal_engine.js driven like the harness's engine mode, so
// check_engine.py can hold the face page's engine to the sketch as well.
//   node check/js_engine.cjs engine <steps> <sr> <paths.f64> <out.bin> [--notes notes.f64]
const fs = require("fs");
const CE = require("../ui/crystal_engine.js");
const [, , mode, stepsS, srS, pathsF, outF, ...rest] = process.argv;
const steps = +stepsS, sr = +srS, NP = CE.IDS.length;
const buf = fs.readFileSync(pathsF);
const paths = new Float64Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + NP * steps * 8));
let notes = [];
const ni = rest.indexOf("--notes");
if (ni >= 0) { const nb = fs.readFileSync(rest[ni + 1]); const a = new Float64Array(nb.buffer.slice(nb.byteOffset, nb.byteOffset + nb.length));
  for (let i = 0; i < a.length; i += 4) notes.push([a[i], a[i + 1] > 0.5, a[i + 2], a[i + 3]]); }
const eng = new CE.Engine(sr), v = new Float64Array(NP);
const NPR = CE.NUM_PROBES;
const out = new Float32Array(2 * steps), probes = new Float64Array(NPR * steps);
let e = 0;
for (let i = 0; i < steps; i++) {
  for (; e < notes.length && notes[e][0] <= i; e++) { if (notes[e][1]) eng.noteOn(notes[e][2], notes[e][3] / 127.0); else eng.noteOff(notes[e][2]); }
  for (let j = 0; j < NP; j++) v[j] = paths[j * steps + i];
  const o = eng.step(v); out[i] = o[0]; out[steps + i] = o[1];
  const pr = eng.readProbes(); for (let j = 0; j < NPR; j++) probes[j * steps + i] = pr[j];
}
fs.writeFileSync(outF, Buffer.concat([Buffer.from(out.buffer), Buffer.from(probes.buffer)]));
