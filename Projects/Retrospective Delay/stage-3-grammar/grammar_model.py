"""Reference model of the Grammar — Retrospective Delay, third move (Gen~).

A line-for-line Python transliteration of seance.genexpr: one sample's worth
of thought, run once per sample, with the order of every line made explicit.
It asks three questions and answers each with a render or a number:

  1. Is the gen~ port the same instrument as the vanilla séance?
     Null test against ../stage-2-seance/seance_model.py, ghost against ghost.
  2. Why did the whole note have to be 0.999 in vanilla Max, and why can it be
     exactly 1 in gen~? Renders the two possible orders at lag = 1:
       order-read-first.wav   peek before poke: you hear one measure ago
       order-write-first.wav  poke before peek: while you play, the "ghost" is now
  3. What is the same buffer at the compressor's 11 ms?
       shrinking-measure.wav  one phrase frozen into a 2 s, 250 ms, 50 ms and
                              500-sample tape: a phrase, a stutter, a flutter, a tone
     plus a check that the running-sum RMS window in compressor-window.genexpr
     matches a plain windowed RMS.

Also renders grammar-performance.wav: the séance's 15-measure performance,
played through the gen~ code, with the whole note exactly 1.

    python3 grammar_model.py
"""
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "stage-1" / "witness"))
sys.path.insert(0, str(HERE.parent / "stage-2-seance"))
from witness_model import SR, MEASURE, phrase  # noqa: E402
from seance_model import seance, ramp, write_wav  # noqa: E402

TAPE = 192_000


def mstosamps(ms):
    return ms * SR / 1000.0


def grammar(x, gain_param, lag_param, measure=MEASURE, thresh=0.003, read_first=True,
            listen_override=None):
    """Run seance.genexpr. gain_param / lag_param: per-sample Param values (what
    the live.dial and live.tab send). listen_override: optional per-sample 0/1
    target replacing the level gate (a hand freeze). Returns (out1, out2, ghost)."""
    tape = np.zeros(TAPE)
    env = listen = gs = 0.0
    lagA = lagB = lastlag = float(lag_param[0])
    fade = target = 0.0
    M = min(measure, TAPE)
    rel = np.exp(-1.0 / (SR * 0.1))
    xstep = 1.0 / mstosamps(30)
    gstep = 1.0 / mstosamps(20)
    lstep = 1.0 / mstosamps(5)
    out1 = np.zeros_like(x)
    out2 = np.zeros_like(x)
    ghost_raw = np.zeros_like(x)
    for n, s in enumerate(x):
        phase = (n % M) / M                       # what phasor~ 1n @lock 1 hands in2
        w = int(np.floor(phase * M + 0.5)) % M
        lag = float(lag_param[n])
        if lag != lastlag:
            if target < 0.5:
                lagB, target = lag, 1.0
            else:
                lagA, target = lag, 0.0
            lastlag = lag
        fade = fade + min(max(target - fade, -xstep), xstep)

        def read():
            rA = (w - lagA * M) % M
            rB = (w - lagB * M) % M
            a_, b_ = tape[int(np.floor(rA))], tape[int(np.floor(rB))]
            return a_ + (b_ - a_) * fade

        def write():
            nonlocal env, listen
            a = abs(s)
            env = a if a > env else env * rel
            want = (1.0 if env > thresh else 0.0) if listen_override is None else listen_override[n]
            listen = listen + min(max(want - listen, -lstep), lstep)
            old = tape[w]
            tape[w] = old + listen * (s - old)

        if read_first:
            ghost = read(); write()
        else:
            write(); ghost = read()

        gs = gs + min(max(gain_param[n] - gs, -gstep), gstep)
        ghost_raw[n] = ghost
        out2[n] = gs * ghost
        out1[n] = s + out2[n]
    return out1, out2, ghost_raw


def lag_track(n_total, events):
    """events: list of (sample, fraction) -> per-sample lag Param."""
    track = np.empty(n_total)
    for i, (start, val) in enumerate(events):
        stop = events[i + 1][0] if i + 1 < len(events) else n_total
        track[start:stop] = val
    return track


def performance_input():
    M = MEASURE
    x = np.zeros(M * 15)
    p1 = phrase([62, 65, 69, 72, 70, 69, 65, None, 67, 70, 74, 72, 69, None, 62, None])
    p2 = phrase([74, None, 72, 69, None, 67, 65, None])
    x[:M * 2] += p1[:M * 2]
    x[M * 6:M * 7] += p2[:M]
    return x


def null_test():
    """Ghost against ghost, gain held at 1, same lag moves as the séance performance."""
    x = performance_input()
    M = MEASURE
    names = [(0, "half"), (int(M * 4.37), "quarter"), (int(M * 12.61), "whole")]
    frac = {"quarter": 0.25, "half": 0.5, "whole": 1.0}
    _, ghost_vanilla = seance(x, np.ones(len(x)), names)
    _, _, ghost_gen = grammar(x, np.ones(len(x)), lag_track(len(x), [(i, frac[k]) for i, k in names]))
    return float(np.max(np.abs(ghost_vanilla - ghost_gen))), float(np.max(np.abs(ghost_vanilla)))


def performance():
    x = performance_input()
    M = MEASURE
    gain = ramp(len(x), [(0, 0.0), (2.0, 0.0), (3.0, 0.85), (8.0, 0.85), (10.0, 0.0),
                         (11.0, 0.0), (11.5, 0.85)])       # the same hand on the dial as the séance
    lags = lag_track(len(x), [(0, 0.5), (int(M * 4.37), 0.25), (int(M * 12.61), 1.0)])
    y, _, _ = grammar(x, gain, lags)
    return y


def order_test(read_first):
    """Lag exactly 1, knob up, two measures of playing then two of silence."""
    M = MEASURE
    x = np.zeros(M * 4)
    p1 = phrase([62, 65, 69, 72, 70, 69, 65, None, 67, 70, 74, 72, 69, None, 62, None])
    x[:M * 2] += p1[:M * 2]
    y, ghost, _ = grammar(x, np.full(len(x), 0.85), np.ones(len(x)), read_first=read_first)
    # while playing in measure 2: is the ghost the input (now) or the input one measure ago?
    seg = slice(M + 2000, 2 * M)
    corr_now = float(np.corrcoef(ghost[seg], x[seg])[0, 1])
    corr_ago = float(np.corrcoef(ghost[seg], x[seg.start - M:seg.stop - M])[0, 1])
    return y, corr_now, corr_ago


def shrinking_measure():
    """One phrase frozen into four tape lengths; hand freeze after one tape-length of input."""
    p = phrase([62, 65, 69, 72, 70, 69, 65, None, 67, 70, 74, 72, 69, None, 62, None])
    pieces, rows = [], []
    for M, name in ((MEASURE, "2 s — a phrase"), (12_000, "250 ms — a stutter"),
                    (2_400, "50 ms — a flutter"), (500, "500 samples — a tone")):
        dur = MEASURE + SR // 2
        x = np.zeros(dur)
        x[:min(dur, len(p))] = p[:dur]            # keep playing; the hand freezes the tape at M
        freeze = (np.arange(dur) < M).astype(float)
        _, ghost, _ = grammar(x, np.full(dur, 0.9), np.ones(dur), measure=M, listen_override=freeze)
        held = ghost.copy()
        held[:M] = 0.0                            # play only the held loop, not the first pass
        loop = held[M:M + MEASURE].copy()
        loop[:240] *= np.linspace(0, 1, 240)
        loop[-SR // 4:] *= np.linspace(1, 0, SR // 4)
        pieces += [loop, np.zeros(SR // 3)]
        rows.append((name, M, SR / M, float(np.sqrt(np.mean(held[M + 2 * SR // 10:M + MEASURE] ** 2)))))
    return np.concatenate(pieces), rows


def rms_window(x, N=500):
    """compressor-window.genexpr, line for line."""
    win = np.zeros(4096)
    total, w = 0.0, 0
    out = np.zeros_like(x)
    for n, s in enumerate(x):
        sq = s * s
        oldest = win[w]          # read first: one window ago
        win[w] = sq              # then write
        total = total + sq - oldest
        w = (w + 1) % N
        out[n] = np.sqrt(max(total, 0.0) / N)
    return out


if __name__ == "__main__":
    diff, peak = null_test()
    print(f"null test, gen~ ghost vs vanilla ghost: max difference {diff:.2e} (ghost peak {peak:.3f})")

    y = performance()
    write_wav(HERE / "grammar-performance.wav", y)
    print("grammar-performance.wav written; whole note sent as exactly 1.0")

    for rf, name in ((True, "order-read-first"), (False, "order-write-first")):
        y, now, ago = order_test(rf)
        write_wav(HERE / f"{name}.wav", y)
        print(f"{name}: ghost vs input now r={now:.3f}, vs one measure ago r={ago:.3f}")

    y, rows = shrinking_measure()
    write_wav(HERE / "shrinking-measure.wav", y)
    for name, M, f, r in rows:
        print(f"shrinking-measure: {name:24s} {M:6d} samples, loop repeats at {f:7.2f} Hz, held RMS {r:.3f}")

    rng = np.random.default_rng(7)
    x = rng.standard_normal(SR // 2) * np.linspace(0.05, 0.5, SR // 2)
    ours = rms_window(x)
    sq = np.concatenate([np.zeros(499), x * x])
    ref = np.sqrt(np.convolve(sq, np.ones(500), "valid") / 500)
    print(f"rms window vs plain windowed RMS: max difference {np.max(np.abs(ours - ref)):.2e}")
