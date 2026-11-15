// Web Audio Worklet — proof — the block size, old against new — check
//
// title: Web Audio Worklet — proof — the block size — check
// born: 2026-11-15
// links: [[Web Audio Worklet]] (connects-to · test-proof-check)
// forward_vector: "I measure renderSizeHint against the old fixed 128 on the proof page's own worklet, in headless
//   Chromium: whether the hint is honoured, whether process() really sees the bigger block, whether the sound is the
//   same sample for sample, and what it costs in time offline and live. Each check names the number that would fail
//   it. Headless Chromium 147 needs a Blink flag for the hint; a Chrome that has shipped it needs none. A better
//   comparison is welcome; leave it on the scroll."
//
//   node "Shop/Web Audio Worklet/proofs/2026-11-15-render-quantum/check.mjs"     about a minute; writes measured.json
"use strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const PAGE = path.join(HERE, "render-quantum.html");
const { chromium } = await import(path.join(ROOT, "_ops/stigmergy/app/node_modules/playwright/index.mjs"));
const FLAG = "--enable-blink-features=WebAudioConfigurableRenderQuantum";

let fails = 0;
const ok = (cond, what) => { console.log(`${cond ? "  ok  " : "  FAIL"} ${what}`); if (!cond) fails++; };
const SRC = fs.readFileSync(PAGE, "utf8").match(/const WORKLET = `([\s\S]*?)`;/)[1];
const SR = 48000, SEC = 2, QS = [128, 256, 512, 1024], NS = [64, 256, 512];
const M = { date: "2026-11-15", host: `${process.platform} ${process.arch} · ${os.cpus().length} cores`, loadavgAtStart: os.loadavg(), sampleRate: SR, seconds: SEC, timing: "best of 3 renders after one warm-up; the Mac was shared with other work, see loadavg" };

const server = http.createServer((req, res) => { res.writeHead(200, { "content-type": "text/html" }); res.end(fs.readFileSync(PAGE)); });
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const URL0 = `http://127.0.0.1:${server.address().port}/render-quantum.html`;

const render = (page, q, voices, keep) => page.evaluate(async ({ src, q, voices, sec, sr, keep }) => {
  const best = { ms: Infinity };
  for (let rep = 0; rep < 3; rep++) {
    const opts = { numberOfChannels: 2, length: sec * sr, sampleRate: sr };
    if (q) opts.renderSizeHint = q;
    const ctx = new OfflineAudioContext(opts);
    const url = URL.createObjectURL(new Blob([src], { type: "application/javascript" }));
    await ctx.audioWorklet.addModule(url);
    const node = new AudioWorkletNode(ctx, "ceiling", { numberOfInputs: 0, outputChannelCount: [2], processorOptions: { voices } });
    const blocks = new Set(); node.port.onmessage = (e) => blocks.add(e.data.block);
    node.connect(ctx.destination);
    const t0 = performance.now(); const buf = await ctx.startRendering(); const ms = performance.now() - t0;
    await new Promise((r) => setTimeout(r, 150));
    if (ms < best.ms) Object.assign(best, { ms, given: ctx.renderQuantumSize, blocks: [...blocks], head: keep ? Array.from(buf.getChannelData(0)) : null });
  }
  return best;
}, { src: SRC, q, voices, sec: SEC, sr: SR, keep });

// ---- 1. without the flag: the old browser's view ----
console.log("1. headless Chromium 147 as shipped: is the hint there?\n");
{
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto(URL0);
  const r = await render(p, 512, 64, false);
  ok(r.given === undefined && r.blocks.every((x) => x === 128), `no renderQuantumSize, and process() still sees ${r.blocks.join(",")}-frame blocks when 512 is asked: the hint is ignored, nothing breaks; fails if it throws or the block is not 128`);
  M.unflagged = { ua: await p.evaluate(() => navigator.userAgent), given: r.given ?? null, blocks: r.blocks };
  await b.close();
}

// ---- 2. with the flag: old against new, offline ----
console.log(`\n2. with ${FLAG}: the same cloud at four block sizes, offline\n`);
const b = await chromium.launch({ args: [FLAG] });
const page = await b.newPage(); await page.goto(URL0);
await render(page, 128, 64, false);                                  // warm the compiler
const ref = {};
M.offline = [];
for (const n of NS) {
  const row = { voices: n };
  for (const q of QS) {
    const r = await render(page, q, n, n === 256);
    row[q] = { ms: r.ms, load: r.ms / (SEC * 1000), given: r.given, blocks: r.blocks };
    if (n === 256) {
      if (q === 128) ref.head = r.head;
      else { let md = 0; for (let i = 0; i < r.head.length; i++) md = Math.max(md, Math.abs(r.head[i] - ref.head[i])); row[q].maxDiffFrom128 = md; }
    }
  }
  M.offline.push(row);
  console.log(`     ${String(n).padStart(4)} voices   ` + QS.map((q) => `${q}: ${(100 * row[q].load).toFixed(1).padStart(5)}%`).join("   "));
}
ok(M.offline.every((row) => QS.every((q) => row[q].given === q && row[q].blocks.length === 1 && row[q].blocks[0] === q)), "every block size asked was given, and process() saw exactly that many frames; fails on any mismatch");
const r256 = M.offline.find((r) => r.voices === 256);
ok(QS.slice(1).every((q) => r256[q].maxDiffFrom128 === 0), `256 voices: the sound at 256, 512 and 1024 is the sound at 128, sample for sample (largest differences ${QS.slice(1).map((q) => r256[q].maxDiffFrom128).join(", ")}); fails on any difference`);
for (const row of M.offline) { row.saving512 = 1 - row[512].ms / row[128].ms; row.saving1024 = 1 - row[1024].ms / row[128].ms; }
console.log(`     time saved against 128: ${M.offline.map((r) => `${r.voices} voices ${(100 * r.saving512).toFixed(0)}% at 512, ${(100 * r.saving1024).toFixed(0)}% at 1024`).join("; ")}`);

// ---- 3. live, through the page's own buttons ----
console.log("\n3. the page live, headless Chromium with the flag (no speakers)\n");
{
  const lp = await chromium.launch({ args: [FLAG, "--autoplay-policy=no-user-gesture-required"] });
  const p = await lp.newPage(); await p.goto(URL0);
  ok(await p.evaluate(() => ctx === null), "no AudioContext before the click; fails if one exists");
  await p.click("#sound"); await p.evaluate(() => building);
  M.live = { note: "headless Chromium, fake audio output: whether the page asks and reads right; its numbers are not the Mac's heard ceiling", rows: [] };
  for (const n of [256, 512, 768]) {
    for (const q of [128, 512]) {
      await p.click(`#blocks button[data-q="${q}"]`); await p.evaluate(() => building);
      await p.evaluate((n) => setVoices(n), n);
      await p.waitForTimeout(3000);
      const r = await p.evaluate(() => ({ n: voices, q: quantum, given: ctx.renderQuantumSize, block: last && last.block, load: last && last.load, under: document.getElementById("under").textContent, info: document.getElementById("ctxinfo").textContent, givenText: document.getElementById("given").textContent }));
      M.live.rows.push(r);
      console.log(`     ${String(n).padStart(4)} voices, block ${String(q).padStart(4)} (given ${r.given}, process() saw ${r.block})   load ${r.load == null ? "—" : (100 * r.load).toFixed(1) + "%"}   dropouts: ${r.under}`);
    }
  }
  ok(M.live.rows.every((r) => r.given === r.q && r.block === r.q), "live, the page's buttons get the block they ask for and process() sees it; fails on any mismatch");
  M.live.info = M.live.rows[0].info;
  console.log(`     ${M.live.info}`);
  await lp.close();
}
await b.close(); server.close();

M.fails = fails; M.loadavgAtEnd = os.loadavg();
fs.writeFileSync(path.join(HERE, "measured.json"), JSON.stringify(M, null, 2) + "\n");
console.log(`\n${fails ? fails + " FAILED" : "all ok"} · measured.json written`);
process.exitCode = fails ? 1 : 0;
