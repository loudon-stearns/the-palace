"""
vital_measure.py — Vital can be heard by the machine, so measure what its knobs do.

For Ableton Wavetable the only listener is Loudon in Live. Vital renders headless
(vital_host.py), so each feel-word axis can first be *measured*: render a ladder
of one parameter on Vital's init patch, compute an acoustic feature per rung, and
put the corpus percentiles (how designers set it) beside the measured curve.

Measured is not heard. A centroid says "brighter", not "where it turns from dark
to warm". The ear still names the bands; the measurement says where the knob is
steep (where a small move changes a lot) and where it is flat (where it doesn't),
so the ear's ladder can put its rungs where the change is.

Families:
  cutoff     filter_1_cutoff (semitones, MIDI-note scale) on a saw, analog 12dB LP
             → spectral centroid of the sustain
  attack     env_1_attack (raw, seconds = raw**4) → 10–90 % rise time
  resonance  filter_1_resonance at cutoff 76 st (~659 Hz) → spectral peak near cutoff, dB above resonance 0

Writes renders/ladder-<family>.wav (rungs back to back, 0.3 s apart) and
profile-draft/vital_measured_v0.1.json.
"""
import json, os, sys
import numpy as np, pedalboard
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import vital_host as vh

_C = json.load(open(os.path.join(HERE, "profile-draft", "vital_corpus_stats_v0.1.json")))
STATS = {**_C["parameters"], **_C["parameters_when_section_on"]}  # bands from presets that use the section
NOTE = 48  # C3


def st_to_hz(st):
    return 440.0 * 2 ** ((st - 69) / 12)


def mono(x):
    return x.mean(axis=0)


def centroid(x, sr=vh.SR):
    seg = mono(x)[int(0.6 * sr):int(1.6 * sr)]
    sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
    f = np.fft.rfftfreq(len(seg), 1 / sr)
    return float((sp * f).sum() / max(sp.sum(), 1e-12))


def rise_time(x, sr=vh.SR):
    e = np.sqrt(np.convolve(mono(x) ** 2, np.ones(256) / 256, "same"))
    pk = e[: int(4.5 * sr)].max()
    t10 = np.argmax(e > 0.1 * pk); t90 = np.argmax(e > 0.9 * pk)
    return float((t90 - t10) / sr)


def res_peak_db(x, cutoff_hz, sr=vh.SR):
    seg = mono(x)[int(0.6 * sr):int(1.6 * sr)]
    sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))); f = np.fft.rfftfreq(len(seg), 1 / sr)
    band = (f > cutoff_hz / 1.5) & (f < cutoff_hz * 1.5)
    ref = (f > 60) & (f < cutoff_hz * 3)
    return float(20 * np.log10(sp[band].max() / max(np.median(sp[ref]), 1e-12)))


def base():
    # init patch: osc 1 = init saw into filter 1, filter on, analog 12 dB low-pass
    return {"settings": {"filter_1_on": 1.0, "filter_1_model": 0.0, "filter_1_style": 0.0,
                         "filter_1_cutoff": 136.0, "filter_1_resonance": 0.0, "filter_1_keytrack": 0.0,
                         "osc_1_destination": 0.0, "osc_1_unison_voices": 1.0,
                         "osc_1_random_phase": 0.0, "env_1_attack": 0.0, "env_1_release": 0.3,
                         "reverb_on": 0.0, "delay_on": 0.0, "chorus_on": 0.0, "compressor_on": 0.0}}


def ladder(p, name, key, rungs, feature, hold=2.0, extra=None):
    out, audio = [], []
    for r in rungs:
        pr = base(); pr["settings"].update(extra or {}); pr["settings"][key] = float(r)
        vh.load(p, pr)
        x = vh.render(p, notes=(NOTE,), hold=hold if name != "attack" else 5.0, tail=0.6)
        out.append({"value": round(float(r), 4), "feature": round(feature(x), 4)})
        audio.append(x); audio.append(np.zeros((2, int(0.3 * vh.SR)), np.float32))
    a = np.concatenate(audio, axis=1)
    a = a / max(1e-9, np.abs(a).max()) * 0.5  # one gain for the whole ladder: rungs keep their relative level
    wavfile.write(os.path.join(HERE, "renders", f"ladder-{name}.wav"), vh.SR, a.T.astype(np.float32))
    return out


def corpus(key):
    s = STATS[key]; return {k: s[k] for k in ("p20", "p40", "p60", "p80")}


def main():
    p = pedalboard.load_plugin(vh.VST)
    res = {}
    cut = [20, 30, 40, 50, 60, 66, 72, 78, 84, 90, 100, 110, 120, 136]
    rows = ladder(p, "cutoff", "filter_1_cutoff", cut, centroid)
    for r in rows: r["hz"] = round(st_to_hz(r["value"]), 1)
    res["cutoff"] = {"param": "filter_1_cutoff", "unit": "semitones (MIDI scale)", "feature": "spectral centroid, Hz",
                     "rungs": rows, "corpus": corpus("filter_1_cutoff")}

    att = [0.0, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 1.0, 1.15, 1.3]
    rows = ladder(p, "attack", "env_1_attack", att, rise_time)
    for r in rows: r["seconds"] = round(r["value"] ** 4, 5)
    res["attack"] = {"param": "env_1_attack", "unit": "raw (seconds = raw^4)", "feature": "10-90% rise time, s",
                     "rungs": rows, "corpus": corpus("env_1_attack")}

    resn = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    rows = ladder(p, "resonance", "filter_1_resonance", resn, lambda x: res_peak_db(x, st_to_hz(76)),
                  extra={"filter_1_cutoff": 76.0})
    res["resonance"] = {"param": "filter_1_resonance", "unit": "0..1", "feature": "peak near cutoff over median, dB",
                        "rungs": rows, "corpus": corpus("filter_1_resonance"), "at_cutoff_st": 76}
    # a saw's spectrum is mostly gaps between harmonics, so the absolute ratio is
    # meaningless; report each rung relative to resonance 0
    r0 = rows[0]["feature"]
    for r in rows: r["feature"] = round(r["feature"] - r0, 2)
    res["resonance"]["feature"] = "peak near cutoff, dB above the same measure at resonance 0"

    json.dump(res, open(os.path.join(HERE, "profile-draft", "vital_measured_v0.1.json"), "w"), indent=1)
    for k, v in res.items():
        print(k, [(r["value"], r["feature"]) for r in v["rungs"]], v["corpus"])


if __name__ == "__main__":
    main()
