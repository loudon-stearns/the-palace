#!/usr/bin/env python3
"""
check_crystal_bank.py — is the playable crystal the proofs' crystal?

1. NULL TEST. For each of the seven palette minerals, hold A2 (110 Hz) for six
   seconds through crystal-bank.codebox (run in Node by the adopted harness)
   and compare it, sample for sample, with additive_strike() imported straight
   from ../palette-strikes/render_palette.py. Both are peak-normalised first
   (the proofs normalise; the codebox has a fixed output gain), so the number
   reported is the largest difference on a -1..1 scale.
2. DEMOS. Render what only an instrument can do:
     crystal_keyboard_tour.wav  — the same four-note phrase (A2 C3 E3 A3, then
                                  A2 held) on all nine selector slots
     one_strike_nine_lattices.wav — one A2 held for 18 s while the selector
                                  steps through all nine slots, 2 s each
3. Click check: the largest sample-to-sample step within 6 ms of each key-down,
   against the largest step anywhere else, so a restrike click would show up as
   a number before anyone hears it. (The first draft cut a ringing note to zero
   on restrike; the 3 ms fade in the codebox is the fix this check confirmed.)

Needs node (>=18) and numpy. Writes findings.json beside this file.
"""
import json, os, struct, subprocess, sys, tempfile
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "palette-strikes"))
import render_palette as rp  # noqa: E402  (the proofs' engine, imported, not copied)

SR = 44100
SLOTS = ["Diamond", "Fluorite", "Tetragonal (hypothesis)", "Emerald", "Ruby",
         "Amethyst", "Topaz", "Monoclinic (hypothesis)", "Labradorite"]
PALETTE_SLOT = {"Diamond": 0, "Fluorite": 1, "Emerald": 3, "Ruby": 4,
                "Amethyst": 5, "Topaz": 6, "Labradorite": 8}


def render(score):
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(score, f)
        path = f.name
    try:
        raw = subprocess.run(["node", os.path.join(HERE, "render-score.mjs"), path, str(SR)],
                             capture_output=True, check=True).stdout
    finally:
        os.unlink(path)
    return np.frombuffer(raw, dtype=np.float32).astype(float)


def norm(a, peak=0.85):
    p = float(np.max(np.abs(a)))
    return a if p < 1e-12 else a * (peak / p)


def write_wav(path, audio):
    a = np.int16(np.clip(audio, -1, 1) * 32767)
    data = a.tobytes()
    with open(path, "wb") as f:
        f.write(b"RIFF"); f.write(struct.pack("<I", 36 + len(data))); f.write(b"WAVE")
        f.write(b"fmt "); f.write(struct.pack("<IHHIIHH", 16, 1, 1, SR, SR * 2, 2, 16))
        f.write(b"data"); f.write(struct.pack("<I", len(data))); f.write(data)
    print(f"  wrote {os.path.basename(path)}  ({len(audio)/SR:.1f} s)")


def main():
    findings = {"null_test": {}, "notes": []}

    print("NULL TEST — codebox vs additive_strike(), A2 held 6 s, peak-normalised")
    for name, sg, ratios, *_ in rp.PALETTE:
        ref = norm(rp.additive_strike(ratios))
        cb = norm(render({"seconds": rp.DUR, "params": {"crystal": PALETTE_SLOT[name]},
                          "events": [{"t": 0.0, "hz": 110.0, "vel": 1.0}]}))
        d = float(np.max(np.abs(cb - ref)))
        findings["null_test"][name] = d
        print(f"  {name:<12} {sg:<20} max |diff| = {d:.2e}")

    # ---- the keyboard tour ------------------------------------------------
    A2, C3, E3, A3 = 110.0, 130.81, 164.81, 220.0
    ev, t = [], 0.0
    for slot in range(9):
        ev.append({"t": t, "param": "crystal", "value": slot})
        for hz in (A2, C3, E3, A3):
            ev += [{"t": t + 0.001, "hz": hz, "vel": 0.85}, {"t": t + 0.42, "vel": 0.0}]
            t += 0.5
        ev += [{"t": t + 0.001, "hz": A2, "vel": 0.85}, {"t": t + 1.6, "vel": 0.0}]
        t += 2.4
    tour = render({"seconds": t + 0.5, "params": {"decay": 3.0, "release": 0.25, "attack": 8.0},
                   "events": ev})
    # steps near each key-down (+-6 ms) vs everywhere else: a restrike click
    # would make the first much larger than the second
    d = np.abs(np.diff(tour)) / max(np.max(np.abs(tour)), 1e-12)
    near = np.zeros(len(d), bool)
    for e in ev:
        if e.get("vel", 0) > 0:
            n0 = int(e["t"] * SR)
            near[max(0, n0 - int(0.006 * SR)):n0 + int(0.006 * SR)] = True
    findings["tour_seconds"] = t + 0.5
    findings["tour_largest_step_near_restrikes"] = float(d[near].max())
    findings["tour_largest_step_elsewhere"] = float(d[~near].max())
    write_wav(os.path.join(HERE, "crystal_keyboard_tour.wav"), norm(tour))

    # ---- one strike, nine lattices ----------------------------------------
    ev = [{"t": 0.0, "hz": A2, "vel": 0.9}]
    for slot in range(1, 9):
        ev.append({"t": 2.0 * slot, "param": "crystal", "value": slot})
    ev.append({"t": 17.5, "vel": 0.0})
    held = render({"seconds": 19.0, "params": {"crystal": 0, "decay": 20.0, "release": 1.0},
                   "events": ev})
    write_wav(os.path.join(HERE, "one_strike_nine_lattices.wav"), norm(held))
    jump2 = float(np.max(np.abs(np.diff(held))) / max(np.max(np.abs(held)), 1e-12))
    findings["selector_sweep_largest_step_relative_to_peak"] = jump2

    with open(os.path.join(HERE, "findings.json"), "w") as f:
        json.dump(findings, f, indent=1)
    print(json.dumps(findings, indent=1))


if __name__ == "__main__":
    main()
