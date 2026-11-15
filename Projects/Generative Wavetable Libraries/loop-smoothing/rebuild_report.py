"""Before and after the one-frame blur became the default (cycle 21, 2026-11-15).

Reads every CLM table the packers wrote as it was before the rebuild (a
snapshot folder) and as it is now, and measures the buzz, how much of each
frame changed, and the worst dip mid-morph. Also measures the three
palace-synthesis tables, which were not rebuilt, to show why.

    /usr/local/bin/python3 rebuild_report.py <snapshot folder>
"""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf

HERE = Path(__file__).resolve().parent
BUNDLE = HERE.parent
sys.path.insert(0, str(HERE))
from smooth_tables import offnote_db, timbre_change_db, morph_dip_worst, blur  # noqa: E402
import scale_up as su  # noqa: E402

SETS = ["akwf-scale-up-fmsynth", "akwf-scale-up-eorgan", "ai-cycles"]
PALACE = ["crystal-bravais/crystal_bravais.wav", "floquet-modes/floquet_modes.wav",
          "shepard-centroid/shepard_centroid.wav"]


def load(p):
    t, _ = sf.read(p)
    return t.reshape(-1, su.CLM_N)


def main():
    snap = Path(sys.argv[1])
    rows = []
    for s in SETS:
        for new in sorted((BUNDLE / s / "tables").rglob("*.wav")):
            if new.stem.endswith(("_ableton", "_audition_sweep")):
                continue
            old = snap / new.relative_to(BUNDLE)
            a, b = load(old), load(new)
            dur = 24.0 if len(a) > 40 else max(6.0, len(a) * 0.25)
            rows.append({"set": s, "table": str(new.relative_to(BUNDLE / s / "tables")).removesuffix(".wav"),
                         "frames": len(a),
                         "buzz_before_db": round(offnote_db(a, dur=dur), 1),
                         "buzz_after_db": round(offnote_db(b, dur=dur), 1),
                         "changed_db": round(timbre_change_db(a, b), 1),
                         "dip_before_db": round(morph_dip_worst(a), 1),
                         "dip_after_db": round(morph_dip_worst(b), 1)})
            print(rows[-1])
    palace = []
    for rel in PALACE:
        a = load(BUNDLE / rel)
        b = blur(a, 1.0); b = b - b.mean(1, keepdims=True)
        palace.append({"table": rel, "frames": len(a),
                       "buzz_db": round(offnote_db(a), 1),
                       "buzz_if_blurred_db": round(offnote_db(b), 1),
                       "blur_would_change_db": round(timbre_change_db(a, b), 1)})
        print(palace[-1])
    (HERE / "rebuild_report.json").write_text(json.dumps({"rebuilt": rows, "not_rebuilt": palace}, indent=1))


if __name__ == "__main__":
    main()
