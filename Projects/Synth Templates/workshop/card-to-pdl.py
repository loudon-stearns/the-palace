#!/usr/bin/env python3
"""card-to-pdl.py — prototype: a synth-template card → a PDL file (Generative Audio Devices' signal-flow IR).

    python3 card-to-pdl.py cards/house-bass.yaml [...]     # writes pdl/<id>.pdl and prints the coverage line
    python3 card-to-pdl.py --all                             # every card, plus pdl/COVERAGE.md and pdl/coverage.json

The card speaks in vocabulary words; this script resolves each word to its number through vocabulary.yaml and then
turns the number into the registry parameter PDL's VCV emitter expects (VCF FREQ knob, ADSR normalized times, LFO log2 Hz …).
What PDL's module set (VCO VCF ADSR VCA LFO VCMIXER MIDI_CV AUDIO_8) cannot carry — noise, fx, unison, glide, pan,
a second modulator on a one-cable input — is left out of the .pdl, said in a comment at its foot, and counted.
The conversions from a vocabulary number to a VCV knob are the Fundamental source's own curves (noted at each function).
"""
import json, math, os, sys, collections
import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
CARDS = os.path.join(HERE, "cards")
OUT = os.path.join(HERE, "pdl")
VOCAB = yaml.safe_load(open(os.path.join(HERE, "vocabulary.yaml")))

SOURCES = ["osc1", "osc2", "sub", "noise"]
WAVE_PORT = {"saw": "SAW", "square": "SQR", "pulse": "SQR", "triangle": "TRI", "sine": "SIN"}
LFO_PORT = {"sine": "SIN", "triangle": "TRI", "square": "SQR", "saw": "SAW"}
INST = {"osc1": "OSC1", "osc2": "OSC2", "sub": "SUB", "noise": "NOISE", "mix": "MIX", "filter1": "FILT1", "filter2": "FILT2",
        "amp": "AMP", "fenv": "FENV", "aenv": "AENV", "menv": "MENV", "lfo1": "LFO1", "lfo2": "LFO2"}
VOICES = {"mono": 1, "mono legato": 1, "poly": 6, "both": 6, "poly or mono": 6, "paraphonic": 6, "unison": 1}


# ---- vocabulary words → numbers --------------------------------------------------------------------------------
def word(table, w, default=None):
    """A card word → its vocabulary number; None when the word is not in the table."""
    t = VOCAB.get(table, {})
    if w is None: return default
    v = t.get(str(w))
    return default if v is None else v


def time_word(w, decay=None):
    if w == "same as decay": return decay
    return word("time", w)


# ---- numbers → VCV Fundamental knob positions (registry units) ------------------------------------------------
def adsr_knob(seconds):
    """Fundamental ADSR: time constant tau = 1 ms × 10000^knob (MIN_TIME 1e-3, MAX_TIME 10). The vocabulary's time is the 95 %
    point, three time constants, so tau = T/3."""
    if seconds is None: return None
    tau = max(seconds, 0.001) / 3
    return round(min(1.0, max(0.0, math.log10(tau / 0.001) / 4)), 3)


def vcf_knob(hz):
    """Fundamental VCF: cutoff = C4·2^(knob·10 − 5) Hz, i.e. 8.18 Hz at 0, 8.37 kHz at 1."""
    return round(min(1.0, max(0.0, (math.log2(hz / 261.6256) + 5) / 10)), 3)


RES_KNOB = {"none": 0.05, "clean": 0.05, "little": 0.25, "moderate": 0.5, "high": 0.75, "self-oscillating": 0.95}  # by registry region, not a Q formula


def lfo_knob(hz):
    """Fundamental LFO: frequency = 2^knob Hz."""
    return round(math.log2(hz), 3)


def octaves_to_cv(octaves):
    """A 10 V envelope peak into a 1 V/oct attenuverter: depth = octaves / 10."""
    return round(octaves / 10, 3)


# ---- the converter ----------------------------------------------------------------------------------------------
class Conv:
    def __init__(self, card):
        self.card = card; self.g = card["graph"]; self.blocks = self.g["blocks"]
        self.decl, self.cables, self.params = [], [], collections.OrderedDict()
        self.taken = {}                       # (INST, PORT) → who holds the one cable an input takes
        self.ok_blocks, self.ok_routes, self.ok_audio = [], [], []
        self.un_blocks, self.un_routes, self.un_audio = [], [], []   # (id, kind-of-problem, detail)
        self.notes = []

    # values: block field > essential value > taste default > fallback
    def value(self, slot, param, fallback=None):
        b = self.blocks[slot]
        if param in b: return b[param]
        for e in self.card.get("essentials") or []:
            if e.get("block") == slot and e.get("param") == param: return e.get("value")
        for t in self.card.get("taste") or []:
            if t.get("block") == slot and t.get("param") == param: return t.get("default")
        return fallback

    def set(self, inst, k, v):
        if v is None: return
        self.params.setdefault(inst, collections.OrderedDict())[k] = v

    def cable(self, a, b, who, note=""):
        """One cable per input: the first modulator keeps the jack, a later one is recorded as a conflict."""
        key = b
        if key in self.taken:
            return False, f"input {b} already taken by {self.taken[key]}"
        self.taken[key] = who
        self.cables.append((a, b, note)); return True, ""

    def run(self):
        c, g, bl = self.card, self.g, self.blocks
        mapped = {}   # slot → INST
        # ---- blocks
        for slot, b in bl.items():
            k = b["kind"]; inst = INST.get(slot, slot.upper())
            if k == "oscillator":
                if b.get("wave") == "noise" or b.get("wave") not in WAVE_PORT:
                    self.un_blocks.append((slot, "noise source", "no noise module in the registry")); continue
                self.decl.append((inst, "VCO")); mapped[slot] = inst
                semis = int(b.get("octave", 0)) * 12 + int(b.get("semi", b.get("semitones", 0)) or 0)
                if "ratio" in b:
                    try:
                        n, d = str(b["ratio"]).split(":"); r = float(n) / float(d)
                        semis += round(12 * math.log2(r)) if r > 0 else 0
                    except Exception: pass
                self.set(inst, "FREQ", semis)
                if b.get("wave") in ("square", "pulse"): self.set(inst, "PW", float(b.get("pw", 0.5)))
                for f, why in (("unison", "unison stack"), ("detune", "unison detune"), ("glide", "glide / portamento"),
                               ("retrigger", "oscillator phase retrigger"), ("spread", "stereo spread"), ("color", "oscillator color"),
                               ("feedback", "oscillator feedback"), ("engine", "oscillator engine"), ("phase", "oscillator phase")):
                    if f in b and b[f] not in (None, 0, "none", False, "off", 1):
                        self.un_blocks.append((slot, why, f"{f}: {b[f]}"))
            elif k == "mixer":
                self.decl.append((inst, "VCMIXER")); mapped[slot] = inst
            elif k == "filter":
                if b.get("type") not in ("lowpass", "highpass"):
                    self.un_blocks.append((slot, f"{b.get('type')} filter", "VCF has LPF and HPF outputs only")); continue
                self.decl.append((inst, "VCF")); mapped[slot] = inst
                hz = word("cutoff", self.value(slot, "cutoff", "mid"), 1200)
                self.set(inst, "FREQ", vcf_knob(hz))
                self.set(inst, "RES", RES_KNOB.get(str(self.value(slot, "resonance", "none")), 0.05))
                dr = word("drive", self.value(slot, "drive", "none"), 0)
                if dr: self.set(inst, "DRIVE", dr)
                if b.get("slope", 24) != 24: self.notes.append(f"{slot}: {b.get('slope')} dB/oct asked; VCF is 24 dB/oct")
                if b.get("keytrack"): self.un_blocks.append((slot, "filter keytracking", f"keytrack: {b['keytrack']}"))
            elif k == "amplifier":
                self.decl.append((inst, "VCA")); mapped[slot] = inst
                self.set(inst, "LEVEL", word("level", self.value(slot, "level", "full"), 1.0)); self.set(inst, "RESPONSE", 1.0)
            elif k == "fx":
                self.un_blocks.append((slot, "fx chain", ", ".join(map(str, b.get("chain") or []))))
            elif k == "envelope":
                self.decl.append((inst, "ADSR")); mapped[slot] = inst
                sh = b["shape"]
                d = time_word(self.value(slot, "decay", sh["d"]))
                self.set(inst, "A", adsr_knob(time_word(self.value(slot, "attack", sh["a"]))))
                self.set(inst, "D", adsr_knob(d))
                self.set(inst, "S", word("level", self.value(slot, "sustain", sh["s"]), 0.5))
                self.set(inst, "R", adsr_knob(time_word(self.value(slot, "release", sh["r"]), decay=d)))
                if b.get("one_shot"): self.notes.append(f"{slot}: one-shot asked; ADSR follows the gate")
            elif k == "lfo":
                if b.get("wave") not in LFO_PORT:
                    self.un_blocks.append((slot, f"{b.get('wave')} LFO", "LFO has sine, triangle, saw, square outputs")); continue
                self.decl.append((inst, "LFO")); mapped[slot] = inst
                self.set(inst, "FREQ", lfo_knob(word("rate", self.value(slot, "rate", "medium"), 4.5))); self.set(inst, "OFFSET", 0.0)
                if b.get("sync"): self.notes.append(f"{slot}: tempo sync asked; LFO is free-running")
            for s in mapped:
                if s not in [x[0] for x in self.ok_blocks]: self.ok_blocks.append((s, k))
        self.ok_blocks = [(s, bl[s]["kind"]) for s in mapped]
        osc_port = lambda s: WAVE_PORT[bl[s]["wave"]]
        # ---- audio: find who really reaches out (fx is skipped; its input becomes the voice)
        audio = g["audio"]
        def src_port(s):
            if bl[s]["kind"] == "oscillator": return f"{mapped[s]}:{osc_port(s)}"
            if bl[s]["kind"] == "filter": return f"{mapped[s]}:{'HPF' if bl[s]['type'] == 'highpass' else 'LPF'}"
            if bl[s]["kind"] == "mixer": return f"{mapped[s]}:MIX"
            if bl[s]["kind"] == "amplifier": return f"{mapped[s]}:OUT"
        feeds_fx = [e[0] for e in audio if e[1] == "fx"]
        mix_n = 0; self.mix_slot = {}
        for e in audio:
            s, d = e[0], e[1]; jack = e[2] if len(e) == 3 else None
            if d == "fx" or s == "fx":
                if s == "fx" and d == "out" and feeds_fx and feeds_fx[0] in mapped:
                    self.cables.append((src_port(feeds_fx[0]), "OUT:IN1", "fx skipped")); self.cables.append((src_port(feeds_fx[0]), "OUT:IN2", ""))
                    self.ok_audio.append(e)
                elif s == "fx" or d == "fx": self.un_audio.append((e, "edge through fx", "no fx module; the voice goes straight out"))
                continue
            if s not in mapped or (d != "out" and d not in mapped):
                self.un_audio.append((e, "edge from/to an unmapped block", f"{s} → {d}")); continue
            if d == "out":
                self.cables.append((src_port(s), "OUT:IN1", "")); self.cables.append((src_port(s), "OUT:IN2", "")); self.ok_audio.append(e); continue
            if d == "mix":
                mix_n += 1
                if mix_n > 4: self.un_audio.append((e, "more than four mixer inputs", "")); continue
                self.mix_slot[s] = mix_n
                ok, why = self.cable(src_port(s), f"MIX:IN{mix_n}", s)
                lvl = word("level", self.value(s, "level", "full"), word("fm_index", self.value(s, "level"), 1.0))
                self.set("MIX", f"LVL{mix_n}", min(1.414, float(lvl)))
            elif jack in ("fm", "sync") and bl[d]["kind"] == "oscillator":
                port = "FM" if jack == "fm" else "SYNC"
                ok, why = self.cable(src_port(s), f"{mapped[d]}:{port}", s)
                if jack == "fm":
                    idx = word("fm_index", bl[s].get("level"), None)
                    self.set(mapped[d], "FM_MODE", 0.0); self.set(mapped[d], "FM_DEPTH", round(min(1.0, (idx or 1) / 6), 3))
            elif jack in ("ring", "am"):
                self.un_audio.append((e, f"{jack} modulation edge", "no ring/AM module")); continue
            elif bl[d]["kind"] in ("filter", "amplifier"):
                ok, why = self.cable(src_port(s), f"{mapped[d]}:IN", s)
            else:
                ok, why = False, f"{s} → {d} has no port"
            (self.ok_audio if ok else self.un_audio).append(e if ok else (e, "input conflict", why))
        # ---- modulation
        for m in g["modulation"]:
            f, to = m["from"], str(m["to"]); tgt, param = to.split(".", 1)
            amt_w = m.get("amount"); label = f"{f} → {to}"
            if tgt not in mapped:
                self.un_routes.append((label, "route to an unmapped block", tgt)); continue
            T = mapped[tgt]; tk = bl[tgt]["kind"]
            # the source
            if f == "key": src = "KEYBOARD:PITCH" if param == "pitch" or param == "cutoff" else "KEYBOARD:GATE"
            elif f == "vel": src = "KEYBOARD:VELOCITY"
            elif f == "wheel": src = "KEYBOARD:MOD"
            elif f == "at": src = "KEYBOARD:AFTERTOUCH"
            elif f in mapped and bl[f]["kind"] == "envelope": src = f"{mapped[f]}:ENV"
            elif f in mapped and bl[f]["kind"] == "lfo": src = f"{mapped[f]}:{LFO_PORT[bl[f]['wave']]}"
            elif f in mapped and bl[f]["kind"] == "oscillator": src = f"{mapped[f]}:{osc_port(f)}"
            else: self.un_routes.append((label, "route from an unmapped block", f)); continue
            oct_amt = word("amount", amt_w, None); cents = word("pitch_amount", amt_w, None)
            depth = (cents / 1200 if cents is not None else oct_amt if oct_amt is not None else 1.0)
            if f in ("vel", "wheel", "at") and amt_w is None: depth = 0.5
            # the destination
            dst = None; kind = None
            if tk == "oscillator":
                if param == "pitch" and f == "key": dst = f"{T}:V/OCT"
                elif param == "pitch": dst = f"{T}:FM"; self.set(T, "FM_MODE", 1.0); self.set(T, "FM_DEPTH", octaves_to_cv(depth))
                elif param == "pw": dst = f"{T}:PWM"; self.set(T, "PWM_DEPTH", round(min(1.0, depth / 5), 3))
                elif param == "level" and tgt in self.mix_slot:
                    dst = f"MIX:CV{self.mix_slot[tgt]}"; T_note = "level via the mixer channel CV"
                else: kind = f"oscillator.{param}"
            elif tk == "filter":
                if param == "cutoff": dst = f"{T}:FREQ"; self.set(T, "FREQ_CV", octaves_to_cv(depth if f != "key" else 10))
                elif param in ("res", "resonance"): dst = f"{T}:RES"; self.set(T, "RES_CV", round(min(1.0, depth / 5), 3))
                elif param == "drive": dst = f"{T}:DRIVE"; self.set(T, "DRIVE_CV", round(min(1.0, depth / 5), 3))
                else: kind = f"filter.{param}"
            elif tk == "amplifier":
                if param == "level": dst = f"{T}:CV"
                else: kind = f"amplifier.{param}"
            elif tk == "envelope":
                if param == "gate": dst = f"{T}:GATE"
                elif param in ("attack", "decay", "sustain", "release"):
                    dst = f"{T}:{param[0].upper()}_CV"; self.set(T, f"{param[0].upper()}_CV", round(min(1.0, depth / 5), 3))
                else: kind = f"envelope.{param}"
            elif tk == "lfo":
                if param == "rate": dst = f"{T}:FM"; self.set(T, "FM_DEPTH", round(min(1.0, depth / 5), 3))
                elif param == "reset": dst = f"{T}:RESET"
                else: kind = f"lfo.{param}"
            else: kind = f"{tk}.{param}"
            if kind: self.un_routes.append((label, f"no jack for {kind}", "")); continue
            ok, why = self.cable(src, dst, f)
            if ok: self.ok_routes.append(label)
            else: self.un_routes.append((label, "input conflict (one cable per jack)", why))
        return self

    def pdl(self):
        c = self.card; L = []
        L.append(f"// {c['name']} — {c.get('family')} — from Synth Templates card {c['id']} (schema {c.get('schema')})")
        L.append(f"// Generated by card-to-pdl.py: card words → vocabulary.yaml numbers → VCV Fundamental knobs. Do not edit; edit the card.")
        if c.get("classics"): L.append(f"// classics: {c['classics']}")
        L.append(f"# voices: {VOICES.get(c.get('mode'), 1)}")
        L.append("")
        for i, t in self.decl: L.append(f"@{i} = {t}")
        L.append(""); L.append("// ── Signal flow ──")
        for a, b, n in self.cables:
            if not a.startswith(("KEYBOARD", "FENV", "AENV", "MENV", "LFO")): L.append(f"{a} -> {b}" + (f"    // {n}" if n else ""))
        L.append(""); L.append("// ── Modulation ──")
        for a, b, n in self.cables:
            if a.startswith(("KEYBOARD", "FENV", "AENV", "MENV", "LFO")): L.append(f"{a} -> {b}" + (f"    // {n}" if n else ""))
        L.append(""); L.append("// ── Parameters ──")
        for inst, ps in self.params.items():
            L.append(f"* {inst}: " + " | ".join(f"{k} = {v}" for k, v in ps.items()))
        unm = self.un_blocks or self.un_routes or self.un_audio or self.notes
        if unm:
            L.append(""); L.append("// ── Not carried into PDL ──")
            for s, k, d in self.un_blocks: L.append(f"// block {s}: {k}" + (f" ({d})" if d else ""))
            for e, k, d in self.un_audio: L.append(f"// audio {e}: {k}" + (f" ({d})" if d else ""))
            for s, k, d in self.un_routes: L.append(f"// route {s}: {k}" + (f" ({d})" if d else ""))
            for n in self.notes: L.append(f"// approximated: {n}")
        return "\n".join(L) + "\n"

    def coverage(self):
        return {"id": self.card["id"], "blocks": len(self.blocks), "blocks_mapped": len(self.ok_blocks),
                "routes": len(self.g["modulation"]), "routes_mapped": len(self.ok_routes),
                "audio": len(self.g["audio"]), "audio_mapped": len(self.ok_audio),
                "unmapped_blocks": [list(x) for x in self.un_blocks], "unmapped_routes": [list(x) for x in self.un_routes],
                "unmapped_audio": [[str(x[0]), x[1], x[2]] for x in self.un_audio], "approximated": self.notes}


def convert(path):
    card = yaml.safe_load(open(path))
    cv = Conv(card).run()
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, f"{card['id']}.pdl"), "w").write(cv.pdl())
    return cv.coverage()


def write_coverage(rows):
    json.dump(rows, open(os.path.join(OUT, "coverage.json"), "w"), indent=1, ensure_ascii=False)
    n = len(rows)
    tb = sum(r["blocks"] for r in rows); mb = sum(r["blocks_mapped"] for r in rows)
    tr = sum(r["routes"] for r in rows); mr = sum(r["routes_mapped"] for r in rows)
    ta = sum(r["audio"] for r in rows); ma = sum(r["audio_mapped"] for r in rows)
    clean = [r["id"] for r in rows if not (r["unmapped_blocks"] or r["unmapped_routes"] or r["unmapped_audio"])]
    L = ["# Card → PDL coverage", "", f"Generated by `card-to-pdl.py --all` over {n} cards. A block, audio edge or modulation route is *mapped* when it",
         "became a registry module, a cable the VCV emitter can place, or both. Everything else is listed in the .pdl's foot comment and counted here.", "",
         "## Counts", "", "| | total | mapped | % |", "|---|---|---|---|",
         f"| blocks | {tb} | {mb} | {100*mb//tb} |", f"| audio edges | {ta} | {ma} | {100*ma//ta} |", f"| modulation routes | {tr} | {mr} | {100*mr//tr} |", "",
         f"Cards with everything mapped: **{len(clean)}** of {n}" + (f" — {', '.join(clean)}" if clean else ""), "",
         f"Cards with every block mapped: {sum(1 for r in rows if r['blocks'] == r['blocks_mapped'])}; every route mapped: {sum(1 for r in rows if r['routes'] == r['routes_mapped'])}.", ""]
    def group(title, key, idx):
        G = collections.defaultdict(set)
        for r in rows:
            for x in r[key]: G[x[idx]].add(r["id"])
        L.append(f"## {title}"); L.append("")
        for k, ids in sorted(G.items(), key=lambda kv: -len(kv[1])):
            L.append(f"- **{k}** — {len(ids)} card{'s' if len(ids) != 1 else ''}: {', '.join(sorted(ids))}")
        L.append("")
    group("Unmappable blocks, by kind", "unmapped_blocks", 1)
    group("Unmappable audio edges, by kind", "unmapped_audio", 1)
    group("Unmappable modulation routes, by kind", "unmapped_routes", 1)
    G = collections.defaultdict(set)
    for r in rows:
        for nt in r["approximated"]: G[nt.split(": ", 1)[1] if ": " in nt else nt].add(r["id"])
    L.append("## Approximated (carried, but not as asked)"); L.append("")
    for k, ids in sorted(G.items(), key=lambda kv: -len(kv[1])): L.append(f"- **{k}** — {len(ids)} cards: {', '.join(sorted(ids))}")
    open(os.path.join(OUT, "COVERAGE.md"), "w").write("\n".join(L) + "\n")


def main():
    paths = sorted(os.path.join(CARDS, f) for f in os.listdir(CARDS) if f.endswith(".yaml")) if "--all" in sys.argv else [a for a in sys.argv[1:] if a.endswith(".yaml")]
    if not paths: print(__doc__); sys.exit(2)
    rows = []
    for p in paths:
        try: r = convert(p); rows.append(r)
        except Exception as ex: print(f"FAIL {os.path.basename(p)}: {ex}"); continue
        print(f"{r['id']}: blocks {r['blocks_mapped']}/{r['blocks']}  audio {r['audio_mapped']}/{r['audio']}  routes {r['routes_mapped']}/{r['routes']}")
    if "--all" in sys.argv: write_coverage(rows)


if __name__ == "__main__":
    main()
