#!/usr/bin/env python3
"""SFZ → DecentSampler: one built instrument becomes a .dspreset beside its
SFZ and a .dslibrary (the preset + samples, zipped) a participant can drop
into the free DecentSampler plugin.

    PY=.venvs/gsl-probe/bin/python    # the probe venv — it has librosa
    $PY to_decentsampler.py instruments/in_range/violin_shaped
    $PY to_decentsampler.py instruments/in_range/*_shaped instruments/in_range/marimba_hit_rung

Run it in the probe venv. Without librosa, verify.track falls back to a
cruder tracker that disagrees with every keycheck.json on disk (flute:
34/38 keys on target instead of 38/38, mostly octave slips), so main()
refuses to grade without it.

Reads only what build_sfz.py and shape_attacks.py emit: <global> envelope
opcodes and loop_mode, and per-region sample / lokey / hikey /
pitch_keycenter / tune / offset. Then reads the written .dspreset back and
plays every key through it with the same pitch check build_sfz's --check
uses, so the parity claim is about the file on disk, not the writer's intent.

Two honest translations, said in the preset's own comments:
  · SFZ tune is cents; DecentSampler `tuning` is semitones (tune/100).
  · SFZ one_shot has no DecentSampler twin. A one-shot instrument gets a
    release long enough for the sample to ring out after the key lifts.
"""
from __future__ import annotations

import json
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_sfz  # noqa: E402

# Graphite skin of the Loudon Live design system, as DecentSampler ARGB.
BG, ACCENT, INK, RULE = "FF0A0A0F", "FFE8B84A", "FFE8E6DF", "FF4A4A5E"
ONE_SHOT_RELEASE = 6.0   # seconds — longer than any rung-out sample we keep


def read_global(sfz: Path) -> dict:
    ops, in_global = {}, False
    for line in sfz.read_text().splitlines():
        line = line.split("//")[0].strip()
        if line.startswith("<"):
            in_global = line.startswith("<global>")
            line = line.split(">", 1)[1].strip()
        if in_global and line:
            ops.update(tok.split("=", 1) for tok in line.split())
    return ops


def knob(tab, x, label, lo, hi, value, parameter):
    k = ET.SubElement(tab, "labeled-knob", x=str(x), y="40", width="90",
                      height="90", textSize="14", label=label, type="float",
                      minValue=str(lo), maxValue=str(hi), value=f"{value:g}",
                      textColor=INK, trackForegroundColor=ACCENT,
                      trackBackgroundColor=RULE)
    ET.SubElement(k, "binding", type="amp", level="instrument",
                  position="0", parameter=parameter)


def to_dspreset(sfz: Path) -> tuple[Path, list[dict]]:
    g = read_global(sfz)
    regions = build_sfz.parse_sfz(sfz)
    one_shot = g.get("loop_mode") == "one_shot"
    attack = float(g.get("ampeg_attack", 0.001))
    release = ONE_SHOT_RELEASE if one_shot else float(g.get("ampeg_release", 0.3))

    root = ET.Element("DecentSampler", minVersion="1.0.0")
    root.append(ET.Comment(f" built from {sfz.name} by to_decentsampler.py "))
    root.append(ET.Comment(" SFZ tune (cents) written as tuning (semitones) = tune/100 "))
    if one_shot:
        root.append(ET.Comment(f" SFZ one_shot: no DS twin; release {ONE_SHOT_RELEASE:g} s lets it ring out "))
    ui = ET.SubElement(root, "ui", width="812", height="200", bgColor=BG)
    tab = ET.SubElement(ui, "tab", name="main")
    ET.SubElement(tab, "label", x="20", y="10", width="772", height="24",
                  text=sfz.parent.name.replace("_", " "), textColor=ACCENT,
                  textSize="18")
    knob(tab, 20, "Attack", 0, 2, attack, "ENV_ATTACK")
    knob(tab, 130, "Release", 0, 8, release, "ENV_RELEASE")
    knob(tab, 240, "Volume", 0, 1, 0.8, "AMP_VOLUME")

    groups = ET.SubElement(root, "groups", attack=f"{attack:g}", decay="0",
                           sustain="1", release=f"{release:g}", volume="0.8")
    grp = ET.SubElement(groups, "group")
    for r in regions:
        attrs = dict(path=f"Samples/{r['sample']}", rootNote=str(r["pitch_keycenter"]),
                     loNote=str(r["lokey"]), hiNote=str(r["hikey"]),
                     loVel="0", hiVel="127", tuning=f"{r['tune'] / 100:g}",
                     loopEnabled="false")
        if r["offset"]:
            attrs["start"] = str(r["offset"])
        ET.SubElement(grp, "sample", **attrs)

    ET.indent(root)
    out = sfz.with_suffix(".dspreset")
    out.write_text(ET.tostring(root, encoding="unicode") + "\n")
    return out, regions


def parse_dspreset(path: Path) -> list[dict]:
    """The region dicts build_sfz.play expects, read back off the XML."""
    regs = []
    for s in ET.parse(path).getroot().iter("sample"):
        regs.append({"sample": Path(s.get("path")).name,
                     "lokey": int(s.get("loNote")), "hikey": int(s.get("hiNote")),
                     "pitch_keycenter": int(s.get("rootNote")),
                     "tune": round(float(s.get("tuning", 0)) * 100),
                     "offset": int(s.get("start", 0))})
    return regs


def pack(preset: Path, regions: list[dict]) -> Path:
    lib = preset.with_suffix(".dslibrary")
    with zipfile.ZipFile(lib, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(preset, preset.name)
        for r in regions:
            z.write(preset.parent / "samples" / r["sample"], f"Samples/{r['sample']}")
    return lib


def check(preset: Path, sfz_regions: list[dict], acc: dict) -> dict:
    ds_regions = parse_dspreset(preset)
    same_map = ds_regions == sfz_regions
    real_parse = build_sfz.parse_sfz
    build_sfz.parse_sfz = lambda _p: ds_regions      # play the DS map, not the SFZ
    try:
        kc = build_sfz.keycheck(preset, acc)
    finally:
        build_sfz.parse_sfz = real_parse
    with zipfile.ZipFile(preset.with_suffix(".dslibrary")) as z:
        names = set(z.namelist())
    missing = [r["sample"] for r in ds_regions if f"Samples/{r['sample']}" not in names]
    return {"preset": preset.name, "map_matches_sfz": same_map,
            "keys_played": kc["keys_played"], "on_target": kc["on_target"],
            "worst_abs_cents_on_target": kc["worst_abs_cents_on_target"],
            "samples_missing_from_library": missing,
            "library_bytes": preset.with_suffix(".dslibrary").stat().st_size}


def main() -> None:
    try:
        import librosa  # noqa: F401
    except ImportError:
        sys.exit("needs librosa for the pitch check — run with the gsl-probe venv")
    acc = json.loads((HERE / "matrix.json").read_text())["acceptance"]
    report = []
    for d in map(Path, sys.argv[1:]):
        sfz = next(d.glob("*.sfz"))
        preset, regions = to_dspreset(sfz)
        pack(preset, regions)
        r = check(preset, regions, acc)
        report.append(r)
        print(json.dumps(r))
    if report:
        (Path(sys.argv[1]).parent / "decentsampler.check.json").write_text(
            json.dumps(report, indent=1) + "\n")


if __name__ == "__main__":
    main()
