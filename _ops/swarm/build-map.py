#!/usr/bin/env python3
"""
build-map.py — the stable door to the newest dated map builder.

The Map Build's builders are date-stamped (build-map-YYYY-MM-DD.py). This
runs the newest one beside it with the same arguments, then keeps only the
three newest builds in the output folder. Git holds every build; the folder
holds what ghost persistence reads ([[Map Build Ceremony]] § Cadence).

  python3 _ops/swarm/build-map.py [--date D] [--out-dir DIR] [--keep N]

A build is not a ceremony run: it writes no line to the tuning ledger.
"""
import argparse, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PALACE = os.path.dirname(os.path.dirname(HERE))
DATED = re.compile(r"^build-map-\d{4}-\d{2}-\d{2}\.py$")
BUILD = re.compile(r"^palace-map-full-(\d{4}-\d{2}-\d{2})(\.json|\.tsv|-adjacency\.txt)$")

def newest_builder(folder=HERE):
    names = sorted(n for n in os.listdir(folder) if DATED.match(n))
    return os.path.join(folder, names[-1]) if names else None

def prune(out_dir, keep):
    """Keep the `keep` newest dated builds; return the files removed."""
    by_date = {}
    for n in os.listdir(out_dir):
        m = BUILD.match(n)
        if m:
            by_date.setdefault(m.group(1), []).append(n)
    old = sorted(by_date)[:-keep] if keep > 0 else []
    removed = []
    for d in old:
        for n in by_date[d]:
            os.remove(os.path.join(out_dir, n)); removed.append(n)
    return removed

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--keep", type=int, default=3, help="dated builds to keep on disk (default 3)")
    ap.add_argument("--out-dir", default=os.path.join(PALACE, "_ops", "maps"))
    a, passthrough = ap.parse_known_args()
    builder = newest_builder()
    if not builder:
        sys.exit("no build-map-YYYY-MM-DD.py beside build-map.py")
    r = subprocess.run([sys.executable, builder, "--out-dir", a.out_dir, *passthrough], cwd=PALACE)
    if r.returncode != 0:
        sys.exit(r.returncode)
    removed = prune(a.out_dir, a.keep)
    print(f"builder: {os.path.basename(builder)}; kept the {a.keep} newest builds in {os.path.relpath(a.out_dir, PALACE)}"
          + (f"; removed {len(removed)} older files" if removed else ""))

if __name__ == "__main__":
    main()
