// Unit tests for the LOG deck banner's selection rule, and for the one chip a
// staged rename renders as.
//
// The committer (server/commit.js) records a move whole only when it is handed
// both of its paths, so the banner's rule is: one row for a rename, and that
// row -- or any other row for the same file -- selects both sides. Render
// assertions use renderToStaticMarkup (node env, no DOM), the same convention
// as commit-card.test.js; clicking is covered through the pure helpers.

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import UncommittedBanner from '../../src/components/log/UncommittedBanner.jsx';
import { parsePorcelain } from '../../src/lib/git-log-parse.js';
import {
  movesIn, rowPaths, isRowSelected, toggleRow, allPaths, selectedFileCount,
} from '../../src/lib/uncommitted-selection.js';

// `git mv Foo.md Projects/Foo.md`, then an edit to the moved file; one
// unrelated edit staged and edited again; one untracked file.
const delta = parsePorcelain([
  'RM Foo.md -> Projects/Foo.md',
  'MM Other.md',
  '?? "Brand New.md"',
].join('\n'));
const items = [...delta.staged, ...delta.unstaged, ...delta.untracked];
const moves = movesIn(delta);
const [moveRow, otherStaged] = delta.staged;
const [movedEdit] = delta.unstaged;
const [untracked] = delta.untracked;

describe('uncommitted-selection', () => {
  it('movesIn maps each renamed file to where it was', () => {
    expect([...moves]).toEqual([['Projects/Foo.md', 'Foo.md']]);
    expect([...movesIn(null)]).toEqual([]);
    expect([...movesIn(parsePorcelain(' M Foo.md'))]).toEqual([]);
  });

  it('a rename row stands for both of its paths; any other row for its own', () => {
    expect(rowPaths(moveRow, moves)).toEqual(['Foo.md', 'Projects/Foo.md']);
    expect(rowPaths(otherStaged, moves)).toEqual(['Other.md']);
    expect(rowPaths(untracked, moves)).toEqual(['Brand New.md']);
  });

  it('the unstaged edit of a moved file brings the old side too', () => {
    // Selecting only this row would otherwise send the new path alone: half a
    // move, committed as a bare add and logged as a birth.
    expect(rowPaths(movedEdit, moves)).toEqual(['Foo.md', 'Projects/Foo.md']);
  });

  it('clicking a rename row selects both paths, and clicking again clears both', () => {
    const on = toggleRow(new Set(['Other.md']), moveRow, moves);
    expect([...on].sort()).toEqual(['Foo.md', 'Other.md', 'Projects/Foo.md']);
    expect(isRowSelected(moveRow, moves, on)).toBe(true);
    expect(isRowSelected(movedEdit, moves, on)).toBe(true); // the same file's other row follows
    const off = toggleRow(on, moveRow, moves);
    expect([...off]).toEqual(['Other.md']);
    expect(isRowSelected(moveRow, moves, off)).toBe(false);
  });

  it('a rename row with only one of its paths in the selection is not selected, and a click completes it', () => {
    const half = new Set(['Projects/Foo.md']);
    expect(isRowSelected(moveRow, moves, half)).toBe(false);
    expect([...toggleRow(half, moveRow, moves)].sort()).toEqual(['Foo.md', 'Projects/Foo.md']);
  });

  it('select-all takes every path, both sides of each move included', () => {
    expect([...allPaths(items, moves)].sort()).toEqual(['Brand New.md', 'Foo.md', 'Other.md', 'Projects/Foo.md']);
  });

  it('counts files, not paths: a move is one file, and a file listed twice is one', () => {
    expect(selectedFileCount(items, moves, new Set())).toBe(0);
    expect(selectedFileCount(items, moves, toggleRow(new Set(), moveRow, moves))).toBe(1);
    expect(selectedFileCount(items, moves, allPaths(items, moves))).toBe(3);
  });
});

describe('UncommittedBanner', () => {
  const html = renderToStaticMarkup(React.createElement(UncommittedBanner, { delta: { ...delta, total: items.length } }));
  const chips = html.match(/<span data-testid="commit-file"[^>]*>/g) ?? [];

  it('renders a staged rename as one chip that names both paths', () => {
    const chip = chips.find((c) => c.includes('data-renamed-from='));
    expect(chip).toContain('data-path="Projects/Foo.md"');
    expect(chip).toContain('data-renamed-from="Foo.md"');
    expect(html).toContain('Foo.md → </span>Projects/Foo.md');
    expect(html).not.toContain('Foo.md -&gt; Projects/Foo.md');
  });

  it('renders one chip per row and marks no other chip as a move', () => {
    expect(chips).toHaveLength(5);
    expect(chips.filter((c) => c.includes('data-renamed-from='))).toHaveLength(1);
  });
});
