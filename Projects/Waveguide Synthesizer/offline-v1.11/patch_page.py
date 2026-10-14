"""Applies every v1.11 change onto the v1.10 page: the bow lets go.

Engine: friction with a ceiling (the hair holds only up to a force the bow
pressure sets, then slides on a falling curve), so the slip follows bow
position and a too-heavy bow crunches instead of pinning. Picture: the grip
chart's bottom panel becomes 'the pull and the ceiling', and the chart's words
learn 'crunching'. Walk: the two bow steps say what is now true.
usage: python3 patch_page.py
"""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'study-v1.10-the-overtones-run-sharp', 'index.html')
DST_DIR = os.path.join(HERE, '..', 'study-v1.11-the-bow-lets-go')
s = open(SRC, encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f'expected {count} of {old[:70]!r}, found {n}'
    s = s.replace(old, new)

# ---- titles
rep('<title>Waveguide Study · v1.10 · the overtones run sharp</title>', '<title>Waveguide Study · v1.11 · the bow lets go</title>')
rep('<h1>waveguide · study · v1.10 · the overtones run sharp</h1>', '<h1>waveguide · study · v1.11 · the bow lets go</h1>')

# ---- engine: the friction model
rep('''// stick-slip, once a cycle, is the Helmholtz motion: one sharp corner running
// round the string, which the strobe view can stand nearly still.
''', '''// stick-slip, once a cycle, is the Helmholtz motion: one sharp corner running
// round the string, which the strobe view can stand nearly still.
//
// v1.11: the hair has a ceiling. v1.4's curve said how fully the hair grips at
// a given slip, with no limit on how hard it may pull, so a heavy bow could
// hold the string for ever (v1.9's "pinned"), and the slip length barely moved
// with bow position (82% held at 0.60, where Helmholtz says 60%). Now, as in
// the hyperbolic friction law of McIntyre and Woodhouse: while the string
// rides with the bow, the hair supplies whatever pull that takes, up to a
// ceiling set by bow force. Each lap the corner brings the string back harder,
// the pull needed climbs, and the moment it passes the ceiling the hair lets
// go. Slipping, the hair drags with a force that falls as the slip grows
// (sliding friction is weaker than holding friction), and it catches again
// when the string comes back round to the bow's speed. Because the ceiling is
// finite, a heavy bow does not pin; it holds too long, lets go too late and
// irregularly, and the note crunches (Schelleng's raucous region).
// Checked headless: offline-v1.11/bow-probe.json.
''')
rep('''    this.bowForce = 0.7;       // 0..1, hair pressure: how sticky. 0.7 at 0.74 sings at every pitch tested, E2 to E5''',
    '''    this.bowForce = 0.6;       // 0..1, hair pressure: sets the hair's ceiling. v1.11: 0.6 sings once a cycle from 0.55 to 0.90 (offline-v1.11/bow-probe.json)
    this.bowSlipping = false;  // v1.11: the hair is sliding (it stays sliding until the string comes back to the bow's speed)''')
rep('''    this.tGrip = new Float32Array(this.TB); this.tLast = -1;''',
    '''    this.tGrip = new Float32Array(this.TB); this.tLast = -1;
    this.tPull = new Float32Array(this.TB);   // v1.11: how hard the hair pulls, as a share of its ceiling''')
rep('''    const BOW_SCALE = 0.25;''', '''    const BOW_SCALE = 0.4;   // v1.11: up from 0.25, so the bow is as loud as v1.10's (the hair now pulls only as hard as it must)''')
rep('''    const slope = 300 * Math.pow(0.05 / 300, this.bowForce) * 0.03 / vRef;''',
    '''    // v1.11: the hair's ceiling, in the same velocity units as the slip.
    // Force spans it logarithmically, 0.05 to 20 times vRef: below about 0.2
    // the bow skates, 0.3 to 0.5 it breaks up, 0.55 to 0.9 it sings, above
    // about 0.95 it crunches. The ceiling also rises as the bow nears an end,
    // as a player presses harder near the bridge: Schelleng's top limit falls
    // as 1/(distance to the end), and this cancels it, so one force sings all
    // along the string while his bottom limit still bites near the bridge.
    const beta = Math.max(0.04, Math.min(this.bowPos, 1 - this.bowPos));
    const ceilN = 0.05 * Math.pow(400, this.bowForce) * (0.26 / beta);   // the ceiling, in vRef units
    const V0 = 0.1, MU = 0.4;   // sliding friction falls from the ceiling toward MU x ceiling, halfway by V0 x vRef of slip''')
rep('''        const slip = vBowMax * this.bowEnv - vIn;
        const g = Math.min(1, Math.pow(Math.abs(slip * slope) + 0.75, -4));
        this.bowOff += slip * g;''',
    '''        // v1.11: A is the push the string needs to ride with the bow this
        // sample. Within the ceiling the hair supplies it all (holding).
        // Beyond it, or while already sliding, the hair drags with the sliding
        // force at the slip x that results: x = |A| - Fm·(MU + (1-MU)·v0/(v0+x)),
        // a quadratic in x, whose larger root is the slide.
        const vb = vBowMax * this.bowEnv, A = vb - vIn, aA = Math.abs(A), sA = A < 0 ? -1 : 1;
        const Fm = ceilN * vRef * this.bowEnv, v0 = V0 * vRef;
        const Ap = aA - Fm * MU, C = Fm * (1 - MU), disc = (v0 - Ap) * (v0 - Ap) + 4 * v0 * (Ap - C);
        const xs = disc >= 0 ? 0.5 * (Ap - v0 + Math.sqrt(disc)) : -1;
        let dl, slip, g;
        if ((this.bowSlipping && xs > 0) || aA > Fm) {
          dl = sA * Fm * (MU + (1 - MU) * v0 / (v0 + Math.max(0, xs)));
          slip = sA * Math.max(0, xs); g = Math.min(0.97, aA > 0 ? Math.abs(dl) / aA : 0); this.bowSlipping = true;
        } else { dl = A; slip = 0; g = 1; this.bowSlipping = false; }
        this.bowOff += dl;
        const pull = Fm > 0 ? Math.abs(dl) / Fm : 0;''')
rep('''          this.tVel[j] = vTrue / vMaxAll; this.tSlip[j] = slip / vRef; this.tGrip[j] = g;''',
    '''          this.tVel[j] = vTrue / vMaxAll; this.tSlip[j] = slip / vRef; this.tGrip[j] = g; this.tPull[j] = pull;''')
rep('''          bowV: vBowMax * this.bowEnv / vMaxAll, slopeRef: slope * vRef, env: this.bowEnv });''',
    '''          bowV: vBowMax * this.bowEnv / vMaxAll, pull: this.tPull.slice(), ceil: ceilN, mu: MU, v0: V0, env: this.bowEnv });''')
rep('''          // v1.9: lifting a bow that has pinned the string (the hair held for
          // the whole last cycle) stills it instead. The model has no point
          // where the string's pull breaks the hair free, so a pinned string is
          // dragged ever further off its rest line, and letting it go would crack.''',
    '''          // v1.9: lifting a bow that has pinned the string (the hair held for
          // the whole last cycle) stills it instead. v1.11: the hair now has a
          // ceiling, so it cannot pin for long; this stays as a net.''')
rep('''          if (m.on && !this.bowing) this.bowFresh = true;''',
    '''          if (m.on && !this.bowing) { this.bowFresh = true; this.bowSlipping = false; }''')

rep('''    // Friction: rho(slip) = min(1, (|slip x slope| + 0.75)^-4). Slope sets how
    // narrow the grip is; more force = gentler slope = grips over wider slips.
    // Force spans the slope logarithmically, 300 down to 0.05, wide enough to
    // reach all four of Schelleng's regions at the default speed and position:
    // the bow skates (silent), slips twice a cycle, sings (Helmholtz), or
    // crushes (raucous). Map: offline-v1.4/schelleng-map.png.
    // Slip is measured''', '''    // Friction (v1.11): a ceiling on the hair's pull, then a sliding curve;
    // see the note at the top of the bow and offline-v1.11/bow-probe.json.
    // Slip is measured''')

# ---- defaults: force 0.6
rep('''<span id="vBfrc">0.70</span></span>
    <input id="bfrc" type="range" min="0" max="1" value="0.7" step="0.01"></label>''',
    '''<span id="vBfrc">0.60</span></span>
    <input id="bfrc" type="range" min="0" max="1" value="0.6" step="0.01"></label>''')
rep("const bowState = { speed: 0.5, force: 0.7, position: 0.74 };", "const bowState = { speed: 0.5, force: 0.6, position: 0.74 };")
rep("  bspd: 0.5, bfrc: 0.7, bpos: 0.74, slow: 2 };", "  bspd: 0.5, bfrc: 0.6, bpos: 0.74, slow: 2 };")

# ---- chart: words, crunch detection, the pull-and-ceiling panel
rep('''//   bow force    -> the grip window on the friction curve: how far the string
//                   can stray from the bow's speed and still be held.''',
    '''//   bow force    -> v1.11: the ceiling on the friction panel: how hard the
//                   hair can pull before the string breaks free.''')
rep('''let gripAt = 1, gripCursor = 0;''', '''let gripAt = 1, gripCursor = 0;
// v1.11: how much the hold-and-let-go pattern changes from one look to the
// next. A singing bow repeats itself exactly; a crunching one never does.
let gripPrev = null, gripIrr = 0;
function gripChange(t) {
  const N = t.grip.length;
  if (gripPrev && gripPrev.length === N) {
    let d = 0; for (let i = 0; i < N; i++) if ((t.grip[i] >= 0.98) !== gripPrev[i]) d++;
    gripIrr = 0.8 * gripIrr + 0.2 * d / N;
  }
  gripPrev = Array.from(t.grip, g => g >= 0.98);
}''')
rep('''  if (sm.lets === 0 && sm.holdPct > 95) return 'pinned: the hair never lets go. too much force: the string under the bow cannot move';''',
    '''  if (gripIrr > 0.04 && sm.holdPct > 60) return 'crunching: too much force. the hair holds too long and lets go late, never the same way twice';
  if (sm.lets === 0 && sm.holdPct > 95) return 'pinned: the hair never lets go. too much force: the string under the bow cannot move';''')
rep('''  const sm = gripSummary(t);''', '''  if (t !== gripLastSeen) { gripChange(t); gripLastSeen = t; }
  const sm = gripSummary(t);''')
rep('''function gripWords(t, sm) {''', '''let gripLastSeen = null;
function gripWords(t, sm) {''')
OLD_PANEL_START = '''  // friction: how fully the hair grips (up) against how far the string's'''
OLD_PANEL_END = '''  gx.fillText('grip window (force)', L + 6, F1 + 16);'''
i0 = s.index(OLD_PANEL_START); i1 = s.index(OLD_PANEL_END) + len(OLD_PANEL_END)
assert s.count(OLD_PANEL_START) == 1 and s.count(OLD_PANEL_END) == 1
s = s[:i0] + '''  // v1.11: the pull and the ceiling. Up: how hard the hair pulls on the
  // string (log, from the lightest bow's ceiling to the heaviest's). Right:
  // how far the string's speed has strayed from the bow's (log). While the
  // hair holds there is no stray, so the dot sits on the left-hand post and
  // climbs it as the string pulls back harder; the top of the post is the
  // ceiling, set by force. When the dot reaches the top, the hair lets go and
  // the dot runs out along the sliding curve, which sags as the slip grows.
  const xs = (u) => L + 22 + (R - L - 22) * (Math.log10(u) + 2) / 5;   // slip 0.01 .. 1000
  const fy = (f) => F1 - (F1 - F0) * clamp01((Math.log10(Math.max(1e-3, f)) + 1.6) / 3.3);   // pull 0.025 .. 50
  const fw = fl('gWindow'), ceil = t.ceil;
  // the post: holding, from no pull up to the ceiling
  gx.fillStyle = 'rgba(232,184,74,' + (0.18 + 0.4 * fw) + ')';
  gx.fillRect(L, fy(ceil), 16, F1 - fy(ceil));
  gx.strokeStyle = fw > 0.05 ? '#ffb070' : 'rgba(232,184,74,0.9)'; gx.lineWidth = 2 + 2 * fw;
  gx.beginPath(); gx.moveTo(L, fy(ceil)); gx.lineTo(R, fy(ceil)); gx.setLineDash([4, 6]); gx.stroke(); gx.setLineDash([]);
  // the sliding curve: what the hair drags with at each slip
  gx.strokeStyle = '#e8e2d4'; gx.lineWidth = 2; gx.beginPath();
  for (let k = 0; k <= 120; k++) {
    const u = Math.pow(10, -2 + 5 * k / 120), f = ceil * (t.mu + (1 - t.mu) * t.v0 / (t.v0 + u));
    const xx = xs(u), yy = fy(f); if (k) gx.lineTo(xx, yy); else gx.moveTo(xx, yy);
  }
  gx.stroke();
  // the dot: this instant
  const hold = gripAt >= 0.98, pNow = (t.pull ? t.pull[ci] : 1) * ceil;
  const dX = hold ? L + 8 : xs(Math.min(1000, Math.max(0.01, Math.abs(t.slip[ci]))));
  gx.fillStyle = hold ? '#ffb070' : '#fff1c8';
  gx.beginPath(); gx.arc(dX, fy(pNow), 7, 0, 2 * Math.PI); gx.fill();
  gx.fillStyle = 'rgba(207,211,216,0.6)';
  gx.fillText('holds', L + 22, F1 - 12); gx.fillText('slides →', R - 110, F1 + 16);
  gx.fillStyle = fw > 0.05 ? '#ffb070' : 'rgba(232,184,74,0.85)';
  gx.fillText('ceiling (force)', R - 196, Math.max(F0 + 2, fy(ceil) - 12));''' + s[i1:]
rep('''  const L = 92, R = W - 12, S0 = 10, S1 = 32, P0 = 46, P1 = 222, F0 = 246, F1 = H - 30;''',
    '''  const L = 92, R = W - 12, S0 = 10, S1 = 32, P0 = 46, P1 = 168, F0 = 186, F1 = H - 30;   // v1.11: the pull panel gets room to climb''')
rep('''  gx.fillText('grip', 4, (F0 + F1) / 2);''', '''  gx.fillText('pull', 4, (F0 + F1) / 2);''')

# ---- the walk: the two bow steps say what is now true
rep('''    say: 'the bow is held on the string now. watch it slide toward the bridge, and watch the bow\\u2019s grip chart: amber where the hair holds the string, a dark gap where it lets go, once a cycle. listen: the tone gets brighter and more glassy.' },''',
    '''    say: 'the bow is held on the string now. watch it slide toward the bridge, and watch the strip on the bow\\u2019s grip chart: amber where the hair holds, a dark gap where it lets go. the gap shrinks as the bow nears the bridge, because the string slips only while the corner runs from the bow to the bridge and back. listen: brighter and more glassy.' },''')
rep('''    say: 'the bow widens, and on the chart the grip window widens with it. too light and the hair lets go twice a cycle (airy); just right, once (it sings); too heavy and it never lets go, pinning the string. listen for each.' },''',
    '''    say: 'the bow widens, and on the chart the ceiling rises: the most the hair can pull before the string breaks free. too light and it lets go twice a cycle (airy); just right, once (it sings); too heavy and it holds too long and lets go late, never the same twice (it crunches). listen for each.' },''')
rep('''    say: 'watch the dot where hair meets string: amber while the hair holds and drags the string along, a white spark the moment it lets go. it lets go exactly when the corner running round the string arrives at the bow.' },''',
    '''    say: 'watch the dot where hair meets string: amber while the hair holds and drags the string along, a white spark the moment it lets go. on the chart, the dot climbs the post as the string pulls back, and lets go when it hits the ceiling: exactly when the corner running round the string arrives at the bow.' },''')

os.makedirs(DST_DIR, exist_ok=True)
open(os.path.join(DST_DIR, 'index.html'), 'w', encoding='utf-8').write(s)
print('wrote', os.path.join(DST_DIR, 'index.html'), len(s))
