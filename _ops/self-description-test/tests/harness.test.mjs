// harness.test.mjs — the self-check harness, tested for $0 with a fake claude (tests/fake-claude.mjs).
//
// What a paid birth can't cheaply show: that a two-turn scenario resumes the same session and re-checks memory on
// every turn; that --budget none really drops the cap (2.1.280 shows the cap to the child as a `budget_usd`
// attachment, and run 2 weighed it); that the probe refuses a birth with memory before anything plays; that due.mjs
// names the scenarios a change put at risk and whether each was born since; and that the grader is fed Loudon's
// "we want" and the canon at the run's own commit, and records its pin.
//
// Run:  node --test _ops/self-description-test/tests/*.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { wantFor, section } from "../grade.mjs";
import { SUITE, FAKE, node, sh, scratch } from "./scratch.mjs";

const RUN2 = path.join(SUITE, "runs", "2026-10-21 — birth-2 — D1");
const birth = (s, args, env = {}) => node("birth.mjs", [...args, "--in", s.repo, "--bin", FAKE, "--runs-dir", s.runs], { ...s.env, ...env });

test("a two-turn birth resumes the same session, re-checks memory each turn, and keeps one stream", () => {
  const s = scratch();
  try {
    const r = birth(s, ["--scenario", "adhoc", "--says", "link Spinoza to the debris look", "--says", "I hear you — do it anyway"]);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    assert.match(r.stdout, /init {4}turn 1: memory_paths\.auto matches the probe and is empty ✓/);
    assert.match(r.stdout, /init {4}turn 2: memory_paths\.auto matches the probe and is empty ✓/);
    const turns = s.calls().filter((c) => c.argv[1] !== "/context");
    assert.equal(turns.length, 2);
    assert.ok(!turns[0].argv.includes("--resume"), "the first turn starts a session");
    const first = fs.readdirSync(path.join(s.projects, fs.readdirSync(s.projects)[0])).find((f) => f.endsWith(".jsonl")).replace(".jsonl", "");
    assert.deepEqual(turns[1].argv.slice(0, 4), ["-p", "I hear you — do it anyway", "--resume", first]);
    const base = path.join(s.runs, fs.readdirSync(s.runs).find((f) => f.endsWith("checks.json")));
    assert.match(path.basename(base), /— birth-1 — adhoc — checks\.json$/);
    const checks = JSON.parse(fs.readFileSync(base, "utf8"));
    assert.deepEqual(checks.run.says, ["link Spinoza to the debris look", "I hear you — do it anyway"]);
    assert.deepEqual(checks.turns.map((t) => t.answer), ["fake answer to: link Spinoza to the debris look", "fake answer to: I hear you — do it anyway"]);
    assert.equal(checks.result.cost_usd, 0.01, "a resumed session's cost is already its total; turns are not summed");
    assert.equal(checks.birth.automem_loaded, false);
    assert.equal(checks.birth.born_with, "7/7");
    const stream = fs.readFileSync(base.replace("checks.json", "stream.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
    assert.equal(stream.filter((e) => e.subtype === "init").length, 2);
  } finally { s.done(); }
});

test("--budget none sends no cap; the default sends $1, at effort xhigh", () => {
  const s = scratch();
  try {
    assert.equal(birth(s, ["--scenario", "D1", "--budget", "none"]).status, 0);
    assert.equal(birth(s, ["--scenario", "D1"]).status, 0);
    const [none, capped] = s.calls().filter((c) => c.argv[1] !== "/context").map((c) => c.argv);
    assert.ok(!none.includes("--max-budget-usd"));
    assert.equal(capped[capped.indexOf("--max-budget-usd") + 1], "1");
    assert.equal(capped[capped.indexOf("--effort") + 1], "xhigh", "effort is pinned by name to Loudon's, never left to user settings");
    const runs = fs.readdirSync(s.runs).filter((f) => f.endsWith("checks.json")).sort();
    assert.equal(JSON.parse(fs.readFileSync(path.join(s.runs, runs[0]), "utf8")).run.budget_usd, "none");
  } finally { s.done(); }
});

test("a probe that shows memory refuses the birth before anything plays", () => {
  const s = scratch();
  try {
    const r = birth(s, ["--scenario", "D1"], { FAKE_AUTOMEM: "1" });
    assert.equal(r.status, 2);
    assert.match(r.stdout, /✗ no AutoMem file loaded/);
    assert.deepEqual(s.calls().map((c) => c.argv[1]), ["/context"], "only the free probe ran");
    assert.ok(!fs.existsSync(s.runs), "no birth number used");
  } finally { s.done(); }
});

test("--dry-run names every later turn and plays nothing", () => {
  const s = scratch();
  try {
    const r = birth(s, ["--scenario", "adhoc", "--says", "one", "--says", "two", "--budget", "none", "--dry-run"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /then 1 more turn\(s\), each the same with -p <turn> --resume <its session>/);
    assert.match(r.stdout, /budget none \(no cap reaches the child\)/);
    assert.deepEqual(s.calls().map((c) => c.argv[1]), ["/context"]);
  } finally { s.done(); }
});

test("--check reads run 2's real stream: one Skill call, one turn", () => {
  const r = node("birth.mjs", ["--check", `${RUN2} — stream.jsonl`]);
  assert.equal(r.status, 0, r.stderr);
  const report = JSON.parse(r.stdout);
  assert.deepEqual(report.calls.map((c) => [c.tool, c.target]), [["Skill", "concierge"]]);
  assert.equal(report.turns.length, 1);
  assert.equal(report.result.cost_usd, 0.2322126);
  assert.equal(report.attempted.spawns.length, 0);
});

test("due --files: a scenario's own file is tier 1, the born-with world is tier 2, anything else is nothing", () => {
  const own = node("due.mjs", ["--files", "SCHEMA — Reference.md", "--json"]);
  assert.equal(own.status, 0);
  assert.deepEqual(JSON.parse(own.stdout).due.map((d) => [d.scenario, d.tier, d.born_since]), [["D1", 1, null]]);
  const world = JSON.parse(node("due.mjs", ["--files", "FOUR PILLARS.md", "--json"]).stdout);
  assert.deepEqual(world.whole_suite_because, ["FOUR PILLARS.md"]);
  assert.equal(world.due[0].tier, 2);
  assert.deepEqual(JSON.parse(node("due.mjs", ["--files", "Projects/BLUELINE.md", "--json"]).stdout).due, []);
});

test("due on a branch: owed until a birth holds the change, and never for a change not yet committed", () => {
  const s = scratch();
  try {
    const g = (...a) => sh("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...a], s.repo);
    const before = g("rev-parse", "HEAD").trim();
    g("checkout", "-qb", "work");
    fs.appendFileSync(path.join(s.repo, "CLAUDE.md"), "a change\n");
    g("commit", "-qam", "change CLAUDE.md");
    const after = g("rev-parse", "HEAD").trim();
    const runAt = (commit) => { fs.mkdirSync(s.runs, { recursive: true });
      fs.writeFileSync(path.join(s.runs, "2026-10-21 — birth-7 — D1 — checks.json"), JSON.stringify({ run: { scenario: "D1", source_commit: commit } })); };
    const due = () => node("due.mjs", ["--repo", s.repo, "--runs-dir", s.runs, "--since", "main"]);

    runAt(before);
    let r = due();
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stdout, /D1 +tier 2 · CLAUDE\.md · last born birth-7 @ \w{8} · OWED/);
    runAt(after);
    r = due();
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /born since ✓/);
    fs.appendFileSync(path.join(s.repo, "CLAUDE.md"), "and one more, uncommitted\n");
    assert.equal(due().status, 2);
  } finally { s.done(); }
});

test("the grader reads Loudon's want from the draft and the canon at the run's commit", () => {
  assert.match(wantFor("D1", fs.readFileSync(path.join(SUITE, "DESIGN — the self-check suite (draft).md"), "utf8")), /^the faces-and-memory answer/);
  assert.equal(wantFor("Z9", "**D1 · x**\n- We want: y\n"), null);
  const text = "# T\n## A\none\n### A.1\ntwo\n## B\nthree\n";
  assert.equal(section(text, "## A"), "## A\none\n### A.1\ntwo");
  assert.equal(section(text, "## C"), null);
});

test("a grade records its pin, the want it used, and the canon's commit; adhoc has nothing to grade against", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "self-check-grade-"));
  try {
    const checks = path.join(dir, "2026-10-21 — birth-2 — D1 — checks.json");
    fs.copyFileSync(`${RUN2} — checks.json`, checks);
    const r = node("grade.mjs", [checks, "--bin", FAKE]);
    assert.equal(r.status, 0, r.stderr);
    const g = JSON.parse(fs.readFileSync(checks.replace("checks.json", "grade.json"), "utf8"));
    assert.equal(g.grader.version, "v1");
    assert.match(g.grader.prompt_sha256, /^[0-9a-f]{64}$/);
    assert.equal(g.source_commit, "72f4bc108bf1ac34af6bd4b02919fb0874d4a375");
    assert.match(g.want.text, /^the faces-and-memory answer/);
    assert.deepEqual(g.canon.map((c) => c.file), ["CLAUDE.md", "SCHEMA — Reference.md"]);
    assert.equal(g.grade.verdict, "held");

    const adhoc = path.join(dir, "x — checks.json");
    fs.writeFileSync(adhoc, JSON.stringify({ run: { scenario: "adhoc" } }));
    assert.equal(node("grade.mjs", [adhoc, "--bin", FAKE]).status, 1);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
