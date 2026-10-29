# Synth Templates — builds picker.html (the completeness tracker) from catalog.json. One file, no build step, Drafting Table paper ground.
import json
data = json.load(open("catalog.json"))
n = sum(len(f["items"]) for f in data["families"])
html = r'''<!doctype html>
<html lang="en" data-theme="paper">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Synth Templates · Completeness Tracker</title>
<meta name="piece:needs" content="localStorage">
<style>
:root{--ground-000:#f0eee5;--ground-100:#e6e3d7;--ground-200:#dcd9ca;--ink:#1a1916;--ink-2:#3a3a35;--ink-3:#6a6862;--ink-bright:#000;--rule:#b8b09a;--rule-soft:#cfc9b6;--slab-face:#d8d4c6;--slab-light:#ebe8dd;--slab-shade:#b9b4a3;--accent:#c8261a;--on-accent:#f0eee5;--datasheet:#2b5fb0;--assumed:#a8730a;--ok:#3a7d2c}
:root[data-theme="phosphor"]{--ground-000:#050a06;--ground-100:#0b2a14;--ground-200:#10361d;--ink:#33ff66;--ink-2:#1f8a3c;--ink-3:#0f5024;--ink-bright:#d7f6dc;--rule:#1f8a3c;--rule-soft:#133d20;--slab-face:#141c16;--slab-light:#233029;--slab-shade:#07100a;--accent:#33ff66;--on-accent:#050a06;--datasheet:#4f8cff;--assumed:#ffb000;--ok:#33ff66}
*{box-sizing:border-box}
body{margin:0;background:var(--ground-000);color:var(--ink);font:15px/22px 'JetBrains Mono','IBM Plex Mono','SF Mono',Menlo,Consolas,monospace}
.sheet{max-width:1200px;margin:32px auto;padding:0 16px}
.frame{border:2px solid var(--rule)}
.titleblock{display:grid;grid-template-columns:1fr auto;border-bottom:2px solid var(--rule)}
.titleblock>div{padding:12px}
.titleblock .cell{border-left:1px solid var(--rule);font-size:11px;line-height:16px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-2);white-space:nowrap}
h1{font-size:22px;line-height:26px;font-weight:600;letter-spacing:.04em;margin:0;text-transform:uppercase}
.sub{font-size:13px;line-height:18px;color:var(--ink-2);margin-top:4px}
.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px;border-bottom:1px solid var(--rule);position:sticky;top:0;background:var(--ground-000);z-index:2}
.toolbar input[type=search]{font:inherit;font-size:13px;padding:4px 8px;border:1px solid var(--rule);background:var(--ground-100);color:var(--ink);border-radius:0;min-width:220px}
.btn{font:inherit;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:5px 10px;border:1px solid var(--ink);background:var(--slab-face);color:var(--ink);border-radius:0;cursor:pointer;box-shadow:inset 0 1px 0 var(--slab-light),0 1px 0 var(--slab-shade)}
.btn:active{box-shadow:none;transform:translateY(1px)}
.btn.on{background:var(--ink);color:var(--on-accent)}
.btn.primary{border-color:var(--accent);color:var(--accent)}
.sep{width:1px;height:22px;background:var(--rule)}
.progress{padding:10px 12px;border-bottom:1px solid var(--rule);display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;font-size:12px;color:var(--ink-2)}
.bar{height:10px;border:1px solid var(--ink);background:var(--ground-100);position:relative}
.bar i{position:absolute;top:0;bottom:0;left:0;display:block}
.bar .s1{background:repeating-linear-gradient(45deg,var(--ground-200) 0 3px,transparent 3px 6px)}
.bar .s2{background:var(--assumed)}
.bar .s3{background:var(--ok)}
.legend{font-size:12px;color:var(--ink-2);padding:8px 12px;border-bottom:1px solid var(--rule-soft)}
.legend b{font-weight:600}
.st{display:inline-block;width:14px;height:14px;border:1px solid var(--ink);vertical-align:-2px;margin-right:4px;background:var(--ground-000)}
.st.s1{background:repeating-linear-gradient(45deg,var(--ground-200) 0 3px,transparent 3px 6px)}
.st.s2{background:var(--assumed)}
.st.s3{background:var(--ok)}
.fam{border-bottom:1px solid var(--rule)}
.famhead{display:flex;gap:12px;align-items:baseline;padding:10px 12px;background:var(--ground-100);border-bottom:1px solid var(--rule-soft)}
.famhead h2{font-size:18px;line-height:24px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;margin:0;cursor:pointer}
.famhead .note{font-size:13px;color:var(--ink-2);flex:1}
.famhead .n{font-size:12px;color:var(--ink-3);white-space:nowrap}
table{width:100%;border-collapse:collapse}
tr.item{border-top:1px solid var(--rule-soft);cursor:pointer}
tr.item.hide{display:none}
tr.item.s1{background:var(--ground-100)}
tr.item.s3 td.name{color:var(--ok)}
td{padding:6px 10px;vertical-align:top;font-size:13px;line-height:18px}
td.ck{width:30px;padding-top:8px}
td.num{width:44px;color:var(--ink-3);font-size:11px;padding-top:8px}
td.name{width:230px;font-weight:600;color:var(--ink-bright)}
td.name small{display:block;font-weight:400;color:var(--datasheet);font-size:11px}
td.mode{width:90px;color:var(--ink-2);font-size:11px;letter-spacing:.08em;text-transform:uppercase}
td.ess{color:var(--ink)}
td.ess i{display:block;font-style:normal;color:var(--ink-2);font-size:12px}
td.ess u{display:block;text-decoration:none;color:var(--ink-3);font-size:11px}
td.tier{width:40px;text-align:center;color:var(--assumed);font-weight:600}
.fam.collapsed table{display:none}
.cov{border-bottom:2px solid var(--rule)}
.cov h2{font-size:18px;line-height:24px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;margin:0;padding:10px 12px;background:var(--ground-100);cursor:pointer}
.cov .sec{padding:4px 12px 8px}
.cov h3{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-2);margin:8px 0 4px;font-weight:500}
.cov .c{display:flex;gap:8px;align-items:center;font-size:12px;line-height:18px;padding:1px 0;cursor:pointer}
.cov .c .bar{width:60px;flex:none}
.cov .c .pg{color:var(--ink-3);width:34px;flex:none}
.cov .c.on{color:var(--accent)}
.cov.collapsed .sec{display:none}
.export{padding:12px;border-top:2px solid var(--rule)}
.export textarea{width:100%;height:150px;font:12px/16px inherit;font-family:inherit;background:var(--ground-100);color:var(--ink);border:1px solid var(--rule);border-radius:0;padding:8px;margin-top:8px}
.foot{display:grid;grid-template-columns:repeat(3,1fr);border-top:2px solid var(--rule);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-2)}
.foot div{padding:8px 12px;border-left:1px solid var(--rule)}
.foot div:first-child{border-left:0}
#msg{font-size:12px;color:var(--ok);margin-left:8px}
@media(max-width:700px){td.mode,td.tier,td.num{display:none}td.name{width:40%}.foot{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="sheet"><div class="frame">
<div class="titleblock">
  <div><h1>Synth Templates · Completeness Tracker</h1><div class="sub">Every template, walked in tier order. Click a row to advance its state. Progress lives in this browser; EXPORT writes a report you can paste to Claude, IMPORT reads one back.</div></div>
  <div class="cell">STUDY · 2026-10-29<br>__N__ TEMPLATES · __F__ FAMILIES · __C__ CONCEPTS</div>
</div>
<div class="toolbar">
  <input type="search" id="q" placeholder="search name / essentials / teaches / concept">
  <button class="btn on" data-view="tier">By tier</button>
  <button class="btn" data-view="family">By family</button>
  <span class="sep"></span>
  <button class="btn on" data-st="all">All</button>
  <button class="btn" data-st="0">Todo</button>
  <button class="btn" data-st="1">Drafted</button>
  <button class="btn" data-st="2">Rendered</button>
  <button class="btn" data-st="3">Verified</button>
  <span class="sep"></span>
  <button class="btn" id="next">Jump to next todo</button>
  <button class="btn" id="theme">Phosphor</button>
</div>
<div class="progress"><div class="bar" id="pbar"></div><div id="ptext"></div></div>
<div class="legend">States: <span class="st"></span><b>todo</b> → <span class="st s1"></span><b>drafted</b> (card written: essentials, taste, diagram) → <span class="st s2"></span><b>rendered</b> (reference audio + sidecar) → <span class="st s3"></span><b>verified</b> (programmed on a real synth and compared by ear). Click a row to advance; shift-click to step back. TIER 1 foundation · 2 core · 3 advanced. Grey line under a template names the concepts from Loudon's notes it covers.</div>
<div class="cov" id="cov"><h2>Coverage of the synthesis notes <span style="font-weight:400;font-size:12px;color:var(--ink-2)" id="covsum"></span></h2><div class="sec" id="covsec"></div></div>
<div id="list"></div>
<div class="export">
  <button class="btn primary" id="copy">Export report</button>
  <button class="btn" id="dl">Download progress.json</button>
  <button class="btn" id="imp">Import progress.json</button><input type="file" id="file" accept="application/json" style="display:none">
  <button class="btn" id="reset">Reset all</button>
  <span id="msg"></span>
  <textarea id="out" readonly></textarea>
</div>
<div class="foot"><div>Synth Templates · workshop</div><div>Drafting Table · Paper</div><div>catalog.json · __N__ rows · __C__ concepts</div></div>
</div></div>
<script>
const DATA=__DATA__; const KEY='synth-templates-progress-v1'; const NAMES=['todo','drafted','rendered','verified'];
let st={}; try{st=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
let view='tier', filt='all', q='', concept=null;
const items=[]; DATA.families.forEach((f,fi)=>f.items.forEach((it,ii)=>items.push({...it,family:f.name,fi,ii})));
const byId=Object.fromEntries(items.map(i=>[i.id,i]));
const S=id=>st[id]|0;
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
function row(it,num){
  const tr=document.createElement('tr'); tr.className='item'; tr.dataset.id=it.id;
  tr.dataset.text=(it.name+' '+it.essentials+' '+it.teaches+' '+it.classics+' '+it.mode+' '+it.family+' '+it.concepts.join(' ')).toLowerCase();
  tr.innerHTML=`<td class="ck"><span class="st"></span></td><td class="num">${num}</td><td class="name">${it.name}${it.classics?`<small>${it.classics}</small>`:''}<small style="color:var(--ink-3)">${view==='tier'?it.family:''}</small></td><td class="mode">${it.mode}</td><td class="ess">${it.essentials}<i>teaches: ${it.teaches}</i>${it.concepts.length?`<u>covers: ${it.concepts.join(' · ')}</u>`:''}</td><td class="tier">${it.tier}</td>`;
  tr.addEventListener('click',e=>{if(window.getSelection().toString())return; st[it.id]=e.shiftKey?Math.max(0,S(it.id)-1):Math.min(3,S(it.id)+1); save(); paint();});
  return tr;
}
function build(){
  const list=document.getElementById('list'); list.innerHTML='';
  if(view==='family'){
    DATA.families.forEach((f,fi)=>{
      const d=document.createElement('div'); d.className='fam'; d.dataset.fam=f.name;
      d.innerHTML=`<div class="famhead"><h2>${f.name}</h2><span class="note">${f.note}</span><span class="n"></span></div><table></table>`;
      const tb=d.querySelector('table'); f.items.forEach((it,ii)=>tb.appendChild(row(byId[it.id],`${fi+1}.${ii+1}`)));
      d.querySelector('h2').addEventListener('click',()=>d.classList.toggle('collapsed'));
      list.appendChild(d);
    });
  } else {
    [1,2,3].forEach(t=>{
      const its=items.filter(i=>i.tier===t);
      const d=document.createElement('div'); d.className='fam'; d.dataset.tier=t;
      d.innerHTML=`<div class="famhead"><h2>Tier ${t} · ${['','foundation','core technique','advanced'][t]}</h2><span class="note">${['','Hear it before you name it: one oscillator, one filter, one envelope, one modulation.','Two of anything, routed on purpose: dual filters, secondary modulation, FM ratios.','Formants, resampling, physical models, followers: the techniques that need the others first.'][t]}</span><span class="n"></span></div><table></table>`;
      const tb=d.querySelector('table'); its.forEach((it,k)=>tb.appendChild(row(it,`${t}.${k+1}`)));
      d.querySelector('h2').addEventListener('click',()=>d.classList.toggle('collapsed'));
      list.appendChild(d);
    });
  }
  const sec=document.getElementById('covsec'); sec.innerHTML='';
  let cur=null;
  DATA.concepts.forEach(c=>{
    if(c.section!==cur){cur=c.section; const h=document.createElement('h3'); h.textContent=cur; sec.appendChild(h);}
    const d=document.createElement('div'); d.className='c'; d.dataset.name=c.name;
    d.innerHTML=`<span class="pg">p.${c.page}</span><div class="bar"></div><span>${c.name}</span><span style="color:var(--ink-3)">(${c.templates.length})</span>`;
    d.addEventListener('click',()=>{concept=concept===c.name?null:c.name; paint();});
    sec.appendChild(d);
  });
  paint();
}
function bar(el,counts,total){const w=k=>(100*counts[k]/total).toFixed(1)+'%';let left=0;el.innerHTML='';[3,2,1].forEach(k=>{const i=document.createElement('i');i.className='s'+k;i.style.left=left+'%';i.style.width=w(k);el.appendChild(i);left+=100*counts[k]/total;});}
function counts(ids){const c=[0,0,0,0];ids.forEach(id=>c[S(id)]++);return c;}
function paint(){
  document.querySelectorAll('tr.item').forEach(tr=>{
    const id=tr.dataset.id, s=S(id), it=byId[id];
    tr.className='item s'+s; tr.querySelector('.st').className='st s'+s;
    const vis=(filt==='all'||String(s)===filt)&&(!q||tr.dataset.text.includes(q))&&(!concept||it.concepts.includes(concept));
    if(!vis) tr.classList.add('hide');
  });
  document.querySelectorAll('.fam').forEach(d=>{
    const ids=[...d.querySelectorAll('tr.item')].map(t=>t.dataset.id); const c=counts(ids);
    d.querySelector('.n').textContent=`${c[3]} verified · ${c[2]} rendered · ${c[1]} drafted · ${c[0]} todo`;
  });
  const all=counts(items.map(i=>i.id)); bar(document.getElementById('pbar'),all,items.length);
  document.getElementById('ptext').textContent=`${all[3]} verified · ${all[2]} rendered · ${all[1]} drafted · ${all[0]} todo of ${items.length}`;
  let covered=0;
  document.querySelectorAll('.cov .c').forEach(d=>{
    const c=DATA.concepts.find(x=>x.name===d.dataset.name); const cc=counts(c.templates); bar(d.querySelector('.bar'),cc,c.templates.length);
    if(cc[3]>0)covered++; d.classList.toggle('on',concept===c.name);
  });
  document.getElementById('covsum').textContent=`· ${covered}/${DATA.concepts.length} concepts have a verified template`+(concept?` · filtering: ${concept}`:'');
  // export text
  let md=`## Synth Templates — progress ${new Date().toISOString().slice(0,10)}\n${all[3]} verified · ${all[2]} rendered · ${all[1]} drafted · ${all[0]} todo of ${items.length}\n`;
  [3,2,1].forEach(k=>{const its=items.filter(i=>S(i.id)===k); if(its.length){md+=`\n### ${NAMES[k]} (${its.length})\n`; its.forEach(i=>md+=`- ${i.name} [${i.family}, tier ${i.tier}]\n`);}});
  const next=items.filter(i=>S(i.id)===0).sort((a,b)=>a.tier-b.tier).slice(0,10); if(next.length){md+=`\n### next up (tier order)\n`; next.forEach(i=>md+=`- ${i.name} [${i.family}, tier ${i.tier}]\n`);}
  document.getElementById('out').value=md+'\n```json\n'+JSON.stringify({progress:st})+'\n```\n';
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('on',x===b));build()}));
document.querySelectorAll('[data-st]').forEach(b=>b.addEventListener('click',()=>{filt=b.dataset.st;document.querySelectorAll('[data-st]').forEach(x=>x.classList.toggle('on',x===b));paint()}));
document.getElementById('q').addEventListener('input',e=>{q=e.target.value.toLowerCase();paint()});
document.getElementById('cov').querySelector('h2').addEventListener('click',()=>document.getElementById('cov').classList.toggle('collapsed'));
document.getElementById('next').addEventListener('click',()=>{const tr=[...document.querySelectorAll('tr.item.s0:not(.hide)')][0]; if(tr){tr.scrollIntoView({behavior:'smooth',block:'center'}); tr.style.outline='2px solid var(--accent)'; setTimeout(()=>tr.style.outline='',1500);}});
document.getElementById('theme').addEventListener('click',e=>{const r=document.documentElement;const p=r.dataset.theme==='paper';r.dataset.theme=p?'phosphor':'paper';e.target.textContent=p?'Paper':'Phosphor'});
document.getElementById('copy').addEventListener('click',async()=>{const t=document.getElementById('out');t.select();try{await navigator.clipboard.writeText(t.value);document.getElementById('msg').textContent='copied — paste it to Claude'}catch(e){document.execCommand('copy');document.getElementById('msg').textContent='selected — press ⌘C'}});
document.getElementById('dl').addEventListener('click',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({progress:st},null,1)],{type:'application/json'}));a.download='progress.json';a.click()});
document.getElementById('imp').addEventListener('click',()=>document.getElementById('file').click());
document.getElementById('file').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const j=JSON.parse(t);st=j.progress||j;save();paint();document.getElementById('msg').textContent='imported'}catch(err){document.getElementById('msg').textContent='not a progress file'}})});
document.getElementById('reset').addEventListener('click',()=>{if(confirm('Reset every template to todo?')){st={};save();paint()}});
build();
</script>
</body></html>'''
html = html.replace("__DATA__", json.dumps(data)).replace("__N__", str(n)).replace("__F__", str(len(data["families"]))).replace("__C__", str(len(data["concepts"])))
open("picker.html","w").write(html)
print("picker.html written:", n, "templates,", len(data["concepts"]), "concepts")
