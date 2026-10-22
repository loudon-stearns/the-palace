"""
Shimmer Cloud — an interval, then a cloud (2026-10-22, cycle 2)
===============================================================
Run with /usr/local/bin/python3 (it has numpy, scipy, soundfile; no librosa).

WHAT LOUDON ASKED FOR
---------------------
At the revival he heard May's feedback lens stack octave on octave and asked for
it rebuilt his way: one jump at the door — an octave or another interval — then
only subtle shifts inside the loop, so the cloud disperses around an established
interval instead of climbing.

THE LENS
--------
    s0      = shift(dry, interval)                    # the one jump, at the door
    for k in 1..G:
        wet += g^(k-1) · place(cloud_LR(s_{k-1}), k·Δ)  # this pass, heard
        s_k  = lowpass(drift(cloud_mono(s_{k-1}), ±c cents))  # fed back, no new jump

The cloud is the pushed prism from render_pushed.py (log-per-octave delay,
150–600 ms, the MIDDLE strength cycle 1 leaned on). With no pitch jitter, a cloud of
N lenses is linear and time-invariant, so the whole population folds into ONE
transfer function per channel — Σ gain·pan·e^{jφ_i(f)}·e^{-j2πf·start_i} —
and a 600-lens cloud costs one FFT multiply per pass. Each pass draws a fresh
cloud (new seed), so the dispersion accumulates: every trip round the loop
spreads the interval wider in time, and the tail diffuses as it decays.

The pitch shifter is a plain phase vocoder (stretch by the ratio, then resample
back), written here because this python has no librosa.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import scipy.signal as sps
import soundfile as sf

HERE = Path(__file__).parent
BUNDLE = HERE.parent.parent
F_LO, F_HI = 80.0, 11000.0
MIDDLE = (150.0, 600.0)


# ---------------------------------------------------------------- pitch
def stretch(x, rate, n_fft=1024, hop=256):
    """Phase-vocoder time stretch; rate > 1 shortens."""
    w = np.hanning(n_fft)
    frames = np.array([np.fft.rfft(w * x[i:i + n_fft]) for i in range(0, len(x) - n_fft, hop)])
    steps = np.arange(0, len(frames) - 1, rate)
    omega = 2 * np.pi * hop * np.arange(n_fft // 2 + 1) / n_fft
    phase = np.angle(frames[0])
    out = np.zeros(len(steps) * hop + n_fft)
    for j, t in enumerate(steps):
        i = int(t); fr = t - i
        mag = (1 - fr) * np.abs(frames[i]) + fr * np.abs(frames[i + 1])
        out[j * hop:j * hop + n_fft] += w * np.fft.irfft(mag * np.exp(1j * phase), n=n_fft)
        dphi = np.angle(frames[i + 1]) - np.angle(frames[i]) - omega
        dphi -= 2 * np.pi * np.round(dphi / (2 * np.pi))
        phase += omega + dphi
    return out / (np.sum(w ** 2) / hop)


def resample(x, rate):
    n_out = max(2, int(round(len(x) / rate)))
    pos = np.arange(n_out) * rate
    i = np.clip(pos.astype(np.int64), 0, len(x) - 2)
    fr = pos - i
    return (1 - fr) * x[i] + fr * x[i + 1]


def shift(x, semitones):
    r = 2.0 ** (semitones / 12.0)
    y = resample(stretch(x, 1.0 / r), r)[: len(x)]
    return np.pad(y, (0, len(x) - len(y)))


# ---------------------------------------------------------------- cloud
def tau_curve(freqs, D_s, p, highs_late=True):
    u = np.clip(np.log(np.maximum(freqs, 1e-9) / F_LO) / np.log(F_HI / F_LO), 0.0, 1.0)
    return D_s * (u ** p if highs_late else (1.0 - u) ** p)


def cloud_tf(Np, sr, rng, *, n=600, D_ms=MIDDLE, p_mean=1.0, p_spread=0.3,
             highs_late_share=1.0, scatter_ms=25.0, pan=1.0, amp_jitter=0.3):
    """The whole cloud as one transfer function per channel (L, R, mono)."""
    freqs = np.fft.rfftfreq(Np, 1 / sr); df = sr / Np
    H = np.zeros((3, len(freqs)), complex)
    for _ in range(n):
        D = rng.uniform(*D_ms) / 1000.0
        p = max(0.3, p_mean + rng.normal(0, p_spread))
        tau = tau_curve(freqs, D, p, rng.random() < highs_late_share)
        tau = tau + rng.uniform(0, scatter_ms) / 1000.0
        phi = -2 * np.pi * np.cumsum(tau) * df
        phi -= phi[0]
        a = 1.0 - rng.uniform(0, amp_jitter)
        th = (rng.uniform(-pan, pan) + 1) * np.pi / 4
        e = a * np.exp(1j * phi)
        H[0] += np.cos(th) * e; H[1] += np.sin(th) * e; H[2] += e
    H[:, freqs < 40] = 0
    # Flatten each pass to unity gain, smoothed over a third of an octave. Below
    # 80 Hz the lenses barely disperse, so they add up in phase (~sqrt(n) louder);
    # in a loop that rumble multiplies every pass. Found by the tone test: before
    # this, a fifth up landed 27% of its energy near 60 Hz.
    mag = np.abs(H[2]); sm = np.empty_like(mag)
    c = np.concatenate([[0.0], np.cumsum(mag ** 2)])
    k = np.arange(len(mag)); lo = (k / 2 ** (1 / 6)).astype(int); hi = np.maximum(lo + 1, (k * 2 ** (1 / 6)).astype(int) + 1)
    hi = np.minimum(hi, len(mag))
    sm = np.sqrt((c[hi] - c[lo]) / (hi - lo))
    return H / np.maximum(sm, 1e-9)


def lowpass(x, sr, cutoff):
    return sps.sosfilt(sps.butter(2, cutoff, fs=sr, output="sos"), x)


def interval_lens(dry, sr, *, interval=12.0, passes=8, gap_ms=140.0, g=0.72,
                  drift_cents=6.0, lp=7000.0, cloud=True, D_ms=MIDDLE,
                  highs_late_share=1.0, tail_s=4.0, seed=11):
    rng = np.random.default_rng(seed)
    L = len(dry) + int((tail_s + passes * gap_ms / 1000 + D_ms[1] / 1000 * 2) * sr)
    Np = 1 << int(np.ceil(np.log2(L)))
    wet = np.zeros((L, 2))
    s0 = shift(np.concatenate([dry, np.zeros(2048)]), interval) if interval else dry
    s = np.zeros(Np); s[:len(s0)] = s0
    gap = int(gap_ms / 1000 * sr)
    for k in range(1, passes + 1):
        S = np.fft.rfft(s)
        if cloud:
            H = cloud_tf(Np, sr, rng, D_ms=D_ms, highs_late_share=highs_late_share)
        else:  # the same loop with no prism: one plain centred delay per pass
            H = np.ones((3, len(S)), complex); H[:2] *= np.sqrt(0.5)
        heard = [np.fft.irfft(S * H[c], n=Np) for c in (0, 1)]
        off = k * gap
        for c in (0, 1):
            wet[off:, c] += g ** (k - 1) * heard[c][: L - off]
        nxt = np.fft.irfft(S * H[2], n=Np)
        nxt = resample(nxt, 2.0 ** (rng.normal(0, drift_cents) / 1200.0))  # subtle, no new jump
        nxt = lowpass(nxt, sr, lp)
        s = np.zeros(Np); m = min(Np, len(nxt)); s[:m] = nxt[:m]
    return wet


def mix(dry, wet, sr, wet_db=-3.0, rms=0.12, peak=0.9):
    """Dry in the centre plus the wet, the way a reverb is heard; levelled alike."""
    out = wet * 0
    out[:len(dry), 0] += dry * np.sqrt(0.5); out[:len(dry), 1] += dry * np.sqrt(0.5)
    w = wet * (np.sqrt(np.mean(dry ** 2)) / (np.sqrt(np.mean(wet ** 2)) + 1e-12)) * 10 ** (wet_db / 20)
    out = out + w
    out = out[: np.max(np.nonzero(np.abs(out).max(axis=1) > 1e-4)) + 1]
    out *= rms / np.sqrt(np.mean(out ** 2))
    pk = np.max(np.abs(out))
    return out * (peak / pk) if pk > peak else out


# ---------------------------------------------------------------- measure
def tone_test(lens_fn, sr, f0=220.0, dur=0.6):
    """Strike the lens with one tone and read where its wet energy lands, the way
    a click reads a cloud's timing (tuning item 1). Returns the share of wet energy
    within ±50 cents of each interval above or below the tone, strongest first.
    One jump shows one dominant interval; a stack shows several octaves."""
    t = np.arange(int(dur * sr)) / sr
    tone = np.sin(2 * np.pi * f0 * t) * np.hanning(len(t))
    wet = lens_fn(tone)
    m = wet.mean(axis=1) if wet.ndim > 1 else wet
    X = np.abs(np.fft.rfft(m)) ** 2; f = np.fft.rfftfreq(len(m), 1 / sr)
    total = X[(f > 40) & (f < 10000)].sum()
    shares = {}
    for st in range(-24, 37):
        fc = f0 * 2 ** (st / 12)
        b = (f > fc * 2 ** (-0.5 / 12)) & (f < fc * 2 ** (0.5 / 12))
        shares[st] = float(X[b].sum() / total)
    top = sorted(shares.items(), key=lambda kv: -kv[1])[:3]
    return [[st, round(sh * 100)] for st, sh in top]


def tail_to_minus_30(x, sr, dry_len):
    """Seconds after the dry ends until the wet falls 30 dB below its peak (50 ms RMS)."""
    m = x.mean(axis=1) if x.ndim > 1 else x
    hop = int(0.05 * sr)
    e = np.array([np.sqrt(np.mean(m[i:i + hop] ** 2)) for i in range(0, len(m) - hop, hop)])
    db = 20 * np.log10(e / e.max() + 1e-12)
    above = np.nonzero(db > -30)[0]
    return round(max(0.0, (above[-1] + 1) * hop / sr - dry_len / sr), 2)


TAKES = {
    "fifth":        dict(interval=7.0),
    "octave":       dict(interval=12.0),
    "fourth":       dict(interval=5.0),
    "octave_below": dict(interval=-12.0),
    "twelfth":      dict(interval=19.0),
    "fifth_bare":   dict(interval=7.0, cloud=False),      # same jump, no prism in the loop
    "fifth_early":  dict(interval=7.0, highs_late_share=0.0),
    "fifth_long":   dict(interval=7.0, passes=14, gap_ms=180.0, g=0.84, tail_s=8.0),
}


def main():
    dry, sr = sf.read(str(BUNDLE / "dry.wav")); dry = dry.astype(np.float64)
    (HERE / "takes").mkdir(exist_ok=True)
    report = {}
    for name, kw in TAKES.items():
        wet = interval_lens(dry, sr, **kw)
        y = mix(dry, wet, sr)
        sf.write(str(HERE / "takes" / f"{name}.wav"), y, sr, subtype="PCM_16")
        report[name] = {"interval_st": kw["interval"],
                        "tone_lands_st_pct": tone_test(lambda x: interval_lens(x, sr, **{**kw, "tail_s": 2.0}), sr),
                        "tail_s_to_-30dB": tail_to_minus_30(y, sr, len(dry))}
        print(name, report[name], flush=True)
    # May's lens, run as it was written, with this file's shifter standing in for
    # librosa's (dry_mix=0 so only its wet is struck)
    import importlib.util, sys, types
    fake = types.ModuleType("librosa"); fake.effects = types.SimpleNamespace(
        pitch_shift=lambda y, sr, n_steps, res_type=None: shift(np.asarray(y, float), n_steps))
    sys.modules["librosa"] = fake
    spec = importlib.util.spec_from_file_location("may_lens", BUNDLE / "01_feedback_lens" / "lens.py")
    may_lens = importlib.util.module_from_spec(spec); spec.loader.exec_module(may_lens)
    may, _ = sf.read(str(BUNDLE / "01_feedback_lens" / "wet.wav"))
    report["may_octave_stack"] = {"interval_st": "12 per pass, 6 passes",
                                  "tone_lands_st_pct": tone_test(lambda x: may_lens.moving_lens(x, sr, dry_mix=0.0), sr),
                                  "tail_s_to_-30dB": tail_to_minus_30(may, sr, len(dry))}
    print("may", report["may_octave_stack"])
    (HERE / "findings.json").write_text(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
