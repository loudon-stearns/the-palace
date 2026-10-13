// Bows v1.4's own worklet across bow speed x bow force at G3 (196 Hz), bow at
// 0.74, and sorts each steady note into Schelleng's four regions by what the
// bow point does: skates (the note never starts), multiple slip (more than one
// slip a cycle), Helmholtz (exactly one), raucous (not periodic). Writes JSON
// for schelleng_plot.py.
import fs from 'node:fs';
const [,, htmlPath, outPath, F0 = '196', POS = '0.74'] = process.argv;
const html = fs.readFileSync(htmlPath, 'utf8');
const src = html.match(/<script id="worklet-src" type="text\/plain">([\s\S]*?)<\/script>/)[1];
let P; class A { constructor(){ this.port={postMessage(){}}; } }
new Function('AudioWorkletProcessor','registerProcessor','sampleRate',src)(A,(n,c)=>P=c,48000);
const SR=48000, f0=+F0, pos=+POS;
const speeds=[], forces=[]; for(let i=0;i<=10;i++) speeds.push(+(0.05+0.095*i).toFixed(3)); for(let j=0;j<=16;j++) forces.push(+(j/16).toFixed(4));
const cls=[], rms=[];
for (const F of forces) { const cr=[], rr=[];
  for (const sp of speeds) {
    const n=new P(); n.port.onmessage({data:{type:'params',freq:f0}}); n.port.onmessage({data:{type:'bow',on:true,speed:sp,force:F,position:pos}});
    const b=new Float32Array(1), vel=[], out=[]; let prev=null;
    for(let s=0;s<SR*1.5;s++){ n.process([],[[b]]); if(s>=SR){ out.push(b[0]); const L=n.len,bw=Math.round(pos*(L-1)); const y=n.rBuf[(n.p+bw)%L]+n.lBuf[(n.q+bw)%L]; if(prev!==null) vel.push(y-prev); prev=y; } }
    let r=0; for(const v of out) r+=v*v; const db=10*Math.log10(r/out.length+1e-20);
    const thr=Math.min(...vel)*0.5; let k=0; for(let i=1;i<vel.length;i++) if(vel[i]<thr&&vel[i-1]>=thr) k++;
    const spc=k/(0.5*f0);
    const Pn=Math.round(SR/f0); const a=out.slice(-2*Pn,-Pn), c=out.slice(-Pn); let ab=0,aa=0,cc=0; for(let i=0;i<Pn;i++){ab+=a[i]*c[i];aa+=a[i]*a[i];cc+=c[i]*c[i];}
    const corr=ab/Math.sqrt(aa*cc+1e-30);
    let label;
    if (db < -57) label = F < 0.5 ? 'skates' : 'stuck';
    else if (corr < 0.95 || spc > 4.5) label='raucous';
    else if (spc < 1.2) label='helmholtz';
    else label='multiple';
    cr.push(label); rr.push(+db.toFixed(1)); }
  cls.push(cr); rms.push(rr); process.stderr.write(F.toFixed(2)+' '+cr.map(l=>l[0]).join('')+'\n'); }
fs.writeFileSync(outPath, JSON.stringify({f0, pos, speeds, forces, cls, rms}));
