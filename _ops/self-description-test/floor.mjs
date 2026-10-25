#!/usr/bin/env node
// floor.mjs — the floor, measured: what every agent here reads before its task, file by file, for $0.
//
// The floor is what Claude Code loads at birth from this repository (CLAUDE.md and its imports: the Jewel, the World,
// CHILD) plus whatever the operator's auto-memory adds. [[Palace as Context Injection System]] reasons from its size
// and order, and nothing kept those numbers true once the World pages changed (its baton, part 1). This keeps them.
//
// The probe is the one birth.mjs certifies a birth with: `claude -p /context` prints the loaded-files table and makes
// no model call (cost 0, 0 tokens; checked 2026-10-25 on Claude Code 2.1.308). It runs in the repository itself, so it
// sees the floor as Loudon's sessions get it, MEMORY.md included. If the probe ever reports a cost, nothing is written.
//
//   node _ops/self-description-test/floor.mjs              # measure, write floor.json, add a dated line if it moved
//   … [--dry-run] [--json] [--repo <dir>] [--bin <claude>] [--out <floor.json>]
//
// Writes, beside each other in the page's bundle (the graphic `who-wakes-here.html` reads the first):
//   floor/floor.json      the latest measurement: each file in load order with its tokens, the total, the commit,
//                         the Claude Code version and the date. Rewritten on every run, so its commit says what it holds.
//   floor/history.jsonl   one dated line per measurement whose numbers or Claude Code differ from the line before.
// Claude Code shows a file of 1,000 tokens or more to the nearest hundred ("1.1k"); `shown` keeps what it printed.
// due.mjs reads floor.json's commit to say when a change to a floor file has not been measured since.
//
// Exit: 0 written (or nothing to write) · 1 error, or the probe was not free.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { BORN_WITH, WORLD } from "./scenarios.mjs";
import { resolveBin } from "./claude-bin.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));

// The files a change to which makes a measurement owed: what CLAUDE.md imports, and the real files behind the World's
// space-free symlinks. Operator memory is the floor too, but it lives outside the repository and its commits.
export const FLOOR_FILES = [...BORN_WITH, ...Object.values(WORLD)];
export const FLOOR_DATA = "Palace development/Palace as Context Injection System/floor/floor.json";

const KIND = { "CLAUDE.md": "birth", "JEWEL.md": "jewel", "CHILD.md": "child" };
for (const f of Object.keys(WORLD)) KIND[f] = "world";

// "658" → 658, "1.1k" → 1100, "~390" → 390.
export function tokens(shown) {
  const m = String(shown).trim().replace(/^~/, "").match(/^([\d.]+)\s*([km]?)$/i);
  if (!m) return null;
  return Math.round(+m[1] * ({ k: 1e3, m: 1e6 }[m[2].toLowerCase()] || 1));
}

// The rows of one "### <name>" table in /context's result text, as arrays of cells.
function table(text, name) {
  const part = String(text || "").split(`### ${name}`)[1];
  if (part == null) return [];
  const rows = [];
  for (const line of part.split("\n").slice(1)) {
    if (line.startsWith("###")) break;
    if (!line.startsWith("|")) { if (rows.length) break; continue; }
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.every((c) => /^-*$/.test(c))) continue;
    rows.push(cells);
  }
  return rows.slice(1); // the header
}

// The floor from /context's result text: every memory file in the order it loads, named as the palace names it.
export function parseFloor(text, repo) {
  const home = os.homedir();
  const files = table(text, "Memory Files").map(([type, p, shown], i) => {
    const inRepo = p.startsWith(repo + "/");
    const loaded = inRepo ? p.slice(repo.length + 1) : p.replace(home, "~");
    const file = inRepo ? (WORLD[loaded] || loaded) : path.basename(p);
    const kind = inRepo ? (KIND[loaded] || "other") : type === "AutoMem" ? "operator memory" : "other";
    return { order: i + 1, file, loaded_as: loaded, type, kind, shown, tokens: tokens(shown) };
  });
  const harness = Object.fromEntries(table(text, "Estimated usage by category")
    .filter(([c]) => !/^(Memory files|Messages|Free space|Autocompact buffer)$/i.test(c))
    .map(([c, shown]) => [c, tokens(shown)]));
  return { files, harness };
}

function probe(bin, cwd) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC_)/.test(k)));
  const out = execFileSync(bin, ["-p", "/context", "--output-format", "stream-json", "--verbose", "--strict-mcp-config",
    "--permission-mode", "dontAsk", "--no-session-persistence", "--max-budget-usd", "0.01"],
    { cwd, env, input: "", encoding: "utf8", timeout: 120000, maxBuffer: 64 << 20 });
  const events = out.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const init = events.find((e) => e.type === "system" && e.subtype === "init");
  const result = events.find((e) => e.type === "result");
  if (!init || !result) throw new Error("the /context probe returned no init or result event");
  const u = result.usage || {};
  const spent = (result.total_cost_usd || 0) + (u.input_tokens || 0) + (u.output_tokens || 0);
  return { init, result, free: spent === 0 };
}

const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const sameNumbers = (a, b) => !!a && !!b && a.claude_code === b.claude_code
  && JSON.stringify(a.files.map((f) => [f.file, f.tokens])) === JSON.stringify(b.files.map((f) => [f.file, f.tokens]));

function main() {
  const argv = process.argv.slice(2);
  const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
  const flag = (k) => argv.includes(k);
  const repo = fs.realpathSync(path.resolve(opt("--repo", git(["rev-parse", "--show-toplevel"], HERE))));
  const out = path.resolve(repo, opt("--out", FLOOR_DATA));
  const historyFile = path.join(path.dirname(out), "history.jsonl");
  const { bin, from } = resolveBin(opt("--bin"));

  const p = probe(bin, repo);
  if (!p.free) {
    console.error(`floor: the probe was not free ($${p.result.total_cost_usd}, usage ${JSON.stringify(p.result.usage)}). Nothing written.`);
    return 1;
  }
  const { files, harness } = parseFloor(p.result.result, repo);
  if (!files.length) throw new Error("the /context table listed no memory files");
  const missing = BORN_WITH.filter((f) => !files.some((x) => x.loaded_as === f));
  const dirty = git(["status", "--porcelain", "-z", "--no-renames", "--", ...FLOOR_FILES], repo).split("\0").filter(Boolean).map((l) => l.slice(3));
  const now = new Date();
  const sum = (xs) => xs.reduce((n, f) => n + (f.tokens || 0), 0);
  const jewel = fs.existsSync(path.join(repo, "JEWEL.md")) ? fs.readFileSync(path.join(repo, "JEWEL.md"), "utf8").match(/^## The Seed Jewel — (v[\d.]+)/m)?.[1] ?? null : null;
  const m = {
    date: now.toLocaleDateString("en-CA"), // YYYY-MM-DD, local
    measured: now.toISOString(),
    commit: git(["rev-parse", "HEAD"], repo),
    dirty,
    claude_code: p.init.claude_code_version ?? null,
    probe: "claude -p /context (no model call, $0)",
    cost_usd: p.result.total_cost_usd ?? 0,
    jewel,
    total: sum(files),
    palace_total: sum(files.filter((f) => f.type === "Project")),
    before_jewel: sum(files.slice(0, Math.max(0, files.findIndex((f) => f.kind === "jewel")))),
    missing,
    files,
    harness,
  };

  const last = fs.existsSync(historyFile) ? fs.readFileSync(historyFile, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).pop() : null;
  const moved = !sameNumbers(last, m);
  if (flag("--json")) console.log(JSON.stringify(m, null, 2));
  else {
    console.log(`floor   ${m.date} @ ${m.commit.slice(0, 8)} · Claude Code ${m.claude_code} (${from}) · $${m.cost_usd}`);
    for (const f of files) console.log(`  ${String(f.order).padStart(2)} ${f.file.padEnd(28)} ${String(f.shown).padStart(5)}  ${f.kind}`);
    console.log(`        total ${m.total} · the palace's ${m.palace_total} · before the Jewel ${m.before_jewel}`);
    if (missing.length) console.log(`  ! not loaded: ${missing.join(", ")}`);
    if (dirty.length) console.log(`  ! measured with uncommitted changes to ${dirty.join(", ")}: due.mjs won't count it for them`);
    console.log(moved ? `        ${last ? `moved since ${last.date}` : "the first dated line"}` : `        unchanged since ${last.date}`);
  }
  if (flag("--dry-run")) return 0;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(m, null, 2) + "\n");
  if (moved) {
    const { harness: _h, probe: _p, ...line } = m;
    fs.appendFileSync(historyFile, JSON.stringify(line) + "\n");
  }
  console.log(`wrote   ${path.relative(repo, out)}${moved ? ` and a line in ${path.relative(repo, historyFile)}` : ""}`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  try { process.exitCode = main(); } catch (e) { console.error(`floor: ${e.stderr?.toString().trim() || e.message}`); process.exitCode = 1; }
}
