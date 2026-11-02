---
title: "Synth Templates — workshop README"
born: 2026-11-01
links:
  - target: "[[Synth Templates]]"
    type: connects-to
    label: workshop-front-door
forward_vector: "I say what in this folder is written by hand and what is generated, so no one edits a generated file and loses the change."
---

`build-catalog.py` is the source of truth; `catalog.json` and `picker.html` (via `build-picker.py`) are generated from it and are overwritten on every build. Loudon's synthesis notes, which seed the concept map, live in the bundle of [[Synthesis Notes (Loudon)]]: `Synthesis Notes (Loudon)/Synthesis Notes (Loudon) — source — notes.pdf` and `— notes-text.txt`.
