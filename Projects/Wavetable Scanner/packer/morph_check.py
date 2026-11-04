"""Crossfade against spectral morph, measured and rendered (2026-11-04).

Loudon on the blur: "I can't really hear it — a better, more refined smoothing
between waveforms would be good." The blur works on the frames; what you hear
between two frames is the playback crossfade, which mixes two waveforms and can
hollow out any harmonic the two hold out of phase. packer.js's spectralMorph
fills each gap with frames made in the spectrum instead: every harmonic's level
moves in a straight line and its phase turns the short way round.

For four tables (the Sketch's classics, and the FM, organ and cello folders in
family-chain order) this packs both ways and scores, at the halfway point of
every pair of original neighbours:
  - level dip: the halfway sound's loudness against its two neighbours' (GWL's morph dip);
  - holes: harmonics (1-64, within 40 dB of the pair's loudest) that sound more
    than 6 dB quieter halfway than the average of the two ends;
  - buzz: GWL's sweep buzz, energy 4-15 Hz off the harmonics in a 24 s sweep;
and renders an A/B per table: the same sweep, crossfade, a second of silence,
then the locked spectral morph, matched to the first in loudness. Writes morph_check.json and morph/ab_<table>.wav.

    /usr/local/bin/python3 morph_check.py"""
import base64, json, re, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf
HERE = Path(__file__).parent
GWL = HERE.parents[1] / "Generative Wavetable Libraries"
sys.path.insert(0, str(GWL / "akwf-scale-up-fmsynth")); sys.path.insert(0, str(GWL / "loop-smoothing"))
import scale_up as su                      # noqa: E402
from smooth_tables import offnote_db       # noqa: E402
AKWF = Path.home() / "Desktop/AKWF"
OUT = HERE / "morph"; OUT.mkdir(exist_ok=True)
FR = 1024
WAYS = [("crossfade", 0, 512), ("spectral", 0, 512), ("locked", 0, 512), ("locked", 0, 1), ("crossfade", 1, 512), ("locked", 1, 512)]
AB = [0, 2]                                # the A/B file: crossfade, then locked spectral, matched in loudness

def pack(src, morph, out, smooth=0, target=512):
    """src: an AKWF folder (packed in chain order) or a list of frames (written as one-cycle files)."""
    if isinstance(src, Path):
        subprocess.run(["node", str(HERE / "pack_folder.cjs"), str(src), str(out), "chain", str(smooth), morph, str(target)], check=True, capture_output=True)
    else:
        tmp = OUT / "_frames"; tmp.mkdir(exist_ok=True)
        for p in tmp.glob("*.wav"): p.unlink()
        for i, f in enumerate(src): sf.write(tmp / f"{i:02d}.wav", f.astype(np.float32), 44100, subtype="FLOAT")
        subprocess.run(["node", str(HERE / "pack_folder.cjs"), str(tmp), str(out), "file", str(smooth), morph, str(target)], check=True, capture_output=True)
        for p in tmp.glob("*.wav"): p.unlink()
        tmp.rmdir()
    t, _ = sf.read(out); meta = json.loads(out.with_suffix(".json").read_text()); out.with_suffix(".json").unlink()
    return t.reshape(-1, FR), meta

def mags(x): return np.abs(np.fft.rfft(x))[1:65]
def rms(x): return float(np.sqrt(np.mean(x ** 2)))

def halfway(table, between, f):
    """The table read halfway between original frames f and f+1, as the synth reads it."""
    pos = f * (between + 1) + (between + 1) / 2
    a = int(pos); fr = pos - a; b = min(a + 1, len(table) - 1)
    return table[a] + fr * (table[b] - table[a])

def score(table, between):
    step = between + 1; src = table[::step]
    dips, holes, worst_hole = [], [], 0.0
    for f in range(len(src) - 1):
        A, B, M = src[f], src[f + 1], halfway(table, between, f)
        dips.append(20 * np.log10(rms(M) / (0.5 * (rms(A) + rms(B)))))
        exp = 0.5 * (mags(A) + mags(B)); live = exp > exp.max() * 10 ** (-40 / 20)
        d = 20 * np.log10((mags(M)[live] + 1e-12) / exp[live])
        holes.append(int((d < -6).sum())); worst_hole = min(worst_hole, float(d.min()))
    return {"frames": len(table), "between": between, "worst_dip_db": round(min(dips), 1),
            "pairs_with_a_hole": f"{sum(h > 0 for h in holes)} of {len(holes)}", "holes_total": int(sum(holes)),
            "deepest_hole_db": round(worst_hole, 1),
            "buzz_db": round(offnote_db(np.array([su.resample_cycle(f, 2048) for f in table])), 1)}

sketch = (HERE.parent / "wavetable_scanner.html").read_text()
cl = json.loads(re.search(r"const TABLES = (\[.*?\]);\n", sketch, re.S).group(1))[0]
classics = np.frombuffer(base64.b64decode(cl["data"]), dtype="<f4").reshape(-1, FR) if isinstance(cl["data"], str) else np.array(cl["data"]).reshape(-1, FR)

report = {}
for tag, src, secs in [("classics", list(classics), 12), ("fmsynth", AKWF / "AKWF_fmsynth", 20),
                       ("eorgan", AKWF / "AKWF_eorgan", 20), ("cello", AKWF / "AKWF_cello", 12)]:
    r = report[tag] = {}; renders = []
    for morph, sm, target in WAYS:
        key = morph + ("_only" if target == 1 else "") + (f"_blur{sm}" if sm else ""); wav = OUT / f"{tag}_{key}.wav"
        t, meta = pack(src, morph, wav, sm, target)
        r[key] = score(t, meta["between"] or 0)
        sw = OUT / f"_sweep_{morph}.wav"
        subprocess.run(["node", str(HERE / "render_sweep.cjs"), str(wav), str(sw), str(secs), "110"], check=True, capture_output=True)
        y, sr = sf.read(sw); renders.append(y); sw.unlink()
    a, b = renders[AB[0]], renders[AB[1]]; b = b * np.sqrt(np.mean(a ** 2) / np.mean(b ** 2))
    ab = np.concatenate([a, np.zeros(sr), b]); ab *= 0.9 / np.abs(ab).max()     # one gain for both halves
    sf.write(OUT / f"ab_{tag}.wav", ab.astype(np.float32), sr, subtype="FLOAT")
    for p in OUT.glob(f"{tag}_*.wav"): p.unlink()                                   # the packed tables were only for scoring
    print(tag, json.dumps(r))
(HERE / "morph_check.json").write_text(json.dumps(report, indent=2))
