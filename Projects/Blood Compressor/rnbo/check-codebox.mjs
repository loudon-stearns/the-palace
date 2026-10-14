// check-codebox.mjs — is the Max device's compressor the browser vessel's
// compressor? Runs both in Node on the same input and compares every sample.
//   reference: the <script id="dsp"> block of ../stage2-vessel-prototype-v3.html, as written
//   candidate: blood-compressor.codebox through codebox-harness.mjs
// Writes check-findings.json and codebox-threshold-steps.wav next to this file.
// usage: node check-codebox.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { loadCodebox } from "./codebox-harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, "..", "stage2-vessel-prototype-v3.html"), "utf8");
const dspSrc = html.match(/<script id="dsp">([\s\S]*?)<\/script>/)[1];
function loadRef(delayArray) {
  const sb = { module: { exports: null }, Math, Float32Array: delayArray };
  vm.runInNewContext(dspSrc, sb);
  return sb.module.exports;
}
const REF32 = loadRef(Float32Array);  // the page exactly as it runs
const REF64 = loadRef(Float64Array);  // same page, its control delay held in doubles (as RNBO holds it)
const MAP = { threshold: "th", ratio: "ra", knee: "kn", attack: "at", release: "re", makeup: "mk", rmsTime: "rmsMs" };

function compare(REF, sr, seconds, inputFn, schedule) {
  const ref = new REF.Compressor(sr), cb = loadCodebox(path.join(here, "blood-compressor.codebox"), sr);
  let maxAudio = 0, maxGr = 0, maxDet = 0, baroMismatch = 0, peakIn = 0;
  const N = Math.round(sr * seconds), outAudio = new Float32Array(N), outGr = new Float32Array(N);
  for (let n = 0; n < N; n++) {
    const changes = schedule(n, sr);
    if (changes) for (const [k, v] of Object.entries(changes)) {
      cb.set(k, v);
      if (k === "bypass") ref.p.bypass = v >= 0.5; else ref.p[MAP[k]] = v;
    }
    const x = inputFn(n, sr);
    const yr = ref.processSample(x), [y, yR, det, gr, baro] = cb.tick(x, x);
    maxAudio = Math.max(maxAudio, Math.abs(y - yr), Math.abs(yR - yr));
    maxGr = Math.max(maxGr, Math.abs(gr - ref.last.gr));
    maxDet = Math.max(maxDet, Math.abs(det - ref.last.det));
    if ((ref.last.target < -0.05 ? 1 : 0) !== baro) baroMismatch++;
    peakIn = Math.max(peakIn, Math.abs(x));
    outAudio[n] = y; outGr[n] = gr;
  }
  return { samples: N, maxAudioDiff: maxAudio, maxSqueezeDiffDb: maxGr, maxPressureDiffDb: maxDet, baroreceptorMismatches: baroMismatch, outAudio, outGr };
}

// inputs
const hbCache = new Map();
function heartbeatFn(REF) { return (n, sr) => { const k = sr; if (!hbCache.has(k) || hbCache.get(k).n !== n) { const h = hbCache.get(k)?.h && n > 0 ? hbCache.get(k).h : new REF.Heartbeat(sr); hbCache.set(k, { h, n: n + 1, v: h.next() }); } return hbCache.get(k).v; }; }
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
function noiseBursts() { let env = 0; return (n, sr) => { if (n % Math.round(sr * 0.25) === 0) env = Math.pow(10, (-50 + 50 * rnd()) / 20); return env * (2 * rnd() - 1); }; }

const stepSched = (n, sr) => (n % (sr * 4) === 0 ? { threshold: -10 * Math.floor(n / (sr * 4)) } : null);
function randomSched() {
  return (n, sr) => {
    if (n % Math.round(sr * 0.5) !== 0) return null;
    const pick = (lo, hi) => lo + (hi - lo) * rnd();
    return { threshold: pick(-60, 0), ratio: pick(1, 20), knee: pick(0, 24), attack: pick(5, 500), release: pick(5, 3000),
             makeup: pick(0, 24), rmsTime: pick(1, 100), bypass: rnd() < 0.15 ? 1 : 0 };
  };
}
const strip = r => { const { outAudio, outGr, ...rest } = r; return rest; };

const findings = { date: "2026-10-14", reference: "stage2-vessel-prototype-v3.html <script id=dsp>", candidate: "rnbo/blood-compressor.codebox" };
const runs = [];
for (const [label, REF] of [["doubles (as RNBO holds the delay)", REF64], ["page as written (float32 delay)", REF32]]) {
  for (const sr of [48000, 44100, 96000]) {
    hbCache.clear(); seed = 12345;
    runs.push({ reference: label, sr, test: "heartbeat, threshold steps 0 to -40 dB every 4 s", ...strip(compare(REF, sr, 20, heartbeatFn(REF), stepSched)) });
    seed = 12345; const nb = noiseBursts(); const rs = randomSched();
    runs.push({ reference: label, sr, test: "noise bursts, every control re-randomised every 0.5 s (incl. bypass)", ...strip(compare(REF, sr, 20, nb, rs)) });
  }
}
findings.runs = runs;

// heartbeat source codebox vs the page's Heartbeat
{
  const sr = 48000, hbJs = new REF64.Heartbeat(sr), hbCb = loadCodebox(path.join(here, "heartbeat.codebox"), sr);
  let m = 0; for (let n = 0; n < sr * 60; n++) m = Math.max(m, Math.abs(hbJs.next() - hbCb.tick(0)[0]));
  findings.heartbeatSource = { seconds: 60, sr, maxDiff: m };
}

// the codebox's own sound: its heartbeat through its compressor, threshold stepping
{
  const sr = 48000, hb = loadCodebox(path.join(here, "heartbeat.codebox"), sr), comp = loadCodebox(path.join(here, "blood-compressor.codebox"), sr);
  const N = sr * 20, buf = Buffer.alloc(44 + N * 2);
  let deepest = [0, 0, 0, 0, 0];
  for (let n = 0; n < N; n++) {
    const ch = stepSched(n, sr); if (ch) comp.set("threshold", ch.threshold);
    const [y, , , gr] = comp.tick(hb.tick(0)[0]);
    const seg = Math.floor(n / (sr * 4)); deepest[seg] = Math.min(deepest[seg], gr);
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(y * 32767))), 44 + n * 2);
  }
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 2, 40);
  fs.writeFileSync(path.join(here, "codebox-threshold-steps.wav"), buf);
  findings.codeboxRender = { file: "codebox-threshold-steps.wav", deepestSqueezeDbPerStep: Object.fromEntries(deepest.map((g, i) => [`${-10 * i} dB`, +g.toFixed(2)])) };
}
// stereo link (v0.2): left = heartbeat, right = the same heartbeat 12 dB down, then swapped.
// The squeeze must follow the louder side whichever side it is on, both sides must get
// the same squeeze, and the quieter side must not pull the detector.
{
  const sr = 48000, N = sr * 10;
  const run = (swap) => {
    const hb = loadCodebox(path.join(here, "heartbeat.codebox"), sr);
    const st = loadCodebox(path.join(here, "blood-compressor.codebox"), sr);
    const mono = loadCodebox(path.join(here, "blood-compressor.codebox"), sr);
    for (const c of [st, mono]) c.set("threshold", -30);
    let maxGrDiff = 0, maxGainMismatch = 0, deepest = 0;
    for (let n = 0; n < N; n++) {
      const s = hb.tick(0)[0], q = s * 0.25119;
      const [l, r, , gr] = swap ? st.tick(q, s) : st.tick(s, q);
      const [, , , grM] = mono.tick(s);
      maxGrDiff = Math.max(maxGrDiff, Math.abs(gr - grM));
      if (Math.abs(s) > 1e-3) {
        const gl = (swap ? l / q : l / s), gR = (swap ? r / s : r / q);
        maxGainMismatch = Math.max(maxGainMismatch, Math.abs(gl - gR));
      }
      deepest = Math.min(deepest, gr);
    }
    return { louderSide: swap ? "right" : "left", squeezeDiffVsMonoOfLouderSideDb: maxGrDiff, leftRightGainMismatch: maxGainMismatch, deepestSqueezeDb: +deepest.toFixed(2) };
  };
  findings.stereoLink = { test: "heartbeat on one side, the same 12 dB down on the other, threshold -30 dB, 10 s", runs: [run(false), run(true)] };
}
fs.writeFileSync(path.join(here, "check-findings.json"), JSON.stringify(findings, null, 2));
for (const r of runs) console.log(r.reference.padEnd(36), String(r.sr).padEnd(6), r.test.slice(0, 22).padEnd(23),
  "audio", r.maxAudioDiff.toExponential(2), "squeeze dB", r.maxSqueezeDiffDb.toExponential(2), "pressure dB", r.maxPressureDiffDb.toExponential(2), "baro", r.baroreceptorMismatches);
console.log("heartbeat source", findings.heartbeatSource);
console.log("codebox render", findings.codeboxRender);
console.log("stereo link", JSON.stringify(findings.stereoLink.runs));
