"""
reshape_preset.py — Track C for Ableton Wavetable: an existing preset + a direction -> a modified .adv.

The entry's modification track: read the preset (Track B), turn an abstract
direction into movements through the profile's band words, emit the result. The
moves are band moves, not number nudges — "darker" means "the cutoff goes down one
band from wherever it sits", so the same word means the same distance in feel on
any preset, and it sharpens by itself when the ear-pass replaces the factory-usage
band edges.

The direction words below are the deterministic layer. In the full pipeline a
model reads Loudon's free-form direction ("push this toward something that
breathes") and picks from these moves; here a simple keyword match stands in.

Each move is logged with before -> after in band words, so the sidecar reads like
a synthesist's change note.

Run from ableton-wavetable/ :
    python3 reshape_preset.py "decompressed-samples/Synth Pad__Aqueous Pad.xml" "darker and more menacing"
    python3 reshape_preset.py <preset> "breathe"  [--out reshaped/]
"""
import argparse
import json
import os
import re

import corpus_bands as cb
from generate_preset import (HERE, SLOT, FAMILY_PARAMS, set_mod, set_text, shift_band, get_mods)
from wavetable_writer import read_adv, write_adv, set_param, get_param


def band_move(xml, log, family, steps, params=None):
    """Move each param `steps` bands; returns (xml, factor) — factor is new/old of the first param,
    so a paired param (Filter 2) can follow by the same ratio and keep the designer's offset."""
    params = params or FAMILY_PARAMS[family][0]
    factor = None
    for p in params:
        v = get_param(xml, p)
        if v is None:
            continue
        cur, new, nv = shift_band(family, max(v, 1e-6), steps)
        if new == cur:  # already at the end of the scale, or a zero move: leave it be
            log.append({"param": p, "move": "%s %+d band" % (family, steps),
                        "before": "%s (%.4g)" % (cur, v), "after": "unchanged (already %s)" % cur})
            factor = factor or 1.0
            continue
        xml = set_param(xml, p, round(nv, 6))
        factor = factor or (nv / v if v else 1.0)
        log.append({"param": p, "move": "%s %+d band" % (family, steps),
                    "before": "%s (%.4g)" % (cur, v), "after": "%s (%.4g)" % (new, nv)})
    return xml, factor


def follow(xml, log, p, factor, family, lo=20.0, hi=20479.998):
    """Scale a paired parameter by the same ratio, so its offset to the moved one is kept."""
    v = get_param(xml, p)
    if v is None or not factor or factor == 1.0:
        return xml
    nv = round(min(max(v * factor, lo), hi), 6)
    log.append({"param": p, "move": "follows Filter 1 (x%.2f)" % factor,
                "before": "%s (%.4g)" % (cb.band_for(family, v)[0], v),
                "after": "%s (%.4g)" % (cb.band_for(family, nv)[0], nv)})
    return set_param(xml, p, nv)


def nudge(xml, log, p, delta, lo, hi, why):
    v = get_param(xml, p)
    if v is None:
        return xml
    nv = round(min(max(v + delta, lo), hi), 6)
    log.append({"param": p, "move": why, "before": "%.4g" % v, "after": "%.4g" % nv})
    return set_param(xml, p, nv)


def is_on(xml, p):
    return str(get_param(xml, p)).lower() == "true"


# ---------- the moves ----------

def darker(xml, log):
    xml, f = band_move(xml, log, "cutoff", -1)
    if is_on(xml, "Voice_Filter2_On"):
        xml = follow(xml, log, "Voice_Filter2_Frequency", f, "cutoff")
    return xml


def brighter(xml, log):
    xml, f = band_move(xml, log, "cutoff", +1)
    if is_on(xml, "Voice_Filter2_On"):
        xml = follow(xml, log, "Voice_Filter2_Frequency", f, "cutoff")
    return xml


def menacing(xml, log):
    # menace = resonance that bites, saturation, weight underneath, a little
    # unstable width. It does not touch the cutoff; pair it with "darker" for that.
    xml, _ = band_move(xml, log, "resonance", +1)
    xml = nudge(xml, log, "Voice_Filter1_Drive", 6.0, 0, 24, "drive +6 dB (saturation)")
    xml = set_param(xml, "Voice_SubOscillator_On", "true")
    xml = nudge(xml, log, "Voice_SubOscillator_Gain", 0.2, 0, 0.6, "sub +0.2 (weight)")
    xml = nudge(xml, log, "Voice_Unison_Amount", 0.15, 0, 1, "unison +0.15 (unstable width)")
    return xml


def breathe(xml, log):
    # breathing = a slow swell in and out: soften the onset one band, set LFO 1
    # free-running in the 'drifting' band, and route it gently to amp and filter.
    xml, _ = band_move(xml, log, "attack", +1)
    xml = set_param(xml, "Voice_Modulators_Lfo1_Time_Sync", 0)
    xml = set_param(xml, "Voice_Modulators_Lfo1_Shape_Type", 0)
    rate = get_param(xml, "Voice_Modulators_Lfo1_Time_Rate")
    if cb.band_for("lfo_rate", rate)[0] != "drifting":
        _, _, nv = shift_band("lfo_rate", 0.4, 0)  # centre of 'drifting'
        xml = set_param(xml, "Voice_Modulators_Lfo1_Time_Rate", round(nv, 6))
        log.append({"param": "Voice_Modulators_Lfo1_Time_Rate", "move": "LFO 1 to drifting, free, sine",
                    "before": "%s (%.4g)" % (cb.band_for("lfo_rate", rate)[0], rate),
                    "after": "drifting (%.4g)" % nv})
    before = get_mods(xml)
    for tgt, amt in (("Voice_Global_AmpModulation", 0.25), ("Voice_Filter1_Frequency", 0.15)):
        xml = set_mod(xml, tgt, SLOT["lfo1"], amt)
        b = before.get(tgt, {}).get(SLOT["lfo1"], 0.0)
        log.append({"param": tgt, "move": "LFO 1 routing", "before": "%+.2f" % b, "after": "%+.2f" % amt})
    return xml


def strip(xml, log):
    # strip to the core body: one oscillator, no unison, no second filter
    for p, v in (("Voice_Oscillator2_On", "false"), ("Voice_Filter2_On", "false"),
                 ("Voice_Unison_Amount", 0.0)):
        before = get_param(xml, p)
        xml = set_param(xml, p, v)
        log.append({"param": p, "move": "strip", "before": str(before), "after": str(v)})
    return xml


MOVES = [  # (keyword pattern, move) — order is the order they apply
    (r"\bstrip|core|bare", strip),
    (r"\bdark", darker),
    (r"\bbright|open up", brighter),
    (r"menac|threat|sinister|aggress", menacing),
    (r"breath|swell|alive", breathe),
]


def reshape(path, direction, out_dir):
    xml = read_adv(path)
    name = os.path.basename(path).rsplit(".", 1)[0].split("__")[-1]
    log, used = [], []
    for pat, fn in MOVES:
        if re.search(pat, direction, re.I):
            xml = fn(xml, log)
            used.append(fn.__name__)
    if not used:
        raise SystemExit("no move matched %r; known: %s" % (direction, [f.__name__ for _, f in MOVES]))
    new_name = "%s - %s" % (name, " + ".join(used))
    xml = set_text(xml, "UserName", new_name)
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, new_name + ".adv")
    write_adv(xml, out)
    json.dump({"source": os.path.relpath(path, HERE), "direction": direction, "moves": used,
               "changes": log, "mods_after": get_mods(xml), "slot_map_assumed": SLOT},
              open(out[:-4] + ".json", "w"), indent=1)
    return out, log


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("preset")
    ap.add_argument("direction")
    ap.add_argument("--out", default=os.path.join(HERE, "reshaped"))
    a = ap.parse_args()
    out, log = reshape(a.preset, a.direction, a.out)
    print("wrote", os.path.relpath(out, HERE))
    for c in log:
        print("  %-48s %-26s %s -> %s" % (c["param"], c["move"], c["before"], c["after"]))


if __name__ == "__main__":
    main()
