---
title: "VST Template — baton"
born: 2026-10-21
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[VST Template]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: VST Template

## Move
Give the template a CRT, a centre screen in the editor that plays the plugin's own visualizer fed live by the plugin's probes, and let the shared machinery make and build a plugin whose folder lives in a steward's own bundle.

## Why this move matters
On 2026-10-21 Loudon moved nine stewarded instruments and effects off the Max path and onto this one: "lets make them products now." Each is to become a VST he can play in Live, with its controls in the template's interface and, in the middle, a visualizer drawn from that instrument's own metaphor, 3D welcome, "uniquely weird and stunning." Two things in the template stand between those stewards and that work. The editor has nowhere to put a visualizer and no live values to feed one. And `new-plugin.py` can only make a plugin under `Projects/VST Template/plugins/`, while a steward may write only inside its own bundle (`_ops/orchestrator/prompts/shared.md:331-342`). Until both land, each steward can only port its sound to the sketch-and-Algorithm shape and sketch its visualizer as a web page in its workshop. That is the holding pattern its standing order names.

## Cold start
COLD START. This work has not begun; no prior state, no tried-and-rejected. What is true today, checked on `main` after the UI landing (`ff175004`):

- **The house editor has landed, and the CRT's set is already drawn.** Every plugin's editor is a web page in Drafting Table on Phosphor, drawn from its parameter table (`machinery/ui/editor.html`; Loudon's pick: bench for Simple Synth, the edge-map pad for Frustration). The CRT is a bezel drawn as an elevation around a black glass, with a slight vignette (`editor.html:338-369`; design standard § The CRT, `VST Template — design standard.md:89-101`). It sits between the two heroes in the bench direction and is made once and moved into each rebuild, so a visualizer's canvas and WebGL context survive a resize. A visualizer draws into `window.editorScreen` (`editor.html:368`).
- **It is hidden until a plugin asks for it.** `screen.hidden = !ui.screen` (`editor.html:492`): `"screen": true` in `plugin.json`'s `ui` block shows it, and neither plugin sets it yet. `ui.py mock <plugin> --screen` (or `shot --screen`) shows it with colour bars standing in.
- **Nothing loads a visualizer yet.** The editor's resource provider serves only `index.html` and returns nothing for any other URL (`machinery/src/PluginEditor.cpp:105-113`), so a plugin's `ui/visualizer.js` has no way in.
- **The editor binds parameters only.** JUCE's slider, toggle and combo relays (`PluginEditor.cpp:46-55`) and one native `pluginInfo` call, which sends the parameter table and the `ui` block (`:115` on). No probes reach the page.
- **Probes exist, but only the harness reads them.** A plugin names them in `src/Algorithm.h` as `kProbes` (Simple Synth: `freq`, `cutoff`, `amp_env`, `plugins/SimpleSynth/src/Algorithm.h:53`). `processBlock` copies them out only into the harness's `ProbeSink` (`machinery/src/PluginProcessor.cpp:192-196`). `plugin.json` does not name them. The recipe already sketches where a live feed would hook in: atomics on the processor, a 60 Hz `juce::Timer` in the editor calling `emitEventIfBrowserIsVisible ("probes", …)`, and the page listening through `window.__JUCE__.backend` (`template/README.md:57-62`).
- **`new-plugin.py` writes only into `plugins/`** (`new-plugin.py:24`, `:51`). Its code-uniqueness check scans `plugins/*/plugin.json` alone (`:30`), so a plugin made elsewhere would escape it.

## Next move
Build on the landed editor, in your own worktree:

1. **The CRT's picture.** The bezel is drawn; what it lacks is a way in. The editor loads the plugin's own `ui/visualizer.js` (WebGL, three.js welcome) into `window.editorScreen`, served by the resource provider, with the template's controls kept around it. A plugin with no visualizer keeps the screen hidden, as now.
2. **The feed.** The plugin declares the probes it streams to the CRT, named in `plugin.json` as the brief has it, or picked from `kProbes` if that reads better; say which you chose and why. The editor relays them at about 60 Hz, lock-free off the audio thread, decimated from per-sample values. Parameters keep their relays.
3. **Plugins in a steward's bundle.** `new-plugin.py` and `machinery/` can make, build, validate and install a plugin whose folder sits in a steward's bundle (for example `Projects/Slime Mold Delay/plugin/`), with the code-uniqueness check covering every plugin wherever it lives.

**Done when** Simple Synth shows a working CRT in Live, driven by its own probes, and one steward's bundle builds a plugin through the shared machinery that passes the template's gates (strict `codesign`, pluginval, auval, the host check).

**Nine stewards wait on this**, each with a standing order of 2026-10-21 on its scroll (`ca454ba2`): [[Shepard Tone Synthesizer]], [[Slime Mold Delay]], [[Neural Granular Synthesis]], [[Action Potential Oscillator]], [[2D Torus Wavetable Synthesizer]], [[Blood Compressor]], [[Bayesian Granular Synthesizer]], [[Crystal Synthesizer]], [[Retrospective Delay]].

## Receiving environment
Claude Code on the Mac, in a worktree of your own (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`). JUCE, CMake, pluginval and auval are on this Mac. Live 12 is beside Loudon's own Live instances; to prove a load without disturbing his, see [[Ableton Session Writer]]'s Gotchas.

## Calibrations from this session
- Loudon, 2026-10-21: "lets get playful with the visualizer, making the visualizer (consider 3D) very deeply related to the metaphor or unique aspects of the instrument itself." The CRT is the template's frame, and each visualizer belongs to its steward. Don't build one generic scope for all.
- Max work on these instruments is set aside, not dropped; it may come back as teaching tools. Nothing here touches a Max file.
- Post this baton's board line when its commit lands, not before ([[The Daily Page — tuning]] item 34).

## Load these files first
1. [[VST Template]] and `Projects/VST Template/VST Template — scroll.md`: the Plan and the seal gotcha.
2. `Projects/VST Template/template/README.md`: the afternoon recipe.
3. `machinery/src/PluginProcessor.cpp`, `machinery/src/Harness.cpp`, `new-plugin.py`.
4. `machinery/src/PluginEditor.cpp`, `machinery/ui/editor.html`, and `VST Template — design standard.md` § The CRT.
5. One steward's scroll, for the order it will build to: `Projects/Slime Mold Delay/Slime Mold Delay — scroll.md`.

## On pickup (fixed — the catcher's checklist; do not rewrite per session)
*Identical in every baton. It rides along because the catching Claude loads the
baton and the entry, not this ceremony — so the catcher's obligations live where
the catcher will see them. Omit nothing here.*
A pickup has two beats: **claim** it when you catch it, **close** it when the move lands. The card stays visible in between — a claim that ages with no close is how a dropped baton (a "fumble") surfaces instead of vanishing. (A parent-entry baton that was never announced on the board has no card; skip the board posts — just remove the pointer and delete the file at close, step 8.)

**Catch it — claim:**
1. State the move back in one sentence. If you can't, the baton wasn't caught — stop and ask Loudon.
2. Check it may already be done before you commit to it. The baton is a snapshot from when it was written; the project may have moved past it. Re-read the parent entry and `git log` it since the baton's `born` date, and confirm the "Current state" the baton quotes still matches the file. For a board-announced baton, `node _ops/stigmergy/pickup-handoff.mjs <id>` prints exactly this reconciliation view — every commit that touched the entry since the baton posted — and then claims the card, so run it and read the list *before* you continue. If the move is already done, superseded, or no longer wanted, STOP — do not claim it; surface to Loudon, and if it plainly landed already, close it as a reconciler (step 7). A stale baton followed silently produces drift. (The auto-staleness heuristic is off by design — the freshness call is yours.)
3. If this baton or its board line is still uncommitted (authored on a surface that couldn't commit — e.g. Cowork), commit them first. That commit is the git archive step 8 relies on.
4. Claim it. For a board-announced baton (it shows in `list-handoffs`), the `pickup-handoff.mjs` from step 2 has already posted the claim (`handoff_picked_up`, `lifecycle: claim`) — the card moves to **CLAIMED (in flight)**; it does *not* leave the board. Leave the "Active Baton" pointer and the baton file in place for now — they come out at close, so a fumble mid-move never erases the work.
5. If the baton names a receiving-surface capability delta or a worktree coordinate, confirm it holds before relying on it (the [[Surfaces and Capabilities]] catalog can be stale) — for a worktree, check `git worktree list` and recreate it (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`) if it is gone. A build that was supposed to run here but can't is a finding to report, not a failure to hide.
6. Act on the move, holding the calibrations above.

**Close it — when the move lands:**
7. Post the close. `node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>` retires the card — an explicit close is the *only* thing that clears it (done is never inferred). Cite the commit that landed the move: it makes the close a checkable claim, not a self-report. **Complete, or re-baton the rest:** if you finished the whole move, close plain; if you did only part, `--partial --remainder "<what's left>"` posts the leftover as a fresh `handoff_ready` so it reappears as open work. Never let "in the spirit of the original" quietly drop scope — a gap becomes a new baton, not silence.
8. Delete the baton file (git is its archive) and remove the "Active Baton" section from the parent entry. On a surface that can't delete (Cowork), remove the pointer and note "deletion pending." Steward batons are the exception — updated in place, never deleted or closed.
