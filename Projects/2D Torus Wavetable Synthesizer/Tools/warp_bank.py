#!/usr/bin/env python3
"""
warp_bank.py
============

The lookup-table-and-crossfade machinery the Torus Warping Catalog keeps
pointing at, built once. A *bank* is a short stack of surfaces baked offline
from one source surface by one coefficient-space warp at a handful of
settings. At play time the scanner holds a single knob, `pos`, in
[0, frames-1], reads the two neighbouring frames with the same toroidal
bilinear lookup as scan_surface.py, and crossfades them. Two lookups and one
lerp per sample, whatever the warp.

The warps baked here (catalog numbers):

    #3  diffuse    c_mn * exp(-t (m^2+n^2) / K0^2)         heat equation on T^2
    #4  aniso      c_mn * exp(-t (r k_par^2 + k_perp^2)/K0^2), k rotated by theta
    #5  rotate     move every lattice point (m,n) by angle theta, splat onto
                   its four integer neighbours with bilinear weights
    #7  plate      c_mn * ((1-a) + a * ring(m,n))          ring m^2+n^2 = R^2
    #7  stiff      c_mn * ((1-a) + a * ridge(m,n))         ridge n = B m^3
    #2  shear      c'_{m,n} = c_{m - s n, n}               integer s only

Every frame is re-normalised to the source surface's RMS (DC removed) so a
crossfade moves the timbre, not the level; the energy each warp *kept* before
normalising is reported, because a mask can only carve what a surface already
holds.

What the bank cannot do, and the shear check that proves it
----------------------------------------------------------
Every warp here changes WHICH lattice points carry energy. None of them can
change WHERE a lattice point sounds: f_mn = m*w1 + n*w2 is fixed by the two
scan rates. So at a rational ratio every bank frame stays exactly harmonic;
inharmonicity is still the ratio's job alone.

Integer shear is the sharp case. c'_{m,n} = c_{m-sn,n} is algebraically
W'(p1, p2) = W(p1, p2 + s p1), so scanning the sheared surface at (w1, w2) is
sample-for-sample the original scanned at (w1, w2 + s w1): a retune, not a
warp. `--check-shear` renders both and prints the difference. A continuous
shear crossfaded between integer frames is therefore two retuned voices mixed,
not one voice bending.

Dependencies: numpy + Tools/tinyplot.py (house contract).

Usage
-----
    python3 warp_bank.py --check-shear
    python3 warp_bank.py --tour Wavetables/15_penrose_lattice.wav --out-dir "Warp Bank"
    python3 warp_bank.py --measure
    python3 warp_bank.py --export-bank Wavetables/15_penrose_lattice.wav diffuse \
        --size 512 -o "Warp Bank/penrose_diffuse_bank.wav"
"""
from __future__ import annotations
import argparse
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from scan_surface import SR, load_surface, write_float_wav, fade, harmonicity  # noqa: E402

K0 = 16.0   # lattice radius that sets the diffusion clock: t=1 halves... e^-1 at |k|=16


# ---------------------------------------------------------------------------
# Lattice coordinates. Rows are phi2 (n), columns phi1 (m), as everywhere here.
# ---------------------------------------------------------------------------

def lattice(N: int):
    k = np.fft.fftfreq(N, 1.0 / N)          # signed integers 0..N/2-1, -N/2..-1
    n, m = np.meshgrid(k, k, indexing="ij")  # n down the rows, m across columns
    return m, n


def rms_ac(W: np.ndarray) -> float:
    return float(np.sqrt(np.mean((W - W.mean()) ** 2)))


MAX_GAIN = 10.0   # never lift a frame more than +20 dB: a mask that carved a
                  # surface to dust should sound quiet, not like amplified dust


def from_coeffs(C: np.ndarray, target_rms: float):
    W = np.real(np.fft.ifft2(C))
    W = W - W.mean()
    kept = rms_ac(W)
    return (W * min(target_rms / kept, MAX_GAIN) if kept > 0 else W), kept


# ---------------------------------------------------------------------------
# The warps. Each takes the source spectrum C and one setting, returns C'.
# ---------------------------------------------------------------------------

def w_diffuse(C, t):
    m, n = lattice(C.shape[0])
    return C * np.exp(-t * (m * m + n * n) / K0 ** 2)


def w_aniso(C, theta, t=0.6, r=0.04):
    """Directional low-pass: strong along theta's perpendicular, weak (r) along theta."""
    m, n = lattice(C.shape[0])
    kp = m * np.cos(theta) + n * np.sin(theta)
    kq = -m * np.sin(theta) + n * np.cos(theta)
    return C * np.exp(-t * (r * kp * kp + kq * kq) / K0 ** 2)


def w_rotate(C, theta):
    """Rotate lattice positions by theta and bilinear-splat back onto Z^2.
    The splat is applied to the full signed lattice, so (m,n) and (-m,-n) land
    mirror-symmetrically and the result stays Hermitian (a real surface)."""
    N = C.shape[0]
    m, n = lattice(N)
    c, s = np.cos(theta), np.sin(theta)
    x = m * c - n * s
    y = m * s + n * c
    x0, y0 = np.floor(x), np.floor(y)
    fx, fy = x - x0, y - y0
    out = np.zeros_like(C)
    keep = (np.abs(x) < N / 2 - 1) & (np.abs(y) < N / 2 - 1)   # drop what would alias
    for dx, dy, wgt in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)),
                        (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        cols = (x0 + dx).astype(np.int64) % N
        rows = (y0 + dy).astype(np.int64) % N
        np.add.at(out, (rows[keep], cols[keep]), (C * wgt)[keep])
    return out


def median_radius(C):
    """Lattice radius below which half the surface's (AC) energy sits."""
    m, n = lattice(C.shape[0])
    r = np.sqrt(m * m + n * n).ravel()
    e = (np.abs(C) ** 2).ravel()
    e[r == 0] = 0
    o = np.argsort(r)
    c = np.cumsum(e[o])
    return float(r[o][np.searchsorted(c, c[-1] / 2)])


def w_plate(C, a, R=None, width=None):
    """Ring m^2+n^2 = R^2 — a thin plate's dispersion, one radius at a time.
    R defaults to the surface's own median radius, so the ring always lands
    where the surface has something to keep."""
    m, n = lattice(C.shape[0])
    R = median_radius(C) if R is None else R
    width = max(1.0, 0.25 * R) if width is None else width
    ring = np.exp(-((np.sqrt(m * m + n * n) - R) / width) ** 2)
    return C * ((1 - a) + a * ring)


def w_stiff(C, a, B=0.004, width=1.5):
    """Ridge n = B*m^3. Scanned with a slow w2, a partial at index m sounds at
    m*w1 + B*m^3*w2 = m*w1*(1 + B*m^2*w2/w1): the stiff-string stretch, made a
    place on the lattice."""
    m, n = lattice(C.shape[0])
    ridge = np.exp(-((n - B * m ** 3) / width) ** 2) + np.exp(-((n + B * m ** 3) / width) ** 2)
    ridge = np.minimum(ridge, 1.0)
    return C * ((1 - a) + a * ridge)


def w_shear_int(W, s):
    """Exact integer shear in surface space: W'(x, y) = W(x, y + s*x)."""
    N = W.shape[0]
    rows = (np.arange(N)[:, None] + s * np.arange(N)[None, :]) % N
    return W[rows, np.arange(N)[None, :]]


WARPS = {
    #  name      fn          settings baked into the bank                         label
    "diffuse": (w_diffuse, [0.0, 0.02, 0.06, 0.18, 0.5, 1.5, 4.0], "t"),
    "aniso":   (w_aniso,   list(np.linspace(0, np.pi, 9)), "theta"),
    "rotate":  (w_rotate,  list(np.linspace(0, np.pi / 4, 7)), "theta"),
    "plate":   (w_plate,   [0.0, 1.0], "a"),
    "stiff":   (w_stiff,   [0.0, 1.0], "a"),
}


def bake(W: np.ndarray, warp: str):
    fn, settings, _ = WARPS[warp]
    W0 = W - W.mean()
    target = rms_ac(W0)
    C = np.fft.fft2(W0)
    frames, kept = [], []
    for v in settings:
        F, k = from_coeffs(fn(C, v), target)
        frames.append(F)
        kept.append(k / target)
    return np.stack(frames), settings, kept


# ---------------------------------------------------------------------------
# The runtime: scan a bank with a moving position. Same lookup as scan().
# ---------------------------------------------------------------------------

def lookup(S, x, y):
    rows, cols = S.shape
    x = x * cols
    y = y * rows
    x0 = np.floor(x).astype(np.int64) % cols
    y0 = np.floor(y).astype(np.int64) % rows
    x1, y1 = (x0 + 1) % cols, (y0 + 1) % rows
    fx, fy = x - np.floor(x), y - np.floor(y)
    top = S[y0, x0] * (1 - fx) + S[y0, x1] * fx
    bot = S[y1, x0] * (1 - fx) + S[y1, x1] * fx
    return top * (1 - fy) + bot * fy


def scan_bank(bank, base, ratio, pos, t0=0.0):
    """pos: array of bank positions per sample (float, 0..frames-1)."""
    n = len(pos)
    t = t0 + np.arange(n) / SR
    p1 = (base * t) % 1.0
    p2 = (base * ratio * t) % 1.0
    pos = np.clip(pos, 0, len(bank) - 1)
    i0 = np.minimum(np.floor(pos).astype(int), len(bank) - 2)
    f = pos - i0
    out = np.zeros(n)
    for i in np.unique(i0):
        sel = i0 == i
        a = lookup(bank[i], p1[sel], p2[sel])
        b = lookup(bank[i + 1], p1[sel], p2[sel])
        out[sel] = a * (1 - f[sel]) + b * f[sel]
    return out


def centroid(sig):
    w = np.hanning(len(sig))
    sp = np.abs(np.fft.rfft(sig * w)) ** 2
    fr = np.fft.rfftfreq(len(sig), 1 / SR)
    return float((sp * fr).sum() / sp.sum())


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def check_shear(path):
    W = load_surface(path)
    base, ratio, dur = 110.0, 1.5, 2.0
    n = int(dur * SR)
    t = np.arange(n) / SR
    report = []
    for s in (1, 2, -1):
        Ws = w_shear_int(W, s)
        # sheared surface scanned at (w1, w2) ...
        a = lookup(Ws, (base * t) % 1, (base * ratio * t) % 1)
        # ... vs the ORIGINAL scanned at (w1, w2 + s*w1)
        b = lookup(W, (base * t) % 1, ((base * ratio + s * base) * t) % 1)
        d = np.max(np.abs(a - b)) / np.max(np.abs(b))
        report.append((s, d))
        print(f"shear s={s:+d}: max |sheared@(w1,w2) - original@(w1,w2+s*w1)| = {d:.2e} of peak")
    return report


def tour(path, out_dir, tag, base=110.0, ratio=1.5, seg=5.0):
    """Five warps in turn, each swept 0 -> max -> 0 over `seg` seconds, on one
    held, locked 3:2 tone (fundamental base/2). Phases run on one clock."""
    W = load_surface(path)
    pieces = []
    t0 = 0.0
    order = ["diffuse", "aniso", "rotate", "plate", "stiff"]
    for name in order:
        bank, settings, kept = bake(W, name)
        n = int(seg * SR)
        u = np.linspace(0, 1, n)
        if name == "aniso":            # angle sweeps all the way round, at full strength
            pos = u * (len(bank) - 1)
        else:
            pos = np.sin(np.pi * u) ** 2 * (len(bank) - 1)
        pieces.append(scan_bank(bank, base, ratio, pos, t0))
        t0 += seg
        print(f"  {name:8s} baked {len(bank)} frames; energy kept {min(kept):.2f}..{max(kept):.2f}")
    sig = np.concatenate(pieces)
    sig = fade(sig * (0.9 / np.max(np.abs(sig))), 12.0)
    os.makedirs(out_dir, exist_ok=True)
    wav = os.path.join(out_dir, f"warp_bank_tour_{tag}.wav")
    write_float_wav(wav, sig)
    print("wrote", wav)
    return wav, order, seg


def measure(paths, base=110.0, dur=1.5):
    """Freeze each warp at its strongest bank frame. Locked 3:2 -> share of
    energy on harmonics of base/2; open (golden) -> centroid only."""
    rows = []
    gold = (1 + 5 ** 0.5) / 2
    n = int(dur * SR)
    t = np.arange(n) / SR
    for path in paths:
        W = load_surface(path)
        name = os.path.basename(path)[3:-4]
        row = [name]
        for warp in ["none", "diffuse", "aniso", "rotate", "plate", "stiff"]:
            if warp == "none":
                S, kept = W - W.mean(), 1.0
            else:
                bank, settings, keptl = bake(W, warp)
                k = {"aniso": 2}.get(warp, len(bank) - 1)   # each warp at its tour maximum
                S, kept = bank[k], keptl[k]
            lk = lookup(S, (base * t) % 1, (base * 1.5 * t) % 1)
            op = lookup(S, (base * t) % 1, (base * gold * t) % 1)
            # the 'dead line': lattice points k*(3,-2) sound at 0 Hz on a 3:2
            # lock, so part of any surface goes silent (DC) when the knot closes
            dead = lk.mean() ** 2 / np.mean(lk ** 2)
            lk, op = lk - lk.mean(), op - op.mean()
            h = harmonicity(lk, base / 2)
            row.append((centroid(lk), h, centroid(op), kept, dead))
        rows.append(row)
    return rows


def export_bank(path, warp, size, out):
    """Bake a bank, resample each frame to size x size by truncating its
    spectrum (no aliasing), and write frames back to back, row-major — the
    buffer layout torus_2d_bank.codebox reads."""
    W = load_surface(path)
    bank, settings, kept = bake(W, warp)
    N = W.shape[0]
    h = size // 2
    frames = []
    for F in bank:
        C = np.fft.fftshift(np.fft.fft2(F))
        c = N // 2
        Cs = C[c - h:c + h, c - h:c + h] * (size * size) / (N * N)
        frames.append(np.real(np.fft.ifft2(np.fft.ifftshift(Cs))))
    flat = np.concatenate([f.ravel() for f in frames])
    flat = flat * (0.95 / np.max(np.abs(flat)))
    write_float_wav(out, flat)
    print(f"wrote {out}: {len(frames)} frames of {size}x{size} ({warp}, settings {np.round(settings, 3).tolist()})")


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    p.add_argument("--check-shear", action="store_true")
    p.add_argument("--tour", metavar="SURFACE")
    p.add_argument("--measure", action="store_true")
    p.add_argument("--export-bank", nargs=2, metavar=("SURFACE", "WARP"))
    p.add_argument("--size", type=int, default=512)
    p.add_argument("--out-dir", default="Warp Bank")
    p.add_argument("-o", "--out")
    a = p.parse_args(argv)
    wt = os.path.join(HERE, "..", "Wavetables")
    if a.check_shear:
        check_shear(os.path.join(wt, "15_penrose_lattice.wav"))
    if a.tour:
        tag = os.path.basename(a.tour)[3:-4]
        tour(a.tour, a.out_dir, tag)
    if a.measure:
        names = ["15_penrose_lattice", "10_membrane", "14_knot_shadow", "12_theta_surface"]
        for r in measure([os.path.join(wt, n + ".wav") for n in names]):
            print(r[0])
            for w, (cl, h, co, k, d) in zip(["none", "diffuse", "aniso", "rotate", "plate", "stiff"], r[1:]):
                print(f"   {w:8s} locked {cl:7.0f} Hz ({100*h:5.1f}% harmonic, {100*d:4.1f}% dead)  open {co:7.0f} Hz  kept {k:.2f}")
    if a.export_bank:
        export_bank(a.export_bank[0], a.export_bank[1], a.size, a.out)


if __name__ == "__main__":
    main()
