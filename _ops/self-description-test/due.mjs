#!/usr/bin/env node
// due.mjs — which scenarios a change has put at risk, and whether each has been born since. Free: no model, no spend.
//
// "Due" is the "which tests cover this file" question, answered before anything is spent (DESIGN § When it runs).
// Every scenario names the files it rests on (scenarios.mjs `tests`). A change to one of those makes it due (tier 1).
// A change to what every child is born with or grows into (CLAUDE.md, the Jewel, the World, ELDER, SCHEMA) makes
// the whole suite due (tier 2). A due scenario is still owed until a birth has run on a commit that holds the change.
//
//   node _ops/self-description-test/due.mjs                     # what this branch changed since main, committed or not
//   node _ops/self-description-test/due.mjs --since <ref>       # since the merge-base with <ref>
//   node _ops/self-description-test/due.mjs --files <path> …    # these paths, no git history (nothing can be "run since")
//   … [--json] [--repo <dir>] [--runs-dir <dir>]
//
// Exit: 0 nothing owed · 1 error · 2 a due scenario has not been born since the change (the Closing Well hand-on).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARIOS, WHOLE_SUITE } from "./scenarios.mjs";

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
    let run; try { run = JSON.parse(fs.readFileSync(path.join(runsDir, f), "utf8")).run; } catch { continue; }
    if (run?.scenario && (!latest[run.scenario] || n > latest[run.scenario].n)) latest[run.scenario] = { n, file: f, commit: run.source_commit };
  }
  return latest;
}

function main() {
  const repo = path.resolve(opt("--repo", git(["rev-parse", "--show-toplevel"], HERE).trim()));
  const runsDir = path.resolve(opt("--runs-dir", path.join(HERE, "runs")));
  const files = listAfter("--files");

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
    const because = [...new Set([...whole, ...own])];
    if (!because.length) continue;
    const last = latest[id] || null;
    let bornSince = null; // null: no history to judge by (--files)
    if (!files) bornSince = !!last?.commit && because.every((p) => {
      const c = commitsFor.get(p);
      return !c.uncommitted && c.commits.every((h) => isAncestor(h, last.commit, repo));
    });
    due.push({ scenario: id, tier: whole.length ? 2 : 1, because, last_birth: last, born_since: bornSince });
  }
  const owed = due.filter((d) => d.born_since === false);

  if (flag("--json")) console.log(JSON.stringify({ since, base, changed: changed.length, whole_suite_because: whole, due, owed: owed.map((d) => d.scenario) }, null, 2));
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
