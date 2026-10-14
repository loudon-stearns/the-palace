// The WATCH pane's parser: stream-json transcript lines → a readable feed.
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { feedFromLine, feedFromLines, toolVerb } from '../../src/lib/transcript-view.js';
import { FeedItem } from '../../src/components/projects/WatchPane.jsx';

const A = (content) => JSON.stringify({ type: 'assistant', message: { role: 'assistant', content } });
const U = (content) => JSON.stringify({ type: 'user', message: { role: 'user', content } });

describe('feedFromLine', () => {
  it('keeps thinking only when it carries text, and keeps prose', () => {
    expect(feedFromLine(A([{ type: 'thinking', thinking: '', signature: 'x' }]))).toEqual([]);
    expect(feedFromLine(A([{ type: 'thinking', thinking: 'Picking up at cycle 16.' }]))).toEqual([{ kind: 'thinking', text: 'Picking up at cycle 16.' }]);
    expect(feedFromLine(A([{ type: 'text', text: 'Worse: a hard attack.' }]))).toEqual([{ kind: 'text', text: 'Worse: a hard attack.' }]);
  });
  it('turns a tool call into its own one-line verb', () => {
    const [t] = feedFromLine(A([{ type: 'tool_use', id: 't1', name: 'Bash', input: { command: 'python3 x.py', description: 'Record the 12-step walk with sound' } }]));
    expect(t).toEqual({ kind: 'tool', id: 't1', name: 'Bash', verb: 'Record the 12-step walk with sound' });
    expect(toolVerb('Read', { file_path: '/a/b/still.png' })).toBe('read still.png');
    expect(toolVerb('Bash', { command: 'ls   -la' })).toBe('ls -la');
  });
  it('shows an image the steward read as a data URL named after the file, and skips the echo of a Read', () => {
    const state = { toolNames: new Map() };
    feedFromLine(A([{ type: 'tool_use', id: 'r1', name: 'Read', input: { file_path: '/p/frames/cycle-08.png' } }]), state);
    const items = feedFromLine(U([{ type: 'tool_result', tool_use_id: 'r1', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'AAAA' } }, { type: 'text', text: 'file contents echoed' }] }]), state);
    expect(items).toEqual([{ kind: 'image', toolId: 'r1', src: 'data:image/png;base64,AAAA', name: 'cycle-08.png' }]);
  });
  it('keeps short command output and cuts long output', () => {
    const state = { toolNames: new Map() };
    feedFromLine(A([{ type: 'tool_use', id: 'b1', name: 'Bash', input: { command: 'x' } }]), state);
    const [r] = feedFromLine(U([{ type: 'tool_result', tool_use_id: 'b1', content: 'peak at 3.2 s' }]), state);
    expect(r).toEqual({ kind: 'result', toolId: 'b1', text: 'peak at 3.2 s' });
    const [long] = feedFromLine(U([{ type: 'tool_result', tool_use_id: 'b1', content: 'y'.repeat(1000) }]), state);
    expect(long.text.length).toBeLessThan(420);
  });
  it('reads the result line and ignores noise', () => {
    expect(feedFromLine(JSON.stringify({ type: 'result', subtype: 'success', total_cost_usd: 5.17, duration_api_ms: 930000 }))).toEqual([{ kind: 'done', reason: 'success', cost: 5.17, ms: 930000 }]);
    expect(feedFromLine(JSON.stringify({ type: 'system', subtype: 'thinking_tokens' }))).toEqual([]);
    expect(feedFromLine('not json')).toEqual([]);
  });
  it('feedFromLines carries tool names across lines', () => {
    const lines = [A([{ type: 'tool_use', id: 'r9', name: 'Read', input: { file_path: '/x/a.png' } }]), U([{ type: 'tool_result', tool_use_id: 'r9', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'BB' } }] }])];
    const items = feedFromLines(lines);
    expect(items.map((i) => i.kind)).toEqual(['tool', 'image']);
    expect(items[1].name).toBe('a.png');
  });
});

describe('FeedItem', () => {
  it('renders each kind with its data-feed mark', () => {
    for (const [item, mark] of [
      [{ kind: 'thinking', text: 't' }, 'thinking'], [{ kind: 'text', text: 'p' }, 'text'], [{ kind: 'tool', name: 'Bash', verb: 'v' }, 'tool'],
      [{ kind: 'image', src: 'data:image/png;base64,AA', name: 'a.png' }, 'image'], [{ kind: 'result', text: 'r' }, 'result'], [{ kind: 'done', reason: 'success', cost: 1, ms: 60000 }, 'done'],
    ]) {
      expect(renderToStaticMarkup(React.createElement(FeedItem, { item }))).toContain(`data-feed="${mark}"`);
    }
  });
});
