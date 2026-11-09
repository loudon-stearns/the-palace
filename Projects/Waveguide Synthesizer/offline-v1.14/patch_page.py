# Makes study v1.14 from v1.13: on a short screen the lesson docks. The card
# takes the left side (the bottom on a narrow screen), carries the one slider
# its stop is about, shows only the chart the stop names, and the camera frames
# the string in what is left. Every change goes through rep(), which fails
# loudly when its target is missing or not unique.
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent.parent
P = HERE / 'study-v1.14-the-lesson-fits' / 'index.html'
s = (HERE / 'study-v1.13-the-hair-holds-at-half' / 'index.html').read_text()   # always from v1.13, so a rerun is clean
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit(f'rep: expected {n}, found {c}: {old[:70]!r}')
    s = s.replace(old, new)

rep('<title>Waveguide Study · v1.13 · the hair holds at half</title>', '<title>Waveguide Study · v1.14 · the lesson fits</title>')
rep('<h1>waveguide · study · v1.13 · the hair holds at half</h1>', '<h1>waveguide · study · v1.14 · the lesson fits</h1>')

rep('''  #ui button#lessonBtn.on { background:#3a2a1c; border-color:#8a6a3d; }
''', '''  #ui button#lessonBtn.on { background:#3a2a1c; border-color:#8a6a3d; }
  /* v1.14: on a short screen the lesson docks. The card takes the left side (the
     bottom on a narrow screen) and carries the one slider it is about; the panel,
     and any chart the stop does not name, step aside; the string is framed in the rest */
  #lsSlot { display:none; }
  body.dock #lsSlot { display:block; }
  body.dock #ui { display:none; }
  body.dock #lesson { transform:none; font-size:11.5px; line-height:1.4; padding:8px 11px; overflow:auto; bottom:auto; }
  body.dock.dleft #lesson { left:6px; top:6px; width:var(--dockw); max-height:calc(100% - 14px); }
  body.dock.dbottom #lesson { left:6px; right:6px; bottom:6px; top:auto; width:auto; max-height:55%; }
  body.dock #lesson .line b { width:40px; }
  body.dock #lesson .nav button { padding:4px 10px; margin-top:4px; }
  #lsSlot label { display:block; margin:5px 0 3px; color:#ffb070; font-size:11px; }
  #lsSlot .row { display:flex; justify-content:space-between; font-variant-numeric:tabular-nums; }
  #lsSlot input[type=range] { width:100%; -webkit-appearance:none; appearance:none; background:transparent; height:18px; margin:2px 0 0 0; }
  #lsSlot input[type=range]::-webkit-slider-runnable-track { height:3px; background:#22222e; border:1px solid #4a4a5e; border-radius:2px; }
  #lsSlot input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:13px; height:13px; margin-top:-6px;
    border-radius:50%; background:#ffb070; border:1px solid #7a6030; box-shadow:0 0 8px #ff7a3d; }
  #lsSlot input[type=range]::-moz-range-track { height:3px; background:#22222e; border:1px solid #4a4a5e; border-radius:2px; }
  #lsSlot input[type=range]::-moz-range-thumb { width:13px; height:13px; border-radius:50%; background:#ffb070; border:1px solid #7a6030; }
  body.dock #ladder, body.dock #grip { display:none; }
  body.dock.lc-ladder #ladder, body.dock.lc-grip #grip { display:block; }
  body.dock.dbottom #ladder { top:6px; bottom:auto; }
''')

rep('''  <div class="line"><b>do</b> <span id="lsDo"></span></div>
''', '''  <div class="line"><b>do</b> <span id="lsDo"></span></div>
  <div id="lsSlot"></div>
''')

rep('''function fitLayout() { document.body.classList.toggle('short', window.innerHeight < 640); }
''', '''function fitLayout() { document.body.classList.toggle('short', window.innerHeight < 640); }
// v1.14: where the docked lesson card sits, so the camera can frame the string
// beside or above it. null when the lesson is off or the screen is tall.
let dock = null;   // { side: 'left' | 'bottom', px }
''')

rep('''  const side = W > 760 && !document.body.classList.contains('short') ? Math.min(330, $('ui').offsetWidth + 24) : 0;
  const halfW = 2.45, vfov = camera.fov * Math.PI / 180;
  camera.aspect = (W - side) / H;''', '''  const side = dock ? (dock.side === 'left' ? dock.px + 12 : 0)
    : W > 760 && !document.body.classList.contains('short') ? Math.min(330, $('ui').offsetWidth + 24) : 0;
  const bot = dock && dock.side === 'bottom' ? dock.px + 10 : 0;
  const halfW = 2.45, vfov = camera.fov * Math.PI / 180;
  camera.aspect = (W - side) / (H - bot);''')
rep('''  if (side) camera.setViewOffset(W - side, H, -side, 0, W, H); else camera.clearViewOffset();
  if (!side) camera.aspect = W / H;''', '''  if (side || bot) camera.setViewOffset(W - side, H - bot, -side, 0, W, H); else camera.clearViewOffset();
  if (!side && !bot) camera.aspect = W / H;''')

rep('''  fitLayout(); fitCamera();
  renderer.setSize''', '''  fitLayout(); if (lesson) lessonDock(); else fitCamera();
  renderer.setSize''')

# the lesson: dock on enter, undock on leave
rep('''  const st = LESSON[lesson.i];
  if (view.hold) toggleHold();''', '''  const st = LESSON[lesson.i];
  lessonSlot(null);
  if (view.hold) toggleHold();''')
rep('''  document.body.classList.toggle('lbow', !!st.bow);
  setBow(!!st.bow);''', '''  document.body.classList.toggle('lbow', !!st.bow);
  document.body.classList.toggle('lc-ladder', st.name === 'loss' || st.name === 'stiffness');
  document.body.classList.toggle('lc-grip', !!st.bow);
  lessonDock();
  setBow(!!st.bow);''')
rep('''  lesson = null; setBow(false);''', '''  lessonSlot(null);
  lesson = null; setBow(false);''')
rep('''  document.body.classList.remove('lesson', 'lbow'); $('lesson').style.display = 'none';''',
    '''  document.body.classList.remove('lesson', 'lbow', 'lc-ladder', 'lc-grip'); $('lesson').style.display = 'none';
  lessonDock();''')
rep('''function lessonStart() {''', '''// v1.14: the docked card. On a short screen the card would sit on the string, so
// it takes a side: the left on a screen 700 pixels wide or more, the bottom below
// that. The stop's slider is lent to the card (the same element, so a drag there
// is a drag on the slider) and given back when the stop changes or the lesson ends.
let slotted = null;   // { label, next }
function lessonSlot(id) {
  if (slotted) { $('sliders').insertBefore(slotted.label, slotted.next); slotted = null; }
  if (!id || !document.body.classList.contains('dock')) return;
  const lab = $(id).closest('label'); slotted = { label: lab, next: lab.nextSibling };
  $('lsSlot').appendChild(lab);
}
function lessonDock() {
  const W = innerWidth, H = innerHeight, on = !!lesson && document.body.classList.contains('short');
  const left = on && W >= 700, b = document.body;
  b.classList.toggle('dock', on); b.classList.toggle('dleft', left); b.classList.toggle('dbottom', on && !left);
  if (left) b.style.setProperty('--dockw', Math.min(340, Math.round(W * 0.4)) + 'px');
  lessonSlot(on ? LESSON[lesson.i].id : null);
  dock = !on ? null : left ? { side: 'left', px: $('lesson').offsetWidth } : { side: 'bottom', px: $('lesson').offsetHeight };
  fitCamera();
}
function lessonStart() {''')

P.write_text(s)
print('patched', P)

# second pass: the chart a stop names gets its own strip at the top right, and
# the string is framed below it (or beside it, when below is too short)
s = P.read_text()
rep('''  body.dock.dbottom #ladder { top:6px; bottom:auto; }''', '''  body.dock.lesson #ladder { top:6px; bottom:auto; right:6px; }   /* .lesson: outranks the short screen's bottom-right ladder below */
  body.dock.lesson #grip { top:6px; right:6px; }''')
rep('''let dock = null;   // { side: 'left' | 'bottom', px }''', '''let dock = null;   // the space the lesson takes from each edge: { l, r, t, b } in pixels''')
rep('''  const side = dock ? (dock.side === 'left' ? dock.px + 12 : 0)
    : W > 760 && !document.body.classList.contains('short') ? Math.min(330, $('ui').offsetWidth + 24) : 0;
  const bot = dock && dock.side === 'bottom' ? dock.px + 10 : 0;
  const halfW = 2.45, vfov = camera.fov * Math.PI / 180;
  camera.aspect = (W - side) / (H - bot);''', '''  const side = dock ? dock.l
    : W > 760 && !document.body.classList.contains('short') ? Math.min(330, $('ui').offsetWidth + 24) : 0;
  const bot = dock ? dock.b : 0, top = dock ? dock.t : 0, right = dock ? dock.r : 0;
  const halfW = 2.45, vfov = camera.fov * Math.PI / 180;
  camera.aspect = (W - side - right) / (H - bot - top);''')
rep('''  if (side || bot) camera.setViewOffset(W - side, H - bot, -side, 0, W, H); else camera.clearViewOffset();
  if (!side && !bot) camera.aspect = W / H;''', '''  if (side || bot || top || right) camera.setViewOffset(W - side - right, H - bot - top, -side, -top, W, H); else camera.clearViewOffset();
  if (!side && !bot && !top && !right) camera.aspect = W / H;''')
rep('''  dock = !on ? null : left ? { side: 'left', px: $('lesson').offsetWidth } : { side: 'bottom', px: $('lesson').offsetHeight };
  fitCamera();''', '''  dock = null;
  if (on) {
    dock = left ? { l: $('lesson').offsetWidth + 12, r: 0, t: 0, b: 0 } : { l: 0, r: 0, t: 0, b: $('lesson').offsetHeight + 10 };
    const st = LESSON[lesson.i], chart = st.bow ? $('grip') : b.classList.contains('lc-ladder') ? $('ladder') : null;
    if (chart) {   // below the chart if a string fits there, else beside it
      const cw = chart.offsetWidth + 12, ch = chart.offsetHeight + 12;
      if (H - dock.b - ch >= 150) dock.t = ch; else dock.r = cw;
    }
  }
  fitCamera();''')
P.write_text(s)
print('second pass done')
