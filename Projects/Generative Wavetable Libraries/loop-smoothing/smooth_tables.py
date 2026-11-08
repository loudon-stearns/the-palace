"""Smooth a wavetable along Position, so a sweep glides instead of stepping.

The buzz Loudon heard in the family chain (2026-10-14 note) is not at the
cycle's loop seam: the AKWF sources meet themselves cleanly, and a held frame
is clean. It is the table stepping. Each frame boundary is a corner in the
crossfade, and when neighbours differ a lot those corners repeat at the
sweep's frame rate, putting energy 4-15 Hz either side of every harmonic: a
steady flutter-buzz. buzz_probe.py measures it.

Two smoothings, both on frames already rotated into line with their neighbour:
  spline : resample the frame sequence to `frames` positions with a cubic
           (Catmull-Rom) curve through the originals, so the corners between
           frames are rounded. Barely helps: the corners are not the problem,
           the size of each jump is.
  blur   : a Gaussian across neighbouring frames, sigma in frames. Softens
           the jumps themselves, and blurs the frames a little.
"""
import argparse, json, sys
from pathlib import Path
import numpy as np, soundfile as sf

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "akwf-scale-up-fmsynth"))
import scale_up as su                                   # noqa: E402  (writers, emit)
from buzz_probe import naive_sweep, clean_sweep, nonharmonic_db, SR, F0  # noqa: E402


def catmull_rom(frames, n_out):
    nf = len(frames)
    pos = np.linspace(0, nf - 1, n_out)
    i = np.clip(np.floor(pos).astype(int), 0, nf - 2)
    t = (pos - i)[:, None]
    p0 = frames[np.maximum(i - 1, 0)]; p1 = frames[i]
    p2 = frames[i + 1]; p3 = frames[np.minimum(i + 2, nf - 1)]
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t ** 2
                  + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)


def blur(frames, sigma):
    if sigma <= 0:
        return frames.copy()
    r = int(np.ceil(3 * sigma)); k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2); k /= k.sum()
    pad = np.concatenate([frames[:1].repeat(r, 0), frames, frames[-1:].repeat(r, 0)])
    return np.array([np.tensordot(k, pad[j:j + 2 * r + 1], 1) for j in range(len(frames))])


def offnote_db(table, band=(4, 15), dur=24.0):
    """Energy 4-15 Hz off the harmonics vs on them, whole sweep, band-limited playback."""
    x = clean_sweep(table, dur=dur)
    on = off = 0.0
    for st in range(SR // 2, len(x) - SR, SR // 2):
        seg = x[st:st + SR] * np.hanning(SR)
        S = np.abs(np.fft.rfft(seg)) ** 2; f = np.fft.rfftfreq(SR, 1 / SR)
        d = np.abs(f - np.round(f / F0) * F0)
        on += S[(d < 4) & (f > 0)].sum(); off += S[(d >= band[0]) & (d < band[1])].sum()
    return 10 * np.log10(off / on)


def timbre_change_db(orig, new):
    """How much of each frame's sound the smoothing changed, at matching positions:
    energy of the difference in loudness-free harmonic magnitudes (1-64) over the
    frame's own, in dB, median over frames. -20 dB = 1 % of the sound changed."""
    ref = catmull_rom(orig, len(new)) if len(new) != len(orig) else orig
    a = su.harmonic_mags(ref); b = su.harmonic_mags(new)
    a = a / np.linalg.norm(a, axis=1, keepdims=True); b = b / np.linalg.norm(b, axis=1, keepdims=True)
    return float(np.median(10 * np.log10(((a - b) ** 2).sum(1) + 1e-12)))


def morph_dip_worst(frames):
    return float(su.morph_dips_db(frames).min())


SIGMAS = [0, 0.5, 0.75, 1.0, 1.5, 2.0]


def ab_file(path, before, after, gap=1.0):
    g = np.zeros(int(gap * SR))
    su.write_pcm16(path, np.concatenate([before, g, after]))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("tables", type=Path, nargs="+", help="2048-sample CLM tables")
    ap.add_argument("--out", type=Path, default=HERE / "tables")
    ap.add_argument("--sigma", type=float, default=1.0, help="blur width, in frames")
    ap.add_argument("--dur", type=float, default=24.0)
    a = ap.parse_args()
    report = {"sigma": a.sigma, "sweep_seconds": a.dur, "tables": {}}
    for path in a.tables:
        t, _ = sf.read(path); t = t.reshape(-1, su.CLM_N)
        stem = path.stem
        dial = []
        for sg in SIGMAS:
            fr = blur(t, sg); fr = fr - fr.mean(axis=1, keepdims=True)
            dial.append({"sigma": sg, "offnote_db": round(offnote_db(fr, dur=a.dur), 1),
                         "worst_morph_dip_db": round(morph_dip_worst(fr), 1),
                         "changed_db": round(timbre_change_db(t, fr), 1) if sg else None})
        sp = catmull_rom(t, max(256, len(t)))
        spline = {"frames": len(sp), "offnote_db": round(offnote_db(sp, dur=a.dur), 1)}
        fr = blur(t, a.sigma); fr = fr - fr.mean(axis=1, keepdims=True)
        files = su.emit(f"{stem}_smooth", fr, a.out, a.dur)
        # A/B: the shipped sweep, a second of silence, the smoothed sweep
        abl0 = su.to_ableton(t / np.max(np.abs(t)) * 0.99)
        abl1 = su.to_ableton(fr / np.max(np.abs(fr)) * 0.99)
        ab = a.out / f"{stem}_AB_shipped_then_smooth.wav"
        ab_file(ab, su.sweep(abl0, dur=a.dur), su.sweep(abl1, dur=a.dur))
        report["tables"][stem] = {"frames": len(t), "blur_dial": dial, "spline_only": spline,
                                  "files": files + [ab.name]}
        print(stem, json.dumps(dial), spline)
    (HERE / "smoothing.json").write_text(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
