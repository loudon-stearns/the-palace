#!/usr/bin/env python3
"""Light round 2026-11 — the second sheet (thirty more.html), captions-2.md, and placements.json for all forty pieces.
Run last: python3 make-sheet-2.py
placements.json is the hand-off to whoever writes the rich faces: for each piece, its page, its files, its words, the
neighbour that leaked into it, and the sentence on the page it belongs beside (with the ## heading that sentence sits under)."""
import base64, html, io, json, os, re, subprocess, tempfile
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
DS = os.path.join(ROOT, "_ops", "drafting-table", "design-system")
MAP = {n["id"]: n for n in json.load(open(os.path.join(ROOT, "_ops/maps/palace-map-full-2026-11-09.json")))["nodes"]}

# page, kind, file, title, caption, what is real / what is a choice, the neighbour that leaks in, the sentence it sits beside
P2 = [
 ("Hero and Avatar Maker", "from the palace's images", "Hero and Avatar Maker — what survives at 24 pixels.png", "What survives at 24 pixels",
  "Crystal Synthesizer's hero and its avatar, each shrunk to 48 and 24 pixels and shown both at true size and enlarged. The hero turns to a smear of colour; the avatar is still a ring with a red stone in it.",
  "Both are the palace's real files, resized. Nothing was redrawn.", "Crystal Synthesizer, the page's own example of an engraving.", "Engravings vanish at 24–48px"),
 ("Leibniz", "from the palace's images", "Leibniz — every jewel reflects every other.png", "Every jewel reflects every other",
  "The picture at the top of Leibniz's page, rebuilt from the avatars of the other pages. Step back and it is his; step in and it is everyone else's.",
  "1,848 tiles from 123 avatars, each picked for its colour, softened, and tinted most of the way to the colour needed. The tinting is what makes it read.", "Every page in the palace; Indra's Net is the page's own image.", "a jewel at every knot reflecting every other jewel"),
 ("Identity Molting", "from the palace's images", "Identity Molting — cast skins.png", "Cast skins",
  "Three pages and the face each one shed. The old hero is faded on the left, the one worn now on the right. The old ones are still whole, in git.",
  "Read from git history. Only a handful of pages have ever changed their hero; these are three of them.", "Leverage Points Framework, Blocked Not Prompted and Manim CE lend their old faces.", "A public archive is a trail of cast skins"),
 ("Mixture of Experts", "from palace data", "Mixture of Experts — who gets called.png", "Who gets called",
  "Every page's avatar, sized by how many other pages link to it. Ten pages take a fifth of all the links. Eighteen are never called at all.",
  "Links between pages, map build of 2026-11-09. Whether this is the 'expert collapse' the page warns of is a reading, not a count.", "The whole palace, with Weave Ceremony's hubs up front.", "expert collapse"),
 ("The Fortress and the Threshold", "from the palace's images", "The Fortress and the Threshold — four poles.png", "Four poles, none of them wrong",
  "Stoicism, Confucianism, Spinoza Conatus and The Drift at four corners, wearing their own avatars, with a red line wherever the map says one contradicts another. This page sits in the middle holding all four.",
  "The four red lines are real 'contradicts' links. 'The striving' and 'no architecture' are my paraphrases of the page.", "Stoicism, Confucianism, Spinoza Conatus, The Drift.", "The fortress is necessary for survival"),
 ("Excellent Adventure", "from the palace's images", "Excellent Adventure — who you can bring into the room.png", "Who you can bring into the room",
  "The palace's twenty-five people in the order they were born, from Lao Tzu to Rick Rubin, and one empty chair marked 'you, now'.",
  "Birth years are from general reference, not all from the pages. Lao Tzu's is traditional and uncertain.", "All twenty-five People pages.", "Bring a figure, event, or tradition into direct dialogue"),
 ("Dialectic", "from palace data", "Dialectic — every contradiction in the palace.png", "Every contradiction in the palace",
  "All sixty-one pairs of pages that the map says contradict each other, face to face. Any pair can be put in a room.",
  "Every 'contradicts' link between two pages, map build of 2026-11-09.", "Sixty-one pairs of neighbours.", "Two voices produce tension"),
 ("Hyperdimensional Prism", "from palace data", "Hyperdimensional Prism — four shadows of one thing.png", "Four shadows of one thing",
  "Every page sorted by which pillars it names. Fifty-two carry all four. Only four pages carry just one.",
  "Read from each page's own frontmatter; thirty-six pages name no pillars and are left out.", "FOUR PILLARS, whose four names sort the sheet.", None),
 ("Four Pillars of Enchanted Agency", "from palace data", "Four Pillars of Enchanted Agency — what a page wants at each age.png", "What a page wants at each age",
  "The page's table drawn as an arc from seed to dormant, each stage showing how many pages live there today and nine of their faces.",
  "Stage, pillar and wish are the page's own table, the wishes shortened. Counts from the map build of 2026-11-09.", "SCHEMA's lifecycle, and the pages living each stage.", "I want to come fully into being"),
 ("Revival Ceremony", "from the palace's images", "Revival Ceremony — the sleepers.png", "The sleepers",
  "The four pages asleep in the palace today, their heroes greyed, and the four ways in that can wake one.",
  "Asleep by the rite's own precondition: stage dormant or composting, or type spore. Map build of 2026-11-09.", "1 from 2, JSUI, Symbiotic Skills, Walk That Weaves.", "nothing else revives a page"),
 ("Songlines", "from palace data", "Songlines — one line, sung.png", "One line, sung",
  "The longest shortest walk in the palace, seven steps from The Commons to Synthesis Notes, each step labelled with the link that makes it.",
  "Named links only; bare 'connects-to' links were left out. One walk of many that long.", "The eight pages on the walk, FOUR PILLARS at its middle.", "to walk a songline is to re-enact"),
 ("Christopher Alexander", "from palace data", "Christopher Alexander — a palace is not a tree.png", "A palace is not a tree",
  "Three hubs and eighteen pages, drawn twice. On the left each page is filed under one parent. On the right every real tie is kept, and the red pages belong to more than one.",
  "The right-hand ties are all real links. The left is the same pages with every tie but one thrown away.", "Kuramoto Coupling, Spinoza Conatus, STIGMERGY and their shared neighbours.", "semi-lattices"),
 ("Weave Ceremony", "from palace data", "Weave Ceremony — the quiet ones.png", "The quiet ones",
  "The sixteen pages with the fewest links, each with its count in and out. A missing connection is an invitation.",
  "The map's own counts, build of 2026-11-09.", "The sixteen themselves; the line is the Jewel's.", "entries with no typed links in either direction"),
 ("Whitehead", "from palace data", "Whitehead — a page is built of what it takes up.png", "A page is built of what it takes up",
  "Whitehead's avatar in the middle of every page it holds a link with. Red for the six it takes up, grey for the seven that take it up in turn, each line naming the link.",
  "All thirteen links are real, map build of 2026-11-09.", "Its thirteen neighbours, Leibniz among them on a 'contradicts'.", "built out of its relations"),
 ("Dub Lineage", "sound · 30 s", "Dub Lineage — the engineer plays.wav", "The engineer plays",
  "Two bars of a full riddim. Then parts are pulled: drum and bass alone, then bass alone while an echo goes on repeating a rim shot that is no longer there. Everything returns in the last bar.",
  "Synthesized here from nothing; the picture is drawn from the mix's own parts.", "Retrospective Delay: the echo as memory of what was pulled.", "Subtraction is composition"),
 ("Cooking ↔ Mixing", "sound · 17 s", "Cooking ↔ Mixing — you cannot un-salt it.wav", "You cannot un-salt it",
  "A plucked phrase three times: dry, with reverb, and after an honest try at taking the reverb back out. The third is choppier and still wet.",
  "The 'taking out' is a simple gate. Better tools exist and they do not get the dry phrase back either.", "Reverb ↔ Space-Time, the sibling bridge whose effect is the salt.", "You can always add reverb"),
 ("Rick Rubin", "sound · 32 s", "Rick Rubin — clear away what hides it.wav", "Clear away what hides it",
  "Eight layers at once. One leaves each bar: shaker, arpeggio, pad, second guitar, drums, bass. What is left is a voice and one guitar, which were playing the whole time.",
  "Synthesized, including the 'voice', which is a buzz through two formants. Nothing is added after bar one.", "Dub Lineage: subtraction again, but only ever in one direction.", "Rubin's whole method is removal"),
 ("John Cage", "sound · 25 s", "John Cage — the coins decide.wav", "The coins decide",
  "Sixteen sounds. For each, three coins were thrown six times, as for the I Ching, and the six lines chose the pitch, the length, the loudness, and whether the string is prepared. Two of the sixteen came up silence.",
  "Thrown once from the computer's random source and kept as thrown. The mapping from lines to sounds is mine; the result is not.", "Brian Eno, by the link labelled 'coins-and-tape-loops'.", "coins"),
 ("Kick Drum ↔ Foundation", "sound · 20 s", "Kick Drum ↔ Foundation — who was there first.wav", "Who was there first",
  "The same four bars mixed twice. First the chords and bass are set and the kick is squeezed in last, thin. Then the kick goes in first, whole, and the bass steps back each time it speaks.",
  "One arrangement, two orders of decision, both synthesized here. The picture shows only what is below 140 Hz.", "Sidechain ↔ Conversation: the bass ducking is that bridge at work.", "early foundational decisions constrain all subsequent options"),
 ("Simondon", "diagram", "Simondon — a bag of parts, or one part doing several jobs.svg", "A bag of parts, or one part doing several jobs",
  "Left, four parts with one job each, bolted in a row. Right, one part with four arrows into it, wearing the Haptic Handwheel's avatar.",
  "A schematic of the page's sentence. The four jobs are the handwheel's as Palace Philosophies tells them.", "Haptic Handwheel, the palace's worked case.", "is a bag of separate parts"),
 ("How the Palace Commits", "diagram", "How the Palace Commits — one door in, one gate out.svg", "One door in, one gate out",
  "Four branches funnel through one door onto main. At the far end stands a gate with the Sentry's avatar on it, and a dashed arrow out to GitHub that only Loudon's word draws.",
  "A drawing of the page's own summary sentence. Nothing is measured.", "Sentry at the gate; Worktree Practice in the branches.", "The road has one door in and one gate out"),
 ("The Reader's Context Window", "diagram", "The Reader's Context Window — where the eye has to go.svg", "Where the eye has to go",
  "The same three blocks stacked two ways. With context wedged between question and answers the eye loops back up; with context on top it reads down once.",
  "The eye paths are illustrative, not eye-tracking.", None, "Context above the question"),
 ("James Turrell", "loop · 90 s each way", "James Turrell — it is moving.svg", "It is moving",
  "A window of colour that drifts from dusk-orange to deep blue over ninety seconds, too slowly to see. Two fixed swatches beside it show where it began and where it is going.",
  "Just a slow fade. Whether ninety seconds is slow enough is a guess to tune by eye.", "Seneca, whom the map says he contradicts: the hourglass is Seneca's avatar.", "A 0.5 dB filter move"),
 ("The View From Above", "loop · 18 s", "The View From Above — the concern, now a speck.svg", "The concern, now a speck",
  "One avatar fills the frame. The view pulls back to its neighbours, then to all 329 pages at once, and the red square that marked it has not moved.",
  "Avatars in alphabetical order, so who sits beside whom means nothing. The page in the red square is Stoicism.", "Palace Map: 'the view from above is the Palace Map', so the pull-back ends on the palace.", "Zoom out in space"),
 ("Donella Meadows", "chart from a simulation", "Donella Meadows — the bathtub.svg", "The bathtub",
  "One tub filled two ways, with a four-second lag between hand and water. Small turns settle on the line. Yanking the taps swings past it, over the rim, and back to empty.",
  "A small simulation written for this figure, not a measurement.", None, "bathtub"),
 ("p5.js", "image pair", "p5.js — veil, don't clear.png", "Veil, don't clear",
  "One flock at one moment, drawn two ways. Cleared each frame you see where the birds are. Veiled each frame you also see where they have been.",
  "Simulated in numpy to the page's recipe, a 14-alpha wash per frame. It was not rendered in p5.", "Flocking: the same seed-7 boids the page's first job drew.", "veil, don't clear"),
 ("Tree of Thoughts", "diagram", "Tree of Thoughts — a chain cannot go back.svg", "A chain cannot go back",
  "A chain of five thoughts that went wrong at the second and cannot return to it, beside a tree that drops five dead ends, backs up once, and arrives.",
  "A schematic. No model was run.", None, "replaces the chain with a tree"),
 ("The Palace Voice", "chart from git", "The Palace Voice — the dial that drifted.svg", "The dial that drifted",
  "Em-dashes and bold per thousand words, month by month. Em-dashes climb from 14 to 22 by midsummer, then fall to 15 after the August gate.",
  "Counted across every .md at each month's last commit. In this count bold did not rise; the page's 41 and 53 percent were measured some other way.", "Drift and Consolidation: drift, then the day it got tracked.", "em-dashes rose 41 percent"),
 ("Entry Conatus", "chart from palace data", "Entry Conatus — how the pages begin their wish.svg", "How the pages begin their wish",
  "The opening words of 311 forward vectors. A hundred begin 'I want to'. Sixty-seven begin 'I am', the opening the page calls a stasis-verb.",
  "A count of openings, not a judgment of any page: many 'I am' vectors go on to want something.", None, "a stasis-verb at the front"),
 ("Resonant Link Labels", "chart from palace data", "Resonant Link Labels — every link, and whether it says how.svg", "Every link, and whether it says how",
  "One square for each of the 2,323 links between pages, coloured by type. Filled squares carry a label saying how the two pages meet; hollow ones only say that they do. 93 percent are filled.",
  "Map build of 2026-11-09, links between pages only, so the total differs from the page's 2,940.", None, "typed links carrying a resonant label"),
]
# the first ten, for placements only: page, file(s), title, sentence
P1 = [("Leibniz", ["Leibniz — two clocks, no wire.wav", "Leibniz — two clocks, no wire — picture.svg"], "Two clocks, no wire", "the way two clocks set once keep the same time"),
      ("Endosymbiosis", ["Endosymbiosis — two rhythms become one.wav", "Endosymbiosis — two rhythms become one — picture.svg"], "Two rhythms become one", "two oscillators (two metabolic rhythms)"),
      ("Two Batons, One Board", ["Two Batons, One Board — an impulse, then the impulse looped.wav", "Two Batons, One Board — an impulse, then the impulse looped — picture.svg"], "An impulse, then the impulse looped", "A baton is an impulse"),
      ("Synthesis Notes (Loudon)", ["Synthesis Notes (Loudon) — marble, then the chisel.wav", "Synthesis Notes (Loudon) — marble, then the chisel — picture.png"], "Marble, then the chisel", "Think of the oscillator like marble"),
      ("Whitehead", ["Whitehead — one occasion, then the society.wav", "Whitehead — one occasion, then the society — picture.svg"], "One occasion, then the society", "the grain is the actual occasion"),
      ("Yasujirō Ozu", ["Yasujirō Ozu — the 180-degree rule and the 360-degree room.svg"], "The 180-degree rule and the 360-degree room", "180-degree axis"),
      ("Striatum", ["Striatum — what dopamine reports.svg"], "What dopamine reports", "the difference between what was expected and what actually happened"),
      ("Palace Map", ["Palace Map — growth rings.svg"], "Growth rings", "pages and"),
      ("Objects to Think With", ["Objects to Think With — the lit ones.png"], "The lit ones", "Twenty-two of the fifty-one"),
      ("Meaning and the Link", ["Meaning and the Link — the nodes fade, the links stay.svg"], "The nodes fade, the links stay", "The node is a convenience")]


def b64(data): return base64.b64encode(data).decode()


def figure(path, alt):
    if path.endswith(".svg"): src = "data:image/svg+xml;base64," + b64(open(path, "rb").read())
    else:
        im = Image.open(path).convert("RGB"); buf = io.BytesIO(); im.save(buf, "JPEG", quality=84); src = "data:image/jpeg;base64," + b64(buf.getvalue())
    return f'<img loading="lazy" alt="{html.escape(alt)}" src="{src}">'


def audio(path):
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "a.m4a"); subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "128000", path, out], check=True)
        return f'<audio controls preload="none" src="data:audio/mp4;base64,{b64(open(out, "rb").read())}"></audio>'


def locate(page, phrase):
    """Find the sentence on the page and the ## heading it sits under."""
    body = open(os.path.join(ROOT, MAP[page]["path"])).read(); lines = body.split("\n")
    hit = next((i for i, l in enumerate(lines) if phrase and phrase in l and not l.startswith(("forward_vector", "  ", "title"))), None) if phrase else None
    if hit is None: return None, None, None
    headnum = next((i for i in range(hit, -1, -1) if lines[i].startswith("## ")), None)
    return hit + 1, (lines[headnum][3:].strip() if headnum is not None else None), lines[hit].strip()[:160]


cards, notes, places = [], ["# Captions — light round 2026-11, second batch\n"], []
for i, (page, kind, fn, title, cap, honest, leak, near) in enumerate(P2, 11):
    p = os.path.join(HERE, fn); files = [fn]
    if fn.endswith(".wav"):
        pic = next(f for f in os.listdir(HERE) if f.startswith(fn[:-4] + " — picture.")); files.append(pic)
        media = figure(os.path.join(HERE, pic), f"A picture of the sound. {cap}") + audio(p)
    else: media = figure(p, f"{title}. {cap}")
    leakline = f'<p class="leak">Leaking in: {html.escape(leak)}</p>' if leak else ""
    cards.append(f'<section class="piece"><header><span class="num">{i:02d}</span><h2>{html.escape(page)}</h2><span class="kind">{kind}</span></header>'
                 f'<h3>{html.escape(title)}</h3>{media}<p class="cap">{html.escape(cap)}</p>{leakline}<p class="honest">{html.escape(honest)}</p></section>')
    notes.append(f"## {page}\n\n- **Files:** " + ", ".join(f"`{f}`" for f in files) + f"\n- **Title:** {title}\n- **Caption / alt:** {cap}\n- **Neighbour leaking in:** {leak or 'none'}\n- **What is real, what is a choice:** {honest}\n")
    ln, sec, sent = locate(page, near)
    places.append({"n": i, "page": page, "path": MAP[page]["path"], "files": files, "title": title, "caption": cap, "honest": honest, "leak": leak, "near": near, "near_line": ln, "section": sec, "sentence": sent, "has_face": os.path.exists(os.path.join(ROOT, MAP[page]["path"][:-3], os.path.basename(MAP[page]["path"])[:-3] + " — rich.json"))})
first = []
caps1 = open(os.path.join(HERE, "captions.md")).read()
for i, (page, files, title, near) in enumerate(P1, 1):
    ln, sec, sent = locate(page, near); m = re.search(rf"## {re.escape(page)}\n.*?\*\*Caption / alt:\*\* (.*?)\n- \*\*What is real, what is a choice:\*\* (.*?)\n", caps1, re.S)
    first.append({"n": i, "page": page, "path": MAP[page]["path"], "files": files, "title": title, "caption": m.group(1) if m else None, "honest": m.group(2) if m else None, "leak": None, "near": near, "near_line": ln, "section": sec, "sentence": sent, "has_face": os.path.exists(os.path.join(ROOT, MAP[page]["path"][:-3], os.path.basename(MAP[page]["path"])[:-3] + " — rich.json"))})
json.dump(first + places, open(os.path.join(HERE, "placements.json"), "w"), indent=1, ensure_ascii=False)
open(os.path.join(HERE, "captions-2.md"), "w").write("\n".join(notes))
for r in first + places:
    if r["near_line"] is None: print("NO SENTENCE FOUND:", r["n"], r["page"], repr(r["near"]))

css = open(os.path.join(DS, "colors_and_type.css")).read() + open(os.path.join(DS, "bundle.css")).read(); js = open(os.path.join(DS, "transport.js")).read()
page = f"""<!doctype html><html lang="en" data-theme="paper"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Thirty More Roughs</title>
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
<div class="top"><h1>Thirty more roughs</h1>
<p>Light enrichment round, second batch · 2026-11-10 · unapproved, made by a child in the Enrichment workshop.
Fourteen built from the palace's own heroes and avatars, five sounds with pictures, eleven diagrams, loops and charts.
The red line under a piece names the neighbouring page that leaked into it.</p></div>
{''.join(cards)}
</main><script>{js}</script></body></html>"""
open(os.path.join(HERE, "thirty more.html"), "w").write(page)
print("thirty more.html", f"{len(page)/1e6:.1f} MB", "·", len(first + places), "placements")
