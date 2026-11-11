#!/usr/bin/env python3
"""Light round 2026-11, remake — em-dashes and bold per thousand words of canon prose, month by month.
The challenger's correction: measure what the page's own linter measures (_ops/swarm/lint-voice-drift.py: entries with
frontmatter and a type, 150 words or more, body prose only, its skip list), pooled over all such entries, at the last
commit of each month. Writes voice-history-canon.json. The first count (count-voice-history.py) pooled every .md."""
import importlib.util, json, os, re, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
spec = importlib.util.spec_from_file_location("lint", os.path.join(ROOT, "_ops/swarm/lint-voice-drift.py")); lint = importlib.util.module_from_spec(spec); spec.loader.exec_module(lint)
out = []
for m in ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"]:
    y, mo = map(int, m.split("-")); nxt = f"{y + (mo == 12)}-{mo % 12 + 1:02d}-01"
    c = subprocess.run(["git", "rev-list", "-1", f"--before={nxt}", "main"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    names = subprocess.run(["git", "-c", "core.quotepath=off", "ls-tree", "-r", "--name-only", "-z", c], cwd=ROOT, capture_output=True).stdout.decode("utf-8", "replace").split("\0")
    names = [n for n in names if n.endswith(".md") and not (set(n.split("/")[:-1]) & lint.SKIP_DIRS)]
    blob = subprocess.run(["git", "cat-file", "--batch"], cwd=ROOT, input="\n".join(f"{c}:{n}" for n in names).encode(), capture_output=True).stdout
    pos = 0; W = B = D = N = 0
    for n in names:
        nl = blob.index(b"\n", pos); head = blob[pos:nl].split(); pos = nl + 1
        if len(head) < 3 or head[1] != b"blob": continue
        size = int(head[2]); raw = blob[pos:pos + size].decode("utf-8", "replace"); pos += size + 1
        if not raw.startswith("---") or not re.search(r"^type:\s*\S", raw[:2000], re.M): continue
        prose = lint.body_prose(raw); w = len(prose.split())
        if w < lint.MIN_WORDS: continue
        N += 1; W += w; B += len(re.findall(r"\*\*[^*\n]+\*\*", prose)); D += prose.count("—")
    out.append({"month": m, "commit": c[:8], "entries": N, "words": W, "emdash_per_k": round(D / W * 1000, 2), "bold_per_k": round(B / W * 1000, 2)}); print(out[-1], flush=True)
json.dump(out, open(os.path.join(HERE, "voice-history-canon.json"), "w"), indent=1)
