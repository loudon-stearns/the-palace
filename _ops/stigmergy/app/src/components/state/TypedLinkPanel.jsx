import React from 'react';
import { Box } from '../primitives.jsx';
import EntryRefChips from '../EntryRefChips.jsx';
import { resolveRef } from '../../lib/entry-ref.js';

// SCHEMA §4 made visible: frontmatter links (the semantic web) render as
// a typed-relation panel; body wikilinks (the conversational fabric) render
// inline in EntryBody. Two registers, two treatments. Obsidian flattens
// them; STATE separates them.
//
// Each row reads as a statement, "Connects to Hyperdimensional Prism", and
// beneath it, across the row's whole width, in italics, its label: the link's
// register (SCHEMA §4), which runs 18 characters at the median and 48 at most,
// so it gets a line of its own and wraps rather than being cut to a column.
// No table: Loudon, 2026-10-18, "[Mirrors]->[Entry] and then the next line
// below (description) in italics", "it can just read like a statement", and
// "the label can have more space and go under the entire 'connects to' as well
// as the destination page". Clicking the target navigates to that entry (when
// resolved against the wikilink index); a target no page carries yet is dim.

// Group entries by link type for readability. Order mirrors SCHEMA's table.
const TYPE_ORDER = [
  'mirrors', 'enables', 'deepens',
  'spawned', 'emerged-from',
  'contradicts', 'couples-with',
  'exemplifies', 'member-of',
  'connects-to',
];

/** A link type as the words of a statement: 'connects-to' → 'Connects to'. */
export function typeAsWords(type) {
  const words = String(type || 'connects-to').replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const TYPE_COLOR = {
  mirrors: 'var(--ansi-bright-cyan)',
  enables: 'var(--phosphor-bright)',
  deepens: 'var(--phosphor)',
  spawned: 'var(--ansi-bright-magenta)',
  'emerged-from': 'var(--ansi-bright-yellow)',
  contradicts: 'var(--error)',
  'couples-with': 'var(--phosphor-white)',
  exemplifies: 'var(--ansi-bright-cyan)',
  'member-of': 'var(--ansi-bright-cyan)',
  'connects-to': 'var(--phosphor-dim)',
};

function LinkRow({ link, onNavigate, index, refIndex }) {
  const resolvedPath = index?.get?.(link.target) ?? null;
  const known = resolvedPath !== null;
  const ref = resolveRef(refIndex, link.target);
  const typeColor = TYPE_COLOR[link.type] ?? 'var(--phosphor-dim)';
  return (
    <div
      data-testid="typed-link-row"
      data-known={known ? 'true' : 'false'}
      style={{ padding: '3px 0' }}
    >
      {/* One line that reads as a sentence: the verb, the page, its chips.
          It wraps like prose; there are no columns. */}
      <div style={{ overflowWrap: 'anywhere' }}>
        <span data-testid="typed-link-type" data-type={link.type} style={{
          color: typeColor, textShadow: 'var(--glow)',
          fontFamily: 'var(--font-mono)', fontSize: 12,
        }}>{typeAsWords(link.type)}</span>
        {' '}
        <span
          data-testid="typed-link-target"
          style={{
            color: known ? 'var(--link)' : 'var(--phosphor-dim)',
            textShadow: known ? 'var(--glow)' : 'none',
            cursor: known && onNavigate ? 'pointer' : 'default',
            borderBottom: known ? '1px dashed currentColor' : 'none',
          }}
          title={known ? undefined : 'no page by this name yet'}
          onClick={() => { if (known && onNavigate) onNavigate(resolvedPath); }}
        >
          {link.target}
        </span>
        {/* [OBS]/[BUN] ride the resolved target. onOpen navigates in-deck to
            the target's STATE view (where its bundle renders). */}
        <EntryRefChips resolved={ref} onOpen={onNavigate} />
      </div>
      {/* The description runs the row's full width, under the verb and the
          page alike. A div, not a span, so the target or its chip stays the
          row's last span (the e2e click follows it). */}
      {link.label ? (
        <div data-testid="typed-link-label" style={{
          color: 'var(--phosphor)', textShadow: 'none', marginTop: 1,
          fontSize: 12, fontStyle: 'italic', overflowWrap: 'anywhere',
        }}>{link.label}</div>
      ) : null}
    </div>
  );
}

export default function TypedLinkPanel({ links = [], onNavigate, index, refIndex }) {
  if (!Array.isArray(links) || links.length === 0) {
    return (
      <Box title="TYPED LINKS" tone="single">
        <div style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 12 }}>
          (no typed links -- consider proposing some via the next Weave)
        </div>
      </Box>
    );
  }

  // Group by type but preserve original order within each group.
  const byType = new Map();
  for (const l of links) {
    const t = l.type ?? 'connects-to';
    if (!byType.has(t)) byType.set(t, []);
    byType.get(t).push(l);
  }
  const orderedTypes = [
    ...TYPE_ORDER.filter((t) => byType.has(t)),
    ...[...byType.keys()].filter((t) => !TYPE_ORDER.includes(t)),
  ];

  return (
    <Box title={`TYPED LINKS  (${links.length})`} tone="single">
      {orderedTypes.map((t) => (
        <div key={t} style={{ marginBottom: 4 }}>
          {byType.get(t).map((l, i) => (
            <LinkRow key={`${t}-${i}`} link={l} onNavigate={onNavigate} index={index} refIndex={refIndex} />
          ))}
        </div>
      ))}
    </Box>
  );
}
