#!/usr/bin/env python3
"""
title: 2D Torus Wavetable Synthesizer — rich face — mid-morph-direct.py
born: 2026-11-03
links: [[2D Torus Wavetable Synthesizer]] (connects-to · rich-face-check)
forward_vector: I measure the mid-morph level of surface pairs straight from the catalog's
  1024 x 1024 tables, each scaled to unit energy with its mean removed: the height-map law in
  space, the spectral law on the full 2D lattice. check-pieces.mjs holds the surfaces-and-morphs
  piece to my numbers. (Tools/surface_overlap.py reads rfft2's half lattice, which counts the
  m = 0 column twice, so its figures run a little off mine on pairs heavy in that column, like
  Theta: -6.98 dB against -6.47 dB for Theta to Matern.)
Usage: python3 mid-morph-direct.py
"""
import os
import numpy as np

WT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Wavetables")


def load(n):
    d = open(os.path.join(WT, n + ".wav"), "rb").read()
    i = d.find(b"data")
    k = int.from_bytes(d[i + 4:i + 8], "little")
    W = np.frombuffer(d[i + 8:i + 8 + k], dtype="<f4").astype(float).reshape(1024, 1024)
    W = W - W.mean()
    return W / np.sqrt((W ** 2).mean())


PAIRS = [("10_membrane", "11_chladni_ghost"), ("10_membrane", "12_theta_surface"), ("12_theta_surface", "17_matern_field"),
         ("10_membrane", "15_penrose_lattice"), ("17_matern_field", "18_fisher_ridge")]
for a, b in PAIRS:
    A, B = load(a), load(b)
    sp = 10 * np.log10(((0.5 * A + 0.5 * B) ** 2).mean())
    FA, FB = np.fft.fft2(A) / A.size, np.fft.fft2(B) / A.size
    sc = 10 * np.log10(((0.5 * np.abs(FA) + 0.5 * np.abs(FB)) ** 2).sum() / (np.abs(FA) ** 2).sum())
    ov = (np.abs(FA) * np.abs(FB)).sum() / np.sqrt((np.abs(FA) ** 2).sum() * (np.abs(FB) ** 2).sum())
    print(f"{a:20s} {b:20s} overlap {ov:.3f}  height-map {sp:+.2f} dB  spectral {sc:+.2f} dB")
