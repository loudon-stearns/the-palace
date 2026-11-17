# Search Before You Build — upstream

**Title:** The answer was already upstream

**Caption:** Nothing was missing on 9 July. The near/far bracket that fixed the flat depth pass had been in the palace for 25 days, in three proofs, and a ComfyUI client for 13. Both were written again from scratch that morning. The search was the step that didn't happen.

**What is real and what is a choice**
- Real: every date and time. The bracket line (`min(dists)*0.82`) was first committed in `bench.py` on 2026-06-14 (`4b1aee0e`), in `gallery.py` on 06-17 (`489512fd`) and in `pair.py` on 06-18 (`b43a7327`). These are all the files holding it in the tree just before the fix (`git grep` at `8156fa3d^`). `lib/comfy.py` was added on 2026-06-26 (`3952e9ac`). Render 005 (flat) is stamped 11:35 and render 008 (bracketed) 11:47 in `GenAI Camera/renders.json`. The fix commit `8156fa3d` is 11:48 and its message cites `proofs/track-IV-bench/bench.py`. The days are counted two ways in `make.py` (from git and by calendar arithmetic). Read 2026-11-17.
- The maker's, not the page's: the counts 25 and 13, and the fact that the bracket was in three proofs. The page names only `bench.py`.
- Choices: the window runs 11 June to 11 July. Each date is a file's first commit holding the line, not the day anyone first ran it. "Written fresh" for the client rests on the page's sentence; there is no commit time for the restart, so it is marked on the day, not the hour. The plates are cropped to head and torso, shrunk to 120 px and kept at their rendered tones, unstretched. At this size the difference between them is faint, and the piece leans on the times, not on the plates.
- Not claimed: that the reflex's step-1 grep would have surfaced `bench.py` on the day. On 2026-07-09 the term "depth" matched 199 files under the proofs, so a bare grep would have drowned. The bracket's own line would have matched in three.

**Leaking in:** [[GenAI Camera]]. Its two depth plates, renders 005 and 008, are the ones its own rich piece "depth auto-range" uses, here small and unstretched. Its Gotchas sentence: "Depth reads flat unless the near/far brackets the subject."

**Anchor:** "The knowledge wasn't missing"

**Made with:** the hand (`make.py` reads git and `renders.json`, crops the plates) → Drawn SVG, rasterised by headless Chrome at 2x.
