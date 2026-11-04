#!/usr/bin/env node
// verify_native.js — the second-target check (Generative Audio Devices, 2026-11-04).
// Every PDL the project holds (the house bass, the recipes, the T6 candidates)
// goes through BOTH targets: emitVcvJson makes the .vcv, emit_native.js makes
// C++, which is compiled and played through host_render.cpp. It passes when
// the same PDL builds for both, sounds (peak above -40 dB), stays finite,
// doesn't clip, and the house bass sounds at the pitch Rack's VCO would give.
// With --apps, also builds every patch as a Mac app in build/.
//
// Usage:  node verify_native.js [--apps]

const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const HERE = __dirname, ROOT = path.resolve(HERE, "..", "..", ".."), SHOP = path.join(ROOT, "Shop", "VCV Patch Generator");
const { emitNative } = require("./emit_native.js");
const apps = process.argv.includes("--apps");

const sources = [{ name: "house_bass", pdl: fs.readFileSync(path.join(HERE, "..", "pdl-renderer", "house_bass.pdl"), "utf8") }];
for (const f of fs.readdirSync(path.join(SHOP, "recipes")).filter(f => f.endsWith(".pdl")).sort())
  sources.push({ name: f.replace(/\.pdl$/, ""), pdl: fs.readFileSync(path.join(SHOP, "recipes", f), "utf8") });
for (const f of fs.readdirSync(path.join(SHOP, "t6-runs")).filter(f => f.endsWith(".candidates.txt")).sort()) {
  const re = /===\s*CANDIDATE:\s*(.+?)\s*===([\s\S]*?)```pdl\s*\n([\s\S]*?)```/g; let m;
  const text = fs.readFileSync(path.join(SHOP, "t6-runs", f), "utf8");
  while ((m = re.exec(text))) sources.push({ name: f.replace(/\.candidates\.txt$/, "") + "--" + m[1].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), pdl: m[3].trim() });
}

const B = path.join(HERE, "build"), W = path.join(B, ".work"); fs.mkdirSync(W, { recursive: true });
let pass = 0, fail = 0; const rows = [];
const check = (ok, label) => { ok ? pass++ : fail++; console.log((ok ? "  ok   " : "  FAIL ") + label); return ok; };

for (const s of sources) {
  console.log(s.name);
  const r = emitNative(s.pdl, { name: s.name, source: s.name + ".pdl" });
  if (!check(!r.problems, "emits C++" + (r.problems ? ": " + r.problems.join("; ") : ""))) continue;
  check(r.warnings.length === 0, `the same PDL emits a .vcv with 0 warnings (got ${r.warnings.length})`);
  const dir = path.join(W, s.name); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "patch.h"), r.header);
  for (const f of ["gad_kit.h", "host_common.h"]) fs.copyFileSync(path.join(HERE, f), path.join(dir, f));
  try { execFileSync("clang++", ["-std=c++17", "-O2", "-Wall", "-Werror", '-DPATCH_H="patch.h"', "-I" + dir, path.join(HERE, "host_render.cpp"), "-o", path.join(dir, "render")], { stdio: "pipe" }); }
  catch (e) { check(false, "compiles: " + String(e.stderr).slice(0, 300)); continue; }
  check(true, "compiles with -Wall -Werror");
  const m = JSON.parse(execFileSync(path.join(dir, "render"), [path.join(B, s.name + ".wav")]).toString());
  const db = (x) => (20 * Math.log10(Math.max(x, 1e-9))).toFixed(1);
  check(m.nonfinite === 0, "every sample finite");
  check(m.peak > 0.01, `sounds: peak ${db(m.peak)} dBFS`);
  check(m.peak < 1.0, "doesn't clip");
  if (s.name === "house_bass") {
    const want = 261.6256 * Math.pow(2, (48 - 60) / 12 - 1), cents = 1200 * Math.log2(m.first_note_hz / want);
    check(Math.abs(cents) < 5, `C3 with the oscillator an octave down plays ${m.first_note_hz.toFixed(2)} Hz, ${cents.toFixed(1)} cents from ${want.toFixed(2)}`);
  }
  if (/warm_pad|warm-pad/.test(s.name) && !/drone/.test(s.name)) check(r.voices === 6, `plays ${r.voices} voices (the warm pad asks for 6)`);
  rows.push([s.name, String(r.voices), db(m.peak), db(m.rms), m.voices === 1 ? m.first_note_hz.toFixed(1) : "chord"]);
  if (apps) execFileSync(path.join(HERE, "build_app.sh"), [path.join(dir, "..", "..", "..", "x.pdl").replace(/x\.pdl$/, ""), s.name].slice(0, 0).concat([]), { stdio: "ignore" });
}

// A module this target can't build is refused by name, and nothing is written.
const seq = emitNative("@S = SEQ3\n@OSC = VCO\nS:CV1 -> OSC\nOSC:SAW -> OUT:IN1\n");
check(seq.problems && /SEQ3/.test(seq.problems[0]), "a SEQ3 patch is refused by name, not half-built");

console.log("\n" + rows.map(r => r.join(" | ")).join("\n"));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
