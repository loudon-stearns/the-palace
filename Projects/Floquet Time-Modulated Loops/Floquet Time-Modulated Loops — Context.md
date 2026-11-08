---
title: "Floquet Time-Modulated Loops — Context"
born: 2026-11-08
links:
  - target: "[[Floquet Time-Modulated Loops]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Floquet Time-Modulated Loops is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# Floquet Time-Modulated Loops — Context

This is the memory behind [[Floquet Time-Modulated Loops]]. It covers why the page is still mostly a lecture, what left it at the October weave, and which of its Stage 1 numbers the steward's first cycles measured and found off. Read it before cutting the Theory, before landing any of the four canon edits the steward has queued, or before treating § Stage 1's test list as true. The page is the considered design and the lesson. The [[Floquet Time-Modulated Loops — scroll|scroll]] holds the plan and the building. The tuning ledger holds what the building taught.

## Why it is shaped as it is

**It was written as a build order.** The page began as a Stage 1 build manifest (1676f243, 2026-04-30): a full teaching document followed by twenty media specs, written so that "the next Claude" could build every piece. Claude Code built them that same day on the branch `floquet-build-manifest` and indexed them in `BUILD_SUMMARY.md`. Two days later the theory cluster grew up around it (605aefc0, 2026-05-02). [[Floquet Theory]], [[Mathieu Equation]], [[Parametric Resonance]] and [[Photonic Time Crystals]] were born as seeds, and that is why the page holds four `spawned` links.

**The Theory stays on the page because the lesson is the deliverable.** The forward vector asks for Stage 1 "shipped first as a complete pedagogical artifact — every named object taught". So § The Theory is written for a bright student, with a media reference for each named object and the Bright Student asides. It is most of the page's 68 KB. That is a choice, not drift. A later hand may move the lecture into the rich face or a bundle file, but should know the page was built to be read as the lesson.

**The stages are builds, not sessions.** The five stages first framed a five-session [[Loudon Live]] arc. On 2026-09-26 Loudon recast Loudon Live as his whole public self and not a curriculum (a22b039b), and the plan was rewritten the same day so that each stage is a build that can happen in public. The stages themselves did not change. Their order and their stage-numbered headings on the page are the April design. The scroll's Plan names each by what it does.

**The page holds the design, and the scroll holds the plan.** Plans moved into scrolls on 2026-09-25 (079b2b41, SCHEMA v1.25). Since then the page carries the one-line pointer, "The plan … lives on [[Floquet Time-Modulated Loops — scroll]]", in the opening and again in § Stages 2–5. The 10-24 weave held that line up as one of two conventions for where a plan lives.

**Why `codebox~`.** § Implementation choices argues for it: per-sample state, the same convention as the 2D Torus's `torus_2d_lookup.codebox`, the same A/B harness, and a clean RNBO export. That reasoning still stands, but Max has been paused since mid-October. So the steward's nine cycles of 2026-11-03 built in Python and the browser, and Stage 1's codebox has been checked only in Node (1.2 × 10⁻¹⁵ against the Python reference), never in Max.

## What the page left out, and where it went

**The Build Manifest and its validation summary.** About 470 lines, media-01 through media-20 plus the operating context, were cut at the 2026-10-24 weave (a75350ec). The writer's log (`_ops/swarm/sessions/weave-2026-10-24/writers/log-set-1.md`) gives the reason: the manifest was a hand-off that had been carried out, `BUILD_SUMMARY.md` indexes what was built, and git holds the manifest. The same pass re-pointed § The Theory's media references to `BUILD_SUMMARY.md` and the codebox section to `RNBO/README — Mathieu Resonator.md`, and it dropped the forward vector's "the next Claude executes it" paragraph. The page went from 103 KB to 68 KB. One leftover remains, flagged for an elder and not yet fixed: the Open Questions bullet on a stretch interactive still says it "belongs as Build Manifest item".

**The judgment calls.** The build added `damping_zeta` 0.025 and a soft clip on the state, neither of which the manifest asked for. Both are argued in `NOTES.md`, not on the page, and the page points at them from its tanh question.

**Everything built after Stage 1.** The pumped comb (cycles 2 and 3, `comb/`), the gentle resonator (cycle 4, `gentle/`), the surface-as-filter with its cheap modal bank and pitch-locked scan (cycles 5–8, `kernel/`), and the first inverse solve (cycle 9, `inverse/`) all live on the scroll's trail. The page describes Stages 2–4 only as April sketches.

## What the making corrected, and the page has not taken in

**Stage 1's numbers.** Cycle 1 (2026-11-03) found that the codebox's arithmetic was exact but its own test list was wrong. The threshold is 2ζ, not 4ζ, so the "below threshold" test at q = 0.05 sits right on it. Q is 20, not 33. The tongue is about twice as wide as stated, and the default noise level drowns the crack. The rich-face round (c3e4ee29, e22ff107) reached the same threshold. The cause, in tuning item 1: the comments were written from the plan, not measured from the code. § Stage 1's Testing protocol inherits the same plan-side numbers, so check it against `verify/Mathieu Resonator — offline check.md` before you teach from it.

**Saturation is decided.** Loudon granted GENTLE (`floquet-steward-003`): energy-dependent damping, which leaves the sideband ladder clean where the build's tanh buried it. Cycle 4 built it, off plan and offered as proof, and measured the level following the pump. The page still asks "whether it's the right sound … is open". Tuning item 8 drafts the progressed line.

**Four canon edits wait on Loudon.** Items 6, 8, 16 and 18 each add one paragraph: the comb's two tongue widths (Stage 2), the saturation ruling (Open Questions), a live voice's tracker budget (Stage 3), and the inverse problem that turned out to be a lookup and not a search (Stage 4). Each paragraph supersedes an earlier draft (items 2, 4, 10, 12, 14). The page has not changed. Land them as one pass, in place, so the stages read as built rather than sketched.

## What was tried and dropped

- **The build's clip-and-tanh saturation.** It was replaced by the gentle version on Loudon's ruling above. The stiff version, a stiffening spring, was auditioned and not chosen.
- **The session framing** of the five stages, dropped 2026-09-26 as described above.
- **Naming a render from theory.** The 2× comb was titled "octave" before it was measured, and it measured as odd harmonics at the same pitch (tuning item 3). The habit the ledger keeps is to measure first, then name.
- **A search for the inverse problem.** The page calls Stage 4 "thesis-scale". Cycle 9 found that for a surface filter the forward map is the surface's own 2D spectrum, so solving backward is an inverse Fourier series and one rounding step (tuning item 17). The general inverse problem stays open. The tractable case is not hard.

## What the next hand should record

Nobody has listened. The scroll's most repeated rough note, in eight entries, is that no one has heard the play page or the reels, and cycle 6 asked Loudon for two minutes with the surface-as-filter. When he listens, record what he hears here or on the scroll. Then decide whether the stage moves.
