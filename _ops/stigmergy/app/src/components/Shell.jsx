import React from 'react';
import CommandBar from './CommandBar.jsx';
import useHint from './useHint.js';

// The app frame: a full-height column holding the deck content and the sticky
// command bar (which now also carries the LIVE/connection indicator, relocated
// from the old top status bar). The top status bar and the CRT scanline/
// vignette video-FX overlays were removed.
export default function Shell({
  children, onCommand, commands = [], activeBoard, liveState = 'offline',
}) {
  // Whatever `title=` the pointer or focus is on, read into the command bar (useHint.js).
  const hint = useHint();
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--phosphor)',
      fontFamily: 'var(--font-mono)', fontSize: 13,
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      <div style={{ flex: 1, padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>

      <CommandBar commands={commands} onCommand={onCommand} activeBoard={activeBoard} liveState={liveState} hint={hint} />
    </div>
  );
}
