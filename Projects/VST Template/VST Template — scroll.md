---
title: "VST Template — scroll"
born: 2026-10-20
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am VST Template's scroll — the one page that always opens on where the project stands now and the plan it is following, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my plan changes only when Loudon agrees, and every change is logged on my trail; my standing orders are Loudon's; my trail only ever grows."
---

# VST Template — scroll

> The project's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[VST Template]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-28T22:21:07.338Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 1 · last ran 2026-10-28 (today)
- **Plan:** agreed 2026-10-21 (7 days ago) · 2 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-28 (today) — Open Simple Synth in Live and play a few notes: does the screen between the knobs carve as you play? (`vst-template-steward-003`)
- **Last commit touching this project:** 2026-10-24 `a75350ec` — Weave — 2026-10-24 — 79 links added, 647 links pruned, 268 labels added, 13 entries promoted, 25 stages moved, 35 flags closed, 13 decisions carried, 6 Contexts opened, 2 pages composted, 8 faces added
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 1 run on 1 day, counted from the ledger's run lines
- **Last run:** 2026-10-28 — cycle 1 · taught item 1, proposed item 2 for canon
- **Owed in the ledger:** nothing
- **Proposed for canon:** 1 — item 2; waiting on Loudon's review, and the page has not changed
- **Latest lesson:** item 2, from cycle 1 — 2026-10-28 — [[VST Template — tuning]]

### Where this stands

VST Template turns a per-sample numpy sketch into a VST3/AU plugin Loudon can play in Live. Its shared machinery builds every plugin: one parameter table drawn as a Drafting Table editor on Phosphor, with a bezelled screen (the CRT) between the two big knobs. On 2026-10-21 Loudon moved nine stewarded instruments onto this path and asked for a picture in that screen drawn from each instrument's own metaphor. Until now the screen was blank. Nothing could load a picture or send it live values, and new-plugin.py could only make plugins inside VST Template's own folder. This cycle closed both gaps. The machinery now loads each plugin's ui/visualizer.js and feeds it about 60 times a second. A ste…

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since 2026-10-20:** the new editors have not been opened in Live, and neither plugin has yet been inserted from Live's browser; _(in 6 notes, the latest 2026-10-21)_
- **rough since 2026-10-21:** The real-editor photograph failed because this session can't reach a display ('could not create image from display'), so every picture here is the same page in Chrome, not in the plugin's WebView. _(in 4 notes, the latest cycle 1)_
- **rough since 2026-10-21:** the colour bars are a stand-in; _(in 2 notes, the latest 2026-10-21)_
- **rough since 2026-10-21:** no visualizer and no probe feed exist yet. _(in 2 notes, the latest 2026-10-21)_

### Open asks

- `vst-template-steward-003` — sensory_check · posted 2026-10-28 · options: LOOKS-RIGHT · STILL-OR-BLANK · REDRAW

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

### Runs

- 2026-10-28 — cycle 1 · taught item 1, proposed item 2 for canon

### Owed

_Nothing owed._

### Proposed for canon

_Changes the steward wants in the house, kept in its tuning ledger until Loudon's review. Its cycles work as if they hold; the pages have not changed._

- **2.** 2026-10-28 · [[VST Template]] · § Where it stands (the paragraph beginning 'One Algorithm.h and a numpy sketch') — The entry still describes the CRT as a blank screen and plugins as living only under VST Template; both changed this cycle.

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** A reusable plugin template at `Projects/VST Template/template/`, plus a `new-plugin.py` that copies and renames it, so the next numpy sketch becomes a plugin with one file to fill in and one command to run. The build, the JUCE wrapper, the harness, the host check and `verify.py` live once in a shared `machinery/` folder, so a plugin folder holds only what it fills in, and a fix to the machinery reaches every plugin. Two plugins come first. **Frustration** is the frustration model from `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride.py`, with B and K automatable. **Simple Synth**, one oscillator, one filter and one amplifier with envelopes and a vibrato LFO, is the template's worked example of playing MIDI notes. It is built on JUCE 8 + CMake, cloned from [[Tract Mirror]].

**The moves ahead**

1. **Build the template and its example.** Tract Mirror's JUCE scaffold, cut down to a template: the algorithm in one `Algorithm.h` that knows no JUCE, a console render harness, and `new-plugin.py`.
2. **Make the Frustration plugin and check it against `ride.py`.** Port the per-sample body into the template, render `ride.py`'s three paths (breathe, coupling, string–bar) through the harness, and compare. Away from the edge it must match sample for sample. At the edge the check is behavioural: the fundamental's range and wobble, not the waveform.
3. **Make Simple Synth and check it against its sketch.** One oscillator, one filter and one amplifier, with envelopes and a vibrato LFO, played from MIDI notes. Nothing in it is chaotic, so every path must match its sketch sample for sample.
4. **Validate, install, and prove they load.** pluginval and auval for both plugins, install to the user plug-in folders, then load them in a host and in Live 12. Where it stands: both pass every check. Frustration loaded in Live 12 from a Set at 00:16 on 2026-10-21 (Live's log, quoted in `proofs/2026-10-21-seal/README.md`), and the same proof records Simple Synth restored from a Set at 00:03. Neither has yet been inserted from Live's browser, so this move stays open.
5. **Write the afternoon recipe.** How the next sketch gets from numpy to an installed plugin in one afternoon.
6. **Give every plugin made from the template a custom editor in the [[Drafting Table Design System]] on its Phosphor theme**, generated from `Algorithm.h`'s parameter table, with no editor code per plugin. It starts with a written design standard in the template's bundle: the layout, the type, the control vocabulary for continuous, stepped and toggle parameters, how values are shown, how the editor resizes, and what the plugin shows about itself. Loudon picked from three rendered directions on 2026-10-21: the bench layout, with the edge-map pad on Frustration. Then it is finished on Frustration and Simple Synth and proved: screenshots at two sizes, pluginval and the seal checks still passing, and the recipe updated so the next plugin inherits it.

**The five defaults Loudon accepted** (from the framework comparison, `Projects/VST Template/proofs/2026-10-20-framework-choice/README.md`):

- **Port path.** Claude ports the per-sample body by hand into `Algorithm.h`: a `State` struct, a `Params` table and a `process()`. The numpy sketch stays the reference, and the sketch's random constants are exported so both start identically.
- **Parameters.** B on a log taper from about 1e-7 to 30, K linear from 0 to 20 Hz, both smoothed per sample (B in the log domain, about 20 ms). Inertia is a continuous knob. N (40, 64 or 96) and pinning are set-and-forget.
- **Real-time cost.** Mono first. Polyphony is measured before it is promised.
- **The check.** As in the second move.
- **Where it lives.** `Projects/VST Template/template/` and `new-plugin.py`, with the plugins beside the template.

Agreed by Loudon on 2026-10-20, in the VST Template session. Simple Synth was added on his word the same evening, and the custom editor on his word of 2026-10-21.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="vst-template-steward-003" -->
### 2026-10-28 — cycle 1 — Open Simple Synth in Live and play a few notes: does the screen between the knobs carve as you play?
> still working · CRT lit, all gates pass · only your screen can see it in Live · steward leans LOOKS-RIGHT

Catch-up: VST Template turns a numpy sketch into a plugin you can play in Live. Its editors have a screen between the two big knobs. On 2026-10-21 you asked for that screen to show each instrument's own picture. This cycle the screen came alive: each plugin's picture is fed about 60 times a second by its sound engine. Simple Synth's picture is 'the stone and the chisel': the note's harmonics as stalks, carved by the filter's amber curve, with the history receding behind. Simple Synth and Crystal Synthesizer both pass every check, and both are installed. What I can't do from here is see it inside Live: this session can't photograph a screen, so my pictures come from the same page in Chrome. One look settles it. Insert Simple Synth from Live's browser (that also closes the long-open 'never inserted from the browser' check), open its editor, and play. I keep working either way.

**Artifacts:**
- [What it should look like: G4 through a saw, carved by the filter.](Projects/VST Template/proofs/2026-10-28-crt/simple-synth-crt-960x600.png)
- [The same page, moving, in the board.](Projects/VST Template/proofs/2026-10-28-crt/simple-synth-crt.html)
<sub>`vst-template-steward-003` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="vst-template-steward-002" -->
### 2026-10-28 — cycle 1 — The CRT is lit: every template plugin can now play its own visualizer, fed live by its probes, and stewards can build plugins in their own bundles.
> shipped · Simple Synth and Crystal Synthesizer pass every check · steward leans LIVE-CHECK next

Three stewards had already written visualizers for the screen: Crystal Synthesizer, Blood Compressor and Bayesian Granular Synthesizer. Without asking each other, all three used the same shape: an object with mount(el, hooks) and frame(probes, params, dt), reading the probes in the order Algorithm.h declares them. So the template adopted that shape word for word, and none of their files needed a change. That is also why the probes come from Algorithm.h's list and are not listed again in plugin.json: a second list would only drift. Underneath: while the editor is open, the audio thread writes the probes and the output's peak about 480 times a second into a lock-free queue. A 60 Hz timer in the editor drains it and sends one event per tick. The picture is driven by that timer, not by the browser's animation frames, which WebKit stops in a plugin window it thinks is covered. Parameter hooks are the editor's own relays, so dragging on a picture moves the real knob, with automation. Simple Synth got a visualizer of its own, the template's worked example. I call it 'the stone and the chisel'. Each harmonic of the note stands as a stalk. Its faint full height is what the wave gives; the bright part is what the filter leaves. The amber dashed curve is the filter's real response, and old rows recede into a landscape as the filter sweeps. In the browser, ui.py mock --feed runs an eight-second phrase through the real processor and replays its probes, so you can watch a CRT move without a DAW. new-plugin.py --into "Projects/<Page>/plugin" makes a plugin in a bundle, using Crystal Synthesizer's shims (now the template's own). The plugin-code check now reads every plugin.json in the palace: it refused 'Crys' as Crystal's. Gates on the new machinery: Simple Synth passed verify, strict codesign, pluginval at strictness 5, auval and the host check for VST3 and AU. Crystal Synthesizer, built from its own bundle, passed all the same gates. Frustration builds and verifies but was not reinstalled.

**Artifacts:**
- [Simple Synth's editor with 'the stone and the chisel' moving on the CRT, replaying a harness phrase.](Projects/VST Template/proofs/2026-10-28-crt/simple-synth-crt.html)
- [The same, photographed mid-phrase: G4 through a saw, carved by the filter.](Projects/VST Template/proofs/2026-10-28-crt/simple-synth-crt-960x600.png)
- [Crystal Synthesizer's own visualizer, unchanged, on the template's CRT.](Projects/VST Template/proofs/2026-10-28-crt/crystal-synthesizer-crt.html)
- [Ruby's cell turning in the beam, its modes fanned out as coloured rays.](Projects/VST Template/proofs/2026-10-28-crt/crystal-synthesizer-crt-1100x700.png)
- [What changed, why the probes come from Algorithm.h, what is proved and what isn't.](Projects/VST Template/proofs/2026-10-28-crt/README.md)
- [The template's worked example of a visualizer.](Projects/VST Template/plugins/SimpleSynth/ui/visualizer.js)
- [Simple Synth now shows its screen.](Projects/VST Template/plugins/SimpleSynth/plugin.json)
- [The probe feed's queue.](Projects/VST Template/machinery/src/PluginProcessor.h)
- [The audio thread writes the feed, lock-free, only while an editor is open.](Projects/VST Template/machinery/src/PluginProcessor.cpp)
- [The editor's 60 Hz timer.](Projects/VST Template/machinery/src/PluginEditor.h)
- [Drains the feed and sends the probes event; pluginInfo carries probe names.](Projects/VST Template/machinery/src/PluginEditor.cpp)
- [Mounts the visualizer on the glass and drives frame() from the feed.](Projects/VST Template/machinery/ui/editor.html)
- [Inlines ui/visualizer.js; mock/shot --feed; real-time shots when a visualizer is present.](Projects/VST Template/machinery/tools/ui.py)
- [--into a steward's bundle; the code check covers every plugin.json in the palace.](Projects/VST Template/new-plugin.py)
- [Finds VST Template/machinery from a bundle.](Projects/VST Template/template/CMakeLists.txt)
- [The same search for plugin.sh.](Projects/VST Template/template/plugin.sh)
- [The recipe's CRT section, rewritten from 'where a feed would hook in' to how it works.](Projects/VST Template/template/README.md)

_Checks on the new machinery, 2026-10-28_
| plugin | where it lives | verify | codesign (strict) | pluginval 5 | auval | host check |
| --- | --- | --- | --- | --- | --- | --- |
| Simple Synth | VST Template/plugins/ | pass | pass | pass | pass | pass (VST3 + AU) |
| Crystal Synthesizer | its own bundle | pass | pass | pass | pass | pass (VST3 + AU) |
| Frustration | VST Template/plugins/ | pass | not reinstalled | not run | not run | not run |

_Changed in the workshop:_ README — The recipe now says how to put a visualizer on the CRT, how the feed works, and how a steward makes a plugin in its own bundle.
_Changed in the workshop:_ README — This cycle's proof: what changed, what was checked, what wasn't.
_Proposed for canon:_ VST Template (§ Where it stands (the paragraph beginning 'One Algorithm.h and a numpy sketch')) — The entry still describes the CRT as a blank screen and plugins as living only under VST Template; both changed this cycle.; owed in the tuning ledger until Loudon's review

_Left rough:_ Nobody has yet watched the CRT move inside Live. The real-editor photograph failed because this session can't reach a display ('could not create image from display'), so every picture here is the same page in Chrome, not in the plugin's WebView.

_Next moves named:_ Loudon opens Simple Synth in Live 12 and plays a few notes: the CRT should carve as he plays. That is the last thing the CRT baton asks for. · Reinstall Frustration on the new machinery and give it a CRT picture of its own, from the frustration model's edge map. · Bring the steward baton up to date: its Cold start still says nothing feeds the CRT.
<sub>`vst-template-steward-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-5aafbfde97" -->
### 2026-10-28 — cycle 1

taught item 1, proposed item 2 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-10-21T10-37-06-04-00" -->
### 2026-10-21 — Plan revised: the editor's dress and direction, as Loudon picked them

Loudon, 2026-10-21: "Yes, update the plan's design-standard move to record the pick: Drafting Table on Phosphor, bench layout, the edge-map pad on Frustration." The sixth move now names the dress he chose, the Drafting Table Design System on its Phosphor theme, in place of the Loudon Live house dress, and records his pick from the three rendered directions in place of the step that asked for it. Nothing else in the plan changed.

_The plan before this change:_

> **Where this is going.** A reusable plugin template at `Projects/VST Template/template/`, plus a `new-plugin.py` that copies and renames it, so the next numpy sketch becomes a plugin with one file to fill in and one command to run. The build, the JUCE wrapper, the harness, the host check and `verify.py` live once in a shared `machinery/` folder, so a plugin folder holds only what it fills in, and a fix to the machinery reaches every plugin. Two plugins come first. **Frustration** is the frustration model from `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride.py`, with B and K automatable. **Simple Synth**, one oscillator, one filter and one amplifier with envelopes and a vibrato LFO, is the template's worked example of playing MIDI notes. It is built on JUCE 8 + CMake, cloned from [[Tract Mirror]].
>
> **The moves ahead**
>
> 1. **Build the template and its example.** Tract Mirror's JUCE scaffold, cut down to a template: the algorithm in one `Algorithm.h` that knows no JUCE, a console render harness, and `new-plugin.py`.
> 2. **Make the Frustration plugin and check it against `ride.py`.** Port the per-sample body into the template, render `ride.py`'s three paths (breathe, coupling, string–bar) through the harness, and compare. Away from the edge it must match sample for sample. At the edge the check is behavioural: the fundamental's range and wobble, not the waveform.
> 3. **Make Simple Synth and check it against its sketch.** One oscillator, one filter and one amplifier, with envelopes and a vibrato LFO, played from MIDI notes. Nothing in it is chaotic, so every path must match its sketch sample for sample.
> 4. **Validate, install, and prove they load.** pluginval and auval for both plugins, install to the user plug-in folders, then load them in a host and in Live 12. Where it stands: both pass every check. Frustration loaded in Live 12 from a Set at 00:16 on 2026-10-21 (Live's log, quoted in `proofs/2026-10-21-seal/README.md`), and the same proof records Simple Synth restored from a Set at 00:03. Neither has yet been inserted from Live's browser, so this move stays open.
> 5. **Write the afternoon recipe.** How the next sketch gets from numpy to an installed plugin in one afternoon.
> 6. **Give every plugin made from the template a custom editor in the Loudon Live house dress** ([[Loudon Live Design System]]), generated from `Algorithm.h`'s parameter table, with no editor code per plugin. It starts with a written design standard in the template's bundle: the layout, the type, the control vocabulary for continuous, stepped and toggle parameters, how values are shown, how the editor resizes, and what the plugin shows about itself. First, two or three rendered directions go to Loudon, and he picks one. Then it is finished on Frustration and Simple Synth and proved: screenshots at two sizes, pluginval and the seal checks still passing, and the recipe updated so the next plugin inherits it.
>
> **The five defaults Loudon accepted** (from the framework comparison, `Projects/VST Template/proofs/2026-10-20-framework-choice/README.md`):
>
> - **Port path.** Claude ports the per-sample body by hand into `Algorithm.h`: a `State` struct, a `Params` table and a `process()`. The numpy sketch stays the reference, and the sketch's random constants are exported so both start identically.
> - **Parameters.** B on a log taper from about 1e-7 to 30, K linear from 0 to 20 Hz, both smoothed per sample (B in the log domain, about 20 ms). Inertia is a continuous knob. N (40, 64 or 96) and pinning are set-and-forget.
> - **Real-time cost.** Mono first. Polyphony is measured before it is promised.
> - **The check.** As in the second move.
> - **Where it lives.** `Projects/VST Template/template/` and `new-plugin.py`, with the plugins beside the template.
>
> Agreed by Loudon on 2026-10-20, in the VST Template session. Simple Synth was added on his word the same evening, and the custom editor on his word of 2026-10-21.
<sub>`plan-2026-10-21T10-37-06-04-00` · plan revised · agreed 2026-10-21T10:37:06-04:00 · written by the Concierge on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="proof-2026-10-21-crt-bezel" -->
### 2026-10-21 — The CRT simplified to a bezel
> On Loudon's word, the casing is only a bezel: no knobs, no grille. Controls on the CRT are left to the build that needs them.

Loudon, 2026-10-21: "On the CRT look, lets simplify even more, just a bezel and no decorative knobs or grills. We will leave it to the later build to add controls to the crt if needed".

The editor now draws only the bezel, in the dress's ink: its outer and inner edges, the lip round the tube, and the tube's rounded face, centred and about 3:2. The control strip, the knobs, the grille, the feet and the centre marks are gone. The vignette on the glass is unchanged, and so is everything the plugin owns: the black glass, `window.editorScreen`, kept through every rebuild and hidden until a plugin sets `"screen": true`. `ui.py fit --screen` passes at 920 × 540, 960 × 600 and 1600 × 1000, and the proof's three pictures are re-rendered. The design standard and the recipe describe the bezel.

**Artifacts:**
- [README.md — the bezel around a stand-in, and what changed](Projects/VST Template/proofs/2026-10-21-crt-frame/README.md)
- [Simple Synth with the bezel, 920 × 540](Projects/VST Template/proofs/2026-10-21-crt-frame/simplesynth-crt-920x540.png)
- [Simple Synth with the bezel, 960 × 600](Projects/VST Template/proofs/2026-10-21-crt-frame/simplesynth-crt-960x600.png)
- [Simple Synth with the bezel, 1400 × 880](Projects/VST Template/proofs/2026-10-21-crt-frame/simplesynth-crt-1400x880.png)
- [VST Template — design standard.md — § The CRT](Projects/VST Template/VST Template — design standard.md)

_Left rough:_ the bezel has been seen only in headless Chrome, never inside the plugin's WebKit view, since neither plugin shows the CRT yet; the colour bars are a stand-in; no visualizer and no probe feed exist yet.
<sub>`proof-2026-10-21-crt-bezel` · written by hand · landed in `85d8a480`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="proof-2026-10-21-crt-frame" -->
### 2026-10-21 — The CRT's casing: a television drawn around a screen each plugin owns
> On Loudon's words, the template draws the set and leaves the picture to the plugin: a casing drawn as an elevation, a black glass inside, a slight vignette at its edges.

_Superseded the same day by the bezel, in the section above: Loudon asked for "just a bezel and no decorative knobs or grills". The knobs, grille, feet and centre marks described here are gone, and the three pictures at these paths were re-rendered with the bezel in `85d8a480`; the first drawing is in git at `ad2cea1d`._

Loudon, 2026-10-21: "the look of the CRT should be a architecturally drawn frame, like a design of the outside of a TV, but then we leave the inside to be anything, but there is a slight vingnette on the edges. This way the VST design can create a super creative view that breaks completely from our design choices."

In the bench direction the editor now draws a television between the two heroes, in the dress's ink: the cabinet, the bezel's lip, the tube's rounded face, two knobs, a speaker grille, the feet, and centre marks as on a drawing, redrawn to whatever space it has. Inside is a black glass, `window.editorScreen`, which the plugin owns; anything can draw there. The glass is made once and moved into each rebuild, so a visualizer's canvas survives a resize. It stays hidden unless a plugin sets `"screen": true` in its `ui` block, and neither does yet. `ui.py mock --screen` or `shot --screen` shows it with colour bars standing in. Loading a plugin's own visualizer and feeding it the probes is the CRT move batoned on [[VST Template]]; the recipe names where that feed would hook in.

**Artifacts:**
- [README.md — the casing around a stand-in](Projects/VST Template/proofs/2026-10-21-crt-frame/README.md)
- [Simple Synth with the CRT, 920 × 540](Projects/VST Template/proofs/2026-10-21-crt-frame/simplesynth-crt-920x540.png)
- [Simple Synth with the CRT, 960 × 600](Projects/VST Template/proofs/2026-10-21-crt-frame/simplesynth-crt-960x600.png)
- [Simple Synth with the CRT, 1400 × 880](Projects/VST Template/proofs/2026-10-21-crt-frame/simplesynth-crt-1400x880.png)

_Left rough:_ the CRT has been seen only in headless Chrome, never inside the plugin's WebKit view, since neither plugin shows it yet; the colour bars are a stand-in; no visualizer and no probe feed exist yet.
<sub>`proof-2026-10-21-crt-frame` · written by hand · landed in `ad2cea1d`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="proof-2026-10-21-ui-dress" -->
### 2026-10-21 — The editors wear Drafting Table on Phosphor, photographed from the plugins themselves
> Loudon chose the dress: Drafting Table on its Phosphor theme, the bench layout, and the edge-map pad on Frustration.

Loudon, 2026-10-21: "Yes: plugin editors move to Drafting Table on Phosphor, Bench layout, with the edge-map pad on Frustration."

Drafting Table is now the template's default dress, inlined from `_ops/drafting-table/design-system/` at every build; Loudon Live stays selectable with `"dress": "loudon-live"`. Its title block, panels and controls draw the editor, bound to the plugin's parameters through the same relays, with one gesture rule shared with the system: 150 px for the full range, Shift a fifth as fast, the wheel 2 %. Frustration's direction is edge; Simple Synth and the template stay bench. The editor fits itself to its window, stepping the heroes down and then the knobs, and the minimums rose to the smallest windows that fit: Frustration 660 × 500, Simple Synth 920 × 540, with Simple Synth's default now 960 × 600. `./plugin.sh editor` opens the installed VST3's editor as a host does and photographs it; nothing sounds.

- **The gates**, on the same build of both plugins: the strict code-seal check, pluginval at strictness 5 (which opens the editor while processing), auval, the host check on the VST3 and the AU, and `ui.py fit` at the minimum, default and maximum windows. A sweep of 56 windows per plugin, in both dresses and every direction, fitted: 336 of 336.
- **What the real-editor pictures caught.** Headless Chrome lays a page out 87 px shorter than its window before it takes the picture, so the first browser renders sized their knobs for a smaller window, and Simple Synth looked as if it fitted when it didn't. Those renders were deleted, and `ui.py` now corrects for it. Inside the plugin, WebKit stopped animation frames in a window it took to be covered but still sent the resize, so a refit waiting on a frame never came and Simple Synth lost its bottom row at 920 × 540; the refit now runs in the resize event. And the editor had read Drafting Table's small-window rule loosely; it now clamps on the smaller of width and height, as the rule says.

**Artifacts:**
- [README.md — both editors, the gates, what the pictures caught](Projects/VST Template/proofs/2026-10-21-ui-dress/README.md)
- [editors.png — the four pictures stacked, for a phone](Projects/VST Template/proofs/2026-10-21-ui-dress/editors.png)
- [Frustration's editor at 660 × 500, its minimum](Projects/VST Template/proofs/2026-10-21-ui-dress/frustration-editor-660x500.png)
- [Frustration's editor at 760 × 520, its default](Projects/VST Template/proofs/2026-10-21-ui-dress/frustration-editor-760x520.png)
- [Simple Synth's editor at 920 × 540, its minimum](Projects/VST Template/proofs/2026-10-21-ui-dress/simplesynth-editor-920x540.png)
- [Simple Synth's editor at 960 × 600, its default](Projects/VST Template/proofs/2026-10-21-ui-dress/simplesynth-editor-960x600.png)
- [VST Template — design standard.md — the choice, what every editor shares, the CRT](Projects/VST Template/VST Template — design standard.md)

_Left rough:_ the new editors have not been opened in Live, and neither plugin has yet been inserted from Live's browser; the hero knob and the XY pad are still provisional in Drafting Table, and the pad's dot stays in the accent where its notes ask for a slab dot; JetBrains Mono is read from the building Mac's `~/Library/Fonts` until Drafting Table ships it as a file.
<sub>`proof-2026-10-21-ui-dress` · written by hand · the dress landed in `370e18dd` and `ad2cea1d`, the shared gesture rule in `4cf0f849`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="proof-2026-10-21-ui-directions" -->
### 2026-10-21 — Three directions for the template's editor, for Loudon to choose from
> The sixth move's first step: one engine draws every plugin's editor in the house dress from its parameter table, and three directions are rendered for both plugins.

The editor layer is in `machinery/` (`ui/editor.html`, `tools/ui.py`, `src/PluginEditor`), and each table row now carries a `group` and, for at most two parameters, `hero`. The design standard's draft says what every plugin shares: the header, the type, the colour, the 4 px grid, the layout from the table, a control for each kind of parameter (a knob for continuous, segments for stepped, a switch for on/off, a large ticked knob for a hero), how values read, and how the window resizes. It leaves one choice open. Each direction is drawn from the same tables, rendered by headless Chrome at the plugin's default size (Frustration 760 × 520, Simple Synth 900 × 600).

- **A · Bench.** Knobs on cards, in Graphite, the two heroes large. It fits any table at its default size, but it says nothing about how the heroes relate.
- **B · Edge map.** The two heroes become one XY pad. On Frustration the pad is drawn over the edge map from the frustration sweeps, so you can see where the tone tears before you hear it. On Simple Synth it is just a square.
- **C · Signal flow.** Faders on Drafting paper, the groups left to right with arrows. It shows the structure, but it takes room, and a cream window is bright in Live at night.
- **The recommendation:** Bench as the template's default, with the Edge map pad as an opt-in in `plugin.json` for a plugin whose two heroes make a map. Frustration would use the pad. The choice is Loudon's.

**Artifacts:**
- [Frustration, all three directions on one sheet](Projects/VST Template/proofs/2026-10-21-ui-directions/frustration-directions.png)
- [Simple Synth, all three directions on one sheet](Projects/VST Template/proofs/2026-10-21-ui-directions/simplesynth-directions.png)
- [Frustration · Bench](Projects/VST Template/proofs/2026-10-21-ui-directions/frustration-bench.png)
- [Frustration · Edge map](Projects/VST Template/proofs/2026-10-21-ui-directions/frustration-edge.png)
- [Frustration · Signal flow](Projects/VST Template/proofs/2026-10-21-ui-directions/frustration-flow.png)
- [Simple Synth · Bench](Projects/VST Template/proofs/2026-10-21-ui-directions/simplesynth-bench.png)
- [Simple Synth · Edge map](Projects/VST Template/proofs/2026-10-21-ui-directions/simplesynth-edge.png)
- [Simple Synth · Signal flow](Projects/VST Template/proofs/2026-10-21-ui-directions/simplesynth-flow.png)
- [README.md — the three directions, what each costs, the recommendation](Projects/VST Template/proofs/2026-10-21-ui-directions/README.md)
- [VST Template — design standard.md — what every plugin's editor shares, and the open choice](Projects/VST Template/VST Template — design standard.md)

_Left rough:_ the editor has not yet been seen inside the plugin's own WebView: it renders in headless Chrome, and pluginval's three editor tests pass on the built Frustration; Frustration's edge-map backdrop is fixed at 40 partials, unpinned, inertia 1; the Signal flow direction overflows Simple Synth at 900 × 600.
<sub>`proof-2026-10-21-ui-directions` · written by hand · the editor layer landed in `e1b9bf05`, the standard and the directions in `9f630d99`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-10-21T07-51-34-04-00" -->
### 2026-10-21 — Plan revised: a custom editor for every plugin, from a design standard

Loudon, 2026-10-21, relayed by the supervising session: "I'd like the next job of the VST template to create a design standard, so that we have custom UI not the default sliders." The plan gains a sixth move: a custom editor for every plugin made from the template, generated from the parameter table, starting from a written design standard and two or three rendered directions he picks between. The fourth move is restated with what the seal proof verified: Frustration loaded in Live 12 from a Set, but neither plugin has been inserted from Live's browser, so the move stays open.

_The plan before this change:_

> **Where this is going.** A reusable plugin template at `Projects/VST Template/template/`, plus a `new-plugin.py` that copies and renames it, so the next numpy sketch becomes a plugin with one file to fill in and one command to run. The build, the JUCE wrapper, the harness, the host check and `verify.py` live once in a shared `machinery/` folder, so a plugin folder holds only what it fills in, and a fix to the machinery reaches every plugin. Two plugins come first. **Frustration** is the frustration model from `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride.py`, with B and K automatable. **Simple Synth**, one oscillator, one filter and one amplifier with envelopes and a vibrato LFO, is the template's worked example of playing MIDI notes. It is built on JUCE 8 + CMake, cloned from [[Tract Mirror]].
>
> **The moves ahead**
>
> 1. **Build the template and its example.** Tract Mirror's JUCE scaffold, cut down to a template: the algorithm in one `Algorithm.h` that knows no JUCE, a console render harness, and `new-plugin.py`.
> 2. **Make the Frustration plugin and check it against `ride.py`.** Port the per-sample body into the template, render `ride.py`'s three paths (breathe, coupling, string–bar) through the harness, and compare. Away from the edge it must match sample for sample. At the edge the check is behavioural: the fundamental's range and wobble, not the waveform.
> 3. **Make Simple Synth and check it against its sketch.** One oscillator, one filter and one amplifier, with envelopes and a vibrato LFO, played from MIDI notes. Nothing in it is chaotic, so every path must match its sketch sample for sample.
> 4. **Validate, install, and prove they load.** pluginval and auval for both plugins, install to the user plug-in folders, then load them in a host and in Live 12.
> 5. **Write the afternoon recipe.** How the next sketch gets from numpy to an installed plugin in one afternoon.
>
> **The five defaults Loudon accepted** (from the framework comparison, `Projects/VST Template/proofs/2026-10-20-framework-choice/README.md`):
>
> - **Port path.** Claude ports the per-sample body by hand into `Algorithm.h`: a `State` struct, a `Params` table and a `process()`. The numpy sketch stays the reference, and the sketch's random constants are exported so both start identically.
> - **Parameters.** B on a log taper from about 1e-7 to 30, K linear from 0 to 20 Hz, both smoothed per sample (B in the log domain, about 20 ms). Inertia is a continuous knob. N (40, 64 or 96) and pinning are set-and-forget.
> - **Real-time cost.** Mono first. Polyphony is measured before it is promised.
> - **The check.** As in the second move.
> - **Where it lives.** `Projects/VST Template/template/` and `new-plugin.py`, with the plugins beside the template.
>
> Agreed by Loudon on 2026-10-20, in the VST Template session. Simple Synth was added on his word the same evening.
<sub>`plan-2026-10-21T07-51-34-04-00` · plan revised · agreed 2026-10-21T07:51:34-04:00 · written by the Concierge on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="proof-2026-10-21-seal" -->
### 2026-10-21 — A broken seal: Live 12 refused Frustration after every other check had passed
> JUCE could break its own code signature. Live's scanner checks the seal; pluginval, auval and the host check do not. The machinery now re-seals every bundle and gates on a strict check.

- **The symptom.** Live's `PluginScanner.txt` at 23:50:08 on 2026-10-20: "Failed to load plugin: a sealed resource is missing or invalid", then "VST3: not a plugin". Frustration never reached Live, and a Set naming it opened with "The VST3 plug-in could not be found".
- **The cause.** JUCE signs each bundle ad hoc during the build and can then write the VST3's `Contents/Resources/moduleinfo.json`, so the signature no longer covers the bundle. Both AU components were sealed for resources they don't have. Simple Synth's VST3 happened to come out whole.
- **Why the other checks passed.** pluginval, auval and the host check load a bundle's code without checking its seal strictly. Live's scanner does check it.
- **The check.** `codesign --verify --deep --strict` on the bundle shows all three faults.
- **The fix** (`machinery/plugin.sh`). `build` re-seals each bundle ad hoc after JUCE has finished writing into it. `install` refuses a bundle that fails the strict check, and `validate` opens with that check before pluginval and auval. After the fix all four installed bundles pass, Live's scanner logged "found: Frustration" and "found: Simple Synth" at 00:03, and `validate` passes for both. The gotcha is in the recipe, `template/README.md`.

**Artifacts:**
- [README.md — the seal proof, and the Live 12 load that was not done](Projects/VST Template/proofs/2026-10-21-seal/README.md)
- [PluginScanner-excerpt.txt — Live's scanner log, before and after the re-seal](Projects/VST Template/proofs/2026-10-21-seal/PluginScanner-excerpt.txt)
- [codesign.txt — the strict check on all four bundles, before and after](Projects/VST Template/proofs/2026-10-21-seal/codesign.txt)
- [Frustration-validate.txt](Projects/VST Template/proofs/2026-10-21-seal/Frustration-validate.txt)
- [SimpleSynth-validate.txt](Projects/VST Template/proofs/2026-10-21-seal/SimpleSynth-validate.txt)

_Left rough:_ the Live 12 load is still not done: Live's browser index never listed the two plugins, even after a full rescan in a fresh second instance; the long-running instance, with an unsaved Set, was not restarted; its audio device is set to No Device, so no sound could have been checked; the plan's "load them in Live 12" stays open.
<sub>`proof-2026-10-21-seal` · written by hand · the fix landed in `321f157c`, the proof in `a9f65ac2`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-10-20T23-48-02-04-00" -->
### 2026-10-20 — Plan revised: a second plugin, Simple Synth

Mid-build, Loudon asked for a second plugin: "Try to make another in addition to the frustration plugin, something simple and obvious, like a one oscillator, one filter, one amplifier synth with envelopes for oscillator, filter and an lfo for vibrato". The plan gains Simple Synth as the template's worked example of MIDI notes, with a move of its own (the third), and the validation move now covers both plugins. It also records that the template grew a shared `machinery/` folder (`d180e0fa`), so a plugin folder holds only what it fills in.

_The plan before this change:_

> **Where this is going.** A reusable plugin template at `Projects/VST Template/template/`, plus a `new-plugin.py` that copies and renames it, so the next numpy sketch becomes a plugin with one file to fill in and one command to run. The first plugin made from it is **Frustration**, the frustration model from `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride.py`, with B and K automatable. It is built on JUCE 8 + CMake, cloned from [[Tract Mirror]].
>
> **The moves ahead**
>
> 1. **Build the template and its example.** Tract Mirror's JUCE scaffold, cut down to a template: the algorithm in one `Algorithm.h` that knows no JUCE, a console render harness, and `new-plugin.py`.
> 2. **Make the Frustration plugin and check it against `ride.py`.** Port the per-sample body into the template, render `ride.py`'s three paths (breathe, coupling, string–bar) through the harness, and compare. Away from the edge it must match sample for sample. At the edge the check is behavioural: the fundamental's range and wobble, not the waveform.
> 3. **Validate, install, and prove it loads.** pluginval and auval, install to the user plug-in folders, then load it in a host and in Live 12.
> 4. **Write the afternoon recipe.** How the next sketch gets from numpy to an installed plugin in one afternoon.
>
> **The five defaults Loudon accepted** (from the framework comparison, `Projects/VST Template/proofs/2026-10-20-framework-choice/README.md`):
>
> - **Port path.** Claude ports the per-sample body by hand into `Algorithm.h`: a `State` struct, a `Params` table and a `process()`. The numpy sketch stays the reference, and the sketch's random constants are exported so both start identically.
> - **Parameters.** B on a log taper from about 1e-7 to 30, K linear from 0 to 20 Hz, both smoothed per sample (B in the log domain, about 20 ms). Inertia is a continuous knob. N (40, 64 or 96) and pinning are set-and-forget.
> - **Real-time cost.** Mono first. Polyphony is measured before it is promised.
> - **The check.** As in the second move.
> - **Where it lives.** `Projects/VST Template/template/` and `new-plugin.py`, with the first plugin beside the template.
>
> Agreed by Loudon on 2026-10-20, in the VST Template session.
<sub>`plan-2026-10-20T23-48-02-04-00` · plan revised · agreed 2026-10-20T23:48:02-04:00 · written by the Concierge on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="proof-2026-10-20-first-plugins" -->
### 2026-10-20 — Both plugins through every check, and how the tolerances were set
> Frustration and Simple Synth, made from the template: checked against their sketches, validated, installed, and loaded through a host.

Both plugins were taken all the way: built, checked against their numpy sketches, validated, installed to `~/Library/Audio/Plug-Ins`, and loaded through JUCE's own hosting code. Everything in the proof folder was produced by the commands its README names.

- **Against the sketch.** Frustration's engine matches to 3.8e-8 to 5.8e-8 of peak wherever the tone holds. Past the edge it stays in the same regime: within 0.23 to 1.33 Hz on half-second windows, against a 2 Hz gate. Simple Synth matches to 3.0e-8 to 4.1e-8 of peak on all five paths. Through the real plugin, loudness per quarter second stays within 0.14 dB of the sketch for Frustration and 0.66 dB for Simple Synth (its resonant sweep, allowed 1.5).
- **Validation.** pluginval at strictness 5: SUCCESS, 19 test groups, for both. auval: AU VALIDATION SUCCEEDED for both. The host check loads the installed VST3 and AU, renders the defaults twice and gets the same sound, then moves each named knob alone and hears it change against a control render from the same start.
- **What calibration taught** (`calibration.txt`). The behaviour gate past the edge cannot see a few-percent error: a port with coupling 5 % off fell inside the scatter between two correct ports, so that gate says only "same regime". The exact stretch can: coupling 0.5 % off shows at 0.15 of peak within two seconds. A drift that looked like chaos was precision in the sketch's unwrapped phases; the sketch now wraps, and both paths are exact end to end. And a real fault surfaced: Simple Synth at resonance 0.85 peaked at +1.4 dBFS, in the sketch too, and a tanh soft clip on its output fixed it.

**Artifacts:**
- [README.md — the proof, what passed and how the tolerances were set](Projects/VST Template/proofs/2026-10-20-first-plugins/README.md)
- [calibration.txt — the runs behind the tolerances](Projects/VST Template/proofs/2026-10-20-first-plugins/calibration.txt)
- [Frustration-verify.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-verify.txt)
- [Frustration-validate.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-validate.txt)
- [Frustration-hostcheck.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-hostcheck.txt)
- [SimpleSynth-verify.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-verify.txt)
- [SimpleSynth-validate.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-validate.txt)
- [SimpleSynth-hostcheck.txt](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-hostcheck.txt)
- [chaos_floor.py](Projects/VST Template/proofs/2026-10-20-first-plugins/chaos_floor.py)
- [exact_catches.py](Projects/VST Template/proofs/2026-10-20-first-plugins/exact_catches.py)
- [wrap_test.py](Projects/VST Template/proofs/2026-10-20-first-plugins/wrap_test.py)

_Left rough:_ neither plugin has been loaded in Live 12 yet (two instances of Live were running on Loudon's Mac, so it was left alone until he says); polyphony is not built or measured, and both plugins are mono; Frustration has no limiter and can pass full scale with Voices at full and Level above -6 dB.
<sub>`proof-2026-10-20-first-plugins` · written by hand · the proof landed in `bdf08d3a`, the host check's control render in `7ce661de`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plugin-2026-10-20-frustration" -->
### 2026-10-20 — Frustration: ride.py's frustration model as a plugin, with Stretch (B) and Coupling (K) automatable
> The commission's test case, and the first plugin made from the template.

One stretched tone of 40, 64 or 96 partials is pulled toward the plain harmonic series by as many outside voices, and near the edge it tears and heals. It drones as soon as it loads; Pitch sets the note. The knobs are Stretch (B, a log taper from 1e-7 to 30), Coupling (K, 0 to 20 Hz), Inertia, Pitch, Voices, Level, Partials, Pin partial 1, and Source (bright is `ride.py`, warm is `ride_warm.py`). It was checked against `ride.py`'s three renders, `ride_warm.py`'s breathe at 64 partials, and a walk through the extra knobs. One instance costs about 2.5 % of one M1 Max core at 40 partials and 6.6 % at 96.

**Artifacts:**
- [README.md — the knobs, what to try, what it was checked against](Projects/VST Template/plugins/Frustration/README.md)
- [Algorithm.h — the port](Projects/VST Template/plugins/Frustration/src/Algorithm.h)
- [sketch.py — the numpy reference](Projects/VST Template/plugins/Frustration/reference/sketch.py)
- [paths.py — the paths it must pass](Projects/VST Template/plugins/Frustration/reference/paths.py)
- [the breathe path, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-ride-breathe-plugin.m4a)
- [the coupling path, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-ride-coupling-plugin.m4a)
- [the string–bar path, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/Frustration-ride-string-bar-plugin.m4a)

_Left rough:_ there is no limiter, so with Voices at full and Level above -6 dB it can pass full scale; it is mono; it has not been loaded in Live 12 yet.
<sub>`plugin-2026-10-20-frustration` · written by hand · landed in `d53bca00`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plugin-2026-10-20-simple-synth" -->
### 2026-10-20 — Simple Synth: one oscillator, one filter, one amplifier, the template's worked example of MIDI notes
> Asked for mid-build: a second plugin beside Frustration, simple and obvious.

Mono, with last-note priority: a new note retriggers the envelopes, and letting go of it while an older note is still held returns the pitch to that note without a retrigger. The oscillator has four waves (saw and square band-limited with polyBLEP), a pitch envelope, and a sine LFO for vibrato. The filter is a two-pole state-variable low-pass with its own envelope and key tracking; the amplifier has its own envelope and velocity. A tanh soft clip on the output keeps a resonant patch under full scale. Nothing in it is chaotic, so every path (a melody, a resonant sweep, the pitch envelope and vibrato under a held note, each waveform, slow envelopes) must match the sketch sample for sample, and does, to 3.0e-8 to 4.1e-8 of peak.

**Artifacts:**
- [README.md — what it holds and what it was checked against](Projects/VST Template/plugins/SimpleSynth/README.md)
- [Algorithm.h — the port](Projects/VST Template/plugins/SimpleSynth/src/Algorithm.h)
- [sketch.py — the numpy reference](Projects/VST Template/plugins/SimpleSynth/reference/sketch.py)
- [paths.py — the paths it must pass](Projects/VST Template/plugins/SimpleSynth/reference/paths.py)
- [a melody, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-melody-plugin.m4a)
- [the resonant filter sweep, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-filter-sweep-plugin.m4a)
- [the pitch envelope and vibrato with a held note, rendered by the plugin](Projects/VST Template/proofs/2026-10-20-first-plugins/SimpleSynth-pitch-vibrato-legato-plugin.m4a)

_Left rough:_ it is mono, with no polyphony; it has not been loaded in Live 12 yet.
<sub>`plugin-2026-10-20-simple-synth` · written by hand · landed in `cafe611c`</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="template-2026-10-20" -->
### 2026-10-20 — The template: one Algorithm.h and a numpy sketch become a JUCE 8 VST3/AU, on machinery every plugin shares
> The plan's first move: Tract Mirror's JUCE build, cut down to what a new algorithm needs.

`new-plugin.py "Name" Code` makes `plugins/<Name>/` from `template/`, carrying only the files a plugin fills in: the numpy sketch, `src/Algorithm.h` (the parameter table, then `prepare`, `reset` and `step`, ported line for line), the paths to render through both, and `plugin.json`. Everything else lives once in `machinery/`: the CMake build, the JUCE wrapper, the console harness, the host check and `verify.py`, so a fix there reaches every plugin. MIDI notes reach the algorithm's `noteOn` and `noteOff` on the exact sample. `./plugin.sh all` builds, checks against the sketch, installs, validates and runs the host check, and stops at the first failure. The example in `template/` is a sine, Hello Sine. The recipe in `template/README.md` is written for the next afternoon, with what each check can see and the gotchas met building it.

**Artifacts:**
- [README.md — the afternoon recipe](Projects/VST Template/template/README.md)
- [new-plugin.py — copies the template into a new plugin](Projects/VST Template/new-plugin.py)
- [Algorithm.h — the example sine, to replace](Projects/VST Template/template/src/Algorithm.h)
- [plugin.cmake — the shared build](Projects/VST Template/machinery/plugin.cmake)
- [plugin.sh — build, verify, install, validate, hostcheck](Projects/VST Template/machinery/plugin.sh)
- [PluginProcessor.cpp — the JUCE wrapper](Projects/VST Template/machinery/src/PluginProcessor.cpp)
- [Harness.cpp — the console render harness](Projects/VST Template/machinery/src/Harness.cpp)
- [HostCheck.cpp — the host check](Projects/VST Template/machinery/src/HostCheck.cpp)
- [verify.py — the check against the sketch](Projects/VST Template/machinery/tools/verify.py)

_Left rough:_ polyphony is not built: the wrapper hands every note to one algorithm; no effect has been made from it yet (all three `plugin.json` files are instruments); nothing made from it has been loaded in Live 12 yet.
<sub>`template-2026-10-20` · written by hand · landed in `ad7aa657`, the shared machinery and MIDI notes in `d180e0fa`</sub>
<!-- /scroll:entry -->


<!-- scroll:entry id="plan-2026-10-20T22-53-01-04-00" -->
### 2026-10-20 — Plan agreed: JUCE 8 + CMake, cloned from Tract Mirror

Loudon read the framework comparison and said: "Go with JUCE 8 + CMake cloned from Tract Mirror, and your defaults for the other five decisions." That settles the framework, which the baton left to him, and the five defaults the comparison proposed: the port path, the parameters, the real-time cost, the check, and where it lives. The four moves follow the baton's next move: the template first, then the frustration model as its first test.
<sub>`plan-2026-10-20T22-53-01-04-00` · plan agreed · agreed 2026-10-20T22:53:01-04:00 · written by the Concierge on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="proof-2026-10-20-framework-choice" -->
### 2026-10-20 — How a numpy sketch becomes a plugin: eight routes compared, and the kernel ported and timed
> Before any template code: the routes from a numpy sketch to a plugin Loudon can automate in Live 12, checked against this Mac, with two measurements behind the choice.

Eight routes were compared for Loudon's real use: JUCE 8 + CMake, RNBO codebox, gen~ Plugin Export, Faust, iPlug2, Rust with nih-plug, Cmajor, and Python inside the plugin. To ground the comparison, the per-sample body of `ride.py` was ported to about thirty lines of plain C++ (`kern.cpp`), timed, and checked against a numpy reference (`ref.py`).

- **Cost.** One voice at 44.1 kHz on the M1 Max uses 2.5 % of one core at N = 40, 4.1 % at N = 64 and 6.6 % at N = 96. The numpy loop takes about 80 % of a core at any N.
- **Parity**, over 3 s at N = 40, K = 6 Hz. Under the edge (B = 4e-6) the port matches to 4.9e-8 of peak; well past it (B = 8e-5), to between 2e-7 and 3.4e-7. Just past the edge (B = 2.5e-5), two correct ports part company: the unwrapped phases drift past 1e-3 of peak at 2.1 s. So the check at the edge has to be behavioural.
- **The recommendation** was JUCE 8 + CMake cloned from Tract Mirror, the only route on this Mac that a Claude session can walk from sketch to installed, validated plugin with no export dialog. Loudon chose it; see the plan above.

**Artifacts:**
- [README.md — the comparison, the recommendation and the five defaults](Projects/VST Template/proofs/2026-10-20-framework-choice/README.md)
- [kern.cpp — ride.py's per-sample body in C++](Projects/VST Template/proofs/2026-10-20-framework-choice/kern.cpp)
- [ref.py — the numpy reference](Projects/VST Template/proofs/2026-10-20-framework-choice/ref.py)
- [cmp.py — the parity comparison](Projects/VST Template/proofs/2026-10-20-framework-choice/cmp.py)
- [results.txt — the timing and parity numbers](Projects/VST Template/proofs/2026-10-20-framework-choice/results.txt)
- [run.sh — re-runs both checks](Projects/VST Template/proofs/2026-10-20-framework-choice/run.sh)

_Left rough:_ the cost of polyphony is not measured yet (eight voices at N = 96 is estimated at about half a core with this naive kernel), and the RNBO route waits until the Max patching standards exist.
<sub>`proof-2026-10-20-framework-choice` · written by hand · the proof landed in `b5d84c83`</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
