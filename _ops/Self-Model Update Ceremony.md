---
title: Self-Model Update Ceremony
type: practice
pillars:
  - practice
  - philosophy
  - tools
born: 2026-03
stage: mature
version: "2.0"
trigger: ["self-model update"]
links:
  - target: "[[SUBSTRATE]]"
    type: enables
  - target: "[[Weave Ceremony]]"
    type: connects-to
    label: end-of-weave
  - target: "[[Palace Map]]"
    type: connects-to
    label: reads-its-diff
  - target: "[[Map Build Ceremony]]"
    type: connects-to
    label: runs-after
---

# Self-Model Update Ceremony

![[Self-Model Update Ceremony — hero.png]]

## Ceremony Contract

**Trigger:** "Self-model update"

**When:** at the end of a Weave; when the palace grows, retires or rewires an organ (a new ceremony, a new `_ops/` machine, a new meta entry that runs something); when the anatomy check fails; or when someone asks "what is the palace?" and [[SUBSTRATE]] gives a wrong answer.

**Preconditions:**
1. `SUBSTRATE.md` and `SUBSTRATE/SUBSTRATE — anatomy.json` are readable.
2. A Palace Map built since the last run exists under `_ops/maps/`. If the newest build is older, run the [[Map Build Ceremony]] first.

**Postconditions:**
1. **The anatomy is whole.** Every organ the palace actually runs is in `SUBSTRATE — anatomy.json`, with its home, its members and its four casts. Every page carrying `trigger:`, every `_ops/` machine and every meta entry that runs something either belongs to an organ or is named in the run's commit body as left out on purpose. The anatomy check passes.
2. **The anatomy is readable.** A fresh agent given only `SUBSTRATE.md` can name every system and organ and say how they couple. Test it: dispatch one, then compare its answer with the JSON.
3. **The weights are current.** `node _ops/self-model/anatomy.mjs --write` has rewritten `SUBSTRATE — anatomy — measured.json`, the diagram's weights, from frontmatter and git as they stand at the run's commit. Weights are measured, never written by hand.
4. **The reading is current.** § Where it stands names the map build it read. Its few lines interpret the map; they don't copy counts. The open questions are live: a settled one moves to [[SUBSTRATE — Context]] with what settled it.
5. **The run is recorded.** The commit goes out under the ceremony's subject: `palace-commit --ceremony "Self-Model Update" --summary "<date> — <what changed in the self-model>"`. It carries the tuning file's run line.

**Failure mode:** an anatomy written from memory. The palace changes faster than any one agent's recollection of it. Every organ added or removed in a run must point at a file or commit that shows it is real.

---

## What the Self-Model Update Is

[[SUBSTRATE]] is the palace's self-awareness: its picture of its own anatomy, cast four ways, and the questions it is carrying. It is not a census. The [[Palace Map]] counts, and `palace-map.py` reads the counts for anyone. It is not a philosophy document either; that is the World's job. SUBSTRATE is the palace looking at itself and saying what organs it has, how they couple, and what each of them is when seen as machinery, as a body, as a metaphysics and as a practice.

The map is the palace's proprioception: the raw feel of its shape. This ceremony is the step after that, the palace saying what the shape means. In [[Scale-Stratified Identity]]'s terms, it keeps the *description level* in honest contact with the network level beneath it. The description may lag ([[Drift and Consolidation]]), but never silently.

## Protocol

**Step 1: Read the ledger and the page.** Take the tail read of [[Self-Model Update Ceremony — tuning]] ([[SCHEMA — Reference]] §6); those lines are this run's first candidates for a spec change. Read `SUBSTRATE.md` whole and the anatomy JSON.

**Step 2: Read what changed since the last run.** The tuning file's last run line gives the date of the last run.
- `python3 _ops/swarm/palace-map.py diff <last run's map date> <newest map date>`: nodes born and composted, edges formed and dissolved, degree swings.
- `git log --since=<last run> --diff-filter=AD --name-status -- '_ops/' '*.md'`: ceremonies, machines and meta entries born or removed.
- Every page carrying `trigger:` (`git grep -l '^trigger:' -- '*.md'`) and every directory under `_ops/`.
- The newest Weave report, if there is one since the last run.

**Step 3: Run the anatomy check.** `node _ops/self-model/anatomy.mjs` (exit 1 on a problem). It names any organ-like thing that belongs to no organ, any member title that no longer resolves, and any coupling whose ends are missing. Each finding becomes a draft change to the JSON: a new member, a new organ, a coupling, or a deliberate leave-out. When it passes, run it again with `--write` for the weights.

**Step 4: Draft and show.** Draft the changes to the JSON and to SUBSTRATE's prose together. § Anatomy is the text the diagram illustrates, so the two must agree. For a new organ, write all four casts. Use the palace's own metaphors where it has them. Where a lens has no honest name, say "no honest name yet" rather than force one. Show Loudon the diff, not the whole file. Then run postcondition 2's fresh-reader test on the draft.

**Step 5: Commit.** Write through the committer under the ceremony's subject (postcondition 5), naming the paths. The commit body names the version and ends with what this run taught the ceremony ("nothing" is a legal answer). Mark the tuning file with the run line. A lesson that changes the spec also goes there as a numbered item.

## The Mirror

SUBSTRATE is the palace's mirror, and the ceremony is looking into it with clear eyes. The palace is always ahead of its own description. A run closes that gap for a while, and the next organ the palace grows opens it again. That is growth, not failure. A gap nobody can see is the failure.

## Open Questions

- Between runs, who adds a new organ to the anatomy? The Deposit that births a running meta entry, or only this ceremony?
- Should the anatomy check also run in the Weave's lint pass, so a missing organ shows up as a finding there?

*Settled in v2.0:* SUBSTRATE gets no change log of its own, because git, this ceremony's scroll and [[SUBSTRATE — Context]] hold the history ([[ELDER]] § Write what is, not what was). At maturity the ceremony does move from facts to interpretation; v2.0 is that move. The bar for a run is concrete now: an organ born, retired or rewired, or a failing check.

---

*The version and what each update taught the ceremony: [[Self-Model Update Ceremony — tuning]].*
