"""Build the lesson's first twenty minutes: one self-contained page, six stations.

Reads the measured trajectories in ../trajectory-library and writes
first-twenty-minutes.html beside this script, with the data inlined so the page
opens from the folder with no server. Also prints the Sethares numbers the page
computes live, so the post can quote them as measurements.

    python3 build_lesson.py
"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.join(HERE, '..', 'trajectory-library')
NP = 24  # partials the lesson plays: enough for a bell, light enough for any laptop


def load(name):
    with open(os.path.join(LIB, name + '.wtb.json')) as f:
        return json.load(f)


def piano(name, label):
    d = load(name)
    alive = d['alive_mask'][0]
    meas = [round(c, 1) if alive[i] else None for i, c in enumerate(d['frames'][0][:NP])]
    return {'label': label, 'B': d['B_fit'], 'fit': [round(c, 1) for c in d['fit_curve_cents'][:NP]],
            'measured': meas}


def modal(name, label):
    d = load(name)
    ratios = d['mode_ratios'][:NP]
    amps = d['wta_measured'][0][:len(ratios)]
    return {'label': label, 'ratios': ratios, 'amps': [round(a, 4) for a in amps]}


DATA = {
    'np': NP,
    'pianos': [piano('piano-A2', 'Piano A2, a bass-ish string'), piano('piano-C6', 'Piano C6, a short stiff treble string')],
    'bell': modal('bell-brooklyn-C6', 'Small struck bell'),
    'bowl': modal('singing-bowl-D4', 'Singing bowl'),
}


# --- the same Sethares curve the page draws, so the post quotes real numbers ---
def partials_for_B(B, f0=220.0):
    return [(n * f0 * math.sqrt(1 + B * n * n), 1.0 / n) for n in range(1, NP + 1)]


def diss(parts):
    d = 0.0
    for i in range(len(parts)):
        for j in range(i + 1, len(parts)):
            f1, a1 = parts[i]; f2, a2 = parts[j]
            lo, hi = min(f1, f2), max(f1, f2)
            s = 0.24 / (0.0207 * lo + 18.96)
            x = s * (hi - lo)
            d += a1 * a2 * (math.exp(-3.51 * x) - math.exp(-5.75 * x))
    return d


def octave_minimum(B):
    base = partials_for_B(B)
    best = None
    for c in range(1100, 1501):
        r = 2 ** (c / 1200)
        v = diss(base + [(f * r, a) for f, a in base])
        if best is None or v < best[1]:
            best = (c, v)
    return best[0]


if __name__ == '__main__':
    tpl = open(os.path.join(HERE, 'first-twenty-minutes.template.html')).read()
    out = tpl.replace('/*DATA*/null', json.dumps(DATA, separators=(',', ':')))
    open(os.path.join(HERE, 'first-twenty-minutes.html'), 'w').write(out)
    print('wrote first-twenty-minutes.html', len(out), 'bytes')
    for B in (0.0, 0.0005, 0.001, 0.002, DATA['pianos'][1]['B']):
        print(f'B={B:.5f}  octave consonance minimum at {octave_minimum(B)} cents')
