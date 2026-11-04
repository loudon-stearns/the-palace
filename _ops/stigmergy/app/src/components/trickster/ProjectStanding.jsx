import React, { useEffect, useState } from 'react';
import { fetchScroll } from '../../adapters/projects.js';
import { usePalaceRef } from '../../lib/palace-ref.jsx';
import EntryBody from '../state/EntryBody.jsx';
import { t } from '../../lib/lexicon.js';

// ProjectStanding — the asking project's agreed Plan and Loudon's Standing
// Orders, read from its scroll, inside a card's ▸more fold (2026-11-04,
// Loudon: "we need to be able to read the project's plan and standing orders").
//
// Read-only here: the scroll is where they are written (its own PLAN and
// STANDING ORDERS zones), and the link at the foot opens it. The card mounts
// this only while the fold is open, so a folded card — or a closed fold —
// never asks the server for a scroll. The read is the scroll endpoint without
// `write`, which regenerates the Now zone in memory and writes nothing.
export default function ProjectStanding({ home }) {
  const palace = usePalaceRef();
  const [state, setState] = useState({ kind: 'loading' });

  useEffect(() => {
    let live = true;
    fetchScroll(home).then((r) => {
      if (!live) return;
      if (!r.ok) setState({ kind: 'none', error: r.status === 404 ? null : r.error });
      else setState({ kind: 'ok', plan: (r.zones && r.zones.plan) || '', orders: (r.zones && r.zones.orders) || '' });
    });
    return () => { live = false; };
  }, [home]);

  if (state.kind === 'loading') {
    return <div data-testid="card-standing-loading" style={dimNote}>{t('trickster.card.standing.loading')}</div>;
  }
  if (state.kind === 'none') {
    return <div data-testid="card-standing-none" style={dimNote}>{state.error ? `${t('trickster.card.standing.error')}: ${state.error}` : t('trickster.card.standing.noscroll')}</div>;
  }

  const index = new Map();
  const refIndex = palace?.refIndex || null;
  const onNavigate = palace?.openEntryInState || null;
  const blank = (s) => !s || !s.trim() || /^_?none yet\.?_?$/i.test(s.trim());
  return (
    <div data-testid="card-standing" style={{ marginTop: 8 }}>
      <Zone title={t('trickster.card.standing.plan')} testId="card-plan">
        {blank(state.plan)
          ? <div style={dimNote}>{t('trickster.card.standing.noplan')}</div>
          : <EntryBody body={state.plan} index={index} refIndex={refIndex} onNavigate={onNavigate} />}
      </Zone>
      <Zone title={t('trickster.card.standing.orders')} testId="card-orders">
        {blank(state.orders)
          ? <div style={dimNote}>{t('trickster.card.standing.noorders')}</div>
          : <EntryBody body={state.orders} index={index} refIndex={refIndex} onNavigate={onNavigate} />}
      </Zone>
      {palace?.openScroll ? (
        <span
          data-testid="card-standing-scroll"
          role="button" tabIndex={0}
          onClick={() => palace.openScroll(home)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); palace.openScroll(home); } }}
          title={`open ${home}'s scroll, where the plan and orders are written`}
          style={{ ...dimNote, cursor: 'pointer', textDecoration: 'underline' }}
        >{t('trickster.card.standing.open')}</span>
      ) : null}
    </div>
  );
}

function Zone({ title, testId, children }) {
  return (
    <div data-testid={testId} style={{ borderLeft: '2px solid var(--phosphor-dim)', paddingLeft: 8, margin: '0 0 10px' }}>
      <div style={{
        color: 'var(--phosphor-dim)', textShadow: 'none', fontFamily: 'var(--font-mono)',
        fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4,
      }}>{title}</div>
      <div style={{ fontSize: 12 }}>{children}</div>
    </div>
  );
}

const dimNote = {
  color: 'var(--phosphor-dim)', textShadow: 'none',
  fontFamily: 'var(--font-mono)', fontSize: 11,
};
