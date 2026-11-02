#!/usr/bin/env python3
"""Builds zeta-over-time.html: a standalone listening page (Web Audio, no files)
with the seven studies' trajectories embedded from studies.json."""
import json
from pathlib import Path
HERE = Path(__file__).parent
data = json.loads((HERE / "studies.json").read_text())
ANSWER = {"ring": "same", "clean": "same", "loosen-still": "same", "ramp": "caught",
          "grab-crest": "grabbed", "grab-crossing": "grabbed", "loosen-late": "loosened"}
for s in data["studies"]:
    s["answer"] = ANSWER[s["id"]]
html = (HERE / "page_template.html").read_text().replace("/*DATA*/null", json.dumps(data))
(HERE / "zeta-over-time.html").write_text(html)
print("wrote zeta-over-time.html", len(html), "bytes")
