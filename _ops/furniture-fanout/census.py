#!/usr/bin/env python3
"""census.py: every tracked HTML artifact the browser's-furniture rule (2026-11-03) should reach,
classified by dress, how it gets its tokens, whether it is a rich-face piece, and which of the
browser's furniture it shows. Writes census.json and census.md beside this file.

  python3 _ops/furniture-fanout/census.py

Same exclusions as the 2026-11-03 survey: node_modules, .claude, _tools and every design-system folder.
"""
import json, os, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
EXCLUDE = ('node_modules/', '.claude/', '_tools/', 'design-system/')  # every system's own folder: Loudon Live, Drafting Table, STIGMERGY

def tracked():
    out = subprocess.run(['git', '-c', 'core.quotepath=off', 'ls-files', '-z'], cwd=ROOT, capture_output=True, check=True).stdout
    return [p for p in out.decode().split('\0') if p]

ALL = tracked()
ALLSET = set(ALL)
HTML = sorted(p for p in ALL if p.lower().endswith(('.html', '.htm')) and not any(p.startswith(e) or f'/{e}' in p for e in EXCLUDE))

LL_SKINS = ('graphite', 'crt', 'strobe', 'cobalt-grid', 'amber-lab', 'drafting', 'teal-patch', 'dusk-tape', 'bone-synth')
LIGHT_SKINS = {'amber-lab', 'drafting', 'bone-synth'}

def entry_of(path):
    """The entry whose bundle holds this page: the nearest folder D with D.md beside it or an avatar inside it."""
    parts = path.split('/')[:-1]
    for i in range(len(parts), 0, -1):
        d = '/'.join(parts[:i]); name = parts[i - 1]
        parent = '/'.join(parts[:i - 1])
        md = f'{parent}/{name}.md' if parent else f'{name}.md'
        icon = f'{d}/{name} — icon.png'
        if icon in ALLSET or md in ALLSET:
            return name, d, (icon if icon in ALLSET else None)
    return None, None, None

HEX = re.compile(r'#([0-9a-fA-F]{3,8})\b')
RGB = re.compile(r'rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)')

def lum(color):
    m = HEX.search(color)
    if m:
        h = m.group(1)
        if len(h) in (3, 4): h = ''.join(c * 2 for c in h[:3])
        r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    else:
        m = RGB.search(color)
        if not m:
            named = {'black': 0.0, 'white': 1.0, '#000': 0.0}
            for k, v in named.items():
                if re.search(rf'\b{k}\b', color): return v
            return None
        r, g, b = (float(x) for x in m.groups())
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

def css_text(html):
    return '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', html, re.S | re.I))

def var_value(css, name):
    m = re.search(rf'--{re.escape(name)}\s*:\s*([^;}}]+)', css)
    return m.group(1).strip() if m else None

def ground(html, css, skin, theme):
    """dark | light | ?, from the skin or theme, else the body/html background, else a --bg token."""
    if skin: return 'light' if skin in LIGHT_SKINS else 'dark'
    if theme: return 'dark' if theme == 'phosphor' else 'light'
    cands = []
    for sel in ('body', 'html', ':root'):
        for blk in re.findall(rf'(?:^|[}},\s]){re.escape(sel)}\s*(?:,[^{{]*)?\{{([^}}]*)\}}', css):
            m = re.search(r'background(?:-color)?\s*:\s*([^;]+)', blk)
            if m: cands.append(m.group(1))
    m = re.search(r'<body[^>]*style="[^"]*background(?:-color)?\s*:\s*([^;"]+)', html, re.I)
    if m: cands.insert(0, m.group(1))
    for c in cands:
        v = re.match(r'\s*var\(--([\w-]+)', c)
        if v: c = var_value(css, v.group(1)) or c
        L = lum(c)
        if L is not None: return 'dark' if L < 0.45 else 'light'
    for tok in ('bg', 'ground-000', 'background', 'paper', 'bg-0', 'page'):
        v = var_value(css, tok)
        if v:
            L = lum(v)
            if L is not None: return 'dark' if L < 0.45 else 'light'
    if not cands: return 'light'  # no background at all: the browser's white
    return '?'

def classify(path):
    try: html = (ROOT / path).read_text(encoding='utf-8', errors='replace')
    except Exception as e: return {'path': path, 'error': str(e)}
    css = css_text(html)
    low = html.lower()
    name = path.rsplit('/', 1)[-1]
    r = {'path': path, 'folder': path.split('/')[0] if '/' in path else '(root)'}
    r['rich'] = ' — rich — ' in name or ' — rich —' in name
    r['template'] = bool(re.search(r'(^|[._-])template\.html?$|\.tpl\.html?$', name))
    m_link = re.findall(r'<link[^>]+href="([^"]*(?:loudon-live|drafting-table)?[^"]*colors_and_type\.css)"', html, re.I)
    r['links_tokens'] = m_link[0] if m_link else None
    r['links_controls'] = bool(re.search(r'href="[^"]*controls\.css"', html))
    skin = re.search(r'\bskin-(' + '|'.join(LL_SKINS) + r')\b', html)
    theme = re.search(r'data-theme="(paper|phosphor)"', html)
    r['skin'] = skin.group(1) if skin else None
    r['theme'] = theme.group(1) if theme else None
    stig = bool(re.search(r'\bbbs-[\w-]+', html)) or path.startswith(('_ops/stigmergy/', 'STIGMERGY/'))
    ll_tok = sum(1 for t in ('bg-elev-1', 'fg-1', 'fg-3', 'border-soft', 'accent-line') if f'--{t}:' in css.replace(' :', ':'))
    dt_tok = sum(1 for t in ('ground-000', 'ink-2', 'slab-face', 'rule', 'stroke-rule') if f'--{t}:' in css.replace(' :', ':'))
    if r['links_tokens'] and 'drafting-table' in r['links_tokens'] or r['theme']: dress = 'Drafting Table'
    elif r['links_tokens'] or r['skin']: dress = 'Loudon Live'
    elif stig: dress = 'STIGMERGY'
    elif dt_tok >= 3: dress = 'Drafting Table (inline tokens)'
    elif ll_tok >= 3: dress = 'Loudon Live (inline tokens)'
    else: dress = 'own'
    r['dress'] = dress
    r['tokens'] = 'linked' if r['links_tokens'] else ('inline' if (ll_tok >= 3 or dt_tok >= 3) else 'own')
    r['ground'] = ground(html, css, r['skin'], r['theme'])
    # the furniture it shows
    # OS-dressed: the element is there and the page's own CSS does not dress it
    lc = css.lower()
    f = {}
    if re.search(r'type=["\']?range', low) and '-webkit-slider-thumb' not in lc: f['range'] = len(re.findall(r'type=["\']?range', low))
    if '<textarea' in low and not re.search(r'resize\s*:', lc): f['textarea'] = low.count('<textarea')
    if '<select' in low and 'appearance' not in lc: f['select'] = low.count('<select')
    if re.search(r'type=["\']?(?:checkbox|radio)', low) and 'appearance' not in lc: f['check'] = len(re.findall(r'type=["\']?(?:checkbox|radio)', low))
    if re.search(r'type=["\']?number', low) and 'spin-button' not in lc: f['number'] = len(re.findall(r'type=["\']?number', low))
    if '<details' in low and 'details-marker' not in lc and 'list-style' not in lc: f['details'] = low.count('<details')
    if re.search(r'overflow(?:-[xy])?\s*:\s*(?:auto|scroll)', low) and '::-webkit-scrollbar' not in lc: f['scroller'] = 1
    r['buttons'] = low.count('<button') + len(re.findall(r"createelement\(['\"]button", low))
    r['furniture'] = {k: v for k, v in f.items() if v}
    r['outline_none_no_fv'] = bool(re.search(r'outline\s*:\s*(?:none|0)\b', low)) and ':focus-visible' not in low
    r['animates'] = bool(re.search(r'@keyframes|requestanimationframe|transition\s*:', low))
    r['reduced_motion'] = 'prefers-reduced-motion' in low
    r['color_scheme'] = 'color-scheme' in low
    r['icon'] = bool(re.search(r'<link[^>]+rel=["\']?(?:shortcut )?icon', low))
    r['theme_color'] = 'name="theme-color"' in low
    html_tag = re.search(r'<html\b[^>]*>', html, re.I)
    r['has_html_tag'] = bool(html_tag)
    r['lang'] = bool(html_tag and re.search(r'\blang=', html_tag.group(0)))
    r['has_head'] = bool(re.search(r'<head\b', low))
    # a head-less HTML5 page (doctype, title, style, no <html>/<head>) is a page; a fragment has none of those
    r['fragment'] = not r['has_html_tag'] and not r['has_head'] and not re.search(r'<!doctype|<title|<meta\s+charset|<body|<style', low)
    ent, bundle, icon = entry_of(path)
    r['entry'], r['bundle'], r['avatar'] = ent, bundle, icon
    r['piece_meta'] = bool(re.search(r'<meta\s+name="piece:', html))
    return r

def main():
    rows = [classify(p) for p in HTML]
    (HERE / 'census.json').write_text(json.dumps(rows, indent=1, ensure_ascii=False) + '\n')
    from collections import Counter
    n = len(rows)
    c = lambda key: Counter(r.get(key) for r in rows)
    L = [f'# Furniture fan-out — census', '',
         f'{n} tracked HTML files (`git ls-files`, less node_modules, .claude, _tools and the design-system folders), read 2026-11-03 by `census.py`. One row per file is in `census.json`; the full table is below the summary.', '',
         '## Summary', '', '| | count |', '|---|---|']
    for k, v in c('dress').most_common(): L.append(f'| dress · {k} | {v} |')
    for k, v in c('tokens').most_common(): L.append(f'| tokens · {k} | {v} |')
    for k, v in c('ground').most_common(): L.append(f'| ground · {k} | {v} |')
    L.append(f'| rich-face pieces | {sum(r["rich"] for r in rows)} |')
    L.append(f'| fragments (no `<html>`, no `<head>`) | {sum(r["fragment"] for r in rows)} |')
    L.append(f'| in an entry bundle with an avatar | {sum(bool(r["avatar"]) for r in rows)} |')
    L.append(f'| in an entry bundle, no avatar yet | {sum(bool(r["entry"]) and not r["avatar"] for r in rows)} |')
    L.append(f'| no entry | {sum(not r["entry"] for r in rows)} |')
    dark = [r for r in rows if r['ground'] == 'dark']
    L.append(f'| dark with no `color-scheme` | {sum(not r["color_scheme"] for r in dark)} of {len(dark)} |')
    for k in ('range', 'textarea', 'select', 'check', 'number', 'details', 'scroller'):
        L.append(f'| pages with an OS-dressed {k} | {sum(1 for r in rows if r["furniture"].get(k))} |')
    L.append(f'| pages with a `<button>` (the sheet\'s bare-button rule reaches it) | {sum(1 for r in rows if r["buttons"])} |')
    L.append(f'| `outline: none` with no `:focus-visible` | {sum(r["outline_none_no_fv"] for r in rows)} |')
    an = [r for r in rows if r['animates']]
    L.append(f'| animated, no `prefers-reduced-motion` | {sum(not r["reduced_motion"] for r in an)} of {len(an)} |')
    L.append(f'| tab icon | {sum(r["icon"] for r in rows)} |')
    L.append(f'| `theme-color` | {sum(r["theme_color"] for r in rows)} |')
    L.append(f'| `<html>` without `lang` | {sum(r["has_html_tag"] and not r["lang"] for r in rows)} |')
    L.append(f'| head-less HTML5 pages (no `<html>` tag, so no `lang`) | {sum(not r["has_html_tag"] and not r["fragment"] for r in rows)} |')
    L += ['', '## Every file', '', 'Dress: LL = Loudon Live, DT = Drafting Table, STIG = STIGMERGY; `(i)` = tokens inline, not linked. Ground: d dark, l light. Furniture, only where the page does not dress it itself: r range, t textarea, s select, c check/radio, n number, d details, o an overflow scroller with the OS scrollbar. Flags: ✗f outline hidden with no focus-visible, ✗m animates with no reduced-motion, ✓cs has color-scheme, ✓i has a tab icon, ✗L no lang (an `<html>` without it, or a head-less page with no `<html>` tag).', '',
          '| file | dress | ground | rich | entry avatar | furniture | flags |', '|---|---|---|---|---|---|---|']
    short = {'Loudon Live': 'LL', 'Drafting Table': 'DT', 'STIGMERGY': 'STIG', 'Loudon Live (inline tokens)': 'LL (i)', 'Drafting Table (inline tokens)': 'DT (i)', 'own': 'own'}
    ab = {'range': 'r', 'textarea': 't', 'select': 's', 'check': 'c', 'number': 'n', 'details': 'd', 'scroller': 'o'}
    for r in rows:
        fl = []
        if r['outline_none_no_fv']: fl.append('✗f')
        if r['animates'] and not r['reduced_motion']: fl.append('✗m')
        if r['color_scheme']: fl.append('✓cs')
        if r['icon']: fl.append('✓i')
        if not r['lang'] and not r['fragment']: fl.append('✗L')
        if r['fragment']: fl.append('fragment')
        furn = ' '.join(f'{ab[k]}{v}' for k, v in r['furniture'].items())
        av = '✓' if r['avatar'] else ('entry, no avatar' if r['entry'] else '—')
        L.append(f'| `{r["path"]}` | {short.get(r["dress"], r["dress"])}{" · " + (r["skin"] or r["theme"]) if (r["skin"] or r["theme"]) else ""} | {r["ground"][0]} | {"✓" if r["rich"] else ""} | {av} | {furn} | {" ".join(fl)} |')
    (HERE / 'census.md').write_text('\n'.join(L) + '\n')
    print('\n'.join(L[:40]))

if __name__ == '__main__':
    main()
