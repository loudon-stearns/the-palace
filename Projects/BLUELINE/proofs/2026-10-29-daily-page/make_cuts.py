"""Two blind cuts of BLUELINE's six boards over Ascension_v8 (instrumental).

cut-1: the song's own grid, 127 BPM. Board changes accelerate into the drop; the plummet holds
       through the one-bar pitch-bend breath (128-131) and the impact lands on the drop at 132
       (01@96, 02@112, 03@120, 04@124, 05@132, 06@148, end @164).
cut-2: the animatic's recorded timing, 120 BPM, 8 beats = 4.0 s per board, laid from beat 96
       of the real song; it drifts off the 127 grid and misses the drop by about 0.9 s.
Both open on 8 beats of black from beat 88. Cut times are absolute and rounded to 24 fps frames.
"""
import subprocess, os, sys

# Usage: python3 make_cuts.py <path to the song's instrumental> [<output folder>]
# The song is not in the palace: it is unreleased, so the cuts stay on the machine that made them.
if len(sys.argv) < 2:
    sys.exit("usage: make_cuts.py <song> [<out dir>]")
HERE = os.path.dirname(os.path.abspath(__file__))
BOARDS = os.path.join(HERE, "..", "animatic", "boards")
SONG = sys.argv[1]
OUT = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.getcwd()
FPS = 24
SPB = 60 / 127  # seconds per beat in the song
T0 = 88 * SPB   # audio in-point: beat 88


def frames(t):
    return round(t * FPS)


def render(name, cuts, end):
    """cuts: list of (absolute song seconds, board id or None for black)."""
    work = f"{OUT}/_work"
    os.makedirs(work, exist_ok=True)
    black = f"{work}/black.png"
    if not os.path.exists(black):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "color=black:s=1920x1080",
                        "-frames:v", "1", black], check=True)
    lines = []
    edges = [c[0] for c in cuts] + [end]
    for (t, bid), t_next in zip(cuts, edges[1:]):
        dur = (frames(t_next - T0) - frames(t - T0)) / FPS
        img = black if bid is None else f"{work}/{bid}.png"
        if bid is not None and not os.path.exists(img):
            # one frame size for every board, or concat stops at the first portrait/landscape change
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{BOARDS}/{bid}.png", "-vf",
                            "scale=1920:1080:force_original_aspect_ratio=decrease,"
                            "pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black", img], check=True)
        lines += [f"file '{img}'", f"duration {dur:.6f}"]
    lines.append(f"file '{black}'")
    lst = f"{work}/{name}.txt"
    open(lst, "w").write("\n".join(lines) + "\n")
    length = (frames(end - T0)) / FPS
    vf = ("scale=1920:1080:force_original_aspect_ratio=decrease,"
          "pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p,fps=24")
    subprocess.run(["ffmpeg", "-v", "error", "-y",
                    "-f", "concat", "-safe", "0", "-i", lst,
                    "-ss", f"{T0:.4f}", "-t", f"{length:.4f}", "-i", SONG,
                    "-vf", vf, "-af", f"afade=t=out:st={length - 1.0:.3f}:d=1.0",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                    "-c:a", "aac", "-b:a", "192k", "-t", f"{length:.4f}",
                    f"{OUT}/{name}.mp4"], check=True)
    print(name, f"{length:.2f}s", [(round(t - T0, 3), b) for t, b in cuts])


b = lambda n: n * SPB
render("cut-1", [(b(88), None), (b(96), "01"), (b(112), "02"), (b(120), "03"),
                 (b(124), "04"), (b(132), "05"), (b(148), "06")], b(164))
start = b(96)
render("cut-2", [(b(88), None)] + [(start + 4.0 * i, f"0{i + 1}") for i in range(6)], start + 24.0)
