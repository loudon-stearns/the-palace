import React, { useEffect, useRef, useState } from 'react';
import EntryBody from '../state/EntryBody.jsx';
import ArtifactSlot from '../ArtifactSlot.jsx';
import EquationBlock from '../EquationBlock.jsx';
import TableBlock from '../TableBlock.jsx';
import Linkify from '../../lib/linkify.jsx';
import { basenameOf, detectArtifactType } from '../../lib/artifact.js';

// MakingCard — one made thing on a project's trail, played the way the
// Trickster card played it the day it shipped (2026-10-13; Loudon: "a showcase
// of the past as an interactive view … one beautiful entry after another").
//
// Three rules keep a long trail light:
//   1. The card's media mount only when the card is near the viewport
//      (LazyMount, an IntersectionObserver with a screen of margin) and
//      unmount again when it is far behind you. The prose stays.
//   2. Images and audio come up on their own. Web pages, video and pdf — the
//      heavy ones — sit behind a "play it here" button, one click each.
//   3. A section with no board message behind it falls back to its own prose
//      and whatever links lift, which is what the trail showed before.

export function LazyMount({ children, placeholderHeight = 120, margin = '900px' }) {
  const ref = useRef(null);
  const [near, setNear] = useState(typeof IntersectionObserver === 'undefined');
  const [height, setHeight] = useState(placeholderHeight);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !ref.current) return undefined;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) setNear(true);
        else if (ref.current) { const h = ref.current.getBoundingClientRect().height; if (h > 0) setHeight(h); setNear(false); }
      }
    }, { rootMargin: margin });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [margin]);
  return <div ref={ref} data-testid="lazy-mount" data-near={near ? 'true' : 'false'} style={near ? undefined : { minHeight: height }}>{near ? children : null}</div>;
}

function HeavyArtifact({ artifact }) {
  const [open, setOpen] = useState(false);
  const type = detectArtifactType(artifact.path);
  const label = type === 'iframe' ? 'web page' : type === 'video' ? 'video' : type === 'file' && /\.pdf$/i.test(artifact.path) ? 'pdf' : type;
  if (open) return <ArtifactSlot payload={{ artifacts: [artifact] }} />;
  return (
    <div data-testid="heavy-artifact" style={{ display: 'flex', alignItems: 'baseline', gap: 10, border: '1px dashed var(--phosphor-dim)', padding: '6px 10px' }}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ background: 'transparent', color: 'var(--phosphor)', textShadow: 'var(--glow)', border: '1px solid var(--phosphor)', padding: '1px 8px', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em', cursor: 'pointer' }}
      >▶ play it here</button>
      <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
      <span style={{ color: 'var(--phosphor)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{artifact.caption || basenameOf(artifact.path)}</span>
    </div>
  );
}

const dim = { color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11 };
const prose = { whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '78ch', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--phosphor)', marginTop: 6 };

export default function MakingCard({ spec, index, refIndex, onNavigate }) {
  const sid = spec.id || 'free';
  const media = (
    <>
      {spec.artifacts.light.length ? <ArtifactSlot payload={{ artifacts: spec.artifacts.light }} /> : null}
      {spec.artifacts.heavy.length ? (
        <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
          {spec.artifacts.heavy.map((a) => <HeavyArtifact key={a.path} artifact={a} />)}
        </div>
      ) : null}
    </>
  );

  if (!spec.fromMessage) {
    return (
      <div data-testid={spec.id ? `scroll-entry-${spec.id}` : undefined} data-card="prose" style={{ borderLeft: spec.id ? '2px solid var(--phosphor-dim)' : 'none', paddingLeft: spec.id ? 10 : 0 }}>
        {spec.heading ? <div style={{ color: 'var(--phosphor-white)', textShadow: 'var(--glow)', fontSize: 14, marginBottom: 4 }}>{spec.heading}</div> : null}
        <EntryBody body={spec.prose} index={index} refIndex={refIndex} onNavigate={onNavigate} />
        <LazyMount>{media}</LazyMount>
        {spec.footer ? <div style={{ ...dim, fontSize: 10, marginTop: 4, letterSpacing: '.04em' }}>{spec.footer}</div> : null}
      </div>
    );
  }

  return (
    <div data-testid={`scroll-entry-${sid}`} data-card="message" style={{ border: '1px solid var(--phosphor-dim)', background: 'var(--phosphor-deep)', padding: '10px 12px' }}>
      {spec.heading ? <div style={dim}>{spec.heading}</div> : null}
      {spec.headline ? <div data-testid="card-headline" style={{ color: 'var(--phosphor-white)', textShadow: 'var(--glow)', fontSize: 15, marginTop: 2 }}>{spec.headline}</div> : null}
      {spec.ground ? <div data-testid="card-orientation" style={{ ...dim, marginTop: 2 }}>{spec.ground}</div> : null}
      {spec.catchup ? <div style={{ ...prose, color: 'var(--phosphor-dim)', textShadow: 'none', fontStyle: 'italic' }}><Linkify text={spec.catchup} /></div> : null}
      {spec.prose ? <div style={prose}><Linkify text={spec.prose} /></div> : null}
      <LazyMount>
        <EquationBlock payload={spec.payload} />
        <TableBlock payload={spec.payload} />
        {media}
      </LazyMount>
      {spec.leftRough ? <div style={{ ...prose, color: 'var(--warn)', textShadow: 'none' }}><span style={{ ...dim, color: 'var(--warn)' }}>left rough · </span>{spec.leftRough}</div> : null}
      {spec.nextMoves.length ? (
        <div style={{ marginTop: 6 }}>
          <div style={dim}>next moves named</div>
          {spec.nextMoves.map((m, i) => <div key={i} style={{ ...prose, marginTop: 2 }}>· {m}</div>)}
        </div>
      ) : null}
      {spec.options.length ? (
        <div data-testid="card-options" style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {spec.options.map((o, i) => {
            const chosen = spec.decision && (spec.decision.option === o.label || spec.decision.option === o.id || (o.label && spec.decision.option && o.label.startsWith(spec.decision.option)));
            return (
              <span key={i} data-chosen={chosen ? 'true' : 'false'} style={{ border: `1px solid ${chosen ? 'var(--phosphor)' : 'var(--phosphor-dim)'}`, color: chosen ? 'var(--phosphor-white)' : 'var(--phosphor-dim)', textShadow: chosen ? 'var(--glow)' : 'none', padding: '1px 8px', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{chosen ? '● ' : '○ '}{o.label}</span>
            );
          })}
        </div>
      ) : null}
      {spec.decision ? (
        <div data-testid="card-decision" style={{ marginTop: 8, borderLeft: '2px solid var(--phosphor)', paddingLeft: 8 }}>
          <div style={dim}>you answered{spec.decision.ts ? ` · ${String(spec.decision.ts).slice(0, 10)}` : ''}{spec.decision.option ? ` · ${spec.decision.option}` : ''}</div>
          {spec.decision.notes ? <div style={{ ...prose, color: 'var(--phosphor-white)', textShadow: 'none', marginTop: 2 }}>{spec.decision.notes}</div> : null}
        </div>
      ) : null}
      {spec.footer ? <div style={{ ...dim, fontSize: 10, marginTop: 6, letterSpacing: '.04em' }}>{spec.footer}</div> : null}
    </div>
  );
}
