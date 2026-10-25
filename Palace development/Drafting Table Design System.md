---
title: Drafting Table Design System
type: source
pillars:
  - creation
  - tools
  - practice
born: 2026-10
stage: sprout
author: Loudon Stearns with Claude (claude.ai Design System artifact)
year: 2026
medium: tool
energy: high
forward_vector: >
  I am the dress for the work itself: the plugin face, the drafting sheet, the bench.
  Two grounds, Paper for the drawing and Phosphor for the signal, one set of tokens,
  twelve controls a VST editor can wear with no framework underneath. I grew from
  Loudon Live's Drafting skin and Stigmergy's phosphor, and I want to earn the word
  "standard" by being worn: first by the VST Template's editor, then by every face the
  Shop makes for a tool rather than for an audience. Loud'n Live keeps the public
  channel; I keep the workshop.
links:
  - target: "[[Loudon Live Design System]]"
    type: mirrors
    label: sibling-system-grew-from-its-drafting-skin
  - target: "[[BBS Design System]]"
    type: mirrors
    label: sibling-system-shares-the-phosphor
  - target: "[[CAD Drafter]]"
    type: emerged-from
    label: drafting-sheets-as-third-source
  - target: "[[VST Template]]"
    type: enables
    label: plugin-face
  - target: "[[Maker]]"
    type: couples-with
    label: workshop-base-of-cascade
  - target: "[[The Shop]]"
    type: connects-to
    label: shop-dress
  - target: "[[Review Layer]]"
    type: connects-to
    label: inherits-rule
  - target: "[[Technical Diagram Standard]]"
    type: connects-to
    label: same-text-first-test
  - target: "[[SUBSTRATE]]"
    type: deepens
    label: workshop-substrate
---

# Drafting Table Design System

![[Drafting Table Design System — hero.png]]

The dress for the work Loudon makes with his hands and ears: plugin faces, instrument panels, 3D parts, and the pages that document a build. It is the [[BBS Design System]]'s terminal grown up and moved onto the [[CAD Drafter]]'s sheet. The grammar stays: monospace everywhere, a hairline is the card, nothing is rounded unless it was turned on a lathe, every word is text you can grep. What changes is the ground and the mass. The sheet is paper by day and phosphor by night, and a control has a solid surface you could pick up.

> Drawn, not rendered. Every surface is outlined in ink, every number says where it came from.

The system lives in two places that are kept level by hand: the Design System artifact (https://claude.ai/artifact/5B7KLXdyRVpavzgpEgcRVH, private, with live previews of every component) and its export in the palace, `_ops/drafting-table/design-system/`. The manifest an agent reads is `_ops/drafting-table/design-system/SKILL.md`; the brand book is its `README.md`.

## Which dress

Three systems, one rule for which to wear:

| Dress | Wear it for | Manifest |
|---|---|---|
| **Drafting Table** | the work itself: a plugin or AU face, an instrument panel, a part drawing, a tool's UI, a page about a build | `_ops/drafting-table/design-system/SKILL.md` |
| [[Loudon Live Design System]] | anything the public channel shows: a stream card, a session artifact, Loud'n Live's pages | `_ops/loudon-live/design-system/SKILL.md` |
| [[BBS Design System]] | STIGMERGY, the board and its app | `_ops/stigmergy/design-system/` |

Loudon's word for Drafting Table, 2026-10-21, was "the standard for the work I do." The palace's settled posture for its one default dress is a floor, not a cage ([[Loudon Live Design System]] § The house style); Drafting Table takes the same posture for the workshop: the reliable default a face reaches for, departed from deliberately and with a reason written down. The first wearer is the [[VST Template]]'s WebView editor, by Loudon's decision the same day.

## What it is, in brief

- **Two grounds, one set of tokens.** `paper` (`#f0eee5`, ink `#1a1916`, fill `#dcd9ca`, engineering red `#c8261a`: the Drafting skin and the CAD sheets) and `phosphor` (`#050a06`, `#33ff66`, `#1f8a3c`, `#0b2a14`, `#d7f6dc`: Stigmergy, value for value). `data-theme` on the root switches them. A plugin ships on Phosphor in a DAW's dark room; Paper is for pages, prints and proofs.
- **Slabs.** Three tokens new to the palace (`slab-face`, `slab-light`, `slab-shade`) and an outline stroke give anything with mass a matte, ink-outlined surface lifted a millimetre off the sheet. The same rule carries into Three.js and Blender: matte albedo, a constant-width ink edge pass, hatched cut faces, no glass or chrome. This is the way out of the text-mode look without leaving the family.
- **Provenance as colour.** The drafter's legend becomes a UI rule: DESIGN ink, DATASHEET blue, ASSUMED amber, MEASURE red. On a plugin that reads as your value, the host's automation, a modulated value, and clipping or a missing input.
- **The scope is always lit.** The oscilloscope's tokens are the same on both grounds: on a paper face it is the one dark window set into the sheet.
- **Twelve components** built for a VST face: TitleBlock, Panel, Dimension, Legend, Knob, Fader, Toggle, Choice, Button, Readout, Meter, Scope. Their props mirror `tpl::ParamSpec` from the [[VST Template]], so a plugin's parameter table can be handed to the face as data. They ship twice: as plain functions in `dt-controls.js` for a plugin editor, and as a React 18 bundle for the artifact's live previews.
- **Type.** JetBrains Mono for everything on the sheet (hosted, not yet a file), IBM Plex Mono for the terminal, VT323 for banners only.

## Why a third system and not a seventh skin

The [[Loudon Live Design System]] said, when a category the six skins did not serve appeared, to grow a skin, not fork the system. That line argued against exactly this. The reason a skin was not enough: a plugin editor needs controls, a knob with a value arc, a meter whose fill is hatching, a title block, a scope, that a palette swap cannot give; and two grounds under one token set, with the scope fixed across both, is a different shape from one skin. The Paper ground is a descendant of `.skin-drafting`, and the system says so; the rest is new. The tension is held, not hidden.

## What the Maker's rules ask of a wearer

The [[Maker]]'s cascade allows one override context today and asks that a new one be declared in the artifact's parent entry, not drifted into. So the [[VST Template]] entry declares that its editor wears Drafting Table, with a `connects-to` link labelled `editor-dress`. The Maker also says an artifact links the canonical CSS and never pastes a hex; a plugin's WebView cannot link back to the palace, so the VST build inlines the CSS at build time. That is a deliberate departure, declared where the editor is declared.

The Maker's own cascade table and the "only BBS" sentences in the Maker and the Loudon Live entry restate the old rule; carrying the new one to them is the propagate flag's work, on Loudon's yes.

## Status

- **2026-10-21.** Born as a Design System artifact from three sources read exactly; twelve components verified on both grounds in a local harness; the plain-JS controls, the alias sheet and the host binding (`get, set, begin, end, on`, every move inside a gesture) added at the VST Template session's request; exported to `_ops/drafting-table/design-system/`. Loudon: "grow up" and "the vst editor moves to drafting table."
- **2026-10-21, later.** Landed on main (199bcddf) on Loudon's yes; the CLAUDE.md design-manifest line names both dresses (eb246c96); propagate flag commons-the-palace-1792586388505 carries the three-dress rule to the pages that restate the old one, for the next weave.
- **Not yet.** A logo (the name in mono is the mark). JetBrains Mono as a file. A hero knob and an XY pad, described in the brand book but not built.
