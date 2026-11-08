"""Checks for cut.py. Run: python3 test_cut.py"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from tempo_map import TempoMap, BEFORE_SONG
from cut import plan, beats_between, read_record

fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + (("  " + detail) if detail else ""))
    if not ok:
        fails.append(name)

# 1. One tempo: cut 1 of 2026-10-29, the one Loudon picked, frame for frame. make_cuts.py laid the boards
#    at song beats 96, 112, 120, 124, 132, 148 from an in-point at beat 88, end 164, 127 bpm, and counted
#    each frame as round((t - T0) x 24). In 4/4, song beat b is bar b/4 + 1.
tm = TempoMap([(BEFORE_SONG, 127)])
spb = 60 / 127
old = [round((b - 88) * spb * 24) for b in (88, 96, 112, 120, 124, 132, 148, 164)]
boards = [{"SHOT_ID": "0%d" % (i + 1), "BAR": str(b // 4 + 1), "BEAT": "1"} for i, b in enumerate((96, 112, 120, 124, 132, 148))]
rows, end = plan(tm, 24, boards, (23, 1.0), (42, 1.0))
new = [r[5] for r in rows] + [end[5]]
check("cut 1 of 2026-10-29, frame for frame", new == old, str(new))
check("cut 1 runs 35.92 s, as the timing note says", abs(end[5] / 24 - 35.917) < 0.001, "%.3f s" % (end[5] / 24))

# 2. The demo clock: every board change within half a frame of its absolute time.
clock, fps, boards = read_record(os.path.join(HERE, "demo-six-boards.txt"))
tm = TempoMap.from_set(clock)
rows, end = plan(tm, fps, boards, (1, 1.0), (17, 1.0))
worst = max(abs(r[5] / fps - (r[4] - rows[0][4])) for r in rows + [end])
check("each change within half a frame of the Set's clock", worst <= 0.5 / fps + 1e-12, "worst %.2f ms" % (worst * 1000))

# 3. Board lengths are differences of rounded positions, so they add up to the end exactly.
lengths = [b[5] - a[5] for a, b in zip(rows, rows[1:] + [end])]
check("board lengths sum to the cut's length", sum(lengths) == end[5], "%s = %d" % (lengths, end[5]))

# 4. The click walks the meter: 16 bars as 4/4, 7/8, 3/4, 4/4 hold 16 + 28 + 12 + 16 beats, 16 downbeats.
bb = beats_between(tm, 0, tm.beat_of(17, 1))
check("clicks follow the meter", len(bb) == 72 and sum(d for _, d in bb) == 16, "%d beats, %d downbeats" % (len(bb), sum(d for _, d in bb)))
check("a 7/8 bar clicks eighth notes", [b for b, _ in bb if 16 <= b < 19.5] == [16, 16.5, 17, 17.5, 18, 18.5, 19])

# 5. An in-point off the frame grid: the cut's frames count from its own first frame, not from bar 1.
rows2, _ = plan(tm, fps, boards, (5, 2.0), (17, 1.0))   # 8.3125 s, 199.5 frames into the song
check("frames count from the cut's in-point", rows2[0][5] == 0 and rows2[2][5] == round((rows2[2][4] - rows2[0][4]) * fps))

print("\nall passed" if not fails else "\n%d FAILED" % len(fails))
sys.exit(1 if fails else 0)
