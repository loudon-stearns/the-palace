import React, { useEffect, useState, useCallback } from 'react';
import { fetchProjects, enchantProject } from '../../adapters/projects.js';
import { advanceSteward } from '../../adapters/stewards.js';
import { advanceFeedback, enchantFeedback } from './steward-feedback.js';
import ScrollView from './ScrollView.jsx';

// ScrollHost — one page's scroll, opened from any deck (`?scroll=<home>`).
// App mounts it over whichever deck is lit, so reading an entry in STATE and
// switching to its scroll keeps you in STATE, and back returns to the page.
//
// It finds the page's row the way the PROJECTS deck lists them: a project, a
// service, a ceremony, a page with a tuning ledger, or none at all (a hub or a
// concept may keep a scroll with no row, and the scroll still reads). It owns
// the two steward acts the scroll offers, advance and enchant; a ceremony or a
// ledger page has no steward, so it gets neither.

export default function ScrollHost({ home, messages = [], onConfirmed, onBack, backLabel }) {
  const [data, setData] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const r = await fetchProjects();
    if (r.ok) setData(r);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  const byHome = (list) => (list || []).find((r) => r.home === home) || null;
  const ledgerRow = byHome(data?.ceremonies) || byHome(data?.pages);
  const row = byHome(data?.projects) || byHome(data?.services) || ledgerRow;
  const worker = data?.worker ?? {};

  async function doAdvance() {
    setBusy(true); setFeedback(null);
    setFeedback(advanceFeedback(home, await advanceSteward(home)));
    setBusy(false); refresh();
  }

  async function doEnchant() {
    setBusy(true); setFeedback(null);
    setFeedback(enchantFeedback(home, await enchantProject(home)));
    setBusy(false); refresh();
  }

  return (
    <div data-testid="scroll-screen" style={{ width: '100%' }}>
      <ScrollView
        home={home}
        row={row}
        worker={worker}
        messages={messages}
        onConfirmed={onConfirmed}
        onBack={onBack}
        backLabel={backLabel}
        onAdvance={ledgerRow ? undefined : doAdvance}
        canAdvance={!ledgerRow && !!row && row.stewarded && !row.running && !row.queued && !busy}
        onEnchant={ledgerRow ? undefined : doEnchant}
        canEnchant={!ledgerRow && !!row && !row.stewarded && !busy}
        feedback={feedback}
      />
    </div>
  );
}
