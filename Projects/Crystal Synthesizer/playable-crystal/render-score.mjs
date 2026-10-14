// render-score.mjs — play crystal-bank.codebox from a score, in Node, through
// the adopted codebox harness. Writes mono float32 (out1) to stdout.
//
// usage: node render-score.mjs <score.json> <sr> > out.f32
// score: { "seconds": 6, "params": {"crystal": 0, ...},
//          "events": [ {"t": 0.0, "hz": 110, "vel": 0.8},      // key down (or legato pitch)
//                      {"t": 0.5, "vel": 0},                   // key up
//                      {"t": 1.0, "param": "crystal", "value": 4} ] }
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCodebox } from "./codebox-harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const [scoreFile, srArg] = process.argv.slice(2);
const sr = +srArg;
const score = JSON.parse(readFileSync(scoreFile, "utf8"));
const cb = loadCodebox(path.join(here, "crystal-bank.codebox"), sr);
for (const [k, v] of Object.entries(score.params || {})) cb.set(k, v);

const events = (score.events || []).map(e => ({ ...e, n: Math.round(e.t * sr) })).sort((a, b) => a.n - b.n);
const N = Math.round(score.seconds * sr);
const out = new Float32Array(N);
let hz = 0, vel = 0, ei = 0;
for (let n = 0; n < N; n++) {
  while (ei < events.length && events[ei].n === n) {
    const e = events[ei++];
    if (e.param !== undefined) cb.set(e.param, e.value);
    if (e.hz !== undefined) hz = e.hz;
    if (e.vel !== undefined) vel = e.vel;
  }
  out[n] = cb.tick(hz, vel)[0];
}
process.stdout.write(Buffer.from(out.buffer));
