# Challenge — Search Before You Build, "upstream"

2026-11-17, one challenger (Opus), brief `challenge-v1.md`. Condensed by the working session from the challenger's report.

**Verdict: remake.** The dates are right and provenance matches. The headline says the wrong thing was rewritten, half the picture is two plates that look the same, and the piece stops short of the find its own records hold.

**Recomputed:**
- The bracket line in exactly three files at `8156fa3d^` (bench.py:169, gallery.py:256, pair.py:64), by `git grep -F` over the whole tree. Confirmed.
- First commits: bench.py `4b1aee0e` 2026-06-14, gallery.py `489512fd` 06-17, pair.py `b43a7327` 06-18, lib/comfy.py `3952e9ac` 06-26. Confirmed, no renames.
- 25 and 13 days. Confirmed. But gallery.py and pair.py held the line 22 and 21 days, so "for 25 days, in three proofs" runs two facts together.
- Render 005 at 11:35, render 008 at 11:47, fix commit 11:48:47 naming bench.py. Confirmed.
- Axis positions match.
- "depth matched 199 files": not computed in make.py. 199 only case-insensitive with binaries; the page's own `grep -rn` gives 198 at `8156fa3d^`, 187 text files only.
- The plates' lit range: about 173–203 (005) against 144–195 (008). Real, faint.
- Not recomputable: the time the fresh client was started.

**Where it fails:**
1. "Both were written again from scratch" and the red "both written fresh" say the bracket was rewritten. It was not. The depth pass was written without the bracket; the fix then took bench.py's.
2. "That morning" has no source for the client in the piece. The deposit `a7c45e5d` (11:41, 9 Jul) does support it. Cite it or drop the word.
3. The plates repeat GenAI Camera's face, where they are stretched so the difference reads. Here, unstretched and small, they read as two identical images.
4. The honest line does not own: render 005 over 007; choosing lib/comfy.py when earlier ComfyUI clients existed (`Shop/RunPod GPU Backend/pod-comfyui-client.py`, 14 Jun; `Shop/Blender/tests/blocking/run_comfy.py`, 16 Jun); the case-insensitive 199.
5. About 75 words inside it, labels 12–13 px grey, footer 11 px. Not few and large.
6. `provenance.json` inputs is `{}` while `jobs.json` lists three inputs, so the inputs are not hashed.

**The better piece.** At `8156fa3d^` the bracket existed only as one uncommented code line, mid-script, copied twice. No prose named it: `track-IV-report.md` never mentions near/far or a bracket; BLUELINE's front-door docs say nothing; no `.md` in the palace held "bracket" near near/far/subject. It was first put in words on 9 Jul: the fix commit message at 11:48, then GenAI Camera's Gotcha 1 at 13:34 (`9a62d511`). So: keep a trimmed timeline; beside it show the line as it sat, and a column for where a searcher reads (report, front door, Gotchas), empty until 9 Jul. Caption, roughly: the answer was in the palace, but only as code, in a line no word named. That joins "Why it exists" to Forward Vectors, the page's own claim that lessons must move "from where it's found to where it's read", and it says why the miss happened.

**Specialist passed over?** No.

**Page offers:** "already in `bench.py` and its report" — the report does not state the bracket; `lib/comfy.py` is ambiguous as written; step 1's `grep -rn` is a shim in this harness that skips gitignored files, so the reflex's own command can miss silently; the hero shows every drawer closed where face.json asked for one open.

**To the next maker:** before you draw what happened, find out why it happened. Ask what a searcher would actually have read on the day, and draw that. When a neighbour's plates only read once stretched, do not include them unstretched; point at the neighbour.

## The maker checked the "better piece" before drawing it, and it did not hold as stated

2026-11-17. Asked to verify the challenger's claim itself, the maker found: prose did name the range before 9 July (`Shop/Blender/tests/gotchas-2026-06-13.md:89–90`, `test-plan.md:60`, from `5e2cbb94`); the same flat depth had been hit and fixed on 2026-07-01 in the Figure Rig, with three commit messages saying so in words; and the bracket was in four files from 13 June, not three from 14 June (both maker and challenger had missed the spelling with spaces in `pose_and_emit.py`). What holds is narrower: no page warned of the symptom before 9 July. The remake, "The same flat depth, 8 days earlier", draws that.

## Second verdict, on the remake ("same-miss") — keep, after three small edits

Same challenger, judging it as a new piece. It confirmed it had been wrong on both points, its own way: its round-one variant search used `\s*`, which macOS git's extended regex does not support, so the second route failed without saying so.

**Recomputed, all matching:** the three 1 July commit messages, verbatim, and no earlier message stating the symptom; `subject_depth_range()` in `faces_rig.py:319` and `hands_rig.py:155`; 8 days; the fix's added Gotchas line; "no page warned before 9 July" by a broader search than the maker's (19 hits, none a warning); the Figure Rig's pages record no depth fix; dot positions in the PNG; `shop check` 4 of 4, inputs now hashed.

**It helps:** now a join, not a repeat. The three lanes show the lesson in code and in commit words and in no page until the day of the fix, which is the page's Forward Vectors sentence, and gives step 3 of the reflex its reason. About 45 words, 14 to 27 px.

**"The same" is stronger than the maker says** (the challenger's claim, to be verified by the maker before it is written): the GenAI Camera was built on the studio Figure Rig (`a7c45e5d`), whose own `render_plates` (`figure_rig_pose_studio.py:227`) had a fixed range of 2.0–5.5 on 9 July and still has. The 1 July fix went into `faces_rig.py` and `hands_rig.py`, not into the studio file the camera stood on.

**Three edits, none needing a third verdict:**
1. Caption: "would have found nothing about it" → "nothing that warned of it".
2. Honest line: replace "in different projects" with the Figure Rig fact, if it verifies.
3. Picture: the 1 July code dot sits under the bracket's label and reads as the same line. Label it `subject_depth_range()` or draw it as a different mark. One re-render.

**Small:** the hollow pages dot is placed with `code_days[0]`, not the page's own date; right only because both are 13 June.

**Page offers, added:** Block It in Blender, Ink It in genAI (line 51) gives "a Map-Range on View Z Depth" and says nothing about fitting near/far to the subject; `figure_rig_pose_studio.py:227` still uses the fixed range (code, an offer for its steward).

**To the next maker:** verify a challenger's claim before you draw it. Make every second route fail loudly; an empty variant search should make you suspicious. When two events look the same, check whether they share a parent.

## The three edits, applied by the maker — 2026-11-17

Seen by the working session at size; no third verdict, as the challenger said none was needed.

1. Caption now says a builder reading the pages "would have found nothing that warned of it".
2. Picture: the 1 July code mark is a square labelled `subject_depth_range()`, apart from the bracket's dots. The hollow pages dot is placed by the pages' own first commit (`5e2cbb94`, 2026-06-13); the maker's first attempt at that matched an unrelated page and it narrowed the match.
3. The Figure Rig claim, checked by the maker: three parts hold (the camera was built on the studio Figure Rig; `figure_rig_pose_studio.py:227` has a fixed 2.0–5.5 range then and now; the 1 July fix went only into `faces_rig.py` and `hands_rig.py`). One part does not: that the camera's flat pass came from that line. The fix commit gives the camera's range as 1.2 bu, and the panel code that made render 005 "had only lived in the live session", so it was never recorded. `lines.md` says what is known and that the exact source is not recorded.
