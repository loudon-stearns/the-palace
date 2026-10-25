#!/usr/bin/env python3
"""Sandbox test for the four linters' --paths scope (lint-doc-drift, lint-ghost-links,
lint-entry-naming, lint-link-directions) and the direction linter's stale-map check.
Builds a fixture palace in git with planted defects and clean controls, runs each linter
scoped to a bad file and to a clean one, and asserts the scoped run flags the one and
spares the other. The Deposit Ceremony's step 6 postcondition is what this guards.

Run:  python3 _ops/swarm/test-scoped-linters.py"""
import glob, json, os, shutil, subprocess, sys, tempfile

SWARM = os.path.dirname(os.path.abspath(__file__))  # this file lives in _ops/swarm/
ROOT = tempfile.mkdtemp(prefix="palace-scoped-")

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
            for t, ty in v:
                lines.append(f'  - target: "[[{t}]]"')
                lines.append(f'    type: {ty}')
        else:
            lines.append(f"{k}: {v}")
    lines.append("---\n")
    return "\n".join(lines)

def entry(title, typ="concept", links=(), body=""):
    return fm(title=title, type=typ, pillars="[tools]", born="2026-10", stage="growing",
              links=list(links)) + f"# {title}\n\n{body}\n"

def git(*args):
    subprocess.run(["git", "-C", ROOT, "-c", "user.name=t", "-c", "user.email=t@t",
                    "-c", "core.hooksPath=/dev/null", *args], check=True, capture_output=True)

# --- clean control: a canon entry that every linter should pass
w("Clean.md", entry("Clean", links=[("Titled", "connects-to")],
                    body="Clean points at [[Titled]], which exists."))
# --- the trigger table doc-drift reads (W2)
w("CHILD.md", '# CHILD\n\n## Ceremony Triggers\n\n| Say | Ceremony |\n|---|---|\n'
              '| "walk" | [[Walk]] |\n')
# --- doc-drift: a wrong-case reference (E3 error) and a broken path (W0)
w("Drifty.md", "# Drifty\n\nSee `clean.md` and `nothere/thing.md`.\n")
# --- doc-drift: a ceremony whose trigger is missing from CHILD.md's table (W2)
w("Dance Ceremony.md", '---\ntitle: "Dance Ceremony"\ntrigger: ["dance"]\n---\n# Dance\n')
# --- ghost-links: one dead body link
w("Ghosty.md", entry("Ghosty", body="Ghosty points at [[Nowhere]]."))
# --- entry-naming: a miscased bundle folder (E1) and a title that isn't the filename (W1)
w("Miscased.md", entry("Miscased"))
w("miscased/inner.md", "A bundle file in a folder whose case is wrong.\n")
w("Titled.md", entry("Wrong Title"))
# --- link-directions: an asymmetric link both ways (E1)
w("RecipA.md", entry("RecipA", links=[("RecipB", "deepens")]))
w("RecipB.md", entry("RecipB", links=[("RecipA", "deepens")]))
# --- the real map builder, so the direction linter can rebuild this palace's map
os.makedirs(os.path.join(ROOT, "_ops", "swarm"))
os.makedirs(os.path.join(ROOT, "_ops", "maps"))
dated = sorted(glob.glob(os.path.join(SWARM, "build-map-2*.py")))[-1]
for f in ("build-map.py", "entry-use.py", os.path.basename(dated)):
    shutil.copy(os.path.join(SWARM, f), os.path.join(ROOT, "_ops", "swarm", f))
git("init", "-q")
git("add", "-A")
git("commit", "-q", "-m", "fixture")

def run(tool, *args):
    r = subprocess.run([sys.executable, os.path.join(SWARM, tool), *args],
                       capture_output=True, text=True)
    return r.stdout + r.stderr, r.returncode

fails = []
def check(name, cond, detail=""):
    print(("  PASS" if cond else "  FAIL"), name, detail if not cond else "")
    if not cond:
        fails.append(name)

print("== lint-doc-drift --paths ==")
out, rc = run("lint-doc-drift.py", ROOT, "--paths", "Drifty.md")
check("bad file: exit 1 (E3 gates)", rc == 1, f"\n{out}")
check("bad file: flags the wrong-case ref", "E3  wrong-case ref in Drifty.md" in out, f"\n{out}")
check("bad file: flags the broken path", "W0  broken path ref in Drifty.md" in out, f"\n{out}")
check("bad file: leaves the unnamed ceremony's trigger gap out", "dance" not in out, f"\n{out}")
out, rc = run("lint-doc-drift.py", ROOT, "--paths", "Clean.md")
check("clean file: exit 0, nothing found", rc == 0 and "0 errors, 0 warnings" in out, f"\n{out}")
out, rc = run("lint-doc-drift.py", ROOT, "--paths", "CHILD.md")
check("naming the trigger table surfaces its gap", 'W2  trigger not in CHILD.md table:  "dance"' in out, f"\n{out}")
out, rc = run("lint-doc-drift.py", ROOT)
check("whole run still sees every finding",
      rc == 1 and "Drifty.md" in out and '"dance"' in out, f"\n{out}")

print("== lint-ghost-links --paths ==")
out, rc = run("lint-ghost-links.py", ROOT, "--paths", "Ghosty.md")
check("bad file: flags [[Nowhere]]", "ghost link in Ghosty.md:" in out and "0 errors, 1 warnings" in out, f"\n{out}")
out, rc = run("lint-ghost-links.py", ROOT, "--paths", "Clean.md")
check("clean file: nothing found", "0 errors, 0 warnings" in out and "Nowhere" not in out, f"\n{out}")
out, rc = run("lint-ghost-links.py", ROOT, "--paths", os.path.join(ROOT, "Ghosty.md") + ",./Clean.md")
check("absolute and ./ paths normalize", "0 errors, 1 warnings" in out and "scoped to 2" in out, f"\n{out}")
out, rc = run("lint-ghost-links.py", ROOT, "--paths", "Nope.md")
check("a named path that isn't there is said so", "not found under root: Nope.md" in out, f"\n{out}")

print("== lint-entry-naming --paths ==")
out, rc = run("lint-entry-naming.py", ROOT, "--paths", "Miscased.md")
check("bad file: exit 1, flags the miscased folder", rc == 1 and "E1  bundle-folder miscase for Miscased.md" in out, f"\n{out}")
out, rc = run("lint-entry-naming.py", ROOT, "--paths", "miscased/inner.md")
check("a file deposited into the miscased folder catches it", rc == 1 and "E1  bundle-folder miscase for Miscased.md" in out, f"\n{out}")
out, rc = run("lint-entry-naming.py", ROOT, "--paths", "Titled.md")
check("bad title: W1, exit 0", rc == 0 and "W1  title != filename in Titled.md" in out and "0 errors, 1 warnings" in out, f"\n{out}")
out, rc = run("lint-entry-naming.py", ROOT, "--paths", "Clean.md")
check("clean file: exit 0, nothing found", rc == 0 and "0 errors, 0 warnings" in out, f"\n{out}")

print("== lint-link-directions --paths and the stale map ==")
r = subprocess.run([sys.executable, os.path.join(ROOT, "_ops", "swarm", "build-map.py")],
                   cwd=ROOT, capture_output=True, text=True)
maps = sorted(glob.glob(os.path.join(ROOT, "_ops", "maps", "palace-map-full-*.json")))
check("fixture map builds with nodes", r.returncode == 0 and maps and json.load(open(maps[-1]))["nodes"], r.stdout + r.stderr)
out, rc = run("lint-link-directions.py", "--root", ROOT, "--paths", "RecipA.md")
check("bad file: exit 1, flags the reciprocal deepens", rc == 1 and "E1  reciprocal deepens" in out, f"\n{out}")
out, rc = run("lint-link-directions.py", "--root", ROOT, "--paths", "Clean.md")
check("clean file on a current map: exit 0, no stale warning, no rebuild",
      rc == 0 and "ERRORS: none" in out and "STALE" not in out and "fresh build (" not in out, f"\n{out}")
out, rc = run("lint-link-directions.py", "--root", ROOT, "--paths", "Drifty.md")
check("a non-entry is named as having no typed links", "not a map node" in out and rc == 0, f"\n{out}")

# deposit a new entry after the map was built: a hub emitting member-of (E2)
w("NewHub.md", entry("NewHub", typ="hub", links=[("Clean", "member-of")]))
before = sorted(os.listdir(os.path.join(ROOT, "_ops", "maps")))
out, rc = run("lint-link-directions.py", "--root", ROOT, "--paths", "NewHub.md", "--no-rebuild")
check("stale map, --no-rebuild: warns and exits 2", rc == 2 and "STALE MAP" in out and "NewHub.md" in out
      and "could not check" in out, f"\n{out}")
out, rc = run("lint-link-directions.py", "--root", ROOT, "--paths", "NewHub.md")
check("stale map, scoped: rebuilds and catches the new E2", rc == 1 and "fresh build (" in out
      and "E2  hub emits member-of:  NewHub" in out and "STALE" not in out, f"\n{out}")
check("the rebuild wrote nothing to _ops/maps", sorted(os.listdir(os.path.join(ROOT, "_ops", "maps"))) == before)
out, rc = run("lint-link-directions.py", "--root", ROOT)
check("whole run on the stale map: warns, findings unchanged (no NewHub)",
      rc == 1 and "STALE MAP" in out and "NewHub" in out.split("ERRORS")[0]
      and "E2" not in out and "fresh build (" not in out, f"\n{out}")
out, rc = run("lint-link-directions.py", "--root", ROOT, "--rebuild")
check("whole run with --rebuild sees the new entry", "fresh build (" in out and "E2  hub emits member-of:  NewHub" in out, f"\n{out}")

# a map with no recorded commit falls back to its build date
old = json.load(open(maps[-1]))
old["meta"].pop("use", None)
old["meta"]["generated"] = "2000-01-01"
oldp = os.path.join(ROOT, "old-map.json")
json.dump(old, open(oldp, "w"))
out, rc = run("lint-link-directions.py", oldp, "--root", ROOT, "--paths", "Clean.md", "--no-rebuild")
check("an old map with no commit is stale by date", rc == 2 and "STALE MAP: built 2000-01-01" in out, f"\n{out}")

print()
if fails:
    print(f"FAILED: {len(fails)} -> {fails}")
    print(f"(fixture left at {ROOT} for inspection)")
    sys.exit(1)
print("ALL PASS")
shutil.rmtree(ROOT)
