// Bows v1.4's own worklet at eight pitches x bow positions 0.70-0.92 and counts
// slips a cycle at the bow point (1 = Helmholtz). Writes JSON for schelleng_plot.py.
import fs from 'node:fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const src = html.match(/<script id="worklet-src" type="text\/plain">([\s\S]*?)<\/script>/)[1];
let P; class A { constructor(){ this.port={postMessage(){}}; } }
new Function('AudioWorkletProcessor','registerProcessor','sampleRate',src)(A,(n,c)=>P=c,48000);
const freqs=[82.41,110,146.83,196,261.63,329.63,440,659.26];
const poss=[]; for(let p=0.70;p<=0.925;p+=0.01) poss.push(+p.toFixed(2));
const speed=+process.argv[3]||0.5, force=+process.argv[4]||0.6;
const res={freqs,poss,speed,force,slips:[],rms:[]};
for(const f of freqs){ const sl=[], rr=[];
 for(const pos of poss){
  const node=new P(); node.port.onmessage({data:{type:'params',freq:f}});
  node.port.onmessage({data:{type:'bow',on:true,speed,force,position:pos}});
  const b=new Float32Array(1); const vel=[]; let prev=null, rms=0, cnt=0;
  for(let s=0;s<48000*1.0;s++){ node.process([],[[b]]);
   if(s>=48000*0.8){ const L=node.len,bw=Math.round(pos*(L-1)); const y=node.rBuf[(node.p+bw)%L]+node.lBuf[(node.q+bw)%L];
     if(prev!==null) vel.push(y-prev); prev=y; rms+=b[0]*b[0]; cnt++; } }
  const vmin=Math.min(...vel), thr=vmin*0.5; let k=0;
  for(let i=1;i<vel.length;i++) if(vel[i]<thr&&vel[i-1]>=thr) k++;
  sl.push(+(k/(0.2*f)).toFixed(2)); rr.push(+(10*Math.log10(rms/cnt)).toFixed(1)); }
 res.slips.push(sl); res.rms.push(rr); console.error(f, sl.map(v=>v<1.15?'.':v<2.15?'2':'3').join('')); }
fs.writeFileSync(process.argv[5]||'/tmp/wg-v14/posmap.json', JSON.stringify(res));
