// resolve.mjs — the one place a palace file is found from a reference. The live
// rich page (rich-handler.mjs), the fingerprint (fingerprint.mjs) and the public
// build (app/scripts/build-public.mjs) all ask here, so a reference lands on the
// same file, or fails for the same reason, wherever it is read.
//
// The rules (STIGMERGY — spec — rich-face pieces, § "One resolver"):
//   /x     palace-absolute.
//   a/b    beside the .md, then at the palace root, then in the page's bundle.
//   name   in the page's bundle (its top folder, then anywhere under it), then
//          anywhere in the palace, each only if exactly one file has that name.
// The index is `git ls-files`: every tracked file, every new file git does not
// ignore, and, on the live page, the media git ignores: the renders that stay
// on this Mac (Loudon, 2026-10-20: "the rich face can play on a local machine
// if the files are only on the local machine, if public, then they can't
// play"). A tracked file stays reachable even where an ignore rule now matches
// it. Anything else under .gitignore is never reached, and hidden folders are
// never searched. A result must land inside the palace once its symlinks are
// followed, and it is named by where it lands, so an alias (the root's `_`
// @import links) is never a second copy and never leaks into a link.
//
// A file git does not track comes back marked { local: true }, so the page can
// say the public face will not have it. Where a bare name could mean a tracked
// file or a local one, the tracked one wins: the live page and the build then
// land on the same file wherever the build can.
//
// A miss is not an exception: it comes back as { ok: false, reason, label },
// and the label is what the page shows in the figure's place.
//
// The public build asks with { tracked: true }: committed files only. CI builds
// from a clean checkout, so a build on the Mac publishes exactly the files CI's
// would. A file the build cannot publish but this Mac has (new, or ignored) is
// still a miss (reason 'missing', so every caller treats it as one), marked
// { local: true } and labelled "only on this Mac: track it to publish", so the
// author sees why where the box sits; in CI the same figure is a plain miss.

import { execFileSync } from 'node:child_process';
import { realpathSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative, sep, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// The manifest folder a rich face may use when its bundle has no room for one.
const MANIFESTS = '_ops/rich-face/manifests';
// How long one reading of the index is trusted; a miss re-reads it sooner.
const MAX_AGE_MS = 30_000;
const MISS_AGE_MS = 1_000;

const hidden = (rel) => rel.split('/').some((s) => s.startsWith('.'));
const baseOf = (rel) => rel.slice(rel.lastIndexOf('/') + 1);
// The files git ignores that the live page may still serve: sound, video and
// images, what a steward renders. Nothing else git ignores is ever served.
export const LOCAL_MEDIA = /\.(?:wav|wave|aiff?|mp3|ogg|oga|opus|m4a|flac|mp4|m4v|mov|webm|mkv|avi|png|jpe?g|gif|webp|svg)$/i;

/** What the page shows for a failed lookup: one line, in plain words. */
export function labelFor(r) {
  const ref = r.ref || '';
  // A miss in the build that this Mac has: the author can track it.
  if (r.reason === 'missing' && r.local) return `“${ref}” is only on this Mac: track it to publish.`;
  switch (r.reason) {
    case 'ambiguous': return `${r.candidates.length} files are named “${ref}” (${r.candidates.slice(0, 3).join(', ')}${r.candidates.length > 3 ? ', …' : ''}). Give its path to choose one.`;
    case 'outside': return `“${ref}” leads outside the palace, so it is not shown.`;
    case 'hidden': return `“${ref}” is in a hidden folder, so it is not shown.`;
    case 'ignored': return `“${ref}” is ignored by git, so it is not shown.`;
    case 'case': return `No file “${ref}”; the palace has “${r.as}”, which differs in case.`;
    case 'no-index': return `No git index at this palace, so “${ref}” cannot be looked up.`;
    case 'empty': return 'An empty reference names no file.';
    default: return `No file “${ref}”${r.tried && r.tried.length ? ` (looked in ${r.tried.join(', ')})` : ''}.`;
  }
}

const fail = (reason, ref, extra = {}) => {
  const r = { ok: false, reason, ref, ...extra };
  r.label = labelFor(r);
  return r;
};

/**
 * Bind a resolver to a palace root.
 * @param {string} [root] the palace (a git checkout or worktree)
 * @param {{ tracked?: boolean, files?: string[] }} [opts] `tracked`: committed files only (the build); `files` replaces git's index (tests)
 */
export function makeResolver(root = ROOT, opts = {}) {
  const ROOT_ABS = resolve(root);
  let realRoot;
  try { realRoot = realpathSync(ROOT_ABS); } catch { realRoot = ROOT_ABS; }
  let idx = null;
  let onThisMac = null; // the build's live twin, asked only to name why a file can't ship

  const lsFiles = (...which) => execFileSync('git', ['-c', 'core.quotepath=off', 'ls-files', '-z', ...which],
    { cwd: ROOT_ABS, maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8').split('\0').filter(Boolean);

  function load() {
    let list, tracked;
    if (opts.files) { list = opts.files; tracked = new Set(list); }
    else {
      try {
        tracked = new Set(lsFiles('--cached'));
        list = [...tracked];
        if (!opts.tracked) {
          list.push(...lsFiles('--others', '--exclude-standard'));
          // Media git ignores (a whole ignored folder is one line here, and only
          // a path into it reaches what is inside).
          for (const p of lsFiles('--others', '--ignored', '--exclude-standard', '--directory')) if (!p.endsWith('/') && LOCAL_MEDIA.test(p)) list.push(p);
        }
      } catch { list = null; tracked = new Set(); }
    }
    const files = new Set((list || []).filter(Boolean));
    const byName = new Map(), lower = new Map();
    for (const p of files) {
      lower.set(p.toLowerCase(), p);
      if (hidden(p)) continue;
      const b = baseOf(p);
      (byName.get(b) || byName.set(b, []).get(b)).push(p);
    }
    idx = { at: Date.now(), ok: !!list, files, tracked, byName, lower };
    return idx;
  }
  const index = (maxAge = MAX_AGE_MS) => (idx && Date.now() - idx.at < maxAge ? idx : load());

  // Where a file that is there lands, once its symlinks are followed, or why it
  // may not be served. `listed` says the index has it.
  function land(rel, abs, listed) {
    let real, st;
    try { real = realpathSync(abs); st = statSync(real); } catch { return null; }
    if (real !== realRoot && !real.startsWith(realRoot + sep)) return { refused: 'outside' };
    if (!st.isFile()) return null;
    const landed = relative(realRoot, real).split(sep).join('/');
    const { files, tracked } = index();
    const at = (p) => ({ path: p, local: !tracked.has(p) });
    if (landed === rel) return listed ? at(rel) : { path: rel, local: true };
    if (hidden(landed)) return { refused: 'hidden' };
    if (files.has(landed)) return at(landed);
    return !opts.tracked && LOCAL_MEDIA.test(landed) ? { path: landed, local: true } : { refused: 'ignored' };
  }

  // Is `rel` a file the palace keeps? → { path, local } with the path it really
  // lands at, or { refused } naming why not, or null when there is no such file.
  // Membership is exact, case and all: a Mac finds `flocking/x.html` on disk
  // where a Linux build would not, and the two must agree.
  function check(rel) {
    if (rel === '' || rel === '.' || rel === '..' || rel.startsWith('../') || posix.isAbsolute(rel)) return { refused: 'outside' };
    if (hidden(rel)) return { refused: 'hidden' };
    const { files, lower } = index();
    const abs = join(ROOT_ABS, ...rel.split('/'));
    if (!files.has(rel)) {
      if (lower.has(rel.toLowerCase())) return { refused: 'case', as: lower.get(rel.toLowerCase()) };
      if (opts.tracked) return null;
      let st;
      try { st = statSync(abs); } catch { return null; }
      if (!st.isFile()) return null;
      // Ignored and not in the index: inside a folder git ignores whole. A
      // render is served all the same, marked local; anything else is refused.
      return LOCAL_MEDIA.test(rel) ? land(rel, abs, false) : { refused: 'ignored' };
    }
    return land(rel, abs, true);
  }

  const hit = (r) => (r.local ? { ok: true, path: r.path, local: true } : { ok: true, path: r.path });

  // The first candidate that is a kept file; if none is, why not.
  function firstOf(ref, cands) {
    let refused = null;
    const tried = [];
    for (const c of cands) {
      if (tried.includes(c)) continue;
      tried.push(c);
      const r = check(c);
      if (r && r.path) return hit(r);
      if (r && r.refused && !refused) refused = r;
    }
    return refused ? fail(refused.refused, ref, refused.as ? { as: refused.as } : {}) : fail('missing', ref, { tried });
  }

  // The one kept file among `paths`, counting a file reached by two names once.
  // Tracked files are asked first: a local copy of the same name never makes a
  // tracked one ambiguous, so the page lands where the build does.
  function onlyOne(ref, paths) {
    const { tracked } = index();
    let refused = null;
    for (const tier of [paths.filter((p) => tracked.has(p)), paths.filter((p) => !tracked.has(p))]) {
      const found = new Map();
      for (const p of tier) {
        const r = check(p);
        if (r && r.path) found.set(r.path, r);
        else if (r && r.refused && !refused) refused = r.refused;
      }
      if (found.size === 1) return hit([...found.values()][0]);
      if (found.size > 1) return fail('ambiguous', ref, { candidates: [...found.keys()].sort() });
    }
    return refused ? fail(refused, ref) : null;
  }

  function lookup(ref, from) {
    const { ok } = index();
    if (!ok) return fail('no-index', ref);
    if (ref.startsWith('/')) return firstOf(ref, [posix.normalize(ref.replace(/^\/+/, ''))]);
    const bundle = from ? bundleOf(from) : null;
    if (ref.includes('/')) {
      const here = from ? posix.dirname(from) : '.';
      const cands = [posix.normalize(posix.join(here, ref)), posix.normalize(ref)];
      if (bundle) cands.push(posix.normalize(posix.join(bundle, ref)));
      return firstOf(ref, cands);
    }
    if (bundle) {
      const top = check(`${bundle}/${ref}`);
      if (top && top.path) return hit(top);
      const under = onlyOne(ref, (index().byName.get(ref) || []).filter((p) => p.startsWith(bundle + '/')));
      if (under && (under.ok || under.reason === 'ambiguous')) return under;
    }
    return onlyOne(ref, index().byName.get(ref) || []) || fail('missing', ref, { tried: [bundle ? `${bundle}/` : null, 'the palace'].filter(Boolean) });
  }

  /**
   * Where a reference written in the page `from` lands.
   * @param {string} ref  as written, decoded: `/x`, `a/b`, or a bare name
   * @param {string} [from] the palace path of the .md it is written in
   * @returns {{ ok: true, path: string } | { ok: false, reason: string, ref: string, label: string }}
   */
  function resolveRef(ref, from) {
    const r = String(ref ?? '').trim();
    if (!r) return fail('empty', r);
    const f = from ? posix.normalize(String(from).replace(/^\/+/, '')) : null;
    let res = lookup(r, f);
    // A miss may be a file made since the index was read: read it again, once.
    if (!res.ok && res.reason !== 'ambiguous' && idx && Date.now() - idx.at >= MISS_AGE_MS) { load(); res = lookup(r, f); }
    // The build cannot ship a file git does not track; if this Mac has it, say
    // so, so the author knows to track it (`files` is a test's whole palace).
    if (!res.ok && opts.tracked && !opts.files && (res.reason === 'missing' || res.reason === 'case')) {
      onThisMac = onThisMac || makeResolver(ROOT_ABS);
      const here = onThisMac.resolve(r, f);
      if (here.ok) return fail('missing', r, { local: true, path: here.path });
    }
    return res;
  }

  /** The .md an entry name means (any case), when exactly one has it → palace path, or null. */
  function findEntry(name) {
    const want = `${String(name || '').trim()}.md`.toLowerCase();
    if (want === '.md' || want.includes('/')) return null;
    const pick = () => {
      const paths = [];
      for (const [b, ps] of index().byName) if (b.toLowerCase() === want) paths.push(...ps);
      const r = onlyOne(want, paths);
      return r && r.ok ? r.path : null;
    };
    const hit = pick();
    if (hit || !idx || Date.now() - idx.at < MISS_AGE_MS) return hit;
    load();
    return pick();
  }

  /** The bundle a page's references search: its own folder, or, for a face kept inside one (`X/X — scroll.md`), that folder. */
  function bundleOf(mdRel) {
    const dir = posix.dirname(mdRel);
    const stem = baseOf(mdRel).replace(/\.md$/i, '');
    if (dir !== '.' && stem.startsWith(`${baseOf(dir)} — `)) return dir;
    return mdRel.replace(/\.md$/i, '');
  }

  /** The kept files directly in a folder, by name. */
  function filesIn(dirRel) {
    const pre = dirRel + '/';
    const out = [];
    for (const p of index().files) if (p.startsWith(pre) && !p.slice(pre.length).includes('/') && !hidden(p)) out.push(p.slice(pre.length));
    return out.sort();
  }

  /**
   * An entry and what travels with it, all as palace paths:
   * { title, md, bundle (or null), manifest (or null), files: names in the bundle's top folder }.
   */
  function entry(name) {
    const md = findEntry(name);
    if (!md) return null;
    const bundle = md.replace(/\.md$/i, '');
    const title = baseOf(bundle);
    const manifest = [`${bundle}/${title} — rich.json`, `${MANIFESTS}/${title} — rich.json`].map(check).find((r) => r && r.path)?.path || null;
    const files = filesIn(bundle);
    return { title, md, bundle: files.length || [...index().files].some((p) => p.startsWith(bundle + '/')) ? bundle : null, manifest, files };
  }

  /** Is a palace path one git tracks? */
  const isTracked = (rel) => index().tracked.has(rel);

  return { root: ROOT_ABS, resolve: resolveRef, findEntry, entry, bundleOf, filesIn, isTracked, refresh: load, abs: (rel) => join(ROOT_ABS, ...rel.split('/')) };
}
