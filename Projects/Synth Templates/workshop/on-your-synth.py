#!/usr/bin/env python3
"""on-your-synth.py — one card's `mappings` as a standalone sheet: every synth side by side, one row per setting.
Usage: python3 on-your-synth.py cards/house-bass.yaml [out.html]. Generated; edit the card, not the output."""
import sys, html, yaml
card = yaml.safe_load(open(sys.argv[1])); out = sys.argv[2] if len(sys.argv) > 2 else f"proofs/{card['id']}-on-your-synth.html"
B = {'osc1':'Oscillator 1','sub':'Sub oscillator','mix':'Mixer','filter1':'Filter 1','fenv':'Filter envelope','aenv':'Amplitude envelope','mode':'Voice mode'}
P = {'voices':'Voices','wave':'Waveform','level':'Level','type':'Filter type','cutoff':'Cutoff frequency','resonance':'Resonance',
     'amount':'Envelope amount','shape':'Attack, decay, sustain, release','glide':'Glide time'}
S = {'exact':'exact','near':'start here, finish by ear','look':'by eye on its display','unchecked':'from the manual, not yet seen'}
e = lambda s: html.escape(str(s))
m = {k: v for k, v in card['mappings'].items() if isinstance(v, dict) and v.get('rows')}
keys = []                                    # the union of settings, in first-seen order
for v in m.values():
    for r in v['rows']:
        if (r['block'], r['param']) not in keys: keys.append((r['block'], r['param']))
def cell(syn, k):
    r = next((r for r in m[syn]['rows'] if (r['block'], r['param']) == k), None)
    if not r: return '<td class="none">set with the voice mode, above</td>'
    return f'<td><div class="where">{e(r["where"])}</div><div class="set">{e(r["set"])}</div><div class="sure {e(r["sure"])}">{e(S.get(r["sure"], r["sure"]))}</div></td>'
ess = {(x['block'], x['param']) for x in card.get('essentials', [])}
rows = ''.join(f'<tr><th>{e(B.get(b,b))}<br><span>{e(P.get(p,p))}</span></th>{"".join(cell(s,(b,p)) for s in m)}</tr>' for b, p in keys)
doc = f'''<!doctype html><meta charset="utf-8"><title>{e(card["name"])} on your synth</title><style>
body{{margin:0;background:#f0eee5;color:#1a1916;font:13px/1.45 "IBM Plex Mono",ui-monospace,Menlo,monospace}}
.sheet{{max-width:1180px;margin:18px auto;border:1px solid #b8b09a;padding:16px 18px}}
h1{{font-size:20px;letter-spacing:.06em;margin:0}} .sub{{color:#3a3a35;margin:4px 0 14px}}
table{{border-collapse:collapse;width:100%}} th,td{{border-top:1px solid #cfc9b6;padding:8px;vertical-align:top;text-align:left}}
thead th{{font-size:11px;letter-spacing:.18em;text-transform:uppercase;border-top:2px solid #1a1916}}
tbody th{{font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;width:170px}} tbody th span{{font-weight:400}}
.where{{color:#3a3a35}} .set{{font-weight:600;margin-top:3px}} .sure{{font-size:10px;letter-spacing:.14em;text-transform:uppercase;margin-top:3px;color:#6a6862}}
.sure.exact{{color:#1a1916}} .sure.unchecked{{color:#a8730a}} td.none{{color:#6a6862;font-style:italic}}
.foot{{margin-top:14px;font-size:11px;color:#6a6862;display:flex;justify-content:space-between}}</style>
<div class="sheet"><h1>{e(card["name"].upper())} · ON YOUR SYNTH</h1>
<div class="sub">{e(card["listening"]["cue"])}<br>The same card in each synth's own names and units. Times are the 95 % point on the Moog curve; each synth times and curves its stages its own way, so match the pluck by ear against the reference, not the millisecond. Amber marks what is read from a manual and not yet seen on this Mac.</div>
<table><thead><tr><th>setting</th>{"".join(f"<th>{e(v['name'])} {e(v.get('version',''))}</th>" for v in m.values())}</tr></thead><tbody>{rows}</tbody></table>
<div class="foot"><span>Synth Templates · {e(card["id"])}</span><span>Drafting Table · Paper</span><span>generated from cards/{e(card["id"])}.yaml by on-your-synth.py</span></div></div>'''
open(out, 'w').write(doc); print(out, len(keys), 'settings ×', len(m), 'synths')
