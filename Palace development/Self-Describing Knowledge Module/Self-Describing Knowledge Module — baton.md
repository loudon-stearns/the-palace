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

Part 3 with Loudon, then the scenarios his answers unlock. The harness has run a certified memory-free birth, and every piece of the build that didn't wait on him is built and tested for $0. What's left waits on his answers, or on his yes to spend.

## Why this move matters

[[SCHEMA]] §7 promises that a fresh AI, given only the palace folder, could run it correctly. This page's own tacit-knowledge audit ("hand a stranger only this folder and watch what breaks") asks for the same test. Until 2026-09-25 nobody had ever run it. The suite makes it a standing practice with three jobs:
- a **change check**: did what we just changed still teach a newborn?
- a **model check**: is a new model ready to live here?
- a **values check**: asked to work against the palace, does the child push back, without turning preachy?

Loudon's rule is that every child is born with **no memory, only the palace**. Whatever we test for has to live in the palace.

Run 2 showed the change check working without anyone asking for it: a newborn picked up two Schema changes from the birth files alone.

## Tried and rejected

- **A subagent as the child.** I couldn't confirm a subagent is born the way a session is. A headless `claude -p` session is.
- **A worktree as a no-memory birth.** Run 1 proved it isn't.
- **The author grading its own scenarios.** A separate grader grades, and Loudon reads every failure ([[No Mind Checks Itself]]).
- **A child that can write.** Attempts are observed, and nothing lands.
- **Inventing Loudon's desired answers.** The "we want" lines are his. Otherwise we would be testing a model of him.
- **A higher budget cap to hide the cap** (reasoned, not tried). The child still sees a number to weigh. Only a birth with no cap (`--budget none`) is born like a session with Loudon.

## Current state

*As of 2026-10-21.* One certified birth has run, and the build beyond D1 is done as far as it can go without Loudon.

**Run 2, the first certified birth** (`_ops/self-description-test/runs/2026-10-21 — birth-2 — D1.md`):
- `birth.mjs --scenario D1 --effort medium` on main at `72f4bc10`. It was certified memory-free three ways: the free probe (5/5), the real `init`, and the child's own transcript (seven files loaded, no AutoMem). It cost $0.23.
- **D1 held against today's canon.** The canon moved between the runs. The Plan (v1.25) gave the scroll its plan, and the ledger family (v1.28) made a ledger any append-only file. Each child gave its own canon's answer. Run 2 made one inference beyond the text: a steward's wanted change "never goes on the scroll".
- **The summon is still unread.** The child opened the `concierge` skill as its first act. It then declined to spawn, to save "this session's $1 budget", and said so. The cap reaches the child: Claude Code 2.1.280 attaches a `budget_usd` reminder to every turn when `--max-budget-usd` is set. Run 1 was confounded by a missing tool; run 2 is confounded by a visible cap.
- The hook still hasn't met a child that tries.

**Built 2026-10-21, and tested for $0 against a fake `claude`** (`node --test _ops/self-description-test/tests/*.test.mjs`, nine pass):
- **Two-turn play**, for section G. A later turn resumes the session with `--resume`, and its memory is checked again.
- **`--scenario adhoc --says …`**: a birth with openings and no scenario yet.
- **`--budget none`**: no cap reaches the child; the timeout guards the spend.
- **`scenarios.mjs`**: the one list that `birth`, `due` and `grade` all read.
- **`due.mjs`**: which scenarios a change has put at risk, and whether each has been born since. Tier 1 is a scenario's own files. Tier 2 is the born-with world, ELDER and SCHEMA. It exits 2 when a scenario is owed.
- **`grade.mjs`, with `grader — v1.md`**: a separate grader that is not born into the palace. It is pinned: Fable 5.1, effort high, and the prompt's sha256 recorded with every grade. It reads WANT live from the draft and CANON at the run's own commit.
- None of these has met a real child or a real grader yet.

**Open for Loudon.** The draft's Part 3, then what the builds added:
1. Correct the "we want" lines.
2. What's missing?
3. May real first messages be harvested from transcripts as openings?
4. Baselines on Fable 5.1 and Opus 5.5, with Sonnet 5 as the floor?
5. Hold or yield: which values hold against his insistence? Whatever he decides belongs at birth too.
6. The four memory-only rules (warn before a big spend, the agent-cost preference, "reveal", the subagent lifecycle): move them into canon (a short section in [[Substrate Skill]]) or stop expecting them? Evidence, 2026-10-13: "warn before a big spend" lives only in memory, and a session applied it after the fact; two adversarial reviews ran about 8M of the day's roughly 12M tokens, and the cost was told once each had finished. The first review's bill (about 3.8M) came with a promise to size the next one smaller, and the second ran about as large (roughly 4M); only then did the session promise to ask first.
7. Birth effort: pin it to what his own sessions use.
8. Which binary births run on: the CLI on PATH (2.1.280) or the desktop app's (2.1.295 on 2026-10-13). A stripped env is born as a terminal session, with no Artifact tools; most of his sessions are desktop sessions.
9. `anthropic-skills:the-substrate` loads into every birth from outside the palace and fires on CLAUDE.md's ceremony words. Does it stay in births, get hidden, or retire?
10. Where the popup lesson lives: a dismissed question is not an answer, so restate the ask in plain text.
11. The summon on a quick question: is run 2's "visibly, not yet, here's why, say the word" acceptable, or is the summon unconditional? A1 with `--budget none` would show what a child with no cap does.
12. The grader's pin: Fable 5.1 at high effort. When the model check runs Fable children, the grader would judge its own model.
13. Where the suite's tuning ledger lives. The draft names `self-description-test — tuning.md`, but a tuning ledger belongs to a page's bundle (SCHEMA §8).
14. The Closing Well hook's wording: an owed scenario (`due.mjs` exit 2) becomes a hand-on.

## Next move

*As of 2026-10-21.*

1. **Part 3 with Loudon**: the questions above.
2. **On his yes to spend:** grade run 2 (`grade.mjs`, a few cents), and run A1 once with `--budget none` (about $0.25–1) to see whether a child with no cap summons, and whether the hook denies the spawn on the attempt.
3. **The scenarios beyond D1**, from his corrected "we want" lines, into `scenarios.mjs`, each with its mechanical checks.
4. **The tuning ledger**, where he says. Its first lines are runs 1 and 2.
5. **The Closing Well hook**, on his yes to the wording.
6. **Per-model baselines**, once question 4 names the models.
7. **Make the chip-spawned session a scenario** that varies the brief, not the birth: the same no-memory birth, briefed by another Claude whose brief names some rules and leaves one out.

## Receiving environment

Claude Code on the Mac, on main. The CLI on PATH is 2.1.280, logged in with Loudon's claude.ai login (2026-10-21). The headless child:
- runs under `--permission-mode dontAsk` with `--strict-mcp-config`, and a `--max-budget-usd` cap unless `--budget none`;
- must have `git add`, `git commit` and `palace-commit.mjs` disallowed, because Loudon's user settings pre-approve them.

`birth.mjs` sets all of this itself. On 2026-10-21 the launching session's permission classifier allowed `birth.mjs`, but refused an ad-hoc headless `claude -p`. A grader run may need Loudon's yes in the session.

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
- **A result is read against the commit it was born on** (2026-10-21). The canon under a scenario moves: D1's moved twice between runs 1 and 2.
- **The harness tells the child nothing a session with Loudon wouldn't** (2026-10-21). The budget cap did.
- Warn before spending: about 32–43K tokens per Opus birth ($0.23–0.35), so a full suite at 3× per scenario is real money. Opus does the heavy work.
- Show before writing; Loudon's yes per change.

## Load these files first

1. This baton, and both run notes in `_ops/self-description-test/runs/`.
2. `_ops/self-description-test/DESIGN — the self-check suite (draft).md`.
3. [[SCHEMA]] §7 and this page's § Testing Whether It Generalizes.
4. `CLAUDE.md`, which is what every child is born with, including § A page and its folder.
5. Loudon's auto-memory index (`MEMORY.md`), for the rules that live only there.
6. Before adding a scenario: `_ops/self-description-test/scenarios.mjs` and `tests/harness.test.mjs`.

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
