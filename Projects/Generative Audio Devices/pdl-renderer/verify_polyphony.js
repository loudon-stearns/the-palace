#!/usr/bin/env node
// Polyphony harness (2026-10-26, steward cycle 2). Checks the voice count the
// emitter writes, through the REAL emitVcvJson in PDL Renderer.html:
//   - `# voices: N` in PDL > an archetype's `voices` > one voice;
//   - the count lands in MIDI_CV's data.channels, and nothing else in the
//     device settings Rack saved for us changes;
//   - every module between the keyboard and the audio out can carry voices;
//   - bad counts warn and never stop the patch;
//   - the on-disk registry and archetypes match the copies inside the renderer.
// With --emit <dir>, also writes the chord patches there.
//
// Usage:  node verify_polyphony.js [--emit <dir>]

const fs   = require("fs");
const path = require("path");
const HERE = __dirname;
const ROOT = path.resolve(HERE, "..", "..", "..");
const html = fs.readFileSync(path.join(HERE, "PDL Renderer.html"), "utf8");

function between(s, a, b) { const i = s.indexOf(a); const j = s.indexOf(b, i + a.length); return s.slice(i + a.length, j); }
const regText  = between(html, '<script type="application/json" id="vcv-registry">', "</script>").trim();
const archText = between(html, '<script type="application/json" id="archetypes">', "</script>").trim();
const REGDATA = JSON.parse(regText), REG = REGDATA.modules;
const bs = html.indexOf('<script type="text/babel">'); const body = html.indexOf(">", bs) + 1;
const code = html.slice(body, html.indexOf("// ─── Port Map", body));
const docShim = { getElementById: (id) => ({ textContent: id === "vcv-registry" ? regText : id === "archetypes" ? archText : "{}" }) };
const { emitVcvJson } = new Function("document", "React", code + "\n return { emitVcvJson };")(docShim, { useState: () => [undefined, () => {}] });

let pass = 0, fail = 0;
const check = (ok, label) => { if (ok) { pass++; console.log("  ok   " + label); } else { fail++; console.log("  FAIL " + label); } };
const SHOP = path.join(ROOT, "Shop", "VCV Patch Generator");
const recipe = (n) => fs.readFileSync(path.join(SHOP, "recipes", n + ".pdl"), "utf8");
const midiOf = (patch) => patch.modules.find(m => m.model === "MIDIToCVInterface");
const modelOf = (slug) => Object.keys(REG).find(k => REG[k].slug === slug);

console.log("precedence");
const pad = emitVcvJson(recipe("warm_pad-seed-1"));
check(midiOf(pad.patch).data.channels === 6, "warm_pad archetype plays 6 voices");
check(pad.warnings.length === 0, `warm_pad emits with 0 warnings (got ${pad.warnings.length})`);
const amp = pad.patch.modules.find(m => m.model === "VCA-1");
check(amp.params.find(p => p.id === 0).value === 0.5, "warm_pad pins amp LEVEL at 0.5 so a chord does not clip");
const pluck = emitVcvJson(recipe("pluck-seed-1"));
check(midiOf(pluck.patch).data.channels === 1, "pluck (no voices in its archetype) stays one voice");
check(midiOf(emitVcvJson(recipe("pluck-seed-1") + "\n# voices: 4\n").patch).data.channels === 4, "`# voices: 4` makes the pluck play 4");
check(midiOf(emitVcvJson(recipe("warm_pad-seed-1") + "\n# voices: 3\n").patch).data.channels === 3, "`# voices: 3` beats the pad archetype's 6");
check(midiOf(emitVcvJson(fs.readFileSync(path.join(HERE, "house_bass.pdl"), "utf8")).patch).data.channels === 1, "house bass is untouched: one voice");

console.log("bad counts warn, never stop");
const big = emitVcvJson(recipe("pluck-seed-1") + "\n# voices: 32\n");
check(midiOf(big.patch).data.channels === 16 && big.warnings.some(w => /clamped to 16/.test(w.reason)), "32 voices clamps to 16 and says so");
const word = emitVcvJson(recipe("pluck-seed-1") + "\n# voices: two\n");
check(midiOf(word.patch).data.channels === 1 && word.warnings.some(w => /malformed `# voices`/.test(w.reason)), "`# voices: two` warns and leaves one voice");
const nokb = emitVcvJson("@OSC = VCO\nOSC:SAW -> OUT:IN1\n# voices: 4\n");
check(nokb.warnings.some(w => /no module here can carry them/.test(w.reason)), "voices with no keyboard warns");

console.log("only the voice count changes in the device settings");
const want = { ...REG.MIDI_CV.default_data, channels: 6 };
check(JSON.stringify(midiOf(pad.patch).data) === JSON.stringify(want), "MIDI_CV data = Rack's saved settings + channels");
check(midiOf(pluck.patch).data !== REG.MIDI_CV.default_data && REG.MIDI_CV.default_data.channels === 1, "registry default stays at 1 (no shared object mutated)");

console.log("every module from keyboard to speakers carries voices");
const sources = [{ name: "warm_pad-seed-1", pdl: recipe("warm_pad-seed-1") }];
const t6 = fs.readFileSync(path.join(SHOP, "t6-runs", "evolving-warm-pad.candidates.txt"), "utf8");
const re = /===\s*CANDIDATE:\s*(.+?)\s*===([\s\S]*?)```pdl\s*\n([\s\S]*?)```/g; let m;
while ((m = re.exec(t6)) !== null) if (!/^<.*>$/.test(m[1].trim()))
  sources.push({ name: "evolving-warm-pad--" + m[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), pdl: m[3].trim() });
for (const s of sources) {
  const { patch, warnings } = emitVcvJson(s.pdl);
  const kb = midiOf(patch);
  // Walk forward from the keyboard along every cable.
  const seen = new Set([kb.id]), q = [kb.id];
  while (q.length) { const id = q.shift(); for (const c of patch.cables.filter(c => c.outputModuleId === id)) if (!seen.has(c.inputModuleId)) { seen.add(c.inputModuleId); q.push(c.inputModuleId); } }
  const path_ = patch.modules.filter(x => seen.has(x.id) && x.id !== kb.id);
  const mono = path_.filter(x => !REG[modelOf(x.model)].poly);
  const reachesOut = path_.some(x => x.model === "AudioInterface");
  check(reachesOut && mono.length === 0, `${s.name}: ${kb.data.channels} voices, ${path_.length} modules on the voice path, none mono${mono.length ? " (" + mono.map(x => x.model) + ")" : ""}, ${warnings.length} warnings`);
  s.patch = patch;
}

console.log("determinism and sync");
check(JSON.stringify(emitVcvJson(recipe("warm_pad-seed-1")).patch) === JSON.stringify(pad.patch), "same PDL, byte-identical patch");
const disk = JSON.parse(fs.readFileSync(path.join(HERE, "vcv_fundamental_registry.json"), "utf8"));
const diskArch = JSON.parse(fs.readFileSync(path.join(HERE, "archetypes.json"), "utf8"));
check(disk.version === REGDATA.version, `registry versions match (${disk.version})`);
check(Object.keys(REG).every(k => JSON.stringify(REG[k].voices) === JSON.stringify(disk.modules[k].voices) && REG[k].poly === disk.modules[k].poly), "voices/poly fields match in both registry copies");
check(JSON.stringify(JSON.parse(archText).archetypes) === JSON.stringify(diskArch.archetypes), "archetypes match in both copies");

const emitIdx = process.argv.indexOf("--emit");
if (emitIdx > 0) {
  const dir = path.resolve(process.argv[emitIdx + 1]); fs.mkdirSync(dir, { recursive: true });
  for (const s of sources) fs.writeFileSync(path.join(dir, s.name + ".vcv"), JSON.stringify(s.patch, null, 2));
  console.log(`\nwrote ${sources.length} patches to ${dir}`);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
