"""
title: Semantic Delay — rich — measure
born: 2026-11-03
links: [[Semantic Delay]] (connects-to · rich-face-workshop) · feeds "Semantic Delay — rich — what the knob holds.html" and "— how long a delay.html"
forward_vector: I measure, from the bundle's own takes and its own code, every number the two rich-face
  walks show, so a piece never states a figure nobody computed. I change when the takes or the knob's code do.

Run (any Python with numpy and soundfile; no model, no torch):
    python3 "Projects/Semantic Delay/Semantic Delay — rich — measure.py"
Writes "Semantic Delay — rich — measure.json" beside this file, and copies each walk's part of it into
that walk's <script id="data"> block, so a piece framed with no origin (the public face) still has its numbers.

What it reads, all tracked in the bundle:
  standalone/demo/stage4-real/        the dry phrase and its three real-model echoes at K = 1, 0.5, 0
  standalone/demo/stage15-real-daemon the offline run through the helper at an 8 s delay
  plugin/proofs/echo-through-helper-soulx/  the plugin's real-time run at a 12 s delay
  standalone/f0.py, standalone/coupling.py  the bundle's own pitch tracker and the knob's own rule

The pitch tracker here is the bundle's sandbox tracker (f0.py), not RMVPE, which needs torch.
On the K = 1 echo it lands 0.33 st from the source, the figure RMVPE gave in the stage 4 report.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "standalone"))
from f0 import extract_f0, f0_to_midi, midi_to_f0  # noqa: E402
from coupling import Spirit, amplitude_envelope, couple, repair_octave_jumps  # noqa: E402

HOP_SEC = 0.010
CLARITY = 0.60          # the tracker's voicing floor; 0.60 matches RMVPE's K = 1 figure (0.33 st)
AUTO_SHIFT_ST = 2       # the model's own transpose into the singer's range, from stage4-real-report.json
PENTA = (0, 3, 5, 7, 10)
ROOT_MIDI = 61          # pentatonic_root_midi in stage4-real-report.json
HANG = 0.30             # the phrase gate's closing quiet (segmenter.py, Algorithm.h kHangoverSec)


def r3(x):
    return round(float(x), 3)


def octave_fold(m):
    """Move each voiced frame by whole octaves to within 6 st of the phrase's median pitch.
    The sandbox tracker slips an octave, sometimes for half a second at a time, longer than
    repair_octave_jumps' window can see; this phrase spans under an octave (RMVPE: 59 to 70),
    so a frame more than 6 st from its median is a slip, never melody."""
    out = np.array(m, dtype=np.float64)
    ref = float(np.nanmedian(out))
    v = np.isfinite(out)
    out[v] -= 12.0 * np.round((out[v] - ref) / 12.0)
    return out


def track(x, sr):
    f, _ = extract_f0(x, sr, clarity_floor=CLARITY)
    return octave_fold(repair_octave_jumps(f0_to_midi(f)))   # MIDI, NaN unvoiced


def fold(d):
    return (d + 6.0) % 12.0 - 6.0              # an octave slip in the tracker is not a melody


def corr_at(a, b, lag):
    n = min(len(a), len(b))
    a, b = a[:n], b[:n]
    if lag > 0:
        a, b = a[lag:], b[:-lag]
    elif lag < 0:
        a, b = a[:lag], b[-lag:]
    return float(np.corrcoef(a, b)[0, 1])


def knob():
    d = HERE / "standalone/demo/stage4-real"
    tl, sr = sf.read(d / "stage4-real-coupling-delay.wav", dtype="float32")
    dry = tl[: int(6.4 * sr)]                   # the timeline opens on the dry phrase, 6.4 s
    hop = int(HOP_SEC * sr)
    rep = json.loads((d / "stage4-real-report.json").read_text())
    m_dry = track(dry, sr)
    e_dry = amplitude_envelope(dry, hop)
    out = {"sr": sr, "hop_sec": HOP_SEC, "dry_seconds": 6.4, "auto_shift_st": AUTO_SHIFT_ST,
           "dry": {"midi": [None if not np.isfinite(v) else round(float(v), 2) for v in m_dry],
                   "env": [r3(v) for v in e_dry]},
           "echoes": {}}
    for K in ("1.0", "0.5", "0.0"):
        y, _ = sf.read(d / f"echo-K{K}.wav", dtype="float32")
        m = track(y, sr)
        e = amplitude_envelope(y, hop)
        n = min(len(m), len(m_dry))
        both = np.isfinite(m[:n]) & np.isfinite(m_dry[:n])
        dist = float(np.mean(np.abs(fold(m[:n][both] - m_dry[:n][both]) - AUTO_SHIFT_ST)))
        lags = list(range(-40, 41))
        rs = [corr_at(e, e_dry, L) for L in lags]
        rmvpe = next(r for r in rep["rows"] if abs(r["K"] - float(K)) < 1e-9)
        out["echoes"][K] = {
            "file": f"standalone/demo/stage4-real/echo-K{K}.wav",
            "midi": [None if not np.isfinite(v) else round(float(v), 2) for v in m],
            "env": [r3(v) for v in e],
            "melody_st": round(dist, 2),
            "melody_st_rmvpe": rmvpe["sung_vs_source_st"],
            "asked_st_rmvpe": rmvpe["asked_vs_source_st"],
            "rhythm_r": round(rs[lags.index(0)], 3),
            "rhythm_best_lag_ms": lags[int(np.argmax(rs))] * 10,
            "rhythm_r_shift_120ms": round(corr_at(e, e_dry, 12), 3),
        }
    # The echoes against each other: same voice, three melodies. If K moved the timing, these would part.
    envs = {K: np.array(v["env"]) for K, v in out["echoes"].items()}
    out["echo_vs_echo_r"] = {f"{a}~{b}": round(corr_at(envs[a], envs[b], 0), 3)
                             for a, b in (("1.0", "0.5"), ("1.0", "0.0"), ("0.5", "0.0"))}
    # The knob's own rule, swept: how far it ASKS the echo to sing from the melody, at 21 settings.
    f_dry = midi_to_f0(m_dry)                   # the tracked melody, octave slips folded out
    target = f_dry                              # couple() repairs before it pulls; nothing left to repair
    center = float(np.nanmedian(m_dry))
    sp = Spirit(name="huehuecoyotl", center_midi=center, drift_semitones=3.0,
                vibrato_semitones=0.4, seed=7, scale=PENTA, scale_root_midi=ROOT_MIDI)
    tm = f0_to_midi(target)
    sweep = []
    for K in np.round(np.linspace(0, 1, 21), 2):
        a = f0_to_midi(couple(f_dry, sp, float(K), hop_sec=HOP_SEC))
        b = np.isfinite(a) & np.isfinite(tm)
        sweep.append([float(K), round(float(np.mean(np.abs(a[b] - tm[b]))), 3)])
    out["sweep_rmvpe_check"] = {r["K"]: r["asked_st_rmvpe"] if "asked_st_rmvpe" in r else r["asked_vs_source_st"]
                                for r in rep["rows"]}
    out["sweep"] = sweep
    # straightness: the largest gap between the sweep and the straight line through its ends
    k = np.array([s[0] for s in sweep]); v = np.array([s[1] for s in sweep])
    line = v[0] + (v[-1] - v[0]) * k
    out["sweep_max_off_line_st"] = r3(np.max(np.abs(v - line)))
    out["sweep_steps"] = [r3(x) for x in np.diff(v)]
    return out


def delays():
    # The offline run through the helper: 0.5 s quiet, phrase 1 (6.4 s), 2 s, phrase 2 (4.5 s), 0.3 s.
    d = HERE / "standalone/demo/stage15-real-daemon"
    rep = json.loads((d / "stage15-real-daemon-report.json").read_text())
    y, sr = sf.read(d / "stage15-real-daemon-delay.wav", dtype="float32")
    sung = [(0.5, 6.9), (8.9, 13.4)]
    delay = rep["instrument"]["delay_sec"]
    free = 0.0
    off = []
    for (a, b), e in zip(sung, rep["echoes"]):
        close = b + HANG
        sent = e["seconds_out"]                 # what the helper was sent: the phrase and its closing quiet
        start = max(close, free)                # one helper, one conversion at a time
        ready = start + e["rtf"] * sent
        free = ready
        due = close + delay
        off.append({"sung": [a, b], "close": r3(close), "sent": sent, "rtf": e["rtf"],
                    "compute": r3(e["rtf"] * sent), "due": r3(due), "ready_live": r3(ready),
                    "late_live": r3(max(0.0, ready - due))})
    # where the echoes actually sit in the offline file (first 10 ms frame above -45 dBFS after each due-ish)
    hop = int(0.01 * sr)
    n = len(y) // hop
    db = 20 * np.log10(np.sqrt((y[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
    for o in off:
        i0 = int((o["due"] - 0.2) * 100)
        i = i0 + int(np.argmax(db[i0:] > -45))
        o["echo_heard_at"] = r3(i / 100)
    offline = {"file": "standalone/demo/stage15-real-daemon/stage15-real-daemon-delay.wav",
               "seconds": r3(len(y) / sr), "delay": delay, "steps": 32, "prompt_sec": 10.7,
               "phrases": off}

    # The plugin's real-time run: due times from its report, each conversion's speed from the helper's log.
    p = HERE / "plugin/proofs/echo-through-helper-soulx"
    prep = json.loads((p / "report.json").read_text())
    log = (p / "helper.log").read_text()
    conv = [(float(a), float(b)) for a, b in re.findall(r"convert \S+: ([\d.]+) s in, rtf=([\d.]+)", log)]
    D = prep["delay_s"]
    ech = sorted(prep["echoes"], key=lambda e: e["due_s"])
    # the helper logged its conversions in the order it sang them: soonest due first
    free = 0.0
    rows = []
    for e, (sec, rtf) in zip(ech, conv):
        close = e["due_s"] - e["repeat"] * D
        start = max(close, free)
        ready = start + rtf * sec
        free = ready
        rows.append({"phrase": e["phrase"], "repeat": e["repeat"], "close": r3(close), "sent": sec,
                     "rtf": rtf, "due": e["due_s"], "ready_model": r3(ready),
                     "started": e["start_s"], "late_reported": e["late_s"]})
    realtime = {"delay": D, "steps": prep["steps"], "echoes": rows,
                "all_on_time": all(r["ready_model"] <= r["due"] for r in rows)}

    # The page's own arithmetic and the measured speeds, as the shortest delay that lands on time.
    bench = json.loads((d / "stage15-latency-bench.json").read_text())
    speeds = [{"label": "April, the model alone", "rtf": 1.65, "where": "Stage 0, the page"}]
    speeds += [{"label": f"through the helper, {r['n_steps']} steps, {r['prompt_sec']:g} s singer clip",
                "rtf": r["rtf"], "where": "stage15-latency-bench.json"} for r in bench["rows"]]
    for s in speeds:
        s["longest_phrase_for_8s"] = r3(min(8.0, 8.0 / s["rtf"] - HANG))
        s["delay_for_4s_phrase"] = r3(s["rtf"] * (4.0 + HANG))
        s["delay_for_8s_phrase"] = r3(s["rtf"] * (8.0 + HANG))
    return {"hang": HANG, "max_phrase": 8.0, "offline": offline, "realtime": realtime, "speeds": speeds,
            "page_claim": {"phrase": 4.0, "rtf": 1.65, "compute_page": 6.5, "delay": 8.0,
                           "compute_with_gate": r3(1.65 * (4.0 + HANG))}}


if __name__ == "__main__":
    res = {"knob": knob(), "delay": delays()}
    (HERE / "Semantic Delay — rich — measure.json").write_text(json.dumps(res, separators=(",", ":")))
    for piece, part in (("what the knob holds", "knob"), ("how long a delay", "delay")):
        f = HERE / f"Semantic Delay — rich — {piece}.html"
        html = f.read_text()
        block = json.dumps(res[part], separators=(",", ":"))
        new = re.sub(r'(<script id="data" type="application/json">)[\s\S]*?(</script>)',
                     lambda m: m.group(1) + block + m.group(2), html, count=1)
        assert new != html or block in html, f"no data block in {f.name}"
        f.write_text(new)
    k = res["knob"]
    for K, e in k["echoes"].items():
        print(f"K={K}: melody {e['melody_st']} st (RMVPE {e['melody_st_rmvpe']}), rhythm r {e['rhythm_r']} "
              f"best lag {e['rhythm_best_lag_ms']} ms, shifted 120 ms {e['rhythm_r_shift_120ms']}")
    print("echo vs echo", k["echo_vs_echo_r"])
    print("sweep", k["sweep"], "max off line", k["sweep_max_off_line_st"])
    dl = res["delay"]
    for o in dl["offline"]["phrases"]:
        print("offline", o)
    for r in dl["realtime"]["echoes"]:
        print("realtime", r)
    for s in dl["speeds"]:
        print("speed", s)
