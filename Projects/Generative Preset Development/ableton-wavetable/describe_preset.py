"""
describe_preset.py — Track B as prose: a Wavetable preset described the way a
skilled synthesist would talk about it, not as a parameter list.

analyze_preset.py (v1) reads the XML and prints precise structural lines;
analyze_preset_v2.py swaps its pending markers for corpus feel-words. Both read
like a dump. This layer reads the same facts into a structured dict and then
WRITES: a one-sentence verdict, then source, filter, shape, motion, and playing
paragraphs, and a short "how sure I am" footer.

Writing rules it follows:
  - Lead with what you would hear, then how it is built.
  - Name a modulation by what it does ("LFO 2 folds Osc 1 hard"), and rank the
    motion by depth, so the three routings that make the sound come first and
    the forty housekeeping ones are summed up in a clause.
  - Leave out factory housekeeping (velocity to amp at 50%, bend on pitch,
    the constant pitch routing every preset carries).
  - A feel-word borrowed from factory usage is marked with a dagger (†); a
    feel-word set by Loudon's ear will print plain. When the ear sitting
    lands, the daggers disappear on their own (corpus_bands reads the ear file).
  - Uncertain identities (which hidden slot is which envelope, synced LFO
    division names) are hedged in the footer, not in every sentence.

Usage (from ableton-wavetable/):
  python3 describe_preset.py "decompressed-samples/Synth Pad__Aqueous Pad.xml"
  python3 describe_preset.py generated/light-through-deep-water/*.adv
  python3 describe_preset.py --json <file>     # the structured facts instead
"""
import gzip
import json
import os
import sys
import xml.etree.ElementTree as ET

import analyze_preset as v1
import corpus_bands as cb

# Oscillator effect mode, resolved this cycle from the corpus itself: in every
# one of the 14 decompressed factory presets, the live modulation targets on an
# oscillator match exactly one mode (FM Amt/FM Pitch -> 1, PW/Sync -> 2,
# Warp/Fold -> 3), with no contradictions. See
# profile-draft/osc_effect_mode_evidence.json.
FX_MODE = {
    "0": (None, None, None),
    "1": ("FM", "FM tune", "FM amount"),
    "2": ("Classic", "pulse width", "hard sync"),
    "3": ("Modern", "warp", "fold"),
}
FILTER_CIRCUIT = {  # documentary, from wavetable_enum_map_v0.1.json
    "0": "clean 12 dB", "1": "clean 24 dB", "2": "OSR 12 dB",
    "3": "OSR 24 dB", "4": "MS2 24 dB",
}
FILTER_TYPE = {"0": "low-pass", "1": "band-pass", "2": "morphing"}
ROUTING = {"0": "in series", "1": "in parallel", "2": "split"}
LFO_SHAPE = {"0": "sine", "1": "triangle", "2": "rising saw", "3": "falling saw",
             "4": "square", "5": "stepped random", "6": "smooth random"}
UNISON = {"1": "classic detune", "2": "shimmer", "3": "noise",
          "4": "phase-synced", "5": "position-spread", "6": "random-note"}

# Housekeeping: any routing identical (target, slot, depth) to one the blank
# init Wavetable already carries, plus the pitch-bend range on Pitch. A person
# describing a patch leaves these out; they say nothing about this sound.
INIT_PATH = os.path.join(v1.HERE, "decompressed-samples", "Instruments__Wavetable.xml")
_init = None

# Slot 9 is labelled "Random (per note)" by the corpus census, but the init
# patch plays a steady tone with slot 9 on Osc 1 Pos at 100%, and 7 of 14
# factory presets route slot 9 at exactly 100% onto an LFO's depth (the classic
# "controller fades the vibrato in" move). That reads as a performance
# controller, not randomness. Named honestly until the Z00 decoder is read.
SLOT_RENAME = {9: "an unnamed controller (slot 9)"}
PERFORMANCE = {"Velocity", "MIDI Note (key tracking)", "Aftertouch", "Pitch Bend",
               "Mod Wheel", "an unnamed controller (slot 9)"}

# How much a destination says about the sound, for ranking the motion.
def weight(target):
    t = target
    if t.endswith((" Pos", "Fold", "Warp", "FM Amt", "Sync", " PW")) or t in ("Pitch", "Amp") \
            or t.endswith("Pitch") or (t.startswith("Filter") and t.endswith("Freq")):
        return 1.0
    if t.endswith(("Pan", "Gain")):
        return 0.6
    if t.startswith(("LFO", "Env")) or t in ("Time", "Global Mod Amount"):
        return 0.4
    return 0.5


def housekeeping():
    global _init
    if _init is None:
        _init = set()
        try:
            root = ET.parse(INIT_PATH).getroot()
            for block in root.iter("ModulationConnectionsForInstrumentVector"):
                t = block.find("TargetName").attrib.get("Value")
                for i in range(13):
                    el = block.find("ModulationAmounts.%d" % i)
                    if el is not None and abs(float(el.attrib.get("Value", 0))) > 1e-9:
                        _init.add((t, i, round(float(el.attrib["Value"]), 3)))
        except FileNotFoundError:
            pass
    return _init


def is_housekeeping(r):
    if (r["target"], r["slot"], round(r["depth"], 3)) in housekeeping():
        return True
    return r["target"] == "Pitch" and r["slot"] in (7, 11)


def pretty(target):
    """'Filter 1 Freq' -> 'Filter 1 cutoff', 'Osc 2 Pos' -> 'Osc 2 wave position'."""
    words = {"Freq": "cutoff", "Pos": "wave position", "Res": "resonance", "Amount": "depth",
             "Amp": "volume", "Fold": "fold", "Warp": "warp", "Pan": "pan", "Gain": "level",
             "Drive": "drive", "Shaping": "shape", "Rate": "rate", "Sync": "sync", "PW": "pulse width",
             "Attack": "attack", "Decay": "decay", "Release": "release", "Sustain": "sustain",
             "Pitch": "pitch", "Tone": "tone", "Morph": "morph"}
    parts = target.split()
    if target == "Amp":
        return "the volume"
    if target == "Pitch":
        return "the pitch"
    if parts and parts[-1] in words:
        parts[-1] = words[parts[-1]]
    t = " ".join(parts).replace("FM Amt", "FM amount")
    return t[0].lower() + t[1:] if t.startswith(("Unison", "Sub", "Glide", "Time")) else t


def fx_active(o, d):
    """An oscillator's effect mode only counts if it is turned up or modulated."""
    if not FX_MODE.get(o["fx_mode"], (None,))[0]:
        return False
    moved = any(r["target"].startswith("Osc %d " % o["n"]) and
                r["target"].split()[-1] in ("Warp", "Fold", "Amt", "Sync", "PW") and not is_housekeeping(r)
                for r in d["routes"])
    return abs(o["fx1"]) > 0.02 or abs(o["fx2"]) > 0.02 or moved


def an(word):
    return ("an " if word.lstrip("\u2020 ")[:1].lower() in "aeiou" else "a ") + word


def load_root(path):
    if path.endswith(".adv"):
        return ET.fromstring(gzip.open(path).read())
    return ET.parse(path).getroot()


def attr(root, tag):
    el = root.find(".//" + tag)
    return el.attrib.get("Value") if el is not None else None


def f(root, tag, default=None):
    return v1.fnum(v1.manual(root, tag), default)


def secs(x):
    if x is None:
        return "?"
    if x < 0.001:
        return "instant"
    if x < 1:
        return "%d ms" % round(x * 1000)
    return ("%.1f s" % x).replace(".0 s", " s")


def hz(x):
    return ("%.1f kHz" % (x / 1000)).replace(".0 kHz", " kHz") if x >= 1000 else "%d Hz" % round(x)


def feel(family, value):
    name, _ = cb.band_for(family, value)
    return name + ("" if cb.source(family) == "ear" else "†")


def where_in_table(p):
    if p is None:
        return "somewhere in"
    if p < 0.08:
        return "at the start of"
    if p < 0.35:
        return "early in"
    if p < 0.65:
        return "in the middle of"
    if p < 0.92:
        return "late in"
    return "at the end of"


def pct(x):
    return "%d%%" % round(abs(x) * 100)


def facts(path):
    """Everything the prose needs, as plain data."""
    root = load_root(path)
    slot_kinds = v1.load_slot_kinds()
    base = os.path.basename(path).rsplit(".", 1)[0].split("__")[-1]
    name = base if path.endswith(".adv") else (attr(root, "UserName") or base)
    d = {"name": name, "file": os.path.basename(path),
         "category": os.path.basename(path).split("__")[0] if "__" in path else None,
         "author": ((attr(root, "Annotation") or "").replace("Created by:", "").strip()
                    if (attr(root, "Annotation") or "").startswith("Created by") else None),
         "oscs": [], "filters": [], "routes": []}

    for n in (1, 2):
        if not v1.on(root, "Voice_Oscillator%d_On" % n):
            continue
        mode = attr(root, "Voice_Oscillator%d_Effects_EffectMode" % n) or "0"
        d["oscs"].append({
            "n": n, "table": attr(root, "SpriteName%d" % n),
            "pos": f(root, "Voice_Oscillator%d_Wavetables_WavePosition" % n),
            "transpose": f(root, "Voice_Oscillator%d_Pitch_Transpose" % n, 0) or 0,
            "detune": f(root, "Voice_Oscillator%d_Pitch_Detune" % n, 0) or 0,
            "gain": f(root, "Voice_Oscillator%d_Gain" % n),
            "pan": f(root, "Voice_Oscillator%d_Pan" % n, 0) or 0,
            "fx_mode": mode,
            "fx1": f(root, "Voice_Oscillator%d_Effects_Effect1" % n, 0) or 0,
            "fx2": f(root, "Voice_Oscillator%d_Effects_Effect2" % n, 0) or 0,
        })
    d["sub"] = None
    if v1.on(root, "Voice_SubOscillator_On"):
        d["sub"] = {"transpose": f(root, "Voice_SubOscillator_Transpose", 0) or 0,
                    "gain": f(root, "Voice_SubOscillator_Gain"),
                    "tone": f(root, "Voice_SubOscillator_Tone")}

    for n in (1, 2):
        if not v1.on(root, "Voice_Filter%d_On" % n):
            continue
        d["filters"].append({
            "n": n, "type": v1.manual(root, "Voice_Filter%d_Type" % n),
            "circuit": v1.manual(root, "Voice_Filter%d_CircuitLpHp" % n),
            "freq": f(root, "Voice_Filter%d_Frequency" % n),
            "res": f(root, "Voice_Filter%d_Resonance" % n),
            "drive": f(root, "Voice_Filter%d_Drive" % n, 0) or 0,
        })
    d["routing"] = v1.manual(root, "Voice_Global_FilterRouting")

    pre = "Voice_Modulators_AmpEnvelope_"
    d["amp"] = {k: f(root, pre + t) for k, t in (
        ("a", "Times_Attack"), ("d", "Times_Decay"), ("s", "Sustain"), ("r", "Times_Release"))}
    for e in (2, 3):
        pre = "Voice_Modulators_Envelope%d_" % e
        d["env%d" % e] = {k: f(root, pre + t) for k, t in (
            ("a", "Times_Attack"), ("d", "Times_Decay"), ("r", "Times_Release"),
            ("init", "Values_Initial"), ("peak", "Values_Peak"), ("s", "Values_Sustain"))}

    d["lfos"] = {}
    for n in (1, 2):
        pre = "Voice_Modulators_Lfo%d_" % n
        sync = str(v1.manual(root, pre + "Time_Sync")) in ("1", "true", "True")
        d["lfos"][n] = {"shape": v1.manual(root, pre + "Shape_Type"), "sync": sync,
                        "rate": f(root, pre + "Time_Rate"),
                        "div": v1.manual(root, pre + "Time_SyncedRate"),
                        "amount": f(root, pre + "Shape_Amount"),
                        "fade": f(root, pre + "Time_AttackTime", 0) or 0}

    d["unison"] = {"mode": v1.manual(root, "Voice_Unison_Mode") or "0",
                   "voices": v1.manual(root, "Voice_Unison_VoiceCount"),
                   "amount": f(root, "Voice_Unison_Amount", 0) or 0}
    d["glide"] = f(root, "Voice_Global_Glide", 0) or 0

    for block in root.iter("ModulationConnectionsForInstrumentVector"):
        tn = block.find("TargetName")
        target = tn.attrib.get("Value", "?") if tn is not None else "?"
        for i in range(13):
            el = block.find("ModulationAmounts.%d" % i)
            if el is None:
                continue
            v = v1.fnum(el.attrib.get("Value", "0"), 0)
            if abs(v) > 1e-9:
                src = SLOT_RENAME.get(i) or slot_kinds.get(i, ("slot %d" % i, ""))[0]
                d["routes"].append({"target": target, "source": src, "slot": i, "depth": v})
    return d


# ---------------------------------------------------------------- writing ---

def lfo_words(d, n):
    l = d["lfos"][n]
    shape = LFO_SHAPE.get(str(l["shape"]), "LFO")
    if l["sync"]:
        speed = "tempo-synced"
    elif l["rate"] is not None:
        speed = "%s %s" % (feel("lfo_rate", l["rate"]), ("%.2f Hz" % l["rate"]).replace(".00 Hz", " Hz"))
    else:
        speed = ""
    return an(("%s %s" % (speed, shape)).strip())


def source_name(d, src, used):
    """Plain name for a modulation source; first mention carries its character."""
    if src.startswith("LFO"):
        n = int(src.split()[1])
        if src not in used:
            used.add(src)
            return "LFO %d (%s)" % (n, lfo_words(d, n))
        return "LFO %d" % n
    if src.startswith("Envelope"):
        e = int(src.split()[1])
        env = d["env%d" % e]
        if src not in used and env["a"] is not None:
            used.add(src)
            return "Env %d (%s rise, %s fall)" % (e, secs(env["a"]), secs(env["d"]))
        return "Env %d" % e
    return {"MIDI Note (key tracking)": "the note played", "Velocity": "velocity",
            "Random (per note)": "a per-note random value"}.get(src, src.lower())


def verb_for(target, depth):
    t = target
    if t.endswith(" Pos"):
        return "sweeps %s's wave position" % t[:-4]
    if t.endswith("Fold"):
        return "folds %s" % t[:-5]
    if t.endswith("Warp"):
        return "warps %s" % t[:-5]
    if t.endswith("FM Amt"):
        return "drives %s's FM" % t[:-7]
    if t.endswith("Sync"):
        return "pushes %s's hard sync" % t[:-5]
    if t.endswith(" PW"):
        return "moves %s's pulse width" % t[:-3]
    if t.endswith("Freq") and t.startswith("Filter"):
        return ("opens" if depth > 0 else "closes") + " %s" % t[:-5].lower()
    if t.endswith("Pan"):
        return "pans %s" % t[:-4]
    if t == "Amp":
        return "swells the volume" if depth > 0 else "ducks the volume"
    if t.endswith("Pitch"):
        return "bends %s" % (t[:-6] + "'s pitch" if t != "Pitch" else "the pitch")
    if t.startswith(("LFO", "Env")) or t in ("Time", "Global Mod Amount"):
        return "modulates %s" % pretty(t)
    return "moves %s" % pretty(t)


def degree(depth):
    a = abs(depth)
    return "hard" if a >= 0.7 else "firmly" if a >= 0.35 else "gently" if a >= 0.12 else "slightly"


def envelope_character(amp):
    a, dcy, s, r = amp["a"] or 0, amp["d"] or 0, amp["s"] or 0, amp["r"] or 0
    if s < 0.05:
        return "percussive" if (dcy < 1.5 or r < 0.4) else "plucked, ringing"
    if s < 0.6 and dcy < 1.5 and a < 0.04:
        return "struck-then-held"
    if a >= 0.3:
        return "slow-swelling"
    if a >= 0.04:
        return "soft-edged"
    return "sustained"


def kind_word(d):
    c = (d["name"] + " " + (d.get("category") or "")).lower()
    for key, word in (("kick", "kick"), ("pad", "pad"), ("bass", "bass"), ("lead", "lead"), ("kick", "kick"), ("chime", "chime"),
                      ("percuss", "percussion voice"), ("pluck", "pluck"), ("keys", "keys patch"),
                      ("mallet", "mallet"), ("brass", "brass patch"), ("rhythm", "rhythmic patch"),
                      ("ambient", "ambient texture"), ("effect", "effect patch")):
        if key in c:
            return word
    amp = d["amp"]
    if (amp["s"] or 0) < 0.05:
        return "pluck"
    return "pad" if (amp["a"] or 0) >= 0.3 else "patch"


def source_paragraph(d):
    parts = []
    oscs = d["oscs"]
    for o in oscs:
        bit = "Osc %d reads %s %s table" % (o["n"], where_in_table(o["pos"]),
                                            ("the " + o["table"]) if o["table"] else "its")
        if abs(o["transpose"]) >= 1:
            oct_ = o["transpose"] / 12
            bit += (" %s" % ("%s octave%s %s" % ("an" if abs(oct_) == 1 else "%d" % abs(oct_),
                                                   "s" if abs(oct_) != 1 else "",
                                                   "up" if oct_ > 0 else "down"))
                    if o["transpose"] % 12 == 0 else " %+d semitones" % o["transpose"])
        name, a1, a2 = FX_MODE.get(o["fx_mode"], (None, None, None))
        if name:
            amt = " (%s %s, %s %s)" % (a1, pct(o["fx1"]), a2, pct(o["fx2"]))
            if fx_active(o, d):
                bit += " through %s mode%s" % (name, amt)
        if abs(o["pan"]) > 0.15:
            bit += ", panned %s" % ("right" if o["pan"] > 0 else "left")
        parts.append(bit)
    if len(oscs) == 2:
        dt = abs(oscs[0]["detune"] - oscs[1]["detune"])
        if dt > 0.004 and oscs[0]["transpose"] == oscs[1]["transpose"]:
            parts.append("the two are detuned against each other, so they beat slowly")
    if d["sub"]:
        parts.append("a sub oscillator fills in underneath")
    if not oscs and not d["sub"]:
        parts.append("no oscillator is switched on, which is unusual")
    u = d["unison"]
    if u["mode"] != "0" and u["voices"] and int(u["voices"]) > 1:
        uw = UNISON.get(u["mode"], "unison")
        parts.append("%s unison stacks %s voices%s" % (
            uw.capitalize() if not parts else uw, u["voices"],
            ", spread wide" if u["amount"] > 0.4 else ", held tight" if u["amount"] < 0.1 else ""))
    s = "; ".join(parts)
    return s[0].upper() + s[1:] + "."


def filter_paragraph(d):
    fl = d["filters"]
    if not fl:
        return "No filter is engaged; the raw tables go straight to the amp."
    def one(x):
        ftype = FILTER_TYPE.get(str(x["type"]), "filter")
        circ = FILTER_CIRCUIT.get(str(x["circuit"]), "") if str(x["type"]) == "0" else ""
        words = " ".join(w for w in (feel("cutoff", x["freq"]) if x["freq"] else "", circ, ftype) if w)
        s = "%s at %s" % (an(words), hz(x["freq"]) if x["freq"] else "?")
        if x["res"] is not None and x["res"] >= cb.splits("resonance")[0]:
            s += " with %s resonance" % feel("resonance", x["res"])
        if x["drive"] >= 3:
            s += ", driven hard (%.1f dB)" % x["drive"]
        elif x["drive"] >= 0.5:
            s += ", lightly driven"
        return s
    if len(fl) == 1:
        return "The sound runs through %s." % one(fl[0])
    how = ROUTING.get(str(d["routing"]), "together")
    lead = {"in series": "Two filters run in series: ",
            "in parallel": "Two filters run in parallel: ",
            "split": "The filters are split, each taking its own share of the oscillators: "}.get(how, "Two filters: ")
    return lead + "%s, then %s." % (one(fl[0]), one(fl[1])) if how == "in series" else \
        lead + "%s, and %s." % (one(fl[0]), one(fl[1]))


def shape_paragraph(d):
    amp = d["amp"]
    ch = envelope_character(amp)
    s = "The amp envelope is %s: " % ch
    bits = ["%s attack (%s)" % (feel("attack", amp["a"]), secs(amp["a"]))]
    if (amp["s"] or 0) < 0.05:
        bits.append("it decays to silence over %s" % secs(amp["d"]))
    elif (amp["s"] or 0) < 0.85:
        bits.append("settles to %s over %s" % (pct(amp["s"]), secs(amp["d"])))
    else:
        bits.append("holds at full level")
    bits.append("%s release (%s)" % (feel("release", amp["r"]), secs(amp["r"])))
    s += ", ".join(bits) + "."
    if d["glide"] > 0.01:
        s += " Notes glide into each other (%s)." % secs(d["glide"])
    return s


def motion_paragraph(d):
    live = [r for r in d["routes"] if not is_housekeeping(r)]
    motion = [r for r in live if r["source"] not in PERFORMANCE
              and not r["source"].startswith("Constant")]
    motion.sort(key=lambda r: -abs(r["depth"]) * weight(r["target"]))
    if not motion:
        return "Nothing moves on its own: once a note is held, the sound stands still.", live
    used = set()
    top = motion[:4]
    phr = []
    for r in top:
        phr.append("%s %s %s" % (source_name(d, r["source"], used), verb_for(r["target"], r["depth"]),
                                 degree(r["depth"])))
    s = "What moves it: " + "; ".join(phr) + "."
    rest = motion[4:]
    if rest:
        dests = sorted({pretty(r["target"]) for r in rest})
        s += " Another %d smaller routings keep %s alive underneath." % (
            len(rest), ", ".join(dests[:4]) + (" and more" if len(dests) > 4 else ""))
    meta = [r for r in motion if r["target"].startswith(("LFO", "Env"))]
    if meta:
        s += " Some modulators modulate other modulators, so the motion itself drifts over time."
    lfo_used = {r["source"] for r in motion if r["source"].startswith("LFO")}
    if len(lfo_used) == 2:
        l1, l2 = d["lfos"][1], d["lfos"][2]
        if not l1["sync"] and not l2["sync"] and l1["rate"] and l2["rate"] and \
                abs(l1["rate"] - l2["rate"]) / max(l1["rate"], l2["rate"]) > 0.15:
            s += " The two LFOs run at different rates, so the pattern never quite repeats."
    return s, live


def playing_paragraph(d, live):
    perf = [r for r in live if r["source"] in PERFORMANCE]
    if not perf:
        return "Beyond the usual velocity-to-volume, nothing responds to how you play."
    by = {}
    for r in sorted(perf, key=lambda r: -abs(r["depth"])):
        by.setdefault(r["source"], []).append(r)
    bits = []
    for src, rs in by.items():
        targets = ", ".join(pretty(r["target"]) for r in rs[:3])
        who = {"Velocity": "Playing harder moves", "MIDI Note (key tracking)": "Higher notes move",
               "Aftertouch": "Pressing into the key moves", "Pitch Bend": "The bend wheel moves",
               "Mod Wheel": "The mod wheel moves"}.get(src, src[0].upper() + src[1:] + " moves")
        bits.append("%s %s%s" % (who, targets, " and more" if len(rs) > 3 else ""))
    return ". ".join(bits) + "."


def verdict(d):
    amp = d["amp"]
    ch = envelope_character(amp)
    kind = kind_word(d)
    tables = [o["table"] for o in d["oscs"] if o["table"]]
    modes = {FX_MODE[o["fx_mode"]][0] for o in d["oscs"] if fx_active(o, d)}
    if len(tables) == 2 and tables[0] == tables[1]:
        tables = ["two copies of " + tables[0]]
    built = "built on %s" % (" and ".join(tables) if tables else "the sub alone")
    if modes:
        built += " (%s)" % "/".join(sorted(modes))
    filt = ""
    if d["filters"]:
        f1 = d["filters"][0]
        filt = ", through %s filter" % an(feel("cutoff", f1["freq"]))
    movers = [r for r in d["routes"] if r["source"].startswith(("LFO", "Envelope"))
              and not is_housekeeping(r) and abs(r["depth"]) >= 0.05]
    mo = ""
    if movers:
        big = max(movers, key=lambda r: abs(r["depth"]) * weight(r["target"]))
        mo = ", whose life is %s %s" % (big["source"].replace("Envelope", "Env"),
                                        verb_for(big["target"], big["depth"]).replace("sweeps", "sweeping")
                                        .replace("folds", "folding").replace("warps", "warping")
                                        .replace("opens", "opening").replace("closes", "closing")
                                        .replace("pans", "panning").replace("drives", "driving")
                                        .replace("moves", "moving").replace("bends", "bending")
                                        .replace("swells", "swelling").replace("ducks", "ducking")
                                        .replace("pushes", "pushing").replace("modulates", "modulating"))
    phrase = ch + " " + kind if kind.split()[0] not in ch else kind
    head = an(phrase)
    return "%s%s %s%s%s." % (head[0].upper(), head[1:], built, filt, mo)


def describe(path):
    d = facts(path)
    head = d["name"] + (" (%s)" % d["author"] if d["author"] else "")
    motion, live = motion_paragraph(d)
    paras = [verdict(d), source_paragraph(d), filter_paragraph(d), shape_paragraph(d),
             motion, playing_paragraph(d, live)]
    hedges = []
    if any(r["source"].startswith("Envelope") for r in d["routes"]):
        hedges.append("which hidden slot is Env 2 and which is Env 3 is the census's guess until the slot decoder is read")
    if any(l["sync"] for l in d["lfos"].values()):
        hedges.append("synced LFO divisions are not decoded yet")
    if cb.source("cutoff") != "ear":
        hedges.append("† marks a feel-word borrowed from how Ableton's factory presets set that knob, not yet set by ear")
    hedges.append("filter circuit names follow Wavetable's menu order and are unconfirmed in Live")
    foot = "How sure I am: " + "; ".join(hedges) + "."
    return d, head, paras, foot


def render_text(head, paras, foot):
    out = [head, "=" * len(head), "", paras[0], ""]
    for label, p in zip(("Source", "Filter", "Shape", "Motion", "Playing"), paras[1:]):
        out.append("%s. %s" % (label, p))
    out += ["", foot, ""]
    return "\n".join(out)


def main():
    args = sys.argv[1:]
    as_json = "--json" in args
    args = [a for a in args if a != "--json"]
    if not args:
        sd = os.path.join(v1.HERE, "decompressed-samples")
        args = [os.path.join(sd, "Synth Pad__Aqueous Pad.xml")]
    for p in args:
        d, head, paras, foot = describe(p)
        if as_json:
            print(json.dumps(d, indent=2, default=str))
        else:
            print(render_text(head, paras, foot))


if __name__ == "__main__":
    main()
