#!/usr/bin/env python3
"""ui.py — shared machinery: assemble a plugin's editor page from machinery/ui/editor.html.

  python3 machinery/tools/ui.py build <plugin dir> <build dir>
      Writes <build dir>/ui/index.html (embedded in the plugin) and <build dir>/ui/EditorConfig.h
      (the editor's sizes and the plugin.json "ui" block). plugin.sh build runs it first.
  python3 machinery/tools/ui.py mock <plugin dir> [--direction D] [--set id=value ...] [--round N] [--clean] --out page.html
      The same page with a stand-in for the plugin, to open in a browser, carrying the review
      surface (the design system's review-layer kit; --clean leaves it off). Needs a built harness
      (for the parameter table).
  python3 machinery/tools/ui.py shot <plugin dir> [--direction D] [--set id=value ...] --size 760x480 --out shot.png
      A mock page rendered to PNG by headless Chrome.
  python3 machinery/tools/ui.py fit <plugin dir> [--direction D] [--dress D] [--size WxH ...]
      Whether the editor fits its window without scrolling, at its plugin.json minimum, default and
      maximum sizes (or each --size). Exits 1 if it doesn't.

Into the page it inlines, so the plugin needs nothing at run time:
  the dress: Drafting Table's tokens, fonts, components and controls (_ops/drafting-table/design-system/,
  or DRAFTING_TABLE_DIR), or with "dress": "loudon-live" in the ui block, the Loudon Live tokens
  (_ops/loudon-live/design-system/colors_and_type.css),
  the fonts (Anton, Manrope, JetBrains Mono: machinery/ui/fonts/, else ~/Library/Fonts),
  JUCE's JavaScript bridge, and, for a mock, the parameter table.
A plugin may add plugins/<Name>/ui/backdrop.json: a field drawn under the XY pad.
"""
import argparse
import base64
import json
import os
import re
import subprocess
import sys
from pathlib import Path

MACH = Path(__file__).resolve().parents[1]
JUCE_DIR = Path(os.environ.get("JUCE_DIR", Path.home() / "Library/Caches/palace-vst-template/JUCE-8.0.12"))
FONTS = [  # family, weight range, file names to look for
    ("Anton", "400", ["Anton-Regular.ttf"]),
    ("JetBrains Mono", "600", ["JetBrainsMono-SemiBold.ttf"]),
    ("Manrope", "200 800", ["Manrope[wght].ttf", "Manrope-VariableFont_wght.ttf"]),
    ("JetBrains Mono", "400", ["JetBrainsMono-Regular.ttf"]),
    ("JetBrains Mono", "500", ["JetBrainsMono-Medium.ttf"]),
]
# Plugin editors wear Drafting Table, on Phosphor, in the bench direction (Loudon, 2026-10-21).
UI_DEFAULTS = dict(width=760, height=480, min=[560, 380], max=[1600, 1000], direction="bench", dress="drafting-table")


def find_up(rel):
    for d in [MACH, *MACH.parents]:
        if (d / rel).exists():
            return d / rel
    sys.exit(f"can't find {rel} above {MACH}")


def tokens():
    css = find_up("_ops/loudon-live/design-system/colors_and_type.css").read_text()
    return "\n".join(l for l in css.splitlines() if not l.startswith("@import"))   # fonts are inlined instead


def drafting_table_dir():
    # Drafting Table (the workshop's dress; plugin faces included, Loudon 2026-10-21). DRAFTING_TABLE_DIR
    # names another copy of it, such as the owner checkout's from a worktree cut before it landed.
    env = os.environ.get("DRAFTING_TABLE_DIR")
    return Path(env) if env else find_up("_ops/drafting-table/design-system")


def dress(ui):
    """The page's design system: (fonts css, tokens and component css, component js)."""
    if ui["dress"] != "drafting-table":
        return fonts(), tokens(), ""
    root = drafting_table_dir()
    def data_uris(css):
        return re.sub(r"url\('fonts/([^']+)\.woff2'\)",
                      lambda m: "url(data:font/woff2;base64," + base64.b64encode((root / "fonts" / (m.group(1) + ".woff2")).read_bytes()).decode() + ")", css)
    css = "\n".join([(root / "colors_and_type.css").read_text(), data_uris((root / "fonts.css").read_text()),
                     (root / "aliases.css").read_text(), (root / "bundle.css").read_text()])
    return fonts(only="JetBrains Mono"), css, (root / "dt-controls.js").read_text()


def fonts(only=None):
    dirs = [MACH / "ui/fonts", Path.home() / "Library/Fonts", Path("/Library/Fonts")]
    out, missing = [], []
    for family, weight, names in FONTS:
        if only and family != only:
            continue
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


# The review surface lives on the mock page, never in the plugin (Loudon, 2026-10-21: "review on
# the mockup"). It is the design system's review-layer kit, with its moments drawn from the
# editor's own layout: the direction as a whole, the header, the heroes, and one per panel.
REVIEW_MOUNT = """
window.__onEditorBuilt = function (info) {
  const direction = (info.ui || {}).direction || "bench";
  const heroes = info.params.filter(p => p.hero).map(p => p.name).join(" and ");
  const moments = [
    { id: "whole", label: "The " + direction + " direction, as a whole", tag: "design" },
    { id: "header", label: "Header: mark, name, tier, signature", tag: "design", sel: '[data-moment="header"]' },
  ];
  const screen = document.querySelector("#screen");
  if (screen && !screen.hidden) moments.push({ id: "screen", label: "The CRT: its casing and vignette", tag: "design", sel: "#screen" });
  if (document.querySelector('[data-moment="heroes"]'))
    moments.push({ id: "heroes", label: "The heroes: " + heroes, tag: "control", sel: '[data-moment="heroes"]' });
  document.querySelectorAll("section.panel[data-moment]").forEach(el =>
    moments.push({ id: el.dataset.moment, label: "Panel: " + el.dataset.group, tag: "control", sel: '[data-moment="' + el.dataset.moment + '"]' }));
  mountReviewLayer({ project: info.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-editor-" + direction,
                     round: %d, review: true, moments });
};
"""


# A mock's stand-in for a visualizer (ui.py --screen): colour bars, to show the CRT's casing and vignette
# around something that owes nothing to the dress. It draws into window.editorScreen, as a visualizer would.
TEST_CARD = """
(function go() {
  const glass = window.editorScreen;
  if (!glass) return setTimeout(go, 50);
  const cv = document.createElement("canvas"); glass.append(cv);
  const draw = () => {
    const W = glass.clientWidth, H = glass.clientHeight, d = window.devicePixelRatio || 1;
    if (!W || !H) return;
    cv.width = W * d; cv.height = H * d;
    const g = cv.getContext("2d"); g.setTransform(d, 0, 0, d, 0, 0);
    const bw = W / 7, row = (cs, y, h) => { let x = 0; cs.forEach(([c, w]) => { g.fillStyle = c; g.fillRect(x, y, w * bw + 1, h); x += w * bw; }); };
    row(["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"].map(c => [c, 1]), 0, H * 0.67);
    row(["#0000c0", "#131313", "#c000c0", "#131313", "#00c0c0", "#131313", "#c0c0c0"].map(c => [c, 1]), H * 0.67, H * 0.08);
    row([["#00214c", 1.25], ["#ffffff", 1.25], ["#32006a", 1.25], ["#131313", 1.25], ["#090909", 1 / 3], ["#131313", 1 / 3], ["#1d1d1d", 1 / 3], ["#131313", 1]], H * 0.75, H * 0.25);
  };
  new ResizeObserver(draw).observe(glass); draw();
})();
"""


def review(round_):
    kit = find_up("_ops/loudon-live/design-system/ui_kits/review-layer/review-layer.js").read_text()
    return kit + "\n" + REVIEW_MOUNT % round_


def inline_js(js):
    # A literal "</script" inside inlined code (the review kit's usage comment has one) would end
    # the <script> element early; "<\/script" means the same to JavaScript.
    return js.replace("</script", "<\\/script")


def page(ui, mock_info=None, review_round=None):
    html = (MACH / "ui/editor.html").read_text()
    font_css, css, js = dress(ui)
    html = html.replace("/*@@FONTS@@*/", font_css).replace("/*@@TOKENS@@*/", css)
    html = html.replace("/*@@DRESS@@*/", inline_js(js))
    html = html.replace("/*@@JUCE@@*/", inline_js(juce_bridge()))
    mock = "" if mock_info is None else "window.MOCK_INFO = " + json.dumps(mock_info) + ";"
    if mock_info is not None and ui.get("screen") == "test-card":
        mock += TEST_CARD
    html = html.replace("/*@@MOCK@@*/", inline_js(mock))
    html = html.replace("/*@@REVIEW@@*/", "" if review_round is None else inline_js(review(review_round)))
    return html


def build(plugin_dir, build_dir):
    pj, ui = ui_block(plugin_dir)
    out = build_dir / "ui"
    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(page(ui))
    lines = ["// EditorConfig.h — written by machinery/tools/ui.py from plugin.json. Don't edit.", "#pragma once",
             f"#define PLUGIN_UI_W {int(ui['width'])}", f"#define PLUGIN_UI_H {int(ui['height'])}",
             f"#define PLUGIN_UI_MIN_W {int(ui['min'][0])}", f"#define PLUGIN_UI_MIN_H {int(ui['min'][1])}",
             f"#define PLUGIN_UI_MAX_W {int(ui['max'][0])}", f"#define PLUGIN_UI_MAX_H {int(ui['max'][1])}",
             'inline constexpr const char* kPluginUiJson = R"uijson(' + json.dumps(ui) + ')uijson";', ""]
    (out / "EditorConfig.h").write_text("\n".join(lines))


def mock_info(plugin_dir, direction, sets, dress_name=None, screen=False):
    found = [p for p in (plugin_dir / "build").glob("*Harness_artefacts/**/*Harness") if p.is_file()]
    if not found:
        sys.exit("no harness built: run ./plugin.sh build first")
    table = json.loads(subprocess.run([str(max(found, key=lambda p: p.stat().st_mtime)), "params"],
                                      check=True, capture_output=True, text=True).stdout)
    pj, ui = ui_block(plugin_dir)
    if direction:
        ui["direction"] = direction
        ui.pop("skin", None)
    if dress_name:
        ui["dress"] = dress_name
    if screen:
        ui["screen"] = "test-card"
    params = table["params"]
    for s in sets:
        k, v = s.split("=", 1)
        p = next(p for p in params if p["id"] == k)
        p["mock"] = p["choices"].split("|").index(v) if p["taper"] == "choice" and not v.replace(".", "").isdigit() else float(v)
    return dict(name=pj["name"], version=pj["version"], company=pj["company"], params=params, ui=ui)


CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def chrome(args):
    # Headless Chrome very occasionally never exits (once in 336 runs, with six running beside a
    # plugin build), so each run gets a minute, and a run that hangs is tried once more.
    for attempt in (1, 2):
        try:
            return subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", *args],
                                  capture_output=True, text=True, timeout=60)
        except subprocess.TimeoutExpired:
            print(f"ui.py: headless Chrome hung (attempt {attempt})", file=sys.stderr)
    sys.exit("ui.py: headless Chrome hung twice")


def shot(html_path, png, size):
    w, h = size.split("x")
    png = Path(png)
    png.unlink(missing_ok=True)
    # Headless Chrome sometimes exits non-zero while shutting down after writing the file, so the
    # file is the test, not the exit code.
    r = chrome(["--force-device-scale-factor=2", f"--window-size={w},{h}", "--virtual-time-budget=3000",
                f"--screenshot={png}", Path(html_path).resolve().as_uri()])
    if not png.exists() or png.stat().st_size == 0:
        sys.exit(f"ui.py shot: Chrome wrote no image (exit {r.returncode}): {r.stderr.strip()[-400:]}")


# The panels scroll inside <main> when the window is too small for them, so the gap between its
# content and its box is the overflow.
FIT_PROBE = """<script>setTimeout(() => { const m = document.querySelector("main");
  document.body.dataset.fit = [innerWidth, innerHeight, m.scrollWidth - m.clientWidth, m.scrollHeight - m.clientHeight].join(" "); }, 1000);</script>"""


def fit(html_path, size):
    """How far the editor overflows a window of this size: (across, down) in px, 0 when it fits."""
    w, h = map(int, size.split("x"))
    win = [w, h]
    for _ in range(3):
        # Headless Chrome's page is smaller than the window it is given (87 px shorter on this Mac),
        # so the window grows by whatever the page reports missing until the page is the size asked.
        r = chrome([f"--window-size={win[0]},{win[1]}", "--virtual-time-budget=3000", "--dump-dom", Path(html_path).resolve().as_uri()])
        m = re.search(r'data-fit="(\d+) (\d+) (-?\d+) (-?\d+)"', r.stdout)
        if not m:
            sys.exit(f"ui.py fit: the page reported nothing at {size} (exit {r.returncode}): {r.stderr.strip()[-400:]}")
        vw, vh, dx, dy = map(int, m.groups())
        if (vw, vh) == (w, h):
            return max(0, dx), max(0, dy)
        win = [win[0] + w - vw, win[1] + h - vh]
    sys.exit(f"ui.py fit: couldn't get a {size} page from headless Chrome")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mode", choices=["build", "mock", "shot", "fit"])
    ap.add_argument("plugin_dir")
    ap.add_argument("build_dir", nargs="?")
    ap.add_argument("--direction")
    ap.add_argument("--dress", choices=["loudon-live", "drafting-table"], help="mock/shot/fit: override plugin.json")
    ap.add_argument("--set", action="append", default=[])
    ap.add_argument("--screen", action="store_true", help="mock/shot/fit: show the CRT, with colour bars standing in for a visualizer")
    ap.add_argument("--size", action="append", help="shot: the window (default 760x480); fit: each window to try")
    ap.add_argument("--round", type=int, default=1, help="mock: the review round (bump each revision pass)")
    ap.add_argument("--clean", action="store_true", help="mock: leave the review surface off")
    ap.add_argument("--out")
    a = ap.parse_args()
    plugin_dir = Path(a.plugin_dir).resolve()
    if a.mode == "build":
        build(plugin_dir, Path(a.build_dir or plugin_dir / "build").resolve())   # the plugin's page: never a review surface
        return
    info = mock_info(plugin_dir, a.direction, a.set, a.dress, a.screen)
    if a.mode == "mock":
        Path(a.out).write_text(page(info["ui"], info, None if a.clean else a.round))
        return
    if a.mode == "fit":
        ui = info["ui"]
        sizes = a.size or [f"{ui['min'][0]}x{ui['min'][1]}", f"{ui['width']}x{ui['height']}", f"{ui['max'][0]}x{ui['max'][1]}"]
        tmp = plugin_dir / f"build/ui/fit-{ui['dress']}-{ui['direction']}.html"   # one per check, so checks can run side by side
        tmp.parent.mkdir(parents=True, exist_ok=True)
        head, tail = page(ui, info).rsplit("</body>", 1)
        tmp.write_text(head + FIT_PROBE + "</body>" + tail)
        bad = 0
        for size in sizes:
            dx, dy = fit(tmp, size)
            print(f"{info['name']} · {ui['dress']} · {ui['direction']} · {size}: "
                  + ("fits" if not (dx or dy) else f"overflows by {dy} px down, {dx} px across"))
            bad += bool(dx or dy)
        sys.exit(1 if bad else 0)
    tmp = Path(a.out).with_suffix(".html")
    tmp.write_text(page(info["ui"], info))   # a shot is of the editor alone
    shot(tmp, Path(a.out).resolve(), (a.size or ["760x480"])[-1])


if __name__ == "__main__":
    main()
