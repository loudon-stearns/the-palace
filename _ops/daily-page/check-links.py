#!/usr/bin/env python3
"""check-links.py — the dealer's link check against the cases that were called ghosts.

The Daily Page — tuning items 59, 63, 89 and 94: the dealer listed real links as forward ghosts
(a bundle file such as [[BLUELINE — Text Layer]], a link written with its folder such as
[[Shop/Lettering]]). deal.py now looks each link up by the map's own link rule, and says
"a file, not a page" when the file exists and is not a page. This runs the dealer's own
`resolve` on those cases, then counts, over the newest map, how many out-links the old rule
and the new one call ghosts. It reads the palace and writes nothing.

  python3 _ops/daily-page/check-links.py                 # reads the main checkout
  python3 _ops/daily-page/check-links.py --root DIR      # reads another tree
Exit 0 when every case holds, 1 when one does not.
"""
import argparse, importlib.util, json, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent

# (link as written, the file it should land on, whether that file is a page)
CASES = [
    ("BLUELINE — Text Layer", "Projects/BLUELINE/BLUELINE — Text Layer.md", False),
    ("BLUELINE — Render Backend", "Projects/BLUELINE/BLUELINE — Render Backend.md", False),
    ("BLUELINE — Board Record Schema", "Projects/BLUELINE/BLUELINE — Board Record Schema.md", False),
    ("BLUELINE — Production Pipeline", "Projects/BLUELINE/BLUELINE — Production Pipeline.md", False),
    ("BLUELINE — Motion and Flow", "Projects/BLUELINE/BLUELINE — Motion and Flow.md", False),
    ("BLUELINE — The Page", "Projects/BLUELINE/BLUELINE — The Page.md", False),
    ("Loudon Live Post-producer — Log",                                   # item 94, 2026-11-08
     "Shop/Loudon Live Post-producer/Loudon Live Post-producer — Log.md", False),
    ("Shop/Lettering", "Shop/Lettering.md", True),
    ("Shop/Blender", "Shop/Blender.md", True),
    ("Shop/Blender|the Blender page", "Shop/Blender.md", True),
    ("A Page That Was Never Written", None, False),
]


def load_dealer():
    spec = importlib.util.spec_from_file_location("deal", HERE / "deal.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    ap = argparse.ArgumentParser(description="Check the dealer's link lookup.")
    ap.add_argument("--root", type=Path)
    a = ap.parse_args()
    deal = load_dealer()
    root = (a.root or deal.main_checkout(deal.find_root(HERE))).resolve()
    with tempfile.TemporaryDirectory() as tmp:          # an empty state: nothing is dealt or written
        s = deal.build(root, Path(tmp), "2000-01-01", write=False)

    failed = 0
    for link, want_path, want_page in CASES:
        got_path, got_page = deal.resolve(s, link)
        ok = got_path == want_path and got_page == want_page
        failed += not ok
        what = ("a page" if got_page else "a file, not a page") if got_path else "a forward ghost"
        print(f"  {'ok  ' if ok else 'FAIL'} [[{link}]] -> {got_path or '—'} ({what})")

    maps = sorted((root / "_ops" / "maps").glob("palace-map-full-*.json"))
    if maps:
        d = json.loads(maps[-1].read_text(encoding="utf-8"))
        edges = d.get("edges") or d.get("links") or []
        old = new = files = 0
        for e in edges:
            t = e.get("target")
            if not t:
                continue
            old += t not in s["entries"]
            path, page = deal.resolve(s, t)
            new += path is None
            files += bool(path) and not page
        print(f"\n  {maps[-1].name}: {len(edges)} links; called ghosts by the old rule {old}, "
              f"by the new {new}; {files} now named as files, not pages")
    print("\nall cases hold" if not failed else f"\n{failed} case(s) do not hold")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
