---
title: "Generative Sample Libraries — tuning"
born: 2026-10-16
links:
  - target: "[[Generative Sample Libraries]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Generative Sample Libraries' record of what its steward's cycles taught it and what they still owe: a line for every cycle, a numbered item when a cycle taught something, and a debt for what a cycle left rough, tagged by who can pay it. The measurements stay in the design doc; I keep what the next cycle should carry, and what is still waiting."
ledger: tuning
standards:
  for: "what each steward cycle taught Generative Sample Libraries about making instruments from an AI source, and what it still owes"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer (Loudon, 2026-10-15)"
  debts: "a left rough line for what a later cycle can pay (the tail read lists it as the cycle's to-do); a waiting on Loudon line, ending open, for what only he can; a seen again line when one recurs (three on a debt waiting on Loudon go to the board as an ask)"
  merge: union
  kept: git
  trim: never
---

# Generative Sample Libraries — tuning

What each cycle taught the project, and what it still owes. Each item is one line, naming what the cycles showed and what changed because of it; the measurements, tables and commands stay in `ai-source-probe/DESIGN.md`, in the section each item names. Seeded on 2026-10-16 from that doc and from the "left rough" notes on the scroll, cycles 20 to 38. From cycle 39 on, every cycle leaves a run line by itself.

## Seeded from cycles 20 to 38 — 2026-09-23 to 2026-10-15

1. **The guide picks the note, never the octave.** It becomes a one-hot chroma, so wording, timbre and guidance can't move the register. Changed: file every take by the note it played. (DESIGN.md § The first real run; § The top-octave ceiling; § Filed by the note it played)
2. **Takes are the lever.** Render five, keep the steadiest, and let any fresh take fill any flagged key. (§ Prompt shape; § Best of five; § Re-asking the model for a flagged key)
3. **MusicGen writes music, not notes.** The violin starts mid-note and the marimba rolls. Changed: shape attacks after the render. (§ Attacks)
4. **MusicGen plays notes the real instrument can't.** Changed: trim to the real range; don't fill below it. (§ Trimmed to the real instrument)
5. **A take can pass the pitch check and still glide, roll, or strike an octave off.** Changed: check `holds_pitch` first. (§ Marimba middle filled; § Filed by the note it played)
6. **Level is set after the take.** A bad key needs a better take, not more gain. (§ The violin, finished; § Re-asking the model)
7. **Loops need a power-preserving crossfade and a pitch gate**, and a strong second harmonic can read an octave high on a long hold. (§ Sustain loops)
8. **Check the grader before trusting it.** A pin at its search band's edge and a floor two octaves down both misgraded good takes. (§ The first real run; § The top-octave ceiling)
9. **Practice: cycle 29 died running a 50-minute sweep in the foreground.** Changed: long renders run detached and in chunks; now Loudon's standing order on the scroll.
10. **Practice: WAVs are gitignored, and cycles 37–38's commits were refused over one.** Changed: `process-cycle.js` now commits around an ignored file and names it.

## Debts open as of cycle 38

- waiting on Loudon · 2026-10-16 · cycle 38 · your ear on the finished violin and its redo of A#3, C4 and C5 · open
- seen again · 2026-10-16 · cycle 38 · your ear — unheard in every cycle from 20 to 38, seventeen in a row
- waiting on Loudon · 2026-10-16 · cycle 38 · your ear on the flute and the marimba · open
- waiting on Loudon · 2026-10-16 · cycle 37 · the finished violin loaded in a real sampler (sforzando or DecentSampler) · open
- left rough · 2026-10-16 · cycle 34 · the flute still uses the violin's bow attack; it may want its own · owed
- left rough · 2026-10-16 · cycle 37 · the finishing pass for the flute and the marimba · owed
- left rough · 2026-10-16 · cycle 31 · rebuild the older asked-mode builds under the octave rule · owed
- left rough · 2026-10-16 · cycle 38 · the new C4 sits 10 c sharp, now the violin's worst key · owed
