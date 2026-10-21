/* Drafting Table — dt-controls.js
   The twelve components as plain functions, no framework. For a plugin editor (JUCE WebView)
   or any page that will not carry React. Same classes as components/bundle.css, same tokens,
   same geometry and gestures as components/bundle.js; the two are kept in step by hand.

   Usage:
     var k = DT.knob({ spec: {id:'freq', name:'Freq', unit:'Hz', min:20, max:20000, def:440, taper:'Log'},
                       value: 440, onChange: function (v) { host.set('freq', v); } });
     panel.appendChild(k.el);
     k.set(880);              // move it from outside (automation): redraws, does not call onChange
     k.source('datasheet');   // colour the readout by provenance

   Every control returns { el, set(value), get(), source(name), disable(bool) } unless noted.
   Values are in natural units, as tpl::ParamSpec writes them. */
(function (global) {
  'use strict';

  var SVG = 'http://www.w3.org/2000/svg';
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function svg(tag, attrs) { var e = document.createElementNS(SVG, tag); for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]); return e; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function fmt(v, places) {
    if (typeof v !== 'number' || !isFinite(v)) return '—';
    if (places == null) { var a = Math.abs(v); places = a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : 3; }
    var s = v.toFixed(places);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s === '-0' ? '0' : s;
  }
  /* value + unit, with unit scaling as the brand book writes it */
  function fmtUnit(v, unit, places) {
    if (typeof v !== 'number' || !isFinite(v)) return '—';
    if (unit === 'Hz' && Math.abs(v) >= 1000) return fmt(v / 1000, 1) + ' kHz';
    if (unit === 's' && Math.abs(v) < 1) return fmt(v * 1000, 1) + ' ms';
    if (!unit && v !== 0 && places == null && (Math.abs(v) < 0.01 || Math.abs(v) >= 10000)) return fmtSci(v);
    return fmt(v, places) + (unit ? ' ' + unit : '');
  }
  /* 1.00 × 10⁻⁵: a real ×, superscript digits, two decimals on the mantissa */
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function fmtSci(v) {
    var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (Math.abs(m) >= 9.995) { m /= 10; e += 1; }
    return m.toFixed(2) + ' × 10' + String(e).split('').map(function (ch) { return SUP[ch] || ch; }).join('');
  }
  function srcClass(s) { return 'dt-src-' + (s || 'design'); }
  function setSource(node, s) {
    node.className = node.className.replace(/\bdt-src-\w+/g, '').trim() + ' ' + srcClass(s);
  }

  function toNorm(v, spec) {
    if (spec.taper === 'Log' && spec.min > 0) return clamp((Math.log(v) - Math.log(spec.min)) / (Math.log(spec.max) - Math.log(spec.min)), 0, 1);
    return clamp((v - spec.min) / (spec.max - spec.min), 0, 1);
  }
  function fromNorm(n, spec) {
    n = clamp(n, 0, 1);
    if (spec.taper === 'Log' && spec.min > 0) return Math.exp(Math.log(spec.min) + n * (Math.log(spec.max) - Math.log(spec.min)));
    return spec.min + n * (spec.max - spec.min);
  }
  function quantise(v, spec) { return spec.step ? Math.round(v / spec.step) * spec.step : v; }

  /* the one gesture: 150px vertical for the full range, Shift a fifth, wheel 2% / 0.4%,
     double-click to def, arrows. `state` holds norm; `apply(norm, fromUser)` redraws and fires. */
  function gestures(target, state, apply, spec, hooks) {
    var y0 = 0, n0 = 0, down = false;
    hooks = hooks || {};
    target.addEventListener('pointerdown', function (e) {
      if (state.disabled) return;
      e.preventDefault(); target.setPointerCapture && target.setPointerCapture(e.pointerId);
      y0 = e.clientY; n0 = state.norm; down = true;
      if (hooks.begin) hooks.begin();
    });
    function up() { if (down) { down = false; if (hooks.end) hooks.end(); } }
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
    target.addEventListener('lostpointercapture', up);
    target.addEventListener('pointermove', function (e) {
      if (state.disabled || !(e.buttons & 1)) return;
      apply(clamp(n0 + ((y0 - e.clientY) / 150) * (e.shiftKey ? 0.2 : 1), 0, 1), true);
    });
    /* a wheel step, an arrow key or a double-click is a gesture too: begin on the first,
       end 300ms after the last, so a host records one move, not a jump outside a gesture */
    var tapTimer = null;
    function tap(n) {
      if (!tapTimer && !down && hooks.begin) hooks.begin();
      apply(n, true);
      if (tapTimer) clearTimeout(tapTimer);
      tapTimer = setTimeout(function () { tapTimer = null; if (!down && hooks.end) hooks.end(); }, 300);
    }
    target.addEventListener('wheel', function (e) {
      if (state.disabled) return;
      e.preventDefault();
      tap(clamp(state.norm - Math.sign(e.deltaY) * (e.shiftKey ? 0.004 : 0.02), 0, 1));
    }, { passive: false });
    target.addEventListener('dblclick', function () { if (!state.disabled) tap(toNorm(spec.def, spec)); });
    target.addEventListener('keydown', function (e) {
      if (state.disabled) return;
      var d = e.shiftKey ? 0.004 : 0.02;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { tap(state.norm + d); e.preventDefault(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { tap(state.norm - d); e.preventDefault(); }
    });
  }
  function aria(node, spec, label) {
    node.setAttribute('role', 'slider'); node.setAttribute('tabindex', '0');
    node.setAttribute('aria-label', label || spec.id || ''); node.setAttribute('aria-valuemin', spec.min); node.setAttribute('aria-valuemax', spec.max);
  }

  /* ── Binding ──────────────────────────────────────────────────────────
     A host parameter as { get(), set(value), begin(), end(), on(fn) } in natural units
     (the VST Template wraps each JUCE relay so). Pass it as o.binding: the control reads
     its first value from get(), writes every user move with set(), brackets a drag with
     begin()/end() as one automation gesture, and redraws on on(). onChange still fires. */
  function bindHooks(o) {
    var b = o.binding; if (!b) return null;
    return { begin: function () { if (b.begin) b.begin(); }, end: function () { if (b.end) b.end(); } };
  }
  function bindTo(api, o) {
    var b = o.binding; if (!b) return api;
    var user = o.onChange;
    o.onChange = function (v) { b.set(v); if (user) user(v); };
    if (b.on) b.on(function (v) { api.set(v); });
    return api;
  }
  /* mount(container, spec, binding, opts): the one-call form; the taper picks the control. */
  function mount(container, spec, binding, opts) {
    var c = fromSpec(spec, Object.assign({ binding: binding }, opts || {}));
    container.appendChild(c.el); return c;
  }

  /* ── Knob ─────────────────────────────────────────────────────────── */
  var A0 = -135, A1 = 135;
  function polar(c, r, deg) { var a = (deg - 90) * Math.PI / 180; return [c + r * Math.cos(a), c + r * Math.sin(a)]; }
  function arc(c, r, a, b) {
    var p = polar(c, r, a), q = polar(c, r, b), large = Math.abs(b - a) > 180 ? 1 : 0;
    return 'M' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + q[0].toFixed(2) + ' ' + q[1].toFixed(2);
  }
  function knob(o) {
    var spec = Object.assign({ min: 0, max: 1, def: 0, taper: 'Linear', unit: '', name: '' }, o.spec || {});
    var size = o.size || 72, c = size / 2, rT = c - 2, rD = c - 10, nT = o.ticks == null ? 5 : o.ticks;
    var root = el('div', 'dt dt-knob'), label = o.label == null ? spec.name : o.label;
    if (label) root.appendChild(el('span', 'dt-knob__label', label));
    var s = svg('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size });
    aria(s, spec, label);
    s.appendChild(svg('path', { 'class': 'dt-knob__track', d: arc(c, rT - 2, A0, A1) }));
    for (var i = 0; i < nT; i++) {
      var a = A0 + (i / (nT - 1)) * (A1 - A0), p = polar(c, rT - 4, a), q = polar(c, rT - 1, a);
      s.appendChild(svg('line', { 'class': 'dt-knob__tick', x1: p[0], y1: p[1], x2: q[0], y2: q[1] }));
    }
    var arcEl = svg('path', { 'class': 'dt-knob__arc', d: '' }); s.appendChild(arcEl);
    s.appendChild(svg('circle', { 'class': 'dt-knob__disc', cx: c, cy: c, r: rD }));
    s.appendChild(svg('circle', { 'class': 'dt-knob__lip', cx: c, cy: c - 1, r: rD - 2.5 }));
    var ptr = svg('line', { 'class': 'dt-knob__ptr' }); s.appendChild(ptr);
    root.appendChild(s);
    var out = el('span', 'dt-knob__value ' + srcClass(o.source)); if (!o.hideValue) root.appendChild(out);
    var state = { norm: 0, value: spec.def, disabled: !!o.disabled };
    function draw() {
      var aV = A0 + state.norm * (A1 - A0);
      arcEl.setAttribute('d', state.norm > 0.001 ? arc(c, rT - 2, A0, aV) : '');
      var p0 = polar(c, rD * 0.25, aV), p1 = polar(c, rD - 2, aV);
      ptr.setAttribute('x1', p0[0]); ptr.setAttribute('y1', p0[1]); ptr.setAttribute('x2', p1[0]); ptr.setAttribute('y2', p1[1]);
      out.textContent = o.format ? o.format(state.value) : fmtUnit(state.value, spec.unit, o.places);
      s.setAttribute('aria-valuenow', state.value);
    }
    function apply(n, fromUser) {
      state.norm = clamp(n, 0, 1); state.value = quantise(fromNorm(state.norm, spec), spec); draw();
      if (fromUser && o.onChange) o.onChange(state.value);
    }
    gestures(s, state, apply, spec, bindHooks(o));
    apply(toNorm(o.value == null ? spec.def : (o.binding ? o.binding.get() : o.value), spec), false);
    var api = {
      el: root, set: function (v) { apply(toNorm(v, spec), false); }, get: function () { return state.value; },
      source: function (name) { setSource(out, name); },
      disable: function (b) { state.disabled = !!b; root.classList.toggle('dt-knob--disabled', !!b); s.setAttribute('tabindex', b ? '-1' : '0'); }
    };
    return bindTo(api, o);
  }

  /* ── Fader ────────────────────────────────────────────────────────── */
  function fader(o) {
    var spec = Object.assign({ min: 0, max: 1, def: 0, taper: 'Linear', unit: '', name: '' }, o.spec || {});
    var H = o.height || 160, pad = 8, travel = H - pad * 2;
    var root = el('div', 'dt dt-fader'), label = o.label == null ? spec.name : o.label;
    if (label) root.appendChild(el('span', 'dt-fader__label', label));
    var body = el('div', 'dt-fader__body'); body.style.height = H + 'px';
    var slot = el('div', 'dt-fader__slot'); slot.style.height = H + 'px'; aria(slot, spec, label);
    var cap = el('div', 'dt-fader__cap'); slot.appendChild(cap);
    var scale = el('div', 'dt-fader__scale'); scale.style.height = H + 'px';
    (o.marks || [spec.min, (spec.min + spec.max) / 2, spec.max]).forEach(function (m) {
      var t = el('span', null, o.markFormat ? o.markFormat(m) : fmt(m)); t.style.top = (pad + (1 - toNorm(m, spec)) * travel) + 'px'; scale.appendChild(t);
    });
    body.appendChild(slot); body.appendChild(scale); root.appendChild(body);
    var out = el('span', 'dt-fader__value ' + srcClass(o.source)); if (!o.hideValue) root.appendChild(out);
    var state = { norm: 0, value: spec.def, disabled: !!o.disabled };
    function apply(n, fromUser) {
      state.norm = clamp(n, 0, 1); state.value = quantise(fromNorm(state.norm, spec), spec);
      cap.style.top = (pad + (1 - state.norm) * travel) + 'px';
      out.textContent = o.format ? o.format(state.value) : fmtUnit(state.value, spec.unit, o.places);
      slot.setAttribute('aria-valuenow', state.value);
      if (fromUser && o.onChange) o.onChange(state.value);
    }
    gestures(slot, state, apply, spec, bindHooks(o));
    apply(toNorm(o.value == null ? spec.def : (o.binding ? o.binding.get() : o.value), spec), false);
    return bindTo({ el: root, set: function (v) { apply(toNorm(v, spec), false); }, get: function () { return state.value; },
      source: function (name) { setSource(out, name); }, disable: function (b) { state.disabled = !!b; } }, o);
  }

  /* ── Toggle ───────────────────────────────────────────────────────── */
  function toggle(o) {
    var labels = o.stateLabels || ['OFF', 'ON'], on = !!o.value;
    var root = el('button', 'dt dt-toggle'); root.type = 'button'; root.setAttribute('role', 'switch');
    if (o.label) root.appendChild(el('span', 'dt-toggle__label', o.label));
    var well = el('span', 'dt-toggle__well'); well.appendChild(el('span', 'dt-toggle__lever')); root.appendChild(well);
    var st = el('span', 'dt-toggle__state'); if (!o.hideState) root.appendChild(st);
    function draw() { root.classList.toggle('dt-toggle--on', on); root.setAttribute('aria-checked', on); st.textContent = labels[on ? 1 : 0]; }
    root.addEventListener('click', function () { if (root.disabled) return; on = !on; draw(); if (o.onChange) o.onChange(on ? 1 : 0); });
    root.disabled = !!o.disabled; if (o.binding) on = !!o.binding.get(); draw();
    return bindTo({ el: root, set: function (v) { on = !!v; draw(); }, get: function () { return on ? 1 : 0; }, source: function () {}, disable: function (b) { root.disabled = !!b; } }, o);
  }

  /* ── Choice ───────────────────────────────────────────────────────── */
  function choice(o) {
    var choices = Array.isArray(o.choices) ? o.choices : String(o.choices || '').split('|'), idx = o.value == null ? 0 : o.value;
    var root = el('div', 'dt dt-choice'); root.setAttribute('role', 'group'); if (o.label) { root.setAttribute('aria-label', o.label); root.appendChild(el('span', 'dt-choice__label', o.label)); }
    var row = el('div', 'dt-choice__row'), segs = [];
    choices.forEach(function (c, i) {
      var b = el('button', 'dt-choice__seg', c); b.type = 'button'; b.disabled = !!o.disabled;
      b.addEventListener('click', function () { idx = i; draw(); if (o.onChange) o.onChange(i); });
      segs.push(b); row.appendChild(b);
    });
    root.appendChild(row);
    function draw() { segs.forEach(function (b, i) { b.setAttribute('aria-pressed', i === idx); }); }
    if (o.binding) idx = Math.round(o.binding.get()); draw();
    return bindTo({ el: root, set: function (i) { idx = i; draw(); }, get: function () { return idx; }, source: function () {}, disable: function (d) { segs.forEach(function (b) { b.disabled = !!d; }); } }, o);
  }

  /* ── Button ───────────────────────────────────────────────────────── */
  function button(o) {
    var latch = o.variant === 'latch', on = latch && !!o.value;
    var root = el('button', 'dt dt-button' + (o.variant === 'quiet' ? ' dt-button--quiet' : '')); root.type = 'button'; root.disabled = !!o.disabled;
    if (o.led) root.appendChild(el('span', 'dt-button__led'));
    root.appendChild(document.createTextNode(o.label || ''));
    function draw() { root.classList.toggle('dt-button--on', on); if (latch) root.setAttribute('aria-pressed', on); }
    root.addEventListener('click', function (e) { if (latch) { on = !on; draw(); if (o.onChange) o.onChange(on ? 1 : 0); } if (o.onClick) o.onClick(e); });
    draw();
    return { el: root, set: function (v) { on = !!v; draw(); }, get: function () { return on ? 1 : 0; }, source: function () {}, disable: function (b) { root.disabled = !!b; } };
  }

  /* ── Readout ──────────────────────────────────────────────────────── */
  function readout(o) {
    var root = el('div', 'dt dt-readout' + (o.variant === 'recess' ? ' dt-readout--recess' : ''));
    if (o.label) root.appendChild(el('span', 'dt-readout__label', o.label));
    var cell = el('div', 'dt-readout__cell ' + srcClass(o.source)), val = el('span'), unit = el('span', 'dt-readout__unit', o.unit || '');
    cell.appendChild(val); if (o.unit) cell.appendChild(unit); root.appendChild(cell);
    function set(v) { val.textContent = typeof v === 'number' ? fmt(v, o.places) : (v == null ? '—' : String(v)); }
    set(o.value);
    return { el: root, set: set, get: function () { return val.textContent; }, source: function (name) { setSource(cell, name); }, disable: function () {} };
  }

  /* ── Meter ────────────────────────────────────────────────────────── */
  function meter(o) {
    var v = o.orientation !== 'horizontal', L = o.length || (v ? 160 : 200);
    var root = el('div', 'dt dt-meter ' + (v ? 'dt-meter--v' : 'dt-meter--h')); root.setAttribute('role', 'meter'); root.setAttribute('aria-valuemin', 0); root.setAttribute('aria-valuemax', 1); if (o.label) root.setAttribute('aria-label', o.label);
    var trough = el('div', 'dt-meter__trough'); trough.style[v ? 'height' : 'width'] = L + 'px';
    var fill = el('div', 'dt-meter__fill'), peak = el('div', 'dt-meter__peak'); trough.appendChild(fill); trough.appendChild(peak); root.appendChild(trough);
    if (!o.hideScale) {
      var scale = el('div', 'dt-meter__scale'); scale.style[v ? 'height' : 'width'] = L + 'px';
      (o.marks || [{ at: 1, label: '0' }, { at: 0.75, label: '-6' }, { at: 0.5, label: '-12' }, { at: 0.25, label: '-24' }, { at: 0, label: '-∞' }]).forEach(function (m) {
        var t = el('span', null, m.label); t.style[v ? 'top' : 'left'] = (v ? (1 - m.at) : m.at) * 100 + '%'; scale.appendChild(t);
      });
      root.appendChild(scale);
    }
    function set(level, pk) {
      level = clamp(level || 0, 0, 1); fill.style[v ? 'height' : 'width'] = level * 100 + '%'; root.setAttribute('aria-valuenow', level);
      if (pk == null) peak.style.display = 'none'; else { peak.style.display = ''; pk = clamp(pk, 0, 1); peak.style[v ? 'bottom' : 'left'] = 'calc(' + pk * 100 + '% - 1px)'; }
    }
    set(o.level, o.peak);
    return { el: root, set: set, get: function () { return parseFloat(root.getAttribute('aria-valuenow')); }, source: function () {}, disable: function () {} };
  }

  /* ── Scope ────────────────────────────────────────────────────────── */
  function cssVar(node, name, fb) { try { return getComputedStyle(node).getPropertyValue(name).trim() || fb; } catch (e) { return fb; } }
  function scope(o) {
    var W = o.width || 240, H = o.height || 120, divs = o.divisions || 8;
    var root = el('div', 'dt dt-scope');
    if (o.label || o.meta) { var lab = el('div', 'dt-scope__label'); lab.appendChild(el('span', null, o.label || '')); lab.appendChild(el('span', null, o.meta || '')); root.appendChild(lab); }
    var screen = el('div', 'dt-scope__screen'); screen.style.width = (W + 3) + 'px'; screen.style.height = (H + 3) + 'px';
    var cv = el('canvas'); cv.style.width = W + 'px'; cv.style.height = H + 'px'; screen.appendChild(cv); root.appendChild(screen);
    var dpr = global.devicePixelRatio || 1; cv.width = W * dpr; cv.height = H * dpr;
    var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    function trace(arr, color) {
      if (!arr || !arr.length) return;
      g.save(); g.shadowColor = color; g.shadowBlur = 6; g.strokeStyle = color; g.lineWidth = 1.5; g.lineJoin = 'round'; g.beginPath();
      for (var k = 0; k < arr.length; k++) { var x = (k / (arr.length - 1)) * W, y = H / 2 - clamp(arr[k], -1, 1) * (H / 2 - 4); k ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); g.restore();
    }
    function set(samples, samples2) {
      var ground = cssVar(cv, '--scope-ground', '#050a06'), grid = cssVar(cv, '--scope-grid', '#0f5024'), t1 = cssVar(cv, '--scope-trace', '#33ff66'), t2 = cssVar(cv, '--scope-trace-2', '#ffb000');
      g.fillStyle = ground; g.fillRect(0, 0, W, H);
      g.strokeStyle = grid; g.lineWidth = 1; g.beginPath();
      for (var i = 1; i < divs; i++) { var x = Math.round(i * W / divs) + 0.5; g.moveTo(x, 0); g.lineTo(x, H); }
      var hd = Math.max(2, Math.round(divs * H / W));
      for (var j = 1; j < hd; j++) { var y = Math.round(j * H / hd) + 0.5; g.moveTo(0, y); g.lineTo(W, y); }
      g.moveTo(0, H / 2 + 0.5); g.lineTo(W, H / 2 + 0.5); g.stroke();
      trace(samples, t1); if (samples2) trace(samples2, t2);
    }
    set(o.samples, o.samples2);
    return { el: root, set: set, get: function () {}, source: function () {}, disable: function () {}, canvas: cv };
  }

  /* ── Sheet pieces ─────────────────────────────────────────────────── */
  function titleBlock(o) {
    var root = el('div', 'dt dt-tb' + (o.variant === 'row' ? ' dt-tb--row' : ''));
    function kv(k, v) { var s = el('span'); if (v == null) return s; s.appendChild(el('span', 'dt-tb__k', k ? k + ' ' : '')); s.appendChild(document.createTextNode(v)); return s; }
    var c1 = el('div', 'dt-tb__cell dt-tb__cell--wide'); c1.appendChild(el('div', 'dt-tb__name', o.name || '')); if (o.subtitle) c1.appendChild(el('div', 'dt-tb__sub', o.subtitle));
    var c2 = el('div', 'dt-tb__cell dt-tb__cell--wide'), r = el('div', 'dt-tb__row'); r.appendChild(kv('No.', o.number)); r.appendChild(kv('version', o.version)); r.appendChild(kv('', o.unit)); c2.appendChild(r);
    var status = el('div', 'dt-tb__status ' + srcClass(o.statusSource || 'measure'), o.status || ''); if (o.status) c2.appendChild(status);
    var c3 = el('div', 'dt-tb__cell'); var r3 = el('div', 'dt-tb__row'); r3.appendChild(kv('source', o.source)); c3.appendChild(r3); var r4 = el('div', 'dt-tb__row'); r4.appendChild(kv('drawn', o.drawn)); c3.appendChild(r4);
    var c4 = el('div', 'dt-tb__cell'); c4.appendChild(el('div', 'dt-tb__row', o.maker || '')); c4.appendChild(el('div', 'dt-tb__row', o.tool || ''));
    [c1, c2, c3, c4].forEach(function (c) { root.appendChild(c); });
    return { el: root, set: function (s, src) { status.textContent = s || ''; if (src) setSource(status, src); if (s && !status.parentNode) c2.appendChild(status); } };
  }
  function panel(o) {
    var root = el('section', 'dt dt-panel dt-panel--' + (o.variant || 'card'));
    if (o.caption) root.appendChild(el('div', 'dt-panel__caption dt-eyebrow', o.caption));
    return { el: root, body: root };
  }
  function dimension(o) {
    var v = o.orientation === 'vertical', root = el('div', 'dt dt-dimension ' + (v ? 'dt-dimension--v ' : '') + srcClass(o.source));
    if (o.length) root.style[v ? 'height' : 'width'] = typeof o.length === 'number' ? o.length + 'px' : o.length;
    function line() {
      var l = el('div', 'dt-dimension__line'), t1 = el('i', 'dt-dimension__tick'), t2 = el('i', 'dt-dimension__tick');
      t1.style[v ? 'top' : 'left'] = 0; t2.style[v ? 'bottom' : 'right'] = 0;
      l.appendChild(t1); l.appendChild(t2); l.appendChild(el('i', 'dt-dimension__arrow dt-dimension__arrow--l')); l.appendChild(el('i', 'dt-dimension__arrow dt-dimension__arrow--r')); return l;
    }
    var lab = el('span', 'dt-dimension__label', o.label || '');
    root.appendChild(line()); root.appendChild(lab); root.appendChild(line());
    return { el: root, set: function (t) { lab.textContent = t; }, source: function (s) { setSource(root, s); } };
  }
  function legend(o) {
    var items = o.items || [
      { source: 'datasheet', name: 'DATASHEET', what: 'read from elsewhere' }, { source: 'design', name: 'DESIGN', what: 'chosen here; change it in the source' },
      { source: 'assumed', name: 'ASSUMED', what: 'nominal; the calipers will correct it' }, { source: 'measure', name: 'MEASURE', what: 'not known: calipers, then the source' }];
    var root = el('div', 'dt dt-legend');
    items.forEach(function (it) { root.appendChild(el('span', 'dt-legend__stroke ' + srcClass(it.source))); root.appendChild(el('span', 'dt-legend__name ' + srcClass(it.source), it.name)); root.appendChild(el('span', 'dt-legend__what', it.what)); });
    return { el: root };
  }

  /* a whole face from a parameter table: one control per row, by taper */
  function fromSpec(spec, o) {
    o = o || {};
    var v = o.value == null ? spec.def : o.value;
    if (spec.taper === 'Toggle') return toggle({ label: spec.name, value: v, onChange: o.onChange, disabled: o.disabled, binding: o.binding });
    if (spec.taper === 'Choice') return choice({ label: spec.name, choices: spec.choices, value: v, onChange: o.onChange, disabled: o.disabled, binding: o.binding });
    return knob(Object.assign({ spec: spec }, o));
  }

  global.DT = { knob: knob, fader: fader, toggle: toggle, choice: choice, button: button, readout: readout, meter: meter, scope: scope,
    titleBlock: titleBlock, panel: panel, dimension: dimension, legend: legend, fromSpec: fromSpec, mount: mount,
    fmt: fmt, fmtUnit: fmtUnit, fmtSci: fmtSci, toNorm: toNorm, fromNorm: fromNorm };
})(typeof window !== 'undefined' ? window : this);
