"""
title: Radio Play — rich — checks
born: 2026-11-03
parent: [[Radio Play]] · rich face, proposal round 2026-11
forward_vector: I am how the rich face's media was gathered and how every number its pieces print
  was measured, so anyone can do both again. I copy The Unsung Path (the Shop's first radio play,
  2026-06-19: Kokoro voices, Stable Audio 3 score and foley, ffmpeg mix, Manim picture) out of
  _ops/scratch/weave-video into rich-face/, then measure its clock, its loudness, its laughs and
  its picture, and write the results to "Radio Play — rich — checks.json".

Run:  python3 "Radio Play — rich — checks.py" [--gather]
      --gather copies and converts the media first (needs the scratch folder on this Mac).
Needs: numpy, soundfile, ffmpeg/ffprobe on PATH.
Nothing here is synthesised anew: every voice is a Kokoro take the Shop rendered in June,
copied unchanged; the SFX are converted to mono 16-bit 44.1 kHz to keep the face small.
"""
from __future__ import annotations
import json, re, shutil, subprocess, sys
from pathlib import Path
import numpy as np
import soundfile as sf

HERE = Path(__file__).parent
RF = HERE / "rich-face"
STEMS = RF / "unsung-path-stems"
SRC = HERE.parent / "_ops" / "scratch" / "weave-video"
if not SRC.exists():  # a worktree has no scratch; the owner's folder does
    SRC = Path.home() / "Documents" / "The Palace" / "_ops" / "scratch" / "weave-video"
FILM = RF / "The Unsung Path.mp4"
OUT = HERE / "Radio Play — rich — checks.json"

LINES = ["s1_title__00__NARRATOR", "s1_title__01__NARRATOR",
         "s2_problem__00__NARRATOR", "s2_problem__01__WIKILINK", "s2_problem__02__NARRATOR", "s2_problem__03__FOREMAN",
         "s4_demo__02__SKEPTIC", "s4_demo__03__FOREMAN", "s4_demo__04__SKEPTIC", "s4_demo__05__FOREMAN"]
SFX = ["laugh", "bed_low"]
SEGS = ["s1_title", "s2_problem", "s3_loop", "s4_demo", "s5_close"]
# the Shop's mix gains, from build_audio.py
V_VO, V_BED, V_LAUGH = 0.92, 0.13, 0.62


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def gather():
    STEMS.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SRC / "The Unsung Path.mp4", FILM)
    run(["ffmpeg", "-y", "-v", "error", "-i", str(FILM), "-vn", "-c:a", "copy",
         str(RF / "The Unsung Path — audio.m4a")])
    for n in LINES:
        shutil.copy2(SRC / "audio" / "raw" / f"{n}.wav", STEMS / f"{n}.wav")
    for n in SFX:
        run(["ffmpeg", "-y", "-v", "error", "-i", str(SRC / "sfx" / f"{n}.wav"), "-ac", "1",
             "-ar", "44100", "-sample_fmt", "s16", str(STEMS / f"{n}.wav")])
    print("gathered into", RF)


def lufs(path_or_args):
    """Integrated loudness (EBU R128) by ffmpeg's ebur128 filter."""
    args = path_or_args if isinstance(path_or_args, list) else ["-i", str(path_or_args)]
    p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *args, "-af", "ebur128=peak=true",
                        "-f", "null", "-"], capture_output=True, text=True)
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", p.stderr)
    return float(m[-1])


def lufs_array(x, sr):
    tmp = HERE / "_lufs_tmp.wav"
    sf.write(tmp, x.astype(np.float32), sr, subtype="FLOAT")
    try:
        return lufs(tmp)
    finally:
        tmp.unlink()


def load(name, sr=48000):
    x, r = sf.read(STEMS / f"{name}.wav", dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    if r != sr:
        n = int(round(len(x) * sr / r))
        x = np.interp(np.arange(n) * r / sr, np.arange(len(x)), x).astype(np.float32)
    return x


def speech(x, sr, th_db=-40.0, win_s=0.01):
    """Where the words are in a take: a 10 ms RMS envelope, first and last point within 40 dB of its peak."""
    n = max(1, int(win_s * sr)); c = np.concatenate([[0.0], np.cumsum(x.astype(np.float64) ** 2)])
    i = np.arange(len(x)); a = np.clip(i - n // 2, 0, len(x)); b = np.clip(i - n // 2 + n, 0, len(x))
    e = np.sqrt((c[b] - c[a]) / n); on = np.where(e > e.max() * 10 ** (th_db / 20))[0]
    return on[0] / sr, (on[-1] + 1) / sr


def takes():
    out = {}
    for n in LINES + ["laugh"]:
        x, r = sf.read(STEMS / f"{n}.wav", dtype="float32", always_2d=True); x = x.mean(axis=1)
        a, b = speech(x, r); out[n] = {"take_s": round(len(x) / r, 3), "first_word_s": round(a, 3), "last_word_end_s": round(b, 3),
                                       "head_ms": round(a * 1000), "tail_ms": round((len(x) / r - b) * 1000)}
    return out


def heard(T, keys, file_gaps):
    """The silence heard between words, for gaps set between files."""
    return [round(T[keys[i]]["take_s"] - T[keys[i]]["last_word_end_s"] + g + T[keys[i + 1]]["first_word_s"], 3)
            for i, g in enumerate(file_gaps)]


def s2_plan():
    """build_audio.py's s2_problem plan, recomputed from the takes' own lengths."""
    D = [sf.info(STEMS / f"{n}.wav").duration for n in LINES[2:6]]
    t, onsets = 0.6, []
    for i in range(4):
        onsets.append(t); t += D[i] + (0.5 if i < 3 else 0.6)
    laugh_at = t - 0.1
    total = laugh_at + sf.info(STEMS / "laugh.wav").duration + 0.7
    return D, onsets, laugh_at, total


def motion(film, start, dur, fps=30, w=160, h=90):
    """Mean absolute frame-to-frame change, 0..255, per frame, gray 160x90."""
    p = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{start}", "-t", f"{dur}", "-i", str(film),
                        "-vf", f"scale={w}:{h},format=gray", "-r", str(fps), "-f", "rawvideo", "-"],
                       capture_output=True, check=True)
    f = np.frombuffer(p.stdout, np.uint8).reshape(-1, h, w).astype(np.float32)
    d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
    return np.concatenate([[0.0], d])


def beats(m, fps=30, still=0.02, min_still=0.4):
    """Times where the picture starts moving after at least min_still seconds of stillness."""
    on, quiet = [], 0
    for i, v in enumerate(m):
        if v <= still:
            quiet += 1
        else:
            if quiet >= min_still * fps:
                on.append(round(i / fps, 3))
            quiet = 0
    return on


def counter(m, fps=30, start=26.9):
    """The count to 913: the last busy frame, where the number comes to rest."""
    i0 = int(start * fps); busy = [i for i in range(i0, len(m)) if m[i] > 0.05]
    return round(busy[-1] / fps, 3) if busy else None


def main():
    if "--gather" in sys.argv:
        gather()
    R = {"about": "Every number the Radio Play rich face prints, measured by 'Radio Play — rich — checks.py'.",
         "source": "_ops/scratch/weave-video (The Unsung Path, 2026-06-19), copied into Radio Play/rich-face/"}

    # 1. the clock: each segment's picture against its audio
    durs = json.loads((SRC / "segments" / "durations.json").read_text()) if SRC.exists() else None
    seg = []
    for s in SEGS:
        mp = SRC / "muxed" / f"{s}.mp4"
        v = float(run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration",
                       "-of", "csv=p=0", str(mp)]).stdout)
        a = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                       str(SRC / "segments" / f"{s}.wav")]).stdout)
        seg.append({"segment": s, "audio_s": round(a, 3), "picture_s": round(v, 3),
                    "picture_minus_audio_ms": round((v - a) * 1000, 1)})
    R["segments"] = seg
    fv = float(run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration",
                    "-of", "csv=p=0", str(FILM)]).stdout)
    R["film"] = {"picture_s": fv, "audio_sum_s": round(sum(x["audio_s"] for x in seg), 3),
                 "worst_segment_ms": max(abs(x["picture_minus_audio_ms"]) for x in seg),
                 "frame_ms": round(1000 / 30, 1)}

    # cuts: the film's largest frame changes near each segment join
    starts = np.cumsum([0] + [x["audio_s"] for x in seg])[:-1]
    m_all = motion(FILM, 0, fv)
    joins = []
    for k in range(1, len(starts)):
        t = starts[k]; i0, i1 = int((t - 0.5) * 30), int((t + 0.5) * 30)
        j = i0 + int(np.argmax(m_all[i0:i1]))
        joins.append({"audio_join_s": round(float(t), 3), "picture_cut_s": round(j / 30, 3),
                      "off_ms": round((j / 30 - t) * 1000, 1), "change": round(float(m_all[j]), 2)})
    R["joins"] = joins

    # 2a. the takes carry their own silence: the gaps the Shop set between files, as heard between words
    T = takes(); R["takes"] = T
    R["heard"] = {
        "s1_beat": {"set_s": [0.6], "heard_s": heard(T, LINES[0:2], [0.6])},
        "s2_lines": {"set_s": [0.5, 0.5, 0.5], "heard_s": heard(T, LINES[2:6], [0.5, 0.5, 0.5])},
        "s4_exchange": {"set_s": [0.4, 0.4, 0.3], "heard_s": heard(T, LINES[6:10], [0.4, 0.4, 0.3])},
        "s4_laugh_after_last_word_s": round(T[LINES[9]]["take_s"] - T[LINES[9]]["last_word_end_s"] + 0.1 + T["laugh"]["first_word_s"], 3),
    }

    # 2b. inside segment two: line onsets against the picture's beats
    D, onsets, laugh_at, total = s2_plan()
    words = [round(onsets[i] + T[LINES[2 + i]]["first_word_s"], 3) for i in range(4)]
    s2_start = float(starts[1])
    m2 = motion(FILM, s2_start, seg[1]["picture_s"])
    b = beats(m2)
    nominal = [0.0, 7.0, 14.9, 21.3]          # scenes.py S2Problem: where each line's beat starts, at 29 s
    factor = seg[1]["audio_s"] / 29.0
    designed = [round(n * factor, 3) for n in nominal]
    # the counter: the first frame whose change is the big number's
    R["s2"] = {"line_onsets_s": [round(x, 3) for x in onsets], "line_lengths_s": [round(x, 3) for x in D],
               "laugh_at_s": round(laugh_at, 3), "planned_total_s": round(total, 3),
               "stretch": round(factor, 4), "picture_beats_designed_s": designed,
               "picture_beats_measured_s": b,
               "lag_s": [round(designed[i] - onsets[i], 3) for i in range(4)],
               "first_words_s": words,
               "lag_measured_s": [round(b[i] - words[i], 3) for i in range(4)],
               "counter_rests_designed_s": round((nominal[3] + 4.0) * factor, 3),
               "counter_rests_measured_s": counter(m2),
               "foreman_says_913_at_s": words[3],
               "motion": [round(float(m2[i:i + 3].max()), 3) for i in range(0, len(m2), 3)], "motion_fps": 10}

    # 3. loudness: the Shop's segments, and voice against bed in segment two before loudnorm
    R["loudness"] = {s: round(lufs(SRC / "segments" / f"{s}.wav"), 2) for s in SEGS}
    R["loudness"]["film_audio"] = round(lufs(RF / "The Unsung Path — audio.m4a"), 2)
    sr = 48000; n = int(total * sr) + sr
    voice = np.zeros(n, np.float32); bed = np.zeros(n, np.float32)
    for name, t in zip(LINES[2:6], onsets):
        x = load(name); i = int(t * sr); voice[i:i + len(x)] += V_VO * x
    x = load("bed_low"); bed[:len(x)] += V_BED * x
    span = slice(int(onsets[0] * sr), int((onsets[3] + D[3]) * sr))
    lv, lb = lufs_array(voice[span], sr), lufs_array(bed[span], sr)
    R["s2_balance"] = {"voice_lufs": round(lv, 2), "bed_lufs": round(lb, 2), "bed_under_voice_lu": round(lv - lb, 2),
                       "span_s": [round(onsets[0], 3), round(onsets[3] + D[3], 3)]}

    # 4. the laugh, on the joke or under it: segment four's punchline, "Don't sound so shocked."
    p = load("s4_demo__05__FOREMAN"); lg = load("laugh")
    def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x.astype(np.float64) ** 2)) + 1e-12)
    pv = V_VO * p
    under = V_LAUGH * lg[:len(pv)]
    R["laugh"] = {"punchline_s": round(len(p) / sr, 3),
                  "under": {"voice_over_laugh_db": round(rms_db(pv) - rms_db(under), 2)},
                  "on": {"voice_over_laugh_db": None, "gap_after_s": 0.1}}

    # 5. the blind pair: identical takes, the only difference a held beat
    R["pair"] = {"rushed_heard_s": 0.1, "held_heard_s": R["heard"]["s4_exchange"]["heard_s"][2], "shop_set_s": 0.3}

    OUT.write_text(json.dumps(R, indent=1) + "\n")
    # copy what the picture piece prints into it, between its markers
    piece = HERE / "Radio Play — rich — audio first, picture last.html"
    keep = {k: R[k] for k in ("segments", "film", "joins", "loudness", "s2", "s2_balance", "heard")}
    html = piece.read_text()
    html = re.sub(r"/\*MEASURED\*/.*?/\*END\*/", lambda m: "/*MEASURED*/" + json.dumps(keep, separators=(",", ":")) + "/*END*/",
                  html, count=1, flags=re.S)
    piece.write_text(html)
    print(json.dumps({k: v for k, v in R.items() if k not in ("s2",)}, indent=1))
    print("s2:", {k: v for k, v in R["s2"].items() if k != "motion"})


if __name__ == "__main__":
    main()
