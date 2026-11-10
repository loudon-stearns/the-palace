# Maker brief — proposal round of Enrichment, 2026-11-03

You are one maker in a fan-out. Many pages are being enriched at once, one maker per page. You make ONE page's rich face, at depth, in your own worktree, and you do not land it: a challenger reads your work next, and you will be resumed with its verdicts.

Palace root (Loudon's folder, the owner): /Users/loudonstearns/Documents/The Palace
Never edit, commit or run git in the owner's folder. Everything you make lives in your worktree.

## 0. Worktree

From the owner's folder run:
  node _ops/worktree/new-worktree.mjs --name enrich/<slug> --profile stigmergy
(slug = your page's title, lower-case, spaces to hyphens, ASCII only). It prints the worktree path (../palace-enrich-<slug> beside the owner). cd there. All reads of the ceremony and all writes happen in the worktree. If node_modules links are missing there, run the same command with --dry-run, read the links it lists, and `ln -s` each one by hand.

## 1. Read first, in this order

- Enrichment.md (the ceremony, v2.8 — the proposal round is now in the spec)
- Enrichment/Enrichment — tuning.md (the tail read: items 1–11; item 11 is last round's, read it whole)
- Enrichment/Enrichment — scroll.md § Standing Orders, whole: Loudon's orders on play first, on data visualization, and his words on the hook. Then open the two roughs in `Palace development/Pheromone Trail/proofs/2026-11-09-ants-on-topology/`.
- _ops/rich-face/README.md, whole, especially § The manifest, § Media a face plays, § What the page lets run, § Making pieces
- Kuramoto Coupling/Kuramoto Coupling — rich.json and two of its made pieces (the model)
- Loudon Live Design System.md (the house dress for anything the public face shows; equations appear twice, symbols and words)
- Progressive Staging.md (a piece opens on one concept alone and walks up to its test)
- Your page, whole, then its bundle folder, then your nomination record (the path is in your task). If the page or its bundle has an active baton (a `— baton` file or an "Active Baton" section), read it before making: a baton that renames headings strands the face.

## 2. Make — Enrichment steps 1 to 5, with these settings

- Gather first. Lay the bundle's existing proofs, renders and sounds beside the sections they serve before making anything new. A gathered file git doesn't track (ignored media) is copied into the bundle under `rich-face/` and committed, per README § Media a face plays; keep any file under 25 MB; never copy Splice or other licensed samples.
- Walk every section and ask what can only be shown, heard or played there. Prefer a piece that TESTS the section's claim. A piece with nothing to test and nothing to make felt does not ship. Fewer, better.
- Every made piece walks up: it opens on one concept alone and reaches the test last. The test is the last step, not the first.
- Tier: your call for the whole page, named in the manifest. Sketch is the default tonight; Study when the bundle already carries most of the pieces.
- Pieces are single self-contained HTML files, `[Entry] — rich — <what>.html`, each declaring what it needs in its own `<head>` (README § What the page lets run). Libraries only from the shelf (`_ops/rich-face/libs.json`; `node _ops/rich-face/pin-cdn.mjs <page>` writes the tag). Sound starts only on a click; use the kit's hush and time cap, nothing of your own.
- Verify what can be verified: run each piece's engine against the claim it makes; `node _ops/rich-face/conform.mjs "<Entry>"` and keep its table for the commit; `node _ops/rich-face/fingerprint.mjs "<Entry>" --stamp "<Section>"` for each section you made, by name, never bare. Load the page with `node _ops/rich-face/rich-server.mjs --root <your worktree> --detach` and `?entry=<Entry>`, read the console, then `--stop`.

## 3. The proposal state (new in v2.8; write exactly this shape)

In `[Entry]/[Entry] — rich.json`, every section you make carries:
  "status": "proposal",
  "proposed": { "date": "2026-11-03", "by": "maker · <model> · proposal round", "round": "proposal-round-2026-11" }
The manifest's top level carries:
  "offers": [ { "section": "<heading>", "kind": "no-claim-edit" | "claim-change", "what": "<one or two sentences>", "status": "open" } ]
That list is where Enrichment step 6 goes during a proposal round. You never write the page's .md. A unit to fix, a symbol to rename, a claim the piece showed wrong: all of it becomes an offer, with what the piece showed. The nominators flagged possible text errors on some pages; if your piece can test one, test it and record the result as an offer, with the measured numbers.

## 4. Commit in the worktree, do not land

  node _ops/stigmergy/app/scripts/palace-commit.mjs --kind enrich --scope "<Entry>" --summary "<what> — <tier> · proposal" --verify unverified --body "<...>" --path "<every file you made or copied>"
The body names: the ceremony version you ran under (2.8), each piece and the claim it tests, conform's table, what was and wasn't verified (an agent can't hear the mix), and every offer. Use --verify verified only if conform is clean and every engine check passed. Commit everything; leave nothing unsaved. Do not run palace-land. Leave the worktree in place.

## 5. Return, compressed (under 300 words)

Branch, worktree path, commit hash. Tier. Each section made: its pieces, what each tests, and whether it walks up. Conform: clean, or each line and why it stands. Offers, in full. What you could not verify. Nothing else; the mess stays with you.

## 6. Lessons from the first round (tuning item 11 — carry every one)

- A blind test states its chance level and its verdict rule BEFORE the first trial, scores both arms of a comparison, and is checked for leaks and confounds: could a reader who knows the page's inputs pass by length, spelling or level without the thing under test? Does the pair differ in anything besides the variable (register, loudness, duration)? Match loudness; say how you matched it.
- A piece that refutes the page must first build the situation the page describes. Two maker refutations last round were overturned by the challenger because the maker tested something other than the page's claim.
- A measurement goes through the project's own chain (a mono fold-down misstated a balance by 4 dB). Use the bundle's own renders and settings where they exist.
- A test must be able to fail. The null that found a real bug in its own delay line is the model: run the null, print the number, and say what number would have meant failure.
- The parser opens sections at `##` only: a page with one `##` and many `###` is one section, one stamp, one all-or-nothing approval. Prefer the page's own `##` grain and say so in the manifest when the grain is coarse.
- Kit: no code comment that names `rich:hush` (the kit then leaves hush to the piece); no detached `new Audio()` (sends no `rich:play`); conform's opaque frame reports sandbox-blocked fetches that work on the live face — keep with a note if the live face loads them. The public sandboxed frame can't read pixels; bake numbers in.
- Write the run line in your commit body: `run · 2026-11-03 · v2.8 · <Entry> — <tier> · proposal`.
- Fewer, better. The nomination record is a starting read, not an order: drop a piece that turns out to have nothing to test.
