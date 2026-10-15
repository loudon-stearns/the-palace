#!/usr/bin/env python3
"""The board's mouse pointers, drawn as pixel sprites.

The bitmaps below are the source. Running this file turns them into SVG
data URIs and rewrites the block between `cursors:begin` and `cursors:end`
in both stylesheets, so the design system and the app's runtime copy can't
drift apart:

    python3 _ops/stigmergy/design-system/cursors.py

Key: '#' terminal black (the rim), 'o' phosphor, 'w' white phosphor,
'r' error red, '.' clear. Every rim pixel gets a faint phosphor ring around
it (the CRT bloom), so a sprite grows by one pixel on each side, and the
hotspots below are given in those padded coordinates.
"""
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
TARGETS = [HERE / 'colors_and_type.css', HERE.parent / 'app/src/styles/tokens.css']

COLORS = {'#': '#050a06', 'o': '#33ff66', 'w': '#d7f6dc', 'r': '#ff4136'}
BLOOM = ('#33ff66', 0.18)

ARROW = """
#...........
##..........
#o#.........
#oo#........
#ooo#.......
#oooo#......
#ooooo#.....
#oooooo#....
#ooooooo#...
#oooooooo#..
#ooooooooo#.
#oooooo#####
#ooo#oo#....
#oo##oo#....
#o#..#oo#...
##...#oo#...
#.....#oo#..
......#oo#..
.......##...
"""

HAND = """
.....##.........
....#oo#........
....#oo#........
....#oo#........
....#oo#........
....#oo###......
....#oo#oo###...
....#oo#oo#oo##.
.##.#oo#oo#oo#o#
#oo##oo#oo#oo#o#
#ooo#oooooooooo#
.#oo#oooooooooo#
..#ooooooooooo#.
..#ooooooooooo#.
...#oooooooooo#.
...#ooooooooo#..
....#oooooooo#..
....#oooooooo#..
....##########..
"""

BEAM = """
###.###
#oo#oo#
###o###
..#o#..
..#o#..
..#o#..
..#o#..
..#o#..
..#o#..
..#o#..
..#o#..
..#o#..
###o###
#oo#oo#
###.###
"""

HOURGLASS = """
#######
#wwwww#
.#www#.
..#w#..
.#w.w#.
#wwwww#
#######
"""


def grid(s):
    rows = s.strip('\n').split('\n')
    w = max(len(r) for r in rows)
    return [r.ljust(w, '.') for r in rows]


def no_entry(n=11):
    """A red ring and slash on a black disc: the no-entry badge."""
    c = (n - 1) / 2
    rows = []
    for y in range(n):
        row = ''
        for x in range(n):
            d = ((x - c) ** 2 + (y - c) ** 2) ** 0.5
            if d > c + 0.5: row += '.'
            elif d > c - 0.6: row += '#'
            elif d > c - 2.0 or abs(x - y) < 0.8: row += 'r'
            else: row += '#'
        rows.append(row)
    return rows


def badge(base, mark, ox, oy):
    """Lay a small mark over a sprite at (ox, oy), growing it if needed."""
    w = max(len(base[0]), ox + len(mark[0]))
    h = max(len(base), oy + len(mark))
    out = [list(r.ljust(w, '.')) for r in base] + [list('.' * w) for _ in range(h - len(base))]
    for y, r in enumerate(mark):
        for x, ch in enumerate(r):
            if ch != '.':
                out[oy + y][ox + x] = ch
    return [''.join(r) for r in out]


# name -> (bitmap, hotspot, the system cursor to fall back on)
SPRITES = {
    'arrow':       (grid(ARROW), (1, 1), 'default'),
    'pointer':     (grid(HAND), (6, 1), 'pointer'),
    'text':        (grid(BEAM), (4, 8), 'text'),
    'not-allowed': (badge(grid(ARROW), no_entry(), 7, 10), (1, 1), 'not-allowed'),
    'wait':        (badge(grid(ARROW), grid(HOURGLASS), 8, 12), (1, 1), 'wait'),
}


def svg(bitmap, scale):
    """One path per colour, one rect-run per stretch of a row."""
    w, h = len(bitmap[0]) + 2, len(bitmap) + 2
    px = {}
    for y, r in enumerate(bitmap):
        for x, ch in enumerate(r):
            if ch in COLORS:
                px[(x + 1, y + 1)] = (COLORS[ch], 1)
    for (x, y), (col, _) in list(px.items()):
        if col == COLORS['#']:
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    px.setdefault((x + dx, y + dy), BLOOM)
    by_fill = {}
    for (x, y), fill in px.items():
        by_fill.setdefault(fill, []).append((y, x))
    paths = []
    for (col, alpha), cells in by_fill.items():
        cells.sort()
        d, i = [], 0
        while i < len(cells):
            y, x = cells[i]
            j = i
            while j + 1 < len(cells) and cells[j + 1] == (y, cells[j][1] + 1):
                j += 1
            d.append(f'M{x} {y}h{j - i + 1}v1h-{j - i + 1}z')
            i = j + 1
        op = '' if alpha == 1 else f" fill-opacity='{alpha}'"
        paths.append(f"<path fill='{col}'{op} d='{''.join(d)}'/>")
    body = (f"<svg xmlns='http://www.w3.org/2000/svg' width='{w * scale}' height='{h * scale}' "
            f"viewBox='0 0 {w} {h}' shape-rendering='crispEdges'>{''.join(paths)}</svg>")
    return 'data:image/svg+xml,' + body.replace('#', '%23').replace('<', '%3C').replace('>', '%3E')


def block():
    lines = ['/* cursors:begin — written by design-system/cursors.py; edit the bitmaps there, not here */',
             ':root {']
    for name, (bitmap, (hx, hy), fallback) in SPRITES.items():
        lines.append(f'  --cursor-{name}: image-set(url("{svg(bitmap, 1)}") 1x, '
                     f'url("{svg(bitmap, 2)}") 2x) {hx} {hy}, {fallback};')
    lines += ['}', '/* cursors:end */']
    return '\n'.join(lines)


if __name__ == '__main__':
    pattern = re.compile(r'/\* cursors:begin.*?/\* cursors:end \*/', re.S)
    new = block()
    for path in TARGETS:
        text = path.read_text()
        if not pattern.search(text):
            raise SystemExit(f'{path}: no cursors:begin / cursors:end markers')
        path.write_text(pattern.sub(lambda _: new, text))
        print(f'wrote {path.relative_to(HERE.parent.parent.parent)}')
