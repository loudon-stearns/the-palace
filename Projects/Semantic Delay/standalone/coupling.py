"""
Semantic Delay — Stage 4: the rhythmic/melodic coupling layer
=============================================================

Stage 4 of the Phase 1 plan, made concrete: the phrase's own F0 contour becomes
the `target_f0` for every spirit's `convert` call, and **one knob** — the
coupling coefficient K — decides how tightly each returned tap tracks it.

The knob is Kuramoto's, read in the log-pitch domain. Each tap is an oscillator
with its own natural pitch behaviour (a centre, a drift, a vibrato — the
spirit's `conatus`, its striving to sing as itself). The original phrase is the
other oscillator. Per frame:

    p[n+1] = p[n] + alpha * ( K*(target[n] - p[n]) + (1-K)*(free[n] - p[n]) )

At **K = 1** the tap is phase-locked: it sings the original melody exactly, and
the effect is pure voice-swap. At **K = 0** it is free-running: the spirit
ignores the source and sings its own line over the source's rhythm. Between
them the tap hears the melody as a suggestion — the near-misses and syncopations
the home entry asks for. As K relaxes, a scale-quantizer also fades in with
weight (1-K): a loosely coupled spirit doesn't just drift, it drifts *onto a
grid*, which is what keeps the relaxed settings musical instead of merely sour.

Voicing is never invented: an unvoiced source frame stays 0.0 Hz out, matching
the SVC F0 convention (Hz floats, 0.0 = unvoiced).
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

from f0 import f0_to_midi, midi_to_f0

# Minor pentatonic on A — the grid a relaxed spirit falls onto.
DEFAULT_SCALE = (0, 3, 5, 7, 10)


@dataclass
class Spirit:
    """A tap's own voice: where it naturally sits and how it naturally moves."""
    name: str
    center_midi: float = 50.0
    vibrato_hz: float = 4.5
    vibrato_semitones: float = 0.35
    drift_semitones: float = 1.5     # slow random walk amplitude
    seed: int = 0
    scale: tuple = field(default=DEFAULT_SCALE)
    scale_root_midi: int = 45        # A2


def free_contour(spirit: Spirit, n_frames: int, hop_sec: float) -> np.ndarray:
    """The spirit's own line if nobody sang to it — MIDI floats."""
    rng = np.random.default_rng(spirit.seed)
    t = np.arange(n_frames, dtype=np.float64) * hop_sec
    vib = spirit.vibrato_semitones * np.sin(2 * np.pi * spirit.vibrato_hz * t)
    # Slow random walk, smoothed, normalised to the drift amplitude.
    walk = np.cumsum(rng.standard_normal(n_frames))
    if n_frames > 1 and np.ptp(walk) > 0:
        walk = walk - walk.mean()
        walk = walk / (np.max(np.abs(walk)) + 1e-9) * spirit.drift_semitones
    return spirit.center_midi + vib + walk


def _quantize_to_scale(midi: np.ndarray, spirit: Spirit) -> np.ndarray:
    """Snap each MIDI value to the nearest scale degree (any octave)."""
    scale = np.array(spirit.scale, dtype=np.float64)
    rel = midi - spirit.scale_root_midi
    octave = np.floor(rel / 12.0)
    pc = rel - octave * 12.0
    # nearest degree, considering the wrap to the next octave's root
    cands = np.concatenate([scale, scale + 12.0])
    idx = np.argmin(np.abs(pc[:, None] - cands[None, :]), axis=1)
    return spirit.scale_root_midi + octave * 12.0 + cands[idx]


def repair_octave_jumps(midi: np.ndarray, *, window: int = 25, limit: float = 7.0) -> np.ndarray:
    """Fold pitch-tracker octave slips back into place (MIDI floats, NaN unvoiced).

    A frame more than `limit` semitones from the running median of its voiced
    neighbours is moved by whole octaves toward that median. Found on the real
    model, 2026-10-14: RMVPE dropped one note of the example phrase a full
    octave plus, and the coupled tap was then asked to sing a 16-semitone dive
    the model wisely refused.
    """
    out = np.array(midi, dtype=np.float64)
    v = np.isfinite(out)
    if v.sum() < 3:
        return out
    idx = np.flatnonzero(v)
    vals = out[idx]
    half = window // 2
    for j, i in enumerate(idx):
        ref = float(np.median(vals[max(0, j - half): j + half + 1]))
        d = out[i] - ref
        if abs(d) > limit:
            out[i] -= 12.0 * np.round(d / 12.0)
    return out


def couple(
    target_f0: np.ndarray,
    spirit: Spirit,
    K: float,
    *,
    hop_sec: float = 0.010,
    alpha: float = 0.35,
) -> np.ndarray:
    """Return the tap's F0 (Hz, 0.0 unvoiced) for coupling strength K in [0,1]."""
    K = float(np.clip(K, 0.0, 1.0))
    tgt = repair_octave_jumps(f0_to_midi(target_f0))   # NaN where unvoiced
    n = len(tgt)
    free = free_contour(spirit, n, hop_sec)

    # Coasting target: hold the last voiced pitch through unvoiced gaps so the
    # oscillator has something to lock to instead of snapping to the centre.
    coast = np.copy(tgt)
    last = spirit.center_midi
    for i in range(n):
        if np.isfinite(coast[i]):
            last = coast[i]
        else:
            coast[i] = last

    # The follower's speed rises with the coupling, so a fully coupled tap
    # tracks the melody with no lag (heard on the real model, 2026-10-14: at a
    # fixed alpha the K=1 tap slurred each note change by ~40 ms, 0.42 st off).
    a = alpha + (1.0 - alpha) * K * K
    p = np.empty(n, dtype=np.float64)
    state = coast[0] if n else spirit.center_midi
    for i in range(n):
        state += a * (K * (coast[i] - state) + (1.0 - K) * (free[i] - state))
        p[i] = state

    if K < 1.0:
        q = _quantize_to_scale(p, spirit)
        w = 1.0 - K                               # grid fades in as coupling relaxes
        p = (1.0 - w) * p + w * q

    p[~np.isfinite(tgt)] = np.nan                 # never invent voicing
    return midi_to_f0(p)


def coupling_error_semitones(target_f0: np.ndarray, tap_f0: np.ndarray) -> float:
    """Mean |tap - target| in semitones over frames voiced in both. The measure
    the knob is supposed to move: it should rise monotonically as K falls."""
    a, b = f0_to_midi(target_f0), f0_to_midi(tap_f0)
    m = np.isfinite(a) & np.isfinite(b)
    if not np.any(m):
        return 0.0
    return float(np.mean(np.abs(a[m] - b[m])))


def render_contour(
    f0_hz: np.ndarray,
    hop_samples: int,
    sample_rate: int,
    envelope: np.ndarray | None = None,
    *,
    n_harmonics: int = 8,
    gain: float = 0.22,
) -> np.ndarray:
    """Sonify an F0 contour as a buzzy harmonic tone — the *audition* voice.

    This is not the SVC model; it is a stand-in timbre so the coupling knob can
    be heard in the sandbox, where torch does not run. Once Stage 1.5 wires the
    real model Mac-side, the same contour goes out as `target_f0` and the
    timbre arrives from the spirit's prompt wav instead.
    """
    n = len(f0_hz) * hop_samples
    idx = np.minimum(np.arange(n) // hop_samples, len(f0_hz) - 1)
    f_s = np.asarray(f0_hz, dtype=np.float64)[idx]
    voiced = (f_s > 0).astype(np.float64)
    # Smooth the sample-rate frequency track so frame steps do not click.
    k = max(1, hop_samples // 2)
    kern = np.ones(k) / k
    f_s = np.convolve(np.where(f_s > 0, f_s, np.nan_to_num(f_s)), kern, mode="same")
    voiced_s = np.convolve(voiced, kern, mode="same")

    phase = 2 * np.pi * np.cumsum(f_s) / sample_rate
    out = np.zeros(n, dtype=np.float64)
    for h in range(1, n_harmonics + 1):
        out += np.sin(h * phase) / (h ** 1.4)
    out *= voiced_s * gain

    if envelope is not None:
        env = np.interp(np.linspace(0, 1, n), np.linspace(0, 1, len(envelope)), envelope)
        out *= env / (np.max(env) + 1e-9)
    return out.astype(np.float32)


def amplitude_envelope(audio: np.ndarray, hop_samples: int) -> np.ndarray:
    """Per-frame RMS of the source — the rhythm the spirits must keep."""
    n_frames = max(1, len(audio) // hop_samples)
    frames = np.asarray(audio[: n_frames * hop_samples], dtype=np.float64).reshape(n_frames, hop_samples)
    return np.sqrt(np.mean(frames ** 2, axis=1))


# ---------------------------------------------------------------------------
# The knob as the helper uses it (RPC v0.2, 2026-10-14)
# ---------------------------------------------------------------------------

MINOR_PENTATONIC = (0, 3, 5, 7, 10)


def fit_scale_root(f0_hz: np.ndarray, scale: tuple = MINOR_PENTATONIC) -> int:
    """The pitch class (0-11) whose `scale` the phrase sits on best.

    Moved here from the Stage 4 real-model proof so the helper and the proof
    pick the same grid for a relaxed echo to fall onto.
    """
    m = f0_to_midi(f0_hz)
    m = m[np.isfinite(m)]
    if m.size == 0:
        return 9  # A, the old default
    cands = np.array(tuple(scale) + (12,), dtype=float)
    best, best_err = 0, 1e9
    for root in range(12):
        pc = (m - root) % 12.0
        err = float(np.mean(np.min(np.abs(pc[:, None] - cands[None, :]), axis=1)))
        if err < best_err:
            best, best_err = root, err
    return best


def couple_phrase(
    target_f0: np.ndarray,
    k: float,
    *,
    hop_sec: float,
    seed: int = 7,
    scale: tuple | None = None,
    drift_semitones: float = 3.0,
    vibrato_semitones: float = 0.4,
) -> tuple[np.ndarray, dict]:
    """Couple one phrase's own contour at strength k, with a spirit fitted to it.

    The spirit is centred on the phrase's median pitch and wanders on the
    scale the phrase already sits on best (minor pentatonic unless `scale` is
    given), so a relaxed echo drifts somewhere that still belongs to the song.
    Returns (tap F0 in Hz with 0.0 unvoiced, a small report).
    """
    scale = tuple(scale) if scale else MINOR_PENTATONIC
    mid = f0_to_midi(target_f0)
    voiced = np.isfinite(mid)
    if not np.any(voiced):
        return np.asarray(target_f0, np.float32), {"k": float(k), "voiced": False}
    center = float(np.nanmedian(mid))
    root_pc = fit_scale_root(target_f0, scale)
    root_midi = int(12 * np.floor((center - root_pc) / 12) + root_pc)
    spirit = Spirit(name="fitted", center_midi=center, drift_semitones=drift_semitones,
                    vibrato_semitones=vibrato_semitones, seed=int(seed), scale=scale,
                    scale_root_midi=root_midi)
    tap = couple(target_f0, spirit, k, hop_sec=hop_sec)
    return tap, {
        "k": float(np.clip(k, 0.0, 1.0)),
        "voiced": True,
        "seed": int(seed),
        "scale": list(scale),
        "scale_root_midi": root_midi,
        "center_midi": round(center, 2),
        "asked_vs_source_st": round(coupling_error_semitones(target_f0, tap), 3),
    }
