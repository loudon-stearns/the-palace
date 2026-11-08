"""Build proofs/tempo-map.html: the demo Set's clock drawn on paper and clicked in the browser.

    python3 make_proof.py      (reads demo-set.als; run make_demo_set.py first)
"""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from tempo_map import TempoMap

FPS = 24
tm = TempoMap.from_set(os.path.join(HERE, "demo-set.als"))
end = tm.sections[-1][0]
beats = []
b = 0.0
while b <= end + 1e-9:
    bar, bt = tm.bar_beat(b)
    beats.append({"t": tm.seconds_at(b), "bar": bar, "beat": round(bt, 6)})
    b = round(b + (4 / [m for m in tm.meters if m[0] <= b + 1e-9][-1][2]), 9)   # the meter's own unit
curve = [[tm.seconds_at(i * end / 400), tm.bpm_at(i * end / 400)] for i in range(401)]
meters = [{"t": tm.seconds_at(b0), "sig": "%d/%d" % (n, d), "bar": tm.bar_beat(b0)[0]} for b0, n, d in tm.meters]
sections = [{"t": tm.seconds_at(b0), "name": n} for b0, n in tm.sections]
cuts = []
for bar, bt in [(1, 1), (5, 1), (5, 4), (9, 1), (11, 2), (13, 1), (17, 1)]:
    sb = tm.beat_of(bar, bt)
    old_t = ((bar - 1) * 4 + (bt - 1)) * 0.5      # the old record: 120 bpm, 4/4, 12 frames a beat
    cuts.append({"bar": bar, "beat": bt, "songBeat": sb, "t": tm.seconds_at(sb), "frame": tm.frame_at(sb, FPS),
                 "section": tm.section_at(sb), "oldFrame": round(old_t * FPS), "bpm": round(tm.bpm_at(sb), 2)})
data = {"fps": FPS, "end": tm.seconds_at(end), "beats": beats, "curve": curve, "meters": meters,
        "sections": sections, "cuts": cuts}

html = r"""<!doctype html><html data-theme="paper"><head><meta charset="utf-8"><title>BLUELINE — the Set's clock</title>
<style>
:root{--paper:#f0eee5;--ink:#1a1916;--ink2:#3a3a35;--ink3:#6a6862;--fill:#dcd9ca;--red:#c8261a;--blue:#1f4e9c}
*{box-sizing:border-box;border-radius:0}
body{margin:0;background:var(--paper);color:var(--ink);font:13px/1.45 "JetBrains Mono",ui-monospace,Menlo,monospace;padding:18px}
h1{font-size:15px;font-weight:600;margin:0 0 4px}
p{margin:0 0 10px;color:var(--ink2);max-width:860px}
.sheet{border:1.5px solid var(--ink);padding:12px}
button{font:inherit;background:var(--fill);color:var(--ink);border:1px solid var(--ink);padding:5px 14px;box-shadow:inset 0 1px 0 #fff,0 1px 0 var(--ink3);cursor:pointer}
button:active{transform:translateY(1px)}
.row{display:flex;gap:14px;align-items:center;margin:8px 0}
#now{color:var(--blue)}
table{border-collapse:collapse;margin-top:10px;width:100%}
td,th{border:1px solid var(--ink3);padding:3px 8px;text-align:right}
th{font-weight:500;color:var(--ink2)}
td.l,th.l{text-align:left}
.set{color:var(--blue)} .old{color:var(--red)}
svg text{font:11px "JetBrains Mono",ui-monospace,Menlo,monospace;fill:var(--ink2)}
</style></head><body><div class="sheet">
<h1>BLUELINE · the Set's clock</h1>
<p>A demo Set written from Live 12's own blank: four bars of 4/4 at 120, a jump to 96 in 7/8, a ramp to 150 through 3/4, then 4/4 at 150. The reader takes its tempo lane, its meter lane and its locators, and places every cut on a frame by rounding absolute time once. <span class="set">Blue</span> is read from the Set. <span class="old">Red</span> is where the old record (one tempo, 120, 12 frames a beat) would have put the same bar.</p>
<div class="row"><button id="play">▶ play the clicks</button><span id="now">bar 1 · beat 1 · 0.000 s · frame 0</span></div>
<svg id="v" width="100%" viewBox="0 0 1000 330"></svg>
<table id="cuts"><tr><th class="l">cut at</th><th class="l">section</th><th>tempo there</th><th>song time</th><th class="set">frame (Set)</th><th class="old">frame (old record)</th><th>off by</th></tr></table>
</div>
<script>
const D = __DATA__;
const W=1000, L=60, R=20, X = t => L + (W-L-R) * t / Math.max(D.end, 32.5);
const svg=document.getElementById('v'), NS='http://www.w3.org/2000/svg';
function el(tag, a, txt){const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;svg.appendChild(e);return e}
// tempo curve
const y0=110,y1=20,bmin=80,bmax=160, Y=v=>y0-(y0-y1)*(v-bmin)/(bmax-bmin);
el('text',{x:4,y:y1+4},'bpm');[90,120,150].forEach(v=>{el('line',{x1:L,x2:W-R,y1:Y(v),y2:Y(v),stroke:'#dcd9ca'});el('text',{x:L-28,y:Y(v)+4},v)});
el('polyline',{points:D.curve.map(([t,v])=>X(t)+','+Y(v)).join(' '),fill:'none',stroke:'#1f4e9c','stroke-width':2});
// bar ruler from the Set
const rb=170; el('text',{x:4,y:rb-18},'Set');
el('line',{x1:L,x2:X(D.end),y1:rb,y2:rb,stroke:'#1a1916'});
D.beats.forEach(b=>{const down=b.beat===1;el('line',{x1:X(b.t),x2:X(b.t),y1:rb-(down?16:6),y2:rb,stroke:down?'#1f4e9c':'#6a6862','stroke-width':down?1.5:1});if(down)el('text',{x:X(b.t)+2,y:rb-20},b.bar)});
D.meters.forEach(m=>el('text',{x:X(m.t)+2,y:rb+14,style:'fill:#1f4e9c'},m.sig));
D.sections.forEach(s=>el('text',{x:X(s.t)+2,y:rb+28},s.name));
// old record ruler
const ro=250; el('text',{x:4,y:ro-18},'old');
el('line',{x1:L,x2:X(32.5),y1:ro,y2:ro,stroke:'#1a1916'});
for(let bar=1;bar<=17;bar++){const t=(bar-1)*2;el('line',{x1:X(t),x2:X(t),y1:ro-16,y2:ro,stroke:'#c8261a'});if(bar%4===1)el('text',{x:X(t)+2,y:ro-20,style:'fill:#c8261a'},bar)}
D.cuts.forEach(c=>{if(c.beat!==1)return;const tSet=c.t,tOld=c.oldFrame/D.fps;el('line',{x1:X(tSet),x2:X(tOld),y1:rb,y2:ro-16,stroke:'#c8261a','stroke-dasharray':'3 3'})});
// frames
const rf=300; el('text',{x:4,y:rf+4},'frame');
D.cuts.forEach(c=>{el('line',{x1:X(c.t),x2:X(c.t),y1:rf-8,y2:rf+8,stroke:'#1a1916'});el('text',{x:X(c.t)+3,y:rf+16},c.frame)});
const head=el('line',{x1:L,x2:L,y1:10,y2:320,stroke:'#c8261a','stroke-width':1.5,opacity:0});
// table
const tb=document.getElementById('cuts');
D.cuts.forEach(c=>{const r=tb.insertRow();[['l',`bar ${c.bar} · beat ${c.beat}`],['l',c.section],['',c.bpm+' bpm'],['',c.t.toFixed(4)+' s'],['set',c.frame],['old',c.oldFrame],['',(c.oldFrame-c.frame>0?'+':'')+(c.oldFrame-c.frame)+' fr']].forEach(([k,v])=>{const d=r.insertCell();d.textContent=v;if(k)d.className=k})});
// clicks, scheduled from the Set's own beat times
let ctx,start,raf;
document.getElementById('play').onclick=()=>{
  ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume();
  start=ctx.currentTime+0.15;
  D.beats.forEach(b=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=b.beat===1?1760:880;
    g.gain.setValueAtTime(0.0001,start+b.t);g.gain.exponentialRampToValueAtTime(b.beat===1?0.5:0.25,start+b.t+0.002);g.gain.exponentialRampToValueAtTime(0.0001,start+b.t+0.06);
    o.connect(g).connect(ctx.destination);o.start(start+b.t);o.stop(start+b.t+0.08)});
  head.setAttribute('opacity',1);cancelAnimationFrame(raf);
  const tick=()=>{const t=ctx.currentTime-start;if(t>D.end+0.3){head.setAttribute('opacity',0);return}
    const x=X(Math.max(0,t));head.setAttribute('x1',x);head.setAttribute('x2',x);
    let cur=D.beats[0];for(const b of D.beats)if(b.t<=t)cur=b;
    document.getElementById('now').textContent=`bar ${cur.bar} · beat ${+cur.beat.toFixed(3)} · ${Math.max(0,t).toFixed(3)} s · frame ${Math.round(Math.max(0,t)*D.fps)}`;
    raf=requestAnimationFrame(tick)};tick()};
</script></body></html>"""
os.makedirs(os.path.join(HERE, "proofs"), exist_ok=True)
out = os.path.join(HERE, "proofs", "tempo-map.html")
open(out, "w").write(html.replace("__DATA__", json.dumps(data)))
print(out)
for c in cuts:
    print(c)
