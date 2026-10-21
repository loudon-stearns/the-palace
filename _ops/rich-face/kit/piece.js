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
//   storage — localStorage and sessionStorage keep each piece's keys under its
//            own prefix (its path), since every piece on the piece origin shares
//            one origin. Where a piece has no origin (an opaque frame, the
//            public site) storage lives in memory, and the first use posts
//            {type:'rich:storage', kept:false} so the page can say it won't keep.
//   camera — getUserMedia (and RichPiece.camera(), which calls it) starts only
//            on a click: asked for before one, the kit shows a "start the
//            camera" button and waits for it. A stream that starts posts
//            {type:'rich:camera', on:true}; the page then sends the others
//            rich:camera-off. On rich:hush or rich:camera-off the kit stops the
//            device, and the next touch on the piece brings it back into the
//            same stream. Whether the browser lets it is the frame's allow and
//            the piece origin's Permissions-Policy, from grants.json.
//   size   — a piece declared <meta name="piece:size" content="fill …"> is
//            sized by the page, so its height is not reported; a piece sized
//            by its own window is held, and posts {type:'rich:held'} once.
//
// It runs before any of the piece's own scripts: on the piece origin, or in
// an opaque sandboxed origin for a piece that needs nothing of one. It must
// stay plain browser JS with no "</" + "script" in it, since it is inlined.
(function () {
  'use strict';
  if (window.RichPiece) return; // a page carrying the kit already
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
  // A piece that fills its frame is sized by the page from the column.
  var fill = null;
  function fills() {
    if (fill === null) {
      if (document.readyState === 'loading') return false;
      var m = document.querySelector('meta[name="piece:size"]');
      fill = !!(m && /^\s*fill\b/i.test(m.getAttribute('content') || ''));
    }
    return fill;
  }
  // A piece sized by the viewport (100vh plus a margin) grows by the same step
  // every time its frame does; after two such steps the kit stops growing it,
  // until the width changes, and tells the page once so it can say so.
  var lastH = 0, lastStep = 0, lastAt = 0, coupled = false, pending = false, lastW = window.innerWidth;
  function report() {
    pending = false;
    if (speaks('rich:height') || fills()) return;
    if (window.innerWidth !== lastW) { lastW = window.innerWidth; coupled = false; }
    var h = contentHeight();
    if (!h || Math.abs(h - lastH) < 2) return;
    var step = h - lastH, now = Date.now();
    if (step > 0 && lastStep > 0 && Math.abs(step - lastStep) <= 2 && now - lastAt < 1500) {
      if (!coupled) post({ type: 'rich:held', reason: 'viewport', height: lastH });
      coupled = true;
    }
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
    quietDevices();
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
    if (e.source !== window.parent || !e.data) return;
    if (e.data.type === 'rich:hush') hush();
    else if (e.data.type === 'rich:camera-off') quietDevices();
  });
  function wake() {
    while (quieted.length) { var c = quieted.pop(); if (c.state === 'suspended') c.resume(); }
    wakeDevices();
  }
  window.addEventListener('pointerdown', wake, true);
  window.addEventListener('keydown', wake, true);

  // ---- camera and microphone -----------------------------------------------
  var md = navigator.mediaDevices;
  var realGUM = md && md.getUserMedia ? md.getUserMedia.bind(md) : null;
  var held = []; // { stream, constraints, quieted }
  var deviceWord = function (c) { return c && c.video ? 'camera' : 'microphone'; };
  var liveTracks = function (s) { return s.getTracks().filter(function (t) { return t.readyState === 'live'; }); };
  // Asked for before any click: a button, and the stream once it is pressed.
  var waiting = null;
  function afterClick(word) {
    if (waiting) return waiting.promise;
    var done;
    waiting = { promise: new Promise(function (r) { done = r; }) };
    function show() {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-rich-kit', 'start');
      b.textContent = 'start the ' + word;
      b.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647;font:500 13px/1 system-ui,sans-serif;letter-spacing:.06em;padding:12px 18px;background:#12121a;color:#e8b84a;border:1px solid #7a6030;border-radius:2px;cursor:pointer';
      b.addEventListener('click', function () { b.remove(); waiting = null; done(); });
      (document.body || document.documentElement).appendChild(b);
    }
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
    return waiting.promise;
  }
  function quietDevices() {
    var any = false;
    for (var i = 0; i < held.length; i++) {
      var live = liveTracks(held[i].stream);
      if (!live.length) continue;
      live.forEach(function (t) { t.stop(); });
      held[i].quieted = true;
      any = true;
    }
    if (any) post({ type: 'rich:camera', on: false });
  }
  // Back into the same stream, so whatever the piece wired it to plays again.
  function wakeDevices() {
    held.forEach(function (h) {
      if (!h.quieted) return;
      h.quieted = false;
      realGUM(h.constraints).then(function (fresh) {
        h.stream.getTracks().forEach(function (t) { h.stream.removeTrack(t); });
        fresh.getTracks().forEach(function (t) { h.stream.addTrack(t); });
        post({ type: 'rich:camera', on: true, what: deviceWord(h.constraints) });
      }, function () { /* refused now: it stays off */ });
    });
  }
  if (realGUM) {
    md.getUserMedia = function (constraints) {
      var c = constraints || { video: true };
      function go() {
        return realGUM(c).then(function (stream) {
          held.push({ stream: stream, constraints: c, quieted: false });
          post({ type: 'rich:camera', on: true, what: deviceWord(c) });
          return stream;
        }, function (e) {
          post({ type: 'rich:camera', on: false, refused: (e && e.name) || 'refused' });
          throw e;
        });
      }
      var u = navigator.userActivation;
      return u && !u.isActive ? afterClick(deviceWord(c)).then(go) : go();
    };
  }
  function camera(constraints) {
    if (!realGUM) return Promise.reject(new Error('this browser offers no camera here'));
    return md.getUserMedia(constraints || { video: true, audio: false });
  }
  function cameraOff() {
    held.forEach(function (h) { h.quieted = false; liveTracks(h.stream).forEach(function (t) { t.stop(); }); });
    post({ type: 'rich:camera', on: false });
  }

  // ---- storage --------------------------------------------------------------
  // Every piece on the piece origin shares one origin, so each keeps its keys
  // under its own path. A piece with no origin gets storage in memory.
  // The prefix is the piece's palace path, as the piece origin serves it: "piece:A/B/x.html:".
  var PREFIX = 'piece:' + (function () { try { return decodeURIComponent(location.pathname); } catch (e) { return location.pathname; } })().replace(/^\/+/, '') + ':';
  var METHODS = { getItem: 1, setItem: 1, removeItem: 1, clear: 1, key: 1, length: 1 };
  function storeFor(name) {
    var real = null;
    try { real = window[name]; if (real) real.getItem(PREFIX); } catch (e) { real = null; }
    var mem = Object.create(null), told = false;
    function touch() { if (!told) { told = true; post({ type: 'rich:storage', kept: !!real, store: name }); } }
    function own() {
      if (!real) return Object.keys(mem);
      var out = [];
      for (var i = 0; i < real.length; i++) { var k = real.key(i); if (k && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length)); }
      return out;
    }
    var api = {
      getItem: function (k) { touch(); k = String(k); if (real) return real.getItem(PREFIX + k); return k in mem ? mem[k] : null; },
      setItem: function (k, v) { touch(); k = String(k); v = String(v); if (real) real.setItem(PREFIX + k, v); else mem[k] = v; },
      removeItem: function (k) { touch(); k = String(k); if (real) real.removeItem(PREFIX + k); else delete mem[k]; },
      clear: function () { touch(); own().forEach(function (k) { api.removeItem(k); }); },
      key: function (i) { var ks = own(); return i >= 0 && i < ks.length ? ks[i] : null; },
    };
    Object.defineProperty(api, 'length', { configurable: true, get: function () { return own().length; } });
    return new Proxy(api, {
      get: function (t, p) { if (typeof p !== 'string' || METHODS[p]) return t[p]; var v = api.getItem(p); return v === null ? undefined : v; },
      set: function (t, p, v) { if (typeof p !== 'string' || METHODS[p]) return false; api.setItem(p, v); return true; },
      has: function (t, p) { return typeof p === 'string' && (!!METHODS[p] || api.getItem(p) !== null); },
      deleteProperty: function (t, p) { if (typeof p === 'string' && !METHODS[p]) api.removeItem(p); return true; },
      ownKeys: function () { return own(); },
      getOwnPropertyDescriptor: function (t, p) {
        if (typeof p !== 'string' || METHODS[p]) return undefined;
        var v = api.getItem(p);
        return v === null ? undefined : { value: v, writable: true, enumerable: true, configurable: true };
      },
    });
  }
  ['localStorage', 'sessionStorage'].forEach(function (name) {
    try { var store = storeFor(name); Object.defineProperty(window, name, { configurable: true, enumerable: true, get: function () { return store; } }); } catch (e) { /* left as the browser made it */ }
  });

  window.RichPiece = Object.freeze({ kit: 2, camera: camera, cameraOff: cameraOff });

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
