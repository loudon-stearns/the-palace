---
title: "VST Template — design standard"
born: 2026-10-21
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: standard-for
  - target: "[[Drafting Table Design System]]"
    type: connects-to
    label: editor-dress
  - target: "[[Loudon Live Design System]]"
    type: connects-to
    label: optional-dress
forward_vector: "I am the standard every plugin made from VST Template follows for its editor: Drafting Table on Phosphor, the bench layout or the edge-map pad where two heroes make a map, a control for each kind of parameter, values, resizing and the CRT, all drawn from the parameter table with no editor code per plugin. I want every new plugin to wear me without a line of its own, and I hand what a plugin window still needs back to the design systems."
---

# VST Template — design standard

Every plugin made from the template gets the same editor, drawn from its parameter table, with no editor code of its own. It wears the Drafting Table design system on its Phosphor theme. This page says what that editor is. The machinery that draws it is `machinery/ui/editor.html` and `machinery/tools/ui.py`.

The dress comes in by reference, not by copy. At every build, `ui.py` inlines `_ops/drafting-table/design-system/` into the editor: its tokens, fonts, aliases, component CSS and `dt-controls.js`. So a change to the design system reaches every plugin the next time it is built. A plugin can still wear the Loudon Live house dress, with `"dress": "loudon-live"` in its `ui` block.

## The choice

Loudon, 2026-10-21: "Yes: plugin editors move to Drafting Table on Phosphor, Bench layout, with the edge-map pad on Frustration." Earlier that day, through the Drafting Table session: "the vst editor moves to drafting table".

- **Bench** is the template's direction: the heroes as two large knobs, then one panel per group.
- **Edge map** is the opt-in for a plugin whose two heroes make a map. Frustration sets `"direction": "edge"`, and its `ui/backdrop.json` is the map.
- **Signal flow** stays in the engine, unused.

The three directions, drawn in the house dress before the choice, are in `proofs/2026-10-21-ui-directions/`. Both editors in the chosen dress, photographed from the plugins themselves, are in `proofs/2026-10-21-ui-dress/`.

## What every plugin shares

**Title block.** Drafting Table's title block in its one-row form (`variant: 'row'`), with four cells:
- the name;
- the version, with the tier on the status line. It reads `SKETCH` in red, as the sheets do: Sketch, Study or Piece, from `plugin.json`, never "v1".
- where it came from: `source VST Template`, `drawn Algorithm.h`;
- the maker and the tool: `Loudon Live`, `JUCE 8 · WebView`.

There is no mark; Drafting Table's plugin face carries none.

**Type.** JetBrains Mono throughout, at Drafting Table's fixed sizes. Type does not scale with the window; the controls do. The face is embedded in the plugin, because a plugin can't fetch fonts. It is read from `~/Library/Fonts` until Drafting Table ships it as a file; IBM Plex Mono, which it does ship, is next in its stack.

**Colour.**
- **Theme:** Phosphor, green ink on a near-black ground.
- **Accent:** marks where a value is (the knob's arc, the chosen segment, the pad's dot) and nothing else.
- **Red:** the tier's status line.
- **Never:** glow.

**Layout, from the table.**
- **Order:** the title block, then the heroes (at most two parameters marked `hero`, drawn large), then one panel per `group`, in table order.
- **Panels:** each holds one row of controls and wraps to the next line as a block.
- **Labels:** inside its panel, a control drops the word it shares with the panel's name ("Attack" under "Filter envelope"). Its name stays unique for the host, because Live lists automation lanes by name alone.

**Controls.** Drafting Table's own, mounted with `DT.mount` and bound to the plugin's parameters through the same relays as any control.

| Parameter | Control |
|---|---|
| continuous (`Linear`, `Log`) | its knob, 40, 56 or 72 px, with five ticks |
| stepped (`Choice`) | its segmented buttons, the chosen one filled |
| on/off (`Toggle`) | its switch, with ON or OFF beside it |
| hero | its knob at 96–176 px, with eleven ticks (decades on a log taper) and its range written underneath |
| two heroes, in the `edge` direction | an XY pad: a recessed field, the backdrop hatched in `ink-3`, its edge dashed in `ink-2`, the value a dot in the accent |

The hero knob and the pad are not Drafting Table components yet; its notes for a plugin face mark both provisional. The editor builds the hero from the system's knob. Its pad follows the notes except for the dot: they ask for a `slab` dot, which on Phosphor is near-black on near-black, so the dot stays in the accent.

**Interaction.**
- Vertical drag: 150 px covers the full range; Shift makes it a fifth as fast.
- Double-click returns the default.
- The wheel moves 2 %, or 0.4 % with Shift.
- Every drag opens and closes an automation gesture, so Live records it as one move.
- The drawing follows the parameter's taper: a log knob moves evenly in decades. (Tract Mirror's editor drew its tapered sliders linearly.)

These are Drafting Table's figures, one gesture rule across both systems since 2026-10-21.

**Values.**
- **Readout:** in the units a musician reads. Seconds under one show as ms, Hz from a thousand as kHz, and a unitless value spanning decades in scientific form (`1.00 × 10⁻⁵`).
- **Under a hero:** its range, marked `· log` when the taper is.

**Resizing.** The window resizes between the `min` and `max` in `plugin.json`.
- **The window sets each control's largest size,** by Drafting Table's rule for small windows. On the smaller of width and height, a knob is 40 px under 600, 56 up to 1000 and 72 above; a hero is 96–176 px.
- **If the panels still overflow,** the heroes step down, then the knobs, until they fit. The editor fits itself again in the window's resize event. WebKit stops animation frames in a plugin window it thinks is covered, so a fit waiting on the next frame never came.
- **A plugin's `min` is the smallest window that fits** with every control at its smallest. Below that the panels would scroll, so a plugin never offers it.
- **`ui.py fit` checks it** at the minimum, the default and the maximum. Checking by eye missed this: both first plugins overflowed at the minimums first set for them (Frustration by 64 px at 600 × 420). Simple Synth fitted at 920 × 580 but not at 920 × 620, where the knobs step up a size.

**A backdrop** (optional). `plugins/<Name>/ui/backdrop.json` is a field drawn under an XY pad. Frustration's is the edge map from the frustration sweeps.

## The CRT

Loudon, 2026-10-21: "the look of the CRT should be a architecturally drawn frame, like a design of the outside of a TV, but then we leave the inside to be anything, but there is a slight vingnette on the edges. This way the VST design can create a super creative view that breaks completely from our design choices."

A plugin's own visualizer plays on a screen in the middle of its editor. The template draws the set; the plugin owns the picture.

- **Where:** between the two heroes, in the bench direction. It sits in the row that already takes the window's spare height and stretches into that row's spare width, so showing it moves nothing else and the editor still fits at every size. In the edge direction the pad is the centre, and there is no CRT.
- **The casing:** a television drawn as an elevation, in the dress's ink. The cabinet and its inner edge, the bezel's lip, the rounded face of the tube, two knobs, a speaker grille, the feet, and centre marks as on a drawing. It is redrawn to whatever space it has.
- **The glass:** `#screen .glass`, also reachable as `window.editorScreen`. It is black until the plugin draws, and anything goes in it: a canvas, WebGL, three.js, any colour at all.
- **The vignette:** a slight darkening at the glass's edges, laid over whatever the plugin draws.
- **It lives through rebuilds.** The screen is made once and moved into each rebuild, so a visualizer's canvas and its WebGL context survive every resize.
- **Off until a plugin has a visualizer.** `"screen": true` in the `ui` block shows it; neither plugin sets it yet. Loading a plugin's `ui/visualizer.js` and feeding it the probes is the CRT move batoned on VST Template. Where the feed would hook in is in the recipe (`template/README.md` § The editor, and reviewing it).
- **To see it:** `ui.py mock <plugin> --screen`, or `shot --screen`, shows the CRT with colour bars standing in for a visualizer. The review surface then has a moment for it.

## Review happens on the mock page, never in the plugin

Loudon, 2026-10-21: "Lets fix the rule clash, I like your solution, review on the mockup."

The house rule is that a first interactive version ships with a review surface. For a plugin, that surface lives on its browser mock page. The plugin's own window, inside the DAW, carries none.

The mock is drawn by the same engine from the same parameter table, so reviewing it reviews the editor. Every `ui.py mock` page opens with the design system's review-layer kit mounted. Its moments come from the editor's own layout, one per natural unit: the direction as a whole, the header, the heroes, and one per panel. That makes six moments for Frustration and nine for Simple Synth, with no setup per plugin. Notes go back as Copy for Claude, `.json` or `.md`. Bump `--round` with each revision pass. `--clean` gives a page without it, and `ui.py shot` and the plugin's embedded page never carry it.

## How a plugin uses it

- **In `Algorithm.h`:** a `group` and, for one or two parameters, `hero`, on each row of `kParams`.
- **In `plugin.json`:** a `ui` block with `width`, `height`, `min`, `max`, and optionally `direction` (`bench` unless the heroes make a map), `tier`, `dress`, and `screen`.
- **Optionally:** `ui/backdrop.json`.
- **To see it in a browser:** `python3 machinery/tools/ui.py mock <plugin> --out page.html`. The page runs there with a stand-in for the plugin, and its controls work.
- **To check it fits:** `ui.py fit <plugin>`.
- **To photograph the real editor:** `./plugin.sh editor` opens the installed VST3's editor as a host does, at the minimum and default sizes, and writes `out/editor-<W>x<H>.png`. Nothing sounds.

## What the house dress lacked, and where it went

A plugin UI needed these, and the Loudon Live system (`_ops/loudon-live/design-system/`) didn't define them. They went to the design-system rethink.

Drafting Table answered the first five in its notes for a plugin face (its README, 2026-10-21), and the editor now follows those answers. Items 6 to 8 are still true of the Loudon Live system, for a plugin that wears it.

1. **Controls.** No knob, slider, fader, segmented switch, toggle or XY pad: no geometry, no states, no sizes.
2. **Interaction rules for values.** Drag distance, fine adjustment, reset and wheel step were unspecified.
3. **Value formatting.** Nothing on units, significant figures, scientific notation or ms/kHz scaling.
4. **Small surfaces.** The type scale and spacing were written for 1920 × 1080 cards and long pages, with no rule for resizing.
5. **Fonts as files.** The system loads its fonts from Google Fonts at run time, which nothing offline can do.
6. **A small mark.** The Lissajous logos are 340 KB SVGs with a background rectangle; there is no small, transparent mark for a 28 px header.
7. **Two inconsistencies.**
   - `wordmark.svg` sets the wordmark in Source Serif, while the README says Anton.
   - `card-tags-params.html` gives the tier badge a 6 px radius, while the ceiling is 4 px.
8. **A Graphite class.** There is no `.skin-graphite` rule; Graphite is only the `:root` default, so it can't be switched back to from another skin.
9. **The review layer.** Settled for plugins on 2026-10-21 (above), and written into the design skill's rule: a UI that runs inside another application keeps its review surface on its browser mock.
