"""Run the 2026-11-15 Matplotlib test and write measured.json.

    python3 "Shop/Matplotlib/proofs/2026-11-15-kuramoto-multipanel/make.py" [--new-python PATH]

1. writes palace-paper.mplstyle from the design tokens (palace_mplstyle.py skin-drafting);
2. runs kuramoto_figure.py with the Mac's python3 (the card's Matplotlib), then again into
   a temporary folder, and compares the bytes of every file;
3. checks each PNG's pixel size against figsize x dpi, parses each SVG, counts the house
   face on its text, and asks Matplotlib which file JetBrains Mono resolves to;
4. with --new-python (a venv holding a newer Matplotlib, e.g. 3.11.2), draws the same
   figure with it into mpl-3.11/ and records old against new.
"""
import hashlib
import json
import shutil
import struct
import subprocess
import sys
import tempfile
import time
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
SHOP = HERE.parents[1]
FIG = HERE / "kuramoto_figure.py"
args = sys.argv[1:]
new_py = args[args.index("--new-python") + 1] if "--new-python" in args else None
# A newer Matplotlib reads its own font cache (~/.matplotlib/fontlist-v<version>.json). One
# built before JetBrains Mono was installed falls back to DejaVu without a word (2026-11-15:
# a fontlist-v3.11.0.json of June 13 did). --new-mplconfig DIR gives it a fresh cache.
NEW_ENV = None
if "--new-mplconfig" in args:
    import os
    NEW_ENV = dict(os.environ, MPLCONFIGDIR=args[args.index("--new-mplconfig") + 1])

subprocess.run([sys.executable, str(SHOP / "palace_mplstyle.py"), "skin-drafting", "--out", str(HERE / "palace-paper.mplstyle")], check=True)


def run(py, out, env=None):
    t = time.time()
    r = subprocess.run([py, str(FIG), "both", "--out", str(out)], capture_output=True, text=True, env=env)
    if r.returncode:
        return dict(error=r.stderr[-600:])
    rep = json.loads(r.stdout.strip().splitlines()[-1]); rep["wall_seconds_with_start"] = round(time.time() - t, 2)
    return rep


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def png_size(p):
    w, h = struct.unpack(">II", p.read_bytes()[16:24]); return [w, h]


def files_report(d):
    rep = {}
    for p in sorted(d.glob("kuramoto-*.*")):
        rec = dict(bytes=p.stat().st_size, sha256=sha(p)[:16])
        if p.suffix == ".png":
            rec.update(pixels=png_size(p), expected=[round(7.2 * 300), round(4.2 * 300)])
        else:
            try:
                ET.parse(p); rec["parses"] = True
            except ET.ParseError as e:
                rec["parses"] = str(e)
            txt = p.read_text()
            rec.update(text_elements=txt.count("<text"), jetbrains_mentions=txt.count("JetBrains Mono"))
        rep[p.name] = rec
    return rep


font = subprocess.run([sys.executable, "-c", "import matplotlib.font_manager as f;print(f.findfont('JetBrains Mono', fallback_to_default=False))"],
                      capture_output=True, text=True)
first = run(sys.executable, HERE)
with tempfile.TemporaryDirectory() as tmp:
    second = run(sys.executable, Path(tmp))
    same = {p.name: sha(p) == sha(Path(tmp) / p.name) for p in sorted(HERE.glob("kuramoto-*.*"))}
measured = dict(date="2026-11-15", python=sys.version.split()[0], jetbrains_mono_file=font.stdout.strip() or font.stderr.strip()[-200:],
                first_run=first, second_run_seconds={k: v["seconds"] for k, v in second.get("plots", {}).items()},
                byte_identical_on_rerun=same, files=files_report(HERE))

if new_py:
    nd = HERE / "mpl-3.11"; nd.mkdir(exist_ok=True)
    new = run(new_py, nd, NEW_ENV)
    nf = files_report(nd)
    nfont = subprocess.run([new_py, "-c", "import matplotlib.font_manager as f;print(f.findfont('JetBrains Mono', fallback_to_default=False))"],
                           capture_output=True, text=True, env=NEW_ENV)
    with tempfile.TemporaryDirectory() as tmp:
        again = run(new_py, Path(tmp), NEW_ENV)
        same_new = {p.name: sha(p) == sha(Path(tmp) / p.name) for p in sorted(nd.glob("kuramoto-*.*"))}
    measured["newer_matplotlib"] = dict(run=new, mplconfigdir=(NEW_ENV or {}).get("MPLCONFIGDIR"), files=nf, byte_identical_on_rerun=same_new,
                                        jetbrains_mono_file=nfont.stdout.strip() or nfont.stderr.strip()[-200:],
                                        same_bytes_as_old={n: nf[n]["sha256"] == measured["files"][n]["sha256"] for n in nf})
    try:                                        # how far apart the two PNGs are, if Pillow is here
        from PIL import Image, ImageChops
        for n in ("kuramoto-paper.png", "kuramoto-graphite.png"):
            d = ImageChops.difference(Image.open(HERE / n).convert("RGB"), Image.open(nd / n).convert("RGB"))
            px = sum(1 for p in d.get_flattened_data() if max(p) > 40) if hasattr(d, "get_flattened_data") else sum(1 for p in d.getdata() if max(p) > 40)
            measured["newer_matplotlib"].setdefault("png_pixels_differing_by_more_than_40", {})[n] = dict(count=px, of=d.width * d.height, bbox=d.getbbox())
    except ImportError:
        pass
(HERE / "measured.json").write_text(json.dumps(measured, indent=1) + "\n")
print(json.dumps({k: v for k, v in measured.items() if k != "files"}, indent=1)[:3000])
