"""Like Water — one rule, two grounds.

The anchor: "Water never tries to go through a rock; it tries to go downward, and the detour
around the rock is simply the form that downwardness takes here."

Two panels from one simulation. Each drop follows one rule, written once in `fall()`: take a
small step in the steepest downhill direction of the ground. The ground is a height function
`ground()`. The right panel adds a mound (the rock) to the ground and changes nothing else.
`fall()` never reads the word rock: it only samples heights, so any bend in a path is the
ground's doing, not a second rule.

Run from this folder:  python3 make.py      (numpy + contourpy; PNG by headless Chrome)
Outputs: like-water.svg, like-water.png, like-water-check.json
"""
import json, math, pathlib, subprocess, sys
import numpy as np
import contourpy

HERE = pathlib.Path(__file__).resolve().parent
SEED = 8                                   # chapter 8; jitters where the drops start, nothing else

# Drafting Table paper inks (copied values, as Enrichment/light-round-2026-11/lib.py line 10)
PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""

# ---- the ground: choices, all of them (named in lines.md) ----
SLOPE = 1.0          # height falls by 1 from top (y=0) to bottom (y=1)
VALLEY = 0.6         # a gentle trough along x = 0.5, so drops drift together as they fall
ROCK = dict(x=0.515, y=0.50, h=0.25, r=0.07)   # a smooth mound; x just off the valley floor, see lines.md


def ground(x, y, rock):
    h = -SLOPE * y + VALLEY * (x - 0.5) ** 2
    if rock:
        h = h + ROCK["h"] * np.exp(-((x - ROCK["x"]) ** 2 + (y - ROCK["y"]) ** 2) / (2 * ROCK["r"] ** 2))
    return h


# ---- the one rule ----
STEP, EPS, MAXSTEPS = 0.003, 1e-4, 2000


def fall(x, y, height):
    """Step downhill, steepest way, a fixed small distance at a time, until the bottom edge.
    `height(x, y)` is all it knows. Returns the path and whether it reached the bottom."""
    path = [(x, y)]
    for _ in range(MAXSTEPS):
        gx = (height(x + EPS, y) - height(x - EPS, y)) / (2 * EPS)
        gy = (height(x, y + EPS) - height(x, y - EPS)) / (2 * EPS)
        n = math.hypot(gx, gy)
        if n < 1e-9:
            return path, False
        x, y = x - STEP * gx / n, y - STEP * gy / n
        path.append((x, y))
        if y >= 1.0:
            return path, True
    return path, False


# ---- drops ----
rng = np.random.default_rng(SEED)
N = 15
starts = [(0.08 + 0.84 * i / (N - 1) + rng.uniform(-0.012, 0.012), 0.0) for i in range(N)]

runs = {}
for rock in (False, True):
    H = lambda x, y, r=rock: float(ground(x, y, r))
    runs[rock] = [fall(x, y, H) for x, y in starts]

# ---- checks a challenger can recompute ----
def bend(path_a, path_b):     # largest gap between the same drop's path on the two grounds, by height y
    ya = np.array([p[1] for p in path_a]); xa = np.array([p[0] for p in path_a])
    yb = np.array([p[1] for p in path_b]); xb = np.array([p[0] for p in path_b])
    ys = np.linspace(0, 0.999, 400)
    return float(np.max(np.abs(np.interp(ys, ya, xa) - np.interp(ys, yb, xb))))

def min_rock_clearance(path):  # closest approach to the rock's centre, in rock radii
    return min(math.hypot(p[0] - ROCK["x"], p[1] - ROCK["y"]) for p in path) / ROCK["r"]

check = {
    "seed": SEED, "drops": N,
    "reached_bottom": {"no rock": sum(ok for _, ok in runs[False]), "a rock": sum(ok for _, ok in runs[True])},
    "bend_per_drop": [round(bend(a[0], b[0]), 4) for a, b in zip(runs[False], runs[True])],
    "closest_to_rock_centre_in_radii": [round(min_rock_clearance(b[0]), 2) for b in runs[True]],
    "end_x": {"no rock": [round(p[-1][0], 3) for p, _ in runs[False]], "a rock": [round(p[-1][0], 3) for p, _ in runs[True]]},
    "rule_names_rock": "ROCK" in (fall.__code__.co_names + fall.__code__.co_varnames),
}

# ---- drawing ----
W, Hh = 1000, 534
PW, PH = 400, 380                     # panel size in px
PANELS = {False: (70, 124), True: (530, 124)}


def to_px(rock, x, y):
    ox, oy = PANELS[rock]
    return ox + x * PW, oy + y * PH


def t(x, y, s, size=16, fill=INK2, anchor="middle", weight=400):
    s = s.replace("&", "&amp;").replace("<", "&lt;")
    return f'<text x="{x:.1f}" y="{y:.1f}" {FONT} font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{s}</text>'


def pathd(pts):
    return "M" + " L".join(f"{a:.1f},{b:.1f}" for a, b in pts)


body = []
gx, gy = np.meshgrid(np.linspace(0, 1, 201), np.linspace(0, 1, 191))
for rock in (False, True):
    ox, oy = PANELS[rock]
    body.append(f'<rect x="{ox}" y="{oy}" width="{PW}" height="{PH}" fill="none" stroke="{RULE}" stroke-width="1"/>')
    # the ground, as contour lines of the very height function the drops read
    Z = ground(gx, gy, rock)
    gen = contourpy.contour_generator(gx, gy, Z)
    for lev in np.arange(-1.0, 0.35, 0.05):
        for line in gen.lines(lev):
            pts = [to_px(rock, a, b) for a, b in line]
            body.append(f'<path d="{pathd(pts)}" fill="none" stroke="{RULE}" stroke-width="0.9"/>')
    if rock:   # the rock's top, shaded where it stands above its surroundings by a quarter of its height
        cx, cy = to_px(rock, ROCK["x"], ROCK["y"])
        rr = ROCK["r"] * math.sqrt(2 * math.log(4)) * PW
        body.append(f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rr:.1f}" ry="{rr * PH / PW:.1f}" fill="{FILL}" stroke="{INK3}" stroke-width="1.2"/>')
    for p, ok in runs[rock]:
        pts = [to_px(rock, a, b) for a, b in p if b <= 1.0]
        body.append(f'<path d="{pathd(pts)}" fill="none" stroke="{INK}" stroke-width="1.6" stroke-linecap="round"/>')
        sx, sy = pts[0]
        body.append(f'<circle cx="{sx:.1f}" cy="{sy:.1f}" r="3" fill="{INK}"/>')
    body.append(t(ox + PW / 2, oy - 14, "a rock" if rock else "no rock", size=20, fill=INK, weight=700))

body.append(t(W / 2, 42, "ONE RULE: STEP DOWNHILL", size=22, fill=INK, weight=700))
body.append(t(W / 2, 68, "the same drops, the same code; only the ground differs", size=15, fill=INK3))
# the downhill arrow between the panels
ax = W / 2
body.append(f'<path d="M{ax},{150} L{ax},{480}" stroke="{INK3}" stroke-width="1.4"/>')
body.append(f'<path d="M{ax - 7},{468} L{ax},{482} L{ax + 7},{468}" fill="none" stroke="{INK3}" stroke-width="1.4"/>')
body.append(f'<text transform="translate({ax - 11},{315}) rotate(-90)" {FONT} font-size="15" fill="{INK3}" text-anchor="middle">downhill</text>')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hh}" width="{W}" height="{Hh}">'
       f'<rect width="{W}" height="{Hh}" fill="{PAPER}"/>' + "".join(body) + "</svg>")
(HERE / "like-water.svg").write_text(svg)

html = HERE / "_raster.html"
html.write_text(f'<!doctype html><meta charset="utf-8"><style>html,body{{margin:0;background:{PAPER}}}</style>{svg}')
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                f"--window-size={W},{Hh}", f"--screenshot={HERE / 'like-water.png'}", html.as_uri()],
               check=True, capture_output=True)
html.unlink()

(HERE / "like-water-check.json").write_text(json.dumps(check, indent=1))
print(json.dumps({k: check[k] for k in ("reached_bottom", "rule_names_rock")}))
print("bend", check["bend_per_drop"])
print("clearance", check["closest_to_rock_centre_in_radii"])
if check["reached_bottom"]["a rock"] < N or check["reached_bottom"]["no rock"] < N or check["rule_names_rock"]:
    sys.exit("a drop stalled, or the rule names the rock")
