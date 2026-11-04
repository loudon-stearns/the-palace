"""Stage 3, second proof — the scanned kernel rebuilt as a small bank of modes.

The full kernel costs 512 multiply-adds per row read per sample (1024 with the
blend between rows). But a surface is periodic along both axes, so its kernel
is exactly a 2D Fourier series:

    h(k, φ) = Σ_(n,m)  C[n,m] · e^{2πi n φ} · e^{2πi m k / L}

and the output splits into one term per mode:

    y[t] = Σ_(n,m)  C[n,m] · e^{2πi n φ[t]} · S_m[t]
    S_m[t] = Σ_k e^{2πi m k / L} x[t−k]  =  e^{2πi m / L} · S_m[t−1] + x[t] − x[t−L]

S_m is a sliding DFT bin: a band-pass at m·fs/L, one complex multiply per sample,
sharing one L-sample delay line. e^{2πi n φ} is a frequency shifter by n·f_mod.
So each mode is a band-pass followed by a shifter, and the bank is exact for the
modes it keeps. The only error is the modes it drops (and a −60 dB sliver from
the full kernel's linear blend between rows, which the bank does not copy).

A Hann window along the taps costs nothing new: a windowed bin is
0.5·S_m − 0.25·S_(m−1) − 0.25·S_(m+1).

Run:  /usr/local/bin/python3 mode_bank.py  → mode_bank_report.json, mode_bank_modes.json
"""
import json, numpy as np
from scipy.signal import lfilter
from surface_io import load_surface
from floquet_kernel import FS, L, run, saw

NINE = {"membrane": "10_membrane", "chladni_ghost": "11_chladni_ghost", "theta": "12_theta_surface",
        "stiff_string": "13_stiff_string", "knot_shadow": "14_knot_shadow", "penrose": "15_penrose_lattice",
        "kuramoto_bloom": "16_kuramoto_bloom", "matern": "17_matern_field", "fisher_ridge": "18_fisher_ridge"}

def kernel(stem): return load_surface(stem)[:, ::1024 // L] / L       # same as floquet_kernel.kernel

def modes(K):
    """Representative modes of the half-plane, strongest first, as (n, m, C, weight).
    A real kernel's modes come in conjugate pairs; keep one of each and count it twice."""
    R = K.shape[0]
    C = np.fft.fft2(K) / (R * L)                    # K = Σ C e^{+2πi(n r/R + m k/L)}
    n = np.fft.fftfreq(R, 1 / R).astype(int); m = np.fft.fftfreq(L, 1 / L).astype(int)
    N, M = np.meshgrid(n, m, indexing="ij")
    rep = (M > 0) & (M < L // 2) | (M == 0) & (N > 0) & (N < R // 2)
    out = [(int(a), int(b), complex(c), 2) for a, b, c in zip(N[rep], M[rep], C[rep])]
    out.append((0, 0, complex(C[0, 0]), 1))
    total = float(np.sum(np.abs(C) ** 2))
    out.sort(key=lambda t: -t[3] * abs(t[2]) ** 2)
    return out, total

def bank(x, fmod, ms, window=False):
    fm = np.broadcast_to(np.asarray(fmod, float), x.shape)
    phi = np.concatenate([[0.0], np.cumsum(fm[:-1])]) / FS
    d = x - np.concatenate([np.zeros(L), x[:-L]])                 # x[t] − x[t−L]
    cache = {}
    def S(mm):
        if mm not in cache:
            cache[mm] = lfilter([1.0], [1.0, -np.exp(2j * np.pi * mm / L)], d.astype(complex))
        return cache[mm]
    y = np.zeros(len(x))
    for n, mm, c, w in ms:
        b = 0.5 * S(mm) - 0.25 * S(mm - 1) - 0.25 * S(mm + 1) if window else S(mm)
        y += w * np.real(c * np.exp(2j * np.pi * n * phi) * b)
    return y, len(cache)

def snr(ref, y): return float(10 * np.log10(np.sum(ref ** 2) / np.sum((ref - y) ** 2)))

if __name__ == "__main__":
    N = 4 * FS
    glide = 0.25 * (80 / 0.25) ** (np.arange(N) / N)
    x = saw(110, N)
    counts = [4, 8, 16, 32, 64]
    report = {"fs": FS, "taps": L, "input": "saw 110 Hz, scan glides 0.25 → 80 Hz over 4 s",
              "full_kernel_mults_per_sample": 2 * L, "surfaces": {}}
    keep = {}
    for name, stem in NINE.items():
        K = kernel(stem)
        ms, total = modes(K)
        ref = run(K, x, glide)
        cum = np.cumsum([w * abs(c) ** 2 for _, _, c, w in ms]) / total
        row = {"energy_captured": {}, "snr_db_vs_full_kernel": {}, "bins_needed": {}}
        for nm in counts:
            y, nb = bank(x, glide, ms[:nm])
            row["energy_captured"][nm] = round(float(cum[nm - 1]), 4)
            row["snr_db_vs_full_kernel"][nm] = round(snr(ref, y), 1)
            row["bins_needed"][nm] = nb
        row["modes_for_99pct_energy"] = int(np.searchsorted(cum, 0.99) + 1)
        row["modes_for_999pct_energy"] = int(np.searchsorted(cum, 0.999) + 1)
        row["strongest_8"] = [{"shift_rung_n": n, "band_hz": round(abs(mm) * FS / L, 2),
                               "share": round(w * abs(c) ** 2 / total, 3)} for n, mm, c, w in ms[:8]]
        # Hann along the taps: same modes, windowed bins — how much does the sound change?
        yh, _ = bank(x, glide, ms[:32], window=True)
        y32, _ = bank(x, glide, ms[:32])
        row["hann_vs_plain_32_modes_difference_db"] = round(-snr(y32, yh), 1)
        report["surfaces"][name] = row
        keep[name] = [[n, mm, round(c.real, 9), round(c.imag, 9), w] for n, mm, c, w in ms[:64]]
        print(name, row["modes_for_99pct_energy"], row["snr_db_vs_full_kernel"])
    json.dump(report, open("mode_bank_report.json", "w"), indent=1)
    json.dump({"fs": FS, "taps": L, "format": "[n, m, re, im, weight]", "modes": keep},
              open("mode_bank_modes.json", "w"))
