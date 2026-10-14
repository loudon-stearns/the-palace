# Patches study v1.10 onto the v1.9 page: the worklet works out where the loop
# really puts each overtone and listens at each; the page draws the overtone
# ladder, links it to the stiffness slider, and the walk gains a step.
# usage: python3 patch_page.py <v1.9 index.html> <out index.html> drawLadder.js
import sys
s = open(sys.argv[1]).read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)
rep("<title>Waveguide Study · v1.9 · the bow grips</title>", "<title>Waveguide Study · v1.10 · the overtones run sharp</title>")
rep("<h1>waveguide · study · v1.9 · the bow grips</h1>", "<h1>waveguide · study · v1.10 · the overtones run sharp</h1>")
# ---- worklet: the ladder's frequencies, worked out per note ----
rep("    this.eta = 0; this.tX = 0; this.tY = 0;   // tuning allpass\n    this.retune();\n",
"""    this.eta = 0; this.tX = 0; this.tY = 0;   // tuning allpass
    // v1.10: the overtone ladder. One Goertzel filter per overtone, at the
    // frequency the loop really rings it, listening at the pickup.
    this.gM = 0; this.gC = new Float64Array(16); this.gS1 = new Float64Array(16); this.gS2 = new Float64Array(16);
    this.gN = 0; this.gWin = 2048;
    this.retune();
""")
rep("    this.port.postMessage({ type: 'disp', nap: d.nap, c: d.c, B: d.B, worst: d.worst, N: d.N, freq: this.freq, len: d.len });\n",
"""    this.port.postMessage({ type: 'disp', nap: d.nap, c: d.c, B: d.B, worst: d.worst, N: d.N, freq: this.freq, len: d.len });
    this.postLadder(d);
""")
rep("  // The loop as it would be with nap sections at coefficient c: the string\n",
"""  // v1.10: where this loop really rings overtone n. It rings where one trip
  // round the loop takes exactly n periods: f = n x sr / loopDelay(f), found by
  // a few steps from the stiff-string law's guess. What the page draws is what
  // the filter achieved, not what was asked of it.
  postLadder(d) {
    const B = d.B || 0, f0 = this.freq, fit = { len: d.len, eta: d.eta };
    const M = Math.max(1, Math.min(16, Math.floor(0.45 * this.sr / f0)));
    const freqs = [], cents = [];
    for (let n = 1; n <= M; n++) {
      let f = n * f0 * Math.sqrt((1 + B * n * n) / (1 + B));
      for (let k = 0; k < 6; k++) f = n * this.sr / this.loopDelay(d.nap, d.c, fit, 2 * Math.PI * f / this.sr);
      if (!(f < 0.45 * this.sr)) break;
      freqs.push(f);
    }
    for (let n = 1; n <= freqs.length; n++) cents.push(1200 * Math.log2(freqs[n - 1] / (n * freqs[0])));
    this.gM = freqs.length;
    // A fresh listen per tuning, six cycles long and Hann-shaped, so each
    // overtone is heard apart from its neighbours and a slider sweep (16
    // retunes a second) still lets every listen finish.
    for (let i = 0; i < this.gM; i++) { this.gC[i] = 2 * Math.cos(2 * Math.PI * freqs[i] / this.sr); this.gS1[i] = 0; this.gS2[i] = 0; }
    this.gN = 0; this.gWin = Math.max(1024, Math.round(6 * this.sr / f0));
    this.port.postMessage({ type: 'ladder', f0: freqs[0], freqs, cents });
  }

  // The loop as it would be with nap sections at coefficient c: the string
""")
rep("      this.hpY = y - this.hpX + 0.9987 * this.hpY; this.hpX = y;\n",
"""      this.hpY = y - this.hpX + 0.9987 * this.hpY; this.hpX = y;
      // v1.10: read-only. The ladder listens to what the pickup hears.
      if (this.gN + n < this.gWin) {
        const xin = this.hpY * (0.5 - 0.5 * Math.cos(2 * Math.PI * (this.gN + n) / this.gWin));
        for (let i = 0; i < this.gM; i++) {
          const sg = xin + this.gC[i] * this.gS1[i] - this.gS2[i]; this.gS2[i] = this.gS1[i]; this.gS1[i] = sg;
        }
      }
""")
rep("    this.clock += N;\n",
"""    this.clock += N;
    // v1.10: each overtone's level over the last listen (six cycles), in dB.
    this.gN += N;
    if (this.gN >= this.gWin && this.gM > 0) {
      const db = new Float32Array(this.gM);
      for (let i = 0; i < this.gM; i++) {
        const s1 = this.gS1[i], s2 = this.gS2[i], p = s1 * s1 + s2 * s2 - this.gC[i] * s1 * s2;
        db[i] = 20 * Math.log10(4 * Math.sqrt(Math.max(0, p)) / this.gWin + 1e-9);
        this.gS1[i] = 0; this.gS2[i] = 0;
      }
      this.gN = 0;
      this.port.postMessage({ type: 'ladderLevel', db });
    }
""")
# ---- page ----
rep("  #more { display:none; }\n", """  #more { display:none; }
  /* v1.10: the overtone ladder, top right */
  #ladder { position:absolute; top:10px; right:12px; z-index:9; width:270px; background:rgba(11,13,16,0.82);
    border:1px solid #1e242b; border-radius:4px; padding:7px 9px 4px; font-size:11px; line-height:1.4; transition:opacity 0.4s, border-color 0.3s; }
  #ladder .t { color:#e8b84a; letter-spacing:0.04em; }
  #ladder .st { color:#f1e6d4; min-height:30px; }
  #ladder canvas { display:block; margin-top:3px; }
  #ladder.idle { opacity:0.45; }
  #ladder.lit { border-color:#e8b84a; }
  body.short #ladder { width:200px; top:auto; bottom:6px; right:6px; font-size:10px; }
  body.short #ladder canvas { width:200px !important; height:96px !important; }
""")
rep('<canvas id="lead"></canvas>\n', '''<canvas id="lead"></canvas>
<div id="ladder" class="idle"><div class="t">the overtones · what the ring hears</div>
  <div class="st" id="ladderState">pluck the string (click it), and watch its overtones</div>
  <canvas id="ladderCv" width="540" height="260" style="width:270px;height:130px"></canvas></div>
''')
rep("let audioCtx = null, wgNode = null, latestWave = null, latestBody = null, latestBow = null, latestPhase = 0;",
    "let audioCtx = null, wgNode = null, latestWave = null, latestBody = null, latestBow = null, latestPhase = 0, latestLadder = null;")
rep("    if (e.data.type === 'bowtrace') latestBow = e.data.off ? null : e.data;\n",
    "    if (e.data.type === 'bowtrace') latestBow = e.data.off ? null : e.data;\n"
    "    if (e.data.type === 'ladder') ladder = e.data;\n"
    "    if (e.data.type === 'ladderLevel') latestLadder = e.data;\n")
rep("  stiff: ['string'], pick: ['pickup'],", "  stiff: ['string', 'ladder'], pick: ['pickup'],")
rep("  drawGrip(bx, by + r, dt);\n", "  drawGrip(bx, by + r, dt);\n  drawLadder(dt);\n")
rep("function drawBoard(dt, G) {\n", open(sys.argv[3]).read() + "function drawBoard(dt, G) {\n")
rep("the ring is the pickup</div>", "the ring is the pickup · the ladder top right is what the ring hears: a dashed rung where a perfectly flexible string puts each overtone, an amber bar where this one does</div>")
# ---- the walk ----
rep("    say: 'a thin wire swells into a rod. listen: the overtones run sharp, and the pluck turns from guitar toward bell.' },\n",
"""    say: 'a thin wire swells into a rod. watch the ladder top right: the amber bars slide off their dashed rungs, the high ones furthest. that is the overtones running sharp. listen: the pluck turns from guitar, through piano, toward a struck bar.' },
  { id: 'freq', from: 131, to: 523, set: { stiff: 0.7 }, who: 'the same stiffness at every pitch',
    say: 'stiffness held at 0.70 while the note climbs two octaves. the ladder keeps its shape: each overtone leans the same cents sharp at every pitch, as one wire of one thickness would. listen: the same metallic colour, low to high.' },
""")
rep("watch it slide toward the bridge, and watch the chart top right:", "watch it slide toward the bridge, and watch the bow\\u2019s grip chart:")
rep("  setSlider(st.id, st.from);\n", "  if (st.set) for (const [k, v] of Object.entries(st.set)) setSlider(k, v);\n  setSlider(st.id, st.from);\n")
open(sys.argv[2], 'w').write(s)
