"""The back-row test, turned into what the back row sees and one report page.
Reads measure.json and zoom.json (from measure.mjs and zoom.mjs), converts every label's on-screen cap height into
the angle it makes at the back of the room, simulates the view by resampling the projector frames to the eye's
resolution, and writes back-row-report.html (standalone, images inline) plus the simulation PNGs.
Run: /usr/local/bin/python3 "Projects/Rational Hearing/back-row/visual.py"
Room model: the back row sits k screen-heights from the screen (k = 6 a small classroom, 8 the usual far limit).
Thresholds, recalled not looked up: a 20/20 letter subtends 5 arcmin (Snellen); ~10 arcmin reads; 16+ is comfortable.
The eye simulation is an area resample to 1 (20/20) or 2 (20/40) arcmin per pixel: an illustration, not an optics model."""
import json, math, base64, io, html
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw
HERE = Path(__file__).parent
M = json.loads((HERE / "measure.json").read_text()); Z = json.loads((HERE / "zoom.json").read_text())
def screen_arcmin(k): return 2 * math.degrees(math.atan(1 / (2 * k))) * 60
def ang(px, h, k): return px * screen_arcmin(k) / h

def sim(src, k, acuity, crop=None):
    im = Image.open(HERE / src).convert("RGB"); W, H = im.size
    n = max(2, round(screen_arcmin(k) / acuity))           # resolvable rows across the screen's height
    lo = im.resize((round(W * n / H), n), Image.BOX).filter(ImageFilter.GaussianBlur(0.5))
    out = lo.resize((W, H), Image.BICUBIC)
    return out.crop(crop) if crop else out
def jpg(im, q=82):
    b = io.BytesIO(); im.save(b, "JPEG", quality=q); return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()

# the views: ladder and temper strip, 1280×720, Projector mode, as the front row, the back row (20/20), the back row (20/40)
LADDER = (0, 60, 440, 650); TEMPER_CROP = None
views = []
for name, frame, crop in [("ladder", "frame-1280x720-on-s1.png", LADDER),
                          ("temper ×1", "frame-1280x720-on-s3.png", None),
                          ("temper ×5", "frame-1280x720-on-x5-s3.png", None)]:
    front = Image.open(HERE / frame).convert("RGB"); front = front.crop(crop) if crop else front
    b20 = sim(frame, 8, 1.0, crop); b40 = sim(frame, 8, 2.0, crop)
    slug = name.replace(" ", "-").replace("×", "x")
    b20.save(HERE / f"backrow-{slug}-2020.png"); b40.save(HERE / f"backrow-{slug}-2040.png")
    # one side-by-side strip per view, for the board
    w, h = front.size; strip = Image.new("RGB", (w * 3 + 40, h + 34), (240, 237, 228)); d = ImageDraw.Draw(strip)
    for i, (im, lab) in enumerate([(front, "FRONT ROW"), (b20, "BACK ROW, 8 SCREEN-HEIGHTS, 20/20"), (b40, "SAME SEAT, 20/40")]):
        strip.paste(im, (i * (w + 20), 34)); d.text((i * (w + 20) + 4, 10), lab, fill=(40, 40, 40))
    strip.save(HERE / f"backrow-{slug}-strip.png")
    views.append((name, jpg(front), jpg(b20), jpg(b40)))

# the table: every label group, its smallest member, at 1280×720 and 1920×1080, Projector mode on
GROUPS = ["readout: big ratio", "ladder numerals", "temper: interval names", "temper: ratios", "temper: cents deviation",
          "readout: n × f = Hz lines", "ladder edge labels (P5, M3…)", "bracket column (class words, short names)",
          "ladder letter names", "temper: keys and captions", "body text", "buttons"]
def run(w, p, m=1): return next(r for r in M["runs"] if r["screen"] == [w, 720 if w == 1280 else 1080 if w == 1920 else 768] and r["present"] == p and r["magnify"] == m)
def mins(r):
    g = {}
    for x in r["rows"]: g[x["g"]] = min(g.get(x["g"], 1e9), x["cap_px"])
    return g
def band(a): return ("ok", "comfortable") if a >= 16 else ("ok", "reads") if a >= 10 else ("warn", "strains") if a >= 5 else ("bad", "below 20/20")
rows = []; R7 = mins(run(1280, "on")); R10 = mins(run(1920, "on")); R7off = mins(run(1280, "off"))
for g in GROUPS:
    a7, a10 = ang(R7[g], 720, 8), ang(R10[g], 1080, 8)
    rows.append((g, R7off[g], R7[g], a7, ang(R7[g], 720, 6), a10, band(a7)))

# the gaps: drawn just-vs-equal offsets, at the back row, 1280×720
G1 = {x["short"]: x["gap_px"] for x in run(1280, "on", 1)["gaps"]}; G5 = {x["short"]: x["gap_px"] for x in run(1280, "on", 5)["gaps"]}
DEV = {x["short"]: x["dev"] for x in run(1280, "on", 1)["gaps"]}
gaps = [(s, DEV[s], G1[s], ang(G1[s], 720, 8), G5[s], ang(G5[s], 720, 8)) for s in G1 if s not in ("U", "0")]

summary = {"room": "back row at 8 screen-heights; 1280×720 unless named", "groups": [
    {"group": g, "cap_px_normal": a, "cap_px_projector": b, "arcmin_8H_720p": round(c, 1), "arcmin_6H_720p": round(d, 1), "arcmin_8H_1080p": round(e, 1)} for g, a, b, c, d, e, _ in rows],
    "gaps": [{"interval": s, "deviation": dv, "gap_px_x1": a, "arcmin_x1": round(b, 2), "gap_px_x5": c, "arcmin_x5": round(d, 2)} for s, dv, a, b, c, d in gaps],
    "zoom": [{"zoom": z["zoom"], "edge_label_cap_px": z["edge_cap_px"], "arcmin_8H": round(ang(z["edge_cap_px"], 720, 8), 1)} for z in Z]}
(HERE / "back-row.json").write_text(json.dumps(summary, indent=1, ensure_ascii=False))

# the report
e = html.escape
trs = "".join(f'<tr class="{b[0]}"><td>{e(g)}</td><td>{a:.1f}</td><td>{p:.1f}</td><td><b>{c:.1f}′</b></td><td>{d:.1f}′</td><td>{x:.1f}′</td><td>{b[1]}</td></tr>' for g, a, p, c, d, x, b in rows)
gtr = "".join(f'<tr class="{"bad" if b < 2 else "warn" if b < 4 else "ok"}"><td>{e(s)}</td><td>{e(dv)}</td><td>{a:.1f}</td><td><b>{b:.1f}′</b></td><td>{c:.1f}</td><td><b>{d:.1f}′</b></td></tr>' for s, dv, a, b, c, d in gaps)
ztr = "".join(f'<tr><td>{int(z["zoom"]*100)}%</td><td>{z["edge_cap_px"]:.1f}</td><td>{ang(z["edge_cap_px"],720,8):.1f}′</td></tr>' for z in Z)
vis = "".join(f'<figure><figcaption>{e(n)} · 1280×720 · Projector mode</figcaption><div class="trio"><div><span>front row</span><img src="{a}"></div><div><span>back row · 20/20</span><img src="{b}"></div><div><span>back row · 20/40</span><img src="{c}"></div></div></figure>' for n, a, b, c in views)
edge7 = ang(R7["ladder edge labels (P5, M3…)"], 720, 8)
page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Rational Hearing — the back-row test, measured</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{{--ground:#f0ede4;--ink:#1c1b18;--ink2:#5b5850;--rule:#b9b4a6;--blue:#2f5fae;--amber:#a8700a;--red:#c8281e}}
body{{margin:0;background:var(--ground);color:var(--ink);font:14px/21px ui-monospace,"JetBrains Mono",Menlo,monospace;padding:24px;max-width:1180px}}
h1{{font-size:22px;letter-spacing:.04em;text-transform:uppercase;margin:0}} h2{{font-size:16px;margin:28px 0 6px}}
.eyebrow,figcaption,th{{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink2)}}
p{{max-width:84ch;margin:6px 0}} .lede{{color:var(--ink2)}}
table{{border-collapse:collapse;margin:8px 0}} td,th{{border-bottom:1px solid var(--rule);padding:4px 10px;text-align:left}}
tr.bad td{{color:var(--red)}} tr.warn td{{color:var(--amber)}}
.trio{{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}} .trio img{{width:100%;border:1px solid var(--rule);display:block}}
.trio span{{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink2)}}
figure{{margin:16px 0}} .box{{border:1.5px solid var(--ink);padding:10px 14px;margin:14px 0}}
.check li{{margin:4px 0}} .check li::marker{{content:"☐  "}}
@media print{{body{{padding:0}} figure{{break-inside:avoid}}}}
</style></head><body>
<div class="eyebrow">Rational Hearing · back-row test, measured before the room · {M["measured"][:10]}</div>
<h1>What the back row can read</h1>
<p class="lede">The page was opened in a browser at three projector sizes, and every label on it was measured. The back row is taken as 8 screen-heights from the screen; a small classroom is nearer 6. The rule of thumb: a letter 5 arcminutes tall is the smallest a 20/20 eye can read, about 10 reads, and 16 or more is comfortable. These thresholds are from memory, not looked up. Your room test confirms or overturns all of it.</p>

<div class="box"><b>Three findings.</b>
<p>1. <b>The anchors you point at are the smallest things on the page.</b> The ladder's edge labels (P5, M3, −6…) come out at {edge7:.1f}′ from the back row in Projector mode on a 1280×720 projector. That is at the 20/20 limit. The bracket column and the letter names are smaller still. The big ratio readout is 67′, more than four times what it needs.</p>
<p>2. <b>Browser zoom won't rescue the ladder.</b> The ladder shrinks to fit its column, so zooming the browser to 200% leaves the edge labels at the same size. Fixing it takes a change on the page, not a setting in the room.</p>
<p>3. <b>At ×1 the fifth's and fourth's gaps can't be seen from anywhere.</b> Their 2¢ gap is 1.4 px on screen and hides under the 8-unit-wide bar. ×5 makes them 4 to 5 arcmin, just visible. The thirds and sixths show at ×1 from the back. ×5 is the back-row mode, as designed. On a 1920×1080 projector everything is a third smaller, because the page stops widening past about 1280.</p></div>

<h2>What the back row sees</h2>
{vis}
<h2>Every kind of label, smallest of its kind</h2>
<table><tr><th>label</th><th>cap px · normal</th><th>cap px · projector</th><th>8H · 720p</th><th>6H · 720p</th><th>8H · 1080p</th><th>at 8H, 720p</th></tr>{trs}</table>
<h2>The just-vs-equal gaps, drawn, Projector mode, 1280×720, 8 screen-heights</h2>
<p class="lede">The 8-unit bar is about 10 screen px wide, so a gap smaller than that sits partly under the bar. Seeing that two lines are apart takes roughly 1 to 2 arcmin, more on a soft projector.</p>
<table><tr><th>interval</th><th>tempering</th><th>×1 px</th><th>×1 angle</th><th>×5 px</th><th>×5 angle</th></tr>{gtr}</table>
<h2>Browser zoom against the ladder's edge labels (1280×720, Projector mode)</h2>
<table><tr><th>zoom</th><th>cap px</th><th>8H</th></tr>{ztr}</table>
<h2>For the room: the walk to the back</h2>
<ul class="check">
<li>Projector mode on, ×5 on. Is the projector 1280×720 or 1920×1080? It changes everything above by a third.</li>
<li>From the back row: can you read P5, M3, −6 on the ladder's edges? The measurement says this is the first thing to fail.</li>
<li>The PERFECT / IMPERFECT / DISSONANT words and the short names beside them: readable, or just colour?</li>
<li>The letter names beside the numerals (C, G, E): needed from the back, or only on paper?</li>
<li>The temper strip at ×1: can you see that P5 misses at all? At ×5?</li>
<li>Is the big 3:2 bigger than it needs to be? Its space could go to the ladder.</li>
</ul>
<p class="lede">Made by the page's steward from measure.mjs, zoom.mjs and visual.py in this folder. Rerun them after any change to the page.</p>
</body></html>"""
(HERE / "back-row-report.html").write_text(page)
print("edge 8H 720p", round(edge7, 2)); print(json.dumps(summary["zoom"]))
