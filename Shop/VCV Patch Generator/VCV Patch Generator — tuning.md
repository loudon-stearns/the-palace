---
title: "VCV Patch Generator — tuning"
born: 2026-11-08
links:
  - target: "[[VCV Patch Generator]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the VCV Patch Generator's record of what generating patches has taught it: a line for every job, and a numbered item when a job or an audition taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real audition taught."
ledger: tuning
standards:
  for: "what generating and auditioning patches taught the VCV Patch Generator page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — a Rack audition, or a probe of the generator itself"
  line: "- run · <date> · <brief, patch or probe>, <sketch | study | piece | audition | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece, a registry change or an archetype change"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# VCV Patch Generator — tuning

What each job taught the VCV Patch Generator page. Each item names what the job showed and what changed because of it, if anything did. Newest last. These are the page's dated gotchas, moved here on 2026-11-08 when its Gotchas became present-tense rules. The page's `last_tested` date, the first job, is kept as the first run line. The three undated registry gotchas stay on the page as rules.

## From the first job — 2026-05-29 — the T7b archetype triple, Piece tier

1. **A one-ADSR `kick` loads without its pitch drop.** The archetype's punch is a `copy` constraint binding `pitch_env.D` to `amp_env.D`; with one envelope declared the `pitch_env` role went unfilled, the resolver warned, and the patch made sound without being a kick. Changed: declare `@AMP_ENV = ADSR` and `@PITCH_ENV = ADSR` (the names the convention map infers) and route the pitch envelope to `OSC:FM`; the kick recipe in the bundle shows the shape.

## From Loudon's first Rack audition — 2026-05-29

2. **A correct patch with every modulation depth at zero didn't move.** The v0.1 archetypes set destination knobs but left the attenuverters (`VCF.FREQ_CV`, `VCO.FM_DEPTH`) at their zero defaults, so cabled modulation was silent. The audition raised `VCF.FREQ_CV` to about 0.38 on the pluck and 0.03 on the pad. Changed: T7c folded depth into the param clouds (archetypes v0.2, per [[Generative Audio Devices]]); until then, and on any hand-written `*` line with a modulation cable into it, the attenuverter is set by hand.
3. **`FREQ = sub` or `low` fought the keyboard on a MIDI-tracked voice.** A static multi-octave offset stacked on incoming pitch and detuned the played note. Changed: base FREQ stays at keyboard-tracking (0) on a played instrument and "sub" comes from register and envelope; tuning offsets are for drones and unplayed voices.
4. **Pads are polyphonic and the pipeline isn't.** `MIDIToCVInterface` emits one channel; VCV poly lives in the module `data` blob, which the emitter writes as `{}`. Changed: nothing built; polyphony is a named roadmap axis, deferred from T7c.

## From T7d — 2026-05-29

5. **Layout became two-row by default.** Emitted patches place MIDI hard-left, the audio path left to right in signal order, and modulators (ADSR, LFO, SEQ3) on the row below, matching the hand-arrangement Loudon's audition produced. Rows come from registry shape and topological depth, so a newly registered module lands sensibly without a layout rule. Changed: the default patch is workflow-ready; bespoke layout still happens in Rack.

- run · 2026-05-29 · T7b archetype triple (kick, warm_pad, pluck at seed 1) and its Rack audition, piece · taught items 1–5
