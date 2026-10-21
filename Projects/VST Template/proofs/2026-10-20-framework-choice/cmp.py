import numpy as np, sys
N, B, K = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
ref = np.load(f"ref_{N}_{B:g}_{K:g}.npy"); L = ref.shape[1]
for tag in ("unwrapped", "wrapped"):
    c = np.fromfile(f"c_{tag}.bin", dtype=np.float32).reshape(2, -1)[:, :L]
    d = np.abs(c[0] - ref[0]); dF = np.abs(c[1] - ref[1]); pk = np.abs(ref[0]).max()
    bad = np.argmax(d > 1e-3*pk) if (d > 1e-3*pk).any() else None
    print(f"B={B:g} K={K:g} {tag:9s}: max |tone err| {d.max()/pk:.2e} of peak, max |F err| {dF.max():.2e} Hz,",
          "never departs past 1e-3 of peak" if bad is None else f"departs past 1e-3 of peak at {bad/44100:.3f} s")
