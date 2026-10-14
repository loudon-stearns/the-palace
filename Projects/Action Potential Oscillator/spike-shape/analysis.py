"""
Spike-shape experiment, part two: the audition, the spectra, the pitch pull.
Reads sweep.json (from sweep.py), renders with /tmp/apo_shape_render.

Out: ../neuropulse-spike-shapes.wav   four shapes, each 2.5 s free then 3 s locked
     ../spike-shape-findings.png      lock curves, lock vs charge, spectra
     findings.json                    the numbers quoted on the board
"""
import json, numpy as np
from scipy.io import wavfile
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sweep import render, order_parameter, SHAPES, SR, N

sw = json.load(open("sweep.json"))
COL = {"full": "#c0392b", "flat": "#2471a3", "bare": "#7d3c98", "wide": "#d68910"}
NAME = {"full": "full Stage-4 spike (1 ms, ringing undershoot)",
        "flat": "same spike, no undershoot",
        "bare": "bare click (0.06 ms, no undershoot)",
        "wide": "slow spike (3 ms, ringing undershoot)"}

def k50(rows):
    K = np.array([r["K"] for r in rows]); R = np.array([r["R"] for r in rows])
    i = np.flatnonzero(R >= 0.5)[0]
    lk = np.interp(0.5, R[i-1:i+1], np.log10(K[i-1:i+1]))
    return 10 ** lk

def neuron_rates(spk, t0):
    out = []
    for i in range(N):
        on = np.flatnonzero(np.diff(spk[t0:, i] > 0.5, prepend=0) == 1)
        out.append(SR / np.mean(np.diff(on)))
    return np.array(out)

def envelope(x):
    """Smoothed log-magnitude spectrum, 50 Hz .. 8 kHz on a log grid."""
    w = np.hanning(len(x)); X = np.abs(np.fft.rfft(x * w)) ** 2
    f = np.fft.rfftfreq(len(x), 1 / SR)
    grid = np.geomspace(80, 8000, 120); env = []
    for g in grid:                     # third-octave bands, never narrower than 120 Hz
        hw = max(g * (2**(1/6) - 1), 60.0)
        m = (f >= g - hw) & (f < g + hw)
        env.append(10 * np.log10(X[m].mean() + 1e-20))
    env = np.array(env); return grid, env - env.max()

def centroid(x):
    X = np.abs(np.fft.rfft(x * np.hanning(len(x)))); f = np.fft.rfftfreq(len(x), 1 / SR)
    return float((f * X).sum() / X.sum())

FREE, LOCK = 2.5, 3.0
find = {"shapes": {}}
segs, envs = [], {}
for name, p in SHAPES.items():
    info = sw["shapes"][name]; K5 = k50(info["rows"]); rs = info["rise_samples"]
    Kplay = 3 * K5
    x = render({**p, "K_on": Kplay, "free_s": FREE}, FREE + LOCK)
    a = x[:, 1].astype(float); a -= a.mean()
    smear = a[int(1.0 * SR):int(FREE * SR)]           # after the synchronized start has dissolved
    locked = a[int((FREE + 1.0) * SR):]
    Rs, _ = order_parameter(x[int(0.0*SR):int(FREE*SR), 3:], int(1.0 * SR))
    Rl, fl = order_parameter(x[:, 3:], int((FREE + 1.0) * SR))
    g, es = envelope(smear); _, el = envelope(locked); envs[name] = (g, es, el)
    find["shapes"][name] = dict(label=NAME[name], pulse_samples=rs, K_half_lock=K5,
        charge_at_half_lock=K5 * rs, K_played=Kplay, R_smear=Rs, R_locked=Rl,
        locked_rate_hz=fl, centroid_smear_hz=centroid(smear), centroid_locked_hz=centroid(locked),
        smear_vs_locked_envelope_corr=float(np.corrcoef(es, el)[0, 1]))
    seg = a / np.sqrt(np.mean(a[int(1.0*SR):] ** 2)) * 0.12   # equal loudness per shape
    fade = int(0.01 * SR); seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    segs += [seg, np.zeros(int(0.4 * SR))]
    print(name, {k: (round(v, 4) if isinstance(v, float) else v) for k, v in find["shapes"][name].items() if k != "label"})

# do different shapes stay different once they're in a crowd?
names = list(SHAPES)
def mean_pair_dist(idx):
    d = [np.sqrt(np.mean((envs[a][idx] - envs[b][idx]) ** 2)) for i, a in enumerate(names) for b in names[i+1:]]
    return float(np.mean(d))
find["between_shape_env_rms_db"] = dict(smear=mean_pair_dist(1), locked=mean_pair_dist(2))
print("between-shape envelope distance (dB rms):", find["between_shape_env_rms_db"])

# pitch pull: does the locked crowd follow its fastest neuron?
pull = []
for hf in [0.05, 0.10, 0.20]:
    solo = render({"h_f": hf, "K_on": 0.0, "free_s": 0.0}, 3.0)
    rates = neuron_rates(solo[:, 3:], int(1.0 * SR))
    lk = render({"h_f": hf, "K_on": 0.1, "free_s": 1.0}, 5.0)
    R, f = order_parameter(lk[:, 3:], 2 * SR)
    pull.append(dict(rate_spread=hf, dialed=110.0, crowd_mean_alone=float(rates.mean()),
                     fastest_alone=float(rates.max()), locked=f, R=R))
    print(pull[-1])
find["pitch_pull"] = pull
json.dump(find, open("findings.json", "w"), indent=1)

audio = np.concatenate(segs); audio = audio / np.max(np.abs(audio)) * 0.85
wavfile.write("../neuropulse-spike-shapes.wav", SR, (audio * 32767).astype(np.int16))

fig, ax = plt.subplots(1, 3, figsize=(16, 5.2))
for name in names:
    rows = sw["shapes"][name]["rows"]; K = np.array([r["K"] for r in rows]); R = [r["R"] for r in rows]
    rs = sw["shapes"][name]["rise_samples"]
    ax[0].semilogx(K, R, "o-", color=COL[name], ms=4, label=NAME[name])
    ax[1].semilogx(K * rs, R, "o-", color=COL[name], ms=4, label=f"{name}: pulse {rs} samples")
    g, es, el = envs[name]
    ax[2].semilogx(g, el, color=COL[name], lw=2, label=f"{name} locked")
    ax[2].semilogx(g, es, color=COL[name], lw=1, ls="--")
ax[0].set_xlabel("coupling K"); ax[0].set_ylabel("synchrony R (0 = scattered, 1 = one voice)")
ax[0].set_title("Lock curves: the undershoot hardly matters;\nthe click needs ~10x the coupling")
ax[1].set_xlabel("charge each spike hands its neighbours  (K × pulse length)")
ax[1].set_title("Same curves against charge delivered:\nshort pulses lock with the least charge")
ax[2].set_xlabel("Hz"); ax[2].set_ylabel("dB (third-octave, each peak = 0)"); ax[2].set_ylim(-60, 3)
ax[2].set_title("Spectral shape, scattered (dashed) vs locked (solid):\neach shape keeps its colour; locking darkens all four")
for a in ax: a.grid(alpha=0.3); a.legend(fontsize=7.5, loc="lower right" if a is not ax[2] else "lower left")
plt.tight_layout(); plt.savefig("../spike-shape-findings.png", dpi=105)
