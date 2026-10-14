// poly-render.mjs — play crystal-ring-voice.codebox polyphonically, in Node, the way
// RNBO's [p @polyphony N] with simple (MIDI) voice control is documented to:
// each new note goes to the next free voice; with none free, the oldest note's
// voice is stolen; a muted voice is not processed at all. A voice mutes itself
// when its out2 goes 0 -> 1 ([edge~] -> [voice]). This is a model of RNBO's
// allocator, not RNBO: the order RNBO picks free voices in may differ.
//
// usage: node poly-render.mjs <score.json> <sr> > out.f32     (stats on stderr)
// score: { "seconds": 6, "voices": 8,
//          "params": {"crystal": 0, "hardness": 1, "lifetime": 1, "release": 8, "rolloff": 0.7, "level": 0.5},
//          "events": [ {"t": 0.0, "note": 45, "vel": 100},   // MIDI note on (vel 0 = off)
//                      {"t": 1.0, "param": "crystal", "value": 4} ] }
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// Same shim as ../playable-crystal/codebox-harness.mjs, widened to seven inlets.
export function loadVoice(file, sr) {
  const src = readFileSync(file, "utf8").split("\n");
  const decls = [], body = [];
  for (const line of src) {
    const st = line.match(/^@state\s+(\w+)\s*=\s*(.*?);?\s*(\/\/.*)?$/);
    if (st) decls.push(`let ${st[1]} = ${st[2]};`);
    else if (/^\s*@/.test(line)) throw new Error("harness: unexpected decorator: " + line);
    else body.push(line);
  }
  const prelude = `
const floor = Math.floor, ceil = Math.ceil, sin = Math.sin, cos = Math.cos, tan = Math.tan,
      pow = Math.pow, sqrt = Math.sqrt, abs = Math.abs, exp = Math.exp, log = Math.log, PI = Math.PI;
const max = (a, b) => Math.max(a, b), min = (a, b) => Math.min(a, b);
const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
class FixedDoubleArray extends Float64Array {}
const samplerate = ${sr};
let in1 = 0, in2 = 0, in3 = 0, in4 = 0, in5 = 0, in6 = 0, in7 = 0, out1 = 0, out2 = 0;
`;
  return new Function(prelude + decls.join("\n") + `
return { tick(__1, __2, __3, __4, __5, __6, __7) { in1 = __1; in2 = __2; in3 = __3; in4 = __4; in5 = __5; in6 = __6; in7 = __7;
${body.join("\n")}
  return [out1, out2]; } };`)();
}

// Fixed trim after the voices are summed ([*~ 0.3] in the patch), for headroom.
export const MIX = 0.3;
const RANGES = { crystal: [0, 8], hardness: [0.05, 50], lifetime: [0.05, 50], release: [0.01, 10],
                 rolloff: [0.3, 1], level: [0, 1] };
export function renderPoly(score, sr) {
  const P = { crystal: 0, hardness: 1, lifetime: 1, release: 8, rolloff: 0.7, level: 0.5 };
  const setP = (k, v) => { const [lo, hi] = RANGES[k]; P[k] = Math.min(hi, Math.max(lo, v)); };
  for (const [k, v] of Object.entries(score.params || {})) setP(k, v);
  const nv = score.voices || 8;
  const voices = Array.from({ length: nv }, () => ({
    cb: loadVoice(path.join(here, "crystal-ring-voice.codebox"), sr),
    muted: true, note: -1, hz: 0, vel: 0, born: -1, prevSilent: 1 }));
  const events = (score.events || []).map(e => ({ ...e, n: Math.round(e.t * sr) })).sort((a, b) => a.n - b.n);
  const N = Math.round(score.seconds * sr);
  const out = new Float32Array(N);
  const active = new Uint8Array(N);
  let ei = 0, steals = 0, maxActive = 0;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  for (let n = 0; n < N; n++) {
    while (ei < events.length && events[ei].n === n) {
      const e = events[ei++];
      if (e.param !== undefined) { setP(e.param, e.value); continue; }
      if (e.vel > 0) {
        let v = voices.find(v => v.muted);
        if (!v) { v = voices.reduce((a, b) => (a.born <= b.born ? a : b)); steals++; }
        v.muted = false; v.note = e.note; v.hz = mtof(e.note); v.vel = e.vel / 127; v.born = n;
      } else {
        for (const v of voices) if (!v.muted && v.note === e.note && v.vel > 0) v.vel = 0;
      }
    }
    let s = 0, a = 0;
    for (const v of voices) {
      if (v.muted) continue;
      a++;
      const [y, silent] = v.cb.tick(v.hz, v.vel, P.crystal, P.hardness, P.lifetime, P.release, P.rolloff);
      s += y;
      if (silent > 0 && v.prevSilent <= 0) { v.muted = true; v.note = -1; }
      v.prevSilent = silent;
    }
    out[n] = s * MIX * P.level;
    active[n] = a; if (a > maxActive) maxActive = a;
  }
  return { out, active, steals, maxActive };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [scoreFile, srArg] = process.argv.slice(2);
  const r = renderPoly(JSON.parse(readFileSync(scoreFile, "utf8")), +srArg);
  process.stdout.write(Buffer.from(r.out.buffer));
  process.stderr.write(JSON.stringify({ steals: r.steals, maxActive: r.maxActive,
    activeAtEnd: r.active[r.active.length - 1],
    activeEverySecond: Array.from({ length: Math.floor(r.active.length / +srArg) }, (_, i) => r.active[i * +srArg]) }));
}
