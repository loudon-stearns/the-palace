#!/usr/bin/env node
// palace-push -- the one way the palace leaves this Mac, on Loudon's word.
//
//   node _ops/stigmergy/app/scripts/palace-push.mjs
//       Shows what is waiting: how many commits, by kind, which projects the
//       stewards touched, how old the oldest is, and the tip. Changes nothing.
//       It ends with the exact command that sends that tip.
//
//   node _ops/stigmergy/app/scripts/palace-push.mjs --tip <40-character commit id>
//       Sends exactly that commit to origin's main, nothing newer, and only as a
//       fast-forward. The tip must be the full commit id the report printed: a
//       name like main or HEAD moves, and a short id can be shadowed by a branch
//       named like it, so both could send commits Loudon was never shown. The
//       Sentry's pre-push gate runs as on every push and can still refuse. One
//       receipt line records what left: the range, the count by kind, the
//       session, the gate's verdict. The receipt lives in the git common dir
//       (palace-push.jsonl), so it never goes public.
//
// Why two steps: stewards commit every few minutes, so "push main" would send
// commits Loudon was never shown. A pinned tip sends exactly what he saw.
// Steward commits ride along (Loudon, 2026-10-14); the summary names them.
//
// The push runs from the main checkout, so main's own copy of the Sentry's gate
// checks it, whichever checkout asked. Its warnings are passed through.
//
// Exit 0 sent (or nothing to send), 2 refused (including by the Sentry), 1 the
// push failed in transport; after a failure it asks the remote whether the tip
// landed anyway and says so.

import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';

const REMOTE_BRANCH = 'refs/heads/main';

function git(root, args, { allowFail = false } = {}) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  } catch (e) {
    if (allowFail) return null;
    throw e;
  }
}

function fail(code, text) {
  process.stderr.write(text.endsWith('\n') ? text : `${text}\n`);
  process.exit(code);
}

export function parseArgs(argv) {
  const opts = { tip: null, remote: 'origin', unknown: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--tip' || a === '--remote') {
      const v = argv[++i];
      if (!v || v.startsWith('-')) { opts.unknown.push(`${a} (no value)`); continue; }
      if (a === '--tip') opts.tip = v; else opts.remote = v;
    } else opts.unknown.push(a);
  }
  return opts;
}

export const FULL_SHA = /^[0-9a-f]{40}$/;

// Where the remote's main is now: asked of the remote itself, falling back to
// the last-fetched tracking ref when the remote cannot be reached.
export function remoteMain(root, remote) {
  const live = git(root, ['ls-remote', remote, REMOTE_BRANCH], { allowFail: true });
  // ls-remote matches by tail (refs/heads/archive/refs/heads/main would match
  // too), so take only the exact ref.
  const m = live && /^([0-9a-f]{40})\trefs\/heads\/main$/m.exec(live);
  if (m) return { sha: m[1], live: true };
  if (live !== null && live !== undefined) return { sha: null, live: true, none: true };
  const tracked = git(root, ['rev-parse', '-q', '--verify', `refs/remotes/${remote}/main`], { allowFail: true });
  return tracked ? { sha: tracked.trim(), live: false } : { sha: null, live: false };
}

// What a range holds, read from the subjects: count by kind, steward projects.
export function summarize(root, from, to) {
  const range = from ? `${from}..${to}` : to;
  const rows = (git(root, ['log', '--format=%ct%x09%s', range]) || '').split('\n').filter(Boolean);
  const byKind = {};
  const stewards = {};
  let oldest = null;
  for (const row of rows) {
    const [ct, subject] = row.split('\t');
    const t = Number(ct) * 1000;
    if (oldest === null || t < oldest) oldest = t;
    const m = /^([a-z][a-z-]*)(?:\(([^)]*)\))?:/.exec(subject || '');
    const kind = m ? m[1] : 'other';
    byKind[kind] = (byKind[kind] || 0) + 1;
    if (kind === 'steward' && m[2]) stewards[m[2]] = (stewards[m[2]] || 0) + 1;
  }
  const short = (git(root, ['diff', '--shortstat', from || '4b825dc642cb6eb9a060e54bf8d69288fbee4904', to], { allowFail: true }) || '').trim();
  return { count: rows.length, byKind, stewards, oldest, short };
}

function describe(sum) {
  const kinds = Object.entries(sum.byKind).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ');
  const st = Object.entries(sum.stewards).sort((a, b) => b[1] - a[1]).map(([p, n]) => `${p} (${n})`).join(', ');
  return { kinds, st };
}

function age(ms) {
  if (ms === null) return 'n/a';
  const h = (Date.now() - ms) / 3600000;
  return h < 1 ? `${Math.round(h * 60)} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} days`;
}

function ownerOf(root) {
  return dirname(resolve(root, git(root, ['rev-parse', '--git-common-dir']).trim()));
}

// The Sentry logs each gate run under the MAIN checkout (_ops/sentry/held).
// Only a line written after this push started, for this remote and for main,
// is this push's verdict; otherwise there is none.
function gateVerdictSince(owner, startedAt, remote) {
  const log = join(owner, '_ops', 'sentry', 'held', 'gate.log');
  if (!existsSync(log)) return null;
  const lines = readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).reverse();
  for (const line of lines) {
    const f = line.split('\t');
    const ts = Date.parse(f[0]);
    if (!Number.isFinite(ts) || ts < startedAt) return null;
    if (f[1] === remote && String(f[2] || '').includes(REMOTE_BRANCH)) return `${f[3] || ''} ${f[4] || ''}`.trim();
  }
  return null;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.unknown.length) fail(2, `palace-push: unknown argument ${opts.unknown.join(', ')}. Nothing was sent.`);
  const root = process.env.PALACE_ROOT ? resolve(process.env.PALACE_ROOT) : resolve(git(process.cwd(), ['rev-parse', '--show-toplevel']).trim());
  const owner = ownerOf(root);
  const main = git(root, ['rev-parse', 'refs/heads/main']).trim();
  const remote = remoteMain(root, opts.remote);
  if (remote.none) fail(2, `palace-push: ${opts.remote} has no main branch. Nothing was sent.`);
  if (!remote.sha) fail(2, `palace-push: cannot tell where ${opts.remote}'s main is (no answer from the remote and no tracking ref). Nothing was sent.`);

  if (!opts.tip) {
    if (remote.sha === main || git(root, ['merge-base', '--is-ancestor', main, remote.sha], { allowFail: true }) !== null) {
      process.stdout.write(`palace-push: nothing is waiting; ${opts.remote}'s main already has main (${main.slice(0, 8)}).\n`);
      process.exit(0);
    }
    if (git(root, ['merge-base', '--is-ancestor', remote.sha, main], { allowFail: true }) === null) {
      fail(2, `palace-push: ${opts.remote}'s main (${remote.sha.slice(0, 8)}) has commits main does not; this would not be a fast-forward. Nothing was sent. Find out what reached ${opts.remote} from elsewhere before pushing.`);
    }
    const sum = summarize(root, remote.sha, main);
    const { kinds, st } = describe(sum);
    const subject = git(root, ['log', '-1', '--format=%s', main]).trim();
    process.stdout.write([
      `Waiting to leave for ${opts.remote}${remote.live ? '' : ' (as last fetched; the remote did not answer)'}: ${sum.count} commit${sum.count === 1 ? '' : 's'}, the oldest ${age(sum.oldest)} old.`,
      `  by kind: ${kinds}`,
      st ? `  stewards touched: ${st}` : '  stewards touched: none',
      sum.short ? `  ${sum.short}` : '',
      `  tip: ${main.slice(0, 8)} ${subject.length > 90 ? `${subject.slice(0, 87)}...` : subject}`,
      '',
      'On Loudon\'s word, send exactly this tip:',
      `  node _ops/stigmergy/app/scripts/palace-push.mjs --tip ${main}${opts.remote === 'origin' ? '' : ` --remote ${opts.remote}`}`,
      '',
    ].filter((l) => l !== '').join('\n') + '\n');
    process.exit(0);
  }

  if (!FULL_SHA.test(opts.tip)) {
    fail(2, `palace-push: --tip must be the full 40-character commit id the report printed, not "${opts.tip}". A name like main moves, and a short id can be shadowed by a branch. Nothing was sent.`);
  }
  if (git(root, ['cat-file', '-e', `${opts.tip}^{commit}`], { allowFail: true }) === null) {
    fail(2, `palace-push: ${opts.tip} is not a commit here. Nothing was sent.`);
  }
  const tipSha = opts.tip;
  if (git(root, ['merge-base', '--is-ancestor', tipSha, main], { allowFail: true }) === null) {
    fail(2, `palace-push: ${tipSha.slice(0, 8)} is not on main. Only main leaves this Mac. Nothing was sent.`);
  }
  if (tipSha === remote.sha || git(root, ['merge-base', '--is-ancestor', tipSha, remote.sha], { allowFail: true }) !== null) {
    process.stdout.write(`palace-push: ${opts.remote} already has ${tipSha.slice(0, 8)}; nothing to send.\n`);
    process.exit(0);
  }
  if (git(root, ['merge-base', '--is-ancestor', remote.sha, tipSha], { allowFail: true }) === null) {
    fail(2, `palace-push: sending ${tipSha.slice(0, 8)} would not be a fast-forward of ${opts.remote}'s main (${remote.sha.slice(0, 8)}). Nothing was sent.`);
  }

  const startedAt = Date.now();
  // From the main checkout, so main's own gate runs; porcelain, so the range
  // reported is the range that actually moved.
  const r = spawnSync('git', ['push', '--porcelain', opts.remote, `${tipSha}:${REMOTE_BRANCH}`], { cwd: owner, encoding: 'utf8', env: { ...process.env, PALACE_PUSH: '1' } });
  if (r.stderr) process.stderr.write(r.stderr); // the Sentry's warnings, and git's own words
  const gate = gateVerdictSince(owner, startedAt, opts.remote);
  const line = String(r.stdout || '').split('\n').find((l) => l.includes(`:${REMOTE_BRANCH}`)) || '';
  const upToDate = /^=\t/.test(line);
  const moved = /([0-9a-f]{7,40})\.\.([0-9a-f]{7,40})/.exec(line);
  const from = moved ? git(root, ['rev-parse', moved[1]], { allowFail: true })?.trim() || remote.sha : remote.sha;
  let landed = r.status === 0;
  if (r.status !== 0) {
    const after = remoteMain(root, opts.remote);
    landed = after.live && after.sha === tipSha ? true : after.live ? false : null;
  }
  const sum = upToDate ? { count: 0, byKind: {}, stewards: {} } : summarize(root, from, tipSha);
  const gateRefused = r.status !== 0 && (/high=[1-9]/.test(gate || '') || /sentry: PUSH REFUSED|sentry:.*refus/i.test(String(r.stderr || '')));
  const receipt = {
    ts: new Date().toISOString(),
    remote: opts.remote,
    from,
    to: tipSha,
    count: sum.count,
    by_kind: sum.byKind,
    stewards: sum.stewards,
    session: process.env.CLAUDE_CODE_SESSION_ID || null,
    gate,
    ok: r.status === 0,
    landed,
    ...(upToDate ? { up_to_date: true } : {}),
    ...(r.status === 0 ? {} : { error: String(r.stderr || '').trim().slice(-600) }),
  };
  try {
    const common = resolve(root, git(root, ['rev-parse', '--git-common-dir']).trim());
    appendFileSync(join(common, 'palace-push.jsonl'), `${JSON.stringify(receipt)}\n`);
  } catch (_) { /* the push itself already happened or failed; the receipt is a courtesy */ }

  const { kinds } = describe(sum);
  if (r.status !== 0) {
    if (gateRefused) fail(2, `palace-push: the Sentry refused the push (gate ${gate || 'refused'}); nothing was sent. The receipt records it.`);
    if (landed === true) fail(1, `palace-push: git reported an error, but ${opts.remote}'s main is now ${tipSha.slice(0, 8)}: the push landed. The receipt says so.`);
    if (landed === false) fail(1, `palace-push: the push failed; ${opts.remote}'s main is unchanged. The receipt records the failure.`);
    fail(1, `palace-push: the push failed, and ${opts.remote} could not be asked whether it landed. Check before trying again. The receipt records it.`);
  }
  if (upToDate) {
    process.stdout.write(`palace-push: ${opts.remote} already had ${tipSha.slice(0, 8)}; nothing was sent. Receipt written.\n`);
    process.exit(0);
  }
  process.stdout.write(`palace-push: sent ${sum.count} commit${sum.count === 1 ? '' : 's'} (${kinds}) to ${opts.remote}, ${from.slice(0, 8)} to ${tipSha.slice(0, 8)}; gate ${gate || 'did not log'}. Receipt written.\n`);
  process.exit(0);
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('palace-push.mjs');
if (invokedDirectly) main();
