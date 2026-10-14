#!/usr/bin/env python3
"""
check_poly.py — the polyphonic crystal, checked in Node before anyone opens Max.

1. ONE VOICE IS STILL THE PROOFS. A single held A2 through the polyphonic
   renderer (8 voices, crystal-voice.codebox) against the monophonic
   crystal-bank.codebox and against additive_strike() from the proofs.
2. THE NOTE-STACK BUG IS GONE. Hold A2, add E3, lift A2. The mono patch
   released the E3 (last-note-wins, no stack); the poly patch must not.
3. STEALING AND MUTING. Twelve notes into eight voices with a long release:
   how many steals, the largest sample step near a note-on against anywhere
   else (a steal that clicks would show here), and whether every voice mutes
   itself once the sound is gone (active voices back to 0).
4. HEADROOM. The peak of an eight-note full-velocity cluster at level 0.5,
   after the fixed 0.3 trim that follows the voice sum.
5. WHICH CRYSTALS CAN TAKE A CHORD. New question that polyphony asks: the
   same triad on each lattice, scored with Sethares' roughness model on the
   partials (amplitudes 0.7^k). "Between-note roughness" is the chord's
   roughness minus the three notes' own roughness, i.e. the friction the
   notes make *with each other*. A harmonic tone with the same roll-off is the
   yardstick.
6. DEMO. crystal_chords.wav — Am F C G on each palette mineral.

Needs node and numpy. Writes poly-findings.json.
"""
import json, os, subprocess, sys, tempfile, struct
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "palette-strikes"))
import render_palette as rp  # noqa: E402

SR = 44100
SLOT = {"Diamond": 0, "Fluorite": 1, "Emerald": 3, "Ruby": 4, "Amethyst": 5, "Topaz": 6, "Labradorite": 8}


def node(script, score, cwd):
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(score, f)
        p = f.name
    try:
        r = subprocess.run(["node", script, p, str(SR)], capture_output=True, check=True, cwd=cwd)
    finally:
        os.unlink(p)
    stats = json.loads(r.stderr) if r.stderr.strip().startswith(b"{") else {}
    return np.frombuffer(r.stdout, dtype=np.float32).astype(float), stats


def poly(score):
    return node(os.path.join(HERE, "poly-render.mjs"), score, HERE)


def mono(score):
    d = os.path.join(HERE, "..", "playable-crystal")
    return node(os.path.join(d, "render-score.mjs"), score, d)[0]


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


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def rms(a):
    return float(np.sqrt(np.mean(a * a))) if len(a) else 0.0


# Sethares (1993) roughness of a set of partials.
def roughness(freqs, amps):
    f = np.asarray(freqs, float); a = np.asarray(amps, float)
    d = 0.0
    for i in range(len(f)):
        for j in range(i + 1, len(f)):
            lo, hi = min(f[i], f[j]), max(f[i], f[j])
            s = 0.24 / (0.0207 * lo + 18.96)
            x = s * (hi - lo)
            d += min(a[i], a[j]) * (np.exp(-3.5 * x) - np.exp(-5.75 * x))
    return d


def tone(root, ratios, roll=0.7):
    return [root * r for r in ratios], [roll ** k for k in range(len(ratios))]


def main():
    F = {}

    # 1 ------------------------------------------------------------------
    print("1. one voice vs the mono codebox vs the proofs (A2 held 6 s)")
    F["one_voice"] = {}
    for name, sg, ratios, *_ in rp.PALETTE:
        p, _ = poly({"seconds": rp.DUR, "params": {"crystal": SLOT[name], "level": 0.5},
                     "events": [{"t": 0, "note": 45, "vel": 127}]})
        m = mono({"seconds": rp.DUR, "params": {"crystal": SLOT[name], "level": 0.5},
                  "events": [{"t": 0, "hz": mtof(45), "vel": 1.0}]})
        ref = norm(rp.additive_strike(ratios))
        F["one_voice"][name] = {"vs_mono": float(np.max(np.abs(p / 0.3 - m))),
                                "vs_proofs": float(np.max(np.abs(norm(p) - ref)))}
        print(f"  {name:<12} vs mono {F['one_voice'][name]['vs_mono']:.1e}   vs proofs {F['one_voice'][name]['vs_proofs']:.1e}")

    # 2 ------------------------------------------------------------------
    print("2. hold A2, add E3, lift A2 at 1.0 s: is E3 still sounding at 1.5 s?")
    ev_p = [{"t": 0, "note": 45, "vel": 100}, {"t": 0.5, "note": 52, "vel": 100}, {"t": 1.0, "note": 45, "vel": 0}]
    ev_m = [{"t": 0, "hz": mtof(45), "vel": 100 / 127}, {"t": 0.5, "hz": mtof(52), "vel": 100 / 127},
            {"t": 1.0, "vel": 0}]   # a mono keyboard: lifting the old key sends gate 0
    pr = {"crystal": 4, "release": 0.1, "decay": 5.5}
    p, _ = poly({"seconds": 2.0, "params": pr, "events": ev_p})
    m = mono({"seconds": 2.0, "params": pr, "events": ev_m})
    w = slice(int(1.45 * SR), int(1.55 * SR)); w0 = slice(int(0.85 * SR), int(0.95 * SR))
    F["note_stack"] = {"poly_E3_kept": rms(p[w]) / rms(p[w0]), "mono_E3_kept": rms(m[w]) / rms(m[w0])}
    print(f"  loudness at 1.5 s relative to 0.9 s: poly {F['note_stack']['poly_E3_kept']:.2f}   mono {F['note_stack']['mono_E3_kept']:.4f}")

    # 3 ------------------------------------------------------------------
    print("3. twelve notes into eight voices, release 1.5 s")
    notes = [45, 52, 57, 60, 64, 69, 72, 76, 79, 81, 84, 88]
    ev = []
    for i, nn in enumerate(notes):
        ev += [{"t": 0.15 * i, "note": nn, "vel": 110}, {"t": 0.15 * i + 1.2, "note": nn, "vel": 0}]
    s, st = poly({"seconds": 30.0, "params": {"crystal": 6, "release": 1.5, "decay": 4.0, "attack": 5},
                  "events": ev})
    d = np.abs(np.diff(s)) / max(np.max(np.abs(s)), 1e-12)
    near = np.zeros(len(d), bool)
    for e in ev:
        if e["vel"] > 0:
            n0 = int(e["t"] * SR); near[max(0, n0 - 265):n0 + 265] = True
    F["stealing"] = {"steals": st["steals"], "max_active": st["maxActive"],
                     "active_voices_each_second": st["activeEverySecond"],
                     "largest_step_near_note_ons": float(d[near].max()),
                     "largest_step_elsewhere": float(d[~near].max())}
    print("  ", {k: v for k, v in F["stealing"].items() if k != "active_voices_each_second"})
    print("   active voices each second:", st["activeEverySecond"])

    # 4 ------------------------------------------------------------------
    cl = [45, 48, 52, 55, 57, 60, 64, 67]
    worst = 0.0
    for name in SLOT:
        s, _ = poly({"seconds": 1.0, "params": {"crystal": SLOT[name], "attack": 1},
                     "events": [{"t": 0, "note": n, "vel": 127} for n in cl]})
        worst = max(worst, float(np.max(np.abs(s))))
    F["headroom_8_note_cluster_peak_at_level_0.5"] = worst
    print(f"4. peak of an 8-note full-velocity cluster at level 0.5, worst crystal: {worst:.2f}")

    # 5 ------------------------------------------------------------------
    print("5. between-note roughness of a triad (higher = the notes fight)")
    rows = []
    harm = [1, 2, 3, 4, 5, 6, 7, 8]
    for chord_name, chord in (("A minor (A2 C3 E3)", [45, 48, 52]), ("open fifth (A2 E3)", [45, 52])):
        for name, ratios in [("harmonic (yardstick)", harm)] + [(n, r) for n, _, r, *_ in rp.PALETTE]:
            fs, As, own = [], [], 0.0
            for nn in chord:
                f, a = tone(mtof(nn), ratios); fs += f; As += a; own += roughness(f, a)
            between = roughness(fs, As) - own
            rows.append([chord_name, name, round(between, 3)])
    F["chord_roughness"] = rows
    for r in rows:
        print("  ", r)

    # 6 ------------------------------------------------------------------
    prog = [[45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62]]  # Am F C G
    ev, t = [], 0.0
    for name in SLOT:
        ev.append({"t": t, "param": "crystal", "value": SLOT[name]})
        for ch in prog:
            for nn in ch:
                ev += [{"t": t + 0.001, "note": nn, "vel": 96}, {"t": t + 0.85, "note": nn, "vel": 0}]
            t += 0.9
        t += 1.4
    s, st = poly({"seconds": t + 1.0, "params": {"decay": 3.0, "release": 0.35, "attack": 6, "level": 0.5},
                  "events": ev})
    F["chords_demo"] = {"seconds": t + 1.0, "order": list(SLOT), "steals": st["steals"],
                        "max_active": st["maxActive"]}
    write_wav(os.path.join(HERE, "crystal_chords.wav"), norm(s))

    with open(os.path.join(HERE, "poly-findings.json"), "w") as f:
        json.dump(F, f, indent=1)


if __name__ == "__main__":
    main()
