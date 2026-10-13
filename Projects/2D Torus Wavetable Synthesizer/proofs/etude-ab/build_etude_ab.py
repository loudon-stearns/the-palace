# build_etude_ab.py — builds etude-ab.html: the third and fourth drafts of Étude No. 2 in one
# player, switchable at the same musical position, with a note box per section.
# Audio is embedded (AAC 80 kb/s) so the page plays inside the board's sandbox.
#   ffmpeg -i ../../Etude/etude_two_c_threshold.wav -c:a aac -b:a 80k /tmp/torus_ab_c_threshold.m4a
#   ffmpeg -i ../../Etude/etude_two_d_two_grooves.wav -c:a aac -b:a 80k /tmp/torus_ab_d_two_grooves.m4a
#   python3 build_etude_ab.py
import base64, json, os
here = os.path.dirname(os.path.abspath(__file__)); et = os.path.join(here, '..', '..', 'Etude')
def draft(tag, name, label):
    d = json.load(open(os.path.join(et, f'etude_two_{tag}_locks.json')))
    b64 = base64.b64encode(open(f'/tmp/torus_ab_{tag}_{name}.m4a', 'rb').read()).decode()
    return {'label': label, 'dur': d['duration_s'], 'marks': [s[0] for s in d['sections']], 'src': 'data:audio/mp4;base64,' + b64}
D = [draft('c', 'threshold', 'third draft · one groove'), draft('d', 'two_grooves', 'fourth draft · two grooves')]
SECTIONS = [
  ['I · one point', 'Free time. The instrument sits at a single point on the sphere.', 'same in both'],
  ['Staircase', 'Speeds up from 50 to 80 beats a minute; the lock steps come faster and the groove arrives inside them.', 'same in both'],
  ['II · the knot, 12/8', 'West African bell, uneven triplets, the kick walking the four beats.', 'same in both'],
  ['Let go', 'Slows to 56 and speeds back up; the coupling lets go and the scan lines slip in time with the tempo.', 'same in both'],
  ['III · the hands', 'Third draft: still 12/8, kick at half time in 3+3+2, the motif stretched to twice its length. Fourth draft: 7/8 grouped 2+2+3, the motif as call and answer.', 'THE CHANGE'],
  ['B · the answer', 'The bell drops out, the kick becomes a frame drum, the tempo breathes phrase by phrase.', 'same, starts 3 s later'],
  ['IV', 'Free time again, unchanged since the second draft.', 'same, starts 3 s later'],
  ['Coda', 'The ending you named as your favorite, unchanged.', 'same, starts 3 s later'],
]
html = open(os.path.join(here, 'etude_ab_template.html')).read()
html = html.replace('/*DATA*/null', json.dumps({'drafts': D, 'sections': SECTIONS}))
open(os.path.join(here, 'etude-ab.html'), 'w').write(html)
print('etude-ab.html', round(len(html) / 1e6, 2), 'MB')
