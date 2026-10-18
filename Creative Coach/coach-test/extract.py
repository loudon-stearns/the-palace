# Pull each woken page's WHO and REPLY out of the subagent task outputs.
#
#   python3 extract.py <tasks_dir> <agent_map.json> <replies_out.json>
#
# agent_map.json maps "<arm>-<item id>" -> the subagent's id; each task output is
# <tasks_dir>/<id>.output, one JSON event per line (the Claude Code harness's
# format). The output holds participant-derived text: keep it in the scratchpad.
import json, os, re, sys

if len(sys.argv) != 4:
    sys.exit("usage: python3 extract.py <tasks_dir> <agent_map.json> <replies_out.json>")
tasks, map_path, out_path = sys.argv[1:]
agent_map = json.load(open(map_path))

def final_text(path):
    last = None
    for ln in open(path):
        try:
            o = json.loads(ln)
        except Exception:
            continue
        msg = o.get("message") or {}
        if msg.get("role") == "assistant" or o.get("type") == "assistant":
            c = msg.get("content")
            if isinstance(c, list):
                t = "".join(x.get("text", "") for x in c if isinstance(x, dict) and x.get("type") == "text")
                for x in c:
                    if isinstance(x, dict) and x.get("type") == "tool_use" and isinstance(x.get("input"), dict) and "WHO" in str(x["input"].get("message", "")):
                        t = x["input"]["message"]
                if t.strip():
                    last = t
            elif isinstance(c, str) and c.strip():
                last = c
    return last

out = {}
for k, aid in agent_map.items():
    p = os.path.join(tasks, aid + ".output")
    t = final_text(p) if os.path.exists(p) else None
    if not t:
        out[k] = None
        continue
    who = re.search(r"WHO:\s*(.*?)(?=\n\s*REPLY:|\Z)", t, re.S)
    rep = re.search(r"REPLY:\s*(.*)\Z", t, re.S)
    out[k] = {"who": who.group(1).strip() if who else "", "reply": (rep.group(1).strip() if rep else t.strip())}
json.dump(out, open(out_path, "w"), indent=1, ensure_ascii=False)
print("got", sum(1 for v in out.values() if v), "of", len(out))
