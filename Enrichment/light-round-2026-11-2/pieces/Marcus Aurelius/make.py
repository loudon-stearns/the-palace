"""Marcus Aurelius — light piece: Epictetus, on paper.

Two lives on one line of years, 50 to 195 CE: Epictetus's and Marcus's, with the plague, the northern
war and the writing of the Meditations under Marcus's. Every date comes from dates.json, where each one
names its sources; an uncertain date is drawn with a soft end across its range, never as a sharp tick.

Run from this folder:  python3 make.py      -> met-on-paper.svg, met-on-paper.png (headless Chrome, 2x)
No randomness (seed 0 in jobs.json is nominal).
"""
import json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
D = json.loads((HERE / "dates.json").read_text())
PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono','SF Mono',Menlo,monospace\""
W, H = 1000, 540
Y0, Y1 = 50, 195                       # the frame, in years CE
L, R = 70, 950
x = lambda y: L + (y - Y0) * (R - L) / (Y1 - Y0)

# --- checks before drawing: every drawn date has two sources, and each uncertain range is ordered
def walk():
    for grp in ("epictetus", "marcus", "bands"):
        for k, v in D[grp].items(): yield grp, k, v
bad = [f"{g}.{k}" for g, k, v in walk() if len(v["src"]) < 2]
bad += [f"{g}.{k} lo>hi" for g, k, v in walk() if "lo" in v and v["lo"] > v["hi"]]
if bad: sys.exit("not drawn, sources or ranges wrong: " + ", ".join(bad))

E, M, B = D["epictetus"], D["marcus"], D["bands"]
body, defs = [], []
gid = [0]

def T(xx, yy, s, size=12, fill=INK2, anchor="start", weight=400, style=""):
    s = s.replace("&", "&amp;").replace("<", "&lt;")
    body.append(f'<text x="{xx:.1f}" y="{yy:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" '
                f'font-weight="{weight}" {style} {FONT}>{s}</text>')

def line(x1, y1, x2, y2, stroke=INK, w=1.0, dash=None, op=1.0):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    body.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" '
                f'stroke-width="{w}" stroke-opacity="{op}"{d}/>')

def soft_bar(lo_in, hi_in, lo_out, hi_out, yy, h, color, op=1.0):
    """A bar solid from hi_in to lo_out; fading in across [lo_in, hi_in] and out across [lo_out, hi_out]."""
    gid[0] += 1; g = f"g{gid[0]}"
    a, b = x(lo_in), x(hi_out)
    span = max(b - a, 1e-6)
    stops = [(0, 0)]
    stops.append(((x(hi_in) - a) / span, op))
    stops.append(((x(lo_out) - a) / span, op))
    stops.append((1, 0 if hi_out > lo_out else op))
    st = "".join(f'<stop offset="{o:.4f}" stop-color="{color}" stop-opacity="{p}"/>' for o, p in stops)
    defs.append(f'<linearGradient id="{g}" gradientUnits="userSpaceOnUse" x1="{a:.1f}" y1="0" x2="{b:.1f}" y2="0">{st}</linearGradient>')
    body.append(f'<rect x="{a:.1f}" y="{yy - h / 2:.1f}" width="{span:.1f}" height="{h}" fill="url(#{g})"/>')

def dot(year, yy, r=3.6, fill=INK):
    body.append(f'<circle cx="{x(year):.1f}" cy="{yy:.1f}" r="{r}" fill="{fill}"/>')

def range_mark(lo, hi, yy, color=INK3, h=8):
    """An uncertain date: a flat bar across its whole range, no dot, so no one year inside it looks chosen."""
    body.append(f'<rect x="{x(lo):.1f}" y="{yy - h / 2:.1f}" width="{max(x(hi) - x(lo), 3):.1f}" height="{h}" fill="{color}" fill-opacity="0.8"/>')

# ---------------------------------------------------------------- head
T(L, 40, "EPICTETUS, ON PAPER", 20, INK, weight=600, style='letter-spacing="1.5"')
GAP = M["turn"]["lo"] - E["died"]["at"]                 # 146 - 135
T(L, 62, f"Epictetus died around {E['died']['at']}. Marcus turned to philosophy at twenty-five, in 146 or 147,", 12.5, INK3)
T(L, 80, "and came to know Epictetus through notes of his lectures.", 12.5, INK3)

YE, YM = 170, 330                       # the two lifelines

# the years both were alive: a faint column, with the note that answers the false reading
body.append(f'<rect x="{x(121):.1f}" y="{YE:.1f}" width="{x(135) - x(121):.1f}" height="{YM - YE:.1f}" fill="{FILL}" fill-opacity="0.55"/>')
T(x(128), 222, "121–135: Marcus a boy in Rome,", 11, INK3, "middle")
T(x(128), 236, "Epictetus teaching in Greece", 11, INK3, "middle")

# ---------------------------------------------------------------- Epictetus
T(L, 128, "EPICTETUS", 13, INK, weight=600, style='letter-spacing="1"')
soft_bar(E["born"]["lo"], E["born"]["hi"], E["died"]["lo"], E["died"]["hi"], YE, 2.4, INK)
T(L, 194, "born c. 50s, Hierapolis · a slave, later freed", 11.5, INK2)
range_mark(E["banished"]["lo"], E["banished"]["hi"], YE)
T(x(E["banished"]["lo"]) - 4, 152, "c. 89 · banished from Italy; teaches at Nicopolis, Greece", 11.5, INK2)
range_mark(E["arrian"]["lo"], E["arrian"]["hi"], YE)
T(x(E["arrian"]["hi"]) + 6, 194, "c. 104–108 · Arrian writes down his lectures", 11.5, INK2)
T(x(E["died"]["hi"]) + 8, YE + 4, "dies c. 135, Nicopolis", 11.5, INK2)

# ---------------------------------------------------------------- the paper: from Arrian's notes to Marcus, undated
ya = 292
xa = (x(E["arrian"]["lo"]) + x(E["arrian"]["hi"])) / 2
xt = (x(M["turn"]["lo"]) + x(M["turn"]["hi"])) / 2
line(xa, YE + 6, xa, ya, INK3, 1.1, "2 3")
line(xa, ya, xa + 10, ya, INK3, 1.1, "2 3")             # it stops at the words: the year it reached Marcus is not recorded
T(xa + 14, ya + 4, "Epictetus's lectures reach Marcus on paper, via Rusticus · year unknown", 11.5, INK)

# the gap between the two
yg = 262
g0, g1 = E["died"]["at"], M["turn"]["lo"]
line(x(g0), yg, x(g1), yg, INK3, 1)
line(x(g0), yg - 4, x(g0), yg + 4, INK3, 1); line(x(g1), yg - 4, x(g1), yg + 4, INK3, 1)
T((x(g0) + x(g1)) / 2, yg - 6, f"c. {GAP} yrs", 10.5, INK3, "middle")

# ---------------------------------------------------------------- Marcus
T(L, YM + 4, "MARCUS AURELIUS", 13, INK, weight=600, style='letter-spacing="1"')
line(x(M["born"]["at"]), YM, x(M["died"]["at"]), YM, INK, 3.2)
for k in ("born", "adopted", "emperor", "lyon", "died"): dot(M[k]["at"], YM)
range_mark(M["turn"]["lo"], M["turn"]["hi"], YM, RED, 12)
T(x(121) - 8, YM + 4, "121 born, Rome", 11.5, INK2, "end")
T(x(138) + 2, YM + 22, "138 adopted", 11.5, INK2, "end")
T(x(M["turn"]["lo"]) - 2, YM + 22, "c. 146 · at 25, turns to philosophy", 11.5, RED)
line(x(161), YM - 4, x(161), YM - 14, INK3, 0.8); T(x(161) - 2, YM - 18, "161 emperor", 11.5, INK2)
line(x(177), YM - 4, x(177), YM - 14, INK3, 0.8); T(x(177) - 2, YM - 18, "177 martyrs at Lyon", 11.5, INK2)
T(x(180) + 8, YM + 4, "dies 180", 11.5, INK2)

# ---------------------------------------------------------------- under Marcus: the plague, the war, the book
yb = [384, 406, 428]
p, w, m = B["plague"], B["wars"], B["meds"]
soft_bar(p["lo"], p["hi"], 180, 180, yb[0], 11, INK3, 0.55)
soft_bar(180, 180, 182, 192, yb[0], 11, INK3, 0.28)              # it outlived him: outbreaks in 182 and 189
T(x(p["lo"]) - 6, yb[0] + 4, "the Antonine plague", 11.5, INK2, "end")
T(x(180) + 6, yb[0] - 10, "outbreaks to 189", 10, INK3)
soft_bar(w["lo"], w["hi"], w["to"], w["to"], yb[1], 11, INK3, 0.55)
T(x(w["lo"]) - 6, yb[1] + 4, "war on the northern frontier", 11.5, INK2, "end")
soft_bar(m["lo"], 172, 177, m["hi"], yb[2], 11, RED, 0.9)
T(x(m["lo"]) - 6, yb[2] + 4, "the Meditations, written on campaign", 11.5, RED, "end")
line(x(180), YM + 30, x(180), yb[2] + 8, INK3, 0.8, "1 2")             # where his line ends, down through the bands

# ---------------------------------------------------------------- axis
ya2 = 468
line(L, ya2, R, ya2, RULE, 1)
for yr in range(50, 196, 10):
    line(x(yr), ya2, x(yr), ya2 + 5, RULE, 1)
    T(x(yr), ya2 + 18, f"{yr}", 10.5, INK3, "middle")
T(R, ya2 + 18, "CE", 10.5, INK3, "start", style='dx="6"')
T(L, 520, "A soft end or a block: the date is known only roughly. Sources for every date are in the notes.", 10.5, INK3)

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
       f'<defs>{"".join(defs)}</defs><rect width="{W}" height="{H}" fill="{PAPER}"/>' + "".join(body) + "</svg>")
(HERE / "met-on-paper.svg").write_text(svg)

html = HERE / "_raster.html"
html.write_text(f'<!doctype html><meta charset="utf-8"><style>html,body{{margin:0;background:{PAPER}}}</style>{svg}')
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                f"--window-size={W},{H}", f"--screenshot={HERE / 'met-on-paper.png'}", html.as_uri()],
               check=True, capture_output=True)
html.unlink()
print("met-on-paper.svg, met-on-paper.png", "· gap c.", GAP, "years · every date has ≥2 sources")
