// The rich face inside the STATE reader, with the companion floating over it.
// Node runs no effects and has no layout, so the frame's DOM is faked here:
// each fake answers only what the helpers ask (a heading, a rect, a class).
// What only a browser can show — the frame's scroll, the glow's look, the
// window reading the frame live — is not covered here.

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  RICH_FRAME_TESTID, RICH_SECTION_SELECTOR, RICH_GLOW_STYLE_ID,
  openRichFace, headingSource, findActiveRichSection, richSectionHeading,
  paintRichGlow, createFrameWatch, createRichSpy, frameDrifted,
} from '../../src/lib/rich-frame.js';
// Reached through the namespace too, so a helper that does not exist yet fails its own test only.
import * as richFrame from '../../src/lib/rich-frame.js';
import RichFaceFrame from '../../src/components/state/RichFaceFrame.jsx';

const GLOW = 'eaw-section-glow';

function fakeSection(top, heading) {
  const classes = new Set();
  return {
    ownerDocument: null,
    getBoundingClientRect: () => ({ top }),
    querySelector: (sel) => (sel === 'h2' && heading != null ? { textContent: ` ${heading} ` } : null),
    classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c) },
  };
}

function fakeDoc(sections, title = null) {
  const head = { children: [], appendChild(n) { this.children.push(n); } };
  const doc = {
    head,
    body: { nodeName: 'BODY' },
    querySelector: (sel) => (sel === '#head h1' && title != null ? { textContent: ` ${title} ` } : null),
    querySelectorAll: (sel) => {
      if (sel === RICH_SECTION_SELECTOR) return sections;
      if (sel.startsWith('.')) return sections.filter((s) => s.classList.contains(sel.slice(1)));
      return [];
    },
    getElementById: (id) => head.children.find((n) => n.id === id) || null,
    createElement: (tag) => ({ tagName: tag, id: '', textContent: '' }),
  };
  for (const sec of sections) sec.ownerDocument = doc;
  return doc;
}

function listenable(extra = {}) {
  return {
    listeners: {},
    addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); },
    removeEventListener(t, fn) { this.listeners[t] = (this.listeners[t] || []).filter((f) => f !== fn); },
    fire(t) { for (const fn of this.listeners[t] || []) fn(); },
    count(t) { return (this.listeners[t] || []).length; },
    ...extra,
  };
}

function fakeFrame(doc, top = 100, bottom = undefined) {
  const observed = [];
  class FakeMO { constructor(cb) { this.cb = cb; } observe(node, opts) { observed.push({ node, opts, mo: this }); } disconnect() { this.off = true; } }
  const win = listenable({ MutationObserver: FakeMO });
  const frame = listenable({ contentDocument: doc, contentWindow: win, getBoundingClientRect: () => ({ top, bottom }) });
  return { frame, win, observed };
}

const containerWith = (frame) => ({
  querySelector: (sel) => (sel === `iframe[data-testid="${RICH_FRAME_TESTID}"]` ? frame : null),
});

describe('the face switch shows the rich face in the reader', () => {
  it('opens the rich face in a frame instead of navigating away', () => {
    const calls = [];
    openRichFace({ isPublic: false, show: () => calls.push('show'), assign: (u) => calls.push(`assign ${u}`), href: '/rich/?entry=X' });
    expect(calls).toEqual(['show']);
  });

  it('on a face file, opens the owner entry with its rich face, so the companion is grounded in the page it reads', () => {
    const calls = [];
    openRichFace({
      isPublic: false, href: '/rich/?entry=Kuramoto%20Coupling',
      show: (p) => calls.push(`show ${p}`), assign: (u) => calls.push(`assign ${u}`), navigate: (p) => calls.push(`navigate ${p}`),
      owner: 'Kuramoto Coupling.md', path: 'Kuramoto Coupling/Kuramoto Coupling — scroll.md',
    });
    expect(calls).toEqual(['show Kuramoto Coupling.md', 'navigate Kuramoto Coupling.md']);
  });

  it('on the owner itself, opens the rich face without navigating', () => {
    const calls = [];
    openRichFace({
      isPublic: false, href: '/rich/?entry=K',
      show: (p) => calls.push(`show ${p}`), assign: (u) => calls.push(`assign ${u}`), navigate: (p) => calls.push(`navigate ${p}`),
      owner: 'K.md', path: 'K.md',
    });
    expect(calls).toEqual(['show K.md']);
  });

  it('still navigates on the public read view, where no companion runs', () => {
    const calls = [];
    openRichFace({ isPublic: true, show: () => calls.push('show'), assign: (u) => calls.push(`assign ${u}`), href: '/rich/?entry=X' });
    expect(calls).toEqual(['assign /rich/?entry=X']);
  });

  it('renders the frame on the rich face address', () => {
    const html = renderToStaticMarkup(React.createElement(RichFaceFrame, { href: '/rich/?entry=Kuramoto%20Coupling', isPublic: false }));
    expect(html).toContain('<iframe');
    expect(html).toContain(`data-testid="${RICH_FRAME_TESTID}"`);
    expect(html).toContain('src="/rich/?entry=Kuramoto%20Coupling"');
  });

  it('mounts nothing on the public read view', () => {
    expect(renderToStaticMarkup(React.createElement(RichFaceFrame, { href: '/rich/?entry=X', isPublic: true }))).toBe('');
  });
});

describe('the rich face belongs to the page it was opened on', () => {
  it('drops it when the reader leaves the page, so a return opens on the text', () => {
    let st = { shownFor: 'A.md', at: 'A.md' };
    st = richFrame.richFaceOnPath(st, 'B.md');
    expect(st.shownFor).toBeNull();
    st = richFrame.richFaceOnPath(st, 'A.md');
    expect(st.shownFor).toBeNull();
  });

  it('keeps it when the reader arrives at the page it was opened for (a face file opening its owner)', () => {
    const st = richFrame.richFaceOnPath({ shownFor: 'K.md', at: 'K/K — scroll.md' }, 'K.md');
    expect(st).toEqual({ shownFor: 'K.md', at: 'K.md' });
  });

  it('changes nothing while the path holds', () => {
    const st = { shownFor: 'A.md', at: 'A.md' };
    expect(richFrame.richFaceOnPath(st, 'A.md')).toBe(st);
  });
});

describe('the companion reads the rich face when the reader shows it', () => {
  it('takes the frame as its heading source when there is one, the reader text when not', () => {
    const { frame } = fakeFrame(fakeDoc([]));
    expect(headingSource(containerWith(frame))).toEqual({ kind: 'rich', frame });
    expect(headingSource(containerWith(null)).kind).toBe('text');
    expect(headingSource(null).kind).toBe('text');
  });

  it('finds the section under the window, measured through the frame', () => {
    const opening = fakeSection(0, null);
    const mech = fakeSection(300, 'The Mechanism');
    const why = fakeSection(700, 'Why it holds');
    const { frame } = fakeFrame(fakeDoc([opening, mech, why]), 100);
    // frame top 100: the sections sit at 100, 400, 800 in the page
    expect(findActiveRichSection(frame, 450)).toBe(mech);
    expect(richSectionHeading(findActiveRichSection(frame, 450))).toBe('The Mechanism');
    expect(findActiveRichSection(frame, 150)).toBe(opening);
    // above the frame: read at its top edge, where the opening section starts
    expect(findActiveRichSection(frame, 50)).toBe(opening);
  });

  it('reads nothing above the first section, as the text face reads "(top)" over its title', () => {
    // rich.html's page head (the title block) sits above #sections
    const { frame } = fakeFrame(fakeDoc([fakeSection(250, null)]), 100);
    expect(findActiveRichSection(frame, 300)).toBeNull();
  });

  it('names the opening section by the page title, as the text face names its H1', () => {
    // rich.html lays no h2 in the opening section; its heading is the page head's h1
    const opening = fakeSection(0, null);
    const { frame } = fakeFrame(fakeDoc([opening, fakeSection(900, 'The Mechanism')], 'Kuramoto Coupling'), 100);
    expect(richSectionHeading(opening)).toBe('Kuramoto Coupling');
    const spy = createRichSpy({ glowClass: GLOW, onChange: () => {} });
    expect(spy.pass(containerWith(frame), 450)).toEqual({ reading: 'Kuramoto Coupling' });
    expect(opening.classList.contains(GLOW)).toBe(true);
    spy.dispose();
  });

  it('reads a window centred outside the frame at the frame\'s nearest edge, never a section scrolled out of sight', () => {
    // frame 400..900 in the page; it has scrolled, so its sections sit at these tops in its own viewport
    const opening = fakeSection(-1500, null);
    const mech = fakeSection(-300, 'The Mechanism');   // wholly above the frame's visible top
    const why = fakeSection(-10, 'Why it holds');      // what the frame shows at its top edge
    const below = fakeSection(600, 'Below the fold');  // starts under the frame's visible bottom
    const { frame } = fakeFrame(fakeDoc([opening, mech, why, below]), 400, 900);
    expect(richSectionHeading(findActiveRichSection(frame, 370))).toBe('Why it holds');
    expect(richSectionHeading(findActiveRichSection(frame, 2000))).toBe('Why it holds');
  });

  it('reads nothing from a frame whose document it cannot reach', () => {
    const frame = { getBoundingClientRect: () => ({ top: 0 }), get contentDocument() { throw new Error('cross-origin'); } };
    expect(findActiveRichSection(frame, 500)).toBeNull();
  });

  it('glows the active section inside the frame, bringing its own style once', () => {
    const a = fakeSection(0, 'A');
    const b = fakeSection(300, 'B');
    const doc = fakeDoc([a, b]);
    const { frame } = fakeFrame(doc);
    paintRichGlow(frame, b, GLOW);
    paintRichGlow(frame, a, GLOW);
    expect(a.classList.contains(GLOW)).toBe(true);
    expect(b.classList.contains(GLOW)).toBe(false);
    expect(doc.head.children.filter((n) => n.id === RICH_GLOW_STYLE_ID)).toHaveLength(1);
    expect(doc.head.children[0].textContent).toContain(`.${GLOW}`);
    paintRichGlow(frame, null, GLOW);
    expect(a.classList.contains(GLOW)).toBe(false);
  });

  it('switches the spy to the frame when the rich face is shown, and back', () => {
    const mech = fakeSection(300, 'The Mechanism');
    const { frame } = fakeFrame(fakeDoc([fakeSection(0, null), mech]), 100);
    const spy = createRichSpy({ glowClass: GLOW, onChange: () => {} });
    // the reader shows its text: the spy leaves it to the text source
    expect(spy.pass(containerWith(null), 450)).toBeNull();
    // the reader shows the rich face: the spy reads the frame
    expect(spy.pass(containerWith(frame), 450)).toEqual({ reading: 'The Mechanism' });
    expect(mech.classList.contains(GLOW)).toBe(true);
    // back to the text: the frame's glow is cleared
    expect(spy.pass(containerWith(null), 450)).toBeNull();
    expect(mech.classList.contains(GLOW)).toBe(false);
    spy.dispose();
  });

  it('listens inside the frame it follows, and lets go of it', () => {
    const doc = fakeDoc([]);
    const { frame, win, observed } = fakeFrame(doc);
    let changes = 0;
    const watch = createFrameWatch(() => { changes += 1; });
    watch.follow(frame);
    expect(frame.count('load')).toBe(1);
    expect(win.count('scroll')).toBe(1);
    expect(observed.map((o) => o.node)).toContain(doc.body);
    frame.fire('load');           // the frame finished loading: re-bind, then repaint
    expect(changes).toBe(1);
    expect(win.count('scroll')).toBe(1);
    win.fire('scroll');
    expect(changes).toBe(2);
    watch.follow(null);
    expect(frame.count('load')).toBe(0);
    expect(win.count('scroll')).toBe(0);
  });
});

describe('a frame that goes cross-origin', () => {
  // A cross-origin frame's window refuses listeners, its observer and its
  // location (SecurityError), and its document reads as null.
  function crossableFrame() {
    let foreign = false;
    const refuse = () => { if (foreign) throw new Error('SecurityError: Blocked a frame from accessing a cross-origin frame.'); };
    const win = listenable({});
    const add = win.addEventListener.bind(win);
    const remove = win.removeEventListener.bind(win);
    win.addEventListener = (...a) => { refuse(); return add(...a); };
    win.removeEventListener = (...a) => { refuse(); return remove(...a); };
    Object.defineProperty(win, 'MutationObserver', { get() { refuse(); return undefined; } });
    Object.defineProperty(win, 'location', { get() { refuse(); return { href: 'http://localhost:5173/rich/?entry=A' }; } });
    const doc = fakeDoc([fakeSection(0, 'A')]);
    const frame = listenable({ contentWindow: win, getBoundingClientRect: () => ({ top: 0 }) });
    Object.defineProperty(frame, 'contentDocument', { get() { return foreign ? null : doc; } });
    return { frame, goForeign: () => { foreign = true; } };
  }

  it('is loaded, read and disposed without anything throwing', () => {
    const { frame, goForeign } = crossableFrame();
    const spy = createRichSpy({ glowClass: GLOW, onChange: () => {} });
    expect(spy.pass(containerWith(frame), 100)).toEqual({ reading: 'A' });
    goForeign();
    expect(() => frame.fire('load')).not.toThrow();
    expect(() => spy.pass(containerWith(frame), 100)).not.toThrow();
    expect(() => spy.dispose()).not.toThrow();
  });

  it('lets a watch go of it without throwing', () => {
    const { frame, goForeign } = crossableFrame();
    const watch = createFrameWatch(() => {});
    watch.follow(frame);
    goForeign();
    expect(() => watch.follow(null)).not.toThrow();
  });
});

describe('the frame never drifts from the reader', () => {
  const origin = 'http://localhost:5173';
  it('stays when the frame is on the same page, anchors included', () => {
    expect(frameDrifted(`${origin}/rich/?entry=Kuramoto%20Coupling#s-3`, '/rich/?entry=Kuramoto%20Coupling', origin)).toBe(false);
  });
  it('drifts when the frame opens another page or leaves the rich face', () => {
    expect(frameDrifted(`${origin}/rich/?entry=Spinoza%20Conatus`, '/rich/?entry=Kuramoto%20Coupling', origin)).toBe(true);
    expect(frameDrifted(`${origin}/?entry=Kuramoto%20Coupling`, '/rich/?entry=Kuramoto%20Coupling', origin)).toBe(true);
  });
  it('counts a frame location it cannot read as drift (the frame left for another origin)', () => {
    expect(frameDrifted(null, '/rich/?entry=X', origin)).toBe(true);
  });
  it('does not count the frame\'s first, blank document as drift', () => {
    expect(frameDrifted('about:blank', '/rich/?entry=X', origin)).toBe(false);
  });
  it('follows a drift it can read, and closes the frame on one it cannot', () => {
    const want = '/rich/?entry=Kuramoto%20Coupling';
    expect(richFrame.frameLoadAction(`${origin}/rich/?entry=Kuramoto%20Coupling#s-2`, want, origin)).toBe('stay');
    expect(richFrame.frameLoadAction(`${origin}/rich/?entry=Spinoza%20Conatus`, want, origin)).toBe('follow');
    expect(richFrame.frameLoadAction(null, want, origin)).toBe('close');
    expect(richFrame.frameLoadAction('about:blank', want, origin)).toBe('stay');
  });
});
