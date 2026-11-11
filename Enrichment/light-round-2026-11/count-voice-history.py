#!/usr/bin/env python3
"""Light round 2026-11 — em-dashes and bold per thousand words, month by month, read from git.
For the last commit of each month it counts across every tracked .md at that commit. Writes voice-history.json."""
import subprocess, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
def run(*a): return subprocess.run(a, cwd=ROOT, capture_output=True, text=True, errors="replace").stdout
out = []
for m in ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"]:
    y, mo = map(int, m.split("-")); nxt = f"{y + (mo == 12)}-{mo % 12 + 1:02d}-01"
    c = run("git", "rev-list", "-1", f"--before={nxt}", "main").strip()
    if not c: continue
    text = run("git", "grep", "-h", "-I", "-e", "", c, "--", "*.md")
    words = len(re.findall(r"[A-Za-z][A-Za-z'’-]*", text)); dash = text.count("—"); bold = len(re.findall(r"\*\*[^*\n]+\*\*", text))
    out.append({"month": m, "commit": c[:8], "words": words, "emdash_per_k": round(dash / words * 1000, 2), "bold_per_k": round(bold / words * 1000, 2)})
    print(out[-1], flush=True)
json.dump(out, open(os.path.join(HERE, "voice-history.json"), "w"), indent=1)
