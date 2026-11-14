# sketch-render -- a rough bounce of a kit recipe's pattern, so the groove can be heard before Live opens the Set.
# Not Live's sound: no envelope, no Simpler/Sampler voicing; layer by velocity, Vol<Vel 0.35, the pad's dB, the rack track's -4 dB, choke groups.
#   python3 sketch-render.py kit-layered.json out.wav
import json, re, sys, numpy as np, soundfile as sf, os
kit = json.load(open(sys.argv[1])); here = os.path.dirname(os.path.abspath(sys.argv[1]))
DRUM_DB = [(r'kick',0),(r'808|sub',-2),(r'snare',-2),(r'clap',-4),(r'rim|snap|stick',-6),(r'tom',-4),(r'closed|chh|hat',-8),(r'open|ohh',-8),(r'ride',-10),(r'crash|cymbal',-10),(r'shaker|perc|conga|bongo',-6),(r'fx|riser|impact',-8)]
VEL = {'X':127,'x':100,'o':50}; SR = 44100
def load(f):
    a, sr = sf.read(os.path.join(here, f), always_2d=True)
    if a.shape[1] == 1: a = np.repeat(a, 2, 1)
    if sr != SR: a = np.stack([np.interp(np.arange(0, len(a), sr / SR), np.arange(len(a)), a[:, c]) for c in range(2)], 1)
    return a[:, :2]
step = 60 / kit['tempo'] / 4; bars = kit['pattern']['bars']; n = int((bars * 16 * step + 3) * SR)
out = np.zeros((n, 2)); hits = []
for p in kit['pads']:
    row = kit['pattern']['steps'].get(p['name'], '')
    db = p.get('db', next((d for r, d in DRUM_DB if re.search(r, p['name'].lower())), -4))
    for i, ch in enumerate(row):
        if ch in VEL: hits.append((i, p, VEL[ch], db))
hits.sort(key=lambda h: h[0])
for k, (i, p, v, db) in enumerate(hits):
    layers = p.get('layers') or [{'file': p['file'], 'vel': [1, 127]}]
    L = next(l for l in layers if l['vel'][0] <= v <= l['vel'][1])
    a = load(L['file']) * 10 ** (db / 20) * (1 - 0.35 * (1 - v / 127)) * 10 ** (-4 / 20)
    t = int(i * step * SR); end = min(n, t + len(a))
    if p.get('choke'):   # the next hit in the same choke group cuts this one, with a 5 ms fade
        nxt = next((h[0] for h in hits[k + 1:] if h[1].get('choke') == p['choke'] and h[0] > i), None)
        if nxt is not None: end = min(end, int(nxt * step * SR)); f = min(220, end - t); a = a[:end - t].copy(); a[-f:] *= np.linspace(1, 0, f)[:, None]
    out[t:end] += a[:end - t]
peak = np.abs(out).max(); out = out / peak * 0.89 if peak > 0.89 else out
sf.write(sys.argv[2], out, SR, subtype='PCM_24'); print('wrote', sys.argv[2], round(len(out) / SR, 1), 's, peak', round(20 * np.log10(np.abs(out).max()), 1), 'dBFS')
