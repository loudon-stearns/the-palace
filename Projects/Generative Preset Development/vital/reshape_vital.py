"""
reshape_vital.py — Track C for Vital: an existing preset + a direction -> a modified .vital,
and a render that checks the direction actually happened.

The Wavetable reshaper (../ableton-wavetable/reshape_preset.py) can only write its
change; whether "darker" came out darker waits for Loudon in Live. Vital can be
rendered here, so every move carries a *promise* — the measurable change a listener
would expect — and the script renders before and after and says whether the promise
was kept. A move that breaks its promise on some preset is the profile telling us
where it is wrong (a filter that isn't a low-pass, an oscillator that skips the filter).

Moves (keyword match stands in for a model reading free-form directions):
  darker    every low-pass filter that something actually passes through goes down one
            cutoff band; if none does, a high shelf cut on the EQ.     promise: brightness falls >= 1/3 octave
  brighter  the mirror.                                                 promise: brightness rises >= 1/3 octave
  menacing  resonance up a band, filter drive, distortion, a sub octave under osc 1.
                                                                        promise: more of the energy sits below 150 Hz, and peaks are shaved (crest falls)
  breathe   attack up a band; a free LFO in the 'drifting' band swells the oscillator levels and the filter.
                                                                        promise: brightness or level moves more while held, and the first 150 ms are 3 dB softer
  strip     one oscillator, one unison voice, no chorus.               promise: width falls by at least a third

    ~/.venvs/palace-vital/bin/python reshape_vital.py <preset.vital> "darker and more menacing" [--out reshaped/]
"""
import argparse, copy, json, math, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from generate_vital import BANDS, _st

DEST_F1, DEST_F2, DEST_BOTH = 0.0, 1.0, 2.0  # osc_N_destination; 3+ skips the filters


def hz(st): return 440.0 * 2 ** ((st - 69) / 12)


def _sc(family):
    """Log scale for Hz and seconds, linear for the 0-1 knobs."""
    if BANDS[family]["unit"] in ("hz", "s"): return (lambda v: math.log(max(v, 1e-6))), math.exp
    return (lambda v: v), (lambda v: v)


def band_of(family, v):
    """Which band word a human-unit value sits in, or the nearest one."""
    fw, _ = _sc(family)
    words = [w for w in BANDS[family] if w != "unit"]
    for w in words:
        lo, hi = BANDS[family][w]
        if lo <= v <= hi: return w
    return min(words, key=lambda w: min(abs(fw(v) - fw(BANDS[family][w][0])), abs(fw(v) - fw(BANDS[family][w][1]))))


def step_band(family, v, steps):
    """Move v by `steps` bands, landing at the same relative place inside the new band."""
    fw, bk = _sc(family)
    words = [w for w in BANDS[family] if w != "unit"]
    cur = band_of(family, v)
    i = min(max(words.index(cur) + steps, 0), len(words) - 1)
    if words[i] == cur: return cur, cur, v
    lo, hi = BANDS[family][cur]; nlo, nhi = BANDS[family][words[i]]
    u = min(max((fw(min(max(v, lo), hi)) - fw(lo)) / (fw(hi) - fw(lo)), 0.2), 0.8)
    return cur, words[i], bk(fw(nlo) + u * (fw(nhi) - fw(nlo)))


def heard_filters(s):
    """Filters (1, 2) that an oscillator, the sampler, or the other filter actually feeds."""
    fed = set()
    srcs = [("osc_%d" % n) for n in (1, 2, 3) if s.get("osc_%d_on" % n)] + (["sample"] if s.get("sample_on") else [])
    for src in srcs:
        d = s.get(src + "_destination", 0.0)
        if d == DEST_F1: fed.add(1)
        elif d == DEST_F2: fed.add(2)
        elif d == DEST_BOTH: fed |= {1, 2}
    return [n for n in sorted(fed) if s.get("filter_%d_on" % n)]


def is_lowpass(s, n):
    # analog/dirty/ladder/digital models: blend 0 = low-pass, 1 = band, 2 = high. Others (comb,
    # formant, phaser) have no plain low-pass, so cutoff moves on them aren't 'darker'.
    return s.get("filter_%d_model" % n, 0) in (0, 1, 2, 3) and s.get("filter_%d_blend" % n, 0) < 0.5


def free_slot(s):
    for i, m in enumerate(s["modulations"]):
        if not m.get("source"): return i
    raise RuntimeError("no free modulation slot")


def route(s, log, src, dst, amt, bipolar=False):
    i = free_slot(s)
    s["modulations"][i] = {"source": src, "destination": dst}
    s["modulation_%d_amount" % (i + 1)] = amt
    s["modulation_%d_bipolar" % (i + 1)] = 1.0 if bipolar else 0.0
    log.append({"param": "modulation %d" % (i + 1), "move": "route", "before": "empty",
                "after": "%s -> %s at %+.2f" % (src, dst, amt)})


def setv(s, log, k, v, why):
    log.append({"param": k, "move": why, "before": "%.4g" % s.get(k, float("nan")), "after": "%.4g" % v})
    s[k] = v


# ---------- the moves ----------

def _cutoff(s, log, steps, heard):
    lp = [n for n in heard_filters(s) if is_lowpass(s, n)]
    for n in lp:
        k = "filter_%d_cutoff" % n
        cur, new, nv = step_band("cutoff", hz(s[k]), steps)
        if new == cur:
            # the knob is at the end of the scale, so what you hear is set by what modulates it
            # (Stringpad 1: cutoff knob at 13 Hz, opened by an LFO and a macro). Turn those down.
            ups = [i for i, m in enumerate(s["modulations"]) if m.get("destination") == k
                   and s.get("modulation_%d_amount" % (i + 1), 0) * steps < 0]
            for i in ups:
                a = s["modulation_%d_amount" % (i + 1)]
                setv(s, log, "modulation_%d_amount" % (i + 1), a * 0.4,
                     "cutoff knob already %s; %s's push on it cut to 40%%" % (cur, s["modulations"][i]["source"]))
            if not ups:
                log.append({"param": k, "move": "cutoff %+d band" % steps, "before": "%s (%.0f Hz)" % (cur, hz(s[k])),
                            "after": "unchanged (already %s)" % cur})
            continue
        log.append({"param": k, "move": "cutoff %+d band" % steps, "before": "%s (%.0f Hz)" % (cur, hz(s[k])),
                    "after": "%s (%.0f Hz)" % (new, nv)})
        s[k] = _st(nv)
    moved = [c for c in log if (c["move"].startswith("cutoff") or "push on it" in c["move"])
             and not c["after"].startswith("unchanged")]
    if not moved:  # nothing low-pass to move: tilt the whole sound with the EQ's high shelf, placed
        # at the sound's own measured brightness, so it bites on an already-dark pad too
        at = min(max(heard["centroid_hz"], 300), 4000)
        s["eq_on"] = 1.0; s["eq_high_mode"] = 0.0; s["eq_high_cutoff"] = _st(at)
        setv(s, log, "eq_high_gain", -15.0 if steps < 0 else 9.0,
             "no low-pass the sound passes through; high shelf at its brightness, %.0f Hz, instead" % at)


def darker(s, log, heard): _cutoff(s, log, -1, heard)
def brighter(s, log, heard): _cutoff(s, log, +1, heard)


def menacing(s, log, heard):
    for n in heard_filters(s) or [1]:
        k = "filter_%d_resonance" % n
        cur, new, nv = step_band("resonance", s.get(k, 0.5), +1)
        log.append({"param": k, "move": "resonance +1 band", "before": "%s (%.2f)" % (cur, s.get(k, 0.5)),
                    "after": "%s (%.2f)" % (new, nv)}); s[k] = nv
        setv(s, log, "filter_%d_drive" % n, min(s.get("filter_%d_drive" % n, 0) + 8.0, 20.0), "filter drive +8 dB")
    setv(s, log, "distortion_on", 1.0, "distortion on")
    setv(s, log, "distortion_drive", max(s.get("distortion_drive", 0), 8.0), "distortion drive to 8 dB")
    # 'on' is not 'heard': Pad Of Exile ships distortion on with its mix at 0, fully dry
    if s.get("distortion_mix", 1.0) < 0.6: setv(s, log, "distortion_mix", 0.6, "distortion mix up, it was dry")
    # weight underneath: a free oscillator an octave below osc 1, through the same filter
    spare = next((n for n in (2, 3) if not s.get("osc_%d_on" % n)), None)
    if spare:
        for k, v, why in (("osc_%d_on" % spare, 1.0, "sub on"),
                          ("osc_%d_transpose" % spare, s.get("osc_1_transpose", 0) - 12, "an octave under osc 1"),
                          ("osc_%d_level" % spare, 0.5, "sub level"),
                          ("osc_%d_unison_voices" % spare, 1.0, "sub kept mono"),
                          ("osc_%d_destination" % spare, s.get("osc_1_destination", 0), "sub follows osc 1's path")):
            setv(s, log, k, v, why)
    else:
        log.append({"param": "osc", "move": "sub", "before": "all three oscillators in use", "after": "no sub added"})


def breathe(s, log, heard):
    k = "env_1_attack"
    cur, new, nv = step_band("attack", s[k] ** 4, +1)
    log.append({"param": k, "move": "attack +1 band", "before": "%s (%.3g s)" % (cur, s[k] ** 4),
                "after": "%s (%.3g s)" % (new, nv)}); s[k] = nv ** 0.25
    used = {m["source"] for m in s["modulations"]}
    lfo = next((n for n in (4, 3, 2, 1) if "lfo_%d" % n not in used), None)
    if lfo is None:
        log.append({"param": "lfo", "move": "breath", "before": "all four LFOs in use", "after": "no swell added"}); return
    setv(s, log, "lfo_%d_sync" % lfo, 0.0, "LFO %d free-running (seconds, not tempo)" % lfo)
    setv(s, log, "lfo_%d_frequency" % lfo, math.log2(0.12), "LFO %d to 'drifting', 0.12 Hz" % lfo)
    for n in (1, 2, 3):
        if s.get("osc_%d_on" % n): route(s, log, "lfo_%d" % lfo, "osc_%d_level" % n, -0.25)
    for n in heard_filters(s): route(s, log, "lfo_%d" % lfo, "filter_%d_cutoff" % n, 0.12, bipolar=True)


def strip(s, log, heard):
    for n in (2, 3):
        if s.get("osc_%d_on" % n): setv(s, log, "osc_%d_on" % n, 0.0, "strip")
    if s.get("sample_on"): setv(s, log, "sample_on", 0.0, "strip")
    setv(s, log, "osc_1_unison_voices", 1.0, "strip to one voice")
    if s.get("chorus_on"): setv(s, log, "chorus_on", 0.0, "strip")


MOVES = [(r"\bstrip|core|bare", strip), (r"\bdark", darker), (r"\bbright|open up", brighter),
         (r"menac|threat|sinister|aggress", menacing), (r"breath|swell|alive", breathe)]


# ---------- the promises ----------

def extra(x, hold, sr):
    """Two features vital_render doesn't carry: share of energy under 150 Hz, and crest (peak over
    RMS of the sustain, dB) — saturation shaves peaks, so a driven sound's crest falls. Spectral
    flatness was tried first as 'roughness' and was the wrong ruler: a darker filter removes the
    hiss, so flatness fell on a sound that had plainly been driven harder."""
    m = x.mean(axis=0)[int(0.5 * sr):int(hold * sr)]
    sp = np.abs(np.fft.rfft(m * np.hanning(len(m)))) ** 2 + 1e-18
    f = np.fft.rfftfreq(len(m), 1 / sr)
    band = (f > 30) & (f < 12000)
    flat = float(np.exp(np.mean(np.log(sp[band]))) / np.mean(sp[band]))
    crest = 20 * np.log10(np.abs(m).max() / (np.sqrt((m ** 2).mean()) + 1e-12) + 1e-12)
    return {"low_share": round(float(sp[f < 150].sum() / sp.sum()), 3), "flatness": round(flat, 4),
            "crest_db": round(float(crest), 2)}


def oct_(a, b): return math.log2(max(b, 1) / max(a, 1))

PROMISES = {
    "darker":   ("brightness falls at least 1/3 octave", lambda a, b: oct_(a["centroid_hz"], b["centroid_hz"]) <= -1 / 3),
    "brighter": ("brightness rises at least 1/3 octave", lambda a, b: oct_(a["centroid_hz"], b["centroid_hz"]) >= 1 / 3),
    "menacing": ("more energy under 150 Hz, and driven (crest falls 1 dB)",
                 lambda a, b: b["low_share"] > a["low_share"] * 1.15 and b["crest_db"] <= a["crest_db"] - 1.0),
    "breathe":  ("moves more while held, and enters softer (first 150 ms down 3 dB)",
                 lambda a, b: (b["motion"] > a["motion"] + 0.03 or b["level_swing_db"] > a["level_swing_db"] + 1.5)
                 and b["onset_db"] <= a["onset_db"] - 3.0),
    "strip":    ("width falls by at least a third", lambda a, b: b["width"] <= a["width"] * 2 / 3 or b["width"] < 0.02),
}


def level_swing(x, hold, sr):
    """How far the held loudness swings, dB between the 10th and 90th percentile of 100 ms frames."""
    m = x.mean(axis=0)[int(1.0 * sr):int(hold * sr)]
    fr = int(0.1 * sr)
    r = [20 * np.log10(np.sqrt((m[i:i + fr] ** 2).mean()) + 1e-9) for i in range(0, len(m) - fr, fr // 2)]
    return round(float(np.percentile(r, 90) - np.percentile(r, 10)), 2) if r else 0.0


def measure(p, preset, wav, note, hold):
    import vital_host as vh, vital_render as vr
    from scipy.io import wavfile
    f = vr.render_file(p, preset, wav, note, hold, tail=3.0, chord=True)
    sr, x = wavfile.read(wav); x = x.T
    f.update(extra(x, hold, sr)); f["level_swing_db"] = level_swing(x, hold, sr)
    # onset: the first 150 ms against the held level. rise_s was tried first and was the wrong
    # ruler for pads: reverb and unison build for seconds, so its 90 % point lands late either way.
    m = x.mean(axis=0); rms = lambda y: np.sqrt((y ** 2).mean()) + 1e-12
    f["onset_db"] = round(float(20 * np.log10(rms(m[:int(0.15 * sr)]) / rms(m[int(1.5 * sr):int(hold * sr)]))), 2)
    return f


def reshape(p, path, direction, out_dir, note=48, hold=6.0):
    src = json.load(open(path))
    name = os.path.splitext(os.path.basename(path))[0]
    import vital_host as vh
    vh.load(p, src)                      # lay it over init, so missing 1.0-era keys are filled
    s = copy.deepcopy(vh.current(p)["settings"])
    log, used = [], []
    before = measure(p, src, os.path.join(out_dir, name + " - before.wav"), note, hold)
    for pat, fn in MOVES:
        if re.search(pat, direction, re.I):
            fn(s, log, before); used.append(fn.__name__)
    if not used:
        raise SystemExit("no move matched %r; known: %s" % (direction, [f.__name__ for _, f in MOVES]))
    new_name = "%s - %s" % (name, " + ".join(used))
    out = dict(src); out["settings"] = s; out["preset_name"] = new_name
    os.makedirs(out_dir, exist_ok=True)
    fn = os.path.join(out_dir, new_name + ".vital")
    json.dump(out, open(fn, "w"), separators=(",", ":"))
    after = measure(p, out, fn[:-6] + ".wav", note, hold)
    kept = {m: {"promise": PROMISES[m][0], "kept": bool(PROMISES[m][1](before, after))} for m in used}
    side = {"source": path, "direction": direction, "moves": used, "changes": log,
            "before": before, "after": after, "promises": kept}
    json.dump(side, open(fn[:-6] + ".reshape.json", "w"), indent=1)
    return fn, side


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("preset"); ap.add_argument("direction")
    ap.add_argument("--out", default=os.path.join(HERE, "reshaped"))
    a = ap.parse_args()
    import pedalboard, vital_host as vh
    p = pedalboard.load_plugin(vh.VST)
    fn, side = reshape(p, a.preset, a.direction, a.out)
    print("wrote", fn)
    for c in side["changes"]: print("  %-24s %-44s %s -> %s" % (c["param"], c["move"], c["before"], c["after"]))
    for m, k in side["promises"].items(): print("  %-9s %-44s %s" % (m, k["promise"], "KEPT" if k["kept"] else "BROKEN"))
    print("  before", side["before"]); print("  after ", side["after"])


if __name__ == "__main__":
    main()
