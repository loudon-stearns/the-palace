#!/usr/bin/env python3
"""Synth Templates — card → TikZ signal-flow diagram (Technical Diagram Standard, Drafting Table paper palette).

usage: card-to-tikz.py cards/house-bass.yaml   → cards/house-bass.tex
render: pdflatex, then SVG via PyMuPDF and PNG via sips (see workshop/README.md; render.sh's dvisvgm step fails on this Mac)

The layout grammar is fixed so every card reads the same way, like a modular panel:
  every block has its INPUTS as labelled jacks on its LEFT edge and its output on the RIGHT edge;
  sources stack on the left (osc1, osc2, sub, noise) → mix → filter1 → filter2 → amp → fx → out, one audio row;
  the audio row starts one column in, so column 0 is free for modulators of the oscillators;
  modulators sit in a row beneath, each in the column BEFORE what it modulates (the standard), and their wires leave on the right,
  drop to a bus below the audio row's settings text, run along it, and rise in the gutter left of the target into its jack;
  performance inputs (key, vel, wheel, aftertouch) sit along the bottom and route the same way.
Only the blocks a card uses are drawn (Loudon, 2026-11-01: a diagram holds only what the preset needs), and the grid
packs around them: the slot ORDER is fixed, the positions are computed per card.
Colour is provenance: essentials in ink, taste in amber (Drafting Table).
Every wire is orthogonal: horizontal and vertical runs only (Loudon, 2026-11-02: avoid angles unless necessary).
"""
import sys, yaml, pathlib

PALETTE = {"ink": "1a1916", "inktwo": "3a3a35", "inkthree": "6a6862", "rule": "b8b09a", "amber": "a8730a", "red": "c8261a", "paper": "f0eee5", "slab": "d8d4c6"}

COL = 4.4                      # column pitch
W, H = 3.0, 1.9                # block size (cm)
AUDIO_Y = 0.0
SRC_DY = 2.9                   # vertical pitch of the source stack
TEXT_H = 1.7                   # room reserved under a block for its settings text
SOURCES = ["osc1", "osc2", "sub", "noise"]
CHAIN   = ["mix", "filter1", "filter2", "amp", "fx"]
MODS    = ["lfo1", "fenv", "menv", "aenv", "lfo2"]
PERFS   = ["key", "vel", "wheel", "at"]
# full names on the sheet (Loudon, 2026-11-02): the student should read the whole word
LABEL = {"osc1": "OSCILLATOR 1", "osc2": "OSCILLATOR 2", "sub": "SUB OSCILLATOR", "noise": "NOISE OSCILLATOR", "mix": "MIXER", "filter1": "FILTER 1", "filter2": "FILTER 2", "amp": "AMPLIFIER", "fx": "EFFECTS",
         "lfo1": "LFO 1", "fenv": "FILTER ENVELOPE", "menv": "MODULATION ENVELOPE", "aenv": "AMPLITUDE ENVELOPE", "lfo2": "LFO 2", "key": "KEYBOARD", "vel": "VELOCITY", "wheel": "MOD WHEEL", "at": "AFTERTOUCH"}
def label_for(slot, blocks):
    """The modulation envelope is named for its role: PITCH ENVELOPE, INDEX ENVELOPE."""
    if slot == "menv" and blocks.get("menv", {}).get("role"): return f"{str(blocks['menv']['role']).upper()} ENVELOPE"
    return LABEL[slot]
PERF = set(PERFS)
POS = {}                       # slot → (x, y), computed per card by layout()
LAYOUT = {}                    # bus heights etc.

def layout(used, modulation, text_lines=None, extra_depth=0.0, audio=()):
    """Pack the grid around the used slots. Sources stack in column 1 centred on the audio row (column 0 is kept for modulators of the oscillators); the chain takes the
    next columns; modulators pack beneath, ordered by the column of their first target; performance inputs along the bottom."""
    POS.clear()
    # an oscillator that feeds another oscillator (fm, sync) and nothing else is a modulator: it goes to column 0, level with its target
    feeds_only = {}
    for e in audio:
        feeds_only.setdefault(e[0], set()).add(e[1])
    modosc = [s for s in SOURCES if s in used and feeds_only.get(s) and feeds_only[s] <= set(SOURCES)]
    srcs = [s for s in SOURCES if s in used and s not in modosc]
    text_lines = text_lines or {}
    src_dy = max(SRC_DY, H + 0.5 + 0.31 * max([text_lines.get(sname, 0) for sname in srcs] + [0]))
    # the audio row starts one column in: column 0 is kept for modulators of the oscillators (Loudon, 2026-11-02)
    for i, sname in enumerate(srcs):
        POS[sname] = (COL, AUDIO_Y + ((len(srcs) - 1) / 2 - i) * src_dy)
    for mo in modosc:
        tgt = next(iter(feeds_only[mo])); POS[mo] = (0.0, POS[tgt][1])
    col = 2 if srcs else 1
    for c in CHAIN:
        if c in used: POS[c] = (col * COL, AUDIO_Y); col += 1
    LAYOUT["out_x"] = col * COL
    nwires = len(modulation)
    low = min([y for (_, y) in POS.values()] + [AUDIO_Y]) - H / 2 - TEXT_H - extra_depth
    LAYOUT["bus"] = low - 0.4
    LAYOUT["lanes"] = 0.11 * nwires
    mod_y = LAYOUT["bus"] - LAYOUT["lanes"] - 0.6 - H / 2
    first_target = {}
    for m in modulation:
        tgt = m["to"].split(".")[0]
        first_target.setdefault(m["from"], POS.get(tgt, (0, 0))[0])
    mods = sorted([m for m in MODS if m in used], key=lambda m: (first_target.get(m, 0), MODS.index(m)))
    taken = set()
    for m in mods:
        want = round(first_target.get(m, COL) / COL) - 1          # the standard: a modulator sits in the column before what it modulates
        c = max(want, 0)
        while c in taken: c += 1                                    # a second modulator on the same target shifts right
        taken.add(c); POS[m] = (c * COL, mod_y)
    LAYOUT["bus2"] = (mod_y - H / 2 - TEXT_H - 0.4) if mods else (LAYOUT["bus"] - 0.6)
    perf_y = LAYOUT["bus2"] - LAYOUT["lanes"] - 0.6 - 0.35
    perfs = [p for p in PERFS if p in used]
    for i, p in enumerate(perfs): POS[p] = (i * COL, perf_y)
    LAYOUT["top"] = max([y for (_, y) in POS.values()] + [AUDIO_Y]) + H / 2 + 1.2
    LAYOUT["bottom"] = (perf_y - 1.0) if perfs else (LAYOUT["bus2"] - 0.6)
    LAYOUT["right"] = LAYOUT["out_x"] + W / 2 + 0.9

def X(slot): return POS[slot][0]
def Y(slot): return POS[slot][1]
def esc(s): return str(s).replace("&", r"\&").replace("%", r"\%").replace("#", r"\#").replace("_", r"\_").replace("–", "--").replace("—", "---")

# standard input jacks per block kind, top to bottom; the output jack name on the right
PORTS = {
    "oscillator": (["pitch", "shape", "sync"], "out"),
    "mixer":      (["in"], "out"),
    "filter":     (["in", "cutoff", "res", "drive"], "out"),
    "amplifier":  (["in", "level", "pan"], "out"),
    "fx":         (["in", "mix"], "out"),
    "envelope":   (["gate", "amount"], "env"),
    "lfo":        (["rate", "depth"], "out"),
}
DEFAULT_KIND = {"osc1": "oscillator", "osc2": "oscillator", "sub": "oscillator", "noise": "oscillator", "mix": "mixer", "filter1": "filter", "filter2": "filter",
                "amp": "amplifier", "fx": "fx", "fenv": "envelope", "aenv": "envelope", "menv": "envelope", "lfo1": "lfo", "lfo2": "lfo"}


INS = {}      # slot → list of input jack names, filled per card (mixer: one per source)
BH = {}       # slot → block height; H unless the slot needs more (the mixer: a jack row and a level row per input)
MIX_ROW = 0.3 # height of one mixer row (a jack row or a level row)
def bh(slot): return BH.get(slot, H)
def mixer_height(n): return max(H, JACK_TOP + 2 * MIX_ROW * n + 0.2)
JACK_TOP = 0.5   # first jack sits this far under the block's top edge; the out jack sits at the same height

def port_y(slot, name, kind=None):
    ins = INS.get(slot) or PORTS[kind][0]
    n = len(ins); i = ins.index(name) if name in ins else 0
    top = Y(slot) + bh(slot)/2 - JACK_TOP
    if slot == "mix": return top - i * 2 * MIX_ROW                      # rows: input 1, level 1, input 2, level 2 …
    step = (bh(slot) - 0.75) / max(n - 1, 1) if n > 1 else 0
    return top - i * step

def block_sub(b):
    parts = []
    if b.get("octave"): parts.append(f"{int(b['octave']):+d} oct")
    return " · ".join(parts)

# ---- glyphs: what is essential about the module, drawn from card fields (schema 0.2) ----------------------
TIME = {"instant": 0.02, "fast": 0.08, "short": 0.2, "medium": 0.4, "slow": 0.6, "long": 0.7, "very slow": 0.85, "very long": 0.9, "gated": 0.1}
LEVEL = {"zero": 0.0, "low": 0.3, "half": 0.5, "held": 0.72, "full": 1.0}

LEVELS = {"off": 0.0, "quarter": 0.25, "little": 0.25, "half": 0.5, "equal to osc1": 1.0, "equal": 1.0, "full": 1.0, "unity": 1.0, "under unity": 0.8, "headroom": 0.8}
def mixer_glyph(ins, level, x, y):
    gx0, gx1, gy0, gy1 = x + 0.05, x + W/2 - 0.12, y - 0.62, y + 0.12
    w = gx1 - gx0; out = []
    n = len(ins); step = (gy1 - gy0) / max(n, 1)
    for i, name in enumerate(ins):
        lv = LEVELS.get(level.get(name, "full"), 0.8)
        yy = gy1 - (i + 0.5) * step
        out.append(rf"\draw[inkthree, line width=0.3pt] ({gx0:.3f},{yy:.3f}) -- ({gx1:.3f},{yy:.3f});")
        out.append(rf"\draw[ink, line width=2.2pt] ({gx0:.3f},{yy:.3f}) -- ({gx0 + w*lv:.3f},{yy:.3f});")
    return "\n".join(out)

def glyph(slot, b, kind, x, y):
    """A small drawing in the block's upper right: GX0..GX1 wide, GY0..GY1 tall, in block-relative cm."""
    gx0, gx1, gy0, gy1 = x + 0.05, x + W/2 - 0.12, y - 0.62, y + 0.12   # right of the jack labels, under the title and the out jack
    w, h = gx1 - gx0, gy1 - gy0
    P = lambda u, v: f"({gx0 + u*w:.3f},{gy0 + v*h:.3f})"
    out = [rf"\begin{{scope}}"]
    cap = None
    if kind == "oscillator":
        wave = str(b.get("wave", "saw")); pw = float(b.get("pw", 0.5)); n = 2
        def cycle(k, dy=0.0, col="ink", lw="0.7pt"):
            u0, u1 = k/n, (k+1)/n
            if wave == "saw":   pts = [P(u0, 0.1+dy), P(u1, 0.9+dy), P(u1, 0.1+dy)]
            elif wave in ("square", "pulse"): pts = [P(u0, 0.9+dy), P(u0+(u1-u0)*pw, 0.9+dy), P(u0+(u1-u0)*pw, 0.1+dy), P(u1, 0.1+dy), P(u1, 0.9+dy)]
            elif wave == "triangle": pts = [P(u0, 0.1+dy), P((u0+u1)/2, 0.9+dy), P(u1, 0.1+dy)]
            elif wave == "sine": return rf"\draw[{col}, line width={lw}] plot[domain={u0:.3f}:{u1:.3f}, samples=24, variable=\u] ({{{gx0:.3f}+\u*{w:.3f}}},{{{gy0:.3f}+({h:.3f})*(0.5+{0.4}*sin(360*(\u*{n}))+{dy})}});"
            elif wave == "noise":
                import random; r = random.Random(7+k); return rf"\draw[{col}, line width={lw}] " + " -- ".join(P(u0+(u1-u0)*i/10, 0.5+0.4*(r.random()*2-1)) for i in range(11)) + ";"
            else: pts = [P(u0, 0.5), P(u1, 0.5)]
            return rf"\draw[{col}, line width={lw}] " + " -- ".join(pts) + ";"
        unison = int(b.get("unison", 1) or 1)
        if unison > 1:
            for dy in (0.08, -0.08): out.append(cycle(0, dy, "inkthree", "0.4pt")); out.append(cycle(1, dy, "inkthree", "0.4pt"))
        for k in range(n): out.append(cycle(k))
        if unison > 1: cap = f"×{unison}" + (f" {b['detune']}" if b.get("detune") else "")
        elif wave in ("square", "pulse") and abs(pw - 0.5) > 0.01: cap = f"pw {int(pw*100)}%"
    elif kind == "filter":
        ftype = str(b.get("type", "lowpass")); slope = int(b.get("slope", 24)); res = str(b.get("resonance", "none"))
        drop = {12: 0.55, 18: 0.7, 24: 0.85, 48: 0.95}.get(slope, 0.85)
        bump = {"none": 0, "clean": 0, "little": 0.15, "moderate": 0.3, "high": 0.45, "self-oscillating": 0.6}.get(res, 0.2)
        top = 0.65
        if ftype == "lowpass":   pts = [P(0, top), P(0.45, top), P(0.52, top + bump), P(0.56, top), P(0.56 + (1-drop)*0.35, 0.08), P(1, 0.08)] if bump else [P(0, top), P(0.5, top), P(0.5 + (1-drop)*0.4, 0.08), P(1, 0.08)]
        elif ftype == "highpass": pts = [P(0, 0.08), P(0.5 - (1-drop)*0.4, 0.08), P(0.5, top), P(1, top)] if not bump else [P(0, 0.08), P(0.44 - (1-drop)*0.35, 0.08), P(0.44, top), P(0.48, top + bump), P(0.55, top), P(1, top)]
        elif ftype == "bandpass": pts = [P(0, 0.08), P(0.35, 0.1), P(0.5, top + bump), P(0.65, 0.1), P(1, 0.08)]
        elif ftype == "notch":    pts = [P(0, top), P(0.4, top), P(0.5, 0.08), P(0.6, top), P(1, top)]
        elif ftype == "comb":     pts = [P(i/8, top if i % 2 == 0 else 0.1) for i in range(9)]
        else: pts = [P(0, top), P(1, top)]
        out.append(r"\draw[inkthree, line width=0.3pt] " + P(0, 0.02) + " -- " + P(1, 0.02) + ";")
        out.append(r"\draw[ink, line width=0.7pt] " + " -- ".join(pts) + ";")
        cap = f"{ftype} {slope} dB"
    elif kind == "envelope":
        sh = b.get("shape", {}); a = TIME.get(str(sh.get("a", "fast")), 0.1); d = TIME.get(str(sh.get("d", "medium")), 0.4)
        sl = LEVEL.get(str(sh.get("s", "held")), 0.7); r = TIME.get(str(sh.get("r", "short")), 0.2)
        hold = 0.25 if sl > 0 else 0.0
        tot = a + d + hold + r; sc = 0.98 / tot
        pts = [P(0.01, 0.08), P(0.01 + a*sc, 0.92), P(0.01 + (a+d)*sc, 0.08 + 0.84*sl), P(0.01 + (a+d+hold)*sc, 0.08 + 0.84*sl), P(0.01 + (a+d+hold+r)*sc, 0.08)]
        out.append(r"\draw[inkthree, line width=0.3pt] " + P(0, 0.08) + " -- " + P(1, 0.08) + ";")
        out.append(r"\draw[ink, line width=0.7pt] " + " -- ".join(pts) + ";")
        if sl > 0: out.append(rf"\draw[inkthree, line width=0.3pt, dotted] " + P(0.01 + (a+d+hold)*sc, 0.08) + " -- " + P(0.01 + (a+d+hold)*sc, 0.08 + 0.84*sl) + ";")
        cap = str(b.get("category", ""))
    elif kind == "lfo":
        wave = str(b.get("wave", "triangle")); n = 2
        if wave == "triangle": pts = [P(k/(2*n), 0.1 if k % 2 == 0 else 0.9) for k in range(2*n+1)]
        elif wave == "square": pts = sum([[P(k/n, 0.9), P((k+0.5)/n, 0.9), P((k+0.5)/n, 0.1), P((k+1)/n, 0.1)] for k in range(n)], [])
        elif wave == "saw": pts = sum([[P(k/n, 0.1), P((k+1)/n, 0.9), P((k+1)/n, 0.1)] for k in range(n)], [])
        elif wave in ("random", "s&h", "sample-hold"):
            import random; rr = random.Random(3); pts = sum([[P(k/6, v), P((k+1)/6, v)] for k, v in [(k, 0.1+0.8*rr.random()) for k in range(6)]], [])
        else: pts = None
        if wave == "sine": out.append(rf"\draw[ink, line width=0.7pt] plot[domain=0:1, samples=40, variable=\u] ({{{gx0:.3f}+\u*{w:.3f}}},{{{gy0:.3f}+({h:.3f})*(0.5+0.4*sin(360*\u*{n}))}});")
        elif pts: out.append(r"\draw[ink, line width=0.7pt] " + " -- ".join(pts) + ";")
        cap = " ".join(str(v) for v in [b.get("rate", ""), "sync" if b.get("sync") else ""] if v)
    elif kind == "fx":
        chain = [str(c) for c in b.get("chain", [])]
        n = max(len(chain), 1); cw = w / n
        for i, fxname in enumerate(chain):
            u0 = i / n; u1 = (i + 1) / n - (0.08 if n > 1 else 0)
            if fxname == "chorus":      # several sines out of phase with each other
                for k, (ph, col, lw) in enumerate([(0, "ink", "0.7pt"), (60, "inktwo", "0.5pt"), (120, "inkthree", "0.5pt")]):
                    out.append(rf"\draw[{col}, line width={lw}] plot[domain={u0:.3f}:{u1:.3f}, samples=30, variable=\u] ({{{gx0:.3f}+\u*{w:.3f}}},{{{gy0:.3f}+({h:.3f})*(0.5+0.38*sin(360*((\u-{u0:.3f})/{(u1-u0):.3f})*2+{ph}))}});")
            elif fxname == "reverb":    # a decaying tail of reflections
                import random; rr = random.Random(11)
                out.append(r"\draw[inkthree, line width=0.3pt] " + P(u0, 0.08) + " -- " + P(u1, 0.08) + ";")
                for j in range(9):
                    uu = u0 + (u1 - u0) * (0.05 + 0.9 * j / 8); hh = 0.85 * (0.92 ** (j * 2.2)) * (0.75 + 0.25 * rr.random())
                    out.append(r"\draw[ink, line width=0.6pt] " + P(uu, 0.08) + " -- " + P(uu, 0.08 + hh) + ";")
            elif fxname in ("delay", "echo"):
                out.append(r"\draw[inkthree, line width=0.3pt] " + P(u0, 0.08) + " -- " + P(u1, 0.08) + ";")
                for j in range(4):
                    uu = u0 + (u1 - u0) * (0.08 + 0.28 * j); out.append(r"\draw[ink, line width=0.9pt] " + P(uu, 0.08) + " -- " + P(uu, 0.08 + 0.84 * (0.6 ** j)) + ";")
            elif fxname in ("saturation", "drive", "distortion", "overdrive"):   # a sine that has been soft-clipped
                out.append(rf"\draw[inkthree, line width=0.3pt] plot[domain={u0:.3f}:{u1:.3f}, samples=30, variable=\u] ({{{gx0:.3f}+\u*{w:.3f}}},{{{gy0:.3f}+({h:.3f})*(0.5+0.42*sin(360*((\u-{u0:.3f})/{(u1-u0):.3f})))}});")
                out.append(rf"\draw[ink, line width=0.7pt] plot[domain={u0:.3f}:{u1:.3f}, samples=40, variable=\u] ({{{gx0:.3f}+\u*{w:.3f}}},{{{gy0:.3f}+({h:.3f})*(0.5+0.3*tanh(3*sin(360*((\u-{u0:.3f})/{(u1-u0):.3f}))))}});")
            elif fxname in ("phaser", "flanger"):
                out.append(rf"\draw[ink, line width=0.7pt] plot[domain={u0:.3f}:{u1:.3f}, samples=40, variable=\u] ({{{gx0:.3f}+\u*{w:.3f}}},{{{gy0:.3f}+({h:.3f})*(0.5+0.4*cos(360*((\u-{u0:.3f})/{(u1-u0):.3f})*3))}});")
            else:
                out.append(rf"\node[font=\tiny, text=inktwo] at ({gx0 + (u0+u1)/2*w:.3f},{gy0 + h/2:.3f}) {{{esc(fxname)}}};")
        if chain: cap = " → ".join(chain)
    elif kind == "amplifier":           # a vertical mixer fader, cap at the level word
        lv = LEVELS.get(str(b.get("level", "full")), 0.8)
        fx_ = gx0 + w * 0.5
        out.append(rf"\draw[ink, line width=1.2pt] ({fx_:.3f},{gy0 + 0.05:.3f}) -- ({fx_:.3f},{gy1 - 0.05:.3f});")
        for j in range(5):
            ty = gy0 + 0.05 + (h - 0.1) * j / 4
            out.append(rf"\draw[inkthree, line width=0.3pt] ({fx_ - 0.22:.3f},{ty:.3f}) -- ({fx_ - 0.1:.3f},{ty:.3f}) ({fx_ + 0.1:.3f},{ty:.3f}) -- ({fx_ + 0.22:.3f},{ty:.3f});")
        cy = gy0 + 0.05 + (h - 0.1) * lv
        out.append(rf"\fill[slab, draw=ink, line width=0.6pt] ({fx_ - 0.17:.3f},{cy - 0.12:.3f}) rectangle ({fx_ + 0.17:.3f},{cy + 0.12:.3f});")
        out.append(rf"\draw[ink, line width=0.5pt] ({fx_ - 0.17:.3f},{cy:.3f}) -- ({fx_ + 0.17:.3f},{cy:.3f});")
        if b.get("level"): cap = f"level {b['level']}"
    if cap: out.append(rf"\node[font=\tiny, text=inktwo, anchor=north west, inner sep=0pt] at ({gx0:.3f},{gy0 - 0.03:.3f}) {{{esc(cap)}}};")
    out.append(r"\end{scope}")
    return "\n".join(out)

def main(path):
    card = yaml.safe_load(open(path))
    blocks = card["graph"]["blocks"]
    used = set(blocks) | {m["from"] for m in card["graph"].get("modulation", []) if m["from"] in PERF}
    ess, taste = {}, {}
    for e in card.get("essentials", []): ess.setdefault(e["block"], []).append(f"{e['param']} {e['value']}")
    for t in card.get("taste", []): taste.setdefault(t["block"], []).append(f"{t['param']} {t['range']}")
    text_lines = {sl: (1 if block_sub(blocks.get(sl, {})) else 0) + len(ess.get(sl, [])) + len(taste.get(sl, [])) for sl in blocks}
    feeds0 = [e[0] for e in card["graph"]["audio"] if e[1] == "mix"]
    layout(used, card["graph"].get("modulation", []), text_lines, extra_depth=max(0.0, mixer_height(len(feeds0)) - H), audio=card["graph"]["audio"])
    kind = {s: blocks.get(s, {}).get("kind", DEFAULT_KIND.get(s)) for s in POS}
    INS.clear()
    for sl in POS:
        if sl in PERF: continue
        INS[sl] = list(PORTS[kind[sl]][0])
    # a jack a route names that the block does not list by default is added (an oscillator's fm or level, say)
    for m in card["graph"].get("modulation", []):
        tgt, _, param = m["to"].partition(".")
        if tgt in INS and param and param not in INS[tgt]: INS[tgt].append(param)
    for e in card["graph"]["audio"]:
        if len(e) == 3 and e[1] in INS and e[2] not in INS[e[1]]: INS[e[1]].append(e[2])
    feeds = [e[0] for e in card["graph"]["audio"] if e[1] == "mix"]
    BH.clear()
    if "mix" in POS and feeds:
        INS["mix"] = feeds
        BH["mix"] = mixer_height(len(feeds))
        POS["mix"] = (X("mix"), AUDIO_Y + H/2 - BH["mix"]/2)
    # level word per mixer input: the taste default or the essential value for that source's `level`, else full
    level = {}
    for t in card.get("taste", []):
        if t["param"] == "level": level[t["block"]] = str(t.get("default", t["range"]))
    for e in card.get("essentials", []):
        if e["param"] == "level": level[e["block"]] = str(e["value"])
    L = []; A = L.append
    A(r"\documentclass[border=8pt]{standalone}")
    A(r"\usepackage[T1]{fontenc}\usepackage{helvet}\renewcommand{\familydefault}{\sfdefault}")
    A(r"\usepackage{tikz}\usetikzlibrary{arrows.meta, positioning, calc, backgrounds}")
    for k, v in PALETTE.items(): A(rf"\definecolor{{{k}}}{{HTML}}{{{v}}}")
    A(rf"""\tikzset{{
  >={{Stealth[length=2.2mm]}},
  wire/.style={{line width=0.8pt, ink}},
  modwire/.style={{line width=0.6pt, dashed, ink}},
  tastewire/.style={{line width=0.6pt, dashed, amber}},
  gatewire/.style={{line width=0.6pt, dotted, ink}},
  block/.style={{rectangle, draw=ink, line width=0.9pt, fill=slab, minimum width={W}cm, minimum height={H}cm, inner sep=0pt}},
  perf/.style={{rectangle, draw=ink, line width=0.7pt, minimum width={W}cm, minimum height=0.7cm, inner sep=2pt, font=\footnotesize, text=ink}},
  title/.style={{font=\scriptsize\bfseries, text=ink, anchor=north, inner sep=2pt}},
  jack/.style={{circle, draw=ink, fill=paper, line width=0.5pt, minimum size=3.2pt, inner sep=0pt}},
  plabel/.style={{font=\tiny, text=inktwo, anchor=west, inner sep=1pt}},
  olabel/.style={{font=\tiny, text=inktwo, anchor=east, inner sep=1pt}},
  settings/.style={{font=\scriptsize, text=ink, align=left, anchor=north west, inner sep=1pt, text width={W-0.1}cm}},
}}""")
    A(r"\begin{document}\begin{tikzpicture}")
    A(rf"\begin{{scope}}[on background layer]\fill[paper] (-{W/2+1.0},{LAYOUT['bottom']}) rectangle ({LAYOUT['right']},{LAYOUT['top']});\end{{scope}}")
    for slot, (x, y) in POS.items():
        label = label_for(slot, blocks)
        if slot in PERF:
            A(rf"\node[perf] ({slot}) at ({x},{y}) {{{label}}};")
            continue
        A(rf"\node[block, minimum height={bh(slot)}cm] ({slot}) at ({x},{y}) {{}};")
        A(rf"\node[title] at ({slot}.north) {{{label}}};")
        ins, outname = INS[slot], PORTS[kind[slot]][1]
        for name in ins:
            py = port_y(slot, name, kind[slot])
            lab = label_for(name, blocks).lower() if slot == "mix" else name
            A(rf"\node[jack] ({slot}-{name}) at ({x - W/2},{py}) {{}};")
            A(rf"\node[plabel] at ({x - W/2 + 0.08},{py}) {{{esc(lab)}}};")
            if slot == "mix":                                        # the level row right under its input
                ly = py - MIX_ROW; lv = LEVELS.get(level.get(name, "full"), 0.8); bx0, bx1 = x - W/2 + 0.3, x + W/2 - 0.85
                A(rf"\draw[inkthree, line width=0.3pt] ({bx0:.3f},{ly:.3f}) -- ({bx1:.3f},{ly:.3f});")
                A(rf"\draw[ink, line width=2.2pt] ({bx0:.3f},{ly:.3f}) -- ({bx0 + (bx1-bx0)*lv:.3f},{ly:.3f});")
                A(rf"\node[font=\tiny, text=inktwo, anchor=west, inner sep=1pt] at ({bx1 + 0.05:.3f},{ly:.3f}) {{{esc(level.get(name, 'full'))}}};")
        oy = y + bh(slot)/2 - JACK_TOP                               # out at the height of the first (audio) input
        A(rf"\node[jack] ({slot}-out) at ({x + W/2},{oy}) {{}};")
        A(rf"\node[olabel] at ({x + W/2 - 0.08},{oy}) {{{outname}}};")
        if slot != "mix": A(glyph(slot, blocks.get(slot, {}), kind[slot], x, y))
        if True:
            lines = []
            sub = block_sub(blocks.get(slot, {}))
            if sub: lines.append(r"\textbf{" + esc(sub) + "}")
            lines += [r"\textbf{" + esc(t) + "}" for t in ess.get(slot, [])] + [r"\textcolor{amber}{" + esc(t) + "}" for t in taste.get(slot, [])]
            if lines: A(rf"\node[settings] at ({x - W/2 + 0.05},{y - bh(slot)/2 - 0.12}) {{" + r" \\ ".join(lines) + "};")
    # out jack
    ox = LAYOUT["out_x"]
    oy = AUDIO_Y + H/2 - JACK_TOP
    A(rf"\node[perf, fill=paper] (out) at ({ox},{oy}) {{OUT}}; \node[jack] (out-in) at ({ox - W/2},{oy}) {{}};")
    # audio wires: out jack → in jack; stacked sources bend in the gutter
    for e in card["graph"]["audio"]:
        a, b = e[0], e[1]; jack = e[2] if len(e) == 3 else None
        tgt = "out-in" if b == "out" else (f"mix-{a}" if b == "mix" else f"{b}-{jack or 'in'}")
        if b == "out" or (not jack and b != "mix" and abs(Y(a) - Y(b)) < 1e-6):
            A(rf"\draw[wire,->] ({a}-out) -- ({tgt});")
        else:
            ay = Y(a) + bh(a)/2 - JACK_TOP
            if jack: ty = port_y(b, jack, kind[b]); A(rf"\draw[wire,->] ({a}-out) -- ({X(b) - W/2 - 0.55},{ay}) -- ({X(b) - W/2 - 0.55},{ty}) -- ({tgt});")
            else: A(rf"\draw[wire,->] ({a}-out) -- ({X(a) + W/2 + 0.55},{ay}) |- ({tgt});")
    # modulation wires: east → drop to bus → along bus → up the gutter left of the target → into the jack
    OFF = 0.11                                                       # spacing between parallel wires
    for k, m in enumerate(card["graph"].get("modulation", [])):
        src = m["from"]; tgt, _, param = m["to"].partition(".")
        ess_route = m.get("essential", True)
        style, col = ("modwire", "ink") if ess_route else ("tastewire", "amber")
        ins, _ = PORTS[kind[tgt]]
        if param not in ins: param = ins[0]
        if param == "gate": style = "gatewire"
        lab = esc(m.get("amount", ""))
        bus = (LAYOUT["bus2"] if src in PERF else LAYOUT["bus"]) - k * OFF   # each wire its own bus lane
        sx = X(src) + W/2 + 0.45 + k * OFF                                   # and its own drop
        sy = Y(src) if src in PERF else Y(src) + bh(src)/2 - JACK_TOP        # leave at the out jack's own height: no diagonals
        gx = X(tgt) - W/2 - 0.55 - k * OFF   # gutter riser, just left of the target's jacks, its own lane
        srcpt = f"{src}-out" if src not in PERF else f"{src}.east"
        ty = port_y(tgt, param, kind[tgt])
        def blocked(x0, x1, yy):
            """Does any block lie across the horizontal run from x0 to x1 at height yy?"""
            for sl, (bx, by) in POS.items():
                if sl in (src, tgt): continue
                hh = 0.35 if sl in PERF else bh(sl) / 2
                if bx - W/2 < max(x0, x1) and bx + W/2 > min(x0, x1) and by - hh < yy < by + hh: return True
            return False
        if gx > sx - 0.2 and not blocked(sx, gx, sy):
            # the gutter lies ahead of the source and the way is clear: out, across, up (or down), in — three turns at most
            A(rf"\draw[{style},->] ({srcpt}) -- ({gx},{sy}) -- ({gx},{ty}) -- ({tgt}-{param});")
            if lab: A(rf"\node[font=\tiny, text={col}, anchor=south, inner sep=1pt, rotate=90] at ({gx - 0.12},{(sy + ty)/2}) {{{lab}}};")
        else:
            # the target is behind or above the source's own column: go round by the bus
            A(rf"\draw[{style},->] ({srcpt}) -- ({sx},{sy}) -- ({sx},{bus}) -- ({gx},{bus}) -- ({gx},{ty}) -- ({tgt}-{param});")
            if lab: A(rf"\node[font=\tiny, text={col}, anchor=south, inner sep=1pt, rotate=90] at ({gx - 0.12},{(bus + ty)/2}) {{{lab}}};")
    A(rf"\node[anchor=north west, font=\scriptsize, text=inktwo] at (-{W/2+0.8},{LAYOUT['top']-0.2}) {{\textbf{{{esc(card['name']).upper()}}} · tier {card['tier']} · {esc(card['mode'])} · {esc(card['family'])}}};")
    A(rf"\node[anchor=north east, font=\tiny, text=inkthree] at ({LAYOUT['right']-0.2},{LAYOUT['top']-0.2}) {{inputs left, outputs right · audio solid · CV dashed · gate dotted · essentials in ink · taste in amber}};")
    A(r"\end{tikzpicture}\end{document}")
    out = pathlib.Path(path).with_suffix(".tex"); out.write_text("\n".join(L) + "\n"); print("wrote", out)

if __name__ == "__main__":
    main(sys.argv[1])
