import React from 'react';
import { fileUrl } from '../lib/public-mode.js';

// A page's hero ("<Title> — hero.png" in its bundle) as a faint, darkened
// backdrop behind the top of the reading column — ambient identity, never at
// the cost of phosphor legibility. The STATE reader and a page's scroll draw
// the same one, so the scroll feels like the page it belongs to (2026-10-18;
// Loudon: "the scroll feels cold and lifeless compared to the main entry").
// Served by GET /api/file.

/** The hero in a bundle listing: the title-matched one, else any "* — hero.png". */
export function heroFileOf(files, title) {
  const list = Array.isArray(files) ? files : [];
  return list.find((f) => f.name === `${title} — hero.png`)
    || list.find((f) => / — hero\.png$/i.test(f.name))
    || null;
}

// The caller is its own stacking context (position relative, z-index 1) with
// its content in a sibling at z-index 1, so this z-index 0 sits above the
// Shell's opaque background and below the words.
export default function HeroBackdrop({ file, testId = 'entry-hero-backdrop' }) {
  if (!file || !file.relPath) return null;
  // Cache-buster: a companion regen overwrites the hero PNG in place (same path),
  // so the browser would keep showing the old backdrop after a reload. The file's
  // byte size changes between renders — append it so the new image loads.
  const version = typeof file.size === 'number' ? file.size : null;
  return (
    <div
      aria-hidden="true"
      data-testid={testId}
      style={{
        // Fixed to the viewport top so it stays put as the page scrolls — a
        // persistent "which page am I on" reminder.
        position: 'fixed', top: 0, left: 0, right: 0, height: 540,
        zIndex: 0, pointerEvents: 'none',
        // Image under a top-to-bottom veil that fades it into the terminal
        // black before the body text begins; desaturated + dimmed so it reads
        // as ambient, not as a competing surface.
        backgroundImage:
          `linear-gradient(to bottom, color-mix(in srgb, var(--bg) 55%, transparent) 0%, var(--bg) 95%), url("${fileUrl(file.relPath, version)}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 22%',
        backgroundRepeat: 'no-repeat',
        filter: 'saturate(0.8) brightness(1.2)',
        opacity: 0.72,
      }}
    />
  );
}
