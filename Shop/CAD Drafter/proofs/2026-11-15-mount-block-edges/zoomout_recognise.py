"""Zoom-out try, 2026-11-15: build123d-drafting-helpers 0.15.5 (PyPI 2026-09-22) recognising
the mount block's holes on its own, against the hand checks in build_mount.py.

Needs a venv with build123d 0.13.0 + build123d-drafting-helpers 0.15.5, kept apart from
~/.venvs/cad so the pinned Drafter is untouched:
    uv venv --python 3.12 <dir> && uv pip install --python <dir>/bin/python build123d==0.13.0 build123d-drafting-helpers==0.15.5
    <dir>/bin/python "Shop/CAD Drafter/proofs/2026-11-15-mount-block-edges/zoomout_recognise.py"
Writes measured-zoomout.json beside this file.
"""
import json, sys, time, warnings
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE)); sys.path.insert(0, str(HERE.parent / "2026-11-14-card-check"))
warnings.simplefilter("ignore", DeprecationWarning)
import importlib.metadata as md
from build_mount import mount_block
from build123d_drafting import find_holes, find_hole_patterns

t = time.time()
blk = mount_block()
holes = find_holes(blk)
pats = find_hole_patterns(holes)
rep = dict(helpers=md.version("build123d-drafting-helpers"), build123d=md.version("build123d"),
           seconds=round(time.time() - t, 2),
           holes=[{k: (round(v, 4) if isinstance(v, float) else str(v)) for k, v in vars(h).items()} for h in holes],
           patterns=[str(p) for p in pats])
(HERE / "measured-zoomout.json").write_text(json.dumps(rep, indent=1) + "\n")
print(json.dumps(rep, indent=1)[:2500])
