"""Applies every v1.13 change onto the v1.12 page: the pull panel tells the truth.

Since v1.11 the rough note said the pull dot should 'climb toward the limit
line' while the hair holds. The engine (offline-v1.13/pull_probe.mjs) says a
singing bow does not climb: the hair holds at a steady ~43% of its grip for
the whole hold, and the corner, arriving, kicks the pull over the ceiling in
one sample. The log axis hid even that (0.43 sat a hair under the line). So:
under the ceiling the panel is now linear in share of the grip (bottom = no
pull, the dashed line = all of it), while the line's own height still moves
with force. A half-grip tick, a trace of the last cycle's pull on the post,
and the chart's words say what it means.
usage: python3 patch_page.py
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'study-v1.12-the-lesson', 'index.html')
DST_DIR = os.path.join(HERE, '..', 'study-v1.13-the-hair-holds-at-half')
s = open(SRC, encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f'expected {count} of {old[:70]!r}, found {n}'
    s = s.replace(old, new)

rep('<title>Waveguide Study · v1.12 · the lesson</title>', '<title>Waveguide Study · v1.13 · the hair holds at half</title>')
rep('<h1>waveguide · study · v1.12 · the lesson</h1>', '<h1>waveguide · study · v1.13 · the hair holds at half</h1>')

# the words: a singing bow names how hard it holds
rep('''  if (sm.lets === 1) return 'singing: the hair holds ' + sm.holdPct + '% of each cycle, lets go once';''',
    '''  if (sm.lets === 1) return 'singing: the hair holds ' + sm.holdPct + '% of each cycle at ' + sm.pullPct + '% of its grip; the corner arriving kicks it over the line, once';''')
rep('''  const N = t.grip.length; let hold = 0, lets = 0;
  for (let i = 0; i < N; i++) { const h = t.grip[i] >= 0.98; if (h) hold++; if (!h && t.grip[(i + N - 1) % N] >= 0.98) lets++; }
  return { holdPct: Math.round(100 * hold / N), lets };''',
    '''  const N = t.grip.length; let hold = 0, lets = 0; const ps = [];
  for (let i = 0; i < N; i++) { const h = t.grip[i] >= 0.98; if (h) { hold++; if (t.pull) ps.push(t.pull[i]); } if (!h && t.grip[(i + N - 1) % N] >= 0.98) lets++; }
  ps.sort((a, b) => a - b);   // v1.13: the typical pull while holding, as a share of the ceiling
  return { holdPct: Math.round(100 * hold / N), lets, pullPct: ps.length ? Math.round(100 * ps[ps.length >> 1]) : 0 };''')

# the panel
rep('''  // v1.11: the pull and the ceiling. Up: how hard the hair pulls on the
  // string (log, from the lightest bow's ceiling to the heaviest's). Right:''',
    '''  // v1.13: under the ceiling the panel is linear in share of the grip (the
  // floor is no pull, the dashed line all of it), so a hold at half sits
  // halfway up the post; the line's own height still moves with force (log,
  // from the lightest bow's ceiling to the heaviest's).
  // v1.11: the pull and the ceiling. Up: how hard the hair pulls on the
  // string. Right:''')
rep('''  const fw = fl('gWindow'), ceil = t.ceil;''',
    '''  const fw = fl('gWindow'), ceil = t.ceil;
  // the line keeps the top 45% of the panel to travel in, so the post below it is never too short to read
  const yC = F1 - (F1 - F0) * (0.55 + 0.45 * (F1 - fy(ceil)) / (F1 - F0)), sy = (share) => F1 - (F1 - yC) * clamp01(share);   // v1.13: share of the grip -> height''')
rep('''  gx.beginPath(); gx.moveTo(L, fy(ceil)); gx.lineTo(R, fy(ceil)); gx.setLineDash([4, 6]); gx.stroke(); gx.setLineDash([]);''',
    '''  gx.beginPath(); gx.moveTo(L, yC); gx.lineTo(R, yC); gx.setLineDash([4, 6]); gx.stroke(); gx.setLineDash([]);''')
rep('''  gx.fillText('ceiling (force)', R - 196, Math.max(F0 + 2, fy(ceil) - 12));''',
    '''  gx.fillText('ceiling (force)', R - 196, Math.max(F0 + 2, yC - 12));''')
rep('''  gx.fillText('holds', L + 22, F1 - 12);''', '''  gx.fillText('holds', L + 22, F1 + 16);''')
rep('''    const xx = xs(u), yy = fy(f); if (k) gx.lineTo(xx, yy); else gx.moveTo(xx, yy);''',
    '''    const xx = xs(u), yy = sy(f / ceil); if (k) gx.lineTo(xx, yy); else gx.moveTo(xx, yy);''')
rep('''  // the dot: this instant
  const hold = gripAt >= 0.98, pNow = (t.pull ? t.pull[ci] : 1) * ceil;
  const dX = hold ? L + 8 : xs(Math.min(1000, Math.max(0.01, Math.abs(t.slip[ci]))));
  gx.fillStyle = hold ? '#ffb070' : '#fff1c8';
  gx.beginPath(); gx.arc(dX, fy(pNow), 7, 0, 2 * Math.PI); gx.fill();''',
    '''  // v1.13: the half-grip tick, and the last cycle's holding pulls as
  // marks on the post: a singing bow leaves one tight band at about half
  gx.strokeStyle = 'rgba(207,211,216,0.35)'; gx.lineWidth = 1; gx.setLineDash([2, 5]);
  gx.beginPath(); gx.moveTo(L, sy(0.5)); gx.lineTo(L + 52, sy(0.5)); gx.stroke(); gx.setLineDash([]);
  gx.fillStyle = 'rgba(207,211,216,0.55)'; gx.fillText('half', L + 58, sy(0.5));
  if (t.pull) { gx.fillStyle = 'rgba(255,176,112,0.35)';
    for (let i = 0; i < N; i++) if (t.grip[i] >= 0.98) gx.fillRect(L + 1, sy(t.pull[i]) - 1, 14, 2); }
  // the dot: this instant
  const hold = gripAt >= 0.98, pNow = t.pull ? t.pull[ci] : 1;
  const dX = hold ? L + 8 : xs(Math.min(1000, Math.max(0.01, Math.abs(t.slip[ci]))));
  gx.fillStyle = hold ? '#ffb070' : '#fff1c8';
  gx.beginPath(); gx.arc(dX, sy(pNow), 7, 0, 2 * Math.PI); gx.fill();''')
rep('''  gx.fillRect(L, fy(ceil), 16, F1 - fy(ceil));''', '''  gx.fillRect(L, yC, 16, F1 - yC);''')

os.makedirs(DST_DIR, exist_ok=True)
open(os.path.join(DST_DIR, 'index.html'), 'w', encoding='utf-8').write(s)
print('wrote', DST_DIR)
