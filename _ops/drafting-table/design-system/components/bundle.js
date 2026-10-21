/* @ds-bundle: {"format":4,"namespace":"DraftingTable","components":[{"name":"TitleBlock"},{"name":"Panel"},{"name":"Dimension"},{"name":"Legend"},{"name":"Knob"},{"name":"Fader"},{"name":"Toggle"},{"name":"Choice"},{"name":"Button"},{"name":"Readout"},{"name":"Meter"},{"name":"Scope"}]} */
(function () {
  var R = window.React;
  if (!R) { window.DraftingTable = {}; return; }
  var h = R.createElement;

  function cx() { var out = []; for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]); return out.join(' '); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function fmt(v, places) {
    if (typeof v !== 'number' || !isFinite(v)) return '—';
    if (places == null) {
      var a = Math.abs(v);
      places = a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : 3;
    }
    var s = v.toFixed(places);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s === '-0' ? '0' : s;
  }
  function srcClass(source) { return source ? 'dt-src-' + source : 'dt-src-design'; }

  /* taper: natural units <-> 0..1, after tpl::ParamSpec */
  function toNorm(v, spec) {
    var min = spec.min, max = spec.max;
    if (spec.taper === 'Log' && min > 0) return clamp((Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min)), 0, 1);
    return clamp((v - min) / (max - min), 0, 1);
  }
  function fromNorm(n, spec) {
    n = clamp(n, 0, 1);
    var min = spec.min, max = spec.max;
    if (spec.taper === 'Log' && min > 0) return Math.exp(Math.log(min) + n * (Math.log(max) - Math.log(min)));
    return min + n * (max - min);
  }
  function quantise(v, spec) {
    if (spec.step) return Math.round(v / spec.step) * spec.step;
    return v;
  }

  /* a vertical drag that reports a 0..1 delta per 150px, with shift for fine */
  function useDrag(norm, onNorm, disabled) {
    var ref = R.useRef({ y: 0, start: 0 });
    var onPointerDown = function (e) {
      if (disabled) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
      ref.current = { y: e.clientY, start: norm };
    };
    var onPointerMove = function (e) {
      if (disabled || !(e.buttons & 1)) return;
      var dy = ref.current.y - e.clientY;
      var fine = e.shiftKey ? 0.2 : 1;
      onNorm(clamp(ref.current.start + (dy / 150) * fine, 0, 1));
    };
    var onWheel = function (e) {
      if (disabled) return;
      e.preventDefault();
      onNorm(clamp(norm - Math.sign(e.deltaY) * (e.shiftKey ? 0.004 : 0.02), 0, 1));
    };
    return { onPointerDown: onPointerDown, onPointerMove: onPointerMove, onWheel: onWheel };
  }

  /* ── TitleBlock ─────────────────────────────────────────────────────── */
  function TitleBlock(p) {
    var kv = function (k, v) { return v == null ? null : h('span', null, h('span', { className: 'dt-tb__k' }, k + ' '), v); };
    return h('div', { className: cx('dt', 'dt-tb', p.className), style: p.style },
      h('div', { className: 'dt-tb__cell dt-tb__cell--wide' },
        h('div', { className: 'dt-tb__name' }, p.name),
        p.subtitle ? h('div', { className: 'dt-tb__sub' }, p.subtitle) : null),
      h('div', { className: 'dt-tb__cell dt-tb__cell--wide' },
        h('div', { className: 'dt-tb__row' }, kv('No.', p.number), kv('version', p.version), kv('', p.unit)),
        p.status ? h('div', { className: cx('dt-tb__status', srcClass(p.statusSource || 'measure')) }, p.status) : null),
      h('div', { className: 'dt-tb__cell' },
        h('div', { className: 'dt-tb__row' }, kv('source', p.source)),
        h('div', { className: 'dt-tb__row' }, kv('drawn', p.drawn))),
      h('div', { className: 'dt-tb__cell' },
        h('div', { className: 'dt-tb__row' }, p.maker || ''),
        h('div', { className: 'dt-tb__row' }, p.tool || '')));
  }

  /* ── Panel ──────────────────────────────────────────────────────────── */
  function Panel(p) {
    var variant = p.variant || 'card';
    return h('section', { className: cx('dt', 'dt-panel', 'dt-panel--' + variant, p.className), style: p.style },
      p.caption ? h('div', { className: 'dt-panel__caption dt-eyebrow' }, p.caption) : null,
      p.children);
  }

  /* ── Dimension ──────────────────────────────────────────────────────── */
  function Dimension(p) {
    var v = p.orientation === 'vertical';
    var line = h('div', { className: 'dt-dimension__line' },
      h('i', { className: 'dt-dimension__tick', style: v ? { top: 0 } : { left: 0 } }),
      h('i', { className: 'dt-dimension__tick', style: v ? { bottom: 0 } : { right: 0 } }),
      h('i', { className: 'dt-dimension__arrow dt-dimension__arrow--l' }),
      h('i', { className: 'dt-dimension__arrow dt-dimension__arrow--r' }));
    var style = Object.assign({}, p.style || {});
    if (p.length) { if (v) style.height = p.length; else style.width = p.length; }
    return h('div', { className: cx('dt', 'dt-dimension', v && 'dt-dimension--v', srcClass(p.source), p.className), style: style },
      line,
      h('span', { className: 'dt-dimension__label' }, p.label),
      line);
  }

  /* ── Legend ─────────────────────────────────────────────────────────── */
  var LEGEND_DEFAULT = [
    { source: 'datasheet', name: 'DATASHEET', what: 'read from elsewhere' },
    { source: 'design', name: 'DESIGN', what: 'chosen here; change it in the source' },
    { source: 'assumed', name: 'ASSUMED', what: 'nominal; the calipers will correct it' },
    { source: 'measure', name: 'MEASURE', what: 'not known: calipers, then the source' }
  ];
  function Legend(p) {
    var items = p.items || LEGEND_DEFAULT;
    var rows = [];
    items.forEach(function (it, i) {
      rows.push(h('span', { key: 's' + i, className: cx('dt-legend__stroke', srcClass(it.source)) }));
      rows.push(h('span', { key: 'n' + i, className: cx('dt-legend__name', srcClass(it.source)) }, it.name));
      rows.push(h('span', { key: 'w' + i, className: 'dt-legend__what' }, it.what));
    });
    return h('div', { className: cx('dt', 'dt-legend', p.className), style: p.style }, rows);
  }

  /* ── Knob ───────────────────────────────────────────────────────────── */
  var A0 = -135, A1 = 135;
  function polar(cx0, cy0, r, deg) { var a = (deg - 90) * Math.PI / 180; return [cx0 + r * Math.cos(a), cy0 + r * Math.sin(a)]; }
  function arcPath(cx0, cy0, r, a, b) {
    var p0 = polar(cx0, cy0, r, a), p1 = polar(cx0, cy0, r, b);
    var large = Math.abs(b - a) > 180 ? 1 : 0;
    return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
  }
  function Knob(p) {
    var spec = Object.assign({ min: 0, max: 1, def: 0, taper: 'Linear', unit: '', name: '' }, p.spec || {});
    var size = p.size || 72;
    var value = p.value == null ? spec.def : p.value;
    var norm = toNorm(value, spec);
    var onNorm = function (n) { if (p.onChange) p.onChange(quantise(fromNorm(n, spec), spec)); };
    var drag = useDrag(norm, onNorm, p.disabled);
    var c = size / 2, rTrack = c - 2, rDisc = c - 10;
    var aV = A0 + norm * (A1 - A0);
    var ticks = [];
    var nT = p.ticks == null ? 5 : p.ticks;
    for (var i = 0; i < nT; i++) {
      var a = A0 + (i / (nT - 1)) * (A1 - A0);
      var q0 = polar(c, c, rTrack - 4, a), q1 = polar(c, c, rTrack - 1, a);
      ticks.push(h('line', { key: i, className: 'dt-knob__tick', x1: q0[0], y1: q0[1], x2: q1[0], y2: q1[1] }));
    }
    var pt0 = polar(c, c, rDisc * 0.25, aV), pt1 = polar(c, c, rDisc - 2, aV);
    var label = p.label == null ? spec.name : p.label;
    var readout = p.format ? p.format(value) : (fmt(value, p.places) + (spec.unit ? ' ' + spec.unit : ''));
    return h('div', { className: cx('dt', 'dt-knob', p.disabled && 'dt-knob--disabled', p.className), style: p.style },
      label ? h('span', { className: 'dt-knob__label' }, label) : null,
      h('svg', Object.assign({
        width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, role: 'slider',
        'aria-label': label || spec.id, 'aria-valuemin': spec.min, 'aria-valuemax': spec.max, 'aria-valuenow': value,
        tabIndex: p.disabled ? -1 : 0,
        onDoubleClick: function () { if (p.onChange && !p.disabled) p.onChange(spec.def); },
        onKeyDown: function (e) {
          if (p.disabled) return;
          var d = e.shiftKey ? 0.005 : 0.02;
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { onNorm(norm + d); e.preventDefault(); }
          if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { onNorm(norm - d); e.preventDefault(); }
        }
      }, drag),
        h('path', { className: 'dt-knob__track', d: arcPath(c, c, rTrack - 2, A0, A1) }),
        ticks,
        norm > 0.001 ? h('path', { className: 'dt-knob__arc', d: arcPath(c, c, rTrack - 2, A0, aV) }) : null,
        h('circle', { className: 'dt-knob__disc', cx: c, cy: c, r: rDisc }),
        h('circle', { className: 'dt-knob__lip', cx: c, cy: c - 1, r: rDisc - 2.5 }),
        h('line', { className: 'dt-knob__ptr', x1: pt0[0], y1: pt0[1], x2: pt1[0], y2: pt1[1] })),
      p.hideValue ? null : h('span', { className: cx('dt-knob__value', srcClass(p.source)) }, readout));
  }

  /* ── Fader ──────────────────────────────────────────────────────────── */
  function Fader(p) {
    var spec = Object.assign({ min: 0, max: 1, def: 0, taper: 'Linear', unit: '', name: '' }, p.spec || {});
    var height = p.height || 160;
    var value = p.value == null ? spec.def : p.value;
    var norm = toNorm(value, spec);
    var onNorm = function (n) { if (p.onChange) p.onChange(quantise(fromNorm(n, spec), spec)); };
    var drag = useDrag(norm, onNorm, p.disabled);
    var pad = 8, travel = height - pad * 2;
    var y = pad + (1 - norm) * travel;
    var marks = p.marks || [spec.min, (spec.min + spec.max) / 2, spec.max];
    var label = p.label == null ? spec.name : p.label;
    var readout = p.format ? p.format(value) : (fmt(value, p.places) + (spec.unit ? ' ' + spec.unit : ''));
    return h('div', { className: cx('dt', 'dt-fader', p.className), style: p.style },
      label ? h('span', { className: 'dt-fader__label' }, label) : null,
      h('div', { className: 'dt-fader__body', style: { height: height } },
        h('div', Object.assign({
          className: 'dt-fader__slot', style: { height: height }, role: 'slider', tabIndex: p.disabled ? -1 : 0,
          'aria-label': label || spec.id, 'aria-valuemin': spec.min, 'aria-valuemax': spec.max, 'aria-valuenow': value,
          onDoubleClick: function () { if (p.onChange && !p.disabled) p.onChange(spec.def); },
          onKeyDown: function (e) {
            var d = e.shiftKey ? 0.005 : 0.02;
            if (e.key === 'ArrowUp') { onNorm(norm + d); e.preventDefault(); }
            if (e.key === 'ArrowDown') { onNorm(norm - d); e.preventDefault(); }
          }
        }, drag), h('div', { className: 'dt-fader__cap', style: { top: y } })),
        h('div', { className: 'dt-fader__scale', style: { height: height } },
          marks.map(function (m, i) { return h('span', { key: i, style: { top: pad + (1 - toNorm(m, spec)) * travel } }, p.markFormat ? p.markFormat(m) : fmt(m)); }))),
      p.hideValue ? null : h('span', { className: cx('dt-fader__value', srcClass(p.source)) }, readout));
  }

  /* ── Toggle ─────────────────────────────────────────────────────────── */
  function Toggle(p) {
    var on = !!p.value;
    var labels = p.stateLabels || ['OFF', 'ON'];
    return h('button', {
      type: 'button', role: 'switch', 'aria-checked': on, disabled: p.disabled,
      className: cx('dt', 'dt-toggle', on && 'dt-toggle--on', p.className), style: p.style,
      onClick: function () { if (p.onChange) p.onChange(on ? 0 : 1); }
    },
      p.label ? h('span', { className: 'dt-toggle__label' }, p.label) : null,
      h('span', { className: 'dt-toggle__well' }, h('span', { className: 'dt-toggle__lever' })),
      p.hideState ? null : h('span', { className: 'dt-toggle__state' }, labels[on ? 1 : 0]));
  }

  /* ── Choice ─────────────────────────────────────────────────────────── */
  function Choice(p) {
    var choices = Array.isArray(p.choices) ? p.choices : String(p.choices || '').split('|');
    var idx = p.value == null ? 0 : p.value;
    return h('div', { className: cx('dt', 'dt-choice', p.className), style: p.style, role: 'group', 'aria-label': p.label },
      p.label ? h('span', { className: 'dt-choice__label' }, p.label) : null,
      h('div', { className: 'dt-choice__row' }, choices.map(function (c, i) {
        return h('button', {
          key: i, type: 'button', className: 'dt-choice__seg', 'aria-pressed': i === idx, disabled: p.disabled,
          onClick: function () { if (p.onChange) p.onChange(i); }
        }, c);
      })));
  }

  /* ── Button ─────────────────────────────────────────────────────────── */
  function Button(p) {
    var latch = p.variant === 'latch';
    var on = latch && !!p.value;
    return h('button', {
      type: 'button', disabled: p.disabled, 'aria-pressed': latch ? on : undefined,
      className: cx('dt', 'dt-button', on && 'dt-button--on', p.variant === 'quiet' && 'dt-button--quiet', p.pressed && 'dt-button--pressed', p.className), style: p.style,
      onClick: function (e) { if (latch && p.onChange) p.onChange(on ? 0 : 1); if (p.onClick) p.onClick(e); }
    }, p.led ? h('span', { className: 'dt-button__led' }) : null, p.children || p.label);
  }

  /* ── Readout ────────────────────────────────────────────────────────── */
  function Readout(p) {
    var text = typeof p.value === 'number' ? fmt(p.value, p.places) : (p.value == null ? '—' : String(p.value));
    return h('div', { className: cx('dt', 'dt-readout', p.variant === 'recess' && 'dt-readout--recess', p.className), style: p.style },
      p.label ? h('span', { className: 'dt-readout__label' }, p.label) : null,
      h('div', { className: cx('dt-readout__cell', srcClass(p.source)) },
        h('span', null, text),
        p.unit ? h('span', { className: 'dt-readout__unit' }, p.unit) : null));
  }

  /* ── Meter ──────────────────────────────────────────────────────────── */
  function Meter(p) {
    var v = p.orientation !== 'horizontal';
    var length = p.length || (v ? 160 : 200);
    var level = clamp(p.level == null ? 0 : p.level, 0, 1);
    var peak = p.peak == null ? null : clamp(p.peak, 0, 1);
    var marks = p.marks || [{ at: 1, label: '0' }, { at: 0.75, label: '-6' }, { at: 0.5, label: '-12' }, { at: 0.25, label: '-24' }, { at: 0, label: '-∞' }];
    var fillStyle = v ? { height: (level * 100) + '%' } : { width: (level * 100) + '%' };
    var peakStyle = peak == null ? null : (v ? { bottom: 'calc(' + (peak * 100) + '% - 1px)' } : { left: 'calc(' + (peak * 100) + '% - 1px)' });
    return h('div', { className: cx('dt', 'dt-meter', v ? 'dt-meter--v' : 'dt-meter--h', p.className), style: p.style, role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': 1, 'aria-valuenow': level, 'aria-label': p.label },
      h('div', { className: 'dt-meter__trough', style: v ? { height: length } : { width: length } },
        h('div', { className: 'dt-meter__fill', style: fillStyle }),
        peakStyle ? h('div', { className: 'dt-meter__peak', style: peakStyle }) : null),
      p.hideScale ? null : h('div', { className: 'dt-meter__scale', style: v ? { height: length } : { width: length } },
        marks.map(function (m, i) { return h('span', { key: i, style: v ? { top: (1 - m.at) * 100 + '%' } : { left: m.at * 100 + '%' } }, m.label); })));
  }

  /* ── Scope ──────────────────────────────────────────────────────────── */
  function readVar(el, name, fallback) {
    try { var v = getComputedStyle(el).getPropertyValue(name).trim(); return v || fallback; } catch (e) { return fallback; }
  }
  function Scope(p) {
    var width = p.width || 240, height = p.height || 120;
    var ref = R.useRef(null);
    var samples = p.samples;
    R.useEffect(function () {
      var cv = ref.current; if (!cv) return;
      var dpr = window.devicePixelRatio || 1;
      cv.width = width * dpr; cv.height = height * dpr;
      var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var ground = readVar(cv, '--scope-ground', '#050a06'), grid = readVar(cv, '--scope-grid', '#0f5024'), trace = readVar(cv, '--scope-trace', '#33ff66'), trace2 = readVar(cv, '--scope-trace-2', '#ffb000');
      g.fillStyle = ground; g.fillRect(0, 0, width, height);
      var divs = p.divisions || 8;
      g.strokeStyle = grid; g.lineWidth = 1; g.beginPath();
      for (var i = 1; i < divs; i++) { var x = Math.round(i * width / divs) + 0.5; g.moveTo(x, 0); g.lineTo(x, height); }
      var hd = Math.max(2, Math.round(divs * height / width));
      for (var j = 1; j < hd; j++) { var y = Math.round(j * height / hd) + 0.5; g.moveTo(0, y); g.lineTo(width, y); }
      g.stroke();
      g.strokeStyle = grid; g.beginPath(); g.moveTo(0, height / 2 + 0.5); g.lineTo(width, height / 2 + 0.5); g.stroke();
      var draw = function (arr, color) {
        if (!arr || !arr.length) return;
        g.save(); g.shadowColor = color; g.shadowBlur = 6; g.strokeStyle = color; g.lineWidth = 1.5; g.lineJoin = 'round'; g.beginPath();
        for (var k = 0; k < arr.length; k++) {
          var px = (k / (arr.length - 1)) * width, py = height / 2 - clamp(arr[k], -1, 1) * (height / 2 - 4);
          if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.stroke(); g.restore();
      };
      var s = samples;
      if (!s) { s = []; for (var n = 0; n < 256; n++) s.push(Math.sin(n / 256 * Math.PI * 2 * 3) * 0.8); }
      draw(s, trace);
      if (p.samples2) draw(p.samples2, trace2);
    }, [samples, p.samples2, width, height, p.divisions]);
    return h('div', { className: cx('dt', 'dt-scope', p.className), style: p.style },
      (p.label || p.meta) ? h('div', { className: 'dt-scope__label' }, h('span', null, p.label || ''), h('span', null, p.meta || '')) : null,
      h('div', { className: 'dt-scope__screen', style: { width: width + 3, height: height + 3 } },
        h('canvas', { ref: ref, style: { width: width, height: height } })));
  }

  window.DraftingTable = {
    TitleBlock: TitleBlock, Panel: Panel, Dimension: Dimension, Legend: Legend,
    Knob: Knob, Fader: Fader, Toggle: Toggle, Choice: Choice, Button: Button,
    Readout: Readout, Meter: Meter, Scope: Scope,
    taper: { toNorm: toNorm, fromNorm: fromNorm }, fmt: fmt
  };
})();
