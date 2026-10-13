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
import RichFaceFrame from '../../src/components/state/RichFaceFrame.jsx';

const GLOW = 'eaw-section-glow';

function fakeSection(top, heading) {
  const classes = new Set();
  return {
    getBoundingClientRect: () => ({ top }),
    querySelector: (sel) => (sel === 'h2' && heading != null ? { textContent: ` ${heading} ` } : null),
    classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c) },
  };
}

function fakeDoc(sections) {
  const head = { children: [], appendChild(n) { this.children.push(n); } };
  return {
    head,
    body: { nodeName: 'BODY' },
    querySelectorAll: (sel) => {
      if (sel === RICH_SECTION_SELECTOR) return sections;
      if (sel.startsWith('.')) return sections.filter((s) => s.classList.contains(sel.slice(1)));
      return [];
    },
    getElementById: (id) => head.children.find((n) => n.id === id) || null,
    createElement: (tag) => ({ tagName: tag, id: '', textContent: '' }),
  };
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

function fakeFrame(doc, top = 100) {
  const observed = [];
  class FakeMO { constructor(cb) { this.cb = cb; } observe(node, opts) { observed.push({ node, opts, mo: this }); } disconnect() { this.off = true; } }
  const win = listenable({ MutationObserver: FakeMO });
  const frame = listenable({ contentDocument: doc, contentWindow: win, getBoundingClientRect: () => ({ top }) });
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
    expect(richSectionHeading(opening)).toBeNull();
    expect(findActiveRichSection(frame, 50)).toBeNull();
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

describe('the frame never drifts from the reader', () => {
  const origin = 'http://localhost:5173';
  it('stays when the frame is on the same page, anchors included', () => {
    expect(frameDrifted(`${origin}/rich/?entry=Kuramoto%20Coupling#s-3`, '/rich/?entry=Kuramoto%20Coupling', origin)).toBe(false);
  });
  it('drifts when the frame opens another page or leaves the rich face', () => {
    expect(frameDrifted(`${origin}/rich/?entry=Spinoza%20Conatus`, '/rich/?entry=Kuramoto%20Coupling', origin)).toBe(true);
    expect(frameDrifted(`${origin}/?entry=Kuramoto%20Coupling`, '/rich/?entry=Kuramoto%20Coupling', origin)).toBe(true);
  });
  it('ignores a frame location it cannot read', () => {
    expect(frameDrifted(null, '/rich/?entry=X', origin)).toBe(false);
  });
});
