---
title: README
born: 2026-10-21
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: proof-for
forward_vector: "I hold both plugins' real editors in the dress Loudon chose, Drafting Table on Phosphor, photographed from the installed plugins at their smallest and default windows, with the gates they passed and what the pictures caught on the way."
---

# Both editors in Drafting Table, photographed from the plugins

Loudon, 2026-10-21: "Yes: plugin editors move to Drafting Table on Phosphor, Bench layout, with the edge-map pad on Frustration."

Each picture is the installed VST3's own editor, opened by the host check the way a DAW opens one and photographed by macOS (`./plugin.sh editor`). They are not the browser mock. No audio device was opened, so nothing sounded, and Live was not involved.

| File | Plugin | Window |
|---|---|---|
| `frustration-editor-660x500.png` | Frustration, edge direction | its minimum |
| `frustration-editor-760x520.png` | Frustration, edge direction | its default |
| `simplesynth-editor-920x540.png` | Simple Synth, bench direction | its minimum |
| `simplesynth-editor-960x600.png` | Simple Synth, bench direction | its default |

`editors.png` stacks the four for reading on a phone.

The same build passed every gate, for both plugins:
- the strict code-seal check on both installed bundles;
- pluginval at strictness 5 on the VST3, which opens the editor while processing;
- auval on the AU;
- the host check on the VST3 and the AU;
- `ui.py fit` at the minimum, default and maximum windows.

A sweep of 56 windows across each plugin's whole range also fitted, in both dresses and every direction.

## What the pictures caught

- **The browser pictures were drawn for a smaller window than their names said.** Headless Chrome lays a page out 87 px shorter than its window, then resizes it for the picture. Drafting Table sizes a knob when it mounts, so its knobs were sized for the shorter window, and Simple Synth looked as if it fitted at 1000 × 660 when it didn't. The first Drafting Table renders were deleted.
- **The editor read Drafting Table's small-window rule loosely.** It clamped on the width against 1.6 × the height; the rule says the smaller of width and height. Now it follows the rule.
- **The minimums didn't fit.** In both dresses, both plugins overflowed at their first minimums. The editor now fits itself: the heroes step down, then the knobs. The minimums rose to the smallest windows that fit with every control at its smallest: Frustration 660 × 500, Simple Synth 920 × 540, with Simple Synth's default now 960 × 600.
- **Inside the plugin, the refit after a resize never came.** WebKit stopped animation frames in the host check's window but still sent it the resize event, and the refit waited on a frame. So Simple Synth at 920 × 540 kept the 56 px knobs it had at 960 × 600 and lost its bottom row. The refit now runs in the resize event itself; `simplesynth-editor-920x540.png` is the picture after the fix.
- **A hosted editor takes its own size when it attaches to its window,** so the host check asks for each size once the editor is showing and its page has loaded.
