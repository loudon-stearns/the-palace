// floor.test.mjs — the floor measurement and its due line, tested for $0 with the fake claude in a scratch checkout.
//
// What has to hold: floor.mjs writes the floor in load order, named as the palace names it, and adds a dated line only
// when the numbers move; due.mjs says "floor measurement owed" when a floor file changed since the measured commit,
// and says nothing about the floor when no floor file changed.
//
// Run:  node --test _ops/self-description-test/tests/*.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { FAKE, node, sh, scratch } from "./scratch.mjs";
import { BORN_WITH } from "../scenarios.mjs";
import { tokens } from "../floor.mjs";

test("Claude Code's shown counts read as tokens", () => {
  assert.deepEqual(["658", "1.1k", "2k", "~390", "n/a"].map(tokens), [658, 1100, 2000, 390, null]);
});

test("floor.mjs writes the floor in load order, and a dated line only when it moved", () => {
  const s = scratch();
  try {
    const out = path.join(s.root, "floor", "floor.json"), history = path.join(s.root, "floor", "history.jsonl");
    const floor = (env = {}) => node("floor.mjs", ["--repo", s.repo, "--bin", FAKE, "--out", out], { ...s.env, ...env });
    let r = floor();
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const m = JSON.parse(fs.readFileSync(out, "utf8"));
    assert.deepEqual(m.files.map((f) => f.loaded_as).sort(), [...BORN_WITH].sort());
    assert.deepEqual(m.files.map((f) => f.order), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.equal(m.files[5].loaded_as, "Modes_of_Collaboration.md", "kept in the order the probe listed, which is CLAUDE.md's");
    assert.equal(m.files[2].file, "FOUR PILLARS.md", "a World symlink is named by the file it points at");
    assert.deepEqual(m.files.map((f) => f.kind).slice(0, 3), ["birth", "jewel", "world"]);
    assert.equal(m.total, 800);
    assert.equal(m.before_jewel, 100);
    assert.equal(m.commit, sh("git", ["rev-parse", "HEAD"], s.repo).trim());
    assert.equal(m.cost_usd, 0);
    assert.equal(fs.readFileSync(history, "utf8").trim().split("\n").length, 1);

    r = floor();
    assert.match(r.stdout, /unchanged since/);
    assert.equal(fs.readFileSync(history, "utf8").trim().split("\n").length, 1, "the same numbers add no line");

    r = floor({ FAKE_AUTOMEM: "1" });
    const last = JSON.parse(fs.readFileSync(out, "utf8")).files.pop();
    assert.deepEqual([last.file, last.kind, last.type], ["MEMORY.md", "operator memory", "AutoMem"]);
    assert.equal(fs.readFileSync(history, "utf8").trim().split("\n").length, 2, "operator memory moved the floor");
  } finally { s.done(); }
});

test("due says the floor measurement is owed when a floor file changed, and is quiet when none did", () => {
  const s = scratch();
  try {
    const g = (...a) => sh("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...a], s.repo);
    const floorFile = path.join(s.root, "floor.json");
    const measuredAt = (commit, dirty = []) => fs.writeFileSync(floorFile, JSON.stringify({ date: "2026-10-25", commit, dirty, total: 800 }));
    // --session with no births kept: no scenario was ever born, so only the floor can owe anything here.
    const due = (...a) => node("due.mjs", ["--repo", s.repo, "--runs-dir", s.runs, "--floor", floorFile, "--since", "main", ...a]);
    const before = g("rev-parse", "HEAD").trim();
    g("checkout", "-qb", "work");

    let r = due("--session");
    assert.equal(r.status, 0, "no floor.json and no change: nothing to say");
    measuredAt(before);
    fs.writeFileSync(path.join(s.repo, "notes.md"), "not the floor\n");
    g("add", "notes.md"); g("commit", "-qm", "a page that isn't the floor");
    r = due("--session");
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.doesNotMatch(r.stdout, /floor/, "a change off the floor says nothing about the floor");

    fs.appendFileSync(path.join(s.repo, "CLAUDE.md"), "a change\n");
    g("commit", "-qam", "change CLAUDE.md");
    const after = g("rev-parse", "HEAD").trim();
    r = due("--session");
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stdout, /^floor +CLAUDE\.md · last measured 2026-10-25 @ \w{8} · floor measurement owed$/m);
    assert.match(r.stdout, /run: node _ops\/self-description-test\/floor\.mjs/);
    assert.equal(JSON.parse(due("--session", "--json").stdout).floor_owed, true);

    measuredAt(after);
    r = due("--session");
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /measured since ✓/);

    measuredAt(after, ["CLAUDE.md"]);
    assert.equal(due("--session").status, 2, "a measurement taken over uncommitted text doesn't count for that file");
    measuredAt(after);
    fs.appendFileSync(path.join(s.repo, "JEWEL.md"), "uncommitted\n");
    assert.equal(due("--session").status, 2, "a change not yet committed is owed");

    fs.rmSync(floorFile);
    assert.match(due("--session").stdout, /^(?![\s\S]*^floor)/m, "never measured is the palace's debt, not a session's");
    assert.match(due().stdout, /^floor .* never measured · floor measurement owed$/m);
  } finally { s.done(); }
});
