#!/usr/bin/env python3
"""Finish a looped AI instrument: one player, one level, played by velocity.

    PY=.venvs/gsl-probe/bin/python    # run from the palace root
    $PY "Projects/Generative Sample Libraries/ai-source-probe/finish_instrument.py" \
        instruments/in_range/violin_looped --name "MusicGen Violin" --out instruments/finished/violin

The *_looped instruments play in tune and hold, but each take came out of
MusicGen at its own level and every WAV was peak-normalised on the way in,
so neighbouring keys can sit 10–20 dB apart; and many takes swell into their
loop, so a held note grows louder after it starts. This pass:

  1. Levels. Each sample's loop body is measured (RMS, after a gentle
     presence weighting so a bright take isn't judged quieter than it
     sounds) and the whole WAV is scaled so every loop sits at the same
     level. One shared trim then keeps the loudest peak under -1 dBFS.
  2. Swell. Before the loop, wherever the 50 ms level sits more than
     SWELL_DB below the loop, it is lifted toward it (at most MAX_LIFT_DB),
     and wherever it sits more than LOUD_DB above (the model's first stroke)
     it is pulled down; after the loop, heard only in the release, nothing
     is louder than the loop. All smoothly. The last 100 ms before loop_start is never touched, so the
     baked crossfade still lands where it did: loop points don't move and
     the seams are the same audio, only scaled.
  3. Names. Samples are renamed for the key they sound (violin_G3.wav).
  4. Velocity. The SFZ gets a soft velocity curve and a low-pass that opens
     with velocity, so soft playing is darker as well as quieter. That is
     an SFZ-only nicety; the DecentSampler preset gets amplitude only.

Then re-checks the result the same way loop_sustain.py checks seams (12 s
hold per key: click, level step, pitch), writes finishing.json, and renders
held.wav (as looped vs finished), phrase_before.wav / phrase.wav, and
velocity.wav. Run to_decentsampler.py on the --out folder afterwards.
"""
from __future__ import annotations

import argparse
import json
import math
import shutil
import sys
from pathlib import Path

import numpy as np
from scipy.signal import lfilter, butter

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from build_sfz import parse_sfz, note_name  # noqa: E402
from verify import load_wav  # noqa: E402
from loop_sustain import write_wav_smpl, read_smpl, seam_check, play_looped, held_demo  # noqa: E402
from shape_attacks import BOW_ATTACK, BOW_VEL2ATTACK  # noqa: E402
from adapters._common import write_wav  # noqa: E402

SWELL_DB = 2.0        # a pre-loop stretch may sit this far under the loop untouched
MAX_LIFT_DB = 8.0
LOUD_DB = 4.0        # the opening may sit this far above the loop; louder is pulled down
GUARD = 0.100         # seconds before loop_start left exactly as it was
PEAK = 10 ** (-1 / 20)
AMP_VELTRACK = 80     # SFZ default 100 makes vel 40 nearly silent; 80 keeps soft notes playable
CUTOFF, FIL_VELTRACK = 3000, 2400   # vel 127 → 12 kHz, vel 40 → ~4.8 kHz


def weighted(y: np.ndarray, sr: int) -> np.ndarray:
    """A rough presence weighting: cut rumble, +4 dB above ~2 kHz."""
    b, a = butter(1, 80 / (sr / 2), "high")
    y = lfilter(b, a, y)
    b2, a2 = butter(1, 2000 / (sr / 2), "high")
    return y + (10 ** (4 / 20) - 1) * lfilter(b2, a2, y)


def rms_db(x: np.ndarray) -> float:
    return 10 * math.log10(float(np.mean(x * x)) + 1e-15)


def env_db(y: np.ndarray, sr: int, win: float = 0.05) -> np.ndarray:
    """Per-sample level in dB, a centred moving RMS."""
    n = max(1, int(win * sr))
    c = np.convolve(y * y, np.ones(n) / n, mode="same")
    return 10 * np.log10(c + 1e-15)


def lift_curve(y: np.ndarray, sr: int, loop_db: float, s: int, e_incl: int) -> np.ndarray:
    """Gain (linear) for every sample. Before the loop: quiet stretches lifted
    toward the loop, loud ones (the model's first stroke) pulled down to
    LOUD_DB above it. After the loop (heard only in the release): never
    louder than the loop. The loop itself and GUARD before it stay at 1.0."""
    g_db = np.zeros(len(y))
    e = env_db(y, sr)
    stop = max(0, s - int(GUARD * sr))
    pre = e[:stop]
    up = np.clip(loop_db - SWELL_DB - pre, 0.0, MAX_LIFT_DB)
    up[pre < loop_db - 30] = 0.0        # never lift near-silence (a breath gap)
    g_db[:stop] = up - np.clip(pre - (loop_db + LOUD_DB), 0.0, 30.0)
    tail = e_incl + 1
    g_db[tail:] = -np.clip(e[tail:] - loop_db, 0.0, 30.0)
    k = max(1, int(0.08 * sr))
    g_db = np.convolve(g_db, np.ones(k) / k, mode="same")
    ramp = int(0.05 * sr)               # ease to exactly 0 dB around the untouched span
    if stop > ramp:
        g_db[stop - ramp:stop] *= np.linspace(1, 0, ramp)
    g_db[stop:tail] = 0.0
    n = min(ramp, len(y) - tail)
    g_db[tail:tail + n] *= np.linspace(0, 1, n)
    return 10 ** (g_db / 20)


def swell_db(y: np.ndarray, sr: int, reg: dict) -> float:
    """How much louder the loop is than the quietest 200 ms of the note
    after the bow is on (from 0.3 s) — what a player hears as a swell."""
    s = reg["loop_start"]
    a = int(0.3 * sr)
    if s - a < int(0.2 * sr):
        return 0.0
    e = env_db(y[a:s], sr, 0.2)
    loop = rms_db(y[s:reg["loop_end"] + 1])
    return round(loop - float(np.min(e[int(0.1 * sr):-int(0.1 * sr)] if len(e) > int(0.3 * sr) else e)), 2)


def finish(src: Path, out: Path, name: str, acc: dict) -> dict:
    sfz = next(src.glob("*.sfz"))
    regions = parse_sfz(sfz)
    audio = {r["sample"]: load_wav(str(src / "samples" / r["sample"])) for r in regions}
    sr = next(iter(audio.values()))[1]

    loops = {}
    for r in regions:
        y, _ = audio[r["sample"]]
        loops[r["sample"]] = rms_db(weighted(y, sr)[r["loop_start"]:r["loop_end"] + 1])
    target = float(np.median(list(loops.values())))

    shaped, info = {}, {}
    for r in regions:
        y, _ = audio[r["sample"]]
        g_lvl = 10 ** ((target - loops[r["sample"]]) / 20)
        raw_loop = rms_db(y[r["loop_start"]:r["loop_end"] + 1])
        lift = lift_curve(y, sr, raw_loop, r["loop_start"], r["loop_end"])
        shaped[r["sample"]] = y * lift * g_lvl
        info[r["sample"]] = {"level_change_db": round(20 * math.log10(g_lvl), 2),
                             "max_lift_db": round(20 * math.log10(float(lift.max())), 2),
                             "max_cut_db": round(20 * math.log10(float(lift.min())), 2)}
    trim = PEAK / max(float(np.abs(z).max()) for z in shaped.values())
    # one gain for the whole set (up or down together), so the matched levels stay matched

    if out.exists():
        shutil.rmtree(out)
    (out / "samples").mkdir(parents=True)
    inst = name.split()[-1].lower()
    rename, report = {}, []
    for r in regions:
        new = f"{inst}_{note_name(r['pitch_keycenter'])}.wav"
        rename[r["sample"]] = new
        z = shaped[r["sample"]] * trim
        dst = out / "samples" / new
        write_wav_smpl(dst, z, sr, r["pitch_keycenter"], r["loop_start"], r["loop_end"])
        assert read_smpl(dst) == (r["loop_start"], r["loop_end"])
        zz, _ = load_wav(str(dst))
        chk = seam_check(zz, sr, r, acc)
        y0, _ = audio[r["sample"]]
        report.append({"key": note_name(r["pitch_keycenter"]), "sample": new, "from": r["sample"],
                       "loop_level_before_db": round(loops[r["sample"]], 2),
                       "loop_level_after_db": round(rms_db(weighted(zz, sr)[r["loop_start"]:r["loop_end"] + 1]), 2),
                       "swell_before_db": swell_db(y0, sr, r), "swell_after_db": swell_db(zz, sr, r),
                       **info[r["sample"]], **chk})

    # the SFZ: the source's, renamed, with the velocity block in <global>
    lines = []
    for line in sfz.read_text().splitlines():
        if line.startswith("// ") and not lines:
            lines.append(f"// {name} — finished by finish_instrument.py from {src.name}")
            lines.append("// every loop at one level; pre-loop swell lifted (never inside the last 100 ms before the loop);")
            lines.append("// soft playing is quieter and darker. Samples named for the key they sound.")
            continue
        if line.startswith("ampeg_attack="):
            line += (f"\namp_veltrack={AMP_VELTRACK}"
                     f"\nfil_type=lpf_2p cutoff={CUTOFF} fil_veltrack={FIL_VELTRACK}")
        for old, new in rename.items():
            line = line.replace(f"sample={old} ", f"sample={new} ")
        lines.append(line)
    (out / f"{name}.sfz").write_text("\n".join(lines) + "\n")

    after = [x["loop_level_after_db"] for x in report]
    before = [x["loop_level_before_db"] for x in report]
    summary = {"instrument": name, "from": str(src.relative_to(HERE)), "samples": len(report),
               "loop_level_spread_db": {"before": round(max(before) - min(before), 1),
                                        "after": round(max(after) - min(after), 1)},
               "worst_neighbour_jump_db": {
                   "before": round(max(abs(a - b) for a, b in zip(before, before[1:])), 1),
                   "after": round(max(abs(a - b) for a, b in zip(after, after[1:])), 1)},
               "worst_swell_db": {"before": max(x["swell_before_db"] for x in report),
                                  "after": max(x["swell_after_db"] for x in report)},
               "seams_clean": sum(x["seam_ok"] for x in report),
               "held_12s_on_target": sum(x["hold_grade"] == "on_target" for x in report),
               "worst_click_db": max(x["worst_click_db"] for x in report),
               "worst_level_step_db": max(x["worst_level_step_db"] for x in report),
               "shared_trim_db": round(20 * math.log10(trim), 2),
               "velocity": {"amp_veltrack": AMP_VELTRACK, "cutoff": CUTOFF, "fil_veltrack": FIL_VELTRACK},
               "samples_detail": report}
    (out / "finishing.json").write_text(json.dumps(summary, indent=1) + "\n")
    return summary


def velocity_demo(out: Path, key: int | None = None) -> Path:
    """One key, bowed at velocity 30, 60, 90, 127, 2.5 s each, through the
    SFZ's own velocity rules (amp_veltrack, attack, the opening low-pass)."""
    regions = parse_sfz(next(out.glob("*.sfz")))
    reg = regions[len(regions) // 2] if key is None else next(r for r in regions if r["lokey"] <= key <= r["hikey"])
    y, sr = load_wav(str(out / "samples" / reg["sample"]))
    parts = []
    for vel in (30, 60, 90, 127):
        n, _ = play_looped(y, sr, reg, reg["pitch_keycenter"], 2.5)
        # amp_veltrack: gain in dB = 40*log10(vel/127) * veltrack/100 (sfz curve, approximated)
        n = n * 10 ** (40 * math.log10(vel / 127) * AMP_VELTRACK / 100 / 20)
        fc = min(CUTOFF * 2 ** (FIL_VELTRACK / 1200 * vel / 127), 0.45 * sr)
        b, a = butter(2, fc / (sr / 2), "low")
        n = lfilter(b, a, n)
        att = int((BOW_ATTACK + BOW_VEL2ATTACK * vel / 127) * sr)
        n[:att] *= np.linspace(0, 1, att)
        rel = int(0.35 * sr)
        n[-rel:] *= np.cos(np.linspace(0, math.pi / 2, rel)) ** 2
        parts += [n, np.zeros(int(0.5 * sr))]
    mix = np.concatenate(parts)
    path = out / "velocity.wav"
    # keep the relative levels: no per-file peak normalisation beyond -1 dBFS overall
    write_wav(str(path), mix, sr)
    return path


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--name", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    acc = json.loads((HERE / "matrix.json").read_text())["acceptance"]
    src, out = (HERE / a.src).resolve(), (HERE / a.out).resolve()
    s = finish(src, out, a.name, acc)
    held_demo(src, out)
    velocity_demo(out)
    print(json.dumps({k: v for k, v in s.items() if k != "samples_detail"}, indent=1))


if __name__ == "__main__":
    main()
