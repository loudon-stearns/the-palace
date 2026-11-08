#!/usr/bin/env python3
"""Re-inject catalog-draft.json into the sketch timeline (the `const W = …;` line)."""
import json, re
P = "../The Gallery — sketch — timeline.html"
d = json.dumps(json.load(open("catalog-draft.json")), ensure_ascii=False)
h = open(P).read()
h, n = re.subn(r"^const W = .*?;$", lambda m: f"const W = {d};", h, count=1, flags=re.M)
assert n == 1, "data line not found"
open(P, "w").write(h)
