#!/usr/bin/env python3
"""Map of the edge: for each coupling strength K and stretch B (held fixed), does the tone
hold (steady pitch), or tear (wobble)? Same model as the sweeps: unpinned and pinned stretch,
6 and 40 partials, back-pull scaled to the 6-partial run, far pulls (>3 kHz apart) faded.
All (K, B) cells run at once as arrays. 4 s each; wobble measured over the last 2 s.
Writes edgemap.png, edgemap.json."""
import numpy as np, json, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
F0, SECS, CR = 110.0, 4.0, 22050
Ks = np.array([1, 2, 4, 6, 10, 16, 25.0])
Bs = np.logspace(-8, 0, 33)
def run(N, pinned):
    n = np.arange(1, N+1); rng = np.random.default_rng(7)
    DET = 1 + rng.uniform(-0.004, 0.004, N); w = n*F0*DET; BACK = 21.0/n.sum()
    KK, BB = np.meshgrid(Ks, Bs, indexing="ij"); KK = KK[..., None]; BB = BB[..., None]
    r = n*np.sqrt((1 + BB*n*n)/((1 + BB) if pinned else 1))
    p = np.zeros(KK.shape[:2] + (N,)); ph = rng.uniform(0, 1, N) + 0*p
    Fprev = np.full(KK.shape[:2], F0); steps = int(SECS*CR); dt = 1/CR
    keep = []
    for i in range(steps):
        gate = np.clip((4000.0 - np.abs(r*Fprev[..., None] - w))/1000.0, 0, 1)
        s = np.sin(2*np.pi*(ph - p))*gate
        dth = F0 + BACK*KK[..., 0]*(r*s).sum(-1)
        p += r*dth[..., None]*dt; ph += (w - KK*s)*dt; Fprev = dth
        if i >= steps//2: keep.append(dth)
    k = np.array(keep)                              # time x K x B
    hop = CR//100; k = k[:len(k)//hop*hop].reshape(-1, hop, *k.shape[1:]).mean(1)   # 10 ms averages
    return k.std(0), k.mean(0)
out = {}; fig, ax = plt.subplots(2, 2, figsize=(11, 6.5), sharex=True, sharey=True)
for col, pinned in enumerate((False, True)):
    for row, N in enumerate((6, 40)):
        sd, mean = run(N, pinned)
        name = f"N{N}_{'pinned' if pinned else 'unpinned'}"
        out[name] = dict(K=Ks.tolist(), B=Bs.tolist(), wobble_hz=np.round(sd, 3).tolist(), mean_hz=np.round(mean, 2).tolist(),
            first_tear_B={str(K): (float(f"{Bs[np.argmax(sd[i] > 0.5)]:.3g}") if (sd[i] > 0.5).any() else None) for i, K in enumerate(Ks)})
        a = ax[row, col]
        im = a.pcolormesh(Bs, Ks, np.log10(np.maximum(sd, 1e-3)), cmap="magma", vmin=-2, vmax=1.2, shading="nearest")
        a.set_xscale("log"); a.set_title(f"{N} partials, {'partial 1 pinned' if pinned else 'unpinned'}", fontsize=9, loc="left")
        if col == 0: a.set_ylabel("coupling K (Hz)")
        if row == 1: a.set_xlabel("stretch B (log)")
        print(name, out[name]["first_tear_B"])
fig.colorbar(im, ax=ax, label="wobble of the fundamental, log10 Hz  (dark = holds, bright = torn)")
fig.suptitle("Map of the edge: where a pulled, stretched tone holds and where it tears", fontsize=10)
fig.savefig("edgemap.png", dpi=110); json.dump(out, open("edgemap.json", "w"))
