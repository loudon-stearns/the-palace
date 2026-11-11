#!/usr/bin/env python3
"""Light round 2026-11 — the contact sheet. Run after make-sounds.py and make-figures.py: python3 make-sheet.py
Builds one self-contained page (ten roughs.html) and captions.md. The Drafting Table stylesheet and Transport are
inlined at build time, as a plugin's WebView does, so the sheet opens anywhere without reaching back to the palace."""
import base64, os, subprocess, tempfile, html

HERE = os.path.dirname(os.path.abspath(__file__))
DS = os.path.abspath(os.path.join(HERE, "..", "..", "_ops", "drafting-table", "design-system"))

PIECES = [
    ("Leibniz", "sound · 24 s · headphones", "Leibniz — two clocks, no wire.wav",
     "Two clocks, no wire",
     "First, two clocks set once and never touching: a wooden tock in the left ear, a metal tick in the right. They stay together because each keeps its own time. "
     "Then a wired pair: they start apart, plainly at different rates, and as the wire tightens they pull into step. "
     "Both pairs end in unison. Only the second needed a wire.",
     "The first half is Leibniz's pre-established harmony; the second is two Kuramoto phases with rising coupling."),
    ("Endosymbiosis", "sound · 20 s", "Endosymbiosis — two rhythms become one.wav",
     "Two rhythms become one",
     "Two tones seven hertz apart, beating against each other. From four seconds the coupling between them rises: the beat slows, "
     "lurches, and near nine seconds they lock onto one pitch that neither started on. Each keeps its own timbre to the end, "
     "hollow in the left ear and round in the right.",
     "A two-oscillator Kuramoto model, the page's own image. It is not a model of a cell."),
    ("Two Batons, One Board", "sound · 20 s", "Two Batons, One Board — an impulse, then the impulse looped.wav",
     "An impulse, then the impulse looped",
     "One click, then silence: a baton, carried once and gone. At five seconds the same click is dropped into a loop. "
     "Each pass catches what the last one left, rounds it a little, and drops it back: a steward.",
     "The page's two sentences, 'A baton is an impulse' and 'A steward is that impulse looped', taken literally."),
    ("Synthesis Notes (Loudon)", "sound · 16 s", "Synthesis Notes (Loudon) — marble, then the chisel.wav",
     "Marble, then the chisel",
     "Five seconds of raw sawtooth on a low E, every harmonic present: the block. Then a resonant low-pass closes over it and "
     "starts cutting figures. Nothing is added after second five. Everything you hear from there is something taken away.",
     "Your sentence from the notes: 'Think of the oscillator like marble and the filter a sculptor's chisel.'"),
    ("Whitehead", "sound · 22 s", "Whitehead — one occasion, then the society.wav",
     "One occasion, then the society",
     "One grain, alone. It arises and is gone. Again. Then they arrive faster, until near twelve seconds you stop hearing grains "
     "and hear a tone. Nothing in that tone persists: no grain lasts a tenth of a second. The tone is the pattern they hold together.",
     "The page's claim that the grain is the actual occasion and the cloud the society."),
    ("Yasujirō Ozu", "diagram", "Yasujirō Ozu — the 180-degree rule and the 360-degree room.svg",
     "The 180-degree rule and the 360-degree room",
     "Two people at a low table, seen from above. Hollywood keeps every camera on one side of the line between them. "
     "Ozu sets the camera anywhere in the room.",
     "The eight positions are a drawing choice; the page claims only that he crosses the axis routinely."),
    ("Striatum", "diagram", "Striatum — what dopamine reports.svg",
     "What dopamine reports",
     "Three trials. A reward nobody predicted: a burst. A reward the cue predicted: the burst moves to the cue and the reward itself "
     "passes in silence. A predicted reward withheld: the cell goes quiet at the moment it should have come.",
     "Schematic, not data. The pattern is Schultz, Dayan and Montague's (1997), which the page describes and does not cite."),
    ("Palace Map", "from palace data", "Palace Map — growth rings.svg",
     "Growth rings",
     "The palace cut across like a trunk. Each dot is a page, oldest at the heart, coloured by its type; each ring is a month of 2026. "
     "March is the widest ring, 105 pages.",
     "328 of the map's 329 pages, placed by the birth date each gives itself (one gives none). Map build of 2026-11-09."),
    ("Objects to Think With", "from palace data", "Objects to Think With — the lit ones.png",
     "The lit ones",
     "Every page in Projects/ by its own icon. The twenty-two the recount named as objects to think with are lit; the rest are dimmed.",
     "The page says twenty-two of fifty-one; Projects/ holds fifty-five pages today, and the twenty-two are the 2026-10-25 recount's, on its looser bar."),
    ("Meaning and the Link", "loop · 14 s · from palace data", "Meaning and the Link — the nodes fade, the links stay.svg",
     "The nodes fade, the links stay",
     "The palace's own map. The pages fade out and only the links are left, and you can still see where every page was.",
     "329 pages and the 2,323 links that run between two of them, map build of 2026-11-09. Where a page sits is the layout's choice."),
]


def b64(path):
    return base64.b64encode(open(path, "rb").read()).decode()


def audio(path):
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "a.m4a")
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "128000", path, out], check=True)
        return f'<audio controls preload="auto" src="data:audio/mp4;base64,{b64(out)}"></audio>'


def figure(path, alt):
    if path.endswith(".svg"):
        return f'<img alt="{html.escape(alt)}" src="data:image/svg+xml;base64,{b64(path)}">'
    return f'<img alt="{html.escape(alt)}" src="data:image/png;base64,{b64(path)}">'


css = open(os.path.join(DS, "colors_and_type.css")).read() + open(os.path.join(DS, "bundle.css")).read()
js = open(os.path.join(DS, "transport.js")).read()
cards, notes = [], ["# Captions — light round 2026-11\n\nOne caption and one honesty line per rough. They travel with the piece if it moves into a face.\n"]
for i, (page, kind, fn, title, caption, honest) in enumerate(PIECES, 1):
    p = os.path.join(HERE, fn)
    if fn.endswith(".wav"):
        pic = next(f for f in os.listdir(HERE) if f.startswith(fn[:-4] + " — picture."))
        media = figure(os.path.join(HERE, pic), f"A picture of the sound. {caption}") + audio(p)
    else:
        pic = None; media = figure(p, f"{title}. {caption}")
    cards.append(f'<section class="piece {"snd" if fn.endswith(".wav") else "fig"}"><header><span class="num">{i:02d}</span>'
                 f'<h2>{html.escape(page)}</h2><span class="kind">{kind}</span></header>'
                 f'<h3>{html.escape(title)}</h3>{media}<p class="cap">{html.escape(caption)}</p>'
                 f'<p class="honest">{html.escape(honest)}</p></section>')
    notes.append(f"## {page}\n\n- **File:** `{fn}`" + (f"\n- **Its picture:** `{pic}` (drawn from what the sound did; same caption)" if pic else "") + f"\n- **Title:** {title}\n- **Caption / alt:** {caption}\n- **What is real, what is a choice:** {honest}\n")

page = f"""<!doctype html><html lang="en" data-theme="paper"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Ten Light Roughs</title>
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
.honest{{font-size:11px;line-height:17px;margin:0;color:var(--ink-3);max-width:80ch}}
.snd .dt-transport{{margin:6px 0 0}}
</style></head><body><main>
<div class="top"><h1>Ten light roughs</h1>
<p>Light enrichment round · 2026-11-10 · unapproved, made by a child in the Enrichment workshop · none is in a rich face.
Five sounds, each with a picture of itself, two diagrams, three drawn from the palace's own data.</p></div>
{''.join(cards)}
</main><script>{js}</script></body></html>"""
open(os.path.join(HERE, "ten roughs.html"), "w").write(page)
open(os.path.join(HERE, "captions.md"), "w").write("\n".join(notes))
print("ten roughs.html", f"{len(page)/1e6:.1f} MB")
