#!/usr/bin/env python3
"""transport.py: put the house's player on the pages that still show the OS audio player (2026-11-03).

  python3 _ops/furniture-fanout/transport.py --plan           which pages, and why some are left
  python3 _ops/furniture-fanout/transport.py --apply          write it

Per page (an artifact with <audio controls>, furnished by furnish.py, Loudon Live dress):
  · a <style data-transport> before </head>: transport.css in @layer furniture with the page's own --fx-* tokens
    (the block furnish.py already wrote for the page, re-derived here the same way), so the player wears the page;
  · a <script data-transport> before </body>: transport.js, which replaces every <audio controls> on load.
A page already carrying either keeps its own. Records of past runs (Archive/) are left as they were made;
a <video controls> is left (the Transport plays audio). The two generators that make three of these pages
(compare.py, build_listening_sheet.py) are named in the plan, not changed: their next run drops the player
until they learn it, which is their owners' change.
"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
TODAY = '2026-11-03'
sys.path.insert(0, str(HERE))
from furnish import page_tokens, token_block, FURN_BLOCK  # noqa: E402

LL = '_ops/loudon-live/design-system/'
CSS = ROOT / LL / 'transport.css'
JS = ROOT / LL / 'transport.js'

LEAVE = [
    (lambda p: '/Archive/' in p or p.startswith(('_ops/swarm/sessions/', '_ops/Harvest Ceremony/Archive/')), 'a record of a past run: it stays as it was made (Loudon, 2026-11-03)'),
]
GENERATED = {
    'Projects/Generative Sample Libraries/ai-source-probe/compare.html': 'compare.py',
    'Projects/Generative Sample Libraries/ai-source-probe/compare.prompt-shape.html': 'compare.py',
    'Projects/Generative Sample Libraries/ai-source-probe/report.mock.html': 'compare.py',
    'Projects/Semantic Delay/standalone/demo/listening-sheet.html': 'build_listening_sheet.py',
}

def pages():
    import subprocess
    files = subprocess.run(['git', '-c', 'core.quotepath=off', 'ls-files', '-z'], cwd=ROOT, capture_output=True).stdout.decode().split('\0')
    out = []
    for f in files:
        if not f.lower().endswith('.html') or 'node_modules' in f or f.startswith(('.claude/', '_tools/')) or '/design-system/' in f: continue
        try: html = (ROOT / f).read_text(encoding='utf-8')
        except Exception: continue
        if re.search(r'<audio\b[^>]*\bcontrols\b', html, re.I): out.append(f)
    return sorted(out)

def layered_css():
    css = re.sub(r'/\*.*?\*/', '', CSS.read_text(), flags=re.S)
    css = re.sub(r'var\(--([\w-]+)\)', lambda m: f'var(--fx-{m.group(1)})', css)
    css = re.sub(r'\s*\n\s*', ' ', css).strip()
    css = re.sub(r'\} (?=\S)', '}\n', css)
    return css

def plan_page(p):
    for test, why in LEAVE:
        if test(p): return {'path': p, 'left': why}
    html = (ROOT / p).read_text(encoding='utf-8')
    pl = {'path': p, 'adds': []}
    if 'data-furniture' not in html and 'controls.css' not in html:
        pl['left'] = 'not furnished by furnish.py: the furniture comes first'; return pl
    if 'data-transport' in html: pl['left'] = 'already carries the transport'; return pl
    if re.search(r'<html\b[^>]*data-theme=', html) or 'drafting-table/design-system' in html:
        pl['left'] = 'Drafting Table dress: give it dt-transport.js by hand'; return pl
    css = '\n'.join(re.findall(r'<style(?![^>]*data-furniture)[^>]*>(.*?)</style>', html, re.S | re.I))
    ptok = page_tokens(css)
    m = re.search(r'name="theme-color" content="(#[0-9a-fA-F]{3,8})"', html)
    ground = 'light' if (m and luminance(m.group(1)) > 0.5) else 'dark'
    block, borrowed = token_block('LL', ground, ptok)
    pl.update(ground=ground, borrowed=borrowed, n_audio=len(re.findall(r'<audio\b', html, re.I)), block=block)
    if p in GENERATED: pl['generator'] = GENERATED[p]
    pl['adds'] = ['transport.css (inline, layered)', 'transport.js (inline)']
    return pl

def luminance(hx):
    hx = hx.lstrip('#'); hx = ''.join(c * 2 for c in hx) if len(hx) in (3, 4) else hx
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def apply(pl):
    p = ROOT / pl['path']; html = p.read_text(encoding='utf-8'); orig = html
    style = (f'<style data-transport="{LL}transport.css {TODAY}">\n'
             f'/* The house\'s player: inlined from {LL}transport.css on {TODAY} (_ops/furniture-fanout/transport.py), in the furniture layer, on the page\'s own tokens. */\n'
             f'@layer furniture {{\n{pl["block"]}\n{layered_css()}\n}}\n</style>')
    js = JS.read_text().replace('</script', '<\\/script')
    script = (f'<script data-transport="{LL}transport.js {TODAY}">\n'
              f'/* The house\'s player: inlined from {LL}transport.js on {TODAY} (_ops/furniture-fanout/transport.py). It replaces every <audio controls> above with a ▸ ■ button, a hairline scrub and the time said twice. */\n'
              f'{js}\n</script>')
    hm = re.search(r'</head>', html, re.I)
    if hm: html = html[:hm.start()] + style + '\n' + html[hm.start():]
    else:
        fm = re.search(r'<style data-furniture="[^"]*">.*?</style>', html, re.S)
        html = html[:fm.end()] + '\n' + style + html[fm.end():]
    bm = re.search(r'</body>', html, re.I)
    html = (html[:bm.start()] + script + '\n' + html[bm.start():]) if bm else (html.rstrip('\n') + '\n' + script + '\n')
    if html != orig: p.write_text(html, encoding='utf-8')
    return html != orig

def main():
    plans = [plan_page(p) for p in pages()]
    args = sys.argv[1:]
    if '--apply' in args:
        n = 0
        for pl in plans:
            if pl.get('left'): continue
            if apply(pl): n += 1; print('transport on', pl['path'], f'({pl["n_audio"]} players)')
        print(n, 'pages')
    else:
        slim = [{k: v for k, v in pl.items() if k != 'block'} for pl in plans]
        (HERE / 'transport-plan.json').write_text(json.dumps(slim, indent=1, ensure_ascii=False) + '\n')
        for pl in slim: print(('left   ' if pl.get('left') else 'do     ') + pl['path'] + ('  · ' + pl['left'] if pl.get('left') else f'  · {pl["n_audio"]} players, {pl["ground"]}' + (f', made by {pl["generator"]}' if pl.get('generator') else '')))

if __name__ == '__main__':
    main()
