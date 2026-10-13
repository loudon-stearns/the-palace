# The Daily Page — record

The mornings, newest first. Where the lap stands: `python3 _ops/daily-page/deal.py --status`.

Each morning:

```
## YYYY-MM-DD · [[Entry]] · verdict

- **Remembered:** what Loudon said from the title alone
- **The page asked for:** its needs and wants, briefly
- **Siblings:** the neighbor that might consume it, and what was decided
- **Made:** the rich face or the rough, or why nothing would come alive
- **Verdict:** and the reason, in a sentence
- **Feel:** his answer to "How do you feel?"
- **Process note:** what about the morning itself worked, and what did not
```

---

*No mornings yet.*

## Before the first morning — open, for Loudon

Left by the session that set this up (the night of 2026-10-12 into the 13th). The first morning's Claude: read these to him before the close, take his answers, and have the Concierge write them into the README. Then delete this section.

**The date.** Loudon said "tomorrow morning" a little after midnight, so the first morning is 2026-10-13. Week one is the first seven mornings he sits, whatever the dates.

**Answered the same night (Loudon, 2026-10-13):**

- **Commit this folder: yes.** He also said to coordinate with the session "Palace handoffs coordination", which is leading the palace's git work right now. That session answered: land it ourselves, by name, and follow the rules below.
- **This record is public.** Tracked and committed, his words included.
- **The `dormant` verdict is dropped.**

**Two decisions still his:**

1. **How far one waking may move a forward vector.** The Concierge recommends: what the page asks for is recorded, not applied; a change Loudon himself sees is ordinary tuning and may land. The README currently says "move it a little", which was the setup session's wording and is in no canon source.
2. **Writing an `agency_profile` after one waking.** He held single-encounter write-backs on 2026-07-02 (`Making a Palace Citizen.md:128`). Recommended for week one: keep the page's answers here in the record, and decide at the week's review.

**Git rules for the morning's commits** (from the "Palace handoffs coordination" session, 2026-10-13, which leads the palace's git work; these hold until that session or Loudon says otherwise):

- The main checkout stays on `main`. Work lands by merge commits; no rebase, no history rewrite, no branch switch there.
- Stage with explicit pathspecs only. Never `git add -A` or `git commit -a`: other sessions keep uncommitted work in the tree.
- Never stage `_ops/swarm/persistent/blackboard.jsonl` unless your own script appended the line you are committing.
- Never stash, check out, or otherwise touch another session's uncommitted files. Ask that session or Loudon.
- Check `git branch --show-current` before and after every commit. Before any merge into main, `git merge-tree --write-tree main <branch>` must be clean.
- A commit subject uses a kind the hook knows (`ops`, `edit`, `enrich`, `handoff`, `baton`, `merge`). `sketch` and `close` are not kinds.
- If a commit fails on `index.lock`, another session is mid-commit. Wait ten seconds and retry. Do not remove the lock.
- Nothing under `_ops/stigmergy/app/server/` or `_ops/orchestrator/prompts/` lands while a steward run is live.
- Never POST to the live STIGMERGY on :5173 from a script or a test.

**One thing he chose without knowing.** Enrichment was rebuilt around depth because small pieces spread over many pages "never transformed one" (`Enrichment — tuning`, item 1). He chose a bias toward making before that was put in front of him. The practice already aims at one piece that carries the whole page, not a little something per section. Watch whether that is enough.

**Not yet tried for real:** a whole prep run, start to finish; the dealer's refusal when the main checkout is off `main`. The wake prompt was tried once, on Hilaritas Generator, and came back in the page's voice with line-cited answers (about 48K tokens).
