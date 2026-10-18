// server/api/files.js — read-side file endpoints (open in native app / serve inline).
//   GET /api/open  — open a palace file in its native app (or reveal in Finder)
//   GET /api/file  — stream a palace file for inline rendering

import { existsSync, statSync, createReadStream } from 'node:fs';
import { execFile } from 'node:child_process';
import { jsonResponse, resolveInsidePalace, contentTypeFor } from '../http.js';
import { isPiecePage, pieceBytes } from '../../../../rich-face/kit/inject.mjs';

// Native open command: macOS `open`, otherwise `xdg-open` (Linux).
const OPEN_CMD = process.platform === 'darwin' ? 'open' : 'xdg-open';

export async function filesRoutes(ctx) {
  const { req, res, palaceRoot, urlPath, query, method } = ctx;

  // `open:` links in messages resolve here so a rendered artifact (e.g. a WAV)
  // opens in the OS default app / DAW. Path must be palace-relative; ?reveal=1
  // reveals in Finder instead. Returns 204 so an <a> click fires the open
  // without navigating the BBS away.
  if (urlPath === '/api/open' && method === 'GET') {
    const rel = query.get('path');
    const abs = resolveInsidePalace(palaceRoot, rel);
    if (!abs) {
      jsonResponse(res, 400, { error: 'invalid or missing path (must be palace-relative, no traversal)', path: rel });
      return true;
    }
    if (!existsSync(abs)) {
      jsonResponse(res, 404, { error: 'file not found', path: rel });
      return true;
    }
    const reveal = query.get('reveal') === '1' || query.get('reveal') === 'true';
    execFile(OPEN_CMD, reveal ? ['-R', abs] : [abs], (err) => {
      if (err) {
        jsonResponse(res, 500, { error: 'open failed', detail: err.message });
        return;
      }
      res.statusCode = 204;
      res.end();
    });
    return true; // response owned by the execFile callback
  }

  // The read-side counterpart to the strict write-side validator: lenient about
  // WHAT it serves, strict about WHERE it reads from. The renderer's iframe
  // sandbox is `allow-scripts` only (no allow-same-origin), so served HTML
  // cannot reach STIGMERGY's origin even though it loads from here.
  if (urlPath === '/api/file' && method === 'GET') {
    const rel = query.get('path');
    const abs = resolveInsidePalace(palaceRoot, rel);
    if (!abs) {
      jsonResponse(res, 400, { error: 'invalid or missing path (must be palace-relative, no traversal)', path: rel });
      return true;
    }
    if (!existsSync(abs)) {
      jsonResponse(res, 404, { error: 'file not found', path: rel });
      return true;
    }
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      jsonResponse(res, 400, { error: 'path is a directory, not a file', path: rel });
      return true;
    }
    // A web page goes out as a piece: the piece kit first in its <head>
    // (rich-face/kit), so it sizes its frame, quiets the others when it plays
    // and reports its errors with no line from its maker. Sent whole, never as
    // a byte range, and sandboxed like any active document below.
    if (isPiecePage(abs)) {
      const body = pieceBytes(abs);
      res.statusCode = 200;
      res.setHeader('Content-Type', contentTypeFor(abs));
      res.setHeader('Content-Security-Policy', 'sandbox allow-scripts');
      res.setHeader('Content-Length', String(body.length));
      res.setHeader('Cache-Control', 'no-cache');
      res.end(body);
      return true;
    }
    // Byte ranges (2026-10-13): without them a browser cannot seek inside an
    // <audio>/<video> it has not fully buffered, so a click on the scrubber
    // restarted the file from zero (Loudon's report on the Trickster deck).
    const range = typeof req.headers.range === 'string' ? /^bytes=(\d*)-(\d*)$/.exec(req.headers.range) : null;
    let start = 0, end = stat.size - 1, partial = false;
    if (range && stat.size > 0) {
      if (range[1] !== '') { start = parseInt(range[1], 10); if (range[2] !== '') end = Math.min(parseInt(range[2], 10), stat.size - 1); }
      else if (range[2] !== '') { start = Math.max(0, stat.size - parseInt(range[2], 10)); }
      if (!(start >= 0 && start <= end && start < stat.size)) {
        res.statusCode = 416; res.setHeader('Content-Range', `bytes */${stat.size}`); res.end(); return true;
      }
      partial = true;
    }
    res.statusCode = partial ? 206 : 200;
    res.setHeader('Accept-Ranges', 'bytes');
    if (partial) res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
    res.setHeader('Content-Type', contentTypeFor(abs));
    // An .html or .svg is an active document: whoever opens this URL — an
    // ArtifactSlot frame, a new tab — gets it sandboxed, never with STIGMERGY's
    // origin. The rich face serves its pieces the same way (ACTIVE_SANDBOX).
    if (/\.(?:html?|svg)$/i.test(abs)) res.setHeader('Content-Security-Policy', 'sandbox allow-scripts');
    res.setHeader('Content-Length', String(end - start + 1));
    res.setHeader('Cache-Control', 'no-cache');
    if (req.method === 'HEAD') { res.end(); return true; }
    const stream = partial ? createReadStream(abs, { start, end }) : createReadStream(abs);
    // A mid-stream read error must not crash the dev server. Headers are already
    // sent, so the cleanest recovery is to drop the connection.
    stream.on('error', () => { try { res.destroy(); } catch (_) {} });
    stream.pipe(res);
    return true; // response owned by the stream
  }

  return false;
}
