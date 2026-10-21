---
title: "VST Template — design standard"
born: 2026-10-21
links:
  - target: "[[VST Template]]"
    type: connects-to
    label: standard-for
  - target: "[[Loudon Live Design System]]"
    type: connects-to
    label: plugin-editor
forward_vector: "I am the standard every plugin made from VST Template follows for its editor: the header, type, colour, space, the controls for each kind of parameter, values and resizing, all drawn from the parameter table with no editor code per plugin. I record Loudon's choice of direction once he makes it, and I hand what the house dress lacks for a plugin window back to the design system."
---

# VST Template — design standard

Every plugin made from the template gets the same editor: a custom one in the Loudon Live house dress, drawn from its parameter table, with no editor code of its own. This page says what that editor is. The machinery that draws it is `machinery/ui/editor.html` and `machinery/tools/ui.py`.

The house dress comes in by reference, not by copy. At every build, `ui.py` inlines `_ops/loudon-live/design-system/colors_and_type.css` into the editor, so a change to the design system reaches every plugin the next time it is built.

## What every plugin shares

**Header.** The 3:2 Lissajous trace, drawn as a line rather than embedded as an image. Then the plugin's name in Anton capitals, its tier and version in a mono eyebrow (`SKETCH · 0.1.0`: Sketch, Study or Piece, from `plugin.json`, never "v1"), and the signature `LOUD’N LIVE` on the right, with LIVE in the accent. Nothing else about the plugin: no company line, no links.

**Type.**
- Anton for the name only.
- Manrope 500 for a control's name.
- JetBrains Mono for values, units, ranges and panel eyebrows.
- No Cormorant and no Silkscreen at this size.

The three faces are embedded in the plugin, because a plugin can't fetch Google Fonts.

**Colour.**
- **Skin:** one per plugin (Graphite by default).
- **Accent:** marks where a value is (the knob's arc, a fader's fill, the chosen segment, the pad's dot and the edge line) and nothing else.
- **Never:** glow, decorative gradients or cyan.

**Space.** The 4 px grid. Panels have a 2 px radius, a 1 px border and the first elevation; value chips have a 1 px radius. Nothing goes above the 4 px ceiling.

**Layout, from the table.**
- **Order:** the header, then the heroes (at most two parameters marked `hero`, drawn large), then one panel per `group`, in table order.
- **Panels:** each holds one row of controls and wraps to the next line as a block.
- **Labels:** inside its panel, a control drops the word it shares with the panel's name ("Attack" under "Filter envelope"). Its name stays unique for the host, because Live lists automation lanes by name alone.

**Controls.**

| Parameter | Control |
|---|---|
| continuous (`Linear`, `Log`) | a knob: a 270° arc from 7:30 to 4:30, with the accent arc up to the value and a needle |
| stepped (`Choice`) | segmented buttons, the chosen one filled with the accent |
| on/off (`Toggle`) | a square switch, filled when on |
| hero | a large knob with tick marks (decades on a log taper) and its range written underneath |

**Interaction.**
- Vertical drag: 150 px covers the full range; Shift makes it a fifth as fast. (This is the Drafting Table system's figure, adopted 2026-10-21 so the two systems share one gesture rule.)
- Double-click returns the default.
- The wheel moves 2 %, or 0.4 % with Shift.
- Every drag opens and closes an automation gesture, so Live records it as one move.
- The drawing follows the parameter's taper: a log knob moves evenly in decades. (Tract Mirror's editor drew its tapered sliders linearly.)

**Values.**
- **Readout:** a mono chip in the units a musician reads. Seconds under one show as ms, Hz over a thousand as kHz, and a unitless value spanning decades in scientific form (`1.00 × 10⁻⁵`).
- **Under a hero:** its range, marked `· log` when the taper is.

**Resizing.** The window resizes between the `min` and `max` in `plugin.json`. Sizes follow the window's width and height. At the minimum nothing is clipped; if a plugin still doesn't fit, the body scrolls as a last resort.

**A backdrop** (optional). `plugins/<Name>/ui/backdrop.json` is a field drawn under an XY pad: Frustration's is the edge map from the frustration sweeps.

## The open choice: how the heroes and the controls look

Three directions, all drawn by the same engine from the same tables. The renders are in `proofs/2026-10-21-ui-directions/`.

- **Bench.** Knobs on cards, Graphite. The heroes are two large knobs above the panels.
- **Edge map.** The two heroes become one XY pad. Frustration's pad is drawn over the edge map: the dashed edge, and the torn side tinted.
- **Signal flow.** Faders on Drafting paper, the groups laid out left to right with arrows between them.

What each costs is in the proof's README. This page records the choice once Loudon makes it.

## Review happens on the mock page, never in the plugin

Loudon, 2026-10-21: "Lets fix the rule clash, I like your solution, review on the mockup."

The house rule is that a first interactive version ships with a review surface. For a plugin, that surface lives on its browser mock page. The plugin's own window, inside the DAW, carries none.

The mock is drawn by the same engine from the same parameter table, so reviewing it reviews the editor. Every `ui.py mock` page opens with the design system's review-layer kit mounted. Its moments come from the editor's own layout, one per natural unit: the direction as a whole, the header, the heroes, and one per panel. That makes six moments for Frustration and nine for Simple Synth, with no setup per plugin. Notes go back as Copy for Claude, `.json` or `.md`. Bump `--round` with each revision pass. `--clean` gives a page without it, and `ui.py shot` and the plugin's embedded page never carry it.

## How a plugin uses it

- **In `Algorithm.h`:** a `group` and, for one or two parameters, `hero`, on each row of `kParams`.
- **In `plugin.json`:** a `ui` block with `width`, `height`, `min`, `max`, `direction`, and optionally `skin` and `tier`.
- **Optionally:** `ui/backdrop.json`.
- **To see it in a browser:** `python3 machinery/tools/ui.py mock <plugin> --out page.html`, or `ui.py shot … --size 760x480 --out shot.png` for a picture. The page runs there with a stand-in for the plugin, and its controls work.

## What the design system doesn't have yet (for its open rethink)

A plugin UI needed these, and `_ops/loudon-live/design-system/` doesn't define them. The editor made its own call on each; the system should make it instead.

1. **Controls.** No knob, slider, fader, segmented switch, toggle or XY pad: no geometry, no states (rest, hover, drag, disabled), no sizes. The nearest components are the parameter chip and the tuning card.
2. **Interaction rules for values.** Drag distance, fine adjustment, reset and wheel step are unspecified.
3. **Value formatting.** Nothing on units, significant figures, scientific notation or ms/kHz scaling.
4. **Small surfaces.** The type scale and spacing are written for 1920 × 1080 cards and long pages. There is no scale for a 600 × 400 window, and no rule for resizing.
5. **Fonts as files.** The system loads its fonts from Google Fonts at run time. It holds no font files and no recipe for embedding them, which anything offline (a plugin, a standalone app) needs.
6. **A small mark.** The Lissajous logos are 340 KB SVGs with a background rectangle. There is no small, transparent mark for a 28 px header.
7. **Two inconsistencies.**
   - `wordmark.svg` sets the wordmark in Source Serif, while the README says Anton.
   - `card-tags-params.html` gives the tier badge a 6 px radius, while the ceiling is 4 px.
8. **A Graphite class.** There is no `.skin-graphite` rule; Graphite is only the `:root` default, so it can't be switched back to from another skin.
9. **The review layer** (settled for plugins on 2026-10-21; see above). The design system's rule should say it too: a UI that runs inside another application keeps its review surface on its browser mock. That covers a plugin in a DAW, and likely a Max for Live device.
