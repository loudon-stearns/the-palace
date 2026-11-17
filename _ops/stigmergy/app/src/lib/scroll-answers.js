// scroll-answers.js — Loudon's answers on a scroll, as text. Pure: no DOM, no
// fs, so the scroll view, the server's answer door and the tests share it.
//
// A trail section that shows him something ends in a question only his ear or
// eye can answer (Shop/Maker.md § Testing and Improving a Specialist). He
// answers it in place, and the answer is kept in the section itself, beside
// the proof, as one marked block before the section's footer:
//
//   <!-- scroll:answer by="Loudon" date="2026-11-17" at="<iso>" files="<path>=<sha12>;…" -->
//   **Heard.** Loudon, 2026-11-17: "his words"
//   - pick · `walk-twenty-steps.m4a`
//   - flag · `walk-one-step-repeated.m4a` — "his note on that file"
//   <!-- /scroll:answer -->
//
// The block is the one source of truth. The ledger line, the board note and
// the commit are delivered from it by the server (server/scroll-answer.js).
// Nothing is deleted: a second answer is a second block, and the newest counts.
// `files` is what each of the section's files was when he answered (the first
// 12 hex of its SHA-256), so an answer about a file since remade can say so.

const ANSWER_RE = /<!--\s*scroll:answer\b([^>]*?)-->\n?([\s\S]*?)<!--\s*\/scroll:answer\s*-->\n?/g;
const ATTR_RE = /(\w+)="([^"]*)"/g;
const MARK_KINDS = ['pick', 'flag', 'note'];
const AUDIO = /\.(wav|mp3|ogg|m4a|flac)$/i;
const VIDEO = /\.(mp4|webm|mov|m4v)$/i;

const oneLine = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
// Inside the block his words sit in straight double quotes, so his own become single.
const quoted = (s) => `"${oneLine(s).replace(/"/g, "'")}"`;
const baseOf = (p) => String(p || '').split('/').pop();

/** heard · seen · heard and seen, from what the section's files are. */
export function senseOf(paths) {
  const list = (paths || []).map(String);
  const video = list.some((p) => VIDEO.test(p));
  const audio = list.some((p) => AUDIO.test(p));
  const visual = list.some((p) => !AUDIO.test(p) && !VIDEO.test(p));
  if (video || (audio && visual)) return 'heard and seen';
  if (audio) return 'heard';
  return 'seen';
}

const stripBold = (s) => oneLine(s).replace(/^\*\*\s*/, '').replace(/\s*\*\*$/, '').replace(/\*\*/g, '').trim();

/**
 * The question a section asks, in its own words, or null. The forms the
 * palace writes, in the order tried:
 *   The question: **…**            The question for your eye: …
 *   **The question for Loudon: …** **A question for your eye and ear.** …
 *   What only an ear can say: …    (the bench's `present`)
 *   a paragraph that is all bold and ends in a question mark
 */
export function findQuestion(body) {
  const lines = String(body || '').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    let m = /(?:\bThe|\bA) question(?: for [^:.*\n]{1,40})?\s*[:.]\s*\**\s*(.+)$/i.exec(line);
    if (!m) m = /What only an? [^:\n]{1,30} can say:\s*(.+)$/i.exec(line);
    if (m && stripBold(m[1])) return stripBold(m[1]);
  }
  for (const raw of lines) {
    const line = raw.trim();
    if (/^\*\*[^*].*\?\s*\*\*$/.test(line)) return stripBold(line);
  }
  return null;
}

/** True when the section says no one has heard or seen what it shows. */
export function saysUnheard(body) {
  return /\bnobody\b[^.\n]{0,60}\bhas\b[^.\n]{0,20}\b(heard|seen|watched|played|looked)/i.test(String(body || ''));
}

/** True when the prose itself records that the piece was heard or seen (the bench's own lines). */
export function saidInProse(body) {
  const t = String(body || '');
  return /^\*\*(Heard|Seen|Heard and seen)\.\*\*/im.test(t) || /\bAll \d+ have been (heard|seen)/i.test(t) || /\bIt has been (heard|seen)\b/i.test(t);
}

function parseFiles(attr) {
  const out = {};
  for (const part of String(attr || '').split(';')) {
    const eq = part.lastIndexOf('=');
    if (eq <= 0) continue;
    let path = part.slice(0, eq);
    try { path = decodeURIComponent(path); } catch { /* as written */ }
    out[path] = part.slice(eq + 1);
  }
  return out;
}

function parseBlock(attrText, inner) {
  const attrs = {};
  let a;
  ATTR_RE.lastIndex = 0;
  while ((a = ATTR_RE.exec(attrText)) !== null) attrs[a[1]] = a[2];
  let sense = null, words = '';
  const marks = [];
  for (const raw of String(inner).split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const head = /^\*\*(Heard and seen|Heard|Seen)\.\*\*\s*[^:]*:\s*"(.*)"\s*$/i.exec(line)
      || /^\*\*(Heard and seen|Heard|Seen)\.\*\*\s*(.*)$/i.exec(line);
    if (head && sense === null) {
      sense = head[1].toLowerCase();
      words = /"\s*$/.test(line) && head[2] != null ? head[2] : '';
      continue;
    }
    const mk = /^-\s*(pick|flag|note)\s*·\s*`([^`]+)`(?:\s*—\s*"(.*)")?\s*$/.exec(line);
    if (mk) marks.push({ kind: mk[1], file: mk[2], note: mk[3] || '' });
  }
  return { by: attrs.by || null, date: attrs.date || null, at: attrs.at || null, sense, words, marks, files: parseFiles(attrs.files) };
}

/**
 * Split a section's body into its prose and the answers left in it:
 * { body, answers } — answers in file order, so the last is the newest.
 */
export function parseAnswers(body) {
  const answers = [];
  ANSWER_RE.lastIndex = 0;
  const rest = String(body || '').replace(ANSWER_RE, (_, attrs, inner) => { answers.push(parseBlock(attrs, inner)); return ''; });
  return { body: rest.replace(/\n{3,}/g, '\n\n').trim(), answers };
}

/** Marks as kept: known kinds only, a file each, notes on one line; a `note` mark needs words. */
export function cleanMarks(marks) {
  const out = [];
  for (const m of Array.isArray(marks) ? marks : []) {
    if (!m || !MARK_KINDS.includes(m.kind) || typeof m.path !== 'string' || !m.path.trim()) continue;
    const note = oneLine(m.note);
    if (m.kind === 'note' && !note) continue;
    out.push({ kind: m.kind, path: m.path.trim(), note });
  }
  return out;
}

/** The block as written into the section. `files` is { palacePath: sha12 }. */
export function formatAnswerBlock({ by = 'Loudon', date, at, sense, words, marks = [], files = {} }) {
  const fileAttr = Object.entries(files).map(([p, h]) => `${encodeURIComponent(p)}=${h}`).join(';');
  const head = `**${sense.charAt(0).toUpperCase()}${sense.slice(1)}.** ${by}, ${date}${oneLine(words) ? `: ${quoted(words)}` : ', marks only'}`;
  const lines = [`<!-- scroll:answer by="${by}" date="${date}"${at ? ` at="${at}"` : ''} files="${fileAttr}" -->`, head];
  for (const m of marks) lines.push(`- ${m.kind} · \`${baseOf(m.path)}\`${m.note ? ` — ${quoted(m.note)}` : ''}`);
  lines.push('<!-- /scroll:answer -->');
  return lines.join('\n');
}

/**
 * Write a block into one section of a scroll's text, after everything the
 * section says and before its `<sub>` footer. Every other byte is kept.
 * Returns the new text, or null when the section is not there.
 */
export function insertAnswer(scrollText, sectionId, block) {
  const text = String(scrollText);
  const open = new RegExp(`<!--\\s*scroll:entry id="${String(sectionId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*-->`);
  const o = open.exec(text);
  if (!o) return null;
  const closeRe = /<!--\s*\/scroll:entry\s*-->/g;
  closeRe.lastIndex = o.index + o[0].length;
  const c = closeRe.exec(text);
  if (!c) return null;
  const inner = text.slice(o.index + o[0].length, c.index);
  const trimmed = inner.replace(/\s+$/, '');
  const lines = trimmed.split('\n');
  let footer = '';
  if (lines.length && /^<sub>.*<\/sub>$/.test(lines[lines.length - 1].trim())) footer = lines.pop();
  const head = lines.join('\n').replace(/\s+$/, '');
  const next = `${head}\n\n${block}\n${footer ? `\n${footer}\n` : ''}`;
  return text.slice(0, o.index + o[0].length) + next + text.slice(c.index);
}

/** The folder a section's files share, as the proof's name; else the section id. */
export function proofName(sectionId, paths) {
  const dirs = [...new Set((paths || []).map((p) => String(p).split('/').slice(0, -1).join('/')))];
  return dirs.length === 1 && dirs[0] ? `${dirs[0]}/` : String(sectionId);
}

/**
 * The tuning-ledger line, in the Maker's form:
 *   - heard by Loudon · <date> · <proof> · "<his words>" · owed a review
 * His marks ride inside the quoted words, so the line stays one line.
 */
export function ledgerLine({ by = 'Loudon', date, sense, proof, words, marks = [] }) {
  const said = [oneLine(words), ...marks.map((m) => `${m.kind} ${baseOf(m.path)}${m.note ? `: ${oneLine(m.note)}` : ''}`)].filter(Boolean).join(' · ');
  return `- ${sense} by ${by} · ${date} · \`${proof}\` · ${quoted(said)} · owed a review`;
}

/**
 * Where a section stands, for the count and the card:
 *   null       — nothing here asks him anything
 *   'waiting'  — it asks, and he has not answered
 *   'earlier'  — he answered, and a file has been remade since
 *   'answered' — his newest answer is about the files as they are
 * `current` is { palacePath: sha12 } for the files as they are now; a path it
 * does not name is taken as unchanged, so a reader with no hashes never cries wolf.
 */
export function sectionState({ id, body, artifacts = [] }, current = null) {
  if (!id) return null;
  const { body: prose, answers } = parseAnswers(body);
  // Only a section that shows him something waits on him: a written list of
  // open tests names questions without putting anything in front of him.
  const unheard = saysUnheard(prose);
  const asks = artifacts.length > 0 && (!!findQuestion(prose) || unheard);
  if (answers.length === 0) {
    if (!asks) return null;
    // A verdict already written into the prose, by the bench's `present` or by
    // hand, stands as an answer unless the section still says someone has not heard.
    return saidInProse(prose) && !unheard ? 'answered' : 'waiting';
  }
  const stale = staleFiles(answers[answers.length - 1], current);
  return stale.length ? 'earlier' : 'answered';
}

/** The files an answer was about that are no longer what they were. */
export function staleFiles(answer, current) {
  if (!answer || !current) return [];
  return Object.entries(answer.files || {}).filter(([p, h]) => Object.prototype.hasOwnProperty.call(current, p) && current[p] !== h).map(([p]) => p);
}

/** { waiting, answered } over a scroll's sections; 'earlier' counts as waiting. */
export function countStates(states) {
  let waiting = 0, answered = 0;
  for (const s of states) { if (s === 'waiting' || s === 'earlier') waiting++; else if (s === 'answered') answered++; }
  return { waiting, answered };
}
