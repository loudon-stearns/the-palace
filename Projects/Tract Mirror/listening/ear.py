"""
ear.py - a better ear for Tract Mirror's listener (toward v2, "learn to speak by listening").

The first listening probe (listen.py) found that the weak link is the ear: ordinary
LPC formant picking on a 110 Hz vowel hears F1 3-18% low.  A voiced vowel is not a
smooth spectrum, it is a comb of harmonics, and autocorrelation LPC fits the comb,
so the lowest formant gets pulled toward a harmonic or swallowed by the glottal
source's own low hump.  The higher the voice, the sparser the comb and the worse it
gets, which is exactly where singing lives.

Three ears, each told nothing about which vowel it hears:

  E0  PLAIN LPC          listen.py's ear: LPC order 12 on 30 ms frames, median of the track.
  E1  ENVELOPE LPC       find f0, read the height of every harmonic, draw a line through the
                         tops, and run the same Levinson recursion on that envelope.
  E2  LATTICE EAR        fit an all-pole filter to the harmonic tops only (Itakura-Saito
                         distance, El-Jaroudi & Makhoul's "discrete all-pole" idea), with the
                         filter parametrized by its reflection coefficients k = tanh(theta).
                         So the ear is itself a lattice, the same object the instrument is
                         made of, and it can never go unstable.

Test: 12 tubes whose truth is known (the six vowels Tract Mirror sings now, and the six
refit vowels waiting in ../refit), each sung by the reference engine at four pitches
from G2 to E4.  Truth is the as-sung formants (listen.sung_formants: lip lowpass on).
Then the end-to-end check at 110 and 220 Hz: hear, fit a tube, and measure what that
tube sings against the truth.

Run with the palace-vital venv:   ~/.venvs/palace-vital/bin/python ear.py
Writes ear-results.json, ear-errors.png and ear-singback.wav (local only) in this folder.
"""

import json
import os
import sys

import numpy as np
from scipy.optimize import minimize
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import listen as L                 # noqa: E402  (also puts ../reference on the path)

kl, fv, mr = L.kl, L.fv, L.mr
FS = L.FS
VOWELS = L.VOWELS
PITCHES = [98.0, 147.0, 220.0, 330.0]      # G2, D3, A3, E4
FS2, ORDER, PRE = 11025, 12, 0.94


# ---------------------------------------------------------------------------
# Harmonics: f0, then the height of every harmonic below FS2/2
# ---------------------------------------------------------------------------

def find_f0(y, fs, lo=70.0, hi=500.0):
    """Autocorrelation peak of the steady part, refined by a parabola."""
    x = y[: int(0.2 * fs)] - np.mean(y[: int(0.2 * fs)])
    r = np.correlate(x, x, "full")[len(x) - 1:]
    a, b = int(fs / hi), int(fs / lo)
    i = a + int(np.argmax(r[a:b]))
    if 0 < i < len(r) - 1:
        d = (r[i - 1] - r[i + 1]) / (2 * (r[i - 1] - 2 * r[i] + r[i + 1]))
        i = i + d
    return fs / i


def harmonics(y, fs):
    """f0, harmonic frequencies, and harmonic powers (pre-emphasized as E0 is)."""
    f0 = find_f0(y, fs)
    w = np.hanning(len(y))
    nfft = 1 << int(np.ceil(np.log2(len(y) * 4)))
    S = np.abs(np.fft.rfft(y * w, nfft)) ** 2
    fr = np.fft.rfftfreq(nfft, 1 / fs)
    hf, hp = [], []
    k = 1
    while k * f0 < FS2 / 2 - f0 / 2:
        band = (fr > (k - 0.3) * f0) & (fr < (k + 0.3) * f0)
        j = np.argmax(S[band])
        hf.append(fr[band][j])
        hp.append(S[band][j])
        k += 1
    hf, hp = np.array(hf), np.array(hp)
    om = 2 * np.pi * hf / FS2
    hp = hp * np.abs(1 - PRE * np.exp(-1j * om)) ** 2      # same pre-emphasis as E0
    return f0, hf, hp / hp.max()


def roots_to_formants(a, fs, n=3):
    roots = np.roots(np.concatenate([[1.0], -a]))
    roots = roots[np.imag(roots) > 0]
    f = np.angle(roots) * fs / (2 * np.pi)
    bw = -np.log(np.abs(roots)) * fs / np.pi
    f = np.sort(f[(f > 150) & (bw < 500)])
    f = list(f[:n]) + [np.nan] * max(0, n - len(f))
    return np.array(f)


# ---------------------------------------------------------------------------
# The ears
# ---------------------------------------------------------------------------

def ear_plain(y, fs):
    return L.estimate_formants(y, fs)


def envelope_autocorr(hf, hp, n=4096):
    """Log-linear line through the harmonic tops on a dense grid, to autocorrelation."""
    grid = np.linspace(0, FS2 / 2, n)
    env = np.exp(np.interp(grid, hf, np.log(hp + 1e-12)))
    return np.fft.irfft(env)[: ORDER + 1]


def ear_envelope(y, fs):
    f0, hf, hp = harmonics(y, fs)
    a, _ = kl.levinson_durbin(envelope_autocorr(hf, hp), ORDER)
    return roots_to_formants(a, FS2), a


def k_to_a(k):
    """Reflection coefficients to predictor coefficients (step-up), in the
    convention levinson_durbin returns: x[n] ~ sum a_i x[n-i]."""
    a = np.zeros(0)
    for ki in k:
        a = np.concatenate([a - ki * a[::-1], [ki]])
    return a


def a_to_k(a):
    a = np.array(a, float)
    ks = []
    for m in range(len(a), 0, -1):
        km = a[-1]
        ks.append(km)
        if m > 1:
            a = (a[:-1] + km * a[:-1][::-1]) / (1 - km * km)
    return np.array(ks[::-1])


def is_distance(theta, om, hp):
    k = np.tanh(theta)
    a = k_to_a(k)
    A = 1 - np.exp(-1j * np.outer(om, np.arange(1, len(a) + 1))) @ a
    q = hp * np.abs(A) ** 2                 # P / model, before gain
    g = q.mean()                            # IS-optimal gain
    r = q / g
    return np.mean(r - np.log(r) - 1)


def ear_lattice(y, fs):
    f0, hf, hp = harmonics(y, fs)
    om = 2 * np.pi * hf / FS2
    _, a0 = ear_envelope(y, fs)
    k0 = np.clip(a_to_k(a0), -0.98, 0.98)
    # order no higher than the comb can hold: two harmonics per pole pair at most
    p = int(min(ORDER, max(6, len(hf) - 2)))
    th0 = np.arctanh(k0[:p] if p <= len(k0) else np.r_[k0, np.zeros(p - len(k0))])
    res = minimize(is_distance, th0, args=(om, hp), method="L-BFGS-B",
                   options={"maxiter": 2000})
    a = k_to_a(np.tanh(res.x))
    return roots_to_formants(a, FS2), a


EARS = {"plain LPC": ear_plain,
        "envelope LPC": lambda y, fs: ear_envelope(y, fs)[0],
        "lattice ear": lambda y, fs: ear_lattice(y, fs)[0]}


# ---------------------------------------------------------------------------
# The test
# ---------------------------------------------------------------------------

def load_tubes():
    tubes = {}
    for tag, path in [("now", os.path.join(HERE, "..", "reference", "vowels.json")),
                      ("refit", os.path.join(HERE, "..", "refit", "vowels-refit.json"))]:
        vj = json.load(open(path))
        for v in VOWELS:
            tubes[f"{v}·{tag}"] = np.array(vj["vowels"][v]["area_cm2"], float)
    return tubes


def sing(area, f0, dur=1.2):
    y = mr.render_sustained_vowel(np.clip(area, fv.A_MIN, fv.A_MAX), f0=f0, dur=dur, fs=FS)
    return L.steady_part(mr.normalize(y), FS)


def main():
    tubes = load_tubes()
    truth = {name: L.sung_formants(a) for name, a in tubes.items()}
    rows, errs = [], {e: {p: [] for p in PITCHES} for e in EARS}
    audio = {}
    for name, area in tubes.items():
        for f0 in PITCHES:
            y = sing(area, f0)
            audio[(name, f0)] = y
            row = {"tube": name, "f0": f0, "truth": np.round(truth[name]).tolist()}
            for e, fn in EARS.items():
                f = fn(y, FS)
                pc = L.pct(f, truth[name])
                row[e] = {"heard": np.round(f).tolist(), "err_pct": pc}
                errs[e][f0].append(pc)
            rows.append(row)
            print(name, f0, {e: row[e]["err_pct"] for e in EARS}, flush=True)

    summary = {}
    for e in EARS:
        summary[e] = {}
        for f0 in PITCHES:
            m = np.array(errs[e][f0], float)
            bad = np.isnan(m).any(axis=1)
            summary[e][str(int(f0))] = {
                "mean_abs_err_pct_F1_F2_F3": np.round(np.nanmean(np.abs(m), axis=0), 1).tolist(),
                "worst_abs_F1_pct": round(float(np.nanmax(np.abs(m[:, 0]))), 1),
                "missed_a_formant": int(bad.sum())}
    print(json.dumps(summary, indent=1))

    # end to end: hear, fit a tube, sing it; how far is that from the truth?
    e2e = {}
    for f0 in [110.0, 220.0]:
        for name in [f"{v}·now" for v in VOWELS]:
            y = sing(tubes[name], f0)
            out = {}
            for e in ["plain LPC", "lattice ear"]:
                heard = EARS[e](y, FS)
                if np.isnan(heard).any():
                    out[e] = None
                    continue
                fit = L.fit_area_to_formants(heard, restarts=1, seed=VOWELS.index(name.split("·")[0]))
                out[e] = {"heard": np.round(heard).tolist(),
                          "sung_back": np.round(L.sung_formants(fit)).tolist(),
                          "sung_back_err_pct": L.pct(L.sung_formants(fit), truth[name]),
                          "area": fit.tolist()}
            e2e[f"{name}@{int(f0)}"] = out
            print("e2e", name, f0, {k: (v or {}).get("sung_back_err_pct") for k, v in out.items()}, flush=True)

    json.dump({"summary": summary, "rows": rows,
               "end_to_end": {k: {e: ({kk: vv for kk, vv in d.items() if kk != "area"} if d else None)
                                  for e, d in v.items()} for k, v in e2e.items()}},
              open(os.path.join(HERE, "ear-results.json"), "w"), indent=1)
    singback(tubes, e2e)
    plot(summary, rows)


def singback(tubes, e2e):
    """At 220 Hz: the vowel it heard, what plain LPC sings back, what the lattice ear sings back."""
    gap = np.zeros(int(0.3 * FS))
    tour = []
    for v in VOWELS:
        d = e2e[f"{v}·now@220"]
        tour += [mr.fade(mr.normalize(mr.render_sustained_vowel(tubes[f"{v}·now"], f0=220.0, dur=1.1, fs=FS))), gap]
        for e in ["plain LPC", "lattice ear"]:
            if d[e]:
                a = np.clip(np.array(d[e]["area"]), fv.A_MIN, fv.A_MAX)
                tour += [mr.fade(mr.normalize(mr.render_sustained_vowel(a, f0=220.0, dur=1.1, fs=FS))), gap]
            else:
                tour += [np.zeros(int(1.1 * FS)), gap]
        tour += [gap, gap]
    mr.write_wav(os.path.join(HERE, "ear-singback.wav"), np.concatenate(tour))


def plot(summary, rows):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    bg, ink, dim = "#15171a", "#e9e4d8", "#8a8679"
    cols = {"plain LPC": "#8a8679", "envelope LPC": "#5fb3b3", "lattice ear": "#e8a33d"}
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.8), facecolor=bg, sharey=True)
    for i, (ax, fn) in enumerate(zip(axes, ["F1", "F2", "F3"])):
        ax.set_facecolor(bg)
        for s in ax.spines.values():
            s.set_color(dim)
        ax.tick_params(colors=dim)
        for j, e in enumerate(EARS):
            xs, ys = [], []
            for r in rows:
                v = r[e]["err_pct"][i]
                xs.append(PITCHES.index(r["f0"]) + (j - 1) * 0.22 + np.random.default_rng(len(xs)).uniform(-0.06, 0.06))
                ys.append(v if np.isfinite(v) else np.nan)
            ax.scatter(xs, ys, s=14, color=cols[e], alpha=0.75, label=e if i == 0 else None)
            ax.plot(range(4), [summary[e][str(int(p))]["mean_abs_err_pct_F1_F2_F3"][i] for p in PITCHES],
                    color=cols[e], lw=1.2, ls=":")
        ax.axhline(0, color=dim, lw=0.6)
        ax.set_xticks(range(4), ["G2 98", "D3 147", "A3 220", "E4 330"])
        ax.set_title(f"{fn}: heard minus as-sung truth (%)", color=ink)
        ax.set_ylim(-35, 35)
    fig.legend(loc="lower center", ncol=3, frameon=False, labelcolor=ink)
    fig.suptitle("Tract Mirror's three ears on 12 tubes of known shape, sung at four pitches"
                 "   (dots = one vowel; dotted line = mean absolute error)", color=ink, fontsize=12)
    fig.tight_layout(rect=(0, 0.07, 1, 0.94))
    fig.savefig(os.path.join(HERE, "ear-errors.png"), dpi=110, facecolor=bg)


if __name__ == "__main__":
    main()
