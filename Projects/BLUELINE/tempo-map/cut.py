"""The cut on the Set's clock: a board record in, an animatic cut out, every board change on the frame
nearest its absolute time.

make_cuts.py (proofs/2026-10-29-daily-page/) cut the six boards at one tempo, beat x 60 / 127. This
reads the same thing from a board record instead: each BOARD's BAR and BEAT, placed through the Set's
tempo lane, meter lane and locators by tempo_map.py. Nothing about the tempo is written in here.

    python3 cut.py <record.txt> [--in BAR.BEAT] [--end BAR.BEAT] [--audio song.wav] [--out DIR] [--plan]

--in      the cut's first frame on the Set's ruler (default bar 1). Black until the first board.
--end     the cut's last moment (default: one bar after the last board).
--audio   the song, laid from --in. Without it the cut carries a click track drawn from the same clock:
          a high click on each bar's downbeat, a low one on every beat of the meter.
--plan    print the timing table and stop; no ffmpeg.

Frames are counted from --in, the cut's own first frame: round((seconds - seconds_in) x FPS), once
per board change, never by adding up board lengths. A white bar along the bottom flashes on every
beat, wider on the downbeat, so eye and ear can check the clock together.
"""
import math, os, struct, subprocess, sys, wave

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from tempo_map import TempoMap, parse_cut

BOARDS = os.path.join(HERE, "..", "proofs", "animatic", "boards")
W, H = 1920, 1080


def read_record(path):
    """The BIBLE's CLOCK and FPS, and each BOARD's SHOT_ID, BAR, BEAT (and IMAGE, if given)."""
    bible, boards, cur = {}, [], None
    for line in open(path):
        if line.startswith("# === BOARD"):
            cur = {"BEAT": "1"}
            boards.append(cur)
            continue
        if line.startswith("#") or ":" not in line:
            continue
        k, v = line.split(":", 1)
        v = v.split("#")[0].strip()
        (cur if cur is not None else bible)[k.strip()] = v
    clock = os.path.join(os.path.dirname(os.path.abspath(path)), bible["CLOCK"])
    return clock, int(bible.get("FPS", 24)), boards


def plan(tm, fps, boards, cut_in, cut_end):
    """[(board id or None, bar, beat, song beat, absolute s, first frame of the cut)], then the end."""
    b_in = tm.beat_of(*cut_in)
    t_in = tm.seconds_at(b_in)
    rows = [(None,) + cut_in + (b_in, t_in, 0)]
    for bd in boards:
        bar, bt = int(bd["BAR"]), float(bd["BEAT"])
        b = tm.beat_of(bar, bt)
        t = tm.seconds_at(b)
        rows.append((bd["SHOT_ID"], bar, bt, b, t, round((t - t_in) * fps)))
    b_end = tm.beat_of(*cut_end)
    t_end = tm.seconds_at(b_end)
    end = ("end",) + cut_end + (b_end, t_end, round((t_end - t_in) * fps))
    return rows, end


def beats_between(tm, b0, b1):
    """Every beat of the meter's own unit from b0 to b1, walked bar by bar: (song beat, is downbeat)."""
    out, bar = [], tm.bar_beat(b0)[0]
    while tm.beat_of(bar, 1) < b1 - 1e-9:
        n = tm.meters[_meter_index(tm, tm.beat_of(bar, 1))][1]
        for k in range(1, n + 1):
            b = tm.beat_of(bar, k)
            if b0 - 1e-9 <= b < b1 - 1e-9:
                out.append((b, k == 1))
        bar += 1
    return out


def _meter_index(tm, beat):
    return max(j for j, m in enumerate(tm.meters) if m[0] <= beat + 1e-9)


def click_track(tm, b_in, b_end, path, sr=48000):
    t_in = tm.seconds_at(b_in)
    n = int(math.ceil((tm.seconds_at(b_end) - t_in) * sr))
    buf = [0.0] * n
    for b, down in beats_between(tm, b_in, b_end):
        s0 = int(round((tm.seconds_at(b) - t_in) * sr))
        f, amp = (1760.0, 0.8) if down else (880.0, 0.45)
        for i in range(int(0.03 * sr)):
            if s0 + i < n:
                buf[s0 + i] += amp * math.sin(2 * math.pi * f * i / sr) * math.exp(-i / (0.006 * sr))
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, x)) * 32767)) for x in buf))


def flash_filter(tm, b_in, b_end, fps):
    """drawbox chains: a bar along the bottom lit for 3 frames on each beat, wider on the downbeat."""
    t_in = tm.seconds_at(b_in)
    beat, down = [], []
    for b, d in beats_between(tm, b_in, b_end):
        f = round((tm.seconds_at(b) - t_in) * fps)
        (down if d else beat).append("between(n,%d,%d)" % (f, f + 2))
    boxes = []
    if beat:
        boxes.append("drawbox=x=%d:y=%d:w=%d:h=18:color=white:t=fill:enable='%s'" % (W // 2 - 120, H - 40, 240, "+".join(beat)))
    if down:
        boxes.append("drawbox=x=%d:y=%d:w=%d:h=18:color=white:t=fill:enable='%s'" % (W // 2 - 480, H - 40, 960, "+".join(down)))
    return ",".join(boxes)


def render(tm, fps, rows, end, out, audio=None, name="cut"):
    work = os.path.join(out, "_work")
    os.makedirs(work, exist_ok=True)
    black = os.path.join(work, "black.png")
    if not os.path.exists(black):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "color=black:s=%dx%d" % (W, H),
                        "-frames:v", "1", black], check=True)
    lines = []
    for r, nxt in zip(rows, rows[1:] + [end]):
        img = black
        if r[0] is not None:
            img = os.path.join(work, "%s.png" % r[0])
            if not os.path.exists(img):
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(BOARDS, "%s.png" % r[0]), "-vf",
                                "scale=%d:%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2:black"
                                % (W, H, W, H), img], check=True)
        lines += ["file '%s'" % img, "duration %.6f" % ((nxt[5] - r[5]) / fps)]
    lines.append("file '%s'" % black)
    lst = os.path.join(work, name + ".txt")
    open(lst, "w").write("\n".join(lines) + "\n")
    length = end[5] / fps
    b_in, t_in = rows[0][3], rows[0][4]
    if audio is None:
        audio = os.path.join(out, name + "-clicks.wav")
        click_track(tm, b_in, end[3], audio)
        ss = 0.0
    else:
        ss = t_in
    vf = "fps=%d,format=yuv420p,%s" % (fps, flash_filter(tm, b_in, end[3], fps))
    mp4 = os.path.join(out, name + ".mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-ss", "%.4f" % ss, "-t", "%.4f" % length, "-i", audio,
                    "-vf", vf, "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                    "-c:a", "aac", "-b:a", "192k", "-t", "%.4f" % length, mp4], check=True)
    return mp4, audio


def table(tm, rows, end, fps):
    out = ["| board | bar.beat | song beat | bpm there | section | absolute (s) | cut frame | in the cut (s) |",
           "|---|---|---|---|---|---|---|---|"]
    for r in rows + [end]:
        out.append("| %s | %d.%g | %g | %.2f | %s | %.4f | %d | %.3f |" % (
            r[0] or "black", r[1], r[2], r[3], tm.bpm_at(r[3]), tm.section_at(r[3]) or "", r[4], r[5], r[5] / fps))
    return "\n".join(out)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    a = sys.argv[1:]
    opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    clock, fps, boards = read_record(a[0])
    tm = TempoMap.from_set(clock)
    cut_in = parse_cut(opt("--in", "1.1"))
    last = max(tm.beat_of(int(b["BAR"]), float(b["BEAT"])) for b in boards)
    lb = tm.bar_beat(last)[0]
    cut_end = parse_cut(opt("--end", "%d.1" % (lb + 1)))
    rows, end = plan(tm, fps, boards, cut_in, cut_end)
    print(table(tm, rows, end, fps))
    if "--plan" not in a:
        out = os.path.abspath(opt("--out", os.getcwd()))
        name = os.path.splitext(os.path.basename(a[0]))[0]
        print(*render(tm, fps, rows, end, out, opt("--audio"), name), sep="\n")
