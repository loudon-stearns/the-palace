#!/usr/bin/env python3
"""Frustrated coupling, by ear. Daily Page rough, 2026-10-17.

The page's model, taken literally: one oscillator with phase theta whose partial n
sits at r_n * theta. Six outside oscillators, one near each harmonic position n*f0,
each coupled to the participant's partial n (Kuramoto / Adler form):

    d(phi_n)/dt  = w_n + K * sin(r_n*theta - phi_n)
    d(theta)/dt  = w0  + (1/I) * sum_n K * r_n * sin(phi_n - r_n*theta)

r_n = n * sqrt(1 + B n^2) (stiff-string stretch). B = 0 is harmonic.
I is the participant's inertia: 1 = low-inertia participant, 60 = high-inertia master.
Each scene: 6 s. We hear the participant's partials (louder) plus the outside six.
"""
import numpy as np, json, sys, os
from scipy.io import wavfile

SR, CR = 44100, 4410            # audio rate, control rate
F0, N, K = 110.0, 6, 6.0        # Hz, partials, coupling (Hz)
rng = np.random.default_rng(7)
DETUNE = 1 + rng.uniform(-0.004, 0.004, N)   # outside players a hair off n*f0

def scene(B, inertia, secs=6.0):
    n = np.arange(1, N + 1)
    r = n * np.sqrt(1 + B * n**2)
    w = n * F0 * DETUNE                # outside players' own frequencies (Hz)
    steps = int(secs * CR); dt = 1 / CR
    th = 0.0; ph = rng.uniform(0, 1, N)   # phases in cycles
    TH = np.empty(steps); PH = np.empty((steps, N)); FINST = np.empty(steps)
    for i in range(steps):
        d = ph - r * th
        s = np.sin(2 * np.pi * d)
        dth = F0 + (K * (r * s).sum()) / inertia
        dph = w - K * s
        th += dth * dt; ph += dph * dt
        TH[i] = th; PH[i] = ph; FINST[i] = dth
    t_c = np.arange(steps) / CR; t_a = np.arange(int(secs * SR)) / SR
    th_a = np.interp(t_a, t_c, TH)
    amp = 1 / n
    part = sum(amp[k] * np.sin(2*np.pi*r[k]*th_a) for k in range(N))
    out = sum(amp[k] * np.sin(2*np.pi*np.interp(t_a, t_c, PH[:, k])) for k in range(N))
    y = 0.6 * part + 0.35 * out
    env = np.minimum(1, np.minimum(t_a / 0.05, (secs - t_a) / 0.3))
    return y * env, FINST, r

def main(outdir):
    scenes = [("harmonic, low inertia", 0.0, 1), ("slight stretch (piano-ish), low inertia", 0.0004, 1),
              ("strong stretch, low inertia", 0.004, 1), ("bell-wide stretch, low inertia", 0.02, 1),
              ("bell-wide stretch, high-inertia master", 0.02, 60)]
    gap = np.zeros(int(0.6 * SR)); audio = []; report = []
    for name, B, I in scenes:
        y, f, r = scene(B, I)
        audio += [y, gap]
        tail = f[len(f)//2:]
        report.append(dict(scene=name, B=B, inertia=I, ratios=[round(x, 3) for x in r],
                           fundamental_mean_hz=round(float(tail.mean()), 2),
                           fundamental_wander_hz=round(float(tail.std()), 3)))
    a = np.concatenate(audio); a = a / np.abs(a).max() * 0.85
    wavfile.write(os.path.join(outdir, "frustration-five-scenes.wav"), SR, (a * 32767).astype(np.int16))
    json.dump(report, open(os.path.join(outdir, "frustration-report.json"), "w"), indent=1)
    for r_ in report: print(r_)

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
