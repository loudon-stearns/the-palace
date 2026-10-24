"""sketch.py — Blood Compressor, one sample at a time: the reference the plugin is
checked against (VST Template's contract: render(v, sr, inputs, notes)).

The same compressor as the browser vessel (stage2-vessel-prototype-v3.html) and the
RNBO codebox (rnbo/blood-compressor.codebox, v0.2), with two changes for the
plugin: times are in seconds (the template's unit; the readout shows ms), and the
sidechain high-pass is a knob (it was fixed at 80 Hz; the entry's open question
of 80 Hz vs 0.1 Hz becomes the player's to answer).

  sidechain high-pass (detector only) -> RMS detector, stereo-linked (louder side)
  -> soft-knee gain computer (cubic Hermite: the vessel wall yielding)
  -> nerve-conduction delay (fixed 5 ms: the body always has reaction time)
  -> attack / release ballistics in dB (baroreceptor reflex / smooth muscle)
  -> one gain on both sides, plus makeup

The body (cycle 11): four controls that bend that chain the way a body would.
  sympathetic  a stressed body: the systolic line drops up to 12 dB, the reflex runs
               up to twice as fast and the muscle lets go up to four times as fast
  hrv          the set point breathes: respiratory sinus arrhythmia (0.25 Hz) and the
               slow Mayer wave (0.1 Hz) move the threshold up to +-3 dB and the
               detector time up to +-20 %
  age          a stiffer wall: the ratio grows up to double and the knee loses up to
               80 % of its give
  rel_curve    the muscle's letting-go: 0 is plain exponential; above 0 a deep squeeze
               lets go fast and the last few dB linger, below 0 it holds and then snaps
               (the release time is scaled by 2^(-curve * (depth - 6 dB) / 6 dB),
               kept within a quarter and four times)

Probes, for the CRT and the check: pressure (detector level, dB peak-equivalent),
target (the reduction the wall asks for before the nerve delay, dB), squeeze (the
reduction applied, dB, 0 = wide open), reflex (1 while the wall asks for any),
breath (hrv times the breathing wave, -1..1: how far the set point has moved).

Scalar math only (math.exp, math.log, math.pow), in the C++ order, so the two agree
to float32 output rounding.
"""
import math

import numpy as np

NERVE_S = 0.005          # fixed: nerve conduction, cannot be set to zero
DLEN = 16384             # control delay ring; 5 ms fits up to 3.2 MHz
DB10 = 4.342944819032518  # 10 / ln(10)


def curve(x, T, R, K):
    lo = T - K / 2.0
    hi = T + K / 2.0
    if K <= 0.0 or x <= lo:
        if x > T:
            return T + (x - T) / R
        return x
    if x >= hi:
        return T + (x - T) / R
    s = (x - lo) / K
    y0 = lo
    y1 = T + (K / 2.0) / R
    m0 = K
    m1 = K / R
    s2 = s * s
    s3 = s2 * s
    return ((2.0 * s3 - 3.0 * s2 + 1.0) * y0 + (s3 - 2.0 * s2 + s) * m0
            + (-2.0 * s3 + 3.0 * s2) * y1 + (s3 - s2) * m1)


def render(v, sr, inputs=None, notes=()):
    th, ra, kn = v["threshold"], v["ratio"], v["knee"]
    at, rl, mk = v["attack"], v["release"], v["makeup"]
    det_t, hpf, byp = v["detector"], v["sc_hpf"], v["bypass"]
    rc, sy, hv, ag = v["rel_curve"], v["sympathetic"], v["hrv"], v["age"]
    steps = len(th)
    out = np.zeros((2, steps))
    pr = {k: np.zeros(steps) for k in ("pressure", "target", "squeeze", "reflex", "breath")}
    hpX = hpY = hpX2 = hpY2 = 0.0
    ms = 0.0
    g = 0.0
    dline = [0.0] * DLEN
    dw = 0
    d = max(1, int(math.floor(sr * NERVE_S + 0.5)))
    for i in range(steps):
        x = float(inputs[0, i])
        x2 = float(inputs[1, i])
        S = min(1.0, max(0.0, sy[i]))
        A = min(1.0, max(0.0, ag[i]))
        Hv = min(1.0, max(0.0, hv[i]))
        b = (0.6 * math.sin(2.0 * math.pi * 0.25 * i / sr)
             + 0.4 * math.sin(2.0 * math.pi * 0.1 * i / sr))
        br = Hv * b
        R = max(1.0, ra[i]) * (1.0 + A)
        K = max(0.0, kn[i]) * (1.0 - 0.8 * A)
        T = th[i] - 12.0 * S + 3.0 * br
        a = math.exp(-2.0 * math.pi * hpf[i] / sr)
        hp = a * (hpY + x - hpX)
        hpX = x
        hpY = hp
        hp2 = a * (hpY2 + x2 - hpX2)
        hpX2 = x2
        hpY2 = hp2
        ar = math.exp(-1.0 / (sr * (det_t[i] * (1.0 + 0.2 * br))))
        ms = ar * ms + (1.0 - ar) * max(hp * hp, hp2 * hp2)
        det = DB10 * math.log(ms + 1e-12) + 3.0103
        target = min(0.0, curve(det, T, R, K) - det)
        dline[dw] = target
        r = dw - d
        if r < 0:
            r += DLEN
        delayed = dline[r]
        dw += 1
        if dw >= DLEN:
            dw = 0
        atk = max(0.005, at[i] / (1.0 + S))
        m = min(4.0, max(0.25, math.pow(2.0, -rc[i] * (-g - 6.0) / 6.0)))
        rel = max(0.005, rl[i] / (1.0 + 3.0 * S) * m)
        if delayed < g:
            c = math.exp(-1.0 / (sr * atk))
        else:
            c = math.exp(-1.0 / (sr * rel))
        g = c * g + (1.0 - c) * delayed
        if byp[i] >= 0.5:
            out[0, i] = x
            out[1, i] = x2
        else:
            gl = math.pow(10.0, (g + mk[i]) / 20.0)
            out[0, i] = x * gl
            out[1, i] = x2 * gl
        pr["pressure"][i] = det
        pr["target"][i] = target
        pr["squeeze"][i] = g
        pr["reflex"][i] = 1.0 if target < -0.05 else 0.0
        pr["breath"][i] = br
    return dict(out=out, probes=pr)
