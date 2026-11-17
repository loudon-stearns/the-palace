---
title: "Search Before You Build — rich — the same flat depth, eight days earlier — what is real"
born: 2026-11-17
links:
  - target: "[[Search Before You Build]]"
    type: connects-to
    label: rich-face-of
forward_vector: "I keep, whole and in the maker's words, what is real and what is a choice in the piece beside me, so a reader of the face can tell a finding from a decision."
---

**What is real and what is a choice**

- Real, all from git at `8156fa3d^` (the palace just before the fix), and all recomputed by `make2.py` from `sources-v2.json`, read 2026-11-17:
  - **Code, first lane.** The bracket line was first written on 2026-06-13 (`5e2cbb94`) in `Shop/Blender/tests/blocking/pose_and_emit.py`. That file was born under `Artifacts/` and moved on 06-16, so its own path history starts late. The line was then copied into `bench.py` (06-14), `gallery.py` (06-17) and `pair.py` (06-18), which makes four files. On 2026-07-01 a different function doing the same job, `subject_depth_range()`, was written into `faces_rig.py` and `hands_rig.py`.
  - **Commits, second lane.** Three commit messages on 2026-07-01 (`50251a81` 01:20, `6710ddc7` 01:24, `21d2405d` 07:46) name the symptom and the fix. Their words include "depth is flat", "instead of flat grey" and "Depth was flat: the range was measured over the WHOLE body". 1 July to 9 July is 8 days.
  - **Pages, third lane.** Two `.md` files name the auto-ranged near/far: `Shop/Blender/tests/gotchas-2026-06-13.md` and `test-plan.md`, both from 2026-06-13. Neither names the symptom. Out of every `.md` line at `8156fa3d^` that matches the range terms, 0 also match a symptom word. The first page line that does is in `GenAI Camera.md`, added by the fix commit at 11:48 on 9 July: "A depth pass reads **flat — a silhouette, not volume**".
- Choices a reader could take for findings:
  - A "page" here means any `.md` file in the tree. The search runs line by line with two regexes, both stored in `sources-v2.json`. A warning split across two lines would escape it. I read the hits by hand as well, and the Figure Rig's own pages, which were written the same morning as the 1 July fix, record the guides but not the depth fix.
  - HTML proofs are left out of the pages lane.
  - Two code lines are shown. The round dots are the bracket as it sat in BLUELINE. The square on 1 July is `subject_depth_range()`, a different line doing the same job.
  - The open dot on the pages lane is placed by the pages' own first commit (`5e2cbb94`, 2026-06-13): `gotchas-2026-06-13.md` and `test-plan.md`, the `.md` lines about depth that name auto-ranging. It shares that day with the bracket's first code because both came in the same commit.
  - "The same flat depth" is my reading. Both had the same cause (a MapRange near/far wider than the subject) and the same fix (fit near/far to the subject). Both came out of the Figure Rig's family:
    - On 1 July the fix went into `faces_rig.py` and `hands_rig.py`, in `Projects/BLUELINE/proofs/blender-handdrawn/followups/rig-openpose/`.
    - The GenAI Camera was "built + proven 2026-07-09 on the studio Figure Rig" (deposit `a7c45e5d`). That studio rig is `figure_rig_pose_studio.py`, in the same folder. Its `render_plates` sets a fixed MapRange of 2.0–5.5 (line 227), both at `8156fa3d^` and today. The 1 July fix never reached it.
  - What I could not verify is that the camera's flat pass came from that line. The fix commit gives the camera's range as 1.2 bu, not 3.5, and says its Blender panel "had only lived in the live session", so the code that rendered render 005 was never recorded. What holds: the camera stood on a rig whose depth range was never fitted to the subject, eight days after its sibling rigs were fixed.
  - The red mark at 9 July puts the miss and the page warning on the same day. The miss itself has no time in the piece.
  - The window runs 11 June to 11 July.
- Corrections to round one: the bracket was in four files from 13 June, not three from 14 June, because round one's search missed the spelling with spaces. "Both written fresh" is gone. The plates are gone.
- The challenger's offered claim did not hold as stated. It said no prose named the bracket until 9 July, but a Shop gotcha named it on 13 June, and commit messages named the symptom on 1 July. What does hold is narrower: no page warned of the flat before 9 July.
- Not claimed: that a search on 9 July would have found the 1 July commits. `git log --grep="depth is flat"` finds them, but only if the searcher already has the symptom's words. "depth" alone matches 199 files under the proofs (case-insensitive, binaries included; the challenger counted 198 with the page's own `grep -rn`). That number is recorded in `sources-v2.json` and is not drawn.

**Leaking in:** the Figure Rig's 1 July commits (`Shop/Figure Rig.md` is the Specialist they serve) and [[GenAI Camera]], whose Gotchas line "A depth pass reads flat — a silhouette, not volume" was the first page to warn.
