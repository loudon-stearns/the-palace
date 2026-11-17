#!/usr/bin/env python3
"""Re-inject a catalog into the sketch timeline (the `const W = …;` line).

    python3 build-sketch.py [catalog-draft-v3.json]
"""
import json, re, sys
P = "../The Gallery — sketch — timeline.html"
src = sys.argv[1] if len(sys.argv) > 1 else "catalog-draft-v3.json"
d = json.dumps(json.load(open(src)), ensure_ascii=False)
h = open(P).read()
h, n = re.subn(r"^const W = .*?;$", lambda m: f"const W = {d};", h, count=1, flags=re.M)
assert n == 1, "data line not found"
open(P, "w").write(h)
print(f"{src} → sketch")
