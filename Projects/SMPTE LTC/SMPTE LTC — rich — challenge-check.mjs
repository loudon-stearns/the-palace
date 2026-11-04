// SMPTE LTC — rich — challenge-check.mjs · born 2026-11-04 · the challenger's own route on [[SMPTE LTC]]'s rich face; reads only.
// forward_vector: I re-run the backward claim through a reversed and a resampled sample buffer, and take the band share with my own FFT.
//   node "Projects/SMPTE LTC/SMPTE LTC — rich — challenge-check.mjs"
// challenger's own route: reverse the sample buffer, resample a 1x render (tape/DAW shuttle); the independent drop-frame count went with the drop-frame piece, retired 2026-11-04
import { readFileSync } from 'node:fs'; import vm from 'node:vm';
const html = readFileSync(new URL('./SMPTE LTC — rich — backward.html', import.meta.url), 'utf8');
const core = html.match(/<script id="ltc-core">([\s\S]*?)<\/script>/)[1];
const E = { Math, Float32Array, Float64Array, Uint8Array, Object, Array, String, Infinity }; vm.createContext(E);
vm.runInContext(core + '\nthis.LTC=LTC;', E); const L = E.LTC, SR = 48000;
// 1. render forward at 1x, then reverse the SAMPLE BUFFER (not the decoder), with the audio path applied after reversal too
const START = { h: 10, m: 0, s: 0, f: 0 };
for (const rk of ['24','25','29.97']) {
  const tp = L.tape(START, 50, rk), N = Math.round(tp.dur*SR);
  const y = L.play(tp, SR, N, t=>t, {}); const r = Float32Array.from(y).reverse();
  // own high-pass + noise after reversal
  const R = Math.exp(-2*Math.PI*10/SR); let xp=0, yp=0, s=99;
  for (let n=0;n<N;n++){ const x=r[n]; yp=x-xp+R*yp; xp=x; r[n]=yp + 0.03*((s=(s*1664525+1013904223)>>>0)/4294967296-0.5)*3.46; }
  const sc = L.score(L.read(r, SR), tp, -1);
  console.log(`reversed buffer ${rk}: ${sc.distinct}/50, wrong ${sc.wrong}, dirWrong ${sc.dirWrong}`);
}
// 2. resample a 1x render at 48k (linear interpolation, like a varispeed/DAW shuttle), not time-scaling the tape
function resample(y, speed){ const n = Math.floor((y.length-1)/Math.abs(speed)); const o = new Float32Array(n);
  for (let i=0;i<n;i++){ let p = i*Math.abs(speed); if (speed<0) p = (y.length-1) - p; const k=Math.floor(p), f=p-k; o[i]=y[k]*(1-f)+(y[Math.min(k+1,y.length-1)])*f; } return o; }
const tp = L.tape(START, 50, '25'), y1 = L.play(tp, SR, Math.round(tp.dur*SR), t=>t, {});
for (const sp of [-16,-12,-10,-8,-6,-4,-2,-1,-0.5,-0.25,-0.1,0.1,0.5,2,4,6,8,10,12,16]) {
  const z = resample(y1, sp); const R = Math.exp(-2*Math.PI*10/SR); let xp=0, yp=0, s=7;
  for (let n=0;n<z.length;n++){ const x=z[n]; yp=x-xp+R*yp; xp=x; z[n]=yp + 0.03*((s=(s*1664525+1013904223)>>>0)/4294967296-0.5)*3.46; }
  const sc = L.score(L.read(z, SR), tp, Math.sign(sp));
  console.log(`resampled ${sp}x: ${sc.distinct}/50, wrong ${sc.wrong}, dirWrong ${sc.dirWrong}; half-cell = ${(SR/(4000*Math.abs(sp))).toFixed(2)} samples`);
}
// time-scaled tape at the in-between speeds the maker skipped
for (const sp of [-10,-6,6,10]) { const a=L.atSpeed(tp, sp); const z=L.play(tp,SR,Math.ceil(a.dur*SR),a.pos,{hp:10,noise:0.03,seed:11}); const sc=L.score(L.read(z,SR),tp,Math.sign(sp)); console.log(`time-scaled ${sp}x: ${sc.distinct}/50 wrong ${sc.wrong}`); }
// 4. band share by own route: unwindowed FFT of 2^18 samples (5.46 s), own code
function fft(re, im){ const N=re.length; for(let i=1,j=0;i<N;i++){let bit=N>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];}}
  for(let len=2;len<=N;len<<=1){const a=-2*Math.PI/len;for(let i=0;i<N;i+=len)for(let k=0;k<len/2;k++){const c=Math.cos(a*k),s=Math.sin(a*k),xr=re[i+k+len/2]*c-im[i+k+len/2]*s,xi=re[i+k+len/2]*s+im[i+k+len/2]*c;re[i+k+len/2]=re[i+k]-xr;im[i+k+len/2]=im[i+k]-xi;re[i+k]+=xr;im[i+k]+=xi;}}}
for (const rk of ['24','25','29.97']) { const tp=L.tape({h:14,m:27,s:3,f:0},Math.round(6*L.RATES[rk].fps),rk); const y=L.play(tp,SR,Math.round(tp.dur*SR),t=>t,{hp:10});
  const N=1<<18, re=new Float64Array(N), im=new Float64Array(N); for(let i=0;i<N;i++) re[i]=y[i+1000]||0; fft(re,im);
  let tot=0,band=0; for(let i=1;i<N/2;i++){const f=i*SR/N,p=re[i]*re[i]+im[i]*im[i]; tot+=p; if(f>=500&&f<3000) band+=p;} console.log(`band share ${rk}: ${(100*band/tot).toFixed(1)}% in 500 Hz-3 kHz`); }
