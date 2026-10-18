#!/usr/bin/env node
// The Sentry's daily look at GitHub's guard on main — read-only, a few seconds, run by the heartbeat
// once a day when the Mac is awake (_ops/heartbeat/run-steward-batch.sh).
//
//   node _ops/sentry/guard-watch.mjs
//
// The guard (a ruleset refusing a force push to main and its deletion) is the one protection
// against rewriting main that lives off this Mac, and it comes off on purpose when Loudon closes a
// leak. Anyone who can push as him could also switch it off. So once a day this reads it, the same
// way the hosting check does (sweep.mjs readTrunkGuard), and prints one line.
//
// Exit 0: GitHub refuses a force push to main for everyone who can push (an exception reviewed in
//         allow.json counts as fine).
// Exit 3: a finding of medium or above stands — the heartbeat raises a notification.
// Exit 4: it could not tell (gh missing, offline, rate-limited) — try again later; never a pass.
// Any failure of its own (a malformed allow.json, a module that will not load) is "could not
// tell", exit 4, never a crash the caller would read as a finished look.
process.on('uncaughtException', (e) => { console.log(`sentry guard-watch: could not finish (${e.message.split('\n')[0]}); will look again`); process.exit(4); });
const { repoRoot, git, loadAllow, finding } = await import('./engine.mjs');
const { ghRead, readTrunkGuard } = await import('./sweep.mjs');

const root = repoRoot();
let slug;
try { slug = git(root, ['remote', 'get-url', 'origin']).trim().replace(/^.*github\.com[:\/]/, '').replace(/\.git$/, ''); }
catch { console.log('sentry guard-watch: no origin remote; nothing to watch'); process.exit(4); }
const repo = ghRead(`repos/${slug}`);
if (!repo.ok) { console.log(`sentry guard-watch: could not read ${slug} through gh; will look again`); process.exit(4); }
const guard = readTrunkGuard(slug, repo.body.default_branch ?? null);
const allow = loadAllow();
const open = guard.problems
  .map(p => ({ ...p, allowed: finding('hosting', p.rule, p.sev, slug, 0, `${slug}:main:${p.rule}`, p.context, allow, `${slug}:main:${p.rule}:${p.whoKey ?? ''}`, 'main').allowed }))
  .filter(p => !p.allowed);
const serious = open.filter(p => p.sev === 'medium' || p.sev === 'high');
const unread = open.some(p => p.rule === 'github-trunk-guard-unreadable');
console.log(`sentry guard-watch: ${slug} ${guard.summary}${open.length ? ` — ${open.map(p => `${p.sev} ${p.rule}: ${p.context}`).join('; ')}` : ''}`);
process.exit(serious.length ? 3 : unread ? 4 : 0);
