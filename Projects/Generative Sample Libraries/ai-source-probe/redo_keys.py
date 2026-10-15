#!/usr/bin/env python3
"""Re-render the keys a listener flags, and rebuild the instrument around them.

    PY=.venvs/gsl-probe/bin/python    # run from the palace root
    $PY "Projects/Generative Sample Libraries/ai-source-probe/redo_keys.py" \\
        violin A#3 C4 C5 --takes 6 --tag r1 --name "MusicGen Violin"

This is the critique-and-regenerate loop of the interview (DESIGN.md, cycle
38). The listener names keys; the loop does not patch the samples on them,
it asks the model again:

  1. For each flagged key, MusicGen renders TAKES fresh takes asked for that
     key, on seeds no earlier run used (--first-seed), and each is graded.
  2. The take that held each flagged key in the base build is rejected. The
     fresh takes may fill only the flagged keys, so no key nobody flagged
     changes its sample. All of this is written to a redo file
     (instruments/redo/<instrument>.json) that grows round by round, so a
     second round keeps the first round's verdicts.
  3. The same chain as the shipped build runs again from the pool: filed by
     played key and trimmed to the instrument's range (build_sfz.py), bow
     attacks (shape_attacks.py), sustain loops (loop_sustain.py), one level
     and velocity (finish_instrument.py), then DecentSampler
     (to_decentsampler.py).
  4. ab.wav plays each flagged key held 4 s, base build then redo, and
     redo.json says, per key, where its new sample came from: a fresh take,
     an older take the first pick had beaten, or a neighbour stretched over.

MusicGen keeps the note name and picks its own octave (cycle 30): about a
third of takes land in the octave asked. Six takes give a key roughly a
nine-in-ten chance of a fresh one landing on it; a key none lands on says so.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
PALACE = HERE.parents[2]
VENVS = Path(os.environ.get("GSL_VENVS", PALACE / ".venvs"))
sys.path.insert(0, str(HERE))
from build_sfz import parse_sfz, parse_note, note_name  # noqa: E402
from verify import load_wav  # noqa: E402
from loop_sustain import play_looped  # noqa: E402
from shape_attacks import BOW_ATTACK, BOW_VEL2ATTACK  # noqa: E402
from adapters._common import write_wav  # noqa: E402


def run(py: str, *args: str) -> None:
    cmd = [str(VENVS / py / "bin" / "python"), *args]
    print("$", " ".join(cmd[1:]), flush=True)
    env = {**os.environ, "PYTORCH_ENABLE_MPS_FALLBACK": "1"}
    subprocess.run(cmd, cwd=HERE, env=env, check=True)


def used_seeds(inst: str) -> int:
    """Highest seed any earlier run of this instrument drew."""
    top = 0
    for f in HERE.glob("renders.*.jsonl"):
        for l in f.read_text().splitlines():
            if l.strip():
                r = json.loads(l)
                if r.get("instrument") == inst:
                    top = max(top, int(r.get("seed", 0)))
    return top


def held(folder: Path, key: int, secs: float = 4.0) -> tuple[np.ndarray, int]:
    regs = parse_sfz(next(folder.glob("*.sfz")))
    reg = next(r for r in regs if r["lokey"] <= key <= r["hikey"])
    y, sr = load_wav(str(folder / "samples" / reg["sample"]))
    n, _ = play_looped(y, sr, reg, key, secs)
    a = int((BOW_ATTACK + BOW_VEL2ATTACK * 100 / 127) * sr)
    n[:a] *= np.linspace(0, 1, a)
    rel = np.cos(np.linspace(0, math.pi / 2, int(0.35 * sr))) ** 2
    n[-len(rel):] *= rel
    return n, sr


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("instrument")
    ap.add_argument("keys", nargs="+", help="flagged keys, e.g. A#3 C4")
    ap.add_argument("--takes", type=int, default=6)
    ap.add_argument("--tag", required=True, help="names this round's runs and folders")
    ap.add_argument("--name", required=True, help="the finished instrument's name")
    ap.add_argument("--base", default=None,
                    help="the in-range build this round starts from "
                         "(default instruments/in_range/<instrument>)")
    ap.add_argument("--shipped", default=None,
                    help="the finished build to A/B against "
                         "(default instruments/finished/<instrument>)")
    a = ap.parse_args()
    inst, keys = a.instrument, [parse_note(k) for k in a.keys]
    base = HERE / (a.base or f"instruments/in_range/{inst}")
    shipped = HERE / (a.shipped or f"instruments/finished/{inst}")
    picks = json.loads((base / "picks.json").read_text())
    lo, hi = picks["range"]

    # 1. fresh takes on every flagged key
    first = used_seeds(inst) + 1
    fresh = []
    for k in keys:
        name = f"{inst}_{a.tag}_{note_name(k).replace('#', 's')}"
        fresh.append(name)
        run("musicgen", "probe.py", "render", "--adapter", "musicgen_melody",
            "--instrument", inst, "--grid", f"{k}:{k}:1", "--takes", str(a.takes),
            "--first-seed", str(first), "--as", name)
        run("gsl-probe", "probe.py", "verify", "--adapter", "musicgen_melody", "--as", name)

    # 2. reject what held the flagged keys; the redo file accumulates rounds
    redo_path = HERE / "instruments" / "redo" / f"{inst}.json"
    redo_path.parent.mkdir(parents=True, exist_ok=True)
    redo = json.loads(redo_path.read_text()) if redo_path.exists() else \
        {"instrument": inst, "pool": picks["arm"], "keys": [], "rejected": [], "runs": [], "rounds": []}
    rejected = []
    for k in keys:
        own = next((r for r in picks["regions"] if r["pitch_keycenter"] == k), None)
        if own:
            rejected.append(own["sample"])
    redo["keys"] = sorted(set(redo["keys"]) | {note_name(k) for k in keys}, key=parse_note)
    redo["rejected"] = sorted(set(redo["rejected"]) | set(rejected))
    redo["runs"] += [r for r in fresh if r not in redo["runs"]]
    redo["rounds"].append({"tag": a.tag, "keys": [note_name(k) for k in keys],
                           "rejected": rejected, "runs": fresh,
                           "seeds": [first, first + a.takes - 1]})
    redo_path.write_text(json.dumps(redo, indent=1) + "\n")

    # 3. the shipped chain, again
    pool = "+".join([redo["pool"], *redo["runs"]])
    out = f"instruments/redo/{a.tag}"
    run("gsl-probe", "build_sfz.py", pool, "--instrument", inst, "--by-played", "--trim",
        "--audition", "--range", f"{lo}:{hi}", "--redo", str(redo_path), "--out", out)
    run("gsl-probe", "shape_attacks.py", "--mode", "bow", f"{out}/{inst}")
    run("gsl-probe", "loop_sustain.py", f"{out}/{inst}_shaped")
    fin = f"instruments/finished/{inst}_{a.tag}"
    run("gsl-probe", "finish_instrument.py", f"{out}/{inst}_looped", "--name", a.name, "--out", fin)
    run("gsl-probe", "to_decentsampler.py", fin)
    run("gsl-probe", "phrase.py", fin, "--mode", "bow")

    # 4. where each flagged key's sample came from, and the A/B
    new = json.loads((HERE / out / inst / "picks.json").read_text())
    results = {}
    for f in fresh:
        for l in (HERE / f"results.{f}.jsonl").read_text().splitlines():
            if l.strip():
                r = json.loads(l)
                results.setdefault(f, []).append(
                    {"seed": r["seed"], "grade": r.get("grade"),
                     "sounds_at": note_name(r["sfz_keycenter"]) if r.get("sfz_keycenter") else None})
    per_key, parts, sr = [], [], None
    for k in keys:
        reg = next((r for r in new["regions"] if r["lokey"] <= k <= r["hikey"]), None)
        old = next((r for r in picks["regions"] if r["lokey"] <= k <= r["hikey"]), None)
        if reg is None:
            came = "silent: nothing holds this key now"
        elif reg["run"] in fresh and reg["pitch_keycenter"] == k:
            came = f"fresh take ({reg['run']} seed {reg['seed']})"
        elif reg["pitch_keycenter"] == k:
            came = f"an older take the first pick had beaten ({reg['sample']})"
        else:
            came = f"stretched from {note_name(reg['pitch_keycenter'])} ({reg['sample']})"
        per_key.append({"key": note_name(k), "before": old and old["sample"],
                        "before_own_sample": bool(old and old["pitch_keycenter"] == k),
                        "after": reg and reg["sample"], "came_from": came})
        for folder in (shipped, HERE / fin):
            n, sr = held(folder, k)
            parts += [n, np.zeros(int(0.6 * sr))]
        parts.append(np.zeros(int(0.6 * sr)))
    mix = np.concatenate(parts)
    mix *= 0.89 / max(1e-9, float(np.abs(mix).max()))
    write_wav(str(HERE / fin / "ab.wav"), mix, sr)
    fin_report = json.loads((HERE / fin / "finishing.json").read_text())
    report = {"instrument": inst, "tag": a.tag, "flagged": per_key,
              "fresh_takes": results, "base": str(base.relative_to(HERE)),
              "finished": fin,
              "finishing": {k: v for k, v in fin_report.items() if k != "samples_detail"}}
    (HERE / fin / "redo.json").write_text(json.dumps(report, indent=1) + "\n")
    print(json.dumps(per_key, indent=1))


if __name__ == "__main__":
    main()
