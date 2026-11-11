#!/usr/bin/env python3
"""Light round 2026-11 — the third sheet (thirty again.html), captions-3.md and placements-3.json.
Run last: python3 make-sheet-3.py   Same shape as make-sheet-2.py; placements-3.json holds only this batch."""
import base64, html, io, json, os, subprocess, tempfile
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
DS = os.path.join(ROOT, "_ops", "drafting-table", "design-system")
MAP = {n["id"]: n for n in json.load(open(os.path.join(ROOT, "_ops/maps/palace-map-full-2026-11-09.json")))["nodes"]}

P3 = [
 ("Stoicism", "from the palace's images", "Stoicism — three teachers, three tools.png", "Three teachers, three tools",
  "Seneca, Epictetus and Marcus Aurelius in a row, with an arrow from Epictetus to Marcus for the notes Marcus kept beside his bed, and under them the three Stoic moves the palace has pages for.",
  "The red tie between Seneca and Epictetus is a real 'contradicts' link. The one-line gloss under each avatar is mine.", "Seneca, Epictetus, Marcus Aurelius, The Dichotomy of Control, The View From Above, The Four Virtues.", "kept a copy beside his bed"),
 ("Metaphor as Coupling Medium", "from the palace's images", "Metaphor as Coupling Medium — ten bridges.png", "Eleven bridges",
  "Each of the eleven cross-domain pages, its avatar sitting between the two things it holds together: Compression and Intimacy, Cooking and Mixing, and so on down.",
  "The pages and their avatars are real. Reading each one as a coupling is this page's claim, applied to them.", "All eleven Cross-Domain Resonances pages.", "a more symmetric coupling constant"),
 ("Source Library", "from the palace's images", "Source Library — the shelf.png", "The shelf",
  "Thirty sources stood side by side like books, each spine a strip cut from the middle of that page's hero.",
  "Every page linked into Source Library plus the pages of type 'source', in alphabetical order. The spine is an arbitrary strip of each hero.", "The thirty sources themselves.", "curated ecosystem"),
 ("Project Stewardship System", "from palace data", "Project Stewardship System — waiting on an ear.png", "Waiting on an ear",
  "One square for each of the 121 notes the stewards left saying a thing is still rough. Eighty-seven carry an ear: nobody has listened yet. Nineteen say nobody has opened it.",
  "The page's own numbers, from the fleet reading of 2026-10-16, so a month old.", "Pauline Oliveros: the ear is her avatar.", "93 of October's cycles made something"),
 ("BBS Blackboard", "from palace data", "BBS Blackboard — nothing is ever erased.png", "Nothing is ever erased",
  "Every message on the blackboard as one square, in the order written, coloured by kind: 1,540 of them. The eleven retractions are black squares added at the end of their line, with what they retract still above them.",
  "Only each message's date and type were read, never its words. Read from the live board on 2026-11-10.", None, "No agent overwrites, deletes, or edits"),
 ("Baton Ceremony", "from palace data", "Baton Ceremony — batons in the air.png", "Batons in the air",
  "The nineteen handoffs open on the board today, each shown by its page's avatar with how long it has been in the air. The oldest is three weeks.",
  "Read from the board's own handoff list on 2026-11-10. An open baton is not a fumble; that word is for one claimed and never closed.", "The nineteen pages carrying a baton.", "fumble"),
 ("Epictetus", "from palace data", "Epictetus — against the room.png", "Against the room",
  "Epictetus in the middle of the eight pages he holds a named link with. Five of the eight are 'contradicts', drawn in red: Lao Tzu, Marcus Aurelius, Martin Buber, Martin Heidegger, Seneca.",
  "All eight links are real, map build of 2026-11-09. Bare 'connects-to' links are left out.", "His five opponents and three allies.", "was born a slave"),
 ("Douglas Hofstadter", "from the palace's images", "Douglas Hofstadter — a strange loop.png", "A strange loop",
  "The picture at the top of his page, hung inside itself seven times. Follow it inward and you never reach a picture that is not this picture.",
  "A picture of self-reference, which is his phrase's first half. It says nothing about a self.", None, "a paradoxical level-crossing feedback loop"),
 ("Pages as Agents", "from the palace's images", "Pages as Agents — asleep until read.png", "Asleep until read",
  "Every avatar in the palace, greyed, except one: this page's own, lit and framed in red, because you are reading it.",
  "The lit one is only the one you opened. The picture cannot show a page waking; it shows the claim.", "All 329 pages.", "Every entry here is a sleeping agent"),
 ("Martin Buber", "from the palace's images", "Martin Buber — the between.png", "The between",
  "His avatar twice. On the left you see two faces. On the right the light shape between them is tinted red: one shape, belonging to neither face.",
  "Only the tint differs. Reading the vase as 'the between' is mine, not the page's.", None, "the between"),
 ("Loudon Live", "sound and loop · 16 s", "Loudon Live — the trace, heard.wav", "The trace, heard",
  "A low tone in the left ear and one a fifth above it in the right, and the figure those two draw when one moves a dot sideways and the other moves it up and down. It turns over once in sixteen seconds.",
  "220 and 330 Hz, the right ear a sixteenth of a hertz sharp so the figure turns. The picture is drawn from the same two numbers, not from the audio.", "Rational Hearing: the shape is a ratio you can hear.", "Lissajous trace inside a sphere"),
 ("Pauline Oliveros", "sound · 26 s", "Pauline Oliveros — one point, then the whole sphere.wav", "One point, then the whole sphere",
  "One room, heard twice. First attention closes on a single drip and the rain, the hum, the bird and the bell fall away. Then it opens and all of it is there at once.",
  "A synthesized room, not a recording. Turning the other sounds down forty times is my stand-in for not attending to them.", "John Cage, whom the map says she contradicts: one sound in the room is a prepared string from his piece.", "the entire sphere"),
 ("The Drift", "sound · 24 s", "The Drift — placed, then let go.wav", "Placed, then let go",
  "Seventy-two grains laid on a grid in a pattern. Then forty particles dropped in a box, a grain sounding each time one lands: 523 grains nobody placed, thinning out as they come to rest.",
  "The second half's rules were chosen (gravity, bounce, pitch by position). Its notes were not.", "Granular Synthesis and Particle Synthesis, the page's own two examples.", "every grain a decision"),
 ("Trickster", "sound · 11 s", "Trickster — the corner that disappears.wav", "The corner that disappears",
  "Two bars of drums through a compressor with a hard knee, then the same two bars with a soft one. The picture shows both curves: a corner you can point at, and the same boundary with the corner smoothed away.",
  "Threshold -24 dB, ratio 8 to 1, knee 0 and 24 dB. The audible difference is small and nobody has listened for it.", "Compressor Design, where the palace's soft knee lives.", "soft knee in the compressor design"),
 ("Shunryu Suzuki", "sound · 22 s", "Shunryu Suzuki — few, then many.wav", "Few, then many",
  "One bell struck twice. First with a single partial left in: the note and nothing else. Then with all eleven, each ringing for its own length.",
  "Partial ratios are a typical bell's, not a measured one. Calling one partial 'the expert' is my reading of his line.", "Harmonicity and Inharmonicity: a bell's partials are not a tidy ladder.", "in the beginner's mind there are many possibilities"),
 ("Audition Gate", "sound · 11 s", "Audition Gate — both pass the spec.wav", "Both pass the spec",
  "Two notes with the same measured pitch, level and length: 110 Hz, -11.6 dB, five seconds. One is a patch nobody touched. Which one is not in the numbers.",
  "The three figures were read off the rendered audio and agree to the decimal. Whether one sounds dead is a claim about listening.", "Generative Audio Devices: 'structurally correct and audibly inert'.", "only the audio is the truth"),
 ("The Four Virtues", "diagram", "The Four Virtues — four gates.svg", "Four gates",
  "A choice passing through four gates in a row, and beyond a dashed line, the outcome, marked 'not yours'.",
  "The gloss under each gate is mine, shortened from the page.", "The Dichotomy of Control (the line the outcome sits behind) and Closing Well on the justice gate.", "virtue has four cardinal parts"),
 ("Martin Heidegger", "diagram", "Martin Heidegger — you do not see the hammer.svg", "You do not see the hammer",
  "The same hammer twice. Working, it is drawn nearly transparent and the nail is bold. Broken, the hammer is bold and the nail has faded.",
  "A drawing of what attention does, which is his point; nothing is measured.", "Merleau-Ponty: the hand in the corner is his avatar.", "Show him a hammer"),
 ("George Nakashima", "diagram", "George Nakashima — the crack is kept.svg", "The crack is kept",
  "A slab of wood with a crack left showing down its middle and two red butterfly keys let in across it.",
  "A drawing, not one of his tables.", "Dovetail Joint ↔ Counterpoint: two parts that hold by their difference.", "butterfly joint"),
 ("Andy Goldsworthy", "loop · 20 s", "Andy Goldsworthy — to the very edge of its collapse.svg", "To the very edge of its collapse",
  "Nine stones go up, each a little further out than the last. The stack holds for a breath, marked 'this is the piece', and then comes down.",
  "A drawing of the arc from made to gone, not one of his works. The fall is animated by hand, not simulated.", None, "the very edge of its collapse"),
 ("Reflective Practice", "diagram", "Reflective Practice — twelve and three.svg", "Twelve and three",
  "A balance tipped hard to one side: twelve squares in the pan marked 'on action', three in the pan marked 'in action'.",
  "The counts are the page's, and the page says its sort has not been re-audited.", None, "Twelve mechanisms"),
 ("The Remembering Page", "diagram", "The Remembering Page — a mood, a direction.svg", "A mood, a direction",
  "One arrow pulling a page off to one side, and the page stays put. Then three arrows from separate encounters all pulling the same way, and the page's own arrow turns.",
  "A schematic of the page's rule; the angles mean nothing.", "Entry Conatus: the arrow is the forward vector.", "One dialogue is a mood"),
 ("Worktree Practice", "diagram", "Worktree Practice — the floor moved.svg", "The floor moved",
  "Two sessions in one checkout: one switches the branch, and the other's commit lands on the wrong one. Beside it, a worktree each, and both commits land where they were meant.",
  "A schematic of the failure the page was born from, not a record of the commits involved.", "How the Palace Commits.", "out from under"),
 ("Speak Like a Person, Log Like a Protocol", "diagram", "Speak Like a Person, Log Like a Protocol — the same card, twice.svg", "The same card, twice",
  "One request shown as a protocol card and as a plain sentence with a Yes button, and under each a bar: about sixty seconds for four cards, about three.",
  "Both cards are mock-ups of mine; neither is a real card. The sixty and three seconds are the page's.", "Trickster, whose inbox made the case.", "~60 seconds"),
 ("No Mind Checks Itself", "diagram", "No Mind Checks Itself — the same hole twice.svg", "The same hole twice",
  "Three slices with holes that line up, and an error walking straight through: one mind checking its own work. Beside it, slices from different minds, and the error stops at the second.",
  "James Reason's Swiss cheese model, which the page takes from Latent Error.", "Latent Error.", "the checker must sit outside"),
 ("Iain McGilchrist", "image pair", "Iain McGilchrist — two ways of attending.png", "Two ways of attending",
  "The same eighty-four avatars twice. Once with one picked out sharp and all the others reduced to empty boxes. Once with all of them present and none in focus.",
  "My picture of his two kinds of attention, not his own figure.", "Pauline Oliveros, who makes the same split by ear.", "what kind of attention are you paying"),
 ("Registry Pattern", "diagram", "Registry Pattern — cables that point nowhere.svg", "Cables that point nowhere",
  "Three synth modules. On the left, cables run off to port names that do not exist and hang in the air. On the right, every cable is seated.",
  "The modules and port names are illustrative, not from a real plugin.", None, "cables point nowhere"),
 ("Drift and Consolidation", "diagram with real data", "Drift and Consolidation — the sawtooth.svg", "The sawtooth",
  "A sawtooth that climbs and is pulled back, over and over, staying in a band, with a dashed line that only climbs. Beside it, one real tooth: the palace's em-dashes rising to midsummer and only beginning to ease.",
  "The sawtooth is a schematic. The inset is counted from git with the voice linter, as for The Palace Voice.", "The Palace Voice.", "That gap is **drift**"),
 ("The Multilinear Self", "diagram", "The Multilinear Self — one thing, three true shadows.svg", "One thing, three true shadows",
  "One solid in the corner of a room, casting a circle on the floor, a rectangle on one wall and a triangle on the other. No wall shows the solid, and no shadow is false.",
  "The three rooms are named from the Jewel's line on Loudon; pairing each with a shape is arbitrary.", "Hyperdimensional Prism, turned on the person who made it.", "a real shadow the whole self casts"),
 ("Julia Cameron", "diagram", "Julia Cameron — a week of mornings.svg", "A week of mornings",
  "Seven days, three handwritten pages each, and at the end of the row the avatar of the palace's own morning practice.",
  "The scribbles stand for writing and say nothing.", "The Daily Page.", "Morning Pages are three pages of longhand"),
]


def b64(d): return base64.b64encode(d).decode()


def figure(path, alt):
    if path.endswith(".svg"): src = "data:image/svg+xml;base64," + b64(open(path, "rb").read())
    else:
        buf = io.BytesIO(); Image.open(path).convert("RGB").save(buf, "JPEG", quality=84); src = "data:image/jpeg;base64," + b64(buf.getvalue())
    return f'<img loading="lazy" alt="{html.escape(alt)}" src="{src}">'


def audio(path):
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "a.m4a"); subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "128000", path, out], check=True)
        return f'<audio controls preload="none" src="data:audio/mp4;base64,{b64(open(out, "rb").read())}"></audio>'


def locate(page, phrase):
    lines = open(os.path.join(ROOT, MAP[page]["path"])).read().split("\n")
    hit = next((i for i, l in enumerate(lines) if phrase in l and not l.startswith(("forward_vector", "  ", "title"))), None)
    if hit is None: return None, None, None
    hn = next((i for i in range(hit, -1, -1) if lines[i].startswith("## ")), None)
    return hit + 1, (lines[hn][3:].strip() if hn is not None else None), lines[hit].strip()[:160]


cards, notes, places = [], ["# Captions — light round 2026-11, third batch\n"], []
for i, (page, kind, fn, title, cap, honest, leak, near) in enumerate(P3, 41):
    p = os.path.join(HERE, fn); files = [fn]
    if fn.endswith(".wav"):
        pic = next(f for f in os.listdir(HERE) if f.startswith(fn[:-4] + " — picture.")); files.append(pic)
        media = figure(os.path.join(HERE, pic), f"A picture of the sound. {cap}") + audio(p)
    else: media = figure(p, f"{title}. {cap}")
    cards.append(f'<section class="piece"><header><span class="num">{i:02d}</span><h2>{html.escape(page)}</h2><span class="kind">{kind}</span></header>'
                 f'<h3>{html.escape(title)}</h3>{media}<p class="cap">{html.escape(cap)}</p>' + (f'<p class="leak">Leaking in: {html.escape(leak)}</p>' if leak else "") + f'<p class="honest">{html.escape(honest)}</p></section>')
    notes.append(f"## {page}\n\n- **Files:** " + ", ".join(f"`{f}`" for f in files) + f"\n- **Title:** {title}\n- **Caption / alt:** {cap}\n- **Neighbour leaking in:** {leak or 'none'}\n- **What is real, what is a choice:** {honest}\n")
    ln, sec, sent = locate(page, near)
    if ln is None: print("NO SENTENCE FOUND:", i, page, repr(near))
    base = MAP[page]["path"][:-3]
    places.append({"n": i, "page": page, "path": MAP[page]["path"], "files": files, "title": title, "caption": cap, "honest": honest, "leak": leak, "near": near, "near_line": ln, "section": sec, "sentence": sent,
                   "has_face": os.path.exists(os.path.join(ROOT, base, os.path.basename(base) + " — rich.json"))})
json.dump(places, open(os.path.join(HERE, "placements-3.json"), "w"), indent=1, ensure_ascii=False)
open(os.path.join(HERE, "captions-3.md"), "w").write("\n".join(notes))
css = open(os.path.join(DS, "colors_and_type.css")).read() + open(os.path.join(DS, "bundle.css")).read(); js = open(os.path.join(DS, "transport.js")).read()
page = f"""<!doctype html><html lang="en" data-theme="paper"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Thirty Again</title>
<style>{css}
html,body{{margin:0;background:var(--ground-000);color:var(--ink);font-family:var(--font-mono,'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace)}}
main{{max-width:960px;margin:0 auto;padding:28px 16px 64px}}
.top{{border:1.5px solid var(--ink);padding:14px 16px;margin-bottom:28px}}
.top h1{{font-size:18px;letter-spacing:.22em;margin:0 0 6px;text-transform:uppercase}}
.top p{{margin:0;font-size:12px;line-height:18px;color:var(--ink-3)}}
.piece{{border-top:1.5px solid var(--ink);padding:14px 0 26px}}
.piece header{{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}}
.num{{font-size:12px;color:var(--accent);font-weight:700}}
.piece h2{{font-size:15px;margin:0;letter-spacing:.04em}}
.kind{{font-size:11px;color:var(--ink-3);margin-left:auto;text-transform:uppercase;letter-spacing:.12em}}
.piece h3{{font-size:13px;font-weight:400;color:var(--ink-2);margin:4px 0 10px}}
.piece img{{display:block;width:100%;height:auto;border:1px solid var(--rule)}}
.cap{{font-size:13px;line-height:21px;margin:12px 0 4px;max-width:72ch}}
.leak{{font-size:12px;line-height:18px;margin:0 0 2px;color:var(--accent);max-width:80ch}}
.honest{{font-size:11px;line-height:17px;margin:0;color:var(--ink-3);max-width:80ch}}
</style></head><body><main>
<div class="top"><h1>Thirty again</h1>
<p>Light enrichment round, third batch · 2026-11-10 · unapproved, made by a child in the Enrichment workshop.
Ten from the palace's heroes, avatars and records, six sounds with pictures, fourteen diagrams and loops.
The red line under a piece names the neighbouring page that leaked into it.</p></div>
{''.join(cards)}
</main><script>{js}</script></body></html>"""
open(os.path.join(HERE, "thirty again.html"), "w").write(page)
print("thirty again.html", f"{len(page)/1e6:.1f} MB ·", len(places), "placements ·", sum(p["has_face"] for p in places), "already have a face")
