#!/usr/bin/env python3
"""Sustain loops: a held violin or flute key keeps sounding after its take runs out.

    PY=.venvs/gsl-probe/bin/python    # run from the palace root
    $PY "Projects/Generative Sample Libraries/ai-source-probe/loop_sustain.py" \
        instruments/in_range/violin_shaped instruments/in_range/flute_shaped

The MusicGen takes are three to five seconds long, and the *_shaped instruments
are no_loop, so a key held past the end of its take simply stops. This finds a
loop in the steady middle of every sample and writes a *_looped sibling folder:

  1. Find the loop. Across the body of the take (past the bow-on, short of
     the tail), try loop starts on a 5 ms grid and loop ends a whole number
     of periods later; keep the pair whose two seams look most alike
     (normalised difference over ~4 periods each side, plus the level gap
     80 ms around each seam), with a mild preference for longer loops so the
     vibrato and bow noise repeat less often. The takes swell like played
     phrases, so a "flat stretch" rule finds almost nothing to loop. A loop
     may only span audio where pyin hears the take's own note (90% of frames
     within 50 cents) — otherwise it loops breath, or an octave sag.
  2. Bake a crossfade into the file. The last XFADE before loop end is blended
     toward the audio just before loop start, so the jump back lands on a
     waveform the player has, in effect, already been playing. The sampler
     then needs no crossfade of its own (DecentSampler loopCrossfade stays 0).
  3. Write the loop three ways: SFZ loop_mode=loop_sustain + loop_start /
     loop_end, a `smpl` chunk inside each WAV (what hardware samplers and most
     importers read), and — via to_decentsampler.py — loopStart / loopEnd in
     the .dspreset.
  4. Check the seams by ear-proxy, not by intent (and the finder's best
     few candidates are tried in order until one passes all three): hold every sample's own key
     for 12 s through a loop-aware player and measure (a) click — the
     high-passed energy in the 5 ms around each wrap against the median of
     the loop body; (b) level step — how much more the 20 ms level wobbles in the 200 ms
     around a wrap than it wobbles anywhere else in the held note; and
     (c) pitch over the whole 12 s hold, graded like every other keycheck.
     Writes loopcheck.json beside the SFZ.

Loop points in SFZ and smpl are inclusive sample indices (loop_end is the last
sample played before the jump); DecentSampler is given the same numbers.
"""
from __future__ import annotations

import json
import math
import re
import shutil
import struct
import sys
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_sfz  # noqa: E402
from build_sfz import parse_sfz, key_hz, note_name  # noqa: E402
from verify import load_wav, track, grade, analysis_window, refine_hz, HOP  # noqa: E402

XFADE = 0.060          # seconds of baked crossfade before loop end
MIN_LOOP, MAX_LOOP = 0.35, 1.6
HOLD = 12.0            # seconds each key is held in the seam check
CLICK_LIMIT_DB = 6.0   # a wrap louder than this above the loop body's own HF is a click
STEP_LIMIT_DB = 1.5    # extra level wobble at a wrap beyond the take's own; above this it pumps


def seam_cost(y: np.ndarray, s: int, e: int, w: int) -> float:
    a, b = y[s - w:s + w], y[e - w:e + w]
    return float(np.sum((a - b) ** 2) / (np.sum(a * a) + np.sum(b * b) + 1e-12))


def find_loops(y: np.ndarray, sr: int, hz: float, start: int, keep: int = 8) -> list[dict]:
    """Search the whole body of the take (the takes swell and fade like played
    phrases, so there is rarely a long flat stretch to restrict to). A seam is
    scored on waveform likeness and on level match ~80 ms either side."""
    from numpy.lib.stride_tricks import sliding_window_view
    lo = max(start + int(0.30 * sr), int(XFADE * sr) + 1)        # clear of the bow-on
    hi = len(y) - int(0.20 * sr)                                   # clear of the tail
    period = sr / hz
    w = max(int(4 * period), int(0.008 * sr))
    m = int(0.08 * sr)
    pad = max(w, m)
    # a loop may only span frames where the take holds its note: pyin within
    # 50 cents of it. Without this the search happily loops a breathy stretch
    # with no pitch, or one where the model sagged an octave.
    f0, _ = track(y, sr, hz)
    held = np.abs(1200 * np.log2(np.nan_to_num(f0, nan=1.0) / hz)) < 50
    good = np.concatenate(([0], np.cumsum(held)))
    frame_of = lambda i: np.minimum(np.asarray(i) // HOP, len(held))
    win = sliding_window_view(y, 2 * w)                # win[i] = y[i:i+2w], seam at i+w
    energy = np.sum(win * win, axis=1)
    c2 = np.concatenate(([0.0], np.cumsum(y * y)))
    lvl_at = lambda i: 10 * np.log10((c2[i + m] - c2[i - m]) / (2 * m) + 1e-18)
    cands = []
    for s in range(lo + pad, hi - pad - int(MIN_LOOP * sr), int(0.005 * sr)):
        kmin = math.ceil(MIN_LOOP * sr / period)
        kmax = min(int(MAX_LOOP * sr / period), int((hi - pad - s) / period))
        if kmax < kmin:
            break
        e0 = np.round(s + np.arange(kmin, kmax + 1) * period).astype(int)
        es = np.concatenate((e0 - 1, e0, e0 + 1))       # land on the best sample
        a = win[s - w]
        cost = np.sum((win[es - w] - a) ** 2, axis=1) / (energy[s - w] + energy[es - w] + 1e-12)
        lvl = np.abs(lvl_at(es) - lvl_at(s))
        fs, fe = frame_of(s), frame_of(es)
        held_frac = (good[fe] - good[fs]) / np.maximum(fe - fs, 1)
        score = (cost + 0.05 * lvl) * (1.0 + 0.25 * (1.0 - (es - s) / (MAX_LOOP * sr)))
        score = np.where(held_frac >= 0.9, score, np.inf)
        j = int(np.argmin(score))
        if np.isfinite(score[j]):
            cands.append((float(score[j]), s, int(es[j]), float(lvl[j])))
    if not cands:
        raise ValueError("no stretch that holds the note long enough to loop")
    picked = []                                  # best few, starts >= 50 ms apart
    for c, s, e, lvl in sorted(cands):
        if all(abs(s - p[1]) > 0.05 * sr for p in picked):
            picked.append((c, s, e, lvl))
        if len(picked) == keep:
            break
    return [{"loop_start": s, "loop_end": e - 1, "loop_sec": round((e - s) / sr, 3),
             "periods": round((e - s) / period, 2), "seam_cost": round(c, 4),
             "seam_level_gap_db": round(lvl, 2)} for c, s, e, lvl in picked]


def bake_crossfade(y: np.ndarray, sr: int, s: int, e_incl: int) -> np.ndarray:
    """After this, sample e_incl is followed (on the wrap) by s exactly as s-1 is."""
    e = e_incl + 1
    n = min(int(XFADE * sr), s, (e - s) // 3)
    out = y.copy()
    t = np.linspace(0.0, 1.0, n, endpoint=False)
    a, b = y[e - n:e], y[s - n:s]
    rho = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-12))
    ga, gb = np.cos(0.5 * math.pi * t), np.sin(0.5 * math.pi * t)
    # keep power level through the blend whatever the two stretches' likeness:
    # a plain linear fade dips where they are out of phase, which reads as a pump
    norm = np.sqrt(ga * ga + gb * gb + 2 * rho * ga * gb)
    out[e - n:e] = (a * ga + b * gb) / np.maximum(norm, 0.5)
    return out


def write_wav_smpl(path: Path, y: np.ndarray, sr: int, unity: int, s: int, e_incl: int) -> None:
    pcm = np.clip(np.round(y * 32767.0), -32768, 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())
    smpl = struct.pack("<9I", 0, 0, int(round(1e9 / sr)), unity, 0, 0, 0, 1, 0)
    smpl += struct.pack("<6I", 0, 0, s, e_incl, 0, 0)       # forward loop, forever
    raw = bytearray(path.read_bytes())
    raw += b"smpl" + struct.pack("<I", len(smpl)) + smpl
    raw[4:8] = struct.pack("<I", len(raw) - 8)
    path.write_bytes(bytes(raw))


def read_smpl(path: Path) -> tuple[int, int] | None:
    raw = path.read_bytes()
    i = raw.find(b"smpl")
    if i < 0:
        return None
    return struct.unpack("<2I", raw[i + 8 + 36 + 8:i + 8 + 36 + 16])


def play_looped(y: np.ndarray, sr: int, reg: dict, key: int, secs: float) -> tuple[np.ndarray, list[int]]:
    """build_sfz.play, but positions past loop_end wrap to loop_start. Returns the
    output and the output indices where a wrap happened."""
    cents = (key - reg["pitch_keycenter"]) * 100.0 + reg["tune"]
    step = 2.0 ** (cents / 1200.0)
    s, e = reg["loop_start"], reg["loop_end"] + 1
    pos = reg["offset"] + step * np.arange(int(secs * sr))
    past = pos >= e
    wraps_count = np.floor((pos - s) / (e - s)).astype(int)
    pos = np.where(past, s + np.mod(pos - s, e - s), pos)
    out = np.interp(pos, np.arange(len(y)), y)
    wraps = (np.flatnonzero(np.diff(wraps_count) > 0) + 1).tolist()
    wraps = [i for i in wraps if past[i]]
    fade = int(0.003 * sr)
    out[:fade] *= np.linspace(0, 1, fade)
    return out, wraps


def hf_db(x: np.ndarray) -> float:
    d = np.diff(x)
    return 10 * math.log10(float(np.mean(d * d)) + 1e-15)


def seam_check(y: np.ndarray, sr: int, reg: dict, acc: dict) -> dict:
    key = reg["pitch_keycenter"]
    out, wraps = play_looped(y, sr, reg, key, HOLD)
    h = int(0.0025 * sr)
    body = out[int(1.0 * sr):]
    blocks = [hf_db(body[i:i + 2 * h]) for i in range(0, len(body) - 2 * h, 2 * h)]
    med = float(np.median(blocks))
    clicks = [hf_db(out[i - h:i + h]) - med for i in wraps if i > h]
    # level: 20 ms RMS envelope; at each wrap, the spread (max - min, dB) over
    # the 200 ms around it, less the 90th-percentile spread of the take's own
    # bowing/breath wobble measured the same way away from any wrap
    hop, win = int(0.005 * sr), int(0.02 * sr)
    c2 = np.concatenate(([0.0], np.cumsum(out * out)))
    idx = np.arange(0, len(out) - win, hop)
    env = 10 * np.log10((c2[idx + win] - c2[idx]) / win + 1e-12)
    span = int(0.1 * sr) // hop
    spread = lambda j: float(np.ptp(env[max(0, j - span):j + span]))
    far = [j for j in range(int(1.0 * sr) // hop, len(env) - span, span)
           if all(abs(j * hop - i) > 0.15 * sr for i in wraps)]
    base = float(np.percentile([spread(j) for j in far], 90)) if far else 0.0
    steps = [spread(i // hop) - base for i in wraps]
    a, b = analysis_window(out, sr)          # the same window keycheck grades
    f0, _ = track(out[a:b], sr, key_hz(key))
    g = grade(np.asarray(f0, dtype=float), key_hz(key), acc,
              refine=lambda hz, seg=out[a:b]: refine_hz(seg, sr, hz))
    click = max(clicks, default=0.0)
    step = max(steps, default=0.0)
    return {"wraps_in_hold": len(wraps), "worst_click_db": round(click, 2),
            "worst_level_step_db": round(step, 2), "hold_grade": g["grade"],
            "hold_cents_err": g["cents_err"],
            "seam_ok": click < CLICK_LIMIT_DB and step < STEP_LIMIT_DB}


def loop_instrument(src: Path, acc: dict) -> dict:
    sfz = next(src.glob("*.sfz"))
    out_dir = src.parent / src.name.replace("_shaped", "_looped")
    if out_dir.exists():
        shutil.rmtree(out_dir)
    (out_dir / "samples").mkdir(parents=True)
    regions = parse_sfz(sfz)
    report, lines = [], []
    by_sample = {}
    for reg in regions:
        y, sr = load_wav(str(src / "samples" / reg["sample"]))
        hz = key_hz(reg["pitch_keycenter"]) * 2 ** (-reg["tune"] / 1200)   # what the take plays
        # rank candidates by seam likeness, then keep the first that also
        # survives the 12 s hold: no click, no pump, and still the take's note
        tried = []
        for rank, lp in enumerate(find_loops(y, sr, hz, reg["offset"])):
            z = bake_crossfade(y, sr, lp["loop_start"], lp["loop_end"])
            zz = np.round(z * 32767.0) / 32767.0             # what the 16-bit file will hold
            chk = seam_check(zz, sr, dict(reg, loop_start=lp["loop_start"],
                                          loop_end=lp["loop_end"]), acc)
            tried.append((lp, z, chk, rank))
            if chk["seam_ok"] and chk["hold_grade"] == "on_target":
                break
        passing = [t for t in tried if t[2]["seam_ok"] and t[2]["hold_grade"] == "on_target"]
        lp, z, chk, rank = passing[0] if passing else tried[0]
        dst = out_dir / "samples" / reg["sample"]
        write_wav_smpl(dst, z, sr, reg["pitch_keycenter"], lp["loop_start"], lp["loop_end"])
        assert read_smpl(dst) == (lp["loop_start"], lp["loop_end"])
        lp = dict(lp, candidate_rank=rank, candidates_tried=len(tried))
        by_sample[reg["sample"]] = lp
        report.append({"sample": reg["sample"], "key": note_name(reg["pitch_keycenter"]),
                       **lp, **chk})

    head, in_global = [], False
    for line in sfz.read_text().splitlines():
        if line.startswith("// ") and not head:
            line = line.replace("_shaped", "_looped", 1)
        if line.startswith("<global>"):
            in_global = True
        if in_global and line.startswith("loop_mode="):
            line = "loop_mode=loop_sustain"
        m = re.match(r"<region> sample=(\S+)", line)
        if m:
            lp = by_sample[m.group(1)]
            line += f" loop_start={lp['loop_start']} loop_end={lp['loop_end']}"
        lines.append(line)
    lines.insert(3, "// sustain loops by loop_sustain.py: steadiest whole-period stretch, "
                    f"{int(XFADE * 1000)} ms crossfade baked into the WAV; same points in each WAV's smpl chunk.")
    new_sfz = out_dir / sfz.name.replace("_shaped", "_looped")
    new_sfz.write_text("\n".join(lines) + "\n")
    ok = sum(r["seam_ok"] for r in report)
    on = sum(r["hold_grade"] == "on_target" for r in report)
    summary = {"instrument": out_dir.name, "samples": len(report), "seams_clean": ok,
               "held_12s_on_target": on,
               "worst_click_db": max(r["worst_click_db"] for r in report),
               "worst_level_step_db": max(r["worst_level_step_db"] for r in report),
               "loop_sec_range": [min(r["loop_sec"] for r in report), max(r["loop_sec"] for r in report)],
               "limits": {"click_db": CLICK_LIMIT_DB, "level_step_db": STEP_LIMIT_DB, "hold_sec": HOLD},
               "samples_detail": report}
    (out_dir / "loopcheck.json").write_text(json.dumps(summary, indent=1) + "\n")
    for f in ("shaping.json",):
        if (src / f).exists():
            shutil.copy(src / f, out_dir / f)
    return summary


def held_demo(src: Path, looped: Path, secs: float = 7.0, gap: float = 1.0) -> Path:
    """held.wav: low, middle and high key of the range, each held `secs` —
    first from the unlooped instrument (it stops when the take runs out),
    then from the looped one. The bow-on and release are the SFZ's."""
    from shape_attacks import BOW_ATTACK, BOW_VEL2ATTACK
    from adapters._common import write_wav
    old = {r["lokey"]: r for r in parse_sfz(next(src.glob("*.sfz")))}
    new = parse_sfz(next(looped.glob("*.sfz")))
    picks = [new[0], new[len(new) // 2], new[-1]]
    sr = load_wav(str(looped / "samples" / new[0]["sample"]))[1]
    a = int((BOW_ATTACK + BOW_VEL2ATTACK * 100 / 127) * sr)
    rel = np.cos(np.linspace(0, math.pi / 2, int(0.35 * sr))) ** 2
    parts = []
    for reg in picks:
        for which, folder, r in (("as shipped", src, old[reg["lokey"]]), ("looped", looped, reg)):
            y, _ = load_wav(str(folder / "samples" / r["sample"]))
            if "loop_start" in r:
                n, _ = play_looped(y, sr, r, r["pitch_keycenter"], secs)
            else:
                n = build_sfz.play(y, sr, r, r["pitch_keycenter"], secs)
            n = np.concatenate((n, np.zeros(int(secs * sr) - len(n))))
            n[:a] *= np.linspace(0, 1, a)
            n[-len(rel):] *= rel
            parts += [n, np.zeros(int(gap * sr))]
    out = looped / "held.wav"
    write_wav(str(out), np.concatenate(parts), sr)
    return out


def main() -> None:
    acc = json.loads((HERE / "matrix.json").read_text())["acceptance"]
    for d in sys.argv[1:]:
        src = (HERE / d).resolve()
        s = loop_instrument(src, acc)
        held_demo(src, src.parent / s["instrument"])
        print(json.dumps({k: v for k, v in s.items() if k != "samples_detail"}))


if __name__ == "__main__":
    main()
