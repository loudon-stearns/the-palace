"""
listen.py - Tract Mirror's first listening probe (toward v2, "learn to speak by listening").

Question: given only a recording of a vowel, can Tract Mirror recover a tube that
sings it back?  Two ways of listening are tried, and both are measured against
the truth wherever the truth is known.

  A. THE MIRROR READ BACKWARDS (Wakita).  Autocorrelation LPC on the audio gives
     reflection coefficients k_1..k_p.  The thesis says those ARE the junctions of
     a tube, so A_{i+1}/A_i = (1-k)/(1+k) turns them straight into an area
     function, with no optimizer.  Order p = 2N: a 17.1 cm tract at 44.1 kHz is
     N = 22 one-sample sections, i.e. 44 half-sample sections, which is the tube
     an order-44 lattice describes.

  B. ANALYSIS BY SYNTHESIS.  Estimate F1-F3 from the audio (LPC roots), then let
     the fitter that made vowels.json find a 64-point area function whose
     formants AS SUNG (lip lowpass on, see sung_formants) match them.  The
     listener is not told which vowel it is hearing.

  The finding this probe made on its first run: vowels.json was fitted, and every
  gate since was measured, with the lip lowpass OFF.  The audio path has it ON,
  which lowers every formant 0-14%.  So "truth" below is the as-sung formants.

Inputs: the six reference vowel renders (truth known), and six vowels from two
macOS voices (Daniel, Samantha) that Tract Mirror did not make (truth unknown).
Outputs (in this folder): listen-results.json, tubes-heard.png, and replay WAVs.

Run with the palace-vital venv (numpy, scipy, matplotlib):
    ~/.venvs/palace-vital/bin/python listen.py
"""

import json
import os
import sys

import numpy as np
from scipy.io import wavfile
from scipy.optimize import minimize
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "..", "reference")
sys.path.insert(0, REF)

import kl_reference as kl          # noqa: E402
import fit_vowels as fv            # noqa: E402
import make_renders as mr          # noqa: E402

FS = 44100
N = kl.n_sections(FS)              # 22
VOWELS = ["a", "e", "i", "o", "u", "schwa"]


# ---------------------------------------------------------------------------
# Audio in
# ---------------------------------------------------------------------------

def read_wav(path):
    fs, y = wavfile.read(path)
    y = y.astype(float)
    if y.ndim > 1:
        y = y.mean(axis=1)
    y /= (np.max(np.abs(y)) + 1e-12)
    return fs, y


def steady_part(y, fs, keep=0.5):
    """The loudest stretch of the file: frames above -12 dB of the peak frame,
    then the middle `keep` fraction of those.  Drops onsets and tails."""
    hop = int(0.01 * fs)
    win = int(0.03 * fs)
    e = np.array([np.sum(y[i:i + win] ** 2) for i in range(0, len(y) - win, hop)])
    on = np.where(e > e.max() * 10 ** (-12 / 10))[0]
    a, b = on[0] * hop, on[-1] * hop + win
    mid, half = (a + b) // 2, int((b - a) * keep / 2)
    return y[mid - half: mid + half]


# ---------------------------------------------------------------------------
# Listening B: formants from LPC roots (the standard phonetics way)
# ---------------------------------------------------------------------------

def estimate_formants(y, fs, n=3):
    """Median F1..Fn over 30 ms Hamming frames: resample to 11025 Hz, pre-emphasize,
    LPC order 12, keep roots with bandwidth < 500 Hz above 150 Hz."""
    fs2 = 11025
    y2 = resample_poly(y, fs2, fs)
    y2 = np.append(y2[0], y2[1:] - 0.94 * y2[:-1])
    win, hop, order = int(0.03 * fs2), int(0.01 * fs2), 12
    w = np.hamming(win)
    tracks = []
    for i in range(0, len(y2) - win, hop):
        x = y2[i:i + win] * w
        r = np.array([np.dot(x[:win - l], x[l:]) for l in range(order + 1)])
        if r[0] <= 0:
            continue
        a, _ = kl.levinson_durbin(r, order)
        roots = np.roots(np.concatenate([[1.0], -a]))
        roots = roots[np.imag(roots) > 0]
        f = np.angle(roots) * fs2 / (2 * np.pi)
        bw = -np.log(np.abs(roots)) * fs2 / np.pi
        f = np.sort(f[(f > 150) & (bw < 500)])
        if len(f) >= n:
            tracks.append(f[:n])
    return np.median(np.array(tracks), axis=0)


def fit_area_to_formants(targets, restarts=2, seed=0):
    """Fit a 64-point area whose AS-SUNG F1-F3 match what was heard.  The
    listener is not told the vowel: it starts from the uniform tube and from
    each of the six mouth sketches fit_vowels.py knows, and keeps whichever
    start ends closest to what it heard (chosen by error, never by name)."""
    starts = [np.full(fv.CONTROL_POINTS, 3.0)] + [fv.seed_area(v) for v in VOWELS]
    rng = np.random.default_rng(seed)
    best, best_err = None, np.inf
    for s0 in starts:
        base = fv.area_to_coeffs(s0)
        for r in range(restarts):
            x0 = base + (rng.standard_normal(len(base)) * 0.2 if r else 0.0)
            res = minimize(sung_objective, x0, args=(targets,), method="Nelder-Mead",
                           options={"maxiter": 4000, "xatol": 1e-5, "fatol": 1e-8})
            if res.fun < best_err:
                best, best_err = res.x, res.fun
    return fv.coeffs_to_area(best)


# ---------------------------------------------------------------------------
# Listening A: the mirror read backwards
# ---------------------------------------------------------------------------

def wakita_area(y, fs, order=2 * N, preemph=0.98):
    """Reflection coefficients from LPC, read directly as tube junctions.

    Source and radiation tilt are removed first: the glottal flow falls about
    -12 dB/oct and lip radiation adds +6, so the audio carries about -6 dB/oct of
    tilt that is not the tube; one first difference (pre-emphasis 0.98) takes it
    out.  Lattice k_1 sits at the lips, so the area is built lips -> glottis and
    flipped.  The sign is the engine's: k = (A_i - A_{i+1})/(A_i + A_{i+1}),
    read from the lip side, so A_toward_glottis / A_lipward = (1+k)/(1-k).
    Returns a 64-point area curve, glottis -> lips, scaled to mean 3 cm^2."""
    if fs != FS:
        y = resample_poly(y, FS, fs)
    x = np.append(y[0], y[1:] - preemph * y[:-1]) if preemph else np.asarray(y, float)
    x = x * np.hamming(len(x))
    r = np.array([np.dot(x[:len(x) - l], x[l:]) for l in range(order + 1)])
    r[1:] *= np.exp(-0.5 * (2 * np.pi * 60 / FS * np.arange(1, order + 1)) ** 2)  # 60 Hz lag window
    _, k = kl.levinson_durbin(r, order)
    areas = [1.0]
    for ki in k:                                  # lips -> glottis
        areas.append(areas[-1] * (1 + ki) / (1 - ki))
    areas = np.array(areas[::-1])                 # glottis -> lips
    areas = kl.resample_area(np.clip(areas, 1e-4, None), fv.CONTROL_POINTS)
    return areas * 3.0 / areas.mean()


# ---------------------------------------------------------------------------
# Measures
# ---------------------------------------------------------------------------

def tract_formants(area_cp):
    """Formants on paper: the state-matrix poles with the lip lowpass OFF
    (how vowels.json was fitted and how every earlier gate was measured)."""
    return fv.measure_formants(np.clip(area_cp, fv.A_MIN, fv.A_MAX), FS)


LIP_LP = 0.75   # the one-pole on the reflected lip wave, ON in every audio path


def sung_formants(area_cp, n=3, lp=LIP_LP):
    """Formants AS SUNG: the same state matrix with the lip lowpass as one more
    state.  lp_new = (1-a) f[N-1] + a lp;  b_new[N-1] = r_lip * lp_new.
    Exact for the audio path, the way tract_state_matrix is exact for the
    analysis path."""
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
    ev = np.linalg.eigvals(M)
    f = sorted(np.angle(p) * FS / (2 * np.pi) for p in ev
               if np.imag(p) > 0 and abs(p) < 1.0001)
    f = [x for x in f if 90 < x < 0.45 * FS][:n]
    return np.array(f + [np.nan] * (n - len(f)))


def sung_objective(coeffs, targets, smooth_weight=0.002):
    """fit_vowels.objective, but scored on the formants the audio actually has."""
    area = fv.coeffs_to_area(coeffs)
    fm = sung_formants(area)
    t = np.array(targets, dtype=float)
    err = 5.0 if np.any(np.isnan(fm)) else np.sum(np.array([1.3, 1.2, 0.8]) * ((fm - t) / t) ** 2)
    d2 = np.diff(np.log(area), 2)
    return err + smooth_weight * np.sum(d2 * d2)


def shape_error(area_cp, truth_cp):
    """RMS of the log-area difference after removing overall scale, in dB
    (20*log10 of the area ratio; 0 dB = same shape)."""
    d = np.log(area_cp) - np.log(truth_cp)
    d -= d.mean()
    return float(np.sqrt(np.mean(d ** 2)) * 20 / np.log(10))


def pct(f, t):
    return [round(100 * (a - b) / b, 1) for a, b in zip(f, t)]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    vj = json.load(open(os.path.join(REF, "vowels.json")))
    truth = {v: np.array(vj["vowels"][v]["area_cm2"] if isinstance(vj["vowels"][v], dict)
                         else vj["vowels"][v]) for v in VOWELS}
    results = {"reference": {}, "voices": {}}
    heard_ref, heard_ext = {}, {}

    # --- the six reference vowels: truth known ---
    for v in VOWELS:
        t_fmt = sung_formants(truth[v])
        # ideal listener: the tube's own impulse response (no source in the way)
        # (raw transmitted pressure, no source and no radiation: nothing to whiten)
        ir = kl.tract_impulse_response(kl.resample_area(truth[v], N), FS, n=8192,
                                       radiation=False, radiation_lowpass=LIP_LP)
        a_ir = wakita_area(ir, FS, preemph=0.0)
        # real listener: the sung render, glottal source and vibrato included
        fs, y = read_wav(os.path.join(REF, "renders", f"vowel_{v}.wav"))
        y = steady_part(y, fs)
        a_sung = wakita_area(y, fs)
        f_est = estimate_formants(y, fs)
        a_fit = fit_area_to_formants(f_est, seed=VOWELS.index(v))
        heard_ref[v] = {"truth": truth[v], "mirror_ir": a_ir, "mirror_sung": a_sung, "fit": a_fit}
        results["reference"][v] = {
            "paper_formants": np.round(tract_formants(truth[v])).tolist(),
            "truth_formants": np.round(t_fmt).tolist(),
            "heard_formants_from_audio": np.round(f_est).tolist(),
            "heard_err_pct": pct(f_est, t_fmt),
            "mirror_ir": {"formants": np.round(sung_formants(a_ir)).tolist(),
                          "err_pct": pct(sung_formants(a_ir), t_fmt),
                          "shape_err_db": round(shape_error(a_ir, truth[v]), 2)},
            "mirror_sung": {"formants": np.round(sung_formants(a_sung)).tolist(),
                            "err_pct": pct(sung_formants(a_sung), t_fmt),
                            "shape_err_db": round(shape_error(a_sung, truth[v]), 2)},
            "fit": {"formants": np.round(sung_formants(a_fit)).tolist(),
                    "err_pct": pct(sung_formants(a_fit), t_fmt),
                    "shape_err_db": round(shape_error(a_fit, truth[v]), 2)},
        }
        print(v, json.dumps(results["reference"][v]))

    # --- voices Tract Mirror did not make: truth unknown, formants compared ---
    vdir = os.path.join(HERE, "voices")
    for name in ["Daniel", "Samantha"]:
        for v in ["a", "i", "u"]:
            fs, y = read_wav(os.path.join(vdir, f"{name}_{v}.wav"))
            y = steady_part(y, fs)
            f_est = estimate_formants(y, fs)
            a_fit = fit_area_to_formants(f_est, seed=7)
            a_mir = wakita_area(y, fs)
            key = f"{name}_{v}"
            heard_ext[key] = {"fit": a_fit, "mirror_sung": a_mir, "audio": (fs, y)}
            results["voices"][key] = {
                "heard_formants": np.round(f_est).tolist(),
                "fit_formants": np.round(sung_formants(a_fit)).tolist(),
                "fit_err_pct_vs_heard": pct(sung_formants(a_fit), f_est),
                "mirror_formants": np.round(sung_formants(a_mir)).tolist(),
                "mirror_err_pct_vs_heard": pct(sung_formants(a_mir), f_est),
                "shape_dist_to_tract_mirror_vowel_db": round(shape_error(a_fit, truth[v]), 2),
            }
            print(key, json.dumps(results["voices"][key]))

    json.dump(results, open(os.path.join(HERE, "listen-results.json"), "w"), indent=1)
    np.savez(os.path.join(HERE, "heard-areas.npz"),
             **{f"{v}_{k}": a for v, d in heard_ref.items() for k, a in d.items()},
             **{f"{v}_{k}": a for v, d in heard_ext.items() for k, a in d.items() if k != "audio"})
    render_replays(heard_ref, heard_ext)
    plot(heard_ref, heard_ext, results)


# ---------------------------------------------------------------------------
# Replays: what it heard, then what it sings back
# ---------------------------------------------------------------------------

def sing(area_cp, dur=1.4, f0=110.0):
    return mr.normalize(mr.render_sustained_vowel(np.clip(area_cp, fv.A_MIN, fv.A_MAX),
                                                  f0=f0, dur=dur, fs=FS))


def render_replays(heard_ref, heard_ext):
    gap = np.zeros(int(0.35 * FS))
    tour = []
    for v in VOWELS:
        tour += [sing(heard_ref[v]["truth"]), gap, sing(heard_ref[v]["fit"]), gap,
                 sing(heard_ref[v]["mirror_sung"]), gap, gap]
    mr.write_wav(os.path.join(HERE, "replay-reference-vowels.wav"), np.concatenate(tour))
    tour = []
    for key, d in heard_ext.items():
        fs, y = d["audio"]
        y = resample_poly(y, FS, fs) if fs != FS else y
        y = mr.normalize(mr.fade(y[: int(1.4 * FS)]))
        f0 = 110.0 if key.startswith("Daniel") else 196.0
        tour += [y, gap, sing(d["fit"], f0=f0), gap, gap]
    mr.write_wav(os.path.join(HERE, "replay-other-voices.wav"), np.concatenate(tour))


def plot(heard_ref, heard_ext, results):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    bg, ink, dim = "#15171a", "#e9e4d8", "#8a8679"
    cols = {"truth": "#e9e4d8", "fit": "#e8a33d", "mirror_ir": "#5fb3b3", "mirror_sung": "#c06c84"}
    labels = {"truth": "the tube that sang it", "mirror_ir": "mirror, read from the tube's own echo",
              "mirror_sung": "mirror, read from the sung vowel", "fit": "fitted to the heard formants"}
    x = np.linspace(0, 17.1, fv.CONTROL_POINTS)
    fig, axes = plt.subplots(3, 4, figsize=(16, 10.5), facecolor=bg)
    names = VOWELS + list(heard_ext.keys())
    for ax, name in zip(axes.flat, names):
        ax.set_facecolor(bg)
        for s in ax.spines.values():
            s.set_color(dim)
        ax.tick_params(colors=dim, labelsize=8)
        d = heard_ref.get(name) or heard_ext[name]
        keys = ["truth", "mirror_ir", "mirror_sung", "fit"] if name in heard_ref else ["mirror_sung", "fit"]
        for k in keys:
            r = np.sqrt(np.clip(d[k], 1e-3, 40) / np.pi)
            ax.plot(x, r, color=cols[k], lw=2.2 if k in ("truth", "fit") else 1.4,
                    label=labels[k])
            ax.plot(x, -r, color=cols[k], lw=2.2 if k in ("truth", "fit") else 1.4)
        if name in heard_ref:
            rr = results["reference"][name]
            sub = (f"heard {rr['heard_formants_from_audio'][0]:.0f}/{rr['heard_formants_from_audio'][1]:.0f} Hz"
                   f" · fit shape off {rr['fit']['shape_err_db']} dB")
            title = f"/{name}/  (Tract Mirror's own)"
        else:
            rr = results["voices"][name]
            sub = f"heard {rr['heard_formants'][0]:.0f}/{rr['heard_formants'][1]:.0f}/{rr['heard_formants'][2]:.0f} Hz"
            who, v = name.split("_")
            title = f"/{v}/  ({who}, a voice it didn't make)"
        ax.set_title(f"{title}\n{sub}", color=ink, fontsize=10)
        ax.set_ylim(-2.6, 2.6)
        ax.set_xlabel("glottis  →  lips  (cm)", color=dim, fontsize=8)
    h, l = axes.flat[0].get_legend_handles_labels()
    fig.legend(h, l, loc="lower center", ncol=4, frameon=False, labelcolor=ink, fontsize=10)
    fig.suptitle("Tract Mirror listening: what tube did it hear?   (radius drawn above and below the axis)",
                 color=ink, fontsize=14)
    fig.tight_layout(rect=(0, 0.04, 1, 0.96))
    fig.savefig(os.path.join(HERE, "tubes-heard.png"), dpi=110, facecolor=bg)


if __name__ == "__main__":
    main()
