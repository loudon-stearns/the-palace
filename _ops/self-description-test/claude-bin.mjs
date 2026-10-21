// claude-bin.mjs — which Claude Code a birth runs on: the desktop app's newest, found at run time.
//
// Loudon, 2026-10-21: births run on the desktop app's current Claude Code, because that is what his sessions are
// born on. Claude Code shapes the child as much as the model does (its system prompt, its tools, what it attaches to
// each turn: 2.1.280 showed the child its spending cap), so a birth on a stale CLI tests a child nobody works with.
// The app keeps each version it has installed under ~/Library/Application Support/Claude/claude-code/<version>/;
// the newest is the one it runs. --bin overrides; with no app, the `claude` on PATH is the fallback, and says so.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const APP_DIR = path.join(os.homedir(), "Library", "Application Support", "Claude", "claude-code");

const semver = (v) => v.split(/[.-]/).map((n) => (/^\d+$/.test(n) ? +n : n));
const newer = (a, b) => { const x = semver(a), y = semver(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) return (x[i] ?? -1) > (y[i] ?? -1) ? a : b;
  return a; };

// The desktop app's newest Claude Code: { version, bin }, or null when the app has none.
export function desktopClaude(appDir = APP_DIR) {
  let versions; try { versions = fs.readdirSync(appDir).filter((v) => /^\d+\.\d+\.\d+/.test(v)); } catch { return null; }
  for (const version of versions.sort((a, b) => (newer(a, b) === a ? -1 : 1))) {
    for (const hash of fs.readdirSync(path.join(appDir, version))) {
      const bin = path.join(appDir, version, hash, "claude.app", "Contents", "MacOS", "claude");
      if (fs.existsSync(bin)) return { version, bin };
    }
  }
  return null;
}

// The binary to run: an explicit --bin, else the desktop app's newest, else `claude` on PATH.
export function resolveBin(explicit, appDir = APP_DIR) {
  if (explicit) return { bin: explicit, from: "--bin" };
  const d = desktopClaude(appDir);
  return d ? { bin: d.bin, from: `the desktop app's Claude Code ${d.version}` } : { bin: "claude", from: "`claude` on PATH (no desktop app found)" };
}
