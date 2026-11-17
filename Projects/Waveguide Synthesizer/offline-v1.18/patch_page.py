# Study v1.18 "a slow phone": v1.17 with the per-frame picture work cut, and nothing else.
# Measured on v1.17 at 8x CPU slowdown (offline-v1.17/split_probe.mjs), the scene
# update took ~6 ms a frame, and two pieces were most of it:
#   - the soundboard (~3.2 ms): every frame it worked out 12 modes x 640 points,
#     two sines and a cosine each, ~23,000 trig calls. Each mode's shape is one
#     sine along the board times one across it, and neither ever changes, so both
#     are tabled once; a frame now costs 12 cosines and plain multiply-adds. The
#     board is the same surface to float32 rounding (6e-8, checked by check_board.mjs).
#   - the bow's grip chart (~1.9 ms) even with nobody bowing: it repainted its idle
#     words and cleared a screen-sized overlay canvas (3x pixels on a phone) every
#     frame. Now the idle chart is painted once and left, the overlay is cleared
#     only when it has a thread on it, and the overlay draws at 2x at most, as the
#     3D view has since v1.16.
# The sound engine is v1.15's, untouched. Every change goes through rep(), which
# fails loudly if its target is not found exactly once.
import pathlib, sys
HERE = pathlib.Path(__file__).parent
SRC = HERE.parent / 'study-v1.17-sideways' / 'index.html'
DST = HERE.parent / 'study-v1.18-a-slow-phone' / 'index.html'
s = SRC.read_text()

def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n:
        sys.exit(f'rep: expected {n}, found {c}: {old[:70]!r}')
    s = s.replace(old, new)

rep('<title>Waveguide Study · v1.17 · sideways</title>', '<title>Waveguide Study · v1.18 · a slow phone</title>')
rep('<h1>waveguide · study · v1.17 · sideways</h1>', '<h1>waveguide · study · v1.18 · a slow phone</h1>')

# ---- the soundboard: the mode shapes, tabled once ----
rep('''const BODY_SHAPES = [[0,0,1,1],[0,0,2,1],[0,0,1,2],[0,0,3,1],[0,0,2,2],[0,0,3,2],[0,0,1,3],[0,0,4,1],[0,0,4,2],[0,0,2,3],[0,0,5,1],[0,0,3,3]];
''', '''const BODY_SHAPES = [[0,0,1,1],[0,0,2,1],[0,0,1,2],[0,0,3,1],[0,0,2,2],[0,0,3,2],[0,0,1,3],[0,0,4,1],[0,0,4,2],[0,0,2,3],[0,0,5,1],[0,0,3,3]];
// v1.18: each mode's shape is one sine along the board times one across it, and
// neither ever changes, so both are worked out once, not every frame
const BSX = BODY_SHAPES.map(([, , mx]) => Float64Array.from({ length: BNX }, (_, i) => Math.sin(mx * Math.PI * i / (BNX - 1))));
const BSZ = BODY_SHAPES.map(([, , , nz]) => Float64Array.from({ length: BNZ }, (_, k) => Math.sin(nz * Math.PI * k / (BNZ - 1))));
const bAmp = new Float64Array(12), bRow = new Float64Array(12);
''')
rep('''  for (let i = 0; i < BNX; i++) for (let k = 0; k < BNZ; k++) {
    const u = i / (BNX - 1), v = k / (BNZ - 1), o = (i * BNZ + k) * 3;
    let y = 0;
    if (B) for (let m = 0; m < 12; m++) {
      const [, , mx, nz] = BODY_SHAPES[m];
      y += B.env[m] * Math.sin(mx * Math.PI * u) * Math.sin(nz * Math.PI * v) * Math.cos(modePhase[m]);
    }
    boardPos[o] = xL + u * W;''', '''  if (B) for (let m = 0; m < 12; m++) bAmp[m] = B.env[m] * Math.cos(modePhase[m]);
  for (let i = 0; i < BNX; i++) {
    const u = i / (BNX - 1);
    if (B) for (let m = 0; m < 12; m++) bRow[m] = bAmp[m] * BSX[m][i];
    for (let k = 0; k < BNZ; k++) {
    const v = k / (BNZ - 1), o = (i * BNZ + k) * 3;
    let y = 0;
    if (B) for (let m = 0; m < 12; m++) y += bRow[m] * BSZ[m][k];
    boardPos[o] = xL + u * W;''')
rep('''boardPos[o + 2] = (v - 0.5) * D;
  }
  boardGeom.attributes.position.needsUpdate = true;''', '''boardPos[o + 2] = (v - 0.5) * D;
    }
  }
  boardGeom.attributes.position.needsUpdate = true;''')

# ---- the grip chart: paint the idle chart once ----
rep('''let gripLastSeen = null;''', '''let gripLastSeen = null;
let gripIdleDrawn = false, leadDrawn = true;   // v1.18: paint the idle chart once; clear the thread's canvas only when it has a thread''')
rep('''  $('grip').classList.toggle('idle', !on);
  gx.clearRect(0, 0, W, H);
''', '''  $('grip').classList.toggle('idle', !on);
''')
rep('''  const L = 92, R = W - 12, S0 = 10, S1 = 32, P0 = 46, P1 = 168, F0 = 186, F1 = H - 30;''',
'''  if (!t && gripIdleDrawn) { drawLead(bx, byTop, false); return; }
  gripIdleDrawn = !t;
  gx.clearRect(0, 0, W, H);
  const L = 92, R = W - 12, S0 = 10, S1 = 32, P0 = 46, P1 = 168, F0 = 186, F1 = H - 30;''')

# ---- the thread from chart to string: 2x at most, cleared only when drawn on ----
rep('''  const W = window.innerWidth, H = window.innerHeight, dpr = window.devicePixelRatio || 1;
  if (lead.width !== Math.round(W * dpr) || lead.height !== Math.round(H * dpr)) {
    lead.width = Math.round(W * dpr); lead.height = Math.round(H * dpr); lead.style.width = W + 'px'; lead.style.height = H + 'px'; }
  lx.setTransform(dpr, 0, 0, dpr, 0, 0); lx.clearRect(0, 0, W, H);
  if (!on) return;''', '''  const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
  if (lead.width !== Math.round(W * dpr) || lead.height !== Math.round(H * dpr)) {
    lead.width = Math.round(W * dpr); lead.height = Math.round(H * dpr); lead.style.width = W + 'px'; lead.style.height = H + 'px'; leadDrawn = false; }
  if (!on && !leadDrawn) return;
  lx.setTransform(dpr, 0, 0, dpr, 0, 0); lx.clearRect(0, 0, W, H); leadDrawn = false;
  if (!on) return;''')
rep('''  lx.beginPath(); lx.moveTo(sx, sy); lx.lineTo(px, py - 8); lx.stroke(); lx.setLineDash([]);
}''', '''  lx.beginPath(); lx.moveTo(sx, sy); lx.lineTo(px, py - 8); lx.stroke(); lx.setLineDash([]); leadDrawn = true;
}''')

DST.write_text(s)
print('wrote', DST, len(s))
