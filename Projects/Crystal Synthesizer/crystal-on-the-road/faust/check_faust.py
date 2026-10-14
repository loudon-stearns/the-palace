#!/usr/bin/env python3
"""
check_faust.py — is the Faust crystal the proofs' crystal?

Builds crystal.dsp into a tiny command-line renderer (render-arch.cpp, double
precision), holds A2 for six seconds on each palette mineral, and compares it
sample for sample with additive_strike() from ../../palette-strikes and with the
RNBO codebox run in Node. Both sides peak-normalised. Writes faust-findings.json.

crystal-faust-rnbo.maxpat beside this file was made from the same crystal.dsp by
`faust2rnbo -midi -nvoices 8 crystal.dsp` (Faust 2.88; faust2rnbo needs the
py2max package at its 2023 layout, see README). It is a second, independent
route into RNBO: Faust writes the codebox, RNBO allocates the voices.
"""
import json, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "palette-strikes"))
import render_palette as rp  # noqa: E402

BIN = "/tmp/crystal-render-faust"
SLOT = {"Diamond": 0, "Fluorite": 1, "Emerald": 3, "Ruby": 4, "Amethyst": 5, "Topaz": 6, "Labradorite": 8}


def build():
    cpp = "/tmp/crystal-render-faust.cpp"
    subprocess.run(["faust", "-double", "-a", os.path.join(HERE, "render-arch.cpp"),
                    os.path.join(HERE, "crystal.dsp"), "-o", cpp], check=True)
    subprocess.run(["c++", "-std=c++17", "-O2", "-DFAUSTFLOAT=double", "-I/opt/homebrew/include",
                    cpp, "-o", BIN], check=True)


def faust(slot, hz=110.0, secs=rp.DUR):
    raw = subprocess.run([BIN, str(slot), str(hz), str(secs)], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)


def codebox(slot):
    d = os.path.join(HERE, "..", "..", "playable-crystal")
    import json as j, tempfile
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        j.dump({"seconds": rp.DUR, "params": {"crystal": slot}, "events": [{"t": 0, "hz": 110.0, "vel": 1.0}]}, f)
        p = f.name
    raw = subprocess.run(["node", "render-score.mjs", p, "44100"], capture_output=True, check=True, cwd=d).stdout
    os.unlink(p)
    return np.frombuffer(raw, dtype=np.float32).astype(float)


def norm(a, peak=0.85):
    m = float(np.max(np.abs(a)))
    return a if m < 1e-12 else a * (peak / m)


def main():
    build()
    out = {}
    for name, sg, ratios, *_ in rp.PALETTE:
        fa = norm(faust(SLOT[name]))
        out[name] = {"vs_proofs": float(np.max(np.abs(fa - norm(rp.additive_strike(ratios))))),
                     "vs_codebox": float(np.max(np.abs(fa - norm(codebox(SLOT[name])))))}
        print(f"{name:<12} {sg:<20} vs proofs {out[name]['vs_proofs']:.1e}   vs codebox {out[name]['vs_codebox']:.1e}")
    with open(os.path.join(HERE, "faust-findings.json"), "w") as f:
        json.dump(out, f, indent=1)


if __name__ == "__main__":
    main()
