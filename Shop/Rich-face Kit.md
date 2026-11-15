---
title: Rich-face Kit
type: specialist
status: alive
medium: interactive
tool: "piece kit · conform.mjs · the shelf (_ops/rich-face/), and the web Specialists' starters"
tool_version: "palace-internal; piece.js as of 2026-11-09, the starters of 2026-11-14"
born: 2026-11-15
license: none (palace code)
forward_vector: "I am where every playable piece starts: a starter that already passes, the rules the frame keeps, and a checker that runs it before anyone looks. I want to be used on every piece and bettered by every maker who finds a way past me, so that what I give grows and what I require stays small."
links:
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[Enrichment]]", type: connects-to, label: every-face-maker-starts-here }
  - { target: "[[Shop/Web Audio Worklet]]", type: connects-to, label: starter-for }
  - { target: "[[Shop/Tone.js]]", type: connects-to, label: starter-for }
  - { target: "[[Shop/p5.js]]", type: connects-to, label: starter-for }
  - { target: "[[Shop/D3.js]]", type: connects-to, label: starter-for }
  - { target: "[[Shop/Observable Plot]]", type: connects-to, label: starter-for }
  - { target: "[[Shop/Three.js]]", type: connects-to, label: starter-for }
  - { target: "[[The Scroll]]", type: connects-to, label: frames-on }
tags: [specialist, shop, interactive, web, kit, checker]
---

# Rich-face Kit

*Exists because every face maker already started here, and it was not in the Shop. Loudon, 2026-11-15, on making it a page: "yes, again using this must not constrain what a future model does, we must keep open the ability to use new features!"*

## Charter

I am the floor under every playable piece, the web page that sits in a rich face or on a scroll. I give a maker three things: a starter for each web Specialist that already passes, the rules the frame keeps, and a checker that runs the piece headless before anyone looks. What a piece is made with belongs to the Specialist it is made with. What it shows belongs to the face, by [[Enrichment]].

**I am a floor, not a ceiling.** What I require is the house's: what the frame lets in, what a piece declares, sound only after a click. How a piece is built is the maker's. A maker who can do better outside the starter, with a newer library, a browser feature I don't name, or a method no page here knows, does so. They leave the comparison, the starter's way against theirs, on my scroll, and the better way becomes what I give.

*The card: what a maker reads before choosing me, and what `node Shop/shop.mjs menu` prints. Tried 2026-11-15: Run, Speed and Checked by were run on my two test proofs and the 2026-11-14 starters; Best used for, Not yet shown to hold, Not my purpose, Wears and Hands on were read from this page, the kit's README and my ledger. A line that proves wrong is fixed here.*

**Best used for, so far:** Starting a playable piece and checking it before anyone looks. Every face maker of the 2026-11 Enrichment round (87 faces) started from the kit's README and its checker. Six starters, one per web Specialist, passed `conform.mjs --browser` on 2026-11-14. On 2026-11-15 a piece played a second file it declared (a wav) from a real piece origin, headless.
**Not yet shown to hold:** The checker's browser pass frames every piece opaque, so it cannot check a piece that declares a file or a need: it reports their fetches as blocked (seen 2026-11-15). A second file has not yet been heard on Loudon's own scroll. No phone, Firefox or Safari has run a piece through the kit. The checker's enforce switches are off, so a failing piece still lands.
**Not my purpose:** What a piece is made with goes to the Specialist it uses (Tone.js, Web Audio Worklet, p5.js, D3.js, Observable Plot, Three.js). What a face shows and when goes to [[Enrichment]]. Hosting outside the palace, and a page that is not a piece (an app shell, the renderer), are not mine.
**Run:** Copy the starter on the card of the Specialist you are making with, from `Shop/<Specialist>/proofs/2026-11-14-card-check/`. Declare what it needs in its own `<head>` (`piece:needs`, `piece:files`, `piece:net`, `piece:size`). Load libraries from the shelf (`node _ops/rich-face/pin-cdn.mjs <file>` writes the tag; `--add <url>` shelves a new one). Then, from the palace root: `node --experimental-vm-modules Shop/Maker/web-smoke.mjs <file>` and `node _ops/rich-face/conform.mjs <file> --browser`.
**Speed:** Measured on the Mac: conform --browser 1.8 to 2.8 s a starter at two widths (2026-11-14); web-smoke 0.1 s. My proof checks, each starting a piece origin and headless Chromium, ran in a few seconds each (2026-11-15).
**Checked by:** `conform.mjs --browser` checks a clean console, a reported height, no sound before a click and quiet on hush, for a piece that declares nothing. A piece that declares a file or a need is checked on a real piece origin: `Shop/Rich-face Kit/proofs/2026-11-15-second-file/check.mjs` is the worked harness. `check-hidden-hush.mjs` and `check-time-cap.mjs` check the kit itself. Only an ear or an eye judges the piece.
**Wears:** Whatever the piece wears: the starters link the Loudon Live Design System's `colors_and_type.css` and style with `var(--token)`, and the piece origin serves the design-system folder to every piece undeclared. Nothing of my own.
**Hands on:** I hand on a starter and a checker's report: errors, warnings and what the browser saw. I need the piece's file and the Specialist it is made with.

## What the kit gives

- **The starters.** One per web Specialist, made 2026-11-14, each the smallest piece that passes: sound only on a click, tokens from the design system, a library from the shelf, a seam a headless check can reach (`window.STARTER`, `window.__sketch`, `window.__scene`, `const WORKLET`). Each Specialist's Run line names its own.
- **The piece kit** (`_ops/rich-face/kit/piece.js`), injected by every server that serves a piece, so a maker writes none of it: the frame's height, one voice at a time, hush, quiet on a hidden page, a minute cap on an untouched sound (`RichPiece.hold()` and `RichPiece.capAfter(s)` for a piece meant to run long), errors to the page, storage kept per piece, the camera only on a click, and a piece's question handed to its section's note box.
- **The shelf** (`_ops/rich-face/libs.json`): every library at an exact version with its hash. A new version goes on with `pin-cdn.mjs --add`, which shows the diff before it writes.
- **The checker** (`_ops/rich-face/conform.mjs`): declarations against code, pins against the shelf, and the browser pass at 760 and 1130 px. Report-only.
- **Harnesses for what a script can measure:** `Shop/Web Audio Worklet/Web Audio Worklet — rich — check.mjs` (a processor in Node and in an `OfflineAudioContext`), `_ops/rich-face/check-kuramoto-pieces.mjs`, and my proofs' `check.mjs` (a piece framed on a piece origin of its own).

## What the frame requires — house facts

These are the house's, not technique. They change by Loudon's word and the kit's spec (`_ops/rich-face/README.md` § What the page lets run), not by a maker's taste.

- A piece runs on the piece origin, sandboxed, and gets only what it declares in its own `<head>`. Undeclared, a file beside it is not served (shown 2026-11-15: an undeclared file answered 404 in the frame).
- Camera, microphone, midi and every outside host also need a line in `grants.json`, written only on Loudon's yes.
- A library from a CDN loads at an exact version with its SRI hash, from the shelf.
- No sound before a click. The kit does the hush and the cap; a piece adds no `visibilitychange` handler of its own.
- A face's files are named `[Entry] — rich — <what>.html`. A test proof's files are plain ASCII, no em-dash (the test scroll brief, 2026-11-15).

## Gotchas

- **A code comment that names `rich:hush` makes the kit leave hush to the piece.** Don't write the word in a comment. (Enrichment round, 2026-11.)
- **A detached `new Audio()` sends no `rich:play`**, so starting it doesn't hush other pieces. Put media in the page, or play through an AudioContext. (Enrichment round, 2026-11.)
- **The checker's browser pass frames a piece opaque even when its plan gives it an origin.** A declared file then reads as `sandbox-blocked`; check such a piece on a piece origin instead (my second-file proof does). (2026-11-15.)
- **A module worker from a Blob URL fails in an opaque frame and works in a same-origin one.** A piece that needs one declares something that gives it an origin. (2026-11-15, Chromium 147 headless.)

## Test Suite

The open tests are in `Shop/Rich-face Kit/tests/test-plan.md`; the proofs are on my scroll, `Shop/Rich-face Kit/Rich-face Kit — scroll.md`; what each run taught is in `Shop/Rich-face Kit/Rich-face Kit — tuning.md`.

## Forward Vector

To be the place every piece starts and no piece is held. Each time a maker goes past me and says how, that way becomes a starter.
