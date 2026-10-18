#!/usr/bin/env node
// session-roll-call -- what is open across every Claude desktop session, read
// from files and never waking one.
//
//   node _ops/stigmergy/app/scripts/session-roll-call.mjs [--json] [--archived]
//
// trunk-state's sibling: trunk-state reads git, this reads the sessions, and
// `trunk-state --sessions` prints both, adding which session wrote each
// unsaved file in the main checkout. For every unarchived session, newest
// first, it reports:
//   - the app's record (~/Library/Application Support/Claude/claude-code-sessions
//     /*/*/local_<id>.json): title, cwd, last activity, starred, side session of
//     whom, and the app's own after-turn summary, dated by the record it is about;
//   - from its transcript (~/.claude/projects/*/<cliSessionId>.jsonl): Loudon's
//     last words, Claude's last words, the newest wrap-up (its recap and ask),
//     and how many tool calls came after that wrap-up; a side session's opening
//     brief, and a fork's copied records, are not counted as Loudon's words; an
//     old session may have no transcript left, which is reported, not an error;
//   - for a cwd under .claude/worktrees/: whether the folder still exists and how
//     many paths sit unsaved there; and for every branch the session wrote, how
//     many commits it holds that main does not.
// Each session gets a suggested pile -- waiting on Loudon, unclear, or can go --
// with the evidence that put it there. The pile is a suggestion, not a close:
// nothing here archives a session or retires a card. Loudon's archive and the
// board's close do that; git and the board are the truth.
// Only the tail of each transcript is read, growing until the evidence is found.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, openSync, readSync, fstatSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const PILES = ['waiting on Loudon', 'unclear', 'can go'];
const WRAP_UP = 'mcp__ccd_turn__wrap_up';
const REMINDER = /<system-reminder>[\s\S]*?<\/system-reminder>/g;
const QUESTION = /\?(?=[\s*_"'”’)\]]|$)/g;
const TAIL_START = 512 * 1024;
const HEAD_CHUNK = 256 * 1024;

export function sessionsDir(home = homedir()) {
  return join(home, 'Library', 'Application Support', 'Claude', 'claude-code-sessions');
}

function git(cwd, args) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  } catch (_) { return null; }
}

function ageText(ms) {
  if (ms === null || !Number.isFinite(ms)) return 'n/a';
  const h = ms / 3600000;
  return h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} days`;
}

const oneLine = (s, n) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1)}…` : t; };
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Every record the app keeps, archived or not, with the file it came from. A
// record that will not parse is counted, not dropped silently.
export function readRecords(dir) {
  const records = [];
  let unreadable = 0;
  if (!existsSync(dir)) return { records, unreadable };
  for (const a of readdirSync(dir)) {
    let subs;
    try { subs = readdirSync(join(dir, a)); } catch (_) { continue; }
    for (const b of subs) {
      let files;
      try { files = readdirSync(join(dir, a, b)); } catch (_) { continue; }
      for (const f of files) {
        if (!/^local_.*\.json$/.test(f)) continue;
        const file = join(dir, a, b, f);
        try { records.push({ file, r: JSON.parse(readFileSync(file, 'utf8')) }); } catch (_) { unreadable += 1; }
      }
    }
  }
  return { records, unreadable };
}

// cliSessionId -> transcript path, for every top-level transcript on disk.
export function transcriptIndex(projects) {
  const index = new Map();
  if (!existsSync(projects)) return index;
  for (const d of readdirSync(projects)) {
    let files;
    try { files = readdirSync(join(projects, d)); } catch (_) { continue; }
    for (const f of files) if (f.endsWith('.jsonl')) index.set(f.slice(0, -6), join(projects, d, f));
  }
  return index;
}

function textOf(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter((b) => b && b.type === 'text' && typeof b.text === 'string').map((b) => b.text).join('\n');
}

// What Loudon typed, or null when a machine put the words in his seat: task
// notifications, messages from other sessions, scheduled launches, skill bodies
// and reminders (the same marks the Closing Well transcript reader goes by).
function humanText(o) {
  if (o.isSidechain || o.isMeta || o.isCompactSummary) return null;
  if (o.origin && o.origin.kind && o.origin.kind !== 'human') return null;
  if (o.turnOrigin && o.turnOrigin !== 'human') return null;
  const t = textOf(o.message && o.message.content).replace(REMINDER, '').trim();
  if (!t) return null;
  const cmd = /^<command-name>([\s\S]*?)<\/command-name>/.exec(t);
  if (cmd) { const args = /<command-args>([\s\S]*?)<\/command-args>/.exec(t); return `${cmd[1].trim()} ${args ? args[1].trim() : ''}`.trim(); }
  return t.startsWith('<') ? null : t;
}

// One record, read for what the roll call wants.
function look(o) {
  if (!o || o.isSidechain) return null;
  if (o.type === 'attachment') {
    const a = o.attachment;
    if (!a || a.type !== 'queued_command' || a.commandMode !== 'prompt' || a.isMeta) return null;
    if (a.origin && a.origin.kind && a.origin.kind !== 'human') return null;
    const t = (typeof a.prompt === 'string' ? a.prompt : textOf(a.prompt)).replace(REMINDER, '').trim();
    return t && !t.startsWith('<') ? { human: { ts: a.timestamp || o.timestamp, text: t } } : null;
  }
  if (o.type === 'user') { const t = humanText(o); return t ? { human: { ts: o.timestamp, text: t } } : null; }
  if (o.type !== 'assistant') return null;
  const blocks = Array.isArray(o.message && o.message.content) ? o.message.content : [];
  const found = { calls: 0, allCalls: 0 };
  for (const b of blocks) {
    if (!b) continue;
    if (b.type === 'text' && b.text && b.text.trim()) found.claude = { ts: o.timestamp, text: b.text.trim() };
    else if (b.type === 'tool_use') {
      found.allCalls += 1;
      if (b.name !== WRAP_UP) { found.calls += 1; continue; }
      const i = b.input || {};
      found.wrapUp = { ts: o.timestamp, recap: i.recap || '', ask: i.ask || '', blocked: i.blocked === true };
    }
  }
  return found;
}

const wanted = (l) => l && (l.includes('"type":"user"') || l.includes('"type":"assistant"') || l.includes('queued_command'));

// The words that opened this session but are not Loudon's in it: a side
// session's brief (its first turn, whatever it is marked as, written by the
// session that started it), and for a fork, the parent's records it copied, up
// to the fork point. Read forward from the start until found.
export function openingOf(path, { side = false, forkUuid = null } = {}) {
  const found = { brief: null, forkTs: null };
  if (!side && !forkUuid) return found;
  let fd;
  try { fd = openSync(path, 'r'); } catch (_) { return found; }
  try {
    const size = fstatSync(fd).size;
    let pos = 0;
    let carry = '';
    let passed = !forkUuid;
    while (pos < size) {
      const buf = Buffer.alloc(Math.min(HEAD_CHUNK, size - pos));
      readSync(fd, buf, 0, buf.length, pos);
      pos += buf.length;
      const lines = (carry + buf.toString('utf8')).split('\n');
      carry = pos < size ? lines.pop() : '';
      for (const l of lines) {
        if (!wanted(l)) continue;
        let o;
        try { o = JSON.parse(l); } catch (_) { continue; }
        if (!passed) { if (o.uuid === forkUuid) { passed = true; found.forkTs = o.timestamp || null; } continue; }
        if (!side) return found;
        if (o.type !== 'user' || o.isSidechain || o.isMeta || o.isCompactSummary) continue;
        const t = textOf(o.message && o.message.content).replace(REMINDER, '').trim();
        if (t) { found.brief = { ts: o.timestamp, text: t }; return found; }
      }
    }
  } finally { closeSync(fd); }
  return found;
}

// The transcript's evidence, read from the end backwards: Loudon's last words,
// Claude's last words, the newest wrap-up and the tool calls after it, and,
// given the uuid of the record the app's after-turn summary is about, when that
// record was written and the tool calls after it. The tail grows until all of
// it is found or the file is read whole.
export function transcriptEvidence(path, { summaryUuid = null } = {}) {
  const ev = { human: null, claude: null, wrapUp: null, callsSinceWrapUp: 0, summarized: null, callsSinceSummarized: 0, lastTs: null, bytesRead: 0 };
  let fd;
  try { fd = openSync(path, 'r'); } catch (_) { return null; }
  try {
    const size = fstatSync(fd).size;
    let want = Math.min(size, TAIL_START);
    let done = 0; // bytes at the file's end already scanned
    let carry = ''; // the partial first line of the last chunk read
    while (done < size) {
      const start = size - want;
      const buf = Buffer.alloc(want - done);
      readSync(fd, buf, 0, buf.length, start);
      ev.bytesRead += buf.length;
      const lines = (buf.toString('utf8') + carry).split('\n');
      carry = start > 0 ? lines.shift() : '';
      for (let i = lines.length - 1; i >= 0; i -= 1) {
        const l = lines[i];
        if (!wanted(l)) continue;
        let o;
        try { o = JSON.parse(l); } catch (_) { continue; }
        if (!ev.lastTs && o.timestamp && (o.type === 'user' || o.type === 'assistant')) ev.lastTs = o.timestamp;
        if (summaryUuid && !ev.summarized && o.uuid === summaryUuid) ev.summarized = { ts: o.timestamp };
        const f = look(o);
        if (!f) continue;
        if (f.human && !ev.human) ev.human = f.human;
        if (f.claude && !ev.claude) ev.claude = f.claude;
        if (f.wrapUp && !ev.wrapUp) ev.wrapUp = f.wrapUp;
        else if (!ev.wrapUp) ev.callsSinceWrapUp += f.calls || 0;
        if (summaryUuid && !ev.summarized) ev.callsSinceSummarized += f.allCalls || 0;
      }
      done = want;
      if (ev.human && ev.claude && ev.wrapUp && (!summaryUuid || ev.summarized)) break;
      want = Math.min(size, want * 4);
    }
  } finally { closeSync(fd); }
  return ev;
}

function baseOf(repo) {
  return ['main', 'master'].find((b) => git(repo, ['rev-parse', '-q', '--verify', `refs/heads/${b}`])) || null;
}

// A worktree's own state: is the folder there, what sits unsaved, what it holds
// that main does not.
export function worktreeState(path) {
  if (!existsSync(path)) return { path, exists: false, dirty: null, ahead: null, branch: null, base: null };
  const status = git(path, ['status', '--porcelain']);
  const base = baseOf(path);
  const ahead = base ? git(path, ['rev-list', '--count', `${base}..HEAD`]) : null;
  const branch = git(path, ['rev-parse', '--abbrev-ref', 'HEAD']);
  return { path, exists: true, dirty: status === null ? null : status.split('\n').filter(Boolean).length, ahead: ahead === null ? null : Number(ahead.trim()), branch: branch ? branch.trim() : null, base };
}

// Every branch the session wrote ("repo\0branch" in the record's
// writtenBranches, and the record's own branch), and how many commits each
// holds that main does not. A worktree whose folder is gone is looked up in the
// repository that owned it. Main itself, and the branch the live worktree has
// checked out (worktreeState counts that), are left out.
export function branchState(r, worktree) {
  const pairs = (Array.isArray(r.writtenBranches) ? r.writtenBranches : []).map((w) => String(w).split('\0'));
  if (r.branch) pairs.push([r.worktreePath || r.cwd || '', r.branch]);
  const seen = new Set();
  const out = [];
  for (const [repo, branch] of pairs) {
    if (!branch || ['main', 'master'].includes(branch) || seen.has(branch)) continue;
    seen.add(branch);
    if (worktree && worktree.exists && worktree.branch === branch) continue;
    const at = repo && existsSync(repo) ? repo : repo && repo.includes('/.claude/worktrees/') ? repo.slice(0, repo.indexOf('/.claude/worktrees/')) : null;
    if (!at || !existsSync(at)) { out.push({ branch, repo, ahead: null, state: 'repository not found' }); continue; }
    const base = baseOf(at);
    if (!git(at, ['rev-parse', '-q', '--verify', `refs/heads/${branch}`])) { out.push({ branch, repo: at, ahead: null, state: 'branch deleted' }); continue; }
    const ahead = base ? git(at, ['rev-list', '--count', `${base}..refs/heads/${branch}`]) : null;
    out.push({ branch, repo: at, base, ahead: ahead === null ? null : Number(ahead.trim()), state: 'present' });
  }
  return out;
}

// Does this mark (a wrap-up, or the record the app summarized) still stand at
// the end of the session: nothing Loudon said and no tool call came after it?
function stands(ts, callsSince, human) {
  return Boolean(ts) && callsSince === 0 && !(human && human.ts > ts);
}

// The sentence holding Claude's last question, if its words ask one.
export function lastQuestion(text) {
  const t = String(text || '');
  let at = -1;
  for (const m of t.matchAll(QUESTION)) at = m.index;
  if (at < 0) return null;
  const from = Math.max(t.lastIndexOf('\n', at), ...['. ', '! ', '? '].map((p) => t.lastIndexOf(p, at - 1) + 1));
  return oneLine(t.slice(from, at + 1).replace(/^[\s*_\-#>]+/, ''), 160);
}

// The suggested pile, and the evidence that drove it. A turn counts as ended
// when its wrap-up, or the record the app's own after-turn summary is about,
// still stands at the end of the transcript; with neither, the pile is unclear.
// The order puts every reason to look before any reason to say it can go.
export function pile(s) {
  const tx = s.transcript;
  const wt = s.worktree;
  const sum = s.app.summary;
  if (s.thisSession) return { pile: 'unclear', because: 'this is the session running the roll call' };
  if (!tx) return { pile: 'unclear', because: 'no transcript on disk to read' };
  if (s.app.error) return { pile: 'unclear', because: `the app recorded an error: ${oneLine(s.app.error, 80)}` };
  const wrapStands = tx.wrapUp && stands(tx.wrapUp.ts, tx.callsSinceWrapUp, tx.human);
  const sumStands = sum && sum.current;
  if (!wrapStands && !sumStands) {
    if (!tx.wrapUp) return { pile: 'unclear', because: `no wrap-up in the transcript${sum ? ', and the app summarized an earlier turn' : ', and no app summary'}` };
    if (tx.human && tx.human.ts > tx.wrapUp.ts) return { pile: 'unclear', because: "Loudon's last words came after the last wrap-up" };
    return { pile: 'unclear', because: `${plural(tx.callsSinceWrapUp, 'tool call')} since the last wrap-up; a turn may be under way or ended without one` };
  }
  if (wrapStands && (tx.wrapUp.ask || tx.wrapUp.blocked)) return { pile: 'waiting on Loudon', because: 'the last wrap-up asks him something' };
  if (wrapStands && tx.claude && tx.claude.ts >= tx.wrapUp.ts && lastQuestion(tx.claude.text)) return { pile: 'waiting on Loudon', because: "Claude's closing words after the last wrap-up ask a question" };
  if (sumStands && (sum.needsAction || ['blocked', 'review_ready'].includes(sum.status))) return { pile: 'waiting on Loudon', because: `the app's own summary of the last turn says ${sum.status}${sum.needsAction ? ' and names an action' : ''}` };
  const held = [];
  if (wt && wt.exists && wt.dirty > 0) held.push(`its worktree has ${wt.dirty} unsaved`);
  if (wt && wt.exists && wt.ahead > 0) held.push(`its worktree holds ${plural(wt.ahead, 'commit')} not on ${wt.base}`);
  for (const b of s.branches) if (b.ahead > 0) held.push(`branch ${b.branch} holds ${plural(b.ahead, 'commit')} not on ${b.base}`);
  if (s.mainUnsaved && s.mainUnsaved.length) held.push(`it wrote ${s.mainUnsaved.length} of the unsaved paths in the main checkout`);
  if (held.length) return { pile: 'unclear', because: held.join('; ') };
  const ended = !wrapStands ? `no wrap-up ends the last turn, but the app's own summary of it says ${sum.status}`
    : tx.human ? "the last wrap-up came after Loudon's last words and asks nothing" : 'the last wrap-up asks nothing, and Loudon has not written in this session';
  return { pile: 'can go', because: `${ended}${wt && !wt.exists ? '; its worktree folder is gone' : ''}` };
}

// mainWriters: cliSessionId -> unsaved main-checkout paths that session wrote
// last (trunk-state's writer search), when the caller has it.
export function rollCall({ home = homedir(), includeArchived = false, self = process.env.CLAUDE_CODE_SESSION_ID || null, mainWriters = null } = {}) {
  const dir = sessionsDir(home);
  const { records, unreadable } = readRecords(dir);
  const index = transcriptIndex(join(home, '.claude', 'projects'));
  const byId = new Map(records.map(({ r }) => [r.sessionId, r]));
  const chosen = records.filter(({ r }) => includeArchived || !r.isArchived).sort((a, b) => (b.r.lastActivityAt || 0) - (a.r.lastActivityAt || 0));
  const sessions = chosen.map(({ file, r }) => {
    const path = r.cliSessionId ? index.get(r.cliSessionId) || null : null;
    const pts = r.postTurnSummary;
    const summaryUuid = pts ? pts.summarizes_uuid || r.postTurnSummaryFor || null : null;
    const evidence = path ? transcriptEvidence(path, { summaryUuid }) : null;
    const opening = path ? openingOf(path, { side: Boolean(r.spawnedFrom), forkUuid: r.forkedAtMessageUuid || null }) : null;
    const floor = opening && (opening.brief ? opening.brief.ts : opening.forkTs);
    if (evidence && evidence.human && floor && evidence.human.ts <= floor) evidence.human = null; // the brief, or the parent's words
    const parent = r.spawnedFrom && r.spawnedFrom.sessionId ? byId.get(r.spawnedFrom.sessionId) : null;
    const worktree = r.cwd && r.cwd.includes('/.claude/worktrees/') ? worktreeState(r.cwd) : null;
    const s = {
      sessionId: r.sessionId,
      cliSessionId: r.cliSessionId || null,
      title: r.title || '(untitled)',
      cwd: r.cwd || null,
      lastActivityAt: r.lastActivityAt || null,
      archived: r.isArchived === true,
      starred: r.isStarred === true || r.pinned === true,
      permissionMode: r.permissionMode || null,
      sideSessionOf: r.spawnedFrom ? { sessionId: r.spawnedFrom.sessionId || null, title: parent ? parent.title : r.spawnedFrom.title || null } : null,
      thisSession: Boolean(self && r.cliSessionId === self),
      app: {
        error: r.error || null,
        // current: the record it summarizes is in the transcript and nothing came after it.
        summary: pts ? { status: pts.status_category || null, detail: pts.status_detail || '', needsAction: pts.needs_action || '', of: evidence && evidence.summarized ? evidence.summarized.ts : null, current: Boolean(evidence && evidence.summarized && stands(evidence.summarized.ts, evidence.callsSinceSummarized, evidence.human)) } : null,
      },
      record: file,
      transcriptPath: path,
      transcript: evidence,
      brief: opening && opening.brief ? opening.brief : null,
      worktree,
      branches: branchState(r, worktree),
      mainUnsaved: mainWriters ? mainWriters.get(r.cliSessionId) || [] : null,
    };
    return { ...s, ...pile(s) };
  });
  // A session that can go while a side session it started is still open: look
  // at the side session first.
  for (const s of sessions) {
    if (s.pile !== 'can go') continue;
    const open = sessions.filter((c) => c.sideSessionOf && c.sideSessionOf.sessionId === s.sessionId && c.pile !== 'can go');
    if (open.length) Object.assign(s, { pile: 'unclear', because: `its side session ${open.map((c) => `"${oneLine(c.title, 50)}" is ${c.pile}`).join(', ')}` });
  }
  const piles = Object.fromEntries(PILES.map((p) => [p, sessions.filter((x) => x.pile === p).length]));
  return { at: new Date().toISOString(), dir, records: records.length, unreadable, unarchived: records.filter(({ r }) => !r.isArchived).length, mainWritersRead: Boolean(mainWriters), piles, sessions };
}

function clock(ts) {
  if (!ts) return '?';
  const d = new Date(ts);
  return Date.now() - d.getTime() < 20 * 3600000 ? d.toTimeString().slice(0, 5) : d.toISOString().slice(0, 10);
}

export function render(rc) {
  const out = [];
  const tilde = (p) => String(p).replace(homedir(), '~');
  const counts = PILES.map((p) => `${rc.piles[p]} ${p}`).join(', ');
  out.push(`Sessions, ${rc.at.slice(0, 16).replace('T', ' ')} UTC: ${rc.sessions.length} listed of ${rc.records} records (${counts})${rc.unreadable ? `; ${plural(rc.unreadable, 'record')} would not parse` : ''}`);
  out.push("The pile is a suggestion, not a close: nothing here archives a session or retires a card. Loudon's archive and the board's close do that; git and the board are the truth.");
  if (!rc.mainWritersRead) out.push('Unsaved files in the main checkout are not credited to sessions here; trunk-state --sessions does that.');
  for (const s of rc.sessions) {
    const tags = [s.starred ? 'starred' : '', s.sideSessionOf ? `side session of "${oneLine(s.sideSessionOf.title || s.sideSessionOf.sessionId, 50)}"` : '', s.archived ? 'archived' : '', s.thisSession ? 'this session' : ''].filter(Boolean).join(', ');
    out.push('');
    out.push(`[${s.pile}] ${s.title} (${ageText(s.lastActivityAt ? Date.now() - s.lastActivityAt : null)} ago, ${String(s.sessionId).replace(/^local_/, '').slice(0, 8)}${tags ? `, ${tags}` : ''})`);
    out.push(`    in ${s.cwd ? tilde(s.cwd) : '?'}`);
    const tx = s.transcript;
    if (!tx) out.push('    no transcript on disk');
    else {
      if (tx.wrapUp) {
        out.push(`    wrap-up ${clock(tx.wrapUp.ts)}: ${oneLine(tx.wrapUp.recap, 220)}`);
        if (tx.wrapUp.ask) out.push(`    asks: ${oneLine(tx.wrapUp.ask, 160)}`);
      } else out.push('    no wrap-up found');
      if (tx.human) out.push(`    Loudon ${clock(tx.human.ts)}: "${oneLine(tx.human.text, 140)}"`);
      else if (s.brief) out.push(`    Loudon has not written here; its brief ${clock(s.brief.ts)}: "${oneLine(s.brief.text, 120)}"`);
      const q = tx.claude && tx.wrapUp && tx.claude.ts >= tx.wrapUp.ts ? lastQuestion(tx.claude.text) : null;
      if (q) out.push(`    Claude's closing question: "${q}"`);
      else if (tx.claude && (!tx.wrapUp || tx.claude.ts > tx.wrapUp.ts || tx.callsSinceWrapUp > 0)) out.push(`    Claude ${clock(tx.claude.ts)}: "${oneLine(tx.claude.text, 140)}"`);
    }
    const sum = s.app.summary;
    if (sum) out.push(`    app summary${sum.current ? '' : sum.of ? ' (of an earlier turn)' : ' (its turn not found in the transcript)'}: ${sum.status}${sum.needsAction ? `, needs: ${oneLine(sum.needsAction, 140)}` : sum.detail ? `, ${oneLine(sum.detail, 140)}` : ''}`);
    if (s.worktree) {
      const w = s.worktree;
      out.push(`    worktree: ${!w.exists ? 'folder gone' : `${w.dirty === null ? '?' : w.dirty} unsaved, ${w.ahead === null ? '?' : plural(w.ahead, 'commit')} not on ${w.base || 'main'}`}`);
    }
    for (const b of s.branches) out.push(`    branch ${b.branch}: ${b.state !== 'present' ? b.state : `${b.ahead === null ? '?' : plural(b.ahead, 'commit')} not on ${b.base || 'main'}`}`);
    if (s.mainUnsaved && s.mainUnsaved.length) out.push(`    main checkout: last writer of ${plural(s.mainUnsaved.length, 'unsaved path')}: ${s.mainUnsaved.slice(0, 3).join(', ')}${s.mainUnsaved.length > 3 ? ', …' : ''}`);
    if (s.transcriptPath) out.push(`    transcript: ${tilde(s.transcriptPath)}`);
    out.push(`    because: ${s.because}`);
  }
  return `${out.join('\n')}\n`;
}

function main() {
  const argv = process.argv.slice(2);
  const rc = rollCall({ includeArchived: argv.includes('--archived') });
  if (argv.includes('--json')) { process.stdout.write(`${JSON.stringify(rc, null, 1)}\n`); return; }
  process.stdout.write(render(rc));
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('session-roll-call.mjs');
if (invokedDirectly) main();
