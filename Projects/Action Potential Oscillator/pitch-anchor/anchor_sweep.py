"""
Does the pitch anchor put the locked crowd on the dialed note?

Build:  faust -double -a arch.cpp -i anchor_render.dsp -o /tmp/apo_anchor.cpp
        c++ -O2 -std=c++17 -I/opt/homebrew/include /tmp/apo_anchor.cpp -o /tmp/apo_anchor
Run:    python3 anchor_sweep.py     (writes sweep.json)

For each rate spread and anchor setting: the solo pitches (K = 0), then the
locked pitch across a range of couplings. Pitch = median spike rate over the
last 2 s; synchrony = Kuramoto order parameter from spike onsets.
"""
import subprocess, json, sys, numpy as np
sys.path.insert(0, "../spike-shape")
from sweep import order_parameter

SR, N, F0 = 48000, 32, 110.0
RENDER = "/tmp/apo_anchor"

def render(params, secs):
    args = [RENDER, str(secs), str(SR)] + [f"{k}={v}" for k, v in params.items()]
    raw = subprocess.run(args, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, N + 3)

def member_rates(spk, t0):
    out = []
    for i in range(N):
        on = np.flatnonzero(np.diff(spk[t0:, i] > 0.5, prepend=0) == 1)
        out.append(SR / np.mean(np.diff(on)) if len(on) > 2 else 0.0)
    return np.array(out)

cents = lambda f: 1200 * np.log2(f / F0)

if __name__ == "__main__":
    Ks = [0.002, 0.004, 0.008, 0.016, 0.032, 0.064]
    out = {"F0": F0, "K": Ks, "runs": []}
    for h in [0.05, 0.10, 0.20, 0.30]:
        for a in [0.0, 1.0]:
            solo = member_rates(render(dict(freq=F0, h_f=h, anchor=a, K_on=0), 3.0)[:, 3:], SR)
            rows = []
            for K in Ks:
                x = render(dict(freq=F0, h_f=h, anchor=a, K_on=K, free_s=1.0), 5.0)
                R, _ = order_parameter(x[:, 3:], 3 * SR)
                r = member_rates(x[:, 3:], 3 * SR)
                rows.append(dict(K=K, R=R, pitch=float(np.median(r)), spread_hz=float(r.max() - r.min())))
                print(f"h={h:.2f} a={a:.0f} K={K:.3f}  R={R:.3f}  pitch={np.median(r):7.2f} Hz ({cents(np.median(r)):+6.1f} c)")
            out["runs"].append(dict(h_f=h, anchor=a, solo_min=float(solo.min()), solo_max=float(solo.max()),
                                    solo_mean=float(solo.mean()), rows=rows))
            print(f"   solo {solo.min():.2f}..{solo.max():.2f} mean {solo.mean():.2f}")
    json.dump(out, open("sweep.json", "w"), indent=1)
