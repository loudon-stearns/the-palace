// The LOG deck's trunk strip: the wording (src/lib/trunk-strip.js) against
// fixed trunk-state payloads, and a render smoke test of the line
// (TrunkStrip.jsx's TrunkLine) in the node env, as git-state-panel.test.js does.

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { trunkStrip, trunkLine, ageText, windowLabel, shortDate, placeOf } from '../../src/lib/trunk-strip.js';
import { TrunkLine } from '../../src/components/log/TrunkStrip.jsx';

const h = React.createElement;
const H = 3600000;
const NOW = Date.parse('2026-10-21T12:00:00Z');

// The shape `trunk-state.mjs --json --no-writers` printed on the real palace, 2026-10-21.
const QUIET = {
  owner: '/x/The Palace',
  since: new Date(NOW - 24 * H).toISOString(),
  ts: new Date(NOW).toISOString(),
  remote: { ahead: 155, behind: 0, oldestMs: 47 * H + 20 * 60000, fetchedMs: NOW - 30 * H },
  lastPush: { ts: '2026-10-19T12:43:36.307Z', count: 3, gate: 'high=0 warn=0', ok: true, landed: true },
  ear: { installed: true, moves: 42, door: 42, around: [], partial: false, heardFromMs: NOW - 24 * H },
  marker: null,
  writers_truncated: false,
  unsaved: [
    { code: ' M', path: '_ops/daily-page/visits.jsonl', mtime: NOW - 42 * 60000, writer: null, overtaken: null },
    { code: ' M', path: '_ops/swarm/persistent/blackboard.jsonl', mtime: NOW - 10 * 60000, writer: null, overtaken: null },
    { code: '??', path: 'Adopt the Craft/a — baton.md', mtime: NOW - 24 * H, writer: null, overtaken: null },
    { code: '??', path: 'Adopt the Craft/b.md', mtime: NOW - 24 * H, writer: null, overtaken: null },
    { code: '??', path: 'Adopt the Craft/c.md', mtime: NOW - 24 * H, writer: null, overtaken: null },
  ],
  trees: [],
  branches: 34,
  unmerged: ['claude/piece-origin-migration-77ed4e', 'claude/vst-template-ui'],
};

const byKey = (phrases) => Object.fromEntries(phrases.map((p) => [p.key, p]));

describe('trunkStrip: a quiet day', () => {
  const phrases = trunkStrip(QUIET, { now: NOW });
  const k = byKey(phrases);

  it('says each thing in a short phrase, in the order the trunk is read', () => {
    expect(phrases.map((p) => p.key)).toEqual(['remote', 'push', 'ear', 'unsaved', 'branches']);
    expect(k.remote.text).toBe('main 155 ahead of origin, oldest unsent 47 h');
    expect(k.push.text).toBe('last push oct 19, 3 commits');
    expect(k.ear.text).toBe('the ear in 24h: 42 through the door, 0 around');
    expect(k.unsaved.text).toBe('unsaved in main: 5 paths in 3 places');
    expect(k.branches.text).toBe('2 branches hold work not on main');
  });

  it('is never loud when nothing went around the door and no landing died', () => {
    expect(phrases.some((p) => p.tone === 'loud')).toBe(false);
    expect(k.ear.parts.find((p) => p.text === '0 around').tone).toBe('dim');
  });

  it('keeps the longer story for the hover: places by count, branch names, the fetch age', () => {
    expect(k.unsaved.title).toBe('Adopt the Craft: 3\n_ops/daily-page: 1\n_ops/swarm: 1');
    expect(k.branches.title).toBe('claude/piece-origin-migration-77ed4e\nclaude/vst-template-ui');
    expect(k.remote.title).toBe('origin as last fetched, 30 h ago');
    expect(k.push.title).toBe('2026-10-19 12:43 UTC, sent, gate high=0 warn=0');
  });

  it('reads as one line joined with dots', () => {
    expect(trunkLine(QUIET, { now: NOW })).toBe(
      'main 155 ahead of origin, oldest unsent 47 h · last push oct 19, 3 commits · '
      + 'the ear in 24h: 42 through the door, 0 around · unsaved in main: 5 paths in 3 places · '
      + '2 branches hold work not on main');
  });
});

describe('trunkStrip: what makes it loud', () => {
  it('a move of main around the door', () => {
    const around = [{ ts: '2026-10-21T09:14:00.000Z', new: 'c'.repeat(40), caller: 'zsh', cwd: '/x/The Palace' }, { ts: '2026-10-21T10:00:00.000Z', new: 'd'.repeat(40), caller: 'git' }];
    const ear = byKey(trunkStrip({ ...QUIET, ear: { ...QUIET.ear, moves: 44, door: 42, around } }, { now: NOW })).ear;
    expect(ear.text).toBe('the ear in 24h: 42 through the door, 2 around');
    expect(ear.tone).toBe('loud');
    expect(ear.parts.find((p) => p.text === '2 around').tone).toBe('loud');
    expect(ear.parts.find((p) => p.text === '42 through the door').tone).toBe('plain');
    expect(ear.title).toBe('around: 09:14 cccccccc by zsh in /x/The Palace\naround: 10:00 dddddddd by git');
  });

  it('a landing that died halfway', () => {
    const k = byKey(trunkStrip({ ...QUIET, marker: { branch: 'feature/x', old: 'a'.repeat(40), new: 'b'.repeat(40), state: 'died' } }, { now: NOW }));
    expect(k.landing.text).toBe('a landing died halfway, waiting to be healed: feature/x');
    expect(k.landing.tone).toBe('loud');
    expect(trunkStrip({ ...QUIET, marker: { state: 'died' } }, { now: NOW })[3].key).toBe('landing');
  });

  it('a landing under way is a warning, an unreadable marker is loud', () => {
    const going = byKey(trunkStrip({ ...QUIET, marker: { branch: 'feature/x', state: 'in progress' } }, { now: NOW })).landing;
    expect(going.text).toBe('a landing is under way: feature/x');
    expect(going.tone).toBe('warn');
    const odd = byKey(trunkStrip({ ...QUIET, marker: { state: 'unreadable' } }, { now: NOW })).landing;
    expect(odd.text).toBe('a landing marker is unreadable');
    expect(odd.tone).toBe('loud');
  });

  it('main and origin diverged, and a push that failed', () => {
    const k = byKey(trunkStrip({ ...QUIET, remote: { ahead: 3, behind: 2, oldestMs: H, fetchedMs: null }, lastPush: { ...QUIET.lastPush, ok: false } }, { now: NOW }));
    expect(k.remote.text).toBe('main diverged from origin: 3 ahead, 2 behind');
    expect(k.remote.tone).toBe('loud');
    expect(k.remote.title).toBe('a push would not be a fast-forward; origin never fetched here');
    expect(k.push.text).toBe('last push oct 19, 3 commits, FAILED');
    expect(k.push.tone).toBe('loud');
  });
});

describe('trunkStrip: the quiet edges', () => {
  it('main even with origin, or no origin at all', () => {
    expect(byKey(trunkStrip({ ...QUIET, remote: { ahead: 0, behind: 0, oldestMs: null, fetchedMs: NOW - H } }, { now: NOW })).remote.text).toBe('main even with origin');
    const none = byKey(trunkStrip({ ...QUIET, remote: { ahead: null } }, { now: NOW })).remote;
    expect(none.text).toBe('main has no origin to compare');
    expect(none.tone).toBe('dim');
  });

  it('no push receipt, nothing unsaved, every branch on main', () => {
    const k = byKey(trunkStrip({ ...QUIET, lastPush: null, unsaved: [], unmerged: [] }, { now: NOW }));
    expect(k.push.text).toBe('last push none on record');
    expect(k.unsaved.text).toBe('nothing unsaved in main');
    expect(k.branches.text).toBe('every branch is on main');
  });

  it('one of each is singular', () => {
    const k = byKey(trunkStrip({ ...QUIET, lastPush: { ...QUIET.lastPush, count: 1 }, unsaved: [QUIET.unsaved[0]], unmerged: ['a'] }, { now: NOW }));
    expect(k.push.text).toBe('last push oct 19, 1 commit');
    expect(k.unsaved.text).toBe('unsaved in main: 1 path in 1 place');
    expect(k.branches.text).toBe('1 branch holds work not on main');
  });

  it('an ear not installed, and one whose window began after the since', () => {
    expect(byKey(trunkStrip({ ...QUIET, ear: { installed: false, moves: 0, door: 0, around: [] } }, { now: NOW })).ear.text).toBe('the ear is not installed');
    const gone = byKey(trunkStrip({ ...QUIET, ear: { ...QUIET.ear, installed: false } }, { now: NOW })).ear;
    expect(gone.text).toBe('the ear in 24h: 42 through the door, 0 around, not installed now');
    expect(gone.tone).toBe('warn');
    expect(byKey(trunkStrip({ ...QUIET, ear: { ...QUIET.ear, partial: true } }, { now: NOW })).ear.text).toBe('the ear, since it began listening: 42 through the door, 0 around');
  });

  it('nothing to say for nothing read', () => {
    expect(trunkStrip(null)).toEqual([]);
    expect(trunkLine(undefined)).toBe('');
  });
});

describe('the small words', () => {
  it('ages read as trunk-state reads them', () => {
    expect(ageText(10 * 60000)).toBe('10 min');
    expect(ageText(20 * 1000)).toBe('1 min');
    expect(ageText(47.4 * H)).toBe('47 h');
    expect(ageText(72 * H)).toBe('3 days');
    expect(ageText(null)).toBe('n/a');
  });
  it('the window is hours, or whole days past two', () => {
    expect(windowLabel(new Date(NOW - 24 * H).toISOString(), new Date(NOW + 2000).toISOString())).toBe('24h');
    expect(windowLabel(new Date(NOW - 72 * H).toISOString(), new Date(NOW).toISOString())).toBe('3d');
    expect(windowLabel(new Date(NOW - 50 * H).toISOString(), new Date(NOW).toISOString())).toBe('50h');
  });
  it('a day reads short, with the year only when it is not this one', () => {
    expect(shortDate('2026-10-19T12:43:36Z', NOW)).toBe('oct 19');
    expect(shortDate('2025-03-04T12:00:00Z', NOW)).toBe('mar 4 2025');
  });
  it('places group as trunk-state groups them', () => {
    expect(placeOf('_ops/swarm/persistent/blackboard.jsonl')).toBe('_ops/swarm');
    expect(placeOf('Projects/BLUELINE/proofs/x.png')).toBe('Projects/BLUELINE');
    expect(placeOf('Adopt the Craft/a.md')).toBe('Adopt the Craft');
    expect(placeOf('Projects/')).toBe('Projects/');
  });
});

describe('TrunkLine', () => {
  it('renders the phrases on one line, labelled and read-only', () => {
    const html = renderToStaticMarkup(h(TrunkLine, { phrases: trunkStrip(QUIET, { now: NOW }) }));
    expect(html).toContain('data-testid="trunk-strip"');
    expect(html).toContain('data-loud="false"');
    expect(html).toContain('TRUNK');
    expect(html).toContain('read-only');
    expect(html).toContain('155 ahead of origin');
    expect(html).toContain('data-key="ear"');
    expect(html).not.toContain('var(--error)');
  });
  it('turns its border to the error colour when anything is loud', () => {
    const html = renderToStaticMarkup(h(TrunkLine, { phrases: trunkStrip({ ...QUIET, marker: { branch: 'feature/x', state: 'died' } }, { now: NOW }) }));
    expect(html).toContain('data-loud="true"');
    expect(html).toContain('1px solid var(--error)');
    expect(html).toContain('data-tone="loud"');
  });
  it('renders nothing for nothing', () => {
    expect(renderToStaticMarkup(h(TrunkLine, { phrases: [] }))).toBe('');
  });
});
