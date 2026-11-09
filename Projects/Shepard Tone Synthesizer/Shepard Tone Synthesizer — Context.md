---
title: "Shepard Tone Synthesizer — Context"
born: 2026-11-08
links:
  - target: "[[Shepard Tone Synthesizer]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Shepard Tone Synthesizer is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# Shepard Tone Synthesizer — Context

This is the memory behind [[Shepard Tone Synthesizer]]. It explains why the page holds Loudon's February design and, beside it, the measurements that corrected it. It explains why the stages it keeps pointing at were never written on it, and what the April arc gave up on the way to a plugin. Read it before rewriting § The Synthesizer Architecture, before adding a Theory section for a new stage, or before reviving anything from `Archive/`. The page is the design and the theory. The [[Shepard Tone Synthesizer — scroll|scroll]] holds the plan, the standing orders and the building. The two files in `Archive/` hold the April arc as it was first designed.

## Why it is shaped as it is

**Loudon's design, kept as his.** The page was born in February 2026, before the palace was in git. It first appears in a bulk commit of 2026-03-24 (4169e6ad). The frontmatter says `who_leads: loudon`, and § The Synthesizer Architecture opens "This is Loudon's design". That is why the page corrects the architecture by adding notes, not by rewriting it. Stage 4 found that a filter on the summed audio thumps once voices carry overtones, so the window belongs on each voice (99b71ea4, 2026-10-18). The fixed global Shepard filter is still drawn in the diagram. A dated *Measured in Stage 4* note sits under it, and Theory § Stage 4 says "corrects the architecture described above". So the design and its correction sit side by side on purpose. Redrawing the diagram is Loudon's call.

**Theory and instrument grow together.** The forward vector makes that a condition, so each stage that gets built gets a Theory section that explains what you hear. § Theory — Octave Equivalence began when the 2026-07-06 weave folded the former Octave Equivalence entry in whole (44339ae6). That page had no life of its own outside this instrument. Its `enables` link went at the 2026-09-24 weave (8972a53d). Stages 3 and 4 were written by the steward cycles that measured them (212c2005, 99b71ea4, 2026-10-18). Back then a steward could change the page directly. Now its canon edits wait in the tuning ledger, which is where cycle 12's plugin paragraph sits as item 4.

**The stages live off the page.** The arc was designed with Loudon in April and written in `Archive/Shepard Tone Synthesizer — Staging.md` (born 2026-04-21, moved into the bundle 2026-06-05, 5e215dec). That file held an Alignment Record of decisions and five stages, each with its tool and its question. Plans moved into scrolls on 2026-09-25 (d4cb3fa1), so the staging file retired. Its decisions became the scroll's Standing Orders, and its session designs went to `Archive/Shepard Tone Synthesizer — spec — Loudon Live sessions.md`. Loudon archived that spec the next day, when Loudon Live stopped being a curriculum (a22b039b). This is why each Theory stage opens "Pair with Stage N above", pointing at sections that were never on the page. The words were written at the 07-06 fold, when the stage designs lived in the staging file. They should now point at the scroll's Plan or at the archived spec. The page has not been changed.

## What the page left out, and where it went

- **The plugin.** On 2026-11-03 all four proven layers became one instrument, Shepard Tone, a VST3 and AU in the bundle's `plugin/`. It has a Climb knob, two break-it switches and a helix drawn as Escher's staircase. The page does not mention it yet. The paragraph that would add it is tuning item 4 and waits on Loudon.
- **The Max builds.** The glide and timbre "what the patch will need" specs (`— spec — the glide build`, `— spec — the timbre build`) are in the bundle for the day Max returns. Nothing in them has been patched.
- **The proofs and measurements.** These are in `proofs/` and on the scroll's trail: the May endless-ascent renders, the June Stage 2 variants, and the September and October glide and timbre manifests. The page's Theory states the results. The trail keeps the numbers and the failures.
- **Five links.** Piano String Inharmonicity folded at the 10-24 weave's one-link-per-pair pass (769c93ad). Granular Synthesis, Kuramoto Coupling, Particle Synthesis and Signal-Rate CV Architecture were cut as links with no reason given (17e99b33). Piano String Inharmonicity and Kuramoto Coupling are still named in the body and on the scroll's Plan.

## What was tried and dropped

These come mostly from the two archived files.

- **The environment ladder.** The April Alignment Record ran the arc Ableton → vanilla Max → Gen~ → RNBO, one tool per stage, and Loudon reaffirmed it on 2026-09-25. It ended in three steps. Max was paused on 2026-10-16 until there are patching standards (929de8c5). On 2026-10-21 the stewards were told to make the instrument a product on the [[VST Template]] (ca454ba2). On 2026-11-04 Loudon granted a plan that follows the plugin, not Max (`shepard-steward-031`). Max, gen~ and RNBO are set aside as later teaching tools, not dropped.
- **The session framing.** The April design described 60–75 minute [[Loudon Live]] sessions that open on Meld's built-in Shepard tone, then frame it with Escher, build a rack in Ableton, and compare. That went on 2026-09-26. Three of its decisions survive as Standing Orders: Escher as the anchor, 85% making to 15% framing, and the DAW-fluent audience. The rack itself survives as the Plan's last move, "the open door". So does the barber-pole question, which also became the page's sixth Open Question and the seed of [[Auditory Illusions]] (a22b039b).
- **Stage 5, "The Portal".** It meant an RNBO export plus microtuning. It became the Plan's second move, "the stretched octave", with no RNBO in it.
- **Hide the seam.** For Stage 2, GLIDE-AND-HIDE was rejected in favour of STEP-AND-SHOW, granted 2026-06-05 and recorded in the staging file. The wrap is lit briefly so the mechanism stays readable, and that is why Theory § Stage 2 is about the seam the eye sees and the ear forgives.
- **A glide per voice, and a fixed Hz slew.** Stage 3 measured both breaking the stack, by up to 93 and 1,006 cents. They returned as a deliberate break-it switch, Drift. Cycle 13 found that a ride drawn from theory would have shown Drift doing nothing on Climb (tuning item 5).

## Waiting on Loudon

- Tuning item 4: the plugin paragraph for § The Synthesizer Architecture.
- The rich-face challenger's claim change (8e3d8131, 2026-11-03), on Theory § Stage 1. The sentence there says a literal bandpass in Hz would over-weight the low octaves. That is true of a bell drawn on a linear Hz axis, but not of a real 2-pole bandpass, which is symmetric in octaves. The remake (7cc4d9f5) tests the claim inside the rich face. The page sentence is unchanged until he rules.
- Whether the plugin climbs forever by ear. `shepard-steward-034` has the steward paused, and the scroll's most repeated rough note is that nobody has listened. When he plays it, record what he hears here or on the scroll. The stage should not move until then.
