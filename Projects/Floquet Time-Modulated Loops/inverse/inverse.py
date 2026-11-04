"""Stage 4 first proof — working backward from the sound you want.

The third instrument showed that a scanned surface is a filter whose 2D spectrum
is its map: a surface mode (row-rung n, tap-band m) passes the band at m*fs/L and
moves what it passes by n*f_mod. Read backward, that makes the inverse problem a
lookup, not a search:

    for each target partial f_k:
        pick the input harmonic h that will feed it   (nearest, each used once)
        m = the tap-band that holds h*f0
        n = round((f_k - h*f0) / f_mod)               (the rung that moves it there)
        c = A_k / (A_h * H_m(h*f0))                   (gain and phase, window undone)
    surface[r, k] = hann(k) * Σ Re( c e^{2πi n r/R} e^{2πi m k/L} )

The surface is a wavetable: R rows scanned at f_mod (locked to the pitch, f0/32),
L = 512 taps per row. The one error is the rounding of n: a partial lands within
f_mod/2 of its target. The modes are sliding-DFT bins, so leakage from the
neighbouring harmonics is the other thing to measure — which is where Hann comes in.

Run:  /usr/local/bin/python3 inverse/inverse.py   → inverse_report.json, surfaces/*.npy, renders
"""
import json, sys, numpy as np
from pathlib import Path
from scipy.io import wavfile
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "kernel"))
from floquet_kernel import FS, L, run, norm

R = 256                      # rows on the scanned axis; must exceed 2·max|n|
RATIO = 32                   # f_mod = f0 / RATIO, locked to the note
HANN = 0.5 - 0.5 * np.cos(2 * np.pi * np.arange(L) / L)
RECT = np.ones(L)

def band_response(m, f, win):
    k = np.arange(L)
    return np.sum(win * np.exp(2j * np.pi * m * k / L) * np.exp(-2j * np.pi * f * k / FS))

# --- targets: (frequency ratio to f0, amplitude) ------------------------------
def piano(B=4e-4, K=24):
    k = np.arange(1, K + 1)
    return [(float(kk * np.sqrt(1 + B * kk * kk)), 1 / kk) for kk in k]

def bar(K=6):
    # free–free bar (a glockenspiel bar): ratios ((2j+1)/3)^2 · (approx. 3.0112/3)^2 for j=1
    beta = [3.0112, 5, 7, 9, 11, 13]
    return [((b / beta[0]) ** 2, 0.7 ** j) for j, b in enumerate(beta[:K])]

def harmonic(K=24):
    return [(float(k), 1 / k) for k in range(1, K + 1)]

def design(target, f0, win, ratio=RATIO):
    fm = f0 / ratio
    used, modes = set(), []
    for ratio, amp in target:
        h = max(1, int(round(ratio)))
        while h in used: h += 1               # each input harmonic feeds one partial
        used.add(h)
        m = int(round(h * f0 / (FS / L)))
        n = int(round((ratio - h) * f0 / fm))
        H = band_response(m, h * f0, win)
        c = amp / ((1 / h) * H)               # the input is a saw: harmonic h has 1/h
        modes.append(dict(target=ratio * f0, h=h, m=m, n=n, c=c, lands=h * f0 + n * fm))
    assert max(abs(md["n"]) for md in modes) < R // 2
    return modes, fm

def surface(modes, win, interp_comp=True):
    r = np.arange(R)[:, None] / R; k = np.arange(L)[None] / L
    S = np.zeros((R, L))
    for md in modes:
        c = md["c"] / (np.sinc(md["n"] / R) ** 2 if interp_comp else 1)   # undo the row blend's taper
        S += np.real(c * np.exp(2j * np.pi * (md["n"] * r + md["m"] * k)))
    return S * win[None]

def saw(f, N):
    t = np.arange(N) / FS
    return sum(np.sin(2 * np.pi * h * f * t) / h for h in range(1, int(20000 / f))) * 2 / np.pi

def measure(y, modes, fm):
    """Hann-windowed, zero-padded spectrum of the steady state. For each target
    partial: where its peak landed (cents from target) and its level against the
    design; plus the share of power that sits away from every designed line."""
    seg = y[-2 * FS:]
    w = np.hanning(len(seg)); P = np.abs(np.fft.rfft(seg * w, 8 * len(seg))) ** 2
    f = np.fft.rfftfreq(8 * len(seg), 1 / FS)
    near = np.zeros_like(f, bool); rows = []
    for md in modes:
        win = np.abs(f - md["lands"]) < fm * 0.45
        near |= np.abs(f - md["lands"]) < 3.0
        i = np.argmax(np.where(win, P, 0))
        rows.append(round(float(1200 * np.log2(f[i] / md["target"])), 2))
    off = float(P[~near & (f > 20)].sum() / P[f > 20].sum())
    return rows, off

if __name__ == "__main__":
    rep = {"fs": FS, "taps": L, "rows": R, "scan": f"f_mod = f0/{RATIO}, locked to the note", "cases": {}}
    (HERE / "surfaces").mkdir(exist_ok=True); (HERE / "renders").mkdir(exist_ok=True)
    T = 4 * FS
    reel = []
    gap = np.zeros(FS // 3)
    for f0, note in ((187.5, "F#3+23c (harmonics on band centres)"), (196.0, "G3 (harmonics between bands)")):
        x = saw(f0, T)
        for tname, tgt in (("harmonic", harmonic()), ("piano", piano()), ("bar", bar())):
            for wname, win in (("hann", HANN), ("rect", RECT)):
                modes, fm = design(tgt, f0, win)
                S = surface(modes, win)
                y = run(S, x, fm)
                cents, off = measure(y, modes, fm)
                key = f"{f0:g}_{tname}_{wname}"
                rep["cases"][key] = {
                    "note": note, "target": tname, "window": wname, "f_mod_hz": fm,
                    "partials": len(modes), "max_rung": max(abs(md["n"]) for md in modes),
                    "design_rounding_cents_max": round(max(abs(1200 * np.log2(md["lands"] / md["target"])) for md in modes), 2),
                    "measured_cents_max": max(abs(c) for c in cents),
                    "power_off_designed_lines": round(off, 5)}
                print(key, rep["cases"][key])
                if f0 == 196.0 and wname == "hann":
                    np.save(HERE / "surfaces" / f"{tname}_G3_hann.npy", S.astype(np.float32))
                    out = norm(y[:3 * FS] * np.minimum(1, np.arange(3 * FS) / 2400))
                    wavfile.write(HERE / "renders" / f"G3_{tname}.wav", FS, out)
                    reel += [out, gap]
                if f0 == 196.0 and wname == "rect" and tname == "piano":
                    wavfile.write(HERE / "renders" / "G3_piano_rect_window.wav", FS,
                                  norm(y[:3 * FS] * np.minimum(1, np.arange(3 * FS) / 2400)))

    # How far can a note move before a surface designed for G3 stops working?
    # The tap-bands are fixed in hertz, so the top partial leaves its band first.
    modes, fm0 = design(piano(), 196.0, HANN)
    S = surface(modes, HANN)
    zone = {}
    for cents in (0, 10, 25, 50, 100, 200):
        f0 = 196.0 * 2 ** (cents / 1200); fm = f0 / RATIO
        y = run(S, saw(f0, T), fm)
        # where the designed partials should land now, each scaled with the note
        moved = [dict(md, target=md["lands"] * f0 / 196.0, lands=md["lands"] * f0 / 196.0) for md in modes]
        c, off = measure(y, moved, fm)
        zone[cents] = {"power_off_stretched_lines": round(off, 4), "partials_within_0.5_cents_of_design": int(sum(abs(v) < 0.5 for v in c))}
        print("zone", cents, zone[cents])
        if cents in (0, 50, 200):
            reel += [norm(y[:2 * FS] * np.minimum(1, np.arange(2 * FS) / 2400)), gap]
    rep["zone_piano_G3_surface"] = zone

    # The rounding: every line lands on the lattice h*f0 + n*f0/RATIO, so the output is
    # exactly periodic at f0/RATIO. A finer scan rounds less and repeats more slowly.
    sweep = {}
    for ratio in (16, 32, 64, 128):
        md_, fm = design(piano(), 196.0, HANN, ratio)
        e = [1200 * np.log2(d["lands"] / d["target"]) for d in md_]
        worst = int(np.argmax(np.abs(e)))
        sweep[ratio] = {"f_mod_hz": fm, "repeats_every_s": round(1 / fm, 3), "max_rung": max(abs(d["n"]) for d in md_),
                        "worst_cents": round(float(abs(e[worst])), 2), "worst_partial": worst + 1,
                        "rms_cents": round(float(np.sqrt(np.mean(np.square(e)))), 2)}
        print("ratio", ratio, sweep[ratio])
    rep["rounding_vs_scan_ratio_piano_G3"] = sweep
    wavfile.write(HERE / "renders" / "reel_7_working_backward.wav", FS, np.concatenate(reel).astype(np.float32))
    rep["piano_G3_modes"] = [{k: (round(v, 3) if isinstance(v, float) else v) for k, v in md.items() if k != "c"} for md in modes]
    json.dump(rep, open(HERE / "inverse_report.json", "w"), indent=1)
