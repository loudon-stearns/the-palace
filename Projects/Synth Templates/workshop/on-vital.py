#!/usr/bin/env python3
"""Synth Templates — a card's Vital mapping, made into a real .vital preset, rendered in the hosted Vital and set beside the reference.

usage: ~/.venvs/palace-vital/bin/python on-vital.py [house-bass] [--fit]
  needs the palace-vital venv (pedalboard, numpy, scipy, mido, matplotlib, pyyaml) and /Library/Audio/Plug-Ins/VST3/Vital.vst3.
  writes proofs/<date>-on-vital/<id>.vital (load it in Vital), <id>-vital.wav, <id>-compare.png, <id>-compare.json

The preset is built from the card's mappings.vital rows read through vocabulary.yaml's numbers, converted to Vital's units
(cutoff in MIDI semitones, envelope times raw = seconds^(1/4), modulation depth as a fraction of the 8-136 semitone cutoff range).
The render plays the same schedule the site's voice plays for the card (readPattern in site/voice.js; the house bass is four offbeat
eighths at 124 bpm, each a 16th long, C2, velocity 100, first note at 0.05 s + one eighth), so the two files line up note for note.
--fit sweeps the filter envelope's decay and depth on Vital and keeps the pair whose brightness over time is nearest the reference's:
a "start here, finish by ear" row given a measured start. It is still finished by ear; the numbers only say where to start.

Vital is hosted through Generative Preset Development's vital_host (its own --headless --render segfaults). Only the house bass is
built so far; the builder is the card's rows written out by hand below, not yet read from the card.
"""
import sys, os, json, math, base64, datetime, pathlib, copy
import numpy as np, yaml, mido, pedalboard
from scipy.io import wavfile
from scipy.signal import stft
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = pathlib.Path(__file__).parent
GPD = HERE.parents[1] / "Generative Preset Development" / "vital"
sys.path.insert(0, str(GPD))
import vital_host as vh

SR = 48000
CARD = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else "house-bass"
FIT = "--fit" in sys.argv
OUT = HERE / "proofs" / f"{datetime.date.today().isoformat()}-on-vital"; OUT.mkdir(parents=True, exist_ok=True)

st = lambda hz: 69 + 12 * math.log2(hz / 440.0)      # Hz -> Vital cutoff (MIDI semitones)
quart = lambda s: max(s, 0.0) ** 0.25                 # seconds -> Vital envelope raw
CUT_RANGE = 128.0                                     # Vital's cutoff knob runs 8..136 semitones; a mod amount of 1 sweeps all of it


def one_cycle(fn, n=2048):
    x = np.array([fn(i / n) for i in range(n)], dtype="<f4")
    return base64.b64encode(x.tobytes()).decode()


def wavetable(name, fn, template):
    wt = copy.deepcopy(template); wt["name"] = name
    wt["groups"][0]["components"][0]["keyframes"] = [{"position": 0, "wave_data": one_cycle(fn)}]
    return wt


def house_bass(base, voc, fdecay=None, fdepth_oct=None, release=None):
    """The card's mappings.vital rows, in Vital's own keys. fdecay (s), fdepth_oct and release (s, both envelopes) override for --fit."""
    s = copy.deepcopy(base["settings"]); tpl = s["wavetables"][0]
    T = lambda w: voc_time(voc, w)
    cutoff = 300.0                                                 # 'dark', vocabulary.yaml
    fd = fdecay if fdecay is not None else T("short")              # the pluck's decay
    depth = fdepth_oct if fdepth_oct is not None else 3.5          # 'generous', in octaves
    rel = release if release is not None else T("short")           # both envelopes' release
    s.update({
        "polyphony": 1.0, "legato": 0.0, "portamento_time": -10.0,                      # mode: mono, glide 0
        "osc_1_on": 1.0, "osc_1_level": 0.7071, "osc_1_destination": 0.0, "osc_1_wave_frame": 0.0,
        "osc_1_unison_voices": 1.0, "osc_1_random_phase": 0.0, "osc_1_stereo_spread": 0.0,
        "osc_2_on": 1.0, "osc_2_level": 0.3536, "osc_2_destination": 0.0, "osc_2_transpose": -12.0,  # sub: sine an octave down, half level, into Filter 1
        "osc_2_unison_voices": 1.0, "osc_2_random_phase": 0.0, "osc_2_stereo_spread": 0.0,
        "filter_1_on": 1.0, "filter_1_model": 0.0, "filter_1_style": 1.0, "filter_1_blend": 0.0,  # Analog, 24 dB, low pass
        "filter_1_cutoff": st(cutoff), "filter_1_resonance": 0.4, "filter_1_keytrack": 0.0,
        "env_1_attack": quart(T("fast")), "env_1_decay": quart(T("medium")), "env_1_sustain": 0.7, "env_1_release": quart(rel),
        "env_2_attack": quart(T("instant")), "env_2_decay": quart(fd), "env_2_sustain": 0.0, "env_2_release": quart(rel),
    })
    s["wavetables"][0] = wavetable("Square", lambda p: 1.0 if p < 0.5 else -1.0, tpl)
    s["wavetables"][1] = wavetable("Sine", lambda p: math.sin(2 * math.pi * p), tpl)
    mods = [{"source": "", "destination": ""} for _ in range(len(s["modulations"]))]
    mods[0] = {"source": "env_2", "destination": "filter_1_cutoff"}
    s["modulation_1_amount"] = depth * 12 / CUT_RANGE; s["modulation_1_bipolar"] = 0.0
    s["modulations"] = mods
    p = {k: v for k, v in base.items() if k != "settings"}
    p.update({"preset_name": "House Bass (Synth Templates)", "author": "Synth Templates",
              "comments": "The house bass card's Vital rows. Square into a 24 dB analog low pass at 300 Hz, moderate resonance; Env 2 plucks the cutoff (no sustain); sine sub an octave down at half level; mono. Compare it against the card's reference render.",
              "preset_style": "Bass", "settings": s})
    return p, {"cutoff_hz": cutoff, "fenv_decay_s": round(fd, 4), "fenv_depth_oct": depth, "resonance": 0.4,
               "aenv_s": [T("fast"), T("medium"), 0.7, round(rel, 4)]}


def voc_time(voc, word):
    """The vocabulary's number for a time word, in seconds (vocabulary.yaml's time table: the Moog curve, a stage's 95 % point)."""
    return float(voc["time"][word])


def schedule(card):
    """The site voice's reading of the house bass pattern (offbeat eighths, each a 16th long)."""
    r = card["render"]; beat = 60 / r["tempo"]; unit = beat / 2; t0 = 0.05; n = round(4 * beat / unit)
    return [(t0 + i * unit, t0 + i * unit + unit * 0.5) for i in range(n) if i % 2 == 1], r.get("velocity", 100)


def render(plugin, preset, notes, vel, note=36, dur=2.5):
    vh.load(plugin, preset)
    msgs = []
    for on, off in notes:
        msgs.append(mido.Message("note_on", note=note, velocity=vel, time=on))
        msgs.append(mido.Message("note_off", note=note, velocity=0, time=off))
    plugin.reset()
    # a fresh load leaks a short blip at time 0 that reset() does not clear; play 0.5 s of nothing first and drop it
    lead = 0.5; msgs = [m.copy(time=m.time + lead) for m in msgs]
    return plugin(msgs, duration=dur + lead, sample_rate=SR, num_channels=2)[:, int(lead * SR):]


def read(path):
    sr, x = wavfile.read(path); x = x.astype(np.float32) / (32768 if x.dtype == np.int16 else 1)
    return (x.T if x.ndim == 2 else np.vstack([x, x])), sr


def contour(mono, hop=0.005):
    """loudness (dB) and brightness (centroid, Hz) every 5 ms: the two lines the pluck is judged by."""
    f, t, Z = stft(mono, SR, nperseg=1024, noverlap=1024 - int(hop * SR)); P = np.abs(Z) ** 2
    lev = 10 * np.log10(P.sum(axis=0) + 1e-12); cen = (f[:, None] * P).sum(axis=0) / (P.sum(axis=0) + 1e-12)
    return t, lev - lev.max(), cen


def compare(ref, got):
    """centroid distance in octaves over the frames where both are within 30 dB of their peak; level-shape distance in dB."""
    t, lr, cr = contour(ref.mean(axis=0)); _, lg, cg = contour(got.mean(axis=0)); n = min(len(t), len(lg))
    live = (lr[:n] > -30) & (lg[:n] > -30)
    oct_err = float(np.sqrt(np.mean((np.log2(cr[:n][live] + 1) - np.log2(cg[:n][live] + 1)) ** 2))) if live.any() else 9.0
    a, b = np.maximum(lr[:n], -50), np.maximum(lg[:n], -50)              # silence is -50, so a tail that has ended is not "100 dB off"
    db_err = float(np.sqrt(np.mean((a - b)[(a > -50) | (b > -50)] ** 2)))
    return oct_err, db_err


def feats(x):
    m = x.mean(axis=0); rms = float(np.sqrt((m[np.abs(m) > 1e-4] ** 2).mean())); pk = float(np.abs(x).max())
    f, t, Z = stft(m, SR, nperseg=2048, noverlap=1536); P = np.abs(Z) ** 2
    return {"peak_dbfs": round(20 * math.log10(pk + 1e-9), 2), "rms_dbfs": round(20 * math.log10(rms + 1e-9), 2),
            "centroid_hz": round(float((f[:, None] * P).sum() / (P.sum() + 1e-12)), 1)}


def main():
    card = yaml.safe_load(open(HERE / "cards" / f"{CARD}.yaml")); voc = yaml.safe_load(open(HERE / "vocabulary.yaml"))
    assert CARD == "house-bass", "only the house bass has a Vital builder so far"
    ref, rsr = read(HERE / "renders" / f"{CARD}.wav"); assert rsr == SR
    plugin = pedalboard.load_plugin(vh.VST); base = vh.current(plugin)
    notes, vel = schedule(card)
    preset, chose = house_bass(base, voc)
    x = render(plugin, preset, notes, vel)
    first = {"chose": chose, "err": compare(ref, x)}
    fit = None; grid = []
    if FIT:
        # 1. the pluck: decay x depth against the brightness line. Kept only if it beats the mapped row by more than 10 %.
        best = (first["err"], chose)
        for fd in [0.04, 0.06, 0.08, 0.1, 0.13, 0.16, 0.2, 0.25]:
            for dep in [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]:
                _, c = house_bass(base, voc, fd, dep); e = compare(ref, render(plugin, house_bass(base, voc, fd, dep)[0], notes, vel))
                grid.append({"fenv_decay_s": fd, "fenv_depth_oct": dep, "brightness_oct": round(e[0], 3)})
                if e[0] < best[0][0] * 0.9: best = (e, c)
        fd, dep = best[1]["fenv_decay_s"], best[1]["fenv_depth_oct"]
        # 2. the release: against the loudness line, with the pluck held where step 1 left it
        rbest = None; rgrid = []
        for rel in [0.0986, 0.12, 0.15, 0.18, 0.22, 0.27, 0.33]:
            p, c = house_bass(base, voc, fd, dep, rel); y = render(plugin, p, notes, vel); e = compare(ref, y)
            rgrid.append({"release_s": rel, "loudness_db": round(e[1], 2)})
            if rbest is None or e[1] < rbest[0][1]: rbest = (e, c, p, y)
        fit = {"chose": rbest[1], "err": rbest[0], "pluck_grid": grid, "release_grid": rgrid}
        preset, x = rbest[2], rbest[3]
    pk = float(np.abs(x).max()); x = x / pk * 0.89 if pk > 0.89 else x   # -1 dBFS, a plain gain, as the reference set does
    json.dump(preset, open(OUT / f"{CARD}.vital", "w"), separators=(",", ":"))
    wavfile.write(OUT / f"{CARD}-vital.wav", SR, (x.T * 32767).astype(np.int16))
    side = {"card": CARD, "schedule": notes, "velocity": vel, "as_mapped": first, "fitted": fit,
            "features": {"reference": feats(ref), "vital": feats(x)},
            "err_units": "brightness: RMS octaves between the two centroid lines; loudness: RMS dB between the two level lines (each against its own peak)"}
    json.dump(side, open(OUT / f"{CARD}-compare.json", "w"), indent=1)
    # the picture: the two brightness lines and the two loudness lines, one over the other
    t, lr, cr = contour(ref.mean(axis=0)); t2, lg, cg = contour(x.mean(axis=0)); n = min(len(t), len(t2))
    fig, ax = plt.subplots(2, 1, figsize=(9, 5), dpi=110, sharex=True); fig.patch.set_facecolor("#f0eee5")
    for a in ax: a.set_facecolor("#f7f5ee")
    mr, mg = lr[:n] > -40, lg[:n] > -40
    ax[0].plot(t[:n][mr], cr[:n][mr], ".", ms=2.5, color="#1d1d1b", label="reference (the site's voice)")
    ax[0].plot(t[:n][mg], cg[:n][mg], ".", ms=2.5, color="#c8261a", label="Vital, this preset")
    ax[0].set_yscale("log"); ax[0].set_ylabel("brightness, Hz"); ax[0].legend(fontsize=8, loc="upper right", frameon=False)
    ax[1].plot(t[:n], lr[:n], color="#1d1d1b", lw=1); ax[1].plot(t[:n], lg[:n], color="#c8261a", lw=1)
    ax[1].set_ylim(-50, 3); ax[1].set_ylabel("loudness, dB"); ax[1].set_xlabel("s")
    for on, off in notes:
        for a in ax: a.axvspan(on, off, color="#d9d4c3", alpha=0.35, lw=0)
    e = (fit or first)["err"]
    ax[0].set_title(f"House Bass — reference vs Vital · brightness off by {e[0]:.2f} oct RMS · loudness shape off by {e[1]:.1f} dB RMS", fontsize=9, loc="left")
    fig.tight_layout(); fig.savefig(OUT / f"{CARD}-compare.png"); plt.close(fig)
    print(json.dumps(side, indent=1))


if __name__ == "__main__":
    main()
