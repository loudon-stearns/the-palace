#!/usr/bin/env python3
"""ear-check.py — the plan's ear check, made one click: Loudon hears Blood Compressor in Live.

One ride, written once below, becomes three things:

  drum-loop.wav                    the check's own beat (reference/paths.py drums), one bar
                                   at 100 bpm, which Live's Sampler plays once a bar.
  Blood Compressor ear check.als   a Live 12 Set: the loop in a Sampler, Blood Compressor
                                   after it, one clip per section named for what to listen
                                   for, every moving knob on an automation lane. Silent on
                                   open; press play.
  ear-check-preview.wav            the same ride through the plugin's own processBlock (the
                                   harness, plugin mode), to hear before Live opens.

Each section's makeup is measured, not guessed: a first render without makeup reads every
section's loudness, and makeup brings each to the same level, so the ear compares the shape
of the beat, not its volume. The loop's own level is then set so the loudest peak of the
whole ride sits under the Limiter on Main, which therefore never touches the punch; the
threshold moves down by the same amount, so the vessel squeezes exactly as it would at -36 dB
on the loop at full level (the lane reads lower than -36 for that reason).

The Set comes from the Shopkeeper's writer (Shop/Shopkeeper/probes/2026-10-20-ableton-session/
live-set.mjs), as Shepard Tone's play-through did. It makes instruments, so two things are
done here: Bypass, a switch, is handed to it as linear 0-1 so it can be ridden, and
drums-into-plugin.mjs lifts a Sampler holding the loop in front of the plugin.

    python3 ear-check.py
"""
import importlib.util
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
SET_OUT = HERE / "Blood Compressor ear check.als"
WAV_OUT = HERE / "ear-check-preview.wav"
LOOP = HERE / "drum-loop.wav"

TEMPO = 100
BEAT = 60.0 / TEMPO
BAR = 4 * BEAT
SR = 44100
PITCH = 60
CEILING_DB = -1.5        # the loudest peak of the ride, under the Limiter's -1

# ── the ride ────────────────────────────────────────────────────────────────────
# Values in the plugin's units. A number is held; a list is evenly spaced points with
# straight lines between (in the knob's own travel). Every section names every knob that
# moves anywhere, so each starts from a known place. Makeup is filled in by measurement.
LESSON = dict(bypass=0.0, threshold=-36.0, ratio=10.0, attack=0.08, release=0.3,
              sympathetic=0.0, hrv=0.0, age=0.0)
SECTIONS = [
    dict(LESSON, name="1 Bypass: the beat as it arrives", bars=4, bypass=1.0),
    dict(LESSON, name="2 Attack at its floor, 5 ms: the front of each hit slips past the nerve, then the vessel clamps and the beat goes flat behind it",
         bars=8, attack=0.005),
    dict(LESSON, name="3 Attack 80 ms: the body notices, then acts, and the kick's weight comes back", bars=8),
    dict(LESSON, name="4 Release 40 ms: the muscle lets go before the next hit, and the vessel pumps with the beat",
         bars=8, release=0.04),
    dict(LESSON, name="5 Attack ridden 5 to 200 ms and back: hear the punch open and close", bars=8,
         attack=[0.005, 0.2, 0.005]),
    dict(LESSON, name="6 A stressed body: Sympathetic rises, the systolic line drops and the reflex quickens", bars=8,
         sympathetic=[0.0, 1.0, 1.0, 0.0]),
    dict(LESSON, name="7 Breathing: heart-rate variability on, the squeeze swells and ebbs across the bars", bars=8, hrv=1.0),
    dict(LESSON, name="8 An old wall: Vessel age rises, the ratio climbs and the knee loses its give", bars=8,
         age=[0.0, 1.0, 1.0]),
    dict(LESSON, name="9 Your turn: the lesson's settings, the lanes let go when you grab a knob", bars=8),
]
SHOWN = ["threshold", "ratio", "knee", "attack", "release", "makeup", "bypass",
         "sympathetic", "hrv", "age"]


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


verify = load(VERIFY / "verify.py", "verify")
paths = load(PLUGIN / "reference" / "paths.py", "paths")


# ── the loop ────────────────────────────────────────────────────────────────────
def one_bar():
    t = np.arange(int(round(BAR * SR))) / SR
    return paths.drums(t, SR)


# ── the preview, and the measured makeup ────────────────────────────────────────
def render(loop_gain, makeups):
    harness = verify.find_harness(PLUGIN)
    table = json.loads(subprocess.run([str(harness), "params"], check=True, capture_output=True, text=True).stdout)
    taper = {m.group(1): (float(m.group(2)), float(m.group(3)), m.group(4)) for m in re.finditer(
        r'\{\s*"([^"]+)",\s*"[^"]+",\s*"[^"]*",\s*([-\d.e]+),\s*([-\d.e]+),\s*[-\d.e]+,\s*Taper::(\w+)',
        (PLUGIN / "src/Algorithm.h").read_text())}
    norm = lambda k, v: (math.log(v / taper[k][0]) / math.log(taper[k][1] / taper[k][0])) if taper[k][2] == "Log" else (v - taper[k][0]) / (taper[k][1] - taper[k][0])
    denorm = lambda k, x: (taper[k][0] * (taper[k][1] / taper[k][0]) ** x) if taper[k][2] == "Log" else taper[k][0] + x * (taper[k][1] - taper[k][0])

    total_bars = sum(s["bars"] for s in SECTIONS)
    steps = int(round((total_bars * BAR + 2.0) * SR))
    t_beats = np.arange(steps) / SR / BEAT
    rows = []
    for p in table["params"]:
        k = p["id"]
        row = np.full(steps, float(p["default"]))
        b0 = 0
        for i, s in enumerate(SECTIONS):
            span = s["bars"] * 4
            v = makeups[i] if k == "makeup" else s.get(k)
            m = (t_beats >= b0) & (t_beats < b0 + span) if i < len(SECTIONS) - 1 else (t_beats >= b0)
            if isinstance(v, list):
                xs = np.linspace(0, span, len(v))
                row[m] = [denorm(k, y) for y in np.interp(np.minimum(t_beats[m] - b0, span), xs, [norm(k, x) for x in v])]
            elif v is not None:
                row[m] = v
            b0 += span
        rows.append(row)
    rows = np.ascontiguousarray(np.stack(rows))
    bar = one_bar() * loop_gain
    reps = int(math.ceil(steps / bar.shape[1]))
    loop = np.tile(bar, reps)[:, :steps]
    loop[:, int(total_bars * BAR * SR):] = 0          # the Sampler stops with the last clip
    work = PLUGIN / "out"
    work.mkdir(exist_ok=True)
    r = verify.run_harness(harness, "plugin", rows, SR, loop.astype(np.float32).astype(np.float64), (), table, work)
    return r["out"]


def section_stats(out):
    stats, b0 = [], 0.0
    for s in SECTIONS:
        a, b = int(b0 * SR), int((b0 + s["bars"] * BAR) * SR)
        a += int(BAR * SR)                             # skip the first bar: the knobs have just moved
        x = out[:, a:b]
        stats.append((20 * math.log10(math.sqrt((x ** 2).mean())), 20 * math.log10(np.abs(x).max())))
        b0 += s["bars"] * BAR
    return stats


def make_preview():
    zero = [0.0] * len(SECTIONS)
    st = section_stats(render(1.0, zero))
    target = st[0][0]                                  # the bypassed beat's loudness
    makeups = [0.0] + [min(24.0, max(0.0, target - r)) for r, _ in st[1:]]
    out = render(1.0, makeups)
    st = section_stats(out)
    peak = max(p for _, p in st)
    gain_db = min(0.0, CEILING_DB - peak)
    # the compressor follows level, so the threshold moves down with the loop: the squeeze
    # is the same, and the whole ride is only quieter. Render again to prove it.
    shift_threshold(gain_db)
    out = render(10 ** (gain_db / 20), makeups)
    st = section_stats(out)
    verify.write_wav(WAV_OUT, out, SR)
    return gain_db, makeups, st


def shift_threshold(gain_db):
    for s in SECTIONS:
        s["threshold"] = round(s["threshold"] + gain_db, 2)


# ── the Set ─────────────────────────────────────────────────────────────────────
def make_set(loop_gain_db, makeups):
    verify.write_wav(LOOP, one_bar() * 10 ** (loop_gain_db / 20), SR)
    stage = HERE / "stage"
    if stage.exists():
        shutil.rmtree(stage)
    (stage / "src").mkdir(parents=True)
    shutil.copy(PLUGIN / "plugin.json", stage / "plugin.json")
    (stage / "build").symlink_to(PLUGIN / "build")
    (stage / "src/Algorithm.h").write_text((PLUGIN / "src/Algorithm.h").read_text().replace("Taper::Toggle", "Taper::Linear"))
    sections = [dict({k: v for k, v in s.items()}, makeup=round(makeups[i], 2)) for i, s in enumerate(SECTIONS)]
    rfile = HERE / "ear-check.live-set.json"
    rfile.write_text(json.dumps(dict(
        _about="Blood Compressor's ear check, made by plugin/live/ear-check.py: the check's drum loop, nine sections, each named for what to listen for; makeup measured so every section sits at the bypassed beat's loudness. Values in the plugin's units.",
        tempo=TEMPO, configure=SHOWN, silentOnOpen=True, sections=sections), indent=2) + "\n")
    sfz = HERE / "drum-loop.sfz"
    sfz.write_text(f"<region> sample=drum-loop.wav key={PITCH} pitch_keycenter={PITCH} amp_veltrack=0 ampeg_release=0.005\n")
    plug_tmp, samp_tmp = HERE / "_plugin.als", HERE / "_sampler.als"
    for f in (plug_tmp, samp_tmp):
        f.unlink(missing_ok=True)
    subprocess.run(["node", str(WRITER), "plugin", str(stage), "--recipe", str(rfile), "--out", str(plug_tmp)], check=True)
    subprocess.run(["node", str(WRITER), "library", str(sfz), "--out", str(samp_tmp), "--tempo", str(TEMPO)], check=True)
    subprocess.run(["node", str(HERE / "drums-into-plugin.mjs"), str(plug_tmp), str(samp_tmp), "4", str(PITCH)], check=True)
    plug_tmp.replace(SET_OUT)
    samp_tmp.unlink()
    sfz.unlink()
    shutil.rmtree(stage)
    subprocess.run(["node", str(WRITER), "check", str(SET_OUT)], check=True)


if __name__ == "__main__":
    gain_db, makeups, st = make_preview()
    print(f"loop level {gain_db:+.1f} dB; preview -> {WAV_OUT.relative_to(PALACE)}")
    b0 = 0.0
    for s, mk, (rms, pk) in zip(SECTIONS, makeups, st):
        print(f"  {b0:6.1f} s  makeup {mk:5.1f} dB  rms {rms:6.1f}  peak {pk:5.1f} dBFS  {s['name']}")
        b0 += s["bars"] * BAR
    make_set(gain_db, makeups)
