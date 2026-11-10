// Render tests for the QueueItem handoff card additions: the worktree line
// (visible on the card) and the "copy prompt" button (one-click clipboard path
// to a Claude Code paste). renderToStaticMarkup, node env — the click/clipboard
// is e2e's job; here we prove the button and the worktree coordinate render.

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import QueueItem from '../../src/components/queue/QueueItem.jsx';

const handoffItem = (over = {}) => ({
  id: 'cw-1',
  kind: 'handoff_ready',
  from: 'Closing Well',
  ts: '2026-07-03T22:38:18Z',
  board: 'GENERAL',
  ask: 'Build the Closing Well Agent; Phase 2 next.',
  move: 'Build the Closing Well Agent; Phase 2 next.',
  entry: 'Closing Well',
  handoff_path: 'Closing Well/Closing Well — baton.md',
  stale_if: 'a commit touches Closing Well after this was posted',
  pointer: { type: 'entry', target: 'Closing Well' },
  resolved: { done: false },
  worktree: {
    branch: 'feature/closing-well-agent',
    dir: '../palace-feature-closing-well-agent',
    profile: 'docs',
  },
  ...over,
});

const render = (item) =>
  renderToStaticMarkup(React.createElement(QueueItem, { item, onLaunch: () => {} }));

describe('QueueItem — handoff worktree + copy prompt', () => {
  it('shows the worktree coordinate on the card', () => {
    const html = render(handoffItem());
    expect(html).toContain('data-testid="queue-item-handoff-worktree"');
    expect(html).toContain('../palace-feature-closing-well-agent');
    expect(html).toContain('feature/closing-well-agent');
  });

  it('offers a copy-prompt button on an open handoff', () => {
    const html = render(handoffItem());
    expect(html).toContain('data-testid="queue-item-copy-prompt"');
    expect(html).toContain('copy prompt');
  });

  it('omits the worktree line when the baton has none (root-level baton)', () => {
    const html = render(handoffItem({ worktree: null }));
    expect(html).not.toContain('data-testid="queue-item-handoff-worktree"');
    // ...but still offers copy prompt — the prompt just uses the palace root.
    expect(html).toContain('data-testid="queue-item-copy-prompt"');
  });

  it('drops the copy-prompt button once the baton is resolved', () => {
    const html = render(handoffItem({ resolved: { done: true, reason: 'picked up' } }));
    expect(html).not.toContain('data-testid="queue-item-copy-prompt"');
  });
});

// A rich-face review note (queue-model's human_eval) is answered the way a
// weave_flag is: grant or deny from the card, which posts the RESOURCE_GRANT/
// DENY that drops it from buildQueue.
const reviewItem = (over = {}) => ({
  id: 'human-eval-kc-r2',
  kind: 'human_eval',
  from: 'TRICKSTER',
  ts: '2026-10-13T10:00:00Z',
  board: 'FLAGS',
  ask: 'act on 3 review notes on the rich face of [[Kuramoto Coupling]] (round 2)',
  rationale: 'The whole page: the bed is too loud',
  entry: 'Kuramoto Coupling',
  entries: ['Kuramoto Coupling'],
  stale_if: 'a commit touches Kuramoto Coupling, or a RESOURCE_GRANT/DENY answers this note',
  pointer: { type: 'entry', target: 'Kuramoto Coupling' },
  resolved: { done: false },
  ...over,
});

const renderAnswerable = (item) =>
  renderToStaticMarkup(React.createElement(QueueItem, { item, onRespond: () => {} }));

describe('QueueItem — human_eval (a rich-face review note)', () => {
  it('wears its own chip and accent, not the raw kind', () => {
    const html = renderAnswerable(reviewItem());
    expect(html).toContain('REVIEW NOTE');
    expect(html).not.toContain('>human_eval<');
    expect(html).toContain('border-left:3px solid var(--ansi-bright-green)');
  });

  it('offers grant and deny on an open card, as a weave_flag does', () => {
    const html = renderAnswerable(reviewItem());
    expect(html).toContain('data-testid="queue-item-grant"');
    expect(html).toContain('data-testid="queue-item-deny"');
  });

  it('drops grant and deny once the note is resolved', () => {
    const html = renderAnswerable(reviewItem({ resolved: { done: true, reason: 'a commit touched it' } }));
    expect(html).not.toContain('data-testid="queue-item-grant"');
  });
});

// An entry flag Loudon granted or denied that no commit has closed: it stays on
// the deck as answered, waiting on a commit, and offers no second answer.
describe('QueueItem — an answered weave flag', () => {
  const flag = (over = {}) => ({
    id: 'wf-1', kind: 'weave_flag', from: 'deposit-ceremony', ts: '2026-11-01T10:00:00Z', board: 'WEAVE',
    flag_type: 'backlink_audit', ask: 'add the backlink', propagate: null,
    pointer: { type: 'board', target: 'WEAVE' }, resolved: { done: false, reason: null, commit: null },
    answered: null, ...over,
  });
  const html = (item) => renderToStaticMarkup(React.createElement(QueueItem, { item, onRespond: () => {}, onClear: () => {} }));
  const granted = { type: 'grant', by: 'TRICKSTER', id: 'g-wf', ts: '2026-11-02T09:00:00Z', option: null };

  it('an open flag offers grant and deny, and no answered badge', () => {
    const h = html(flag());
    expect(h).toContain('data-testid="queue-item-grant"');
    expect(h).not.toContain('data-testid="queue-item-answered"');
    expect(h).toContain('data-answered="false"');
  });

  it('a granted flag shows "+ GRANTED -- waiting on a commit" and no grant or deny', () => {
    const h = html(flag({ answered: granted }));
    expect(h).toContain('data-testid="queue-item-answered"');
    expect(h).toContain('data-answered="grant"');
    expect(h).toContain('+ GRANTED -- waiting on a commit');
    expect(h).not.toContain('data-testid="queue-item-grant"');
    expect(h).not.toContain('data-testid="queue-item-deny"');
    expect(h).not.toContain('data-testid="queue-item-custom"');
    expect(h).not.toContain('data-testid="queue-item-resolved"');
  });

  it('a denied flag shows "x DENIED", with the option label when there was one', () => {
    const h = html(flag({ answered: { ...granted, type: 'deny', option: 'not this weave' } }));
    expect(h).toContain('x DENIED -- not this weave -- waiting on a commit');
  });

  it('once a commit closes it, it greys as before and the answered badge goes', () => {
    const h = html(flag({ answered: granted, resolved: { done: true, reason: 'resolved by commit aaa1111', commit: 'aaa1111' } }));
    expect(h).toContain('data-testid="queue-item-resolved"');
    expect(h).toContain('looks done -- resolved by commit aaa1111');
    expect(h).not.toContain('data-testid="queue-item-answered"');
    expect(h).not.toContain('data-testid="queue-item-grant"');
  });
});
