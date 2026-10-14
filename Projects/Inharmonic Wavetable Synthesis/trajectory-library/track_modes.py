#!/usr/bin/env python3
"""Struck and rubbed objects -> Wavetable B frames, by filing modes in rank order.

Inharmonic Wavetable Synthesis, steward cycle 9 (2026-10-14).
The piano tracker (track_partials.py) leans on a harmonic ladder: partial n
lives near n*f0, bent by string stiffness. A bell, a bar or a bowl has no
ladder -- it has modes, wherever its shape puts them. This answers the entry's
open question ("how do you define harmonic deviation for a sound with no
clear fundamental?") with one explicit filing rule:

    RANK FILING: the k-th mode, counted up from the lowest strong one,
    lives in slot k.  Its bend is how far it sits from where the k-th
    harmonic of the lowest mode would be:   cents_k = 1200 log2(f_k / (k f_1))

Why rank and not 'nearest harmonic': rank filing is what lets the trajectory
travel. Put the bell's bend on an organ's loudness wall and every organ
partial lands on a bell mode -- the entry's 'alien bell choir'. The other
filing (each mode into the harmonic slot it is nearest) keeps the bend small
and lets the loudness wall carry the gaps; render_library.py plays both for
the vibraphone so the ear can choose.

Slots above the last measured mode are masked (alive = 0): the material has
no mode there, and the renders silence them rather than invent one.

Method: two long windows (just after the strike, and 0.4 s on) pick the modes:
peaks that stand 40 dB proud and are still ringing; then 16 log-spaced frames track each mode's frequency and
level near where it was found. Source audio is read in place, never copied.
Run with /usr/local/bin/python3.

  python3 track_modes.py           # tracks the four Core Library sources below
"""
import json, pathlib
import numpy as np
import soundfile as sf
from scipy.signal import find_peaks
from scipy.signal.windows import blackmanharris

HERE = pathlib.Path(__file__).parent
CORE = pathlib.Path("/Applications/Ableton Live 12 Suite.app/Contents/App-Resources/Core Library/Samples")
NP, NFR, MAXMODES = 64, 16, 24

SOURCES = {   # name: (path under Core Library/Samples, what it is)
    "bell-brooklyn-C6": ("One Shots/Instrument/Mallets/Bell Brooklyn C5.aif", "small struck bell"),
    "vibraphone-C4": ("One Shots/Instrument/Mallets/Vibraphone C3.aif", "tuned aluminium bar, resonator"),
    "marimba-C3": ("One Shots/Instrument/Mallets/Marimba Maple C2.aif", "tuned wooden bar"),
    "singing-bowl-D4": ("Loops/Texture/Singing Bowl D.aif", "singing bowl, struck and ringing"),
}


def mono(path):
    x, sr = sf.read(path, always_2d=True)
    x = x.mean(axis=1)
    onset = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max()))
    return x[onset:], sr


def spec(x, sr, t0, win, pad=4):
    i0 = int(t0 * sr)
    seg = x[i0:i0 + win]
    seg = np.pad(seg, (0, win - len(seg)))
    S = np.abs(np.fft.rfft(seg * blackmanharris(win), win * pad))   # -92 dB sidelobes: no ghost modes
    return 20 * np.log10(S + 1e-12), sr / (win * pad)


def refine(S, k):
    a, b, c = S[k - 1], S[k], S[k + 1]
    d = 0.5 * (a - c) / (a - 2 * b + c + 1e-12)
    return k + d, b - 0.25 * (a - c) * d


def pick_modes(x, sr):
    """A mode is a peak that stands far out of its neighbourhood just after the
    strike (prominence >= 40 dB under a -92 dB-sidelobe window) AND is still
    there, in the same place, 0.4 s later. Strike noise and rattle fail one
    test or the other."""
    win = 2 ** int(np.log2(min(2 ** 15, len(x) - int(0.45 * sr) - 1)))
    found = []
    for t0, prom in ((0.05, 40), (0.4, 20)):
        S, df = spec(x, sr, t0, win)
        pk, _ = find_peaks(S, prominence=prom, height=S.max() - 50, distance=max(1, int(8 / df)))
        pk = pk[(pk * df > 40) & (pk * df < 0.45 * sr)]
        found.append((np.array([refine(S, k)[0] * df for k in pk]), S[pk] - S.max()))
    (f0s, l0s), (f1s, _) = found
    ring = np.array([np.any(np.abs(f1s - f) < max(3.0, 0.01 * f)) for f in f0s], bool)
    f, l = f0s[ring], l0s[ring]
    strongest = f[np.argmax(l)]
    keep = (f >= strongest * 0.9) | (l > -20)            # drop weak sub-modes (rumble, resonator)
    f, l = f[keep], l[keep]
    return np.sort(f[np.argsort(-l)[:MAXMODES]])


def track(name):
    rel, what = SOURCES[name]
    x, sr = mono(CORE / rel)
    dur = len(x) / sr
    modes = pick_modes(x, sr)
    K = len(modes)
    f1 = modes[0]
    win = 2 ** 14 if dur > 3 else 2 ** 13
    t_end = max(0.2, min(dur - win / sr - 0.05, 8.0))
    times = np.geomspace(0.03, t_end, NFR)
    gaps = np.diff(modes)
    hw = np.minimum(np.r_[gaps, np.inf], np.r_[np.inf, gaps]) * 0.45
    hw = np.minimum(hw, modes * 0.02)
    freq = np.tile(modes, (NFR, 1)); lev = np.full((NFR, K), -300.0); alive = np.zeros((NFR, K), bool)
    for i, t in enumerate(times):
        S, df = spec(x, sr, t, win)
        noise = np.percentile(S[int(40 / df): int(min(modes[-1] * 1.2, 0.45 * sr) / df)], 50)
        for m in range(K):
            lo, hi = int((modes[m] - hw[m]) / df), int((modes[m] + hw[m]) / df) + 1
            k = lo + int(np.argmax(S[lo:hi]))
            kk, l = refine(S, k)
            if l > noise + 12:
                freq[i, m], lev[i, m], alive[i, m] = kk * df, l, True
    slot = np.arange(1, K + 1)
    cents_modes = 1200 * np.log2(freq / (slot[None, :] * f1))
    # 64-slot tables: modes fill slots 1..K, everything above is masked
    cents = np.zeros((NFR, NP)); amp = np.zeros((NFR, NP)); mask = np.zeros((NFR, NP), bool)
    cents[:, :K] = cents_modes
    cents[:, K:] = cents_modes[:, -1:]                   # hold the last bend (silenced anyway)
    top = lev[alive].max()
    amp[:, :K] = np.where(alive, 10 ** ((lev - top) / 20), 0.0)
    mask[:, :K] = alive
    # the other filing: each mode into its nearest harmonic slot of f1
    near = np.clip(np.round(modes / f1).astype(int), 1, NP)
    return dict(name=name, what=what, rel=rel, sr=sr, dur=dur, f1=f1, modes=modes, times=times,
                cents=cents, amp=amp, mask=mask, K=K, freq=freq, alive_modes=alive,
                nearest_slot=near)


def save(r):
    out = {
        "format": "wtb-frames", "format_version": "1.2",
        "trajectory_name": r["name"],
        "description": ("Measured Wavetable-B trajectory of a modal object, RANK FILING: the k-th mode "
                        "lives in slot k; Y = cents off k * f1 (f1 = lowest strong mode). Slots above "
                        "the last mode are masked: the material has no mode there."),
        "source": f"{pathlib.Path(r['rel']).name} (Ableton Live 12 Core Library; read in place, not copied) -- {r['what']}",
        "filing": "rank",
        "f1_hz": round(float(r["f1"]), 3),
        "n_modes": int(r["K"]),
        "mode_hz": np.round(r["modes"], 2).tolist(),
        "mode_ratios": np.round(r["modes"] / r["f1"], 4).tolist(),
        "nearest_harmonic_slot": r["nearest_slot"].tolist(),
        "n_frames": NFR, "n_partials": NP,
        "frame_times_s": np.round(r["times"], 4).tolist(),
        "frames": np.round(r["cents"], 2).tolist(),
        "alive_mask": r["mask"].astype(int).tolist(),
        "wta_measured": np.round(r["amp"], 4).tolist(),
    }
    json.dump(out, open(HERE / f"{r['name']}.wtb.json", "w"), indent=1)
    return out


if __name__ == "__main__":
    np.set_printoptions(precision=3, suppress=True, linewidth=150)
    for name in SOURCES:
        r = track(name)
        save(r)
        drift = r["freq"][-1] / r["freq"][0]
        alive_both = r["alive_modes"][0] & r["alive_modes"][-1]
        print(f"{name}: f1={r['f1']:.2f} Hz, {r['K']} modes, dur {r['dur']:.1f}s")
        print("   ratios:", np.round(r["modes"] / r["f1"], 3))
        print("   alive per frame:", r["alive_modes"].sum(1))
        print("   max mode drift first->last frame (cents):",
              np.round(np.abs(1200 * np.log2(drift[alive_both])).max() if alive_both.any() else np.nan, 2))
