"""sketch.py — Semantic Delay's audio thread, with no helper reachable.

What the plugin's audio thread does on its own, one sample at a time, in the
order Algorithm::step runs it: mix to mono, keep a pre-roll, cut phrases with
the energy gate (standalone/segmenter.py's numbers, on 512-sample blocks),
count each phrase handed to the helper, and pass the dry signal through.

The echoes are not here. They come from another process, on another thread,
at a time no sketch can predict; tests/echo_through_helper.cpp checks them
against the real helper instead. verify.py runs with SEMANTIC_DELAY_SOCK
pointing nowhere, so the plugin's echoes are silent too and the two match.
"""
import math

import numpy as np

BLOCK, ONSET, HANG_S, MIN_S, MAX_S = 512, 2, 0.30, 0.20, 8.0


def render(v, sr, inputs=None, notes=()):
    steps = inputs.shape[1]
    hang = max(1, round(HANG_S * sr / BLOCK))
    min_len, max_len = round(MIN_S * sr), round(MAX_S * sr)
    in32 = inputs.astype(np.float32)
    mono = (np.float32(0.5) * (in32[0] + in32[1])).astype(np.float64)

    out = np.zeros((2, steps))
    gate_p, sent_p = np.zeros(steps), np.zeros(steps)
    acc, block_pos, above, below = 0.0, 0, 0, 0
    capturing, length, sent = False, 0, 0
    dry_v = v["dry"]
    for i in range(steps):
        m = mono[i]
        if capturing:
            length += 1
        acc += m * m
        block_pos += 1
        if block_pos == BLOCK:
            rms = math.sqrt(acc / BLOCK + 1e-12)
            loud = 20.0 * math.log10(max(rms, 1e-9)) >= v["gate"][i]
            acc, block_pos = 0.0, 0
            if not capturing:
                above = above + 1 if loud else 0
                if above >= ONSET:
                    capturing, length, below = True, BLOCK * ONSET, 0
            else:
                below = 0 if loud else below + 1
                if below >= hang or length >= max_len:
                    sung = length - below * BLOCK
                    above = below = 0
                    if sung >= min_len:
                        sent += 1
                    capturing = False
        dry = 10.0 ** (dry_v[i] / 20.0)
        out[0, i] = dry * in32[0, i]
        out[1, i] = dry * in32[1, i]
        gate_p[i] = 1.0 if capturing else 0.0
        sent_p[i] = sent
    return dict(out=out, probes={"gate": gate_p, "sent": sent_p,
                                 "late": np.zeros(steps), "busy": np.zeros(steps),
                                 "helper": np.zeros(steps)})
