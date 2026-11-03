#!/usr/bin/env python3
"""furnish.py: carry the browser's-furniture rule (2026-11-03) to an HTML artifact the palace already made.

  python3 _ops/furniture-fanout/furnish.py --plan              what each page would get, and why some are left (plan.json)
  python3 _ops/furniture-fanout/furnish.py --apply <prefix>…   write it, for the pages under these path prefixes
  python3 _ops/furniture-fanout/furnish.py --apply --all

Per page, from census.json:
  · a page that links a system's colors_and_type.css gets a <link> to that system's controls.css right after it;
  · a self-contained page gets the sheet inlined, in a <style data-furniture> placed before its own styles, with
    three changes so it cannot restyle what the page styled on purpose:
      - it sits in `@layer furniture`, so every rule the page writes wins, whatever its specificity;
      - only the parts for furniture the page leaves to the OS go in (a page that draws its own slider thumb
        gets no range rules, a page with its own buttons gets no button rules, and so on);
      - its tokens are private (--fx-*), each one the page's own token where the page has one (its --accent,
        its --e1 …) and the system's value where it has none, so the furniture wears the page's colours;
  · color-scheme on the root where the sheet's own rule does not reach it (the inlined copy carries it);
  · <link rel="icon">: the entry's avatar beside the page; a page with no entry takes Loudon Live's favicon.svg;
  · <meta name="theme-color"> with the page's ground; lang="en" on <html> where missing.
A page already carrying any of these keeps its own.
"""
import json, re, sys
from pathlib import Path
from urllib.parse import quote
import posixpath

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
TODAY = '2026-11-03'
LL = '_ops/loudon-live/design-system/'
DT = '_ops/drafting-table/design-system/'
FAVICON = DT + 'favicon.svg'  # the tab mark of a page with no entry (Drafting Table § The browser's furniture, 2026-11-03)

# ── which pages are left, and why ──────────────────────────────────────────
LEAVE = [
    (lambda r: r['dress'] == 'STIGMERGY', 'STIGMERGY dress: the board keeps its own furniture (the .bbs look), which the sheets grew from'),
    (lambda r: r['path'].startswith('_ops/stigmergy/app/'), "STIGMERGY's app: built and served by Vite, never an artifact"),
    (lambda r: r['template'], 'a template a script fills in; the page it makes is the artifact'),
    (lambda r: r['fragment'], 'a fragment with no <html> or <head>: included in another page, which carries the head'),
    (lambda r: r['path'].startswith(('_ops/swarm/sessions/', '_ops/Harvest Ceremony/Archive/')), 'a record of a past run: it stays as it was made (Loudon, 2026-11-03)'),
    (lambda r: r['path'] in ('_ops/rich-face/rich.html', '_ops/loudon-eval/rate.html'), 'machinery, not an artifact: the rich-face renderer or the eval server\'s page; a change there is its owner\'s code change'),
]
# rich-face pieces get no tab icon (decided 2026-11-03): a framed piece never owns a tab, the page that frames it wears
# the avatar, and declaring the icon in piece:files would give each piece an origin and lasting storage for nothing.
RICH_ICON = False

# ── the sheets, cut into rules and sorted by the furniture each rule dresses ──
def split_rules(css):
    """Top-level rules of a stylesheet as (prelude, body) pairs; comments dropped; @blocks keep their body whole."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: break
        pre = css[i:j].strip()
        depth, k = 1, j + 1
        while depth and k < n:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        out.append((pre, css[j + 1:k - 1].strip()))
        i = k
    return out

def split_selectors(pre):
    parts, depth, cur = [], 0, ''
    for ch in pre:
        if ch in '([': depth += 1
        elif ch in ')]': depth -= 1
        if ch == ',' and depth == 0: parts.append(cur.strip()); cur = ''
        else: cur += ch
    if cur.strip(): parts.append(cur.strip())
    return parts

def kind_of(sel):
    s = sel
    if s.startswith('input:not('): return 'field'  # the text fields: it names the other types only to exclude them
    if 'file' in s: return 'file'
    if 'number' in s or 'spin-button' in s: return 'number'
    if 'scrollbar' in s: return 'scrollbar'
    if '::selection' in s: return 'selection'
    if s in (':focus', ':focus-visible'): return 'focus'
    if 'range' in s: return 'range'
    if 'checkbox' in s or 'radio' in s or 'indeterminate' in s: return 'check'
    if 'resizer' in s: return 'grip'
    if 'textarea' in s: return 'textarea'
    if 'select' in s or 'option' in s or 'picker' in s: return 'select'
    if 'button' in s or 'submit' in s or 'reset' in s: return 'button'
    if s.startswith('input') or 'placeholder' in s: return 'field'
    if 'summary' in s or 'details' in s: return 'details'
    if s.startswith('dialog'): return 'dialog'
    if s.startswith(('progress', 'meter')): return 'progress'
    if re.match(r'a(?=$|:|\[)', s): return 'link'
    if s == 'hr': return 'hr'
    if s in ('mark', 'kbd'): return s
    if s in ('code', 'pre', 'samp'): return 'code'
    if s in ('.num', 'td', 'th', 'time', 'output'): return 'numerals'
    if s.startswith('[style') or s in ('.scroll', '.scroller'): return 'scroller'
    if s == ':root' or s.startswith('.skin-') or s.startswith('[data-theme'): return 'scheme'
    if s in ('*', 'label') or 'tap' in s: return 'touch'
    return 'other'

def sheet(system):
    css = (ROOT / (LL if system == 'LL' else DT) / 'controls.css').read_text()
    return split_rules(css)

# ── the tokens: each private --fx-* name, the page tokens it may borrow, and the system's values ──
LL_TOK = {  # name: (kind, borrow-from, dark value (Graphite), light value (Drafting skin))
    'bg':          ('color', ['bg', 'paper', 'page', 'background'], '#0a0a0f', '#f0eee5'),
    'bg-elev-1':   ('color', ['bg-elev-1', 'e1', 'panel', 'bg1', 'bg-card', 'surface'], '#12121a', '#e6e3d7'),
    'bg-elev-2':   ('color', ['bg-elev-2', 'e2', 'bg2'], '#1a1a28', '#dcd9ca'),
    'bg-elev-3':   ('color', ['bg-elev-3', 'e3'], '#22222e', '#d2cfbf'),
    'fg-1':        ('color', ['fg-1', 'fg1', 'fg', 'text', 'ink'], '#e8e8f0', '#1a1916'),
    'fg-2':        ('color', ['fg-2', 'fg2', 'ink2', 'ink-2'], '#c8c8d8', '#3a3a35'),
    'fg-3':        ('color', ['fg-3', 'fg3', 'dim', 'ink-dim', 'text-dim', 'muted'], '#8a8aa0', '#6a6862'),
    'fg-4':        ('color', ['fg-4', 'fg4'], '#4a4a5a', '#a59f90'),
    'fg-on-accent':('color', ['fg-on-accent'], '#0a0a0f', '#f0eee5'),
    'border':      ('color', ['border', 'line', 'rule'], '#4a4a5e', '#b8b09a'),
    'border-soft': ('color', ['border-soft', 'soft'], 'rgba(255,255,255,0.06)', 'rgba(26,25,22,0.10)'),
    'border-hover':('color', ['border-hover'], 'rgba(232,184,74,0.55)', 'rgba(200,38,26,0.55)'),
    'accent':      ('color', ['accent', 'amber', 'acc'], '#e8b84a', '#c8261a'),
    'accent-soft': ('color', ['accent-soft'], 'rgba(232,184,74,0.10)', 'rgba(200,38,26,0.08)'),
    'accent-line': ('color', ['accent-line', 'amberline'], 'rgba(232,184,74,0.50)', 'rgba(200,38,26,0.50)'),
    'danger':      ('color', ['danger', 'bad'], '#ff2a2a', '#c8261a'),
    'mono':        ('font',  ['mono'], "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace", None),
}
LL_LIT = {'r-xs': '1px', 'r-sm': '2px', 'r-md': '4px', 'r-pill': '999px', 's-1': '4px', 's-2': '8px', 's-3': '12px',
          's-4': '16px', 's-5': '20px', 's-6': '24px', 't-fast': '120ms', 'ease': 'cubic-bezier(.4, 0, .2, 1)',
          'lh-normal': '1.5', 't-eyebrow': '11px', 'tr-eyebrow': '0.18em', 't-caption': '13px',
          'shadow-2': 'inset 0 1px 0 rgba(255,255,255,0.07), 0 6px 16px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.50)',
          'shadow-3': 'inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 40px -8px rgba(0,0,0,0.70), 0 4px 10px rgba(0,0,0,0.45)'}
DT_TOK = {  # dark = Phosphor, light = Paper
    'ground-000':  ('color', ['ground-000'], '#050a06', '#f0eee5'),
    'ground-100':  ('color', ['ground-100'], '#0b2a14', '#e6e3d7'),
    'ground-200':  ('color', ['ground-200'], '#10361d', '#dcd9ca'),
    'ink':         ('color', ['ink'], '#33ff66', '#1a1916'),
    'ink-2':       ('color', ['ink-2'], '#1f8a3c', '#3a3a35'),
    'ink-3':       ('color', ['ink-3'], '#0f5024', '#6a6862'),
    'rule':        ('color', ['rule'], '#1f8a3c', '#b8b09a'),
    'slab-face':   ('color', ['slab-face'], '#141c16', '#d8d4c6'),
    'slab-light':  ('color', ['slab-light'], '#233029', '#ebe8dd'),
    'accent':      ('color', ['accent'], '#33ff66', '#c8261a'),
    'selection':   ('color', ['selection'], '#33ff66', '#1a1916'),
    'on-selection':('color', ['on-selection'], '#050a06', '#f0eee5'),
    'source-measure':   ('color', ['source-measure'], '#ff4136', '#c8261a'),
    'source-datasheet': ('color', ['source-datasheet'], '#4f8cff', '#2b5fb0'),
    'shadow-slab': ('shadow', ['shadow-slab'], 'inset 0 1px 0 #233029, 0 1px 0 #000000, 0 2px 4px rgba(0,0,0,0.60)', 'inset 0 1px 0 #ebe8dd, 0 1px 0 #b9b4a3, 0 2px 3px rgba(26,25,22,0.18)'),
    'shadow-recess': ('shadow', ['shadow-recess'], 'inset 0 1px 3px rgba(0,0,0,0.80), inset 0 0 0 1px #1f8a3c', 'inset 0 1px 2px rgba(26,25,22,0.28), inset 0 0 0 1px #b8b09a'),
    'font-mono':   ('font', ['font-mono', 'mono'], "'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', Menlo, Consolas, monospace", None),
}
DT_LIT = {'space-1': '4px', 'space-2': '8px', 'space-3': '12px', 'space-4': '16px', 'space-5': '24px', 'radius-0': '0',
          'radius-bevel': '2px', 'radius-round': '999px', 'stroke-frame': '2px', 'stroke-rule': '1px'}

COLORISH = re.compile(r'^\s*(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\(|oklab\(|color-mix\(|var\(--[\w-]+\)\s*$|[a-z]+\s*$)', re.I)

def page_tokens(css):
    """Every custom property the page sets, first value wins (the :root one, usually)."""
    out = {}
    for name, val in re.findall(r'--([\w-]+)\s*:\s*([^;}]+)', css):
        out.setdefault(name, val.strip())
    return out

def token_block(system, ground, ptok):
    """The --fx-* tokens, on every element so a skin set below the root still reaches them."""
    tok, lit = (LL_TOK, LL_LIT) if system == 'LL' else (DT_TOK, DT_LIT)
    dark = ground != 'light'
    lines, borrowed = [], []
    for name, (kind, borrow, dv, lv) in tok.items():
        default = dv if (dark or lv is None) else lv
        chain = []
        for b in borrow:
            v = ptok.get(b)
            if v is None: continue
            if kind == 'color' and not COLORISH.match(v): continue
            if kind == 'font' and not re.search(r'mono|courier|menlo|consolas', v, re.I): continue
            chain.append(b)
        expr = default
        for b in reversed(chain): expr = f'var(--{b}, {expr})'
        if chain: borrowed.append(f'{name}←{chain[0]}')
        lines.append(f'--fx-{name}: {expr};')
    lines += [f'--fx-{k}: {v};' for k, v in lit.items()]
    return ':where(*) { ' + ' '.join(lines) + ' }', borrowed

# ── what the page already dresses itself ───────────────────────────────────
def dressed_kinds(html, css):
    lc = css.lower(); low = html.lower()
    scripts = '\n'.join(re.findall(r'<script[^>]*>(.*?)</script>', html, re.S | re.I)).lower()
    css_classes = set(re.findall(r'\.([a-z_][\w-]*)', lc)); css_ids = set(re.findall(r'#([a-z_][\w-]*)', lc))
    def classed(tag_re):
        for attrs in re.findall(rf'<{tag_re}\b([^>]*)>', low):
            for c in re.findall(r'class=["\']([^"\']*)', attrs):
                if any(x in css_classes for x in c.split()): return True
            for i in re.findall(r'id=["\']([^"\']*)', attrs):
                if i in css_ids: return True
        return False
    def sel(word): return re.search(rf'(^|[\s,>+~}}(]){word}(?=[\s,.:\[{{#>+~)])', lc) is not None
    js_makes = lambda tag: re.search(rf"createelement\(\s*['\"]{tag}['\"]|<{tag}\b", scripts) is not None
    d = set()
    if '::-webkit-scrollbar' in lc or 'scrollbar-color' in lc or 'scrollbar-width' in lc: d.add('scrollbar')
    if '::selection' in lc: d.add('selection')
    if ':focus-visible' in lc: d.add('focus')
    # a slider is dressed when the page draws its own thumb; width or accent-color alone still leaves the OS's
    if re.search(r'-webkit-slider-thumb|range-thumb', lc): d.add('range')
    # the grip: `resize: vertical` only limits it; the OS still draws its dots unless the page draws ::-webkit-resizer
    if '-webkit-resizer' in lc: d.add('grip')
    if re.search(r'checkbox|radio', lc) or classed(r'input[^>]*type=["\']?(?:checkbox|radio)'): d.add('check')
    if sel('textarea') or classed('textarea') or js_makes('textarea'): d.add('textarea')
    # a select: the page keeps it when its own select rules set appearance (it drew its own) or the background
    # shorthand (which would wipe the house chevron, leaving none); colours and a border alone still show the OS chevron
    sel_classes = set()
    for attrs in re.findall(r'<select\b([^>]*)>', low):
        for c in re.findall(r'class=["\']([^"\']*)', attrs): sel_classes |= set(c.split())
    for pre, body in re.findall(r'([^{}]+)\{([^{}]*)\}', lc):
        if re.search(r'(^|[\s,>+~])select\b', pre) or any(f'.{c}' in pre for c in sel_classes):
            if re.search(r'appearance\s*:|(^|[;\s])background\s*:', body): d.add('select')
    if js_makes('select') and 'select' not in sel_classes and re.search(r'appearance\s*:', lc): d.add('select')
    if sel('button') or classed('button') or js_makes('button') or re.search(r'type=["\']?(?:submit|button|reset)', lc): d.add('button')
    if sel('input') or classed(r'input') or js_makes('input'): d.add('field')
    if 'spin-button' in lc or re.search(r'type=["\']?number', lc): d.add('number')
    if sel('summary') or sel('details') or 'details-marker' in lc: d.add('details')
    if sel('dialog') or sel('progress') or sel('meter'): d.add('dialog')
    if re.search(r'(^|[\s,>+~}])a(?=[\s,.:\[{>+~])', lc): d.add('link')
    for k in ('hr', 'mark', 'kbd'):
        if sel(k): d.add(k)
    if sel('code') or sel('pre') or sel('samp'): d.add('code')
    if 'prefers-reduced-motion' in lc: d.add('motion')
    if 'color-scheme' in lc: d.add('scheme')
    return d

ABSENT_TESTS = {
    'field': r'<input|createelement\([\'"]input', 'textarea': r'textarea', 'select': r'<select|createelement\([\'"]select',
    'grip': r'textarea', 'number': r'number', 'check': r'checkbox|radio', 'range': r'range', 'file': r'type=["\']?file',
    'button': r'<button|createelement\([\'"]button|type=["\']?(?:submit|button|reset)', 'details': r'<details|<summary|[\'"]details[\'"]|[\'"]summary[\'"]',
    'dialog': r'<dialog|[\'"]dialog[\'"]', 'progress': r'<progress|<meter', 'link': r'<a[\s>]|createelement\([\'"]a[\'"]|<a href',
    'hr': r'<hr', 'mark': r'<mark', 'kbd': r'<kbd', 'code': r'<code|<pre|<samp', 'numerals': r'<td|<th|<time|<output|class=["\'][^"\']*\bnum\b',
    'scroller': r'overflow|textarea|<pre|<select',
}

def absent_kinds(html):
    low = html.lower()
    return {k for k, rx in ABSENT_TESTS.items() if not re.search(rx, low)}

def cut_sheet(system, dressed, ground):
    """The sheet with the parts the page dresses itself taken out, and its tokens made private."""
    out, kept = [], set()
    for pre, body in sheet(system):
        if pre.startswith('@media') and 'reduced-motion' in pre:
            if 'motion' in dressed: continue
            kept.add('motion'); out.append(f'{pre} {{ {body} }}'); continue
        if pre.startswith('@supports not selector(::-webkit-scrollbar)'):
            if 'scrollbar' in dressed: continue
            out.append(f'{pre} {{ {body} }}'); continue
        if pre.startswith('@supports'):  # the base-select popup
            if 'select' in dressed: continue
            out.append(f'{pre} {{ {body} }}'); continue
        sels = []
        for s in split_selectors(pre):
            k = 'grip' if (s == 'textarea' and body.startswith('resize')) else kind_of(s)
            if k == 'scheme': continue  # written per page below
            if k in dressed: continue
            sels.append(s); kept.add(k)
        if sels: out.append(f'{", ".join(sels)} {{ {body} }}')
    css = '\n'.join(out)
    css = re.sub(r'var\(--([\w-]+)\)', lambda m: f'var(--fx-{m.group(1)})', css)
    css = re.sub(r'\s*\n\s*', ' ', css).replace('{ ', '{').replace(' }', '}')
    css = re.sub(r'\} (?=\S)', '}\n', css)
    if 'scheme' not in dressed:
        css = f':root {{ color-scheme: {"light" if ground == "light" else "dark"}; }}\n' + css
        kept.add('scheme')
    return css, kept

# ── the head edits ──────────────────────────────────────────────────────────
def rel(from_path, to_path):
    return posixpath.relpath(to_path, posixpath.dirname(from_path) or '.')

def href(p): return quote(p, safe="/.-_~")

def ground_color(css, ptok, system, ground):
    for name in (['bg', 'paper', 'page', 'background'] if system == 'LL' else ['ground-000']):
        v = ptok.get(name)
        if v and re.match(r'#[0-9a-fA-F]{3,8}$', v.strip()): return v.strip()
    m = re.search(r'(?:^|[},\s])(?:html|body)\s*(?:,[^{]*)?\{[^}]*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8})\b', css)
    if m: return m.group(1)
    if system == 'LL': return '#0a0a0f' if ground != 'light' else '#f0eee5'
    return '#050a06' if ground == 'dark' else '#f0eee5'

FURN_BLOCK = re.compile(r'<style data-furniture="[^"]*">.*?</style>\n?', re.S)

def plan_page(r):
    for test, why in LEAVE:
        if test(r): return {'path': r['path'], 'left': why}
    p = r['path']
    html = (ROOT / p).read_text(encoding='utf-8')
    html = FURN_BLOCK.sub('', html)  # read the page as it was made, not with this fan-out's own block in it
    css = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', html, re.S | re.I))
    system = 'DT' if r['dress'].startswith('Drafting') else 'LL'
    ptok = page_tokens(css)
    ground = r['ground'] if r['ground'] in ('dark', 'light') else 'dark'
    pl = {'path': p, 'system': system, 'ground': ground, 'adds': []}
    if r['links_tokens']:
        if not r['links_controls']:
            pl['link_controls'] = posixpath.join(posixpath.dirname(r['links_tokens']), 'controls.css')
            pl['adds'].append('controls.css (link)')
    else:
        dressed = dressed_kinds(html, css)
        absent = absent_kinds(html)
        cut, kept = cut_sheet(system, dressed | absent, ground)
        block, borrowed = token_block(system, ground, ptok)
        pl['dressed_by_page'] = sorted(dressed); pl['dressed_here'] = sorted(kept - {'other', 'numerals', 'touch'}); pl['borrowed'] = borrowed
        pl['inline'] = (block, cut)
        pl['adds'].append('controls.css (inline)')
    if not r['icon']:
        if r['rich'] and not RICH_ICON: pl['icon_left'] = 'rich-face piece: a framed piece never owns a tab; the avatar belongs on the page that frames it'
        elif r['avatar']: pl['icon'] = href(rel(p, r['avatar'])); pl['adds'].append('icon (avatar)')
        elif r['entry']: pl['icon_left'] = f"its entry, {r['entry']}, has no avatar yet"
        else: pl['icon'] = href(rel(p, FAVICON)); pl['adds'].append('icon (Drafting Table mark)')
    if not r['theme_color']:
        pl['theme_color'] = ground_color(css, ptok, system, ground); pl['adds'].append('theme-color')
    if not r['lang']: pl['lang'] = True; pl['adds'].append('lang')
    return pl

def apply(pl):
    p = ROOT / pl['path']
    html = p.read_text(encoding='utf-8')
    orig = html
    if pl.get('lang') and not re.search(r'<html\b[^>]*\blang=', html, re.I):
        if re.search(r'<html\b', html, re.I): html = re.sub(r'<html\b', '<html lang="en"', html, count=1, flags=re.I)
        else:  # a head-less HTML5 page: the <html> start tag is optional, so write one carrying the language
            m = re.search(r'<!doctype[^>]*>', html, re.I)
            html = html[:m.end()] + '\n<html lang="en">' + html[m.end():] if m else '<html lang="en">\n' + html
    if pl.get('link_controls') and 'controls.css"' not in html:
        m = re.search(r'<link[^>]+colors_and_type\.css"[^>]*>', html)
        html = html[:m.end()] + f'\n<link rel="stylesheet" href="{pl["link_controls"]}">' + html[m.end():]
        # a framed piece that declares its token sheet declares the controls beside it (only Loudon Live's folder is shared)
        html = re.sub(r'(<meta name="piece:files" content="[^"]*?)(\S*/design-system/)colors_and_type\.css',
                      lambda m: f'{m.group(1)}{m.group(2)}colors_and_type.css {m.group(2)}controls.css', html, count=1)
    head_bits = []
    if pl.get('theme_color') and 'name="theme-color"' not in html: head_bits.append(f'<meta name="theme-color" content="{pl["theme_color"]}">')
    if pl.get('icon') and not re.search(r'<link[^>]+rel="icon"', html):
        typ = ' type="image/svg+xml"' if pl['icon'].endswith('.svg') else ''
        head_bits.append(f'<link rel="icon"{typ} href="{pl["icon"]}">')
    if pl.get('inline') and 'data-furniture' in html:  # a block from an earlier run: refresh it in place
        block, cut = pl['inline']
        html = re.sub(r'(<style data-furniture="[^"]*">.*?@layer furniture \{\n).*?(\n\}\n</style>)',
                      lambda m: m.group(1) + block + '\n' + cut + m.group(2), html, count=1, flags=re.S)
        html = re.sub(r'(Left out, because the page dresses it: )[^.]*(\. \*/)', lambda m: m.group(1) + (', '.join(pl['dressed_by_page']) or 'nothing') + m.group(2), html, count=1)
    elif pl.get('inline'):
        block, cut = pl['inline']
        src = (LL if pl['system'] == 'LL' else DT) + 'controls.css'
        left = ', '.join(pl['dressed_by_page']) or 'nothing'
        head_bits.append(
            f'<style data-furniture="{src} {TODAY}">\n'
            f'/* The browser\'s furniture, re-dressed: inlined from {src} on {TODAY} (_ops/furniture-fanout/furnish.py).\n'
            f'   In a layer, so every rule this page writes wins. Left out, because the page dresses it: {left}. */\n'
            f'@layer furniture {{\n{block}\n{cut}\n}}\n</style>')
    if head_bits:
        ins = '\n'.join(head_bits)
        # before the page's own first style or stylesheet, else at the end of the head
        # never ahead of <meta charset>: it must stay in the first 1024 bytes the browser scans for it
        cs = re.search(r'<meta[^>]+charset[^>]*>', html, re.I)
        floor = cs.end() if cs else 0
        m = re.search(r'<style\b|<link[^>]+rel=["\']?stylesheet', html[floor:], re.I)
        hm = re.search(r'</head>', html[floor:], re.I)
        if m and (not hm or m.start() < hm.start()): at = floor + m.start()
        elif hm: at = floor + hm.start()
        elif cs: at = cs.end()
        else:
            m = re.search(r'<html\b[^>]*>', html, re.I)
            at = m.end() if m else 0
        html = html[:at] + ('\n' if at else '') + ins + '\n' + html[at:]
    if html != orig: p.write_text(html, encoding='utf-8')
    return html != orig

def main():
    rows = json.load(open(HERE / 'census.json'))
    plans = [plan_page(r) for r in rows]
    args = sys.argv[1:]
    if '--plan' in args or not args:
        slim = [{k: v for k, v in pl.items() if k != 'inline'} for pl in plans]
        (HERE / 'plan.json').write_text(json.dumps(slim, indent=1, ensure_ascii=False) + '\n')
        from collections import Counter
        print('left:', Counter(pl.get('left') for pl in plans if pl.get('left')))
        print('adds:', Counter(a for pl in plans for a in pl.get('adds', [])))
        print('icon left:', Counter(pl.get('icon_left', '')[:40] for pl in plans if pl.get('icon_left')))
        return
    if '--apply' in args:
        prefixes = [a for a in args if not a.startswith('--')]
        n = 0
        for pl in plans:
            if pl.get('left') or not pl.get('adds'): continue
            if '--all' not in args and not any(pl['path'].startswith(x) for x in prefixes): continue
            if apply(pl): n += 1; print('furnished', pl['path'])
        print(n, 'pages')

if __name__ == '__main__':
    main()
