#!/usr/bin/env python3
"""ui.py — shared machinery: assemble a plugin's editor page from machinery/ui/editor.html.

  python3 machinery/tools/ui.py build <plugin dir> <build dir>
      Writes <build dir>/ui/index.html (embedded in the plugin) and <build dir>/ui/EditorConfig.h
      (the editor's sizes and the plugin.json "ui" block). plugin.sh build runs it first.
  python3 machinery/tools/ui.py mock <plugin dir> [--direction D] [--set id=value ...] --out page.html
      The same page with a stand-in for the plugin, to open in a browser. Needs a built harness
      (for the parameter table).
  python3 machinery/tools/ui.py shot <plugin dir> [--direction D] [--set id=value ...] --size 760x480 --out shot.png
      A mock page rendered to PNG by headless Chrome.

Into the page it inlines, so the plugin needs nothing at run time:
  the Loudon Live tokens (_ops/loudon-live/design-system/colors_and_type.css, the house dress),
  the fonts (Anton, Manrope, JetBrains Mono: machinery/ui/fonts/, else ~/Library/Fonts),
  JUCE's JavaScript bridge, and, for a mock, the parameter table.
A plugin may add plugins/<Name>/ui/backdrop.json: a field drawn under the XY pad.
"""
import argparse
import base64
import json
import os
import subprocess
import sys
from pathlib import Path

MACH = Path(__file__).resolve().parents[1]
JUCE_DIR = Path(os.environ.get("JUCE_DIR", Path.home() / "Library/Caches/palace-vst-template/JUCE-8.0.12"))
FONTS = [  # family, weight range, file names to look for
    ("Anton", "400", ["Anton-Regular.ttf"]),
    ("Manrope", "200 800", ["Manrope[wght].ttf", "Manrope-VariableFont_wght.ttf"]),
    ("JetBrains Mono", "400", ["JetBrainsMono-Regular.ttf"]),
    ("JetBrains Mono", "500", ["JetBrainsMono-Medium.ttf"]),
]
UI_DEFAULTS = dict(width=760, height=480, min=[560, 380], max=[1600, 1000], direction="bench")


def find_up(rel):
    for d in [MACH, *MACH.parents]:
        if (d / rel).exists():
            return d / rel
    sys.exit(f"can't find {rel} above {MACH}")


def tokens():
    css = find_up("_ops/loudon-live/design-system/colors_and_type.css").read_text()
    return "\n".join(l for l in css.splitlines() if not l.startswith("@import"))   # fonts are inlined instead


def fonts():
    dirs = [MACH / "ui/fonts", Path.home() / "Library/Fonts", Path("/Library/Fonts")]
    out, missing = [], []
    for family, weight, names in FONTS:
        f = next((d / n for d in dirs for n in names if (d / n).exists()), None)
        if f is None:
            missing.append(f"{family} {weight}")
            continue
        data = base64.b64encode(f.read_bytes()).decode()
        out.append(f"@font-face {{ font-family: '{family}'; font-weight: {weight}; font-style: normal; "
                   f"src: url(data:font/ttf;base64,{data}) format('truetype'); }}")
    if missing:
        print(f"ui.py: fonts not found, falling back to system faces: {', '.join(missing)}", file=sys.stderr)
    return "\n".join(out)


def juce_bridge():
    js = JUCE_DIR / "modules/juce_gui_extra/native/javascript"
    interop = (js / "check_native_interop.js").read_text()
    index = (js / "index.js").read_text().replace('import "./check_native_interop.js";', "")
    index = index.replace("export {", "window.Juce = {")
    return interop + "\n" + index


def ui_block(plugin_dir):
    pj = json.loads((plugin_dir / "plugin.json").read_text())
    ui = dict(UI_DEFAULTS, **pj.get("ui", {}))
    ui.setdefault("kind", pj.get("kind", "instrument"))
    backdrop = plugin_dir / "ui/backdrop.json"
    if backdrop.exists():
        ui["backdrop"] = json.loads(backdrop.read_text())
    return pj, ui


def page(mock_info=None):
    html = (MACH / "ui/editor.html").read_text()
    html = html.replace("/*@@FONTS@@*/", fonts()).replace("/*@@TOKENS@@*/", tokens()).replace("/*@@JUCE@@*/", juce_bridge())
    html = html.replace("/*@@MOCK@@*/", "" if mock_info is None else "window.MOCK_INFO = " + json.dumps(mock_info) + ";")
    return html


def build(plugin_dir, build_dir):
    pj, ui = ui_block(plugin_dir)
    out = build_dir / "ui"
    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(page())
    lines = ["// EditorConfig.h — written by machinery/tools/ui.py from plugin.json. Don't edit.", "#pragma once",
             f"#define PLUGIN_UI_W {int(ui['width'])}", f"#define PLUGIN_UI_H {int(ui['height'])}",
             f"#define PLUGIN_UI_MIN_W {int(ui['min'][0])}", f"#define PLUGIN_UI_MIN_H {int(ui['min'][1])}",
             f"#define PLUGIN_UI_MAX_W {int(ui['max'][0])}", f"#define PLUGIN_UI_MAX_H {int(ui['max'][1])}",
             'inline constexpr const char* kPluginUiJson = R"uijson(' + json.dumps(ui) + ')uijson";', ""]
    (out / "EditorConfig.h").write_text("\n".join(lines))


def mock_info(plugin_dir, direction, sets):
    found = [p for p in (plugin_dir / "build").glob("*Harness_artefacts/**/*Harness") if p.is_file()]
    if not found:
        sys.exit("no harness built: run ./plugin.sh build first")
    table = json.loads(subprocess.run([str(max(found, key=lambda p: p.stat().st_mtime)), "params"],
                                      check=True, capture_output=True, text=True).stdout)
    pj, ui = ui_block(plugin_dir)
    if direction:
        ui["direction"] = direction
        ui.pop("skin", None)
    params = table["params"]
    for s in sets:
        k, v = s.split("=", 1)
        p = next(p for p in params if p["id"] == k)
        p["mock"] = p["choices"].split("|").index(v) if p["taper"] == "choice" and not v.replace(".", "").isdigit() else float(v)
    return dict(name=pj["name"], version=pj["version"], company=pj["company"], params=params, ui=ui)


def shot(html_path, png, size):
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    w, h = size.split("x")
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                    f"--window-size={w},{h}", "--virtual-time-budget=3000", f"--screenshot={png}",
                    Path(html_path).resolve().as_uri()], check=True, capture_output=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mode", choices=["build", "mock", "shot"])
    ap.add_argument("plugin_dir")
    ap.add_argument("build_dir", nargs="?")
    ap.add_argument("--direction")
    ap.add_argument("--set", action="append", default=[])
    ap.add_argument("--size", default="760x480")
    ap.add_argument("--out")
    a = ap.parse_args()
    plugin_dir = Path(a.plugin_dir).resolve()
    if a.mode == "build":
        build(plugin_dir, Path(a.build_dir or plugin_dir / "build").resolve())
        return
    html = page(mock_info(plugin_dir, a.direction, a.set))
    if a.mode == "mock":
        Path(a.out).write_text(html)
        return
    tmp = Path(a.out).with_suffix(".html")
    tmp.write_text(html)
    shot(tmp, Path(a.out).resolve(), a.size)


if __name__ == "__main__":
    main()
