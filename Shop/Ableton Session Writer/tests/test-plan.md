---
title: test-plan
born: 2026-10-21
links:
  - { target: "[[Ableton Session Writer]]", type: connects-to, label: test-plan-for }
forward_vector: "I am the Ableton Session Writer's test plan; I want every claim on its page to have a check that runs in one command, and the one claim no command can check, that a Set sounds right, named plainly as Loudon's ear."
---

# Ableton Session Writer — Test Plan

> Copied from the Maker's template (`Shop/Maker/_TEMPLATE/test-plan.md`) at minting, 2026-10-21, and filled from the probe of 2026-10-20 → 21 (`Shop/Shopkeeper/probes/2026-10-20-ableton-session/`). Until the Specialist's own job folder exists, every probe runs against the probe's three Sets in `out/`.

Last run: **2026-10-21** — smoke passed on all three Sets; Simple Synth and Tear and Heal opened and played in a second Live 12.4.6 instance; the Frustration Set loaded in Live 12.4.6 at 00:16:02 on 2026-10-21 after the plugin's re-seal and a rescan (`1847b68c`); nobody has yet played the ride.

## Smoke
One command: `node "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs" check "Shop/Shopkeeper/probes/2026-10-20-ableton-session/out/Tear and Heal.als"`. It passes when it ends `nothing to look at`; it fails loud on a missing sample, a repeated pointee id, or an uninstalled plugin.
- **Automated.** Run 2026-10-21 on all three Sets: each ended `nothing to look at`.

## Capability Probe
Each claim on the entry, and the check that holds it:
- `plugin` — the Set holds the VST3 device with its configured parameters, a Device On lane and a lane per ridden parameter, one clip per section, a Limiter on Main: `check` on `out/Simple Synth.als` (8 parameters shown, 3 clips, 3 lanes) and `out/Frustration.als` (6 shown, 4 clips, 3 lanes). Opened in Live: Simple Synth loaded ("Restored: Simple Synth" in Live's log) and the transport ran the sections; Frustration opened but its device read "could not be found" on 2026-10-21 (the broken seal) — the re-open after the rescan loaded it at 00:16:02 (`1847b68c`), with no audio device and nobody playing.
- `library` — one track per SFZ instrument, every region a Sampler zone, every sample on disk, a clip per track in turn: `check` on `out/Tear and Heal.als` (four instruments, 240 samples, all on disk); opened and played in Live, the first track's meter lit.
- `check` — reads a Set back: the Live that wrote it, tracks, devices, clips, notes, lanes, pointee uniqueness, sample presence, whether the plugin is installed and off at open. Run on every Set above.
- **Automated** (`check`), and **manual on the mac only** (opening in Live: the probe's `out/proof/prove.sh` starts a second Live 12 instance with `open -n`, captures the screen, and quits it; it must never drive Loudon's running Live).

## Style Probe
A Set has no design-system surface; its style is what Loudon finds under his hands: Arrangement view on open, a sensible tempo, silence until play, a Limiter at −1 dB on Main, clips named for the ride's sections.
- **Manual:** Loudon opens a Set and plays the ride; whether the sections say what the field guide says, and whether the Sampler's loops sit where the SFZ put them, is his ear. Nobody has listened yet.

## Edge Probe
- An existing Set is never overwritten without `--force`.
- A missing sample, a repeated pointee id, or an uninstalled plugin fails `check` loud — seen 2026-10-21 for the uninstalled Frustration.
- Untried: an `.sfz` with no regions; a plugin folder with no build (the class id is then derived by JUCE's formula, which holds only for `JUCE_VST3_CAN_REPLACE_VST2=0`); a ride recipe naming a parameter the plugin lacks; a recipe tempo the blank set's tempo lane disagrees with (the writer sets both since 2026-10-21). Each should fail loud; none has been run.
- **Automated** for the first two.

## Speed Bench
- **Reference host:** mac. **Numbers:** a Set is written in well under a second (Node, no install; samples referenced, never copied). Proving a Set means a Live 12 instance for about a minute.

## Determinism
Not yet proven. The writer clones Live's own XML and renumbers pointee ids from the template's `NextPointeeId` in one order, so the same input on the same writer should give the same XML; the gzip wrapper carries a timestamp and nobody has hashed two builds. The reproducibility artifact is the input itself: the plugin folder (or SFZ folder) and the ride recipe (`frustration.live-set.json` is the pattern).
- **Proof / reproducibility artifact:** `Shop/Shopkeeper/probes/2026-10-20-ableton-session/frustration.live-set.json` and the Set it made, `out/Frustration.als`.
