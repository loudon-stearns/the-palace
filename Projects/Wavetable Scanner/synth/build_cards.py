"""Synth Templates cards → this synth's patches. Writes cards.json, which
build_synth.py bakes into wavetable_synth.html and render_cards.cjs plays in Node.

Every number in a patch comes from a word on the card, read through Synth
Templates' own vocabulary.yaml at build time, so a word means here what it
means on their site. Where the card asks for something this voice does not
have, the patch says so in `not_carried`, in plain words, instead of faking it.

Conversions (the only places this file decides anything):
  resonance  the card's word is a biquad Q; this filter's 0..1 sets k = 2 − 1.96·reso
             and Q = 1/k, so reso = (2 − 1/Q) / 1.96
  amount     an envelope or LFO depth onto Position is the word's octaves ÷ 5
             (the vocabulary's 0..5 octave scale read as 0..1 of the table:
             generous 3.5 → 0.7, full 5 → 1)
  detune     the card's cents are the stack's whole spread; this engine detunes
             each edge copy by ±detune, so detune = cents ÷ 2
  LFO from the start of the table: position = depth ÷ 2, so a bipolar LFO
             sweeps from the first frame to `depth` of the way, not below zero
usage: python3 build_cards.py"""
import base64, json, math
from pathlib import Path
import numpy as np, yaml
HERE = Path(__file__).parent
ST = HERE.parents[1] / "Synth Templates" / "workshop"
V = yaml.safe_load((ST / "vocabulary.yaml").read_text())
FRAME = 1024

def card(i): return yaml.safe_load((ST / "cards" / f"{i}.yaml").read_text())
def blocks(c): return c["graph"]["blocks"]
def taste(c, block, param):
    for t in c.get("taste") or []:
        if t["block"] == block and t["param"] == param: return t["default"]
def route(c, frm, to):
    for m in c["graph"]["modulation"]:
        if m["from"] == frm and m["to"] == to: return m
t = lambda w: V["time"][w]
reso = lambda w: round(min(1, max(0, (2 - 1 / V["resonance"][w]) / 1.96)), 3)
depth = lambda w: round(V["amount"][w] / 5, 3)
NOTE = {n: i for i, n in enumerate("C C# D Eb E F F# G Ab A Bb B".split())}
NOTE.update({"Db": 1, "D#": 3, "Gb": 6, "G#": 8, "A#": 10})
def midi(s): return 12 * (int(s[-1]) + 1) + NOTE[s[:-1]]

# ---- the two tables these cards draw for themselves -----------------------
x = np.arange(FRAME) / FRAME
def additive(amp_of_k, K=400):
    y = np.zeros(FRAME)
    for k in range(1, K + 1):
        a, ph = amp_of_k(k)
        if a: y += a * np.sin(2 * np.pi * k * x + ph)
    return y
sweep4 = [np.sin(2 * np.pi * x),
          additive(lambda k: ((8 / np.pi**2) * (-1) ** ((k - 1) // 2) / k**2, 0) if k % 2 else (0, 0)),
          additive(lambda k: ((4 / np.pi) / k, 0) if k % 2 else (0, 0)),
          additive(lambda k: ((2 / np.pi) * (-1) ** (k + 1) / k, 0))]
# 32 steps of 16 levels, each step 32 samples: the hand-drawn wave of a 4-bit
# wave channel. Two frames, so Position walks between the two shapes the card's
# taste range names (triangle – saw).
steps = np.arange(32)
chip_saw = 15 - (steps * 16 // 32)
chip_tri = np.concatenate([np.arange(16), np.arange(15, -1, -1)])
chip = [np.repeat(s / 7.5 - 1, 32).astype(float) for s in (chip_tri, chip_saw)]
def pack(frames):
    a = np.concatenate([f - f.mean() for f in frames]); a *= 0.99 / np.abs(a).max()
    return base64.b64encode(a.astype("<f4").tobytes()).decode()
TABLES = {
    "sweep4": {"label": "Card table — sine → triangle → square → saw", "frames": 4,
               "frameNames": ["sine", "triangle", "square", "saw"], "data": pack(sweep4)},
    "chip":   {"label": "Card table — 4-bit, 32 steps: triangle → saw", "frames": 2,
               "frameNames": ["4-bit triangle", "4-bit saw"], "data": pack(chip)},
}

# ---- the cards ------------------------------------------------------------
cards = []

c = card("wavetable-scan-lead"); b = blocks(c); me = b["menv"]["shape"]; ae = b["aenv"]["shape"]
lfo_d = depth(route(c, "lfo1", "osc1.shape")["amount"])
beat = 60 / c["render"]["tempo"]; notes = [midi(n) for n in c["render"]["note"]]
ev = [[i * beat, "on", n, c["render"]["velocity"]] for i, n in enumerate(notes)]
ev += [[(i + 0.9) * beat, "off", n] for i, n in enumerate(notes[:-1])] + [[7 * beat, "off", notes[-1]]]
cards.append({"id": c["id"], "name": c["name"], "family": c["family"], "table": "cello",
  "why_table": "the card wants a table ordered dull to bright; the cello table is sorted by brightness",
  "patch": {"mode": 1, "position": round(lfo_d / 2, 3), "envToPos": depth(taste(c, "menv", "amount")),
            "mA": t(me["a"]), "mD": t(taste(c, "menv", "decay")), "mS": V["level"][me["s"]], "mR": t(me["r"]),
            "lfoWave": 1, "lfoRate": V["rate"][b["lfo1"]["rate"]], "lfoToPos": lfo_d,
            "cutoff": V["cutoff"][taste(c, "filter1", "cutoff")], "reso": reso(b["filter1"]["resonance"]), "envToCutoff": 0,
            "aA": t(ae["a"]), "aD": t(ae["d"]), "aS": V["level"][ae["s"]], "aR": t(ae["r"]),
            "unison": 1, "glide": V["glide"][taste(c, "osc1", "glide")], "lfo2ToCutoff": 0, "transpose": 0, "gain": 0.35},
  "not_carried": ["the card's filter is 24 dB per octave; this one is 12 dB, so the top is less dark"],
  "events": ev, "length_s": c["render"]["length_s"]})

c = card("wavetable-position-sweep"); b = blocks(c); ae = b["aenv"]["shape"]
lfo_d = depth(route(c, "lfo1", "osc1.shape")["amount"]); n = midi(c["render"]["note"]); vel = c["render"]["velocity"]
ev = [[0, "set", "position", 0], [0, "set", "lfoToPos", 0], [0, "on", n, vel]]
ev += [[s * 0.05, "cc", 1, round(127 * s / 80)] for s in range(81)]          # the hand: start to end over 4 s
ev += [[4.0, "cc", 1, 0], [4.0, "set", "position", round(lfo_d / 2, 3)], [4.0, "set", "lfoToPos", lfo_d], [4.0, "lfo0"], [8.0, "off", n]]
cards.append({"id": c["id"], "name": c["name"], "family": c["family"], "table": "sweep4",
  "why_table": "the card names its table: sine → triangle → square → saw",
  "patch": {"mode": 1, "position": round(lfo_d / 2, 3), "lfoWave": 1, "lfoRate": V["rate"][b["lfo1"]["rate"]], "lfoToPos": lfo_d,
            "envToPos": 0, "cutoff": V["cutoff"]["open"], "reso": reso(b["filter1"]["resonance"]), "envToCutoff": 0,
            "aA": t(ae["a"]), "aD": t(ae["d"]), "aS": V["level"][ae["s"]], "aR": t(ae["r"]),
            "unison": 1, "glide": 0, "lfo2ToCutoff": 0, "transpose": 0, "gain": 0.35},
  "not_carried": ["the card gives its filter no cutoff, so it is left open (12 kHz)",
                  "at its default depth (generous) the LFO reaches 70 % of the way, short of the saw; the hand sweep, the mod wheel, goes all the way"],
  "events": ev, "length_s": c["render"]["length_s"]})

c = card("wavetable-chip"); b = blocks(c); ae = b["aenv"]["shape"]
beat = 60 / c["render"]["tempo"]; e8 = beat / 2; vel = c["render"]["velocity"]
ev = []
for i, s in enumerate(c["render"]["note"]):
    ln = e8 / 2 if i in (0, 3, 5) else e8 * 0.98
    ev += [[i * e8, "on", midi(s), vel], [i * e8 + ln, "off", midi(s)]]
cards.append({"id": c["id"], "name": c["name"], "family": c["family"], "table": "chip",
  "why_table": "the card's table is drawn by hand, 32 steps of 16 levels; this one is, too, with the triangle the taste range names as its first frame",
  "patch": {"mode": 1, "position": 1, "lfoToPos": 0, "envToPos": 0, "transpose": 12 * b["osc1"]["octave"],
            "cutoff": 20000, "reso": 0, "envToCutoff": 0,
            "aA": t(ae["a"]), "aD": t(ae["d"]), "aS": V["level"][ae["s"]], "aR": t(ae["r"]),
            "velToAmp": 0, "unison": 1, "glide": 0, "lfo2ToCutoff": 0, "gain": 0.35 * V["level"][b["amp"]["level"]]},
  "not_carried": ["no bitcrusher, and none needed: the card's fx stands for the table's 4-bit steps, and here the steps are in the table itself"],
  "events": ev, "length_s": c["render"]["length_s"]})

c = card("evolving-pad"); b = blocks(c); ae = b["aenv"]["shape"]
lfo_d = depth(taste(c, "lfo1", "depth")); beat = 60 / c["render"]["tempo"]; vel = c["render"]["velocity"]
notes = [midi(n) for n in c["render"]["note"]]
ev = [[i * beat, "on", n, vel] for i, n in enumerate(notes)] + [[16 * beat, "off", n] for n in notes]
cards.append({"id": c["id"], "name": c["name"], "family": c["family"], "table": "fm",
  "why_table": "a pad wants a long table that walks without jumps; the FM family chain is 122 frames, each next to its nearest neighbour",
  "patch": {"mode": 0, "position": round(lfo_d / 2, 3), "lfoWave": 1, "lfoRate": V["rate"][taste(c, "lfo1", "rate")], "lfoToPos": lfo_d,
            "envToPos": 0, "unison": b["osc1"]["unison"], "detune": V["detune"][b["osc1"]["detune"]] / 2, "spread": 0.8,
            "lfo2Rate": V["rate"][taste(c, "lfo2", "rate")], "lfo2ToCutoff": V["amount"][taste(c, "lfo2", "depth")],
            "cutoff": V["cutoff"][taste(c, "filter1", "cutoff")], "reso": reso(b["filter1"]["resonance"]), "envToCutoff": 0,
            "aA": t(taste(c, "aenv", "attack")), "aD": t(ae["d"]), "aS": V["level"][ae["s"]], "aR": t(ae["r"]),
            "glide": 0, "transpose": 0, "gain": 0.35 * V["level"][b["amp"]["level"]]},
  "not_carried": ["the second oscillator, a triangle an octave down at a quarter level",
                  "the chorus and the large reverb"],
  "events": ev, "length_s": c["render"]["length_s"]})

for i, why in [("detuned-dubstep-growl", "an FM sine on the stack, distortion and an OTT compressor, and an LFO synced to the beat"),
               ("phase-distortion", "phase distortion is a different oscillator, a bent read of one cosine, not a row of frames"),
               ("phase-distortion-lead", "the same: a phase-distortion oscillator, not a table")]:
    cards.append({"id": i, "name": card(i)["name"], "family": card(i)["family"], "table": None, "patch": None,
                  "not_carried": [f"not playable here yet: {why}"]})

(HERE / "cards.json").write_text(json.dumps({"vocabulary": "Synth Templates workshop/vocabulary.yaml, " + (ST / "vocabulary.yaml").read_text().split("\n")[0][2:60],
                                             "tables": TABLES, "cards": cards}, indent=1))
print("cards.json:", [x["id"] for x in cards if x["patch"]], "· not yet:", [x["id"] for x in cards if not x["patch"]])
