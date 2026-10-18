import React, { useLayoutEffect, useRef } from 'react';
import { fileUrl } from '../../lib/public-mode.js';

// The floating hover card — a detail panel that rides the cursor, shared by
// the TOPOLOGY canvas and the PULSE list so pointing at an entry reads the same
// in both. `info` carries what the pointer knows (a map node's degree / role /
// group, or just type / stage / pillars from a list row); `entry` is the
// entry's own record (forward vector, born, activity). Lines whose fields are
// absent simply don't render.
//
// usePointerCard owns placement: the card is positioned imperatively on every
// move (no React round-trip), and flips to the other side of the cursor near a
// viewport edge so it is never clipped.
// How far right of the pointer's tip the card sits. A pointer's body hangs
// down and right of its tip, and Loudon runs a very large one, so a small gap
// leaves the card's opening lines under the arrow. The flipped (left) side
// keeps the small pad -- nothing of the pointer hangs that way.
const CURSOR_CLEARANCE = 36;

export function usePointerCard(visible) {
  const cardRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const placeRef = useRef(null);
  placeRef.current = (clientX, clientY) => {
    mouseRef.current = { x: clientX, y: clientY };
    const el = cardRef.current;
    if (!el) return;
    const pad = 16;
    const w = el.offsetWidth || 280;
    const h = el.offsetHeight || 140;
    let left = clientX + CURSOR_CLEARANCE;
    let top = clientY + pad;
    if (left + w > window.innerWidth - 8) left = clientX - w - pad;
    if (top + h > window.innerHeight - 8) top = clientY - h - pad;
    el.style.left = `${Math.max(8, left)}px`;
    el.style.top = `${Math.max(8, top)}px`;
  };
  // Place the card the moment it mounts on a new hover (at the last known
  // cursor spot) so it never flashes at a stale corner before the next move.
  useLayoutEffect(() => {
    if (visible) placeRef.current(mouseRef.current.x, mouseRef.current.y);
  }, [visible]);
  return { cardRef, placeRef };
}

export default function EntryHoverCard({ cardRef, info, entry, testId, footer }) {
  const dimStyle = { color: 'var(--phosphor-dim)', textShadow: 'none' };
  const title = (entry && entry.title) || info.id || info.path || '';
  const lifecycle = info.stage ?? (entry && (entry.stage ?? entry.status)) ?? '--';
  const icon = info.icon ?? (entry && entry.icon) ?? null;
  const pillars = info.pillars ?? (entry && entry.pillars) ?? [];
  const headline = [info.type ?? (entry && entry.type) ?? '--', lifecycle, info.role]
    .filter(Boolean).join(' · ');
  return (
    <div
      ref={cardRef}
      data-testid={testId}
      style={{
        position: 'fixed', left: -9999, top: -9999, zIndex: 60,
        width: 300, maxWidth: '80vw',
        background: 'rgba(4, 10, 6, 0.94)', border: '1px solid var(--phosphor-dim)',
        boxShadow: '0 4px 18px rgba(0,0,0,0.6)',
        padding: '8px 10px', fontSize: 11, lineHeight: 1.5, color: 'var(--phosphor)',
        pointerEvents: 'none',
      }}
    >
      {icon ? (
        <img
          src={fileUrl(icon)}
          alt=""
          width={38}
          height={38}
          style={{
            float: 'right', marginLeft: 8, borderRadius: '50%',
            border: '1px solid var(--phosphor-dim)', objectFit: 'cover',
            filter: 'saturate(0.85) brightness(0.92)',
          }}
        />
      ) : null}
      <div style={{ fontWeight: 700, textShadow: 'var(--glow)', paddingRight: icon ? 44 : 0 }}>{title}</div>
      <div style={dimStyle}>{headline}</div>
      {typeof info.degree === 'number' ? (
        <div style={dimStyle}>
          degree {info.degree}
          {typeof info.outbound === 'number' ? ` (${info.outbound}↑ out · ${info.inbound}↓ in)` : ''}
        </div>
      ) : null}
      <div style={dimStyle}>
        pillars: {pillars.length ? pillars.join(' / ') : '--'}
      </div>
      {info.group ? (
        <div style={dimStyle}>
          group: <span style={{ color: info.groupColor ?? 'var(--phosphor)' }}>{info.group}</span>
        </div>
      ) : null}
      {entry && entry.forward_vector ? (
        <div style={{
          marginTop: 6, paddingTop: 6, borderTop: '1px dashed var(--phosphor-dim)',
          fontStyle: 'italic', color: 'var(--phosphor)', textShadow: 'none',
        }}>
          &ldquo;{entry.forward_vector}&rdquo;
        </div>
      ) : null}
      {entry ? (
        <div style={{ ...dimStyle, marginTop: 6, opacity: 0.75, fontSize: 10 }}>
          {[
            entry.born ? `born ${entry.born}` : null,
            entry.last_used ? `used ${entry.last_used}` : null,
            entry.use?.recent?.use > 0 ? `${entry.use.recent.use} recent` : null,
            typeof entry.link_count === 'number' ? `${entry.link_count} typed links` : null,
            entry.energy ? `energy ${entry.energy}` : null,
          ].filter(Boolean).join('  ·  ')}
        </div>
      ) : null}
      {footer ? (
        <div style={{ ...dimStyle, marginTop: 6, opacity: 0.5, fontSize: 10 }}>{footer}</div>
      ) : null}
    </div>
  );
}
