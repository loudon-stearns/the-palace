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

Build the piece origin for rich-face pieces, from the one shared file resolver through the canon edits, now that the exact-origin guard on STIGMERGY's board writes has shipped. Built, it means a piece runs on an origin of its own, declares in its own head what it needs, and a check keeps that honest, so every rich face and interactive element made from here on is built to one model. The plan is [[STIGMERGY — spec — rich-face pieces]], the design page Loudon said yes to on 2026-10-13. It holds the model, the piece contract and all ten steps with their sizes and tests; this baton does not restate it.

## Why this move matters

Sandboxing every rich-face piece closed the hole (a piece could write to the board), and it took away what pieces need: the five webcam builds on [[Language as a Tonal Medium]] can't open the camera, about 14 proofs can't read the file beside them, 5 can't keep state, and every piece reports its own height. Behind the wall, the guard let a page on any other localhost port write to the board, until the exact-origin guard landed today.

Shown a per-piece patch or a second origin, Loudon said: "lets make a general solution and a process change even if it is more work. We will be making a ton of rich faces and interactive elements moving forward, so we need solutions that scale."

## Tried and rejected

- **Grant the five webcam pieces now and baton the second origin.** A per-piece patch; Loudon asked for the general model instead.
- **Trust every loopback origin**, as the old guard did. The exact-origin check has replaced it.
- **Give a piece frame `allow-same-origin` while the piece is served from the app's own origin.** That voids the sandbox; the page adds the flag only after checking the piece origin isn't its own.
- **Edit a gathered proof to add its declaration.** The manifest speaks for it. Only CDN pins get edited, after Loudon has seen the diff.

## Current state

*As of 2026-10-13.* Of the model, nothing is built. What is on main is the sandbox and link rules the day's reviews landed (`2108a278`, `ca574c60`). Until the model is built the camera stays off the rich face; the five webcam builds still open from their project folder.

- **The exact-origin guard has landed**, on main at `65911e8a` (it merges `7bbf9c32` and `7e71c0f8`): a write or `/api/open` now passes only from the app's own origin, and a URL Loudon types himself may still open a file. This baton was written while it was still in flight on branch `claude/piece-origin-step1-guard`; the build starts at the shared file resolver.
- **Named unknowns** are in the spec's §7 (auto-hush against Tone.js, mermaid under a strict script policy, the camera through two nested frames outside headless Chromium, framed storage). None is proven.
- **Fold into the build:**
  - `_ops/rich-face/README.md`: the five rules under "What the page lets run" (every piece sandboxed; the server sandboxes too; links go only to the web, mail or the palace; an entry's own HTML is shown, not run; framed by the reader) and its gotchas "stands alone" and "reports its height". The model rewrites them; the last build step's READMEs carry it.
  - The 14 proofs that fetch a sibling file and the 5 (plus 2 archived) that use storage get a declaration when a face gathers them, not in a sweep (spec §6).
  - The `open:` links. The link rule keeps only `http:`, `https:`, `mailto:` and `obsidian:`, so the `open:` pseudo-scheme (`src/lib/format.js:152`, rewritten to `/api/open`) is stripped on the rich face. The coordinating session counted 22; a grep of tracked `.md` for `](open:` finds 12 (four project scrolls and `_ops/orchestrator/prompts/shared.md`). Recount before relying on either.
  - Flocking's three text figures fail today because a bare name is matched only to depth 5 (`palace-find.mjs:33-38`). The shared resolver fixes them; pin d3 and Plot.

## Next move

Start with the shared file resolver (`resolve.mjs`): one place that finds a file the same way for the live page, the fingerprint and the public build. Once it is in, three lanes can run in parallel (spec §8): the piece server with the kit and the page's frames; the checker with the Sentry and build gates; and the preview tool with leases. Then the migration, then the canon edits. Each in its own worktree, merged one at a time.

## Receiving environment

Claude Code on the Mac. This is STIGMERGY code, so each step gets its own worktree: `node _ops/worktree/new-worktree.mjs --name claude/piece-origin-<what> --profile stigmergy`. Never build in the owner tree. Before any merge, `git merge-tree --write-tree main <branch>` comes back clean.

## Calibrations from this session

- **Loudon's three answers, 2026-10-13: "yes on the three decisions."** (1) Camera: a grant line per piece in `_ops/rich-face/grants.json`, written only on his yes. (2) Public site: a camera piece opens in its own tab. (3) Gathered proofs: the manifest speaks for them (the design's recommendation stands: only CDN pins get edited, after he has seen the diff).
- **Order, as settled at the close:** "Make it the next build, after step 1 ships; don't wait anything behind BLUELINE."
- The last build step's canon edits (Enrichment v2.5, the Maker house standard, the design-system `SKILL.md`, the READMEs) are house writes. They go through the Concierge and Loudon's yes.
- The checker ships report-only first, over all 222 HTML files, until its false alarms are tuned out.
- Never POST to the live :5173 from a script or a test. Browser-check on a scratch Vite server on its own port against a throwaway palace, with `strictPort: true` (the app README, "A scratch Vite given `port: 0` takes 5173"). Revert any temporary `launch.json` entry before a commit.
- No `app/server/*` or steward-prompt edits while a steward is live. Hold the live server's restart until every server-side change has landed, so it restarts once.

## Load these files first

1. [[STIGMERGY — spec — rich-face pieces]], the plan.
2. `_ops/stigmergy/app/server/request-guard.js` and `middleware.js`, and the guard's merge (`65911e8a`).
3. `_ops/rich-face/README.md`, `rich-handler.mjs`, `rich.html`, `palace-find.mjs`, `fingerprint.mjs`, and `_ops/stigmergy/app/scripts/build-public.mjs`: the three places a file is looked up today.
4. `_ops/stigmergy/app/src/components/ArtifactSlot.jsx` and `state/RichFaceFrame.jsx`: the two frames the page change touches.
5. `_ops/stigmergy/app/README.md`, "Write path" and "Testing, worktree & topology gotchas".

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
