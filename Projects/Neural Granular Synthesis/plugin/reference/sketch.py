"""sketch.py — Neural Granular: a crowd of neurons whose agreement is the timbre.

The same model as the workshop's crowd_engine.js (cycles 8–16), one sample at a
time so src/Algorithm.h can follow it operation for operation.

  the crowd    N phase neurons (32, 64, 128 or 256). Each runs at the note's
               rate times (1 + spread · offset), plus the Kuramoto pull of the
               crowd's mean field. Every wrap past 2π is a spike, and every
               spike is a prescribed 1.6 ms action potential (rise, fall,
               undershoot), placed at its sub-sample time.
  tightness    T = K / (4σ/π): coupling per unit of disorder. A crowd with no
               pacemakers locks at T = 1; with a share p of pacemakers, at 1/(1−p).
  life         p, the pacemaker share: they fire at their own rate, ignore the
               pull, and still count in the field. Pacemakers are chosen in a
               fixed order, so the set at 20 % contains the set at 10 %.
  spread       σ, how far apart the natural rates are.
  lumpiness    L: each neuron's place in the spread is the even (golden-ratio)
               place nudged by L·(draw − ½), wrapped back into the spread. The
               overall spread never changes, only how evenly it is covered:
               L = 0 locks like a switch, L = 1 arrives softly (cycle 15).
               Starting phases are nudged the same way, once, at reset.
  the voice    mono, last note priority: a note sets the pitch (with glide) and
               opens the amplifier. The crowd runs between notes, silent, so a
               note lands on a crowd already in motion.
  even level   an automatic gain (300 ms) that holds loudness as the crowd
               locks; off, the lock is also a swell.

Probes: sync (the whole crowd's agreement, 0..1), core (the followers' agreement),
f0 (the glided pitch), env (the amplifier), fire (spikes per neuron per period,
smoothed), then two 24-bin histograms of where the followers (f00..f23) and the
pacemakers (p00..p23) sit around the crowd's mean phase, as shares of the crowd,
refreshed every 32 samples. The CRT draws from the histograms.
"""
import math

import numpy as np

NMAX = 256
SIZES = (32, 64, 128, 256)
RING = 4096                       # spike accumulator, a power of two
A1 = 0.8191725133961645           # golden-ratio steps: rates, pacemaker order, phases
A2 = 0.6710436067037893
A3 = 0.5497004779019703
BINS = 24
METER = 32
LN001 = -4.605170185988091
TWO_PI = 2.0 * math.pi


def constants():
    rng = np.random.default_rng(20261107)
    return dict(u_rate=rng.random(NMAX), u_phase=rng.random(NMAX))


_C = constants()
U_RATE = _C["u_rate"].tolist()
U_PHASE = _C["u_phase"].tolist()


def fract(x):
    return x - math.floor(x)


def spike_shape(width, sr):
    n = max(8, int(math.floor(0.0016 * width * sr + 0.5)))
    n = min(n, RING // 2 - 2)
    s = [0.0] * (n + 2)
    mean = 0.0
    for k in range(n):
        t = k / sr / width
        a = (t - 0.00035) / 0.00012
        b = (t - 0.0006) / 0.0002
        c = (t - 0.0011) / 0.00028
        s[k] = 0.6 * math.exp(-(a * a)) + 0.5 * math.exp(-(b * b)) - 0.28 * math.exp(-(c * c))
        mean += s[k]
    mean /= n
    for k in range(n):
        s[k] -= mean
    return s, n


class Crowd:
    def __init__(self, sr):
        self.sr = sr
        self.agc_a = 1.0 - math.exp(-1.0 / (0.3 * sr))
        self.gain_a = 1.0 - math.exp(-1.0 / (0.045 * sr))
        self.fire_a = 1.0 - math.exp(-1.0 / (0.02 * sr))

    def build(self, size_idx, lump):
        n = SIZES[size_idx]
        self.size_idx, self.n = size_idx, n
        self.lump = lump
        self.jit = [2.0 * fract(0.5 + i * A1 + lump * (U_RATE[i] - 0.5)) - 1.0 for i in range(n)]
        self.th = [TWO_PI * fract(0.5 + i * A3 + lump * (U_PHASE[i] - 0.5)) for i in range(n)]
        self.c = [math.cos(t) for t in self.th]
        self.s = [math.sin(t) for t in self.th]
        pu = [fract(0.5 + i * A2) for i in range(n)]
        self.pace_rank = [sum(1 for j in range(n) if pu[j] < pu[i]) for i in range(n)]
        sx = sy = 0.0
        for i in range(n):
            sx += self.c[i]
            sy += self.s[i]
        self.sx, self.sy = sx, sy
        self.clock = 0

    def reset(self, v0):
        self.acc = [0.0] * RING
        self.pos = 0
        self.width = v0["width"]
        self.spike, self.spike_n = spike_shape(self.width, self.sr)
        self.build(int(v0["size"]), v0["lump"])
        self.f0 = 110.0
        self.f0s = 110.0
        self.held, self.current, self.vel = [], -1, 0.0
        self.env_stage, self.env = 0, 0.0
        self.lvl = 1e-4
        self.gain = 1.0
        self.dcx = self.dcy = 0.0
        self.fire = 0.0
        self.mcount = 0
        self.r_core = 0.0
        self.hist_f = [0.0] * BINS
        self.hist_p = [0.0] * BINS

    def note_on(self, note, vel):
        if note in self.held:
            self.held.remove(note)
        self.held.append(note)
        if len(self.held) > 16:
            self.held.pop(0)
        self.current, self.vel = note, vel
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

    def meter(self, listen_m):
        n, th, c, s, rank = self.n, self.th, self.c, self.s, self.pace_rank
        cx = cy = 0.0
        nf = 0
        for i in range(n):
            if rank[i] >= listen_m:
                cx += c[i]
                cy += s[i]
                nf += 1
        self.r_core = math.sqrt(cx * cx + cy * cy) / nf if nf > 0 else 0.0
        psi = math.atan2(self.sy, self.sx)
        hf, hp = [0.0] * BINS, [0.0] * BINS
        w = 1.0 / n
        for i in range(n):
            rel = th[i] - psi
            rel -= TWO_PI * math.floor(rel / TWO_PI)
            b = int(rel * (BINS / TWO_PI))
            if b > BINS - 1:
                b = BINS - 1
            if rank[i] >= listen_m:
                hf[b] += w
            else:
                hp[b] += w
        self.hist_f, self.hist_p = hf, hp

    def step(self, v, i_):
        sr = self.sr
        # the shape of the crowd: size restarts it, lumpiness re-places the rates, width re-draws the spike
        if int(v["size"][i_]) != self.size_idx:
            self.build(int(v["size"][i_]), v["lump"][i_])
        lump = v["lump"][i_]
        if lump != self.lump:
            self.lump = lump
            jit = self.jit
            for i in range(self.n):
                jit[i] = 2.0 * fract(0.5 + i * A1 + lump * (U_RATE[i] - 0.5)) - 1.0
        if v["width"][i_] != self.width:
            self.width = v["width"][i_]
            self.spike, self.spike_n = spike_shape(self.width, sr)

        # the amplifier: a straight attack, an exponential release
        if self.env_stage == 1:
            self.env += 1.0 / (v["attack"][i_] * sr)
            if self.env >= 1.0:
                self.env, self.env_stage = 1.0, 3
        elif self.env_stage == 2:
            self.env *= math.exp(LN001 / (v["release"][i_] * sr))
            if self.env < 1e-5:
                self.env, self.env_stage = 0.0, 0

        self.f0s += (self.f0 - self.f0s) * (1.0 - math.exp(-1.0 / (v["glide"][i_] * sr + 1.0)))
        n = self.n
        sig = v["spread"][i_]
        kk = v["tight"][i_] * 4.0 * sig / math.pi
        listen_m = int(math.floor(v["life"][i_] * n + 0.5))
        w0 = TWO_PI * self.f0s
        kabs = kk * w0
        zx, zy = self.sx / n, self.sy / n
        dt = 1.0 / sr
        th, c, s, jit, rank = self.th, self.c, self.s, self.jit, self.pace_rank
        acc, sp, ln, pos = self.acc, self.spike, self.spike_n, self.pos
        resync = (self.clock & 63) == 0
        sx = sy = 0.0
        fired = 0
        for i in range(n):
            pull = kabs * (zy * c[i] - zx * s[i]) if rank[i] >= listen_m else 0.0
            d = (w0 * (1.0 + sig * jit[i]) + pull) * dt
            t = th[i] + d
            if t >= TWO_PI:
                t -= TWO_PI
                frac = t / d if d > 0.0 else 0.0
                for j in range(ln):
                    x = j - frac + 1.0
                    x0 = int(math.floor(x))
                    f = x - x0
                    if x0 >= 0 and x0 + 1 < ln + 2:
                        k = (pos + j) & (RING - 1)
                        acc[k] += sp[x0] * (1.0 - f) + sp[x0 + 1] * f
                fired += 1
            th[i] = t
            if resync:
                c[i] = math.cos(t)
                s[i] = math.sin(t)
            else:
                d2 = d * d
                cd = 1.0 - d2 * 0.5
                sd = d - d2 * d / 6.0
                ci = c[i]
                c[i] = ci * cd - s[i] * sd
                s[i] = ci * sd + s[i] * cd
            sx += c[i]
            sy += s[i]
        self.sx, self.sy = sx, sy

        y = acc[pos]
        acc[pos] = 0.0
        self.pos = (pos + 1) & (RING - 1)
        y /= math.sqrt(n)
        dc = y - self.dcx + 0.995 * self.dcy
        self.dcx, self.dcy = y, dc
        y = dc
        self.lvl += (y * y - self.lvl) * self.agc_a
        g = min(40.0, 0.16 / math.sqrt(self.lvl + 1e-9)) if v["even"][i_] > 0.5 else 0.35
        self.gain += (g - self.gain) * self.gain_a
        amp = math.pow(10.0, v["level"][i_] / 20.0) * (1.0 - v["velocity"][i_] * (1.0 - self.vel)) * self.env
        out = math.tanh(y * self.gain * amp)

        self.fire += (fired * sr / (n * self.f0s) - self.fire) * self.fire_a
        self.clock += 1
        self.mcount += 1
        if self.mcount >= METER:
            self.mcount = 0
            self.meter(listen_m)
        return out, math.sqrt(sx * sx + sy * sy) / n


def render(v, sr, inputs=None, notes=()):
    steps = len(v["level"])
    out = np.zeros((1, steps))
    names = ["sync", "core", "f0", "env", "fire"] + [f"f{b:02d}" for b in range(BINS)] + [f"p{b:02d}" for b in range(BINS)]
    pr = np.zeros((len(names), steps))
    cr = Crowd(sr)
    cr.reset({k: a[0] for k, a in v.items()})
    pv = {k: a.tolist() for k, a in v.items()}
    events, k = list(notes), 0
    for i in range(steps):
        while k < len(events) and events[k][0] <= i:
            _, on, note, vel = events[k]
            k += 1
            if on:
                cr.note_on(note, vel / 127.0)
            else:
                cr.note_off(note)
        o, sync = cr.step(pv, i)
        out[0, i] = o
        pr[0, i], pr[1, i], pr[2, i], pr[3, i], pr[4, i] = sync, cr.r_core, cr.f0s, cr.env, cr.fire
        pr[5:5 + BINS, i] = cr.hist_f
        pr[5 + BINS:, i] = cr.hist_p
    return dict(out=out, probes={nm: pr[j] for j, nm in enumerate(names)})
