import React, { useEffect, useRef, useState } from 'react';
import { detectArtifactType, fileUrl, artifactsFromPayload, basenameOf } from '../lib/artifact.js';
import { IS_PUBLIC } from '../lib/public-mode.js';
import PhosphorAudio from './PhosphorAudio.jsx';

// A web page, played in place, on the piece origin (_ops/rich-face/
// piece-origin.mjs: 127.0.0.1:8843 beside the app's own 5173), never on
// STIGMERGY's. The deck asks GET /api/piece how to frame it; the answer is the
// plan the rich face's pieces are framed from too (contract.mjs): the URL, the
// devices grants.json allows, whether it needs an origin at all, its size and
// its chips. A piece that needs nothing of its origin runs sandbox="allow-scripts"
// alone, opaque; one that needs a device, storage or a declared file also gets
// allow-same-origin, and only once its URL is checked to be on another origin
// than this page's. With no piece origin (its port taken) the slot says so and
// shows no piece: it never falls back to this origin.
//
// The page cannot read a piece's frame, so the piece talks over the rich face's
// postMessage protocol, which the piece kit gives every served page
// (_ops/rich-face/kit/piece.js). Each message is known by its frame, and by the
// piece origin for a piece that has one:
//   rich:height -- its content height, held within 120..8000 px, and the cap
//                  named under the frame when it bites. Until it speaks, the
//                  slot's frameHeight: FRAME_HEIGHT on a TRICKSTER card, taller
//                  where a surface asks. A `fill` piece is sized from the column.
//   rich:play   -- it started a sound. One voice at a time: the deck hears it
//                  as a 'rich:play' event on the document, and every other
//                  frame and PhosphorAudio player goes quiet (rich:hush).
//   rich:camera -- it took the camera: every other frame is told rich:camera-off.
//   rich:error  -- its script failed; the first one shows under the frame.
const FRAME_HEIGHT = 480;
const CAP = { min: 120, max: 8000 };
const NOTE = { color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11, marginTop: 4, fontFamily: 'var(--font-mono)' };

// How the deck frames this page: { plan, origin } once /api/piece answers, or { error }.
function usePiecePlan(path) {
  const [state, setState] = useState(null);
  useEffect(() => {
    if (IS_PUBLIC) return undefined;
    let live = true;
    fetch(`/api/piece?path=${encodeURIComponent(path)}`, { cache: 'no-store' })
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => { if (live) setState(ok ? { plan: j.piece, origin: j.pieceOrigin } : { error: j.error || 'this page cannot be framed' }); })
      .catch((e) => { if (live) setState({ error: `the deck could not ask how to frame this page: ${e.message}` }); });
    return () => { live = false; };
  }, [path]);
  return state;
}

function FrameBody({ path, name, initialHeight = FRAME_HEIGHT }) {
  const ref = useRef(null);
  const asked = usePiecePlan(path);
  const plan = asked && asked.plan;
  // The public read view has no piece origin: its pages run opaque, from its own files.
  const url = IS_PUBLIC ? fileUrl(path) : plan && !plan.blocked ? plan.url : null;
  let pieceOrigin = null;
  if (url && plan && plan.sameOrigin) { try { const o = new URL(url, window.location.href).origin; if (o !== window.location.origin) pieceOrigin = o; } catch { /* not a URL: opaque */ } }
  const fill = plan && plan.size && plan.size.mode === 'fill' ? plan.size.ratio : null;
  const [height, setHeight] = useState(initialHeight);
  const [cap, setCap] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!url) return undefined;
    const mine = () => (ref.current ? ref.current.contentWindow : null);
    const target = pieceOrigin || '*';
    function onMessage(e) {
      const win = mine();
      if (!win || e.source !== win || !e.data) return;
      if (pieceOrigin && e.origin !== pieceOrigin) return;
      const { type } = e.data;
      if (type === 'rich:height') {
        if (fill) return;
        const px = Math.ceil(Number(e.data.height));
        if (!(px > 0)) return;
        setHeight(Math.min(CAP.max, Math.max(CAP.min, px)));
        setCap(px > CAP.max ? `asked for ${px} px; held at ${CAP.max}, the most a frame takes` : px < CAP.min ? `asked for ${px} px; held at ${CAP.min}, the least a frame takes` : null);
      } else if (type === 'rich:held') {
        setCap('sized by its own window, so it grows with its frame: held where it stopped');
      } else if (type === 'rich:play') {
        document.dispatchEvent(new CustomEvent('rich:play', { detail: win }));
      } else if (type === 'rich:camera') {
        if (e.data.on) document.dispatchEvent(new CustomEvent('rich:camera', { detail: win }));
      } else if (type === 'rich:error') {
        setError((cur) => cur || { message: String(e.data.message || 'error'), where: String(e.data.where || '') });
      }
    }
    function onOtherPlay(e) {
      const win = mine();
      if (win && e.detail !== win) win.postMessage({ type: 'rich:hush' }, target);
    }
    function onOtherCamera(e) {
      const win = mine();
      if (win && e.detail !== win) win.postMessage({ type: 'rich:camera-off' }, target);
    }
    window.addEventListener('message', onMessage);
    document.addEventListener('rich:play', onOtherPlay);
    document.addEventListener('rich:camera', onOtherCamera);
    return () => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('rich:play', onOtherPlay);
      document.removeEventListener('rich:camera', onOtherCamera);
    };
  }, [url, pieceOrigin, fill]);
  // A fill piece takes its height from its width.
  useEffect(() => {
    const el = ref.current;
    if (!fill || !el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => { if (el.clientWidth) setHeight(Math.max(CAP.min, Math.round(el.clientWidth / fill))); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fill, url]);

  if (!IS_PUBLIC && !asked) return <div data-testid="artifact-piece-pending" data-path={path} style={{ ...NOTE, height: initialHeight }}>framing the piece…</div>;
  if (!IS_PUBLIC && asked.error) return <div data-testid="artifact-piece-refused" style={{ ...NOTE, color: 'var(--warn)' }}>{asked.error}</div>;
  if (!IS_PUBLIC && plan.blocked) {
    return (
      <div data-testid="artifact-piece-blocked" style={{ ...NOTE, color: 'var(--warn)', border: '1px dashed var(--warn)', padding: '10px 12px' }}>
        No piece origin: {plan.blocked}. A piece never runs on the deck's own origin, so it is not shown.
      </div>
    );
  }
  const chips = (plan && plan.chips) || [];
  return (
    <>
      <iframe
        ref={ref}
        data-testid="artifact-iframe"
        data-mark={plan ? plan.mark : undefined}
        title={name}
        src={url}
        sandbox={pieceOrigin ? 'allow-scripts allow-same-origin' : 'allow-scripts'}
        allow={(plan && plan.allow) || 'autoplay'}
        style={{
          width: '100%', height,
          border: '1px solid var(--phosphor-dim)', background: 'var(--bg)', borderRadius: 0,
        }}
      />
      {cap ? <div data-testid="artifact-piece-cap" style={NOTE}>{cap}</div> : null}
      {chips.length ? (
        <div data-testid="artifact-piece-chips" style={{ ...NOTE, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {chips.map((c) => (
            <span key={c.text} title={c.title || undefined} style={{ border: `1px ${c.state === 'note' ? 'dashed' : 'solid'} ${c.state === 'warn' ? 'var(--warn)' : 'var(--phosphor-dim)'}`, color: c.state === 'warn' ? 'var(--warn)' : undefined, padding: '0 6px' }}>{c.text}</span>
          ))}
        </div>
      ) : null}
      {error ? (
        <div data-testid="artifact-piece-error" style={{ ...NOTE, color: 'var(--warn)' }}>
          the piece reported an error: {error.message}{error.where ? ` (${error.where})` : ''}
        </div>
      ) : null}
    </>
  );
}

// A video, played in place with the browser's controls. It takes its turn with
// every other sound on the page: starting it tells the deck ('rich:play'), and
// any other start pauses it.
function VideoBody({ url, name }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const onPlay = () => document.dispatchEvent(new CustomEvent('rich:play', { detail: el }));
    const onOtherPlay = (e) => { if (e.detail !== el && !el.paused) el.pause(); };
    el.addEventListener('play', onPlay);
    document.addEventListener('rich:play', onOtherPlay);
    return () => { el.removeEventListener('play', onPlay); document.removeEventListener('rich:play', onOtherPlay); };
  }, []);
  return (
    <video
      ref={ref}
      data-testid="artifact-video"
      title={name}
      src={url}
      controls
      preload="metadata"
      playsInline
      style={{ display: 'block', width: '100%', height: 'auto', background: 'var(--bg)', border: '1px solid var(--phosphor-dim)', borderRadius: 0 }}
    />
  );
}

// One rendered artifact. The element depends on the detected type; the frame
// is the same BBS phosphor card for all of them.
function ArtifactBody({ path, frameHeight }) {
  const type = detectArtifactType(path);
  const url = fileUrl(path);
  const name = basenameOf(path);

  if (type === 'image') {
    return (
      <img
        data-testid="artifact-img"
        src={url}
        alt={name}
        style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: 0 }}
      />
    );
  }
  if (type === 'audio') {
    // Phosphor control strip in lieu of the browser's white/grey default
    // chrome. The native player is hidden inside PhosphorAudio; our
    // controls drive it programmatically. The wrapping <div> keeps the
    // existing data-testid so v0.3/v0.4 e2e tests still find the slot.
    return (
      <div data-testid="artifact-audio">
        <PhosphorAudio src={url} />
      </div>
    );
  }
  if (type === 'iframe') return <FrameBody path={path} name={name} initialHeight={frameHeight} />;
  if (type === 'video') return <VideoBody url={url} name={name} />;
  if (type === 'pdf') {
    // The browser's own PDF viewer, in place. It will not run in a sandboxed
    // frame, so this one is plain; a PDF is a document the viewer draws, not a
    // page of ours that runs (2026-10-18; Loudon: "could they render in the page?").
    return (
      <iframe
        data-testid="artifact-pdf"
        title={name}
        src={url}
        style={{ width: '100%', height: frameHeight || FRAME_HEIGHT, border: '1px solid var(--phosphor-dim)', background: 'var(--bg)', borderRadius: 0 }}
      />
    );
  }
  // Unknown type — fall back to a native-open link (reuses GET /api/open).
  return (
    <a
      data-testid="artifact-link"
      href={`/api/open?path=${encodeURIComponent(path)}`}
      style={{
        color: 'var(--ansi-bright-cyan)', textShadow: 'var(--glow)',
        textDecoration: 'underline', wordBreak: 'break-all',
      }}
    >
      ↗ open {name}
    </a>
  );
}

// Map the detected file type to a human-readable label. "iframe" is a DOM
// term, not a reader's term -- HTML files should read as WEB. Audio plays
// open the native app already (PhosphorAudio's open-native chip), so its
// label here just names the medium.
const TYPE_LABEL = {
  image: 'image',
  audio: 'audio',
  video: 'video',
  iframe: 'web',
  pdf: 'pdf',
  file: 'artifact',
};

// An "open in <native app>" chip. Hits GET /api/open which calls the OS's
// `open` (macOS) / `xdg-open` (Linux) -- HTML files launch the default
// browser, audio opens Audacity/QuickTime, etc. Fires-and-stays: the BBS
// surface never navigates away.
function OpenExternalChip({ path, type }) {
  const title = type === 'iframe'
    ? 'open in your default browser'
    : `open in native ${type} app`;
  function fire(e) {
    e.preventDefault();
    fetch(`/api/open?path=${encodeURIComponent(path)}`).catch(() => {});
  }
  return (
    <a
      data-testid="artifact-open-external"
      href={`/api/open?path=${encodeURIComponent(path)}`}
      onClick={fire}
      title={title}
      style={{
        color: 'var(--phosphor)',
        textShadow: 'var(--glow)',
        textDecoration: 'none',
        fontSize: 10,
        border: '1px solid var(--phosphor-dim)',
        padding: '1px 6px',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '.04em',
      }}
    >↗ open</a>
  );
}

// The artifact slot: renders alongside (not inside) the type-specific payload
// rendering, for any message type. Keyed on artifact presence in the payload,
// per BBS Production Plan v0.3.
export default function ArtifactSlot({ payload, frameHeight }) {
  const artifacts = artifactsFromPayload(payload);
  if (artifacts.length === 0) return null;

  return (
    <div data-testid="artifact-slot" style={{ marginTop: 8, display: 'grid', gap: 10 }}>
      {artifacts.map((a, i) => {
        const type = detectArtifactType(a.path);
        const label = TYPE_LABEL[type] || 'artifact';
        return (
          <div
            key={i}
            data-testid="artifact"
            data-artifact-type={type}
            style={{
              border: '1px solid var(--phosphor-dim)',
              background: 'var(--phosphor-deep)',
              borderRadius: 0,
              padding: '8px 10px',
            }}
          >
            <div style={{
              color: 'var(--phosphor-dim)', textShadow: 'none',
              fontSize: 11, marginBottom: 6,
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--font-mono)',
            }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {label} · {basenameOf(a.path)}
              </span>
              <span style={{ flex: 1 }} />
              <OpenExternalChip path={a.path} type={type} />
            </div>
            <ArtifactBody path={a.path} frameHeight={frameHeight} />
            {a.caption ? (
              <div
                data-testid="artifact-caption"
                style={{
                  color: 'var(--phosphor-dim)', textShadow: 'none',
                  fontSize: 12, marginTop: 6, maxWidth: '78ch',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {a.caption}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
