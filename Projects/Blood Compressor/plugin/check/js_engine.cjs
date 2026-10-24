// js_engine.cjs — ui/blood_compressor.js driven like the harness's engine mode, so
// check_engine.py can hold the face page's engine to the sketch as well.
//   node check/js_engine.cjs engine <steps> <sr> <paths.f64> <out.bin> <inputs.f32>
const fs = require("fs");
const BCE = require("../ui/blood_compressor.js");
const [, , , stepsS, srS, pathsF, outF, inF] = process.argv;
const steps = +stepsS, sr = +srS, NP = BCE.IDS.length;
const pb = fs.readFileSync(pathsF), paths = new Float64Array(pb.buffer, pb.byteOffset, NP * steps);
const ib = fs.readFileSync(inF), ins = new Float32Array(ib.buffer.slice(ib.byteOffset, ib.byteOffset + ib.length));
const c = new BCE.Compressor(sr), v = new Float64Array(NP);
const out = new Float32Array(2 * steps), probes = new Float64Array(5 * steps);
for (let i = 0; i < steps; i++) {
  for (let j = 0; j < NP; j++) v[j] = paths[j * steps + i];
  const o = c.step(v, ins[i], ins[steps + i]);
  out[i] = o[0]; out[steps + i] = o[1];
  for (let j = 0; j < 5; j++) probes[j * steps + i] = c.probes[j];
}
fs.writeFileSync(outF, Buffer.concat([Buffer.from(out.buffer), Buffer.from(probes.buffer)]));
