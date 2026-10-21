---
title: "STIGMERGY — baton — rich-face pieces"
born: 2026-10-13
links:
  - target: "[[STIGMERGY]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[STIGMERGY]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: STIGMERGY — rich-face pieces

## Move

The rich-face piece build has landed: five landings, the last the migration (`3b0744c8`, 2026-10-21). What remains is words and a decision, as the board card `stigmergy-remainder-20261021T125648Z` states it: the design-system `SKILL.md` words and the design-system pins, both for Loudon's own [[Drafting Table Design System]] session; [[Enrichment]] tuning item 8; whether to post one propagate flag carrying the new piece rule to the pages that restate the old one; the three pre-existing `file-missing` errors; and, at the close, retiring the spec page to Archive as its own vector says. The plan was [[STIGMERGY — spec — rich-face pieces]], the design Loudon said yes to on 2026-10-13; this baton does not restate it.

## Why this move matters

The build turned the piece contract from a rule to remember into a process (spec § 5): a piece declares what it needs, the checker reads it, the Sentry and the build run the checker, and the ceremony and the Maker ask for it. Three pages still state the rule the way it was before the contract — one self-contained file, nothing fetched, no storage — and a maker who reads one of them builds to the old rule. Loudon, 2026-10-18: "I don't want a one off solution, we need a general solution." The words left are the last places the old solution is still written down.

## Tried and rejected

- **Grant the five webcam pieces now and baton the second origin.** A per-piece patch; Loudon asked for the general model instead.
- **Trust every loopback origin**, as the old guard did. The exact-origin check replaced it.
- **Give a piece frame `allow-same-origin` while the piece is served from the app's own origin.** That voids the sandbox; the page adds the flag only after checking the piece origin isn't its own.
- **Edit a gathered proof to add its declaration.** The manifest speaks for it. Only CDN pins get edited, after Loudon has seen the diff.
- **Edit Kuramoto's three pieces to post `rich:play` to `'*'`.** Not needed: the kit posts `rich:play` itself when a piece starts a sound (`_ops/rich-face/kit/piece.js:130`), so the pieces' own posts to `location.origin` are moot; they stay unedited, as gathered proofs do, and `check-kuramoto-pieces.mjs` passes (`2422b4f1`).
- **Force-track a steward's render a face needs (`git add -f`).** The committer's plain `git add` refuses an ignored path, and a forced take would ride into every later cycle commit; the convention is a copy in `<bundle>/rich-face/` (`680f6a4f`).
- **Start the preview's piece origin on port 0.** Lane A's patch; the preview leases the second port instead, so `--list` shows both and `--stop` reaches both (`c3cd2fab`).
- **Recreate the worktree the board card inherited** (`close/2026-10-13-handoffs`). It was merged and removed on 2026-10-13; the new card names it again, and it is still not to be recreated.

## Current state

*As of 2026-10-21, after the migration landed. Five landings, each with `palace-land` on Loudon's yes:*

1. **`1120af80` — the piece origin (steps 3 to 5).** `piece-origin.mjs` listens on `127.0.0.1:8843` beside STIGMERGY's 5173 and serves only registered pieces, the files they declare and the design system; the kit; the page and the deck frame each piece from its plan with chips, a named cap and the errored mark; `rich.html`'s module is `rich.js` and the page carries `script-src 'self'`.
2. **`3aa72219` — preview leases (step 8).** A loopback port is leased to one agent at a time by a kernel lock (`_ops/commons/port-lease.mjs`); `rich-server.mjs` leases its port; the shared 8842 entry is gone from `.claude/launch.json`; `scratch-vite.mjs` runs a scratch STIGMERGY over a throwaway palace.
3. **`bbc0ca71` — the checker and its gates (steps 6 and 7).** `conform.mjs`, static and in headless Chromium; the Sentry's rich check at the sweep and at push; `build-public.mjs` runs it on each published face. **Both gates report and never block** (`_ops/rich-face/conform.json`: `enforce.push: false`, `enforce.build: false`, Loudon's word of 2026-10-20; turning either on is his call).
4. **`680f6a4f` — the local-only rule.** The live page plays a file git does not track and chips it `only on this Mac`; the public build plays only what git tracks and boxes the rest; a take a face needs is copied into `<bundle>/rich-face/`, which `.gitignore` keeps (`:85-86`), and committed; `untracked.mjs` lists what is left with the step for each. Home: `_ops/rich-face/README.md` § Media a face plays; propagate flag `commons-the-palace-1792557681212` on WEAVE.
5. **`3b0744c8` — the migration (step 9) and the canon (step 10)**, session stigmergy-remainder, 13 commits. The standalone preview leases `['page','piece']` and runs a piece origin of its own (`c3cd2fab`). `pin-cdn.mjs`, the shelf's one writer, shows a diff and a digest and writes only that (`f343a932`); `libs.json`, 17 libraries at exact versions with SRI hashes (`fca09879`); 57 CDN tags in 35 pages pinned to it on Loudon's look at the diff (`036f9a27`; the diffs kept in `STIGMERGY/proofs/2026-10-21-pin-cdn/`). The five Semantic Webcam builds on [[Language as a Tonal Medium]] carry a manifest `contract` (`camera`, `fill 4/3`, their files at `/Projects/Semantic Webcam/`; `2422b4f1`) and a grant line each in `grants.json` on his yes (`b2629ad2`). The checker's `file-local` rule (`1860515e`): every file a face names or a piece declares or loads that git doesn't track is a warning carrying the step that tracks it, and in a build a miss this Mac can fill is filed under it. The canon, placed by that session's Concierge on his yeses: [[Enrichment]] v2.5 (step 3 declares; step 4 runs `conform.mjs` on the entry and puts its table in the commit; `37853d97`), [[Maker]] (the intake asks what a piece needs from its host; the House Standard "A web piece declares what it needs from its host"; `bcef6973`), [[Sentry]] v1.6 (`7ec883c4`), and the rich-face and STIGMERGY READMEs (`43c5acde`, `cddf5eee`).

**What the tree does now.** Both faces pass the checker ([[Kuramoto Coupling]], [[Language as a Tonal Medium]]) and the rich suite runs 235 of 235 (the old card's close). Kuramoto's three pieces stay unedited: the kit carries their playing signal. [[Generative Sample Libraries]] and [[Inharmonic Wavetable Synthesis]] need no tracking until a face names their renders: neither has a manifest, and the 557 `file-local` warnings the checker reads over the palace are nearly all GSL's ai-source-probe pages loading ignored renders no face shows (`1860515e`); a piece no face shows is told it needs a face first. Not built, by the record: spec § 5's enforcement test that fails a file lookup outside `resolve.mjs` (`scroll-view.test.js` tests `palacePathOf`, the fourth lookup, and forbids nothing); the canary piece has its test (`rich-pieces.test.js`). The card does not name it; it is written here so the spec's row reads as open, not forgotten.

**What remains, as the card states it:**

- **The design-system `SKILL.md` words.** `_ops/loudon-live/design-system/SKILL.md:37` — "A web piece stands alone … everything inline, no `fetch` of a file beside it, no storage" — is the rule as it was before the contract; spec § 5 wants one hard rule there pointing at the contract (`_ops/rich-face/README.md` § What the page lets run). That folder is Loudon's: left for his own [[Drafting Table Design System]] session, on his word of 2026-10-21 ("Leave the design-system pins for my own session").
- **The design-system pins.** `STIGMERGY/proofs/2026-10-21-pin-cdn/design-system-pins.diff`, digest `eefadf0589d8`: 6 tags in the five design-system pages (`assets/logo-lissajous.live.html`, `preview/card-gen-lissajous-bundle.html`, `preview/categorical-palette.html`, `slides/brb.html`, `slides/stream-ended.html`). Same session, same reason. To write after his yes: `node _ops/rich-face/pin-cdn.mjs <those five pages> --write eefadf0589d8`; a page changed since gives another digest and nothing is written — run it again and show the new diff.
- **Enrichment tuning item 8** (`Enrichment/Enrichment — tuning.md:47`): a bare `--stamp` re-stamps a section held drifted on purpose; step 5 should stamp by section name whenever any section is held. v2.5 landed without it (`37853d97`: "still owed").
- **The propagate-flag decision.** Three pages restate the old rule: `The Scroll.md:74` ("A web page runs sandboxed, so make it one self-contained file"), `_ops/orchestrator/prompts/shared.md:605` — a steward prompt — ("HTML runs in a sandboxed iframe … so it must stand alone"), and `SKILL.md:37` above. One propagate flag (`python3 -m commons propagate`, from `_ops/`; [[SCHEMA — Reference]] § 9) would carry the new rule to them on Loudon's yes, with the README section as its home; or each is reworded as it is next touched. Not decided.
- **Three pre-existing `file-missing` errors**, in gathered proofs no face shows, there since the first census (`STIGMERGY/proofs/2026-10-20-conform-census/census.md:435,441,572`) and still on main: `Projects/BLUELINE/proofs/m1-animatic/m1-animatic.html` and `…/m2-motion-comic/m2-motion-comic.html` each load a `storyboard.json` the palace lacks; `Projects/Quantum Synthesizer/quantum-synthesizer-demo-01.html` loads `quantum-membrane.js`. Report-only; nothing blocks on them. Their owners are [[BLUELINE]] and [[Quantum Synthesizer]], not this build.
- **Retiring the spec page.** [[STIGMERGY — spec — rich-face pieces]] says it stays as written until the build makes it true, then retires to Archive (its `forward_vector`). That is the close's move, once the words above are placed.

## Next move

In this order:

1. **Loudon's own Drafting Table session** writes the `SKILL.md` rule (one hard rule in place of `:37`, pointing at the contract) and the design-system pins (`--write eefadf0589d8`). His folder, his session; this catcher writes neither.
2. **Enrichment tuning item 8:** step 5 stamps by section name whenever a section is held. A spec change, so Enrichment's version moves and item 8 is marked paid — through the Concierge and Loudon's yes.
3. **The propagate-flag decision:** put the three lines to Loudon. On a yes, post the flag from `_ops/` with `--home "_ops/rich-face/README.md § What the page lets run"` and the three pages as its scope; on a no, reword each as it is next touched.
4. **The three `file-missing` errors:** fix the missing files, or leave them standing and named — Loudon's call, told to their owners.
5. **At the close:** `git mv` the spec page to `STIGMERGY/Archive/`, naming both sides to the committer; close the card against the commit; this baton goes with it, and STIGMERGY.md's Active Baton section too.

## Receiving environment

Claude Desktop or Claude Code on the Mac, in a worktree of its own (`node _ops/worktree/new-worktree.mjs --name claude/piece-origin-<what> --profile docs`, or an app worktree under `.claude/worktrees/`). Never the owner tree. The card still names the coordinate it inherited, `close/2026-10-13-handoffs` at `/Users/loudonstearns/Documents/palace-close-2026-10-13`; it was merged and removed on 2026-10-13 and is not to be recreated. Before any merge, `git merge-tree --write-tree main <branch>` comes back clean; land with `palace-land` on Loudon's yes. The design-system words and pins are Loudon's own session's, not this catcher's.

## Calibrations from this session

- **Loudon's three answers, 2026-10-13: "yes on the three decisions."** (1) Camera: a grant line per piece in `_ops/rich-face/grants.json`, written only on his yes. (2) Public site: a camera piece opens in its own tab. (3) Gathered proofs: the manifest speaks for them; only CDN pins get edited, after he has seen the diff.
- **Loudon, 2026-10-18:** "Script first." and "I don't want a one off solution, we need a general solution." The second is the test every remaining step answers to.
- **Loudon, 2026-10-20:** the gates report and never block — both `enforce` switches stay off until he turns one on.
- **Loudon, 2026-10-20:** the local-only rule, as the Current state has it.
- **Loudon, 2026-10-21:** "Yes to all, as recommended: write the 35-page pins (digest 7e91875caa65), the five webcam grant lines, and have the Concierge place the canon drafts with Q1 = errors named in the commit and Q2 = the Review Layer clause on Maker:157. Leave the design-system pins for my own session." Q1: a face's commit names each checker error and why it stands. Q2: a piece made for a rich face leaves the review kit out; the face carries the review surface.
- A pin is written only to the digest Loudon saw; a page changed since yields another digest, and nothing lands until he has seen the new diff.
- The canon edits are house writes. They go through the Concierge and Loudon's yes.
- Preview on a leased port, never 8842 or 5173: `node _ops/rich-face/rich-server.mjs --root <palace>` prints its address, and its pieces run on a second leased port; `scratch-vite.mjs` for the whole app over a throwaway palace. A reused port keeps the last preview's browser storage (`71da684a`). Never POST to the live :5173 from a script or a test; revert any temporary `launch.json` entry before a commit.
- No `app/server/*` or steward-prompt edits while a steward is live; hold the live server's restart until every server-side change has landed, so it restarts once.
- Lane B's lesson: a planted case can stop tripping because another lane's work began answering it. Re-plant the case; don't loosen the check (`f9d6a90d`).

## Load these files first

1. The board card: `node _ops/stigmergy/pickup-handoff.mjs stigmergy-remainder-20261021T125648Z` prints what moved since it posted, then claims it.
2. `_ops/rich-face/README.md` as landed — § Media a face plays, § What the page lets run, § Making pieces.
3. The three pages that restate the old rule: `_ops/loudon-live/design-system/SKILL.md:37`, `The Scroll.md:74`, `_ops/orchestrator/prompts/shared.md:605`.
4. `STIGMERGY/proofs/2026-10-21-pin-cdn/README.md` and `design-system-pins.diff`; `_ops/rich-face/pin-cdn.mjs`, whose header is its usage.
5. `Enrichment.md` steps 3 to 5, and `Enrichment/Enrichment — tuning.md:47`.
6. [[STIGMERGY — spec — rich-face pieces]] § 5 and its `forward_vector`, for what the close retires.

## On pickup (fixed — the catcher's checklist; do not rewrite per session)
*Identical in every baton. It rides along because the catching Claude loads the
baton and the entry, not this ceremony — so the catcher's obligations live where
the catcher will see them. Omit nothing here.*
A pickup has two beats: **claim** it when you catch it, **close** it when the move lands. The card stays visible in between — a claim that ages with no close is how a dropped baton (a "fumble") surfaces instead of vanishing. (A parent-entry baton that was never announced on the board has no card; skip the board posts — just remove the pointer and delete the file at close, step 8.)

**Catch it — claim:**
1. State the move back in one sentence. If you can't, the baton wasn't caught — stop and ask Loudon.
2. Check it may already be done before you commit to it. The baton is a snapshot from when it was written; the project may have moved past it. Re-read the parent entry and `git log` it since the baton's `born` date, and confirm the "Current state" the baton quotes still matches the file. For a board-announced baton, `node _ops/stigmergy/pickup-handoff.mjs <id>` prints exactly this reconciliation view — every commit that touched the entry since the baton posted — and then claims the card, so run it and read the list *before* you continue. If the move is already done, superseded, or no longer wanted, STOP — do not claim it; surface to Loudon, and if it plainly landed already, close it as a reconciler (step 7). A stale baton followed silently produces drift. (The auto-staleness heuristic is off by design — the freshness call is yours.)
3. If this baton or its board line is still uncommitted (authored on a surface that couldn't commit — e.g. Cowork), commit them first. That commit is the git archive step 8 relies on.
4. Claim it. For a board-announced baton (it shows in `list-handoffs`), the `pickup-handoff.mjs` from step 2 has already posted the claim (`handoff_picked_up`, `lifecycle: claim`) — the card moves to **CLAIMED (in flight)**; it does *not* leave the board. Leave the "Active Baton" pointer and the baton file in place for now — they come out at close, so a fumble mid-move never erases the work.
5. If the baton names a receiving-surface capability delta or a worktree coordinate, confirm it holds before relying on it (the [[Surfaces and Capabilities]] catalog can be stale) — for a worktree, check `git worktree list` and recreate it (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`) if it is gone. A build that was supposed to run here but can't is a finding to report, not a failure to hide.
6. Act on the move, holding the calibrations above.

**Close it — when the move lands:**
7. Post the close. `node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>` retires the card — an explicit close is the *only* thing that clears it (done is never inferred). Cite the commit that landed the move: it makes the close a checkable claim, not a self-report. **Complete, or re-baton the rest:** if you finished the whole move, close plain; if you did only part, `--partial --remainder "<what's left>"` posts the leftover as a fresh `handoff_ready` so it reappears as open work. Never let "in the spirit of the original" quietly drop scope — a gap becomes a new baton, not silence.
8. Delete the baton file (git is its archive) and remove the "Active Baton" section from the parent entry. On a surface that can't delete (Cowork), remove the pointer and note "deletion pending." Steward batons are the exception — updated in place, never deleted or closed.
