#!/usr/bin/env python3
"""Sandbox test for lint-doc-drift.py's trigger check (W2). A ceremony is a page
carrying `trigger:` in its frontmatter (SCHEMA v1.28) - not a file with "ceremony" in
its name - so the check must find Closing Well and the Daily Page, skip a page that only
mentions a trigger in prose, and skip the archive.

Run:  python3 _ops/swarm/test-doc-drift-triggers.py"""
import os, shutil, subprocess, sys, tempfile

SWARM = os.path.dirname(os.path.abspath(__file__))  # this file lives in _ops/swarm/
ROOT = tempfile.mkdtemp(prefix="palace-triggers-")


def w(rel, content):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)


w("CLAUDE.md", "# Claude\n\n## Ceremony Triggers\n\n| Say | Ceremony |\n|---|---|\n"
  '| "deposit", "add this to the palace" | [[Deposit Ceremony]] |\n'
  '| "close well" | [[Closing Well Ceremony]] |\n'
  '| "revive [entry]" | [[Revival Ceremony]] |\n\n## The Palace Voice\n\nPlain.\n')
# A card in _ops: one covered phrase, one the table lacks (inline list).
w("_ops/Deposit Ceremony.md", '---\ntitle: "Deposit Ceremony"\ntrigger: ["deposit", "stash it"]\n---\n# Deposit\n')
# No "ceremony" in the filename, at the root - the old filename test missed these.
w("Closing Well.md", '---\ntitle: "Closing Well"\ntrigger:\n  - "close well"\n  - "wrap the session"\n---\n# Closing Well\n')
# A bracketed slot is stripped before comparing; and a body **Trigger:** line is read too.
w("_ops/Revival Ceremony.md", '---\ntitle: "Revival Ceremony"\ntrigger: ["revive [entry]"]\n---\n# Revival\n\n**Trigger:** "revive [entry]" or "wake [entry] up"\n')
# Prose about a trigger, on a page that is not a ceremony: never checked.
w("Notes on a ceremony.md", '---\ntitle: "Notes on a ceremony"\n---\n**Trigger:** "a phrase nobody says"\n')
# An archived ceremony is not live.
w("_ops/Old/Archive/Old Ceremony.md", '---\ntitle: "Old Ceremony"\ntrigger: ["an archived word"]\n---\n')

try:
    r = subprocess.run([sys.executable, os.path.join(SWARM, "lint-doc-drift.py"), ROOT],
                       capture_output=True, text=True)
    w2 = sorted(l.strip() for l in r.stdout.splitlines() if l.strip().startswith("W2"))
    expected = sorted([
        'W2  trigger not in CLAUDE.md table:  "stash it"  (trigger: in _ops/Deposit Ceremony.md)',
        'W2  trigger not in CLAUDE.md table:  "wrap the session"  (trigger: in Closing Well.md)',
        'W2  trigger not in CLAUDE.md table:  "wake up"  (**Trigger:** in _ops/Revival Ceremony.md)',
    ])
    fails = []
    if w2 != expected:
        fails.append("W2 findings differ:\n  got:\n    " + "\n    ".join(w2) + "\n  expected:\n    " + "\n    ".join(expected))
    if fails:
        print("FAIL\n" + "\n".join(fails))
        sys.exit(1)
    print(f"PASS  lint-doc-drift W2: {len(w2)} findings, each a trigger: page; prose and the archive spared")
finally:
    shutil.rmtree(ROOT, ignore_errors=True)
