"""Play a short tune on a built instrument — the ear check a rising line can't give.

    python3 phrase.py instruments/in_range/violin_shaped --mode bow
    python3 phrase.py instruments/in_range/marimba_hit_rung --mode ring

The audition line build_sfz.py writes steps up the keyboard one key at a time,
which tells you every zone sounds but not whether the zones sound like one
instrument. A tune does: it moves by step and by leap across neighbouring
samples, so a take that sounds like a different player jumps out on the
first phrase. Each instrument gets the same two passages, placed in its range:

  1. a slow scale up two octaves and back, one note per sample zone or less;
  2. a legato tune (original, in the major mode) that crosses five or six
     zones in eight bars.

Notes are played through shape_attacks.voice(), so the bow attack and the
release are the ones the SFZ asks for. Monophonic, no reverb, no velocity
variation: the samples are the only thing being judged. Writes phrase.wav
into the instrument folder.
"""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from verify import load_wav  # noqa: E402
from build_sfz import parse_sfz, note_name  # noqa: E402
from shape_attacks import voice  # noqa: E402
from adapters._common import write_wav  # noqa: E402

MAJOR = [0, 2, 4, 5, 7, 9, 11]
# scale degrees (0 = tonic, 7 = octave) and beats; the tune leaps a sixth and
# a seventh so it lands on samples the scale only grazes
TUNE = [(0, 1), (2, 1), (4, 1), (7, 2), (6, 1), (4, 1), (5, 2),
        (9, 1.5), (8, 0.5), (7, 1), (4, 1), (5, 1), (3, 1), (1, 2),
        (2, 1), (4, 1), (11, 2), (9, 1), (7, 1), (8, 1), (6, 1),
        (7, 1), (4, 1), (2, 1), (1, 1), (0, 4)]


def degree(tonic: int, d: int) -> int:
    return tonic + 12 * (d // 7) + MAJOR[d % 7]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src", help="an instrument folder (a *_shaped or *_rung one)")
    ap.add_argument("--mode", choices=["bow", "ring"], required=True)
    ap.add_argument("--bpm", type=float, default=84)
    a = ap.parse_args()
    src = (HERE / a.src).resolve()
    regions = parse_sfz(next(src.glob("*.sfz")))
    audio = {r["sample"]: load_wav(str(src / "samples" / r["sample"])) for r in regions}
    sr = next(iter(audio.values()))[1]
    lo, hi = regions[0]["lokey"], regions[-1]["hikey"]
    # tonic: the C whose two-octave scale fits, nearest the middle of the range
    cs = [k for k in range(lo, hi - 23) if k % 12 == 0] or [lo]
    tonic = min(cs, key=lambda k: abs(k + 12 - (lo + hi) / 2))
    beat = 60.0 / a.bpm
    notes = []                                        # (key, beats)
    scale = [degree(tonic, d) for d in range(15)]
    notes += [(k, 0.75) for k in scale + scale[-2::-1]] + [(None, 2)]
    notes += [(degree(tonic + 12 if degree(tonic, 11) + 12 <= hi else tonic, d), b)
              for d, b in TUNE]
    legato = 1.15 if a.mode == "bow" else 1.0         # bowed notes overlap a little
    ring = 2.4 if a.mode == "ring" else 0.0
    total = sum(b for _, b in notes) * beat + ring + 1.0
    mix = np.zeros(int(total * sr))
    t, used = 0.0, []
    for key, b in notes:
        if key is not None:
            reg = next((r for r in regions if r["lokey"] <= key <= r["hikey"]), None)
            if reg is not None:
                y, _ = audio[reg["sample"]]
                n = voice(y, sr, reg, key, b * beat * legato + ring, "bow" if a.mode == "bow" else "ring")
                s = int(t * sr)
                mix[s:s + len(n)] += n[:len(mix) - s]
                used.append((note_name(key), reg["sample"]))
        t += b * beat
    mix *= 0.89 / max(1e-9, np.abs(mix).max())
    write_wav(str(src / "phrase.wav"), mix, sr)
    zones = list(dict.fromkeys(s for _, s in used))
    print(f"{src.name}: tonic {note_name(tonic)}, {len(used)} notes, "
          f"{len(zones)} of {len(regions)} samples heard, {t:.1f} s -> phrase.wav")


if __name__ == "__main__":
    main()
