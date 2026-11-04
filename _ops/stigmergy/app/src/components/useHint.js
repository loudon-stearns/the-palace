import { useEffect, useState } from 'react';

// The board's hint line. A `title=` anywhere on the board is read into the
// command bar while the pointer or the keyboard focus is on its element, and
// taken off the element for that moment so the OS never draws its tooltip,
// the one piece of browser furniture a stylesheet cannot dress (2026-11-03,
// design-system/README.md § The browser's furniture). Authors go on writing
// `title=` as they always have; a `data-hint=` works the same without ever
// being an OS tooltip. The attribute is put back the instant the pointer
// leaves, so anything that reads titles (tests, a screen reader's name
// fallback) finds them where they were.
export default function useHint() {
  const [hint, setHint] = useState('');

  useEffect(() => {
    let held = null; // the element whose hint is showing

    function find(start) {
      for (let n = start; n && n.nodeType === 1; n = n.parentElement) {
        if (n.dataset.hint != null || n.hasAttribute('title')) return n;
      }
      return null;
    }
    function release() {
      if (held) {
        if (held.dataset.hintHeld != null) {
          held.setAttribute('title', held.dataset.hint);
          delete held.dataset.hint;
          delete held.dataset.hintHeld;
        }
        held = null;
      }
      setHint('');
    }
    function show(n) {
      if (!n) return;
      let text = n.dataset.hint;
      if (text == null) {
        text = n.getAttribute('title') || '';
        n.dataset.hint = text;
        n.dataset.hintHeld = '';
        n.removeAttribute('title');
      }
      held = n;
      setHint(text.trim());
    }
    const over = (e) => { const n = find(e.target); if (n !== held) { release(); show(n); } };
    const out = (e) => { if (held && !(e.relatedTarget && held.contains(e.relatedTarget))) release(); };
    const focusIn = (e) => { const n = find(e.target); if (n && n !== held) { release(); show(n); } };
    const focusOut = () => release();

    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    document.addEventListener('focusin', focusIn);
    document.addEventListener('focusout', focusOut);
    return () => {
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      document.removeEventListener('focusin', focusIn);
      document.removeEventListener('focusout', focusOut);
      release();
    };
  }, []);

  return hint;
}
