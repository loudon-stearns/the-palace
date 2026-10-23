---
title: "Project Stewardship System — baton"
born: 2026-10-21
links:
  - target: "[[Project Stewardship System]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Project Stewardship System]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Project Stewardship System

## Move
Trim the entry so it opens on what it is now: Loudon's partner in making the projects, the fleet reading and the ear debt it found, and the VST path. The machinery moves to [[Palace Orchestrator]], the long decided chronicle to [[Project Stewardship System — Context]], and nothing is lost on the way.

## Why this move matters
The Daily Page dealt this entry on 2026-10-21 and its verdict was **trim**. Loudon: "Trim. Baton the machinery and the long decided list out to the Orchestrator and the Context for a later session." The morning's outside read put the reason plainly: "A newcomer meets six stages, two plans and twenty decisions before the one sentence that matters now. It teaches the machine, not the partnership." What is alive is the turn of 2026-10-16 ("what I needed was a partner in making the projects") and what fleet reading 1 found: the stewards make plenty, 93 of October's cycles made something, but they are starved of his senses, since 87 of 121 rough notes say nobody has heard the thing. The page's new identity belongs to no sibling, so this is a trim, not a fold.

## Cold start
COLD START. This work has not begun; no prior state, no tried-and-rejected. Where the entry stands at `37085b72`: it runs to about 5,400 words of body (`wc -w`; the outside read counted 4,587 before that commit). Its sections are Where it stands (:73), The stages (:90), Stage-Conditional Posture (:105), The Architecture (:122), The Machinery/Content Split (:152), What's Decided (:162, 25 bullets), What's Open (:190), How to Pick Up (:204), Palace Connections (:215) and Open Questions (:226). The stale Where-it-stands date that the woken page caught is already fixed in `37085b72`.

From the outside read, quoted because its folder is ignored by git:

> **Padding.** The Architecture tree and the posture table restate Palace Orchestrator and Substrate Skill (the page says so itself). "What's Decided" is ~20 dated bullets, a chronicle that reads better in the Context. "Palace Connections" repeats the frontmatter links.
>
> **Weight-bearing links.** Palace Orchestrator, The Scroll, Substrate Skill (posture), Trickster, Generative Sample Libraries / Talking Keyboard (the 352-file TTS bug, the founding evidence). Lighter: Drift and Consolidation, SCHEMA — Reference (unlabelled).
>
> **Alive.** … The stage-conditional posture and "polish hides misalignment" are still sharp.

The morning's piece is kept as a proof: `Projects/Project Stewardship System/proofs/2026-10-21-listening-queue/index.html`, the listening queue that put seven unheard steward renders in front of Loudon and led to the VST redirect. The trimmed entry may point to it where it names the ear debt.

## Next move
Work in your own worktree. Draft the trimmed entry and a map of where every moved paragraph lands, then show both to Loudon before anything is committed. The trim is shown, then written ([[The Daily Page]]'s verdict table; [[Substrate Skill]] § Updating Entries).

- **The entry leads with the partnership.** Open on the partner-in-making paragraph, then Where it stands: the fleet reading, the ear debt, the nine stewards on the VST path, and the frontier.
- **Machinery goes to [[Palace Orchestrator]]** (`Palace development/Palace Orchestrator.md`, its § Machinery at :129 is the likely home): the Architecture tree, the detail of the stages table, and the Machinery/Content Split's working detail. The entry keeps one line per stage, or a pointer.
- **The posture table stays canonical in [[Substrate Skill]]** § Stage as Alignment Confidence. The entry keeps one sentence and the pointer, plus what is the page's own (recursion within entries, and "polish hides misalignment" if it lives here).
- **What's Decided goes to the Context as its story.** The entry keeps the decisions a steward or a fresh Claude must act on, each in one line, with a pointer to the Context for why and when. The Context's § Where the decisions came from (:194) is the likely home.
- **Drop Palace Connections.** It repeats the frontmatter links. Before dropping it, check that every link it names is in the frontmatter, and offer any that is missing.

**Constraints.** This is a project with an agreed Plan, so the scroll's Plan is not touched. Nothing is lost: every moved paragraph lands somewhere, and the map in this baton's close names where. The trim does not change the forward vector, the frontmatter links or the stage unless Loudon says so. Out of scope: the two questions still open with him from 2026-10-21, the Max-era seeds on Crystal Synthesizer and Retrospective Delay, and a VST line in `_ops/orchestrator/prompts/shared.md`.

**Done when** the entry reads partner-first, the Orchestrator and the Context hold what moved, and Loudon has read the result.

## Receiving environment
Claude Code on the Mac, in a worktree of its own (`node _ops/worktree/new-worktree.mjs --name <branch> --profile docs`), landed with `palace-land`. Stewards cycle on the heartbeat (`_ops/heartbeat/`), but this page has no steward of its own (`_ops/agents/permanent/REGISTRY.json`), so nothing else edits the entry on a schedule. Re-read it against `git log` before you start anyway.

## Calibrations from this session
- The verdict came at the morning's sit, as Loudon's own word. He wants the move made in a later session, not that morning.
- The Plan was revised the same morning (`37085b72`): move H is now the VST production path, done when each of the nine stewards has a plugin he has played in Live. The trimmed Where it stands should say so in a line.

## Load these files first
1. `Projects/Project Stewardship System.md`, whole.
2. `Projects/Project Stewardship System/Project Stewardship System — Context.md`: where the chronicle lands.
3. `Palace development/Palace Orchestrator.md`: where the machinery lands.
4. [[Substrate Skill]] § Stage as Alignment Confidence: the posture table's canonical home.
5. `Projects/Project Stewardship System/Project Stewardship System — scroll.md`: the Plan, to read, not edit.

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
5. If the baton names a receiving-surface capability delta or a worktree coordinate, confirm it holds before relying on it — for a worktree, check `git worktree list` and recreate it (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`) if it is gone. A build that was supposed to run here but can't is a finding to report, not a failure to hide.
6. Act on the move, holding the calibrations above.

**Close it — when the move lands:**
7. Post the close. `node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>` retires the card — an explicit close is the *only* thing that clears it (done is never inferred). Cite the commit that landed the move: it makes the close a checkable claim, not a self-report. **Complete, or re-baton the rest:** if you finished the whole move, close plain; if you did only part, `--partial --remainder "<what's left>"` posts the leftover as a fresh `handoff_ready` so it reappears as open work. Never let "in the spirit of the original" quietly drop scope — a gap becomes a new baton, not silence.
8. Delete the baton file (git is its archive) and remove the "Active Baton" section from the parent entry. On a surface that can't delete (Cowork), remove the pointer and note "deletion pending." Steward batons are the exception — updated in place, never deleted or closed.
