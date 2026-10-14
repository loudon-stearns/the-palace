"""
Where does spike shape stop mattering?  Lock curves for four spike shapes.

Build:  faust -double -a arch.cpp -i shape_render.dsp -o /tmp/apo_shape_render.cpp
        c++ -O2 -std=c++17 -I/opt/homebrew/include /tmp/apo_shape_render.cpp -o /tmp/apo_shape_render
Run:    python3 sweep.py      (writes sweep.json)

Each run: 1 s with no coupling (the crowd falls out of its synchronized start),
then coupling K switched on; synchrony is measured over the last 3 s.
Synchrony is the Kuramoto order parameter R, computed from each neuron's own
spike onsets (phase rises 0 -> 2pi between consecutive spikes), so it does not
depend on how wide the spike pulse is.
"""
import subprocess, json, numpy as np

SR, N = 48000, 32
RENDER = "/tmp/apo_shape_render"

SHAPES = {
    "full":   dict(),                                            # Stage 4: shaped spike + ringing undershoot
    "flat":   dict(hyp=-0.01, damp=2.0),                        # shaped spike, no undershoot
    "bare":   dict(spike_ms=0.06, hyp=-0.01, damp=2.0),         # a click: integrate-and-fire with a reset
    "wide":   dict(spike_ms=3.0),                                # slow spike, 3 ms
}

def rise_samples(spike_ms=1.0, rise_frac=0.3, **_):
    s = max(2.0, spike_ms * 1e-3 * SR); return int(np.ceil(max(1.0, s * rise_frac)))

def render(params, secs):
    args = [RENDER, str(secs), str(SR)] + [f"{k}={v}" for k, v in params.items()]
    raw = subprocess.run(args, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, N + 3)

def order_parameter(spk, t0):
    """R(t) averaged over t >= t0 (samples); plus median firing rate."""
    onsets = [np.flatnonzero(np.diff(spk[:, i] > 0.5, prepend=0) == 1) for i in range(N)]
    grid = np.arange(t0, spk.shape[0], SR // 2000)
    z = np.zeros(len(grid), complex); rates = []
    for on in onsets:
        on = on[on >= t0 - SR // 2]
        if len(on) < 3: return 0.0, 0.0
        k = np.searchsorted(on, grid, side="right") - 1
        ok = (k >= 0) & (k < len(on) - 1)
        ph = np.zeros(len(grid))
        ph[ok] = 2*np.pi*(grid[ok] - on[k[ok]]) / (on[k[ok] + 1] - on[k[ok]])
        z += np.exp(1j * ph)
        rates.append(SR / np.median(np.diff(on[on >= t0])))
    return float(np.mean(np.abs(z / N))), float(np.median(rates))

if __name__ == "__main__":
    Ks = np.round(np.logspace(-4, -1, 19), 6)
    out = {"K": Ks.tolist(), "shapes": {}}
    for name, p in SHAPES.items():
        rows = []
        for K in Ks:
            x = render({**p, "K_on": K, "free_s": 1.0}, 5.0)
            R, f = order_parameter(x[:, 3:], 2 * SR)
            rows.append(dict(K=float(K), R=R, rate=f))
            print(f"{name:5s} K={K:.5f}  R={R:.3f}  rate={f:6.1f} Hz")
        out["shapes"][name] = dict(params=p, rise_samples=rise_samples(**p), rows=rows)
    json.dump(out, open("sweep.json", "w"), indent=1)
