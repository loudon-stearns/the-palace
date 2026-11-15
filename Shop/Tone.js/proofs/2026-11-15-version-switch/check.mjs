// Tone.js — proof — three versions, one patch — check
//
// title: Tone.js — proof — three versions, one patch — check
// born: 2026-11-15
// links: [[Tone.js]] (connects-to · test-proof-check)
// forward_vector: "I measure what a script can about version-switch.html, on the page's own patch and its three Tone builds:
//   the pitch of each version's two renders (44.1 kHz, then 48 kHz), whether the versions agree when the rate is the
//   same, the position readout fix (#1540), the Transport on the live clock through stop/start, and the page's own
//   buttons. I write measured.json, the renders as .m4a, and a screenshot beside me. A maker who can measure this
//   better does so and leaves both on the Tone.js scroll."
//
//   node "Shop/Tone.js/proofs/2026-11-15-version-switch/check.mjs"    (about 40 s; fetches three tone builds from the CDN)
"use strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const PAGE = "version-switch.html";
const VS = ["15.0.4", "15.1.22", "15.5.72"];
const require = createRequire(path.join(ROOT, "_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");

let fails = 0;
const ok = (cond, what) => { console.log(`${cond ? "  ok  " : "  FAIL"} ${what}`); if (!cond) fails++; };

const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2" };
const srv = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(q.url, "http://x").pathname));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader("content-type", TYPES[path.extname(f)] || "application/octet-stream");
  fs.createReadStream(f).pipe(r);
}).listen(0, "127.0.0.1");
await new Promise(r => srv.on("listening", r));
const url = `http://127.0.0.1:${srv.address().port}/${path.relative(ROOT, path.join(HERE, PAGE)).split(path.sep).map(encodeURIComponent).join("/")}`;

const browser = await chromium.launch();
const errors = [];
const open = async () => {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  page.on("pageerror", e => errors.push(String(e)));
  await page.addInitScript(() => {
    const Native = window.AudioContext; window.__contexts = [];
    window.AudioContext = class extends Native { constructor(...a) { super(...a); window.__contexts.push(this); } };
  });
  await page.goto(url);
  await page.waitForFunction(() => window.PROOF && window.TONES && Object.keys(window.TONES).length === 3);
  return page;
};
const M = {};

// ---- 1. the three builds load, each keeps its own Tone ----
const page = await open();
M.load = await page.evaluate(() => ({ versions: Object.fromEntries(Object.entries(window.TONES).map(([k, T]) => [k, T.version])), contexts: window.__contexts.length, states: window.__contexts.map(c => c.state), rates: window.__contexts.map(c => c.sampleRate) }));
console.log("1. loading\n");
ok(VS.every(v => M.load.versions[v] === v), `three builds, each its own Tone: ${Object.values(M.load.versions).join(", ")}`);
console.log(`       before any click: ${M.load.contexts} AudioContexts (${M.load.states.join(", ")}), one made by each build at load`);

// ---- 2. the renders: pitch at 44.1 then 48 kHz, and the versions against each other at one rate ----
console.log("\n2. the patch rendered offline by each version, first at 44.1 kHz, then at 48 kHz\n");
const R = await page.evaluate(async VS => {
  // the reverb's impulse is noise; seed Math.random the same way before every render so the versions can be compared
  const seed = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const native = Math.random, out = {}, bufs = {};
  for (const v of VS) {
    const T = window.TONES[v], log = [];
    Math.random = seed(7); const first = await window.PROOF.render(T, 44100, log);
    Math.random = seed(7); const second = await window.PROOF.render(T, 48000);
    bufs[v] = first.get();
    out[v] = { hz_first: window.PROOF.a3(first), hz_second: window.PROOF.a3(second), events: log.length, times: log.map(l => +l.time.toFixed(6)),
      wav_first: [Array.from(first.getChannelData(0)), Array.from(first.getChannelData(1))],
      wav_second: [Array.from(second.getChannelData(0)), Array.from(second.getChannelData(1))] };
  }
  Math.random = native;
  // the same rate, version against version: largest sample difference, and the difference's level against the signal
  const cmp = (a, b) => { let mx = 0, d2 = 0, s2 = 0; for (let c = 0; c < 2; c++) { const x = a.getChannelData(c), y = b.getChannelData(c); for (let i = 0; i < x.length; i++) { const d = x[i] - y[i]; mx = Math.max(mx, Math.abs(d)); d2 += d * d; s2 += x[i] * x[i]; } } return { max_abs: mx, diff_db: 10 * Math.log10(Math.max(d2, 1e-30) / s2) }; };
  out.same_rate = { "15.0.4 vs 15.1.22": cmp(bufs["15.0.4"], bufs["15.1.22"]), "15.0.4 vs 15.5.72": cmp(bufs["15.0.4"], bufs["15.5.72"]) };
  // the position readout fix, #1540: at 120 bpm these times sit a hair before a beat
  out.position = Object.fromEntries(VS.map(v => { const T = window.TONES[v]; return [v, [T.Time(1.49994).toBarsBeatsSixteenths(), T.Time(1.99996).toBarsBeatsSixteenths()]]; }));
  return out;
}, VS);
const semis = hz => 12 * Math.log2(hz / 220);
for (const v of VS) console.log(`       ${v.padEnd(8)} A3 at ${R[v].hz_first.toFixed(1)} Hz, then ${R[v].hz_second.toFixed(1)} Hz (${semis(R[v].hz_second) >= 0 ? "+" : ""}${semis(R[v].hz_second).toFixed(2)} semitones); ${R[v].events} events`);
ok(VS.every(v => Math.abs(R[v].hz_first - 220) <= 1), "every version's first render (44.1 kHz) has A3 at 220 Hz");
ok(Math.abs(R["15.5.72"].hz_second - 220) <= 1, `15.5.72's second render (48 kHz) is in tune: ${R["15.5.72"].hz_second.toFixed(1)} Hz`);
ok(["15.0.4", "15.1.22"].every(v => Math.abs(semis(R[v].hz_second)) > 1), `the bug reproduces: 15.0.4 and 15.1.22's second render is off by ${semis(R["15.0.4"].hz_second).toFixed(2)} and ${semis(R["15.1.22"].hz_second).toFixed(2)} semitones (this check fails the day it stops reproducing)`);
ok(VS.every(v => JSON.stringify(R[v].times) === JSON.stringify(R["15.0.4"].times)), "the Part fires at the same times in every version");
for (const [k, c] of Object.entries(R.same_rate)) console.log(`       same rate, ${k}: largest sample difference ${c.max_abs.toExponential(2)}, difference ${c.diff_db.toFixed(1)} dB against the signal`);
ok(Object.values(R.same_rate).every(c => c.diff_db < -60), "at one rate, with the reverb's noise seeded alike, the versions render the same sound to within -60 dB");
console.log(`       position readout, 120 bpm, 1.49994 s and 1.99996 s: ${VS.map(v => `${v} ${R.position[v].join(" / ")}`).join("; ")}`);
ok(R.position["15.0.4"][0] === "0:2:4" && R.position["15.5.72"][0] === "0:3:0", "the readout fix shows: 15.0.4 says 0:2:4 where 15.5.72 says 0:3:0");

// ---- 3. the page's own buttons: pick a version, play its second render, read the table ----
console.log("\n3. the page's own buttons\n");
const P = {};
for (const v of ["15.0.4", "15.5.72"]) {
  await page.click(`[data-v="${v}"]`);
  await page.click("#second");
  await page.waitForFunction(v => [...document.querySelectorAll("#hz tr")].find(tr => tr.cells[0].textContent === v)?.cells[2].textContent !== "—", v, { timeout: 30000 });
  P[v] = await page.evaluate(v => ({ row: [...document.querySelectorAll("#hz tr")].find(tr => tr.cells[0].textContent === v).cells[2].textContent, state: window.TONES[v].getContext().state }), v);
}
ok(P["15.0.4"].state === "running" && P["15.5.72"].state === "running", "each version's context runs after its click");
ok(/^2[34]\d\.\d Hz$/.test(P["15.0.4"].row) && P["15.5.72"].row === "220.0 Hz", `the page's table says 15.0.4 ${P["15.0.4"].row}, 15.5.72 ${P["15.5.72"].row} for the second render`);
await page.click("#stop");
await page.screenshot({ path: path.join(HERE, "version-switch.png"), fullPage: true });
await page.close();

// ---- 4. the live clock: the Transport through five stop/starts in one task, then a start at +0.1 (fixes #1444, #1500, #1506) ----
console.log("\n4. the Transport on the live clock, each version alone in a page, 97.3 bpm, about 14 s\n");
const live = await Promise.all(VS.map(async v => {
  const p = await open();
  return p.evaluate(async v => {
    const T = window.TONES[v]; await T.start();
    const tr = T.getTransport(); tr.bpm.value = 97.3; tr.loop = true; tr.loopStart = 0; tr.loopEnd = "1m";
    const log = { part: [], rep: [], loop: [] };
    new T.Part(t => log.part.push(t), [["0:0:0", 1], ["0:1:0", 1], ["0:2:2", 1], ["0:3:3", 1]]).start(0);
    tr.scheduleRepeat(t => log.rep.push(t), "16n", 0);
    new T.Loop(t => log.loop.push(t), "8t").start(0);
    tr.start("+0.05");
    for (let k = 0; k < 5; k++) { await new Promise(r => setTimeout(r, 1300)); tr.stop(); tr.start(); }
    await new Promise(r => setTimeout(r, 1300)); tr.stop(); tr.start("+0.1");
    await new Promise(r => setTimeout(r, 6000)); tr.stop();
    const dup = a => a.filter((t, i) => i && Math.abs(t - a[i - 1]) < 1e-3).length;
    const gap = (a, step) => a.filter((t, i) => i && a[i] - a[i - 1] > step * 1.5 && a[i] - a[i - 1] < 1.2).length;
    return { v, n: { part: log.part.length, rep: log.rep.length, loop: log.loop.length }, doubled: dup(log.part) + dup(log.rep) + dup(log.loop), skipped: gap(log.rep, 60 / 97.3 / 4) + gap(log.loop, 60 / 97.3 / 3) };
  }, v).finally(() => p.close());
}));
for (const l of live) console.log(`       ${l.v.padEnd(8)} Part ${l.n.part}, scheduleRepeat 16n ${l.n.rep}, Loop 8t ${l.n.loop}; doubled ${l.doubled}, skipped ${l.skipped}`);
ok(live.every(l => l.doubled === 0 && l.skipped === 0), "no version doubled or skipped a tick here (the fixed bugs need conditions this run did not meet)");
ok(errors.length === 0, `no page errors${errors.length ? ": " + errors.join(" | ") : ""}`);

await browser.close(); srv.close();

// ---- write ----
const wav = (chs, sr, file) => {
  const n = chs[0].length, b = Buffer.alloc(44 + n * 4);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 4, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(chs[c][i] * 32767))), 44 + i * 4 + c * 2);
  const tmp = path.join(HERE, file + ".wav"); fs.writeFileSync(tmp, b);
  try { execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "192000", tmp, path.join(HERE, file + ".m4a")]); fs.unlinkSync(tmp); } catch { /* the .wav stays */ }
};
for (const v of ["15.0.4", "15.5.72"]) {
  wav(R[v].wav_first, 44100, `tone-${v.replace(/\./g, "-")}-first-44k`);
  wav(R[v].wav_second, 48000, `tone-${v.replace(/\./g, "-")}-second-48k`);
}
for (const v of VS) { delete R[v].wav_first; delete R[v].wav_second; }
Object.assign(M, { renders: R, page_table: P, live_transport: live, when: new Date().toISOString(), fails });
fs.writeFileSync(path.join(HERE, "measured.json"), JSON.stringify(M, null, 1) + "\n");
console.log("\nwrote measured.json, version-switch.png, and four renders (15.0.4 and 15.5.72, first and second)");
console.log(fails ? `\n${fails} check(s) failed` : "\nall checks pass");
process.exit(fails ? 1 : 0);
