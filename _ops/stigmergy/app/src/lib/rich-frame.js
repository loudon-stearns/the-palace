// rich-frame.js — the rich face inside the STATE reader, and the companion
// reading it.
//
// When the face switch picks rich, the reader shows `<base>rich/?entry=<Name>`
// in a frame (RichFaceFrame.jsx) instead of leaving the app, so the companion
// window can float over the rich face the way it floats over the text. The
// frame is same-origin (STIGMERGY mounts the rich face at /rich/), so the
// window reads the frame's sections straight from its document.
//
// The rich page is _ops/rich-face/rich.html; this module only reads it. Each
// section is a `section.sec` under `#sections`, headed by an h2; the opening
// section has no heading (rich.html laySection). Keep the selector in step.
//
// Pure over whatever DOM it is handed, so the tests drive it with fakes.
//
// The frame can leave for another origin (a link, a failed load). From then
// on its document reads as null and its window refuses listeners and its
// location with a SecurityError. Every touch of the frame's window or
// document here is guarded and treats a refusal as "unreadable", so nothing
// thrown inside the frame escapes a listener, a scroll pass or a cleanup.

export const RICH_FRAME_TESTID = 'rich-face-frame';
export const RICH_SECTION_SELECTOR = '#sections > section.sec';
export const RICH_GLOW_STYLE_ID = 'eaw-rich-glow-style';

// The face switch's rich branch: show the rich face in the reader's frame, or
// on the public read view (no companion, no frame) go to the page as before.
// On a face file (a scroll), the rich face shown is the owner's, so the
// reader opens the owner too: the companion follows the open entry, and so is
// grounded in the page whose sections it reads.
export function openRichFace({ isPublic, show, assign, href, owner, path, navigate }) {
  if (isPublic) return assign(href);
  const target = owner || path;
  show(target);
  if (owner && path && owner !== path && typeof navigate === 'function') navigate(owner);
  return undefined;
}

// The rich face belongs to the page it was opened for. State is
// { shownFor, at }: the page it shows for, and the path the reader was on.
// When the path moves, keep it only if the reader arrived at that page (a
// face file opening its owner); otherwise drop it, so a return to the page
// opens on the text, as every other face does.
export function richFaceOnPath(st, path) {
  if (st.at === path) return st;
  return { shownFor: st.shownFor === path ? st.shownFor : null, at: path };
}

// The frame's document, or null when it can't be read (not loaded, or not ours).
function frameDoc(frame) {
  try { return (frame && frame.contentDocument) || null; } catch { return null; }
}

// Run a touch of the frame's window; a refusal (another origin) is ignored.
function guarded(fn) {
  try { fn(); } catch { /* the frame is not ours any more */ }
}

// Where the frame is now, or null when its location can't be read.
export function frameLocation(frame) {
  try { return (frame && frame.contentWindow && frame.contentWindow.location.href) || null; } catch { return null; }
}

// Which surface the companion's scroll-spy reads: the rich face's frame when
// the reader shows one, else the reader's own text.
export function headingSource(container) {
  const frame = container && typeof container.querySelector === 'function'
    ? container.querySelector(`iframe[data-testid="${RICH_FRAME_TESTID}"]`)
    : null;
  return frame ? { kind: 'rich', frame } : { kind: 'text', el: container || null };
}

// The rich section under centreY (the window's centre, in the app's viewport):
// the last section whose top has passed it. A section's rect is in the frame's
// viewport, so the frame's own top is added. The frame clips what it scrolls,
// so a centre above or below the frame is read at the frame's nearest edge —
// never at a section scrolled out of sight. Null above the first section (the
// rich page's title block).
export function findActiveRichSection(frame, centreY) {
  const doc = frameDoc(frame);
  if (!doc) return null;
  const box = frame.getBoundingClientRect();
  const bottom = Number.isFinite(box.bottom) ? box.bottom : Infinity;
  const y = Math.min(Math.max(centreY, box.top), bottom);
  let active = null;
  for (const s of doc.querySelectorAll(RICH_SECTION_SELECTOR)) {
    if (box.top + s.getBoundingClientRect().top <= y) active = s;
    else break;
  }
  return active;
}

// The heading the companion names as its context: the section's h2. The
// opening section has none (rich.html lays its heading, the entry's H1 or
// title, in the page head above), so it is named by the head's h1 — as the
// text face names its H1.
export function richSectionHeading(section) {
  if (!section) return null;
  const h = section.querySelector('h2');
  if (h) return h.textContent.trim() || null;
  const title = section.ownerDocument && section.ownerDocument.querySelector('#head h1');
  return title ? title.textContent.trim() || null : null;
}

// The glow, in the rich page's own dress (its --accent tokens, with fallbacks),
// because the app's stylesheet does not reach into the frame.
function glowCss(cls) {
  return `.${cls} { background: var(--accent-soft, rgba(232,184,74,0.06)); `
    + 'box-shadow: inset 2px 0 0 var(--accent-line, rgba(232,184,74,0.5)); transition: background .2s linear; }';
}

// Glow the active section inside the frame (null clears it). Brings its style
// into the frame once.
export function paintRichGlow(frame, active, cls) {
  const doc = frameDoc(frame);
  if (!doc) return;
  guarded(() => {
    if (!doc.getElementById(RICH_GLOW_STYLE_ID)) {
      const st = doc.createElement('style');
      st.id = RICH_GLOW_STYLE_ID;
      st.textContent = glowCss(cls);
      (doc.head || doc.documentElement).appendChild(st);
    }
    for (const el of doc.querySelectorAll('.' + cls)) el.classList.remove(cls);
    if (active) active.classList.add(cls);
  });
}

// Listen inside the frame being followed: its load (a new document), its own
// scroll and resize, and its body changing (the rich face re-reads the .md).
// childList/subtree only, so the glow's class toggles never retrigger it.
export function createFrameWatch(onChange) {
  let frame = null;
  let win = null;
  let mo = null;
  const detachDoc = () => {
    const w = win;
    const m = mo;
    win = null;
    mo = null;
    if (w) {
      guarded(() => w.removeEventListener('scroll', onChange));
      guarded(() => w.removeEventListener('resize', onChange));
    }
    if (m) guarded(() => m.disconnect());
  };
  const attachDoc = () => {
    detachDoc();
    let w = null;
    try { w = frame.contentWindow || null; } catch { w = null; }
    const doc = frameDoc(frame);
    if (!w || !doc) return;
    guarded(() => {
      w.addEventListener('scroll', onChange, { passive: true });
      w.addEventListener('resize', onChange);
      win = w;
      const MO = w.MutationObserver || (typeof MutationObserver !== 'undefined' ? MutationObserver : null);
      if (MO && doc.body) {
        mo = new MO(onChange);
        mo.observe(doc.body, { childList: true, subtree: true });
      }
    });
  };
  const onLoad = () => {
    guarded(attachDoc);
    guarded(onChange);
  };
  return {
    follow(next) {
      const target = next || null;
      if (target === frame) return;
      if (frame) { const f = frame; guarded(() => f.removeEventListener('load', onLoad)); }
      detachDoc();
      frame = target;
      if (frame) {
        const f = frame;
        guarded(() => f.addEventListener('load', onLoad));
        guarded(attachDoc);
      }
    },
  };
}

// The rich face as the companion's second heading source. pass() returns null
// when the reader shows its text (the text spy carries on), or { reading }
// after glowing the rich section under the window. dispose() clears the glow
// and lets go of the frame.
export function createRichSpy({ glowClass, onChange }) {
  const watch = createFrameWatch(onChange);
  let painted = null;
  return {
    pass(container, centreY) {
      const src = headingSource(container);
      const frame = src.kind === 'rich' ? src.frame : null;
      watch.follow(frame);
      if (painted && painted !== frame) { paintRichGlow(painted, null, glowClass); painted = null; }
      if (!frame) return null;
      const active = findActiveRichSection(frame, centreY);
      paintRichGlow(frame, active, glowClass);
      painted = frame;
      return { reading: richSectionHeading(active) };
    },
    dispose() {
      if (painted) paintRichGlow(painted, null, glowClass);
      painted = null;
      watch.follow(null);
    },
  };
}

// True when the frame has left the page the reader opened it on: another
// entry's rich face (a wikilink), out of the rich face altogether (its own
// face switch), or to another origin, which leaves its location unreadable
// (null). Anchors and other params don't count, nor does the frame's first,
// blank document.
export function frameDrifted(frameHref, expectedHref, origin) {
  if (!frameHref) return true;
  if (frameHref === 'about:blank') return false;
  let at;
  let want;
  try {
    at = new URL(frameHref, origin);
    want = new URL(expectedHref, origin);
  } catch { return true; }
  return at.pathname !== want.pathname || at.searchParams.get('entry') !== want.searchParams.get('entry');
}

// What the reader does when the frame loads: 'stay' on its page; 'follow' a
// drift it can read (the whole tab goes there, so the companion is never
// grounded in a page no longer shown); 'close' the frame on one it cannot
// read (another origin: nowhere to follow, so back to the text face).
export function frameLoadAction(frameHref, expectedHref, origin) {
  if (!frameDrifted(frameHref, expectedHref, origin)) return 'stay';
  return frameHref ? 'follow' : 'close';
}
