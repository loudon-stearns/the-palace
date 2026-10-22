"""Builds ../2026-10-22-interval-listening.html: every take inlined, silent until clicked.
Look and player are the revival page's (../2026-10-21-listening.html), reused as cycle 1 did."""
import base64, html, json, re
from pathlib import Path
HERE = Path(__file__).parent; B = HERE.parent.parent
REVIVAL = (HERE.parent / "2026-10-21-listening.html").read_text()
CSS = re.search(r"<style>(.*?)</style>", REVIVAL, re.S).group(1)
F = json.loads((HERE / "findings.json").read_text())

SRC = {"dry": B / "dry.wav", "may": B / "01_feedback_lens/wet.wav"}
for n in ["fourth", "fifth", "octave", "twelfth", "octave_below", "fifth_bare", "fifth_early", "fifth_long"]:
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

tail = lambda k: F[k]["tail_s_to_-30dB"]
body = "".join([
 f'''<section id="meet"><h2>Where we left it</h2><p class="lead">The phrase, then May's feedback lens, which jumps an octave on every pass. Struck with one tone, it lands 69% of its wet energy an octave up, 21% two octaves up and 7% three: a stack that climbs. You asked for one jump at the door and only small shifts after it.</p>
 <div class="takes">{take("dry","the phrase, dry","Kokoro reading “the prism, and the cloud.”")}{take("may","May · an octave every pass","Six passes, each a further octave up, dry mixed in. Its shimmer ends with the phrase.")}</div></section>''',
 section("interval", "Which interval at the door", "The same lens five times. The phrase jumps once on the way in, then goes round a loop eight times. Each trip passes through the pushed prism (a fresh cloud of 600 lenses each time, 150–600 ms) and drifts a few cents, never another jump. Struck with one tone, every take lands all its wet energy on its interval.",
   [("fourth", "A · a fourth up", f"Hangs {tail('fourth'):.1f} s past the phrase."),
    ("fifth", "B · a fifth up", f"Hangs {tail('fifth'):.1f} s."),
    ("octave", "C · an octave up", f"The H3000 interval, jumped once. Hangs {tail('octave'):.1f} s."),
    ("twelfth", "D · an octave and a fifth up", f"Hangs {tail('twelfth'):.1f} s."),
    ("octave_below", "E · an octave down", f"The cloud under the voice instead of over it. Hangs {tail('octave_below'):.1f} s.")],
   ["A fourth", "B fifth", "C octave", "D twelfth", "E below", "more than one"]),
 section("loop", "What the prism does inside the loop", "The fifth, with and without the cloud. Without it, each pass is one plain echo: the same loop, the same drift, nothing sorted.",
   [("fifth_bare", "A · loop of plain echoes", f"Hangs {tail('fifth_bare'):.1f} s."),
    ("fifth", "B · loop through the prism", "The same take as B above.")],
   ["A plain", "B prism", "no difference"]),
 section("way", "Which way the light bends, in the loop", "Highs late, as above, or turned around so the hiss of each pass arrives before its body. Turned around, the lows pile up at the back and the tail gets darker and longer.",
   [("fifth", "A · highs late", "The same take as B above."),
    ("fifth_early", "B · highs early", f"Hangs {tail('fifth_early'):.1f} s.")],
   ["A late", "B early"]),
 section("hang", "How long it hangs", "The fifth with a longer loop: fourteen passes, each kept louder. This is where it starts to turn from shimmer into drone. The last vowel's harmonics hold as steady lines in the tail.",
   [("fifth", "A · eight passes", "The same take as B above."),
    ("fifth_long", "B · fourteen passes", f"Hangs {tail('fifth_long'):.1f} s.")],
   ["A shimmer", "B drone, and good", "B drone, too far"]),
])
png = base64.b64encode((HERE / "interval.png").read_bytes()).decode()
names = [("May · octave every pass", "may_octave_stack"), ("fourth", "fourth"), ("fifth", "fifth"), ("octave", "octave"), ("octave and a fifth", "twelfth"),
         ("octave down", "octave_below"), ("fifth, plain echoes", "fifth_bare"), ("fifth, highs early", "fifth_early"), ("fifth, long loop", "fifth_long")]
def lands(r): return ", ".join(f"{st:+d} st {pc}%" for st, pc in r["tone_lands_st_pct"] if pc > 0)
table = "".join(f"<tr><td>{a}</td><td>{lands(F[k])}</td><td>{F[k]['tail_s_to_-30dB']:.1f}</td></tr>" for a, k in names)
how = f'''<section id="how"><h2>How the lens works</h2>
<p class="lead">One jump on the way in. Then a loop: each trip goes through a fresh prism cloud, drifts a few cents, loses a little top end, and comes round quieter. The dispersion adds up, so each pass spreads the interval wider in time than the last.</p>
<div class="equation">s₀ = shift(dry, interval);  sₖ = drift(cloudₖ(sₖ₋₁));  wet = Σₖ gᵏ⁻¹ · cloudₖ(sₖ₋₁) delayed by k·Δ<span class="worded">(first pass) = (the phrase, jumped once);  (next pass) = (a few cents of drift) of (a fresh prism) of (this pass);  (the wet) = sum of every pass, each quieter by the loop gain and later by one gap</span></div>
<p class="lead">The phrase through the lens. May's ends with the words; the new one hangs. The level lines in the long tail are the last vowel held by the loop.</p>
<img src="data:image/png;base64,{png}" alt="spectrograms of the dry phrase, May's octave stack, and the fifth-then-cloud lens three ways" style="width:100%;border:1px solid var(--border-soft);margin:6px 0 14px">
<table style="width:100%;font-family:var(--mono);font-size:12px;color:var(--fg-2);border-collapse:collapse"><tr style="color:var(--fg-3);text-align:left"><th>lens</th><th>one 220 Hz tone lands at (semitones, share of wet)</th><th>hangs past the phrase (s, to −30 dB)</th></tr>{table}</table></section>
<section id="verdict"><h2>What you heard</h2><p class="lead">Your choices gather here as you make them. Nothing is saved; copy it into the board or a session, or just say it aloud.</p><textarea id="summary" readonly></textarea></section>'''
src_js = ",\n".join(f'  "{k}": "data:audio/wav;base64,{base64.b64encode(p.read_bytes()).decode()}"' for k, p in SRC.items())
script = re.search(r"<script>(.*?)</script>", REVIVAL, re.S).group(1)
script = re.sub(r"const SRC = \{.*?\};", "const SRC = {\n" + src_js + "\n};", script, flags=re.S)
script = script.replace("Shimmer Cloud · listening · ", "Shimmer Cloud · interval · ")
page = f'''<!doctype html>
<!--
  title: Shimmer Cloud — an interval, then a cloud, 2026-10-22
  born: 2026-10-22
  parent: [[Shimmer Cloud]]
  made by: the Shimmer Cloud steward, cycle 2; built by proofs/2026-10-22-interval/make_page.py from the takes beside it.
-->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shimmer Cloud · interval</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;600&display=swap" rel="stylesheet">
<style>{CSS}
td,th{{padding:4px 6px;border-top:1px solid var(--border-soft)}}</style></head>
<body><main>
<div class="eyebrow">Shimmer Cloud · an interval, then a cloud · study</div>
<h1>One jump at the door, then the prism</h1>
<p class="intro">The feedback lens rebuilt your way: the phrase jumps once, by an octave or another interval, and after that only drifts a few cents while the prism spreads it out on every trip round the loop. Dry and wet are mixed the way a reverb is heard, and every take is levelled alike. Nothing plays until you click, one take at a time.</p>
{body}{how}
<footer>Loud’n Live</footer></main>
<script>{script}</script></body></html>'''
out = HERE.parent / "2026-10-22-interval-listening.html"
out.write_text(page)
print(out, round(len(page) / 1e6, 2), "MB")
