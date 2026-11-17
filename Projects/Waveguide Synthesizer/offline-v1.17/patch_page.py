# Study v1.17 "sideways": v1.16 with the phone on its side made to work, and nothing else.
#   - a touch screen held sideways (short, wide, coarse pointer) gets the class 'flat':
#     the panel is a compact two-column grid of buttons that fits the height without
#     scrolling, the grip chart is narrower, and the string gets the width back;
#   - on a touch screen the buttons drop their keyboard hints (H, W, L), including the
#     words the walk and the lesson write back when they start and stop.
# The sound engine is v1.15's, untouched. Every change goes through rep(), which fails
# loudly if its target is not found exactly once.
import pathlib, sys
HERE = pathlib.Path(__file__).parent
SRC = HERE.parent / 'study-v1.16-on-a-phone' / 'index.html'
DST = HERE.parent / 'study-v1.17-sideways' / 'index.html'
s = SRC.read_text()

def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n:
        sys.exit(f'rep: expected {n}, found {c}: {old[:70]!r}')
    s = s.replace(old, new)

rep('<title>Waveguide Study · v1.16 · on a phone</title>', '<title>Waveguide Study · v1.17 · sideways</title>')
rep('<h1>waveguide · study · v1.16 · on a phone</h1>', '<h1>waveguide · study · v1.17 · sideways</h1>')

# ---- CSS: appended after every earlier rule, so it wins the ties ----
rep('''  body.phone #wordmark { display:none; }
</style>''', '''  body.phone #wordmark { display:none; }
  /* v1.17: a phone on its side. The panel is a narrow two-column grid that fits the
     height, so nothing runs off the bottom and the string gets the width back */
  body.flat #ui { width:224px; max-width:224px; padding:5px 7px; line-height:1.3; }
  body.flat #ui h1 { font-size:10px; opacity:0.55; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  body.flat #ui > br, body.flat #status { display:none; }
  /* two to a row: the space between two inline buttons is the gap, so each takes half less a little */
  body.flat #ui > button { width:calc(50% - 5px); margin:4px 0 0 0; padding:4px 3px; font-size:11px; line-height:1.15; vertical-align:top; }
  body.flat #meter { margin-top:6px; } body.flat #meterText { font-size:10px; }
  body.flat #grip { width:196px; font-size:9px; }
  body.flat #grip .st { min-height:0; }
  body.flat #grip canvas { width:196px !important; height:104px !important; }
  /* both charts take a column on the right, so the string keeps the whole height */
  body.flat:not(.dock) #ladder { width:180px; top:6px; bottom:auto; right:6px; font-size:9px; }
  body.flat #ladder canvas { width:180px !important; height:84px !important; }
</style>''')

# ---- layout: name the sideways phone ----
rep('''  document.body.classList.toggle('short', window.innerHeight < 640 || phone);
}''', '''  document.body.classList.toggle('short', window.innerHeight < 640 || phone);
  // v1.17: a touch screen on its side, short and wide
  document.body.classList.toggle('flat', !phone && TOUCH && window.innerHeight < 520 && window.innerWidth >= 640);
}''')
rep('''const PHONE_W = 600;''', '''const PHONE_W = 600;
const TOUCH = matchMedia('(pointer:coarse)').matches;''')
rep('''    : short && !phone && W >= 700 ? $('ui').offsetWidth + 12 : 0;''',
    '''    : short && !phone && (W >= 700 || B.classList.contains('flat')) ? $('ui').offsetWidth + 12 : 0;''')
rep('''  } else if (short && !phone && W >= 700 && !dock) {''',
    '''  } else if (B.classList.contains('flat') && !dock) {   // v1.17: a phone on its side: the chart is a column on the right
    const chart = B.classList.contains('bowon') ? $('grip') : $('ladder'); const cr = chart.getBoundingClientRect();
    if (cr.width) right = W - cr.left + 6;
  } else if (short && !phone && W >= 700 && !dock) {''')

# ---- key hints: a finger has no H key ----
rep('''if (matchMedia('(pointer:coarse)').matches) {
  $('bow').textContent = 'bow (hold)'; $('damp').textContent = 'damp (hold)';''',
'''if (matchMedia('(pointer:coarse)').matches) {
  $('bow').textContent = 'bow (hold)'; $('damp').textContent = 'damp (hold)';
  for (const id of ['hold', 'walk', 'lessonBtn']) $(id).textContent = keyHint($(id).textContent);   // v1.17''')
rep('''// v1.16: on a touch screen the page speaks of fingers, not keys and clicks''',
'''// v1.17: a button's key hint, '(H)', is for a keyboard; a touch screen drops it
const keyHint = (t) => matchMedia('(pointer:coarse)').matches ? t.replace(/ \\([A-Z]\\)$/, '') : t;
// v1.16: on a touch screen the page speaks of fingers, not keys and clicks''')
rep("$('walk').textContent = 'stop the walk (W)';", "$('walk').textContent = keyHint('stop the walk (W)');")
rep("$('walk').textContent = 'walk the links (W)';", "$('walk').textContent = keyHint('walk the links (W)');")
rep("$('lessonBtn').textContent = 'leave the lesson (L)';", "$('lessonBtn').textContent = keyHint('leave the lesson (L)');")
rep("$('lessonBtn').textContent = 'the lesson (L)';", "$('lessonBtn').textContent = keyHint('the lesson (L)');")

# the camera's nearest distance (4.0) keeps the clock and the soundboard in frame on a tall
# screen; on a phone on its side the frame is short already, so it may come a fifth closer
# (not in the lesson, whose docked card already leaves the string the height it needs)
rep('''  const d = Math.max(4.0, halfW / Math.tan(hfov / 2));''',
    '''  const d = Math.max(B.classList.contains('flat') && !dock ? 3.25 : 4.0, halfW / Math.tan(hfov / 2));''')

DST.write_text(s)
print('wrote', DST, len(s))
