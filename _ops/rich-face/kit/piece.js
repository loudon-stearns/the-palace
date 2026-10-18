// piece.js — the piece kit. The palace injects this one script at the top of
// every web page it serves as a piece (kit/inject.mjs: STIGMERGY's /api/file,
// the rich face's /rich/<path>, the public build), so no piece has to remember
// a rule to sit well in a frame — a scroll's trail, a rich face, a TRICKSTER
// card. Plan: STIGMERGY — spec — rich-face pieces § 3, "A piece includes nothing."
//
// What it does for the piece, over the rich face's postMessage protocol:
//   height — posts {type:'rich:height'} with the content's height, on load and
//            whenever it changes, so the frame fits. A piece that already posts
//            rich:height itself is left to it.
//   play   — posts {type:'rich:play'} when the piece starts a sound the reader
//            asked for (an AudioContext or <audio>/<video> starting after a
//            click), so the page can quiet every other piece.
//   hush   — on {type:'rich:hush'} from the page, suspends the piece's audio
//            and pauses its media; the next touch on the piece brings its audio
//            back. A piece that answers rich:hush itself is left to it.
//   errors — posts {type:'rich:error'} for its first three script errors.
// Camera, storage and declared files wait for the piece origin (spec § 4).
//
// It runs before any of the piece's own scripts, in an opaque, sandboxed
// origin. It must stay plain browser JS with no "</" + "script" in it, since it
// is inlined into the page.
(function () {
  'use strict';
  if (window.RichPiece) return; // a page carrying the kit already
  window.RichPiece = Object.freeze({ kit: 1 });
  var framed = window.parent && window.parent !== window;
  function post(msg) { if (framed) { try { window.parent.postMessage(msg, '*'); } catch (e) { /* nothing to tell */ } } }

  // Does the piece speak part of the protocol itself? Read from its inline
  // scripts once they have all been parsed.
  var own = null;
  function speaks(word) {
    if (!own) {
      if (document.readyState === 'loading') return false;
      own = '';
      var s = document.scripts;
      for (var i = 0; i < s.length; i++) if (!s[i].hasAttribute('data-rich-kit')) own += s[i].textContent || '';
    }
    return own.indexOf(word) !== -1;
  }

  // ---- height --------------------------------------------------------------
  // The content's height, not the frame's: the bottom of the lowest laid-out
  // child of <body>, fixed-position ones aside (they sit on the viewport). A
  // body with nothing laid out falls back to the document's scroll height.
  function contentHeight() {
    var b = document.body;
    if (!b) return 0;
    var bottom = 0, kids = b.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i], r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      if (getComputedStyle(el).position === 'fixed') continue;
      if (r.bottom > bottom) bottom = r.bottom;
    }
    if (!bottom) return document.documentElement.scrollHeight;
    var cs = getComputedStyle(b);
    bottom += (parseFloat(cs.paddingBottom) || 0) + (parseFloat(cs.borderBottomWidth) || 0) + (parseFloat(cs.marginBottom) || 0);
    return Math.ceil(bottom + window.scrollY);
  }
  // A piece sized by the viewport (100vh plus a margin) grows by the same step
  // every time its frame does; after two such steps the kit stops growing it,
  // until the width changes.
  var lastH = 0, lastStep = 0, lastAt = 0, coupled = false, pending = false, lastW = window.innerWidth;
  function report() {
    pending = false;
    if (speaks('rich:height')) return;
    if (window.innerWidth !== lastW) { lastW = window.innerWidth; coupled = false; }
    var h = contentHeight();
    if (!h || Math.abs(h - lastH) < 2) return;
    var step = h - lastH, now = Date.now();
    if (step > 0 && lastStep > 0 && Math.abs(step - lastStep) <= 2 && now - lastAt < 1500) coupled = true;
    if (coupled && step > 0) return;
    lastStep = step; lastAt = now; lastH = h;
    post({ type: 'rich:height', height: h });
  }
  function soon() { if (!pending) { pending = true; requestAnimationFrame(report); } }
  function watch() {
    soon();
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(soon);
      ro.observe(document.documentElement);
      if (document.body) { ro.observe(document.body); for (var i = 0; i < document.body.children.length; i++) ro.observe(document.body.children[i]); }
    }
    if (window.MutationObserver && document.body) new MutationObserver(soon).observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  }
  if (framed) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
    window.addEventListener('load', soon);
    window.addEventListener('resize', soon);
  }

  // ---- play and hush -------------------------------------------------------
  var contexts = [], quieted = [], lastPlay = 0;
  function asked() { var u = navigator.userActivation; return !u || u.isActive || u.hasBeenActive; }
  function played() {
    if (!asked()) return; // sound nobody asked for claims nothing
    var now = Date.now();
    if (now - lastPlay < 300) return;
    lastPlay = now;
    post({ type: 'rich:play' });
  }
  var Native = window.AudioContext || window.webkitAudioContext;
  if (Native) {
    var Kit = class extends Native {
      constructor() {
        super(...arguments);
        contexts.push(this);
        var ctx = this;
        this.addEventListener('statechange', function () { if (ctx.state === 'running') played(); });
      }
    };
    window.AudioContext = Kit;
    if ('webkitAudioContext' in window) window.webkitAudioContext = Kit;
    var Src = window.AudioScheduledSourceNode;
    if (Src && Src.prototype.start) {
      var start = Src.prototype.start;
      Src.prototype.start = function () { if (navigator.userActivation ? navigator.userActivation.isActive : true) played(); return start.apply(this, arguments); };
    }
  }
  document.addEventListener('play', played, true); // <audio>/<video>: 'play' does not bubble, so catch it on the way down

  function hush() {
    if (speaks('rich:hush')) return;
    lastPlay = 0; // quieted: the next start is news, however soon it comes
    for (var i = 0; i < contexts.length; i++) {
      var c = contexts[i];
      if (c.state === 'running') { c.suspend(); if (quieted.indexOf(c) === -1) quieted.push(c); }
    }
    var media = document.querySelectorAll('audio, video');
    for (var j = 0; j < media.length; j++) if (!media[j].paused) media[j].pause();
  }
  window.addEventListener('message', function (e) {
    if (e.source === window.parent && e.data && e.data.type === 'rich:hush') hush();
  });
  function wake() { while (quieted.length) { var c = quieted.pop(); if (c.state === 'suspended') c.resume(); } }
  window.addEventListener('pointerdown', wake, true);
  window.addEventListener('keydown', wake, true);

  // ---- errors --------------------------------------------------------------
  var told = 0;
  function tell(message, where) { if (told++ < 3) post({ type: 'rich:error', message: String(message).slice(0, 300), where: where || '' }); }
  window.addEventListener('error', function (e) {
    tell(e.message || 'error', (e.filename ? e.filename.split('/').pop() : '') + (e.lineno ? ':' + e.lineno : ''));
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    tell('unhandled: ' + (r && r.message ? r.message : r));
  });
})();
