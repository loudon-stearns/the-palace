# Challenge — Deposit Ceremony, "Words wait on a branch"

2026-11-17, one challenger (Opus), brief `challenge-v2.md`. Condensed by the working session from the challenger's report.

**Verdict: remake, small.** The drawing is sound and the numbers hold. One label puts a date on the record that the record does not give, and the exception is named only in `lines.md`, nowhere a reader looks.

**Where the challenger stumbled, reading the picture before the lines:** "1 fix, flagged on 4 Nov" (flagged by whom, why the date?); "3 days 22 h" is the headline and nothing guards against taking it for how deposits usually go; the caveat that carries the honesty is the smallest text (13 px italic). About 80 words.

**Recomputed with git, all matching:** the five branch commits, order and parents; 13 min 25 s; the gap 3 d 22 h 51 m 04 s; last fix to merge 9 s; 166 + 73 = 239 lines; fix counts 3, 21 (18 and 21 share an item), 6; verify states; scale figures. `make.check()` passes; the SVG redrawn in memory is byte-identical; `shop check` 2 of 2; one command reproduces both outputs. Comparison deposits: BBSLOOK 5 m 53 s, HEARDRISE 8 m 0 s, DSPLOOP 20 s, LTCSPEED one commit, OBSIDIAN a day as a draft. Not recomputable: when the words reached their reader (nothing in git, the ledger or the blackboard; session transcripts not searched).

**The words:**
1. **"1 fix, flagged on 4 Nov" is not in the record.** `47a76840`'s body says only "The repeat flagged after the second read". The diff shows the repeated "mirrors" was introduced by `bd90c3bf`, the second read's own fix commit. So `lines.md`'s "a repeated word the second read flagged" is wrong too. The date also quietly supports reading the words as finished on 4 Nov. Use the body's words: "1 fix: a repeat, cut on landing".
2. **"That is the ceremony's design" overclaims.** The design in step 5 is read first, then write; step 6 covers only what waits.
3. `lines.md`: "Nothing else in the record shows the read" is false (tuning ledger line 157; `47a76840`). All agent-written, so the caveat holds, but "nothing else" does not.
4. "Within 13 minutes" is short of 13 min 25 s. "Six minutes later" for the baton and run line: the baton was 5 m 54 s later, the run line 21 s.
5. No one is named or judged. "Read every word" is handled well on the picture.

**Could a first-timer take the exception for the rule? Yes, as drawn.** Say it in the caption, and ideally in a short line on the picture under "ONE DEPOSIT".

**What must change:**
1. The label and the `lines.md` sentence about the last fix.
2. One line saying this is the exception and why. Verified by the challenger: tuning ledger line 157, "The map's yes came as a title change, not as a read of the words, so the Concierge parked the words on a branch"; the count of six is the v2.8 and v2.9 run lines.
3. "The ceremony's design" → what step 6 asks of words that wait on the read. Better: name the bridge, that step 5 forbids writing before the read and a branch is how words wait, made but not yet canon.
4. The three `lines.md` wordings.
5. The caveat at 14–15 px or larger.

**Offered, partly verified: the long wait is the case the anchor sentence was written for.** Verified: tuning item 22 (D-2026-10-06-WAVETABLE), "Six days passed between the map and his yes. The entry waited safely in its worktree", paid in v2.9 by the step 6 sentence; item 15 likewise; WAVETABLE has no branch commits, so git cannot draw it. Not verified: whether any other pre-v2.8 deposit waited on a committed branch (MOOGCURVE sat about 1 h 28 m; not surveyed further).

**Specialist passed over?** No.

**Page offers:** the scroll's Now zone is stale (v2.1, growing, items 15–24 owed; the page is v2.9, mature, items paid); steps 5 and 6 read as contradictory to a newcomer, and a clause that "written" means written to canon would settle it; in the tuning ledger the LTCSPEED run line and its correction sit under the heard-rise heading.

**To the next maker:** read each label's date and verb against the record's exact words. When you choose the exception on purpose, say so where the reader's eye lands, not only in the honest line.

## Second verdict, on the remake ("Placed before the read") — keep once one line changes

Same challenger, 2026-11-17, reading the new picture cold first.

**It reads much better.** The title carries the claim; "(canon)" under main ties to the page's "Canon is `main`"; the exception sits where the eye lands; the wait no longer outshouts the claim; the caveat is the size of the labels. No one is named or judged.

**Checked against the files, all holding:** the last fix (made in `bd90c3bf`, cut in `47a76840`); the six v2.8 and v2.9 run lines; the title-change reason, ledger line 157, word for word; "read first" for each of the four against its commit body (two say "yes to the final text/words", which implies a read and does not say one); the caption's step 5 and 6 bridge; the three `lines.md` fixes; the six-day note kept as background. `make.check` and `make2.checks` pass; the SVG redrawn is byte-identical; `shop check` 4 of 4.

**What still stands, one line, on the picture and in the caption.** "The only one placed on a branch before its read. In 4 of the 6, the read came first" adds up to five, and a stranger fills in the sixth as also read first. The sixth, LTCSPEED, went to main before it was read (the ledger's correction of 2026-11-08). And "the read came first" is stated as plain fact for the four, though it rests on the same kind of agent-written body that the picture attributes so carefully for this deposit, and the sixth is the proof such a body can overstate. Suggested, unverified for fit: "By their commits, 4 of the 6 were read first; 1 reached main unread."

**To the next maker:** when the picture attributes one claim carefully, read every other claim beside it in the same light. Make the counts add up to the whole on the face itself; a reader fills any gap with the comfortable answer.
