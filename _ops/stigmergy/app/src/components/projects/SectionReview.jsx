import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../primitives.jsx';
import { sendAnswer } from '../../adapters/projects.js';

// SectionReview — where Loudon answers a trail section, in the scroll.
// (2026-11-17: "the best place for me to review would be in stigmergy in the
// scroll itself … a small review option under the sound players".)
//
// The unit is the section and its one question; a mark on a single file
// (pick · flag · a note) rides inside that one answer, so a section of
// twenty-five takes stays one answer and not twenty-five (Review Layer §
// Granularity). Two pieces, one draft:
//   <FileMarks>      the small row under each player, image or frame
//   <SectionAnswer>  the section's foot: the question, what he has said so
//                    far, the box and the one Send
// The draft is kept in localStorage, keyed on page and section, because a
// card's media unmount when it scrolls far away and the scroll re-reads every
// few seconds; nothing he typed may be lost to either. A send that lands
// clears it; a send that fails keeps every word.
// The answer itself is written by the server into the scroll section
// (server/scroll-answer.js); this component never writes a file.

const dim = { color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11, fontFamily: 'var(--font-mono)' };
const EMPTY = { words: '', marks: {} };
const keyOf = (home, section) => `scrollreview:${home}:${section}`;

function readDraft(home, section) {
  try {
    const d = JSON.parse(localStorage.getItem(keyOf(home, section)) || 'null');
    if (d && typeof d === 'object') return { words: typeof d.words === 'string' ? d.words : '', marks: d.marks && typeof d.marks === 'object' ? d.marks : {} };
  } catch { /* an unreadable draft is no draft */ }
  return EMPTY;
}

/** The draft as the server takes it: one mark per kind set on a file. */
export function marksOf(draft) {
  const out = [];
  for (const [path, m] of Object.entries(draft.marks || {})) {
    const note = typeof m.note === 'string' ? m.note.trim() : '';
    if (m.pick) out.push({ kind: 'pick', path, note: m.flag ? '' : note });
    if (m.flag) out.push({ kind: 'flag', path, note });
    if (!m.pick && !m.flag && note) out.push({ kind: 'note', path, note });
  }
  return out;
}

export const draftIsEmpty = (draft) => !String(draft.words || '').trim() && marksOf(draft).length === 0;

/** One section's draft, shared by its file rows and its foot. */
export function useReviewDraft(home, section) {
  const [draft, setDraft] = useState(() => readDraft(home, section));
  useEffect(() => { setDraft(readDraft(home, section)); }, [home, section]);
  const update = useCallback((fn) => {
    setDraft((cur) => {
      const next = fn(cur);
      try {
        if (draftIsEmpty(next)) localStorage.removeItem(keyOf(home, section));
        else localStorage.setItem(keyOf(home, section), JSON.stringify(next));
      } catch { /* a full or closed store only costs the keeping */ }
      return next;
    });
  }, [home, section]);
  const setWords = useCallback((words) => update((d) => ({ ...d, words })), [update]);
  const setMark = useCallback((path, patch) => update((d) => ({ ...d, marks: { ...d.marks, [path]: { ...(d.marks[path] || {}), ...patch } } })), [update]);
  const clear = useCallback(() => update(() => EMPTY), [update]);
  return { draft, setWords, setMark, clear };
}

function Pin({ on, children, onClick, title, testId, tone }) {
  const color = on ? (tone || 'var(--phosphor-white)') : 'var(--phosphor)';
  return (
    <span data-testid={testId} data-on={on ? 'true' : 'false'} role="button" tabIndex={0} title={title}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      style={{ ...dim, fontSize: 12, color, textShadow: on ? 'var(--glow)' : 'none', cursor: 'pointer', userSelect: 'none', border: `1px solid ${on ? color : 'var(--phosphor-dim)'}`, padding: '1px 8px' }}
    >{on ? '◆' : '◇'} {children}</span>
  );
}

/** The row under one player, image or frame. */
export function FileMarks({ path, review }) {
  const m = review.draft.marks[path] || {};
  const [open, setOpen] = useState(!!m.note);
  const has = !!(m.note && m.note.trim());
  return (
    <div data-testid="file-marks" data-path={path} style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <Pin testId="mark-pick" on={!!m.pick} title="this is the one" onClick={() => review.setMark(path, { pick: !m.pick })}>pick</Pin>
        <Pin testId="mark-flag" on={!!m.flag} tone="var(--warn)" title="something is wrong with this one" onClick={() => review.setMark(path, { flag: !m.flag })}>flag</Pin>
        <Pin testId="mark-note" on={has || open} title="a note on this one" onClick={() => setOpen((o) => !o)}>note</Pin>
      </div>
      {open ? (
        <input
          data-testid="mark-note-input"
          value={m.note || ''}
          onChange={(e) => review.setMark(path, { note: e.target.value })}
          placeholder="a note on this one — it goes with your answer below"
          style={{ marginTop: 4, width: '100%', maxWidth: '78ch', background: 'transparent', color: 'var(--phosphor)', border: '1px solid var(--phosphor-dim)', fontFamily: 'var(--font-mono)', fontSize: 12, padding: '3px 6px', boxSizing: 'border-box' }}
        />
      ) : null}
    </div>
  );
}

const SENSE_WORD = { heard: 'heard', seen: 'seen', 'heard and seen': 'heard and seen' };

function PastAnswer({ answer, earlier }) {
  return (
    <div data-testid="section-answered" data-earlier={earlier ? 'true' : 'false'} style={{ borderLeft: `2px solid ${earlier ? 'var(--warn)' : 'var(--phosphor)'}`, paddingLeft: 8, marginTop: 6 }}>
      <div style={dim}>you answered · {answer.date || '—'}{answer.sense ? ` · ${SENSE_WORD[answer.sense] || answer.sense}` : ''}{earlier ? <span style={{ color: 'var(--warn)' }}> · about an earlier file</span> : null}</div>
      {answer.words ? <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '78ch', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--phosphor-white)', marginTop: 2 }}>{answer.words}</div> : null}
      {answer.marks.map((k, i) => (
        <div key={i} style={{ ...dim, fontSize: 12, color: k.kind === 'flag' ? 'var(--warn)' : 'var(--phosphor)', marginTop: 1 }}>◆ {k.kind} · {k.file}{k.note ? ` — ${k.note}` : ''}</div>
      ))}
    </div>
  );
}

/**
 * The section's foot. `state` is 'waiting' | 'earlier' | 'answered' | null
 * (lib/scroll-answers.js sectionState); `stale` the files remade since his
 * newest answer; `onAnswered` takes the fresh scroll the server hands back.
 */
export function SectionAnswer({ home, section, question, answers = [], state, stale = [], review, onAnswered }) {
  const [sending, setSending] = useState(false);
  const [said, setSaid] = useState(null);
  const [open, setOpen] = useState(false);
  const empty = draftIsEmpty(review.draft);
  const waiting = state === 'waiting' || state === 'earlier';
  // The box is open when the section waits on him or a draft is in hand;
  // an answered section, or one that asks nothing, opens on a click.
  const showBox = waiting || !empty || open;
  const marks = marksOf(review.draft);

  async function send() {
    if (sending || empty) return;
    setSending(true); setSaid(null);
    const r = await sendAnswer(home, section, review.draft.words, marks);
    if (r.ok) {
      review.clear(); setOpen(false);
      const a = r.answer || {};
      const where = [a.ledger ? 'on the ledger as owed a review' : null, a.board_id ? 'on the board' : null, a.commit ? `committed ${a.commit}` : null].filter(Boolean).join(' · ');
      setSaid({ tone: a.notes && a.notes.length ? 'warn' : 'ok', text: `kept beside the proof${where ? ` · ${where}` : ''}${a.notes && a.notes.length ? ` — ${a.notes.join('; ')}` : ''}` });
      if (onAnswered) onAnswered(r);
    } else {
      setSaid({ tone: 'err', text: `not sent — your words are kept. ${r.error || 'the server did not answer'}` });
    }
    setSending(false);
  }

  const tone = { ok: 'var(--phosphor)', warn: 'var(--warn)', err: 'var(--error)' };
  return (
    <div data-testid="section-review" data-state={state || 'none'} style={{ marginTop: 10, borderTop: '1px dashed var(--phosphor-dim)', paddingTop: 8 }}>
      {question ? (
        <div data-testid="section-question" style={{ maxWidth: '78ch', fontFamily: 'var(--font-mono)', fontSize: 13, color: waiting ? 'var(--phosphor-white)' : 'var(--phosphor-dim)', textShadow: waiting ? 'var(--glow)' : 'none' }}>
          <span style={{ ...dim, color: waiting ? 'var(--warn)' : 'var(--phosphor-dim)' }}>{waiting ? 'waiting on you · ' : 'the question · '}</span>{question}
        </div>
      ) : waiting ? <div style={{ ...dim, color: 'var(--warn)' }}>waiting on you · nobody has heard or seen this yet</div> : null}
      {answers.map((a, i) => <PastAnswer key={i} answer={a} earlier={i === answers.length - 1 && state === 'earlier'} />)}
      {state === 'earlier' && stale.length ? <div style={{ ...dim, color: 'var(--warn)', marginTop: 4 }}>remade since you answered: {stale.map((p) => p.split('/').pop()).join(', ')}</div> : null}
      {showBox ? (
        <div style={{ marginTop: 6 }}>
          <textarea
            data-testid="section-answer-input"
            value={review.draft.words}
            onChange={(e) => review.setWords(e.target.value)}
            placeholder={answers.length ? 'add to this, in your words' : 'your answer, in your words'}
            rows={Math.max(2, Math.min(10, (review.draft.words.match(/\n/g) || []).length + 2))}
            style={{ width: '100%', maxWidth: '78ch', background: 'transparent', color: 'var(--phosphor)', border: '1px solid var(--phosphor-dim)', fontFamily: 'var(--font-mono)', fontSize: 13, padding: '4px 6px', boxSizing: 'border-box', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            <span data-testid="section-answer-send"><Button tone="primary" disabled={sending || empty} onClick={send}>{sending ? 'sending…' : 'send'}</Button></span>
            {marks.length ? <span data-testid="section-answer-marks" style={dim}>with {marks.length} mark{marks.length === 1 ? '' : 's'}: {marks.map((k) => `${k.kind} ${k.path.split('/').pop()}`).join(' · ')}</span> : null}
            {!empty ? <span style={{ ...dim, color: 'var(--warn)' }}>unsent</span> : null}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 4 }}>
          <span data-testid="section-answer-open" role="button" tabIndex={0} onClick={() => setOpen(true)} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(true); }} style={{ ...dim, cursor: 'pointer', borderBottom: '1px dashed currentColor' }}>{answers.length ? '◇ add to this' : '◇ leave a word on this'}</span>
        </div>
      )}
      {said ? <div data-testid="section-answer-said" style={{ ...dim, color: tone[said.tone], textShadow: 'var(--glow)', marginTop: 4 }}>{said.text}</div> : null}
    </div>
  );
}
