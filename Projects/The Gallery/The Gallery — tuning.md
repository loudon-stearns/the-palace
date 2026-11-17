---
title: "The Gallery — tuning"
born: 2026-11-03
links:
  - target: "[[The Gallery]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am The Gallery's record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review."
ledger: tuning
standards:
  for: "what each steward cycle taught The Gallery about how it works"
  run: "one steward cycle"
  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"
  writes: "the steward cycle (process-cycle.js), in the cycle's commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon's review"
  merge: union
  kept: git
  trim: never
---

# The Gallery — tuning

What The Gallery's steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on 2026-11-03, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.

## From cycle 1 — 2026-11-03

1. Dropbox file dates are last-touched dates: one folder carries a zero 1969 timestamp and Emerson's was touched yesterday, so a folder's median file year is a better first guess than its first-to-last span. *(offered by the steward, cycle 1)*
- run · 2026-11-03 · cycle 1 · taught item 1

## From cycle 2 — 2026-11-17

2. Many folders share the date 2003-09-08 because a copied third-party waveform library (AKWF) carries it, and copied libraries can also fool the 'made' signal. So before a sweep's folder counts as Loudon's work, check that its date isn't a shared stamp and that its patches aren't a vendor's. *(offered by the steward, cycle 2)*
3. **Proposed for canon** · 2026-11-17 · `Projects/The Gallery/The Gallery — spec — media store.md` · § Order of building, a new paragraph after the numbered list · canon change owed *(proposed by the steward, cycle 2)*
   Why: the spec should say what exists so the next builder starts from the tool, not from scratch
   Path: `Projects/The Gallery/The Gallery — spec — media store.md`
   > **Built so far (2026-11-17).** A first slice of the tool runs from `Projects/The Gallery/workshop/store/store.mjs`: put, get, check, ls and sweep. The mirror root can be redirected with `STORE_ROOT`, which is how it was tested on a throwaway folder. It reads the dataless flag with `/usr/bin/stat -f %f`, because Node's stat does not expose it. `sweep` rolls up one row per folder by lstat alone, and holds back folders whose names read as money or paperwork. It has not yet touched the real Dropbox/Palace, the resolver does not know it, and `link` is unbuilt. It moves to `_ops/store/` on Loudon's yes.

- run · 2026-11-17 · cycle 2 · taught item 2, proposed item 3 for canon

## From cycle 3 — 2026-11-17

4. A sweep one level deep turns umbrella folders into hundreds of candidates, mostly two-file Live sketches, so gather the small ones into one sketchbook a year before they count as works, or the line drowns. *(offered by the steward, cycle 3)*
- run · 2026-11-17 · cycle 3 · taught item 4

## From cycle 4 — 2026-11-17

5. A palace page's last commit is a last-touched date just like a Dropbox file's: weaves and sweeps edit every page, so end a palace work at a date its own page or scroll names, and treat git's last date as the latest it could be. *(offered by the steward, cycle 4)*
- run · 2026-11-17 · cycle 4 · taught item 5
