// How far the vessel reopens between beats, per release time (threshold -20, ratio 4, knee 6, attack 60).
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here,'..','stage2-vessel-prototype-v3.html'),'utf8').match(/<script id="dsp">([\s\S]*?)<\/script>/)[1];
const sb = { module:{exports:null}, Math, Float32Array }; vm.runInNewContext(src, sb); const BC = sb.module.exports;
const SR = 48000, rows = [];
for (const re of [100, 200, 300, 450, 800]){
  const c = new BC.Compressor(SR); Object.assign(c.p, { th:-20, ra:4, kn:6, at:60, re });
  const hb = new BC.Heartbeat(SR); for (let i=0;i<SR*2;i++) c.processSample(hb.next());
  let mn = 0, mx = -99; for (let i=0;i<SR*60/72*3;i++){ c.processSample(hb.next()); mn=Math.min(mn,c.last.gr); mx=Math.max(mx,c.last.gr); }
  rows.push({ releaseMs:re, deepestDb:+mn.toFixed(1), mostOpenDb:+mx.toFixed(1), breathDb:+(mx-mn).toFixed(1) });
}
console.log(JSON.stringify(rows)); fs.writeFileSync(path.join(here,'breathing.json'), JSON.stringify(rows,null,2));
