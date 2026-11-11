#!/usr/bin/env python3
"""Light round 2026-11 — the remake pass after the challenge of the first forty. Writes remakes.json (the hand-off
to whoever rewrites the faces) and remakes.html (the sheet). Run after the makers: python3 make-remakes.py
Each record: the page, the workshop files that now replace the placed ones, the corrected words, and what changed.
'kind' is 'remade' (a file changed), 'words' (only caption or honesty line changed), or 'moved' (a new file name)."""
import base64, html, io, json, os, subprocess, tempfile
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
DS = os.path.join(ROOT, "_ops", "drafting-table", "design-system")

R = [
 # page, kind, files, title, caption, honest, leak, what changed (and why), new anchor or None
 ("Mixture of Experts", "remade", ["Mixture of Experts — who gets called.png"], "Who gets called",
  "Every page's avatar, sized by how many other pages link to it. Ten pages take a fifth of all the typed links. Eighteen have no typed link pointing at them.",
  "Typed links stand in for 'being called'; the map's use counts would be closer. This is the shape the page warns of, not yet the thing: its 'collapse' is one or two experts doing all the work, and the top two here take about 6 percent.",
  "Weave Ceremony, which defines hubs as the top inbound decile.",
  "'Never called at all' was false: the eighteen include Return Ceremony and The Palace Voice, which every session reads. The words now say what was counted.", None),
 ("Dialectic", "remade", ["Dialectic — every contradiction in the palace.png"], "Every contradiction in the palace",
  "All sixty-one pairs the map holds in contradiction, face to face, both kept. The pairs of people and traditions are the ones ready to be put in a room.",
  "Every 'contradicts' link between two pages, each declared by one side only. Here the word means a tension worth keeping, not that either page calls the other wrong.",
  "Palace Philosophies: 'Contradictions are dispatchable as Dialectics.'",
  "The subhead said the pages 'say the other is wrong', which no pair does. 'Any pair can be put in a room' overreached the page. Four columns now, so names are not cut to eleven letters.", None),
 ("Christopher Alexander", "words", ["Christopher Alexander — a palace is not a tree.png"], "A palace is not a tree",
  "Three hubs and eighteen pages, drawn twice. On the left each page is filed under one parent. On the right every real tie between a page and a hub is kept, and the red pages belong to more than one.",
  "Eighteen of the hubs' 123 neighbours, ten of them picked from the 24 that touch more than one hub, so overlap is over-shown: about one page in five really overlaps. Which hub keeps a page on the left is the drawing's choice. Ties among the eighteen are left out. The title is the piece's claim; the page says cities are semi-lattices.",
  "The three hubs are the palace's biggest, not his neighbours: none of them links his page.",
  "The caption said 'every real tie is kept'; only page-to-hub ties are. The honesty line now owns how the eighteen were picked.", None),
 ("Synthesis Notes (Loudon)", "words", ["Synthesis Notes (Loudon) — marble, then the chisel.wav", "Synthesis Notes (Loudon) — marble, then the chisel — picture.png"], "Marble, then the chisel",
  "Five seconds of raw sawtooth on a low E, every harmonic present: the block. Then a resonant low-pass closes over it and starts cutting figures. No new sound comes in after second five. The filter cuts, and its resonance leans on whatever harmonics sit at the edge of the cut.",
  "Your sentence from the notes, and your notes also say resonance is a boost at the cutoff: the harmonic at the edge runs 8 to 12 dB louder than it was in the raw block (the challenger's measurement). The resonance, the sweep and a soft clip are my choices.",
  None, "'Everything you hear from there is something taken away' was false by measurement. The sound is unchanged; the words now say what a resonant filter does.", None),
 ("Kick Drum ↔ Foundation", "words", ["Kick Drum ↔ Foundation — who was there first.wav", "Kick Drum ↔ Foundation — who was there first — picture.svg"], "Who was there first",
  "The same four bars mixed twice. First the chords and bass are set and the kick is squeezed in last, thin. Then the kick goes in first, whole, and the bass steps back each time it speaks.",
  "Two mixes of one arrangement, set by hand to stand for the two orders; the thin kick is my choice of what a late kick gets, not a result. The picture shows only what is below 140 Hz.",
  "Sidechain ↔ Conversation: the bass ducking is that bridge at work.", "The honesty line claimed 'two orders of decision'. No order was modelled.", None),
 ("How the Palace Commits", "remade", ["How the Palace Commits — one door in, one gate out.svg"], "One door in, one gate out",
  "Many branches funnel through one lock onto main, which only moves forward. At the far end stands a gate with the Sentry's avatar on it, and a dashed arrow out to GitHub that only Loudon's word draws.",
  "A second drawing of a sentence the page already diagrams; what it adds is the funnel of many branches into one lock. It leaves out the board and the ear.",
  "Sentry at the gate; Worktree Practice in the branches.",
  "The footer said everything left of the gate stays on this Mac, under a box labelled 'a cloud session's branch'; the page says a cloud session is not on this Mac. The box and the footer are fixed, and 'one commit' is now 'a tip'.", None),
 ("Striatum", "remade", ["Striatum — what dopamine reports.svg"], "What dopamine reports",
  "Three trials. A reward nobody predicted: a burst. A reward the cue predicted: the burst moves to the cue, and the reward itself draws no burst. A predicted reward withheld: the cell pauses at the moment it should have come.",
  "Schematic, not data. The page gives only the definition of prediction error; the three-trial pattern is Schultz, Dayan and Montague's (Science, 1997), and the cells are midbrain dopamine neurons that project to the striatum.",
  None, "'Passes in silence' was wrong: the cell keeps its usual rate. Bursts were placed by chance and differed row to row; each now starts at its marker with the same ten ticks.", None),
 ("Excellent Adventure", "remade", ["Excellent Adventure — who you can bring into the room.png"], "Who you can bring into the room",
  "The twenty-five people the palace has a page for, in the order they were born, from Lao Tzu to Rick Rubin, and one empty chair marked 'you, now'. They are where to start, not the limit: the mode invites any figure, event or tradition.",
  "Birth years are each page's own. Lao Tzu's is traditional and uncertain, which his page does not mark.",
  "All twenty-five People pages.", "I said the years were not all on the pages. Every page carries one; they are now read from there. Names are no longer cut.", None),
 ("Whitehead", "remade", ["Whitehead — a page is built of what it takes up.png"], "A page is built of what it takes up",
  "Whitehead's avatar in the middle of every map page it holds a link with. Red for the six of its seven declared links that land on a page in the map, grey for the seven pages that take it up in turn, each line naming the link.",
  "All thirteen are real, map build of 2026-11-09. Its seventh declared link goes to a STIGMERGY file outside the map and is not drawn.",
  "Its thirteen neighbours, Leibniz among them on a 'contradicts'.", "The piece said the page declares six links; it declares seven.", None),
 ("Entry Conatus", "remade", ["Entry Conatus — how the pages begin their wish.svg"], "How the pages begin their wish",
  "The opening words of 311 forward vectors. A hundred begin 'I want to'. Sixty-nine begin 'I am', the opening the page calls a stasis-verb.",
  "A count of openings, not a judgment of any page: many 'I am' vectors go on to want something.",
  None, "The count of 'I am' was 67; it is 69. The first reader could not read a forward vector written as a block, and missed two.", None),
 ("Hyperdimensional Prism", "remade", ["Hyperdimensional Prism — four shadows of one thing.png"], "Four shadows of one thing",
  "Every page sorted by which pillars it names, with this page framed in red. Fifty-two name all four. This page names three.",
  "A census of how each page's author tagged it, read from frontmatter on 2026-11-10; it shows the tagging, not whether the tags are right. Thirty-five name none: specialists and makers, which the schema does not ask.",
  "FOUR PILLARS, whose four names sort the sheet.",
  "Three numbers were off by one: the first parser missed a page. This page is now marked, which shows it sitting among the threes (its frontmatter names philosophy, creation and tools).", None),
 ("Objects to Think With", "remade", ["Objects to Think With — the lit ones.png"], "The lit ones",
  "Every page in Projects/ by its own icon. Twenty-three are lit as objects to think with; the five framed in red say so on their own page. Three with dotted frames were born after the count and have not been judged.",
  "The lit set is the 2026-10-25 recount's twenty-two on its looser bar, plus Cycle 5 Explorer, which declares itself. The page's text still says twenty-two of fifty-one.",
  None, "Cycle 5 Explorer declares itself an object to think with and was drawn dimmed. Three pages born after the recount were dimmed as if judged 'no'.", None),
 ("Weave Ceremony", "moved", ["Weave Ceremony — no one links here.png"], "No one links here",
  "The eighteen pages no other page points to. Each may be a root or may be forgotten; the Weave is where that gets asked. By the page's own meaning the palace has no orphans: every one of these links outward.",
  "No typed link from another page, map build of 2026-11-09. Being unlinked is not being unused: Return Ceremony is on this sheet.",
  None, "The old piece ('the quiet ones') sat beside the definition of orphans and showed none, used an undefined cut of sixteen, and borrowed 'quiet', which this page uses for something else. Remade as the page's next category, isolated entries. Replaces 'Weave Ceremony — the quiet ones.png'.", "Isolated entries"),
 ("The Palace Voice", "remade", ["The Palace Voice — the dial that drifted.svg"], "The dial that drifted",
  "Em-dashes and bold per thousand words of entry prose, month by month. Em-dashes climb from 14 to 20 by July, hold through September, and have eased to 17. Bold falls the whole way, from 24.5 to 15.4.",
  "Counted with the page's own linter on the palace's entries at each month's last commit. The page's 41 and 53 percent compare entries by birth month, a different question, and a challenger's rerun of that gave about 18 and 20. August is marked because the dial was named then; the chart does not show the gate causing anything.",
  None, "The first chart pooled every .md file, so the palace doubling in size looked like the voice recovering. Recounted the linter's way; the axis now starts at zero; the fall is no longer credited to the August gate.", None),
 ("Identity Molting", "remade", ["Identity Molting — cast skins.png"], "Cast skins",
  "Three pages that wore one face for weeks or months and then grew another: STIGMERGY, The Lens, FOUR PILLARS. The old hero is faded on the left, the one worn now on the right. The old ones are still whole, in git.",
  "Read from git history. A challenger counted 26 hero files that have ever changed; I picked three that changed in place after a long wear. Calling a replaced hero a cast skin is my analogy: the page's sentence is about a person's public archive.",
  "STIGMERGY, The Lens and FOUR PILLARS lend their old faces.",
  "The first three were not shed: they were stripped on Loudon's review a day after they were made, then replaced later. These three really changed in place.", None),
 ("Leibniz", "remade", ["Leibniz — every jewel reflects every other.png"], "Every jewel reflects every other",
  "The picture at the top of Leibniz's page, rebuilt from the avatars of other pages. Step back and it is his; step in and it is everyone else's.",
  "1,848 tiles from 123 of the other 328 pages' avatars, each chosen only for how light or dark it is. Nothing is tinted.",
  "A third of the palace's pages; Indra's Net is the page's own image.",
  "I said the tinting was what made it read. A challenger rebuilt it without and it read as well and crisper, so the tint and the softening are gone. Leibniz's own avatar is no longer in the pool.", None),
 ("Hero and Avatar Maker", "remade", ["Hero and Avatar Maker — what survives at 24 pixels.png"], "What survives at 24 pixels",
  "Crystal Synthesizer's hero and its avatar, each shrunk to 48 and 24 pixels and enlarged again. The hero keeps only its colours. The avatar loses its fine rays and keeps its ring and its red stone: linework vanishes, silhouette holds.",
  "Both are the palace's real files, shrunk whole. The page says 'a crystal a Haeckel engraving' without naming this page; pairing them is my inference.",
  "Crystal Synthesizer.", "The first version cropped the hero to its middle before shrinking, which cut the crystal out, and labelled thumbnails 'actual size', which is untrue once the sheet is scaled. The caption now states the page's claim.", None),
 ("The Fortress and the Threshold", "remade", ["The Fortress and the Threshold — four poles.png"], "Four poles",
  "Stoicism, Confucianism, Spinoza Conatus and The Drift at four corners, wearing their own avatars, with a red line wherever the map says one contradicts another. Only the Drift contradicts the striving.",
  "The four red lines are real 'contradicts' links. 'The striving' and 'no architecture' paraphrase the page. Palace Philosophies calls this site a quadruple; this page names the fourth pole and says it is not yet on its map.",
  "Stoicism, Confucianism, Spinoza Conatus, The Drift.",
  "One line ran through the centre icon, so it read as this page joined to two poles. The caption claimed this page 'holds all four', which is Palace Philosophies' claim, not the page's.", "A fourth pole"),
 ("Simondon", "remade", ["Simondon — a bag of parts, or one part doing several jobs.svg"], "One to move and one to read, or one that does both",
  "A knob with a light beside it: one part to move and one to read. Against it, one motor that both senses and pushes, so the state comes back through the hand already on it. Fewer parts doing more is what Simondon calls a better-made object.",
  "The before and after are the palace's own, from Palace Philosophies and the Haptic Handwheel page; Simondon's page does not mention the handwheel. Nothing is built yet.",
  "Haptic Handwheel.", "The left side was a four-part machine neither page describes, with a 'buzzer' that pushes back and 'three joints to fail'. Redrawn as the palace's own two parts, with text large enough to read.", None),
 ("James Turrell", "remade", ["James Turrell — it is moving.svg"], "It is moving",
  "A window of colour that drifts from dusk-orange to deep blue over ten minutes and back over ten more, too slowly to see. Two fixed swatches beside it show where it began and where it is going.",
  "Ten minutes is the page's own figure for a Turrell fade. Whether you can see it move at that rate is still untested by eye.",
  None, "At ninety seconds the fade was probably visible, and a red progress bar marched under a piece that said nothing moves. Now ten minutes, no bar, and the unlabelled hourglass is gone.", None),
 ("Donella Meadows", "remade", ["Donella Meadows — the bathtub.svg"], "The bathtub",
  "One tub filled two ways, with a four-second lag between hand and water. Small turns settle on the line. Yanking the taps spills over the rim, drains to empty, and goes round again without ever settling.",
  "A small simulation written for this figure. The yanking hand turns eleven times harder, tap and drain share one top speed, and the drain is as strong as the tap: all my choices.",
  None, "The water stood above the rim, which a tub cannot do; it now spills. Labels sat on their own curves. A tub is drawn, and the choices are owned.", None),
 ("p5.js", "remade", ["p5.js — veil, don't clear.png"], "Veil, don't clear",
  "One flock at one moment, drawn two ways. Cleared each frame you see where the birds are. Veiled each frame you also see where they have just been.",
  "A boids flock of its own, built to the Flocking sketch's numbers (80 birds, a veil of 14 on an alpha range of 100), simulated in numpy and drawn on paper where the sketch is near-black. Not the same birds.",
  "Flocking, the page's second p5 job.",
  "The veil was 14 in 255 where the palace's sketch uses 14 in 100, so trails faded nearly three times too slowly. I called it the same flock and the page's first job; it is neither. Panels are stacked and larger.", None),
 ("Tree of Thoughts", "remade", ["Tree of Thoughts — a chain cannot go back.svg"], "A chain cannot go back",
  "A chain of five thoughts that went wrong at the second and cannot return to it, beside a tree that drops five dead ends, backs up once, and arrives.",
  "A schematic. No model was run.", None, "A dead-end node was drawn on top of the subtitle. The tree is moved down.", None),
 ("Rick Rubin", "remade", ["Rick Rubin — clear away what hides it.wav", "Rick Rubin — clear away what hides it — picture.svg"], "Clear away what hides it",
  "Eight layers at once, a voice and one guitar buried under the other six. One layer leaves each bar: shaker, arpeggio, pad, second guitar, drums, bass. What is left was playing the whole time, at the level it ends on.",
  "Synthesized, including the 'voice', a buzz through two formants. The full mix sits about 10 dB over the two that remain, so the whole thing gets much quieter as it clears. Nothing is added after bar one. The page also holds the objection that the song may not have been there to find.",
  "Dub Lineage: subtraction again, but only ever in one direction.",
  "Nothing hid the song: the voice was the loudest thing from bar one, and two of the six exits could not be heard. A levels fix; the order and the bars are unchanged.", None),
 # kept pieces whose words the challengers corrected
 ("Leibniz", "words", ["Leibniz — two clocks, no wire.wav", "Leibniz — two clocks, no wire — picture.svg"], "Two clocks, no wire",
  "First, two clocks set once and never touching: a wooden tock in the left ear, a metal tick in the right. They stay together because each keeps its own time. Then a wired pair: they start apart, plainly at different rates, and as the wire tightens they pull into step. The first pair is exactly together; the wired pair ends within a hundredth of a second. Only the second needed a wire.",
  "The first half is Leibniz's pre-established harmony. The second is two Kuramoto phases with rising coupling, which his page does not name: a neighbour leaking in.",
  "Kuramoto Coupling, in the wired half.", "Kept. 'Both pairs end in unison' was 8 ms off for the wired pair, and the Kuramoto leak was not owned.", None),
 ("Whitehead", "words", ["Whitehead — one occasion, then the society.wav", "Whitehead — one occasion, then the society — picture.svg"], "One occasion, then the society",
  "One grain, alone. It arises and is gone. Again. Then they arrive faster, until somewhere between twelve and fourteen seconds you stop hearing grains and hear a tone. Nothing in that tone persists: no grain lasts a tenth of a second. The tone is the pattern they hold together.",
  "The page's claim that the grain is the actual occasion and the cloud the society. In the picture the dots' small vertical scatter is only to keep them apart; it is not data.",
  None, "Kept. 'Near twelve seconds' was early by measurement: gaps persist until about fourteen.", None),
 ("John Cage", "words", ["John Cage — the coins decide.wav", "John Cage — the coins decide — picture.svg"], "The coins decide",
  "Sixteen sounds. For each, three coins were thrown six times, as for the I Ching, and the six lines chose the pitch, the length, the loudness, and whether the string is prepared. It opens on two and a half seconds of silence, because that was the first throw. One more of the sixteen came up silence too.",
  "Thrown once from the computer's random source and kept as thrown. The mapping from lines to sounds is mine; the result is not.",
  "Brian Eno, by a link label only: nothing of his is in the sound.", "Kept. The opening silence reads as a broken file unless the caption says it was thrown.", None),
 ("Yasujirō Ozu", "words", ["Yasujirō Ozu — the 180-degree rule and the 360-degree room.svg"], "The 180-degree rule and the 360-degree room",
  "Two people at a low table, seen from above. Hollywood keeps every camera on one side of the line between them. Ozu puts the camera on either side of it.",
  "The eight positions are a drawing choice; the page claims only that he crosses the axis routinely.",
  None, "Kept. 'Anywhere in the room' said more than the page does.", None),
 ("Dub Lineage", "words", ["Dub Lineage — the engineer plays.wav", "Dub Lineage — the engineer plays — picture.svg"], "The engineer plays",
  "Two bars of a full riddim. Then parts are pulled: drum and bass alone, then bass alone while an echo goes on repeating a rim shot that is no longer there. In bar seven the bass and kick drop out too, leaving hat and skank. Everything returns in the last bar.",
  "Synthesized here from nothing; the picture is drawn from the mix's own parts. The echo is a plain tap echo, which the Retrospective Delay page says its own delay is not.",
  "Retrospective Delay: the echo as memory of what was pulled.", "Kept. The caption skipped bar seven, and the leak borrowed more than the neighbour grants.", None),
]


def b64(d): return base64.b64encode(d).decode()


def figure(path):
    if path.endswith(".svg"): return f'<img loading="lazy" src="data:image/svg+xml;base64,{b64(open(path, "rb").read())}">'
    buf = io.BytesIO(); Image.open(path).convert("RGB").save(buf, "JPEG", quality=84); return f'<img loading="lazy" src="data:image/jpeg;base64,{b64(buf.getvalue())}">'


def audio(path):
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "a.m4a"); subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "128000", path, out], check=True)
        return f'<audio controls preload="none" src="data:audio/mp4;base64,{b64(open(out, "rb").read())}"></audio>'


recs, cards = [], []
for page, kind, files, title, cap, honest, leak, changed, near in R:
    for f in files: assert os.path.exists(os.path.join(HERE, f)), f
    recs.append({"page": page, "kind": kind, "files": files, "title": title, "caption": cap, "honest": honest, "leak": leak, "changed": changed, "near": near})
    media = "".join((audio if f.endswith(".wav") else figure)(os.path.join(HERE, f)) for f in sorted(files, key=lambda f: f.endswith(".wav"))) if kind != "words" or page in ("Leibniz", "Whitehead") else figure(os.path.join(HERE, [f for f in files if not f.endswith(".wav")][0]))
    cards.append(f'<section class="piece"><header><h2>{html.escape(page)}</h2><span class="kind">{kind}</span></header><h3>{html.escape(title)}</h3>'
                 f'<p class="chg">What changed: {html.escape(changed)}</p>{media}<p class="cap">{html.escape(cap)}</p>'
                 + (f'<p class="leak">Leaking in: {html.escape(leak)}</p>' if leak else "") + f'<p class="honest">{html.escape(honest)}</p></section>')
json.dump(recs, open(os.path.join(HERE, "remakes.json"), "w"), indent=1, ensure_ascii=False)
css = open(os.path.join(DS, "colors_and_type.css")).read() + open(os.path.join(DS, "bundle.css")).read(); js = open(os.path.join(DS, "transport.js")).read()
page = f"""<!doctype html><html lang="en" data-theme="paper"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Remakes</title>
<style>{css}
html,body{{margin:0;background:var(--ground-000);color:var(--ink);font-family:var(--font-mono,'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace)}}
main{{max-width:960px;margin:0 auto;padding:28px 16px 64px}}.top{{border:1.5px solid var(--ink);padding:14px 16px;margin-bottom:28px}}
.top h1{{font-size:18px;letter-spacing:.22em;margin:0 0 6px;text-transform:uppercase}}.top p{{margin:0;font-size:12px;line-height:18px;color:var(--ink-3)}}
.piece{{border-top:1.5px solid var(--ink);padding:14px 0 26px}}.piece header{{display:flex;align-items:baseline;gap:12px}}.piece h2{{font-size:15px;margin:0}}
.kind{{font-size:11px;color:var(--ink-3);margin-left:auto;text-transform:uppercase;letter-spacing:.12em}}.piece h3{{font-size:13px;font-weight:400;color:var(--ink-2);margin:4px 0 8px}}
.piece img{{display:block;width:100%;height:auto;border:1px solid var(--rule);margin-top:8px}}.chg{{font-size:12px;line-height:19px;margin:0 0 4px;color:var(--accent);max-width:84ch}}
.cap{{font-size:13px;line-height:21px;margin:12px 0 4px;max-width:72ch}}.leak{{font-size:12px;line-height:18px;margin:0 0 2px;color:var(--ink-2);max-width:80ch}}.honest{{font-size:11px;line-height:17px;margin:0;color:var(--ink-3);max-width:80ch}}
</style></head><body><main><div class="top"><h1>The remakes</h1>
<p>Light round, after the challenge of the first forty · 2026-11-10 · {sum(r["kind"] != "words" for r in recs)} pieces rebuilt, {sum(r["kind"] == "words" for r in recs)} with corrected words only.
The red line under each title says what was wrong. None of these has been challenged again.</p></div>{''.join(cards)}</main><script>{js}</script></body></html>"""
open(os.path.join(HERE, "remakes.html"), "w").write(page)
print("remakes.html", f"{len(page)/1e6:.1f} MB ·", len(recs), "records")
