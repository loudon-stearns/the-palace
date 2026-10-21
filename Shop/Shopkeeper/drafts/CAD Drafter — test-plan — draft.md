---
title: test-plan
born: 2026-10-20
links:
  - { target: "[[CAD Drafter]]", type: connects-to, label: test-plan-for }
forward_vector: "I am the CAD Drafter's test plan; I want every claim on its page to have a check that runs in one command, and the one claim no command can check, that a part fits, named plainly as the hand's job."
---

# CAD Drafter — Test Plan

> Copied from the Maker's template (`Shop/Maker/_TEMPLATE/test-plan.md`) and filled from the probe of 2026-10-20. Until the Specialist's own job folder exists, every probe runs against the probe's worked example, `Shop/Shopkeeper/probes/2026-10-20-cad/`, from that folder, with the venv at the worktree's root.

Last run: **2026-10-20** — smoke 24/24 checks; determinism byte-identical across two builds.

## Smoke
One command: `../../../../.venvs/cad/bin/python build.py`. It passes when it exits 0 and its last line reads `24/24 checks: model = source, files = model`, with three SVG sheets in `out/`.
- **Automated.**

## Capability Probe
Each claim on the entry, and the check that holds it:
- Exact solids and labelled dimensions: the 20 `model = source` rows in `out/check.json` (radii and face heights measured off each solid against `handwheel_dims.py`).
- STEP for every part: the three STEP read-backs in `out/check.json`, each to 1 part in 10⁹ of the model's volume.
- STL only when every mating dimension is known: the build prints `STL withheld for HH-CAP-01` and writes no cap STL while `MOTOR["rotor_bolts"]` is `None`. The ladder's STL reads back within 0.5 %.
- Mass and inertia: `freecad_probe.py` under `freecadcmd` rebuilds the cap and writes `out/freecad_probe.json`; its volume and inertia must equal the build's `cap` block.
- **Automated** (the build), and **automated on the mac only** (the FreeCAD cross-check).

## Style Probe
The sheet wears the drafting skin: paper `#f0eee5`, ink `#1a1916`, accent `#c8261a` for MEASURE, blue `#2b5fb0` for DATASHEET, JetBrains Mono; no emoji. `grep -c '#c8261a\|rgb(199,37,26)' out/*.svg` finds the red on every sheet that holds a MEASURE.
- **Manual:** Loudon reads one sheet and says whether a number's colour told him where it came from without the legend. Only his eye answers that.

## Edge Probe
- A dimension that disagrees with its model stops the build with the part, the dimension and both numbers. Seen on 2026-10-20, when the fused shaft erased the Ø15.
- A MEASURE (`None`) withholds the STL of every part that depends on it, and prints why.
- Untried: a negative or zero clearance, a ring bore smaller than the motor, a sheet whose views overflow the frame. Each should fail loud; none has been run.
- **Automated** for the first two.

## Speed Bench
- **Reference host:** mac. **Numbers:** three sheets with STEP, STL, checks and Chrome previews: 12–20 s on 2026-10-20, with other sessions loading the machine. The bulk is Chrome's previews.

## Determinism
Deterministic. Same source and same build123d → byte-identical SVG, STL, STEP and `check.json` (hatch pieces sorted; STEP header date fixed to the datasheet's read date). The PNG previews are Chrome's and are not held to this.
- **Proof:** two consecutive builds on 2026-10-20 hashed identical (`shasum out/*.svg out/*.stl out/*.step out/check.json`).
