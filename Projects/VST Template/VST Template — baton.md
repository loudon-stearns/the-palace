---
title: "VST Template — baton"
born: 2026-10-17
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[VST Template]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: VST Template — from numpy sketch to playable plugin (cold start)

## Move
Build a reusable template that turns a numpy-style per-sample algorithm into a VST3/AU plugin. The shape to cover: a state block, a per-sample update and named parameters. Its first test case is the frustration model in `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride.py`: N partials sharing one phase, pulled by N harmonic voices, with parameters B (stretch), K (coupling), inertia, pinning and N, and **B and K automatable**.

## Why this move matters
Loudon, 2026-10-17: future algorithms like this should be "quickly turned into a VST for further explorations." The evening's findings (breathing across the edge, riding coupling, strikes) are performance gestures. A render can only describe them; automation and a hand on a knob can explore them.

## Prior art to adopt ([[Search Before You Build]])
- **`Projects/Tract Mirror/plugin/`**: the palace's only shipped native plugin. JUCE 8 pulled in by CMake FetchContent, VST3 + AU + Standalone, a WebView GUI, an ad-hoc codesign post-build, pluginval at strictness 5 and 8 passed, auval passed, installed to the user plug-in folders. It also has Python verify scripts (`verify_render.py` and siblings) that gate the plugin against reference renders. The build lessons are in `Projects/Tract Mirror/Tract Mirror — build plan — JUCE VST.md`.
- **Faust**: `.dsp` prototypes in `Projects/Inharmonic Wavetable Synthesis/faust-prototype/`, `Projects/Crystal Synthesizer/crystal-on-the-road/faust/` and `Projects/Action Potential Oscillator/faust-render/`. `neuropulse-mac-compile-handoff.md` names `faust2juce` and RNBO import as alternatives.
- **[[DSP Frameworks]]**: its decision tree says "Standalone VST3 plugin → Faust". The palace's one shipped plugin went the JUCE way. Hold both; the template session settles it with Loudon.
- **Shop: [[RNBO codebox~ smith]]** (status stub) exports to Max for Live, VST3 and AU from codebox. This is the Max-side path.

## Decisions the template session must make (with Loudon)
1. **Framework.** The recommendation, not the decision, is JUCE 8 + CMake, cloned from Tract Mirror. It is the only path proven end to end on this machine, validation included, and a C++ per-sample loop is the most direct port of a numpy loop. The case for Faust is its brevity and its many targets; the cost is that a many-state feedback loop like this model is awkward in a functional language.
2. **Port path from Python.** Hand port, or Claude-assisted port, of the per-sample body into a `process(sample)` with a state struct. Decide whether the numpy sketch stays the reference implementation.
3. **Parameter mapping.** Names, ranges and skew: B wants a log taper across about eight decades; K is linear in Hz. Decide what is automatable and how it is smoothed, given that the model reacts audibly to jumps.
4. **Real-time cost.** The Python loop is far from real time. N = 40 partials at 44.1 kHz in C++ is about 40 sines per sample per voice: trivial. Check the cost at N = 96 and with polyphony.
5. **The verification gate.** As Tract Mirror does: render fixed parameter paths in the plugin and compare them with the numpy reference renders. Pick the tolerance with care, because the model is sensitive at the edge.
6. **Where it lives**, and what "a new algorithm" means as a template input: files to fill in, a generator script, or a copy-and-rename.

## Cold start
COLD START: this work has not begun; there is no prior state, and nothing has been tried and rejected.

## Next move
Read Tract Mirror's plugin folder and build plan, then settle the framework question with Loudon (decision 1) before writing any code. Then port `ride.py`'s per-sample body as the first test case, with B and K as automatable parameters.

## Load these files first
1. `Projects/Tract Mirror/plugin/CMakeLists.txt`, `src/PluginProcessor.*`, `verify_render.py`
2. `Projects/Tract Mirror/Tract Mirror — build plan — JUCE VST.md`
3. `Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride.py` and `field-guide.md`
4. [[DSP Frameworks]]

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
