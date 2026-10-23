---
title: "STIGMERGY — spec — rich-face pieces"
born: 2026-10-13
links:
  - target: "[[STIGMERGY]]"
    type: connects-to
    label: "spec-for"
forward_vector: "I am the design the piece-origin build follows: one origin, one contract, one process, as Loudon agreed it on 2026-10-13. I stay as written until the build makes me true, then I retire to Archive."
---

# Rich-face pieces: one origin, one contract

## 1. The problem in three sentences

Today's fix made the `sandbox` attribute the wall between pieces and STIGMERGY, and the wall holds: no piece can write to the board or reach the reader. But it also took away what pieces need: the five webcam builds on Language as a Tonal Medium can't open the camera, about 14 proofs can't read the file beside them, 5 can't keep state, and every piece has to report its own height. And the guard behind the wall still lets a page on any other localhost port write to the board, because it trusts every loopback origin (`request-guard.js:45-50, :77-79`) and Vite 6.4.3 answers preflights from any localhost port (`constants.js:144`).

## 2. The model

**Authority lives on one origin, and nothing the palace writes runs there.** STIGMERGY keeps the board and `/api/open`. The rich page stays on that origin because the companion reads its sections. Pieces run on a **piece origin** that serves files and holds nothing.

| Context | Rich page | Pieces run on | A piece can reach |
|---|---|---|---|
| STIGMERGY reader | `localhost:5173/rich/` | `127.0.0.1:8843`, a listener inside STIGMERGY | its declared files, its own storage, the devices and hosts you granted |
| Preview (replaces :8842) | `127.0.0.1:<free port>` | a second free port | the same, and never the board unless started with `--app` |
| Public site | `<site>/rich/` | the same site, opaque as today | copied files; storage in memory only, and the page says so; a camera piece opens in its own tab |

No piece reaches the board, `/api/*` or the reader. `127.0.0.1` is a different site from `localhost`, so the browser marks a piece's requests to STIGMERGY cross-site.

## 3. The piece contract

**A piece declares** what it needs in its own `<head>`. The declaration then travels with it to text figures, scrolls and the board:

```html
<meta name="piece:needs" content="camera storage">
<meta name="piece:files" content="frames.json">
<meta name="piece:net"   content="storage.googleapis.com">
<meta name="piece:size"  content="fill 4/3">
```

- **Needs** come from a closed list: camera, microphone, midi, storage, fullscreen.
- **Grants.** Camera, microphone, midi and net also need a line in `_ops/rich-face/grants.json`, written only on your yes. That list is the real gate. Once Chrome lets `localhost:5173` use the camera, every frame carrying `allow="camera"` gets it without asking, and agents write the manifests.
- **Size** is either `flow` (the piece reports its height) or `fill <ratio>` (the page sizes it from the column, which is what the webcams need).
- **Gathered proofs.** A proof nobody should edit gets a `contract` block in its manifest entry instead, and the checker marks it as owed.

**A piece includes nothing.** Every server that sends a piece injects one kit, `_ops/rich-face/kit/piece.js`, through one function, `kit/inject.mjs`: STIGMERGY's `/api/file`, the rich face's `/rich/<path>` and the public build today, and the piece origin when it comes. The kit:
- reports the piece's height
- posts `rich:play` when sound starts and suspends it on `rich:hush`
- reports errors
- prefixes storage keys
- offers `RichPiece.camera()`, which starts only on a click, stops on hush, and lets one piece hold the camera at a time

A bug in the kit gets fixed in one file instead of two hundred.

**The page guarantees:**
- Each frame is built from what was declared and granted. `allow-same-origin` is added only after checking that the piece origin isn't the page's own.
- A chip on each figure says what the piece uses.
- Every cap is named on the figure. Today `rich.html:344` silently drops a height outside 120 to 8000 px.
- Hush goes to the piece origin, not `'*'` (`rich.html:334`).
- Each figure is marked introduced, pre-contract or errored.
- The review-layer kit stays out of faces, because its notes land in storage that won't keep (`review-layer.js:96-97`).

**One resolver**, `resolve.mjs`, used by the page, the fingerprint and the build:
- `/x` is palace-absolute.
- A path with a slash is tried beside the `.md`, then at the root, then in the bundle (the order in `build-public.mjs:149-163`).
- A bare name is looked up in the bundle, then across the vault, but only if exactly one file has that name.
- Results stay inside the palace and outside `.gitignore`. The index comes from `git ls-files`, and a failure shows as a labelled box.

Flocking's three figures fail today because `findByName` matches bare names only, and only to depth 5 (`palace-find.mjs:33-38`).

**One library shelf**, `libs.json`: an exact version and an SRI hash for each library. Today 20 content files load 31 CDN scripts, none of them with `integrity`, and `d3@7` and `plot@0.6` aren't pinned to an exact version.

## 4. What STIGMERGY must change first

1. **The exact-origin guard, alone and first.** In `request-guard.js`, a write or `/api/open` passes only when the Origin's host equals Host and `Sec-Fetch-Site` is `same-origin` or absent. (`same-site` is what another localhost port sends.) `middleware.js` answers a guarded OPTIONS with 403 and no CORS headers, and `vite.config.js` sets `server.cors: false`. A census test fails on any server in `_ops/` that skips `checkRequest`; both servers there today pass.
2. **The piece server.** `piece-origin.mjs` shares a `serve-file.mjs` split out of `rich-handler.mjs` and starts in `configureServer` on `STIGMERGY_PIECE_PORT` (8843).
   - It answers GET and HEAD only, for its exact Host, with no CORS.
   - It serves only registered pieces, their declared files and the design-system folder (Flocking's pieces load `palace-tokens.js` from there).
   - It rebuilds its list of registered pieces from the manifests at boot and on a miss.
   - Each response carries the piece's CSP (shelf CDNs, plus `connect-src 'self'` and the declared hosts), CORP and `nosniff`.
   - If the port is taken, every figure says so. It never falls back to the app origin.
3. **The rich page.** `_api/resolve` returns a table of pieces, and `rich.html` builds every frame from it. The inline module (`rich.html:174`) moves to `_rich/rich.js` so the page itself can carry `script-src 'self'`.
4. **The companion frame.** `RichFaceFrame.jsx` gets `allow="camera; microphone; midi; fullscreen"` and stays same-origin, since `rich-frame.js` reads the page. `ArtifactSlot.jsx`'s frame (it has taken a piece's height, relayed play and hush, and shown its errors since 2026-10-18) moves onto the piece origin. Only after that do app-origin files get CORP. *2026-10-23: the companion frame is gone. `RichFaceFrame.jsx` and `rich-frame.js` were removed in `f67b19dd` (landed `15882875`) on Loudon's decision that the rich face opens as its own page and the companion stays on the text face. The one frame left is the piece's own, which the standalone `/rich/` page builds in `_ops/rich-face/rich.js`, taking each piece's `allow` from `grants.json`.*

## 5. The process change: no one has to remember a rule

| Where | Change | Catches |
|---|---|---|
| Enrichment v2.5 | Step 3 adds *declare*. Step 4 runs `conform.mjs "<Entry>"` on your own preview and puts its table in the commit. The postcondition requires conform to pass. | faces the ceremony makes |
| `Shop/Maker.md` | A House Standard beside "ship reviewable" (`:153`). The intake question (`:85`) asks "what does it need from its host?" | every Specialist's job |
| design-system `SKILL.md` | One hard rule pointing at the contract | proofs made outside the ceremony |
| `conform.mjs` | Static checks: declared needs against the code, pins, root-absolute URLs, addressing. Headless Chromium at 760 and 1130 px: clean console, height reported within 3 s, `rich:play` arrives, hush silences the piece | each piece as it's made |
| Sentry `rich` family | `pre-push.mjs` runs it when a push touches a manifest, `grants.json` or a named piece. build-public runs it and fails closed. | anything that slipped past |
| Enforcement tests | A file lookup outside `resolve.mjs` fails. A canary piece tries the board, the parent page, `/.git/HEAD` and an ungranted camera. | regressions |

The checker first runs over all 222 HTML files in report-only mode until its false alarms are tuned out. These canon edits are house writes, so they go through the Concierge or your yes.

## 6. Migration

A proof is a record, so it gets adopted when a face gathers it, not in a sweep. Every script shows a diff first, and only writes to a file that hasn't changed since it was read.

| Class | Count | Needs |
|---|---|---|
| Kuramoto made pieces | 3 | Their `rich:play` is sent to `location.origin` (`ensemble.html:190`, `stubbornness.html:191`, `waveform-locking.html:157`), so it never arrives once the piece leaves the page's origin. Change the target to `'*'`. |
| Kuramoto gathered explorers | 2 | Nothing. The Tone.js one is the test for hush. |
| Language webcams 01-05 | 5 | A manifest contract (`camera`, `fill 4/3`), five grant lines, and references pinned to `/Projects/Semantic Webcam/` |
| Flocking text figures | 3 | Fixed by the resolver; pin d3 and Plot |
| Proofs fetching a sibling file | about 14 | Declare `files` when gathered |
| Proofs using storage | 5, plus 2 archived | Declare `storage` when gathered |
| Content files loading from a CDN | 20 files, 31 tags | `pin-cdn.mjs` shows you a diff, then writes |
| All other HTML | about 200 | Nothing. The kit sizes and hushes them, and they're marked pre-contract. |

## 7. What breaks or gets worse

- Pages on other localhost ports can no longer write to :5173. No tracked file does that; untracked tools are unknown.
- All pieces share one origin, so any piece can read every registered file. One origin per bundle is the next step.
- Chrome partitions framed storage by the top-level site, so a piece opened on its own may not see state saved inside the face. Not checked yet.
- The camera through two nested frames is verified only in headless Chromium.
- CSP limits where data goes, not what code runs, so pinned SRI hashes are the real defense. The CSP ships report-only for one round. Whether mermaid works under `script-src 'self'` is unverified.
- 8843 is a single port, so STIGMERGY instances in worktrees need their own.
- 77 media filenames appear more than once. References that worked by luck will show a labelled box until they're pinned.

## 8. The build plan

| # | Step | Files | Test | Hours |
|---|---|---|---|---|
| 1 | Exact-origin guard | `request-guard.js`, `middleware.js`, `vite.config.js` | POST from `localhost:5174` gets 403; preflight gets no CORS header | 3 |
| 2 | One resolver | `resolve.mjs`, `rich-handler.mjs`, `fingerprint.mjs`, `build-public.mjs` | Flocking's path, an ambiguous `index.html`, a symlink out of the palace; live server and build agree | 6 |
| 3 | Piece origin | `serve-file.mjs`, `piece-origin.mjs`, `middleware.js` | exact Host, GET only, an unregistered path gets a 404 that says why; canary refused | 8 |
| 4 | Kit | `kit/piece.js`, nine fixture pieces | height correct at both widths; starting B hushes A; camera only on click | 8 |
| 5 | Page and frames | `rich.html`, `_rich/rich.js`, `RichFaceFrame.jsx` (removed 2026-10-23, `f67b19dd`), `ArtifactSlot.jsx` | a granted webcam streams two frames deep; an ungranted one is refused | 10 |
| 6 | Checker | `conform.mjs`, `rich-sandbox.test.js` | a planted case for each rule | 10 |
| 7 | Sentry and build | `sweep.mjs`, `pre-push.mjs`, `build-public.mjs` | an unpinned CDN blocks the push; a missing file fails the build | 8 |
| 8 | Preview tool with leases | `rich-server.mjs`; remove the shared 8842 entry from `.claude/launch.json` | two previews on two roots; `--stop` stops only its own | 4 |
| 9 | Migration | `libs.json`, `pin-cdn.mjs`, Kuramoto's three pieces, two manifests | `check-kuramoto-pieces.mjs` passes; conform passes | 4 |
| 10 | Canon | Enrichment, Maker, `SKILL.md`, READMEs | through the Concierge | 3 |

About 64 hours in all. Step 1 can ship today. Once step 2 is in, three lanes can run in parallel: steps 3 to 5, steps 6 and 7, and step 8.

## 9. Three decisions only you can make

1. **Who turns on the camera:** a grant line per piece, written only on your yes. *Recommend yes, per piece rather than per project.*
2. **Camera on the public site:** open the piece in its own tab, run it in place on the shared github.io origin, or buy a domain. *Recommend its own tab for now, and a domain later if public camera pieces start to matter.*
3. **Gathered proofs:** may a face edit a record to add its declaration, or does the manifest speak for it? *Recommend the manifest speaks for it; only CDN pins get edited, after you've seen the diff.*

## Answered, 2026-10-13

Loudon: "yes on the three decisions."

1. **Camera grants:** a grant line per piece in `_ops/rich-face/grants.json`, written only on his yes.
2. **Camera on the public site:** a camera piece opens in its own tab.
3. **Gathered proofs:** the manifest speaks for the proof. The page's recommendation stands: only CDN pins get edited, after he has seen the diff.

## Reordered, 2026-10-18

Loudon: "Script first." The kit (step 4) was built before the resolver and the piece origin (`5e6b6f9d`, landed in `44e7f6e6`), injected by the app origin's own servers: height, play and hush, and errors, on every served page. Its camera and storage wait for the piece origin (step 3). The Tone.js unknown (§7) is answered: the kit runs first in `<head>`, and its wrap reaches Tone.js 15.0.4's own context. Kuramoto's gathered explorer goes quiet on hush in headless Chromium (`rich-kit.test.js`).
