#!/usr/bin/env node
// Standing Orders harness (2026-10-26). Loudon's two orders from the revival
// (2026-10-24), checked on every PDL the project holds — the house bass, the
// three archetype recipes, and all nine T6 candidates — through the REAL
// emitVcvJson in PDL Renderer.html:
//   1. Every patch opens ready to play on his Mac: MIDI_CV on the QWERTY
//      keyboard, AUDIO_8 on the MacBook Pro Speakers.
//   2. Every modulator sits on the row right under the main module it
//      modulates, and no two modules overlap.
// With --emit <dir>, also writes each patch as a .vcv there.
//
// Usage:  node verify_standing_orders.js [--emit <dir>]

const fs   = require("fs");
const path = require("path");
const HERE = __dirname;
const ROOT = path.resolve(HERE, "..", "..", "..");
const html = fs.readFileSync(path.join(HERE, "PDL Renderer.html"), "utf8");

function between(s, a, b) { const i = s.indexOf(a); const j = s.indexOf(b, i + a.length); return s.slice(i + a.length, j); }
const regText  = between(html, '<script type="application/json" id="vcv-registry">', "</script>").trim();
const archText = between(html, '<script type="application/json" id="archetypes">', "</script>").trim();
const REG = JSON.parse(regText).modules;
const bs = html.indexOf('<script type="text/babel">'); const body = html.indexOf(">", bs) + 1;
const code = html.slice(body, html.indexOf("// ─── Port Map", body));
const docShim = { getElementById: (id) => ({ textContent: id === "vcv-registry" ? regText : id === "archetypes" ? archText : "{}" }) };
const { emitVcvJson } = new Function("document", "React", code + "\n return { emitVcvJson };")(docShim, { useState: () => [undefined, () => {}] });

// Gather every PDL on disk.
const sources = [];
sources.push({ name: "house_bass", pdl: fs.readFileSync(path.join(HERE, "house_bass.pdl"), "utf8") });
const SHOP = path.join(ROOT, "Shop", "VCV Patch Generator");
for (const f of fs.readdirSync(path.join(SHOP, "recipes")).filter(f => f.endsWith(".pdl")).sort())
  sources.push({ name: f.replace(/\.pdl$/, ""), pdl: fs.readFileSync(path.join(SHOP, "recipes", f), "utf8") });
for (const f of fs.readdirSync(path.join(SHOP, "t6-runs")).filter(f => f.endsWith(".candidates.txt")).sort()) {
  const text = fs.readFileSync(path.join(SHOP, "t6-runs", f), "utf8");
  const re = /===\s*CANDIDATE:\s*(.+?)\s*===([\s\S]*?)```pdl\s*\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (/^<.*>$/.test(m[1].trim())) continue;
    const slug = m[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    sources.push({ name: f.replace(/\.candidates\.txt$/, "") + "--" + slug, pdl: m[3].trim() });
  }
}

const emitIdx = process.argv.indexOf("--emit");
const emitDir = emitIdx > 0 ? path.resolve(process.argv[emitIdx + 1]) : null;
if (emitDir) fs.mkdirSync(emitDir, { recursive: true });

let pass = 0, fail = 0;
const check = (ok, label) => { if (ok) pass++; else { fail++; console.log("  FAIL " + label); } };
const isModulator = (model) => {
  const m = Object.values(REG).find(r => r.slug === model);
  return m && (m.inputs || []).length > 0 && !(m.outputs || []).some(p => p.type === "audio");
};
const hpOf = (model) => (Object.values(REG).find(r => r.slug === model) || {}).hp || 1;

for (const s of sources) {
  const { patch } = emitVcvJson(s.pdl);
  const mods = patch.modules;
  const byId = Object.fromEntries(mods.map(m => [m.id, m]));
  console.log(`${s.name}`);

  // Order 1 — devices.
  const midi = mods.find(m => m.model === "MIDIToCVInterface");
  const audio = mods.find(m => m.model === "AudioInterface");
  if (midi)  check(midi.data?.midi?.deviceName === "QWERTY keyboard (US)" && midi.data.midi.driver === -11, `${s.name}: MIDI-CV on QWERTY`);
  if (audio) check(audio.data?.audio?.deviceName === "MacBook Pro Speakers" && audio.data.audio.driver === 5, `${s.name}: Audio on MacBook speakers`);
  check(!!midi && !!audio, `${s.name}: has both a keyboard and an audio out`);

  // Order 2 — each modulator under the main module it modulates.
  for (const m of mods.filter(m => isModulator(m.model))) {
    check(m.pos[1] === 1, `${s.name}: modulator ${m.id} ${m.model} on row 1`);
    // Walk its cables to the first row-0 module (through other modulators).
    let cur = m.id, target = null; const seen = new Set();
    while (cur != null && !seen.has(cur)) {
      seen.add(cur);
      const outs = patch.cables.filter(c => c.outputModuleId === cur);
      const direct = outs.find(c => byId[c.inputModuleId].pos[1] === 0);
      if (direct) { target = byId[direct.inputModuleId]; break; }
      cur = outs.length ? outs[0].inputModuleId : null;
    }
    if (!target) { console.log(`  note: ${m.model} ${m.id} reaches no signal-path module`); continue; }
    const tL = target.pos[0], tR = tL + hpOf(target.model);
    const mL = m.pos[0];
    // Under its target: left-aligned to it, or pushed right by a neighbour
    // that is also under the same target. Either way it must start under the
    // target's span, or (when pushed) right after a modulator of the same target.
    const under = mL >= tL && mL < tR;
    const pushed = mods.some(o => o !== m && o.pos[1] === 1 && o.pos[0] + hpOf(o.model) === mL);
    check(under || pushed, `${s.name}: ${m.model} ${m.id} at x=${mL} sits under ${target.model} [${tL},${tR})`);
    console.log(`  ${m.model.padEnd(6)} x=${String(mL).padStart(2)}  under ${target.model} x=${tL}${under ? "" : " (pushed right by a neighbour)"}`);
  }

  // No overlaps on either row.
  for (const row of [0, 1]) {
    const r = mods.filter(m => m.pos[1] === row).sort((a, b) => a.pos[0] - b.pos[0]);
    for (let i = 1; i < r.length; i++)
      check(r[i - 1].pos[0] + hpOf(r[i - 1].model) <= r[i].pos[0], `${s.name}: row ${row} no overlap at ${r[i].model}`);
  }

  if (emitDir) fs.writeFileSync(path.join(emitDir, s.name + ".vcv"), JSON.stringify(patch, null, 2));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
