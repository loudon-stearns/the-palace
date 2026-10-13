# Even stiffness, measured by ear's proxy: render struck notes through the
# shipped worklets (v1.4 and v1.5) headless, find each partial in the spectrum,
# and read how sharp partial 8 runs at each pitch for the same slider setting.
# Writes stretch-by-pitch.json and stretch-by-pitch.png.
import json, os, subprocess, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); WG = os.path.dirname(HERE)
RUN = os.path.join(WG, 'offline-v1', 'run_worklet.mjs')
V14 = os.path.join(WG, 'study-v1.4-bow', 'index.html'); V15 = os.path.join(WG, 'study-v1.5-even-stiffness', 'index.html')
SCR = '/tmp/wg-v15'; os.makedirs(SCR, exist_ok=True); SR = 48000
def render(html, ev, secs, tag='m'):
    json.dump({'sampleRate': SR, 'seconds': secs, 'events': ev}, open(f'{SCR}/{tag}.json', 'w'))
    subprocess.run(['node', RUN, html, f'{SCR}/{tag}.json', f'{SCR}/{tag}.f32'], check=True, capture_output=True)
    return np.fromfile(f'{SCR}/{tag}.f32', dtype=np.float32)
def strike(freq, stiff): return [{'t': 0, 'msg': {'type': 'params', 'freq': freq, 'stiff': stiff, 'bright': 0.85}},
                                 {'t': 0.001, 'msg': {'type': 'pluck', 'position': 0.13, 'mode': 'strike'}}]
def partials(x, f0, nmax):
    seg = x[int(0.01*SR):int(0.6*SR)]; N = 1 << 21
    S = np.abs(np.fft.rfft(seg*np.hanning(len(seg)), N)); fr = np.fft.rfftfreq(N, 1/SR); df = fr[1]
    def peak(g, w):
        idx = np.where((fr > g-w) & (fr < g+w))[0]
        if len(idx) < 3: return None
        i = idx[np.argmax(S[idx])]; a, b, c = np.log(S[i-1:i+2]+1e-30)
        return (i + 0.5*(a-c)/(a-2*b+c))*df
    out = [peak(f0, f0*0.2)]
    for n in range(2, nmax+1):
        sp = out[-1] - (out[-2] if len(out) > 1 else 0)   # last spacing predicts the next
        g = out[-1] + sp * (1 + (sp/(out[0]) - 1 if len(out) > 1 else 0))
        p = peak(g, out[0]*0.3)
        if p is None or p > 0.45*SR: break
        out.append(p)
    return np.array(out)
def c8(p): n = min(8, len(p)); return 1200*np.log2(p[n-1]/(n*p[0])), n
PITCHES = [82.41, 110, 146.83, 196, 261.63, 329.63, 440, 587.33, 659.25, 880]
if __name__ == '__main__':
    res = {'pitches': PITCHES, 'rows': []}
    for stiff in [0.0, 0.33, 0.67, 0.83]:
        for name, html in [('v1.4', V14), ('v1.5', V15)]:
            row = {'version': name, 'stiff': stiff, 'p8': [], 'n': [], 'f0_cents': []}
            for f in PITCHES:
                p = partials(render(html, strike(f, stiff), 0.7), f, 10)
                v, n = c8(p); row['p8'].append(round(v, 1)); row['n'].append(int(n))
                row['f0_cents'].append(round(1200*np.log2(p[0]/f), 2))
            res['rows'].append(row); print(name, stiff, row['p8'], 'f0', row['f0_cents'])
    B = lambda s: 0 if s <= 0 else 10**(-5+3*s)
    res['law_p8'] = {str(s): round(1200*np.log2(np.sqrt((1+64*B(s))/(1+B(s)))), 1) for s in [0, 0.33, 0.67, 0.83]}
    json.dump(res, open(os.path.join(HERE, 'stretch-by-pitch.json'), 'w'), indent=1)
