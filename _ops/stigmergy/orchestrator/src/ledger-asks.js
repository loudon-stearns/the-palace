// ledger-asks.js — the asks a steward's tuning ledger sends Loudon, and what his answers do.
//
// Decided 2026-10-16 ([[Project Stewardship System]] § What's Decided): lines
// leave a steward's ledger by the steward's proposal and Loudon's adopt, the
// way a plan revision does, and a debt only he can pay goes to the board once
// it has come back three times. Three kinds of ask, each a RESOURCE_REQUEST on
// the TRICKSTER board:
//
//   fold             the steward's: a settled lesson, with the drafted edit to
//                    the page or its design doc. Adopt applies the edit and
//                    marks the item folded (`- folded · … · item N · into …`).
//   let_go           the steward's: a debt no one will pay, with why. Adopt
//                    makes its last word `let go: <why>`.
//   debt_escalation  the orchestrator's: a debt waiting on Loudon seen again
//                    three times, posted once. `done` marks it paid by him,
//                    `let_go` lets it go; anything else leaves it waiting.
//
// The ledger stays append-only except a debt's last word (SCHEMA — Reference
// §6). Every mark names the ask's id in backticks, so an answer is applied
// once, however many cycles read the board after it.

import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { resolveBundleDir } from './entry-paths.js';
import {
  parseDebts, settleDebts, appendLedgerLine, foldedLine, ledgerNamesAsk,
} from './ledger.js';

/** Three `seen again` lines on a debt waiting on Loudon send it to the board. */
export const ESCALATE_AT = 3;

/** The latest answer to every ask on the board: Map request id → grant or deny. */
function answers(board) {
  const m = new Map();
  for (const x of board || []) if (x && (x.type === 'RESOURCE_GRANT' || x.type === 'RESOURCE_DENY') && x.re) m.set(x.re, x);
  return m;
}

/** A debt's key, the same on every cycle: its date, cycle and words. */
export const debtKey = (d) => `${d.date} · ${d.cycle != null ? `cycle ${d.cycle} · ` : ''}${d.text}`;

/**
 * This steward's ledger asks Loudon has answered: [{ ask, answer, request_id,
 * kind, option }], board order. Only fold, let_go and debt_escalation.
 */
export function answeredLedgerAsks(board, home) {
  const ans = answers(board);
  const out = [];
  for (const m of board || []) {
    if (!m || m.type !== 'RESOURCE_REQUEST' || m.from !== home) continue;
    const kind = m.payload && m.payload.kind;
    if (kind !== 'fold' && kind !== 'let_go' && kind !== 'debt_escalation') continue;
    const rid = m.request_id || m.id;
    const a = ans.get(rid);
    if (!a) continue;
    out.push({ ask: m, answer: a, request_id: rid, kind, option: a.type === 'RESOURCE_GRANT' ? (a.payload && a.payload.option_id) || null : null });
  }
  return out;
}

/** A path a fold may edit: the page itself, or a file in its bundle. Else null. */
export function foldTarget(palaceRoot, home, file) {
  const b = resolveBundleDir(palaceRoot, home);
  if (!b || typeof file !== 'string' || !file.trim()) return null;
  const abs = resolve(palaceRoot, file.trim());
  if (abs === b.entryFile) return abs;
  return abs.startsWith(b.bundleDir + sep) ? abs : null;
}

/**
 * Apply a fold's drafted edit: `{ file, find, replace }` replaces text that
 * occurs exactly once; `{ file, append }` adds a paragraph at the end. Returns
 * { ok, file, reason }.
 */
export function applyFoldEdit(palaceRoot, home, edit) {
  if (!edit || typeof edit !== 'object') return { ok: false, reason: 'no edit drafted' };
  const abs = foldTarget(palaceRoot, home, edit.file);
  if (!abs) return { ok: false, reason: `not the page or a file in its bundle: ${edit.file}` };
  if (!existsSync(abs)) return { ok: false, reason: `no such file: ${edit.file}` };
  const rel = relative(palaceRoot, abs);
  const text = readFileSync(abs, 'utf8');
  if (typeof edit.find === 'string' && edit.find) {
    const at = text.indexOf(edit.find);
    if (at < 0) return { ok: false, file: rel, reason: 'the text to replace is not there any more' };
    if (text.indexOf(edit.find, at + 1) >= 0) return { ok: false, file: rel, reason: 'the text to replace is there more than once' };
    writeFileSync(abs, text.slice(0, at) + String(edit.replace ?? '') + text.slice(at + edit.find.length));
    return { ok: true, file: rel };
  }
  if (typeof edit.append === 'string' && edit.append.trim()) {
    appendFileSync(abs, `${text.endsWith('\n\n') ? '' : text.endsWith('\n') ? '\n' : '\n\n'}${edit.append.trim()}\n`);
    return { ok: true, file: rel };
  }
  return { ok: false, file: rel, reason: 'the edit has neither find nor append' };
}

/**
 * Apply every answered ledger ask not yet marked in the ledger. Returns
 * { applied: [{ request_id, kind, outcome }], files: [abs path] } — files the
 * cycle must commit beside the ledger.
 */
export function applyLedgerAnswers({ palaceRoot, home, board, ledgerPath, date }) {
  const applied = [];
  const files = [];
  if (!ledgerPath || !existsSync(ledgerPath)) return { applied, files };
  for (const { ask, answer, request_id: rid, kind, option } of answeredLedgerAsks(board, home)) {
    if (ledgerNamesAsk(readFileSync(ledgerPath, 'utf8'), rid) || ledgerNamesAsk(readFileSync(ledgerPath, 'utf8'), answer.id)) continue;
    const p = ask.payload || {};
    const notes = answer.payload && typeof answer.payload.notes === 'string' ? answer.payload.notes.trim() : '';
    if (kind === 'fold') {
      if (option !== 'adopt') continue;
      const item = String(p.item ?? '').trim() || '?';
      const r = applyFoldEdit(palaceRoot, home, p.edit);
      if (r.ok) {
        files.push(resolve(palaceRoot, r.file));
        appendLedgerLine(ledgerPath, foldedLine({ date, item, into: r.file, by: `adopted \`${rid}\`` }));
        applied.push({ request_id: rid, kind, outcome: `folded item ${item} into ${r.file}` });
      } else {
        appendLedgerLine(ledgerPath, `- fold not applied · ${date} · item ${item} · ${r.reason.replace(/ · /g, ', ')} · \`${rid}\``);
        applied.push({ request_id: rid, kind, outcome: `not applied: ${r.reason}` });
      }
    } else if (kind === 'let_go') {
      if (option !== 'adopt') continue;
      const why = String(p.why || notes || 'no one will pay it').trim();
      const n = settleDebts(ledgerPath, [p.debt], `let go: ${why} (\`${rid}\`)`);
      applied.push({ request_id: rid, kind, outcome: n ? 'let go' : 'no unpaid debt by those words' });
    } else if (kind === 'debt_escalation') {
      const words = [p.debt_text || p.debt].filter(Boolean);
      let n = 0;
      if (option === 'done') n = settleDebts(ledgerPath, words, `paid by Loudon (\`${answer.id}\`)`, { who: 'loudon' });
      else if (option === 'let_go') n = settleDebts(ledgerPath, words, `let go: ${notes || 'Loudon let it go'} (\`${answer.id}\`)`, { who: 'loudon' });
      if (n) applied.push({ request_id: rid, kind, outcome: option === 'done' ? 'paid by Loudon' : 'let go' });
    }
  }
  return { applied, files: [...new Set(files)] };
}

/**
 * The asks a ledger owes the board: one per debt waiting on Loudon that has
 * been seen again ESCALATE_AT times and has no escalation on the board yet
 * (matched by `payload.debt_key`). Never twice for the same debt. Returns the
 * messages, unstamped by health; the caller validates and appends them.
 */
export function escalations({ ledgerText, board, home, sessionId, ts, cycleN = null }) {
  const posted = new Set((board || [])
    .filter((m) => m && m.type === 'RESOURCE_REQUEST' && m.from === home && m.payload && m.payload.kind === 'debt_escalation')
    .map((m) => m.payload.debt_key));
  const out = [];
  for (const d of parseDebts(ledgerText)) {
    if (!d.unpaid || d.who !== 'loudon' || d.seen < ESCALATE_AT) continue;
    const key = debtKey(d);
    if (posted.has(key)) continue;
    posted.add(key);
    const id = `${slug(home)}-debt-${createHash('sha1').update(key).digest('hex').slice(0, 10)}`;
    out.push({
      schema_version: '1.0', id, request_id: id, ts, session_id: sessionId, from: home, to: 'TRICKSTER',
      type: 'RESOURCE_REQUEST', board: 'TRICKSTER',
      payload: {
        kind: 'debt_escalation',
        resource: 'loudon_attention',
        blocking: false,
        decision_topic: `waiting on you: ${d.text}`,
        headline: `Still waiting on you, and seen again ${d.seen} times: ${d.text}`,
        ground: `waiting on Loudon since ${d.cycle != null ? `cycle ${d.cycle}` : d.date} · seen again ${d.seen} times${cycleN != null ? ` · as of cycle ${cycleN}` : ''}`,
        rationale: `Catch-up — ${home}'s steward cycles keep a tuning ledger of what they taught the page and what they left rough. This one is a debt only you can pay, and it has come back ${d.seen} times since cycle ${d.cycle ?? '?'} first left it: "${d.text}". The cycles go on without it, but they keep running into it. Mark it done once you have, let it go if no one will, or leave it waiting.`,
        debt: d.line,
        debt_key: key,
        debt_text: d.text,
        recurrences: d.seen,
        options: [
          { id: 'done', label: 'done — I paid it; the ledger marks it paid by me' },
          { id: 'let_go', label: 'let go — no one will pay it (say why in a note)' },
          { id: 'later', label: 'later — keep it waiting' },
        ],
      },
    });
  }
  return out;
}

const slug = (s) => String(s || 'steward').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'steward';
