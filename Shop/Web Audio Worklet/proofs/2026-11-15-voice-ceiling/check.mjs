// Web Audio Worklet — proof — the voice ceiling — check
//
// title: Web Audio Worklet — proof — the voice ceiling — check
// born: 2026-11-15
// links: [[Web Audio Worklet]] (connects-to · test-proof-check)
// forward_vector: "I measure what a script can about the voice ceiling, on the proof page's own worklet: the engine run
//   in Node, then rendered offline at eight voice counts in headless Chromium, Firefox and WebKit, then played live in
//   headless Chromium for its meter. Each check names the number that would fail it. The ear's answer is not mine to give.
//   A better meter or method is welcome; leave the comparison on the scroll."
//
//   node "Shop/Web Audio Worklet/proofs/2026-11-15-voice-ceiling/check.mjs"     about a minute; writes measured.json
"use strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import os from "node:os";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const PAGE = path.join(HERE, "voice-ceiling.html");
const { chromium, firefox, webkit } = await import(path.join(ROOT, "_ops/stigmergy/app/node_modules/playwright/index.mjs"));

let fails = 0;
const ok = (cond, what) => { console.log(`${cond ? "  ok  " : "  FAIL"} ${what}`); if (!cond) fails++; };
const SRC = fs.readFileSync(PAGE, "utf8").match(/const WORKLET = `([\s\S]*?)`;/)[1];
const SR = 48000, NS = [8, 16, 32, 64, 128, 256, 512, 1024], SEC = 2;
const M = { date: "2026-11-15", host: `${process.platform} ${process.arch} · ${os.cpus().length} cores · ${os.cpus()[0].model}`, loadavgAtStart: os.loadavg(), sampleRate: SR, seconds: SEC, ns: NS, timing: "best of 3 renders after one warm-up; the Mac was shared with other work, see loadavg" };

// ---- 1. the engine in Node, with a stubbed AudioWorkletProcessor ----
console.log("1. the engine in Node (60 voices, 2 s)\n");
function engine() {
  let Proc = null;
  class AudioWorkletProcessor { constructor() { this.port = { postMessage() {}, onmessage: null }; } }
  new Function("AudioWorkletProcessor", "registerProcessor", "sampleRate", SRC)(AudioWorkletProcessor, (n, c) => { Proc = c; }, SR);
  return Proc;
}
function runNode(voices, hoist, sec = SEC) {
  const P = engine(), p = new P({ processorOptions: { voices, hoist } });
  const out = new Float32Array(sec * SR), L = new Float32Array(128), R = new Float32Array(128);
  for (let k = 0; k < out.length; k += 128) { p.process([], [[L, R]]); out.set(L.subarray(0, Math.min(128, out.length - k)), k); }
  return out;
}
const stat = (a) => { let s2 = 0, pk = 0, nf = 0; for (const v of a) { if (!Number.isFinite(v)) nf++; s2 += v * v; pk = Math.max(pk, Math.abs(v)); } return { rms: Math.sqrt(s2 / a.length), peak: pk, nonfinite: nf }; };
const n60 = runNode(60, false), n60b = runNode(60, false), n60h = runNode(60, true);
const s60 = stat(n60);
ok(s60.nonfinite === 0 && s60.rms > 0.01, `60 voices: no non-finite samples, not silent (rms ${s60.rms.toFixed(3)}, peak ${s60.peak.toFixed(3)}); fails on any NaN or rms under 0.01`);
ok(n60.every((v, i) => v === n60b[i]), "the seeded engine renders the same samples twice; fails on any difference");
ok(n60.every((v, i) => v === n60h[i]), "the pan worked out once per voice gives the same samples as per sample; fails on any difference");
M.node = { rms60: s60.rms, peak60: s60.peak };

// ---- 2. offline renders in three engines ----
const server = http.createServer((req, res) => { res.writeHead(200, { "content-type": "text/html" }); res.end(fs.readFileSync(PAGE)); });
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const URL0 = `http://127.0.0.1:${server.address().port}/voice-ceiling.html`;

async function renderIn(page, voices, hoist, sec, keep) {
  return page.evaluate(async ({ src, voices, hoist, sec, sr, keep }) => {
    const best = { ms: Infinity };
    for (let rep = 0; rep < 3; rep++) {
      const ctx = new OfflineAudioContext({ numberOfChannels: 2, length: sec * sr, sampleRate: sr });
      const url = URL.createObjectURL(new Blob([src], { type: "application/javascript" }));
      await ctx.audioWorklet.addModule(url);
      const node = new AudioWorkletNode(ctx, "ceiling", { numberOfInputs: 0, outputChannelCount: [2], processorOptions: { voices, hoist } });
      node.connect(ctx.destination);
      const t0 = performance.now(); const buf = await ctx.startRendering(); const ms = performance.now() - t0;
      if (ms < best.ms) {
        const L = buf.getChannelData(0); let s2 = 0, nf = 0; for (const v of L) { if (!Number.isFinite(v)) nf++; s2 += v * v; }
        best.ms = ms; best.rms = Math.sqrt(s2 / L.length); best.nonfinite = nf;
        if (keep) best.head = Array.from(L.subarray(0, keep));
      }
    }
    return best;
  }, { src: SRC, voices, hoist, sec, sr: SR, keep });
}
const fit = (xs, ys) => { const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; } const slope = sxy / sxx; return { slope, icpt: my - slope * mx, r2: sxy * sxy / (sxx * syy) }; };

M.engines = {};
for (const [name, type] of [["chromium", chromium], ["firefox", firefox], ["webkit", webkit]]) {
  console.log(`\n2. offline renders, ${name}\n`);
  let browser;
  try {
    browser = await type.launch();
    const page = await browser.newPage(); await page.goto(URL0);
    const ua = await page.evaluate(() => navigator.userAgent);
    await renderIn(page, 64, false, SEC, 0);                       // warm the engine's compiler before timing
    const rows = [];
    for (const n of NS) {
      const r = await renderIn(page, n, false, SEC, 0);
      rows.push({ n, ms: r.ms, load: r.ms / (SEC * 1000), rms: r.rms, nonfinite: r.nonfinite });
      console.log(`     ${String(n).padStart(5)} voices   ${r.ms.toFixed(0).padStart(6)} ms for ${SEC} s   load ${(100 * r.ms / (SEC * 1000)).toFixed(1).padStart(6)}%   rms ${r.rms.toFixed(3)}`);
    }
    // the cost per voice is fitted where a page would play (up to 256); the full-core count is read off the measured
    // points, not extrapolated, because past a few hundred voices some engines grow faster than a straight line
    const lo = rows.filter((r) => r.n <= 256), f = fit(lo.map((r) => r.n), lo.map((r) => r.load));
    const usPerVoice = f.slope * 1e6, at60 = f.icpt + 60 * f.slope;
    let ceiling = null; for (let i = 1; i < rows.length; i++) if (rows[i - 1].load < 1 && rows[i].load >= 1) { const a = rows[i - 1], b = rows[i]; ceiling = Math.round(a.n + (1 - a.load) * (b.n - a.n) / (b.load - a.load)); }
    const tail = rows.at(-1).load / rows.at(-2).load;
    ok(rows.every((r) => r.nonfinite === 0 && r.rms > 0.01), `${name}: every render finite and sounding; fails on a NaN or rms under 0.01`);
    ok(f.r2 > 0.95, `${name}: up to 256 voices, render time grows in a straight line with voices (r² ${f.r2.toFixed(4)}); fails under 0.95`);
    console.log(`     ${usPerVoice.toFixed(0)} µs of a core per voice per second of sound (fit to 256); one core is used up near ${ceiling} voices (read between measured points); 60 voices ≈ ${(100 * at60).toFixed(1)}% of real time; 512 → 1024 voices cost ${tail.toFixed(2)}× (2 would be a straight line)`);
    const e = { ua, rows, usPerVoice, ceilingFullCore: ceiling, at60, r2To256: f.r2, tail512to1024: tail };
    if (name === "chromium") {
      const h = [];
      for (const n of [256, 1024]) { const a = rows.find((r) => r.n === n), b = await renderIn(page, n, true, SEC, 0); h.push({ n, original: a.ms, hoisted: b.ms, ratio: a.ms / b.ms }); }
      console.log(`     the pan worked out once: ${h.map((x) => `${x.n} voices ${x.original.toFixed(0)} → ${x.hoisted.toFixed(0)} ms (${x.ratio.toFixed(2)}×)`).join(", ")}`);
      e.hoisted = h;
      const r60 = await renderIn(page, 60, false, SEC, SEC * SR);
      let md = 0; for (let i = 0; i < r60.head.length; i++) md = Math.max(md, Math.abs(r60.head[i] - n60[i]));
      ok(md < 1e-5, `Chromium's render of 60 voices matches the Node run sample for sample (largest difference ${md.toExponential(2)}); fails over 1e-5`);
      e.nodeVsChromiumMaxDiff = md;
    }
    M.engines[name] = e;
  } catch (err) {
    console.log(`  FAIL ${name}: ${err.message.split("\n")[0]}`); fails++; M.engines[name] = { error: err.message.split("\n")[0] };
  } finally { if (browser) await browser.close(); }
}

// ---- 3. the page played live in headless Chromium: does the meter read? ----
console.log("\n3. the page live, headless Chromium (no speakers): its own meter\n");
{
  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const page = await browser.newPage(); await page.goto(URL0);
  const before = await page.evaluate(() => typeof ctx === "undefined" ? "none" : String(ctx));
  ok(before === "null", "no AudioContext exists before the click; fails if one does");
  await page.click("#sound");
  const live = [];
  for (const target of [64, 256, 384, 512, 1024]) {
    await page.evaluate((t) => setVoices(t), target);
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => ({ n: voices, load: last && last.load, peak: last && last.peak, clock: last && last.clock, block: last && last.block, under: document.getElementById("under").textContent, info: document.getElementById("ctxinfo").textContent }));
    live.push(r);
    console.log(`     ${String(r.n).padStart(5)} voices   load ${r.load == null ? "—" : (100 * r.load).toFixed(1) + "%"}   worst block ${r.peak == null ? "—" : (100 * r.peak).toFixed(0) + "%"}   dropouts: ${r.under}`);
  }
  ok(live.every((r) => typeof r.load === "number" && r.load > 0), "the live meter reads a load at every count; fails on a missing or zero figure");
  ok(live.at(-1).load > live[0].load, `more voices read as more load (${(100 * live[0].load).toFixed(1)}% at 64, ${(100 * live.at(-1).load).toFixed(1)}% at 1024); fails if not`);
  console.log(`     clock in the audio thread: ${live[0].clock}; ${live[0].info}`);
  M.live = { note: "headless Chromium, fake audio output, no speakers: the meter works; its numbers are not the Mac's heard ceiling", rows: live };
  await browser.close();
}
server.close();

M.fails = fails; M.loadavgAtEnd = os.loadavg();
fs.writeFileSync(path.join(HERE, "measured.json"), JSON.stringify(M, null, 2) + "\n");
console.log(`\n${fails ? fails + " FAILED" : "all ok"} · measured.json written`);
process.exitCode = fails ? 1 : 0;
