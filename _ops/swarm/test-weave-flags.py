#!/usr/bin/env python3
"""Sandbox test for lint-weave-flags.py. A flag closes only by a `Palace-Resolves:` trailer or a
`Declined flag` line, never because a commit body names it (the commit that posts a flag lists
it). A propagate flag names no source entry, so a touch never closes it; its pattern counts the
pages still to change, and a `Carried flag` line since `--since` marks this weave's part done.

Run:  python3 _ops/swarm/test-weave-flags.py"""
import json, os, shutil, subprocess, sys, tempfile

SWARM = os.path.dirname(os.path.abspath(__file__))  # this file lives in _ops/swarm/
ROOT = tempfile.mkdtemp(prefix="palace-weave-flags-")
LINT = os.path.join(ROOT, "_ops", "swarm", "lint-weave-flags.py")
BOARD = os.path.join(ROOT, "_ops", "swarm", "persistent", "blackboard.jsonl")


def w(rel, content):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)


def git(*args, date=None):
    env = dict(os.environ, GIT_AUTHOR_NAME="t", GIT_AUTHOR_EMAIL="t@t", GIT_COMMITTER_NAME="t", GIT_COMMITTER_EMAIL="t@t")
    if date:
        env["GIT_AUTHOR_DATE"] = env["GIT_COMMITTER_DATE"] = date
    subprocess.run(["git", "-C", ROOT] + list(args), check=True, capture_output=True, env=env)


def commit(msg, date):
    git("add", "-A")
    git("commit", "--allow-empty", "-m", msg, date=date)


def flag(fid, ts, **payload):
    return json.dumps({"id": fid, "ts": ts, "from": "Closing Well", "type": "BROADCAST", "board": "WEAVE",
                       "payload": dict(kind="weave_flag", **payload)})


def lint(*args):
    r = subprocess.run([sys.executable, LINT] + list(args), capture_output=True, text=True)
    return r.returncode, r.stdout


os.makedirs(os.path.dirname(LINT))
shutil.copy(os.path.join(SWARM, "lint-weave-flags.py"), LINT)
git("init", "-q")
w("Alpha.md", "# Alpha\n")
w("Beta.md", "# Beta\n\nthe old word lives here\n")
w("Gamma.md", "# Gamma\n\nand the old word here\n")
w("Gamma/Gamma — tuning.md", "# Gamma — tuning\n\n1. the old word was retired\n")  # history keeps it
commit("start", "2026-10-01T10:00:00")

w(BOARD.replace(ROOT + "/", ""), "\n".join([
    flag("f-posted", "2026-10-02T10:00:00", flag_type="backlink_audit", source_entries=["Zeta"],
         target_entry="Zeta", proposed_action="add a link"),
    flag("f-resolved", "2026-10-02T10:00:00", flag_type="backlink_audit", source_entries=["Zeta"],
         target_entry="Zeta", proposed_action="add a link"),
    flag("f-declined", "2026-10-02T10:00:00", flag_type="backlink_audit", source_entries=["Zeta"],
         target_entry="Zeta", proposed_action="add a link"),
    flag("p-spread", "2026-10-02T10:00:00", flag_type="propagate", source_entries=[], target_entry="Alpha",
         decision="the old word is retired", scope="every page", check="does the page still say the old word?",
         pattern="old word", proposed_action="say the new word"),
    flag("p-declined", "2026-10-02T10:00:00", flag_type="propagate", source_entries=[], target_entry="Alpha",
         decision="another decision", scope="every page", check="a reader's question", proposed_action="do it"),
]) + "\n")
commit("ops(board): post four flags\n\n- f-posted, f-resolved, f-declined, p-spread", "2026-10-02T11:00:00")
commit("fix\n\nPalace-Resolves: f-resolved", "2026-10-03T10:00:00")
commit("weave\n\nDeclined flag f-declined: no longer true\nDeclined flag p-declined: a weave may not", "2026-10-03T11:00:00")
w("Alpha.md", "# Alpha\n\nthe home of the decision, touched\n")
commit("touch the decision's home", "2026-10-04T10:00:00")

try:
    fails = []
    code, out = lint("--board", BOARD)
    if code != 1:
        fails.append(f"open flags must fail: exit {code}")
    if "2 resolved explicitly" not in out:
        fails.append("only the trailer and the decline line resolve:\n" + out)
    if "● f-posted" not in out:
        fails.append("the posting commit named f-posted and must not close it")
    if "● p-spread" not in out or "2 page(s) still match" not in out:
        fails.append("a propagate flag is open, unclosed by the touch to its home, with two pages left "
                     "(the tuning ledger keeps the old word and is not counted):\n" + out)
    if "● p-declined" not in out:
        fails.append("a decline line never closes a propagate flag")

    w("Beta.md", "# Beta\n\nthe new word\n")
    commit("weave\n\nCarried flag p-spread: Beta done, Gamma left", "2026-10-21T10:00:00")
    code, out = lint("--board", BOARD, "--since", "2026-10-21")
    if "1 carried this weave" not in out or "1 page(s) still match: Gamma.md" not in out:
        fails.append("a Carried line since --since marks the propagate flag carried:\n" + out)
    code, out = lint("--board", BOARD)
    if "0 carried this weave" not in out:
        fails.append("without --since, a Carried line is ignored")

    w("Gamma.md", "# Gamma\n\nthe new word\n")
    commit("weave\n\nPalace-Resolves: p-spread\nPalace-Resolves: p-declined", "2026-10-21T11:00:00")
    w(BOARD.replace(ROOT + "/", ""), open(BOARD, encoding="utf-8").read().replace(
        flag("f-posted", "2026-10-02T10:00:00", flag_type="backlink_audit", source_entries=["Zeta"],
             target_entry="Zeta", proposed_action="add a link") + "\n", ""))
    commit("drop the posted flag from the sandbox board", "2026-10-21T12:00:00")
    code, out = lint("--board", BOARD, "--since", "2026-10-21")
    if code != 0:
        fails.append(f"every flag resolved must pass: exit {code}\n{out}")

    if fails:
        print("FAIL\n  " + "\n  ".join(fails))
        sys.exit(1)
    print("ok — weave flags close by trailer or decline only; a propagate flag counts its pages and carries")
finally:
    shutil.rmtree(ROOT, ignore_errors=True)
