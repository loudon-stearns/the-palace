#!/usr/bin/env python3
"""The Night Signal look as one standalone OBS card, from rough 8 on night plate n01.

  _tools/ComfyUI/venv/bin/python plates/build_look_night.py
  → workshop/rough — night signal, standalone.html
"""
import base64, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
WS = os.path.dirname(HERE)
src = open(os.path.join(WS, "rough — night signal.html"), encoding="utf-8").read()

link = re.search(r'<link [^>]*>', src).group(0)
style = src[src.index("<style>") + 7:src.index("</style>")]
style = style[style.index("  .card {"):]                       # the card's own rules only
card = src[src.index('<div class="card" id="card">'):src.index('<div class="pick" id="pick"></div>')].rstrip()
script = src[src.index("<script>") + 8:src.index("</script>")]
plate = base64.b64encode(open(os.path.join(HERE, "night-n01.jpg"), "rb").read()).decode()

# the plate is fixed; the picker goes
pick = script[script.index("// night plates"):script.index("showPlate('n01');") + len("showPlate('n01');")]
script = script.replace(pick, "card.querySelector('.plate').src = 'data:image/jpeg;base64," + plate + "';")
# tempo from the URL; the readout shows it
script = script.replace("const BPM = 128,", "const Q = new URLSearchParams(location.search);\nconst BPM = Math.min(200, Math.max(60, +Q.get('bpm') || 128)),")
script = script.replace("// neon letters", "card.querySelector('.bpm').textContent = BPM.toFixed(2);\ndocument.querySelectorAll('[data-f]').forEach(n => { const v = Q.get(n.dataset.f); if (v !== null) n.textContent = v; });\n\n// neon letters")
# the shake moves the card; the fit scale lives on the slide around it
card = card.replace('<div class="card" id="card">', '<div class="card" id="card" style="width:1920px">')

fills = [
    ('<span class="dymo">SESSION 01</span>', '<span class="dymo" data-f="session">SESSION 01</span>'),
    ('<span class="chip">NOW PLAYING</span>', '<span class="chip" data-f="chip">NOW PLAYING</span>'),
    ('<span class="hud">WAVETABLE SCANNER // ', '<span class="hud"><span data-f="topic">WAVETABLE SCANNER</span> // '),
    ('<span style="color:#ff2bd6">@ldn</span>', '<span style="color:#ff2bd6" data-f="handle">@ldn</span>'),
    ('<span class="scramble">live build · scanning a wavetable by hand</span>', '<span class="scramble" data-f="title">live build · scanning a wavetable by hand</span>'),
]
for a, b in fills:
    assert card.count(a) == 1, a
    card = card.replace(a, b)

out = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Loud’n Live · Night Signal</title>
<!--
  Loud'n Live · look: NIGHT SIGNAL  (the third complete look; Loudon, 2026-10-25)

  Cyberpunk and electronic music, layered and dirty: Worn Broadcast's bones (Anton, the
  colour fringe, scanlines, grain, the glitch, the sigil, the old board) pushed into a
  city at night and onto a dance floor. Everything that moves keeps one tempo.

  Layers, deepest first
    a night plate (rain on dark glass, neon city bokeh; generated, see below) drifting;
    a shade behind the words; haze; the old circuit board (LL-03 REV C 2049);
    the instruments with a two-radius bloom pass: a TB-303 resonant lowpass sweeping,
    a spectrum analyser kicking with the low end, the sigil in three colours (magenta
    and cyan as a stereo pair, amber behind); a synth panel tilted toward the player,
    six 303 knobs (tuning, cutoff, resonance, env mod, decay, accent) over two octaves
    of keys playing the 303 line; the neon wordmark (LOUD'N magenta, LIVE cyan, one
    tube failing); rain in front at two depths with splashes, drops on the lens;
    dust, scratches, light leaks, a VHS tracking band, heavy grain, hard scanlines.
  Palette
    ground #03030a · magenta #ff2bd6 · cyan #00e5ff · acid #c6ff00 · amber #ffb000 ·
    on air #ff2a2a · label red #b3241c
  Type
    Anton (the neon wordmark, outlined) · Chakra Petch (HUD, chips, knob labels) ·
    IBM Plex Mono (title, label strip) · VT323 (readouts, info strip)
  Motion, on one clock (?bpm=, default 128)
    sidechain pump on every kick (wordmark, bloom, plate, on-air dot, env mod knob);
    a 16-step sequencer and the 303 line on the keys; cutoff knob follows the filter;
    bar.beat counter; the track's waveform with a drop countdown; every eight bars the
    drop: a big inverted tear, datamosh blocks, a shake. Between drops: small tears,
    scrambles, block hits, a stuttering tube.
  The plate
    night-n01: generated with GenAI (Stable Diffusion XL base 1.0, local ComfyUI),
    text to image only, seed 2026102591, no reference image. Prompt and recipe:
    Palace development/Loudon Live Design System/workshop/plates/make_night_plates.py
    and PROVENANCE.md beside it.

  Fill it from the URL (OBS browser source):
    ?bpm=128&session=SESSION%2001&chip=NOW%20PLAYING&topic=WAVETABLE%20SCANNER
    &handle=@ldn&title=live%20build%20·%20scanning%20a%20wavetable%20by%20hand
-->
{link}
<style>
  * {{ box-sizing: border-box; margin: 0; }}
  html, body {{ height: 100%; background: #000; overflow: hidden; }}
  .stage {{ position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }}
  .slide {{ width: 1920px; height: 1080px; flex: none; transform-origin: center center; }}
{style}</style>
</head>
<body>
<div class="stage"><div class="slide">
{card}
</div></div>
<script>
const slide = document.querySelector('.slide');
function fit() {{ slide.style.transform = `scale(${{Math.min(innerWidth / 1920, innerHeight / 1080)}})`; }}
fit(); addEventListener('resize', fit);
{script}
</script>
</body>
</html>
"""
dst = os.path.join(WS, "rough — night signal, standalone.html")
open(dst, "w", encoding="utf-8").write(out)
print(dst, f"{len(out) / 1e3:.0f} KB")
