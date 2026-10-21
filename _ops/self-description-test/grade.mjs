#!/usr/bin/env node
// grade.mjs — the judgment grader: a separate, pinned model reads one birth and grades it against Loudon's "we want".
//
// Judgment (◇) is never scored by whoever wrote the scenario (No Mind Checks Itself). The grader is a headless
// `claude -p` that is not born into the palace: an empty folder, no tools, its own system prompt, nothing from the
// session that runs it. It sees only:
//   WANT   — the scenario's "We want" line, read now from the DESIGN draft, where Loudon corrects it;
//   CANON  — the scenario's passages (scenarios.mjs `canon`), read at the commit the child was born on;
//   what the child was asked, the tool calls it made, and its answer — from the run's checks.json.
// The model, effort and prompt are pinned together (GRADER, and "grader — v1.md", whose sha256 each grade records).
//
//   node _ops/self-description-test/grade.mjs "<runs/… — birth-N — ID — checks.json>" [--dry-run] [--bin <path>]
//
// Writes "… — grade.json" beside the run. Exit: 0 graded · 1 error. --dry-run prints the grader's input; $0.

import { execFileSync, spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARIOS } from "./scenarios.mjs";
import { resolveBin } from "./claude-bin.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESIGN = path.join(HERE, "DESIGN — the self-check suite (draft).md");

// Change any of the three and grades made before are no longer comparable: that is a new version, never an edit.
const GRADER = { version: "v1", model: "claude-fable-5-1", effort: "high", prompt: path.join(HERE, "grader — v1.md") };
// When the child is the grader's own model, a second grade from another model rides along (Loudon, 2026-10-21). It
// is not the verdict, which stays the pinned grader's so every child is judged alike; a disagreement goes to Loudon.
// It is how a blind spot the grader shares with its own model would surface (No Mind Checks Itself).
const CROSS = { model: "claude-opus-5-5", effort: "high" };
const family = (m) => String(m).split("-")[1];

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
const die = (msg) => { console.error(`grade: ${msg}`); process.exit(1); };
const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

// The scenario's "We want" line in the DESIGN draft (its block opens "**<id> · <name>**"), plus any line its
// section carries for every scenario in it ("**Every D scenario also grades:** …"). Only those lines reach the
// grader: the notes around them say what earlier runs did, and the grader must not read the author's view.
export function wantFor(id, text) {
  const lines = text.split("\n");
  const at = lines.findIndex((l) => l.startsWith(`**${id} · `));
  if (at < 0) return null;
  let want = null;
  for (const l of lines.slice(at + 1)) {
    if (/^(\*\*|#)/.test(l)) break;
    const m = l.match(/^- We want: (.+)$/);
    if (m) { want = m[1].trim(); break; }
  }
  if (!want) return null;
  const section = lines.slice(0, at).findLastIndex((l) => l.startsWith("### "));
  const every = lines.slice(section + 1, at).map((l) => l.match(/^\*\*Every \w+ scenario also grades:\*\* (.+)$/)?.[1]).filter(Boolean);
  return [want, ...every.map((e) => `Also: ${e.trim()}`)].join(" ");
}

// A section by its heading line, down to the next heading of the same or a higher level.
export function section(text, heading) {
  const level = heading.match(/^#+/)[0].length;
  const lines = text.split("\n"), at = lines.findIndex((l) => l.trim() === heading);
  if (at < 0) return null;
  const end = lines.findIndex((l, i) => i > at && /^#+ /.test(l) && l.match(/^#+/)[0].length <= level);
  return lines.slice(at, end < 0 ? undefined : end).join("\n").trim();
}

function fill(template, slots) {
  const part = (name) => (template.split(`## ${name}\n`)[1] || "").split(/\n## /)[0].trim();
  const sub = (s) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => slots[k] ?? `{{${k}}}`);
  return { system: sub(part("System")), message: sub(part("Message")) };
}

function main() {
  const checksPath = path.resolve(argv.find((a) => a.endsWith("checks.json")) || die("give the run's checks.json"));
  const report = JSON.parse(fs.readFileSync(checksPath, "utf8"));
  const id = report.run?.scenario, commit = report.run?.source_commit;
  const sc = SCENARIOS[id] || die(`scenario ${id} has nothing to grade against (adhoc, or not in scenarios.mjs)`);
  const repo = git(["rev-parse", "--show-toplevel"], HERE).trim();

  const want = wantFor(id, fs.readFileSync(DESIGN, "utf8")) || die(`no "We want" line for ${id} in the DESIGN draft`);
  // A passage that moved between files names each of them, newest home first (CLAUDE.md's working sections moved
  // to CHILD.md on 2026-10-21); the first that holds the heading at the child's commit is its canon.
  const canon = sc.canon.map(({ file, heading }) => {
    for (const f of [].concat(file)) {
      let body; try { body = git(["show", `${commit}:${f}`], repo); } catch { continue; }
      const text = section(body, heading);
      if (text) return { file: f, heading, text };
    }
    return die(`${[].concat(file).join(" or ")} has no "${heading}" at ${commit.slice(0, 8)}`);
  });
  const says = [].concat(report.run.says);
  const turns = report.turns?.length ? report.turns : [{ answer: report.result.answer }];
  const template = fs.readFileSync(GRADER.prompt, "utf8");
  const { system, message } = fill(template, {
    ID: id, COMMIT: commit, WANT: want,
    SAYS: says.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    CANON: canon.map((c) => `--- ${c.file} ---\n${c.text}`).join("\n\n"),
    CALLS: report.calls.length ? report.calls.map((c, i) => `${i + 1}. ${c.tool}: ${c.target}${c.denied ? " (denied)" : ""}`).join("\n") : "(none)",
    ANSWER: turns.map((t, i) => `--- turn ${i + 1} ---\n${t.answer}`).join("\n\n"),
  });

  const { bin } = resolveBin(opt("--bin"));
  const cross = family(report.run.model) === family(GRADER.model) ? CROSS : null;
  if (argv.includes("--dry-run")) {
    console.log(`grader  ${GRADER.version} · ${GRADER.model} · effort ${GRADER.effort} · ${bin}`);
    if (cross) console.log(`cross   ${cross.model} · effort ${cross.effort}: the child is the grader's own model`);
    console.log(`want    ${want}`);
    console.log(`canon   ${canon.map((c) => `${c.file} ${c.heading} (${c.text.length} chars)`).join(" · ")} @ ${commit.slice(0, 8)}`);
    console.log(`\n===== system =====\n${system}\n\n===== message =====\n${message}\n`);
    console.log("dry-run: nothing spent, nothing written.");
    return 0;
  }

  const { grade, cost } = ask(bin, GRADER, system, message);
  const second = cross ? ask(bin, cross, system, message) : null;

  const record = {
    grader: { version: GRADER.version, model: GRADER.model, effort: GRADER.effort,
      prompt: path.basename(GRADER.prompt), prompt_sha256: crypto.createHash("sha256").update(template).digest("hex") },
    run: path.basename(checksPath), scenario: id, source_commit: commit,
    want: { text: want, from: `${path.basename(DESIGN)} @ ${git(["rev-parse", "HEAD"], repo).trim().slice(0, 8)}` },
    canon: canon.map(({ file, heading, text }) => ({ file, heading, chars: text.length })),
    grade, cost_usd: cost, graded_at: new Date().toISOString(),
    ...(second ? { cross_check: { model: cross.model, effort: cross.effort, grade: second.grade, cost_usd: second.cost,
      agrees: second.grade.verdict === grade.verdict } } : {}),
  };
  const dest = checksPath.replace(/checks\.json$/, "grade.json");
  fs.writeFileSync(dest, JSON.stringify(record, null, 2) + "\n");
  console.log(`graded  ${id}: ${grade.verdict} · ${grade.points?.length ?? 0} points · ${grade.beyond_canon?.length ?? 0} beyond canon · $${cost}`);
  if (second) console.log(second.grade.verdict === grade.verdict
    ? `cross   ${cross.model} agrees: ${second.grade.verdict} · $${second.cost}`
    : `cross   ${cross.model} DISAGREES: ${second.grade.verdict}, not ${grade.verdict} · $${second.cost} — for Loudon to read`);
  console.log(`kept    ${dest}`);
  console.log(`        Loudon reads every transcript a grader fails, and a sample of the ones it passes.`);
  return 0;
}

// One grade from one model. Not born into the palace: an empty folder, no tools, nothing from the session that runs it.
function ask(bin, { model, effort }, system, message) {
  const room = fs.mkdtempSync(path.join(os.tmpdir(), "palace-grader-"));
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC_)/.test(k)));
  let out;
  try {
    const r = spawnSync(bin, ["-p", message, "--model", model, "--effort", effort, "--system-prompt", system,
      "--tools", "", "--strict-mcp-config", "--no-session-persistence", "--output-format", "json"],
      { cwd: room, env, encoding: "utf8", timeout: 600000, maxBuffer: 64 << 20 });
    if (r.status !== 0 && !r.stdout) die(`the grader (${model}) exited ${r.status}: ${(r.stderr || "").slice(0, 600)}`);
    out = JSON.parse(r.stdout);
  } finally { fs.rmSync(room, { recursive: true, force: true }); }
  if (out.is_error) die(`the grader (${model}) failed: ${out.result}`);
  try { return { grade: JSON.parse(String(out.result).replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "")), cost: out.total_cost_usd }; }
  catch { die(`the grader (${model}) did not reply with JSON:\n${String(out.result).slice(0, 1200)}`); }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main();
