"""Stage 3, third proof — the surface filters on real material, and a scan that follows the pitch.

Loudon (2026-11-04) asked three things after hearing about the mode bank: render Knot
Shadow as a pitch shifter on a real phrase; try a scan rate kept relative to the input's
pitch, both whole-number ratios and small percentages of it; and, since this is a filter
that goes over any sound, feed it more varied sounds, spoken words among them.

Inputs (kernel/inputs/): two spoken phrases (macOS `say`: Daniel, Flo), a plucked melody
(Karplus-Strong, known pitches), a drum loop (synthesized). Pitch of the speech is tracked
here (a small YIN). A pitch-locked scan sets f_mod(t) = ratio × f0(t).

Theory for the locked scan: a harmonic h·f0 comes out at (h + n·ratio)·f0 on rung n.
A whole-number ratio lands every rung on a harmonic, so the output stays harmonic at the
same pitch whatever the voice does: a timbre change that follows the singer. A small
percentage puts each harmonic's rungs ratio·f0 apart: a shimmer whose rate rises with pitch.

Run:  /usr/local/bin/python3 kernel/phrase.py  → kernel/phrase/*.wav, phrase_report.json
"""
import json, numpy as np
from pathlib import Path
from scipy.io import wavfile
from scipy.signal import medfilt, lfilter
from mode_bank import NINE, kernel, modes, bank
from floquet_kernel import FS

HERE = Path(__file__).resolve().parent
IN, OUT = HERE / "inputs", HERE / "phrase"
OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(7)

# ---------- inputs ----------
def load(name):
    sr, x = wavfile.read(IN / name); assert sr == FS
    x = x.astype(float) / 32768; return x / np.max(np.abs(x)) * 0.8

def pluck_melody():
    notes = [110, 130.81, 164.81, 196, 220, 196, 146.83, 164.81, 110, 220]   # A2 C3 E3 G3 A3 G3 D3 E3 A2 A3
    dur = int(0.42 * FS); x = np.zeros(len(notes) * dur); f0 = np.zeros_like(x)
    for i, f in enumerate(notes):
        Ld = int(round(FS / f - 0.5))           # the two-point average adds half a sample
        buf = rng.uniform(-1, 1, Ld); y = np.zeros(dur)
        for t in range(dur):                                   # KS with a fractional-delay average
            a = buf[t % Ld]; b = buf[(t + 1) % Ld]
            y[t] = a; buf[t % Ld] = 0.996 * 0.5 * (a + b)
        x[i * dur:(i + 1) * dur] = y; f0[i * dur:(i + 1) * dur] = f
    return x / np.max(np.abs(x)) * 0.8, f0

def drum_loop():
    bpm, bars = 112, 2; step = int(FS * 60 / bpm / 4); x = np.zeros(16 * bars * step)
    t = np.arange(int(0.35 * FS)) / FS
    kick = np.sin(2 * np.pi * (45 * t + 90 * (1 - np.exp(-t * 28)) / 28)) * np.exp(-t * 9)
    snare = (rng.standard_normal(len(t)) * 0.6 + np.sin(2 * np.pi * 190 * t)) * np.exp(-t * 18)
    hat = lfilter([1, -1], [1, -0.2], rng.standard_normal(len(t)))[:len(t)] * np.exp(-t * 60) * 0.35
    pat = {"k": [0, 6, 10], "s": [4, 12], "h": list(range(0, 16, 2))}
    for bar in range(bars):
        for name, hits in pat.items():
            for s in hits:
                a = (bar * 16 + s) * step; w = {"k": kick, "s": snare, "h": hat}[name]
                n = min(len(w), len(x) - a); x[a:a + n] += w[:n]
    return x / np.max(np.abs(x)) * 0.8

# ---------- pitch (a small YIN, 10 ms hop) ----------
HOP, WIN = 480, 2048
def yin(x, fmin=60, fmax=500, thr=0.15):
    lo, hi = int(FS / fmax), int(FS / fmin)
    f0 = []; voiced = []
    for a in range(0, len(x) - WIN - hi, HOP):
        fr = x[a:a + WIN + hi]
        if np.sqrt(np.mean(fr[:WIN] ** 2)) < 0.01: f0.append(0); voiced.append(False); continue
        d = np.array([np.sum((fr[:WIN] - fr[tau:tau + WIN]) ** 2) for tau in range(hi + 1)])
        cm = d[1:] * np.arange(1, hi + 1) / np.maximum(np.cumsum(d[1:]), 1e-12)
        cm = np.concatenate([[1], cm])
        idx = np.where(cm[lo:hi] < thr)[0]
        if len(idx) == 0: f0.append(0); voiced.append(False); continue
        tau = lo + idx[0]
        while tau + 1 < hi and cm[tau + 1] < cm[tau]: tau += 1
        a_, b_, c_ = cm[tau - 1], cm[tau], cm[tau + 1]
        tau = tau + 0.5 * (a_ - c_) / max(a_ - 2 * b_ + c_, 1e-12)
        f0.append(FS / tau); voiced.append(True)
    return np.array(f0), np.array(voiced)

def f0_per_sample(x):
    """Tracked pitch as a smooth per-sample curve; unvoiced stretches hold the last pitch."""
    f, v = yin(x)
    f = medfilt(np.where(v, f, 0), 5)
    held = np.copy(f); last = np.median(f[f > 0])
    for i in range(len(held)):
        if held[i] > 0: last = held[i]
        else: held[i] = last
    centers = np.arange(len(held)) * HOP + WIN // 2
    c = np.interp(np.arange(len(x)), centers, held)
    return lfilter([0.002], [1, -0.998], c - c[0]) + c[0], f, v       # ~10 ms smoothing

# ---------- measures ----------
def harmonicity(y, f0):
    """Share of 50 Hz–4 kHz energy lying within ±8 % of f0 of a harmonic of f0, over frames with a pitch."""
    N, H = 8192, 2400; w = np.hanning(N); fr = np.fft.rfftfreq(N, 1 / FS); num = den = 0.0
    for a in range(0, len(y) - N, H):
        f = np.median(f0[a:a + N])
        if f <= 0: continue
        P = np.abs(np.fft.rfft(y[a:a + N] * w)) ** 2
        band = (fr > 50) & (fr < 4000)
        h = fr / f; near = np.abs(h - np.round(h)) < 0.08
        num += P[band & near & (np.round(h) >= 1)].sum(); den += P[band].sum()
    return round(float(num / max(den, 1e-30)), 3)

def median_pitch(y):
    f, v = yin(y); return float(np.median(f[v])) if v.sum() > 5 else 0.0

def level(y, ref):
    return y * np.sqrt(np.mean(ref ** 2) / max(np.mean(y ** 2), 1e-20))

# ---------- run ----------
MODES = {s: modes(kernel(NINE[s]))[0] for s in ("knot_shadow", "theta", "penrose")}
KEEP = {"knot_shadow": 4, "theta": 32, "penrose": 5}
def fx(surf, x, fmod): return bank(x, fmod, MODES[surf][:KEEP[surf]])[0]

def reel(name, parts):
    gap = np.zeros(int(0.45 * FS)); seq, marks, t = [], [], 0.0
    for label, y in parts:
        y = y / max(np.max(np.abs(y)), 1e-9) * 0.7 if label == "dry" else y
        seq += [y, gap]; marks.append({"at_s": round(t, 2), "what": label}); t += (len(y) + len(gap)) / FS
    z = np.concatenate(seq); z = z / max(1.0, np.max(np.abs(z)) / 0.95)
    wavfile.write(OUT / f"{name}.wav", FS, (z * 32767).astype(np.int16))
    return {"file": f"kernel/phrase/{name}.wav", "seconds": round(len(z) / FS, 1), "segments": marks}

if __name__ == "__main__":
    report = {"reels": {}, "knot_shadow_pitch": [], "harmonicity": []}
    daniel, flo = load("speech_daniel.wav"), load("speech_flo.wav")
    melody, mel_f0 = pluck_melody(); drums = drum_loop()
    wavfile.write(IN / "pluck_melody.wav", FS, (melody * 32767).astype(np.int16))
    wavfile.write(IN / "drum_loop.wav", FS, (drums * 32767).astype(np.int16))
    dan_f0, _, _ = f0_per_sample(daniel); flo_f0, _, _ = f0_per_sample(flo)

    # 1 — Knot Shadow on a voice. On a sine at a band centre it shifts pitch by 1 − 3·f_mod/187.5
    #     (cycle 6), so f_mod = (1 − ratio)·62.5 aims at a ratio. But rung n moves everything in its
    #     band by n·f_mod hertz, the same hertz for every harmonic inside the band, so a voice goes
    #     inharmonic. Locking the scan to the pitch, f_mod = k·f0, moves harmonic h to h − 3k: whole
    #     harmonic steps, so the output stays harmonic. k = 1/3 keeps the pitch and moves each
    #     harmonic down one place.
    parts = []
    for nm, x, f0 in (("Daniel", daniel, dan_f0), ("Flo", flo, flo_f0)):
        parts.append(("dry", x))
        wet0 = fx("knot_shadow", x, 0.0)
        parts.append((f"{nm}, Knot Shadow frozen (the filter alone)", level(wet0, x)))
        row = {"voice": nm, "median_pitch_hz": round(float(np.median(f0)), 1),
               "frozen": {"harmonic_to_dry_pitch": harmonicity(wet0, f0)}}
        for ratio, label in ((0.75, "down a fourth"), (1.25, "up a major third")):
            fm = (1 - ratio) * 62.5; y = fx("knot_shadow", x, fm)
            parts.append((f"{nm}, Knot Shadow scanned at {fm:+.2f} Hz, aiming {label}", level(y, x)))
            row[f"fixed_{ratio}"] = {"scan_hz": fm, "harmonic_to_dry_pitch": harmonicity(y, f0),
                                     "harmonic_to_aimed_pitch": harmonicity(y, f0 * ratio)}
        for k, label in ((1 / 3, "1/3"), (2 / 3, "2/3")):
            y = fx("knot_shadow", x, k * f0)
            parts.append((f"{nm}, Knot Shadow locked to {label} × pitch", level(y, x)))
            row[f"locked_{label}"] = {"harmonic_to_dry_pitch": harmonicity(y, f0)}
        report["knot_shadow_pitch"].append(row)
    report["reels"]["knot_shadow_speech"] = reel("reel_1_knot_shadow_speech", parts)

    # 2 and 3 — pitch-locked scans on the melody and on Daniel, against a fixed scan of the same mean rate
    for tag, x, f0 in (("melody", melody, mel_f0), ("speech", daniel, dan_f0)):
        parts = [("dry", x)]; fbar = float(np.median(f0[f0 > 0]))
        report["harmonicity"].append({"input": tag, "treatment": "dry", "harmonicity": harmonicity(x, f0)})
        for surf in ("theta", "penrose"):
            for ratio in (2, 0.03):
                for locked in (True, False):
                    fm = ratio * f0 if locked else ratio * fbar
                    y = fx(surf, x, fm)
                    lab = f"{surf}, scan {'locked to' if locked else 'fixed at'} {ratio:g} × pitch" + ("" if locked else f" ({ratio * fbar:.1f} Hz)")
                    report["harmonicity"].append({"input": tag, "treatment": lab, "harmonicity": harmonicity(y, f0)})
                    if locked or ratio == 2: parts.append((lab, level(y, x)))
        report["reels"][f"pitch_locked_{tag}"] = reel(f"reel_{2 if tag == 'melody' else 3}_pitch_locked_{tag}", parts)

    # Knot Shadow locked, on the melody whose pitch is known exactly (no tracker in the way)
    for k, label in ((1 / 3, "1/3"), (2 / 3, "2/3")):
        y = fx("knot_shadow", melody, k * mel_f0)
        report["harmonicity"].append({"input": "melody", "treatment": f"knot_shadow, scan locked to {label} × pitch",
                                      "harmonicity": harmonicity(y, mel_f0)})
    y = fx("knot_shadow", melody, 15.625)
    report["harmonicity"].append({"input": "melody", "treatment": "knot_shadow, scan fixed at 15.625 Hz",
                                  "harmonicity": harmonicity(y, mel_f0)})
    report["harmonicity"].append({"input": "melody", "treatment": "knot_shadow, frozen",
                                  "harmonicity": harmonicity(fx("knot_shadow", melody, 0.0), mel_f0)})

    # 4 — drums: no pitch, so fixed scans only
    parts = [("dry", drums)]
    for surf, fm in (("theta", 2.0), ("penrose", 6.25), ("penrose", 60.0), ("knot_shadow", 15.625)):
        parts.append((f"{surf}, scan {fm:g} Hz", level(fx(surf, drums, fm), drums)))
    report["reels"]["drums"] = reel("reel_4_drums", parts)

    json.dump(report, open(HERE / "phrase_report.json", "w"), indent=1)
    print(json.dumps(report, indent=1))
