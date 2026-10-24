import React, { useEffect, useRef, useState } from 'react';
import { fetchTranscript } from '../../adapters/stewards.js';
import { feedFromLines, FEED_KEEP } from '../../lib/transcript-view.js';

// WatchPane — a live feed of a running steward's transcript: what it is
// thinking (where the API lets that through), what it says, each tool call as
// a one-line verb, every image it reads shown the moment it reads it, and the
// short output of its commands. A window, not a wheel: the place to steer is
// still the Trickster card or a standing order (2026-10-13).
//
// It polls GET /api/steward/transcript?home=…&from=N every two seconds while
// the steward runs, appending only new lines. When the cycle ends the last
// poll carries its result line and the feed stops.

const POLL_MS = 2000;

const dim = { color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11 };
const mono = { fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' };

export function FeedItem({ item }) {
  if (item.kind === 'thinking') return <div data-feed="thinking" style={{ ...mono, color: 'var(--phosphor-dim)', fontStyle: 'italic', borderLeft: '2px dotted var(--phosphor-dim)', paddingLeft: 8 }}>{item.text}</div>;
  if (item.kind === 'text') return <div data-feed="text" style={{ ...mono, color: 'var(--phosphor-white)', textShadow: 'var(--glow)' }}>{item.text}</div>;
  if (item.kind === 'tool') return <div data-feed="tool" style={{ ...mono, color: 'var(--phosphor)' }}><span style={{ ...dim, textTransform: 'uppercase', letterSpacing: '.05em', marginRight: 8 }}>{item.name}</span>{item.verb}</div>;
  if (item.kind === 'image') return (
    <div data-feed="image" style={{ margin: '4px 0' }}>
      <div style={dim}>saw · {item.name}</div>
      <img src={item.src} alt={item.name} style={{ maxWidth: '100%', maxHeight: 360, display: 'block', border: '1px solid var(--phosphor-dim)' }} />
    </div>
  );
  if (item.kind === 'result') return <div data-feed="result" style={{ ...mono, color: 'var(--phosphor-dim)', fontSize: 11, paddingLeft: 12 }}>{item.text}</div>;
  if (item.kind === 'done') return <div data-feed="done" style={{ ...mono, color: 'var(--warn)', textShadow: 'var(--glow)' }}>cycle ended · {item.reason}{item.tokens != null ? ` · ${item.tokens >= 1e6 ? `${(item.tokens / 1e6).toFixed(1)}M` : `${Math.round(item.tokens / 1e3)}k`} tokens` : ''}{item.ms != null ? ` · ${Math.round(item.ms / 60000)} min` : ''}</div>;
  return null;
}

export default function WatchPane({ home, running, onClose }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('connecting');
  const [path, setPath] = useState(null);
  const cursor = useRef(0);
  const parse = useRef({ toolNames: new Map() });
  const bottom = useRef(null);
  const [follow, setFollow] = useState(true);

  useEffect(() => {
    let alive = true;
    let timer = null;
    cursor.current = 0; parse.current = { toolNames: new Map() }; setItems([]); setStatus('connecting');
    async function tick() {
      const r = await fetchTranscript(home, cursor.current);
      if (!alive) return;
      if (!r.ok) { setStatus(r.status === 404 ? 'no transcript yet' : (r.error || 'unreachable')); timer = setTimeout(tick, POLL_MS * 2); return; }
      if (r.path) setPath(r.path);
      if (Array.isArray(r.lines) && r.lines.length) {
        const fresh = feedFromLines(r.lines, parse.current);
        if (fresh.length) setItems((prev) => { const next = prev.concat(fresh); return next.length > FEED_KEEP ? next.slice(next.length - FEED_KEEP) : next; });
        cursor.current = Number.isInteger(r.next) ? r.next : cursor.current + r.lines.length;
      }
      const ended = r.running === false;
      setStatus(ended ? 'ended' : 'live');
      if (!ended) timer = setTimeout(tick, POLL_MS);
    }
    tick();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [home]);

  useEffect(() => { if (follow && bottom.current && typeof bottom.current.scrollIntoView === 'function') bottom.current.scrollIntoView({ block: 'end' }); }, [items, follow]);

  return (
    <div data-testid="watch-pane" style={{ border: '1px solid var(--phosphor)', background: 'var(--phosphor-deep)', padding: '8px 10px', marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-display)', color: 'var(--phosphor-white)', textShadow: 'var(--glow)', textTransform: 'uppercase', letterSpacing: '.04em' }}>watch · {home}</span>
        <span data-testid="watch-status" style={{ ...dim, color: status === 'live' ? 'var(--ansi-bright-yellow)' : 'var(--phosphor-dim)', textShadow: status === 'live' ? 'var(--glow)' : 'none' }}>{status === 'live' ? '● live' : status}</span>
        {path ? <span style={dim} title={path}>{String(path).split('/').pop()}</span> : null}
        <span style={{ flex: 1 }} />
        <label style={{ ...dim, cursor: 'pointer' }}><input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} /> follow</label>
        {onClose ? <span role="button" tabIndex={0} onClick={onClose} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }} style={{ ...dim, cursor: 'pointer' }}>× close</span> : null}
      </div>
      <div data-testid="watch-feed" style={{ maxHeight: 520, overflowY: 'auto', display: 'grid', gap: 6 }}>
        {items.length === 0 ? <div style={dim}>{running ? 'waiting for the first words…' : 'nothing yet'}</div> : items.map((it, i) => <FeedItem key={i} item={it} />)}
        <div ref={bottom} />
      </div>
    </div>
  );
}
