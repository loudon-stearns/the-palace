#!/usr/bin/env node
// suite.mjs — a batch of births that never strands Loudon. It reads the plan's usage before every birth, for $0, stops
// well short of the limit, and carries on where it stopped when the same command is run again.
//
// The plan's five-hour and weekly windows are shared with Loudon's own sessions and with every other session on the
// account, so a batch that runs them dry strands his work, not only itself (Loudon, 2026-10-21: "just make sure we
// don't get stranded due to session limits"). Before each birth the runner asks `claude -p /usage`, which makes no
// model call. After each birth it also reads the usage that birth's own stream reported (checks.json `limits`). It
// stops when the five-hour window reaches --stop-at, or the all-models week reaches --stop-week. A model's own weekly
// window (Fable has one) past --stop-week holds back only that model's births; the rest of the batch goes on.
//
//   node _ops/self-description-test/suite.mjs --batch <name> --scenarios D1[,A1…] [--models claude-opus-5-5[,…]]
//        [--reps 1] [--effort medium] [--budget 1|none] [--stop-at 0.5] [--stop-week 0.8] [--bin <path>] [--dry-run]
//   (and birth.mjs's --ref, --full, --timeout, --births-dir, --runs-dir, --in, passed through)
//
// A birth already kept under runs/ with this batch name, scenario, model and rep is never run again.
// Exit: 0 the batch is done · 1 error · 4 stopped or held back for the plan's limits (run the same command after reset).

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARIOS } from "./scenarios.mjs";
import { resolveBin } from "./claude-bin.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
const flag = (k) => argv.includes(k);
const die = (msg) => { console.error(`suite: ${msg}`); process.exit(1); };
const pct = (x) => `${Math.round(x * 100)}%`;
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC_)/.test(k)));

// The plan's usage, read from `/usage` with no model call. Returns null if the text can't be read.
export function parseUsage(text) {
  const session = text.match(/Current session: (\d+)% used(?: · resets ([^\n]+))?/);
  if (!session) return null;
  const weeks = {};
  for (const m of text.matchAll(/Current week \(([^)]+)\): (\d+)% used(?: · resets ([^\n]+))?/g))
    weeks[m[1].toLowerCase()] = { used: +m[2] / 100, resets: m[3]?.trim() ?? null };
  return { session: { used: +session[1] / 100, resets: session[2]?.trim() ?? null }, weeks };
}

function readUsage(bin) {
  const room = fs.mkdtempSync(path.join(os.tmpdir(), "palace-usage-"));
  try {
    const r = spawnSync(bin, ["-p", "/usage", "--output-format", "stream-json", "--verbose", "--strict-mcp-config",
      "--permission-mode", "dontAsk", "--no-session-persistence", "--max-budget-usd", "0.01"],
      { cwd: room, env, input: "", encoding: "utf8", timeout: 120000 });
    const result = String(r.stdout || "").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } })
      .find((e) => e?.type === "result");
    return result ? parseUsage(String(result.result || "")) : null;
  } finally { fs.rmSync(room, { recursive: true, force: true }); }
}

// Why a birth on this model may not run now; `all` reasons stop the batch, a model's own week holds back that model.
function blockers(usage, model, stopAt, stopWeek) {
  const all = [], own = [];
  if (usage.session.used >= stopAt) all.push(`the five-hour window is at ${pct(usage.session.used)} (stop at ${pct(stopAt)}), resets ${usage.session.resets ?? "?"}`);
  for (const [label, w] of Object.entries(usage.weeks)) {
    if (w.used < stopWeek) continue;
    const line = `the ${label} week is at ${pct(w.used)} (stop at ${pct(stopWeek)}), resets ${w.resets ?? "?"}`;
    if (label === "all models") all.push(line);
    else if (model.toLowerCase().includes(label.split(/\s+/)[0])) own.push(line);
  }
  return { all, own };
}

// What a birth's own stream said about the plan (birth.mjs keeps it as `limits`), in /usage's shape.
const fromBirth = (limits) => (limits?.five_hour ? { session: { used: limits.five_hour.utilization, resets: limits.five_hour.resets_at },
  weeks: limits.seven_day ? { "all models": { used: limits.seven_day.utilization, resets: limits.seven_day.resets_at } } : {} } : null);
// The more cautious of two readings, window by window.
const worst = (a, b) => (!a ? b : !b ? a : { session: a.session.used >= b.session.used ? a.session : b.session,
  weeks: Object.fromEntries([...new Set([...Object.keys(a.weeks), ...Object.keys(b.weeks)])]
    .map((k) => [k, (a.weeks[k]?.used ?? -1) >= (b.weeks[k]?.used ?? -1) ? a.weeks[k] : b.weeks[k]])) });

function kept(runsDir, batch) {
  const done = new Map();
  for (const f of fs.existsSync(runsDir) ? fs.readdirSync(runsDir) : []) {
    if (!f.endsWith("— checks.json")) continue;
    let r; try { r = JSON.parse(fs.readFileSync(path.join(runsDir, f), "utf8")); } catch { continue; }
    if (r.run?.batch === batch) done.set(`${r.run.scenario}|${r.run.model}|${r.run.rep}`, { file: f, limits: r.limits, cost: r.result?.cost_usd ?? 0 });
  }
  return done;
}

function main() {
  const batch = opt("--batch") || die("--batch <name> is required: it is how a stopped batch carries on");
  const scenarios = (opt("--scenarios") || die("--scenarios <id,…> is required")).split(",").map((s) => s.trim()).filter(Boolean);
  for (const s of scenarios) if (!SCENARIOS[s]) die(`no scenario ${s} (have: ${Object.keys(SCENARIOS).join(", ")})`);
  const models = opt("--models", "claude-opus-5-5").split(",").map((s) => s.trim()).filter(Boolean);
  const reps = Number(opt("--reps", "1")), stopAt = Number(opt("--stop-at", "0.5")), stopWeek = Number(opt("--stop-week", "0.8"));
  const { bin, from: binFrom } = resolveBin(opt("--bin")), runsDir = path.resolve(opt("--runs-dir", path.join(HERE, "runs")));
  const pass = ["--effort", "--budget", "--ref", "--timeout", "--births-dir", "--runs-dir", "--in"].flatMap((k) => (opt(k) ? [k, opt(k)] : []))
    .concat(flag("--full") ? ["--full"] : []);

  const plan = [];
  for (let rep = 1; rep <= reps; rep++) for (const model of models) for (const scenario of scenarios) plan.push({ rep, model, scenario });
  const done = kept(runsDir, batch);
  const todo = plan.filter((b) => !done.has(`${b.scenario}|${b.model}|${b.rep}`));
  console.log(`batch   ${batch}: ${plan.length} births planned, ${plan.length - todo.length} kept already, ${todo.length} to run`);
  console.log(`        on ${binFrom}`);
  console.log(`        stops when the five-hour window reaches ${pct(stopAt)} or a week reaches ${pct(stopWeek)}`);
  if (!todo.length) { console.log("done    nothing left to run."); return 0; }

  let lastBirth = null; const held = [];
  for (const [i, b] of todo.entries()) {
    const usage = worst(readUsage(bin), lastBirth);
    if (!usage) die("could not read the plan's usage (`claude -p /usage`), and no birth has reported it yet; not starting blind");
    const { all, own } = blockers(usage, b.model, stopAt, stopWeek);
    console.log(`usage   five-hour ${pct(usage.session.used)}${Object.entries(usage.weeks).map(([k, w]) => ` · ${k} week ${pct(w.used)}`).join("")}`);
    if (flag("--dry-run")) {
      console.log(all.length ? `dry-run: would stop now: ${all.join("; ")}` : `dry-run: would start with ${b.scenario} on ${b.model} (rep ${b.rep}); nothing played, nothing spent.`);
      for (const t of todo) console.log(`  todo  ${t.scenario} · ${t.model} · rep ${t.rep}`);
      return 0;
    }
    if (all.length) {
      console.log(`STOPPED before birth ${i + 1} of ${todo.length}: ${all.join("; ")}.`);
      console.log(`        ${todo.length - i} left. Run the same command after the reset to carry on.`);
      return 4;
    }
    if (own.length) { console.log(`held    ${b.scenario} on ${b.model} (rep ${b.rep}): ${own.join("; ")}`); held.push(b); continue; }

    console.log(`\n—— birth ${i + 1} of ${todo.length}: ${b.scenario} · ${b.model} · rep ${b.rep}`);
    const r = spawnSync(process.execPath, [path.join(HERE, "birth.mjs"), "--scenario", b.scenario, "--model", b.model,
      "--batch", batch, "--rep", String(b.rep), "--bin", bin, ...pass], { stdio: "inherit" });
    if (r.status === 4) { console.log(`STOPPED: the plan refused birth ${i + 1}. ${todo.length - i} left; run the same command after the reset.`); return 4; }
    if (r.status !== 0) { console.error(`suite: birth.mjs exited ${r.status} on ${b.scenario} · ${b.model}; stopping so the cause can be read.`); return 1; }
    lastBirth = fromBirth(kept(runsDir, batch).get(`${b.scenario}|${b.model}|${b.rep}`)?.limits);
  }

  const now = kept(runsDir, batch);
  const cost = [...now.values()].reduce((s, d) => s + d.cost, 0);
  if (held.length) { console.log(`held    ${held.length} birth(s) on a model whose week is spent; run the same command after it resets.`); return 4; }
  console.log(`done    batch ${batch}: ${now.size} births kept, $${cost.toFixed(2)} by total_cost_usd.`);
  return 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main();
