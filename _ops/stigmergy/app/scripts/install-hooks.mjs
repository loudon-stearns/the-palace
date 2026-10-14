#!/usr/bin/env node
// install-hooks — install the palace commit-msg hook into the repo's hooks directory.
//
// DELIBERATE, NOT AUTOMATIC. A commit-msg hook is repo-global: it affects
// every commit by every session and by Loudon's Obsidian/CLI. So installation
// is an explicit step a human runs, never something the build does silently
// (especially while multiple sessions are committing concurrently).
//
// The installed hook is a tiny POSIX shim that execs node on the tracked logic
// (scripts/commit-msg-hook.mjs), so the behavior stays version-controlled and
// the hook itself never goes stale. Any pre-existing commit-msg hook is backed
// up to commit-msg.pre-palace before we overwrite.
//
// Usage (from anywhere inside the repo):
//   node _ops/stigmergy/app/scripts/install-hooks.mjs            # install
//   node _ops/stigmergy/app/scripts/install-hooks.mjs --uninstall # restore backup
//   node _ops/stigmergy/app/scripts/install-hooks.mjs --check     # report status
//
// The ear (the reference-transaction hook, scripts/ear.sh) installs the same
// deliberate way, with its own flag:
//   node _ops/stigmergy/app/scripts/install-hooks.mjs --ear              # install the ear
//   node _ops/stigmergy/app/scripts/install-hooks.mjs --ear --uninstall  # remove it
//   node _ops/stigmergy/app/scripts/install-hooks.mjs --ear --check      # report status

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, copyFileSync, chmodSync, rmSync } from 'node:fs';
import { join, isAbsolute } from 'node:path';

const git = a => execFileSync('git', a, { encoding: 'utf8' }).trim();

// `--git-path hooks` honors core.hooksPath and resolves to the shared hooks dir from any worktree
// (in a worktree `.git` is a file, so joining root + '.git/hooks' would point nowhere).
function hooksDir() {
  const dir = git(['rev-parse', '--path-format=absolute', '--git-path', 'hooks']);
  return isAbsolute(dir) ? dir : join(git(['rev-parse', '--show-toplevel']), dir);
}

// The shim: resolve the repo root at hook time, then exec node on the tracked
// logic. Self-locating so it works regardless of where git invokes it.
const SHIM = `#!/bin/sh
# Palace commit-msg hook (installed by install-hooks.mjs). Tolerant backstop:
# annotates non-spec commits, never blocks. Logic lives in the tracked
# scripts/commit-msg-hook.mjs so this shim never goes stale.
ROOT="$(git rev-parse --show-toplevel)"
LOGIC="$ROOT/_ops/stigmergy/app/scripts/commit-msg-hook.mjs"
if [ -f "$LOGIC" ]; then
  node "$LOGIC" "$1" || exit 0   # never wedge a commit on a hook error
fi
exit 0
`;

// The ear's shim. It runs the MAIN checkout's copy of ear.sh, so there is one
// ear whatever branch a worktree has checked out, and falls back to the
// checkout's own copy only when main's is missing. It always exits 0: the
// listening ear must never be why a ref update fails.
const EAR_SHIM = `#!/bin/sh
# Palace ear (reference-transaction hook; installed by install-hooks.mjs --ear).
# Listening only: logs each branch move and never blocks. Logic lives in the
# tracked _ops/stigmergy/app/scripts/ear.sh so this shim never goes stale.
MAIN="$(cd "$(git rev-parse --git-common-dir 2>/dev/null)/.." 2>/dev/null && pwd)"
LOGIC="$MAIN/_ops/stigmergy/app/scripts/ear.sh"
if [ ! -f "$LOGIC" ]; then
  LOGIC="$(git rev-parse --show-toplevel 2>/dev/null)/_ops/stigmergy/app/scripts/ear.sh"
fi
if [ -f "$LOGIC" ]; then
  sh "$LOGIC" "$@" 2>/dev/null
else
  cat >/dev/null 2>&1
fi
exit 0
`;

function earMain(mode) {
  const hookPath = join(hooksDir(), 'reference-transaction');
  const ours = (p) => existsSync(p) && readFileSync(p, 'utf8').includes('Palace ear');
  if (mode === 'check') {
    if (!existsSync(hookPath)) { console.log(`ear (reference-transaction hook): NOT installed — ${hookPath}`); return; }
    console.log(`ear (reference-transaction hook): ${ours(hookPath) ? 'INSTALLED (palace)' : 'present (foreign)'} — ${hookPath}`);
    return;
  }
  if (mode === 'uninstall') {
    if (ours(hookPath)) { rmSync(hookPath); console.log('removed the palace ear.'); } else console.log('no palace ear to uninstall.');
    return;
  }
  if (existsSync(hookPath) && !ours(hookPath)) {
    console.log(`a foreign reference-transaction hook is already at ${hookPath}; not overwriting it.`);
    process.exitCode = 1;
    return;
  }
  writeFileSync(hookPath, EAR_SHIM, 'utf8');
  chmodSync(hookPath, 0o755);
  console.log(`installed the palace ear at ${hookPath}`);
  console.log('it writes one line per branch move to <git common dir>/palace-ear.jsonl; it never blocks.');
}

function main() {
  if (process.argv.includes('--ear')) {
    earMain(process.argv.includes('--uninstall') ? 'uninstall' : process.argv.includes('--check') ? 'check' : 'install');
    return;
  }
  const dir = hooksDir();
  const hookPath = join(dir, 'commit-msg');
  const backupPath = join(dir, 'commit-msg.pre-palace');
  const mode = process.argv.includes('--uninstall') ? 'uninstall'
    : process.argv.includes('--check') ? 'check' : 'install';

  if (mode === 'check') {
    if (!existsSync(hookPath)) { console.log(`commit-msg hook: NOT installed — ${hookPath}`); return; }
    const body = readFileSync(hookPath, 'utf8');
    const isOurs = body.includes('Palace commit-msg hook');
    console.log(`commit-msg hook: ${isOurs ? 'INSTALLED (palace)' : 'present (foreign)'} — ${hookPath}`);
    if (existsSync(backupPath)) console.log('backup present: commit-msg.pre-palace');
    return;
  }

  if (mode === 'uninstall') {
    if (existsSync(backupPath)) {
      copyFileSync(backupPath, hookPath);
      rmSync(backupPath);
      console.log('restored the pre-palace commit-msg hook from backup.');
    } else if (existsSync(hookPath) && readFileSync(hookPath, 'utf8').includes('Palace commit-msg hook')) {
      rmSync(hookPath);
      console.log('removed the palace commit-msg hook (no prior hook to restore).');
    } else {
      console.log('no palace commit-msg hook to uninstall.');
    }
    return;
  }

  // install
  if (existsSync(hookPath)) {
    const body = readFileSync(hookPath, 'utf8');
    if (body.includes('Palace commit-msg hook')) {
      console.log('palace commit-msg hook already installed -- refreshing the shim.');
    } else {
      copyFileSync(hookPath, backupPath);
      console.log('backed up the existing commit-msg hook to commit-msg.pre-palace.');
    }
  }
  writeFileSync(hookPath, SHIM, 'utf8');
  chmodSync(hookPath, 0o755);
  console.log(`installed the palace commit-msg hook at ${hookPath}`);
  console.log('it tolerates-and-annotates non-spec commits; it never blocks.');
}

main();
