// inject.mjs — put the piece kit (piece.js) into a web page as it is served,
// so every piece carries it without its maker writing a line. One function,
// used by every place the palace serves a page as a piece: STIGMERGY's
// GET /api/file (app/server/api/files.js), the rich face's /rich/<path>
// (rich-handler.mjs) and the public build (app/scripts/build-public.mjs).
// When the piece origin arrives (STIGMERGY — spec — rich-face pieces § 4) it
// injects through here too.

import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const KIT_FILE = fileURLToPath(new URL('./piece.js', import.meta.url));
export const KIT_ATTR = 'data-rich-kit';

// Read per call, cached on the file's mtime, so an edit to the kit shows on
// the next request without restarting a server.
let cache = { mtimeMs: -1, tag: '' };
function kitTag() {
  const { mtimeMs } = statSync(KIT_FILE);
  if (mtimeMs !== cache.mtimeMs) {
    const src = readFileSync(KIT_FILE, 'utf8');
    if (/<\/script/i.test(src)) throw new Error('piece.js must not contain a closing script tag: it is inlined');
    cache = { mtimeMs, tag: `<script ${KIT_ATTR}="1">\n${src}</script>\n` };
  }
  return cache.tag;
}

/** A path served as a piece page: .html or .htm (an .svg is left as it is). */
export function isPiecePage(path) {
  return /\.html?$/i.test(String(path || ''));
}

/**
 * The page with the kit as the first thing in its <head>, so it runs before
 * any of the piece's own scripts. With no <head>, after <html>; with neither,
 * after the doctype (so the page keeps its standards mode); else at the top.
 * A page that already carries the kit is returned unchanged.
 */
export function injectKit(html) {
  const s = String(html);
  if (s.includes(`${KIT_ATTR}=`)) return s;
  const tag = kitTag();
  const at = (m) => (m ? m.index + m[0].length : -1);
  let i = at(/<head(?:\s[^>]*)?>/i.exec(s));
  if (i < 0) i = at(/<html(?:\s[^>]*)?>/i.exec(s));
  if (i < 0) i = at(/^\s*<!doctype[^>]*>/i.exec(s));
  if (i < 0) i = 0;
  return s.slice(0, i) + tag + s.slice(i);
}

/** The page at `abs` on disk, kit injected, as bytes ready to send. */
export function pieceBytes(abs) {
  return Buffer.from(injectKit(readFileSync(abs, 'utf8')), 'utf8');
}
