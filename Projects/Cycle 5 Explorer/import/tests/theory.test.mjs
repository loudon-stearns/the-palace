// Theory-core tests for Cycle 5 Explorer.
// Extracts the pure theory code from src/index.html (everything before the audio section)
// and checks spelling, degrees, chord symbols, tensions/avoid notes and borrowing.
// Run: node tests/theory.test.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "src", "index.html"), "utf8");
const core = html.split("<script>")[1].split("/* ============ audio")[0];
// scaleKs lives in the audio section of the page; mirror it here for testing.
const scaleKsSrc = `function scaleKs(tonicK = T(), mode = S.m) { const ds = []; for (let d = -mode; d <= 6 - mode; d++) ds.push(d); ds.sort((a, b) => stepOf(a) - stepOf(b)); return ds.map(d => tonicK + d); }`;
const api = new Function(core + "\n" + scaleKsSrc + "\nreturn { S, T, nm, SD, CT, resolve, roman, symbol, slotNote, slotChord, outside, MODES, scaleKs };")();
const { S, T, nm, SD, CT, resolve, roman, symbol, slotNote, slotChord, outside, MODES, scaleKs } = api;

let n = 0;
const eq = (a, b, msg) => { assert.equal(a, b, msg); n++; };
const set = (tonic, mode) => { S.m = mode; S.L = tonic - mode; S.dialect = "berklee"; };

// --- spelling on the line of fifths
eq([-1, 0, 1, 6, 7, -2, -7, 12, 13, -13].map(nm).join(" "), "F C G F♯ C♯ B♭ C♭ B♯ F𝄪 G𝄫", "note spelling");

// --- scales spell correctly at the extremes
set(0, 1);  eq(scaleKs().map(nm).join(" "), "C D E F G A B", "C Ionian");
set(1, 1);  eq(scaleKs().map(nm).join(" "), "G A B C D E F♯", "G major uses F♯ not G♭");
set(7, 0);  eq(scaleKs().map(nm).join(" "), "C♯ D♯ E♯ F𝄪 G♯ A♯ B♯", "C♯ Lydian reaches F𝄪");
set(-7, 6); eq(scaleKs().map(nm).join(" "), "C♭ D𝄫 E𝄫 F♭ G𝄫 A𝄫 B𝄫", "C♭ Locrian reaches G𝄫");

// --- ♯4 in Lydian vs ♭5 in Locrian (the issue from the original video)
set(-1, 0); eq(SD(6), "♯4", "Lydian has ♯4");
set(-1 + 6, 6); eq(SD(-6), "♭5", "Locrian has ♭5");

// --- diatonic chord symbols and Roman numerals in C major (Berklee)
set(0, 1);
const row = d => `${symbol({ d, src: "c" })} ${roman({ d, src: "c" })}`;
eq(row(0), "Cmaj7 Imaj7"); eq(row(1), "G7 V7"); eq(row(2), "D–7 II–7");
eq(row(5), "B–7(♭5) VII–7(♭5)"); eq(row(-1), "Fmaj7 IVmaj7");

// --- dialects
eq(roman({ d: 2, src: "c" }, "classical"), "ii7", "classical lowercase minor");
eq(roman({ d: 5, src: "c" }, "classical"), "viiø7", "classical half-dim");
eq(symbol({ d: 0, src: "c" }, "jazz"), "CΔ7", "jazz shorthand");
eq(symbol({ d: 2, src: "c" }, "lead"), "Dm7", "lead sheet minor");

// --- tensions and avoid notes (Berklee half-step rule); * marks avoid
const tens = d => resolve({ d, src: "c" }).tens.map(x => CT(x.e) + (x.avoid ? "*" : "")).sort().join(",");
eq(tens(0), "11*,13,9", "Cmaj7: 11 avoid");
eq(tens(1), "11*,13,9", "G7: 11 avoid");
eq(tens(2), "11,13,9", "D–7 (Dorian): no avoids");
eq(tens(4), "11,♭13*,♭9*", "E–7 (Phrygian): ♭9 and ♭13 avoid");
eq(tens(-1), "13,9,♯11", "Fmaj7 (Lydian): ♯11 available");

// --- borrowed chords on C
const b = (d, src) => `${symbol({ d, src })} ${roman({ d, src })} ${MODES[resolve({ d, src }).src].name}`;
eq(b(-1, 4), "F–7 IV–7 Aeolian", "minor IV");
eq(b(-2, 4), "B♭7 ♭VII7 Aeolian", "backdoor ♭VII7");
eq(b(-4, 4), "A♭maj7 ♭VImaj7 Aeolian", "♭VI");
eq(b(-5, 5), "D♭maj7 ♭IImaj7 Phrygian", "Phrygian ♭II");

// --- outside slots on the wheel: C Ionian shows F♯ (from Lydian) and the four flats
set(0, 1);
eq([7, 8, 9, 10, 11].map(s => `${nm(slotNote(s))}:${SD(slotChord(s).d)}:${MODES[outside(s).src].name}`).join(" "),
  "F♯:♯4:Lydian D♭:♭2:Phrygian A♭:♭6:Aeolian E♭:♭3:Dorian B♭:♭7:Mixolydian", "outside slots");

console.log(`theory core: ${n} checks passed`);
