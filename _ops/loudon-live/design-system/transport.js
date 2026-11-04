/* Palace Transport — a play/stop button with a hairline scrub, so a page never shows the OS audio player.
   Loudon Live edition (2026-11-03). Plain script, no framework: load it after the page's audio, or anywhere with
   data-auto="off" and call PalaceTransport.all() or .mount(audio) yourself.

   What it does to an <audio controls>: hides the native player, keeps the element (it still plays), and draws
   beside it a ▸ button, a hairline track with a square head, and the time said twice (now / duration). ■ stops
   and rewinds; drag or click the track to scrub; arrows step a second (Shift: five), Home and End jump; one
   player at a time (starting one stops the others). A file that will not load shows the HOLD word instead of a
   duration. Styles: transport.css, in the skin's tokens. Opt a player out with data-transport="off"; name one
   with data-label. Nothing here touches the sound. */
(function (root) {
  var CFG = { prefix: 'tp', hold: 'no file', solo: true };
  var P = CFG.prefix, live = [];
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fmt(t) { if (!isFinite(t) || t < 0) return '–:––'; var m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ':' + (s < 10 ? '0' : '') + s; }

  function mount(audio, opts) {
    if (!audio || audio.__tp) return audio && audio.__tp;
    opts = opts || {};
    var wrap = el('div', P), btn = el('button', P + '__btn', '▸'), track = el('div', P + '__track'),
        played = el('div', P + '__played'), head = el('div', P + '__head'), time = el('span', P + '__time'),
        now = el('span', P + '__now', '0:00'), sep = el('span', P + '__sep', ' / '), dur = el('span', P + '__dur', fmt(NaN));
    btn.type = 'button'; btn.setAttribute('aria-label', 'Play');
    track.setAttribute('role', 'slider'); track.tabIndex = 0; track.setAttribute('aria-label', 'Position');
    track.setAttribute('aria-valuemin', '0'); track.setAttribute('aria-valuemax', '100'); track.setAttribute('aria-valuenow', '0');
    track.appendChild(played); track.appendChild(head);
    time.appendChild(now); time.appendChild(sep); time.appendChild(dur);
    wrap.appendChild(btn); wrap.appendChild(track); wrap.appendChild(time);
    var name = opts.label || audio.getAttribute('data-label');
    if (name) wrap.appendChild(el('span', P + '__name', name));
    wrap.setAttribute('data-state', 'stopped');
    audio.controls = false; audio.setAttribute('data-transport', 'mounted'); audio.style.display = 'none';
    audio.parentNode.insertBefore(wrap, audio.nextSibling);

    var pendingSeek = null, raf = null, dragging = false;
    function ratio() { var d = audio.duration; return (isFinite(d) && d > 0) ? Math.min(1, audio.currentTime / d) : 0; }
    function draw() {
      if (wrap.getAttribute('data-state') === 'hold') return;
      var r = ratio();
      played.style.width = (r * 100) + '%'; head.style.left = (r * 100) + '%';
      now.textContent = fmt(audio.currentTime); dur.textContent = fmt(audio.duration);
      track.setAttribute('aria-valuenow', String(Math.round(r * 100)));
      track.setAttribute('aria-valuetext', fmt(audio.currentTime) + ' of ' + fmt(audio.duration));
    }
    function state(s) {
      wrap.setAttribute('data-state', s);
      btn.textContent = s === 'playing' ? '■' : '▸';
      btn.setAttribute('aria-label', s === 'playing' ? 'Stop' : 'Play');
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      if (s === 'playing') (function tick() { draw(); raf = requestAnimationFrame(tick); })();
    }
    function hold() { state('hold'); now.textContent = ''; sep.textContent = ''; dur.textContent = CFG.hold; }
    function stop() { audio.pause(); try { audio.currentTime = 0; } catch (e) {} state('stopped'); draw(); }
    function play() {
      if (CFG.solo) live.forEach(function (o) { if (o !== api && o.el.getAttribute('data-state') === 'playing') o.stop(); });
      var p = audio.play(); if (p && p.catch) p.catch(function () { hold(); });
    }
    function seekRatio(f) {
      f = Math.min(1, Math.max(0, f)); var d = audio.duration;
      if (isFinite(d) && d > 0) { audio.currentTime = f * d; draw(); }
      else { pendingSeek = f; if (audio.preload === 'none') audio.preload = 'metadata'; audio.load(); }
    }
    function seekAt(x) { var r = track.getBoundingClientRect(); if (r.width > 0) seekRatio((x - r.left) / r.width); }

    btn.addEventListener('click', function () { wrap.getAttribute('data-state') === 'playing' ? stop() : play(); });
    audio.addEventListener('play', function () { state('playing'); });
    audio.addEventListener('pause', function () { if (wrap.getAttribute('data-state') === 'playing') { state('stopped'); draw(); } });
    audio.addEventListener('ended', stop);
    audio.addEventListener('timeupdate', function () { if (!raf) draw(); });
    audio.addEventListener('durationchange', draw);
    audio.addEventListener('loadedmetadata', function () { if (pendingSeek != null) { var f = pendingSeek; pendingSeek = null; seekRatio(f); } draw(); });
    audio.addEventListener('error', hold);
    track.addEventListener('pointerdown', function (e) { dragging = true; try { track.setPointerCapture(e.pointerId); } catch (x) {} seekAt(e.clientX); e.preventDefault(); });
    track.addEventListener('pointermove', function (e) { if (dragging) seekAt(e.clientX); });
    track.addEventListener('pointerup', function () { dragging = false; });
    track.addEventListener('pointercancel', function () { dragging = false; });
    track.addEventListener('keydown', function (e) {
      var d = audio.duration, step = e.shiftKey ? 5 : 1, handled = true;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') audio.currentTime = Math.max(0, audio.currentTime - step);
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') audio.currentTime = isFinite(d) ? Math.min(d, audio.currentTime + step) : audio.currentTime + step;
      else if (e.key === 'Home') audio.currentTime = 0;
      else if (e.key === 'End' && isFinite(d)) audio.currentTime = d;
      else if (e.key === ' ' || e.key === 'Enter') btn.click();
      else handled = false;
      if (handled) { e.preventDefault(); draw(); }
    });

    var api = { el: wrap, audio: audio, play: play, stop: stop, draw: draw };
    audio.__tp = api; live.push(api); draw();
    if (audio.error) hold();
    return api;
  }

  function all(scope) {
    var list = (scope || document).querySelectorAll('audio[controls]:not([data-transport])'), out = [];
    for (var i = 0; i < list.length; i++) out.push(mount(list[i]));
    return out;
  }

  var T = { mount: mount, all: all, config: CFG, live: live, version: '2026-11-03' };
  root.PalaceTransport = T;
  if (root.DT && typeof root.DT === 'object') { root.DT.transport = mount; root.DT.transportAll = all; }
  var me = document.currentScript;
  if (!(me && me.getAttribute('data-auto') === 'off')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { all(); });
    else all();
  }
})(window);
