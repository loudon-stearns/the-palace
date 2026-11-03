#!/usr/bin/env python3
# title: Generative Wavetable Libraries — rich — check
# born: 2026-11-03
# links: [[Generative Wavetable Libraries]] (connects-to · rich-face-check) · checks "… — rich — the crystal knob.html", "… — rich — brighter all the way.html" and "… — rich — line up or not.html"
# forward_vector: I run each piece's own engine, pulled out of its page, in Node; hold it to the project's shipped wavs; and recompute every number the pieces show through the project's own Python (generate.py, generate_shepard.py, buzz_probe.py, smooth_tables.py, scale_up.py). Every line prints ok or FAIL, and each test says what would have failed it.
# run: python3 "Projects/Generative Wavetable Libraries/Generative Wavetable Libraries — rich — check.py" [<folder holding crystal-bravais/ and shepard-centroid/ wavs>]
#      The wavs are ignored by git; on Loudon's Mac they sit in this bundle. Needs numpy and soundfile (the project's own modules import it) and node.
import json, struct, subprocess, sys, tempfile
from pathlib import Path
import numpy as np

HERE = Path(__file__).resolve().parent
WAVS = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE
for sub in ("crystal-bravais", "loop-smoothing", "akwf-scale-up-fmsynth"):
    sys.path.insert(0, str(HERE / sub))
import generate as G                                              # noqa: E402
from buzz_probe import naive_sweep, clean_sweep, nonharmonic_db, bandlimit, SR   # noqa: E402
import smooth_tables as STB                                       # noqa: E402
import scale_up as su                                             # noqa: E402

fails = 0
def ok(cond, what):
    global fails
    print(("ok   " if cond else "FAIL ") + what)
    if not cond: fails += 1

def read_wav(p):
    b = Path(p).read_bytes(); i = 12; fmt = data = None
    while i < len(b) - 8:
        cid = b[i:i+4]; n = struct.unpack("<I", b[i+4:i+8])[0]; body = b[i+8:i+8+n]
        if cid == b"fmt ": fmt = struct.unpack("<HHIIHH", body[:16])
        if cid == b"data": data = body
        i += 8 + n + (n & 1)
    return (np.frombuffer(data, "<f4").astype(float) if fmt[0] == 3 else np.frombuffer(data, "<i2") / 32768.0), fmt[2]

PIECE = lambda w: HERE / f"Generative Wavetable Libraries — rich — {w}.html"

# ---- the JS side: each page's engine block, run in Node ----
JS = r"""
const fs = require('fs'); const out = process.argv[2]; const R = {};
const eng = (f) => fs.readFileSync(f, 'utf8').match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const put = (name, arr) => { fs.writeFileSync(out + '/' + name + '.f64', Buffer.from(Float64Array.from(arr).buffer)); };
{ const E = new Function(eng(process.argv[3]) + '; return {keyframes, interpolate, seamFacts, frameCentroid, falls, SYSTEMS, renderAsked, renderHeld};')();
  const K = E.keyframes('zero'), T = E.interpolate(K); put('crystal', T.flatMap((f) => [...f]));
  R.facts = E.SYSTEMS.map((_, j) => E.seamFacts(K, j)); R.crystalFalls = E.falls(T.map((f) => E.frameCentroid(f)));
  put('asked6', E.renderAsked(6, 44100, 110)); put('held6', E.renderHeld(K, 6, 44100, 110)); }
{ const E = new Function(eng(process.argv[4]) + '; return {shepardTable, sweep, fades, frameCentroid, falls, countHere, shuffled};')();
  put('shepard', E.shepardTable().flatMap((f) => [...f]));
  const x = E.fades(E.sweep(E.shepardTable(1024), 110, 12, 44100), 44100); put('audition', x);
  R.here = E.countHere(null, 110); const order = E.shuffled(64, 1); R.shuf = E.countHere(order, 110); R.order = order; }
{ const E = new Function(eng(process.argv[5]) + '; return {keyframes, interpolate, morphDips, sweep, fades, rms, matchLevel, leak, TURNS};')();
  R.dips = {}; for (const m of ['zero', 'carry', 'turned']) { R.dips[m] = E.morphDips(E.keyframes(m)); put('tab_' + m, E.interpolate(E.keyframes(m)).flatMap((f) => [...f])); }
  R.turns = E.TURNS; R.abx = {};
  for (const sr of [44100, 48000]) for (const pair of ['carry', 'turned']) for (const lev of ['win', 'whole']) {
    const a = E.fades(E.sweep(E.interpolate(E.keyframes('zero')), 110, 6, sr), sr), b0 = E.fades(E.sweep(E.interpolate(E.keyframes(pair)), 110, 6, sr), sr);
    const g = 0.1 / E.rms(a); for (let i = 0; i < a.length; i++) a[i] *= g; const b = E.matchLevel(a, b0, lev); R.abx[`${sr} ${pair} ${lev}`] = E.leak(a, b); } }
fs.writeFileSync(out + '/r.json', JSON.stringify(R));
"""
tmp = Path(tempfile.mkdtemp()); (tmp / "x.js").write_text(JS)
subprocess.run(["node", str(tmp / "x.js"), str(tmp), str(PIECE("the crystal knob")), str(PIECE("brighter all the way")), str(PIECE("line up or not"))], check=True)
R = json.loads((tmp / "r.json").read_text()); arr = lambda n: np.fromfile(tmp / f"{n}.f64", dtype=np.float64)

print("— the engines against the shipped files")
cw, _ = read_wav(WAVS / "crystal-bravais/crystal_bravais.wav")
e = np.abs(arr("crystal") - cw).max(); ok(e < 1e-6, f"crystal knob, line up or not: the engine rebuilds crystal_bravais.wav, all {cw.size} samples, max error {e:.1e} (a recipe change would show as 1e-2 or more)")
sw, _ = read_wav(WAVS / "shepard-centroid/shepard_centroid.wav")
e = np.abs(arr("shepard") - sw).max(); ok(e < 1e-6, f"brighter all the way: the engine rebuilds shepard_centroid.wav, max error {e:.1e}")
aw, _ = read_wav(WAVS / "shepard-centroid/shepard_centroid_audition_sweep.wav")
x = arr("audition"); x = np.round(np.clip(x / np.abs(x).max() * 0.95, -1, 1) * 32767) / 32768
e = np.abs(x - aw).max(); ok(len(x) == len(aw) and e <= 1 / 32768 + 1e-9, f"brighter all the way: its sweep, levelled and rounded as render_sweep does, is the audition wav to within one 16-bit step ({e * 32768:.2f} steps)")
Kz = G.build_keyframes(2048)
ok(np.abs(arr("tab_zero") - G.interpolate_table(Kz, 64).reshape(-1)).max() < 1e-12, "line up or not: the zero-phase arm is generate.py's own table")

print("— the crystal knob")
def cent(fr, A=None):
    s = np.abs(np.fft.rfft(fr)); s[0] = 0; k = np.arange(len(s)); return np.log2(max((k * s).sum() / s.sum(), 1.0))
c = np.array([cent(f) for f in cw.reshape(64, 2048)]); n = int((np.diff(c) < 0).sum())
c2 = np.array([np.log2((np.arange(1025) * (lambda s: (s * (np.arange(1025) > 0)) ** 2)(np.abs(np.fft.rfft(f)))).sum() / ((np.abs(np.fft.rfft(f)) * (np.arange(1025) > 0)) ** 2).sum()) for f in cw.reshape(64, 2048)])
n2 = int((np.diff(c2) < 0).sum()); fall_idx = np.where(np.diff(c) < 0)[0]
ok(n2 == 0, f"crystal knob, weighted by power: {n2} falls in 63 steps (the page says 0)")
ok(n == 11 and R["crystalFalls"]["n"] == 11 and fall_idx.min() == 52 and fall_idx.max() == 62, f"crystal knob, weighted by amplitude: {n} falls, steps {fall_idx.min() + 1}→{fall_idx.max() + 2} (frames 53 to 64), {c[52] - c[63]:.2f} octave in all; the engine agrees ({R['crystalFalls']['n']})")
def offgrid(x, f0=110.0, sr=SR, tol=4):
    seg = x[sr // 2: sr // 2 + sr] * np.hanning(sr); S = np.abs(np.fft.rfft(seg)) ** 2; f = np.fft.rfftfreq(sr, 1 / sr)
    d = np.abs(f - np.round(f / f0) * f0); h = (d < tol) & (f > 0); return 10 * np.log10(S[~h].sum() / S[h].sum())
t = np.arange(2 * SR) / SR; asked = []; bl = []; plain = []
for j, (name, n_, ro, dt, ob) in enumerate(G.BRAVAIS_SYSTEMS):
    Tj = np.array([Kz[j], Kz[j]]); add = np.zeros_like(t)
    for k in range(1, n_ + 1):
        a = 1 / k ** ro; a = a / ob if k % 2 == 0 else a
        add += a * np.sin(2 * np.pi * 110 * k * G.cents_to_ratio(dt * ((k - 1) / max(1, n_ - 1))) * t)
    asked.append(round(float(offgrid(add)), 1)); bl.append(round(float(offgrid(clean_sweep(Tj, dur=2.0))), 1)); plain.append(round(float(offgrid(naive_sweep(Tj, dur=2.0))), 1))
page = PIECE("the crystal knob").read_text()
ok(all(f"{v:.1f}" in page for v in asked), f"off ÷ on the harmonics, asked as free sines: {asked} dB (the page's table)")
ok(all(f"{v:.1f}" in page for v in bl + plain), f"held, band-limited reader {bl}; held, plain reader {plain} (the page's table)")
ok(asked[6] > -6 and bl[6] < -100, f"the test can fail: had the cycle kept the detune, the band-limited share would sit near the asked {asked[6]} dB; it is {bl[6]} dB")
F = R["facts"]; worst = max(range(7), key=lambda j: F[j]["ratio"])
ok(G.BRAVAIS_SYSTEMS[worst][0] == "orthorhombic" and abs(F[worst]["ratio"] - 12.3) < 0.05, f"seam up to {F[worst]['ratio']:.1f}× the sharpest step inside, at {G.BRAVAIS_SYSTEMS[worst][0]}")
ok(abs(F[5]["above"] + 17.9) < 0.05 and abs(F[6]["change"] + 16.2) < 0.05, f"above partial n at monoclinic {F[5]['above']:.1f} dB; detune changes {F[6]['change']:.1f} dB of triclinic")
# the same three numbers in Python, independently
def frame(s, detune=True):
    _, n_, ro, dt, ob = s; tt = np.linspace(0, 2 * np.pi, 2048, endpoint=False); f = np.zeros(2048)
    for k in range(1, n_ + 1):
        a = 1 / k ** ro; a = a / ob if k % 2 == 0 else a
        f += a * np.sin(k * G.cents_to_ratio((dt if detune else 0) * ((k - 1) / max(1, n_ - 1))) * tt)
    return G.normalize(f)
for j in (4, 5, 6):
    a = frame(G.BRAVAIS_SYSTEMS[j]); b = frame(G.BRAVAIS_SYSTEMS[j], False)
    ratio = abs(a[0] - a[-1]) / np.abs(np.diff(a)).max(); ok(abs(ratio - F[j]["ratio"]) < 1e-6, f"{G.BRAVAIS_SYSTEMS[j][0]}: seam ratio agrees in Python ({ratio:.2f})")
ok(len(arr("asked6")) == len(arr("held6")), "the two step-4 sounds are the same length")

print("— brighter all the way")
c = np.array([cent(f) for f in sw.reshape(64, 2048)]); d = np.diff(c)
def cent_pow(fr):
    s = np.abs(np.fft.rfft(fr)) ** 2; s[0] = 0; k = np.arange(len(s)); return np.log2((k * s).sum() / s.sum())
ok(int((np.diff([cent_pow(f) for f in sw.reshape(64, 2048)]) < 0).sum()) == 0, "shepard_centroid.wav weighted by power: 0 falls too (the page says so)")
ok(int((d < 0).sum()) == 0 and abs(d.min() - 0.0430) < 5e-5, f"shepard_centroid.wav: {int((d < 0).sum())} falls in 63 steps, smallest step +{d.min():.4f} oct (refuted by any fall)")
def sweep_cents(a, sr=44100, N=4096, H=1024):
    w = np.hanning(N); f = np.fft.rfftfreq(N, 1 / sr); st = int(0.06 * sr); out = []
    for s0 in range(st, len(a) - N - st, H):
        S = np.abs(np.fft.rfft(a[s0:s0 + N] * w)); S[f < 20] = 0; out.append(np.log2((f * S).sum() / S.sum()))
    return np.array(out)
ca = sweep_cents(aw); d = np.diff(ca)
ok(len(d) == 507 and int((d < 0).sum()) == 0 and abs(d.min() - 0.0036) < 5e-5 and round(2 ** ca[0]) == 498 and round(2 ** ca[-1]) == 9992,
   f"the audition wav: {int((d < 0).sum())} falls in {len(d)} windows, smallest step +{d.min():.4f} oct, {2 ** ca[0]:.0f} → {2 ** ca[-1]:.0f} Hz")
ok(R["here"]["fc"]["n"] == 0 and R["here"]["sc"]["n"] == 0 and R["here"]["sc"]["steps"] == 507, f"the page's own count: frames {R['here']['fc']['n']}/{R['here']['fc']['steps']}, sweep {R['here']['sc']['n']}/{R['here']['sc']['steps']}")
cs = np.array([cent(f) for f in sw.reshape(64, 2048)[R["order"]]])
ok(R["shuf"]["fc"]["n"] > 10 and R["shuf"]["sc"]["n"] > 50 and int((np.diff(cs) < 0).sum()) == R["shuf"]["fc"]["n"],
   f"the control can fail: shuffled, {R['shuf']['fc']['n']} falls in 63 frames and {R['shuf']['sc']['n']} in {R['shuf']['sc']['steps']} windows (Python agrees on the frames)")
T1 = read_wav(WAVS / "shepard-centroid/shepard_centroid_ableton.wav")[0].reshape(64, 1024)
def fades(x, sr=44100):
    r = int(0.05 * sr); x = x.copy(); x[:r] *= np.linspace(0, 1, r); x[-r:] *= np.linspace(1, 0, r); return x
rows = []
for f0 in (55, 110, 220, 440, 880, 1760):
    a = sweep_cents(fades(naive_sweep(T1, f0=f0, dur=12.0))); b = sweep_cents(fades(naive_sweep(bandlimit(T1, int(18000 // f0), up=8), f0=f0, dur=12.0)))
    rows.append((f0, int((np.diff(a) < 0).sum()), int((np.diff(b) < 0).sum()), float(np.diff(a).min())))
print("     notes (Hz, plain falls, band-limited falls, worst plain step):", rows)
bp = PIECE("brighter all the way").read_text()
want = "[['A1', 55, %d, %d], ['A2', 110, %d, %d], ['A3', 220, %d, %d], ['A4', 440, %d, %d], ['A5', 880, %d, %d], ['A6', 1760, %d, %d]]" % tuple(v for r in rows for v in r[1:3])
ok(want.replace("'", "'") in bp.replace("[['A1'", "[['A1'"), "the notes table on the page is these counts: " + want)
ok(all(r[2] == 0 for r in rows) and all(r[3] > -0.002 for r in rows), "band-limited: no fall at any note; plain: every fall under 0.002 octave")
seg = aw[int(10.5 * 44100):int(11.5 * 44100)] * np.hanning(44100); S = np.abs(np.fft.rfft(seg)) ** 2; f = np.fft.rfftfreq(44100, 1 / 44100)
al = 10 * np.log10(S[np.abs(f - 15940) < 20].sum() / S.sum()); ok(abs(al + 9.6) < 0.05, f"the folded top partial at 15.94 kHz carries {al:.1f} dB of the audition between 10.5 and 11.5 s")

print("— line up or not")
tt = np.linspace(0, 2 * np.pi, 2048, endpoint=False); ph = {}; Kc = []
for name, n_, ro, dt, ob in G.BRAVAIS_SYSTEMS:
    fr = np.zeros(2048); nxt = {}
    for k in range(1, n_ + 1):
        a = 1 / k ** ro; a = a / ob if k % 2 == 0 else a; m_ = k * G.cents_to_ratio(dt * ((k - 1) / max(1, n_ - 1))); p0 = ph.get(k, 0.0)
        fr += a * np.sin(m_ * tt + p0); nxt[k] = (p0 + 2 * np.pi * m_) % (2 * np.pi)
    ph.update(nxt); Kc.append(G.normalize(fr))
Kc = np.array(Kc); Kt = np.array([np.roll(k, s) for k, s in zip(Kz, R["turns"])])
ok(np.abs(arr("tab_carry") - G.interpolate_table(Kc, 64).reshape(-1)).max() < 1e-9 and np.abs(arr("tab_turned") - G.interpolate_table(Kt, 64).reshape(-1)).max() < 1e-9, "the carried and turned arms agree with the same policies written in Python")
for m, K in (("zero", Kz), ("carry", Kc), ("turned", Kt)):
    py = su.morph_dips_db(K); ok(np.allclose(py, R["dips"][m], atol=1e-9), f"{m}: morph_dips_db {np.round(py, 2).tolist()} — the page's engine agrees")
draws = []
for seed in range(40):
    rng = np.random.default_rng(seed); sh = [0] + [int(rng.integers(0, 2048)) for _ in range(6)]
    draws.append((float(su.morph_dips_db(np.array([np.roll(k, s) for k, s in zip(Kz, sh)])).min()), seed, sh))
srt = sorted(draws); med = srt[len(srt) // 2]
ok(med[2] == R["turns"] and f"{srt[0][0]:.1f}" == "-7.8" and f"{srt[-1][0]:.1f}" == "-3.2" and "−3.2 to −7.8 dB" in PIECE("line up or not").read_text(), f"the turns are the median of 40 draws (seed {med[1]}, {med[0]:.2f} dB); the 40 run {srt[0][0]:.1f} to {srt[-1][0]:.1f} dB")
meter = {}
for m, K in (("zero", Kz), ("carry", Kc), ("turned", Kt)):
    T_ = G.interpolate_table(K, 64); meter[m] = (round(STB.offnote_db(T_, dur=6.0), 1), round(float(np.median(nonharmonic_db(naive_sweep(T_, dur=6.0)))), 1))
print("     meters (buzz band-limited, plain median):", meter)
cp = PIECE("line up or not").read_text()
ok(all(f"{m}: {{ buzz: {meter[m][0]}, plain: {meter[m][1]} }}" in cp for m in meter), "the page's METER line is these numbers")
ok(meter["turned"][0] - meter["zero"][0] > 15 and abs(meter["carry"][0] - meter["zero"][0]) < 2, f"turned buzzes {meter['turned'][0] - meter['zero'][0]:.1f} dB more than shipped; carried {meter['carry'][0] - meter['zero'][0]:+.1f} dB (the warning would fail if turned were within a few dB of shipped)")
for key, L in R["abx"].items():
    sr, pair, lev = key.split()
    good = L["lenA"] == L["lenB"] and abs(L["whole"]) < 0.05 and (L["worst"] < 0.25 if lev == "win" else True) and L["peakA"] < -1 and L["peakB"] < -1
    ok(good, f"blind test {sr} Hz, {pair}, level {lev}: lengths {L['lenA']}={L['lenB']}, whole {L['whole']:+.3f} dB, worst 46 ms {L['worst']:.2f} dB, peaks {L['peakA']:.1f}/{L['peakB']:.1f} dBFS")
w = R["abx"]["44100 carry whole"]["worst"]; ok(abs(w - 2.5) < 0.15, f"matched only over the whole sweep, zero and carried differ by up to {w:.2f} dB window to window (the page says 2.5)")
print(f"\n{'all ok' if not fails else str(fails) + ' FAILED'}")
sys.exit(1 if fails else 0)
