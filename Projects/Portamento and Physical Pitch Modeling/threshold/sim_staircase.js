// Runs part one's staircase (same rules as overshoot-threshold.html) against simulated listeners
// with known thresholds, to check where it settles and how many trials it takes.
function listener(T){ // 2AFC: 50% floor, logistic in log cents, 75% correct at T
  return c => 0.5 + 0.5/(1+Math.exp(-(Math.log(c)-Math.log(T))/0.25));
}
function run(T){
  const p=listener(T); let cents=120,factor=1.41,streak=0,dir=0,rev=[],trials=0;
  while(rev.length<10 && trials<200){
    trials++; const right=Math.random()<p(cents); let move=0;
    if(right){streak++; if(streak===2){move=-1;streak=0;}} else {move=1;streak=0;}
    if(move){ if(dir&&move!==dir){rev.push(cents); if(rev.length===4)factor=1.19;} dir=move;
      cents=Math.min(250,Math.max(1.5,move<0?cents/factor:cents*factor)); }
  }
  const l=rev.slice(-6); return {th:Math.exp(l.reduce((s,v)=>s+Math.log(v),0)/l.length),trials};
}
const out=[];
for(const T of [3,8,20,50]){
  const r=Array.from({length:2000},()=>run(T)), th=r.map(x=>x.th).sort((a,b)=>a-b), tr=r.map(x=>x.trials).sort((a,b)=>a-b);
  out.push({listener_75pct_cents:T, median_estimate:+th[1000].toFixed(1), middle_80pct:`${th[200].toFixed(1)}–${th[1800].toFixed(1)}`, median_trials:tr[1000]});
}
console.table(out); require('fs').writeFileSync(__dirname+'/sim_staircase.json',JSON.stringify(out,null,1));
