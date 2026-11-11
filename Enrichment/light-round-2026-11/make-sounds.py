#!/usr/bin/env python3
"""Light round 2026-11 — the five sounds. Run from this folder: python3 make-sounds.py
Every sound is synthesized here from nothing; no samples. 44.1 kHz, 16-bit, stereo."""
import numpy as np, wave, os, json

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(1714)  # the Monadology's year


def save(name, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    x = x / max(1e-9, np.max(np.abs(x))) * 0.84
    fade = int(0.02 * SR)
    x[:fade] *= np.linspace(0, 1, fade)[:, None]
    x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    with wave.open(os.path.join(HERE, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
    print(f"{name}: {len(x)/SR:.1f}s")


def tick(freq, dur=0.09, bright=1.0):
    """A clock's tick: a short damped ring with a noise edge."""
    n = int(dur * SR); t = np.arange(n) / SR
    ring = np.sin(2 * np.pi * freq * t) * np.exp(-t * 70)
    ring += 0.5 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 110)
    edge = rng.standard_normal(n) * np.exp(-t * 900) * 0.6 * bright
    return ring + edge


def tock_wood():
    """Left clock: a long-case clock's tock. Low, woody, round, slow to die."""
    n = int(0.22 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (310 + 60 * np.exp(-t * 90)) * t) * np.exp(-t * 26)
    body += 0.45 * np.sin(2 * np.pi * 655 * t) * np.exp(-t * 48)
    knock = rng.standard_normal(n) * np.exp(-t * 420)
    knock = np.convolve(knock, np.ones(24) / 24, mode="same") * 1.6   # dull the knock: no brightness at all
    return body + knock


def tick_metal():
    """Right clock: a pocket watch's tick. High, thin, metallic, gone at once."""
    n = int(0.05 * SR); t = np.arange(n) / SR
    ring = sum(a * np.sin(2 * np.pi * f * t) for f, a in ((3350, 1.0), (5120, 0.7), (7430, 0.5), (9810, 0.3)))
    ring *= np.exp(-t * 240)
    edge = np.diff(rng.standard_normal(n + 1)) * np.exp(-t * 1500) * 0.5   # differenced noise: all top, no body
    return 0.95 * (ring + edge)


def place(buf, snd, at, ch=None, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    j = min(len(buf), i + len(snd))
    if ch is None: buf[i:j] += gain * snd[: j - i, None] if buf.ndim == 2 else gain * snd[: j - i]
    else: buf[i:j, ch] += gain * snd[: j - i]


# 1 ── Leibniz: two clocks, no wire ─────────────────────────────────────────
def leibniz():
    total = 24.0
    buf = np.zeros((int(total * SR), 2))
    lo, hi = tock_wood(), tick_metal()
    L1, L2, R2, Ks = [], [], [], []
    # Part one, 0–10 s: two clocks set once. Left and right, same rate, never touching, never drifting.
    period = 0.5
    for k in range(20):
        place(buf, lo, 0.3 + k * period, ch=0); L1.append(0.3 + k * period)
        place(buf, hi, 0.3 + k * period, ch=1)
    # Part two, 12–24 s: the wired pair. They start apart at different rates and pull each other in
    # (two Kuramoto phases, coupling K, stepped at 1 ms).
    # The wire is slack at first (they drift, plainly at different rates), then tightens until they tick as one.
    w1, w2 = 2 * np.pi * 2.0, 2 * np.pi * 2.35
    th1, th2, dt, t0 = 0.0, 2.4, 0.001, 12.0
    for step in range(int(11.6 / dt)):
        K = 9.0 * (step * dt / 10.0) ** 2
        d1 = w1 + K * np.sin(th2 - th1); d2 = w2 + K * np.sin(th1 - th2)
        n1, n2 = th1 + d1 * dt, th2 + d2 * dt
        if n1 // (2 * np.pi) > th1 // (2 * np.pi): place(buf, lo, t0 + step * dt, ch=0); L2.append(t0 + step * dt); Ks.append(K)
        if n2 // (2 * np.pi) > th2 // (2 * np.pi): place(buf, hi, t0 + step * dt, ch=1); R2.append(t0 + step * dt)
        th1, th2 = n1, n2
    save("Leibniz — two clocks, no wire.wav", buf)
    return {"set_once": L1, "wired_left": L2, "wired_right": R2, "wire": Ks}


# 2 ── Endosymbiosis: two become one ───────────────────────────────────────
def endosymbiosis():
    total = 20.0; n = int(total * SR); t = np.arange(n) / SR
    f1, f2 = 164.0, 171.0                      # two metabolic rhythms, 7 Hz apart
    # coupling: none for 4 s, then rising until they lock (K > |Δω|/2) and beyond
    K = np.clip((t - 4.0) / 9.0, 0, 1) ** 1.6 * 2 * np.pi * 9.0
    th1 = np.zeros(n); th2 = np.zeros(n); a, b, dt = 0.0, 1.3, 1 / SR
    w1, w2 = 2 * np.pi * f1, 2 * np.pi * f2
    for i in range(n):
        th1[i], th2[i] = a, b
        s = np.sin(b - a)
        a += (w1 + K[i] * s) * dt; b += (w2 - K[i] * s) * dt
    # each partner keeps its own timbre — its own DNA — all the way through
    host = sum(np.sin(h * th1) / h for h in (1, 3, 5, 7))            # hollow, odd harmonics
    guest = sum(np.sin(h * th2) / (h ** 1.5) for h in (1, 2, 3, 4, 5))  # rounder, all harmonics
    env = np.minimum(1, t / 0.6) * np.minimum(1, (total - t) / 2.0)
    L = (0.85 * host + 0.35 * guest) * env; R = (0.35 * host + 0.85 * guest) * env
    save("Endosymbiosis — two rhythms become one.wav", np.stack([L, R], axis=1))
    hop = int(0.05 * SR)                              # each partner's pitch, read off its own phase every 50 ms
    fa = np.diff(th1[::hop]) / (2 * np.pi * 0.05); fb = np.diff(th2[::hop]) / (2 * np.pi * 0.05)
    return {"t": (np.arange(len(fa)) * 0.05 + 0.025).round(3).tolist(), "host": fa.round(3).tolist(), "guest": fb.round(3).tolist()}


# 3 ── Two Batons, One Board: an impulse, then the impulse looped ──────────
def batons():
    total = 20.0; n = int(total * SR)
    click = tick(520, dur=0.16, bright=1.4)
    dry = np.zeros(n)
    place(dry, click, 0.5)                      # the baton: one crossing, then gone
    # the steward: the same impulse dropped into a loop. Each pass catches what the last one left,
    # changes it a little (a gentle low-pass and a small pitch nudge in the loop), and drops it back.
    start, loop = 5.0, 0.62
    d = int(loop * SR); out = np.zeros(n); line = np.zeros(n)
    place(line, click, start)
    lp = 0.0
    for i in range(int(start * SR), n):
        fb = line[i - d] if i - d >= 0 else 0.0
        lp += 0.42 * (fb - lp)                  # what comes back is a little rounder each time
        line[i] += 0.985 * lp
        out[i] = line[i]
    L = dry + out; R = dry + np.roll(out, int(0.004 * SR))
    save("Two Batons, One Board — an impulse, then the impulse looped.wav", np.stack([L, R], axis=1))


# 4 ── Synthesis Notes: marble, then the chisel ────────────────────────────
def marble():
    f0 = 82.41                                   # low E
    total = 16.0; n = int(total * SR); t = np.arange(n) / SR
    saw = np.zeros(n)
    for h in range(1, int((SR / 2 - 500) / f0)):
        saw += np.sin(2 * np.pi * f0 * h * t) / h   # band-limited saw: the whole block of marble
    saw *= 0.5
    # 0–5 s raw. 5–16 s the chisel: a resonant low-pass (state-variable) closing, then cutting figures.
    cutoff = np.full(n, 18000.0)
    seg = t >= 5.0; u = (t[seg] - 5.0) / 11.0
    sweep = 9000 * np.exp(-u * 5.2) + 180          # the long first cut
    figures = 1 + 0.75 * np.sin(2 * np.pi * (0.35 + 1.6 * u) * (t[seg] - 5.0)) * np.clip((u - 0.35) * 3, 0, 1)
    cutoff[seg] = np.clip(sweep * figures + 120, 90, 18000)
    q = np.where(seg, 0.22, 1.2)                   # damping: low = resonant edge on the chisel
    low = band = 0.0; y = np.zeros(n)
    for i in range(n):                             # Chamberlin SVF, 2x oversampled for stability
        f = 2 * np.sin(np.pi * min(cutoff[i], 14000) / (2 * SR))
        for _ in range(2):
            low += f * band
            high = saw[i] - low - q[i] * band
            band += f * high
        y[i] = low
    y[~seg] = saw[~seg] * 0.9
    xf = int(0.05 * SR); i5 = int(5.0 * SR)        # smooth the join
    y[i5:i5 + xf] = saw[i5:i5 + xf] * 0.9 * np.linspace(1, 0, xf) + y[i5:i5 + xf] * np.linspace(0, 1, xf)
    y = np.tanh(y * 0.9)
    save("Synthesis Notes (Loudon) — marble, then the chisel.wav", y)


# 5 ── Whitehead: one occasion, then the society ───────────────────────────
def whitehead():
    total = 22.0; n = int(total * SR); buf = np.zeros((n, 2))
    def grain(freq, dur):
        m = int(dur * SR); tt = np.arange(m) / SR
        return np.hanning(m) * (np.sin(2 * np.pi * freq * tt) + 0.3 * np.sin(2 * np.pi * freq * 2 * tt))
    base = 293.66                                   # D
    # one occasion, alone: it arises and perishes. Then again. Then they start to arrive together.
    for at in (0.6, 2.6, 4.4):
        place(buf, grain(base, 0.07), at)
    t = 5.6
    events = [(at, base, 0.5) for at in (0.6, 2.6, 4.4)]
    while t < total - 1.0:
        u = (t - 5.6) / (total - 6.6)               # 0 → 1 across the gathering
        rate = 1.5 * (220 / 1.5) ** min(1.0, u * 1.25)   # grains per second: 1.5 → 220
        t += rng.exponential(1 / rate)
        # each grain inherits the pattern: the same pitch, give or take; a fifth and an octave appear as it thickens
        pick = rng.choice([1, 1, 1, 1.5, 2], p=[0.45, 0.2, 0.15, 0.12, 0.08]) if u > 0.45 else 1
        f = base * pick * 2 ** (rng.normal(0, 0.012))
        g = grain(f, rng.uniform(0.045, 0.09)); pan = rng.uniform(0.15, 0.85)
        amp = 1.0 / np.sqrt(max(1.0, rate * 0.06)) * min(1, (total - 1.0 - t) / 2.5 + 0.05)
        place(buf, g, t, ch=0, gain=amp * (1 - pan)); place(buf, g, t, ch=1, gain=amp * pan)
        events.append((round(t, 4), round(float(f), 2), round(float(pan), 3)))
    save("Whitehead — one occasion, then the society.wav", buf)
    return {"grains": events}


if __name__ == "__main__":
    traces = {"leibniz": leibniz(), "endosymbiosis": endosymbiosis(), "whitehead": whitehead()}
    batons(); marble()
    json.dump(traces, open(os.path.join(HERE, "sound-traces.json"), "w"))   # what each sound did, for make-sound-images.py
