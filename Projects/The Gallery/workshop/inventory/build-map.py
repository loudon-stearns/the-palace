#!/usr/bin/env python3
"""Inject a sweep's candidates into inventory-map.html (the `const C = …;` line).

    node ../store/store.mjs sweep <areas…> --out candidates-<date>.jsonl
    python3 build-map.py candidates-<date>.jsonl
"""
import json, re, sys, os
here = os.path.dirname(os.path.abspath(__file__))
rows = [json.loads(l) for l in open(sys.argv[1]) if l.strip()]
P = os.path.join(here, "inventory-map.html")
h = open(P).read()
h, n = re.subn(r"^const C = .*?;$", lambda m: "const C = " + json.dumps(rows, ensure_ascii=False) + ";", h, count=1, flags=re.M)
assert n == 1, "data line not found"
open(P, "w").write(h)
print(f"{len(rows)} candidates → inventory-map.html")
