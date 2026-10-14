# build_journey_map.py — builds journey-map.html: the fifth draft of Étude No. 2 ("The Hero's Journey")
# laid out on the monomyth circle. Angle is time, the ring is measured loudness (0.5 s windows), its colour
# is measured brightness (spectral centroid). One note box per chapter, gathered for pasting into the card.
# Audio is embedded (AAC 80 kb/s) so the page plays inside the board's sandbox.
#   ffmpeg -i ../../Etude/etude_two_e_heros_journey.wav -c:a aac -b:a 80k /tmp/torus_journey_e.m4a
#   python3 build_journey_map.py
import base64, json, os
import numpy as np, soundfile as sf
here = os.path.dirname(os.path.abspath(__file__)); et = os.path.join(here, '..', '..', 'Etude')
d = json.load(open(os.path.join(et, 'etude_two_e_locks.json')))
x, sr = sf.read(os.path.join(et, 'etude_two_e_heros_journey.wav')); m = x.mean(1)
hop = sr // 2; n = len(m) // hop; f = np.fft.rfftfreq(hop, 1 / sr); w = np.hanning(hop)
db, cen = [], []
for i in range(n):
    s = m[i * hop:(i + 1) * hop]
    db.append(round(float(20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9)), 1))
    sp = np.abs(np.fft.rfft(s * w)); cen.append(int((sp * f).sum() / (sp.sum() + 1e-12)))
# [title, start, what happens, the feeling it is meant to carry, who sounds]
CH = [
  ['1 · the ordinary world', 0, 'The hero alone at the pole of the sphere, where the instrument is a plain 1D wavetable synth, singing its motif A C E D twice in free time.', 'home, small, untroubled', 'the hero (Penrose)'],
  ['2 · the call', 14.5, 'The mentor whistles E C♯ A from just off its ratio, so it slips faintly. The hero climbs three locks, unsure, the steps coming faster.', 'something distant pulling', 'the mentor (Knot Shadow 3:2), the hero'],
  ['3 · refusal', 25, 'The coupling lets go and the hero slides back down to the pole through every ratio in between, the smear of the first étude. It tries the motif and stops on E.', 'fear, a half-step back', 'the hero'],
  ['4 · the mentor', 37.4, 'A two-voice canon in free time: the mentor sings the motif upside down, the hero copies it two beats later and lower, then moves against it. Ends on E over G♯.', 'being taught; the question left open', 'the mentor, the hero'],
  ['5 · the threshold', 51.88, 'The guardian growls and swells; the tempo arrives, speeding from 46 to 80, and the hero climbs the staircase one lock a bar.', 'the door, and going through it', 'the guardian (Chladni Ghost), the hero, kick'],
  ['6 · tests, allies, enemies', 67.51, 'The 12/8 groove with bell and stretched eighths; the reed\'s ostinato and its variations; the trickster clicks a new lock in each gap of the bell, five against twelve.', 'busy, bright, slightly unsettled', 'the ally (reed), the trickster (Matérn Field), drums'],
  ['7 · the inmost cave', 103.51, 'The tempo slides from 80 down to 40 and stays. The reed holds B, slipping as the tempo falls; the stair clicks down its strange scale, 293 to 73 Hz.', 'descending, the light going', 'the reed, the stair (Stiff String)'],
  ['8 · the ordeal', 120.73, 'Free time. The shadow rises, churning; the reed is torn through the atlas in leaps from 55 to 1145 Hz; the hero slows toward stillness. Then 1.6 s of true silence.', 'death and the void', 'the shadow (Fisher Ridge), the reed, the hero'],
  ['9 · the reward', 149.73, 'A coupling snap grabs the hero back onto 1:2, and the 7/8 hands arrive. Call and answer; the trickster colours every group start. The cadence stops on B.', 'rebirth, a strange new energy', 'the hero, the reed, the trickster, drums'],
  ['10 · the road back', 176.93, '12/8 again, speeding from 80 to 96. The stair runs a six-note cell up its scale; the reed and mentor chase the motif, then climb in contrary motion and never land.', 'pursuit, rising pressure', 'the stair, the reed, the mentor, drums'],
  ['11 · resurrection', 198.69, 'Every pitched voice lets go and is stirred for four seconds, then all are grabbed together: the motif in three voices, the stair\'s bass playing it inside its strange scale.', 'everything at stake, then a new whole', 'everyone pitched'],
  ['12 · the return', 214.37, 'The breathing B theme, then the ending you liked, unchanged: let go together, the coda home to the 1D point, with the stair faint above playing A C E D in its scale.', 'home, but changed', 'everyone, then the hero alone'],
]
for c, (t, _) in zip(CH, d['sections'][:12]): assert abs(c[1] - t) < 0.01, (c[0], t)
b64 = base64.b64encode(open('/tmp/torus_journey_e.m4a', 'rb').read()).decode()
data = {'dur': d['duration_s'], 'hop': 0.5, 'db': db, 'cen': cen, 'chapters': CH,
        'subs': [[t, name] for t, name in d['sections'][12:]], 'src': 'data:audio/mp4;base64,' + b64}
html = open(os.path.join(here, 'journey_map_template.html')).read().replace('/*DATA*/null', json.dumps(data))
open(os.path.join(here, 'journey-map.html'), 'w').write(html)
print('journey-map.html', round(len(html) / 1e6, 2), 'MB ·', n, 'windows')
