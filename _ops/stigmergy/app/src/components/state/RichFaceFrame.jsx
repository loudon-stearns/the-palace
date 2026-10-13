import React, { useRef, useState } from 'react';
import { IS_PUBLIC } from '../../lib/public-mode.js';
import { RICH_FRAME_TESTID, frameLoadAction, frameLocation, richFaceOnPath } from '../../lib/rich-frame.js';

export { openRichFace } from '../../lib/rich-frame.js';

// RichFaceFrame — the rich face inside the STATE reader. The reader shows it in
// place of its text column when the face switch picks rich, so the companion
// window can float over it (src/lib/rich-frame.js reads its sections).
//
// The frame scrolls inside itself: the rich page pins its review dock and its
// banners to its own viewport, so the frame is a window-high viewport, not a
// box grown to the page's length. An approved companion edit needs nothing
// here — the rich page re-reads the entry's .md on its own.
//
// If the frame leaves the page it was opened on (a wikilink to another entry's
// rich face, or the rich page's own face switch), the whole tab follows it, so
// the reader and its companion never stay grounded in a page no longer shown.
// If it leaves for another origin, there is no location to follow: the frame
// closes (onClose) and the reader is back on the text.
//
// Never on the public read view: there the face switch still opens the page.
export default function RichFaceFrame({ href, isPublic = IS_PUBLIC, onClose }) {
  const ref = useRef(null);
  if (isPublic || !href) return null;
  const onLoad = () => {
    try {
      const at = frameLocation(ref.current);
      const act = frameLoadAction(at, href, window.location.origin);
      if (act === 'follow') window.location.assign(at);
      else if (act === 'close' && typeof onClose === 'function') onClose();
    } catch { /* a frame that refuses us never takes the reader down */ }
  };
  return (
    <iframe
      ref={ref}
      data-testid={RICH_FRAME_TESTID}
      title="rich face"
      src={href}
      onLoad={onLoad}
      style={{
        display: 'block', width: '100%', height: 'calc(100vh - 140px)', minHeight: 480,
        border: '1px solid var(--phosphor-dim)', background: '#0a0a0f',
      }}
    />
  );
}

// Whether the reader shows the rich face. It belongs to the page it was
// opened for: opening another entry (or another face of this one) drops it,
// so a return opens on the text (richFaceOnPath). show(target) opens it for a
// page the reader is about to arrive at (a face file opening its owner).
export function useRichFace(path) {
  const [st, setSt] = useState({ shownFor: null, at: path });
  const next = richFaceOnPath(st, path);
  if (next !== st) setSt(next); // the path moved: adjust during render, no effect
  return {
    shown: next.shownFor !== null && next.shownFor === path,
    show: (target) => setSt({ shownFor: typeof target === 'string' ? target : path, at: path }),
    hide: () => setSt((s) => (s.shownFor === null ? s : { ...s, shownFor: null })),
  };
}
