"""Stage 4 — the timbre, measured.

The question this move asks: when every voice of the stack stops being a sine
and gets overtones, shaped by its own key-tracked filter, what does that do to
the illusion? Stages 1-3 used sines, so each voice was one partial and "a
loudness window on each voice" and "a bandpass filter on the summed audio"
were the same thing. With overtones they are not, and that is most of what
this stage teaches.

Every clip is the same endless climb: 2 semitones a second for 12 seconds
(two octaves), one shared pitch path, so the octaves are exact (Stage 3).
Each voice is a band-limited sawtooth (harmonics h = 1..32, amplitude 1/h)
through its own timbre filter, a 2-pole lowpass magnitude
|H(f)| = 1 / sqrt(1 + (f / fc)^4). This is a magnitude model of the filter,
not a time-domain filter; it keeps the measurements exact.

  A  ratio x4, window per voice     fc = 4 * f_k. The recommended build.
  B  ratio x16, window per voice    fc = 16 * f_k. Bright.
  C  offset +1000 Hz                fc = f_k + 1000 Hz, the example on the
                                    page. Low voices get many harmonics, high
                                    voices almost none.
  D  tracks the note, not the voice fc = 4 * f_note for every voice, where
                                    f_note is the played note folded into the
                                    octave above C4. A plausible patching
                                    mistake: key tracking wired from the one
                                    pitch stream before the stack.
  E  window on the sum, 11 voices   fc = 16 * f_k, but the Shepard window is
                                    a filter on the summed audio, so it weighs
                                    each PARTIAL by where it sits, not each
                                    voice by its fundamental. The page's own
                                    architecture, with Stage 3's stack size.
  F  window on the sum, 15 voices   as E, with the stack widened by four
                                    octaves, log2(32) - 1 = 4, the reach of
                                    the overtones above each fundamental.

Measurements are made on the partial table (every partial's frequency and
amplitude at a given pitch), over one octave of climb in 1/20-semitone steps:

  purity      share of the sound's energy at the played pitch class
              (partials within +-50 cents of it, any octave)
  next pc     the strongest other pitch class and its share
  wobble      how far the brightness (energy-weighted mean log2 frequency)
              moves over one octave of climb, in octaves
  jump        the largest brightness step between neighbouring 1/20-st
              pitches, in octaves. A smooth climb makes tiny steps; a seam
              makes one big one
  seam        level of the voice that wraps from the top of the stack to the
              bottom, the instant it arrives, in dB relative to the whole
              sound. Below about -60 dB it can't be heard; Stage 3's sines
              sat near -130 dB
  sub         share of the energy coming from voices whose fundamental is
              below 20 Hz. Those voices are heard as flutter, not pitch
  flutter     from the audio: how much the loudness moves between 4 ms
              frames (standard deviation / mean)

Writes WAVs, a figure and a manifest next to this file.
Run:  python3 stage4_timbre_proof.py   (the figure needs matplotlib; .venvs/kokoro has it)
"""

from __future__ import annotations

import json
import math
import os
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))

SR = 48_000
F_C4 = 261.6255653005986
RATE_ST_S = 2.0
DUR_S = 12.0
HARMONICS = 32
SIGMA = 1.0
TAG = "2026-10-18-stage4"

CLIPS = [
    dict(clip="A", slug="ratio4", track="ratio", r=4.0, window="voice", voices=11,
         label="ratio x4, window per voice"),
    dict(clip="B", slug="ratio16", track="ratio", r=16.0, window="voice", voices=11,
         label="ratio x16, window per voice"),
    dict(clip="C", slug="offset1000", track="offset", r=1000.0, window="voice", voices=11,
         label="offset +1000 Hz, window per voice"),
    dict(clip="D", slug="tracks-note", track="note", r=4.0, window="voice", voices=11,
         label="tracks the note, not the voice"),
    dict(clip="E", slug="sum-window-11", track="ratio", r=16.0, window="sum", voices=11,
         label="window on the sum, 11 voices"),
    dict(clip="F", slug="sum-window-15", track="ratio", r=16.0, window="sum", voices=15,
         label="window on the sum, 15 voices"),
]


def stack_positions(p_st: np.ndarray, voices: int) -> np.ndarray:
    """Octaves from C4 for each voice, wrapped into the stack's span. Shape (V, T)."""
    half = voices // 2
    offs = np.arange(-half, -half + voices, dtype=np.float64)[:, None]
    x = p_st[None, :] / 12.0 + offs
    span = float(voices)
    return ((x + span / 2.0) % span) - span / 2.0


def cutoff(cfg: dict, x: np.ndarray, p_st: np.ndarray) -> np.ndarray:
    f = F_C4 * np.power(2.0, x)
    if cfg["track"] == "ratio":
        return cfg["r"] * f
    if cfg["track"] == "offset":
        return f + cfg["r"]
    if cfg["track"] == "note":
        f_note = F_C4 * np.power(2.0, (p_st % 12.0) / 12.0)
        return np.broadcast_to(cfg["r"] * f_note[None, :], x.shape)
    raise ValueError(cfg["track"])


def window(x: np.ndarray) -> np.ndarray:
    return np.exp(-(x ** 2) / (2.0 * SIGMA ** 2))


def nyquist_taper(f: np.ndarray) -> np.ndarray:
    lo, hi = 0.40 * SR, 0.45 * SR
    t = np.clip((hi - f) / (hi - lo), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def partial_amps(cfg: dict, x: np.ndarray, p_st: np.ndarray, h: int) -> np.ndarray:
    """Amplitude of harmonic h of every voice. x: (V, T)."""
    f = F_C4 * np.power(2.0, x)
    fh = h * f
    fc = cutoff(cfg, x, p_st)
    filt = 1.0 / np.sqrt(1.0 + (fh / fc) ** 4)
    if cfg["window"] == "voice":
        w = window(x)
    else:
        w = window(x + math.log2(h))
    return (1.0 / h) * filt * w * nyquist_taper(fh)


# ── measurements on the partial table ────────────────────────────────────────

def table(cfg: dict, p_st: np.ndarray):
    x = stack_positions(p_st, cfg["voices"])
    pos, amp = [], []
    for h in range(1, HARMONICS + 1):
        pos.append(x + math.log2(h))
        amp.append(partial_amps(cfg, x, p_st, h))
    return np.stack(pos), np.stack(amp), x   # (H, V, T)


def measure(cfg: dict) -> dict:
    p = np.arange(0.0, 12.0, 0.05)
    pos, amp, x = table(cfg, p)
    e = amp ** 2
    total = e.sum(axis=(0, 1))
    # pitch class of each partial relative to the played one, in semitones (-6, 6]
    rel = ((pos * 12.0 - p[None, None, :]) + 6.0) % 12.0 - 6.0
    bins = np.round(rel).astype(int) % 12
    shares = np.zeros((12, len(p)))
    for b in range(12):
        shares[b] = np.where(bins == b, e, 0.0).sum(axis=(0, 1)) / total
    mean = shares.mean(axis=1)
    order = [int(i) for i in np.argsort(-mean) if i != 0]
    names = ["unison", "m2", "M2", "m3", "M3", "4th", "tritone", "5th", "m6", "M6", "m7", "M7"]
    bright = (e * pos).sum(axis=(0, 1)) / total
    jump = float(np.max(np.abs(np.diff(np.concatenate([bright, bright[:1]])))))

    # The seam: the top voice wraps to the bottom. Its level just after arrival.
    span = float(cfg["voices"])
    xa = np.array([[-span / 2.0 + 1e-9]])
    pa = np.array([0.0])
    arrive = sum(float(partial_amps(cfg, xa, pa, h)[0, 0] ** 2) for h in range(1, HARMONICS + 1))
    seam_db = 10.0 * math.log10(max(arrive, 1e-30) / float(total.mean()))

    f_fund = F_C4 * np.power(2.0, x)
    sub = float(((e * (f_fund[None] < 20.0)).sum(axis=(0, 1)) / total).mean())

    return dict(
        sub_share=round(sub, 3),
        purity=round(float(mean[0]), 3),
        next_pc=names[order[0]],
        next_share=round(float(mean[order[0]]), 3),
        wobble_oct=round(float(bright.max() - bright.min()), 3),
        jump_oct=round(jump, 3),
        seam_db=round(seam_db, 1),
        brightness_curve=[round(float(b), 4) for b in bright[::5]],
    )


# ── audio ────────────────────────────────────────────────────────────────────

def render(cfg: dict) -> np.ndarray:
    n = int(DUR_S * SR)
    t = np.arange(n) / SR
    p = RATE_ST_S * t
    x = stack_positions(p, cfg["voices"])
    f = F_C4 * np.power(2.0, x)
    phase = 2.0 * math.pi * np.cumsum(f, axis=1) / SR     # (V, T), continuous across wraps
    out = np.zeros(n)
    for h in range(1, HARMONICS + 1):
        a = partial_amps(cfg, x, p, h)
        out += np.sum(a * np.sin(h * phase), axis=0)
    out *= 0.5 / np.max(np.abs(out))
    fade = int(0.03 * SR)
    ramp = np.linspace(0, 1, fade)
    out[:fade] *= ramp
    out[-fade:] *= ramp[::-1]
    return out.astype(np.float32)


def flutter(audio: np.ndarray) -> float:
    fr = int(0.004 * SR)
    r = np.sqrt((audio[: len(audio) // fr * fr].reshape(-1, fr) ** 2).mean(axis=1))[100:-100]
    return round(float(r.std() / r.mean()), 3)


def write_wav(path: str, audio: np.ndarray) -> None:
    pcm = (np.clip(audio, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def figure(path: str) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    p = np.arange(0.0, 24.0, 0.05)
    fig, axes = plt.subplots(2, 3, figsize=(15, 8.4), sharey=True)
    fig.patch.set_facecolor("#0a0a0f")
    for ax, cfg in zip(axes.flat, CLIPS):
        pos, amp, _ = table(cfg, p)
        m = measure(cfg)
        e = (amp ** 2).reshape(-1, len(p))
        y = pos.reshape(-1, len(p))
        tt = np.broadcast_to(p[None, :] / RATE_ST_S, y.shape)
        db = 10 * np.log10(np.maximum(e / e.max(), 1e-12))
        keep = db > -60
        ax.set_facecolor("#0a0a0f")
        ax.scatter(tt[keep], y[keep], c=db[keep], s=0.6, cmap="magma", vmin=-60, vmax=0, linewidths=0)
        ax.set_ylim(-3.2, 4.2)
        ax.set_title(f"{cfg['clip']} · {cfg['label']}\npurity {m['purity']:.2f} · seam {m['seam_db']:.0f} dB · jump {m['jump_oct']:.2f} oct",
                     color="#e8e8f0", fontsize=10)
        ax.tick_params(colors="#8a8aa0", labelsize=8)
        for s in ax.spines.values():
            s.set_color("#4a4a5e")
    for ax in axes[:, 0]:
        ax.set_ylabel("octaves from C4", color="#8a8aa0")
    for ax in axes[1]:
        ax.set_xlabel("seconds (2 semitones a second)", color="#8a8aa0")
    fig.suptitle("Stage 4 · every partial of the endless climb, brightness = level (dB)", color="#e8b84a", fontsize=13)
    fig.tight_layout()
    fig.savefig(path, dpi=110, facecolor=fig.get_facecolor())


def main() -> None:
    results = []
    for cfg in CLIPS:
        m = measure(cfg)
        name = f"{TAG}-{cfg['clip']}-{cfg['slug']}.wav"
        audio = render(cfg)
        write_wav(os.path.join(HERE, name), audio)
        m["flutter"] = flutter(audio)
        row = {k: v for k, v in cfg.items()}
        row.update(file=name, **{k: v for k, v in m.items() if k != "brightness_curve"})
        results.append(row)
        print(f"{cfg['clip']}  purity {m['purity']:.3f}  next {m['next_pc']} {m['next_share']:.3f}  "
              f"wobble {m['wobble_oct']:.3f}  jump {m['jump_oct']:.3f}  seam {m['seam_db']:.1f} dB  "
              f"sub {m['sub_share']:.3f}  flutter {m['flutter']:.3f}")
    manifest = dict(rate_st_s=RATE_ST_S, duration_s=DUR_S, harmonics=HARMONICS, sigma_octaves=SIGMA,
                    sample_rate=SR, filter="2-pole lowpass magnitude 1/sqrt(1+(f/fc)^4)", results=results)
    with open(os.path.join(HERE, f"{TAG}-manifest.json"), "w") as fh:
        json.dump(manifest, fh, indent=2)
    try:
        figure(os.path.join(HERE, f"{TAG}-timbre.png"))
    except ImportError:
        print("matplotlib missing; figure skipped")


if __name__ == "__main__":
    main()
