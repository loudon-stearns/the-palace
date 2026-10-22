"""sketch.py — Belief Cloud: the Bayesian grain cloud, one sample at a time, in
VST Template's shape (`render(v, sr, inputs, notes)`), so src/Algorithm.h can
follow it operation for operation.

The idea (Projects/Bayesian Granular Synthesizer.md): the notes you hold are
evidence, and every grain draws its pitch from what the cloud currently believes.

  prior      a curve over pitch, 630 bins of 10 cents (MIDI 33..96). It is the
             flat line bent by two things: a register hill (centre `register`,
             width `register_width` octaves), and, by `prior_shape`, twelve
             pitch-class weights (`pc_c` .. `pc_b`), each key a Gaussian hill
             `hill_width` cents wide on a 0.02 floor (the painter's rule from
             bayes_engine.js). Rebuilt at a control tick only when one of its
             sixteen parameters has moved.
  evidence   up to 16 notes, each in a fixed slot: weight w and log-width ls.
             Held, w rises toward 1 - velocity*(1 - vel) with time constant
             `press`, and the width narrows from `width_start` toward
             `width_floor` with `time_to_believe` (exponential in log-cents).
             Released, w decays with `let_go` and the width blurs back with
             `forget`; below w = 0.001 the slot is freed. A full table evicts
             the weakest released note, else the weakest held one.
  posterior  doubt * prior/sum(prior) + the bumps. A grain first picks prior or
             a note in proportion to mass (doubt against each w), then draws
             inside it: a prior bin by its cumulative sum, or a Gaussian around
             the note, sigma = its width.
  length     cycles = shortest * (longest/shortest)^gate, gate = the largest of
             each note's closeness exp(-d²/2) (d in units of `near` cents)
             * w * conviction, and prior_tone * tone(bin) (the prior's own
             peaks, cycle 3's prior tone). Conviction = how far the width has
             come from start to floor, in log-cents, 0..1.
  grain      1-cycle Hann in, sustain, 1-cycle Hann out; amplitude
             sqrt(0.06/rate) * sqrt(f/(cycles+1)) (equal energy); random phase;
             equal-power pan inside `spread`. Up to 640 sound at once.
  timing     Poisson onsets at `rate` per second; the belief evolves every 64
             samples (a control tick), the grains every sample.
  output     stereo, tanh(level * sum).

Random numbers come from one 32-bit generator (mulberry32), seeded 12345 at
reset, so the plugin draws exactly the grains the sketch draws.
"""
import math

import numpy as np

LO, BIN_C, B = 33, 10, 630          # MIDI 33..96 in 10-cent bins
MAX_NOTES = 16
MAX_VOICES = 640
CTL = 64                            # samples per control tick
TN = 4096                           # sine table
SEED = 12345
PRIOR_IDS = ["prior_shape", "hill_width", "register", "register_width",
             "pc_c", "pc_cs", "pc_d", "pc_ds", "pc_e", "pc_f", "pc_fs", "pc_g", "pc_gs", "pc_a", "pc_as", "pc_b"]
M32 = 0xFFFFFFFF


class Rng:
    def __init__(self, seed):
        self.s = seed & M32

    def next(self):
        self.s = (self.s + 0x6D2B79F5) & M32
        t = self.s
        t = ((t ^ (t >> 15)) * (t | 1)) & M32
        t = (t ^ ((t + (((t ^ (t >> 7)) * (t | 61)) & M32)) & M32)) & M32
        return (t ^ (t >> 14)) / 4294967296.0


class Cloud:
    def __init__(self, sr, v0):
        self.sr = sr
        self.tab = [math.sin(2.0 * math.pi * i / TN) for i in range(TN + 1)]
        self.rng = Rng(SEED)
        self.prior = [0.0] * B
        self.cdf = [0.0] * B
        self.tone = [0.0] * B
        self.prior_sum = 0.0
        self.prior_key = None
        # note slots
        self.active = [False] * MAX_NOTES
        self.held = [False] * MAX_NOTES
        self.midi = [0] * MAX_NOTES
        self.vel = [0.0] * MAX_NOTES
        self.w = [0.0] * MAX_NOTES
        self.ls = [0.0] * MAX_NOTES
        self.sig = [0.0] * MAX_NOTES
        self.conv = [0.0] * MAX_NOTES
        self.sum_w = 0.0
        self.prior_share = 1.0
        self.last_lw = math.log(v0["width_start"])
        self.last_sig = v0["width_start"]
        # voices
        self.v_ph, self.v_inc = [0.0] * MAX_VOICES, [0.0] * MAX_VOICES
        self.v_pos, self.v_len, self.v_fade = [0] * MAX_VOICES, [0] * MAX_VOICES, [0] * MAX_VOICES
        self.v_l, self.v_r = [0.0] * MAX_VOICES, [0.0] * MAX_VOICES
        self.nv = 0
        self.next = 0.0
        self.ctl = 0
        self.dropped = 0
        self.mean_cycles = 4.0
        self.grain_note, self.grain_cycles = 0.0, 0.0
        self.build_prior(v0)

    # ---- the prior
    def build_prior(self, v):
        key = tuple(v[k] for k in PRIOR_IDS)
        if key == self.prior_key:
            return
        self.prior_key = key
        shape, width, reg, regw = key[0], key[1], key[2], key[3]
        pc = key[4:]
        a, mx = 0.0, 0.0
        for i in range(B):
            m = LO + (i + 0.5) * BIN_C / 100.0
            h = 0.02
            base = int(math.floor(m)) - LO
            for k in range(max(0, base - 3), min(63, base + 3) + 1):
                dist = m - (LO + k)
                if abs(dist) < 3.0:
                    d = dist * 100.0 / width
                    h += pc[(LO + k) % 12] * math.exp(-0.5 * d * d)
            r = (m - reg) / (12.0 * regw)
            p = math.exp(-0.5 * r * r) * ((1.0 - shape) + shape * h)
            self.prior[i] = p
            a += p
            self.cdf[i] = a
            if p > mx:
                mx = p
        self.prior_sum = a
        mean = a / B
        for i in range(B):
            t = 0.0
            if mx > mean * 1.05:
                t = (self.prior[i] - mean) / (mx - mean)
                t = 0.0 if t < 0.0 else (1.0 if t > 1.0 else t)
            self.tone[i] = t

    # ---- the evidence
    def note_on(self, note, vel):
        for j in range(MAX_NOTES):
            if self.active[j] and self.midi[j] == note:
                self.held[j], self.vel[j] = True, vel
                return
        slot = -1
        for j in range(MAX_NOTES):
            if not self.active[j]:
                slot = j
                break
        if slot < 0:
            for want_held in (False, True):
                best = 2.0
                for j in range(MAX_NOTES):
                    if self.held[j] == want_held and self.w[j] < best:
                        best, slot = self.w[j], j
                if slot >= 0:
                    break
            self.sum_w -= self.w[slot]
        self.active[slot], self.held[slot], self.midi[slot], self.vel[slot] = True, True, note, vel
        self.w[slot], self.ls[slot], self.sig[slot], self.conv[slot] = 0.0, self.last_lw, self.last_sig, 0.0

    def note_off(self, note):
        for j in range(MAX_NOTES):
            if self.active[j] and self.midi[j] == note:
                self.held[j] = False

    def evolve(self, v):
        dt = CTL / self.sr
        k_on = 1.0 - math.exp(-dt / v["press"])
        d_off = math.exp(-dt / v["let_go"])
        k_f = 1.0 - math.exp(-dt / v["time_to_believe"])
        k_b = 1.0 - math.exp(-dt / v["forget"])
        lw, lf = math.log(v["width_start"]), math.log(v["width_floor"])
        vs = v["velocity"]
        self.last_lw, self.last_sig = lw, v["width_start"]
        s = 0.0
        for j in range(MAX_NOTES):
            if not self.active[j]:
                continue
            if self.held[j]:
                target = 1.0 - vs * (1.0 - self.vel[j])
                self.w[j] += (target - self.w[j]) * k_on
                self.ls[j] += (lf - self.ls[j]) * k_f
            else:
                self.w[j] *= d_off
                self.ls[j] += (lw - self.ls[j]) * k_b
                if self.w[j] < 1e-3:
                    self.active[j], self.held[j], self.w[j] = False, False, 0.0
                    continue
            self.sig[j] = math.exp(self.ls[j])
            c = (lw - self.ls[j]) / (lw - lf)
            self.conv[j] = 0.0 if c < 0.0 else (1.0 if c > 1.0 else c)
            s += self.w[j]
        self.sum_w = s
        self.prior_share = v["doubt"] / (v["doubt"] + s)

    # ---- one grain
    def gauss(self):
        u = 0.0
        while u == 0.0:
            u = self.rng.next()
        return math.sqrt(-2.0 * math.log(u)) * math.cos(2.0 * math.pi * self.rng.next())

    def draw(self, v):
        doubt = v["doubt"]
        z = doubt + self.sum_w
        any_note = any(self.active)
        u = self.rng.next() * z
        if u < doubt or not any_note:
            t = self.rng.next() * self.prior_sum
            a, b = 0, B - 1
            while a < b:
                c = (a + b) >> 1
                if self.cdf[c] < t:
                    a = c + 1
                else:
                    b = c
            midi = LO + (a + self.rng.next()) * BIN_C / 100.0
        else:
            u -= doubt
            pick = -1
            for j in range(MAX_NOTES):
                if not self.active[j]:
                    continue
                pick = j
                if u < self.w[j]:
                    break
                u -= self.w[j]
            midi = self.midi[pick] + self.gauss() * self.sig[pick] / 100.0
        best = 0.0
        near = v["near"]
        for j in range(MAX_NOTES):
            if not self.active[j]:
                continue
            d = (midi - self.midi[j]) * 100.0 / near
            g = math.exp(-0.5 * d * d) * self.w[j] * self.conv[j]
            if g > best:
                best = g
        bi = int(math.floor((midi - LO) * 100.0 / BIN_C))
        if 0 <= bi < B:
            tt = v["prior_tone"] * self.tone[bi]
            if tt > best:
                best = tt
        n_min = v["shortest"]
        cycles = n_min * math.pow(v["longest"] / n_min, best)
        return midi, cycles

    def spawn(self, v):
        midi, cycles = self.draw(v)
        if self.nv >= MAX_VOICES:
            self.dropped += 1
            return
        sr = self.sr
        f = 440.0 * math.pow(2.0, (midi - 69.0) / 12.0)
        if f > sr * 0.45:
            return
        cyc = sr / f
        k = self.nv
        self.nv += 1
        self.v_ph[k] = self.rng.next()
        self.v_inc[k] = f / sr
        self.v_pos[k] = 0
        self.v_fade[k] = max(2, int(math.floor(cyc + 0.5)))
        self.v_len[k] = int(math.floor(cyc * (cycles + 2.0) + 0.5))
        amp = math.sqrt(0.06 / v["rate"]) * math.sqrt(f / (cycles + 1.0))
        p = 0.5 + v["spread"] * (self.rng.next() - 0.5)
        self.v_l[k] = amp * math.cos(p * math.pi / 2.0)
        self.v_r[k] = amp * math.sin(p * math.pi / 2.0)
        self.grain_note, self.grain_cycles = midi, cycles
        self.mean_cycles += 0.02 * (cycles - self.mean_cycles)

    # ---- one sample
    def step(self, v):
        if self.ctl <= 0:
            self.build_prior(v)
            self.evolve(v)
            self.ctl = CTL
        while self.next <= 0.0:
            self.spawn(v)
            u = self.rng.next()
            if u < 1e-12:
                u = 1e-12
            self.next += -math.log(u) / v["rate"] * self.sr

        tab = self.tab
        ph_, inc_, pos_, len_, fd_, gl_, gr_ = self.v_ph, self.v_inc, self.v_pos, self.v_len, self.v_fade, self.v_l, self.v_r
        cos, pi = math.cos, math.pi
        left = right = 0.0
        for k in range(self.nv):
            pos, ln, fd = pos_[k], len_[k], fd_[k]
            e = 1.0
            if pos < fd:
                e = 0.5 - 0.5 * cos(pi * pos / fd)
            elif pos > ln - fd:
                e = 0.5 - 0.5 * cos(pi * (ln - pos) / fd)
            ph = ph_[k]
            x = ph * TN
            j = int(x)
            s = tab[j] + (tab[j + 1] - tab[j]) * (x - j)
            ph += inc_[k]
            if ph >= 1.0:
                ph -= 1.0
            ph_[k] = ph
            se = s * e
            left += se * gl_[k]
            right += se * gr_[k]
            pos_[k] = pos + 1
        k = 0
        while k < self.nv:
            if pos_[k] >= len_[k]:
                w = self.nv - 1
                self.nv = w
                ph_[k], inc_[k], pos_[k], len_[k] = ph_[w], inc_[w], pos_[w], len_[w]
                fd_[k], gl_[k], gr_[k] = fd_[w], gl_[w], gr_[w]
            else:
                k += 1

        g = math.pow(10.0, v["level"] / 20.0)
        self.ctl -= 1
        self.next -= 1.0
        return math.tanh(left * g), math.tanh(right * g)


PROBES = ["voices", "mean_cycles", "prior_share", "grain_note", "grain_cycles"] + \
    [f"n{j}_{q}" for j in range(MAX_NOTES) for q in ("note", "weight", "conviction")]


def render(v, sr, inputs=None, notes=()):
    p = {k: a.tolist() for k, a in v.items()}
    steps = len(p["level"])
    ids = list(p.keys())
    row = lambda i: {k: p[k][i] for k in ids}
    cloud = Cloud(sr, row(0))
    out = np.zeros((2, steps))
    probes = np.zeros((len(PROBES), steps))
    events, e = list(notes), 0
    for i in range(steps):
        while e < len(events) and events[e][0] <= i:
            _, on, note, velocity = events[e]
            e += 1
            if on and velocity > 0:
                cloud.note_on(note, velocity / 127.0)
            else:
                cloud.note_off(note)
        vi = row(i)
        out[0, i], out[1, i] = cloud.step(vi)
        col = probes[:, i]
        col[0], col[1], col[2] = cloud.nv, cloud.mean_cycles, cloud.prior_share
        col[3], col[4] = cloud.grain_note, cloud.grain_cycles
        for j in range(MAX_NOTES):
            b = 5 + 3 * j
            if cloud.active[j]:
                col[b], col[b + 1], col[b + 2] = cloud.midi[j], cloud.w[j], cloud.conv[j]
            else:
                col[b], col[b + 1], col[b + 2] = -1.0, 0.0, 0.0
    return dict(out=out, probes={name: probes[j] for j, name in enumerate(PROBES)})
