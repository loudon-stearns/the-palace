#!/usr/bin/env python3
"""new-plugin.py — copy the template into a new plugin and give it its own name and codes.

  python3 new-plugin.py "Frustration" Frst
  python3 new-plugin.py "Tape Smear" Tsmr --kind effect

Makes plugins/<Target>/ from template/: only the files a plugin fills in (the
example sine in src/Algorithm.h and reference/sketch.py for you to replace,
reference/paths.py, and a plugin.json carrying the name, a bundle id and the
four-letter plugin code). The build, the harness, the host check and verify.py
are shared from machinery/, so a fix there reaches every plugin.
The code must be unique among Loudon Live plugins: one capital then three
lower-case letters (the AU rule). The manufacturer code stays Loud.
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE / "template"
PLUGINS = HERE / "plugins"
TAKEN = {"Trkm": "Tract Mirror"}   # codes already shipped outside this folder


def used_codes():
    codes = dict(TAKEN)
    for pj in [TEMPLATE / "plugin.json", *PLUGINS.glob("*/plugin.json")]:
        j = json.loads(pj.read_text())
        codes[j["plugin_code"]] = j["name"]
    return codes


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("name", help='what the DAW shows, e.g. "Frustration"')
    ap.add_argument("code", help="four letters, one capital first, e.g. Frst")
    ap.add_argument("--kind", choices=["instrument", "effect"], default="instrument")
    a = ap.parse_args()

    target = re.sub(r"[^A-Za-z0-9]", "", a.name.title() if " " in a.name else a.name)
    if not target or not target[0].isalpha():
        sys.exit(f"can't make a build target from {a.name!r}")
    if not re.fullmatch(r"[A-Z][a-z0-9]{3}", a.code):
        sys.exit(f"plugin code {a.code!r}: four characters, one capital first, then lower case or digits (e.g. Frst)")
    codes = used_codes()
    if a.code in codes:
        sys.exit(f"plugin code {a.code} is taken by {codes[a.code]}")
    dest = PLUGINS / target
    if dest.exists():
        sys.exit(f"{dest} already exists")

    shutil.copytree(TEMPLATE, dest, ignore=shutil.ignore_patterns(
        "README.md", "build", "build.configure.log", "out", "__pycache__"))
    pj = json.loads((TEMPLATE / "plugin.json").read_text())
    pj.update(name=a.name, target=target, bundle_id=f"com.LoudonLive.{target}", plugin_code=a.code,
              kind=a.kind, version="0.1.0", hostcheck=[])
    (dest / "plugin.json").write_text(json.dumps(pj, indent=2) + "\n")
    if a.kind == "effect":
        alg = dest / "src" / "Algorithm.h"
        alg.write_text(alg.read_text().replace("kInputs  = 0;", "kInputs  = 1;"))

    rel = dest.relative_to(HERE)
    print(f"made {rel}  ({a.name}, {a.kind}, code {a.code})")
    print("next:")
    print(f"  1. write the numpy sketch in   {rel}/reference/sketch.py")
    print(f"  2. port its loop into          {rel}/src/Algorithm.h")
    print(f"  3. say what it must pass in    {rel}/reference/paths.py")
    print(f"  4. list moves to try in        {rel}/plugin.json  (\"hostcheck\": [\"id=value\", ...])")
    print(f"  5. run                         {rel}/plugin.sh all")


if __name__ == "__main__":
    main()
