"""sketch.py — Bent Line: the two-wall additive engine of Inharmonic Wavetable
Synthesis, one sample at a time, as the C++ will run it. VST Template's
contract: render(v, sr, inputs, notes) and constants().

Sixty-four partials a voice, eight voices. Partial (slot) n of a voice sits at

    f_n = n * f0 * 2^(bend * c_n / 1200)

where c_n is Wavetable B, the measured bend of a real material in cents, read
at a frame position that follows the note's own clock (or a manual knob). Its
loudness is Wavetable A at slot n: either the organ wall (48 FFT'd frames of a
real organ wavetable, scanned by a knob) or the material's own measured levels.

Filing (granted BOTH, 2026-10-15): a bell or bar has modes, not harmonics, so
there are two honest ways to put its k-th mode in a slot.
  Rank     mode k lives in slot k; its bend is cents off k * f1.
  Nearest  mode k lives in the harmonic slot nearest its real pitch; its bend is
           cents off that slot. Where two modes land on one slot the louder
           wins (Wavetable B holds one bend per slot); empty slots are silent.
The filing decides which of the organ's partials a mode wears, and what
'bend 0' collapses to: under Rank the bell flattens into a full harmonic
series, under Nearest it flattens onto the few harmonics it was nearest.

Every 32 samples (per voice, counted from its note-on) the voice computes its
targets: each slot's phase increment, its target level (ramped linearly over
the next 32 samples) and its per-sample decay (upper partials die first).
"""
import json
import math
from pathlib import Path

import numpy as np

BUNDLE = Path(__file__).resolve().parents[2]
LIB = BUNDLE / "trajectory-library"
ORGAN = BUNDLE / "dual-wavetable" / "dual-data.json"

NP, NF, NV, K = 64, 16, 8, 32
MATERIALS = ["piano-A2", "piano-A4", "piano-C6", "bell-brooklyn-C6",
             "vibraphone-C4", "marimba-C3", "singing-bowl-D4"]
NM = len(MATERIALS)
TWO_PI = 6.283185307179586


def _tables():
    """cents[m, filing, frame, slot], mask[m, filing, slot], own[m, filing, frame, slot],
    times[m, frame], organ[48, slot]."""
    cents = np.zeros((NM, 2, NF, NP)); mask = np.zeros((NM, 2, NP))
    own = np.zeros((NM, 2, NF, NP)); times = np.zeros((NM, NF))
    k = np.arange(1, NP + 1, dtype=np.float64)
    for m, name in enumerate(MATERIALS):
        d = json.load(open(LIB / f"{name}.wtb.json"))
        c = np.array(d["frames"], dtype=np.float64)                 # (16, 64), rank filed
        a = np.array(d["wta_measured"], dtype=np.float64)
        a = a / (a.max() + 1e-12)
        nmod = d.get("n_modes", NP)
        rmask = (k <= nmod).astype(np.float64)
        times[m] = d["frame_times_s"]
        cents[m, 0], mask[m, 0], own[m, 0] = c, rmask, a * rmask
        # nearest: each live mode to the harmonic slot nearest its first-frame pitch
        ratio = k * 2.0 ** (c[0] / 1200.0)
        near = np.maximum(1, np.round(ratio)).astype(int)
        lvl = a[0]
        for j in np.argsort(lvl, kind="stable"):                    # louder modes win a shared slot
            if j >= nmod or near[j] > NP:
                continue
            s = near[j] - 1
            cents[m, 1, :, s] = c[:, j] + 1200.0 * np.log2((j + 1) / near[j])
            own[m, 1, :, s] = a[:, j]
            mask[m, 1, s] = 1.0
    organ = np.array(json.load(open(ORGAN))["wta"], dtype=np.float64)   # (48, 64)
    return cents, mask, own, times, organ


CENTS, MASK, OWN, TIMES, ORGAN = _tables()
NO = ORGAN.shape[0]


def constants():
    return dict(kCents=CENTS, kMask=MASK, kOwn=OWN, kTimes=TIMES, kOrgan=ORGAN)


def frame_pos(m, tt):
    T = TIMES[m]
    if tt <= T[0]:
        return 0.0
    if tt >= T[NF - 1]:
        return float(NF - 1)
    j = 0
    while T[j + 1] <= tt:
        j += 1
    return j + (tt - T[j]) / (T[j + 1] - T[j])


def lerp_rows(tab, pos, nrows):
    lo = int(math.floor(pos))
    if lo >= nrows - 1:
        return tab[nrows - 1].copy()
    a = pos - lo
    return tab[lo] * (1.0 - a) + tab[lo + 1] * a


class Voice:
    def __init__(self):
        self.active = False; self.held = False
        self.note = -1; self.order = 0; self.age = 0; self.ctr = 0
        self.f0 = 0.0; self.vel = 0.0; self.e = 0.0
        self.ph = np.zeros(NP); self.inc = np.zeros(NP)
        self.amp = np.zeros(NP); self.damp = np.zeros(NP)
        self.dec = np.ones(NP); self.dk = np.ones(NP)
        self.pos = 0.0; self.bend16 = 0.0


def render(v, sr, inputs=None, notes=()):
    steps = len(v["level"])
    out = np.zeros((1, steps))
    pr_pos = np.zeros(steps); pr_bend = np.zeros(steps); pr_n = np.zeros(steps)
    voices = [Voice() for _ in range(NV)]
    counter = 0
    n = np.arange(1, NP + 1, dtype=np.float64)
    ev = list(notes); ei = 0
    ainc = 1.0 / (0.004 * sr)
    for i in range(steps):
        while ei < len(ev) and ev[ei][0] <= i:
            _, on, note, vel = ev[ei]; ei += 1
            if on:
                pick = -1
                for q in range(NV):
                    if pick < 0 and voices[q].active and voices[q].note == note:
                        pick = q
                for q in range(NV):
                    if pick < 0 and not voices[q].active:
                        pick = q
                if pick < 0:
                    pick = 0
                    for q in range(1, NV):
                        if voices[q].order < voices[pick].order:
                            pick = q
                vo = voices[pick]
                counter += 1
                vo.order = counter; vo.note = note; vo.held = True; vo.active = True
                vo.f0 = 440.0 * 2.0 ** ((note - 69) / 12.0); vo.vel = vel / 127.0
                vo.age = 0; vo.ctr = 0; vo.e = 0.0
                vo.ph[:] = 0.0; vo.amp[:] = 0.0; vo.dec[:] = 1.0
            else:
                for vo in voices:
                    if vo.note == note:
                        vo.held = False

        mat = int(v["material"][i]); fil = int(v["filing"][i])
        bend = v["bend"][i]; clock = int(v["clock"][i]); speed = v["speed"][i]
        bpos = v["bpos"][i]; wall = int(v["wall"][i]); apos = v["apos"][i]
        decay = v["decay"][i]; release = v["release"][i]
        gain = 10.0 ** (v["level"][i] / 20.0) * 0.25
        rk = math.exp(-1.0 / (sr * release))
        y = 0.0
        for vo in voices:
            if not vo.active:
                continue
            if vo.ctr == 0:
                if clock == 0:
                    vo.pos = frame_pos(mat, vo.age / sr * speed)
                else:
                    vo.pos = bpos * (NF - 1)
                c = lerp_rows(CENTS[mat, fil], vo.pos, NF)
                f = n * vo.f0 * np.power(2.0, bend * c / 1200.0)
                vo.inc = f / sr
                if wall == 0:
                    A = lerp_rows(ORGAN, apos * (NO - 1), NO) * MASK[mat, fil]
                else:
                    A = lerp_rows(OWN[mat, fil], vo.pos, NF)
                A = np.where(f < 0.45 * sr, A, 0.0)
                vo.damp = (A * vo.vel - vo.amp) / K
                tau = decay / (1.0 + 0.07 * (n - 1.0))
                vo.dk = np.exp(-1.0 / (sr * tau))
                vo.bend16 = bend * c[15]
            vo.ctr += 1
            if vo.ctr == K:
                vo.ctr = 0
            vo.amp = vo.amp + vo.damp
            vo.dec = vo.dec * vo.dk
            if vo.held:
                vo.e = min(1.0, vo.e + ainc)
            else:
                vo.e = vo.e * rk
            vo.ph = vo.ph + vo.inc
            vo.ph = vo.ph - np.floor(vo.ph)
            s = float(np.sum(vo.amp * vo.dec * np.sin(TWO_PI * vo.ph)))
            y += s * vo.e
            vo.age += 1
            if not vo.held and vo.e < 1e-5:
                vo.active = False
        out[0, i] = y * gain
        v0 = voices[0]
        pr_pos[i] = v0.pos; pr_bend[i] = v0.bend16
        pr_n[i] = sum(1 for vo in voices if vo.active)
    return dict(out=out, probes={"pos": pr_pos, "bend16": pr_bend, "voices": pr_n})
