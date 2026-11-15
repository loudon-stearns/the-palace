"""Shared measures for the noise-fault probe (2026-11-15). Loudon: "All the stable audio outputs are noisey and a little lo fidelity".
What a script can say about noise and fidelity, on the saved file:
  floor_db      the quietest 5% of 20 ms frames, in dB under the loudest frame (bigger is a cleaner floor)
  flatness      mean spectral flatness of the frames above the floor (0 = pure tones, 1 = white noise)
  rolloff99_hz  the frequency under which 99% of the energy lies (lower reads as duller, more lo-fi)
  hf_8k_db      energy above 8 kHz relative to the whole, in dB (hiss lives here, and so does air)
  quiet_hf_db   the same, in the quietest quarter of frames only: hiss with nothing to hide behind
None of these is the ear's verdict; they say where to listen."""
import numpy as np
SR = 44_100
def mono(x): return x.mean(0) if x.ndim == 2 else x
def frames(x, w=0.02):
    n = int(w * SR); m = len(x) // n; return x[: m * n].reshape(m, n)
def measure(x):
    x = mono(np.asarray(x, dtype=np.float64)); F = frames(x); rms = np.sqrt((F ** 2).mean(1)) + 1e-12; d = 20 * np.log10(rms)
    win = np.hanning(F.shape[1]); S = np.abs(np.fft.rfft(F * win, axis=1)) ** 2 + 1e-20; f = np.fft.rfftfreq(F.shape[1], 1 / SR)
    loud = d > np.percentile(d, 25); quiet = d <= np.percentile(d, 25)
    flat = np.exp(np.log(S[loud]).mean(1)) / S[loud].mean(1)
    tot = S.sum(0); c = np.cumsum(tot) / tot.sum()
    hf = lambda P: float(10 * np.log10(P[:, f >= 8000].sum() / P.sum()))
    return {"floor_db": round(float(d.max() - np.percentile(d, 5)), 1), "flatness": round(float(flat.mean()), 3),
            "rolloff99_hz": int(f[np.searchsorted(c, 0.99)]), "hf_8k_db": round(hf(S), 1), "quiet_hf_db": round(hf(S[quiet]), 1),
            "peak_dbfs": round(float(20 * np.log10(np.abs(x).max() + 1e-12)), 1)}
