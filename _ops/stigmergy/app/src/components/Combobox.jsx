import React, { useId, useMemo, useRef, useState } from 'react';
import { activeIndex, stepCursor } from '../lib/list-cursor.js';
import { rankTitles, splitMatch } from '../lib/title-match.js';

// A searchable picker -- the house stand-in for <input list> + <datalist>,
// whose dropdown is an OS widget the phosphor can't reach. A dashed input;
// under it, while you type, a listbox of the best-ranked titles (see
// lib/title-match.js) drawn in the terminal's own ink: a `>` on the
// highlighted row, the letters you typed lit white. ↑/↓ move the highlight,
// Enter picks it, Escape hands back to the caller; the mouse does the same by
// hover and click. Enter with no match hands the text up as typed.
//
// The highlight is held as the row's title, like PULSE's cursor
// (lib/list-cursor.js), so a re-rank on the next keystroke keeps it on the
// same page where it can. Typing a query highlights the top hit, so
// type-then-Enter picks the best match -- the command-palette convention.

export default function Combobox({
  value, onChange, onPick, onSubmit, onEscape,
  options = [], exclude = null, limit = 12,
  placeholder, autoFocus, width = 220, testId,
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(null);
  const listRef = useRef(null);

  const { hits, total } = useMemo(
    () => rankTitles(options, value, { limit, exclude }),
    [options, value, limit, exclude],
  );
  // activeIndex keys its rows by `path`; here the title is the key.
  const rows = useMemo(() => hits.map((t) => ({ path: t })), [hits]);
  const active = activeIndex(rows, cursor, value);
  const shown = open && value.trim().length > 0;
  const listId = `${id}-list`;

  const pick = (title) => { setOpen(false); onPick?.(title); };

  // Shift/Cmd/Ctrl/Alt combos pass through untouched (text selection, browser
  // shortcuts); Escape is the caller's whatever the modifiers.
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onEscape?.(); return; }
    if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (hits.length === 0) return;
      e.preventDefault();
      setOpen(true);
      const next = stepCursor(active, e.key === 'ArrowDown' ? 1 : -1, hits.length);
      setCursor(hits[next]);
      listRef.current?.children[next]?.scrollIntoView?.({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (shown && active >= 0) pick(hits[active]);
      else onSubmit?.(value);
    }
  };

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <input
        data-testid={testId}
        role="combobox"
        aria-expanded={shown}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={shown && active >= 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        onChange={(e) => { onChange?.(e.target.value); setCursor(null); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        style={{
          background: 'var(--bg)', color: 'var(--phosphor)', textShadow: 'var(--glow)',
          border: '1px dashed var(--phosphor-dim)', fontFamily: 'var(--font-mono)', fontSize: 12,
          padding: '2px 6px', outline: 'none', width, caretColor: 'var(--phosphor-white)',
        }}
      />
      {shown ? (
        <div
          data-testid={testId ? `${testId}-list` : undefined}
          style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 2, zIndex: 60,
            minWidth: '100%', width: 'max-content', maxWidth: 'min(70vw, 520px)',
            background: 'var(--bg)', border: '1px solid var(--phosphor-dim)',
            boxShadow: '0 4px 18px rgba(0,0,0,0.6)',
            fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6,
            color: 'var(--phosphor)', textShadow: 'var(--glow)',
          }}
        >
          <div ref={listRef} id={listId} role="listbox" className="bbs-scroll" style={{ maxHeight: 260, overflowY: 'auto' }}>
            {hits.map((title, i) => (
              <Option
                key={title}
                id={`${id}-opt-${i}`}
                title={title}
                query={value}
                active={i === active}
                onHover={() => { if (cursor !== title) setCursor(title); }}
                onPick={() => pick(title)}
              />
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', gap: 16,
            padding: '0 8px 0 6px', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase',
            color: 'var(--phosphor-dim)', textShadow: 'none',
            borderTop: hits.length ? '1px dashed var(--phosphor-dim)' : 'none',
          }}>
            <span>
              {hits.length === 0 ? 'no page matches · enter keeps the text as typed'
                : total > hits.length ? `${hits.length} of ${total} · keep typing`
                : `${total} ${total === 1 ? 'page' : 'pages'}`}
            </span>
            <span>↑↓ enter esc</span>
          </div>
        </div>
      ) : null}
    </span>
  );
}

// One row: the cursor glyph in a fixed cell, then the title with the typed
// run lit. Inverted (phosphor on black becomes black on phosphor) when it is
// the highlight, the same move the Button makes on hover.
function Option({ id, title, query, active, onHover, onPick }) {
  const [before, hit, after] = splitMatch(title, query);
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      // mousedown would blur the input and close the list before the click
      // lands; swallowing it keeps focus where the typing is.
      onMouseDown={(e) => e.preventDefault()}
      // mousemove, not mouseenter: a keyboard scroll slides rows under a
      // still pointer and fires mouseenter, which would yank the highlight
      // back from the key that just moved it.
      onMouseMove={onHover}
      onClick={onPick}
      style={{
        display: 'flex', gap: '1ch', padding: '1px 8px 1px 6px',
        cursor: 'pointer', whiteSpace: 'nowrap',
        background: active ? 'var(--fill-hover)' : 'transparent',
        color: active ? 'var(--fill-hover-fg)' : 'var(--phosphor)',
        textShadow: active ? 'none' : 'var(--glow)',
      }}
    >
      <span style={{ flex: 'none', width: '1ch', color: active ? 'var(--fill-hover-fg)' : 'var(--phosphor-dim)', textShadow: 'none' }}>
        {active ? '>' : ''}
      </span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {before}
        {hit ? <b style={{ fontWeight: 600, color: active ? 'var(--fill-hover-fg)' : 'var(--phosphor-white)' }}>{hit}</b> : null}
        {after}
      </span>
    </div>
  );
}
