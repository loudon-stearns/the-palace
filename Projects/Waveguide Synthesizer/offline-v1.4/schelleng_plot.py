# Draws the two maps from schelleng_map.mjs and position_map.mjs.
import json, os, numpy as np
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
HERE = os.path.dirname(os.path.abspath(__file__))
BG, FG, DIM = '#0b0d10', '#cfd3d8', '#8a929b'
def style(ax):
    ax.set_facecolor(BG); ax.tick_params(colors=DIM, labelsize=8)
    for s in ax.spines.values(): s.set_color('#2a323b')

m = json.load(open(os.path.join(HERE, 'schelleng-map.json')))
order = ['skates', 'multiple', 'helmholtz', 'raucous', 'stuck']
names = {'skates': 'skates: no grip, no note', 'multiple': 'slips 2-3 times a cycle',
         'helmholtz': 'sings: one slip a cycle (Helmholtz)', 'raucous': 'raucous: not periodic',
         'stuck': 'stuck: dragged aside, then still'}
cols = ['#1a2128', '#5a7a9a', '#ff7a3d', '#b8436a', '#3a2a1c']
G = np.array([[order.index(c) for c in row] for row in m['cls']])
fig, ax = plt.subplots(1, 2, figsize=(14, 5.4), facecolor=BG, gridspec_kw={'width_ratios': [1, 1.25]})
style(ax[0])
ax[0].imshow(G, origin='lower', aspect='auto', cmap=ListedColormap(cols), vmin=-0.5, vmax=4.5,
             extent=[m['speeds'][0] - 0.0475, m['speeds'][-1] + 0.0475, -1/32, 1 + 1/32])
ax[0].plot([0.5], [0.7], marker='o', ms=9, mfc='none', mec='#e8e2d4', mew=1.6)
ax[0].annotate('default', (0.5, 0.7), xytext=(0.56, 0.76), color='#e8e2d4', fontsize=9)
ax[0].set_xlabel('bow speed', color=DIM); ax[0].set_ylabel('bow force', color=DIM)
ax[0].set_title(f'where the bow sings: G3 ({m["f0"]:g} Hz), bow at {m["pos"]}\n'
                'too light and fast, it skates or slips twice; too heavy and slow, it sticks', color=FG, fontsize=10)
for k, c in enumerate(cols):
    ax[0].plot([], [], 's', color=c, ms=9, label=names[order[k]])
ax[0].legend(loc='upper left', bbox_to_anchor=(0, -0.13), ncol=2, fontsize=8, frameon=False, labelcolor=FG)

p = json.load(open(os.path.join(HERE, 'position-map.json')))
S = np.array(p['slips']); C = np.where(S < 1.15, 0, np.where(S < 2.15, 1, 2))
style(ax[1])
ax[1].imshow(C, origin='lower', aspect='auto', cmap=ListedColormap(['#ff7a3d', '#5a7a9a', '#2e4a66']), vmin=-0.5, vmax=2.5,
             extent=[p['poss'][0] - 0.005, p['poss'][-1] + 0.005, -0.5, len(p['freqs']) - 0.5])
ax[1].set_yticks(range(len(p['freqs']))); ax[1].set_yticklabels([f'{f:g} Hz' for f in p['freqs']])
for n in range(4, 11):            # bow at 1/n of the string from the bridge
    x = 1 - 1 / n
    if p['poss'][0] - 0.005 <= x <= p['poss'][-1] + 0.005:
        ax[1].axvline(x, color='#e8e2d4', lw=0.6, ls=':', alpha=0.7)
        ax[1].text(x + 0.002, -0.4, f'1/{n}', color='#0b0d10', fontsize=8, ha='left', va='bottom', fontweight='bold')
ax[1].axvline(0.74, color='#e8e2d4', lw=1.4)
ax[1].set_xlabel('bow position (0 = nut, 1 = bridge); dotted: 1/n of the string from the bridge', color=DIM)
ax[1].set_title(f'where along the string it sings, at speed {p["speed"]}, force {p["force"]}\n'
                'orange: one slip a cycle · blue: two · dark: three or more · solid line: the default, 0.74',
                color=FG, fontsize=10)
plt.tight_layout()
plt.savefig(os.path.join(HERE, 'schelleng-map.png'), dpi=110, facecolor=BG)
print('ok')
