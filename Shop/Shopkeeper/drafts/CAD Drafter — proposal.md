---
title: "CAD Drafter — proposal"
born: 2026-10-20
links:
  - { target: "[[Shopkeeper]]", type: connects-to, label: proposal-from }
forward_vector: "I carry the CAD Drafter from the Shopkeeper's drafts to the Shop: what an elder does to land it, in order, and the words for the pages it touches. I want to be deleted the day it lands."
---

# CAD Drafter — proposal

A child session ran the Shopkeeper's CAD commission on 2026-10-20 ([[Shopkeeper — baton — CAD]]) and could not write the house. This note is what it hands the elder who lands the work. The evidence is `Shop/Shopkeeper/probes/2026-10-20-cad/probe-report.md`.

**Loudon's yes so far (2026-10-20, relayed by the supervising session in his words):** "Yes: the Shopkeeper's loop fits a brief on the line proposed. The commission names the gap, the drawings stay probes, and the Handwheel's real drawings become the new Specialist's first job through the Maker. The three defaults stand." The three defaults: both 2D sheets and 3D files; text-first source; calipers, a scale and a printed fit test verify a fit, not an agent. Minting the Specialist as a stub is the landing's own yes.

## To land the Specialist (on Loudon's yes)

1. **Check the claims at their source** and name each in the commit body, as AuK's landing did (`94ac3e88`):
   - `tool_version`: `build123d==0.13.0` on `cadquery-ocp-novtk 8.0.1.1.0`, from the venv's package metadata.
   - `license`: build123d Apache-2.0 and the OCP bindings Apache-2.0 were read from package metadata. **OpenCASCADE's LGPL-2.1-with-exception is from general knowledge; the child did not read OCCT's license file.** Read it, or soften the field.
   - The motor numbers in the probe: the iFlight GM5208-12 page, read 2026-10-20 (Ø63 ±0.05, 30.7 ±0.2, shaft Ø15 −0.008/−0.012 and Ø12 +0.05/0, 209 ±0.5 g, runout ≤ 0.1; no bolt patterns).
2. **Move the entry:** `Shop/Shopkeeper/drafts/CAD Drafter — draft.md` → `Shop/CAD Drafter.md`, and add `type: specialist` under `title:`. Nothing else in it should need reshaping.
3. **Move the test plan:** `Shop/Shopkeeper/drafts/CAD Drafter — test-plan — draft.md` → `Shop/CAD Drafter/tests/test-plan.md`.
4. **Add the host row** to `Shop/Maker/host-capability.json`, beside AuK's:

       "CAD Drafter": { "medium": "other", "requires": ["build123d-venv"], "hosts": ["mac"], "fallback": null, "fallback_note": "STUB — not yet dispatched on a real brief. Exact solids and dimensioned SVG sheets from text (build123d 0.13 on OpenCASCADE), CPU only; the venv is made per worktree, never committed. FreeCAD 1.1 on the mac opens its STEP files. Sandbox untested. See [[CAD Drafter]]." }

5. **Regenerate the roster:** `node Shop/Maker/build-roster.mjs`. Without it the drift check fails (`Shop/Maker.md:284`).
6. **Leave the sheet module where it is.** `drawing.py` stays in the probe until the first job, when it moves to `Shop/CAD Drafter/` as the Specialist's own tool. A stub carries no tools; AuK's didn't.
7. **Retire the baton:** delete `Shop/Shopkeeper/Shopkeeper — baton — CAD.md`, remove the `## Active Baton` section from `Shop/Shopkeeper.md`, delete this proposal, and close the card: `node _ops/stigmergy/close-handoff.mjs shopkeeper-cad-handoff-2026-10-20 --commit <landing hash>`.

## Words for the house (each its own yes)

**A. The Shopkeeper keeps the line Loudon drew.** `Shop/Shopkeeper.md` § Charter, after "I make to *learn the tool*, which is a different and more playful thing." (`:50`), add:

> A commission is the one exception, and it has a line. When Loudon names a gap and hands me a brief's own parts, I probe on them, and what I make stays a probe. The brief's real work becomes the new Specialist's first job, sent through the [[Maker]]. (Loudon, 2026-10-20, on the CAD commission.)

*Why:* the page says the Shopkeeper never makes for a brief, and this commission was a brief. The baton left the question to Loudon and he answered it. Without these words the next commission asks it again.

**B. The Maker routes a part that must fit.** `Shop/Maker.md` § Selection Heuristics (`:89`), after the LaTeX line, add:

> **A part that must fit something** (a cap on a motor, a block under it, a bracket, a jig) → **[[CAD Drafter]]**. Exact solids and dimensioned sheets from a dimensions file whose every number names its source. Not for looks: a render of the same part goes to [[Shop/Blender]], fed the CAD Drafter's STL.

*Why:* without a heuristic the Maker has no road to the new Specialist. AuK's landing left this to a separate card (the Concierge's reading); so does this.

**C. The Technical Diagram Standard gains a fifth kind.** `_ops/Technical Diagram Standard.md` § The Decision Rule (`:34`, "The palace draws four kinds of things"), make it five, adding after the LaTeX paragraph:

> **build123d — mechanical parts.** Anything that will be printed, cut or bolted: dimensioned sheets and exact solids, from a Python dimensions file whose every number names its source. The [[CAD Drafter]] holds it. It passes the same test as LaTeX: the source is plain text, and the sheet's numbers are SVG text a diff can show.

*Why:* the baton found the Standard's test was the right one for a CAD choice (`:50-56`), and the probe passed it. Optional; the Standard is `_ops` and may prefer to stay about diagrams.

## Not here

The probe's two findings for the [[Haptic Handwheel]] (a skirted cap as the bench's disc reads the rotor inertia about 15 % low; two different motor masses) go to that project's own session through the supervisor, by Loudon's direction. This commission edits none of its files.
