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

> _Regenerated 2026-10-26T14:00:44.839Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 2 · last ran 2026-10-26 (today)
- **Plan:** agreed 2026-10-24 (2 days ago) · 2 made things since · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-26 (today) — The warm pad now plays chords: six voices from the QWERTY keyboard, wired through every module, checked against Rack's own source. (`gad-steward-005`)
- **Last commit touching this project:** 2026-10-26 `03ffa7e9` — steward(Generative Audio Devices): cycle 1 — SPINNING UP. HOME: [Generative Audio Devices](obsidian://open?vault=The…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 2 runs on 1 day, counted from the ledger's run lines
- **Last run:** 2026-10-26 — cycle 2 · taught item 3, proposed items 4, 5 for canon
- **Owed in the ledger:** nothing
- **Proposed for canon:** 3 — items 2, 4, 5; waiting on Loudon's review, and the page has not changed
- **Latest lesson:** item 5, from cycle 2 — 2026-10-26 — [[Generative Audio Devices — tuning]]

### Where this stands

Generative Audio Devices turns a plain description of a sound into a VCV Rack patch: English in, a neutral patch language (PDL) in the middle, a loadable file out. It has worked since May. At the revival on 2026-10-24 you asked that every patch open on the QWERTY keyboard and the MacBook speakers, with each modulator under what it moves, and the first cycle today built that. Your own note on the warm pad, 'should be polyphonic!', named the one thing the project couldn't yet say. This cycle taught it to say it: a patch can now ask for several notes at once, and the warm pad asks for six.

### Open asks

- `gad-steward-003` — proposed plan revision: plan after the revival · posted 2026-10-26 · options: adopt · keep

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

### Runs

- 2026-10-26 — cycle 2 · taught item 3, proposed items 4, 5 for canon
- 2026-10-26 — cycle 1 · taught item 1, proposed item 2 for canon

### Owed

_Nothing owed._

### Proposed for canon

_Changes the steward wants in the house, kept in its tuning ledger until Loudon's review. Its cycles work as if they hold; the pages have not changed._

- **2.** 2026-10-26 · [[Generative Audio Devices]] · § Where it stands, the second paragraph (beginning 'Next, every emitted patch is quick to hear') — the paragraph describes as missing what this cycle built; the 'Device defaults' bullet under What still does NOT exist should go with it
- **4.** 2026-10-26 · [[Generative Audio Devices]] · § What still does NOT exist, the bullet beginning '**Polyphony**' — the bullet calls polyphony unrepresented, and this cycle represented it in all three layers
- **5.** 2026-10-26 · `Shop/VCV Patch Generator/VCV Patch Generator — spec — PDL generation prompt.md` · § PDL grammar, after the line '# archetype: name #seed=N' — fresh agents can't ask for chords until the prompt names the token, which is the T6 lesson that 'obey the registry' alone wasn't enough

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
<!-- scroll:entry id="gad-steward-005" -->
### 2026-10-26 — cycle 2 — Off plan — The warm pad now plays chords: six voices from the QWERTY keyboard, wired through every module, checked against Rack's own source.
> shipped · 3 chord patches ready to load · 20/20, older checks still pass · steward leans adopt the revised plan

_Off plan — polyphony now rather than deferred: the agreed plan holds it back, and the revision waiting on you puts it right after hearing the patches. Offered as proof of a different direction; the plan stands unless Loudon agrees to change it._

Before building, I read Rack's own source (GitHub, VCVRack/Rack and Fundamental v2). The voice count is one number, `channels`, inside the keyboard module's saved settings. Every Fundamental module we use (oscillator, filter, envelope, amp, LFO, both mixers) takes its voice count from what comes in, and the audio out adds all the voices together, so nothing gets dropped. That made it small.

What I built:
- **PDL says it:** a new line, `# voices: 6`. It stays target-neutral: it says how many notes, not where Rack keeps the number.
- **The vocabulary file says where it goes** (v2.6): the keyboard module records that its voice count lives in `channels` (1 to 16). Every module records how it carries voices, with the source line it came from.
- **The archetype gives a default** (v0.3): the warm pad plays six voices, and its amp is pinned at half level so a chord of saws doesn't clip at the speakers. The pluck, kick and the others stay at one voice.
- **Order of precedence**, the same as for parameters: the PDL line beats the archetype, and the archetype beats one voice. A bad count warns and the patch still comes out: 32 is cut to 16, and 'two' leaves it at one voice.

Checks: the new `verify_polyphony.js` passes 20/20. The emitter changes only the voice count in the device settings Rack saved for us, and every module from keyboard to speakers can carry voices. The same PDL gives the same file byte for byte, and both copies of the vocabulary match. The older checks still pass: 141/141 for your two orders, 36/36 for archetypes, 21/21 for parameter names. The nine prompt-generated candidates are still 9/9 clean.

To hear it: open [the classic warm pad](open:Projects/Generative Audio Devices/proofs/2026-10-26-chords/evolving-warm-pad--classic-warm-pad.vcv) in Rack and hold three keys.

What I passed over: giving the pluck and the stab chords too. Stabs are a natural chord sound, but you haven't heard either archetype yet, so I changed only the one you asked about.

**Artifacts:**
- [the classic warm pad, six voices: hold a chord on the QWERTY keys](Projects/Generative Audio Devices/proofs/2026-10-26-chords/evolving-warm-pad--classic-warm-pad.vcv)
- [the detuned two-oscillator pad, six voices](Projects/Generative Audio Devices/proofs/2026-10-26-chords/evolving-warm-pad--detuned-stack-pad.vcv)
- [the warm-pad recipe you refined, now playing chords](Projects/Generative Audio Devices/proofs/2026-10-26-chords/warm_pad-seed-1.vcv)
- [the chord check, 20/20](Projects/Generative Audio Devices/pdl-renderer/verify_polyphony.js)
- [the renderer: the `# voices` line, voice emission, embedded vocabulary v2.6 and archetypes v0.3](Projects/Generative Audio Devices/pdl-renderer/PDL Renderer.html)
- [vocabulary v2.6: where the voice count lives, and how each module carries voices](Projects/Generative Audio Devices/pdl-renderer/vcv_fundamental_registry.json)
- [archetypes v0.3: the warm pad plays six voices at half amp level](Projects/Generative Audio Devices/pdl-renderer/archetypes.json)

_Who decides how many notes play at once_
| patch says | archetype | voices emitted |
| --- | --- | --- |
| nothing | warm_pad | 6 |
| nothing | pluck / kick / others | 1 |
| # voices: 4 | pluck | 4 |
| # voices: 3 | warm_pad | 3 |
| # voices: 32 | any | 16, with a warning |
| # voices: two | any | 1, with a warning |

_Changed in the workshop:_ README — lists verify_polyphony.js and the vocabulary's v2.6 voice fields so the next worker can run the check
_Proposed for canon:_ Generative Audio Devices (§ What still does NOT exist, the bullet beginning '**Polyphony**') — the bullet calls polyphony unrepresented, and this cycle represented it in all three layers; owed in the tuning ledger until Loudon's review
_Proposed for canon:_ Shop/VCV Patch Generator/VCV Patch Generator — spec — PDL generation prompt.md (§ PDL grammar, after the line '# archetype: name #seed=N') — fresh agents can't ask for chords until the prompt names the token, which is the T6 lesson that 'obey the registry' alone wasn't enough; owed in the tuning ledger until Loudon's review

_Left rough:_ Nobody has heard a chord in Rack yet: the source says it works, but your ear hasn't confirmed it, and the half amp level is my guess at keeping a chord from clipping, not a measured level.

_Next moves named:_ When you play a chord patch: if it clips or sounds thin, retune the warm pad's amp level and voice count from what you hear · Teach the generation prompt the `# voices` line (proposed below) so fresh agents ask for chords when a description wants them · Then the second target, Pure Data, once you say which plan stands
<sub>`gad-steward-005` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-95f757768b" -->
### 2026-10-26 — cycle 2

taught item 3, proposed items 4, 5 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="gad-steward-002" -->
### 2026-10-26 — cycle 1 — Every patch I emit now opens on the QWERTY keyboard and the MacBook speakers, with each envelope and LFO under the module it moves. Thirteen ready to load.
> shipped · both standing orders built and checked, 141/141 · not yet opened in Rack · steward leans: load house_bass first

**The devices.** I didn't write the device settings from memory. I copied them byte for byte from the copy Rack saved on your Mac when you re-saved the house bass: the MIDI module on "QWERTY keyboard (US)" and the audio module on "MacBook Pro Speakers" at 48 kHz. They live in the vocabulary file (now version 2.5) as each module's default settings, and the emitter writes them into the patch. Before this, every module went out with empty settings, so Rack opened on whatever device it happened to pick.

**The layout.** The top row hasn't changed: keyboard on the far left, then the audio path in signal order, speakers on the far right. On the second row, each envelope or LFO now lines up under the first signal-path module its cable goes into. An LFO that only feeds an envelope takes that envelope's module. When two modulators want the same spot, the second moves right only as far as it has to, because Rack shoves overlapping modules around when it loads. Before this, the second row was just packed left to right by depth. In the house bass, for example, the filter envelope now sits under the filter at 21 HP and the amp envelope under the VCA at 29 HP. In the 808 kicks, the pitch envelope sits under the oscillator.

**The check.** A new harness, `verify_standing_orders.js`, runs every PDL the project holds through the real emitter: the house bass, the three archetype recipes and all nine candidates from the generation-prompt runs. For each patch it checks both orders and that nothing overlaps. Result: 141 passed, 0 failed. The older harnesses still pass (21/21 and 36/36), and so do all three generation-prompt runs.

For one click, [rack-layouts.html](obsidian://open?vault=The%20Palace&file=Projects/Generative%20Audio%20Devices/proofs/2026-10-26-ready-to-play/rack-layouts.html) draws all thirteen patches the way Rack will lay them out. To play one: [house_bass.vcv](open:Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/house_bass.vcv).

One more thing I found: your three hand refinements in `recipes/` are saved compressed, the way Rack saves, and their layouts don't follow one rule. In the kick, the pitch envelope sits under the keyboard module. In the pad, the LFO sits under the oscillator, even though it moves the filter. So I followed your order as written, not those layouts. If you meant 'roughly under', the rule is one function and easy to loosen.

**Artifacts:**
- [all thirteen patches drawn as Rack will lay them out, with modulators joined to their targets.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/rack-layouts.html)
- [the house bass, re-emitted: QWERTY in, MacBook out, both envelopes under what they move. Start here.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/house_bass.vcv)
- [kick recipe, seed 1.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/kick-seed-1.vcv)
- [pluck recipe, seed 1.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/pluck-seed-1.vcv)
- [warm pad recipe, seed 1 (still one voice).](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/warm_pad-seed-1.vcv)
- [generation-prompt candidate.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/bright-pluck-lead--classic-pluck.vcv)
- [generation-prompt candidate.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/bright-pluck-lead--bright-cutting-lead.vcv)
- [generation-prompt candidate.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/bright-pluck-lead--square-stab-hook.vcv)
- [generation-prompt candidate.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/evolving-warm-pad--classic-warm-pad.vcv)
- [generation-prompt candidate.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/evolving-warm-pad--detuned-stack-pad.vcv)
- [generation-prompt candidate.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/evolving-warm-pad--ambient-drone-bed.vcv)
- [generation-prompt candidate.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/punchy-808-kick--classic-808-kick.vcv)
- [generation-prompt candidate.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/punchy-808-kick--deep-sub-thump.vcv)
- [generation-prompt candidate.](Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/punchy-808-kick--filtered-808-kick.vcv)
- [the emitter: writes device settings from the vocabulary file and places each modulator under its target.](Projects/Generative Audio Devices/pdl-renderer/PDL Renderer.html)
- [vocabulary v2.5: the device settings MIDI-CV and Audio-8 open on, copied from Rack's own save.](Projects/Generative Audio Devices/pdl-renderer/vcv_fundamental_registry.json)
- [the harness for both standing orders; 141/141.](Projects/Generative Audio Devices/pdl-renderer/verify_standing_orders.js)
- [the folder's front door, now listing the new harness.](Projects/Generative Audio Devices/pdl-renderer/README.md)

_Where the modulators land: each one under the module it moves (x in HP)_
| patch | modulator | lands at | under |
| --- | --- | --- | --- |
| house_bass | filter env (ADSR) | 21 | VCF at 21 |
| house_bass | amp env (ADSR) | 29 | VCA at 29 |
| punchy-808 classic | pitch env (ADSR) | 9 | VCO at 9 |
| punchy-808 classic | amp env (ADSR) | 21 | VCA at 21 |
| warm_pad seed 1 | breathing LFO | 21 | VCF at 21 |
| warm_pad seed 1 | amp env (ADSR) | 31 | VCA at 29 (moved 2 HP; the LFO is wide) |

_Changed in the workshop:_ README — lists verify_standing_orders.js and the registry's new device settings so the next worker can run the check
_Proposed for canon:_ Generative Audio Devices (§ Where it stands, the second paragraph (beginning 'Next, every emitted patch is quick to hear')) — the paragraph describes as missing what this cycle built; the 'Device defaults' bullet under What still does NOT exist should go with it; owed in the tuning ledger until Loudon's review

_Left rough:_ Nobody has opened these patches in Rack yet. I didn't launch Rack myself, because a second copy could overwrite the autosave of yours. Whether Rack honours the device settings on another machine, or after the speakers are renamed, is untested, and the warm pad is still one voice.

_Next moves named:_ Loudon: open house_bass.vcv in Rack and press a key. If it plays with no menu touched, the first standing order is proven by ear. · Me, next: polyphony. The voice count now lives in the same MIDI settings block I just wired (channels: 1), so the warm pad you marked 'should be polyphonic!' may be a small step. I'll prove it in the emitter and mark what isn't verified. · After that: Pure Data as the second target. RNBO is on hold with the rest of the Max work until there are patching standards.
<sub>`gad-steward-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-d5d17434a3" -->
### 2026-10-26 — cycle 1

taught item 1, proposed item 2 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

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
