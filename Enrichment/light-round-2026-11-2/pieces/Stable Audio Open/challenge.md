# Challenge — Stable Audio Open, "One drop a second"

2026-11-17, one challenger (Opus), brief `challenge-v1.md`. Condensed by the working session from the challenger's report.

**Verdict: remake the caption only.** Sound and picture stand. It joins the gotcha and the Recipe, which the page holds apart, and repeats nothing.

**Recomputed on the saved m4a (decoded twice, own detector), all matching:** length 21.0 s; sample peak −0.97 dBFS; −22.1 LUFS integrated; left and right identical; asked half 28, 19, 13 onsets at 10, 20, 40 ms windows, the 19 onset times, gaps 0.040 to 1.340 s; placed half 10 onsets at every window, mean gap 1.002 s, s.d. 0.011; the whole 26 s take at 40 onsets, matching 2026-11-14 (63, 56, 69, 40 over the four seeds, so "40 to 69" holds); seed 1935 is the fewest-onset take, so "kindest" is true; the four single-drop cuts and their isolations; the missed first event (frame 0 is already over threshold). Hashes match; `shop check` passes 3 of 3. Not recomputable: generation times.

**Not stated in the piece:** true peak is −0.1 dBTP (ffmpeg ebur128), close to the ceiling.

**Where it fails:**
1. Caption: "the same model keeps the rate" is wrong. The model keeps nothing; the hand placed the drop on a grid, so the second half is exact by construction. The page says "place it at the rate yourself". `jobs.json`'s claim "keeps the rate exactly" carries the same error.
2. Caption: "onsets fall 0.04 to 1.34 s apart" leans on the smallest gap, which is very likely one drop and its splash and moves with the window. Sturdier: a count. "19 onsets in its first 10 s where ten were asked, up to 1.34 s apart and bunched in bursts".
3. Honest line, two gaps: the asked count also depends on where the 20 ms windows start (21, 22, 19 at three offsets; the placed half stays 10); and the placed half's exactness comes from the grid, not from anything measured.

**Workshop note:** five `.npy` takes (about 12 MB) sit in the folder outside `outputs`. They must not travel to the bundle.

**Only an ear can judge:** whether the asked drip is heard as unsteady or just as a drip; whether one drop repeated identically ten times sounds like a drip or a machine; whether the drop sounds like water.

**A better piece, optional, only if the ear finds the identical repeat false:** three of the four drop seeds cut clean (1932, 1934, 1935); place them in rotation with a small timing jitter.

**Specialist passed over?** No.

**Page offers:** § Recipes says varied repeats are "not yet tried" and ledger item 23 tried it over many seeds (say which); the medium-model lines are stale against item 20 in three places; the noise fault (items 19, 21, 22 and Loudon's 2026-11-15 words) is on no line of the page; Test Suite says "Last run 2026-05-30".

**In the Shop's ledger:** the maker's taught line says "0.2 to 1.3 s apart" where the measurement is 0.04 to 1.34; one job left three run lines.

**To the next maker:** when one half of a comparison is exact by construction, say so in the caption and credit the hand, not the tool. Put a count in the caption, not a smallest gap; the smallest gap is the number the detector's window decides.

## Second verdict, after the one remake — keep

Same challenger, 2026-11-17. The remake went past words: the true peak broke Sound from Code's house ceiling (−1 dBTP), so the whole file was lowered and rerun through the bench.

**Re-measured on the new m4a, all matching:** 21.0 s; mono; sample peak −2.35 dBFS; true peak −1.47 dBTP by 4× oversampling, −1.4 by ffmpeg; −23.5 LUFS; exactly −1.40 dB below the first version, sample by sample, so one gain; asked half 28 / 19 / 13 onsets, gaps 0.040 to 1.340 s; placed half 10 at every window, mean gap 1.002 s; window-start counts 21, 22, 21 and 19. All four hashes match; `shop check` 3 of 3. The house numbers are on Sound from Code's page (§ House rules a maker meets here) and Maker § House Standards.

**Caption:** now claims only what the piece shows. Leads with the count, gives the largest gap, and says the second half's rate "is kept by the hand, not the model".

**7.5 LU under the house −16 LUFS:** accepted, and owned. Reaching −16 would put true peak near +6 dBTP, so it would mean limiting about 7 dB off the attacks the piece is about. It will play quieter than sounds beside it; the placer should know.

**Three small notes for the placer, not a remake:**
1. The halves differ by 6.6 LU (asked −27.7 LUFS, placed −21.1), matched by peak. A listener will hear the steady half as louder and could take that for part of the finding. One clause in the honest line.
2. 44.1 kHz, where the house line says 48 kHz stereo. A second house deviation, not owned.
3. `provenance.json`'s chain text does not name the lowering step that `lines.md` does. The check compares hashes, not chain text.

Nobody has heard it.
