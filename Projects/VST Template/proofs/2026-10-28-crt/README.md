# The CRT, lit — 2026-10-28

The template's screen now plays each plugin's own visualizer, fed live by the plugin's probes, and a plugin in a steward's bundle builds through the shared machinery. Cycle 1 of the VST Template steward.

## What changed in the machinery

- **The feed** (`machinery/src/PluginProcessor.*`). While an editor is open, `processBlock` writes a frame about 480 times a second (every probe in `kProbes` order, then the output's peak) into a `juce::AbstractFifo` of 512 frames. It is lock-free and single-reader, and a full queue drops the frame. With no editor open it writes nothing.
- **The relay** (`machinery/src/PluginEditor.*`). A 60 Hz `juce::Timer` drains the queue and sends one `"probes"` event, `{ p, out, h, rate }`, every tick, new frames or not, so a picture keeps moving at rest. `pluginInfo` now also carries the probe names.
- **The picture** (`machinery/ui/editor.html`, `machinery/tools/ui.py`). `ui.py` inlines the plugin's `ui/visualizer.js` and names its object `window.editorVisualizer`. The editor mounts it once on the glass, with hooks bound to its own parameter relays, and calls `frame(probes, params, dt)` on each event. The screen shows when `"screen": true` and a visualizer exists.
- **The mock's feed** (`ui.py mock|shot --feed`). An eight-second phrase goes through the real processor in the harness, and its probes are replayed at 60 Hz, so the browser page moves as the plugin would.
- **Bundles** (`new-plugin.py`, `template/CMakeLists.txt`, `template/plugin.sh`). `--into "Projects/<Page>/plugin"` makes the plugin in a steward's bundle. The shims look for `VST Template/machinery` beside each folder on the way up; that is Crystal Synthesizer's change of 2026-10-24, now the template's. The code check reads every `plugin.json` in the palace (`Crys` is refused as Crystal Synthesizer's).

## Why the probes come from `kProbes`, not `plugin.json`

The baton offered both. Three stewards had already written visualizers (Crystal Synthesizer, Blood Compressor and Bayesian Granular Synthesizer), and all three read `probes` in `kProbes` order. Naming them again in `plugin.json` would be a second list to keep in step with the first, and the cost of sending them all is a few dozen floats a frame. The contract the three converged on, `mount(el[, hooks])` and `frame(probes, params, dt)`, became the template's word for word. None of their files needed a change.

## What was proved

| plugin | where it lives | build | verify | strict codesign | pluginval 5 | auval | host check |
|---|---|---|---|---|---|---|---|
| Simple Synth | `VST Template/plugins/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ VST3 + AU |
| Crystal Synthesizer | its own bundle, `Crystal Synthesizer/plugin/` | ✓ | ✓ all gates | ✓ | ✓ | ✓ | ✓ VST3 + AU |

Both are installed in `~/Library/Audio/Plug-Ins` on the new machinery.

- `simple-synth-crt.html`: Simple Synth's editor with its visualizer, *the stone and the chisel*, replaying the harness phrase. Open it in a browser.
- `simple-synth-crt-960x600.png`: the same, photographed.
- `crystal-synthesizer-crt.html` and `crystal-synthesizer-crt-1100x700.png`: Crystal Synthesizer's own visualizer, unmodified, on the template's CRT.

## Not proved

- **The real editor's photograph.** `./plugin.sh editor` reported "NO PICTURE": `screencapture` cannot reach a display from this headless session at all ("could not create image from display"), so the change is not the cause. The pictures above are the same page in Chrome, not in the plugin's WebView.
- **The CRT moving in Live.** Nobody has yet opened Simple Synth in Live 12 and watched it play. That is the baton's "done when", and it needs Loudon's screen.

## Gotcha met

Headless Chrome under `--virtual-time-budget` photographed Crystal's CRT as black glass: a heavy picture called 60 times a simulated second starves the compositor. `ui.py shot` now waits 3.5 s of real time when a visualizer is present.
