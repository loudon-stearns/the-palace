# Score the judge's Stage 2 per arm: mean of each dimension, and SPIRIT wins,
# ties and losses for arm b against arm a.
#
#   python3 score.py <judge_task_output> <key.json> <stage2_out.txt>
#
# key.json maps each moment to which reply number was which arm:
#   {"T01": {"1": "a", "3": "b"}, ...}   (the human's number is left out)
# Prints scores and counts only; those are what may go in the tuning ledger.
import json, re, sys

if len(sys.argv) != 4:
    sys.exit("usage: python3 score.py <judge_task_output> <key.json> <stage2_out.txt>")
judge_out, key_path, stage2_path = sys.argv[1:]
key = json.load(open(key_path))

msgs = []
for ln in open(judge_out):
    try:
        o = json.loads(ln)
    except Exception:
        continue
    c = (o.get("message") or {}).get("content")
    if isinstance(c, list):
        for x in c:
            if isinstance(x, dict) and x.get("type") == "tool_use" and isinstance(x.get("input"), dict) and "message" in x["input"]:
                msgs.append(x["input"]["message"])
txt = msgs[-1]
open(stage2_path, "w").write(txt)

rows = {"a": [], "b": []}
per = {}
for t in sorted(key):
    body = " ".join(re.findall(rf"^\s*{t}\s*\|(.*)$", txt, re.M))
    if not body:
        print("missing", t)
        continue
    for blk in re.finditer(r"R(\d):\s*MOVE\s*(\d)\s*SIZE\s*(\d)\s*BACK\s*(\d)\s*REG\s*(\d)\s*SPIRIT\s*(\d)", body):
        n, mv, sz, bk, rg, sp = blk.groups()
        arm = key[t][n]
        rows[arm].append((t, int(mv), int(sz), int(bk), int(rg), int(sp)))
        per.setdefault(t, {})[arm] = int(sp)

names = ["MOVE", "SIZE", "BACK", "REG", "SPIRIT"]
for arm, label in [("a", "arm a"), ("b", "arm b")]:
    r = rows[arm]
    n = len(r)
    if not n:
        print(label, "n=0")
        continue
    print(f"{label:6s} n={n} " + "  ".join(f"{nm} {sum(x[i + 1] for x in r) / n:.2f}" for i, nm in enumerate(names)))
wins = sum(1 for v in per.values() if v.get("b", 0) > v.get("a", 0))
ties = sum(1 for v in per.values() if v.get("b") == v.get("a"))
print("arm b wins", wins, "ties", ties, "loses", len(per) - wins - ties)
