#!/usr/bin/env python3
"""Phase 1 gate — the board bridge (Python speaks validated §9).

Proves: owner-tree resolution (multi-worktree spine); a valid message round-trips
through the CANONICAL validator + appender; a §9-invalid message is REJECTED (not
silently written); and infra failure (bad core) surfaces as an error, never as
silent success. All writes go to a TEMP board — the real persistent board is never
touched. Exit 0 = pass.
"""
import os, sys, tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))   # put _ops on sys.path
from commons import board   # noqa: E402

checks = []


def check(desc, cond):
    checks.append((desc, cond))
    print(("  PASS " if cond else "  FAIL ") + desc)


def main():
    # ── owner-tree resolution (the multi-worktree spine) ──
    root = board.owner_root()
    check(f"owner_root resolves to a real dir ({root.name!r})", root.is_dir())
    check("owner core has the canonical validator", (board.core_dir() / "schema" / "posting.js").exists())
    default_board = board.board_path()
    check("default board is the owner persistent blackboard",
          str(default_board).endswith("_ops/swarm/persistent/blackboard.jsonl"))
    check("owner board lives under owner_root (not this worktree)", str(default_board).startswith(str(root)))

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td) / "blackboard.jsonl"

        # ── valid message round-trips ──
        msg = board.make_message("BROADCAST", "GENERAL", {"kind": "commons_selftest", "headline": "hello"})
        res = board.post(msg, silent=False, board_file=tmp)
        check("valid BROADCAST posts ok", res.get("ok") is True)
        back = board.read(board_file=tmp)
        check("posted message reads back by id", any(m.get("id") == msg["id"] for m in back))

        # ── §9-invalid message is rejected, not written ──
        bad = board.make_message("RESOURCE_REQUEST", "TRICKSTER", {"resource": "x"}, to="TRICKSTER")
        vres = board.validate(bad)
        check("RESOURCE_REQUEST w/o request_id is REJECTED by validator",
              vres.get("ok") is False and any("request_id" in e.get("path", "") for e in vres.get("errors", [])))
        raised = False
        try:
            board.post(bad, silent=False, board_file=tmp)
        except board.ValidationError:
            raised = True
        check("post(silent=False) RAISES on an invalid message", raised)
        check("the invalid message was NOT written (only the 1 good one)", len(board.read(board_file=tmp)) == 1)

        # ── a valid RESOURCE_REQUEST WITH request_id passes ──
        good_rr = board.make_message("RESOURCE_REQUEST", "TRICKSTER", {"resource": "gpu_account"},
                                     to="TRICKSTER", request_id="req-selftest-1")
        check("RESOURCE_REQUEST with request_id validates", board.validate(good_rr).get("ok") is True)

        # ── payload cap keeps writes atomic ──
        big = board.make_message("BROADCAST", "GENERAL", {"blob": "x" * 3000})
        bigres = board.validate(big)
        check("oversized payload is rejected by the atomic-append cap",
              bigres.get("ok") is False and any("payload" in e.get("path", "") for e in bigres.get("errors", [])))

    # ── health.model says who wrote the line (SCHEMA §9: never a tool name) ──
    saved = os.environ.pop("COMMONS_MODEL", None)
    try:
        human = board.make_message("BROADCAST", "WEAVE", {"kind": "weave_flag"}, from_="TRICKSTER")
        check("a TRICKSTER line carries loudon-trickster", human["health"]["model"] == "loudon-trickster")
        check("the human line validates", board.validate(human).get("ok") is True)
        agent = board.make_message("BROADCAST", "WEAVE", {"kind": "weave_flag"}, from_="Deposit Ceremony")
        check(f"an agent line names a Claude model ({agent['health']['model']!r})",
              agent["health"]["model"].startswith("claude-") and agent["health"]["model"] != board.STUB_DISPATCH)
        check("the agent line validates", board.validate(agent).get("ok") is True)
        os.environ["COMMONS_MODEL"] = "claude-sonnet-5-5"
        check("$COMMONS_MODEL names an agent's model",
              board.make_message("BROADCAST", "GENERAL", {}, from_="Weave Executor")["health"]["model"] == "claude-sonnet-5-5")
        check("$COMMONS_MODEL never relabels a TRICKSTER line",
              board.make_message("BROADCAST", "WEAVE", {}, from_="TRICKSTER")["health"]["model"] == "loudon-trickster")
        check("an explicit model wins",
              board.make_message("BROADCAST", "GENERAL", {}, model="claude-haiku-5-5")["health"]["model"] == "claude-haiku-5-5")
        check("no line stamps the tool name as its model",
              all(board.make_message("BROADCAST", "GENERAL", {}, from_=f)["health"]["model"] != "claude-code"
                  for f in ("TRICKSTER", "RunPod GPU Backend")))
    finally:
        os.environ.pop("COMMONS_MODEL", None)
        if saved is not None:
            os.environ["COMMONS_MODEL"] = saved

    # ── infra failure surfaces, never silent success ──
    orig = board.core_dir
    board.core_dir = lambda: Path("/nonexistent/commons/core")
    try:
        raised = False
        try:
            board.post(board.make_message("BROADCAST", "GENERAL", {"k": 1}), silent=False, board_file=Path("/tmp/never.jsonl"))
        except board.BridgeError:
            raised = True
        check("infra failure (bad core) RAISES under silent=False", raised)
        sres = board.post(board.make_message("BROADCAST", "GENERAL", {"k": 1}), silent=True, board_file=Path("/tmp/never.jsonl"))
        check("infra failure is swallowed under silent=True (best-effort)", sres.get("ok") is False)
    finally:
        board.core_dir = orig

    ok = all(c for _, c in checks)
    print(f"\n{'ALL PASS' if ok else 'FAILURES PRESENT'} — {sum(c for _, c in checks)}/{len(checks)} checks")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
