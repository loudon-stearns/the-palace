---
title: "Particle Synthesis — tuning"
born: 2026-10-21
links:
  - target: "[[Particle Synthesis]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Particle Synthesis's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught Particle Synthesis about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# Particle Synthesis — tuning

What Particle Synthesis's steward cycles taught the page, and the changes to the house its steward proposed. The Concierge opened this ledger on 2026-10-21, on Loudon's word, to leave the steward its first one-shot order; the orchestrator writes every line after it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

- from Loudon · 2026-10-21 · "Yes, have the Concierge write the one-shot plan order in Particle Synthesis's steward tuning ledger": propose a plan for Particle Synthesis as a plan_revision ask for his yes, where the work is going and the moves ahead each named by what it does, since the revival landed at 97daf2f2 without an agreed plan and Revival Ceremony v2.1 step 5 says a page that already has a steward lands then plans, its steward's first cycle proposing · paid in cycle 6

## From cycle 6 — 2026-10-22

1. A GPU-against-CPU mirror of this fountain only agrees past the first second when the CPU steps the motion and the rest timer in 32-bit floats (Math.fround) as the GPU does; with 64-bit motion the same strikes land a sample apart and the chirps decorrelate to about 0.57. *(offered by the steward, cycle 6)*
2. **Proposed for canon** · 2026-10-22 · [[Particle Synthesis]] · § Particle Fountain: First Build, the paragraph beginning **The physics-as-DSP insight:** · canon change owed *(proposed by the steward, cycle 6)*
   Why: The current paragraph says the particle under gravity is the harmonic oscillator and that the gravity constant is the spring constant. Both are wrong: a thrown particle follows a parabola, and nothing in it is a spring. The new words keep the real insight and say what the build actually does.
   Path: `Projects/Particle Synthesis.md`
   > **The physics-as-DSP insight:** The Particle Fountain connects directly to [[Differential Equations]]. The trajectory is the solution of m·ÿ = −m·g − k·|v|·v, solved one audio sample at a time. That is a second-order equation, but not an oscillator: gravity draws a parabola, not a sine. The only repetition comes from the bounce, where each strike hands back 45% of the speed. The 2026-10-22 GPU build steps exactly this equation once per sample for each of 1024 particles, so what you see moving is what you are hearing. Loudness, brightness and sweep are each set by the particle's state at the moment it strikes.

- run · 2026-10-22 · cycle 6 · taught item 1, proposed item 2 for canon
