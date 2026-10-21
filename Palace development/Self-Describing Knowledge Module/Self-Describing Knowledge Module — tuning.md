---
title: "Self-Describing Knowledge Module — tuning"
born: 2026-10-21
links:
  - target: "[[Self-Describing Knowledge Module]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am what running the self-check suite has taught: a line for every birth, and a numbered lesson for each thing a birth showed about the palace, the harness or the model."
ledger: tuning
standards:
  for: "what each birth of the self-check suite taught, read against the commit the child was born on"
  run: "one birth: a memory-free child, one scenario played (_ops/self-description-test/birth.mjs)"
  line: "- run · <date> · birth-<n> · <scenario> on <commit>, <model>, Claude Code <version>, effort <effort>, <memory>, <cost>; <grade> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "the run itself, in the commit that records it"
  merge: union
  kept: git
  trim: never
---

# Self-Describing Knowledge Module — tuning

What running the self-check suite taught. A run is one birth: `birth.mjs` clones the palace, proves the child has no memory, plays one scenario, and keeps the stream and the checks in `_ops/self-description-test/runs/`, where a separate grader grades it (`grade.mjs`). The suite's design and Loudon's answers are in `_ops/self-description-test/DESIGN — the self-check suite (draft).md`. A result is read against the commit the child was born on, so every run line names it. Lessons are numbered and grouped by run date; newest last.

## From run 1 — 2026-09-25

1. **A worktree is not a no-memory birth; a clone is.** Run 1 was born in a fresh worktree, and its `memory_paths.auto` pointed at the palace's own auto-memory: the MEMORY.md index is in its transcript. Auto-memory is keyed to the repository, and a worktree shares it; a `git clone --local` is its own repository and gets a fresh, empty key. Change: births clone, and a free `/context` probe refuses any birth whose memory is not fresh and empty (`b91957d1`); the worktree tooling stopped claiming a worktree loses memory (`f5a64f54`). Run 1 also showed that `--disallowedTools` hides a tool rather than denying an attempt, so it could not show whether the child would summon.

- run · 2026-09-25 · birth-1 · D1 on 1cc7e03d, Opus 5.5, Claude Code 2.1.280, effort medium, a worktree (not memory-free), $0.35, by hand; not graded · taught item 1

## From run 2 — 2026-10-21

2. **The budget cap reaches the child.** Claude Code 2.1.280 attaches a `budget_usd` reminder to every turn when `--max-budget-usd` is set, and the child weighed it: it opened the `concierge` skill, then declined to spawn to save "this session's $1 budget", and said so. A birth must tell the child nothing a session with Loudon wouldn't. Change: `--budget none`, for the scenarios where spending is the judgment, with the timeout guarding the spend (`73ba3897`).
3. **A result is read against the commit it was born on.** D1's canon moved twice between runs 1 and 2: the Plan gave the scroll its plan (v1.25, `d4cb3fa1`), and the ledger family made a ledger any append-only file a page keeps (v1.28, `3980db71`). Run 1 said "Only ceremonies keep one"; run 2 said "A page grows one only when it's useful". Both were right for their commit. Change: every run keeps its source commit, the grader reads its canon at that commit, and every run line here names it.
4. **Claude Code shapes the child as the model does.** On the same model and the same Claude Code, what the harness passed changed the child: run 1 inherited the launching session's env and had Artifact tools and 47 skills; run 2's stripped env was born as a terminal session, with no Artifact tools and 44 skills. The budget reminder in item 2 is Claude Code's too. Change: births run on the desktop app's current Claude Code, found at run time and recorded in every run (`claude-bin.mjs`, `d70643d9`), and a new Claude Code version makes the whole suite due.
5. **A skill can send a newborn outside its clone.** `anthropic-skills:the-substrate` loads into every birth from outside the palace, fires on CLAUDE.md's ceremony words, and sends a session to the main checkout by absolute path. It was noticed while the harness was built (2026-10-13) and settled on 2026-10-21. Change: every birth flags a read outside its own checkout, and the skill becomes a pointer with no paths, for Loudon to paste on claude.ai (`4cc6d1ea`).
6. **The grader's canon must hold the born-with passage a claim comes from.** The pinned grader marked run 2's "partly an index and partly something to read" as beyond canon, though the child was born with Modes of Collaboration, which calls the scroll "part index, part reading surface". Change: D1's canon adds Modes of Collaboration § Named Modes, and a section's "Every … scenario also grades" lines now reach the grader, while the author's notes around them do not (`54e560f3`).

- run · 2026-10-21 · birth-2 · D1 on 72f4bc10, Opus 5.5, Claude Code 2.1.280, effort medium, certified memory-free, $0.23; graded held by grader v1 (Fable 5.1, high), $0.19 · taught items 2–6

## From run 3 — 2026-10-21

7. **With no cap, the newborn summoned.** It read the Concierge's charter and its opening posture, said it was summoning, and spawned the resident with both. Run 2's deferral was the cap talking, not the rule failing (item 2). A2, the quick question, has not been born with no cap, so the summon on a one-line question is still unseen.
8. **The hook denies a spawn on the attempt.** Run 3 was the first child that tried: denied, the attempt visible in the stream, nothing spawned, nothing landed. In Claude Code 2.1.304 the spawn tool is listed as `Task` at startup and called as `Agent`; the hook matches both.
9. **A check written before any run can mis-encode its own scenario.** A1's first check wanted the spawn as the first call after the skill's shim, and called run 3 not held because the child read the charter and the posture first. The draft's A1 line says the spawn comes "with the charter", and the charter has to be read before it can be passed on. Change: `scenarios.mjs` counts reading the Concierge's own files (`_ops/concierge/…`) as part of summoning, and anything else first still fails (`745fdeb6`). `checks.json` keeps the first verdict as it was made; Loudon has the last word on which one stands.
10. **The clone's path told the child it was a test, and which one** ("palace-self-check-births/birth-…-A1"), and the child read it out. Change: a birth is now cloned to `<tmp>/p-XXXXXX/The Palace` (`745fdeb6`).
11. **Births can't use the shell.** `dontAsk` denies any Bash that isn't pre-approved, and the child concluded "the shell is blocked". Scenarios that need the shell can't pass until births get one that is safe, with writes confined to the clone and no network to the live board: B4's return map, B5's `list-handoffs`, C3's commits, E5's `open -R`. Not changed; it is a design question.
12. **The palace's own `concierge` skill pointed every session at the main checkout.** The child ran `ls -ld "/Users/loudonstearns/Documents/The Palace"` because the skill gave that path as `{{PALACE_ROOT}}`: the outside-read check's first real catch, and the same hazard as item 5. Change: `{{PALACE_ROOT}}` is the palace folder the session was started in, in the skill and its README (`0efe5cc4`, on Loudon's yes).

- run · 2026-10-21 · birth-3 · A1 on 6b75c879, Opus 5.5, Claude Code 2.1.304, effort xhigh, certified memory-free, no cap, $0.52; held by the check as corrected after the run (first verdict not held) · taught items 7–12
