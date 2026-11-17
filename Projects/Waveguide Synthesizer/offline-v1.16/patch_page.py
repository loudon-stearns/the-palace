# Study v1.16 "on a phone": v1.15 plus what a phone needs, and nothing else.
#   - portrait phones (narrower than 600 px): the panel becomes a bottom bar, one chart sits
#     on top (the ladder, or the grip while you bow), and the string is framed between them;
#   - a landscape phone frames the string beside the panel, so the nut is not under it;
#   - finger-sized buttons and slider thumbs on a touch screen;
#   - the bow (and damp) lifts only when the finger that pressed it lifts, so a second finger
#     on a slider no longer drops the bow;
#   - the canvas owns its touches (no page pan or zoom fighting the orbit), held buttons
#     raise no callout, and the page cannot rubber-band;
#   - an iPhone's silent switch no longer mutes it (audioSession = playback, where offered);
#   - pixel ratio capped at 2, so a 3x phone draws 4/9 of the pixels.
# Every change goes through rep(), which fails loudly if its target is not found exactly once.
import pathlib, sys
HERE = pathlib.Path(__file__).parent
SRC = HERE.parent / 'study-v1.15-even-loss' / 'index.html'
DST = HERE.parent / 'study-v1.16-on-a-phone' / 'index.html'
s = SRC.read_text()

def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n:
        sys.exit(f'rep: expected {n}, found {c}: {old[:70]!r}')
    s = s.replace(old, new)

rep('<title>Waveguide Study · v1.15 · even loss</title>', '<title>Waveguide Study · v1.16 · on a phone</title>')
rep('<h1>waveguide · study · v1.15 · even loss</h1>', '<h1>waveguide · study · v1.16 · on a phone</h1>')

# ---- CSS: appended after every earlier rule, so it wins the ties ----
rep('''  body.short #more { display:inline-block; }
</style>''', '''  body.short #more { display:inline-block; }
  /* v1.16: on a phone. The page never scrolls or bounces, and the canvas owns its touches */
  html, body { overscroll-behavior:none; }
  canvas { touch-action:none; }
  #bow, #damp { touch-action:none; -webkit-touch-callout:none; -webkit-user-select:none; user-select:none; }
  /* a finger is wider than a mouse: buttons at least 44 px tall, thumbs you can land on */
  @media (pointer:coarse) {
    #ui button, #lesson .nav button { min-height:44px; padding:8px 12px; touch-action:manipulation; }
    #ui input[type=range], #lsSlot input[type=range] { height:34px; }
    #ui input[type=range]::-webkit-slider-thumb, #lsSlot input[type=range]::-webkit-slider-thumb { width:24px; height:24px; margin-top:-11px; }
    #ui input[type=range]::-moz-range-thumb, #lsSlot input[type=range]::-moz-range-thumb { width:24px; height:24px; }
  }
  /* a portrait phone: the panel is a bar along the bottom, one chart along the top,
     and the string is framed in the space between (fitCamera reads both) */
  body.phone #ui { top:auto; bottom:0; left:0; right:0; max-width:none; max-height:50%; border-radius:6px 6px 0 0;
    padding:6px 8px calc(6px + env(safe-area-inset-bottom)); border-width:1px 0 0 0; }
  body.phone #ui h1 { font-size:11px; opacity:0.6; }
  body.phone #ui button { margin:4px 4px 0 0; padding:6px 9px; }
  body.phone #meter { margin-top:5px; } body.phone #status { margin-top:4px; }
  body.phone #ladder, body.phone #grip { left:6px; right:6px; top:calc(6px + env(safe-area-inset-top)); bottom:auto; width:auto; }
  body.phone #ladder canvas, body.phone #grip canvas { width:100% !important; height:104px !important; }
  /* any short screen shows one chart at a time: the ladder, or the grip while you bow */
  body.short:not(.dock) #grip { display:none; }
  body.short.bowon:not(.dock) #grip { display:block; }
  body.short.bowon:not(.dock) #ladder { display:none; }
  body.phone #walkCap { left:6px; right:6px; transform:none; max-width:none; font-size:12px; bottom:calc(var(--uih, 200px) + 8px); }
  body.phone #wordmark { display:none; }
</style>''')

rep('''<div class="why">your browser keeps a page silent until you click it. one click starts''',
    '''<div class="why">your browser keeps a page silent until you click it (or tap it). one click starts''')

# ---- layout: a phone is a narrow screen; it is also short, so it keeps the short screen's
# folded sliders and its docked lesson ----
rep('''function fitLayout() { document.body.classList.toggle('short', window.innerHeight < 640); }''',
'''// v1.16: a phone held upright is narrow before it is short. It folds the sliders
// like a short screen, docks the lesson at the bottom, and lays the panel along the bottom.
const PHONE_W = 600;
function fitLayout() {
  const phone = window.innerWidth < PHONE_W;
  document.body.classList.toggle('phone', phone);
  document.body.classList.toggle('short', window.innerHeight < 640 || phone);
}''')

rep('''  const side = dock ? dock.l
    : W > 760 && !document.body.classList.contains('short') ? Math.min(330, $('ui').offsetWidth + 24) : 0;
  const bot = dock ? dock.b : 0, top = dock ? dock.t : 0, right = dock ? dock.r : 0;''',
'''  const B = document.body, short = B.classList.contains('short'), phone = B.classList.contains('phone');
  // v1.16: a landscape phone (short and wide) frames the string beside the panel too, so the nut is never under it
  const side = dock ? dock.l
    : W > 760 && !short ? Math.min(330, $('ui').offsetWidth + 24)
    : short && !phone && W >= 700 ? $('ui').offsetWidth + 12 : 0;
  let bot = dock ? dock.b : 0, top = dock ? dock.t : 0, right = dock ? dock.r : 0;
  if (phone && !dock) {   // v1.16: between the chart on top and the bar along the bottom
    const ui = $('ui').getBoundingClientRect(); bot = Math.max(0, H - ui.top) + 6;
    B.style.setProperty('--uih', Math.round(H - ui.top) + 'px');
    const chart = B.classList.contains('bowon') ? $('grip') : $('ladder');
    const cr = chart.getBoundingClientRect(); top = cr.height ? cr.bottom + 6 : 0;
  } else if (short && !phone && W >= 700 && !dock) {   // landscape phone: above the ladder, or beside the grip
    if (B.classList.contains('bowon')) { const gr = $('grip').getBoundingClientRect(); if (gr.width) right = W - gr.left + 6; }
    else { const lr = $('ladder').getBoundingClientRect(); if (lr.height) bot = H - lr.top + 6; }
  }''')

# the camera's height above the string was set for a wide screen; on a phone the frame does the work
rep('''if (document.body.classList.contains('short')) controls.target.y = 0.45;''',
    '''if (document.body.classList.contains('short') && !document.body.classList.contains('phone')) controls.target.y = 0.45;''')

# a 3x phone screen drawing every pixel is the most expensive thing on the page
rep('''renderer.setPixelRatio(window.devicePixelRatio);''',
    '''renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));   // v1.16: a 3x phone draws 4/9 of the pixels''')
rep('''document.body.appendChild(renderer.domElement);''',
    '''document.body.appendChild(renderer.domElement);
renderer.domElement.style.touchAction = 'none';   // v1.16: the orbit owns the finger, not the page''')

# the sliders opening or closing changes the bar's height, so the frame follows
rep('''  $('more').textContent = document.body.classList.contains('open') ? 'sliders ▴' : 'sliders ▾';
});''', '''  $('more').textContent = document.body.classList.contains('open') ? 'sliders ▴' : 'sliders ▾';
  if (!lesson) fitCamera();   // v1.16: the phone's bar changed height
});''')

# ---- the bow and damp: held by one finger, lifted by that finger only ----
rep('''  bowing = on; sendBow({ on }); $('bow').classList.toggle('on', on);''',
    '''  bowing = on; sendBow({ on }); $('bow').classList.toggle('on', on);
  if (document.body.classList.contains('short')) {   // v1.16: the grip chart takes the ladder's place while you bow
    document.body.classList.toggle('bowon', on); if (!lesson) fitCamera();
  }''')
rep('''$('damp').addEventListener('pointerdown', () => setDamp(true));
$('bow').addEventListener('pointerdown', () => setBow(true));
window.addEventListener('pointerup', () => { setDamp(false); if (!lessonHoldsBow()) setBow(false); });''',
'''// v1.16: each hold belongs to the finger that pressed it. Before, any finger (or the
// mouse) lifting anywhere lifted the bow, so on a phone you could not bow with one
// finger and move a slider with another.
let bowPid = null, dampPid = null;
$('damp').addEventListener('pointerdown', (e) => { dampPid = e.pointerId; setDamp(true); });
$('bow').addEventListener('pointerdown', (e) => { bowPid = e.pointerId; setBow(true); });
for (const id of ['bow', 'damp']) $(id).addEventListener('contextmenu', (e) => e.preventDefault());   // a long press is a hold, not a menu
function liftPointer(e) {
  if (e.pointerId === dampPid) { dampPid = null; setDamp(false); }
  if (e.pointerId === bowPid) { bowPid = null; if (!lessonHoldsBow()) setBow(false); }
}
window.addEventListener('pointerup', liftPointer);
window.addEventListener('pointercancel', liftPointer);''')

# ---- an iPhone's ring/silent switch mutes ordinary web audio; a playback session does not ----
rep('''  audioCtx = new (window.AudioContext || window.webkitAudioContext)();''',
    '''  if (navigator.audioSession) { try { navigator.audioSession.type = 'playback'; } catch (e) {} }   // v1.16: not muted by an iPhone's silent switch
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();''')

# ---- words for a finger on a touch screen ----
rep('''// One click: start the sound and pluck, so the first thing you hear is the string.''',
'''// v1.16: on a touch screen the page speaks of fingers, not keys and clicks
if (matchMedia('(pointer:coarse)').matches) {
  $('bow').textContent = 'bow (hold)'; $('damp').textContent = 'damp (hold)';
  $('status').textContent = 'tap the string to pluck it there · drag to turn the view · pinch to zoom';
  $('gripState').textContent = 'hold the bow button, and watch the hair catch and let go';
}
// One click: start the sound and pluck, so the first thing you hear is the string.''')
rep('''  if (!t) { $('gripState').textContent = 'hold B to bow, and watch the hair catch and let go';''',
    '''  if (!t) { $('gripState').textContent = matchMedia('(pointer:coarse)').matches ? 'hold the bow button, and watch the hair catch and let go' : 'hold B to bow, and watch the hair catch and let go';''')

DST.parent.mkdir(exist_ok=True)
DST.write_text(s)
print('wrote', DST, len(s))
