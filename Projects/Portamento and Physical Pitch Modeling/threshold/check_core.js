// Checks the physics in overshoot-threshold.html: each overshoot level is produced, and arrival speed is matched.
const fs=require('fs'), path=require('path'), m={exports:{}};
const html=fs.readFileSync(path.join(__dirname,'overshoot-threshold.html'),'utf8');
new Function('module',html.match(/<script id="core">([\s\S]*?)<\/script>/)[1])(m);
const {zetaFor,curve,peakCents,FIFTH,wnForHalf,step}=m.exports;
const rows=[];
for (const c of [1.5,3,6,12,25,50,100,234,350]){
  const z=zetaFor(c/FIFTH), cv=curve(z,FIFTH,0.07,1.15), pk=peakCents(cv,FIFTH);
  const half=cv.findIndex(v=>v>=FIFTH/2)/1000, wn=wnForHalf(z,0.07);
  const tail=Math.abs(cv[cv.length-1]-FIFTH);
  rows.push({asked_cents:c, zeta:+z.toFixed(4), measured_peak:+pk.toFixed(2), half_ms:+(half*1000).toFixed(0), wn:+wn.toFixed(1), end_err_cents:+tail.toFixed(2)});
}
const cl=curve(1,FIFTH,0.07,1.15);
rows.push({asked_cents:0, zeta:1, measured_peak:+peakCents(cl,FIFTH).toFixed(2), half_ms:cl.findIndex(v=>v>=FIFTH/2), wn:+wnForHalf(1,0.07).toFixed(1), end_err_cents:+Math.abs(cl[cl.length-1]-FIFTH).toFixed(2)});
console.table(rows);
fs.writeFileSync(path.join(__dirname,'check_core.json'),JSON.stringify(rows,null,1));
