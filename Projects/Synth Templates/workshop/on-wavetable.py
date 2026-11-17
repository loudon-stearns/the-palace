#!/usr/bin/env python3
"""Synth Templates — a card's Ableton Wavetable mapping, made into a real .adv preset Loudon drops on a track in Live.

usage: ~/.venvs/palace-vital/bin/python on-wavetable.py [house-bass]
  needs pyyaml and mido (the palace-vital venv has both) and Generative Preset Development's ableton-wavetable/ beside this project.
  writes proofs/<date>-on-wavetable/
    House Bass (Synth Templates).adv   the preset: drag it onto a MIDI track in Live 12
    house-bass-pattern.mid             the reference's own notes (four offbeat eighths, each a 16th long, C2, velocity 100, 124 bpm)
    house-bass-reference.wav           a copy of renders/house-bass.wav, the site voice's take, to set beside Live's
    house-bass-wavetable.json          every value written, its unit, how sure it is, and why

Unlike Vital, Wavetable cannot be hosted here, so nothing is rendered: the proof is the file loading in Live and Loudon's ear.
The preset starts from Live's factory init Wavetable (GPD's decompressed copy), so nothing is inherited from a designed sound.

What this cycle settled from evidence on this Mac, not the manual (2026-11-17):
  * Basic Shapes is four 1024-sample frames, measured from Live's own file
    (App-Resources/Builtin/Samples/Vector/Sprites/Vector_Sprite_Basics Basic Shapes.wav): sine, triangle, saw, square.
    Its harmonics prove it: frame 3 holds only odd harmonics at 1/n, frame 2 every harmonic at 1/n. So the square is Position 1.0.
  * The hidden modulation slots, read from the 14 factory presets' routings: slot 5 sits on Amp at exactly 50 % in 11 of them
    (velocity to volume, Wavetable's default), slot 7 on pitch at 1/24 (bend, ±2 of 48 semitones), slot 6 on pitch at −1 in
    Bunker Kick (key pitch cancelled: a fixed-pitch kick) and on Filter 1 at 1.0 in Vocal Territory (key tracking), slot 9 on
    both LFOs' amount at 100 % (mod wheel fades vibrato in), slot 12 a near-copy of slot 9 (MPE slide). Slot 1 drives Bunker
    Kick's pitch and filter at 100 %, a pitch envelope. So slots 0–4 are the Matrix's rows in order: Amp Env, Env 2, Env 3,
    LFO 1, LFO 2, and the filter pluck is Env 2 on slot 1. Strong, not yet read off the Matrix in Live; GPD's census reads slot 1 as Env 3,
    so Env 3 carries the same pluck and the sound is right under either reading.
  * The filter's slope is its own switch, Voice_Filter1_Slope (1 = 24 dB), apart from the circuit: factory presets pair slope 1
    with circuits 1, 2 and 3. GPD's describer reads the slope from the circuit index instead and calls this preset 12 dB.
  * MonoPoly is 0 for mono: Abdominal Bass, 37th Street and A Wobble Modwheel (bass, lead, mono wobble) carry 0; the init's 1 is poly.
Still a reading, not a sighting: the filter-envelope amount as a share of the knob's ten octaves (20 Hz–20.48 kHz), the
sub's Transpose index (1 = an octave down), and Clean's index (0) in the circuit list.
"""
import sys, os, json, math, datetime, pathlib, shutil
import yaml, mido

HERE = pathlib.Path(__file__).parent
GPD = HERE.parents[1] / "Generative Preset Development" / "ableton-wavetable"
sys.path.insert(0, str(GPD))
from wavetable_writer import read_adv, write_adv, get_param       # noqa: E402
from generate_preset import set_any, set_mod, get_mods, set_text   # noqa: E402

CARD = sys.argv[1] if len(sys.argv) > 1 else "house-bass"
INIT = GPD / "decompressed-samples" / "Instruments__Wavetable.xml"
OUT = HERE / "proofs" / f"{datetime.date.today().isoformat()}-on-wavetable"
KNOB_OCTAVES = math.log2(20480 / 20)          # Filter 1 Freq runs 20 Hz to 20.48 kHz: ten octaves
SLOT = {"amp_env": 0, "env2": 1, "env3": 2, "lfo1": 3, "lfo2": 4, "velocity": 5, "aftertouch": 8, "modwheel": 9, "slide": 12}


def house_bass(voc):
    """The card's mappings.wavetable rows, in Wavetable's own parameter names. Each entry: (param, value, unit, sure, why)."""
    T = lambda w: float(voc["time"][w])
    rel = 0.18   # both releases: Vital measured 1.8x the 'short' word (a stage that ends at its time); assumed the same here
    depth_oct = 3.5
    return [
        ("MonoPoly", 0, "0 mono · 1 poly", "near", "mode: mono; 0 is what the factory mono bass and leads carry"),
        ("Voice_Global_Glide", 0, "s", "exact", "glide: none"),
        ("Voice_Unison_Mode", 0, "0 none", "exact", "one voice, no unison"),
        ("Voice_Oscillator1_On", "true", "", "exact", "osc 1 on"),
        ("SpriteName1", "Basic Shapes", "wavetable name", "exact", "Live's own sine–triangle–saw–square table"),
        ("Voice_Oscillator1_Wavetables_WavePosition", 1.0, "0..1 across 4 frames", "exact", "the square frame, measured from the table's harmonics"),
        ("Voice_Oscillator1_Effects_EffectMode", 0, "0 none", "exact", "no warp or fold on the square"),
        ("Voice_Oscillator1_Gain", 1.0, "linear", "exact", "osc 1 at full"),
        ("Voice_Oscillator2_On", "false", "", "exact", "osc 2 not used"),
        ("Voice_SubOscillator_On", "true", "", "exact", "the sub on"),
        ("Voice_SubOscillator_Tone", 0, "0 = pure sine", "exact", "a sine"),
        ("Voice_SubOscillator_Transpose", 1, "index; 1 = one octave down", "near", "one octave under osc 1; the index's meaning is read, not seen"),
        ("Voice_SubOscillator_Gain", 0.5011875, "linear (−6 dB)", "exact", "half of osc 1"),
        ("Voice_Filter1_On", "true", "", "exact", "filter 1 on"),
        ("Voice_Filter1_Type", 0, "0 lowpass/highpass", "exact", "low pass"),
        ("Voice_Filter1_CircuitLpHp", 0, "0 Clean", "near", "Clean: closest to the reference voice's neutral filter; OSR or MS2 add grit, a taste move"),
        ("Voice_Filter1_Slope", 1, "0 = 12 dB · 1 = 24 dB", "near", "24 dB, the essential slope"),
        ("Voice_Filter1_Frequency", 300.0, "Hz", "exact", "'dark', vocabulary.yaml"),
        ("Voice_Filter1_Resonance", 0.4, "0..1.25 (shown as %)", "near", "a clear vowel, short of a whistle"),
        ("Voice_Filter2_On", "false", "", "exact", "filter 2 off"),
        ("Voice_Modulators_AmpEnvelope_Times_Attack", T("fast"), "s", "near", "'fast'"),
        ("Voice_Modulators_AmpEnvelope_Times_Decay", T("medium"), "s", "near", "'medium'"),
        ("Voice_Modulators_AmpEnvelope_Sustain", 0.7, "linear (−3 dB)", "near", "'held', 70 %"),
        ("Voice_Modulators_AmpEnvelope_Times_Release", rel, "s", "near", "'short', lengthened as Vital needed"),
        ("Voice_Modulators_Envelope2_Times_Attack", T("instant"), "s", "near", "'instant'"),
        ("Voice_Modulators_Envelope2_Times_Decay", T("short"), "s", "near", "'short': the pluck"),
        ("Voice_Modulators_Envelope2_Values_Initial", 0.0, "0..1", "exact", "starts closed"),
        ("Voice_Modulators_Envelope2_Values_Peak", 1.0, "0..1", "exact", "full peak"),
        ("Voice_Modulators_Envelope2_Values_Sustain", 0.0, "0..1", "exact", "'zero': the pluck lives in the filter"),
        ("Voice_Modulators_Envelope2_Values_Final", 0.0, "0..1", "exact", "ends closed"),
        ("Voice_Modulators_Envelope2_Times_Release", rel, "s", "near", "'short'"),
    ] + [  # Env 3 given the same pluck: GPD's census reads slot 1 as Env 3, this file reads it as Env 2; either way the filter plucks
        (n.replace("Envelope2", "Envelope3"), v, u, s, "the same as Env 2, a hedge on which envelope slot 1 is")
        for n, v, u, s, _ in [
            ("Voice_Modulators_Envelope2_Times_Attack", T("instant"), "s", "near", ""),
            ("Voice_Modulators_Envelope2_Times_Decay", T("short"), "s", "near", ""),
            ("Voice_Modulators_Envelope2_Values_Initial", 0.0, "0..1", "exact", ""),
            ("Voice_Modulators_Envelope2_Values_Peak", 1.0, "0..1", "exact", ""),
            ("Voice_Modulators_Envelope2_Values_Sustain", 0.0, "0..1", "exact", ""),
            ("Voice_Modulators_Envelope2_Values_Final", 0.0, "0..1", "exact", ""),
            ("Voice_Modulators_Envelope2_Times_Release", rel, "s", "near", "")]
    ], [
        ("Voice_Filter1_Frequency", SLOT["env2"], round(depth_oct / KNOB_OCTAVES, 4), "near",
         f"Env 2 opens the cutoff about {depth_oct} octaves, near 3.4 kHz, read as {depth_oct} of the knob's ten octaves"),
        ("Voice_Oscillator1_Wavetables_WavePosition", SLOT["modwheel"], 0.0, "exact", "the init's mod wheel on wave position, cleared: the square stays a square"),
        ("Voice_Oscillator1_Wavetables_WavePosition", SLOT["slide"], 0.0, "exact", "its MPE copy, cleared"),
        ("Voice_Oscillator1_Effects_Effect1", SLOT["aftertouch"], 0.0, "exact", "the init's pressure on osc effect, cleared"),
    ]


def midi_pattern(card, path):
    """One bar of the reference's notes as a clip: four offbeat eighths, each a 16th long (the site voice's reading)."""
    r = card["render"]; tpb = 480
    mid = mido.MidiFile(ticks_per_beat=tpb); tr = mido.MidiTrack(); mid.tracks.append(tr)
    tr.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(r["tempo"]), time=0))
    tr.append(mido.MetaMessage("track_name", name=f"{card['name']} - reference notes", time=0))
    note = 36  # C2 in the site's naming; Live names MIDI 36 'C1'
    now = 0
    for i in range(4):
        on = i * tpb + tpb // 2; off = on + tpb // 4
        tr.append(mido.Message("note_on", note=note, velocity=r.get("velocity", 100), time=on - now)); now = on
        tr.append(mido.Message("note_off", note=note, velocity=0, time=off - now)); now = off
    tr.append(mido.MetaMessage("end_of_track", time=4 * tpb - now))
    mid.save(path)


def main():
    assert CARD == "house-bass", "only the house bass has a Wavetable builder so far"
    card = yaml.safe_load(open(HERE / "cards" / f"{CARD}.yaml")); voc = yaml.safe_load(open(HERE / "vocabulary.yaml"))
    OUT.mkdir(parents=True, exist_ok=True)
    xml = read_adv(str(INIT)); params, mods = house_bass(voc); log = []
    for name, val, unit, sure, why in params:
        if name.startswith("SpriteName"):
            xml = set_text(xml, name, val)
        else:
            xml = set_any(xml, name, val)
        log.append({"param": name, "value": val, "unit": unit, "sure": sure, "why": why})
    for target, slot, amt, sure, why in mods:
        xml = set_mod(xml, target, slot, amt)
        log.append({"param": f"{target} ← slot {slot}", "value": amt, "unit": "share of the knob's range", "sure": sure, "why": why})
    name = f"{card['name']} (Synth Templates)"
    xml = set_text(xml, "UserName", name)
    # read every written value back from the XML before it goes out
    for e in log:
        if "←" in e["param"] or e["param"] in ("MonoPoly", "SpriteName1", "Voice_Unison_Mode", "Voice_Oscillator1_Effects_EffectMode"):
            continue
        got = get_param(xml, e["param"])
        want = e["value"]
        ok = (str(got).lower() == str(want).lower()) if isinstance(want, str) else abs(float(got) - float(want)) < 1e-6
        assert ok, (e["param"], got, want)
    adv = OUT / f"{name}.adv"; size = write_adv(xml, str(adv))
    midi_pattern(card, OUT / f"{CARD}-pattern.mid")
    shutil.copy(HERE / "renders" / f"{CARD}.wav", OUT / f"{CARD}-reference.wav")
    mods_after = {k: v for k, v in get_mods(xml).items()}
    json.dump({"card": CARD, "preset": adv.name, "bytes": size, "from": "Live 12 factory init Wavetable",
               "written": log, "routings_after": mods_after,
               "slots": {"0": "Amp Env", "1": "Env 2", "2": "Env 3", "3": "LFO 1", "4": "LFO 2", "5": "Velocity", "6": "Note",
                         "7": "Pitch Bend", "8": "Aftertouch (pressure)", "9": "Mod Wheel", "12": "MPE Slide (copy of 9)",
                         "how": "read from the 14 factory presets' routings, 2026-11-17; not yet read off the Matrix in Live"},
               "basic_shapes_frames": ["sine", "triangle", "saw", "square"]},
              open(OUT / f"{CARD}-wavetable.json", "w"), indent=1)
    print(f"wrote {adv} ({size} B); routings now: {mods_after}")


if __name__ == "__main__":
    main()
