// server/request-guard.js — the doors in front of every palace route.
//
// STIGMERGY listens on loopback, but the browser on this Mac visits the whole
// web, and any page it loads can aim a request at localhost:5173. Two checks run
// before an api/ family sees a request under /api/ or /rich/:
//
// 1. Host. A DNS-rebinding page reaches the server under its own name. Vite's
//    host check sits behind this plugin's middleware, so it never sees these
//    routes; this one does. Allowed, as Vite allows them: IP literals, localhost
//    and *.localhost, and whatever `server.allowedHosts` names.
// 2. Actions from anywhere but this server's own pages. A write (POST, PUT,
//    PATCH, DELETE) must carry `application/json` — a type another page can send
//    only after a CORS preflight — and must come from this exact origin: a
//    browser's Origin, when it sends one, is this server's scheme and the very
//    host:port in the Host header, and its Sec-Fetch-Site, when it sends one, is
//    `same-origin`. Another port on this Mac is another origin: a page on
//    localhost:5174 is loopback, and the browser marks its request `same-site`,
//    not `same-origin`, so it is refused. GET /api/open runs `open` on this Mac
//    and takes the same rule. A preflight (OPTIONS) is refused with no CORS
//    headers, so neither this server nor Vite behind it ever clears another
//    origin to send. Other reads stay open: sandboxed artifacts load their media
//    that way, and the browser will not let another origin read the answer.
//
// Callers that are not browsers (curl, node's fetch, the eval server) send no
// Origin and no Sec-Fetch-Site, and pass.
//
// The standalone rich face (_ops/rich-face/rich-server.mjs) answers at /, so
// every path it serves is a palace route; it runs the same two checks on all of
// them through checkRequest, rather than keeping a copy of the rule.

import { isIP } from 'node:net';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const ACTION_GETS = new Set(['/api/open']);

export function isGuardedPath(urlPath) {
  return urlPath.startsWith('/api/') || urlPath === '/rich' || urlPath.startsWith('/rich/');
}

// The hostname in a Host header or URL host: lower-cased, port and IPv6
// brackets removed.
export function hostnameOf(host) {
  const h = String(host || '').trim().toLowerCase();
  if (h.startsWith('[')) return h.slice(1, h.indexOf(']') === -1 ? undefined : h.indexOf(']'));
  const colon = h.indexOf(':');
  return colon === -1 ? h : h.slice(0, colon);
}

/**
 * Is this Host header one the server answers to? Mirrors Vite's own rule.
 * @param {string|undefined} host — the raw Host header
 * @param {true|string[]|undefined} allowedHosts — Vite's `server.allowedHosts`
 */
export function isHostAllowed(host, allowedHosts) {
  if (host === undefined || host === '') return true; // HTTP/1.0 or a non-browser client
  if (allowedHosts === true) return true;
  const name = hostnameOf(host);
  if (isIP(name)) return true; // a rebinding attack needs a name, not an address
  if (name === 'localhost' || name.endsWith('.localhost')) return true;
  for (const entry of Array.isArray(allowedHosts) ? allowedHosts : []) {
    const e = String(entry).toLowerCase();
    if (e.startsWith('.') ? (name === e.slice(1) || name.endsWith(e)) : name === e) return true;
  }
  return false;
}

// Did this come from one of this server's own pages, or from no browser at all?
function isFromOwnOrigin(req) {
  const site = req.headers['sec-fetch-site'];
  if (site !== undefined && site !== 'same-origin') return false; // same-site (another port), cross-site, none
  const origin = req.headers.origin;
  if (origin === undefined) return true;
  let parsed;
  try { parsed = new URL(origin); } catch { return false; } // "null" (sandboxed, file://) and garbage
  const scheme = req.socket?.encrypted ? 'https:' : 'http:';
  return parsed.protocol === scheme && parsed.host === String(req.headers.host || '').trim().toLowerCase();
}

function mediaType(req) {
  return String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
}

function refuse(res, status, error) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error }));
}

/**
 * Check a request before any api/ family sees it.
 * @returns {boolean} true if it refused (the response is sent), false to go on.
 */
export function guardRequest(req, res, { urlPath, method, allowedHosts }) {
  if (!isGuardedPath(urlPath)) return false;
  return checkRequest(req, res, { urlPath, method, allowedHosts });
}

/**
 * The two checks, on any path: a foreign Host, and an action from another origin
 * or a write that is not JSON.
 * @returns {boolean} true if it refused (the response is sent), false to go on.
 */
export function checkRequest(req, res, { urlPath, method, allowedHosts }) {
  if (!isHostAllowed(req.headers.host, allowedHosts)) {
    refuse(res, 403, 'host not allowed — STIGMERGY answers to localhost only (server.allowedHosts widens it)');
    return true;
  }

  if (method === 'OPTIONS') {
    refuse(res, 403, 'no preflight is answered — STIGMERGY takes actions only from its own origin');
    return true;
  }
  const isWrite = WRITE_METHODS.has(method);
  if ((isWrite || ACTION_GETS.has(urlPath)) && !isFromOwnOrigin(req)) {
    refuse(res, 403, 'request from another origin refused — STIGMERGY takes actions only from its own origin, not another port or site');
    return true;
  }
  if (isWrite && mediaType(req) !== 'application/json') {
    refuse(res, 415, 'a write must be sent as application/json');
    return true;
  }
  return false;
}
