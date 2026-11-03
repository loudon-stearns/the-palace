# title: Generative Preset Development — proof — rich fences
# born: 2026-11-03
# links: [[Generative Preset Development]] (connects-to, proof-for-the-rich-face)
# forward_vector: I am how the rich piece "where the fences sit" got its numbers: the project's own Vital
#   ladders measured per rung with the project's own feature code, loudness added, the corpus fences mapped
#   to rungs, chance counted, and the one-channel copies the face plays written and checked bit for bit.
# Run with the project's venv (vital/README.md), from anywhere:
#   ~/.venvs/palace-vital/bin/python -I "<this file>" "<the bundle's vital/renders>" "<the bundle's vital/profile-draft>" "<the bundle's rich-face>" "<bake.json out>"
# The renders are ignored by git and live on the Mac that made them (vital_measure.py writes them).
"""Measure the project's own Vital ladders, per rung, for the rich face.
Reads the steward's renders (vital/renders/ladder-*.wav, made by vital_measure.py),
recomputes its features with its own functions (centroid, rise time) as a null
against vital_measured_v0.1.json, adds BS.1770 K-weighted loudness per rung, and
writes the one-channel copies the face plays (L and R are identical to the bit)."""
import json, sys, os, itertools, math
import numpy as np
from scipy.io import wavfile
from scipy.signal import lfilter

SRC, PD, OUT, BAKE = sys.argv[1:5]
SR = 44100
meas = json.load(open(os.path.join(PD, "vital_measured_v0.1.json")))
corp = json.load(open(os.path.join(PD, "vital_corpus_stats_v0.1.json")))

# the project's own feature functions, verbatim from vital_measure.py
def mono(x): return x.mean(axis=0)
def centroid(x, sr=SR):
    seg = mono(x)[int(0.6 * sr):int(1.6 * sr)]
    sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
    f = np.fft.rfftfreq(len(seg), 1 / sr)
    return float((sp * f).sum() / max(sp.sum(), 1e-12))
def rise_time(x, sr=SR):
    e = np.sqrt(np.convolve(mono(x) ** 2, np.ones(256) / 256, "same"))
    pk = e[: int(4.5 * sr)].max()
    t10 = np.argmax(e > 0.1 * pk); t90 = np.argmax(e > 0.9 * pk)
    return float((t90 - t10) / sr)

def kweight(x, fs=SR):
    # ITU-R BS.1770 K-weighting, coefficients by the RBJ forms pyloudnorm uses
    def shelf(G, Q, fc):
        A = 10 ** (G / 40); w = 2 * math.pi * fc / fs; al = math.sin(w) / (2 * Q); c = math.cos(w); s = 2 * math.sqrt(A) * al
        b = [A * ((A + 1) + (A - 1) * c + s), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - s)]
        a = [(A + 1) - (A - 1) * c + s, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - s]
        return b, a
    def hp(Q, fc):
        w = 2 * math.pi * fc / fs; al = math.sin(w) / (2 * Q); c = math.cos(w)
        return [(1 + c) / 2, -(1 + c), (1 + c) / 2], [1 + al, -2 * c, 1 - al]
    b, a = shelf(3.99984385397, 0.7071752369554193, 1681.9744509555319); y = lfilter(b, a, x, axis=-1)
    b, a = hp(0.5003270373253953, 38.13547087613982); return lfilter(b, a, y, axis=-1)
def lufs(x):  # x: (2, n), ungated, both channels weighted 1
    y = kweight(x); return float(-0.691 + 10 * math.log10(max(1e-20, (y ** 2).mean(axis=1).sum())))

FAM = {
 "cutoff": dict(key="filter_1_cutoff", rung_len=2.6, feat=centroid, win=(0.6, 1.6), names=["closed", "dark", "warm", "open", "bright"],
                corpus=corp["parameters_when_section_on"]["filter_1_cutoff"]),
 "attack": dict(key="env_1_attack", rung_len=5.6, feat=rise_time, win=(4.0, 5.0), names=["clicky", "punchy", "natural", "soft", "swell"],
                corpus=corp["parameters"]["env_1_attack"]),
}
bake = {}
for fam, F in FAM.items():
    sr, x = wavfile.read(os.path.join(SRC, f"ladder-{fam}.wav")); assert sr == SR
    x = x.T.astype(np.float64)
    rows = meas[fam]["rungs"]; N = len(rows)
    assert x.shape[1] % N == 0; stride = x.shape[1] // N
    L = int(round(F["rung_len"] * SR)) - 1  # pedalboard returns duration*SR floored
    out = []
    for i, r in enumerate(rows):
        seg = x[:, i * stride: i * stride + L]
        tail = x[:, i * stride + L: (i + 1) * stride]
        f = F["feat"](seg)
        w0, w1 = int(F["win"][0] * SR), int(F["win"][1] * SR)
        out.append(dict(value=r["value"], json_feature=r["feature"], feature=round(f, 4),
                        lufs=round(lufs(seg[:, w0:w1]), 2), peak=float(np.abs(seg).max()), gap_max=float(np.abs(tail).max())))
    # null: recomputed feature against the steward's json (rounded to 4 places there)
    worst = max(abs(o["feature"] - o["json_feature"]) / max(abs(o["json_feature"]), 1e-9) for o in out)
    ref = max(o["lufs"] for o in out)
    for o in out:
        o["gain_db"] = round(ref - o["lufs"], 2)
        o["peak_matched"] = o["peak"] * 10 ** (o["gain_db"] / 20)
    scale_db = min(0.0, 20 * math.log10(0.8 / max(o["peak_matched"] for o in out)))
    for o in out: o["gain_db"] = round(o["gain_db"] + scale_db, 2); o["peak_matched"] = round(o["peak"] * 10 ** (o["gain_db"] / 20), 3)
    # the proposal: the corpus fifths, the band edges corpus_bands.py uses; first rung of each upper band = first rung >= split
    c = F["corpus"]; splits = [c["p20"], c["p40"], c["p60"], c["p80"]]
    vals = [o["value"] for o in out]
    first = lambda s: next(i for i, v in enumerate(vals) if v >= s - 1e-9)
    prop = [first(s) for s in splits]
    # alternative geometries: even in knob number across the ladder, even in the measure (log) across the ladder
    v0, v1 = vals[0], vals[-1]
    even_num = [first(v0 + k * (v1 - v0) / 5) for k in range(1, 5)]
    feats = [o["feature"] for o in out]; g0, g1 = feats[0], feats[-1]
    even_meas = [next(i for i, g in enumerate(feats) if g >= g0 * (g1 / g0) ** (k / 5) - 1e-12) for k in range(1, 5)]
    # chance: every non-decreasing placement of four first-rungs among rungs 1..N-1, equally likely
    def agree(a, b): return sum(abs(p - q) <= 1 for p, q in zip(a, b))
    combos = list(itertools.combinations_with_replacement(range(1, N), 4))
    chance = {k: sum(agree(cb, prop) >= k for cb in combos) / len(combos) for k in (3, 4)}
    chance_le1 = sum(agree(cb, prop) <= 1 for cb in combos) / len(combos)
    # write the face's copy: one channel (L == R to the bit)
    _, raw = wavfile.read(os.path.join(SRC, f"ladder-{fam}.wav"))
    assert np.array_equal(raw[:, 0], raw[:, 1])
    wavfile.write(os.path.join(OUT, f"ladder-{fam}-mono.wav"), SR, raw[:, 0].copy())
    back = wavfile.read(os.path.join(OUT, f"ladder-{fam}-mono.wav"))[1]
    assert np.array_equal(back, raw[:, 0])
    bake[fam] = dict(param=F["key"], N=N, stride=stride, rung_len_s=round(L / SR, 6), stride_s=stride / SR, names=F["names"],
                     splits=[round(s, 6) for s in splits], proposal=prop, even_number=even_num, even_measure=even_meas,
                     arms_vs_proposal=dict(even_number=agree(even_num, prop), even_measure=agree(even_meas, prop)),
                     chance_ge3=round(chance[3], 4), chance_4=round(chance[4], 4), chance_le1=round(chance_le1, 4), placements=len(combos),
                     feature_null_worst_rel=worst, rungs=out)
    print(fam, "N", N, "stride", stride, "null worst rel", worst, "prop", prop, "even#", even_num, "evenM", even_meas,
          "chance>=3", chance[3], "=4", chance[4], "<=1", chance_le1)
    for o in out: print("  ", o)
json.dump(bake, open(BAKE, "w"), indent=1)
