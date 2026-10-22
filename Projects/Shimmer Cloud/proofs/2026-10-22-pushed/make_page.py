"""Builds ../2026-10-22-pushed-listening.html: every take inlined, silent until clicked.
Its look and player are the revival page's (../2026-10-21-listening.html), reused."""
import base64, html, json, re
from pathlib import Path
HERE = Path(__file__).parent; B = HERE.parent.parent
REVIVAL = (HERE.parent / "2026-10-21-listening.html").read_text()
CSS = re.search(r"<style>(.*?)</style>", REVIVAL, re.S).group(1)
F = json.loads((HERE / "findings.json").read_text())

SRC = {"dry": B / "dry.wav", "may25": B / "03_dispersion_cloud/variations/25_loudon_canonical_pure.wav"}
for n in ["p1_droplets", "p1_dispersion", "p2_delay", "p3_drift", "h1_20ms", "h2_80ms", "h3_300ms", "h4_1200ms", "w_early"]:
    SRC[n] = HERE / "takes" / f"{n}.wav"

def take(key, name, note):
    return f'''<div class="take" data-take="{key}">
  <button class="play" type="button" data-src="{key}" aria-label="Play {html.escape(name)}"><span class="glyph">▸</span></button>
  <div class="take-text"><div class="take-name">{html.escape(name)}</div><div class="take-note">{note}</div></div>
  <div class="bar"><span></span></div>
</div>'''

def review(sec, opts):
    o = "".join(f'<label class="opt"><input type="radio" name="{sec}" value="{html.escape(v)}"> {html.escape(v)}</label>' for v in opts)
    return f'''<div class="review" data-section="{sec}"><div class="review-q">your ear</div><div class="opts">{o}</div>
  <input class="note" type="text" placeholder="a word on what you heard (optional)" data-note="{sec}"></div>'''

def section(sid, title, lead, takes, opts):
    return f'''<section id="{sid}"><h2>{title}</h2><p class="lead">{lead}</p>
  <div class="takes">{"".join(take(*t) for t in takes)}</div>{review(sid, opts)}</section>'''

gap = lambda k: F[k]["highs_minus_lows_ms"]
body = "".join([
 f'''<section id="meet"><h2>Where we left it</h2><p class="lead">The phrase, then the dispersion you chose as the start, as you heard it at the revival. Measured with a single click, May's prism landed its lows and highs only {abs(gap("May 25 canonical")):.0f} ms apart. The 350 ms of start-time scatter was doing all the smearing, which is why every pair sounded close.</p>
 <div class="takes">{take("dry","the phrase, dry","Kokoro reading “the prism, and the cloud.”")}{take("may25","May · canonical dispersion","600 lenses, 4–20 ms dispersion, 350 ms scatter. What you heard on the 21st.")}</div></section>''',
 section("alone", "Each mode alone", f"Droplets with no prism, then the prism with no drift. The scatter is down to 25 ms in both, so what you hear is the mode itself.",
   [("p1_droplets", "A · droplets only", "600 copies, ±25 cents, each played a hair fast or slow. No dispersion."),
    ("p1_dispersion", "B · prism only", f"600 lenses, 150–600 ms of dispersion, highs late. No pitch shift. Lows and highs land {gap('p1_dispersion'):.0f} ms apart.")],
   ["A droplets", "B prism", "still close", "both, together"]),
 section("sorted", "Same smear, sorted or not", "Both clouds hold their lenses back by about the same amounts. In A, each lens delays every frequency equally. In B, each lens sorts its frequencies by height. Listen to the “s” in prism.",
   [("p2_delay", "A · delay, unsorted", f"Each lens delayed by its own average. Lows and highs land {gap('p2_delay'):.0f} ms apart."),
    ("p1_dispersion", "B · prism, sorted", "The same take as B above.")],
   ["A unsorted", "B sorted", "no difference"]),
 section("drift", "Pure, or with drift", "The pushed prism, then the same with every lens also detuned. The drift is ±15 cents now, five times May's.",
   [("p1_dispersion", "A · pure", "The same take as B above."),
    ("p3_drift", "B · with drift", "The same prism, every lens ±15 cents.")],
   ["A pure", "B with drift", "no difference"]),
 section("hard", "How hard to push", "One prism at five strengths, from May's up to more than a second, all with the 25 ms scatter. Where does it stop sounding like your phrase in a room and start sounding like something else?",
   [("may25", "0 · May", "4–20 ms, linear to the top of the range, 350 ms scatter."),
    ("h1_20ms", "1 · 20 ms", f"Lows and highs {gap('h1_20ms'):.0f} ms apart."),
    ("h2_80ms", "2 · 80 ms", f"{gap('h2_80ms'):.0f} ms apart."),
    ("h3_300ms", "3 · 300 ms", f"{gap('h3_300ms'):.0f} ms apart."),
    ("h4_1200ms", "4 · 1.2 s", f"{gap('h4_1200ms'):.0f} ms apart.")],
   ["comes apart at 1", "at 2", "at 3", "at 4", "go further"]),
 section("way", "Which way the light bends", "Highs late rises out of the word like a sweep up. Highs early falls: the hiss arrives first and the body follows, which leans toward the swell before the sound you asked for.",
   [("p1_dispersion", "A · highs late", "The same take as B above."),
    ("w_early", "B · highs early", f"The same lenses turned around. Highs land {abs(gap('w_early')):.0f} ms before the lows.")],
   ["A late", "B early", "a cloud of both"]),
])
png = base64.b64encode((HERE / "pushed.png").read_bytes()).decode()
rows = [("May canonical", "May 25 canonical"), ("May, scatter removed", "May 25, scatter removed"), ("pushed prism, highs late", "p1_dispersion"),
        ("delay, unsorted", "p2_delay"), ("highs early", "w_early"), ("20 ms", "h1_20ms"), ("80 ms", "h2_80ms"), ("300 ms", "h3_300ms"), ("1.2 s", "h4_1200ms")]
table = "".join(f"<tr><td>{a}</td><td>{F[k]['lows_land_ms']:.0f}</td><td>{F[k]['highs_land_ms']:.0f}</td><td>{F[k]['highs_minus_lows_ms']:+.0f}</td><td>{F[k]['energy_5_to_95_ms']:.0f}</td></tr>" for a, k in rows)
how = f'''<section id="how"><h2>What changed in the lens</h2>
<p class="lead">May's prism put its biggest delay at the very top of the range and let it fall in a straight line, so inside a voice it barely sorted anything. Now the delay climbs evenly per octave, from 80 Hz to 11 kHz, and reaches hundreds of milliseconds:</p>
<div class="equation">τ(f) = D × u(f)^p,  u(f) = log(f ÷ 80 Hz) ÷ log(11 kHz ÷ 80 Hz)<span class="worded">(delay at a frequency) = (largest delay) × (how many octaves up, as a share of the range)^(curve shape)</span></div>
<p class="lead">Top: the phrase through each cloud. Bottom: each cloud struck by one click, the cloud's own shape. May's is a block of noise; the pushed prism is a fan.</p>
<img src="data:image/png;base64,{png}" alt="spectrograms of the dry phrase, May's cloud, and the pushed prism in both directions; below, each cloud's response to a click" style="width:100%;border:1px solid var(--border-soft);margin:6px 0 14px">
<table style="width:100%;font-family:var(--mono);font-size:12px;color:var(--fg-2);border-collapse:collapse"><tr style="color:var(--fg-3);text-align:left"><th>one click through</th><th>lows land (ms)</th><th>highs land (ms)</th><th>highs − lows</th><th>90% of energy within (ms)</th></tr>{table}</table></section>
<section id="verdict"><h2>What you heard</h2><p class="lead">Your choices gather here as you make them. Nothing is saved; copy it into the board or a session, or just say it aloud.</p><textarea id="summary" readonly></textarea></section>'''
src_js = ",\n".join(f'  "{k}": "data:audio/wav;base64,{base64.b64encode(p.read_bytes()).decode()}"' for k, p in SRC.items())
script = re.search(r"<script>(.*?)</script>", REVIVAL, re.S).group(1)
script = re.sub(r"const SRC = \{.*?\};", "const SRC = {\n" + src_js + "\n};", script, flags=re.S)
script = script.replace("Shimmer Cloud · listening · ", "Shimmer Cloud · pushed · ")
page = f'''<!doctype html>
<!--
  title: Shimmer Cloud — the dispersion pushed, 2026-10-22
  born: 2026-10-22
  parent: [[Shimmer Cloud]]
  made by: the Shimmer Cloud steward, cycle 1; built by proofs/2026-10-22-pushed/make_page.py from the takes beside it.
-->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shimmer Cloud · pushed</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;600&display=swap" rel="stylesheet">
<style>{CSS}
td,th{{padding:4px 6px;border-top:1px solid var(--border-soft)}}</style></head>
<body><main>
<div class="eyebrow">Shimmer Cloud · the dispersion pushed · study</div>
<h1>Push the prism until the modes come apart</h1>
<p class="intro">At the revival you heard three pairs and said each one was close. This page plays the same three pairs with the prism pushed much harder, then a ladder of strengths and the prism turned around. Nothing plays until you click it, one take at a time, and a take stops if you leave the page.</p>
{body}{how}
<footer>Loud’n Live</footer></main>
<script>{script}</script></body></html>'''
out = HERE.parent / "2026-10-22-pushed-listening.html"
out.write_text(page)
print(out, round(len(page) / 1e6, 2), "MB")
