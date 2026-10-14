"""Does the flock's order reach the sound? For each take, per section: the flock's φ,
the pitch-class entropy of the audio (bits; 0 = one pitch class, 3.58 = all twelve equal)
and spectral flatness (0 = pure tones, 1 = white noise).
    /usr/local/bin/python3 analyse_takes.py  → takes_analysis.json (and prints a table)"""
import wave, json, numpy as np
SEGS = {"melted": (1, 5), "crossing": (8, 11), "ordered": (17, 21), "startle": (21, 24), "re-cohered": (25, 28), "melted again": (36, 39)}
def load(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(float) / 32768
    return a.mean(1), w.getframerate()
def frames(x, sr, a, b, win=16384):
    f = np.fft.rfftfreq(win, 1 / sr); m = (f > 50) & (f < 1000); pc = (np.round(12 * np.log2(f[m] / 110)) % 12).astype(int)
    H, FL = [], []
    for s in range(int(a * sr), int(b * sr) - win, sr // 10):
        P = np.abs(np.fft.rfft(x[s:s + win] * np.hanning(win))) ** 2 + 1e-12
        c = np.bincount(pc, weights=P[m], minlength=12); c /= c.sum(); H.append(-(c * np.log2(c + 1e-12)).sum())
        Q = P[(f > 50) & (f < 4000)]; FL.append(np.exp(np.mean(np.log(Q))) / np.mean(Q))
    return float(np.mean(H)), float(np.mean(FL))
def entropy_trace(x, sr, win=16384):
    f = np.fft.rfftfreq(win, 1 / sr); m = (f > 50) & (f < 1000); pc = (np.round(12 * np.log2(f[m] / 110)) % 12).astype(int); out = []
    for s in range(0, len(x) - win, sr // 20):
        P = np.abs(np.fft.rfft(x[s:s + win] * np.hanning(win))) ** 2 + 1e-12
        c = np.bincount(pc, weights=P[m], minlength=12); c /= c.sum(); out.append([(s + win / 2) / sr, float(-(c * np.log2(c + 1e-12)).sum())])
    return out
res = {}
for mapping in ["page", "order"]:
    tr = json.load(open(f"wager_trace-{mapping}.json"))
    for who in ["flock", "authored"]:
        x, sr = load(f"take-{who}-{mapping}.wav"); rows = []
        for k, (a, b) in SEGS.items():
            H, FL = frames(x, sr, a, b); phi = np.mean([r["phi"] for r in tr if a <= r["t"] < b])
            rows.append({"section": k, "phi": round(float(phi), 2), "pcEntropy": round(H, 2), "flatness": round(FL, 4)})
        res[f"{mapping}/{who}"] = {"sections": rows, "trace": entropy_trace(x, sr)}
        print(f"{mapping:6s}{who:9s}", "  ".join(f"{r['section']}: φ{r['phi']:.2f} H{r['pcEntropy']:.2f} fl{r['flatness']:.3f}" for r in rows))
json.dump(res, open("takes_analysis.json", "w"))
