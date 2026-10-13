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
