# Study v1.15 from v1.14: even loss. Every change goes through rep(), which
# fails loudly if its target is missing or not unique (tuning item 1).
import pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
src = (HERE.parent / 'study-v1.14-the-lesson-fits' / 'index.html').read_text()
def rep(old, new, count=1):
    global src
    n = src.count(old)
    if n != count: sys.exit(f'rep: expected {count}, found {n}: {old[:70]!r}')
    src = src.replace(old, new)

rep('<title>Waveguide Study · v1.14 · the lesson fits</title>', '<title>Waveguide Study · v1.15 · even loss</title>')
rep('<h1>waveguide · study · v1.14 · the lesson fits</h1>', '<h1>waveguide · study · v1.15 · even loss</h1>')

# The loss, made even: per bounce it is scaled so it is the same per second.
rep('''    this.a = (1 - this.bright) * 0.9;           // loop lowpass coefficient
''', '''    // v1.15: even loss. Every loss in the loop is taken once per bounce, and a
    // high note bounces more often, so at v1.14 a C6 rang a tenth as long as a
    // G3 (offline-v1.15/tail-v1.14.json). Above G3 each bounce now takes the
    // loss to the power G3/f, which makes it the same per second: the end
    // sliders and brightness mean one ring time at every pitch, the way
    // stiffness already meant one stretch. Below G3 nothing changes.
    this.lossE = Math.min(1, LOSS_REF / this.freq);
    this.lossB = Math.pow(this.bridge, this.lossE);
    this.lossN = Math.pow(this.nut, this.lossE);
    this.a = (1 - this.bright) * 0.9 * this.lossE;   // loop lowpass coefficient, thinned the same way
''')
rep('''const MIN_LEN = 8;
''', '''const MIN_LEN = 8;
// v1.15: the pitch at which the loss sliders are read as they always were.
const LOSS_REF = 196;
''')
rep('''      + WG.tauEnd(this.bridge, this.dcA, w) + WG.tauEnd(this.nut, this.dcA, w);
    const d = this.designDispersion''', '''      + WG.tauEnd(this.lossB, this.dcA, w) + WG.tauEnd(this.lossN, this.dcA, w);
    const d = this.designDispersion''')
rep('''    return 2 * f.len + 2 * WG.tauLP(this.a, w) + WG.tauEnd(this.bridge, this.dcA, w)
      + WG.tauEnd(this.nut, this.dcA, w)''', '''    return 2 * f.len + 2 * WG.tauLP(this.a, w) + WG.tauEnd(this.lossB, this.dcA, w)
      + WG.tauEnd(this.lossN, this.dcA, w)''')
rep('const feed = 0.0871 * Math.sqrt(Math.max(0, 1 - this.bridge * this.bridge));',
    'const feed = 0.0871 * Math.sqrt(Math.max(0, 1 - this.lossB * this.lossB));   // v1.15: what this bounce really lets through')
rep('-(this.lpBridge * this.bridge + (1 - this.bridge) * this.dcB)', '-(this.lpBridge * this.lossB + (1 - this.lossB) * this.dcB)')
rep('-(this.lpNut * this.nut + (1 - this.nut) * this.dcN)', '-(this.lpNut * this.lossN + (1 - this.lossN) * this.dcN)')

# The lesson's pitch stop now says what changed.
rep("hear: 'a shorter loop comes round more often, so the note is higher. the loop\\u2019s length is the pitch.',",
    "hear: 'a shorter loop comes round more often, so the note is higher. the loop\\u2019s length is the pitch, and only the pitch: each note rings about as long as the last.',")

# The end labels: what this bounce really keeps, and the G3 figure the slider reads.
rep("""  const keep = (g * 100);
  setLabel(label, name + '\\nkeeps ' + (keep >= 99.95 ? '100' : keep.toFixed(1)) + '% each bounce');""",
"""  // v1.15: a higher note bounces more often, so each bounce keeps more; the
  // slider still reads the G3 figure, and the ring time is the same.
  const ex = Math.min(1, 196 / params.freq), pc = (k) => k >= 99.95 ? '100' : k.toFixed(1);
  const keep = 100 * Math.pow(g, ex);
  setLabel(label, name + '\\nkeeps ' + pc(keep) + '% each bounce' + (ex < 1 ? '\\n(' + pc(g * 100) + '% at G3, the same ring time)' : ''));""")

(HERE.parent / 'study-v1.15-even-loss' / 'index.html').write_text(src)
print('wrote study-v1.15-even-loss/index.html')
