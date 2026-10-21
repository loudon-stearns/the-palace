#!/usr/bin/env node
// fake-claude.mjs — stands in for `claude` so the harness can be tested for $0, with no model and no login.
//
// It answers the four calls the harness makes, in the shapes Claude Code 2.1.280 emits:
//   -p /context          → an init event and a result whose text carries the "### Memory Files" table
//   -p /usage            → a result whose text is the plan's usage, as /usage prints it
//   -p <turn> [--resume] → an init, a rate_limit_event, one assistant message, a result; it files a transcript the
//                          way a session does
//   -p <prompt> --output-format json   (the grader) → one result object whose text is FAKE_GRADE, or a stock grade
// Every call appends its argv and cwd to $FAKE_CLAUDE_LOG, so a test can see exactly what the harness passed.
//
// Knobs (env): PALACE_BIRTH_PROJECTS (where sessions are filed), FAKE_AUTOMEM=1 (the probe reports an AutoMem file),
// FAKE_GRADE (the grader's reply text; FAKE_GRADE_<model with _ for -> for one model's), FAKE_SESSION_USED / FAKE_WEEK_USED / FAKE_FABLE_WEEK_USED (percent, for
// /usage), FAKE_UTIL (the five-hour utilization a turn reports, 0–1), FAKE_LIMIT=1 (the plan refuses the turn).

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const cwd = process.cwd();
const projects = process.env.PALACE_BIRTH_PROJECTS || path.join(os.homedir(), ".claude", "projects");
const projDir = path.join(projects, cwd.replace(/[^A-Za-z0-9]/g, "-"));
const memory = path.join(projDir, "memory") + "/";
const out = (o) => process.stdout.write(JSON.stringify(o) + "\n");
if (process.env.FAKE_CLAUDE_LOG) fs.appendFileSync(process.env.FAKE_CLAUDE_LOG, JSON.stringify({ argv, cwd }) + "\n");

const says = opt("-p");
const BORN_WITH = ["CLAUDE.md", "JEWEL.md", "FOUR_PILLARS.md", "Palace_Philosophies.md",
  "Cooperation_Yields_Agency.md", "Hilaritas_Generator.md", "Modes_of_Collaboration.md", "CHILD.md"];
const loaded = BORN_WITH.filter((f) => fs.existsSync(path.join(cwd, f))).map((f) => ({ type: "Project", path: path.join(cwd, f) }));
if (process.env.FAKE_AUTOMEM) loaded.push({ type: "AutoMem", path: path.join(memory, "MEMORY.md") });

if (says === "/usage") {
  const e = process.env;
  out({ type: "result", subtype: "success", is_error: false, total_cost_usd: 0, result: [
    "You are currently using your subscription to power your Claude Code usage", "",
    `Current session: ${e.FAKE_SESSION_USED ?? 10}% used · resets Oct 21 at 12:29pm (America/New_York)`,
    `Current week (all models): ${e.FAKE_WEEK_USED ?? 20}% used · resets Oct 27 at 12:59pm (America/New_York)`,
    `Current week (Fable): ${e.FAKE_FABLE_WEEK_USED ?? 20}% used · resets Oct 27 at 12:59pm (America/New_York)`].join("\n") });
} else if (opt("--output-format") === "json") {
  // The grader: one JSON object, no stream.
  const grade = process.env[`FAKE_GRADE_${String(opt("--model")).replace(/-/g, "_")}`] || process.env.FAKE_GRADE || JSON.stringify({ verdict: "held", points: [{ point: "faces and memory", verdict: "held", evidence: "The scroll is a face" }], beyond_canon: [], note: "fake" });
  out({ type: "result", subtype: "success", is_error: false, result: grade, total_cost_usd: 0.002, session_id: crypto.randomUUID() });
} else if (says === "/context") {
  const table = ["### Memory Files", "", "| Type | Path | Tokens |", "|---|---|---|", ...loaded.map((f) => `| ${f.type} | ${f.path} | 100 |`), ""].join("\n");
  out({ type: "system", subtype: "init", cwd, session_id: crypto.randomUUID(), memory_paths: { auto: memory }, claude_code_version: "fake", tools: [] });
  out({ type: "result", subtype: "success", is_error: false, result: `## Context Usage\n\n${table}\n### Skills\n`, total_cost_usd: 0 });
} else {
  const sid = opt("--resume") || crypto.randomUUID();
  out({ type: "system", subtype: "init", cwd, session_id: sid, memory_paths: { auto: memory }, claude_code_version: "fake", model: opt("--model"),
    permissionMode: opt("--permission-mode"), tools: ["Task", "Bash", "Read", "Write", "Skill"], skills: ["concierge"] });
  const resets = Math.floor(Date.now() / 1000) + 3600, util = Number(process.env.FAKE_UTIL ?? 0.2);
  out({ type: "rate_limit_event", session_id: sid, rate_limit_info: { status: process.env.FAKE_LIMIT ? "rejected" : "allowed",
    resetsAt: resets, rateLimitType: "five_hour", unifiedWindows: { five_hour: { utilization: util, resetsAt: resets },
      seven_day: { utilization: 0.2, resetsAt: resets + 86400 } } } });
  if (process.env.FAKE_LIMIT) {
    out({ type: "result", subtype: "error_during_execution", is_error: true, session_id: sid, total_cost_usd: 0, result: "You've hit your limit · resets 12:29pm" });
    process.exit(1);
  }
  out({ type: "assistant", session_id: sid, message: { id: crypto.randomUUID(), content: [{ type: "text", text: `fake answer to: ${says}` }] } });
  out({ type: "result", subtype: "success", is_error: false, stop_reason: "end_turn", num_turns: 1, session_id: sid,
    total_cost_usd: 0.01, duration_ms: 5, result: `fake answer to: ${says}` });
  fs.mkdirSync(projDir, { recursive: true });
  fs.appendFileSync(path.join(projDir, `${sid}.jsonl`), JSON.stringify({ type: "attachment", attachment: { type: "instructions", files: loaded } }) + "\n");
}
