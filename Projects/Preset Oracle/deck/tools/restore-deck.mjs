// Restore the oracle's deck from Loudon's original page, then grow it.
// Reads the 122 cards out of original/oracle.html exactly as written, applies the factual
// corrections below (the cards never announce them; this list is the record), appends the new
// cards from tools/new-cards.json, and writes "Preset Oracle — deck.json". Rerunnable.
//   node tools/restore-deck.mjs
// Then pour the deck into the pages: node tools/build-deck.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const tools = dirname(fileURLToPath(import.meta.url));
const deckDir = resolve(tools, "..");
const bundle = resolve(deckDir, "..");
const src = readFileSync(resolve(bundle, "original", "oracle.html"), "utf8");
const m = src.match(/const challenges = (\[[\s\S]*?\n\s*\]);\s*\n\s*const memoryFragments = (\[[\s\S]*?\]);/);
if (!m) throw new Error("couldn't find the challenges array in original/oracle.html");
const original = Function(`return ${m[1]}`)();
const fragments = Function(`return ${m[2]}`)();

// Factual corrections, by the card's original name. Taste is untouched; only what was untrue.
const FIXES = {
  "ROTHKO.FIELD": { surprise: "Let something in the patch pulse at 7.83 Hz, the Schumann resonance of the Earth's atmosphere—too low to hear as pitch, so give it to an LFO and feel it as flutter" },
  "EROS_CIRCUIT.03": { surprise: "Tune one oscillator to 528 Hz (the so-called 'love frequency') and bury it in the mix where only you know it is there" },
  "BATAILLE_EXCESS": { quote: "Bataille, The Accursed Share: 'It is not necessity but its contrary, \"luxury,\" that presents living matter and mankind with their fundamental problems.' Your preset is the luxury." },
  "TARKOVSKY_ZONE": { quote: "The Stalker: 'The Zone is a very complicated system of traps.' Your preset traps the player in altered acoustics." },
  "BATAILLE_SUN": { surprise: "This preset should make you flinch at a sensible volume—the violence is in the spectrum, not the fader" },
  "FOURIER_TRUTH": { quote: "Fourier showed that any periodic waveform can be built from sines. Your preset is an ontological demonstration." },
  "PYTHAGORAS_HARMONY": {
    technical: "Only pure integer ratios: 2:1, 3:2, 4:3. No equal temperament—tuning from before the keyboard learned to compromise.",
    surprise: "Tune by stacking pure 3:2 fifths, as the Pythagoreans did, and hear how sour their major third (81:64) is against the sweet 5:4 of just intonation",
  },
  "GALILEO_MOONS": {
    theme: "Jupiter's moons—orbital resonance as rhythm, and one moon that stays free",
    technical: "Three oscillators in orbital lock—Io : Europa : Ganymede = 1 : 2 : 4, the Laplace resonance. Callisto, the fourth, is in no lock at all.",
    hints: ["Polyrhythmic orbits", "1:2:4 lock", "Celestial mechanics", "One free body"],
    quote: "Three of Galileo's four moons dance in mathematical lock; the fourth goes its own way. Your preset orbits in acoustic resonance.",
    surprise: "Three elements at 1 Hz, 2 Hz and 4 Hz in perfect lock, and a fourth at a rate unrelated to them that never joins—Callisto",
  },
  "CORTAZAR_HOPSCOTCH": { quote: "Cortázar gave Hopscotch two orders to be read in and dared you to find more. Play the notes in any order—all paths lead somewhere." },
  "STANDING_WAVE": { surprise: "Calculate your room's first axial modes—f = n × 343 ÷ (2 × the length in metres), for n = 1, 2, 3—and tune to them" },
  "MURDER_BALLAD": { surprise: "Lean on the tritone, the old 'devil in music', with minor seconds grinding against it" },
  "TARKOWSKY_MIRROR": { name: "TARKOVSKY_MIRROR", surprise: "Three delays: one at 251ms, one at 617ms, one at 1019ms—prime numbers never align" },
  "MATRIX_CHOICE": { technical: "Morpheus offers a choice. Left hand plays the illusion (blue), right hand plays the truth (red). Split keyboard." },
  "BILL_TED_EXCELLENT": { technical: "Lush intervals. Parallel harmonies. Everything agrees. No discord allowed." },
  "WIZARD_OZ_CURTAIN": { surprise: "Push the LFO rates up to 20–80 Hz, where wobble turns into tone, so the modulation IS the sound" },
  "2001_STARGATE": { quote: "Bowman falls through the Star Gate without a word; Kubrick leaves him speechless. Your preset is that moment." },
  "SYNECDOCHE_NY": { quote: "Caden learns that none of the millions around him is an extra—they are all the leads of their own stories. Your preset contains itself." },
  "RUMI_INTOXICATION": { quote: "A line long given to Rumi: 'Dance, when you're broken open. Dance, if you've torn the bandage off.' Your preset is the whirling." },
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const used = new Set(Object.keys(FIXES));
const cards = original.map((c) => {
  const fix = FIXES[c.name] || {};
  used.delete(c.name);
  const card = { ...c, ...fix };
  return { id: slug(card.name), pool: "original", ...card };
});
if (used.size) throw new Error(`fixes name cards the original doesn't hold: ${[...used].join(", ")}`);

const fresh = JSON.parse(readFileSync(resolve(tools, "new-cards.json"), "utf8"));
for (const c of fresh) cards.push({ id: slug(c.name), pool: "new", ...c });

const ids = new Set();
for (const c of cards) {
  for (const f of ["id", "name", "theme", "technical", "hints", "quote", "surprise"]) if (!c[f] || (f === "hints" && !c.hints.length)) throw new Error(`card ${c.id || c.name} lacks ${f}`);
  if (ids.has(c.id)) throw new Error(`duplicate id ${c.id}`);
  ids.add(c.id);
}

const deck = {
  about: "The Preset Oracle's deck. The 122 'original' cards are Loudon's, restored from his oracle page (original/oracle.html) with factual errors corrected (tools/restore-deck.mjs lists each one). The 'new' cards were written in the original's shape by the page's steward on 2026-11-04. Every card: a name, a theme, a quote, technical guidance, four hints, and a hidden transmission ('surprise').",
  version: "oracle-2",
  fragments,
  cards,
};
writeFileSync(resolve(deckDir, "Preset Oracle — deck.json"), JSON.stringify(deck, null, 2) + "\n");
console.log(`${cards.length} cards (${original.length} original, ${fresh.length} new), ${Object.keys(FIXES).length} corrected → Preset Oracle — deck.json`);
