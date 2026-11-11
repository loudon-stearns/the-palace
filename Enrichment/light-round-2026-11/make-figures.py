#!/usr/bin/env python3
"""Light round 2026-11 — the two diagrams and the three pieces drawn from palace data.
Run from this folder: python3 make-figures.py
Paper ground and inks are the Drafting Table tokens (_ops/drafting-table/design-system/colors_and_type.css),
written here by value because an SVG shown as an image cannot link a stylesheet."""
import json, math, os, re, glob
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MAP = os.path.join(ROOT, "_ops/maps/palace-map-full-2026-11-09.json")
PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
CAT = {"concept": "#1a1916", "project": "#c8261a", "practice": "#3a7d2c", "specialist": "#2b5fb0", "meta": "#6a47b8",
       "hub": "#a8730a", "person": "#b3356b"}
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""


def write(name, body, w, h, style=""):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" {FONT}>'
           f'<style>{style}</style><rect width="{w}" height="{h}" fill="{PAPER}"/>{body}</svg>')
    open(os.path.join(HERE, name), "w").write(svg)
    print(name, f"{len(svg)/1024:.0f} KB")


def text(x, y, s, size=13, fill=INK, anchor="start", weight=400, extra=""):
    s = s.replace("&", "&amp;")
    return f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" {extra}>{s}</text>'


# ── Ozu: the 180-degree rule and the 360-degree room ───────────────────────
def ozu():
    W, H, R = 920, 520, 150
    out = []

    def camera(cx, cy, ang, color):
        x, y = cx + R * math.cos(ang), cy + R * math.sin(ang)
        deg = math.degrees(ang) + 180
        return (f'<g transform="translate({x:.1f},{y:.1f}) rotate({deg:.1f})">'
                f'<rect x="-13" y="-8" width="18" height="16" fill="{PAPER}" stroke="{color}" stroke-width="1.6"/>'
                f'<path d="M5,-4 L14,-9 L14,9 L5,4 Z" fill="{color}"/></g>'
                f'<line x1="{x - 24*math.cos(ang):.1f}" y1="{y - 24*math.sin(ang):.1f}" x2="{cx + 46*math.cos(ang):.1f}" '
                f'y2="{cy + 46*math.sin(ang):.1f}" stroke="{color}" stroke-width="0.7" stroke-dasharray="2 4"/>')

    def room(cx, cy):
        g = f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{RULE}" stroke-width="1"/>'
        g += f'<line x1="{cx-R-28}" y1="{cy}" x2="{cx+R+28}" y2="{cy}" stroke="{INK}" stroke-width="1" stroke-dasharray="7 5"/>'
        g += f'<rect x="{cx-13}" y="{cy-20}" width="26" height="40" fill="{FILL}" stroke="{INK}" stroke-width="1.2"/>'  # low table
        for sx in (-1, 1):  # two people, kneeling, facing each other across it
            px = cx + sx * 44
            g += f'<circle cx="{px}" cy="{cy}" r="13" fill="{PAPER}" stroke="{INK}" stroke-width="1.6"/>'
            g += f'<path d="M{px - sx*13},{cy-5} L{px - sx*21},{cy} L{px - sx*13},{cy+5} Z" fill="{INK}"/>'
        return g

    # left: Hollywood
    cx, cy = 235, 275
    out.append(f'<path d="M{cx-R},{cy} A{R},{R} 0 0 0 {cx+R},{cy} Z" fill="{RED}" fill-opacity="0.07"/>')
    out.append(f'<path d="M{cx-R},{cy} A{R},{R} 0 0 1 {cx+R},{cy} Z" fill="url(#hatch)"/>')
    out.append(room(cx, cy))
    for a in (35, 90, 145):
        out.append(camera(cx, cy, math.radians(a), RED))
    out.append(text(cx, 62, "HOLLYWOOD", 15, INK, "middle", 700, 'letter-spacing="3"'))
    out.append(text(cx, 82, "the 180-degree rule", 12, INK3, "middle"))
    out.append(text(cx, cy - 78, "the camera never comes here", 11, INK3, "middle"))
    out.append(text(cx + R + 30, cy - 7, "the axis", 10, INK3, "end"))
    out.append(text(cx, H - 42, "Stay on one side of the line between them", 12, INK2, "middle"))
    out.append(text(cx, H - 24, "and left stays left in every shot.", 12, INK2, "middle"))
    # right: Ozu
    cx = 685
    out.append(room(cx, cy))
    for k in range(8):
        out.append(camera(cx, cy, math.radians(22.5 + 45 * k), RED))
    out.append(text(cx, 62, "OZU", 15, INK, "middle", 700, 'letter-spacing="3"'))
    out.append(text(cx, 82, "the 360-degree room", 12, INK3, "middle"))
    out.append(text(cx, H - 42, "Cross the line whenever the picture wants it:", 12, INK2, "middle"))
    out.append(text(cx, H - 24, "shots join shape to shape, not eye to eye.", 12, INK2, "middle"))
    out.append(f'<line x1="460" y1="50" x2="460" y2="{H-20}" stroke="{RULE}" stroke-width="1"/>')
    defs = (f'<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
            f'<line x1="0" y1="0" x2="0" y2="7" stroke="{RULE}" stroke-width="1"/></pattern></defs>')
    write("Yasujirō Ozu — the 180-degree rule and the 360-degree room.svg", defs + "".join(out), W, H)


# ── Striatum: the prediction-error trace ────────────────────────────────────
def striatum():
    W, H = 920, 560
    x0, x1, cue, rew = 340, 880, 470, 730
    rows = [("A reward out of nowhere", "better than expected", None, +1),
            ("A cue promises it, and it comes", "exactly as expected: nothing to learn", +1, 0),
            ("A cue promises it, and it doesn't", "worse than expected", +1, -1)]
    out = [text(40, 44, "WHAT DOPAMINE REPORTS", 15, INK, weight=700, extra='letter-spacing="3"'),
           text(40, 64, "not the reward, but the surprise", 12, INK3)]
    rng = np.random.default_rng(7)
    for r, (title, verdict, cue_k, rew_k) in enumerate(rows):
        base = 150 + r * 135
        out.append(text(40, base - 34, title, 13, INK, weight=700))
        out.append(text(40, base - 14, verdict, 12, RED if rew_k else INK3))
        out.append(f'<line x1="{x0}" y1="{base}" x2="{x1}" y2="{base}" stroke="{RULE}" stroke-width="1"/>')
        # spikes: a steady background rate, a burst where things go better than predicted, a gap where worse
        x = x0 + 6
        while x < x1 - 4:
            in_cue = bool(cue_k) and 0 <= x - cue < 46
            in_rew = rew_k > 0 and 0 <= x - rew < 46
            if rew_k < 0 and -4 <= x - rew < 70:
                x += 4; continue                              # the pause
            hot = in_cue or in_rew
            out.append(f'<line x1="{x:.1f}" y1="{base}" x2="{x:.1f}" y2="{base-44}" stroke="{RED if hot else INK}" stroke-width="1.5"/>')
            x += rng.uniform(3.2, 5.5) if hot else rng.uniform(15, 31)   # burst, or the steady background rate
        if rew_k < 0:
            out.append(f'<rect x="{rew}" y="{base-48}" width="70" height="48" fill="none" stroke="{RED}" stroke-width="1" stroke-dasharray="3 3"/>')
            out.append(text(rew + 35, base - 54, "silence", 11, RED, "middle"))
        for mx, label, show in ((cue, "cue", cue_k is not None), (rew, "reward" if rew_k >= 0 else "no reward", True)):
            if show:
                out.append(f'<path d="M{mx},{base+5} l-5,9 l10,0 Z" fill="{INK}"/>')
                out.append(text(mx, base + 30, label, 11, INK2, "middle"))
    out.append(text(x1, 64, "each tick is one firing of a dopamine cell; time runs left to right", 11, INK3, "end"))
    out.append(text(40, H - 22, "Schematic, not data. The pattern is the one Schultz, Dayan and Montague reported in 1997.", 11, INK3))
    write("Striatum — what dopamine reports.svg", "".join(out), W, H)


# ── Palace Map: growth rings ────────────────────────────────────────────────
def rings():
    d = json.load(open(MAP))
    pages = []
    for n in d["nodes"]:
        try: head = open(os.path.join(ROOT, n["path"])).read(4000)
        except OSError: continue
        m = re.search(r'^born:\s*"?(\d{4})-(\d{2})(?:-(\d{2}))?', head, re.M)
        if not m: continue
        pages.append(((int(m[1]), int(m[2]), int(m[3] or 15)), n["id"], n["type"]))
    pages.sort()
    N = len(pages); W, H = 920, 900; cx, cy = 400, 440; c = 370 / math.sqrt(N)
    out = []
    # ring boundaries: where one month's births end. 2026 months each get a ring; everything earlier is heartwood.
    marks, last = [], None
    for i, (b, _, _) in enumerate(pages):
        key = (b[0], b[1]) if b[0] >= 2026 else (0, 0)
        if key != last and last is not None: marks.append((i, last))
        last = key
    marks.append((N, last))
    names = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()
    prev = 0; rows_done = []
    for i, key in marks:
        r = c * math.sqrt(i)
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r:.1f}" fill="none" stroke="{RULE}" stroke-width="1"/>')
        label = "before 2026" if key == (0, 0) else f"{names[key[1]-1]} · {i - prev}"
        if key == (0, 0): label += f" · {i}"
        rm = c * (math.sqrt(i) + math.sqrt(prev)) / 2
        dy = 23 * len(rows_done); rows_done.append(key)      # one label row per ring, heartwood level with the centre
        px = cx + math.sqrt(max(0.0, rm * rm - dy * dy))
        out.append(f'<line x1="{px:.1f}" y1="{cy - dy:.1f}" x2="{W-150}" y2="{cy - dy:.1f}" stroke="{INK3}" stroke-width="0.6"/>')
        out.append(f'<circle cx="{px:.1f}" cy="{cy - dy:.1f}" r="1.8" fill="{INK3}"/>')
        out.append(text(W - 144, cy - dy + 4, label, 11, INK2))
        prev = i
    ga = math.pi * (3 - math.sqrt(5))
    for i, (b, title, typ) in enumerate(pages):
        r, a = c * math.sqrt(i + 0.5), i * ga
        out.append(f'<circle cx="{cx + r*math.cos(a):.1f}" cy="{cy + r*math.sin(a):.1f}" r="5.2" fill="{CAT.get(typ, INK3)}"><title>{title.replace('&','&amp;').replace('<','&lt;')} · born {b[0]}-{b[1]:02d}</title></circle>')
    out.append(text(40, 44, "THE PALACE, CUT ACROSS", 15, INK, weight=700, extra='letter-spacing="3"'))
    out.append(text(40, 64, f"{N} pages, oldest at the heart. One dot is one page; one ring is one month of 2026.", 12, INK3))
    lx = 40
    for typ in ("concept", "project", "practice", "specialist", "meta", "hub", "person"):
        out.append(f'<circle cx="{lx+5}" cy="{H-58}" r="5" fill="{CAT[typ]}"/>'); out.append(text(lx + 15, H - 54, typ, 11, INK2)); lx += 28 + 7.2 * len(typ)
    out.append(f'<circle cx="{lx+5}" cy="{H-58}" r="5" fill="{INK3}"/>'); out.append(text(lx + 15, H - 54, "other", 11, INK2))
    out.append(text(40, H - 26, "Drawn from the map build of 2026-11-09, by the birth date each page gives itself. A wide ring was a fat month.", 11, INK3))
    write("Palace Map — growth rings.svg", "".join(out), W, H)
    return N, [(k, i) for i, k in marks]


# ── Meaning and the Link: the nodes fade, the links stay ────────────────────
def links():
    import networkx as nx
    d = json.load(open(MAP))
    ids = {n["id"] for n in d["nodes"]}
    G = nx.Graph(); G.add_nodes_from(ids)
    pairs = [(e["source"], e["target"]) for e in d["edges"] if e["source"] in ids and e["target"] in ids and e["source"] != e["target"]]
    G.add_edges_from(pairs)
    pos = nx.spring_layout(G, k=1.9 / math.sqrt(len(ids)), iterations=220, seed=2014)
    P = np.array([pos[n] for n in ids]); lo, hi = np.percentile(P, 1, axis=0), np.percentile(P, 99, axis=0)
    W, H = 920, 760
    def xy(n):
        p = np.clip((pos[n] - lo) / (hi - lo), -0.03, 1.03)
        return 60 + p[0] * (W - 120), 96 + p[1] * (H - 190)
    edges = "".join(f'<line x1="{xy(a)[0]:.0f}" y1="{xy(a)[1]:.0f}" x2="{xy(b)[0]:.0f}" y2="{xy(b)[1]:.0f}"/>' for a, b in pairs)
    nodes = "".join(f'<circle cx="{xy(n)[0]:.0f}" cy="{xy(n)[1]:.0f}" r="{2.2 + 0.85*math.sqrt(G.degree(n)):.1f}"/>' for n in ids)
    style = ("@keyframes nodes{0%,22%{opacity:1}45%,78%{opacity:0}96%,100%{opacity:1}}"
             "@keyframes links{0%,22%{opacity:.13}45%,78%{opacity:.42}96%,100%{opacity:.13}}"
             "@keyframes a{0%,24%{opacity:1}40%,100%{opacity:0}}@keyframes b{0%,36%{opacity:0}46%,78%{opacity:1}90%,100%{opacity:0}}"
             ".n{animation:nodes 14s ease-in-out infinite}.e{animation:links 14s ease-in-out infinite}"
             ".ta{animation:a 14s ease-in-out infinite}.tb{animation:b 14s ease-in-out infinite;opacity:0}")
    body = (f'<g class="e" stroke="{INK}" stroke-width="0.7" opacity=".13">{edges}</g>'
            f'<g class="n" fill="{INK}" stroke="{PAPER}" stroke-width="1">{nodes}</g>'
            + text(40, 44, "THE NODE IS A CONVENIENCE", 15, INK, weight=700, extra='letter-spacing="3"')
            + text(40, 64, f"{len(ids)} pages and the {len(pairs):,} links between them.", 12, INK3, extra='class="ta"')
            + text(40, 64, "Take the pages away. Every one is still there, as the place its links meet.", 12, RED, extra='class="tb"')
            + text(40, H - 24, "The palace's own map, build of 2026-11-09. Positions are a layout's choice; the links are real.", 11, INK3))
    write("Meaning and the Link — the nodes fade, the links stay.svg", body, W, H, style)
    return len(ids), len(pairs)


# ── Objects to Think With: the field of projects, the lit ones ──────────────
def objects():
    from PIL import Image, ImageDraw, ImageFont, ImageOps
    declared = ["Blood Compressor", "Compressor Design", "2D Torus Wavetable Synthesizer", "Action Potential Oscillator"]
    waiting = ["Haptic Handwheel", "Portamento and Physical Pitch Modeling", "Floquet Time-Modulated Loops", "Waveguide Synthesizer",
               "Tract Mirror", "Murmuration", "Frequency-Time Duality", "Shepard Tone Synthesizer", "Retrospective Delay",
               "Semantic Webcam", "Quantum Synthesizer", "Inharmonic Wavetable Synthesis", "Neural Granular Synthesis",
               "Piano String Inharmonicity", "Crystal Synthesizer", "Particle Synthesis", "Slime Mold Delay", "Bayesian Granular Synthesizer"]
    titles = sorted(os.path.basename(p)[:-3] for p in glob.glob(os.path.join(ROOT, "Projects", "*.md")))
    have = [t for t in titles if os.path.exists(os.path.join(ROOT, "Projects", t, f"{t} — icon.png"))]
    missing = [t for t in declared + waiting if t not in have]
    S, G, cols = 112, 14, 11
    rows = math.ceil(len(have) / cols); W = cols * (S + G) + G + 40; H = rows * (S + G) + G + 150
    paper = tuple(int(PAPER[i:i + 2], 16) for i in (1, 3, 5)); red = (200, 38, 26); ink = (26, 25, 22)
    im = Image.new("RGB", (W, H), paper); dr = ImageDraw.Draw(im)
    def font(sz, bold=False):
        for f in ("/System/Library/Fonts/Menlo.ttc",):
            try: return ImageFont.truetype(f, sz, index=1 if bold else 0)
            except OSError: pass
        return ImageFont.load_default()
    dr.text((20 + G, 26), "O B J E C T S   T O   T H I N K   W I T H", font=font(22, True), fill=ink)
    lit_n = 0
    for i, t in enumerate(have):
        x, y = 20 + G + (i % cols) * (S + G), 84 + (i // cols) * (S + G)
        ic = Image.open(os.path.join(ROOT, "Projects", t, f"{t} — icon.png")).convert("RGB").resize((S, S), Image.LANCZOS)
        if t in declared or t in waiting:
            lit_n += 1; im.paste(ic, (x, y))
            dr.rectangle([x - 3, y - 3, x + S + 2, y + S + 2], outline=red if t in declared else ink, width=4 if t in declared else 2)
        else:
            grey = ImageOps.grayscale(ic).convert("RGB")
            im.paste(Image.blend(grey, Image.new("RGB", (S, S), paper), 0.78), (x, y))
    y = 84 + rows * (S + G) + 8
    dr.text((20 + G, y), f"{lit_n} of the {len(have)} pages in Projects/ are lit: each one is an idea given a body you can handle.", font=font(15), fill=ink)
    dr.text((20 + G, y + 24), "Red frame: the four whose own page already says so. Counted 2026-10-25, on the looser bar.", font=font(13), fill=(106, 104, 98))
    im.save(os.path.join(HERE, "Objects to Think With — the lit ones.png"), optimize=True)
    print("objects:", len(have), "icons,", lit_n, "lit, missing:", missing, "no icon:", [t for t in titles if t not in have])


if __name__ == "__main__":
    ozu(); striatum(); print(rings()); print(links()); objects()
