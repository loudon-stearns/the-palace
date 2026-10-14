#!/usr/bin/env python3
"""
check_rings.py — the ringing crystal, checked in Node before anyone opens Max.

The plan's third move, "let the crystal ring": every phonon mode becomes a
resonator whose Q comes from the mode's Raman line width, struck by a pulse.

1. THE FILTERS DO WHAT THE MATHS SAYS. One A2 strike through ring-render.mjs
   (8-voice renderer, crystal-ring-voice.codebox) against an independent numpy
   reference built from the closed-form impulse response of a two-pole
   resonator, R^n sin((n+1)w)/sin(w), convolved with the strike pulse.
2. THE RING TIME IS THE PHYSICS. The slope of the late tail (where the lowest,
   slowest mode is all that is left) against the predicted tau = Q / (pi f).
3. RING-TIME TABLE. For each mineral: Q, cycles it rings (Q/pi), seconds to
   1/e and to -60 dB at A2 and at A4, and how much of the strike energy is
   still sounding half a second in.
4. STEALING, MUTING, HEADROOM. Twelve notes into eight voices; an eight-note
   cluster at full velocity.
5. DEMOS. ring_tour.wav (each palette mineral struck at A2 then A4, physics
   lifetimes), strike_vs_ring.wav (the summer proof strike, then the physics
   ring, per mineral), hardness.wav (one ruby A3, strike pulse 0.1 -> 20 ms),
   ring_tour.svg (spectrogram of the tour).

Needs node and numpy. Writes ring-findings.json.
"""
import json, os, subprocess, sys, tempfile, struct
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "palette-strikes"))
import render_palette as rp  # noqa: E402

SR = 44100
SLOT = {"Diamond": 0, "Fluorite": 1, "Emerald": 3, "Ruby": 4, "Amethyst": 5, "Topaz": 6, "Labradorite": 8}
RATIOS = {n: r for n, _, r, *_ in rp.PALETTE}
LW = {c["name"]: c for c in json.load(open(os.path.join(HERE, "linewidths.json")))["crystals"]}


def q_of(name, k):
    c = LW[name]
    for e in c.get("exceptions", []):
        if e["mode_index"] == k:
            return e["Q"]
    return c["Q"]


def ring(score):
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(score, f)
        p = f.name
    try:
        r = subprocess.run(["node", os.path.join(HERE, "ring-render.mjs"), p, str(SR)],
                           capture_output=True, check=True, cwd=HERE)
    finally:
        os.unlink(p)
    return np.frombuffer(r.stdout, dtype=np.float32).astype(float), json.loads(r.stderr)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def norm(a, peak=0.85):
    p = float(np.max(np.abs(a)))
    return a if p < 1e-12 else a * (peak / p)


def write_wav(path, audio):
    a = np.int16(np.clip(audio, -1, 1) * 32767).tobytes()
    with open(path, "wb") as f:
        f.write(b"RIFF" + struct.pack("<I", 36 + len(a)) + b"WAVE")
        f.write(b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, SR, SR * 2, 2, 16))
        f.write(b"data" + struct.pack("<I", len(a)) + a)
    print("  wrote", os.path.basename(path))


def reference(name, hz, seconds, hardness_ms=1.0, lifetime=1.0, roll=0.7, vel=1.0, level=0.5):
    """Closed-form reference: no filter loop, so it checks the codebox's recursion."""
    n = np.arange(int(seconds * SR))
    L = max(1, int(np.floor(hardness_ms * 1e-3 * SR)))
    pulse = (1 - np.cos(2 * np.pi * (np.arange(L) + 0.5) / L)) / L
    out = np.zeros(len(n))
    amp = 1.0
    for k, r in enumerate(RATIOS[name]):
        f = hz * r
        if f >= SR * 0.45:
            continue
        w = 2 * np.pi * f / SR
        R = np.exp(-np.pi * f / (q_of(name, k) * lifetime * SR))
        h = amp * R ** n * np.sin((n + 1) * w)          # = b0 * R^n sin((n+1)w)/sin(w), b0 = amp sin(w)
        out += np.convolve(pulse, h)[:len(n)]
        amp *= roll
    return out * vel * 0.3 * 0.3 * level                # voice gain, mix trim, level


def tail_tau(x, start_db=-25, stop_db=-55):
    win = int(0.01 * SR)
    m = len(x) // win
    e = np.sqrt(np.mean(x[:m * win].reshape(m, win) ** 2, axis=1)) + 1e-15
    db = 20 * np.log10(e / e.max())
    t = (np.arange(m) + 0.5) * win / SR
    i0 = np.argmax(db < start_db)
    sel = (np.arange(m) >= i0) & (db > stop_db)
    if sel.sum() < 4:
        return None
    slope = np.polyfit(t[sel], np.log(e[sel]), 1)[0]   # nepers per second
    return -1.0 / slope


def main():
    F = {}
    a2 = mtof(45)

    print("1. codebox vs closed-form reference, one A2 strike")
    F["vs_reference"] = {}
    for name in SLOT:
        secs = 4.0
        s, _ = ring({"seconds": secs, "params": {"crystal": SLOT[name]},
                     "events": [{"t": 0, "note": 45, "vel": 127}]})
        ref = reference(name, a2, secs)
        err = float(np.max(np.abs(s - ref)) / np.max(np.abs(ref)))
        F["vs_reference"][name] = err
        print(f"  {name:<12} largest difference {err:.1e} of peak")

    print("2. late-tail ring time vs tau = Q / (pi f) of the lowest mode, A2")
    F["ring_time"] = {}
    for name in SLOT:
        pred = q_of(name, 0) / (np.pi * a2)
        secs = min(12.0, max(1.5, pred * 9))
        s, _ = ring({"seconds": secs, "params": {"crystal": SLOT[name]},
                     "events": [{"t": 0, "note": 45, "vel": 127}, {"t": secs - 0.01, "note": 45, "vel": 0}]})
        meas = tail_tau(s)
        F["ring_time"][name] = {"predicted_s": round(pred, 4), "measured_s": None if meas is None else round(meas, 4)}
        print(f"  {name:<12} predicted {pred:.3f} s   measured {meas if meas is None else round(meas, 3)} s")

    print("3. ring-time table")
    rows = []
    for name in SLOT:
        Q = q_of(name, 0)
        t2 = Q / (np.pi * a2)
        t4 = Q / (np.pi * mtof(69))
        ref = reference(name, a2, 1.0)
        e = ref ** 2
        half = float(e[int(0.5 * SR):].sum() / e.sum())
        rows.append([name, LW[name]["status"].split(",")[0], Q, round(Q / np.pi),
                     round(t2, 3), round(6.91 * t2, 2), round(6.91 * t4, 2), f"{100 * half:.1f}%"])
    F["table"] = {"columns": ["crystal", "Q source", "Q", "cycles to 1/e", "tau at A2 (s)",
                              "to -60 dB at A2 (s)", "to -60 dB at A4 (s)", "energy left after 0.5 s (A2)"],
                  "rows": rows}
    for r in rows:
        print("  ", r)

    print("4. stealing, muting, headroom")
    notes = [45, 52, 57, 60, 64, 69, 72, 76, 79, 81, 84, 88]
    ev = []
    for i, nn in enumerate(notes):
        ev += [{"t": 0.15 * i, "note": nn, "vel": 110}, {"t": 0.15 * i + 0.5, "note": nn, "vel": 0}]
    s, st = ring({"seconds": 12.0, "params": {"crystal": 0}, "events": ev})
    d = np.abs(np.diff(s)) / max(np.max(np.abs(s)), 1e-12)
    near = np.zeros(len(d), bool)
    for e in ev:
        if e["vel"] > 0:
            n0 = int(e["t"] * SR)
            near[max(0, n0 - 265):n0 + 265] = True
    F["stealing"] = {"steals": st["steals"], "max_active": st["maxActive"],
                     "active_voices_each_second": st["activeEverySecond"],
                     "largest_step_near_note_ons": float(d[near].max()),
                     "largest_step_elsewhere": float(d[~near].max())}
    print("  ", F["stealing"])
    cl = [45, 48, 52, 55, 57, 60, 64, 67]
    worst = {}
    for name in SLOT:
        s, _ = ring({"seconds": 0.5, "params": {"crystal": SLOT[name], "hardness": 0.05},
                     "events": [{"t": 0, "note": n, "vel": 127} for n in cl]})
        worst[name] = round(float(np.max(np.abs(s))), 3)
    F["headroom_8_note_cluster_peak_at_level_0.5"] = worst
    print("   8-note cluster peaks:", worst)

    print("5. demos")
    ev, t = [], 0.0
    for name in SLOT:
        ev.append({"t": t, "param": "crystal", "value": SLOT[name]})
        for nn in (45, 69):
            ev += [{"t": t + 0.001, "note": nn, "vel": 112}, {"t": t + 0.2, "note": nn, "vel": 0}]
            t += 1.6 if name != "Diamond" else 3.2
        t += 0.6
    s, _ = ring({"seconds": t + 4.0, "params": {"level": 0.5}, "events": ev})
    write_wav(os.path.join(HERE, "ring_tour.wav"), norm(s))
    F["ring_tour"] = {"order": list(SLOT), "notes": "A2 then A4 on each", "seconds": round(t + 4.0, 2)}

    parts = []
    for name in SLOT:
        strike = norm(rp.additive_strike(RATIOS[name], dur=3.0), 0.7)
        r, _ = ring({"seconds": 3.0, "params": {"crystal": SLOT[name]},
                     "events": [{"t": 0, "note": 45, "vel": 127}]})
        parts += [strike, np.zeros(int(0.4 * SR)), norm(r, 0.7), np.zeros(int(1.0 * SR))]
    write_wav(os.path.join(HERE, "strike_vs_ring.wav"), np.concatenate(parts))

    parts = []
    for h in (0.1, 0.5, 2.0, 5.0, 20.0):
        r, _ = ring({"seconds": 1.6, "params": {"crystal": 4, "hardness": h},
                     "events": [{"t": 0, "note": 57, "vel": 127}]})
        parts += [r, np.zeros(int(0.2 * SR))]
    write_wav(os.path.join(HERE, "hardness.wav"), norm(np.concatenate(parts)))
    F["hardness_demo_ms"] = [0.1, 0.5, 2.0, 5.0, 20.0]

    with open(os.path.join(HERE, "ring-findings.json"), "w") as f:
        json.dump(F, f, indent=1)


if __name__ == "__main__":
    main()
