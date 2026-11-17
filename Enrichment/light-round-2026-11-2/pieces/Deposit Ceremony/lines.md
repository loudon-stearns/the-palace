# Deposit Ceremony — placed before the read (the remake)

**File:** `Deposit Ceremony — placed before the read.png` (and `.svg`), made by `make2.py`, job `placed-before-read`.

**Title:** Placed before they were read

**Caption:** This is one deposit, drawn from its commits, and it is the exception among recent ones.

Step 5 asks that every word be read before anything is written. Step 6 says canon is main, and that what waits on the read waits on a branch. Here the map's yes came as a change of title, not a read of the words (the tuning ledger). So the words were placed on a branch: made, but not yet canon. They were written there and then fixed three times, all within 13 minutes 25 seconds: three factual fixes, a cold reader's 21, and a second reader's 6. Then they sat with no new commit for 3 days 22 hours. They reached main in a single merge, whose message records that every word was read ("Read it, land it").

The record does not show when the words were put in front of their reader. So the wait measures how long the words were held, not how long the reading took. Of the six deposits run under v2.8 and v2.9, this is the only one placed on a branch before its read. By their own commits, four were read before they were placed. By the tuning ledger's correction of 2026-11-08, one landed on main before its words were read.

**What is real and what is a choice:**

- **Real: the commits.** D-2026-11-04-AUDILLUSIONS is five commits on branch `deposit/auditory-illusions` (`4bee43f9`, `c5dc144a`, `fab93999`, `bd90c3bf`, `47a76840`) and the merge `f91572e2`.
  - `deposit-record.json` holds them, and every run checks the record against git.
  - The record also confirms that the five commits follow one another, that they are the only commits on the branch, and that the merge takes the last one.
- **Real: the times.** They are commit times, not event times. Each read happened before its commit, at a time the record does not give.
  - 08:48:13 to 09:01:38 on 4 Nov is 13 min 25 s.
  - The gap is 3 d 22 h 51 min. The picture shows "3 days 22 h", rounded down.
  - The last fix and the merge are 9 s apart.
- **Real: the fix counts.** Each is the commit body's own count, checked against git's numstat.

| Commit | What it is | Count in the body | Lines changed |
|---|---|---|---|
| `c5dc144a` | factual fixes | 3 bullets | 4 |
| `fab93999` | cold read | (1)–(21); items 18 and 21 share one line | 31 |
| `bd90c3bf` | second read | (1)–(6) | 6 |
| `47a76840` | the repeat | 1 | 1 |
| `4bee43f9` | the words written | — | 239 (166 page + 73 Context) |

  - A "fix" is whatever its body counts as one. Fixes vary in size, and the counts are not weights.
- **Real: the last fix.** `47a76840`'s body: "The repeat flagged after the second read".
  - The repeated `mirrors` was made by the second read's own fix commit. In `bd90c3bf`, the Context's Whisper line gained "`mirrors` names the shared move" but kept "Drawn as `mirrors`".
  - `47a76840` cut the second phrase. `make2.py` checks both diffs.
  - The label says only what the body says: a repeat, cut on landing.
- **Real: the verify state.** Each 4 Nov commit says `Palace-Verify: unverified`. The 8 Nov fix and the merge say `verified`.
- **Real: why it was placed before the read.** The tuning ledger (line 157 of `Deposit Ceremony — tuning.md`) reads: "The map's yes came as a title change, not as a read of the words, so the Concierge parked the words on a branch (step 6) rather than landing them." `make2.py` checks that sentence is still there.
- **"Read every word" is an agent's word, not a finding.** It is quoted from the merge's message and attributed on the picture.
  - The read is recorded in three places, all written by agents: the merge message, `47a76840`'s body ("read the words with that said"), and the ledger line above.
  - None of them dates the moment the words reached their reader.
  - A commit body has overstated a read before: see the ledger's correction line for D-2026-11-05-LTCSPEED.
- **Choice: the six, and how each met its read.** The six are every deposit with a run line under v2.8 or v2.9; the script checks the list against the ledger.

| Deposit | How it met its read | Source |
|---|---|---|
| BBSLOOK | read first | `94b53d49`: on the yes to the final text |
| HEARDRISE | read first | `77c674b9`: placed from the approved words |
| DSPLOOP | read first | `d659e922`: read whole in a reading copy before "Yes, place it" |
| OBSIDIAN-RETIRED | read first | `4f475baf`: yes to the final words; the draft waited as a file in The Shop's bundle, `1ab3271c` |
| LTCSPEED | landed on main before its words were read; read whole on 2026-11-08 | the ledger's correction line of 2026-11-08 |
| AUDILLUSIONS | placed on a branch, then read | this piece |

  - "Read first" rests on those agent-written bodies, so the picture says "by their commits". BBSLOOK's and OBSIDIAN's bodies say "yes to the final text/words", which implies a read without saying one.
  - BBSLOOK and HEARDRISE merged 5 min 53 s and 8 min after their first commits.
  - Before v2.8 the count is not taken. The rule this piece's anchor states was added to the page in v2.9 (`683c0aa5`, 2026-11-03), paying tuning items 15 and 22.
    - Item 22 says D-2026-10-06-WAVETABLE waited six days between the map and the yes, "safely in its worktree".
    - That deposit has only its landing commit in git (`8d3315d3`), so git cannot draw its wait.
- **Choice: the frame.**
  - The time axis is broken twice, and the two panels are on different scales (about 23 and 68 px a minute at 1000 px).
  - Where the branch leaves main is not drawn to time.
  - The frame ends at the merge. The deposit's commissioning baton to Enrichment (`01b19c9a`) came 5 min 54 s later, and its tuning run line (`7b9c1cd8`) 21 s later. Both are left out.
- **Choice: no person is named on the picture,** and the wait is not drawn as anyone's delay. The wait's figure is set smaller than the title and the exception line, so the picture's weight is on the claim, not the duration.

**Leaking in:** the Deposit Ceremony's own tuning ledger (the reason, and the six runs). There is no neighbour page.

**Anchor:** "waits in a worktree of its own, on a branch"

**Made with:** git (the palace's own record), read by `make.py gather` into `deposit-record.json`; the tuning ledger; Drawn SVG; headless Chrome for the PNG. Script: `make2.py`, which imports `make.py`'s record checks. There is no randomness to seed.

**Not for the bundle:** `deposit-record.json` (full commit bodies), `make.py`, `make2.py`, `provenance.json`, `challenge.md`, and the first version's files.

---

## The first version, kept: "Words wait on a branch" (job `words-wait`, `make.py`)

A challenger sent it back on 2026-11-17 for a small remake (see `challenge.md`). Every number held on its recount, but the words did not:

- "1 fix, flagged on 4 Nov" put a date on the record that it does not give. The repeat was made by the second read's own fix commit; it was not merely flagged by that read.
- That this deposit is the exception was said only in the honest line, not on the picture or in the caption.
- "That is the ceremony's design" claimed too much. Step 5 asks for the read before writing; step 6 covers only what waits.
- In the honest line, "nothing else in the record shows the read", "within 13 minutes" and "six minutes later" were each slightly wrong.
- The caveat was the smallest text, and "3 days 22 h" was the loudest.

Its files stay beside the remake and are not for placing.

The remake's second verdict (keep, once one line changed): the exception line counted 1 + 4, which a stranger could fill in as six read first. It now reads 1 + 4 + 1, with the four attributed to their commits and the sixth to the ledger's correction, in the correction's own terms.
