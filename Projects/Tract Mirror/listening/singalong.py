"""
singalong.py - hear a vowel by singing along with it.

ear.py tried to fix the listener's ear with better formant pickers (envelope LPC, a
lattice fitted to the harmonic tops).  Both did worse than plain LPC.  The reason
turned out to be upstream of any picker: the tube's own F1 peak sits right on its
pole (within 1%), so the low bias comes from the glottal source.  The pulse's
spectrum is not flat after pre-emphasis, and it drags the apparent F1 down.  No
picker that ignores the source can undo that.

So this ear does not pick formants at all.  It sings along.  For a candidate tube it
computes, exactly, the harmonic spectrum Tract Mirror itself would sing at the heard
pitch: Rosenberg pulse at that period, times the tube's as-sung transfer function
(lip lowpass on, from the state matrix), times the lip radiation.  Then it reshapes
the tube until its harmonics match the heard harmonics in level, up to one overall
gain.  The source is part of the model, so its bias cancels instead of leaking in.
The listener is still not told the vowel: it starts from the uniform tube and every
mouth sketch it knows, and keeps the closest.

Two variants:
  SING-ALONG        assumes the singer's source is Tract Mirror's own pulse.
  SING-ALONG + TILT also fits a free spectral slope, for a voice whose source is not
                    Tract Mirror's (Daniel, Samantha, and later, you).

Run:  ~/.venvs/palace-vital/bin/python singalong.py
Writes singalong-results.json, singalong-errors.png, singalong-replay.wav (local only).
"""

import json
import os
import sys
import time

import numpy as np
from scipy.optimize import minimize
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import listen as L                  # noqa: E402
import ear as E                     # noqa: E402

kl, fv, mr = L.kl, L.fv, L.mr
FS, N, VOWELS = L.FS, L.N, L.VOWELS
FMAX = 4500.0                       # harmonics used: up to here (F1-F3 live below)
OQ, TENSION = 0.6, 0.55             # render_sustained_vowel's source


# ---------------------------------------------------------------------------
# What is heard: the level of every harmonic, no pre-emphasis
# ---------------------------------------------------------------------------

def heard_harmonics(y, fs):
    f0 = E.find_f0(y, fs)
    w = np.hanning(len(y))
    nfft = 1 << int(np.ceil(np.log2(len(y) * 4)))
    S = np.abs(np.fft.rfft(y * w, nfft))
    fr = np.fft.rfftfreq(nfft, 1 / fs)
    hf, hl = [], []
    k = 1
    while k * f0 < FMAX:
        band = (fr > (k - 0.3) * f0) & (fr < (k + 0.3) * f0)
        hf.append(k * f0)
        # band energy, not peak height: vibrato smears a high harmonic's peak
        # lower and lower, but leaves its energy where it was
        hl.append(10 * np.log10(np.sum(S[band] ** 2) + 1e-12))
        k += 1
    return f0, np.array(hf), np.array(hl)


# ---------------------------------------------------------------------------
# What Tract Mirror would sing: exact harmonic levels for a tube at f0
# ---------------------------------------------------------------------------

def sung_state(area_cp, lp=L.LIP_LP):
    """As-sung state matrix (listen.sung_formants), with input g and output c."""
    A = kl.resample_area(np.clip(area_cp, fv.A_MIN, fv.A_MAX), N)
    M0 = kl.tract_state_matrix(A)
    M = np.zeros((2 * N + 1, 2 * N + 1))
    M[:2 * N, :2 * N] = M0
    r_lip = M0[2 * N - 1, N - 1]
    M[2 * N - 1, :] = 0.0
    M[2 * N - 1, N - 1] = r_lip * (1 - lp)
    M[2 * N - 1, 2 * N] = r_lip * lp
    M[2 * N, N - 1] = 1 - lp
    M[2 * N, 2 * N] = lp
    g = np.zeros(2 * N + 1)
    g[0] = 1.0                                   # excitation enters f[0]
    c = np.zeros(2 * N + 1)
    c[N - 1] = 1.0 + kl.DEFAULT_LIP_REFLECTION   # transmitted = (1 + k_lip) f[N-1]
    return M, g, c


def tract_response(area_cp, hf):
    """|T| in dB at the harmonic frequencies: c (zI - M)^-1 g, via one eigendecomposition."""
    M, g, c = sung_state(area_cp)
    lam, V = np.linalg.eig(M)
    left = c @ V
    right = np.linalg.solve(V, g)
    z = np.exp(2j * np.pi * hf / FS)
    T = (left * right)[None, :] / (z[:, None] - lam[None, :])
    return 20 * np.log10(np.abs(T.sum(axis=1)) + 1e-12)


def source_db(f0, hf, oq=OQ, tension=TENSION):
    """Rosenberg pulse train at f0 (DC removed), times lip radiation, in dB at harmonics."""
    P = int(round(FS / f0))
    p = kl.rosenberg_pulse(P, oq, tension)
    p = p - p.mean()
    k = np.arange(1, len(hf) + 1)
    X = np.array([np.sum(p * np.exp(-2j * np.pi * kk * np.arange(P) / P)) for kk in k])
    om = 2 * np.pi * hf / FS
    R = 1 - np.exp(-1j * om)
    return 20 * np.log10(np.abs(X * R) + 1e-12)


# ---------------------------------------------------------------------------
# The sing-along fit
# ---------------------------------------------------------------------------

def objective(coeffs, hf, target_db, src_db, tilt, smooth_w=0.02):
    area = fv.coeffs_to_area(coeffs)
    d = target_db - (src_db + tract_response(area, hf))
    if tilt:                                     # free gain and slope per octave
        X = np.c_[np.ones_like(hf), np.log2(hf)]
        d = d - X @ np.linalg.lstsq(X, d, rcond=None)[0]
    else:                                        # free gain only
        d = d - d.mean()
    # weight by a mild 1/k so the formant region outweighs the noisy top
    w = 1.0 / np.sqrt(np.arange(1, len(hf) + 1))
    d2 = np.diff(np.log(area), 2)
    return np.sum(w * d * d) / np.sum(w) + smooth_w * np.sum(d2 * d2)


def sing_along(y, fs, tilt=False):
    f0, hf, hl = heard_harmonics(y, fs)
    src = source_db(f0, hf)
    starts = [np.full(fv.CONTROL_POINTS, 3.0)] + [fv.seed_area(v) for v in VOWELS]
    best, best_err = None, np.inf
    for s0 in starts:
        x0 = fv.area_to_coeffs(s0)
        res = minimize(objective, x0, args=(hf, hl, src, tilt), method="L-BFGS-B",
                       options={"maxiter": 3000})
        if res.fun < best_err:
            best, best_err = res.x, res.fun
    return fv.coeffs_to_area(best), f0, float(np.sqrt(best_err))


# ---------------------------------------------------------------------------
# The test
# ---------------------------------------------------------------------------

def one_tube(job):
    name, f0 = job
    area = E.load_tubes()[name]
    truth = L.sung_formants(area)
    fit, f0h, rms = sing_along(E.sing(area, f0), FS)
    fm = L.sung_formants(fit)
    row = {"tube": name, "f0": f0, "f0_heard": round(f0h, 1),
           "truth": np.round(truth).tolist(), "sung_back": np.round(fm).tolist(),
           "err_pct": L.pct(fm, truth), "spectral_fit_rms_db": round(rms, 2),
           "shape_err_db": round(L.shape_error(fit, area), 2), "area": fit.tolist()}
    print(name, f0, row["err_pct"], row["shape_err_db"], flush=True)
    return row


def main():
    t0 = time.time()
    tubes = E.load_tubes()
    plain = json.load(open(os.path.join(HERE, "ear-results.json")))
    from multiprocessing import Pool
    jobs = [(name, f0) for name in tubes for f0 in E.PITCHES]
    with Pool(min(10, os.cpu_count() or 4)) as pool:
        rows = pool.map(one_tube, jobs)
    print(f"{time.time()-t0:6.0f}s  own tubes done", flush=True)

    summary = {}
    for f0 in E.PITCHES:
        m = np.array([r["err_pct"] for r in rows if r["f0"] == f0], float)
        p = np.array([r["plain LPC"]["err_pct"] for r in plain["rows"] if r["f0"] == f0], float)
        summary[str(int(f0))] = {
            "sing_along_mean_abs_F1_F2_F3": np.round(np.nanmean(np.abs(m), 0), 1).tolist(),
            "sing_along_worst_F1": round(float(np.nanmax(np.abs(m[:, 0]))), 1),
            "plain_LPC_mean_abs_F1_F2_F3": np.round(np.nanmean(np.abs(p), 0), 1).tolist(),
            "plain_LPC_worst_F1": round(float(np.nanmax(np.abs(p[:, 0]))), 1),
            "sing_along_mean_shape_err_db": round(float(np.mean([r["shape_err_db"] for r in rows if r["f0"] == f0])), 2)}
    print(json.dumps(summary, indent=1))

    # voices Tract Mirror did not make: sing along with tilt, and replay
    voices, tour = {}, []
    gap = np.zeros(int(0.3 * FS))
    for name in ["Daniel", "Samantha"]:
        for v in ["a", "i", "u"]:
            fs, y = L.read_wav(os.path.join(HERE, "voices", f"{name}_{v}.wav"))
            y = L.steady_part(y, fs)
            y44 = resample_poly(y, FS, fs) if fs != FS else y
            plain_fit = L.fit_area_to_formants(L.estimate_formants(y, fs), restarts=1, seed=7)
            fit, f0h, rms = sing_along(y44, FS, tilt=True)
            voices[f"{name}_{v}"] = {"f0_heard": round(f0h, 1),
                                     "plain_LPC_heard": np.round(L.estimate_formants(y, fs)).tolist(),
                                     "plain_fit_sings": np.round(L.sung_formants(plain_fit)).tolist(),
                                     "sing_along_sings": np.round(L.sung_formants(fit)).tolist(),
                                     "spectral_fit_rms_db": round(rms, 2)}
            print(name, v, voices[f"{name}_{v}"], flush=True)
            sing = lambda a: mr.fade(mr.normalize(mr.render_sustained_vowel(
                np.clip(a, fv.A_MIN, fv.A_MAX), f0=f0h, dur=1.2, fs=FS)))
            tour += [mr.normalize(mr.fade(y44[: int(1.2 * FS)])), gap, sing(plain_fit), gap, sing(fit), gap, gap]
    mr.write_wav(os.path.join(HERE, "singalong-replay.wav"), np.concatenate(tour))

    json.dump({"summary": summary, "rows": rows, "voices": voices},
              open(os.path.join(HERE, "singalong-results.json"), "w"), indent=1)
    plot(rows, plain["rows"])
    print(f"done in {time.time()-t0:.0f}s")


def plot(rows, plain_rows):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    bg, ink, dim = "#15171a", "#e9e4d8", "#8a8679"
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.8), facecolor=bg, sharey=True)
    for i, (ax, fn) in enumerate(zip(axes, ["F1", "F2", "F3"])):
        ax.set_facecolor(bg)
        for s in ax.spines.values():
            s.set_color(dim)
        ax.tick_params(colors=dim)
        for j, (rs, key, col, lab) in enumerate([(plain_rows, "plain", dim, "plain LPC (the ear now)"),
                                                  (rows, "sa", "#e8a33d", "sing-along")]):
            xs, ys = [], []
            for n, r in enumerate(rs):
                v = (r["plain LPC"]["err_pct"] if key == "plain" else r["err_pct"])[i]
                xs.append(E.PITCHES.index(r["f0"]) + (j - 0.5) * 0.3
                          + np.random.default_rng(n).uniform(-0.07, 0.07))
                ys.append(v)
            ax.scatter(xs, ys, s=16, color=col, alpha=0.8, label=lab if i == 0 else None)
        ax.axhline(0, color=dim, lw=0.6)
        ax.set_xticks(range(4), ["G2 98", "D3 147", "A3 220", "E4 330"])
        ax.set_title(f"{fn}: heard minus as-sung truth (%)", color=ink)
        ax.set_ylim(-35, 35)
    fig.legend(loc="lower center", ncol=2, frameon=False, labelcolor=ink)
    fig.suptitle("Hearing by singing along: 12 tubes of known shape, four pitches"
                 "   (one dot = one vowel)", color=ink, fontsize=12)
    fig.tight_layout(rect=(0, 0.07, 1, 0.94))
    fig.savefig(os.path.join(HERE, "singalong-errors.png"), dpi=110, facecolor=bg)


if __name__ == "__main__":
    main()
