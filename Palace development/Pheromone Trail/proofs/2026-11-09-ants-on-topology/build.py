#!/usr/bin/env python3
"""Build the data for ants-on-topology.html from the palace's own git history.

Usage:  python3 build.py <palace root> <map json> <out dir>

Writes  data.js    window.PALACE = {nodes, pairs, commits, days, meta}
        icons.webp one sheet of every page's avatar, circle-cut, 64px cells

What each number is:
  node.born   day of the first commit that touched the page file itself
              (renames followed with git's -M).
  pair.born   first day the typed link shows in a page's frontmatter, read
              from the last commit of every day with `git grep`. A pair is
              undirected: the earlier of the two directions.
  commit      one non-merge commit: its time, subject, and the map pages it
              touched (the page file or anything in its bundle folder).
"""
import json, math, os, re, subprocess, sys, collections
import numpy as np
from PIL import Image, ImageDraw

root, map_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
G = ['git', '-C', root, '-c', 'core.quotepath=off']
def git(*a):
    return subprocess.run(G + list(a), capture_output=True, text=True, check=True).stdout

m = json.load(open(map_path))
nodes = m['nodes']
N = len(nodes)
idx = {n['id']: i for i, n in enumerate(nodes)}
stem = lambda p: p[:-3] if p.endswith('.md') else p

# ---- history: renames, touches, births -------------------------------------
alias = {stem(n['path']): i for i, n in enumerate(nodes)}     # path stem -> node
title_alias = dict(idx)                                       # page title -> node
log = git('log', '--no-merges', '--name-status', '-M', '--format=@%H|%at|%s')
raw = []                                                      # newest first
cur = None
for line in log.split('\n'):
    if line.startswith('@'):
        h, t, s = line[1:].split('|', 2)
        cur = {'h': h, 't': int(t), 's': s, 'files': []}
        raw.append(cur)
    elif line.strip() and cur is not None:
        parts = line.split('\t')
        if parts[0].startswith('R') and len(parts) == 3:
            old, new = parts[1], parts[2]
            if new.endswith('.md') and old.endswith('.md') and stem(new) in alias:
                alias.setdefault(stem(old), alias[stem(new)])
                title_alias.setdefault(os.path.basename(stem(old)), alias[stem(new)])
            cur['files'].append(new); cur['files'].append(old)
        elif len(parts) >= 2:
            cur['files'].append(parts[-1])

def node_of(path):
    """(node, is_page_file) for a path, or (None, False)."""
    if path.endswith('.md') and stem(path) in alias:
        return alias[stem(path)], True
    d = os.path.dirname(path)
    while d:
        if d in alias:
            return alias[d], False
        d = os.path.dirname(d)
    return None, False

t0 = min(c['t'] for c in raw)
day = lambda t: (t - t0) / 86400.0
born = [None] * N
commits = []
for c in reversed(raw):                                       # oldest first
    touched = []
    for f in c['files']:
        i, is_page = node_of(f)
        if i is None: continue
        if i not in touched: touched.append(i)
        if is_page and born[i] is None: born[i] = day(c['t'])
    if touched:
        commits.append([round(day(c['t']), 3), c['s'][:110], touched, c['h'][:8]])
last_day = day(max(c['t'] for c in raw))
for i in range(N):
    if born[i] is None: born[i] = last_day                    # never seen: flag below
unseen = [nodes[i]['id'] for i in range(N) if born[i] == last_day]

# ---- link births: the last commit of each day ------------------------------
by_day = {}
for c in raw:                                                 # newest first: first seen = last of day
    by_day.setdefault(int(day(c['t'])), c['h'])
want = {}
for e in m['edges']:
    a, b = idx.get(e['source']), idx.get(e['target'])
    if a is None or b is None or a == b: continue
    k = (min(a, b), max(a, b))
    want.setdefault(k, e['type'])
pair_born = {}
tgt = re.compile(r'^[^:]+:(.*?\.md):\s*-?\s*target:\s*["\']?\[\[([^\]|#]+)')
for d in sorted(by_day):
    r = subprocess.run(G + ['grep', '-E', r'^[[:space:]]*-?[[:space:]]*target:', by_day[d], '--', '*.md'],
                       capture_output=True, text=True)
    for line in r.stdout.split('\n'):
        mm = tgt.match(line)
        if not mm: continue
        a = alias.get(stem(mm.group(1)))
        b = title_alias.get(mm.group(2).strip())
        if a is None or b is None or a == b: continue
        k = (min(a, b), max(a, b))
        if k in want and k not in pair_born:
            pair_born[k] = float(d)
    if len(pair_born) == len(want): break
never = [k for k in want if k not in pair_born]
for k in never:
    pair_born[k] = max(born[k[0]], born[k[1]])
for k in pair_born:                                           # a link cannot predate its pages
    pair_born[k] = round(max(pair_born[k], born[k[0]], born[k[1]]), 3)

# ---- layout: force-directed, with a clearing in the middle for the nest ----
rng = np.random.default_rng(7)
ang = rng.uniform(0, 2 * math.pi, N); rad = 300 + 500 * np.sqrt(rng.uniform(0, 1, N))
P = np.stack([np.cos(ang) * rad, np.sin(ang) * rad], 1)
E = np.array(list(want.keys()))
kk = 95.0
HOLE = 210.0
for it in range(700):
    temp = 60 * (1 - it / 700) + 1
    D = P[:, None, :] - P[None, :, :]
    dist = np.sqrt((D ** 2).sum(-1)) + 1e-6
    F = (D / dist[..., None] * (kk * kk / dist)[..., None]).sum(1)          # repel
    d = P[E[:, 0]] - P[E[:, 1]]
    dl = np.sqrt((d ** 2).sum(-1)) + 1e-6
    f = d / dl[:, None] * (dl * dl / kk)[:, None] * 0.12                    # links pull
    np.add.at(F, E[:, 0], -f); np.add.at(F, E[:, 1], f)
    r = np.sqrt((P ** 2).sum(-1)) + 1e-6
    F -= P * 0.045 * (r / kk)[:, None]                                      # gravity
    push = np.clip(HOLE - r, 0, None)
    F += P / r[:, None] * (push * 6)[:, None]                               # the clearing
    fl = np.sqrt((F ** 2).sum(-1)) + 1e-6
    P += F / fl[:, None] * np.minimum(fl, temp)[:, None]
P[:, 0] *= 1.55                                                              # screens are wide
use = np.array([n['use']['use'] for n in nodes], float)
R = 11 + 13 * np.sqrt(use / use.max())
for it in range(120):                                                        # no stacked icons
    D = P[:, None, :] - P[None, :, :]
    dist = np.sqrt((D ** 2).sum(-1)) + 1e-6
    need = R[:, None] + R[None, :] + 12
    over = np.clip(need - dist, 0, None); np.fill_diagonal(over, 0)
    P += (D / dist[..., None] * (over * 0.5)[..., None]).sum(1) * 0.5
    r = np.sqrt((P ** 2).sum(-1)) + 1e-6
    push = np.clip(HOLE * 0.8 - r, 0, None)
    P += P / r[:, None] * push[:, None]

# ---- the icon sheet ---------------------------------------------------------
CELL = 64; COLS = 19; ROWS = math.ceil(N / COLS)
sheet = Image.new('RGBA', (COLS * CELL, ROWS * CELL), (0, 0, 0, 0))
mask = Image.new('L', (CELL * 4, CELL * 4), 0)
ImageDraw.Draw(mask).ellipse((4, 4, CELL * 4 - 4, CELL * 4 - 4), fill=255)
mask = mask.resize((CELL, CELL), Image.LANCZOS)
no_icon = []
for i, n in enumerate(nodes):
    base = os.path.join(root, stem(n['path']))
    ic = os.path.join(base, os.path.basename(base) + ' — icon.png')
    if not os.path.exists(ic):
        no_icon.append(n['id']); continue
    im = Image.open(ic).convert('RGB').resize((CELL, CELL), Image.LANCZOS)
    sheet.paste(im, ((i % COLS) * CELL, (i // COLS) * CELL), mask)
sheet.save(os.path.join(out, 'icons.webp'), 'WEBP', quality=82, method=6)

# ---- write ------------------------------------------------------------------
hist = collections.Counter(int(c[0]) for c in commits)
ndays = int(last_day) + 1
data = {
    'meta': {
        'map': os.path.basename(map_path), 'head': git('rev-parse', '--short', 'HEAD').strip(),
        'first': t0, 'days': ndays, 'cell': CELL, 'cols': COLS,
        'commits_all': len(raw), 'commits_on_map': len(commits),
        'pairs': len(want), 'pairs_dated_by_grep': len(want) - len(never),
        'no_icon': no_icon, 'born_unseen': unseen,
    },
    'nodes': [{'id': n['id'], 'type': n['type'], 'x': round(float(P[i, 0]), 1), 'y': round(float(P[i, 1]), 1),
               'r': round(float(R[i]), 1), 'born': round(born[i], 3), 'icon': n['id'] not in no_icon}
              for i, n in enumerate(nodes)],
    'pairs': [[a, b, pair_born[(a, b)], want[(a, b)]] for (a, b) in want],
    'commits': commits,
    'hist': [hist.get(d, 0) for d in range(ndays)],
}
with open(os.path.join(out, 'data.js'), 'w') as f:
    f.write('window.PALACE = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps(data['meta'], indent=1, ensure_ascii=False)[:1500])
print('big commits (>12 pages):', sum(1 for c in commits if len(c[2]) > 12))
print('extent x', P[:, 0].min(), P[:, 0].max(), 'y', P[:, 1].min(), P[:, 1].max())
