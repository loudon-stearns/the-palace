// serve-file.mjs — send one file from disk: its type, byte ranges so video and
// audio can seek, and a web page sent as a piece (the kit first in its <head>,
// kit/inject.mjs), whole. Shared by the rich face's handler (rich-handler.mjs)
// and the piece origin (piece-origin.mjs), so a file goes out the same way from
// either; each adds its own headers (the sandbox, the piece's policies).

import { createReadStream } from 'node:fs';
import { extname, relative } from 'node:path';
import { isPiecePage, pieceBytes } from './kit/inject.mjs';

export const CT = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.flac': 'audio/flac',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.wasm': 'application/wasm',
  '.csv': 'text/csv; charset=utf-8', '.tsv': 'text/tab-separated-values; charset=utf-8',
};

export const contentTypeOf = (file) => CT[extname(file).toLowerCase()] || 'application/octet-stream';

const plain = (res, status, text) => {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(text);
};

/**
 * Answer a GET or HEAD with the file at `file` (already checked by the caller).
 * @param {object} o
 * @param {number} o.size       the file's size from its stat
 * @param {string} o.root       the folder names are reported against in an error
 * @param {boolean} [o.piece]   a web page goes out as a piece, kit injected
 * @param {object} [o.headers]  added to every answer that sends the file
 */
export function serveFile(req, res, file, { size, root, piece = false, headers: extra = {} }) {
  const headers = { 'Content-Type': contentTypeOf(file), 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store', ...extra };
  // A palace web page goes out as a piece, the kit first in its <head>
  // (kit/inject.mjs): whole, never as a byte range.
  if (piece && isPiecePage(file)) {
    let body;
    try { body = pieceBytes(file); } catch (e) { plain(res, e.code === 'ENOENT' ? 404 : 403, 'cannot read: ' + relative(root, file)); return; }
    delete headers['Accept-Ranges'];
    headers['Content-Length'] = body.length;
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
    return;
  }
  const range = req.headers.range && req.headers.range.match(/bytes=(\d*)-(\d*)/);
  let status = 200, opts;
  if (range) {
    const start = range[1] === '' ? size - parseInt(range[2], 10) : parseInt(range[1], 10);
    let end = range[1] !== '' && range[2] !== '' ? parseInt(range[2], 10) : size - 1;
    if (!(start >= 0) || start >= size || end < start) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); res.end(); return; }
    end = Math.min(end, size - 1);
    status = 206; opts = { start, end };
    Object.assign(headers, { 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
  } else headers['Content-Length'] = size;
  // HEAD answers from the stat alone and never opens the file.
  if (req.method === 'HEAD') { res.writeHead(status, headers); res.end(); return; }
  // Answer only once the file is open: one that went missing since the stat,
  // or that can't be read, gets an honest status instead of a half-sent 200,
  // and a stream error is always handled here — never an uncaught 'error'.
  const stream = createReadStream(file, opts);
  stream.on('open', () => { res.writeHead(status, headers); stream.pipe(res); });
  stream.on('error', (e) => {
    if (res.headersSent) { res.destroy(); return; }
    plain(res, e.code === 'ENOENT' ? 404 : 403, 'cannot read: ' + relative(root, file));
  });
  res.on('close', () => stream.destroy());
}
