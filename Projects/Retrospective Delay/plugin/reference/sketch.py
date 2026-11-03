"""sketch.py — Retrospective Delay, the numpy sketch the plugin is checked against.

The séance from the portal (stage-5-portal/portal.codebox), one sample at a time,
in the order Algorithm.h runs it. One measure of tape, always listening:

  * the write head counts its own samples round one 4/4 measure at the Tempo knob;
  * while you play, the tape listens and takes in what you play; in silence it
    holds, writing down what it already has, so the last measure keeps coming back
    (silence keeps). The switch is a 5 ms crossfade both ways (Loudon, 2026-10-15);
  * the read head trails by a quarter, a half or a whole measure; a new lag moves the
    idle of two heads and fades over to it in 30 ms, so a re-lag never clicks;
  * READ FIRST, then write: at a whole-measure lag the read slot is the write slot,
    and reading first hears one measure ago, not now;
  * Summon (the one knob) multiplies the ghost on its way OUT of the tape, so turning
    it down hides the past without erasing it.

What changed from the codebox: stereo (a tape per side, one ear on both), the knob's
20 ms slew is now the wrapper's smoothing, the threshold is in dB, and a Dry switch
for a send. Probes are what the CRT draws from.

Contract: see VST Template/template/reference/sketch.py.
"""
import math

import numpy as np

LAGS = (0.25, 0.5, 1.0)          # quarter, half, whole measure
MIN_BPM = 30.0
PSCALE = 4.0                     # presence gain: a held phrase reads ~0.8


def tape_len(sr):
    return int(math.floor(sr * 240.0 / MIN_BPM + 0.5)) + 1


def render(v, sr, inputs=None, notes=()):
    gain, lag, bpm = v["gain"], v["lag"], v["bpm"]
    thresh_db, dry = v["thresh"], v["dry"]
    steps = len(gain)
    xl, xr = inputs[0], inputs[1]
    T = tape_len(sr)
    tl = np.zeros(T)
    tr = np.zeros(T)
    out = np.zeros((2, steps))
    names = ("knob", "presence", "holding", "head", "lag", "level", "ghost")
    pr = {k: np.zeros(steps) for k in names}

    rel = math.exp(-1.0 / (sr * 0.1))       # 100 ms release: is anyone playing?
    prel = math.exp(-1.0 / sr)              # 1 s release: presence on the tape
    grel = math.exp(-1.0 / (sr * 0.05))     # 50 ms release: the ghost's own level
    xstep = 1000.0 / (30.0 * sr)            # the two read heads, 30 ms
    lstep = 1000.0 / (5.0 * sr)             # the input crossfade, 5 ms both ways

    w = 0
    env = listen = penv = genv = 0.0
    lag_a = lag_b = LAGS[int(lag[0])]
    last = int(lag[0])
    fade = target = 0.0

    for n in range(steps):
        M = min(int(math.floor(sr * 240.0 / bpm[n] + 0.5)), T)
        if w >= M:
            w = 0
        li = int(lag[n])
        if li != last:
            if target < 0.5:
                lag_b = LAGS[li]
                target = 1.0
            else:
                lag_a = LAGS[li]
                target = 0.0
            last = li
        d = target - fade
        fade = fade + (xstep if d > xstep else (-xstep if d < -xstep else d))

        ra = w - lag_a * M
        ra = int(math.floor(ra - math.floor(ra / M) * M))
        if ra >= M:
            ra -= M
        rb = w - lag_b * M
        rb = int(math.floor(rb - math.floor(rb / M) * M))
        if rb >= M:
            rb -= M
        a0 = tl[ra]
        gl = a0 + (tl[rb] - a0) * fade
        a0 = tr[ra]
        gr = a0 + (tr[rb] - a0) * fade

        sl = float(xl[n])
        sr_ = float(xr[n])
        ax = max(abs(sl), abs(sr_))
        env = ax if ax > env else env * rel
        want = 1.0 if env > math.pow(10.0, thresh_db[n] / 20.0) else 0.0
        d = want - listen
        listen = listen + (lstep if d > lstep else (-lstep if d < -lstep else d))
        old = tl[w]
        tl[w] = old + listen * (sl - old)
        old = tr[w]
        tr[w] = old + listen * (sr_ - old)

        g = gain[n]
        out[0, n] = dry[n] * sl + g * gl
        out[1, n] = dry[n] * sr_ + g * gr

        ga = max(abs(gl), abs(gr))
        penv = ga if ga > penv else penv * prel
        genv = ga if ga > genv else genv * grel
        pr["knob"][n] = g
        pr["presence"][n] = min(max(penv * PSCALE, 0.0), 1.0)
        pr["holding"][n] = 1.0 - listen
        pr["head"][n] = w / M
        pr["lag"][n] = lag_a + (lag_b - lag_a) * fade
        pr["level"][n] = env
        pr["ghost"][n] = genv * g
        w = w + 1
        if w >= M:
            w = 0
    return dict(out=out, probes=pr)
