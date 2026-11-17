#!/usr/bin/env python3
"""Triage the deep sweep into draft works, and merge them into the sketch's catalog.

    python3 triage.py deep-2026-11-17.jsonl ../catalog-draft.json ../catalog-draft-v2.json

Folders become works three ways. A named group (RULES) gathers folders that are plainly one
work — every Harmonic Looper patch, every numbered Valen track. A folder big or named enough
to stand alone becomes its own work (SOLO). Every other made folder falls into a sketchbook,
one per year, so a hundred two-file Live sketches read as one practice and not as a hundred
works. Every date is `assumed`: these are file dates, and the interview turns them blue.
Umbrella entries from the first sketch that this sweep splits (Classes, _Online, Emerson,
With Valen) are replaced by what was inside them.
"""
import json, re, sys, collections

rows = [json.loads(l) for l in open(sys.argv[1]) if l.strip()]
old = json.load(open(sys.argv[2]))

# id, title, kind, folder-name pattern, area pattern, note, palace page it may have seeded
RULES = [
  ("granular-poem", "Granular Poem", "recording", r"^granular ?poe[mn]|^granularpoe", "Archive", "Three folders, 2009 to 2011: a piece he came back to.", None),
  ("ldn-loopers", "The L-Don loopers", "instrument", r"l-?don ?loop|^looper|loopchopper|^loop project", "Archive", "Five looper projects, 2011–2012: L-Don Loopus Maximus and its children.", None),
  ("buchla", "Buchla sessions and slices", "recording", r"^buchla", "Archive", "252 normalized slices: a sample set cut from a Buchla?", None),
  ("afrodjmac", "Sample packs with AfroDJMac", "instrument", r"afrodjmac", "Archive", "Super Tape Drums (974 files) and Tape Hiss Vinyl Crackle, mid-2012.", None),
  ("rach", "Rach for Me", "recording", r"^rach", "Archive", "Two projects, December 2012.", None),
  ("ableton-videos-2012", "Ableton videos, 2012", "course", r"livevideotest|ableton video", "Archive", "Two video projects in the week the Ableton Series was cut?", None),
  ("algovrhythm", "AlgoVRhythm", "instrument", r"^algovrhythm", "Archive", "Two folders, one 'for website': a released device?", None),
  ("singing-forest", "Singing Forest", "recording", r"^singing (forest|trees)", "Archive", "Two projects, June 2014.", None),
  ("the-reel", "The REEL", "instrument", r"reel", "", "MG Reel, The REEL, MGContactandREEL and the REEL pedal patches, with files dated 2009 to 2019: over 8,000 files. What is MG, and what did the REEL do? Listed, not opened (Max work is paused).", None),
  ("roli", "ROLI work", "instrument", r"^roli", "Archive", "A config and 85 files, 2015–2016.", None),
  ("metalish", "Metalish", "recording", r"^metalish", "Archive", "Two projects, August 2018.", None),
  ("harmonic-looper", "Harmonic Looper", "instrument", r"harm(onic)? ?looper|^harmonic \.maxpat|harm looper", "Current", "Thirteen patches in two months, August–September 2019: refactors, a Pd port, a Max for Live build. Listed, not opened (Max work is paused).", None),
  ("chats", "The chats", "talk", r"chat", "Current", "Riff Chat 1, Aggressive bass chat 12, Chat Collab, 2019–2020, and the 4,543-file 'Online Chats' in the Berklee backup. A numbered series: how many, and where were they shown?", None),
  ("concerts-2019", "Spring concerts, 2019", "performance", r"expo 74|cwp concert", "Current", "Expo 74 and the CWP Concert, April 2019.", None),
  ("md-canon", "Canon pieces, 2020", "recording", r"md-cannon|canon drops", "Current", "MD-Cannon and Canon Drops, December 2020.", None),
  ("lessons-2024", "Private lessons, 2024", "course", r"^lessons$|^mix lesson", "Current", "Two folders, spring 2024.", None),
  ("crushing-you", "Crushing You", "recording", r"^crushing you", "Current", "Two projects, one 'for Amy', January 2025.", None),
  ("feel-something", "Feel Something", "recording", r"^feel something", "Current", "Two versions, January 2025.", None),
  ("techno-stab", "Epic techno bass stab", "recording", r"epic techno bass stab", "Current", "Two versions, January 2025.", None),
  ("acid-rumble", "Acid and Rumble", "recording", r"^acid and rumble", "Current", "Two versions, November 2025.", None),
  ("valen-tracks-2026", "The numbered tracks, with Valen", "recording", r"^track \d", "Valen", "Forty-two numbered track folders, up to Track 44, January to November 2026, most with a title: Veil, Descontrol, Desesperanza, Dark Forest, Ascension, Nefertiti, Eclipse, Who Made This, Moon Poppy. One body of work or several releases?", None),
  ("valen-remixes", "Remixes, with Valen", "recording", r"^remixes$|smalltown boy", "Valen", "1,357 files in 2025, and a Smalltown Boy remix in 2026.", None),
  ("valen-songs", "New song ideas, with Valen", "recording", r"new song ideas|loudon ideas|old projects|melodic house", "Valen", "Four folders, 2024–2026.", None),
  ("valen-education", "Teaching Valen", "course", r"^education 2$", "Valen", "238 files, 2024: lessons? Who is Valen to the work, student, collaborator or both?", None),
  ("valen-sound", "Presets and the hardware-synth set, with Valen", "instrument", r"presets|hardware synths", "Valen", "14,671 preset files and an Ableton set for the hardware synths, 2025–2026.", None),
  ("estefa", "Estefa collaboration", "recording", r"estefa", "Valen", "1,695 files, summer 2026.", None),
  ("whats-inside", "What's Inside of Me", "recording", r"what's inside", "Valen", "840 files, June 2026.", None),
  ("fellow-producers", "Fellow producer collaborations", "recording", r"fellow producer", "Valen", "829 files, spring 2026.", None),
]
SOLO = {  # folder name → (title, kind, note, palace)
  "Comp for synth": ("Composition for synth", "recording", "The oldest made folder on the drive: February 2008.", None),
  "Harmonic Grooves Project": ("Harmonic Grooves", "recording", "150 files, December 2008.", None),
  "RalandLdon_Technoirganic Project": ("Technoirganic", "recording", "A collaboration (Ral and L-Don?), September 2010.", None),
  "All we are Project": ("All We Are", "recording", "29 files, September 2010.", None),
  "EmilyDuffSite": ("A website for Emily Duff", "tool", "274 files, November 2010; Dufforama 2016 may be the same circle.", None),
  "Ramon": ("Ramon", "recording", "6,312 files, median February 2011: a collaborator's archive or a body of work?", None),
  "SXSW present Project": ("SXSW presentation", "talk", "March 2012.", None),
  "Smiling Faces Project": ("Smiling Faces", "recording", "49 files, April 2012.", None),
  "Iris Presets and Videos": ("Iris presets and videos", "instrument", "May 2012: sound design for iZotope Iris?", None),
  "RickVSVarese Project": ("Rick vs. Varèse", "recording", "June 2012.", None),
  "WorkshopSampling-1 Project": ("Sampling workshop", "course", "76 files, August 2012.", None),
  "HouseProgression2_3 Project": ("House progressions", "course", "143 files, November 2012: a lesson build?", None),
  "Chatter Project": ("Chatter", "recording", "90 files, March 2013.", None),
  "Spores Project": ("Spores", "recording", "63 files, April 2013.", None),
  "NiceVoiceInstrument Project": ("A voice instrument", "instrument", "74 files, April 2013. Thirteen years before Talking Keyboard.", "Talking Keyboard"),
  "Black Box Performance": ("Black Box performance", "performance", "163 files, December 2013.", None),
  "Jam with Bowen Project": ("Jam with Bowen", "recording", "May 2014.", None),
  "Novation Clinic Project": ("Novation clinic", "talk", "July 2014.", None),
  "Jam Symposium": ("Jam Symposium", "talk", "77 files, February 2015.", None),
  "Jookah -TooKah Project": ("Jookah-TooKah", "recording", "121 files, August 2015.", None),
  "Synthesis MOOC": ("Synthesis MOOC", "course", "142 files, January 2016. The online synthesis course; does Synthesis Notes come from here?", "Synthesis Notes (Loudon)"),
  "Cancer DOJO": ("Cancer DOJO", "recording", "103 files, March 2016.", None),
  "EWAO BPC files": ("EWAO BPC files", "recording", "119 files, June 2016.", None),
  "Loudon <-> Danielle": ("With Danielle", "recording", "57 files, September 2016.", None),
  "Dither proofs Project": ("Dither proofs", "course", "October 2016: a listening proof, the same move the palace's proofs make now.", None),
  "FrogFlip Project": ("FrogFlip", "recording", "36 files, November 2016.", None),
  "ALF": ("ALF", "recording", "1,836 files, December 2016.", None),
  "Shanghai 2017": ("Shanghai, 2017", "performance", "152 files, August 2017.", None),
  "Shelter Cover Project": ("Shelter (cover)", "recording", "August 2017.", None),
  "Great American Songbook 2018": ("Great American Songbook, 2018", "performance", "February 2018.", None),
  "Trackaday Archive": ("Track a day", "recording", "1,580 files, median March 2021: a daily making practice.", None),
  "Kadenze_Kontakt_MOOC - Session 1 Improv after video": ("Kontakt MOOC on Kadenze", "course", "March 2022.", None),
  "MIDI clip info Project": ("MIDI clip info", "tool", "October 2023.", None),
  "Asylum": ("Asylum", "recording", "8,296 files, August 2018.", None),
  "REcording Unhinged": ("Recording Unhinged", "recording", "February 2019.", None),
  "SetList-2.03.amxd": ("SetList", "instrument", "A Max for Live device at version 2.03, April 2019. Listed, not opened.", None),
  "2019 commencement": ("Commencement, 2019", "performance", "250 files, May 2019.", None),
  "Rise and Fall - LDN TWEAKS Done Project": ("Rise and Fall (his tweaks)", "recording", "266 files, July 2019.", None),
  "Spencer odds N Ends": ("With Spencer", "recording", "515 files, September 2019.", None),
  "Zakir Hussain": ("Zakir Hussain", "performance", "536 files, November 2019. A concert, a recording, a class?", None),
  "Queen Showcase stuff": ("Queen showcase", "performance", "279 files, December 2019.", None),
  "MUXD": ("MUXD", "recording", "1,269 files, April 2020.", None),
  "WaveTable Creator": ("WaveTable Creator", "tool", "77 files, July 2020: six years before the wavetable work in the palace.", "Generative Wavetable Libraries"),
  "Loudon LED interview": ("The LED interview", "talk", "94 files, August 2020.", None),
  "That Beat Project": ("That Beat", "recording", "181 files, February 2024.", None),
  "You Wouldn't believe Project": ("You Wouldn't Believe", "recording", "133 files, June 2024.", None),
  "Lovely Tines Project": ("Lovely Tines", "recording", "85 files, February 2025.", None),
  "Vocal Processing Project": ("Vocal processing", "course", "50 files, February 2025.", None),
  "My Mind Final Mix for LDN Project": ("My Mind (final mix)", "recording", "November 2025: a mix he made for someone.", None),
  "PR bass Project": ("PR bass", "recording", "78 files, December 2025.", None),
  "Metric Modulation LDN Example Project": ("Metric modulation example", "course", "March 2026: the example behind the palace page?", "Metric Modulation"),
  "1. Loudon Folder": ("His folder in the Valen share", "recording", "2,092 files, median 2011: older work he brought into the share.", None),
  "Foundations": ("Foundations, at Emerson", "course", "265 files, median November 2012. Taught or taken?", None),
  "Experimental Production": ("Experimental Production, at Emerson", "course", "279 files, median March 2013.", None),
  "New Media": ("New Media, at Emerson", "course", "357 files, median October 2013.", None),
  "Anyamation": ("Anyamation", "course", "125 files, March 2015.", None),
  "Thesis": ("Thesis, at Emerson", "paper", "5,096 files, median April 2015. Is this the thesis that Meaning and the Link came from?", "Meaning and the Link"),
  "_Online": ("Online lessons, 2009", "course", "125 files, July 2009.", None),
  "_Synthesis Lessons": ("Synthesis lessons", "course", "278 files, November 2009.", "Synthesis Notes (Loudon)"),
  "_Techniques lessons": ("Techniques lessons", "course", "92 files, December 2009.", None),
  "461": ("Class folder “461”", "course", "July 2011, beside 261 and 361. A course number?", None),
  "CPEMS": ("CPEMS", "course", "March 2015: an early form of CPEM?", None),
  "40 measure tracks Project": ("Forty-measure tracks", "course", "February 2016.", None),
  "ALT Sampling": ("Sampling (ALT), online", "course", "May 2018.", None),
  "BIMMOOC": ("BIM MOOC", "course", "250 files, May 2018.", None),
  "ALT Non-Lin": ("Non-Linear (ALT), online", "course", "219 files, September 2018.", None),
  "Synthesis": ("Synthesis, online", "course", "784 files, April 2019.", None),
}
SKIP = re.compile(r"^filter proof project$|possibleduplicates|selective sync conflict|\bcopy\b|backup", re.I)

def name(r): return r["src"].split("/")[-1]
def ym(d): return d[:7] if d else None
def span(rs):
    ms = sorted(r["median"] for r in rs if r["median"])
    a, b = ym(ms[0]), ym(ms[-1])
    return f"~{a}" if a == b else f"~{a}..{b}"

works, used, sketch = [], set(), collections.defaultdict(list)
made = [r for r in rows if r["signal"] == "made"]
for wid, title, kind, pat, area, note, palace in RULES:
    hit = [r for r in made if r["src"] not in used and area in r["area"] and re.search(pat, name(r), re.I)]
    if not hit: continue
    used |= {r["src"] for r in hit}
    w = dict(id=wid, title=title, kind=kind, when=span(hit), prov="assumed",
             src="; ".join(r["src"] for r in hit[:4]) + (f"; +{len(hit)-4} more" if len(hit) > 4 else ""),
             note=note, files=sum(r["files"] for r in hit), folders=len(hit))
    if palace: w["palace"] = palace
    works.append(w)
for r in made:
    if r["src"] in used or SKIP.search(name(r)): continue
    if name(r) in SOLO:
        title, kind, note, palace = SOLO[name(r)]
        w = dict(id=re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-"), title=title, kind=kind,
                 when=span([r]), prov="assumed", src=r["src"], note=note, files=r["files"], folders=1)
        if palace: w["palace"] = palace
        works.append(w); used.add(r["src"])
    elif r["median"] and ("Archive" in r["area"] or "Current" in r["area"]):
        sketch[r["median"][:4]].append(r); used.add(r["src"])
for y, rs in sorted(sketch.items()):
    names = [re.sub(r" Project$", "", name(r)) for r in sorted(rs, key=lambda r: -r["files"])]
    works.append(dict(id=f"sketchbook-{y}", title=f"Sketchbook, {y}", kind="recording", when=f"~{y}",
        prov="assumed", src=f"{len(rs)} small Live projects in _Projects Archive and _Projects Current",
        note=f"{len(rs)} sketches: " + ", ".join(names[:6]) + ("…" if len(names) > 6 else "") + ". Any of them a finished piece?",
        files=sum(r["files"] for r in rs), folders=len(rs)))

# Merge: drop the umbrellas this sweep split, fold the RNBO sine patch into its plugin, keep the rest.
SPLIT = {"classes", "online", "valen", "emerson"}
keep = [w for w in old if w["id"] not in SPLIT]
for w in keep:
    if w["id"] == "simple-sine": w["note"] = "A first plugin build, March 2025, beside SimplePolyphonicRNBO.maxpat in _Projects Current."
emerson = dict(id="emerson", title="Emerson College", kind="course", when="~2012..2015", prov="assumed",
    src="Dropbox/_PERSONAL/Emerson, split below", note="Study, teaching or both? The folder holds Foundations, Experimental Production, New Media, Anyamation and a 5,096-file Thesis.")
out = keep + [emerson] + works
ids = collections.Counter(w["id"] for w in out)
assert all(v == 1 for v in ids.values()), [k for k, v in ids.items() if v > 1]
json.dump(out, open(sys.argv[3], "w"), ensure_ascii=False, indent=1)
k = collections.Counter(w["kind"] for w in out)
print(f"{len(old)} → {len(out)} works ({len(works)} from the deep sweep, {sum(len(v) for v in sketch.values())} folders in {len(sketch)} sketchbooks); by kind {dict(k)}")
left = [r for r in made if r["src"] not in used]
print(f"{len(left)} made folders not placed:", [name(r) for r in left])
