"""Marcus Aurelius — light piece, remake: Epictetus, on paper (v2).

One claim, smaller: the boy in Rome and the teacher in Nicopolis were alive together for about
fourteen years, and the boy took up a philosopher's dress in them (at eleven, by the Latin), but what reached Marcus of Epictetus
was notes of his lectures, lent by Rusticus, in a year no source gives. So the notes reach Marcus's
name, in the margin, not a point on his line.

Run from this folder:  python3 make2.py   -> met-on-paper-2.svg, met-on-paper-2.png (headless Chrome, 2x)
Reads only dates-2.json. Every number printed is formatted from it; a label template that carries a
digit of its own, or a date with fewer than two sources, stops the script. No randomness.
"""
import json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
D = json.loads((HERE / "dates-2.json").read_text())
PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono','SF Mono',Menlo,monospace\""
W, H = 1000, 372
Y0, Y1 = D["frame"]
GL, L, R = 40, 270, 950                 # gutter left edge; the axis runs L..R
x = lambda y: L + (y - Y0) * (R - L) / (Y1 - Y0)
E, M, P = D["epictetus"], D["marcus"], D["paper"]

# ---- guards
bad = []
for grp in ("epictetus", "marcus"):
    for k, v in D[grp].items():
        if len(v["src"]) < 2: bad.append(f"{grp}.{k}: fewer than two sources")
        if "lo" in v and v["lo"] > v["hi"]: bad.append(f"{grp}.{k}: lo > hi")
        if re.search(r"\d", re.sub(r"\{\w+\}", "", v.get("label", ""))): bad.append(f"{grp}.{k}: a digit in the label template")
if len(P["src"]) < 2: bad.append("paper: fewer than two sources")
if len(D["column"]["src"]) < 2: bad.append("column: fewer than two sources")
if any(re.search(r"\d", s) for s in D["column"]["label"]): bad.append("column: a digit in the label")
if any(re.search(r"\d", s) for s in P["label"]): bad.append("paper: a digit in the label")
if bad: sys.exit("not drawn: " + "; ".join(bad))
lab = lambda v: v["label"].format(**{k: v[k] for k in ("lo", "hi", "at", "age") if k in v})

body, defs = [], []

def T(xx, yy, s, size=13.5, fill=INK2, anchor="start", weight=400, extra=""):
    s = s.replace("&", "&amp;").replace("<", "&lt;")
    body.append(f'<text x="{xx:.1f}" y="{yy:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" '
                f'font-weight="{weight}" {extra} {FONT}>{s}</text>')

def line(x1, y1, x2, y2, stroke=INK, w=1.0, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    body.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{w}"{d}/>')

def faded_line(lo_in, hi_in, lo_out, hi_out, yy, h, color):
    a, b = x(lo_in), x(hi_out); span = b - a
    st = [(0, 0), ((x(hi_in) - a) / span, 1), ((x(lo_out) - a) / span, 1), (1, 0)]
    defs.append('<linearGradient id="fe" gradientUnits="userSpaceOnUse" x1="%.1f" y1="0" x2="%.1f" y2="0">%s</linearGradient>'
                % (a, b, "".join(f'<stop offset="{o:.4f}" stop-color="{color}" stop-opacity="{p}"/>' for o, p in st)))
    body.append(f'<rect x="{a:.1f}" y="{yy - h / 2:.1f}" width="{span:.1f}" height="{h}" fill="url(#fe)"/>')

def block(lo, hi, yy, color, h=12):
    body.append(f'<rect x="{x(lo):.1f}" y="{yy - h / 2:.1f}" width="{x(hi) - x(lo):.1f}" height="{h}" fill="{color}"/>')

T(GL, 46, "EPICTETUS, ON PAPER", 20, INK, weight=600, extra='letter-spacing="1.5"')

YE, YM = 116, 246
# the years both were alive: Marcus's birth to Epictetus's death (c.)
body.append(f'<rect x="{x(M["born"]["at"]):.1f}" y="{YE:.1f}" width="{x(E["died"]["at"]) - x(M["born"]["at"]):.1f}" '
            f'height="{YM - YE:.1f}" fill="{FILL}" fill-opacity="0.6"/>')
for i, s_ in enumerate(D["column"]["label"]):
    T((x(M["born"]["at"]) + x(E["died"]["at"])) / 2, 168 + i * 16, s_, 11.5, INK2, "middle")

# Epictetus
T(GL, YE + 4, "EPICTETUS", 14.5, INK, weight=600, extra='letter-spacing="1"')
T(GL, YE + 25, E["place"]["label"], 14, INK)
faded_line(E["born"]["lo"], E["born"]["hi"], E["died"]["lo"], E["died"]["hi"], YE, 3, INK)
block(E["notes"]["lo"], E["notes"]["hi"], YE, INK3)
T((x(E["notes"]["lo"]) + x(E["notes"]["hi"])) / 2, YE - 16, lab(E["notes"]), 13.5, INK2, "middle")
T(x(E["died"]["hi"]) + 8, YE + 5, lab(E["died"]), 13.5, INK2)

# Marcus
T(GL, YM + 4, "MARCUS AURELIUS", 14.5, INK, weight=600, extra='letter-spacing="1"')
T(GL, YM + 25, M["place"]["label"], 14, INK)
line(x(M["born"]["at"]), YM, x(M["died"]["at"]), YM, INK, 3.4)
T(x(M["born"]["at"]) - 8, YM + 5, lab(M["born"]), 13.5, INK2, "end")
T(x(M["died"]["at"]) + 6, YM + 5, lab(M["died"]), 13.5, INK2)
block(M["cloak"]["lo"], M["cloak"]["hi"], YM, INK3, 14)
T(x(M["cloak"]["lo"]), YM + 28, lab(M["cloak"]), 13.5, INK2)

# the paper: from the notes, down and out of the years, to Marcus's name, not to a year on his line
xn = (x(E["notes"]["lo"]) + x(E["notes"]["hi"])) / 2
yp = 192
# a curve, not a level line: the notes travel, they do not run back along the years
body.append(f'<path d="M{xn:.1f},{YE + 7:.1f} C{xn:.1f},{yp + 10:.1f} {GL + 300:.1f},{yp:.1f} {GL + 222:.1f},{yp:.1f}" '
            f'fill="none" stroke="{RED}" stroke-width="1.5" stroke-dasharray="3 3"/>')
for i, s in enumerate(P["label"]):
    T(GL + 214, yp - 16 + i * 17, s, 13.5, RED, "end")
line(GL + 60, yp + 30, GL + 60, YM - 18, RED, 1.5, "3 3")
body.append(f'<path d="M{GL + 54:.1f},{YM - 25:.1f} L{GL + 60:.1f},{YM - 15:.1f} L{GL + 66:.1f},{YM - 25:.1f} Z" fill="{RED}"/>')

# axis
ya = 318
line(L, ya, R, ya, RULE, 1)
for yr in range(Y0, Y1 + 1, 10):
    line(x(yr), ya, x(yr), ya + 5, RULE, 1)
    T(x(yr), ya + 19, f"{yr}", 12, INK3, "middle")
T(GL, ya + 19, "years CE", 12, INK3)
T(GL, 362, "A fade or a block: the date is known only roughly. Sources in the notes.", 12, INK3)

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
       f'<defs>{"".join(defs)}</defs><rect width="{W}" height="{H}" fill="{PAPER}"/>' + "".join(body) + "</svg>")
(HERE / "met-on-paper-2.svg").write_text(svg)
html = HERE / "_raster2.html"
html.write_text(f'<!doctype html><meta charset="utf-8"><style>html,body{{margin:0;background:{PAPER}}}</style>{svg}')
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                f"--window-size={W},{H}", f"--screenshot={HERE / 'met-on-paper-2.png'}", html.as_uri()],
               check=True, capture_output=True)
html.unlink()
both = E["died"]["at"] - M["born"]["at"]
words = len(re.findall(r">([^<]+)</text>", svg))
print(f"met-on-paper-2.svg/png · both alive c. {both} years ({M['born']['at']}–c. {E['died']['at']}) · {words} text runs")
