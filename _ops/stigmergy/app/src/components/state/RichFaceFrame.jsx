import React, { useRef, useState } from 'react';
import { IS_PUBLIC } from '../../lib/public-mode.js';
import { RICH_FRAME_TESTID, frameDrifted } from '../../lib/rich-frame.js';

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
//
// Never on the public read view: there the face switch still opens the page.
export default function RichFaceFrame({ href, isPublic = IS_PUBLIC }) {
  const ref = useRef(null);
  if (isPublic || !href) return null;
  const onLoad = () => {
    let at = null;
    try { at = ref.current && ref.current.contentWindow ? ref.current.contentWindow.location.href : null; } catch { at = null; }
    if (frameDrifted(at, href, window.location.origin)) window.location.assign(at);
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

// Whether the reader shows the rich face, held per path: opening another entry
// (or another face of this one) drops it without an effect.
export function useRichFace(path) {
  const [shownFor, setShownFor] = useState(null);
  return {
    shown: shownFor !== null && shownFor === path,
    show: () => setShownFor(path),
    hide: () => setShownFor(null),
  };
}
