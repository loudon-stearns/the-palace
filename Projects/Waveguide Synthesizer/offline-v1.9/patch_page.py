# Patches study v1.9's page side onto the v1.8 page (the worklet trace is already in):
# the grip chart, the contact dot and spark, the thread, the slider links, the walk captions.
import sys
p = sys.argv[1]
s = open(p).read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)
rep("<title>Waveguide Study · v1.8 · the body</title>", "<title>Waveguide Study · v1.9 · the bow grips</title>")
rep("<h1>waveguide · study · v1.8 · the body</h1>", "<h1>waveguide · study · v1.9 · the bow grips</h1>")
rep("  #more { display:none; }\n", """  #more { display:none; }
  /* v1.9: the bow's grip, a chart in the top right joined to the bow by a thread */
  #grip { position:absolute; top:10px; right:12px; z-index:9; width:330px; background:rgba(11,13,16,0.82);
    border:1px solid #1e242b; border-radius:4px; padding:8px 10px 6px; font-size:11px; line-height:1.4; transition:opacity 0.4s; }
  #grip .t { color:#e8b84a; letter-spacing:0.04em; }
  #grip .st { color:#f1e6d4; min-height:30px; }
  #grip canvas { display:block; margin-top:4px; }
  #grip.idle { opacity:0.45; }
  #lead { position:absolute; inset:0; pointer-events:none; z-index:8; }
  body.short #grip { width:240px; top:6px; right:6px; font-size:10px; }
  body.short #grip canvas { width:240px !important; height:120px !important; }
""")
rep('<div id="wordmark">Loud\'n Live</div>', '''<div id="wordmark">Loud'n Live</div>
<canvas id="lead"></canvas>
<div id="grip" class="idle"><div class="t">the bow's grip · one string cycle</div>
  <div class="st" id="gripState">hold B to bow, and watch the hair catch and let go</div>
  <canvas id="gripCv" width="660" height="330" style="width:330px;height:165px"></canvas></div>''')
rep("bowed, it settles into one sharp corner running round the string once a cycle: that is the bow catching and letting go ·",
    "bowed, it settles into one sharp corner running round the string once a cycle: each time the corner passes the bow, the hair lets go, and the chart top right shows it (amber = holding, dark = slipping) ·")
rep("    if (e.data.type === 'wave') latestWave = e.data.data;\n",
    "    if (e.data.type === 'wave') { latestWave = e.data.data; if (e.data.phase !== undefined) latestPhase = e.data.phase; }\n    if (e.data.type === 'bowtrace') latestBow = e.data.off ? null : e.data;\n")
rep("let audioCtx = null, wgNode = null, latestWave = null, latestBody = null;",
    "let audioCtx = null, wgNode = null, latestWave = null, latestBody = null, latestBow = null, latestPhase = 0;")
rep("bspd: ['arrow', 'bow'], bfrc: ['bow'], bpos: ['bow'], slow: ['clock'] };",
    "bspd: ['arrow', 'bow', 'gSpeed'], bfrc: ['bow', 'gWindow'], bpos: ['bow', 'gSlip'], slow: ['clock'] };")
rep("const bowLabel = makeLabel('bow');\n", """const bowLabel = makeLabel('bow');
// v1.9: where hair meets string. Amber and full while the hair holds the
// string; shrinks to a dark bead with a white spark the instant it lets go.
const gripMat = new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0.9, depthTest: false });
const gripDot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), gripMat); gripDot.renderOrder = 6; scene.add(gripDot);
const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, opacity: 0, depthTest: false });
const spark = new THREE.Mesh(new THREE.BoxGeometry(0.012, 1, 0.012), sparkMat); spark.renderOrder = 6; scene.add(spark);
""")
rep("  bowLabel.material.opacity = lerp(0.45, 1, Math.max(fl('bow'), fl('arrow'), bowing ? 0.6 : 0));\n",
"""  bowLabel.material.opacity = lerp(0.45, 1, Math.max(fl('bow'), fl('arrow'), bowing ? 0.6 : 0));
  drawGrip(bx, by + r, dt);
""")
rep("function drawBoard(dt, G) {\n", open(sys.argv[2]).read() + "function drawBoard(dt, G) {\n")
rep("say: 'the bow is held on the string now. watch it slide toward the bridge; listen: the tone gets brighter and more glassy.' },",
    "say: 'the bow is held on the string now. watch it slide toward the bridge, and watch the chart top right: amber where the hair holds the string, a dark gap where it lets go, once a cycle. listen: the tone gets brighter and more glassy.' },")
rep("say: 'the arrow grows: each stroke drags farther. listen: the bowed tone swells louder.' },",
    "say: 'the arrow grows, and on the chart the dashed bow-speed line rises: the string rides that line while the hair holds it. listen: the bowed tone swells louder.' },")
rep("say: 'the bow widens and glows as it presses harder. listen: airy and thin at first, then it grips and growls.' },",
    "say: 'the bow widens, and on the chart the grip window widens with it. too light and the hair lets go twice a cycle (airy); just right, once (it sings); too heavy and it never lets go, pinning the string. listen for each.' },")
open(p, 'w').write(s)
