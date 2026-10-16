// transcript-reader.test.mjs — the arc holds ALL of Loudon's input, and nothing that isn't his.
//
// The Closing Well moderator reads the arc cold, so a HUMAN beat is testimony. At the
// 2026-09-25 evening close (tuning item 31) the reader was caught three ways:
//   1. Messages he sent while Claude was working never reached the arc. They are not
//      user records at all: they are `queued_command` attachments, written to the file
//      where they were absorbed, and the reader never read attachments.
//   2. Popup answers came out as tool output cut to 180 characters, so a dismissal read
//      like an answer.
//   3. Task notifications, skill bodies and other injected user records sat under HUMAN.
//
// The fixtures are real records, cut down to the few that matter:
//   fixtures/arc-1f8e5161.jsonl — 18 of the 1,717 records of session 1f8e5161: both
//     mid-turn messages with their queue mirrors, the four-question AskUserQuestion he
//     dismissed, task notifications as user records and as a queued attachment, a skill
//     body (isMeta), and two typed turns as the control.
//   fixtures/arc-other-carriers.jsonl — the other shapes, from sibling sessions: a
//     pre-`origin` mid-turn message, a popup rejected with his words, a popup rejected
//     bare, an approved plan he edited, a slash command and its stdout, and a message
//     from another Claude session.
//   fixtures/arc-narration.jsonl — words Claude wrote to Loudon between tool calls that
//     reached him only as the platform's paraphrase, kept as a `thinking` block (tuning
//     item 43): the 2026-10-15 Daily Page gap with its neighbours, a paraphrase after
//     real thinking, one that opens its message, one on a version that kept no timing,
//     and real thinking as the control. Signatures blanked; tool inputs and output cut.
//
// Run:  node --test _ops/closing-well/tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PALACE = resolve(HERE, '../../..');
const READER = join(PALACE, '_ops/closing-well/transcript-reader.mjs');
const FIXTURES = join(HERE, 'fixtures');

const HUMAN = '### 🧑 HUMAN';

function arc(fixture, ...extra) {
  return execFileSync('node', [READER, '--distill', '--file', join(FIXTURES, fixture), ...extra],
    { encoding: 'utf8', stdio: 'pipe' });
}

/** The arc's beats, in order: a `### ` heading owns the lines under it; a `  · ` line is a beat of its own. */
function beats(text) {
  const body = text.slice(text.indexOf('\n---\n') + 5);
  const out = [];
  let cur = null;
  for (const line of body.split('\n')) {
    if (line.startsWith('### ')) { cur = { head: line, lines: [] }; out.push(cur); }
    else if (line.startsWith('  · ')) { cur = null; out.push({ head: line, lines: [] }); }
    else if (cur) cur.lines.push(line);
  }
  return out.map(b => ({ head: b.head, text: b.lines.join('\n').trim() }));
}

const humanBeats = (text) => beats(text).filter(b => b.head.startsWith(HUMAN));

/** The questions exactly as Claude asked them, read from the fixture's own tool_use. */
function askedQuestions(fixture) {
  for (const l of readFileSync(join(FIXTURES, fixture), 'utf8').split('\n')) {
    if (!l.trim()) continue;
    const o = JSON.parse(l);
    if (o.type !== 'assistant') continue;
    for (const b of o.message.content) {
      if (b.type === 'tool_use' && b.name === 'AskUserQuestion') return b.input.questions;
    }
  }
  throw new Error(`no AskUserQuestion in ${fixture}`);
}

const MID_TURN = [
  'We will do the version changes. Just wait on the tasks, thank you.',
  'The self check suite should do values checks as well as process checks. If we ask it to work outside of the values of the palace does it push back? it should.',
];

// ---- the evidence session --------------------------------------------------

test('a message sent mid-turn is a HUMAN beat, marked (mid-turn)', () => {
  const human = humanBeats(arc('arc-1f8e5161.jsonl'));
  for (const said of MID_TURN) {
    const hit = human.find(b => b.text === said);
    assert.ok(hit, `missing from HUMAN: "${said.slice(0, 50)}…"`);
    assert.equal(hit.head, `${HUMAN} (mid-turn)`);
  }
});

test('a mid-turn message sits where it was sent, not where it was absorbed', () => {
  // Sent 16:38:33; written to the file after the 16:38:38 reply and 16:38:40 Bash call.
  const all = beats(arc('arc-1f8e5161.jsonl'));
  const said = all.findIndex(b => b.text === MID_TURN[0]);
  const reply = all.findIndex(b => b.head === '### 🤖 CLAUDE' && b.text.startsWith("The Concierge's drafts are back"));
  assert.ok(said >= 0 && reply >= 0, 'both beats present');
  assert.ok(said < reply, 'the mid-turn message comes before the reply written after it was sent');
});

test('the queue mirror does not double a mid-turn message', () => {
  const text = arc('arc-1f8e5161.jsonl');
  for (const said of MID_TURN) assert.equal(text.split(said).length - 1, 1, `"${said.slice(0, 40)}…" appears once`);
});

test('a dismissed popup is a HUMAN beat that says so, with every question whole', () => {
  const text = arc('arc-1f8e5161.jsonl');
  const popups = humanBeats(text).filter(b => b.head === `${HUMAN} (popup)`);
  assert.equal(popups.length, 1);
  const [popup] = popups;
  assert.match(popup.text, /Dismissed AskUserQuestion without answering/);
  const questions = askedQuestions('arc-1f8e5161.jsonl');
  assert.equal(questions.length, 4);
  for (const q of questions) assert.ok(popup.text.includes(q.question), `question kept whole: "${q.header}"`);
  assert.doesNotMatch(popup.text, /\[User dismissed/, 'the harness sentinel is not presented as an answer');
  assert.doesNotMatch(text, /\[tool ✓\] The user answered/, 'the answer is not a RESULT beat');
});

test('no task notification, skill body, or other injected record is HUMAN', () => {
  const text = arc('arc-1f8e5161.jsonl');
  for (const b of humanBeats(text)) {
    assert.doesNotMatch(b.text, /<task-notification>/, `task notification under HUMAN: ${b.text.slice(0, 60)}`);
    assert.doesNotMatch(b.text, /^Base directory for this skill/, 'skill body under HUMAN');
  }
  // They are still in the arc, as machine lines.
  assert.match(text, /^ {2}· ⚙ task-notification: Agent "Summon the Concierge \(resident\)" finished/m);
  assert.match(text, /^ {2}· ⚙ task-notification: Background command "Tighten the baton claim; check forward-vector endings" failed/m);
  assert.match(text, /^ {2}· ⚙ meta: Base directory for this skill/m);
});

test('typed turns stay HUMAN', () => {
  const human = humanBeats(arc('arc-1f8e5161.jsonl'));
  const typed = human.filter(b => b.head === HUMAN).map(b => b.text);
  assert.ok(typed.includes('claim both and move forward with your plan.'));
  assert.ok(typed.some(t => t.startsWith('I am in the palace to do some handoffs grow up')));
  assert.equal(typed.length, 2);
});

test('--spine keeps every HUMAN beat', () => {
  const human = humanBeats(arc('arc-1f8e5161.jsonl', '--spine'));
  for (const said of MID_TURN) assert.ok(human.some(b => b.text === said));
  assert.ok(human.some(b => b.head === `${HUMAN} (popup)`));
});

// ---- the other carriers ----------------------------------------------------

test('a popup rejected with his words is HUMAN, words whole', () => {
  const popups = humanBeats(arc('arc-other-carriers.jsonl')).filter(b => b.head === `${HUMAN} (popup)`);
  const hit = popups.find(b => b.text.startsWith('Rejected ExitPlanMode'));
  assert.ok(hit, 'the rejection is a popup beat');
  assert.ok(hit.text.endsWith('I approve the plan, before any execution, review what just landed in git to make absolutely sure this was merged in the way you expected.'));
});

test('a popup rejected bare says he closed it without answering', () => {
  const popups = humanBeats(arc('arc-other-carriers.jsonl')).filter(b => b.head === `${HUMAN} (popup)`);
  const hit = popups.find(b => b.text.startsWith('Rejected AskUserQuestion without answering'));
  assert.ok(hit);
  const [q] = askedQuestions('arc-other-carriers.jsonl');
  assert.ok(hit.text.includes(q.question));
});

test('an approved plan is HUMAN, and says he edited it first', () => {
  const popups = humanBeats(arc('arc-other-carriers.jsonl')).filter(b => b.head === `${HUMAN} (popup)`);
  const hit = popups.find(b => b.text.startsWith('Approved the plan'));
  assert.ok(hit);
  assert.match(hit.text, /edited it before approving/);
});

test('a mid-turn message from before `origin` existed is still HUMAN (mid-turn)', () => {
  const human = humanBeats(arc('arc-other-carriers.jsonl'));
  assert.ok(human.some(b => b.head === `${HUMAN} (mid-turn)` && b.text === 'update?'));
});

test('a slash command is his; its output and another session\'s message are not', () => {
  const text = arc('arc-other-carriers.jsonl');
  const human = humanBeats(text);
  assert.ok(human.some(b => b.head === HUMAN && b.text === '/login'));
  for (const b of human) {
    assert.doesNotMatch(b.text, /<local-command-stdout>|Login successful/);
    assert.doesNotMatch(b.text, /Another Claude session sent a message/);
  }
  assert.match(text, /^ {2}· ⚙ local command output: <local-command-stdout>Login successful/m);
  assert.match(text, /^ {2}· ⚙ peer: "Ceremony updates with version and scrolls\." — Thanks — no collision/m);
});

// ---- narration: what he saw where Claude wrote between tool calls ----------

const CLAUDE = '### 🤖 CLAUDE';
const NARRATION = `${CLAUDE} (narration)`;
const PARAPHRASES = [
  "The handoff is delivered and in progress; I'll confirm later it reached the baton",   // aa97f4d5, second in its message, 4 ms
  "I'll check the nearest neighbors—LDN RTM, Autodidact Polymaths, and Hy",              // 42c02c5e, after real thinking, 1 ms
  'All 23 faces landed on main (0 missing, 316/316 wear both)',                          // 3af35990, opens its message, 5 ms
  'Most of the visualization checks out, but I spotted two issues',                      // 070f814d, second in its message, no timing
];
const REAL_THINKING = [
  "I'm comparing siblings here—Closing Well and the Return Ceremony card",               // opens its message, 32.6 s
  "I'm checking the related siblings—LDN RTM, Autodidact Polymaths",                     // opens its message, 9 s
];

test('a paraphrase the platform wrote is a CLAUDE (narration) beat, whole', () => {
  const said = beats(arc('arc-narration.jsonl')).filter(b => b.head === NARRATION);
  assert.equal(said.length, PARAPHRASES.length);
  for (const p of PARAPHRASES) assert.ok(said.some(b => b.text.startsWith(p)), `narration kept: "${p.slice(0, 40)}…"`);
  const daily = said.find(b => b.text.startsWith(PARAPHRASES[0]));
  assert.ok(daily.text.endsWith('opening that now.'), 'kept whole, not cut to a one-liner');
});

test('the narration sits where the room spoke: after send_message, before preview_start', () => {
  const all = beats(arc('arc-narration.jsonl'));
  const sent = all.findIndex(b => b.head.startsWith('  · call → mcp__ccd_session_mgmt__send_message'));
  const said = all.findIndex(b => b.head === NARRATION && b.text.startsWith(PARAPHRASES[0]));
  const opened = all.findIndex(b => b.head.startsWith('  · call → mcp__Claude_Browser__preview_start'));
  assert.ok(sent >= 0 && said >= 0 && opened >= 0, 'all three beats present');
  assert.ok(sent < said && said < opened);
});

test('real thinking stays out of the arc, and out of CLAUDE even with --thinking', () => {
  const plain = arc('arc-narration.jsonl');
  for (const t of REAL_THINKING) assert.ok(!plain.includes(t), `real thinking dropped: "${t.slice(0, 40)}…"`);
  const withThinking = arc('arc-narration.jsonl', '--thinking');
  for (const t of REAL_THINKING) assert.match(withThinking, new RegExp(`^ {2}· \\(thinking\\) ${t.slice(0, 20)}`, 'm'));
  for (const p of PARAPHRASES) assert.equal(withThinking.split(p).length - 1, 1, `narration appears once with --thinking: "${p.slice(0, 30)}…"`);
});

test('text Claude wrote stays a plain CLAUDE beat', () => {
  const all = beats(arc('arc-narration.jsonl'));
  assert.ok(all.some(b => b.head === CLAUDE && b.text.startsWith('*Two Readers* is open in the browser pane')));
  assert.ok(all.some(b => b.head === CLAUDE && b.text.startsWith("I'm sending it to the")));
});

test('the arc says how many beats are narration, and what that means', () => {
  const text = arc('arc-narration.jsonl');
  assert.match(text, /^- narration: 4 CLAUDE beats kept only as the platform's paraphrase$/m);
  assert.match(text, /CLAUDE \(narration\) stands where Claude wrote to the human/);
  assert.doesNotMatch(text, /^- narration unknowable/m, 'every block in the fixture can be told');
});

test('--spine keeps every narration beat', () => {
  const said = beats(arc('arc-narration.jsonl', '--spine')).filter(b => b.head === NARRATION);
  assert.equal(said.length, PARAPHRASES.length);
});

test('the older fixtures carry no narration', () => {
  for (const f of ['arc-1f8e5161.jsonl', 'arc-other-carriers.jsonl']) assert.doesNotMatch(arc(f), /^### 🤖 CLAUDE \(narration\)|^- narration:/m);
});

// Built from the fixture's own records, changed as each test says, in a temp file.
function variant(name, change) {
  const recs = readFileSync(join(FIXTURES, 'arc-narration.jsonl'), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
  const file = join(mkdtempSync(join(tmpdir(), 'arc-narration-')), `${name}.jsonl`);
  writeFileSync(file, change(recs).map(r => JSON.stringify(r)).join('\n') + '\n');
  return execFileSync('node', [READER, '--distill', '--file', file], { encoding: 'utf8', stdio: 'pipe' });
}
const opens = (recs, start) => recs.findIndex(r => r.type === 'assistant' && r.message.content.some(b => b.type === 'thinking' && b.thinking && b.thinking.startsWith(start)));

test('a record written twice (a replay after an api_error) does not turn real thinking into narration', () => {
  // The harness re-appended whole messages after an api_error in a636f482 (2026-06-26).
  const text = variant('replay', recs => {
    const at = opens(recs, REAL_THINKING[0]);
    const message = recs.filter(r => r.message && r.message.id === recs[at].message.id);
    return [...recs, { type: 'system', subtype: 'api_error', uuid: 'replay-api-error' }, ...message];
  });
  assert.ok(!text.includes(REAL_THINKING[0]), 'the replayed real thinking stays out');
  assert.match(text, /^- narration: 4 CLAUDE beats/m);
});

test('a thinking block that streamed for seconds is never narration, wherever it stands', () => {
  // Same replay, but with fresh uuids, so only the timing can tell.
  const text = variant('replay-new-uuids', recs => {
    const at = opens(recs, REAL_THINKING[0]);
    const message = recs.filter(r => r.message && r.message.id === recs[at].message.id).map((r, i) => ({ ...r, uuid: `fresh-${i}` }));
    return [...recs, ...message];
  });
  assert.ok(!text.includes(REAL_THINKING[0]));
});

test('an untimed thinking block that opens its message is counted as unknowable, not guessed', () => {
  const text = variant('untimed', recs => recs.map(r => {
    if (r.type === 'assistant' && r.message.content.some(b => b.type === 'thinking' && b.thinking && b.thinking.startsWith(REAL_THINKING[1]))) {
      const { thinkingDurationMs, ...rest } = r;
      return rest;
    }
    return r;
  }));
  assert.ok(!text.includes(REAL_THINKING[1]), 'still left out of the arc');
  assert.match(text, /^- narration unknowable: 1 thinking block with no timing opened its message; a paraphrase there can't be told from thinking and is left out$/m);
  assert.match(text, /^- narration: 4 CLAUDE beats/m, 'the paraphrase after it is still caught by its place');
});

// ---- items 39 and 42: what other agents told the room is kept whole ---------

test('a message from another session is kept whole, not cut at 240 characters', () => {
  const text = arc('arc-other-carriers.jsonl');
  for (const l of readFileSync(join(FIXTURES, 'arc-other-carriers.jsonl'), 'utf8').split('\n')) {
    if (!l.includes('cross-session-message')) continue;
    const o = JSON.parse(l);
    const raw = typeof o.message?.content === 'string' ? o.message.content : (o.attachment?.prompt || '');
    const body = /<cross-session-message[^>]*>([\s\S]*?)<\/cross-session-message>/.exec(raw)[1].replace(/\s+/g, ' ').trim();
    assert.ok(body.length > 240, 'the fixture message is longer than the old cut');
    assert.ok(text.includes(body), 'every word of it is in the arc');
  }
});

test('a subagent\'s report in a task notification is kept whole, so a hand-back is not a bare "finished"', () => {
  const text = arc('arc-1f8e5161.jsonl');
  let reports = 0;
  for (const l of readFileSync(join(FIXTURES, 'arc-1f8e5161.jsonl'), 'utf8').split('\n')) {
    if (!l.trim()) continue;
    const o = JSON.parse(l);
    if (o.type !== 'user' || typeof o.message.content !== 'string' || !o.message.content.startsWith('<task-notification>')) continue;
    const result = /<result>([\s\S]*?)<\/result>/.exec(o.message.content);
    if (!result) continue;
    reports++;
    assert.ok(text.includes(result[1].replace(/\s+/g, ' ').trim()), 'every word of the report is in the arc');
  }
  assert.equal(reports, 2, 'both Concierge reports in the fixture were checked');
  assert.match(text, /^ {2}· ⚙ task-notification: Background command "Tighten the baton claim; check forward-vector endings" failed with exit code 144$/m, 'a background command, which carries no report, stays one short line');
});
