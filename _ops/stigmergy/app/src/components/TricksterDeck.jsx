import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Banner } from './primitives.jsx';
import { buildInbox } from '../lib/inbox.js';
import { buildLeanGrants, buildCardGrant } from '../lib/trickster-grants.js';
import { resolveKey, toggleSelection, selectionFor } from '../lib/trickster-keys.js';
import { filterRequests, showCounts, projectsOf, isFiltering, SHOW_KINDS } from '../lib/trickster-filter.js';
import { LEAVE_EVENT, stashInHistory, stashedInHistory } from '../lib/url-nav.js';
import { postMessage } from '../adapters/blackboard.js';
import { t } from '../lib/lexicon.js';
import TricksterCard from './trickster/TricksterCard.jsx';
import QuickBar from './trickster/QuickBar.jsx';
// DigestPanel (the auto-trickster tuning panel) is hidden for the time being —
// see the mount site below. Re-enable by restoring this import + the <DigestPanel />.
// import DigestPanel from './DigestPanel.jsx';
import LaunchModal from './queue/LaunchModal.jsx';
import AgentLaunchModal from './queue/AgentLaunchModal.jsx';
import { fetchStewards } from '../adapters/stewards.js';

// Shape an advanceSteward() result (from a card's FILE & RUN) into a one-line
// deck banner. The grant is already filed by the time this runs, so every
// branch leads with "filed" — a skipped or failed run never means the decision
// was lost. Wording mirrors the stewards deck's advance feedback so the two
// surfaces speak the same language.
export function formatRun(result, name) {
  if (result && result.ok && result.fired) {
    const cyc = result.cycle_n != null ? ` → cycle ${result.cycle_n}` : '';
    return { tone: 'ok', text: `filed · advancing @${name}${cyc}` };
  }
  if (result && result.ok && result.queued) {
    // The lane queues behind a live cycle (2026-10-13). Three shapes:
    if (result.already === 'running') return { tone: 'ok', text: `filed · @${name} is the live cycle — its run reads the answer on its next cycle` };
    if (result.already) return { tone: 'ok', text: `filed · @${name} is already queued (#${result.already}) — it reads the answer when it fires` };
    return { tone: 'ok', text: `filed · @${name} queued #${result.position}${result.current ? ` behind ${result.current}` : ''} — it fires when the lane frees` };
  }
  if (result && (result.status === 409 || result.busy)) {
    return { tone: 'warn', text: `filed · a steward cycle is already running — @${name} will pick it up next` };
  }
  if (result && result.status === 404) {
    return { tone: 'warn', text: `filed · @${name} isn't a registered steward, so nothing ran` };
  }
  const why = (result && (result.error || result.msg))
    || `run failed${result && result.status ? ` (${result.status})` : ''}`;
  return { tone: 'err', text: `filed · but the run didn't start: ${why}` };
}

const RUN_COLOR = { ok: 'var(--phosphor)', warn: 'var(--warn)', err: 'var(--error)' };

// The history-state key the deck keeps its view under (see `restored`).
const VIEW_KEY = 'trickster';

// The receipt for a filed decision — what the card held the moment it vanished
// (2026-10-13; Loudon: "the window just disappears, it would feel good to have
// a confirmation of what was submitted"). Pure, so it is unit-testable.
export function formatReceipt(filed) {
  if (!filed || !filed.name) return null;
  const when = filed.ts ? String(filed.ts).slice(11, 16) + 'Z' : '';
  const head = `filed${when ? ` ${when}` : ''} · to @${filed.name}${filed.headline ? ` · "${filed.headline}"` : ''}`;
  const pick = filed.optionLabel ? `chose: ${filed.optionLabel}` : 'no option picked — note only';
  const note = filed.notes && String(filed.notes).trim() ? String(filed.notes).trim() : null;
  return { head, pick, note, id: filed.id || null };
}

// TricksterDeck — the native catchup-first decision lane (the [T] deck).
//
// Phase 1 replaced the iframe of /trickster.html with a native card list.
// Phase 2 adds the ergonomics the standalone page proved: a per-card lean
// panel (in TricksterCard), a master FILE ALL quickbar, and a keyboard layer.
//
// Data ownership: this deck is PRESENTATIONAL, not self-fetching. App owns the
// persistent-message store (fetch + SSE + optimistic merge) and keeps the SSE
// stream open at all times for the QUEUE badge. A self-fetching deck would open
// a SECOND EventSource to the same stream whenever it mounted, so App feeds
// `messages` + `onConfirmed` down instead. One data owner, one stream, one
// source of truth — a filed grant updates this deck AND the QUEUE badge at once.
//
// Card removal is automatic: onConfirmed appends the grant to App's optimistic
// set, App re-derives buildInbox() over it, and a responded request drops out
// of pending_requests on the next render.
//
// Write paths: per-card mouse filing lives in TricksterCard (it owns its own
// sending/error state). Bulk + keyboard filing lives HERE (fileItems) — the
// deck owns the list, so FILE ALL and space-to-file are deck concerns. Both
// build the same wire-grant via the shared trickster-grants builders, so the
// message shape never forks. Per the session calibration: no batches — each
// card POSTs its own grant; FILE ALL just walks them one at a time.
export default function TricksterDeck({
  messages = [],
  onConfirmed,
  loadState = 'ok',
  loadError = null,
  onReload,
}) {
  // The view Back returns to (2026-11-04, Loudon: "when a card is open and I
  // click on its entry then I come back ... still have the card open and the
  // page scrolled"). On leave, the deck writes its view onto its own history
  // entry; a Back onto that entry finds it there and starts from it. Entering
  // by tab or `t` pushes a fresh entry with no view, so that stays collapsed.
  const [restored] = useState(() => stashedInHistory(VIEW_KEY));
  const { pending_requests: all_requests } = buildInbox(messages);
  const total = all_requests.length;
  const countLabel = total === 1 ? t('trickster.deck.count.one') : t('trickster.deck.count.many');

  // Search + filter (2026-11-04). `pending_requests` below is the FILTERED
  // list: the cards, the keyboard layer and FILE ALL all read it, so what you
  // see is what f files — a hidden card is never filed. Not persisted: a
  // forgotten filter must never hide an ask on the next visit. A project whose
  // last card was filed drops out of the picker, and its filter with it.
  const [query, setQuery] = useState(() => (restored && restored.query) || '');
  const [show, setShow] = useState(() => (restored && restored.show) || 'all');
  const [projectPick, setProjectPick] = useState(() => (restored && restored.project) || '');
  const projects = projectsOf(all_requests);
  const project = projects.some((p) => p.name === projectPick) ? projectPick : '';
  const filters = { query, show, project };
  const filtering = isFiltering(filters);
  const counts = showCounts(all_requests, filters);
  const clearFilters = () => { setQuery(''); setShow('all'); setProjectPick(''); };
  const searchRef = useRef(null);

  const pending_requests = filterRequests(all_requests, filters);
  const n = pending_requests.length;

  // The leaned subset (cards with a detected recommended option) and the
  // remainder FILE ALL deliberately won't touch.
  const leans = pending_requests
    .filter((p) => p.recommended_option)
    .map((p) => p.recommended_option);
  const remainder = n - leans.length;

  const [filingAll, setFilingAll] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);
  // Outcome of the most recent card FILE & RUN, shown as a deck banner. Lives
  // here (not on the card) because the card unmounts the instant its grant is
  // filed — the steward-advance result would vanish with it.
  const [runStatus, setRunStatus] = useState(null);
  // The last filed decision, shown as a receipt until the next file or a dismiss.
  const [receipt, setReceipt] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  // Clamp focus to the current list (it shrinks as cards are filed).
  const focused = n === 0 ? -1 : Math.min(focusedIndex, n - 1);

  // Lifted option-selection: request_id → chosen option id. Owned here (not in
  // each TricksterCard) so the keyboard layer's 1-N/Enter and the cards' mouse
  // clicks drive ONE source of truth. Entries for filed cards orphan harmlessly
  // — only read by a still-pending request_id. See trickster-keys.js.
  const [selections, setSelections] = useState({});
  const selectOption = (requestId, optionId) =>
    setSelections((prev) => toggleSelection(prev, requestId, optionId));

  // Collapsed view (2026-11-04, Loudon): every card folds to who · state · the
  // ask, so a long deck scrolls to the one ask he wants. Clicking a folded card
  // opens just that one; `opened` holds those request_ids and is cleared when
  // the whole deck flips, so EXPAND → COLLAPSE always lands fully folded.
  //
  // Collapsed is how the deck is entered, every time (2026-11-04, Loudon: "so
  // it loads fast by default"). A folded card mounts none of its pieces, audio
  // or images — measured on 26 cards: 0 frames and ~5 MB folded against 29
  // live frames, 78 players and ~28 MB expanded. EXPAND holds for this visit
  // only; remembering it would make the next entry the slow one again.
  const [compact, setCompact] = useState(() => (restored ? restored.compact !== false : true));
  const [opened, setOpened] = useState(() => (restored && restored.opened) || {});
  const toggleCompact = () => {
    setCompact((was) => !was);
    setOpened({});
  };
  const setCardOpen = (requestId, open) =>
    setOpened((prev) => {
      const next = { ...prev };
      if (open) next[requestId] = true; else delete next[requestId];
      return next;
    });

  // The card whose "open interactive" modal is open. A trickster launch drives
  // the ASKING steward (item.from) to RESOLVE this specific decision in a
  // watch+steer session — an alternative to filing a grant. When `from` is a
  // REGISTERED steward we open the construct-agent panel (the real page-agent
  // wake via buildCyclePrompt, with the decision pre-filled as the mandate);
  // otherwise we fall back to the simpler prompt launch, so a non-steward asker
  // (a coordinator handle, a one-off page) still gets a watchable session. The
  // deck owns the modals (like StewardsDeck / QueuePanel).
  const [launchContext, setLaunchContext] = useState(null);      // simple LaunchModal (fallback)
  const [agentLaunch, setAgentLaunch] = useState(null);          // { home, seed } -> AgentLaunchModal
  const [registered, setRegistered] = useState(null);            // Set of registered steward agent_ids

  // Resolve which askers are registered stewards (so we can route). One lazy
  // fetch on mount; until it loads, openLaunch falls back to the simple launch.
  useEffect(() => {
    let alive = true;
    fetchStewards().then((r) => {
      if (alive && r && r.ok) setRegistered(new Set((r.stewards || []).filter((s) => !s.missing).map((s) => s.agent_id)));
    });
    return () => { alive = false; };
  }, []);

  const openLaunch = (item) => {
    const ask = item.headline || item.resource || 'a parked decision';
    // A session request (the steward asked to be launched) gets a mandate that
    // resumes its OWN request — it wanted a live session for this work, and
    // Loudon said yes. A plain parked decision gets the resolve-this-decision
    // mandate. Both wake the same construct-agent panel.
    const wantsSession = item.kind === 'interactive_session';
    if (registered && registered.has(item.from)) {
      setAgentLaunch({
        home: item.from,
        seed: wantsSession
          ? `You asked Loudon to open this live session${item.headline ? `: "${item.headline}"` : ''}, and he said yes. Pick up exactly where your request left off${item.ground || item.rationale ? ` — ${item.ground || item.rationale}` : ''} and drive it forward with him, narrating each move before you make it. When the work reaches a natural stopping point, file the grant on your own request so the card clears.`
          : `Resolve the decision you parked for Loudon${item.headline ? `: "${item.headline}"` : ''}. Read your pending request on the TRICKSTER board, work it through, then file the grant (or steer) and continue the cycle.`,
      });
      return;
    }
    // The unregistered-asker path (a Shop sweep, a one-off page — anything with
    // no permanent steward directory). A session request lands here too, and it
    // needs the questions in hand: it is opening BECAUSE the ask was too tangled
    // to file, so a mandate that says "resolve the decision" would be wrong on
    // its face. Carry the rationale in — that is where the fork list lives.
    setLaunchContext({
      kind: 'steward',
      id: item.request_id,
      entry: item.from,
      from: item.from,
      summary: wantsSession
        ? `It asked to talk this through with you rather than leave it on a card — "${ask}". Here is what it needs decided:\n\n${item.rationale || item.ground || '(see its request on the TRICKSTER board)'}\n\nTake them ONE at a time, in order. Give your read and a recommendation on each, wait for Loudon's answer before moving to the next, and don't bundle them back up into a single question. When they are all settled, post the outcome to the board.`
        : `It paused on a decision it left you — "${ask}". Read its request on the TRICKSTER board, work it through, then resolve it (file the grant) and continue the cycle.`,
    });
  };

  // Sequentially file the leaned grants among `items`, ~350 ms apart so each
  // card's drop-out registers one at a time. Items without a lean are skipped
  // by buildLeanGrants — never auto-filed.
  async function fileItems(items) {
    if (filingAll) return;
    const grants = buildLeanGrants(items);
    if (grants.length === 0) return;
    setFilingAll(true);
    setFileErrors([]);
    const errs = [];
    for (const { item, message } of grants) {
      try {
        const persisted = await postMessage(message, 'persistent');
        if (onConfirmed) onConfirmed(persisted);
      } catch (err) {
        errs.push(`${item.request_id}: ${err.message || 'could not file'}`);
      }
      await new Promise((r) => setTimeout(r, 350));
    }
    if (errs.length) setFileErrors(errs);
    setFilingAll(false);
  }

  // File a single card's current pick — the Enter override path. Unlike
  // fileItems (which files the steward's lean), this files whatever option the
  // human selected via 1-N or a click. No note: the freeform note is the
  // mouse-driven card FILE button's job; Enter is the fast option path.
  async function fileSelected(item) {
    if (filingAll || !item) return;
    const optionId = selectionFor(selections, item.request_id);
    if (!optionId) return;
    const opt = (item.options || []).find((o) => o.id === optionId) || null;
    setFilingAll(true);
    setFileErrors([]);
    try {
      const message = buildCardGrant(item, { optionId, optionLabel: opt ? opt.label : null });
      const persisted = await postMessage(message, 'persistent');
      if (onConfirmed) onConfirmed(persisted);
    } catch (err) {
      setFileErrors([`${item.request_id}: ${err.message || 'could not file'}`]);
    } finally {
      setFilingAll(false);
    }
  }

  // Save the view onto this deck's history entry the moment a jump or deck
  // switch is about to push. The anchor is the card last clicked (the one
  // whose page you opened) or, failing that, the top card on screen, kept
  // with its distance from the top of the window.
  const rootRef = useRef(null);
  const lastClickedRef = useRef(null);
  const viewRef = useRef({});
  viewRef.current = { query, show, project, compact, opened };
  useEffect(() => {
    function onLeave() {
      const root = rootRef.current;
      if (!root) return;
      const cards = [...root.querySelectorAll('[data-testid="trickster-card"]')];
      const clicked = cards.find((c) => c.dataset.requestId === lastClickedRef.current);
      const onScreen = (c) => { const r = c.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; };
      const el = clicked && onScreen(clicked) ? clicked : cards.find(onScreen);
      const anchor = el ? { id: el.dataset.requestId, top: Math.round(el.getBoundingClientRect().top) } : null;
      stashInHistory(VIEW_KEY, { ...viewRef.current, anchor, scrollY: Math.round(window.scrollY) });
    }
    window.addEventListener(LEAVE_EVENT, onLeave);
    return () => window.removeEventListener(LEAVE_EVENT, onLeave);
  }, []);

  // Back onto a saved view: once its anchor card is on the page, put it back
  // where it sat, and focus it. Runs before paint, and again on the next frame
  // in case the browser's own scroll restore lands after us. Done once.
  const restoredScroll = useRef(false);
  useLayoutEffect(() => {
    if (restoredScroll.current || !restored || n === 0) return;
    restoredScroll.current = true;
    const place = () => {
      const el = restored.anchor && rootRef.current
        && rootRef.current.querySelector(`[data-testid="trickster-card"][data-request-id="${CSS.escape(restored.anchor.id)}"]`);
      if (el) window.scrollBy(0, el.getBoundingClientRect().top - restored.anchor.top);
      else if (typeof restored.scrollY === 'number') window.scrollTo(0, restored.scrollY);
    };
    place();
    requestAnimationFrame(place);
    const idx = restored.anchor ? pending_requests.findIndex((p) => p.request_id === restored.anchor.id) : -1;
    if (idx >= 0) setFocusedIndex(idx);
  });

  // Keyboard layer. A ref carries the latest list/focus/selection so the
  // listener stays stable (one add/remove for the deck's lifetime) without
  // going stale. resolveKey() is the pure key→action map (unit-tested); this
  // handler only owns the side effects.
  const kbRef = useRef({});
  kbRef.current = { pending_requests, focused, filingAll, selections, fileItems, fileSelected, selectOption, toggleCompact, setCardOpen };
  useEffect(() => {
    function onKey(e) {
      // Don't hijack typing in the freeform note field.
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      const st = kbRef.current;
      const action = resolveKey(e.key, {
        list: st.pending_requests,
        focused: st.focused,
        selections: st.selections,
      });
      if (!action) return;
      e.preventDefault();
      const len = st.pending_requests.length;
      switch (action.type) {
        case 'focus-next': setFocusedIndex((i) => Math.min(i + 1, len - 1)); break;
        case 'focus-prev': setFocusedIndex((i) => Math.max(i - 1, 0)); break;
        case 'file-lean': st.fileItems([action.item]); break;
        case 'file-all': st.fileItems(st.pending_requests); break;
        // A pick on a folded card opens it, so the chosen option is never hidden.
        case 'select': st.selectOption(action.requestId, action.optionId); st.setCardOpen(action.requestId, true); break;
        case 'toggle-compact': st.toggleCompact(); break;
        case 'focus-search': searchRef.current?.focus(); break;
        case 'file-pick': st.fileSelected(action.item); break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      data-testid="trickster-deck"
      ref={rootRef}
      onClickCapture={(e) => {
        const card = e.target && e.target.closest && e.target.closest('[data-testid="trickster-card"]');
        if (card) lastClickedRef.current = card.dataset.requestId || null;
      }}
    >
      <div style={{ color: 'var(--phosphor-dim)', textShadow: 'none', marginBottom: 10 }}>
        {loadState === 'ok' ? (
          <span data-testid="trickster-count">
            {filtering ? <>{n} {t('trickster.filter.of')} </> : null}{total} {countLabel}
          </span>
        ) : null}
        {onReload ? (
          <span
            data-testid="trickster-reload"
            onClick={onReload}
            style={{
              marginLeft: 12, cursor: 'pointer',
              color: 'var(--phosphor)', textShadow: 'var(--glow)',
              border: '1px solid var(--phosphor-dim)', padding: '0 6px', fontSize: 11,
            }}
          >[R] RELOAD</span>
        ) : null}
        {total > 0 ? (
          <span
            data-testid="trickster-compact-toggle"
            data-compact={compact ? 'true' : 'false'}
            role="button" tabIndex={0}
            onClick={toggleCompact}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggleCompact(); } }}
            title={compact ? 'show every card in full' : 'fold every card to who · state · the ask'}
            style={{
              marginLeft: 12, cursor: 'pointer',
              color: compact ? 'var(--bg)' : 'var(--phosphor)',
              background: compact ? 'var(--phosphor)' : 'transparent',
              textShadow: compact ? 'none' : 'var(--glow)',
              border: '1px solid var(--phosphor-dim)', padding: '0 6px', fontSize: 11,
            }}
          >{compact ? t('trickster.deck.expand') : t('trickster.deck.collapse')}</span>
        ) : null}
      </div>

      {/* Search + filter — at the top, above everything a card list carries. */}
      {total > 0 ? (
        <FilterBar
          inputRef={searchRef}
          query={query} onQuery={setQuery}
          show={show} onShow={setShow} counts={counts}
          projects={projects} project={project} onProject={setProjectPick}
          filtering={filtering} onClear={clearFilters}
        />
      ) : null}

      {/* The receipt — what was just filed, in full, since the card is gone. */}
      {receipt ? (
        <div data-testid="trickster-receipt" style={{
          border: '1px solid var(--phosphor)', color: 'var(--phosphor)', textShadow: 'var(--glow)',
          padding: '6px 10px', marginBottom: 6, fontSize: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <span>{receipt.head}</span>
            <span role="button" tabIndex={0} title="dismiss" onClick={() => setReceipt(null)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setReceipt(null); }}
              style={{ cursor: 'pointer', color: 'var(--phosphor-dim)', textShadow: 'none' }}>×</span>
          </div>
          <div style={{ color: 'var(--phosphor-dim)', textShadow: 'none', marginTop: 2 }}>{receipt.pick}</div>
          {receipt.note ? (
            <div data-testid="trickster-receipt-note" style={{ marginTop: 4, whiteSpace: 'pre-wrap', color: 'var(--phosphor-white)', textShadow: 'none', borderLeft: '2px solid var(--phosphor-dim)', paddingLeft: 8 }}>{receipt.note}</div>
          ) : null}
          {receipt.id ? <div style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 10, marginTop: 4 }}>on the board as {receipt.id}</div> : null}
        </div>
      ) : null}

      {/* FILE & RUN outcome — lives outside the n===0 branch so it stays up
          even when running the last card empties the deck. */}
      {runStatus ? (
        <div data-testid="trickster-run-status" style={{
          border: `1px solid ${RUN_COLOR[runStatus.tone]}`,
          color: RUN_COLOR[runStatus.tone], textShadow: 'var(--glow)',
          padding: '6px 10px', marginBottom: 10, fontSize: 12,
        }}>
          {runStatus.text}
        </div>
      ) : null}

      {loadState === 'error' ? (
        <div data-testid="trickster-error" style={{
          color: 'var(--error)', textShadow: 'var(--glow)',
          border: '1px solid var(--error)', padding: 12,
        }}>
          {t('trickster.deck.error')}: {loadError}
        </div>
      ) : loadState === 'loading' && n === 0 ? (
        <div data-testid="trickster-loading" style={{
          color: 'var(--phosphor-dim)', textShadow: 'none',
        }}>{t('trickster.deck.loading')}</div>
      ) : total === 0 ? (
        <div data-testid="trickster-empty" style={{
          color: 'var(--phosphor-dim)', textShadow: 'none',
          padding: '8px 0', fontSize: 14,
        }}>{t('trickster.inbox.empty')}</div>
      ) : n === 0 ? (
        <div data-testid="trickster-no-match" style={{
          color: 'var(--phosphor-dim)', textShadow: 'none',
          padding: '8px 0', fontSize: 14,
        }}>
          {t('trickster.filter.none')} --{' '}
          <span role="button" tabIndex={0} onClick={clearFilters}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); clearFilters(); } }}
            style={{ cursor: 'pointer', color: 'var(--phosphor)', textShadow: 'var(--glow)', textDecoration: 'underline' }}
          >{t('trickster.filter.clear')}</span>
        </div>
      ) : (
        <>
          <QuickBar
            leans={leans}
            remainder={remainder}
            onFileAll={() => fileItems(pending_requests)}
            busy={filingAll}
          />
          {leans.length > 0 ? (
            <div style={{
              color: 'var(--phosphor-dim)', textShadow: 'none',
              fontSize: 10, letterSpacing: '.06em', marginBottom: 10,
            }}>{t('trickster.deck.keyhint')}</div>
          ) : null}
          {fileErrors.length > 0 ? (
            <div data-testid="trickster-file-errors" style={{
              border: '1px solid var(--error)', color: 'var(--error)',
              textShadow: 'var(--glow)', padding: '6px 10px', marginBottom: 10, fontSize: 12,
            }}>
              {fileErrors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          ) : null}
          {pending_requests.map((p, i) => (
            <TricksterCard
              key={p.request_id || p.from + p.ts}
              item={p}
              onConfirmed={onConfirmed}
              onFiled={(filed) => { setReceipt(formatReceipt(filed)); if (!filed.run) setRunStatus(null); }}
              onRun={(result, name) => setRunStatus(formatRun(result, name))}
              focused={i === focused}
              selectedId={selections[p.request_id] ?? null}
              onSelectOption={(optId) => selectOption(p.request_id, optId)}
              onLaunch={openLaunch}
              compact={compact && !opened[p.request_id]}
              onToggleOpen={compact ? (open) => setCardOpen(p.request_id, open) : undefined}
            />
          ))}
        </>
      )}

      {/* The auto-trickster tuning panel (DigestPanel) — the calls a rule-engine
          WOULD make, with agree/differ to teach it whether to trust it. HIDDEN
          for the time being (2026-06-22, Loudon): not a useful feature right now.
          The engine, its rules, the digest writer, and DigestPanel.jsx all remain
          intact — this only un-mounts the UI. Re-enable: restore the import at the
          top of this file and uncomment the line below. */}
      {/* <DigestPanel /> */}

      {/* Open-interactive — drive the asking steward to resolve a decision. A
          registered steward opens the construct-agent panel (page-agent wake,
          decision pre-filled as the mandate); a non-steward asker falls back to
          the simpler prompt launch. The card opens it via onLaunch. */}
      {agentLaunch ? (
        <AgentLaunchModal home={agentLaunch.home} mandateSeed={agentLaunch.seed} onClose={() => setAgentLaunch(null)} />
      ) : null}
      {launchContext ? (
        <LaunchModal context={launchContext} onClose={() => setLaunchContext(null)} />
      ) : null}
    </div>
  );
}

// The search + filter bar. A dashed-underline search (the STATE deck's PULSE
// filter is the precedent: Esc clears, a second Esc lets go so the deck keys
// answer again), the "show" chips with what each would leave, and a project
// picker. Chips invert when on, like the [C] toggle.
function FilterBar({ inputRef, query, onQuery, show, onShow, counts, projects, project, onProject, filtering, onClear }) {
  const dim = { color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11 };
  return (
    <div data-testid="trickster-filter" style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      border: '1px solid var(--phosphor-dim)', padding: '6px 10px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ ...dim, fontSize: 12 }}>/</span>
        <input
          ref={inputRef}
          data-testid="trickster-search"
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              if (query) onQuery('');
              else e.currentTarget.blur();
            }
          }}
          placeholder={t('trickster.filter.placeholder')}
          style={{
            flex: 1, minWidth: '12ch',
            background: 'transparent', border: 'none',
            borderBottom: '1px dashed var(--phosphor-dim)',
            color: 'var(--phosphor)', textShadow: 'var(--glow)',
            fontFamily: 'var(--font-mono)', fontSize: 13,
            outline: 'none', padding: '2px 0', borderRadius: 0,
            caretColor: 'var(--phosphor-white)',
          }}
        />
        {filtering ? (
          <span data-testid="trickster-filter-clear" role="button" tabIndex={0} onClick={onClear}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onClear(); } }}
            title="clear the search and every filter"
            style={{ ...dim, cursor: 'pointer', textDecoration: 'underline' }}
          >{t('trickster.filter.clear')}</span>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {SHOW_KINDS.map((k) => {
          const on = show === k.id;
          const empty = counts[k.id] === 0 && !on;
          return (
            <span
              key={k.id}
              data-testid={`trickster-show-${k.id}`}
              data-on={on ? 'true' : 'false'}
              role="button" tabIndex={0}
              onClick={() => onShow(k.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onShow(k.id); } }}
              style={{
                cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
                padding: '0 6px', border: '1px solid var(--phosphor-dim)',
                color: on ? 'var(--bg)' : empty ? 'var(--fg3)' : 'var(--phosphor)',
                background: on ? 'var(--phosphor)' : 'transparent',
                textShadow: on || empty ? 'none' : 'var(--glow)',
              }}
            >{t(`trickster.filter.show.${k.id}`)} {counts[k.id]}</span>
          );
        })}
        <select
          data-testid="trickster-project"
          value={project}
          onChange={(e) => onProject(e.target.value)}
          style={{
            marginLeft: 'auto',
            backgroundColor: 'var(--bg)', color: 'var(--phosphor)', textShadow: 'var(--glow)',
            border: '1px solid var(--phosphor-dim)', fontFamily: 'var(--font-mono)', fontSize: 11,
            padding: '1px 6px', borderRadius: 0, outline: 'none', maxWidth: '100%',
          }}
        >
          <option value="">{t('trickster.filter.project.any')} ({projects.reduce((s, p) => s + p.n, 0)})</option>
          {projects.map((p) => <option key={p.name} value={p.name}>{p.name} ({p.n})</option>)}
        </select>
      </div>
    </div>
  );
}
