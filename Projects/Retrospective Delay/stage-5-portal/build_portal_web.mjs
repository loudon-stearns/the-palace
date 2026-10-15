// Builds portal-web.html: the portal's third target, the browser, made by
// hand rather than by RNBO's web export — the page reads portal.codebox's
// own text, turns it into a per-sample function (the same transpiler as
// portal_mirror.mjs), and runs it in Web Audio. Not RNBO's compiled output;
// the same source, honestly ported, so the question "is it still the same
// instrument?" can be asked with ears today.
//   node build_portal_web.mjs
// Graphite skin from _ops/loudon-live/design-system; the review layer from
// its ui_kits/review-layer (first interactive versions ship reviewable).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const codebox = fs.readFileSync(path.join(here, 'portal.codebox'), 'utf8');
const review = fs.readFileSync(path.join(here, '../../../_ops/loudon-live/design-system/ui_kits/review-layer/review-layer.js'), 'utf8');

const html = `<!doctype html>
<html lang="en" class="skin-graphite"><head><meta charset="utf-8">
<title>Retrospective Delay · the portal</title>
<style>
:root{--bg:#0a0a0f;--bg1:#12121a;--bg2:#1a1a28;--fg1:#e8e8f0;--fg2:#c8c8d8;--fg3:#8a8aa0;--fg4:#4a4a5a;--accent:#e8b84a;--accent-dim:#7a6030;
--serif:'Cormorant Garamond',Georgia,serif;--sans:'Manrope',system-ui,-apple-system,Helvetica,sans-serif;--mono:'JetBrains Mono',ui-monospace,Menlo,monospace}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg1);font-family:var(--sans)}
main{max-width:980px;margin:0 auto;padding:28px 24px 40px}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--fg3)}
h1{font-weight:300;font-size:34px;margin:6px 0 4px;letter-spacing:-.01em}
.lead{font-family:var(--serif);font-size:19px;line-height:1.6;color:var(--fg2);max-width:720px;margin:4px 0 18px}
.grid{display:grid;grid-template-columns:420px 1fr;gap:24px;align-items:start}
canvas{background:var(--bg1);border:1px solid var(--bg2);border-radius:6px;width:420px;height:420px}
.panel{background:var(--bg1);border:1px solid var(--bg2);border-radius:6px;padding:16px 18px;margin-bottom:14px}
.label{font-family:var(--mono);font-size:12px;color:var(--fg3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;display:flex;justify-content:space-between}
button{font-family:var(--mono);font-size:12px;background:var(--bg2);color:var(--fg1);border:1px solid var(--fg4);border-radius:4px;padding:7px 11px;cursor:pointer;transition:all .15s cubic-bezier(.4,0,.2,1)}
button:hover{border-color:var(--fg3)}button.on{border-color:var(--accent);color:var(--accent)}
button.go{background:var(--accent);color:#0a0a0f;border-color:var(--accent);box-shadow:0 0 18px rgba(232,184,74,.35)}
input[type=range]{width:100%;accent-color:var(--accent)}
input[type=number]{width:70px;background:var(--bg2);color:var(--fg1);border:1px solid var(--fg4);border-radius:4px;padding:5px;font-family:var(--mono)}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.meter{height:6px;background:var(--bg2);border-radius:3px;overflow:hidden;margin:4px 0 10px}.meter>i{display:block;height:100%;background:var(--fg2);width:0}
.facts .label{margin-bottom:2px}.small{font-family:var(--serif);font-size:15px;color:var(--fg3);line-height:1.5}
footer{margin-top:26px;font-family:var(--mono);font-size:11px;letter-spacing:.18em;color:var(--fg4);text-transform:uppercase}
</style></head><body><main>
<div class="eyebrow">Retrospective Delay · the fifth move · sketch</div>
<h1>The portal</h1>
<p class="lead">The same séance, out of Max. This page runs the RNBO codebox's own text, line for line, at your browser's sample rate. Play a phrase, stop, and raise the knob: the last measure comes back as one ghost, and the tape keeps it for as long as you stay silent.</p>
<div class="grid">
 <div><canvas id="ring" width="840" height="840"></canvas>
  <p class="small">The ring is the tape, one measure around. Gold is the write head, always moving. The pale line is the read head, trailing by the lag. Ink on the ring is what the tape holds.</p></div>
 <div>
  <div class="panel" id="p-start"><div class="row"><button class="go" id="start">Start audio</button><span class="small" id="sr"></span></div></div>
  <div class="panel" id="p-play"><div class="label"><span>Input</span></div>
   <div class="row"><button id="phrase">Play a phrase</button><button id="mic">Use the mic</button></div>
   <p class="small">The phrase is one measure of eighth notes at the tempo below. With the mic, use headphones: the ghost is loud enough to feed back.</p></div>
  <div class="panel" id="p-knob"><div class="label"><span>Gain · the one gesture</span><span id="gv">0.00</span></div>
   <input type="range" id="gain" min="0" max="1" step="0.01" value="0">
   <div class="label" style="margin-top:12px"><span>Lag · how far back</span></div>
   <div class="row"><button data-lag="0.25">quarter</button><button data-lag="0.5" class="on">half</button><button data-lag="1">whole</button></div>
   <div class="label" style="margin-top:12px"><span>Tempo</span></div>
   <div class="row"><input type="number" id="bpm" min="30" max="300" value="120"><span class="small">bpm, 4/4</span></div></div>
  <div class="panel facts" id="p-facts"><div class="label"><span>What the cat would read</span></div>
   <div class="label"><span>knob as heard · pose</span><span id="f0">0.00</span></div><div class="meter"><i id="m0"></i></div>
   <div class="label"><span>presence on the tape · ectoplasm</span><span id="f1">0.00</span></div><div class="meter"><i id="m1"></i></div>
   <div class="label"><span>holding · candle</span><span id="f2">0.00</span></div><div class="meter"><i id="m2"></i></div></div>
 </div></div>
<footer>Loud’n Live</footer></main>
<script id="codebox" type="text/plain">${codebox.replace(/<\/script/g, '<\\/script')}</script>
<script>
function transpile(src){
  src=src.replace(/\\/\\/.*$/gm,'');const decl=[],names=[];
  src=src.replace(/^@param\\s*\\(\\{[^}]*\\}\\)\\s*(\\w+)\\s*=\\s*([^;]+);/gm,(_,n,v)=>{decl.push('let '+n+' = '+v+';');names.push(n);return ''});
  src=src.replace(/^@state\\s+(\\w+)\\s*=\\s*([^;]+);/gm,(_,n,v)=>{decl.push('let '+n+' = '+v+';');names.push(n);return ''});
  const consts=[];src=src.replace(/^const\\s+[^;]+;/gm,m=>{consts.push(m);return ''});
  const fns=[];src=src.replace(/^function\\s+\\w+\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?^\\}/gm,m=>{fns.push(m);return ''});
  const body=src.trim();
  const code='const floor=Math.floor,abs=Math.abs,exp=Math.exp,min=Math.min,max=Math.max,clamp=(x,lo,hi)=>Math.min(Math.max(x,lo),hi);'
   +'const FixedFloat64Array=Float64Array;const samplerate=sr;'+consts.join('\\n')+decl.join('\\n')+fns.join('\\n')
   +'let in1=0,out1=0,out2=0,out3=0,out4=0,out5=0;return{set(k,v){switch(k){'+names.map(n=>"case '"+n+"': "+n+'=v;break;').join(' ')+'}},'
   +'get(k){switch(k){'+names.map(n=>"case '"+n+"': return "+n+';').join(' ')+'}},'
   +'tick(x){in1=x;{'+body+'}},outs(){return[out1,out2,out3,out4,out5]}}';
  return new Function('sr',code);
}
const SRC=document.getElementById('codebox').textContent;
let ctx,cb,node,micSrc=null,queue=[],facts=[0,0,0],params={gain:0,lag:0.5,bpm:120};
function measure(){return Math.min(Math.floor(ctx.sampleRate*240/params.bpm+0.5),384000)}
function schedulePhrase(){ // one measure of eighth-note plucks, synthesized into the input stream
  const sr=ctx.sampleRate,M=measure(),eighth=M/8,notes=[62,65,69,72,70,69,65,67],buf=new Float32Array(M+sr);
  notes.forEach((m,i)=>{const f=440*Math.pow(2,(m-69)/12),s0=Math.round(i*eighth),len=Math.round(eighth*.9);
    for(let j=0;j<len;j++){const t=j/sr,e=Math.exp(-t*6)*Math.min(1,j/(.002*sr))*Math.min(1,(len-j)/(.004*sr));
      buf[s0+j]+=.3*e*(Math.sin(2*Math.PI*f*t)+.3*Math.sin(4*Math.PI*f*t));}});
  queue.push({buf,pos:0});
}
document.getElementById('start').onclick=async()=>{
  if(ctx)return;ctx=new (window.AudioContext||window.webkitAudioContext)();
  cb=transpile(SRC)(ctx.sampleRate);for(const k in params)cb.set(k,params[k]);
  node=ctx.createScriptProcessor(1024,1,2);
  node.onaudioprocess=e=>{
    const inp=e.inputBuffer.getChannelData(0),L=e.outputBuffer.getChannelData(0),R=e.outputBuffer.getChannelData(1);
    for(let n=0;n<L.length;n++){
      let x=micSrc?inp[n]:0;
      for(let q=queue.length-1;q>=0;q--){const p=queue[q];x+=p.buf[p.pos++];if(p.pos>=p.buf.length)queue.splice(q,1);}
      cb.tick(x);const o=cb.outs();L[n]=o[0];R[n]=o[1];
      if(n===L.length-1){facts=[o[2],o[3],o[4]];}
    }};
  const silent=ctx.createConstantSource?ctx.createConstantSource():null; // keeps the processor pulled with no mic
  if(silent){silent.offset.value=0;silent.connect(node);silent.start();}
  node.connect(ctx.destination);
  document.getElementById('start').classList.remove('go');document.getElementById('start').textContent='Audio on';
  document.getElementById('sr').textContent='running at '+ctx.sampleRate+' Hz';requestAnimationFrame(draw);
};
document.getElementById('phrase').onclick=()=>{if(ctx)schedulePhrase()};
document.getElementById('mic').onclick=async e=>{if(!ctx||micSrc)return;try{const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});micSrc=ctx.createMediaStreamSource(s);micSrc.connect(node);e.target.classList.add('on');}catch(err){e.target.textContent='mic not available here';}};
document.getElementById('gain').oninput=e=>{params.gain=+e.target.value;document.getElementById('gv').textContent=params.gain.toFixed(2);if(cb)cb.set('gain',params.gain)};
document.querySelectorAll('[data-lag]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-lag]').forEach(c=>c.classList.remove('on'));b.classList.add('on');params.lag=+b.dataset.lag;if(cb)cb.set('lag',params.lag)});
document.getElementById('bpm').onchange=e=>{params.bpm=Math.max(30,Math.min(300,+e.target.value||120));if(cb)cb.set('bpm',params.bpm)};
const cv=document.getElementById('ring'),g=cv.getContext('2d');
function draw(){
  const W=cv.width,c=W/2,R=W*.36,M=measure(),tape=cb.get('tape'),w=cb.get('w'),bins=360;
  g.clearRect(0,0,W,W);g.lineWidth=2;g.strokeStyle='#1a1a28';g.beginPath();g.arc(c,c,R,0,2*Math.PI);g.stroke();
  const per=Math.max(1,Math.floor(M/bins));
  for(let b=0;b<bins;b++){let pk=0;const s0=Math.floor(b*M/bins);for(let i=s0;i<s0+per;i+=Math.max(1,per>>4))pk=Math.max(pk,Math.abs(tape[i]));
    const a=b/bins*2*Math.PI-Math.PI/2,len=Math.min(1,pk*2.2)*R*.42;
    g.strokeStyle='rgba(200,200,216,'+(0.25+Math.min(.7,pk*2))+')';g.lineWidth=3;
    g.beginPath();g.moveTo(c+Math.cos(a)*(R-len),c+Math.sin(a)*(R-len));g.lineTo(c+Math.cos(a)*(R+len*.35),c+Math.sin(a)*(R+len*.35));g.stroke();}
  const head=(pos,col,wid)=>{const a=pos/M*2*Math.PI-Math.PI/2;g.strokeStyle=col;g.lineWidth=wid;g.beginPath();g.moveTo(c+Math.cos(a)*R*.45,c+Math.sin(a)*R*.45);g.lineTo(c+Math.cos(a)*R*1.18,c+Math.sin(a)*R*1.18);g.stroke();};
  head(((w-params.lag*M)%M+M)%M,'rgba(232,232,240,'+(0.3+0.7*facts[0])+')',4);head(w,'#e8b84a',5);
  g.fillStyle='#8a8aa0';g.font='22px JetBrains Mono, monospace';g.textAlign='center';
  g.fillText(facts[2]>0.5?'holding — silence keeps':'listening',c,c-8);g.fillText('one measure · '+(M/ctx.sampleRate).toFixed(2)+' s',c,c+24);
  facts.forEach((v,i)=>{document.getElementById('f'+i).textContent=v.toFixed(2);document.getElementById('m'+i).style.width=(v*100)+'%'});
  requestAnimationFrame(draw);
}
</script>
<script>${review.replace(/<\/script/gi, '<\\/script')}</script>
<script>mountReviewLayer({project:'retrospective-delay-portal',round:1,review:true,moments:[
 {id:'ring',label:'The tape ring',tag:'design',sel:'#ring'},
 {id:'play',label:'Playing into it',tag:'control',sel:'#p-play'},
 {id:'knob',label:'Knob, lag and tempo',tag:'control',sel:'#p-knob'},
 {id:'sound',label:'Is it still the same instrument?',tag:'sound'}]});</script>
</body></html>`;
fs.writeFileSync(path.join(here, 'portal-web.html'), html);
console.log('portal-web.html', html.length, 'bytes');
