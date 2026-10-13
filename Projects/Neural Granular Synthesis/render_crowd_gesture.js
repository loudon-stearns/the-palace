// Renders crowd-gesture.wav with the exact engine the playable page runs
// (crowd_engine.js), walking the pad in one take: scatter → the edge → a
// frozen tone → life added → wide vibrato → breaking → home, then a short
// phrase on the living tone. Writes crowd-gesture.json (meters every 10 ms).
//   node render_crowd_gesture.js
const fs = require("fs");
const { Crowd } = require("./crowd_engine.js");
const sr = 48000, c = new Crowd(sr);
// [seconds, tightness T, life p, F0, label] — linear ramps between keyframes
const KF = [
  [0, 0, 0, 110, "scatter"], [4, 0, 0, 110, "scatter"],
  [10, 1.4, 0, 110, "the edge"], [13, 3.14, 0, 110, "frozen tone"], [17, 3.14, 0, 110, "frozen tone"],
  [21, 3.14, 0.12, 110, "living tone"], [25, 3.14, 0.12, 110, "living tone"],
  [29, 5.5, 0.55, 110, "wide vibrato"], [33, 5.5, 0.55, 110, "wide vibrato"],
  [37, 1.9, 0.68, 110, "breaking"], [40, 1.9, 0.68, 110, "breaking"],
  [43, 3.14, 0.12, 110, "living tone"],
];
const PHRASE = [[43, 110], [44, 130.81], [45, 146.83], [46, 164.81], [47.5, 146.83], [48.5, 110]]; // A C D E D A
const DUR = 51, total = sr * DUR, out = new Float32Array(total), trace = [];
const at = (t) => { let i = 0; while (i < KF.length - 2 && KF[i + 1][0] <= t) i++;
  const a = KF[i], b = KF[i + 1], f = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0] || 1)));
  return { T: a[1] + (b[1] - a[1]) * f, p: a[2] + (b[2] - a[2]) * f, label: f < 1 && a[4] !== b[4] ? a[4] + " → " + b[4] : b[4] }; };
const B = 480; c.glide = 0.06;
for (let s = 0; s < total; s += B) {
  const t = s / sr, k = at(t);
  c.T = k.T; if (Math.abs(c.p - k.p) > 0.002) c.setP(k.p);
  let f = 110; for (const [pt, hz] of PHRASE) if (t >= pt) f = hz; c.F0 = f;
  const n = Math.min(B, total - s); c.process(out.subarray(s, s + n), n);
  trace.push({ t: +t.toFixed(2), T: +k.T.toFixed(3), p: +c.p.toFixed(3), F0: f, r: +c.rCore.toFixed(3),
               wob: +c.wobble.toFixed(1), hz: +c.hz.toFixed(2), label: k.label });
}
const fade = sr * 0.5; for (let i = 0; i < fade; i++) out[total - 1 - i] *= i / fade;
const pcm = Buffer.alloc(44 + total * 2);
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + total * 2, 4); pcm.write("WAVEfmt ", 8);
pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(sr, 24);
pcm.writeUInt32LE(sr * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36); pcm.writeUInt32LE(total * 2, 40);
for (let i = 0; i < total; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i] * 0.9)) * 32767), 44 + i * 2);
fs.writeFileSync("crowd-gesture.wav", pcm);
fs.writeFileSync("crowd-gesture.json", JSON.stringify({ sr, N: c.N, sigma: c.sigma, keyframes: KF, phrase: PHRASE, trace }));
console.log("wrote crowd-gesture.wav", DUR, "s");
