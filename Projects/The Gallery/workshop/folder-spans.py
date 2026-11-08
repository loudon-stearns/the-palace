#!/usr/bin/env python3
"""Date the folders of a Dropbox area by their files' modification times,
without hydrating a single file (os.stat reads metadata only; a dataless
File Provider file still carries its size and mtime).

    python3 folder-spans.py <dropbox-relative area> [<area> ...] > spans.json

One row per immediate child folder: file count, earliest and latest mtime,
the median year, and the top extensions. File dates are a first guess at
when a work happened, marked assumed until Loudon says otherwise.
"""
import json, os, sys, statistics, collections, datetime

ROOT = os.path.expanduser("~/Library/CloudStorage/Dropbox")

def span(path):
    times, exts = [], collections.Counter()
    for dp, dns, fns in os.walk(path):
        dns[:] = [d for d in dns if not d.startswith(".")]
        for f in fns:
            if f.startswith("."):
                continue
            try:
                st = os.lstat(os.path.join(dp, f))
            except OSError:
                continue
            times.append(st.st_mtime)
            exts[os.path.splitext(f)[1].lower() or "(none)"] += 1
    if not times:
        return None
    day = lambda t: datetime.date.fromtimestamp(t).isoformat()
    return {
        "files": len(times),
        "first": day(min(times)),
        "last": day(max(times)),
        "median_year": datetime.date.fromtimestamp(statistics.median(times)).year,
        "top_ext": [e for e, _ in exts.most_common(4)],
    }

rows = []
for area in sys.argv[1:]:
    base = os.path.join(ROOT, area)
    for name in sorted(os.listdir(base)):
        p = os.path.join(base, name)
        if name.startswith(".") or not os.path.isdir(p):
            continue
        s = span(p)
        if s:
            rows.append({"area": area, "folder": name, **s})
json.dump(rows, sys.stdout, indent=1, ensure_ascii=False)
