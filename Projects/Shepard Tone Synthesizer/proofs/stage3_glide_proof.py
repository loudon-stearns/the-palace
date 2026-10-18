"""Stage 3 — the glide, measured.

The question this move asks: why must every octave of the stack glide as ONE
voice? This script renders the same climbing phrase six ways and measures,
sample by sample, how far the AUDIBLE voices disagree about which pitch class
they are playing. Octave equivalence fuses the stack into one note only while
that disagreement is near zero.

Six ways to glide the same phrase (C E G C' E' G' C'', 0.8 s per note):

  A  lockstep        one shared pitch path in log-pitch (semitones), every
                     voice = that path + whole octaves. The reference.
  B  drift 0.15      each voice gets its own glide time, ±15% across the stack
  C  drift 0.40      ±40%
  D  drift 0.80      ±80% (lowest voice 90 ms, highest 810 ms)
  E  Hz slew         each voice slews at a constant rate in Hz per second.
                     A plausible patching mistake: a fixed-rate ramp on the
                     oscillator's frequency. Low voices arrive first, high
                     voices last — the stack fans out on every move.
  F  shared, in Hz   one shared one-pole glide, but run on frequency in Hz
                     instead of on pitch. Different glide CURVE, same fusion:
                     a linear filter on proportional inputs keeps every ratio,
                     so the octaves stay exact. Proves the curve is free and
                     the sharing is what matters.

Measurement: at every sample, each voice's pitch-class deviation from the
shared path is taken in cents (wrapped to ±600). Among voices louder than
-20 dB re the loudest weight, the spread (max − min) is the disagreement.
10 cents is the line I use for "the octaves start to sound mistuned"; it is a
declared choice, not a measured threshold for these sounds.

Writes WAVs, a figure and a manifest next to this file.
Run:  python3 stage3_glide_proof.py   (the figure needs matplotlib; .venvs/kokoro has it)
"""

from __future__ import annotations

import json
import math
import os
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
from shepard_synth import A4_HZ, A4_MIDI, DEFAULT_CENTROID_LOG2HZ  # noqa: E402

SR = 48_000
PHRASE = (0.0, 4.0, 7.0, 12.0, 16.0, 19.0, 24.0)
HOLD_S = 0.8
GLIDE_MS = 450.0
START_MIDI = 60.0
N_VOICES = 11
SIGMA = 1.0
AUDIBLE = 0.1          # amplitude weight; -20 dB re the envelope peak
SPLIT_CENTS = 10.0
TAG = "2026-10-18-stage3"


def one_pole(x: np.ndarray, tc_ms: float) -> np.ndarray:
    if tc_ms <= 0:
        return x.copy()
    a = math.exp(-1.0 / (tc_ms * 1e-3 * SR))
    out = np.empty_like(x)
    y = x[0]
    for i in range(len(x)):
        y = a * y + (1.0 - a) * x[i]
        out[i] = y
    return out


def slew_hz(target_hz: np.ndarray, rate_hz_per_s: float) -> np.ndarray:
    step = rate_hz_per_s / SR
    out = np.empty_like(target_hz)
    y = target_hz[0]
    for i in range(len(target_hz)):
        d = target_hz[i] - y
        y += max(-step, min(step, d))
        out[i] = y
    return out


def target_path() -> np.ndarray:
    hold = int(round(HOLD_S * SR))
    return np.concatenate([np.full(hold, t) for t in PHRASE])


def render(mode: str, spread: float = 0.0, hz_rate: float = 150.0):
    """Return audio plus per-voice unwrapped log2-Hz and the shared path."""
    tgt = target_path()
    base = math.log2(A4_HZ) + (START_MIDI - A4_MIDI) / 12.0
    half = N_VOICES // 2
    offsets = np.arange(-half, -half + N_VOICES, dtype=np.float64)
    shared = one_pole(tgt, GLIDE_MS)                     # the reference path, semitones
    shared_hz_unit = one_pole(np.power(2.0, tgt / 12.0), GLIDE_MS)  # mode F

    voices = []
    for k, off in enumerate(offsets):
        if mode == "lockstep":
            l2 = base + shared / 12.0 + off
        elif mode == "drift":
            tc = GLIDE_MS * (1.0 + spread * (k - half) / half)
            l2 = base + one_pole(tgt, tc) / 12.0 + off
        elif mode == "hz_slew":
            f_tgt = np.power(2.0, base + tgt / 12.0 + off)
            l2 = np.log2(np.maximum(slew_hz(f_tgt, hz_rate), 1e-6))
        elif mode == "shared_hz":
            l2 = base + off + np.log2(shared_hz_unit)
        else:
            raise ValueError(mode)
        voices.append(l2)
    voices = np.array(voices)

    # Wrap every voice into the stack's span around the envelope centre
    # (whole octaves only — the seam is free), then weight by the envelope.
    c = DEFAULT_CENTROID_LOG2HZ
    span = float(N_VOICES)
    wrapped = c + (((voices - c + span / 2.0) % span) - span / 2.0)
    amps = np.exp(-((wrapped - c) ** 2) / (2.0 * SIGMA ** 2))
    freqs = np.minimum(np.power(2.0, wrapped), SR / 2 * 0.98)
    phase = 2.0 * math.pi * np.cumsum(freqs, axis=1) / SR
    audio = np.sum(amps * np.sin(phase), axis=0)
    audio *= 0.5 / np.max(np.abs(audio))
    fade = int(0.025 * SR)
    ramp = np.linspace(0, 1, fade)
    audio[:fade] *= ramp
    audio[-fade:] *= ramp[::-1]

    ref = base + shared / 12.0
    return audio.astype(np.float32), wrapped, amps, ref


def disagreement(wrapped: np.ndarray, amps: np.ndarray, ref: np.ndarray) -> np.ndarray:
    """Per-sample spread (cents) of pitch-class deviation among audible voices."""
    dev = (wrapped - ref[None, :]) * 1200.0
    dev = ((dev + 600.0) % 1200.0) - 600.0
    loud = amps >= AUDIBLE
    hi = np.where(loud, dev, -np.inf).max(axis=0)
    lo = np.where(loud, dev, np.inf).min(axis=0)
    return np.where(np.isfinite(hi) & np.isfinite(lo), hi - lo, 0.0)


def write_wav(path: str, audio: np.ndarray) -> None:
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


CASES = [
    ("A", "lockstep", "lockstep", {}),
    ("B", "drift-015", "drift", {"spread": 0.15}),
    ("C", "drift-040", "drift", {"spread": 0.40}),
    ("D", "drift-080", "drift", {"spread": 0.80}),
    ("E", "hz-slew", "hz_slew", {"hz_rate": 150.0}),
    ("F", "shared-in-hz", "shared_hz", {}),
]


def main() -> None:
    results, traces = [], {}
    for letter, slug, mode, kw in CASES:
        audio, wrapped, amps, ref = render(mode, **kw)
        d = disagreement(wrapped, amps, ref)
        name = f"{TAG}-{letter}-{slug}.wav"
        write_wav(os.path.join(HERE, name), audio)
        traces[letter] = (wrapped, amps, d)
        traces["ref"] = ref
        results.append({
            "clip": letter, "file": name, "mode": mode, **kw,
            "worst_cents": round(float(d.max()), 1),
            "seconds_over_10c": round(float((d > SPLIT_CENTS).sum() / SR), 2),
            "seconds_over_50c": round(float((d > 50.0).sum() / SR), 2),
            "duration_s": round(len(audio) / SR, 2),
        })
        print(results[-1])

    # Figure: the stack climbing, two error panels, and the disagreement panel.
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    bg, fg, dim, gold, red = "#0a0a0f", "#e8e8f0", "#8a8aa0", "#e8b84a", "#ff5a5a"
    plt.rcParams.update({"text.color": fg, "axes.labelcolor": dim, "xtick.color": dim,
                         "ytick.color": dim, "axes.edgecolor": "#4a4a5e",
                         "font.family": "DejaVu Sans", "font.size": 9})
    fig, axes = plt.subplots(4, 1, figsize=(10, 11), facecolor=bg,
                             gridspec_kw={"height_ratios": [1, 1, 1, 0.9]})
    t = np.arange(len(target_path())) / SR
    dec = 240
    c = DEFAULT_CENTROID_LOG2HZ
    ax = axes[0]
    wrapped, amps, _ = traces["A"]
    ax.set_facecolor(bg)
    for v in range(N_VOICES):
        a = amps[v, ::dec]
        ax.scatter(t[::dec], wrapped[v, ::dec] - c, s=2.0 + 10 * a, c=gold,
                   alpha=np.clip(a, 0.03, 1), lw=0)
    ax.set_ylim(-3.6, 3.6)
    ax.set_ylabel("octaves from C4")
    ax.set_title("A · lockstep — the stack climbs two octaves; brightness = loudness, "
                 "voices fade out the top and in at the bottom", loc="left", color=fg, fontsize=10)
    ref = traces["ref"]
    for ax, letter, title in [
            (axes[1], "C", "C · drift ±40% — each audible voice's pitch-class error from the shared path"),
            (axes[2], "E", "E · Hz slew — the same, when each voice ramps at 150 Hz/s")]:
        wrapped, amps, _ = traces[letter]
        ax.set_facecolor(bg)
        dev = ((wrapped - ref[None, :]) * 1200.0 + 600.0) % 1200.0 - 600.0
        for v in range(N_VOICES):
            a = amps[v, ::dec]
            keep = a >= AUDIBLE
            if not keep.any():
                continue
            ax.scatter(t[::dec][keep], dev[v, ::dec][keep], s=2.0 + 10 * a[keep], c=gold,
                       alpha=np.clip(a[keep], 0.15, 1), lw=0)
        ax.axhline(0, color=dim, lw=0.6)
        ax.set_ylabel("cents off the octave")
        ax.set_title(title, loc="left", color=fg, fontsize=10)
    ax = axes[3]
    ax.set_facecolor(bg)
    colors = {"A": gold, "B": "#c8c8d8", "C": "#8fa8ff", "D": "#4a8fff", "E": red, "F": "#7fd17f"}
    for letter, _, _, _ in CASES:
        d = traces[letter][2]
        ax.plot(t[::dec], np.maximum(d[::dec], 0.1), color=colors[letter], lw=1.2, label=letter)
    ax.axhline(SPLIT_CENTS, color=dim, ls="--", lw=0.8)
    ax.set_yscale("log")
    ax.set_ylim(0.1, 1300)
    ax.set_xlabel("seconds")
    ax.set_ylabel("disagreement (cents)")
    ax.set_title("how far the audible voices disagree on the pitch class · dashed line = 10 cents",
                 loc="left", color=fg, fontsize=10)
    ax.legend(ncol=6, frameon=False, loc="upper right", fontsize=8)
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, f"{TAG}-glide-fusion.png"), dpi=130, facecolor=bg)

    manifest = {
        "phrase_semitones": PHRASE, "hold_s": HOLD_S, "glide_ms": GLIDE_MS,
        "start_midi": START_MIDI, "voices": N_VOICES, "sigma_octaves": SIGMA,
        "audible_weight": AUDIBLE, "split_line_cents": SPLIT_CENTS, "sample_rate": SR,
        "results": results,
    }
    with open(os.path.join(HERE, f"{TAG}-manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)


if __name__ == "__main__":
    main()
