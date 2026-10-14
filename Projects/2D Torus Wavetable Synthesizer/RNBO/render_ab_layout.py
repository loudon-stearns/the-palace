# render_ab_layout.py — draw torus-ab.maxpat as a picture, so the board
# can show the patch before anyone opens Max. Amber cords carry audio.
import json, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
p = json.load(open('torus-ab.maxpat'))['patcher']; ids = {b['box']['id']: b['box'] for b in p['boxes']}
fig, ax = plt.subplots(figsize=(11, 12.5), dpi=110); ax.set_xlim(0, 1000); ax.set_ylim(1090, 0); ax.axis('off')
fig.patch.set_facecolor('#1b1b1f')
for l in p['lines']:
    (s, so), (d, di) = l['patchline']['source'], l['patchline']['destination']; s, d = ids[s], ids[d]
    sx, sy, sw, sh = s['patching_rect']; dx, dy, dw, dh = d['patching_rect']
    x1 = sx + (sw - 6) * (so / max(1, s['numoutlets'] - 1)) + 3; x2 = dx + (dw - 6) * (di / max(1, d['numinlets'] - 1)) + 3
    sig = (s.get('outlettype') or [''])[so] == 'signal'
    ax.plot([x1, x2], [sy + sh, dy], color='#e8b04a' if sig else '#8a8a95', lw=1.4 if sig else .8, alpha=.85)
for b in ids.values():
    x, y, w, h = b['patching_rect']; mc = b['maxclass']
    if mc == 'comment': ax.text(x, y + 12, b['text'], color='#c9c4b5', fontsize=6.3, va='center'); continue
    t = b.get('text') or {'flonum': '0.0', 'umenu': 'listen ▾', 'ezdac~': '◉ dac', 'scope~': 'scope~'}.get(mc, mc)
    fc = '#3b2f4f' if t.startswith('rnbo~') or mc == 'scope~' else '#24404a' if t.startswith('2d.wave~') else {'message': '#3a3a44'}.get(mc, '#26262c')
    ax.add_patch(Rectangle((x, y), w, h, fc=fc, ec='#777', lw=.6))
    ax.text(x + 4, y + h / 2, t if len(t) < 50 else t[:22] + '…' + t[-24:], color='#eee', fontsize=6.3, va='center', family='monospace')
ax.set_title('torus-ab.maxpat — the codebox against 2d.wave~ (amber = audio cords)', color='#eee', fontsize=10)
plt.savefig('torus-ab-layout.png', facecolor=fig.get_facecolor(), bbox_inches='tight')
