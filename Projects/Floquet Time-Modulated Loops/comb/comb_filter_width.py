"""
comb_filter_width.py — how the loop filter sets the tongue's width.

Same pumped loop as comb_tongues.py, but the loop filter is a binomial
smoother of order p (p+1 taps, p/2 samples of delay): p=1 is Karplus-Strong's
two-point average; bigger p is a darker string. The loop length is chosen so
the round trip stays near 220 Hz. Measures the lock range (pump/loop ratio
where a ring grows) at a few pump depths.
"""
import numpy as np, json
from math import comb
FS = 48000; G0 = 0.98

def growth(p, ratios, eps, trips=1500, seed=2):
    h = np.array([comb(p, i) for i in range(p + 1)], float) / 2 ** p
    Lr = FS / 220.0                    # round trip in samples
    L = int(round(Lr - p / 2)); f0 = FS / (L + p / 2)
    R = np.asarray(ratios)[:, None] * np.ones((1, len(eps))); E = np.ones((len(ratios), 1)) * np.asarray(eps)[None]
    R, E = R.ravel(), E.ravel(); B = R.size
    prev = np.random.default_rng(seed).standard_normal((B, L + p))   # y[n0-L-p .. n0-1]
    n0 = 0; logsum = np.zeros(B); cnt = 0; idx = np.arange(L)
    for k in range(trips):
        n = n0 + idx
        g = G0 * (1 + E[:, None] * np.cos(2 * np.pi * R[:, None] * f0 * n[None] / FS))
        # y[n] = g * sum_i h[i] y[n-L-i];  y[n-L-i] = prev[:, p - i + j] for j in 0..L-1
        acc = sum(h[i] * prev[:, p - i: p - i + L] for i in range(p + 1))
        y = g * acc
        e_old = (prev[:, p:] ** 2).sum(1); e_new = (y ** 2).sum(1)
        if k >= trips // 2: logsum += 0.5 * np.log(e_new / e_old); cnt += 1
        prev = np.concatenate([prev[:, -p:], y], 1) / np.sqrt(e_new / L)[:, None]
        n0 += L
    return (logsum / cnt * f0 * 20 / np.log(10)).reshape(len(ratios), len(eps)), f0

if __name__ == "__main__":
    ratios = np.round(np.arange(0.95, 1.0501, 0.0005), 5)
    eps = [0.05, 0.1, 0.2, 0.4]
    out = {}
    for p in (1, 2, 4, 8, 16):
        r, f0 = growth(p, ratios, eps)
        d = {"f0": round(f0, 3), "unpumped_dB_s": None}
        for j, e in enumerate(eps):
            ok = r[:, j] > 0
            d[f"eps_{e}"] = [float(ratios[ok].min()), float(ratios[ok].max())] if ok.any() else None
            d[f"peak_dB_s_eps_{e}"] = round(float(r[:, j].max()), 1)
        out[f"p{p}"] = d
        print(p, d, flush=True)
    json.dump(out, open("comb_filter_width.json", "w"), indent=1)
