"""
build_audition_kit.py — the audition instrument for the Wavetable ear-pass.

The plan's next move is one sitting in Live where Loudon labels, by ear, where a
Wavetable setting changes character (where a cutoff turns from dark to open,
where an attack stops being punchy). The v0.1 worksheet asked him to *sweep a
knob and write down numbers*. This kit removes the sweeping and the numbers:
every ladder is a folder of ready-made .adv presets, one setting changed per
rung, named so they sort in order. In Live: load the first rung, turn on
hot-swap, hold a note, arrow down. When the sound changes character, note the
rung code (e.g. "A05"). That is the whole job.

Every ladder includes the factory-corpus split points (marked `*` in the file
name) — the places where Ableton's own designers' usage divides into fifths
(corpus_bands.py). So the sitting is not labeling from scratch; it is moving
those provisional fences to where the ear puts them.

Plus one decoder preset (Z00): each of the 13 modulation-source slots is routed
to Filter 1 Freq with a distinct amount — slot i at (i+1)%. Open the Matrix,
MIDI and MPE tabs and read which named source shows which percentage; that
settles the slot identities the corpus census could only guess, by eye.

Base patch: the factory init Wavetable (decompressed XML), Osc 1 alone on the
last frame of Basic Shapes (a harmonically rich wave — a filter on a sine only
changes its level), filter 1 low-pass wide open, amp envelope 1 ms / sustain
full / 100 ms release. Each ladder then changes only what it is testing.

Run from ableton-wavetable/ :  python3 build_audition_kit.py [--lfo-slots 2,3]
Writes audition-kit/<ladder folder>/<code> <what> <value>.adv and
audition-kit/kit_manifest.json (the code -> value map apply_bands.py reads).
"""
import argparse
import json
import os
import re
import shutil

from wavetable_writer import read_adv, write_adv, set_param, get_param

HERE = os.path.dirname(os.path.abspath(__file__))
INIT = os.path.join(HERE, "decompressed-samples", "Instruments__Wavetable.xml")
OUT = os.path.join(HERE, "audition-kit")
STATS = os.path.join(HERE, "profile-draft", "wavetable_corpus_stats_v0.1.json")


# ---------- small XML helpers beyond wavetable_writer ----------

def set_mod(xml, target_id, slot, amount):
    """Set ModulationAmounts.<slot> inside the connection block for target_id."""
    blk = re.compile(
        r'(<ModulationConnectionsForInstrumentVector Id="\d+" TargetId="'
        + re.escape(target_id) + r'">.*?</ModulationConnectionsForInstrumentVector>)',
        re.S)
    m = blk.search(xml)
    if not m:
        raise KeyError("no modulation block for " + target_id)
    block = m.group(1)
    new_block, n = re.subn(
        r'(<ModulationAmounts\.' + str(slot) + r' Value=")([^"]*)(")',
        r'\g<1>' + repr(float(amount)) + r'\g<3>', block, count=1)
    if n != 1:
        raise KeyError("slot %s not in block %s" % (slot, target_id))
    return xml[:m.start(1)] + new_block + xml[m.end(1):]


def set_username(xml, name):
    new, n = re.subn(r'(<UserName Value=")([^"]*)(")',
                     lambda m: m.group(1) + name.replace('"', "'") + m.group(3),
                     xml, count=1)
    if n != 1:
        raise KeyError("UserName not found")
    return new


def S(xml, **kv):
    """set_param for several Voice_* params at once (keyword = param name)."""
    for k, v in kv.items():
        xml = set_param(xml, k, v)
    return xml


# ---------- the base audition patch ----------

def base_patch():
    x = read_adv(INIT)
    x = S(x,
          Voice_Oscillator1_On="true",
          Voice_Oscillator1_Wavetables_WavePosition=1.0,
          Voice_Oscillator2_On="false",
          Voice_SubOscillator_On="false",
          Voice_Filter1_On="true",
          Voice_Filter1_Type=0,
          Voice_Filter1_Frequency=20479.998,
          Voice_Filter1_Resonance=0,
          Voice_Filter2_On="false",
          Voice_Modulators_AmpEnvelope_Times_Attack=0.001,
          Voice_Modulators_AmpEnvelope_Sustain=1.0,
          Voice_Modulators_AmpEnvelope_Times_Release=0.1)
    # The init patch ships three controller routings onto the oscillator
    # (slot 9 -> Osc 1 Pos 100%, slot 12 -> Osc 1 Pos 33%, slot 8 -> Osc 1 Warp
    # 7%). If any of those is a per-note source rather than a resting
    # controller, the wave would move between rungs. Zero them so a rung
    # changes only what it is testing. Velocity -> Amp and the pitch-bend
    # routings stay: they are inert unless played.
    x = set_mod(x, "Voice_Oscillator1_Wavetables_WavePosition", 9, 0)
    x = set_mod(x, "Voice_Oscillator1_Wavetables_WavePosition", 12, 0)
    x = set_mod(x, "Voice_Oscillator1_Effects_Effect1", 8, 0)
    return x


def lfo_patch(x, lfo_slots, depth=0.7):
    """Both LFOs set alike and routed to Amp (tremolo) through the given slots."""
    per = depth / len(lfo_slots)
    for slot in lfo_slots:
        x = set_mod(x, "Voice_Global_AmpModulation", slot, per)
    for n in (1, 2):
        x = S(x, **{"Voice_Modulators_Lfo%d_Shape_Type" % n: 0,
                    "Voice_Modulators_Lfo%d_Time_Sync" % n: 0,
                    "Voice_Modulators_Lfo%d_Time_Rate" % n: 4.0,
                    "Voice_Modulators_Lfo%d_Time_AttackTime" % n: 0})
    return x


def both_lfos(x, suffix, value):
    for n in (1, 2):
        x = set_param(x, "Voice_Modulators_Lfo%d_%s" % (n, suffix), value)
    return x


def corpus_splits():
    p = json.load(open(STATS))["parameters"]
    q = lambda k: [round(v, 6) for v in p[k]["quintiles"]]
    return {
        "cutoff": q("Voice_Filter1_Frequency"),
        "resonance": q("Voice_Filter1_Resonance"),
        "attack": q("Voice_Modulators_AmpEnvelope_Times_Attack"),
        "release": q("Voice_Modulators_AmpEnvelope_Times_Release"),
        "lfo_rate": q("Voice_Modulators_Lfo1_Time_Rate"),
        "attack_slope": q("Voice_Modulators_AmpEnvelope_Slopes_Attack"),
        "lfo_synced_rate": q("Voice_Modulators_Lfo1_Time_SyncedRate"),
        "lfo_attack": q("Voice_Modulators_Lfo1_Time_AttackTime"),
    }


def ladder_values(hand, splits):
    """Hand-picked rungs + the corpus split points, sorted, de-duplicated."""
    vals = sorted(set([round(v, 6) for v in hand] + [s for s in splits]))
    return vals


def fmt(v, unit):
    if unit == "Hz":
        return ("%.0f Hz" % v) if v >= 10 else ("%.3g Hz" % v)
    if unit == "s":
        return ("%.0f ms" % (v * 1000)) if v >= 0.0095 else ("%.2g ms" % (v * 1000))
    if unit == "idx":
        return "idx %d" % int(v)
    return "%.3g" % v


# ---------- the ladders ----------

def ladders(lfo_slots):
    cs = corpus_splits()
    B = base_patch()

    def cutoff(x, v):
        return S(x, Voice_Filter1_Frequency=v)

    def reso(x, v):
        return S(x, Voice_Filter1_Frequency=700.0, Voice_Filter1_Resonance=v)

    def attack(x, v):
        return S(x, Voice_Modulators_AmpEnvelope_Times_Attack=v)

    def slope(x, v):
        return S(x, Voice_Modulators_AmpEnvelope_Times_Attack=1.5,
                 Voice_Modulators_AmpEnvelope_Slopes_Attack=v)

    def release(x, v):
        return S(x, Voice_Modulators_AmpEnvelope_Times_Release=v)

    L = lfo_patch(B, lfo_slots)

    def lfo_rate(x, v):
        return both_lfos(x, "Time_Rate", v)

    def lfo_sync(x, v):
        x = both_lfos(x, "Time_Sync", 1)
        return both_lfos(x, "Time_SyncedRate", int(v))

    def lfo_attack(x, v):
        return both_lfos(x, "Time_AttackTime", v)

    return [
        # code, folder, family, param, unit, base, fn, hand-picked rungs, how to listen
        ("A", "A cutoff", "cutoff", "Voice_Filter1_Frequency", "Hz", B, cutoff,
         [40, 80, 300, 900, 2400, 6000, 12000, 20479.998],
         "Hold one note (C3). Arrow down. Mark the first rung that stops reading closed, then dark, warm, open, bright."),
        ("B", "B resonance", "resonance", "Voice_Filter1_Resonance", "", B, reso,
         [0.0, 0.25, 0.75, 0.9, 1.05, 1.25],
         "Cutoff parked at 700 Hz. Mark where flat turns coloured, singing, screaming, then the edge of self-oscillation."),
        ("C", "C amp attack", "attack", "Voice_Modulators_AmpEnvelope_Times_Attack", "s", B, attack,
         [0.0, 0.005, 0.015, 0.1, 0.25, 0.6, 1.5, 4.0, 10.0],
         "Play short repeated notes. Mark where clicky turns punchy, natural, soft, swell."),
        ("D", "D attack curve", "attack_slope", "Voice_Modulators_AmpEnvelope_Slopes_Attack", "", B, slope,
         [-1.0, -0.5, 0.5, 1.0],
         "Attack fixed at 1.5 s. Mark where the swell stops feeling slow-then-fast and where it starts feeling fast-then-slow."),
        ("E", "E amp release", "release", "Voice_Modulators_AmpEnvelope_Times_Release", "s", B, release,
         [0.005, 0.06, 0.3, 1.0, 3.0, 6.0, 12.0],
         "Short staccato notes. Mark where gated turns short, natural, long, tail."),
        ("F", "F lfo rate", "lfo_rate", "Voice_Modulators_Lfo1_Time_Rate", "Hz", L, lfo_rate,
         [0.05, 0.1, 0.4, 2.0, 7.0, 12.0, 20.0, 30.0],
         "LFO to volume (tremolo), free-running. Mark where imperceptible turns drifting, subtle, obvious, fast. If you hear NO wobble at all, the LFO slot guess is wrong — read Z00 first."),
        ("G", "G lfo synced rate", "lfo_synced_rate", "Voice_Modulators_Lfo1_Time_SyncedRate", "idx", L, lfo_sync,
         [0, 4, 18, 21],
         "LFO synced to tempo. For each rung, also write the note value Live shows on the LFO rate knob — that decodes the index."),
        ("H", "H lfo fade-in", "lfo_attack", "Voice_Modulators_Lfo1_Time_AttackTime", "s", L, lfo_attack,
         [0.0, 0.1, 0.73, 1.5, 4.0],
         "Tremolo at 4 Hz with a fade-in. Mark where instant turns fade-in, then slow-bloom."),
    ], cs


def build(lfo_slots):
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    specs, cs = ladders(lfo_slots)
    manifest = {
        "built_from": "decompressed-samples/Instruments__Wavetable.xml (factory init Wavetable)",
        "lfo_slots_used": lfo_slots,
        "base_patch": "Osc1 alone at Basic Shapes last frame (pos 1.0); Filter1 LP wide open; amp env 1 ms / sustain 1 / 100 ms release",
        "how_to_sit": "Load the first rung of a ladder onto a MIDI track, press hot-swap (the swap icon on the device title bar), hold or repeat a note, and arrow down through the folder. Write the rung code where the character changes.",
        "ladders": {},
    }
    n_files = 0
    for code, folder, fam, param, unit, base, fn, hand, how in specs:
        d = os.path.join(OUT, folder)
        os.makedirs(d)
        splits = cs[fam]
        vals = ladder_values(hand, splits)
        rungs = []
        for i, v in enumerate(vals):
            rc = "%s%02d" % (code, i + 1)
            star = "*" if round(v, 6) in splits else ""
            label = "%s %s %s%s" % (rc, folder.split(" ", 1)[1], fmt(v, unit), star)
            x = fn(base, v)
            x = set_username(x, label)
            # guard: the value we meant to write is the value that is there
            got = get_param(x, param)
            assert got is not None and abs(float(got) - float(v)) < 1e-6, (param, v, got)
            fname = label.replace("*", " (corpus split)").replace("/", "-") + ".adv"
            write_adv(x, os.path.join(d, fname))
            rungs.append({"code": rc, "value": v, "corpus_split": bool(star), "file": "%s/%s" % (folder, fname)})
            n_files += 1
        manifest["ladders"][code] = {
            "family": fam, "parameter": param, "unit": unit or "normalized",
            "corpus_splits": splits, "how_to_listen": how, "rungs": rungs,
        }

    # Z00 — the source-slot decoder
    zd = os.path.join(OUT, "Z decoder")
    os.makedirs(zd)
    z = S(base_patch(), Voice_Filter1_Frequency=2000.0)
    for slot in range(13):
        z = set_mod(z, "Voice_Filter1_Frequency", slot, (slot + 1) / 100.0)
    z = set_username(z, "Z00 slot decoder")
    write_adv(z, os.path.join(zd, "Z00 slot decoder.adv"))
    n_files += 1
    manifest["decoder"] = {
        "file": "Z decoder/Z00 slot decoder.adv",
        "how": "Load it, open the Matrix tab, then MIDI and MPE. On the Filter 1 Freq row, each source shows a percentage: slot index = percentage - 1. Write down which source shows 1% ... 13%.",
        "my_prediction_untested": {
            "0": "Env 2", "1": "Env 3", "2": "LFO 1", "3": "LFO 2",
            "5": "Velocity (init routes slot 5 -> Amp at 50%, Wavetable's default velocity-to-volume)",
            "7": "Pitch Bend (init routes slot 7 -> Pitch at 0.0417 = 2 of 48 semitones)",
            "11": "MPE Note PB (init routes slot 11 -> Pitch at 100%)",
            "9": "a resting controller such as Press or Aftertouch, NOT per-note Random as the census guessed: the init routes slot 9 -> Osc 1 Pos at 100%, and the default Wavetable plays a steady tone every note",
            "12": "MPE Slide (init routes it -> Osc 1 Pos at 33%)",
        },
    }
    json.dump(manifest, open(os.path.join(OUT, "kit_manifest.json"), "w"), indent=1)

    # the ear sheet: a one-page HTML form that turns picks into ear_answers.json
    tpl = open(os.path.join(HERE, "ear_sheet_template.html"), encoding="utf-8").read()
    open(os.path.join(OUT, "ear-sheet.html"), "w", encoding="utf-8").write(
        tpl.replace("__MANIFEST__", json.dumps(manifest)))

    # one zip of the whole kit, so it travels (and commits) as a single file
    shutil.make_archive(os.path.join(HERE, "wavetable-audition-kit"), "zip", OUT)
    return manifest, n_files


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--lfo-slots", default="2,3",
                    help="modulation slot indices that are LFO 1 / LFO 2 (rebuild after the decoder reading)")
    a = ap.parse_args()
    m, n = build([int(s) for s in a.lfo_slots.split(",")])
    for code, L in m["ladders"].items():
        print("%s %-16s %2d rungs  %s" % (code, L["family"], len(L["rungs"]),
              ", ".join(r["code"] + ("*" if r["corpus_split"] else "") for r in L["rungs"])))
    print("%d .adv files written to audition-kit/" % n)
