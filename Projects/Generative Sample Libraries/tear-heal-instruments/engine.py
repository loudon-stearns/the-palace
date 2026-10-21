#!/usr/bin/env python3
"""The frustration model, fast enough to sample from.

The model is the one in Harmonicity and Inharmonicity's 2026-10-17 sweeps
(copied unchanged into source/ride_warm.py, from commit b76016a2): one tone
whose partials all hang off one phase theta, at stretched ratios
r_n = n*sqrt(1 + B*n^2), each pulled by an outside voice tuned to the plain
harmonic series. Coupling K sets how hard the pull is. Past an edge in B the
tone can no longer hold every partial against its voice and it tears: the
pitch wobbles and sinks. Under the edge it locks.

simulate() is ride_warm.render()'s inner loop, step for step, compiled with
numba so a 6 s note takes a fraction of a second instead of most of a minute.
parity() runs the original numpy loop from source/ride_warm.py beside it on
the same inputs and reports how far apart they land.

Everything else here measures what a note did, from the model's own pitch
trace (F, the rate of theta, sample by sample), never from the audio: the
trace is the truth the audio was made from.
"""
from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from numba import njit

SR = 44100
HERE = Path(__file__).resolve().parent
CENTS_HOP = SR // 100          # pitch is read in 10 ms means, as the sweeps' plots did


def amp_profile(source: str, N: int) -> np.ndarray:
    """warm: the sweeps' warm source, -12 dB/oct above the 4th (ride_warm.py).
    bright: the early renders' n^-0.7 (ride.py)."""
    n = np.arange(1, N + 1, dtype=float)
    if source == "warm":
        return 1.0 / n * np.minimum(1, 4.0 / n)
    if source == "bright":
        return n ** -0.7
    raise ValueError(source)


@njit(cache=True)
def _run(F0, n, w, ph0, offs, amp, B, K, pinned, back, sr):
    N = n.shape[0]
    steps = B.shape[0]
    dt = 1.0 / sr
    p = np.zeros(N)
    ph = ph0.copy()
    r = np.empty(N)
    s = np.empty(N)
    tone = np.empty(steps)
    vox = np.empty(steps)
    F = np.empty(steps)
    Fp = F0
    two_pi = 2.0 * np.pi
    for i in range(steps):
        Bi = B[i]
        Ki = K[i]
        den = (1.0 + Bi) if pinned else 1.0
        acc = 0.0
        for k in range(N):
            nk = n[k]
            r[k] = nk * math.sqrt((1.0 + Bi * nk * nk) / den)
            gate = (4000.0 - abs(r[k] * Fp - w[k])) / 1000.0
            gate = min(max(gate, 0.0), 1.0)
            s[k] = math.sin(two_pi * (ph[k] - p[k])) * gate
            acc += r[k] * s[k]
        dth = F0 + back * Ki * acc
        y = 0.0
        v = 0.0
        for k in range(N):
            p[k] += r[k] * dth * dt
            ph[k] += (w[k] - Ki * s[k]) * dt
            g = amp[k] * min(max((19000.0 - r[k] * dth) / 3000.0, 0.0), 1.0)
            y += g * math.sin(two_pi * (p[k] + offs[k]))
            v += amp[k] * math.sin(two_pi * ph[k])
        Fp = dth
        tone[i] = y
        vox[i] = v
        F[i] = dth
    return tone, vox, F


def setup(F0: float, N: int, source: str = "warm", seed: int = 7, offs_seed: int = 11):
    """The sweeps' fixed draws: voice detune +-0.4% and the voices' starting
    phases from one generator (seed 7), the tone's partial phases from another
    (seed 11). A different seed is a different strike of the same instrument."""
    n = np.arange(1, N + 1, dtype=float)
    rng = np.random.default_rng(seed)
    det = 1 + rng.uniform(-0.004, 0.004, N)
    ph0 = rng.uniform(0, 1, N)
    offs = np.random.default_rng(offs_seed).uniform(0, 1, N)
    return dict(n=n, w=n * F0 * det, ph0=ph0, offs=offs, amp=amp_profile(source, N),
                back=21.0 / n.sum())


def simulate(F0: float, N: int, B: np.ndarray, K: np.ndarray, pinned: bool = False,
             source: str = "warm", seed: int = 7, offs_seed: int = 11):
    """B and K are per-sample paths, already scaled (no BS / KS applied here).
    Returns tone, voices, F (the rate of theta in Hz), all per sample."""
    c = setup(F0, N, source, seed, offs_seed)
    return _run(float(F0), c["n"], c["w"], c["ph0"], c["offs"], c["amp"],
                np.ascontiguousarray(B, dtype=float), np.ascontiguousarray(K, dtype=float),
                bool(pinned), float(c["back"]), SR)


# ---------------------------------------------------------------- measuring
#
# The model has one clock: coupling scales with pitch (K = 6 Hz at 110 Hz, as
# ride_warm.py's KS), so a note at f behaves like the 110 Hz note played
# f/110 times faster. Every window below is set at 110 Hz and divided by
# that clock, so a C1 and a C7 are judged by the same physics, not by the
# same stopwatch.

TORN_CENTS = 7.9     # the sweeps' tear line: 0.5 Hz of wobble at 110 Hz
HEAL_CENTS = 5.0     # a note has healed once its smoothed pitch stays this close


def clock(f0: float) -> float:
    return f0 / 110.0


def partial1_hz(F: np.ndarray, B: np.ndarray, pinned: bool) -> np.ndarray:
    """What the ear calls the note: partial 1 sits at r_1 * F."""
    return F if pinned else F * np.sqrt(1.0 + B)


def track(F: np.ndarray, B: np.ndarray, pinned: bool, ref_hz: float,
          ck: float = 1.0) -> tuple[np.ndarray, np.ndarray]:
    """Partial 1 in cents against ref_hz, as means over 10 ms / clock
    (the sweeps read pitch in 10 ms means at 110 Hz). Returns (t, cents)."""
    hop = max(8, int(round(CENTS_HOP / ck)))
    f = partial1_hz(F, B, pinned)
    m = len(f) // hop * hop
    f = f[:m].reshape(-1, hop).mean(1)
    t = (np.arange(len(f)) + 0.5) * hop / SR
    return t, 1200 * np.log2(np.maximum(f, 1e-6) / ref_hz)


def wobble(t: np.ndarray, cents: np.ndarray, a: float, b: float) -> float:
    """Standard deviation of the smoothed pitch, in cents, between a and b s."""
    seg = cents[(t >= a) & (t < b)]
    return float(seg.std()) if len(seg) else float("nan")


def shape(F, B, pinned, ref_hz, ck, tail_s: float) -> dict:
    """What a note did: where it settled, how deep and long the tear was,
    when it healed, and how still the sustain is after that. The settled
    pitch is the median of the last tail_s seconds."""
    from scipy.ndimage import median_filter
    t, c = track(F, B, pinned, ref_hz, ck)
    dt = t[1] - t[0]
    settled = float(np.median(c[t >= t[-1] - tail_s]))
    win = max(3, int(round(0.2 / ck / dt)))
    m = median_filter(c, size=win, mode="reflect")
    # the last half-window is padding, not evidence: leave it out of the search
    away = np.flatnonzero(np.abs(m[:len(m) - win // 2 - 1] - settled) > HEAL_CENTS)
    heal = float(t[away[-1]] + dt) if len(away) else 0.0
    torn = t < max(heal, dt)
    calm = t >= heal + 0.2 / ck
    return {"settled_cents": round(settled, 2),
            "heal_s": round(heal, 3),
            "dip_cents": round(float(settled - m[torn].min()), 1),
            "tear_wobble_cents": round(float(c[torn].std()), 1),
            "sustain_wobble_cents": round(float(c[calm].std()), 2) if calm.any() else None}


def held_wobble(f0: float, N: int, B_target: float, K: float, pinned: bool,
                source: str) -> float:
    """Hold a stretch and listen for a tear: lock at a thousandth of the
    target, glide up to it, hold, and measure the wobble once it has had
    time to show. The edge map's test (edgemap.py), on this note's clock."""
    ck = clock(f0)
    c = max(1.0, 1.0 / ck)
    t = np.arange(int(4.0 * c * SR)) / SR
    lo = B_target * 1e-3
    x = np.clip((t - 1.5 * c) / (0.3 * c), 0, 1)
    B = np.exp(np.log(lo) + (np.log(B_target) - np.log(lo)) * x)
    _, _, F = simulate(f0, N, B, K + 0 * t, pinned, source)
    tt, cents = track(F, B, pinned, f0, ck)
    return wobble(tt, cents, 2.5 * c, 4.0 * c)


def find_edge(f0: float, N: int, K: float, pinned: bool, source: str,
              iters: int = 10) -> dict:
    """Bisect, in log stretch, for the largest held stretch that does not
    tear (the field guide's step 4, done by measurement rather than by
    ear). Ten halvings of 1e-8..1e-1 land within 2% in B."""
    lo, hi = math.log(1e-8), math.log(1e-1)
    w_lo, w_hi = held_wobble(f0, N, math.exp(lo), K, pinned, source), None
    for _ in range(iters):
        mid = 0.5 * (lo + hi)
        w = held_wobble(f0, N, math.exp(mid), K, pinned, source)
        if w > TORN_CENTS:
            hi, w_hi = mid, w
        else:
            lo, w_lo = mid, w
    return {"edge_B": float(f"{math.exp(lo):.4g}"), "holds_wobble": round(w_lo, 2),
            "tears_wobble": None if w_hi is None else round(w_hi, 2)}


# ---------------------------------------------------------------- parity

def parity(secs: float = 2.0) -> dict:
    """Run the sweeps' own numpy loop (source/ride_warm.py, the text before
    `logsine = `, exactly as gestures_warm.py loads it) and this engine on one
    tear-then-heal strike, and compare. Both are deterministic; they differ
    only in floating-point summation order, which a torn (chaotic) stretch
    is free to amplify, so the comparison is made on a locked stretch and on
    the strike separately."""
    src = (HERE / "source" / "ride_warm.py").read_text().split("logsine = ")[0]
    import os
    os.environ.setdefault("F0", "110"); os.environ.setdefault("N", "64")
    ns: dict = {}
    exec(compile(src, "ride_warm.py", "exec"), ns)
    F0, N, BS, KS = ns["F0"], ns["N"], ns["BS"], ns["KS"]

    def ref(Bf, Kf, steps):
        # render()'s loop verbatim, minus its file writing
        n, amp, OFFS, BACK = ns["n"], ns["amp"], ns["OFFS"], ns["BACK"]
        rng = np.random.default_rng(7); DET = 1 + rng.uniform(-0.004, 0.004, N); w = n*F0*DET
        t = np.arange(steps)/SR; B = Bf(t)*BS; K = Kf(t)*KS; dt = 1/SR
        p = np.zeros(N); ph = rng.uniform(0, 1, N); Fp = F0
        tone = np.zeros(steps); F = np.zeros(steps)
        for i in range(steps):
            r = n*np.sqrt(1 + B[i]*n*n)
            gate = np.clip((4000.0 - np.abs(r*Fp - w))/1000.0, 0, 1)
            s = np.sin(2*np.pi*(ph - p))*gate
            dth = F0 + BACK*K[i]*(r*s).sum()
            p += r*dth*dt; ph += (w - K[i]*s)*dt; Fp = dth
            g = amp*np.clip((19000.0 - r*dth)/3000.0, 0, 1)
            tone[i] = g @ np.sin(2*np.pi*(p + OFFS)); F[i] = dth
        return tone, F, B, K

    steps = int(secs * SR)
    out = {}
    for name, Bf in (("locked", lambda t: 2e-6 + 0*t),
                     ("strike", lambda t: 2e-6 + 3e-4*np.exp(-t/0.25))):
        rt, rF, B, K = ref(Bf, lambda t: 6.0 + 0*t, steps)
        et, _, eF = simulate(F0, N, B, K)
        (_, rc), (_, ec) = track(rF, B, False, F0), track(eF, B, False, F0)
        out[name] = {"max_tone_diff": float(np.abs(rt - et).max()),
                     "tone_peak": float(np.abs(rt).max()),
                     "max_pitch_diff_cents": round(float(np.abs(rc - ec).max()), 4),
                     "reference": shape(rF, B, False, F0, 1.0, 0.5),
                     "engine": shape(eF, B, False, F0, 1.0, 0.5)}
    return out


if __name__ == "__main__":
    import json, sys, time
    t0 = time.time()
    print(json.dumps(parity(), indent=1))
    print(f"{time.time() - t0:.1f} s", file=sys.stderr)
