"""sketch.py — Crystal Synthesizer, one sample at a time: the reference the plugin is
checked against (VST Template's contract: render(v, sr, inputs, notes)).

Eight voices. Each voice is a struck crystal: every phonon mode of the chosen
mineral is a two-pole resonator, knocked by one short raised-cosine pulse, and how
long it rings comes from the mineral's Raman line width (Q = line / width, so a
mode rings about Q/pi cycles at whatever pitch it plays). This is the ringing voice
of ../crystal-rings/crystal-ring-voice.codebox, made polyphonic in one engine and
given the two optical properties the earlier proofs rendered as separate files:

  BIREFRINGENCE. Every mode is two resonators, the ordinary ray and the
  extraordinary ray. The extraordinary one is tuned up by
      split = dn * spread * sin^2(angle)
  where dn is the mineral's real optical birefringence (0 for the cubic, isotropic
  minerals), angle is the direction you look through the crystal against its optic
  axis, and spread scales the physics (1 = the real dn). Along the axis (0 deg) the
  two rays agree, as light does; across it they part and beat. Ordinary leans left,
  extraordinary right, by Width.

  FIRE (dispersion, the prism in time). Each mode's strike arrives late by
      delay = fire * (D / 0.044) * log2(ratio)
  where D is the mineral's optical dispersion (B-G line, diamond = 0.044). Higher
  modes are "bluer" and slower, so a strike fans out into its partials the way a
  prism fans white light into colours. Diamond fans widest; fluorite barely.

The sketch follows Algorithm.h operation for operation. The per-sample resonator
update runs across all voices and modes at once with numpy (vectorised across
partials and voices, never across time, as the template allows); coefficients are
computed with math, the same libm the C++ calls.
"""
import math

import numpy as np

V = 8          # voices
K = 9          # modes per crystal (most use fewer)
M = 2 * K      # resonators per voice: ordinary rays 0..8, extraordinary 9..17
TWOPI = 6.283185307179586
MPI = 3.141592653589793
D_DIAMOND = 0.044

# Crystal tables — identical to Algorithm.h. Ratios as the playable crystal and the
# proofs (Crystal Sonification Reference); Q from ../crystal-rings/linewidths.json;
# dn (birefringence) and D (dispersion, B-G) are standard gemmological values.
# The two hypothesis slots take zircon's (tetragonal) and orthoclase's
# (monoclinic) optics, the examples the entry names for those systems.
RATIOS = [
    [1.00, 1.32, 1.48, 1.57, 1.65],                                # Diamond
    [1.00, 1.00, 1.35, 1.47, 1.69, 2.48],                          # Fluorite
    [1.00, 1.28, 1.41, 1.70, 1.85, 2.00],                          # Tetragonal (hypothesis)
    [1.00, 1.23, 1.47, 1.68, 2.13, 2.30, 3.33],                    # Emerald
    [1.00, 1.10, 1.14, 1.19, 1.52, 1.70, 1.98],                    # Ruby
    [1.00, 1.62, 2.07, 2.77, 3.13, 3.63, 5.45, 6.21, 8.32],        # Amethyst
    [1.00, 1.45, 1.91, 2.37, 2.96, 3.68, 4.80, 6.05],              # Topaz
    [1.00, 1.37, 1.71, 1.94, 2.23, 2.61],                          # Monoclinic (hypothesis)
    [1.00, 1.83, 3.17, 4.67, 7.00, 9.50, 13.3, 17.5],              # Labradorite
]
QS = [807.0, 27.0, 100.0, 57.0, 120.0, 62.0, 58.0, 100.0, 30.0]
DN = [0.0, 0.0, 0.059, 0.006, 0.008, 0.009, 0.010, 0.006, 0.009]
DISP = [0.044, 0.007, 0.039, 0.014, 0.018, 0.013, 0.014, 0.012, 0.012]

IDS = ["crystal", "hardness", "vel_bright", "velocity", "lifetime", "rolloff", "release",
       "angle", "spread", "fire", "width", "level"]


def ratio(c, k):
    r = RATIOS[c]
    return r[k] if k < len(r) else 0.0


def qual(c, k):
    if c == 5 and k == 1:
        return 17.0          # amethyst's soft mode, the alpha-beta remnant
    return QS[c]


def probe_names():
    names = ["split"]
    for i in range(V):
        names += [f"v{i}_hz", f"v{i}_amp", f"v{i}_age"]
    names += [f"m{k}" for k in range(K)]
    return names


class Engine:
    def __init__(self, sr):
        self.sr = sr
        self.y1 = np.zeros((V, M)); self.y2 = np.zeros((V, M))
        self.a1 = np.zeros((V, M)); self.a2 = np.zeros((V, M))
        self.b0 = np.zeros((V, M)); self.rr = np.zeros((V, M))
        self.env = np.zeros((V, M)); self.amk = np.zeros((V, M))
        self.delay = np.zeros((V, M))
        self.state = [0] * V; self.pending = [False] * V; self.held = [False] * V
        self.note = [-1] * V; self.pend_note = [0] * V; self.pend_vel = [0.0] * V
        self.hz = [0.0] * V; self.vel = [0.0] * V; self.rel = [0.0] * V
        self.age = [0] * V; self.pulse_n = [1] * V; self.pulse_end = [0] * V
        self.steal = [0] * V; self.steal_n = [1] * V; self.order = [0] * V
        self.last = [None] * V
        self.counter = 0

    # ── notes ──────────────────────────────────────────────────────────────────
    def note_on(self, note, velocity):
        pick = -1
        for i in range(V):
            if self.note[i] == note and (self.state[i] == 1 or self.pending[i]):
                pick = i; break
        if pick < 0:
            for i in range(V):
                if self.state[i] == 0 and not self.pending[i]:
                    pick = i; break
        if pick < 0:
            pick = 0
            for i in range(1, V):
                if self.order[i] < self.order[pick]:
                    pick = i
        i = pick
        self.counter += 1
        self.order[i] = self.counter
        self.note[i] = note; self.held[i] = True
        self.pend_note[i] = note; self.pend_vel[i] = velocity
        if not self.pending[i]:
            if self.state[i] == 1:
                self.steal_n[i] = max(1, int(math.floor(0.003 * self.sr)))
                self.steal[i] = self.steal_n[i]
            else:
                self.steal[i] = 0
        self.pending[i] = True

    def note_off(self, note):
        for i in range(V):
            if self.note[i] == note:
                self.held[i] = False

    # ── coefficients ───────────────────────────────────────────────────────────
    def coefs(self, i, c, life, roll, split):
        sr, hz = self.sr, self.hz[i]
        am = 1.0
        for k in range(K):
            r = ratio(c, k)
            fo = hz * r
            ok = r > 0.0 and fo < sr * 0.45
            for e in range(2):
                j = k + K * e
                f = fo * (1.0 + split) if e == 1 else fo
                if ok and f < sr * 0.45:
                    w = TWOPI * f / sr
                    R = math.exp(-MPI * f / (qual(c, k) * life * sr))
                    self.a1[i, j] = 2.0 * R * math.cos(w)
                    self.a2[i, j] = R * R
                    self.b0[i, j] = am * math.sin(w)
                    self.rr[i, j] = R
                    self.amk[i, j] = am
                else:
                    self.a1[i, j] = 0.0; self.a2[i, j] = 0.0; self.b0[i, j] = 0.0
                    self.rr[i, j] = 0.0; self.amk[i, j] = 0.0
            if ok:
                am *= roll
        self.last[i] = (c, life, roll, split)

    def strike(self, i, c, p):
        sr = self.sr
        self.y1[i] = 0.0; self.y2[i] = 0.0; self.env[i] = 0.0
        self.hz[i] = 440.0 * math.pow(2.0, (self.pend_note[i] - 69) / 12.0)
        self.vel[i] = self.pend_vel[i]
        self.rel[i] = 1.0
        self.age[i] = 0
        hard = p["hardness"] * math.pow(4.0, -p["vel_bright"] * (2.0 * self.vel[i] - 1.0))
        self.pulse_n[i] = max(1, int(math.floor(hard * 0.001 * sr)))
        self.state[i] = 1
        self.pending[i] = False
        spread_s = p["fire"] * 0.001 * (DISP[c] / D_DIAMOND)
        dmax = 0
        for k in range(K):
            r = ratio(c, k)
            d = int(math.floor(spread_s * math.log2(r) * sr)) if r > 0.0 else 0
            self.delay[i, k] = d; self.delay[i, k + K] = d
            dmax = max(dmax, d)
        self.pulse_end[i] = dmax + self.pulse_n[i]
        self.last[i] = None

    # ── one sample ─────────────────────────────────────────────────────────────
    def step(self, p):
        sr = self.sr
        c = min(max(int(p["crystal"]), 0), 8)
        s = math.sin(p["angle"] * (MPI / 180.0))
        split = DN[c] * p["spread"] * (s * s)
        life, roll = p["lifetime"], p["rolloff"]
        relk = math.exp(-1.0 / (p["release"] * sr))
        wd = p["width"]
        probes = np.zeros(1 + 3 * V + K)
        probes[0] = split

        fade = [1.0] * V
        for i in range(V):
            if self.pending[i]:
                if self.steal[i] > 0:
                    self.steal[i] -= 1
                    if self.steal[i] == 0:
                        self.strike(i, c, p)
                else:
                    self.strike(i, c, p)
            if self.steal[i] > 0:
                fade[i] = self.steal[i] / self.steal_n[i]
            if self.state[i] == 1 and self.last[i] != (c, life, roll, split):
                self.coefs(i, c, life, roll, split)

        # the resonators, every voice and mode at once (silent voices are all zero)
        age = np.array(self.age, dtype=np.float64)[:, None]
        ip = age - self.delay
        n = np.array(self.pulse_n, dtype=np.float64)[:, None]
        live = np.array([float(self.state[i]) for i in range(V)])[:, None]
        on = (ip >= 0.0) & (ip < n) & (live > 0.0)
        x = np.where(on, (1.0 - np.cos(TWOPI * (ip + 0.5) / n)) / n, 0.0)
        start = (ip == 0.0) & (live > 0.0)
        self.env = np.where(start, self.amk, self.env)
        y = self.b0 * x + self.a1 * self.y1 - self.a2 * self.y2
        self.y2 = self.y1
        self.y1 = y
        self.env = self.env * self.rr

        L = 0.0; R = 0.0
        mode = np.zeros(K)
        for i in range(V):
            if self.state[i] == 0:
                continue
            yo = 0.0; ye = 0.0; loud = 0.0
            for k in range(K):
                yo += y[i, k]
                ye += y[i, k + K]
                loud = max(loud, self.env[i, k], self.env[i, k + K])
            g = (1.0 - p["velocity"] * (1.0 - self.vel[i])) * self.rel[i] * 0.3 * fade[i]
            L += g * 0.5 * ((1.0 + wd) * yo + (1.0 - wd) * ye)
            R += g * 0.5 * ((1.0 - wd) * yo + (1.0 + wd) * ye)
            for k in range(K):
                mode[k] += g * 0.5 * (self.env[i, k] + self.env[i, k + K])
            probes[1 + 3 * i] = self.hz[i]
            probes[2 + 3 * i] = g * loud
            probes[3 + 3 * i] = self.age[i] / sr
            if not self.held[i]:
                self.rel[i] *= relk
            self.age[i] += 1
            if (self.age[i] >= self.pulse_end[i] and self.steal[i] == 0 and not self.pending[i]
                    and not self.held[i] and loud * self.rel[i] < 1e-4):
                self.state[i] = 0
                self.y1[i] = 0.0; self.y2[i] = 0.0; self.env[i] = 0.0
        probes[1 + 3 * V:] = mode
        gain = math.pow(10.0, p["level"] / 20.0)
        return math.tanh(gain * L), math.tanh(gain * R), probes


def render(v, sr, inputs=None, notes=()):
    steps = len(v["crystal"])
    eng = Engine(sr)
    out = np.zeros((2, steps))
    names = probe_names()
    pr = np.zeros((len(names), steps))
    ev = list(notes)
    e = 0
    cols = {k: np.asarray(v[k], dtype=np.float64) for k in IDS}
    for i in range(steps):
        while e < len(ev) and ev[e][0] <= i:
            smp, is_on, note, vel = ev[e]
            if is_on:
                eng.note_on(int(note), vel / 127.0)
            else:
                eng.note_off(int(note))
            e += 1
        p = {k: float(cols[k][i]) for k in IDS}
        out[0, i], out[1, i], pr[:, i] = eng.step(p)
    return dict(out=out, probes={n: pr[j] for j, n in enumerate(names)})
