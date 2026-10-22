"""
Shimmer Cloud — the dispersion pushed until the modes come apart (2026-10-22)
============================================================================
Run with /usr/local/bin/python3 (the Homebrew python has no soundfile).

WHY THE MAY PAIRS SOUNDED CLOSE
-------------------------------
May's prism put its largest delay (4–20 ms) at Nyquist (12 kHz) and let it fall
linearly toward DC, so across the band a voice lives in (200 Hz – 4 kHz) a lens
delayed its frequencies by only 0.07–6.7 ms against each other. Every take also
scattered its lenses over 350 ms of start time. The scatter was ~50x the
dispersion, so every model sounded like the same smear.

WHAT CHANGES HERE
-----------------
1. The delay curve runs on a log-frequency axis between 80 Hz and 11 kHz, so
   each octave is spread evenly, the way the ear hears it:
       u(f)   = log(f / f_lo) / log(f_hi / f_lo), clipped to [0, 1]
       tau(f) = D * u^p           (highs late)     or  D * (1 - u)^p (highs early)
   and the phase is the integral of the delay: phi(f) = -2*pi * sum(tau * df).
2. D runs to hundreds of milliseconds, not tens.
3. The start-time scatter shrinks to 25 ms, so what you hear in each take is
   the mode itself, not the scatter shared by all of them.
4. Every take is levelled to the same loudness (RMS), peak-limited to 0.9, so a
   pair differs only in its mode.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).parent
BUNDLE = HERE.parent.parent
F_LO, F_HI = 80.0, 11000.0


def resample(x, cents):
    rate = 2.0 ** (cents / 1200.0)
    n_out = max(1, int(round(len(x) / rate)))
    pos = np.arange(n_out) * rate
    i = np.clip(pos.astype(np.int64), 0, len(x) - 2)
    fr = pos - i
    return (1 - fr) * x[i] + fr * x[i + 1]


def tau_curve(freqs, D_s, p, highs_late=True):
    u = np.clip(np.log(np.maximum(freqs, 1e-9) / F_LO) / np.log(F_HI / F_LO), 0.0, 1.0)
    return D_s * (u ** p if highs_late else (1.0 - u) ** p)


def cloud(dry, sr, *, n=600, D_ms=(0.0, 0.0), p_mean=1.0, p_spread=0.0,
          highs_late_share=1.0, pure_delay=False, cents=0.0, scatter_ms=25.0,
          pan=1.0, amp_jitter=0.3, tail_s=1.0, seed=7):
    """A stereo cloud of lenses. pure_delay=True gives each lens one constant
    delay equal to its own mean group delay over the voice band, so the pair
    'no dispersion vs prism' has the same total smear, sorted or not."""
    rng = np.random.default_rng(seed)
    Dmax = D_ms[1] / 1000.0
    out_len = len(dry) + int((scatter_ms / 1000 + Dmax + tail_s) * sr)
    out = np.zeros((out_len, 2))
    Np = 1 << int(np.ceil(np.log2(out_len + 1024)))
    freqs = np.fft.rfftfreq(Np, 1 / sr)
    df = sr / Np
    voice = (freqs >= 200) & (freqs <= 4000)
    base_fft = np.fft.rfft(dry, n=Np)
    base_fft[freqs < 40] = 0  # below 40 Hz, 600 lenses add up in phase into a DC sag
    fade = np.linspace(1, 0, int(0.06 * sr))
    for _ in range(n):
        src_fft = base_fft
        if cents > 0:
            src_fft = np.fft.rfft(resample(dry, rng.normal(0, cents)), n=Np)
            src_fft[freqs < 40] = 0
        D = rng.uniform(*D_ms) / 1000.0
        p = max(0.3, p_mean + rng.normal(0, p_spread))
        late = rng.random() < highs_late_share
        tau = tau_curve(freqs, D, p, late)
        if pure_delay:
            tau = np.full_like(tau, tau[voice].mean())
        phi = -2 * np.pi * np.cumsum(tau) * df
        phi -= phi[0]  # DC stays real: no offset left hanging in the tail
        lens = np.fft.irfft(src_fft * np.exp(1j * phi), n=Np)[:out_len]
        lens[-len(fade):] *= fade
        lens *= 1.0 - rng.uniform(0, amp_jitter)
        th = (rng.uniform(-pan, pan) + 1) * np.pi / 4
        s = int(rng.uniform(0, scatter_ms) / 1000 * sr)
        seg = lens[: out_len - s]
        out[s:, 0] += np.cos(th) * seg
        out[s:, 1] += np.sin(th) * seg
    return out


def level(x, rms=0.12, peak=0.9):
    x = x * (rms / np.sqrt(np.mean(x ** 2)))
    pk = np.max(np.abs(x))
    return x * (peak / pk) if pk > peak else x


def band_arrival(x, sr, lo, hi, win=512, hop=64):
    """Energy-weighted arrival time (s) of one band, read off a short-time
    spectrum (Hann window, 21 ms), so a band's filter ringing can't wrap
    around the file and bias it the way a whole-file filter does."""
    m = x.mean(axis=1) if x.ndim > 1 else x
    m = np.concatenate([np.zeros(win // 2), m, np.zeros(win)])
    w = np.hanning(win)
    f = np.fft.rfftfreq(win, 1 / sr)
    band = (f >= lo) & (f <= hi)
    starts = np.arange(0, len(m) - win, hop)
    e = np.array([(np.abs(np.fft.rfft(m[s:s + win] * w))[band] ** 2).sum() for s in starts])
    t = starts / sr
    return float((e * t).sum() / e.sum())


# The takes. Each pair is the May one, pushed.
STRONG = dict(D_ms=(150, 600), p_mean=1.0, p_spread=0.3)
TAKES = {
    # pair 1 — each mode alone
    "p1_droplets":   dict(cents=25.0),
    "p1_dispersion": dict(**STRONG),
    # pair 2 — same smear, sorted by frequency or not
    "p2_delay":      dict(**STRONG, pure_delay=True),
    "p2_prism":      dict(**STRONG),
    # pair 3 — pure, or with drift
    "p3_pure":       dict(**STRONG),
    "p3_drift":      dict(**STRONG, cents=15.0),
    # how hard: the same cloud at four strengths
    "h1_20ms":       dict(D_ms=(5, 20)),
    "h2_80ms":       dict(D_ms=(20, 80)),
    "h3_300ms":      dict(D_ms=(75, 300)),
    "h4_1200ms":     dict(D_ms=(300, 1200), tail_s=1.5),
    # which way the light bends
    "w_late":        dict(**STRONG),
    "w_early":       dict(**STRONG, highs_late_share=0.0),
}
SAME_AS = {"p2_prism": "p1_dispersion", "p3_pure": "p1_dispersion", "w_late": "p1_dispersion"}


def main():
    dry, sr = sf.read(str(BUNDLE / "dry.wav"))
    dry = dry.astype(np.float64)
    out_dir = HERE / "takes"
    out_dir.mkdir(exist_ok=True)
    rendered, report = {}, {}
    for name, kw in TAKES.items():
        if name in SAME_AS:
            y = rendered[SAME_AS[name]]
        else:
            y = level(cloud(dry, sr, **kw))
        rendered[name] = y
        sf.write(str(out_dir / f"{name}.wav"), y, sr, subtype="PCM_16")
    # Measure the cloud itself, not the phrase: strike each population with
    # one click and ask when its lows (100-500 Hz) and highs (3-8 kHz) land,
    # and how long it takes to deliver 90% of its energy.
    click = np.zeros(int(0.05 * sr)); click[0] = 1.0
    def shape(y):
        lo = band_arrival(y, sr, 100, 500); hi = band_arrival(y, sr, 3000, 8000)
        e = np.cumsum((y.mean(axis=1) if y.ndim > 1 else y) ** 2); e /= e[-1]
        t5, t95 = np.searchsorted(e, 0.05) / sr, np.searchsorted(e, 0.95) / sr
        return {"lows_land_ms": round(lo * 1000, 1), "highs_land_ms": round(hi * 1000, 1),
                "highs_minus_lows_ms": round((hi - lo) * 1000, 1),
                "energy_5_to_95_ms": round((t95 - t5) * 1000, 1)}
    may_lens = dict(D_ms=(4, 20))  # May's curve is linear to Nyquist; rebuilt below
    for name, kw in TAKES.items():
        if name in SAME_AS:
            continue
        kw = {k: v for k, v in kw.items() if k != "cents"}  # pitch jitter needs a phrase
        report[name] = shape(cloud(click, sr, **{**kw, "amp_jitter": 0.0, "tail_s": 0.3}))
    # May's canonical lens, exactly as lens.py built it, struck the same way
    import importlib.util, sys
    spec = importlib.util.spec_from_file_location("lens", BUNDLE / "03_dispersion_cloud" / "lens.py")
    lens = importlib.util.module_from_spec(spec); spec.loader.exec_module(lens)
    report["May 25 canonical"] = shape(lens.dispersion_cloud(click, sr, n_droplets=600,
        dispersion_max_ms=20.0, dispersion_min_ms=4.0, exponent_mean=2.0, exponent_spread=0.3,
        time_spread_ms=350.0, amp_jitter=0.0, tail_seconds=0.3))
    report["May 25, scatter removed"] = shape(lens.dispersion_cloud(click, sr, n_droplets=600,
        dispersion_max_ms=20.0, dispersion_min_ms=4.0, exponent_mean=2.0, exponent_spread=0.3,
        time_spread_ms=0.0, amp_jitter=0.0, tail_seconds=0.3))
    (HERE / "findings.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
