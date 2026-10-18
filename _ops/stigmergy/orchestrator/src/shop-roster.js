// shop-roster.js — a cycle that changes a Shop page keeps The Shop's roster current (2026-10-18).
//
// The roster in `The Shop.md` is a generated block, between `<!-- ROSTER:START`
// and `<!-- ROSTER:END -->`, rendered by Shop/Maker/build-roster.mjs from each
// Specialist's `member-of [[The Shop]]` link and `status`. Run by hand, it went
// stale more than once (Shop/Maker.md § Roster). Since the Shopkeeper writes
// Shop pages as an elder (its manifest's `grown_up_for: ["Shop"]`), a cycle
// whose vetted page edits touch a page directly under Shop/ reruns the builder,
// and when the block changed, The Shop.md rides the cycle's commit as
// machinery, not as a page edit.
//
// The Shop.md itself stays outside every steward's reach: its body holds
// judgment calls (The Current Bet, Lost Branches). So this step may change the
// block and nothing else. It refuses, and leaves The Shop.md as it found it,
// when the file has uncommitted changes outside the block (committing it would
// carry them in under the roster's name), when the committed file has no block
// to fill (the builder would add a section of its own), when the builder
// changes anything outside the block, or when the builder fails.
//
// The builder is a Shop file, so the Shopkeeper may edit it. Running it gives a
// steward nothing it lacks (a steward's worker already runs with every tool),
// but an edited builder could write anything it liked inside the block, which
// would then ride as machinery. So the step runs only a builder git already
// holds: one with uncommitted changes is refused, and the roster waits for the
// cycle after the builder's change is committed (the Concierge's read,
// 2026-10-18). The body lists the block lines that changed, since the drift a
// cycle commits may be older than the cycle (two Makers moved into Shop/ on
// 2026-10-12 and nobody re-ran the builder).

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

export const SHOP_HUB = 'The Shop.md';
export const ROSTER_BUILDER = 'Shop/Maker/build-roster.mjs';
const START = '<!-- ROSTER:START';
const END = '<!-- ROSTER:END -->';

/** The vetted page edits that can move the roster: the builder reads only the pages directly under Shop/. */
export function rosterTriggers(pageEdits) {
  return [...new Set((pageEdits || []).map((e) => e && e.path).filter((p) => typeof p === 'string' && /^Shop\/[^/]+\.md$/.test(p)))];
}

/** The hub's text with the roster block cut out, or null when the block's markers are not both there, in order. */
export function outsideRoster(text) {
  const t = String(text ?? '');
  const si = t.indexOf(START);
  if (si < 0) return null;
  const ei = t.indexOf(END, si);
  if (ei < 0) return null;
  return t.slice(0, si) + t.slice(ei + END.length);
}

/** The block's lines: what it is, as a list, for saying what changed. */
function blockLines(text) {
  const t = String(text ?? '');
  const si = t.indexOf(START);
  const ei = si < 0 ? -1 : t.indexOf(END, si);
  if (ei < 0) return [];
  return t.slice(si, ei).split('\n').slice(1).filter((l) => l.trim());
}

const gitOpts = (root) => ({ cwd: root, encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_LITERAL_PATHSPECS: '1' }, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 });

// The hub as HEAD holds it, or null when git has no such file there.
function committedText(root, exec) {
  try { return exec('git', ['show', `HEAD:./${SHOP_HUB}`], gitOpts(root)); } catch { return null; }
}

// True when git holds the builder exactly as it sits on disk; false when it is
// changed, untracked, or git cannot say.
function builderCommitted(root, rel, exec) {
  try { return String(exec('git', ['status', '--porcelain', '--', rel], gitOpts(root))).trim() === '' && exec('git', ['ls-files', '--', rel], gitOpts(root)).trim() !== ''; } catch { return false; }
}

const firstLine = (e) => String((e && (e.stderr || e.message)) || e).trim().split('\n').filter(Boolean).pop() || 'no output';

/**
 * Rerun the Shop roster when this cycle's page edits touched a Shop page.
 * Returns null when none did (nothing ran). Otherwise
 *   { triggers, builder, changed, path, added, removed, refused? }:
 * `changed` with `path` (The Shop.md) when the block moved and only the block
 * did, and `added` / `removed` its lines against HEAD; `refused` with a reason
 * when the step would not, or could not, keep to the block, with The Shop.md
 * left as it was.
 */
export function refreshShopRoster({ palaceRoot, pageEdits = [], builder = ROSTER_BUILDER, exec = execFileSync }) {
  const triggers = rosterTriggers(pageEdits);
  if (!triggers.length) return null;
  const root = resolve(palaceRoot);
  const hub = join(root, SHOP_HUB);
  const script = resolve(root, builder);
  const out = { triggers, builder: relative(root, script), changed: false, path: null, added: [], removed: [] };
  const refuse = (reason) => ({ ...out, refused: reason });

  if (!existsSync(hub)) return refuse(`${SHOP_HUB} is not there`);
  if (!existsSync(script)) return refuse(`the roster builder ${out.builder} is not there`);
  if (!builderCommitted(root, out.builder, exec)) return refuse(`the roster builder ${out.builder} has changes git does not hold yet, and only a committed builder writes the block`);
  const committed = committedText(root, exec);
  if (committed == null) return refuse(`${SHOP_HUB} is not committed, so there is no block to compare against`);
  const keep = outsideRoster(committed);
  if (keep == null) return refuse(`the committed ${SHOP_HUB} has no ROSTER:START … ROSTER:END block, so the builder would add a section of its own`);
  const before = readFileSync(hub, 'utf8');
  if (outsideRoster(before) !== keep) return refuse(`${SHOP_HUB} has uncommitted changes outside the roster block, and committing it would carry them in under the roster's name`);

  const putBack = () => { try { if (readFileSync(hub, 'utf8') !== before) writeFileSync(hub, before); } catch { /* left for a person to see */ } };
  try {
    exec('node', [script], { cwd: root, encoding: 'utf8', env: { ...process.env, PALACE_ROOT: root }, stdio: ['ignore', 'pipe', 'pipe'], timeout: 30_000 });
  } catch (e) {
    putBack();
    return refuse(`the roster builder failed (${firstLine(e)})`);
  }
  const after = readFileSync(hub, 'utf8');
  if (outsideRoster(after) !== keep) {
    putBack();
    return refuse(`the builder changed ${SHOP_HUB} outside the roster block, so the file was put back as it was`);
  }
  if (after === committed) return out;
  const was = blockLines(committed);
  const now = blockLines(after);
  return { ...out, changed: true, path: SHOP_HUB, added: now.filter((l) => !was.includes(l)), removed: was.filter((l) => !now.includes(l)) };
}
