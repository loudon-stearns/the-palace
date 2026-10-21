// scratch.mjs — what the harness tests share: a tiny checkout to be born into, scratch folders, and the fake claude.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BORN_WITH } from "../scenarios.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SUITE = path.resolve(HERE, "..");
export const FAKE = path.join(HERE, "fake-claude.mjs");
export const node = (script, args, env = {}) => spawnSync(process.execPath, [path.join(SUITE, script), ...args],
  { encoding: "utf8", env: { ...process.env, ...env } });
export const sh = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

// A checkout that holds what a child is born with, a scratch projects folder, a scratch runs folder, and a call log.
export function scratch() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "self-check-test-")));
  const repo = path.join(root, "palace"), projects = path.join(root, "projects"), runs = path.join(root, "runs"), log = path.join(root, "calls.jsonl");
  fs.mkdirSync(repo);
  for (const f of BORN_WITH) fs.writeFileSync(path.join(repo, f), `# ${f}\n`);
  sh("git", ["init", "-q", "-b", "main"], repo);
  sh("git", ["-c", "user.email=t@t", "-c", "user.name=t", "add", "."], repo);
  sh("git", ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "born"], repo);
  return { root, repo, projects, runs, log, env: { PALACE_BIRTH_PROJECTS: projects, FAKE_CLAUDE_LOG: log },
    calls: () => (fs.existsSync(log) ? fs.readFileSync(log, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []),
    kept: () => (fs.existsSync(runs) ? fs.readdirSync(runs).filter((f) => f.endsWith("checks.json")) : []),
    done: () => fs.rmSync(root, { recursive: true, force: true }) };
}
