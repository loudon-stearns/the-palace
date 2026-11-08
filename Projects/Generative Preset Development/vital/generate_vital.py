"""
generate_vital.py — Track A for Vital: a recipe in feel-words -> a loadable .vital,
rendered and measured before anyone listens.

Same seam as the Wavetable generator (../ableton-wavetable/generate_preset.py):
the prompt is read by a model and written down as a small *recipe* — feel-words
per family ("cutoff": "dark", "attack": "swell"), a few explicit settings, and the
modulation routings that carry the motion. This script does the rest:

  1. starts from Vital's own init state (vital_host.load lays the preset over it),
     so nothing is inherited from a designed sound and "distinct from init" means
     something;
  2. resolves each feel-word to a value inside its band, seeded, on a log scale
     for Hz and seconds, then converts to Vital's own units (cutoff in MIDI
     semitones, envelope times as raw = seconds^(1/4), LFO rate as log2 Hz);
  3. writes the settings and the modulation matrix (source/destination pairs,
     depth in modulation_N_amount);
  4. emits the .vital and a sidecar saying what it chose and why;
  5. with --render, loads it into the hosted Vital, plays a chord, and measures it
     with vital_render.features — so "audibly distinct" is asked of numbers first.

The BANDS below are provisional: placed from where the 520-preset corpus puts each
knob (profile-draft/vital_corpus_stats_v0.1.json) and from the measured cutoff
ladder (vital_measured_v0.1.json). They are not ear-set. An ear pass replaces them.

    ~/.venvs/palace-vital/bin/python generate_vital.py recipes/light-through-deep-water.json --render
"""
import argparse, copy, json, math, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

# family -> word -> (lo, hi) in human units; unit says how to convert to Vital's
BANDS = {
    "cutoff":    {"unit": "hz", "dark": (80, 250), "warm": (250, 800), "open": (800, 2500), "bright": (2500, 9000)},
    "resonance": {"unit": "lin", "flat": (0.0, 0.15), "coloured": (0.3, 0.5), "singing": (0.6, 0.8)},
    "attack":    {"unit": "s", "punchy": (0.0005, 0.01), "soft": (0.05, 0.3), "swell": (0.9, 2.5)},
    "release":   {"unit": "s", "short": (0.05, 0.3), "long": (0.8, 2.0), "tail": (2.0, 4.5)},
    "lfo_rate":  {"unit": "hz", "drifting": (0.05, 0.2), "subtle": (0.2, 0.8), "obvious": (1.0, 4.0)},
    "space":     {"unit": "lin", "dry": (0.0, 0.08), "room": (0.15, 0.3), "deep": (0.4, 0.6)},
}
LOG_UNITS = {"hz", "s"}

# which Vital settings each family writes, and how to convert
def _st(hz): return 69 + 12 * math.log2(hz / 440.0)          # Hz -> MIDI semitones
def _quart(s): return s ** 0.25                               # seconds -> envelope raw
def _log2(hz): return math.log2(hz)                           # Hz -> LFO frequency (free-running)
FAMILY = {
    "cutoff":    [("filter_1_cutoff", _st)],
    "resonance": [("filter_1_resonance", float)],
    "attack":    [("env_1_attack", _quart)],
    "release":   [("env_1_release", _quart)],
    "lfo_rate":  [("lfo_1_frequency", _log2)],
    "space":     [("reverb_dry_wet", float)],
}


def resolve(family, word, rng):
    band = BANDS[family]
    lo, hi = band[word]
    u = rng.uniform(0.2, 0.8)  # stay off the band edges
    if band["unit"] in LOG_UNITS:
        v = math.exp(math.log(lo) + u * (math.log(hi) - math.log(lo)))
    else:
        v = lo + u * (hi - lo)
    return v


def borrowed_wavetable(ref):
    """ref = {"from": "<path under ~/Music/Vital>", "index": 0}: copy one wavetable."""
    path = os.path.join(os.path.expanduser("~/Music/Vital"), ref["from"])
    return json.load(open(path))["settings"]["wavetables"][ref.get("index", 0)]


def build(recipe, base):
    rng = random.Random(recipe["seed"])
    s = copy.deepcopy(base["settings"])
    chosen = {}
    for fam, word in recipe.get("bands", {}).items():
        human = resolve(fam, word, rng)
        for key, conv in FAMILY[fam]:
            s[key] = conv(human)
        chosen[fam] = {"word": word, "value": round(human, 4), "unit": BANDS[fam]["unit"]}
    for k, v in recipe.get("set", {}).items():
        s[k] = v
    for slot, ref in recipe.get("wavetables", {}).items():
        s["wavetables"][int(slot) - 1] = borrowed_wavetable(ref)
    mods = [{"source": "", "destination": ""} for _ in range(len(s["modulations"]))]
    for i, m in enumerate(recipe.get("mods", [])):
        mods[i] = {"source": m["source"], "destination": m["destination"]}
        s["modulation_%d_amount" % (i + 1)] = m["amount"]
        s["modulation_%d_bipolar" % (i + 1)] = 1.0 if m.get("bipolar") else 0.0
    s["modulations"] = mods
    preset = {k: v for k, v in base.items() if k != "settings"}
    preset.update({"preset_name": recipe["name"], "author": "Generative Preset Development",
                   "comments": recipe["why"], "preset_style": "Pad", "settings": s})
    return preset, chosen


def distance(a, b):
    """Feature distance in units a listener would roughly feel: brightness in octaves,
    level in 6 dB steps, motion x10, rise and tail in doublings, width as is."""
    lg = lambda x: math.log2(max(x, 1e-3))
    return math.sqrt(
        (lg(a["centroid_hz"]) - lg(b["centroid_hz"])) ** 2 + ((a["level_db"] - b["level_db"]) / 6) ** 2
        + (10 * (a["motion"] - b["motion"])) ** 2 + (lg(a["rise_s"] + .01) - lg(b["rise_s"] + .01)) ** 2
        + (lg(a["tail_s"] + .05) - lg(b["tail_s"] + .05)) ** 2 + (a["width"] - b["width"]) ** 2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("recipe"); ap.add_argument("--render", action="store_true")
    ap.add_argument("--note", type=int, default=48); ap.add_argument("--hold", type=float, default=5.0)
    a = ap.parse_args()
    book = json.load(open(a.recipe))
    out = os.path.join(HERE, "generated", book["slug"]); os.makedirs(out, exist_ok=True)
    import pedalboard, vital_host as vh, vital_render as vr
    p = pedalboard.load_plugin(vh.VST)
    base = vh.current(p)
    feats = {}
    if a.render:
        feats["init"] = vr.render_file(p, {"settings": {}}, os.path.join(out, "00 init.wav"), a.note, a.hold, tail=4.0, chord=True)
    for r in book["recipes"]:
        preset, chosen = build(r, base)
        fn = os.path.join(out, r["name"] + ".vital")
        json.dump(preset, open(fn, "w"), separators=(",", ":"))
        side = {"prompt": book["prompt"], "name": r["name"], "seed": r["seed"], "why": r["why"], "bands": chosen,
                "set": r.get("set", {}), "mods": r.get("mods", []), "wavetables": r.get("wavetables", {})}
        if a.render:
            feats[r["name"]] = vr.render_file(p, preset, os.path.join(out, r["name"] + ".wav"), a.note, a.hold, tail=4.0, chord=True)
            side["features"] = feats[r["name"]]
        json.dump(side, open(fn[:-6] + ".recipe.json", "w"), indent=1)
        print(r["name"], chosen, feats.get(r["name"]))
    if a.render:
        names = list(feats)
        mat = {x: {y: round(distance(feats[x], feats[y]), 2) for y in names} for x in names}
        json.dump({"features": feats, "distance": mat}, open(os.path.join(out, "prompt-test.json"), "w"), indent=1)
        for x in names: print("%-22s" % x, " ".join("%5.2f" % mat[x][y] for y in names))


if __name__ == "__main__":
    main()
