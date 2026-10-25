---
title: "README"
born: 2026-10-25
links:
  - target: "[[Loudon Live Design System]]"
    type: connects-to
    label: workshop-of
forward_vector: "I am the design system's workshop front door: where the roughs for the Loud'n Live visual rethink are made and compared, and the first thing a worker reads before adding one. Nothing here is canon until Loudon's yes carries it into SKILL.md, README.md or the entry."
---

# Loudon Live Design System — workshop

The making files. Nothing here is canon. The entry (`Palace development/Loudon Live Design System.md`) and the manifest (`_ops/loudon-live/design-system/SKILL.md`, `README.md`) are canon.

Opened 2026-10-25 by the Concierge for the visual-rethink roughs (baton: [[Loudon Live Design System — baton]]).

## Rules for a rough

- **One self-contained HTML per rough.** Fonts can come from Google; inline everything else. The piece checker (`_ops/rich-face/conform.mjs`) treats every HTML page git can see as a piece. It runs report-only for now.
- **Declare what it loads, in its `<head>`.** Use `piece:files` for any palace file it fetches, `piece:needs` / `piece:net` / `piece:size` only if it needs them. Loading the design system's own files needs no line. See `_ops/rich-face/README.md` § Making pieces.
- **Name it** `rough — <qualifier>.html`, e.g. `rough — loud-terminal.html`. It is not an entry, so it takes no `[Entry] — ` prefix and no frontmatter `type:`. A file with `type:` in its frontmatter is an entry, not workshop.
- **Hold the floor.** Keep the studio voice and the Lissajous sigil. No emoji, no hype. Cyan is allowed in roughs since Loudon retired the rule on 2026-10-25 (below); the canon files still say otherwise until that lands.
- **Nothing here edits the house.** A rough that wins goes to the Concierge as an offer for canon, and canon waits for Loudon's yes.

## Decisions so far

Loudon's calls, in order, with his words. They wait here until they land in canon through the Concierge.

- **2026-10-25 · how far toward STIGMERGY: the furthest.** On `rough — how far toward stigmergy.html` he picked D, the furthest card: *"I like the furthest, and we can push even harder."*
- **2026-10-25 · "no cyan" is retired.** *"lets retire the "no cyan" rule."* Still open: what cyan is for (handles and links only, as on the board, or a full accent), and whether Drafting Table's own "Never cyan" goes too.
- **2026-10-25 · E is the look.** On `rough — broadcast glitch and blueprint.html`, card E (the worn broadcast: old circuit board, tube face, grain, tears, scrambles, colour fringe, cyan on handles and links) is the hit: *"E is the perfect hit, record that as a clear win."* E+, the heavier version, was not chosen.
- **2026-10-25 · F, the inverted Drafting Table blueprint, is close but too clean.** It wants the architect's hand: drafting by hand, with care, going through revisions, *"Maybe even so far as a subtle coffee mug stain."* Rough 3 answers it.
- **2026-10-25 · Worn Broadcast landed in canon** in `3c817503`, on his word: *"lets commit the approved one as one complete look for Loud'N Live, with the recognition that there will be a few."* The look is `_ops/loudon-live/design-system/looks/worn-broadcast.html`. "No cyan" is retired across the Loudon Live system's files. Drafting Table's own "Never cyan" stands until he decides it.
- **2026-10-25 · F, rough 3 read as childish.** *"A skilled drafts person would still use a ruler and have very straight lines, and would use proper capitalization."* Keep the faded erasures and the red-pencil errors; lose the wobbly lines and the filter-made coffee stain, which looked digital. A real stain should come from an image: *"If you were to use some layer of genAI generation for the paper using runpod I think we could get there."* Rough 4 (`rough — the ruled hand.html`) rules every line straight.
- **2026-10-25 · F's lettering: Josefin Sans, tracked normally.** He wanted *"a more precise architectural font, that still feels a little sloppy. Traditional precise drafting font."* From `rough — drafting lettering specimen.html` he picked D: *"D, Josefin without the extreme space between letters."*
- **2026-10-25 · F's big title: drawn, outlined, thin pen.** *"maybe more outline for the big titles"*, with two references: letterforms built on construction lines, and an outlined alphabet with a dimension under each letter. Then *"I like the big letters with thin pen."* Rough 5 (`rough — constructed title.html`) draws the wordmark in a thin-pen Josefin outline, with its construction lines and dimensions left in. On seeing it: *"YES! this is getting much closer!"*
- **2026-10-25 · F's paper: local SDXL first.** *"Generate 8 blank blueprint paper plates on the local SDXL first, then we'll see if RunPod FLUX is needed."* The script and plates are in `plates/`.
- **2026-10-25 · F's paper: cyanotype, darker, from his reference.** He shared an online photo of a 1930s-style blueprint elevation as *"close to the feel"*, then said *"WE can go darker, and if you want to use this as a style reference that is great in the generation."* The reference's blank paper became the img2img start image (built at `plates/reference/cyanotype-paper-init.png`, since removed), and the plates are tinted darker than the print. Rough 6 is `rough — cyanotype.html`, served by the `ll-workshop` launch config because the embedded plates make it 1.3 MB.
- **2026-10-25 · Cyanotype landed in canon** in `9a7f3d18`, on his word: *"use plate 6, perfect. lets have this be the second look for Loud'N Live."* The look is `_ops/loudon-live/design-system/looks/cyanotype.html` (the standalone, plate r06 embedded). Nothing from `plates/reference/` went into git.
- **2026-10-25 · how Cyanotype's paper was made, written down.** *"the plate was generated using GenAi, that line states. Just be clear about how the plate was made and keep it all in the history."* The look's header and the entry now say it plainly: SDXL image to image at denoise 0.55 (seed 2026102506) from an init image cut from the blank paper of Drawing Matter's photograph of Moreux's Rue Gazan cyanotype (DMC 2272.2), then tinted. `plates/PROVENANCE.md`, the recipe scripts and this README entered git in the same commit (subject: *how Cyanotype's paper was made, written down*). The plates themselves stay out of git.
- **2026-10-25 · the photograph stays out; the link is the record.** *"don't include the photo, just the link to where I got it from."* Neither Drawing Matter's photograph nor the init image cut from it is in the palace; the init image was removed from `plates/reference/`, which no longer exists, and ComfyUI's uploaded copy went too. Denoise 0.55 for plate r06 is verified from ComfyUI's run history (prompt #18, output checksum matching `plate-r06.png`). `plates/PROVENANCE.md` keeps the citation, the URL (https://drawingmatter.org/a-blueprint-is-blue/) and the init image's checksum as the record of what was used.
- **2026-10-25 · Night Signal is the third look.** *"Yes, land night signal as the third look for Loud'n Live, on night plate n01."* It came out of rough 7 (`rough — cyberpunk edm.html`) and rough 8 (`rough — night signal.html`), on *"all are a little safe and clean, get even dirtier, layer the concepts, more glow stronger rain more texture"*, *"YES, this is the kind of layered look"* and *"get some neon synth knobs above the keyboard and we are there."* The look is `_ops/loudon-live/design-system/looks/night-signal.html` (the standalone, plate n01 embedded). It landed in the commit whose subject begins *Loud'n Live's third complete look, Night Signal*, together with this workshop's making record: the roughs, the night plates as JPEG, and `plates/build_look_night.py`.
- **2026-10-25 · the look rethink closes.** *"that is all the looks we need we can close this out"*. The handoff `loudon-live-design-system-handoff-2026-10-14` closed as partial on `42dc4091` (board `close-loudon-live-design-system-20261025T151130Z`). The remainder is open as `loudon-live-design-system-remainder-20261025T151130Z`: the text catch-up to the 2026-10-14 portrait, and whether Drafting Table's own "Never cyan" goes. The baton now carries only that.
