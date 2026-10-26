"""
vital_render.py — render any .vital preset to WAV and measure what came out.

    ~/.venvs/palace-vital/bin/python vital_render.py <preset.vital> [...] [--note 48] [--hold 3] [--out renders/x]

Each render gets a sidecar of measured features, so a preset can be checked
by the machine before anyone listens:
  level_db     RMS of the held note, dBFS
  centroid_hz  brightness of the sustain (median over 50 ms frames)
  motion       how much brightness moves while held (std of log2 centroid, octaves)
  rise_s       10–90 % rise time of the loudness envelope
  width        side/mid energy ratio (0 = mono)
  tail_s       how long the release rings above −40 dB of the peak after note-off
These are the axes the prompt test needs: "audibly distinct" can be asked of
numbers first and of ears second.
"""
import argparse, json, os, sys
import numpy as np, pedalboard
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import vital_host as vh


def features(x, hold, sr=vh.SR):
    m = x.mean(axis=0); s = (x[0] - x[1]) / 2
    held = m[int(0.05 * sr):int(hold * sr)]
    fr = 2048; hop = 1024
    cents = []
    win = np.hanning(fr); f = np.fft.rfftfreq(fr, 1 / sr)
    for i in range(int(0.3 * sr), int(hold * sr) - fr, hop):
        sp = np.abs(np.fft.rfft(m[i:i + fr] * win))
        if sp.sum() > 1e-6: cents.append((sp * f).sum() / sp.sum())
    cents = np.array(cents) if cents else np.array([1.0])
    env = np.sqrt(np.convolve(m ** 2, np.ones(256) / 256, "same"))
    pk = env[:int(hold * sr)].max() + 1e-12
    t10 = np.argmax(env > 0.1 * pk); t90 = np.argmax(env > 0.9 * pk)
    after = env[int(hold * sr):]
    ring = np.nonzero(after > pk * 0.01)[0]
    return {
        "level_db": round(float(20 * np.log10(np.sqrt((held ** 2).mean()) + 1e-12)), 1),
        "centroid_hz": round(float(np.median(cents)), 0),
        "motion": round(float(np.std(np.log2(np.maximum(cents, 1)))), 3),
        "rise_s": round(float((t90 - t10) / sr), 3),
        "width": round(float((s[:int(hold * sr)] ** 2).sum() / max((m[:int(hold * sr)] ** 2).sum(), 1e-12)), 3),
        "tail_s": round(float(ring[-1] / sr) if len(ring) else 0.0, 2),
    }


def render_file(p, preset, out_wav, note=48, hold=3.0, tail=2.5, chord=False):
    data = json.load(open(preset)) if isinstance(preset, str) else preset
    vh.load(p, data)
    notes = (note, note + 7, note + 12, note + 16) if chord else (note,)
    x = vh.render(p, notes=notes, hold=hold, tail=tail)
    feat = features(x, hold)
    peak = float(np.abs(x).max())
    if peak > 0.98: x = x / peak * 0.98  # never clip the file; the sidecar keeps the true level
    os.makedirs(os.path.dirname(out_wav), exist_ok=True)
    wavfile.write(out_wav, vh.SR, x.T.astype(np.float32))
    side = {"preset": preset if isinstance(preset, str) else data.get("preset_name", ""),
            "note": note, "chord": chord, "hold_s": hold, "peak": round(peak, 3), "features": feat}
    json.dump(side, open(out_wav[:-4] + ".json", "w"), indent=1)
    return feat


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("presets", nargs="+"); ap.add_argument("--note", type=int, default=48)
    ap.add_argument("--hold", type=float, default=3.0); ap.add_argument("--out", default=os.path.join(HERE, "renders"))
    ap.add_argument("--chord", action="store_true")
    a = ap.parse_args()
    p = pedalboard.load_plugin(vh.VST)
    for f in a.presets:
        name = os.path.splitext(os.path.basename(f))[0]
        print(name, render_file(p, f, os.path.join(a.out, name + ".wav"), a.note, a.hold, chord=a.chord))


if __name__ == "__main__":
    main()
