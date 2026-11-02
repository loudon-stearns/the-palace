#!/usr/bin/env python3
"""Synth Templates — card → TikZ signal-flow diagram (Technical Diagram Standard, Drafting Table paper palette).

usage: card-to-tikz.py cards/house-bass.yaml   → cards/house-bass.tex
render: pdflatex, then SVG via PyMuPDF and PNG via sips (see workshop/README.md; render.sh's dvisvgm step fails on this Mac)

The layout grammar is fixed so every card reads the same way, like a modular panel:
  every block has its INPUTS as labelled jacks on its LEFT edge and its output on the RIGHT edge;
  sources stack on the left (osc1, osc2, sub, noise) → mix → filter1 → filter2 → amp → fx → out, one audio row;
  modulators sit in a row beneath, each one column LEFT of its usual target, and their wires leave on the right,
  drop to a bus below the audio row's settings text, run along it, and rise in the gutter left of the target into its jack;
  performance inputs (key, vel, wheel, aftertouch) sit along the bottom and route the same way.
Slots the card does not use are drawn ghosted, so the topology stays comparable card to card.
Colour is provenance: essentials in ink, taste in amber (Drafting Table).
"""
import sys, yaml, pathlib

PALETTE = {"ink": "1a1916", "inktwo": "3a3a35", "inkthree": "6a6862", "rule": "b8b09a", "amber": "a8730a", "red": "c8261a", "paper": "f0eee5", "slab": "d8d4c6", "ghost": "cfc9b6"}

COL = 3.8                      # column pitch
W, H = 2.4, 1.6                # block size (cm)
AUDIO_Y = 0.0
SRC_DY = 2.9                   # vertical pitch of the source stack
MOD_Y, PERF_Y = -9.0, -12.5    # modulator row, performance row
BUS_Y, BUS2_Y = -7.1, -11.2     # bus below audio text (for modulators), bus below modulator text (for performance inputs)
SLOTS = {   # slot → (column index, y, label)
    "osc1": (0, AUDIO_Y + SRC_DY, "OSC 1"), "osc2": (0, AUDIO_Y, "OSC 2"), "sub": (0, AUDIO_Y - SRC_DY, "SUB"), "noise": (0, AUDIO_Y - 2*SRC_DY, "NOISE"),
    "mix": (1, AUDIO_Y, "MIX"), "filter1": (2, AUDIO_Y, "FILTER 1"), "filter2": (3, AUDIO_Y, "FILTER 2"), "amp": (4, AUDIO_Y, "AMP"), "fx": (5, AUDIO_Y, "FX"),
    "lfo1": (0, MOD_Y, "LFO 1"), "fenv": (1, MOD_Y, "FILTER ENV"), "menv": (2, MOD_Y, "MOD ENV"), "aenv": (3, MOD_Y, "AMP ENV"), "lfo2": (4, MOD_Y, "LFO 2"),
    "key": (0, PERF_Y, "KEY"), "vel": (1, PERF_Y, "VEL"), "wheel": (2, PERF_Y, "WHEEL"), "at": (3, PERF_Y, "AFTERTOUCH"),
}
OUT_COL = 6
PERF = {"key", "vel", "wheel", "at"}
MODS = {"lfo1", "lfo2", "fenv", "menv", "aenv"}
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

def X(slot): return SLOTS[slot][0] * COL
def Y(slot): return SLOTS[slot][1]
def esc(s): return str(s).replace("&", r"\&").replace("%", r"\%").replace("#", r"\#").replace("_", r"\_").replace("–", "--").replace("—", "---")

def port_y(slot, name, kind):
    ins, _ = PORTS[kind]
    n = len(ins); i = ins.index(name) if name in ins else 0
    top = Y(slot) + H/2 - 0.55          # first jack sits under the title line
    step = (H - 0.75) / max(n - 1, 1) if n > 1 else 0
    return top - i * step

def block_sub(b):
    parts = []
    if "octave" in b: parts.append(f"{int(b['octave']):+d} oct")
    return " · ".join(parts)

def main(path):
    card = yaml.safe_load(open(path))
    blocks = card["graph"]["blocks"]
    used = set(blocks) | {m["from"] for m in card["graph"].get("modulation", []) if m["from"] in PERF}
    kind = {s: blocks.get(s, {}).get("kind", DEFAULT_KIND.get(s)) for s in SLOTS}
    ess, taste = {}, {}
    for e in card.get("essentials", []): ess.setdefault(e["block"], []).append(f"{e['param']} {e['value']}")
    for t in card.get("taste", []): taste.setdefault(t["block"], []).append(f"{t['param']} {t['range']}")
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
  ghost/.style={{rectangle, draw=ghost, line width=0.6pt, dashed, minimum width={W}cm, minimum height={H}cm, inner sep=0pt}},
  perf/.style={{rectangle, draw=ink, line width=0.7pt, minimum width={W}cm, minimum height=0.7cm, inner sep=2pt, font=\footnotesize, text=ink}},
  perfghost/.style={{perf, draw=ghost, text=ghost, dashed, line width=0.5pt}},
  title/.style={{font=\footnotesize\bfseries, text=ink, anchor=north, inner sep=2pt}},
  gtitle/.style={{title, text=ghost, font=\footnotesize}},
  jack/.style={{circle, draw=ink, fill=paper, line width=0.5pt, minimum size=3.2pt, inner sep=0pt}},
  gjack/.style={{jack, draw=ghost}},
  plabel/.style={{font=\tiny, text=inktwo, anchor=west, inner sep=1pt}},
  gplabel/.style={{plabel, text=ghost}},
  olabel/.style={{font=\tiny, text=inktwo, anchor=east, inner sep=1pt}},
  settings/.style={{font=\scriptsize, text=ink, align=left, anchor=north west, inner sep=1pt, text width={W-0.1}cm}},
}}""")
    A(r"\begin{document}\begin{tikzpicture}")
    A(rf"\begin{{scope}}[on background layer]\fill[paper] (-{W/2+1.0},{PERF_Y-1.0}) rectangle ({OUT_COL*COL+W/2+0.9},{AUDIO_Y+SRC_DY+H/2+1.2});\end{{scope}}")
    for slot, (c, y, label) in SLOTS.items():
        x = c * COL
        if slot in PERF:
            A(rf"\node[{'perf' if slot in used else 'perfghost'}] ({slot}) at ({x},{y}) {{{label}}};")
            continue
        on = slot in used
        A(rf"\node[{'block' if on else 'ghost'}] ({slot}) at ({x},{y}) {{}};")
        A(rf"\node[{'title' if on else 'gtitle'}] at ({slot}.north) {{{label}}};")
        ins, outname = PORTS[kind[slot]]
        for name in ins:
            py = port_y(slot, name, kind[slot])
            A(rf"\node[{'jack' if on else 'gjack'}] ({slot}-{name}) at ({x - W/2},{py}) {{}};")
            A(rf"\node[{'plabel' if on else 'gplabel'}] at ({x - W/2 + 0.08},{py}) {{{name}}};")
        A(rf"\node[{'jack' if on else 'gjack'}] ({slot}-out) at ({x + W/2},{y - 0.1}) {{}};")
        if on: A(rf"\node[olabel] at ({x + W/2 - 0.08},{y - 0.1}) {{{outname}}};")
        if on:
            lines = []
            sub = block_sub(blocks.get(slot, {}))
            if sub: lines.append(r"\textbf{" + esc(sub) + "}")
            lines += [r"\textbf{" + esc(t) + "}" for t in ess.get(slot, [])] + [r"\textcolor{amber}{" + esc(t) + "}" for t in taste.get(slot, [])]
            if lines: A(rf"\node[settings] at ({x - W/2 + 0.05},{y - H/2 - 0.12}) {{" + r" \\ ".join(lines) + "};")
    # out jack
    ox = OUT_COL * COL
    A(rf"\node[perf, fill=paper] (out) at ({ox},{AUDIO_Y}) {{OUT}}; \node[jack] (out-in) at ({ox - W/2},{AUDIO_Y}) {{}};")
    # audio wires: out jack → in jack; stacked sources bend in the gutter
    for a, b in card["graph"]["audio"]:
        tgt = "out-in" if b == "out" else f"{b}-in"
        if abs(Y(a) - (AUDIO_Y if b == "out" else Y(b))) < 1e-6:
            A(rf"\draw[wire,->] ({a}-out) -- ({tgt});")
        else:
            A(rf"\draw[wire,->] ({a}-out) -- ({X(a) + W/2 + 0.55},{Y(a)}) |- ({tgt});")
    # modulation wires: east → drop to bus → along bus → up the gutter left of the target → into the jack
    for m in card["graph"].get("modulation", []):
        src = m["from"]; tgt, _, param = m["to"].partition(".")
        ess_route = m.get("essential", True)
        style, col = ("modwire", "ink") if ess_route else ("tastewire", "amber")
        ins, _ = PORTS[kind[tgt]]
        if param not in ins: param = ins[0]
        if param == "gate": style = "gatewire"
        lab = esc(m.get("amount", ""))
        bus = BUS2_Y if src in PERF else BUS_Y
        sx = X(src) + W/2 + (0.45 if src not in PERF else 0.45)
        sy = Y(src)
        gx = X(tgt) - W/2 - 0.55          # gutter riser, just left of the target's jacks
        if tgt in {"osc1", "osc2", "sub", "noise"}: gx = X(tgt) - W/2 - 0.55
        srcpt = f"{src}-out" if src not in PERF else f"{src}.east"
        A(rf"\draw[{style},->] ({srcpt}) -- ({sx},{sy}) -- ({sx},{bus}) -- ({gx},{bus}) -- ({gx},{port_y(tgt, param, kind[tgt])}) -- ({tgt}-{param});")
        if lab: A(rf"\node[font=\tiny, text={col}, anchor=south, inner sep=1pt, rotate=90] at ({gx - 0.12},{(bus + port_y(tgt, param, kind[tgt]))/2}) {{{lab}}};")
    A(rf"\node[anchor=north west, font=\scriptsize, text=inktwo] at (-{W/2+0.8},{AUDIO_Y+SRC_DY+H/2+1.0}) {{\textbf{{{esc(card['name']).upper()}}} · tier {card['tier']} · {esc(card['mode'])} · {esc(card['family'])}}};")
    A(rf"\node[anchor=north east, font=\tiny, text=inkthree] at ({OUT_COL*COL+W/2+0.7},{AUDIO_Y+SRC_DY+H/2+1.0}) {{inputs left, outputs right · audio solid · CV dashed · gate dotted · essentials in ink · taste in amber · ghosted = not used}};")
    A(r"\end{tikzpicture}\end{document}")
    out = pathlib.Path(path).with_suffix(".tex"); out.write_text("\n".join(L) + "\n"); print("wrote", out)

if __name__ == "__main__":
    main(sys.argv[1])
