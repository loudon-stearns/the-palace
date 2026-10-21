// The Sentry's rich check — the piece checker (_ops/rich-face/conform.mjs), run as one of the
// Sentry's checks over every piece a rich face shows: its declaration, what its code needs, its CDN
// pins, its root-absolute URLs, and how the face names its files. Static only: it needs node and
// git, nothing else, the way every Sentry check does. [[STIGMERGY — spec — rich-face pieces]] § 5.
//
//   sweep.mjs            the working tree: what could be committed next
//   pre-push.mjs         the commit being pushed, never the working tree, and only when the push
//                        touches a manifest, grants.json, libs.json, the checker's settings, a face's
//                        entry, a piece a face shows, or a file such a piece declares
//
// Severity: a checker error is `high` only while `enforce.push` is on in _ops/rich-face/conform.json,
// else `medium`; a warning is `low`. So while the checker is report-only the push gate prints and
// never blocks: the Sentry's one tooth stays credentials until Loudon turns this one on.
// If the check cannot run: with enforcement on, the push is refused (fail closed); with it off,
// the run says so and goes on, since a report that could not be made has nothing to enforce.

import { execFileSync } from 'node:child_process';
import { posix } from 'node:path';
import { fingerprint } from './rules.mjs';
import { makeContext, commitContext, checkStatic, RULES, CONFIG_FILE } from '../rich-face/conform.mjs';
import { GRANTS_FILE, SHELF_FILE, readDeclaration, declaredPath } from '../rich-face/contract.mjs';

/** A conform finding as a Sentry finding: family `rich`, a stable fp, the detail shown as written (it carries no secret). */
export function toSentry(f, { enforce, allow }) {
  const sev = f.level === 'error' ? (enforce ? 'high' : 'medium') : 'low';
  const fp = fingerprint(`rich:${f.rule}`, f.piece, f.key);
  return {
    family: 'rich', rule: f.rule, sev, path: f.piece, line: f.line || 0, masked: f.detail,
    fp, vfp: fp, allowed: !!f.allowed || !!allow?.fp?.has(fp), context: RULES[f.rule]?.what || '',
  };
}

const findingsOf = (run) => [...run.faceFindings, ...run.results.flatMap((r) => r.findings)];

/** The working tree's rich faces, for the sweep. */
export function richSweep(root, allow) {
  const ctx = makeContext(root);
  const run = checkStatic(ctx, { all: false });
  const enforce = ctx.config.enforce.push;
  const findings = findingsOf(run).map((f) => toSentry(f, { enforce, allow }));
  const pieces = run.results.length;
  return { findings, meta: { faces: run.faces.length, pieces, enforce,
    summary: `${run.faces.length} rich faces, ${pieces} pieces${enforce ? ', enforced' : ', report-only'}` } };
}

/**
 * The paths a push range changes, deletions included (a piece deleted under a face that still
 * names it is a fault the face now has).
 */
export function touchedPaths(root, rev) {
  const out = execFileSync('git', ['-c', 'core.quotepath=off', 'log', '--format=', '--name-only', '-z', '--no-renames', '-m', ...rev], { cwd: root, maxBuffer: 1 << 30 });
  return [...new Set(out.toString('utf8').split('\0').map((s) => s.trim()).filter(Boolean))];
}

/**
 * The rich check for one pushed ref: the commit `sha`, the paths its range touched.
 * @returns {{ ran: boolean, why: string, findings: object[] }}
 */
export function richGate(root, sha, touched, allow) {
  if (!touched.length) return { ran: false, why: 'nothing touched', findings: [] };
  const { ctx, done } = commitContext(root, sha);
  try {
    const run = checkStatic(ctx, { all: false });
    // What the faces depend on, at this commit (a declared folder: everything under it).
    const dirs = new Set();
    const watched = new Set([GRANTS_FILE, SHELF_FILE, CONFIG_FILE]);
    for (const f of run.faces) { if (f.md) watched.add(f.md); if (f.manifest) watched.add(f.manifest); }
    for (const r of run.results) {
      watched.add(r.path);
      let decl = null; try { decl = readDeclaration(ctx.read(r.path)); } catch { /* unread */ }
      for (const file of decl?.files || []) { const rel = declaredPath(r.path, file); if (rel) (rel.endsWith('/') ? dirs : watched).add(rel); }
    }
    // A name a face holds that no longer resolves (a piece deleted or moved
    // under it) is watched by that name, so the push that broke it is seen.
    const lost = new Set(run.faceFindings.filter((f) => f.rule === 'ref-missing').map((f) => posix.basename(f.key)));
    const hit = touched.filter((p) => watched.has(p) || [...dirs].some((d) => p.startsWith(d)) || lost.has(posix.basename(p)) || / — rich\.json$/.test(p));
    if (!hit.length) return { ran: false, why: 'the push touches no rich face', findings: [] };
    const enforce = ctx.config.enforce.push;
    return { ran: true, why: `touches ${hit.length} file(s) a rich face depends on`, enforce, findings: findingsOf(run).map((f) => toSentry(f, { enforce, allow })) };
  } finally { done(); }
}
