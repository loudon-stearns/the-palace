"""
generate_preset.py — Track A for Ableton Wavetable: a recipe in feel-words -> a loadable .adv.

The pipeline the entry draws is  prompt -> archetype -> seeded parameter cloud ->
preset file. This script is everything after the prompt. The prompt itself is read
by the model (the steward, or any Claude) and written down as a small *recipe*:
which factory archetype to start from, which wavetables, and what each sound family
should feel like in the profile's own band words ("cutoff": "warm", "attack":
"soft", "lfo_rate": "drifting"), plus the few modulation routings that carry the
motion. The recipe is the seam between language and numbers — readable, editable,
and the thing Loudon can argue with.

What the script does with a recipe:
  1. starts from the factory init Wavetable (so nothing is inherited from a
     designed factory sound — the distinctness test means something);
  2. samples the archetype's continuous parameters, seeded, between the 25th and
     75th percentile of how Ableton's own designers set them in that category
     (wavetable_archetypes_v0.1.json) — this is what keeps unspecified knobs from
     wearing the blank default face;
  3. resolves each band word to a value inside that band, seeded, on a log scale
     for Hz and seconds. The band edges come from corpus_bands.splits(): the ear
     splits once apply_bands.py has run, the factory-usage splits until then. So
     the same recipe gets *better* the moment the ear-pass lands, with no edit;
  4. writes explicit settings and modulation routings, then the wavetable names
     and the preset name, and emits the .adv plus a sidecar .json saying exactly
     what it chose and why.

Modulation slots: Wavetable stores 13 source slots per target. Their identities
are a census guess until the Z00 decoder preset is read in Live (slot 1 = the
busy envelope, slots 2/3 = LFO 1/2). SLOT below is the one place to fix them.

Run from ableton-wavetable/ :
    python3 generate_preset.py recipes/light-through-deep-water.json
"""
import json
import math
import os
import random
import re
import sys

import corpus_bands as cb
from wavetable_writer import read_adv, write_adv, set_param, get_param

HERE = os.path.dirname(os.path.abspath(__file__))
INIT = os.path.join(HERE, "decompressed-samples", "Instruments__Wavetable.xml")
ARCH = os.path.join(HERE, "profile-draft", "wavetable_archetypes_v0.1.json")
PROFILE = os.path.join(HERE, "profile-draft", "wavetable_profile_v0.1.json")

# Census guess — confirm with the Z00 decoder reading, then fix here only.
# The two existing artifacts disagree on slots 0/1: the profile's corpus revision
# calls slot 1 Envelope 2, the census file (which the analyzer reads) calls it
# Envelope 3. Both agree slot 1 is the busy envelope and slots 2/3 are the LFOs.
# So "env" means slot 1, and a recipe that routes it sets Env 2 AND Env 3 to the
# same shape — the sound holds whichever one the decoder says it is.
SLOT = {"env": 1, "env_other": 0, "lfo1": 2, "lfo2": 3}

# which parameters each band family writes, and whether it lives on a log scale
FAMILY_PARAMS = {
    "cutoff": (["Voice_Filter1_Frequency"], True),
    "resonance": (["Voice_Filter1_Resonance"], False),
    "attack": (["Voice_Modulators_AmpEnvelope_Times_Attack"], True),
    "release": (["Voice_Modulators_AmpEnvelope_Times_Release"], True),
    "lfo_rate": (["Voice_Modulators_Lfo1_Time_Rate", "Voice_Modulators_Lfo2_Time_Rate"], True),
}
LOG_FLOOR = {"attack": 0.0005}  # attack can be 0; a log scale needs a floor

# archetype-cloud parameters that are continuous and safe to sample. Enum-like
# ones (filter type, circuit, LFO shape, sync, synced rate) are set on purpose
# by the recipe or left at init — sampling an index between quartiles is noise.
SAMPLE_OK = re.compile(
    r"_(Gain|Pan|Detune|WavePosition|Drive|Sustain|Times_Decay|Values_Peak|"
    r"Values_Sustain|Shape_Amount|Tone)$|^Voice_Unison_Amount$")


# ---------- XML helpers beyond wavetable_writer ----------

def set_enum(xml, name, value):
    """Single-line enum params: <Voice_Unison_Mode Value="3" />."""
    new, n = re.subn(r'(<' + re.escape(name) + r' Value=")([^"]*)(" />)',
                     r'\g<1>' + str(value) + r'\g<3>', xml, count=1)
    if n != 1:
        raise KeyError(name + " is not a single-line enum here")
    return new


def set_any(xml, name, value):
    try:
        return set_param(xml, name, value)
    except KeyError:
        return set_enum(xml, name, value)


def set_mod(xml, target_id, slot, amount):
    blk = re.compile(r'(<ModulationConnectionsForInstrumentVector Id="\d+" TargetId="'
                     + re.escape(target_id) + r'">.*?</ModulationConnectionsForInstrumentVector>)', re.S)
    m = blk.search(xml)
    if not m:
        raise KeyError("no modulation row for " + target_id)
    block, n = re.subn(r'(<ModulationAmounts\.' + str(slot) + r' Value=")([^"]*)(")',
                       r'\g<1>' + repr(float(amount)) + r'\g<3>', m.group(1), count=1)
    if n != 1:
        raise KeyError("slot %s missing on %s" % (slot, target_id))
    return xml[:m.start(1)] + block + xml[m.end(1):]


def get_mods(xml):
    """{target: {slot: amount}} for every non-zero routing."""
    out = {}
    for m in re.finditer(r'TargetId="([^"]+)">(.*?)</ModulationConnectionsForInstrumentVector>', xml, re.S):
        for s, v in re.findall(r'<ModulationAmounts\.(\d+) Value="([^"]*)"', m.group(2)):
            if float(v) != 0:
                out.setdefault(m.group(1), {})[int(s)] = float(v)
    return out


def set_text(xml, tag, value):
    new, n = re.subn(r'(<' + tag + r' Value=")([^"]*)(")',
                     lambda m: m.group(1) + value.replace('"', "'") + m.group(3), xml, count=1)
    if n != 1:
        raise KeyError(tag)
    return new


# ---------- band words -> values ----------

_ranges = None


def prange(param):
    global _ranges
    if _ranges is None:
        _ranges = json.load(open(PROFILE))["parameter_vocabulary"]
    p = _ranges[param]
    return p["range_min"], p["range_max"]


def band_edges(family, band):
    names = cb.VOCAB[family]
    if band not in names:
        raise KeyError("%r is not a %s band; use one of %s" % (band, family, names))
    i = names.index(band)
    lo, hi = prange(FAMILY_PARAMS[family][0][0])
    edges = [lo] + list(cb.splits(family)) + [hi]
    return edges[i], edges[i + 1]


def value_in_band(family, band, rng, t=None):
    """A seeded value inside the band, kept off its edges (t in 0.3..0.7)."""
    a, b = band_edges(family, band)
    t = rng.uniform(0.3, 0.7) if t is None else t
    if FAMILY_PARAMS[family][1]:
        a = max(a, LOG_FLOOR.get(family, 1e-6))
        return math.exp(math.log(a) + t * (math.log(b) - math.log(a)))
    return a + t * (b - a)


def shift_band(family, value, steps):
    """The band `steps` away from the one `value` sits in (clamped), and a value at its centre."""
    names = cb.VOCAB[family]
    cur, _ = cb.band_for(family, value)
    j = min(max(names.index(cur) + steps, 0), len(names) - 1)
    return cur, names[j], value_in_band(family, names[j], None, t=0.5)


# ---------- generation ----------

def generate(recipe, out_dir):
    rng = random.Random(recipe["seed"])
    xml = read_adv(INIT)
    chosen = {"sampled_from_archetype": {}, "from_bands": {}, "explicit": {}, "mods": []}

    # the init patch's three controller routings onto Osc 1 would move the wave
    # per note if a slot is a random source; clear them so the recipe owns motion
    for tgt, slot in (("Voice_Oscillator1_Wavetables_WavePosition", 9),
                      ("Voice_Oscillator1_Wavetables_WavePosition", 12),
                      ("Voice_Oscillator1_Effects_Effect1", 8)):
        xml = set_mod(xml, tgt, slot, 0)

    cloud = json.load(open(ARCH))["archetypes"][recipe["archetype"]]["cloud"]
    for p, q in sorted(cloud.items()):
        if not SAMPLE_OK.search(p) or q["p25"] == q["p75"]:
            continue
        v = round(rng.uniform(q["p25"], q["p75"]), 6)
        try:
            xml = set_param(xml, p, v)
            chosen["sampled_from_archetype"][p] = v
        except KeyError:
            pass

    for fam, band in recipe.get("bands", {}).items():
        v = round(value_in_band(fam, band, rng), 6)
        for p in FAMILY_PARAMS[fam][0]:
            xml = set_param(xml, p, v)
        chosen["from_bands"][fam] = {"band": band, "value": v,
                                     "split_source": cb.source(fam),
                                     "params": FAMILY_PARAMS[fam][0]}

    for p, v in recipe.get("set", {}).items():
        xml = set_any(xml, p, v)
        chosen["explicit"][p] = v

    for m in recipe.get("mods", []):
        xml = set_mod(xml, m["target"], SLOT[m["source"]], m["amount"])
        chosen["mods"].append(m)

    for osc, sprite in recipe.get("wavetables", {}).items():
        xml = set_text(xml, "SpriteName" + osc, sprite)
    xml = set_text(xml, "UserName", recipe["name"])
    xml = set_text(xml, "Annotation", recipe.get("prompt", "") + " | " + recipe.get("why", ""))

    os.makedirs(out_dir, exist_ok=True)
    adv = os.path.join(out_dir, recipe["name"] + ".adv")
    n = write_adv(xml, adv)
    side = dict(recipe, chosen=chosen, bytes=n, slot_map_assumed=SLOT)
    json.dump(side, open(os.path.join(out_dir, recipe["name"] + ".json"), "w"), indent=1)
    # round-trip guard: the file we wrote must read back with the values we meant
    back = read_adv(adv)
    for fam, c in chosen["from_bands"].items():
        got = get_param(back, c["params"][0])
        assert abs(got - c["value"]) < 1e-6, (fam, got, c["value"])
    return adv


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "recipes", "light-through-deep-water.json")
    book = json.load(open(path))
    out_dir = os.path.join(HERE, "generated", book["slug"])
    for r in book["recipes"]:
        r.setdefault("prompt", book["prompt"])
        print("wrote", os.path.relpath(generate(r, out_dir), HERE))


if __name__ == "__main__":
    main()
