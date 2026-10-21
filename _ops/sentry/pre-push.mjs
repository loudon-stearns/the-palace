#!/usr/bin/env node
// The Sentry's gate — git pre-push logic. Reads what is about to leave for the remote — every
// file, every commit and tag (its message, and its headers for credentials), and the names of the
// refs it updates, since all of it is as public as a file once pushed — and blocks the push if it
// carries a credential or a file that must never be public.
//
// Called by the pre-push shim (install-hooks.mjs) with git's arguments ($1 remote name,
// $2 url) and git's stdin (one line per ref: <local ref> <local sha> <remote ref> <remote sha>).
//
// Blocks on HIGH only: a real-format key, a private key, a .env / settings.local.json / key
// file / data export, an SSN or card number in prose, a GPS-tagged photo, invisible
// Unicode smuggling. Everything else is printed as a warning and the push goes on.
//
// The rich check (rich.mjs) reads the pushed commit's rich faces with the piece checker when
// the push touches one. Its errors are HIGH only once Loudon turns `enforce.push` on in
// _ops/rich-face/conform.json; until then it prints and never blocks.
//
// Override once, knowingly, and only on Loudon's word:   git push --no-verify (it also goes around palace-push)
// Accept a false positive:     add its fp to _ops/sentry/allow.json with a reason.
//
// It fails CLOSED ([[Tool Builder]]: fail-closed on safety). If the gate cannot run, the push
// is refused and the message names the way through — `git push --no-verify` — so a bug here
// costs a deliberate keystroke, never a silent unchecked push. gitleaks missing is not
// "cannot run": the Sentry's own rules still read every blob and every message, so that is only
// a warning. gitleaks reads patches, not messages; the messages are the Sentry's rules alone.

import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { repoRoot, heldDir, loadAllow, listObjects, scanBlobs, scanMessages, scanContent, scanPaths, hasGitleaks, sortFindings } from './engine.mjs';
import { fingerprint } from './rules.mjs';
import { richGate, touchedPaths } from './rich.mjs';

const ZERO = /^0+$/;
const remote = process.argv[2] || 'origin';

async function main() {
  const root = repoRoot();
  const allow = loadAllow();
  const lines = readFileSync(0, 'utf8').split('\n').map(l => l.trim().split(/\s+/)).filter(p => p.length === 4);
  const ranges = [];
  for (const [, localSha, remoteRef, remoteSha] of lines) {
    if (ZERO.test(localSha)) continue; // deleting a remote branch sends nothing
    ranges.push(ZERO.test(remoteSha)
      ? { label: remoteRef, sha: localSha, rev: [localSha, '--not', `--remotes=${remote}`] } // new branch: what the remote lacks
      : { label: remoteRef, sha: localSha, rev: [localSha, `^${remoteSha}`] });
  }
  if (!ranges.length) return;
  if (!hasGitleaks()) console.error('sentry: gitleaks is not installed — checking with the Sentry rules alone (brew install gitleaks for its ~150 more)');

  const findings = [];
  const opts = { families: ['secret', 'pii', 'inject'], piiLevel: 'all', allow };
  for (const r of ranges) {
    const { blobs, messages } = listObjects(root, r.rev);
    findings.push(...(await scanBlobs(root, blobs, opts)).findings);
    findings.push(...(await scanMessages(root, messages, opts)).findings);
    findings.push(...scanPaths([...new Set(blobs.map(b => b.path))], allow));
    findings.push(...gitleaksRange(root, r.rev, allow));
    findings.push(...richRange(root, r, allow));
  }
  // A ref's name is in no object, and it goes out too (credentials only; the name is never printed).
  findings.push(...scanContent('pushed ref names', Buffer.from(ranges.map(r => r.label).join('\n') + '\n'), { families: ['secret'], allow, textAs: 'message.txt' })
    .map(f => ({ ...f, ref: true })));
  // One object on several pushed refs is read once per ref; it is one finding.
  const seen = new Set();
  const once = findings.filter(f => { const k = [f.rule, f.fp, f.blob || f.commit || f.tag || '', f.line].join('|'); return !seen.has(k) && seen.add(k); });
  const open = sortFindings(once.filter(f => !f.allowed && f.sev !== 'info'));
  const high = open.filter(f => f.sev === 'high');
  const warn = open.filter(f => f.sev !== 'high');

  if (warn.length) {
    console.error(`sentry: ${warn.length} thing(s) worth a look in this push (not blocking):`);
    for (const f of warn.slice(0, 12)) console.error(`  ${f.sev.padEnd(6)} ${f.family}/${f.rule}  ${f.path}${f.line ? ':' + f.line : ''}  ${f.masked}  fp ${f.fp}`);
    if (warn.length > 12) console.error(`  … ${warn.length - 12} more`);
  }
  // A name that carries a credential is kept out of the log; every other label stays readable.
  const withheld = new Set(once.filter(f => f.ref && !f.allowed).map(f => f.line - 1));
  logRun(root, ranges.map((r, i) => withheld.has(i) ? '(ref name withheld)' : r.label), high.length, warn.length);
  if (high.length) {
    console.error(`\nsentry: PUSH BLOCKED — ${high.length} finding(s) that must not reach ${remote}:`);
    for (const f of high) console.error(`  HIGH   ${f.family}/${f.rule}  ${f.path}${f.line ? ':' + f.line : ''}  ${f.masked}  fp ${f.fp}`);
    console.error(`\n  This push has not sent it.`);
    if (high.some(f => f.ref)) console.error(`  A branch or tag name carries it: push it under a clean name. Nothing to rewrite.`);
    if (high.some(f => f.tag)) console.error(`  A tag that has not left is fixed here, no rewrite: delete it (git tag -d), make it again with a clean name and message, push again.`);
    if (high.some(f => !f.tag && !f.ref && f.family !== 'rich')) console.error(`  Taking it out of commits on main is a rewrite, and only Loudon orders one; bring it to him.`);
    if (high.some(f => f.family === 'rich')) console.error(`  A rich-face piece fails the checker: fix it in a new commit, no rewrite (node _ops/rich-face/conform.mjs "<Entry>" shows the table), or add a reviewed exception to _ops/rich-face/conform.json.`);
    console.error(`  A false positive? Add its fp to _ops/sentry/allow.json with a reason, and run the push again.`);
    console.error(`  Going around the gate (git push --no-verify) is Loudon's call alone: it also goes around palace-push and leaves no receipt.`);
    process.exitCode = 1;
  }
}

// The rich check for one pushed ref. Enforced, a check that cannot run refuses the push (the throw
// reaches main's catch); report-only, it says so and the push goes on.
function richRange(root, r, allow) {
  try {
    const out = richGate(root, r.sha, touchedPaths(root, r.rev), allow);
    if (out.ran) console.error(`sentry: rich check — ${out.why}${out.enforce ? '' : ' (report-only: nothing it finds blocks)'}`);
    return out.findings;
  } catch (e) {
    if (richEnforcedAt(root, r.sha)) throw new Error(`the rich check could not run: ${e.message}`);
    console.error(`sentry: the rich check could not run (${e.message}); it is report-only, so the push goes on`);
    return [];
  }
}

function richEnforcedAt(root, sha) {
  try { return !!JSON.parse(execFileSync('git', ['show', `${sha}:_ops/rich-face/conform.json`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })).enforce?.push; }
  catch { return false; }
}

function gitleaksRange(root, rev, allow) {
  if (!hasGitleaks()) return [];
  const dir = mkdtempSync(join(tmpdir(), 'sentry-gate-'));
  try {
    const rp = join(dir, 'r.json');
    execFileSync('gitleaks', ['git', `--log-opts=${rev.join(' ')}`, '--redact=100', '--report-format', 'json', '--report-path', rp,
      '--no-banner', '--exit-code', '0', '--log-level', 'error', root], { stdio: 'ignore' });
    return JSON.parse(readFileSync(rp, 'utf8')).map(g => {
      const fp = fingerprint('gitleaks', g.RuleID, g.Fingerprint);
      return { family: 'secret', rule: `gitleaks:${g.RuleID}`, sev: /generic/.test(g.RuleID) ? 'medium' : 'high', path: g.File,
        line: g.StartLine, masked: '(redacted)', fp, allowed: allow.gitleaks.has(fp) };
    });
  } catch { return []; }
  finally { rmSync(dir, { recursive: true, force: true }); }
}

function logRun(root, labels, high, warn) {
  try {
    appendFileSync(join(heldDir(root), 'gate.log'), `${new Date().toISOString()}\t${remote}\t${labels.join(',')}\thigh=${high}\twarn=${warn}\n`);
  } catch { /* the log is a convenience */ }
}

main().catch(e => {
  console.error(`sentry: PUSH REFUSED — the gate hit an error and could not check this push: ${e.message}`);
  console.error('sentry: fix the gate and run palace-push again. Pushing unchecked (`git push --no-verify`) is Loudon\'s call alone: it goes around palace-push too, so run `node _ops/sentry/sweep.mjs` after.');
  process.exitCode = 1;
});
