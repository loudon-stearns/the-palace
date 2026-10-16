#!/usr/bin/env node
// Narration census — 2026-10-15, for the arc-reader baton (Closing Well).
//
// Question: where does a session record keep, in place of the words Claude wrote
// to Loudon between tool calls, a short "thinking" block that paraphrases them?
// Loudon confirmed on 2026-10-15 that the paraphrase is what reached his screen.
//
// The detector is the arc reader's own rule (transcript-reader.mjs § narration),
// structural only — it never reads a block's signature. A NARRATION block is a
// non-empty `thinking` block that either arrived whole in under 200 ms (timing used
// only when its record holds one thinking block), or, with no timing recorded, is
// not the first thinking block of its API message. A block timed at 200 ms or more
// is real thinking wherever it stands.
//
// Counting: a session is a main-session file with at least one user record. Forked
// sessions copy their parent's records, so blocks are also counted once per API
// message id, and a session "has its own" narration only if it holds one no
// earlier session held. "Ran the reader" means a Bash call whose command runs
// transcript-reader.mjs with --distill. Every run prints the time it was taken:
// live sessions keep growing, so a number holds only for its timestamp.
//
// Usage: node narration-census.mjs [--dir <projects dir>] [--json <out>] [--samples <out>]
// Read-only. Main-session records only (isSidechain records skipped).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const argv = process.argv.slice(2);
const flag = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : null; };
const ROOT = flag('dir') || path.join(os.homedir(), '.claude', 'projects');
const FAST_MS = 200;
const thinkingMs = (o, inRecord) => inRecord === 1 && typeof o.thinkingDurationMs === 'number' ? o.thinkingDurationMs : null;
const isNarration = (nth, ms) => (ms !== null ? ms < FAST_MS : nth > 1);

const files = [];
for (const d of fs.readdirSync(ROOT)) {
  const full = path.join(ROOT, d);
  if (!fs.statSync(full).isDirectory()) continue;
  for (const f of fs.readdirSync(full)) if (f.endsWith('.jsonl')) files.push(path.join(full, f));
}

const sessions = [];
const samples = [];
for (const file of files) {
  let raw; try { raw = fs.readFileSync(file, 'utf8'); } catch { continue; }
  const s = {
    file, id: path.basename(file, '.jsonl'), first: null, last: null,
    entrypoints: new Set(), versions: new Set(), models: new Set(), efforts: new Set(),
    text: { tool_use: 0, end_turn: 0, other: 0 },
    narr: { tool_use: 0, end_turn: 0, other: 0 }, narrChars: 0,
    fastNarr: 0, untimedNarr: 0, fastFirst: 0, firstThinkNonEmpty: 0, untimedOpeners: 0, wrapUpNarr: 0,
    narrIds: new Set(),
    closes: [], // record indexes of a distill call (a Closing Well read of an arc)
    narrBeforeFirstClose: 0,
  };
  const seenThinking = new Map(); // message.id → count of thinking blocks so far
  const lines = raw.split('\n');
  let human = false;
  const uuids = new Set();
  for (let i = 0; i < lines.length; i++) {
    let o; try { o = JSON.parse(lines[i]); } catch { continue; }
    if (o.isSidechain === true) continue;
    if (o.uuid) { if (uuids.has(o.uuid)) continue; uuids.add(o.uuid); }
    if (o.timestamp && (o.type === 'user' || o.type === 'assistant')) { s.first ??= o.timestamp; s.last = o.timestamp; }
    if (o.type === 'user') human = true;
    if (o.type !== 'assistant') continue;
    const m = o.message || {};
    if (o.entrypoint) s.entrypoints.add(o.entrypoint);
    if (o.version) s.versions.add(o.version);
    if (m.model) s.models.add(m.model);
    if (o.effort) s.efforts.add(o.effort);
    const stop = m.stop_reason === 'tool_use' || m.stop_reason === 'end_turn' ? m.stop_reason : 'other';
    const blocks = Array.isArray(m.content) ? m.content : [];
    const inRecord = blocks.filter(b => b && b.type === 'thinking').length;
    for (const b of blocks) {
      if (!b || typeof b !== 'object') continue;
      if (b.type === 'text' && b.text && b.text.trim()) s.text[stop]++;
      if (b.type === 'tool_use') {
        if (/wrap_up$/.test(b.name || '') && s.narrIds.has(m.id)) s.wrapUpNarr++;
        const cmd = b.name === 'Bash' && b.input && typeof b.input.command === 'string' ? b.input.command : '';
        if (/node\b[^|;&]*transcript-reader\.mjs/.test(cmd) && /--distill/.test(cmd)) s.closes.push(i);
      }
      if (b.type !== 'thinking') continue;
      const n = (seenThinking.get(m.id) || 0) + 1;
      seenThinking.set(m.id, n);
      if (!b.thinking || !b.thinking.trim()) continue;
      const ms = thinkingMs(o, inRecord);
      if (!isNarration(n, ms)) {
        if (n === 1) { s.firstThinkNonEmpty++; if (ms === null && stop === 'tool_use') s.untimedOpeners++; }
        continue;
      }
      if (n === 1) s.fastFirst++;
      s.narr[stop]++;
      s.narrIds.add(m.id);
      s.narrChars += b.thinking.length;
      if (ms !== null) s.fastNarr++; else s.untimedNarr++;
      if (!s.closes.length) s.narrBeforeFirstClose++;
      samples.push({ session: s.id, record: i, ts: o.timestamp, stop, ms: o.thinkingDurationMs, effort: o.effort, text: b.thinking });
    }
  }
  if (!human || !s.first) continue;
  sessions.push(s);
}

sessions.sort((a, b) => (a.first < b.first ? -1 : 1));
const sum = (f) => sessions.reduce((a, s) => a + f(s), 0);
const withNarr = sessions.filter(s => s.narr.tool_use + s.narr.end_turn + s.narr.other > 0);
const firstNarr = withNarr[0];
const allIds = new Set();
let ownSessions = 0;
for (const s of sessions) {
  let own = false;
  for (const id of s.narrIds) if (!allIds.has(id)) { own = true; allIds.add(id); }
  if (own) ownSessions++;
}

console.log(`taken: ${new Date().toISOString()}`);
console.log(`sessions scanned: ${sessions.length} (main-session files with a user record; ${files.length} files)`);
console.log(`sessions with narration blocks: ${withNarr.length} (${ownSessions} holding narration no earlier session held; the rest are fork copies)`);
console.log(`first session with narration: ${firstNarr ? `${firstNarr.first} ${firstNarr.id} versions ${[...firstNarr.versions].join(',')}` : 'none'}`);
console.log(`narration blocks: ${sum(s => s.narr.tool_use)} in tool_use messages, ${sum(s => s.narr.end_turn)} in end_turn messages, ${sum(s => s.narr.other)} other (no stop reason: an interrupted turn); ${allIds.size} distinct API messages`);
console.log(`text blocks:      ${sum(s => s.text.tool_use)} in tool_use messages, ${sum(s => s.text.end_turn)} in end_turn messages, ${sum(s => s.text.other)} other`);
console.log(`how told: timed under ${FAST_MS} ms ${sum(s => s.fastNarr)} (of which ${sum(s => s.fastFirst)} open their message), untimed and second in their message ${sum(s => s.untimedNarr)}`);
console.log(`unknowable: ${sum(s => s.untimedOpeners)} untimed non-empty thinking blocks open a message that ends in a tool call; a paraphrase among them can't be told`);
console.log(`narration in a message whose tool call is wrap_up (a recap paraphrased): ${sum(s => s.wrapUpNarr)}`);

// Since narration began: by entrypoint, effort, model.
if (firstNarr) {
  const since = sessions.filter(s => s.first >= firstNarr.first);
  const by = (key) => {
    const t = new Map();
    for (const s of since) for (const k of s[key]) {
      const r = t.get(k) || { sessions: 0, withNarr: 0, narr: 0, betweenText: 0 };
      r.sessions++; const n = s.narr.tool_use + s.narr.end_turn + s.narr.other;
      if (n) r.withNarr++; r.narr += n; r.betweenText += s.text.tool_use;
      t.set(k, r);
    }
    console.log(`\nsince narration began — by ${key}:`);
    for (const [k, r] of [...t].sort()) console.log(`  ${k.padEnd(28)} sessions ${String(r.sessions).padStart(4)}  with narration ${String(r.withNarr).padStart(4)}  narration blocks ${String(r.narr).padStart(5)}  between-call text ${String(r.betweenText).padStart(5)}`);
  };
  by('entrypoints'); by('efforts'); by('models');
  console.log(`\nsessions begun since the onset: ${since.length}, with narration ${since.filter(s => s.narrIds.size).length}`);
  // By week, to see the onset.
  const weeks = new Map();
  for (const s of since) {
    const w = s.first.slice(0, 10);
    const r = weeks.get(w) || { sessions: 0, withNarr: 0, narr: 0, betweenText: 0 };
    r.sessions++; const n = s.narr.tool_use + s.narr.end_turn + s.narr.other;
    if (n) r.withNarr++; r.narr += n; r.betweenText += s.text.tool_use;
    weeks.set(w, r);
  }
  console.log('\nby day the session began:');
  for (const [w, r] of [...weeks].sort()) console.log(`  ${w}  sessions ${String(r.sessions).padStart(3)}  with narration ${String(r.withNarr).padStart(3)}  narration ${String(r.narr).padStart(4)}  between-call text ${String(r.betweenText).padStart(4)}`);
}

// Closes touched: sessions that read their own arc with the reader after narration had happened.
const closeSessions = sessions.filter(s => s.closes.length);
const touched = closeSessions.filter(s => s.narrBeforeFirstClose > 0);
console.log(`\nsessions that ran the reader (a Bash call, node transcript-reader.mjs --distill): ${closeSessions.length}; with narration blocks before the first run: ${touched.length}`);
for (const s of touched) console.log(`  ${s.first.slice(0, 16)} ${s.id}  narration before the read: ${s.narrBeforeFirstClose}`);

const out = flag('json');
if (out) fs.writeFileSync(out, JSON.stringify(sessions.map(s => ({ ...s, narrIds: [...s.narrIds], entrypoints: [...s.entrypoints], versions: [...s.versions], models: [...s.models], efforts: [...s.efforts] })), null, 1));
const sOut = flag('samples');
if (sOut) fs.writeFileSync(sOut, JSON.stringify(samples, null, 1));
