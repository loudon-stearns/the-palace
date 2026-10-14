"""
apply_bands.py — turn the ear-pass answers into the profile's feel-words.

After the sitting with the audition kit (build_audition_kit.py), Loudon's notes
are a handful of rung codes: "dark starts at A04, warm at A06 ...". This script
reads them and does every mechanical step after the sitting:

  1. converts each marked rung into a split value — the midpoint between the
     rung where the character changed and the rung just before it (geometric
     midpoint for Hz and seconds, since the ear hears ratios there);
  2. writes profile-draft/ear_bands_v0.1.json, which corpus_bands.py prefers
     over the factory-usage splits for any family it covers;
  3. writes profile-draft/wavetable_profile_v0.2.json — v0.1 with
     perceptual_regions filled for every parameter the ladders measured, and the
     modulation-slot identities from the Z00 decoder reading;
  4. re-runs the analyzer over the 14 sample presets and reports how many
     descriptions now speak in ear-confirmed words.

Answers file (audition-kit/ear_answers.json, written by hand or pasted from the
ear sheet):
  {
    "A": {"dark": "A04", "warm": "A06", "open": "A08", "bright": "A10"},
    ...
    "G_display": {"G01": "1/32", "G02": "1/16", ...},     # optional
    "Z": {"Env 2": 1, "Env 3": 2, "LFO 1": 3, ...},       # source -> % seen
    "notes": "free text"
  }
A band you leave out (or null) keeps its factory-usage split.

Run from ableton-wavetable/ :  python3 apply_bands.py [answers.json]
"""
import copy
import datetime
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, "audition-kit")
PD = os.path.join(HERE, "profile-draft")

# low -> high band names per family. The first band has no start rung; each later
# band's start rung is what the ear marks.
VOCAB = {
    "cutoff": ["closed", "dark", "warm", "open", "bright"],
    "resonance": ["flat", "coloured", "singing", "screaming", "self-osc-edge"],
    "attack": ["clicky", "punchy", "natural", "soft", "swell"],
    "attack_slope": ["concave", "linear", "convex"],
    "release": ["gated", "short", "natural", "long", "tail"],
    "lfo_rate": ["imperceptible", "drifting", "subtle", "obvious", "fast"],
    "lfo_synced_rate": ["fast", "groove", "slow"],
    "lfo_attack": ["instant", "fade-in", "slow-bloom"],
}

# which profile parameters each family's bands are written onto. Env2/Env3 and
# Filter2 / LFO2 inherit the measured instance's bands: same knob, same scale —
# an assumption, flagged in the profile as such.
PARAMS = {
    "cutoff": ["Voice_Filter1_Frequency", "Voice_Filter2_Frequency"],
    "resonance": ["Voice_Filter1_Resonance", "Voice_Filter2_Resonance"],
    "attack": ["Voice_Modulators_AmpEnvelope_Times_Attack",
               "Voice_Modulators_Envelope2_Times_Attack",
               "Voice_Modulators_Envelope3_Times_Attack"],
    "attack_slope": ["Voice_Modulators_AmpEnvelope_Slopes_Attack",
                     "Voice_Modulators_Envelope2_Slopes_Attack",
                     "Voice_Modulators_Envelope3_Slopes_Attack"],
    "release": ["Voice_Modulators_AmpEnvelope_Times_Release"],
    "lfo_rate": ["Voice_Modulators_Lfo1_Time_Rate", "Voice_Modulators_Lfo2_Time_Rate"],
    "lfo_synced_rate": ["Voice_Modulators_Lfo1_Time_SyncedRate", "Voice_Modulators_Lfo2_Time_SyncedRate"],
    "lfo_attack": ["Voice_Modulators_Lfo1_Time_AttackTime", "Voice_Modulators_Lfo2_Time_AttackTime"],
}


def midpoint(a, b, unit):
    if unit in ("Hz", "s") and a > 0 and b > 0:
        return math.sqrt(a * b)
    return (a + b) / 2.0


def splits_for(ladder, answer):
    """Return (splits, sources) — one split per band boundary, None if unanswered."""
    fam = ladder["family"]
    rungs = ladder["rungs"]
    idx = {r["code"]: i for i, r in enumerate(rungs)}
    corpus = ladder["corpus_splits"]
    names = VOCAB[fam]
    out, src = [], []
    for k, band in enumerate(names[1:]):
        code = (answer or {}).get(band)
        if code and code in idx:
            i = idx[code]
            hi = rungs[i]["value"]
            lo = rungs[i - 1]["value"] if i > 0 else hi
            out.append(round(midpoint(lo, hi, ladder["unit"]), 6))
            src.append("ear")
        else:
            # factory-usage fallback; 3-band families take the corpus 2nd/4th quintile
            fallback = corpus[k] if len(names) == 5 else corpus[[1, 3][k]]
            out.append(fallback)
            src.append("corpus")
    # A factory-usage split must not cross an ear split: clamp each corpus split
    # between its neighbours so the bands stay in order (an ear mark wins; the
    # band it squeezes shrinks, possibly to nothing — which is itself a finding).
    for i in range(len(out)):
        if src[i] == "corpus":
            lo = max([out[j] for j in range(i) if src[j] == "ear"], default=-math.inf)
            hi = min([out[j] for j in range(i + 1, len(out)) if src[j] == "ear"], default=math.inf)
            out[i] = min(max(out[i], lo), hi)
    return out, src


def regions(names, splits, lo, hi, src):
    edges = [lo] + splits + [hi]
    return [{"band": names[i], "from": edges[i], "to": edges[i + 1],
             "source": "start by ear" if i and src[i - 1] == "ear" else
                       ("factory usage" if i else "floor")}
            for i in range(len(names))]


def main():
    ans_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(KIT, "ear_answers.json")
    manifest = json.load(open(os.path.join(KIT, "kit_manifest.json")))
    answers = json.load(open(ans_path))
    profile = json.load(open(os.path.join(PD, "wavetable_profile_v0.1.json")))
    today = datetime.date.today().isoformat()

    ear = {"source": "Loudon's ear-pass with the audition kit, %s" % today,
           "answers_file": os.path.relpath(ans_path, HERE), "families": {}}
    p2 = copy.deepcopy(profile)
    p2["schema_version"] = "0.2"
    n_ear = 0
    for code, L in manifest["ladders"].items():
        fam = L["family"]
        sp, src = splits_for(L, answers.get(code))
        n_ear += src.count("ear")
        ear["families"][fam] = {"parameter": L["parameter"], "bands": VOCAB[fam],
                                "splits": sp, "split_source": src}
        for param in PARAMS[fam]:
            pv = p2["parameter_vocabulary"].get(param)
            if pv is None:
                continue
            pv["perceptual_regions"] = regions(VOCAB[fam], sp, pv["range_min"], pv["range_max"], src)
            if param != L["parameter"]:
                pv["perceptual_regions_note"] = "inherited from %s's ladder (same knob scale assumed, not separately heard)" % L["parameter"]
    if answers.get("G_display"):
        ear["lfo_synced_rate_display"] = answers["G_display"]
    if answers.get("Z"):
        slot_of = {src: int(pct) - 1 for src, pct in answers["Z"].items() if pct}
        ear["slot_map"] = {str(v): k for k, v in sorted(slot_of.items(), key=lambda kv: kv[1])}
        p2["modulation_matrix"]["source_slot_meaning"]["confirmed_by_decoder"] = ear["slot_map"]
    p2["perceptual_regions_status"] = "%d band boundaries set by ear (%s); the rest are factory-usage splits" % (n_ear, today)

    json.dump(ear, open(os.path.join(PD, "ear_bands_v0.1.json"), "w"), indent=1)
    json.dump(p2, open(os.path.join(PD, "wavetable_profile_v0.2.json"), "w"), indent=1)
    print("%d band boundaries came from the ear; wrote ear_bands_v0.1.json + wavetable_profile_v0.2.json" % n_ear)

    # re-run the analyzer so the change is visible at once
    import importlib
    import corpus_bands
    importlib.reload(corpus_bands)
    import analyze_preset_v2
    sys.argv = [sys.argv[0]]
    analyze_preset_v2.main()


if __name__ == "__main__":
    main()
