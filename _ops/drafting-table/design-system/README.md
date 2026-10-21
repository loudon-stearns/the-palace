# Drafting Table

The house dress for the work Loudon makes with his hands and ears: plugin faces, instrument panels, 3D parts, and the pages that document them. It is the Stigmergy terminal grown up and moved onto the drafting sheet. The grammar stays: monospace everywhere, a hairline is the card, nothing is rounded unless it was turned on a lathe, every word is text you can grep. What changes is the ground and the mass. The sheet is paper by day and phosphor by night, and a control has a solid surface you could pick up, because a knob is a part, not a character cell.

> Drawn, not rendered. Every surface is outlined in ink, every number says where it came from.

## Where it came from

Three sources, each read exactly.

| Source | What it gave |
|---|---|
| **STIGMERGY** · `_ops/stigmergy/design-system/` | The phosphor scale (`#33ff66` `#1f8a3c` `#0b2a14` `#d7f6dc` on `#050a06`), amber and red status, the text-first rule, hairlines-not-shadows, `border-radius: 0`, `steps()` motion, VT323 for banners, IBM Plex Mono for the terminal, the inverted hover. |
| **Loudon Live · Drafting skin** · `_ops/loudon-live/design-system/colors_and_type.css` | The paper (`#f0eee5`), ink (`#1a1916` `#3a3a35` `#6a6862`), the fill `#dcd9ca`, engineering red `#c8261a`, the six categorical hues, the 4px spacing scale, the inset-top-highlight elevation idea. The other five skins and the Anton / Cormorant / Manrope stack stay with Loudon Live; they are the public channel's dress, not the workshop's. |
| **The CAD Drafter's sheets** · `Shop/Shopkeeper/probes/2026-10-20-cad/` | The look Loudon asked for: an A4 sheet with a frame, projected views, ISO 45° hatching on a cut face, dimension lines with arrows outside narrow spans, a title block of cells, numbered notes, and a legend where the colour of a number is its provenance: **DATASHEET** blue, **DESIGN** ink, **MEASURE** red. See `assets/Reference/` for the light cap sheet. |

Nothing here is a screenshot. Every colour above is the value in the file it came from; the few values new to this system are named as new in their usage notes (`ground-200` on Phosphor, the three `slab-*` tokens, `rule-soft`).

## Two grounds, one grammar

`tokens.css` compiles two themes. Set `data-theme="paper"` or `data-theme="phosphor"` on the root; everything below holds on both.

- **Paper** is the default. It is the sheet from the CAD Drafter: `ground-000` paper, `ink` text and outlines, `ground-200` under hatching. Use it for a plugin face, a part drawing, a page you will print, anything that should look like it was drawn by a careful person.
- **Phosphor** is the terminal. The same tokens resolve to Stigmergy's values: the board, a log, an agent's window, a late-night scope. Text may carry the CRT bloom here (`shadow-glow` on an LED; `text-shadow` on active text in your own CSS). Never bloom on Paper.

The one thing that does not change with the ground is the **scope**: `scope-ground`, `scope-grid`, `scope-trace` are the same on both themes. A scope is a lit screen set into the sheet; on Paper it is the one dark rectangle and it should look like a window.

## The grammar

1. **Text first.** Every label, number and note is text, in `mono`, so a face can be read by a script and a changed value shows in a diff. No words drawn as outlines, no raster labels, no icon fonts.
2. **A hairline is the card.** Containers are `stroke-rule` in `rule`; the sheet frame and the title block are `stroke-frame`. No fill is needed to say "this is a box". Nested cards use `ink-2` or `rule-soft` dashed. One separation mechanism per edge: a border or a rule, never both.
3. **Square.** `radius-0` on everything drawn. `radius-round` only on a turned part (a knob, an LED, a jack). `radius-bevel` only on a slab's edge, so it reads as machined.
4. **Mass is a slab.** Anything you could touch has a solid face: `slab-face`, outlined in `ink` at `stroke-outline`, lifted by `shadow-slab` (a 1px highlight on top, a 1px line below, a tight 2px drop). A well it sits in is `ground-100` with `shadow-recess`. No gradients across a face; the light is one edge.
5. **Colour is provenance, then signal.** A number's colour says where it came from: `source-design` (chosen here), `source-datasheet` (read from elsewhere), `source-assumed` (nominal, will be corrected), `source-measure` (unknown; red; holds the build). On a plugin that reads: your value, the host's automation, a modulated value not at rest, clipping or a missing input. `accent` is the one lit thing in a view. Everything else is ink.
6. **Hatch, don't tint.** A filled region (a meter's level, a cut face, a selected range) is 45° hatching in `ink-3` over `ground-200`. `bundle.css` gives you `.dt-hatch`.
7. **Say it twice when it is a number.** A value shows as digits and unit (`440.0 Hz`); a parameter that has a tolerance or range shows it (`±0.05`, `20 – 20k`). A HOLD is written as a HOLD, in `source-measure`, not hinted by colour alone.
8. **Motion is discrete or short.** On Phosphor, `steps()` and a 100ms fade at most, as Stigmergy has it. On Paper, 120ms linear for a state change and nothing ambient. No bounces, no springs. A knob follows the hand with no easing at all.

## Type

| Family token | Face | Use |
|---|---|---|
| `mono` | **JetBrains Mono** 400 / 500 / 600 (Google Fonts; no file in this system) | Everything on the sheet: labels, readouts, body, headings. The face on the CAD sheets and in Loudon Live's metadata. |
| `terminal` | **IBM Plex Mono** 400 / 600 (files in `fonts/`) | Board posts, logs, agent output on Phosphor. Ligatures off: `font-feature-settings: "liga" 0, "calt" 0`. |
| `display` | **VT323** 400 (file in `fonts/`) | Banners and splash numerals only. Pixelation is a register. Never body. |

Load JetBrains Mono yourself: `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap`. If a face has to be local (a JUCE WebView with no network), drop the woff2 files into `fonts/` and list them in `tokens.json` under `type.fonts`; `terminal` is the offline fallback in the `mono` stack already.

Casing: uppercase for sheet eyebrows, view captions, title-block names and hotkeys, set in the markup; sentence case for notes and body. No TitleCase. Numbers in `sheet-dim` at 500 weight. Measure of body text ≤ 80ch.

## Colour, in use

- Body text is `ink` on `ground-000`: 15.4:1 on Paper, 13.6:1 on Phosphor.
- `ink-2` on `ground-000`: 10.1:1 Paper, 5.6:1 Phosphor. Fine for notes.
- `ink-3` is for lines, not words. On Phosphor it sits at 1.9:1 on purpose, Stigmergy's "barely visible" tertiary. Do not set text in it on the dark ground.
- `source-datasheet` on `ground-000`: 6.0:1 Paper, 6.2:1 Phosphor. `source-measure`: 5.4:1 Paper, 5.1:1 Phosphor. `source-assumed`: 4.6:1 Paper, 11.1:1 Phosphor. All pass for text at `sheet-dim` size.
- `accent` on Paper is the same red as `source-measure`. That is the Drafting skin's choice and it is kept: on the sheet, the thing that is lit and the thing that is unmeasured are both the thing you look at next. If a face has to show both at once, make the accent an arc and the hold a word.
- Categorical `cat-1` … `cat-6` are for an unordered series in a chart, up to six. Ordered data uses one hue stepped through `ink-3` → `ink-2` → `ink`.
- Never cyan. Never a purple-to-blue gradient. Never a colour that only means a state used as decoration.

## Solid surfaces, and 3D

The slab tokens exist so the same look survives leaving the browser. For a part rendered in Three.js or Blender, or a 3D plugin face:

- **Material:** matte, no specular highlight, `slab-face` as the albedo. Light from above-front so the top edge reads as `slab-light` and the underside as `slab-shade`.
- **Outline pass:** every silhouette and crease edge in `ink` at about `stroke-outline` screen pixels, constant width regardless of depth. This is what makes a render look drawn. (Blender: Freestyle or Grease Pencil Line Art; Three.js: an inverted-hull or post-process edge pass.)
- **Cut faces:** when a section is shown, the cut face is `ground-200` with 45° hatching in `ink-3`, as on the sheets.
- **Ground:** the sheet, `ground-000`, flat, with no horizon. A faint `rule-soft` grid is allowed under a part the way a graticule sits under a trace.
- **Dimensions in 3D** are the same `Dimension` component drawn as a billboard: extension lines, arrows, a `sheet-dim` label coloured by source.

No glass, no chrome, no bloom on Paper. On Phosphor, the only lit material is the phosphor itself: an emissive `scope-trace` wire or LED with `shadow-glow`.

## Iconography

Typographic, as both parents have it. State glyphs: `●` on, `○` off, `▸` play, `■` stop, `◐` half, `◇` aside, `*` unread, `>` reply. Drafting symbols: `Ø` diameter, `±` tolerance, `°` degrees, `×` times, `√`. Box drawing is allowed inside a `<pre>` on Phosphor only. No emoji, no CDN icon set; if a pictogram is truly needed, draw it as a hairline SVG in `ink` and say so in a comment.

## Components

Twelve, built for a VST plugin face and reusable anywhere a value is set or shown. The props of the controls mirror `tpl::ParamSpec` from the VST Template (`Projects/VST Template/machinery/src/ParamSpec.h`): `id`, `name`, `unit`, `min`, `max`, `def`, `taper` (`Linear` | `Log` | `Choice` | `Toggle`), `choices`. A plugin's parameter table can be handed to the face as data.

| Group | Component | What it is |
|---|---|---|
| Sheet | `TitleBlock` | The plugin's header, built like the sheet's title block: name, subtitle, number, version, status, source, drawn. |
| Sheet | `Panel` | A region of the face: hairline frame, eyebrow caption, optional slab or recess surface. |
| Sheet | `Dimension` | A dimension line with arrows and a label, coloured by source. Captions a group of controls the way a sheet labels a span. |
| Sheet | `Legend` | The provenance legend: a stroke in each source colour and what it means on this face. |
| Controls | `Knob` | A turned slab disc with a pointer, a value arc, ticks and a readout. Linear or Log taper. |
| Controls | `Fader` | A cap in a slot with a scale. |
| Controls | `Toggle` | A square switch. `Taper::Toggle`. |
| Controls | `Choice` | A segmented menu; the selected segment inverts. `Taper::Choice`. |
| Controls | `Button` | Press or latch. |
| Displays | `Readout` | A value in a hairline cell with its unit, coloured by source. |
| Displays | `Meter` | A level meter whose fill is hatching, with a red peak line. |
| Displays | `Scope` | The lit window: a trace on the terminal ground with a graticule. |

The bundle is one classic script, `components/bundle.js`, assigning `window.DraftingTable`; it reads `window.React` and `window.ReactDOM` 18. `components/bundle.css` holds the styles, all in tokens. The consumer provides React, the fonts, state and the `onChange` wiring to the host (JUCE `WebBrowserComponent` relays, or a Web Audio node for a web proof). The components hold no audio and no parameter state of their own.

## For a plugin editor

Answers to what the VST Template's WebView editor asked of the system (2026-10-21). Where a rule is provisional it says so.

**Gestures on a value.** One rule for knob, fader and pad: the full range is 150px of drag, Shift makes it fine at a fifth of the speed, the wheel steps 2% (0.4% with Shift), double-click returns to `def`, arrow keys step the same as the wheel. Every control is `role="slider"` with `aria-valuemin/max/now` and is focusable; focus is a 1px dashed `ink` outline, never a glow. The VST editor used 220px; 150px is the system's figure, chosen so a 72px knob turns end to end in about two knob-heights of hand travel. Change it in one place, the `useDrag` helper in `bundle.js`.

**States.** Rest: slab at rest. Hover: `slab-light` face on a button; nothing on a knob, the cursor says enough. Dragging: the arc is already `accent`; the readout turns `ink-bright`. Disabled: 50% opacity, cursor default. Under automation: pass `source="datasheet"`, the readout turns blue, the control still moves. Modulated: `source="assumed"`, amber. A parameter the host has not sent: `source="measure"`, red, and write HOLD in the readout.

**Writing a value.** Digits then unit with a thin space (`440.0 Hz`). Significant figures by magnitude: 3 decimals under 10, 2 under 100, 1 under 1000, none above; trailing zeros dropped. Scale the unit before resorting to exponents: seconds under 1 as ms, Hz at 1000 and above as kHz with one decimal (`1.2 kHz`), gain in dB. Scientific notation only when the unit cannot be scaled, written `1.00 × 10⁻⁵` with a real × and superscripts, never `1e-5`. A range is written `20 Hz – 20 kHz · log`, the taper named. `fmt()` in the bundle does the digits; the unit scaling is the consumer's until a helper lands here.

**A scale for small windows.** The editor runs 440 × 320 to 1600 × 1000. Type does not scale with the window: `sheet-eyebrow` 11, `sheet-dim` 12, `sheet-note` 13, body 15, `sheet-title` 22, always. What scales is the control: knob `size` 40 under 600px wide, 56 to 1000, 72 above; a hero knob 96 to 176. Panel padding `space-3` under 600, `space-4` above; the sheet margin `space-4` under 600, `space-7` above. Clamp on the smaller of width and height. Below 440 wide, drop the title block to its name row.

**Hero knob and XY pad.** Not components yet. A hero is a `Knob` at `size` 96–176 with `ticks` 11 (decades on a Log taper); the pad will be a `recess` with a `slab` dot, its data backdrop drawn in `ink-3` hatching or a single `cat-*` hue stepped through `ground-200` → `ink-3` → `ink-2`, never an accent tint. Provisional until built.

**Fonts offline.** JetBrains Mono is not a file here yet; IBM Plex Mono and VT323 are. A plugin inlines `@font-face` from `fonts/` and loads nothing from the network. Until JetBrains Mono ships as a file, `terminal` (IBM Plex Mono) is the offline face and is already second in the `mono` stack.

**Mark.** None. A plugin header carries the name in `sheet-title` and nothing else. If a mark arrives it will be a hairline SVG in `ink`, 24–32px, transparent, and it will be a palace decision, not this file's.

**Tier and version.** The title block's `status` line carries the tier as the sheets do: `SKETCH · HOLD: …`, `STUDY`, `PIECE`. Its `version` cell carries the build (`0.1.0`). So a plugin reads `SKETCH` in red on its status line and `version 0.1.0` in its numbers row, never `v1`. Provisional; the form is Loudon's to set.

**In a DAW at night.** Use Phosphor. Paper is for the page, the print and the daylight proof; a paper face in Live's dark room glares. A plugin may offer both and remember the choice; it ships on Phosphor.

**Accent and glow.** Accent marks where a value is (arc, fill, chosen segment, pad dot) and the one primary action; nothing else. No glow on Paper at all; on Phosphor only the scope frame and an LED carry `shadow-glow`. Confirmed as the editor has it.

**Reviewable first versions.** A UI that runs inside another application (a plugin in a DAW, a Max for Live device) keeps its review surface on its browser mock page, not inside the host. The mock is drawn by the same code from the same data, so reviewing it reviews the UI, and the shipped window stays clean. Loudon settled this on 2026-10-21 ("review on the mockup"). One moment per natural unit: the face as a whole, the header, each hero, each panel. If the review kit is pasted inline, mind that its usage comment contains a literal `</script>`; escape it or the inlined script ends early.

**Token names.** This system's names are new (`ground-000`, `ink`, `slab-face`, `accent`, `space-1…8`, `font-mono`); they do not match Loudon Live's `--bg`, `--fg-1`, `--s-1`. An editor moving from Loudon Live to Drafting Table maps them once; an alias sheet is a reasonable thing to add here if both have to run side by side. Nothing in Loudon Live's file is changed by this system.

## Not in this system yet

- **No mark.** Drafting Table has no logo; the name is set in `mono` and that is the mark. Stigmergy's ASCII logo and Loudon Live's Lissajous stay theirs.
- **Stigmergy's pixel cursors** (`cursors.py`) were not carried over; they belong to the board.
- **JetBrains Mono** is hosted, not a file.
- **No assembly views, no GD&T symbols**, mirroring what the CAD Drafter has not yet drawn.
- **Built, not synced.** The components were hand-written from the sources above, not bundled from a repository; there is no React library in the palace to sync from. Change them here.

---

## Files in this folder

| File | What |
|---|---|
| `SKILL.md` | The manifest an agent reads before anything visual on the workshop side. |
| `tokens.json` | The source of truth for every token, in the Design System artifact's list shape. Edit this, regenerate the CSS. |
| `colors_and_type.css` | The compiled tokens: both grounds under `data-theme`, spacing, radii, strokes, font stacks, the type classes. Same filename as the sibling systems, so a build finds it by path. |
| `fonts.css` | The three `@font-face` rules, paths relative to this folder. A plugin assembler swaps each `url()` for a `data:` URI. |
| `aliases.css` | Loudon Live's token names resolved onto Drafting Table's, for a page written against the old names. |
| `bundle.css` | The component styles, all in tokens. |
| `dt-controls.js` | The twelve components as plain functions, no framework: `DT.knob`, `DT.fader`, …, `DT.mount(container, spec, binding)`. What a plugin editor inlines. |
| `components/bundle.js`, `components/index.d.ts` | The same components as a React 18 bundle (`window.DraftingTable`) with typed props, for the Design System artifact's live previews and any React page. |
| `fonts/` | VT323 and IBM Plex Mono 400 / 600 as woff2. JetBrains Mono is not shipped. |
| `plugin-face.md` | How the components compose into one VST editor. |
| `reference/` | The CAD sheet the look was read from. |

The living copy with live previews is the Design System artifact: https://claude.ai/artifact/5B7KLXdyRVpavzgpEgcRVH (private). This folder is its export; when one changes, the other is brought level by hand.
