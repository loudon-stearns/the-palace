---
title: README
born: 2026-10-18
links:
  - { target: "[[STIGMERGY]]", type: connects-to, label: proof-for }
forward_vector: "I hold the scripts behind the 2026-10-18 scroll census and its headless walks, so the count that says every linked web page on a trail plays in place can be run again when scrolls grow, and the walks when the deck changes."
---

# Scroll census, 2026-10-18

On 2026-10-18 the deck learned to find and play the web pages written into a scroll's trail, in whatever form the scroll's many authors wrote them. These four scripts are the checks behind that: a census over every tracked scroll, and two headless walks of one scroll in a browser. Each is read-only. None touches the live deck. ([[The Scroll]] is the entry that describes the trail.)

## What each one checks

**`scroll-census.mjs`**, the first pass. For every tracked `— scroll.md`, it runs the deck's own parser (`_ops/stigmergy/app/src/lib/scroll-view.js`) over the trail and counts the web pages the deck would play. Then it counts the `.html` references in the same text that the parser did not lift, and says why: a space in the path, an `open:` link, an `obsidian://` link, a path in backticks with no link. It compares each written path to the lifted one as it stands, so it shows the gap that link lifting had to close.

**`scroll-census-main.mjs`**, the second pass. The same count, but it resolves each written path the way the deck does (`palacePathOf`), and it checks that every page the deck plays is on disk. It reports `missingOnDisk` only when something is missing, so no such key means none.

**`scroll-kit-walk.mjs`**. Opens the Dissolutions scroll in headless Chromium and walks its two heavy proofs. For each it records the frame's height against the page's own content height, whether the piece kit loaded in the frame, and whether an error showed. Then it presses Play inside the first proof and reports whether the deck heard the `rich:play` event.

**`warmth-shot.mjs`**. Opens the same scroll, reads the hero backdrop's background image and the plain lines under Plan and Standing Orders, and saves a screenshot. Warmth was built on the branch `claude/scroll-warmth` (e9ab3a11) and merged to main in 06a79f3c. Run it against a tree from before that merge and it finds no backdrop and no lines, and prints `null` and an empty list. That is the walk reading true, not a failure.

## Running them

The census needs only Node and the palace.

```
node scroll-census-main.mjs <palace-root> <board.jsonl>
node scroll-census.mjs <palace-root> <board.jsonl>
```

`<board.jsonl>` is the persistent board (`_ops/swarm/persistent/blackboard.jsonl`), or a copy. The census only reads it. The messages on it are what most trail cards are built from, so a run without them would undercount. It has to be named, so a run never reaches a board by default.

The walks need a **scratch deck**, never `:5173`:

```
node scroll-kit-walk.mjs <palace-root> http://127.0.0.1:<port> <out-dir>
node warmth-shot.mjs     <palace-root> http://127.0.0.1:<port> <out-dir>
```

Start the scratch deck with Vite's `createServer` from `<palace-root>/_ops/stigmergy/app`: `PALACE_ROOT` at the tree to read, `STIGMERGY_STUB_WORKER=1`, its own `cacheDir`, and a port you picked first and passed with `strictPort: true`. A port of `0` takes 5173 beside the live deck; the gotcha "A scratch Vite given `port: 0` takes 5173" says why (`_ops/stigmergy/app/README.md` § Testing, worktree & topology gotchas). Both walks refuse `:5173` and any host that is not loopback. Playwright's Chromium has to be installed (`npx playwright install chromium` from the app folder). Both walks name proofs and a scroll that live in this palace: the Dissolutions scroll, and the two pages under `Dissolutions/proofs/2026-10-18-one-curve-three-doorways/`.

## What it found

Run on main at 06a79f3c (the same numbers read at 382c9e1d, before warmth merged), the second pass reads:

- 51 tracked scrolls, 25 of them with web pages on their trails.
- **138 linked pages play in place.** 127 of those sit on cards built from a board message.
- **All 138 are on disk.** No `missingOnDisk`.
- Two references are not lifted, both a page named in backticks with no link (Project Stewardship System, Shepard Tone Synthesizer). There is nothing for the deck to lift.

The first pass on the same tree shows the gap the lifting closed: 22 `open:` links and 7 `obsidian://` links it cannot match to a lifted path (it labels those 7 "a web URL"), and the same 2 backticks. The parser's own comment records the starting figure: 39 web pages on 16 scrolls missed the trail for their written form alone (the comment above `palacePathOf` in `scroll-view.js`).

The counts move as scrolls grow. Run the second pass again before quoting them.

The walks' output was read in the session that wrote them and is not filed here.
