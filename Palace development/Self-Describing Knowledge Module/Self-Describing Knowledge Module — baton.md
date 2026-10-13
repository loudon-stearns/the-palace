---
title: "Self-Describing Knowledge Module — baton"
born: 2026-09-25
links:
  - target: "[[Self-Describing Knowledge Module]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Self-Describing Knowledge Module]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Self-Describing Knowledge Module — the self-check suite

## Move

Take the self-check suite from draft to a first working harness. Loudon corrects the draft first. Then build the smallest harness that proves a birth is memory-free and runs one scenario end to end.

## Why this move matters

[[SCHEMA]] §7 promises that a fresh AI, given only the palace folder, could run it correctly. This page's own tacit-knowledge audit ("hand a stranger only this folder and watch what breaks") asks for the same test. Until 2026-09-25 nobody had ever run it. The suite makes it a standing practice with three jobs:
- a **change check**: did what we just changed still teach a newborn?
- a **model check**: is a new model ready to live here?
- a **values check**: asked to work against the palace, does the child push back, without turning preachy?

Loudon's rule is that every child is born with **no memory, only the palace**. Whatever we test for has to live in the palace.

The first run has already paid for itself. It found that the palace's own worktree tooling is wrong about memory.

## Tried and rejected

- **A subagent as the child.** I couldn't confirm a subagent is born the way a session is. A headless `claude -p` session is.
- **A worktree as a no-memory birth.** Run 1 proved it isn't (below).
- **The author grading its own scenarios.** A separate grader grades, and Loudon reads every failure ([[No Mind Checks Itself]]).
- **A child that can write.** Attempts are observed, and nothing lands.
- **Inventing Loudon's desired answers.** The "we want" lines are his. Otherwise we would be testing a model of him.

## Current state

*As of 2026-10-13.* The harness is built. No paid birth has run through it yet.

**On main:**
- `_ops/self-description-test/birth.mjs` (`b91957d1`, merged in `df88620f`): one memory-free birth, one scenario played, its stream kept and checked.
  - It clones the palace with `git clone --local`, as a text-only sparse checkout unless `--full`.
  - It probes the birth for $0 with `claude -p /context`, and refuses unless `memory_paths.auto` is a fresh, empty key, no AutoMem file loads, and CLAUDE.md loads with its six World imports.
  - The child's env drops every `CLAUDE*` and `ANTHROPIC_*` variable.
  - Writes, spawns and outward tools stay visible and are denied on attempt by a PreToolUse hook passed through `--settings`. Git writes and the commit scripts are denied by pattern.
  - `--check` runs the mechanical checks on a saved stream or transcript.
  - Only D1 is defined (`birth.mjs:47`).
- `_ops/self-description-test/DESIGN — the self-check suite (draft).md`: Parts 1–3 as before (the practice; scenarios A–F and G; the questions for Loudon). Its run mechanics and build notes now describe the harness. Its scenarios and questions are untouched.
- `_ops/self-description-test/runs/2026-09-25 — birth-1 — D1.md`, with its raw stream. Run 1 is still the only birth, and still not certified memory-free.
- The worktree memory claim is corrected (`f5a64f54`). `_ops/worktree/SKILL.md`, `new-worktree.mjs` and `symlinks.json` now say a worktree shares the palace's memory. `--memory` is kept, does nothing, and says so.

**What building it found:**
- **A clone gets a fresh memory; a worktree doesn't.** A `git clone --local` is its own repository, so it gets its own empty memory key. A worktree shares the palace's. This was checked at $0 with `claude -p /context` on 2.1.280 (the CLI on PATH) and 2.1.295 (the desktop app's). The docs agree: auto-memory is "per repository, shared across worktrees" (https://code.claude.com/docs/en/memory).
- **Checkout size:** 2.1 GB full, 247 MB without four media types, and 7.6 MB of `.md`.
- **Two switches exist besides a clone.** The docs name `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` and an `autoMemoryEnabled: false` setting, and list `--settings` among the settings scopes. The harness uses the clone; whether a switch would serve as well hasn't been tried.
- **There is no nested-session guard.** `claude -p` runs from inside a session, and run 1's child inherited the launching session's messaging socket, effort and entrypoint. Run 1 ran at medium effort; the launching session was at xhigh. That is why the child's env is now stripped.
- **Verified at $0:**
  - A dry run certifies a clone 5/5.
  - `--in` on a worktree is refused on three counts.
  - The real path reaches the child, re-checks init, and stops at the auth wall.
  - `--check` flags run 1's AutoMem load and parses the 116 tool calls of session `152978cb`.
- **Not verified: any paid birth.** Every attempt stopped at "OAuth session expired and could not be refreshed", on both binaries. So D1 has not been re-run, and the hook's deny-on-attempt hasn't yet met a child that tries.
- **The chip-spawned session, read** (`152978cb`, the 2026-09-25 arc-reader fix). It did everything its brief named, and missed the one rule its brief left out: it never summoned the Concierge, and it wrote a cost calibration straight into auto-memory.

**Open for Loudon** (the draft's Part 3, then what the build added):
1. Correct the "we want" lines.
2. What's missing?
3. May real first messages be harvested from transcripts as openings?
4. Baselines on Fable 5.1 and Opus 5.5, with Sonnet 5 as the floor?
5. Hold or yield: which values hold against his insistence? Whatever he decides belongs at birth too.
6. The four memory-only rules (warn before a big spend, the agent-cost preference, "reveal", the subagent lifecycle): move them into canon (a short section in [[Substrate Skill]]) or stop expecting them?
7. Birth effort: pin it to what his own sessions use.
8. Which binary births run on: the CLI on PATH (2.1.280) or the desktop app's (2.1.295).
9. `anthropic-skills:the-substrate` loads into every birth from outside the palace and fires on CLAUDE.md's ceremony words. Does it stay in births, get hidden, or retire?
10. Where the popup lesson lives — a dismissed question is not an answer, so restate the ask in plain text. (Loudon: "sometimes I click through them or try to minimise them and loose track of them".)

## Next move

*As of 2026-10-13.*

1. **Loudon runs `claude auth login`** in a terminal. The harness can't log a child in, and exits 3 when the login has lapsed.
2. **Re-run D1 for a certified result:** `node _ops/self-description-test/birth.mjs --scenario D1 --effort medium`, at about $0.35. Write run 2's note beside run 1's and compare the two.
3. *Optional:* add A1 to the harness's scenarios and run one birth, to see the hook deny a Concierge spawn on the attempt. It's the one guard not yet seen working.
4. **Part 3 with Loudon:** the ten questions above. His answers shape every scenario after D1.
5. **Make the chip-spawned session a scenario** that varies the brief, not the birth: the same no-memory birth, briefed by another Claude whose brief names some rules and leaves one out.
6. **Still to build:**
   - multi-turn play, for section G's two-turn insistence;
   - every scenario beyond D1;
   - a pinned grader, separate from the author;
   - `due.mjs`;
   - the suite's tuning ledger;
   - the Closing Well hook;
   - per-model baselines.

## Receiving environment

Claude Code on the Mac, on main. The headless child:
- runs under `--permission-mode dontAsk` with `--strict-mcp-config` and a `--max-budget-usd` cap;
- must have `git add`, `git commit` and `palace-commit.mjs` disallowed, because Loudon's user settings pre-approve them.

`birth.mjs` sets all of this itself. It needs Claude Code logged in; on 2026-10-13 the login had expired on both binaries. The three checks the last version of this baton asked for before building are answered in Current state.

## Calibrations from this session

- **No memory, ever** (Loudon, 2026-09-25). A behaviour we test for has to live in the palace. A scenario that only passes with memory means the rule belongs in canon, with memory keeping a pointer.
- **The suite is the palace's acceptance test for new models.**
- **Values as well as process.** Pushback names the value, says why, offers a path, and on insistence holds or yields. Controls catch preachiness.
- **Real incidents become scenarios.** From 2026-09-25:
  - "tests pass" said about code when behaviour was meant;
  - a draft misattributed as Loudon's line;
  - a partial commit that nearly swept another session's staged file;
  - the Concierge checking its own placement;
  - ten ledgers whose forward vectors taught the rule just replaced.
- Warn before spending: about 43K tokens per Opus birth, so a full suite at 3× per scenario is real money. Opus does the heavy work.
- Show before writing; Loudon's yes per change.

## Load these files first

1. This baton, and `_ops/self-description-test/runs/2026-09-25 — birth-1 — D1.md`.
2. `_ops/self-description-test/DESIGN — the self-check suite (draft).md`.
3. [[SCHEMA]] §7 and this page's § Testing Whether It Generalizes.
4. `CLAUDE.md`, which is what every child is born with, including § A page and its folder.
5. Loudon's auto-memory index (`MEMORY.md`), for the rules that live only there.

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
