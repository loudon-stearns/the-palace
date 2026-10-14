// codebox-harness.mjs — run an RNBO codebox~ file sample by sample in Node,
// so its maths can be checked against the Faust render before anyone opens Max.
//
// It is a shim, not RNBO: @state lines become module-level `let`s, the rest of
// the file becomes the per-sample body, and the rnboscript builtins the file
// uses (floor, sin, pow, max, min, sqrt, FixedDoubleArray, samplerate,
// in1..in8, out1..out2) are supplied here. If the file uses something RNBO has
// and this shim lacks, the harness throws -- which is the point.
//
// usage: node codebox-harness.mjs <file.codebox> <seconds> <sr> <K_max> [sweep|phrase] > frames.f32
//   writes interleaved float32 (out1, out2, K) per sample.
//   sweep  (default): K is a triangle 0 -> K_max -> 0 over the whole render,
//                     every other inlet at the Faust UI defaults (same shape as
//                     faust-render/, so the two can be compared sample for sample).
//   phrase: the CV demo -- frequency steps A2 C3 E3 D3 (2 s each, looped), K
//           breathes on a 0.2 Hz sine between 0 and K_max, and spread rises
//           slowly 0.02 -> 0.15, so later notes need more coupling to lock.
import { readFileSync } from "node:fs";

const [file, secsArg, srArg, kmaxArg, mode = "sweep"] = process.argv.slice(2);
const secs = +secsArg, sr = +srArg, kmax = +kmaxArg;
const src = readFileSync(file, "utf8").split("\n");

const decls = [], body = [];
for (const line of src) {
  const m = line.match(/^@state\s+(\w+)\s*=\s*(.*)$/);
  if (m) decls.push(`let ${m[1]} = ${m[2]}`);
  else if (/^@param/.test(line)) throw new Error("harness: @param not expected: " + line);
  else body.push(line);
}

const prelude = `
const floor = Math.floor, sin = Math.sin, cos = Math.cos, pow = Math.pow,
      sqrt = Math.sqrt, abs = Math.abs, exp = Math.exp, log = Math.log,
      PI = Math.PI;
const max = (a, b) => Math.max(a, b), min = (a, b) => Math.min(a, b);
const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
class FixedDoubleArray extends Float64Array {}
const samplerate = ${sr};
let in1 = 0, in2 = 0, in3 = 0, in4 = 0, in5 = 0, in6 = 0, in7 = 0, in8 = 0;
let out1 = 0, out2 = 0;
`;
const program = prelude + decls.join("\n") + `
return {
  set(v) { [in1, in2, in3, in4, in5, in6, in7, in8] = v; },
  tick() { ${body.join("\n")}
    return [out1, out2]; }
};`;
const cb = new Function(program)();

const total = Math.round(secs * sr);
const B = 4096, buf = new Float32Array(B * 3);
let k = 0;
for (let n = 0; n < total; n++) {
  const x = n / total, t = n / sr;
  let K;
  if (mode === "phrase") {
    const notes = [110, 130.81, 164.81, 146.83];
    const f = notes[Math.floor(t / 2) % notes.length];
    K = kmax * 0.5 * (1 - Math.cos(2 * Math.PI * 0.2 * t));
    cb.set([f, K, 0.02 + 0.13 * x, 5, 1, -0.2, 0.3, 1.5]);
  } else {
    K = kmax * (1 - Math.abs(2 * x - 1));
    cb.set([110, K, 0.05, 5, 1, -0.2, 0.3, 1.5]);   // the Faust UI defaults
  }
  const [o1, o2] = cb.tick();
  buf[k++] = o1; buf[k++] = o2; buf[k++] = K;
  if (k === buf.length) { process.stdout.write(Buffer.from(buf.buffer)); k = 0; }
}
if (k) process.stdout.write(Buffer.from(buf.buffer, 0, k * 4));
