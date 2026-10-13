#!/usr/bin/env python3
"""
reference_renders.py — the Python half of codebox_mirror_all.mjs.

Renders each codebox's Python reference on the real catalog WAVs (the
files a Max buffer~ would load) and writes the results as raw float64
next to a JSON manifest, so the JS mirror can run each codebox's own
text on the same surface and subtract.

    python3 reference_renders.py OUT_DIR

The references are the scripts that made the auditions:
  torus_2d_lookup.codebox   <- Tools/scan_surface.py   scan()
  torus_2d_kuramoto.codebox <- Tools/kuramoto_scan.py  integrate()+lookup(), dc_block()
  torus_2d_bank.codebox     <- Tools/warp_bank.py      scan_bank()
"""
import json
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'Tools'))
import scan_surface as ss      # noqa: E402
import kuramoto_scan as ks     # noqa: E402
import warp_bank as wb         # noqa: E402

SR = 48000
WAV = os.path.join(HERE, '..', 'Wavetables')
SURFACES = {
    'Penrose': '15_penrose_lattice.wav',
    'Knot Shadow': '14_knot_shadow.wav',
    'Membrane': '10_membrane.wav',
}
# the lookup codebox's own five-step protocol, minus the A-B monitor
# (which is this whole script): static row, static column, closed orbit,
# Kronecker shimmer
LOOKUP_CASES = [
    ('static row', 220.0, 0.0),
    ('static column', 0.5, 1000.0),
    ('closed orbit 3:2', 220.0, 1.5),
    ('Kronecker 3:2 + detune', 220.0, 1.500625),
]
DUR = 2.0


def main(out):
    os.makedirs(out, exist_ok=True)
    man = {'sr': SR, 'surfaces': {}, 'cases': []}
    n = int(DUR * SR)

    def put(tag, x):
        p = os.path.join(out, tag + '.f64')
        np.asarray(x, dtype=np.float64).tofile(p)
        return p

    for name, f in SURFACES.items():
        path = os.path.join(WAV, f)
        man['surfaces'][name] = os.path.abspath(path)
        S = ss.load_surface(path)
        for lab, base, ratio in LOOKUP_CASES:
            # scan() samples phase at t = i/sr starting from 0; the codebox
            # advances first and then reads, so it is one sample ahead.
            # Shift the reference by one so both read the same instant.
            ref = ss.scan(S, base, ratio, DUR + 1.0 / SR)[1:n + 1]
            man['cases'].append({'codebox': 'torus_2d_lookup.codebox', 'surface': name, 'label': lab,
                                 'params': {'baseHz': base, 'ratio': ratio, 'gain': 1.0},
                                 'ref': put(f'lookup_{name}_{lab}'.replace(' ', '_').replace(':', ''), ref)})

        # Kuramoto: the codebox's worked example — base 110, ratio
        # 1.518181818, lock 3/2, K* = 0.8 Hz — with K ramped 0 -> 3 Hz so
        # the run crosses the lock.
        K = np.linspace(0.0, 3.0, n)
        p1, p2, psi, un1 = ks.integrate(110.0, 110.0 * 1.518181818, 3, 2, K)
        raw = ks.lookup(S, p1, p2)
        for dc in (0, 1):
            ref = ks.dc_block(raw) if dc else raw
            man['cases'].append({'codebox': 'torus_2d_kuramoto.codebox', 'surface': name,
                                 'label': f'K ramp 0->3 Hz, dcBlock {dc}',
                                 'params': {'baseHz': 110.0, 'ratio': 1.518181818, 'lockA': 3, 'lockB': 2,
                                            'dcBlock': dc, 'gain': 1.0},
                                 'ramp': {'coupling': [0.0, 3.0]},
                                 'ref': put(f'kuramoto_{name}_dc{dc}'.replace(' ', '_'), ref)})

    # the bank: the one baked bank the codebox's comment names
    bpath = os.path.join(HERE, '..', 'Warp Bank', 'penrose_aniso_bank.wav')
    flat = ss.read_surface_wav(bpath)
    bank = flat.reshape(9, 512, 512)
    man['surfaces']['Penrose aniso bank'] = os.path.abspath(bpath)
    pos = np.linspace(0.0, 8.0, n)
    # scan_bank() also reads phase at t = i/sr; same one-sample shift
    t0 = 1.0 / SR
    ref = wb.scan_bank(bank, 110.0, 1.5, pos, t0=t0)
    man['cases'].append({'codebox': 'torus_2d_bank.codebox', 'surface': 'Penrose aniso bank',
                         'label': 'bankPos ramp 0->8', 'params': {'baseHz': 110.0, 'ratio': 1.5, 'gain': 1.0},
                         'ramp': {'bankPos': [0.0, 8.0]},
                         'ref': put('bank_penrose_aniso', ref)})

    with open(os.path.join(out, 'manifest.json'), 'w') as fh:
        json.dump(man, fh, indent=1)
    print(f"wrote {len(man['cases'])} reference renders to {out}")


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '/tmp/torus_mirror_refs')
