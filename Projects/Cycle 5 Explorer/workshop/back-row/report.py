"""The back-row test for Cycle 5 Explorer, turned into one standalone report page.
Reads page-measure.json and room-measure.json (from measure.mjs) and page-zoom.json, and simulates the back row by
resampling the first projector frame to the eye's resolution (an illustration, not an optics model), after
Rational Hearing's back-row/visual.py. Writes back-row-report.html and two side-by-side strips.
Run: /usr/local/bin/python3 "Projects/Cycle 5 Explorer/workshop/back-row/report.py" """
import json, math, base64, io, html
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw
HERE = Path(__file__).parent
P = json.loads((HERE / "page-measure.json").read_text()); R = json.loads((HERE / "room-measure.json").read_text())
Z = json.loads((HERE / "page-zoom.json").read_text())
def screen_arcmin(k): return 2 * math.degrees(math.atan(1 / (2 * k))) * 60
def sim(im, k=8, acuity=1.0):
    W, H = im.size; n = max(2, round(screen_arcmin(k) / acuity))
    return im.resize((round(W * n / H), n), Image.BOX).filter(ImageFilter.GaussianBlur(0.5)).resize((W, H), Image.BICUBIC)
def jpg(im, q=80):
    b = io.BytesIO(); im.save(b, "JPEG", quality=q); return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()
views = []
for tag, label in [("page", "the page today"), ("room", "room view (R)")]:
    front = Image.open(HERE / f"{tag}-1280x720-frame1.png").convert("RGB"); back = sim(front)
    w, h = front.size; strip = Image.new("RGB", (w * 2 + 20, h + 30), (240, 237, 228)); d = ImageDraw.Draw(strip)
    for i, (im, lab) in enumerate([(front, f"{label.upper()} · FRONT ROW"), (back, "BACK ROW · 8 SCREEN-HEIGHTS · 20/20")]):
        strip.paste(im, (i * (w + 20), 30)); d.text((i * (w + 20) + 4, 9), lab, fill=(40, 40, 40))
    strip.save(HERE / f"backrow-{tag}-strip.png"); views.append((label, jpg(front), jpg(back)))
def band(a): return ("ok", "comfortable") if a >= 16 else ("ok", "reads") if a >= 10 else ("warn", "strains") if a >= 5 else ("bad", "below 20/20")
e = html.escape
pg7, rm7, pg10, rm10 = P["runs"][0]["groups"], R["runs"][0]["groups"], P["runs"][1]["groups"], R["runs"][1]["groups"]
order = sorted(pg7, key=lambda g: pg7[g]["arcmin_8H"])
trs = "".join(f'<tr><td>{e(g)}</td><td class="{band(pg7[g]["arcmin_8H"])[0]}">{pg7[g]["arcmin_8H"]:.1f}′</td><td class="{band(rm7[g]["arcmin_8H"])[0]}"><b>{rm7[g]["arcmin_8H"]:.1f}′</b></td>'
              f'<td>{rm7[g]["arcmin_6H"]:.1f}′</td><td class="{band(pg10[g]["arcmin_8H"])[0]}">{pg10[g]["arcmin_8H"]:.1f}′</td><td class="{band(rm10[g]["arcmin_8H"])[0]}"><b>{rm10[g]["arcmin_8H"]:.1f}′</b></td><td>{band(rm7[g]["arcmin_8H"])[1]}</td></tr>' for g in order if g in rm7)
ztr = "".join(f'<tr><td>{int(z["zoom"]*100)}%</td><td>{z["grid_cell_arcmin"]}′</td><td>{z["wheel_px"]} px in a {z["css_viewport"][1]} px-tall screen</td><td>{z["screens_tall"]}</td></tr>' for z in Z["zooms"])
vis = "".join(f'<figure><figcaption>{e(n)} · 1280×720 · first screen</figcaption><div class="duo"><div><span>front row</span><img src="{a}"></div><div><span>back row, 8 screen-heights, 20/20</span><img src="{b}"></div></div></figure>' for n, a, b in views)
page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Cycle 5 Explorer — the back-row test</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><style>
:root{{--ground:#f0ede4;--ink:#1c1b18;--ink2:#5b5850;--rule:#b9b4a6;--amber:#a8700a;--red:#c8281e;--green:#3d7a3a}}
body{{margin:0;background:var(--ground);color:var(--ink);font:14px/21px ui-monospace,"JetBrains Mono",Menlo,monospace;padding:24px;max-width:1180px}}
h1{{font-size:20px;letter-spacing:.04em;text-transform:uppercase;margin:0 0 6px}} h2{{font-size:11px;letter-spacing:.18em;text-transform:uppercase;margin:28px 0 8px}}
p{{max-width:78ch;margin:6px 0}} table{{border-collapse:collapse;margin:8px 0}} td,th{{border:1px solid var(--rule);padding:3px 8px;text-align:left}} th{{font-weight:500;color:var(--ink2)}}
td.bad{{color:var(--red)}} td.warn{{color:var(--amber)}} td.ok{{color:var(--green)}}
figure{{margin:14px 0}} figcaption{{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink2)}}
.duo{{display:grid;grid-template-columns:1fr 1fr;gap:10px}} .duo span{{display:block;font-size:11px;color:var(--ink2)}} .duo img{{width:100%;border:1px solid var(--rule)}}
</style></head><body>
<h1>Cycle 5 Explorer — the back-row test</h1>
<p>How big each label on the page looks from the back of a classroom, measured in headless Chromium, not in a room. The angle a capital letter makes at your eye: 5′ is the smallest letter 20/20 eyes can make out, about 10′ reads, 16′ and up is comfortable. The back row sits 8 screen-heights from the screen; a small room, 6.</p>
<p><b>What it found.</b> On a 1280×720 projector only the tonic and mode name read from the back row; almost everything else sits between 4′ and 5′. On a 1920×1080 projector it is worse, because the page uses the extra pixels for space, not size. And the wheel at 1280×720 does not fit the screen: its bottom ring is cut off. Pressing ⌘+ makes letters bigger but stacks the page into a column, so the wheel alone is taller than the screen from 150% on (table at the foot).</p>
<p><b>What I built.</b> Room view: press R, or open the page with ?room. The wheel takes the screen's height and sits whole beside the inspector on one screen; the type around it is one and a half times larger, twice on a 1080p screen; the four-dialect table and the ground switch step aside. Nothing changes until you press R.</p>
<h2>See it</h2>{vis}
<h2>Every label group, smallest member, back row</h2>
<table><tr><th>group</th><th>today 720p</th><th>room 720p</th><th>room 720p, small room</th><th>today 1080p</th><th>room 1080p</th><th>room 720p reads as</th></tr>{trs}</table>
<p>The honest limit: room view lifts most labels from about 5′ to about 7′. The wheel's notes, the tonic and mode, the chord symbol and the staff read from the back row; the grids read from the middle of the room or a small room, not the back of a big one. A grid that reads from the back would need a screen of its own.</p>
<h2>What ⌘+ buys on the page today, 1280×720</h2>
<table><tr><th>zoom</th><th>grid letter, back row</th><th>wheel height</th><th>page, in screens</th></tr>{ztr}</table>
</body></html>"""
(HERE / "back-row-report.html").write_text(page)
print("wrote back-row-report.html", len(page) // 1024, "KB")
