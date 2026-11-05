"""Checks for tempo_map.py. Run: python3 test_tempo_map.py"""
import math, os, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from tempo_map import TempoMap, decode_meter, encode_meter, BEFORE_SONG
import make_demo_set

fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + (("  " + detail) if detail else ""))
    if not ok:
        fails.append(name)

# 1. One tempo: the old arithmetic, exactly. make_cuts.py placed beat 96 of the 2026-10-29 cut at 127 bpm.
tm = TempoMap([(BEFORE_SONG, 127)])
check("one tempo = beat x 60 / bpm", all(abs(tm.seconds_at(b) - b * 60 / 127) < 1e-12 for b in range(0, 400, 7)))
check("one tempo frame = make_cuts.py's frame", tm.frame_at(96) == round(96 * 60 / 127 * 24), str(tm.frame_at(96)))

# 2. Ramps and jumps against brute-force integration (a million small steps of 60/bpm).
demo = TempoMap(make_demo_set.TEMPO, [(b, n, d) for b, n, d in make_demo_set.METER])
def brute(beat, n=1_000_000):
    h = beat / n
    return sum(60.0 / demo.bpm_at((i + 0.5) * h) for i in range(n)) * h
worst = max(abs(demo.seconds_at(b) - brute(b)) for b in (10, 16, 23.3, 30, 36.7, 42, 57.9))
check("ramp + jump = integral of 60/bpm", worst < 1e-5, "worst %.2e s" % worst)

# 3. Seconds -> beat is the inverse, through the jump and the ramp.
worst = max(abs(demo.beat_at_seconds(demo.seconds_at(b)) - b) for b in [i * 0.37 for i in range(200)])
check("beat_at_seconds inverts seconds_at", worst < 1e-9, "worst %.1e beat" % worst)

# 4. Meters: Live's encoding, and bars through 4/4 -> 7/8 -> 3/4 -> 4/4.
check("201 is 4/4, as Live's blank Set stores it", decode_meter(201) == (4, 4) and encode_meter(4, 4) == 201)
check("every meter round-trips", all(decode_meter(encode_meter(n, d)) == (n, d) for n in range(1, 100) for d in (1, 2, 4, 8, 16)))
expect = {(5, 1): 16, (5, 4): 17.5, (6, 1): 19.5, (9, 1): 30, (10, 1): 33, (13, 1): 42, (17, 1): 58}
check("bars through the meter changes", all(abs(demo.beat_of(*k) - v) < 1e-12 for k, v in expect.items()))
check("bar_beat inverts beat_of", all(demo.bar_beat(demo.beat_of(bar, bt)) == (bar, bt)
                                      for bar in range(1, 20) for bt in (1, 2, 3)))

# 5. Drift. Rounding a beat to whole frames and adding beats up drifts; rounding absolute time once does not.
tm = TempoMap([(BEFORE_SONG, 127)])
naive = [round(60 / 127 * 24) * b for b in range(1, 513)]   # 11 frames a beat, added up
once = [tm.frame_at(b) for b in range(1, 513)]
exact = [tm.seconds_at(b) * 24 for b in range(1, 513)]
check("once-rounded never off by more than half a frame", max(abs(o - e) for o, e in zip(once, exact)) <= 0.5)
check("added-up frames drift (the trap this avoids)", abs(naive[-1] - exact[-1]) > 10,
      "after 128 bars: %.1f frames off" % abs(naive[-1] - exact[-1]))

# 6. The Set itself: write demo-set.als from Live's blank, read it back, and get the same map.
with tempfile.TemporaryDirectory() as d:
    p = make_demo_set.write(os.path.join(d, "t.als"))
    back = TempoMap.from_set(p)
check("demo Set round-trips: tempo", back.segs == demo.segs)
check("demo Set round-trips: meter", back.meters == demo.meters)
check("demo Set round-trips: sections", [n for _, n in back.sections] == ["intro", "verse", "rise", "drop", "end"])
check("a cut lands in its section", back.section_at(back.beat_of(11, 2)) == "rise")

from tempo_map import stamp_record
stamped = stamp_record(open(os.path.join(HERE, "demo-boards.txt")).read(), back)
check("a board record gets its frames from the Set", "FRAME: 214 " in stamped and "FRAME: 545 " in stamped and "SECTION: rise" in stamped)

print("\n%d failed" % len(fails) if fails else "\nall passed")
sys.exit(1 if fails else 0)
