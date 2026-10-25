---
title: "Generative Audio Devices — scroll"
born: 2026-09-23
links:
  - target: "[[Generative Audio Devices]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Generative Audio Devices's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Generative Audio Devices — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Generative Audio Devices]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-25T00:50:07.254Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 0 · last ran —
- **Plan:** agreed 2026-10-24 (today) · 0 made things since
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** nothing on the board yet — but the bundle holds 1 media file (see the making trail)
- **Last commit touching this project:** 2026-10-21 `036f9a27` — ops(rich-face): the pins: 57 CDN script tags in 35 pages load their library from the shelf, at an exact version with its integrity hash, on Loudon's yes
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** none in the ledger yet
- **Last run:** none in the ledger yet
- **Owed in the ledger:** 1 — 1 order from Loudon; the next run's tail read picks it up first

### Where this stands

_The steward has not spoken yet._

### Open asks

_None — nothing is waiting on you._

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

### Runs

_None yet._

### Owed

- **From Loudon, 2026-10-24.** "Yes, land the revival as drafted, with the small Plan edit.": propose a plan for Generative Audio Devices as a plan_revision ask for his yes, where the work is going and the moves ahead each named by what it does, opening with what he asked when he played the house bass in Rack (the computer keyboard and the MacBook speakers as every patch's defaults, and each modulator on the row under the module it modulates; the Standing Orders), since the revival lands without an agreed plan and Revival Ceremony v2.1 step 5 says a page that already has a steward lands then plans

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Woken** (Loudon, 2026-10-24). He played the April house bass in Rack and called it alive. The moves below are the September path; his steward's first cycle proposes a revision for his yes, opening with what he asked at the revival (the Standing Orders).

**Where this is going.** A pipeline that turns a plain description of a sound into a loadable instrument for any modular or DSP environment: English in, a target-neutral patch language (PDL) in the middle, and one verified vocabulary per target on the way out. VCV Rack is the first target, and the whole chain has worked there since May 2026: [[VCV Patch Generator — spec — PDL generation prompt|PDL Generation Prompt]] writes two or three candidate patches, [[Generative Audio Devices|PDL Renderer]] emits a `.vcv` that loads, and fresh agents went nine for nine. On 2026-10-24 Loudon's ear met the first patch, and the next step is to make every emitted patch as quick to hear.

**The moves ahead**

1. **Hear it in Rack.** On the Mac, Loudon writes a description through the prompt, picks a candidate, emits it, loads it in Rack, and says whether the revised archetypes sound usable and the two-row layout matches his muscle memory. Starting material is in `Shop/VCV Patch Generator/recipes/` and `Shop/VCV Patch Generator/t6-runs/`. The second target waits on this.
2. **Prove it on a second target.** A second environment gets its own vocabulary file and emitter, not a new architecture, and it passes when the same PDL that makes a VCV patch makes a working artifact there. Pure Data is the safest choice; RNBO codebox~ has the most reach and forces the real question, whether a code-emitting target fits a graph-shaped language. One target at a time.
3. **Search the modules by feel.** A search box in the renderer's module sidebar that lights up every module whose description words match what you type. It passes when "bright" lights the oscillator and filter, "breathing" lights the LFO and envelope, and "kick" lights nothing, which is the sign the vocabulary still needs percussive words.
4. **Give PDL its own page.** Move the grammar, the signal types and the port-resolution order out of [[Generative Audio Devices]] into a `PDL Spec` entry the project links to.

The last two are side moves with no fixed place: the search box was marked medium priority and the PDL page low, and either can go whenever there is a spare hour. Two gaps are named and deliberately deferred, and neither may hold up the second target. One is polyphony, which the project's three layers can't yet represent: the keyboard module carries one voice, and Loudon labelled his warm-pad refinement in `recipes/` "should be polyphonic!" The other is a recount of the oscillator and filter parameters against Rack's own source, since patches Rack re-saves carry more parameter slots than the vocabulary lists.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
Written on Loudon's word at the revival, 2026-10-24, when he played the house bass in Rack ("The house bass feels alive! Love it, I would ask that for the midi input it always defaults to QWERTY keyboard, and for audio device it defaults to macbook speakrs, this way I can easily test patches, I'd also ask that all modulators like envelopes are placed on the row right below the main thing they modulate."):

- Every patch this project emits opens ready to play on Loudon's Mac: MIDI input on the computer keyboard (QWERTY), audio out to the MacBook speakers.
- Every modulator (an envelope, an LFO, a sequencer) sits on the row right below the main module it modulates.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="gad-revival-2026-10-24" -->
### 2026-10-24 — Revived: Loudon played the house bass in Rack, and the page is sprout

The Daily Page dealt the Revival Ceremony, and Loudon ran it on the palace's one dormant page. Nothing was made while it slept: since it was paused on 2026-09-25 only moves, pointers and pins touched it, and its steward, registered 2026-09-24, never ran. He met it through the first playable patch, `house_bass.vcv` from 2026-04-20, opened in VCV Rack 2 Pro, and played it: "The house bass feels alive!" What he asked while playing became the Standing Orders. Rack's re-save, which already carries both device defaults, is kept as a proof. There is no agreed plan yet: the steward's first cycle proposes one for his yes.

**Artifacts:**
- [the entry, stage sprout.](Projects/Generative Audio Devices.md)
- [Rack's re-save of the house bass, the source for the device defaults.](Projects/Generative Audio Devices/proofs/2026-10-24-revival/house_bass-rack-resave.vcv)
<sub>`gad-revival-2026-10-24` · revival landed by an elder · met in the room 2026-10-24</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-10-24T20-49-12-04-00" -->
### 2026-10-24 — Plan revised

the revival of 2026-10-24: the pause is over; the moves wait on the steward's revision

_The plan before this change:_

> **Paused** (Loudon, 2026-09-25). Nothing has moved since May, and he has set the project down for now; the moves below are the path to pick up when it wakes.
>
> **Where this is going.** A pipeline that turns a plain description of a sound into a loadable instrument for any modular or DSP environment: English in, a target-neutral patch language (PDL) in the middle, and one verified vocabulary per target on the way out. VCV Rack is the first target, and the whole chain has worked there since May 2026: [[VCV Patch Generator — spec — PDL generation prompt|PDL Generation Prompt]] writes two or three candidate patches, [[Generative Audio Devices|PDL Renderer]] emits a `.vcv` that loads, and fresh agents went nine for nine. Nothing has moved since then, and the next step is Loudon's ear.
>
> **The moves ahead**
>
> 1. **Hear it in Rack.** On the Mac, Loudon writes a description through the prompt, picks a candidate, emits it, loads it in Rack, and says whether the revised archetypes sound usable and the two-row layout matches his muscle memory. Starting material is in `Shop/VCV Patch Generator/recipes/` and `Shop/VCV Patch Generator/t6-runs/`. The second target waits on this.
> 2. **Prove it on a second target.** A second environment gets its own vocabulary file and emitter, not a new architecture, and it passes when the same PDL that makes a VCV patch makes a working artifact there. Pure Data is the safest choice; RNBO codebox~ has the most reach and forces the real question, whether a code-emitting target fits a graph-shaped language. One target at a time.
> 3. **Search the modules by feel.** A search box in the renderer's module sidebar that lights up every module whose description words match what you type. It passes when "bright" lights the oscillator and filter, "breathing" lights the LFO and envelope, and "kick" lights nothing, which is the sign the vocabulary still needs percussive words.
> 4. **Give PDL its own page.** Move the grammar, the signal types and the port-resolution order out of [[Generative Audio Devices]] into a `PDL Spec` entry the project links to.
>
> The last two are side moves with no fixed place: the search box was marked medium priority and the PDL page low, and either can go whenever there is a spare hour. Two gaps are named and deliberately deferred, and neither may hold up the second target. One is polyphony, which the project's three layers can't yet represent: the keyboard module carries one voice, and Loudon labelled his warm-pad refinement in `recipes/` "should be polyphonic!" The other is a recount of the oscillator and filter parameters against Rack's own source, since patches Rack re-saves carry more parameter slots than the vocabulary lists.
<sub>`plan-2026-10-24T20-49-12-04-00` · plan revised · agreed 2026-10-24T20:49:12-04:00 · an elder, on Loudon's yes of 2026-10-24</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-56-04-04-00" -->
### 2026-09-25 — Plan agreed: carried over from the Roadmap, and paused

Carried over on 2026-09-25 from the entry's Roadmap and the forward half of Pick Up Here, when Loudon asked that every plan fold into its scroll (SCHEMA v1.25). Order from Pick Up Here: hear it in Rack, then prove it on a second target; the search box and the PDL page are side moves with no fixed place; the two deferred gaps (polyphony, the parameter recount) are named at the end. Nothing has moved since 2026-05-29 (45ffdd4c), and the same day Loudon called the project paused: the entry's stage is now dormant, and the plan is the path to pick up when it wakes.
<sub>`plan-2026-09-25T20-56-04-04-00` · plan agreed · agreed 2026-09-25T20:56:04-04:00 · carried over by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

_Nothing made yet — the first shipped thing will open the trail._
<!-- scroll:making:end -->
