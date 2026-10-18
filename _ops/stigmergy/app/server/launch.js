// server/launch.js — open an INTERACTIVE Claude Code session in a real terminal,
// seeded with a prompt. The supported counterpart to the actuator's headless
// `claude -p`: a human-driven TUI in a native Terminal window. Claude Code needs
// a real TTY + the user's keychain auth — both present in a Terminal, neither in
// a headless or node-pty context (verified 2026-06-17) — which is why this drives
// a real Terminal rather than embedding one.
//
// macOS-only. We drive Terminal with `open -a Terminal <launcher>` (LaunchServices),
// NOT `osascript … tell application "Terminal"` (Apple Events). This is deliberate
// and load-bearing: Apple Events require macOS Automation (TCC) permission, granted
// per *responsible app*. The dev server is frequently orphaned to launchd (parent
// PID 1 — started detached, or its launching terminal closed), so it has no
// foreground responsible app: macOS can neither honor an Automation grant nor
// *prompt* for one, and the Apple Event is silently denied. The old osascript path
// then no-opped while reporting success (it never checked the exit code), so the
// window never opened and the UI showed a false "launched". `open` goes through
// LaunchServices, needs no Automation permission, and works from any process in the
// user's GUI session — orphaned or not. (Root-caused 2026-06-22.)
//
// Robust prompt-passing without shell/AppleScript escaping hell: the multi-line
// prompt (which itself carries [[wikilinks]], em-dashes, and double quotes) is
// written to a temp file, and a tiny `.command` launcher runs
//   cd "<palaceRoot>" && claude "$(cat "<promptfile>")"
// `$(cat …)` inside double quotes passes the file's bytes as ONE literal argument —
// no re-parsing of quotes/backticks/$ in the prompt. The launcher self-cleans.
// (`.command` is the file type LaunchServices runs in Terminal when opened.)
//
// Testability mirrors the actuator: the spawn is injectable (opts.spawnImpl) and
// the platform/tmp dir are overridable, so tests assert the staged script + the
// `open` argv without opening a real Terminal. Because we now wait for `open` to
// exit and surface its real result, launchInteractive returns a Promise.
//
// The second door, launchDesktop (below), opens the same prompt in the Claude
// desktop app instead, through a claude:// link — also handed to `open`.

import { spawn as realSpawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { resolveModel } from '../../../models/latest-opus.mjs';

// Single-quote a string for bash: wrap in '…', rewriting embedded ' as '\''.
function shq(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

/**
 * Stage + launch an interactive `claude` session in Terminal.app.
 *
 * @param {string} prompt    the seed prompt (multi-line ok)
 * @param {object} opts      { palaceRoot, platform?, spawnImpl?, tmpDir?, model?, effort?, permissionMode? }
 * @returns {Promise<{launched:boolean, supported:boolean, error?:string, scriptPath?:string}>}
 */
export function launchInteractive(prompt, opts = {}) {
  const platform = opts.platform || process.platform;
  if (platform !== 'darwin') {
    return Promise.resolve({ launched: false, supported: false, error: 'open-in-terminal is macOS-only — use copy prompt.' });
  }
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return Promise.resolve({ launched: false, supported: true, error: 'missing or empty prompt' });
  }

  const palaceRoot = opts.palaceRoot || process.cwd();
  const spawnImpl = opts.spawnImpl || realSpawn;
  // Pin the model + effort. A launched session drives a steward / catches a
  // baton / works a card — real read-edit-commit palace work — so it opens on
  // the LATEST Opus at a real reasoning budget, independent of the operator's
  // global /model. The exact id comes from _ops/models/latest-opus.mjs, never
  // the CLI's `opus` alias, which has lagged the latest Opus; a picker that
  // sends "opus" gets the same exact id. `--effort high` overrides the alias's
  // "low" default. Both overridable via opts (the launch picker).
  const model = resolveModel(opts.model);
  const effort = opts.effort || 'high';
  // A launched palace agent does real read-edit-commit work, so it opens in
  // `acceptEdits` rather than the CLI's `default` (ask-before-every-edit) — matching
  // the low-friction feel of a configured desktop session (which also recalls prior
  // "don't ask again" decisions a fresh terminal session can't). This auto-approves
  // file edits but still gates arbitrary Bash, so git stays the safety net. Escalate
  // to 'bypassPermissions' via opts for zero prompts. Overridable for a future picker.
  const permissionMode = opts.permissionMode || 'acceptEdits';

  let dir, promptPath, scriptPath;
  try {
    dir = opts.tmpDir || mkdtempSync(join(tmpdir(), 'stigmergy-launch-'));
    promptPath = join(dir, 'prompt.txt');
    // `.command` so LaunchServices runs it in Terminal when `open`ed.
    scriptPath = join(dir, 'launch.command');
    // The launcher: into the repo, run claude (pinned model + effort) seeded from
    // the prompt file, then clean the temp dir once the session ends
    // (unlink-while-open is safe on unix, so removing this script mid-run does
    // not abort it).
    const script = [
      '#!/bin/bash',
      `cd ${shq(palaceRoot)} || exit 1`,
      // One-line nudge: /desktop moves a live terminal session into the Claude
      // app, so remind the operator it exists. Prints once at session start.
      // (`claude --desktop` now opens the app from a shell, but takes no prompt
      // and needs CLI ≥ 2.1.285 — the one on PATH here was 2.1.280 on
      // 2026-10-18 — so it cannot seed a session; launchDesktop below can.)
      `echo ''`,
      `echo '  ↳ session is live — type /desktop to move it into the Claude Code app.'`,
      `echo ''`,
      `claude --model ${shq(model)} --effort ${shq(effort)} --permission-mode ${shq(permissionMode)} "$(cat ${shq(promptPath)})"`,
      `rm -rf ${shq(dir)}`,
      '',
    ].join('\n');
    writeFileSync(promptPath, prompt, 'utf8');
    writeFileSync(scriptPath, script, { mode: 0o700 });
  } catch (e) {
    return Promise.resolve({ launched: false, supported: true, error: `could not stage launcher: ${e.message}` });
  }

  return runOpen(spawnImpl, ['-a', 'Terminal', scriptPath], { scriptPath });
}

// Drive `open` (LaunchServices) — no Automation/TCC permission needed, so it
// works even when the server is orphaned to launchd. `open` returns once the
// launch is *requested* (not when the claude session ends), so awaiting its exit
// is fast — and lets us surface a REAL result instead of the old fire-and-forget
// assumed success. A non-zero exit (missing file/app/URL handler) or a spawn
// error becomes a visible error the UI can show instead of a silent no-op.
function runOpen(spawnImpl, args, staged) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawnImpl('open', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    } catch (e) {
      resolve({ launched: false, supported: true, error: `open failed: ${e.message}` });
      return;
    }
    if (!child || typeof child.on !== 'function') {
      // Defensive: a spawnImpl that returns no event emitter — assume requested.
      resolve({ launched: true, supported: true, ...staged });
      return;
    }
    let stderr = '';
    if (child.stderr && typeof child.stderr.on === 'function') {
      child.stderr.on('data', (d) => { stderr += String(d); });
    }
    let settled = false;
    const done = (r) => { if (!settled) { settled = true; resolve(r); } };
    child.on('error', (e) => done({ launched: false, supported: true, error: `open failed: ${e.message}` }));
    child.on('close', (code) => {
      if (code === 0) done({ launched: true, supported: true, ...staged });
      else done({ launched: false, supported: true, error: `open exited ${code}${stderr ? `: ${stderr.trim()}` : ''}` });
    });
  });
}

// ── The desktop door ────────────────────────────────────────────────────────
// The Claude desktop app answers `claude://code/new?folder=<abs path>&q=<text>`:
// a new Code session opens with q in the composer, prefilled but NOT sent, after
// a dialog that confirms the folder (always — a link's folder is untrusted).
// Values are URL-encoded and q is cut at roughly 14,000 characters
// (support.claude.com/en/articles/14729294, read 2026-10-18).
//
// So the prompt never rides in the link. A construction runs from ~2K chars (a
// handoff) to 256K (a steward, whose shared + steward prompts alone are 52K),
// and a cut q silently loses the closing instruction. The prompt is staged as a
// file under the palace root and q is one line pointing at it. Every launch kind
// takes this one path: a handoff would fit inline today, but whether a prompt
// fits is a fact about today's builders, and one rule is easier to trust than a
// size check that is right until the day a prompt grows past it.
//
// The staged path in q is absolute: a desktop session the app puts in its own
// worktree has only tracked files, and this folder is gitignored.
//
// The link cannot carry model, effort or permission mode, so the session opens
// on the app's own — not the latest Opus · high · acceptEdits the terminal pins.

export const DESKTOP_LAUNCHES_DIR = join('_ops', 'stigmergy', 'launches');
// Staged files outlive the click: the session reads its file on its first turn,
// which may be well after the link opened. A week is generous for that.
const PRUNE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
// Only files this door named are ever pruned: <UTC stamp>-<label>-<hex>.txt.
const STAGED_NAME = /^\d{8}T\d{6}Z-[a-z0-9-]+-[0-9a-f]{6}\.txt$/;

/** The one-line q, pointing at the staged prompt. */
export function desktopPointer(stagedPath) {
  return `Read "${stagedPath}" in full — it is your construction for this session — and follow it.`;
}

/** The claude:// link that opens a desktop Code session at palaceRoot with the pointer prefilled. */
export function desktopLink(palaceRoot, stagedPath) {
  return `claude://code/new?folder=${encodeURIComponent(palaceRoot)}&q=${encodeURIComponent(desktopPointer(stagedPath))}`;
}

function slugLabel(label) {
  const s = String(label || 'prompt').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48).replace(/-+$/, '');
  return s || 'prompt';
}

function utcStamp(ms) {
  return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

// Remove this door's staged files older than PRUNE_AFTER_MS. Best-effort: a file
// another server already removed, or one we cannot stat, is skipped, and a
// pruning failure never blocks the launch.
function pruneStaged(dir, now) {
  let names = [];
  try { names = readdirSync(dir); } catch { return; }
  for (const name of names) {
    if (!STAGED_NAME.test(name)) continue;
    const p = join(dir, name);
    try {
      if (now - statSync(p).mtimeMs > PRUNE_AFTER_MS) unlinkSync(p);
    } catch { /* gone already, or unreadable — leave it */ }
  }
}

/**
 * Stage the prompt under the palace root and open a Claude desktop Code session
 * on a pointer to it.
 *
 * @param {string} prompt   the full prompt, staged verbatim
 * @param {object} opts     { palaceRoot, label?, platform?, spawnImpl?, now? }
 * @returns {Promise<{launched:boolean, supported:boolean, error?:string, stagedPath?:string, link?:string}>}
 */
export function launchDesktop(prompt, opts = {}) {
  const platform = opts.platform || process.platform;
  if (platform !== 'darwin') {
    return Promise.resolve({ launched: false, supported: false, error: 'open-in-desktop is macOS-only here — use copy prompt.' });
  }
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return Promise.resolve({ launched: false, supported: true, error: 'missing or empty prompt' });
  }

  const palaceRoot = opts.palaceRoot || process.cwd();
  const spawnImpl = opts.spawnImpl || realSpawn;
  const now = opts.now || Date.now();

  let stagedPath, link;
  try {
    const dir = join(palaceRoot, DESKTOP_LAUNCHES_DIR);
    mkdirSync(dir, { recursive: true });
    pruneStaged(dir, now);
    // Unique per launch, so two sessions launching at once never share a file.
    stagedPath = join(dir, `${utcStamp(now)}-${slugLabel(opts.label)}-${randomBytes(3).toString('hex')}.txt`);
    writeFileSync(stagedPath, prompt, 'utf8');
    link = desktopLink(palaceRoot, stagedPath);
  } catch (e) {
    return Promise.resolve({ launched: false, supported: true, error: `could not stage the prompt: ${e.message}` });
  }

  return runOpen(spawnImpl, [link], { stagedPath, link });
}
