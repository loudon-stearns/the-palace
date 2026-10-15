#!/usr/bin/env python3
"""Sandbox test for the palace hygiene tools (lint-ghost-links, lint-bundle-hygiene,
face-audit). Builds a fixture palace with known defects and clean controls, runs each
tool, and asserts exact findings (catches the bad, spares the good).

Run:  python3 _ops/swarm/test-hygiene-tools.py"""
import os, shutil, subprocess, sys, tempfile

SWARM = os.path.dirname(os.path.abspath(__file__))  # this file lives in _ops/swarm/
ROOT = tempfile.mkdtemp(prefix="palace-sandbox-")

def w(rel, content):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w") as f:
        f.write(content)

def fm(**kw):
    lines = ["---"]
    for k, v in kw.items():
        if k == "links":
            lines.append("links:")
            for t in v:
                lines.append(f'  - target: "[[{t}]]"')
                lines.append(f'    type: connects-to')
        else:
            lines.append(f"{k}: {v}")
    lines.append("---\n")
    return "\n".join(lines)

# --- ghost + control: Alpha has 1 dead link, 1 dead embed; 1 live link, 1 live embed ---
w("Alpha.md", fm(title="Alpha", type="concept", pillars="[philosophy]", born="2026-07",
                 stage="growing", links=["Beta"]) +
  "# Alpha\n\nAlpha connects to [[Beta]] and points at [[Ghost Target]].\n"
  "Here is a real image ![[real.png]] and a dead one ![[missing.png]].\n"
  "A fenced example must be ignored:\n```\n[[Not A Real Ghost]]\n```\n"
  "And inline `[[Also Ignored]]` too.\n")
w("real.png", "PNGDATA")

# --- Beta: well-linked concept, no bundle -> missing a face; also a live target
w("Beta.md", fm(title="Beta", type="concept", pillars="[tools]", born="2026-07",
                stage="growing", links=["Alpha", "Gamma", "Delta", "Foo", "Seed", "Clean"]) +
  "# Beta\n\nA well-connected concept with no face yet.\n")

# --- Gamma: invalid type -> bundle-hygiene E1 error
w("Gamma.md", fm(title="Gamma", type="proof", pillars="[practice]", born="2026-07",
                 stage="growing") + "# Gamma\n\nWorking substrate wearing a bad type.\n")

# --- Delta: spore holding a face -> keeps it (nothing is retired)
w("Delta.md", fm(title="Delta", type="spore", pillars="[creation]", born="2026-07",
                 stage="dormant", revival_conditions="someday") + "# Delta\n")
w("Delta/Delta — hero.png", "PNG")
w("Delta/Delta — icon.png", "PNG")

# --- Foo bundle: Foo.md (seed, faceless) + nested canon Bar.md inside -> bundle W1
w("Foo.md", fm(title="Foo", type="concept", pillars="[practice]", born="2026-07", stage="seed")
  + "# Foo\n")
w("Foo/Bar.md", fm(title="Bar", type="concept", pillars="[tools]", born="2026-07", stage="seed")
  + "# Bar\n\nNested canon inside a bundle - a demotion candidate to judge.\n")
w("Foo/Foo — sketch.md", '---\ntitle: "Foo — sketch"\nborn: 2026-07-05\n---\n\nA bundle file, no type - must be spared.\n')

# --- Projects/: organizational folder (no Projects.md twin). project entry -> missing a face, NOT bundle-flagged
w("Projects/Proj.md", fm(title="Proj", type="project", pillars="[creation]", born="2026-07",
                         stage="active", status="active", links=["Beta"]) + "# Proj\n")

# --- Seed: seed concept, no face -> missing a face (stage never exempts), no ghosts
w("Seed.md", fm(title="Seed", type="concept", pillars="[tools]", born="2026-07", stage="seed")
  + "# Seed\n")

# --- Sprout: sprout concept WITH a face -> not listed
w("Sprout.md", fm(title="Sprout", type="concept", pillars="[tools]", born="2026-07",
                  stage="sprout") + "# Sprout\n")
w("Sprout/Sprout — hero.png", "PNG")
w("Sprout/Sprout — icon.png", "PNG")

# --- Clean: growing concept WITH a face -> absent from face lists, no other flags
w("Clean.md", fm(title="Clean", type="concept", pillars="[philosophy]", born="2026-07",
                 stage="growing") + "# Clean\n")
w("Clean/Clean — hero.png", "PNG")
w("Clean/Clean — icon.png", "PNG")

# --- Dormant: dormant concept, no face -> missing a face (dormancy never exempts)
w("Dormant.md", '---\ntitle: Dormant\ntype: concept\npillars: [tools]\nborn: 2026-07\n'
  'stage: dormant\nlinks:\n  - { target: "[[X]]", type: connects-to }\n---\n# Dormant\n')

# --- Rtm: SPROUT PROJECT, no face -> missing a face (the old bands hid this one: Projects/LDN RTM)
w("Projects/Rtm.md", fm(title="Rtm", type="project", pillars="[creation]", born="2026-10",
                        stage="sprout", status="active") + "# Rtm\n")

# --- Quest: question WITH a face -> keeps it, not listed
w("Quest.md", fm(title="Quest", type="question", pillars="[philosophy]", born="2026-07",
                 stage="seed") + "# Quest\n")
w("Quest/Quest — hero.png", "PNG")
w("Quest/Quest — icon.png", "PNG")

# --- Compost: composting concept WITH a face -> keeps it, not listed
w("Compost.md", fm(title="Compost", type="concept", pillars="[practice]", born="2026-07",
                   stage="composting") + "# Compost\n")
w("Compost/Compost — hero.png", "PNG")
w("Compost/Compost — icon.png", "PNG")

# --- HeroOnly / IconOnly: half a face -> listed, naming the missing side
w("HeroOnly.md", fm(title="HeroOnly", type="practice", pillars="[practice]", born="2026-07",
                    stage="mature") + "# HeroOnly\n")
w("HeroOnly/HeroOnly — hero.png", "PNG")
w("IconOnly.md", fm(title="IconOnly", type="meta", pillars="[tools]", born="2026-07",
                    stage="growing") + "# IconOnly\n")
w("IconOnly/IconOnly — icon.png", "PNG")

# --- Titled: title differs from filename; face filed under the TITLE folder -> counted as faced
w("Titled.md", fm(title='"Titled Other"', type="concept", pillars="[tools]", born="2026-07",
                  stage="growing") + "# Titled Other\n")
w("Titled Other/Titled Other — hero.png", "PNG")
w("Titled Other/Titled Other — icon.png", "PNG")

# --- Swarm: canon-typed machinery under _ops/swarm/ -> skipped (not a map node), not listed
w("_ops/swarm/Swarm Template.md", fm(title="Swarm Template", type="meta", pillars="[tools]",
                                     born="2026-07", stage="growing") + "# Swarm Template\n")

def run(tool):
    r = subprocess.run([sys.executable, os.path.join(SWARM, tool), ROOT],
                       capture_output=True, text=True)
    return r.stdout, r.returncode

fails = []
def check(name, cond, detail=""):
    print(("  PASS" if cond else "  FAIL"), name, detail)
    if not cond:
        fails.append(name)

print("== ghost-link linter ==")
out, rc = run("lint-ghost-links.py")
check("exit 0 (flag-only)", rc == 0)
check("2 ghosts total", "0 errors, 2 warnings" in out, f"\n{out}" if "2 warnings" not in out else "")
check("flags [[Ghost Target]]", "Ghost Target" in out)
check("flags dead embed missing.png", "missing.png" in out)
check("spares live link [[Beta]]", "[[Beta]]" not in out)
check("spares live embed real.png", "real.png" not in out)
check("ignores fenced example", "Not A Real Ghost" not in out)
check("ignores inline code", "Also Ignored" not in out)

print("== bundle-hygiene linter ==")
out, rc = run("lint-bundle-hygiene.py")
check("exit 1 (invalid type gates)", rc == 1)
check("1 error 1 warning", "1 errors, 1 warnings" in out, f"\n{out}" if "1 errors, 1 warnings" not in out else "")
check("E1 on Gamma invalid type", "Gamma.md" in out and "proof" in out)
check("W1 on nested Bar.md", "Bar.md" in out and "Foo" in out)
check("spares bundle file Foo — sketch", "sketch" not in out)
check("spares organizational Projects/Proj", "Proj.md" not in out)
check("spares clean Delta.md (twin, not nested)", "Delta.md" not in out)

print("== face audit ==")
out, rc = run("face-audit.py")
rows = {l.strip()[2:].split("  (")[0]: l for l in out.splitlines() if l.startswith("  + ")}
def listed(rel):
    return rel in rows
check("exit 0 (audit)", rc == 0)
check("10 of 16 canon entries missing", "MISSING A FACE (10 of 16 canon entries in the palace)" in out
      and "summary: 10 missing a face, 6 of 16 wear both" in out, f"\n{out}" if len(rows) != 10 else "")
# every faceless canon entry is listed - no stage, type, link or use band exempts one
for rel in ("Alpha.md", "Beta.md", "Foo.md", "Seed.md", "Dormant.md", "Projects/Proj.md",
            "Projects/Rtm.md", os.path.join("Foo", "Bar.md")):
    check(f"lists {rel}", listed(rel) and "no hero, no icon" in rows.get(rel, ""))
check("sprout project listed (the old bands hid LDN RTM)", listed("Projects/Rtm.md"))
check("half a face names the missing icon", "missing icon" in rows.get("HeroOnly.md", ""))
check("half a face names the missing hero", "missing hero" in rows.get("IconOnly.md", ""))
# a face is never retired: spores, questions, sprouts and composting entries keep theirs
for rel in ("Delta.md", "Quest.md", "Sprout.md", "Compost.md", "Clean.md"):
    check(f"spares faced {rel}", rel not in out)
check("no retire list", "RETIRE" not in out and "retire" not in out.lower())
check("face filed under the title folder counts", "Titled.md" not in out)
# not canon, or not a node: skipped
check("spares invalid type (Gamma)", "Gamma.md" not in out)
check("spares bundle file (Foo — sketch)", "sketch" not in out)
check("spares _ops/swarm machinery", "Swarm Template" not in out)
# --paths scopes the audit (Closing Well runs it on a session's touched files)
r = subprocess.run([sys.executable, os.path.join(SWARM, "face-audit.py"), ROOT,
                    "--paths", "Seed.md,Clean.md,Projects/Rtm.md"], capture_output=True, text=True)
check("--paths scopes to the named files",
      "MISSING A FACE (2 of 3 canon entries in scope)" in r.stdout
      and "Seed.md" in r.stdout and "Projects/Rtm.md" in r.stdout and "Alpha.md" not in r.stdout,
      f"\n{r.stdout}" if "2 of 3" not in r.stdout else "")
# `breakthrough` was retired in SCHEMA v1.17
import importlib.util
_spec = importlib.util.spec_from_file_location("face_audit", os.path.join(SWARM, "face-audit.py"))
_fa = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(_fa)
check("breakthrough is not a canon type", "breakthrough" not in _fa.CANON_TYPES)

print()
if fails:
    print(f"FAILED: {len(fails)} -> {fails}")
    print(f"(fixture left at {ROOT} for inspection)")
    sys.exit(1)
print("ALL PASS")
shutil.rmtree(ROOT)
