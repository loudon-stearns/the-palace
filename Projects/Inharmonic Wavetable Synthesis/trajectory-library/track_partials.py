#!/usr/bin/env python3
"""Real recording -> Wavetable B frames (and a matching Wavetable A).

Inharmonic Wavetable Synthesis, steward cycle 8 (2026-10-14).
The first entry of the physical trajectory library: track the partials of a
real recorded piano note, frame by frame, and write how far each one sits
from its harmonic place, in cents. Same reading convention as the entry:
X = partial number, Y = cents off harmonic, a flat line is pure harmony.

Method (a small, honest sinusoidal tracker, no SMS library):
  1. Long window just after the attack. Bootstrap the partial ladder: find
     partials 1..8 near n*f0, fit the string-stiffness law, use the fit to
     predict where the next partials sit, find them, refit, climb to 64.
        f_n = n * f0 * sqrt(1 + B n^2)    ->    (f_n/n)^2 = f0^2 + f0^2 B n^2
     so (f_n/n)^2 against n^2 is a straight line; slope/intercept = B.
  2. Then 16 analysis frames, log-spaced in time from the attack to late in
     the decay. In each, look for every partial near the global prediction,
     refine with parabolic interpolation on the log spectrum, keep its level.
  3. Cents are measured against n * f0 of the global fit (the string's
     'virtual' fundamental), so partial 1 sits at ~0 and the bend is the
     string's own. A partial that has sunk into the noise is marked lost and
     carries the fit's value; the mask says which.
  4. Per frame, refit B on the partials that are still alive.

The source audio is read in place and never copied into the palace.
Run with /usr/local/bin/python3 (numpy, scipy, soundfile, matplotlib).

  python3 track_partials.py <audio> <name> <f0_guess_hz>
"""
import json, sys, pathlib
import numpy as np
import soundfile as sf

HERE = pathlib.Path(__file__).parent
NP = 64
NFR = 16


def mono(path):
    x, sr = sf.read(path, always_2d=True)
    return x.mean(axis=1), sr


def spectrum(x, sr, t0, win):
    i0 = int(t0 * sr)
    seg = x[i0:i0 + win]
    if len(seg) < win:
        seg = np.pad(seg, (0, win - len(seg)))
    nfft = win * 8
    S = np.abs(np.fft.rfft(seg * np.hanning(win), nfft))
    return 20 * np.log10(S + 1e-12), sr / nfft


def peak_near(Sdb, df, f_pred, half_width):
    lo = max(1, int((f_pred - half_width) / df))
    hi = int((f_pred + half_width) / df)
    k = lo + int(np.argmax(Sdb[lo:hi]))
    a, b, c = Sdb[k - 1], Sdb[k], Sdb[k + 1]
    d = 0.5 * (a - c) / (a - 2 * b + c + 1e-12)          # parabolic refine
    return (k + d) * df, b - 0.25 * (a - c) * d


def fit_B(n, f, w=None):
    """Weighted line through (n^2, (f/n)^2) -> f0, B."""
    X, Y = n.astype(float) ** 2, (f / n) ** 2
    w = np.ones_like(X) if w is None else w
    A = np.vstack([np.ones_like(X), X]).T * np.sqrt(w)[:, None]
    (c0, c1), *_ = np.linalg.lstsq(A, Y * np.sqrt(w), rcond=None)
    f0 = np.sqrt(c0)
    return f0, c1 / c0


def predict(n, f0, B):
    return n * f0 * np.sqrt(1 + B * n.astype(float) ** 2)


def track(path, name, f0_guess, quiet=False):
    """Partials above ~0.45*sr (or the 64 slots) are never measured: they
    carry the fit's value with alive=0, so the table stays 64 wide."""
    x, sr = mono(path)
    onset = int(np.argmax(np.abs(x) > 0.05 * np.abs(x).max()))
    x = x[onset:]
    dur = len(x) / sr
    n_all = np.arange(1, NP + 1)
    n_max = int(min(NP, (0.45 * sr) // (f0_guess * 1.15)))   # cycle 9: treble notes
    n_meas = n_all[:n_max]

    # 1 — bootstrap the ladder on a long window just after the attack
    Sdb, df = spectrum(x, sr, 0.08, 2 ** 15)
    f0, B = f0_guess, 0.0
    got_f, got_a, got_n = [], [], []
    for n in n_meas:
        fp = predict(np.array([n]), f0, B)[0]
        if fp > 0.45 * sr:                               # stiff treble: stop below Nyquist
            break
        f, a = peak_near(Sdb, df, fp, 0.22 * f0)
        got_n.append(n); got_f.append(f); got_a.append(a)
        if n >= 6:                                       # refit as we climb
            nn, ff, aa = map(np.array, (got_n, got_f, got_a))
            ok = aa > aa.max() - 60
            f0, B = fit_B(nn[ok], ff[ok], 10 ** (aa[ok] / 20))
    nn, ff, aa = map(np.array, (got_n, got_f, got_a))
    ok = aa > aa.max() - 60
    f0, B = fit_B(nn[ok], ff[ok])
    if not quiet:
      print(f"{name}: global fit f0={f0:.3f} Hz  B={B:.3e}  ({ok.sum()} partials above -60 dB)")

    # 2 — 16 frames, log-spaced from the attack into the decay
    t_end = min(dur - 0.5, 8.0)
    times = np.geomspace(0.03, t_end, NFR)
    win = 2 ** 13 if f0 < 80 else 2 ** 12
    pred = predict(n_all, f0, B)
    n_max = int(min(n_max, (pred < 0.45 * sr).sum()))
    cents = np.zeros((NFR, NP)); level = np.zeros((NFR, NP)); alive = np.zeros((NFR, NP), bool)
    Bf = np.zeros(NFR)
    floor_db = None
    for i, t in enumerate(times):
        Sdb, df = spectrum(x, sr, t, win)
        if floor_db is None:
            floor_db = np.percentile(Sdb[: int(sr * 0.45 / df)], 20)
        fr, lv = zip(*(peak_near(Sdb, df, p, 0.18 * f0) if k < n_max else (p, -300.0)
                       for k, p in enumerate(pred)))
        fr, lv = np.array(fr), np.array(lv)
        noise = np.percentile(Sdb[: int(min(pred[n_max - 1] * 1.1, sr * 0.45) / df)], 50)
        # a partial counts only if it stands above the noise, sits near its
        # prediction, and the window can resolve it to better than ~5 cents
        # (at 55 Hz an 8192-sample window cannot pin partial 1 that finely)
        res_c = 1200 * np.log2(1 + 0.05 * (sr / win) / pred)
        al = (lv > noise + 12) & (np.abs(1200 * np.log2(fr / pred)) < 60) & (res_c < 5)
        c = 1200 * np.log2(fr / (n_all * f0))
        fallback = 1200 * np.log2(pred / (n_all * f0))
        cents[i] = np.where(al, c, fallback)
        level[i] = lv; alive[i] = al
        if al.sum() >= 6:
            _, Bf[i] = fit_B(n_all[al], fr[al], 10 ** (lv[al] / 20))
        else:
            Bf[i] = np.nan
    amp = 10 ** ((level - level[alive].max() if alive.any() else level.max()) / 20) * alive
    return dict(name=name, f0=f0, B=B, times=times, cents=cents, amp=amp,
                alive=alive, B_frame=Bf, fit_cents=1200 * np.log2(pred / (n_all * f0)),
                sr=sr, dur=dur, n_max=n_max)


def effective_bend(r):
    w = r["amp"] ** 2
    return (w * np.abs(r["cents"])).sum(1) / (w.sum(1) + 1e-12)


def save(r, source_note):
    out = {
        "format": "wtb-frames", "format_version": "1.1",
        "trajectory_name": r["name"],
        "description": ("Measured Wavetable-B trajectory: per-partial cents off n*f0, "
                        "tracked frame by frame from a real recording. X = partial, Y = cents."),
        "source": source_note,
        "physical_basis": "measured; global string-stiffness fit f_n = n f0 sqrt(1 + B n^2)",
        "f0_fit_hz": round(r["f0"], 4), "B_fit": float(f"{r['B']:.4e}"),
        "n_frames": NFR, "n_partials": NP,
        "frame_times_s": np.round(r["times"], 4).tolist(),
        "b_coefficient_per_frame": [None if np.isnan(b) else float(f"{b:.4e}") for b in r["B_frame"]],
        "frames": np.round(r["cents"], 2).tolist(),
        "alive_mask": r["alive"].astype(int).tolist(),
        "wta_measured": np.round(r["amp"], 4).tolist(),
        "fit_curve_cents": np.round(r["fit_cents"], 2).tolist(),
        "effective_bend_cents_per_frame": np.round(effective_bend(r), 2).tolist(),
        "effective_bend_note": ("amplitude-weighted mean |cents| over live partials: how bent the "
                                "sound is as heard, frame by frame, once the dying upper partials stop counting"),
    }
    p = HERE / f"{r['name']}.wtb.json"
    json.dump(out, open(p, "w"), indent=1)
    print("wrote", p.name)
    return out


if __name__ == "__main__":
    path, name, f0g = sys.argv[1], sys.argv[2], float(sys.argv[3])
    r = track(path, name, f0g)
    save(r, f"{pathlib.Path(path).name} (Ableton Live 12 Core Library, Grand Piano multisample; "
            f"read in place, not copied)")
    np.set_printoptions(precision=1, suppress=True, linewidth=140)
    print("B per frame:", r["B_frame"])
    print("alive per frame:", r["alive"].sum(1))
    print("frame 0 cents p1..16:", r["cents"][0, :16])
    print("fit cents p8,16,32,64:", r["fit_cents"][[7, 15, 31, 63]])
    print("effective bend per frame:", effective_bend(r))
