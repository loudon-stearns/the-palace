---
title: "Generative Sample Libraries — tuning"
born: 2026-10-16
links:
  - target: "[[Generative Sample Libraries]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Generative Sample Libraries' record of what its steward's cycles taught it: a line for every cycle, and a numbered item when a cycle taught something. The measurements stay in the design doc, and what a cycle left rough stays on the scroll's trail; I keep what the next cycle should carry into its work."
ledger: tuning
standards:
  for: "what each steward cycle taught Generative Sample Libraries about making instruments from an AI source, "
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer (Loudon, 2026-10-15)"
  merge: union
  kept: git
  trim: never
---

# Generative Sample Libraries — tuning

What each cycle taught the project. Each item is one line, naming what the cycles showed and what changed because of it; the measurements, tables and commands stay in `ai-source-probe/DESIGN.md`, in the section each item names. Seeded on 2026-10-16 from that doc, cycles 20 to 38. What a cycle left rough stays on the scroll's trail, and the scroll's Now will list the rough notes that recur. From cycle 39 on, every cycle leaves a run line by itself.

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

## From cycle 39 — 2026-11-03

11. The finishing pass can break a loop seam that passed before it. Lifting a sagging opening by the full 8 dB reaches into the stretch the loop wraps through, so read seams_clean in finishing.json before shipping, and treat a failed seam as a key to re-render. *(offered by the steward, cycle 39)*
12. **Proposed for canon** · 2026-11-03 · [[Interview skill]] · after Rule 2 (audition before the full batch), a new section · canon change owed *(proposed by the steward, cycle 39)*
    Why: the plan's current step finishes when the critique-and-regenerate loop runs inside the interview; the violin and now the flute show the loop works on any bowed or blown source
    Path: none yet (a new page)
    > The section drafted in full at Projects/Generative Sample Libraries/interview-redo-step-proposal.md, 'After the batch — when the source is a model, the listener's notes go back to the model': ask which keys give it away (offering the measured weak keys, including any key whose seam failed in finishing), re-render those keys on fresh seeds and never patch the sample, rebuild through the same chain and play back only what changed, then go another round or stop. Its tool is ai-source-probe/redo_keys.py, which has now run on two instruments without changes.

- run · 2026-11-03 · cycle 39 · taught item 11, proposed item 12 for canon

## From cycle 40 — 2026-11-03

13. Corrects item 11: the finishing pass does not break loop seams (it never touches the loop). Flute G4's seam was weak from the start, and the seam check hid it by measuring the take's own wobble over the opening as well as the loop. Measure a seam against the loop alone, and trust the gain-independent seam jump. *(offered by the steward, cycle 40)*
- run · 2026-11-03 · cycle 40 · taught item 13
