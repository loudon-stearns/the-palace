#!/usr/bin/env python3
"""new-plugin.py — copy the template into a new plugin and give it its own name and codes.

  python3 new-plugin.py "Frustration" Frst
  python3 new-plugin.py "Tape Smear" Tsmr --kind effect
  python3 new-plugin.py "Slime Mold Delay" Slmd --kind effect --into "Projects/Slime Mold Delay/plugin"

Makes plugins/<Target>/ from template/, or with --into, the folder named (a steward's
bundle: a path from the palace root, or from here): only the files a plugin fills in (the
example sine in src/Algorithm.h and reference/sketch.py for you to replace,
reference/paths.py, and a plugin.json carrying the name, a bundle id and the
four-letter plugin code). The build, the harness, the host check and verify.py
are shared from machinery/, so a fix there reaches every plugin.
A plugin made --into a bundle finds the machinery as VST Template/machinery
beside a folder above it, so it builds, validates and installs the same way.
The code must be unique among Loudon Live plugins: one capital then three
lower-case letters (the AU rule), checked against every plugin.json in the
palace. The manufacturer code stays Loud.
"""
import argparse
import json
import os
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE / "template"
PLUGINS = HERE / "plugins"
PALACE = HERE.parents[1]
TAKEN = {"Trkm": "Tract Mirror"}   # codes already shipped without a plugin.json
SKIP = {"build", "out", "node_modules", ".git", "__pycache__", ".obsidian", ".claude"}


def plugin_jsons(root):
    """Every plugin.json under root that names a plugin code, skipping build output."""
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x not in SKIP and not x.startswith(".")]
        if "plugin.json" in files:
            pj = Path(d) / "plugin.json"
            try:
                j = json.loads(pj.read_text())
            except (ValueError, OSError):
                continue
            if isinstance(j, dict) and "plugin_code" in j:
                yield pj, j


def used_codes():
    codes = dict(TAKEN)
    for pj, j in plugin_jsons(PALACE):
        codes[j["plugin_code"]] = f'{j.get("name", "?")} ({pj.parent.relative_to(PALACE)})'
    return codes


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("name", help='what the DAW shows, e.g. "Frustration"')
    ap.add_argument("code", help="four letters, one capital first, e.g. Frst")
    ap.add_argument("--kind", choices=["instrument", "effect"], default="instrument")
    ap.add_argument("--into", help="make the plugin in this folder (e.g. a steward's bundle) instead of plugins/<Target>")
    a = ap.parse_args()

    target = re.sub(r"[^A-Za-z0-9]", "", a.name.title() if " " in a.name else a.name)
    if not target or not target[0].isalpha():
        sys.exit(f"can't make a build target from {a.name!r}")
    if not re.fullmatch(r"[A-Z][a-z0-9]{3}", a.code):
        sys.exit(f"plugin code {a.code!r}: four characters, one capital first, then lower case or digits (e.g. Frst)")
    codes = used_codes()
    if a.code in codes:
        sys.exit(f"plugin code {a.code} is taken by {codes[a.code]}")
    if a.into:
        into = Path(a.into)
        dest = into if into.is_absolute() else next((b / into for b in (PALACE, Path.cwd()) if (b / into).parent.exists()), PALACE / into)
        dest = dest.resolve()
    else:
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

    rel = dest.relative_to(HERE) if dest.is_relative_to(HERE) else dest.relative_to(PALACE) if dest.is_relative_to(PALACE) else dest
    print(f"made {rel}  ({a.name}, {a.kind}, code {a.code})")
    print("next:")
    print(f"  1. write the numpy sketch in   {rel}/reference/sketch.py")
    print(f"  2. port its loop into          {rel}/src/Algorithm.h")
    print(f"  3. say what it must pass in    {rel}/reference/paths.py")
    print(f"  4. list moves to try in        {rel}/plugin.json  (\"hostcheck\": [\"id=value\", ...])")
    print(f"  5. for the CRT, write          {rel}/ui/visualizer.js  and set \"screen\": true in plugin.json's ui block")
    print(f"  6. run                         {rel}/plugin.sh all")


if __name__ == "__main__":
    main()
