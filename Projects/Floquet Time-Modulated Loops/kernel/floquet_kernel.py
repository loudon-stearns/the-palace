"""Stage 3 first proof — a wavetable surface read as a Floquet kernel.

One surface S[row, col] from the 2D Torus library becomes a filter that changes
over time. The fast axis (col) is read as the filter's taps, the impulse
response along lag k. The slow axis (row) is scanned by a phasor at f_mod, so
every output sample uses the taps of the row the phasor is on:

    y[n] = sum_k  h(k, phi[n]) * x[n-k]          phi advances at f_mod

Frozen (f_mod = 0) it is an ordinary filter. Scanned, it is a Floquet system:
a sine at f0 comes out as a ladder of lines at  ±f0 + n*f_mod, and the line
for rung n is the row-mode-n part of the kernel heard as a filter at f0.
So a surface mode (row n, col m) becomes a passband at m*fs/L whose output is
shifted by n*f_mod: the surface's 2D spectrum IS the filter's bi-frequency map.

Run:  /usr/local/bin/python3 floquet_kernel.py   → kernel_report.json, kernel_map.png, four WAVs
"""
import json, numpy as np
from scipy.io import wavfile
from surface_io import load_surface

FS, L = 48000, 512           # 512 taps: col mode m → passband at m * 93.75 Hz
SURF = {"penrose": "15_penrose_lattice", "theta": "12_theta_surface", "membrane": "10_membrane"}

def kernel(stem):
    S = load_surface(stem)
    return S[:, ::1024 // L] / L                      # K[row, k]

def run(K, x, fmod):
    """fmod: scalar or per-sample array (Hz). Linear interpolation between rows."""
    R = K.shape[0]
    fm = np.broadcast_to(np.asarray(fmod, float), x.shape)
    phase = (np.concatenate([[0.0], np.cumsum(fm[:-1])]) / FS) % 1.0 * R
    j = np.floor(phase).astype(int) % R; w = phase - np.floor(phase)
    xp = np.concatenate([np.zeros(L - 1), x])
    y = np.empty_like(x)
    for a in range(0, len(x), 4096):
        b = min(a + 4096, len(x))
        X = np.lib.stride_tricks.sliding_window_view(xp[a:b + L - 1], L)[:, ::-1]   # X[i,k] = x[n-k]
        y[a:b] = (1 - w[a:b]) * np.einsum('ik,ik->i', X, K[j[a:b]]) \
               + w[a:b] * np.einsum('ik,ik->i', X, K[(j[a:b] + 1) % R])
    return y

def row_modes(K):
    """ĥ_n(k): the kernel's Fourier series along the scanned axis, with the
    linear-interpolation taper sinc²(n/R)."""
    R = K.shape[0]
    n = np.fft.fftfreq(R, 1 / R)
    return np.fft.fft(K, axis=0) / R * (np.sinc(n / R) ** 2)[:, None], n.astype(int)

def predict_lines(K, f0, fm):
    """Cosine amplitude at every integer-Hz line, sine at f0 in, scan at fm."""
    Hn, n = row_modes(K)
    k = np.arange(L)
    spec = {}
    for sgn in (+1, -1):
        Hf = Hn @ np.exp(-2j * np.pi * sgn * f0 * k / FS) / 2     # complex coeff per rung
        for nn, c in zip(n, Hf):
            g = sgn * f0 + nn * fm
            spec[g] = spec.get(g, 0) + c
    amp = {}
    for g, c in spec.items():
        if g == 0: amp[0] = amp.get(0, 0) + abs(c); continue
        G = abs(g)
        amp.setdefault(G, 0j)
    out = {}
    for G in amp:
        if G == 0: continue
        cp, cm = spec.get(G, 0), spec.get(-G, 0)
        out[G] = abs(cp + np.conj(cm))                        # real signal: line at +G
    return out

def measure_lines(K, f0, fm):
    t = np.arange(2 * FS) / FS
    y = run(K, np.cos(2 * np.pi * f0 * t), fm)[FS:]           # last second, steady state
    return np.abs(np.fft.rfft(y)) * 2 / FS                    # bins are 1 Hz, no leakage

def bifreq(K, fmax=2000, nmax=16):
    Hn, n = row_modes(K)
    f = np.arange(0, fmax, 2.0)
    E = np.exp(-2j * np.pi * np.outer(np.arange(L), f) / FS)
    sel = np.argsort(n); sel = sel[np.abs(n[sel]) <= nmax]
    return f, n[sel], np.abs(Hn[sel] @ E)

def saw(f, N):
    t = np.arange(N) / FS
    return sum(np.sin(2 * np.pi * h * f * t) / h for h in range(1, int(20000 / f))) * 2 / np.pi

def norm(y): return (y / np.max(np.abs(y)) * 0.89).astype(np.float32)

if __name__ == "__main__":
    report = {"fs": FS, "taps": L, "passband_spacing_hz": FS / L, "sine_check": {}, "renders": {}}
    f0, fm = 440, 31
    for name, stem in SURF.items():
        K = kernel(stem)
        pred = predict_lines(K, f0, fm)
        meas = measure_lines(K, f0, fm)
        top = max(pred.values())
        lines = sorted(G for G, a in pred.items() if a > top * 1e-3 and G < FS // 2)   # within 60 dB
        err = [20 * np.log10(meas[G] / pred[G]) for G in lines]
        strongest = sorted(lines, key=lambda G: -pred[G])[:6]
        off = np.sum(meas ** 2) - sum(meas[G] ** 2 for G in pred if G < FS // 2)
        report["sine_check"][name] = {
            "lines_within_60dB": len(lines), "worst_error_db": round(float(np.max(np.abs(err))), 4),
            "strongest_lines_hz": [int(G) for G in strongest],
            "strongest_lines_db": [round(float(20 * np.log10(pred[G] / top)), 1) for G in strongest],
            "power_off_the_predicted_grid": float(off / np.sum(meas ** 2))}
        print(name, report["sine_check"][name])

    # Renders: the scan rate glides 0.25 → 80 Hz over 14 s, exponentially, so the
    # filter first moves slowly (a filter you hear sweep) and then turns into
    # sidebands (a Floquet ladder) — the LTI-to-LTV crossing in one gesture.
    N = 14 * FS
    glide = 0.25 * (80 / 0.25) ** (np.arange(N) / N)
    rng = np.random.default_rng(7)
    jobs = [("kernel_a_penrose_saw_glide.wav", "penrose", saw(110, N)),
            ("kernel_b_theta_saw_glide.wav", "theta", saw(110, N)),
            ("kernel_c_membrane_saw_glide.wav", "membrane", saw(110, N)),
            ("kernel_d_penrose_noise_glide.wav", "penrose", rng.standard_normal(N) * 0.3)]
    for fn, name, x in jobs:
        y = run(kernel(SURF[name]), x, glide)
        wavfile.write(fn, FS, norm(y))
        seg = lambda s: y[int(s * FS):int(s * FS) + FS]
        def offgrid(z):
            P = np.abs(np.fft.rfft(z)) ** 2; f = np.arange(len(P))
            on = np.min(np.abs(f[:, None] - 110 * np.arange(0, 220)[None]), axis=1) <= 2
            return float(P[~on].sum() / P.sum())
        report["renders"][fn] = {"surface": name, "input": "saw 110 Hz" if "saw" in fn else "white noise",
            "off_harmonic_power_first_s": round(offgrid(seg(0)), 4) if "saw" in fn else None,
            "off_harmonic_power_last_s": round(offgrid(seg(13)), 4) if "saw" in fn else None,
            "finite": bool(np.all(np.isfinite(y)))}
        print(fn, report["renders"][fn])
    json.dump(report, open("kernel_report.json", "w"), indent=1)
