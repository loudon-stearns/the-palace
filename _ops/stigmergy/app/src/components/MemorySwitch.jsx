import React from 'react';

// MemorySwitch — an entry's memory beside its faces: the Context and each
// ledger (CHILD.md § A page and its folder). Memory is what the next worker
// reads, not a face a reader meets, so it sits apart from the face switch and
// out of the F cycle. Each opens in the reader; the face switch's TEXT comes
// back. `memory` is { context, ledgers: [{ kind, path }] } (src/lib/bundle.js
// memoryFor); `current` is the path being read. Draws nothing when the bundle
// keeps no memory.
export default function MemorySwitch({ memory, current, onOpen }) {
  const items = [];
  if (memory?.context) items.push({ key: 'context', path: memory.context, label: 'context', kind: null });
  for (const l of memory?.ledgers || []) {
    items.push({ key: `ledger:${l.path}`, path: l.path, label: 'ledger', kind: l.kind });
  }
  if (items.length === 0) return null;
  return (
    <span
      data-testid="memory-switch"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        textTransform: 'uppercase', letterSpacing: '.04em', fontSize: 12,
      }}
    >
      <span
        title="this entry's memory — what the next worker reads"
        style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11 }}
      >
        memory
      </span>
      {items.map((it) => {
        const active = it.path === current;
        return (
          <span
            key={it.key}
            data-testid={it.kind ? 'memory-ledger' : 'memory-context'}
            data-active={active ? '1' : '0'}
            role="button"
            tabIndex={active ? -1 : 0}
            aria-pressed={active}
            title={it.path}
            onClick={active ? undefined : () => onOpen?.(it.path)}
            onKeyDown={active ? undefined : (e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(it.path); }
            }}
            style={{
              cursor: active ? 'default' : 'pointer',
              padding: '2px 8px',
              color: active ? 'var(--phosphor)' : 'var(--phosphor-dim)',
              textShadow: active ? 'var(--glow)' : 'none',
              border: `1px solid ${active ? 'var(--phosphor)' : 'var(--phosphor-dim)'}`,
              borderStyle: active ? 'solid' : 'dashed',
            }}
          >
            {it.label}
            {it.kind ? (
              <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--phosphor-dim)', textShadow: 'none' }}>
                · {it.kind}
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}
