#!/usr/bin/env python3
"""play-through.py — the plan's first move, made one click: Loudon plays Shepard Tone.

One ride, written once below, becomes two things:

  Shepard Tone play-through.als   a Live 12 Set: the plugin on a MIDI track, one clip per
                                  section (named for what to listen for), every moving knob
                                  on an automation lane. Silent on open; press play.
  play-through-preview.wav        the same ride through the plugin's own processBlock
                                  (the harness, plugin mode), so it can be heard before
                                  Live opens. WAVs stay on this Mac.

The Set comes from the Shopkeeper's writer (Shop/Shopkeeper/probes/2026-10-20-ableton-session/
live-set.mjs, the one that made the Frustration Set Loudon played on 2026-10-21). Two things
it cannot do on its own, done here:
  - it rides only float knobs. Wave and Track the note are a choice and a switch, but a
    two-way choice and a switch are 0 and 1 on the wire, so the writer is handed a copy of
    the parameter table that calls them linear 0–1 (stage/src/Algorithm.h). Nothing else changes.
  - its clips hold one note. The first and third sections need scales, so those clips'
    notes are rewritten in the Set after the writer is done.

    python3 play-through.py            # both
    python3 play-through.py --set      # the Set only
    python3 play-through.py --preview  # the render only
"""
import argparse
import gzip
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
PLUGIN = HERE.parent
PALACE = PLUGIN.parents[2]
WRITER = PALACE / "Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs"
VERIFY = PALACE / "Projects/VST Template/machinery/tools"
SET_OUT = HERE / "Shepard Tone play-through.als"
WAV_OUT = HERE / "play-through-preview.wav"

TEMPO = 100
BEAT = 60.0 / TEMPO
SR = 44100

# ── the ride ────────────────────────────────────────────────────────────────────
# Values in the plugin's units. A number is held; a list is evenly spaced points with
# straight lines between (Live draws them in the knob's own travel, so a Log knob sweeps
# evenly by ear). Every section names every knob that moves anywhere, so each section
# starts from a known place. Notes are (beat, beats long, MIDI note); without notes, the
# writer's single held middle C plays the section.
STEADY = dict(width=1.4, wave=1.0, level=-6.0)           # held for the whole ride
SECTIONS = [
    dict(name="1 Twelve keys, round and round: the keys fall back, the ear keeps climbing",
         bars=13, center=440.0, glide=0.001, climb=0.0, tone=4.0, resonance=0.0, drift=0.0, track_note=0.0,
         notes=[(1 + j, 1.0, 60 + j % 12) for j in range(48)]),
    dict(name="2 Hold one note, turn Climb up then down: the endless glissando",
         bars=16, center=440.0, glide=0.15, climb=[0, 4, 4, 4, 0, -4, -4, -4, 0], tone=4.0, resonance=0.0, drift=0.0, track_note=0.0),
    # Drift spreads the glide that chases the keys; Climb is added after it, so a held note
    # on Climb never drifts. The break needs a climb played on the keys: a semitone a beat,
    # never folding back (a fold would glide down eleven semitones), with the glide on.
    dict(name="3 Break it, the first way: a scale up the keys with Drift rising, and the octaves stop agreeing",
         bars=12, center=440.0, glide=0.4, climb=0.0, tone=4.0, resonance=0.0, drift=[0, 0.8, 0.8, 0], track_note=0.0,
         notes=[(j, 1.0, 42 + j) for j in range(48)]),
    dict(name="4 Break it, the second way: Track the note, and the brightness steps once an octave",
         bars=8, center=440.0, glide=0.15, climb=3.0, tone=8.0, resonance=0.5, drift=0.0, track_note=1.0),
    dict(name="5 Mend it: Track the note off, and the steps smooth away",
         bars=6, center=440.0, glide=0.15, climb=3.0, tone=8.0, resonance=0.5, drift=0.0, track_note=0.0),
    dict(name="6 Move the window: the same climb, lit low, then high, then low",
         bars=10, center=[120, 1600, 120], glide=0.15, climb=2.0, tone=4.0, resonance=0.0, drift=0.0, track_note=0.0),
]
SHOWN = ["center", "width", "glide", "climb", "wave", "tone", "resonance", "drift", "track_note", "level"]


def recipe():
    return dict(
        _about="Shepard Tone's play-through, made by plugin/live/play-through.py: six sections, each named for what to listen for. Values in the plugin's units.",
        tempo=TEMPO, configure=SHOWN, silentOnOpen=True, set=STEADY,
        sections=[{k: v for k, v in s.items() if k != "notes"} for s in SECTIONS])


# ── the Set ─────────────────────────────────────────────────────────────────────
def stage_folder(stage):
    """A copy of the plugin folder as the writer reads it: plugin.json, the built bundle,
    and the parameter table with the choice and the switch called linear 0–1."""
    if stage.exists():
        shutil.rmtree(stage)
    (stage / "src").mkdir(parents=True)
    shutil.copy(PLUGIN / "plugin.json", stage / "plugin.json")
    (stage / "build").symlink_to(PLUGIN / "build")
    src = (PLUGIN / "src/Algorithm.h").read_text()
    src = src.replace("Taper::Choice", "Taper::Linear").replace("Taper::Toggle", "Taper::Linear")
    (stage / "src/Algorithm.h").write_text(src)


def midi_notes_xml(notes, next_id_start=1):
    by_pitch = {}
    nid = next_id_start
    for beat, length, pitch in sorted(notes):
        by_pitch.setdefault(pitch, []).append(
            f'<MidiNoteEvent Time="{beat:g}" Duration="{length:g}" Velocity="100" OffVelocity="64" NoteId="{nid}" />')
        nid += 1
    tracks = "\n".join(
        f'<KeyTrack Id="{i}">\n<Notes>\n' + "\n".join(ev) + f'\n</Notes>\n<MidiKey Value="{p}" />\n</KeyTrack>'
        for i, (p, ev) in enumerate(sorted(by_pitch.items())))
    return "<KeyTracks>\n" + tracks + "\n</KeyTracks>", nid


def patch_clip_notes(als):
    """Rewrite the notes of each section that carries its own, found by the clip's name."""
    xml = gzip.decompress(als.read_bytes()).decode("utf-8")
    for s in SECTIONS:
        if "notes" not in s:
            continue
        name = s["name"].replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")
        at = xml.find(f'<Name Value="{name}" />')
        start = xml.rfind("<MidiClip ", 0, at)
        end = xml.find("</MidiClip>", at)
        if at < 0 or start < 0 or end < 0:
            sys.exit(f"no clip named {s['name']!r} in the Set")
        clip = xml[start:end]
        keys, next_id = midi_notes_xml(s["notes"])
        clip2 = re.sub(r"<KeyTracks>[\s\S]*?</KeyTracks>|<KeyTracks />", lambda m: keys, clip, count=1)
        clip2 = re.sub(r"<NoteIdGenerator>[\s\S]*?</NoteIdGenerator>",
                       f"<NoteIdGenerator>\n<NextId Value=\"{next_id}\" />\n</NoteIdGenerator>", clip2, count=1)
        if clip2 == clip:
            sys.exit(f"could not rewrite the notes of {s['name']!r}")
        xml = xml[:start] + clip2 + xml[end:]
    als.write_bytes(gzip.compress(xml.encode("utf-8")))


def make_set():
    stage = HERE / "stage"
    stage_folder(stage)
    rfile = HERE / "play-through.live-set.json"
    rfile.write_text(json.dumps(recipe(), indent=2) + "\n")
    tmp = HERE / "_writer-out.als"
    if tmp.exists():
        tmp.unlink()
    subprocess.run(["node", str(WRITER), "plugin", str(stage), "--recipe", str(rfile), "--out", str(tmp)], check=True)
    patch_clip_notes(tmp)
    tmp.replace(SET_OUT)
    shutil.rmtree(stage)
    subprocess.run(["node", str(WRITER), "check", str(SET_OUT)], check=True)


# ── the preview ─────────────────────────────────────────────────────────────────
def make_preview():
    sys.path.insert(0, str(VERIFY))
    import verify  # VST Template's shared machinery: the harness runner and the wav writer
    harness = verify.find_harness(PLUGIN)
    table = json.loads(subprocess.run([str(harness), "params"], check=True, capture_output=True, text=True).stdout)
    spec = {p["id"]: p for p in table["params"]}
    taper = {}   # read the tapers from Algorithm.h, as the writer does
    for m in re.finditer(r'\{\s*"([^"]+)",\s*"[^"]+",\s*"[^"]*",\s*([-\d.e]+),\s*([-\d.e]+),\s*[-\d.e]+,\s*Taper::(\w+)',
                         (PLUGIN / "src/Algorithm.h").read_text()):
        taper[m.group(1)] = (float(m.group(2)), float(m.group(3)), m.group(4))

    def norm(k, v):
        lo, hi, t = taper[k]
        return (math.log(v) - math.log(lo)) / (math.log(hi) - math.log(lo)) if t == "Log" else (v - lo) / (hi - lo)

    def denorm(k, x):
        lo, hi, t = taper[k]
        return math.exp(math.log(lo) + x * (math.log(hi) - math.log(lo))) if t == "Log" else lo + x * (hi - lo)

    total_beats = sum(s["bars"] * 4 for s in SECTIONS)
    steps = int(round((total_beats * BEAT + 2.0) * SR))     # two seconds of release after the end
    t_beats = np.arange(steps) / SR / BEAT
    rows = []
    for p in table["params"]:
        k = p["id"]
        row = np.full(steps, float(STEADY.get(k, p["default"])))
        b0 = 0
        for s in SECTIONS:
            span = s["bars"] * 4
            v = s.get(k)
            m = (t_beats >= b0) & (t_beats < b0 + span) if s is not SECTIONS[-1] else (t_beats >= b0)
            if isinstance(v, list):   # straight lines in the knob's travel, as Live draws them
                xs = np.linspace(0, span, len(v))
                ys = [norm(k, x) for x in v]
                row[m] = [denorm(k, y) for y in np.interp(np.minimum(t_beats[m] - b0, span), xs, ys)]
            elif v is not None:
                row[m] = v
            b0 += span
        rows.append(row)
    rows = np.ascontiguousarray(np.stack(rows))

    notes, b0 = [], 0
    for s in SECTIONS:
        for beat, length, pitch in s.get("notes", [(0, s["bars"] * 4, 60)]):
            notes.append(((b0 + beat) * BEAT, length * BEAT, pitch, 100))
        b0 += s["bars"] * 4
    events = verify.note_events(dict(notes=notes), SR)
    work = PLUGIN / "out"
    work.mkdir(exist_ok=True)
    r = verify.run_harness(harness, "plugin", rows, SR, None, events, table, work)
    out = r["out"]
    verify.write_wav(WAV_OUT, out, SR)
    peak = float(np.max(np.abs(out)))
    print(f"preview: {steps / SR:.1f} s, peak {20 * math.log10(max(peak, 1e-9)):.1f} dBFS -> {WAV_OUT.relative_to(PALACE)}")
    # where each section starts, for the board
    b0 = 0
    for s in SECTIONS:
        print(f"  {b0 * BEAT:6.1f} s  {s['name']}")
        b0 += s["bars"] * 4
    return out, r["probes"]


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--set", action="store_true")
    a.add_argument("--preview", action="store_true")
    a = a.parse_args()
    both = not (a.set or a.preview)
    if a.set or both:
        make_set()
    if a.preview or both:
        make_preview()
