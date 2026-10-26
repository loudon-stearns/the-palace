#!/usr/bin/env python3
"""Rough 6: rough 5's sheet, recoloured as a cyanotype print and laid on generated paper.

Colour read off Loudon's reference print (2026-10-25): a bright mottled cerulean
ground, cream lines and lettering, no grid, a centre fold. The chosen plates are
embedded as data URIs so the page stands alone.

  _tools/ComfyUI/venv/bin/python plates/build_rough6.py 02 06 08
"""
import base64, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
WS = os.path.dirname(HERE)
src = open(os.path.join(WS, "rough — constructed title.html"), encoding="utf-8").read()
picks = sys.argv[1:] or ["06"]

s = src
# ── the page around the card ──
s = s.replace("<title>Rough 5 · the constructed title</title>", "<title>Rough 6 · cyanotype</title>")
head = s[s.index('<header class="sheet">'):s.index("</section>") + len("</section>")]
s = s.replace(head, f'''<header class="sheet">
  <h1>Rough 6 · cyanotype</h1>
  <p>Rough 5 recoloured after your reference print, then taken darker. The lines and lettering are cream, there's no grid, and a fold runs down the middle. The paper is generated on local SDXL, starting from your reference's own blank paper (the band above the building and the strip below it), redrawn so the fibre, mottling and stains are new. Each plate is used only as a tone map: it moves the blue lighter or darker and keeps a stain slightly brown. Nothing generated carries a mark. Four plates to switch between under the card: r07 fade and foxing, r06 a faint coffee ring, r04 heavy mottling and a crack, 02 plain paper from the first batch.</p>
</header>''')

# ── paper: the generated plate replaces the gradient, grid and filter tooth ──
paper = s[s.index('<rect width="1600" height="900" fill="url(#exposure)"/>'):s.index('<line x1="800" y1="0"')]
s = s.replace(paper, '<image id="plate" href="" x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice"/>\n  <rect width="1600" height="900" filter="url(#tooth)" opacity=".5"/>\n  ')

# ── ink: white → cream; the datasheet blue can't sit on blue, so it goes deep Prussian ──
swaps = [
    ("#eef3fa", "#f3edd8"), ("#e8eff9", "#efe8d2"), ("#dfe8f6", "#ebe4ce"),
    ("rgba(214,228,250,", "rgba(243,237,216,"), ("rgba(200,215,240,", "rgba(243,237,216,"),
    ("rgba(220,235,255,", "rgba(255,250,235,"),
    ("#8fb8ff", "#a9d4f0"),            # datasheet: a pale ice-blue pencil on the darker ground
    ("#ff5a4e", "#ef4a36"),            # red pencil, bright enough for the darker ground
    ("rgba(10,20,38,.5)", "rgba(255,255,255,.035)"),
    ("#ffb000", "#ffc23a"),
]
for a, b in swaps:
    s = s.replace(a, b)
# the cyan question answers itself on a cyanotype
s = s.replace('stroke="#7fdbff" stroke-width="3"/>', 'stroke="#ffffff" stroke-width="3"/>')
s = s.replace('fill="#7fdbff">Link?</text>', 'fill="#ffffff">Link?</text>')
s = s.replace('<tspan x="1436">Cyan here</tspan><tspan x="1436" dy="24">too? L.S.</tspan>',
              '<tspan x="1436">It\'s all cyan</tspan><tspan x="1436" dy="24">now. L.S.</tspan>')
s = s.replace("<figcaption><b>F, constructed.</b> The wordmark as a drafted object, measured letter by letter. Everything else as rough 4: ",
              "<figcaption><b>F, cyanotype.</b> Rough 5's drawing on the reference's blue, ink in cream. Underneath, as before: ")

# ── the treatments script has nothing to draw any more ──
s = s.replace("document.querySelectorAll('svg.treat').forEach(treatment);", "")

# ── plates, embedded, and a switcher ──
uris = {}
for p in picks:
    with open(os.path.join(HERE, f"cyan-{p}.jpg"), "rb") as f:
        uris[p] = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()
buttons = "".join(f'<button data-p="{p}">plate {p}</button>' for p in picks)
s = s.replace("</figure>", f'''<div class="pick">{buttons}</div>
</figure>''', 1)
s = s.replace("</style>", """  .pick { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
  .pick button { font: 500 13px 'Manrope', sans-serif; color: var(--ink); background: #1b1b22; border: 1px solid #3a3a48; border-radius: 2px; padding: 6px 12px; cursor: pointer; }
  .pick button[aria-pressed="true"] { border-color: #ffc23a; color: #ffc23a; }
</style>""", 1)
s = s.replace("</body>", f"""<script>
const PLATES = {{{", ".join(f'"{p}": "{u}"' for p, u in uris.items())}}};
const img = document.getElementById('plate');
function show(p) {{ img.setAttribute('href', PLATES[p]); document.querySelectorAll('.pick button').forEach(b => b.setAttribute('aria-pressed', b.dataset.p === p)); }}
document.querySelectorAll('.pick button').forEach(b => b.addEventListener('click', () => show(b.dataset.p)));
show({picks[0]!r});
</script>
</body>""")
out = os.path.join(WS, "rough — cyanotype.html")
open(out, "w", encoding="utf-8").write(s)
print(out, f"{len(s) / 1e6:.1f} MB")
