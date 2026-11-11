---
title: "Mycelial Reverb — scroll"
born: 2026-11-10
links:
  - target: "[[Mycelial Reverb]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Mycelial Reverb's scroll — the one page that always opens on where the project stands now and the plan it is following, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my plan changes only when Loudon agrees, and every change is logged on my trail; my standing orders are Loudon's; my trail only ever grows."
---

# Mycelial Reverb — scroll

> The project's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only on Loudon's yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Mycelial Reverb]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

_Not yet regenerated. The project was born 2026-11-10 and has not been looked at by the board._
<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**PROPOSED — awaiting Loudon's yes.** Drafted by the Concierge on 2026-11-10. Loudon's yes that day, as relayed to this session, covered the shape: a project of its own that holds the piece, the engine and the plugin, with a separate teaching page, [[Reverb Design]], pointing at it. It did not cover the words below.

Where this is going: a reverb raised from one spore, playable in a browser and in a DAW, that shows what a room is made of to anyone who feeds it sound.

1. **Hear the plugin in a DAW.** It is built, validated and installed; Loudon opens it in Live and plays. Nothing about its sound is known until then.
2. **Judge the guard.** The plugin holds the dish's level with a guard the worker chose. After the first listen: keep it, tune it, or take it out.
3. **Bring the piece home.** Once the branch `hook/biomechanical-synthesis` lands, move the piece, its check script and its workshop folder from Biomechanical Synthesis's bundle into this one, so the instrument holds its own face. Until then this project points at them there.
4. **Tie the pages together.** When [[Reverb Design]] exists, this page takes the typed link to it (`deepens`). The link from [[Biomechanical Synthesis]], which will list the reverb as spawned, is that page's owner's edit.
5. **Offer the gap to VST Template.** Its shared machinery saves only the knobs and gives every plugin one editor. This plugin needed state beyond knobs, actions that are not knobs, and its own editor. Write that up as an offer to the template's steward; the template is not ours to change.
6. **Settle the open finding.** Does the tail turn to a wash sooner as the colony grows? The piece's check leaves it unsettled. Design a measurement that can answer it.
7. **Weigh sharing it.** Nothing is published, hosted or packaged. Before any of that: a licence for the repo, JUCE's terms read, and a [[Sentry]] sweep, all on Loudon's word.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="mycelial-reverb-2026-11-10-born" -->
### 2026-11-10 — Born, with the engine ported to a plugin and matched to the piece sample for sample

The reverb began earlier the same day as a piece on [[Biomechanical Synthesis]]'s rich face (commit `3b26c1df`, branch `hook/biomechanical-synthesis`). Loudon, 2026-11-10, as relayed to this session: "I agree on the entire thing, make it happen." The thing agreed: the reverb becomes a project of its own, and the instrument owns while the lesson points.

**What was made.** The entry, this scroll, and `plugin/`: a JUCE 8 VST3 and AU (code Mycl), with `src/Algorithm.h` a hand port of the piece's engine to C++. Growth runs in the processor, the whole colony is saved in the plugin's state, and *hold it still* freezes growth. A guard holds the dish's level: the piece's own compressor figures (−10 dB, 12:1, 3 ms, 200 ms) on the dish alone, the dry sound untouched. The plugin borrows the VST Template's JUCE copy, parameter table, signing order, validation steps and host check, and does not use its shared processor or editor.

**The gate** (`plugin/check/gate.mjs`, full, run 2026-11-10; `plugin/out/gate-report.json`, printed in `plugin/out/gate-output.txt`): the C++ against the JavaScript on the check script's own cases. Largest difference: 0, on every case.

- One thread: 24,000 samples identical. A fork of three: 9,600 identical.
- 2,000 random junctions identical; the scattering rule's own error 1.22e-15 on both sides, and 2.80e-8 through the C++ engine's float32 lines.
- Ten colonies grown in both engines to 3, 20, 80 and 170 threads: thread for thread identical (13,998 numbers). 720,160 held-energy readings identical; the largest step ratio 1.000000000, so the energy never rose.
- Torture, 60 s of full-scale noise with growth, frosts and jumping controls: 5,761,024 output samples identical, both ended with 87 threads, loudest sample 1.51.
- Plugin only: a 60-thread colony saved as text (11,945 bytes) and reloaded went on growing and sounding the same, difference 0 over 20 s. A held dish is identical whatever block size the host uses. A growing one differed by 9.31e-9 with ragged blocks; reported, not gated.

**Build (2026-11-10, this Mac).** VST3, AU and Standalone built with JUCE 8.0.12; each bundle re-sealed after JUCE finished and the strict signature check passed. pluginval at strictness 5 passed on the built VST3 before anything was installed, and again on the installed one. `auval -v aufx Mycl Loud`: AU VALIDATION SUCCEEDED. Installed to `~/Library/Audio/Plug-Ins/VST3/Mycelial Reverb.vst3` and `~/Library/Audio/Plug-Ins/Components/Mycelial Reverb.component` (outside the repo; `./plugin.sh uninstall` removes both). The template's host check loaded it, found the five parameters automatable and heard every move change the sound, and reports FAILED on one line: the defaults rendered twice differ, because the dish grew during the first render. The editor opened as a host opens it at 720 × 560 and 1000 × 760 and was photographed with a newborn dish (`plugin/out/editor-*.png`).

**Not done, on purpose.** Nothing published, hosted or packaged for download. No licence file added; the repo has none, and JUCE's terms for this are unweighed.

**Owed elsewhere.** [[Biomechanical Synthesis]] listing the reverb as spawned is its owner's edit. The piece still lives in that page's bundle.

_Left rough:_ nobody has heard the plugin in a DAW, and no agent has heard the piece; the editor has only been seen with a newborn dish, never a grown one; Live's scanner has not been asked; no real session has been saved and reopened; only 48 kHz is gated; the guard is the worker's choice and unheard; the plan is proposed, not agreed; the entry has no hero or icon yet.
<!-- /scroll:entry -->
<!-- scroll:making:end -->
