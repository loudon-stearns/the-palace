#!/usr/bin/env python3
"""
zeta-over-time — the page's first open question, rendered.

What does a glide sound like when its damping ratio changes while it moves?
Pitch (in cents from the target) obeys the home entry's spring law, with
zeta now a function of time:

    c'' + 2*zeta(t)*wn*c' + wn^2 * c = 0

Every study starts a fifth below the target (C3 -> G3) at rest and settles
on G3. Integrated with RK4 at the audio rate. Seven studies, one WAV each,
one figure (trajectory over zeta(t)), and studies.json for the listening page.

Run: ../../../.venvs/kokoro/bin/python3 render.py   (needs numpy, scipy, matplotlib)
"""
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.io import wavfile

HERE = Path(__file__).parent
(HERE / "audio").mkdir(exist_ok=True)
SR = 44100
PRE = 0.30          # s of held C3 before the glide starts
DUR = 2.6           # s per clip
C0 = -700.0         # cents: a fifth below
F_TARGET = 196.00   # G3
WN = 2 * np.pi * 4.0  # rad/s: a 4 Hz spring, so a ring is slow enough to follow
LOW, HIGH = 0.12, 1.0


def integrate(zeta_fn, event=None):
    """RK4 on (c, v). zeta_fn(t, state_memory) -> zeta. `event` lets a study
    switch zeta at a physical moment (first crest, first crossing); the switch
    time is recorded so the page and figure can mark it."""
    n = int((DUR - PRE) * SR)
    dt = 1.0 / SR
    c, v = C0, 0.0
    mem = {"t_switch": None}
    cs = np.empty(n); zs = np.empty(n)
    for i in range(n):
        t = i * dt
        if event and mem["t_switch"] is None and event(c, v, cs[i-1] if i else C0):
            mem["t_switch"] = t
        z = zeta_fn(t, mem)
        def acc(c_, v_):
            return -2 * z * WN * v_ - WN * WN * c_
        k1c, k1v = v, acc(c, v)
        k2c, k2v = v + .5*dt*k1v, acc(c + .5*dt*k1c, v + .5*dt*k1v)
        k3c, k3v = v + .5*dt*k2v, acc(c + .5*dt*k2c, v + .5*dt*k2v)
        k4c, k4v = v + dt*k3v, acc(c + dt*k3c, v + dt*k3v)
        cs[i] = c; zs[i] = z
        c += dt/6 * (k1c + 2*k2c + 2*k3c + k4c)
        v += dt/6 * (k1v + 2*k2v + 2*k3v + k4v)
    pre = int(PRE * SR)
    if mem["t_switch"] is None:
        dz = np.nonzero(np.diff(zs))[0]
        if len(dz) == 1:  # a timed jump: record it like an event
            mem["t_switch"] = (dz[0] + 1) * dt
    return (np.concatenate([np.full(pre, C0), cs]),
            np.concatenate([np.full(pre, zs[0]), zs]),
            None if mem["t_switch"] is None else mem["t_switch"] + PRE)


def switched(before, after, at=None):
    def f(t, mem):
        ts = mem["t_switch"] if at is None else at
        return after if (ts is not None and t >= ts) else before
    return f


crest = lambda c, v, prev: c > 0 and v <= 0        # first top of the overshoot
crossing = lambda c, v, prev: prev < 0 <= c        # first time it passes the note

STUDIES = [
    dict(id="ring", name="Rings the whole way", zeta="0.12 throughout",
         fn=lambda t, m: LOW, event=None,
         hear="The spring left alone: it overshoots by almost two-thirds of the fifth and wobbles for a second.",
         physical="A loose spring, or a singer who never catches the note."),
    dict(id="clean", name="Clean the whole way", zeta="1.0 throughout",
         fn=lambda t, m: HIGH, event=None,
         hear="The reference: fastest arrival with no overshoot.",
         physical="A practised slide that lands dead on."),
    dict(id="ramp", name="Caught gradually", zeta="0.12 → 1.2 over 0.6 s",
         fn=lambda t, m: LOW + (1.2 - LOW) * min(t / 0.6, 1.0), event=None,
         hear="It starts to fling past the note like the ringing one, but each swing is smaller than it should be; it makes one smaller swing, one shallow dip, and is still.",
         physical="A hand closing on a ringing knob; a violinist's ear correcting as the slide lands."),
    dict(id="grab-crest", name="Grabbed at the top", zeta="0.12, then 3.0 at the first crest",
         fn=switched(LOW, 3.0), event=crest,
         hear="It flies sharp, then freezes there and sinks slowly onto the note — a landing from above, not a wobble.",
         physical="The singer's overshoot the page describes: arrive sharp, settle down."),
    dict(id="grab-crossing", name="Grabbed mid-swing", zeta="0.12, then 3.0 as it first passes the note",
         fn=switched(LOW, 3.0), event=crossing,
         hear="Caught at full speed, it still coasts past the note a little and creeps back. Less overshoot than the top-grab, because it was caught earlier.",
         physical="Damping applied at the moment of most motion."),
    dict(id="loosen-late", name="Loosened mid-glide", zeta="1.5, then 0.05 at 0.15 s",
         fn=switched(1.5, 0.05, at=0.15), event=None,
         hear="A lazy, careful approach — then, still short of the note and still moving, it is let go, and it swings past and rings.",
         physical="Tension released before arrival: the momentum it had becomes a wobble."),
    dict(id="loosen-still", name="Loosened after arrival", zeta="1.0, then 0.05 at 1.2 s",
         fn=switched(HIGH, 0.05, at=1.2), event=None,
         hear="Sounds identical to the clean one. Nothing is moving when the damping drops, so there is nothing for it to act on.",
         physical="The lesson in one clip: damping is only audible while the pitch is moving."),
]


def synth(cents):
    f = F_TARGET * 2 ** (cents / 1200)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum((0.6 ** (k - 1)) * np.sin(k * ph) / k for k in range(1, 7))
    n = len(y); t = np.arange(n) / SR
    env = np.minimum(1, t / 0.02) * np.minimum(1, (DUR - t) / 0.25)
    y = y * env
    return (0.5 * y / np.max(np.abs(y)) * 32767).astype(np.int16)


def main():
    out, fig, axes = [], *plt.subplots(len(STUDIES), 1, figsize=(9, 2.0 * len(STUDIES)), sharex=True)
    for s, ax in zip(STUDIES, axes):
        c, z, tsw = integrate(s["fn"], s["event"])
        t = np.arange(len(c)) / SR
        wavfile.write(HERE / "audio" / f"{s['id']}.wav", SR, synth(c))
        g = slice(int(PRE * SR), None)
        peak = float(np.max(c[g]))
        last = c[int((DUR - 0.3) * SR):]
        ax.plot(t, c, color="#2b6cb0", lw=1.6)
        ax.axhline(0, color="#888", lw=.6, ls="--")
        ax.set_ylim(-760, 520); ax.set_ylabel("cents")
        ax.set_title(f"{s['name']} — ζ {s['zeta']}", fontsize=10, loc="left")
        ax2 = ax.twinx(); ax2.plot(t, z, color="#c05621", lw=1.0, alpha=.8)
        ax2.set_ylim(0, 3.2); ax2.set_ylabel("ζ", color="#c05621")
        if tsw: ax.axvline(tsw, color="#c05621", lw=.8, ls=":")
        # trajectory decimated to 200 Hz for the page's plot and its Web Audio curve
        step = SR // 200
        out.append({k: s[k] for k in ("id", "name", "zeta", "hear", "physical")} | {
            "overshoot_cents": round(max(peak, 0.0), 1),
            "switch_s": None if tsw is None else round(tsw, 4),
            "residual_cents_last_300ms": round(float(np.max(np.abs(last))), 2),
            "cents_200hz": [round(float(x), 2) for x in c[::step]],
            "zeta_200hz": [round(float(x), 3) for x in z[::step]],
        })
        print(f"{s['id']:14s} overshoot {max(peak,0):6.1f} c   switch {tsw}   residual {np.max(np.abs(last)):.2f} c")
    axes[-1].set_xlabel("seconds")
    fig.suptitle("ζ over time — C3 → G3, ωₙ = 2π·4 rad/s (blue: pitch in cents from G3; orange: ζ)", fontsize=11)
    fig.tight_layout(); fig.savefig(HERE / "zeta-over-time.png", dpi=110)
    meta = {"sr_curve": 200, "pre_s": PRE, "dur_s": DUR, "c0_cents": C0, "f_target_hz": F_TARGET,
            "wn_rad_s": round(WN, 4), "studies": out}
    (HERE / "studies.json").write_text(json.dumps(meta))


if __name__ == "__main__":
    main()
