// Tone.js — proof — a phrase on the Transport — check
//
// title: Tone.js — proof — a phrase on the Transport — check
// born: 2026-11-15
// links: [[Tone.js]] (connects-to · test-proof-check)
// forward_vector: "I measure what a script can about polysynth-transport.html, on the page's own patch: when each note was
//   scheduled, where its attack lands in the rendered sound, whether a chord's four tones sound together, the peak after
//   the limiter, the effects' tail, and the same phrase on the live clock. I write measured.json and a rendered
//   phrase.m4a beside me. A maker who can measure this better does so and leaves both on the Tone.js scroll."
//
//   node "Shop/Tone.js/proofs/2026-11-15-polysynth-transport/check.mjs"     (about 15 s; fetches tone from the CDN)
"use strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");
const PAGE = "polysynth-transport.html";
const require = createRequire(path.join(ROOT, "_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");

let fails = 0;
const ok = (cond, what) => { console.log(`${cond ? "  ok  " : "  FAIL"} ${what}`); if (!cond) fails++; };

// a static server over the palace root, so the page's design-system link resolves
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
const page = await browser.newPage();
const errors = [];
page.on("pageerror", e => errors.push(String(e)));
await page.addInitScript(() => {
  const Native = window.AudioContext; window.__contexts = [];
  window.AudioContext = class extends Native { constructor(...a) { super(...a); window.__contexts.push(this); } };
});
await page.goto(url);
await page.waitForFunction(() => window.PROOF && window.Tone);

const M = {};
M.before_click = await page.evaluate(() => ({ contexts: window.__contexts.length, states: window.__contexts.map(c => c.state), tone: Tone.version }));
console.log(`tone ${M.before_click.tone}; before any click: ${M.before_click.contexts} AudioContext(s), ${M.before_click.states.join(", ")}\n`);

// ---- 1. offline: render the page's own patch, dry and wet, and measure ----
const R = await page.evaluate(async () => {
  const { render, EVENTS, BPM } = window.PROOF;
  const sec = s => { const [b, q, x] = s.split(":").map(Number); return (b * 4 + q + x / 4) * 60 / BPM; };
  const expected = []; for (let loop = 0; loop < 2; loop++) for (const [t, notes] of EVENTS) expected.push({ t: loop * 8 * 60 / BPM + sec(t), notes });
  const dry = await render(Tone, { wet: false });
  const wet = await render(Tone, { wet: true });
  const sr = dry.buf.sampleRate;
  const mono = b => { const L = b.getChannelData(0), Rr = b.getChannelData(1), m = new Float32Array(L.length); for (let i = 0; i < L.length; i++) m[i] = (L[i] + Rr[i]) / 2; return m; };
  const rms = (d, a, b) => { a = Math.max(0, Math.round(a * sr)); b = Math.min(d.length, Math.round(b * sr)); let s = 0; for (let i = a; i < b; i++) s += d[i] * d[i]; return Math.sqrt(s / Math.max(1, b - a)); };
  const db = v => 20 * Math.log10(Math.max(v, 1e-9));
  const D = mono(dry.buf), W = mono(wet.buf);
  const amp = (d, f, a, b) => { a = Math.max(0, Math.round(a * sr)); b = Math.min(d.length, Math.round(b * sr)); const n = b - a; if (n <= 0) return 0; let re = 0, im = 0; for (let i = 0; i < n; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n); re += w * d[a + i] * Math.cos(2 * Math.PI * f * i / sr); im += w * d[a + i] * Math.sin(2 * Math.PI * f * i / sr); } return Math.hypot(re, im) / n; };
  const hz = n => Tone.Frequency(n).toFrequency();
  // where the attacks are: at every expected onset, the event's own pitches in the 80 ms after against the 80 ms before.
  // (Broadband level was tried first: a top note over a chord still sounding rose only 1.1 dB, too little to tell from nothing.)
  const rises = expected.map(e => { const s = (a, b) => e.notes.reduce((k, n) => k + amp(D, hz(n), a, b), 0); return db(s(e.t, e.t + 0.08)) - db(s(e.t - 0.08, e.t)); });
  // attacks nobody asked for: any 6 dB rise above -45 dBFS, 5 ms hop, not within 20 ms of an expected onset
  const found = []; for (let t = 0.025; t < dry.seconds - 0.03; t += 0.005) { const a = rms(D, t, t + 0.025), b = rms(D, t - 0.025, t); if (db(a) > -45 && db(a) - db(b) > 6) { if (!found.length || t - found.at(-1) > 0.04) found.push(t); } }
  const stray = found.filter(t => !expected.some(e => Math.abs(e.t - t) < 0.02));
  // chord tones: a Hann-windowed DFT at each tone and its semitone neighbours
  const chord = (notes, a, b) => notes.map(n => { const f = hz(n), on = amp(D, f, a, b), nb = Math.max(amp(D, f * 2 ** (1 / 12), a, b), amp(D, f * 2 ** (-1 / 12), a, b)); return { note: n, hz: +f.toFixed(1), over_neighbours_db: +(db(on) - db(nb)).toFixed(1) }; });
  const lastEnd = 2 * 8 * 60 / BPM;
  const peak = d => d.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  const nonfinite = [dry.buf, wet.buf].reduce((n, b) => n + [0, 1].reduce((k, c) => k + b.getChannelData(c).filter(v => !Number.isFinite(v)).length, 0), 0);
  return {
    sampleRate: sr, seconds: dry.seconds,
    log: dry.log.map(l => ({ at: l.at, time: +l.time.toFixed(6), notes: l.notes })),
    expected: expected.map(e => +e.t.toFixed(6)),
    events: expected.map(e => e.notes.join(" ")),
    rises_db: rises.map(v => +v.toFixed(1)),
    stray_attacks_s: stray.map(t => +t.toFixed(3)),
    chord_Am7: chord(["A3", "C4", "E4", "G4"], 0.05, 0.3),
    chord_Fmaj7: chord(["F3", "A3", "C4", "E4"], 1.3, 1.55),
    peak_dry: peak(D), peak_wet: peak(W),
    peak_wet_channels: [peak(wet.buf.getChannelData(0)), peak(wet.buf.getChannelData(1))],
    rms_wet_db: db(rms(W, 0, lastEnd)), rms_dry_db: db(rms(D, 0, lastEnd)),
    tail_dry_db: db(rms(D, lastEnd + 0.8, lastEnd + 2.3)), tail_wet_db: db(rms(W, lastEnd + 0.8, lastEnd + 2.3)),
    nonfinite,
    wav: [Array.from(wet.buf.getChannelData(0)), Array.from(wet.buf.getChannelData(1))],
  };
});

console.log("1. offline, Tone.Offline on the page's own patch (2 loops, 10 s, plus a 2.5 s tail)\n");
const errs = R.log.map((l, i) => Math.abs(l.time - R.expected[i]) * 1000);
ok(R.log.length === R.expected.length, `the Part fired ${R.log.length} times for ${R.expected.length} events over two loops`);
ok(Math.max(...errs) < 0.1, `each fired at its bar position: largest error ${Math.max(...errs).toFixed(4)} ms`);
// a restrike is an event whose notes were all in the event before it: the same chord struck again while it still rings
const restrike = R.events.map((e, i) => { const prev = R.events[(i + R.events.length - 1) % R.events.length].split(" "); return e.split(" ").every(n => prev.includes(n)); });
const fresh = R.rises_db.filter((_, i) => !restrike[i]), again = R.rises_db.filter((_, i) => restrike[i]);
ok(fresh.every(v => v > 6), `an attack at every onset that brings new pitches, dry: its own pitches rise ${Math.min(...fresh).toFixed(1)} to ${Math.max(...fresh).toFixed(1)} dB over the 80 ms before (rule: over 6)`);
console.log(`  ear  the ${again.length} restrikes (the same chord again on the and of two, the first still releasing) rise only ${again.map(v => v.toFixed(1)).join(", ")} dB: whether they read as a new strike is the ear's call`);
R.restrike_rises_db = again;
ok(R.stray_attacks_s.length === 0, `no attack where nothing was scheduled (6 dB rise above -45 dBFS): ${R.stray_attacks_s.length ? R.stray_attacks_s.join(", ") + " s" : "none"}`);
for (const [name, c] of [["Am7 at 0:0:0", R.chord_Am7], ["Fmaj7 at 0:2:0", R.chord_Fmaj7]])
  ok(c.every(n => n.over_neighbours_db > 12), `${name}: all four tones sound together, each ${c.map(n => `${n.note} ${n.over_neighbours_db}`).join(", ")} dB over its semitone neighbours`);
ok(R.peak_wet < 1 && R.peak_dry < 1, `no sample at or past full scale: peak wet ${(20 * Math.log10(R.peak_wet)).toFixed(2)} dBFS, dry ${(20 * Math.log10(R.peak_dry)).toFixed(2)} dBFS (limiter threshold -1)`);
ok(R.tail_wet_db - R.tail_dry_db > 20, `the effects leave a tail: 0.8 to 2.3 s after the last bar, wet ${R.tail_wet_db.toFixed(1)} dBFS against dry ${R.tail_dry_db.toFixed(1)}`);
ok(R.nonfinite === 0, "no non-finite samples");
console.log(`       level over the two loops: wet ${R.rms_wet_db.toFixed(1)} dBFS RMS, dry ${R.rms_dry_db.toFixed(1)}`);

// ---- 2. live: click Play, let one loop pass on the real clock, count and time the triggers ----
console.log("\n2. live, the page's own button, on the real clock\n");
await page.evaluate(() => {
  window.__hits = [];
  const orig = Tone.PolySynth.prototype.triggerAttackRelease;
  Tone.PolySynth.prototype.triggerAttackRelease = function (n, d, t, v) { window.__hits.push({ t, n: [].concat(n).length }); return orig.call(this, n, d, t, v); };
});
await page.click("#play");
await page.waitForFunction(() => Tone.getTransport().state === "started" && Tone.getTransport().seconds > 5.3, null, { timeout: 15000 });
const L = await page.evaluate(() => ({ hits: window.__hits, state: Tone.getContext().state, pos: document.getElementById("pos").textContent }));
await page.click("#play");
const after = await page.evaluate(() => Tone.getTransport().state);
const first8 = L.hits.slice(0, 8), t0 = first8[0]?.t ?? 0;
const exp8 = R.expected.slice(0, 8);
const liveErr = first8.map((h, i) => Math.abs((h.t - t0) - exp8[i]) * 1000);
ok(L.state === "running", `the click resumed the context (${L.state})`);
ok(L.hits.length >= 8 && L.hits.length <= 10, `one loop and a little on the live clock: ${L.hits.length} triggers (8 a loop)`);
ok(Math.max(...liveErr) < 0.1, `live triggers at their bar positions, relative to the first: largest error ${Math.max(...liveErr).toFixed(4)} ms`);
ok(after === "stopped", `Stop stops the Transport (${after})`);
ok(errors.length === 0, `no page errors${errors.length ? ": " + errors.join(" | ") : ""}`);
M.live = { hits: L.hits.length, largest_error_ms: Math.max(...liveErr), context_after_click: L.state, transport_after_stop: after };

await browser.close(); srv.close();

// ---- write measured.json and the rendered phrase ----
const { wav, ...rest } = R;
M.offline = { ...rest, largest_schedule_error_ms: Math.max(...errs) };
M.when = new Date().toISOString(); M.chromium = (await chromium.executablePath()).split("/").find(s => /chromium/i.test(s)) || "chromium";
M.fails = fails;
fs.writeFileSync(path.join(HERE, "measured.json"), JSON.stringify(M, null, 1) + "\n");

const n = wav[0].length, data = Buffer.alloc(44 + n * 4);
data.write("RIFF", 0); data.writeUInt32LE(36 + n * 4, 4); data.write("WAVEfmt ", 8); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
data.writeUInt32LE(R.sampleRate, 24); data.writeUInt32LE(R.sampleRate * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34); data.write("data", 36); data.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(wav[c][i] * 32767))), 44 + i * 4 + c * 2);
const tmp = path.join(HERE, "phrase.wav");
fs.writeFileSync(tmp, data);
try { execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "192000", tmp, path.join(HERE, "phrase.m4a")]); fs.unlinkSync(tmp); console.log("\nwrote measured.json and phrase.m4a (the wet render, 12.5 s)"); }
catch { console.log("\nwrote measured.json and phrase.wav (afconvert not found, so not m4a)"); }

console.log(fails ? `\n${fails} check(s) failed` : "\nall checks pass");
process.exit(fails ? 1 : 0);
