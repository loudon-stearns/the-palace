# Lane T — the 33 touched-unverified flags, read by hand (proposes dispositions; writes nothing in the house)

Read `PREAMBLE.md` beside this file first.

## The job (Weave Step 0c, postcondition 2b)

`lint-weave-flags.py` marks a flag **touched-unverified** when a commit has touched one of its source entries since it was posted: the work may be there, or the touch was unrelated. Entry files are high-traffic, so the linter cannot tell; a hand must read the entry and say. The weave closes with a `Palace-Resolves: <id>` trailer where the work is there (or is done now), declines with `Declined flag <id>: <reason>` where the ask is wrong or moot, or leaves the flag open with a reason when it is real work this weave will not do.

## Your list

The 33 flags are in `_ops/swarm/sessions/weave-2026-11-08/flag-inbox-open.txt` under TOUCHED-UNVERIFIED (ids, dates, sources, the first line of each ask). The full payload of each is a line in the live board: `/Users/loudonstearns/Documents/The Palace/_ops/swarm/persistent/blackboard.jsonl` — **read it, never write it**: `command grep -F '"id": "<id>"' <board>` or a python one-liner over the JSONL (`payload.proposed_action`, `payload.rationale`, `payload.source_entries`).

For each flag:
1. Read the full payload. Read the source entry (or entries) at the place the flag names (it often cites `file:line`; the line may have moved — search for the phrase).
2. Check git: `git log --format='%h %ad %s' --date=short --since=<flag date> -- "<source path>"` shows what touched it; read the commit bodies that look relevant (`git show --stat <sha>`; a `Palace-Resolves` trailer naming this id means the linter missed it — report that as **already closed by <sha>**).
3. Decide one of:
   - **done** — the asked change is in the page now (quote the line and the sha that landed it) → trailer.
   - **do-now** — small and clear enough to do in this weave; give the exact edit (file, before → after) so the coordinator can apply it; the coordinator decides which lane's files it touches → trailer after apply.
   - **decline** — the ask is wrong, superseded, or Loudon already decided against it (cite where) → decline line with the reason.
   - **leave-open** — real work this weave will not do (a page to write, a measurement to take, a question only Loudon can answer); say what is left in one line. Where the flag is a question for Loudon, phrase the question so he can answer it in one word.

Some flags are soft ("consider…", "may want a line…"): a considered no is a legitimate decline with the reason. Two of the Palace Map ones and the Haptic Handwheel pair are of that kind. The 2026-11-08 Auditory Illusions flags are a day old; the page work may be on the branch that posted them — check `git log` on Shepard Tone Synthesizer and Frequency-Time Duality.

**Also, flag 1430 (Runpod, by-touch):** run the pattern `rest\.runpod\.io|api\.runpod\.io/v[0-9]|allowedCudaVersions|workersMax` with `command grep -rlE` over tracked `.md` files (`git grep -lE '<pattern>' -- '*.md'`), list the pages that still match, and for each say in one line whether the match is a restated detail (the flag's target) or the runbook itself / a record of a past run (left alone). By-touch means the weave reports, never sweeps.

## Output

Write **only** `_ops/swarm/sessions/weave-2026-11-08/workers/T-dispositions.json`:

```json
{
 "lane": "T",
 "dispositions": [{"id":"...","posted":"YYYY-MM-DD","sources":["..."],"ask":"one line","disposition":"done|do-now|decline|leave-open|already-closed","evidence":"file:line and/or sha, quoted where it matters","edit":{"file":"...","before":"...","after":"..."},"reason":"one sentence (for decline/leave-open)","question_for_loudon":"or empty"}],
 "runpod_by_touch": {"pattern":"...","pages_matching":[{"path":"...","kind":"restated-detail|runbook|record","line":"the matching line"}],"note":"one line"},
 "summary": "one paragraph: counts by disposition, what pattern you saw, what only Loudon can settle"
}
```

Every one of the 33 gets a disposition. Write nothing in the house; never write the board.
