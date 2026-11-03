"""
comb_tongues.py — the pumped comb's tongue map, measured.

A Karplus-Strong loop: y[n] = g[n] * 0.5*(y[n-L] + y[n-L-1]) + input.
The loop gain is pumped: g[n] = g0 * (1 + eps * cos(2*pi*fm*n/fs)).
g0 < 1, so with no pump every ring dies. The question is the Mathieu one:
for which (pump rate, pump depth) does a ring grow from noise instead?

Vectorised one round trip at a time (every sample of a trip depends only on
the trip before), and across the whole (ratio, eps) grid at once.
Growth is measured with no saturation: renormalise each trip, average the
log energy gain over the second half of the run.
"""
import numpy as np, json, sys

FS = 48000
L = 218                       # integer loop: f0 = FS/(L+0.5) (the 2-point average adds half a sample)
F0 = FS / (L + 0.5)
G0 = 0.98

def growth(ratios, epss, trips=600, seed=1):
    R, E = np.meshgrid(ratios, epss, indexing="ij")
    R, E = R.ravel(), E.ravel()
    B = R.size
    rng = np.random.default_rng(seed)
    prev = rng.standard_normal((B, L + 1))     # the last L+1 samples
    n0 = 0
    logsum = np.zeros(B); count = 0
    idx = np.arange(L)
    for k in range(trips):
        n = n0 + idx
        g = G0 * (1 + E[:, None] * np.cos(2 * np.pi * (R[:, None] * F0) * n[None, :] / FS))
        # y[n-L] = prev[:, 1+i], y[n-L-1] = prev[:, i]   (prev holds y[n0-L-1 .. n0-1])
        y = g * 0.5 * (prev[:, 1:] + prev[:, :-1])
        e_old = (prev[:, 1:] ** 2).sum(1); e_new = (y ** 2).sum(1)
        if k >= trips // 2:
            logsum += 0.5 * np.log(e_new / e_old); count += 1
        s = np.sqrt(e_new / L)[:, None]
        prev = np.concatenate([prev[:, -1:], y], axis=1) / s
        n0 += L
    rate = logsum / count * F0 * 20 / np.log(10)   # dB per second (amplitude)
    return rate.reshape(len(ratios), len(epss))

if __name__ == "__main__":
    wide_r = np.round(np.arange(0.40, 3.601, 0.02), 4)
    epss = np.round(np.arange(0.0, 0.2501, 0.0125), 4)
    wide = growth(wide_r, epss)
    zoom_r = np.round(np.arange(0.97, 1.0301, 0.001), 4)
    zeps = np.round(np.arange(0.0, 0.2501, 0.005), 4)
    zoom = growth(zoom_r, zeps, trips=1200)
    np.savez("comb_tongues.npz", wide_r=wide_r, epss=epss, wide=wide, zoom_r=zoom_r, zeps=zeps, zoom=zoom)
    # thresholds at integer ratios
    out = {"f0": F0, "g0": G0}
    for m in (1, 2, 3):
        i = np.argmin(abs(wide_r - m)); row = wide[i]
        j = np.argmax(row > 0)
        out[f"threshold_eps_ratio_{m}"] = float(epss[j]) if row.max() > 0 else None
    out["max_rate_off_integer"] = float(wide[np.abs(wide_r - np.round(wide_r)) > 0.05].max())
    # zoom: lock width at eps .1,.2
    for e in (0.05, 0.1, 0.2):
        j = np.argmin(abs(zeps - e)); col = zoom[:, j] > 0
        out[f"lock_range_eps_{e}"] = [float(zoom_r[col].min()), float(zoom_r[col].max())] if col.any() else None
    out["unpumped_rate_dB_s"] = float(wide[np.argmin(abs(wide_r-1)), 0])
    print(json.dumps(out, indent=1))
    json.dump(out, open("comb_tongues.json", "w"), indent=1)
