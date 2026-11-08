// Exhaustive audit of Cycle 5 Explorer's theory core, read straight from the page (nothing copied by hand).
// Every tonic C♭…C♯ × every mode: seven letters once each, the mode's semitone pattern, chord qualities,
// symbols in all four dialects, avoid notes. Writes audit.json for the review sheet.
// Run: node "Projects/Cycle 5 Explorer/review/audit.mjs"
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "cycle5-explorer.html"), "utf8");
const script = html.split("<script>")[1];
const core = script.split("/* ============ audio")[0];
const scaleKsSrc = script.match(/function scaleKs[\s\S]*?\n}/)[0];   // the page's own, from its audio section
const api = new Function(core + "\n" + scaleKsSrc + "\nreturn { S, T, nm, SD, CT, spell, semis, resolve, roman, symbol, slotChord, outside, MODES, DIALECTS, QUAL, scaleKs, LETTER_SEMI };")();
const { S, nm, SD, CT, spell, resolve, roman, symbol, slotChord, MODES, DIALECTS, scaleKs, LETTER_SEMI } = api;

const PATTERN = { Lydian:"2221221", Ionian:"2212221", Mixolydian:"2212212", Dorian:"2122212", Aeolian:"2122122", Phrygian:"1222122", Locrian:"1221222" };
const pc = k => { const s = spell(k); return ((LETTER_SEMI[s.letter] + s.acc) % 12 + 12) % 12; };
const set = (t, m) => { S.m = m; S.L = t - m; };
const fails = []; let checks = 0;
const ok = (c, msg) => { checks++; if (!c) fails.push(msg); };

for (let t = -7; t <= 7; t++) for (let m = 0; m < 7; m++) {
  set(t, m); const name = `${nm(t)} ${MODES[m].name}`;
  const ks = scaleKs();
  ok(new Set(ks.map(k => spell(k).letter)).size === 7, `${name}: a letter repeats`);
  ok(ks[0] === t, `${name}: scale does not start on the tonic`);
  const steps = ks.map((k, i) => (pc(ks[(i + 1) % 7]) - pc(k) + 12) % 12).join("");
  ok(steps === PATTERN[MODES[m].name], `${name}: steps ${steps}`);
  for (let s = 0; s < 7; s++) {
    const r = resolve(slotChord(s));
    const iv = r.tones.map(k => (pc(k) - pc(r.root) + 12) % 12).join(",");
    const want = { maj7:"0,4,7,11", dom7:"0,4,7,10", m7:"0,3,7,10", m7b5:"0,3,6,10" }[r.q.id];
    ok(iv === want, `${name} slot ${s}: ${symbol(slotChord(s))} intervals ${iv}`);
    ok(r.tones.every(k => ks.includes(k)), `${name} slot ${s}: chord tone outside the key`);
    // avoid notes: a tension a half step above a chord tone
    for (const x of r.tens) {
      const half = r.tones.some(k => (pc(x.k) - pc(k) + 12) % 12 === 1);
      ok(half === x.avoid, `${name} slot ${s}: avoid flag on ${nm(x.k)}`);
    }
  }
}

// the sheet's data: C on every mode (the parallel view, the modal interchange chart), every dialect
const sheet = MODES.map((M, m) => {
  set(0, m);
  const chords = [];
  for (let s = 0; s < 7; s++) {
    const c = slotChord(s), r = resolve(c);
    chords.push({ deg: SD(r.d), dialects: Object.fromEntries(Object.keys(DIALECTS).map(d => [d, { roman: roman(c, d), symbol: symbol(c, d) }])),
      tens: r.tens.map(x => (x.avoid ? "(" : "") + CT(x.e) + (x.avoid ? ")" : "")).join(" ") });
  }
  chords.sort((a, b) => parseInt(a.deg.replace(/\D/g, "")) - parseInt(b.deg.replace(/\D/g, "")));
  return { mode: M.name, feel: M.feel, scale: scaleKs().map(nm).join(" "), degrees: scaleKs().map(k => SD(k - 0)).join(" "), chords };
});
const edges = [[7, 0], [-7, 6], [1, 1], [-1, 1], [6, 5], [-6, 0]].map(([t, m]) => { set(t, m); return `${nm(t)} ${MODES[m].name}: ${scaleKs().map(nm).join(" ")}`; });
writeFileSync(join(here, "audit.json"), JSON.stringify({ checks, fails, dialects: Object.fromEntries(Object.entries(DIALECTS).map(([k, v]) => [k, v.label])), sheet, edges }, null, 1));
console.log(`${checks} checks, ${fails.length} failures`); fails.slice(0, 20).forEach(f => console.log("  ✗ " + f));
edges.forEach(e => console.log("  " + e));
