"""
Shimmer Cloud — a swell before the dry, and long tails (2026-11-09, cycle 3)
============================================================================
Run with /usr/local/bin/python3 (numpy, scipy, soundfile, matplotlib).

WHAT THE PLAN ASKS
------------------
A cloud that leads into the dry like reversed sound, and tails that hang as
ambience, made by the lenses' own timing and decay.

THE IDEA
--------
A prism lens is an all-pass: it delays each frequency by tau(f) >= 0. Run the
same lens backward in time and every delay becomes an advance: each frequency
arrives tau(f) BEFORE the dry. That is the whole swell. Concretely

    lead = reverse( loop( reverse(dry) ) )

where loop is cycle 2's lens (render_interval.interval_lens): passes round a
feedback loop, each through a fresh cloud of 600 pushed-prism lenses
(150–600 ms), a few cents of drift, a little top lost, quieter by g per pass.
Forward, the passes fade out: a tail. Backward, they fade IN: the farthest pass
is the quietest and the nearest is the loudest, so the swell crescendos into the
onset by the loop's own decay, with no envelope drawn by hand. With highs late
in the forward lens, the backward lens brings the highs first: the swell falls
from hiss into the body of the sound.

The tail is the same loop run forward, longer and kept louder.

THE COST, said plainly: a swell before a sound needs to hear the sound first.
Offline that is free. Live, the dry has to be delayed by the swell's length
(here 2 s): fine on a playback track with delay compensation, or a looper,
never on a live mic you are monitoring. The worklet (the plan's next move)
should carry the swell as a lookahead control and say this on its face.
"""
from __future__ import annotations

import json, sys, time
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).parent
BUNDLE = HERE.parent.parent
sys.path.insert(0, str(HERE.parent / "2026-10-22-interval"))
from render_interval import interval_lens  # noqa: E402

SR = 24000


def lead_lens(x, sr, lead_s, **kw):
    """The loop run backward: returns len(x)+P samples with the dry's onset at P."""
    P = int(lead_s * sr)
    xp = np.concatenate([np.zeros(P), x])
    w = interval_lens(xp[::-1].copy(), sr, tail_s=0.5, **kw)[::-1]
    w = w[len(w) - len(xp):]
    # The loop places pass k at k gaps, so run backward the nearest pass would still
    # end one gap before the onset and leave a hole there (the first click test read
    # -34 dB at 0.1 s before). Slide the swell up by one gap so it runs into the dry.
    gap = int(kw.get("gap_ms", 140.0) / 1000 * sr)
    w = np.vstack([np.zeros((gap, 2)), w[:len(w) - gap]])
    fade = int(0.25 * sr)  # anything reaching past the window starts from silence, not a cut
    w[:fade] *= np.linspace(0, 1, fade)[:, None] ** 2
    return w


_TAILS = {}


def tail_lens(x, sr, **kw):
    key = (x.tobytes().__hash__(), json.dumps(kw, sort_keys=True))
    if key not in _TAILS:  # takes that share a tail render it once
        _TAILS[key] = interval_lens(x, sr, **kw)
    return _TAILS[key]


def assemble(dry, sr, lead_s, lead=None, tail=None, lead_db=-4.0, tail_db=-3.0, rms=0.12, peak=0.9):
    """Dry in the centre at P, lead before it, tail after; each wet levelled to the dry."""
    P = int(lead_s * sr)
    n = P + max(len(dry), 0 if tail is None else len(tail))
    out = np.zeros((n, 2))
    out[P:P + len(dry)] += dry[:, None] * np.sqrt(0.5)
    d_rms = np.sqrt(np.mean(dry ** 2))
    for w, db, off in ((lead, lead_db, 0), (tail, tail_db, P)):
        if w is None:
            continue
        w = w * d_rms / (np.sqrt(np.mean(w[np.abs(w).max(axis=1) > 1e-6] ** 2)) + 1e-12) * 10 ** (db / 20)
        out[off:off + len(w)] += w[: n - off]
    nz = np.nonzero(np.abs(out).max(axis=1) > 1e-4)[0]
    out = out[: nz[-1] + 1]
    out *= rms / np.sqrt(np.mean(out ** 2))
    pk = np.max(np.abs(out))
    return out * (peak / pk) if pk > peak else out


# ---------------------------------------------------------------- inputs
def struck_chord(sr, notes=(48, 55, 64, 71), dur=2.6, seed=3):
    """A plain struck chord (C3 G3 E4 B4): a sharp attack the swell has to lead into."""
    rng = np.random.default_rng(seed)
    t = np.arange(int(dur * sr)) / sr
    y = np.zeros_like(t)
    for m in notes:
        f0 = 440 * 2 ** ((m - 69) / 12)
        for k in range(1, 14):
            f = f0 * k * np.sqrt(1 + 0.0004 * k * k)
            if f > 10000:
                break
            y += (1 / k ** 1.1) * np.exp(-t * (1.2 + 0.5 * k)) * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28))
    y *= np.minimum(1, t / 0.002) * np.minimum(1, (dur - t) / 0.05)
    return y / np.max(np.abs(y)) * 0.6


# ---------------------------------------------------------------- measure
def env_db(x, sr, hop_s=0.02):
    m = x.mean(axis=1) if x.ndim > 1 else x
    hop = int(hop_s * sr)
    e = np.array([np.sqrt(np.mean(m[i:i + hop] ** 2)) for i in range(0, len(m) - hop, hop)])
    return 20 * np.log10(e / (e.max() + 1e-20) + 1e-12), hop_s


def band_centroid_s(x, sr, lo, hi):
    """Energy-weighted time of one band, in seconds from the start of x."""
    import scipy.signal as sps
    m = x.mean(axis=1) if x.ndim > 1 else x
    b = sps.sosfiltfilt(sps.butter(4, [lo, hi], btype="band", fs=sr, output="sos"), m)
    e = b ** 2
    return float(np.sum(np.arange(len(e)) * e) / np.sum(e) / sr)


def click_test(sr, lead_s, lead_kw, tail_kw):
    """Strike the lens with one click (tuning item 1) and read the shape of the cloud."""
    click = np.zeros(int(0.05 * sr)); click[0] = 1.0
    P = int(lead_s * sr)
    lead = lead_lens(click, sr, lead_s, **lead_kw)
    tail = tail_lens(click, sr, **tail_kw)
    led, hop = env_db(lead[:P], sr)
    t_led = -(len(led) - np.arange(len(led))) * hop
    # how far ahead the swell reaches, to -30 dB below its own peak
    reach = float(-t_led[np.nonzero(led > -30)[0][0]])
    level_at = {f"{-s:.2f}s": round(float(led[np.argmin(np.abs(t_led + s))]), 1) for s in (1.5, 1.0, 0.5, 0.2, 0.05)}
    ted, hop = env_db(tail, sr)
    hang = {f"-{d}dB": round(float((np.nonzero(ted > -d)[0][-1] + 1) * hop), 2) for d in (30, 45)}
    lows = band_centroid_s(lead[:P], sr, 100, 400) - lead_s
    highs = band_centroid_s(lead[:P], sr, 3000, 8000) - lead_s
    return {"swell_reaches_s_before": round(reach, 2), "swell_level_dB_before_onset": level_at,
            "tail_hangs_s": hang, "swell_lows_centre_s": round(lows, 2), "swell_highs_centre_s": round(highs, 2)}


LEAD_S = 2.0
LEAD = dict(interval=0.0, passes=5, gap_ms=160.0, g=0.62, drift_cents=6.0)
TAIL = dict(interval=0.0, passes=16, gap_ms=210.0, g=0.86, drift_cents=6.0, lp=6000.0, tail_s=6.0)
FIFTH = 7.0

TAKES = {  # name: (input, lead kwargs or None, tail kwargs or None)
    "p_tail":        ("phrase", None, TAIL),
    "p_swell":       ("phrase", LEAD, None),
    "p_both":        ("phrase", LEAD, TAIL),
    "p_both_fifth":  ("phrase", {**LEAD, "interval": FIFTH}, {**TAIL, "interval": FIFTH}),
    "p_swell_lows":  ("phrase", {**LEAD, "highs_late_share": 0.0}, TAIL),
    "c_both":        ("chord", LEAD, TAIL),
    "c_both_fifth":  ("chord", {**LEAD, "interval": FIFTH}, {**TAIL, "interval": FIFTH}),
    "c_tail":        ("chord", None, TAIL),
}


def main():
    dry, sr = sf.read(str(BUNDLE / "dry.wav")); dry = dry.astype(np.float64)
    assert sr == SR
    inputs = {"phrase": dry, "chord": struck_chord(sr)}
    (HERE / "takes").mkdir(exist_ok=True)
    sf.write(str(HERE / "takes" / "c_dry.wav"), np.repeat(inputs["chord"][:, None], 2, 1) * np.sqrt(0.5), sr, subtype="PCM_16")
    report = {"takes": {}, "click": {}}
    for name, (inp, lk, tk) in TAKES.items():
        t0 = time.time(); x = inputs[inp]
        lead = lead_lens(x, sr, LEAD_S, seed=23, **lk) if lk else None
        tail = tail_lens(x, sr, seed=11, **tk) if tk else None
        y = assemble(x, sr, LEAD_S, lead, tail)
        sf.write(str(HERE / "takes" / f"{name}.wav"), y, sr, subtype="PCM_16")
        e, hop = env_db(y, sr)
        report["takes"][name] = {"input": inp, "seconds": round(len(y) / sr, 2),
                                 "hangs_past_dry_end_s_-30dB": round(max(0.0, (np.nonzero(e > -30)[0][-1] + 1) * hop - LEAD_S - len(x) / sr), 2),
                                 "render_s": round(time.time() - t0, 1)}
        print(name, report["takes"][name], flush=True)
    for name, (lk, tk) in {"highs_first": (LEAD, TAIL), "lows_first": ({**LEAD, "highs_late_share": 0.0}, TAIL)}.items():
        report["click"][name] = click_test(sr, LEAD_S, {**lk, "seed": 23}, {**tk, "seed": 11})
        print("click", name, report["click"][name], flush=True)
    report["settings"] = {"lead_s": LEAD_S, "lead": LEAD, "tail": TAIL, "cloud": "600 lenses per pass, 150–600 ms, highs late"}
    (HERE / "findings.json").write_text(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
