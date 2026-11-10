"""Builds ../2026-11-09-swell-listening.html: every take inlined, silent until clicked.
Head, look and player are the interval page's (../2026-10-22-interval-listening.html), furniture and all."""
import base64, html, json, re, subprocess
from pathlib import Path
HERE = Path(__file__).parent; B = HERE.parent.parent
TPL = (HERE.parent / "2026-10-22-interval-listening.html").read_text()
HEAD = TPL[TPL.index('<meta name="theme-color"'):TPL.index("</head>")]
F = json.loads((HERE / "findings.json").read_text()); T = F["takes"]; C = F["click"]

SRC = {"dry": B / "dry.wav", "fifth": HERE.parent / "2026-10-22-interval/takes/fifth.wav"}
for n in ["c_dry", "p_tail", "p_swell", "p_both", "p_both_fifth", "p_swell_lows", "c_tail", "c_both", "c_both_fifth"]:
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

hang = lambda k: T[k]["hangs_past_dry_end_s_-30dB"]
hf, lf = C["highs_first"], C["lows_first"]
body = "".join([
 f'''<section id="meet"><h2>Where we left it</h2><p class="lead">The phrase, then October's fifth-then-cloud: one jump at the door, eight trips through the prism. It hangs about two seconds and starts when the words start. The plan's next step asks for two things it can't do: arrive before the sound, and hang much longer.</p>
 <div class="takes">{take("dry","the phrase, dry","Kokoro reading “the prism, and the cloud.”")}{take("fifth","October · a fifth, then the cloud","Eight passes. Hangs about 2.2 s, and nothing before the words.")}</div></section>''',
 section("tail", "The long tail", f"The same loop with no jump, run twice as long and kept louder: sixteen trips, each through a fresh cloud of 600 lenses, losing a little top every time, so the tail darkens as it hangs.",
   [("p_tail", "the phrase, long tail", f"Hangs {hang('p_tail'):.1f} s past the words, to −30 dB.")],
   ["hangs well", "too long", "too dark", "not long enough"]),
 section("swell", "The swell before the dry", f"The same lens run backward in time. Every delay the prism makes becomes an advance, so the cloud arrives before the words and crescendos into them. Nobody drew that crescendo: run backward, the loop's quietest pass comes first and its loudest last. Struck with a click, the swell reaches {hf['swell_reaches_s_before']:.1f} s ahead.",
   [("p_swell", "A · the swell alone", "Two seconds of lead, then the dry, no tail."),
    ("p_both", "B · swell and tail", f"The whole shape: in before the words, out {hang('p_both'):.1f} s after.")],
   ["A swell alone", "B both", "the swell reads as reversed speech, too much", "neither"]),
 section("way", "Which light comes first in the swell", f"Highs first: the swell falls from hiss into the body of the voice (a click's highs centre {abs(hf['swell_highs_centre_s']):.2f} s ahead, its lows {abs(hf['swell_lows_centre_s']):.2f} s). Or turned around, lows first, the swell rising into the voice from underneath.",
   [("p_both", "A · highs first", "The same take as B above."),
    ("p_swell_lows", "B · lows first", "Same tail; only the swell's prism turned round.")],
   ["A highs first", "B lows first", "no difference"]),
 section("chord", "On something struck", "Speech hides the swell inside its own words. A struck chord (C, G, E, B, plain additive piano-ish tones) has one sharp onset, so the swell has one place to lead into.",
   [("c_dry", "the chord, dry", "Struck once, 2.6 s."),
    ("c_tail", "A · tail only", f"Hangs {hang('c_tail'):.1f} s past the chord."),
    ("c_both", "B · swell and tail", "In before the strike, out after it.")],
   ["A tail only", "B swell and tail", "neither"]),
 section("fifth", "With a fifth at the door", "October's interval lens and this shape together: the swell and the tail both jump a fifth once, then only drift. A fifth leading into the sound before it is struck.",
   [("p_both_fifth", "A · the phrase", f"Hangs {hang('p_both_fifth'):.1f} s."),
    ("c_both_fifth", "B · the chord", "A fifth above the chord, before it and after.")],
   ["keeps the fifth", "plain is better", "both have a place"]),
])
png = base64.b64encode((HERE / "swell.png").read_bytes()).decode()
lv = " · ".join(f"{k} before: {v:+.0f} dB" for k, v in hf["swell_level_dB_before_onset"].items())
how = f'''<section id="how"><h2>How it works</h2>
<p class="lead">A prism lens delays each frequency by its own amount and never makes anything louder. Run backward in time, each delay becomes an advance. So the swell is the tail's loop run in reverse: five short trips through the prism, faded so the farthest is quietest. Forward, the same loop runs sixteen trips and keeps more each time.</p>
<div class="equation">lead = reverse( loop( reverse(dry) ) );  tail = loop(dry);  out = lead + dry + tail, the dry delayed by the lead<span class="worded">(the swell) = the loop, run on the sound backward, then turned the right way round;  (the tail) = the loop run forward;  (what you hear) = swell, then the dry, then the tail</span></div>
<p class="lead">Measured with one click (it has no words of its own to bias the timing): the swell reaches {hf['swell_reaches_s_before']:.1f} s ahead and rises steadily, {lv}. The tail falls 30 dB in {hf['tail_hangs_s']['-30dB']:.1f} s and 45 dB in {hf['tail_hangs_s']['-45dB']:.1f} s.</p>
<img src="data:image/png;base64,{png}" alt="one click through the lens, swell and tail, then spectrograms of the phrase and the chord with swell and tail" style="width:100%;border:1px solid var(--border-soft);margin:6px 0 14px">
<p class="lead"><b>What it costs, live.</b> A swell before a sound has to hear the sound first. Here that's free. Live, the dry has to wait the swell's length (two seconds here). That's fine on a playback track with delay compensation, or in a looper, and impossible on a mic you're monitoring. The live cloud should carry the swell as a lookahead knob and say so on its face.</p></section>
<section id="verdict"><h2>What you heard</h2><p class="lead">Your choices gather here as you make them. Nothing is saved; copy it into the board or a session, or just say it aloud.</p><textarea id="summary" readonly></textarea></section>'''
def mp3(p):  # inlined as 192 kb/s MP3 so the page stays under the 10 MB a cycle can commit; the WAVs stay beside it
    return subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-b:a", "192k", "-f", "mp3", "-"], capture_output=True, check=True).stdout
src_js = ",\n".join(f'  "{k}": "data:audio/mpeg;base64,{base64.b64encode(mp3(p)).decode()}"' for k, p in SRC.items())
script = re.search(r"<script>(.*?)</script>", TPL, re.S).group(1)
script = re.sub(r"const SRC = \{.*?\};", lambda m: "const SRC = {\n" + src_js + "\n};", script, flags=re.S)
script = script.replace("Shimmer Cloud · interval · ", "Shimmer Cloud · swell · ")
page = f'''<!doctype html>
<!--
  title: Shimmer Cloud — a swell before the dry, and long tails, 2026-11-09
  born: 2026-11-09
  parent: [[Shimmer Cloud]]
  made by: the Shimmer Cloud steward, cycle 3; built by proofs/2026-11-09-swell/make_page.py from the takes beside it.
-->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shimmer Cloud · swell</title>
{HEAD}</head>
<body><main>
<div class="eyebrow">Shimmer Cloud · a swell before the dry, and long tails · study</div>
<h1>In before the sound, and long after it</h1>
<p class="intro">The cloud now arrives before the sound it belongs to and hangs long after it. Both come from the prism's own timing: the tail is the loop run forward, and the swell is the same loop run backward in time. Dry and wet are mixed the way a reverb is heard, and every take is levelled alike. Nothing plays until you click, one take at a time.</p>
{body}{how}
<footer>Loud’n Live</footer></main>
<script>{script}</script></body></html>'''
out = HERE.parent / "2026-11-09-swell-listening.html"
out.write_text(page)
print(out, round(len(page) / 1e6, 2), "MB")
