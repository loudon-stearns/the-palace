#!/usr/bin/env node
// due.mjs — which scenarios a change has put at risk, and whether each has been born since. Free: no model, no spend.
//
// "Due" is the "which tests cover this file" question, answered before anything is spent (DESIGN § When it runs).
// Every scenario names the files it rests on (scenarios.mjs `tests`). A change to one of those makes it due (tier 1).
// A change to what every child is born with or grows into (CLAUDE.md, the Jewel, the World, CHILD, ELDER, SCHEMA) makes
// the whole suite due (tier 2), and so does a new Claude Code: the desktop app's newest differs from the one a
// scenario was last born on (Loudon, 2026-10-21: births run on the app's current Claude Code, which shapes the child
// as much as the text does). A due scenario is still owed until a birth has run on a commit that holds the change.
//
//   node _ops/self-description-test/due.mjs                     # what this branch changed since main, committed or not
//   node _ops/self-description-test/due.mjs --since <ref>       # since the merge-base with <ref>
//   node _ops/self-description-test/due.mjs --files <path> …    # these paths, no git history (nothing can be "run since")
//   … [--json] [--repo <dir>] [--runs-dir <dir>] [--claude-version <v>]   (default: the desktop app's newest)
//   … --session   only what this change put at risk: scenarios born before whose canon it touched. No version moves,
//                 no scenario never born. That is a session's debt, and what a close hands on; the rest is the suite's.
//
// Exit: 0 nothing owed · 1 error · 2 a due scenario has not been born since the change (the Closing Well hand-on).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARIOS, WHOLE_SUITE } from "./scenarios.mjs";
import { desktopClaude } from "./claude-bin.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
const flag = (k) => argv.includes(k);
const listAfter = (k) => { const i = argv.indexOf(k); if (i < 0) return null; const r = []; for (let j = i + 1; j < argv.length && !argv[j].startsWith("--"); j++) r.push(argv[j]); return r; };
const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const z = (s) => s.split("\0").filter(Boolean);
const isAncestor = (a, b, cwd) => { try { git(["merge-base", "--is-ancestor", a, b], cwd); return true; } catch { return false; } };

// The latest birth of each scenario, from the checks the harness keeps (run 1 was by hand and kept none).
function latestRuns(runsDir) {
  const latest = {};
  for (const f of fs.existsSync(runsDir) ? fs.readdirSync(runsDir) : []) {
    if (!f.endsWith("— checks.json")) continue;
    const n = +(f.match(/birth-(\d+)/)?.[1] || 0);
    let r; try { r = JSON.parse(fs.readFileSync(path.join(runsDir, f), "utf8")); } catch { continue; }
    const run = r.run;
    if (run?.scenario && (!latest[run.scenario] || n > latest[run.scenario].n))
      latest[run.scenario] = { n, file: f, commit: run.source_commit, claude_code: r.birth?.claude_code ?? null };
  }
  return latest;
}

function main() {
  const repo = path.resolve(opt("--repo", git(["rev-parse", "--show-toplevel"], HERE).trim()));
  const runsDir = path.resolve(opt("--runs-dir", path.join(HERE, "runs")));
  const files = listAfter("--files");
  const session = flag("--session");
  const claudeCode = session ? null : opt("--claude-version", desktopClaude()?.version ?? null);

  // What changed, and by which commits. A path changed in the working tree has no commit, so no birth can hold it.
  let changed, since = null, base = null;
  const commitsFor = new Map();
  if (files) changed = files;
  else {
    since = opt("--since", "main");
    base = git(["merge-base", since, "HEAD"], repo).trim();
    const committed = z(git(["diff", "--name-only", "-z", "--no-renames", `${base}..HEAD`], repo));
    const working = z(git(["diff", "--name-only", "-z", "--no-renames", "HEAD"], repo));
    changed = [...new Set([...committed, ...working])];
    for (const p of changed) commitsFor.set(p, {
      commits: z(git(["log", "-z", "--format=%H", `${base}..HEAD`, "--", p], repo)),
      uncommitted: working.includes(p),
    });
  }

  const whole = changed.filter((p) => WHOLE_SUITE.includes(p));
  const latest = latestRuns(runsDir);
  const due = [];
  for (const [id, sc] of Object.entries(SCENARIOS)) {
    const own = changed.filter((p) => sc.tests.includes(p));
    const last = latest[id] || null;
    const moved = claudeCode && last?.claude_code && last.claude_code !== claudeCode ? [`Claude Code ${last.claude_code} → ${claudeCode}`] : [];
    const because = [...new Set([...whole, ...own])];
    if (!because.length && !moved.length) continue;
    if (session && !last) continue; // never born: the suite's debt, not this change's
    let bornSince = null; // null: no history to judge by (--files)
    if (moved.length) bornSince = false; // its last birth is on another Claude Code, by definition
    else if (!files) bornSince = !!last?.commit && because.every((p) => {
      const c = commitsFor.get(p);
      return !c.uncommitted && c.commits.every((h) => isAncestor(h, last.commit, repo));
    });
    due.push({ scenario: id, tier: whole.length || moved.length ? 2 : 1, because: [...because, ...moved], last_birth: last, born_since: bornSince });
  }
  const owed = due.filter((d) => d.born_since === false);

  if (flag("--json")) console.log(JSON.stringify({ since, base, claude_code: claudeCode, changed: changed.length, whole_suite_because: whole, due, owed: owed.map((d) => d.scenario) }, null, 2));
  else {
    const from = files ? `${files.length} named path(s)` : `${changed.length} changed path(s) since ${since} (merge-base ${base.slice(0, 8)})`;
    if (!due.length) console.log(`due     nothing: ${from} touch no scenario's canon.`);
    else {
      console.log(`due     ${due.length} scenario(s) at risk from ${from}${whole.length ? ` — the whole suite, because ${whole.join(", ")} changed` : ""}`);
      for (const d of due) {
        const last = d.last_birth ? `last born birth-${d.last_birth.n} @ ${String(d.last_birth.commit).slice(0, 8)}` : "never born through the harness";
        const state = d.born_since === null ? "" : d.born_since ? " · born since ✓" : " · OWED: not born since the change";
        console.log(`  ${d.scenario.padEnd(5)} tier ${d.tier} · ${d.because.join(", ")} · ${last}${state}`);
      }
      if (owed.length) console.log(`        run: node _ops/self-description-test/birth.mjs --scenario <id> --ref HEAD   (each owed scenario; tier 2 runs the whole suite)`);
    }
  }
  return owed.length ? 2 : 0;
}

try { process.exitCode = main(); } catch (e) { console.error(`due: ${e.stderr?.toString().trim() || e.message}`); process.exitCode = 1; }
