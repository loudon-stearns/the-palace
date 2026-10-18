// The scroll's warmth (2026-10-18): the page's hero behind it, and every kind
// of artifact on its trail played in place, video and pdf included.
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { detectArtifactType } from '../../src/lib/artifact.js';
import ArtifactSlot from '../../src/components/ArtifactSlot.jsx';
import HeroBackdrop, { heroFileOf } from '../../src/components/HeroBackdrop.jsx';

describe('every trail artifact has a player', () => {
  it('video and pdf are their own types now, not an open-link', () => {
    for (const p of ['a.mp4', 'a.webm', 'a.mov', 'a.m4v']) expect(detectArtifactType(p)).toBe('video');
    expect(detectArtifactType('notes.pdf')).toBe('pdf');
    expect(detectArtifactType('archive.zip')).toBe('file');
  });

  it('a video plays in place with its controls', () => {
    const html = renderToStaticMarkup(React.createElement(ArtifactSlot, { payload: { artifacts: [{ path: 'P/clip.mp4' }] } }));
    expect(html).toContain('data-testid="artifact-video"');
    expect(html).toContain('controls');
    expect(html).not.toContain('data-testid="artifact-link"');
  });

  it('a pdf renders in a plain frame (the viewer will not run sandboxed), at the slot\'s height', () => {
    const html = renderToStaticMarkup(React.createElement(ArtifactSlot, { payload: { artifacts: [{ path: 'P/paper.pdf' }] }, frameHeight: 800 }));
    expect(html).toContain('data-testid="artifact-pdf"');
    expect(html).toContain('/api/file?path=P%2Fpaper.pdf');
    expect(html).not.toMatch(/data-testid="artifact-pdf"[^>]*sandbox/);
    expect(html).toContain('height:800px');
  });
});

describe('the hero behind a page and its scroll', () => {
  const files = [
    { name: 'Other — hero.png', relPath: 'B/Other — hero.png', size: 1 },
    { name: 'Dissolutions — hero.png', relPath: 'Dissolutions/Dissolutions — hero.png', size: 42 },
  ];
  it('prefers the title-matched hero, else any hero, else none', () => {
    expect(heroFileOf(files, 'Dissolutions').relPath).toBe('Dissolutions/Dissolutions — hero.png');
    expect(heroFileOf([files[0]], 'Dissolutions').relPath).toBe('B/Other — hero.png');
    expect(heroFileOf([], 'Dissolutions')).toBe(null);
    expect(heroFileOf(undefined, 'x')).toBe(null);
  });
  it('draws the backdrop with a size cache-buster, and nothing without a file', () => {
    const html = renderToStaticMarkup(React.createElement(HeroBackdrop, { file: files[1], testId: 'scroll-hero-backdrop' }));
    expect(html).toContain('data-testid="scroll-hero-backdrop"');
    expect(html).toContain('&amp;v=42');
    expect(renderToStaticMarkup(React.createElement(HeroBackdrop, { file: null }))).toBe('');
  });
});
