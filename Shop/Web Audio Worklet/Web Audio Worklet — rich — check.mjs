// Web Audio Worklet — rich — check
//
// title: Web Audio Worklet — rich — check
// born: 2026-11-03
// links: [[Web Audio Worklet]] (connects-to, rich-face-check)
// forward_vector: "I re-check the claims the rich face's made pieces test, on the pieces' own worklet code: the splice's
//   engine run in node against the Gotchas' granular claim, and the two-places engine rendered in headless Chromium
//   against the stereo claim and its defensive idiom. Run me after any change to a piece or to the section."
//
//   node "Shop/Web Audio Worklet/Web Audio Worklet — rich — check.mjs"            both parts (about half a minute)
//   node "Shop/Web Audio Worklet/Web Audio Worklet — rich — check.mjs" --splice   the node part only
"use strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const SPLICE = path.join(HERE, "Web Audio Worklet — rich — the splice.html");
const TWO = path.join(HERE, "Web Audio Worklet — rich — two places.html");
const ONLY_SPLICE = process.argv.includes("--splice");

let fails = 0;
const ok = (cond, what) => { console.log(`${cond ? "  ok  " : "  FAIL"} ${what}`); if (!cond) fails++; };
const workletOf = file => { const src = fs.readFileSync(file, "utf8"); const m = src.match(/const WORKLET = `([\s\S]*?)`;/); if (!m) throw new Error("no WORKLET in " + path.basename(file)); return m[1]; };

// ---- part 1: the splice's own processor, run in node ----
const SR = 48000;
function spliceEngine() {
  let Proc = null;
  class AudioWorkletProcessor { constructor() { this.port = { posted: [], postMessage(m) { this.posted.push(m); }, onmessage: null }; } }
  new Function("AudioWorkletProcessor", "registerProcessor", "sampleRate", workletOf(SPLICE))(AudioWorkletProcessor, (n, c) => { Proc = c; }, SR);
  return Proc;
}
const Splice = spliceEngine();
// run a setting for `sec` seconds after `warm` seconds; return the output and the step every jump put in
function run(set, sec = 4, warm = 1) {
  const p = new Splice(); p.port.onmessage({ data: set });
  const out = new Float32Array(Math.round(sec * SR)), L = new Float32Array(128), R = new Float32Array(128);
  // warm up in whole blocks, then record until the buffer is full: a tail left at zero would be a cut, and a cut is top end
  const warmBlocks = Math.round(warm * SR / 128); let k = 0;
  for (let b = 0; k < out.length; b++) {
    if (b === warmBlocks) { p.acc = { s2: 0, d2: 0, len: 0, jumps: 0, sum: 0, max: 0 }; p.port.posted.length = 0; }
    p.process([], [[L, R]]);
    if (b >= warmBlocks) for (let i = 0; i < 128 && k < out.length; i++) out[k++] = L[i];
  }
  const meters = p.port.posted.filter(m => m.kind === "meter");
  const jumps = meters.reduce((a, m) => a + m.jps * 0.25, 0) / (meters.length * 0.25);
  const mean = meters.reduce((a, m) => a + m.mean, 0) / meters.length, max = Math.max(...meters.map(m => m.max));
  let s2 = 0, d2 = 0, nf = 0, big = 0;
  for (let i = 2; i < out.length; i++) { const d = out[i] - 2 * out[i - 1] + out[i - 2]; s2 += out[i] ** 2; d2 += d * d; if (!Number.isFinite(out[i])) nf++; }
  return { jumps, mean, max, hb: 10 * Math.log10(d2 / s2), rms: Math.sqrt(s2 / out.length), nf, peak: out.reduce((a, v) => Math.max(a, Math.abs(v)), 0) };
}
const hann = a => 0.5 - 0.5 * Math.cos(2 * Math.PI * a);
const base = { n: 1, grainMs: 80, freq: 220, at: 0, scatter: true, spread: 0, table: "sine" };
const RESULTS = {};

console.log("1. the splice: the page's granular gotcha, on the piece's own worklet\n");
{
  const plain = run({ ...base, scatter: false });
  ok(plain.jumps === 0 && plain.nf === 0, `one grain, no scatter: no jumps, no non-finite samples (peak ${plain.peak.toFixed(3)}); top end ${plain.hb.toFixed(1)} dB`);
  const zero = run(base);
  ok(Math.abs(zero.jumps - 12.5) < 0.6, `scatter at the window's zero: ${zero.jumps.toFixed(2)} jumps a second (one per 80 ms grain)`);
  ok(zero.max < 1e-5, `…and the largest step any jump put in the sound is ${zero.max.toExponential(2)} of full scale (the window at the first sample after it shuts)`);
  ok(Math.abs(zero.hb - plain.hb) < 1.5, `…and the top end is where it was without scatter: ${zero.hb.toFixed(1)} against ${plain.hb.toFixed(1)} dB`);
  RESULTS.one = { plainHb: plain.hb, zeroHb: zero.hb, zeroMax: zero.max };

  console.log("\n   the jump slid off the zero, one grain (80 ms, 220 Hz sine):");
  console.log("     a        w(a)     mean step   mean ÷ w(a)   top end");
  const rows = [];
  for (const at of [0, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5]) {
    const r = run({ ...base, at }, 8, 1);
    rows.push({ at, w: hann(at), mean: r.mean, hb: r.hb });
    console.log(`     ${at.toFixed(2)}    ${hann(at).toFixed(4)}   ${r.mean.toFixed(5)}     ${at ? (r.mean / hann(at)).toFixed(3) : "  ·  "}       ${r.hb.toFixed(1)} dB`);
  }
  const ratios = rows.filter(r => r.at >= 0.02).map(r => r.mean / r.w), rm = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  ok(ratios.every(q => Math.abs(q / rm - 1) < 0.04), `the same jumps (one seed), scaled by the window at the jump point: step ÷ w(a) holds at ${rm.toFixed(3)} within 4% from a 0.02 to 0.5`);
  // for a sine read at two uniform random places, E|sin u − sin v| = 8/π² ≈ 0.811; the grain's level is 0.5.
  // One seed's hundred jumps is a small sample, so the constant is checked on a long run: 750 jumps.
  const long = run({ ...base, at: 0.5 }, 60, 1);
  ok(Math.abs(long.mean - 0.5 * 8 / Math.PI ** 2) < 0.025, `…and mid-grain, over 60 s, the mean step is ${long.mean.toFixed(3)}: the grain's level (0.5) times E|sin u − sin v| = 8/π², ${(0.5 * 8 / Math.PI ** 2).toFixed(3)}`);
  RESULTS.longMid = long.mean;
  ok(rows.at(-1).hb - rows[0].hb > 20, `mid-grain the top end rises ${(rows.at(-1).hb - rows[0].hb).toFixed(1)} dB over the jump at the zero`);
  RESULTS.move = rows;

  console.log("\n   the test, a cloud (60 ms grains, ±12 cents, scatter on):");
  console.log("     table    n    jumps/s (expected)   step at 0   step mid    top end at 0   mid     rise");
  RESULTS.cloud = [];
  for (const table of ["sine", "bright"]) for (const n of [4, 16, 32]) {
    const cl = { ...base, n, grainMs: 60, spread: 12, table };
    const a = run({ ...cl, at: 0 }, 6, 1.5), b = run({ ...cl, at: 0.5 }, 6, 1.5), exp = n * 1000 / 60;
    RESULTS.cloud.push({ table, n, jumps: b.jumps, expected: exp, stepZero: a.mean, stepMid: b.mean, hbZero: a.hb, hbMid: b.hb, rise: b.hb - a.hb, nf: a.nf + b.nf, peak: Math.max(a.peak, b.peak) });
    console.log(`     ${table.padEnd(7)} ${String(n).padStart(2)}   ${b.jumps.toFixed(1).padStart(6)} (${exp.toFixed(1)})       ${a.mean.toExponential(1)}     ${b.mean.toFixed(4)}    ${a.hb.toFixed(1).padStart(6)} dB    ${b.hb.toFixed(1).padStart(6)}   ${(b.hb - a.hb).toFixed(1).padStart(5)} dB`);
  }
  const sine = RESULTS.cloud.filter(r => r.table === "sine");
  ok(sine.every(r => Math.abs(r.jumps / r.expected - 1) < 0.03), "mid-grain, every grain jumps once a grain: jumps a second = n ÷ grain length, at 4, 16 and 32 grains");
  ok(sine.every(r => r.rise > 30) && Math.max(...sine.map(r => r.rise)) - Math.min(...sine.map(r => r.rise)) < 2, `crowding doesn't dilute it, sine: the top end rises ${sine.map(r => r.rise.toFixed(1)).join(", ")} dB at 4, 16, 32 grains`);
  const bright = RESULTS.cloud.filter(r => r.table === "bright");
  ok(bright.every(r => r.rise > 3), `a source with its own top end covers some of it: the bright table's rise is ${bright.map(r => r.rise.toFixed(1)).join(", ")} dB`);
  ok(RESULTS.cloud.every(r => r.nf === 0 && r.peak <= 1), "no non-finite samples and no sample past full scale in any cloud");
}

// ---- part 2: the two-places processor, rendered in headless Chromium ----
if (!ONLY_SPLICE && fs.existsSync(TWO)) {
  console.log("\n2. two places: the stereo gotcha, rendered offline in headless Chromium on the piece's own worklet\n");
  const require = createRequire(path.join(ROOT, "_ops/stigmergy/app/package.json"));
  const { chromium } = require("playwright");
  const srv = http.createServer((q, r) => { r.setHeader("content-type", "text/html"); r.end("<!doctype html><title>check</title>"); }).listen(0, "127.0.0.1");
  await new Promise(r => srv.on("listening", r));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${srv.address().port}/`);
  const rows = await page.evaluate(async SRC => {
    const url = URL.createObjectURL(new Blob([SRC], { type: "application/javascript" }));
    const out = [];
    for (const [loop, ask] of [["both", true], ["leftOnly", true], ["both", false], ["idiom", false], ["guard", false], ["fold", false], ["idiom", true], ["fold", true]]) {
      const ctx = new OfflineAudioContext(2, 48000, 48000);
      await ctx.audioWorklet.addModule(url);
      const opts = { numberOfInputs: 0, processorOptions: { loop } }; if (ask) opts.outputChannelCount = [2];
      const node = new AudioWorkletNode(ctx, "two-places", opts);
      let err = false, chans = null; node.onprocessorerror = () => { err = true; }; node.port.onmessage = e => { if (e.data.chans) chans = e.data.chans; };
      node.connect(ctx.destination);
      const buf = await ctx.startRendering(); await new Promise(r => setTimeout(r, 30));
      const tone = (c, f) => { const d = buf.getChannelData(c); let re = 0, im = 0; for (let i = 0; i < d.length; i++) { re += d[i] * Math.cos(2 * Math.PI * f * i / 48000); im += d[i] * Math.sin(2 * Math.PI * f * i / 48000); } return 2 * Math.hypot(re, im) / d.length; };
      out.push({ loop, ask, chans, err, L330: tone(0, 330), L495: tone(0, 495), R330: tone(1, 330), R495: tone(1, 495) });
    }
    return { ua: navigator.userAgent.match(/Chrome\/[\d.]+/)[0], out };
  }, workletOf(TWO));
  await browser.close(); srv.close();
  const A = 0.2, has = v => v > A * 0.5, none = v => v < 1e-4, f = r => `left ear 330 ${r.L330.toFixed(3)} · 495 ${r.L495.toFixed(3)}; right ear 330 ${r.R330.toFixed(3)} · 495 ${r.R495.toFixed(3)}`;
  const get = (loop, ask) => rows.out.find(r => r.loop === loop && r.ask === ask);
  console.log(`   ${rows.ua}; the left voice is 330 Hz, the right 495 Hz, each at ${A}\n`);
  let r = get("both", true);
  ok(r.chans === 2 && has(r.L330) && none(r.L495) && has(r.R495) && none(r.R330), `asked in both places: process() is given ${r.chans} channels, each voice in its own ear (${f(r)})`);
  r = get("leftOnly", true);
  ok(r.chans === 2 && has(r.L330) && none(r.R330) && none(r.R495), `asked in the constructor, out[1] never written: the right ear is silent (${f(r)})`);
  r = get("both", false);
  ok(r.chans === 1 && r.err && none(r.L330) && none(r.R495), `out[1] written but never asked for: process() is given ${r.chans} channel, the write throws, processorerror fires, and both ears are silent`);
  r = get("idiom", false);
  ok(r.chans === 1 && !r.err && none(r.L330) && has(r.L495) && has(r.R495), `the idiom out[1] || out[0], written left then right, not asked: no throw, and the left voice is gone from both ears (${f(r)})`);
  r = get("guard", false);
  ok(!r.err && has(r.L330) && none(r.L495) && none(r.R495), `Murmuration.html's guarded form, not asked: the right voice is gone from both ears (${f(r)})`);
  r = get("fold", false);
  ok(!r.err && has(r.L330 * 2) && has(r.L495 * 2) && Math.abs(r.L330 - r.R330) < 1e-4, `folded to mono when out[1] is missing: both voices in both ears, each at half (${f(r)})`);
  r = get("idiom", true);
  ok(has(r.L330) && none(r.L495) && has(r.R495), "the idiom, asked for two: stereo as meant");
  r = get("fold", true);
  ok(has(r.L330) && none(r.L495) && has(r.R495) && none(r.R330), "the fold, asked for two: stereo as meant");
  RESULTS.two = rows;
}

if (process.env.CHECK_OUT) fs.writeFileSync(process.env.CHECK_OUT, JSON.stringify(RESULTS, null, 1));
console.log(fails ? `\n${fails} check(s) failed` : "\nall checks pass");
process.exit(fails ? 1 : 0);
