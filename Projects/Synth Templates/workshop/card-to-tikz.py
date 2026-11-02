#!/usr/bin/env python3
"""Synth Templates — card → TikZ signal-flow diagram (Technical Diagram Standard, Drafting Table paper palette).

usage: card-to-tikz.py cards/house-bass.yaml   → cards/house-bass.tex (render with _ops/Technical Diagram Standard/render.sh)

The layout grammar is fixed so every card reads the same:
  sources stack on the left (osc1, osc2, sub, noise) → mix → filter1 → filter2 → amp → fx → out, along one audio row;
  modulators sit in a row beneath (lfo2, lfo1, fenv, menv, aenv), dashed arrows up to their targets;
  performance inputs (key, vel, wheel, at) along the bottom.
Slots the card does not use are drawn ghosted, so the topology stays comparable card to card.
Colour is provenance: essentials in ink, taste in amber, measured in red (Drafting Table).
"""
import sys, yaml, pathlib

PALETTE = {"ink": "1a1916", "inktwo": "3a3a35", "inkthree": "6a6862", "rule": "b8b09a", "amber": "a8730a", "red": "c8261a", "paper": "f0eee5", "slab": "d8d4c6", "ghost": "cfc9b6"}

# slot → (x, y, label)
AUDIO_Y = 0.0
SLOTS = {
    "osc1":    (0.0,  1.9, "OSC 1"),
    "osc2":    (0.0,  0.0, "OSC 2"),
    "sub":     (0.0, -1.9, "SUB"),
    "noise":   (0.0, -3.8, "NOISE"),
    "mix":     (3.6,  AUDIO_Y, "MIX"),
    "filter1": (7.2,  AUDIO_Y, "FILTER 1"),
    "filter2": (10.8, AUDIO_Y, "FILTER 2"),
    "amp":     (14.4, AUDIO_Y, "AMP"),
    "fx":      (18.0, AUDIO_Y, "FX"),
    "lfo2":    (0.0, -6.6, "LFO 2"),
    "lfo1":    (3.6, -6.6, "LFO 1"),
    "fenv":    (7.2, -6.6, "FILTER ENV"),
    "menv":    (10.8, -6.6, "MOD ENV"),
    "aenv":    (14.4, -6.6, "AMP ENV"),
    "key":     (0.0, -9.9, "KEY"),
    "vel":     (3.6, -9.9, "VEL"),
    "wheel":   (7.2, -9.9, "WHEEL"),
    "at":      (10.8, -9.9, "AFTERTOUCH"),
}
OUT_X = 20.8
PERF = {"key", "vel", "wheel", "at"}

def tex_escape(s):
    return str(s).replace("&", r"\&").replace("%", r"\%").replace("#", r"\#").replace("_", r"\_").replace("–", "--").replace("—", "---")

def block_sub(card, slot):
    """Second line inside a block: the defining settings from graph.blocks."""
    b = card["graph"]["blocks"].get(slot, {})
    parts = []
    if "wave" in b: parts.append(b["wave"])
    if "type" in b: parts.append(b["type"])
    if "slope" in b: parts.append(f"{b['slope']} dB")
    if "octave" in b: parts.append(f"{b['octave']:+d} oct")
    if "role" in b and b["kind"] == "envelope": parts.append("")
    return " · ".join(p for p in parts if p)

def main(path):
    card = yaml.safe_load(open(path))
    used = set(card["graph"]["blocks"])
    for m in card["graph"].get("modulation", []):
        if m["from"] in PERF: used.add(m["from"])
    ess = {}
    for e in card.get("essentials", []):
        ess.setdefault(e["block"], []).append(f"{e['param']} {e['value']}")
    taste = {}
    for t in card.get("taste", []):
        taste.setdefault(t["block"], []).append(f"{t['param']} {t['range']}")

    L = []
    A = L.append
    A(r"\documentclass[border=8pt]{standalone}")
    A(r"\usepackage[T1]{fontenc}\usepackage{helvet}\renewcommand{\familydefault}{\sfdefault}")
    A(r"\usepackage{tikz}\usetikzlibrary{shapes.geometric, arrows.meta, positioning, calc, backgrounds}")
    for k, v in PALETTE.items(): A(rf"\definecolor{{{k}}}{{HTML}}{{{v}}}")
    A(r"""\tikzset{
  >={Stealth[length=2.4mm]},
  wire/.style={line width=0.7pt, ink},
  modwire/.style={line width=0.6pt, dashed, ink},
  tastewire/.style={line width=0.6pt, dashed, amber},
  block/.style={rectangle, draw=ink, line width=0.9pt, fill=slab, minimum width=20mm, minimum height=10mm, inner sep=2pt, align=center, font=\footnotesize\bfseries, text=ink},
  ghost/.style={rectangle, draw=ghost, line width=0.6pt, dashed, minimum width=20mm, minimum height=10mm, inner sep=2pt, align=center, font=\footnotesize, text=ghost},
  perf/.style={rectangle, draw=ink, line width=0.7pt, minimum width=20mm, minimum height=7mm, inner sep=2pt, font=\footnotesize, text=ink},
  perfghost/.style={perf, draw=ghost, text=ghost, dashed, line width=0.5pt},
  ess/.style={font=\scriptsize, text=ink, align=left, anchor=north west, inner sep=1pt, text width=2.3cm},
  tst/.style={font=\scriptsize, text=amber, align=left, anchor=north west, inner sep=1pt, text width=2.3cm},
  tap/.style={circle, fill=ink, minimum size=3.4pt, inner sep=0pt},
}""")
    A(r"\begin{document}\begin{tikzpicture}")
    A(r"\begin{scope}[on background layer]\fill[paper] (-1.6,-10.9) rectangle (22.4,3.0);\end{scope}")
    # blocks
    for slot, (x, y, label) in SLOTS.items():
        if slot in PERF:
            style = "perf" if slot in used else "perfghost"
            A(rf"\node[{style}] ({slot}) at ({x},{y}) {{{label}}};")
            continue
        if slot in used:
            sub = tex_escape(block_sub(card, slot))
            body = rf"{label}\\[-1pt]{{\scriptsize\mdseries {sub}}}" if sub else label
            A(rf"\node[block] ({slot}) at ({x},{y}) {{{body}}};")
            # settings under the block: essentials in ink, taste in amber
            lines = [r"\textbf{" + tex_escape(t) + "}" for t in ess.get(slot, [])] + [r"\textcolor{amber}{" + tex_escape(t) + "}" for t in taste.get(slot, [])]
            if lines:
                A(rf"\node[ess] at ({x-1.05},{y-0.66}) {{" + r" \\ ".join(lines) + "};")
        else:
            A(rf"\node[ghost] ({slot}) at ({x},{y}) {{{label}}};")
    A(rf"\node[perf, draw=ink, fill=paper] (out) at ({OUT_X},{AUDIO_Y}) {{OUT}};")
    # audio wires
    for a, b in card["graph"]["audio"]:
        b = "out" if b == "out" else b
        xa, ya = SLOTS[a][0], SLOTS[a][1]
        xb, yb = (OUT_X, AUDIO_Y) if b == "out" else (SLOTS[b][0], SLOTS[b][1])
        if abs(ya - yb) < 1e-6:
            A(rf"\draw[wire,->] ({a}.east) -- ({b}.west);")
        else:
            A(rf"\draw[wire,->] ({a}.east) -- ({xa+1.9},{ya}) |- ({b}.west);")
    # modulation wires: rise on the right-hand side of the blocks (x+1.3) so the settings text column stays clear
    for m in card["graph"].get("modulation", []):
        src = m["from"]; tgt, _, param = m["to"].partition(".")
        ess_route = m.get("essential", True)
        style = "modwire" if ess_route else "tastewire"
        col = "ink" if ess_route else "amber"
        lab = tex_escape(param + (f" ({m['amount']})" if m.get("amount") else ""))
        sx, sy = SLOTS[src][0], SLOTS[src][1]
        tx, ty = SLOTS[tgt][0], SLOTS[tgt][1]
        rx = tx + 1.3  # riser x, just right of the target block
        A(rf"\draw[{style},->] ({src}.east) -- ({sx+1.3},{sy}) -- ({rx},{sy}) -- ({rx},{ty-0.5}) node[pos=1, above right, font=\tiny, text={col}, xshift=-1pt] {{{lab}}} -- ({tgt}.south east);" if abs(sx-tx)>1e-6 else
          rf"\draw[{style},->] ({src}.east) -- ({rx},{sy}) -- ({rx},{ty-0.5}) node[pos=1, right, font=\tiny, text={col}] {{{lab}}} -- ({tgt}.south east);")
    # mode / voices and caption
    mode = tex_escape(card["mode"])
    A(rf"\node[anchor=north west, font=\scriptsize, text=inktwo] at (-1.4,2.8) {{\textbf{{{tex_escape(card['name']).upper()}}} · tier {card['tier']} · {mode} · {tex_escape(card['family'])}}};")
    A(rf"\node[anchor=north east, font=\tiny, text=inkthree] at (22.2,2.8) {{essentials in ink · taste in amber · ghosted = not used}};")
    A(r"\end{tikzpicture}\end{document}")
    out = pathlib.Path(path).with_suffix(".tex")
    out.write_text("\n".join(L) + "\n")
    print("wrote", out)

if __name__ == "__main__":
    main(sys.argv[1])
