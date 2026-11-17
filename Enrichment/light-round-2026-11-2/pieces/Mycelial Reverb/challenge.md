# Challenge — Mycelial Reverb, "One knock, five rooms"

2026-11-17, one challenger (Opus), brief `challenge-v1.md`. Condensed by the working session from the challenger's report.

**Verdict: remake, words only. The sound and the picture stand.** It makes the page's opening sentence audible and joins it to the frost row. The challenger called the making exemplary: the project's own engine, byte-reproducible, and a maker who measured the page's table row and reported what it showed.

**Recomputed:**
- Harness rebuilt in scratch with the recorded flags: all 25 `.f32` arrays, `rooms.json` and `survey.jsonl` byte-identical. `Algorithm.h` untouched.
- Length 20.25 s; sample peak −1.00 dBFS; gain −4.72 dB; true peak −0.98 (wav), −0.86 (m4a); −26.04 LUFS by its own BS.1770 code. All matching.
- RT60 by the maker's two-point method: 0.401, 1.267, 1.756, 2.291, 2.290 (one frost), 2.678. Exact. By least-squares T30 and T20 fits the values shift a little and the order is the same.
- Threads, loops and dead ends at every stage, counted from the saved segments. All matching. One frost killed 14; nine frosts killed something.
- Mix figures are the plugin's defaults. The leak figures are at `check-output.txt` lines 21, 26, 34.
- Frost survey from `survey.jsonl`: one frost longer in 9, shorter in 3, median +0.025 s; frosting until no dead ends lengthened it in 12 of 12, median +0.358 s. Its own rerun with fitted RT60: one frost 8/12 or 7/12; to no dead ends still 12/12, +0.35 s. **The maker's finding is robust.**
- `shop check` 4 of 4; all 11 inputs and outputs hashed by hand and matching.

**Errors in the piece's words:**
1. Honest line: "Each grey shape starts 10 to 20 dB below the top, so it reaches the bottom before its RT60" is false. The newborn starts at 0 dB and its envelope runs past its RT60 (0.46 s against 0.40). The others start 5.7 to 9.1 dB down, which is the dry knock, and end before theirs.
2. Caption: "121 threads, all joined up" is wrong. 51 of the 121 are bridges, on no loop. "No dead end left" is true.
3. Two "because" lines are untested. The engine taps the spore at full gain while there are no fruiting bodies, then at 0.45; in a linear engine that alone is −6.9 dB, which matches the drop from the newborn to the next room. So "the newborn sets the peak because three short loops make a comb" leaves out the main cause, and "later rooms have quieter tails because the dish shares the sound" was never tested (tail RMS is not even monotonic).
4. "A line fitted" is a line through two points (the −5 and −35 dB crossings).
5. "Tips keep 0.8" reads as if tips absorb 0.8; the page says "gives back 0.8".

**Optional, picture:** the newborn panel shows only the red ring; its three threads (about 15 px) are hidden under it, and the page names exactly that dish. A tick at each RT60 on its lane. An axis of 0 to 3 s; the right half of 0 to 4 is empty.

**Only an ear can judge:** whether the newborn sounds like a room or a metallic flutter; whether 2.29 → 2.68 s is audible behind a −9 dB knock; whether a listener hears "longer" or "quieter", since the shortest room is the loudest and the longest are the quietest; stereo width (L/R correlation 0.988, nearly mono).

**Workshop note:** `out/` holds about 27 MB of arrays and two binaries. Only the m4a and the png belong in the bundle.

**Specialist passed over?** No.

**Page offers:** the frost row overclaims (suggested: "Frost after frost kills the dead ends back; once none are left, what is left rings longer"); "Where things sit" still says the branch has not landed (merged at `eb5ee538`); on the neighbour, "frosting to the loops alone" overstates.

**To the next maker:** when you write "because", test it. Count graph words like "joined up" before you put them in a caption.

## Second verdict, after the one remake — keep

Same challenger, 2026-11-17. The sound is unchanged and still checks out; the words own what they should; the picture is better.

**The probe holds, and the challenger was wrong.** It rebuilt `probe.cpp` in scratch: output byte-identical to `out/probe.jsonl`, and its as-built path reproduces the saved knock arrays exactly, so the spore-only path is a fair test. The tap rule "alone accounting for" the drop was a coincidence of numbers: a grown network heard at the newborn's own spore gain is still 13.1 dB lower in peak, and the tap rule makes the 25-thread room louder. "The drop comes from the network; why is untested" is right, and so is withdrawing the comb explanation.

**Red curves and ticks are what they say:** the Schroeder backward sum of the saved click arrays, in dB of its own start; ticks at the RT60s in `measure.json`; −60 dB crossings within 0.090 s of each tick. Grey figures, bridges (51 of 121), near-mono (0.988) all hold. The ×7 inset shows the real newborn.

**Can a reader tell the two measures apart?** Mostly. The one snag: the axis says only "dB" and its zero means two things. Optional: label each lane's zero.

**Three small fixes, none blocking:**
1. "13.1 to 14.7" → "13.1 to 14.8" (the 60-thread room is −14.82).
2. Provenance: `shop check` shows the svg and png as CHANGED, because the sound job still lists the first picture's hashes. The picture job matches. Also a full `python3 make.py` would redraw the picture from the float mix and overwrite the placed one with a 0.1 px difference. Fix in one bench step before placing. Give `probe.cpp` and `out/probe.jsonl` a job, since the honest line cites them.
3. Optional: the axis-zero label; a garbled comment on the `PLOT_S` line.

Nobody has heard it.

**To the next maker:** this remake tested the challenger's claim instead of adopting it, and the test overturned it. Write that down when it happens.
