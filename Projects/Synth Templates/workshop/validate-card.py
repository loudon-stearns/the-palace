#!/usr/bin/env python3
"""validate-card.py — the gate a card passes before it is a card.

    python3 validate-card.py cards/<id>.yaml [...]      # schema, words, graph, catalog agreement
    python3 validate-card.py --render cards/<id>.yaml   # also draws the sheet: card-to-tikz → pdflatex → svg → png

Every rule here is one the generator (card-to-tikz.py) or the site voice (build-site.py) actually relies on, or one the
catalog fixes (id, name, family, tier, concepts). An ERROR fails the card; a WARN is printed and passes.
Exit status: 0 all cards pass, 1 any card fails.
"""
import json, os, re, subprocess, sys
import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
CARDS = os.path.join(HERE, "cards")
CAT = json.load(open(os.path.join(HERE, "catalog.json")))
VOCAB = yaml.safe_load(open(os.path.join(HERE, "vocabulary.yaml")))
TIME = set(VOCAB["time"]); LEVEL = set(VOCAB["level"]); CUTOFF = set(VOCAB["cutoff"]); RES = set(VOCAB["resonance"])
AMOUNT = set(VOCAB["amount"]); PITCH_AMOUNT = set(VOCAB["pitch_amount"]); DETUNE = set(VOCAB["detune"]); RATE = set(VOCAB["rate"])
GLIDE = set(VOCAB["glide"]); DRIVE = set(VOCAB["drive"]); FM = set(VOCAB["fm_index"]); REVERB = set(VOCAB["reverb"])
ALL_WORDS = set().union(*[set(t) for t in VOCAB.values()])

ITEMS = {t["id"]: dict(t, family=f["name"]) for f in CAT["families"] for t in f["items"]}
CONCEPTS = {c["name"] for c in CAT["concepts"]}

SOURCES = ["osc1", "osc2", "sub", "noise"]
CHAIN = ["mix", "filter1", "filter2", "amp", "fx"]
MODS = ["lfo1", "fenv", "menv", "aenv", "lfo2"]
PERFS = ["key", "vel", "wheel", "at"]
KIND = {"osc1": "oscillator", "osc2": "oscillator", "sub": "oscillator", "noise": "oscillator", "mix": "mixer", "filter1": "filter", "filter2": "filter",
        "amp": "amplifier", "fx": "fx", "fenv": "envelope", "aenv": "envelope", "menv": "envelope", "lfo1": "lfo", "lfo2": "lfo"}
ROLE = {"fenv": "filter", "aenv": "amp"}
OSC_WAVES = {"saw", "square", "pulse", "triangle", "sine", "noise"}
LFO_WAVES = {"sine", "triangle", "square", "saw", "random", "s&h", "sample-hold"}
FILTER_TYPES = {"lowpass", "highpass", "bandpass", "notch", "comb"}
SLOPES = {12, 18, 24, 48}
FX = {"chorus", "reverb", "delay", "echo", "saturation", "drive", "distortion", "phaser", "flanger", "eq", "compressor", "bitcrusher", "ring mod", "tremolo", "vibrato", "ensemble", "stereo widener", "limiter", "filter"}
ENV_CATEGORIES = {"percussive", "sustaining", "piano", "swell", "gate", "plucked", "struck", "bowed", "reverse", "organ", "pad", "string"}
MODES = {"mono", "poly", "mono legato", "both", "poly or mono", "paraphonic", "unison"}
# standard jacks per kind; a modulation route may name one of these, or a jack an audio edge added (fm, sync)
JACKS = {"oscillator": {"pitch", "shape", "sync", "fm", "pw", "level", "detune", "glide"}, "mixer": {"in", "level"}, "filter": {"in", "cutoff", "res", "resonance", "drive"},
         "amplifier": {"in", "level", "pan"}, "fx": {"in", "mix", "rate", "depth", "time", "feedback"}, "envelope": {"gate", "amount", "attack", "decay", "release", "sustain"}, "lfo": {"rate", "depth", "reset"}}
# which word table a taste/essential value for a parameter must come from
PARAM_TABLE = {"attack": TIME, "decay": TIME, "release": TIME, "sustain": LEVEL, "level": LEVEL, "cutoff": CUTOFF, "resonance": RES,
               "amount": AMOUNT | PITCH_AMOUNT, "depth": AMOUNT, "rate": RATE, "glide": GLIDE, "drive": DRIVE, "reverb": REVERB, "detune": DETUNE}


def check(path, render=False):
    errs, warns = [], []
    E = errs.append; Wn = warns.append
    try:
        card = yaml.safe_load(open(path))
    except Exception as ex:
        return [f"YAML does not parse: {ex}"], []
    if not isinstance(card, dict): return ["not a mapping"], []
    cid = os.path.basename(path)[:-5]
    # ---- identity against the catalog
    if card.get("schema") != "synth-template-card/0.2": E(f"schema must be synth-template-card/0.2, got {card.get('schema')!r}")
    if card.get("id") != cid: E(f"id {card.get('id')!r} must equal the filename {cid!r}")
    item = ITEMS.get(cid)
    if not item: E(f"id {cid!r} is not in catalog.json")
    else:
        for k in ("name", "family", "tier", "mode"):
            if k == "mode": continue
            if card.get(k) != item[k]: E(f"{k} {card.get(k)!r} disagrees with the catalog {item[k]!r}")
        for cpt in item.get("concepts", []):
            if cpt not in (card.get("concepts") or []): E(f"catalog concept missing from the card: {cpt!r}")
    if card.get("mode") not in MODES: E(f"mode must be one of {sorted(MODES)}, got {card.get('mode')!r}")
    if card.get("status") != "drafted": E("status must be 'drafted' (the tracker moves it on)")
    for cpt in card.get("concepts") or []:
        if cpt not in CONCEPTS: E(f"concept not in the concept map: {cpt!r}")
    for k in ("graph", "essentials", "taste", "listening", "render"):
        if k not in card: E(f"missing section {k!r}")
    if "mappings" not in card: Wn("no mappings: {} (fine for now)")
    g = card.get("graph") or {}
    blocks = g.get("blocks") or {}
    if not blocks: E("graph.blocks is empty"); return errs, warns
    # ---- blocks
    for slot, b in blocks.items():
        if slot not in KIND: E(f"unknown slot {slot!r}; slots are {SOURCES + CHAIN + MODS}"); continue
        if not isinstance(b, dict): E(f"block {slot} must be a mapping"); continue
        kind = b.get("kind")
        if kind != KIND[slot]: E(f"block {slot}: kind must be {KIND[slot]!r}, got {kind!r}")
        if kind == "oscillator":
            if b.get("wave") not in OSC_WAVES: E(f"{slot}.wave must be one of {sorted(OSC_WAVES)}, got {b.get('wave')!r}")
            if "octave" in b and not isinstance(b["octave"], int): E(f"{slot}.octave must be an integer")
            if "unison" in b and (not isinstance(b["unison"], int) or b["unison"] < 1): E(f"{slot}.unison must be a positive integer")
            if "detune" in b and b["detune"] not in DETUNE: E(f"{slot}.detune must be a detune word {sorted(DETUNE)}, got {b['detune']!r}")
            if "level" in b and b["level"] not in LEVEL and b["level"] not in FM: E(f"{slot}.level must be a level word (or an fm_index word for a modulator), got {b['level']!r}")
            if "pw" in b and not (0 < float(b["pw"]) < 1): E(f"{slot}.pw must be between 0 and 1")
            if "ratio" in b and not re.fullmatch(r"\d+(\.\d+)?:\d+(\.\d+)?", str(b["ratio"])): E(f"{slot}.ratio must look like '2:1', got {b['ratio']!r}")
            if "retrigger" in b and b["retrigger"] not in (True, False, "on", "off", "free"): E(f"{slot}.retrigger must be true/false")
            if "glide" in b and b["glide"] not in GLIDE and b["glide"] != "legato": E(f"{slot}.glide must be a glide word, got {b['glide']!r}")
        elif kind == "filter":
            if b.get("type") not in FILTER_TYPES: E(f"{slot}.type must be one of {sorted(FILTER_TYPES)}, got {b.get('type')!r}")
            if b.get("slope", 24) not in SLOPES: E(f"{slot}.slope must be one of {sorted(SLOPES)}, got {b.get('slope')!r}")
            if b.get("resonance", "none") not in RES: E(f"{slot}.resonance must be a resonance word {sorted(RES)}, got {b.get('resonance')!r}")
            if "drive" in b and b["drive"] not in DRIVE: E(f"{slot}.drive must be a drive word")
        elif kind == "amplifier":
            if b.get("level", "full") not in LEVEL: E(f"amp.level must be a level word, got {b.get('level')!r}")
        elif kind == "fx":
            ch = b.get("chain")
            if not isinstance(ch, list) or not ch: E("fx.chain must be a non-empty list")
            else:
                for f in ch:
                    if str(f) not in FX: Wn(f"fx.chain {f!r} is not a known effect ({sorted(FX)}); it is drawn by name and not heard")
        elif kind == "envelope":
            sh = b.get("shape")
            if not isinstance(sh, dict) or set(sh) != {"a", "d", "s", "r"}: E(f"{slot}.shape must be {{a, d, s, r}}")
            else:
                for k in ("a", "d"):
                    if sh[k] not in TIME or sh[k] == "same as decay": E(f"{slot}.shape.{k} must be a time word, got {sh[k]!r}")
                if sh["r"] not in TIME: E(f"{slot}.shape.r must be a time word (or 'same as decay'), got {sh['r']!r}")
                if sh["s"] not in LEVEL: E(f"{slot}.shape.s must be a level word, got {sh['s']!r}")
            if not b.get("category"): E(f"{slot}.category missing (percussive, sustaining, piano, swell, gate …)")
            elif b["category"] not in ENV_CATEGORIES: Wn(f"{slot}.category {b['category']!r} is not one of the usual {sorted(ENV_CATEGORIES)}")
            role = b.get("role")
            if slot in ROLE and role != ROLE[slot]: E(f"{slot}.role must be {ROLE[slot]!r}")
            if slot == "menv" and not role: E("menv.role missing (pitch, index, pw, pan, …): it names the block on the sheet")
            if "one_shot" in b and not isinstance(b["one_shot"], bool): E(f"{slot}.one_shot must be true or false")
        elif kind == "lfo":
            if b.get("wave") not in LFO_WAVES: E(f"{slot}.wave must be one of {sorted(LFO_WAVES)}, got {b.get('wave')!r}")
            if b.get("rate") not in RATE: E(f"{slot}.rate must be a rate word {sorted(RATE)}, got {b.get('rate')!r}")
            if "sync" in b and not isinstance(b["sync"], bool): E(f"{slot}.sync must be true or false")
        elif kind == "mixer":
            pass
    # ---- audio
    audio = g.get("audio") or []
    if not audio: E("graph.audio is empty")
    order = {s: 0 for s in SOURCES}; order.update({c: i + 1 for i, c in enumerate(CHAIN)}); order["out"] = 99
    to_out = 0; fed = set(); feeds = set()
    for e in audio:
        if not isinstance(e, list) or len(e) not in (2, 3): E(f"audio edge must be [src, dst] or [src, dst, jack]: {e!r}"); continue
        s, d = e[0], e[1]
        if s not in blocks: E(f"audio edge from unknown block {s!r}")
        if d != "out" and d not in blocks: E(f"audio edge to unknown block {d!r}")
        if d == "out": to_out += 1
        if s in order and d in order and not (d in SOURCES) and order[s] > order[d]: E(f"audio edge runs backwards against the slot order: {e!r}")
        if s in SOURCES and d in SOURCES and len(e) != 3: E(f"an oscillator feeding an oscillator must name the jack (fm, sync): {e!r}")
        if s in MODS or d in MODS: E(f"envelopes and LFOs are modulation, not audio: {e!r}")
        fed.add(d); feeds.add(s)
    if to_out != 1: E(f"exactly one audio edge must end at out, found {to_out}")
    for slot in blocks:
        if slot in SOURCES and slot not in feeds: E(f"source {slot} feeds nothing")
        if slot in CHAIN and slot not in fed: E(f"chain block {slot} has no audio input")
        if slot in CHAIN and slot not in feeds: E(f"chain block {slot} has no audio output")
    if "mix" in blocks:
        n = sum(1 for e in audio if e[1] == "mix")
        if n < 2: Wn("a mixer with one input: drop the mixer and feed the filter (or amp) directly")
    if "mix" not in blocks and sum(1 for s in SOURCES if s in blocks and not any(e[1] in SOURCES for e in audio if e[0] == s)) > 1:
        E("two or more sources feed the chain without a mixer; add mix")
    # ---- modulation
    mods = g.get("modulation") or []
    if not mods: E("graph.modulation is empty (at least key → pitch and an amp envelope)")
    froms = set(); have_aenv_amp = False; key_pitch = False
    for m in mods:
        if not isinstance(m, dict) or "from" not in m or "to" not in m: E(f"modulation route needs from and to: {m!r}"); continue
        f, to = m["from"], str(m["to"])
        if f not in blocks and f not in PERFS: E(f"modulation from unknown {f!r} (a block, or one of {PERFS})")
        if f in blocks and KIND.get(f) not in ("envelope", "lfo", "oscillator"): E(f"modulation from {f!r}: only envelopes, LFOs, oscillators and performance inputs modulate")
        if "." not in to: E(f"modulation to must be block.param: {to!r}"); continue
        tgt, param = to.split(".", 1)
        if tgt not in blocks: E(f"modulation to unknown block {tgt!r}")
        else:
            k = KIND.get(tgt)
            if param not in JACKS.get(k, set()): Wn(f"modulation to {to}: {param!r} is not a standard {k} jack ({sorted(JACKS.get(k, set()))}); it will be added to the block")
        if "essential" not in m or not isinstance(m["essential"], bool): E(f"modulation route needs essential: true|false: {to}")
        if "amount" in m and m["amount"] not in ALL_WORDS: E(f"modulation amount {m['amount']!r} is not a vocabulary word")
        froms.add(f)
        if f == "aenv" and to == "amp.level": have_aenv_amp = True
        if f == "key" and param == "pitch": key_pitch = True
        if f == "fenv" and not tgt.startswith("filter"): E("fenv must modulate a filter")
        if f == "aenv" and tgt != "amp": E("aenv must modulate amp")
    if "aenv" in blocks and not have_aenv_amp: E("aenv is present but does not route to amp.level")
    if "aenv" not in blocks: E("no aenv: every card has an amplitude envelope (gate-shaped if need be)")
    if not key_pitch and not (card.get("mode") == "mono" and any(blocks[s].get("wave") == "noise" for s in blocks if s in SOURCES) and len([s for s in blocks if s in SOURCES]) == 1):
        Wn("no key → pitch route: the keyboard does not play the pitch (fine only for noise and drums)")
    for slot in blocks:
        if slot in MODS and slot not in froms: E(f"modulator {slot} is drawn but routes nowhere")
    for slot in blocks:
        if slot in MODS and KIND[slot] == "envelope" and not any(m.get("from") == "key" and str(m.get("to")) == f"{slot}.gate" for m in mods):
            E(f"{slot} has no key → {slot}.gate route")
    # ---- essentials and taste
    ess = card.get("essentials") or []
    if len(ess) < 3: E("fewer than three essentials; what makes this sound this sound?")
    ROW_KEYS = {"block", "param", "value", "why", "range", "default", "note", "polarity"}
    for e in ess:
        if not isinstance(e, dict) or not {"block", "param", "value"} <= set(e): E(f"essential needs block, param, value: {e!r}"); continue
        extra = set(e) - ROW_KEYS
        if extra: E(f"essential {e['block']}.{e['param']} has stray keys {sorted(extra)}: an unquoted comma inside a value splits it; quote the value")
        if e["block"] not in blocks and e["block"] not in PERFS and e["block"] != "mode": E(f"essential on unknown block {e['block']!r}")
        if e["block"] in blocks and e["param"] in PARAM_TABLE and str(e["value"]) not in PARAM_TABLE[e["param"]] and not str(e["value"]).startswith("same as"):
            Wn(f"essential {e['block']}.{e['param']} = {e['value']!r} is not a {e['param']} word; the voice will fall back")
    taste = card.get("taste") or []
    if len(taste) < 3: E("fewer than three taste rows; what does the player move?")
    for t in taste:
        if not isinstance(t, dict) or not {"block", "param", "range", "default"} <= set(t): E(f"taste needs block, param, range, default: {t!r}"); continue
        extra = set(t) - ROW_KEYS
        if extra: E(f"taste {t['block']}.{t['param']} has stray keys {sorted(extra)}: an unquoted comma inside a value splits it; quote the value")
        if t["block"] not in blocks and t["block"] != "mode": E(f"taste on unknown block {t['block']!r}")
        rng = str(t["range"])
        if "–" not in rng and "-" not in rng: Wn(f"taste range {rng!r} should read 'low – high'")
        if t["block"] in blocks and t["param"] in PARAM_TABLE and str(t["default"]) not in PARAM_TABLE[t["param"]]:
            E(f"taste default {t['block']}.{t['param']} = {t['default']!r} must be a {t['param']} word: {sorted(PARAM_TABLE[t['param']])}")
    ls = card.get("listening") or {}
    if not ls.get("cue") or len(str(ls["cue"])) < 30: E("listening.cue missing or too short: say what to listen for, as a sentence or two")
    if not ls.get("ab") or len(str(ls["ab"])) < 30: E("listening.ab missing or too short: one change that breaks it, and putting it back")
    r = card.get("render") or {}
    for k in ("tempo", "note", "velocity", "pattern", "length_s"):
        if k not in r: E(f"render.{k} missing")
    if "length_s" in r and not (0.5 <= float(r["length_s"]) <= 20): E("render.length_s should be 0.5–20 s")
    # ---- draw it
    if render and not errs:
        try:
            subprocess.run([sys.executable, os.path.join(HERE, "card-to-tikz.py"), path], check=True, capture_output=True, text=True, cwd=HERE)
            subprocess.run(["pdflatex", "-interaction=nonstopmode", "-halt-on-error", f"{cid}.tex"], check=True, capture_output=True, text=True, cwd=CARDS)
            import fitz
            doc = fitz.open(os.path.join(CARDS, f"{cid}.pdf"))
            open(os.path.join(CARDS, f"{cid}.svg"), "w").write(doc[0].get_svg_image(text_as_path=True))
            subprocess.run(["sips", "-s", "format", "png", f"{cid}.pdf", "--out", f"{cid}-preview-1.png"], check=True, capture_output=True, cwd=CARDS)
            for ext in (".aux", ".log"):
                try: os.remove(os.path.join(CARDS, cid + ext))
                except OSError: pass
        except subprocess.CalledProcessError as ex:
            tail = (ex.stdout or "")[-1500:] + (ex.stderr or "")[-500:]
            E(f"render failed in {ex.cmd[0]}:\n{tail}")
    return errs, warns


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    render = "--render" in sys.argv
    if not args: print(__doc__); sys.exit(2)
    bad = 0
    for p in args:
        errs, warns = check(p, render)
        tag = "FAIL" if errs else "ok  "
        print(f"{tag} {os.path.basename(p)}" + (f"  ({len(warns)} warning{'s' if len(warns) != 1 else ''})" if warns and not errs else ""))
        for e in errs: print(f"     ERROR {e}")
        for w in warns: print(f"     warn  {w}")
        bad += bool(errs)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
