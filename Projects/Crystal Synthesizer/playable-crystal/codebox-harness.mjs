// codebox-harness.mjs — copied unchanged (but for this header line) from
// Projects/Blood Compressor/rnbo/codebox-harness.mjs for the Crystal Synthesizer.
// Load a hand-written RNBO codebox~ file into Node so its
// maths can be checked sample by sample before anyone opens Max.
// Adapted from Action Potential Oscillator/rnbo/codebox-harness.mjs (that one
// refuses @param; this one turns each @param into a settable variable).
//
// It is a shim, not RNBO: @state and @param lines become closure variables, the
// rest of the file becomes the per-sample body, and only the builtins listed in
// the prelude exist. If the file reaches for something the shim lacks, it throws,
// which is the point: anything used here is a name rnboscript documents.
import { readFileSync } from "node:fs";

export function loadCodebox(file, sr) {
  const src = readFileSync(file, "utf8").split("\n");
  const decls = [], body = [], params = [];
  for (const line of src) {
    const st = line.match(/^@state\s+(\w+)\s*=\s*(.*?);?\s*(\/\/.*)?$/);
    const pm = line.match(/^@param\(\s*\{([^}]*)\}\s*\)\s*(\w+)\s*=\s*([^;]+);/);
    if (st) decls.push(`let ${st[1]} = ${st[2]};`);
    else if (pm) {
      const range = Object.fromEntries(pm[1].split(",").map(kv => kv.split(":").map(s => s.trim())).map(([k, v]) => [k, +v]));
      params.push({ name: pm[2], def: +pm[3], ...range });
      decls.push(`let ${pm[2]} = ${pm[3]};`);
    } else if (/^\s*@/.test(line)) throw new Error("harness: unknown decorator: " + line);
    else body.push(line);
  }
  const prelude = `
const floor = Math.floor, ceil = Math.ceil, sin = Math.sin, cos = Math.cos, tan = Math.tan,
      pow = Math.pow, sqrt = Math.sqrt, abs = Math.abs, exp = Math.exp, log = Math.log, PI = Math.PI;
const max = (a, b) => Math.max(a, b), min = (a, b) => Math.min(a, b);
const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
class FixedDoubleArray extends Float64Array {}
const samplerate = ${sr};
let in1 = 0, in2 = 0, out1 = 0, out2 = 0, out3 = 0, out4 = 0, out5 = 0;
`;
  // RNBO clamps a @param to its declared range; so does set().
  const setter = params.map(p => `case ${JSON.stringify(p.name)}: ${p.name} = Math.min(${p.max}, Math.max(${p.min}, v)); break;`).join("\n");
  const program = prelude + decls.join("\n") + `
return {
  set(name, v) { switch (name) { ${setter}
    default: throw new Error("no @param " + name); } },
  // tick(left) feeds the same sample to both inputs (mono); tick(left, right) for stereo
  tick(__l, __r) { in1 = __l; in2 = (__r === undefined ? __l : __r);
${body.join("\n")}
    return [out1, out2, out3, out4, out5]; }
};`;
  const cb = new Function(program)();
  cb.params = params;
  return cb;
}
