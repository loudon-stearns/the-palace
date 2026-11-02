#!/usr/bin/env python3
"""Synth Templates — builds site/index.html: the catalog, one page per card, and a Web Audio voice that plays a card's defaults.

usage: python3 build-site.py        (reads catalog.json, vocabulary.yaml, cards/*.yaml and cards/*.svg; writes site/index.html)

One HTML file, no build at runtime, nothing fetched: the cards, the vocabulary and the diagrams are embedded.
Drafting Table paper ground. The voice interprets a card's graph with the vocabulary's numbers; where a word is
missing it falls back and says so in the console.
"""
import json, pathlib, re, yaml

HERE = pathlib.Path(__file__).parent
catalog = json.load(open(HERE / "catalog.json"))
vocab = yaml.safe_load(open(HERE / "vocabulary.yaml"))
cards, svgs = {}, {}
for p in sorted((HERE / "cards").glob("*.yaml")):
    c = yaml.safe_load(open(p)); cards[c["id"]] = c
    svg = HERE / "cards" / f"{c['id']}.svg"
    if svg.exists():
        s = svg.read_text()
        s = re.sub(r"<\?xml[^>]*\?>", "", s)
        s = re.sub(r"<svg ", '<svg class="sheet-svg" ', s, count=1)
        s = re.sub(r'\s(width|height)="[^"]*"', "", s, count=2)
        svgs[c["id"]] = s

HTML = r'''<!doctype html>
<html lang="en" data-theme="paper">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Synth Templates</title>
<style>
:root{--ground-000:#f0eee5;--ground-100:#e6e3d7;--ground-200:#dcd9ca;--ink:#1a1916;--ink-2:#3a3a35;--ink-3:#6a6862;--ink-bright:#000;--rule:#b8b09a;--rule-soft:#cfc9b6;--slab-face:#d8d4c6;--slab-light:#ebe8dd;--slab-shade:#b9b4a3;--accent:#c8261a;--on-accent:#f0eee5;--datasheet:#2b5fb0;--assumed:#a8730a;--ok:#3a7d2c}
*{box-sizing:border-box}
body{margin:0;background:var(--ground-000);color:var(--ink);font:15px/22px 'JetBrains Mono','IBM Plex Mono','SF Mono',Menlo,Consolas,monospace}
a{color:var(--datasheet);text-decoration:none}
.sheet{max-width:1200px;margin:24px auto;padding:0 16px}
.frame{border:2px solid var(--rule);background:var(--ground-000)}
.titleblock{display:grid;grid-template-columns:1fr auto;border-bottom:2px solid var(--rule)}
.titleblock>div{padding:12px}
.titleblock .cell{border-left:1px solid var(--rule);font-size:11px;line-height:16px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-2);white-space:nowrap;text-align:right}
h1{font-size:22px;line-height:26px;font-weight:600;letter-spacing:.04em;margin:0;text-transform:uppercase}
h2{font-size:18px;line-height:24px;font-weight:600;letter-spacing:.04em;margin:0;text-transform:uppercase}
h3{font-size:11px;line-height:16px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-2);margin:0 0 6px;font-weight:500}
.sub{font-size:13px;line-height:18px;color:var(--ink-2);margin-top:4px}
.btn{font:inherit;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:6px 12px;border:1px solid var(--ink);background:var(--slab-face);color:var(--ink);border-radius:0;cursor:pointer;box-shadow:inset 0 1px 0 var(--slab-light),0 1px 0 var(--slab-shade)}
.btn:active{box-shadow:none;transform:translateY(1px)}
.btn.primary{border-color:var(--accent);color:var(--accent)}
.btn.on{background:var(--ink);color:var(--on-accent)}
.toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px;border-bottom:1px solid var(--rule)}
.toolbar input[type=search]{font:inherit;font-size:13px;padding:5px 8px;border:1px solid var(--rule);background:var(--ground-100);color:var(--ink);border-radius:0;min-width:220px}
.count{margin-left:auto;font-size:12px;color:var(--ink-2)}
/* catalog */
.fam{border-bottom:1px solid var(--rule)}
.famhead{display:flex;gap:12px;align-items:baseline;padding:10px 12px;background:var(--ground-100);border-bottom:1px solid var(--rule-soft)}
.famhead .note{font-size:13px;color:var(--ink-2);flex:1}
.famhead .n{font-size:12px;color:var(--ink-3);white-space:nowrap}
table{width:100%;border-collapse:collapse}
tr.item{border-top:1px solid var(--rule-soft)}
tr.item.hide{display:none}
tr.item.has{cursor:pointer}
tr.item.has:hover{background:var(--ground-100)}
td{padding:6px 10px;vertical-align:top;font-size:13px;line-height:18px}
td.name{width:240px;font-weight:600;color:var(--ink-bright)}
tr.item:not(.has) td.name{color:var(--ink-3);font-weight:500}
td.name small{display:block;font-weight:400;color:var(--datasheet);font-size:11px}
td.mode{width:100px;color:var(--ink-2);font-size:11px;letter-spacing:.08em;text-transform:uppercase}
td.ess{color:var(--ink)}
tr.item:not(.has) td.ess{color:var(--ink-3)}
td.ess i{display:block;font-style:normal;color:var(--ink-2);font-size:12px}
td.tier{width:40px;text-align:center;color:var(--assumed);font-weight:600}
td.badge{width:70px;font-size:10px;letter-spacing:.12em;text-transform:uppercase}
td.badge span{border:1px solid var(--ok);color:var(--ok);padding:1px 5px}
/* card page */
.cardhead{display:grid;grid-template-columns:1fr auto;border-bottom:2px solid var(--rule)}
.cardhead>div{padding:12px}
.crumb{font-size:12px;color:var(--ink-2);margin-bottom:4px}
.play{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px;border-bottom:1px solid var(--rule);background:var(--ground-100)}
.play .hint{font-size:12px;color:var(--ink-2)}
.keys{display:flex;gap:2px;padding:12px;border-bottom:1px solid var(--rule);align-items:flex-end}
.key{width:34px;height:70px;border:1px solid var(--ink);background:var(--slab-face);box-shadow:inset 0 1px 0 var(--slab-light),0 1px 0 var(--slab-shade);cursor:pointer;font-size:10px;color:var(--ink-2);display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;user-select:none}
.key.black{background:var(--ink);color:var(--ground-100);height:48px;width:28px;margin:0 -15px;z-index:1;position:relative}
.key.down{background:var(--accent);color:var(--on-accent)}
.diagram{padding:12px;border-bottom:1px solid var(--rule);background:#f0eee5}
.sheet-svg{width:100%;height:auto;display:block}
.two{display:grid;grid-template-columns:1fr 1fr;gap:0}
.two>div{padding:12px}
.two>div+div{border-left:1px solid var(--rule)}
.kv{width:100%;border-collapse:collapse;font-size:13px}
.kv td{padding:4px 6px;border-top:1px solid var(--rule-soft);vertical-align:top}
.kv td.k{color:var(--ink-2);width:150px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding-top:6px}
.kv td.v{font-weight:600;color:var(--ink-bright);width:170px}
.kv.taste td.v{color:var(--assumed)}
.kv td.w{color:var(--ink-2)}
.listen{padding:12px;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
.listen p{margin:4px 0 10px}
.listen textarea{width:100%;min-height:90px;font:13px/18px inherit;font-family:inherit;background:var(--ground-100);color:var(--ink);border:1px solid var(--rule);border-radius:0;padding:8px}
.meta{padding:12px;font-size:12px;color:var(--ink-2)}
.meta b{color:var(--ink)}
.foot{display:grid;grid-template-columns:repeat(3,1fr);border-top:2px solid var(--rule);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-2)}
.foot div{padding:8px 12px;border-left:1px solid var(--rule)}
.foot div:first-child{border-left:0}
.assumed{color:var(--assumed)}
.btn.assumedtab{border-color:var(--assumed);color:var(--assumed)}
.vtable td{padding:6px 10px;border-top:1px solid var(--rule-soft);vertical-align:middle;font-size:13px}
.vtable td.vw{width:180px;font-weight:600;color:var(--ink-bright)}
.vtable td.vs input{width:100%;accent-color:var(--accent)}
.vtable td.vv{width:110px;text-align:right;color:var(--ink-2);font-size:12px;white-space:nowrap}
.vtable td.vp{width:90px;text-align:right}
.export textarea{width:100%;height:120px;font:12px/16px inherit;font-family:inherit;background:var(--ground-100);color:var(--ink);border:1px solid var(--rule);border-radius:0;padding:8px}
@media(max-width:760px){.two{grid-template-columns:1fr}.two>div+div{border-left:0;border-top:1px solid var(--rule)}td.mode,td.tier{display:none}.foot{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="sheet"><div class="frame" id="app"></div></div>
<script>
const CATALOG = __CATALOG__;
const CARDS = __CARDS__;
const SVGS = __SVGS__;
const VOCAB_FILE = __VOCAB__;
const VKEY = 'synth-templates-vocab-v1'; let VOCAB = JSON.parse(JSON.stringify(VOCAB_FILE)); let HEARD = {};
try { const o = JSON.parse(localStorage.getItem(VKEY) || '{}'); for (const t in (o.values||{})) for (const w in o.values[t]) if (VOCAB[t] && w in VOCAB[t]) VOCAB[t][w] = o.values[t][w]; HEARD = o.heard || {}; } catch(e){}
function saveVocab(){ try { localStorage.setItem(VKEY, JSON.stringify({ values: VOCAB, heard: HEARD })); } catch(e){} }
const NCARDS = Object.keys(CARDS).length;

// ---------- reviews (per card, in this browser) ----------
const RKEY = 'synth-templates-reviews-v1'; let reviews = {}; try { reviews = JSON.parse(localStorage.getItem(RKEY) || '{}'); } catch(e){}
function saveReviews(){ try { localStorage.setItem(RKEY, JSON.stringify(reviews)); } catch(e){} }
function exportReviews(){ const ids = Object.keys(reviews).filter(k => reviews[k].trim()); let md = '## Synth Templates — card reviews ' + new Date().toISOString().slice(0,10) + '\n'; ids.forEach(id => md += '\n### ' + (CARDS[id]?.name || id) + ' (' + id + ')\n' + reviews[id].trim() + '\n'); if (!ids.length) md += '\n(no reviews yet)\n'; navigator.clipboard?.writeText(md).then(() => { const el = document.getElementById('revmsg'); if (el) el.textContent = ids.length + ' review' + (ids.length===1?'':'s') + ' copied — paste to Claude'; }); }
// a sounding button fires on the press, like a piano key (Loudon, 2026-11-02), not on the release
function onPress(el, fn){ if (!el) return; let pressed = false; const down = e => { e.preventDefault(); pressed = true; fn(e); }; el.addEventListener('mousedown', down); el.addEventListener('touchstart', down, {passive:false}); el.addEventListener('click', e => { if (pressed) { pressed = false; e.preventDefault(); return; } fn(e); }); }
// ---------- routing ----------
const app = document.getElementById('app');
function route(){ const h = location.hash.replace(/^#\/?/, ''); const m = h.match(/^card\/(.+)$/); if (m && CARDS[m[1]]) renderCard(m[1]); else if (h === 'vocabulary') renderVocab(); else renderCatalog(); window.scrollTo(0,0); }
window.addEventListener('hashchange', route);

// ---------- catalog ----------
let q = '', onlyCards = false;
function renderCatalog(){
  stopAll();
  const fams = CATALOG.families.map((f, fi) => `
    <div class="fam"><div class="famhead"><h2>${f.name}</h2><span class="note">${f.note}</span><span class="n">${f.items.filter(i=>CARDS[i.id]).length}/${f.items.length} cards</span></div>
    <table>${f.items.map(it => `<tr class="item ${CARDS[it.id]?'has':''}" data-id="${it.id}" data-text="${(it.name+' '+it.essentials+' '+it.teaches+' '+it.classics+' '+f.name).toLowerCase().replace(/"/g,'')}">
      <td class="name">${it.name}${it.classics?`<small>${it.classics}</small>`:''}</td><td class="mode">${it.mode}</td>
      <td class="ess">${it.essentials}<i>teaches: ${it.teaches}</i></td><td class="tier">${it.tier}</td>
      <td class="badge">${CARDS[it.id]?'<span>card</span>':''}</td></tr>`).join('')}</table></div>`).join('');
  app.innerHTML = `
    <div class="titleblock"><div><h1>Synth Templates</h1><div class="sub">A catalog of base presets that teach synthesis. Pick one that has a card to see its sheet and play it at its default settings.</div></div>
    <div class="cell">STUDY · 2026-11-02<br>${CATALOG.families.reduce((n,f)=>n+f.items.length,0)} TEMPLATES · ${NCARDS} CARDS</div></div>
    <div class="toolbar"><input type="search" id="q" placeholder="search" value="${q}"><button class="btn ${onlyCards?'on':''}" id="onlycards">With cards</button><button class="btn" id="exportrev">Export reviews</button><a class="btn" href="#/vocabulary" style="display:inline-block">Vocabulary</a><span id="revmsg" style="font-size:12px;color:var(--ok)"></span><span class="count" id="count"></span></div>
    ${fams}
    <div class="foot"><div>Synth Templates · workshop</div><div>Drafting Table · Paper</div><div>built from cards/*.yaml</div></div>`;
  document.getElementById('q').addEventListener('input', e => { q = e.target.value.toLowerCase(); filter(); });
  document.getElementById('exportrev').addEventListener('click', exportReviews);
  document.getElementById('onlycards').addEventListener('click', e => { onlyCards = !onlyCards; e.target.classList.toggle('on', onlyCards); filter(); });
  document.querySelectorAll('tr.item.has').forEach(tr => tr.addEventListener('click', () => location.hash = '#/card/' + tr.dataset.id));
  filter();
}
function filter(){ let n = 0; document.querySelectorAll('tr.item').forEach(tr => { const vis = (!q || tr.dataset.text.includes(q)) && (!onlyCards || tr.classList.contains('has')); tr.classList.toggle('hide', !vis); if (vis) n++; }); document.getElementById('count').textContent = n + ' shown'; }

// ---------- card page ----------
const BLOCKNAME = {osc1:'Oscillator 1', osc2:'Oscillator 2', sub:'Sub oscillator', noise:'Noise oscillator', mix:'Mixer', filter1:'Filter 1', filter2:'Filter 2', amp:'Amplifier', fx:'Effects', fenv:'Filter envelope', aenv:'Amplitude envelope', menv:'Modulation envelope', lfo1:'LFO 1', lfo2:'LFO 2', key:'Keyboard', vel:'Velocity', wheel:'Mod wheel', at:'Aftertouch', mode:'Voice mode'};
const PARAMNAME = {attack:'Attack time', decay:'Decay time', sustain:'Sustain level', release:'Release time', cutoff:'Cutoff frequency', resonance:'Resonance', amount:'Envelope amount', wave:'Waveform', glide:'Glide time', level:'Level', pw:'Pulse width', unison:'Unison voices', detune:'Detune', spread:'Stereo spread', drive:'Drive', type:'Filter type', voices:'Voices', retrigger:'Oscillator retrigger', ratio:'Frequency ratio', rate:'Rate', depth:'Depth', chain:'Effects chain', reverb:'Reverb size', chorus:'Chorus depth', pitch:'Pitch', mode:'Trigger mode', target:'Target', routing:'Routing', accent:'Accent'};
function blockName(c, b){ if (b === 'menv' && c.graph?.blocks?.menv?.role) return c.graph.blocks.menv.role.charAt(0).toUpperCase() + c.graph.blocks.menv.role.slice(1) + ' envelope'; return BLOCKNAME[b] || b; }
function paramName(p){ return PARAMNAME[p] || p; }
function esc(s){ return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
function renderCard(id){
  stopAll();
  const c = CARDS[id];
  const kv = (rows, cls) => `<table class="kv ${cls}">${rows.map(r => `<tr><td class="k">${esc(blockName(c, r.block))}</td><td class="v">${esc(paramName(r.param))}<br>${esc(r.value ?? r.range)}${r.default!==undefined?`<br><span style="font-weight:400;font-size:11px">default ${esc(r.default)}</span>`:''}</td><td class="w">${esc(r.why||'')}</td></tr>`).join('')}</table>`;
  const notes = Array.isArray(c.render?.note) ? c.render.note.join(' ') : (c.render?.note || '');
  app.innerHTML = `
    <div class="cardhead"><div><div class="crumb"><a href="#/">← catalog</a> · ${esc(c.family)}</div><h1>${esc(c.name)}</h1><div class="sub">${esc(c.classics||'')}</div></div>
    <div class="cell" style="border-left:1px solid var(--rule);padding:12px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-2);text-align:right">tier ${c.tier} · ${esc(c.mode)}<br>${esc(c.status)} · schema ${esc(c.schema.split('/')[1])}</div></div>
    <div class="play"><button class="btn primary" id="demo">▶ Play the default</button><button class="btn" id="stop">Stop</button><span class="hint">Plays the card's render pattern (${esc(notes)} at ${c.render?.tempo||120} bpm) on the reference voice, from the card's own settings and the vocabulary draft. <span class="assumed">Vocabulary numbers are ASSUMED until sat by ear.</span></span></div>
    <div class="keys" id="keys"></div>
    <div class="play" style="background:none"><span class="hint" id="midi">MIDI: …</span></div>
    <div class="diagram">${SVGS[id] || '<div class="sub">no sheet rendered for this card</div>'}</div>
    <div class="two"><div><h3>Essentials · what makes it this sound</h3>${kv(c.essentials||[], 'ess')}</div><div><h3>Taste · what you move</h3>${kv(c.taste||[], 'taste')}</div></div>
    <div class="listen"><h3>Listening</h3><p>${esc(c.listening?.cue)}</p><h3>A / B</h3><p>${esc(c.listening?.ab)}</p></div>
    <div class="listen"><h3>Review · notes for fine-tuning this card</h3><textarea id="review" placeholder="What is wrong, what is missing, what to change. Saved in this browser; export all reviews from the catalog page.">${esc(reviews[c.id]||'')}</textarea></div>
    <div class="meta">${c.concepts?.length?`<b>Covers:</b> ${c.concepts.map(esc).join(' · ')}<br>`:''}${c.lineage?.length?`<b>Lineage:</b> ${c.lineage.map(esc).join(' · ')}<br>`:''}<b>Render:</b> ${esc(c.render?.pattern||'')}</div>
    <div class="foot"><div>Synth Templates · ${esc(c.id)}</div><div>Drafting Table · Paper</div><div>cards/${esc(c.id)}.yaml</div></div>`;
  onPress(document.getElementById('demo'), () => playDemo(c));
  document.getElementById('review').addEventListener('input', e => { reviews[c.id] = e.target.value; saveReviews(); });
  midiStatus();
  document.getElementById('stop').addEventListener('click', stopAll);
  buildKeys(c);
}

// ---------- vocabulary page ----------
// each table: what the word controls, how to hear it on a plain patch, and the slider's range
const VTABLES = {
  time:        { title: 'Time · envelope stages', what: 'One table of seconds, used for attack, decay and release times. Choose which stage to hear: every note is then the same length and only that one stage changes from rung to rung.', range: [0.001, 5], log: true, unit: 's', modes: { attack: 'As attack: the note rises over this time, holds at full for 1.5 s, then stops quickly.', decay: 'As decay: instant attack, then falls to silence over this time (a percussive shape, sustain zero).', release: 'As release: instant attack, holds at full for 0.8 s, then after the key is lifted fades over this time.' } },
  level:       { title: 'Level · gains and sustain', what: 'Linear gain, 0 to 1: mixer inputs, amplifier level, sustain level. The demo plays a plain saw at this gain beside a full-level reference.', range: [0, 1], log: false, unit: '' },
  cutoff:      { title: 'Cutoff frequency · resting low-pass', what: 'Where the low-pass sits at rest, in hertz at middle C (half keytracking elsewhere). The demo holds a saw at C3 through a 24 dB low-pass at this frequency.', range: [40, 16000], log: true, unit: 'Hz' },
  resonance:   { title: 'Resonance · filter Q', what: 'The boost at the cutoff. The demo sweeps a 24 dB low-pass slowly down through a saw at this Q.', range: [0.5, 40], log: true, unit: 'Q' },
  amount:      { title: 'Envelope amount · octaves of filter sweep', what: 'How far the filter envelope opens the cutoff above its resting point, in octaves. The demo plucks a saw: cutoff dark, instant attack, medium decay, this amount.', range: [0, 7], log: false, unit: 'oct' },
  pitch_amount:{ title: 'Pitch envelope amount · cents', what: 'How far a pitch envelope starts above the note. The demo is a kick-shaped sine: this many cents, falling over a short decay.', range: [0, 3600], log: false, unit: 'c' },
  detune:      { title: 'Detune · unison spread in cents', what: 'The total spread of a seven-voice saw stack. The demo holds the stack at C3.', range: [0, 120], log: false, unit: 'c' },
  rate:        { title: 'Rate · LFO speed', what: 'LFO frequency in hertz. The demo puts a triangle LFO at this rate on the cutoff of a held saw.', range: [0.03, 30], log: true, unit: 'Hz' },
  glide:       { title: 'Glide time · portamento', what: 'Seconds to slide from one note to the next. The demo plays C2 then slides to G2 in this time.', range: [0, 1.5], log: false, unit: 's' },
  drive:       { title: 'Drive · saturation amount', what: '0 to 1 into a soft clipper. The demo holds a saw through it.', range: [0, 1], log: false, unit: '' },
  fm_index:    { title: 'FM index · modulator level', what: 'Modulation depth as a multiple of the modulator frequency (1:1 ratio). The demo plays a sine carrier at C3 with this index.', range: [0, 15], log: false, unit: '' },
  reverb:      { title: 'Reverb · decay seconds', what: 'The tail length. The demo plucks a saw into a reverb of this size.', range: [0.2, 10], log: true, unit: 's' },
};
let vtab = 'time'; let vmode = { time: 'attack' };
function fmtNum(v, t){ if (v === null || v === undefined) return '—'; const r = VTABLES[t]; if (!r) return v; if (r.unit === 'Hz') return v >= 1000 ? (v/1000).toFixed(2)+' kHz' : (v < 1 ? v.toFixed(2) : Math.round(v)) + ' Hz'; if (r.unit === 's') return v < 0.1 ? Math.round(v*1000)+' ms' : v.toFixed(2)+' s'; if (r.unit === 'c') return Math.round(v)+' c'; return (+v).toFixed(2); }
function toSlider(v, r){ const [a,b] = r.range; if (r.log) return (Math.log(Math.max(v, a)) - Math.log(a)) / (Math.log(b) - Math.log(a)) * 1000; return (v - a) / (b - a) * 1000; }
function fromSlider(x, r){ const [a,b] = r.range; if (r.log) return Math.exp(Math.log(a) + x/1000 * (Math.log(b) - Math.log(a))); return a + x/1000 * (b - a); }
function renderVocab(){
  stopAll();
  const tabs = Object.keys(VTABLES).map(t => `<button class="btn ${t===vtab?'on':''} ${HEARD[t]?'':'assumedtab'}" data-vt="${t}">${t.replace('_',' ')}${HEARD[t]?' ✓':''}</button>`).join('');
  const T = VTABLES[vtab]; const words = Object.keys(VOCAB[vtab]);
  const rows = words.map(w => { const v = VOCAB[vtab][w]; const fixed = v === null;
    return `<tr class="vrow" data-w="${w}"><td class="vw">${esc(w)}</td>
      <td class="vs">${fixed ? '<span class="sub">resolved from decay</span>' : `<input type="range" min="0" max="1000" value="${toSlider(v, T).toFixed(0)}" data-w="${w}">`}</td>
      <td class="vv" id="vv-${w.replace(/\W/g,'_')}">${fmtNum(v, vtab)}${v !== null && VOCAB_FILE[vtab][w] !== v ? ' <span class="assumed">·</span>' : ''}</td>
      <td class="vp">${fixed ? '' : `<button class="btn" data-play="${w}">▶ hear</button>`}</td></tr>`; }).join('');
  app.innerHTML = `
    <div class="cardhead"><div><div class="crumb"><a href="#/">← catalog</a></div><h1>Vocabulary</h1><div class="sub">Every range word the cards use, and the number the reference voice gives it. Draft numbers are set by reasoning; a table is earned when you have heard each rung and moved it until the word is true. Edits live in this browser until exported.</div></div>
    <div class="cell" style="border-left:1px solid var(--rule);padding:12px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-2);text-align:right">${Object.keys(VTABLES).length} tables<br>${Object.values(HEARD).filter(Boolean).length} heard</div></div>
    <div class="toolbar">${tabs}</div>
    <div class="play"><h3 style="margin:0">${esc(T.title)}</h3><span class="hint">${esc(T.what)}</span></div>
    ${T.modes ? `<div class="play" style="background:none;padding-top:0"><span class="hint" style="margin-right:4px">hear each word</span>${Object.keys(T.modes).map(m => `<button class="btn ${vmode[vtab]===m?'on':''}" data-mode="${m}">as ${m}</button>`).join('')}<span class="hint" id="modewhat">${esc(T.modes[vmode[vtab]])}</span></div>` : ''}
    <div class="play" style="background:none"><button class="btn primary" id="ladder">▶ Play the ladder</button><button class="btn" id="stop">Stop</button><label class="hint" style="margin-left:12px"><input type="checkbox" id="heard" ${HEARD[vtab]?'checked':''}> this table is heard: the words are true</label></div>
    <table class="vtable">${rows}</table>
    <div class="export"><button class="btn primary" id="exportv">Export vocabulary.yaml</button><button class="btn" id="resetv">Reset this table to the file</button><span id="vmsg" style="font-size:12px;color:var(--ok);margin-left:8px"></span>
    <textarea id="vout" readonly style="margin-top:8px"></textarea></div>
    <div class="foot"><div>Synth Templates · vocabulary</div><div>Drafting Table · Paper</div><div>workshop/vocabulary.yaml</div></div>`;
  document.querySelectorAll('[data-vt]').forEach(b => b.addEventListener('click', () => { vtab = b.dataset.vt; renderVocab(); }));
  document.querySelectorAll('input[type=range]').forEach(sl => sl.addEventListener('input', e => { const w = e.target.dataset.w; VOCAB[vtab][w] = +fromSlider(+e.target.value, T).toPrecision(3); document.getElementById('vv-' + w.replace(/\W/g,'_')).innerHTML = fmtNum(VOCAB[vtab][w], vtab) + ' <span class="assumed">·</span>'; saveVocab(); }));
  document.querySelectorAll('input[type=range]').forEach(sl => sl.addEventListener('change', e => hearWord(vtab, e.target.dataset.w)));
  document.querySelectorAll('[data-play]').forEach(b => onPress(b, () => { stopAll(); hearWord(vtab, b.dataset.play); }));
  onPress(document.getElementById('ladder'), () => playLadder(vtab));
  document.getElementById('stop').addEventListener('click', stopAll);
  document.getElementById('heard').addEventListener('change', e => { HEARD[vtab] = e.target.checked; saveVocab(); renderVocab(); });
  document.getElementById('exportv').addEventListener('click', () => { const y = vocabYaml(); document.getElementById('vout').value = y; navigator.clipboard?.writeText(y).then(() => document.getElementById('vmsg').textContent = 'copied — paste to Claude, who writes vocabulary.yaml'); });
  document.getElementById('resetv').addEventListener('click', () => { VOCAB[vtab] = JSON.parse(JSON.stringify(VOCAB_FILE[vtab])); HEARD[vtab] = false; saveVocab(); renderVocab(); });
}
function vocabYaml(){
  const today = new Date().toISOString().slice(0,10);
  let y = `# Synth Templates — range vocabulary, exported from the site ${today}\n# A table marked HEARD was sat by ear on the site's reference voice; a table marked ASSUMED still carries numbers set by reasoning.\n`;
  for (const t of Object.keys(VOCAB)){ y += `${t}:   # ${HEARD[t] ? 'HEARD ' + today : 'ASSUMED'}\n`; for (const w of Object.keys(VOCAB[t])){ const v = VOCAB[t][w]; y += `  ${/[^a-z0-9 _-]/.test(w) || /^(on|off|yes|no)$/.test(w) ? JSON.stringify(w) : w}: ${v === null ? 'null' : v}\n`; } }
  return y;
}
// ---------- rung demos: a plain patch that exposes one word ----------
let demoNodes = [];
function demoGraph(){ const ac = audio(); const g = ac.createGain(); g.gain.value = 0.5; g.connect(master); demoNodes.push(g); return { ac, out: g }; }
function saw(ac, hz, t, type){ const o = ac.createOscillator(); o.type = type || 'sawtooth'; o.frequency.value = hz; o.start(t); demoNodes.push(o); return o; }
function lp(ac, hz, q, poles){ const stages = []; for (let i = 0; i < (poles||2); i++){ const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = hz; f.Q.value = i ? 0.7 : q; stages.push(f); demoNodes.push(f); } for (let i = 1; i < stages.length; i++) stages[i-1].connect(stages[i]); return { input: stages[0], output: stages[stages.length-1], stages }; }
function env(param, t, a, d, s, r, hold, peak, base){ base = base || 0; param.setValueAtTime(base, t); param.linearRampToValueAtTime(peak, t + a); param.linearRampToValueAtTime(base + (peak - base) * s, t + a + d); const off = t + Math.max(a + d, hold); param.setTargetAtTime(base, off, Math.max(r, 0.02) / 3); return off + r * 2 + 0.1; }
let activeDemos = [];   // every demo still sounding: {nodes, end}; Stop can always reach them
function stopDemo(t){
  // called by a demo once it is built: take its nodes off the build list, stop them at its end, remember it until then
  const nodes = demoNodes; demoNodes = []; const d = { nodes, end: t }; activeDemos.push(d);
  for (const n of nodes){ try { if (n.stop) n.stop(t); } catch(e){} }
  setTimeout(() => { for (const n of nodes){ try { n.disconnect(); } catch(e){} } activeDemos = activeDemos.filter(x => x !== d); }, Math.max(0, (t - (ctx?.currentTime||0)) * 1000) + 300);
}
function stopDemosNow(){
  const now = ctx ? ctx.currentTime : 0;
  for (const d of activeDemos){ for (const n of d.nodes){ try { if (n.stop) n.stop(now); } catch(e){} } }
  setTimeout(() => { for (const d of activeDemos){ for (const n of d.nodes){ try { n.disconnect(); } catch(e){} } } activeDemos = []; }, 50);
  for (const n of demoNodes){ try { if (n.stop) n.stop(now); n.disconnect(); } catch(e){} } demoNodes = [];
}
function hearWord(table, w, when){
  const v = VOCAB[table][w]; if (v === null) return 0;
  const { ac, out } = demoGraph(); const t = when ?? ac.currentTime + 0.03; const C3 = noteToHz(48), C2 = noteToHz(36); let end = t + 1.5;
  if (table === 'time'){ const o = saw(ac, C3, t); const f = lp(ac, 2500, 0.7); const g = ac.createGain(); o.connect(f.input); f.output.connect(g); g.connect(out); const m = vmode.time || 'attack';
    if (m === 'attack')  end = env(g.gain, t, v, 0.001, 1, 0.05, v + 1.5, 0.6);        // rise over v, hold 1.5 s, quick stop
    else if (m === 'decay') end = env(g.gain, t, 0.002, v, 0, 0.05, 0.002, 0.6);         // instant on, fall over v to silence
    else                  end = env(g.gain, t, 0.002, 0.001, 1, v, 0.8, 0.6);             // instant on, hold 0.8 s, fade over v
    end = Math.max(end, t + 0.8 + v * 2 + 0.3); }
  else if (table === 'level'){ const o = saw(ac, C3, t); const f = lp(ac, 1500, 0.7); const g = ac.createGain(); o.connect(f.input); f.output.connect(g); g.connect(out); end = env(g.gain, t, 0.01, 0.001, 1, 0.08, 0.9, 0.6 * v); }
  else if (table === 'cutoff'){ const o = saw(ac, C3, t); const f = lp(ac, v, 1.0); const g = ac.createGain(); o.connect(f.input); f.output.connect(g); g.connect(out); end = env(g.gain, t, 0.01, 0.001, 1, 0.1, 1.2, 0.6); }
  else if (table === 'resonance'){ const o = saw(ac, C2, t); const f = lp(ac, 4000, v); const g = ac.createGain(); o.connect(f.input); f.output.connect(g); g.connect(out); f.stages.forEach(s => { s.frequency.setValueAtTime(4000, t); s.frequency.exponentialRampToValueAtTime(150, t + 1.6); }); end = env(g.gain, t, 0.01, 0.001, 1, 0.1, 1.7, 0.4 / Math.sqrt(Math.max(v, 1))); }
  else if (table === 'amount'){ const o = saw(ac, C2, t); const f = lp(ac, 300, 3); const g = ac.createGain(); o.connect(f.input); f.output.connect(g); g.connect(out); f.stages.forEach(s => { s.frequency.setValueAtTime(300, t); s.frequency.exponentialRampToValueAtTime(Math.min(300 * Math.pow(2, v), 18000), t + 0.005); s.frequency.exponentialRampToValueAtTime(300, t + 0.4); }); end = env(g.gain, t, 0.003, 0.001, 1, 0.2, 0.8, 0.6); }
  else if (table === 'pitch_amount'){ const o = saw(ac, noteToHz(33), t, 'sine'); const g = ac.createGain(); o.connect(g); g.connect(out); o.detune.setValueAtTime(v, t); o.detune.linearRampToValueAtTime(0, t + 0.12); end = env(g.gain, t, 0.002, 0.6, 0, 0.3, 0.6, 0.8); }
  else if (table === 'detune'){ const g = ac.createGain(); g.gain.value = 0; for (let i = 0; i < 7; i++){ const o = saw(ac, C3, t); o.detune.value = (i/6 - 0.5) * v; const gg = ac.createGain(); gg.gain.value = 1/Math.sqrt(7); o.connect(gg); gg.connect(g); } const f = lp(ac, 3000, 0.7); g.connect(f.input); f.output.connect(out); end = env(g.gain, t, 0.01, 0.001, 1, 0.15, 1.6, 0.6); }
  else if (table === 'rate'){ const o = saw(ac, C2, t); const f = lp(ac, 700, 4); const g = ac.createGain(); o.connect(f.input); f.output.connect(g); g.connect(out); const l = ac.createOscillator(); l.type = 'triangle'; l.frequency.value = v; const lg = ac.createGain(); lg.gain.value = 1800; l.connect(lg); f.stages.forEach(s => lg.connect(s.detune)); l.start(t); demoNodes.push(l, lg); end = env(g.gain, t, 0.01, 0.001, 1, 0.1, 2.2, 0.5); }
  else if (table === 'glide'){ const o = saw(ac, C2, t); const f = lp(ac, 1200, 1); const g = ac.createGain(); o.connect(f.input); f.output.connect(g); g.connect(out); o.frequency.setValueAtTime(C2, t + 0.5); o.frequency.exponentialRampToValueAtTime(noteToHz(43), t + 0.5 + Math.max(v, 0.003)); end = env(g.gain, t, 0.01, 0.001, 1, 0.1, 1.6, 0.6); }
  else if (table === 'drive'){ const o = saw(ac, C2, t); const f = lp(ac, 1200, 1); const ws = ac.createWaveShaper(); const n = 1024, curve = new Float32Array(n), k = 1 + v * 20; for (let i = 0; i < n; i++){ const x = i/(n-1)*2-1; curve[i] = Math.tanh(k*x)/Math.tanh(k); } ws.curve = curve; const pre = ac.createGain(); pre.gain.value = 1 + v*2; const g = ac.createGain(); o.connect(f.input); f.output.connect(pre); pre.connect(ws); ws.connect(g); g.connect(out); demoNodes.push(ws, pre); end = env(g.gain, t, 0.01, 0.001, 1, 0.1, 1.2, 0.5); }
  else if (table === 'fm_index'){ const car = saw(ac, C3, t, 'sine'); const mod = saw(ac, C3, t, 'sine'); const mg = ac.createGain(); mg.gain.value = v * C3; mod.connect(mg); mg.connect(car.frequency); const g = ac.createGain(); car.connect(g); g.connect(out); demoNodes.push(mg); end = env(g.gain, t, 0.005, 0.001, 1, 0.3, 1.2, 0.5); }
  else if (table === 'reverb'){ const o = saw(ac, C3, t); const f = lp(ac, 2000, 2); const g = ac.createGain(); o.connect(f.input); f.output.connect(g); const conv = ac.createConvolver(); const len = Math.floor(ac.sampleRate * v), ir = ac.createBuffer(2, len, ac.sampleRate); for (let ch = 0; ch < 2; ch++){ const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2.2); } conv.buffer = ir; const wet = ac.createGain(); wet.gain.value = 0.5; g.connect(out); g.connect(conv); conv.connect(wet); wet.connect(out); demoNodes.push(conv, wet); f.stages.forEach(s => { s.frequency.setValueAtTime(4000, t); s.frequency.exponentialRampToValueAtTime(300, t + 0.3); }); end = env(g.gain, t, 0.003, 0.4, 0, 0.2, 0.4, 0.6) + v; }
  stopDemo(end); return end - t;
}
function playLadder(table){ stopAll(); const ac = audio(); let t = ac.currentTime + 0.05; for (const w of Object.keys(VOCAB[table])){ if (VOCAB[table][w] === null) continue; const d = hearWord(table, w, t); const row = document.querySelector(`tr.vrow[data-w="${w}"]`); demoTimers.push(setTimeout(() => { document.querySelectorAll('tr.vrow').forEach(r => r.style.background = ''); if (row) row.style.background = 'var(--ground-100)'; }, (t - ac.currentTime) * 1000)); t += d + 0.25; } demoTimers.push(setTimeout(() => document.querySelectorAll('tr.vrow').forEach(r => r.style.background = ''), (t - ac.currentTime) * 1000)); }
// ---------- keyboard ----------
const KEYNAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function buildKeys(c){
  const el = document.getElementById('keys'); el.innerHTML = '';
  const base = c.family === 'Bass' ? 36 : c.family === 'Drums and Percussion' ? 45 : 60;   // C2, A2, or C4
  for (let n = base; n <= base + 24; n++){
    const k = document.createElement('div'); const black = [1,3,6,8,10].includes(n % 12);
    k.className = 'key' + (black ? ' black' : '');
    const down = e => { e.preventDefault(); k.classList.add('down'); noteOn(c, n, 100, 'key' + n); };
    const up = () => { k.classList.remove('down'); noteOff('key' + n); };
    k.addEventListener('mousedown', down); k.addEventListener('mouseup', up); k.addEventListener('mouseleave', up);
    k.addEventListener('touchstart', down, {passive:false}); k.addEventListener('touchend', up);
    el.appendChild(k);
  }
}

// ---------- MIDI ----------
let midi = null, midiCard = null;
function midiStatus(){
  const el = document.getElementById('midi'); if (!el) return;
  midiCard = CARDS[location.hash.replace(/^#\/card\//, '')] || null;
  if (!navigator.requestMIDIAccess){ el.textContent = 'MIDI: not available in this browser'; return; }
  if (midi){ const names = [...midi.inputs.values()].map(i => i.name); el.textContent = names.length ? 'MIDI: listening on ' + names.join(', ') : 'MIDI: no input connected'; return; }
  el.textContent = 'MIDI: requesting access…';
  navigator.requestMIDIAccess().then(m => { midi = m; const bind = () => { for (const inp of midi.inputs.values()) inp.onmidimessage = onMidi; midiStatus(); }; midi.onstatechange = bind; bind(); }, () => { el.textContent = 'MIDI: access refused'; });
}
function onMidi(e){
  const [st, d1, d2] = e.data; const cmd = st & 0xf0; if (!midiCard) return;
  if (cmd === 0x90 && d2 > 0) noteOn(midiCard, d1, Math.round(d2 / 127 * 100), 'midi' + d1);
  else if (cmd === 0x80 || (cmd === 0x90 && d2 === 0)) noteOff('midi' + d1);
  else if (cmd === 0xb0 && d1 === 123) stopAll();
}
// ---------- vocabulary ----------
function word(table, w, fallback){ if (w === undefined || w === null) return fallback; if (typeof w === 'number') return w; const v = VOCAB[table]?.[String(w).trim()]; if (v === undefined || v === null) { console.warn(`vocabulary: no ${table} word "${w}", using ${fallback}`); return fallback; } return v; }
function noteToHz(n){ return 440 * Math.pow(2, (n - 69) / 12); }
function nameToMidi(s){ const m = String(s).match(/^([A-Ga-g])([#b]?)(-?\d)$/); if (!m) return 60; let n = {c:0,d:2,e:4,f:5,g:7,a:9,b:11}[m[1].toLowerCase()]; if (m[2]==='#') n++; if (m[2]==='b') n--; return n + 12 * (parseInt(m[3]) + 1); }

// ---------- the reference voice ----------
let ctx = null, master = null, fxOut = null, fxCardId = null;
const voices = new Map();   // id → voice
let monoVoice = null, heldMono = [];
function audio(){ if (!ctx){ ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.5; const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -12; master.connect(comp); comp.connect(ctx.destination); } if (ctx.state === 'suspended') ctx.resume(); return ctx; }

function fxChain(c){
  // built once per card: the fx block's chain, in order, feeding master
  if (fxCardId === c.id && fxOut) return fxOut;
  if (fxOut) { try { fxOut.disconnect(); } catch(e){} }
  const ac = audio(); let input = ac.createGain(); let node = input;
  const chain = c.graph.blocks.fx?.chain || [];
  const tasteDefault = (block, param) => (c.taste||[]).find(t => t.block===block && t.param===param)?.default;
  for (const fx of chain){
    if (fx === 'chorus'){
      const wet = ac.createGain(); wet.gain.value = 0.5; const dry = ac.createGain(); dry.gain.value = 0.8;
      const merger = ac.createGain(); node.connect(dry); dry.connect(merger);
      [[0.012, 0.6, -0.6], [0.018, 0.75, 0.6], [0.025, 0.5, 0]].forEach(([t, rate, pan]) => {
        const d = ac.createDelay(0.1); d.delayTime.value = t; const lfo = ac.createOscillator(); lfo.frequency.value = rate; const g = ac.createGain(); g.gain.value = 0.003; lfo.connect(g); g.connect(d.delayTime); lfo.start();
        const p = ac.createStereoPanner(); p.pan.value = pan; node.connect(d); d.connect(p); p.connect(wet); });
      wet.connect(merger); node = merger;
    } else if (fx === 'reverb'){
      const size = word('reverb', tasteDefault('fx','reverb') || 'large', 2.5);
      const conv = ac.createConvolver(); const len = Math.floor(ac.sampleRate * size); const ir = ac.createBuffer(2, len, ac.sampleRate);
      for (let ch = 0; ch < 2; ch++){ const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2.2); }
      conv.buffer = ir; const wet = ac.createGain(); wet.gain.value = 0.35; const dry = ac.createGain(); dry.gain.value = 0.9; const merger = ac.createGain();
      node.connect(dry); dry.connect(merger); node.connect(conv); conv.connect(wet); wet.connect(merger); node = merger;
    } else if (['saturation','drive','distortion','overdrive'].includes(fx)){
      const amt = word('drive', tasteDefault('fx','drive') || 'light', 0.25); const ws = ac.createWaveShaper(); const n = 1024, curve = new Float32Array(n); const k = 1 + amt * 20;
      for (let i = 0; i < n; i++){ const x = i / (n-1) * 2 - 1; curve[i] = Math.tanh(k * x) / Math.tanh(k); } ws.curve = curve; ws.oversample = '2x';
      const pre = ac.createGain(); pre.gain.value = 1 + amt * 2; const post = ac.createGain(); post.gain.value = 0.7; node.connect(pre); pre.connect(ws); ws.connect(post); node = post;
    } else if (fx === 'delay' || fx === 'echo'){
      const d = ac.createDelay(2); d.delayTime.value = 60 / (c.render?.tempo || 120) * 0.75; const fb = ac.createGain(); fb.gain.value = 0.35; const wet = ac.createGain(); wet.gain.value = 0.3; const merger = ac.createGain();
      node.connect(merger); node.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(merger); node = merger;
    }
  }
  node.connect(master); fxOut = input; fxCardId = c.id; return input;
}

function makeOsc(ac, b, hz, t){
  // one source block → {node (output gain), oscs[], gainParam}; unison fans out detuned copies
  const out = ac.createGain(); const wave = b.wave || 'saw'; const oscs = [];
  const n = Math.max(1, parseInt(b.unison) || 1); const spread = word('detune', b.detune, n > 1 ? 30 : 0);
  if (wave === 'noise'){
    const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random()*2-1;
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(out); src.start(t); oscs.push(src); return { node: out, oscs, freqParams: [] };
  }
  const type = { saw: 'sawtooth', square: 'square', pulse: 'square', triangle: 'triangle', sine: 'sine' }[wave] || 'sawtooth';
  const freqParams = [];
  for (let i = 0; i < n; i++){
    const o = ac.createOscillator(); o.type = type; o.frequency.value = hz * Math.pow(2, (b.octave || 0));
    const cents = n > 1 ? (i / (n-1) - 0.5) * spread : 0; o.detune.value = cents;
    const g = ac.createGain(); g.gain.value = 1 / Math.sqrt(n); const p = ac.createStereoPanner(); p.pan.value = n > 1 ? (i / (n-1) - 0.5) * 1.4 : 0;
    o.connect(g); g.connect(p); p.connect(out); o.start(t); oscs.push(o); freqParams.push(o);
  }
  return { node: out, oscs, freqParams };
}

function envTimes(shape){ const a = word('time', shape?.a, 0.01), d = word('time', shape?.d, 0.3), s = word('level', shape?.s, 0.7); let r = shape?.r === 'same as decay' ? d : word('time', shape?.r, 0.2); return { a, d, s, r }; }
function applyEnv(param, t, env, peak, base, exp){
  // base → peak over a, → base + (peak-base)*s over d
  const lo = exp ? Math.max(base, 1e-3) : base;
  param.cancelScheduledValues(t); param.setValueAtTime(lo, t);
  if (exp) { param.exponentialRampToValueAtTime(Math.max(peak, 1e-3), t + env.a); param.exponentialRampToValueAtTime(Math.max(lo + (peak - lo) * env.s, 1e-3), t + env.a + env.d); }
  else { param.linearRampToValueAtTime(peak, t + env.a); param.linearRampToValueAtTime(lo + (peak - lo) * env.s, t + env.a + env.d); }
}
function releaseEnv(param, t, env, base, exp){ param.cancelAndHoldAtTime ? param.cancelAndHoldAtTime(t) : param.cancelScheduledValues(t); const tc = Math.max(env.r, 0.02) / 3; param.setTargetAtTime(exp ? Math.max(base, 1e-3) : base, t, tc); }

function noteOn(c, midi, vel, id, when){
  const ac = audio(); const t = when ?? ac.currentTime; const B = c.graph.blocks; const mods = c.graph.modulation || [];
  const velScale = (vel || 100) / 100;
  const mono = /mono/.test(c.mode);
  const legato = /legato/.test(c.mode) && monoVoice && heldMono.length > 0;
  if (mono && monoVoice && !legato){ voiceOff(monoVoice, t); monoVoice = null; }
  if (mono && legato){
    // slide: retune the running voice, no new envelopes
    const glide = word('glide', B.osc1?.glide === 'legato' ? ((c.taste||[]).find(x=>x.block==='osc1'&&x.param==='glide')?.default || 'short') : B.osc1?.glide, 0.06);
    for (const [slot, src] of Object.entries(monoVoice.sources)) for (const o of src.freqParams){ const hz = noteToHz(midi) * Math.pow(2, B[slot].octave || 0) * (src.ratio || 1); o.frequency.cancelScheduledValues(t); o.frequency.setValueAtTime(o.frequency.value, t); o.frequency.exponentialRampToValueAtTime(hz, t + Math.max(glide, 0.005)); }
    heldMono.push(id); monoVoice.ids.push(id); return;
  }
  const v = { ids: [id], sources: {}, nodes: [], envs: [], t0: t };
  const hz = noteToHz(midi);
  const fx = fxChain(c);
  // sources
  const sourceSlots = ['osc1','osc2','sub','noise'].filter(s => B[s]);
  const audioEdges = c.graph.audio;
  const feedsOsc = {}; audioEdges.forEach(e => { if (e.length === 3) feedsOsc[e[0]] = { to: e[1], jack: e[2] }; });
  for (const s of sourceSlots){
    const b = B[s]; let ratio = 1; if (b.ratio) { const m = String(b.ratio).split(':'); if (m.length === 2) ratio = parseFloat(m[0]) / parseFloat(m[1]); }
    const src = makeOsc(ac, b, hz * ratio, t); src.ratio = ratio; v.sources[s] = src; v.nodes.push(src.node);
  }
  // mixer levels (taste default or essential 'level' for that source), FM routing
  const levelWord = s => (c.essentials||[]).find(e=>e.block===s&&e.param==='level')?.value ?? (c.taste||[]).find(e=>e.block===s&&e.param==='level')?.default ?? B[s].level ?? 'full';
  const mix = ac.createGain(); v.mixNode = mix;
  for (const s of sourceSlots){
    const src = v.sources[s];
    if (feedsOsc[s]){                       // modulator oscillator → carrier frequency (FM) or sync (approximated as FM)
      const tgt = v.sources[feedsOsc[s].to]; const idx = word('fm_index', B[s].level || 'half', 3); const g = ac.createGain(); g.gain.value = idx * hz * src.ratio; src.node.connect(g); tgt.freqParams.forEach(o => g.connect(o.frequency)); src.indexGain = g; src.indexBase = g.gain.value;
    } else { src.node.gain.value = word('level', levelWord(s), 1); src.node.connect(mix); }
  }
  // filters
  let node = mix; const filters = [];
  for (const fs of ['filter1','filter2']){
    const f = B[fs]; if (!f) continue;
    const cutoffWord = (c.essentials||[]).find(e=>e.block===fs&&e.param==='cutoff')?.value ?? (c.taste||[]).find(e=>e.block===fs&&e.param==='cutoff')?.default ?? 'mid';
    const base = word('cutoff', cutoffWord, 1200) * Math.pow(2, (midi - 60) / 12 * 0.5);   // half keytracking (ASSUMED)
    const Q = word('resonance', f.resonance || 'none', 0.7); const poles = Math.max(1, Math.round((f.slope || 24) / 12));
    const stages = [];
    for (let i = 0; i < poles; i++){ const bq = ac.createBiquadFilter(); bq.type = { lowpass:'lowpass', highpass:'highpass', bandpass:'bandpass', notch:'notch' }[f.type] || 'lowpass'; bq.frequency.value = base; bq.Q.value = i === 0 ? Q : 0.7; node.connect(bq); node = bq; stages.push(bq); }
    filters.push({ slot: fs, stages, base }); v.nodes.push(...stages);
  }
  // amp
  const amp = ac.createGain(); amp.gain.value = 0; node.connect(amp); const pan = ac.createStereoPanner(); amp.connect(pan); pan.connect(fx); v.amp = amp; v.pan = pan; v.nodes.push(amp, pan);
  const ampLevel = word('level', B.amp?.level || 'full', 0.8) * (0.4 + 0.6 * velScale);
  // envelopes and LFOs by route
  const envOf = slot => envTimes(B[slot]?.shape);
  let ampEnv = null;
  for (const m of mods){
    const [tgt, param] = m.to.split('.'); const src = m.from; const amt = m.amount;
    if (src === 'aenv' && tgt === 'amp'){ ampEnv = envOf('aenv'); applyEnv(amp.gain, t, ampEnv, ampLevel, 0, false); v.envs.push({ param: amp.gain, env: ampEnv, base: 0, exp: false }); }
    else if (src === 'fenv' && /^filter/.test(tgt)){
      const f = filters.find(x => x.slot === tgt); if (!f) continue; const env = envOf('fenv');
      let oct = word('amount', amt || 'moderate', 2);
      const accent = mods.find(x => x.from === 'vel' && x.to === 'fenv.amount'); if (accent) oct += word('amount', accent.amount || 'accent', 1.5) * (velScale - 0.7);
      const peak = Math.min(f.base * Math.pow(2, oct), 18000);
      f.stages.forEach(bq => { applyEnv(bq.frequency, t, env, peak, f.base, true); v.envs.push({ param: bq.frequency, env, base: f.base, exp: true }); });
    }
    else if (src === 'menv' && /^osc/.test(tgt) && param === 'pitch'){
      const env = envOf('menv'); const cents = word('pitch_amount', amt || 'about an octave', 1200); const s = v.sources[tgt]; if (!s) continue;
      s.freqParams.forEach(o => { o.detune.cancelScheduledValues(t); o.detune.setValueAtTime(o.detune.value + cents, t); o.detune.linearRampToValueAtTime(o.detune.value, t + env.a + env.d); });
    }
    else if (src === 'menv' && /^osc/.test(tgt) && param === 'level'){
      const s = v.sources[tgt]; if (!s || !s.indexGain) continue; const env = envOf('menv'); let depth = word('amount', amt || 'moderate', 2) / 3.5;
      const velRoute = mods.find(x => x.from === 'vel' && x.to === 'menv.amount'); if (velRoute) depth *= (0.5 + velScale * 0.7);
      applyEnv(s.indexGain.gain, t, env, s.indexBase * (1 + depth * 2), s.indexBase * 0.3, false); v.envs.push({ param: s.indexGain.gain, env, base: s.indexBase * 0.3, exp: false });
    }
    else if (/^lfo/.test(src)){
      const L = B[src]; if (!L) continue; const lfo = ac.createOscillator(); lfo.type = { triangle:'triangle', sine:'sine', square:'square', saw:'sawtooth' }[L.wave] || 'triangle';
      lfo.frequency.value = word('rate', L.rate || 'slow', 0.3); const g = ac.createGain(); lfo.connect(g); lfo.start(t); v.nodes.push(lfo, g);
      const depthWord = (c.taste||[]).find(x => x.block === src && x.param === 'depth')?.default || amt || 'little'; const depth = word('amount', depthWord, 0.5) / 5;
      if (/^filter/.test(tgt)){ const f = filters.find(x => x.slot === tgt); if (f){ g.gain.value = depth * 1200; f.stages.forEach(bq => g.connect(bq.detune)); } }
      else if (tgt === 'amp' && param === 'pan'){ g.gain.value = depth * 1.5; g.connect(pan.pan); }
      else if (tgt === 'amp'){ g.gain.value = depth * 0.5; g.connect(amp.gain); }
      else if (/^osc/.test(tgt)){ g.gain.value = depth * 100; v.sources[tgt]?.freqParams.forEach(o => g.connect(o.detune)); }
    }
  }
  if (!ampEnv){ ampEnv = { a: 0.005, d: 0.1, s: 1, r: 0.1 }; applyEnv(amp.gain, t, ampEnv, ampLevel, 0, false); v.envs.push({ param: amp.gain, env: ampEnv, base: 0, exp: false }); }
  v.ampEnv = ampEnv; v.oneShot = !!(B.aenv?.one_shot);
  voices.set(id, v); if (mono){ monoVoice = v; heldMono = [id]; }
  if (v.oneShot){ const end = t + ampEnv.a + ampEnv.d + 0.05; voiceOff(v, end, true); if (mono){ monoVoice = null; heldMono = []; } }
  return v;
}
function voiceOff(v, t, already){
  const ac = ctx; for (const e of v.envs) releaseEnv(e.param, t, e.env, e.base, e.exp);
  const end = t + Math.max(v.ampEnv.r, 0.05) * 2 + 0.1;   // the target curve needs ~6 time constants (2 × release) to reach silence
  for (const s of Object.values(v.sources)) for (const o of s.oscs) { try { o.stop(end); } catch(e){} }
  setTimeout(() => { for (const n of v.nodes) { try { n.disconnect(); } catch(e){} } }, (end - ac.currentTime) * 1000 + 200);
  for (const id of v.ids) voices.delete(id);
}
function noteOff(id, when){
  const v = voices.get(id); if (!v) return; const ac = audio(); const t = when ?? ac.currentTime;
  if (v === monoVoice){ heldMono = heldMono.filter(x => x !== id); if (heldMono.length) return; monoVoice = null; }
  if (v.oneShot) return; voiceOff(v, t);
}
let demoTimers = [];
function stopAll(){ demoTimers.forEach(clearTimeout); demoTimers = []; if (!ctx) return; stopDemosNow(); const t = ctx.currentTime; for (const v of new Set(voices.values())) voiceOff(v, t); monoVoice = null; heldMono = []; }
function playDemo(c){
  stopAll(); const ac = audio(); const r = c.render || {}; const bpm = r.tempo || 120; const beat = 60 / bpm; const t0 = ac.currentTime + 0.05;
  const notes = (Array.isArray(r.note) ? r.note : [r.note || 'C3']).map(nameToMidi);
  const vels = Array.isArray(r.velocity) ? r.velocity : [r.velocity || 100];
  const mono = /mono/.test(c.mode); const drum = c.family === 'Drums and Percussion';
  if (!mono && notes.length > 1){                 // chord: once soft and once hard if two velocity sets, else once
    const passes = vels.length > notes.length ? 2 : 1;
    for (let p = 0; p < passes; p++){ const t = t0 + p * 2 * beat * 2; notes.forEach((n, i) => { noteOn(c, n, vels[p * notes.length + i] ?? vels[0], 'd' + p + '-' + i, t); noteOff('d' + p + '-' + i, t + beat * 3.5); }); }
  } else if (drum || notes.length === 1){        // one note: four hits on the beat
    for (let i = 0; i < 4; i++){ const t = t0 + i * beat; noteOn(c, notes[0], vels[i % vels.length], 'd' + i, t); noteOff('d' + i, t + beat * 0.5); }
  } else {                                        // mono line: sixteenths, a note that repeats its predecessor's pitch is tied (slide)
    const step = beat / 4; let prev = null;
    notes.forEach((n, i) => { const t = t0 + i * step; const tied = /tied|slide/.test(r.pattern || '') && i > 0 && (i === 2 || i === 4);
      if (!tied) { if (prev) noteOff(prev, t - 0.01); noteOn(c, n, vels[i % vels.length], 'd' + i, t); prev = 'd' + i; }
      else { const v = voices.get(prev); if (v){ const B = c.graph.blocks; const glide = word('glide', (c.taste||[]).find(x=>x.block==='osc1'&&x.param==='glide')?.default || 'short', 0.06); for (const [slot, s] of Object.entries(v.sources)) for (const o of s.freqParams){ const hz = noteToHz(n) * Math.pow(2, B[slot].octave || 0) * (s.ratio || 1); o.frequency.setValueAtTime(o.frequency.value, t); o.frequency.exponentialRampToValueAtTime(hz, t + glide); } } } });
    if (prev) noteOff(prev, t0 + notes.length * step);
  }
}
route();
</script>
</body></html>'''

out = HERE / "site"; out.mkdir(exist_ok=True)
html = (HTML.replace("__CATALOG__", json.dumps(catalog)).replace("__CARDS__", json.dumps(cards)).replace("__SVGS__", json.dumps(svgs)).replace("__VOCAB__", json.dumps(vocab)))
(out / "index.html").write_text(html)
print("site/index.html written:", len(cards), "cards,", len(svgs), "sheets,", len(html)//1024, "KB")
