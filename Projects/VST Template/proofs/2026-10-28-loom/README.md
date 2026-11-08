# The loom — Frustration's CRT, 2026-10-28

Frustration was the one plugin made from the template with nothing on its screen, and its layout (the edge direction: the B–K pad over the map of where the tone tears) had nowhere to put one. Cycle 2 of the VST Template steward gave it both.

## What changed

- **The machinery** (`machinery/ui/editor.html`). The edge direction now carries the CRT between the pad and its readouts, shown on the same rule as the bench: `"screen": true` and a `ui/visualizer.js`. The bench is unchanged.
- **Frustration** (`plugins/Frustration/ui/visualizer.js`, `plugin.json`). Its picture is *the loom*. The voices hang as pegs along the top, one per harmonic at k·f0 with Algorithm.h's own detune. The tone is one rod along the bottom, with every partial fixed to it at r_k·fundamental. A thread joins each voice to its partial. The model's own lock test decides how it is drawn: voice k can hold partial k while |r_k·fundamental − w_k| ≤ K. Held threads are taut and green. Slipping ones are amber and sway at the slip rate, √(mismatch² − K²), slowed for the eye to 3 Hz at most. Past the gate's 4 kHz a thread is cut. Underneath, the live fundamental over three seconds, and its wobble (the standard deviation over 2 s, edgemap.py's measure) against the backdrop's 0.5 Hz: HELD or TEARING. The window grew to 1040 × 600 (min 900 × 540) to make room.

## The pictures (mock page in Chrome, the harness's feed, K = 6 Hz, 40 partials)

| shot | B | threads held | wobble |
|---|---|---|---|
| `frustration-loom-held-1040x600.png` | 1e-6 | 29 / 40 | ±0.05 Hz · HELD |
| `frustration-loom-edge-1040x600.png` | 2e-5 | about 16 / 40 | ±0.39 Hz · HELD, near the line |
| `frustration-loom-torn-1040x600.png` | 6e-5 | 3 / 40 | ±3.58 Hz · TEARING |

`frustration-loom.html` is the moving page (at B = 2e-5): open it in a browser.

Even at B = 1e-6 eleven high threads slip. That is the model, not the drawing: the ±0.4 % detune puts voice 40 up to 19 Hz from its partial, past K = 6.

## Checked

`./plugin.sh all` on Frustration (`plugin-all.log`): verify (exact to 5.8e-08 of peak against the sketch, behaviour at the edge), strict codesign, pluginval at strictness 5, auval, and the host check: all pass. `ui.py fit` fits at 900 × 540, 1040 × 600 and 1600 × 1000. Simple Synth's bench still fits at all three of its sizes. Installed to `~/Library/Audio/Plug-Ins`.

## Not checked

- **The loom in Live.** No one has opened Frustration's editor in Live 12; this session cannot reach a display.
- **The wobble trace in the photographs** covers only the last moment, not three seconds: headless Chrome ran few of the feed's ticks in its 3.5 s. The moving HTML page draws the full trace.
- The sway is a drawing of the slip, not the voices' true phases; the plugin doesn't send them.
