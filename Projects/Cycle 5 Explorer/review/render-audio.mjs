// Renders Cycle 5 Explorer's own sound offline: the page is loaded in headless Chromium, its AudioContext is
// swapped for an OfflineAudioContext, and the page's own playScale/playChord run exactly as the buttons call
// them. No synth is copied here. Then the WAV is checked: the scale's pitches, level, clipping.
// Run: node "Projects/Cycle 5 Explorer/review/render-audio.mjs"  (uses the STIGMERGY app's Playwright)
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");

const SR = 48000, SECONDS = 26;
const browser = await chromium.launch();
const page = await browser.newPage();
await page.addInitScript(([SR, SECONDS]) => {
  const Off = window.OfflineAudioContext;
  window.__off = null;
  window.AudioContext = function () { window.__off = new Off(2, SR * SECONDS, SR); window.__off.resume = () => Promise.resolve(); return window.__off; };
}, [SR, SECONDS]);
await page.goto(pathToFileURL(join(here, "..", "cycle5-explorer.html")).href);
const out = await page.evaluate(async () => {
  const marks = [];
  // 1 · C Ionian scale, as the scale button plays it
  S.L = -1; S.m = 1; S.voicing = "seventh";
  marks.push({ t: 0, what: "C Ionian scale, up an octave" });
  const scaleLen = playScale(T(), S.m, 0);
  // 2 · the Diatonic cycle 5 preset at the page's default tempo, as startProg times it
  const beat = 60 / S.tempo, dur = beat * 2;
  let t = scaleLen + 0.4;
  const play = (name, ch) => { marks.push({ t: +t.toFixed(2), what: name }); ch.forEach(([d, src]) => { const c = { d, src }; marks.push({ t: +t.toFixed(2), chord: symbol(c), roman: roman(c) }); playChord(c, t, dur * .92); t += dur; }); t += 0.6; };
  play("Diatonic cycle 5, C major, " + S.tempo + " bpm", PRESETS.find(p => p.name === "Diatonic cycle 5").ch);
  play("IV to minor IV (borrowed from Aeolian)", PRESETS.find(p => p.name === "IV to minor IV").ch);
  const buf = await __off.startRendering();
  return { marks, end: t, L: Array.from(buf.getChannelData(0)), R: Array.from(buf.getChannelData(1)) };
});
await browser.close();

// trim to the end of the last chord's release, write 16-bit stereo WAV
const n = Math.min(out.L.length, Math.ceil((out.end + 1.5) * SR));
const wav = Buffer.alloc(44 + n * 4);
wav.write("RIFF", 0); wav.writeUInt32LE(36 + n * 4, 4); wav.write("WAVEfmt ", 8); wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28);
wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write("data", 36); wav.writeUInt32LE(n * 4, 40);
let peak = 0, clipped = 0, sumsq = 0;
for (let i = 0; i < n; i++) for (const [ch, a] of [[0, out.L], [1, out.R]]) {
  const v = a[i]; peak = Math.max(peak, Math.abs(v)); if (Math.abs(v) >= 1) clipped++; sumsq += v * v;
  wav.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), 44 + i * 4 + ch * 2);
}
writeFileSync(join(here, "page-sound.wav"), wav);

// pitch check on the scale: strongest spectral peak in 60–1200 Hz, 40–180 ms after each note's onset
const dft = (x0, len, f) => { let re = 0, im = 0; for (let i = 0; i < len; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / len), v = out.L[x0 + i] * w; re += v * Math.cos(2 * Math.PI * f * i / SR); im -= v * Math.sin(2 * Math.PI * f * i / SR); } return Math.hypot(re, im); };
const names = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"], midi = [60, 62, 64, 65, 67, 69, 71, 72];
const pitches = midi.map((m, i) => {
  const want = 440 * 2 ** ((m - 69) / 12), x0 = Math.round((0.03 + i * 0.2 + 0.04) * SR), len = Math.round(0.14 * SR);
  let best = 0, bf = 0; for (let c = -60; c <= 60; c += 0.5) { const f = want * 2 ** (c / 1200), a = dft(x0, len, f); if (a > best) { best = a; bf = f; } }
  // the right note, not a neighbour: the scale is legato (each note rings 0.7 s past the next onset), so ask
  // which semitone grew most across this onset, compared with the 140 ms just before it
  const grow = s => dft(x0, len, want * 2 ** (s / 12)) / (dft(x0 - len - Math.round(0.04 * SR), len, want * 2 ** (s / 12)) + 1e-9);
  const g = [-2, -1, 0, 1, 2].map(grow), newest = [-2, -1, 0, 1, 2][g.indexOf(Math.max(...g))];
  return { note: names[i], want: +want.toFixed(2), found: +bf.toFixed(2), cents: +(1200 * Math.log2(bf / want)).toFixed(1), newest_is_this_note: i === 0 ? "first note, nothing before it" : newest === 0 };
});
const rms = Math.sqrt(sumsq / (2 * n));
const report = { seconds: +(n / SR).toFixed(2), peak_dbfs: +(20 * Math.log10(peak)).toFixed(1), rms_dbfs: +(20 * Math.log10(rms)).toFixed(1), clipped_samples: clipped, pitches, marks: out.marks };
writeFileSync(join(here, "page-sound.json"), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ ...report, marks: out.marks.length }, null, 1));
