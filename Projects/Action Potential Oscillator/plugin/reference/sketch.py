"""sketch.py — Action Potential: a crowd of Stage-4 neurons, every knob a mechanism.

The engine is neuropulse.dsp v0.4 (the Faust crowd, October 2026), rewritten one
sample at a time so src/Algorithm.h can follow it operation for operation.

  one neuron   the four-phase machine from neural_oscillator_dev_plan.md:
               0 charge     the membrane as a leaky capacitor, V ← V·a + drive.
                            The drive is recomputed every sample so the charge
                            reaches threshold in exactly what is left of the
                            period, from the voltage it really started at
                            (measured compensation, v0.4).
               1 rise       Na⁺ rushes in: V climbs to the spike's peak.
               2 fall       K⁺ rushes out: V drops to the undershoot.
               3 recovery   a damped spring back toward rest; underdamped, it
                            rings (the refractory growl). It may hand over to the
                            charge once the refractory time is up and V has come
                            back above 30 % of the undershoot.
  the crowd    1, 8, 16, 32 or 64 neurons, each with its own rate, leak and
               threshold, spread by a fixed hash (the Faust jitter). Crowd = 1 is
               the single neuron itself.
  coupling     every charging neuron gets K × (the share of the crowd in its
               rising phase one sample ago) added to its drive: pulse coupling
               through the mean field. Scaled by 44100 / sr so the total kick a
               spike gives is the same at any sample rate.
  pitch anchor a locked crowd plays its fastest member's pitch, so anchor 1
               shifts the spread down until that member sits on the note.
  the voice    mono, last note priority, glide; the crowd runs between notes,
               silent, so a note lands on a crowd already in motion.
  even level   an automatic gain (300 ms) that holds loudness as the crowd locks;
               off, the lock is also a swell.

Probes: sync (the crowd's agreement, 0..1, from each neuron's place in its own
period, refreshed every 32 samples), mf (the share spiking now), f0 (the glided
note), env, then for up to 32 shown neurons, ordered slowest to fastest, where
each sits in its own cycle: samples since it fired over its period (c00..c31).
A neuron's voltage moves too fast to draw at 60 frames a second; its place in
the cycle, measured against the crowd's, moves at the speed the crowd agrees,
which is what the CRT plays back in slow motion.
"""
import math

import numpy as np

NMAX = 64
SIZES = (1, 8, 16, 32, 64)
SHOW = 32
METER = 32
A1 = 0.8191725133961645           # golden-ratio step: where each neuron starts in its first period
LN001 = -4.605170185988091
TWO_PI = 2.0 * math.pi


def fract(x):
    return x - math.floor(x)


def jitter(i):
    """The Faust crowd's reproducible offset in [-1, 1]."""
    return fract(math.sin(i * 12.9898 + 78.233) * 43758.5453) * 2.0 - 1.0


class Crowd:
    def __init__(self, sr):
        self.sr = sr
        self.ksr = 44100.0 / sr
        self.agc_a = 1.0 - math.exp(-1.0 / (0.3 * sr))
        self.gain_a = 1.0 - math.exp(-1.0 / (0.045 * sr))

    def build(self, size_idx):
        n = SIZES[size_idx]
        self.size_idx, self.n = size_idx, n
        self.jr = [jitter(i) for i in range(n)]
        self.jt = [jitter(i + 101) for i in range(n)]
        self.jh = [jitter(i + 211) for i in range(n)]
        top = self.jr[0]
        for i in range(1, n):
            if self.jr[i] > top:
                top = self.jr[i]
        self.top = top
        # shown neurons: ranked slowest to fastest, evenly picked when the crowd is larger than the screen
        rank = [sum(1 for j in range(n) if self.jr[j] < self.jr[i]) for i in range(n)]
        order = [0] * n
        for i in range(n):
            order[rank[i]] = i
        d = min(n, SHOW)
        self.shown = [order[(k * n) // d] for k in range(d)]
        self.V = [0.0] * n
        self.ph = [0] * n
        self.t = [0] * n
        self.vel = [0.0] * n
        self.el = [int(math.floor(fract(0.5 + i * A1) * self.sr / 110.0)) for i in range(n)]
        self.v0 = [0.0] * n
        self.cyc = [0.0] * n
        self.mf = 0.0

    def reset(self, v0):
        self.build(int(v0["size"]))
        self.f0 = 110.0
        self.f0s = 110.0
        self.held, self.current, self.vel_in = [], -1, 0.0
        self.env_stage, self.env = 0, 0.0
        self.lvl = 1e-4
        self.gain = 1.0
        self.dcx = self.dcy = 0.0
        self.mcount = 0
        self.sync = 0.0

    def note_on(self, note, vel):
        if note in self.held:
            self.held.remove(note)
        self.held.append(note)
        if len(self.held) > 16:
            self.held.pop(0)
        self.current, self.vel_in = note, vel
        self.f0 = 440.0 * math.pow(2.0, (note - 69.0) / 12.0)
        self.env_stage = 1

    def note_off(self, note):
        if note in self.held:
            self.held.remove(note)
        if note == self.current:
            if self.held:
                self.current = self.held[-1]
                self.f0 = 440.0 * math.pow(2.0, (self.current - 69.0) / 12.0)
            elif self.env_stage != 0:
                self.env_stage = 2

    def step(self, v, k):
        sr = self.sr
        if int(v["size"][k]) != self.size_idx:
            self.build(int(v["size"][k]))

        # the amplifier: a straight attack, an exponential release
        if self.env_stage == 1:
            self.env += 1.0 / (v["attack"][k] * sr)
            if self.env >= 1.0:
                self.env, self.env_stage = 1.0, 3
        elif self.env_stage == 2:
            self.env *= math.exp(LN001 / (v["release"][k] * sr))
            if self.env < 1e-5:
                self.env, self.env_stage = 0.0, 0

        self.f0s += (self.f0 - self.f0s) * (1.0 - math.exp(-1.0 / (v["glide"][k] * sr + 1.0)))

        n = self.n
        tau_ms, spike_ms, rise_fr = v["leak"][k], v["spike"][k], v["rise"][k]
        peak, hyp, damp, refr_ms = v["peak"][k], v["hyp"][k], v["damp"][k], v["refr"][k]
        hf, htau, hthr = v["spread"][k], v["leakspread"][k], v["thrspread"][k]
        fbase = self.f0s / (1.0 + v["anchor"][k] * hf * self.top)
        spike_s = max(2.0, spike_ms * 0.001 * sr)
        rise_s = max(1.0, spike_s * rise_fr)
        fall_s = max(1.0, spike_s - rise_s)
        refr_s = max(1.0, refr_ms * 0.001 * sr)
        kick = v["couple"][k] * self.ksr * self.mf
        span = peak - hyp
        tick = self.mcount + 1 >= METER

        V, ph, t, vel, el, v0, cyc = self.V, self.ph, self.t, self.vel, self.el, self.v0, self.cyc
        jr, jt, jh = self.jr, self.jt, self.jh
        s = 0.0
        spk = 0
        cx = cy = 0.0
        for i in range(n):
            my_freq = max(1.0, fbase * (1.0 + hf * jr[i]))
            my_tau = max(0.1, tau_ms * (1.0 + htau * jt[i]))
            thr = max(0.1, 1.0 + hthr * jh[i])
            leak_tau = max(2.0, my_tau * 0.001 * sr)
            a = 1.0 - 1.0 / leak_tau
            period = sr / my_freq
            p, Vi, ti = ph[i], V[i], t[i]
            nvel = 0.0
            if p == 0:
                m = max(1.0, period - (el[i] - ti) - 0.5)
                c = math.pow(a, m)
                drive = (thr - v0[i] * c) / (leak_tau * (1.0 - c)) + kick
                cv = Vi * a + drive
                if cv >= thr:
                    nV, nph = thr, 1
                else:
                    nV, nph = cv, 0
            elif p == 1:
                nV = min(peak, Vi + (peak - thr) / rise_s)
                nph = 2 if ti + 1 >= rise_s else 1
            elif p == 2:
                nV = max(hyp, Vi + (hyp - peak) / fall_s)
                nph = 3 if ti + 1 >= fall_s else 2
            else:
                spring_k = 1.0 / leak_tau
                accel = -spring_k * Vi - damp * 2.0 * math.sqrt(spring_k) * vel[i]
                rv = vel[i] + accel
                nV = Vi + rv
                nph = 0 if (ti + 1 >= refr_s and Vi > hyp * 0.3) else 3
                if nph == 3:
                    nvel = rv
            t[i] = 0 if nph != p else ti + 1
            vel[i] = nvel
            el[i] = 0 if (p == 0 and nph == 1) else el[i] + 1
            if p == 3 and nph == 0:
                v0[i] = nV
            V[i] = nV
            ph[i] = nph
            x = (nV - hyp) / span
            s += x * 2.0 - 1.0
            if nph == 1:
                spk += 1
            cyc[i] = el[i] / period
            if tick:
                ang = TWO_PI * cyc[i]
                cx += math.cos(ang)
                cy += math.sin(ang)
        self.mf = spk / n
        if tick:
            self.mcount = 0
            self.sync = math.sqrt(cx * cx + cy * cy) / n
        else:
            self.mcount += 1

        y = s / n
        dc = y - self.dcx + 0.995 * self.dcy
        self.dcx, self.dcy = y, dc
        y = dc
        self.lvl += (y * y - self.lvl) * self.agc_a
        g = min(40.0, 0.16 / math.sqrt(self.lvl + 1e-9)) if v["even"][k] > 0.5 else 0.5
        self.gain += (g - self.gain) * self.gain_a
        amp = math.pow(10.0, v["level"][k] / 20.0) * (1.0 - v["velocity"][k] * (1.0 - self.vel_in)) * self.env
        return math.tanh(y * self.gain * amp)


def render(v, sr, inputs=None, notes=()):
    steps = len(v["level"])
    out = np.zeros((1, steps))
    names = ["sync", "mf", "f0", "env"] + [f"c{b:02d}" for b in range(SHOW)]
    pr = np.zeros((len(names), steps))
    cr = Crowd(sr)
    cr.reset({key: a[0] for key, a in v.items()})
    pv = {key: a.tolist() for key, a in v.items()}
    events, e = list(notes), 0
    for i in range(steps):
        while e < len(events) and events[e][0] <= i:
            _, on, note, vel = events[e]
            e += 1
            if on:
                cr.note_on(note, vel / 127.0)
            else:
                cr.note_off(note)
        out[0, i] = cr.step(pv, i)
        pr[0, i], pr[1, i], pr[2, i], pr[3, i] = cr.sync, cr.mf, cr.f0s, cr.env
        for b, j in enumerate(cr.shown):
            pr[4 + b, i] = cr.cyc[j]
    return dict(out=out, probes={nm: pr[j] for j, nm in enumerate(names)})
