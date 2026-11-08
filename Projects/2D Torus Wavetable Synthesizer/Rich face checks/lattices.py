#!/usr/bin/env python3
"""
title: 2D Torus Wavetable Synthesizer — rich face — lattices.py
born: 2026-11-03
links: [[2D Torus Wavetable Synthesizer]] (connects-to · rich-face-tool)
forward_vector: I read the nine named surfaces out of the catalog WAVs and write
  each one's 2D lattice spectrum — the c_mn the page's Architecture section
  names — as the small JSON the rich face's pieces rebuild their surfaces from.
  I am rerun whenever a catalog surface is rebuilt; the pieces never read a WAV.

Writes ../2D Torus Wavetable Synthesizer — rich — lattices.json

Convention (the page's): W(phi1, phi2) = dc + sum over kept terms of
    a * cos(m*phi1 + n*phi2 + theta)
phi1 runs along a row (X, the column index), phi2 down the rows (Y). Each term
is one conjugate pair of the full lattice, so a = 2|c_mn|. Kept: the largest
terms holding 99.5% of the surface's AC energy, |m|, |n| <= 120.
Usage: python3 lattices.py   (from anywhere)
"""
import json, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
BUNDLE = os.path.dirname(HERE)
WT = os.path.join(BUNDLE, "Wavetables")
OUT = os.path.join(BUNDLE, "2D Torus Wavetable Synthesizer — rich — lattices.json")

SURFACES = [
    ("10_membrane", "Membrane", "4-fold"),
    ("11_chladni_ghost", "Chladni Ghost", "4-fold"),
    ("12_theta_surface", "Theta Surface", "modular"),
    ("13_stiff_string", "Stiff String", None),
    ("14_knot_shadow", "Knot Shadow", "(p,q) cable"),
    ("15_penrose_lattice", "Penrose Lattice", "5-fold (local)"),
    ("16_kuramoto_bloom", "Kuramoto Bloom", None),
    ("17_matern_field", "Matérn Field", None),
    ("18_fisher_ridge", "Fisher Ridge", None),
]
KEEP, CAP, N = 0.995, 120, 1024


def load(path):
    d = open(path, "rb").read()
    i = d.find(b"data")
    n = int.from_bytes(d[i + 4:i + 8], "little")
    return np.frombuffer(d[i + 8:i + 8 + n], dtype="<f4").astype(np.float64).reshape(N, N)


def signed(i):
    return i if i < N // 2 else i - N


def lattice(W):
    C = np.fft.fft2(W) / W.size          # C[n_idx (rows, phi2), m_idx (cols, phi1)]
    dc = float(C[0, 0].real)
    terms = []
    for ni in range(N):
        n = signed(ni)
        for mi in range(N):
            m = signed(mi)
            # one representative per conjugate pair: n > 0, or n == 0 and m > 0
            if not (n > 0 or (n == 0 and m > 0)) or abs(m) > CAP or abs(n) > CAP:
                continue
            c = C[ni, mi]
            p = abs(c) ** 2
            if p > 0:
                terms.append((2 * p, m, n, c))
    terms.sort(key=lambda t: -t[0])
    total = sum(t[0] for t in terms)
    kept, acc = [], 0.0
    for p, m, n, c in terms:
        kept.append([m, n, float(f"{2 * abs(c):.5g}"), float(f"{np.angle(c):.5f}")])
        acc += p
        if acc >= KEEP * total:
            break
    return dc, kept, acc / total, float(np.sqrt(total))


def rebuild(dc, kept, M=128):
    g = np.arange(M) * 2 * np.pi / M
    P1, P2 = np.meshgrid(g, g)
    W = np.full((M, M), dc)
    for m, n, a, th in kept:
        W += a * np.cos(m * P1 + n * P2 + th)
    return W


def main():
    out = {
        "title": "2D Torus Wavetable Synthesizer — rich — lattices",
        "born": "2026-11-03",
        "links": [{"target": "[[2D Torus Wavetable Synthesizer]]", "type": "connects-to", "label": "rich-face-data"}],
        "forward_vector": "I am the nine named surfaces as their lattice spectra, read from the catalog WAVs by Rich face checks/lattices.py, so the rich face's pieces can rebuild each surface and draw where its energy lives. I change only when a catalog surface is rebuilt.",
        "convention": "W(phi1, phi2) = dc + sum a*cos(m*phi1 + n*phi2 + theta); phi1 along a row (X), phi2 down the rows (Y); each term is one conjugate pair; kept = largest terms holding 99.5% of AC energy, |m|,|n| <= 120",
        "surfaces": [],
    }
    for slug, name, sym in SURFACES:
        W = load(os.path.join(WT, slug + ".wav"))
        dc, kept, frac, rms = lattice(W)
        R = rebuild(dc, kept)
        Wd = W[:: N // 128, :: N // 128]
        err = float(np.sqrt(np.mean((R - Wd) ** 2)) / np.sqrt(np.mean((Wd - dc) ** 2)))
        out["surfaces"].append({"id": slug, "name": name, "symmetry": sym, "dc": round(dc, 5),
                                "rms": round(rms, 5), "kept_energy": round(frac, 5), "terms": kept})
        print(f"{name:16s} terms {len(kept):4d}  energy {frac:.4f}  rel. rms error {err:.4f}")
    with open(OUT, "w") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("wrote", OUT, os.path.getsize(OUT), "bytes")


if __name__ == "__main__":
    main()
