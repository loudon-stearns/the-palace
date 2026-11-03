#!/usr/bin/env python3
"""report.py: every page in the census, and what the fan-out did to it or why it left it. Writes report.md.

  python3 _ops/furniture-fanout/report.py [styles-diff.json]

The optional styles diff (styles.mjs --diff … --out) adds, per page, the page-styled elements whose look changed:
the ones to look at, since the sheet should only have reached furniture the page left to the OS.
"""
import json, sys
from pathlib import Path
from collections import Counter

HERE = Path(__file__).resolve().parent
rows = {r['path']: r for r in json.load(open(HERE / 'census.json'))}
plans = {p['path']: p for p in json.load(open(HERE / 'plan.json'))}
diff = {}
if len(sys.argv) > 1:
    for d in json.load(open(sys.argv[1])): diff[d['path']] = d

L = ['# Furniture fan-out — what each page got', '',
     'Every page in `census.md`, after `furnish.py --apply`. "Dressed here" is the furniture the inlined sheet now dresses; '
     '"page keeps" is furniture the page already draws itself, so the sheet leaves it alone. "Look" lists any element '
     'outside that planned furniture whose computed look changed in headless Chromium, before against after (`styles.mjs`): '
     'the places where the sheet reached past what it was meant to dress.', '']

left = [p for p in plans.values() if p.get('left')]
done = [p for p in plans.values() if not p.get('left') and p.get('adds')]
L += ['## Summary', '', f'- {len(done)} pages updated, {len(left)} left alone.']
for why, n in Counter(p['left'] for p in left).most_common(): L.append(f'- left, {n}: {why}')
for why, n in Counter(p['icon_left'] for p in done if p.get('icon_left')).most_common(): L.append(f'- no tab icon, {n}: {why}')
looked = [p for p in done if diff.get(p['path'], {}).get('styled')]
if diff: L.append(f'- {len(looked)} updated pages where something outside the planned furniture changed look (listed under "Look").')
L.append('')

L += ['## For Loudon', '',
      '- **Rich-face pieces carry no tab icon, by decision (2026-11-03).** A framed piece never owns a browser tab; the page that '
      'frames it (the rich face, the scroll\'s trail, a TRICKSTER card) is where the entry\'s avatar belongs. Today it wears none: '
      'neither `_ops/rich-face/rich.html` nor the STIGMERGY app sets a tab icon, a gap of its own. Declaring the icon in `piece:files` '
      'would give 235 pieces an origin (`allow-same-origin`) and lasting storage (`_ops/rich-face/contract.mjs:217`) for a file the '
      'frame never fetches. Known gap: a piece opened on its own from disk has no icon.',
      '- **One rule does override pages: reduced motion.** Its `!important` sits in the layer, and a layered `!important` beats a '
      'page\'s own, so a reader who asks for stillness gets it everywhere. The sheet means this. Every other rule yields to the page.',
      '- **Pages regenerated from the 22 templates will drop the furniture** the next time their script runs; the templates were left alone.',
      '- **Two framed pieces link `controls.css` by `../`** (FM Synthesis staged patch, SUBSTRATE anatomy), exactly as they already link '
      'their token sheet, and both declare it in `piece:files`. conform passes; worth one look in the live frame.',
      '- **A page that hides focus on its own selectors still hides it.** The inlined sheet sits in a layer so the page always wins; '
      'that also means a page\'s own `.btn:focus { outline: none }` beats the house focus line. The census counted 132 such pages. '
      'Fixing them is a per-page edit, not a sheet.',
      '- **24 pages keep the OS select chevron.** Their own select rules set `background:` as a shorthand, which would erase the house '
      'chevron and leave none (the Meadows diagnostic is one). `color-scheme` now keeps the popup on the right side of the light.',
      '- **Self-dressed pages wear their own colours.** The inlined tokens borrow each page\'s own names where it has them (`--e1`, '
      '`--fg1`, `--amber`, `--amberline`, `--accent`, `--paper` …) and fall back to Graphite on a dark page, the Drafting skin on a light one '
      '(Phosphor and Paper for Drafting Table pages). Self-dressed pages get Loudon Live\'s grammar; Drafting Table pages get theirs.',
      '- **Six "look" lines, all explained:** three `margin-left: auto` buttons moved 0.016 px (the scrollbar is 11 px, not the OS 15), '
      'an animated glow and a font-shuffling piece caught mid-change, and a `<sub>` taking its `<code>` parent\'s new mono face.',
      '- **Fifteen pages sit in five entries with no face yet** (Cycle 5 Explorer, Rational Hearing, Synth Templates, Resonance and Damping, '
      'The Gallery): they get their icon when the Weave\'s face audit reaches them.', '']
L += ['## Left alone', '', '| page | why |', '|---|---|']
for p in sorted(left, key=lambda p: p['path']): L.append(f'| `{p["path"]}` | {p["left"]} |')

L += ['', '## Updated', '', '| page | added | dressed here | page keeps | icon | look |', '|---|---|---|---|---|---|']
for p in sorted(done, key=lambda p: p['path']):
    d = diff.get(p['path'], {})
    look = '; '.join(f'{w} ({", ".join(e["props"])})' for w, e in list(d.get('styled', {}).items())[:4])
    if d.get('styled') and len(d['styled']) > 4: look += f'; +{len(d["styled"]) - 4} more'
    icon = '✓' if p.get('icon') else (p.get('icon_left', '')[:60] or '')
    L.append(f'| `{p["path"]}` | {", ".join(p["adds"])} | {" ".join(p.get("dressed_here", [])) or "(linked sheet)"} | {" ".join(p.get("dressed_by_page", []))} | {icon} | {look} |')

(HERE / 'report.md').write_text('\n'.join(L) + '\n')
print('\n'.join(L[:20]))
