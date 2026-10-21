// suite.test.mjs — a batch never strands Loudon: it stops short of the plan's limits and carries on where it stopped.
//
// Loudon, 2026-10-21: "just make sure we don't get stranded due to session limits." The plan's windows are shared with
// his own sessions, so these check, against the fake claude and for $0, that a batch reads the usage before every
// birth, stops before the five-hour window reaches the line, holds back only a model whose own week is spent, steps
// aside when the plan refuses a child, and never runs a kept birth twice.
//
// Run:  node --test _ops/self-description-test/tests/*.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseUsage } from "../suite.mjs";
import { FAKE, node, scratch } from "./scratch.mjs";

const OPUS = "claude-opus-5-5", FABLE = "claude-fable-5-1";
const suite = (s, args, env = {}) => node("suite.mjs", ["--batch", "stage-1", "--scenarios", "D1", "--bin", FAKE,
  "--in", s.repo, "--runs-dir", s.runs, ...args], { ...s.env, ...env });
const births = (s) => s.calls().filter((c) => !["/context", "/usage"].includes(c.argv[1]));

test("/usage is read the way 2.1.280 prints it", () => {
  const u = parseUsage("Current session: 63% used · resets Oct 21 at 12:29pm (America/New_York)\n" +
    "Current week (all models): 33% used · resets Oct 27 at 12:59pm (America/New_York)\nCurrent week (Fable): 41% used · resets Oct 27");
  assert.deepEqual(u.session, { used: 0.63, resets: "Oct 21 at 12:29pm (America/New_York)" });
  assert.equal(u.weeks["all models"].used, 0.33);
  assert.equal(u.weeks.fable.used, 0.41);
  assert.equal(parseUsage("no usage here"), null);
});

test("a batch runs every planned birth once, and a second run finds nothing left", () => {
  const s = scratch();
  try {
    const r = suite(s, ["--models", `${OPUS},${FABLE}`]);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.equal(births(s).length, 2);
    assert.equal(s.kept().length, 2);
    assert.equal(s.calls().filter((c) => c.argv[1] === "/usage").length, 2, "usage is read before every birth");
    const again = suite(s, ["--models", `${OPUS},${FABLE}`]);
    assert.equal(again.status, 0);
    assert.match(again.stdout, /2 kept already, 0 to run/);
    assert.equal(births(s).length, 2, "no kept birth runs twice");
  } finally { s.done(); }
});

test("it stops before a birth when the five-hour window is past the line, and spends nothing", () => {
  const s = scratch();
  try {
    const r = suite(s, [], { FAKE_SESSION_USED: "63" });
    assert.equal(r.status, 4);
    assert.match(r.stdout, /STOPPED before birth 1 of 1: the five-hour window is at 63% \(stop at 50%\), resets Oct 21 at 12:29pm/);
    assert.equal(births(s).length, 0);
    assert.equal(suite(s, ["--stop-at", "0.7"], { FAKE_SESSION_USED: "63" }).status, 0, "a higher line, on Loudon's say, lets it run");
  } finally { s.done(); }
});

test("a birth that reports the window past the line stops the batch after it, and the rest resumes later", () => {
  const s = scratch();
  try {
    const r = suite(s, ["--reps", "3"], { FAKE_UTIL: "0.55" });
    assert.equal(r.status, 4, r.stdout + r.stderr);
    assert.equal(s.kept().length, 1, "one birth ran; its own stream said the window had reached the line");
    assert.match(r.stdout, /2 left\. Run the same command after the reset/);
    const later = suite(s, ["--reps", "3"]);
    assert.equal(later.status, 0, later.stdout);
    assert.equal(s.kept().length, 3);
  } finally { s.done(); }
});

test("a spent Fable week holds back only the Fable births", () => {
  const s = scratch();
  try {
    const r = suite(s, ["--models", `${OPUS},${FABLE}`], { FAKE_FABLE_WEEK_USED: "85" });
    assert.equal(r.status, 4);
    assert.match(r.stdout, /held {4}D1 on claude-fable-5-1 \(rep 1\): the fable week is at 85%/);
    assert.deepEqual(births(s).map((c) => c.argv[c.argv.indexOf("--model") + 1]), [OPUS]);
  } finally { s.done(); }
});

test("when the plan refuses the child, the birth steps aside unnumbered and the batch stops", () => {
  const s = scratch();
  try {
    const r = suite(s, [], { FAKE_LIMIT: "1" });
    assert.equal(r.status, 4, r.stdout + r.stderr);
    assert.match(r.stderr, /LIMIT: the plan refused the child \(five_hour/);
    assert.equal(s.kept().length, 0, "no birth number used");
  } finally { s.done(); }
});

test("--dry-run reads the usage, lists what's left, and plays nothing", () => {
  const s = scratch();
  try {
    const r = suite(s, ["--models", `${OPUS},${FABLE}`, "--dry-run"]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /would start with D1 on claude-opus-5-5/);
    assert.match(r.stdout, /todo {2}D1 · claude-fable-5-1 · rep 1/);
    assert.equal(births(s).length, 0);
  } finally { s.done(); }
});
