import React, { useEffect, useState, useCallback, useMemo } from 'react';
import FaceSwitch from '../FaceSwitch.jsx';
import { orderFaces, nextFace, richHref } from '../../lib/faces.js';
import { Box, Button } from '../primitives.jsx';
import { fetchScroll, saveStandingOrders, savePlan } from '../../adapters/projects.js';
import { parseMakingSections, cardSpec } from '../../lib/scroll-view.js';
import { buildInbox } from '../../lib/inbox.js';
import EntryBody from '../state/EntryBody.jsx';
import TricksterCard from '../trickster/TricksterCard.jsx';
import AgentLaunchModal from '../queue/AgentLaunchModal.jsx';
import { usePalaceRef } from '../../lib/palace-ref.jsx';
import { RunningTag, QueuedTag } from './status.jsx';
import MakingCard from './MakingCard.jsx';
import WatchPane from './WatchPane.jsx';

// ScrollView — any page's scroll (a project's, a ceremony's, a page's),
// rendered live in the terminal.
//
//   Now              — the regenerated top zone (server computes it on every
//                      fetch from what the page has, so an answer Loudon filed
//                      a minute ago already shows as "ready to advance", and a
//                      run line written a minute ago already counts).
//   Plan             — the path agreed with Loudon, on every scroll, a
//                      ceremony's too (SCHEMA v1.28); a tuning ledger's owed
//                      lines are the next run's to-do beneath it. Revised here
//                      and saved with a line on what changed and why, which
//                      lands on the making trail; a steward's proposed
//                      revision arrives as an ask below and becomes the plan
//                      when he adopts it.
//   Open asks        — the page's pending TRICKSTER cards, answerable here
//                      with the same TricksterCard the TRICKSTER deck uses
//                      (one card component, one grant builder — no fork).
//   Standing Orders  — Loudon's zone, editable here and nowhere else in the
//                      terminal. When the page keeps a tuning ledger the box
//                      asks "standing, or once?": a standing order is saved to
//                      the scroll file and read by the steward (or the
//                      ceremony's run) every time; a one-shot order goes into
//                      the ledger as owed, and the next run pays it.
//   The making       — the trail, newest first, each section's media inline.
//
// The scroll text is markdown; EntryBody (the STATE deck's renderer) draws it
// so headings, lists, tables, links and wikilinks read the same everywhere.

function ZoneTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, borderBottom: '1px solid var(--phosphor-dim)', margin: '14px 0 8px', paddingBottom: 2 }}>
      <span style={{ fontFamily: 'var(--font-display)', color: 'var(--phosphor-white)', textShadow: 'var(--glow)', fontSize: 18, textTransform: 'uppercase', letterSpacing: '.04em' }}>{children}</span>
      <span style={{ flex: 1 }} />
      {right}
    </div>
  );
}

export default function ScrollView({ home, row, worker, messages = [], onConfirmed, onBack, backLabel = 'back', onAdvance, canAdvance, feedback, onEnchant, canEnchant }) {
  const [confirmEnchant, setConfirmEnchant] = useState(false);
  // Option selection on a TricksterCard is CONTROLLED by its parent (the
  // TRICKSTER deck keeps a per-request_id map so keys and clicks share one
  // truth). The scroll renders the same card, so it must own the same map —
  // without it an option click is a no-op and "file" sends a notes-only grant
  // (2026-09-23: Loudon picked MUSICGEN-MELODY here and the board recorded
  // option_id null). One pick per ask; clicking the pick again clears it.
  const [selections, setSelections] = useState({});
  const toggleOption = useCallback((requestId, optionId) => {
    setSelections((prev) => ({ ...prev, [requestId]: prev[requestId] === optionId ? null : optionId }));
  }, []);
  const [scroll, setScroll] = useState(null);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState('');
  const [ordersDirty, setOrdersDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [launch, setLaunch] = useState(false);
  const [planEditing, setPlanEditing] = useState(false);
  const [planDraft, setPlanDraft] = useState('');
  const [planWhy, setPlanWhy] = useState('');
  const [planSaving, setPlanSaving] = useState(false);
  const [planSaved, setPlanSaved] = useState(null);
  const [orderKind, setOrderKind] = useState('standing');
  const [onceDraft, setOnceDraft] = useState('');
  // A ceremony, or another page that keeps a tuning ledger and no steward.
  const isLedgerRow = !!row && (row.kind === 'ceremony' || row.kind === 'page');
  const isCeremony = !!row && row.kind === 'ceremony';
  const palace = usePalaceRef();
  useEffect(() => { palace?.ensureLoaded?.(); }, [palace?.ensureLoaded]);

  const load = useCallback(async () => {
    const r = await fetchScroll(home);
    if (!r.ok) { setError(r.error || 'could not load the scroll'); return; }
    setError(null);
    setScroll(r);
    // Standing orders live on the scroll for every page, a ceremony's too.
    setOrders((cur) => (ordersDirty ? cur : (r.zones?.orders || '')));
  }, [home, ordersDirty]);

  useEffect(() => { load(); }, [load]);
  // Re-read the Now zone as the board moves (a filed grant, a cycle landing).
  useEffect(() => {
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  const myAsks = useMemo(() => buildInbox(messages).pending_requests.filter((p) => p.from === home), [messages, home]);
  const [watching, setWatching] = useState(false);
  const sections = useMemo(() => parseMakingSections(scroll?.zones?.making || ''), [scroll]);
  // The trail as cards (2026-10-13): each section joined to its board message
  // so it plays as it did the day it shipped; media mounts as you reach it.
  const cards = useMemo(() => sections.map((s) => cardSpec(s, messages)), [sections, messages]);
  const index = palace?.index || new Map();
  const refIndex = palace?.refIndex || null;
  const onNavigate = palace?.openEntryInState || null;
  // The face switch, SCROLL lit: the home entry's faces come from the palace
  // name index (the /api/entries summaries), and this view is a scroll face
  // whether or not the file has been written yet.
  const homeRef = palace?.refIndex?.get?.(home) ?? null;
  const homePath = (row && row.path) || homeRef?.path || null;
  const scrollFaces = orderFaces([...(homeRef?.faces || ['text']), 'scroll']);
  const selectFace = (f) => {
    if (f === 'text' && homePath && onNavigate) return onNavigate(homePath);
    if (f === 'rich' && homePath) return window.location.assign(richHref(homePath, import.meta.env.BASE_URL));
    return undefined;
  };
  useEffect(() => {
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== 'f' && e.key !== 'F') return;
      const t = e.target;
      if (t && (/input|textarea|select/i.test(t.tagName) || t.isContentEditable)) return;
      e.preventDefault();
      selectFace(nextFace(scrollFaces, 'scroll'));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const running = !!(worker && worker.running && worker.current === home);

  const hasLedger = !!(scroll && scroll.tuning);
  const once = hasLedger && orderKind === 'once';

  async function doSave() {
    setSaving(true); setSaved(null);
    if (once) {
      const r = await saveStandingOrders(home, onceDraft, 'once');
      if (r.ok) { setScroll(r); setOnceDraft(''); setSaved({ tone: 'ok', text: `added to ${r.tuning} as owed — the next run's tail read picks it up` }); }
      else setSaved({ tone: 'err', text: r.error === 'empty-order' ? 'nothing to add' : (r.error || 'save failed') });
    } else {
      const r = await saveStandingOrders(home, orders, 'standing');
      if (r.ok) { setScroll(r); setOrdersDirty(false); setSaved({ tone: 'ok', text: `saved to ${r.path} — ${row && row.stewarded ? 'the steward reads it at its next cycle' : 'every run reads it before it starts'}` }); }
      else setSaved({ tone: 'err', text: r.error || 'save failed' });
    }
    setSaving(false);
  }

  function startPlanEdit() {
    setPlanDraft(scroll?.zones?.plan || '');
    setPlanWhy('');
    setPlanSaved(null);
    setPlanEditing(true);
  }

  async function doSavePlan() {
    setPlanSaving(true); setPlanSaved(null);
    const r = await savePlan(home, planDraft, planWhy);
    if (r.ok) { setScroll(r); setPlanEditing(false); setPlanSaved({ tone: 'ok', text: 'saved — the change is logged at the top of the making trail' }); }
    else setPlanSaved({ tone: 'err', text: r.error === 'unchanged' ? 'the plan is unchanged' : (r.error || 'save failed') });
    setPlanSaving(false);
  }

  const fbColor = { ok: 'var(--phosphor)', warn: 'var(--warn)', err: 'var(--error)', dim: 'var(--phosphor-dim)' };

  return (
    <div data-testid="scroll-view" data-home={home}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
        <span data-testid="scroll-back" onClick={onBack} style={{ color: 'var(--phosphor)', textShadow: 'var(--glow)', cursor: 'pointer', border: '1px solid var(--phosphor-dim)', padding: '1px 8px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em' }}>← {backLabel}</span>
        <span
          data-testid="scroll-title"
          onClick={row && row.path && onNavigate ? () => onNavigate(row.path) : undefined}
          title={row && row.path ? `read the entry — ${row.path}` : undefined}
          style={{ fontFamily: 'var(--font-display)', color: 'var(--phosphor-white)', textShadow: 'var(--glow-strong)', fontSize: 24, textTransform: 'uppercase', cursor: row && row.path && onNavigate ? 'pointer' : 'default' }}
        >{home}</span>
        {isLedgerRow ? <span data-testid="scroll-ceremony-meta" style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11 }}>{isCeremony ? 'ceremony' : 'page'} · {row.version ? `v${row.version}` : 'unversioned'} · {row.version ? (row.runs_since ? `${row.runs_since} run${row.runs_since === 1 ? '' : 's'} since it changed` : 'not yet run since it changed') : `${row.runs_since || 0} run${row.runs_since === 1 ? '' : 's'}`}{row.owed && row.owed.length ? ` · ${row.owed.length} owed` : ''}</span>
          : row ? <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11 }}>{row.status || '—'} · {row.stage || '—'}{row.stewarded ? ` · cycle ${row.iteration ?? 0}` : ' · no steward'}</span> : null}
        {running ? <RunningTag name={home} /> : row && row.queued ? <QueuedTag name={home} position={row.queued} /> : null}
        <span style={{ flex: 1 }} />
        {row && row.stewarded ? (
          <>
            {running || watching ? <span data-testid="scroll-watch"><Button tone={watching ? 'primary' : 'default'} onClick={() => setWatching((w) => !w)}>{watching ? 'watching' : 'watch'}</Button></span> : null}
            <span data-testid={`steward-launch-${String(home).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}><Button tone="default" disabled={running} onClick={() => setLaunch(true)}>launch interactive</Button></span>
            <span data-testid="scroll-advance"><Button tone="primary" disabled={!canAdvance} onClick={onAdvance}>{row.queued ? `queued #${row.queued}` : `advance (run up to ${row.run_cap || 1})`}</Button></span>
          </>
        ) : row && onEnchant ? (confirmEnchant ? (
          <>
            <span style={{ color: 'var(--warn)', textShadow: 'var(--glow)', fontSize: 11 }}>give {home} a steward?</span>
            <span data-testid="scroll-enchant-confirm"><Button tone="primary" disabled={!canEnchant} onClick={() => { setConfirmEnchant(false); onEnchant(); }}>confirm</Button></span>
            <Button tone="default" onClick={() => setConfirmEnchant(false)}>cancel</Button>
          </>
        ) : (
          <span data-testid="scroll-enchant"><Button tone="primary" disabled={!canEnchant} onClick={() => setConfirmEnchant(true)}>enchant a steward</Button></span>
        )) : null}
        {scroll ? <a href={`/api/open?path=${encodeURIComponent(scroll.path)}`} style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11, textDecoration: 'none', borderBottom: '1px dashed currentColor' }} title={scroll.path}>{scroll.exists ? 'open the file' : (isCeremony ? 'not on disk yet — scroll.js --ceremonies writes it' : isLedgerRow ? 'not on disk yet — a save, or scroll.js --home, writes it' : 'not on disk yet — first cycle or save creates it')}</a> : null}
        <FaceSwitch faces={scrollFaces} current="scroll" onSelect={selectFace} />
      </div>
      {watching ? <WatchPane home={home} running={running} onClose={() => setWatching(false)} /> : null}
      {feedback ? <div style={{ color: fbColor[feedback.tone], textShadow: feedback.tone === 'dim' ? 'none' : 'var(--glow)', fontSize: 12, marginBottom: 8 }}>{feedback.text}</div> : null}
      {error ? <div data-testid="scroll-error" style={{ color: 'var(--error)', textShadow: 'var(--glow)', border: '1px solid var(--error)', padding: 8 }}>{error}</div> : null}
      {!scroll && !error ? <div style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>loading the scroll…</div> : null}

      {scroll ? (
        <>
          {/* The Now zone is written by the machine for the steward and the runs
              to read, so it sits folded (2026-10-18; Loudon: "looks important
              but not really needed for the human users"). What waits on him is
              under Open asks below, unfolded. */}
          <details data-testid="scroll-now-fold" style={{ border: '1px dashed var(--phosphor-dim)', padding: '4px 10px', marginBottom: 4 }}>
            <summary style={{ cursor: 'pointer', color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {`now  --  regenerated ${scroll.ts ? scroll.ts.replace('T', ' ').slice(0, 16) + 'Z' : ''} · machine-owned, kept for the steward and the runs`}
            </summary>
            <div data-testid="scroll-now" style={{ marginTop: 8 }}>
              <EntryBody body={scroll.zones.now.replace(/^## Now\s*/, '')} index={index} refIndex={refIndex} onNavigate={onNavigate} />
            </div>
          </details>

          <ZoneTitle right={<span style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11 }}>agreed with you — it changes only with your yes, and every change lands on the trail</span>}>Plan</ZoneTitle>
          <div data-testid="scroll-plan">
            {planEditing ? (
              <>
                <textarea
                  data-testid="scroll-plan-input"
                  value={planDraft}
                  onChange={(e) => { setPlanDraft(e.target.value); setPlanSaved(null); }}
                  placeholder="Where this is going, in a sentence or two — then the moves ahead, in order, each named by what it does."
                  rows={Math.max(6, Math.min(24, (planDraft.match(/\n/g) || []).length + 2))}
                  style={{ width: '100%', boxSizing: 'border-box', background: 'var(--phosphor-deep)', color: 'var(--phosphor)', textShadow: 'var(--glow)', border: '1px solid var(--phosphor-dim)', borderRadius: 0, fontFamily: 'var(--font-mono)', fontSize: 13, padding: 8, outline: 'none', caretColor: 'var(--phosphor-white)', resize: 'vertical' }}
                />
                <input
                  data-testid="scroll-plan-why"
                  value={planWhy}
                  onChange={(e) => setPlanWhy(e.target.value)}
                  placeholder="What changed, and why — this line goes on the making trail"
                  style={{ width: '100%', boxSizing: 'border-box', marginTop: 6, background: 'var(--phosphor-deep)', color: 'var(--phosphor)', textShadow: 'var(--glow)', border: '1px solid var(--phosphor-dim)', borderRadius: 0, fontFamily: 'var(--font-mono)', fontSize: 13, padding: 6, outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
                  <span data-testid="scroll-plan-save"><Button tone="primary" disabled={planSaving || planDraft.trim() === (scroll.zones.plan || '').trim()} onClick={doSavePlan}>{planSaving ? 'saving…' : 'save the plan'}</Button></span>
                  <Button tone="default" onClick={() => { setPlanEditing(false); setPlanSaved(null); }}>cancel</Button>
                  {planSaved ? <span style={{ color: fbColor[planSaved.tone], textShadow: 'var(--glow)', fontSize: 11 }}>{planSaved.text}</span> : null}
                </div>
              </>
            ) : (
              <>
                {scroll.zones.plan
                  ? <EntryBody body={scroll.zones.plan} index={index} refIndex={refIndex} onNavigate={onNavigate} />
                  : <div style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 12 }}>no plan agreed yet — the work leans on the forward vector.</div>}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
                  <span data-testid="scroll-plan-edit"><Button tone="default" onClick={startPlanEdit}>{scroll.zones.plan ? 'revise the plan' : 'write a plan'}</Button></span>
                  {planSaved ? <span style={{ color: fbColor[planSaved.tone], textShadow: 'var(--glow)', fontSize: 11 }}>{planSaved.text}</span> : null}
                </div>
              </>
            )}
          </div>

          {isLedgerRow && !myAsks.length ? null : <>
          <ZoneTitle right={<span style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11 }}>{myAsks.length ? 'answer here — same cards as the TRICKSTER deck' : 'nothing waiting on you'}</span>}>Open asks</ZoneTitle>
          <div data-testid="scroll-asks">
            {myAsks.length === 0 ? <div style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 12 }}>none.</div> : null}
            {myAsks.map((p) => (
              <TricksterCard
                key={p.request_id || p.from + p.ts}
                item={p}
                onConfirmed={onConfirmed}
                onRun={() => {}}
                onLaunch={() => setLaunch(true)}
                selectedId={selections[p.request_id] ?? null}
                onSelectOption={(optionId) => toggleOption(p.request_id, optionId)}
              />
            ))}
          </div>
          </>}

          <ZoneTitle right={<span style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11 }}>{once ? 'once — goes into the tuning ledger as owed, and the next run pays it' : (row && row.stewarded ? 'yours — the steward reads this before anything else, every cycle' : 'yours — they hold until you revoke them, and every run reads them first')}</span>}>Standing Orders</ZoneTitle>
          <div data-testid="scroll-orders">
            {hasLedger ? (
              // The deck asks which kind (SCHEMA — Reference §6): a standing
              // order stays on the scroll; a one-shot order is the next run's job.
              <div data-testid="scroll-order-kind" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: 11 }}>
                <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>standing, or once?</span>
                <span data-testid="scroll-order-kind-standing"><Button tone={orderKind === 'standing' ? 'primary' : 'default'} onClick={() => { setOrderKind('standing'); setSaved(null); }}>standing</Button></span>
                <span data-testid="scroll-order-kind-once"><Button tone={orderKind === 'once' ? 'primary' : 'default'} onClick={() => { setOrderKind('once'); setSaved(null); }}>once</Button></span>
              </div>
            ) : null}
            {once ? (
              <div data-testid="scroll-ledger-orders" style={{ fontSize: 12, marginBottom: 8 }}>
                {(scroll.ledger_orders || []).length === 0 ? <div style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>no one-shot orders in the ledger yet.</div> : null}
                {(scroll.ledger_orders || []).map((o, i) => (
                  <div key={`${o.date}-${i}`} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '2px 0' }}>
                    <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none', whiteSpace: 'nowrap' }}>{o.date}</span>
                    <span style={{ flex: 1, color: 'var(--phosphor)' }}>{o.text}</span>
                    <span style={{ color: o.owed ? 'var(--warn)' : 'var(--phosphor-dim)', textShadow: o.owed ? 'var(--glow)' : 'none', fontSize: 11, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '.04em' }}>{o.status}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {once ? (
              <textarea
                data-testid="scroll-orders-once-input"
                value={onceDraft}
                onChange={(e) => { setOnceDraft(e.target.value); setSaved(null); }}
                placeholder="A job for the next run only. It goes into the tuning ledger as owed; the run that does it marks it paid."
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--phosphor-deep)', color: 'var(--phosphor)', textShadow: 'var(--glow)', border: '1px solid var(--phosphor-dim)', borderRadius: 0, fontFamily: 'var(--font-mono)', fontSize: 13, padding: 8, outline: 'none', caretColor: 'var(--phosphor-white)', resize: 'vertical' }}
              />
            ) : (
              <textarea
                data-testid="scroll-orders-input"
                value={orders}
                onChange={(e) => { setOrders(e.target.value); setOrdersDirty(true); setSaved(null); }}
                placeholder={isLedgerRow ? 'A direction that holds until you revoke it. Every run reads it before it starts.' : "Taste, priorities, 'stop asking me about X', 'always prefer Y'. Write it once here instead of answering it every cycle."}
                rows={Math.max(4, Math.min(16, (orders.match(/\n/g) || []).length + 2))}
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--phosphor-deep)', color: 'var(--phosphor)', textShadow: 'var(--glow)', border: '1px solid var(--phosphor-dim)', borderRadius: 0, fontFamily: 'var(--font-mono)', fontSize: 13, padding: 8, outline: 'none', caretColor: 'var(--phosphor-white)', resize: 'vertical' }}
              />
            )}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
              <span data-testid="scroll-orders-save"><Button tone="primary" disabled={saving || (once ? !onceDraft.trim() : !ordersDirty)} onClick={doSave}>{saving ? 'saving…' : (once ? 'add to the ledger' : 'save standing orders')}</Button></span>
              {!once && ordersDirty ? <span style={{ color: 'var(--warn)', textShadow: 'var(--glow)', fontSize: 11 }}>unsaved</span> : null}
              {saved ? <span style={{ color: fbColor[saved.tone], textShadow: 'var(--glow)', fontSize: 11 }}>{saved.text}</span> : null}
            </div>
          </div>

          <ZoneTitle right={<span style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11 }}>{sections.filter((s) => s.id).length} {isLedgerRow ? `run${sections.filter((s) => s.id).length === 1 ? '' : 's'} and changes` : `made thing${sections.filter((s) => s.id).length === 1 ? '' : 's'}`} · newest first</span>}>The making</ZoneTitle>
          <div data-testid="scroll-making" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cards.map((c, i) => (
              <MakingCard key={c.id || `free-${i}`} spec={c} index={index} refIndex={refIndex} onNavigate={onNavigate} />
            ))}
          </div>
        </>
      ) : null}

      {launch ? <AgentLaunchModal home={home} onClose={() => setLaunch(false)} /> : null}
    </div>
  );
}
