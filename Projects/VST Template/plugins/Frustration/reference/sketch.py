"""sketch.py — the frustration model: the reference the Frustration plugin is checked against.

A copy of the per-sample body of ride.py and ride_warm.py in
Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ (frozen;
nothing there is edited). One tone of N partials shares a fundamental; N outside
voices tuned to the plain harmonic series pull on its partials. Stretch B bends
the partials away from whole-number ratios, coupling K sets how hard the voices
pull. What ride.py fixed, the plugin opens up as knobs:

  inertia  divides the back-pull on the tone (1 = ride.py; frustration.py's I)
  f0       the tone's pitch and the voices' tuning (110 Hz in ride.py)
  voices   how much of the outside voices is heard (ride.py's "-alone" renders = 0)
  level    output level in dB, after a fixed normalisation by the partials' amplitudes
  partials N = 40, 64 or 96
  pinned   partial 1 held at ratio 1 (ride-string-bar)
  source   bright (ride.py: amplitude n^-0.7, phase 0) or
           warm (ride_warm.py: 1/n rolled off above the 4th, random phase offsets)

With inertia 1, f0 110, voices 0 and the source and N of the original, the tone is
ride.py's tone times the output gain. One change from ride.py: the phases are
wrapped to [0, 1) each sample. That is the same model (only the phases' sines are
used), and a more exact reference: with partial 1 pinned and B near 30 the top
partials race at about 176 kHz, and unwrapped phases drifted 1.4e-6 of peak from
wrapped ones within 21 s (proofs, 2026-10-20).
"""
import numpy as np

NS = (40, 64, 96)
NORM_GAIN = 2.0   # output = level * NORM_GAIN / sum(amplitudes) * (tone + voices * vox)


def amplitudes(n, warm):
    return 1.0 / n * np.minimum(1, 4.0 / n) if warm else n ** -0.7


def constants():
    c = {}
    for N in NS:
        rng = np.random.default_rng(7)                       # ride.py: DET, then the voices' starting phases
        c[f"DET_{N}"] = 1 + rng.uniform(-0.004, 0.004, N)
        c[f"PH0_{N}"] = rng.uniform(0, 1, N)
        c[f"OFFS_{N}"] = np.random.default_rng(11).uniform(0, 1, N)   # ride_warm.py's phase offsets
    return c


def render(v, sr, inputs=None, notes=()):
    N = NS[int(v["partials"][0])]
    pinned = v["pinned"][0] > 0.5
    warm = int(v["source"][0]) == 1
    c = constants()
    n = np.arange(1, N + 1)
    amp = amplitudes(n, warm)
    OFFS = c[f"OFFS_{N}"] if warm else np.zeros(N)
    BACK = 21.0 / n.sum()
    NORM = NORM_GAIN / amp.sum()
    DET = c[f"DET_{N}"]

    B, K, I, F0, V, L = (v[k] for k in ("B", "K", "inertia", "f0", "voices", "level"))
    steps = len(B)
    dt = 1 / sr
    p = np.zeros(N)
    ph = c[f"PH0_{N}"].copy()
    Fp = F0[0]
    out = np.zeros((1, steps))
    fund = np.zeros(steps)
    for i in range(steps):
        w = n * F0[i] * DET
        r = n * np.sqrt((1 + B[i] * n * n) / ((1 + B[i]) if pinned else 1.0))
        gate = np.clip((4000.0 - np.abs(r * Fp - w)) / 1000.0, 0, 1)
        s = np.sin(2 * np.pi * (ph - p)) * gate
        dth = F0[i] + (BACK / I[i]) * K[i] * (r * s).sum()
        p += r * dth * dt
        ph += (w - K[i] * s) * dt
        p -= np.floor(p)     # wrapped, as the plugin must: unwrapped, the fastest partials' phases
        ph -= np.floor(ph)   # reach millions of cycles and lose precision (ride.py doesn't wrap)
        Fp = dth
        g = amp * np.clip((19000.0 - r * dth) / 3000.0, 0, 1)
        tone = g @ np.sin(2 * np.pi * (p + OFFS))
        vox = amp @ np.sin(2 * np.pi * ph) if V[i] > 0 else 0.0
        out[0, i] = 10.0 ** (L[i] / 20.0) * NORM * (tone + V[i] * vox)
        fund[i] = dth
    return dict(out=out, probes={"fundamental": fund})
