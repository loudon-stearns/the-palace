---
name: drafting-table-design
description: Use this skill to dress the work itself: a VST or AU plugin face, an instrument panel, a part drawing, a tool's UI, a page about a build. Two grounds (Paper by day, Phosphor at night), one monospace grammar from the Stigmergy terminal, solid slab surfaces for anything with mass, and twelve plugin controls that run with or without React. For anything the public channel shows (a stream card, a session artifact, Loud'n Live), use the Loudon Live design skill instead.
user-invocable: true
---

# Drafting Table · design skill

Drafting Table is the workshop's dress. It is the STIGMERGY terminal grown up and moved onto the CAD Drafter's sheet: monospace everywhere, a hairline is the card, nothing rounded unless it was turned on a lathe, every word is text you can grep. Two things changed from the board: the ground (paper or phosphor) and the mass (a control has a solid face you could pick up). Loud'n Live keeps the public channel; Drafting Table keeps the bench.

## How to use this skill

1. Read `README.md` in full: the sources, the two grounds, the eight rules of the grammar, type, colour in use, solid surfaces and 3D, iconography, the component table, and § For a plugin editor.
2. `colors_and_type.css` is every token, compiled from `tokens.json`. Set `data-theme="paper"` (default) or `data-theme="phosphor"` on the root. Add `fonts.css` for the local faces, `aliases.css` only for a page written against Loudon Live's names.
3. For a plugin editor read `plugin-face.md`, then inline, in order: `colors_and_type.css`, `fonts.css`, `aliases.css` (if needed), `bundle.css`, `dt-controls.js`. The controls take a `tpl::ParamSpec` row and a host binding `{get, set, begin, end, on}`.
4. For a React page load `components/bundle.js` after React 18; `components/index.d.ts` documents the props.

## Hard rules

- **Text first.** Labels, numbers and notes are text in the mono face; never outlines, raster or an icon font. No emoji, no CDN icon set.
- **A hairline is the card.** 1px `rule` for a container, 2px for the sheet frame and title block. No fills to say "box", no soft drop shadows.
- **Square.** `radius-0` on everything drawn; `radius-round` only on a turned part; `radius-bevel` only on a slab's edge.
- **Mass is a slab.** Anything touchable has a `slab-face` outlined in `ink`, lifted by `shadow-slab`; its well is a `recess`. Light is one edge, never a gradient.
- **Colour is provenance, then signal.** `source-design` ink, `source-datasheet` blue, `source-assumed` amber, `source-measure` red; `accent` is the one lit thing in a view. On a plugin: your value, the host's automation, a modulated value, clipping or a missing input.
- **Hatch, don't tint.** A filled region is 45° hatching over `ground-200`.
- **The scope is always lit.** `scope-*` tokens are the same on both grounds: the one dark window set into the sheet.
- **No glow on Paper.** On Phosphor only an LED and the scope frame carry `shadow-glow`.
- **A plugin ships on Phosphor** in a DAW's dark room; Paper is for pages, prints and proofs.
- **Tier, never "v1".** The title block's status line carries `SKETCH` / `STUDY` / `PIECE`; the version cell carries the build.
- **Reviewable first versions, on the mock page.** A UI that runs inside another application keeps its review surface on its browser mock, drawn by the same code from the same data; the shipped window stays clean (Loudon, 2026-10-21).
- **A web piece declares what it needs.** Anything the palace shows in a frame (a rich face, a scroll's trail, a TRICKSTER card) runs on the piece origin, sandboxed, and gets only what it declares in its own `<head>`: `piece:needs`, `piece:files`, `piece:net`, `piece:size`. One HTML file, no build; a CDN library from the shelf, pinned. A piece made for a rich face leaves the review kit out; the face carries it ([[Review Layer]]). Rules: `_ops/rich-face/README.md` § What the page lets run.
- **The gestures are one rule:** 150px of drag for the full range, Shift a fifth, wheel 2% / 0.4%, double-click to default, arrows; every move inside a host gesture.

## If invoked without other guidance

Ask: *is this for the workshop (a plugin, a part, a tool) or for the channel?* If the channel, hand off to the Loudon Live skill. Otherwise ask which ground and whether the thing has mass, then build on the tokens. The footer of a page in this dress is the title block, not a wordmark.
