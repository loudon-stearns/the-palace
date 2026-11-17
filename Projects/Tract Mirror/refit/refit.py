"""
refit.py - Tract Mirror's vowel refit, AS SUNG (Python only; the plugin is untouched).

Why: listening/ found that vowels.json was fitted with the lip lowpass OFF, while every
audio path (the Python renders and TractEngine.cpp, radiationLowpass = 0.75) has it ON.
So the vowels sing up to 14% flat of their Peterson-Barney targets.

What: refit each vowel's 64-point area curve so its formants AS SUNG (listen.sung_formants,
the exact audio-path model) meet the same targets, starting from the current tube and
penalising distance from it, so each vowel is nudged, not replaced by a different mouth
(three formants do not determine a tube; the current shape is the prior).

Gate: F1, F2 within 5%, F3 within 10%, as sung, at 44.1k AND 48k.

Outputs (this folder): vowels-refit.json (same shape as reference/vowels.json, NOT wired in),
refit-results.json, tubes-old-new.png, and audition WAVs (local only).

    ~/.venvs/palace-vital/bin/python refit.py
"""
import json, os, sys
import numpy as np
from scipy.optimize import minimize

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "..", "reference")
LIS = os.path.join(HERE, "..", "listening")
sys.path[:0] = [REF, LIS]
import kl_reference as kl   # noqa
import fit_vowels as fv     # noqa
import make_renders as mr   # noqa
import listen as ls         # noqa

VOWELS = ["a", "e", "i", "o", "u", "schwa"]
LP = ls.LIP_LP


def sung_at(area_cp, fs, n=3, lp=LP):
    """listen.sung_formants generalised to any fs (its own N)."""
    N = kl.n_sections(fs)
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
    f = sorted(np.angle(p) * fs / (2 * np.pi) for p in ev if np.imag(p) > 0 and abs(p) < 1.0001)
    f = [x for x in f if 90 < x < 0.45 * fs][:n]
    return np.array(f + [np.nan] * (n - len(f)))


def objective(c, targets, old_log, prior_w, smooth_w=0.002):
    area = fv.coeffs_to_area(c)
    t = np.array(targets, float)
    err = 0.0
    for fs in (44100, 48000):
        fm = sung_at(area, fs)
        err += 5.0 if np.any(np.isnan(fm)) else np.sum(np.array([1.3, 1.2, 0.8]) * ((fm - t) / t) ** 2)
    la = np.log(area)
    d = la - old_log
    return err / 2 + smooth_w * np.sum(np.diff(la, 2) ** 2) + prior_w * np.mean(d ** 2)


def ok(fm, t):
    return bool(np.all(np.abs((fm - t) / t) <= np.array(fv.TOL)))


def refit(name, old, targets):
    """Start from the current tube; loosen the pull toward it until the gate passes."""
    old_log = np.log(np.clip(old, fv.A_MIN, fv.A_MAX))
    x0 = fv.area_to_coeffs(old)
    # Nelder-Mead's first simplex steps 5% of each coefficient, and only 0.00025 where one is
    # zero: schwa's uniform tube is all zeros but c_0, so it never moved. Give every term room.
    x0 = x0 + np.where(np.abs(x0) < 0.05, 0.05, 0.0)
    best = None
    for prior_w in (0.05, 0.02, 0.008, 0.003, 0.0):
        x = x0
        for _ in range(3):
            x = minimize(objective, x, args=(targets, old_log, prior_w), method="Nelder-Mead",
                         options={"maxiter": 6000, "xatol": 1e-6, "fatol": 1e-9}).x
        area = fv.coeffs_to_area(x)
        f44, f48 = sung_at(area, 44100), sung_at(area, 48000)
        best = (area, prior_w, f44, f48)
        print(f"  /{name}/ prior {prior_w}: as sung {np.round(f44)}  gate {ok(f44, targets) and ok(f48, targets)}")
        if ok(f44, targets) and ok(f48, targets):
            break
    return best


def main():
    src = json.load(open(os.path.join(REF, "vowels.json")))
    out = json.loads(json.dumps(src))
    results, olds, news = {}, {}, {}
    for v in VOWELS:
        old = np.array(src["vowels"][v]["area_cm2"])
        t = np.array(fv.FORMANT_TARGETS[v], float)
        print(f"/{v}/ targets {t}")
        area, pw, f44, f48 = refit(v, old, t)
        olds[v], news[v] = old, area
        sung_old = sung_at(old, 44100)
        results[v] = {
            "targets_hz": t.tolist(),
            "old_as_sung_hz": np.round(sung_old, 1).tolist(),
            "old_err_pct": ls.pct(sung_old, t),
            "new_as_sung_44k_hz": np.round(f44, 1).tolist(),
            "new_err_pct": ls.pct(f44, t),
            "new_as_sung_48k_hz": np.round(f48, 1).tolist(),
            "gate_44k_48k": ok(f44, t) and ok(f48, t),
            "prior_weight_used": pw,
            "shape_change_db": round(ls.shape_error(area, old), 2),
            "lips_area_old_new_cm2": [round(float(old[-1]), 2), round(float(area[-1]), 2)],
        }
        out["vowels"][v].update({
            "area_cm2": [float(a) for a in area],
            "formants_measured_44k_hz": [float(f) for f in f44],
            "formants_measured_48k_hz": [float(f) for f in f48],
        })
    out["fitted_as_sung"] = {"radiation_lowpass": LP, "note": "formants_measured_* are AS SUNG (lip lowpass on)"}
    json.dump(out, open(os.path.join(HERE, "vowels-refit.json"), "w"), indent=2)
    json.dump(results, open(os.path.join(HERE, "refit-results.json"), "w"), indent=2)

    # Audition: each vowel old, then new, at 110 Hz; then a morph a-e-i-o-u old, then new.
    fs = mr.FS
    gap = np.zeros(int(0.3 * fs))
    tour = []
    for v in VOWELS:
        tour += [ls.sing(olds[v], dur=1.3), gap, ls.sing(news[v], dur=1.3), gap, gap]
    mr.write_wav(os.path.join(HERE, "audition-six-vowels-old-then-new.wav"), np.concatenate(tour))
    seq = ["a", "e", "i", "o", "u"]
    m_old = mr.normalize(mr.render_morph([olds[v] for v in seq], dur=5.0))
    m_new = mr.normalize(mr.render_morph([news[v] for v in seq], dur=5.0))
    mr.write_wav(os.path.join(HERE, "audition-morph-old-then-new.wav"),
                 np.concatenate([m_old, np.zeros(int(0.8 * fs)), m_new]))

    import matplotlib; matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, axs = plt.subplots(2, 3, figsize=(12, 6.4), sharex=True)
    x = np.linspace(0, 17.1, 64)
    for ax, v in zip(axs.flat, VOWELS):
        r = results[v]
        ax.fill_between(x, -np.sqrt(olds[v]), np.sqrt(olds[v]), color="#bbb", alpha=0.6, label="now")
        ax.plot(x, np.sqrt(news[v]), color="#c2410c"); ax.plot(x, -np.sqrt(news[v]), color="#c2410c", label="refit")
        ax.set_title(f"/{v}/  F1 {r['old_err_pct'][0]:+.0f}% → {r['new_err_pct'][0]:+.0f}%   "
                     f"F2 {r['old_err_pct'][1]:+.0f}% → {r['new_err_pct'][1]:+.0f}%", fontsize=10)
        ax.set_yticks([])
    axs[0, 0].legend(loc="upper left", fontsize=8)
    for ax in axs[1]:
        ax.set_xlabel("cm from glottis → lips")
    fig.suptitle("Tract Mirror — six tubes, now (grey) and refit to sing on target with the lip filter on (orange)")
    fig.tight_layout()
    fig.savefig(os.path.join(HERE, "tubes-old-new.png"), dpi=120)
    print(json.dumps(results, indent=1))


if __name__ == "__main__":
    main()
