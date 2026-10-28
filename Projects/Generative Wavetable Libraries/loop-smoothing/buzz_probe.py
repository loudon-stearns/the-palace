"""Where does the buzz come from? Same table, three renderers, one metric.

metric: energy that is NOT on the held note's harmonics (110 Hz grid, +-4 Hz),
relative to energy that is, in 1 s windows of the 24 s sweep. Lower is cleaner.
"""
import sys, json, glob
import numpy as np, soundfile as sf

SR = 44100
F0 = 110.0

def nonharmonic_db(x, f0=F0, sr=SR):
    out = []
    for st in range(sr // 2, len(x) - sr, sr):
        seg = x[st:st + sr] * np.hanning(sr)
        S = np.abs(np.fft.rfft(seg)) ** 2
        f = np.fft.rfftfreq(sr, 1 / sr)
        h = np.abs(f - np.round(f / f0) * f0) < 4
        h &= f > 0
        out.append(10 * np.log10(S[~h].sum() / S[h].sum()))
    return np.array(out)

def bandlimit(table, hmax, up=1):
    """Keep harmonics 1..hmax; optionally upsample each frame by `up` (exact, via FFT)."""
    nf, n = table.shape
    X = np.fft.rfft(table, axis=1)
    X[:, hmax + 1:] = 0
    X[:, 0] = 0
    Y = np.zeros((nf, n * up // 2 + 1), complex)
    Y[:, :X.shape[1]] = X
    return np.fft.irfft(Y, n=n * up, axis=1) * up

def naive_sweep(table, f0=F0, dur=24.0):
    """The renderer the tables shipped with: linear interp in phase and position."""
    n = int(dur * SR); nf, fs = table.shape
    idx = np.arange(n)
    sp = (f0 / SR * idx % 1.0) * fs
    s0 = np.floor(sp).astype(int) % fs; s1 = (s0 + 1) % fs; fr = sp - np.floor(sp)
    fp = idx / (n - 1) * (nf - 1)
    a0 = np.floor(fp).astype(int); a1 = np.minimum(a0 + 1, nf - 1); ff = fp - a0
    A = table[a0, s0] * (1 - fr) + table[a0, s1] * fr
    B = table[a1, s0] * (1 - fr) + table[a1, s1] * fr
    return A * (1 - ff) + B * ff

def clean_sweep(table, f0=F0, dur=24.0, top_hz=18000.0):
    """What a good synth does: drop every harmonic that would fold past Nyquist
    (one mip level, since the note is held), then read an 8x oversampled frame."""
    hmax = int(top_hz // f0)
    return naive_sweep(bandlimit(table, hmax, up=8), f0, dur)

def finish(x):
    r = int(0.05 * SR); x = x.copy()
    x[:r] *= np.linspace(0, 1, r); x[-r:] *= np.linspace(1, 0, r)
    return x / (np.max(np.abs(x)) + 1e-12) * 0.9

if __name__ == "__main__":
    rows = []
    for p in sys.argv[1:]:
        t, _ = sf.read(p)
        n = 1024 if p.endswith("_ableton.wav") else 2048
        t = t.reshape(-1, n)
        a = nonharmonic_db(naive_sweep(t)); b = nonharmonic_db(clean_sweep(t))
        rows.append([p.split("/")[-1], round(float(np.median(a)), 1), round(float(a.max()), 1),
                     round(float(np.median(b)), 1), round(float(b.max()), 1)])
        print(*rows[-1], sep="  ")
