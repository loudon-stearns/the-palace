#!/usr/bin/env python3
"""The Cyanotype look as one standalone OBS card, from rough 6 on plate r06.

  _tools/ComfyUI/venv/bin/python plates/build_look_cyanotype.py
  → workshop/rough — cyanotype, standalone.html
"""
import base64, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
WS = os.path.dirname(HERE)
src = open(os.path.join(WS, "rough — cyanotype.html"), encoding="utf-8").read()

link = re.search(r'<link [^>]*>', src).group(0)
style = src[src.index("<style>") + 7:src.index("</style>")]
keep_css = "\n".join(l for l in style.splitlines()
                     if any(k in l for k in (".letter", ".redpen", ".mono", ".draw", "@keyframes", ".pulse", "@media")))
svg = src[src.index('<svg class="sheet"'):src.index("</svg>") + 6]
script = src[src.index("<script>") + 8:src.index("</script>")]
script = script.replace("document.querySelectorAll('svg.treat').forEach(treatment);", "")
plate = base64.b64encode(open(os.path.join(HERE, "cyan-r06.jpg"), "rb").read()).decode()

# fillable fields (OBS browser source: ?title=...&session=...)
fills = [
    ("SHEET 01 / 01 · SESSION 01", "sheet"),
    ("LIVE BUILD · SCANNING A WAVETABLE BY HAND", "title"),
    ("1.  ALL WORDS ARE TEXT.", "n1"),
    ("2.  TRACE AT 3 : 5 FROM THE LOGO FILE.", "n2"),
    ("3.  HOLD: AUDIO NOT YET PATCHED.", "n3"),
    (">LL-001<", "no"),
    (">SCANNING A WAVETABLE BY HAND<", "subject"),
    ("Patch before the stream. C.", "check"),
]
for text, key in fills:
    inner = text.strip("<>")
    svg = svg.replace(text, (">" if text.startswith(">") else "") + f'<tspan data-f="{key}">{inner}</tspan>' + ("<" if text.endswith("<") else ""), 1)
svg = svg.replace("ON AIR</tspan> · STARTING SOON", 'ON AIR</tspan> · <tspan data-f="status">STARTING SOON</tspan>', 1)
svg = svg.replace('<svg class="sheet"', '<svg class="sheet" preserveAspectRatio="xMidYMid meet"', 1)
svg = svg.replace('<image id="plate" href=""', f'<image id="plate" href="data:image/jpeg;base64,{plate}"', 1)

out = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Loud’n Live · Cyanotype</title>
<!--
  Loud'n Live · look: CYANOTYPE  (the second complete look; Loudon, 2026-10-25)

  A blueprint print a careful hand has worked on: the Drafting Table grammar turned
  to a dark cyanotype ground, then revised. The human part is in the process, never
  in the geometry: every line is ruled, and the hand shows in guidelines left in, an
  erased old name, a rubbed-out first sigil, a revision table, a checker's red pencil.

  Palette
    ground      a generated paper plate (local SDXL from the blank paper of Loudon's
                reference print), tinted to #1e5c88 and used only as a tone map
    ink         #f3edd8 cream lines and lettering; construction at low opacity
    live        #ffc23a amber outline on LIVE
    dimension   #a9d4f0 ice-blue pencil
    red pencil  #ef4a36 the checker's markup
    on air      #ff2a2a the pulsing dot
  Type
    Josefin Sans (all drafted lettering, normal tracking; the wordmark in a thin-pen
    outline with its construction lines and a width dimension under each letter) ·
    JetBrains Mono (the printed form: frame, zones, title-block headings) ·
    Caveat (the checker's quick sentence-case notes)
  Texture
    the paper plate; a centre fold; a slight print bleed on the ink; pencil grain on
    the red only. No grid. No wobble: straight lines, ruled.
  Motion
    the sigil draws itself once, in pen; the on-air dot pulses. Nothing else moves.

  Fill it from the URL (OBS browser source):
    ?sheet=SHEET%2001%20/%2001%20·%20SESSION%2001&title=LIVE%20BUILD%20·%20...&subject=...
    &no=LL-001&status=STARTING%20SOON&n1=1.%20%20...&n2=...&n3=...&check=Patch%20before%20the%20stream.%20C.
-->
{link}
<style>
  * {{ box-sizing: border-box; margin: 0; }}
  html, body {{ height: 100%; background: #000; overflow: hidden; }}
  svg.sheet {{ display: block; width: 100vw; height: 100vh; }}
{keep_css}
</style>
</head>
<body>
{svg}
<script>
const q = new URLSearchParams(location.search);
document.querySelectorAll('[data-f]').forEach(n => {{ const v = q.get(n.dataset.f); if (v !== null) n.textContent = v; }});
{script}
</script>
</body>
</html>
"""
dst = os.path.join(WS, "rough — cyanotype, standalone.html")
open(dst, "w", encoding="utf-8").write(out)
print(dst, f"{len(out) / 1e3:.0f} KB")
