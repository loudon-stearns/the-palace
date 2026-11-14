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

Played from keys (play = keys; drone is everything above): mono, last note first,
as Simple Synth plays. The note sets f0. An amplitude envelope (a_*) and velocity
shape the loudness. A gesture envelope (g_attack in, g_release out, sustain 1)
carries the point from where B and K rest by g_stretch decades of B and g_coupling
Hz of K. A note that arrives from silence starts the tone over, as at load. In
both modes an orbit turns at o_rate: sine times o_stretch decades on B, cosine
times o_coupling Hz on K. With orbit and gesture at zero, B and K pass through
untouched, so drone is ride.py bit for bit.
"""
import math

import numpy as np

LN001 = -4.605170185988091   # log(0.01): an exponential stage covers 99 % in its time
MAX_HELD = 16


class Env:   # Simple Synth's envelope
    def __init__(self):
        self.stage, self.value = 0, 0.0   # 0 idle, 1 attack, 2 decay and sustain, 3 release

    def on(self):
        self.stage = 1

    def off(self):
        if self.stage != 0:
            self.stage = 3

    def next(self, a, d, s, r, sr):
        if self.stage == 1:
            self.value += 1.0 / (a * sr)
            if self.value >= 1.0:
                self.value, self.stage = 1.0, 2
        elif self.stage == 2:
            self.value = s + (self.value - s) * math.exp(LN001 / (d * sr))
        elif self.stage == 3:
            self.value *= math.exp(LN001 / (r * sr))
            if self.value < 1e-5:
                self.value, self.stage = 0.0, 0
        return self.value

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

    B0, K0, I, F0, V, L = (v[k] for k in ("B", "K", "inertia", "f0", "voices", "level"))
    q = {k: v[k].tolist() for k in ("play", "velocity", "a_attack", "a_decay", "a_sustain", "a_release",
                                    "g_attack", "g_release", "g_stretch", "g_coupling",
                                    "o_rate", "o_stretch", "o_coupling")}
    steps = len(B0)
    dt = 1 / sr
    p = np.zeros(N)
    PH0 = c[f"PH0_{N}"]
    ph = PH0.copy()
    Fp = F0[0]
    out = np.zeros((1, steps))
    probes = {k: np.zeros(steps) for k in ("fundamental", "B", "K", "f0", "amp")}

    held, current, vel, fresh, orbit = [], -1, 0.0, False, 0.0
    amp_env, gest_env = Env(), Env()
    events, e = list(notes), 0
    for i in range(steps):
        while e < len(events) and events[e][0] <= i:
            _, on, note, velocity = events[e]
            e += 1
            if on:
                if amp_env.stage == 0:
                    fresh = True
                if note in held:
                    held.remove(note)
                held.append(note)
                if len(held) > MAX_HELD:
                    held.pop(0)
                current, vel = note, velocity / 127.0
                amp_env.on()
                gest_env.on()
            else:
                if note in held:
                    held.remove(note)
                if note == current:
                    if held:
                        current = held[-1]
                    else:
                        amp_env.off()
                        gest_env.off()

        keys = q["play"][i] > 0.5
        f0 = 440.0 * math.pow(2.0, (current - 69) / 12.0) if keys and current >= 0 else float(F0[i])
        if fresh:
            fresh = False
            if keys:
                p[:] = 0.0
                ph = PH0.copy()
                Fp = f0
        aE, gE = 1.0, 0.0
        if keys:
            aE = amp_env.next(q["a_attack"][i], q["a_decay"][i], q["a_sustain"][i], q["a_release"][i], sr)
            gE = gest_env.next(q["g_attack"][i], 1.0, 1.0, q["g_release"][i], sr)
        os_, oc = math.sin(2.0 * math.pi * orbit), math.cos(2.0 * math.pi * orbit)
        orbit += q["o_rate"][i] * dt
        orbit -= math.floor(orbit)
        dec = gE * q["g_stretch"][i] + q["o_stretch"][i] * os_
        b = min(max(float(B0[i]) * math.pow(10.0, dec), 1e-7), 30.0) if dec != 0.0 else float(B0[i])
        kc = min(max(float(K0[i]) + gE * q["g_coupling"][i] + q["o_coupling"][i] * oc, 0.0), 20.0)

        w = n * f0 * DET
        r = n * np.sqrt((1 + b * n * n) / ((1 + b) if pinned else 1.0))
        gate = np.clip((4000.0 - np.abs(r * Fp - w)) / 1000.0, 0, 1)
        s = np.sin(2 * np.pi * (ph - p)) * gate
        dth = f0 + (BACK / I[i]) * kc * (r * s).sum()
        p += r * dth * dt
        ph += (w - kc * s) * dt
        p -= np.floor(p)     # wrapped, as the plugin must: unwrapped, the fastest partials' phases
        ph -= np.floor(ph)   # reach millions of cycles and lose precision (ride.py doesn't wrap)
        Fp = dth
        g = amp * np.clip((19000.0 - r * dth) / 3000.0, 0, 1)
        tone = g @ np.sin(2 * np.pi * (p + OFFS))
        vox = amp @ np.sin(2 * np.pi * ph) if V[i] > 0 else 0.0
        gain = 10.0 ** (L[i] / 20.0)
        if keys:
            gain *= aE * (1.0 - q["velocity"][i] * (1.0 - vel))
        out[0, i] = gain * NORM * (tone + V[i] * vox)
        for k, x in (("fundamental", dth), ("B", b), ("K", kc), ("f0", f0), ("amp", aE if keys else 1.0)):
            probes[k][i] = x
    return dict(out=out, probes=probes)
