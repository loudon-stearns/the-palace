import json, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt, numpy as np
d = json.load(open('stretch-by-pitch.json')); P = d['pitches']
fig, ax = plt.subplots(figsize=(8, 4.6), dpi=130); fig.patch.set_facecolor('#0b0d10'); ax.set_facecolor('#0b0d10')
col = {0.33: '#6fa8dc', 0.67: '#f39c3d', 0.83: '#e06666'}
for r in d['rows']:
    if r['stiff'] == 0: continue
    ax.plot(P, np.maximum(r['p8'], 0.5), color=col[r['stiff']], lw=2 if r['version'] == 'v1.5' else 1.2,
            ls='-' if r['version'] == 'v1.5' else ':', marker='o' if r['version'] == 'v1.5' else None, ms=3,
            label=f"{r['version']} · stiffness {r['stiff']}")
    if r['version'] == 'v1.5': ax.axhline(d['law_p8'][str(r['stiff'])], color=col[r['stiff']], lw=0.6, alpha=0.5)
ax.set_xscale('log'); ax.set_yscale('log'); ax.set_xticks(P); ax.set_xticklabels(['E2','A2','D3','G3','C4','E4','A4','D5','E5','A5'])
ax.set_xlabel('note', color='#cfd3d8'); ax.set_ylabel('partial 8, cents sharp of 8 × f0', color='#cfd3d8')
ax.set_title('same slider, every pitch: dotted = v1.4 (one coefficient), solid = v1.5 (designed per note)\nfaint lines: the stiff-string law the slider now asks for', color='#cfd3d8', fontsize=9)
ax.tick_params(colors='#9aa1a9'); [s.set_color('#2a3038') for s in ax.spines.values()]
ax.minorticks_off(); ax.set_xticks(P); ax.legend(fontsize=7, facecolor='#11151a', edgecolor='#2a3038', labelcolor='#cfd3d8', ncol=3, loc='upper left')
ax.grid(color='#1e242b', lw=0.5); fig.tight_layout(); fig.savefig('stretch-by-pitch.png', facecolor=fig.get_facecolor())
