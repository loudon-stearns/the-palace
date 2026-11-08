"""Stage 3, fourth proof — why the pitch-locked scan holds on a melody and slips on a voice.

Cycle 7 found the locked scan keeps a plucked melody in tune (harmonicity 0.95) but lands
only some of the time on speech, and guessed the pitch tracker was to blame. This proof
tests the guess instead of trusting it. Three suspects:

  1. the tracker  — a wrong or late pitch moves each partial off its harmonic;
  2. the measure  — cycle 7 scored harmonicity on 170 ms frames, and a voice glides inside one;
  3. the voice    — `say` speech is breathy and jittery, so some of it was never harmonic.

To pull them apart we need a voice whose pitch is known exactly. So the phrase is rebuilt
by source and filter: its spectral envelope (LPC, every 10 ms) laid over a buzz whose
pitch we choose — the tracked contour, smoothed, now the truth by construction. It sounds
like the same sentence said by a slightly robotic speaker. Unvoiced stretches are noise.

The measure is rebuilt too: warp time so that one pitch period is always 128 samples
(follow the phase of the true pitch), then a harmonic of a gliding voice sits exactly on
an integer "harmonic number", however the pitch moves. Harmonicity = energy within ±0.1
of a whole harmonic number, over voiced time, below 4 kHz.

Then the error budget: feed the locked scan the true pitch, off by a fixed percentage, or
late by a fixed delay, and see what each costs. That is the spec for the codebox's tracker.

Run:  /usr/local/bin/python3 kernel/voice.py  → kernel/voice/*.wav, voice_report.json
"""
import json, numpy as np
from pathlib import Path
from scipy.io import wavfile
from scipy.signal import lfilter, butter, sosfiltfilt, medfilt
from scipy.linalg import solve_toeplitz
from mode_bank import NINE, kernel, modes, bank
from floquet_kernel import FS
from phrase import load, yin, f0_per_sample, pluck_melody, HOP, WIN

HERE = Path(__file__).resolve().parent
OUT = HERE / "voice"; OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(11)

# ---------- a voice with a known pitch ----------
def lpc(fr, order):
    r = np.correlate(fr, fr, "full")[len(fr) - 1:len(fr) + order]
    r[0] *= 1.0001
    a = solve_toeplitz(r[:-1], r[1:])
    return np.concatenate([[1.0], -a])

def resynth(x, order=48):
    """Same envelope, new source. Returns the voice, its exact pitch per sample, its voicing mask."""
    f, v = yin(x)
    v = medfilt(v.astype(float), 5) > 0.5
    fv = np.where(v, f, 0)
    # the truth contour: tracked pitch, voiced frames only, gaps bridged, smoothed with no lag
    idx = np.where(fv > 0)[0]
    contour = np.interp(np.arange(len(fv)), idx, medfilt(fv, 5)[idx])
    contour = np.exp(np.convolve(np.log(contour), np.hanning(9) / np.hanning(9).sum(), "same"))
    centers = np.arange(len(fv)) * HOP + WIN // 2
    f0 = np.interp(np.arange(len(x)), centers, contour)
    vmask = np.interp(np.arange(len(x)), centers, v.astype(float))
    vmask = np.convolve(vmask, np.hanning(481) / np.hanning(481).sum(), "same")   # 10 ms crossfade
    # buzz: a band-limited sawtooth-like source at f0 (1/h amplitudes up to 9 kHz)
    phase = np.cumsum(f0) / FS
    buzz = np.zeros(len(x))
    for h in range(1, int(9000 / f0.min()) + 1):
        amp = np.where(h * f0 < 9000, 1.0 / h, 0.0)
        buzz += amp * np.sin(2 * np.pi * h * phase)
    buzz /= np.sqrt(np.mean(buzz ** 2))
    src = vmask * buzz + (1 - vmask) * rng.standard_normal(len(x))
    # envelope: frame LPC (25 ms window, 10 ms hop), filter state carried across frames
    y = np.zeros(len(x)); zi = np.zeros(order); W = 1200
    for a in range(0, len(x), HOP):
        c = min(max(a + HOP // 2 - W // 2, 0), len(x) - W)
        fr = x[c:c + W] * np.hanning(W)
        if np.sum(fr ** 2) < 1e-9:
            y[a:a + HOP] = 0; zi[:] = 0; continue
        A = lpc(fr, order)
        g = np.sqrt(max(np.mean(lfilter(A, [1.0], fr) ** 2), 1e-12))
        seg, zi = lfilter([g], A, src[a:a + HOP], zi=zi)
        y[a:a + HOP] = seg
    y = y / np.max(np.abs(y)) * 0.8
    return y, f0, vmask

# ---------- the measure: harmonicity in pitch-warped time ----------
_lp = butter(8, 4000, fs=FS, output="sos")
def harmonicity(y, f0, mask=None, per=128, tol=0.1, hmax=None):
    y = sosfiltfilt(_lp, y)
    if mask is not None: y = y * mask
    phase = np.concatenate([[0.0], np.cumsum(f0[:-1])]) / FS        # cycles
    grid = np.arange(0, phase[-1], 1 / per)
    u = np.interp(np.interp(grid, phase, np.arange(len(y))), np.arange(len(y)), y)
    P = np.abs(np.fft.rfft(u * np.hanning(len(u)))) ** 2
    hn = np.fft.rfftfreq(len(u), 1 / per)                            # in harmonic numbers
    top = hmax or per / 2
    band = (hn > 0.5) & (hn < top)
    near = np.abs(hn - np.round(hn)) < tol
    return round(float(P[band & near].sum() / max(P[band].sum(), 1e-30)), 3)

def harmonicity_old(y, f0):
    """Cycle 7's measure, kept to compare: 170 ms frames, ±8 % of f0."""
    from phrase import harmonicity as h; return h(y, f0)

# ---------- the scans ----------
MODES = {s: modes(kernel(NINE[s]))[0] for s in ("knot_shadow", "theta", "penrose")}
KEEP = {"knot_shadow": 4, "theta": 32, "penrose": 5}
def fx(surf, x, fmod): return bank(x, fmod, MODES[surf][:KEEP[surf]])[0]
def level(y, ref): return y * np.sqrt(np.mean(ref ** 2) / max(np.mean(y ** 2), 1e-20))
def kept_db(y, ref, m):
    """Voiced energy from 60 Hz to 4 kHz, in dB against the frozen filter: does the scan leave anything to hear?"""
    from scipy.signal import butter as b_, sosfiltfilt as s_
    bp = b_(4, [60, 4000], btype="band", fs=FS, output="sos")
    return round(float(10 * np.log10(np.sum((s_(bp, y) * m) ** 2) / np.sum((s_(bp, ref) * m) ** 2))), 1)
def late(f0, ms):
    n = int(ms * FS / 1000); return np.concatenate([np.full(n, f0[0]), f0[:len(f0) - n]]) if n else f0
def causal_tracker(x):
    """Cycle 7's tracker: YIN every 10 ms, median of 5, a 10 ms one-pole — what a live patch could run."""
    return f0_per_sample(x)[0]

def reel(name, parts):
    gap = np.zeros(int(0.45 * FS)); seq, marks, t = [], [], 0.0
    for label, y in parts:
        y = y / max(np.max(np.abs(y)), 1e-9) * 0.7
        seq += [y, gap]; marks.append({"at_s": round(t, 2), "what": label}); t += (len(y) + len(gap)) / FS
    z = np.concatenate(seq); z = z / max(1.0, np.max(np.abs(z)) / 0.95)
    wavfile.write(OUT / f"{name}.wav", FS, (z * 32767).astype(np.int16))
    return {"file": f"kernel/voice/{name}.wav", "seconds": round(len(z) / FS, 1), "segments": marks}

CASES = (("theta", 2.0, "Theta, locked to 2 × pitch"),
         ("knot_shadow", 1 / 3, "Knot Shadow, locked to 1/3 × pitch"),
         ("knot_shadow", 2 / 3, "Knot Shadow, locked to 2/3 × pitch"),
         ("penrose", 2.0, "Penrose, locked to 2 × pitch"))

if __name__ == "__main__":
    rep = {"voices": {}, "error_budget": {}, "big_ratios": {}, "reels": {}}
    voices = {}
    for nm, file in (("Daniel", "speech_daniel.wav"), ("Flo", "speech_flo.wav")):
        x = load(file)
        v, f0, vm = resynth(x)
        wavfile.write(HERE / "inputs" / f"speech_{nm.lower()}_known_pitch.wav", FS, (v * 32767).astype(np.int16))
        voices[nm] = (x, v, f0, vm)
        trk_v = causal_tracker(v)
        row = {"median_pitch_hz": round(float(np.median(f0[vm > 0.5])), 1),
               "voiced_share": round(float(np.mean(vm > 0.5)), 2),
               "tracker_error_on_known_voice": {
                   "median_abs_pct": round(float(np.median(np.abs(trk_v / f0 - 1)[vm > 0.5]) * 100), 2),
                   "p95_abs_pct": round(float(np.percentile(np.abs(trk_v / f0 - 1)[vm > 0.5], 95) * 100), 2),
                   "octave_errors_pct_of_voiced": round(float(np.mean(np.abs(np.log2(trk_v / f0))[vm > 0.5] > 0.4) * 100), 2)},
               "dry": {"original_say_voice": harmonicity(x, f0, vm), "known_pitch_voice": harmonicity(v, f0, vm),
                       "known_pitch_voice_old_measure": harmonicity_old(v, f0)},
               "locked": []}
        for surf, r, lab in CASES:
            yt = fx(surf, v, r * f0); yk = fx(surf, v, r * trk_v); yf = fx(surf, v, r * float(np.median(f0)))
            row["locked"].append({"case": lab,
                                  "true_pitch": harmonicity(yt, f0, vm),
                                  "true_pitch_old_measure": harmonicity_old(yt, f0),
                                  "cycle7_tracker": harmonicity(yk, f0, vm),
                                  "fixed_scan_same_mean": harmonicity(yf, f0, vm),
                                  "frozen_filter": harmonicity(fx(surf, v, 0.0), f0, vm),
                                  "voiced_energy_kept_db_vs_frozen": kept_db(yt, fx(surf, v, 0.0), vm)})
        # and on the original `say` voice, with its own tracked pitch, scored by the new measure
        trk_x = causal_tracker(x)
        row["original_voice_cycle7_tracker"] = [
            {"case": lab, "locked": harmonicity(fx(surf, x, r * trk_x), trk_x, vm),
             "frozen": harmonicity(fx(surf, x, 0.0), trk_x, vm)} for surf, r, lab in CASES]
        rep["voices"][nm] = row
        print(nm, json.dumps(row, indent=1))

    # error budget on Daniel's known-pitch voice
    x, v, f0, vm = voices["Daniel"]
    for surf, r, lab in (CASES[0], CASES[1], CASES[3]):
        b = {"pitch_off_by_pct": {}, "pitch_late_by_ms": {}}
        for e in (0, 0.25, 0.5, 1, 2, 4):
            b["pitch_off_by_pct"][e] = harmonicity(fx(surf, v, r * f0 * (1 + e / 100)), f0, vm)
        for ms in (0, 5, 10, 20, 40, 80):
            b["pitch_late_by_ms"][ms] = harmonicity(fx(surf, v, r * late(f0, ms)), f0, vm)
        rep["error_budget"][lab] = b
    # how fast the voice's pitch moves — what a late tracker is up against
    dlog = np.abs(np.diff(np.log2(f0))) * FS
    rep["error_budget"]["pitch_speed_octaves_per_s"] = {"median": round(float(np.median(dlog[vm[1:] > 0.5])), 2),
                                                        "p95": round(float(np.percentile(dlog[vm[1:] > 0.5], 95)), 2)}
    print(json.dumps(rep["error_budget"], indent=1))

    # big whole-number ratios (Loudon: "both big integer ratios, and small percentages")
    melody, mel_f0 = pluck_melody()
    for tag, sig, f in (("melody", melody, mel_f0), ("Daniel known pitch", v, f0)):
        m = vm if tag != "melody" else None
        rep["big_ratios"][tag] = {surf: {r: harmonicity(fx(surf, sig, r * f), f, m) for r in (1, 2, 3, 4, 6, 8)}
                                  for surf in ("theta", "penrose")}
    print(json.dumps(rep["big_ratios"], indent=1))

    # reels
    parts = [("Daniel as `say` made him", x), ("Daniel rebuilt with a known pitch (dry)", v)]
    for surf, r, lab in CASES[:2]:
        parts += [(f"{lab}, true pitch", level(fx(surf, v, r * f0), v)),
                  (f"{lab}, pitch 2 % sharp", level(fx(surf, v, r * f0 * 1.02), v)),
                  (f"{lab}, pitch 40 ms late", level(fx(surf, v, r * late(f0, 40)), v)),
                  (f"{lab}, cycle 7's tracker", level(fx(surf, v, r * causal_tracker(v)), v))]
    lab = CASES[3][2]
    parts += [(f"{lab}, true pitch", level(fx("penrose", v, 2 * f0), v)),
              (f"{lab}, pitch 0.5 % sharp", level(fx("penrose", v, 2 * f0 * 1.005), v)),
              (f"{lab}, pitch 10 ms late", level(fx("penrose", v, 2 * late(f0, 10)), v)),
              (f"{lab}, cycle 7's tracker", level(fx("penrose", v, 2 * causal_tracker(v)), v))]
    rep["reels"]["error_budget"] = reel("reel_5_tracker_error_budget", parts)
    parts = [("dry melody", melody)] + [(f"Theta, locked to {r} × pitch", level(fx("theta", melody, r * mel_f0), melody)) for r in (1, 2, 3, 4, 6, 8)] \
          + [("Daniel, known pitch (dry)", v)] + [(f"Theta, locked to {r} × pitch", level(fx("theta", v, r * f0), v)) for r in (1, 3, 8)]
    rep["reels"]["big_ratios"] = reel("reel_6_big_whole_ratios", parts)
    json.dump(rep, open(HERE / "voice_report.json", "w"), indent=1)
